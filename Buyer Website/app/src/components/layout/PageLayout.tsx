import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ hideFooter = false }: { hideFooter?: boolean }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#050815]">
      <Navbar />
      <main className={isAuthPage ? '' : 'pt-16'}>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
