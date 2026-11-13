import type { ImgHTMLAttributes } from "react";

/*
 * <img> thường (như kit cần) nhưng ảnh nội bộ đi qua bộ tối ưu của Next (/_next/image, WebP/AVIF
 * đúng cỡ), giống hàm img() của trang chủ. Ảnh gốc là PNG/JPG 0,2–3 MB nên không được trả thẳng.
 * Ảnh ngoài (URL tuyệt đối từ API) giữ nguyên vì chưa khai báo images.remotePatterns.
 */
const WIDTHS = [384, 640, 828, 1080, 1200, 1920];

type KitImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  alt: string;
  sizes: string;
  /** Bề rộng lớn nhất cần (px). Mặc định 1920. */
  maxWidth?: number;
};

export function optimizedUrl(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export default function KitImage({ src, alt, sizes, maxWidth = 1920, ...rest }: KitImageProps) {
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  if (!isLocal) {
    // eslint-disable-next-line @next/next/no-img-element -- kit dùng <img> thường
    return <img src={src} alt={alt} sizes={sizes} decoding="async" {...rest} />;
  }
  const widths = WIDTHS.filter((width) => width <= maxWidth);
  const list = widths.length > 0 ? widths : [WIDTHS[0]];
  const srcSet = list.map((width) => `${optimizedUrl(src, width)} ${width}w`).join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- kit dùng <img> thường, srcset trỏ tới /_next/image
    <img
      src={optimizedUrl(src, list[Math.min(3, list.length - 1)])}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      decoding="async"
      {...rest}
    />
  );
}
