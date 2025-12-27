import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fraction | Tokenized Real Estate',
  description: 'Own tokenized slices of iconic buildings with Fraction.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-[#0a0a0a] text-neutral-100 antialiased ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
