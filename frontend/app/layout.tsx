import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sisyphean Computation",
  description: "An interactive computational artwork about machine labor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
