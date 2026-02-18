import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";
import { getServices, getProjects, getProducts, getPosts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { route: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { route: "", priority: 1, freq: "daily" },
    { route: "/about", priority: 0.9, freq: "monthly" },
    { route: "/services", priority: 0.9, freq: "weekly" },
    { route: "/projects", priority: 0.8, freq: "weekly" },
    { route: "/pricing", priority: 0.8, freq: "weekly" },
    { route: "/blog", priority: 0.8, freq: "daily" },
    { route: "/store", priority: 0.8, freq: "weekly" },
    { route: "/contact", priority: 0.7, freq: "monthly" },
    { route: "/appointments", priority: 0.7, freq: "monthly" },
  ];

  const staticEntries = staticRoutes.map(({ route, priority, freq }) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: freq,
    priority,
  }));

  const [services, projectsResult, productsResult, postsResult] =
    await Promise.all([
      getServices().catch(() => []),
      getProjects(1, 100).catch(() => null),
      getProducts(1, 100).catch(() => null),
      getPosts(1, 100).catch(() => null),
    ]);

  const serviceRoutes = services.map((s) => ({
    url: `${siteConfig.url}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const projectRoutes = (projectsResult?.data ?? []).map((p) => ({
    url: `${siteConfig.url}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const productRoutes = (productsResult?.data ?? []).map((p) => ({
    url: `${siteConfig.url}/store/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const postRoutes = (postsResult?.data ?? []).map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...serviceRoutes,
    ...projectRoutes,
    ...productRoutes,
    ...postRoutes,
  ];
}
