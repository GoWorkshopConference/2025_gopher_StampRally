import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Gophers Stamp Rally",
  description: "GoWorkShopConferenceのGophers Stamp Rally企画",
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
