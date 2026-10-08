"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getVehicleBySlug } from "../data/vehicles";

const vehicleOptions = [
  "Xe tải",
  "Xe chữa cháy",
  "Xe cứu hộ",
  "Xe bồn / xe môi trường",
  "Khác / cần tư vấn",
];

export default function ContactForm() {
  const [feedback, setFeedback] = useState("");
  const searchParams = useSearchParams();
  const vehicle = getVehicleBySlug(searchParams.get("xe") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(
      "Các trường bắt buộc đã hợp lệ. Đây là bản giao diện mẫu: yêu cầu chưa được gửi hoặc lưu. Vui lòng liên hệ trực tiếp qua kênh chính thức sau khi thông tin doanh nghiệp được cập nhật.",
    );
  }

  return (
    <div className="contact-form-panel">
      <div className="form-heading">
        <div>
          <span className="form-eyebrow">YÊU CẦU TƯ VẤN</span>
          <h2>Chia sẻ nhu cầu của bạn</h2>
        </div>
        <span className="form-required"><i /> Trường bắt buộc</span>
      </div>

      <div className="form-demo-notice">
        <span aria-hidden="true">i</span>
        <p><strong>Biểu mẫu đang ở chế độ xem trước.</strong> Dữ liệu chưa được gửi đi hoặc lưu trữ.</p>
      </div>

      {vehicle && (
        <div className="contact-form-vehicle">
          <span>XE ĐANG QUAN TÂM</span>
          <strong>{vehicle.name}</strong>
        </div>
      )}

      <form
        className="contact-form"
        onChange={() => setFeedback("")}
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="contact-name">Họ và tên <span>*</span></label>
          <input autoComplete="name" id="contact-name" maxLength={100} name="name" placeholder="Nhập họ và tên" required />
        </div>
        <div className="form-field">
          <label htmlFor="contact-phone">Số điện thoại <span>*</span></label>
          <input autoComplete="tel" id="contact-phone" inputMode="tel" maxLength={20} name="phone" placeholder="Ví dụ: 09xx xxx xxx" required type="tel" />
        </div>
        <div className="form-field">
          <label htmlFor="contact-category">Dòng xe quan tâm <span>*</span></label>
          <select defaultValue={vehicle?.category ?? ""} id="contact-category" name="category" required>
            <option disabled value="">Chọn dòng xe</option>
            {vehicleOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="contact-location">Tỉnh / thành phố</label>
          <input autoComplete="address-level1" id="contact-location" maxLength={80} name="location" placeholder="Địa điểm dự kiến nhận xe" />
        </div>
        <div className="form-field form-field-full">
          <label htmlFor="contact-message">Nhu cầu của bạn</label>
          <textarea id="contact-message" maxLength={1000} name="message" placeholder="Mô tả công việc, tải trọng hoặc cấu hình bạn đang tìm..." rows={4} />
        </div>
        <div className="form-submit-row">
          <p>Không nhập thông tin nhạy cảm. Form hiện không truyền dữ liệu đến máy chủ.</p>
          <button className="button button-primary" type="submit">Kiểm tra thông tin <span aria-hidden="true">→</span></button>
        </div>
        {feedback && <p className="form-feedback" role="status" aria-live="polite">{feedback}</p>}
      </form>
    </div>
  );
}
