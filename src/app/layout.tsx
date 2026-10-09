import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: {
    default: "تخمین رشته‌محل قبولی کنکور ۱۴۰۵ با رتبه | سان‌جاب",
    template: "%s | سان‌جاب",
  },
  description:
    "سان‌جاب — نرم افزار رایگان تخمین رشته‌محل قبولی با رتبه کنکور سراسری ۱۴۰۵. گروه، سهمیه و رتبه خود را وارد کنید تا فهرست رشته‌محل‌های پیشنهادی را در سه دسته خوش‌بینانه، منطقی و بدبینانه ببینید.",
  keywords: [
    "تخمین رشته‌محل قبولی",
    "تخمین قبولی کنکور",
    "تخمین رشته قبولی با رتبه",
    "نرم افزار تخمین رشته",
    "کنکور سراسری ۱۴۰۵",
    "انتخاب رشته",
    "رتبه کنکور",
    "سان‌جاب",
  ],
  authors: [{ name: "سان‌جاب" }],
  applicationName: "سان‌جاب",
  category: "education",
  metadataBase: new URL("https://konkur.sunjob.ir"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/sunjob-logo.png",
  },
  openGraph: {
    title: "تخمین رشته‌محل قبولی کنکور ۱۴۰۵ با رتبه | سان‌جاب",
    description:
      "سان‌جاب — تخمین رشته‌محل قبولی با رتبه کنکور سراسری ۱۴۰۵. گروه، سهمیه و رتبه خود را وارد کنید.",
    type: "website",
    locale: "fa_IR",
    siteName: "سان‌جاب",
    images: [
      {
        url: "/sunjob-logo.png",
        width: 512,
        height: 512,
        alt: "سان‌جاب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تخمین رشته‌محل قبولی کنکور ۱۴۰۵ با رتبه | سان‌جاب",
    description: "تخمین رشته‌محل قبولی با رتبه کنکور ۱۴۰۵ — سان‌جاب",
    images: ["/sunjob-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`antialiased bg-background text-foreground min-h-screen flex flex-col`}
        style={{ fontFamily: 'Vazirmatn, sans-serif' }}
      >
        {/* Vazirmatn font from jsdelivr CDN — loaded at runtime by the
            browser instead of via next/font/google which downloads at
            build time (the latter requires network access during build
            and breaks preview deployments that sandbox the build). */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main" className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
          <SonnerToaster position="bottom-center" richColors closeButton dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
