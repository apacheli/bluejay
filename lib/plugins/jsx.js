export default async ({ files }) => {
  for (const file of files) {
    if (/\.[jt]sx$/i.test(file.path)) {
      const module = await import(file.path);
      file.meta = module.meta ?? null;
      file.render = (...args) => module.default(...args);
    }
  }
};
