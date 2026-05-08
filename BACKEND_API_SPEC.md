# FarmaNexo — Contrato Backend ↔ Frontend

> **Última actualización:** 2026-04-13
> **Estado:** documento vivo. Refleja lo que el api-gateway Go realmente expone hoy.

Este documento describe la API real consumida desde el frontend Next.js. Sustituye por completo al spec aspiracional anterior.

---

## 1. Topología

```
Browser (Next.js :3000)
        │
        ▼
Route Handlers BFF  (Next.js /app/api/*)   ← único punto de contacto desde el browser
        │            httpOnly cookies
        ▼
api-gateway (Go, :8080)                    ← JWT + rate limit + circuit breaker
        │            Authorization: Bearer
        ▼
Microservicios:
  • auth-service     :4001
  • user-service     :4002
  • catalog-service  :4003
  • pharmacy-service :4004
  • price-service    :4005
  • order-service    :4011
```

**El browser nunca llama al gateway directamente.** Todas las llamadas pasan por Next.js Route Handlers (same-origin). Esto elimina CORS, mantiene los tokens en cookies httpOnly (inmunes a XSS) y permite agregar política central de auth/logging/caching en un solo lugar.

---

## 2. Envelope estándar (ApiResponse[T])

Todas las respuestas del gateway siguen este formato:

```json
{
  "meta": {
    "mensajes": [
      { "codigo": "SUC_001", "mensaje": "Operación exitosa", "tipo": "success" }
    ],
    "idTransaccion": "uuid-v4",
    "resultado": true,
    "timestamp": "20260413 154523"
  },
  "datos": { /* payload de tipo T */ }
}
```

`tipo` ∈ `"information" | "warning" | "error" | "success"`.
`resultado: false` indica error de negocio.

### Errores comunes

| HTTP | Código ejemplo | Cuándo |
|---|---|---|
| 400 | `VAL_001` | Body inválido |
| 401 | `ERR_UNAUTHENTICATED` | Token ausente, expirado, o blacklisteado |
| 403 | `ERR_FORBIDDEN` | Rol insuficiente |
| 404 | `ERR_NOT_FOUND` | Recurso inexistente |
| 429 | `RATE_LIMIT` | Excedió rate limit (login: 5/15min, refresh: 10/1h) |
| 500/502/504 | `ERR_INTERNAL`/`ERR_GATEWAY`/`ERR_TIMEOUT` | Fallas de infra |

Mapeados en `lib/api/errors.ts` (`ApiError` server-side) y `lib/api/client.ts` (`BffError` client-side).

---

## 3. Auth (auth-service :4001)

| Método | Ruta gateway | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Crear cuenta |
| POST | `/api/v1/auth/login` | — | Obtener access + refresh token |
| POST | `/api/v1/auth/refresh` | — | Rotar tokens |
| POST | `/api/v1/auth/logout` | Bearer | Revocar refresh token |

**POST /api/v1/auth/register**
```ts
// Request
{ email: string; password: string; full_name: string; phone?: string }
// Response.datos
{ user_id: string; email: string; message: string; created_at: string }
```

**POST /api/v1/auth/login**
```ts
// Request
{ email: string; password: string }
// Response.datos
{ access_token: string; refresh_token: string; token_type: "Bearer"; expires_in: number /* segundos */ }
```

**POST /api/v1/auth/refresh**
```ts
// Request
{ refresh_token: string }
// Response.datos: mismo shape que login (tokens rotados)
```

**POST /api/v1/auth/logout**
```ts
// Request
{ refresh_token: string }  // + Authorization header
// Response.datos: {}
```

- JWT lleva solo `sub` y `role`. No lleva email ni nombre.
- Rate limiting por email en login y refresh.
- Logout invalida el refresh token vía Redis blacklist.

---

## 4. User (user-service :4002)

