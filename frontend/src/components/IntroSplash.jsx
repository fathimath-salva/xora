import { useEffect, useState } from 'react';

const INTRO_SEEN_KEY = 'xora_intro_seen';

const shouldShowIntro = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (window.sessionStorage.getItem(INTRO_SEEN_KEY)) return false;
  } catch {
    // Continue without persistence if storage is unavailable.
  }
  return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
};

export default function IntroSplash() {
  const [visible, setVisible] = useState(shouldShowIntro);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      // The splash still works when session storage is unavailable.
    }

    const fadeTimer = window.setTimeout(() => setLeaving(true), 1200);
    const closeTimer = window.setTimeout(() => setVisible(false), 1500);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(closeTimer);
    };
  }, [visible]);

  const skipIntro = () => {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`xora-intro fixed inset-0 z-[100] flex items-center justify-center bg-white text-black dark:bg-black dark:text-white transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      role="status"
      aria-label="Welcome to XORA"
      aria-live="polite"
    >
      <span className="xora-intro-wordmark font-serif text-5xl sm:text-7xl font-light tracking-[0.42em] pl-[0.42em]">
        XORA
      </span>
      <button
        type="button"
        onClick={skipIntro}
        className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.2em] text-black dark:text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Skip intro
      </button>
    </div>
  );
}
