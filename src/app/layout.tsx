import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/vazirmatn/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "راهی | جست‌وجو و مقایسه هتل",
  description: "هتل‌های مقصدت را با تاریخ شمسی جست‌وجو کن، بر اساس قیمت و امکانات فیلتر کن و بهترین گزینه را مقایسه کن.",
  applicationName: "راهی",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0d1a1d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