| Método | Ruta gateway | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/users/me` | Bearer | Perfil actual |
| PUT | `/api/v1/users/me` | Bearer | Actualizar perfil |
| PUT | `/api/v1/users/me/avatar` | Bearer | Upload avatar (multipart, max 5MB) |
| DELETE | `/api/v1/users/me/avatar` | Bearer | Eliminar avatar |
| GET/POST/PUT/DELETE | `/api/v1/users/me/addresses[/{id}]` | Bearer | CRUD direcciones |
| GET/PUT | `/api/v1/users/me/preferences` | Bearer | Preferencias |

**ProfileResponseDTO**
```ts
{
  user_id: string
  email?: string          // proyección desde auth-service
  role: string            // proyección desde auth-service ("user" | "admin" | "pharmacy_owner")
  full_name: string
  phone?: string
  bio?: string
  avatar_url?: string
  date_of_birth?: string  // ISO 8601
  created_at: string
  updated_at: string
}
```

> 🔁 `email` y `role` son una **vista materializada** sincronizada vía eventos SQS (`USER_REGISTERED`, `USER_EMAIL_CHANGED`, `USER_ROLE_CHANGED`). La fuente de verdad sigue siendo `auth.users`. user-service no llama a auth-service en runtime — son servicios totalmente desacoplados.

El perfil se crea automáticamente al registrarse (user-service consume `USER_REGISTERED` desde SQS).

---

## 5. Catalog (catalog-service :4003)

**Modelo de auth (2026-05-06):** un único path por recurso. El gateway delega la decisión
de auth al microservicio downstream — los GETs públicos del catálogo no requieren JWT
y los POST/PUT/DELETE admin son rechazados por el `authMiddleware` de catalog-service.
Eliminado el namespace `/api/v1/public/*` (violaba el principio "modo de acceso en
middleware, no en path" — ver `services/CLAUDE.md` §5.5).

| Método | Ruta gateway | Auth | Notas |
|---|---|---|---|
| GET | `/api/v1/products` | — | Listado paginado |
| GET | `/api/v1/products/{id}` | — | Detalle (cache 1h) |
| POST | `/api/v1/products/search` | — | Búsqueda avanzada |
| GET | `/api/v1/products/barcode/{barcode}` | — | Por código de barras |
| GET | `/api/v1/products/{id}/interactions` | — | Interacciones (cache 24h) |
| GET | `/api/v1/products/{id}/frequently-bought-together` | — | FBT (cache 6h) |
| GET | `/api/v1/products/{id}/availability` | — | Disponibilidad en farmacias (HU-014: acepta `?lat&lng&radius_km`) |
| GET | `/api/v1/products/slug/{slug}` | — | Detalle por slug |
| GET | `/api/v1/categories` | — | Listar categorías |
| GET | `/api/v1/categories/{id}/products` | — | Productos por categoría |
| GET | `/api/v1/brands` | — | Listar marcas |
| GET | `/api/v1/brands/{id}/products` | — | Productos por marca |

Endpoints administrativos (`POST /products`, `PUT /products/{id}`, `DELETE /products/{id}`,
`PUT /products/{id}/images`, `POST /categories`, `PUT /categories/{id}`, `POST /brands`,
`PUT /brands/{id}`, `POST /products/interactions`) existen pero requieren rol `admin` —
los rechaza el `authMiddleware` del propio catalog-service. No se exponen al front público.

---

## 6. Pharmacy (pharmacy-service :4004)

| Método | Ruta gateway | Auth | Notas |
|---|---|---|---|
| GET | `/api/v1/pharmacies` | Bearer | Listado |
| GET | `/api/v1/pharmacies/{id}` | Bearer | Detalle |
| POST | `/api/v1/pharmacies/nearby` | Bearer | Geosearch (PostGIS) |
| GET | `/api/v1/pharmacies/{id}/inventory` | Bearer | Inventario |
| GET | `/api/v1/pharmacies/{id}/hours` | Bearer | Horarios |
| GET | `/api/v1/pharmacies/chains/{chainId}` | Bearer | Por cadena |

**Request body** `POST /pharmacies/nearby`:
```ts
{ latitude: number; longitude: number; radius_km: number }
```

---

## 7. Price (price-service :4005)

| Método | Ruta gateway | Auth | Notas |
|---|---|---|---|
| POST | `/api/v1/prices/compare` | — | Comparar entre farmacias |
| GET | `/api/v1/prices/compare/generic-vs-brand/{id}` | — | Genérico vs marca (cache 1h) |
| GET | `/api/v1/prices/history/{id}` | — | Historial (cache 30min) |
| POST | `/api/v1/prices/alerts` | Bearer | Crear alerta (max 20/user) |
| GET | `/api/v1/prices/alerts` | Bearer | Mis alertas |
| DELETE | `/api/v1/prices/alerts/{id}` | Bearer | Eliminar alerta |

---

## 8. Order (order-service :4011)

Todo bajo `/api/v1/cart/*` y `/api/v1/orders/*`. Requiere auth.

| Método | Ruta gateway | Auth | Notas |
|---|---|---|---|
| GET | `/api/v1/cart` | Bearer | Obtener carrito |
| POST | `/api/v1/cart/items` | Bearer | Agregar ítem |
| PUT | `/api/v1/cart/items/{item_id}` | Bearer | Actualizar cantidad |
| DELETE | `/api/v1/cart/items/{item_id}` | Bearer | Eliminar ítem |
| DELETE | `/api/v1/cart` | Bearer | Vaciar carrito |
| POST | `/api/v1/orders/checkout` | Bearer | Checkout (1 orden por farmacia) |
| GET | `/api/v1/orders` | Bearer | Mis órdenes |
| GET | `/api/v1/orders/{order_id}` | Bearer | Detalle |
| POST | `/api/v1/orders/{order_id}/cancel` | Bearer | Cancelar |

Paneles no expuestos al front público (requieren rol específico): `/api/v1/orders/pharmacy`, `/api/v1/orders/admin`.

---

## 9. Seguridad

### Tokens
- **Access**: JWT ~15 min. Cookie `fn_access` (`httpOnly`, `Secure` en prod, `SameSite=Lax`, `Path=/`).
- **Refresh**: Opaco, 7 días. Cookie `fn_refresh` (`httpOnly`, `Secure` en prod, `SameSite=Lax`, **`Path=/api/auth`** — solo los route handlers de auth pueden verlo).
- Rotación en cada refresh (el backend invalida el anterior).

### BFF
Los Route Handlers en `app/api/auth/*` son el único lugar que:
- Lee/escribe cookies de sesión.
- Conoce la URL del gateway (`API_GATEWAY_URL`, sin `NEXT_PUBLIC_`).
- Hace refresh transparente ante 401.

### Silent refresh
`lib/auth/session.ts#withAuth`: si el gateway responde 401, intenta refresh con la cookie, actualiza cookies y reintenta la llamada original. Si el refresh falla, limpia la sesión.

### CSRF
`SameSite=Lax` protege el caso común. Para mutaciones críticas se puede agregar double-submit token más adelante.

---

## 10. Uso desde el frontend

### Server Component / Route Handler
```ts
import { gatewayFetch } from "@/lib/api/gateway";
import { withAuth } from "@/lib/auth/session";

const profile = await withAuth((token) =>
  gatewayFetch<ProfileResponseDTO>("/api/v1/users/me", { accessToken: token })
    .then((r) => r.datos)
);
```

### Client Component
```tsx
"use client";
import { useMe } from "@/hooks/use-auth";

function Perfil() {
  const { data, isLoading } = useMe();
  if (isLoading) return <Skeleton />;
  return <h1>Hola, {data?.full_name}</h1>;
}
```

### Nunca hacer
- ❌ `fetch("http://localhost:8080/...")` desde un componente cliente
- ❌ Guardar tokens en `localStorage` / `sessionStorage`
- ❌ Exponer `API_GATEWAY_URL` con el prefijo `NEXT_PUBLIC_`
