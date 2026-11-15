"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Các dòng đang được chọn trong bảng. Chỉ giữ những id còn hiển thị: đổi
 * trang, lọc hoặc tải lại làm các dòng đã khuất tự bỏ chọn, nên thao tác hàng
 * loạt không bao giờ áp dụng lên mục người dùng không nhìn thấy.
 */
export function useSelection(visibleIds: readonly string[]) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set());
  const visibleKey = visibleIds.join(",");

  const selected = useMemo(() => {
    const visible = new Set(visibleKey ? visibleKey.split(",") : []);
    return new Set([...picked].filter((id) => visible.has(id)));
  }, [picked, visibleKey]);

  const toggle = useCallback((id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length;

  const toggleAll = useCallback(() => {
    setPicked(allSelected ? new Set() : new Set(visibleKey ? visibleKey.split(",") : []));
  }, [allSelected, visibleKey]);

  const clear = useCallback(() => setPicked(new Set()), []);

  return {
    selected,
    ids: [...selected],
    count: selected.size,
    allSelected,
    someSelected: selected.size > 0 && !allSelected,
    toggle,
    toggleAll,
    clear,
  };
}

export type Selection = ReturnType<typeof useSelection>;
