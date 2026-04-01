/**
 * seed-enhance.ts — P3-17: Làm dữ liệu seed sinh động hơn
 *
 * Script này KHÔNG xóa dữ liệu cũ — chỉ UPDATE và INSERT thêm
 * để tạo dữ liệu phong phú hơn:
 *   - last_activity_at thực tế cho projects (rải 1–95 ngày trước)
 *   - TrustScore đa dạng cho các org
 *   - Vouch giữa các org
 *   - MatchEvent history cho các match
 *   - view_count và interest_count thực tế
 *
 * Chạy: npx ts-node -r tsconfig-paths/register src/seed-enhance.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('✨ Starting seed-enhance — enriching existing data...');

  // ─── 1. Lấy tất cả dữ liệu hiện có ─────────────────────────────────────
  const [orgs, projects, matches, users] = await Promise.all([
    prisma.org.findMany(),
    prisma.project.findMany(),
    prisma.match.findMany(),
    prisma.user.findMany({ where: { user_type: { in: ['STARTUP', 'INVESTOR', 'ADMIN'] } } }),
  ]);

  console.log(`Found: ${orgs.length} orgs, ${projects.length} projects, ${matches.length} matches`);

  if (orgs.length === 0) {
    console.log('⚠️  No orgs found — run seed.ts or seed-full.ts first');
    return;
  }

  // ─── 2. Update last_activity_at + view/interest counts trên projects ────
  const activityDistribution = [3, 7, 14, 21, 30, 45, 60, 75, 95, 100];
  for (let i = 0; i < projects.length; i++) {
    const daysBack = activityDistribution[i % activityDistribution.length];
    const viewCount = randInt(50, 800);
    const interestCount = randInt(2, Math.round(viewCount * 0.15));

    await prisma.project.update({
      where: { id: projects[i].id },
      data: {
        last_activity_at: daysAgo(daysBack),
        view_count: viewCount,
        interest_count: interestCount,
        status: 'published',
      },
    }).catch(() => {
      // Field mungkin belum ada — skip gracefully
    });
  }
  console.log(`✅ Updated ${projects.length} projects with last_activity_at + view/interest counts`);

  // ─── 3. Upsert TrustScore cho mỗi org ───────────────────────────────────
  const trustDistribution = [
    { score: 85, profile_score: 90, iec_score: 80, vouch_score: 85, audit_score: 85 }, // Elite
    { score: 72, profile_score: 75, iec_score: 70, vouch_score: 70, audit_score: 73 }, // Trusted
    { score: 65, profile_score: 70, iec_score: 60, vouch_score: 65, audit_score: 65 }, // Trusted
    { score: 50, profile_score: 60, iec_score: 45, vouch_score: 50, audit_score: 45 }, // Verified
    { score: 42, profile_score: 50, iec_score: 38, vouch_score: 40, audit_score: 40 }, // Verified
    { score: 28, profile_score: 35, iec_score: 20, vouch_score: 25, audit_score: 32 }, // Newcomer
    { score: 15, profile_score: 20, iec_score: 10, vouch_score: 12, audit_score: 18 }, // Newcomer
  ];

  for (let i = 0; i < orgs.length; i++) {
    const td = trustDistribution[i % trustDistribution.length];
    await prisma.trustScore.upsert({
      where: { org_id: orgs[i].id },
      update: { ...td, last_calculated: daysAgo(randInt(0, 3)) },
      create: {
        id: randomUUID(),
        org_id: orgs[i].id,
        ...td,
        last_calculated: daysAgo(randInt(0, 3)),
      },
    });
  }
  console.log(`✅ Upserted TrustScore for ${orgs.length} orgs`);

  // ─── 4. Tạo Vouch giữa các org (skip nếu đã tồn tại) ───────────────────
  const vouchTypes = ['partnership', 'transaction', 'reference'];
  let vouchCreated = 0;

  for (let i = 0; i < Math.min(orgs.length, 6); i++) {
    for (let j = i + 1; j < Math.min(orgs.length, 6); j++) {
      if (Math.random() > 0.5) continue; // ~50% chance để tạo vouch pair
      try {
        await prisma.vouch.create({
          data: {
            id: randomUUID(),
            vouching_org_id: orgs[i].id,
            vouched_org_id: orgs[j].id,
            vouch_type: pick(vouchTypes),
            notes: 'Strong collaboration track record',
            status: 'active',
          },
        });
        vouchCreated++;
      } catch {
        // unique constraint — already exists, skip
      }
    }
  }
  console.log(`✅ Created ${vouchCreated} new Vouches`);

  // ─── 5. Tạo MatchEvent history cho các match ────────────────────────────
  const actorId = users[0]?.id;
  if (!actorId) {
    console.log('⚠️  No users found for MatchEvent actor — skipping');
  } else {
    let eventsCreated = 0;

    const stageProgression = [
      { old: null, new: 'pending_intro', note: 'Match created' },
      { old: 'pending_intro', new: 'intro_done', note: 'Introduction made' },
      { old: 'intro_done', new: 'in_discussion', note: 'Active discussions started' },
    ];

    for (const match of matches) {
      // Kiểm tra đã có event chưa
      const existingCount = await prisma.matchEvent.count({ where: { match_id: match.id } });
      if (existingCount > 0) continue;

      // Tạo 1–3 events lịch sử cho mỗi match
      const steps = stageProgression.slice(0, randInt(1, 3));
      for (let s = 0; s < steps.length; s++) {
        const step = steps[s];
        await prisma.matchEvent.create({
          data: {
            id: randomUUID(),
            org_id: match.org_id,
            match_id: match.id,
            event_type: 'status_changed',
            old_status: step.old,
            new_status: step.new,
            actor_id: actorId,
            note: step.note,
            created_by: actorId,
            created_at: daysAgo(randInt(s * 3, s * 3 + 10)),
          },
        });
        eventsCreated++;
      }
    }
    console.log(`✅ Created ${eventsCreated} MatchEvent history entries`);
  }

  console.log('\n🎉 seed-enhance complete! Data is now more vibrant.');
}

main()
  .catch((e) => {
    console.error('❌ seed-enhance failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
