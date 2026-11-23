import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persianEn from "react-date-object/locales/persian_en";
import persianFa from "react-date-object/locales/persian_fa";

const DAY_MS = 86_400_000;
const persianNumbers = new Intl.NumberFormat("fa-IR");

export function formatNumber(value: number): string {
  return persianNumbers.format(value);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}

function dayNumber(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export function addDays(iso: string, amount: number): string {
  return new Date((dayNumber(iso) + amount) * DAY_MS).toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return dayNumber(checkOut) - dayNumber(checkIn);
}

export function getTehranTodayISO(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function toPersianDateObject(iso: string): DateObject | undefined {
  if (!isValidISODate(iso)) return undefined;
  const [year, month, day] = iso.split("-").map(Number);
  return new DateObject({ year, month, day, calendar: gregorian, locale: gregorianEn }).convert(
    persian,
    persianFa,
  );
}

export function persianDateToISO(date: DateObject): string {
  const converted = new DateObject({
    year: date.year,
    month: date.month.number,
    day: date.day,
    calendar: persian,
    locale: persianEn,
  }).convert(gregorian, gregorianEn);
  return `${converted.year}-${String(converted.month.number).padStart(2, "0")}-${String(converted.day).padStart(2, "0")}`;
}

export function formatJalali(iso: string): string {
  return toPersianDateObject(iso)?.format("D MMMM YYYY") ?? "—";
}
