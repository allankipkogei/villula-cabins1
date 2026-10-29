import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `nav-item ${isActive ? 'nav-item-active' : ''}`;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.94)' : '#FFFFFF',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: scrolled ? 'var(--color-sand-300)' : 'var(--color-sand-200)',
          transition: 'all 0.25s ease',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px',
          }}
        >
          {/* Official Logo */}
          <BrandLogo to="/" size="md" />

          {/* Desktop Nav */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.75rem',
            }}
            className="desktop-nav"
          >
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/cabins" className={navLinkClass}>
              Our Units
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              The Story
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact & Location
            </NavLink>
            <NavLink to="/house-rules" className={navLinkClass}>
              House Rules
            </NavLink>
          </nav>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Link
              to="/cabins"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem' }}
            >
              Book Now
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--color-primary-900)',
              }}
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 89,
            backgroundColor: 'rgba(14, 27, 19, 0.65)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '76px',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--color-sand-300)',
              padding: '2rem 1.5rem',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
            onClick={e => e.stopPropagation()}
          >
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/cabins" className={navLinkClass}>
              Our Units (Capsules & Containers)
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About Villula & Story
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact Concierge
            </NavLink>
            <NavLink to="/house-rules" className={navLinkClass}>
              House Rules & Guidelines
            </NavLink>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-sand-200)', margin: '0.5rem 0' }} />
            <Link
              to="/cabins"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Check Availability & Book
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 819px) {
          .mobile-toggle {
            display: block !important;
          }
        }
        .nav-item {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--color-text-muted);
          transition: color 0.15s ease;
          position: relative;
          padding: 0.25rem 0;
        }
        .nav-item:hover {
          color: var(--color-primary-700);
        }
        .nav-item-active {
          color: var(--color-primary-800);
          font-weight: 700;
        }
        .nav-item-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--color-accent-500);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}
