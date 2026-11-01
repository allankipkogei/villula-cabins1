import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
import api from '../api';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('site-settings/')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      await api.post('contact/', form);
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`);
        setErrorMessage(msgs.join(', '));
      } else {
        setErrorMessage('Failed to send message. Please try contacting us via phone or direct email.');
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-sand-50)', paddingBottom: '6rem' }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--color-primary-900)',
          color: '#FFFFFF',
          padding: '5.5rem 1.5rem 4.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            Guest Concierge
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', margin: '0 0 1rem' }}>
            We're Here For You
          </h1>
          <p style={{ color: '#A6B5AC', fontSize: '1.15rem', lineHeight: 1.6, margin: 0 }}>
            Questions regarding an upcoming retreat, tailored packages, or property directions? Reach out directly.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Direct Info & Hours */}
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.25rem' }}>
              Resort Office & Desk
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Our guest experience hosts are on-site daily to assist with firewood, directions, and curated local recommendations across the Cascade Foothills.
            </p>

            <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {/* Phone */}
              {settings?.contact_phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Concierge Line
                    </div>
                    <a
                      href={`tel:${settings.contact_phone}`}
                      style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-800)', textDecoration: 'none' }}
                    >
                      {settings.contact_phone}
                    </a>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      Available daily: 8:00 AM – 8:00 PM EAT
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              {settings?.contact_email && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Reservations & Inquiries
                    </div>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-800)', textDecoration: 'none' }}
                    >
                      {settings.contact_email}
                    </a>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      Typical response within 2–4 hours
                    </div>
                  </div>
                </div>
              )}

              {/* Location Address */}
              {settings?.contact_address && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-sand-200)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Property Sanctuary
                    </div>
                    <a
                      href="https://maps.app.goo.gl/dBAcpS5zuinekNUJA"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--color-primary-800)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      {settings.contact_address}
                      <ExternalLink size={14} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    </a>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      Paved access roads year-round · All vehicles welcome
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '1px solid var(--color-sand-200)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <MessageSquare size={22} style={{ color: 'var(--color-primary-700)' }} />
              <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Send a Message</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Your Name</label>
                  <input
                    name="name"
                    placeholder="e.g. Maya Lin"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="maya@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Phone Number (Optional)</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Subject</label>
                  <input
                    name="subject"
                    placeholder="e.g. Anniversary Stay / Booking"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label>Your Message / Inquiry</label>
                <textarea
                  name="message"
                  placeholder="How can our concierge assist with your stay?"
                  value={form.message}
                  onChange={handleChange}
                  required
                  style={{ minHeight: '140px', resize: 'vertical' }}
                />
              </div>

              {status === 'sent' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-800)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-primary-100)',
                    fontSize: '0.92rem',
                  }}
                >
                  <CheckCircle2 size={20} />
                  <span>Thank you! Your message has been sent to our concierge desk. We will be in touch shortly.</span>
                </div>
              )}

              {status === 'error' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: '#FDF2F2',
                    color: '#991B1B',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.92rem',
                  }}
                >
                  <AlertCircle size={20} />
                  <span>{errorMessage || 'Something went wrong. Please check your fields and try again.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {status === 'sending' ? (
                  'Transmitting message…'
                ) : (
                  <>
                    <Send size={16} /> Send Concierge Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Google Map Section */}
        {settings?.map_embed_url && (
          <div style={{ marginTop: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Enclave Location & Surroundings
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                {settings.contact_address}
              </p>
              <a
                href="https://maps.app.goo.gl/dBAcpS5zuinekNUJA"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MapPin size={15} /> Open in Google Maps Navigation <ExternalLink size={13} />
              </a>
            </div>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1px solid var(--color-sand-300)',
                boxShadow: 'var(--shadow-md)',
                height: '420px',
              }}
            >
              <iframe
                src={settings.map_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Villula Cabins Resort Location Map"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
