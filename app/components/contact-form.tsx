"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const vehicle = getVehicleBySlug(searchParams.get("xe") ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback("");
    setIsSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          category: formData.get("category"),
          location: formData.get("location"),
          message: formData.get("message"),
          vehicleSlug: vehicle?.slug ?? "",
          companyWebsite: formData.get("companyWebsite"),
          consent: formData.get("consent") === "on",
        }),
      });
      const result: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Không thể gửi yêu cầu lúc này. Vui lòng thử lại.");
      }

      form.reset();
      setIsSuccess(true);
      setFeedback("Yêu cầu đã được gửi. Chúng tôi sẽ liên hệ với bạn sớm.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu lúc này. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        <p><strong>Thông tin sẽ được lưu để tư vấn.</strong> Dữ liệu được chuyển tới Google Sheets do đơn vị quản lý và chỉ dùng để phản hồi yêu cầu của bạn.</p>
      </div>

      {vehicle && (
        <div className="contact-form-vehicle">
          <span>XE ĐANG QUAN TÂM</span>
          <strong>{vehicle.name}</strong>
        </div>
      )}

      <form
        className="contact-form"
        onChange={() => {
          setFeedback("");
          setIsSuccess(false);
        }}
        onSubmit={handleSubmit}
      >
        <div className="contact-form-honeypot" aria-hidden="true">
          <label htmlFor="contact-company-website">Website công ty</label>
          <input
            autoComplete="off"
            id="contact-company-website"
            name="companyWebsite"
            tabIndex={-1}
          />
        </div>
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
        <div className="form-consent">
          <input id="contact-consent" name="consent" required type="checkbox" />
          <label htmlFor="contact-consent">
            Tôi đồng ý để đơn vị lưu thông tin trên Google Sheets và dùng thông tin này để phản hồi yêu cầu tư vấn.{" "}
            Xem <Link href="/chinh-sach">thông tin quyền riêng tư</Link>.
          </label>
        </div>
        <div className="form-submit-row">
          <p>
            Không nhập thông tin nhạy cảm.
          </p>
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"} <span aria-hidden="true">→</span>
          </button>
        </div>
        {feedback && (
          <p
            className={`form-feedback${isSuccess ? " form-feedback-success" : " form-feedback-error"}`}
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}
