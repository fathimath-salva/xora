import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_IMAGE_FALLBACK } from '../utils/productImage';
import { CAMPAIGN_IMAGES, firstOrderOffer } from '../config/storefront';

const SLIDES = [
  {
    name: 'XORA introduction',
    image: CAMPAIGN_IMAGES.hero,
    imagePosition: 'object-[78%_top] sm:object-[78%_top] lg:object-center',
    alt: 'A man wearing XORA menswear against a warm neutral backdrop',
    title: 'MODERN MENSWEAR, MADE TO LAST',
    description: `${firstOrderOffer.percentage}% EXTRA OFF YOUR FIRST ORDER`,
    disclosure: 'Offer is not configured at checkout and will not be applied to your order.',
    action: { label: 'SHOP NOW', to: '/shop' }
  },
  {
    name: 'Upperwear',
    image: CAMPAIGN_IMAGES.trousers,
    imagePosition: 'object-[80%_top] sm:object-[80%_top] lg:object-center',
    alt: 'Two men wearing a cream T-shirt and sage hoodie',
    description: 'Essential T-shirts, refined shirts and everyday hoodies.',
    links: [
      { label: 'T-Shirts', category: 'T-Shirts' },
      { label: 'Shirts', category: 'Shirts' },
      { label: 'Hoodies', category: 'Hoodies' }
    ]
  },
  {
    name: 'Trousers',
    image: CAMPAIGN_IMAGES.upperwear,
    imagePosition: 'object-[68%_top] sm:object-[68%_top] lg:object-center',
    alt: 'A man wearing tailored charcoal trousers in a warm stone setting',
    description: 'Considered fits. Timeless everyday essentials.',
    links: [{ label: 'EXPLORE TROUSERS', category: 'Trousers' }]
  }
];

export default function CollectionSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const touchStart = useRef(null);
  const activeSlide = SLIDES[activeIndex];
  const showSlide = (index) => setActiveIndex((index + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const motionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const updateAutoplay = () => {
      setAutoplayEnabled(!motionQuery?.matches && document.visibilityState === 'visible');
    };

    updateAutoplay();
    document.addEventListener('visibilitychange', updateAutoplay);
    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener('change', updateAutoplay);
    } else {
      motionQuery?.addListener(updateAutoplay);
    }

    return () => {
      document.removeEventListener('visibilitychange', updateAutoplay);
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener('change', updateAutoplay);
      } else {
        motionQuery?.removeListener(updateAutoplay);
      }
    };
  }, []);

  useEffect(() => {
    if (!autoplayEnabled) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [autoplayEnabled]);

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    touchStart.current = null;
  };

  return (
    <section
      className="relative isolate w-full min-h-[32rem] overflow-hidden touch-pan-y bg-[#eee7da] sm:min-h-[75vh] lg:aspect-video lg:min-h-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="XORA menswear campaign"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={activeSlide.name}
        src={activeSlide.image}
        alt=""
        aria-hidden="true"
        fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
        className={`absolute inset-0 h-full w-full object-cover ${activeSlide.imagePosition}`}
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PRODUCT_IMAGE_FALLBACK; }}
      />

      <div className="relative z-10 flex min-h-[32rem] items-center px-6 py-16 sm:min-h-[75vh] sm:px-12 lg:min-h-0 lg:h-full lg:px-20 xl:px-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[min(70vw,48rem)] bg-gradient-to-r from-[#eee7da]/72 via-[#eee7da]/42 to-transparent sm:w-[min(68vw,56rem)]" aria-hidden="true" />
        <div key={activeSlide.name} className="xora-collection-slide relative w-full max-w-[70%] sm:max-w-2xl">
          {activeIndex === 0 ? (
            <>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#686553] mb-4">XORA MENSWEAR</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[0.08em] leading-[1.08] text-[#292820]">
                MODERN MENSWEAR,
                <span className="block italic font-normal">MADE TO LAST</span>
              </h1>
              <p className="mt-6 text-sm sm:text-base uppercase tracking-[0.16em] text-[#38372e]">{activeSlide.description}</p>
              <p className="mt-2 max-w-md text-[10px] sm:text-xs leading-relaxed text-[#575449]">{activeSlide.disclosure}</p>
              <Link to={activeSlide.action.to} state={{ scrollToTop: true }} className="mt-7 inline-flex min-h-12 items-center justify-center border border-[#292820] bg-[#292820] px-9 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-transparent hover:text-[#292820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                {activeSlide.action.label}
              </Link>
            </>
          ) : (
            <>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#686553] mb-4">The XORA edit</p>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[0.1em] uppercase leading-[1.08] text-[#292820]">{activeSlide.name}</h2>
              <p className="mt-5 max-w-md text-sm sm:text-base leading-relaxed text-[#38372e]">{activeSlide.description}</p>
              <div className="mt-7 flex max-w-lg flex-wrap gap-2 sm:gap-3" aria-label={`${activeSlide.name} categories`}>
                {activeSlide.links.map(({ label, category }) => (
                  <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`} state={{ scrollToTop: true }} className="inline-flex min-h-11 items-center justify-center border border-[#514f43]/70 bg-white/35 px-4 sm:px-5 py-2 text-[10px] uppercase tracking-[0.16em] text-[#292820] transition-colors hover:bg-[#292820] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7" aria-label="Choose slide">
        {SLIDES.map((slide, index) => (
          <button key={slide.name} type="button" onClick={() => showSlide(index)} aria-label={`Show slide ${index + 1}: ${slide.name}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${index === activeIndex ? 'w-8 bg-[#292820]' : 'w-3 bg-[#292820]/40 hover:bg-[#292820]/70'}`} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Slide {activeIndex + 1} of {SLIDES.length}: {activeSlide.name}</p>
    </section>
  );
}
