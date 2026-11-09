import { rupeesToCatalogUnits } from '../utils/currency';

const assetPath = (productId, view) => `/images/demo-clothing-rack/${productId}-${view}.svg`;

const productDefinitions = [
  {
    id: 'demo-oversized-black-tee',
    name: 'Oversized Black T-Shirt',
    priceInRupees: 999,
    description: 'A relaxed, oversized tee with a clean crew neckline and an easy everyday drape.',
    category: 'T-Shirts',
    colours: [{ name: 'Black', hex: '#282522' }, { name: 'Stone', hex: '#b7aa98' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-premium-white-tee',
    name: 'Premium White T-Shirt',
    priceInRupees: 899,
    description: 'A considered staple with a classic crew neck and a softly structured silhouette.',
    category: 'T-Shirts',
    colours: [{ name: 'Ivory', hex: '#eee9df' }, { name: 'Navy', hex: '#293746' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-beige-casual-shirt',
    name: 'Beige Casual Shirt',
    priceInRupees: 1499,
    description: 'A versatile button-front shirt with a softly tailored shape and considered details.',
    category: 'Shirts',
    colours: [{ name: 'Beige', hex: '#c4ae91' }, { name: 'Sage', hex: '#89907c' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-black-relaxed-shirt',
    name: 'Black Relaxed-Fit Shirt',
    priceInRupees: 1699,
    description: 'An easy relaxed-fit shirt with a clean collar and understated button detailing.',
    category: 'Shirts',
    colours: [{ name: 'Black', hex: '#302e2c' }, { name: 'Charcoal', hex: '#55524d' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-premium-hoodie',
    name: 'Premium Hoodie',
    priceInRupees: 1999,
    description: 'A comfortable pullover layer with a generous hood and a softly relaxed fit.',
    category: 'Hoodies',
    colours: [{ name: 'Oatmeal', hex: '#c9bba5' }, { name: 'Forest', hex: '#3e5146' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-beige-wide-leg-trousers',
    name: 'Beige Wide-Leg Trousers',
    priceInRupees: 1299,
    description: 'A clean wide-leg silhouette with a comfortable rise and an understated finish.',
    category: 'Trousers',
    colours: [{ name: 'Beige', hex: '#c7b49b' }, { name: 'Dark Olive', hex: '#626655' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-oatmeal-zip-hoodie',
    name: 'Oatmeal Zip Hoodie',
    priceInRupees: 2199,
    description: 'A refined zip-through layer with a relaxed hood and a softly structured silhouette.',
    category: 'Hoodies',
    colours: [{ name: 'Oatmeal', hex: '#c9bba5' }, { name: 'Charcoal', hex: '#484641' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'demo-charcoal-tailored-trousers',
    name: 'Charcoal Tailored Trousers',
    priceInRupees: 1799,
    description: 'A clean straight-leg trouser with a comfortable rise and an understated finish.',
    category: 'Trousers',
    colours: [{ name: 'Charcoal', hex: '#55524d' }, { name: 'Stone', hex: '#b7aa98' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }
];

export const demoRackProducts = Object.freeze(productDefinitions.map((product) => ({
  ...product,
  _id: product.id,
  isDemoOnly: true,
  price: rupeesToCatalogUnits(product.priceInRupees),
  originalPrice: rupeesToCatalogUnits(product.priceInRupees),
  stock: 6,
  demoStockStatus: 'Demo item — not available for purchase',
  rackImages: {
    side: assetPath(product.id, 'side'),
    front: assetPath(product.id, 'front'),
    back: assetPath(product.id, 'back')
  },
  images: [assetPath(product.id, 'front')]
})));
