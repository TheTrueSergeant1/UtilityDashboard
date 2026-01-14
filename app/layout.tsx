import './globals.css';
import Navbar from '@/components/Navbar';
import { Inter } from 'next/font/google';
import { SettingsProvider } from '@/context/SettingsContext'; // Import the provider

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HomelabOS',
  description: 'Personal LAN Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-200 antialiased selection:bg-blue-500/30`}>
        {/* Wrap everything inside SettingsProvider */}
        <SettingsProvider>
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row min-h-screen">
            <Navbar />
            <main className="flex-1 p-4 md:p-8 md:pl-28 overflow-x-hidden w-full max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}