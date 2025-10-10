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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
      <head>
        {/* Script to prevent theme flashing on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  
                  let themeToSet = 'light'; // Always default to light mode
                  if (savedTheme) {
                    themeToSet = savedTheme;
                  }
                  
                  document.documentElement.classList.add(themeToSet);
                  
                  // Add starry background immediately if dark mode
                  if (themeToSet === 'dark') {
                    const starryBg = document.createElement('div');
                    starryBg.id = 'initial-starry-bg';
                    starryBg.style.cssText = \`
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      z-index: 0;
                      pointer-events: none;
                      overflow: hidden;
                    \`;
                    
                    // Generate initial stars
                    for (let i = 0; i < 50; i++) {
                      const star = document.createElement('div');
                      star.style.cssText = \`
                        position: absolute;
                        width: \${Math.random() * 3 + 0.5}px;
                        height: \${Math.random() * 3 + 0.5}px;
                        background: white;
                        border-radius: 50%;
                        left: \${Math.random() * 100}%;
                        top: \${Math.random() * 100}%;
                        opacity: \${Math.random() * 0.7 + 0.1};
                        animation: pulse-slow \${3 + Math.random() * 4}s ease-in-out infinite;
                        animation-delay: \${Math.random() * 3}s;
                        box-shadow: 0 0 \${Math.random() * 6 + 2}px rgba(255, 255, 255, \${Math.random() * 0.7 + 0.1});
                      \`;
                      starryBg.appendChild(star);
                    }
                    
                    document.body.appendChild(starryBg);
                  }
                } catch (e) {
                  console.error('Theme setting error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
