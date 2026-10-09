/**
 * SiteFooter — sticky-bottom 4-column site footer with brand + tagline,
 * content links, quick access, account links, and a bottom legal row.
 * Server component (no interactivity required).
 *
 * Mirrors masir.faradars.org's <footer class="site-footer"> structure but
 * keeps the sunjob brand and Telegram link.
 */
import Link from 'next/link'

const MAIN_SITE = 'https://sunjob.ir'

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#1A2744] text-white overflow-hidden print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/sunjob-logo.png" alt="سان‌جاب" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-extrabold block">سان‌جاب</span>
                <span className="text-[11px] text-gray-400">نرم‌افزار رایگان انتخاب رشته هوشمند</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-6 mb-4">
              سان‌جاب، همراه تو در مسیر کشف خود و ساخت آینده‌ای روشن. ما باور داریم انتخاب رشته، انتخاب یک مسیر زندگی است.
            </p>
            <a
              href="https://t.me/Sunjob1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-9 h-9 rounded-lg bg-white/10 hover:bg-[#0EA5A0]/20 transition-colors justify-center"
              aria-label="کانال تلگرام سان‌جاب (ارتباط با ما)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </a>
          </div>

          {/* محتوا */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">محتوا</h4>
            <ul className="space-y-2">
              <li><Link href="/guides/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">راهنمای انتخاب رشته</Link></li>
              <li><Link href="/universities/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">دانشگاه‌ها</Link></li>
              <li><Link href="/fields/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">رشته‌های دانشگاهی</Link></li>
            </ul>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><Link href="/catalog/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">فهرست رشته‌محل‌ها</Link></li>
              <li><a href={`${MAIN_SITE}/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200" target="_blank" rel="noopener noreferrer">خانه سان‌جاب</a></li>
            </ul>
          </div>

          {/* حساب کاربری من */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">حساب کاربری من</h4>
            <ul className="space-y-2">
              <li><Link href="/#estimator" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">ورود به تخمین‌گر</Link></li>
              <li><Link href="/guides/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">راهنماها</Link></li>
              <li><Link href="/fields/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">رشته‌ها</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom legal row */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            سان‌جاب © ۱۴۰۴، نرم‌افزار رایگان انتخاب رشته هوشمند، محصولی از سان‌جاب
          </p>
          <a href="mailto:info@sunjob.ir" className="text-gray-500 text-xs hover:text-[#0EA5A0] transition-colors" dir="ltr">
            info@sunjob.ir
          </a>
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-gray-500 text-[11px] leading-6 max-w-3xl">
            سان‌جاب ابزار کمک به تصمیم‌گیری است و سامانه سازمان سنجش نیست. ثبت انتخاب رشته فقط در سایت{' '}
            <a href="https://www.sanjesh.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0EA5A0] underline">سازمان سنجش آموزش کشور</a>
            {' '}(برای دانشگاه آزاد، سایت{' '}
            <a href="https://www.azmoon.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0EA5A0] underline">مرکز سنجش دانشگاه آزاد</a>
            ) انجام می‌شود.
          </p>
        </div>
      </div>
    </footer>
  )
}
