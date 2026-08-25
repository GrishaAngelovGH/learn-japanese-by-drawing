"use client"

import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { Settings } from "lucide-react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsModal } from "@/components/settings";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <div className="relative min-h-full">
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="fixed top-6 right-6 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Settings className="size-4" />
            </button>
            {children}
            <Toaster position="bottom-center" />
            <SettingsModal
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
