"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { vehicleCategories, vehicles, type Vehicle } from "../data/vehicles";

const bannerImageCount = 10;
const bannerInterval = 3000;

type BannerSlide = {
  vehicle: Vehicle;
  image: string;
};

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

const vehiclesWithImages = vehicles.filter((vehicle) => vehicle.images.length > 0);

function getRandomSlides(): BannerSlide[] {
  const categorySelections = vehicleCategories
    .slice(1)
    .map((category) =>
      shuffle(vehiclesWithImages.filter((vehicle) => vehicle.category === category))[0],
    )
    .filter((vehicle): vehicle is Vehicle => vehicle !== undefined);
  const selectedSlugs = new Set(categorySelections.map((vehicle) => vehicle.slug));
  const remainingVehicles = shuffle(
    vehiclesWithImages.filter((vehicle) => !selectedSlugs.has(vehicle.slug)),
  );
  const selectedVehicles = shuffle([
    ...categorySelections,
    ...remainingVehicles.slice(0, bannerImageCount - categorySelections.length),
  ]);

  return selectedVehicles.map((vehicle) => ({
    vehicle,
    image: vehicle.images[0],
  }));
}

const initialSlides = vehiclesWithImages.slice(0, bannerImageCount).map((vehicle) => ({
  vehicle,
  image: vehicle.images[0],
}));

export default function HomeHeroBanner() {
  const [slides, setSlides] = useState(initialSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePausedState = () => setIsPaused(reducedMotion.matches);
    const frameId = window.requestAnimationFrame(() => {
      setSlides(getRandomSlides());
      updatePausedState();
    });

    reducedMotion.addEventListener("change", updatePausedState);

    return () => {
      window.cancelAnimationFrame(frameId);
      reducedMotion.removeEventListener("change", updatePausedState);
    };
  }, []);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, bannerInterval);

    return () => window.clearInterval(intervalId);
  }, [isPaused, slides.length]);

  function showPreviousSlide() {
    setActiveIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
  }

  function showNextSlide() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
  }

  if (!activeSlide) return null;

  return (
    <div
      className="hero-scene"
      aria-label="Ảnh giới thiệu các dòng xe"
      aria-roledescription="băng chuyền"
    >
      <div className="scene-circle" />
      <Image
        key={activeSlide.image}
        alt={`Ảnh tham khảo ${activeSlide.vehicle.name}`}
        className="hero-real-photo"
        fill
        onLoad={(event) => event.currentTarget.classList.add("is-loaded")}
        preload={activeIndex === 0}
        sizes="(max-width: 760px) 100vw, 50vw"
        src={activeSlide.image}
      />
      <div className="scene-label"><span /> ẢNH XE THAM KHẢO</div>
      <div className="scene-caption">
        <span>{activeSlide.vehicle.category}</span>
        <strong>{activeSlide.vehicle.name}</strong>
      </div>
      <div className="hero-banner-controls" aria-label="Điều khiển ảnh banner">
        <button
          aria-label="Xem ảnh xe trước"
          className="hero-banner-control"
          onClick={showPreviousSlide}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className="hero-banner-count" aria-live="off">
          {String(activeIndex + 1).padStart(2, "0")} / {String(bannerImageCount).padStart(2, "0")}
        </span>
        <button
          aria-label="Xem ảnh xe tiếp theo"
          className="hero-banner-control"
          onClick={showNextSlide}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
        <button
          aria-label={isPaused ? "Tiếp tục tự chuyển ảnh" : "Tạm dừng tự chuyển ảnh"}
          className="hero-banner-control hero-banner-toggle"
          onClick={() => setIsPaused((paused) => !paused)}
          type="button"
        >
          <span aria-hidden="true">{isPaused ? "▶" : "Ⅱ"}</span>
        </button>
      </div>
      <Link
        aria-label={`Xem thông tin ${activeSlide.vehicle.name}`}
        className="hero-banner-link"
        href={`/xe/${activeSlide.vehicle.slug}`}
      />
    </div>
  );
}
