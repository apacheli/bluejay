export const meta = {
  title: "Home",
};

export default ({ files }) => {
  return (
    <>
      <h1>Bluejay Demo</h1>
      {files.sort((a, b) => a.url.localeCompare(b.url)).map((file) => (
        <p>
          <a href={file.url}>{file.url}</a>
        </p>
      ))}
    </>
  );
};
