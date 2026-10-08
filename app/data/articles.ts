export type Article = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "chon-xe-chuyen-dung-theo-nhu-cau",
    category: "Kinh nghiệm",
    title: "Bắt đầu chọn xe chuyên dụng từ công việc thực tế",
    summary:
      "Xác định nhiệm vụ, điều kiện vận hành và thông tin cần đối chiếu trước khi lựa chọn cấu hình xe.",
    sections: [
      {
        heading: "Mô tả nhiệm vụ trước khi chọn mẫu xe",
        paragraphs: [
          "Hãy bắt đầu bằng công việc chiếc xe sẽ thực hiện, tần suất hoạt động, địa hình và môi trường khai thác. Cùng một nhóm xe có thể cần các cấu hình khác nhau tùy nhiệm vụ.",
          "Ghi lại loại hàng hoặc thiết bị chuyên dùng, tải trọng dự kiến và những yêu cầu về kích thước để cuộc trao đổi tư vấn đi vào trọng tâm.",
        ],
      },
      {
        heading: "Đối chiếu chassis và phần chuyên dùng",
        paragraphs: [
          "Với xe đóng thùng hoặc lắp thiết bị, cần xem xét đồng thời xe cơ sở, tải trọng, kích thước, khối lượng chuyên dùng và hồ sơ kỹ thuật. Không nên chọn chỉ dựa trên tên gọi hoặc hình ảnh minh họa.",
          "Thông số cụ thể cần được xác nhận theo phiên bản xe, hồ sơ nhà sản xuất và phương án cải tạo được phê duyệt.",
        ],
      },
      {
        heading: "Chuẩn bị thông tin để nhận tư vấn",
        paragraphs: [
          "Khi liên hệ, hãy cung cấp mục đích sử dụng, địa điểm hoạt động, tải trọng hoặc dung tích cần thiết, thời gian dự kiến và phương án ngân sách nếu đã xác định.",
          "Các nội dung trên là hướng dẫn tham khảo chung, không thay thế tư vấn kỹ thuật, xác nhận hồ sơ hay báo giá cho một cấu hình cụ thể.",
        ],
      },
    ],
  },
  {
    slug: "thong-tin-can-chuan-bi-khi-yeu-cau-bao-gia",
    category: "Hướng dẫn",
    title: "Cần chuẩn bị gì khi yêu cầu báo giá xe?",
    summary:
      "Danh sách thông tin cơ bản giúp quá trình trao đổi cấu hình và báo giá rõ ràng hơn.",
    sections: [
      {
        heading: "Thông tin người mua và nơi sử dụng",
        paragraphs: [
          "Chuẩn bị tên người hoặc đơn vị liên hệ, số điện thoại có thể trao đổi và tỉnh/thành dự kiến nhận xe. Website sẽ chỉ thu thập những trường cần thiết sau khi form được kết nối với hệ thống nhận yêu cầu.",
        ],
      },
      {
        heading: "Nhu cầu xe và thời gian dự kiến",
        paragraphs: [
          "Nêu nhóm xe đang tìm, công việc dự kiến, các thông số quan tâm và mốc thời gian cần xe. Nếu chưa biết cấu hình, mô tả nhiệm vụ để được định hướng ban đầu.",
          "Giá, tình trạng hàng, thời gian giao và điều kiện thanh toán phải được xác nhận trực tiếp theo từng thời điểm; không suy ra từ nội dung tham khảo trên website.",
        ],
      },
      {
        heading: "Xác nhận nội dung báo giá",
        paragraphs: [
          "Trước khi đặt mua, cần đối chiếu phiên bản xe, thiết bị chuyên dùng, hồ sơ, điều kiện giao nhận và các khoản chi phí liên quan bằng báo giá chính thức.",
        ],
      },
    ],
  },
  {
    slug: "luu-y-ho-so-va-cau-hinh-xe",
    category: "Lưu ý kỹ thuật",
    title: "Những điểm cần xác nhận về hồ sơ và cấu hình xe",
    summary:
      "Các thông số, giấy tờ và hạng mục chuyên dùng nên được xác nhận trước khi chốt phương án.",
    sections: [
      {
        heading: "Phân biệt thông tin tham khảo và hồ sơ thực tế",
        paragraphs: [
          "Tên mẫu xe, ảnh minh họa hoặc mô tả ngắn không thay thế hồ sơ kỹ thuật của đúng phiên bản. Cần kiểm tra giấy chứng nhận chất lượng, thông số xe cơ sở và tài liệu liên quan do đơn vị bán hàng cung cấp.",
        ],
      },
      {
        heading: "Làm rõ cấu hình lắp đặt",
        paragraphs: [
          "Với xe chuyên dùng, xác định các thiết bị, vật liệu, tải trọng, kích thước và yêu cầu vận hành. Thay đổi cấu hình có thể ảnh hưởng đến khối lượng, tải trọng và thủ tục đăng kiểm.",
        ],
      },
      {
        heading: "Trao đổi với đơn vị có chuyên môn",
        paragraphs: [
          "Các yêu cầu nghiệm thu, đăng kiểm và tiêu chuẩn chuyên ngành cần được xác minh theo quy định hiện hành với đơn vị có trách nhiệm. Nội dung trên trang chỉ là thông tin định hướng, không phải kết luận pháp lý hoặc xác nhận kỹ thuật.",
        ],
      },
    ],
  },
];
