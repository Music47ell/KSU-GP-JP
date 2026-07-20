import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://ksu-gp-jps.ahmetalmaz.com",
	base: "/",
	trailingSlash: "never",
	integrations: [tailwind()],
	adapter: cloudflare(),
	output: "server",
});