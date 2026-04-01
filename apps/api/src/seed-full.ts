import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Generate valid UUID
const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function main() {
  console.log('🌱 Starting comprehensive seed data creation...');

  // Hash password
  const hashedPassword = await hash('Admin123!', 10);

  // Upsert Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@iec-hub.com' },
    update: {},
    create: {
      id: generateUuid(),
      email: 'admin@iec-hub.com',
      full_name: 'System Admin',
      user_type: 'ADMIN',
      approval_status: 'approved',
      password_hash: hashedPassword,
    },
  });

  // Upsert Org
  const org = await prisma.org.upsert({
    where: { id: generateUuid() },
    update: {},
    create: {
      id: generateUuid(),
      name: 'IEC Hub',
    },
  });

  // Update admin user with org
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { org_id: org.id },
  });

  // Create 5 Startup Users
  const startupUsers = [];
  const startupProfiles = [];
  const startupProjects = [];

  const startupData = [
    { name: 'AI Startup Inc.', email: 'startup1@iec-hub.com', industry: 'Technology', stage: 'Seed', team_size: 5 },
    { name: 'GreenEnergy Solutions', email: 'startup2@iec-hub.com', industry: 'Clean Energy', stage: 'Seed', team_size: 8 },
    { name: 'MediConnect AI', email: 'startup3@iec-hub.com', industry: 'Healthcare', stage: 'Series A', team_size: 12 },
    { name: 'FinTech Innovations', email: 'startup4@iec-hub.com', industry: 'Finance', stage: 'Seed', team_size: 6 },
    { name: 'EdTech Platform', email: 'startup5@iec-hub.com', industry: 'Education', stage: 'Series A', team_size: 10 }
  ];

  for (let i = 0; i < startupData.length; i++) {
    const data = startupData[i];

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: generateUuid(),
        email: data.email,
        full_name: data.name,
        user_type: 'STARTUP',
        approval_status: 'approved',
        password_hash: hashedPassword,
        org_id: org.id,
      },
    });
    startupUsers.push(user);

    const profile = await prisma.startupProfile.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        id: generateUuid(),
        user_id: user.id,
        org_id: org.id,
        company_name: data.name,
        company_description: `A cutting-edge ${data.industry} startup with innovative solutions. Founded by a team of ${data.team_size} experienced professionals.`,
        industry: data.industry,
        funding_stage: data.stage,
        team_size: data.team_size,
      },
    });
    startupProfiles.push(profile);

    // Create 5 projects per startup
    for (let j = 1; j <= 5; j++) {
      const project = await prisma.project.create({
        data: {
          id: generateUuid(),
          org_id: org.id,
          startup_id: profile.id,
          title: `${data.name} - Project ${j}`,
          summary: `Project ${j} of ${data.name} - A revolutionary solution in ${data.industry} that addresses key market needs with AI-powered technology and scalable business model.`,
          industry: data.industry,
          stage: data.stage,
          funding_need_amount: Math.floor(Math.random() * 500000) + 100000,
          funding_currency: 'USD',
          status: 'active',
        },
      });
      startupProjects.push(project);

      // Create data room for each project
      await prisma.dataRoom.create({
        data: {
          id: generateUuid(),
          org_id: org.id,
          project_id: project.id,
          title: `${data.name} Project ${j} Documents`,
          description: `All documents for ${data.name} Project ${j} including pitch deck, financials, and team bios.`,
        },
      });
    }
  }

  // Create 5 Investor Users
  const investorUsers = [];
  const investorProfiles = [];

  const investorData = [
    { name: 'Venture Capital Co.', email: 'investor1@iec-hub.com', focus: 'AI, SaaS', stage: 'Seed, Series A', min_amount: 100000, max_amount: 1000000 },
    { name: 'Angel Investors Network', email: 'investor2@iec-hub.com', focus: 'Clean Energy, Healthcare', stage: 'Seed', min_amount: 50000, max_amount: 500000 },
    { name: 'Tech Growth Fund', email: 'investor3@iec-hub.com', focus: 'Finance, EdTech', stage: 'Series A, Series B', min_amount: 500000, max_amount: 5000000 },
    { name: 'Impact Capital Partners', email: 'investor4@iec-hub.com', focus: 'Clean Energy, Healthcare, Education', stage: 'Seed, Series A', min_amount: 100000, max_amount: 2000000 },
    { name: 'Global Innovation Fund', email: 'investor5@iec-hub.com', focus: 'Technology, Finance', stage: 'Seed, Series A, Series B', min_amount: 250000, max_amount: 2500000 }
  ];

  for (let i = 0; i < investorData.length; i++) {
    const data = investorData[i];

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: generateUuid(),
        email: data.email,
        full_name: data.name,
        user_type: 'INVESTOR',
        approval_status: 'approved',
        password_hash: hashedPassword,
        org_id: org.id,
      },
    });
    investorUsers.push(user);

    const profile = await prisma.investorProfile.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        id: generateUuid(),
        user_id: user.id,
        org_id: org.id,
        company_name: data.name,
        investment_focus: data.focus,
        investment_stage: data.stage,
        investment_amount_min: data.min_amount,
        investment_amount_max: data.max_amount,
      },
    });
    investorProfiles.push(profile);
  }

  // Create 20 matches between startups and investors
  const matches = [];
  for (let i = 0; i < 20; i++) {
    const startupIndex = i % startupProfiles.length;
    const investorIndex = i % investorProfiles.length;

    const match = await prisma.match.create({
      data: {
        id: generateUuid(),
        org_id: org.id,
        project_id: startupProjects[i % startupProjects.length].id,
        startup_id: startupProfiles[startupIndex].id,
        investor_id: investorProfiles[investorIndex].id,
        status: ['intro_requested', 'intro_accepted', 'due_diligence', 'term_sheet', 'closed'][i % 5],
      },
    });
    matches.push(match);

    // Create conversation for each match
    const conversation = await prisma.conversation.create({
      data: {
        id: generateUuid(),
        org_id: org.id,
        match_id: match.id,
        participant1_id: startupUsers[startupIndex].id,
        participant2_id: investorUsers[investorIndex].id,
      },
    });

    // Create 3-5 messages per conversation
    const messages = [
      `Hi, I'm the founder of ${startupProfiles[startupIndex].company_name}. Thanks for your interest!`,
      `Hi! This looks promising. Can you share your pitch deck?`,
      `Of course! Here's our pitch deck with detailed financial projections.`,
      `Thanks for sharing. We'd love to schedule a meeting to discuss further.`,
      `Great! Let me know your availability for next week.`
    ];

    for (let j = 0; j < Math.floor(Math.random() * 3) + 3; j++) {
      await prisma.message.create({
        data: {
          id: generateUuid(),
          org_id: org.id,
          conversation_id: conversation.id,
          sender_id: j % 2 === 0 ? startupUsers[startupIndex].id : investorUsers[investorIndex].id,
          content: messages[j % messages.length],
          type: 'TEXT',
        },
      });
    }
  }

  // Create notifications for each user
  const notificationTypes = [
    'match_created_startup',
    'match_created_investor',
    'data_room_request_created',
    'data_room_request_updated',
    'iec_level_updated'
  ];

  for (const user of [...startupUsers, ...investorUsers]) {
    for (let i = 0; i < 10; i++) {
      await prisma.notification.create({
        data: {
          id: generateUuid(),
          org_id: org.id,
          recipient_user_id: user.id,
          type: notificationTypes[i % notificationTypes.length],
          payload: {
            project_id: startupProjects[i % startupProjects.length]?.id,
            investor_id: investorUsers[i % investorUsers.length]?.id,
            startup_id: startupUsers[i % startupUsers.length]?.id,
            status: ['pending', 'approved', 'rejected'][i % 3],
          },
          read_at: i < 5 ? new Date() : null,
        },
      });
    }
  }

  // Create 15 audit logs
  const auditActions = [
    'user_login',
    'user_logout',
    'project_created',
    'project_updated',
    'match_created',
    'match_updated',
    'data_room_accessed',
    'message_sent',
    'notification_read',
    'profile_updated'
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.auditLog.create({
      data: {
        id: generateUuid(),
        org_id: org.id,
        actor_id: adminUser.id,
        action: auditActions[i % auditActions.length],
        entity_type: i < 5 ? 'user' : i < 10 ? 'project' : 'match',
        entity_id: i < 5 ? startupUsers[i % startupUsers.length]?.id : i < 10 ? startupProjects[i % startupProjects.length]?.id : matches[i % matches.length]?.id,
        payload_before: {},
        payload_after: { ip: '127.0.0.1', user_agent: 'Mozilla/5.0' },
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Comprehensive seed data created successfully!');
  console.log('=== Credentials ===');
  console.log('Admin: admin@iec-hub.com / Admin123!');
  for (let i = 0; i < startupUsers.length; i++) {
    console.log(`Startup ${i + 1}: ${startupUsers[i].email} / Admin123!`);
  }
  for (let i = 0; i < investorUsers.length; i++) {
    console.log(`Investor ${i + 1}: ${investorUsers[i].email} / Admin123!`);
  }
  console.log('===================');
  console.log('');
  console.log('📊 Data Summary:');
  console.log(`- 5 Startups with 5 projects each = ${startupProjects.length} projects`);
  console.log(`- 5 Investors with investment focus`);
  console.log(`- 20 Matches between startups and investors`);
  console.log(`- 20 Conversations with messages`);
  console.log(`- 100 Notifications (10 per user)`);
  console.log(`- 15 Audit logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });