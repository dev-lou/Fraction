import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { Footer } from '@/components/Footer';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fraction | Real Estate Tokenization',
  description: 'Fractional ownership of premium real estate assets on-chain.',
  icons: {
    icon: '/Frac.ico',
    apple: '/Frac.ico', // Fallback to same file, but ideally should be PNG
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-[#0a0a0a] text-neutral-100 antialiased ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
