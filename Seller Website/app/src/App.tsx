import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';
import { OrderWorkspace } from '@/pages/OrderWorkspace';
import { Earnings } from '@/pages/Earnings';
import { Analytics } from '@/pages/Analytics';
import { Assets } from '@/pages/Assets';
import { Gigs } from '@/pages/Gigs';
import { Inbox } from '@/pages/Inbox';
import { Reviews } from '@/pages/Reviews';
import { Settings } from '@/pages/Settings';
import { Onboarding } from '@/pages/Onboarding';
import { UploadAsset } from '@/pages/UploadAsset';
import { CreateGig } from '@/pages/CreateGig';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/orders': 'Orders',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/assets': 'Assets',
  '/dashboard/gigs': 'Gigs',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/reviews': 'Reviews',
  '/dashboard/settings': 'Settings',
  '/upload/new': 'Upload Asset',
  '/gigs/new': 'Create Gig',
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { setPageTitle, sidebarCollapsed } = useStore();

  useEffect(() => {
    const basePath = location.pathname.replace(/\/\d+$/, '');
    const title = pageTitles[location.pathname] || pageTitles[basePath] || 'Dashboard';
    setPageTitle(title);
  }, [location.pathname, setPageTitle]);

  const marginLeft = sidebarCollapsed ? '72px' : '240px';

  return (
    <div className="min-h-screen" style={{ background: '#0A0F2E' }}>
      {/* Cosmic background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/Bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(5,8,21,0.7) 0%, rgba(5,8,21,0.4) 50%, rgba(5,8,21,0.8) 100%)',
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 20% 30%, rgba(139,47,255,0.06) 0%, transparent 70%)',
        }}
      />

      <Sidebar />

      <div
        className="relative z-10 min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft }}
      >
        <TopBar />
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
      <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
      <Route path="/dashboard/orders" element={<PageWrapper><Orders /></PageWrapper>} />
      <Route path="/dashboard/orders/:id" element={<PageWrapper><OrderWorkspace /></PageWrapper>} />
      <Route path="/dashboard/earnings" element={<PageWrapper><Earnings /></PageWrapper>} />
      <Route path="/dashboard/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
      <Route path="/dashboard/assets" element={<PageWrapper><Assets /></PageWrapper>} />
      <Route path="/dashboard/gigs" element={<PageWrapper><Gigs /></PageWrapper>} />
      <Route path="/dashboard/inbox" element={<PageWrapper><Inbox /></PageWrapper>} />
      <Route path="/dashboard/reviews" element={<PageWrapper><Reviews /></PageWrapper>} />
      <Route path="/dashboard/settings" element={<PageWrapper><Settings /></PageWrapper>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/upload/new" element={<PageWrapper><UploadAsset /></PageWrapper>} />
      <Route path="/gigs/new" element={<PageWrapper><CreateGig /></PageWrapper>} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
