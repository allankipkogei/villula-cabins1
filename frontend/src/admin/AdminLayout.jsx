import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import api from '../api';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('admin/stats/')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    color: isActive ? '#FFFFFF' : '#A2B4AA',
    backgroundColor: isActive ? 'rgba(201, 168, 106, 0.18)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--color-accent-500)' : '3px solid transparent',
    transition: 'all 0.15s ease',
  });

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <BrandLogo to="/admin" theme="dark" size="sm" />
      </div>

      {/* Nav links */}
      <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <NavLink to="/admin" end style={navLinkStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/bookings" style={navLinkStyle}>
          <CalendarCheck size={18} />
          <span style={{ flex: 1 }}>Bookings</span>
          {stats?.pending_bookings > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-accent-500)',
                color: 'var(--color-primary-900)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
              }}
            >
              {stats.pending_bookings}
            </span>
          )}
        </NavLink>

        <NavLink to="/admin/cabins" style={navLinkStyle}>
          <Home size={18} />
          <span style={{ flex: 1 }}>Sanctuaries</span>
        </NavLink>

        <NavLink to="/admin/messages" style={navLinkStyle}>
          <MessageSquare size={18} />
          <span style={{ flex: 1 }}>Guest Inquiries</span>
          {stats?.unread_messages > 0 && (
            <span
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
              }}
            >
              {stats.unread_messages}
            </span>
          )}
        </NavLink>

        <NavLink to="/admin/settings" style={navLinkStyle}>
          <Settings size={18} />
          <span>Site Settings</span>
        </NavLink>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              borderRadius: '8px',
              color: '#A2B4AA',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 500,
            }}
          >
            <ExternalLink size={16} />
            <span>View Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              marginTop: '0.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              color: '#F87171',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* User Info footer */}
      <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', fontSize: '0.8rem', color: '#7E9185' }}>
        Logged in as <strong style={{ color: '#FFFFFF' }}>{user?.username || 'Staff Admin'}</strong>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F7' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#112218',
          color: '#FFFFFF',
          flexShrink: 0,
          display: 'none',
        }}
        className="admin-desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              backgroundColor: '#112218',
            }}
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(1rem, 3vw, 1.75rem)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="admin-mobile-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#112218',
                padding: '0.25rem',
              }}
            >
              <Menu size={22} />
            </button>
            <div style={{ fontWeight: 600, color: 'var(--color-primary-900)', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>
              Resort Operations & Management
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/"
              className="btn btn-outline btn-sm"
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <ExternalLink size={13} /> Live Site
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem)', flex: 1, maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          <Outlet context={{ refreshStats: () => api.get('admin/stats/').then(res => setStats(res.data)) }} />
        </main>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .admin-desktop-sidebar {
            display: block !important;
          }
        }
        @media (max-width: 899px) {
          .admin-mobile-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
