"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "./admin-api";
import { emptyPageInfo, type PageInfo, type PageResponse } from "./types";

export type PagedLoader<T> = (
  page: number,
  search: string,
) => Promise<PageResponse<T>>;

/**
 * Trạng thái của một danh sách phân trang phía server: trang hiện tại, từ
 * khóa tìm kiếm (debounce 250 ms) và tự lùi về trang cuối khi trang hiện tại
 * không còn dữ liệu (ví dụ sau khi xóa mục cuối cùng).
 *
 * Mỗi phân hệ chỉ tải danh sách của chính nó, thay vì tải mọi danh sách mỗi
 * lần chuyển trang như dashboard cũ.
 */
export function usePagedList<T>(loader: PagedLoader<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(loader);
  const searchRef = useRef(search);
  const pageRef = useRef(1);
  const requestId = useRef(0);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const load = useCallback(async (page: number, term: string) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      let result = await loaderRef.current(page, term);
      const lastPage = Math.max(result.pagination.totalPages, 1);
      if (page > lastPage) {
        result = await loaderRef.current(lastPage, term);
      }
      // Bỏ kết quả của request cũ hơn (người dùng gõ nhanh hoặc chuyển trang).
      if (id !== requestId.current) return;
      pageRef.current = result.pagination.page;
      setItems(result.items);
      setPageInfo(result.pagination);
      setError("");
    } catch (loadError) {
      if (id === requestId.current) setError(errorMessage(loadError));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  const hasLoaded = useRef(false);
  useEffect(() => {
    searchRef.current = search;
    // Lần đầu tải ngay; các lần gõ tìm kiếm sau được debounce 250 ms.
    const delay = hasLoaded.current ? 250 : 0;
    hasLoaded.current = true;
    const timer = setTimeout(() => void load(1, search), delay);
    return () => clearTimeout(timer);
  }, [search, load]);

  const reload = useCallback(
    () => load(pageRef.current, searchRef.current),
    [load],
  );
  const goToPage = useCallback(
    (page: number) => load(page, searchRef.current),
    [load],
  );

  return {
    items,
    pageInfo,
    search,
    setSearch,
    loading,
    error,
    reload,
    goToPage,
  };
}

/** Thông báo trạng thái dạng một dòng cho các thao tác. */
export function useFeedback() {
  const [feedback, setFeedback] = useState<{
    message: string;
    isError: boolean;
  }>({ message: "", isError: false });
  const show = useCallback((message: string, isError = false) => {
    setFeedback({ message, isError });
  }, []);
  return { ...feedback, show };
}
