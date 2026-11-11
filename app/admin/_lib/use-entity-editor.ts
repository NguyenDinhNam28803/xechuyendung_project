"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useUiFeedback } from "../_components/ui-feedback";
import { adminFetch, errorMessage, jsonBody } from "./admin-api";

type EditorOptions<Item, Form> = {
  /** Đường dẫn collection, ví dụ "/vehicles". */
  basePath: string;
  emptyForm: () => Form;
  toForm: (item: Item) => Form;
  /** Ném Error với thông điệp tiếng Việt nếu form chưa hợp lệ. */
  toPayload: (form: Form) => unknown;
  onSaved: () => Promise<void> | void;
  savedMessage: string;
  deletedMessage: string;
};

/**
 * Trạng thái tạo/sửa/xóa dùng chung cho các phân hệ nội dung: mở drawer, theo
 * dõi thay đổi chưa lưu (hỏi trước khi đóng, cảnh báo khi rời trang), gửi
 * POST/PATCH/DELETE và báo kết quả bằng toast.
 */
export function useEntityEditor<Item extends { id: string }, Form>(
  options: EditorOptions<Item, Form>,
) {
  const { toast, confirm } = useUiFeedback();
  const [form, setFormState] = useState<Form | null>(null);
  const [editingId, setEditingId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useUnsavedChangesWarning(form !== null && dirty);

  const setForm = useCallback((next: Form) => {
    setFormState(next);
    setDirty(true);
  }, []);

  function open(id: string, next: Form) {
    setEditingId(id);
    setFormState(next);
    setDirty(false);
    setError("");
  }

  const openCreate = () => open("", options.emptyForm());
  const openEdit = (item: Item) => open(item.id, options.toForm(item));

  async function requestClose() {
    if (
      dirty &&
      !(await confirm({
        title: "Bỏ thay đổi chưa lưu?",
        message: "Các thay đổi trong form sẽ bị mất.",
        confirmLabel: "Bỏ thay đổi",
        cancelLabel: "Tiếp tục sửa",
        danger: true,
      }))
    ) {
      return;
    }
    setFormState(null);
    setDirty(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || saving) return;
    let payload: unknown;
    try {
      payload = options.toPayload(form);
    } catch (validationError) {
      setError(errorMessage(validationError));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminFetch(editingId ? `${options.basePath}/${editingId}` : options.basePath, {
        method: editingId ? "PATCH" : "POST",
        body: jsonBody(payload),
      });
      setFormState(null);
      setDirty(false);
      await options.onSaved();
      toast(options.savedMessage);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item, label: string) {
    const accepted = await confirm({
      title: `Xóa "${label}"?`,
      message: "Thao tác này không thể hoàn tác.",
      confirmLabel: "Xóa",
      danger: true,
    });
    if (!accepted) return;
    try {
      await adminFetch(`${options.basePath}/${item.id}`, { method: "DELETE" });
      if (editingId === item.id) {
        setFormState(null);
        setDirty(false);
      }
      await options.onSaved();
      toast(options.deletedMessage);
    } catch (deleteError) {
      toast(errorMessage(deleteError), "error");
    }
  }

  return {
    form,
    setForm,
    editingId,
    isEditing: editingId !== "",
    dirty,
    saving,
    error,
    openCreate,
    openEdit,
    requestClose,
    submit,
    remove,
  };
}

/** Cảnh báo của trình duyệt khi tải lại/đóng tab lúc còn thay đổi chưa lưu. */
export function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);
}
