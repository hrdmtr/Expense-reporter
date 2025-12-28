import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会議弁当経費処理用議事録管理システム",
  description: "領収書から自動的に議事録を作成するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
