"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationLink = {
  href: string;
  label: string;
};

export default function SiteNavigation({ links }: { links: NavigationLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Điều hướng chính">
      {links.map((link) => {
        const isCurrentSection =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            aria-current={pathname === link.href ? "page" : undefined}
            className={isCurrentSection ? "nav-active" : undefined}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
