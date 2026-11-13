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
 * Sections (hero đúng một màn hình; các khối sau cao theo nội dung, xem pageCss):
 *   hero        xe chữa cháy Dongfeng 4 khối trong khung film; nút tư vấn + gọi điện
 *   #dong-xe    bốn nhóm xe, 4 tile ảnh, mỗi tile lọc sẵn danh mục
 *   #mau-xe     6 mẫu xe có ảnh từ API, lấy lần lượt từng nhóm (ground-surface)
 *   #cau-hinh   xe tải gắn cẩu Soosan 15 tấn, hai ảnh
 *   #cuu-ho     dark-band, xe cứu hộ sàn trượt, ảnh hiện dần (picture-develops)
 *   #thong-so   thông số Isuzu 4 khối (rows--spec) cạnh ảnh xe
 *   #quy-trinh  bốn bước tư vấn (data/service-steps.ts, cùng trang Dịch vụ)
 *   #kien-thuc  ba bài viết mới nhất từ API
 *   footer.closing close-type có người liên hệ, điện thoại, email + footer-dark
 * Nav và các cột chân trang lấy từ components/site-nav.ts, cùng nguồn với các trang con.
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
import { CONTACT_NAME, EMAIL, MAIN_ACTION, MAIN_HREF, PHONE, PHONE_LABEL } from "../components/site-constants";
import { FOOTER_LEDE, footerInfo, footerLegal, navGroups, navLinks, navModels, type NavLink } from "../components/site-nav";
import type { Article } from "../data/articles";
import { serviceSteps } from "../data/service-steps";
import type { Vehicle } from "../data/vehicles";

type Img = { src: string; width: number };

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

