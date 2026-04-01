/**
 * Kịch bản autotest full luồng:
 * 1) Global setup: seed 3 tác nhân vào DB (startup / investor / admin).
 * 2) API: startup tạo project → publish → metadata tài liệu; investor discover + intent + match;
 *    admin đọc metrics.
 * 3) FE: đăng nhập từng vai, duyệt các màn chính và xác nhận dữ liệu đã seed hiển thị.
 */
import { test, expect, type Page } from "@playwright/test";
import {
  E2E,
  apiLogin,
  apiGetMe,
  apiCreateProject,
  apiPublishProject,
  apiCreateDocumentMetadata,
  apiDiscoverProjects,
  apiCreateMatchIntent,
  apiCreateMatch,
  apiListMatches,
  apiAdminMetrics,
} from "./helpers/system-test-api";

/**
 * Next.js App Router + nhiều `goto` liên tiếp: `waitUntil: "load"` dễ gặp net::ERR_ABORTED
 * (navigation bị thay thế / stream RSC chưa kịp hoàn tất). `domcontentloaded` ổn định hơn cho E2E.
 */
async function stableGoto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
}

/** Demo-style copy for full-flow E2E (reads like a real product, not “autotest”). */
const E2E_DEMO_PROJECT = {
  title: "HelioVolt — Adaptive Grid Operating System",
  summary:
    "Edge-native control plane for distributed batteries and rooftop solar — optimizes export, peak shaving, and grid services in real time.",
  description:
    "HelioVolt coordinates behind-the-meter assets for C&I portfolios and utilities. Our forecasting stack blends satellite irradiance, tariff engines, and SCADA telemetry to dispatch flex capacity in under two seconds. Pilots are live with two regional operators; we are raising seed capital to expand certification and partner integrations.",
  industry: "energy",
  stage: "Seed",
  funding_need_amount: 750_000,
  funding_currency: "USD",
  hero_image_url:
    "https://images.unsplash.com/photo-1473341304170-971dccb563ac?w=1600&q=80",
} as const;

