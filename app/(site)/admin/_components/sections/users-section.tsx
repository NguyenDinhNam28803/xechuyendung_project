"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { formatDate, roleLabels } from "../../_lib/format";
import type { AdminRole, AdminUser, PageResponse } from "../../_lib/types";
import { useUnsavedChangesWarning } from "../../_lib/use-entity-editor";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { Drawer } from "../drawer";
import { useAdminSession } from "../session-context";
import {
  EmptyRow,
  Feedback,
  Field,
  FormActions,
  FormError,
  ListControls,
  Pagination,
  SearchBox,
  Toolbar,
} from "../ui";
import { useUiFeedback } from "../ui-feedback";

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
    return <Feedback isError message="Chỉ quản trị viên mới có quyền quản lý tài khoản." />;
  }
  return <UsersManager />;
}

function UsersManager() {
  const { user: currentUser } = useAdminSession();
  const { toast, confirm, prompt } = useUiFeedback();
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<AdminUser>>(`/users?${apiQuery({ page, limit: 25, q: search })}`),
    [],
  );
  const list = usePagedList(loader);
  const [form, setFormState] = useState<CreateForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useUnsavedChangesWarning(form !== null && dirty);

  function setForm(next: CreateForm) {
    setFormState(next);
    setDirty(true);
  }

  async function closeForm() {
    if (
      dirty &&
      !(await confirm({
        title: "Bỏ tài khoản đang tạo?",
        confirmLabel: "Bỏ thay đổi",
        cancelLabel: "Tiếp tục",
        danger: true,
      }))
    ) {
      return;
    }
    setFormState(null);
    setDirty(false);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      await adminFetch("/users", { method: "POST", body: jsonBody(form) });
      setFormState(null);
      setDirty(false);
      await list.reload();
      toast("Đã tạo tài khoản. Hãy gửi mật khẩu tạm qua kênh an toàn và yêu cầu đổi ngay.");
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function update(target: AdminUser, change: Record<string, unknown>, success: string) {
    try {
      await adminFetch(`/users/${target.id}`, { method: "PATCH", body: jsonBody(change) });
      await list.reload();
      toast(success);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function changeRole(target: AdminUser, role: AdminRole) {
    const accepted = await confirm({
      title: `Đổi vai trò của ${target.username}?`,
      message: `Tài khoản sẽ thành "${roleLabels[role]}" và phải đăng nhập lại trên mọi thiết bị.`,
      confirmLabel: "Đổi vai trò",
    });
    if (!accepted) return;
    await update(target, { role }, `Đã đổi vai trò của ${target.username}; tài khoản cần đăng nhập lại.`);
  }

  async function toggleActive(target: AdminUser) {
    if (target.isActive) {
      const accepted = await confirm({
        title: `Khóa tài khoản ${target.username}?`,
        message: "Mọi phiên đăng nhập của tài khoản này sẽ bị đăng xuất ngay.",
        confirmLabel: "Khóa tài khoản",
        danger: true,
      });
      if (!accepted) return;
    }
    await update(
      target,
      { isActive: !target.isActive },
      target.isActive
        ? `Đã khóa ${target.username} và đăng xuất mọi phiên.`
        : `Đã mở khóa ${target.username}.`,
    );
  }

  async function resetPassword(target: AdminUser) {
    const password = await prompt({
      title: `Đặt lại mật khẩu cho ${target.username}`,
      message: "Mọi phiên đăng nhập của tài khoản này sẽ bị đăng xuất.",
      label: "Mật khẩu mới (tối thiểu 12 ký tự)",
      type: "password",
      minLength: 12,
      maxLength: 200,
      autoComplete: "new-password",
      confirmLabel: "Đặt lại mật khẩu",
    });
    if (!password) return;
    await update(target, { password }, `Đã đặt lại mật khẩu cho ${target.username}.`);
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Tài khoản quản trị">
        <button
          className="admin-primary-button"
          onClick={() => {
            setFormState({ ...emptyForm });
            setDirty(false);
            setFormError("");
          }}
          type="button"
        >
          + Tạo tài khoản
        </button>
      </Toolbar>
      <Feedback message={list.error} isError />
      <ListControls>
        <SearchBox
          label="Tìm tài khoản"
          value={list.search}
          onChange={list.setSearch}
          placeholder="Tên đăng nhập hoặc tên hiển thị..."
        />
      </ListControls>
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
                        onChange={(event) => void changeRole(account, event.target.value as AdminRole)}
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
                          onClick={() => void resetPassword(account)}
                          type="button"
                        >
                          Đặt lại mật khẩu
                        </button>
                        {!isSelf && (
                          <button
                            className={`admin-table-button${account.isActive ? " admin-table-danger" : ""}`}
                            onClick={() => void toggleActive(account)}
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
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />

      {form && (
        <Drawer
          eyebrow="TÀI KHOẢN"
          footer={
            <FormActions
              dirty={dirty}
              onCancel={() => void closeForm()}
              saveLabel="Tạo tài khoản"
              saving={saving}
            />
          }
          onRequestClose={() => void closeForm()}
          onSubmit={(event) => void create(event)}
          title="Tạo tài khoản quản trị"
        >
          <p className="admin-form-note">
            Biên tập viên quản lý nội dung và yêu cầu liên hệ. Quản trị viên có thêm quyền quản lý
            tài khoản. Mỗi người nên dùng một tài khoản riêng để lịch sử hoạt động phản ánh đúng
            người thực hiện.
          </p>
          <FormError message={formError} />
          <div className="admin-form-grid admin-form-grid-single">
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
        </Drawer>
      )}
    </>
  );
}
