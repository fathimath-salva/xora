import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, RefreshCw, Truck } from 'lucide-react';
import { PRODUCT_IMAGE_FALLBACK } from '../utils/productImage';
import CollectionSlider from '../components/CollectionSlider';
import NewsletterSignup from '../components/NewsletterSignup';
import HomepageCollection from '../components/HomepageCollection';
import HomepageNewArrivalsRack from '../components/HomepageNewArrivalsRack';

const SHOP_CATEGORIES = [
  { name: 'T-Shirts', image: '/images/yaqana-categories/t-shirt.jpeg' },
  { name: 'Hoodies', image: '/images/yaqana-categories/hoodie%20(1).jpeg' },
  { name: 'Shirts', image: '/images/yaqana-categories/shirt.jpeg' },
  { name: 'Trousers', image: '/images/yaqana-categories/trouser.jpeg' }
];

export default function Home() {
  return (
    <div className="bg-xora-cream text-xora-charcoal min-h-screen">
      {/* Homepage hero slideshow: introduction, Upperwear, and Trousers. */}
      <CollectionSlider />

      <NewsletterSignup placement="home" />

      {/* Product Categories */}
      <section className="bg-xora-sand/50 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-y border-xora-taupe/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-left max-w-2xl mb-8">
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

      {/* New Arrivals interactive rack */}
      <HomepageNewArrivalsRack />

      {/* Standard product collection remains separate from the rack. */}
      <HomepageCollection />

      {/* Four benefits */}
      <section aria-label="Four benefits" className="border-y border-xora-taupe/20 bg-xora-offwhite py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Pure Natural Fibers</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Cashmere, silk, linen & fine wool</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Shipping Information</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Details pending business confirmation</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Returns Policy</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light"><Link to="/policies" className="underline underline-offset-2">Draft pending business approval</Link></p>
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
