# Bluejay

> [!WARNING]
> Bluejay is currently under development. Don't hesitate to open an issue if you find bugs.

Build static pages with MDX, JSX/TSX components, and Bun.

- :zap: Powered by Bun and Preact for maximum performance. It takes ~**10 ms** to build your files.
- :toolbox: Supports TypeScript right out of the box.
- :gear: Simple and minimal without excluding essential tools such as a real time watcher.
- :globe_with_meridians: Generating arbitrary files allows for an infinite amount of possibilities for plugins.

## Resources

- [Official Bluejay Page](https://apache.li/bluejay)
- [Learn MDX](https://mdxjs.com/docs/)
- [Learn TypeScript](https://www.typescriptlang.org/docs/)

## Install

You will need **Bun v1.1.x** or higher to install Bluejay.

```
$ bun add https://github.com/apacheli/bluejay
```

> [!NOTE]
> Binaries will soon be available on JSR whenever Bluejay becomes stable.

## Getting Started

### Using CLI

This will create a minimal boilerplate to start using Bluejay. We recommend that you choose this approach as opposed to setting it up on your own. Instantly create a new project with the following command:

```
$ bun create apacheli/bluejay-app
```

Serve development files:

```
$ bun serve
```

Build to dist:

```
$ bun dle
```

### Manual Setup

This is the _absolute_ minimum amount of code necessary to start a Bluejay project:

```tsx
import { start } from "bluejay";

await start({
    assets: "assets",
    dir: import.meta.dir,
    dist: "dist",
    pages: "pages",
    path: "",
    render: (page) => <page.mod.default />,
});
```
