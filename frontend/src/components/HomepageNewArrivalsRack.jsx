import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';

const PAGE_SIZE = 8;

export default function HomepageNewArrivalsRack() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const trackRef = useRef(null);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const seenRef = useRef(new Set());
  const cancelledRef = useRef(false);

  const loadPage = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setLoading(true);
    setError('');
    const requestedPage = pageRef.current;
    try {
      const { data } = await productService.getProducts({ newArrival: true, page: requestedPage, limit: PAGE_SIZE, sort: 'newest' });
      if (!data?.success || !Array.isArray(data.products)) throw new Error(data?.message || 'Unexpected product response.');
      if (cancelledRef.current) return;
      const fresh = data.products.filter((product) => product?._id && !seenRef.current.has(product._id));
      fresh.forEach((product) => seenRef.current.add(product._id));
      setProducts((current) => [...current, ...fresh]);
      pageRef.current = requestedPage + 1;
      const totalPages = Number(data.totalPages);
      setHasMore(Number.isInteger(totalPages) ? requestedPage < totalPages : data.products.length === PAGE_SIZE);
    } catch (requestError) {
      if (!cancelledRef.current) setError(requestError.response?.data?.message || 'We could not load New Arrivals. Please try again.');
    } finally {
      busyRef.current = false;
      if (!cancelledRef.current) setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    cancelledRef.current = false;
    loadPage();
    return () => { cancelledRef.current = true; };
  }, [loadPage]);

  const move = (direction) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  };
  const maybeLoadMore = () => {
    const track = trackRef.current;
    if (track && hasMore && !busyRef.current && track.scrollLeft + track.clientWidth >= track.scrollWidth - 250) loadPage();
  };

  return (
    <section className="border-y border-xora-taupe/25 bg-xora-offwhite/50 py-10 sm:py-14" aria-labelledby="homepage-arrivals-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between border-b border-xora-taupe/20 pb-4">
          <h2 id="homepage-arrivals-title" className="font-serif text-3xl tracking-wide text-xora-charcoal sm:text-4xl">New Arrivals</h2>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => move(-1)} aria-label="Scroll New Arrivals left" className="rounded-full border border-xora-taupe/40 p-2 text-xora-charcoal hover:border-xora-charcoal"><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Scroll New Arrivals right" className="rounded-full border border-xora-taupe/40 p-2 text-xora-charcoal hover:border-xora-charcoal"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
        {products.length > 0 && <div ref={trackRef} onScroll={maybeLoadMore} className="grid grid-flow-col auto-cols-[minmax(68%,1fr)] grid-rows-1 gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[minmax(34%,1fr)] lg:auto-cols-[minmax(22%,1fr)]">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>}
        {loading && <div className="flex items-center justify-center gap-2 py-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading New Arrivals…</div>}
        {error && <div className="py-5 text-center text-sm text-xora-taupe-dark" role="alert">{error} <button type="button" onClick={loadPage} className="underline">Retry</button></div>}
        {!loading && !error && products.length === 0 && <p className="py-8 text-center text-sm text-xora-taupe-dark">No new arrivals right now.</p>}
      </div>
    </section>
  );
}
