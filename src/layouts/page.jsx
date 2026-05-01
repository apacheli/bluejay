const isDevelopment = Bun.env.NODE_ENV === "development";

const Page = (ctx) => {
  return (
    <html lang="en">
      <head>
        <title>{ctx.file.meta.title}</title>
        <link href="/assets/index.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div>{ctx.file.content ?? ctx.file.module.default(ctx)}</div>
        {isDevelopment ? <script src="/_bluejay/ws/client" /> : undefined}
      </body>
    </html>
  );
};

export default Page;
