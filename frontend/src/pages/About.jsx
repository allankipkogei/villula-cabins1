import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trees, ShieldCheck, Heart, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import BrandLogo from '../components/BrandLogo';

export default function About() {
  const [settings, setSettings] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get('site-settings/')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: "How does self check-in work?",
      a: "On the morning of your arrival, you will receive an SMS and email with your personalized smart keypad door code, driving directions, and an interactive digital property map. You can arrive anytime from 1:00 PM onwards without needing to visit an office."
    },
    {
      q: "What are the resort quiet hours and house rules?",
      a: "To ensure a peaceful retreat for all guests, quiet hours are observed between 10:00 PM and 7:00 AM. We are a shoe-free interior resort (please leave outdoor shoes at entry). Smoking inside cabins, open flames, and unauthorized bonfires are strictly prohibited. You can review all 15 rules on our House Rules page."
    },
    {
      q: "Are the cabins pet friendly?",
      a: "Pets are warmly welcomed with prior approval from management. Pet owners are responsible for supervising and cleaning up after their pets and ensuring they do not disturb other guests."
    },
    {
      q: "How does the Starlink Wi-Fi perform at the resort?",
      a: "Every sanctuary is outfitted with dedicated Starlink satellite terminals delivering 120–220 Mbps download speeds with low latency. Remote work, Zoom video calls, and 4K streaming function seamlessly."
    },
    {
      q: "What is provided in the kitchen and bath?",
      a: "All stays include Nespresso Vertuo machines with complimentary pods, locally roasted pour-over beans, induction cooktops, cookware, olive oil, salt/pepper, luxury Parachute organic bed linens, plush bathrobes, and organic cedarwood bath amenities."
    },
    {
      q: "What is your cancellation and reschedule policy?",
      a: "Full refund for cancellations made up to 14 days before check-in. Cancellations between 7 and 14 days receive a 50% refund or 100% resort credit towards future dates."
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-sand-50)', paddingBottom: '6rem' }}>
      {/* Hero Header */}
      <section
        style={{
          backgroundColor: 'var(--color-primary-900)',
          color: '#FFFFFF',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--color-accent-400)',
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            The Villula Philosophy
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: 'clamp(2.4rem, 5vw, 4rem)', margin: '0 0 1.25rem' }}>
            {settings?.about_heading || 'Relax. Reconnect. Experience Nature Views in Comfort.'}
          </h1>
          <p style={{ color: '#A6B5AC', fontSize: '1.2rem', lineHeight: 1.7, margin: 0 }}>
            We created Villula as an architectural sanctuary — proving that contemporary micro-living can exist in total harmony with scenic nature.
          </p>
        </div>
      </section>

      {/* Story & Image Section */}
      <section className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
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
              Our Vision
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1.5rem' }}>
              Micro-Living Without Compromise
            </h2>
            <div style={{ color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: 1.8, display: 'grid', gap: '1.25rem' }}>
              <p>
                {settings?.about_text || (
                  "Villula Cabins Resort reimagines the retreat experience across peaceful scenic nature grounds. We merged sustainable micro-architecture — precision-engineered shipping containers and aerospace-grade glass capsules — with five-star bespoke hospitality."
                )}
              </p>
              <p>
                Rather than sprawling conventional hotels, we intentionally positioned individual micro-stays across secluded scenic topography. Elevated foundations protect the natural ground, solar offsets power our climate control, and dark-sky lighting guidelines allow the night sky to shine unobstructed every clear evening.
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/cabins" className="btn btn-primary">
                Explore Available Sanctuaries <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div>
            {settings?.about_image_display ? (
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  height: '460px',
                }}
              >
                <img
                  src={settings.about_image_display}
                  alt="Villula Resort Grounds"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: '#0E1B13',
                  color: '#FFFFFF',
                  padding: '3.5rem 2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  minHeight: '440px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #D4AF37, #F59E0B, #D4AF37)',
                  }}
                />
                <BrandLogo variant="mark" size="lg" theme="dark" />
                <h3
                  style={{
                    color: '#FFFFFF',
                    fontSize: '1.6rem',
                    marginTop: '1.5rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  VILLULA CABINS RESORT
                </h3>
                <div
                  style={{
                    color: '#D4AF37',
                    fontSize: '0.82rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                  }}
                >
                  Eldoret, Uasin Gishu County • Kenya
                </div>
                <p
                  style={{
                    color: '#E5E7EB',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    maxWidth: '340px',
                    margin: '0 0 1.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  "Relax. Reconnect. Experience Nature Views in Comfort."
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#FDE68A',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                  }}
                >
                  Grand Opening Soon
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4.5rem 0', borderTop: '1px solid var(--color-sand-200)', borderBottom: '1px solid var(--color-sand-200)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '3rem',
              textAlign: 'center',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            {[
              { number: '100%', label: 'Renewable Solar Offset', sub: 'Eco-conscious low-impact design' },
              { number: '0', label: 'Compromises on Comfort', sub: 'Starlink, cedar tubs & king beds' },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3.2rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-800)',
                    lineHeight: 1,
                    marginBottom: '0.4rem',
                  }}
                >
                  {stat.number}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {stat.label}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="container-narrow" style={{ paddingTop: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
            Got Questions?
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-sand-200)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: 'var(--color-primary-900)',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      borderTop: '1px solid var(--color-sand-100)',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Have a custom inquiry or special occasion request?
          </p>
          <Link to="/contact" className="btn btn-primary">
            Message Resort Concierge
          </Link>
        </div>
      </section>
    </div>
  );
}
