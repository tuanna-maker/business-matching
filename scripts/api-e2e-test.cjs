#!/usr/bin/env node
/**
 * IEC Hub - Comprehensive E2E API Test Script
 * Created: 2026-03-23
 * 
 * Tests all API endpoints across all modules:
 * - Auth (register, login, verify, refresh, me)
 * - Organization Management (profile, members, invites)
 * - Projects (CRUD, status)
 * - IEC Assessment (levels, criteria, assessments, scores)
 * - Trust Score & Vouching
 * - Matching (intents, matches, events, scores)
 * - Data Room (requests, access control)
 * - Search (global, suggestions, trending)
 * - Analytics (dashboard, metrics)
 * - Social (follow, share, feed)
 * - Admin (approvals, audit logs)
 * 
 * Usage: 
 *   node scripts/api-e2e-test.cjs
 *   node scripts/api-e2e-test.cjs --verbose
 *   node scripts/api-e2e-test.cjs --module=auth
 */

const API_BASE = process.env.API_URL || "http://localhost:3000/api";
const VERBOSE = process.argv.includes("--verbose") || process.argv.includes("-v");
const MODULE_FILTER = process.argv.find(a => a.startsWith("--module="))?.split("=")[1];

// ============================================
// TEST CONFIGURATION
// ============================================

const TEST_USERS = {
  startup: { 
    email: "startup-e2e@test.com", 
    password: "TestPass123!", 
    full_name: "E2E Startup User",
    user_type: "startup"
  },
  investor: { 
    email: "investor-e2e@test.com", 
    password: "TestPass123!", 
    full_name: "E2E Investor User",
    user_type: "investor"
  },
  admin: { 
    email: "admin-e2e@test.com", 
    password: "TestPass123!",
    full_name: "E2E Admin User",
    user_type: "admin"
  }
};

// State storage
const state = {
  tokens: {},
  userData: null,
  createdIds: {
    projects: [],
    matches: [],
    intents: [],
    dataRooms: []
  }
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  warnings: []
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(method, path, body = null, token = null) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body && ["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    options.body = JSON.stringify(body);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    let data = null;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text || null;
    }

    if (VERBOSE) {
      console.log(`  → ${method} ${path} [${response.status}] ${duration}ms`);
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      duration
    };
  } catch (error) {
    console.error(`  ✗ Network error: ${error.message}`);
    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message
    };
  }
}

// Shorthand methods
const GET = (path, token) => request("GET", path, null, token);
const POST = (path, body, token) => request("POST", path, body, token);
const PATCH = (path, body, token) => request("PATCH", path, body, token);
const DELETE = (path, body, token) => request("DELETE", path, body, token);

// Test assertion helpers
function test(name, passed, details = null) {
  results.total++;
  
  if (passed) {
    results.passed++;
    console.log(`    ✅ ${name}`);
  } else {
    results.failed++;
    const errorMsg = details ? `${name}: ${details}` : name;
    console.log(`    ❌ ${errorMsg}`);
    results.errors.push({ test: name, details });
  }
  
  return passed;
}

function skip(name, reason) {
  results.total++;
  results.skipped++;
  console.log(`    ⏭️  ${name} (${reason})`);
}

function warn(message) {
  results.warnings.push(message);
  console.log(`    ⚠️  ${message}`);
}

function section(name) {
  console.log(`\n📦 ${name}`);
  console.log("─".repeat(50));
}

function subsection(name) {
  console.log(`\n  📋 ${name}`);
}

// ============================================
// AUTH MODULE TESTS
// ============================================

