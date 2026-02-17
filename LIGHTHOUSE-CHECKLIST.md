# ⚡ Lighthouse Optimization Checklist

Quick reference checklist for achieving 90+ scores in all Lighthouse categories.

---

## 🎯 Target Scores
- [ ] Performance: 90-100
- [ ] Accessibility: 90-100
- [ ] Best Practices: 90-100
- [ ] SEO: 90-100
- [ ] PWA: 90-100 (if applicable)

---

## 📄 Per-Page Checklist

### ✅ For Every Page Created

#### Metadata & SEO
- [ ] Unique page title (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] Open Graph tags (title, description, image, url)
- [ ] Twitter Card tags
- [ ] Canonical URL set
- [ ] Keywords defined
- [ ] Robots meta configured
- [ ] Page added to sitemap.ts
- [ ] JSON-LD structured data (if applicable)

#### Heading Hierarchy
- [ ] ONE H1 tag (main page title)
- [ ] Proper H2 tags for main sections
- [ ] H3 tags for subsections (under H2)
- [ ] H4-H6 as needed (nested properly)
- [ ] NO skipped heading levels
- [ ] NO multiple H1 tags
- [ ] Headings are descriptive (not generic)

#### Images
- [ ] All images use Next.js Image component
- [ ] All images have alt text
- [ ] Decorative images have empty alt ("")
- [ ] Above-fold images have priority prop
- [ ] Below-fold images have loading="lazy"
- [ ] Width and height specified
- [ ] Images are WebP or AVIF format
- [ ] Images are properly sized (not oversized)
- [ ] Responsive image sizes defined

#### Accessibility
- [ ] Semantic HTML used (nav, main, article, section)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum (AA standard)
- [ ] All forms have labels
- [ ] Form errors have aria-describedby
- [ ] Required fields marked properly
- [ ] ARIA labels on icon buttons
- [ ] Page tested with Tab key navigation
- [ ] Page tested with screen reader

#### Performance
- [ ] No console errors
- [ ] No console warnings
- [ ] Heavy components use dynamic import
- [ ] Third-party scripts use next/script
- [ ] Fonts use display: swap
- [ ] No layout shifts during load
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Async operations have error handling

#### Links & Navigation
- [ ] All links have descriptive text
- [ ] No "click here" or "read more" without context
- [ ] External links have rel="noopener noreferrer"
- [ ] Download links indicate file type and size
- [ ] Navigation is keyboard accessible
- [ ] Active page indicated in navigation

---

## 🎨 Component Checklist

### ✅ For Every Component

#### Accessibility
- [ ] Uses semantic HTML
- [ ] Interactive elements are keyboard accessible
- [ ] Has proper ARIA labels (if needed)
- [ ] Color contrast meets AA standard
- [ ] Touch targets are 48x48px minimum
- [ ] Focus management is correct
- [ ] No accessibility violations

#### Performance
- [ ] No unnecessary re-renders
- [ ] Heavy dependencies dynamically imported
- [ ] Images optimized
- [ ] No inline styles (use Tailwind)
- [ ] Memoized when appropriate

#### Code Quality
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Null/undefined checks
- [ ] No console.log statements
- [ ] No TypeScript errors

---

## 🖼️ Image Optimization Checklist

### ✅ For Every Image

```typescript
// Template
<Image
  src="/image.jpg"
  alt="Descriptive alternative text"
  width={800}
  height={600}
  priority={isAboveFold}
  loading={isAboveFold ? undefined : "lazy"}
  placeholder="blur" // if static import
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

- [ ] Using next/image component
- [ ] Alt text is descriptive
- [ ] Width and height specified
- [ ] Priority set for above-fold images
- [ ] Lazy loading for below-fold images
- [ ] Proper sizes attribute for responsive images
- [ ] Format is WebP or AVIF
- [ ] File size is optimized

---

## 📝 Form Accessibility Checklist

### ✅ For Every Form

```typescript
// Template
<form onSubmit={handleSubmit}>
  <label htmlFor="fieldId">
    Field Label
    <input
      id="fieldId"
      type="text"
      name="fieldName"
      required
      aria-required="true"
      aria-describedby="fieldId-error"
      aria-invalid={hasError}
    />
  </label>
  <span id="fieldId-error" role="alert">
    {errorMessage}
  </span>
</form>
```

- [ ] Every input has a label
- [ ] Label uses htmlFor with input id
- [ ] Required fields marked with required
- [ ] Required fields have aria-required="true"
- [ ] Error messages use aria-describedby
- [ ] Error fields have aria-invalid
- [ ] Error messages have role="alert"
- [ ] Success messages shown clearly
- [ ] Form validates before submit
- [ ] Loading state during submission
- [ ] Keyboard navigation works

---

## 🎯 Heading Hierarchy Checker

### ✅ Validate Structure

```
✅ CORRECT:
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>
      <h4>Detail 2.1.1</h4>

❌ WRONG:
<h1>Page Title</h1>
  <h3>Section 1</h3>  // Skipped h2!
  <h1>Section 2</h1>  // Multiple h1!
