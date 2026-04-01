/**
 * Upsert 3 tác nhân E2E: startup, investor, admin — user_type chữ thường (khớp RolesGuard / JWT).
 * Chạy: pnpm --filter api db:seed:e2e-actors
 * Hoặc: cd apps/api && node prisma/seed-e2e-actors.cjs
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const PASSWORD = process.env.E2E_PASSWORD || "TestPass123!";
const ROUNDS = 12;

const STARTUP_EMAIL = "startup-e2e@test.com";
const INVESTOR_EMAIL = "investor-e2e@test.com";
const ADMIN_EMAIL = "admin-e2e@test.com";

async function main() {
  console.log("🌱 Seeding E2E actors (startup / investor / admin)...");

  const password_hash = await bcrypt.hash(PASSWORD, ROUNDS);

  let org = await prisma.org.findFirst({
    where: {
      OR: [
        { name: "Meridian Launch Studio" },
        { name: "IEC Hub" },
      ],
    },
  });
  if (!org) {
    org = await prisma.org.create({
      data: { id: randomUUID(), name: "Meridian Launch Studio" },
    });
  } else if (org.name === "IEC Hub") {
    org = await prisma.org.update({
      where: { id: org.id },
      data: { name: "Meridian Launch Studio" },
    });
  }

  const startupUser = await prisma.user.upsert({
    where: { email: STARTUP_EMAIL },
    update: {
      password_hash,
      approval_status: "approved",
      user_type: "startup",
      org_id: org.id,
      full_name: "Jordan Park",
    },
    create: {
      id: randomUUID(),
      email: STARTUP_EMAIL,
      full_name: "Jordan Park",
      user_type: "startup",
      approval_status: "approved",
      password_hash,
      org_id: org.id,
    },
  });

  await prisma.startupProfile.upsert({
    where: { user_id: startupUser.id },
    update: {
      org_id: org.id,
      company_name: "HelioVolt Labs",
      company_description:
        "Building software-defined power for commercial buildings and light industry — pilots in two regions with measurable demand-response savings.",
      industry: "energy",
      funding_stage: "Seed",
      team_size: 10,
    },
    create: {
      id: randomUUID(),
      user_id: startupUser.id,
      org_id: org.id,
      company_name: "HelioVolt Labs",
      company_description:
        "Building software-defined power for commercial buildings and light industry — pilots in two regions with measurable demand-response savings.",
      industry: "energy",
      funding_stage: "Seed",
      team_size: 10,
    },
  });

  const investorUser = await prisma.user.upsert({
    where: { email: INVESTOR_EMAIL },
    update: {
      password_hash,
      approval_status: "approved",
      user_type: "investor",
      org_id: org.id,
      full_name: "Alex Rivera",
    },
    create: {
      id: randomUUID(),
      email: INVESTOR_EMAIL,
      full_name: "Alex Rivera",
      user_type: "investor",
      approval_status: "approved",
      password_hash,
      org_id: org.id,
    },
  });

  await prisma.investorProfile.upsert({
    where: { user_id: investorUser.id },
    update: {
      org_id: org.id,
      company_name: "Cedarline Partners",
      investment_focus: "Climate, energy software, industrial IoT",
      investment_stage: "Seed — Series B",
      investment_amount_min: 50000,
      investment_amount_max: 2000000,
    },
    create: {
      id: randomUUID(),
      user_id: investorUser.id,
      org_id: org.id,
      company_name: "Cedarline Partners",
      investment_focus: "Climate, energy software, industrial IoT",
      investment_stage: "Seed — Series B",
      investment_amount_min: 50000,
      investment_amount_max: 2000000,
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password_hash,
      approval_status: "approved",
      user_type: "admin",
      org_id: org.id,
      full_name: "Sam Okonkwo",
    },
    create: {
      id: randomUUID(),
      email: ADMIN_EMAIL,
      full_name: "Sam Okonkwo",
      user_type: "admin",
      approval_status: "approved",
      password_hash,
      org_id: org.id,
    },
  });

  console.log("✅ E2E actors ready (same org:", org.name, ")");
  console.log("   Startup:", STARTUP_EMAIL, "/", PASSWORD);
  console.log("   Investor:", INVESTOR_EMAIL, "/", PASSWORD);
  console.log("   Admin:", ADMIN_EMAIL, "/", PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