async function feLogin(page: Page, email: string) {
  await stableGoto(page, "/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(E2E.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  await page.waitForLoadState("networkidle").catch(() => {});
}

test.describe.configure({ mode: "serial" });

test.describe("Full system flow — API seed + 3 actors on FE", () => {
  let projectId: string;

  test("Phase A — API creates business data in DB", async ({ request }) => {
    const startupAuth = await apiLogin(
      request,
      E2E.startupEmail,
      E2E.password
    );
    const startupMe = await apiGetMe(request, startupAuth.access_token);
    expect(startupMe.user.startup_profile?.id).toBeTruthy();

    const project = await apiCreateProject(request, startupAuth.access_token, {
      title: E2E_DEMO_PROJECT.title,
      summary: E2E_DEMO_PROJECT.summary,
      description: E2E_DEMO_PROJECT.description,
      industry: E2E_DEMO_PROJECT.industry,
      stage: E2E_DEMO_PROJECT.stage,
      funding_need_amount: E2E_DEMO_PROJECT.funding_need_amount,
      funding_currency: E2E_DEMO_PROJECT.funding_currency,
      hero_image_url: E2E_DEMO_PROJECT.hero_image_url,
    });
    projectId = project.id;
    expect(project.startup_id).toBeTruthy();

    await apiPublishProject(request, startupAuth.access_token, projectId);
    await apiCreateDocumentMetadata(
      request,
      startupAuth.access_token,
      projectId
    );

    const investorAuth = await apiLogin(
      request,
      E2E.investorEmail,
      E2E.password
    );
    const investorMe = await apiGetMe(request, investorAuth.access_token);
    expect(investorMe.user.investor_profile?.id).toBeTruthy();

    const discovered = await apiDiscoverProjects(
      request,
      investorAuth.access_token,
      "HelioVolt"
    );
    expect(discovered.some((p) => p.id === projectId)).toBeTruthy();

    const intent = await apiCreateMatchIntent(
      request,
      investorAuth.access_token,
      projectId
    );
    expect(intent.id).toBeTruthy();

    const match = await apiCreateMatch(request, investorAuth.access_token, {
      project_id: projectId,
      startup_id: project.startup_id,
      investor_id: investorMe.user.investor_profile!.id,
      status: "pending_intro",
      match_intent_id: intent.id,
    });
    expect(match.id).toBeTruthy();

    const startupMatches = await apiListMatches(
      request,
      startupAuth.access_token
    );
    expect(startupMatches.some((m) => m.project_id === projectId)).toBeTruthy();

    const investorMatches = await apiListMatches(
      request,
      investorAuth.access_token
    );
    expect(
      investorMatches.some((m) => m.project_id === projectId)
    ).toBeTruthy();

    const adminAuth = await apiLogin(request, E2E.adminEmail, E2E.password);
    const metrics = await apiAdminMetrics(request, adminAuth.access_token);
    expect(metrics.projects).toBeGreaterThan(0);
    expect(metrics.matches).toBeGreaterThan(0);
  });

  test("Phase B — Startup FE: dashboard, projects, vault, matches", async ({
    page,
  }) => {
    await feLogin(page, E2E.startupEmail);
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();

    await stableGoto(page, "/projects");
    await expect(
      page.locator(`a[href="/projects/${projectId}"]`)
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/vault");
    // /Data|Vault/ khớp cả h3 "No Data Room" → strict mode violation; chỉ lấy tiêu đề trang (h1)
    await expect(
      page.getByRole("heading", { level: 1, name: /Data Vault/i })
    ).toBeVisible();
    // Tên project nằm trong <option>: Playwright coi option là hidden → không dùng getByText(...).toBeVisible()
    const vaultProjectSelect = page.locator("select").first();
    await expect(vaultProjectSelect).toBeVisible({ timeout: 30_000 });
    await vaultProjectSelect.selectOption({ value: projectId });
    await expect(vaultProjectSelect).toHaveValue(projectId);

    await stableGoto(page, "/matches");
    await expect(
      page.getByRole("heading", { level: 1, name: /match/i })
    ).toBeVisible();

    await stableGoto(page, "/org");
    await expect(
      page.getByRole("heading", { level: 1, name: /Organization/i })
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/iec");
    await expect(
      page.getByRole("heading", { level: 1, name: /IEC Verification/i })
    ).toBeVisible();
  });

  test("Phase C — Investor FE: discover, matches, directory, notifications", async ({
    page,
  }) => {
    await feLogin(page, E2E.investorEmail);

    await stableGoto(page, "/discover");
    await expect(
      page.getByRole("heading", { level: 1, name: /Discover/i })
    ).toBeVisible();
    await expect(
      page.locator(`a[href="/projects/${projectId}"]`)
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/matches");
    await expect(
      page.getByRole("heading", { level: 1, name: /match/i })
    ).toBeVisible();

    await stableGoto(page, "/directory");
    await expect(
      page.getByRole("heading", { level: 1, name: /Directory/i })
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/notifications");
    await expect(
      page.getByRole("heading", { level: 1, name: /Notifications/i })
    ).toBeVisible({ timeout: 30_000 });
  });

  test("Phase D — Investor FE: social feed + settings + profile", async ({
    page,
  }) => {
    await feLogin(page, E2E.investorEmail);
    await stableGoto(page, "/social");
    await expect(
      page.getByRole("heading", { level: 1, name: /Network Feed/i })
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/settings");
    await expect(
      page.getByRole("heading", { level: 1, name: /settings/i })
    ).toBeVisible({ timeout: 30_000 });

    await stableGoto(page, "/profile");
    await expect(
      page.getByRole("heading", { level: 1, name: /profile/i })
    ).toBeVisible({ timeout: 30_000 });
  });

  test("Phase E — Admin FE: admin dashboard loads", async ({ page }) => {
    await feLogin(page, E2E.adminEmail);
    await stableGoto(page, "/admin");
    await expect(
      page.getByRole("heading", { level: 1, name: /Admin Dashboard/i })
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Projects|Startups|Investors|Matches/).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
