import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import BrandLogo from './BrandLogo';
import api from '../api';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('site-settings/')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary-900)',
        color: '#D4DDD7',
        marginTop: '6rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ padding: '4.5rem 1.5rem 3rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <BrandLogo to="/" theme="dark" size="md" />
            </div>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#A6B5AC', marginBottom: '1.5rem' }}>
              {settings?.tagline || 'Modern architectural micro-stays with panoramic nature views. Luxury container suites and stargazing capsules designed for rest and comfort.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Explore Villula
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.92rem', display: 'grid', gap: '0.8rem' }}>
              <li>
                <Link to="/" style={{ color: '#A6B5AC', transition: 'color 0.2s' }}>
                  Resort Overview
                </Link>
              </li>
              <li>
                <Link to="/cabins" style={{ color: '#A6B5AC', transition: 'color 0.2s' }}>
                  Capsules & Containers
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#A6B5AC', transition: 'color 0.2s' }}>
                  Our Architectural Story
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#A6B5AC', transition: 'color 0.2s' }}>
                  Guest Concierge & Directions
                </Link>
              </li>
              <li>
                <Link to="/house-rules" style={{ color: 'var(--color-accent-400)', fontWeight: 600, transition: 'color 0.2s' }}>
                  House Rules & Guidelines
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: '#A6B5AC', transition: 'color 0.2s' }}>
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Info */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Guest Timings
            </h4>
            <div style={{ display: 'grid', gap: '1rem', fontSize: '0.92rem', color: '#A6B5AC' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--color-accent-400)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#FFFFFF' }}>Check-in:</strong> {settings?.check_in_time || '3:00 PM'}<br />
                  <strong style={{ color: '#FFFFFF' }}>Check-out:</strong> {settings?.check_out_time || '11:00 AM'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-accent-400)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  Keyless smart-lock self check-in available 24/7 with private entry code.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Concierge */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Concierge Desk
            </h4>
            <div style={{ display: 'grid', gap: '0.9rem', fontSize: '0.92rem', color: '#A6B5AC' }}>
              {settings?.contact_address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} style={{ color: 'var(--color-accent-400)', marginTop: '2px', flexShrink: 0 }} />
                  <a
                    href="https://maps.app.goo.gl/dBAcpS5zuinekNUJA"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FFFFFF', textDecoration: 'none' }}
                  >
                    {settings.contact_address}
                  </a>
                </div>
              )}
              {settings?.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} style={{ color: 'var(--color-accent-400)', flexShrink: 0 }} />
                  <a href={`tel:${settings.contact_phone}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              {settings?.contact_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} style={{ color: 'var(--color-accent-400)', flexShrink: 0 }} />
                  <a href={`mailto:${settings.contact_email}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                    {settings.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: '3.5rem',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem',
            color: '#7E8E84',
          }}
        >
          <div>
            © {new Date().getFullYear()} Villula Cabins Resort. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Designed for Rest & Wilderness Solitude</span>
          </div>
        </div>
      </div>
    </footer>
  );
}