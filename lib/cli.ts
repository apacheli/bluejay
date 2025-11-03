import build from "./build.ts";
import type { BluejayConfiguration } from "./lib.ts";
import serve from "./serve.ts";

const getConfig = async (entry: string) => {
	const module = await import(`${process.cwd()}/${entry}`);
	return module.default as BluejayConfiguration;
};

async function cli(command: string, entry: string) {
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

export { cli };
