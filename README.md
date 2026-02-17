# Next.js Boilerplate - Production Ready

A modern, production-ready Next.js boilerplate with **Lighthouse-optimized** architecture, comprehensive SEO configuration, and AI-assisted development guidelines.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🎯 Lighthouse Scores (Target)

This boilerplate is designed to achieve **90+ scores** in all Lighthouse categories:

- ✅ **Performance**: 90-100
- ✅ **Accessibility**: 90-100
- ✅ **Best Practices**: 90-100
- ✅ **SEO**: 90-100
- ✅ **PWA**: 90-100 (if enabled)

## 📁 Project Structure

```
├── src/
│   ├── app/                      # App Router
│   │   ├── (public)/            # Public route group
│   │   │   ├── layout.tsx       # Public layout
│   │   │   └── page.tsx         # Homepage
│   │   ├── layout.tsx           # Root layout with SEO
│   │   ├── globals.css          # Global styles
│   │   ├── robots.ts            # Robots.txt generator
│   │   ├── sitemap.ts           # Sitemap.xml generator
│   │   └── opengraph-image.tsx  # OG image generator
│   ├── components/
│   │   └── seo/
│   │       └── json-ld.tsx      # Structured data components
│   ├── config/
│   │   └── seo.ts               # SEO configuration
│   └── lib/
│       └── metadata.ts          # Metadata utilities
├── public/
│   └── site.webmanifest         # PWA manifest
├── AI-DEVELOPMENT-INSTRUCTIONS.md  # AI development guide
├── LIGHTHOUSE-CHECKLIST.md      # Quick reference checklist
├── SEO-CONFIG.md                # SEO setup guide
└── README.md                    # This file
```

## 🚀 Features

### Core Technologies
- **Next.js 16.1.1** - Latest version with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Professional animations
- **ESLint** - Code quality enforcement
- **Turbopack** - Fast bundler (default)

### SEO & Performance
- ✅ Complete metadata configuration
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ JSON-LD structured data
- ✅ Dynamic sitemap.xml
- ✅ Dynamic robots.txt
- ✅ Dynamic OG image generation
- ✅ Image optimization with next/image
- ✅ Font optimization with display: swap

### Architecture
- ✅ App Router with route groups
- ✅ Src directory structure
- ✅ Import aliases (@/*)
- ✅ Component organization
- ✅ Configuration centralization

### Accessibility
- ✅ Semantic HTML structure
- ✅ WCAG AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus management

## 📚 Documentation

### For Developers
- **[AI-DEVELOPMENT-INSTRUCTIONS.md](./AI-DEVELOPMENT-INSTRUCTIONS.md)** - Comprehensive guide for AI assistants to build Lighthouse-optimized websites. Covers performance, accessibility, SEO, and best practices.

- **[LIGHTHOUSE-CHECKLIST.md](./LIGHTHOUSE-CHECKLIST.md)** - Quick reference checklist for every page and component. Print this and keep it handy during development.

- **[SEO-CONFIG.md](./SEO-CONFIG.md)** - Complete SEO configuration guide. Learn how to customize metadata, structured data, and search engine optimization.

### Key Concepts

#### Heading Hierarchy (CRITICAL)
Every page MUST follow proper heading hierarchy:
```tsx
<h1>Page Title</h1>          // ONE per page
<h2>Main Section</h2>         // Main sections
<h3>Subsection</h3>           // Under h2
<h4>Detail</h4>               // Under h3
// Never skip levels!
```

#### Image Optimization
Always use Next.js Image component:
```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Descriptive text"
  width={800}
  height={600}
  priority // For above-fold images
  loading="lazy" // For below-fold images
/>
```

#### Metadata Template
Every page should have complete metadata:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: { /* ... */ },
  twitter: { /* ... */ },
};
```

## 🛠️ Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🎨 Customization

### 1. Update SEO Configuration

Edit `src/config/seo.ts`:

```typescript
export const siteConfig = {
  name: "Your Site Name",
  description: "Your site description",
  url: "https://yourdomain.com",
  // ... update all fields
};
```

### 2. Add New Pages

```bash
# Create a new page in the public route group
src/app/(public)/about/page.tsx
```

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our company",
};

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      {/* Content */}
    </div>
  );
}
```

### 3. Update Sitemap

Add new routes to `src/app/sitemap.ts`:

```typescript
const routes = [
  "",
  "/about",    // Add your new route
  "/contact",  // Add your new route
].map((route) => ({
  // ... configuration
}));
```

## 🧪 Testing

### Lighthouse Testing

```bash
# 1. Build for production
npm run build

# 2. Start production server
npm start

# 3. Open Chrome DevTools
# 4. Go to Lighthouse tab
# 5. Select all categories
# 6. Click "Generate report"
```

### Online Testing Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Measure](https://web.dev/measure/)
- [Open Graph Debugger](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 📊 Performance Metrics

Target Core Web Vitals:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTI** (Time to Interactive): < 3.8s

## ♿ Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast WCAG AA compliant
- Form labels and validation
- Alt text on all images

## 🔍 SEO Features

- Complete metadata on all pages
- Open Graph tags for social sharing
- Twitter Card optimization
- JSON-LD structured data
- Dynamic sitemap.xml
- Robots.txt configuration
- Canonical URLs
- Mobile-friendly design
- Fast page loads

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- Google Cloud Platform
- Railway

### Before Deployment Checklist
- [ ] All Lighthouse scores 90+
- [ ] Updated `siteConfig.url` in `src/config/seo.ts`
- [ ] Added Google Search Console verification
- [ ] Configured environment variables
- [ ] Tested on mobile devices
- [ ] No console errors
- [ ] All images optimized

## 🤖 AI Development

This boilerplate includes comprehensive AI development instructions. When using AI assistants (like Claude, GPT-4, etc.), refer them to:

**[AI-DEVELOPMENT-INSTRUCTIONS.md](./AI-DEVELOPMENT-INSTRUCTIONS.md)**

This file contains:
- Lighthouse optimization guidelines
- Performance best practices
- Accessibility requirements
- SEO implementation rules
- Code examples and patterns
- Common mistakes to avoid

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Web Performance
- [Web.dev](https://web.dev/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Core Web Vitals](https://web.dev/vitals/)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors
```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Low Lighthouse Scores
1. Check [LIGHTHOUSE-CHECKLIST.md](./LIGHTHOUSE-CHECKLIST.md)
2. Run local Lighthouse audit
3. Review [AI-DEVELOPMENT-INSTRUCTIONS.md](./AI-DEVELOPMENT-INSTRUCTIONS.md)
4. Verify image optimization
5. Check heading hierarchy
6. Validate metadata

## 📄 License

MIT License - feel free to use this boilerplate for any project.

## 🙏 Credits

Built with best practices from:
- Next.js Team
- Vercel
- Google Lighthouse Team
- Web Performance Working Group
- W3C Accessibility Guidelines

---

**Ready to build lightning-fast, accessible, SEO-optimized web applications? Start coding!** 🚀
