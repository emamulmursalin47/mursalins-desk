import type { Service, ServiceCategory, ServiceTier } from "@/types/api";

const TIER_ORDER: Record<ServiceTier, number> = {
  STARTER: 0,
  PROFESSIONAL: 1,
  ENTERPRISE: 2,
};

/** Group flat services array into categories with sorted tiers */
export function groupServicesByCategory(
  services: Service[],
): ServiceCategory[] {
  const map = new Map<string, ServiceCategory>();

  for (const service of services) {
    if (!service.category) continue;

    if (!map.has(service.category)) {
      map.set(service.category, {
        category: service.category,
        categoryLabel: service.categoryLabel ?? service.category,
        tiers: [],
      });
    }
    map.get(service.category)!.tiers.push(service);
  }

  // Sort tiers within each category
  for (const group of map.values()) {
    group.tiers.sort(
      (a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99),
    );
  }

  return Array.from(map.values());
}

/** Get the lowest price across a set of tiers */
export function getLowestPrice(tiers: Service[]): number | null {
  const prices = tiers
    .map((t) => (t.price ? Number(t.price) : null))
    .filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}
