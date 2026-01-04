import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastViewport } from "@/components/ui/ToastViewport";

const font = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Routely - Digital Advantage",
  description: "Advanced habit tracking for high performers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
