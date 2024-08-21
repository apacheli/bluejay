export interface ArticleProps {
  title: string;
  description: string;
  date: string;
  url: string;
}

export default ({ title, description, date, url }: ArticleProps) => (
  <a href={url}>
    <article class="blog">
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{date}</span>
    </article>
  </a>
);
