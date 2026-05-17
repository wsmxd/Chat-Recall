import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Recall",
  description: "Roleplay chat with character cards, themes, memory, and RAG lore packs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

