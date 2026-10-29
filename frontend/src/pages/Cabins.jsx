import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Users, Bed, Bath, Maximize, Star, ArrowRight, Filter, Check } from 'lucide-react';
import api from '../api';
import { formatKSh } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';

export default function Cabins() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from query params if present
  const [typeFilter, setTypeFilter] = useState(searchParams.get('unit_type') || '');
  const [guestsFilter, setGuestsFilter] = useState(searchParams.get('guests') || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (typeFilter) params.unit_type = typeFilter;
    if (guestsFilter) params.guests = guestsFilter;

    api.get('cabins/', { params })
      .then(res => setCabins(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [typeFilter, guestsFilter]);

  const resetFilters = () => {
    setTypeFilter('');
    setGuestsFilter('');
    setSortBy('recommended');
    setSearchQuery('');
    setSearchParams({});
  };

  // Local search query and sorting
  const filteredAndSortedCabins = cabins
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.tagline && c.tagline.toLowerCase().includes(q)) ||
        (c.amenities_list && c.amenities_list.some(a => a.toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price_per_night) - Number(b.price_per_night);
      if (sortBy === 'price-high') return Number(b.price_per_night) - Number(a.price_per_night);
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      return 0; // recommended order
    });

  return (
    <div style={{ backgroundColor: 'var(--color-sand-50)', minHeight: '80vh', padding: '4rem 0 6rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
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
            Secluded Stays
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', margin: '0 0 1rem' }}>
            Our Sanctuaries
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', lineHeight: 1.6, margin: 0 }}>
            Choose between our futuristic stargazing capsule houses and luxury upcycled shipping container villas.
          </p>
        </div>

        {/* Filter Controls Bar - only show when cabins exist */}
        {cabins.length > 0 && (
          <>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-sand-200)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '1.25rem',
                alignItems: 'flex-end',
              }}
            >
              {/* Keyword Search */}
              <div>
                <label>Search Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Hot Tub, Skylight, Sauna..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.65rem 0.85rem' }}
                />
              </div>

              {/* Unit Type */}
              <div>
                <label>Sanctuary Type</label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  style={{ padding: '0.65rem 0.85rem' }}
                >
                  <option value="">All Types (Any)</option>
                  <option value="capsule">Capsule Houses</option>
                  <option value="container">Container Units</option>
                </select>
              </div>

              {/* Guests */}
              <div>
                <label>Minimum Guests</label>
                <select
                  value={guestsFilter}
                  onChange={e => setGuestsFilter(e.target.value)}
                  style={{ padding: '0.65rem 0.85rem' }}
                >
                  <option value="">Any Capacity</option>
                  <option value="2">2+ Guests</option>
                  <option value="4">4+ Guests</option>
                  <option value="6">6 Guests</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label>Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ padding: '0.65rem 0.85rem' }}
                >
                  <option value="recommended">Featured / Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results Count & Reset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span>Showing <strong>{filteredAndSortedCabins.length}</strong> available sanctuaries</span>
              {(typeFilter || guestsFilter || searchQuery) && (
                <button
                  onClick={resetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-700)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Reset all filters
                </button>
              )}
            </div>
          </>
        )}

        {/* Units Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>
            Loading sanctuaries…
          </div>
        ) : cabins.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '4.5rem 2rem',
              textAlign: 'center',
              border: '1px solid var(--color-sand-200)',
              boxShadow: 'var(--shadow-sm)',
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

            <h2 style={{ fontSize: '2.1rem', color: 'var(--color-primary-950)', marginBottom: '1rem', fontWeight: 600 }}>
              Sanctuary Reservations Opening Soon
            </h2>

            <p style={{ color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Villula Cabins Resort is located in the scenic Eldoret landscape, Uasin Gishu County, Kenya.
              Our collection of luxury shipping container villas and 270° stargazing capsules will be open here for booking shortly.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                Contact For Pre-Launch Updates
              </Link>
              <Link to="/house-rules" className="btn btn-outline" style={{ padding: '0.85rem 2rem' }}>
                View Guest Guidelines
              </Link>
            </div>
          </div>
        ) : filteredAndSortedCabins.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px solid var(--color-sand-200)',
            }}
          >
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary-900)', fontWeight: 600, marginBottom: '0.5rem' }}>
              No sanctuaries match your selected criteria.
            </p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your guest capacity or sanctuary type filters.
            </p>
            <button onClick={resetFilters} className="btn btn-primary">
              View All Units
            </button>
          </div>
        ) : (
          <div className="sanctuaries-grid">
            {filteredAndSortedCabins.map(cabin => (
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
                {/* Image */}
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

                {/* Card Body */}
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
                    <Link to={`/cabins/${cabin.slug}`} style={{ color: 'inherit' }}>
                      {cabin.name}
                    </Link>
                  </h2>

                  {cabin.tagline && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
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
                      marginBottom: '1.25rem',
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

                  {/* Top Amenities Chips */}
                  {cabin.amenities_list && cabin.amenities_list.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {cabin.amenities_list.slice(0, 3).map((a, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--color-sand-100)',
                            color: 'var(--color-primary-800)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontWeight: 500,
                          }}
                        >
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing & CTA */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-sand-100)' }}>
                    <div>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>
                        {formatKSh(cabin.price_per_night)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}> / night</span>
                    </div>

                    <Link
                      to={`/cabins/${cabin.slug}${location.search}`}
                      className="btn btn-primary"
                    >
                      View & Book <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
