import { build, serve } from "bluejay";

const action = Bun.argv[2] === "build" ? build : serve;

await action({
    dir: import.meta.dir,
    path: "/",
    page: (page) => {
        return (
            <html lang="en">
                <head>
                    <title>bluejay example</title>
                    <link rel="stylesheet" href="/assets/index.css" />
                    <meta charset="utf8" />
                    <meta name="viewport" content="width=device-width" />
                </head>
                <body>
                    <div class="content">
                        <page.module.default />
                    </div>
                </body>
            </html>
        );
    },
});
