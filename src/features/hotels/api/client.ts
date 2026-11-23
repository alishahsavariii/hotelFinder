import type { HotelSearchResponse } from "../types";

function hasMessage(value: unknown): value is { message: string } {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string";
}

function isSearchResponse(value: unknown): value is HotelSearchResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "hotels" in value &&
    Array.isArray(value.hotels) &&
    "total" in value &&
    typeof value.total === "number" &&
    "nights" in value &&
    typeof value.nights === "number" &&
    "cityName" in value &&
    typeof value.cityName === "string" &&
    "query" in value &&
    typeof value.query === "object" &&
    value.query !== null
  );
}

export async function fetchHotelResults(query: string, signal: AbortSignal): Promise<HotelSearchResponse> {
  const response = await fetch(`/api/hotels?${query}`, { cache: "no-store", signal });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("پاسخ سرور قابل خواندن نیست. لطفاً دوباره تلاش کنید.");
  }
  if (!response.ok) {
    throw new Error(hasMessage(payload) ? payload.message : "دریافت نتایج با خطا مواجه شد.");
  }
  if (!isSearchResponse(payload)) {
    throw new Error("اطلاعات دریافت‌شده معتبر نیست. لطفاً دوباره تلاش کنید.");
  }
  return payload;
}
