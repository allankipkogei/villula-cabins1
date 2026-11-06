import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Eye,
  Trash2,
  Mail,
  Phone,
  X,
  Plus
} from 'lucide-react';
import api from '../api';
import { formatKSh } from '../utils/formatCurrency';

const STATUSES = ['pending', 'confirmed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBookingModal, setActiveBookingModal] = useState(null);
  const [emailSending, setEmailSending] = useState(false);

  // Manual Reservation Creation
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cabins, setCabins] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    cabin: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    status: 'confirmed',
  });

  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const res = await api.get('admin/cabins/');
      setCabins(res.data);
      if (res.data.length > 0 && !createForm.cabin) {
        setCreateForm(prev => ({ ...prev, cabin: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const res = await api.post('admin/bookings/', createForm);
      setBookings(prev => [res.data, ...prev]);
      setIsCreateOpen(false);
      setCreateForm({
        cabin: cabins[0]?.id || '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        check_in: '',
        check_out: '',
        guests: 1,
        status: 'confirmed',
      });
      alert('Reservation successfully created!');
    } catch (err) {
      const errorMsg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join('\n')
        : 'Failed to create booking.';
      alert(errorMsg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const load = () => {
    setLoading(true);
    const params = {};
    if (filter) params.status = filter;
    if (search) params.search = search;

    api.get('admin/bookings/', { params })
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`admin/bookings/${id}/`, { status });
      const target = bookings.find(b => b.id === id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (activeBookingModal?.id === id) {
        setActiveBookingModal(prev => ({ ...prev, status }));
      }
      if (status === 'confirmed') {
        alert(`Booking #${id} confirmed! An automated welcome confirmation email has been dispatched to ${target?.guest_email || 'the guest'}.`);
      }
    } catch {
      alert('Failed to update booking status.');
    }
  };

  const resendWelcomeEmail = async (id) => {
    setEmailSending(true);
    try {
      const res = await api.post(`admin/bookings/${id}/resend-welcome-email/`);
      alert(res.data?.message || 'Welcome confirmation email sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deliver welcome email. Please verify SMTP credentials.');
    } finally {
      setEmailSending(false);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation record? This cannot be undone.')) return;
    try {
      await api.delete(`admin/bookings/${id}/`);
      setBookings(prev => prev.filter(b => b.id !== id));
      if (activeBookingModal?.id === id) setActiveBookingModal(null);
    } catch {
      alert('Failed to delete booking.');
    }
  };

  const getBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#DEF7EC', color: '#03543F', text: 'Confirmed' };
      case 'pending':
        return { bg: '#FEF08A', color: '#854D0E', text: 'Pending' };
      case 'cancelled':
        return { bg: '#FEE2E2', color: '#991B1B', text: 'Cancelled' };
      default:
        return { bg: '#E5E7EB', color: '#374151', text: status };
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
            Guest Bookings
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.95rem' }}>
            Inspect, approve, create, and manage customer reservations across all sanctuaries.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={18} /> New Reservation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: '', label: 'All Bookings' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                border: '1px solid',
                borderColor: filter === tab.id ? 'var(--color-primary-700)' : '#E5E7EB',
                backgroundColor: filter === tab.id ? 'var(--color-primary-700)' : '#FFFFFF',
                color: filter === tab.id ? '#FFFFFF' : '#4B5563',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9CA3AF' }} />
            <input
              placeholder="Search guest, email, cabin…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <button onClick={load} className="btn btn-outline btn-sm">
            Search
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
          Loading reservations…
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '940px' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '0.9rem 1.25rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem' }}>Ref / Sanctuary</th>
                  <th style={{ padding: '0.9rem 1rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem' }}>Guest Information</th>
                  <th style={{ padding: '0.9rem 1rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem' }}>Stay Schedule</th>
                  <th style={{ padding: '0.9rem 1rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem' }}>Total Amount</th>
                  <th style={{ padding: '0.9rem 1rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.9rem 1.25rem', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const badge = getBadge(b.status);
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                          {b.cabin_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          Ref #VIL-{b.id}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#1F2937' }}>{b.guest_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{b.guest_email}</div>
                        {b.guest_phone && (
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{b.guest_phone}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#111827' }}>
                          <strong>{b.check_in}</strong> to <strong>{b.check_out}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                          {b.nights} nights · {b.guests} guest{b.guests > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#111827' }}>
                        {formatKSh(b.total_price)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            display: 'inline-block',
                          }}
                        >
                          {badge.text}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => setActiveBookingModal(b)}
                            title="Inspect Booking Details"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Eye size={14} /> View
                          </button>

                          {b.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(b.id, 'confirmed')}
                              title="Confirm Reservation"
                              style={{
                                border: 'none',
                                backgroundColor: '#DEF7EC',
                                color: '#03543F',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(b.id, 'cancelled')}
                              title="Cancel Reservation"
                              style={{
                                border: 'none',
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={() => deleteBooking(b.id)}
                            title="Delete Record"
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#9CA3AF',
                              padding: '0.35rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                        No Reservations Recorded
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#9CA3AF', maxWidth: '420px', margin: '0 auto' }}>
                        Active bookings and guest records will automatically populate here as reservations are made.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Record New Reservation</h2>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Create an official guest booking manually as an administrator.</div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={22} />
              </button>
            </div>

            {cabins.length === 0 ? (
              <div style={{ padding: '1.5rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <strong>No Sanctuaries Available:</strong> You need to create at least one sanctuary under <em>Manage Sanctuaries</em> before you can record a booking.
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                    Select Sanctuary *
                  </label>
                  <select
                    value={createForm.cabin}
                    onChange={e => setCreateForm({ ...createForm, cabin: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  >
                    {cabins.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatKSh(c.price_per_night)} / night)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Guest Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Kamau"
                      value={createForm.guest_name}
                      onChange={e => setCreateForm({ ...createForm, guest_name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Guest Email *
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={createForm.guest_email}
                      onChange={e => setCreateForm({ ...createForm, guest_email: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Guest Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+254 700 000 000"
                      value={createForm.guest_phone}
                      onChange={e => setCreateForm({ ...createForm, guest_phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={createForm.guests}
                      onChange={e => setCreateForm({ ...createForm, guests: parseInt(e.target.value) || 1 })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Check-In Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.check_in}
                      onChange={e => setCreateForm({ ...createForm, check_in: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                      Check-Out Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.check_out}
                      onChange={e => setCreateForm({ ...createForm, check_out: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '0.35rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="btn btn-primary"
                  >
                    {createSubmitting ? 'Recording...' : 'Create Reservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {activeBookingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setActiveBookingModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Reservation #VIL-{activeBookingModal.id}</h2>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Created: {activeBookingModal.created_at ? new Date(activeBookingModal.created_at).toLocaleString() : 'Recent'}</div>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700, marginBottom: '0.35rem' }}>Reserved Sanctuary</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>{activeBookingModal.cabin_name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Guest Name</div>
                  <div style={{ fontWeight: 600 }}>{activeBookingModal.guest_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Number of Guests</div>
                  <div style={{ fontWeight: 600 }}>{activeBookingModal.guests} Guest(s)</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Email Address</div>
                  <a href={`mailto:${activeBookingModal.guest_email}`} style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
                    {activeBookingModal.guest_email}
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Phone</div>
                  <div>{activeBookingModal.guest_phone || 'None provided'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Check-In</div>
                  <div style={{ fontWeight: 600 }}>{activeBookingModal.check_in}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Check-Out</div>
                  <div style={{ fontWeight: 600 }}>{activeBookingModal.check_out}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 700 }}>Total Nights</div>
                  <div style={{ fontWeight: 600 }}>{activeBookingModal.nights} night(s)</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Total Booking Revenue</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                    {formatKSh(activeBookingModal.total_price)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Status</div>
                  <select
                    value={activeBookingModal.status}
                    onChange={e => updateStatus(activeBookingModal.id, e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontWeight: 600 }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => resendWelcomeEmail(activeBookingModal.id)}
                disabled={emailSending}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-700)', borderColor: 'var(--color-primary-700)' }}
              >
                <Mail size={15} /> {emailSending ? 'Sending Welcome Email...' : 'Send / Resend Welcome Email'}
              </button>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
