<div align="center">
	<h1>Obsidian Table Sorting Plugin</h1>
	<span>This essential plugin will finally allow you to organize your tables non-destructively right within Obsidian. Sorting by multiple columns is supported!</span> 
	<br/>
	<br/>
	<div style="display: flex; flex-direction: row; margin-top: 1rem !important;">
		<img src="https://github.com/kraibse/obsidian-table-sorting/assets/33869366/ba459ed2-cd5f-48a4-8494-42fa7a5d9091" />
		<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
	</div>
	<h2>✨ Features</h2>
	<span>Whatever sort mode you choose, the markdown sourcecode will not be touched. Instead the sorting all happens visually. Rightly restore the original order by cycling through the modes.</span>
</div>


<div align="center">
<h2>Sort by a single column</h2>

https://github.com/kraibse/obsidian-table-sorting/assets/33869366/f2d53d9e-267d-483e-9ab5-9edb7687b3c1
 
<p><strong>Right click</strong> to open the context and tool menu.</p>
</div>

<div align="center">
<h2>... or by multiple columns simultaneously</h2>
 
https://github.com/kraibse/obsidian-table-sorting/assets/33869366/28468e05-9ea3-46a5-9ce1-82927031b499
	
<p><strong>Select multiple columns</strong> to set their order when sorting hierarchically.</p>
</div>


<div align="center">
<h2>... and be able to reset them to their original state</h2>

https://github.com/kraibse/obsidian-table-sorting/assets/33869366/e46b9a2e-8a22-4906-af33-4048b63a9e92

<p>It's as easy as picking the <strong>reset option</strong> in the dropdown.</p>
</div>

<br>

# 💡 Usage
1.  From the [latest releases](https://github.com/kraibse/obsidian-table-sorting/releases) download the necessary files  `main.ts`, `styles.css` and `manifest.json`
2.  Create a folder in to your vault `VaultFolder/.obsidian/plugins/obsidian-table-sorting/`.
	- (optional) Also refer to the [Obsidian plugin installation instructions](https://help.obsidian.md/Extending+Obsidian/Community+plugins).
3.  Move the `main.ts`, `styles.css` and `manifest.json` to the directory you just created.
4.  Create a table in your Obsidian note.
5.  Right-click a column to open the context menu.
    - Sorting columns A-Z/Z-A 
    - De/Selecting files for multi column sorting
    - Resetting to the original order 


# Limitations

- Numeric data must be properly formatted for accurate sorting (WIP)
- Dataview tables are currently not supported (WIP)
- Currently limited to the Live Preview edit mode
   - Preview mode is currently in development
   - Source edit mode is currently not planned

# Contributing

If you encounter any issues or have suggestions for future improvements, please don't hesitate to open an issue on the Github repository. Contributions are also welcome!

# License

This project is licensed under the [MIT License](LICENSE).
