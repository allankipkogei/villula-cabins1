/**
 * Google Analytics 4 (GA4) Integration & Funnel Drop-off Tracking
 * Villula Cabins Resort
 */

// Fallback or environment variable measurement ID
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  (typeof window !== 'undefined' && window.__GA_MEASUREMENT_ID__) ||
  'G-XXXXXXXXXX';

/**
 * Initializes GA4 gtag.js script if not already present
 */
export const initGA = (measurementId = GA_MEASUREMENT_ID) => {
  if (typeof window === 'undefined') return;
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    // If not configured with a real ID yet, log helpful dev message once
    if (!window.__ga_warned__) {
      console.info(
        `[GA4] Google Analytics ready. Set VITE_GA_MEASUREMENT_ID in frontend/.env to start sending live data to your GA4 property.`
      );
      window.__ga_warned__ = true;
    }
  }

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  // Only inject script tag once
  const existingScript = document.getElementById('ga4-script');
  if (!existingScript && measurementId && measurementId !== 'G-XXXXXXXXXX') {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We handle page views manually for React SPA routing
    });
  }
};

/**
 * Track Page Views on every route transition (Home, Units, Detail, Contact, etc.)
 */
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  } catch (err) {
    console.debug('[GA4] Pageview tracking notice:', err);
  }
};

/**
 * Generic GA4 Event Tracker
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', eventName, params);
    console.debug(`[GA4 Event] ${eventName}:`, params);
  } catch (err) {
    console.debug('[GA4] Event tracking notice:', err);
  }
};

/**
 * Funnel Step 1: Catalog View (User browses sanctuaries)
 */
export const trackViewItemList = (items = []) => {
  trackEvent('view_item_list', {
    item_list_name: 'Sanctuaries Catalog',
    items: items.map((c, i) => ({
      item_id: String(c.id),
      item_name: c.name,
      item_category: c.unit_type || 'sanctuary',
      price: Number(c.price_per_night) || 0,
      index: i + 1,
    })),
  });
};

/**
 * Funnel Step 2: Sanctuary Inspection (User views single cabin details)
 */
export const trackViewItem = (cabin) => {
  if (!cabin) return;
  trackEvent('view_item', {
    currency: 'KES',
    value: Number(cabin.price_per_night) || 0,
    items: [
      {
        item_id: String(cabin.id),
        item_name: cabin.name,
        item_category: cabin.unit_type || 'sanctuary',
        price: Number(cabin.price_per_night) || 0,
        currency: 'KES',
      },
    ],
  });
};

/**
 * Funnel Step 3: Reservation Initiated (User begins booking modal / selected dates)
 */
export const trackBeginCheckout = (cabin, nights = 1, guests = 1, total = 0) => {
  if (!cabin) return;
  trackEvent('begin_checkout', {
    currency: 'KES',
    value: Number(total) || (Number(cabin.price_per_night) || 0) * nights,
    items: [
      {
        item_id: String(cabin.id),
        item_name: cabin.name,
        item_category: cabin.unit_type || 'sanctuary',
        price: Number(cabin.price_per_night) || 0,
        quantity: nights,
      },
    ],
    number_of_guests: guests,
    number_of_nights: nights,
  });
};

/**
 * Funnel Step 4: Reservation Completed (Booking submitted / confirmed)
 */
export const trackPurchase = (booking, cabin) => {
  if (!booking) return;
  trackEvent('purchase', {
    transaction_id: `VIL-${booking.id}`,
    currency: 'KES',
    value: Number(booking.total_price) || 0,
    items: [
      {
        item_id: String(booking.cabin || cabin?.id || ''),
        item_name: cabin?.name || 'Sanctuary Reservation',
        item_category: cabin?.unit_type || 'sanctuary',
        price: Number(booking.total_price) || 0,
      },
    ],
  });
};

/**
 * Contact Form Submitted
 */
export const trackContactSubmit = (subject = '') => {
  trackEvent('generate_lead', {
    lead_type: 'contact_form',
    subject: subject,
  });
};
