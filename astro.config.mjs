import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "https://ksu-gp-jps.news47ell.com",
	base: "/",
	trailingSlash: "never",
	integrations: [tailwind()],
	adapter: vercel(),
	output: "server",
});