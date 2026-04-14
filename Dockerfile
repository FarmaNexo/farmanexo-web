# farmanexo-web — Next.js 16 standalone multi-stage
# Stage 1: builder (install + build en un solo stage — evita problemas con
#                   symlinks/hardlinks de pnpm al copiar node_modules entre stages)
# Stage 2: runner (imagen final minimalista con solo .next/standalone)

# ========================================
# Stage 1: Builder
# ========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm via corepack (incluido en node:20+)
RUN corepack enable pnpm

# Install deps — Docker cachea este layer si package.json + lockfile no cambian
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del source y buildear (standalone output)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ========================================
# Stage 2: Runner (imagen final)
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

# .next/standalone trae un node_modules minimal autocontenido (tree-shaken por
# Next build), asi que el runner NO necesita pnpm ni node_modules globales.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check — Next no expone /health nativo; check a la raiz basta
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
