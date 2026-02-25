# ══════════════════════════════════════════════════════════════════════════════
# WhatsApp Session Provider — Backend Production Image
# Multi-stage build with Chromium for whatsapp-web.js
# ══════════════════════════════════════════════════════════════════════════════

FROM node:20-alpine AS base

# Install Chromium + dependencies for whatsapp-web.js (Puppeteer)
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  font-noto-emoji

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# ─── Dependencies (production only) ──────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Build ───────────────────────────────────────────────────────────────────
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM base AS production

LABEL maintainer="WhatsApp Session Provider"
LABEL description="Backend API for WhatsApp Session Provider SaaS"

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy compiled code
COPY --from=build /app/dist ./dist

# Copy Prisma artifacts (generated client + schema for migrations)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./prisma/
COPY package.json ./

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Create necessary directories
RUN mkdir -p wa-sessions logs && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
