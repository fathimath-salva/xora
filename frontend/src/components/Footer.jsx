import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Mail, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-xora-sand/60 border-t border-xora-taupe/30 pt-16 pb-12 text-xora-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-xora-taupe/30">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.2em] font-light uppercase text-xora-charcoal">
              YAQANA
            </h2>
            <p className="text-sm text-xora-taupe-dark max-w-sm leading-relaxed font-light">
              Elevated menswear shaped by architectural tailoring, serene neutral tones, and uncompromising fabric integrity.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#instagram"
                className="w-9 h-9 rounded-full border border-xora-taupe/50 flex items-center justify-center text-xora-charcoal hover:bg-xora-charcoal hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                className="w-9 h-9 rounded-full border border-xora-taupe/50 flex items-center justify-center text-xora-charcoal hover:bg-xora-charcoal hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                className="w-9 h-9 rounded-full border border-xora-taupe/50 flex items-center justify-center text-xora-charcoal hover:bg-xora-charcoal hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-xora-offwhite p-6 sm:p-8 rounded-xs border border-xora-taupe/20 text-center">
              <h3 className="font-serif text-xl sm:text-2xl text-xora-charcoal tracking-[0.12em]">
                A LITTLE SOMETHING FOR YOU
              </h3>
              <p className="mt-4 text-sm sm:text-base text-xora-taupe-dark leading-relaxed font-light">
                Subscribe to YAQANA and enjoy
              </p>
              <p className="my-1 font-serif text-4xl sm:text-5xl tracking-wide text-xora-charcoal">
                10% OFF
              </p>
              <p className="text-sm sm:text-base text-xora-taupe-dark leading-relaxed font-light">
                your first order.
              </p>
              <p className="max-w-xl mx-auto mt-4 mb-6 text-xs sm:text-sm text-xora-taupe-dark leading-relaxed font-light">
                Join our community and be the first to discover new collections, exclusive offers and updates.
              </p>

              <Link
                to="/subscribe"
                className="btn-luxury whitespace-nowrap"
                id="newsletter-subscribe-btn"
              >
                SUBSCRIBE NOW
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-xora-taupe/30 text-xs">
          <div>
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/shop" state={{ scrollToTop: true }} className="hover:text-xora-charcoal transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="hover:text-xora-charcoal transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/shop?category=T-Shirts" state={{ scrollToTop: true }} className="hover:text-xora-charcoal transition-colors">T-Shirts</Link>
              </li>
              <li>
                <Link to="/shop?category=Hoodies" state={{ scrollToTop: true }} className="hover:text-xora-charcoal transition-colors">Hoodies</Link>
              </li>
              <li>
                <Link to="/shop?category=Shirts" state={{ scrollToTop: true }} className="hover:text-xora-charcoal transition-colors">Shirts</Link>
              </li>
              <li>
                <Link to="/shop?category=Trousers" state={{ scrollToTop: true }} className="hover:text-xora-charcoal transition-colors">Trousers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Client Services</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Shipping &amp; Delivery</Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-xora-charcoal transition-colors">Returns &amp; Exchanges</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Garment Care &amp; Fabric</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Bespoke Inquiries</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Company</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">About YAQANA</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">Our Atelier &amp; Craft</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">Sustainable Sourcing</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">Careers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Legal &amp; Privacy</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-xora-charcoal transition-colors">Store Policies</Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-xora-charcoal transition-colors">Returns Policy</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-xora-gold transition-colors font-medium">Atelier Portal (Admin)</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-xora-taupe-dark tracking-wide">
          <p>© {new Date().getFullYear()} YAQANA Fashion House Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-light">
            Modern essentials. Timeless confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}
