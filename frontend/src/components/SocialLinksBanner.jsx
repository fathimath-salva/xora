import { Mail } from 'lucide-react';

const socialLinks = [
  {
    label: '@yaqana_apparel',
    href: 'https://www.instagram.com/yaqana_apparel/?utm_source=chatgpt.com',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
    external: true
  },
  {
    label: 'Email',
    href: 'mailto:apparelyaqana@gmail.com',
    icon: <Mail className="h-4 w-4" />,
    external: false
  }
];

export function SocialLinks({ className = '' }) {
  return (
    <nav aria-label="YAQANA social links" className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
      {socialLinks.map(({ label, href, icon, external }) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="inline-flex items-center gap-2 border-b border-xora-gold/60 pb-1 text-xs sm:text-sm text-xora-offwhite hover:text-xora-gold transition-colors"
          aria-label={label === '@yaqana_apparel' ? 'Instagram @yaqana_apparel' : label}
        >
          {icon}
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

export default function SocialLinksBanner() {
  return (
    <section className="bg-xora-cream px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="connect-with-yaqana-title">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-5 border border-xora-gold/70 bg-xora-charcoal px-5 py-5 sm:px-8 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
        <div>
          <h2 id="connect-with-yaqana-title" className="font-serif text-xl sm:text-2xl tracking-[0.12em] text-xora-offwhite">
            CONNECT WITH YAQANA
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-light text-xora-gold">
            Stay connected with the world of YAQANA.
          </p>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed font-light text-xora-offwhite/75">
            Elevated menswear shaped by architectural tailoring, serene neutral tones, and uncompromising fabric integrity.
          </p>
        </div>
        <SocialLinks className="lg:justify-end" />
      </div>
    </section>
  );
}
