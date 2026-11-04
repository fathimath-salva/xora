import { useState } from 'react';

export default function SubscriptionPage() {
  const [unavailable, setUnavailable] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setUnavailable(true);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-xora-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="border border-xora-taupe/30 bg-xora-offwhite p-6 sm:p-8">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">
            YAQANA Newsletter
          </span>
          <h1 className="mt-2 font-serif text-3xl text-xora-charcoal">
            JOIN THE YAQANA COMMUNITY
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-xora-taupe-dark">
            Be the first to discover new collections, exclusive offers and updates.
          </p>

          {unavailable && (
            <div
              className="mt-5 rounded-xs border border-xora-taupe/40 bg-xora-cream px-3 py-3 text-sm text-xora-charcoal"
              role="alert"
            >
              Newsletter subscriptions are not available yet. Your details have not been saved.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="subscription-name"
                className="mb-1 block text-[11px] font-medium uppercase tracking-luxury text-xora-charcoal"
              >
                Full Name
              </label>
              <input
                id="subscription-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:border-xora-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="subscription-email"
                className="mb-1 block text-[11px] font-medium uppercase tracking-luxury text-xora-charcoal"
              >
                Email Address
              </label>
              <input
                id="subscription-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:border-xora-charcoal focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-luxury w-full py-3.5 text-[10px]">
              Subscribe
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-xora-taupe-dark">
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
