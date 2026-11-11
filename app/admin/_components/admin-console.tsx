"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { contactsChangedEvent, countNewContacts } from "../_lib/contact-stats";
import { roleLabels } from "../_lib/format";
import { AdminSessionProvider, useAdminSession } from "./session-context";
import { UiFeedbackProvider } from "./ui-feedback";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
  adminOnly?: boolean;
};

const navigation: { group: string; items: NavItem[] }[] = [
  {
    group: "TỔNG QUAN",
    items: [
      {
        href: "/admin",
        label: "Tổng quan",
        icon: "◫",
        description: "Theo dõi nhanh tình hình nội dung và hoạt động quản trị.",
      },
    ],
  },
  {
    group: "NỘI DUNG",
    items: [
      {
        href: "/admin/vehicles",
        label: "Xe",
        icon: "▰",
        description: "Quản lý danh mục xe và thông tin hiển thị trên website.",
      },
      {
        href: "/admin/articles",
        label: "Bài viết",
        icon: "▤",
        description: "Biên tập bài viết, chuyên mục và trạng thái xuất bản.",
      },
    ],
  },
  {
    group: "PHÁP LÝ",
    items: [
      {
        href: "/admin/policies",
        label: "Chính sách",
        icon: "§",
        description: "Quản lý chính sách áp dụng cho hoạt động vận tải.",
      },
      {
        href: "/admin/regulations",
        label: "Quy định",
        icon: "§",
        description: "Cập nhật quy định và văn bản pháp luật liên quan.",
      },
      {
        href: "/admin/legal-guides",
        label: "Tìm hiểu pháp lý",
        icon: "§",
        description: "Tổ chức nội dung hướng dẫn tìm hiểu pháp lý.",
      },
    ],
  },
  {
    group: "KHÁCH HÀNG & HỆ THỐNG",
    items: [
      {
        href: "/admin/contact-submissions",
        label: "Yêu cầu liên hệ",
        icon: "✉",
        description: "Tiếp nhận và theo dõi yêu cầu tư vấn từ khách hàng.",
      },
      {
        href: "/admin/activity",
        label: "Lịch sử hoạt động",
        icon: "◷",
        description: "Theo dõi các thao tác quản trị và thay đổi dữ liệu.",
      },
      {
        href: "/admin/users",
        label: "Tài khoản quản trị",
        icon: "☺",
        description: "Tạo tài khoản, phân vai trò, khóa hoặc đặt lại mật khẩu.",
        adminOnly: true,
      },
      {
        href: "/admin/account",
        label: "Đổi mật khẩu",
        icon: "⚿",
        description: "Đổi mật khẩu của bạn và đăng xuất khỏi các thiết bị khác.",
      },
    ],
  },
];

export function AdminConsole({ children }: { children: ReactNode }) {
  return (
    <AdminSessionProvider>
      <ConsoleLayout>{children}</ConsoleLayout>
    </AdminSessionProvider>
  );
}

/**
 * Số yêu cầu liên hệ ở trạng thái "Mới" cho huy hiệu sidebar. Tải lại khi đổi
 * trang, khi tab được focus lại và khi một phân hệ báo dữ liệu liên hệ đổi.
 */
function useNewContactCount() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(() => {
    countNewContacts()
      .then(setCount)
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener(contactsChangedEvent, refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(contactsChangedEvent, refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return count;
}

function ConsoleLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAdminSession();
  const newContacts = useNewContactCount();
  const allItems = navigation.flatMap((group) => group.items);
  const current =
    allItems.find((item) => item.href === pathname) ?? allItems[0];
  const isOverview = current.href === "/admin";

  return (
    <main className="admin-shell">
      <UiFeedbackProvider>
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand-mark">XD</span>
          <span>
            <strong>XE CHUYÊN DỤNG</strong>
            <small>KHÔNG GIAN QUẢN TRỊ</small>
          </span>
        </Link>
        <nav className="admin-navigation" aria-label="Điều hướng quản trị">
          {navigation.map(({ group, items }) => (
            <div className="admin-navigation-group" key={group}>
              <span className="admin-navigation-label">{group}</span>
              {items
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => {
                  const active = item.href === current.href;
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={active ? "active" : ""}
                      href={item.href}
                      key={item.href}
                    >
                      <span className="admin-nav-icon">{item.icon}</span>
                      {item.label}
                      {item.href === "/admin/contact-submissions" && newContacts ? (
                        <small
                          aria-label={`${newContacts} yêu cầu mới`}
                          className="admin-nav-badge"
                        >
                          {newContacts > 99 ? "99+" : newContacts}
                        </small>
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-avatar">
            {user.displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="admin-user">
            <strong>{user.displayName}</strong>
            <small>{roleLabels[user.role]}</small>
          </span>
          <button
            aria-label="Đăng xuất"
            className="admin-logout"
            onClick={() => void logout()}
            title="Đăng xuất"
            type="button"
          >
            ↪
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">
              {isOverview ? "TRUNG TÂM ĐIỀU HÀNH" : "QUẢN LÝ"}
            </span>
            <h1>{current.label}</h1>
            <p className="admin-subtitle">{current.description}</p>
          </div>
          <span className="admin-topbar-date">
            Xin chào, {user.displayName}
          </span>
        </header>
        <div className="admin-content">{children}</div>
      </div>
      </UiFeedbackProvider>
    </main>
  );
}
