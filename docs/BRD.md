<!--
# IEC Hub — BRD placeholder

TBD
-->

# IEC Hub — Business Requirements Document (BRD v7.0)

**Sản phẩm:** IEC Hub — Trust-based B2B Data Infrastructure  
**Phiên bản:** 7.0  
**Cập nhật:** 25/03/2026  

---

## 1) Executive Summary — Nhu cầu tìm “đúng thông tin” để ra quyết định

Trong thực tế hiện nay, cả **cá nhân** và **doanh nghiệp** đều phải bắt đầu từ nhu cầu tìm kiếm thông tin: muốn biết công nghệ/sản phẩm nào phù hợp, ai là bên có năng lực thực sự, và thông tin đó có đủ cơ sở để ra quyết định hay không.

Vấn đề thường không nằm ở “thiếu thông tin”, mà nằm ở **không biết tìm ở đâu là uy tín** và **không có cách đối chiếu** giữa giới thiệu bề mặt với thực trạng vận hành.

Với từng nhóm, bài toán cụ thể khác nhau:

- **Startup:** cần tìm thông tin/đầu mối đúng để tiếp cận đối tác phù hợp theo giai đoạn (beta/scale), đồng thời có đủ dữ liệu để thuyết phục nhà đầu tư.
- **Investor:** cần lọc deal flow và ra quyết định nhanh dựa trên thông tin có thể kiểm chứng, giảm rủi ro “đọc sai hồ sơ”.
- **SME:** cần tìm giải pháp/đối tác phù hợp theo bối cảnh và hạn chế rủi ro “lệch kỳ vọng”.

IEC Hub được xây để giải quyết phần “đáng tin” trong hành trình tìm kiếm đó: biến dữ liệu và tiến độ dự án thành **bằng chứng có cấu trúc**, đồng thời triển khai **cơ chế chia sẻ theo tier có phê duyệt** để giảm tranh cãi và tăng tốc hợp tác.

---

## 2) Scope — Phạm vi hệ thống (bám sát chức năng hiện có trên web)

### 2.1. Các nhóm chức năng chính

IEC Hub hiện triển khai các nhóm chức năng chính:

1. **Đăng ký / Đăng nhập** (vai trò: Startup hoặc Investor)
2. **Profile & Settings** (quản lý thông tin cá nhân; trạng thái email/approval được hiển thị)
3. **Dashboard** (tổng quan; hiển thị trust score và IEC level khi user có organization)
4. **Discover** (duyệt các dự án ở trạng thái `published`)
5. **Projects**
   - Startup tạo/cập nhật dự án
   - Startup chuyển trạng thái `draft` <-> `published` và có thể `archived`
   - Xem trang chi tiết dự án
6. **Vault / Data Room**
   - Startup tạo Data Room cho project và phản hồi yêu cầu truy cập
   - Investor xem tài liệu theo quyền và gửi yêu cầu truy cập theo tier
7. **Matching** (quản lý pipeline theo các trạng thái deal)
8. **IEC Verification & Trust Score**
   - Hiển thị trust score/IEC level và trạng thái xác thực của tổ chức
9. **Organization Management** (members và invites)
10. **Admin Dashboard** (metrics & audit logs)
11. **Notifications** (xem thông báo và đánh dấu đã đọc)
12. **Directory** (duyệt community theo vai trò và tín hiệu IEC/trust)
13. **Social Feed** (follow/like cơ bản)
14. **Events** (tùy chọn; chỉ hiển thị khi cấu hình môi trường bật)

### 2.2. Non-goals

- Không cam kết “booking/meeting tự động” phức tạp.
- Không cam kết mô tả chi tiết thuật toán AI/Feed như sản phẩm mạng xã hội.
- Tài liệu tập trung vào trải nghiệm dữ liệu sống, trust score và cơ chế Data Room theo tier.

---

## 3) Personas & Jobs-to-be-done

### 3.1. Startup (chủ dự án)

**Mục tiêu:** biến tiến độ và năng lực thành dữ liệu đủ rõ để thu hút investor đúng thời điểm.

**Jobs-to-be-done:**

- Publish dự án để xuất hiện trong Discover.
- Chuẩn bị Data Room và phản hồi yêu cầu truy cập theo quy tắc tier.
- Theo dõi pipeline matching và cập nhật tiến trình deal.

### 3.2. Investor (người tìm cơ hội)

**Mục tiêu:** giảm thời gian “tìm sai deal” và “đọc sai hồ sơ” bằng quyết định dựa trên dữ liệu có thể kiểm chứng.

**Jobs-to-be-done:**

- Duyệt các dự án `published` trong Discover.
- Tạo tín hiệu quan tâm và theo dõi tiến trình qua Matching.
- Yêu cầu truy cập tài liệu trong Data Room theo tier và theo dõi trạng thái phản hồi.

### 3.3. Organization Owner/Admin

**Mục tiêu:** quản trị đúng người, đúng quyền và đảm bảo dữ liệu đến từ đúng đơn vị.

**Jobs-to-be-done:**

- Quản lý members và invites.
- Kiểm soát quyền theo vai trò (owner/admin/member).

### 3.4. IEC / Admin

**Mục tiêu:** vận hành chất lượng hệ thống và đảm bảo tính kỷ luật thông qua audit.

**Jobs-to-be-done:**

- Xem metrics hệ thống.
- Theo dõi audit logs phục vụ điều tra và kiểm soát.

---

## 4) Product Workflows — Luồng giá trị cốt lõi

### 4.1. Định danh & quyền truy cập

Người dùng đăng ký theo vai trò Startup hoặc Investor, sau đó đăng nhập và quản lý thông tin cá nhân trong Profile/Settings.

Khi user thuộc một organization, hệ thống hiển thị trust score/IEC level để làm ngữ cảnh quyết định truy cập (đặc biệt ở tier cao).

**Giá trị:** người dùng hiểu rõ “đang ở vai trò gì” và “có quyền tới đâu”.

### 4.2. Projects: chỉ publish khi sẵn sàng chia sẻ

Startup tạo dự án và chuyển trạng thái:

- `draft`: chưa xuất hiện rộng rãi
- `published`: xuất hiện trong Discover
- `archived`: giảm hiện diện trong hệ thống

**Giá trị:** thị trường nhìn thấy “đúng dự án đang sẵn sàng làm việc”.

### 4.3. Discover: khoanh vùng nhanh, giảm rủi ro đọc sai

Discover hiển thị danh sách project `published`, hỗ trợ tìm kiếm theo tiêu đề/mô tả và lọc theo ngành.

**Giá trị:** người xem khoanh vùng sớm, giảm thời gian đọc hồ sơ thiếu thông tin.

### 4.4. Vault / Data Room: chia sẻ theo tier có phê duyệt

Data Room triển khai cơ chế chia sẻ tài liệu theo 3 tier:

- **Public:** xem theo mặc định.
- **Protected:** yêu cầu truy cập kèm mục đích; chủ Data Room phê duyệt; UI có NDA cam kết trước khi gửi yêu cầu truy cập.
- **Confidential:** yêu cầu truy cập có phê duyệt; đồng thời có điều kiện liên quan Trust Score của tổ chức.

Trong UI Vault:

- Startup tạo Data Room cho project.
- Investor gửi yêu cầu truy cập với `purpose` và `message`.
- Startup phản hồi (chấp nhận/từ chối) và hệ thống cập nhật trạng thái để người xem theo dõi minh bạch.

**Giá trị:** giảm tranh cãi; đi theo quy trình từ yêu cầu → phê duyệt → truy cập theo thời hạn.

### 4.5. Matching: pipeline nhìn thấy được

Matching quản lý pipeline theo các trạng thái deal để hai bên không bị “mất dấu” giữa các kênh.

**Giá trị:** tăng kỷ luật vận hành và giúp ra quyết định dựa trên lịch sử tương tác.

### 4.6. IEC Verification & Trust Score: trust score dùng để làm gì

IEC Hub hiển thị trust score và IEC level theo trạng thái xác thực của tổ chức.

Trust Score phản ánh các tín hiệu như mức độ đầy đủ thông tin, trạng thái xác thực, tín hiệu xác thực chéo và dấu vết vận hành/audit.

**Giá trị:** trust score trở thành ngôn ngữ chung để định hướng mức độ truy cập (đặc biệt ở tier confidential).

### 4.7. Organization Management

Org page cho phép xem members, mời thành viên và quản lý thay đổi vai trò theo quyền.

**Giá trị:** tin tưởng đi kèm quyền hạn rõ ràng.

### 4.8. Admin, Notifications, Directory & Social (hỗ trợ)

- Admin Dashboard: metrics & audit logs.
- Notifications: nhắc việc và cập nhật trạng thái.
- Directory: duyệt thành viên theo vai trò và tín hiệu IEC/trust.
- Social Feed: follow/like cơ bản để tăng tín hiệu mạng lưới.

### 4.9. Events (tùy chọn)

Trang Events chỉ là lớp bổ sung khi cấu hình môi trường bật. Luồng cốt lõi vẫn vận hành độc lập.

---

## 5) Business Rules — Luật vận hành cốt lõi

### 5.1. Project visibility

- Chỉ project `published` xuất hiện trong Discover.

### 5.2. Data Room access theo tier

- `public`: xem theo mặc định.
- `protected`: cần yêu cầu truy cập theo tier và có phê duyệt từ chủ Data Room; UI có cam kết NDA trước khi gửi yêu cầu.
- `confidential`: cần phê duyệt và điều kiện liên quan Trust Score.

### 5.3. Trust Score & gating

- Trust Score/IEC level là tín hiệu tin cậy để định hướng mức truy cập ở tier cao.

### 5.4. Role-based authorization

- Startup: tạo/cập nhật project; vận hành Data Room và phản hồi yêu cầu truy cập.
- Investor: duyệt Discover; gửi yêu cầu truy cập Data Room; theo dõi pipeline qua Matching.
- Org owner/admin: quản trị members/invites theo quyền.
- Admin: xem metrics và audit logs.

---

## 6) Success Metrics — Chỉ số thành công

### Phase 1: Xây nền dữ liệu tin cậy

- Số người dùng đăng ký & hoạt động
- Tỷ lệ project được publish (đưa vào Discover)
- Số yêu cầu truy cập Data Room được tạo và được phản hồi
- Trust Score trung bình của các tổ chức đã xác thực

### Phase 2: Tăng chất lượng pipeline

- Tỷ lệ chuyển trạng thái trong Matching
- Tỷ lệ Discover → gửi yêu cầu truy cập Data Room
- Tỷ lệ yêu cầu Protected/Confidential được phê duyệt

### Phase 3: Chuẩn hóa vận hành niềm tin

- Giảm thời gian từ yêu cầu → phê duyệt
- Tăng tỷ lệ deal đi xa hơn trong pipeline nhờ dữ liệu minh bạch
- Tăng độ tin cậy cảm nhận (qua phản hồi người dùng/số tương tác có ý nghĩa)

---

## 7) Risks & Mitigations

1. **Dữ liệu ban đầu thiếu chất lượng**
   - Mitigation: chuẩn hóa template project tối thiểu; hướng dẫn onboarding cho Startup.
2. **Không rõ ràng quyền truy cập**
   - Mitigation: hiển thị rõ trạng thái request/duyệt trong Vault; audit và Admin pages hỗ trợ minh bạch.
3. **Tắc nghẽn ở vòng phê duyệt Data Room**
   - Mitigation: Notifications theo sự kiện; cập nhật trạng thái nhanh; minh bạch lý do khi cần.
4. **Trust Score bị hiểu sai**
   - Mitigation: giải thích trust score dùng để làm gì và tác động tới tier truy cập.

---

## 8) Glossary

- **Trust Score / IEC Trust:** điểm tin cậy (0–100) dùng làm tín hiệu quyết định.
- **IEC level:** mức độ hiển thị theo trust score.
- **Project:** đơn vị dữ liệu được publish để xuất hiện trong Discover.
- **Data Room:** không gian chia sẻ tài liệu theo 3 tier.
- **Tier:** `public`, `protected`, `confidential`.
- **Matching:** pipeline deal theo trạng thái.
- **Org:** tổ chức nơi user thuộc về; hỗ trợ quản trị và điều kiện trust.

---

## 9) Document Control

- Version: 7.0
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 25/04/2026

# IEC Hub — Business Requirements Document (BRD v7.0)

**Sản phẩm:** IEC Hub — Trust-based B2B Data Infrastructure  
**Phiên bản:** 7.0  
**Cập nhật:** 25/03/2026  

---

## 1) Executive Summary — Nhu cầu tìm “đúng thông tin” để ra quyết định

Trong thực tế hiện nay, cả **cá nhân** và **doanh nghiệp** đều phải bắt đầu từ nhu cầu tìm kiếm thông tin: muốn biết công nghệ/sản phẩm nào phù hợp, ai là bên có năng lực thực sự, và thông tin đó có đủ cơ sở để ra quyết định hay không.

Vấn đề thường không nằm ở “thiếu thông tin”, mà nằm ở **không biết tìm ở đâu là uy tín** và **không có cách đối chiếu** giữa giới thiệu bề mặt với thực trạng vận hành.

Với từng nhóm, bài toán cụ thể khác nhau:

- **Startup:** cần tìm thông tin/đầu mối đúng để tiếp cận đối tác phù hợp theo giai đoạn (beta/scale), đồng thời có đủ dữ liệu để thuyết phục nhà đầu tư.
- **Investor:** cần lọc deal flow và ra quyết định nhanh dựa trên thông tin có thể kiểm chứng, giảm rủi ro “đọc sai hồ sơ”.
- **SME:** cần tìm giải pháp/đối tác phù hợp theo bối cảnh và hạn chế rủi ro “lệch kỳ vọng”.

IEC Hub được xây để giải quyết phần “đáng tin” trong hành trình tìm kiếm đó, bằng việc biến dữ liệu và tiến độ dự án thành **bằng chứng có cấu trúc**, đồng thời triển khai **cơ chế chia sẻ theo tier có phê duyệt** để giảm tranh cãi và tăng tốc hợp tác.

---

## 2) Scope — Phạm vi hệ thống (bám sát chức năng hiện có trên web)

### 2.1. Các nhóm chức năng chính

IEC Hub hiện triển khai các nhóm chức năng chính:

1. **Đăng ký / Đăng nhập** (vai trò: Startup hoặc Investor)
2. **Profile & Settings** (quản lý thông tin cá nhân; trạng thái email/approval được hiển thị)
3. **Dashboard** (tổng quan; hiển thị trust score và IEC level khi user có organization)
4. **Discover** (duyệt các dự án ở trạng thái `published`)
5. **Projects**
   - Startup tạo/cập nhật dự án
   - Startup chuyển trạng thái `draft` <-> `published` và có thể `archived`
   - Xem trang chi tiết dự án
6. **Vault / Data Room**
   - Startup tạo Data Room cho project và phản hồi yêu cầu truy cập
   - Investor xem tài liệu theo quyền và gửi yêu cầu truy cập theo tier
