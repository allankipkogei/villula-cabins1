import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import AnalyticsTracker from './components/AnalyticsTracker';
import Home from './pages/Home';
import About from './pages/About';
import Cabins from './pages/Cabins';
import CabinDetail from './pages/CabinDetail';
import Contact from './pages/Contact';
import HouseRules from './pages/HouseRules';
import AdminLogin from './admin/AdminLogin';
import AdminRegister from './admin/AdminRegister';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import DashboardHome from './admin/DashboardHome';
import AdminBookings from './admin/AdminBookings';
import AdminCabins from './admin/AdminCabins';
import AdminMessages from './admin/AdminMessages';
import AdminSiteSettings from './admin/AdminSiteSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          {/* Public resort customer site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/cabins" element={<Cabins />} />
            <Route path="/cabins/:slug" element={<CabinDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/house-rules" element={<HouseRules />} />
            <Route path="/rules" element={<HouseRules />} />
          </Route>

          {/* Admin PMS & Management Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/signup" element={<AdminRegister />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="cabins" element={<AdminCabins />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSiteSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
