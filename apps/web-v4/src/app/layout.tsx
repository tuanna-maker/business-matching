import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuraBackground } from "@/components/layout/aura-background";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IEC Hub | Private Business Lounge",
  description: "Where Trust Meets Opportunity - The exclusive digital lounge for business leaders",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans theme-light bg-white text-slate-900 min-h-screen`}>
        {/* Aura/Aurora Background Effect */}
        <AuraBackground />
        
        {/* Noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 noise-bg" />
        
        {/* Main Content */}
        <Providers>
          <main className="relative z-10 pb-24">
            {children}
          </main>
        </Providers>
        
        {/* Toast Notifications */}
        <Toaster 
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
