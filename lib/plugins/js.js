export default (options) => {
  const transpiler = new Bun.Transpiler(options);
  return async ({ files }) => {
    for (const file of files) {
      if (/\.[jt]s$/i.test(file.path)) {
        file.content = await transpiler.transform(await Bun.file(file.path).text());
      }
    }
  };
};
