import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'InstantAPI — Describe it. Deploy it. Done.',
  description: 'Turn natural language into live REST APIs with documentation, a playground, and database hosting — instantly.',
  openGraph: {
    title: 'InstantAPI',
    description: 'Turn natural language into live REST APIs instantly.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
