import type { BluejayContext } from "../../lib/main.ts";
import { CommonBody, CommonHead } from "./common.tsx";

const PageTemplate = (ctx: BluejayContext) => (
	<html lang="en">
		<CommonHead title={ctx.page.module.metadata?.title} />
		<CommonBody>
			<ctx.page.module.default {...ctx} />
		</CommonBody>
	</html>
);

const BlogTemplate = (ctx: BluejayContext) => {
	const previous = ctx.app.data.blogs[ctx.page.data.index - 1];
	const next = ctx.app.data.blogs[ctx.page.data.index + 1];
	return (
		<html lang="en">
			<CommonHead title={ctx.page.module.metadata!.title} />
			<CommonBody>
				<ctx.page.module.default {...ctx} />
				<footer>
					{previous && <a href={previous.url}>Previous Article: {previous.module.metadata.title}</a>}
					{previous && next && " | "}
					{next && <a href={next.url}>Next Article: {next.module.metadata.title}</a>}
				</footer>
			</CommonBody>
		</html>
	);
};

export { BlogTemplate, PageTemplate };
