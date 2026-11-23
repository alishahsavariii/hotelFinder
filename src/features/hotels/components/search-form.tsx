"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { BedDouble, CalendarDays, ChevronDown, MapPin, Minus, Plus, Search, UsersRound } from "lucide-react";
import { CITY_OPTIONS } from "../constants";
import { addDays, formatNumber, persianDateToISO, toPersianDateObject } from "../date";
import { validateCriteria } from "../params";
import type { HotelSearchCriteria, SearchFieldErrors } from "../types";

interface SearchFormProps {
  criteria: HotelSearchCriteria;
  today: string;
  onSearch: (criteria: HotelSearchCriteria) => void;
}

function safeCriteria(criteria: HotelSearchCriteria): HotelSearchCriteria {
  return {
    ...criteria,
    rooms: Number.isFinite(criteria.rooms) ? criteria.rooms : 1,
    adults: Number.isFinite(criteria.adults) ? criteria.adults : 2,
    children: Number.isFinite(criteria.children) ? criteria.children : 0,
  };
}

function GuestCounter({
  label,
  caption,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  caption: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="guest-counter">
      <span><strong>{label}</strong><small>{caption}</small></span>
      <div className="guest-stepper">
        <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`کاهش تعداد ${label}`}><Minus size={16} /></button>
        <span aria-live="polite">{formatNumber(value)}</span>
        <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`افزایش تعداد ${label}`}><Plus size={16} /></button>
      </div>
    </div>
  );
}

