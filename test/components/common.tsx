import Footer from "./footer.tsx";
import Header from "./header.tsx";

interface CommonHeadProps {
	children?: any;
	title?: string;
}

interface CommonBodyProps {
	children?: any;
}

const CommonHead = ({ children, title }: CommonHeadProps) => (
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/favicon.png" />
		<link rel="stylesheet" href="/assets/index.css" />
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

export { CommonBody, CommonHead };
