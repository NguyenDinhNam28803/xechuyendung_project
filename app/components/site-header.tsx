"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { MAIN_ACTION, MAIN_HREF, PHONE, PHONE_LABEL } from "./site-constants";

/*
 * Thanh điều hướng theo kit (nav-mega, giống trang chủ): menu rê chuột trên máy tính là CSS của kit;
 * component này làm phần system.js làm ở trang chủ: tấm menu toàn màn hình trên điện thoại,
 * accordion, phím Escape, aria-expanded, và đóng tấm menu sau khi bấm một liên kết.
 */

const groups = [
  { href: "/xe?loai=xe-tai", label: "Xe tải", line: "Chở hàng, gắn cẩu, đông lạnh" },
  { href: "/xe?loai=xe-chua-chay", label: "Xe chữa cháy", line: "Bồn nước và foam" },
  { href: "/xe?loai=xe-cuu-ho", label: "Xe cứu hộ", line: "Sàn trượt, càng kéo" },
  { href: "/xe?loai=xe-bon-moi-truong", label: "Xe môi trường", line: "Bồn nước, hút, ép, quét" },
];

const models = [
  { href: "/xe/xe-tai-gan-cau", label: "FAW JH6 gắn cẩu", line: "Cẩu Soosan 15 tấn, 8×4" },
  { href: "/xe/xe-chua-chay-isuzu-4-khoi", label: "Isuzu 4 khối", line: "Nước 3,5 m³, foam 0,5 m³" },
  { href: "/xe/xe-cuu-ho-san-truot", label: "Cứu hộ sàn trượt", line: "Cẩu, tời và càng kéo" },
];

const links = [
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/tu-van-mua-xe", label: "Tư vấn mua xe" },
  { href: "/tin-tuc", label: "Kiến thức" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

function isCurrent(current: string | undefined, href: string) {
  return current === href;
}

const Chev = () => (
  <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** current: mục điều hướng của trang đang xem ("/xe", "/dich-vu"...). Truyền từ trang thay vì
 * usePathname() để header prerender tĩnh được ở cả route động. */
export default function SiteHeader({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setExpanded(false);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-locked", open);
    return () => document.body.classList.remove("nav-locked");
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (open) {
        close();
        toggle.current?.focus();
      } else if (nav.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onWide = (event: MediaQueryListEvent) => event.matches && close();
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWide);
    };
  }, [open, close]);

  // Bấm bất kỳ liên kết nào trong tấm menu đang mở thì đóng nó.
  const onNavClick = (event: MouseEvent<HTMLElement>) => {
    if (open && (event.target as HTMLElement).closest("a[href]")) close();
  };

  const vehiclesCurrent = isCurrent(current, "/xe");

  return (
    <header className={open ? "nav is-open" : "nav"} ref={nav} onClick={onNavClick}>
      <div className="wrap nav__bar">
        <a className="skip-link" href="#noi-dung">Bỏ qua điều hướng</a>
        <Link className="nav__logo" href="/">Xe Chuyên Dụng</Link>
        <nav className="nav__links" aria-label="Điều hướng chính">
          <div className={expanded ? "nav__item is-expanded" : "nav__item"}>
            <Link className="nav__link" href="/xe" aria-current={vehiclesCurrent ? "page" : undefined}>
              Dòng xe <Chev />
            </Link>
            <button
              className="nav__expand"
              type="button"
              aria-label="Hiện các liên kết Dòng xe"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="nav__menu">
              <div className="wrap grid">
                <div className="menu-col span-3">
                  <p className="t-label">Nhóm xe</p>
                  {groups.map((group) => (
                    <Link href={group.href} key={group.href}>{group.label}<span>{group.line}</span></Link>
                  ))}
                </div>
                <div className="menu-col span-3">
                  <p className="t-label">Mẫu xe</p>
                  {models.map((model) => (
                    <Link href={model.href} key={model.href}>{model.label}<span>{model.line}</span></Link>
                  ))}
                </div>
                <div className="menu-col span-3 start-10">
                  <p className="t-label">Toàn bộ danh mục</p>
                  <Link href="/xe">Danh mục xe<span>Lọc theo nhóm, tìm theo tên, so sánh tối đa 3 xe</span></Link>
                </div>
              </div>
            </div>
          </div>
          {links.map((link) => (
            <div className="nav__item" key={link.href}>
              <Link className="nav__link" href={link.href} aria-current={isCurrent(current, link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            </div>
          ))}
        </nav>
        <div className="nav__actions">
          <a className="nav__link" href={`tel:${PHONE}`}>{PHONE_LABEL}</a>
          <Link className="btn btn--primary" href={MAIN_HREF}>{MAIN_ACTION}</Link>
        </div>
        <button
          className="nav__toggle"
          type="button"
          aria-expanded={open}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          ref={toggle}
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>
    </header>
  );
}
