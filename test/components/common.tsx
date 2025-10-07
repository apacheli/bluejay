import type { BluejayPage } from "../../lib/lib.ts";
import Footer from "./footer.tsx";
import Header from "./header.tsx";

interface CommonHeadProps {
	children?: any;
	title?: string;
}

interface CommonBodyProps {
	children?: any;
}

const dtf = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const Article = (page: BluejayPage) => {
	const { title, description, image, date, tag } = page.metadata;
	return (
		<article>
			<a href={page.url} class="blog-anchor">
				<div class="blog-entry">
					<div class="blog-image-container">
						<img src={image ?? "/assets/images/placeholder.png"} class="blog-image" alt={title} />
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

const CommonHead = ({ children, title }: CommonHeadProps) => (
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/favicon.png" />
		<link rel="stylesheet" href="/assets/css/font.css" />
		<link rel="stylesheet" href="/assets/css/index.css" />
		<title>{title ?? "No Title"} - apacheli</title>
		{children}
	</head>
);

const CommonBody = ({ children }: CommonBodyProps) => (
	<body>
		<Header />
		<div class="main">{children}</div>
		<Footer />
	</body>
);

export { dtf, Article, CommonBody, CommonHead };
