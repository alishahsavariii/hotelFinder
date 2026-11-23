"use client";

import { useState } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { AMENITY_OPTIONS, MAX_PRICE } from "../constants";
import { formatNumber } from "../date";
import type { Amenity, HotelFilters } from "../types";

interface FiltersPanelProps {
  filters: HotelFilters;
  onChange: (filters: HotelFilters) => void;
  onReset: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function FiltersPanel({ filters, onChange, onReset, mobileOpen, onClose }: FiltersPanelProps) {
  const [minInput, setMinInput] = useState(filters.minPrice === null ? "" : String(filters.minPrice));
  const [maxInput, setMaxInput] = useState(filters.maxPrice === null ? "" : String(filters.maxPrice));
  const [priceError, setPriceError] = useState("");

  const activeCount = (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) + filters.stars.length + filters.amenities.length;
  const sliderValue = maxInput === "" ? MAX_PRICE : Math.max(0, Math.min(MAX_PRICE, Number(maxInput) || 0));

  const applyPrice = () => {
    const min = minInput.trim() === "" ? null : Number(minInput);
    const max = maxInput.trim() === "" ? null : Number(maxInput);
    if (
      (min !== null && (!Number.isInteger(min) || min < 0 || min > MAX_PRICE)) ||
      (max !== null && (!Number.isInteger(max) || max < 0 || max > MAX_PRICE))
    ) {
      setPriceError("مبلغی بین ۰ تا ۳۰ میلیون تومان وارد کنید.");
      return;
    }
    if (min !== null && max !== null && min > max) {
      setPriceError("حداکثر قیمت باید از حداقل بیشتر باشد.");
      return;
    }
    setPriceError("");
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const toggleStar = (star: number) => {
    onChange({ ...filters, stars: filters.stars.includes(star) ? filters.stars.filter((item) => item !== star) : [...filters.stars, star] });
  };
  const toggleAmenity = (amenity: Amenity) => {
    onChange({ ...filters, amenities: filters.amenities.includes(amenity) ? filters.amenities.filter((item) => item !== amenity) : [...filters.amenities, amenity] });
  };

  return (
    <aside className={`filters-panel ${mobileOpen ? "mobile-open" : ""}`} aria-label="فیلترهای هتل">
      <div className="filters-heading">
        <div className="filters-title"><span className="filters-title-icon"><SlidersHorizontal size={18} /></span><h2>فیلترها</h2>{activeCount > 0 && <span className="filter-count">{formatNumber(activeCount)}</span>}</div>
        <button type="button" className="filters-reset" onClick={() => { onReset(); setPriceError(""); }} disabled={activeCount === 0}><RotateCcw size={14} /> پاک کردن</button>
        <button type="button" className="filters-close" onClick={onClose} aria-label="بستن فیلترها"><X size={21} /></button>
      </div>

      <div className="filter-section">
        <div className="filter-section-heading"><h3>قیمت هر شب</h3><span>تومان</span></div>
        <p className="filter-description">بودجهٔ مناسب سفر خودت رو مشخص کن</p>
        <input
          className="price-slider"
          type="range"
          min="0"
          max={MAX_PRICE}
          step="100000"
          value={sliderValue}
          onChange={(event) => { setMaxInput(event.target.value); setPriceError(""); }}
          aria-label="حداکثر قیمت هر شب"
          style={{ background: `linear-gradient(to left, var(--teal) ${(sliderValue / MAX_PRICE) * 100}%, var(--slider-track) ${(sliderValue / MAX_PRICE) * 100}%)` }}
        />
        <div className="price-range-labels"><span>۰</span><span>{formatNumber(MAX_PRICE)}</span></div>
        <div className="price-inputs">
          <label><span>از</span><input type="number" inputMode="numeric" min="0" max={MAX_PRICE} value={minInput} onChange={(event) => { setMinInput(event.target.value); setPriceError(""); }} placeholder="۰" aria-label="حداقل قیمت به تومان" /></label>
          <span className="price-input-divider">—</span>
          <label><span>تا</span><input type="number" inputMode="numeric" min="0" max={MAX_PRICE} value={maxInput} onChange={(event) => { setMaxInput(event.target.value); setPriceError(""); }} placeholder="۳۰,۰۰۰,۰۰۰" aria-label="حداکثر قیمت به تومان" /></label>
        </div>
        {priceError && <p className="filter-error" role="alert">{priceError}</p>}
        <button type="button" className="apply-price" onClick={applyPrice}>اعمال بازهٔ قیمت</button>
      </div>

      <div className="filter-section">
        <div className="filter-section-heading"><h3>درجه هتل</h3></div>
        <div className="filter-options">
          {[5, 4, 3].map((star) => (
            <div className="filter-option" key={star}>
              <label className="option-label"><input type="checkbox" checked={filters.stars.includes(star)} onChange={() => toggleStar(star)} /><span>{formatNumber(star)} ستاره</span></label>
              <span className="option-star" aria-hidden="true">★</span>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-section amenities-section">
        <div className="filter-section-heading"><h3>امکانات هتل</h3></div>
        <div className="filter-options">
          {AMENITY_OPTIONS.map((amenity) => (
            <div className="filter-option" key={amenity.id}>
              <label className="option-label"><input type="checkbox" checked={filters.amenities.includes(amenity.id)} onChange={() => toggleAmenity(amenity.id)} /><span>{amenity.label}</span></label>
            </div>
          ))}
        </div>
      </div>
      <div className="filters-footnote">قیمت‌ها نمونه هستند و برای هر شب و هر اتاق نمایش داده می‌شوند.</div>
      <button className="mobile-filters-done" type="button" onClick={onClose}>مشاهدهٔ نتایج</button>
    </aside>
  );
}
