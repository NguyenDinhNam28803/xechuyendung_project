"use client";

import { useState } from "react";
import type { VehicleArtworkKind } from "../data/vehicles";
import KitImage from "./kit-image";
import VehicleArtwork from "./vehicle-artwork";

type VehicleGalleryProps = {
  artwork: VehicleArtworkKind;
  images: string[];
  name: string;
};

export default function VehicleGallery({ artwork, images, name }: VehicleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div className="pg-gallery">
      <figure className="pg-gallery__main">
        {selectedImage ? (
          <KitImage
            alt={`${name}, ảnh ${selectedIndex + 1} trên ${images.length}`}
            fetchPriority={selectedIndex === 0 ? "high" : undefined}
            key={selectedImage}
            sizes="(max-width: 1023px) 100vw, 760px"
            src={selectedImage}
          />
        ) : (
          <div className="pg-artwork"><VehicleArtwork kind={artwork} /></div>
        )}
      </figure>
      {images.length > 1 && (
        <div className="pg-gallery__thumbs" role="group" aria-label={`Thư viện ảnh ${name}`}>
          {images.map((image, index) => (
            <button
              aria-label={`Xem ảnh ${index + 1} của ${name}`}
              aria-pressed={selectedIndex === index}
              key={image}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <KitImage alt="" loading="lazy" maxWidth={384} sizes="120px" src={image} />
            </button>
          ))}
        </div>
      )}
      <p className="t-small muted">
        {images.length > 0
          ? `${images.length} ảnh tham khảo. Logo hoặc số điện thoại in trong ảnh (nếu có) thuộc nguồn ảnh, không phải của website này.`
          : "Hình minh họa cho nhóm xe; chưa có ảnh thực tế cho cấu hình này."}
      </p>
    </div>
  );
}
