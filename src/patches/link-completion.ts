import { TFile } from "obsidian";

import CrossLinksPlugin from "main";
import { MarkdownPage, TheoremCalloutBlock } from 'index/typings/markdown';
import { isTheoremCallout, resolveSettings } from 'utils/plugin';
import { formatTitle } from 'utils/format';
import { _readTheoremCalloutSettings } from 'utils/parse';
import { capitalize } from 'utils/general';
import { renderTextWithMath } from "utils/render";
import { clearMathJaxTypeset } from "equations/common";

/**
 * Enhanced link completion for theorem callouts using DOM observation instead of monkey-patching.
 * This implementation uses MutationObserver to detect when suggestions are rendered
 * and enhances them with formatted theorem titles.
 */
export const patchLinkCompletion = (plugin: CrossLinksPlugin) => {
    let observer: MutationObserver | null = null;

    const enhanceSuggestionItem = (suggestionEl: HTMLElement) => {
        // Skip if already processed
        if (suggestionEl.hasClass('cross-links-processed')) return;
        suggestionEl.addClass('cross-links-processed');

        try {
            // Try to extract file path and line information from data attributes
            const filePathAttr = suggestionEl.getAttribute('data-file-path');
            const lineAttr = suggestionEl.getAttribute('data-line');
            
            // If we can't get the info from attributes, check if this is a callout block
            const isCallout = suggestionEl.querySelector('[data-callout]');
            if (!isCallout || !plugin.extraSettings.showTheoremTitleinBuiltin) return;

            const calloutType = isCallout.getAttribute('data-callout');
            if (!calloutType || !isTheoremCallout(plugin, calloutType)) return;

            // Find the file and line from the suggestion content
            const suggestionContent = suggestionEl.querySelector('.suggestion-content');
            if (!suggestionContent) return;

            // Extract file path from the suggestion if available
            const filePath = suggestionEl.getAttribute('aria-label') || '';
            const file = plugin.app.vault.getAbstractFileByPath(filePath);
            if (!(file instanceof TFile)) return;

            const page = plugin.indexManager.index.load(file.path);
            if (!MarkdownPage.isMarkdownPage(page)) return;

            // Try to find the block
            const lineNum = lineAttr ? parseInt(lineAttr) : null;
            if (lineNum === null) return;

            const block = page.getBlockByLineNumber(lineNum);
            if (!TheoremCalloutBlock.isTheoremCalloutBlock(block)) return;

            // Enhance the suggestion title
            const suggestionTitleEl = suggestionEl.querySelector<HTMLElement>('.suggestion-title');
            if (!suggestionTitleEl) return;

            // Clear MathJax tracking before replacing
            clearMathJaxTypeset(suggestionTitleEl);
            suggestionTitleEl.replaceChildren();
            const children = renderTextWithMath(block.$printName);
            const titleContainer = suggestionTitleEl.createDiv();
            titleContainer.replaceChildren(...children);

            if (plugin.extraSettings.showTheoremContentinBuiltin) {
                const contentPreview = suggestionTitleEl.createDiv({ cls: 'suggestion-content-preview' });
                // Add a small content preview if available
            }

            suggestionEl.addClass('cross-links-theorem-suggestion');
        } catch (error) {
            console.error('Cross-Links: Error enhancing suggestion:', error);
        }
    };

    const setupObserver = () => {
        // Observe the body for suggestion popups
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
                            // Check if this is a suggestion container
                            if (node.matches('.suggestion-container, .suggestion-item')) {
                                enhanceSuggestionItem(node);
                            }
                            // Also check children
                            node.querySelectorAll('.suggestion-item').forEach((item) => {
                                if (item instanceof HTMLElement) {
                                    enhanceSuggestionItem(item);
                                }
                            });
                        }
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    // Set up the observer
    setupObserver();

    // Clean up on unload
    plugin.register(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    });
};


function renderInSuggestionTitleEl(el: HTMLElement, cb: (suggestionTitleEl: HTMLElement) => void) {
    // setTimeout(() => {
    const suggestionTitleEl = el.querySelector<HTMLElement>('.suggestion-title');
    if (suggestionTitleEl) cb(suggestionTitleEl);
    // });
}