export function SearchForm({ criteria, today, onSearch }: SearchFormProps) {
  const [draft, setDraft] = useState<HotelSearchCriteria>(() => safeCriteria(criteria));
  const [errors, setErrors] = useState<SearchFieldErrors>({});
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guestsOpen) return;
    const outside = (event: PointerEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) setGuestsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGuestsOpen(false);
        guestsRef.current?.querySelector<HTMLButtonElement>(".guest-trigger")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [guestsOpen]);

  const changeCount = (key: "rooms" | "adults" | "children", value: number) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "rooms" && value > current.adults ? { adults: value } : {}),
    }));
    setErrors((current) => ({ ...current, [key]: undefined, adults: undefined, children: undefined }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCriteria(draft, today);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setGuestsOpen(false);
      onSearch(draft);
    }
  };

  const guestsError = errors.rooms ?? errors.adults ?? errors.children;
  const departureMin = draft.checkIn && toPersianDateObject(draft.checkIn)
    ? addDays(draft.checkIn, 1)
    : addDays(today, 1);
  const departureMax = draft.checkIn && toPersianDateObject(draft.checkIn)
    ? addDays(draft.checkIn, 30)
    : addDays(today, 30);

  return (
    <section className="search-panel site-container" aria-label="فرم جست‌وجوی هتل">
      <div className="search-panel-heading">
        <div className="search-panel-title"><span className="search-panel-title-icon"><BedDouble size={19} /></span><strong>هتل و اقامتگاه</strong><span className="panel-title-line" /></div>
        <span className="search-panel-note"><span className="note-dot" /> مقصدت رو انتخاب کن، ما بقیه‌ش رو پیدا می‌کنیم</span>
      </div>
      <form className="search-form-grid" onSubmit={submit} noValidate>
        <div className={`search-field ${errors.city ? "has-error" : ""}`}>
          <label htmlFor="destination">مقصد یا شهر</label>
          <div className="field-control">
            <MapPin size={20} className="field-icon" aria-hidden="true" />
            <select id="destination" value={draft.city} onChange={(event) => { setDraft((current) => ({ ...current, city: event.target.value })); setErrors((current) => ({ ...current, city: undefined })); }} aria-invalid={!!errors.city} aria-describedby={errors.city ? "destination-error" : undefined}>
              <option value="">انتخاب مقصد</option>
              {CITY_OPTIONS.map((city) => <option key={city.id} value={city.id}>{city.name}، {city.province}</option>)}
            </select>
            <ChevronDown size={16} className="field-chevron" aria-hidden="true" />
          </div>
          {errors.city && <p id="destination-error" className="form-error" role="alert">{errors.city}</p>}
        </div>

        <div className={`search-field ${errors.checkIn ? "has-error" : ""}`}>
          <label htmlFor="check-in">تاریخ ورود</label>
          <div className="field-control">
            <CalendarDays size={19} className="field-icon" aria-hidden="true" />
            <DatePicker
              id="check-in"
              value={toPersianDateObject(draft.checkIn)}
              onChange={(date) => {
                if (!date) return;
                const checkIn = persianDateToISO(date);
                setDraft((current) => ({ ...current, checkIn, checkOut: current.checkOut <= checkIn || current.checkOut > addDays(checkIn, 30) ? addDays(checkIn, 1) : current.checkOut }));
                setErrors((current) => ({ ...current, checkIn: undefined, checkOut: undefined }));
              }}
              calendar={persian}
              locale={persianFa}
              minDate={toPersianDateObject(today)}
              maxDate={toPersianDateObject(addDays(today, 365))}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              editable={false}
              placeholder="انتخاب تاریخ"
              inputClass="date-input"
              containerClassName="date-picker-container"
            />
          </div>
          {errors.checkIn && <p className="form-error" role="alert">{errors.checkIn}</p>}
        </div>

        <div className={`search-field ${errors.checkOut ? "has-error" : ""}`}>
          <label htmlFor="check-out">تاریخ خروج</label>
          <div className="field-control">
            <CalendarDays size={19} className="field-icon" aria-hidden="true" />
            <DatePicker
              id="check-out"
              value={toPersianDateObject(draft.checkOut)}
              onChange={(date) => {
                if (!date) return;
                setDraft((current) => ({ ...current, checkOut: persianDateToISO(date) }));
                setErrors((current) => ({ ...current, checkOut: undefined }));
              }}
              calendar={persian}
              locale={persianFa}
              minDate={toPersianDateObject(departureMin)}
              maxDate={toPersianDateObject(departureMax)}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              editable={false}
              placeholder="انتخاب تاریخ"
              inputClass="date-input"
              containerClassName="date-picker-container"
            />
          </div>
          {errors.checkOut && <p className="form-error" role="alert">{errors.checkOut}</p>}
        </div>

        <div className={`search-field guest-field ${guestsError ? "has-error" : ""}`} ref={guestsRef}>
          <span className="field-label" id="guest-label">اتاق و مسافر</span>
          <button type="button" className="field-control guest-trigger" onClick={() => setGuestsOpen((open) => !open)} aria-labelledby="guest-label guest-value" aria-expanded={guestsOpen} aria-haspopup="dialog" aria-controls="guest-popover">
            <UsersRound size={20} className="field-icon" aria-hidden="true" />
            <span id="guest-value" className="guest-value">{formatNumber(draft.rooms)} اتاق، {formatNumber(draft.adults + draft.children)} مسافر</span>
            <ChevronDown size={16} className={`field-chevron ${guestsOpen ? "rotate" : ""}`} aria-hidden="true" />
          </button>
          {guestsError && <p className="form-error" role="alert">{guestsError}</p>}
          {guestsOpen && (
            <div className="guest-popover" id="guest-popover" role="dialog" aria-label="تعداد اتاق و مسافر">
              <div className="guest-popover-head"><strong>همسفرهات چند نفرن؟</strong><small>اتاق و تعداد مسافران را مشخص کن</small></div>
              <GuestCounter label="اتاق" caption="تعداد اتاق‌ها" value={draft.rooms} min={1} max={4} onChange={(value) => changeCount("rooms", value)} />
              <GuestCounter label="بزرگسال" caption="۱۲ سال به بالا" value={draft.adults} min={1} max={12} onChange={(value) => changeCount("adults", value)} />
              <GuestCounter label="کودک" caption="تا ۱۱ سال" value={draft.children} min={0} max={6} onChange={(value) => changeCount("children", value)} />
              <button type="button" className="guest-done" onClick={() => setGuestsOpen(false)}>تأیید</button>
            </div>
          )}
        </div>

        <button className="search-submit" type="submit"><Search size={21} strokeWidth={2.4} /><span>جست‌وجوی هتل</span></button>
      </form>
    </section>
  );
}
