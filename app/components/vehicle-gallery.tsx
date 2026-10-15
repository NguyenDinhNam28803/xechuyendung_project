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

const minimumGalleryImages = 4;

export default function VehicleGallery({
  artwork,
  images,
  name,
  badge,
}: VehicleGalleryProps) {
  const galleryImages: (string | null)[] = [...images];
  while (galleryImages.length < minimumGalleryImages) galleryImages.push(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryImages[selectedIndex];

  return (
    <div className="vehicle-gallery">
      <div className={`detail-artwork card-image-${artwork}`}>
        <span className="vehicle-badge"><i />{badge}</span>
        {selectedImage ? (
          <Image
            alt={`${name} - ảnh ${selectedIndex + 1}`}
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
      <div className="gallery-thumbnails" aria-label={`Thư viện ảnh ${name}`}>
        {galleryImages.map((image, index) => (
          <button
            aria-label={`Hiển thị ảnh ${index + 1} của ${name}${image ? "" : " (hình minh họa)"}`}
            aria-pressed={selectedIndex === index}
            className="gallery-thumbnail"
            key={`${image ?? "illustration"}-${index}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            {image ? (
              <Image
                alt=""
                fill
                sizes="100px"
                src={image}
              />
            ) : (
              <>
                <VehicleArtwork kind={artwork} />
                <span>Minh họa</span>
              </>
            )}
          </button>
        ))}
      </div>
      {images.length === 0 && (
        <p className="gallery-note">Hình minh họa; ảnh thực tế sẽ hiển thị tại đây khi được cập nhật.</p>
      )}
    </div>
  );
}
