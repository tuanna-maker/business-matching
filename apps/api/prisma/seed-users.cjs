const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  // Create Startup user
  const startup = await prisma.user.upsert({
    where: { email: 'startup@test.com' },
    update: {},
    create: {
      email: 'startup@test.com',
      password: hashedPassword,
      full_name: 'Startup User',
      user_type: 'STARTUP',
      approval_status: 'APPROVED',
      org: {
        create: {
          company_name: 'Test Startup',
          industry: 'Technology'
        }
      }
    }
  });
  console.log('✅ Created startup user:', startup.email);

  // Create Investor user
  const investor = await prisma.user.upsert({
    where: { email: 'investor@test.com' },
    update: {},
    create: {
      email: 'investor@test.com',
      password: hashedPassword,
      full_name: 'Investor User',
      user_type: 'INVESTOR',
      approval_status: 'APPROVED',
      org: {
        create: {
          company_name: 'Test Investor Fund',
          industry: 'Venture Capital'
        }
      }
    }
  });
  console.log('✅ Created investor user:', investor.email);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedAdminPassword,
      full_name: 'Admin User',
      user_type: 'ADMIN',
      approval_status: 'APPROVED'
    }
  });
  console.log('✅ Created admin user:', admin.email);

  console.log('\n🎉 Mock users created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
