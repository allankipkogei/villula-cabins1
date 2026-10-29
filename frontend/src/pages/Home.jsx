import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Flame,
  Wifi,
  Moon,
  Users,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  Coffee,
  Trees
} from 'lucide-react';
import api from '../api';
import { formatKSh } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';
import BrandLogo from '../components/BrandLogo';

export default function Home() {
  const [cabins, setCabins] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Quick search form
  const [searchGuests, setSearchGuests] = useState('1');
  const [searchType, setSearchType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    if (val && (!checkOut || checkOut <= val)) {
      const nextDay = new Date(new Date(val).getTime() + 86400000);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    api.get('cabins/')
      .then(res => setCabins(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('site-settings/')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchGuests) params.set('guests', searchGuests);
    if (searchType) params.set('unit_type', searchType);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    navigate(`/cabins?${params.toString()}`);
  };

  const filteredCabins = selectedType === 'all'
    ? cabins
    : cabins.filter(c => c.unit_type === selectedType);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          background: 'radial-gradient(circle at 50% 25%, #1D3A27 0%, #0E1B13 55%, #060B08 100%)',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto', zIndex: 2 }}>
          {/* Tagline Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1.25rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--color-accent-400)',
              marginBottom: '1.5rem',
            }}
          >
            Modern Architectural Micro-Stays
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)',
              lineHeight: 1.1,
              fontWeight: 600,
              color: '#FFFFFF',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            Where Architectural Design Meets Panoramic Nature
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
              color: 'rgba(255, 255, 255, 0.92)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
            }}
          >
            {settings?.tagline || 'Experience secluded luxury in precision-built shipping containers and futuristic panoramic glass capsules with private cedar hot tubs and sweeping nature views.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link to="/cabins" className="btn btn-accent btn-lg">
              Explore Our Sanctuaries
            </Link>
            <Link to="/about" className="btn btn-outline-white btn-lg">
              The Villula Story
            </Link>
          </div>
        </div>

        {/* Floating Quick Search Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '1120px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--color-text-main)',
            zIndex: 3,
            textAlign: 'left',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="quick-search-form"
          >
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={14} style={{ color: 'var(--color-primary-600)' }} /> Sanctuary Style
              </label>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value="">All Units (Any Style)</option>
                <option value="capsule">Capsule Houses</option>
                <option value="container">Container Units</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={14} style={{ color: 'var(--color-primary-600)' }} /> Total Guests
              </label>
              <select
                value={searchGuests}
                onChange={e => setSearchGuests(e.target.value)}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">3 - 4 Guests</option>
                <option value="6">5 - 6 Guests</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} style={{ color: 'var(--color-primary-600)' }} /> Check-In Date
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={handleCheckInChange}
                required
                style={{
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--color-sand-300)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)',
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} style={{ color: 'var(--color-primary-600)' }} /> Check-Out Date
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                required
                style={{
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--color-sand-300)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)',
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              />
            </div>

            <div className="search-submit-btn">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', padding: '0 1.5rem', whiteSpace: 'nowrap' }}
              >
                Check Availability
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Highlights / The Villula Standard */}
      <section style={{ padding: '6rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-accent-600)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              The Villula Standard
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: 0 }}>
              Crafted for Real Stillness & Luxury Rest
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                icon: <Moon size={28} />,
                title: 'Stargazing Glass Domes',
                desc: 'Over-bed curved smart-glass designed for dark-sky celestial views right from your king mattress.',
              },
              {
                icon: <Flame size={28} />,
                title: 'Private Cedar Hot Tubs',
                desc: 'Every single sanctuary includes its own private cedar hot tub overlooking open scenic nature vistas.',
              },
              {
                icon: <Wifi size={28} />,
                title: 'Starlink Gigabit Wi-Fi',
                desc: 'High-speed satellite connectivity so you can work remotely, stream under open skies, or completely unplug.',
              },
              {
                icon: <Coffee size={28} />,
                title: 'Artisan Kitchen & Coffee',
                desc: 'Nespresso Vertuo espresso bars, local artisan roasts, induction cooking, and luxury cookware.',
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '2.25rem 1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-sand-50)',
                  border: '1px solid var(--color-sand-200)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                className="card-hover"
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Units Catalog */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-sand-100)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--color-accent-600)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                Curated Stays
              </span>
              <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 3.5vw, 2.6rem)' }}>
                Our Architectural Sanctuaries
              </h2>
            </div>

            {/* Filter Tabs - show when units exist */}
            {cabins.length > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#FFFFFF',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-sand-300)',
                  gap: '0.25rem',
                }}
              >
                {[
                  { id: 'all', label: 'All Sanctuaries' },
                  { id: 'capsule', label: 'Capsule Houses' },
                  { id: 'container', label: 'Container Units' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    style={{
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: selectedType === tab.id ? 'var(--color-primary-700)' : 'transparent',
                      color: selectedType === tab.id ? '#FFFFFF' : 'var(--color-text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
              Loading sanctuaries…
            </div>
          ) : filteredCabins.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-sand-300)',
                padding: '4rem 2.5rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-900)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '999px',
                  marginBottom: '1.5rem',
                }}
              >
                Grand Opening Soon
              </div>

              <h3 style={{ fontSize: '2.1rem', color: 'var(--color-primary-950)', marginBottom: '1rem', fontWeight: 600 }}>
                Our Luxury Architectural Sanctuaries
              </h3>

              <p
                style={{
                  color: 'var(--color-text-muted)',
                  maxWidth: '680px',
                  margin: '0 auto 2.5rem',
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                }}
              >
                Villula Cabins Resort is set across the serene landscape in Eldoret, Uasin Gishu County, Kenya.
                Featuring bespoke shipping container villas, futuristic 270° stargazing capsules, and private cedar hot tubs.
                Stay tuned for official reservation bookings.
              </p>

              {/* Architectural Highlights */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  textAlign: 'left',
                  marginBottom: '2.5rem',
                }}
              >
                <div
                  style={{
                    padding: '1.75rem',
                    backgroundColor: 'var(--color-sand-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏗️</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    Shipping Container Villas
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    High-cube architectural upcycled steel with panoramic glass walls, full kitchenettes, and sun deck terraces.
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.75rem',
                    backgroundColor: 'var(--color-sand-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    270° Stargazing Capsules
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Aerospace-grade thermal smart-glass capsules engineered for celestial night sky views directly from bed.
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.75rem',
                    backgroundColor: 'var(--color-sand-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌿</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    Private Nature Grounds
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Wood-fired cedar soaking tubs, outdoor fire pits, and Starlink gigabit connectivity amidst expansive valley views.
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                  Inquire / Pre-Launch Waitlist
                </Link>
                <Link to="/house-rules" className="btn btn-outline" style={{ padding: '0.85rem 2rem' }}>
                  Guest House Guidelines
                </Link>
              </div>
            </div>
          ) : (
            <div className="sanctuaries-grid">
              {filteredCabins.map(cabin => (
                <div
                  key={cabin.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-sand-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  className="card-hover"
                >
                  {/* Image container */}
                  <div style={{ position: 'relative', height: 'clamp(210px, 45vw, 280px)', overflow: 'hidden' }}>
                    <img
                      src={getImageUrl(cabin.primary_image)}
                      alt={cabin.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-cabin.svg';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      <span className={`badge ${cabin.unit_type === 'container' ? 'badge-container' : 'badge-capsule'}`}>
                        {cabin.unit_type === 'container' ? 'Container Unit' : 'Capsule House'}
                      </span>
                    </div>

                    {Number(cabin.rating) > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.85rem',
                          right: '0.85rem',
                          backgroundColor: 'rgba(14, 27, 19, 0.88)',
                          backdropFilter: 'blur(6px)',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--color-accent-400)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        <Star size={13} fill="currentColor" /> {Number(cabin.rating).toFixed(2)}
                        {cabin.review_count > 0 && (
                          <span style={{ color: '#D1D5DB', fontWeight: 500, fontSize: '0.75rem' }}>
                            ({cabin.review_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
                      <Link to={`/cabins/${cabin.slug}`} style={{ color: 'inherit' }}>
                        {cabin.name}
                      </Link>
                    </h3>

                    {cabin.tagline && (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                        {cabin.tagline}
                      </p>
                    )}

                    {/* Specs Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.65rem 1.25rem',
                        padding: '0.85rem 0',
                        borderTop: '1px solid var(--color-sand-200)',
                        borderBottom: '1px solid var(--color-sand-200)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={15} /> Sleeps {cabin.max_guests}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bed size={15} /> {cabin.bedrooms} Bed{cabin.bedrooms > 1 ? 's' : ''}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bath size={15} /> {cabin.bathrooms} Bath
                      </span>
                      {cabin.area_sqft && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Maximize size={15} /> {cabin.area_sqft} ft²
                        </span>
                      )}
                    </div>

                    {/* Pricing & CTA */}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>
                          {formatKSh(cabin.price_per_night)}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}> / night</span>
                      </div>

                      <Link
                        to={`/cabins/${cabin.slug}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.65rem 1.25rem' }}
                      >
                        Reserve <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cabins.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
              <Link to="/cabins" className="btn btn-outline" style={{ padding: '0.85rem 2rem' }}>
                View All Sanctuaries & Availability
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Nature Experience Gallery Strip */}
      <section style={{ padding: '6rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--color-accent-600)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Immersive Nature
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1.25rem' }}>
                Relax, Reconnect & Experience Nature Views
              </h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1.05rem' }}>
                Our secluded scenic property is intentionally designed for stillness, panoramic horizon views, and unhurried rest.
                Unwind on private sun decks, soak in heated cedar hot tubs under open skies, and enjoy seamless comfort.
              </p>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  'Private cedar hot tub prepared and heated for each guest arrival',
                  'Designated dark-sky zone for stargazing without city light pollution',
                  'Eco-engineered zero-emission architecture with solar integration',
                  'Bespoke in-cabin breakfast and artisanal beverage provisions available',
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/about" className="btn btn-primary">
                Read About Our Mission
              </Link>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-sand-50)',
                border: '1px solid var(--color-sand-300)',
                borderRadius: 'var(--radius-xl)',
                padding: '3rem 2.5rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrandLogo variant="full" size="md" />
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-900)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.95rem',
                  borderRadius: '999px',
                  marginTop: '1.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                Opening Soon
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-950)', marginBottom: '0.5rem', fontWeight: 700 }}>
                VIllula View Villas
              </h3>
              <div style={{ color: 'var(--color-primary-700)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Eldoret, Uasin Gishu County • Kenya
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 auto 1.75rem', maxWidth: '340px' }}>
                Modern container villas and 270° stargazing capsules coming soon to the scenic Great Rift Valley landscape.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/contact" className="btn btn-primary btn-sm">
                  Inquire With Concierge
                </Link>
                <Link to="/house-rules" className="btn btn-outline btn-sm">
                  House Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section
        style={{
          backgroundColor: 'var(--color-primary-900)',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '6rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', marginBottom: '1.25rem' }}>
            Escape The Noise. Reserve Your Stay.
          </h2>
          <p style={{ color: '#A6B5AC', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Book directly through our official resort website for guaranteed best rates, complimentary firewood for the cedar tub, and flexible dates.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/cabins" className="btn btn-accent btn-lg">
              Check Sanctuary Availability
            </Link>
            <Link to="/contact" className="btn btn-outline-white btn-lg">
              Inquire With Concierge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
