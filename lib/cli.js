#!/usr/bin/env bun

import build from "./build.ts";
import serve from "./serve.ts";

const getConfig = async (entry) => {
	const module = await import(`${process.cwd()}/${entry}`);
	return module.default;
};

async function cli(command, entry) {
	const config = await getConfig(entry);

	switch (command) {
		case "serve": {
			return serve(config);
		}

		case "build": {
			return build(config);
		}

		default: {
			throw new TypeError(`Unknown command "${command}"`);
		}
	}
}

if (import.meta.main) {
	console.time("bluejay");
	await cli(Bun.argv[2]?.toLowerCase(), Bun.argv[3]);
	console.timeEnd("bluejay");
}