7. **Matching** (quản lý pipeline theo các trạng thái deal)
8. **IEC Verification & Trust Score**
   - Hiển thị trust score/IEC level và trạng thái xác thực của tổ chức
9. **Organization Management** (members và invites)
10. **Admin Dashboard** (metrics & audit logs)
11. **Notifications** (xem thông báo và đánh dấu đã đọc)
12. **Directory** (duyệt community theo vai trò và tín hiệu IEC/trust)
13. **Social Feed** (follow/like cơ bản)
14. **Events** (tùy chọn; chỉ hiển thị khi cấu hình môi trường bật)

### 2.2. Non-goals

- Không cam kết “booking/meeting tự động” phức tạp.
- Không cam kết mô tả chi tiết thuật toán AI/Feed như sản phẩm mạng xã hội.
- Tài liệu tập trung vào trải nghiệm dữ liệu sống, trust score và cơ chế Data Room theo tier.

---

## 3) Personas & Jobs-to-be-done

### 3.1. Startup (chủ dự án)

**Mục tiêu:** biến tiến độ và năng lực thành dữ liệu đủ rõ để thu hút investor đúng thời điểm.

**Jobs-to-be-done:**

- Publish dự án để xuất hiện trong Discover.
- Chuẩn bị Data Room và phản hồi yêu cầu truy cập theo quy tắc tier.
- Theo dõi pipeline matching và cập nhật tiến trình deal.

### 3.2. Investor (người tìm cơ hội)

**Mục tiêu:** giảm thời gian “tìm sai deal” và “đọc sai hồ sơ” bằng quyết định dựa trên dữ liệu có thể kiểm chứng.

**Jobs-to-be-done:**

- Duyệt dự án `published` trong Discover.
- Tạo tín hiệu quan tâm và theo dõi tiến trình qua Matching.
- Yêu cầu truy cập tài liệu trong Data Room theo tier và theo dõi trạng thái phản hồi.

### 3.3. Organization Owner/Admin

**Mục tiêu:** quản trị đúng người, đúng quyền và đảm bảo dữ liệu đến từ đúng đơn vị.

**Jobs-to-be-done:**

- Quản lý members và invites.
- Kiểm soát quyền theo vai trò (owner/admin/member).

### 3.4. IEC / Admin

**Mục tiêu:** vận hành chất lượng hệ thống và đảm bảo tính kỷ luật thông qua audit.

**Jobs-to-be-done:**

- Xem metrics hệ thống.
- Theo dõi audit logs phục vụ điều tra và kiểm soát.

---

## 4) Product Workflows — Luồng giá trị cốt lõi

### 4.1. Định danh & quyền truy cập

Người dùng đăng ký theo vai trò Startup hoặc Investor, sau đó đăng nhập và quản lý thông tin cá nhân trong Profile/Settings.

Khi user thuộc một organization, hệ thống hiển thị trust score/IEC level để làm ngữ cảnh quyết định truy cập (đặc biệt ở tier cao).

**Giá trị:** người dùng hiểu rõ “đang ở vai trò gì” và “có quyền tới đâu”.

### 4.2. Projects: chỉ publish khi sẵn sàng chia sẻ

Startup tạo dự án và chuyển trạng thái:

- `draft`: chưa xuất hiện rộng rãi
- `published`: xuất hiện trong Discover
- `archived`: giảm hiện diện trong hệ thống

**Giá trị:** thị trường nhìn thấy “đúng dự án đang sẵn sàng làm việc”.

### 4.3. Discover: khoanh vùng nhanh, giảm rủi ro đọc sai

Discover hiển thị danh sách project `published`, hỗ trợ tìm kiếm theo tiêu đề/mô tả và lọc theo ngành.

**Giá trị:** người xem khoanh vùng sớm, giảm thời gian đọc hồ sơ thiếu thông tin.

### 4.4. Vault / Data Room: chia sẻ theo tier có phê duyệt

Data Room triển khai cơ chế chia sẻ tài liệu theo 3 tier:

- **Public:** xem theo mặc định
- **Protected:** yêu cầu truy cập kèm mục đích; chủ Data Room phê duyệt; UI có NDA cam kết trước khi gửi yêu cầu truy cập
- **Confidential:** yêu cầu truy cập có phê duyệt; đồng thời có điều kiện liên quan Trust Score của tổ chức

Trong UI Vault:

- Startup tạo Data Room cho project.
- Investor gửi yêu cầu truy cập với `purpose` và `message`.
- Startup phản hồi chấp nhận/từ chối và hệ thống cập nhật trạng thái để nhà đầu tư theo dõi minh bạch.

**Giá trị:** giảm tranh cãi; đi theo quy trình từ yêu cầu → phê duyệt → truy cập theo thời hạn.

### 4.5. Matching: pipeline nhìn thấy được

Matching quản lý pipeline theo các trạng thái deal. Điều này giúp:

- Investor theo dõi tiến trình tương tác.
- Hai bên có bản ghi rõ ràng về trạng thái deal.

**Giá trị:** giảm “mất dấu” giữa các kênh và tăng kỷ luật vận hành.

### 4.6. IEC Verification & Trust Score: trust score dùng để làm gì

IEC Hub hiển thị trust score và IEC level theo trạng thái xác thực của tổ chức.

Trust Score được hình thành từ các nhóm tín hiệu: mức độ đầy đủ thông tin, trạng thái xác thực, tín hiệu xác thực chéo và dấu vết vận hành/audit.

**Giá trị:** trust score trở thành ngôn ngữ chung để định hướng mức độ truy cập (đặc biệt ở tier confidential).

### 4.7. Organization Management

Org page cho phép xem members, mời thành viên và quản lý thay đổi vai trò theo quyền.

**Giá trị:** tin tưởng đi kèm quyền hạn rõ ràng.

### 4.8. Admin, Notifications, Directory & Social (hỗ trợ)

- Admin Dashboard: xem metrics & audit logs.
- Notifications: theo dõi nhắc việc và cập nhật trạng thái.
- Directory: duyệt thành viên theo vai trò và tín hiệu IEC/trust.
- Social Feed: follow/like cơ bản để tăng tín hiệu mạng lưới.

### 4.9. Events (tùy chọn)

Trang Events chỉ là lớp bổ sung khi cấu hình môi trường bật. Luồng cốt lõi vẫn vận hành độc lập.

---

## 5) Business Rules — Luật vận hành cốt lõi

### 5.1. Project visibility

- Chỉ project `published` xuất hiện trong Discover.

### 5.2. Data Room access theo tier

- `public`: xem theo mặc định.
- `protected`: cần yêu cầu truy cập theo tier và có phê duyệt từ chủ Data Room; UI có cam kết NDA trước khi gửi yêu cầu.
- `confidential`: cần phê duyệt; đồng thời có điều kiện liên quan Trust Score.

### 5.3. Trust Score & gating

- Trust Score/IEC level là tín hiệu tin cậy để định hướng mức truy cập ở tier cao.

### 5.4. Role-based authorization

- Startup: tạo/cập nhật project; vận hành Data Room và phản hồi yêu cầu truy cập.
- Investor: duyệt Discover; gửi yêu cầu truy cập Data Room; theo dõi pipeline qua Matching.
- Org owner/admin: quản trị members/invites theo quyền.
- Admin: xem metrics và audit logs.

---

## 6) Success Metrics — Chỉ số thành công

### Phase 1: Xây nền dữ liệu tin cậy

- Số lượng người dùng đăng ký & hoạt động
- Tỷ lệ project được publish (đưa vào Discover)
- Số yêu cầu truy cập Data Room được tạo và được phản hồi
- Trust Score trung bình của các tổ chức đã xác thực

### Phase 2: Tăng chất lượng pipeline

- Tỷ lệ chuyển trạng thái trong Matching
- Tỷ lệ Discover → gửi yêu cầu truy cập Data Room
- Tỷ lệ yêu cầu Protected/Confidential được phê duyệt

### Phase 3: Chuẩn hóa vận hành niềm tin

- Giảm thời gian từ yêu cầu → phê duyệt
- Tăng tỷ lệ deal đi xa hơn trong pipeline nhờ dữ liệu minh bạch
- Tăng độ tin cậy cảm nhận (qua phản hồi người dùng/số tương tác có ý nghĩa)

---

## 7) Risks & Mitigations

1. **Dữ liệu ban đầu thiếu chất lượng**
   - Mitigation: chuẩn hóa template project tối thiểu; hướng dẫn onboarding cho Startup.
2. **Không rõ ràng quyền truy cập**
   - Mitigation: hiển thị rõ trạng thái request/duyệt trong Vault; Admin pages và audit hỗ trợ minh bạch.
3. **Tắc nghẽn ở vòng phê duyệt Data Room**
   - Mitigation: Notifications theo sự kiện; cập nhật trạng thái nhanh; minh bạch lý do khi cần.
4. **Trust Score bị hiểu sai**
   - Mitigation: giải thích trust score dùng để làm gì và tác động tới tier truy cập.

---

## 8) Glossary

- **Trust Score / IEC Trust:** điểm tin cậy (0–100) dùng làm tín hiệu quyết định.
- **IEC level:** mức độ hiển thị theo trust score.
- **Project:** đơn vị dữ liệu được publish để xuất hiện trong Discover.
- **Data Room:** không gian chia sẻ tài liệu theo 3 tier.
- **Tier:** `public`, `protected`, `confidential`.
- **Matching:** pipeline deal theo trạng thái.
- **Org:** tổ chức nơi user thuộc về; hỗ trợ quản trị và điều kiện trust.

---

## 9) Document Control

- Version: 7.0
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 25/04/2026

# IEC Hub — Business Requirements Document (BRD v6.0)

**Sản phẩm:** IEC Hub — Trust-based B2B Data Infrastructure  
**Phiên bản:** 6.0  
**Cập nhật:** 25/03/2026  

---

## 1) Executive Summary — Tìm đúng thông tin để ra quyết định nhanh

Trong thực tế, cả **cá nhân** lẫn **doanh nghiệp** đều bắt đầu hành trình bằng nhu cầu tìm kiếm thông tin: muốn biết công nghệ/sản phẩm nào phù hợp, ai làm được việc, và thông tin đó có đáng tin để ra quyết định hay không.

Vấn đề thường không nằm ở việc “có quá ít thông tin”, mà nằm ở việc **không biết tìm ở đâu là uy tín** và **không có cách đối chiếu** giữa lời giới thiệu với thực trạng vận hành.

Với **Startup**, nhu cầu cốt lõi là tìm đúng nhóm đối tác/khách hàng beta và tạo đủ dữ liệu để thuyết phục nhà đầu tư vào đúng giai đoạn. Với **Investor**, trọng tâm là lọc deal flow và ra quyết định nhanh dựa trên thông tin có thể kiểm chứng. Với **SME**, bài toán là tìm giải pháp/đối tác phù hợp theo bối cảnh cụ thể nhưng vẫn giảm rủi ro “lệch kỳ vọng”.

IEC Hub được thiết kế để giải quyết phần “đáng tin” trong quá trình tìm kiếm đó: hệ thống biến dữ liệu/tiến độ dự án thành **bằng chứng có cấu trúc** và chia sẻ theo **quy tắc truy cập rõ ràng theo tier**, giúp các bên ra quyết định nhanh hơn với ít tranh cãi hơn.

---

## 2) Scope — Phạm vi hệ thống (bám sát chức năng hiện có)

### 2.1. Các chức năng đã có trên web

IEC Hub triển khai các nhóm chức năng chính:

1. **Đăng ký / Đăng nhập** (vai trò: Startup hoặc Investor)
2. **Profile & Settings** (quản lý thông tin cá nhân; trạng thái email/approval được hiển thị)
3. **Dashboard** (tổng quan; hiển thị trust score và IEC level khi user có organization)
4. **Discover** (duyệt các dự án ở trạng thái `published`)
5. **Projects**
   - Startup tạo/cập nhật dự án
   - Startup chuyển trạng thái `draft` <-> `published` và có thể `archived`
   - Xem trang chi tiết dự án
6. **Vault / Data Room** (chia sẻ tài liệu theo 3 tier và theo dõi trạng thái yêu cầu)
   - Startup tạo Data Room cho project và phản hồi yêu cầu truy cập
   - Investor xem tài liệu theo quyền và gửi yêu cầu truy cập theo tier
7. **Matching** (quản lý pipeline theo các trạng thái deal)
8. **IEC Verification & Trust Score**
   - Hiển thị trust score/IEC level và trạng thái xác thực của tổ chức
   - Có màn hình để người dùng gửi yêu cầu xác thực (theo trải nghiệm UI)
9. **Organization Management** (members và invites)
10. **Admin Dashboard** (metrics & audit logs)
11. **Notifications** (xem thông báo và đánh dấu đã đọc)
12. **Directory** (duyệt community theo vai trò và tín hiệu IEC/trust)
13. **Social Feed** (follow/like cơ bản)
14. **Events** (tùy chọn; chỉ hiển thị khi cấu hình môi trường bật)

### 2.2. Non-goals (không đưa vào BRD này)

- Không cam kết “booking/meeting tự động” phức tạp.
- Không cam kết mô tả chi tiết thuật toán feed/AI như một sản phẩm mạng xã hội.
- Tài liệu tập trung vào **trải nghiệm dữ liệu sống, trust score và Data Room theo tier**.

---

## 3) Personas & Jobs-to-be-done

### 3.1. Startup (chủ dự án)

**Mục tiêu:** biến tiến độ và năng lực thành “bằng chứng có thể tin” để thu hút investor đúng thời điểm.

**Jobs-to-be-done:**

- Publish dự án để xuất hiện trong Discover.
- Tạo Data Room và phản hồi yêu cầu truy cập theo quy tắc tier.
- Theo dõi pipeline matching để quản lý deal không bị mất nhịp.

### 3.2. Investor (người tìm cơ hội)

**Mục tiêu:** giảm thời gian “tìm sai deal” và “đọc sai hồ sơ” bằng quyết định dựa trên dữ liệu có cấu trúc.

**Jobs-to-be-done:**

- Duyệt các dự án `published` trong Discover.
- Tạo tín hiệu quan tâm và theo dõi tiến trình qua Matching.
- Gửi yêu cầu truy cập Data Room theo tier và nắm rõ trạng thái phản hồi.

### 3.3. Organization Owner/Admin

**Mục tiêu:** quản trị đội nhóm và quyền truy cập trong tổ chức một cách rõ ràng, giảm rủi ro vận hành.

**Jobs-to-be-done:**

- Quản lý members và invites.
- Kiểm soát quyền theo vai trò (owner/admin/member).

### 3.4. IEC / Admin

**Mục tiêu:** duy trì chất lượng dữ liệu và vận hành kỷ luật (audit) để hệ thống bền vững.

**Jobs-to-be-done:**

- Xem metrics tổng quan.
- Theo dõi audit logs để xử lý sự cố và đảm bảo tuân thủ.

---

## 4) Product Workflows — Luồng giá trị theo giai đoạn

