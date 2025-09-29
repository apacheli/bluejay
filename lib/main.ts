import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import type { JSX } from "preact/jsx-runtime";

const isWindows = process.platform === "win32";

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
	if (isWindows) {
		dir = dir.replace(/\\/g, "/");
	}
	const ei = entry.name.lastIndexOf(".");
	return {
		data: {},
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
	const module: BluejayModule = await import(source.file);
	source.module = await import(source.file);
	if (module.metadata?.id !== undefined) {
		app.ids[module.metadata.id] = source;
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
		config,
		data: {},
	};
	await readFromConfiguration(app);
	config.onLoad?.(app);
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
	onLoad?: (app: BluejayApplication) => void;
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
	/**
	 * Empty object for attaching arbitrary data to.
	 */
	data: Record<string, any>;
	ext: string;
	file: string;
	url: string;
}

interface BluejayPage extends BluejaySource {
	module: BluejayModule;
}

interface BluejayModule {
	default: (context: BluejayContext) => JSX.Element;
	metadata?: BluejayModuleMetadata;
}

interface BluejayModuleMetadata {
	id?: string;
	status?: number;
	[key: string]: any;
}

export { createApplication, createSource, isWindows, readAssets, readFromConfiguration, readPage, readPages, readSources };

export type {
	BluejayApplication,
	BluejayConfiguration,
	BluejayConfigurationServe,
	BluejayContext,
	BluejayModule,
	BluejayModuleMetadata,
	BluejayPage,
	BluejaySource,
};
