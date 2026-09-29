import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig({
	alias: {
		"#tanstack-router-entry": "./src/router.tsx",
		"#tanstack-start-entry": "./src/start.ts",
		"#tanstack-start-plugin-adapters": "./node_modules/@tanstack/start-server-core/dist/esm/empty-plugin-adapters.js",
		"#tanstack-start-server-fn-resolver": "./dist/server/server-fn-resolver.js",
		"tanstack-start-manifest:v": "./dist/server/start-manifest.js",
	},
	types: {
		generate: false,
	},
	assetsDirectory: "./dist/client",
});
