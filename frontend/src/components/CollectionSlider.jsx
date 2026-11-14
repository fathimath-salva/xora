import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_IMAGE_FALLBACK } from '../utils/productImage';
import { ArrowRight } from 'lucide-react';
import { firstOrderOffer } from '../config/storefront';

const SLIDES = [
  {
    name: 'YAQANA introduction',
    image: '/images/yaqana-home-slides/discount%20slide.jpg',
    mobileImage: '/images/yaqana-home-slides/discount-campaign-mobile.jpg',
    tabletImage: '/images/yaqana-home-slides/discount-campaign-tablet.jpg',
    desktopImage: '/images/yaqana-home-slides/discount-campaign-wide.jpg',
    alt: 'A man wearing YAQANA menswear against a warm neutral backdrop',
    headline: firstOrderOffer.checkoutConfigured ? `${firstOrderOffer.percentage}% OFF` : 'YAQANA',
    subheading: firstOrderOffer.checkoutConfigured ? 'ON YOUR FIRST ORDER' : 'CONSIDERED MENSWEAR',
    action: { label: 'SHOP NOW', to: '/shop' }
  },
  {
    name: 'Upperwear',
    image: '/images/yaqana-home-slides/upperwear%20slide.jpg',
    mobileImage: '/images/yaqana-home-slides/upperwear-campaign-mobile.jpg',
    tabletImage: '/images/yaqana-home-slides/upperwear-campaign-tablet.jpg',
    desktopImage: '/images/yaqana-home-slides/upperwear-campaign-wide.jpg',
    alt: 'Three male models wearing a T-shirt, shirt and hoodie',
    headline: 'UPPERWEAR',
    description: 'T-shirts, shirts & hoodies.',
    action: { label: 'EXPLORE UPPERWEAR', to: '/shop' }
  },
  {
    name: 'Trousers',
    image: '/images/yaqana-home-slides/trousers%20slide.jpg',
    mobileImage: '/images/yaqana-home-slides/trousers-campaign-mobile.jpg',
    tabletImage: '/images/yaqana-home-slides/trousers-campaign-tablet.jpg',
    desktopImage: '/images/yaqana-home-slides/trousers-campaign-wide.jpg',
    alt: 'A male model wearing brown trousers',
    headline: 'TROUSERS',
    description: 'Refined fits. Everyday essentials.',
    action: { label: 'EXPLORE TROUSERS', to: '/shop?category=Trousers' }
  }
];

const SLIDE_IMAGES = SLIDES.flatMap(({ image, mobileImage, tabletImage, desktopImage }) => [
  image,
  mobileImage,
  tabletImage,
  desktopImage
]);

export default function CollectionSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [loadedImages, setLoadedImages] = useState(() => new Set());
  const [imagesReady, setImagesReady] = useState(false);
  const touchStart = useRef(null);
  const activeSlide = SLIDES[activeIndex];
  const showSlide = (index) => {
    const nextIndex = (index + SLIDES.length) % SLIDES.length;
    const nextSlide = SLIDES[nextIndex];
    const nextSlideImages = [
      nextSlide.image,
      nextSlide.mobileImage,
      nextSlide.tabletImage,
      nextSlide.desktopImage
    ];

    if (nextSlideImages.every((image) => loadedImages.has(image))) {
      setActiveIndex(nextIndex);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loaded = new Set();
    let completed = 0;

    SLIDE_IMAGES.forEach((source) => {
      const image = new Image();
      image.onload = () => {
        loaded.add(source);
        completed += 1;
        if (!cancelled) {
          setLoadedImages(new Set(loaded));
          if (completed === SLIDE_IMAGES.length) setImagesReady(true);
        }
      };
      image.onerror = () => {
        completed += 1;
        console.error(`Unable to preload slideshow image: ${source}`);
      };
      image.src = source;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const updateAutoplay = () => {
      setAutoplayEnabled(
        imagesReady && !motionQuery?.matches && document.visibilityState === 'visible'
      );
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
  }, [imagesReady]);

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
      className="xora-campaign relative isolate w-full overflow-hidden touch-pan-y bg-[#eee7da] lg:aspect-video lg:min-h-0"
      data-slide={activeIndex}
      role="region"
      aria-roledescription="carousel"
      aria-label="YAQANA menswear campaign"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={handleTouchEnd}
    >
      {SLIDES.map((slide, index) => (
        <picture
          key={slide.name}
          className="xora-campaign-image"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            zIndex: index === activeIndex ? 1 : 0
          }}
          aria-hidden="true"
        >
          <source media="(min-width: 1024px)" srcSet={slide.desktopImage} />
          <source media="(min-width: 640px)" srcSet={slide.tabletImage} />
          <source media="(max-width: 639px)" srcSet={slide.mobileImage} />
          <img
            src={slide.image}
            alt=""
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
            }}
          />
        </picture>
      ))}

      <div className="xora-campaign-content">
        <div key={activeSlide.name} className="xora-collection-slide">
          {activeIndex === 0 ? (
            <>
              <h1 className="xora-campaign-headline xora-campaign-offer">
                {activeSlide.headline}
              </h1>
              <p className="xora-campaign-subheading">{activeSlide.subheading}</p>
              <Link to={activeSlide.action.to} state={{ scrollToTop: true }} className="xora-campaign-action">
                {activeSlide.action.label}
                <ArrowRight className="ml-2 h-3.5 w-3.5 flex-shrink-0" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="xora-campaign-headline">{activeSlide.headline}</h2>
              <p className="xora-campaign-description">{activeSlide.description}</p>
              <Link to={activeSlide.action.to} state={{ scrollToTop: true }} className="xora-campaign-action">
                {activeSlide.action.label}
                <ArrowRight className="ml-2 h-3.5 w-3.5 flex-shrink-0" />
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="xora-campaign-indicators absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7" aria-label="Choose slide">
        {SLIDES.map((slide, index) => (
          <button key={slide.name} type="button" onClick={() => showSlide(index)} aria-label={`Show slide ${index + 1}: ${slide.name}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${index === activeIndex ? 'w-8 bg-[#292820]' : 'w-3 bg-[#292820]/40 hover:bg-[#292820]/70'}`} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Slide {activeIndex + 1} of {SLIDES.length}: {activeSlide.name}</p>
    </section>
  );
}
