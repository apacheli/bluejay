import { transform } from "lightningcss";

export default (options) => {
  return async ({ files }) => {
    for (const file of files) {
      if (/\.css$/i.test(file.path)) {
        const result = transform({
          ...options,
          code: await Bun.file(file.path).bytes(),
        });
        file.content = result.code;
      }
    }
  };
};
