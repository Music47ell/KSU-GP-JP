import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://ksu-gp-jps.news47ell.com",
  base: "/",
  trailingSlash: "never",
  output: "server",
  integrations: [tailwind()],
});