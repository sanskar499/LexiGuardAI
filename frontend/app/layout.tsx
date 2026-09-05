import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LexiGuard AI — Legal Tech Cross-Reference Contradiction Detection Engine',
  description: 'Automated legal technology platform detecting clause contradictions, cross-reference conflicts, and parameter discrepancies across complex legal contracts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#060913] text-slate-100 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
