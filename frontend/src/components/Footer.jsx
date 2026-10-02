import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe, Mail, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-xora-sand/60 border-t border-xora-taupe/30 pt-16 pb-12 text-xora-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-xora-taupe/30">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.2em] font-light uppercase text-xora-charcoal">
              XORA
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
            <div className="bg-xora-offwhite p-6 sm:p-8 rounded-xs border border-xora-taupe/20">
              <h3 className="font-serif text-xl sm:text-2xl text-xora-charcoal tracking-wide">
                Join the XORA Society
              </h3>
              <p className="text-xs text-xora-taupe-dark mt-1 mb-4 leading-relaxed font-light">
                Receive private seasonal previews, archival access, and 10% privilege on your debut collection order.
              </p>

              {subscribed ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Thank you. Your personal welcome invitation has been dispatched.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 bg-white border border-xora-taupe/40 px-4 py-3 text-xs focus:outline-none focus:border-xora-charcoal font-sans"
                    id="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="btn-luxury whitespace-nowrap"
                    id="newsletter-subscribe-btn"
                  >
                    Subscribe
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-xora-taupe/30 text-xs">
          <div>
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/men" className="hover:text-xora-charcoal transition-colors">Men's Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=Tops%20%26%20Shirts" className="hover:text-xora-charcoal transition-colors">Shirts</Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-xora-charcoal transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-xora-charcoal transition-colors">Best Sellers</Link>
              </li>
              <li>
                <Link to="/shop?category=Outerwear" className="hover:text-xora-charcoal transition-colors">Outerwear & Coats</Link>
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
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Complimentary Returns</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Garment Care & Fabric</Link>
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
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">About XORA</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-xora-charcoal transition-colors">Our Atelier & Craft</Link>
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
            <h4 className="font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-xora-taupe-dark">
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-xora-charcoal transition-colors">Cookie Preferences</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-xora-gold transition-colors font-medium">Atelier Portal (Admin)</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-xora-taupe-dark tracking-wide">
          <p>© {new Date().getFullYear()} XORA Fashion House Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-light">
            Modern essentials. Timeless confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}
