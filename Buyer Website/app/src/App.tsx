import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import PageLayout from '@/components/layout/PageLayout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import AssetDetail from '@/pages/AssetDetail';
import AIStudio from '@/pages/AIStudio';
import AIToolWorkspace from '@/pages/AIToolWorkspace';
import Services from '@/pages/Services';
import GigDetail from '@/pages/GigDetail';
import SellerProfile from '@/pages/SellerProfile';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import DashboardLibrary from '@/pages/DashboardLibrary';
import DashboardOrders from '@/pages/DashboardOrders';
import DashboardGenerations from '@/pages/DashboardGenerations';
import DashboardFavorites from '@/pages/DashboardFavorites';
import DashboardBilling from '@/pages/DashboardBilling';
import PostProject from '@/pages/PostProject';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:category" element={<Explore />} />
        <Route path="/asset/:slug" element={<AssetDetail />} />
        <Route path="/ai-studio" element={<AIStudio />} />
        <Route path="/ai-studio/:tool" element={<AIToolWorkspace />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:category" element={<Services />} />
        <Route path="/gig/:seller/:slug" element={<GigDetail />} />
        <Route path="/seller/:username" element={<SellerProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/post-project" element={<PostProject />} />
      </Route>

      {/* Auth Routes - no footer */}
      <Route element={<PageLayout hideFooter />}>
        <Route path="/login" element={<PublicGuard><Login /></PublicGuard>} />
        <Route path="/signup" element={<PublicGuard><Signup /></PublicGuard>} />
        <Route path="/forgot-password" element={<PublicGuard><ForgotPassword /></PublicGuard>} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<PageLayout />}>
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/dashboard/library" element={<AuthGuard><DashboardLibrary /></AuthGuard>} />
        <Route path="/dashboard/orders" element={<AuthGuard><DashboardOrders /></AuthGuard>} />
        <Route path="/dashboard/generations" element={<AuthGuard><DashboardGenerations /></AuthGuard>} />
        <Route path="/dashboard/favorites" element={<AuthGuard><DashboardFavorites /></AuthGuard>} />
        <Route path="/dashboard/billing" element={<AuthGuard><DashboardBilling /></AuthGuard>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
