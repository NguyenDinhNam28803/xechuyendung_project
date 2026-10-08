export type VehicleArtworkKind = "cargo" | "fire" | "rescue";

export type Vehicle = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: VehicleArtworkKind;
  badge: string;
  useCase: string;
  highlights: string[];
  knownDetails: { label: string; value: string }[];
};

export const vehicleCategories = [
  "Tất cả",
  "Xe tải",
  "Xe chữa cháy",
  "Xe cứu hộ",
  "Xe bồn / xe môi trường",
];

export const vehicles: Vehicle[] = [
  {
    slug: "faw-j6l-thung-bat-2-tang",
    name: "FAW J6L thùng bạt 2 tầng",
    make: "FAW",
    category: "Xe tải",
    description: "Giải pháp chở hàng cồng kềnh với cấu hình thùng bạt và bửng nâng.",
    artwork: "cargo",
    badge: "Xe tải",
    useCase: "Vận chuyển hàng hóa cần không gian xếp dỡ linh hoạt.",
    highlights: [
      "Cấu hình thùng bạt 2 tầng",
      "Có bửng nâng thủy lực theo thông tin giới thiệu",
      "Tư vấn cấu hình theo loại hàng và nhu cầu vận hành",
    ],
    knownDetails: [
      { label: "Dòng xe", value: "FAW J6L" },
      { label: "Cấu hình thùng", value: "Thùng bạt 2 tầng" },
      { label: "Trang bị được giới thiệu", value: "Bửng nâng thủy lực" },
    ],
  },
  {
    slug: "xe-chua-chay-isuzu-4-khoi",
    name: "Xe chữa cháy Isuzu 4 khối",
    make: "ISUZU",
    category: "Xe chữa cháy",
    description: "Xe chữa cháy bồn nước 4 m³, cấu hình cần được xác nhận theo yêu cầu.",
    artwork: "fire",
    badge: "Xe chuyên dụng",
    useCase: "Phục vụ phương án chữa cháy theo điều kiện công trình và đơn vị sử dụng.",
    highlights: [
      "Bồn nước dung tích giới thiệu 4 m³",
      "Cấu hình thiết bị cần đối chiếu hồ sơ thực tế",
      "Trao đổi yêu cầu sử dụng trước khi lập báo giá",
    ],
    knownDetails: [
      { label: "Nhãn hiệu nền", value: "Isuzu" },
      { label: "Nhóm xe", value: "Xe chữa cháy" },
      { label: "Dung tích bồn được giới thiệu", value: "4 m³" },
    ],
  },
  {
    slug: "xe-cuu-ho-foton-2-chuc-nang",
    name: "Xe cứu hộ Foton 2 chức năng",
    make: "FOTON",
    category: "Xe cứu hộ",
    description: "Giải pháp cứu hộ kết hợp sàn trượt và cẩu kéo, cần tư vấn theo phương tiện phục vụ.",
    artwork: "rescue",
    badge: "Xe chuyên dụng",
    useCase: "Hỗ trợ cứu hộ phương tiện với cấu hình được lựa chọn theo nhu cầu khai thác.",
    highlights: [
      "Định hướng cấu hình 2 chức năng",
      "Thông tin sàn trượt và cẩu kéo theo mô tả sản phẩm",
      "Cần xác nhận tải trọng, thiết bị và điều kiện đăng kiểm",
    ],
    knownDetails: [
      { label: "Nhãn hiệu nền", value: "Foton" },
      { label: "Nhóm xe", value: "Xe cứu hộ" },
      { label: "Cấu hình được giới thiệu", value: "2 chức năng" },
    ],
  },
];

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
