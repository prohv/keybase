import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { cabinet, generalSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "KeyBase | Secure Team API Key Vault",
  description: "Securely store and share API keys with your team.",
  icons: {
    icon: "/keybase-logo.svg",
  },
};

import { ClickSpark } from "@/components/ui/click-spark";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cabinet.variable} ${generalSans.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          {children}
          <ClickSpark />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
