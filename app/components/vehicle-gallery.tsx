"use client";

import Image from "next/image";
import { useState } from "react";
import type { VehicleArtworkKind } from "../data/vehicles";
import VehicleArtwork from "./vehicle-artwork";

type VehicleGalleryProps = {
  artwork: VehicleArtworkKind;
  images: string[];
  name: string;
  badge: string;
};

export default function VehicleGallery({
  artwork,
  images,
  name,
  badge,
}: VehicleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div className="vehicle-gallery">
      <div className={`detail-artwork card-image-${artwork}`}>
        <span className="vehicle-badge"><i />{badge}</span>
        {selectedImage ? (
          <Image
            alt={`Ảnh tham khảo ${name} - ảnh ${selectedIndex + 1}`}
            className="gallery-main-image"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
            src={selectedImage}
          />
        ) : (
          <>
            <VehicleArtwork kind={artwork} />
            <span className="gallery-placeholder-label">Hình minh họa · Ảnh {selectedIndex + 1}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label={`Thư viện ảnh ${name}`}>
          {images.map((image, index) => (
            <button
              aria-label={`Hiển thị ảnh ${index + 1} của ${name}`}
              aria-pressed={selectedIndex === index}
              className="gallery-thumbnail"
              key={image}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image alt="" fill sizes="100px" src={image} />
            </button>
          ))}
        </div>
      )}
      <p className="gallery-note">
        {images.length > 0
          ? `${images.length} ảnh tham khảo; vui lòng xác nhận ảnh và cấu hình xe thực tế trước khi giao dịch.`
          : "Hình minh họa cho nhóm xe; chưa có ảnh thực tế phù hợp với cấu hình này."}
      </p>
    </div>
  );
}
