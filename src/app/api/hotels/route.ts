import type { NextRequest } from "next/server";
import { getTehranTodayISO } from "@/features/hotels/date";
import { parseSearchRequest } from "@/features/hotels/params";
import { searchHotels } from "@/features/hotels/server/search-hotels";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  const parsed = parseSearchRequest(request.nextUrl.searchParams, getTehranTodayISO());
  if (!parsed.ok) {
    return Response.json(
      { message: "پارامترهای جست‌وجو معتبر نیستند. لطفاً فرم را بررسی کنید.", errors: parsed.errors },
      { status: 400, headers: noStore },
    );
  }

  try {
    // ایجاد تاخیر برای نشان دادن لودینگ
    await new Promise((resolve) => setTimeout(resolve, 700));
    return Response.json(searchHotels(parsed.value), { headers: noStore });
  } catch (error) {
    return Response.json(
      { message: "در دریافت هتل‌ها مشکلی پیش آمد. لطفاً دوباره تلاش کنید." },
      { status: 500, headers: noStore },
    );
  }
}
