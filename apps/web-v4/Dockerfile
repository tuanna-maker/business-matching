FROM node:20-alpine AS base

WORKDIR /app

ARG COREPACK_NPM_REGISTRY=https://registry.npmjs.org
ENV COREPACK_NPM_REGISTRY=${COREPACK_NPM_REGISTRY}

# Alpine cần ca-certificates để corepack tải tool/package qua HTTPS.
RUN apk add --no-cache ca-certificates

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web-v4/package.json ./apps/web-v4/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter iec-hub-v4... --filter @iec-hub/shared...

FROM deps AS builder

COPY tsconfig.base.json* ./
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN pnpm run build

WORKDIR /app

COPY apps/web-v4 ./apps/web-v4

WORKDIR /app/apps/web-v4

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web-v4/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/apps/web-v4/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-v4/.next/static ./apps/web-v4/.next/static

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web-v4/server.js"]
