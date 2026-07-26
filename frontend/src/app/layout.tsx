import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { NetworkBanner } from "@/components/NetworkBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ResearchHub — Decentralized Research Grants on Stellar",
  description:
    "Manage research grants, milestones, peer reviews, and transparent fund distribution on Soroban.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <Providers>
          <ErrorBoundary>
            <div className="rh-shell">
              <SiteHeader />
              <NetworkBanner />
              <main className="pb-16 pt-6">{children}</main>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
