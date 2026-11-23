import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTehranTodayISO } from "@/features/hotels/date";
import { defaultRequest, toSearchQuery } from "@/features/hotels/params";
import { SearchExperience } from "@/features/hotels/components/search-experience";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function SearchFallback() {
  return (
    <div className="site-container page-fallback" role="status" aria-label="در حال آماده‌سازی جست‌وجو">
      <div className="fallback-form"><div className="skeleton-line medium skeleton-shimmer" /><div className="fallback-fields">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="skeleton-shimmer" />)}</div></div>
      <div className="fallback-heading skeleton-shimmer" /><div className="fallback-result skeleton-shimmer" />
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = getTehranTodayISO();
  if (Object.keys(params).length === 0) {
    redirect(`/?${toSearchQuery(defaultRequest(today))}`);
  }

  return (
      <Suspense fallback={<SearchFallback />}><SearchExperience today={today} /></Suspense>
  );
}
