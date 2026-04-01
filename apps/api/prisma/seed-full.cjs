const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

// =====================
// Sample Data Definitions
// =====================

/** Curated Unsplash assets (keyword-aligned). */
const U = (photoPath, w = 1400) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=82`;

const STARTUPS = [
  {
    email: "cognify@iechub.local",
    full_name: "Dr. Elena Voss",
    company_name: "Cognify Labs",
    industry: "Artificial Intelligence",
    country: "United States",
    city: "San Francisco",
    stage: "Series A",
    website: "https://cognifylabs.example",
    short_description:
      "Enterprise copilots that learn your operational graph — deploy in days, not quarters.",
    funding_need_amount: 4200000,
    avatar_url: U("photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3", 400),
  },
  {
    email: "verdant@iechub.local",
    full_name: "Marcus Chen",
    company_name: "Verdant Pulse",
    industry: "Green Technology",
    country: "Germany",
    city: "Berlin",
    stage: "Seed",
    website: "https://verdantpulse.example",
    short_description:
      "AI dispatch for behind-the-meter batteries — squeeze more value from every kWh.",
    funding_need_amount: 2800000,
    avatar_url: U("photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3", 400),
  },
  {
    email: "helixfold@iechub.local",
    full_name: "Amira Okonkwo",
    company_name: "HelixFold Therapeutics",
    industry: "Biotechnology",
    country: "United Kingdom",
    city: "Cambridge",
    stage: "Series B",
    website: "https://helixfold.example",
    short_description:
      "Generative protein folding for rare metabolic disease — clinic-ready in 18 months.",
    funding_need_amount: 5500000,
    avatar_url: U("photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3", 400),
  },
  {
    email: "prismcapital@iechub.local",
    full_name: "James Okada",
    company_name: "Prism Capital OS",
    industry: "FinTech",
    country: "Singapore",
    city: "Singapore",
    stage: "Series A",
    website: "https://prismcapital.example",
    short_description:
      "Real-time treasury OS for cross-border teams — FX, compliance, and cash in one glass pane.",
    funding_need_amount: 6000000,
    avatar_url: U("photo-1560250097-0b93528c311a?ixlib=rb-4.0.3", 400),
  },
  {
    email: "lumengraph@iechub.local",
    full_name: "Sofia Lindström",
    company_name: "LumenGraph AI",
    industry: "Artificial Intelligence",
    country: "Sweden",
    city: "Stockholm",
    stage: "Seed",
    website: "https://lumengraph.example",
    short_description:
      "Graph neural stack for fraud and supply risk — plugs into Snowflake & Databricks.",
    funding_need_amount: 1900000,
    avatar_url: U("photo-1580489944761-15a19d654956?ixlib=rb-4.0.3", 400),
  },
  {
    email: "tideloop@iechub.local",
    full_name: "Diego Alvarez",
    company_name: "TideLoop Carbon",
    industry: "Green Technology",
    country: "Spain",
    city: "Barcelona",
    stage: "Pre-Seed",
    website: "https://tideloop.example",
    short_description:
      "Ocean-grade carbon removal credits with IoT-verified permanence scores.",
    funding_need_amount: 1200000,
    avatar_url: U("photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3", 400),
  },
  {
    email: "cellprint@iechub.local",
    full_name: "Yuki Tanaka",
    company_name: "CellPrint Bio",
    industry: "Biotechnology",
    country: "Japan",
    city: "Osaka",
    stage: "Seed",
    website: "https://cellprint.example",
    short_description:
      "3D bioprinted tissue scaffolds for regenerative dermal grafts — FDA fast-track path.",
    funding_need_amount: 3400000,
    avatar_url: U("photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3", 400),
  },
  {
    email: "railmint@iechub.local",
    full_name: "Olivia Hart",
    company_name: "RailMint Treasury",
    industry: "FinTech",
    country: "United States",
    city: "New York",
    stage: "Seed",
    website: "https://railmint.example",
    short_description:
      "Programmable escrow for B2B marketplaces — instant settlement, zero trust drama.",
    funding_need_amount: 2500000,
    avatar_url: U("photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3", 400),
  },
  {
    email: "atlasinfer@iechub.local",
    full_name: "Kwame Mensah",
    company_name: "Atlas Inference Cloud",
    industry: "Artificial Intelligence",
    country: "Canada",
    city: "Toronto",
    stage: "Series A",
    website: "https://atlasinfer.example",
    short_description:
      "Sovereign inference regions for regulated AI — latency within 12ms of hyperscalers.",
    funding_need_amount: 4800000,
    avatar_url: U("photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3", 400),
  },
  {
    email: "everroot@iechub.local",
    full_name: "Chiara Romano",
    company_name: "EverRoot AgTech",
    industry: "Green Technology",
    country: "Italy",
    city: "Milan",
    stage: "Series A",
    website: "https://everroot.example",
    short_description:
      "Vertical farm OS with spectral vision — 40% less energy, 2× yield consistency.",
    funding_need_amount: 3100000,
    avatar_url: U("photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3", 400),
  },
];

const INVESTORS = [
  {
    email: "investor1@iechub.local",
    full_name: "David Nguyen",
    organization_name: "Nebula Ventures",
    investor_type: "VC",
    ticket_size_min: 500000,
    ticket_size_max: 8000000,
    preferred_industries: ["Artificial Intelligence", "FinTech", "Biotechnology"],
    preferred_stages: ["Seed", "Series A", "Series B"],
    country: "Singapore",
  },
  {
    email: "investor2@iechub.local",
    full_name: "Sarah Chen",
    organization_name: "Pacific Meridian Capital",
    investor_type: "PE",
    ticket_size_min: 2000000,
    ticket_size_max: 25000000,
    preferred_industries: ["Green Technology", "FinTech", "Biotechnology"],
    preferred_stages: ["Series A", "Series B"],
    country: "Hong Kong",
  },
  {
    email: "investor3@iechub.local",
    full_name: "Michael Tran",
    organization_name: "Lighthouse Angels",
    investor_type: "Angel",
    ticket_size_min: 75000,
    ticket_size_max: 750000,
    preferred_industries: ["Artificial Intelligence", "Green Technology", "FinTech"],
    preferred_stages: ["Pre-Seed", "Seed"],
    country: "Vietnam",
  },
  {
    email: "investor4@iechub.local",
    full_name: "Jennifer Lee",
    organization_name: "Veridian Impact Fund",
    investor_type: "CVC",
    ticket_size_min: 1000000,
    ticket_size_max: 12000000,
    preferred_industries: ["Green Technology", "Biotechnology", "Artificial Intelligence"],
    preferred_stages: ["Seed", "Series A", "Series B"],
    country: "Japan",
  },
];

const PROJECTS = [
  {
    startup_index: 0,
    title: "Cognify Command — The Operator’s Copilot",
    summary:
      "We turn messy ops data into live playbooks: one pane for KPIs, incidents, and automations.",
    description:
      "Cognify Command connects to ERP, CRM, and ticketing in under a week. Teams describe outcomes in natural language; our graph models suggest the next best action and can execute within policy guardrails. Early adopters in logistics and manufacturing report 23% faster resolution cycles.",
    hero_image_url: U("photo-1677442136019-21780ecad995?ixlib=rb-4.0.3"),
    logo_url: U("photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3", 320),
    industry: "Artificial Intelligence",
    stage: "Series A",
    funding_need_amount: 4200000,
    status: "published",
    iec_level: "L3",
    brand_palette: "aurora",
    growth_rate_pct: 22,
    view_count: 18420,
    interest_count: 412,
  },
  {
    startup_index: 1,
    title: "Verdant Pulse — Flex Grid in a Box",
    summary:
      "AI dispatch for C&I batteries: peak shave, export, and grid services without a PhD.",
    description:
      "Verdant Pulse ingests tariffs, weather, and SCADA streams to orchestrate behind-the-meter assets. Utilities get a predictable flex block; customers see savings on day one. Two regional pilots are live with contracted recurring revenue.",
    hero_image_url: U("photo-1473341304170-971dccb563ac?ixlib=rb-4.0.3"),
    logo_url: U("photo-1497435334941-636c3e1c0b44?ixlib=rb-4.0.3", 320),
    industry: "Green Technology",
    stage: "Seed",
    funding_need_amount: 2800000,
    status: "published",
    iec_level: "L1",
    brand_palette: "forest",
    growth_rate_pct: 18,
    view_count: 12880,
    interest_count: 289,
  },
  {
    startup_index: 2,
    title: "HelixFold — Generative Protein Precision",
    summary:
      "Designing stable biologics for rare metabolic disease with wet-lab closed-loop validation.",
    description:
      "HelixFold couples diffusion models with micro-assay robotics to iterate candidates 40× faster than traditional medchem loops. Our lead program targets a pediatric indication with orphan designation and a clear FDA fast-track narrative.",
    hero_image_url: U("photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3"),
    logo_url: U("photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3", 320),
    industry: "Biotechnology",
    stage: "Series B",
    funding_need_amount: 5500000,
    status: "published",
    iec_level: "L3",
    brand_palette: "orchid",
    growth_rate_pct: 14,
    view_count: 22150,
    interest_count: 502,
  },
  {
    startup_index: 3,
    title: "Prism — Treasury Glass for Global Teams",
    summary:
      "One real-time cockpit for cash, FX hedges, and policy — built for CFOs who hate spreadsheets.",
    description:
      "Prism Capital OS unifies bank APIs, ERP subledgers, and trading venues. Rules-as-code enforces who can move what, where. Closed beta with three unicorns; median time-to-first-insight under six minutes.",
    hero_image_url: U("photo-1611974785985-9031803e745d?ixlib=rb-4.0.3"),
    logo_url: U("photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3", 320),
    industry: "FinTech",
    stage: "Series A",
    funding_need_amount: 6000000,
    status: "published",
    iec_level: "L3",
    brand_palette: "gold",
    growth_rate_pct: 19,
    view_count: 19640,
    interest_count: 438,
  },
  {
    startup_index: 4,
    title: "LumenGraph — Graph AI for Fraud & Supply Risk",
    summary:
      "Spot hidden counterparties and cascade risk before it hits your P&L.",
    description:
      "LumenGraph builds dynamic entity graphs across transactions, shipments, and third parties. Analysts get ranked hypotheses with evidence trails — SOC2 Type II and EU residency options for regulated clients.",
    hero_image_url: U("photo-1635070463857-7e4d4a57c41b?ixlib=rb-4.0.3"),
    logo_url: U("photo-1551434678-e076c223a692?ixlib=rb-4.0.3", 320),
    industry: "Artificial Intelligence",
    stage: "Seed",
    funding_need_amount: 1900000,
    status: "published",
    iec_level: "L1",
    brand_palette: "nebula",
    growth_rate_pct: 27,
    view_count: 9420,
    interest_count: 198,
  },
  {
    startup_index: 5,
    title: "TideLoop — Carbon Credits You Can Trust",
    summary:
      "IoT-verified removal credits with permanence scores investors actually underwrite.",
    description:
      "TideLoop instruments coastal and mineralization projects with continuous telemetry. Each tonne ships with a digital twin of MRV data — built for institutional portfolios and compliance buyers.",
    hero_image_url: U("photo-1509391366360-2e959784a276?ixlib=rb-4.0.3"),
    logo_url: U("photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3", 320),
    industry: "Green Technology",
    stage: "Pre-Seed",
    funding_need_amount: 1200000,
    status: "published",
    iec_level: "L0",
    brand_palette: "ocean",
    growth_rate_pct: 31,
    view_count: 7150,
    interest_count: 156,
  },
  {
    startup_index: 6,
    title: "CellPrint — Living Scaffolds, Real Healing",
    summary:
      "3D bioprinted grafts tailored to patient geometry — starting with complex dermal wounds.",
    description:
      "CellPrint couples multi-material printing with autologous cell expansion protocols. Surgeons receive sterile, traceable constructs with same-week turnaround in partner hospitals.",
    hero_image_url: U("photo-1579165466949-3180a3d05687?ixlib=rb-4.0.3"),
    logo_url: U("photo-1581093588409-fb42e3eaa3aa?ixlib=rb-4.0.3", 320),
    industry: "Biotechnology",
    stage: "Seed",
    funding_need_amount: 3400000,
    status: "published",
    iec_level: "L1",
    brand_palette: "rose",
    growth_rate_pct: 16,
    view_count: 11200,
    interest_count: 267,
  },
  {
    startup_index: 7,
    title: "RailMint — Escrow That Moves at Market Speed",
    summary:
      "Programmable settlement rails for B2B marketplaces — funds flow when truth hits the chain.",
    description:
      "RailMint abstracts complex payout trees into composable workflows. Dispute windows, milestone splits, and FX are first-class. Live with two high-GMV vertical platforms.",
    hero_image_url: U("photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3"),
    logo_url: U("photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3", 320),
    industry: "FinTech",
    stage: "Seed",
    funding_need_amount: 2500000,
    status: "published",
    iec_level: "L1",
    brand_palette: "ember",
    growth_rate_pct: 21,
    view_count: 8890,
    interest_count: 201,
  },
  {
    startup_index: 8,
    title: "Atlas Inference — Sovereign AI Regions",
    summary:
      "Dedicated inference fabrics for regulated workloads — sub-12ms p95 next to your data.",
    description:
      "Atlas packages GPU estates with policy-aware routing, audit logs, and cross-region failover. Banks and health networks get hyperscaler economics without shipping data offshore.",
    hero_image_url: U("photo-1527474305487-b87b222841cc?ixlib=rb-4.0.3"),
    logo_url: U("photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3", 320),
    industry: "Artificial Intelligence",
    stage: "Series A",
    funding_need_amount: 4800000,
    status: "published",
    iec_level: "L3",
    brand_palette: "glacier",
    growth_rate_pct: 17,
    view_count: 15330,
    interest_count: 355,
  },
  {
    startup_index: 9,
    title: "EverRoot — Vertical Farms That Actually Scale",
    summary:
      "Spectral vision + closed-loop climate control = predictable yield, not guesswork.",
    description:
      "EverRoot’s stack tunes light recipes per cultivar hour by hour. Operators see energy and yield on one dashboard; enterprise buyers get year-round SLA-backed supply contracts.",
    hero_image_url: U("photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3"),
    logo_url: U("photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3", 320),
    industry: "Green Technology",
    stage: "Series A",
    funding_need_amount: 3100000,
    status: "published",
    iec_level: "L1",
    brand_palette: "sunset",
    growth_rate_pct: 24,
    view_count: 10440,
    interest_count: 233,
  },
];

const SERVICE_LISTINGS = [
  {
    startup_index: 0,
    title: "Cognify Enterprise Onboarding",
    summary: "White-glove rollout: connectors, guardrails, and success playbooks.",
    description:
      "We embed with your ops team for 30 days, ship prioritized automations, and train champions on the Command console.",
    category: "Professional Services",
    industry: "Artificial Intelligence",
    price_from: 45000,
    price_to: 180000,
    currency: "USD",
  },
  {
    startup_index: 1,
    title: "Verdant Flex Audit",
    summary: "Tariff + load study to size your first flex block.",
    description:
      "Engineers model savings scenarios and grid-service eligibility before you sign hardware contracts.",
    category: "Consulting",
    industry: "Green Technology",
    price_from: 12000,
    price_to: 35000,
    currency: "USD",
  },
  {
    startup_index: 2,
    title: "HelixFold Assay Sprint",
    summary: "Four-week wet-lab validation loop on your target construct.",
    description:
      "Includes robotic triage, stability panels, and a structured data package for investor diligence.",
    category: "R&D",
    industry: "Biotechnology",
    price_from: 85000,
    price_to: 220000,
    currency: "USD",
  },
  {
    startup_index: 3,
    title: "Prism Treasury Launch",
    summary: "Go-live pack for multi-entity cash visibility.",
    description:
      "Bank connectivity, policy templates, and CFO workshop series — tailored to your ERP stack.",
    category: "Implementation",
    industry: "FinTech",
    price_from: 60000,
    price_to: 150000,
    currency: "USD",
  },
  {
    startup_index: 4,
    title: "LumenGraph Risk Graph Build",
    summary: "Entity resolution + first 3 high-value risk playbooks.",
    description:
      "We map your top supply lanes and counterparties, then ship analyst-ready monitors.",
    category: "Technology",
    industry: "Artificial Intelligence",
    price_from: 35000,
    price_to: 95000,
    currency: "USD",
  },
  {
    startup_index: 5,
    title: "TideLoop MRV Instrumentation",
    summary: "Deploy sensors + digital twin for your removal site.",
    description:
      "Field engineers install telemetry kits and sync data into TideLoop’s permanence scoring engine.",
    category: "Field Services",
    industry: "Green Technology",
    price_from: 25000,
    price_to: 120000,
    currency: "USD",
  },
  {
    startup_index: 6,
    title: "CellPrint Surgical Training",
    summary: "Cadaveric and simulated implant workshops for your team.",
    description:
      "Includes sterile handling certification and OR workflow design for first-in-human cohorts.",
    category: "Training",
    industry: "Biotechnology",
    price_from: 18000,
    price_to: 55000,
    currency: "USD",
  },
  {
    startup_index: 7,
    title: "RailMint Workflow Studio",
    summary: "Design complex payout trees with our solutions architects.",
    description:
      "We translate legal agreements into executable escrow flows with test harnesses and audit exports.",
    category: "Professional Services",
    industry: "FinTech",
    price_from: 20000,
    price_to: 75000,
    currency: "USD",
  },
  {
    startup_index: 8,
    title: "Atlas Dedicated Region Setup",
    summary: "Provision sovereign inference enclave with compliance pack.",
    description:
      "Includes networking hardening, logging exports, and failover drills against your acceptance criteria.",
    category: "Infrastructure",
    industry: "Artificial Intelligence",
    price_from: 95000,
    price_to: 320000,
    currency: "USD",
  },
  {
    startup_index: 9,
    title: "EverRoot Yield Guarantee Review",
    summary: "Spectral tuning + SLA modeling for enterprise offtake.",
    description:
      "Agronomists and data scientists co-design light recipes to hit contracted tonnage bands.",
    category: "Consulting",
    industry: "Green Technology",
    price_from: 15000,
    price_to: 48000,
    currency: "USD",
  },
];

const IEC_LEVELS = [
  { code: "L0", name: "Unverified", description: "Chưa được đánh giá IEC", order: 0 },
  { code: "L1", name: "Basic Verified", description: "Đã xác minh thông tin cơ bản và pháp lý", order: 1 },
  { code: "L3", name: "Premium Verified", description: "Đã xác minh đầy đủ với due diligence chuyên sâu", order: 2 }
];

const IEC_CRITERIA = [
  // L1 criteria
  { level_code: "L1", code: "L1_LEGAL", title: "Pháp lý doanh nghiệp", description: "Đăng ký kinh doanh, mã số thuế hợp lệ", weight: 25, is_required: true },
  { level_code: "L1", code: "L1_TEAM", title: "Đội ngũ sáng lập", description: "Thông tin founder và core team xác minh được", weight: 25, is_required: true },
  { level_code: "L1", code: "L1_PRODUCT", title: "Sản phẩm/dịch vụ", description: "Có sản phẩm MVP hoặc đang hoạt động", weight: 25, is_required: true },
  { level_code: "L1", code: "L1_PITCH", title: "Pitch deck chuẩn", description: "Có pitch deck với đầy đủ thông tin cơ bản", weight: 25, is_required: false },
  // L3 criteria
  { level_code: "L3", code: "L3_FINANCE", title: "Báo cáo tài chính", description: "Báo cáo tài chính kiểm toán 12 tháng gần nhất", weight: 20, is_required: true },
  { level_code: "L3", code: "L3_TRACTION", title: "Traction metrics", description: "Số liệu tăng trưởng được xác minh (MRR, MAU, etc.)", weight: 20, is_required: true },
  { level_code: "L3", code: "L3_MARKET", title: "Market validation", description: "Có customer references hoặc case studies", weight: 20, is_required: true },
  { level_code: "L3", code: "L3_LEGAL_ADV", title: "Due diligence pháp lý", description: "Không có tranh chấp pháp lý, IP được bảo vệ", weight: 20, is_required: true },
  { level_code: "L3", code: "L3_DATA_ROOM", title: "Data room hoàn chỉnh", description: "Có data room với đầy đủ tài liệu cho nhà đầu tư", weight: 20, is_required: false }
];

async function main() {
  console.log("🚀 Starting full seed...\n");

  const password = "123456";
  const password_hash = await bcrypt.hash(password, 10);

  // =====================
  // 1. Create Organization
  // =====================
  console.log("📁 Creating organization...");
  let org = await prisma.org.findFirst({ where: { name: "IEC Hub Platform" } });
  if (!org) {
    org = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: "IEC Hub Platform",
        org_type: "platform",
        website: "https://iechub.vn",
        logo_url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80"
      }
    });
  }
  console.log(`   ✓ Org: ${org.name}\n`);

  // =====================
  // 2. Create Admin User
  // =====================
  console.log("👤 Creating admin user...");
  const adminEmail = "admin@iechub.local";
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: randomUUID(),
      full_name: "IEC Hub Admin",
      email: adminEmail,
      user_type: "admin",
      approval_status: "approved",
      password_hash,
      org_id: org.id,
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    }
  });
  console.log(`   ✓ Admin: ${adminEmail}\n`);

  // =====================
  // 3. Create IEC Levels
  // =====================
  console.log("🏆 Creating IEC levels...");
  const iecLevelMap = {};
  for (const lvl of IEC_LEVELS) {
    const levelData = {
      org_id: org.id,
      level: lvl.code,
      name: lvl.name,
      description: lvl.description,
    };
    let level = await prisma.iecLevel.findFirst({
      where: { org_id: org.id, level: lvl.code },
    });
    if (!level) {
      level = await prisma.iecLevel.create({ data: levelData });
      console.log(`   ✓ ${lvl.code}: ${lvl.name}`);
    } else {
      level = await prisma.iecLevel.update({
        where: { id: level.id },
        data: { name: lvl.name, description: lvl.description },
      });
      console.log(`   ↻ ${lvl.code}: ${lvl.name}`);
    }
    iecLevelMap[lvl.code] = level;
  }
  console.log("");

  // =====================
  // 4. Create IEC Criteria
  // =====================
  console.log("📋 Creating IEC criteria...");
  const criteriaMap = {};
  for (const c of IEC_CRITERIA) {
    const levelId = iecLevelMap[c.level_code].id;
    const existing = await prisma.iecCriterion.findFirst({
      where: { iec_level_id: levelId, title: c.title },
    });
    if (!existing) {
      const criterion = await prisma.iecCriterion.create({
        data: {
          org_id: org.id,
          iec_level_id: levelId,
          title: c.title,
          description: c.description,
          weight: c.weight,
          is_required: c.is_required,
        }
      });
      criteriaMap[c.code] = criterion;
      console.log(`   ✓ ${c.code}: ${c.title}`);
    } else {
      criteriaMap[c.code] = existing;
    }
  }
  console.log("");

  // =====================
  // 5. Create Startup Users & Profiles
  // =====================
  console.log("🚀 Creating startup users...");
  const startupProfiles = [];
  const startupUsers = [];
  for (const s of STARTUPS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        full_name: s.full_name,
        avatar_url: s.avatar_url,
      },
      create: {
        id: randomUUID(),
        full_name: s.full_name,
        email: s.email,
        user_type: "startup",
        approval_status: "approved",
        password_hash,
        org_id: org.id,
        avatar_url: s.avatar_url,
      }
    });
    startupUsers.push(user);

    let profile = await prisma.startupProfile.findUnique({ where: { user_id: user.id } });
    const profileData = {
      org_id: org.id,
      company_name: s.company_name,
      company_description: s.short_description,
      industry: s.industry,
      location: `${s.city}, ${s.country}`,
      funding_stage: s.stage,
      website: s.website,
      funding_amount: s.funding_need_amount,
      funding_currency: "USD",
      avatar_url: s.avatar_url,
    };
    if (!profile) {
      profile = await prisma.startupProfile.create({
        data: {
          user_id: user.id,
          ...profileData,
        }
      });
    } else {
      profile = await prisma.startupProfile.update({
        where: { id: profile.id },
        data: profileData,
      });
    }
    startupProfiles.push(profile);
    console.log(`   ✓ ${s.company_name} (${s.email})`);
  }
  console.log("");

  // =====================
  // 6. Create Investor Users & Profiles
  // =====================
  console.log("💰 Creating investor users...");
  const investorProfiles = [];
  const investorUsers = [];
  for (const inv of INVESTORS) {
    const user = await prisma.user.upsert({
      where: { email: inv.email },
      update: {},
      create: {
        id: randomUUID(),
        full_name: inv.full_name,
        email: inv.email,
        user_type: "investor",
        approval_status: "approved",
        password_hash,
        org_id: org.id,
        avatar_url: `https://i.pravatar.cc/150?u=${inv.email}`
      }
    });
    investorUsers.push(user);

    let profile = await prisma.investorProfile.findUnique({ where: { user_id: user.id } });
    if (!profile) {
      profile = await prisma.investorProfile.create({
        data: {
          user_id: user.id,
          org_id: org.id,
          organization_name: inv.organization_name,
          investor_type: inv.investor_type,
          ticket_size_min: inv.ticket_size_min,
          ticket_size_max: inv.ticket_size_max,
          preferred_industries: inv.preferred_industries,
          preferred_stages: inv.preferred_stages,
          country: inv.country
        }
      });
    } else {
      profile = await prisma.investorProfile.update({
        where: { id: profile.id },
        data: {
          investor_type: inv.investor_type,
          ticket_size_min: inv.ticket_size_min,
          ticket_size_max: inv.ticket_size_max,
          preferred_industries: inv.preferred_industries,
          preferred_stages: inv.preferred_stages,
          country: inv.country
        }
      });
    }
    investorProfiles.push(profile);
    console.log(`   ✓ ${inv.organization_name} (${inv.email})`);
  }
  console.log("");

  // =====================
  // 7. Create Projects
  // =====================
  console.log("📦 Creating projects...");
  const createdProjects = [];
  for (const p of PROJECTS) {
    const startup = startupProfiles[p.startup_index];

    const existing = await prisma.project.findFirst({ where: { title: p.title, startup_id: startup.id } });
    const projectPayload = {
      org_id: org.id,
      startup_id: startup.id,
      title: p.title,
      summary: p.summary,
      description: p.description,
      hero_image_url: p.hero_image_url,
      logo_url: p.logo_url ?? null,
      industry: p.industry,
      stage: p.stage,
      funding_need_amount: p.funding_need_amount,
      funding_currency: "USD",
      status: p.status,
      iec_level: p.iec_level,
      brand_palette: p.brand_palette ?? null,
      growth_rate_pct: typeof p.growth_rate_pct === "number" ? p.growth_rate_pct : null,
      view_count: typeof p.view_count === "number" ? p.view_count : 0,
      interest_count: typeof p.interest_count === "number" ? p.interest_count : 0,
    };
    if (!existing) {
      const project = await prisma.project.create({
        data: {
          id: randomUUID(),
          ...projectPayload,
        }
      });
      createdProjects.push(project);
      console.log(`   ✓ ${p.title}`);
    } else {
      const project = await prisma.project.update({
        where: { id: existing.id },
        data: projectPayload,
      });
      createdProjects.push(project);
      console.log(`   ↻ ${p.title} (updated)`);
    }
  }
  console.log("");

  // =====================
  // 8. Create Service Listings
  // =====================
  console.log("🛒 Creating service listings...");
  for (const s of SERVICE_LISTINGS) {
    const startup = startupProfiles[s.startup_index];
    const slugBase = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

    const existing = await prisma.serviceListing.findFirst({ where: { title: s.title, startup_id: startup.id } });
    if (!existing) {
      await prisma.serviceListing.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          startup_id: startup.id,
          title: s.title,
          slug,
          summary: s.summary,
          description: s.description,
          category: s.category,
          industry: s.industry,
          price_from: s.price_from,
          price_to: s.price_to,
          currency: s.currency,
          status: "published"
        }
      });
      console.log(`   ✓ ${s.title}`);
    }
  }
  console.log("");

  // =====================
  // 9. Create Data Rooms for published projects
  // =====================
  console.log("🔐 Creating data rooms...");
  const dataRooms = [];
  for (const proj of createdProjects.filter(p => p.status === "published")) {
    const existing = await prisma.dataRoom.findFirst({ where: { project_id: proj.id } });
    if (!existing) {
      const dr = await prisma.dataRoom.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          project_id: proj.id,
          name: `Data Room - ${proj.title}`,
          description: `Tài liệu due diligence cho dự án ${proj.title}`
        }
      });
      dataRooms.push(dr);
      console.log(`   ✓ Data Room for ${proj.title}`);
    } else {
      dataRooms.push(existing);
    }
  }
  console.log("");

  // =====================
  // 10. Create Data Room Requests
  // =====================
  console.log("📨 Creating data room requests...");
  // Each investor requests access to a few projects
  for (let i = 0; i < investorProfiles.length; i++) {
    const investor = investorProfiles[i];
    const projectsToRequest = createdProjects.filter(p => p.status === "published").slice(i, i + 2);
    
    for (const proj of projectsToRequest) {
      const dataRoom = dataRooms.find(dr => dr.project_id === proj.id);
      const existing = await prisma.dataRoomRequest.findFirst({
        where: { investor_id: investor.id, project_id: proj.id }
      });
      if (!existing && dataRoom) {
        const status = i === 0 ? "approved" : i === 1 ? "pending" : "pending";
        await prisma.dataRoomRequest.create({
          data: {
            id: randomUUID(),
            org_id: org.id,
            project_id: proj.id,
            investor_id: investor.id,
            data_room_id: dataRoom.id,
            status,
            reason: `Quan tâm đầu tư vào lĩnh vực ${proj.industry}`
          }
        });
        console.log(`   ✓ ${INVESTORS[i].organization_name} → ${proj.title} (${status})`);
      }
    }
  }
  console.log("");

  // =====================
  // 11. Create IEC Assessments
  // =====================
  console.log("📝 Creating IEC assessments...");
  const publishedProjects = createdProjects.filter(p => p.iec_level && p.iec_level !== "L0");
  for (const proj of publishedProjects) {
    const targetLevel = iecLevelMap[proj.iec_level];
    const existing = await prisma.projectIecAssessment.findFirst({
      where: { project_id: proj.id }
    });
    if (!existing && targetLevel) {
      const assessment = await prisma.projectIecAssessment.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          project_id: proj.id,
          assessor_id: adminUser.id,
          target_level_id: targetLevel.id,
          final_level_id: targetLevel.id,
          status: "approved",
          comments: `Dự án đã hoàn thành đánh giá IEC ${proj.iec_level}`
        }
      });

      // Create scores for each criterion of this level
      const criteria = await prisma.iecCriterion.findMany({ where: { iec_level_id: targetLevel.id } });
      for (const c of criteria) {
        await prisma.projectIecScore.create({
          data: {
            id: randomUUID(),
            org_id: org.id,
            assessment_id: assessment.id,
            criterion_id: c.id,
            score: 80 + Math.floor(Math.random() * 20), // 80-100
            comment: "Đạt yêu cầu"
          }
        });
      }
      console.log(`   ✓ Assessment for ${proj.title} → ${proj.iec_level}`);
    }
  }
  console.log("");

  // =====================
  // 12. Create Match Intents & Matches
  // =====================
  console.log("🤝 Creating matches...");
  // Create some match intents from investors
  for (let i = 0; i < 3; i++) {
    const investor = investorProfiles[i];
    const project = createdProjects[i];
    const startup = startupProfiles[PROJECTS[i].startup_index];

    const existingIntent = await prisma.matchIntent.findFirst({
      where: { investor_id: investor.id, project_id: project.id }
    });
    
    if (!existingIntent) {
      const intent = await prisma.matchIntent.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          investor_id: investor.id,
          project_id: project.id,
          status: "liked",
          source: "marketplace"
        }
      });

      // Create actual match
      const match = await prisma.match.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          project_id: project.id,
          startup_id: startup.id,
          investor_id: investor.id,
          match_intent_id: intent.id,
          iec_level_at_match: project.iec_level,
          status: i === 0 ? "intro_done" : "pending_intro"
        }
      });

      // Create match event
      await prisma.matchEvent.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          match_id: match.id,
          event_type: "intro_sent",
          new_status: match.status,
          actor_id: investorUsers[i].id,
          note: `${INVESTORS[i].organization_name} matched with ${project.title}`
        }
      });

      console.log(`   ✓ ${INVESTORS[i].organization_name} ↔ ${project.title}`);
    }
  }
  console.log("");

  // =====================
  // 13. Create Notifications
  // =====================
  console.log("🔔 Creating notifications...");
  const notificationTypes = [
    { type: "data_room_request", payload: { message: "Có yêu cầu truy cập Data Room mới" } },
    { type: "match_created", payload: { message: "Bạn có một kết nối mới với nhà đầu tư" } },
    { type: "iec_assessment_completed", payload: { message: "Đánh giá IEC đã hoàn thành" } },
    { type: "new_project_view", payload: { message: "Dự án của bạn vừa được xem" } }
  ];

  for (let i = 0; i < startupUsers.length; i++) {
    for (const notif of notificationTypes.slice(0, 2 + Math.floor(Math.random() * 2))) {
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          org_id: org.id,
          recipient_user_id: startupUsers[i].id,
          type: notif.type,
          payload: notif.payload,
          read_at: Math.random() > 0.5 ? new Date() : null
        }
      });
    }
  }

  for (let i = 0; i < investorUsers.length; i++) {
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        org_id: org.id,
        recipient_user_id: investorUsers[i].id,
        type: "new_project_match",
        payload: { message: "Có dự án mới phù hợp với tiêu chí đầu tư của bạn" },
        read_at: null
      }
    });
  }
  console.log(`   ✓ Created notifications for all users\n`);

  // =====================
  // Summary
  // =====================
  console.log("═══════════════════════════════════════════════════");
  console.log("✅ SEED COMPLETED SUCCESSFULLY!");
  console.log("═══════════════════════════════════════════════════\n");
  console.log("📊 Summary:");
  console.log(`   • Startups: ${STARTUPS.length}`);
  console.log(`   • Investors: ${INVESTORS.length}`);
  console.log(`   • Projects: ${PROJECTS.length}`);
  console.log(`   • Service Listings: ${SERVICE_LISTINGS.length}`);
  console.log(`   • IEC Levels: ${IEC_LEVELS.length}`);
  console.log(`   • IEC Criteria: ${IEC_CRITERIA.length}`);
  console.log("");
  console.log("🔐 Login Accounts (password: 123456):");
  console.log("   Admin:    admin@iechub.local");
  console.log("");
  console.log("   Startups:");
  STARTUPS.forEach(s => console.log(`     • ${s.email} (${s.company_name})`));
  console.log("");
  console.log("   Investors:");
  INVESTORS.forEach(inv => console.log(`     • ${inv.email} (${inv.organization_name})`));
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