async function testAuthModule() {
  section("AUTH MODULE");

  // Test: Register new startup user
  subsection("Registration");
  
  const registerRes = await POST("/auth/register", {
    email: TEST_USERS.startup.email,
    password: TEST_USERS.startup.password,
    full_name: TEST_USERS.startup.full_name,
    user_type: TEST_USERS.startup.user_type
  });
  
  // May fail if user exists - that's ok for repeat runs
  if (registerRes.status === 409) {
    warn("Startup user already exists (expected on repeat runs)");
  } else {
    test("Register startup user", registerRes.ok || registerRes.status === 409,
      registerRes.data?.message || `Status: ${registerRes.status}`);
  }

  // Register investor
  const registerInvRes = await POST("/auth/register", {
    email: TEST_USERS.investor.email,
    password: TEST_USERS.investor.password,
    full_name: TEST_USERS.investor.full_name,
    user_type: TEST_USERS.investor.user_type
  });
  
  if (registerInvRes.status === 409) {
    warn("Investor user already exists");
  } else {
    test("Register investor user", registerInvRes.ok || registerInvRes.status === 409);
  }

  // Test: Login
  subsection("Login");
  
  const loginStartup = await POST("/auth/login", {
    email: TEST_USERS.startup.email,
    password: TEST_USERS.startup.password
  });
  
  const startupLoginOk = loginStartup.ok && loginStartup.data?.access_token;
  test("Login startup user", startupLoginOk, 
    !startupLoginOk && (loginStartup.data?.message || `Status: ${loginStartup.status}`));
  
  if (startupLoginOk) {
    state.tokens.startup = loginStartup.data.access_token;
  }

  const loginInvestor = await POST("/auth/login", {
    email: TEST_USERS.investor.email,
    password: TEST_USERS.investor.password
  });
  
  const invLoginOk = loginInvestor.ok && loginInvestor.data?.access_token;
  test("Login investor user", invLoginOk,
    !invLoginOk && (loginInvestor.data?.message || `Status: ${loginInvestor.status}`));
  
  if (invLoginOk) {
    state.tokens.investor = loginInvestor.data.access_token;
  }

  // Try admin login
  const loginAdmin = await POST("/auth/login", {
    email: TEST_USERS.admin.email,
    password: TEST_USERS.admin.password
  });
  
  if (loginAdmin.ok && loginAdmin.data?.access_token) {
    state.tokens.admin = loginAdmin.data.access_token;
    test("Login admin user", true);
  } else {
    warn("Admin user not available for testing");
  }

  // Test: Get current user
  subsection("Get Current User (me)");
  
  if (state.tokens.startup) {
    const meRes = await GET("/auth/me", state.tokens.startup);
    test("GET /auth/me returns user data", meRes.ok && (meRes.data?.user?.email || meRes.data?.email),
      meRes.data?.message || `Status: ${meRes.status}`);
    
    const userEmail = meRes.data?.user?.email || meRes.data?.email;
    test("User email matches", userEmail === TEST_USERS.startup.email);
    
    // Store user data for later tests
    if (meRes.data?.user) {
      state.userData = meRes.data.user;
    } else if (meRes.data?.email) {
      state.userData = meRes.data;
    }
  } else {
    skip("GET /auth/me", "No startup token");
  }

  // Test: Update profile
  subsection("Update Profile");
  
  if (state.tokens.startup) {
    const updateRes = await PATCH("/auth/me", {
      full_name: "Updated Startup Name",
      phone: "0901234567"
    }, state.tokens.startup);
    
    test("PATCH /auth/me updates profile", updateRes.ok,
      updateRes.data?.message || `Status: ${updateRes.status}`);
  } else {
    skip("PATCH /auth/me", "No startup token");
  }

  // Test: Token refresh
  subsection("Token Refresh");
  
  if (loginStartup.data?.refresh_token) {
    const refreshRes = await POST("/auth/refresh", {
      refresh_token: loginStartup.data.refresh_token
    });
    
    test("POST /auth/refresh returns new tokens", 
      refreshRes.ok && refreshRes.data?.access_token,
      refreshRes.data?.message || `Status: ${refreshRes.status}`);
  } else {
    skip("Token refresh", "No refresh token");
  }

  // Test: Unauthorized access
  subsection("Authorization Checks");
  
  const noAuthRes = await GET("/auth/me");
  test("Unauthorized request rejected", noAuthRes.status === 401);

  const badTokenRes = await GET("/auth/me", "invalid-token");
  test("Invalid token rejected", badTokenRes.status === 401);
}

