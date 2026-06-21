import type { Metadata } from 'next';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthProvider } from '@/providers/auth-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Casino Platform',
  description: 'Fullstack casino platform demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}