### 4.1. Giai đoạn 1: Định danh và thiết lập quyền

Người dùng đăng ký theo vai trò Startup hoặc Investor, sau đó đăng nhập và quản lý thông tin cá nhân.

Khi user thuộc một organization, hệ thống hiển thị trust score/IEC level để hỗ trợ quyết định truy cập (đặc biệt ở tier cao).

**Giá trị:** bước đầu vào hệ thống với ngữ cảnh rõ ràng: đúng vai trò, đúng tổ chức, đúng quyền.

### 4.2. Giai đoạn 2: Projects — chỉ publish khi sẵn sàng chia sẻ

Startup tạo dự án, cập nhật nội dung và chuyển trạng thái:

- `draft`: chưa xuất hiện rộng rãi
- `published`: xuất hiện trong Discover
- `archived`: giảm hiện diện trong hệ thống

**Giá trị:** thị trường nhìn thấy “đúng thứ đang sẵn sàng” để làm việc tiếp.

### 4.3. Giai đoạn 3: Discover — duyệt nhanh, hiểu đúng bối cảnh

Discover hiển thị danh sách project `published`, hỗ trợ:

- Tìm theo tiêu đề/mô tả
- Lọc theo ngành

**Giá trị:** người xem khoanh vùng sớm, giảm thời gian đọc hồ sơ thiếu thông tin.

### 4.4. Giai đoạn 4: Vault / Data Room — quy trình truy cập rõ ràng

Data Room hoạt động theo 3 tier:

- **Public:** xem theo mặc định
- **Protected:** yêu cầu truy cập kèm mục đích; có cam kết NDA trước khi gửi yêu cầu; chủ Data Room phê duyệt
- **Confidential:** yêu cầu truy cập có phê duyệt; đồng thời có điều kiện liên quan Trust Score của tổ chức

Trong UI Vault:

- Startup tạo Data Room cho project.
- Investor gửi yêu cầu truy cập với `purpose` và `message`.
- Startup phản hồi (chấp nhận/từ chối) và hệ thống cập nhật trạng thái để nhà đầu tư theo dõi minh bạch.

**Giá trị:** niềm tin không dựa vào lời hứa, mà dựa vào quy trình: từ yêu cầu → phê duyệt → truy cập theo thời hạn.

### 4.5. Giai đoạn 5: Matching — quản lý pipeline có kỷ luật

Matching giúp hai bên theo dõi deal theo các trạng thái cố định.

**Giá trị:** giảm “mất dấu” giữa các kênh và tạo lịch sử tương tác phục vụ ra quyết định.

### 4.6. Giai đoạn 6: IEC Verification & Trust Score — trust score dùng để làm gì

IEC Hub hiển thị trust score và IEC level theo trạng thái xác thực của tổ chức.

Trust Score được hình thành từ các nhóm tín hiệu: mức độ đầy đủ thông tin, trạng thái xác thực, dấu hiệu hoạt động/xác thực chéo và vận hành có audit.

**Giá trị:** trust score trở thành “ngôn ngữ chung” để quyết định mức độ truy cập vào Data Room.

### 4.7. Giai đoạn 7: Org Management — niềm tin đi cùng quyền

Org page giúp quản lý members/invites và quyền theo vai trò.

**Giá trị:** giảm rủi ro vận hành nhờ kiểm soát đúng người được làm gì.

### 4.8. Giai đoạn 8: Admin, Notifications, Directory, Social (hỗ trợ)

- Admin Dashboard: metrics & audit logs
- Notifications: nhắc việc và cập nhật trạng thái
- Directory: duyệt community theo vai trò và tín hiệu IEC/trust
- Social Feed: follow/like để tăng tín hiệu mạng lưới

### 4.9. Giai đoạn 9: Events (tùy chọn)

Trang Events hiển thị danh sách sự kiện khi bật cấu hình môi trường. Luồng cốt lõi không phụ thuộc vào Events.

---

## 5) Business Rules — Luật vận hành cốt lõi

### 5.1. Project visibility

- Chỉ project `published` xuất hiện trong Discover.

### 5.2. Data Room access theo tier

- `public`: xem theo mặc định
- `protected`: yêu cầu truy cập kèm mục đích; có cam kết NDA trước khi gửi; chủ Data Room phê duyệt
- `confidential`: yêu cầu truy cập có phê duyệt và điều kiện liên quan Trust Score của tổ chức

### 5.3. Matching pipeline

- Matching phản ánh pipeline theo trạng thái cố định để hai bên theo dõi tiến trình.

### 5.4. Trust Score & gating

- Trust Score/IEC level là tín hiệu tin cậy, được dùng để định hướng mức độ truy cập ở tier cao.

### 5.5. Role-based authorization

- Startup: tạo/cập nhật project; vận hành Data Room và phản hồi yêu cầu truy cập.
- Investor: duyệt Discover; gửi yêu cầu truy cập Data Room; theo dõi pipeline qua Matching.
- Org owner/admin: quản trị members/invites theo quyền.
- Admin: xem metrics và audit logs.

---

## 6) Success Metrics — Chỉ số thành công theo giai đoạn

### Phase 1: Xây nền dữ liệu tin cậy

- Số người dùng đăng ký & hoạt động
- Tỷ lệ project được publish
- Số yêu cầu Data Room được tạo và được phản hồi
- Trust Score trung bình của các tổ chức đã xác thực

### Phase 2: Tăng chất lượng pipeline

- Tỷ lệ chuyển trạng thái trong Matching
- Tỷ lệ Discover → gửi request Data Room
- Tỷ lệ request Protected/Confidential được duyệt

### Phase 3: Chuẩn hóa vận hành niềm tin

- Giảm thời gian phản hồi giữa request và phê duyệt
- Mức độ “đúng ngữ cảnh” trong tương tác (dựa trên tracking trong hệ thống)
- Tăng tỷ lệ deal đi xa hơn trong pipeline nhờ dữ liệu minh bạch

---

## 7) Risks & Mitigations — Rủi ro & cách giảm

1. **Dữ liệu ban đầu thiếu chất lượng**
   - Mitigation: chuẩn hóa template project tối thiểu; hướng dẫn onboarding cho Startup.
2. **Không rõ quyền truy cập**
   - Mitigation: hiển thị trạng thái yêu cầu/phê duyệt rõ ràng trong Vault; audit và admin pages hỗ trợ minh bạch.
3. **Tắc nghẽn ở vòng phê duyệt Data Room**
   - Mitigation: Notifications theo sự kiện; cập nhật trạng thái nhanh.
4. **Trust Score bị hiểu sai**
   - Mitigation: giải thích trust score dùng để làm gì và tác động ra sao tới quyền truy cập.

---

## 8) Glossary — Từ điển thuật ngữ

- **Trust Score / IEC Trust:** điểm tin cậy (0–100) dùng làm tín hiệu quyết định.
- **IEC level:** mức độ hiển thị theo trust score.
- **Project:** đơn vị dữ liệu được publish để xuất hiện trong Discover.
- **Data Room:** không gian chia sẻ tài liệu theo 3 tier.
- **Tier:** `public`, `protected`, `confidential`.
- **Matching:** pipeline deal theo trạng thái.
- **Org:** tổ chức nơi user thuộc về; phục vụ quản trị và điều kiện trust.

---

## 9) Document Control

- Version: 6.0
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 25/04/2026

# IEC Hub — Business Requirements Document (BRD v6.0)

**Sản phẩm:** IEC Hub — Trust-based B2B Data Infrastructure  
**Phiên bản:** 6.0  
**Cập nhật:** 25/03/2026  

---

## 1) Executive Summary — Vì sao doanh nghiệp cần IEC Hub

Trong các giao dịch B2B tại Việt Nam, “điểm nghẽn” không nằm ở thiếu kênh kết nối, mà nằm ở **niềm tin**.

Khi thông tin không đủ rõ ràng, hai bên phải trả chi phí cho due diligence: đọc chậm, hỏi nhiều, xác minh bằng cách thủ công và phụ thuộc nhiều vào quan hệ cá nhân. Kết quả thường gặp là:

- **Bất đối xứng thông tin:** hồ sơ năng lực/đầu mối cung cấp không phản ánh đúng trạng thái vận hành thực tế.
- **Thiếu cơ chế kiểm chứng:** mỗi quyết định dễ trở thành “cảm tính” hoặc “trì hoãn”.
- **Độ trễ trong pipeline:** nhà đầu tư/đối tác phải chủ động săn tìm, khiến cơ hội tốt bị lỡ nhịp.

IEC Hub giải quyết vấn đề đó bằng một cách tiếp cận đơn giản nhưng có kỷ luật: **chuyển niềm tin thành quy trình dữ liệu có cấu trúc và chia sẻ có kiểm soát**.

---

## 2) Scope — Hệ thống hiện có & phạm vi BRD

### 2.1. Những chức năng đã có trên web (bám sát hệ thống)

IEC Hub hiện triển khai các nhóm chức năng chính:

1. **Đăng ký / Đăng nhập** (vai trò: Startup hoặc Investor)
2. **Profile & Settings** (quản lý thông tin cá nhân; xem trạng thái email xác thực/approval)
3. **Dashboard** (tổng quan, hiển thị trust score/IEC level khi user có organization)
4. **Discover** (duyệt các dự án ở trạng thái *published*)
5. **Projects**  
   - Startup tạo/cập nhật dự án
   - Startup chuyển trạng thái `draft` <-> `published` (và có thể `archived`)
   - Xem trang chi tiết dự án
6. **Vault / Data Room** (luồng chia sẻ tài liệu theo 3 tier và trạng thái yêu cầu)
   - Startup tạo Data Room cho project và phản hồi yêu cầu truy cập
   - Investor xem tài liệu theo quyền và gửi yêu cầu truy cập theo tier
7. **Matching** (quản lý pipeline theo trạng thái)
8. **IEC Verification & Trust Score** (hiển thị trust score/IEC level và trạng thái xác thực)
9. **Organization Management** (quản lý members và invites)
10. **Admin Dashboard** (metrics & audit logs)
11. **Notifications** (xem thông báo & đánh dấu đã đọc)
12. **Directory** (duyệt community theo vai trò và tín hiệu trust/IEC)
13. **Social Feed** (follow/like cơ bản để tăng tín hiệu mạng lưới)
14. **Events**: hiển thị danh sách sự kiện nếu cấu hình môi trường bật (không ảnh hưởng luồng cốt lõi)

### 2.2. Non-goals (không đưa vào BRD này)

Để tránh “vẽ lan man”, BRD này chỉ tập trung vào những gì hệ thống đã thể hiện trên web:

- Không cam kết lịch hẹn/booking tự động phức tạp.
- Không cam kết “AI feed” theo nghĩa thuật toán đề xuất nội dung nâng cao như sản phẩm mạng xã hội.
- Không cố gắng mô tả kiến trúc học thuật. Tài liệu tập trung vào **Data Room & cơ chế truy cập theo tier**.

---

## 3) Personas & Jobs-to-be-done

### 3.1. Startup (chủ dự án)

**Mục tiêu:** biến năng lực và tiến độ thành “bằng chứng có thể tin” để thu hút investor đúng thời điểm.

**Job-to-be-done:**

- Publish dự án để xuất hiện trong Discover.
- Chuẩn bị Data Room và phản hồi yêu cầu truy cập theo quy tắc tier.
- Theo dõi pipeline matching và cập nhật tiến trình deal.

### 3.2. Investor (người tìm cơ hội)

**Mục tiêu:** giảm thời gian “tìm sai deal” và “đọc sai hồ sơ” bằng quyết định có dữ liệu rõ ràng.

**Job-to-be-done:**

- Duyệt dự án đã publish trong Discover.
- Tạo tín hiệu quan tâm và quản lý pipeline qua Matching.
- Yêu cầu truy cập tài liệu trong Data Room theo tier, theo dõi trạng thái phản hồi.

### 3.3. Organization Owner/Admin

**Mục tiêu:** quản lý đúng người, đúng quyền trong một tổ chức để giảm rủi ro vận hành.

**Job-to-be-done:**

- Quản lý members và invites.
- Kiểm soát quyền hạn theo vai trò tổ chức.

### 3.4. IEC / Admin

**Mục tiêu:** duy trì chất lượng dữ liệu và mức độ tin cậy của hệ thống.

**Job-to-be-done:**

- Theo dõi metrics hệ thống.
- Kiểm soát audit logs phục vụ điều tra và vận hành kỷ luật.

---

## 4) Product Workflows — Luồng giá trị theo từng giai đoạn

### 4.1. Giai đoạn 1: Tạo nền tảng định danh & quyền truy cập

1. Người dùng đăng ký theo vai trò **Startup** hoặc **Investor**.
2. Người dùng đăng nhập và hoàn thiện thông tin cơ bản trong Profile/Settings.
3. Khi user thuộc một organization, hệ thống hiển thị trust score/IEC level để làm “điểm tựa” cho các quyết định truy cập.

**Giá trị:** người dùng bước vào hệ thống với ngữ cảnh rõ ràng: ai là ai, đang ở vai trò gì, và có quyền tới đâu.

### 4.2. Giai đoạn 2: Project Publication — Dự án chỉ hiển thị khi sẵn sàng tin cậy

- Startup tạo dự án và cập nhật nội dung (tên, tóm tắt/mô tả, ngành, giai đoạn, ảnh đại diện).
- Khi Startup chuyển sang trạng thái `published`, dự án được đưa vào Discover.
- Trạng thái `archived` giúp dự án giảm hiện diện trong hệ thống.

**Giá trị:** giảm nhiễu. Chỉ những dự án “sẵn sàng chia sẻ” mới được đưa ra thị trường.

### 4.3. Giai đoạn 3: Discover — Duyệt dự án theo nhu cầu và ra quyết định nhanh

- Discover hiển thị các dự án theo bộ lọc cơ bản (tìm kiếm theo tiêu đề/mô tả; lọc theo ngành).
- Mỗi dự án đi kèm thông tin nền để người xem hiểu “điều kiện hợp tác” trước khi bấm vào chi tiết.

**Giá trị:** nhà đầu tư/đối tác có thể khoanh vùng sớm và giảm thời gian đọc “hồ sơ thiếu tin”.

### 4.4. Giai đoạn 4: Vault / Data Room — Chia sẻ có kiểm soát, đúng tier, đúng trạng thái

Data Room triển khai cơ chế chia sẻ tài liệu theo 3 tier:

- **Public:** xem được theo mặc định.
- **Protected:** cần yêu cầu truy cập theo tier và có cam kết NDA trước khi gửi yêu cầu; chủ Data Room có quyền phê duyệt.
- **Confidential:** cần chủ Data Room phê duyệt và có điều kiện liên quan đến Trust Score của tổ chức.

Trong UI Vault:

- Startup tạo Data Room cho project.
- Investor gửi yêu cầu truy cập, cung cấp **purpose** và **message** để tăng minh bạch mục đích.
- Chủ Data Room phản hồi yêu cầu và hệ thống cập nhật trạng thái để investor biết rõ kết quả.

