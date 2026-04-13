# Documentación del Proyecto FarmaNexo

Este documento sirve como la fuente central de verdad para el proyecto **FarmaNexo**, consolidando información técnica, arquitectura y guías de uso.

> **Nota**: Aunque la documentación está en español, los términos técnicos, nombres de archivos, variables y referencias al código se mantienen en **Inglés** para seguir los estándares de la industria.

---

## 1. Visión General (Overview)

**FarmaNexo** es una plataforma de comparación de precios de medicamentos en tiempo real para Lima Metropolitana. Su objetivo es democratizar el acceso a la información farmacéutica, permitiendo a los usuarios encontrar los mejores precios y farmacias cercanas.

### Objetivos del MVP 1.0
- **Comparación de precios**: Geolocalización en un radio de 5km.
- **Chatbot IA "Orientador Farmacéutico"**: Asistencia educativa (sin diagnósticos).
- **Métricas**: Tasa de conversión y retención.

---

## 2. Stack Tecnológico

El proyecto utiliza tecnologías modernas para asegurar rendimiento, escalabilidad y una buena experiencia de desarrollo (DX).

### Frontend (Client-Side)
- **Framework**: `Next.js 16` (App Router)
- **Lenguaje**: `TypeScript`
- **Estilos**: `Tailwind CSS v4`
- **Componentes UI**: `shadcn/ui` (basado en Radix UI)
- **Gestión de Estado**: `Zustand`
- **Mapas**: `Google Maps API` (requiere `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para renderizar el mapa)

### Backend & Servicios
- **IA**: `Vercel AI SDK v5` (Integración con OpenAI/Anthropic)
- **Base de Datos (Planned)**: `PostgreSQL` + `Redis` (Ver `BACKEND_API_SPEC.md`)
- **Autenticación (Dev)**: Mock implementation (plans for `JWT`/`OAuth`)

### Herramientas de Desarrollo
- **Linting**: `ESLint`
- **Formateo**: `Prettier`
- **Control de Versiones**: `Git`

---

## 3. Arquitectura y Estructura de Archivos

El proyecto sigue la estructura estándar de **Next.js App Router**.

### Estructura de Directorios (`/app`)

| Ruta | Descripción |
|------|-------------|
| `app/api/` | Endpoints de la API (ej. `chatbot/route.ts`). |
| `app/buscar/` | Página principal de búsqueda y comparación. |
| `app/catalogo/` | Catálogo navegable de medicamentos. |
| `app/medicamento/[id]/` | Página dinámica de detalle del producto. |
| `app/login/` | Pantalla de inicio de sesión. |
| `app/registro/` | Pantalla de registro. |
| `app/recuperar-contrasena/` | Recuperación de contraseña. |
| `app/perfil/` | Perfil de usuario (privado). |
| `app/ordenes/` | Mis Órdenes (privado). |
| `app/layout.tsx` | Layout raíz (Root Layout) con Providers globales. |
| `app/page.tsx` | Landing page (Hero section + Búsqueda rápida). |

### Componentes Clave (`/components`)

Los componentes están modularizados para facilitar su mantenimiento:

- **UI Core**: `components/ui/*` (Botones, Inputs, Cards de shadcn).
- **Búsqueda**: `drug-search.tsx`, `search-bar.tsx`.
- **Resultados**: `comparison-results.tsx`, `pharmacy-map.tsx`.
- **Modales**: `drug-detail-modal.tsx`, `location-modal.tsx`, `cart-modal.tsx`.
- **Chatbot**: `chatbot-widget.tsx`.

---

## 4. Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Pasos de Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/proyecto-farma-nexo.git
    cd proyecto-farma-nexo
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

---

## 5. Especificación del Backend

Para una descripción detallada de la arquitectura del servidor, base de datos y endpoints, por favor referirse al archivo especializado:

👉 **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)**

### Resumen de Servicios (Microservicios/Módulos)
1.  **Auth Service**: Gestión de usuarios y seguridad (`JWT`).
2.  **Catalog Service**: Base de datos de medicamentos (`drugs`).
3.  **Pharmacy Service**: Gestión de locales y geolocalización.
4.  **Price Service**: Motor de comparación de precios (`drug_prices`).
5.  **User Service**: Favoritos, historial y perfil.
6.  **Analytics Service**: Tracking de eventos (`search_events`, `click_events`).
7.  **Chatbot Service**: Procesamiento de lenguaje natural.

---

## 6. Funcionalidades Clave

### A. Búsqueda y Comparación
1.  El usuario ingresa un término (DCI o Marca).
2.  El sistema busca coincidencias en la base de datos local (Mock data en `lib/farmanexo-data.ts` actualmente).
3.  Se filtran resultados por **ubicación** (lat/lng) y radio de búsqueda.
4.  Se muestran tarjetas comparativas ordenadas por precio o distancia.

### B. Chatbot Orientador
- Integrado con `Vercel AI SDK`.
- Utiliza **System Prompts** para garantizar respuestas seguras (no diagnósticos).
- Mantiene contexto de la conversación.

### C. Autenticación (Mock)
- Credenciales demo: `demo@farmanexo.pe` / `Demo123!`.
- Simula persistencia de sesión y protección de rutas privadas (`/perfil`, `/ordenes`).

---

## 7. Próximos Pasos (Roadmap)

### Backend
- [ ] Implementar base de datos real (PostgreSQL).
- [ ] Configurar CI/CD pipelines.
- [ ] Desarrollar scrapers para actualización de precios.

### Frontend
- [ ] Optimizar carga de mapas.
- [ ] Implementar PWA (Progressive Web App).
- [ ] Añadir notificaciones push.


