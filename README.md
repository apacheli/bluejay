# bluejay

Create a book with MDX, JSX components, and Bun

- Performance is key!
- Supports TypeScript and TSX right out of the box
- Easily spin up a development server and build static files

## Install

```sh
$ bun add https://github.com/apacheli/bluejay
```

## Example

```js
import { build } from "bluejay";

await build({
    dir: import.meta.dir,
    path: "/",
    page: (page) => {
        return <page.module.default />;
    },
});
```

You can run `$ bunx bluejay <directory>` to spin up a new project quickly.

## License

[License](LICENSE.txt)
