const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data creation...');

  const password = 'Admin123!';
  const password_hash = await bcrypt.hash(password, 10);

  // Default org
  let org = await prisma.org.findFirst({
    where: { name: 'IEC Hub' }
  });
  if (!org) {
    org = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: 'IEC Hub'
      }
    });
  }

  // Seed startup user
  const startupEmail = 'seed-startup@iechub.local';
  const startupUser = await prisma.user.upsert({
    where: { email: startupEmail },
    update: {},
    create: {
      id: randomUUID(),
      full_name: 'Seed Startup',
      email: startupEmail,
      user_type: 'STARTUP',
      approval_status: 'approved',
      password_hash,
      org_id: org.id
    }
  });

  await prisma.startupProfile.upsert({
    where: { user_id: startupUser.id },
    update: {},
    create: {
      user_id: startupUser.id,
      org_id: org.id,
      company_name: 'Seed Startup Company',
      company_description: 'AI-powered business matching platform',
      industry: 'Technology',
      funding_stage: 'Seed',
      team_size: 5
    }
  });

  // Seed investor user
  const investorEmail = 'seed-investor@iechub.local';
  const investorUser = await prisma.user.upsert({
    where: { email: investorEmail },
    update: {},
    create: {
      id: randomUUID(),
      full_name: 'Seed Investor',
      email: investorEmail,
      user_type: 'INVESTOR',
      approval_status: 'approved',
      password_hash,
      org_id: org.id
    }
  });

  const investorProfile = await prisma.investorProfile.upsert({
    where: { user_id: investorUser.id },
    update: {},
    create: {
      user_id: investorUser.id,
      org_id: org.id,
      company_name: 'Seed Investor Org',
      investment_focus: 'AI, SaaS',
      investment_stage: 'Seed, Series A',
      investment_amount_min: 100000,
      investment_amount_max: 1000000
    }
  });

  // Admin user
  const adminEmail = 'seed-admin@iechub.local';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: randomUUID(),
      full_name: 'Seed Admin',
      email: adminEmail,
      user_type: 'ADMIN',
      approval_status: 'approved',
      password_hash,
      org_id: org.id
    }
  });

  // Create Project
  const startupProfile = await prisma.startupProfile.findUnique({
    where: { user_id: startupUser.id }
  });

  if (startupProfile) {
    const project = await prisma.project.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        startup_id: startupProfile.id,
        title: 'AI Business Matching Platform',
        summary: 'A platform to match startups with investors using AI',
        industry: 'Technology',
        stage: 'Seed',
        funding_need_amount: 500000,
        funding_currency: 'USD',
        status: 'active',
        iec_level: 'L1'
      }
    });

    // Create Data Room
    await prisma.dataRoom.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        project_id: project.id,
        title: 'Business Plan & Financials',
        description: 'Documents for investor review'
      }
    });

    // Create Match
    const match = await prisma.match.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        project_id: project.id,
        startup_id: startupProfile.id,
        investor_id: investorProfile.id,
        status: 'intro_requested'
      }
    });

    // Create Conversation
    const conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        match_id: match.id,
        participant1_id: startupUser.id,
        participant2_id: investorUser.id
      }
    });

    // Create Message
    await prisma.message.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        conversation_id: conversation.id,
        sender_id: startupUser.id,
        content: "Hi, I'm the founder of AI Startup Inc. Thanks for your interest!",
        type: 'TEXT'
      }
    });

    await prisma.message.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        conversation_id: conversation.id,
        sender_id: investorUser.id,
        content: 'Hi! This looks promising. Can you share your pitch deck?',
        type: 'TEXT'
      }
    });
  }

  console.log('✅ Seed data created successfully!');
  console.log('=== Credentials ===');
  console.log('Admin: seed-admin@iechub.local / Admin123!');
  console.log('Startup: seed-startup@iechub.local / Admin123!');
  console.log('Investor: seed-investor@iechub.local / Admin123!');
  console.log('===================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });