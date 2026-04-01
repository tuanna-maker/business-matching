# IEC HUB – MASTER TODO (TECHNICAL SPECIFICATION V4.2)

Nguyên tắc thực thi:

Vertical Slicing: Triển khai hoàn thiện từ hạ tầng dữ liệu (Database) đến logic nghiệp vụ (NestJS API) và giao diện người dùng (React UI) cho từng Module.

Technical Excellence: Tuân thủ kiến trúc Monorepo, đảm bảo tính đóng gói dữ liệu và an toàn thông tin theo mô hình Zero-Trust.

## Epic 0 – Infrastructure & Core Configuration (Hạ tầng cốt lõi)
[x] 0.1 Data Modeling: Thiết lập schema.prisma hỗ trợ cấu trúc Multi-tenant (Multi-OA) và RBAC (Role-Based Access Control).
[x] 0.2 Database Provisioning: Cấu hình PostgreSQL, thực thi npx prisma db push và kiểm tra tính toàn vẹn của các Index.
[x] 0.3 Shared Type System: Triển khai cơ chế đồng bộ Types/DTOs từ Prisma ra @packages/shared để đảm bảo tính nhất quán giữa Backend và Frontend.
[x] 0.4 Auth Provider: Xây dựng Module JWT Authentication, tích hợp Passport Strategy và cơ chế quản lý Token.

## Epic 1 – Multi-tenant Identity & Organization Management
Mục tiêu: Quản lý định danh doanh nghiệp và phân quyền đa cấp.

[x] 1.1 Enterprise Authentication:
Logic: Thực thi Validator ngăn chặn các Domain email công cộng (Gmail, Yahoo), chỉ chấp nhận Corporate Email Domain.
API: Hoàn thiện AuthController với các Endpoint đăng ký chuyên biệt cho Startup/Investor.

[x] 1.2 Multi-OA Architecture:
Logic: Thiết lập quan hệ Many-to-Many giữa User và Organization. Cho phép một người dùng quản lý đồng thời nhiều thực thể pháp lý.
UI: Triển khai Component OrganizationSwitcher hỗ trợ chuyển đổi Context làm việc tức thì.

[x] 1.3 Advanced Organization Profile:
Data: Tích hợp các trường dữ liệu định danh: Tax ID, Legal Representative, Website, và Business Sector.
UI: Xây dựng Module quản lý thành viên và phân quyền trong nội bộ Organization Account (OA).

## Epic 2 – Project Lifecycle & Secure Data Room (Data Vault)
Mục tiêu: Quản lý tài sản số và kiểm soát truy cập dữ liệu theo phân tầng bảo mật.

[x] 2.1 Project Meta-data Management: Triển khai CRUD cho thực thể Project với các thuộc tính: Industry, Stage, Funding Needs, và Status.

[ ] 2.2 Tiered Data Access Control (3-Tier Security):
Logic: Thiết lập phân tầng dữ liệu: Public (Công khai), Protected (Yêu cầu truy cập), Confidential (Bảo mật tuyệt đối).
API: Xây dựng Request-Approve flow cho việc truy cập dữ liệu tầng Protected và Confidential. Kiểm soát thời hạn truy cập (TTL).

[ ] 2.3 Data Room UX Integration:
UI: Thiết kế Component DataVault hiển thị danh sách tài liệu. Sử dụng kỹ thuật Blur Filter và Shimmer Effect cho các tài liệu chưa được cấp quyền truy cập để đảm bảo tính bảo mật về mặt thị giác.

## Epic 3 – IEC Verification & Trust Scoring Framework
Mục tiêu: Định lượng hóa độ tin cậy của doanh nghiệp thông qua dữ liệu thực và xác thực chéo.

[x] 3.1 IEC Levels Specification: Thiết lập hệ thống tiêu chí đánh giá IEC (Level 0 - Level 3).

[x] 3.2 Reputation & Trust Engine:
Logic: Xây dựng thuật toán tính toán Trust Score (0-100) dựa trên 4 biến số: Profile Completeness, IEC Level, Vouching Rate, và Interaction Quality.
Formula: Trust Score = (P × 0.2) + (I × 0.4) + (V × 0.2) + (A × 0.2)
- P (Profile Completeness): % hoàn thiện các trường dữ liệu bắt buộc
- I (IEC Level): L0=0, L1=30, L2=60, L3=100
- V (Vouching): Số lượng xác thực chéo từ các tổ chức đã Verified (Max = 100)
- A (Audit History): Tần suất hoạt động và tính minh bạch của lịch sử cập nhật
API: Endpoint truy xuất TrustScore thời gian thực của từng Organization.
UI: TrustBadge component với Aurora Glow effect cho các profile có điểm tín nhiệm cao.

[x] 3.3 Vouching & Social Proof Logic:
API: Triển khai cơ chế xác thực chéo giữa các doanh nghiệp đã định danh (Verified Organizations).
UI: Hiển thị Badge hệ thống và chứng nhận từ đối tác trên Profile dự án.

## Epic 4 – Marketplace Matching & Deal Flow Optimization
Mục tiêu: Tối ưu hóa hiệu quả kết nối dựa trên thuật toán so khớp dữ liệu.

[x] 4.1 Discovery Engine: Triển khai bộ lọc (Filtering) nâng cao theo Industry, Funding Stage, và IEC Level.

[x] 4.2 Asymmetric Matching Algorithm:
Logic: Phát triển thuật toán gợi ý dựa trên sự tương đồng (Similarity Scoring) giữa Nhu cầu đầu tư và Năng lực thực thi của dự án.
Formula: Match Score = Σ (Criteria_Fit × Weight)
- Industry Fit (40%): So khớp ngành nghề kinh doanh
- Stage Fit (30%): Giai đoạn phát triển (Seed, Series A, B...)
- Funding Fit (20%): Khoảng vốn cần huy động so với khẩu vị của Investor
- IEC Level Fit (10%): Yêu cầu tối thiểu về mức độ xác thực
UI: MatchScore component với Pulse effect trên Project Card, hiển thị chỉ số tương thích.

[ ] 4.3 Transactional Pipeline: Quản lý vòng đời kết nối (Match Lifecycle) từ khi khởi tạo Intent đến khi hoàn tất giao dịch (Closed Deal).

## Epic 5 – Analytics, Audit & System Governance
Mục tiêu: Giám sát hệ thống và cung cấp báo cáo phân tích thị trường.

[x] 5.1 Audit Logging: Ghi lại toàn bộ lịch sử tương tác dữ liệu (Who, When, What) để đảm bảo tính minh bạch.

[ ] 5.2 Business Intelligence Dashboard:
API: Aggregate dữ liệu về lưu lượng vốn, xu hướng công nghệ và phân bổ IEC Level trong hệ sinh thái.
UI: Triển khai hệ thống biểu đồ phân tích (Chart/Graph) dành cho Admin và các nhà nghiên cứu thị trường.

[ ] 5.3 Real-time Notification System: Tích hợp Webhook/Websocket để thông báo các sự kiện quan trọng: Yêu cầu truy cập Data Room, Cập nhật trạng thái IEC.

## Epic 6 – UI/UX Standardization & Social Layer
Mục tiêu: Hoàn thiện giao diện theo tiêu chuẩn B2B chuyên nghiệp.

[ ] 6.1 Unified Global Search: Tích hợp thanh tìm kiếm hợp nhất hỗ trợ Search Grouping (Projects, Organizations, Services).

[ ] 6.2 Bento Grid & Glassmorphism UI:
UI: Áp dụng thiết kế Bento Grid cho Dashboard và Glassmorphism cho các Card component.
Animation: Sử dụng framer-motion cho mọi tương tác chuyển lớp dữ liệu.

[ ] 6.3 Social Layer:
UI: Triển khai tính năng Follow, Share, và Public Activity Feed cho các Organization.

---

## Progress Summary (Latest: 2026-03-22)

### Completed Changes:

**Epic 0 - Infrastructure:**
- [x] Added TrustScore and Vouch models to schema.prisma with optimized indexes
- [x] Database schema updated for trust scoring and vouching functionality

**Epic 2 - Trust Scoring Engine:**
- [x] Implemented TrustScoreService with complete algorithm:
  - Profile Completeness calculation (P)
  - IEC Level scoring (I): L0=0, L1=30, L2=60, L3=100
  - Vouch Score calculation (V): Based on active vouches from verified orgs
  - Audit History scoring (A): Based on recent activity frequency
  - Final formula: Trust Score = (P × 0.2) + (I × 0.4) + (V × 0.2) + (A × 0.2)
- [x] Implemented VouchService for cross-verification between organizations
  - Only L2+ verified orgs can give vouches
  - Support for partnership, transaction, and reference vouch types
  - Automatic trust score recalculation on vouch creation/revocation
- [x] Created TrustScore and Vouch API endpoints in IecController

**Epic 3 - Matching Algorithm:**
- [x] Implemented MatchScoreService with Weighted Vector Similarity algorithm:
  - Industry Fit (40%): Keyword-based industry matching
  - Stage Fit (30%): Funding stage compatibility (pre-seed to IPO)
  - Funding Fit (20%): Investment range overlap calculation
  - IEC Level Fit (10%): Minimum IEC requirement validation
  - Top matches generation for investors
- [x] Created MatchScore API endpoints in MatchingController

**Epic 4 - UI Components:**
- [x] Created TrustBadge component with Aurora Glow effect
  - Platinum (90+), Gold (75-89), Silver (60-74), Bronze (40-59), New (<40)
  - Animated glow effect using framer-motion
  - Compact and standard size variants
- [x] Created MatchScore component with Pulse effect
  - Excellent (85+), Great (70-84), Good (55-69), Fair (40-54), Low (<40)
  - Animated pulse effect for high scores (70+)
  - Breakdown tooltip showing individual criteria scores
- [x] Updated ProjectCard component
  - Integrated TrustBadge and MatchScore displays
  - Data Vault status indicator
  - Maintained existing layout and functionality

**Module Integration:**
- [x] Updated IecModule to export TrustScoreService and VouchService
- [x] Updated MatchingModule to export MatchScoreService
- [x] Updated IecController with Trust Score and Vouch endpoints
- [x] Updated MatchingController with Match Score endpoints

### Next Steps:
1. Run `npx prisma db push` to sync database schema
2. Create Data Vault 3-tier security (Epic 2.2)
3. Build Analytics Dashboard (Epic 5.2)
4. Apply Bento Grid & Glassmorphism UI standards (Epic 6.2)
5. Implement Social Layer features (Epic 6.3)
