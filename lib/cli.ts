import build from "./build.ts";
import type { BluejayConfiguration } from "./lib.ts";
import serve from "./serve.ts";

async function cli(command: string, entry: string) {
	const module = await import(`${process.cwd()}/${entry}`);
	const config: BluejayConfiguration = module.default;

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

export { cli };
