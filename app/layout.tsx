import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PLX Site',
  description: 'Home / Media / Event',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen relative`}
      >
        {/* NAVBAR always on top */}
        <Navbar />

        {/* MAIN CONTENT fills available space */}
        <main className="relative z-10 flex-grow max-w-screen-xl mx-auto px-4 pt-24 pb-10 text-white">
          {children}
        </main>

        {/* FOOTER always on top */}
        <footer className="relative z-10">
          <Footer />
        </footer>
      </body>
    </html>
  );
}
