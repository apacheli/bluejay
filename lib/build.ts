import { renderToStaticMarkup } from "preact-render-to-string";
import type { BluejayConfiguration } from "./main.ts";
import { createApplication } from "./main.ts";

const encoder = new TextEncoder();

async function build(config: BluejayConfiguration) {
	const app = await createApplication(config);

	const dist = `${config.root}/${config.dist ?? "dist"}`;

	const promises = [];

	let totalSize = 0;
	let fileCount = 0;

	for (let i = 0, j = app.assets.length; i < j; i++) {
		const asset = app.assets[i];
		const file = Bun.file(asset.file);
		promises.push(Bun.write(dist + asset.url + asset.ext, file));
		console.log(`    \x1b[90m${dist}\x1b[35m${asset.url}${asset.ext}\x1b[39m (\x1b[1m${file.size}\x1b[22m b)`);
		totalSize += file.size;
		fileCount++;
	}

	for (const path in app.gen) {
		const data = encoder.encode(app.gen[path]);
		promises.push(Bun.write(dist + path, data));
		console.log(`    \x1b[90m${dist}\x1b[33m${path}\x1b[39m (\x1b[1m${data.byteLength}\x1b[22m b)`);
		totalSize += data.byteLength;
		fileCount++;
	}

	for (let i = 0, j = app.pages.length; i < j; i++) {
		const page = app.pages[i];
		const context = {
			components: config.components,
			app,
			page,
		};
		const rendered = renderToStaticMarkup(config.render(context));
		const data = encoder.encode(`<!DOCTYPE html>${rendered}`);
		promises.push(Bun.write(`${dist}${page.url}.html`, data));
		console.log(`    \x1b[90m${dist}\x1b[36m${page.url}.html\x1b[39m (\x1b[1m${data.byteLength}\x1b[22m b)`);
		totalSize += data.byteLength;
		fileCount++;
	}

	console.log();
	console.log(`\x1b[32m\u2192 Distribution: \x1b[1;36m${dist}\x1b[22;39m`);
	console.log(`\x1b[32m\u2192 Size (uncompressed): \x1b[1;36m${totalSize / 1024 / 1024} MiB\x1b[22;39m`);
	console.log(`\x1b[32m\u2192 Files: \x1b[1;36m${fileCount}\x1b[22;39m`);
	console.log();

	return Promise.all(promises);
}

export default build;
