import { Modal, Setting, Component, MarkdownRenderer, Notice } from "obsidian";

import CrossLinksPlugin from "main";
import { isPluginOlderThan } from "utils/obsidian";
import { rewriteTheoremCalloutFromV1ToV2 } from "utils/plugin";


export class MigrationModal extends Modal {
    component: Component;
    private timers: number[] = [];

    constructor(public plugin: CrossLinksPlugin) {
        super(plugin.app);
        this.component = new Component();
        this.plugin.addChild(this.component);
    }

    async onOpen() {
        let { contentEl, modalEl, titleEl } = this;
        contentEl.empty();

        modalEl.querySelector('.modal-close-button')?.remove();
        titleEl.setText("Convert theorem callouts' format from v1 to v2")

        const descEl = contentEl.createDiv();
        await MarkdownRenderer.render(
            this.app,
            `
In order to enjoy LaTeX-like Theorem & Equation Referencer, you need to convert the old theorem format from Math Booster version 1:

\`\`\`md
> [!math|{"type":"theorem","number":"auto","title":"Main result","label":"main-result","_index":0}] Theorem 1 (Main result).
\`\`\`

to the new format:

\`\`\`md
> [!theorem] Main result
> %% label: main-result %%
\`\`\`

> [!WARNING] 
> **MAKE SURE YOU HAVE A BACKUP OF YOUR VAULT BEFORE CONTINUING. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY ARISING FROM THIS OPERATION.**
`,
            descEl, '', this.component);
        descEl.querySelectorAll('.copy-code-button').forEach(el => el.remove());

        await new Promise<void>((resolve) => {
            new Setting(contentEl)
                .setName('Are you sure to proceed?')
                .addButton((button) => {
                    button.setButtonText('Yes').setWarning().onClick(() => resolve())
                })
                .addButton((button) => {
                    button.setButtonText('No').onClick(() => this.close())
                });
        });

        // @ts-ignore
        if (!this.app.metadataCache.initialized || !this.plugin.indexManager.initialized) {
            new Notice('Obsidian is still indexing the vault. Try again after the cache is fully initialized.');
            return;
        }

        contentEl.empty();

        const waitForCacheRefresh = new Setting(contentEl)
            .setName('Preparing the fresh cache...');
        await new Promise<void>((resolve) => {
            waitForCacheRefresh.addProgressBar((bar) => {
                let progress = 0;
                const timer = window.setInterval(() => {
                    bar.setValue(progress++)
                    if (progress >= 100) {
                        window.clearInterval(timer);
                        resolve();
                    }
                }, 3 * 10);
                this.timers.push(timer);
            })
        });
        waitForCacheRefresh.setName('Preparing the fresh cache... Done!');

        const converting = new Setting(contentEl)
            .setName('Converting...')
        // .then(setting => setting.controlEl.style.width = '50px');
        await new Promise<void>((resolve) => {
            converting.addProgressBar(async (bar) => {
                const files = this.app.vault.getMarkdownFiles();
                let done = 0;
                const all = files.length;
                for (const file of files) {
                    await rewriteTheoremCalloutFromV1ToV2(this.plugin, file);
                    bar.setValue(done++ / all * 100);
                }
                bar.setValue(100);
                resolve();
            })
        });
        converting.setName('Converting... Done!');

        new Setting(contentEl)
            .addButton((button) => {
                button.setButtonText('Close')
                    .setCta()
                    .onClick(() => this.close())
            })
    }

    onClose() {
        this.contentEl.empty();
        this.component.unload();
        
        // Clean up any remaining timers to prevent memory leaks
        for (const timer of this.timers) {
            window.clearInterval(timer);
        }
        this.timers = [];
    }

}