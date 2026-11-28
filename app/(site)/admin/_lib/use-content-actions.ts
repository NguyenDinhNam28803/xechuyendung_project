"use client";

import { useState } from "react";
import { useUiFeedback } from "../_components/ui-feedback";
import { adminFetch, errorMessage, jsonBody } from "./admin-api";
import type { BulkAction, BulkResult } from "./types";

const actionText: Record<BulkAction, { verb: string; done: string }> = {
  publish: { verb: "Xuất bản", done: "xuất bản" },
  unpublish: { verb: "Chuyển về nháp", done: "chuyển về nháp" },
  delete: { verb: "Xóa", done: "xóa" },
};

/**
 * Thao tác trên nội dung có trạng thái xuất bản: bật/tắt công khai ngay trên
 * dòng (cập nhật lạc quan, hoàn tác khi lỗi) và thao tác hàng loạt qua
 * POST {basePath}/bulk.
 */
export function useContentActions<T extends { id: string; isPublished: boolean }>({
  basePath,
  noun,
  updateItem,
  reload,
  onBulkDone,
}: {
  basePath: string;
  /** Danh từ hiển thị, ví dụ "xe", "bài viết". */
  noun: string;
  updateItem: (match: (item: T) => boolean, patch: (item: T) => T) => () => void;
  reload: () => Promise<void> | void;
  onBulkDone?: () => void;
}) {
  const { toast, confirm } = useUiFeedback();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [bulkRunning, setBulkRunning] = useState(false);

  async function togglePublished(item: T) {
    const next = !item.isPublished;
    const undo = updateItem(
      (candidate) => candidate.id === item.id,
      (candidate) => ({ ...candidate, isPublished: next }),
    );
    setPendingIds((current) => new Set(current).add(item.id));
    try {
      await adminFetch(`${basePath}/${item.id}`, {
        method: "PATCH",
        body: jsonBody({ isPublished: next }),
      });
      toast(next ? `Đã xuất bản ${noun}.` : `Đã chuyển ${noun} về nháp.`);
    } catch (error) {
      undo();
      toast(errorMessage(error), "error");
    } finally {
      setPendingIds((current) => {
        const copy = new Set(current);
        copy.delete(item.id);
        return copy;
      });
    }
  }

  async function runBulk(action: BulkAction, ids: string[]) {
    if (ids.length === 0) return;
    const text = actionText[action];
    const accepted = await confirm({
      title: `${text.verb} ${ids.length} ${noun}?`,
      message:
        action === "delete"
          ? `${ids.length} ${noun} sẽ bị xóa vĩnh viễn và không thể khôi phục.`
          : `Áp dụng cho ${ids.length} ${noun} đã chọn. Mục đã ở trạng thái này được giữ nguyên.`,
      confirmLabel: text.verb,
      danger: action === "delete",
    });
    if (!accepted) return;
    setBulkRunning(true);
    try {
      const result = await adminFetch<BulkResult>(`${basePath}/bulk`, {
        method: "POST",
        body: jsonBody({ ids, action }),
      });
      const skipped = result.requested - result.affected;
      toast(
        `Đã ${text.done} ${result.affected} ${noun}` +
          (skipped > 0 ? ` (${skipped} mục không cần thay đổi).` : "."),
      );
      onBulkDone?.();
      await reload();
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setBulkRunning(false);
    }
  }

  return {
    togglePublished,
    isPending: (id: string) => pendingIds.has(id),
    runBulk,
    bulkRunning,
  };
}
