"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CalendarDays, ChevronLeft, Hotel, MapPin, RotateCcw, SearchX, SlidersHorizontal, UsersRound } from "lucide-react";
import { fetchHotelResults } from "../api/client";
import { getCityName, SORT_OPTIONS } from "../constants";
import { formatJalali, formatNumber, nightsBetween } from "../date";
import { defaultFilters, parseSearchRequest, readCriteria, toSearchQuery } from "../params";
import type { HotelFilters, HotelSearchCriteria, HotelSearchRequest, HotelSearchResponse, SortOption } from "../types";
import { FiltersPanel } from "./filters-panel";
import { HotelCard } from "./hotel-card";
import { SearchForm } from "./search-form";

type LoadState =
  | { status: "loading"; query: string; retry: number }
  | { status: "success"; query: string; retry: number; data: HotelSearchResponse }
  | { status: "error"; query: string; retry: number; message: string };

function ResultsSkeleton() {
  return (
    <div className="hotel-list" aria-label="در حال دریافت هتل‌ها" role="status">
      {[1, 2, 3].map((item) => <div className="skeleton-card" key={item}><div className="skeleton-image skeleton-shimmer" /><div className="skeleton-body"><div className="skeleton-line short skeleton-shimmer" /><div className="skeleton-line title skeleton-shimmer" /><div className="skeleton-line medium skeleton-shimmer" /><div className="skeleton-line long skeleton-shimmer" /></div><div className="skeleton-side"><div className="skeleton-line medium skeleton-shimmer" /><div className="skeleton-line title skeleton-shimmer" /></div></div>)}
      <span className="sr-only">در حال بارگذاری نتایج جست‌وجو</span>
    </div>
  );
}

