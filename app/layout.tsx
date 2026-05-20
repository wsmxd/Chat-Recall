import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { ConfirmProvider } from "@/components/confirm-provider";
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
      <body>
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

