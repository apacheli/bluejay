import Article from "@components/Article";

export const title = "Blog";
export const description =
  "Keep up with the latest updates regarding Bluejay development.";

export default ({ pages }: { pages: any[] }) => (
  <>
    <h1>Blog</h1>
    {pages
      .filter((page) => page.mod.type === "blog")
      .sort()
      .map((page) => (
        <Article {...page.mod} url={`/bluejay${page.path}`} />
      ))}
  </>
);
