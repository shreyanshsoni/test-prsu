import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Academic Planner',
  description: 'Manage your academic programs, checklists, and roadmaps with ease.',
  keywords: ['Academic Planner', 'Education', 'Programs', 'Checklists', 'Roadmap'],
  authors: [{ name: 'PRSU', url: 'https://goprsu.com/' }],
  metadataBase: new URL('https://goprsu.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'PRSU',
    description: 'Unlocking the Future of Educational Journeys',
    url: 'https://goprsu.com/',
    siteName: 'PRSU',
    images: [
      {
        url: '/og-image.png', // Path to your OpenGraph image in the public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academic Planner',
    description: 'A modern, SEO-friendly Next.js app for managing academic programs, checklists, and roadmaps.',
    images: ['/twitter-image.png'], // Path to your Twitter image in the public folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
