/*
 * Trang chủ dựng theo skill design-taste-frontend (tasteskill 2.5.1), trả về HTML tĩnh từ
 * app/route.ts. Không dùng React ở đây: kit (public/assets/system.js, motion.js, layout.js) sửa DOM
 * khi tải (menu điện thoại, lớp chuyển động), nên React hydrate sẽ báo lệch (error #418) và vẽ lại.
 * HTML thuần để kit toàn quyền với DOM, đúng chế độ gốc của skill, và CSS của kit không bao giờ
 * gặp globals.css của các trang khác.
 *
 * PLAN
 * 1. kind: product (site-kind other): xe tải và xe chuyên dụng cho doanh nghiệp; main action "Gửi yêu cầu tư vấn".
 * 2. deal: hero film (ảnh thật trong khung; KHÔNG nút play vì không có phim), nav-mega, footer-dark,
 *    close-type, rhythm dark-band, buttons solid, mark wordmark; palette stone-blueprint (nền đá xám ấm
 *    như sàn xưởng và bãi xe, điểm nhấn xanh như bản vẽ kỹ thuật); type archivo (bỏ instrument,
 *    schibsted, figtree: cả ba không có bộ chữ tiếng Việt; archivo có, kit ghi "vehicles, equipment");
 *    moment picture-develops ở #cuu-ho. Không effect, không ground (kind other).
 * Voice: facts only (copy-registers 1): câu khẳng định có tên xe và số liệu, xe là chủ ngữ,
 *    không tính từ khen; một giới hạn: thông số là số liệu tham khảo, đối chiếu hồ sơ từng xe.
 * Screens (1440x900):
 *   hero      xe chữa cháy Dongfeng 4 khối trong khung film; object
 *   #dong-xe  bốn nhóm xe, 4 tile ảnh; line-up; 1
 *   #cau-hinh xe tải gắn cẩu Soosan 15 tấn, trio (toàn xe, cẩu, lòng thùng); parts; 1
 *   #cuu-ho   dark-band, xe cứu hộ sàn trượt, ảnh hiện dần (picture-develops); object; 1
 *   #thong-so thông số Isuzu 4 khối (rows--spec) cạnh ảnh xe; object; 1
 *   footer.closing close-type + footer-dark; 1
 */
import cuuHoFront from "../assets/cuuhobachucnang/1792026707412_5605664729049142053_5605664729049142053_6fde3b00a020e62eaf9cce83281391a4.jpg";
import dongLanh from "../assets/xedonglanh/1792026681019_5605664729049142053_5605664729049142053_dc716bdc224457253a602642d048ea1f.jpg";
import dongfeng65 from "../assets/xe-chua-chay-dongfeng-65/dongfeng-fire-65-02.jpg";
import cuuHoSanTruot from "../assets/cuuhobachucnang/1792026707447_5605664729049142053_5605664729049142053_6f9b3a869b6c114a060f80c42d107168.jpg";
import fawCrane01 from "../assets/faw-jh6-gan-cau/faw-jh6-crane-01.png";
import fawCrane03 from "../assets/faw-jh6-gan-cau/faw-jh6-crane-03.png";
import dongfengFire from "../assets/xe-chua-chay-dongfeng-4/dongfeng-fire-4-01.jpg";
import isuzuFireFront from "../assets/xe-chua-chay-isuzu-4-khoi/isuzu-fire-01.png";
import fotonWaste from "../assets/xe-hut-chat-thai-foton-7/foton-waste-7-01.png";
import type { Vehicle } from "../data/vehicles";

type Img = { src: string; width: number };

const MAIN_ACTION = "Gửi yêu cầu tư vấn";
const MAIN_HREF = "/lien-he#contact-form";
const PHONE = "0977170705";
const PHONE_LABEL = "0977 170 705";
const EMAIL = "phuocnguyen1108@gmail.com";

