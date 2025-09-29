import type { BluejayContext, BluejayPage } from "../../lib/main.ts";

export const metadata = {
	title: "Blog",
};

const dtf = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const Article = (page: BluejayPage) => {
	const { title, description, date, tag } = page.module.metadata ?? {};
	return (
		<article>
			<a href={page.url} class="blog-anchor">
				<div class="blog-entry">
					<div class="blog-image-container">
						<img src="/assets/placeholder.png" class="blog-image" alt={title} />
						{page.data.index === 0 ? <span class="blog-new">NEW!</span> : undefined}
					</div>
					<div class="blog-metadata">
						<span class="blog-tag">{tag}</span>
						<span class="blog-date">{dtf.format(new Date(date))}</span>
						<h2 class="blog-title">{title}</h2>
						<p class="blog-description">{description}</p>
					</div>
				</div>
			</a>
		</article>
	);
};

export default (context: BluejayContext) => {
	return (
		<>
			<h1>Blog</h1>
			<div class="blog-grid">{context.app.data.blogs.map(Article)}</div>
		</>
	);
};
