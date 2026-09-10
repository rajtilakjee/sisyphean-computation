import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "The Sisyphean Machine",
  description:
    "An interactive artwork about a machine that works, falters under criticism, and begins again.",
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