// ============================================
// ORGANIZATION MODULE TESTS
// ============================================

async function testOrgModule() {
  section("ORGANIZATION MODULE");

  if (!state.tokens.startup) {
    skip("Organization tests", "No auth token");
    return;
  }

  subsection("Organization Profile");

  const profileRes = await GET("/org/profile", state.tokens.startup);
  test("GET /org/profile", profileRes.ok || profileRes.status === 404,
    profileRes.data?.message);

  if (profileRes.ok && profileRes.data) {
    const updateRes = await PATCH("/org/profile", {
      description: "Test organization description",
      website: "https://test.com"
    }, state.tokens.startup);
    
    test("PATCH /org/profile", updateRes.ok,
      updateRes.data?.message || `Status: ${updateRes.status}`);
  }

  subsection("Member Management");

  const membersRes = await GET("/org/members", state.tokens.startup);
  test("GET /org/members", membersRes.ok || membersRes.status === 404,
    membersRes.data?.message);

  subsection("Invites");

  const invitesRes = await GET("/org/invites", state.tokens.startup);
  test("GET /org/invites", invitesRes.ok || invitesRes.status === 404,
    invitesRes.data?.message);
}

// ============================================
// PROJECTS MODULE TESTS
// ============================================

async function testProjectsModule() {
  section("PROJECTS MODULE");

  if (!state.tokens.startup) {
    skip("Projects tests", "No startup token");
    return;
  }

  subsection("List Projects");

  const listRes = await GET("/projects", state.tokens.startup);
  test("GET /projects", listRes.ok,
    listRes.data?.message || `Status: ${listRes.status}`);

  const myProjectsRes = await GET("/projects?owner=me", state.tokens.startup);
  test("GET /projects?owner=me", myProjectsRes.ok,
    myProjectsRes.data?.message);

  subsection("Create Project");

  const createRes = await POST("/projects", {
    title: "Test E2E Project " + Date.now(),
    description: "Automated test project",
    industry: "technology",
    stage: "seed",
    funding_need_amount: 500000,
    funding_currency: "USD"
  }, state.tokens.startup);

  const createOk = createRes.ok && createRes.data?.id;
  test("POST /projects creates project", createOk,
    createRes.data?.message || `Status: ${createRes.status}`);

  if (createOk) {
    state.createdIds.projects.push(createRes.data.id);

    // Test: Get single project
    subsection("Get Single Project");
    
    const getRes = await GET(`/projects/${createRes.data.id}`, state.tokens.startup);
    test("GET /projects/:id", getRes.ok && getRes.data?.id === createRes.data.id,
      getRes.data?.message);

    // Test: Update project
    subsection("Update Project");
    
    const updateRes = await PATCH(`/projects/${createRes.data.id}`, {
      title: "Updated Test Project",
      funding_need_amount: 1000000
    }, state.tokens.startup);
    
    test("PATCH /projects/:id", updateRes.ok,
      updateRes.data?.message || `Status: ${updateRes.status}`);

    // Test: Update status
    const statusRes = await PATCH(`/projects/${createRes.data.id}/status`, {
      status: "published"
    }, state.tokens.startup);
    
    test("PATCH /projects/:id/status", statusRes.ok,
      statusRes.data?.message || `Status: ${statusRes.status}`);
  }
}

// ============================================
// IEC & TRUST SCORE MODULE TESTS
// ============================================

