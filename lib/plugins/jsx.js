export default (attributes) => async ({ files }) => {
  for (const file of files) {
    if (/\.[jt]sx$/i.test(file.path)) {
      file.module = await import(file.path, attributes);
      file.meta = file.module.meta ?? null;
      file.render = file.module.default;
    }
  }
};
