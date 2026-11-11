"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

/**
 * Panel trượt từ bên phải dùng <dialog> gốc: có focus trap, Esc và nền mờ sẵn
 * có của trình duyệt; toàn màn hình trên mobile. Esc hoặc bấm ra nền gọi
 * onRequestClose để nơi dùng quyết định (ví dụ hỏi khi còn thay đổi chưa lưu).
 */
export function Drawer({
  title,
  eyebrow,
  onRequestClose,
  children,
  footer,
  wide,
  onSubmit,
}: {
  title: string;
  eyebrow?: string;
  onRequestClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Có onSubmit: thân và footer nằm trong cùng <form> (nút submit ở footer). */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = (
    <>
      <div className="admin-drawer-body">{children}</div>
      {footer && <footer className="admin-drawer-footer">{footer}</footer>}
    </>
  );

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      aria-labelledby="admin-drawer-title"
      className={`admin-drawer${wide ? " admin-drawer-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={(event) => {
        // Bấm vào vùng nền (chính phần tử dialog, ngoài panel) để đóng.
        if (event.target === event.currentTarget) onRequestClose();
      }}
      ref={ref}
    >
      <div className="admin-drawer-panel">
        <header className="admin-drawer-header">
          <div>
            {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
            <h2 id="admin-drawer-title">{title}</h2>
          </div>
          <button
            aria-label="Đóng"
            className="admin-detail-close"
            onClick={onRequestClose}
            type="button"
          >
            ×
          </button>
        </header>
        {onSubmit ? (
          <form className="admin-drawer-form" onSubmit={onSubmit}>
            {content}
          </form>
        ) : (
          <div className="admin-drawer-form">{content}</div>
        )}
      </div>
    </dialog>
  );
}
