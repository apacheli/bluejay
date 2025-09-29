import { renderToStaticMarkup } from "preact-render-to-string";
import type { BluejayConfiguration } from "./main.ts";
import { createApplication } from "./main.ts";

async function build(config: BluejayConfiguration) {
	const app = await createApplication(config);

	const dist = `${app.config.cwd ?? process.cwd()}/${config.dist ?? "dist"}`;

	const promises = [];

	for (let i = 0, j = app.assets.length; i < j; i++) {
		const asset = app.assets[i];
		promises.push(Bun.write(dist + asset.url + asset.ext, Bun.file(asset.file)));
		console.log(`    \x1b[30m${dist}\x1b[34m${asset.url}${asset.ext}\x1b[39m`);
	}

	for (let i = 0, j = app.pages.length; i < j; i++) {
		const page = app.pages[i];
		const context = {
			components: config.components,
			app,
			page,
		};
		const rendered = renderToStaticMarkup(config.render(context));
		promises.push(Bun.write(`${dist}${page.url}.html`, `<!DOCTYPE html>${rendered}`));
		console.log(`    \x1b[30m${dist}\x1b[34m${page.url}.html\x1b[39m`);
	}

	return Promise.all(promises);
}

export default build;
