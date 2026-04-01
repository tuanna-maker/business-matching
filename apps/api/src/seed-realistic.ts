/**
 * seed-realistic.ts
 * Xoá toàn bộ dữ liệu test cũ và tạo lại dữ liệu thực tế, sinh động
 * gồm các startup/nhà đầu tư Việt Nam đang giới thiệu sản phẩm thật.
 *
 * Chạy: npx ts-node -r tsconfig-paths/register src/seed-realistic.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const PASSWORD = 'Demo123!';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ──────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

const STARTUPS = [
  {
    email: 'founder@vietmind.ai',
    fullName: 'Nguyễn Minh Tuấn',
    company: 'VietMind AI',
    description:
      'Nền tảng chăm sóc sức khoẻ tâm thần số đầu tiên tại Đông Nam Á, ứng dụng AI để cá nhân hoá liệu trình CBT và kết nối người dùng với chuyên gia tâm lý được cấp phép. Đã phục vụ hơn 45,000 người dùng tại Việt Nam và Philippines.',
    industry: 'HealthTech',
    stage: 'Series A',
    fundingNeed: 3_000_000,
    currency: 'USD',
    location: 'Hà Nội, Việt Nam',
    website: 'https://vietmind.ai',
    foundedYear: 2021,
    teamSize: 28,
    palette: 'aurora',
    growthPct: 34,
    iecLevel: 'L3',
    heroImage:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    projectTitle: 'VietMind AI — Mental Wellness Platform',
    projectSummary:
      'AI-powered mental health platform serving 45,000+ users across Southeast Asia with personalised CBT and licensed therapist network.',
    projectDesc:
      'VietMind AI giải quyết khoảng trống khổng lồ trong chăm sóc sức khoẻ tâm thần tại Đông Nam Á — nơi tỉ lệ nhà trị liệu / người dân chỉ là 1:100,000. Platform kết hợp AI screening (độ chính xác 89%), liệu trình CBT cá nhân hoá và mạng lưới hơn 200 chuyên gia tâm lý được cấp phép. Revenue model: subscription B2C (199k VNĐ/tháng) + B2B2C qua doanh nghiệp (đối tác hiện tại: Vingroup, FPT, Techcombank). MRR hiện tại: $48,000 (+34% MoM). Target raise: $3M Series A để mở rộng sang Thailand và Indonesia.',
    viewCount: 523,
    interestCount: 41,
    trustScore: 82,
  },
  {
    email: 'ceo@greenpackvn.com',
    fullName: 'Trần Thị Lan Anh',
    company: 'GreenPack Vietnam',
    description:
      'Công ty sản xuất bao bì xanh từ bã mía và sợi tre cho ngành FMCG. Khách hàng hiện tại gồm VinMart, Circle K và Loteria. Đã thay thế hơn 12 triệu túi nhựa dùng một lần trong năm 2024.',
    industry: 'GreenTech',
    stage: 'Seed',
    fundingNeed: 800_000,
    currency: 'USD',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    website: 'https://greenpackvn.com',
    foundedYear: 2022,
    teamSize: 14,
    palette: 'ocean',
    growthPct: 52,
    iecLevel: 'L2',
    heroImage:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    projectTitle: 'GreenPack — Sustainable FMCG Packaging',
    projectSummary:
      'Bao bì xanh từ bã mía & tre cho ngành FMCG — đã thay thế 12M túi nhựa, đối tác: VinMart, Circle K.',
    projectDesc:
      'GreenPack VN sản xuất bao bì phân huỷ sinh học 100% từ bã mía (bagasse) và sợi tre — chi phí sản xuất chỉ cao hơn 15% so với nhựa thông thường nhưng thời gian phân huỷ rút từ 500 năm xuống còn 90 ngày. Dây chuyền sản xuất tại Bình Dương có công suất 5 triệu sản phẩm/tháng. Mô hình B2B: bán trực tiếp cho chuỗi FMCG và nhà hàng. Doanh thu 2024: $420K (+52% YoY). Đang raise $800K Seed để mở rộng công suất và bổ sung sản phẩm màng bọc thực phẩm và hộp đựng.',
    viewCount: 387,
    interestCount: 28,
    trustScore: 65,
  },
  {
    email: 'founder@medtrackpro.io',
    fullName: 'Phạm Đức Hùng',
    company: 'MedTrack Pro',
    description:
      'Hệ thống quản lý chuỗi cung ứng dược phẩm dựa trên blockchain và IoT, giúp bệnh viện và nhà thuốc truy xuất nguồn gốc thuốc theo thời gian thực. Đang triển khai tại 38 bệnh viện tuyến tỉnh.',
    industry: 'HealthTech',
    stage: 'Series A',
    fundingNeed: 2_500_000,
    currency: 'USD',
    location: 'Hà Nội, Việt Nam',
    website: 'https://medtrackpro.io',
    foundedYear: 2020,
    teamSize: 35,
    palette: 'ember',
    growthPct: 28,
    iecLevel: 'L3',
    heroImage:
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
    projectTitle: 'MedTrack — Blockchain Pharma Supply Chain',
    projectSummary:
      'Blockchain + IoT cho chuỗi cung ứng dược phẩm — truy xuất nguồn gốc real-time, đang triển khai tại 38 bệnh viện.',
    projectDesc:
      'MedTrack Pro xây dựng lớp truy xuất nguồn gốc blockchain (Hyperledger Fabric) cho toàn bộ chuỗi: nhà máy → phân phối → bệnh viện → bệnh nhân. Mỗi lô thuốc được gắn QR NFC đọc bằng app trong <2 giây. Tích hợp sẵn với HIS của Hệ thống Bệnh viện Vinmec và phần mềm quản lý nhà thuốc Long Châu. Đã phát hiện và ngăn chặn 3 lô thuốc giả trong Q4/2024. ARR hiện tại: $780K. Target raise: $2.5M cho R&D AI anomaly detection và mở rộng vào Indonesia.',
    viewCount: 612,
    interestCount: 57,
    trustScore: 88,
  },
  {
    email: 'ceo@agrolink.vn',
    fullName: 'Lê Văn Khoa',
    company: 'AgroLink Vietnam',
    description:
      'Sàn giao dịch nông sản B2B kết nối trực tiếp 8,000+ nông hộ với 300+ doanh nghiệp chế biến xuất khẩu. Xử lý >$12M GMV/năm. Tích hợp logistic và thanh toán trả chậm (BNPL) cho nông dân.',
    industry: 'AgriTech',
    stage: 'Series A',
    fundingNeed: 4_000_000,
    currency: 'USD',
    location: 'Cần Thơ, Việt Nam',
    website: 'https://agrolink.vn',
    foundedYear: 2019,
    teamSize: 52,
    palette: 'aurora',
    growthPct: 45,
    iecLevel: 'L3',
    heroImage:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    projectTitle: 'AgroLink — B2B Agricultural Marketplace',
    projectSummary:
      'Sàn B2B nông sản kết nối 8,000 nông hộ với 300 DN xuất khẩu, $12M+ GMV/năm, tích hợp logistics & BNPL.',
    projectDesc:
      'AgroLink giải quyết nghịch lý "nông dân bán rẻ, doanh nghiệp mua đắt" bằng cách loại bỏ 3–5 lớp trung gian truyền thống. Nền tảng cung cấp: (1) Spot market — đấu giá ngược thời gian thực, (2) Contract farming — kết hợp đơn hàng dài hạn có giá sàn đảm bảo cho nông dân, (3) AgroFinance — BNPL với lãi suất 12%/năm (thấp hơn 40% so với tín dụng đen). Take rate: 1.8% trên GMV. Đang raise $4M để phát triển module chứng nhận GlobalGAP và mở rộng sang ĐBSCL phase 2.',
    viewCount: 445,
    interestCount: 38,
    trustScore: 75,
  },
  {
    email: 'founder@eduflow.edu.vn',
    fullName: 'Hoàng Thị Mai',
    company: 'EduFlow Vietnam',
    description:
      'Nền tảng học tập thích ứng (adaptive learning) cho học sinh K-12 sử dụng AI để cá nhân hoá lộ trình học. 220,000 học sinh đang sử dụng hàng ngày. Đối tác triển khai: Sở GD&ĐT TP.HCM và Hà Nội.',
    industry: 'EdTech',
    stage: 'Series B',
    fundingNeed: 8_000_000,
    currency: 'USD',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    website: 'https://eduflow.edu.vn',
    foundedYear: 2018,
    teamSize: 78,
    palette: 'ocean',
    growthPct: 22,
    iecLevel: 'L3',
    heroImage:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    projectTitle: 'EduFlow — Adaptive K-12 Learning Platform',
    projectSummary:
      'AI adaptive learning cho 220,000 học sinh K-12 hàng ngày, đối tác chính thức Sở GD&ĐT TP.HCM & Hà Nội.',
    projectDesc:
      'EduFlow xây dựng knowledge graph cá nhân hoá cho từng học sinh — theo dõi 1,200+ điểm kiến thức và tự động điều chỉnh độ khó, tốc độ và phong cách học. Kết quả thực tế: học sinh dùng EduFlow >30 phút/ngày cải thiện điểm thi THPT trung bình +18%. Mô hình doanh thu: B2C subscription (89k VNĐ/tháng) + B2G (hợp đồng Sở). ARR hiện tại: $3.2M. Đang raise $8M Series B để: (1) phát triển module AI thi tuyển sinh đại học, (2) bản quốc tế hoá cho thị trường Indonesia và Thái Lan.',
    viewCount: 891,
    interestCount: 76,
    trustScore: 91,
  },
  {
    email: 'ceo@finflash.vn',
    fullName: 'Đỗ Thanh Bình',
    company: 'FinFlash Vietnam',
    description:
      'Nền tảng tín dụng vi mô cho SME dựa trên dữ liệu thay thế (lịch sử giao dịch POS, dòng tiền kế toán) để định giá rủi ro. Đã giải ngân $18M cho 3,200 SME. NPL < 2.1%.',
    industry: 'FinTech',
    stage: 'Series A',
    fundingNeed: 5_000_000,
    currency: 'USD',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    website: 'https://finflash.vn',
    foundedYear: 2020,
    teamSize: 43,
    palette: 'ember',
    growthPct: 67,
    iecLevel: 'L2',
    heroImage:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    projectTitle: 'FinFlash — SME Micro-Credit Platform',
    projectSummary:
      'Tín dụng vi mô dựa trên dữ liệu thay thế cho 3,200 SME, $18M giải ngân, NPL 2.1%, tăng trưởng 67% YoY.',
    projectDesc:
      'FinFlash giải quyết bài toán "không có tài sản thế chấp" của SME Việt Nam bằng cách xây dựng credit score từ 48 đặc trưng dữ liệu phi truyền thống: dòng tiền POS 12 tháng, lịch sử kế toán, đánh giá Google Business, dữ liệu thuế. Quy trình phê duyệt: 4 giờ (so với 3–4 tuần của ngân hàng truyền thống). Hạn mức: $2,000–$50,000 với lãi suất 18–24%/năm. Nguồn vốn: co-lending với 4 ngân hàng đối tác. Raise $5M để: scale loan book lên $50M và xây dựng product mới Invoice Financing.',
    viewCount: 734,
    interestCount: 63,
    trustScore: 72,
  },
];

const INVESTORS = [
  {
    email: 'partner@vietnamventures.vc',
    fullName: 'Nguyễn Quốc Anh',
    company: 'Vietnam Ventures Capital',
    description:
      'Quỹ VC chuyên Series A tại Việt Nam, danh mục đầu tư tập trung vào B2B SaaS, HealthTech và FinTech. AUM $45M, đã đầu tư vào 18 công ty.',
    investFocus: 'B2B SaaS, HealthTech, FinTech',
    investStage: 'Series A',
    minInvest: 500_000,
    maxInvest: 3_000_000,
    currency: 'USD',
    location: 'Hà Nội, Việt Nam',
    website: 'https://vietnamventures.vc',
    foundedYear: 2018,
    teamSize: 8,
    trustScore: 85,
  },
  {
    email: 'md@deltavc.asia',
    fullName: 'Trương Thành Long',
    company: 'Delta Ventures Asia',
    description:
      'Pan-Asia early stage fund với focus đặc biệt vào Consumer Tech và EdTech Đông Nam Á. $30M Fund II, đã exit thành công 3 portfolio companies trong 5 năm qua.',
    investFocus: 'Consumer Tech, EdTech, Marketplaces',
    investStage: 'Seed, Series A',
    minInvest: 200_000,
    maxInvest: 1_500_000,
    currency: 'USD',
    location: 'Singapore / TP. HCM',
    website: 'https://deltavc.asia',
    foundedYear: 2019,
    teamSize: 6,
    trustScore: 78,
  },
  {
    email: 'investment@nexushub.fund',
    fullName: 'Sarah Lim',
    company: 'Nexus Hub Fund',
    description:
      'Impact investment fund chuyên GreenTech, AgriTech và Social Enterprise tại Đông Nam Á. Tiêu chí đầu tư gồm cả tác động xã hội và lợi nhuận tài chính. $20M Fund.',
    investFocus: 'GreenTech, AgriTech, Social Enterprise',
    investStage: 'Seed',
    minInvest: 100_000,
    maxInvest: 800_000,
    currency: 'USD',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    website: 'https://nexushub.fund',
    foundedYear: 2021,
    teamSize: 5,
    trustScore: 70,
  },
  {
    email: 'director@alpharise.capital',
    fullName: 'Đinh Văn Phong',
    company: 'AlphaRise Capital',
    description:
      'Family office của tập đoàn sản xuất chuyển đổi sang đầu tư VC. Đặc biệt quan tâm Industrial Tech, FinTech và chuỗi cung ứng. Ticket: $1M–$5M, board seat required.',
    investFocus: 'Industrial Tech, FinTech, Supply Chain',
    investStage: 'Series A, Series B',
    minInvest: 1_000_000,
    maxInvest: 5_000_000,
    currency: 'USD',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    website: 'https://alpharise.capital',
    foundedYear: 2020,
    teamSize: 4,
    trustScore: 88,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// CLEAR DATA (theo thứ tự FK ngược)
// ──────────────────────────────────────────────────────────────────────────────

async function clearAll() {
  console.log('🗑  Clearing existing data...');
  // Chạy tuần tự theo thứ tự FK từ lá → gốc (không dùng transaction để tránh deadlock)
  // Events (dùng raw SQL vì liên kết PilotUser, không có Prisma model trực tiếp)
  await prisma.$executeRawUnsafe(`DELETE FROM "EventRegistration" WHERE event_id IN (SELECT id FROM "Event" WHERE creator_id IN (SELECT id FROM "PilotUser" WHERE email = 'events@iechub.vn'))`).catch(() => {});
  await prisma.$executeRawUnsafe(`DELETE FROM "Event" WHERE creator_id IN (SELECT id FROM "PilotUser" WHERE email = 'events@iechub.vn')`).catch(() => {});
  await prisma.activityFeedItem.deleteMany({});
  await prisma.share.deleteMany({});
  await prisma.orgFollow.deleteMany({});
  await prisma.webhookDelivery.deleteMany({});
  await prisma.webhook.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.matchEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.matchIntent.deleteMany({});
  await prisma.dataAccessGrant.deleteMany({});
  await prisma.dataRoomRequest.deleteMany({});
  await prisma.dataRoomDocument.deleteMany({});
  await prisma.dataRoom.deleteMany({});
  await prisma.projectDocument.deleteMany({});
  await prisma.projectIecScore.deleteMany({});
  await prisma.projectIecAssessment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.vouch.deleteMany({});
  await prisma.trustScore.deleteMany({});
  await prisma.orgInvite.deleteMany({});
  await prisma.startupProfile.deleteMany({});
  await prisma.investorProfile.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.org.deleteMany({});
  console.log('✅ All old data cleared');
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 seed-realistic — building vibrant demo data...\n');

  await clearAll();

  const hash = await bcrypt.hash(PASSWORD, 10);

  // ── Admin org + user ────────────────────────────────────────────────────────
  const adminOrg = await prisma.org.create({
    data: {
      id: randomUUID(),
      name: 'IEC Hub Platform',
      org_type: 'platform',
      website: 'https://iechub.vn',
      description: 'Vietnam\'s premier startup–investor matching platform',
      business_sector: 'Technology',
      founding_year: 2023,
      employee_count: '10-50',
      verification_status: 'verified',
      verified_at: daysAgo(120),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@iechub.vn',
      full_name: 'IEC Hub Admin',
      user_type: 'ADMIN',
      approval_status: 'approved',
      password_hash: hash,
      org_id: adminOrg.id,
    },
  });

  console.log('✅ Admin created:', adminUser.email);

  // ── Create STARTUP orgs, users, profiles, projects ─────────────────────────
  const startupData: Array<{
    org: any; user: any; profile: any; project: any; dataRoom: any;
  }> = [];

  for (const s of STARTUPS) {
    const org = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: s.company,
        org_type: 'startup',
        website: s.website,
        description: s.description,
        business_sector: s.industry,
        founding_year: s.foundedYear,
        address: s.location,
        employee_count: String(s.teamSize),
        verification_status: s.trustScore >= 80 ? 'verified' : 'pending',
        verified_at: s.trustScore >= 80 ? daysAgo(60) : null,
      },
    });

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: s.email,
        full_name: s.fullName,
        user_type: 'STARTUP',
        approval_status: 'approved',
        password_hash: hash,
        org_id: org.id,
      },
    });

    const profile = await prisma.startupProfile.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        org_id: org.id,
        company_name: s.company,
        company_description: s.description,
        website: s.website,
        founded_year: s.foundedYear,
        team_size: s.teamSize,
        location: s.location,
        industry: s.industry,
        funding_stage: s.stage,
        funding_amount: s.fundingNeed,
        funding_currency: s.currency,
      },
    });

    const activityDaysAgo = STARTUPS.indexOf(s) * 7 + 2; // spread 2–44 days ago

    const projectId = randomUUID();

    // Dùng select: {id:true} để tránh Prisma SELECT * với cột chưa migrate
    await prisma.project.create({
      data: {
        id: projectId,
        org_id: org.id,
        startup_id: profile.id,
        title: s.projectTitle,
        summary: s.projectSummary,
        description: s.projectDesc,
        industry: s.industry,
        stage: s.stage,
        funding_need_amount: s.fundingNeed,
        funding_currency: s.currency,
        status: 'published',
        iec_level: s.iecLevel,
        hero_image_url: s.heroImage,
        view_count: s.viewCount,
        interest_count: s.interestCount,
        last_activity_at: daysAgo(activityDaysAgo),
        created_by: user.id,
      },
      select: { id: true },
    });

    // Patch optional columns riêng — bỏ qua nếu column chưa tồn tại trong DB
    await prisma.$executeRawUnsafe(
      `UPDATE "Project" SET brand_palette = $1, growth_rate_pct = $2 WHERE id = $3::uuid`,
      s.palette, s.growthPct, projectId,
    ).catch(() => {});

    const project = { id: projectId };

    // Data room for each project
    const dataRoom = await prisma.dataRoom.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        project_id: project.id,
        title: `${s.company} — Data Room`,
        description: 'Tài liệu nội bộ dành cho nhà đầu tư đang xem xét',
        created_by: user.id,
      },
    });

    // Documents
    await prisma.dataRoomDocument.createMany({
      data: [
        {
          id: randomUUID(),
          org_id: org.id,
          data_room_id: dataRoom.id,
          title: `${s.company} — Company Overview`,
          type: 'pitch_deck',
          storage_path: `/docs/${org.id}/company-overview.pdf`,
          tier: 'public',
          created_by: user.id,
        },
        {
          id: randomUUID(),
          org_id: org.id,
          data_room_id: dataRoom.id,
          title: `${s.company} — Pitch Deck 2025`,
          type: 'pitch_deck',
          storage_path: `/docs/${org.id}/pitch-deck.pdf`,
          tier: 'protected',
          created_by: user.id,
        },
        {
          id: randomUUID(),
          org_id: org.id,
          data_room_id: dataRoom.id,
          title: `${s.company} — Financial Projections 2025–2027`,
          type: 'financials',
          storage_path: `/docs/${org.id}/financials.xlsx`,
          tier: 'confidential',
          created_by: user.id,
        },
        {
          id: randomUUID(),
          org_id: org.id,
          data_room_id: dataRoom.id,
          title: 'Cap Table & Term Sheet Template',
          type: 'other',
          storage_path: `/docs/${org.id}/cap-table.pdf`,
          tier: 'confidential',
          created_by: user.id,
        },
      ],
    });

    // TrustScore
    await prisma.trustScore.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        score: s.trustScore,
        profile_score: Math.min(100, s.trustScore + 5),
        iec_score: s.trustScore - 5,
        vouch_score: s.trustScore - 8,
        audit_score: s.trustScore + 2,
        last_calculated: daysAgo(1),
      },
    });

    startupData.push({ org, user, profile, project, dataRoom });
    console.log(`  ✅ Startup: ${s.company} (${s.stage})`);
  }

  // ── Create INVESTOR orgs, users, profiles ───────────────────────────────────
  const investorData: Array<{ org: any; user: any; profile: any }> = [];

  for (const inv of INVESTORS) {
    const org = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: inv.company,
        org_type: 'investor',
        website: inv.website,
        description: inv.description,
        business_sector: 'Investment',
        founding_year: inv.foundedYear,
        employee_count: String(inv.teamSize),
        verification_status: 'verified',
        verified_at: daysAgo(90),
      },
    });

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: inv.email,
        full_name: inv.fullName,
        user_type: 'INVESTOR',
        approval_status: 'approved',
        password_hash: hash,
        org_id: org.id,
      },
    });

    const profile = await prisma.investorProfile.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        org_id: org.id,
        company_name: inv.company,
        company_description: inv.description,
        website: inv.website,
        location: inv.location,
        investment_focus: inv.investFocus,
        investment_stage: inv.investStage,
        investment_amount_min: inv.minInvest,
        investment_amount_max: inv.maxInvest,
        investment_currency: inv.currency,
      },
    });

    await prisma.trustScore.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        score: inv.trustScore,
        profile_score: inv.trustScore + 3,
        iec_score: inv.trustScore - 3,
        vouch_score: inv.trustScore,
        audit_score: inv.trustScore + 1,
        last_calculated: daysAgo(1),
      },
    });

    investorData.push({ org, user, profile });
    console.log(`  ✅ Investor: ${inv.company}`);
  }

  // ── Vouch network ───────────────────────────────────────────────────────────
  const allOrgs = [...startupData.map(s => s.org), ...investorData.map(i => i.org)];
  const vouchPairs: [number, number, string][] = [
    [6, 0, 'partnership'],  // VietVentures → VietMind
    [6, 2, 'partnership'],  // VietVentures → MedTrack
    [7, 1, 'transaction'],  // Delta → GreenPack
    [7, 4, 'partnership'],  // Delta → EduFlow
    [8, 3, 'reference'],    // Nexus → AgroLink
    [9, 5, 'transaction'],  // AlphaRise → FinFlash
    [9, 2, 'partnership'],  // AlphaRise → MedTrack
    [0, 2, 'reference'],    // VietMind → MedTrack (cross vouch)
  ];

  for (const [from, to, type] of vouchPairs) {
    if (from < allOrgs.length && to < allOrgs.length) {
      await prisma.vouch.create({
        data: {
          id: randomUUID(),
          vouching_org_id: allOrgs[from].id,
          vouched_org_id: allOrgs[to].id,
          vouch_type: type,
          notes: 'Đã làm việc cùng nhau và xác nhận chất lượng đối tác.',
          status: 'active',
        },
      }).catch(() => {}); // skip duplicate
    }
  }
  console.log('\n  ✅ Vouch network created');

  // ── Matches với lịch sử events ──────────────────────────────────────────────
  const matchScenarios: Array<{
    startupIdx: number;
    investorIdx: number;
    status: string;
    iecLevel: string;
    daysOld: number;
    events: Array<{ from: string | null; to: string; note: string; daysAgoOffset: number }>;
  }> = [
    // VietMind + VietVentures → đang negotiate
    {
      startupIdx: 0, investorIdx: 0,
      status: 'negotiation', iecLevel: 'L3', daysOld: 45,
      events: [
        { from: null, to: 'pending_intro', note: 'Match khởi tạo', daysAgoOffset: 45 },
        { from: 'pending_intro', to: 'intro_done', note: 'Giới thiệu hoàn tất qua IEC Hub', daysAgoOffset: 40 },
        { from: 'intro_done', to: 'in_discussion', note: 'Call đầu tiên: pitch và Q&A với founding team', daysAgoOffset: 33 },
        { from: 'in_discussion', to: 'meeting_scheduled', note: 'Meeting onsite tại HN, xem demo product live', daysAgoOffset: 25 },
        { from: 'meeting_scheduled', to: 'due_diligence', note: 'DD đã bắt đầu: financial audit, user cohort analysis', daysAgoOffset: 15 },
        { from: 'due_diligence', to: 'negotiation', note: 'Term sheet draft đã gửi: $2.5M at $12M pre-money', daysAgoOffset: 5 },
      ],
    },
    // EduFlow + Delta → due diligence
    {
      startupIdx: 4, investorIdx: 1,
      status: 'due_diligence', iecLevel: 'L3', daysOld: 30,
      events: [
        { from: null, to: 'pending_intro', note: 'Investor đã xem profile và gửi interest', daysAgoOffset: 30 },
        { from: 'pending_intro', to: 'intro_done', note: 'Intro call hoàn tất', daysAgoOffset: 25 },
        { from: 'intro_done', to: 'in_discussion', note: 'Demo session: 40 phút live walkthrough', daysAgoOffset: 18 },
        { from: 'in_discussion', to: 'meeting_scheduled', note: 'Meeting với education advisor của Delta', daysAgoOffset: 10 },
        { from: 'meeting_scheduled', to: 'due_diligence', note: 'DD checklist đã gửi, access data room confidential', daysAgoOffset: 3 },
      ],
    },
    // AgroLink + Nexus → in_discussion
    {
      startupIdx: 3, investorIdx: 2,
      status: 'in_discussion', iecLevel: 'L2', daysOld: 20,
      events: [
        { from: null, to: 'pending_intro', note: 'Match từ impact criteria alignment', daysAgoOffset: 20 },
        { from: 'pending_intro', to: 'intro_done', note: 'Giới thiệu CEO – Partner Nexus', daysAgoOffset: 15 },
        { from: 'intro_done', to: 'in_discussion', note: 'Thảo luận về impact metrics và tác động cộng đồng', daysAgoOffset: 7 },
      ],
    },
    // MedTrack + AlphaRise → meeting_scheduled
    {
      startupIdx: 2, investorIdx: 3,
      status: 'meeting_scheduled', iecLevel: 'L3', daysOld: 15,
      events: [
        { from: null, to: 'pending_intro', note: 'AlphaRise chủ động tiếp cận sau khi đọc case study', daysAgoOffset: 15 },
        { from: 'pending_intro', to: 'intro_done', note: 'Email giới thiệu formal', daysAgoOffset: 11 },
        { from: 'intro_done', to: 'in_discussion', note: 'Technical deep-dive với CTO team', daysAgoOffset: 6 },
        { from: 'in_discussion', to: 'meeting_scheduled', note: 'Board presentation scheduled: 15/04/2026', daysAgoOffset: 2 },
      ],
    },
    // FinFlash + AlphaRise → intro_done
    {
      startupIdx: 5, investorIdx: 3,
      status: 'intro_done', iecLevel: 'L2', daysOld: 8,
      events: [
        { from: null, to: 'pending_intro', note: 'Match từ FinTech + Supply Chain overlap', daysAgoOffset: 8 },
        { from: 'pending_intro', to: 'intro_done', note: 'Intro hoàn tất, FinFlash gửi one-pager', daysAgoOffset: 4 },
      ],
    },
    // GreenPack + Nexus → pending (mới nhất)
    {
      startupIdx: 1, investorIdx: 2,
      status: 'pending_intro', iecLevel: 'L2', daysOld: 3,
      events: [
        { from: null, to: 'pending_intro', note: 'Investor thêm vào watchlist và khởi tạo match', daysAgoOffset: 3 },
      ],
    },
  ];

  for (const scenario of matchScenarios) {
    const sd = startupData[scenario.startupIdx];
    const inv = investorData[scenario.investorIdx];
    const actorId = inv.user.id;

    const match = await prisma.match.create({
      data: {
        id: randomUUID(),
        org_id: sd.org.id,
        project_id: sd.project.id,
        startup_id: sd.profile.id,
        investor_id: inv.profile.id,
        iec_level_at_match: scenario.iecLevel,
        status: scenario.status,
        created_at: daysAgo(scenario.daysOld),
        created_by: actorId,
      },
    });

    for (const ev of scenario.events) {
      await prisma.matchEvent.create({
        data: {
          id: randomUUID(),
          org_id: sd.org.id,
          match_id: match.id,
          event_type: 'status_changed',
          old_status: ev.from,
          new_status: ev.to,
          actor_id: actorId,
          note: ev.note,
          created_at: daysAgo(ev.daysAgoOffset),
          created_by: actorId,
        },
      });
    }

    // Conversation for active deals
    if (!['pending_intro'].includes(scenario.status)) {
      const conv = await prisma.conversation.create({
        data: {
          id: randomUUID(),
          org_id: sd.org.id,
          match_id: match.id,
          participant1_id: sd.user.id,
          participant2_id: inv.user.id,
        },
      });

      const messages = [
        { sender: inv.user.id, content: `Chào ${sd.user.full_name}, tôi đã review profile của ${sd.org.name} và rất ấn tượng với tốc độ tăng trưởng. Có thể schedule một call không?` },
        { sender: sd.user.id, content: `Cảm ơn anh quan tâm! Chúng tôi rất vui được chia sẻ thêm. Tuần tới anh có free slot nào không?` },
        { sender: inv.user.id, content: 'Thứ 3 hay 4 tuần tới đều được. Tôi sẽ gửi invite qua calendar. Trước buổi call, anh có thể share pitch deck không ạ?' },
        { sender: sd.user.id, content: 'Đã upload pitch deck vào Data Room rồi anh ơi, anh vào request access là tôi approve ngay.' },
      ];

      for (const msg of messages) {
        await prisma.message.create({
          data: {
            id: randomUUID(),
            org_id: sd.org.id,
            conversation_id: conv.id,
            sender_id: msg.sender,
            content: msg.content,
            type: 'TEXT',
          },
        });
      }
    }
  }
  console.log('  ✅ Matches + events + conversations created');

  // ── Data Room Requests (một số đang pending) ────────────────────────────────
  // Investor 1 request access tài liệu protected của VietMind
  await prisma.dataRoomRequest.create({
    data: {
      id: randomUUID(),
      org_id: startupData[0].org.id,
      data_room_id: startupData[0].dataRoom.id,
      requester_id: investorData[1].user.id,
      requested_tier: 'protected',
      purpose: 'investment',
      status: 'accepted',
      responded_at: daysAgo(10),
      response_note: 'Approved — welcome to review our materials',
      created_at: daysAgo(12),
      created_by: investorData[1].user.id,
    },
  });

  // Investor 0 request confidential của EduFlow
  await prisma.dataRoomRequest.create({
    data: {
      id: randomUUID(),
      org_id: startupData[4].org.id,
      data_room_id: startupData[4].dataRoom.id,
      requester_id: investorData[0].user.id,
      requested_tier: 'confidential',
      purpose: 'due-diligence',
      status: 'pending',
      created_at: daysAgo(2),
      created_by: investorData[0].user.id,
    },
  });

  // Investor 3 request protected của FinFlash
  await prisma.dataRoomRequest.create({
    data: {
      id: randomUUID(),
      org_id: startupData[5].org.id,
      data_room_id: startupData[5].dataRoom.id,
      requester_id: investorData[3].user.id,
      requested_tier: 'protected',
      purpose: 'investment',
      status: 'accepted',
      responded_at: daysAgo(3),
      created_at: daysAgo(5),
      created_by: investorData[3].user.id,
    },
  });

  console.log('  ✅ Data room requests created');

  // ── Notifications ───────────────────────────────────────────────────────────
  const notifData = [
    {
      user: startupData[0].user,
      org: startupData[0].org,
      type: 'match_created_startup',
      payload: { title: 'Nhà đầu tư mới quan tâm!', message: 'Vietnam Ventures Capital đã bắt đầu quy trình deal với VietMind AI.' },
    },
    {
      user: startupData[4].user,
      org: startupData[4].org,
      type: 'data_room_request_created',
      payload: { title: 'Yêu cầu Data Room mới', message: 'Vietnam Ventures Capital đã yêu cầu truy cập tài liệu Confidential của EduFlow.' },
    },
    {
      user: investorData[0].user,
      org: investorData[0].org,
      type: 'match_stage_changed',
      payload: { title: 'Deal tiến triển!', message: 'VietMind AI — match đã chuyển sang Negotiation. Term sheet đang được xem xét.' },
    },
    {
      user: investorData[1].user,
      org: investorData[1].org,
      type: 'data_room_request_updated',
      payload: { title: 'Truy cập được chấp thuận', message: 'VietMind AI đã approve yêu cầu xem tài liệu Protected của bạn.', status: 'accepted' },
    },
    {
      user: startupData[2].user,
      org: startupData[2].org,
      type: 'match_created_startup',
      payload: { title: 'Investor mới!', message: 'AlphaRise Capital vừa khởi tạo deal với MedTrack Pro — đang ở giai đoạn Meeting Scheduled.' },
    },
  ];

  for (const n of notifData) {
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        org_id: n.org.id,
        recipient_user_id: n.user.id,
        type: n.type,
        payload: n.payload,
        read_at: null,
        created_at: daysAgo(Math.floor(Math.random() * 7)),
      },
    });
  }
  console.log('  ✅ Notifications created');

  // ── PilotUser + Events ───────────────────────────────────────────────────────
  console.log('\n  ⏳ Creating Events...');

  // Tạo PilotUser placeholder cho events (không liên kết với User chính)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "PilotUser" (id, email, email_domain, password_hash, full_name, status, email_verified)
    VALUES (gen_random_uuid(), 'events@iechub.vn', 'iechub.vn', $1, 'IEC Hub Events', 'GUEST'::"UserStatus", true)
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
  `, hash).catch((e: any) => console.warn('  ⚠ PilotUser upsert:', e.message));

  const pilotAdminRow = await prisma.$queryRaw<[{ id: string }]>`
    SELECT id FROM "PilotUser" WHERE email = 'events@iechub.vn' LIMIT 1
  `;
  const pilotId = pilotAdminRow[0]?.id;

  if (pilotId) {
    // Xóa events cũ trước khi tạo mới (pilotId là uuid nên cần cast rõ ràng)
    await prisma.$executeRawUnsafe(
      `DELETE FROM "EventRegistration" WHERE event_id IN (SELECT id FROM "Event" WHERE creator_id = $1::uuid)`,
      pilotId,
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Event" WHERE creator_id = $1::uuid`,
      pilotId,
    );

    const EVENTS_DATA = [
      {
        title: 'Vietnam Startup Pitch Night — Q2 2026',
        short_description: 'Đêm pitch dành cho startup giai đoạn Seed và Series A trước 15 nhà đầu tư hàng đầu Việt Nam.',
        description: 'Sự kiện pitch định kỳ của IEC Hub quy tụ 10 startup được chọn lọc kỹ càng sẽ trình bày trước panel 15 nhà đầu tư. Mỗi startup có 7 phút pitch + 5 phút Q&A. Sau đó là networking cocktail dành riêng cho founders và investors. Đăng ký trước 31/03 để đảm bảo slot.',
        event_type: 'OFFLINE',
        location: 'WeWork Saigon Centre, 67 Lê Lợi, Q.1, TP.HCM',
        start_time: daysFromNow(14),
        end_time: daysFromNow(14),
        max_attendees: 80,
        current_attendees: 63,
        cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 412,
      },
      {
        title: 'Deep-Dive: HealthTech Investment Thesis 2026',
        short_description: 'Vietnam Ventures Capital chia sẻ investment thesis mới cho lĩnh vực HealthTech, AI và Digital Health.',
        description: 'Session chuyên sâu với đội ngũ Vietnam Ventures Capital về xu hướng đầu tư HealthTech tại Đông Nam Á năm 2026. Bao gồm case study các portfolio companies, tiêu chí lọc deal, và what they look for at Series A. Dành riêng cho startup HealthTech IEC Level 2 trở lên.',
        event_type: 'ONLINE',
        meeting_link: 'https://meet.google.com/iechub-healthtech-2026',
        start_time: daysFromNow(7),
        end_time: daysFromNow(7),
        max_attendees: 50,
        current_attendees: 38,
        cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 287,
      },
      {
        title: 'AgriTech & GreenTech Founders Meetup',
        short_description: 'Gặp gỡ cộng đồng founders AgriTech và GreenTech Việt Nam. Chia sẻ kinh nghiệm, kết nối đối tác.',
        description: 'Buổi gặp mặt không chính thức giữa các founders trong hệ sinh thái AgriTech và GreenTech — hai lĩnh vực đang nhận được sự quan tâm đặc biệt từ impact funds khu vực. Chương trình: chia sẻ thực chiến, demo sản phẩm, kết nối 1-on-1 có hỗ trợ bởi IEC Hub matchmaking system.',
        event_type: 'OFFLINE',
        location: 'Toong Coworking, 38 Bạch Đằng, Đà Nẵng',
        start_time: daysFromNow(21),
        end_time: daysFromNow(21),
        max_attendees: 40,
        current_attendees: 27,
        cover_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 198,
      },
      {
        title: 'IEC Level Up Workshop: Từ L1 lên L3',
        short_description: 'Workshop thực hành hướng dẫn startup tối ưu hồ sơ để đạt IEC Level 3 và unlock toàn bộ tính năng platform.',
        description: 'Workshop bán ngày (half-day) do đội ngũ IEC Hub tổ chức. Bạn sẽ được: (1) Review hồ sơ 1-on-1 với chuyên gia, (2) Danh sách cụ thể các action items để tăng điểm Trust Score, (3) Hướng dẫn upload và phân loại tài liệu Data Room, (4) Best practices khi tiếp cận nhà đầu tư qua platform. Giới hạn 20 startup.',
        event_type: 'HYBRID',
        location: 'IEC Hub Office, Tầng 8, VietInBank Tower, Hà Nội',
        meeting_link: 'https://meet.google.com/iechub-levelup-ws',
        start_time: daysFromNow(10),
        end_time: daysFromNow(10),
        max_attendees: 20,
        current_attendees: 18,
        cover_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 334,
      },
      {
        title: 'FinTech Open House: AlphaRise Capital',
        short_description: 'AlphaRise Capital mở cửa văn phòng đón founders FinTech & Supply Chain trình bày ý tưởng theo slot 30 phút.',
        description: 'Mỗi tháng AlphaRise Capital mở 6 slots (mỗi slot 30 phút) để gặp gỡ founders FinTech & Supply Chain không cần giới thiệu trung gian. Không cần deck hoàn chỉnh — chỉ cần biết rõ bạn giải quyết vấn đề gì và tại sao bây giờ. Đăng ký sớm để chọn giờ phù hợp.',
        event_type: 'OFFLINE',
        location: 'Alpha Tower, 18 Hoàng Diệu, Q.4, TP.HCM',
        start_time: daysFromNow(28),
        end_time: daysFromNow(28),
        max_attendees: 6,
        current_attendees: 6,
        cover_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 521,
      },
      {
        title: 'EdTech Innovation Summit 2026',
        short_description: 'Hội nghị thường niên về công nghệ giáo dục — kết nối 200 founders, educators và investors trong 1 ngày.',
        description: 'EdTech Innovation Summit 2026 quy tụ toàn bộ hệ sinh thái EdTech Việt Nam: founders đang scale, educators đang số hóa, và investors đang rót tiền vào lĩnh vực này. Highlights: Keynote từ Sở GD&ĐT TP.HCM, panel thảo luận về AI in Education, demo showcase 20 startup, và deal room riêng cho matched pairs.',
        event_type: 'OFFLINE',
        location: 'Gem Center, 8 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM',
        start_time: daysFromNow(45),
        end_time: daysFromNow(46),
        max_attendees: 200,
        current_attendees: 147,
        cover_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 876,
      },
      {
        title: 'Deal Clinic: Đọc và đàm phán Term Sheet',
        short_description: 'Luật sư và founder có kinh nghiệm hướng dẫn bạn đọc hiểu term sheet, những điều khoản cần chú ý.',
        description: 'Session thực hành nhỏ (15 người) với 1 luật sư M&A và 2 founders đã raise thành công Series A tại Việt Nam. Nội dung: (1) Giải thích từng điều khoản trong term sheet thực tế, (2) Anti-dilution, liquidation preference, pro-rata rights, (3) Những red flags phổ biến, (4) Cách đàm phán hiệu quả mà không mất deal. Yêu cầu: startup đang ở giai đoạn meeting_scheduled trở lên.',
        event_type: 'ONLINE',
        meeting_link: 'https://meet.google.com/iechub-dealclinic',
        start_time: daysFromNow(17),
        end_time: daysFromNow(17),
        max_attendees: 15,
        current_attendees: 14,
        cover_image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 267,
      },
      {
        title: 'Vietnam–Singapore VC Bridge Networking',
        short_description: 'Kết nối founders Việt Nam với network VC Singapore đang mở rộng sang Đông Nam Á.',
        description: 'Cùng IEC Hub và SG Startup Alliance tổ chức buổi networking kết nối trực tiếp founders Việt Nam với 8 VC Singapore đang tích cực tìm kiếm deal tại Việt Nam. Format: 3-minute intro mỗi startup → 20-minute roundtable → open networking. Yêu cầu pitch deck tối thiểu 10 slides.',
        event_type: 'HYBRID',
        location: 'Intercontinental Saigon, 2 Hai Bà Trưng, Q.1, TP.HCM',
        meeting_link: 'https://meet.google.com/vn-sg-vcbridge',
        start_time: daysFromNow(35),
        end_time: daysFromNow(35),
        max_attendees: 60,
        current_attendees: 44,
        cover_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 633,
      },
      {
        title: 'Founder AMA: Hành trình từ Seed đến Series A',
        short_description: 'CEO EduFlow Vietnam chia sẻ toàn bộ hành trình raise $8M Series B và bài học từ 50 cuộc gặp nhà đầu tư.',
        description: 'Hoàng Thị Mai — CEO EduFlow Vietnam sẽ chia sẻ thẳng thắn về hành trình raise funding: từ 50 cuộc gặp nhà đầu tư, 7 term sheet từ chối, đến lần close $8M. AMA format — bạn hỏi bất cứ điều gì về fundraising, team building, product scaling. Không có câu hỏi nào quá nhạy cảm.',
        event_type: 'ONLINE',
        meeting_link: 'https://meet.google.com/eduflow-ama-2026',
        start_time: daysFromNow(5),
        end_time: daysFromNow(5),
        max_attendees: 100,
        current_attendees: 89,
        cover_image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 945,
      },
      {
        title: 'Blockchain & Web3 in Supply Chain — Seminar',
        short_description: 'MedTrack Pro và các chuyên gia chia sẻ ứng dụng blockchain thực tế trong quản lý chuỗi cung ứng.',
        description: 'Seminar kỹ thuật-kinh doanh dành cho founders và tech leads quan tâm đến ứng dụng blockchain trong supply chain. Phạm Đức Hùng (CTO MedTrack Pro) sẽ chia sẻ case study triển khai Hyperledger tại 38 bệnh viện, bao gồm tech stack, chi phí, timeline và ROI thực tế. Sau đó là workshop hands-on demo.',
        event_type: 'OFFLINE',
        location: 'FPT Polytechnic Campus, 590A Cách Mạng Tháng 8, TP.HCM',
        start_time: daysFromNow(12),
        end_time: daysFromNow(12),
        max_attendees: 45,
        current_attendees: 31,
        cover_image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 189,
      },
      {
        title: 'IEC Hub Monthly Demo Day — Tháng 3/2026',
        short_description: 'Demo Day hàng tháng: 6 startup demo live sản phẩm trước cộng đồng investors và founders.',
        description: 'Format Demo Day cổ điển của IEC Hub: 6 startup được chọn demo live sản phẩm trong 8 phút mỗi team, tiếp theo là Q&A từ audience gồm investors, advisors và founders. Tháng này focus vào FinTech và HealthTech. Sau demo là cocktail networking 2 tiếng.',
        event_type: 'OFFLINE',
        location: 'Dreamplex Coworking, 195 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM',
        start_time: daysAgo(3),
        end_time: daysAgo(3),
        max_attendees: 120,
        current_attendees: 115,
        cover_image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 1024,
      },
      {
        title: 'Impact Investing Roundtable — ESG Focus',
        short_description: 'Nexus Hub Fund và các impact investors thảo luận về tiêu chí ESG và impact measurement framework.',
        description: 'Roundtable khép kín (invite-only) dành cho founders startups impact và đại diện impact funds khu vực. Chủ đề chính: làm thế nào đo lường và báo cáo impact một cách credible cho investors. Guest speakers: Sarah Lim (Nexus Hub Fund), đại diện ADB Ventures, và impact measurement expert từ McKinsey.',
        event_type: 'OFFLINE',
        location: 'Park Hyatt Saigon, 2 Công Trường Lam Sơn, Q.1, TP.HCM',
        start_time: daysFromNow(60),
        end_time: daysFromNow(60),
        max_attendees: 30,
        current_attendees: 22,
        cover_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
        status: 'PUBLISHED',
        view_count: 312,
      },
    ];

    for (const ev of EVENTS_DATA) {
      const slug = ev.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);

      const endHour = new Date(ev.start_time);
      endHour.setHours(endHour.getHours() + 2);

      await prisma.$executeRawUnsafe(`
        INSERT INTO "Event" (
          id, creator_id, title, slug, description, short_description,
          event_type, meeting_link, location, address,
          start_time, end_time, timezone,
          max_attendees, current_attendees, cover_image_url,
          status, is_public, requires_approval, view_count
        ) VALUES (
          gen_random_uuid(), $1::uuid, $2, $3, $4, $5,
          $6::"EventType", $7, $8, $8,
          $9, $10, 'Asia/Ho_Chi_Minh',
          $11, $12, $13,
          $14::"EventStatus", true, false, $15
        ) ON CONFLICT (slug) DO UPDATE SET
          description = EXCLUDED.description,
          current_attendees = EXCLUDED.current_attendees,
          view_count = EXCLUDED.view_count
      `,
        pilotId,
        ev.title,
        slug,
        ev.description,
        ev.short_description,
        ev.event_type,
        ev.meeting_link ?? null,
        ev.location ?? null,
        ev.start_time,
        ev.end_time ?? endHour,
        ev.max_attendees ?? null,
        ev.current_attendees ?? 0,
        ev.cover_image_url ?? null,
        ev.status,
        ev.view_count ?? 0,
      ).catch((e: any) => console.warn('  ⚠ Event insert skipped:', ev.title, e.message));
    }
    console.log(`  ✅ ${EVENTS_DATA.length} events created`);
  } else {
    console.warn('  ⚠ PilotUser not available, events skipped');
  }

  // ── ActivityFeedItem (social tab) ────────────────────────────────────────────
  console.log('\n  ⏳ Creating ActivityFeed items...');
  const feedItems = [
    { idx: 0, type: 'project_launched', entity: 'project', title: 'VietMind AI ra mắt dự án mới trên IEC Hub', desc: 'AI Mental Wellness Platform chính thức mở Series A, tìm kiếm $3M để mở rộng sang Thailand và Indonesia.' },
    { idx: 2, type: 'milestone_reached', entity: 'project', title: 'MedTrack Pro đạt mốc 38 bệnh viện', desc: 'Hệ thống blockchain pharma đã onboard thành công bệnh viện thứ 38, tổng ARR đạt $780K.' },
    { idx: 4, type: 'partnership_announced', entity: 'org', title: 'EduFlow ký hợp đồng với Sở GD&ĐT Hà Nội', desc: 'EduFlow chính thức trở thành đối tác công nghệ chính thức của Sở Giáo dục Hà Nội cho năm học 2025–2026.' },
    { idx: 3, type: 'funding_received', entity: 'project', title: 'AgroLink nhận $500K pre-funding từ impact investor', desc: 'Trước thềm raise Series A chính thức, AgroLink nhận khoản bridge từ đối tác chiến lược để scale logistics module.' },
    { idx: 1, type: 'milestone_reached', entity: 'org', title: 'GreenPack đạt 12 triệu túi nhựa thay thế', desc: 'Cột mốc 12 triệu túi bao bì sinh học đã được xuất xưởng, tương đương 3.6 tấn nhựa không ra môi trường.' },
    { idx: 5, type: 'award_received', entity: 'org', title: 'FinFlash giành giải FinTech Innovation 2025', desc: 'FinFlash Vietnam được vinh danh tại Vietnam FinTech Awards 2025 hạng mục "Best SME Credit Solution".' },
    { idx: 0, type: 'iec_level_updated', entity: 'org', title: 'VietMind AI đạt IEC Level 3 — Verified', desc: 'Sau quá trình thẩm định toàn diện, VietMind AI đã được cấp chứng nhận IEC Level 3, mở khóa toàn bộ tính năng platform.' },
    { idx: 4, type: 'match_accepted', entity: 'match', title: 'EduFlow bước vào giai đoạn Due Diligence', desc: 'Match giữa EduFlow Vietnam và Delta Ventures Asia đã tiến đến Due Diligence — một trong những tiến trình nhanh nhất trên platform.' },
    { idx: 2, type: 'team_joined', entity: 'org', title: 'MedTrack Pro mở rộng đội ngũ thêm 8 người', desc: 'Tuyển dụng thành công 3 kỹ sư blockchain, 2 business development và 3 clinical specialists để phục vụ mở rộng sang Indonesia.' },
    { idx: 3, type: 'project_updated', entity: 'project', title: 'AgroLink cập nhật pitch deck Q1/2026', desc: 'Deck được cập nhật với số liệu Q4/2025: GMV tăng 45% YoY, 8,200 nông hộ active, AgroFinance NPL chỉ 1.8%.' },
    { idx: 5, type: 'partnership_announced', entity: 'org', title: 'FinFlash ký co-lending với Techcombank', desc: 'Hợp đồng co-lending mới với Techcombank cho phép FinFlash mở rộng loan book lên $8M ngay Q1/2026.' },
    { idx: 1, type: 'milestone_reached', entity: 'org', title: 'GreenPack vào chuỗi cung ứng Lotte Mart', desc: 'Sau Circle K và VinMart, GreenPack ký hợp đồng cung cấp bao bì sinh học cho toàn hệ thống Lotte Mart Việt Nam.' },
  ];

  for (const item of feedItems) {
    const sd = startupData[item.idx];
    if (!sd) continue;
    await prisma.activityFeedItem.create({
      data: {
        id: randomUUID(),
        org_id: sd.org.id,
        actor_id: sd.user.id,
        activity_type: item.type,
        entity_type: item.entity,
        entity_id: sd.project.id,
        title: item.title,
        description: item.desc,
        is_public: true,
        created_at: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    });
  }
  console.log(`  ✅ ${feedItems.length} activity feed items created`);

  // ── MatchIntent (watchlist / liked) ─────────────────────────────────────────
  console.log('\n  ⏳ Creating MatchIntents...');
  const intentPairs: [number, number][] = [
    [0, 0], [0, 2], [0, 4],   // VietVentures liked VietMind, MedTrack, EduFlow
    [1, 4], [1, 1], [1, 3],   // Delta liked EduFlow, GreenPack, AgroLink
    [2, 3], [2, 1],           // Nexus liked AgroLink, GreenPack
    [3, 5], [3, 2], [3, 0],   // AlphaRise liked FinFlash, MedTrack, VietMind
  ];

  for (const [invIdx, projIdx] of intentPairs) {
    const inv = investorData[invIdx];
    const sd = startupData[projIdx];
    if (!inv || !sd) continue;
    await prisma.matchIntent.create({
      data: {
        id: randomUUID(),
        org_id: sd.org.id,
        investor_id: inv.profile.id,
        project_id: sd.project.id,
        status: 'liked',
        source: 'discover',
        created_by: inv.user.id,
      },
    }).catch(() => {}); // skip if duplicate unique constraint
  }
  console.log('  ✅ MatchIntents (watchlist) created');

  // ── OrgFollow ────────────────────────────────────────────────────────────────
  console.log('\n  ⏳ Creating OrgFollows...');
  const followPairs: [number, number][] = [
    // investors following startups they're interested in
    [6, 0], [6, 2], [6, 4],
    [7, 4], [7, 1], [7, 3],
    [8, 3], [8, 1],
    [9, 5], [9, 2],
    // startups following investors
    [0, 6], [4, 7], [2, 9], [3, 8],
  ];

  const allOrgsFull = [...startupData.map(s => s.org), ...investorData.map(i => i.org)];
  const allUsersFull = [...startupData.map(s => s.user), ...investorData.map(i => i.user)];

  for (const [followerOrgIdx, followedOrgIdx] of followPairs) {
    const followerUser = allUsersFull[followerOrgIdx];
    const followedOrg = allOrgsFull[followedOrgIdx];
    if (!followerUser || !followedOrg) continue;
    await prisma.orgFollow.create({
      data: {
        id: randomUUID(),
        follower_id: followerUser.id,
        followed_id: followedOrg.id,
      },
    }).catch(() => {});
  }
  console.log('  ✅ OrgFollows created');

  // ── More Notifications ───────────────────────────────────────────────────────
  console.log('\n  ⏳ Creating additional notifications...');
  const moreNotifs = [
    // Events notifications
    { userIdx: 0, orgIdx: 0, type: 'event_reminder', payload: { title: 'Nhắc lịch: Startup Pitch Night Q2', message: 'Sự kiện Vietnam Startup Pitch Night diễn ra sau 2 tuần nữa. Bạn đã đăng ký slot chưa?', event_title: 'Vietnam Startup Pitch Night — Q2 2026' }, daysAgo: 1 },
    { userIdx: 4, orgIdx: 4, type: 'event_reminder', payload: { title: 'Nhắc lịch: Founder AMA với Hoàng Thị Mai', message: 'AMA online về fundraising diễn ra sau 5 ngày. Đừng quên chuẩn bị câu hỏi!', event_title: 'Founder AMA: Hành trình từ Seed đến Series A' }, daysAgo: 0 },
    // Trust score notifications
    { userIdx: 1, orgIdx: 1, type: 'trust_score_updated', payload: { title: 'Trust Score tăng lên 65!', message: 'GreenPack Vietnam đã đủ điều kiện request access tài liệu Protected. Tiếp tục cải thiện để lên 75!' }, daysAgo: 3 },
    { userIdx: 5, orgIdx: 5, type: 'trust_score_updated', payload: { title: 'Gần đạt IEC Level 3', message: 'FinFlash Vietnam hiện ở Trust Score 72/100. Upload thêm tài liệu tài chính để unlock Level 3!' }, daysAgo: 5 },
    // Match notifications
    { userIdx: 6, orgIdx: 6, type: 'match_stage_changed', payload: { title: 'EduFlow chuyển sang DD', message: 'EduFlow Vietnam — match vừa bước vào Due Diligence. Hãy chuẩn bị DD checklist ngay!', match_stage: 'due_diligence' }, daysAgo: 3 },
    { userIdx: 7, orgIdx: 7, type: 'match_created_investor', payload: { title: 'Match mới: GreenPack Vietnam', message: 'GreenPack Vietnam đang tìm kiếm Seed $800K cho bao bì sinh học — phù hợp với impact thesis của Delta Ventures.' }, daysAgo: 3 },
    // Data room notifications
    { userIdx: 3, orgIdx: 3, type: 'data_room_grant_approved', payload: { title: 'Yêu cầu Data Room được duyệt', message: 'Nexus Hub Fund đã approved yêu cầu xem tài liệu Protected của AgroLink. Tải xuống ngay để chuẩn bị cho cuộc họp.' }, daysAgo: 4 },
    { userIdx: 8, orgIdx: 8, type: 'data_room_request_created', payload: { title: 'Yêu cầu mới từ GreenPack', message: 'GreenPack Vietnam yêu cầu xem pitch deck Protected. Phản hồi trong 48 giờ để không ảnh hưởng Trust Score.' }, daysAgo: 2 },
    // Activity feed notifications
    { userIdx: 0, orgIdx: 0, type: 'vouch_received', payload: { title: 'Bạn nhận được Vouch mới!', message: 'Vietnam Ventures Capital đã vouch cho VietMind AI với type: Partnership. Trust Score của bạn sẽ tăng trong 24h.' }, daysAgo: 7 },
    { userIdx: 2, orgIdx: 2, type: 'vouch_received', payload: { title: 'AlphaRise Capital đã vouch cho bạn', message: 'AlphaRise Capital xác nhận partnership với MedTrack Pro. Đây là tín hiệu rất tốt cho profile của bạn với các investors khác!' }, daysAgo: 10 },
  ];

  for (const n of moreNotifs) {
    const u = n.userIdx < startupData.length
      ? startupData[n.userIdx].user
      : investorData[n.userIdx - startupData.length]?.user;
    const o = n.orgIdx < startupData.length
      ? startupData[n.orgIdx].org
      : investorData[n.orgIdx - startupData.length]?.org;
    if (!u || !o) continue;
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        org_id: o.id,
        recipient_user_id: u.id,
        type: n.type,
        payload: n.payload,
        read_at: null,
        created_at: daysAgo(n.daysAgo),
      },
    });
  }
  console.log(`  ✅ ${moreNotifs.length} additional notifications created`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n🎉 seed-realistic complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔑 LOGIN ACCOUNTS (password: Demo123!)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ADMIN:    admin@iechub.vn');
  console.log('─── STARTUPS ──────────────────────────────────────────');
  STARTUPS.forEach((s) => console.log(`  ${s.email.padEnd(36)} | ${s.company}`));
  console.log('─── INVESTORS ─────────────────────────────────────────');
  INVESTORS.forEach((i) => console.log(`  ${i.email.padEnd(36)} | ${i.company}`));
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ seed-realistic failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
