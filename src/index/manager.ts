import { App, Component, EventRef, Events, MetadataCache, TAbstractFile, TFile, Vault } from "obsidian";
import { Deferred, deferred } from "./utils/deferred";
import { ImporterSettings } from "../settings/settings";
import { MathImporter } from "./web-worker/importer";
import { MathIndex } from "./math-index";
import { ImportResult } from "./web-worker/message";
import { MarkdownPage } from "./typings/markdown";
import CrossLinksPlugin from "../main";
import { iterDescendantFiles } from "utils/obsidian";
import * as MathLinks from "obsidian-mathlinks";

// Helper function to safely call MathLinks.update
function safeMathLinksUpdate(app: App, file?: TFile) {
    try {
        const mathLinksPlugin = app.plugins.getPlugin('mathlinks');
        if (mathLinksPlugin) {
            if (file) {
                MathLinks.update(app, file);
            } else {
                MathLinks.update(app);
            }
        }
    } catch (error) {
        // MathLinks not available, silently continue
    }
}


export class MathIndexManager extends Component {
    app: App;
    /** Access to the obsidian vault. */
    vault: Vault;
    /** Provides access to per-(markdown)-file metadata. */
    metadataCache: MetadataCache;
    /** Datacore events, mainly used to update downstream views. This object is shadowed by the Datacore object itself. */
    events: Events;

    /** In-memory index over all stored metadata. */
    index: MathIndex;
    /** Asynchronous multi-threaded file importer with throttling. */
    importer: MathImporter;
    // /** Local-storage backed cache of metadata objects. */
    // persister: LocalStorageCache;
    /** Only set when the index is in the midst of initialization; tracks current progress. */
    initializer?: MathIndexInitializer;
    /** If true, the index is fully hydrated and all files have been indexed. */
    initialized: boolean;

    constructor(
        public plugin: CrossLinksPlugin,
        // public version: string, 
        public settings: ImporterSettings
    ) {
        super();

        const { app } = plugin;
        this.app = app;
        this.vault = app.vault;
        this.metadataCache = app.metadataCache;
        // this.persister = new LocalStorageCache("primary", version);
        this.events = new Events();

        this.index = new MathIndex(plugin, app.vault, app.metadataCache);
        this.initialized = false;

        this.addChild(
            (this.importer = new MathImporter(this.plugin, app.vault, app.metadataCache, () => {
                return {
                    workers: settings.importerNumThreads,
                    utilization: Math.max(0.1, Math.min(1.0, settings.importerUtilization)),
                };
            }))
        );
    }

    /** Obtain the current index revision, for determining if anything has changed. */
    get revision() {
        return this.index.revision;
    }

    /** Initialize datacore by scanning persisted caches and all available files, and queueing parses as needed. */
    initialize() {
        // The metadata cache is updated on initial file index and file loads.
        this.registerEvent(this.metadataCache.on("resolve", (file) => this.updateLinked(file)));
        // Renames do not set off the metadata cache; catch these explicitly.
        this.registerEvent(this.vault.on("rename", this.rename, this));

        // File creation does cause a metadata change, but deletes do not. Clear the caches for this.
        this.registerEvent(
            this.vault.on("delete", async (file) => {
                if (file instanceof TFile) {
                    await this.updateLinkedOnDeltion(file);
                }
                if (file.path in this.plugin.settings) {
                    delete this.plugin.settings[file.path];
                }
                this.plugin.excludedFiles.remove(file.path);
            })
        );

        this.registerEvent(
            this.on("local-settings-updated", async (file) => {
                iterDescendantFiles(file, (descendantFile) => {
                    if (descendantFile.extension === "md") {
                        this.index.updateNames(descendantFile);
                        safeMathLinksUpdate(this.app, descendantFile);
                    }
                });
            })
        );

        this.registerEvent(
            this.on("global-settings-updated", () => {
                // Only re-index if already initialized (settings changed after initial load)
                if (!this.initialized) {
                    // If not initialized, let the normal initialization handle it
                    return;
                }
                
                console.log('Cross-Links: Settings changed, re-indexing vault...');
                // re-index the whole vault
                const init = new MathIndexInitializer(this);
                init.finished().then(() => {
                    this.removeChild(init);
                    this.index.touch();
                    this.trigger("update", this.revision);
                });
                this.addChild(init);
            })
        );

        // Asynchronously initialize actual content in the background using a lifecycle-respecting object.
        const init = (this.initializer = new MathIndexInitializer(this));
        init.finished().then((stats: InitializationStats) => {
            this.initialized = true;
            this.initializer = undefined;
            this.removeChild(init);

            const durationSecs = (stats.durationMs / 1000.0).toFixed(3);
            console.log(
                `${this.plugin.manifest.name}: Imported all theorems and equations in the vault in ${durationSecs}s ` +
                `(${stats.imported} notes imported, ${stats.skipped} notes skipped).`
            );

            this.index.touch();
            this.trigger("update", this.revision);
            this.trigger("index-initialized");
            safeMathLinksUpdate(this.app);
        });

        this.addChild(init);
    }

