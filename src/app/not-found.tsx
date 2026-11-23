import type { Metadata } from "next";
import { NotFoundView } from "./components/not-found-view";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد | راهی",
  description: "صفحهٔ مورد نظر پیدا نشد. از صفحهٔ اصلی جست‌وجوی هتل را ادامه دهید.",
};

export default function NotFound() {
  return <NotFoundView />;
}
