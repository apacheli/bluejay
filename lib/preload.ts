import type { CompileOptions } from "@mdx-js/mdx";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import PluginHighlight from "./plugins/highlight.js";
import PluginSlug from "./plugins/slug.js";

const compileOptions: CompileOptions = {
	jsxImportSource: "preact",
	remarkPlugins: [remarkGemoji, remarkGfm, [remarkFrontmatter, ["yaml", "toml"]], [remarkMdxFrontmatter, { name: "metadata", conflict: "skip", parsers: { yaml: Bun.YAML.parse, toml: Bun.TOML.parse } }], PluginHighlight, PluginSlug],
};

Bun.plugin({
	name: "mdx",
	setup: (build) => {
		build.onLoad({ filter: /\.mdx?$/i }, async ({ path }) => {
			const value = await Bun.file(path).text();
			const file = Bun.file(`.bluejay/${Bun.hash(value)}.js`);
			// TODO: Remove this check when Bun 1.2.23 stops bugging.
			if (await file.exists()) {
				return {
					loader: "js",
					contents: await file.text(),
				};
			}
			const c = await compile({ path, value }, compileOptions);
			Bun.write(file, c.value);
			return {
				loader: "js",
				contents: c.value,
			};
		});
	},
});
