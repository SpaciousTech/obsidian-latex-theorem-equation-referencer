import { App, Component, PluginSettingTab, Setting } from "obsidian";

import CrossLinksPlugin, { VAULT_ROOT } from "../main";
import { DEFAULT_EXTRA_SETTINGS, DEFAULT_SETTINGS, MathContextSettings, ExtraSettings } from "./settings";
import { ExtraSettingsHelper, MathContextSettingsHelper } from "./helper";
import { ExcludedFileManageModal, LocalContextSettingsSuggestModal } from "settings/modals";
// import { PROJECT_DESCRIPTION } from "project";


export class MathSettingTab extends PluginSettingTab {
    component: Component;
    private originalSettings: { settings: Record<string, Partial<MathContextSettings>>, extraSettings: ExtraSettings } | null = null;

    constructor(app: App, public plugin: CrossLinksPlugin) {
        super(app, plugin);
        this.component = new Component();
    }

    addRestoreDefaultsButton() {
        new Setting(this.containerEl)
            .addButton((btn) => {
                btn.setButtonText("Restore defaults");
                btn.onClick(async () => {
                    if (!this.plugin.settings[VAULT_ROOT]) {
                        this.plugin.settings[VAULT_ROOT] = {};
                    }
                    Object.assign(this.plugin.settings[VAULT_ROOT], DEFAULT_SETTINGS);
                    Object.assign(this.plugin.extraSettings, DEFAULT_EXTRA_SETTINGS);
                    this.display();
                })
            });
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        this.component.load();
        
        // Store original settings for change detection
        this.originalSettings = {
            settings: JSON.parse(JSON.stringify(this.plugin.settings)),
            extraSettings: JSON.parse(JSON.stringify(this.plugin.extraSettings))
        };

        containerEl.createEl("h4", { text: "Global" });

        const root = this.app.vault.getRoot();
        const globalHelper = new MathContextSettingsHelper(
            this.containerEl,
            this.plugin.settings[VAULT_ROOT] ?? {},
            DEFAULT_SETTINGS,
            this.plugin,
            root
        );
        this.component.addChild(globalHelper);

        const extraHelper = new ExtraSettingsHelper(
            this.containerEl,
            this.plugin.extraSettings,
            this.plugin.extraSettings,
            this.plugin,
            false, 
            false
        );
        this.component.addChild(extraHelper);

        const heading = extraHelper.addHeading('Equations - general');
        const numberingHeading = this.containerEl.querySelector<HTMLElement>('.equation-heading')!;
        this.containerEl.insertBefore(
            heading.settingEl,
            numberingHeading
        );
        this.containerEl.insertAfter(
            extraHelper.settingRefs.enableProof.settingEl,
            this.containerEl.querySelector('.proof-heading')!
        );
        this.containerEl.insertAfter(
            extraHelper.settingRefs.showTheoremCalloutEditButton.settingEl, 
            globalHelper.settingRefs.profile.settingEl
        );
        this.containerEl.insertAfter(
            extraHelper.settingRefs.excludeExampleCallout.settingEl, 
            globalHelper.settingRefs.profile.settingEl
        );
        this.containerEl.insertBefore(
            extraHelper.settingRefs.foldDefault.settingEl, 
            globalHelper.settingRefs.labelPrefix.settingEl
        );
        this.containerEl.insertBefore(
            extraHelper.settingRefs.setOnlyTheoremAsMain.settingEl, 
            globalHelper.settingRefs.labelPrefix.settingEl
        );
        this.containerEl.insertBefore(
            extraHelper.settingRefs.setLabelInModal.settingEl, 
            globalHelper.settingRefs.labelPrefix.settingEl
        );
        this.containerEl.insertAfter(
            extraHelper.settingRefs.noteTitleInTheoremLink.settingEl, 
            globalHelper.settingRefs.refFormat.settingEl
        );
        this.containerEl.insertAfter(
            extraHelper.settingRefs.noteTitleInEquationLink.settingEl, 
            globalHelper.settingRefs.eqRefSuffix.settingEl
        );

        this.containerEl.insertBefore(
            globalHelper.settingRefs.insertSpace.settingEl,
            extraHelper.settingRefs.searchMethod.settingEl,
        );

        // const projectHeading = containerEl.createEl("h3", { text: "Projects (experimental)" });
        // const projectDesc = containerEl.createDiv({
        //     text: PROJECT_DESCRIPTION,
        //     cls: ["setting-item-description", "math-booster-setting-item-description"]
        // });

        // this.containerEl.insertBefore(
        //     projectHeading,
        //     extraHelper.settingRefs.projectInfix.settingEl
        // );
        // this.containerEl.insertAfter(
        //     projectDesc,
        //     projectHeading,
        // );

        this.addRestoreDefaultsButton();

        containerEl.createEl("h4", { text: "Local" });
        new Setting(containerEl).setName("Local settings")
            .setDesc("You can set up local (i.e. file-specific or folder-specific) settings, which have more precedence than the global settings. Local settings can be configured in various ways; here in the plugin settings, right-clicking in the file explorer, the \"Open local settings for the current file\" command, and the \"Open local settings for the current file\" button in the theorem callout settings pop-ups.")
            .addButton((btn) => {
                btn.setButtonText("Search files & folders")
                    .onClick(() => {
                        new LocalContextSettingsSuggestModal(this.app, this.plugin, this).open();
                    });
            });

        new Setting(containerEl)
            .setName("Excluded files")
            .setDesc("You can make your search results more visible by excluding certain files or folders.")
            .addButton((btn) => {
                btn.setButtonText("Manage")
                    .onClick(() => {
                        new ExcludedFileManageModal(this.app, this.plugin).open();
                    });
            });
    }

    async hide() {
        super.hide();
        await this.plugin.saveSettings();
        
        // Check if any settings have changed at all
        if (this.originalSettings && this.hasSettingsChanged()) {
            // Check if settings that require re-indexing have changed
            if (this.hasReindexingSettingsChanged()) {
                this.plugin.indexManager.trigger('global-settings-updated');
            } else {
                // Only trigger UI updates for non-reindexing changes
                this.plugin.updateLinkAutocomplete();
                this.plugin.forceRerender();
            }
        }
        
        this.component.unload();
    }
    
    /**
     * Check if any settings have changed at all
     */
    private hasSettingsChanged(): boolean {
        if (!this.originalSettings) return false;
        
        // Check if any settings have changed
        const settingsChanged = JSON.stringify(this.originalSettings.settings) !== JSON.stringify(this.plugin.settings);
        const extraSettingsChanged = JSON.stringify(this.originalSettings.extraSettings) !== JSON.stringify(this.plugin.extraSettings);
        
        return settingsChanged || extraSettingsChanged;
    }
    
    /**
     * Check if any settings that require full re-indexing have changed
     */
    private hasReindexingSettingsChanged(): boolean {
        if (!this.originalSettings) return false;
        
        // Settings that require re-indexing (affect parsing)
        const reindexingKeys: (keyof ExtraSettings)[] = [
            'excludeExampleCallout',
            'importerNumThreads', 
            'importerUtilization'
        ];
        
        for (const key of reindexingKeys) {
            if (this.originalSettings.extraSettings[key] !== this.plugin.extraSettings[key]) {
                return true;
            }
        }
        
        return false;
    }
}
