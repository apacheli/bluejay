#!/usr/bin/env bun

import { cp } from "node:fs/promises";

const command = Bun.argv[2];

switch (command) {
    case "init": {
        const location = Bun.argv[3] ?? prompt("Path to initialize app:") ?? "./bluejay-app";
        await cp(`${import.meta.dir}/../init`, location, { recursive: true });
        console.log(`Project initialized at \x1b[36m${location}\x1b[39m\n\nRun the following commands to get started:\n`);
        console.log(`    \x1b[35m$\x1b[39m \x1b[1mcd ${location}\x1b[22m`);
        console.log("    \x1b[35m$\x1b[39m \x1b[1mbun install\x1b[22m");
        console.log("    \x1b[35m$\x1b[39m \x1b[1mbun run main.js serve\x1b[22m");
        break;
    }

    default: {
        console.log(`\x1b[31merror\x1b[39m: unknown command: \x1b[1m${command}\x1b[22m\n`);
        console.log("Commands:\n");
        console.log("    \x1b[36minit <path>\x1b[39m    Create a new bluejay app.");
        break;
    }
}
