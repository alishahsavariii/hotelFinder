import type { Amenity, CityId, SortOption } from "./types";

export const CITY_OPTIONS: { id: CityId; name: string; province: string }[] = [
  { id: "kish", name: "کیش", province: "هرمزگان" },
  { id: "tehran", name: "تهران", province: "تهران" },
  { id: "shiraz", name: "شیراز", province: "فارس" },
  { id: "isfahan", name: "اصفهان", province: "اصفهان" },
  { id: "mashhad", name: "مشهد", province: "خراسان رضوی" },
  { id: "rasht", name: "رشت", province: "گیلان" },
  { id: "qeshm", name: "قشم", province: "هرمزگان" },
];

export const AMENITY_OPTIONS: { id: Amenity; label: string }[] = [
  { id: "breakfast", label: "صبحانه" },
  { id: "pool", label: "استخر" },
  { id: "parking", label: "پارکینگ" },
  { id: "wifi", label: "اینترنت رایگان" },
  { id: "seaView", label: "چشم‌انداز دریا" },
  { id: "gym", label: "باشگاه ورزشی" },
];

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "recommended", label: "پیشنهاد ما" },
  { id: "price-low", label: "ارزان‌ترین" },
  { id: "price-high", label: "گران‌ترین" },
  { id: "rating", label: "بالاترین امتیاز" },
];

export const MAX_PRICE = 30_000_000;

export function getCityName(city: string): string {
  return CITY_OPTIONS.find((option) => option.id === city)?.name ?? city;
}

export function getAmenityLabel(amenity: Amenity): string {
  return AMENITY_OPTIONS.find((option) => option.id === amenity)?.label ?? amenity;
}
