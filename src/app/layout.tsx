import './globals.css';
import ClientLayout from './ClientLayout';
import '../styles/tailwind-utilities.css';
export const metadata = {
  title: 'Stellar Link',
  description: 'A connection as brilliant as a star',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body >
        {/* 클라이언트 전용 레이아웃 */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
