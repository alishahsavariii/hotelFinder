export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d1a1d]" role="status" aria-label="در حال آماده‌سازی صفحه">
      <div className="h-20 border-b border-[#1f3236] bg-[#101f22]" />
      <div className="site-container mt-6 h-[310px] animate-pulse rounded-[26px] bg-[#16292d]" />
      <div className="site-container relative z-10 -mt-14 max-w-[1170px] rounded-[20px] border border-[#24383c] bg-[#15262a] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 h-5 w-40 animate-pulse rounded bg-[#1f3236]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[70px] animate-pulse rounded-xl bg-[#1b3034]" />)}</div>
      </div>
      <span className="sr-only">در حال بارگذاری صفحه</span>
    </div>
  );
}
