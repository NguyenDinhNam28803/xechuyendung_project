export default function ContactInfo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`contact-info${compact ? " contact-info-compact" : ""}`}>
      <dl>
        <div>
          <dt>Người liên hệ</dt>
          <dd>Phước Nguyễn</dd>
        </div>
        <div>
          <dt>Điện thoại</dt>
          <dd><a href="tel:0977170705">0977170705</a></dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd><a href="mailto:phuocnguyen1108@gmail.com">phuocnguyen1108@gmail.com</a></dd>
        </div>
      </dl>
    </div>
  );
}
