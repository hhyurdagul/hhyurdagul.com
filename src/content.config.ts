import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    language: z.enum(["en", "tr"]).default("en"),
    tags: z.array(z.string()).optional(),
    highlight: z.boolean().default(false),
  }),
});

export const collections = { blog };
