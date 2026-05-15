import { join } from "node:path";
import { start } from "./lib.js";

const main = async (cmd, path) => {
  const mod = await import(join(process.cwd(), path));
  await start(cmd, mod.default);
};

if (import.meta.main) {
  main(...Bun.argv.slice(2));
}
