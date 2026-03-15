import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apireon — Describe it. Deploy it. Done.',
  description: 'Turn natural language into live REST APIs with endpoints, validation, documentation, and hosted databases — in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
