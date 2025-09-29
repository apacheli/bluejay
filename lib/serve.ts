import { renderToStaticMarkup } from "preact-render-to-string";
import type { BluejayConfiguration } from "./main.ts";
import { createApplication } from "./main.ts";

const DEFAULT_PORT = 1337;

async function serve(config: BluejayConfiguration) {
	if (!config.serve) {
		throw new Error("Missing serve options in your configuration.");
	}

	const app = await createApplication(config);

	const map: Record<string, Response> = {};
	const routes: Record<string, Response> = {};

	for (let i = 0, j = app.assets.length; i < j; i++) {
		const asset = app.assets[i];
		const file = Bun.file(asset.file);
		const headers = {
			...config.serve?.headers,
			"Content-Type": file.type,
		};
		routes[encodeURI(asset.url) + asset.ext] = new Response(file, { headers });
	}

	for (let i = 0, j = app.pages.length; i < j; i++) {
		const page = app.pages[i];
		const context = {
			components: config.components,
			app,
			page,
		};
		const rendered = renderToStaticMarkup(config.render(context));
		const response = new Response(`<!DOCTYPE html>${rendered}`, {
			status: page.module.metadata?.status ?? 200,
			headers: {
				...config.serve.headers,
				"Content-Type": "text/html;charset=utf-8",
			},
		});
		routes[encodeURI(page.url)] = response;
		if (page.module.metadata?.id !== undefined) {
			map[page.module.metadata.id] = response;
		}
	}

	for (const alias in config.serve.aliases) {
		routes[alias] = map[config.serve.aliases[alias]];
	}
	for (const redirect in config.serve.redirects) {
		routes[redirect] = Response.redirect(config.serve.redirects[redirect]);
	}

	const notFound = map[config.serve.notFound];
	const server = Bun.serve({
		port: config.serve.port ?? DEFAULT_PORT,
		routes,
		fetch: () => notFound.clone(),
	});

	for (const route in routes) {
		console.log(`    \x1b[30m${server.url.protocol}//${server.hostname}:${server.port}\x1b[34m${route}\x1b[39m`);
	}
}

export default serve;
