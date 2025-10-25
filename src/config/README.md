# Configuration

This folder contains all site-wide configuration, types, and utilities.

## Files

- **site.ts** - Site-wide constants (title, description, social links, etc.)
- **types.ts** - TypeScript interfaces and type definitions
- **seo.ts** - SEO utility functions (structured data generation)
- **index.ts** - Barrel export for clean imports

## Usage

Import from the config folder using the barrel export:

```typescript
// Types
import type { SeoProps, CardProps, SiteConfig } from "../config";

// Config & utilities
import { siteConfig, generateStructuredData } from "../config";
```

## Adding New Config

1. Add the interface to `types.ts`
2. Add the constant to `config.ts`
3. Export it from `index.ts`