    private async rename(file: TAbstractFile, oldPath: string) {
        if (!(file instanceof TFile)) return;

        const oldSettings = this.plugin.settings[oldPath];
        if (oldSettings) {
            this.plugin.settings[file.path] = structuredClone(oldSettings);
        }
        delete this.plugin.settings[oldPath];
        this.plugin.excludedFiles.remove(oldPath);
        this.plugin.excludedFiles.push(file.path);

        // Delete the file at the old path, then request a reload at the new path.
        // This is less optimal than what can probably be done, but paths are used in a bunch of places
        // (for sections, tasks, etc to refer to their parent file) and it requires some finesse to fix.
        this.index.delete(oldPath);
        await this.reload(file);
        this.index.updateNames(file);
        safeMathLinksUpdate(this.app);
    }

    /** Queue a file for reloading; this is done asynchronously in the background and may take a few seconds. */
    public async reload(file: TFile): Promise<MarkdownPage> {
        try {
            const result = await this.importer.import<ImportResult>(file);

            if (result.type === "error") {
                console.error(`Cross-Links: Failed to import file '${file.name}':`, result.$error);
                throw new Error(`Failed to import file '${file.name}: ${result.$error}`);
            } else if (result.type === "markdown") {
                const parsed = MarkdownPage.from(result.result, (link) => {
                    try {
                        const rpath = this.metadataCache.getFirstLinkpathDest(link.path, result.result.$path!);
                        if (rpath) return link.withPath(rpath.path);
                        else return link;
                    } catch (error) {
                        console.error(`Cross-Links: Error resolving link ${link.path}:`, error);
                        return link;
                    }
                });

                this.index.store(parsed, (object, store) => {
                    store(object.$sections, (section, store) => {
                        store(section.$blocks);
                    });
                });

                this.trigger("update", this.revision);
                this.trigger('index-updated', file);
                return parsed;
            }

            throw new Error("Encountered unrecognized import result type: " + (result as any).type);
        } catch (error) {
            console.error(`Cross-Links: Error reloading file ${file.path}:`, error);
            throw error;
        }
    }

    /** Given an array of TFiles, this function does two things:
     * 1. It reloads (re-imports) each file in the array.
     * 2. It re-computes the theorem/equation numbers for all the files containing blocks 
     *    that each file in the array previously linked to.
     *    EDIT: Wow, I forgot to update the files that each file in the array newly links to.
     * 
     * This should be named like updateOldAndNewLinkDestinations.
     */
    public async updateLinked(file: TFile) {
        // Since only linked/referenced equations are numbered, we need to recompute 
        // the equation numbers for all the files such that
        // 1. contained blocks that this file previously linked to, or
        // 2. is now containing blocks that this file newly links to.
        const toBeUpdated = new Set<TFile>([file]); // Use Set, not Array, to avoid updating the same file multiple times.

        // get the old outgoing block links (each of which can be potentially a link to some equation) 
        // before reloading the given file
        const oldPage = this.index.load(file.path);
        if (MarkdownPage.isMarkdownPage(oldPage)) {
            for (const link of oldPage.$links) {
                if (link.type === "block") {
                    const linkedFile = this.vault.getAbstractFileByPath(link.path);
                    if (linkedFile instanceof TFile) {
                        toBeUpdated.add(linkedFile);
                    }
                }
            }
        }

        // re-import the file changed
        const newPage = await this.reload(file);

        // get the new outgoing block links (each of which can be potentially a link to some equation) 
        for (const link of newPage.$links) {
            if (link.type === "block") {
                const linkedFile = this.vault.getAbstractFileByPath(link.path);
                if (linkedFile instanceof TFile) {
                    toBeUpdated.add(linkedFile);
                }
            }
        }

        // recompute theorem/equation numbers for the previously or currently linked files
        toBeUpdated.forEach((fileToBeUpdated) => {
            this.index.updateNames(fileToBeUpdated);
            safeMathLinksUpdate(this.app, fileToBeUpdated);
        });
        this.trigger("update", this.revision);
    }

