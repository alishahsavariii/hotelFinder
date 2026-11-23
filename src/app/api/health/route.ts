import { HOTEL_CATALOG } from "@/features/hotels/server/catalog";

export const dynamic = "force-dynamic";

export function GET() {
  const ok = HOTEL_CATALOG.length > 0;
  return Response.json(
    { ok, source: "mock-hotel-catalog" },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
