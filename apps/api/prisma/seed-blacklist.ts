/**
 * Seed Email Domain Blacklist for KYB
 * Run: npx ts-node prisma/seed-blacklist.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BLACKLISTED_DOMAINS = [
  // Major personal email providers
  { domain: 'gmail.com', reason: 'Personal email provider - Google' },
  { domain: 'googlemail.com', reason: 'Personal email provider - Google' },
  { domain: 'yahoo.com', reason: 'Personal email provider - Yahoo' },
  { domain: 'yahoo.co.uk', reason: 'Personal email provider - Yahoo' },
  { domain: 'yahoo.co.in', reason: 'Personal email provider - Yahoo' },
  { domain: 'ymail.com', reason: 'Personal email provider - Yahoo' },
  { domain: 'hotmail.com', reason: 'Personal email provider - Microsoft' },
  { domain: 'hotmail.co.uk', reason: 'Personal email provider - Microsoft' },
  { domain: 'outlook.com', reason: 'Personal email provider - Microsoft' },
  { domain: 'outlook.co.uk', reason: 'Personal email provider - Microsoft' },
  { domain: 'live.com', reason: 'Personal email provider - Microsoft' },
  { domain: 'msn.com', reason: 'Personal email provider - Microsoft' },
  { domain: 'icloud.com', reason: 'Personal email provider - Apple' },
  { domain: 'me.com', reason: 'Personal email provider - Apple' },
  { domain: 'mac.com', reason: 'Personal email provider - Apple' },
  { domain: 'aol.com', reason: 'Personal email provider - AOL' },
  
  // Privacy-focused providers
  { domain: 'protonmail.com', reason: 'Personal email provider - Proton' },
  { domain: 'proton.me', reason: 'Personal email provider - Proton' },
  { domain: 'tutanota.com', reason: 'Personal email provider - Tutanota' },
  { domain: 'tutamail.com', reason: 'Personal email provider - Tutanota' },
  
  // Other common personal providers
  { domain: 'mail.com', reason: 'Personal email provider' },
  { domain: 'email.com', reason: 'Personal email provider' },
  { domain: 'zoho.com', reason: 'Personal email provider' },
  { domain: 'zohomail.com', reason: 'Personal email provider' },
  { domain: 'fastmail.com', reason: 'Personal email provider' },
  { domain: 'gmx.com', reason: 'Personal email provider' },
  { domain: 'gmx.net', reason: 'Personal email provider' },
  { domain: 'inbox.com', reason: 'Personal email provider' },
  { domain: 'rocketmail.com', reason: 'Personal email provider' },
  
  // Temporary email providers
  { domain: 'tempmail.com', reason: 'Temporary email provider' },
  { domain: 'temp-mail.org', reason: 'Temporary email provider' },
  { domain: 'guerrillamail.com', reason: 'Temporary email provider' },
  { domain: 'mailinator.com', reason: 'Temporary email provider' },
  { domain: '10minutemail.com', reason: 'Temporary email provider' },
  { domain: 'throwaway.email', reason: 'Temporary email provider' },
  { domain: 'yopmail.com', reason: 'Temporary email provider' },
  { domain: 'fakeinbox.com', reason: 'Temporary email provider' },
  { domain: 'sharklasers.com', reason: 'Temporary email provider' },
  { domain: 'guerrillamail.info', reason: 'Temporary email provider' },
  { domain: 'grr.la', reason: 'Temporary email provider' },
  { domain: 'dispostable.com', reason: 'Temporary email provider' },
  
  // Vietnam personal emails
  { domain: 'fpt.vn', reason: 'Vietnam ISP personal email' },
  { domain: 'vnn.vn', reason: 'Vietnam ISP personal email' },
];

async function main() {
  console.log('🌱 Seeding Email Domain Blacklist...');
  
  for (const item of BLACKLISTED_DOMAINS) {
    await prisma.emailDomainBlacklist.upsert({
      where: { domain: item.domain },
      update: { reason: item.reason },
      create: {
        domain: item.domain,
        reason: item.reason,
      },
    });
    console.log(`  ✓ ${item.domain}`);
  }
  
  console.log(`\n✅ Seeded ${BLACKLISTED_DOMAINS.length} blacklisted domains`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
