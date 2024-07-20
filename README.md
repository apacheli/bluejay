# bluejay

<img src="./test/assets/icon.png" alt="The bluejay logo." align="right" />

> [!WARNING]\
> bluejay is currently under development. We don't recommend that you use bluejay in development. If you find a bug, don't hesitate to open an issue!

Create a book with MDX, JSX components, and Bun

- Powered by Preact for maximum performance
- Supports TypeScript and TSX right out of the box
- Easily spin up a development server and build static files
- Extensible and easy to create new templates

## Install

```sh
$ bun add https://github.com/apacheli/bluejay
```

## Example

```js
import { start } from "bluejay";

await start({
    dir: import.meta.dir,
    mode: Bun.env.START_MODE ?? "build",
    path: "/",
    page: (page) => {
        return <page.module.default />;
    },
});
```

> [!TIP]\
> Run `$ bunx bluejay init` to spin up a new project instantly. We recommend this approach when starting a bluejay new project.

## Structure

> [!NOTE]\
> This is likely going to change in the future.

Paths within a bluejay project are currently hardcoded at the moment.

Files from `assets` are cloned to `dist/assets`.

All files in `pages` are expected to be one of:

- `.jsx`
- `.mdx`
- `.tsx`

They must also export a default function that returns a JSX component.

## License

[License](LICENSE.txt)
