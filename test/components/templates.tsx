import type { BluejayContext } from "../../lib/lib.ts";
import { Article, CommonBody, CommonHead, dtf } from "./common.tsx";
import { FacebookIcon, LinkedInIcon, TwitterIcon } from "./icons.tsx";

const _url = (ctx: BluejayContext) => encodeURIComponent(Bun.env.BLUEJAY_URL + ctx.page.url);

const shareLinks = [
	{
		id: "facebook",
		title: "Post on Facebook",
		createHref: (ctx: BluejayContext) => `https://www.facebook.com/sharer.php?u=${_url(ctx)}`,
		icon: FacebookIcon,
	},
	{
		id: "twitter",
		title: "Tweet on Twitter",
		createHref: (ctx: BluejayContext) => `https://twitter.com/intent/tweet?url=${_url(ctx)}&text=${encodeURIComponent(ctx.page.metadata.title)}`,
		icon: TwitterIcon,
	},
	{
		id: "linked-in",
		title: "Share on LinkedIn",
		createHref: (ctx: BluejayContext) => `https://www.linkedin.com/sharing/share-offsite?url=${_url(ctx)}`,
		icon: LinkedInIcon,
	},
];

const PageTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead ctx={ctx} />
		<CommonBody ctx={ctx}>{ctx.page.element(ctx)}</CommonBody>
	</html>
);

const MarkdownTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead ctx={ctx}>
			<link rel="stylesheet" href="/assets/css/github.css" />
			<link rel="stylesheet" href="/assets/css/markdown.css" />
		</CommonHead>
		<CommonBody ctx={ctx}>
			<main class="markdown">{ctx.page.element(ctx)}</main>
		</CommonBody>
	</html>
);

const BlogTemplate = (ctx: BluejayContext) => {
	const next = ctx.app.data.blogs[ctx.page.data.index - 1];
	const previous = ctx.app.data.blogs[ctx.page.data.index + 1];
	return (
		<html lang="en">
			<CommonHead ctx={ctx}>
				<link rel="stylesheet" href="/assets/css/github.css" />
				<link rel="stylesheet" href="/assets/css/markdown.css" />
			</CommonHead>
			<CommonBody ctx={ctx}>
				<header class="post-header">
					<h1 class="post-title">{ctx.page.metadata.title}</h1>
					<span class="blog-tag">{ctx.page.metadata.tag}</span>
					<time class="blog-date">{dtf.format(new Date(ctx.page.metadata.date))}</time>
					<img class="post-image" src={ctx.page.metadata.image ?? "/assets/images/placeholder.png"} alt={ctx.page.metadata.title} />
				</header>
				<main class="markdown">{ctx.page.element(ctx)}</main>
				<footer class="post-footer">
					<h2>Share</h2>
					<span class="share-url">{Bun.env.BLUEJAY_URL + ctx.page.url}</span>
					<div class="icon-links">
						{shareLinks.map((b) => (
							<a href={b.createHref(ctx)} class={`icon-link ${b.id}`} title={b.title}>
								<b.icon />
							</a>
						))}
					</div>
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

export default {
	blog: BlogTemplate,
	markdown: MarkdownTemplate,
	page: PageTemplate,
};