async function testIecModule() {
  section("IEC & TRUST SCORE MODULE");

  if (!state.tokens.startup) {
    skip("IEC tests", "No auth token");
    return;
  }

  subsection("IEC Levels & Criteria");

  const levelsRes = await GET("/iec/levels", state.tokens.startup);
  test("GET /iec/levels", levelsRes.ok,
    levelsRes.data?.message || `Status: ${levelsRes.status}`);

  const criteriaRes = await GET("/iec/criteria", state.tokens.startup);
  test("GET /iec/criteria", criteriaRes.ok,
    criteriaRes.data?.message || `Status: ${criteriaRes.status}`);

  subsection("IEC Assessments");

  if (state.createdIds.projects.length > 0) {
    const projectId = state.createdIds.projects[0];

    const requestRes = await POST(`/iec/projects/${projectId}/assessments`, {}, state.tokens.startup);
    test("POST /iec/projects/:id/assessments (request)", 
      requestRes.ok || requestRes.status === 400, // might fail if already requested
      requestRes.data?.message);

    const assessmentsRes = await GET(`/iec/projects/${projectId}/assessments`, state.tokens.startup);
    test("GET /iec/projects/:id/assessments", assessmentsRes.ok,
      assessmentsRes.data?.message);
  }

  subsection("Trust Score");

  // Get org profile to find org_id
  const meRes = await GET("/auth/me", state.tokens.startup);
  const startupOrgId = meRes.data?.user?.org_id || meRes.data?.org_id;
  if (meRes.ok && startupOrgId) {
    const orgId = startupOrgId;

    const trustRes = await GET(`/org/${orgId}/trust-score`, state.tokens.startup);
    test("GET /org/:id/trust-score", trustRes.ok || trustRes.status === 404,
      trustRes.data?.message);

    const vouchesRes = await GET(`/org/${orgId}/vouches`, state.tokens.startup);
    test("GET /org/:id/vouches", vouchesRes.ok,
      vouchesRes.data?.message);
  } else {
    warn("No org_id found, skipping trust score tests");
  }
}

// ============================================
// MATCHING MODULE TESTS
// ============================================

async function testMatchingModule() {
  section("MATCHING MODULE");

  if (!state.tokens.investor) {
    skip("Matching tests", "No investor token");
    return;
  }

  subsection("Discover Projects (Investor)");

  const discoverRes = await GET("/discover/projects", state.tokens.investor);
  test("GET /discover/projects", discoverRes.ok,
    discoverRes.data?.message || `Status: ${discoverRes.status}`);

  subsection("Match Intents");

  const intentsRes = await GET("/matching/intents", state.tokens.investor);
  test("GET /matching/intents", intentsRes.ok,
    intentsRes.data?.message);

  // Create intent if we have a project
  if (state.createdIds.projects.length > 0) {
    const projectId = state.createdIds.projects[0];
    
    const createIntentRes = await POST("/matching/intents", {
      project_id: projectId,
      status: "liked"
    }, state.tokens.investor);

    const intentOk = createIntentRes.ok || createIntentRes.status === 400; // may already exist
    test("POST /matching/intents", intentOk,
      createIntentRes.data?.message);

    if (createIntentRes.ok && createIntentRes.data?.id) {
      state.createdIds.intents.push(createIntentRes.data.id);

      const getIntentRes = await GET(`/matching/intents/${createIntentRes.data.id}`, state.tokens.investor);
      test("GET /matching/intents/:id", getIntentRes.ok,
        getIntentRes.data?.message);
    }
  }

  subsection("Matches");

  const matchesRes = await GET("/matching/matches", state.tokens.investor);
  test("GET /matching/matches", matchesRes.ok,
    matchesRes.data?.message);

  subsection("Match Score");

  // Get investor org id
  const invMeRes = await GET("/auth/me", state.tokens.investor);
  const investorOrgId = invMeRes.data?.user?.org_id || invMeRes.data?.org_id;
  if (invMeRes.ok && investorOrgId && state.createdIds.projects.length > 0) {
    const projectId = state.createdIds.projects[0];

    const scoreRes = await GET(`/org/${investorOrgId}/project/${projectId}/match-score`, state.tokens.investor);
    test("GET /org/:investorId/project/:projectId/match-score", 
      scoreRes.ok || scoreRes.status === 404,
      scoreRes.data?.message);

    const topMatchesRes = await GET(`/org/${investorOrgId}/top-matches?limit=5`, state.tokens.investor);
    test("GET /org/:investorId/top-matches", topMatchesRes.ok,
      topMatchesRes.data?.message);
  }
}

