import type { BluejayConfiguration } from "../lib/main.ts";
import templates from "./components/templates.tsx";
import Feed from "./misc/feed.jsx";

export default {
	cwd: import.meta.dir,
	dist: "dist",
	assets: {
		"assets": "/assets",
		"static": "",
	},
	pages: {
		"news": "/news",
		"pages": "",
	},
	components: {},
	serve: {
		prefix: "/bluejay",
		port: 8192,
		notFound: "404",
		aliases: {
			"": "index",
		},
		redirects: {},
		headers: {
			"Cache-Control": "no-cache",
		},
	},
	onLoad: (app) => {
		app.data.blogs = app.pages.filter((p) => p.metadata.type === "blog").sort((a, b) => Date.parse(b.metadata.date) - Date.parse(a.metadata.date) || a.url.localeCompare(b.url));

		for (let i = 0, j = app.data.blogs.length; i < j; i++) {
			app.data.blogs[i].data.index = i;
		}

		return {
			"/sitemap.txt": app.pages
				.sort((a, b) => a.url.localeCompare(b.url))
				.map((p) => Bun.env.BLUEJAY_URL + p.url)
				.join("\n"),
			"/feed.xml": Feed(app),
		};
	},
	render: (ctx) => {
		const type: keyof typeof templates = ctx.page.metadata.type ?? "page";
		return templates[type](ctx);
	},
} satisfies BluejayConfiguration;
