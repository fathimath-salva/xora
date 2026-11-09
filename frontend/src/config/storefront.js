// Update this single setting when the first-order offer has been configured
// in the checkout and backend order calculation.
export const firstOrderOffer = Object.freeze({
  percentage: 10,
  checkoutConfigured: false
});

export const whatsappBusinessNumber = import.meta.env.VITE_YAQANA_WHATSAPP_NUMBER || '';

export const CAMPAIGN_IMAGES = Object.freeze({
  hero: '/images/xora-campaign/xora-hero.jpg',
  upperwear: '/images/xora-campaign/xora-upperwear.jpg',
  trousers: '/images/xora-campaign/xora-trousers.jpg'
});
