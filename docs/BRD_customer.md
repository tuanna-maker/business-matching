# IEC Hub — Business Requirements Document (BRD v7.0) [Customer Copy]

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
   - Sau khi đăng ký tài khoản, user có thể tạo project
   - Khi tạo project, hệ thống gợi ý 2 nhóm profile/sector chính:
     - `Startup` (công ty công nghệ)
     - `Doanh nghiệp` (nhà đầu tư)
   - Account tạo project được ghi nhận là **owner** của project đó
   - Một owner có thể tạo và quản lý nhiều project profiles
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

Sau khi đăng ký thành công, account có thể tạo project và chọn nhóm profile/sector phù hợp với mục tiêu:

- `Startup` (công ty công nghệ)
- `Doanh nghiệp` (nhà đầu tư)

Mỗi project được gắn với account tạo ra (owner). Một owner có thể tạo nhiều project profiles để phản ánh các hướng kinh doanh/đầu tư khác nhau.

Owner vận hành project theo các trạng thái:

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
- **Protected:** yêu cầu truy cập kèm mục đích; chủ Data Room phê duyệt; UI có cam kết NDA trước khi gửi yêu cầu truy cập.
- **Confidential:** yêu cầu truy cập có phê duyệt; đồng thời có điều kiện liên quan Trust Score của tổ chức.

Trong UI Vault:

- Startup tạo Data Room cho project.
- Investor gửi yêu cầu truy cập với `purpose` và `message`.
- Startup phản hồi (chấp nhận/từ chối) và hệ thống cập nhật trạng thái để nhà đầu tư theo dõi minh bạch.

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

- Admin Dashboard: xem metrics & audit logs.
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

- Trust Score/IEC level là tín hiệu tin cậy để định hướng mức độ truy cập ở tier cao.

### 5.4. Role-based authorization

- Startup: tạo/cập nhật project; vận hành Data Room và phản hồi yêu cầu truy cập.
- Investor: duyệt Discover; gửi yêu cầu truy cập Data Room; theo dõi pipeline qua Matching.
- Org owner/admin: quản trị members/invites theo quyền.
- Admin: xem metrics và audit logs.

### 5.5. Project ownership

- Account tạo project được ghi nhận là owner của project.
- Owner có toàn quyền cập nhật nội dung project, quản trị trạng thái và vận hành Data Room của project đó.
- Một owner có thể tạo nhiều project profiles theo các nhóm mục tiêu khác nhau.

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

## 9) EPIC 1 — Định danh & quản trị Organization (The Gatekeeper)

**Mục tiêu:** đảm bảo mọi “bên tham gia” trên IEC Hub là doanh nghiệp thật và có người đại diện thật, để dữ liệu và các lời xác thực (vouch/testimonial) có giá trị khi ra quyết định.

### 9.1. Đăng ký có kiểm soát (email công ty)

Người dùng đăng ký bằng **email công ty** và phải hoàn tất xác thực. Cách làm này giúp hệ thống loại bỏ tài khoản tạo vội bằng email cá nhân/email rác, đồng thời giữ “neo danh tính” ổn định.

### 9.2. Organization Account (OA): tạo mới, mời tham gia, và yêu cầu vào OA

IEC Hub hỗ trợ 3 kiểu tham gia OA:

- **Tạo OA mới:** người dùng đã xác thực tạo tổ chức, cung cấp thông tin cơ bản, sau đó trải qua bước xem xét của admin để chuyển trạng thái sang “đã xác thực”.
- **Được mời vào OA:** owner/admin gửi lời mời; người nhận xác nhận vai trò và trở thành member.
- **Gửi yêu cầu tham gia OA:** người dùng tìm OA theo thông tin tổ chức và gửi request; admin duyệt để gán member.

### 9.3. OA profile theo vai trò (Startup / Investor / SME / Researcher)

Mỗi loại OA có “bộ trường” mô tả nhu cầu và năng lực khác nhau, nhưng có chung nguyên tắc: giúp người xem hiểu nhanh “bên này đang tìm gì, làm được gì, và ở giai đoạn nào”.

### 9.4. Dynamic Profile: chứng minh năng lực bằng dữ liệu sống

Thay vì chỉ khai báo, profile phải “tự chứng minh” qua:

- **Project Feed:** dòng thời gian các dự án đang/đã triển khai
- **Milestones:** cột mốc tiến độ được cập nhật
- **Testimonials:** phản hồi từ đối tác (kèm điều kiện xác thực)
- **Vouches:** xác thực chéo từ các OA khác trên nền tảng

Kết quả: trust không chỉ là lời nói, mà có bằng chứng theo thời gian.

---

## 10) EPIC 2 — Dynamic Project Feed & Matching (The Heart)

**Mục tiêu:** biến IEC Hub thành nơi “thông tin tìm người dùng”, nghĩa là đúng bên phù hợp có nhu cầu sẽ tự nhìn thấy nhau qua dữ liệu đã được chuẩn hoá.

### 10.1. Project Feed: biến dự án thành “bằng chứng”

