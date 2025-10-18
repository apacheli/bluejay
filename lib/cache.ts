const cache = Bun.file(".bluejay/cache.json");
const data = await cache.json().catch(() => ({}));

export default {
	data,
	updatable: false,
	update() {
		if (this.updatable) {
			return Bun.write(cache, JSON.stringify(data));
		}
	},
};
