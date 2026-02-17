# AI Development Instructions for Lighthouse-Optimized Websites

This document provides comprehensive instructions for AI assistants to follow when developing websites that achieve high Lighthouse scores (90+) across all metrics: Performance, Accessibility, Best Practices, SEO, and PWA.

---

## 📊 Lighthouse Scoring Categories

### Required Scores (Target: 90-100 in all categories)
1. **Performance**: 90-100
2. **Accessibility**: 90-100
3. **Best Practices**: 90-100
4. **SEO**: 90-100
5. **PWA**: 90-100 (if applicable)

---

## 🎯 1. PERFORMANCE OPTIMIZATION (Target: 90-100)

### 1.1 Core Web Vitals

**Largest Contentful Paint (LCP) - Target: < 2.5s**

```typescript
// ✅ DO: Use Next.js Image component
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ DON'T: Use regular img tags for large images
<img src="/hero.jpg" alt="Hero" />
```

**First Input Delay (FID) - Target: < 100ms**
- Minimize JavaScript execution time
- Use code splitting
- Defer non-critical JavaScript

**Cumulative Layout Shift (CLS) - Target: < 0.1**

```typescript
// ✅ DO: Always specify dimensions
<Image src="/logo.png" width={200} height={50} alt="Logo" />

// ✅ DO: Reserve space for dynamic content
<div className="min-h-[400px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// ❌ DON'T: Let content shift during load
<div>{loading ? null : <Content />}</div>
```

### 1.2 Image Optimization

**CRITICAL RULES:**

1. **Always use Next.js Image component**
   ```typescript
   import Image from "next/image";

   // For static images
   <Image src="/static.jpg" width={800} height={600} alt="Description" />

   // For dynamic images
   <Image
     src={dynamicUrl}
     width={800}
     height={600}
     alt="Description"
     loading="lazy" // For below-fold images
   />
   ```

2. **Use modern image formats**
   - WebP or AVIF when possible
   - Configure in `next.config.ts`:
   ```typescript
   images: {
     formats: ['image/avif', 'image/webp'],
   }
   ```

3. **Optimize image sizes**
   - Use responsive images with `sizes` prop
   - Example:
   ```typescript
   <Image
     src="/responsive.jpg"
     alt="Responsive"
     fill
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
   />
   ```

4. **Lazy load below-fold images**
   ```typescript
   <Image src="/below-fold.jpg" loading="lazy" alt="Below fold" />
   ```

5. **Use priority for above-fold images**
   ```typescript
   <Image src="/hero.jpg" priority alt="Hero" />
   ```

### 1.3 Font Optimization

**✅ CORRECT Font Loading:**

```typescript
import { Inter, Roboto } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // CRITICAL: Prevents invisible text
  variable: "--font-inter",
  preload: true,
});

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

// In layout
<html className={`${inter.variable} ${roboto.variable}`}>
```

**❌ AVOID:**
- Never use font-display: block (causes FOIT)
- Don't load fonts from external CDNs without preconnect
- Don't load unused font weights

### 1.4 JavaScript Optimization

**Code Splitting:**

```typescript
// ✅ DO: Dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <Skeleton />,
  ssr: false, // If component doesn't need SSR
});

// ✅ DO: Split by route
// Next.js does this automatically with App Router

// ❌ DON'T: Import everything upfront
import { AllComponents } from "huge-library";
```

**Minimize Third-Party Scripts:**

```typescript
// ✅ DO: Use Next.js Script component
import Script from "next/script";

<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload" // or "afterInteractive"
/>

// ❌ DON'T: Add scripts directly in HTML
<script src="external.js"></script>
```

### 1.5 CSS Optimization

**✅ BEST PRACTICES:**

1. **Use Tailwind CSS utility classes** (already configured)
2. **Avoid large CSS files**
3. **Remove unused CSS** (Tailwind does this automatically)
4. **Use CSS-in-JS sparingly**

