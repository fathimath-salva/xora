import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-xora-cream min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">Customer care</span>
            <h1 className="font-serif text-4xl sm:text-5xl mt-2">We’re here to help.</h1>
            <p className="mt-4 text-sm text-xora-taupe-dark leading-relaxed">
              Whether you need styling support, order updates, or garment care guidance, our concierge team is ready to assist.
            </p>

            <div className="mt-8 space-y-4 text-sm text-xora-charcoal">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-xora-charcoal" />
                <a href="mailto:apparelyaqana@gmail.com" className="hover:text-xora-taupe-dark transition-colors">
                  apparelyaqana@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 text-xora-charcoal" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                </svg>
                <a
                  href="https://www.instagram.com/yaqana_apparel/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-xora-taupe-dark transition-colors"
                >
                  @yaqana_apparel
                </a>
              </div>
            </div>
          </div>

          <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 sm:p-8 rounded-xs">
            {submitted ? (
              <div className="text-center py-10">
                <h2 className="font-serif text-3xl text-xora-charcoal">Message sent.</h2>
                <p className="mt-3 text-sm text-xora-taupe-dark">
                  Our concierge team will be in touch within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Name</label>
                  <input type="text" required className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Email</label>
                  <input type="email" required className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Message</label>
                  <textarea rows="5" required className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal resize-none" />
                </div>
                <button type="submit" className="btn-luxury w-full py-3 text-[10px]">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
