import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "../../components/page-head";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Website tư vấn xe tải và xe chuyên dụng theo công việc: cách nội dung được tổ chức và thông tin doanh nghiệp đang chờ xác nhận.",
};

const points = [
  ["Thông tin theo công năng", "Nội dung chia theo nhóm xe và công việc dự kiến: chở hàng, chữa cháy, cứu hộ, môi trường."],
  ["Thông số cần xác nhận", "Tách bạch nội dung tham khảo với cấu hình và hồ sơ thực tế của từng xe."],
  ["Kết nối tư vấn", "Chuẩn bị yêu cầu rõ ràng trước khi liên hệ đơn vị bán hàng."],
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader current="/gioi-thieu" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Giới thiệu" }]}
          title="Chọn xe bắt đầu từ việc xe sẽ làm"
          lead="Website giúp doanh nghiệp tìm hiểu xe tải và xe chuyên dụng theo nhiệm vụ, đối chiếu thông tin cơ bản và chuẩn bị yêu cầu tư vấn."
        />
        <section className="section pg-after-head" aria-labelledby="dinh-huong-h">
          <div className="wrap grid grid--top">
            <div className="span-5 section-head">
              <h2 id="dinh-huong-h">Xe chuyên dụng cần làm rõ nhiều lớp thông tin</h2>
              <p>Xe cơ sở, phần chuyên dùng, điều kiện khai thác và hồ sơ đều ảnh hưởng tới cấu hình. Nội dung đi theo hành trình từ danh mục đến trao đổi cấu hình.</p>
              <p><Link className="link" href="/xe">Xem danh mục xe</Link></p>
            </div>
            <ul className="rows span-6 start-7">
              {points.map(([title, text]) => (
                <li key={title}>
                  <span className="rows__name">{title}</span>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="section ground-surface" aria-labelledby="doanh-nghiep-h">
          <div className="wrap grid grid--top">
            <div className="span-6 section-head">
              <h2 id="doanh-nghiep-h">Hồ sơ doanh nghiệp đang chờ xác nhận</h2>
            </div>
            <div className="span-5 start-8 stack-4">
              <p className="t-lead">Tên pháp nhân, kinh nghiệm, đối tác, địa chỉ, phạm vi dịch vụ và chính sách được doanh nghiệp cung cấp và duyệt trước khi công bố.</p>
              <p><Link className="link" href="/lien-he">Liên hệ trực tiếp</Link></p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
