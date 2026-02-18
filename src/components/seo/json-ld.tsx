import { siteConfig } from "@/config/seo";
import type { Post, Service, Product, Project, Review } from "@/types/api";

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: "en-US",
    publisher: {
      "@type": "Person",
      name: siteConfig.creator.name,
      url: siteConfig.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    founder: {
      "@type": "Person",
      name: siteConfig.creator.name,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${siteConfig.url}/contact`,
      availableLanguage: "English",
    },
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.linkedin,
      siteConfig.links.facebook,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BlogArticleJsonLd({ post }: { post: Post }) {
  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : siteConfig.creator.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ServiceJsonLd({ service }: { service: Service }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description ?? service.tagline,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Worldwide",
    serviceType: service.categoryLabel ?? service.category,
    ...(service.price
      ? {
          offers: {
            "@type": "Offer",
            price: Number(service.price),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    url: `${siteConfig.url}/services/${service.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProductJsonLd({
  product,
  reviews,
}: {
  product: Product;
  reviews?: Review[];
}) {
  const price = product.salePrice ?? product.price;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${siteConfig.url}/store/${product.slug}`,
    ...(product.thumbnailUrl ? { image: product.thumbnailUrl } : {}),
    brand: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      price: Number(price),
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/store/${product.slug}`,
    },
  };

  if (product.totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating),
      reviewCount: product.totalReviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews && reviews.length > 0) {
    jsonLd.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: {
        "@type": "Person",
        name: [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || "Anonymous",
      },
      ...(r.comment ? { reviewBody: r.comment } : {}),
      datePublished: r.createdAt,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProjectJsonLd({ project }: { project: Project }) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description ?? project.tagline,
    url: `${siteConfig.url}/projects/${project.slug}`,
    ...(project.featuredImage ? { image: project.featuredImage } : {}),
    creator: {
      "@type": "Person",
      name: siteConfig.creator.name,
      url: siteConfig.url,
    },
    ...(project.startDate ? { dateCreated: project.startDate } : {}),
    ...(project.endDate ? { datePublished: project.endDate } : {}),
    ...(project.technologies.length > 0
      ? { keywords: project.technologies.join(", ") }
      : {}),
    ...(project.liveUrl ? { mainEntityOfPage: project.liveUrl } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.creator.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/hero.png`,
    jobTitle: "Full-Stack Software Engineer",
    description:
      "Software engineer from Bangladesh specializing in full-stack web development, SaaS platforms, and e-commerce solutions.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.linkedin,
      siteConfig.links.facebook,
    ],
    knowsAbout: [
      "Web Development",
      "Full-Stack Development",
      "Next.js",
      "React",
      "Node.js",
      "TypeScript",
      "E-Commerce",
      "SaaS",
      "PostgreSQL",
      "NestJS",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProfilePageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: siteConfig.creator.name,
      url: siteConfig.url,
      image: `${siteConfig.url}/hero.png`,
      jobTitle: "Full-Stack Software Engineer",
      sameAs: [
        siteConfig.links.github,
        siteConfig.links.linkedin,
        siteConfig.links.facebook,
      ],
    },
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
