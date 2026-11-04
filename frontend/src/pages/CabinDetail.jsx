import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  ArrowLeft,
  Users,
  Bed,
  Bath,
  Maximize,
  Star,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../api';
import { formatKSh } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';

export default function CabinDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [cabin, setCabin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activePhoto, setActivePhoto] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  // Calendar & Booking state
  const [searchParams] = useSearchParams();
  const queryCheckIn = searchParams.get('check_in');
  const queryCheckOut = searchParams.get('check_out');
  const initFrom = queryCheckIn ? new Date(queryCheckIn + 'T00:00:00') : undefined;
  const initTo = queryCheckOut ? new Date(queryCheckOut + 'T00:00:00') : undefined;

  const [bookedDates, setBookedDates] = useState([]);
  const [range, setRange] = useState({ from: initFrom, to: initTo });
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guests: parseInt(searchParams.get('guests')) || 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        guest_name: prev.guest_name || user.name || '',
        guest_email: prev.guest_email || user.email || '',
        guest_phone: prev.guest_phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    api.get(`cabins/${slug}/`)
      .then(res => {
        setCabin(res.data);
        const prim = getImageUrl(
          res.data.images?.find(i => i.is_primary)?.url ||
          res.data.images?.[0]?.url ||
          res.data.primary_image
        );
        setActivePhoto(prim);
        return api.get(`cabins/${res.data.id}/availability/`);
      })
      .then(res => {
        const disabled = [];
        res.data.forEach(b => {
          const start = new Date(b.check_in + 'T00:00:00');
          const end = new Date(b.check_out + 'T00:00:00');
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            disabled.push(new Date(d));
          }
        });
        setBookedDates(disabled);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Calculation helpers
  const nights = (range?.from && range?.to)
    ? Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // The admin's price is the FINAL price per night (Tax Included)
  const adminPricePerNight = cabin ? Number(cabin.price_per_night) : 0;
  
  // The Grand Total is just the admin price times the number of nights
  const grandTotal = nights * adminPricePerNight;

  // To show the breakdown, we reverse-calculate the base rate and tax (Total / 1.16)
  const baseRatePerNight = adminPricePerNight / 1.16;
  const staySubtotal = nights * baseRatePerNight;
  const resortTax = grandTotal - staySubtotal;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!range?.from || !range?.to || nights === 0) {
      setErrorMessage('Please select both a check-in and check-out date on the calendar.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    try {
      const payload = {
        cabin: cabin.id,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        guests: Number(form.guests),
        check_in: formatDate(range.from),
        check_out: formatDate(range.to),
      };

      // 1. Create the booking in the database (status = pending)
      const res = await api.post('bookings/', payload);
      
      // Handle both object and array responses from Django
      const bookingId = Array.isArray(res.data) ? res.data[0].id : res.data.id;

      if (!bookingId) {
        throw new Error("Booking was created but no ID was returned. Please check the backend logs.");
      }

      // 2. Wait 1 second to ensure the database transaction commits on Render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Ask Django/Paystack for a checkout URL
      const paymentRes = await api.post('create-checkout-session/', { booking_id: bookingId });

      // 4. Redirect the guest to the Paystack payment page
      if (paymentRes.data.url) {
        window.location.href = paymentRes.data.url;
      } else {
        throw new Error(paymentRes.data.error || "Could not generate payment link. Please try again.");
      }

    } catch (err) {
      console.error("Payment Error:", err);
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const messages = Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ');
        setErrorMessage(messages || 'Verification failed.');
      } else {
        setErrorMessage(detail || err.message || 'Failed to submit booking.');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading sanctuary details…
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Sanctuary Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          The requested unit could not be located or is currently offline.
        </p>
        <Link to="/cabins" className="btn btn-primary">
          Browse All Units
        </Link>
      </div>
    );
  }

  const galleryImages = cabin.images && cabin.images.length > 0
    ? cabin.images.map(img => getImageUrl(img.url))
    : [getImageUrl(cabin.primary_image)];

  return (
    <div style={{ backgroundColor: 'var(--color-sand-50)', paddingBottom: '6rem' }}>
      {/* Breadcrumb Bar */}
      <div style={{ borderBottom: '1px solid var(--color-sand-200)', backgroundColor: '#FFFFFF', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/cabins"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary-700)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to all sanctuaries
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            <MapPin size={14} /> Scenic Nature Enclave
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {/* Title Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${cabin.unit_type === 'container' ? 'badge-container' : 'badge-capsule'}`}>
              {cabin.unit_type === 'container' ? 'Container Unit' : 'Capsule House'}
            </span>
            {Number(cabin.rating) > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#92400E',
                  backgroundColor: '#FEF3C7',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                }}
              >
                <Star size={13} fill="currentColor" /> {Number(cabin.rating).toFixed(2)}
                {cabin.review_count > 0 && ` (${cabin.review_count} verified review${cabin.review_count > 1 ? 's' : ''})`}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', margin: '0 0 0.5rem' }}>
            {cabin.name}
          </h1>
          {cabin.tagline && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', margin: 0 }}>
              {cabin.tagline}
            </p>
          )}
        </div>

        {/* Interactive Gallery */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div
            className="cabin-main-gallery"
            onClick={() => setModalImage(activePhoto || galleryImages[0])}
          >
            <img
              src={activePhoto || galleryImages[0]}
              alt={cabin.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(14, 27, 19, 0.8)',
                color: '#FFFFFF',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                backdropFilter: 'blur(6px)',
              }}
            >
              Click to enlarge photo
            </div>
          </div>

          {/* Thumbnails row */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(imgUrl)}
                  style={{
                    border: activePhoto === imgUrl ? '2px solid var(--color-primary-700)' : '2px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    padding: 0,
                    width: '120px',
                    height: '80px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    opacity: activePhoto === imgUrl ? 1 : 0.7,
                    transition: 'all 0.2s',
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid: Details Left, Booking Widget Right */}
        <div className="split-layout-2col">
          {/* Left Column: Details & Amenities */}
          <div>
            {/* Quick Specs Pill Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-sand-200)',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={22} style={{ color: 'var(--color-primary-600)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Guests</div>
                  <div style={{ fontWeight: 700 }}>Up to {cabin.max_guests}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bed size={22} style={{ color: 'var(--color-primary-600)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bedrooms</div>
                  <div style={{ fontWeight: 700 }}>{cabin.bedrooms} Bed{cabin.bedrooms > 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bath size={22} style={{ color: 'var(--color-primary-600)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bathrooms</div>
                  <div style={{ fontWeight: 700 }}>{cabin.bathrooms} Bath</div>
                </div>
              </div>
              {cabin.area_sqft && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Maximize size={22} style={{ color: 'var(--color-primary-600)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Floor Space</div>
                    <div style={{ fontWeight: 700 }}>{cabin.area_sqft} sq ft</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>About This Sanctuary</h2>
              <p style={{ color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>
                {cabin.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Amenities & Inclusions</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {(cabin.amenities_list || []).map((amenity, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-sand-200)',
                      fontSize: '0.92rem',
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official House Rules & Guidelines */}
            <div
              style={{
                borderTop: '1px solid var(--color-sand-200)',
                paddingTop: '2rem',
                fontSize: '0.92rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ color: 'var(--color-primary-900)', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Guest House Rules & Guidelines
                </h4>
                <Link
                  to="/house-rules"
                  target="_blank"
                  style={{
                    color: 'var(--color-primary-700)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                  }}
                >
                  View All 15 Guidelines →
                </Link>
              </div>

              <div style={{ display: 'grid', gap: '0.6rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                <div><strong>• Check-in & Check-out:</strong> Check-in from 1:00 PM; Check-out by 11:00 AM.</div>
                <div><strong>• Quiet Hours:</strong> Observed between 10:00 PM and 7:00 AM to ensure a peaceful environment for all guests.</div>
                <div><strong>• Housekeeping:</strong> Leave shoes at the designated entry point. Towels/linens are for in-room use only.</div>
                <div><strong>• Fire Safety:</strong> Open flames, fireworks, and unauthorized bonfires are strictly prohibited.</div>
                <div><strong>• Smoking Policy:</strong> Prohibited inside cabins; permitted only in designated outdoor zones.</div>
                <div><strong>• Pets:</strong> Allowed only with prior approval from management.</div>
              </div>

              <div style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--color-accent-600)', fontSize: '0.85rem' }}>
                "Relax. Reconnect. Experience Nature Views in Comfort."
              </div>
            </div>
          </div>

          {/* Right Column: Floating Booking Card */}
          <div className="sticky-booking-widget" style={{ position: 'sticky', top: '96px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-sand-200)',
                padding: 'clamp(1.25rem, 4vw, 2rem)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-sand-200)', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>
                    {formatKSh(adminPricePerNight)}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}> / night (incl. tax)</span>
                </div>
                {Number(cabin.rating) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#B45309',
                      backgroundColor: '#FEF3C7',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    <Star size={14} fill="currentColor" /> {Number(cabin.rating).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Day Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} style={{ color: 'var(--color-primary-600)' }} /> Select Check-In & Check-Out
                </label>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    border: '1px solid var(--color-sand-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-sand-50)',
                    overflowX: 'auto',
                    maxWidth: '100%',
                  }}
                >
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={[{ before: new Date() }, ...bookedDates]}
                    modifiers={{ booked: bookedDates }}
                    modifiersStyles={{ booked: { textDecoration: 'line-through', color: '#B5C0B9' } }}
                  />
                </div>
              </div>

              {/* Range Feedback Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-primary-50)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--color-primary-800)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-primary-100)',
                }}
              >
                <div>
                  <strong>Stay:</strong> {range?.from ? range.from.toLocaleDateString() : 'Check-in'} → {range?.to ? range.to.toLocaleDateString() : 'Check-out'}
                </div>
                {nights > 0 && (
                  <span style={{ fontWeight: 700 }}>
                    {nights} night{nights > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
                <div>
                  <label>Full Guest Name</label>
                  <input
                    name="guest_name"
                    placeholder="e.g. Liam Sullivan"
                    value={form.guest_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label>Email Address</label>
                    <input
                      name="guest_email"
                      type="email"
                      placeholder="you@domain.com"
                      value={form.guest_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <input
                      name="guest_phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.guest_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label>Number of Guests</label>
                  <select
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    required
                  >
                    {[...Array(cabin.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guest{i > 0 ? 's' : ''} {i + 1 === cabin.max_guests ? '(Max capacity)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div
                    style={{
                      borderTop: '1px solid var(--color-sand-200)',
                      paddingTop: '1rem',
                      marginTop: '0.5rem',
                      display: 'grid',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{formatKSh(baseRatePerNight)} × {nights} nights</span>
                      <span>{formatKSh(staySubtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Resort Lodging Tax & Levies (16%)</span>
                      <span>{formatKSh(resortTax)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--color-sand-200)',
                        paddingTop: '0.75rem',
                        marginTop: '0.25rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-900)',
                      }}
                    >
                      <span>Total Stay Price</span>
                      <span>{formatKSh(grandTotal)}</span>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#FDF2F2',
                      color: '#991B1B',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !range?.from || !range?.to || nights === 0}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    opacity: (!range?.from || !range?.to || nights === 0) ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Redirecting to secure payment…' : 'Reserve & Pay Securely'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                <ShieldCheck size={16} /> Secure payment via Card or M-Pesa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={32} />
          </button>
          <img
            src={modalImage}
            alt="Fullscreen preview"
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
}