import { vehicleImages } from "./vehicle-images";

export type VehicleArtworkKind = "cargo" | "fire" | "rescue";

export type Vehicle = {
  slug: string;
  name: string;
  make: string;
  category: VehicleCategory;
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
] as const;

export type VehicleCategory = Exclude<(typeof vehicleCategories)[number], "Tất cả">;

export const vehicleCategoryBySlug = {
  "xe-tai": "Xe tải",
  "xe-chua-chay": "Xe chữa cháy",
  "xe-cuu-ho": "Xe cứu hộ",
  "xe-bon-moi-truong": "Xe bồn / xe môi trường",
} as const satisfies Record<string, VehicleCategory>;

export const contactVehicleCategories = [
  ...vehicleCategories.slice(1),
  "Khác / cần tư vấn",
] as const;

const maximumVehicleImages = 4;

type SampleVehicleOptions = {
  slug: string;
  name: string;
  category: VehicleCategory;
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
    images: (images ?? []).slice(0, maximumVehicleImages),
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
      { label: "Động cơ", value: "CA6DH1-22E5, diesel 4 kỳ, 6 xi-lanh thẳng hàng, tăng áp; 5.700 cm³" },
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
      { label: "Động cơ", value: "ISUZU 4HK1-TCG61, diesel 4 kỳ, 4 xi-lanh thẳng hàng, tăng áp, làm mát bằng chất lỏng" },
      { label: "Dung tích bồn", value: "Nước 3,5 m³ + foam 0,5 m³" },
      { label: "Vật liệu bồn được nêu", value: "Bồn nước thép carbon; bồn foam inox 304 theo trang tham khảo" },
      { label: "Bơm chữa cháy", value: "CB10/40; định mức 40 L/s tại 1,0 MPa; độ sâu hút tối đa 7 m" },
      { label: "Súng phun", value: "PL24; xoay 360°; tầm phun được giới thiệu trên 60 m với nước và trên 50 m với foam" },
      { label: "Đường ống", value: "Thép carbon, điều khiển van bằng tay theo trang tham khảo" },
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
    images: vehicleImages.recoveryTwoFunctions.slice(0, maximumVehicleImages),
    badge: "Thông tin tham khảo",
    useCase: "Hỗ trợ cứu hộ phương tiện với cấu hình được lựa chọn theo nhu cầu khai thác.",
    highlights: [
      "Xe nền Foton Aumark; hệ thống thủy lực vận hành sàn, tời kéo và càng kéo",
      "Sàn dày 5 mm; trang nguồn mô tả điều khiển nâng hạ từ xa",
      "Trang tham khảo có nhiều bộ số liệu tải khác nhau theo cấu hình và cách tính; cần xác minh đăng kiểm",
    ],
    knownDetails: [
      { label: "Nhãn hiệu / model", value: "FOTON HTW5090TQZPB" },
      { label: "Động cơ", value: "Cummins ISF3.8S5154, 3.800 cm³" },
      { label: "Tiêu chuẩn khí thải được giới thiệu", value: "Euro 5" },
      { label: "Công suất lớn nhất", value: "115 kW" },
      { label: "Công thức bánh xe", value: "4 × 2" },
      { label: "Khối lượng bản thân", value: "5.850 kg" },
      { label: "Khối lượng toàn bộ cho phép", value: "8.495 kg" },
      { label: "Tải trọng cho phép chở", value: "2.450 kg" },
      { label: "Kích thước tổng thể", value: "7.600 × 2.300 × 2.470 mm" },
      { label: "Kích thước sàn xe", value: "5.800 × 2.300 mm; độ cao sàn nêu là 0 mm khi hạ sát đất" },
      { label: "Cỡ lốp", value: "7.50R16 R14" },
      { label: "Sàn cứu hộ", value: "Dày 5 mm; điều khiển nâng hạ từ xa" },
      { label: "Số liệu tải ở phần ghi chú của nguồn", value: "Vừa kéo vừa chở: 1.550 kg / tổng 7.595 kg; chỉ kéo: 1.100 kg / tổng 7.145 kg. Khác với bảng thông số tổng thể phía trên, cần đối chiếu hồ sơ xe." },
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
      name: "FAW JH6 8×4 thùng lửng gắn cẩu Soosan 15 tấn",
      category: "Xe tải",
      artwork: "cargo",
      configuration: "Xe tải kết hợp thiết bị cẩu",
      useCase: "Vận chuyển hàng hóa kết hợp nâng hạ tại công trường; tải thực tế phụ thuộc hồ sơ đăng kiểm, vị trí lắp cẩu và cấu hình thân xe.",
      make: "FAW",
      description: "Cấu hình tham khảo FAW JH6 4 chân 8×4, thùng lửng và cẩu Soosan 15 tấn. Trang nguồn nêu tải dự kiến, cần đối chiếu với hồ sơ hoàn công của xe cụ thể.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Xe nền FAW JH6 8×4, cấu hình 4 chân",
        "Cẩu tự hành Soosan được giới thiệu ở cấp 15 tấn",
        "Tải dự kiến trên trang nguồn là khoảng 9.100–9.200 kg trên tổng khối lượng 30.000 kg; không thay thế tải trọng đăng kiểm",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / dòng xe nền", value: "FAW JH6, 8×4 (4 chân)" },
        { label: "Kiểu thùng", value: "Thùng lửng" },
        { label: "Cẩu tự hành", value: "Soosan, cấp 15 tấn theo mô tả sản phẩm" },
        { label: "Kích thước lòng thùng", value: "8.200 × 2.360 × 650 mm" },
        { label: "Tải dự kiến / khối lượng toàn bộ", value: "Khoảng 9.100–9.200 kg / 30.000 kg (số liệu tham khảo)" },
        { label: "Động cơ", value: "Trang nguồn nêu cấu hình thường gặp 370 hoặc 375 HP; cần xác nhận đúng xe" },
        { label: "Trang bị lắp thùng được nêu", value: "Chắn bùn inox, quang bọ, cản hông và tay khóa bản lề" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/thung-lung-gan-cau-faw-jh6-8x4-lap-cau-soosan-15-tan",
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
      images: vehicleImages.refrigeratedTruck.slice(0, maximumVehicleImages),
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
        { label: "Chiều dài cơ sở", value: "3.415 mm" },
        { label: "Vết bánh trước / sau", value: "1.480 / 1.435 mm" },
        { label: "Động cơ", value: "D4CB, 2.497 cm³" },
        { label: "Công suất lớn nhất", value: "100 kW / 3.800 rpm" },
        { label: "Cỡ lốp", value: "7.00R16" },
        { label: "Hệ thống lạnh được giới thiệu", value: "Thermal Master" },
        { label: "Vật liệu thùng được giới thiệu", value: "Composite cốt sợi thủy tinh, lớp foam cách nhiệt và vách ngăn" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-tai-dong-lanh-mighty-n550la",
    },
    {
      slug: "xe-chua-chay-do-thi",
      name: "Xe chữa cháy Dongfeng 2,5 khối",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy Dongfeng dung tích danh nghĩa 2,5 m³",
      useCase: "Cấu hình nhỏ gọn được trang nguồn giới thiệu cho khu vực cần xe chữa cháy cơ động; phương án sử dụng phải được đơn vị chuyên môn xác nhận.",
      make: "DONGFENG",
      description: "Xe chữa cháy Dongfeng 2,5 khối, cabin đôi 5 chỗ, bồn nước và foam theo mô tả của trang tham khảo.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Bồn danh nghĩa 2,5 m³ gồm 2 m³ nước và 0,5 m³ foam theo trang nguồn",
        "Trang nguồn nêu bơm 30 L/s tại 10 bar; cần xác nhận theo cấu hình bàn giao",
        "Thông số và thiết bị PCCC cần kiểm tra theo hồ sơ phê duyệt của xe",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / model", value: "Dongfeng CLW5071GXFPM25/AXF" },
        { label: "Khung gầm", value: "EQ1075DJ3CDF" },
        { label: "Cabin", value: "D6 cabin đôi, 5 chỗ theo trang tham khảo" },
        { label: "Dung tích bồn danh nghĩa", value: "2,5 m³: 2 m³ nước + 0,5 m³ foam" },
        { label: "Khối lượng bản thân / toàn bộ", value: "4.260 kg / 7.150 kg" },
        { label: "Động cơ", value: "YCY24140-60" },
        { label: "Cỡ lốp", value: "7.00R16" },
        { label: "Bơm được giới thiệu", value: "30 L/s tại 10 bar; tầm phun được nguồn mô tả là trên 45 m với nước và trên 40 m với foam" },
        { label: "Kích thước tổng thể", value: "Khoảng 6.230 × 2.030 × 2.720 mm theo mô tả tham khảo" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-chua-chay-25-khoi-dongfeng",
    },
    {
      slug: "xe-chua-chay-rung",
      name: "Xe chữa cháy Dongfeng 4 khối",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy Dongfeng 4 m³, cabin đôi",
      useCase: "Cấu hình chữa cháy chuyên dùng có bồn nước và foam; cần đánh giá kích thước, khả năng tiếp cận và yêu cầu triển khai theo từng địa điểm.",
      make: "DONGFENG",
      description: "Xe chữa cháy Dongfeng 4 khối nhập khẩu theo nội dung trang tham khảo, dùng khung gầm D7 cabin đôi.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Bồn danh nghĩa 4 m³ gồm 3 m³ nước và 1 m³ foam",
        "Model được nêu là CLW5110GXFPM50/DF, động cơ YCY30165-60",
        "Một số kích thước và mô tả hiệu năng trên trang là số liệu thường gặp, không phải cam kết cho mọi phiên bản",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / model", value: "Dongfeng CLW5110GXFPM50/DF" },
        { label: "Cabin", value: "D7 cabin đôi, 6 chỗ theo trang tham khảo" },
        { label: "Dung tích bồn danh nghĩa", value: "4 m³: 3 m³ nước + 1 m³ foam" },
        { label: "Khối lượng bản thân / toàn bộ", value: "5.750 kg / 10.200 kg" },
        { label: "Động cơ", value: "YCY30165-60; trang nguồn ghi tiêu chuẩn Euro VI" },
        { label: "Cỡ lốp", value: "245/70R19.5" },
        { label: "Kích thước tổng thể tham khảo", value: "Khoảng 7.060 × 2.230 × 3.030 mm; trang nguồn ghi đây là kích thước thường gặp" },
        { label: "Bơm / lăng phun", value: "Trang mô tả bơm khoảng 30 L/s tại 1,0 MPa và lăng phun xoay; cần xác nhận mã thiết bị theo xe" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-chua-chay-dongfeng-4-khoi-nhap-khau",
    },
    {
      slug: "xe-chua-chay-bot",
      name: "Xe chữa cháy Dongfeng 6,5 khối",
      category: "Xe chữa cháy",
      artwork: "fire",
      configuration: "Xe chữa cháy Dongfeng dung tích danh nghĩa 6,5 m³",
      useCase: "Cấu hình xe chữa cháy dung tích lớn theo trang tham khảo; cần đối chiếu điều kiện vận hành, chứng nhận thiết bị và tải trọng cho phép.",
      make: "DONGFENG",
      description: "Xe chữa cháy Dongfeng cabin đôi D9, model CLW5160GXFDL60/DF theo trang tham khảo. Nguồn có chỗ ghi dung tích 6,5 m³ nhưng phần mô tả bồn nêu 5 m³ nước và 1 m³ foam, cần xác minh.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Trang sản phẩm đề tên xe 6,5 khối; nội dung lại nêu bồn nước 5 m³ + foam 1 m³ (tổng 6 m³)",
        "Không cộng gộp hoặc coi các số liệu dung tích là đã xác nhận; cần lấy hồ sơ kỹ thuật của phiên bản thực tế",
        "Cabin đôi 6 chỗ, động cơ YCS04200-68 được nêu tại trang tham khảo",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / model", value: "Dongfeng CLW5160GXFDL60/DF" },
        { label: "Cabin", value: "D9 cabin đôi, 6 chỗ theo trang tham khảo" },
        { label: "Dung tích bồn", value: "Mâu thuẫn trong nguồn: tên xe 6,5 m³; phần mô tả nêu 5 m³ nước + 1 m³ foam" },
        { label: "Khối lượng bản thân / toàn bộ", value: "8.640 kg / 14.730 kg" },
        { label: "Động cơ", value: "YCS04200-68, 147 kW / 200 HP; Euro VI theo trang nguồn" },
        { label: "Hộp số", value: "Mil, 8 số tiến + 1 số lùi" },
        { label: "Cỡ lốp", value: "10.00R20 18PR" },
        { label: "Bơm chữa cháy", value: "Nguồn mô tả lưu lượng thường gặp 40 L/s tại 1,0 MPa; cần kiểm tra đúng trang bị của xe" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-cuu-hoa-dongfeng-65-khoi",
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
      images: vehicleImages.recoveryThreeFunctions.slice(0, maximumVehicleImages),
      badge: "Thông tin tham khảo",
      highlights: [
        "Kết hợp các chức năng cẩu, kéo và chở xe",
        "Nguồn tham khảo nêu cần cẩu XCMG SQS100, sức nâng tối đa 4.000 kg tại tầm với 2,5 m",
        "Tải trọng cho phép khác nhau giữa phương án vừa kéo vừa chở và chỉ kéo",
      ],
      knownDetails: [
        { label: "Cấu hình", value: "Cứu hộ sàn trượt 3 chức năng" },
        { label: "Cần cẩu được giới thiệu", value: "XCMG SQS100" },
        { label: "Sức nâng lớn nhất được nêu", value: "4.000 kg tại tầm với 2,5 m" },
        { label: "Tải khi vừa kéo vừa chở", value: "2.500 kg (1.600 kg trên sàn + 900 kg trên càng); tổng khối lượng 10.655 kg" },
        { label: "Tải khi chỉ kéo", value: "1.600 kg trên càng; tổng khối lượng 9.755 kg" },
        { label: "Cơ cấu chuyên dùng", value: "Sàn trượt, tời kéo, càng kéo và cần cẩu thủy lực theo mô tả sản phẩm" },
        { label: "Nền xe, kích thước và động cơ", value: "Trang tham khảo không nêu đầy đủ trong nội dung đã đối chiếu; cần xác minh theo hồ sơ xe cụ thể" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-cuu-ho-3-chuc-nang-dongfeng",
    },
    {
      slug: "xe-cuu-ho-nang-dau",
      name: "Xe cứu hộ Foton Aumark 9 tấn nâng đầu + càng kéo",
      category: "Xe cứu hộ",
      artwork: "rescue",
      configuration: "Thiết bị nâng đầu phương tiện",
      useCase: "Phương án chở máy hoặc phương tiện bằng sàn nâng đầu, kết hợp tời và càng kéo; phải kiểm tra khả năng chịu tải và điều kiện an toàn theo thiết kế được duyệt.",
      make: "FOTON",
      description: "Foton Aumark 9 tấn cấu hình sàn fooc nâng đầu và càng kéo. Trang tham khảo mô tả thiết bị chuyên dùng nhưng không cung cấp đủ thông số xe nền để xác nhận tải khai thác.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Sàn nâng đầu kết hợp càng kéo và hệ thống điều khiển thủy lực",
        "Nguồn nêu tời kéo 15 tấn, kết cấu sàn được mô tả chịu lực quá tải 20 tấn; đây là thông tin quảng bá cần thẩm định, không phải tải trọng hợp pháp",
        "Tải nâng, tải kéo và phương tiện được phép chở phải căn cứ hồ sơ cải tạo/đăng kiểm",
      ],
      knownDetails: [
        { label: "Dòng xe / cấu hình", value: "Foton Aumark 9 tấn, fooc nâng đầu + càng kéo" },
        { label: "Sàn chở máy", value: "Dài 6,5 m × rộng 2,5 m theo phần giới thiệu sản phẩm" },
        { label: "Động cơ", value: "Yuchai 220 HP theo trang tham khảo" },
        { label: "Tời kéo thủy lực", value: "Sức kéo 15 tấn theo mô tả nguồn" },
        { label: "Càng kéo", value: "Nguồn nêu sức nâng đặt lên càng 10 tấn; cần xác nhận biểu đồ tải và cấu hình thực tế" },
        { label: "Thông tin chưa có trên trang", value: "Mã chassis, kích thước tổng thể, khối lượng xe và tải trọng đăng kiểm" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-cuu-ho-2-chuc-nang-foton-aumark-9-tan",
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
      images: vehicleImages.waterTanker.slice(0, maximumVehicleImages),
      badge: "Thông tin tham khảo",
      highlights: [
        "Trang tham khảo giới thiệu xe bồn nước Dongfeng 6,5 khối và công năng phun rửa đường",
        "Trang có phần mô tả chung về hút nước, phun tưới, béc rửa đường và súng phun; chưa đủ căn cứ xác nhận thiết bị là trang bị tiêu chuẩn của đúng chiếc xe",
        "Nguồn cũng dẫn clip xe 9 khối tại cảng trong cùng nội dung; cần xác nhận đúng dung tích và hồ sơ của phiên bản đang xem",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / dòng xe", value: "Dongfeng; trang giới thiệu xe bồn nước 6,5 khối" },
        { label: "Dung tích được quảng bá", value: "6,5 m³ (trang nguồn cũng ghi 6 khối ở đường dẫn)" },
        { label: "Công năng mô tả", value: "Chở nước, tưới cây, dập bụi và phun rửa đường" },
        { label: "Thiết bị được mô tả chung", value: "Bơm hút/phun, béc phun trước, dàn phun sau và súng phun cao áp; xác nhận cấu hình thực tế" },
        { label: "Thông số chưa có", value: "Model chassis, động cơ, kích thước, khối lượng, thể tích sử dụng và mã bơm của cấu hình cụ thể" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-bon-cho-nuoc-dongfeng-6-khoi",
    },
    {
      slug: "xe-hut-chat-thai",
      name: "Xe hút chất thải Foton 7 khối",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Bồn và thiết bị hút chuyên dùng",
      useCase: "Xe xi téc chở chất thải với bồn danh nghĩa 7 m³ theo trang tham khảo; cần xác nhận loại chất thải được phép chuyên chở, hệ thống hút và yêu cầu môi trường.",
      make: "FOTON",
      description: "Xe hút chất thải Foton 7 khối, model YFY5120GSS5BJ. Các số liệu tải trọng và kích thước trên nguồn đều ghi dự kiến.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Bồn xi téc dung tích dự kiến 7 m³",
        "Động cơ được giới thiệu là Cummins ISF3.8S5168",
        "Tải trọng, kích thước và khối lượng đều cần xác nhận theo giấy chứng nhận chất lượng của xe",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / model", value: "Foton YFY5120GSS5BJ" },
        { label: "Động cơ", value: "Cummins ISF3.8S5168 theo trang tham khảo" },
        { label: "Thể tích bồn dự kiến", value: "7 m³" },
        { label: "Kích thước bao dự kiến", value: "6.420 × 2.350 × 2.900 mm" },
        { label: "Kích thước ngoài xi téc dự kiến", value: "3.700 × 1.500 × 1.500 mm" },
        { label: "Khối lượng bản thân dự kiến", value: "6.200 kg" },
        { label: "Tải trọng cho phép tham gia giao thông dự kiến", value: "5.000 kg" },
        { label: "Khối lượng toàn bộ cho phép tham gia giao thông dự kiến", value: "11.200 kg" },
        { label: "Cỡ lốp", value: "8.25R16" },
        { label: "Thiết bị hút", value: "Trang mô tả là xe chở chất thải nhưng không nêu mã bơm/chân không; cần xác minh cấu hình hút" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-hut-chat-thai-foton-7-khoi",
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
      name: "Xe quét đường hút bụi Isuzu 5,5 khối",
      category: "Xe bồn / xe môi trường",
      artwork: "cargo",
      configuration: "Thiết bị quét và vệ sinh mặt đường",
      useCase: "Xe quét hút bụi đường với khoang chứa rác và bồn nước dập bụi; cần xác nhận thiết kế chổi, hệ thống hút và tiêu chuẩn khí thải của xe cụ thể.",
      make: "ISUZU",
      description: "Xe quét đường hút bụi Isuzu dung tích tổng 5,5 m³ theo trang tham khảo, gồm khoang rác và bồn nước. Trang có các mô tả kỹ thuật tổng quát cần xác minh với đúng phiên bản.",
      badge: "Thông tin tham khảo",
      highlights: [
        "Tổng thể tích thùng chuyên dùng 5.500 lít theo trang sản phẩm",
        "Nguồn chia thành khoang rác 4.500 lít và bồn nước 1.000 lít",
        "Thông tin động cơ và kích thước có đoạn mô tả chung, cần kiểm tra đúng cấu hình Isuzu 5,5 khối",
      ],
      knownDetails: [
        { label: "Nhãn hiệu / loại xe", value: "Isuzu, xe quét đường hút bụi 5,5 khối" },
        { label: "Tổng dung tích chuyên dùng", value: "5.500 lít" },
        { label: "Khoang chứa rác", value: "4.500 lít" },
        { label: "Bồn nước dập bụi", value: "1.000 lít" },
        { label: "Hệ thống quét được mô tả", value: "Bốn chổi quét đĩa kết hợp miệng hút; xác nhận theo cấu hình xe" },
        { label: "Động cơ", value: "Nguồn nêu động cơ chính Isuzu; tiêu chuẩn khí thải có chỗ ghi Euro 6 và chỗ ghi Euro 5 trở lên – cần xác minh" },
        { label: "Kích thước tổng thể", value: "Khoảng 6.200 × 2.000 × 2.600 mm theo mô tả chung trên trang, không phải thông số xác nhận" },
      ],
      sourceUrl: "https://tanquoctuanauto.vn/xe-quet-duong-isuzu-55-khoi",
    },
  ] satisfies SampleVehicleOptions[]).map(createSampleVehicle),
];

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
