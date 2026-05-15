export default {
  filter: (file) => /\.[jt]sx$/i.test(file.path),
  use: async (file) => {
    const module = await import(file.path);
    file.meta = module.meta ?? null;
    file.render = (...args) => module.default(...args);
  },
};
