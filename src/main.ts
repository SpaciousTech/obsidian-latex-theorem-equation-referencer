import { MarkdownView, Plugin, TFile } from 'obsidian';
import { StateField, Extension, RangeSet } from '@codemirror/state';

import * as MathLinks from 'obsidian-mathlinks';

import { MathContextSettings, DEFAULT_SETTINGS, ExtraSettings, DEFAULT_EXTRA_SETTINGS, UNION_TYPE_MATH_CONTEXT_SETTING_KEYS, UNION_TYPE_EXTRA_SETTING_KEYS } from 'settings/settings';
import { MathSettingTab } from "settings/tab";
import { CleverefProvider } from 'cleveref';
import { createTheoremCalloutPostProcessor } from 'theorem-callouts/renderer';
import { createTheoremCalloutNumberingViewPlugin } from 'theorem-callouts/view-plugin';
import { ContextSettingModal, TheoremCalloutModal } from 'settings/modals';
import { createEquationNumberProcessor } from 'equations/reading-view';
import { createEquationNumberPlugin } from 'equations/live-preview';
import { getMarkdownPreviewViewEl, getMarkdownSourceViewEl, isPluginOlderThan } from 'utils/obsidian';
import { getProfile, staticifyEqNumber, insertDisplayMath, insertTheoremCallout, insertProof } from 'utils/plugin';
import { MathIndexManager } from 'index/manager';
import { MigrationModal } from 'notice';
import { LinkAutocomplete } from 'search/editor-suggest';
import { MathSearchModal } from 'search/modal';
import { TheoremCalloutInfo, createTheoremCalloutsField } from 'theorem-callouts/state-field';
import { patchLinkCompletion } from 'patches/link-completion';
import { patchPagePreview } from 'patches/page-preview';
import { createProofDecoration } from 'proof/live-preview';
import { createProofProcessor } from 'proof/reading-view';
import { MathBlock } from 'index/typings/markdown';
import { debounce } from 'utils/debounce';


export const VAULT_ROOT = '/';


export default class CrossLinksPlugin extends Plugin {
	settings!: Record<string, Partial<MathContextSettings>>;
	extraSettings!: ExtraSettings;
	excludedFiles!: string[];
	indexManager!: MathIndexManager;
	editorExtensions!: Extension[];
	theoremCalloutsField!: StateField<RangeSet<TheoremCalloutInfo>>;
	// proofPositionField: StateField<ProofPosition[]>;
	lastHoverLinktext: string | null = null;
	private filesNeedingRerender: Set<string> = new Set();
	private debouncedForceRerender!: ReturnType<typeof debounce>;

	async onload() {

		/** Settings */

		const data = await this.loadData();
		const first = data === null;
		const { version } = data ?? {};

		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new MathSettingTab(this.app, this));

		/** Initialize debounced rerender */
		this.debouncedForceRerender = debounce(() => this.forceRerender(), 100);

		/** Indexing */

		this.addChild((this.indexManager = new MathIndexManager(this, this.extraSettings)));
		// @ts-ignore
		(window['crossLinksIndex'] = this.indexManager.index) && this.register(() => delete window['crossLinksIndex'])


		this.registerEvent(
			this.indexManager.on("local-settings-updated", async (file) => {
				// Add profile's tags as CSS classes
				this.app.workspace.iterateRootLeaves((leaf) => {
					if (leaf.view instanceof MarkdownView) {
						this.setProfileTagAsCSSClass(leaf.view);
					}
				});
			})
		);

