#!/usr/bin/env node
/**
 * IEC Hub - Automated System Test Script
 * This script tests all API endpoints and reports issues
 * 
 * Usage: node scripts/auto-test.cjs
 * 
 * Test Accounts (password: 123456):
 * - startup1@iechub.local (Startup)
 * - investor1@iechub.local (Investor)
 * - admin@iechub.local (Admin)
 */

const API_BASE = "http://localhost:3001/api";

// Test accounts
const TEST_ACCOUNTS = {
  startup: { email: "startup1@iechub.local", password: "123456" },
  investor: { email: "investor1@iechub.local", password: "123456" },
  admin: { email: "admin@iechub.local", password: "123456" }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Token storage
let tokens = {
  startup: null,
  investor: null,
  admin: null
};

// Helper functions
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    
    const data = await response.json().catch(() => null);
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

async function authRequest(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
}

function log(type, message) {
  const icons = {
    pass: "✅",
    fail: "❌",
    info: "ℹ️",
    warn: "⚠️",
    section: "📋"
  };
  console.log(`${icons[type] || ""} ${message}`);
}

function test(name, passed, details = "") {
  if (passed) {
    results.passed++;
    log("pass", `${name}`);
  } else {
    results.failed++;
    log("fail", `${name}${details ? `: ${details}` : ""}`);
    results.errors.push({ name, details });
  }
  return passed;
}

// =====================
// TEST SUITES
// =====================

async function testHealthCheck() {
  log("section", "\n=== HEALTH CHECK ===");
  
  // Test if API is running
  const res = await request("/");
  test("API responds", res.status !== 0, `Status: ${res.status}`);
}

async function testAuthentication() {
  log("section", "\n=== AUTHENTICATION ===");
  
  // Test login for each account type
  for (const [type, creds] of Object.entries(TEST_ACCOUNTS)) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(creds)
    });
    
    const passed = test(
      `Login as ${type} (${creds.email})`,
      res.ok && res.data?.tokens?.accessToken,
      res.ok ? "" : `Status ${res.status}: ${JSON.stringify(res.data)}`
    );
    
    if (passed) {
      tokens[type] = res.data.tokens.accessToken;
    }
  }
  
  // Test invalid login
  const invalidRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "invalid@test.com", password: "wrong" })
  });
  test("Reject invalid credentials", invalidRes.status === 401);
  
  // Test me endpoint
  if (tokens.startup) {
    const meRes = await authRequest("/me", tokens.startup);
    test("GET /me with valid token", meRes.ok && meRes.data?.user?.id);
  }
  
  // Test protected endpoint without token
  const noAuthRes = await request("/projects");
  test("Protected endpoint rejects without token", noAuthRes.status === 401);
}

async function testStartupFlows() {
  log("section", "\n=== STARTUP FLOWS ===");
  
  if (!tokens.startup) {
    log("warn", "Skipping startup tests - no token");
    return;
  }
  
  const token = tokens.startup;
  
  // Test GET my projects
  const projectsRes = await authRequest("/projects?owner=me", token);
  test("GET /projects?owner=me", projectsRes.ok, `Status: ${projectsRes.status}`);
  
  // Test GET all published projects
  const allProjectsRes = await authRequest("/projects", token);
  test("GET /projects (all published)", allProjectsRes.ok);
  
  // Test GET org profile
  const orgRes = await authRequest("/org/profile", token);
  test("GET /org/profile", orgRes.ok || orgRes.status === 404);
  
  // Test directory endpoints
  const startupsRes = await authRequest("/directory/startups", token);
  test("GET /directory/startups", startupsRes.ok);
  
  const investorsRes = await authRequest("/directory/investors", token);
  test("GET /directory/investors", investorsRes.ok);
  
  // Test services endpoint
  const servicesRes = await authRequest("/services", token);
  test("GET /services", servicesRes.ok);
  
  // Test data room requests
  const drReqRes = await authRequest("/data-room/requests/mine", token);
  test("GET /data-room/requests/mine", drReqRes.ok);
  
  // Test notifications
  const notifRes = await authRequest("/notifications", token);
  test("GET /notifications", notifRes.ok);
  
  // Test IEC endpoints
  const iecLevelsRes = await authRequest("/iec/levels", token);
  test("GET /iec/levels", iecLevelsRes.ok);
  
  const iecCriteriaRes = await authRequest("/iec/criteria", token);
  test("GET /iec/criteria", iecCriteriaRes.ok);
}

async function testInvestorFlows() {
  log("section", "\n=== INVESTOR FLOWS ===");
  
  if (!tokens.investor) {
    log("warn", "Skipping investor tests - no token");
    return;
  }
  
  const token = tokens.investor;
  
  // Test GET all published projects
  const projectsRes = await authRequest("/projects", token);
  test("Investor: GET /projects", projectsRes.ok);
  
  // Test directory endpoints
  const startupsRes = await authRequest("/directory/startups", token);
  test("Investor: GET /directory/startups", startupsRes.ok);
  
  // Test investor profile endpoints
  const investorsRes = await authRequest("/directory/investors", token);
  test("Investor: GET /directory/investors", investorsRes.ok);
  
  // Test data room requests
  const drReqRes = await authRequest("/data-room/requests/mine", token);
  test("Investor: GET /data-room/requests/mine", drReqRes.ok);
}

async function testAdminFlows() {
  log("section", "\n=== ADMIN FLOWS ===");
  
  if (!tokens.admin) {
    log("warn", "Skipping admin tests - no token");
    return;
  }
  
  const token = tokens.admin;
  
  // Test admin endpoints
  const metricsRes = await authRequest("/admin/dashboard/metrics", token);
  test("Admin: GET /admin/dashboard/metrics", metricsRes.ok);
  
  const pendingRes = await authRequest("/admin/approvals/pending", token);
  test("Admin: GET /admin/approvals/pending", pendingRes.ok);
  
  const matchesRes = await authRequest("/admin/matches", token);
  test("Admin: GET /admin/matches", matchesRes.ok);
  
  const auditRes = await authRequest("/admin/audit-logs", token);
  test("Admin: GET /admin/audit-logs", auditRes.ok);
  
  // Test IEC levels (general - not admin)
  const iecLevelsRes = await authRequest("/iec/levels", token);
  test("Admin: GET /iec/levels", iecLevelsRes.ok);
}

async function testPublicEndpoints() {
  log("section", "\n=== PUBLIC ENDPOINTS ===");
  
  // Public project page (if exists)
  const publicProjRes = await request("/public/project/test-slug");
  test("GET /public/project/:slug (404 expected for non-existent)", 
    publicProjRes.status === 404 || publicProjRes.ok);
}

// =====================
// MAIN EXECUTION
// =====================

async function runAllTests() {
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║     IEC Hub Automated System Test Suite           ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");
  
  console.log(`📍 Testing API at: ${API_BASE}`);
  console.log(`📅 Date: ${new Date().toLocaleString()}\n`);
  
  await testHealthCheck();
  await testAuthentication();
  await testStartupFlows();
  await testInvestorFlows();
  await testAdminFlows();
  await testPublicEndpoints();
  
  // Summary
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║                    TEST SUMMARY                   ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");
  
  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${percentage}%\n`);
  
  if (results.errors.length > 0) {
    console.log("🔍 Failed Tests:");
    for (const err of results.errors) {
      console.log(`   • ${err.name}${err.details ? ` - ${err.details}` : ""}`);
    }
    console.log("");
  }
  
  return results.failed === 0;
}

// Run
runAllTests()
  .then((allPassed) => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Test execution error:", error);
    process.exit(1);
  });
