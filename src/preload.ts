import { compile as mdxCompile } from "@mdx-js/mdx";
import hljsPlugin from "@plugins/hljs";
import remarkGfm from "remark-gfm";

const mdxOptions = {
    remarkPlugins: [remarkGfm, hljsPlugin],
    jsxImportSource: "preact",
};

Bun.plugin({
    name: "mdx",
    setup: (build) => {
        build.onLoad({ filter: /\.mdx?$/ }, async (args) => {
            const data = await Bun.file(args.path).text();
            const hash = Bun.hash(data);
            const cache = Bun.file(`.bluejay/mdx/${hash}.js`);
            try {
                return {
                    contents: await cache.text(),
                    loader: "js",
                };
            } catch {
                const compiled = await mdxCompile(data, mdxOptions);
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
        build.onLoad({ filter: /\.svg$/ }, async (args) => {
            const svg = await Bun.file(args.path).text();
            return {
                contents: `export default p=>{const s=${svg};for(const k in p)s.props[k]=p[k];return s}`,
                loader: "js",
            };
        });
    },
});
