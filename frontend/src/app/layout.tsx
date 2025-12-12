import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://2025-gopher-stamp-rally.vercel.app"),
  title: "Gophers Stamp Rally",
  description: "GoWorkShopConferenceのGophers Stamp Rally企画",
  openGraph: {
    title: "Gophers Stamp Rally",
    description: "GoWorkShopConferenceのGophers Stamp Rally企画に参加しよう！",
    url: "https://2025-gopher-stamp-rally.vercel.app",
    siteName: "Gophers Stamp Rally",
    images: [
      {
        url: "/gwc-title.png",
        width: 1200,
        height: 630,
        alt: "Gophers Stamp Rally",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gophers Stamp Rally",
    description: "GoWorkShopConferenceのGophers Stamp Rally企画に参加しよう！",
    images: ["/gwc-title.png"],
  },
  icons: {
    icon: "/gwc-title.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
