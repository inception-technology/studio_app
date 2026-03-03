// app/layout.tsx
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import"@/styles/components.css";

const quicksand = Quicksand({
  variable: "--font-quicksand", 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"] 
});

export const metadata: Metadata = {
  title: "App Dojang Studio",
  description: "Manage your Dojang studio with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={
          `${quicksand.variable}
          antialiased 
          text-gray-900
          w-full
          min-h-[100dvh]
          h-full
          flex flex-col
          bg-[#f8f6f6]`
        }>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
