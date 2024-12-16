'use client';

import { usePathname } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import ClientProvider from './components/ClientProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith('/chat')

  return (
    <div className={`text-white`}>
      {!isChatPage && <Header />}
      <main className={` ${isChatPage ? 'chat-layout' : 'container mx-auto py-4'}`}>
        <ClientProvider>{children}</ClientProvider>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}
