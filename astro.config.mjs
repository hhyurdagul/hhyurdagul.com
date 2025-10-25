import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://hhyurdagul.com",
  // Optional: Enable sitemap generation
  integrations: [sitemap()],
});
