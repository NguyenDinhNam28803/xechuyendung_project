import { vehicleImages } from "./vehicle-images";

export type VehicleArtworkKind = "cargo" | "fire" | "rescue";

export type Vehicle = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: VehicleArtworkKind;
  images: string[];
  badge: string;
  useCase: string;
  highlights: string[];
  knownDetails: { label: string; value: string }[];
  sourceUrl?: string;
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
  make?: string;
  description?: string;
  images?: string[];
  badge?: string;
  highlights?: string[];
  knownDetails?: { label: string; value: string }[];
  sourceUrl?: string;
};

function createSampleVehicle({
  slug,
  name,
  category,
  artwork,
  configuration,
  useCase,
  make,
  description,
  images,
  badge,
  highlights,
  knownDetails,
  sourceUrl,
}: SampleVehicleOptions): Vehicle {
  return {
    slug,
    name,
    make: make ?? "Mẫu tham khảo",
    category,
    description: description ?? `${configuration}. Cấu hình minh họa, cần xác nhận theo nhu cầu thực tế.`,
    artwork,
    images: images ?? [],
    badge: badge ?? "Dữ liệu mẫu",
    useCase,
    highlights: highlights ?? [
      "Cấu hình mang tính tham khảo, chưa đại diện cho xe đang bán",
      "Cần xác nhận thông số nền, thiết bị chuyên dùng và hồ sơ kỹ thuật",
      "Trao đổi yêu cầu sử dụng trước khi lập phương án và báo giá",
    ],
    knownDetails: knownDetails ?? [
      { label: "Nhóm xe", value: category },
      { label: "Cấu hình minh họa", value: configuration },
      { label: "Trạng thái thông tin", value: "Dữ liệu mẫu, chưa xác nhận" },
    ],
    sourceUrl,
  };
}

