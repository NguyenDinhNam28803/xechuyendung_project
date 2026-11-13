import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "../../components/page-head";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Chuẩn bị trước khi mua xe",
  description: "Năm nhóm thông tin nên chuẩn bị khi tìm xe tải hoặc xe chuyên dụng.",
};

const checklist = [
  ["Công việc chính", "Chở loại hàng nào hoặc xe sẽ phục vụ nhiệm vụ gì?"],
  ["Điều kiện sử dụng", "Địa hình, quãng đường, tần suất hoạt động và môi trường khai thác ra sao?"],
  ["Yêu cầu kỹ thuật", "Tải trọng, dung tích, kích thước, thiết bị hoặc tiêu chuẩn nào cần đáp ứng?"],
  ["Khu vực và thời gian", "Xe hoạt động và dự kiến nhận ở tỉnh/thành nào, vào khoảng thời gian nào?"],
  ["Hồ sơ và ngân sách", "Đơn vị cần những giấy tờ gì và phạm vi ngân sách dự kiến ra sao?"],
];

export default function BuyingGuidePage() {
  return (
    <>
      <SiteHeader current="/tu-van-mua-xe" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Tư vấn mua xe" }]}
          title="Năm câu hỏi trước khi chọn xe"
          lead="Không cần có sẵn mọi thông số. Bắt đầu từ việc xe cần làm và giới hạn vận hành, rồi trao đổi cấu hình, hồ sơ và báo giá."
        />
        <section className="section pg-after-head" aria-labelledby="checklist-h">
          <div className="wrap grid grid--top">
            <div className="span-4 section-head">
              <h2 id="checklist-h">Danh sách chuẩn bị</h2>
              <p>Ghi câu trả lời vào ô “Nhu cầu” của biểu mẫu liên hệ.</p>
            </div>
            <ol className="rows span-7 start-6 pg-numbered">
              {checklist.map(([label, description], index) => (
                <li key={label}>
                  <span className="rows__name"><span className="step-num">{index + 1}</span>{label}</span>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="section ground-surface" aria-labelledby="xac-nhan-h">
          <div className="wrap grid grid--top">
            <div className="span-6 section-head">
              <h2 id="xac-nhan-h">Xác nhận hồ sơ và cấu hình trước khi quyết định</h2>
            </div>
            <div className="span-5 start-8 stack-4">
              <p className="t-lead">Ảnh và mô tả trên website không thay thế thông số của đúng phiên bản xe. Đăng kiểm và tiêu chuẩn chuyên ngành cần được xác minh với đơn vị có trách nhiệm.</p>
              <p><Link className="link" href="/tin-tuc">Đọc bài viết kiến thức</Link></p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        title="Đã có câu trả lời?"
        text="Gửi nhóm xe và nhiệm vụ để bắt đầu trao đổi cấu hình."
      />
    </>
  );
}
