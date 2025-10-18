import type { BluejayContext } from "../../lib/lib.ts";
import { CommonBody, CommonHead, dtf } from "./common.tsx";

const PageTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead ctx={ctx} />
		<CommonBody ctx={ctx}>{ctx.page.element(ctx)}</CommonBody>
	</html>
);

const MarkdownTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead ctx={ctx}>
			<link rel="stylesheet" href="/bluejay/assets/css/github.css" />
			<link rel="stylesheet" href="/bluejay/assets/css/markdown.css" />
		</CommonHead>
		<CommonBody ctx={ctx}>
			<main class="markdown">{ctx.page.element(ctx)}</main>
		</CommonBody>
	</html>
);

const BlogTemplate = (ctx: BluejayContext) => {
	return (
		<html lang="en">
			<CommonHead ctx={ctx}>
				<link rel="stylesheet" href="/bluejay/assets/css/github.css" />
				<link rel="stylesheet" href="/bluejay/assets/css/markdown.css" />
			</CommonHead>
			<CommonBody ctx={ctx}>
				<header class="post-header">
					<h1 class="post-title">{ctx.page.metadata.title}</h1>
					<span class="blog-tag">{ctx.page.metadata.tag}</span>
					<time class="blog-date">{dtf.format(new Date(ctx.page.metadata.date))}</time>
					<img class="post-image" src={ctx.page.metadata.image ?? `${Bun.env.BLUEJAY_PREFIX}/assets/images/placeholder.png`} alt={ctx.page.metadata.title} />
				</header>
				<main class="markdown">{ctx.page.element(ctx)}</main>
			</CommonBody>
		</html>
	);
};

export default {
	"blog": BlogTemplate,
	"markdown": MarkdownTemplate,
	"page": PageTemplate,
};
