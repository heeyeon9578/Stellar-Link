import './globals.css'; // 전역 스타일
import Header from './components/Header';
import Footer from './components/Footer';


export const metadata = {
  title: 'Stellar Link',
  description: 'A connection that shines like a star',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className='text-white'>
       
          <Header />
          <main className="container mx-auto py-4">{children}</main>
          <Footer />
       
      </body>
    </html>
  );
}
