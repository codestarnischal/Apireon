import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Procyon Labs — Next-Generation AI Infrastructure',
  description: 'Advanced AI orchestration, voice interfaces, and research-grade infrastructure for developers building the future.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
