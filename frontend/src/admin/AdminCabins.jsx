import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  Star,
  X,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../api';
import { formatKSh } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';

const emptyForm = {
  name: '',
  unit_type: 'capsule',
  tagline: '',
  description: '',
  price_per_night: '',
  max_guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  area_sqft: 320,
  amenities: 'Private Hot Tub, Starlink High-Speed Wi-Fi, Panoramic Sun Deck, Kitchenette & Nespresso, Climate Control (Heat & A/C), Outdoor Fire Pit, Luxury Linens',
  rating: 0,
  review_count: 0,
  is_active: true,
};

export default function AdminCabins() {
  const [cabins, setCabins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Initial photos for create/edit form
  const [formFiles, setFormFiles] = useState([]);
  const [formFilePreviews, setFormFilePreviews] = useState([]);
  const [formUrl, setFormUrl] = useState('');

  // Image management modal state
  const [imageModalCabin, setImageModalCabin] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [externalUrl, setExternalUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [setAsPrimary, setSetAsPrimary] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageMsg, setImageMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get('admin/cabins/')
      .then(res => setCabins(res.data))
      .catch(err => setError(JSON.stringify(err.response?.data || err.message)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormFilesChange = e => {
    const files = Array.from(e.target.files || []);
    setFormFiles(files);
    setFormFilePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price_per_night: Number(form.price_per_night),
      max_guests: Number(form.max_guests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area_sqft: Number(form.area_sqft || 300),
      rating: Number(form.rating || 0),
      review_count: Number(form.review_count || 0),
    };

    try {
      let savedCabin = null;
      if (editingId) {
        const res = await api.patch(`admin/cabins/${editingId}/`, payload);
        savedCabin = res.data;
      } else {
        const res = await api.post('admin/cabins/', payload);
        savedCabin = res.data;
      }

      // If user selected files during creation/editing, upload them
      if (savedCabin && formFiles.length > 0) {
        const fd = new FormData();
        fd.append('cabin', savedCabin.id);
        fd.append('alt_text', savedCabin.name);
        for (let i = 0; i < formFiles.length; i++) {
          fd.append('images', formFiles[i]);
        }
        await api.post('admin/cabin-images/', fd);
      } else if (savedCabin && formUrl.trim()) {
        await api.post('admin/cabin-images/', {
          cabin: savedCabin.id,
          external_url: formUrl.trim(),
          alt_text: savedCabin.name,
          is_primary: true,
        });
      }

      setForm(emptyForm);
      setFormFiles([]);
      setFormFilePreviews([]);
      setFormUrl('');
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const startEdit = cabin => {
    setEditingId(cabin.id);
    setForm({
      name: cabin.name,
      unit_type: cabin.unit_type,
      tagline: cabin.tagline || '',
      description: cabin.description,
      price_per_night: cabin.price_per_night,
      max_guests: cabin.max_guests,
      bedrooms: cabin.bedrooms,
      bathrooms: cabin.bathrooms,
      area_sqft: cabin.area_sqft || 320,
      amenities: cabin.amenities || '',
      rating: cabin.rating || 0,
      review_count: cabin.review_count || 0,
      is_active: cabin.is_active,
    });
    setFormFiles([]);
    setFormFilePreviews([]);
    setFormUrl('');
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormFiles([]);
    setFormFilePreviews([]);
    setFormUrl('');
    setShowForm(false);
    setError('');
  };

  const removeCabin = async id => {
    if (!window.confirm('Delete this sanctuary permanently? This cannot be undone.')) return;
    try {
      await api.delete(`admin/cabins/${id}/`);
      if (editingId === id) cancelEdit();
      load();
    } catch (err) {
      alert('Failed to delete sanctuary: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  // Image Modal Actions
  const openImageManager = async (cabin) => {
    setImageModalCabin(cabin);
    setImageMsg('');
    setUploadFiles([]);
    setUploadPreviews([]);
    setExternalUrl('');
    setPhotoCaption('');
    setSetAsPrimary(true);
  };

  const handleModalFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
    setUploadPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleUploadImage = async () => {
    if ((!uploadFiles || uploadFiles.length === 0) && !externalUrl.trim()) {
      setImageMsg('Please select photo file(s) or enter an external image URL.');
      return;
    }
    setUploading(true);
    setImageMsg('');

    try {
      if (uploadFiles && uploadFiles.length > 0) {
        const data = new FormData();
        data.append('cabin', imageModalCabin.id);
        data.append('alt_text', photoCaption || imageModalCabin.name);
        data.append('is_primary', setAsPrimary ? 'true' : 'false');

        for (let i = 0; i < uploadFiles.length; i++) {
          data.append('images', uploadFiles[i]);
        }
        await api.post('admin/cabin-images/', data);
      } else if (externalUrl.trim()) {
        await api.post('admin/cabin-images/', {
          cabin: imageModalCabin.id,
          external_url: externalUrl.trim(),
          alt_text: photoCaption || imageModalCabin.name,
          is_primary: setAsPrimary,
        });
      }

      setImageMsg(`✅ Photos successfully added to ${imageModalCabin.name}!`);
      setUploadFiles([]);
      setUploadPreviews([]);
      setExternalUrl('');
      setPhotoCaption('');

      // Refresh cabin in modal and main list
      const updated = await api.get(`admin/cabins/${imageModalCabin.id}/`);
      setImageModalCabin(updated.data);
      load();
    } catch (err) {
      setImageMsg('❌ ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryImage = async (imgId) => {
    try {
      await api.patch(`admin/cabin-images/${imgId}/`, { is_primary: true });
      const updated = await api.get(`admin/cabins/${imageModalCabin.id}/`);
      setImageModalCabin(updated.data);
      load();
    } catch (err) {
      alert('Failed to set primary image.');
    }
  };

  const deleteImage = async (imgId) => {
    if (!window.confirm('Remove this photo permanently?')) return;
    try {
      await api.delete(`admin/cabin-images/${imgId}/`);
      const updated = await api.get(`admin/cabins/${imageModalCabin.id}/`);
      setImageModalCabin(updated.data);
      load();
    } catch (err) {
      alert('Failed to delete image.');
    }
  };

  return (
    <div>
      {/* Title & Add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
            Sanctuary Units
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.95rem' }}>
            Manage capsule houses, container villas, nightly rates, and high-resolution galleries.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="btn btn-primary"
          >
            <Plus size={18} /> Add New Sanctuary
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
              {editingId ? `Edit Sanctuary: ${form.name}` : 'Create New Sanctuary Unit'}
            </h2>
            <button
              onClick={cancelEdit}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label>Sanctuary Name</label>
                <input
                  name="name"
                  placeholder="e.g. The Obsidian Horizon Container"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Unit Architecture Style</label>
                <select
                  name="unit_type"
                  value={form.unit_type}
                  onChange={handleChange}
                >
                  <option value="capsule">Capsule House</option>
                  <option value="container">Container Unit</option>
                </select>
              </div>
            </div>

            <div>
              <label>Tagline / Subheading</label>
              <input
                name="tagline"
                placeholder="e.g. Futuristic aerospace capsule with 270° stargazing glass dome"
                value={form.tagline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Full Sanctuary Description</label>
              <textarea
                name="description"
                placeholder="Detailed description of features, views, and experience…"
                value={form.description}
                onChange={handleChange}
                style={{ minHeight: '110px', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              <div>
                <label>Price / Night (KSh)</label>
                <input
                  name="price_per_night"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="32000.00"
                  value={form.price_per_night}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Max Guests</label>
                <input
                  name="max_guests"
                  type="number"
                  min="1"
                  value={form.max_guests}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Bedrooms</label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Bathrooms</label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Area (Sq Ft)</label>
                <input
                  name="area_sqft"
                  type="number"
                  min="50"
                  value={form.area_sqft}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label>Amenities List (Comma-separated)</label>
              <input
                name="amenities"
                placeholder="Private Hot Tub, Starlink Wi-Fi, Panoramic Deck, Nespresso Bar..."
                value={form.amenities}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem', display: 'block' }}>
                Separate amenities by comma (e.g. Private Cedar Hot Tub, Starlink Wi-Fi, Fire Pit, Sauna)
              </span>
            </div>

            {/* Star Rating & Review Count (Admin-Controlled) */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Star size={18} style={{ color: '#D97706' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                  Star Rating & Reviews (Admin Controlled)
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 1rem' }}>
                Leave rating at 0 to hide star ratings completely from public visitors. If you specify a score (e.g. 4.90), it will be featured across the website.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Star Rating (0.00 to 5.00)
                  </label>
                  <input
                    name="rating"
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    placeholder="0.00 (leave 0 to hide)"
                    value={form.rating}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Review Count
                  </label>
                  <input
                    name="review_count"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.review_count}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>
            </div>

            {/* Direct Unit Pictures Upload */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px dashed #D1D5DB',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <ImageIcon size={18} style={{ color: 'var(--color-primary-700)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                  Unit Pictures & Photos
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  (Upload files or paste image URLs)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Select Device Pictures (multiple allowed)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFormFilesChange}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                  {formFilePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {formFilePreviews.map((preview, idx) => (
                        <img
                          key={idx}
                          src={preview}
                          alt="Selected preview"
                          style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }}
                        />
                      ))}
                      <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                        ✓ {formFilePreviews.length} picture(s) selected
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Or External Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                    Paste a high-res image link from Unsplash or cloud storage.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', textTransform: 'none' }}>
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontWeight: 600, color: '#111827' }}>Active & Available for Public Booking</span>
              </label>
            </div>

            {error && (
              <div style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Sanctuary Changes' : 'Create Sanctuary'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {/* Sanctuary List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
          Loading sanctuaries…
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {cabins.map(c => (
            <div
              key={c.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <img
                  src={getImageUrl(c.primary_image || c.images?.[0]?.url)}
                  alt={c.name}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: '1px solid #E5E7EB',
                  }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-cabin.svg';
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                      {c.name}
                    </h3>
                    <span className={`badge ${c.unit_type === 'container' ? 'badge-container' : 'badge-capsule'}`}>
                      {c.unit_type === 'container' ? 'Container' : 'Capsule'}
                    </span>
                    {!c.is_active && (
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>
                        (Offline / Inactive)
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>
                      <strong>{formatKSh(c.price_per_night)}</strong> / night · Sleeps {c.max_guests} · {c.bedrooms} bed · {c.bathrooms} bath · {c.area_sqft || 320} sqft
                    </span>
                    {Number(c.rating) > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#B45309', fontWeight: 700, backgroundColor: '#FEF3C7', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                        <Star size={12} fill="currentColor" /> {Number(c.rating).toFixed(2)} ({c.review_count} reviews)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic', backgroundColor: '#F3F4F6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        No rating set (hidden publicly)
                      </span>
                    )}
                  </div>

                  {c.tagline && (
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.tagline}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openImageManager(c)}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: (!c.images || c.images.length === 0) ? '#FEF3C7' : '#FFFFFF',
                    borderColor: (!c.images || c.images.length === 0) ? '#F59E0B' : '#D1D5DB',
                    color: (!c.images || c.images.length === 0) ? '#92400E' : '#374151',
                    fontWeight: 600,
                  }}
                  title={(!c.images || c.images.length === 0) ? 'Unit currently has no photos. Click to add pictures.' : 'Manage gallery photos'}
                >
                  <ImageIcon size={15} />
                  {(!c.images || c.images.length === 0) ? 'Add Pictures (0)' : `Manage Pictures (${c.images.length})`}
                </button>

                <button
                  onClick={() => startEdit(c)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Edit2 size={15} /> Edit
                </button>

                <button
                  onClick={() => removeCabin(c.id)}
                  style={{
                    border: '1px solid #FEE2E2',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {cabins.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4.5rem 2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '2px dashed #E5E7EB',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏡</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>
                No Sanctuary Units Created Yet
              </h3>
              <p style={{ color: '#6B7280', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                No sanctuary units have been created yet. Use the "Add New Sanctuary" button above to publish container villas or capsule houses.
              </p>
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setShowForm(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} /> Add First Unit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Image Manager Modal */}
      {imageModalCabin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setImageModalCabin(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '780px',
              width: '100%',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
                  Pictures & Gallery: {imageModalCabin.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  Upload photos, set the primary banner image, and manage gallery snapshots.
                </div>
              </div>
              <button
                onClick={() => setImageModalCabin(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Upload Area */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px dashed #D1D5DB',
                marginBottom: '2rem',
                display: 'grid',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>
                  Upload New Unit Pictures
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Supported formats: JPG, PNG, WEBP (Single or Multiple)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Option 1: Upload From Computer / Device
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleModalFilesChange}
                    style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%' }}
                  />
                  {uploadPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {uploadPreviews.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt="preview"
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                        />
                      ))}
                      <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                        ✓ {uploadPreviews.length} picture(s) ready to upload
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Option 2: External Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  Photo Caption / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom, Sunset View from Balcony, Living Lounge"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={setAsPrimary}
                    onChange={e => setSetAsPrimary(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <span>Set as main Primary Hero photo for this unit</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  {imageMsg && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: imageMsg.startsWith('✅') ? '#059669' : '#DC2626' }}>
                      {imageMsg}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={uploading || (uploadFiles.length === 0 && !externalUrl.trim())}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                >
                  <Upload size={16} />
                  {uploading ? 'Adding Pictures…' : 'Upload Pictures to Unit'}
                </button>
              </div>
            </div>

            {/* Current Images Section */}
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: '#1F2937' }}>
                Current Unit Pictures ({imageModalCabin.images?.length || 0})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                The "Hero" image is displayed as the main banner across the website.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {(imageModalCabin.images || []).map(img => (
                <div
                  key={img.id}
                  style={{
                    borderRadius: '12px',
                    border: img.is_primary ? '2px solid var(--color-primary-700)' : '1px solid #E5E7EB',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <a href={getImageUrl(img.url)} target="_blank" rel="noopener noreferrer" title="Click to view full image in new tab">
                    <img
                      src={getImageUrl(img.url)}
                      alt={img.alt_text || 'Cabin photo'}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-cabin.svg';
                      }}
                    />
                  </a>

                  {img.is_primary && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: 'var(--color-primary-800)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      ★ Primary Hero
                    </div>
                  )}

                  {img.alt_text && (
                    <div style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #F3F4F6' }}>
                      {img.alt_text}
                    </div>
                  )}

                  <div style={{ padding: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
                    {!img.is_primary ? (
                      <button
                        onClick={() => setPrimaryImage(img.id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-primary-700)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Set as Hero
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>✓ Hero Photo</span>
                    )}

                    <button
                      onClick={() => deleteImage(img.id)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                      title="Delete Picture"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {(!imageModalCabin.images || imageModalCabin.images.length === 0) && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                  <div style={{ fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>No pictures uploaded yet</div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Select files or enter a URL above to add the first picture of this unit.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
