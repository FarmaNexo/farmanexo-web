# farmanexo-web — Next.js 16 standalone multi-stage
# Stage 1: deps (solo instala dependencias — cache hit frecuente)
# Stage 2: builder (compila la app con output=standalone)
# Stage 3: runner (imagen final minimalista con .next/standalone)

# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar manifests y lockfile — el cache de Docker se invalida solo si cambian
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Telemetria de Next.js deshabilitada en builds de CI
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm build

# ========================================
# Stage 3: Runner (imagen final)
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario no-root
RUN addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nextjs

# Copiar el output standalone + assets publicos + static files
# Estos paths son convencion de Next.js con output=standalone:
#   - .next/standalone  → server.js + node_modules minimo + package.json
#   - .next/static      → assets compilados (CSS/JS hasheados)
#   - public            → archivos estaticos (imagenes, favicon)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check — Next no expone /health nativo; check a la raiz basta
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
