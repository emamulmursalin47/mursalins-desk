# SEO Configuration Guide

This Next.js boilerplate comes with comprehensive SEO configuration out of the box. This guide will help you understand and customize the SEO settings.

## 📁 File Structure

```
src/
├── config/
│   └── seo.ts                    # Main SEO configuration
├── lib/
│   └── metadata.ts               # Metadata utilities for pages
├── components/
│   └── seo/
│       └── json-ld.tsx          # JSON-LD structured data components
└── app/
    ├── layout.tsx               # Root layout with metadata
    ├── robots.ts                # Robots.txt generator
    ├── sitemap.ts               # Sitemap.xml generator
    └── opengraph-image.tsx      # Dynamic OG image generator
```

## 🚀 Quick Start

### 1. Update Site Configuration

Edit `src/config/seo.ts`:

```typescript
export const siteConfig = {
  name: "Your Site Name",
  description: "Your site description",
  url: "https://yourdomain.com",
  ogImage: "https://yourdomain.com/og-image.jpg",
  links: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourusername",
  },
  creator: {
    name: "Your Name",
    twitter: "@yourhandle",
  },
  keywords: [
    "keyword1",
    "keyword2",
    // Add your keywords
  ],
};
```

### 2. Add Verification Codes

In `src/config/seo.ts`, update the verification section:

```typescript
verification: {
  google: "your-google-search-console-code",
  yandex: "your-yandex-verification-code",
}
```

## 🎯 Features Included

### ✅ Meta Tags

- **Title Templates**: Automatic title formatting with site name
- **Description**: SEO-optimized descriptions
- **Keywords**: Customizable keyword arrays
- **Authors**: Creator metadata
- **Viewport**: Responsive design settings
- **Theme Colors**: Light/dark mode support

### ✅ Open Graph (OG) Tags

- Dynamic OG image generation
- Facebook-optimized metadata
- Complete OG protocol implementation
- 1200x630px image specification

### ✅ Twitter Cards

- Summary large image cards
- Twitter-specific metadata
- Creator attribution

### ✅ Robots & Crawling

- `robots.txt` generation
- Sitemap reference
- GoogleBot configuration
- Max image/video preview settings

### ✅ Sitemap

- Auto-generated XML sitemap
- Priority and change frequency
- Last modified timestamps
- Extensible for dynamic routes

### ✅ JSON-LD Structured Data

Three types of structured data components:

1. **WebsiteJsonLd**: Website information
2. **OrganizationJsonLd**: Organization/brand data
3. **BreadcrumbJsonLd**: Navigation breadcrumbs

### ✅ Favicon & Web App Manifest

- PWA-ready manifest file
- Multiple icon sizes support
- Apple touch icons

## 📝 Usage Examples

### Using Metadata Utilities

For custom pages, use the `constructMetadata` utility:

```typescript
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "About Us",
  description: "Learn more about our company",
  path: "/about",
  image: "/custom-og-image.jpg",
});
```

### Adding Breadcrumbs

```typescript
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export default function BlogPost() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://yourdomain.com" },
          { name: "Blog", url: "https://yourdomain.com/blog" },
          { name: "Post Title", url: "https://yourdomain.com/blog/post" },
        ]}
      />
      {/* Your content */}
    </>
  );
}
```

### Page-Specific Metadata

```typescript
// In any page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Page Title",
  description: "Custom page description",
};
```

## 🔍 SEO Checklist

- [ ] Update `siteConfig` in `src/config/seo.ts`
- [ ] Add Google Search Console verification code
- [ ] Configure proper site URL (production domain)
- [ ] Add custom Open Graph images
- [ ] Add favicon files to `/public`
- [ ] Update keywords array
- [ ] Configure social media links
- [ ] Test with [Open Graph Debugger](https://www.opengraph.xyz/)
- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Submit sitemap to Google Search Console

## 📊 Testing Your SEO

### Local Testing

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Check generated files**:
   - Visit `/robots.txt`
   - Visit `/sitemap.xml`
   - Visit `/opengraph-image` (dynamic OG image)

### Production Testing

1. **Open Graph**: [https://www.opengraph.xyz/](https://www.opengraph.xyz/)
2. **Twitter Cards**: [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
3. **Rich Results**: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
4. **PageSpeed**: [https://pagespeed.web.dev/](https://pagespeed.web.dev/)

## 🎨 Customizing Open Graph Images

The dynamic OG image is generated in `src/app/opengraph-image.tsx`. You can customize:

- Background gradients
- Typography
- Layout
- Brand colors
- Logo placement

## 📱 Sitemap Configuration

To add more routes to your sitemap, edit `src/app/sitemap.ts`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/blog",
    "/contact",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
```

## 🤖 Robots Configuration

To modify crawler rules, edit `src/app/robots.ts`:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

## 🌐 Multi-language SEO

For internationalization, add alternate links:

```typescript
alternates: {
  canonical: url,
  languages: {
    'en-US': '/en-US',
    'de-DE': '/de-DE',
  },
}
```

## 📈 Analytics Integration

This boilerplate is ready for:

- Google Analytics
- Google Tag Manager
- Vercel Analytics
- Plausible Analytics

Add your analytics scripts in the root layout.

## 🔗 Useful Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

## 💡 Best Practices

1. **Keep titles under 60 characters**
2. **Keep descriptions between 150-160 characters**
3. **Use unique metadata for each page**
4. **Include relevant keywords naturally**
5. **Update sitemap when adding new pages**
6. **Test on multiple platforms**
7. **Monitor Google Search Console**
8. **Use semantic HTML**
9. **Optimize images (WebP format)**
10. **Ensure fast page loads**

---

Need help? Check the [Next.js Documentation](https://nextjs.org/docs) or open an issue!
