import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { formatInr } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { demoRackProducts } from '../data/demoRackProducts';
import './ClothingRack.css';

const categoryPlaceholder = (category, view) => {
  const product = demoRackProducts.find((item) => item.category === category) || demoRackProducts[0];
  return product.rackImages[view];
};

const getRackImages = (product) => {
  const views = product.rackImages || {};
  const colourImages = product.colourImages || {};
  const selectedColourImages = colourImages[product._selectedColour] || {};
  const fallbacks = product._fallbackViews || {};
  const side = fallbacks.side ? categoryPlaceholder(product.category, 'side') : selectedColourImages.side || views.side || product.sideImage || categoryPlaceholder(product.category, 'side');
  const front = fallbacks.front ? categoryPlaceholder(product.category, 'front') : selectedColourImages.front || views.front || product.frontImage || product.images?.[0] || categoryPlaceholder(product.category, 'front');
  const back = fallbacks.back ? categoryPlaceholder(product.category, 'back') : selectedColourImages.back || views.back || product.backImage || categoryPlaceholder(product.category, 'back');
  return { side, front, back, hasColourPhoto: Boolean(selectedColourImages.front) };
};

const getColourName = (colour) => typeof colour === 'string' ? colour : colour?.name;
const getColourHex = (colour) => typeof colour === 'string' ? '#b7aa98' : colour?.hex || '#b7aa98';
const PRODUCT_VIEWS = ['front', 'back', 'side'];
const cycleProductView = (currentView, direction) => {
  const currentIndex = PRODUCT_VIEWS.indexOf(currentView);
  return PRODUCT_VIEWS[(currentIndex + direction + PRODUCT_VIEWS.length) % PRODUCT_VIEWS.length];
};

function GarmentAttachment() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 30" className="rack-attachment">
      <path d="M8 0v15c0 3 4 4 4 7 0 3-2 5-5 5H5" />
    </svg>
  );
}

function GarmentView({ product, view, colour, dyeKey, dyeing = false, isPlaceholder = false, onImageError, price }) {
  const images = getRackImages({ ...product, _selectedColour: colour });
  const source = images[view];
  const chosenColour = (product.colours || []).find((item) => getColourName(item) === colour);
  const canDye = product.isDemoOnly && !images.hasColourPhoto && view !== 'side';

  return (
    <span className={`rack-garment-art rack-garment-art--${view}`} key={`${view}-${colour}-${dyeKey}`}>
      <span className="rack-attachment-wrap"><GarmentAttachment /></span>
      <img
        className={`rack-garment-image rack-garment-image--${view}`}
        src={source}
        alt={`${product.name}, ${view} view`}
        loading={view === 'side' ? 'eager' : 'lazy'}
        draggable="false"
        onError={() => onImageError?.(view)}
      />
      {canDye && (
        <span
          aria-hidden="true"
          className={`rack-dye-overlay${dyeing ? ' rack-dye-overlay--rising' : ''}`}
          style={{
            '--rack-dye-colour': getColourHex(chosenColour),
            '--rack-mask-image': `url("${source}")`
          }}
        />
      )}
      {isPlaceholder && <span className="rack-garment-placeholder">{view} view placeholder</span>}
      <span className="rack-price-tag" aria-hidden="true">{formatInr(price)}</span>
    </span>
  );
}

