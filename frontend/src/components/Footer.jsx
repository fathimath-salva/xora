export default function Footer() {
  return (
<<<<<<< Updated upstream
    <footer className="bg-xora-sand/60 border-t border-xora-taupe/30 pt-10 pb-8 text-xora-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand statement */}
        {pathname !== '/subscribe' && pathname !== '/' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-xora-taupe/30">
            <div className="space-y-4 lg:col-span-5">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.2em] font-light uppercase text-xora-charcoal">
                YAQANA
              </h2>
              <p className="text-sm text-xora-taupe-dark max-w-sm leading-relaxed font-light">
                Elevated menswear shaped by architectural tailoring, serene neutral tones, and uncompromising fabric integrity.
              </p>
              <SocialLinks className="pt-2" />
            </div>

            {pathname !== '/login' && (
              <div className="lg:col-span-7">
                <NewsletterSignup />
              </div>
            )}
          </div>
        )}

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-xora-taupe/30 text-xs">
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
        <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[11px] text-xora-taupe-dark tracking-wide">
          <p>© {new Date().getFullYear()} YAQANA Fashion House Ltd. All rights reserved.</p>
          <nav aria-label="Social and contact links" className="flex items-center gap-1 self-center sm:self-auto">
            <a
              href="https://www.instagram.com/yaqana_apparel/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @yaqana_apparel"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:text-xora-charcoal transition-colors"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="mailto:apparelyaqana@gmail.com"
              aria-label="Email YAQANA"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:text-xora-charcoal transition-colors"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              to="/contact"
              aria-label="Contact YAQANA"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:text-xora-charcoal transition-colors"
            >
              <ContactRound aria-hidden="true" className="h-4 w-4" />
            </Link>
          </nav>
          <p className="mt-2 sm:mt-0 font-light">
            Modern essentials. Timeless confidence.
          </p>
        </div>
=======
    <footer className="border-t border-xora-taupe/30 bg-xora-sand/60 py-6 text-center text-xora-charcoal sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-serif text-xl font-light uppercase tracking-[0.2em]">YAQANA</p>
        <p className="mt-1 text-xs font-light text-xora-taupe-dark">Modern essentials. Timeless confidence.</p>
        <p className="mt-4 text-[11px] tracking-wide text-xora-taupe-dark">© 2026 YAQANA. All rights reserved.</p>
>>>>>>> Stashed changes
      </div>
    </footer>
  );
}
