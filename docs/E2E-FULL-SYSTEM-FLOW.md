# Autotest full luồng hệ thống (Playwright + API)

Kịch bản **`apps/web-v4/e2e/system-flow-full.spec.ts`** mô phỏng **3 tác nhân**:

| Vai trò   | Email (seed)              | Mật khẩu mặc định |
|-----------|---------------------------|-------------------|
| Startup   | `startup-e2e@test.com`    | `TestPass123!`    |
| Investor  | `investor-e2e@test.com`   | `TestPass123!`    |
| Admin     | `admin-e2e@test.com`      | `TestPass123!`    |

## Luồng nghiệp vụ trong test

1. **Global setup** (`e2e/global-setup.ts`): chạy `pnpm --filter api db:seed:e2e-actors` để **upsert 3 user + profile + org** vào DB (tác nhân cố định).
2. **Phase A — API (ghi DB)**  
   - **Startup**: `POST /api/projects` → `PATCH .../status` (published) → `POST .../documents` (metadata data room).  
   - **Investor**: `GET /api/discover/projects` → `POST /api/matching/intents` → `POST /api/matching/matches`.  
   - **Admin**: `GET /api/admin/dashboard/metrics` (và kiểm tra `projects` / `matches` > 0).  
3. **Phase B–E — FE**: đăng nhập lần lượt startup / investor / admin, mở các màn: dashboard, projects, vault, matches, org, IEC, discover, directory, notifications, social, settings, profile, admin.

> Dữ liệu nghiệp vụ (project, document metadata, intent, match) được tạo **qua API** trong Phase A; seed chỉ đảm bảo **3 tác nhân** tồn tại.

## Điều kiện chạy

1. **API** NestJS: `http://localhost:3000` (prefix `/api`).  
2. **Web** Next.js: mặc định Playwright dùng `http://localhost:3001`. Nếu bạn chạy web ở cổng khác:

```bash
export PLAYWRIGHT_WEB_BASE_URL=http://localhost:3000
export PLAYWRIGHT_API_BASE_URL=http://localhost:3000/api
```

3. Cài dependency & trình duyệt Playwright (một lần):

```bash
pnpm install
# Phải chạy qua package web-v4 (ở root không có binary `playwright`)
pnpm test:e2e:install-browsers
# tương đương: pnpm --filter iec-hub-v4 exec playwright install chromium
```

## Lệnh

```bash
# Từ root monorepo — chạy toàn bộ file E2E web-v4
pnpm test:e2e

# Chỉ kịch bản full luồng
pnpm test:e2e:full

# Hoặc trong apps/web-v4
pnpm test:e2e:full
```

**Seed tác nhân thủ công** (nếu tắt global setup):

```bash
export E2E_SKIP_DB_SEED=1   # trong env khi chạy playwright
pnpm --filter api db:seed:e2e-actors
```

## Ghi chú

- `E2E_PASSWORD` có thể override mật khẩu seed (đồng bộ với script seed và helper `e2e/helpers/system-test-api.ts`).  
- File cũ `e2e/full-flow.spec.ts` vẫn có thể lệch mật khẩu / selector; ưu tiên **`system-flow-full.spec.ts`** cho full luồng + API seed.

### `net::ERR_ABORTED` khi `page.goto` (Next.js dev)

Thường do Playwright mặc định chờ tới sự kiện **`load`**, trong khi App Router / RSC hoặc **chuỗi nhiều `goto` liên tiếp** khiến navigation bị coi là “bị hủy” giữa chừng. Trong `system-flow-full.spec.ts` dùng helper **`stableGoto`** (`waitUntil: "domcontentloaded"`). Nếu vẫn lắc, chạy web bằng `next build && next start` thay vì `next dev` khi chạy E2E.
