const isDevelopment = Bun.env.NODE_ENV === "development";

const Page = ({ file, files }) => {
  return (
    <html lang="en">
      <head>
        <title>{file.meta.title}</title>
        <link href="/assets/index.css" rel="stylesheet" />
      </head>
      <body>
        <div>{file.module.default({ file, files })}</div>
        {isDevelopment ? <script src="/_bluejay/ws/client" /> : undefined}
      </body>
    </html>
  );
};

export default Page;
