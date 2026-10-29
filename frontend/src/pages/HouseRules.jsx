import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Trees,
  Volume2,
  Users,
  Cigarette,
  ShieldAlert,
  Flame,
  PawPrint,
  Home,
  Wine,
  Baby,
  Car,
  Scale,
  Leaf,
  ArrowLeft,
  Download
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function HouseRules() {
  const rules = [
    {
      num: 1,
      title: "Check-in & Check-out",
      icon: <Clock size={20} />,
      items: [
        "Check-in: From 1:00 PM",
        "Check-out: By 11:00 AM",
        "Early check-in and late check-out are subject to availability and prior approval."
      ]
    },
    {
      num: 2,
      title: "Respect for Nature & Environment",
      icon: <Trees size={20} />,
      items: [
        "Help us preserve the beauty of the surroundings by disposing of waste responsibly.",
        "Do not litter within the property or surrounding natural areas.",
        "Avoid damaging plants, trees, landscaping, or wildlife."
      ]
    },
    {
      num: 3,
      title: "Noise Policy",
      icon: <Volume2 size={20} />,
      items: [
        "Quiet hours are observed between 10:00 PM and 7:00 AM.",
        "Please keep music, conversations, and electronic devices at a respectful volume."
      ]
    },
    {
      num: 4,
      title: "Occupancy",
      icon: <Users size={20} />,
      items: [
        "Only registered guests are permitted to stay overnight.",
        "Additional visitors must be approved by management.",
        "Maximum occupancy limits for each cabin must be observed."
      ]
    },
    {
      num: 5,
      title: "Smoking Policy",
      icon: <Cigarette size={20} />,
      items: [
        "Smoking is prohibited inside cabins.",
        "Smoking is only permitted in designated outdoor areas.",
        "Please use provided ashtrays and dispose of cigarette waste."
      ]
    },
    {
      num: 6,
      title: "Safety & Security",
      icon: <ShieldAlert size={20} />,
      items: [
        "Lock doors and windows whenever leaving your cabin.",
        "Keep valuables secure. Management is not responsible for lost or stolen items."
      ]
    },
    {
      num: 7,
      title: "Fire Safety",
      icon: <Flame size={20} />,
      items: [
        "Open flames, fireworks, and unauthorized bonfires are strictly prohibited.",
        "Barbecue equipment may only be used in designated areas.",
        "Familiarize yourself with fire extinguishers/blankets usage, emergency exits and procedures."
      ]
    },
    {
      num: 8,
      title: "Pets",
      icon: <PawPrint size={20} />,
      items: [
        "Pets are only allowed with prior approval from management.",
        "Pet owners are responsible for cleaning up after their pets and ensuring they do not disturb other guests."
      ]
    },
    {
      num: 9,
      title: "Property Care",
      icon: <Home size={20} />,
      items: [
        "Please treat the cabins, furnishings, and amenities with care.",
        "Any damage caused by guests may result in repair or replacement charges."
      ]
    },
    {
      num: 10,
      title: "Alcohol Consumption",
      icon: <Wine size={20} />,
      items: [
        "Responsible consumption of alcohol is encouraged.",
        "Excessive noise, disorderly conduct, or disturbance to other guests will not be permitted."
      ]
    },
    {
      num: 11,
      title: "Children",
      icon: <Baby size={20} />,
      items: [
        "Parents and guardians are responsible for supervising children at all times.",
        "Children should not be left unattended around decks, water features, or outdoor recreational areas."
      ]
    },
    {
      num: 12,
      title: "Housekeeping",
      icon: <Home size={20} />,
      items: [
        "Leave your shoes at the designated entry point. Please maintain reasonable cleanliness within your cabin during your stay.",
        "Towels and linens are provided for in-room use only."
      ]
    },
    {
      num: 13,
      title: "Parking",
      icon: <Car size={20} />,
      items: [
        "Park only in designated parking areas.",
        "Villula Cabins Resort is not liable for damage to or loss from vehicles."
      ]
    },
    {
      num: 14,
      title: "Liability",
      icon: <Scale size={20} />,
      items: [
        "Guests use resort facilities and outdoor areas at their own risk.",
        "Management reserves the right to refuse service or remove guests whose conduct is disruptive, illegal, or unsafe."
      ]
    },
    {
      num: 15,
      title: "Sustainability Commitment",
      icon: <Leaf size={20} />,
      items: [
        "At Villula Cabins Resort, we believe in responsible tourism. Guests are encouraged to:",
        "• Conserve water and electricity.",
        "• Reuse towels when possible.",
        "• Support eco-friendly practices during your stay. Thank you."
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-sand-50)', paddingBottom: '6rem' }}>
      {/* Top Bar Navigation */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-sand-200)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary-700)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
          <a
            href="/guest-house-rules.jpg"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} /> View Rules
          </a>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', maxWidth: '1060px' }}>
        {/* Document Header Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2rem) clamp(1.75rem, 4vw, 2.5rem)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-sand-200)',
            marginBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <BrandLogo size="lg" to="/" />
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              margin: '0.75rem 0',
              fontWeight: 700,
              color: 'var(--color-primary-900)',
            }}
          >
            Guest House Rules & Guidelines
          </h1>

          <div
            style={{
              width: '80px',
              height: '3px',
              backgroundColor: 'var(--color-accent-500)',
              margin: '1.25rem auto 1.75rem',
              borderRadius: '2px',
            }}
          />

          <p
            style={{
              color: 'var(--color-text-main)',
              fontSize: '1.1rem',
              maxWidth: '780px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Welcome to <strong>Villula Cabins Resort</strong>. We are delighted to host you and kindly ask that all guests observe the following rules to ensure a safe, peaceful, and enjoyable experience for everyone.
          </p>
        </div>

        {/* 15 Rules Two-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {rules.map(rule => (
            <div
              key={rule.num}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1px solid var(--color-sand-200)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
              }}
            >
              {/* Number Badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary-700)',
                  color: 'var(--color-accent-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                {rule.num}.
              </div>

              {/* Rule Content */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    margin: '0 0 0.5rem',
                    color: 'var(--color-primary-900)',
                    fontWeight: 700,
                  }}
                >
                  {rule.title}
                </h3>
                <div style={{ display: 'grid', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                  {rule.items.map((item, idx) => (
                    <div key={idx}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote & Sign-off Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-900)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              color: 'var(--color-accent-400)',
              fontStyle: 'italic',
              marginBottom: '1.25rem',
            }}
          >
            "Relax. Reconnect. Experience Nature Views in Comfort."
          </div>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#D4DDD7',
              maxWidth: '680px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            We appreciate your cooperation and wish you a memorable stay at <strong>VILLULA CABINS RESORT</strong>.
          </p>

          <Link to="/cabins" className="btn btn-accent">
            Browse Sanctuaries
          </Link>
        </div>
      </div>
    </div>
  );
}