    public async updateLinkedOnDeltion(file: TFile) {
        // Since only linked/referenced equations are numbered, we need to recompute 
        // the equation numbers for all the files that contained blocks that this file previously linked to
        const toBeUpdated = new Set<TFile>(); // Use Set, not Array, to avoid updating the same file multiple times.

        // get the old outgoing block links (each of which can be potentially a link to some equation) 
        // before deleting the given file
        const oldPage = this.index.load(file.path);
        if (MarkdownPage.isMarkdownPage(oldPage)) {
            for (const link of oldPage.$links) {
                if (link.type === "block") {
                    const linkedFile = this.vault.getAbstractFileByPath(link.path);
                    if (linkedFile instanceof TFile) {
                        toBeUpdated.add(linkedFile);
                    }
                }
            }
        }

        // execute deletion
        this.index.delete(file.path);

        // recompute theorem/equation numbers for the previously linked files
        toBeUpdated.forEach((fileToBeUpdated) => {
            this.index.updateNames(fileToBeUpdated);
        });
        this.trigger("update", this.revision);
        safeMathLinksUpdate(this.app);
    }

    // Event propogation.

    /** From Datacore: Called whenever the index updates to a new revision. This is the broadest possible datacore event. */
    public on(evt: "update", callback: (revision: number) => any, context?: any): EventRef;

    /** This plugin's custom events */
    // triggered when the index is updated, which means the datacore-level metadata or latex-referencer-level metadata (such as $printName) are updated
    public on(evt: "index-updated", callback: (file: TFile) => any): EventRef;
    public on(evt: "local-settings-updated", callback: (file: TAbstractFile) => any): EventRef;
    public on(evt: "global-settings-updated", callback: () => any): EventRef;
    public on(evt: "index-initialized", callback: () => any): EventRef;

    on(evt: string, callback: (...data: any) => any, context?: any): EventRef {
        return this.events.on(evt, callback, context);
    }

    /** Unsubscribe from an event using the event and original callback. */
    off(evt: string, callback: (...data: any) => any) {
        this.events.off(evt, callback);
    }

    /** Unsubscribe from an event using the event reference.  */
    offref(ref: EventRef) {
        this.events.offref(ref);
    }

    /** From Datacore: Trigger an update event. */
    public trigger(evt: "update", revision: number): void;
    /** This plugin's custom events */
    public trigger(evt: "index-updated", file: TFile): void;
    public trigger(evt: "local-settings-updated", file: TAbstractFile): void;
    public trigger(evt: "global-settings-updated"): void;
    public trigger(evt: "index-initialized"): void;

    /** Trigger an event. */
    trigger(evt: string, ...args: any[]): void {
        this.events.trigger(evt, ...args);
    }
}


/** Lifecycle-respecting file queue which will import files, reading them from the file cache if needed. */
export class MathIndexInitializer extends Component {
    /** Number of concurrent operations the initializer will perform. */
    static BATCH_SIZE = 4; // Reduced from 8 to prevent freezing

    /** Delay between batches in milliseconds to allow UI updates */
    static BATCH_DELAY = 50;

    /** Whether the initializer should continue to run. */
    active: boolean;

    /** Queue of files to still import. */
    queue: TFile[];
    /** The files actively being imported. */
    current: TFile[];
    /** Deferred promise which resolves when importing is done. */
    done: Deferred<InitializationStats>;

    /** The time that init started in milliseconds. */
    start: number;
    /** Total number of files to import. */
    files: number;
    /** Total number of imported files so far. */
    initialized: number;
    /** Total number of imported files. */
    imported: number;
    /** Total number of skipped files. */
    skipped: number;
    /** Last time progress was updated */
    private lastProgressUpdate = 0;

