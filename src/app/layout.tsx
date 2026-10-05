import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const geistSans = {
  variable: "--font-geist-sans",
  className: "",
};

export const metadata: Metadata = {
  title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
  description:
    "سان‌جاب — نرم افزار رایگان تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵. گروه، سهمیه و رتبه خود را وارد کنید تا فهرست رشته‌محل‌های پیشنهادی را در سه دسته خوش‌بینانه، منطقی و بدبینانه ببینید.",
  keywords: [
    "سان‌جاب",
    "sunjob",
    "تخمین رشته قبولی با رتبه",
    "نرم افزار تخمین رشته",
    "کنکور سراسری ۱۴۰۵",
    "انتخاب رشته",
    "رتبه کنکور",
  ],
  authors: [{ name: "سان‌جاب" }],
  applicationName: "سان‌جاب",
  category: "education",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/sunjob-logo.png",
  },
  openGraph: {
    title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
    description:
      "سان‌جاب — تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵. گروه، سهمیه و رتبه خود را وارد کنید.",
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
    title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
    description:
      "تخمین رشته قبولی با رتبه کنکور ۱۴۰۵ — سان‌جاب",
    images: ["/sunjob-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-vazirmatn), sans-serif' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-center" richColors closeButton dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
