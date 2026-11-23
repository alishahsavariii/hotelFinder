import { AMENITY_OPTIONS, CITY_OPTIONS, MAX_PRICE, SORT_OPTIONS } from "./constants";
import { addDays, isValidISODate, nightsBetween } from "./date";
import type {
  Amenity,
  HotelFilters,
  HotelSearchCriteria,
  HotelSearchRequest,
  SearchFieldErrors,
  SortOption,
} from "./types";

export function defaultCriteria(today: string): HotelSearchCriteria {
  return {
    city: "kish",
    checkIn: addDays(today, 7),
    checkOut: addDays(today, 10),
    rooms: 1,
    adults: 2,
    children: 0,
  };
}

export function defaultFilters(): HotelFilters {
  return { minPrice: null, maxPrice: null, stars: [], amenities: [], sort: "recommended" };
}

export function defaultRequest(today: string): HotelSearchRequest {
  return { ...defaultCriteria(today), ...defaultFilters() };
}

export function readCriteria(params: URLSearchParams): HotelSearchCriteria {
  return {
    city: params.get("city") ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    rooms: params.has("rooms") ? Number(params.get("rooms")) : 1,
    adults: params.has("adults") ? Number(params.get("adults")) : 2,
    children: params.has("children") ? Number(params.get("children")) : 0,
  };
}

export function validateCriteria(criteria: HotelSearchCriteria, today: string): SearchFieldErrors {
  const errors: SearchFieldErrors = {};

  if (!CITY_OPTIONS.some((city) => city.id === criteria.city)) {
    errors.city = "لطفاً یک مقصد معتبر انتخاب کنید.";
  }
  if (!isValidISODate(criteria.checkIn)) {
    errors.checkIn = "تاریخ ورود را انتخاب کنید.";
  } else if (criteria.checkIn < today) {
    errors.checkIn = "تاریخ ورود نمی‌تواند در گذشته باشد.";
  } else if (criteria.checkIn > addDays(today, 365)) {
    errors.checkIn = "تاریخ ورود باید در یک سال آینده باشد.";
  }
  if (!isValidISODate(criteria.checkOut)) {
    errors.checkOut = "تاریخ خروج را انتخاب کنید.";
  } else if (isValidISODate(criteria.checkIn)) {
    const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
    if (nights < 1) errors.checkOut = "تاریخ خروج باید بعد از تاریخ ورود باشد.";
    else if (nights > 30) errors.checkOut = "حداکثر مدت اقامت ۳۰ شب است.";
  }
  if (!Number.isInteger(criteria.rooms) || criteria.rooms < 1 || criteria.rooms > 4) {
    errors.rooms = "تعداد اتاق باید بین ۱ تا ۴ باشد.";
  }
  if (!Number.isInteger(criteria.adults) || criteria.adults < 1 || criteria.adults > 12) {
    errors.adults = "تعداد بزرگسال باید بین ۱ تا ۱۲ باشد.";
  }
  if (!Number.isInteger(criteria.children) || criteria.children < 0 || criteria.children > 6) {
    errors.children = "تعداد کودک باید بین ۰ تا ۶ باشد.";
  }
  if (!errors.rooms && !errors.adults && criteria.adults < criteria.rooms) {
    errors.adults = "برای هر اتاق حداقل یک بزرگسال لازم است.";
  }
  if (
    !errors.rooms &&
    !errors.adults &&
    !errors.children &&
    criteria.adults + criteria.children > criteria.rooms * 4
  ) {
    errors.children = "ظرفیت هر اتاق حداکثر ۴ نفر است.";
  }
  return errors;
}

export function validateRequest(request: HotelSearchRequest, today: string): SearchFieldErrors {
  const errors = validateCriteria(request, today);
  for (const key of ["minPrice", "maxPrice"] as const) {
    const value = request[key];
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > MAX_PRICE)) {
      errors[key] = "مبلغ باید عددی بین ۰ تا ۳۰ میلیون تومان باشد.";
    }
  }
  if (
    !errors.minPrice &&
    !errors.maxPrice &&
    request.minPrice !== null &&
    request.maxPrice !== null &&
    request.minPrice > request.maxPrice
  ) {
    errors.maxPrice = "حداکثر قیمت باید از حداقل قیمت بیشتر باشد.";
  }
  if (request.stars.some((star) => !Number.isInteger(star) || star < 3 || star > 5)) {
    errors.stars = "فیلتر ستاره معتبر نیست.";
  }
  if (request.amenities.some((amenity) => !AMENITY_OPTIONS.some((option) => option.id === amenity))) {
    errors.amenities = "فیلتر امکانات معتبر نیست.";
  }
  if (!SORT_OPTIONS.some((option) => option.id === request.sort)) {
    errors.sort = "روش مرتب‌سازی معتبر نیست.";
  }
  return errors;
}

export function parseSearchRequest(
  params: URLSearchParams,
  today: string,
): { ok: true; value: HotelSearchRequest } | { ok: false; errors: SearchFieldErrors } {
  const criteria = readCriteria(params);
  const readPrice = (key: string) => {
    const raw = params.get(key);
    return raw === null || raw.trim() === "" ? null : Number(raw);
  };
  const rawStars = (params.get("stars") ?? "").split(",").filter(Boolean);
  const rawAmenities = (params.get("amenities") ?? "").split(",").filter(Boolean);
  const request: HotelSearchRequest = {
    ...criteria,
    minPrice: readPrice("minPrice"),
    maxPrice: readPrice("maxPrice"),
    stars: [...new Set(rawStars.map(Number))],
    amenities: [...new Set(rawAmenities)] as Amenity[],
    sort: (params.get("sort") ?? "recommended") as SortOption,
  };
  const errors = validateRequest(request, today);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: request };
}

export function toSearchQuery(request: HotelSearchRequest): string {
  const params = new URLSearchParams({
    city: request.city,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    rooms: String(request.rooms),
    adults: String(request.adults),
    children: String(request.children),
  });
  if (request.minPrice !== null) params.set("minPrice", String(request.minPrice));
  if (request.maxPrice !== null) params.set("maxPrice", String(request.maxPrice));
  if (request.stars.length) params.set("stars", [...request.stars].sort((a, b) => b - a).join(","));
  if (request.amenities.length) params.set("amenities", request.amenities.join(","));
  if (request.sort !== "recommended") params.set("sort", request.sort);
  return params.toString();
}