**Giá trị:** thay vì tranh cãi “có tin được không”, hai bên đi theo quy trình rõ ràng — từ yêu cầu, phê duyệt đến truy cập theo thời hạn.

### 4.5. Giai đoạn 5: Matching — Pipeline nhìn thấy được, không bị mất vào tin nhắn

Matching thể hiện pipeline qua các trạng thái cố định, giúp:

- Investor theo dõi tiến trình tương tác.
- Hai bên có một “bản ghi” rõ ràng về tình trạng deal.

**Giá trị:** giảm thất lạc giữa các kênh, tăng kỷ luật vận hành cho cả hai phía.

### 4.6. Giai đoạn 6: IEC Verification & Trust Score — Niềm tin có số, không chỉ lời hứa

IEC Hub hiển thị:

- **Trust Score** (0–100)
- **IEC level** (thể hiện theo mức độ dựa trên trust)
- Trạng thái xác thực của tổ chức (pending/verified/rejected)

Trust Score được hình thành từ các nhóm tín hiệu:

- mức độ đầy đủ thông tin profile & minh bạch dữ liệu
- trạng thái xác thực
- dấu hiệu hoạt động/xác thực chéo
- dấu vết vận hành & audit

**Giá trị:** hệ thống có “ngôn ngữ chung” để quyết định truy cập tier confidential và tăng tốc hợp tác.

### 4.7. Giai đoạn 7: Organization Management — Kiểm soát quyền để giảm rủi ro

Org page cho phép:

- xem members
- mời thành viên
- quản lý thay đổi vai trò theo quyền của org owner/admin

**Giá trị:** tin tưởng không chỉ đến từ dữ liệu, mà còn đến từ quản trị đúng người/đúng quyền.

### 4.8. Giai đoạn 8: Admin, Notifications, Directory & Social

- **Admin Dashboard:** xem metrics tổng quan và audit logs.
- **Notifications:** theo dõi các sự kiện liên quan đến yêu cầu truy cập và thay đổi trạng thái.
- **Directory:** duyệt thành viên theo vai trò và tín hiệu IEC/trust.
- **Social Feed:** follow/like để tạo tín hiệu mạng lưới hỗ trợ bối cảnh cho quyết định.

### 4.9. Giai đoạn 9: Events (tùy chọn)

Events chỉ là lớp bổ sung khi cấu hình bật. Luồng cốt lõi (Project → Discover → Data Room → Matching → Trust/IEC) vẫn vận hành độc lập.

---

## 5) Business Rules — Luật vận hành cốt lõi

### 5.1. Registration & Eligibility

- Người dùng đăng ký theo vai trò **Startup** hoặc **Investor**.
- Việc xác thực email tạo cơ chế “approval status” và quyết định trải nghiệm hiển thị phù hợp.

### 5.2. Project visibility

- Chỉ **project `published`** xuất hiện trong Discover.
- Startup chịu trách nhiệm cập nhật nội dung và trạng thái dự án.

### 5.3. Data Room access policy theo tier

- **Public:** xem được theo mặc định.
- **Protected:** truy cập yêu cầu gửi request kèm mục đích; có NDA cam kết trước khi gửi yêu cầu; chủ Data Room phê duyệt.
- **Confidential:** truy cập yêu cầu request + chủ Data Room phê duyệt; đồng thời có điều kiện dựa trên Trust Score của tổ chức.

### 5.4. Matching pipeline

- Matching phản ánh trạng thái deal theo các mốc cố định, giúp tracking xuyên suốt và giảm “mất dấu” giữa các kênh.

### 5.5. IEC Trust & gating

- Trust Score/IEC level được dùng để thể hiện mức độ tin cậy và phục vụ điều kiện truy cập tier confidential.

### 5.6. Role-based authorization

- Startup: tạo/cập nhật project và vận hành Data Room (phản hồi yêu cầu truy cập).
- Investor: duyệt trong Discover, gửi yêu cầu truy cập Data Room và theo dõi pipeline trong Matching.
- Org owner/admin: quản trị members/invites theo quyền.
- Admin: xem metrics và audit logs.

---

## 6) Success Metrics — Chỉ số thành công theo giai đoạn

### Phase 1: Xây nền dữ liệu tin cậy

- Số lượng người dùng đăng ký & hoạt động
- Tỷ lệ project được publish (đưa vào Discover)
- Số request Data Room được tạo và được phản hồi
- Trust Score trung bình của các tổ chức đã xác thực

### Phase 2: Tăng chất lượng pipeline

- Tỷ lệ chuyển trạng thái trong Matching
- Tỷ lệ từ Discover → gửi request Data Room
- Tỷ lệ request Protected/Confidential được duyệt

### Phase 3: Chuẩn hóa vận hành niềm tin

- Giảm thời gian phản hồi giữa request và phê duyệt
- Mức độ “đúng ngữ cảnh” trong các tương tác (theo tracking trong hệ thống)
- Tăng tỷ lệ deal đi được xa hơn trong pipeline dựa trên dữ liệu minh bạch

---

## 7) Risks & Mitigations — Rủi ro & cách giảm

1. **Dữ liệu ban đầu thiếu chất lượng**
   - Mitigation: chuẩn hóa template project tối thiểu, khuyến khích publish đúng thời điểm.
2. **Sự không rõ ràng về quyền truy cập**
   - Mitigation: hiển thị rõ trạng thái request/duyệt; Org management và audit logs hỗ trợ minh bạch.
3. **Tắc nghẽn ở vòng phê duyệt Data Room**
   - Mitigation: Notification theo sự kiện; cập nhật trạng thái nhanh; minh bạch lý do khi cần.
4. **Trust Score bị hiểu sai (kỳ vọng không đúng)**
   - Mitigation: giải thích trust score dùng để làm gì và hiển thị mức độ tác động lên quyền truy cập tier.

---

## 8) Glossary — Từ điển thuật ngữ

- **Trust Score / IEC Trust:** điểm tin cậy (0–100) dùng làm tín hiệu quyết định.
- **IEC level:** mức độ tương ứng theo trust score để hiển thị/định hướng.
- **Project:** đơn vị dữ liệu sống được publish để xuất hiện trong Discover.
- **Data Room:** không gian chia sẻ tài liệu theo 3 tier.
- **Tier:** `public`, `protected`, `confidential`.
- **Matching:** pipeline deal theo trạng thái.
- **Org:** tổ chức nơi user thuộc về, phục vụ quản trị và điều kiện trust.

---

## 9) Document Control

- Version: 6.0
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 25/04/2026

<!--
# IEC HUB — BUSINESS REQUIREMENTS DOCUMENT (BRD v5.0)

**Sản phẩm:** IEC Hub — Trust-based B2B Data Infrastructure  
**Phiên bản:** 5.0  
**Cập nhật:** 25/03/2026  

---

## 1) Executive Summary — Định vị và lời hứa giá trị

### 1.1. Vấn đề cốt lõi của thị trường B2B

Trong nhiều thương vụ B2B tại Việt Nam, hai bên hiếm khi “bắt đầu từ niềm tin”.
Thay vào đó, niềm tin phải được tạo ra bằng thời gian và chi phí của due diligence:

- **Bất đối xứng thông tin:** hồ sơ năng lực, tài liệu và dữ liệu thường không phản ánh đúng “thực trạng vận hành” của doanh nghiệp tại thời điểm giao dịch.
- **Thiếu cơ chế kiểm chứng:** khi không có hệ thống xác thực, mỗi deal phải dựa nhiều vào quan hệ cá nhân hoặc cảm nhận chủ quan.
- **Khó tìm đúng đối tác:** doanh nghiệp phải tự tìm kiếm qua kênh rời rạc, khiến “độ trễ” của pipeline tăng và ROI giảm.

### 1.2. Lời hứa của IEC Hub

IEC Hub không đóng vai trò như một nền tảng sự kiện hay marketplace đơn thuần.
IEC Hub vận hành theo triết lý:

> **Chuyển đổi niềm tin thành luồng làm việc rõ ràng — để doanh nghiệp gặp đúng người, đúng dữ liệu, đúng thời điểm.**

Hệ thống tạo niềm tin thông qua ba trụ cột vận hành:

1. **Project Feed = bằng chứng năng lực sống**: dự án được quản lý như một “bằng chứng” cập nhật được, đủ thông tin để hai bên ra quyết định sớm hơn.
2. **Trust Score (IEC Trust)**: điểm tin cậy được tính từ mức độ đầy đủ thông tin, trạng thái xác thực, hoạt động xác thực chéo và dấu vết kiểm toán.
3. **Data Room (3 tầng) + duyệt truy cập**: chia sẻ tài liệu có kiểm soát, có phê duyệt và có thời hạn, thay vì gửi tài liệu “theo cảm tính”.

### 1.3. Triết lý vận hành

**Tập trung vào hiệu quả trao đổi dữ liệu và ra quyết định** hơn là tăng tương tác bề nổi.
Niềm tin được xây bằng “quy trình rõ ràng”, không phải bằng lời hứa marketing.

---

## 2) Scope — Phạm vi sản phẩm (bám sát hệ thống đang có)

### 2.1. Màn hình/luồng chính được triển khai trên web

IEC Hub hiện hỗ trợ các chức năng cốt lõi sau:

1. **Đăng ký / Đăng nhập**
2. **Trang Profile & Settings**
3. **Dashboard (tổng quan, trust score, dự án nổi bật)**
4. **Discover (duyệt các dự án đã publish)**
5. **Projects (startup tạo/cập nhật/xử lý trạng thái dự án; xem chi tiết & publish/archive)**
6. **Vault / Data Room**
   - Startup: tạo Data Room cho project; duyệt/tuỳ chỉnh trạng thái yêu cầu truy cập từ investor.
   - Investor: xem tài liệu trong Data Room theo 3 tầng; gửi yêu cầu truy cập (có NDA ở tầng Protected).
7. **Matching (pipeline deal theo trạng thái)**
8. **IEC Verification & Trust Score (hiển thị trust score và IEC level, dùng Trust Score làm chỉ dẫn)**
9. **Organization Management (org: members và invites)**
10. **Admin Dashboard (metrics & audit logs)**
11. **Notifications (nhắc việc liên quan đến yêu cầu truy cập, cập nhật pipeline, v.v.)**
12. **Directory (bộ lọc nhà đầu tư/startup, dựa trên IEC level & xác thực)**
13. **Social Feed (follow/like đơn giản để tăng tín hiệu mạng lưới)**
14. **Events (danh sách sự kiện — phụ thuộc cờ cấu hình môi trường; nếu không bật thì hệ thống vẫn hoạt động)**

### 2.2. Non-goals (không đưa vào phiên bản BRD này)

Để tránh “vẽ lan man”, BRD này chỉ mô tả phạm vi đang chạy.
Một số ý tưởng có thể tồn tại trong tài liệu trước đây nhưng **không phải ưu tiên/không được xác lập là đã vận hành** trên hệ thống:

- Không cam kết tạo/scheduling booking 1-1 theo lịch tự động.
- Không cam kết đầy đủ “AI feed algorithm” dạng gợi ý nội dung phức tạp; hệ thống tập trung vào lọc theo tiêu chí dựa trên dữ liệu có sẵn (ví dụ: industry/stage/IEC level, trọng tâm đầu tư).
- Không cam kết kiến trúc “Data Vault 3 tầng” theo đúng thuật ngữ học thuật; ở phiên bản hiện tại trọng tâm là **Data Room & tài liệu theo 3 tier truy cập**.

---

## 3) Personas & Jobs-to-be-done — Ai dùng và họ cần gì

### 3.1. Startup (chủ dự án)

- Mục tiêu: biến năng lực và tiến độ thành **bằng chứng có thể tin được** để thu hút investor đúng thời điểm.
- Công việc cần làm trong IEC Hub:
  1. Tạo project và đưa vào trạng thái `published`.
  2. Chuẩn bị Data Room để chia sẻ có kiểm soát.
  3. Duyệt yêu cầu truy cập từ investor theo 3 tầng.
  4. Theo dõi pipeline matching và cập nhật tiến trình.

### 3.2. Investor (người tìm cơ hội)

- Mục tiêu: giảm thời gian “tìm sai deal” và “đọc sai hồ sơ” bằng cách ra quyết định dựa trên dữ liệu có cấu trúc và có kiểm chứng.
- Công việc cần làm:
  1. Duyệt dự án trong Discover.
  2. Thể hiện quan tâm/ra tín hiệu trong Matching để tạo pipeline.
  3. Yêu cầu truy cập tài liệu trong Data Room theo tier.
  4. Theo dõi trạng thái match cho tới khi quyết định đầu tư/không đầu tư.

### 3.3. Organization Owner/Admin (quản trị org)

- Mục tiêu: quản lý team nội bộ, kiểm soát quyền truy cập và đảm bảo dữ liệu đến từ đúng đơn vị.
- Công việc:
  1. Quản lý members.
  2. Gửi/chỉnh sửa invites.
  3. Duyệt các luồng liên quan đến org theo quyền.

### 3.4. IEC / Admin (quản trị hệ thống)

- Mục tiêu: đảm bảo chất lượng dữ liệu, theo dõi hoạt động và vận hành trust.
- Công việc:
  1. Xem metrics và phân phối trạng thái.
  2. Theo dõi audit logs.

---

## 4) Product Workflows — Luồng giá trị theo từng giai đoạn

### 4.1. Giai đoạn 1: Tạo nền tảng truy cập & niềm tin ban đầu

1. Người dùng đăng ký theo vai trò **Startup** hoặc **Investor**.
2. Người dùng đăng nhập và quản lý thông tin cá nhân trong Profile/Settings.
3. Khi có liên kết với Organization, hệ thống hiển thị Trust Score và IEC level (dùng cho gating truy cập).

**Giá trị mang lại:** hệ thống có thể đối xử “có điều kiện” với hành vi và mức độ dữ liệu mà người dùng được xem.

### 4.2. Giai đoạn 2: Project Feed — “Bằng chứng sống” để ra quyết định sớm

#### UC: Startup tạo và publish Project

- Startup tạo project với các trường: tiêu đề, mô tả/tóm tắt, ngành, giai đoạn, hình ảnh đại diện và thông tin nhu cầu/định hướng.
- Startup có thể xử lý trạng thái:
  - `draft` → `published` (để xuất hiện trong Discover)
  - `published` → `archived` (giảm hiển thị)

#### UC: Discover hiển thị dự án phù hợp

- Discover hiển thị danh sách các project `published`.
- Người dùng có thể lọc theo ngành và tìm kiếm theo tiêu đề/mô tả.

**Giá trị mang lại:** giảm thời gian “đi tìm” và tăng chất lượng vòng đầu của pipeline.

### 4.3. Giai đoạn 3: Data Room — Chia sẻ có kiểm soát, giảm rủi ro giao dịch

#### UC: Investor xem và yêu cầu truy cập tài liệu

Data Room hỗ trợ 3 tier tài liệu:

