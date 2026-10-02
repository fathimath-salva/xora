import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-xora-cream text-xora-charcoal min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">About XORA</span>
            <h1 className="font-serif text-4xl sm:text-5xl mt-2 tracking-wide">Modern essentials. Timeless confidence.</h1>
            <p className="mt-6 text-sm text-xora-taupe-dark leading-relaxed">
              XORA was founded on the belief that refined dressing should feel effortless, calm, and intentional. We design climate-conscious essentials for everyday life — silhouettes that transition seamlessly from work to weekend, city to coast, and quiet morning to evening plans.
            </p>
            <p className="mt-4 text-sm text-xora-taupe-dark leading-relaxed">
              Our collections centre on natural fibers, sharp tailoring, warm neutrals, and understated details that keep each piece relevant season after season.
            </p>
            <Link to="/shop" className="btn-luxury mt-6 inline-flex items-center">
              Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xs">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
              alt="XORA atelier"
              className="w-full h-[480px] object-cover"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['Crafted for daily rituals', 'We create pieces that move with your routines, blending structure and softness for elevated comfort.'],
            ['Quiet luxury, made visible', 'Our palette is intentionally warm and grounded — beige, cream, taupe, charcoal, and soft stone.'],
            ['Conscious by design', 'We source natural, durable fabrics and work with mindful manufacturing partners across our supply chain.']
          ].map(([title, copy]) => (
            <div key={title} className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
              <h3 className="font-serif text-2xl text-xora-charcoal">{title}</h3>
              <p className="mt-3 text-sm text-xora-taupe-dark leading-relaxed">{copy}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
