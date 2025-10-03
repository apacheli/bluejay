import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import type { JSX } from "preact/jsx-runtime";

const readdirOptions = {
	recursive: true,
	withFileTypes: true,
} as const;

async function readSources(path: string, prefix: string) {
	const files = await readdir(path, readdirOptions);
	const results: BluejaySource[] = [];
	for (let i = 0, j = files.length; i < j; i++) {
		const entry = files[i];
		if (entry.isFile()) {
			results.push(createSource(entry, path, prefix));
		}
	}
	return results;
}

function createSource(entry: Dirent<string>, path: string, prefix: string): BluejaySource {
	let dir = entry.parentPath.substring(path.length);
	if (process.platform === "win32") {
		dir = dir.replace(/\\/g, "/");
	}
	const ei = entry.name.lastIndexOf(".");
	return {
		ext: ei > 0 ? entry.name.slice(ei) : "",
		file: `${entry.parentPath}/${entry.name}`,
		url: `${prefix}${dir}/${ei > 0 ? entry.name.slice(0, ei) : entry.name}`,
	};
}

async function readAssets(app: BluejayApplication, path: string, prefix: string) {
	const sources = await readSources(path, prefix);
	for (let i = 0, j = sources.length; i < j; i++) {
		app.assets.push(sources[i]);
	}
}

async function readPages(app: BluejayApplication, path: string, prefix: string) {
	const sources = await readSources(path, prefix);
	return Promise.all(sources.map((source) => readPage(app, source as BluejayPage)));
}

async function readPage(app: BluejayApplication, source: BluejayPage) {
	const module = await import(source.file);
	source.data = {};
	source.element = module.default;
	source.metadata = module.metadata ?? {};
	if (source.metadata.id !== undefined) {
		app.ids[source.metadata.id] = source;
	}
	app.pages.push(source);
}

async function readFromConfiguration(app: BluejayApplication) {
	const cwd = app.config.cwd ?? process.cwd();
	const promises = [];
	for (const dir in app.config.assets) {
		promises.push(readAssets(app, `${cwd}/${dir}`, app.config.assets[dir]));
	}
	for (const dir in app.config.pages) {
		promises.push(readPages(app, `${cwd}/${dir}`, app.config.pages[dir]));
	}
	return Promise.all(promises);
}

async function createApplication(config: BluejayConfiguration) {
	const app: BluejayApplication = {
		ids: {},
		assets: [],
		pages: [],
		data: {},
		config,
	};
	await readFromConfiguration(app);
	await config.onLoad?.(app);
	return app;
}

interface BluejayApplication {
	ids: Record<string, BluejayPage>;
	assets: BluejaySource[];
	pages: BluejayPage[];
	config: BluejayConfiguration;
	/**
	 * Empty object for attaching arbitrary data to.
	 */
	data: Record<string, any>;
}

interface BluejayConfiguration {
	cwd?: string;
	dist?: string;
	assets: Record<string, string>;
	pages: Record<string, string>;
	components?: Record<string, (...args: unknown[]) => JSX.Element>;
	serve?: BluejayConfigurationServe;
	onLoad?: (app: BluejayApplication) => unknown;
	render: (context: BluejayContext) => JSX.Element;
}

interface BluejayConfigurationServe {
	notFound: string;
	port?: number;
	aliases?: Record<string, string>;
	redirects?: Record<string, string>;
	headers?: Record<string, string>;
}

interface BluejayContext {
	components?: Record<string, (...args: unknown[]) => JSX.Element>;
	app: BluejayApplication;
	page: BluejayPage;
}

interface BluejaySource {
	ext: string;
	file: string;
	url: string;
}

interface BluejayPage extends BluejaySource {
	/**
	 * Empty object for attaching arbitrary data to.
	 */
	data: Record<string, any>;
	element: (context: BluejayContext) => JSX.Element;
	metadata: BluejayMetadata;
	_response?: Response;
}

interface BluejayModule {
	default: (context: BluejayContext) => JSX.Element;
	metadata?: BluejayMetadata;
}

interface BluejayMetadata {
	id?: string;
	status?: number;
	[key: string]: any;
}

export { createApplication, createSource, readAssets, readFromConfiguration, readPage, readPages, readSources };

export type { BluejayApplication, BluejayConfiguration, BluejayConfigurationServe, BluejayContext, BluejayModule, BluejayMetadata, BluejayPage, BluejaySource };
