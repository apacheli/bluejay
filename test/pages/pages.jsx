export const title = "My Pages";
export const description = "Hello, World!";

export default ({ pages }) => (
    <>
        <img src="/bluejay/assets/icon.png" alt="The bluejay logo." />
        <h1>My Pages</h1>
        <ul>
            {pages.map((page) => (
                <li>
                    <a href={page.path.slice(0, -5)}>{page.module.title}</a>
                </li>
            ))}
        </ul>
    </>
);
