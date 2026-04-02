FROM node:20-alpine AS base

WORKDIR /app

ARG COREPACK_NPM_REGISTRY=https://registry.npmjs.org
ENV COREPACK_NPM_REGISTRY=${COREPACK_NPM_REGISTRY}

# Alpine cần ca-certificates để corepack tải tool/package qua HTTPS.
RUN apk add --no-cache ca-certificates

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Lưu ý: pnpm strict layout có thể không tạo symlink top-level cho deps được import trực tiếp.
# Vì vậy ở stage `runner` mình sẽ tạo symlink thủ công cho `express` (không bật hoisted).
RUN pnpm install --frozen-lockfile --filter api... --filter @iec-hub/shared...

FROM deps AS builder

COPY tsconfig.base.json* ./
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN pnpm run build

WORKDIR /app

COPY apps/api ./apps/api

WORKDIR /app/apps/api

RUN npx prisma@6.19.2 generate --schema=./prisma/schema.prisma

RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# pnpm strict layout thường chỉ đặt package ở store dưới `.pnpm/...`, còn Node runtime thì lại resolve từ `/app/node_modules`.
# Tạo symlink top-level cho toàn bộ dependencies trực tiếp của `apps/api` để tránh `MODULE_NOT_FOUND` lúc chạy `node dist/main.js`.
RUN node <<'NODE'
const fs = require('fs');
const path = require('path');
const pkg = require('./apps/api/package.json');
const deps = Object.keys(pkg.dependencies || {});

const storeDir = path.join(process.cwd(), 'node_modules/.pnpm');
const nmDir = path.join(process.cwd(), 'node_modules');
const entries = fs.readdirSync(storeDir);

for (const dep of deps) {
  const encoded = dep.startsWith('@') ? dep.replace('/', '+') : dep;
  const candidates = entries.filter((e) => e.startsWith(encoded + '@'));
  if (candidates.length === 0) continue;

  // lockfile đảm bảo đúng 1 version cho mỗi dependency.
  const candidate = candidates[0];
  const actual = path.join(storeDir, candidate, 'node_modules', dep);
  const expected = path.join(nmDir, dep);

  fs.mkdirSync(path.dirname(expected), { recursive: true });
  try {
    fs.rmSync(expected, { recursive: true, force: true });
  } catch {}
  fs.symlinkSync(actual, expected, 'dir');
}
NODE

COPY --from=builder /app/packages/shared/dist ./node_modules/@iec-hub/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@iec-hub/shared/

USER nestjs

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]