```

- [ ] Only ONE H1 on page
- [ ] H1 is the main page title
- [ ] H2 tags follow H1
- [ ] H3 tags follow H2
- [ ] No skipped levels
- [ ] Logical outline structure
- [ ] Headings describe content

---

## 🚀 Performance Optimization Checklist

### Core Web Vitals

#### LCP (Largest Contentful Paint) < 2.5s
- [ ] Hero images use priority
- [ ] Images are optimized
- [ ] Fonts load with display: swap
- [ ] Above-fold content loads first
- [ ] No render-blocking resources

#### FID (First Input Delay) < 100ms
- [ ] JavaScript is minimized
- [ ] Heavy scripts use dynamic import
- [ ] Third-party scripts defer
- [ ] No long-running tasks

#### CLS (Cumulative Layout Shift) < 0.1
- [ ] Image dimensions specified
- [ ] Font loading doesn't shift layout
- [ ] Ads/embeds have reserved space
- [ ] No content inserted above existing
- [ ] Skeleton screens for dynamic content

---

## 🔒 Security & Best Practices

### ✅ Security Headers
- [ ] HTTPS enforced
- [ ] Strict-Transport-Security header
- [ ] X-Frame-Options header
- [ ] X-Content-Type-Options header
- [ ] Referrer-Policy header
- [ ] Content-Security-Policy (if needed)

### ✅ Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No deprecated APIs
- [ ] Error boundaries implemented
- [ ] Graceful error handling
- [ ] TypeScript strict mode
- [ ] ESLint passes
- [ ] No unused dependencies

---

## 📱 Responsive Design Checklist

### ✅ Breakpoints Tested
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Large Desktop (> 1536px)

### ✅ Mobile Optimization
- [ ] Touch targets 48x48px minimum
- [ ] Text is readable (16px minimum)
- [ ] No horizontal scroll
- [ ] Viewport meta tag set
- [ ] Mobile menu accessible
- [ ] Forms are mobile-friendly
- [ ] Images scale properly

---

## 🧪 Testing Checklist

### Before Commit
- [ ] Build succeeds (npm run build)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors in browser
- [ ] Tested in Chrome
- [ ] Tested in Safari (if on Mac)
- [ ] Tested on mobile device

### Before Deploy
- [ ] All pages Lighthouse score 90+
- [ ] Tested with screen reader
- [ ] Keyboard navigation works
- [ ] All forms validate properly
- [ ] All links work
- [ ] All images load
- [ ] Meta tags correct
- [ ] Open Graph preview correct
- [ ] Twitter Card preview correct
- [ ] Sitemap.xml accessible
- [ ] Robots.txt accessible
- [ ] Favicon loads
- [ ] Web manifest valid

---

## 🛠️ Quick Fixes for Common Issues

### Low Performance Score
1. Check image sizes (use next/image)
2. Check bundle size (npm run analyze)
3. Remove unused dependencies
4. Add dynamic imports for heavy components
5. Enable font-display: swap
6. Remove render-blocking scripts

### Low Accessibility Score
1. Check heading hierarchy (h1→h2→h3)
2. Add alt text to images
3. Add labels to form inputs
4. Check color contrast
5. Add ARIA labels to icon buttons
6. Test keyboard navigation

### Low SEO Score
1. Add meta description
2. Add page title
3. Fix heading hierarchy
4. Add canonical URL
5. Update sitemap
6. Check robots.txt

### Low Best Practices Score
1. Fix console errors
2. Remove deprecated APIs
3. Add security headers
4. Use HTTPS
5. Fix image aspect ratios
6. Remove inline event handlers

---

## 📊 Lighthouse Testing

### Local Testing
```bash
# Build for production
npm run build

# Start production server
npm start

# Open Chrome DevTools > Lighthouse
# Select all categories
# Click "Generate report"
```

### Online Testing
- PageSpeed Insights: https://pagespeed.web.dev/
- Web.dev Measure: https://web.dev/measure/

### Target Metrics
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Speed Index**: < 3.4s
- **TTI**: < 3.8s
- **TBT**: < 200ms

---

## 🎓 Quick Reference

### Heading Hierarchy
```
Page has ONE <h1>
Sections use <h2>
Subsections use <h3>
Never skip levels!
```

### Image Component
```typescript
import Image from "next/image";
<Image src alt width height priority? loading? />
```

### Metadata
```typescript
export const metadata: Metadata = {
  title, description, openGraph, twitter, robots
};
```

### Accessibility
```typescript
<button aria-label="...">
<input id="..." aria-describedby="...">
<label htmlFor="...">
```

---

## ✅ Final Verification

Before marking as complete:
- [ ] All Lighthouse scores 90+
- [ ] No console errors
- [ ] All images optimized
- [ ] All pages have metadata
- [ ] Heading hierarchy correct
- [ ] Forms accessible
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] Tested on real devices
- [ ] SEO tags correct
- [ ] Performance optimized

---

**Print this checklist and check items as you develop!**
