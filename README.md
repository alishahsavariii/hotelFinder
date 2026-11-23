# راهی — جست‌وجوی هتل

صفحهٔ جست‌وجوی هتل با Next.js 15 (App Router)، TypeScript و Tailwind CSS 4. کاربر مقصد، تاریخ (شمسی) و تعداد مسافر را وارد می‌کند، نتایج را فیلتر و مرتب می‌کند و هتل‌ها را کنار هم می‌بیند.

## اجرا

Node.js نسخهٔ ۲۰.۹ به بالا لازم است. دیتابیس و متغیر محیطی ندارد.

```bash
npm install
npm run dev
```

بعد از اجرا، `http://localhost:3000` باز می‌شود و خودش به جست‌وجوی پیش‌فرض (کیش، یک هفته بعد، سه شب) redirect می‌شود.

| دستور | کاربرد |
| --- | --- |
| `npm run build && npm run dev` | اجرای نسخهٔ Production |
| `npm run lint` | ESLint |
| `npm run typecheck` | بررسی تایپ‌ها |

## ساختار پوشه‌ها

src/
├── app/
│   ├── api/
│   │   ├── hotels/route.ts        # GET /api/hotels
│   │   └── health/route.ts        # بررسی سلامت کاتالوگ
│   ├── layout.tsx                 # html (fa / rtl)، فونت، متادیتا
│   ├── page.tsx                   # redirect به جست‌وجوی پیش‌فرض + SearchExperience
│   ├── loading.tsx
│   ├── error.tsx
│   ├── globals.css                # توکن‌های رنگ و استایل‌ها
│   └── icon.svg
└── features/
    └── hotels/
        ├── components/
        │   ├── search-experience.tsx   # هماهنگ‌کنندهٔ فرم، فیلتر و نتایج
        │   ├── search-form.tsx         # مقصد، تاریخ، اتاق و مسافر
        │   ├── filters-panel.tsx       # قیمت، ستاره، امکانات، مرتب‌سازی
        │   └── hotel-card.tsx
        ├── api/
        │   └── client.ts               # fetch سمت کلاینت و مدیریت خطا
        ├── server/
        │   ├── catalog.ts              # داده‌های نمونه
        │   └── search-hotels.ts        # فیلتر، قیمت‌گذاری، مرتب‌سازی
        ├── constants.ts                # شهرها، امکانات، گزینه‌های sort
        ├── date.ts                     # تاریخ امروز (تهران)، شمسی ↔ میلادی
        ├── params.ts                   # اعتبارسنجی و تبدیل URL ↔ درخواست
        └── types.ts

کد مربوط به هتل‌ها کامل داخل `features/hotels` است و `app/` فقط مسیرها را به آن وصل می‌کند. فایل‌های `server/` با `server-only` علامت خورده‌اند و وارد باندل کلاینت نمی‌شوند.

**وضعیت در URL.** مقصد، تاریخ‌ها، مسافران، فیلترها و مرتب‌سازی همه در query string هستند؛ پس Refresh، دکمهٔ Back و لینک مستقیم نتیجه را همان‌طور که بود برمی‌گردانند. فرمی که هنوز ثبت نشده state محلی خودش را دارد و با عوض‌کردن فیلتر از بین نمی‌رود. جست‌وجوی جدید فیلترها را ریست می‌کند، ولی تغییر فیلتر مقصد و تاریخ را دست نمی‌زند.

**درخواست‌ها.** با هر تغییر URL درخواست قبلی با `AbortController` لغو می‌شود تا پاسخ قدیمی روی نتیجهٔ جدید ننشیند. چهار حالت loading، success، خالی و خطا (با دکمهٔ تلاش مجدد) جدا مدیریت شده‌اند.

**اعتبارسنجی یک‌بار نوشته شده.** `params.ts` هم در فرم و هم در API استفاده می‌شود، پس قواعد (مثلاً تاریخ گذشته، حداکثر ۳۰ شب، ظرفیت هر اتاق ۴ نفر) بین کلاینت و سرور اختلاف پیدا نمی‌کنند.

**تاریخ.** تقویم شمسی با `react-multi-date-picker` است. تاریخ انتخاب‌شده به صورت `YYYY-MM-DD` میلادی (بدون ساعت) در URL ذخیره می‌شود. «امروز» در سرور و با منطقهٔ زمانی `Asia/Tehran` محاسبه و به کلاینت داده می‌شود تا اختلاف ساعت مرورگر و سرور باعث Hydration mismatch نشود.

**Cache.** `GET /api/hotels` با `force-dynamic` و `Cache-Control: no-store` و درخواست کلاینت هم با `cache: 'no-store'` است؛ چون نتیجه به تاریخ و موجودی بستگی دارد.

**بدون دیتابیس.** داده‌ها نباید داخل کامپوننت‌ها باشند، ولی لازم هم نبود دیتابیس بیاید. هتل‌ها در `server/catalog.ts` هستند و فقط از طریق API در دسترس‌اند.

## API

```text
GET /api/hotels?city=kish&checkIn=2026-12-01&checkOut=2026-12-04&rooms=1&adults=2&children=0&maxPrice=8000000&stars=4,5&amenities=breakfast,pool&sort=rating
```

| پارامتر | توضیح |
| --- | --- |
| `city` (ضروری) | `kish`، `tehran`، `shiraz`، `isfahan`، `mashhad`، `rasht`، `qeshm` |
| `checkIn`، `checkOut` (ضروری) | میلادی، `YYYY-MM-DD` |
| `rooms`، `adults`، `children` | پیش‌فرض ۱ و ۲ و ۰ |
| `minPrice`، `maxPrice` | تومان، برای هر شب و هر اتاق |
| `stars` | مثلاً `3,4,5` |
| `amenities` | `breakfast`، `pool`، `parking`، `wifi`، `seaView`، `gym` |
| `sort` | `recommended`، `price-low`، `price-high`، `rating` |

پاسخ موفق (`200`) شامل `total`، `nights`، `cityName`، `hotels` و `query` است. اگر نتیجه‌ای نباشد باز هم `200` با `hotels: []` برمی‌گردد. ورودی نامعتبر `400` با `{ message, errors }` است و خطای غیرمنتظره `500`. قیمت کل با تعداد شب و اتاق حساب می‌شود و در برخی ماه‌ها ضریب فصلی دارد. تأخیر ۲۵۰ میلی‌ثانیه‌ای هم عمداً گذاشته شده تا حالت loading دیده شود.

`GET /api/health` فقط خالی‌نبودن کاتالوگ را چک می‌کند.

## یادداشت‌ها

- ESLint 9 با `eslint-config-next@15` سازگاری مستقیم ندارد، به همین دلیل `eslint.config.mjs` قواعد را با `FlatCompat` از پلاگین‌ها می‌سازد.
- `searchParams` در `page.tsx` Promise است و با `await` خوانده می‌شود.
- فونت وزیرمتن از `@fontsource-variable/vazirmatn` و آیکون‌ها از `lucide-react` است. تم صفحه تیره است و رنگ‌ها در `globals.css` به صورت متغیر CSS تعریف شده‌اند.

## محدودیت‌ها

- هتل‌ها، قیمت‌ها و موجودی ساختگی‌اند.
- تست خودکار ندارد.
- صفحه‌بندی ندارد (کاتالوگ کوچک است).
- برای استفادهٔ واقعی باید به API نرخ و موجودی واقعی وصل شود. کلیدها در آن صورت فقط سمت سرور و در متغیر محیطی نگه داشته شوند.