		this.registerEvent(
			this.indexManager.on("global-settings-updated", async () => {
				// Add profile's tags as CSS classes
				this.app.workspace.iterateRootLeaves((leaf) => {
					if (leaf.view instanceof MarkdownView) {
						this.setProfileTagAsCSSClass(leaf.view);
					}
				});
			})
		);


		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf?.view instanceof MarkdownView) {
					this.setProfileTagAsCSSClass(leaf.view);
				}
			})
		);


		/** Commands */
		this.registerCommands();


		/** Editor Extensions */
		this.editorExtensions = []
		this.registerEditorExtension(this.editorExtensions);
		this.updateEditorExtensions();


		/** Theorem/equation link autocompletion */
		this.updateLinkAutocomplete();

		/** Markdown post processors */

		// theorem callouts
		this.registerMarkdownPostProcessor(createTheoremCalloutPostProcessor(this));

		// equation numbers
		this.registerMarkdownPostProcessor(createEquationNumberProcessor(this));

		// proof environments
		this.registerMarkdownPostProcessor(createProofProcessor(this));

		// patch hover page preview to display theorem numbers in it
		this.lastHoverLinktext = null;
		
		/** Consolidated onLayoutReady - runs all initialization that needs layout to be ready */
		this.app.workspace.onLayoutReady(async () => {
			// Initialize index manager
			await this.indexManager.initialize();

			// Add MathLinks provider (optional)
			try {
				const mathLinksPlugin = this.app.plugins.getPlugin('mathlinks');
				if (mathLinksPlugin) {
					this.addChild(
						MathLinks.addProvider(this.app, (mathLinks) => new CleverefProvider(mathLinks, this))
					);
				}
			} catch (error) {
				console.warn('Cross-Links: MathLinks plugin not available, clever referencing disabled');
			}

			// Add profile's tags as CSS classes
			this.app.workspace.iterateRootLeaves((leaf) => {
				if (leaf.view instanceof MarkdownView) {
					this.setProfileTagAsCSSClass(leaf.view);
				}
			});

			// Patch link completion
			patchLinkCompletion(this);

			// Patch page preview
			patchPagePreview(this);

			// Force rerender after everything is ready
			this.forceRerender();
		});

		/** File menu */

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addSeparator()
					.addItem((item) => {
						item.setTitle(`${this.manifest.name}: Open local settings`)
							.onClick(() => {
								new ContextSettingModal(this.app, this, file).open();
							});
					})
					.addSeparator();
			})
		);
	}

	async loadSettings() {
		try {
			this.settings = { [VAULT_ROOT]: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) };
			this.extraSettings = JSON.parse(JSON.stringify(DEFAULT_EXTRA_SETTINGS));
			this.excludedFiles = [];

			const loadedData = await this.loadData();
			if (!loadedData) {
				console.log("Cross-Links: No saved settings found, using defaults");
				return;
			}

			// Validate loaded data structure
			if (typeof loadedData !== 'object') {
				console.error("Cross-Links: Invalid settings data format, using defaults");
				return;
			}

			const { settings, extraSettings, excludedFiles } = loadedData;
			
			// Load context settings with validation
			if (settings && typeof settings === 'object') {
				for (const path in settings) {
					if (path != VAULT_ROOT) {
						this.settings[path] = {};
					}
					for (const _key in DEFAULT_SETTINGS) {
						const key = _key as keyof MathContextSettings;
						let val = settings[path]?.[key];
						if (val !== undefined) {
							if (key in UNION_TYPE_MATH_CONTEXT_SETTING_KEYS) {
								const allowableValues = UNION_TYPE_MATH_CONTEXT_SETTING_KEYS[key];
								if (!(allowableValues?.includes(val))) {
									// invalid value encountered, substitute the default value instead
									val = DEFAULT_SETTINGS[key];
									console.warn(`Cross-Links: Invalid value for ${key}, using default`);
								}
							}
							if (typeof val == typeof DEFAULT_SETTINGS[key]) {
								// @ts-ignore
								this.settings[path][key] = val;
							}
						}
					}
				}
			}

			// Load extra settings with validation
			if (extraSettings && typeof extraSettings === 'object') {
				for (const _key in DEFAULT_EXTRA_SETTINGS) {
					const key = _key as keyof ExtraSettings;
					let val = extraSettings[key];
					if (val !== undefined) {
						if (key in UNION_TYPE_EXTRA_SETTING_KEYS) {
							const allowableValues = UNION_TYPE_EXTRA_SETTING_KEYS[key];
							if (!(allowableValues?.includes(val))) {
								val = DEFAULT_EXTRA_SETTINGS[key];
								console.warn(`Cross-Links: Invalid value for ${key}, using default`);
							}
						}
						if (typeof val == typeof DEFAULT_EXTRA_SETTINGS[key]) {
							(this.extraSettings[key] as ExtraSettings[keyof ExtraSettings]) = val;
						}
					}
				}
			}

			// Load excluded files
			if (Array.isArray(excludedFiles)) {
				this.excludedFiles = excludedFiles;
			}
		} catch (error) {
			console.error("Cross-Links: Error loading settings, using defaults:", error);
			// Settings already initialized with defaults above
		}
	}

	async saveSettings() {
		try {
			await this.saveData({
				version: this.manifest.version,
				settings: this.settings,
				extraSettings: this.extraSettings,
				excludedFiles: this.excludedFiles,
			});
		} catch (error) {
			console.error("Cross-Links: Error saving settings:", error);
		}
	}

	updateLinkAutocomplete() {
		// reset editor suggest(s) registered by this plugin
		const suggestManager = (this.app.workspace as any).editorSuggest;
		for (const suggest of suggestManager.suggests) {
			if (suggest instanceof LinkAutocomplete) suggestManager.removeSuggest(suggest);
		}

		this.registerEditorSuggest(new LinkAutocomplete(this));
	}

	setProfileTagAsCSSClass(view: MarkdownView) {
		if (!view.file) return;
		const profile = getProfile(this, view.file);
		if (!profile) return;
		const classes = [
			...profile.meta.tags.map((tag) => `math-booster-${tag}`), // legacy support
			...profile.meta.tags.map((tag) => `latex-referencer-${tag}`), // legacy support
			...profile.meta.tags.map((tag) => `cross-links-${tag}`),
		];
		for (const el of [getMarkdownSourceViewEl(view), getMarkdownPreviewViewEl(view)]) {
			if (el) {
				el.classList.forEach((cls) => {
					if (cls.startsWith("math-booster-") || cls.startsWith("latex-referencer-") || cls.startsWith("cross-links-")) {
						el.classList.remove(cls);
					}
				});
				el?.addClass(...classes);
			}
		}
	}

	updateEditorExtensions() {
		this.editorExtensions.length = 0;

		// theorem callouts
		this.editorExtensions.push(this.theoremCalloutsField = createTheoremCalloutsField(this));
		this.editorExtensions.push(createTheoremCalloutNumberingViewPlugin(this));

		// equation numbers
		this.editorExtensions.push(createEquationNumberPlugin(this));

		// proofs
		if (this.extraSettings.enableProof) {
			this.editorExtensions.push(createProofDecoration(this));
			// this.editorExtensions.push(this.proofPositionField = proofPositionFieldFactory(this));
			// this.editorExtensions.push(proofDecorationFactory(this));
			// this.editorExtensions.push(proofFoldFactory(this));
		}

		this.app.workspace.updateOptions();
	}

	registerCommands() {
		this.addCommand({
			id: 'insert-display-math',
			name: 'Insert display math',
			editorCallback: insertDisplayMath,
		});

		this.addCommand({
			id: 'insert-theorem-callout',
			name: 'Insert theorem callout',
			editorCheckCallback: (checking, editor, context) => {
				if (!context.file) return false;

				if (!checking) {
					new TheoremCalloutModal(
						this.app, this, context.file,
						(config) => {
							insertTheoremCallout(editor, config);
						},
						"Insert", "Insert theorem callout",
					).open();
				}

				return true;
			}
		});

		this.addCommand({
			id: 'search',
			name: 'Search',
			callback: () => {
				new MathSearchModal(this).open();
			}
		})

		this.addCommand({
			id: 'open-local-settings-for-current-note',
			name: 'Open local settings for the current note',
			callback: () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					new ContextSettingModal(this.app, this, view.file).open();
				}
			}
		});

		this.addCommand({
			id: 'insert-proof',
			name: 'Insert proof',
			editorCallback: (editor, context) => insertProof(this, editor, context)
		});

		this.addCommand({
			id: 'convert-equation-number-to-tag',
			name: 'Convert equation numbers in the current note to static \\tag{}',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file) staticifyEqNumber(this, file);
			}
		});

		this.addCommand({
			id: 'migrate-from-v1',
			name: 'Migrate from version 1',
			callback: () => {
				new MigrationModal(this).open();
			}
		});
	}

	/**
	 * Optimized force rerender that only re-renders leaves with math content
	 * or specific files that need updating
	 */
	forceRerender(specificFiles?: Set<string>) {
		try {
			// If we have specific files needing rerender, use those
			const filesToRerender = specificFiles || this.filesNeedingRerender;
			
			// If no specific files and no files marked for rerender, skip
			if (filesToRerender.size === 0) {
				return;
			}

			for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
				const view = leaf.view as MarkdownView;
				
				// Skip if no file
				if (!view.file) continue;

				// Only rerender files that are marked for rerender or specifically requested
				if (!filesToRerender.has(view.file.path)) {
					continue;
				}

				// Rerender the preview mode
				const state = view.getEphemeralState();
				view.previewMode.rerender(true);
				view.setEphemeralState(state);
			}

			// Clear the files needing rerender set
			this.filesNeedingRerender.clear();
		} catch (error) {
			console.error("Cross-Links: Error in forceRerender:", error);
		}
	}

	/**
	 * Mark a file as needing rerender and trigger debounced rerender
	 */
	markForRerender(file: TFile) {
		this.filesNeedingRerender.add(file.path);
		this.debouncedForceRerender();
	}

	onunload() {
		// Clean up debounced function to prevent memory leaks
		if (this.debouncedForceRerender) {
			this.debouncedForceRerender.cancel();
		}
		super.onunload();
	}
}