- `public`: xem được theo mặc định
- `protected`: cần **owner duyệt** và cần **NDA Agreement (tại UI yêu cầu)** trước khi gửi
- `confidential`: cần **owner duyệt** và có thêm điều kiện dựa trên **Trust Score** của tổ chức.

Trong UI Vault:
- Investor có thể gửi yêu cầu truy cập kèm “purpose” và “message”.
- Hệ thống hiển thị trạng thái yêu cầu để minh bạch tiến trình.

#### UC: Startup duyệt yêu cầu truy cập

Startup (chủ Data Room theo project) cập nhật trạng thái yêu cầu:
- chấp nhận hoặc từ chối
- cập nhật để investor biết rõ kết quả và lý do khi cần.

**Giá trị mang lại:** giảm “đặt niềm tin nhầm chỗ”, thay bằng một quy trình phê duyệt minh bạch.

### 4.4. Giai đoạn 4: Matching pipeline — Theo dõi deal bằng trạng thái rõ ràng

Matching thể hiện pipeline bằng các trạng thái cố định (ví dụ: Pending Intro, Intro Done, In Discussion, Meeting Scheduled, Due Diligence, Negotiation, Closed Deal/Lost, Rejected).

Investor quản lý “tín hiệu quan tâm” và tiến triển thông qua trạng thái match.
Mỗi bước được hỗ trợ bằng Notification để giảm độ trễ trao đổi.

**Giá trị mang lại:** một deal không bị “mất tích” giữa các kênh chat/email.

### 4.5. Giai đoạn 5: Trust Score & IEC level — Niềm tin trở thành cơ chế hành động

Trust Score được tính từ các nhóm dữ liệu:

- **Tính đầy đủ profile (Profile completeness)**
- **Trạng thái xác thực (Verification status)**
- **Mức độ xác thực chéo qua vouching (Vouch score)**
- **Dấu vết kiểm toán/hoạt động gần (Audit score)**

Trust Score được dùng:
- hiển thị trên Dashboard/IEC page
- là điều kiện để truy cập tài liệu ở tier `confidential` trong Data Room.

**Giá trị mang lại:** giảm tranh cãi chủ quan bằng tín hiệu thống nhất.

### 4.6. Giai đoạn 6: Network & Community signal (Social) — Tăng tín hiệu, không thay niềm tin

Social Feed hỗ trợ:

- follow người dùng theo vai trò
- like các hoạt động mạng lưới

**Giá trị mang lại:** tăng độ “liên hệ” để hỗ trợ niềm tin (nhưng không thay thế cơ chế trust/gating chính).

### 4.7. Giai đoạn 7: Organization management — Quản trị team đúng quyền

Org page hỗ trợ:
- xem members
- mời thành viên qua invites
- đổi vai trò members theo quyền của chủ org.

**Giá trị mang lại:** trust không chỉ nằm ở dữ liệu, mà còn ở “ai được làm gì” trong tổ chức.

### 4.8. Admin & Audit — Vận hành có kỷ luật

Admin Dashboard cung cấp:
- metrics tổng quan (users, investors, startups, projects, matches, phân phối IEC)
- audit logs phục vụ điều tra và kiểm soát.

**Giá trị mang lại:** giảm rủi ro gian lận và tăng độ bền hệ thống.

### 4.9. Events (tùy chọn)

Trang Events hiển thị danh sách sự kiện theo dữ liệu có sẵn.
Luồng cốt lõi của IEC Hub vẫn hoạt động kể cả khi events không bật.

---

## 5) Business Rules — Luật vận hành (không đi vào kỹ thuật)

### 5.1. Registration & Eligibility

- Người dùng tự đăng ký theo vai trò **Startup/Investor**.
- Hệ thống dùng trạng thái xác thực để điều chỉnh quyền truy cập và trải nghiệm.

### 5.2. Project Publication

- Chỉ project ở trạng thái `published` mới xuất hiện trong Discover.
- Startup chịu trách nhiệm cập nhật thông tin và quản lý trạng thái dự án.

### 5.3. Data Room access policy

- `public`: xem được theo mặc định
- `protected`: yêu cầu NDA Agreement ở UI + owner duyệt
- `confidential`: yêu cầu owner duyệt + điều kiện Trust Score
- Truy cập được quản lý theo trạng thái yêu cầu/duyệt để minh bạch pipeline.

### 5.4. Matching quality & giới hạn

- Matching được thiết kế để tập trung vào “chất lượng tín hiệu” hơn là số lượng tương tác.
- Hệ thống có cơ chế giới hạn theo trọng tâm đầu tư của investor (ví dụ: ưu tiên không cho thể hiện quan tâm đối với một số mức IEC nhất định khi không phù hợp).

---

## 6) Success Metrics — Chỉ số thành công theo giai đoạn

### Phase 1 (Q2/2026): Xây nền dữ liệu tin cậy

- Số user đăng ký hoạt động
- Tỷ lệ project được publish
- Tỷ lệ request Data Room được tạo và phản hồi
- Trust Score trung bình của nhóm đã xác thực

### Phase 2 (Q3/2026): Tăng chất lượng pipeline

- Tỷ lệ chuyển trạng thái trong Matching
- Tỷ lệ viewer → gửi request truy cập tài liệu
- Tỷ lệ request protected/confidential được duyệt

### Phase 3 (Q4/2026): Chuẩn hóa community & vận hành niềm tin

- Tín hiệu mạng lưới (follow/like) gắn với pipeline thật
- Giảm độ trễ phản hồi giữa các bên
- Mở rộng tỷ lệ deal “đi hết pipeline” có dữ liệu minh bạch

---

## 7) Risks & Mitigations — Rủi ro và cách giảm thiểu

1. **Dữ liệu ban đầu thiếu chất lượng (low data seed)**
   - Giảm bằng: seed dữ liệu, onboarding mẫu, tiêu chuẩn project tối thiểu để publish.
2. **Niềm tin bị xói mòn do quản trị quyền chưa rõ**
   - Giảm bằng: org management rõ vai trò + audit logs + admin dashboard.
3. **Tắc nghẽn ở vòng duyệt Data Room**
   - Giảm bằng: Notification, trạng thái yêu cầu minh bạch, KPI phản hồi cho owner.
4. **Trải nghiệm Trust Score không đồng nhất kỳ vọng người dùng**
   - Giảm bằng: truyền thông rõ “Trust Score dùng để làm gì” và hiển thị minh bạch trên Dashboard/IEC page.

---

## 8) Glossary — Từ điển

- **Startup/Investor:** vai trò người dùng trên hệ thống.
- **Project:** đơn vị dữ liệu sống được publish để hiển thị trong Discover.
- **Data Room:** không gian chia sẻ tài liệu theo 3 tier.
- **Tier:** `public`, `protected`, `confidential`.
- **Trust Score (IEC Trust):** điểm tin cậy (0–100) dựa trên dữ liệu xác thực và dấu vết vận hành.
- **Matching:** pipeline deal theo trạng thái.
- **Org:** tổ chức nơi user thuộc về; hỗ trợ quản trị members và invites.

---

## Document Control

- Version: 6.0
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 25/04/2026

<details>
<summary>Phụ lục nội bộ (không dùng để gửi khách hàng)</summary>

# BÀI TOÁN KINH DOANH & ĐẶC TẢ NGHIỆP VỤ (BRD v4.0)

**Dự án:** IEC Hub - Trust-based B2B Data Infrastructure  
**Phiên bản:** 4.0  
**Ngày cập nhật:** 22/03/2026  

---

## 1. EXECUTIVE SUMMARY - TẦM NHÌN HẠ TẦNG TIN CẬY B2B

### 1.1. Vấn đề cốt lõi

Thị trường B2B Việt Nam đang bị kìm hãm bởi **ba đứt gãy nghiêm trọng**:

| Đứt gãy | Biểu hiện | Hậu quả |
|---------|-----------|---------|
| **Bất đối xứng thông tin** | Hồ sơ năng lực PDF "chết", không cập nhật, không xác thực | Mất 3-6 tháng để due diligence một đối tác |
| **Thiếu hụt lòng tin** | Không có cơ chế vouching, dựa vào quan hệ cá nhân | 70% deal B2B chết vì "không tin tưởng" |
| **Tìm kiếm thụ động** | Doanh nghiệp phải tự đi tìm đối tác qua sự kiện rời rạc | ROI thấp, tốn thời gian founder/executive |

### 1.2. Giải pháp: Hạ tầng dữ liệu tin cậy

**IEC Hub** không phải là một nền tảng sự kiện hay marketplace thông thường. Đây là **Trust-based Data Infrastructure** - nơi:

- Hồ sơ năng lực "chết" được biến thành **Thực thể dữ liệu sống** tự cập nhật qua dự án thực tế
- **Thông tin tìm người dùng**, không phải người dùng đi tìm thông tin (như TikTok áp dụng cho B2B)
- **Vốn xã hội (Social Capital)** thay thế cho tiền ảo/credit - doanh nghiệp được thưởng bằng Tiếng thơm

### 1.3. Triết lý vận hành

> **"Bán hàng như không bán hàng"**  
> Tập trung vào việc xây dựng Vốn xã hội và Tiếng thơm cho doanh nghiệp thay vì các chỉ số ảo.

### 1.4. Mục tiêu chiến lược

| Giai đoạn | Mục tiêu | KPI |
|-----------|----------|-----|
| **Phase 1** (Q2/2026) | Xây nền - Định danh & Data Vault | 500+ OA verified, 1000+ Project entries |
| **Phase 2** (Q3/2026) | Bật Feed - AI Matching | 30% match-to-meeting conversion |
| **Phase 3** (Q4/2026) | Mở rộng - Social Capital | Top 50 Business Spotlight stories |

---

## 2. CORE ENTITIES - THỰC THỂ DỮ LIỆU LÕI

### 2.1. User (Người dùng cá nhân)

```
User {
  id: UUID
  email: string              // BẮT BUỘC domain công ty
  email_verified: boolean
  password_hash: string
  full_name: string
  phone: string
  avatar_url: string
  
  // Multi-OA relationship
  oa_memberships: OAMembership[]  // Một user có thể thuộc nhiều OA
  primary_oa_id: UUID             // OA chính đang hoạt động
  
  // Activity tracking
  last_active_at: timestamp
  trust_score: number        // Điểm tin cậy cá nhân (0-100)
  
  created_at: timestamp
  updated_at: timestamp
}
```

**Nguyên tắc thiết kế:**
- User là **con người thật**, không phải tổ chức
- Một người có thể đại diện nhiều tổ chức (như Meta Business Suite)
- Email công ty là **cổng gác đầu tiên** cho tính chính danh

### 2.2. Business OA (Organization Account)

```
BusinessOA {
  id: UUID
  
  // Identity
  legal_name: string           // Tên pháp lý
  brand_name: string           // Tên thương hiệu
  tax_code: string             // Mã số thuế (unique)
  oa_type: OAType              // Startup | Investor | SME | Researcher
  
  // Profile
  logo_url: string
  cover_url: string
  tagline: string              // 1 câu giới thiệu
  description: text            // Mô tả chi tiết
  website: string
  founded_year: number
  employee_count: Range        // 1-10, 11-50, 51-200, 200+
  
  // Location
  headquarters: Address
  operating_regions: string[]  // Vùng hoạt động
  
  // Verification
  verification_status: VerificationStatus  // Pending | Verified | Rejected
  verification_date: timestamp
  verification_documents: Document[]
  
  // Dynamic Profile
  projects: Project[]          // Project Feed
  milestones: Milestone[]      // Cột mốc thực tế
  capabilities: Capability[]   // Năng lực được xác thực
  
  // Trust metrics
  trust_score: number          // Điểm tin cậy tổng (0-100)
  badges: TrustBadge[]         // Huy hiệu đã đạt
  vouches_received: Vouch[]    // Lượt xác thực chéo nhận được
  
  // Data Vault
  data_vault: DataVault        // 3 tầng bảo mật
  
  created_at: timestamp
  updated_at: timestamp
}

enum OAType {
  STARTUP     // Doanh nghiệp khởi nghiệp, tìm beta users & investors
  INVESTOR    // Quỹ đầu tư, tìm deal flow
  SME         // Doanh nghiệp vừa và nhỏ, tìm giải pháp & đối tác
  RESEARCHER  // Tổ chức nghiên cứu, cần data insights
}
```

### 2.3. OA Membership (Quan hệ User-OA)

```
OAMembership {
  id: UUID
  user_id: UUID
  oa_id: UUID
  
  role: OARole                 // Owner | Admin | Member | Viewer
  permissions: Permission[]
  
  joined_at: timestamp
  invited_by: UUID
  status: MembershipStatus     // Active | Pending | Revoked
}

enum OARole {
  OWNER   // Chủ OA, toàn quyền
  ADMIN   // Quản trị viên, quản lý team & content
  MEMBER  // Thành viên, tạo nội dung
  VIEWER  // Chỉ xem, không tạo nội dung
}
```

### 2.4. Project (Dự án - Đơn vị dữ liệu sống)

```
Project {
  id: UUID
  oa_id: UUID                  // OA sở hữu
  
  // Basic info
  title: string
  description: text
  cover_image: string
  
  // Classification
  project_type: ProjectType    // Product | Service | Initiative | Case Study
  industry: Industry[]
  technologies: string[]
  
  // Timeline
  status: ProjectStatus        // Planning | Active | Completed | Paused
  start_date: date
  end_date: date
  
  // Outcomes (Dữ liệu sống)
  milestones: Milestone[]
  metrics: ProjectMetric[]     // Số liệu thực tế
  testimonials: Testimonial[]  // Phản hồi từ đối tác
  
  // Visibility (Tiered)
  visibility: VisibilityTier   // PUBLIC | REQUEST | CONFIDENTIAL
  
  // Engagement
  views: number
  saves: number
  inquiries: number
  
  created_at: timestamp
  updated_at: timestamp
}
```

### 2.5. Data Vault (Kho dữ liệu 3 tầng)

```
DataVault {
  oa_id: UUID
  
  // Tier 1: Public (Thu hút đối tác)
  public_tier: {
    company_overview: text
    public_projects: Project[]
    public_capabilities: Capability[]
    public_milestones: Milestone[]
    social_proof: SocialProof[]    // Badge, vouches, spotlight
  }
  
  // Tier 2: Request Only (Cần phê duyệt)
  protected_tier: {
    detailed_profile: Document
    pricing_overview: Document
    client_list: string[]
    reference_contacts: Contact[]
    access_requests: AccessRequest[]
  }
  
  // Tier 3: Confidential (Bảo mật cao)
  confidential_tier: {
    financial_documents: Document[]
    proprietary_data: Document[]
    strategic_plans: Document[]
    nda_required: boolean
    access_log: AccessLog[]
  }
}

DataAccessRequest {
  id: UUID
  requester_oa_id: UUID
  target_oa_id: UUID
  tier: DataTier               // PROTECTED | CONFIDENTIAL
  
  purpose: string              // Lý do yêu cầu
  status: RequestStatus        // Pending | Approved | Rejected
  
  // For Confidential tier
  nda_signed: boolean
  nda_document: Document
  
  approved_by: UUID
  approved_at: timestamp
  expires_at: timestamp        // Quyền truy cập có thời hạn
  
  created_at: timestamp
}
```

