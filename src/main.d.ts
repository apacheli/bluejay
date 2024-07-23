import type { JSX } from "preact";

import type { Server } from "bun";

export declare interface BuildOptions<T> {
    dir: string;
    mode?: string;
    path?: string;
    page: (page: Page<T>, pages?: Page<T>[]) => JSX.Element;
}

export declare interface Page<T> {
    path: string;
    module: {
        default: (props?: { [x: string]: unknown }) => JSX.Element;
        [x: string]: unknown;
    };
}

export declare const build: <T>(options: BuildOptions<T>) => Promise<void>;
export declare const serve: <T>(options: BuildOptions<T>) => Promise<Server>;
export declare const start: <T>(options: BuildOptions<T>) => Promise<unknown>;
