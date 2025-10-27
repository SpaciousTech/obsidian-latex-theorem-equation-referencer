import CrossLinksPlugin from '../main';

/**
 * Track hover link events to display theorem/equation numbers in page previews.
 * This implementation uses native Obsidian events instead of monkey-patching.
 */
export const patchPagePreview = (plugin: CrossLinksPlugin) => {
    const { app } = plugin;

    // Listen to hover-link event natively
    plugin.registerEvent(
        (app.workspace as any).on('hover-link', (event: any) => {
            // Store the linktext for use in preview rendering
            if (event && typeof event === 'object' && 'linktext' in event) {
                plugin.lastHoverLinktext = event.linktext;
            }
        })
    );
}