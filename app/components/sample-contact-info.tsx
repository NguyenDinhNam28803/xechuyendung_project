export default function SampleContactInfo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`sample-contact-info${compact ? " sample-contact-info-compact" : ""}`}>
      <dl>
        <div>
          <dt>Hotline mẫu</dt>
          <dd>09xx xxx xxx</dd>
        </div>
        <div>
          <dt>Email mẫu</dt>
          <dd>email@tenmien.vn</dd>
        </div>
        <div>
          <dt>Địa chỉ</dt>
          <dd>Đang cập nhật</dd>
        </div>
        {!compact && (
          <div>
            <dt>Giờ làm việc mẫu</dt>
            <dd>Thứ 2–Thứ 7 · 08:00–17:30</dd>
          </div>
        )}
      </dl>
      <p>Thông tin minh họa, chưa phải kênh liên hệ thực tế. Vui lòng gửi yêu cầu qua biểu mẫu.</p>
    </div>
  );
}
