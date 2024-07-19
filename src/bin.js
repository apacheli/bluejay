#!/usr/bin/env bun

import { cp } from "node:fs/promises";

const location = Bun.argv[2] ?? "./bluejay-app";

await cp(`${import.meta.dir}/../init`, location, { recursive: true });

console.log(`Project initialized at \x1b[36m${location}\x1b[39m. Run the following commands to get started:\n`);
console.log(`    \x1b[35m$\x1b[39m \x1b[1mcd ${location}\x1b[22m`);
console.log("    \x1b[35m$\x1b[39m \x1b[1mbun install\x1b[22m");
console.log("    \x1b[35m$\x1b[39m \x1b[1mbun run main.js serve\x1b[22m");
