import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

/**
 * AnalyticsTracker listens to React Router route changes
 * and sends GA4 page_view events on every navigation,
 * ensuring single-page application (SPA) drop-off and visit counts work accurately.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    // Small timeout ensures document.title has updated on route change
    const timeout = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 50);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return null;
}
