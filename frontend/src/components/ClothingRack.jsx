import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, LoaderCircle, X } from 'lucide-react';
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

function Hanger() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 62" className="rack-hanger">
      <path d="M60 17c-4-7-3-15 3-15s8 7 3 11l-3 4L10 54q-3 3 2 3h96q5 0 2-3L63 17Z" />
    </svg>
  );
}

function GarmentView({ product, view, colour, dyeKey, dyeing = false, isPlaceholder = false, onImageError }) {
  const images = getRackImages({ ...product, _selectedColour: colour });
  const source = images[view];
  const chosenColour = (product.colours || []).find((item) => getColourName(item) === colour);
  const canDye = product.isDemoOnly && !images.hasColourPhoto && view !== 'side';

  return (
    <span className={`rack-garment-art rack-garment-art--${view}`} key={`${view}-${colour}-${dyeKey}`}>
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
    </span>
  );
}

function ProductDetails({ product, initialColour, onColourChange, onClose, addToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColour, setSelectedColour] = useState(initialColour || getColourName(product.colours?.[0]) || '');
  const [view, setView] = useState('front');
  const [dyeKey, setDyeKey] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  const [fallbackViews, setFallbackViews] = useState({});
  const touchStart = useRef(null);
  const images = useMemo(() => getRackImages({ ...product, _selectedColour: selectedColour }), [product, selectedColour]);
  const sizes = product.sizes || [];
  const colours = product.colours || [];
  const hasStockData = product.stock != null && Number.isFinite(Number(product.stock));
  const soldOut = hasStockData && Number(product.stock) <= 0;
  const isDemo = product.isDemoOnly === true;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') setView((current) => current === 'front' ? 'back' : 'front');
      if (event.key === 'ArrowRight') setView((current) => current === 'front' ? 'back' : 'front');
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

  const switchView = () => setView((current) => current === 'front' ? 'back' : 'front');

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
    <div className="rack-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="rack-product-title" className="rack-product-modal">
        <button type="button" className="rack-modal-close" onClick={onClose} aria-label="Close product details">
          <X className="h-5 w-5" />
        </button>

        <div
          className="rack-modal-gallery"
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={(event) => {
            if (touchStart.current == null) return;
            if (Math.abs(event.changedTouches[0].clientX - touchStart.current) > 40) switchView();
            touchStart.current = null;
          }}
        >
          <button type="button" className="rack-modal-view-toggle" onClick={switchView} aria-label={`Show ${view === 'front' ? 'back' : 'front'} view`}>
            {view === 'front' ? 'Front view' : 'Back view'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rack-gallery-arrow rack-gallery-arrow--left" onClick={switchView} aria-label="Previous product view">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img
            key={`${view}-${selectedColour}-${dyeKey}`}
            src={imageForView(view)}
            alt={`${product.name}, ${view} view${fallbackViews[view] ? ' placeholder illustration' : ''}`}
            className="rack-modal-product-image"
            onError={() => setFallbackViews((current) => ({ ...current, [view]: true }))}
          />
          {(product.isDemoOnly || (!product.rackImages?.[view] && !product[`${view}Image`] && !(view === 'front' && product.images?.[0]))) && (
            <span className="rack-image-note">
              {product.isDemoOnly ? 'Illustrative placeholder image' : `${view[0].toUpperCase() + view.slice(1)} view placeholder`}
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
          <button type="button" className="rack-gallery-arrow rack-gallery-arrow--right" onClick={switchView} aria-label="Next product view">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="rack-view-dots" aria-label="Choose image view">
            {['front', 'back'].map((imageView) => (
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
            {added ? <><Check className="h-4 w-4" /> Added to bag</> : 'Add to bag'}
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
  const [activeProductId, setActiveProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [colourByProduct, setColourByProduct] = useState({});
  const [dyeingProductId, setDyeingProductId] = useState(null);
  const [dyeKeyByProduct, setDyeKeyByProduct] = useState({});
  const [failedRackImages, setFailedRackImages] = useState({});
  const rackRef = useRef(null);
  const rackScrollRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const { addToCart } = useCart();
  const activeProduct = products.find((product) => product._id === activeProductId);

  const handleCloseModal = () => setSelectedProduct(null);

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

  const scrollRack = (direction) => {
    if (!rackScrollRef.current) return;
    rackScrollRef.current.scrollBy({
      left: direction * rackScrollRef.current.clientWidth * 0.8,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

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
          Interactive sample display · Illustrative placeholder views · Demo prices/inventory only · No live checkout
        </p>
      )}
      <div className="rack-viewport" ref={rackRef} onPointerMove={handleRackPointerMove}>
        <div className="rack-rail">
          <span className="rack-rail-highlight" />
          <span className="rack-rail-support rack-rail-support--left" />
          <span className="rack-rail-support rack-rail-support--right" />
        </div>
        <button
          type="button"
          className="rack-carousel-arrow rack-carousel-arrow--left"
          onClick={() => scrollRack(-1)}
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
            const isActive = activeProductId === product._id;
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
                className={`rack-item${isActive ? ' is-active' : ''}`}
                style={{ '--rack-item-index': index }}
                aria-label={`View ${product.name}, ${formatInr(product.price)}`}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'touch') setActiveProductId(product._id);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== 'touch') setActiveProductId((current) => current === product._id ? null : current);
                }}
                onFocus={() => setActiveProductId(product._id)}
                onBlur={() => setActiveProductId((current) => current === product._id ? null : current)}
                onClick={() => {
                  setActiveProductId(product._id);
                  setSelectedProduct(product);
                }}
              >
                <span className="rack-hanging-unit">
                  <span className="rack-hanging-swing">
                    <span className="rack-hanger-wrap"><Hanger /></span>
                    <span className="rack-garment-stage">
                      <GarmentView
                        product={{ ...product, rackImages: images, _fallbackViews: failedRackImages[product._id] }}
                        view="side"
                        colour={selectedColour}
                        dyeKey={dyeKey}
                        isPlaceholder={!hasRackImage('side') || Boolean(failedRackImages[product._id]?.side)}
                        onImageError={(view) => handleProductImageError(product, view)}
                      />
                      <GarmentView
                        product={{ ...product, rackImages: images, _fallbackViews: failedRackImages[product._id] }}
                        view="front"
                        colour={selectedColour}
                        dyeKey={dyeKey}
                        dyeing={dyeingProductId === product._id}
                        isPlaceholder={!hasRackImage('front') || Boolean(failedRackImages[product._id]?.front)}
                        onImageError={(view) => handleProductImageError(product, view)}
                      />
                    </span>
                  </span>
                </span>
                <span className="rack-item-name">{product.name}</span>
                <span className="rack-item-price">{formatInr(product.price)}</span>
                {product.isDemoOnly && <span className="rack-item-demo">Demo</span>}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="rack-carousel-arrow rack-carousel-arrow--right"
          onClick={() => scrollRack(1)}
          aria-label="Show more garments"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="rack-scroll-hint" aria-hidden="true"><ArrowLeft className="h-3.5 w-3.5" /> Drag to explore <ArrowRight className="h-3.5 w-3.5" /></div>
      </div>
      <p className="rack-instructions">Select a garment to explore its details</p>
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
      {activeProduct && (
        <div className="rack-active-caption" aria-live="polite">
          {activeProduct.name} <span>·</span> {formatInr(activeProduct.price)}
        </div>
      )}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          initialColour={colourByProduct[selectedProduct._id]}
          onColourChange={(colour) => {
            setColourByProduct((current) => ({ ...current, [selectedProduct._id]: colour }));
            setDyeingProductId(selectedProduct._id);
            setDyeKeyByProduct((current) => ({ ...current, [selectedProduct._id]: (current[selectedProduct._id] || 0) + 1 }));
          }}
          onClose={handleCloseModal}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}
