// app/layout.tsx
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          `${quicksand.variable}
          antialiased 
          text-gray-900 
          max-w-screen 
          h-screen 
          flex flex-col
          bg-[#f8f6f6]`
        }>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
