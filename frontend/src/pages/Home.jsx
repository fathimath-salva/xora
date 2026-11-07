import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, RefreshCw, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { productService } from '../services/api';
import { PRODUCT_IMAGE_FALLBACK } from '../utils/productImage';
import CollectionSlider from '../components/CollectionSlider';
import NewsletterSignup from '../components/NewsletterSignup';
import HomepageCollection from '../components/HomepageCollection';

const SHOP_CATEGORIES = [
  { name: 'T-Shirts', image: '/images/yaqana-categories/t-shirt.jpeg' },
  { name: 'Hoodies', image: '/images/yaqana-categories/hoodie%20(1).jpeg' },
  { name: 'Shirts', image: '/images/yaqana-categories/shirt.jpeg' },
  { name: 'Trousers', image: '/images/yaqana-categories/trouser.jpeg' }
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeError, setHomeError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setHomeError('');
        const response = await productService.getProducts({ newArrival: true, gender: 'men', limit: 4 });
        if (!response.data?.success || !Array.isArray(response.data.products)) {
          throw new Error(response.data?.message || 'The product service returned an unexpected response.');
        }
        setNewArrivals(response.data.products);
      } catch (err) {
        console.error('Error fetching home content:', err);
        setHomeError('We could not load the latest styles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="bg-xora-cream text-xora-charcoal min-h-screen">
      {/* Homepage hero slideshow: introduction, Upperwear, and Trousers. */}
      <CollectionSlider />

      <NewsletterSignup placement="home" />

      {/* 3. NEW ARRIVALS */}
      <section className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-xora-taupe/20">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">Curated Essentials</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-xora-charcoal tracking-wide mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?filter=new"
            className="mt-4 sm:mt-0 inline-flex items-center text-xs uppercase tracking-luxury text-xora-charcoal hover:text-xora-taupe-dark transition-colors font-medium"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading new arrivals..." />
        ) : homeError && newArrivals.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-xora-taupe-dark">{homeError}</p>
        ) : newArrivals.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-xora-taupe-dark">No new arrivals are available right now.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="bg-xora-sand/50 py-12 sm:py-14 px-4 sm:px-6 lg:px-8 border-y border-xora-taupe/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">Collections</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-xora-charcoal tracking-wide mt-1">
              Shop by Category
            </h2>
            <p className="text-xs text-xora-taupe-dark mt-2 font-light">
              Elevate your daily ritual with pieces crafted from timeless natural materials.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SHOP_CATEGORIES.map(({ name, image }) => (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(name)}`}
                state={{ scrollToTop: true }}
                className="group relative aspect-[4/5] overflow-hidden bg-xora-taupe/20 rounded-xs block shadow-xs"
              >
                <img
                  src={image}
                  alt={`Men's ${name.toLowerCase()} collection`}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${name === 'T-Shirts' ? 'object-[32%_center]' : name === 'Hoodies' ? 'object-[78%_center]' : name === 'Shirts' ? 'object-[62%_center]' : 'object-[74%_center]'}`}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PRODUCT_IMAGE_FALLBACK; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wider">{name}</h3>
                  <span className="text-xs uppercase tracking-luxury underline underline-offset-4 mt-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomepageCollection />

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="border-y border-xora-taupe/20 bg-xora-offwhite py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Pure Natural Fibers</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Cashmere, silk, linen & fine wool</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Express Shipping</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Shipping terms pending approval</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Effortless Returns</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light"><Link to="/policies" className="underline underline-offset-2">14-day policy draft · pending approval</Link></p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Atelier Tailoring</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Uncompromising structural cut</p>
          </div>
        </div>
      </section>
    </div>
  );
}
