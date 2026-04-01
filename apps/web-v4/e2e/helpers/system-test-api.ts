import type { APIRequestContext } from "@playwright/test";

const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:3000/api";

export const E2E = {
  startupEmail: "startup-e2e@test.com",
  investorEmail: "investor-e2e@test.com",
  adminEmail: "admin-e2e@test.com",
  password: process.env.E2E_PASSWORD || "TestPass123!",
};

export interface AuthUser {
  id: string;
  email: string;
  user_type: string;
  org_id?: string;
  startup_profile?: { id: string };
  investor_profile?: { id: string };
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<LoginResult> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Login failed ${res.status()}: ${body}`);
  }
  const json = (await res.json()) as LoginResult;
  if (!json.access_token) {
    throw new Error("Login response missing access_token");
  }
  return json;
}

export async function apiGetMe(
  request: APIRequestContext,
  token: string
): Promise<{ user: AuthUser }> {
  const res = await request.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET /auth/me failed ${res.status()}`);
  }
  return res.json() as Promise<{ user: AuthUser }>;
}

export async function apiCreateProject(
  request: APIRequestContext,
  token: string,
  body: {
    title: string;
    summary?: string;
    description?: string;
    industry?: string;
    stage?: string;
    funding_need_amount?: number;
    funding_currency?: string;
    hero_image_url?: string;
  }
) {
  const res = await request.post(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  if (!res.ok()) {
    throw new Error(`POST /projects failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{
    id: string;
    startup_id: string;
    status: string;
  }>;
}

export async function apiPublishProject(
  request: APIRequestContext,
  token: string,
  projectId: string
) {
  const res = await request.patch(`${API_BASE}/projects/${projectId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { status: "published" },
  });
  if (!res.ok()) {
    throw new Error(
      `PATCH project status failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<{ id: string; title: string; startup_id: string }>;
}

export async function apiCreateDocumentMetadata(
  request: APIRequestContext,
  token: string,
  projectId: string
) {
  const res = await request.post(
    `${API_BASE}/projects/${projectId}/documents`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        type: "pitch_deck",
        fileName: "HelioVolt-Seed-Overview.pdf",
        mimeType: "application/pdf",
      },
    }
  );
  if (!res.ok()) {
    throw new Error(
      `POST document metadata failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json();
}

export async function apiDiscoverProjects(
  request: APIRequestContext,
  token: string,
  search?: string
) {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await request.get(`${API_BASE}/discover/projects${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(
      `GET discover/projects failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<Array<{ id: string; title: string }>>;
}

export async function apiCreateMatchIntent(
  request: APIRequestContext,
  token: string,
  projectId: string
) {
  const res = await request.post(`${API_BASE}/matching/intents`, {
    headers: { Authorization: `Bearer ${token}` },
      data: { project_id: projectId, status: "liked", source: "discovery_feed" },
  });
  if (!res.ok()) {
    throw new Error(
      `POST matching/intents failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<{ id: string }>;
}

export async function apiCreateMatch(
  request: APIRequestContext,
  token: string,
  body: {
    project_id: string;
    startup_id: string;
    investor_id: string;
    status: string;
    match_intent_id?: string;
    iec_level_at_match?: string;
  }
) {
  const res = await request.post(`${API_BASE}/matching/matches`, {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  if (!res.ok()) {
    throw new Error(
      `POST matching/matches failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<{ id: string; status: string }>;
}

export async function apiListMatches(
  request: APIRequestContext,
  token: string
) {
  const res = await request.get(`${API_BASE}/matching/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(
      `GET matching/matches failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<Array<{ id: string; project_id: string }>>;
}

export async function apiAdminMetrics(request: APIRequestContext, token: string) {
  const res = await request.get(`${API_BASE}/admin/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(
      `GET admin/dashboard/metrics failed ${res.status()}: ${await res.text()}`
    );
  }
  return res.json() as Promise<{
    startups: number;
    investors: number;
    projects: number;
    matches: number;
  }>;
}

export async function apiListNotifications(
  request: APIRequestContext,
  token: string
) {
  const res = await request.get(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    return [] as unknown[];
  }
  return res.json();
}
