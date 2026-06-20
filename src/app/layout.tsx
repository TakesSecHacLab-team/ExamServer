import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ExamServer - テスト演習サイト",
  description: "IT資格試験のオンライン演習プラットフォーム",
};

const themeScript = `
(() => {
  const key = "examserver-theme";
  const themes = new Set(["modern-light", "modern-dark", "simple-light", "simple-dark", "high-contrast"]);
  let theme = "modern-light";
  try {
    const stored = window.localStorage.getItem(key);
    if (stored && themes.has(stored)) theme = stored;
  } catch {}
  document.documentElement.dataset.theme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
