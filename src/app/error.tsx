"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1a1d] px-5" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-[#24383c] bg-[#15262a] px-8 py-12 text-center shadow-2xl shadow-black/50">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3a231d] text-[#f0a08c]"><AlertCircle size={30} /></span>
        <h1 className="mt-6 text-xl font-extrabold text-[#f4fbf9]">یه مشکلی پیش اومد</h1>
        <p className="mt-3 text-sm leading-8 text-[#93a8a5]">صفحه درست بارگذاری نشد. لطفاً دوباره تلاش کن.</p>
        <button type="button" onClick={reset} className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#14766b] px-6 py-3 text-sm font-bold text-[#eafffb] transition hover:bg-[#17877a]"><RotateCcw size={18} /> تلاش دوباره</button>
      </div>
    </main>
  );
}