Startup xuất bản và vận hành dự án theo các loại phù hợp với thực tế:

- **Product / Service:** dự án sản phẩm hoặc dịch vụ
- **Initiative:** chương trình nội bộ/đề án chuyển đổi
- **Case Study:** kết quả đã hoàn thành (hoặc đang có dấu hiệu rõ ràng)
- **Seeking:** trạng thái “đang tìm” đối tác/giải pháp

Mỗi project có thể đi kèm ảnh, mô tả, timeline, và dữ liệu cập nhật để người xem hiểu “đang diễn ra thật”.

### 10.2. Cá nhân hóa feed dựa trên tín hiệu tin cậy

Feed ưu tiên hiển thị dựa trên:

- hồ sơ OA (ngành nghề, quy mô, giai đoạn)
- hành vi/quan tâm (xem, lưu, tương tác)
- nhu cầu được khai báo (đang tìm loại gì)
- tín hiệu mạng lưới (kết nối gần/đồng ngữ cảnh)
- đặc biệt: **trust score** của OA đăng (để feed không chỉ đúng chủ đề mà còn đúng độ tin cậy)

### 10.3. Smart Matching: gợi ý có lý do, có ngữ cảnh

Matching engine tạo gợi ý với:

- **match score** (chất lượng phù hợp)
- **match reasons** (vì sao gợi ý: cùng ngành, cùng nhu cầu/offer, tương thích giai đoạn, tín hiệu trust…)
- **trạng thái hành động khả dụng** theo quyền (xem public, request tier tiếp theo, và booking meeting khi đủ điều kiện)

IEC Hub cũng theo dõi hành trình tương tác để tối ưu chất lượng match theo thời gian (giảm “gợi ý rỗng”).

---

## 11) EPIC 3 — Trao đổi dữ liệu theo tier & cơ chế bảo mật (The Trust)

**Mục tiêu:** chia sẻ dữ liệu an toàn theo 3 tầng, để người xem biết rõ “mình đang được phép đến đâu” và vì sao.

### 11.1. Data Room theo 3 tier

- **Public:** xem theo mặc định (mục tiêu là tăng độ hiểu và giảm rào cản ban đầu)
- **Protected:** người muốn xem phải **gửi request có mục đích**; chủ Data Room duyệt; và UI hỗ trợ cam kết NDA trước khi gửi request
- **Confidential:** chỉ mở khi có **phê duyệt** và đáp ứng điều kiện trust; thường cần ký NDA trên nền tảng

### 11.2. Quy trình request & phê duyệt rõ ràng

Luồng phổ biến:

- Người xem gửi request kèm lý do (và thông tin cần cho việc thẩm định)
- Owner/admin nhận notification, xem xét dựa trên dữ liệu và bối cảnh
- Approve/Reject kèm minh bạch lý do khi cần
- Quyền truy cập có thời hạn, có thể gia hạn hoặc bị thu hồi

### 11.3. Nguyên tắc kiểm soát quyền truy cập

IEC Hub vận hành theo nguyên tắc:

- **Least privilege:** mặc định chỉ xem public; muốn xem sâu phải request theo tier riêng
- **Audit & minh bạch:** mọi truy cập tier cao có thể được ghi nhận để giảm rủi ro “lộ thông tin”
- **Time-bound access:** quyền truy cập có thời hạn, giúp chủ Data Room kiểm soát tốt hơn
- **Revocation:** chủ OA có quyền thu hồi ngay khi cần

---

## 12) EPIC 4 — Event & Calendar Booking (The Action)

**Mục tiêu:** event và booking không phải “mục đích”, mà là công cụ chạm để thực thi kết nối sau khi feed đã gợi ý đúng bên.

### 12.1. Event types theo đúng nhu cầu B2B

IEC Hub triển khai nhiều loại sự kiện:

- **KYB Workshop:** xác thực doanh nghiệp và networking có kiểm soát
- **Industry Meetup:** kết nối theo ngành
- **Pitch Session:** startup trình bày; investor theo dõi
- **Knowledge Share:** chia sẻ chuyên môn/insight từ các OA đã được xác thực
- **Deal Flow Review:** nội bộ investor theo phiên (nếu bật cấu hình)

### 12.2. Gợi ý event và attendee theo ngữ cảnh

Hệ thống đề xuất:

- OA phù hợp có thể tham gia event
- lý do gợi ý (ngành, tín hiệu trust, và các tương tác trước đó)
- thông tin “social proof” để giảm ngập thông tin

### 12.3. Booking 1-1 có điều kiện và có chuẩn bị

Khi hai bên đủ điều kiện (định danh hợp lệ, tín hiệu trust và trạng thái phù hợp), người dùng có thể:

- book meeting 1-1 với mục đích (tìm hiểu, demo, trao đổi NDA, follow-up)
- đề xuất khung giờ
- nhận xác nhận và chuyển vào lịch

Trước buổi họp, hệ thống gửi nhắc lịch và “Meeting Brief” để giảm rủi ro buổi meeting thiếu trọng tâm.

