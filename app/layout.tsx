import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YouSearch — Open Source Search Engine Template',
  description: 'Build your own search engine with You.com API. Fork, add your key, deploy.',
  openGraph: {
    title: 'YouSearch — Open Source Search Engine Template',
    description: 'Build your own search engine with You.com API. Fork, add your key, deploy.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouSearch — Open Source Search Engine Template',
    description: 'Build your own search engine with You.com API. Fork, add your key, deploy.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