    constructor(public manager: MathIndexManager) {
        super();

        this.active = false;
        // Prioritize currently open files and recently modified files
        const allFiles = this.manager.vault.getMarkdownFiles();
        const openFiles: TFile[] = [];
        const recentFiles: TFile[] = [];
        const otherFiles: TFile[] = [];
        
        const openFilePaths = new Set(
            this.manager.app.workspace.getLeavesOfType('markdown')
                .map(leaf => (leaf.view as any).file?.path)
                .filter(Boolean)
        );
        
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const file of allFiles) {
            if (openFilePaths.has(file.path)) {
                openFiles.push(file);
            } else if (file.stat.mtime > oneWeekAgo) {
                recentFiles.push(file);
            } else {
                otherFiles.push(file);
            }
        }
        
        // Process open files first, then recent, then others
        this.queue = [...openFiles, ...recentFiles, ...otherFiles].reverse();
        this.files = this.queue.length;
        this.start = Date.now();
        this.current = [];
        this.done = deferred();

        this.initialized = this.imported = this.skipped = 0;
    }

    async onload() {
        // Queue BATCH_SIZE elements from the queue to import.
        this.active = true;

        this.runNext();
    }

    /** Promise which resolves when the initialization completes. */
    finished(): Promise<InitializationStats> {
        return this.done;
    }

    /** Cancel initialization. */
    onunload() {
        if (this.active) {
            this.active = false;
            
            // Clear the queue to prevent further processing
            this.queue = [];
            
            // Clear current tasks
            this.current = [];
            
            this.done.reject("Initialization was cancelled before completing.");
        }
    }

    /** Poll for another task to execute from the queue. */
    private async runNext() {
        // Do nothing if max number of concurrent operations already running.
        if (!this.active || this.current.length >= MathIndexInitializer.BATCH_SIZE) {
            return;
        }

        // Show progress every 100ms
        const now = Date.now();
        if (now - this.lastProgressUpdate > 100) {
            this.lastProgressUpdate = now;
            const progress = Math.round((this.initialized / this.files) * 100);
            console.log(`Cross-Links: Indexing progress: ${progress}% (${this.initialized}/${this.files})`);
        }

        // There is space available to execute another.
        const next = this.queue.pop();
        if (next) {
            this.current.push(next);
            this.init(next)
                .then((result) => this.handleResult(next, result))
                .catch((result) => this.handleResult(next, result));

            // Add small delay between tasks to prevent UI freezing
            if (this.queue.length % MathIndexInitializer.BATCH_SIZE === 0) {
                await new Promise(resolve => setTimeout(resolve, MathIndexInitializer.BATCH_DELAY));
            }

            this.runNext();
        } else if (!next && this.current.length == 0) {
            this.active = false;

            console.log('Cross-Links: Index initialization complete, updating names...');
            this.manager.vault.getMarkdownFiles().forEach((file) => this.manager.index.updateNames(file));
            MathLinks.update(this.manager.app);

            // All work is done, resolve.
            this.done.resolve({
                durationMs: Date.now() - this.start,
                files: this.files,
                imported: this.imported,
                skipped: this.skipped,
            });
        }
    }

    /** Process the result of an initialization and queue more runs. */
    private handleResult(file: TFile, result: InitializationResult) {
        this.current.remove(file);
        this.initialized++;

        if (result.status === "skipped") this.skipped++;
        else if (result.status === "imported") this.imported++;

        // Queue more jobs for processing.
        this.runNext();
    }

    /** Initialize a specific file. */
    private async init(file: TFile): Promise<InitializationResult> {
        try {
            const metadata = this.manager.metadataCache.getFileCache(file);
            if (!metadata) return { status: "skipped" };

            // Check file size to avoid processing very large files that could freeze
            if (file.stat.size > 1024 * 1024) { // 1MB limit
                console.warn(`Cross-Links: Skipping large file ${file.path} (${(file.stat.size / 1024).toFixed(0)}KB)`);
                return { status: "skipped" };
            }

            await this.manager.reload(file);
            return { status: "imported" };
        } catch (ex) {
            console.error(`Cross-Links: Failed to import file ${file.path}:`, ex);
            return { status: "skipped" };
        }
    }
}

/** Statistics about a successful vault initialization. */
export interface InitializationStats {
    /** How long initializaton took in miliseconds. */
    durationMs: number;
    /** Total number of files that were imported */
    files: number;
    /** The number of files that were loaded and imported via background workers. */
    imported: number;
    /** The number of files that were skipped due to no longer existing or not being ready. */
    skipped: number;
}

/** The result of initializing a file. */
interface InitializationResult {
    status: "skipped" | "imported";
}