### 2.6. Event (Sự kiện - Công cụ chạm)

```
Event {
  id: UUID
  organizer_oa_id: UUID
  
  // Basic info
  title: string
  description: text
  cover_image: string
  
  // Type & Format
  event_type: EventType        // Workshop | Networking | Pitch | Webinar | KYB
  format: EventFormat          // Online | Offline | Hybrid
  
  // Schedule
  start_time: timestamp
  end_time: timestamp
  timezone: string
  
  // Location
  venue: Venue                 // For offline
  meeting_url: string          // For online
  
  // Capacity
  max_attendees: number
  registration_deadline: timestamp
  
  // Targeting (AI gợi ý)
  target_oa_types: OAType[]
  target_industries: Industry[]
  matching_criteria: MatchCriteria
  
  // Status
  status: EventStatus          // Draft | Published | Ongoing | Completed | Cancelled
  
  // Engagement
  rsvps: RSVP[]
  attendees: Attendance[]
  
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 3. EPIC 1: IDENTITY & OA MANAGEMENT - THE GATEKEEPER

> **Mục tiêu:** Xây dựng hệ thống định danh chính xác, đảm bảo mọi thực thể trên platform đều là doanh nghiệp thật với người đại diện thật.

### 3.1. User Registration & Email Verification

**UC 1.1: Đăng ký với Email Công ty**

| Bước | Actor | Hành động | Kết quả |
|------|-------|-----------|---------|
| 1 | User | Nhập email để đăng ký | Hệ thống validate domain |
| 2 | System | Kiểm tra email domain | CHẶN nếu là consumer email |
| 3 | System | Gửi OTP/Link xác thực | Email verification |
| 4 | User | Xác thực email | Tài khoản được kích hoạt |
| 5 | User | Hoàn tất profile cá nhân | Chuyển sang đăng ký OA |

**Business Rules - Email Domain:**

```
BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'mail.com', 'aol.com', 'icloud.com', 'protonmail.com',
  'yandex.com', 'zoho.com', 'gmx.com', 'live.com'
]

WHITELIST_DOMAINS = [
  // Các domain đặc biệt được cho phép (VD: accelerator, incubator)
  'thinkzone.vn', 'topica.edu.vn', 'fpt.edu.vn'
]

validate_email(email):
  domain = extract_domain(email)
  
  if domain in BLOCKED_DOMAINS:
    return REJECT("Vui lòng sử dụng email công ty")
  
  if domain in WHITELIST_DOMAINS:
    return ACCEPT
  
  // Kiểm tra thêm
  if is_disposable_email(domain):
    return REJECT("Email tạm thời không được chấp nhận")
  
  if not has_mx_record(domain):
    return REJECT("Domain email không hợp lệ")
  
  return ACCEPT
```

### 3.2. Business OA Registration (Multi-tenant)

**UC 1.2: Đăng ký/Tham gia Organization Account**

**Luồng A: Tạo OA mới**

```
User đã verified → Chọn "Tạo tổ chức mới"
                 → Nhập thông tin cơ bản (Tên, MST, Loại)
                 → Upload tài liệu xác thực
                 → OA ở trạng thái PENDING
                 → Admin review & approve
                 → OA VERIFIED
```

**Luồng B: Được mời vào OA**

```
Owner/Admin OA → Gửi lời mời (email)
User nhận mail → Click link tham gia
             → Xác nhận vai trò được gán
             → Trở thành member của OA
```

**Luồng C: Yêu cầu tham gia OA**

```
User → Tìm kiếm OA theo MST/Tên
    → Gửi yêu cầu tham gia
    → OA Admin duyệt yêu cầu
    → User trở thành member
```

**Ma trận quyền hạn OA:**

| Quyền | Owner | Admin | Member | Viewer |
|-------|-------|-------|--------|--------|
| Xóa OA | ✓ | ✗ | ✗ | ✗ |
| Mời/Xóa member | ✓ | ✓ | ✗ | ✗ |
| Chỉnh sửa profile OA | ✓ | ✓ | ✗ | ✗ |
| Tạo/Sửa Project | ✓ | ✓ | ✓ | ✗ |
| Duyệt Data Access Request | ✓ | ✓ | ✗ | ✗ |
| Tạo Event | ✓ | ✓ | ✓ | ✗ |
| Xem Dashboard | ✓ | ✓ | ✓ | ✓ |

### 3.3. OA Profile Types - Nghiệp vụ theo vai trò

**Startup Profile:**

```
StartupProfile extends BaseOAProfile {
  // Thông tin đặc thù
  stage: StartupStage          // Idea | MVP | Growth | Scale
  funding_status: FundingStatus // Bootstrapped | Pre-seed | Seed | Series A+
  funding_raised: MoneyRange    // Đã gọi vốn
  funding_seeking: MoneyRange   // Đang tìm
  
  // Sản phẩm
  product_description: text
  target_customers: string[]
  value_proposition: string
  
  // Nhu cầu
  seeking: SeekingType[]       // Investment | Customer | Partner | Mentor
  
  // Traction (Sức kéo)
  mrr: MoneyRange              // Monthly Recurring Revenue
  customer_count: Range
  growth_rate: percentage
}

enum StartupStage {
  IDEA        // Chỉ có ý tưởng
  MVP         // Đã có sản phẩm khả dụng tối thiểu
  GROWTH      // Đang tăng trưởng
  SCALE       // Mở rộng quy mô
}
```

**Investor Profile:**

```
InvestorProfile extends BaseOAProfile {
  // Loại quỹ
  investor_type: InvestorType  // VC | Angel | CVC | PE | Family Office
  
  // Năng lực đầu tư
  fund_size: MoneyRange        // Quy mô quỹ
  ticket_size: MoneyRange      // Ticket trung bình
  portfolio_count: number      // Số công ty đã đầu tư
  
  // Tiêu chí đầu tư
  investment_thesis: text      // Triết lý đầu tư
  target_stages: StartupStage[]
  target_industries: Industry[]
  target_regions: string[]
  
  // Track record
  notable_investments: Investment[]
  exits: Exit[]
  
  // Active status
  actively_investing: boolean
  next_fund_timeline: string
}
```

**SME Profile:**

```
SMEProfile extends BaseOAProfile {
  // Quy mô
  revenue_range: MoneyRange
  employee_count: Range
  years_in_business: number
  
  // Năng lực
  core_services: Service[]
  certifications: Certification[]
  notable_clients: string[]
  
  // Nhu cầu
  seeking: SMESeekingType[]    // DigitalTransformation | NewMarket | Partner | Supplier
  
  // Ngân sách cho giải pháp mới
  annual_tech_budget: MoneyRange
  decision_timeline: string    // Immediate | Quarter | Year
}
```

**Researcher Profile:**

```
ResearcherProfile extends BaseOAProfile {
  // Loại tổ chức
  org_type: ResearchOrgType    // University | Institute | Consulting | Independent
  
  // Lĩnh vực nghiên cứu
  research_areas: string[]
  publications: Publication[]
  
  // Nhu cầu data
  data_interests: DataInterest[]
  research_purpose: string
  
  // Credentials
  accreditations: string[]
  ethical_clearance: boolean
}
```

### 3.4. Dynamic Profile - Hồ sơ năng lực sống

**Nguyên tắc: "Show, don't tell"**

Thay vì chỉ khai báo năng lực, OA phải CHỨNG MINH qua:

1. **Project Feed:** Dòng thời gian các dự án đã/đang thực hiện
2. **Milestones:** Các cột mốc quan trọng được cập nhật
3. **Testimonials:** Phản hồi từ đối tác (có xác thực)
4. **Vouches:** Xác thực chéo từ OA khác trên nền tảng

```
DynamicProfileScore {
  oa_id: UUID
  
  // Độ hoàn thiện profile (0-100)
  completeness_score: number
  
  // Components
  basic_info_complete: boolean      // +20 điểm
  has_verified_documents: boolean   // +20 điểm
  has_active_projects: boolean      // +15 điểm
  has_milestones: boolean           // +15 điểm
  has_testimonials: boolean         // +15 điểm
  has_vouches: boolean              // +15 điểm
  
  // Activity freshness
  last_project_update: timestamp
  profile_freshness: FreshnessLevel // Fresh | Stale | Outdated
  
  // Calculation
  calculated_at: timestamp
}
```

---

## 4. EPIC 2: DYNAMIC PROJECT FEED & AI MATCHING - THE HEART

> **Mục tiêu:** "Thông tin tìm người dùng" - Biến IEC Hub thành bảng tin thông minh để đối tác phù hợp tự tìm thấy nhau.

### 4.1. Project Feed - Dòng năng lực

**UC 2.1: Tạo và quản lý Project**

```
CreateProject {
  // Thông tin cơ bản
  title: string               // "Triển khai ERP cho chuỗi F&B"
  description: text           // Chi tiết dự án
  
  // Phân loại
  project_type: ProjectType
  industry: Industry[]
  technologies: string[]
  
  // Timeline
  status: ProjectStatus
  start_date: date
  end_date: date              // Có thể để trống nếu đang chạy
  
  // Visibility
  visibility: VisibilityTier  // Mặc định PUBLIC
  
  // Rich content
  cover_image: Image
  gallery: Image[]
  attachments: Document[]     // Theo visibility tier
}
```

**Project Types:**

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| PRODUCT | Phát triển sản phẩm mới | "Ra mắt ứng dụng mobile banking" |
| SERVICE | Cung cấp dịch vụ cho khách hàng | "Triển khai ERP cho VinGroup" |
| INITIATIVE | Chương trình/Sáng kiến nội bộ | "Chuyển đổi số quy trình HR" |
| CASE_STUDY | Nghiên cứu trường hợp đã hoàn thành | "Tăng 300% traffic cho thương hiệu X" |
| SEEKING | Đang tìm đối tác/giải pháp | "Tìm partner triển khai AI chatbot" |

### 4.2. AI-Driven Feed Algorithm

**Nguyên tắc: B2B TikTok**

Feed được cá nhân hóa dựa trên:

```
FeedAlgorithm {
  // Input signals
  oa_profile: OAProfile        // Loại OA, ngành nghề, quy mô
  behavior_history: Behavior[] // Xem, lưu, liên hệ
  explicit_interests: string[] // User tự khai báo
  connection_graph: Graph      // Mạng lưới kết nối
  
  // Scoring factors
  relevance_score: number      // Độ phù hợp nội dung
  freshness_score: number      // Độ mới
  trust_score: number          // Điểm tin cậy của OA đăng
  engagement_score: number     // Độ tương tác chung
  
  // Output
  ranked_feed: Project[]       // Danh sách project đã xếp hạng
}
```

**Matching Logic theo OA Type:**

| OA Type | Ưu tiên hiển thị | Lý do |
|---------|------------------|-------|
| **Startup** | SME có nhu cầu giải pháp, Investor đang tìm deal | Tìm customer & funding |
| **Investor** | Startup có traction mới, Project update | Theo dõi portfolio & deal flow |
| **SME** | Startup có giải pháp phù hợp, Case study thành công | Tìm vendor đáng tin |
| **Researcher** | Trend projects, Industry insights | Thu thập data |

### 4.3. Matching Engine

**UC 2.2: Smart Match Suggestions**

```
MatchSuggestion {
  source_oa: OA
  target_oa: OA
  
  // Match quality
  match_score: number          // 0-100
  match_reasons: MatchReason[] // Tại sao match
  
  // Match type
  match_type: MatchType        // Customer | Investor | Partner | Supplier
  
  // Actions available
  can_view_public: boolean     // Luôn true
  can_request_access: boolean  // Truy cập Tier 2
  can_book_meeting: boolean    // Nếu cả hai verified
  
  // Status
  status: MatchStatus          // New | Viewed | Saved | Connected | Dismissed
  
  created_at: timestamp
  expires_at: timestamp        // Match có thời hạn, tạo urgency
}

MatchReason {
  type: ReasonType             // Industry | Technology | Seeking | Geography
  description: string          // "Cùng ngành Fintech"
  weight: number               // Độ quan trọng
}
```

**Match Scoring Rubric:**

| Factor | Weight | Description |
|--------|--------|-------------|
| Industry overlap | 25% | Cùng ngành/ngành bổ trợ |
| Need-capability match | 30% | Seeking vs Offering |
| Geography | 10% | Cùng vùng hoạt động |
| Trust score | 15% | Điểm tin cậy của target |
| Stage compatibility | 10% | Phù hợp về quy mô/giai đoạn |
| Network proximity | 10% | Kết nối chung (2nd degree) |

### 4.4. Interaction Tracking

```
Interaction {
  id: UUID
  actor_oa_id: UUID
  target_oa_id: UUID
  target_entity: EntityType    // Project | OAProfile | Event
  target_id: UUID
  
  action: InteractionType      // View | Save | Share | Inquire | Book
  
  // Context
  source: InteractionSource    // Feed | Search | Suggestion | Event
  session_id: UUID
  
  created_at: timestamp
}

// Aggregated for ML training
InteractionStats {
  oa_id: UUID
  
  // Engagement metrics
  total_profile_views: number
  total_project_views: number
  total_saves: number
  total_inquiries: number
  total_meetings_booked: number
  
  // Conversion funnel
  view_to_save_rate: percentage
  view_to_inquiry_rate: percentage
  inquiry_to_meeting_rate: percentage
  
  period: DateRange
}
```

---

## 5. EPIC 3: TIERED DATA EXCHANGE & SECURITY - THE TRUST

> **Mục tiêu:** Xây dựng cơ chế chia sẻ dữ liệu an toàn theo 3 tầng bảo mật, tạo lòng tin trong giao dịch B2B.

### 5.1. Three-Tier Data Vault Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TẦNG 1: PUBLIC                          │
│                    (Thu hút đối tác)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Company overview          • Public projects        │   │
│  │ • Industry & capabilities   • Trust badges           │   │
│  │ • Basic contact info        • Social proof           │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│                   Ai cũng xem được                           │
├─────────────────────────────────────────────────────────────┤
│                   TẦNG 2: REQUEST ONLY                      │
│                    (Cần phê duyệt)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Detailed profile          • Reference contacts     │   │
│  │ • Pricing overview          • Client list            │   │
│  │ • Case study details        • Technical specs        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│         Gửi yêu cầu → OA Admin duyệt → Được quyền xem       │
├─────────────────────────────────────────────────────────────┤
│                  TẦNG 3: CONFIDENTIAL                       │
│                    (Bảo mật cao)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Financial documents       • Proprietary data       │   │
│  │ • Strategic plans           • Detailed metrics       │   │
│  │ • Cap table (Startup)       • Fund performance (VC)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│     Ký NDA trên platform → OA Admin duyệt → Audit log       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Data Access Request Flow

**UC 3.1: Yêu cầu truy cập Tier 2 (Protected)**

```
Requester OA → Xem profile PUBLIC
            → Muốn xem thêm → Click "Yêu cầu truy cập"
            → Nhập lý do (bắt buộc)
            → Gửi request

