import type { BluejayConfiguration } from "../lib/lib.ts";
import { BlogTemplate, PageTemplate } from "./components/templates.tsx";

const templates = {
	blog: BlogTemplate,
	page: PageTemplate,
};

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
			"Cache-Control": "",
		},
	},
	onLoad: (app) => {
		app.data.blogs = app.pages
			.filter((page) => page.module.metadata?.type === "blog")
			.sort((a, b) => Date.parse(b.module.metadata!.date) - Date.parse(a.module.metadata!.date));

		for (let i = 0; i < app.data.blogs.length; i++) {
			app.data.blogs[i].data.index = i;
		}
	},
	render: (ctx) => {
		const type: keyof typeof templates = ctx.page.module.metadata?.type ?? "page";
		const template = templates[type];
		return template(ctx);
	},
} satisfies BluejayConfiguration;