function ProductDetails({ product, initialColour, presentationOrigin, onColourChange, onClose, addToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColour, setSelectedColour] = useState(initialColour || getColourName(product.colours?.[0]) || '');
  const [view, setView] = useState('front');
  const [dyeKey, setDyeKey] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  const [fallbackViews, setFallbackViews] = useState({});
  const [flightTransforms, setFlightTransforms] = useState(null);
  const touchStart = useRef(null);
  const imageRef = useRef(null);
  const attachmentRef = useRef(null);
  const priceTagRef = useRef(null);
  const images = useMemo(() => getRackImages({ ...product, _selectedColour: selectedColour }), [product, selectedColour]);
  const sizes = product.sizes || [];
  const colours = product.colours || [];
  const hasStockData = product.stock != null && Number.isFinite(Number(product.stock));
  const soldOut = hasStockData && Number(product.stock) <= 0;
  const isDemo = product.isDemoOnly === true;

  useLayoutEffect(() => {
    if (!presentationOrigin) return undefined;
    const getTransform = (origin, target) => {
      if (!origin || !target || !target.width || !target.height) return null;
      return `translate3d(${origin.left - target.left}px, ${origin.top - target.top}px, 0) scale(${origin.width / target.width}, ${origin.height / target.height})`;
    };
    const rectOf = (element) => {
      if (!element) return null;
      const { left, top, width, height } = element.getBoundingClientRect();
      return { left, top, width, height };
    };
    const transforms = {
      garment: getTransform(presentationOrigin.garment, rectOf(imageRef.current)),
      attachment: getTransform(presentationOrigin.attachment, rectOf(attachmentRef.current)),
      tag: getTransform(presentationOrigin.tag, rectOf(priceTagRef.current))
    };
    if (!transforms.garment) return undefined;
    setFlightTransforms(transforms);
    const timer = window.setTimeout(() => setFlightTransforms(null), 760);
    return () => window.clearTimeout(timer);
  }, [presentationOrigin, product._id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') setView((current) => cycleProductView(current, -1));
      if (event.key === 'ArrowRight') setView((current) => cycleProductView(current, 1));
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const chooseColour = (colour) => {
    const name = getColourName(colour);
    if (name !== selectedColour) {
      setSelectedColour(name);
      setDyeKey((key) => key + 1);
      setAdded(false);
      onColourChange(name);
    }
  };

  const switchView = (direction = 1) => setView((current) => cycleProductView(current, direction));

  const handleAdd = async () => {
    setCartError('');
    const result = await addToCart(product, selectedSize, selectedColour, 1);
    if (!result?.success) {
      setCartError(result?.message || 'Could not add this item to the bag.');
      return;
    }
    setAdded(true);
  };

  const imageForView = (currentView) => (
    fallbackViews[currentView]
      ? categoryPlaceholder(product.category, currentView)
      : images[currentView]
  );

  return (
    <div className="rack-product-presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="rack-product-title" className="rack-product-modal rack-product-presentation-panel">
        <button type="button" className="rack-modal-close" onClick={onClose} aria-label="Back to front-facing rack view">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div
          className="rack-modal-gallery"
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={(event) => {
            if (touchStart.current == null) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 40) switchView(delta < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <button type="button" className="rack-modal-view-toggle" onClick={() => switchView()} aria-label={`Show ${cycleProductView(view, 1)} view`}>
            {view[0].toUpperCase() + view.slice(1)} view
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rack-gallery-arrow rack-gallery-arrow--left" onClick={() => switchView(-1)} aria-label="Previous product view">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="rack-modal-hanging-display">
            <span className="rack-modal-rail" aria-hidden="true" />
            <span
              ref={attachmentRef}
              className={`rack-modal-attachment${flightTransforms?.attachment ? ' rack-flight-element rack-flight-attachment' : ''}`}
              style={flightTransforms?.attachment ? { '--rack-flight-from': flightTransforms.attachment } : undefined}
              aria-hidden="true"
            ><GarmentAttachment /></span>
            <img
              ref={imageRef}
              key={`${view}-${selectedColour}-${dyeKey}`}
              src={imageForView(view)}
              alt={`${product.name}, ${view} view${fallbackViews[view] ? ' placeholder illustration' : ''}`}
              className={`rack-modal-product-image${flightTransforms?.garment ? ' rack-flight-element rack-flight-garment' : ''}`}
              style={flightTransforms?.garment ? { '--rack-flight-from': flightTransforms.garment } : undefined}
              onError={() => setFallbackViews((current) => ({ ...current, [view]: true }))}
            />
            <span
              ref={priceTagRef}
              className={`rack-price-tag rack-price-tag--modal${flightTransforms?.tag ? ' rack-flight-element rack-flight-tag' : ''}`}
              style={flightTransforms?.tag ? { '--rack-flight-from': flightTransforms.tag } : undefined}
              aria-hidden="true"
            >
              {formatInr(product.discountPrice || product.price)}
            </span>
          {(product.isDemoOnly || (!product.rackImages?.[view] && !product[`${view}Image`] && !(view === 'front' && product.images?.[0]))) && (
            <span className="rack-image-note">
              {product.isDemoOnly ? 'AI-generated demo garment view' : `${view[0].toUpperCase() + view.slice(1)} view placeholder`}
            </span>
          )}
          {isDemo && view === 'front' && (
            <span
              aria-hidden="true"
              className={`rack-dye-overlay rack-dye-overlay--modal${dyeKey ? ' rack-dye-overlay--rising' : ''}`}
              style={{
                '--rack-dye-colour': getColourHex(colours.find((item) => getColourName(item) === selectedColour)),
                '--rack-mask-image': `url("${imageForView(view)}")`
              }}
            />
          )}
          </div>
          <button type="button" className="rack-gallery-arrow rack-gallery-arrow--right" onClick={() => switchView(1)} aria-label="Next product view">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="rack-view-dots" aria-label="Choose image view">
            {PRODUCT_VIEWS.map((imageView) => (
              <button
                key={imageView}
                type="button"
                onClick={() => setView(imageView)}
                aria-label={`Show ${imageView} view`}
                aria-pressed={view === imageView}
                className={view === imageView ? 'is-active' : ''}
              />
            ))}
          </div>
        </div>

        <div className="rack-product-info">
          <p className="rack-eyebrow">{product.category || 'Menswear'}{isDemo ? ' · DEMO ITEM' : ''}</p>
          <h2 id="rack-product-title">{product.name}</h2>
          <p className="rack-product-price">{formatInr(product.discountPrice || product.price)}</p>
          <p className="rack-product-description">{product.description || product.shortDescription || 'Product details have not been provided.'}</p>
          <dl className="rack-product-specs">
            <div><dt>Fabric</dt><dd>{product.fabric || 'To be confirmed'}</dd></div>
            <div><dt>Fit</dt><dd>{product.fit || 'To be confirmed'}</dd></div>
          </dl>

          <div className="rack-choice-group">
            <p>Colour <span>{selectedColour}</span></p>
            <div className="rack-colour-options">
              {colours.map((colour) => {
                const name = getColourName(colour);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => chooseColour(colour)}
                    aria-label={`Select ${name} colour`}
                    aria-pressed={selectedColour === name}
                    title={name}
                    className={selectedColour === name ? 'is-selected' : ''}
                  >
                    <span style={{ backgroundColor: getColourHex(colour) }} />
                  </button>
                );
              })}
            </div>
            {isDemo && !product.colourImages?.[selectedColour] && (
              <p className="rack-helper-text">Demo colour preview; replace with colour-specific photography when available.</p>
            )}
          </div>

          <div className="rack-choice-group">
            <p>Size <span>{selectedSize}</span></p>
            <div className="rack-size-options">
              {sizes.map((size) => (
                <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={selectedSize === size ? 'is-selected' : ''}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <p className={`rack-stock${soldOut ? ' rack-stock--sold-out' : ''}`}>
            {soldOut
              ? 'Currently unavailable'
              : isDemo
                ? product.demoStockStatus
                : hasStockData
                  ? 'In stock'
                  : 'Availability not provided'}
          </p>

          <button type="button" onClick={handleAdd} disabled={soldOut || !hasStockData || !selectedSize} className="rack-add-button">
            {added ? <><Check className="h-4 w-4" /> Added to cart</> : 'Add to Cart'}
          </button>
          {cartError && <p role="alert" className="rack-cart-error">{cartError}</p>}
          {isDemo && <p className="rack-helper-text">Sample item only. It stays in your local bag and cannot be checked out.</p>}
          {!isDemo && colours.length === 0 && <p className="rack-helper-text">Colour choices have not been provided.</p>}
        </div>
      </section>
    </div>
  );
}

export default function ClothingRack({
  products = demoRackProducts,
  demoMode = products.every((product) => product.isDemoOnly),
  hasMore = false,
  loadingMore = false,
  error = '',
  onNearEnd,
  onRetry
}) {
  const [interactionStage, setInteractionStage] = useState('rackSideView');
  const [activeProductId, setActiveProductId] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [pinnedFrontProductId, setPinnedFrontProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [presentationOrigin, setPresentationOrigin] = useState(null);
  const [colourByProduct, setColourByProduct] = useState({});
  const [dyeingProductId, setDyeingProductId] = useState(null);
  const [dyeKeyByProduct, setDyeKeyByProduct] = useState({});
  const [failedRackImages, setFailedRackImages] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rackRef = useRef(null);
  const rackScrollRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const { addToCart } = useCart();

  const returnToFrontView = useCallback(() => {
    setInteractionStage('rackFrontView');
    setPinnedFrontProductId(selectedProduct?._id || null);
  }, [selectedProduct]);
  const returnToSideView = useCallback(() => {
    setInteractionStage('rackSideView');
    setActiveProductId(null);
    setHoveredProductId(null);
    setPinnedFrontProductId(null);
  }, []);

  useEffect(() => {
    if (!pinnedFrontProductId || interactionStage !== 'rackFrontView') return undefined;
    const clearFrontAfterMouseLeaves = (event) => {
      if (event.pointerType !== 'mouse') return;
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const rackItem = element?.closest('.rack-item');
      if (rackItem?.dataset.productId !== pinnedFrontProductId) {
        setPinnedFrontProductId(null);
        setHoveredProductId(rackItem?.dataset.productId || null);
      }
    };
    const clearFrontOnTouchOutside = (event) => {
      if (event.target?.closest?.('.rack-item')) return;
      setInteractionStage('rackSideView');
      setActiveProductId(null);
      setHoveredProductId(null);
      setPinnedFrontProductId(null);
    };
    window.addEventListener('pointermove', clearFrontAfterMouseLeaves);
    const hasCoarsePointer = window.matchMedia?.('(hover: none), (pointer: coarse)').matches
      || (navigator.maxTouchPoints || 0) > 0;
    if (hasCoarsePointer) window.addEventListener('click', clearFrontOnTouchOutside);
    return () => {
      window.removeEventListener('pointermove', clearFrontAfterMouseLeaves);
      window.removeEventListener('click', clearFrontOnTouchOutside);
    };
  }, [interactionStage, pinnedFrontProductId]);

  const capturePresentationOrigin = (rackItem) => {
    const readRect = (element) => {
      if (!element) return null;
      const { left, top, width, height } = element.getBoundingClientRect();
      return { left, top, width, height };
    };
    setPresentationOrigin({
      garment: readRect(rackItem.querySelector('.rack-garment-art--front .rack-garment-image')),
      attachment: readRect(rackItem.querySelector('.rack-garment-art--front .rack-attachment-wrap')),
      tag: readRect(rackItem.querySelector('.rack-garment-art--front .rack-price-tag'))
    });
  };

  useEffect(() => {
    if (!dyeingProductId) return undefined;
    const timer = window.setTimeout(() => setDyeingProductId(null), 800);
    return () => window.clearTimeout(timer);
  }, [dyeingProductId, dyeKeyByProduct]);

  const handleRackPointerMove = (event) => {
    if (event.pointerType === 'touch' || !rackRef.current) return;
    const rect = rackRef.current.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    rackRef.current.style.setProperty('--rack-pointer-position', String(Math.max(0, Math.min(1, position))));
  };

  const handleProductImageError = (product, view) => {
    setFailedRackImages((current) => ({
      ...current,
      [product._id]: { ...current[product._id], [view]: true }
    }));
  };

  const handleRackPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      didDrag: false
    };
  };

  const handleRackPointerMoveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.didDrag && Math.abs(delta) > 6) {
      drag.didDrag = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.didDrag) {
      event.preventDefault();
      event.currentTarget.classList.add('is-dragging');
      event.currentTarget.scrollLeft = drag.startScrollLeft - delta;
    }
  };

  const handleRackPointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove('is-dragging');
    dragRef.current = null;
    if (drag.didDrag) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
  };

  const updateRackNavigation = useCallback(() => {
    const track = rackScrollRef.current;
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 1);
    setCanScrollRight(hasMore || maxScrollLeft > 1 && track.scrollLeft < maxScrollLeft - 1);
  }, [hasMore]);

  const scrollRack = (direction) => {
    const track = rackScrollRef.current;
    if (!track || (direction < 0 && !canScrollLeft) || (direction > 0 && !canScrollRight)) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    if (direction > 0 && atEnd && hasMore) {
      onNearEnd?.();
      return;
    }
    const itemWidth = track.querySelector('.rack-item')?.getBoundingClientRect().width || track.clientWidth * 0.2;
    track.scrollBy({
      left: direction * itemWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

  useEffect(() => {
    const track = rackScrollRef.current;
    if (!track) return undefined;
    updateRackNavigation();
    window.addEventListener('resize', updateRackNavigation);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateRackNavigation);
    resizeObserver?.observe(track);
    return () => {
      window.removeEventListener('resize', updateRackNavigation);
      resizeObserver?.disconnect();
    };
  }, [products.length, updateRackNavigation]);

  useEffect(() => {
    const track = rackScrollRef.current;
    if (hasMore && track && track.scrollWidth <= track.clientWidth + 1) {
      onNearEnd?.();
    }
  }, [products.length, hasMore, onNearEnd]);

  return (
    <div className="clothing-rack-experience">
      {demoMode && (
        <p className="rack-demo-notice" role="note">
          Interactive sample display · AI-generated garment views · Demo prices/inventory only · No live checkout
        </p>
      )}
      {interactionStage === 'rackFrontView' && (
        <div className="rack-stage-back-row">
          <button type="button" className="rack-stage-back" onClick={returnToSideView}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to side view
          </button>
        </div>
      )}
      <div className="rack-viewport" ref={rackRef} onPointerMove={handleRackPointerMove}>
        <div className="rack-rail">
          <span className="rack-rail-highlight" />
        </div>
        <button
          type="button"
          className="rack-carousel-arrow rack-carousel-arrow--left"
          onClick={() => scrollRack(-1)}
          disabled={!canScrollLeft}
          aria-label="Show previous garments"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          className="rack-scroll"
          ref={rackScrollRef}
          aria-label="Clothing on the collection rack"
          onScroll={(event) => {
            const element = event.currentTarget;
            updateRackNavigation();
            if (hasMore && element.scrollLeft + element.clientWidth >= element.scrollWidth - element.clientWidth * 0.4) {
              onNearEnd?.();
            }
          }}
          onPointerDown={handleRackPointerDown}
          onPointerMove={handleRackPointerMoveDrag}
          onPointerUp={handleRackPointerUp}
          onPointerCancel={handleRackPointerUp}
          onClickCapture={(event) => {
            if (suppressClickRef.current) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          {products.map((product, index) => {
            const selectedColour = colourByProduct[product._id] || getColourName(product.colours?.[0]) || '';
            const images = getRackImages({
              ...product,
              _selectedColour: selectedColour,
              _fallbackViews: failedRackImages[product._id]
            });
            const isFrontFacing = hoveredProductId === product._id || pinnedFrontProductId === product._id;
            const dyeKey = dyeKeyByProduct[product._id] || 0;
            const colourImages = product.colourImages?.[selectedColour] || {};
            const hasRackImage = (view) => Boolean(
              colourImages[view] ||
              product.rackImages?.[view] ||
              product[`${view}Image`] ||
              (view === 'front' && product.images?.[0])
            );
            return (
              <button
                key={product._id}
                type="button"
                className={`rack-item${isFrontFacing ? ' is-active' : ''}`}
                style={{ '--rack-item-index': index }}
                data-product-id={product._id}
                aria-label={`View ${product.name}, ${formatInr(product.price)}`}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'touch') return;
                  setHoveredProductId(product._id);
                  setPinnedFrontProductId((current) => current === product._id ? current : null);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'touch') return;
                  setHoveredProductId((current) => current === product._id ? null : current);
                  setPinnedFrontProductId((current) => current === product._id ? null : current);
                }}
                onClick={(event) => {
                  const secondClickOnSelected = interactionStage === 'rackFrontView' && activeProductId === product._id;
                  setActiveProductId(product._id);
                  setSelectedProduct(product);
                  if (secondClickOnSelected) {
                    capturePresentationOrigin(event.currentTarget);
                    setPinnedFrontProductId(product._id);
                    setInteractionStage('productPresentation');
                  } else {
                    setPinnedFrontProductId(product._id);
                    setInteractionStage('rackFrontView');
                  }
                }}
              >
                <span className="rack-hanging-unit">
                  <span className="rack-hanging-swing">
                    <span className="rack-garment-stage">
                      <GarmentView
                        product={{ ...product, rackImages: images, _fallbackViews: failedRackImages[product._id] }}
                        view="side"
                        colour={selectedColour}
                        dyeKey={dyeKey}
                        isPlaceholder={!hasRackImage('side') || Boolean(failedRackImages[product._id]?.side)}
                        onImageError={(view) => handleProductImageError(product, view)}
                        price={product.discountPrice || product.price}
                      />
                      <GarmentView
                        product={{ ...product, rackImages: images, _fallbackViews: failedRackImages[product._id] }}
                        view="front"
                        colour={selectedColour}
                        dyeKey={dyeKey}
                        dyeing={dyeingProductId === product._id}
                        isPlaceholder={!hasRackImage('front') || Boolean(failedRackImages[product._id]?.front)}
                        onImageError={(view) => handleProductImageError(product, view)}
                        price={product.discountPrice || product.price}
                      />
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="rack-carousel-arrow rack-carousel-arrow--right"
          onClick={() => scrollRack(1)}
          disabled={!canScrollRight}
          aria-label="Show more garments"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {loadingMore && (
        <p className="rack-pagination-status" role="status">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Loading more garments...
        </p>
      )}
      {error && (
        <p className="rack-pagination-error" role="status">
          {error}
          <button type="button" onClick={onRetry}>Try again</button>
        </p>
      )}
      {selectedProduct && interactionStage === 'productPresentation' && (
        <ProductDetails
          product={selectedProduct}
          initialColour={colourByProduct[selectedProduct._id]}
          presentationOrigin={presentationOrigin}
          onColourChange={(colour) => {
            setColourByProduct((current) => ({ ...current, [selectedProduct._id]: colour }));
            setDyeingProductId(selectedProduct._id);
            setDyeKeyByProduct((current) => ({ ...current, [selectedProduct._id]: (current[selectedProduct._id] || 0) + 1 }));
          }}
          onClose={returnToFrontView}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}
