import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
  description:
    "نرم افزار رایگان تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵ — رشته، سهمیه و رتبه خود را وارد کنید تا فهرست پیشنهادهای خوش‌بینانه، منطقی و بدبینانه را ببینید. نسخه HTML آفلاین قابل دانلود.",
  keywords: [
    "تخمین رشته قبولی با رتبه",
    "نرم افزار تخمین رشته",
    "کنکور سراسری ۱۴۰۵",
    "انتخاب رشته",
    "هیوا",
    "رتبه کنکور",
    "انتخاب رشته کنکور",
  ],
  authors: [{ name: "Independent rebuild" }],
  applicationName: "تخمین رشته قبولی با رتبه",
  category: "education",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
    description:
      "گروه آزمایشی، سهمیه و رتبه خود را وارد کنید تا فهرست رشته‌محل‌های پیشنهادی در سه دسته خوش‌بینانه، منطقی و بدبینانه را ببینید. نسخه HTML آفلاین قابل دانلود.",
    type: "website",
    locale: "fa_IR",
    siteName: "تخمین رشته قبولی با رتبه",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "نرم افزار تخمین رشته قبولی با رتبه کنکور ۱۴۰۵",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سان‌جاب | انتخاب رشته کنکور ۱۴۰۵",
    description:
      "گروه، سهمیه و رتبه خود را وارد کنید تا فهرست رشته‌محل‌های پیشنهادی را ببینید. نسخه HTML آفلاین قابل دانلود.",
    images: ["/favicon.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
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