/** Ảnh xe từ API (chuỗi đường dẫn, không biết bề rộng gốc): bộ tối ưu không phóng to quá ảnh gốc. */
function imgPath(src: string, alt: string, sizes: string, extra = "") {
  if (!src.startsWith("/") || src.startsWith("//")) return `<img src="${esc(src)}" alt="${esc(alt)}" sizes="${sizes}"${extra}>`;
  const widths = [640, 828, 1080];
  const url = (width: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${width}&amp;q=75`;
  return `<img src="${url(828)}" srcset="${widths.map((w) => `${url(w)} ${w}w`).join(", ")}" sizes="${sizes}" alt="${esc(alt)}" data-source="client"${extra}>`;
}

const links = (items: NavLink[]) => items.map((link) => `<li><a href="${link.href}">${esc(link.label)}</a></li>`).join("");

const arrow = `<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>`;
const chev = `<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const groups = [
  { category: "Xe tải", href: "/xe?loai=xe-tai", line: "Thùng bạt, thùng kín, thùng lửng, ben, đông lạnh và gắn cẩu.", image: dongLanh, alt: "Xe tải Hyundai thùng đông lạnh màu trắng đỗ trong sân" },
  { category: "Xe chữa cháy", href: "/xe?loai=xe-chua-chay", line: "Bồn nước và foam từ 2,5 đến 6,5 khối, nền Dongfeng và Isuzu.", image: dongfeng65, alt: "Xe chữa cháy Dongfeng cabin đôi màu đỏ nhìn thẳng từ phía trước" },
  { category: "Xe cứu hộ", href: "/xe?loai=xe-cuu-ho", line: "Sàn trượt, nâng đầu và càng kéo; có loại lắp thêm cẩu.", image: cuuHoFront, alt: "Xe cứu hộ sàn trượt màu trắng có cần cẩu vàng, nhìn chéo phía trước" },
  { category: "Xe bồn / xe môi trường", href: "/xe?loai=xe-bon-moi-truong", line: "Bồn nước, hút chất thải, ép rác và quét đường.", image: fotonWaste, alt: "Xe hút chất thải Foton với bồn màu cam", pos: "70% 50%" },
];

// Ba xe đã có khối riêng trên trang: không lặp lại ở "Mẫu xe tiêu biểu".
const SHOWN_ELSEWHERE = new Set(["xe-tai-gan-cau", "xe-cuu-ho-san-truot", "xe-chua-chay-isuzu-4-khoi"]);

/** Sáu xe có ảnh, lấy lần lượt từng nhóm để không dồn một loại xe. */
function featuredVehicles(vehicles: Vehicle[], count = 6) {
  const pool = vehicles.filter((vehicle) => vehicle.images.length > 0 && !SHOWN_ELSEWHERE.has(vehicle.slug));
  const byCategory = new Map<string, Vehicle[]>();
  for (const vehicle of pool) byCategory.set(vehicle.category, [...(byCategory.get(vehicle.category) ?? []), vehicle]);
  const queues = [...byCategory.values()];
  const picked: Vehicle[] = [];
  while (picked.length < count && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked;
}

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
/* Chiều cao theo nội dung (hero vẫn đúng một màn hình). Kit ép mỗi section cao 1 màn hình nên các khối
   ngắn để trống 20-40% (khối gắn cẩu trống 41% ở 1440): trang trông thưa. Giống public.css của trang con. */
html[data-type] main > section.section:not(.hero),
html[data-type] footer.closing { height: auto; min-height: 0; }
html[data-type] main > section.section:not(.hero) { padding: var(--s-9) 0 calc(var(--s-9) + var(--bar)); }
html[data-type] main > section.section:not(.hero) > .wrap { height: auto; }
html[data-type] main > section.section:not(.hero) > .wrap:not(.grid) { display: block; }
@media (max-width: 639px) {
  html[data-type] main > section.section:not(.hero) { padding: var(--s-8) 0 calc(var(--s-8) + var(--bar)); }
}
ol.grid, ul.grid, .home-articles { list-style: none; margin: 0; padding: 0; }
/* hero: hai nút trên khung tối */
.hero--film .hero__over .btn-row { gap: var(--s-3); }
/* mẫu xe tiêu biểu: ba cột, hai cột trên tablet */
.home-models { row-gap: var(--s-7); }
.home-models .tile__media { --tile-ratio: 4 / 3; }
.home-models h3 { font: 500 var(--t-card)/1.3 var(--font-text); letter-spacing: -0.01em; }
.home-models .tile:hover h3 { text-decoration: underline; text-underline-offset: 3px; }
.home-models .clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
@media (min-width: 640px) and (max-width: 1023px) { .home-models > .span-4 { grid-column: span 6; } }
/* điện thoại: hai cột ảnh + tên (6 thẻ xếp một cột cao gần 3.000 px) */
@media (max-width: 639px) {
  .home-models { row-gap: var(--s-6); }
  .home-models > .span-4 { grid-column: span 6; }
  .home-models .tile { gap: var(--s-2); }
  .home-models h3 { font-size: 15px; line-height: 1.3; }
  .home-models .tile__facts { margin-top: 0; font-size: 13px; }
  .home-models .clamp { display: none; }
}
/* quy trình: bốn thẻ */
.home-steps > .card { gap: var(--s-3); }
.home-steps .step-num { margin-bottom: var(--s-3); }
@media (min-width: 640px) and (max-width: 1023px) { .home-steps > .span-3 { grid-column: span 6; } }
/* kiến thức: danh sách bài */
.home-articles { display: grid; }
.home-articles > li { border-bottom: 1px solid var(--line); }
.home-articles a { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s-2) var(--s-6); align-items: center; padding: var(--s-5) 0; }
.home-articles > li:first-child a { padding-top: 0; }
.home-articles h3 { font: 500 var(--t-card)/1.35 var(--font-text); letter-spacing: -0.01em; }
.home-articles a:hover h3 { color: var(--action); }
.home-articles p { grid-column: 1; color: var(--muted); font-size: var(--t-small); }
.home-articles .link { grid-column: 2; grid-row: 1 / span 2; white-space: nowrap; }
@media (max-width: 639px) { .home-articles a { grid-template-columns: minmax(0, 1fr); } .home-articles .link { grid-column: 1; grid-row: auto; justify-self: start; } }
/* liên hệ trong phần kết: ba cách liên lạc cạnh nút */
/* flex-wrap: ở 768 ba mục (email dài) không vừa một hàng thì xuống dòng thay vì tràn ngang */
.home-contact { display: flex; flex-wrap: wrap; gap: var(--s-5) var(--s-8); margin: 0; }
.home-contact > div { display: grid; gap: var(--s-2); min-width: 0; max-width: 100%; }
.home-contact dt { font-size: var(--t-small); color: var(--muted); }
.home-contact dd { margin: 0; font: var(--display-weight) var(--t-h3)/1.2 var(--font-display); letter-spacing: var(--display-tracking); }
.home-contact a:hover { text-decoration: underline; text-underline-offset: 4px; }
.home-contact dd { overflow-wrap: anywhere; }
@media (max-width: 639px) { .home-contact { flex-direction: column; gap: var(--s-4); } }

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

export function renderHome(vehicles: Vehicle[], fallback: Vehicle[], articles: Article[] = []) {
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
  const models = featuredVehicles(vehicles.length > 0 ? vehicles : fallback);
  const latest = articles.slice(0, 3);
  const navItem = (link: NavLink) => `<div class="nav__item"><a class="nav__link" href="${link.href}">${esc(link.label)}</a></div>`;
  const menuLink = (link: NavLink) => `<a href="${link.href}">${esc(link.label)}<span>${esc(link.line ?? "")}</span></a>`;

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
     moments: picture-develops (#cuu-ho). Nav và chân trang lấy từ app/components/site-nav.ts, giống các trang con. -->
<header class="nav">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Bỏ qua điều hướng</a>
    <a class="nav__logo" href="/" aria-current="page">Xe Chuyên Dụng</a>
    <nav class="nav__links" aria-label="Điều hướng chính">
      <div class="nav__item">
        <a class="nav__link" href="/xe">Dòng xe ${chev}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-3">
              <p class="t-label">Nhóm xe</p>
              ${navGroups.map(menuLink).join("\n              ")}
            </div>
            <div class="menu-col span-3">
              <p class="t-label">Mẫu xe</p>
              ${navModels.map(menuLink).join("\n              ")}
            </div>
            <a class="menu-card span-3 start-10" href="${href("xe-hut-chat-thai")}">
              <div class="panel">${img(fotonWaste, "Xe hút chất thải Foton 7 khối", "300px", "xe hút chất thải", ' class="frame__img" loading="lazy"')}</div>
              <span class="t-card">Xe hút chất thải 7 khối</span>
              <span class="t-small muted">Nền Foton, bồn thép</span>
            </a>
          </div>
        </div>
      </div>
      ${navLinks.map(navItem).join("\n      ")}
    </nav>
    <div class="nav__actions">
      <a class="nav__link" href="tel:${PHONE}">${PHONE_LABEL}</a>
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
            <div class="btn-row">
              <a class="btn btn--primary" href="${MAIN_HREF}">${MAIN_ACTION}${arrow}</a>
              <a class="btn btn--secondary" href="tel:${PHONE}">Gọi ${PHONE_LABEL}</a>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  </section>

  <section class="section" id="dong-xe" aria-labelledby="dong-xe-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <div><h2 id="dong-xe-h">Bốn nhóm xe. <span class="muted">Mỗi dòng có trang thông số riêng.</span></h2></div>
        <a class="link" href="/xe">Xem toàn bộ ${vehicles.length > 0 ? vehicles.length + " dòng xe" : "danh mục"}</a>
      </div>
      <div class="grid">
        ${groups
          .map(
            (group) => `<a class="tile tile--portrait span-3" href="${group.href}">
          <div class="tile__media">${img(group.image, group.alt, "(max-width: 639px) 520px, 1000px", group.category, ` loading="lazy"${"pos" in group ? ` style="object-position: ${group.pos}"` : ""}`)}</div>
          <div class="tile__head"><h3>${esc(group.category)}</h3><span class="tile__price">${count(group.category)} dòng</span></div>
          <p>${esc(group.line)}</p>
        </a>`,
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  ${
    models.length > 0
      ? `<section class="section ground-surface" id="mau-xe" aria-labelledby="mau-xe-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <div>
          <h2 id="mau-xe-h">Mẫu xe tiêu biểu</h2>
          <p>Ảnh và thông tin tham khảo của từng mẫu; cấu hình thực tế được xác nhận theo hồ sơ xe.</p>
        </div>
        <a class="link" href="/xe">So sánh trong danh mục</a>
      </div>
      <ul class="grid home-models">
        ${models
          .map(
            (vehicle) => `<li class="span-4"><a class="tile" href="/xe/${esc(vehicle.slug)}">
          <div class="tile__media">${imgPath(vehicle.images[0], vehicle.name, "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 420px", ' loading="lazy"')}</div>
          <div class="tile__head"><h3>${esc(vehicle.name)}</h3></div>
          <p class="tile__facts">${esc(vehicle.make)} · ${esc(vehicle.category)}</p>
          <p class="clamp">${esc(vehicle.description)}</p>
        </a></li>`,
          )
          .join("\n        ")}
      </ul>
    </div>
  </section>`
      : ""
  }

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

  <section class="section" id="thong-so" aria-labelledby="thong-so-h">
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

  <section class="section ground-surface" id="quy-trinh" aria-labelledby="quy-trinh-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <div>
          <h2 id="quy-trinh-h">Quy trình tư vấn bốn bước</h2>
          <p>Từ việc xe sẽ làm đến phương án xe cụ thể. Phạm vi dịch vụ được xác nhận với doanh nghiệp trước khi đặt mua.</p>
        </div>
        <a class="link" href="/dich-vu">Chi tiết dịch vụ</a>
      </div>
      <ol class="grid home-steps">
        ${serviceSteps
          .map((step, index) => `<li class="card span-3"><span class="step-num">${index + 1}</span><h3>${esc(step.title)}</h3><p>${esc(step.description)}</p></li>`)
          .join("\n        ")}
      </ol>
    </div>
  </section>

  ${
    latest.length > 0
      ? `<section class="section" id="kien-thuc" aria-labelledby="kien-thuc-h">
    <div class="wrap grid grid--top">
      <div class="span-4 section-head">
        <h2 id="kien-thuc-h">Kiến thức chọn xe</h2>
        <p>Câu hỏi nên chuẩn bị và thông tin cần kiểm tra trước khi xin báo giá.</p>
        <p><a class="link" href="/tin-tuc">Tất cả bài viết</a></p>
      </div>
      <ol class="home-articles span-7 start-6">
        ${latest
          .map(
            (article) => `<li><a href="/tin-tuc/${esc(article.slug)}"><h3>${esc(article.title)}</h3><p>${esc(article.category)} · ${esc(article.summary)}</p><span class="link">Đọc bài</span></a></li>`,
          )
          .join("\n        ")}
      </ol>
    </div>
  </section>`
      : ""
  }
</main>

<footer class="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">${MAIN_ACTION}</h2>
        <p>Ghi dòng xe, công việc và nơi xe chạy. Hai bên làm rõ cấu hình rồi mới xác nhận báo giá.</p>
      </div>
      <dl class="home-contact">
        <div><dt>Người liên hệ</dt><dd>${esc(CONTACT_NAME)}</dd></div>
        <div><dt>Điện thoại</dt><dd><a href="tel:${PHONE}">${PHONE_LABEL}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
      </dl>
      <a class="btn btn--primary btn--xl" href="${MAIN_HREF}">${MAIN_ACTION}${arrow}</a>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="/">Xe Chuyên Dụng</a>
          <p class="footer__lede">${esc(FOOTER_LEDE)}</p>
        </div>
        <div class="span-2 footer__col"><h3>Danh mục</h3><ul>${links(navGroups)}</ul></div>
        <div class="span-2 footer__col"><h3>Thông tin</h3><ul>${links(footerInfo)}</ul></div>
        <div class="span-2 footer__col"><h3>Pháp lý</h3><ul>${links(footerLegal)}</ul></div>
        <div class="span-2 footer__col"><h3>Liên hệ</h3><ul><li><span>${esc(CONTACT_NAME)}</span></li><li><a href="tel:${PHONE}">${PHONE_LABEL}</a></li><li><a href="mailto:${EMAIL}">Gửi email</a></li></ul></div>
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
