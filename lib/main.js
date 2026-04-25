import { join } from "node:path";
import { start } from "./lib.js";

const main = async () => {
  const mod = await import(join(process.cwd(), Bun.argv[2]));
  await start(mod.default);
};

if (import.meta.main) {
  main();
}
