'use client';
/* eslint-disable camelcase */
import React from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';
import '../styles/prism.css';
import { ThemeProvider } from '../context/ThemeProvider';
import { Providers } from './Provider';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-spaceGrotesk',
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <Providers>
          <SessionProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
