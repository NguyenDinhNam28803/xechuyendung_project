"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "./admin-api";
import type { PageResponse, VehicleCategory } from "./types";

/** Dùng khi API danh mục chưa sẵn sàng (chưa chạy migration 007). */
export const fallbackVehicleCategories = [
  "Xe tải",
  "Xe chữa cháy",
  "Xe cứu hộ",
  "Xe bồn / xe môi trường",
];

/** Tên danh mục xe theo thứ tự hiển thị, tải một lần cho form xe. */
export function useVehicleCategoryNames() {
  const [names, setNames] = useState<string[]>(fallbackVehicleCategories);

  useEffect(() => {
    let cancelled = false;
    adminFetch<PageResponse<VehicleCategory>>("/vehicle-categories?limit=100")
      .then((page) => {
        if (!cancelled && page.items.length > 0) {
          setNames(page.items.map((category) => category.name));
        }
      })
      .catch(() => {
        // Giữ danh sách dự phòng; form vẫn dùng được.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return names;
}
