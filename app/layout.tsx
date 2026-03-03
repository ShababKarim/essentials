import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Essentials | Daily Ramadan Quiz",
  description:
    "A warm, daily Islamic quiz during Ramadan focused on fiqh and aqeedah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
