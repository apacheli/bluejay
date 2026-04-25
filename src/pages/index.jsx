export const meta = {
  title: "Home",
};

export default ({ files }) => {
  return (
    <>
      <h1>Hello, World!</h1>
      {files.sort((a, b) => a.url.localeCompare(b.url)).map((file) => (
        <p>{file.url}</p>
      ))}
    </>
  );
};
