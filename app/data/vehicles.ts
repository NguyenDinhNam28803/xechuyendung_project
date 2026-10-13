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

type SampleVehicleOptions = {
  slug: string;
  name: string;
  category: Exclude<(typeof vehicleCategories)[number], "Tất cả">;
  artwork: VehicleArtworkKind;
  configuration: string;
  useCase: string;
};

function createSampleVehicle({
  slug,
  name,
  category,
  artwork,
  configuration,
  useCase,
}: SampleVehicleOptions): Vehicle {
  return {
    slug,
    name,
    make: "Mẫu tham khảo",
    category,
    description: `${configuration}. Cấu hình minh họa, cần xác nhận theo nhu cầu thực tế.`,
    artwork,
    badge: "Dữ liệu mẫu",
    useCase,
    highlights: [
      "Cấu hình mang tính tham khảo, chưa đại diện cho xe đang bán",
      "Cần xác nhận thông số nền, thiết bị chuyên dùng và hồ sơ kỹ thuật",
      "Trao đổi yêu cầu sử dụng trước khi lập phương án và báo giá",
    ],
    knownDetails: [
      { label: "Nhóm xe", value: category },
      { label: "Cấu hình minh họa", value: configuration },
      { label: "Trạng thái thông tin", value: "Dữ liệu mẫu, chưa xác nhận" },
    ],
  };
}

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
  ...([
    {
      slug: "xe-tai-thung-kin",
      name: "Xe tải thùng kín",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Thùng kín chở hàng",
      useCase: "Tham khảo cho nhu cầu vận chuyển hàng hóa cần che chắn trong quá trình khai thác.",
    },
    {
      slug: "xe-tai-thung-lung",
      name: "Xe tải thùng lửng",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Thùng lửng chở hàng",
      useCase: "Tham khảo cho hàng hóa cần thao tác xếp dỡ từ nhiều phía.",
    },
    {
      slug: "xe-tai-ben",
      name: "Xe tải ben",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Thùng ben",
      useCase: "Tham khảo cho nhu cầu vận chuyển vật liệu rời và công việc cần phương án tự đổ.",
    },
    {
      slug: "xe-tai-gan-cau",
      name: "Xe tải gắn cẩu",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Xe tải kết hợp thiết bị cẩu",
      useCase: "Tham khảo cho công việc cần kết hợp vận chuyển và hỗ trợ nâng hạ hàng hóa.",
    },
    {
      slug: "xe-tai-dong-lanh",
      name: "Xe tải thùng bảo ôn",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Thùng bảo ôn",
      useCase: "Tham khảo cho hàng hóa cần điều kiện bảo quản riêng; yêu cầu làm lạnh cần được xác định cụ thể.",
    },
    {
      slug: "xe-chua-chay-do-thi",
      name: "Xe chữa cháy đô thị",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy phục vụ khu vực đô thị",
      useCase: "Tham khảo để trao đổi phương án tiếp cận, thiết bị và điều kiện hoạt động tại khu vực đô thị.",
    },
    {
      slug: "xe-chua-chay-rung",
      name: "Xe chữa cháy địa hình",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy theo điều kiện địa hình",
      useCase: "Tham khảo cho nhiệm vụ tại khu vực có điều kiện mặt đường và địa hình đặc thù.",
    },
    {
      slug: "xe-chua-chay-bot",
      name: "Xe chữa cháy kết hợp bọt",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy có phương án sử dụng bọt",
      useCase: "Tham khảo để xác định phương án chất chữa cháy và thiết bị phù hợp với nhiệm vụ.",
    },
    {
      slug: "xe-cuu-ho-san-truot",
      name: "Xe cứu hộ sàn trượt",
      category: "Xe cứu hộ",
      artwork: "rescue",
      configuration: "Sàn trượt cứu hộ",
      useCase: "Tham khảo cho phương án vận chuyển phương tiện gặp sự cố lên sàn xe.",
    },
    {
      slug: "xe-cuu-ho-nang-dau",
      name: "Xe cứu hộ nâng đầu",
      category: "Xe cứu hộ",
      artwork: "rescue",
      configuration: "Thiết bị nâng đầu phương tiện",
      useCase: "Tham khảo cho nhu cầu cứu hộ phương tiện theo phương án nâng và kéo phù hợp.",
    },
    {
      slug: "xe-cuu-ho-giao-thong",
      name: "Xe hỗ trợ sự cố giao thông",
      category: "Xe cứu hộ",
      artwork: "rescue",
      configuration: "Xe hỗ trợ xử lý sự cố giao thông",
      useCase: "Tham khảo cho đơn vị cần phương tiện và thiết bị phục vụ công tác hỗ trợ hiện trường.",
    },
    {
      slug: "xe-bon-cho-nuoc",
      name: "Xe bồn chở nước",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Bồn chứa và cấp nước",
      useCase: "Tham khảo cho nhu cầu vận chuyển, cấp nước hoặc tưới rửa theo phương án khai thác.",
    },
    {
      slug: "xe-hut-chat-thai",
      name: "Xe hút chất thải",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Bồn và thiết bị hút chuyên dùng",
      useCase: "Tham khảo cho công việc vệ sinh môi trường; loại chất thải và quy trình xử lý cần xác nhận.",
    },
    {
      slug: "xe-ep-rac",
      name: "Xe cuốn ép rác",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Thùng cuốn ép rác",
      useCase: "Tham khảo cho nhu cầu thu gom và vận chuyển chất thải rắn sinh hoạt.",
    },
    {
      slug: "xe-quet-duong",
      name: "Xe quét đường và vệ sinh",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Thiết bị quét và vệ sinh mặt đường",
      useCase: "Tham khảo cho công tác vệ sinh đường phố và khu vực công cộng.",
    },
  ] satisfies SampleVehicleOptions[]).map(createSampleVehicle),
];

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
