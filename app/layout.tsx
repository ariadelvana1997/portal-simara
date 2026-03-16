import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // Mengganti ke Plus Jakarta Sans
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Menambahkan weight agar fleksibel
});

export const metadata: Metadata = {
  title: "Portal SIMARA",
  description: "E-Rapor Kurikulum Merdeka oleh DELVANA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}