```typescript
// ✅ DO: Use Tailwind utilities
<div className="flex items-center justify-center bg-blue-500">

// ✅ DO: Extract repeated patterns
// tailwind.config.ts
theme: {
  extend: {
    spacing: {
      'section': '6rem',
    }
  }
}

// ❌ AVOID: Inline styles for static values
<div style={{ display: 'flex', backgroundColor: '#3B82F6' }}>
```

### 1.6 Bundle Size Optimization

**Package Analysis:**

```bash
# Add to package.json
"analyze": "ANALYZE=true next build"
```

**Rules:**
1. Avoid large dependencies when lighter alternatives exist
2. Use tree-shaking compatible packages
3. Check bundle size before adding new packages
4. Use dynamic imports for large libraries

---

## ♿ 2. ACCESSIBILITY (Target: 90-100)

### 2.1 Semantic HTML Structure

**CRITICAL: Heading Hierarchy**

```typescript
// ✅ CORRECT: Proper heading hierarchy
<article>
  <h1>Main Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h4>Sub-subsection Title</h4>
  </section>
  <section>
    <h2>Another Section</h2>
    <h3>Subsection</h3>
  </section>
</article>

// ❌ WRONG: Skipping heading levels
<h1>Title</h1>
<h3>Subtitle</h3> // Don't skip h2!

// ❌ WRONG: Multiple h1 tags (except in different sections)
<h1>First Title</h1>
<h1>Second Title</h1> // Should be h2
```

**Heading Rules (STRICTLY ENFORCE):**
1. **ONE h1 per page** (main page title)
2. **Never skip heading levels** (h1 → h2 → h3, not h1 → h3)
3. **Use headings for structure, not styling**
4. **Headings must be descriptive**

### 2.2 ARIA Labels and Roles

```typescript
// ✅ DO: Add ARIA labels to interactive elements without text
<button aria-label="Close menu" onClick={closeMenu}>
  <XIcon />
</button>

// ✅ DO: Use semantic HTML first
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ✅ DO: Add roles when semantic HTML isn't enough
<div role="alert" aria-live="polite">
  Form submitted successfully
</div>

// ❌ DON'T: Overuse ARIA when semantic HTML works
<div role="button"> // Use <button> instead
```

### 2.3 Form Accessibility

```typescript
// ✅ CORRECT: Accessible form
<form>
  <label htmlFor="email">
    Email Address
    <input
      id="email"
      type="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-error"
    />
  </label>
  <span id="email-error" role="alert">
    {emailError}
  </span>
</form>

// ❌ WRONG: Missing labels
<input type="email" placeholder="Email" /> // No label!
```

**Form Rules:**
1. Every input must have a label
2. Use `htmlFor` to connect label to input
3. Add validation messages with `aria-describedby`
4. Mark required fields with `required` and `aria-required`
5. Provide clear error messages

### 2.4 Color Contrast

**WCAG AA Requirements:**
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum contrast ratio

```typescript
// ✅ DO: Use sufficient contrast
<p className="text-gray-900 dark:text-gray-100">
  High contrast text
</p>

// ❌ DON'T: Low contrast
<p className="text-gray-400 bg-gray-300">
  Barely visible text
</p>
```

**Testing:**
- Use browser DevTools to check contrast ratios
- Test both light and dark modes

### 2.5 Keyboard Navigation

```typescript
// ✅ DO: Ensure all interactive elements are keyboard accessible
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>

// ✅ DO: Manage focus properly
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// ✅ DO: Add visible focus indicators
// In globals.css
*:focus-visible {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
}

// ❌ DON'T: Remove focus outlines without replacement
button:focus {
  outline: none; // Bad!
}
```

### 2.6 Alt Text for Images

```typescript
// ✅ DO: Descriptive alt text
<Image
  src="/product.jpg"
  alt="Blue cotton t-shirt with round neck"
/>

// ✅ DO: Empty alt for decorative images
<Image
  src="/decorative-line.svg"
  alt=""
/>

// ❌ DON'T: Generic or missing alt text
<Image src="/image.jpg" alt="image" /> // Too generic
<Image src="/photo.jpg" /> // Missing alt
```