// ============================================
// DATA ROOM MODULE TESTS
// ============================================

async function testDataRoomModule() {
  section("DATA ROOM MODULE");

  if (!state.tokens.startup || !state.tokens.investor) {
    skip("Data Room tests", "Missing tokens");
    return;
  }

  subsection("Data Room Management (Startup)");

  if (state.createdIds.projects.length > 0) {
    const projectId = state.createdIds.projects[0];

    // Create/update data room
    const createDrRes = await POST(`/projects/${projectId}/data-room`, {
      name: "Test Data Room",
      description: "Automated test data room"
    }, state.tokens.startup);

    test("POST /projects/:id/data-room", createDrRes.ok,
      createDrRes.data?.message || `Status: ${createDrRes.status}`);

    // Get data room
    const getDrRes = await GET(`/projects/${projectId}/data-room`, state.tokens.startup);
    test("GET /projects/:id/data-room", getDrRes.ok,
      getDrRes.data?.message);

    if (getDrRes.ok && getDrRes.data?.dataRoom?.id) {
      state.createdIds.dataRooms.push(getDrRes.data.dataRoom.id);
    }
  }

  subsection("Data Room Requests (Investor)");

  const myRequestsRes = await GET("/data-room/requests/mine", state.tokens.investor);
  test("GET /data-room/requests/mine", myRequestsRes.ok,
    myRequestsRes.data?.message);

  if (state.createdIds.dataRooms.length > 0) {
    const dataRoomId = state.createdIds.dataRooms[0];

    // Request access as investor (requires investor role)
    const requestAccessRes = await POST(`/data-room/${dataRoomId}/requests`, {}, state.tokens.investor);
    test("POST /data-room/:id/requests (investor)", 
      requestAccessRes.ok || requestAccessRes.status === 400, // may already exist
      requestAccessRes.data?.message);
  }
}

// ============================================
// SEARCH MODULE TESTS
// ============================================

async function testSearchModule() {
  section("SEARCH MODULE");

  if (!state.tokens.startup) {
    skip("Search tests", "No auth token");
    return;
  }

  subsection("Global Search");

  const searchRes = await GET("/search?q=test&limit=10", state.tokens.startup);
  test("GET /search?q=test", searchRes.ok,
    searchRes.data?.message || `Status: ${searchRes.status}`);

  const emptySearchRes = await GET("/search?q=a", state.tokens.startup);
  test("GET /search with short query returns empty", 
    emptySearchRes.ok && emptySearchRes.data?.total === 0);

  subsection("Suggestions & Trending");

  const suggestRes = await GET("/search/suggestions?q=tech", state.tokens.startup);
  test("GET /search/suggestions", suggestRes.ok,
    suggestRes.data?.message);

  const trendingRes = await GET("/search/trending", state.tokens.startup);
  test("GET /search/trending", trendingRes.ok,
    trendingRes.data?.message);
}

// ============================================
// ANALYTICS MODULE TESTS
// ============================================

