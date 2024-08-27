# Bluejay

Build static pages with MDX, JSX/TSX components, and Bun.

- :zap: Powered by Bun and Preact for maximum performance. It takes ~**10 ms** to build your files.
- :gear: Simple and minimal without excluding essential tools such as a real time watcher.
- :globe_with_meridians: Generating arbitrary files allows for an infinite amount of possibilities for plugins.

## Install

```
$ bun add https://github.com/apacheli/bluejay
```

## Getting Started

## Using CLI

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

## Manual Setup

This is the _absolute_ minimum amount of code necessary to start a Bluejay project:

```tsx
import { start } from "bluejay";

await start({
    assets: "src/assets",
    dir: Bun.cwd,
    dist: "dist",
    mode: Bun.env.BUILD_MODE as "build" | "serve",
    pages: "src/pages",
    path: "",
    render: (page) => {
        return <page.mod.default />;
    },
});
```
