import { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Upload, MapPin, Globe, Phone, Mail, Clock } from 'lucide-react';
import api from '../api';

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState({
    resort_name: '',
    tagline: '',
    about_heading: '',
    about_text: '',
    about_image_url: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    check_in_time: '1:00 PM',
    check_out_time: '11:00 AM',
    map_embed_url: '',
    instagram_url: '',
  });

  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    setLoading(true);
    api.get('site-settings/')
      .then(res => {
        setSettings(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const data = new FormData();
      Object.entries(settings).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          data.append(key, val);
        }
      });

      if (aboutImageFile) {
        data.append('about_image', aboutImageFile);
      }

      const res = await api.patch('site-settings/', data);
      setSettings(prev => ({ ...prev, ...res.data }));
      setFeedback({ type: 'success', text: 'Resort settings updated successfully!' });
      setAboutImageFile(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Failed to update settings: ' + JSON.stringify(err.response?.data || err.message)
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading settings…</div>;
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
          Resort Site Settings
        </h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.95rem' }}>
          Customize resort branding, the story page narrative, concierge contact numbers, and check-in times.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        {/* Branding & Taglines */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Resort Branding & Identity</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div>
              <label>Resort Name</label>
              <input
                name="resort_name"
                value={settings.resort_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Tagline / Motto</label>
              <input
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                placeholder="Modern Architectural Micro-Stays..."
              />
            </div>
          </div>
        </div>

        {/* Story & About Page Content */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Story & About Page Content</h2>

          <div>
            <label>Story Section Heading</label>
            <input
              name="about_heading"
              value={settings.about_heading}
              onChange={handleChange}
              placeholder="Relax. Reconnect. Experience Nature Views in Comfort."
              required
            />
          </div>

          <div>
            <label>The Story / Narrative Paragraphs</label>
            <textarea
              name="about_text"
              value={settings.about_text}
              onChange={handleChange}
              style={{ minHeight: '140px', resize: 'vertical' }}
              placeholder="Tell guests about the resort's history, inspiration, architecture, and scenic nature views..."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div>
              <label>Upload Story Photo File</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setAboutImageFile(e.target.files?.[0] || null)}
                style={{ padding: '0.45rem' }}
              />
            </div>
            <div>
              <label>Or External Story Image URL</label>
              <input
                name="about_image_url"
                value={settings.about_image_url || ''}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {settings.about_image_display && (
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 600 }}>Active Story Photo Preview:</div>
              <img
                src={settings.about_image_display}
                alt="Story preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>

        {/* Concierge & Contact Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Concierge & Guest Contact</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div>
              <label>Concierge Phone</label>
              <input
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                placeholder="+1 (800) 555-8455"
              />
            </div>
            <div>
              <label>Reservations Email</label>
              <input
                name="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={handleChange}
                placeholder="stay@villularesort.com"
              />
            </div>
          </div>

          <div>
            <label>Physical Address / Property Location</label>
            <input
              name="contact_address"
              value={settings.contact_address}
              onChange={handleChange}
              placeholder="42 Whispering Horizon Way, Scenic Valley, OR 97701"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div>
              <label>Standard Check-In Time</label>
              <input
                name="check_in_time"
                value={settings.check_in_time}
                onChange={handleChange}
                placeholder="1:00 PM"
              />
            </div>
            <div>
              <label>Standard Check-Out Time</label>
              <input
                name="check_out_time"
                value={settings.check_out_time}
                onChange={handleChange}
                placeholder="11:00 AM"
              />
            </div>
          </div>

          <div>
            <label>Google Maps Embed URL</label>
            <textarea
              name="map_embed_url"
              value={settings.map_embed_url}
              onChange={handleChange}
              style={{ minHeight: '80px' }}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>

          <div>
            <label>Instagram URL</label>
            <input
              name="instagram_url"
              value={settings.instagram_url}
              onChange={handleChange}
              placeholder="https://www.instagram.com/villulacabinseldoret/"
            />
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: feedback.type === 'success' ? '#DEF7EC' : '#FEE2E2',
              color: feedback.type === 'success' ? '#03543F' : '#991B1B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            <Save size={18} />
            {saving ? 'Saving Changes…' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}