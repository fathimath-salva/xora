import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const getShopView = (location) => {
  const params = new URLSearchParams(location.search);
  return {
    category: params.get('category') || '',
    collection: params.get('collection') || ''
  };
};

const scrollInstantlyTo = (top) => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = previousBehavior;
};

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const previousLocation = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const savePosition = () => positions.current.set(location.key, window.scrollY);
    window.addEventListener('scroll', savePosition, { passive: true });
    return () => {
      savePosition();
      window.removeEventListener('scroll', savePosition);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    if (!initialized.current) {
      initialized.current = true;
      previousLocation.current = location;
      positions.current.set(location.key, window.scrollY);
      return;
    }

    positions.current.set(previous.key, window.scrollY);
    previousLocation.current = location;

    if (navigationType === 'POP') {
      scrollInstantlyTo(positions.current.get(location.key) ?? 0);
      return;
    }

    const routeChanged = previous.pathname !== location.pathname;
    const shopViewChanged = previous.pathname === '/shop' && location.pathname === '/shop' && (
      getShopView(previous).category !== getShopView(location).category ||
      getShopView(previous).collection !== getShopView(location).collection
    );

    if (routeChanged || shopViewChanged || location.state?.scrollToTop) {
      scrollInstantlyTo(0);
      positions.current.set(location.key, 0);
    }
  }, [location, navigationType]);

  return null;
}
