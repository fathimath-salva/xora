import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NewsletterSignup({ placement = 'footer' }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading || isAuthenticated) return null;

  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-6 gap-y-3 bg-xora-charcoal px-4 py-4 sm:px-6 sm:py-5 border border-xora-gold/70 text-left shadow-sm">
      <div className="min-w-0">
        <h3 className="font-serif text-[10px] sm:text-xs tracking-[0.16em] text-xora-gold">
          A LITTLE SOMETHING FOR YOU
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-xora-offwhite/80 leading-relaxed font-light">
          Subscribe to YAQANA and enjoy your first order.
        </p>
      </div>

      <div className="col-span-1 flex flex-wrap items-center justify-between gap-3 lg:contents">
        <p className="font-serif font-bold text-3xl sm:text-5xl tracking-wide text-xora-offwhite whitespace-nowrap leading-none">
          10% OFF
        </p>
        <Link
          to="/subscribe"
          className="inline-flex shrink-0 items-center justify-center justify-self-end border border-xora-gold bg-xora-gold px-3 py-2.5 text-[9px] sm:px-5 sm:py-3 text-center text-xora-charcoal font-semibold tracking-[0.12em] whitespace-nowrap transition-colors hover:bg-xora-offwhite hover:border-xora-offwhite"
          id="newsletter-subscribe-btn"
        >
          SUBSCRIBE NOW
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );

  if (placement === 'home') {
    return (
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-xora-sand/50">
        <div className="max-w-5xl mx-auto">{content}</div>
      </section>
    );
  }

  return content;
}
