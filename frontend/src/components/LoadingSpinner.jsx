import React from 'react';

export default function LoadingSpinner({ message = 'Loading XORA Collection...' }) {
  return (
    <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border border-xora-taupe/30"></div>
        <div className="absolute inset-0 rounded-full border border-t-xora-charcoal animate-spin"></div>
      </div>
      <p className="font-serif text-xs uppercase tracking-luxury text-xora-taupe-dark">
        {message}
      </p>
    </div>
  );
}
