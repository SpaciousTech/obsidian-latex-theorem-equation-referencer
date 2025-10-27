# Cross-Links LaTeX for Obsidian

> [!important]
> This plugin was forked from [LaTeX-like Theorem & Equation Referencer](https://github.com/RyotaUshio/obsidian-latex-theorem-equation-referencer) by [RyotaUshio](https://github.com/RyotaUshio) and renamed to **Cross-Links LaTeX**. I like the idea and concept of the plugin, but it was causing crashing issues on Obsidian app, so I decided to fork it and make it more efficient and plugin independent (If possible).


**Cross-Links LaTeX** is an [Obsidian.md](https://obsidian.md/) plugin that provides a powerful cross-referencing system for theorems, equations, and mathematical content in your vault, bringing $\LaTeX$-like workflow into Obsidian.

## Features

- **Theorem Environments**: Allows you to define and display mathematical theorems and similar content in a structured way, directly within your notes. You can format custom types such as theorems, lemmas, corollaries, and more.
- **Automatic Equation Numbering**: Equations inserted in your notes are automatically numbered. This ensures consistency across your documents, much like LaTeX. You also have the option to manually set these numbers, if needed.
- **Clever Referencing**: You can reference theorems, equations, and other labeled content elsewhere in your notes. The references update automatically with the correct title or number, so you don’t need to maintain them by hand.
- **Search & Link Autocomplete**: The plugin provides advanced autocomplete features for quickly searching and linking to theorems and equations. This includes:
  - A custom autocomplete system that lets you easily find and insert links to mathematical content.
  - Filtering options, so you can narrow results to the whole vault, recent notes, or the current note.
  - A dedicated search modal for greater control and flexibility when looking for or inserting references, including support for powerful queries.
- **Proof Environment (Experimental)**: You can write and present proofs in a visually distinct environment, helping to keep your mathematical logic organized.

> **Note:** To keep this plugin focused and efficient, certain features are planned to move to dedicated companion plugins in the future:
>
> - **Better Math in Callouts & Blockquotes:** This upcoming plugin will focus on rendering equations inside callouts and supporting multi-line equations inside blockquotes.
> - **Rendered Block Link Suggestions:** Another upcoming plugin aims to enhance Obsidian’s built-in link suggestions, including rendering equations within those suggestions.

Theorems and equations can be numbered automatically, staying consistent if you move or edit content, or you can assign numbers manually. The numbering prefix can be set explicitly, or the plugin can infer it from your note’s title.

Thanks to the integration with [MathLinks](https://github.com/zhaoshenzhai/obsidian-mathlinks), links to theorems/equations are displayed with their title or number, similarly to the `cleveref` package in LaTeX. (No need for manually typing aliases!)

You can change how theorem callouts look by applying CSS snippets, letting you tailor the appearance to your taste.

<!-- ## Companion Plugins

There are several related plugins available for further improving your mathematical workflow in Obsidian:

- **No More Flickering Inline Math:** Reduces or eliminates flickering when rendering inline math expressions.
- **Better Math in Callouts & Blockquotes:** Improves the display of mathematics within callouts and blockquote sections.
- **MathJax Preamble Manager:** Lets you define and manage custom MathJax preambles for more advanced mathematical rendering options.
- **Auto-\displaystyle Inline Math:** Automatically makes inline math display in a larger style, similar to how it looks in LaTeX’s display mode. -->

## Installation

You can install this plugin via Obsidian's community plugin browser (see [here](https://help.obsidian.md/Extending+Obsidian/Community+plugins#Install+a+community+plugin) for instructions).

Also, you can test the latest beta release using [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1.  Install BRAT and enable it.
2.  Go to **Options**. In the **Beta Plugin List** section, click on the **Add Beta plugin** button.
3.  Copy and paste `SpaciousTech/obsidian-cross-links-latex` in the pop-up prompt and click on **Add Plugin**.
4.  _(Optional)_ Turn on **Auto-update plugins at startup** at the top of the page.
5.  Go to **Community plugins > Installed plugins**. You will find "Cross-Links LaTeX" in the list. Click on the toggle button to enable it.
Since version 2 is still beta, it's not on the community plugin browser yet.

## Dependencies

### Obsidian plugins

This plugin requires [MathLinks](https://github.com/zhaoshenzhai/obsidian-mathlinks) version 0.5.3 or higher installed to work properly ([Clever referencing](https://ryotaushio.github.io/obsidian-latex-theorem-equation-referencer/clever-referencing.html)).

In version 2, [Dataview](https://github.com/blacksmithgu/obsidian-dataview) is no longer required. But I strongly recommend installing it because it enhances this plugin's [search](https://ryotaushio.github.io/obsidian-latex-theorem-equation-referencer/search-&-link-auto-completion/search-modal.html) functionality significantly.


<!-- ## Roadmap -->

