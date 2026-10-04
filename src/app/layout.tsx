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
  title: "نرم افزار تخمین رشته قبولی با رتبه کنکور ۱۴۰۵ — نسخه قابل دانلود",
  description:
    "نرم افزار رایگان تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵ — رشته، سهمیه و رتبه خود را وارد کنید تا فهرست پیشنهادهای خوش‌بینانه، منطقی و بدبینانه را ببینید. نسخه HTML آفلاین قابل دانلود.",
  keywords: [
    "تخمین رشته قبولی با رتبه",
    "نرم افزار تخمین رشته",
    "کنکور سراسری ۱۴۰۵",
    "انتخاب رشته",
    "هیوا",
  ],
  authors: [{ name: "Independent rebuild" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "نرم افزار تخمین رشته قبولی با رتبه",
    description: "تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵ — نسخه قابل دانلود HTML",
    type: "website",
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
