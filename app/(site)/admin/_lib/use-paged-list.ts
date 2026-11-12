"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "./admin-api";
import { listQueryString, readListQuery } from "./list-query";
import { emptyPageInfo, type PageInfo, type PageResponse } from "./types";

export type ListFilters = Record<string, string>;

export type PagedLoader<T> = (
  page: number,
  search: string,
  filters: ListFilters,
) => Promise<PageResponse<T>>;

export type PagedListOptions = {
  /** Tên các bộ lọc được đọc/ghi trên query string (ví dụ "published", "status"). */
  filterKeys?: readonly string[];
  /**
   * false: không đưa từ khóa lên URL (ví dụ tìm theo tên/số điện thoại khách
   * hàng, để dữ liệu cá nhân không vào lịch sử trình duyệt hay log).
   */
  persistSearch?: boolean;
};

const noFilters: readonly string[] = [];

/**
 * Trạng thái của một danh sách phân trang phía server: trang, từ khóa (debounce
 * 250 ms) và bộ lọc; tự lùi về trang cuối khi trang hiện tại hết dữ liệu (ví
 * dụ sau khi xóa mục cuối cùng). Trạng thái được đồng bộ lên URL bằng
 * history.replaceState để tải lại trang hoặc chia sẻ link vẫn giữ chỗ đang xem.
 */
export function usePagedList<T>(loader: PagedLoader<T>, options: PagedListOptions = {}) {
  const filterKeys = options.filterKeys ?? noFilters;
  const persistSearch = options.persistSearch !== false;
  const searchParams = useSearchParams();
  const [initial] = useState(() =>
    readListQuery(searchParams, filterKeys, { includeSearch: persistSearch }),
  );
  const [items, setItems] = useState<T[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(emptyPageInfo);
  const [search, setSearchState] = useState(initial.search);
  const [filters, setFilters] = useState<ListFilters>(initial.filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(loader);
  const searchRef = useRef(search);
  const filtersRef = useRef(filters);
  const pageRef = useRef(initial.page);
  const requestId = useRef(0);
  /** Người dùng đã đổi từ khóa/bộ lọc → quay về trang 1. */
  const touched = useRef(false);
  /** Lần thay đổi gần nhất là gõ tìm kiếm → debounce. */
  const debounceNext = useRef(false);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const syncUrl = useCallback(
    (page: number, term: string, activeFilters: ListFilters) => {
      const query = listQueryString(
        { page, search: term, filters: activeFilters },
        filterKeys,
        { includeSearch: persistSearch },
      );
      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${window.location.pathname}${query}`;
      if (next !== current) window.history.replaceState(null, "", next);
    },
    [filterKeys, persistSearch],
  );

  const load = useCallback(
    async (page: number, term: string, activeFilters: ListFilters) => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        let result = await loaderRef.current(page, term, activeFilters);
        const lastPage = Math.max(result.pagination.totalPages, 1);
        if (page > lastPage) {
          result = await loaderRef.current(lastPage, term, activeFilters);
        }
        // Bỏ kết quả của request cũ hơn (người dùng gõ nhanh hoặc chuyển trang).
        if (id !== requestId.current) return;
        pageRef.current = result.pagination.page;
        setItems(result.items);
        setPageInfo(result.pagination);
        setError("");
        syncUrl(result.pagination.page, term, activeFilters);
      } catch (loadError) {
        if (id === requestId.current) setError(errorMessage(loadError));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [syncUrl],
  );

  useEffect(() => {
    searchRef.current = search;
    filtersRef.current = filters;
    const page = touched.current ? 1 : pageRef.current;
    const delay = debounceNext.current ? 250 : 0;
    const timer = setTimeout(() => void load(page, search, filters), delay);
    return () => clearTimeout(timer);
  }, [search, filters, load]);

  const setSearch = useCallback((value: string) => {
    touched.current = true;
    debounceNext.current = true;
    setSearchState(value);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    touched.current = true;
    debounceNext.current = false;
    setFilters((current) => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }, []);

  const reload = useCallback(
    () => load(pageRef.current, searchRef.current, filtersRef.current),
    [load],
  );
  const goToPage = useCallback(
    (page: number) => load(page, searchRef.current, filtersRef.current),
    [load],
  );

  return {
    items,
    pageInfo,
    search,
    setSearch,
    filters,
    setFilter,
    loading,
    error,
    reload,
    goToPage,
  };
}

/** Tạo query string cho API từ trang, từ khóa và bộ lọc (bỏ giá trị rỗng). */
export function apiQuery(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}