export const vehicles: Vehicle[] = [
  {
    slug: "faw-j6l-thung-bat-2-tang",
    name: "FAW J6L thùng bạt 2 tầng",
    make: "FAW",
    category: "Xe tải",
    description: "Xe tải FAW J6L thùng bạt 2 tầng, trang bị bửng nâng thủy lực theo thông tin sản phẩm tham khảo.",
    artwork: "cargo",
    images: [],
    badge: "Thông tin tham khảo",
    useCase: "Vận chuyển hàng hóa cần không gian xếp dỡ linh hoạt.",
    highlights: [
      "Cấu hình thùng bạt 2 tầng",
      "Bửng nâng thủy lực có tải trọng nâng được giới thiệu 300 kg",
      "Xác nhận phiên bản và hồ sơ kỹ thuật trước khi lựa chọn",
    ],
    knownDetails: [
      { label: "Loại phương tiện", value: "Ô tô tải có mui" },
      { label: "Nhãn hiệu / dòng xe", value: "FAW J6L" },
      { label: "Khối lượng bản thân", value: "8.805 kg" },
      { label: "Khối lượng chuyên chở thiết kế lớn nhất", value: "6.400 kg" },
      { label: "Khối lượng toàn bộ thiết kế", value: "15.400 kg" },
      { label: "Kích thước bao", value: "12.160 × 2.500 × 3.830 mm" },
      { label: "Kích thước lòng thùng", value: "9.900 × 2.350 × 2.520/835 mm" },
      { label: "Động cơ", value: "CA6DH1-22E5, 5.700 cm³" },
      { label: "Công suất lớn nhất", value: "165 kW / 2.500 rpm" },
      { label: "Tải trọng bửng nâng", value: "300 kg" },
      { label: "Cỡ lốp", value: "10.00R20" },
    ],
    sourceUrl: "https://tanquoctuanauto.vn/faw-j6l-thung-bat-2-tang-bung-nang",
  },
  {
    slug: "xe-chua-chay-isuzu-4-khoi",
    name: "Xe chữa cháy Isuzu 4 khối",
    make: "ISUZU",
    category: "Xe chữa cháy",
    description: "Xe chữa cháy Isuzu cabin đôi, cấu hình bồn nước và bọt cùng thiết bị chuyên dùng theo thông tin tham khảo.",
    artwork: "fire",
    images: [],
    badge: "Thông tin tham khảo",
    useCase: "Phục vụ phương án chữa cháy theo điều kiện công trình và đơn vị sử dụng.",
    highlights: [
      "Thông tin nguồn nêu bồn nước 3,5 m³ và bồn foam 0,5 m³",
      "Có mô tả bơm chữa cháy CB10/40 và súng phun PL24",
      "Cần đối chiếu hồ sơ và tiêu chuẩn chuyên ngành trước khi lựa chọn",
    ],
    knownDetails: [
      { label: "Nhãn hiệu / model", value: "ISUZU KLF5100GXFPM40/Q6A" },
      { label: "Cabin", value: "Cabin đôi" },
      { label: "Tải trọng được giới thiệu", value: "4.000 kg" },
      { label: "Kích thước xe", value: "7.100 × 2.250 × 3.050 mm" },
      { label: "Động cơ", value: "ISUZU 4HK1-TCG61, diesel, tăng áp" },
      { label: "Dung tích bồn", value: "Nước 3,5 m³ + foam 0,5 m³" },
      { label: "Bơm chữa cháy", value: "CB10/40; định mức 40 L/s tại 1,0 MPa" },
      { label: "Súng phun", value: "PL24; xoay 360°" },
    ],
    sourceUrl: "https://tanquoctuanauto.vn/xe-chua-chay-isuzu-4-khoi",
  },
  {
    slug: "xe-cuu-ho-foton-2-chuc-nang",
    name: "Xe cứu hộ Foton 2 chức năng",
    make: "FOTON",
    category: "Xe cứu hộ",
    description: "Xe cứu hộ 2 chức năng Foton, với hệ thống sàn nâng hạ và càng kéo theo thông tin sản phẩm tham khảo.",
    artwork: "rescue",
    images: vehicleImages.recoveryTwoFunctions,
    badge: "Thông tin tham khảo",
    useCase: "Hỗ trợ cứu hộ phương tiện với cấu hình được lựa chọn theo nhu cầu khai thác.",
    highlights: [
      "Hệ thống thủy lực điều khiển cơ cấu sàn và tời/càng kéo",
      "Thông tin nguồn nêu sàn dày 5 mm và điều khiển từ xa",
      "Khối lượng cho phép thay đổi theo phương án vừa kéo vừa chở hoặc chỉ kéo",
    ],
    knownDetails: [
      { label: "Nhãn hiệu / model", value: "FOTON HTW5090TQZPB" },
      { label: "Động cơ", value: "Cummins ISF3.8S5154, 3.800 cm³" },
      { label: "Công suất lớn nhất", value: "115 kW" },
      { label: "Công thức bánh xe", value: "4 × 2" },
      { label: "Khối lượng bản thân", value: "5.850 kg" },
      { label: "Khối lượng toàn bộ cho phép", value: "8.495 kg" },
      { label: "Tải trọng cho phép chở", value: "2.450 kg" },
      { label: "Kích thước tổng thể", value: "7.600 × 2.300 × 2.470 mm" },
      { label: "Kích thước sàn xe", value: "5.800 × 2.300 mm" },
      { label: "Cỡ lốp", value: "7.50R16 R14" },
      { label: "Sàn cứu hộ", value: "Dày 5 mm; điều khiển nâng hạ từ xa" },
    ],
    sourceUrl: "https://tanquoctuanauto.vn/xe-cuu-ho-giao-thong-foton",
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
      name: "Hyundai Mighty N550LA đông lạnh",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Hyundai Mighty N550LA thùng đông lạnh",
      useCase: "Vận chuyển hàng hóa cần duy trì nhiệt độ; nhiệt độ khai thác cần được xác nhận theo mặt hàng và cấu hình máy lạnh.",
      make: "HYUNDAI",
      description: "Xe tải đông lạnh Mighty N550LA với thùng cách nhiệt composite và cụm lạnh Thermal Master theo thông tin tham khảo.",
      images: vehicleImages.refrigeratedTruck,
      badge: "Thông tin tham khảo",
      highlights: [
        "Thùng composite cốt sợi thủy tinh, có lớp foam cách nhiệt theo nguồn",
        "Cụm lạnh Thermal Master được giới thiệu trên trang tham khảo",
        "Cần xác nhận dải nhiệt độ, cấu hình thùng và điều kiện bảo hành theo xe thực tế",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / dòng xe", value: "Hyundai Mighty N550LA" },
        { label: "Khối lượng chuyên chở", value: "2.450 kg" },
        { label: "Khối lượng toàn bộ", value: "5.700 kg" },
        { label: "Kích thước bao", value: "6.350 × 1.970 × 2.870 mm" },
        { label: "Kích thước lòng thùng", value: "4.270 × 1.810 × 1.780 mm" },
        { label: "Động cơ", value: "D4CB, 2.497 cm³" },
        { label: "Công suất lớn nhất", value: "100 kW / 3.800 rpm" },
        { label: "Hệ thống lạnh được giới thiệu", value: "Thermal Master" },
        { label: "Vật liệu thùng được giới thiệu", value: "Composite cốt sợi thủy tinh, foam cách nhiệt" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-tai-dong-lanh-mighty-n550la",
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
      name: "Xe cứu hộ 3 chức năng kiểu sàn trượt",
      category: "Xe cứu hộ",
      artwork: "rescue",
      configuration: "Cấu hình cứu hộ kết hợp cẩu, kéo và chở xe",
      useCase: "Tham khảo cho nhiệm vụ cứu hộ, vận chuyển xe hoặc máy móc; tải trọng phù hợp cần được kiểm tra theo cấu hình cụ thể.",
      make: "Cấu hình tham khảo",
      description: "Xe cứu hộ sàn trượt kết hợp cẩu, tời kéo và càng kéo; thông số có thể thay đổi theo cấu hình xe.",
      images: vehicleImages.recoveryThreeFunctions,
      badge: "Thông tin tham khảo",
      highlights: [
        "Kết hợp các chức năng cẩu, kéo và chở xe",
        "Nguồn tham khảo nêu cần cẩu XCMG SQS100, sức nâng tối đa 4.000 kg tại tầm với 2,5 m",
        "Tải trọng cho phép khác nhau giữa phương án vừa kéo vừa chở và chỉ kéo",
      ],
      knownDetails: [
        { label: "Cấu hình", value: "Cứu hộ sàn trượt 3 chức năng" },
        { label: "Kích thước lòng sàn được giới thiệu", value: "5.500 × 2.310 mm" },
        { label: "Cần cẩu được giới thiệu", value: "XCMG SQS100" },
        { label: "Sức nâng lớn nhất được nêu", value: "4.000 kg tại tầm với 2,5 m" },
        { label: "Tải khi vừa kéo vừa chở", value: "2.500 kg (1.600 kg trên sàn + 900 kg trên càng); tổng khối lượng 10.655 kg" },
        { label: "Tải khi chỉ kéo", value: "1.600 kg trên càng; tổng khối lượng 9.755 kg" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-cuu-ho-3-chuc-nang-dongfeng",
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
      name: "Xe bồn nước Dongfeng 6,5 khối",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Xe bồn Dongfeng chở và phun nước",
      useCase: "Phục vụ vận chuyển, phun tưới hoặc rửa đường theo trang bị và phương án khai thác thực tế.",
      make: "DONGFENG",
      description: "Xe bồn nước Dongfeng dung tích khoảng 6,5 m³ theo thông tin tham khảo; trang nguồn cũng mô tả cấu hình phun rửa đường.",
      images: vehicleImages.waterTanker,
      badge: "Thông tin tham khảo",
      highlights: [
        "Dung tích khoảng 6,5 m³ theo tiêu đề và mô tả của nguồn",
        "Nguồn giới thiệu phương án phun nước, tưới rửa đường",
        "Cần đối chiếu dung tích thực, bơm và trang bị theo hồ sơ xe",
      ],
      knownDetails: [
        { label: "Nhãn hiệu", value: "Dongfeng" },
        { label: "Dung tích bồn được giới thiệu", value: "Khoảng 6,5 m³" },
        { label: "Công năng giới thiệu", value: "Chở nước / phun rửa đường" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-bon-cho-nuoc-dongfeng-6-khoi",
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
