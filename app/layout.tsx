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
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}