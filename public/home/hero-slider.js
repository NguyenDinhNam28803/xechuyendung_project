/*
 * Banner trình chiếu của trang chủ (markup: app/_home/document.ts, CSS: pageCss ".hs").
 * - Tự chuyển xe mỗi data-interval ms (3000), ảnh hiện dần; thẻ bên phải đổi theo, link tới /xe/<slug>.
 * - Dừng khi: người dùng bấm tạm dừng, rê chuột hoặc focus trong banner, tab bị ẩn, hoặc hệ điều
 *   hành bật giảm chuyển động (khi đó chỉ chuyển bằng nút). Nút tạm dừng là bắt buộc (WCAG 2.2.2).
 * - Nút trước/sau, phím mũi tên khi focus trong thẻ, vuốt ngang trên điện thoại.
 * - Tải trước ảnh của slide kế tiếp để không lộ khung trống khi chuyển.
 */
(() => {
  const root = document.getElementById("hero-slides");
  const card = document.querySelector(".hs-card");
  if (!root || !card) return;
  const slides = [...root.querySelectorAll(".hs__slide")];
  if (slides.length < 2) return;

  const hero = root.closest(".hero") ?? root;
  const infos = [...card.querySelectorAll(".hs-card__info")];
  const live = card.querySelector(".hs-card__live");
  const count = card.querySelector("[data-hs-count]");
  const more = card.querySelector("[data-hs-more]");
  const toggle = card.querySelector("[data-hs-toggle]");
  const iconPause = toggle?.querySelector("[data-icon-pause]");
  const iconPlay = toggle?.querySelector("[data-icon-play]");
  const ms = Number(root.dataset.interval) || 3000;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.classList.add("hs-js");
  card.style.setProperty("--hs-ms", `${ms}ms`);

  let index = 0;
  let timer = 0;
  let userPaused = reduce.matches;
  let hovering = false;
  let focused = false;

  const running = () => !userPaused && !hovering && !focused && !document.hidden;

  const warm = (k) => {
    const image = slides[(k + slides.length) % slides.length].querySelector("img");
    if (image && image.loading === "lazy") image.loading = "eager";
  };

  function restartBar() {
    card.classList.remove("is-playing");
    void card.offsetWidth; // chạy lại animation thanh 3 giây từ đầu
    if (running()) card.classList.add("is-playing");
  }

  function schedule() {
    window.clearTimeout(timer);
    restartBar();
    live?.setAttribute("aria-live", running() ? "off" : "polite");
    if (running()) timer = window.setTimeout(() => show(index + 1), ms);
  }

  function show(k) {
    index = (k + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const on = n === index;
      slide.classList.toggle("is-on", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    infos.forEach((info, n) => { info.hidden = n !== index; });
    // nút "Xem chi tiết xe" luôn trỏ tới xe đang hiển thị
    const link = infos[index]?.querySelector(".hs-card__name a");
    if (more && link) {
      more.setAttribute("href", link.getAttribute("href") ?? "/xe");
      more.setAttribute("aria-label", `Xem chi tiết ${link.textContent.trim()}`);
    }
    if (count) count.textContent = String(index + 1);
    warm(index + 1);
    schedule();
  }

  function setPaused(paused) {
    userPaused = paused;
    toggle?.setAttribute("aria-label", paused ? "Tiếp tục trình chiếu" : "Tạm dừng trình chiếu");
    if (iconPause) iconPause.hidden = paused;
    if (iconPlay) iconPlay.hidden = !paused;
    schedule();
  }

  card.querySelector("[data-hs-prev]")?.addEventListener("click", () => show(index - 1));
  card.querySelector("[data-hs-next]")?.addEventListener("click", () => show(index + 1));
  toggle?.addEventListener("click", () => setPaused(!userPaused));
  card.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
  });

  // Chỉ dừng khi chuột nằm trên thẻ thông tin (đang đọc): banner gần kín màn hình, dừng theo cả banner
  // thì trên máy tính slider gần như không bao giờ chạy.
  card.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") { hovering = true; schedule(); } });
  card.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") { hovering = false; schedule(); } });
  // Dừng khi focus bằng bàn phím trong banner; bấm nút bằng chuột thì không (nút giữ focus sau khi bấm).
  hero.addEventListener("focusin", (event) => {
    focused = event.target instanceof Element && event.target.matches(":focus-visible");
    schedule();
  });
  hero.addEventListener("focusout", (event) => { if (!hero.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener("visibilitychange", schedule);
  reduce.addEventListener?.("change", (event) => setPaused(event.matches || userPaused));

  // vuốt ngang trên màn hình cảm ứng
  let startX = 0;
  let startY = 0;
  root.parentElement?.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  root.parentElement?.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  setPaused(userPaused);
  warm(1);
})();
