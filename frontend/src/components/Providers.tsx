"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/wallet";
import { HubDataProvider } from "@/lib/hub-data";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider>
        <HubDataProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </HubDataProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
