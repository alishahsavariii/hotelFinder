import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export function NotFoundView() {
  return (
    <>
      <main dir="rtl" className="site-container flex min-h-[calc(100vh-120px)] items-center justify-center py-16" aria-labelledby="not-found-title">
        <section className="w-full max-w-xl rounded-3xl border border-(--line) bg-(--surface) px-8 py-12 text-center shadow-(--shadow-menu)">
          <p aria-hidden="true" className="select-none bg-[linear-gradient(to_left,var(--accent),var(--warm))] bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl">
            ۴۰۴
          </p>
          <span className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--accent-soft) text-(--accent-text)">
            <SearchX size={30} aria-hidden="true" />
          </span>
          <h1 id="not-found-title" className="mt-5 text-2xl font-extrabold text-(--heading)">
            این صفحه پیدا نشد
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-(--text-muted)">
            آدرسی که وارد کردید وجود ندارد یا ممکن است جابه‌جا شده باشد. می‌توانید از صفحهٔ اصلی دوباره جست‌وجوی هتل را شروع کنید.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-(--accent) px-6 py-3 text-sm font-bold text-white transition hover:bg-(--accent-hover)"
            >
              <Home size={18} aria-hidden="true" />
              بازگشت به جست‌وجوی هتل
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