Target OA Admin → Nhận notification
               → Review requester profile & lý do
               → Approve / Reject (kèm lý do)

If Approved:
  → Requester được xem Tier 2 trong 30 ngày
  → Có thể gia hạn hoặc revoke
```

**UC 3.2: Yêu cầu truy cập Tier 3 (Confidential)**

```
Requester OA → Đã có quyền Tier 2
            → Click "Yêu cầu tài liệu mật"
            → Hiển thị NDA template
            → Ký NDA điện tử (E-signature)
            → Gửi request

Target OA Admin → Nhận notification
               → Review NDA đã ký
               → Phê duyệt với điều kiện (thời hạn, phạm vi)

If Approved:
  → Requester được xem documents cụ thể
  → Mọi truy cập được log
  → Tự động revoke sau thời hạn
```

### 5.3. Data Access Control Model

```
DataAccessPermission {
  id: UUID
  requester_oa_id: UUID
  target_oa_id: UUID
  
  // Scope
  tier: DataTier               // PROTECTED | CONFIDENTIAL
  specific_documents: UUID[]   // Null = toàn bộ tier
  
  // Approval
  status: PermissionStatus     // Pending | Active | Expired | Revoked
  approved_by: UUID
  approved_at: timestamp
  
  // Validity
  valid_from: timestamp
  valid_until: timestamp       // Bắt buộc có thời hạn
  
  // Conditions
  nda_required: boolean
  nda_signed_at: timestamp
  nda_document_id: UUID
  
  // Usage tracking
  access_count: number
  last_accessed: timestamp
}

DataAccessLog {
  id: UUID
  permission_id: UUID
  accessor_user_id: UUID
  accessor_oa_id: UUID
  
  // What was accessed
  document_id: UUID
  document_type: string
  
  // When & How
  accessed_at: timestamp
  access_method: AccessMethod  // View | Download | Share
  ip_address: string
  user_agent: string
  
  // Audit
  is_flagged: boolean          // Nếu có hành vi bất thường
}
```

### 5.4. Security Rules & Constraints

**Rule S1: Principle of Least Privilege**
```
- Mặc định: Chỉ xem được PUBLIC
- Mỗi tier phải request riêng
- Không có "truy cập vĩnh viễn"
```

**Rule S2: Audit Trail**
```
- Mọi truy cập Tier 2/3 đều được log
- Log không thể xóa hoặc sửa
- OA có thể xem ai đã truy cập data của mình
```

**Rule S3: Time-bound Access**
```
- Tier 2: Mặc định 30 ngày, tối đa 90 ngày
- Tier 3: Mặc định 14 ngày, tối đa 30 ngày
- Phải renew để tiếp tục truy cập
```

**Rule S4: Revocation Rights**
```
- OA có quyền revoke access bất cứ lúc nào
- Không cần lý do
- Hiệu lực ngay lập tức
```

**Rule S5: Confidential Tier Requirements**
```
- Bắt buộc verified OA
- Bắt buộc ký NDA trên platform
- Bắt buộc Trust score >= 60
- Limit số lượng request/tháng
```

---

## 6. EPIC 4: EVENT FACILITATION & CALENDAR BOOKING - THE ACTION

> **Mục tiêu:** Event và Booking là công cụ "chạm" để thực thi kết nối sau khi hệ thống đã gợi ý đối tác phù hợp.

### 6.1. Triết lý: Event là điểm chạm, không phải mục đích

```
Traditional Flow:
  Tìm sự kiện → Tham gia → Hy vọng gặp đúng người → Thất bại 70%

IEC Hub Flow:
  Feed gợi ý OA phù hợp → Xem profile & project → Đã tin tưởng
  → Book meeting hoặc Gặp tại Event → Thành công 70%+
```

### 6.2. Event Types & Purpose

| Event Type | Mục đích | Ai tổ chức | Frequency |
|------------|----------|------------|-----------|
| **KYB Workshop** | Xác thực doanh nghiệp, networking | IEC Admin | 2x/tháng |
| **Industry Meetup** | Kết nối theo ngành | OA hoặc IEC | 4x/tháng |
| **Pitch Session** | Startup trình bày, Investor nghe | IEC + Partner | 1x/tháng |
| **Knowledge Share** | Thought leadership, expertise sharing | Verified OA | On-demand |
| **Deal Flow Review** | Investor-only, xem xét deal | Investor OA | On-demand |

### 6.3. Event Creation & Management

**UC 4.1: Tạo Event**

```
CreateEventRequest {
  // Organizer
  organizer_oa_id: UUID        // OA đứng tên
  co_organizers: UUID[]        // OA đồng tổ chức
  
  // Basic info
  title: string
  description: text
  cover_image: string
  
  // Type & Format
  event_type: EventType
  format: EventFormat
  
  // Schedule
  start_time: timestamp
  end_time: timestamp
  timezone: string
  
  // Location
  venue: Venue | null          // Offline/Hybrid
  meeting_url: string | null   // Online/Hybrid
  
  // Capacity & Registration
  max_attendees: number
  registration_deadline: timestamp
  requires_approval: boolean   // Duyệt người tham gia
  
  // Targeting (AI sẽ suggest attendees)
  target_oa_types: OAType[]
  target_industries: Industry[]
  target_min_trust_score: number
  
  // Visibility
  visibility: EventVisibility  // Public | InviteOnly | OATypeRestricted
}
```

### 6.4. Smart Event Matching

**UC 4.2: Gợi ý Event cho OA**

```
EventRecommendation {
  event_id: UUID
  target_oa_id: UUID
  
  // Why recommend
  relevance_score: number
  reasons: [
    "Phù hợp với ngành Fintech của bạn",
    "Có 3 OA bạn đã quan tâm sẽ tham gia",
    "Chủ đề liên quan đến dự án 'AI Implementation'"
  ]
  
  // Social proof
  matched_attendees: OA[]      // OA phù hợp sẽ tham gia
  mutual_connections: OA[]     // Kết nối chung
  
  // Urgency
  spots_remaining: number
  registration_closes_in: Duration
}
```

**UC 4.3: Gợi ý Attendee cho Organizer**

```
AttendeeRecommendation {
  event_id: UUID
  recommended_oa_id: UUID
  
  // Why recommend
  fit_score: number
  reasons: [
    "Đang tìm giải pháp ERP",
    "Trust score 85, rất uy tín",
    "Đã tương tác với 2 speaker trước đó"
  ]
  
  // Action
  can_invite: boolean
  invite_message_template: string
}
```

### 6.5. Calendar Booking System

**UC 4.4: Book Meeting 1-1**

```
BookingRequest {
  requester_oa_id: UUID
  target_oa_id: UUID
  
  // Context
  purpose: MeetingPurpose      // Explore | FollowUp | Demo | NDA Discussion
  message: string              // Lời nhắn kèm theo
  reference_entity: {          // Liên quan đến gì
    type: EntityType           // Project | Event | Match
    id: UUID
  }
  
  // Proposed slots
  proposed_times: TimeSlot[]   // Tối đa 3 slot đề xuất
  meeting_duration: Duration   // 15 | 30 | 45 | 60 phút
  format: MeetingFormat        // Online | Offline | Phone
}

BookingResponse {
  booking_id: UUID
  status: BookingStatus        // Pending | Confirmed | Declined | Rescheduled
  
  // If confirmed
  confirmed_time: TimeSlot
  meeting_link: string         // Auto-generate Google Meet/Zoom
  calendar_event_id: string    // Sync to Google Calendar
  
  // If declined/rescheduled
  decline_reason: string
  alternative_times: TimeSlot[]
}
```

### 6.6. Meeting Facilitation

**Trước meeting:**
- Gửi reminder 24h và 1h trước
- Cung cấp "Meeting Brief" với thông tin OA đối tác
- Suggest talking points dựa trên match reasons

**Sau meeting:**
- Request feedback từ cả 2 bên
- Suggest next steps (Request Tier 2 access, Invite to Event, etc.)
- Update match status

```
MeetingOutcome {
  booking_id: UUID
  
  // Did it happen?
  actual_status: OutcomeStatus // Completed | NoShow | Rescheduled
  
  // Feedback from both parties (private)
  requester_feedback: Feedback
  target_feedback: Feedback
  
  // Next steps tracked
  follow_up_actions: Action[]
  next_meeting_scheduled: boolean
  relationship_status: RelationshipStatus // Exploring | Negotiating | Partnered | Declined
}

Feedback {
  rating: number               // 1-5
  was_valuable: boolean
  would_meet_again: boolean
  notes: string                // Private notes
}
```

---

## 7. EPIC 5: REPUTATION & SOCIAL CAPITAL GAMIFICATION - THE SOUL

> **Mục tiêu:** Xây dựng hệ thống vinh danh dựa trên "Tiếng thơm" thực tế, KHÔNG sử dụng credit hay tiền ảo.

### 7.1. Triết lý: Social Capital thay vì Virtual Currency

| Cách tiếp cận cũ | Cách tiếp cận IEC Hub |
|------------------|----------------------|
| Credit để mở khóa tính năng | Tính năng mở theo Trust Score |
| Token thưởng cho hoạt động | Badge và Spotlight cho thành tích thực |
| Leaderboard theo điểm số | Vinh danh theo câu chuyện thực |
| Mua bán credit | Vouching và xác thực chéo |

### 7.2. Trust Score System

```
TrustScore {
  oa_id: UUID
  
  // Overall score (0-100)
  total_score: number
  level: TrustLevel            // Newcomer | Verified | Trusted | Elite
  
  // Component scores
  identity_score: number       // 0-25: Xác thực danh tính
  transparency_score: number   // 0-25: Độ minh bạch thông tin
  execution_score: number      // 0-25: Năng lực thực thi (từ project outcomes)
  community_score: number      // 0-25: Đóng góp cộng đồng
  
  // History
  score_history: ScoreSnapshot[]
  last_calculated: timestamp
}

TrustLevel {
  NEWCOMER (0-24)   // Mới tham gia, chưa xác thực
  VERIFIED (25-49)  // Đã xác thực danh tính
  TRUSTED (50-74)   // Có track record tốt
  ELITE (75-100)    // Top performers, thought leaders
}
```

**Trust Score Calculation:**

| Component | Max Points | Tiêu chí |
|-----------|------------|----------|
| **Identity (25)** | | |
| - Email công ty verified | 5 | Có |
| - OA verification completed | 10 | Có |
| - Tax code validated | 5 | Có |
| - 2FA enabled | 5 | Có |
| **Transparency (25)** | | |
| - Profile completeness | 10 | >= 80% |
| - Active projects | 5 | >= 2 |
| - Recent updates | 5 | < 30 ngày |
| - Tier 2 data available | 5 | Có |
| **Execution (25)** | | |
| - Project completion rate | 10 | >= 80% |
| - Positive meeting feedback | 8 | >= 4.0/5.0 |
| - Testimonials received | 7 | >= 3 |
| **Community (25)** | | |
| - Vouches received | 10 | >= 3 OA |
| - Events hosted/attended | 5 | >= 5 |
| - Knowledge shared | 5 | >= 2 posts |
| - Helpful interactions | 5 | Subjective scoring |

### 7.3. Trust Badges System

```
TrustBadge {
  id: UUID
  name: string
  description: string
  category: BadgeCategory
  tier: BadgeTier              // Bronze | Silver | Gold | Platinum
  icon: string
  requirements: Requirement[]
}

BadgeCategory {
  IDENTITY       // Xác thực danh tính
  TRANSPARENCY   // Minh bạch thông tin
  EXECUTION      // Năng lực thực thi
  COMMUNITY      // Đóng góp cộng đồng
  SPECIAL        // Đặc biệt (thủ công cấp)
}
```

**Badge Catalog:**

| Badge | Category | Tier | Requirements |
|-------|----------|------|--------------|
| **Verified Entity** | Identity | Silver | Complete KYB verification |
| **Tax Validated** | Identity | Silver | MST được xác thực từ API |
| **Open Book** | Transparency | Gold | Tier 2 data available, 90%+ profile |
| **Project Driven** | Transparency | Silver | 5+ active projects |
| **Deal Closer** | Execution | Gold | 10+ successful meetings → partnership |
| **Client Magnet** | Execution | Platinum | 5+ testimonials 5 sao |
| **Community Builder** | Community | Gold | Host 3+ events với 50+ attendees |
| **Thought Leader** | Community | Platinum | 1000+ content views |
| **Vouched 10x** | Community | Gold | Received vouches from 10+ verified OAs |
| **Early Adopter** | Special | Bronze | Tham gia trong Phase 1 |
| **IEC Partner** | Special | Platinum | Đối tác chính thức của IEC |

### 7.4. Vouching System (Xác thực chéo)

```
Vouch {
  id: UUID
  voucher_oa_id: UUID          // Người vouch
  vouchee_oa_id: UUID          // Người được vouch
  
  // Context
  relationship: VouchRelationship // Client | Partner | Investor | Colleague
  relationship_duration: Duration
  
  // Vouch content
  vouch_type: VouchType        // Capability | Character | Both
  capabilities_vouched: string[] // "Chuyên môn AI", "Đúng deadline"
  testimonial: string          // Lời nhận xét
  
  // Verification
  is_mutual: boolean           // Vouch 2 chiều
  verified_via: VerificationMethod // ProjectCollaboration | EventMeeting | External
  
  // Validity
  created_at: timestamp
  expires_at: timestamp        // Vouch có thời hạn (1 năm)
  is_active: boolean
}

VouchRequirements {
  // Voucher phải đủ điều kiện
  voucher_min_trust_score: 50
  voucher_must_be_verified: true
  
  // Không tự vouch
  cannot_vouch_self: true
  cannot_vouch_same_ownership: true  // Cùng owner
  
  // Limit
  max_vouches_per_oa: 5        // Mỗi OA chỉ vouch tối đa 5 OA khác/tháng
  min_interaction_before_vouch: 1  // Phải có ít nhất 1 interaction
}
```

### 7.5. Business Spotlight (Vinh danh)

```
BusinessSpotlight {
  id: UUID
  oa_id: UUID
  
  // Spotlight type
  type: SpotlightType          // WeeklyFeature | SuccessStory | ThoughtLeader
  
  // Content
  title: string                // "Cách ABC Corp tăng 300% khách hàng"
  story: text                  // Case study, interview
  media: Media[]               // Images, video
  
  // Display
  featured_on: FeaturedLocation[] // Homepage | Feed | Newsletter
  feature_start: timestamp
  feature_end: timestamp
  
  // Engagement
  views: number
  reactions: number
  shares: number
  
  // Selection
  selected_by: UUID            // Admin hoặc Algorithm
  selection_reason: string     // "Tăng trưởng ấn tượng", "Community impact"
}

