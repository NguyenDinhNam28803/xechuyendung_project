"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { contactVehicleCategories, getVehicleBySlug } from "../data/vehicles";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const searchParams = useSearchParams();
  const vehicleSlug = searchParams.get("xe") ?? "";
  const vehicle = getVehicleBySlug(vehicleSlug);
  const isSubmitting = status.kind === "sending";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setStatus({ kind: "sending", message: "Đang gửi yêu cầu…" });
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
          vehicleSlug: vehicle?.slug ?? vehicleSlug,
          companyWebsite: formData.get("companyWebsite"),
          consent: formData.get("consent") === "on",
        }),
      });
      const result: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error ?? "Không thể gửi yêu cầu lúc này. Vui lòng thử lại.");
      }
      form.reset();
      setStatus({ kind: "sent", message: "Đã nhận yêu cầu. Bên tư vấn sẽ gọi lại theo số điện thoại bạn để lại." });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Không thể gửi yêu cầu lúc này. Vui lòng thử lại.",
      });
    }
  }

  return (
    <div className="card pg-form-card">
      <div className="section-head pg-form-card__head">
        <h2 id="form-h">Yêu cầu tư vấn</h2>
        <p className="t-small muted">Trường có dấu * là bắt buộc. Không nhập thông tin nhạy cảm.</p>
      </div>

      {vehicle && (
        <p className="pill pg-form-vehicle">
          <span className="muted">Xe đang quan tâm:</span> {vehicle.name}
        </p>
      )}

      <form
        aria-labelledby="form-h"
        className="form"
        onChange={() => {
          if (status.kind === "sent" || status.kind === "error") setStatus({ kind: "idle", message: "" });
        }}
        onSubmit={handleSubmit}
      >
        <div className="pg-honeypot" aria-hidden="true">
          <label htmlFor="contact-company-website">Website công ty</label>
          <input autoComplete="off" id="contact-company-website" name="companyWebsite" tabIndex={-1} />
        </div>
        <label className="field" htmlFor="contact-name">
          Họ và tên *
          <input autoComplete="name" id="contact-name" maxLength={100} name="name" required />
        </label>
        <label className="field" htmlFor="contact-phone">
          Số điện thoại *
          <input
            autoComplete="tel"
            id="contact-phone"
            inputMode="tel"
            maxLength={20}
            name="phone"
            placeholder="0901 234 567"
            required
            type="tel"
          />
        </label>
        <label className="field" htmlFor="contact-category">
          Dòng xe quan tâm *
          <select defaultValue={vehicle?.category ?? ""} id="contact-category" name="category" required>
            <option disabled value="">Chọn dòng xe</option>
            {contactVehicleCategories.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field" htmlFor="contact-location">
          Tỉnh / thành phố nhận xe
          <input autoComplete="address-level1" id="contact-location" maxLength={80} name="location" />
        </label>
        <label className="field field--full" htmlFor="contact-message">
          Nhu cầu
          <textarea
            id="contact-message"
            maxLength={1000}
            name="message"
            placeholder="Công việc của xe, tải trọng hoặc dung tích, cấu hình đang tìm"
            rows={4}
          />
        </label>
        <div className="field--full pg-consent">
          <input id="contact-consent" name="consent" required type="checkbox" />
          <label htmlFor="contact-consent">
            Tôi đồng ý để đơn vị lưu thông tin liên hệ và dùng thông tin này để phản hồi yêu cầu tư vấn. Tôi đã xem{" "}
            <Link className="pg-inline-link" href="/chinh-sach">thông tin quyền riêng tư</Link>.
          </label>
        </div>
        <div className="btn-row">
          <button className="btn btn--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Đang gửi…" : "Gửi yêu cầu"}
          </button>
        </div>
        <p
          aria-live="polite"
          className="form__status"
          data-state={status.kind}
          role="status"
        >
          {status.message}
        </p>
      </form>
    </div>
  );
}
