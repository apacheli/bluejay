import { compile as mdxCompile } from "@mdx-js/mdx";
import hljsPlugin from "@plugins/hljs";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";

import "preact";
import "preact-render-to-string";

const mdxOptions = {
    remarkPlugins: [remarkGemoji, remarkGfm, hljsPlugin],
    jsxImportSource: "preact",
};

Bun.plugin({
    name: "mdx",
    setup: (build) => {
        build.onLoad({ filter: /\.(?:mdx?|markdown)$/i }, async ({ path }) => {
            const data = await Bun.file(path).text();
            const hash = Bun.hash(data);
            const cache = Bun.file(`.bluejay/mdx/${hash}.js`);
            try {
                return {
                    contents: await cache.text(),
                    loader: "js",
                };
            } catch {
                const compiled = await mdxCompile({ path, value: data }, mdxOptions);
                /* await */ Bun.write(`.bluejay/mdx/${hash}.js`, compiled.value);
                return {
                    contents: compiled.value,
                    loader: "js",
                };
            }
        });
    },
});

Bun.plugin({
    name: "svg",
    setup: (build) => {
        build.onLoad({ filter: /\.svg$/i }, async (args) => {
            const svg = await Bun.file(args.path).text();
            return {
                contents: `export default p=>{const s=${svg};for(const k in p)s.props[k]=p[k];return s}`,
                loader: "js",
            };
        });
    },
});
