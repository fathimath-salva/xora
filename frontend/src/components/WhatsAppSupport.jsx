import { MessageCircle } from 'lucide-react';
import { whatsappBusinessNumber } from '../config/storefront';

const configuredNumber = whatsappBusinessNumber.trim();
const phoneNumber = /^\+?[\d\s()-]+$/.test(configuredNumber)
  ? configuredNumber.replace(/\D/g, '')
  : '';

export default function WhatsAppSupport({ orderNumber, inline = false } = {}) {
  if (!/^\d{8,15}$/.test(phoneNumber)) return null;

  const supportMessage = orderNumber
    ? `Hello YAQANA, I need assistance with my order. Order number: ${orderNumber}.`
    : 'Hello YAQANA, I need assistance with my order.';
  const message = encodeURIComponent(supportMessage);

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label={orderNumber ? `Ask YAQANA about order ${orderNumber} on WhatsApp` : 'Contact YAQANA on WhatsApp'}
      className={inline
        ? 'inline-flex items-center gap-2 text-xs text-xora-taupe-dark underline underline-offset-2 hover:text-xora-charcoal'
        : 'fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#255b46] text-white shadow-lg transition-colors hover:bg-[#1d4938] lg:bottom-5'}
    >
      <MessageCircle aria-hidden="true" className={inline ? 'h-4 w-4' : 'h-5 w-5'} />
      {inline && 'WhatsApp order support'}
    </a>
  );
}
