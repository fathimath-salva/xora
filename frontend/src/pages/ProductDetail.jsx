import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { productService } from '../services/api';
import { formatInr } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedImage(prod.images?.[0] || '');
          setSelectedSize(prod.sizes?.[0] || 'M');
          setSelectedColour(prod.colours?.[0]?.name || 'Default');
          setRelatedProducts(res.data.relatedProducts || []);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Curating garment specifications..." />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl text-xora-charcoal mb-4">Product Not Found</h2>
        <p className="text-xs text-xora-taupe-dark mb-6">
          The requested garment might have concluded its seasonal run.
        </p>
        <Link to="/shop" className="btn-luxury">
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColour, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-luxury text-xora-taupe-dark mb-8">
          <Link to="/" className="hover:text-xora-charcoal">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-xora-charcoal">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-xora-charcoal">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-xora-charcoal font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Images */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 flex-shrink-0 rounded-xs overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-xora-charcoal scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Large Preview */}
            <div className="flex-1 aspect-[3/4] bg-xora-sand/50 rounded-xs overflow-hidden shadow-xs relative">
              <img
                src={selectedImage || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discountPrice && (
                <span className="absolute top-4 left-4 bg-xora-charcoal text-white text-xs uppercase tracking-widest px-3 py-1 font-medium">
                  Privilege Sale
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Garment Information & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <span className="text-xs uppercase tracking-luxury text-xora-taupe-dark font-medium">
                {product.category} • {product.gender}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl text-xora-charcoal tracking-wide mt-1 font-light">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mt-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl sm:text-2xl font-semibold text-xora-charcoal">
                      {formatInr(product.discountPrice)}
                    </span>
                    <span className="text-sm text-xora-taupe-dark line-through">
                      {formatInr(product.price)}
                    </span>
                    <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      Save {formatInr(product.price - product.discountPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl font-semibold text-xora-charcoal">
                    {formatInr(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-xora-taupe-dark leading-relaxed font-light">
              {product.description}
            </p>

            {/* Colour Selector */}
            {product.colours && product.colours.length > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium uppercase tracking-wider text-xora-charcoal">
                    Colour: <strong className="font-semibold">{selectedColour}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {product.colours.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColour(col.name)}
                      className={`group relative p-1 rounded-full border-2 transition-all ${
                        selectedColour === col.name ? 'border-xora-charcoal' : 'border-transparent'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="block w-6 h-6 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: col.hex || '#C4B5A5' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium uppercase tracking-wider text-xora-charcoal">
                    Size: <strong className="font-semibold">{selectedSize}</strong>
                  </span>
                  <button type="button" className="text-xora-taupe-dark underline hover:text-xora-charcoal">
                    Sizing Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-3 text-xs font-medium uppercase tracking-wider border rounded-xs transition-all ${
                        selectedSize === sz
                          ? 'border-xora-charcoal bg-xora-charcoal text-white shadow-xs'
                          : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="text-xs">
              {isOutOfStock ? (
                <span className="text-red-700 font-medium">Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="text-amber-800 font-medium">Only {product.stock} items remaining in atelier</span>
              ) : (
                <span className="text-emerald-800 font-medium">In Stock • Ready for dispatch</span>
              )}
            </div>

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-3 pt-2">
              <div className="flex space-x-3">
                {/* Quantity */}
                <div className="flex items-center border border-xora-taupe/40 bg-white px-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1 text-xora-charcoal hover:text-black disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold px-4 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-1 text-xora-charcoal hover:text-black disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                  id="add-to-cart-detail-btn"
                >
                  {addedNotice ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>ADDED TO BAG</span>
                    </span>
                  ) : isOutOfStock ? (
                    'OUT OF STOCK'
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO SHOPPING BAG</span>
                    </span>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border rounded-xs transition-colors flex items-center justify-center ${
                    isFavorited
                      ? 'border-xora-charcoal bg-xora-charcoal text-white'
                      : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'
                  }`}
                  aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                  id="product-wishlist-detail-btn"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : 'stroke-[1.5]'}`} />
                </button>
              </div>
            </div>

            {/* Accordion / Tabs */}
            <div className="border-t border-xora-taupe/20 pt-6 space-y-4">
              <div className="flex border-b border-xora-taupe/20 text-xs uppercase tracking-luxury">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'border-b-2 border-xora-charcoal text-xora-charcoal font-semibold'
                      : 'text-xora-taupe-dark hover:text-xora-charcoal'
                  }`}
                >
                  Craft & Composition
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fit')}
                  className={`ml-6 pb-2.5 font-medium transition-colors ${
                    activeTab === 'fit'
                      ? 'border-b-2 border-xora-charcoal text-xora-charcoal font-semibold'
                      : 'text-xora-taupe-dark hover:text-xora-charcoal'
                  }`}
                >
                  Sizing & Fit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`ml-6 pb-2.5 font-medium transition-colors ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-xora-charcoal text-xora-charcoal font-semibold'
                      : 'text-xora-taupe-dark hover:text-xora-charcoal'
                  }`}
                >
                  Delivery & Returns
                </button>
              </div>

              <div className="text-xs text-xora-taupe-dark leading-relaxed font-light pt-2">
                {activeTab === 'details' && (
                  <p>{product.fabricDetails || '100% Organic certified natural fiber blend. Woven in Biella, Italy.'}</p>
                )}
                {activeTab === 'fit' && (
                  <p>{product.fitDetails || 'Cut with architectural ease. True to size tailoring with clean shoulder drape.'}</p>
                )}
                {activeTab === 'shipping' && (
                  <p>{product.shippingDetails || `Complimentary express courier delivery on orders above ${formatInr(200)}. 30-day effortless return privilege.`}</p>
                )}
              </div>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-xora-taupe/20 text-[11px] text-xora-taupe-dark">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Express Dispatch</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Authentic Atelier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-12 border-t border-xora-taupe/20">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
                Harmonious Pairings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-xora-charcoal tracking-wide mt-1">
                Complete The Silhouette
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
