export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    consents: ["auth", "me", "consents"] as const,
    consentsStatus: ["auth", "me", "consents", "status"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (page: number, limit: number) => ["products", "list", page, limit] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    detailBySlug: (slug: string) => ["products", "detail-slug", slug] as const,
    availability: (id: string, geo?: { lat: number; lng: number; radiusKm?: number }) =>
      geo
        ? ([
            "products",
            "availability",
            id,
            Number(geo.lat.toFixed(3)),
            Number(geo.lng.toFixed(3)),
            geo.radiusKm ?? 0,
          ] as const)
        : (["products", "availability", id] as const),
    search: (body: unknown) => ["products", "search", body] as const,
  },
  pharmacies: {
    all: ["pharmacies"] as const,
    list: (page: number, limit: number) => ["pharmacies", "list", page, limit] as const,
    detail: (id: string) => ["pharmacies", "detail", id] as const,
    detailBySlug: (slug: string) => ["pharmacies", "detail-slug", slug] as const,
    inventory: (id: string) => ["pharmacies", "inventory", id] as const,
    nearby: (lat: number, lng: number, radiusKm: number) =>
      ["pharmacies", "nearby", lat, lng, radiusKm] as const,
  },
  prices: {
    alternatives: (productId: string, limit: number) =>
      ["prices", "alternatives", productId, limit] as const,
  },
  cart: {
    current: ["cart", "current"] as const,
  },
  legal: {
    types: ["legal", "types"] as const,
    current: (typeCode: string, locale?: string) =>
      ["legal", "current", typeCode, locale ?? "es-PE"] as const,
    version: (typeCode: string, version: string, locale?: string) =>
      ["legal", "version", typeCode, version, locale ?? "es-PE"] as const,
    versions: (typeCode: string, locale?: string) =>
      ["legal", "versions", typeCode, locale ?? "es-PE"] as const,
  },
} as const;
