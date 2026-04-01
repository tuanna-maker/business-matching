#!/usr/bin/env node
/**
 * IEC Hub - Seed Test Users for E2E Testing
 * 
 * Creates test users with organizations for comprehensive testing:
 * - startup-e2e@test.com (Startup with org)
 * - investor-e2e@test.com (Investor with org)
 * - admin-e2e@test.com (Admin user)
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const TEST_PASSWORD = "TestPass123!";

async function main() {
  console.log("🌱 Seeding E2E test users...\n");

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  // 1. Create Startup Org
  console.log("Creating startup organization...");
  const startupOrgId = randomUUID();
  const startupOrg = await prisma.org.upsert({
    where: { id: startupOrgId },
    update: {},
    create: {
      id: startupOrgId,
      name: "E2E Test Startup Inc.",
      org_type: "STARTUP",
      email: "contact@e2e-startup.test",
      website: "https://e2e-startup.test",
      verification_status: "approved",
      tax_id: "TAX-E2E-001",
      business_sector: "technology"
    }
  });
  console.log(`  ✅ Startup Org: ${startupOrg.name} (${startupOrg.id})`);

  // 2. Create Admin User
  console.log("\nCreating admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin-e2e@test.com" },
    update: { approval_status: "approved", user_type: "admin" },
    create: {
      id: randomUUID(),
      email: "admin-e2e@test.com",
      password_hash: passwordHash,
      full_name: "E2E Admin User",
      user_type: "admin",
      approval_status: "approved"
    }
  });
  console.log(`  ✅ Admin: ${adminUser.email}`);

  // 3. Create Startup User
  console.log("\nCreating startup user...");
  const startupUser = await prisma.user.upsert({
    where: { email: "startup-e2e@test.com" },
    update: { org_id: startupOrg.id, approval_status: "approved" },
    create: {
      id: randomUUID(),
      email: "startup-e2e@test.com",
      password_hash: passwordHash,
      full_name: "E2E Startup Owner",
      user_type: "startup",
      approval_status: "approved",
      org_id: startupOrg.id
    }
  });
  console.log(`  ✅ Startup User: ${startupUser.email}`);

  // Create startup profile
  const startupProfile = await prisma.startupProfile.upsert({
    where: { user_id: startupUser.id },
    update: {},
    create: {
      user_id: startupUser.id,
      org_id: startupOrg.id,
      company_name: startupOrg.name,
      industry: "technology",
      funding_stage: "seed",
      website: startupOrg.website
    }
  });
  console.log(`  ✅ Startup Profile created (${startupProfile.id})`);

  // 4. Create Investor Org
  console.log("\nCreating investor organization...");
  const investorOrgId = randomUUID();
  const investorOrg = await prisma.org.upsert({
    where: { id: investorOrgId },
    update: {},
    create: {
      id: investorOrgId,
      name: "E2E Test Capital Partners",
      org_type: "INVESTOR",
      email: "contact@e2e-capital.test",
      website: "https://e2e-capital.test",
      verification_status: "approved",
      tax_id: "TAX-E2E-002",
      business_sector: "finance"
    }
  });
  console.log(`  ✅ Investor Org: ${investorOrg.name} (${investorOrg.id})`);

  // 5. Create Investor User
  console.log("\nCreating investor user...");
  const investorUser = await prisma.user.upsert({
    where: { email: "investor-e2e@test.com" },
    update: { org_id: investorOrg.id, approval_status: "approved" },
    create: {
      id: randomUUID(),
      email: "investor-e2e@test.com",
      password_hash: passwordHash,
      full_name: "E2E Investor Partner",
      user_type: "investor",
      approval_status: "approved",
      org_id: investorOrg.id
    }
  });
  console.log(`  ✅ Investor User: ${investorUser.email}`);

  // Create investor profile
  await prisma.investorProfile.upsert({
    where: { user_id: investorUser.id },
    update: {},
    create: {
      user_id: investorUser.id,
      org_id: investorOrg.id,
      company_name: investorOrg.name,
      investment_focus: "technology, fintech, healthtech",
      investment_stage: "seed, series_a",
      investment_amount_min: 100000,
      investment_amount_max: 5000000,
      website: investorOrg.website
    }
  });
  console.log(`  ✅ Investor Profile created`);

  // 6. Create a sample project for testing
  console.log("\nCreating test project...");
  const projectId = randomUUID();
  const testProject = await prisma.project.upsert({
    where: { id: projectId },
    update: {},
    create: {
      id: projectId,
      title: "E2E Test Project - Tech Innovation",
      description: "A sample project for E2E testing purposes",
      industry: "technology",
      stage: "seed",
      funding_need_amount: 500000,
      status: "published",
      created_by: startupUser.id,
      startup_id: startupProfile.id,
      org_id: startupOrg.id,
      iec_level: "L1"
    }
  });
  console.log(`  ✅ Test Project: ${testProject.title}`);

  console.log("\n" + "═".repeat(50));
  console.log("🎉 E2E Test Users Seeded Successfully!");
  console.log("═".repeat(50));
  console.log("\nTest Accounts (password: TestPass123!):");
  console.log("  - admin-e2e@test.com     (Admin)");
  console.log("  - startup-e2e@test.com   (Startup with org)");
  console.log("  - investor-e2e@test.com  (Investor with org)");
  console.log(`\nOrg IDs:`);
  console.log(`  - Startup Org:  ${startupOrg.id}`);
  console.log(`  - Investor Org: ${investorOrg.id}`);
  console.log(`  - Project:      ${testProject.id}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("Error seeding test users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
