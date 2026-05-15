import { transform } from "lightningcss";

export default (opts) => {
  return {
    filter: (file) => /\.css$/i.test(file.path),
    use: async (file) => {
      const result = transform({
        ...opts,
        code: await Bun.file(file.path).bytes(),
      });
      file.content = result.code;
    },
  };
};