async function testAnalyticsModule() {
  section("ANALYTICS MODULE");

  if (!state.tokens.startup) {
    skip("Analytics tests", "No auth token");
    return;
  }

  subsection("Dashboard Endpoints");

  const overviewRes = await GET("/analytics/overview", state.tokens.startup);
  test("GET /analytics/overview", overviewRes.ok,
    overviewRes.data?.message || `Status: ${overviewRes.status}`);

  const industriesRes = await GET("/analytics/industries", state.tokens.startup);
  test("GET /analytics/industries", industriesRes.ok,
    industriesRes.data?.message);

  const stagesRes = await GET("/analytics/stages", state.tokens.startup);
  test("GET /analytics/stages", stagesRes.ok,
    stagesRes.data?.message);

  const iecDistRes = await GET("/analytics/iec-distribution", state.tokens.startup);
  test("GET /analytics/iec-distribution", iecDistRes.ok,
    iecDistRes.data?.message);

  const capitalRes = await GET("/analytics/capital-flow?months=6", state.tokens.startup);
  test("GET /analytics/capital-flow", capitalRes.ok,
    capitalRes.data?.message);

  const pipelineRes = await GET("/analytics/pipeline-funnel", state.tokens.startup);
  test("GET /analytics/pipeline-funnel", pipelineRes.ok,
    pipelineRes.data?.message);

  const trustScoresRes = await GET("/analytics/trust-scores", state.tokens.startup);
  test("GET /analytics/trust-scores", trustScoresRes.ok,
    trustScoresRes.data?.message);

  const activityRes = await GET("/analytics/activity?limit=20", state.tokens.startup);
  test("GET /analytics/activity", activityRes.ok,
    activityRes.data?.message);

  const dashboardRes = await GET("/analytics/dashboard", state.tokens.startup);
  test("GET /analytics/dashboard (all-in-one)", dashboardRes.ok,
    dashboardRes.data?.message);
}

// ============================================
// SOCIAL MODULE TESTS
// ============================================

async function testSocialModule() {
  section("SOCIAL MODULE");

  if (!state.tokens.startup) {
    skip("Social tests", "No auth token");
    return;
  }

  // Get an org to follow
  const meRes = await GET("/auth/me", state.tokens.startup);
  let targetOrgId = null;
  
  if (meRes.ok) {
    targetOrgId = meRes.data?.user?.org_id || meRes.data?.org_id;
  }

  subsection("Follow System");

  const followingRes = await GET("/social/following", state.tokens.startup);
  test("GET /social/following", followingRes.ok,
    followingRes.data?.message || `Status: ${followingRes.status}`);

  if (targetOrgId) {
    const followStatusRes = await GET(`/social/follow/${targetOrgId}/status`, state.tokens.startup);
    test("GET /social/follow/:orgId/status", followStatusRes.ok,
      followStatusRes.data?.message);

    const followersRes = await GET(`/social/orgs/${targetOrgId}/followers`, state.tokens.startup);
    test("GET /social/orgs/:orgId/followers", followersRes.ok,
      followersRes.data?.message);

    const followerCountRes = await GET(`/social/orgs/${targetOrgId}/follower-count`, state.tokens.startup);
    test("GET /social/orgs/:orgId/follower-count", followerCountRes.ok,
      followerCountRes.data?.message);
  }

  subsection("Share System");

  if (targetOrgId) {
    const shareRes = await POST("/social/share", {
      entity_type: "org",
      entity_id: targetOrgId,
      platform: "linkedin"
    }, state.tokens.startup);
    
    test("POST /social/share", shareRes.ok,
      shareRes.data?.message || `Status: ${shareRes.status}`);

    const shareCountRes = await GET(`/social/shares/org/${targetOrgId}/count`, state.tokens.startup);
    test("GET /social/shares/:type/:id/count", shareCountRes.ok,
      shareCountRes.data?.message);

    const shareBreakdownRes = await GET(`/social/shares/org/${targetOrgId}/breakdown`, state.tokens.startup);
    test("GET /social/shares/:type/:id/breakdown", shareBreakdownRes.ok,
      shareBreakdownRes.data?.message);
  }

  subsection("Activity Feed");

  const feedRes = await GET("/social/feed?limit=10", state.tokens.startup);
  test("GET /social/feed", feedRes.ok,
    feedRes.data?.message || `Status: ${feedRes.status}`);

  if (targetOrgId) {
    const orgFeedRes = await GET(`/social/orgs/${targetOrgId}/feed?limit=10`, state.tokens.startup);
    test("GET /social/orgs/:orgId/feed", orgFeedRes.ok || orgFeedRes.status === 404,
      orgFeedRes.data?.message);
  }
}

// ============================================
// ADMIN MODULE TESTS
// ============================================

