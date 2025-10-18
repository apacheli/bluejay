import type { BluejayPage } from "../../lib/lib.ts";
import Footer from "./footer.tsx";
import Header from "./header.tsx";

const dtf = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

const Article = (page: BluejayPage) => {
	const { title, description, image, date, tag } = page.metadata;
	return (
		<article>
			<a href={`/bluejay${page.url}`} class="blog-anchor" title={title}>
				<div class="blog-entry">
					<div class="blog-image-container">
						<img src={image ?? "/bluejay/assets/images/placeholder.png"} class="blog-image" alt={title} />
						{page.data.index === 0 ? <span class="blog-new">NEW!</span> : undefined}
					</div>
					<div class="blog-metadata">
						<span class="blog-tag">{tag}</span>
						<time class="blog-date" datetime={date}>
							{dtf.format(new Date(date))}
						</time>
						<h2 class="blog-title">{title}</h2>
						<p class="blog-description">{description}</p>
					</div>
				</div>
			</a>
		</article>
	);
};

const CommonHead = ({ ctx, children }: any) => (
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/bluejay/favicon.png" />
		<link rel="stylesheet" href="/bluejay/assets/css/font.css" />
		<link rel="stylesheet" href="/bluejay/assets/css/index.css" />
		<title>{ctx.page.metadata.title ?? "No Title"} - apacheli</title>

		<meta property="og:description" content={ctx.page.metadata.description} />
		<meta property="og:image" content={`${Bun.env.BLUEJAY_URL}${ctx.page.metadata.image ?? "/bluejay/favicon.png"}`} />
		<meta property="og:title" content={ctx.page.metadata.title} />
		<meta property="og:type" content="website" />
		<meta property="og:url" content={Bun.env.BLUEJAY_URL} />
		<meta name="twitter:card" content="summary_large_image" />

		{children}
	</head>
);

const CommonBody = ({ children }: any) => (
	<body>
		<Header />
		<div class="main">{children}</div>
		<Footer />
	</body>
);

export { dtf, Article, CommonBody, CommonHead };
