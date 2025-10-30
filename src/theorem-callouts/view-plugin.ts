import { PluginValue, EditorView, ViewUpdate, ViewPlugin } from '@codemirror/view';

import CrossLinksPlugin from 'main';
import { MathIndex } from 'index/math-index';


export const createTheoremCalloutNumberingViewPlugin = (plugin: CrossLinksPlugin) => ViewPlugin.fromClass(
    class implements PluginValue {
        index: MathIndex = plugin.indexManager.index;
        private updateTimer: number | null = null;

        constructor(public view: EditorView) {
            // Wait until the initial rendering is done so that we can find the callout elements using qeurySelectorAll(). 
            this.updateTimer = window.setTimeout(() => this._update(view));
        }

        update(update: ViewUpdate) {
            this._update(update.view);
        }

        _update(view: EditorView) {
            const infos = view.state.field(plugin.theoremCalloutsField);

            for (const calloutEl of view.contentDOM.querySelectorAll<HTMLElement>('.callout.theorem-callout')) {
                const pos = view.posAtDOM(calloutEl);
                const iter = infos.iter(pos);
                if (iter.from !== pos) continue; // insertion or deletion occured before this callout, and the posAtDom is out-dated for some reasons: do not update the theorem number
                
                const index = iter.value?.index;
                if (typeof index === 'number') calloutEl.setAttribute('data-theorem-index', String(index));
                else calloutEl.removeAttribute('data-theorem-index');
            }
        }

        destroy() {
            // Clean up timer to prevent memory leaks
            if (this.updateTimer !== null) {
                window.clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        }
    }
);
