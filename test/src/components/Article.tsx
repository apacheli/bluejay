import type { PageProps } from "@components/Page";

export default ({ title, description, date, url }: PageProps & { url: string }) => (
    <a href={url}>
        <article class="blog">
            <h2>{title}</h2>
            <p>{description}</p>
            <span>{date}</span>
        </article>
    </a>
);
