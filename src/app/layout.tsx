import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import TopLoadingBar from './components/common/TopLoadingBar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ServiceHub - Connect with Trusted Service Providers",
  description:
    "Find skilled professionals for all your home and business needs. We connect you with verified experts in your area. Developed by SACS Computers.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" 
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <UserProvider>
            <NotificationProvider refreshInterval={60000}>
              <LoadingProvider>
                <Suspense fallback={null}>
                  <TopLoadingBar />
                </Suspense>
                {children}
              </LoadingProvider>
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
