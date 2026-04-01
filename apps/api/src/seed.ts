import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Simple UUID generator
const generateUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function main() {
  console.log('🌱 Starting seed data creation...');

  // Hash password
  const hashedPassword = await hash('Admin123!', 10);

  // Generate UUIDs
  const adminUserId = generateUuid();
  const orgId = generateUuid();
  const startupUserId = generateUuid();
  const startupProfileId = generateUuid();
  const investorUserId = generateUuid();
  const investorProfileId = generateUuid();
  const projectId = generateUuid();
  const dataRoomId = generateUuid();
  const matchId = generateUuid();
  const conversationId = generateUuid();
  const message1Id = generateUuid();
  const message2Id = generateUuid();

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserId,
      email: 'admin@iec-hub.com',
      full_name: 'System Admin',
      user_type: 'ADMIN',
      approval_status: 'approved',
      password_hash: hashedPassword,
    },
  });

  // Create Org
  const org = await prisma.org.create({
    data: {
      id: orgId,
      name: 'IEC Hub',
    },
  });

  // Update admin user with org
  await prisma.user.update({
    where: { id: adminUserId },
    data: { org_id: orgId },
  });

  // Create Startup Profile
  const startupUser = await prisma.user.create({
    data: {
      id: startupUserId,
      email: 'startup@iec-hub.com',
      full_name: 'Startup Founder',
      user_type: 'STARTUP',
      approval_status: 'approved',
      password_hash: hashedPassword,
      org_id: orgId,
    },
  });

  const startupProfile = await prisma.startupProfile.create({
    data: {
      id: startupProfileId,
      user_id: startupUserId,
      org_id: orgId,
      company_name: 'AI Startup Inc.',
      company_description: 'AI-powered business matching platform',
      industry: 'Technology',
      funding_stage: 'Seed',
      team_size: 5,
    },
  });

  // Create Investor Profile
  const investorUser = await prisma.user.create({
    data: {
      id: investorUserId,
      email: 'investor@iec-hub.com',
      full_name: 'Angel Investor',
      user_type: 'INVESTOR',
      approval_status: 'approved',
      password_hash: hashedPassword,
      org_id: orgId,
    },
  });

  const investorProfile = await prisma.investorProfile.create({
    data: {
      id: investorProfileId,
      user_id: investorUserId,
      org_id: orgId,
      company_name: 'Venture Capital Co.',
      investment_focus: 'AI, SaaS',
      investment_stage: 'Seed, Series A',
      investment_amount_min: 100000,
      investment_amount_max: 1000000,
    },
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      id: projectId,
      org_id: orgId,
      startup_id: startupProfileId,
      title: 'AI Business Matching Platform',
      summary: 'A platform to match startups with investors using AI',
      industry: 'Technology',
      stage: 'Seed',
      funding_need_amount: 500000,
      funding_currency: 'USD',
      status: 'active',
    },
  });

  // Create Data Room
  const dataRoom = await prisma.dataRoom.create({
    data: {
      id: dataRoomId,
      org_id: orgId,
      project_id: projectId,
      title: 'Business Plan & Financials',
      description: 'Documents for investor review',
    },
  });

  // Create Match
  const match = await prisma.match.create({
    data: {
      id: matchId,
      org_id: orgId,
      project_id: projectId,
      startup_id: startupProfileId,
      investor_id: investorProfileId,
      status: 'intro_requested',
    },
  });

  // Create Conversation
  const conversation = await prisma.conversation.create({
    data: {
      id: conversationId,
      org_id: orgId,
      match_id: matchId,
      participant1_id: startupUserId,
      participant2_id: investorUserId,
    },
  });

  // Create Message
  await prisma.message.create({
    data: {
      id: message1Id,
      org_id: orgId,
      conversation_id: conversationId,
      sender_id: startupUserId,
      content: "Hi, I'm the founder of AI Startup Inc. Thanks for your interest!",
      type: 'TEXT',
    },
  });

  await prisma.message.create({
    data: {
      id: message2Id,
      org_id: orgId,
      conversation_id: conversationId,
      sender_id: investorUserId,
      content: "Hi! This looks promising. Can you share your pitch deck?",
      type: 'TEXT',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('=== Credentials ===');
  console.log('Admin: admin@iec-hub.com / Admin123!');
  console.log('Startup: startup@iec-hub.com / Admin123!');
  console.log('Investor: investor@iec-hub.com / Admin123!');
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