### 2.7 Link Accessibility

```typescript
// ✅ DO: Descriptive link text
<a href="/about">Learn more about our company</a>

// ✅ DO: Add context for screen readers
<a href="/report.pdf" aria-label="Download annual report (PDF, 2.5MB)">
  Download Report
</a>

// ❌ DON'T: Generic link text
<a href="/info">Click here</a> // Bad!
<a href="/more">Read more</a> // Unclear what "more" is
```

---

## 🔒 3. BEST PRACTICES (Target: 90-100)

### 3.1 HTTPS and Security

```typescript
// next.config.ts
const config: NextConfig = {
  // Force HTTPS in production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 3.2 Console Errors

**CRITICAL: Zero console errors allowed**

```typescript
// ✅ DO: Handle errors properly
try {
  await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Show user-friendly error message
}

// ✅ DO: Use error boundaries
"use client";

import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// ❌ DON'T: Leave console.log in production
console.log('Debug info'); // Remove before production!
```

### 3.3 Deprecated APIs

**Avoid:**
- `document.write()`
- `window.event`
- Synchronous XMLHttpRequest
- `unload` event handlers
- `document.domain`

```typescript
// ✅ DO: Use modern APIs
// Use fetch instead of XMLHttpRequest
const response = await fetch('/api/data');
const data = await response.json();

// ❌ DON'T: Use deprecated APIs
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false); // Synchronous!
```

### 3.4 Image Aspect Ratios

```typescript
// ✅ DO: Maintain aspect ratio
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Maintains 4:3 ratio"
/>

// ✅ DO: Use fill with aspect ratio
<div className="relative aspect-video">
  <Image src="/video-thumbnail.jpg" fill alt="Video" />
</div>

// ❌ DON'T: Distort images
<img src="/image.jpg" style={{ width: '100%', height: '300px' }} />
```

### 3.5 JavaScript Errors

**Error Prevention:**

```typescript
// ✅ DO: Validate data before use
interface User {
  name: string;
  email: string;
}

function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div>Loading...</div>;
  }

  return <div>{user.name}</div>;
}

// ✅ DO: Handle async errors
async function loadData() {
  try {
    const data = await fetch('/api/data');
    return await data.json();
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

// ❌ DON'T: Assume data exists
function BadComponent({ user }) {
  return <div>{user.name}</div>; // Crashes if user is null!
}
```

---

## 🔍 4. SEO OPTIMIZATION (Target: 90-100)

### 4.1 Meta Tags (CRITICAL)

```typescript
// ✅ CORRECT: Complete metadata
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title - 50-60 characters",
  description: "Page description 150-160 characters...",
  keywords: ["keyword1", "keyword2"],
  authors: [{ name: "Author Name" }],
  openGraph: {
    title: "Page Title",
    description: "Description",
    url: "https://example.com",
    siteName: "Site Name",
    images: [{
      url: "https://example.com/og-image.jpg",
      width: 1200,
      height: 630,
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Description",
    images: ["https://example.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://example.com/page",
  },
};
```

**Metadata Rules:**
1. **Title**: 50-60 characters, unique per page
2. **Description**: 150-160 characters, compelling
3. **Always include Open Graph tags**
4. **Always include Twitter Card tags**
5. **Set canonical URL** for each page
6. **Configure robots meta** appropriately

### 4.2 Heading Hierarchy (CRITICAL FOR SEO)

```typescript
// ✅ PERFECT SEO Structure
export default function BlogPost() {
  return (
    <article>
      <h1>Main Article Title (H1 - Only One Per Page)</h1>

      <section>
        <h2>Introduction (H2)</h2>
        <p>Content...</p>

        <h3>Key Point 1 (H3)</h3>
        <p>Details...</p>

        <h3>Key Point 2 (H3)</h3>
        <p>Details...</p>
      </section>

      <section>
        <h2>Main Content (H2)</h2>
        <p>Content...</p>

        <h3>Subsection (H3)</h3>
        <p>Details...</p>

        <h4>Detailed Point (H4)</h4>
        <p>Specifics...</p>
      </section>

      <section>
        <h2>Conclusion (H2)</h2>
        <p>Summary...</p>
      </section>
    </article>
  );
}
```

**STRICT HEADING RULES:**
1. ✅ **ONE H1 per page** (main page title)
2. ✅ **Never skip levels** (h1→h2→h3, not h1→h3)
3. ✅ **Logical hierarchy** (outline structure)
4. ✅ **Descriptive headings** (not "Section 1")
5. ✅ **Include keywords** naturally
6. ❌ **Never use headings for styling** (use CSS)
7. ❌ **Don't use multiple H1s** (except in distinct articles)

### 4.3 Structured Data (JSON-LD)

```typescript
// ✅ DO: Add structured data
export default function ProductPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Product Name",
    description: "Product description",
    image: "https://example.com/product.jpg",
    offers: {
      "@type": "Offer",
      price: "99.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### 4.4 Links and Navigation

```typescript
// ✅ DO: Descriptive anchor text
<Link href="/about">
  Learn about our company history
</Link>

// ✅ DO: Internal linking structure
<nav aria-label="Main navigation">
  <Link href="/">Home</Link>
  <Link href="/products">Products</Link>
  <Link href="/about">About</Link>
  <Link href="/contact">Contact</Link>
</nav>

// ❌ DON'T: Generic anchor text
<Link href="/page">Click here</Link>
<Link href="/info">More</Link>
```

### 4.5 robots.txt and sitemap.xml

**Already configured in the boilerplate:**
- `/src/app/robots.ts` - Robots.txt generator
- `/src/app/sitemap.ts` - Sitemap generator

```typescript
// Update sitemap.ts when adding new pages
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/products",
    "/contact",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
```

### 4.6 Mobile Friendliness

```typescript
// ✅ DO: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ✅ DO: Touch-friendly targets (minimum 48x48px)
<button className="min-h-[48px] min-w-[48px] p-3">
  Tap me
</button>

// ✅ DO: Prevent horizontal scroll
// In globals.css
html, body {
  overflow-x: hidden;
}
```

---

## 📱 5. PWA OPTIMIZATION (If Applicable)

### 5.1 Web App Manifest

**Already configured in** `/public/site.webmanifest`

```json
{
  "name": "Full App Name",
  "short_name": "App",
  "description": "App description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5.2 Service Worker (Optional)

```typescript
// If implementing PWA, use workbox with Next.js
// Install: npm install next-pwa

// next.config.ts
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});
```

---

## 📋 DEVELOPMENT CHECKLIST

### Before Starting Development

- [ ] Understand the project requirements
- [ ] Plan the heading hierarchy (H1-H6 structure)
- [ ] Plan the component structure
- [ ] Identify images that will be needed
- [ ] Plan route structure

### During Development

**For Every Component:**
- [ ] Use semantic HTML elements
- [ ] Add proper ARIA labels where needed
- [ ] Ensure keyboard navigation works
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Use Next.js Image component for all images
- [ ] Add alt text to all images
- [ ] Validate form inputs
- [ ] Handle loading and error states

**For Every Page:**
- [ ] Add complete metadata (title, description, OG tags)
- [ ] Create proper heading hierarchy (one H1, logical H2-H6)
- [ ] Add canonical URL
- [ ] Include structured data (JSON-LD) where appropriate
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Ensure all links have descriptive text
- [ ] Add page to sitemap.ts
- [ ] Check console for errors

**Performance:**
- [ ] Optimize all images (WebP/AVIF, proper sizes)
- [ ] Use dynamic imports for heavy components
- [ ] Minimize third-party scripts
- [ ] Lazy load below-fold content
- [ ] Use font-display: swap for fonts
- [ ] Check bundle size

### Before Deployment

- [ ] Run Lighthouse audit (all pages)
- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Validate HTML
- [ ] Check for console errors
- [ ] Test on real devices (mobile, tablet)
- [ ] Verify all meta tags
- [ ] Test Open Graph with debugging tools
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics/Tracking

---

## 🔧 TESTING COMMANDS

```bash
# Build and test locally
npm run build
npm start

# Analyze bundle
npm run analyze

# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

## 🌐 LIGHTHOUSE TESTING

### Local Testing
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select all categories
4. Choose "Desktop" or "Mobile"
5. Click "Analyze page load"

### Online Testing
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Measure](https://web.dev/measure/)

### Target Scores
- **Performance**: 90-100
- **Accessibility**: 95-100
- **Best Practices**: 95-100
- **SEO**: 95-100

---

## ⚠️ COMMON MISTAKES TO AVOID

### ❌ DON'T:
1. Skip heading levels (h1 → h3)
2. Use multiple H1 tags on a page
3. Forget alt text on images
4. Use generic link text ("click here")
5. Remove focus outlines without replacement
6. Block robot crawlers unnecessarily
7. Forget to add metadata
8. Use low contrast colors
9. Make touch targets too small (< 48px)
10. Load fonts without font-display: swap
11. Use regular img tags instead of next/image
12. Add inline styles instead of Tailwind classes
13. Leave console errors in code
14. Skip error handling
15. Forget to add loading states

### ✅ DO:
1. Use proper heading hierarchy (h1 → h2 → h3)
2. One H1 per page
3. Add descriptive alt text to all images
4. Use descriptive link text
5. Maintain focus indicators
6. Allow search engine crawling
7. Add complete metadata to every page
8. Use WCAG AA contrast ratios (4.5:1)
9. Make touch targets at least 48x48px
10. Use font-display: swap
11. Use Next.js Image component everywhere
12. Use Tailwind utility classes
13. Handle and log errors properly
14. Add error boundaries
15. Show loading states for async operations

---

## 📚 REFERENCE RESOURCES

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Testing Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Performance Tools
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

---

## 🎯 LIGHTHOUSE SCORE CALCULATION

Understanding what affects each score:

### Performance (Weight: Heavy)
- First Contentful Paint (10%)
- Speed Index (10%)
- Largest Contentful Paint (25%)
- Time to Interactive (10%)
- Total Blocking Time (30%)
- Cumulative Layout Shift (15%)

### Accessibility (Weight: Equal)
- Color contrast
- ARIA attributes
- Form labels
- Image alt text
- Heading hierarchy
- Keyboard navigation

### Best Practices (Weight: Equal)
- HTTPS usage
- Console errors
- Deprecated APIs
- Image aspect ratios
- Security headers

### SEO (Weight: Equal)
- Meta tags
- Crawlability
- Mobile-friendly
- Structured data
- Link text
- Heading hierarchy

---

## ✨ FINAL REMINDERS

1. **Always prioritize user experience** over metrics
2. **Test on real devices**, not just DevTools
3. **Iterate based on Lighthouse feedback**
4. **Keep performance in mind from the start**
5. **Accessibility is not optional**
6. **SEO is built into the architecture**
7. **Monitor performance in production**
8. **Update dependencies regularly**
9. **Follow Next.js best practices**
10. **Document your decisions**

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All Lighthouse scores are 90+
- [ ] No console errors or warnings
- [ ] All images optimized
- [ ] All pages have proper metadata
- [ ] Sitemap is up to date
- [ ] Robots.txt is configured
- [ ] Analytics are set up
- [ ] Error tracking is configured
- [ ] Forms are validated
- [ ] Loading states are implemented
- [ ] Error boundaries are in place
- [ ] Security headers are configured
- [ ] HTTPS is enforced
- [ ] Tested on mobile devices
- [ ] Tested with screen readers
- [ ] Passed accessibility audit

---

**Remember: These are not suggestions, these are requirements for achieving 90+ Lighthouse scores across all categories. Follow them strictly.**
