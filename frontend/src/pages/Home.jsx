import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, RefreshCw, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { productService, categoryService } from '../services/api';
import { formatInr } from '../utils/currency';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, newRes, catRes] = await Promise.all([
          productService.getProducts({ featured: true, gender: 'men', limit: 4 }),
          productService.getProducts({ newArrival: true, gender: 'men', limit: 4 }),
          categoryService.getCategories()
        ]);

        if (featRes.data.success) setFeaturedProducts(featRes.data.products);
        if (newRes.data.success) setNewArrivals(newRes.data.products);
        if (catRes.data.success) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Error fetching home content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="bg-xora-cream text-xora-charcoal min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-xora-sand">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="XORA men's fashion editorial"
            className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-[1.03]"
          />
          {/* Subtle warm luxury tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-xora-charcoal/60 via-xora-charcoal/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] font-medium text-xora-sand/90">
            MEN'S AUTUMN / WINTER COLLECTION
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.15em] uppercase leading-[1.1] text-xora-offwhite">
            MODERN MENSWEAR.
            <br />
            <span className="italic font-normal">MADE TO LAST.</span>
          </h1>
          <p className="text-sm sm:text-base text-xora-sand/90 max-w-xl mx-auto font-light leading-relaxed tracking-wide">
            Discover men's essentials designed for everyday confidence, with architectural tailoring in serene neutral palettes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/men"
              className="w-full sm:w-auto px-10 py-4 text-xs font-semibold uppercase tracking-luxury text-white bg-transparent border border-white hover:bg-white/10 active:scale-95 transition-all"
              id="hero-shop-men-btn"
            >
              SHOP MEN'S COLLECTION
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="border-y border-xora-taupe/20 bg-xora-offwhite py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Pure Natural Fibers</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Cashmere, silk, linen & fine wool</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Express Shipping</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Complimentary over {formatInr(200)}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Effortless Returns</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">30-day complimentary exchange window</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield className="w-5 h-5 text-xora-taupe-dark stroke-[1.5]" />
            <h4 className="text-xs uppercase tracking-widest font-semibold text-xora-charcoal">Atelier Tailoring</h4>
            <p className="text-[11px] text-xora-taupe-dark font-light">Uncompromising structural cut</p>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-xora-taupe/20">
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="bg-xora-sand/50 py-20 px-4 sm:px-6 lg:px-8 border-y border-xora-taupe/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">Collections</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-xora-charcoal tracking-wide mt-1">
              Shop by Category
            </h2>
            <p className="text-xs text-xora-taupe-dark mt-2 font-light">
              Elevate your daily ritual with pieces crafted from timeless natural materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Men's category cards */}
            <Link
              to="/shop?category=Tops%20%26%20Shirts"
              className="group relative aspect-[4/5] overflow-hidden bg-xora-taupe/20 rounded-xs block shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
                alt="Men's shirts collection"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-luxury text-xora-sand">Everyday essentials</span>
                <h3 className="font-serif text-2xl font-light tracking-wider">Shirts</h3>
                <span className="text-xs uppercase tracking-luxury underline underline-offset-4 mt-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>

            {/* Category Card 2: Men */}
            <Link
              to="/shop?category=Trousers"
              className="group relative aspect-[4/5] overflow-hidden bg-xora-taupe/20 rounded-xs block shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                alt="Men's tailored trousers"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-luxury text-xora-sand">Modern tailoring</span>
                <h3 className="font-serif text-2xl font-light tracking-wider">Trousers</h3>
                <span className="text-xs uppercase tracking-luxury underline underline-offset-4 mt-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>

            {/* Category Card 3: Outerwear */}
            <Link
              to="/shop?category=Outerwear"
              className="group relative aspect-[4/5] overflow-hidden bg-xora-taupe/20 rounded-xs block shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
                alt="Men's outerwear collection"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-luxury text-xora-sand">Investment</span>
                <h3 className="font-serif text-2xl font-light tracking-wider">Outerwear</h3>
                <span className="text-xs uppercase tracking-luxury underline underline-offset-4 mt-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>

            {/* Category Card 4: Knitwear */}
            <Link
              to="/shop?category=Knitwear"
              className="group relative aspect-[4/5] overflow-hidden bg-xora-taupe/20 rounded-xs block shadow-xs"
            >
              <img
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
                alt="Men's knitwear collection"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-luxury text-xora-sand">Cashmere & Wool</span>
                <h3 className="font-serif text-2xl font-light tracking-wider">Knitwear</h3>
                <span className="text-xs uppercase tracking-luxury underline underline-offset-4 mt-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FEATURED COLLECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-xora-taupe/20">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">Signature Releases</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-xora-charcoal tracking-wide mt-1">
              Featured Collection
            </h2>
          </div>
          <Link
            to="/shop?filter=featured"
            className="mt-4 sm:mt-0 inline-flex items-center text-xs uppercase tracking-luxury text-xora-charcoal hover:text-xora-taupe-dark transition-colors font-medium"
          >
            <span>Explore All Featured</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading signature pieces..." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. BRAND STORY / EDITORIAL BANNER */}
      <section className="relative py-28 bg-xora-offwhite border-t border-xora-taupe/30 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-luxury text-xora-taupe-dark font-medium">
              The XORA Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-xora-charcoal font-light leading-tight">
              Quiet Elegance.
              <br />
              <span className="italic font-normal">Intentional Craftsmanship.</span>
            </h2>
            <p className="text-sm text-xora-taupe-dark font-light leading-relaxed">
              XORA was born out of a desire for enduring simplicity. We believe in dressing as a meditative, effortless act. Every seam, cut, and hue is calculated to exist seamlessly across seasons.
            </p>
            <p className="text-sm text-xora-taupe-dark font-light leading-relaxed">
              By working strictly in warm whites, ecru, oatmeals, and muted taupes, we create garments that bring clarity to your wardrobe and poise to your presence.
            </p>
            <div className="pt-2">
              <Link to="/about" className="btn-luxury" id="brand-read-story-btn">
                DISCOVER OUR ATELIER
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-xora-sand rounded-xs overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"
                alt="XORA men's tailoring editorial"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
