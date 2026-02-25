# ══════════════════════════════════════════════════════════════════════════════
# WhatsApp Session Provider — Frontend Production Image
# Multi-stage build using Next.js standalone output
# ══════════════════════════════════════════════════════════════════════════════

FROM node:20-alpine AS base
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# ─── Build ───────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Bake the API URL into the Next.js build (required at build-time for NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM base AS production

LABEL maintainer="WhatsApp Session Provider"
LABEL description="Frontend Dashboard for WhatsApp Session Provider SaaS"

ENV NODE_ENV=production

# Copy standalone server + static assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Run as non-root for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]
