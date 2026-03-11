/**
 * layout.tsx  — MODIFIED
 *
 * WHAT CHANGED vs original and WHY:
 *
 * 1. Added <AriaIntroBar /> inside the layout body
 *    WHY: The ARIA voice agent must survive page navigation. Mounting it in
 *    layout.tsx (the root shared layout) means it renders once and stays alive
 *    when the user moves between /, /navigate, /coach, /dashboard, etc.
 *    If it were in page.tsx it would unmount/remount on every navigation,
 *    killing the Gemini session and losing context.
 *
 * 2. AriaIntroBar is placed AFTER <Navbar /> but OUTSIDE <main>
 *    WHY: The bar uses `position: fixed; top: 0` and z-index 50.
 *    Placing it outside <main> avoids any stacking context conflicts with
 *    page content. It sits above everything in the DOM and renders on top.
 *    The <main> pt-16 padding already accounts for the Navbar height;
 *    the AriaIntroBar is thin (py-2.5) and overlaps the Navbar space, which
 *    is intentional — it replaces the top edge with an audio status strip.
 */

import type { Metadata } from 'next';
import { Outfit, Rajdhani, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
// NEW IMPORT — AriaIntroBar is the persistent voice agent UI strip
import { AriaIntroBar } from '@/components/ui/AriaIntroBar';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARIA — Adaptive Real-time Intelligence Agent',
  description:
    'One unified AI platform. Navigate the world as a visually impaired individual or master every conversation with real-time coaching.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <WebSocketProvider>
            <SettingsProvider>
              <Navbar />

              {/*
               * AriaIntroBar — persistent voice agent strip
               * Lives outside <main> so it's not affected by page transitions.
               * Uses fixed positioning (z-50) so it floats above all content.
               * useAriaIntro inside it creates its own session independently
               * of the WebSocketContext session used for navigation/coach modes.
               */}
              <AriaIntroBar />

              <main className="pt-16 md:pt-16">
                {children}
              </main>

              <Footer />
            </SettingsProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}