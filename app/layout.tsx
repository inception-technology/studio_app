import type { Metadata } from "next";
import { Quicksand, Inter, Geist, Geist_Mono } from "next/font/google";
//import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import"@/styles/components.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({variable: "--font-inter", subsets: ["latin"], });
const quicksand = Quicksand({variable: "--font-quicksand", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

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
          flex flex-col`
        }>
        {/* <AuthProvider> */}
          {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
