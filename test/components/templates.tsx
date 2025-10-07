import type { BluejayContext } from "../../lib/lib.ts";
import { Article, CommonBody, CommonHead, dtf } from "./common.tsx";

const PageTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead title={ctx.page.metadata.title} />
		<CommonBody>
			<ctx.page.element {...ctx} />
		</CommonBody>
	</html>
);

const MarkdownTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead title={ctx.page.metadata.title}>
			<link rel="stylesheet" href="/assets/css/github.css" />
			<link rel="stylesheet" href="/assets/css/markdown.css" />
		</CommonHead>
		<CommonBody>
			<main class="markdown">
				<ctx.page.element {...ctx} />
			</main>
		</CommonBody>
	</html>
);

const BlogTemplate = (ctx: BluejayContext) => {
	const next = ctx.app.data.blogs[ctx.page.data.index - 1];
	const previous = ctx.app.data.blogs[ctx.page.data.index + 1];
	return (
		<html lang="en">
			<CommonHead title={ctx.page.metadata.title}>
				<link rel="stylesheet" href="/assets/css/github.css" />
				<link rel="stylesheet" href="/assets/css/markdown.css" />
			</CommonHead>
			<CommonBody>
				<header class="post-header">
					<h1 class="post-title">{ctx.page.metadata.title}</h1>
					<span class="blog-tag">{ctx.page.metadata.tag}</span>
					<time class="blog-date">{dtf.format(new Date(ctx.page.metadata.date))}</time>
					<img src={ctx.page.metadata.image ?? "/assets/images/placeholder.png"} alt={ctx.page.metadata.title} />
				</header>
				<main class="markdown">
					<ctx.page.element {...ctx} />
				</main>
				<footer class="post-footer">
					<script
						src="https://giscus.app/client.js"
						data-repo="apacheli/apacheli.github.io"
						data-repo-id="R_kgDOLt0Zpg"
						data-category="General"
						data-category-id="DIC_kwDOLt0Zps4CkjKo"
						data-mapping="title"
						data-strict="0"
						data-reactions-enabled="1"
						data-emit-metadata="0"
						data-input-position="top"
						data-theme="light"
						data-lang="en"
						crossorigin="anonymous"
						async={true}
					/>
					<h2>Continue Reading</h2>
					{next && <Article {...next} />}
					{previous && <Article {...previous} />}
				</footer>
			</CommonBody>
		</html>
	);
};

export { BlogTemplate, MarkdownTemplate, PageTemplate };
