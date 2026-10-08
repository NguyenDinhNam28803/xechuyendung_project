import Link from "next/link";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 8.2c0 4.1-6 9-6 9s-6-4.9-6-9a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/xe", label: "Danh mục xe" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/tu-van-mua-xe", label: "Tư vấn mua xe" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/tin-tuc", label: "Tin tức" },
];

export default function SiteHeader() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">
            XE CHUYÊN DỤNG <i /> ĐỒNG HÀNH CÙNG DOANH NGHIỆP VIỆT
          </span>
          <div className="topbar-info">
            <span><PinIcon /> Tư vấn và hỗ trợ khách hàng toàn quốc</span>
            <Link href="/lien-he">Trao đổi với chuyên viên <ArrowIcon /></Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Xe Chuyên Dụng, trang chủ">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">XECHUYENDUNG<span>.VN</span><small>GIẢI PHÁP VẬN TẢI</small></span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-contact" href="/lien-he">Nhận tư vấn <ArrowIcon /></Link>
      </header>
    </>
  );
}
