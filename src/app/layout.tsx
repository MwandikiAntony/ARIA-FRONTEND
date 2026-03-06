import type { Metadata } from 'next';
import { Outfit, Rajdhani, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

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
    <html lang="en" className={`${outfit.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <WebSocketProvider>
            <SettingsProvider>
              <Navbar />
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