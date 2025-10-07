import { renderToStaticMarkup } from "preact-render-to-string";
import type { BluejayConfiguration } from "./lib.ts";
import { createApplication } from "./lib.ts";

async function serve(config: BluejayConfiguration) {
	if (!config.serve) {
		throw new Error("Missing serve options in your configuration.");
	}

	const app = await createApplication(config);

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

	for (const path in app.gen) {
		const headers = {
			...config.serve?.headers,
			"Content-Type": Bun.file(path).type,
		};
		routes[path] = new Response(app.gen[path], { headers });
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
			status: page.metadata?.status ?? 200,
			headers: {
				...config.serve.headers,
				"Content-Type": "text/html;charset=utf-8",
			},
		});
		routes[encodeURI(page.url)] = page._response = response;
	}

	for (const alias in config.serve.aliases) {
		routes[alias] = app.ids[config.serve.aliases[alias]]._response as Response;
	}
	for (const redirect in config.serve.redirects) {
		routes[redirect] = Response.redirect(config.serve.redirects[redirect]);
	}

	const notFound = app.ids[config.serve.notFound]?._response;
	const server = Bun.serve({
		port: config.serve.port,
		routes,
		fetch: () => notFound?.clone() ?? new Response("404 Not Found", { status: 404 }),
	});

	for (const route in routes) {
		const r = routes[route];
		const color = r.status >= 400 ? 31 : r.status >= 300 ? 32 : 36;
		console.log(`    \x1b[90mhttp://localhost:${server.port}\x1b[${color}m${route}\x1b[39m`);
	}
	console.log(`\x1b[32m\n\u2192 Local: \x1b[1;36mhttp://localhost:${server.port}/\x1b[22;39\n`);
}

export default serve;
