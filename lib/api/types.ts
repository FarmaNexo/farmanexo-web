export type MensajeTipo = "information" | "warning" | "error" | "success";

export interface Mensaje {
  codigo: string;
  mensaje: string;
  tipo: MensajeTipo;
}

export interface Meta {
  mensajes: Mensaje[];
  idTransaccion: string;
  resultado: boolean;
  timestamp: string;
}

export interface ApiResponse<T> {
  meta: Meta;
  datos: T;
}

export interface LoginResponseDTO {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface RegisterResponseDTO {
  user_id: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ProfileResponseDTO {
  user_id: string;
  email?: string;
  role: string;
  full_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
}

// ---------- LPDP consents (Ley 29733) ----------

export type ConsentType =
  | "terms_of_service"
  | "privacy_policy"
  | "marketing_communications";

export interface ConsentItem {
  id: string;
  consent_type: ConsentType;
  document_version: string;
  accepted: boolean;
  accepted_at: string;
  withdrawn_at?: string;
  is_active: boolean;
}

export interface ConsentsListResponse {
  consents: ConsentItem[];
  total: number;
}

export interface PendingConsent {
  consent_type: ConsentType;
  current_accepted_version?: string;
  required_version: string;
}

export interface ConsentsStatusResponse {
  up_to_date: boolean;
  pending: PendingConsent[];
}

export interface AcceptConsentsRequest {
  consent_types: ConsentType[];
}

// ---------- Catalog (products / categories / brands) ----------

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active_ingredient?: string;
  presentation?: string;
  concentration?: string;
  form?: string;
  registry_number?: string;
  manufacturer?: string;
  source_product_code?: number;
  requires_prescription: boolean;
  sku?: string;
  barcode?: string;
  category_id?: string;
  brand_id?: string;
  images?: ProductImage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

export interface ProductAvailabilityItem {
  pharmacy_id: string;
  pharmacy_slug?: string;
  pharmacy_name: string;
  /** Distrito de la farmacia (HU-013 datos mínimos). */
  pharmacy_district?: string;
  /** Dirección de calle de la farmacia. */
  pharmacy_address?: string;
  price: number;
  stock: number;
  is_available: boolean;
  distance_km?: number;
  /**
   * HU-016 — Alerta de diferencia excesiva de precios.
   * `district_avg_price`: promedio del producto en el mismo distrito (referencia educativa).
   * `is_overpriced`: true si el precio supera 30% sobre el promedio del distrito y el
   *   distrito tiene al menos 3 farmacias con el producto. Calculado en pharmacy-service.
   * `overprice_pct`: cuánto encima del promedio (ej. 0.45 = 45%). Solo presente si is_overpriced.
   */
  district_avg_price?: number;
  is_overpriced?: boolean;
  overprice_pct?: number;
}

export interface ProductAvailabilityResponse {
  product_id: string;
  product_name: string;
  pharmacies: ProductAvailabilityItem[];
  total_pharmacies: number;
}

export interface SearchProductsRequest {
  query?: string;
  category_id?: string;
  brand_id?: string;
  requires_prescription?: boolean;
  page?: number;
  limit?: number;
}

// ---------- Pharmacy ----------

export interface Pharmacy {
  id: string;
  owner_user_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  source_pharmacy_code?: string;
  ruc?: string;
  technical_director?: string;
  hours_raw?: string;
  chain_id?: string;
  chain_name?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_active: boolean;
  is_24h: boolean;
  distance_km?: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPharmacies {
  pharmacies: Pharmacy[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PharmacyInventoryItem {
  id: string;
  pharmacy_id: string;
  product_id: string;
  stock: number;
  price: number;
  is_available: boolean;
  updated_at: string;
}

export interface PharmacyInventoryResponse {
  items: PharmacyInventoryItem[];
  total: number;
}

export interface NearbyPharmaciesResponse {
  pharmacies: Pharmacy[];
  total: number;
  radius_km: number;
}

export interface PharmacyHoursItem {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

export interface NearbyRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}

// =============================================================
// LEGAL DOCUMENTS
// =============================================================

export interface LegalDocumentType {
  code: string;
  name: string;
  description?: string;
  is_required: boolean;
  display_order: number;
}

export interface LegalDocumentTypesResponse {
  types: LegalDocumentType[];
}

export type LegalDocumentStatus =
  | "draft"
  | "in_review"
  | "published"
  | "archived"
  | "withdrawn";

export type LegalChangeSeverity = "minor" | "major" | "critical";

export interface LegalDocument {
  id: string;
  type_code: string;
  type_name: string;
  version: string;
  locale: string;
  jurisdiction: string;
  title: string;
  summary?: string;
  content_markdown: string;
  content_hash: string;
  changelog?: string;
  change_severity?: LegalChangeSeverity;
  status: LegalDocumentStatus;
  effective_date?: string;
  published_at?: string;
}

export interface LegalDocumentVersion {
  version: string;
  locale: string;
  status: LegalDocumentStatus;
  change_severity?: LegalChangeSeverity;
  summary?: string;
  effective_date?: string;
  published_at?: string;
  archived_at?: string;
}

export interface LegalDocumentVersionsResponse {
  type_code: string;
  versions: LegalDocumentVersion[];
}

// =============================================================
// THERAPEUTIC ALTERNATIVES (HU-015)
// =============================================================

export interface ProductAlternative {
  product_id: string;
  product_name: string;
  product_slug?: string;
  is_generic: boolean;
  manufacturer?: string;
  presentation?: string;
  avg_price: number;
  pharmacies_count: number;
  /** Porcentaje de ahorro vs el producto base. Positivo = más barato; negativo = más caro. */
  savings_percentage: number;
}

export interface ProductAlternativesResponse {
  base_product_id: string;
  base_product_name: string;
  base_avg_price: number;
  active_ingredient: string;
  alternatives: ProductAlternative[];
  total: number;
}

// ============================================================
// Cart / Orders (order-service)
// ============================================================

export interface CartItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  pharmacy_id: string;
  pharmacy_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  stock_available: number;
}

export interface PharmacyGroupResponse {
  pharmacy_id: string;
  pharmacy_name: string;
  items: CartItemResponse[];
  subtotal: number;
}

export interface CartResponse {
  user_id: string;
  items: CartItemResponse[];
  grouped_by_pharmacy: PharmacyGroupResponse[];
  total_items: number;
  total_amount: number;
  updated_at: string;
}

export interface AddCartItemRequest {
  product_id: string;
  pharmacy_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
