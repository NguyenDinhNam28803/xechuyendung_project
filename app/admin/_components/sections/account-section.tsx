"use client";

import { useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { roleLabels } from "../../_lib/format";
import { useFeedback } from "../../_lib/use-paged-list";
import { useAdminSession } from "../session-context";
import { Feedback, Field } from "../ui";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function AccountSection() {
  const { user } = useAdminSession();
  const feedback = useFeedback();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      feedback.show("Mật khẩu xác nhận không khớp.", true);
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/account/password", {
        method: "POST",
        body: jsonBody({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      setForm(emptyForm);
      feedback.show("Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card admin-editor admin-account">
      <form onSubmit={submit}>
        <h2>Đổi mật khẩu</h2>
        <p className="admin-form-note">
          Bạn đang đăng nhập là <strong>{user.username}</strong> ({roleLabels[user.role]}).
          Mật khẩu mới cần tối thiểu 12 ký tự. Sau khi đổi, phiên hiện tại được giữ
          lại, mọi phiên khác bị thu hồi.
        </p>
        <Feedback message={feedback.message} isError={feedback.isError} />
        <div className="admin-form-grid">
          <Field
            form={form}
            name="currentPassword"
            label="Mật khẩu hiện tại"
            onChange={setForm}
            required
            type="password"
            autoComplete="current-password"
            fullWidth
          />
          <Field
            form={form}
            name="newPassword"
            label="Mật khẩu mới"
            onChange={setForm}
            required
            minLength={12}
            maxLength={200}
            type="password"
            autoComplete="new-password"
          />
          <Field
            form={form}
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            onChange={setForm}
            required
            minLength={12}
            maxLength={200}
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div className="admin-form-actions">
          <button className="admin-primary-button" disabled={saving} type="submit">
            {saving ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </section>
  );
}
