const CATEGORY_IMAGES = {
  't-shirts': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85',
  hoodies: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=85',
  shirts: 'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85',
  trousers: 'https://images.unsplash.com/photo-1792007195216-c4b6e8bd8d3d?auto=format&fit=crop&w=900&q=85'
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
    ? usableImages
    : [CATEGORY_IMAGES[category] || CATEGORY_IMAGES.shirts];
}

export function getProductImage(product) {
  return getProductImages(product)[0];
}

export function getCategoryImage(category) {
  return CATEGORY_IMAGES[String(category || '').trim().toLowerCase()] || CATEGORY_IMAGES.shirts;
}