/** Escape cho nội dung chữ và thuộc tính (dữ liệu xe đến từ API). */
export function esc(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Ảnh gốc là PNG/JPG 0,2–3 MB: đi qua bộ tối ưu ảnh của Next (/_next/image, WebP/AVIF đúng cỡ)
 * bằng src/srcset; thẻ vẫn là <img> thường như kit cần.
 */
const WIDTHS = [640, 828, 1080, 1200, 1920];
function img(image: Img, alt: string, sizes: string, subject: string, extra = "") {
  const fitting = WIDTHS.filter((width) => width <= image.width);
  const widths = fitting.length > 0 ? fitting : [WIDTHS[0]];
  const url = (width: number) => `/_next/image?url=${encodeURIComponent(image.src)}&amp;w=${width}&amp;q=75`; // Next 16 chỉ nhận các mức trong images.qualities (mặc định [75])
  const srcset = widths.map((width) => `${url(width)} ${width}w`).join(", ");
  return `<img src="${url(widths[Math.min(2, widths.length - 1)])}" srcset="${srcset}" sizes="${sizes}" alt="${esc(alt)}" data-source="client" data-subject="${esc(subject)}"${extra}>`;
}

const arrow = `<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>`;
const chev = `<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const groups = [
  { category: "Xe tải", line: "Thùng bạt, thùng kín, thùng lửng, ben, đông lạnh và gắn cẩu.", image: dongLanh, alt: "Xe tải Hyundai thùng đông lạnh màu trắng đỗ trong sân" },
  { category: "Xe chữa cháy", line: "Bồn nước và foam từ 2,5 đến 6,5 khối, nền Dongfeng và Isuzu.", image: dongfeng65, alt: "Xe chữa cháy Dongfeng cabin đôi màu đỏ nhìn thẳng từ phía trước" },
  { category: "Xe cứu hộ", line: "Sàn trượt, nâng đầu và càng kéo; có loại lắp thêm cẩu.", image: cuuHoFront, alt: "Xe cứu hộ sàn trượt màu trắng có cần cẩu vàng, nhìn chéo phía trước" },
  { category: "Xe bồn / xe môi trường", line: "Bồn nước, hút chất thải, ép rác và quét đường.", image: fotonWaste, alt: "Xe hút chất thải Foton với bồn màu cam", pos: "70% 50%" },
];

// Năm dòng ngắn; mô tả dài (súng phun, động cơ) để ở trang chi tiết xe.
const specLabels = ["Nhãn hiệu / model", "Cabin", "Kích thước xe", "Dung tích bồn", "Bơm chữa cháy"];

const rootTokens = `:root {
  --p-bg: #dfdedb; --p-surface: #d3d2ce; --p-ink: #26251e; --p-muted: #5a5850;
  --p-accent: #2456d6; --p-accent-ink: #ffffff; --p-action: #2456d6; --p-action-ink: #ffffff;
  --p-inv-bg: #26251e; --p-inv-surface: #313029; --p-inv-ink: #dfdedb; --p-inv-muted: #9e9d99;
  --p-inv-accent: #dfdedb; --p-inv-accent-ink: #26251e; --p-inv-action: #dfdedb; --p-inv-action-ink: #26251e;
  --font-display: "Archivo", system-ui, sans-serif;
  --font-text: "Archivo", system-ui, sans-serif;
  --display-weight: 400;
  --display-tracking: -0.025em;
  --display-tracking-xl: -0.035em;
  --display-stretch: 110%;
  --ly-scale: 0.9;
}`;

/* CSS riêng của trang: chỉ những gì nằm trong visual mà kit không có ("page CSS" của skill). */
const pageCss = `
/* picture-develops: ảnh của section, cột phải của split, cao bằng phần chữ bên cạnh */
.develop { margin: 0; border-radius: var(--r-lg); overflow: hidden; height: min(640px, var(--ly-fit)); }
.develop > img { display: block; width: 100%; height: 100%; object-fit: cover; }
@media (max-width: 1023px) { .develop { height: auto; aspect-ratio: 4 / 3; margin-top: var(--s-7); } }
/* trio: ba ảnh cùng một xe (toàn xe, cần cẩu, lòng thùng), ba cỡ, đỉnh thẳng hàng */
.trio { align-items: start; }
.trio figure { margin: 0; border-radius: var(--r-lg); overflow: hidden; }
.trio img, .spec-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
/* ba ảnh cùng khổ 16:9, cao bằng nhau. Ảnh gốc 4:3 (1276x956) có tem "CALL US" ở đáy và logo
   của nhà cung cấp ở đỉnh: khổ 16:9 cắt bỏ khoảng 12% trên và dưới, đủ để cả hai nằm ngoài khung */
.trio figure { aspect-ratio: 16 / 9; }
.trio img { object-position: 50% 45%; }
/* tablet: ảnh toàn xe hết hàng, hai ảnh chi tiết chia đôi hàng dưới, trên đúng cột của kit;
   xếp chồng ba ảnh thì section cao 2,2–2,4 màn hình */
@media (min-width: 640px) and (max-width: 1023px) {
  #cau-hinh .trio > figure { grid-column: span 6; }
}
/* mã model dài không có chỗ ngắt (ISUZU KLF5100GXFPM40/Q6A) đẩy dòng rộng 420px ở 390 */
#thong-so .rows > li { display: grid; grid-template-columns: minmax(7rem, 34%) minmax(0, 1fr); gap: var(--s-4); }
#thong-so .rows__value { min-width: 0; white-space: normal; overflow-wrap: anywhere; text-align: right; }
/* ảnh cạnh bảng thông số */
.spec-photo { margin: 0; border-radius: var(--r-lg); overflow: hidden; aspect-ratio: 1 / 1; }
@media (max-width: 1023px) { .spec-photo { aspect-ratio: 4 / 3; } }
/* hộp chữ của hero film: chữ tiếng Việt có dấu rộng hơn, cho h1 đủ chỗ trong ba dòng */
.hero--film .hero__over > div { max-width: 720px; }
.hero--film .hero__over h1 { max-width: none; }
@media (max-width: 639px) {
  .hero--film .hero__over { padding-inline: var(--s-4); }
  .hero--film .hero__over h1 { font-stretch: 100%; }
}
`;

function vehicleHref(vehicles: Vehicle[], slug: string) {
  return vehicles.some((vehicle) => vehicle.slug === slug) ? `/xe/${slug}` : "/xe";
}

export function renderHome(vehicles: Vehicle[], fallback: Vehicle[]) {
  const count = (category: string) => vehicles.filter((vehicle) => vehicle.category === category).length;
  const isuzu =
    vehicles.find((vehicle) => vehicle.slug === "xe-chua-chay-isuzu-4-khoi") ??
    fallback.find((vehicle) => vehicle.slug === "xe-chua-chay-isuzu-4-khoi");
  const specs = specLabels
    .map((label) => isuzu?.knownDetails.find((detail) => detail.label === label))
    .filter((detail): detail is { label: string; value: string } => Boolean(detail));
  const href = (slug: string) => vehicleHref(vehicles, slug);
  // Dữ kiện cứng trên màn hình đầu (copy.md rule 2): số dòng xe thật đang hiển thị.
  const leadFact = vehicles.length > 0 ? `${vehicles.length} dòng xe trong 4 nhóm. ` : "";

  return `<!doctype html>
<html lang="vi" data-type="product" data-radius="soft" data-buttons="solid" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Xe Chuyên Dụng: xe tải và xe chuyên dụng cho doanh nghiệp</title>
<meta name="description" content="Xe chữa cháy, xe cứu hộ, xe bồn và xe tải gắn cẩu, tư vấn cấu hình theo công việc và đối chiếu thông số với hồ sơ từng xe.">
<meta property="og:type" content="website">
<meta property="og:title" content="Xe Chuyên Dụng: xe tải và xe chuyên dụng cho doanh nghiệp">
<meta property="og:description" content="Tư vấn cấu hình xe tải và xe chuyên dụng theo công việc, thông số đối chiếu với hồ sơ từng xe.">
<!-- og:image: thêm share.jpg (ảnh chụp hero 1200x630) vào public/ rồi bật lại dòng này -->
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<meta name="theme-color" content="#dfdedb">
<!-- <link rel="canonical" href="https://[tên miền của doanh nghiệp]/"> : chờ tên miền chính thức -->
<meta name="site-kind" content="other">
<meta name="page-type" content="product">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/system.css">
<link rel="stylesheet" href="/assets/ui/cards.css">
<link rel="stylesheet" href="/assets/motion/motion.css">
<link rel="stylesheet" href="/assets/layout/layout.css">
<style>${rootTokens}${pageCss}</style>
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="/assets/moments/moments.js">
<link rel="modulepreload" href="/assets/moments/lib.js">
<link rel="modulepreload" href="/assets/moments/picture-develops/moment.js">
</head>
<body>
<!-- type: product · deal: hero film, nav nav-mega, close close-type, footer footer-dark, rhythm dark-band, buttons solid, mark wordmark, grounds none
     moments: picture-develops (#cuu-ho) -->
<header class="nav">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Bỏ qua điều hướng</a>
    <a class="nav__logo" href="#top">Xe Chuyên Dụng</a>
    <nav class="nav__links" aria-label="Điều hướng chính">
      <div class="nav__item">
        <a class="nav__link" href="#dong-xe">Dòng xe ${chev}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-3">
              <p class="t-label">Nhóm xe</p>
              <a href="/xe">Xe tải<span>Chở hàng, gắn cẩu, đông lạnh</span></a>
              <a href="/xe">Xe chữa cháy<span>Bồn nước và foam</span></a>
              <a href="/xe">Xe cứu hộ<span>Sàn trượt, càng kéo</span></a>
              <a href="/xe">Xe môi trường<span>Bồn nước, hút, ép, quét</span></a>
            </div>
            <div class="menu-col span-3">
              <p class="t-label">Mẫu xe</p>
              <a href="${href("xe-tai-gan-cau")}">FAW JH6 gắn cẩu<span>Cẩu Soosan 15 tấn, 8×4</span></a>
              <a href="${href("xe-chua-chay-isuzu-4-khoi")}">Isuzu 4 khối<span>Nước 3,5 m³, foam 0,5 m³</span></a>
              <a href="${href("xe-cuu-ho-san-truot")}">Cứu hộ sàn trượt<span>Cẩu, tời và càng kéo</span></a>
            </div>
            <a class="menu-card span-3 start-10" href="${href("xe-hut-chat-thai")}">
              <div class="panel">${img(fotonWaste, "Xe hút chất thải Foton 7 khối", "300px", "xe hút chất thải", ' class="frame__img" loading="lazy"')}</div>
              <span class="t-card">Xe hút chất thải 7 khối</span>
              <span class="t-small muted">Nền Foton, bồn thép</span>
            </a>
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="#cau-hinh">Cấu hình</a></div>
      <div class="nav__item"><a class="nav__link" href="#cuu-ho">Cứu hộ</a></div>
      <div class="nav__item"><a class="nav__link" href="#thong-so">Thông số</a></div>
      <div class="nav__item"><a class="nav__link" href="/tin-tuc">Kiến thức</a></div>
    </nav>
    <div class="nav__actions">
      <a class="btn btn--primary" href="${MAIN_HREF}">${MAIN_ACTION}</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Mở menu">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>

<main id="top">
  <section class="hero hero--film" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text hero__in">
      <div class="hero__media hero__fill">
        ${img(dongfengFire, "Xe chữa cháy Dongfeng cabin đôi màu đỏ đỗ trên nền bê tông ướt", "(max-width: 639px) 1100px, 1280px", "xe chữa cháy Dongfeng 4 khối", ' style="--ly-pos: 62% 55%; --ly-pos-phone: 60% 50%" fetchpriority="high"')}
        <div class="hero__over">
          <div>
            <h1 id="hero-h">Xe tải và xe chuyên dụng cho doanh nghiệp</h1>
            <p class="hero__lead">${esc(leadFact)}Xe chữa cháy, cứu hộ, xe bồn và xe tải gắn cẩu, cấu hình theo việc xe sẽ làm. Thông số được đối chiếu với hồ sơ từng xe trước khi báo giá.</p>
            <div class="btn-row"><a class="btn btn--primary" href="${MAIN_HREF}">${MAIN_ACTION}${arrow}</a></div>
          </div>
        </div>
      </div>
    </div></div>
  </section>

  <section class="section" id="dong-xe" aria-labelledby="dong-xe-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <div><h2 id="dong-xe-h">Bốn nhóm xe. <span class="muted">Mỗi dòng có trang thông số riêng.</span></h2></div>
        <a class="link" href="/xe">Xem toàn bộ danh mục</a>
      </div>
      <div class="grid">
        ${groups
          .map(
            (group) => `<a class="tile tile--portrait span-3" href="/xe">
          <div class="tile__media">${img(group.image, group.alt, "(max-width: 639px) 520px, 1000px", group.category, ` loading="lazy"${"pos" in group ? ` style="object-position: ${group.pos}"` : ""}`)}</div>
          <div class="tile__head"><h3>${esc(group.category)}</h3><span class="tile__price">${count(group.category)} dòng</span></div>
          <p>${esc(group.line)}</p>
        </a>`,
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section" id="cau-hinh" aria-labelledby="cau-hinh-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <div>
          <h2 id="cau-hinh-h">Xe tải gắn cẩu Soosan 15 tấn</h2>
          <p>FAW JH6 bốn chân 8×4, thùng lửng lòng 8.200 × 2.360 mm, lắp cẩu tự hành Soosan. Tải thực tế tính theo hồ sơ đăng kiểm và vị trí lắp cẩu.</p>
        </div>
        <a class="link" href="${href("xe-tai-gan-cau")}">Xem thông số FAW JH6</a>
      </div>
      <div class="grid trio">
        <figure class="t-a span-6">${img(fawCrane01, "Xe FAW JH6 gắn cẩu Soosan nhìn chéo phía trước trong nhà xưởng", "(max-width: 639px) 100vw, 640px", "xe tải gắn cẩu, toàn xe", ' loading="lazy"')}</figure>
        <figure class="t-b span-6">${img(fawCrane03, "Cần cẩu Soosan màu vàng gấp gọn sau cabin", "(max-width: 639px) 100vw, 640px", "cần cẩu Soosan", ' loading="lazy"')}</figure>
      </div>
    </div>
  </section>

  <section class="section ground-inverse" id="cuu-ho" aria-labelledby="cuu-ho-h">
    <div class="wrap grid grid--top">
      <div class="span-6">
        <div class="section-head">
          <h2 id="cuu-ho-h">Xe cứu hộ sàn trượt 3 chức năng</h2>
          <p>Sàn trượt, tời kéo, càng kéo và cần cẩu XCMG SQS100 trên cùng một xe.</p>
        </div>
        <ul class="rows">
          <li><span class="rows__name">Sức nâng của cẩu</span><span class="rows__value">4.000 kg tại tầm với 2,5 m</span></li>
          <li><span class="rows__name">Vừa kéo vừa chở</span><span class="rows__value">2.500 kg</span></li>
          <li><span class="rows__name">Chỉ kéo</span><span class="rows__value">1.600 kg trên càng</span></li>
        </ul>
        <p><a class="link" href="${href("xe-cuu-ho-san-truot")}">Xem thông số xe cứu hộ</a></p>
      </div>
      <figure class="develop span-6 start-7" data-moment="picture-develops">${img(cuuHoSanTruot, "Xe cứu hộ sàn trượt có cần cẩu, nhìn ngang, đỗ dưới hàng cây", "(max-width: 1023px) 100vw, 1700px", "xe cứu hộ sàn trượt 3 chức năng", ' width="1280" height="880" loading="lazy" style="object-position: 100% 60%"')}</figure>
    </div>
  </section>

  <section class="section" id="thong-so" style="--hm: 2" aria-labelledby="thong-so-h">
    <div class="wrap grid grid--top">
      <div class="span-6">
        <div class="section-head">
          <h2 id="thong-so-h">Thông số xe chữa cháy Isuzu 4 khối</h2>
          <p>Số liệu lấy từ trang tham khảo của mẫu xe. Bản giao cho khách được đối chiếu với hồ sơ kỹ thuật của chính xe đó.</p>
        </div>
        <ul class="rows rows--spec">
          ${specs.map((spec) => `<li><span class="rows__name">${esc(spec.label)}</span><span class="rows__value">${esc(spec.value)}</span></li>`).join("\n          ")}
        </ul>
        <p><a class="link" href="${href("xe-chua-chay-isuzu-4-khoi")}">Xem đủ thông số Isuzu 4 khối</a></p>
      </div>
      <figure class="spec-photo span-6 start-7">${img(isuzuFireFront, "Xe chữa cháy Isuzu 4 khối nhìn thẳng từ phía trước", "(max-width: 1023px) 100vw, 628px", "xe chữa cháy Isuzu 4 khối", ' loading="lazy" style="object-position: 42% 50%"')}</figure>
    </div>
  </section>
</main>

<footer class="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">${MAIN_ACTION}</h2>
        <p>Ghi dòng xe, công việc và nơi xe chạy. Hai bên làm rõ cấu hình rồi mới xác nhận báo giá.</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="${MAIN_HREF}">${MAIN_ACTION}${arrow}</a>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="#top">Xe Chuyên Dụng</a>
          <p class="footer__lede">Tư vấn xe tải và xe chuyên dụng theo công việc, hỗ trợ khách hàng toàn quốc.</p>
        </div>
        <div class="span-2 footer__col"><h3>Danh mục</h3><ul><li><a href="#dong-xe">Nhóm xe</a></li><li><a href="#cau-hinh">Xe gắn cẩu</a></li><li><a href="#cuu-ho">Xe cứu hộ</a></li><li><a href="#thong-so">Xe chữa cháy</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Thông tin</h3><ul><li><a href="/gioi-thieu">Giới thiệu</a></li><li><a href="/dich-vu">Dịch vụ</a></li><li><a href="/tu-van-mua-xe">Tư vấn mua xe</a></li><li><a href="/tin-tuc">Kiến thức</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Pháp lý</h3><ul><li><a href="/chinh-sach">Chính sách</a></li><li><a href="/phap-ly">Quy định</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Liên hệ</h3><ul><li><span>Phước Nguyễn</span></li><li><a href="tel:${PHONE}">${PHONE_LABEL}</a></li><li><a href="mailto:${EMAIL}">Gửi email</a></li></ul></div>
      </div>
      <div class="footer__legal"><span>&copy; 2026 Xe Chuyên Dụng</span></div>
    </div>
  </div>
</footer>

<!-- thanh hành động trên điện thoại: system.js hiện nó khi nút ở hero đã cuộn khỏi màn hình,
     và đưa nút của nav vào menu toàn màn hình -->
<nav class="actionbar" aria-label="Thao tác nhanh">
  <a class="btn btn--primary" href="${MAIN_HREF}">${MAIN_ACTION}</a>
</nav>

<script type="module" src="/assets/system.js"></script>
<script type="module" src="/assets/motion/motion.js"></script>
<script type="module" src="/assets/layout/layout.js"></script>
</body>
</html>`;
}