export function SearchExperience({ today }: { today: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [retry, setRetry] = useState(0);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [state, setState] = useState<LoadState>({ status: "loading", query: queryString, retry: 0 });

  const criteriaQuery = new URLSearchParams();
  for (const key of ["city", "checkIn", "checkOut", "rooms", "adults", "children"]) {
    const value = searchParams.get(key);
    if (value !== null) criteriaQuery.set(key, value);
  }
  const criteriaString = criteriaQuery.toString();
  const criteria = useMemo(() => readCriteria(new URLSearchParams(criteriaString)), [criteriaString]);
  const parsed = useMemo(() => parseSearchRequest(new URLSearchParams(queryString), today), [queryString, today]);
  const filters = useMemo<HotelFilters>(() => parsed.ok ? {
    minPrice: parsed.value.minPrice,
    maxPrice: parsed.value.maxPrice,
    stars: parsed.value.stars,
    amenities: parsed.value.amenities,
    sort: parsed.value.sort,
  } : defaultFilters(), [parsed]);
  const request: HotelSearchRequest = parsed.ok ? parsed.value : { ...criteria, ...filters };

  useEffect(() => {
    const controller = new AbortController();
    fetchHotelResults(queryString, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setState({ status: "success", query: queryString, retry, data }); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", query: queryString, retry, message: error instanceof Error ? error.message : "خطایی در دریافت نتایج رخ داد." });
      });
    return () => controller.abort();
  }, [queryString, retry]);

  const visibleState: LoadState = state.query === queryString && state.retry === retry ? state : { status: "loading", query: queryString, retry };
  const cityName = getCityName(criteria.city) || "مقصد";
  const nights = parsed.ok ? nightsBetween(criteria.checkIn, criteria.checkOut) : 0;
  const activeFilters = (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) + filters.stars.length + filters.amenities.length;

  const navigate = (next: HotelSearchRequest) => {
    const nextQuery = toSearchQuery(next);
    if (nextQuery === queryString) setRetry((value) => value + 1);
    else router.push(`${pathname}?${nextQuery}`, { scroll: false });
  };
  const changeFilters = (nextFilters: HotelFilters) => navigate({ ...request, ...nextFilters });
  const resetFilters = () => {
    setFilterResetKey((value) => value + 1);
    changeFilters({ ...defaultFilters(), sort: filters.sort });
  };
  const search = (nextCriteria: HotelSearchCriteria) => {
    navigate({ ...nextCriteria, ...defaultFilters() });
    if (window.innerWidth < 768) {
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };
  const changeSort = (sort: SortOption) => changeFilters({ ...filters, sort });
  const focusSearch = () => {
    document.getElementById("destination")?.focus();
    document.querySelector(".search-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <SearchForm key={criteriaString} criteria={criteria} today={today} onSearch={search} />
      <main className="results-section site-container" id="results">
        <nav className="breadcrumbs" aria-label="مسیر صفحه"><Link href="/">خانه</Link><ChevronLeft size={14} /><span>هتل‌ها</span><ChevronLeft size={14} /><strong>{cityName}</strong></nav>
        <div className="results-heading-row">
          <div><span className="section-kicker"><span className="kicker-dot" /> پیدا کن، مقایسه کن، سفر کن</span><h2>هتل‌های {cityName}</h2><p>از بین اقامتگاه‌های منتخب، جایی که با سفرت جور درمیاد رو پیدا کن.</p></div>
          <div className="results-found"><span className="results-found-icon"><Hotel size={20} /></span><span><strong>{visibleState.status === "success" ? formatNumber(visibleState.data.total) : "—"} اقامتگاه</strong><small>متناسب با جست‌وجوی شما</small></span></div>
        </div>
        <div className="search-summary" aria-label="خلاصه جست‌وجو">
          <span><MapPin size={17} /><strong>{cityName}</strong></span>
          <i />
          <span><CalendarDays size={17} />{formatJalali(criteria.checkIn)} تا {formatJalali(criteria.checkOut)}{nights > 0 && <small>({formatNumber(nights)} شب)</small>}</span>
          <i />
          <span><UsersRound size={17} />{formatNumber(Number.isFinite(criteria.rooms) ? criteria.rooms : 1)} اتاق، {formatNumber(Number.isFinite(criteria.adults + criteria.children) ? criteria.adults + criteria.children : 2)} مسافر</span>
        </div>

        <div className="listing-layout">
          {mobileFiltersOpen && <button className="filter-backdrop" type="button" aria-label="بستن فیلترها" onClick={() => setMobileFiltersOpen(false)} />}
          <FiltersPanel key={`${filters.minPrice ?? "all"}-${filters.maxPrice ?? "all"}-${filterResetKey}`} filters={filters} onChange={changeFilters} onReset={resetFilters} mobileOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} />
          <div className="listing-main">
            <div className="listing-toolbar">
              <div className="listing-toolbar-start"><strong>{visibleState.status === "success" ? `${formatNumber(visibleState.data.total)} هتل پیدا شد` : "نتایج جست‌وجو"}</strong><span className="toolbar-separator" /><span>قیمت‌ها به تومان است</span></div>
              <div className="listing-toolbar-actions">
                <button type="button" className="mobile-filter-button" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={18} /> فیلترها{activeFilters > 0 && <b>{formatNumber(activeFilters)}</b>}</button>
                <label className="sort-control"><span>مرتب‌سازی:</span><select value={filters.sort} onChange={(event) => changeSort(event.target.value as SortOption)} aria-label="مرتب‌سازی نتایج">{SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
              </div>
            </div>

            {visibleState.status === "loading" && <ResultsSkeleton />}
            {visibleState.status === "error" && (
              <div className="result-state-card" role="alert"><span className="state-icon error"><AlertCircle size={28} /></span><h3>نتونستیم نتایج رو نمایش بدیم</h3><p>{visibleState.message}</p>{!parsed.ok && <p className="state-hint">{Object.values(parsed.errors)[0]}</p>}<button type="button" onClick={parsed.ok ? () => setRetry((value) => value + 1) : focusSearch}>{parsed.ok ? <><RotateCcw size={17} /> تلاش دوباره</> : <><ArrowLeft size={17} /> اصلاح جست‌وجو</>}</button></div>
            )}
            {visibleState.status === "success" && visibleState.data.total === 0 && (
              <div className="result-state-card empty" role="status"><span className="state-icon"><SearchX size={29} /></span><h3>اینجا هنوز هتلی پیدا نشد</h3><p>{activeFilters > 0 ? "با این فیلترها نتیجه‌ای پیدا نکردیم. فیلترها رو تغییر بده یا پاک کن." : "برای این مقصد و تعداد مسافران، اقامتگاهی در داده‌های نمونه نداریم. مقصد یا تعداد مسافران رو تغییر بده."}</p><button type="button" onClick={activeFilters > 0 ? resetFilters : focusSearch}>{activeFilters > 0 ? <><RotateCcw size={17} /> پاک کردن فیلترها</> : <><ArrowLeft size={17} /> تغییر جست‌وجو</>}</button></div>
            )}
            {visibleState.status === "success" && visibleState.data.total > 0 && (
              <div className="hotel-list" aria-live="polite">{visibleState.data.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} nights={visibleState.data.nights} rooms={visibleState.data.query.rooms} />)}</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
