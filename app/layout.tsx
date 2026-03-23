import type { Metadata } from "next";
import { ThemeProvider } from "./providers"; // Import provider tadi
import "./globals.css";

// Metadata SEKARANG AMAN DI SINI ✅
export const metadata: Metadata = {
  title: "Portal SIMARA",
  description: "E-Rapor Kurikulum Merdeka oleh DELVANA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ASSET FONT DARI GOOGLE FONTS (DAFTAR 20 VARIAN LENGKAP) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Lexend:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Roboto:wght@400;700;900&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Nunito:wght@400;700&family=Ubuntu:wght@400;700&family=Raleway:wght@400;700&family=Playfair+Display:wght@400;700&family=Oswald:wght@400;700&family=Merriweather:wght@400;700&family=Quicksand:wght@400;700&family=Kanit:wght@400;700&family=Lora:wght@400;700&family=Work+Sans:wght@400;700&family=Fira+Sans:wght@400;700&family=Josefin+Sans:wght@400;700&family=Anton&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}