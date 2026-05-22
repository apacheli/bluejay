import { join } from "node:path";
import { start } from "./lib.js";

const main = async (cmd, path) => {
  const mod = await import(join(process.cwd(), path));
  console.time("bluejay");
  await start(cmd, mod.default);
  console.timeEnd("bluejay");
};

if (import.meta.main) {
  main(...Bun.argv.slice(2));
}
