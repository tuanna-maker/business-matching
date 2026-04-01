export const API_ROUTES = {
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_LOGOUT: "/auth/logout",

  ME: "/me",
  STARTUP_PROFILE: "/startup/profile",
  INVESTOR_PROFILE: "/investor/profile",
  ORG_PROFILE: "/org/profile",
  ORG_INVITES: "/org/invites",

  PROJECTS: "/projects",
  PROJECT: (id: string) => `/projects/${id}`,
  PROJECT_DOCUMENTS: (projectId: string) => `/projects/${projectId}/documents`,
  DATA_ROOM: (projectId: string) => `/projects/${projectId}/data-room`,
  DATA_ROOM_REQUESTS: (dataRoomId: string) => `/data-room/${dataRoomId}/requests`,
  DATA_ROOM_REQUEST: (id: string) => `/data-room/requests/${id}`,
  DATA_ROOM_REQUESTS_MINE: "/data-room/requests/mine",
  PUBLIC_PROJECT: (slug: string) => `/public/projects/${slug}`,

  IEC_LEVELS: "/iec/levels",
  IEC_CRITERIA: "/iec/criteria",
  IEC_PROJECT_ASSESSMENTS: (projectId: string) => `/iec/projects/${projectId}/assessments`,
  IEC_ASSESSMENT: (id: string) => `/iec/assessments/${id}`,
  IEC_ASSESSMENT_SCORES: (id: string) => `/iec/assessments/${id}/scores`,
  IEC_ADMIN_FINALIZE: (id: string) => `/admin/iec/assessments/${id}/finalize`,

  IEC_REVIEW_LIST: "/iec/review",
  IEC_ADMIN_LEVELS: "/admin/iec/levels",
  IEC_ADMIN_LEVEL: (id: number | string) => `/admin/iec/levels/${id}`,
  IEC_ADMIN_LEVEL_DELETE: (id: number | string) => `/admin/iec/levels/${id}/delete`,
  IEC_ADMIN_CRITERIA: "/admin/iec/criteria",
  IEC_ADMIN_CRITERION: (id: number | string) => `/admin/iec/criteria/${id}`,
  IEC_ADMIN_CRITERION_DELETE: (id: number | string) =>
    `/admin/iec/criteria/${id}/delete`,

  DISCOVER_PROJECTS: "/discover/projects",

  SERVICES: "/services",
  SERVICE: (idOrSlug: string) => `/services/${idOrSlug}`,

  DIRECTORY_STARTUPS: "/directory/startups",
  DIRECTORY_INVESTORS: "/directory/investors",

  MATCH_INTENTS: "/matching/intents",
  MATCH_INTENT: (id: string) => `/matching/intents/${id}`,

  MATCHES: "/matching/matches",
  MATCH: (id: string) => `/matching/matches/${id}`,
  MATCH_STATUS: (id: string) => `/matching/matches/${id}/status`,
  MATCH_EVENTS: (id: string) => `/matching/matches/${id}/events`,

  ADMIN_DASHBOARD_METRICS: "/admin/dashboard/metrics",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_MATCHES: "/admin/matches",
  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_PROJECT_STATUS: (id: string) => `/admin/projects/${id}/status`,
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_ROLES: (id: string) => `/admin/users/${id}/roles`,

  ADMIN_APPROVALS_PENDING: "/admin/approvals/pending",
  ADMIN_APPROVAL_USER_APPROVE: (id: string) => `/admin/approvals/users/${id}/approve`,
  ADMIN_APPROVAL_USER_REJECT: (id: string) => `/admin/approvals/users/${id}/reject`
  ,

  NOTIFICATIONS: "/notifications",
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`
} as const;