SpotlightCriteria {
  // Weekly Feature
  weekly: {
    min_trust_score: 70
    min_profile_completeness: 90
    recent_milestone: true
    no_spotlight_in_30_days: true
  }
  
  // Success Story
  success_story: {
    partnership_formed_via_platform: true
    both_parties_consent: true
    measurable_outcomes: true
  }
  
  // Thought Leader
  thought_leader: {
    hosted_events: >= 3
    attendee_satisfaction: >= 4.5
    content_views: >= 500
  }
}
```

### 7.6. Privileges by Trust Level

| Feature | Newcomer | Verified | Trusted | Elite |
|---------|----------|----------|---------|-------|
| View public feed | ✓ | ✓ | ✓ | ✓ |
| Request Tier 2 access | ✗ | ✓ | ✓ | ✓ |
| Request Tier 3 access | ✗ | ✗ | ✓ | ✓ |
| Book meetings | Limited | ✓ | ✓ | ✓ |
| Create events | ✗ | Small | Full | Full |
| Vouch for others | ✗ | ✗ | ✓ | ✓ |
| Priority in feed | ✗ | ✗ | ✓ | ✓✓ |
| Host KYB Workshop | ✗ | ✗ | ✗ | ✓ |
| Spotlight eligible | ✗ | ✗ | ✓ | ✓ |
| API access | ✗ | ✗ | Limited | Full |

---

## 8. TARGET PERSONA DEEP DIVE - NHU CẦU THỰC TẾ

### 8.1. Startup Persona

**Profile:**
- Stage: MVP → Growth
- Team: 3-20 người
- Funding: Pre-seed → Series A

**Nỗi đau:**
| Pain Point | Biểu hiện | IEC Hub giải quyết |
|------------|-----------|-------------------|
| Tìm Beta Users | Cold outreach hiệu quả thấp | Feed matching với SME có nhu cầu |
| Chứng minh năng lực | Chỉ có pitch deck, chưa có track record | Dynamic Profile với milestones |
| Tiếp cận Investor | Không có introduction | AI match + Event facilitation |
| Credibility | Không ai biết đến | Trust score + Vouching từ customers |

**User Journey:**
```
Đăng ký → Setup Startup Profile → Đăng Project (sản phẩm)
       → Feed hiển thị SME phù hợp → View profile, Request Tier 2
       → Book demo meeting → Convert thành customer
       → Nhận vouch & testimonial → Trust score tăng
       → Được Investor notice qua feed → Book meeting
       → Pitching với data thực từ profile → Deal closing
```

**Key Features sử dụng:**
1. Project Feed (đăng sản phẩm, update milestones)
2. AI Matching (tìm beta users, investors)
3. Calendar Booking (demo meetings)
4. Trust Building (collect vouches, testimonials)

### 8.2. Investor Persona

**Profile:**
- Type: VC Fund, Angel Network, CVC
- Ticket: $50K - $5M
- Focus: Tech, SaaS, Fintech

**Nỗi đau:**
| Pain Point | Biểu hiện | IEC Hub giải quyết |
|------------|-----------|-------------------|
| Deal Flow quality | 100 pitch deck, 2 investable | Pre-vetted Startups với Trust Score |
| Due Diligence tốn thời gian | 3-6 tháng/deal | Tiered Data Vault đã tổ chức |
| Portfolio tracking | Spreadsheet thủ công | Feed update từ portfolio companies |
| Market insights | Mua báo cáo đắt tiền | Real-time data từ platform |

**User Journey:**
```
Đăng ký → Setup Investor Profile (thesis, focus areas)
       → Feed hiển thị Startups phù hợp (đã filtered)
       → Xem public profile + Request Tier 2 (detailed metrics)
       → Book intro meeting → Request Tier 3 (financials, cap table)
       → Conduct due diligence on platform → Make investment
       → Startup becomes portfolio → Track via feed updates
```

**Key Features sử dụng:**
1. Curated Feed (pre-matched deal flow)
2. Tiered Data Access (progressive disclosure)
3. Event: Pitch Sessions (see multiple startups)
4. Portfolio Dashboard (track investments)

### 8.3. SME Persona

**Profile:**
- Revenue: $1M - $50M
- Employees: 50-500
- Challenge: Digital transformation, new markets

**Nỗi đau:**
| Pain Point | Biểu hiện | IEC Hub giải quyết |
|------------|-----------|-------------------|
| Tìm vendor đáng tin | Web search, hỏi bạn bè | Verified OA với case studies |
| Evaluate solutions | Demo không đủ tin | Tier 2 access: references, pricing |
| Fear of scam | Startup có thể "chết" | Trust score, vouch từ peers |
| Time-consuming RFP | 2-3 tháng process | Matching + Direct booking |

**User Journey:**
```
Đăng ký → Setup SME Profile → Đăng Project (nhu cầu đang tìm)
       → Feed gợi ý Startups có giải pháp → View case studies
       → Request Tier 2 (pricing, references) → Call references
       → Book demo với shortlist → Pilot project
       → Thành công → Vouch cho Startup → Cả hai tăng Trust Score
```

**Key Features sử dụng:**
1. "Seeking" Project type (đăng nhu cầu)
2. Feed với Startup solutions
3. Reference checking via Tier 2
4. Event: Industry Meetups

### 8.4. Researcher Persona

**Profile:**
- Type: Academic, Consulting firm, Independent
- Focus: Market research, tech trends, investment landscape

**Nỗi đau:**
| Pain Point | Biểu hiện | IEC Hub giải quyết |
|------------|-----------|-------------------|
| Data outdated | Annual reports, stale | Real-time project updates |
| Access to private info | Phải interview từng công ty | Tiered access có hệ thống |
| Sample bias | Chỉ tiếp cận được network nhỏ | Platform-wide anonymized data |
| Verification | Không biết data có đúng không | Verified OA, vouch system |

**User Journey:**
```
Đăng ký → Setup Researcher Profile (research areas)
       → Feed hiển thị trend projects → Aggregate public data
       → Request Tier 2 từ nhiều OA → Deep analysis
       → Publish research → Credit IEC Hub = Free marketing
       → Become thought leader → Spotlight feature
```

**Key Features sử dụng:**
1. Feed filtering by industry, stage
2. Batch Tier 2 requests
3. Anonymized insights (aggregate data)
4. Event: Knowledge sharing sessions

---

## 9. BUSINESS RULES - LUẬT NGHIỆP VỤ CỐT LÕI

### 9.1. Luật Email Công ty (The Gatekeeper)

```
RULE EMAIL_01: Corporate Email Only
  Mô tả: Chỉ chấp nhận email domain công ty
  Điều kiện: 
    - Domain KHÔNG nằm trong BLOCKED_DOMAINS list
    - Domain có MX record hợp lệ
    - Không phải disposable email
  Ngoại lệ:
    - Domain trong WHITELIST_DOMAINS (accelerators, edu)
  Vi phạm:
    - Reject đăng ký
    - Log attempt cho security audit

RULE EMAIL_02: Email = Identity Anchor
  Mô tả: Email là định danh chính, không đổi được
  Điều kiện:
    - Một email chỉ liên kết với một User
    - Email change cần admin approval
  Vi phạm:
    - Reject duplicate
    - Flag suspicious activity
```

### 9.2. Luật Xác thực Chéo (Trust Verification)

```
RULE VOUCH_01: Eligibility to Vouch
  Mô tả: Chỉ OA đủ điều kiện mới được vouch
  Điều kiện:
    - Voucher Trust Score >= 50
    - Voucher OA status = VERIFIED
    - Voucher và Vouchee có ít nhất 1 recorded interaction
  Vi phạm:
    - Vouch button disabled
    - Explain why not eligible

RULE VOUCH_02: No Self-dealing
  Mô tả: Không vouch cho bản thân hoặc OA liên quan
  Điều kiện:
    - Voucher OA != Vouchee OA
    - Không cùng Owner
    - Không cùng email domain (công ty mẹ-con)
  Vi phạm:
    - Reject vouch
    - Flag potential fraud

RULE VOUCH_03: Vouch Limit
  Mô tả: Giới hạn số lượng vouch để đảm bảo chất lượng
  Điều kiện:
    - Mỗi OA chỉ vouch tối đa 5 OA khác/tháng
    - Mỗi OA chỉ được nhận tối đa 20 vouches active
  Vi phạm:
    - Disable vouch ability until next month
    - Queue excess vouches
```

### 9.3. Luật Bảo mật Dữ liệu (Data Security)

```
RULE DATA_01: Tiered Access Progression
  Mô tả: Phải đi tuần tự từ Public → Protected → Confidential
  Điều kiện:
    - Không thể request Tier 3 nếu chưa có Tier 2
    - Mỗi tier có waiting period (24h)
  Ngoại lệ:
    - OA Elite có thể fast-track
  Vi phạm:
    - Reject request
    - Cooldown period

RULE DATA_02: Time-bound Access
  Mô tả: Quyền truy cập có thời hạn
  Chi tiết:
    - Tier 2: Default 30 ngày, max 90 ngày
    - Tier 3: Default 14 ngày, max 30 ngày
  Hết hạn:
    - Auto-revoke access
    - Notify requester 7 ngày trước
    - Allow renewal request

RULE DATA_03: Audit Everything
  Mô tả: Mọi truy cập Tier 2/3 đều được log
  Log bao gồm:
    - Who (user_id, oa_id)
    - What (document_id, document_type)
    - When (timestamp)
    - How (view, download, share)
    - Where (IP, device)
  Retention: 3 năm

RULE DATA_04: NDA for Confidential
  Mô tả: Bắt buộc ký NDA cho Tier 3
  Điều kiện:
    - NDA template chuẩn trên platform
    - E-signature với timestamp
    - Copy gửi cả hai bên
  Vi phạm:
    - Cannot access Tier 3
    - Cannot proceed without signing
```

### 9.4. Luật Matching & Booking

```
RULE MATCH_01: Quality over Quantity
  Mô tả: Giới hạn số lượng match/ngày để đảm bảo chất lượng
  Chi tiết:
    - Newcomer: 5 matches/ngày
    - Verified: 15 matches/ngày
    - Trusted: 30 matches/ngày
    - Elite: Unlimited
  Vi phạm:
    - Hide additional matches
    - Reset at midnight

RULE BOOK_01: Booking Prerequisites
  Mô tả: Điều kiện để book meeting
  Điều kiện:
    - Both OA status = VERIFIED
    - Requester Trust Score >= 25
    - Target has calendar available
    - No existing pending booking between same parties
  Vi phạm:
    - Disable book button
    - Show upgrade path

RULE BOOK_02: No-show Penalty
  Mô tả: Penalty cho việc không tham gia meeting
  Chi tiết:
    - First no-show: Warning
    - Second no-show: Trust Score -5
    - Third no-show: Booking suspended 7 ngày
  Reset: Monthly
```

---

## 10. NON-FUNCTIONAL REQUIREMENTS - YÊU CẦU PHI CHỨC NĂNG

### 10.1. Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feed load time | < 1.5s | P95 latency |
| Search results | < 500ms | P95 latency |
| Booking response | < 300ms | P95 latency |
| Concurrent users | 5,000+ | Load testing |
| Feed refresh | Real-time | WebSocket |

### 10.2. Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT + Refresh tokens, 2FA optional |
| Password | bcrypt, min 8 chars, complexity rules |
| Data at rest | AES-256 encryption |
| Data in transit | TLS 1.3 |
| API rate limiting | 100 req/min (default), tiered by Trust Level |
| Audit logging | Immutable, 3-year retention |

### 10.3. Scalability

| Component | Strategy |
|-----------|----------|
| Database | PostgreSQL với read replicas |
| Cache | Redis cluster |
| Search | Elasticsearch |
| File storage | S3-compatible với CDN |
| AI/ML | Separate service, async processing |

### 10.4. Availability

| Target | SLA |
|--------|-----|
| Uptime | 99.5% |
| Data durability | 99.999999999% (11 9s) |
| Backup frequency | Daily full, hourly incremental |
| RTO (Recovery Time) | < 4 hours |
| RPO (Recovery Point) | < 1 hour |

---

## 11. SUCCESS METRICS - CHỈ SỐ THÀNH CÔNG

### Phase 1 Metrics (Q2/2026)

| Category | Metric | Target | Measurement |
|----------|--------|--------|-------------|
| **Acquisition** | Registered Users | 1,000+ | Email công ty |
| | Verified OAs | 500+ | Completed KYB |
| | OA Type distribution | 40% Startup, 20% Investor, 30% SME, 10% Researcher | |
| **Activation** | Profile completeness | 80%+ avg | Score calculation |
| | Projects created | 1,000+ | Active projects |
| | First booking within 7 days | 30%+ | Funnel tracking |
| **Engagement** | Weekly Active OAs | 40%+ | Login + action |
| | Feed interactions/OA/week | 10+ | Views, saves, inquiries |
| | Meetings booked/week | 100+ | Platform bookings |
| **Trust** | Vouches exchanged | 500+ | Platform vouches |
| | Tier 2 requests approved | 60%+ | Approval rate |
| | Average Trust Score | 45+ | All verified OAs |

### Phase 2 Metrics (Q3/2026)

| Category | Metric | Target |
|----------|--------|--------|
| **Matching** | Match-to-view rate | 50%+ |
| | View-to-inquiry rate | 20%+ |
| | Inquiry-to-meeting rate | 40%+ |
| **Conversion** | Meeting-to-partnership rate | 15%+ |
| | Time to first partnership | < 30 days |
| **Value** | Deals facilitated (value) | $5M+ |
| | User satisfaction (NPS) | 50+ |

---

## 12. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Không đủ email công ty | High | Medium | Partner với business associations, universities |
| User không update profile | Medium | High | Gamification (Trust Score decay), nudges |
| Vouch gaming/fraud | High | Low | Strict rules, anomaly detection, manual review |
| Data breach | Critical | Low | Security-first architecture, regular audits |
| Low match quality | High | Medium | ML iteration, feedback loops |
| OA abandonment | Medium | Medium | Onboarding optimization, re-engagement campaigns |
| Competitor copy | Medium | Medium | Network effects, trust moat |

---

## 13. GLOSSARY - THUẬT NGỮ

| Term | Definition |
|------|------------|
| **OA (Organization Account)** | Tài khoản doanh nghiệp, có thể có nhiều User |
| **KYB (Know Your Business)** | Quy trình xác thực doanh nghiệp |
| **Trust Score** | Điểm tin cậy (0-100), tính từ nhiều yếu tố |
| **Vouch** | Xác thực chéo giữa các OA |
| **Data Vault** | Kho dữ liệu 3 tầng bảo mật |
| **Business Spotlight** | Chương trình vinh danh doanh nghiệp |
| **Social Capital** | Vốn xã hội - giá trị từ mạng lưới và uy tín |
| **Feed** | Bảng tin được cá nhân hóa bởi AI |
| **Tier 1/2/3** | Các tầng bảo mật dữ liệu (Public/Protected/Confidential) |

---

**Document Control:**
- Version: 4.0
- Author: IEC Hub Product Team
- Last Updated: 22/03/2026
- Status: APPROVED
- Next Review: 22/04/2026

</details>
-->
