import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Essentials | Daily Ramadan Quiz",
  description:
    "A warm, daily Islamic quiz during Ramadan covering fiqh, aqeedah, seerah, and akhlaq.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[var(--font-body)] antialiased">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-amber-200/80 bg-amber-50/70 py-12 text-emerald-950 sm:py-16">
            <div className="container grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
              <div className="space-y-3">
                <h3 className="font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
                  Essentials
                </h3>
                <p className="max-w-sm text-base leading-relaxed text-emerald-900/75">
                  A daily Ramadan quiz helping Muslims strengthen Islamic essentials in an engaging way.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold">Creator</h4>
                <p className="text-lg text-emerald-900/85">Shabab Karim</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold">Social Media</h4>
                <div className="space-y-3 text-lg">
                  <a
                    href="https://github.com/ShababKarim"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-emerald-900 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/shabab-karim-43262413b"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-emerald-900 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
