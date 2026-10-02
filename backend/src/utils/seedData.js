export const categoriesData = [
  {
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Precision tailored coats, trenches, and jackets in wool and structured twill.',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    gender: 'all'
  },
  {
    name: 'Knitwear',
    slug: 'knitwear',
    description: 'Elevated Mongolian cashmere, sculpted merino wool, and tactile ribbed essentials.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    gender: 'all'
  },
  {
    name: 'Tailoring',
    slug: 'tailoring',
    description: 'Sharp lines, architectural silhouettes, and relaxed suiting tailored for effortless poise.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    gender: 'all'
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    description: 'Minimalist column silhouettes, bias-cut silk slip dresses, and refined linen styles.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    gender: 'women'
  },
  {
    name: 'Tops & Shirts',
    slug: 'tops-and-shirts',
    description: 'Crisp heavyweight poplin, pure silk button-downs, and refined jersey foundations.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    gender: 'all'
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    description: 'Deep pleated drape trousers, wide-leg tencel pants, and refined neutral chinos.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    gender: 'all'
  }
];

export const productsData = [
  {
    name: 'Cashmere Double-Breasted Trench',
    description: 'An architectural silhouette masterfully tailored from Italian wool-cashmere blend. Features horn buttons, a detachable self-belt, and storm flap detailing designed to last a lifetime.',
    category: 'Outerwear',
    gender: 'women',
    price: 480,
    discountPrice: 420,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: [
      { name: 'Oatmeal Beige', hex: '#D7C9B8' },
      { name: 'Warm Taupe', hex: '#B5A496' },
      { name: 'Charcoal', hex: '#3B3836' }
    ],
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '85% Virgin Wool, 15% Mongolian Cashmere. Cupro lining. Dry clean only.',
    fitDetails: 'Relaxed tailored drape. Designed to layer comfortably over heavy knitwear.',
    shippingDetails: 'Complimentary white-glove express delivery. Signature garment bag included.'
  },
  {
    name: 'Sculpted Merino Mock-Neck Jumper',
    description: 'Spun from extra-fine 19.5 micron Australian merino wool. Knit in a compact Milano stitch for a clean architectural form with minimal rolling hem.',
    category: 'Knitwear',
    gender: 'women',
    price: 260,
    discountPrice: null,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: [
      { name: 'Off-White', hex: '#FAF8F5' },
      { name: 'Sand Taupe', hex: '#C2B4A3' },
      { name: 'Espresso', hex: '#4A3E39' }
    ],
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Traceable Extrafine Merino Wool.',
    fitDetails: 'Structured slim cut through the shoulders with gentle volume through the sleeve.',
    shippingDetails: 'Complimentary shipping on all knitwear essentials.'
  },
  {
    name: 'Bias-Cut Mulberry Silk Slip Dress',
    description: 'Flowing seamlessly along the body contours, our iconic slip dress is crafted from heavy 22-momme sandwashed mulberry silk. Features a clean scoop neckline and floor-grazing hem.',
    category: 'Dresses',
    gender: 'women',
    price: 340,
    discountPrice: 295,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: [
      { name: 'Champagne Cream', hex: '#F3EFE6' },
      { name: 'Smoky Taupe', hex: '#A8998C' }
    ],
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% Grade 6A Mulberry Silk, matte sandwashed finish.',
    fitDetails: 'True bias drape. Gently contours without clinging.',
    shippingDetails: 'Shipped in custom luxury presentation gift box.'
  },
  {
    name: 'Relaxed Pleated Drape Trouser',
    description: 'Tailored with crisp front double pleats and an elongated high-rise silhouette. Crafted from year-round tropical wool with comfortable natural give.',
    category: 'Trousers',
    gender: 'women',
    price: 290,
    discountPrice: null,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Warm Putty', hex: '#D9D2C7' },
      { name: 'Charcoal Brown', hex: '#483C32' }
    ],
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '98% Virgin Tropical Wool, 2% Elastane.',
    fitDetails: 'High-waisted with a generous straight-leg fluid fall.',
    shippingDetails: 'Complimentary shipping and free exchanges.'
  },
  {
    name: 'Structured Raw Linen Blazer',
    description: 'An unstructured single-breasted blazer woven in Normandy from heavy heritage linen. Finished with pick-stitch lapels and unlined interior for natural breathability.',
    category: 'Tailoring',
    gender: 'women',
    price: 390,
    discountPrice: 350,
    sizes: ['S', 'M', 'L'],
    colours: [
      { name: 'Natural Flax', hex: '#E2DACB' },
      { name: 'Bone White', hex: '#F7F5F0' }
    ],
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% French Certified Organic Linen.',
    fitDetails: 'Oversized boxy tailoring. Size down for a classic fit.',
    shippingDetails: 'Complimentary express shipping.'
  },
  {
    name: 'Oversized Poplin Boyfriend Shirt',
    description: 'Crisp 120s two-ply organic cotton poplin cut with relaxed dropped shoulders, extended cuffs, and mother-of-pearl buttons. The ultimate timeless essential.',
    category: 'Tops & Shirts',
    gender: 'women',
    price: 180,
    discountPrice: null,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: [
      { name: 'Crisp Warm White', hex: '#FAF9F6' },
      { name: 'Pale Sand', hex: '#EDE6DB' }
    ],
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '100% Egyptian Giza Organic Cotton.',
    fitDetails: 'Intentionally oversized. Hem falls below hips.',
    shippingDetails: 'Standard express dispatch within 24 hours.'
  },
  {
    name: 'Minimalist Column Knit Dress',
    description: 'Clean floor-length ribbed knit dress crafted from sustainable viscose and mulberry silk blend. Features a subtle back slit for ease of movement and enduring poise.',
    category: 'Dresses',
    gender: 'women',
    price: 320,
    discountPrice: null,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: [
      { name: 'Taupe Melange', hex: '#AFA498' },
      { name: 'Warm Charcoal', hex: '#3C3937' }
    ],
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '70% Lenzing Ecovero Viscose, 30% Mulberry Silk.',
    fitDetails: 'Figure-skimming silhouette with elegant high crew neck.',
    shippingDetails: 'Complimentary shipping included.'
  },
  {
    name: 'Men\'s Tailored Wool Overcoat',
    description: 'An investment piece designed with a timeless notched lapel, concealed horn button placket, and clean raglan sleeves. Woven from double-faced Italian wool.',
    category: 'Outerwear',
    gender: 'men',
    price: 520,
    discountPrice: 470,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Camel Tan', hex: '#C19A6B' },
      { name: 'Deep Espresso', hex: '#3D312A' },
      { name: 'Slate Gray', hex: '#53565A' }
    ],
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '90% Italian Virgin Wool, 10% Cashmere.',
    fitDetails: 'Classic tailored fit. Structured shoulders with knee-length cut.',
    shippingDetails: 'Complimentary luxury courier delivery.'
  },
  {
    name: 'Men\'s Cashmere Crewneck Sweater',
    description: 'Crafted from sustainable Grade-A Mongolian cashmere with a cloud-soft hand feel. Ribbed cuffs and hem provide shape retention through countless wears.',
    category: 'Knitwear',
    gender: 'men',
    price: 280,
    discountPrice: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Warm Ecru', hex: '#F5F2EB' },
      { name: 'Heather Taupe', hex: '#9E948A' },
      { name: 'Charcoal', hex: '#363432' }
    ],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e98?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% Pure Mongolian Cashmere (2-ply 12GG).',
    fitDetails: 'Regular modern fit. Fits true to size.',
    shippingDetails: 'Complimentary shipping.'
  },
  {
    name: 'Men\'s Relaxed Pleated Wool Trouser',
    description: 'Clean single pleats with adjustable side waist tabs. Cut with subtle taper at the hem from breathable, crease-resistant high-twist wool.',
    category: 'Trousers',
    gender: 'men',
    price: 270,
    discountPrice: 240,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Stone Taupe', hex: '#C9BEB0' },
      { name: 'Dark Moka', hex: '#3B332F' }
    ],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '100% High-Twist Fresco Wool.',
    fitDetails: 'Mid-rise, easy room through thigh with gentle hem taper.',
    shippingDetails: 'Complimentary shipping and hem alterations guide.'
  },
  {
    name: 'Men\'s Linen Camp Collar Shirt',
    description: 'Garment-washed Normandy linen offering an effortless drape in warmer weather. Featuring a camp collar, straight vented hem, and corozo nut buttons.',
    category: 'Tops & Shirts',
    gender: 'men',
    price: 175,
    discountPrice: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Sand Dune', hex: '#D8CBB9' },
      { name: 'Warm Alabaster', hex: '#F9F7F2' }
    ],
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Pure Normandy Linen.',
    fitDetails: 'Straight boxy cut for natural airflow.',
    shippingDetails: 'Standard express delivery.'
  },
  {
    name: 'Men\'s Double-Breasted Linen Blazer',
    description: 'Relaxed Neapolitan-inspired soft shoulder construction. Unlined with patch pockets and peak lapels for an understated quiet luxury statement.',
    category: 'Tailoring',
    gender: 'men',
    price: 440,
    discountPrice: 390,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: [
      { name: 'Soft Taupe', hex: '#B8A89A' },
      { name: 'Ivory Cream', hex: '#F0ECE1' }
    ],
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% Washed Linen. Unlined body, cupro sleeve lining.',
    fitDetails: 'Relaxed modern tailoring with soft deconstructed shoulder.',
    shippingDetails: 'Complimentary shipping.'
  }
];
