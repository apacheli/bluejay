import type { CompileOptions } from "@mdx-js/mdx";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import cache from "./cache.js";
import PluginAlert from "./plugins/alert.js";
import PluginHighlight from "./plugins/highlight.js";
import PluginMetadata from "./plugins/metadata.js";
import PluginSlug from "./plugins/slug.js";

const compileOptions: CompileOptions = {
	jsxImportSource: "preact",
	remarkPlugins: [remarkGemoji, remarkGfm, [remarkFrontmatter, ["yaml", "toml"]], [remarkMdxFrontmatter, { name: "metadata", conflict: "skip", parsers: { yaml: Bun.YAML.parse, toml: Bun.TOML.parse } }], PluginAlert, PluginMetadata, PluginHighlight, PluginSlug],
};

Bun.plugin({
	name: "mdx",
	setup: (build) => {
		build.onLoad({ filter: /\.mdx?$/i }, async ({ path }) => {
			const value = await Bun.file(path).text();
			const hash = `${Bun.hash(value)}`;
			const key = `${Bun.hash(path)}`;
			const cached = Bun.file(`.bluejay/${key}.js`);
			if (hash === cache.data[key]) {
				return {
					loader: "js",
					contents: await cached.text(),
				};
			}
			const c = await compile({ path, value }, compileOptions);
			/* await */ Bun.write(cached, c.value);
			cache.data[key] = hash;
			cache.updatable = true;
			return {
				loader: "js",
				contents: c.value,
			};
		});
	},
});
