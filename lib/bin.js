#!/usr/bin/env bun

import { join } from "node:path";
import { build, serve } from "./lib.js";

const start = (options) => {
  switch (options.mode) {
    case "build": {
      return build(options);
    }
    case "serve": {
      return serve(options);
    }
  }
  throw new Error(`${options.mode}: invalid mode`);
};

const main = async (path) => {
  const mod = await import(join(process.cwd(), path));
  await start(mod.default);
};

if (import.meta.main) {
  main(...Bun.argv.slice(2));
}
