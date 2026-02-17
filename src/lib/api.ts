import { cookies } from "next/headers";
import type {
  ApiResponse,
  PaginatedResult,
  Skill,
  Experience,
  Service,
  Project,
  Product,
  Review,
  Post,
  Category,
  Testimonial,
  FAQ,
  TrustedCompany,
  SiteSetting,
  DashboardOverview,
  ProjectWithMilestones,
  Order,
  Appointment,
  UserProfile,
} from "@/types/api";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

/**
 * Server-side fetch wrapper.
 * - Runs on the server only (no NEXT_PUBLIC_ prefix on API_URL).
 * - Uses Next.js `fetch` with configurable revalidation.
 * - Unwraps the `{ success, data }` envelope automatically.
 */
async function fetcher<T>(
  path: string,
  options?: { revalidate?: number | false; tags?: string[] },
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: {
      revalidate: options?.revalidate ?? 300, // 5 min default
      tags: options?.tags,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

/**
 * Authenticated server-side fetch wrapper.
 * - Reads accessToken from httpOnly cookie.
 * - Injects Authorization: Bearer header.
 * - No caching by default (user-specific data).
 */
async function authFetcher<T>(
  path: string,
  options?: { revalidate?: number | false; tags?: string[] },
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

/* ─── Public data fetchers (server components only) ─── */

export function getSkills() {
  return fetcher<Skill[]>("/skills", {
    revalidate: 3600,
    tags: ["skills"],
  });
}

export function getExperiences() {
  return fetcher<Experience[]>("/experiences", {
    revalidate: 3600,
    tags: ["experiences"],
  });
}

export function getServices() {
  return fetcher<Service[]>("/services", {
    revalidate: 3600,
    tags: ["services"],
  });
}

export function getProjects(page = 1, limit = 6) {
  return fetcher<PaginatedResult<Project>>(
    `/projects?page=${page}&limit=${limit}`,
    { revalidate: 600, tags: ["projects"] },
  );
}

export function getProducts(page = 1, limit = 6) {
  return fetcher<PaginatedResult<Product>>(
    `/products?page=${page}&limit=${limit}`,
    { revalidate: 600, tags: ["products"] },
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    return await fetcher<Product>(`/products/slug/${slug}`, {
      revalidate: 600,
      tags: ["products"],
    });
  } catch {
    return null;
  }
}

export function getProductReviews(productId: string, page = 1, limit = 20) {
  return fetcher<PaginatedResult<Review>>(
    `/reviews/product/${productId}?page=${page}&limit=${limit}`,
    { revalidate: 300, tags: ["reviews"] },
  );
}

export function getPosts(page = 1, limit = 3) {
  return fetcher<PaginatedResult<Post>>(
    `/blog/posts?page=${page}&limit=${limit}`,
    { revalidate: 300, tags: ["posts"] },
  );
}

export async function getFilteredPosts(
  page = 1,
  limit = 9,
  category?: string,
) {
  // Backend only supports page/limit — fetch more then filter client-side
  const fetchLimit = category ? 100 : limit;
  const result = await fetcher<PaginatedResult<Post>>(
    `/blog/posts?page=${category ? 1 : page}&limit=${fetchLimit}`,
    { revalidate: 300, tags: ["posts"] },
  );

  if (!category) return result;

  // Client-side category filtering
  const filtered = result.data.filter((post) =>
    post.categories?.some(({ category: cat }) => cat.slug === category),
  );

  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    data: paged,
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await fetcher<Post>(`/blog/posts/slug/${slug}`, {
      revalidate: 300,
      tags: ["posts"],
    });
  } catch {
    return null;
  }
}

export async function getCategories() {
  const result = await fetcher<PaginatedResult<Category>>(
    "/blog/categories",
    { revalidate: 3600, tags: ["categories"] },
  );
  return result.data;
}

export function getTestimonials(page = 1, limit = 10) {
  return fetcher<PaginatedResult<Testimonial>>(
    `/testimonials?page=${page}&limit=${limit}`,
    { revalidate: 1800, tags: ["testimonials"] },
  );
}

export function getFAQs() {
  return fetcher<FAQ[]>("/faq", {
    revalidate: 3600,
    tags: ["faq"],
  });
}

export function getTrustedCompanies() {
  return fetcher<TrustedCompany[]>("/trusted-companies", {
    revalidate: 3600,
    tags: ["trusted-companies"],
  });
}

export function getFeaturedTestimonial() {
  return fetcher<Testimonial | null>("/testimonials/featured", {
    revalidate: 1800,
    tags: ["testimonials"],
  });
}

export function getSettings() {
  return fetcher<SiteSetting[]>("/settings", {
    revalidate: 3600,
    tags: ["settings"],
  });
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectWithMilestones | null> {
  try {
    const all = await fetcher<PaginatedResult<Project>>(
      `/projects?limit=100`,
      { revalidate: 600, tags: ["projects"] },
    );
    const match = all.data.find((p) => p.slug === slug);
    if (!match) return null;

    return await fetcher<ProjectWithMilestones>(`/projects/${match.id}`, {
      revalidate: 600,
      tags: ["projects"],
    });
  } catch {
    return null;
  }
}

/* ─── Portal data fetchers (authenticated, server components) ─── */

export function getClientDashboard() {
  return authFetcher<DashboardOverview>("/client/dashboard", {
    tags: ["portal-dashboard"],
  });
}

export function getMyProjects(page = 1, limit = 12) {
  return authFetcher<PaginatedResult<ProjectWithMilestones>>(
    `/projects/mine?page=${page}&limit=${limit}`,
    { tags: ["portal-projects"] },
  );
}

export function getMyProject(id: string) {
  return authFetcher<ProjectWithMilestones>(`/projects/mine/${id}`, {
    tags: ["portal-projects"],
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    return await authFetcher<Order>(`/orders/${id}`, {
      tags: ["portal-orders"],
    });
  } catch {
    return null;
  }
}

export function getMyOrders(page = 1, limit = 12) {
  return authFetcher<PaginatedResult<Order>>(
    `/orders?page=${page}&limit=${limit}`,
    { tags: ["portal-orders"] },
  );
}

export function getMyAppointments(page = 1, limit = 12) {
  return authFetcher<PaginatedResult<Appointment>>(
    `/appointments/mine?page=${page}&limit=${limit}`,
    { tags: ["portal-appointments"] },
  );
}

export function getMyProfile() {
  return authFetcher<UserProfile>("/users/profile", {
    tags: ["portal-profile"],
  });
}
