import { renderToStaticMarkup } from "preact-render-to-string";
import type { BluejayConfiguration } from "./main.ts";
import { createApplication } from "./main.ts";

async function build(config: BluejayConfiguration) {
	const app = await createApplication(config);

	const dist = `${config.cwd ?? process.cwd()}/${config.dist ?? "dist"}`;

	const promises = [];

	for (let i = 0, j = app.assets.length; i < j; i++) {
		const asset = app.assets[i];
		promises.push(Bun.write(dist + asset.url + asset.ext, Bun.file(asset.file)));
		console.log(`    \x1b[90m${dist}\x1b[35m${asset.url}${asset.ext}\x1b[39m`);
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
		console.log(`    \x1b[90m${dist}\x1b[36m${page.url}.html\x1b[39m`);
	}

	console.log(`\x1b[32m\n\u2192 Distribution: \x1b[1;36m${dist}\x1b[22;39\n`);

	return Promise.all(promises);
}

export default build;
