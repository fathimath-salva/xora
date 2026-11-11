import { resolveApiAssetUrl } from './apiUrl.js';

const CATEGORY_IMAGES = {
  't-shirts': '/images/xora-products/t-shirts.jpg',
  hoodies: '/images/xora-products/hoodies.jpg',
  shirts: '/images/xora-products/shirts.jpg',
  trousers: '/images/xora-campaign/xora-trousers.jpg'
};

export const PRODUCT_IMAGE_FALLBACK = '/images/xora-garment-fallback.svg';

export function getProductImages(product) {
  const category = String(product?.category || '').trim().toLowerCase();
  const savedImages = Array.isArray(product?.images)
    ? product.images.filter((image) => typeof image === 'string' && image.trim())
    : [];

  // Older trousers records reused a full-suit photo. Keep the record intact,
  // but show the verified trousers image on customer-facing product views.
  const usableImages = category === 'trousers'
    ? savedImages.filter((image) => !image.includes('photo-1594938298603-c8148c4dae35'))
    : savedImages;

  return usableImages.length
    ? usableImages.map((image) => resolveApiAssetUrl(image))
    : [CATEGORY_IMAGES[category] || CATEGORY_IMAGES.shirts];
}

export function getProductImage(product) {
  return getProductImages(product)[0];
}

export function getCategoryImage(category) {
  return CATEGORY_IMAGES[String(category || '').trim().toLowerCase()] || CATEGORY_IMAGES.shirts;
}
