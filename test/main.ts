import type { BluejayConfiguration } from "../lib/main.ts";
import { BlogTemplate, MarkdownTemplate, PageTemplate } from "./components/templates.tsx";

const templates = {
	blog: BlogTemplate,
	markdown: MarkdownTemplate,
	page: PageTemplate,
};

const BASE_URL = "https://apache.li";

export default {
	cwd: import.meta.dir,
	dist: "dist",
	assets: {
		assets: "/assets",
		static: "",
	},
	pages: {
		blog: "/blog",
		pages: "",
		system: "",
	},
	components: {},
	serve: {
		port: 4096,
		notFound: "404",
		aliases: {
			"/": "index",
			"/blog/*": "404-blog",
		},
		redirects: {
			"/github": "/redirect",
		},
		headers: {
			"Cache-Control": "no-cache",
		},
	},
	onLoad: (app) => {
		app.data.blogs = app.pages.filter((page) => page.metadata.type === "blog").sort((a, b) => Date.parse(b.metadata.date) - Date.parse(a.metadata.date) || a.url.localeCompare(b.url));

		for (let i = 0, j = app.data.blogs.length; i < j; i++) {
			app.data.blogs[i].data.index = i;
		}

		return {
			"/sitemap.txt": app.pages
				.sort((a, b) => a.url.localeCompare(b.url))
				.map((page) => BASE_URL + page.url)
				.join("\n"),
		};
	},
	render: (ctx) => {
		const type: keyof typeof templates = ctx.page.metadata.type ?? "page";
		return templates[type](ctx);
	},
} satisfies BluejayConfiguration;