async function testAdminModule() {
  section("ADMIN MODULE");

  if (!state.tokens.admin) {
    skip("Admin tests", "No admin token");
    return;
  }

  subsection("Dashboard Metrics");

  const metricsRes = await GET("/admin/dashboard/metrics", state.tokens.admin);
  test("GET /admin/dashboard/metrics", metricsRes.ok,
    metricsRes.data?.message || `Status: ${metricsRes.status}`);

  subsection("Audit Logs");

  const logsRes = await GET("/admin/audit-logs?take=20", state.tokens.admin);
  test("GET /admin/audit-logs", logsRes.ok,
    logsRes.data?.message);

  subsection("Matches Overview");

  const matchesRes = await GET("/admin/matches", state.tokens.admin);
  test("GET /admin/matches", matchesRes.ok,
    matchesRes.data?.message);

  subsection("User Approvals");

  const pendingRes = await GET("/admin/approvals/pending", state.tokens.admin);
  test("GET /admin/approvals/pending", pendingRes.ok,
    pendingRes.data?.message);
}

// ============================================
// CLEANUP
// ============================================

async function cleanup() {
  section("CLEANUP");

  if (!state.tokens.startup) {
    console.log("  No cleanup needed (no token)");
    return;
  }

  // Delete created projects
  for (const projectId of state.createdIds.projects) {
    const delRes = await DELETE(`/projects/${projectId}`, null, state.tokens.startup);
    if (delRes.ok) {
      console.log(`  🧹 Deleted project ${projectId}`);
    } else {
      warn(`Failed to delete project ${projectId}`);
    }
  }
}

// ============================================
// MAIN RUNNER
// ============================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     IEC HUB - COMPREHENSIVE E2E API TEST SUITE             ║");
  console.log("║     Date: " + new Date().toISOString().slice(0, 19) + "                          ║");
  console.log("║     API: " + API_BASE.padEnd(47) + " ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  // Module test functions map
  const modules = {
    auth: testAuthModule,
    org: testOrgModule,
    projects: testProjectsModule,
    iec: testIecModule,
    matching: testMatchingModule,
    dataroom: testDataRoomModule,
    search: testSearchModule,
    analytics: testAnalyticsModule,
    social: testSocialModule,
    admin: testAdminModule
  };

  try {
    if (MODULE_FILTER) {
      // Run single module
      const testFn = modules[MODULE_FILTER.toLowerCase()];
      if (testFn) {
        await testFn();
      } else {
        console.error(`Unknown module: ${MODULE_FILTER}`);
        console.log(`Available modules: ${Object.keys(modules).join(", ")}`);
        process.exit(1);
      }
    } else {
      // Run all modules
      for (const testFn of Object.values(modules)) {
        await testFn();
        await sleep(100); // Small delay between modules
      }
    }

    // Cleanup
    if (!MODULE_FILTER) {
      await cleanup();
    }

  } catch (error) {
    console.error("\n💥 Fatal error:", error.message);
    results.errors.push({ test: "FATAL", details: error.message });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("═".repeat(60));
  console.log(`  Total Tests:  ${results.total}`);
  console.log(`  ✅ Passed:    ${results.passed}`);
  console.log(`  ❌ Failed:    ${results.failed}`);
  console.log(`  ⏭️  Skipped:   ${results.skipped}`);
  console.log(`  ⏱️  Duration:  ${duration}s`);
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${results.warnings.length}):`);
    results.warnings.forEach(w => console.log(`     - ${w}`));
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Failed Tests (${results.errors.length}):`);
    results.errors.forEach(e => {
      console.log(`     - ${e.test}`);
      if (e.details) console.log(`       ${e.details}`);
    });
  }

  console.log("\n" + "═".repeat(60));
  
  const passRate = results.total > 0 
    ? ((results.passed / results.total) * 100).toFixed(1) 
    : 0;
  
  if (results.failed === 0) {
    console.log(`🎉 All tests passed! (${passRate}% pass rate)`);
  } else {
    console.log(`⚠️  ${results.failed} test(s) failed (${passRate}% pass rate)`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run
main().catch(console.error);
