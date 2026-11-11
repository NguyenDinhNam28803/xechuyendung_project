"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { formatDate, roleLabels } from "../../_lib/format";
import type { AdminRole, AdminUser, PageResponse } from "../../_lib/types";
import { useFeedback, usePagedList } from "../../_lib/use-paged-list";
import { useAdminSession } from "../session-context";
import { EmptyRow, Feedback, Field, FormActions, Pagination, SearchBox, Toolbar } from "../ui";

type CreateForm = {
  username: string;
  displayName: string;
  password: string;
  role: AdminRole;
};

const emptyForm: CreateForm = {
  username: "",
  displayName: "",
  password: "",
  role: "editor",
};

export function UsersSection() {
  const { isAdmin } = useAdminSession();
  if (!isAdmin) {
    return (
      <Feedback isError message="Chỉ quản trị viên mới có quyền quản lý tài khoản." />
    );
  }
  return <UsersManager />;
}

function UsersManager() {
  const { user: currentUser } = useAdminSession();
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<AdminUser>>(
        `/users?${new URLSearchParams({ page: String(page), limit: "25", q: search })}`,
      ),
    [],
  );
  const list = usePagedList(loader);
  const feedback = useFeedback();
  const [form, setForm] = useState<CreateForm | null>(null);
  const [saving, setSaving] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await adminFetch("/users", { method: "POST", body: jsonBody(form) });
      setForm(null);
      await list.reload();
      feedback.show("Đã tạo tài khoản. Hãy gửi mật khẩu tạm qua kênh an toàn và yêu cầu đổi ngay.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  async function update(target: AdminUser, change: Record<string, unknown>, success: string) {
    try {
      await adminFetch(`/users/${target.id}`, { method: "PATCH", body: jsonBody(change) });
      await list.reload();
      feedback.show(success);
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  function resetPassword(target: AdminUser) {
    const password = window.prompt(
      `Mật khẩu mới cho ${target.username} (tối thiểu 12 ký tự). Mọi phiên đăng nhập của tài khoản này sẽ bị đăng xuất.`,
    );
    if (!password) return;
    void update(target, { password }, `Đã đặt lại mật khẩu cho ${target.username}.`);
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Tài khoản quản trị">
        <button
          className="admin-primary-button"
          onClick={() => setForm({ ...emptyForm })}
          type="button"
        >
          + Tạo tài khoản
        </button>
      </Toolbar>
      <Feedback message={feedback.message} isError={feedback.isError} />
      <Feedback message={list.error} isError />
      <SearchBox
        label="Tìm tài khoản"
        value={list.search}
        onChange={list.setSearch}
        placeholder="Tên đăng nhập hoặc tên hiển thị..."
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
      <div className="admin-workspace">
        {form && (
          <section className="admin-card admin-editor">
            <form onSubmit={create}>
              <h2>Tạo tài khoản quản trị</h2>
              <p className="admin-form-note">
                Biên tập viên quản lý nội dung và yêu cầu liên hệ. Quản trị viên có thêm
                quyền quản lý tài khoản. Mỗi người nên dùng một tài khoản riêng để lịch
                sử hoạt động phản ánh đúng người thực hiện.
              </p>
              <div className="admin-form-grid">
                <Field
                  form={form}
                  name="username"
                  label="Tên đăng nhập"
                  onChange={setForm}
                  required
                  maxLength={60}
                  autoComplete="off"
                  placeholder="chữ, số, dấu chấm, gạch dưới"
                />
                <Field form={form} name="displayName" label="Tên hiển thị" onChange={setForm} required maxLength={120} />
                <Field
                  form={form}
                  name="password"
                  label="Mật khẩu tạm (≥ 12 ký tự)"
                  onChange={setForm}
                  required
                  minLength={12}
                  maxLength={200}
                  type="password"
                  autoComplete="new-password"
                />
                <label>
                  Vai trò
                  <select
                    onChange={(event) => setForm({ ...form, role: event.target.value as AdminRole })}
                    value={form.role}
                  >
                    <option value="editor">{roleLabels.editor}</option>
                    <option value="admin">{roleLabels.admin}</option>
                  </select>
                </label>
              </div>
              <FormActions saving={saving} saveLabel="Tạo tài khoản" onCancel={() => setForm(null)} />
            </form>
          </section>
        )}
        <section className="admin-card admin-list">
          <div className="admin-list-heading">
            <h2>Tài khoản</h2>
            <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} tài khoản`}</span>
          </div>
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((account) => {
                  const isSelf = account.id === currentUser.id;
                  return (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.displayName}</strong>
                        <small>
                          {account.username}
                          {isSelf ? " · bạn" : ""}
                        </small>
                      </td>
                      <td>
                        <select
                          aria-label={`Vai trò của ${account.username}`}
                          disabled={isSelf}
                          onChange={(event) =>
                            void update(
                              account,
                              { role: event.target.value },
                              `Đã đổi vai trò của ${account.username}; tài khoản cần đăng nhập lại.`,
                            )
                          }
                          value={account.role}
                        >
                          <option value="editor">{roleLabels.editor}</option>
                          <option value="admin">{roleLabels.admin}</option>
                        </select>
                      </td>
                      <td>
                        <span className={`admin-table-status ${account.isActive ? "is-published" : ""}`}>
                          {account.isActive ? "Đang hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td>{formatDate(account.lastLoginAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-table-button"
                            onClick={() => resetPassword(account)}
                            type="button"
                          >
                            Đặt lại mật khẩu
                          </button>
                          {!isSelf && (
                            <button
                              className={`admin-table-button${account.isActive ? " admin-table-danger" : ""}`}
                              onClick={() =>
                                void update(
                                  account,
                                  { isActive: !account.isActive },
                                  account.isActive
                                    ? `Đã khóa ${account.username} và đăng xuất mọi phiên.`
                                    : `Đã mở khóa ${account.username}.`,
                                )
                              }
                              type="button"
                            >
                              {account.isActive ? "Khóa" : "Mở khóa"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!list.loading && list.items.length === 0 && (
                  <EmptyRow colSpan={5}>Không có tài khoản phù hợp.</EmptyRow>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
