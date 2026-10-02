import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title,
  subtitle,
  actionText = 'EXPLORE COLLECTION',
  actionLink = '/shop',
  icon: Icon
}) {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-xora-sand flex items-center justify-center mb-5 text-xora-taupe-dark">
          <Icon className="w-8 h-8 stroke-[1.2]" />
        </div>
      )}
      <h3 className="font-serif text-2xl sm:text-3xl font-light text-xora-charcoal mb-2">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs sm:text-sm text-xora-taupe-dark mb-6 leading-relaxed font-light">
          {subtitle}
        </p>
      )}
      {actionLink && actionText && (
        <Link to={actionLink} className="btn-luxury">
          {actionText}
        </Link>
      )}
    </div>
  );
}