Sau buổi họp, hai bên phản hồi để cập nhật trạng thái match và đề xuất bước tiếp theo (ví dụ: request tier cao hơn, mời tham gia event phù hợp).

---

## 13) EPIC 5 — Reputation & Social Capital (The Soul)

**Mục tiêu:** xây dựng vinh danh dựa trên “tiếng thơm” thực tế, không dựa credit/tiền ảo.

### 13.1. Trust Score: nền tảng để mở quyền và định hướng hành vi

Trust Score phản ánh:

- mức độ xác thực danh tính
- độ minh bạch thông tin (profile cập nhật, có dữ liệu sống)
- năng lực thực thi (từ project outcomes và phản hồi meeting)
- đóng góp cộng đồng (vouches, events tham gia/host, chia sẻ tri thức)

Hệ thống chia trust thành các mức: **Newcomer → Verified → Trusted → Elite**.

### 13.2. Badges & Spotlight: vinh danh theo câu chuyện có thật

Badges dùng để thể hiện những mốc tin cậy (ví dụ: Verified Entity, Open Book, Deal Closer, Community Builder…).

Spotlight dùng để đưa “câu chuyện thành công” và “thought leadership” lên vị trí nổi bật, dựa trên tiêu chí dựa hành vi/đầu ra thực.

### 13.3. Vouching: xác thực chéo dựa trên tương tác có đủ điều kiện

Vouching chỉ khả dụng khi OA đủ điều kiện và có nền tảng tương tác. Hệ thống giới hạn để bảo vệ chất lượng tín hiệu.

### 13.4. Quyền theo Trust Level

Quyền truy cập và mức độ hành động tăng dần theo trust level: từ xem public, đến request tier cao, booking meeting, và các quyền tham gia/đóng góp nâng cao.

---

## 14) Target persona deep dive — Nhu cầu thực tế

### 14.1. Startup (chủ dự án)

**Pain points thường gặp:** tìm beta users, chứng minh năng lực ngoài pitch deck, tiếp cận investor thiếu introduction và thiếu “credibility”.

**Chuyển đổi IEC Hub tạo ra:** Project Feed + Dynamic Profile để có dữ liệu sống; Matching và Event facilitation để tạo cơ hội gặp đúng người; Vouch/Testimonial để trust tăng theo hành động thật.

### 14.2. Investor

**Pain points thường gặp:** deal flow kém chất lượng, due diligence tốn thời gian, portfolio tracking rời rạc.

**Chuyển đổi IEC Hub tạo ra:** feed được lọc theo nhu cầu và trust; Data Room theo tier để thu hẹp phạm vi thẩm định; Matching và Event giúp rút ngắn chu kỳ tìm → gặp → đánh giá.

### 14.3. SME

**Pain points thường gặp:** tìm vendor đáng tin, đánh giá giải pháp không đủ dữ liệu, lo rủi ro scam, và quy trình RFP quá dài.

**Chuyển đổi IEC Hub tạo ra:** “Seeking” và tier request để check references/pricing theo cách có kiểm chứng; Matching + booking giúp ra quyết định sớm hơn.

### 14.4. Researcher (tùy chọn)

**Pain points thường gặp:** dữ liệu bị lỗi thời, khó tiếp cận thông tin riêng, và thiên lệch mẫu.

**Chuyển đổi IEC Hub tạo ra:** dữ liệu dự án được cập nhật theo tiến độ; có cơ chế tier truy cập; và hệ thống trust giúp giảm rủi ro dữ liệu sai lệch.

---

## 15) Business Rules — Luật vận hành cốt lõi

### 15.1. Luật Gatekeeper (email công ty & neo danh tính)

IEC Hub yêu cầu email công ty để bảo đảm tính chính danh, đồng thời coi email là “neo danh tính” để giảm gian lận tài khoản.

### 15.2. Luật Trust Verification (vouch & xác thực chéo)

Vouching chỉ hoạt động khi bên vouch và bên được vouch đáp ứng điều kiện trust và có nền tảng tương tác. Hệ thống cũng có giới hạn để duy trì chất lượng tín hiệu.

### 15.3. Luật bảo mật dữ liệu theo tier

Quyền truy cập đi theo thứ tự Public → Protected → Confidential. Quyền có thời hạn, được ghi nhận theo audit trail, và tier cao thường cần NDA để bảo vệ dữ liệu nhạy cảm.

### 15.4. Luật Matching & Booking (chất lượng trước số lượng)

Matching và booking được “giới hạn có kiểm soát” để tránh spam và giữ chất lượng tương tác:

- số lượng match theo mức trust
- điều kiện booking rõ ràng (đủ trạng thái xác thực, đủ tín hiệu trust, và không có cuộc hẹn treo bất hợp lý)
- cơ chế xử lý no-show để giảm rủi ro lãng phí thời gian đôi bên

---

## 16) Document Control

- Version: 7.1
- Author: IEC Hub Product Team
- Last Updated: 25/03/2026
- Status: DRAFT
- Next Review: 26/03/2026

