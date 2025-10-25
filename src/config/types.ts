import type { CollectionEntry } from "astro:content";

export interface CardProps {
  title: string;
  href: string;
  dateymd?: string;
  datemyd?: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  url: string;
  ogImage: string;
  ogImageAlt: string;
  twitterHandle: string;
  locale: string;
}
