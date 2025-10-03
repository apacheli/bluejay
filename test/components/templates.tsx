import type { BluejayContext } from "../../lib/lib.ts";
import { CommonBody, CommonHead } from "./common.tsx";

const PageTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead title={ctx.page.metadata.title} />
		<CommonBody>
			<ctx.page.element {...ctx} />
		</CommonBody>
	</html>
);

const BlogTemplate = (ctx: BluejayContext) => {
	const previous = ctx.app.data.blogs[ctx.page.data.index - 1];
	const next = ctx.app.data.blogs[ctx.page.data.index + 1];
	return (
		<html lang="en">
			<CommonHead title={ctx.page.metadata.title}>
				<link rel="stylesheet" href="/assets/markdown.css" />
				<link rel="stylesheet" href="/assets/github.css" />
			</CommonHead>
			<CommonBody>
				<header>
					<img src={ctx.page.metadata.image ?? "/assets/placeholder.png"} alt={ctx.page.metadata.title} />
					<h1>{ctx.page.metadata.title}</h1>
				</header>
				<main class="markdown">
					<ctx.page.element {...ctx} />
				</main>
				<footer>
					{previous && <a href={previous.url}>Previous Article: {previous.metadata.title}</a>}
					{previous && next && " | "}
					{next && <a href={next.url}>Next Article: {next.metadata.title}</a>}
				</footer>
			</CommonBody>
		</html>
	);
};

export { BlogTemplate, PageTemplate };
