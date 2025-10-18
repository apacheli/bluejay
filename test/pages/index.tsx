export const metadata = {
	id: "index",
	title: "Home",
	description: "Static pages made easy.",
};

export default () => {
	return (
		<>
			<div class="home">
				<div>
					<img class="home-image" src="/bluejay/assets/images/icon.png" alt="Bluejay icon" />
					<h1 class="home-title">Bluejay</h1>
					<h2 class="home-description">Static pages made easy.</h2>
				</div>
				<div class="home-buttons">
					<a class="home-button" href="/bluejay/guide">
						Get Started
					</a>
					<a class="home-button" href="/bluejay/documentation">
						Documentation
					</a>
				</div>
			</div>
			<div class="features">
				<div class="feature">
					<div>
						<span class="feature-emoji">⚡</span>
						<span class="feature-title">Performant</span>
					</div>
					<p class="feature-description">Powered by Bun and Preact for maximum performance.</p>
				</div>
				<div class="feature">
					<span class="feature-emoji">🧰</span>
					<span class="feature-title">Batteries Included</span>
					<p class="feature-description">Supports TSX and MDX right out of the box.</p>
				</div>
				<div class="feature">
					<span class="feature-emoji">🔌</span>
					<span class="feature-title">Extensible</span>
					<p class="feature-description">Simple APIs allow you to easily create plugins.</p>
				</div>
			</div>
		</>
	);
};
