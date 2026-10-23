/**
 * XORA Catalogue Seed Data
 * 20 men's products: 5 T-Shirts, 5 Hoodies, 5 Shirts, 5 Trousers
 * Sample data — material compositions and measurements are indicative only.
 * Client must review and approve before treating as verified specifications.
 */

export const categoriesData = [
  {
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Premium cotton jersey, polos, and relaxed-fit essentials for the modern gentleman.',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85',
    gender: 'men'
  },
  {
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Soft brushed-fleece and heavyweight cotton layers for cooler days and relaxed weekends.',
    image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=85',
    gender: 'men'
  },
  {
    name: 'Shirts',
    slug: 'shirts',
    description: 'Oxford, linen, poplin, and chambray shirts crafted for workdays and weekends alike.',
    image: 'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85',
    gender: 'men'
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    description: 'Deep-pleated drape trousers, refined chinos, and tailored wool blends with enduring fit.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
    gender: 'men'
  }
];

// Standard measurements for reference (garment cm — indicative sample only)
const tShirtMeasurements = {
  S:   { 'Chest': 96,  'Shoulder': 43, 'Length': 69, 'Sleeve': 22 },
  M:   { 'Chest': 100, 'Shoulder': 45, 'Length': 71, 'Sleeve': 23 },
  L:   { 'Chest': 104, 'Shoulder': 47, 'Length': 73, 'Sleeve': 24 },
  XL:  { 'Chest': 108, 'Shoulder': 49, 'Length': 75, 'Sleeve': 25 },
  XXL: { 'Chest': 113, 'Shoulder': 51, 'Length': 77, 'Sleeve': 26 }
};

const hoodiesMeasurements = {
  S:   { 'Chest': 100, 'Shoulder': 46, 'Length': 70, 'Sleeve': 63 },
  M:   { 'Chest': 104, 'Shoulder': 48, 'Length': 72, 'Sleeve': 64 },
  L:   { 'Chest': 108, 'Shoulder': 50, 'Length': 74, 'Sleeve': 65 },
  XL:  { 'Chest': 112, 'Shoulder': 52, 'Length': 76, 'Sleeve': 66 },
  XXL: { 'Chest': 117, 'Shoulder': 54, 'Length': 78, 'Sleeve': 67 }
};

const shirtMeasurements = {
  S:   { 'Chest': 98,  'Shoulder': 44, 'Length': 74, 'Sleeve': 61 },
  M:   { 'Chest': 102, 'Shoulder': 46, 'Length': 76, 'Sleeve': 62 },
  L:   { 'Chest': 106, 'Shoulder': 48, 'Length': 78, 'Sleeve': 63 },
  XL:  { 'Chest': 110, 'Shoulder': 50, 'Length': 80, 'Sleeve': 64 },
  XXL: { 'Chest': 115, 'Shoulder': 52, 'Length': 82, 'Sleeve': 65 }
};

const trouserMeasurements = {
  S:   { 'Waist': 76, 'Hip': 94,  'Rise': 27, 'Inseam': 78, 'Hem': 41 },
  M:   { 'Waist': 80, 'Hip': 98,  'Rise': 28, 'Inseam': 79, 'Hem': 42 },
  L:   { 'Waist': 84, 'Hip': 102, 'Rise': 29, 'Inseam': 80, 'Hem': 43 },
  XL:  { 'Waist': 88, 'Hip': 106, 'Rise': 30, 'Inseam': 81, 'Hem': 44 },
  XXL: { 'Waist': 92, 'Hip': 110, 'Rise': 31, 'Inseam': 82, 'Hem': 44 }
};

export const productsData = [

  // ─────────────── T-SHIRTS (5) ───────────────

  {
    name: "XORA Essential Crew Tee",
    shortDescription: "Dependable everyday crew-neck in soft combed cotton with a substantial hand feel.",
    description: "Our foundational piece. Crafted from 200gsm combed ring-spun cotton for a smooth, durable finish that holds its shape wash after wash. The ribbed crew neck and taped shoulder seams give it a clean, refined silhouette that works under a blazer or on its own.",
    category: 'T-Shirts',
    gender: 'men',
    priceInr: 1199,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Off White', hex: '#F5F2EB' }, { name: 'Charcoal', hex: '#282522' }, { name: 'Stone', hex: '#C9BEB0' }],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '100% Combed Ring-Spun Cotton, 200gsm. Sample specification — pending client confirmation.',
    fitDetails: 'Classic regular fit. Hem sits below the hip. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Tumble dry low. Do not bleach. Iron on reverse if needed.',
    collectionName: 'Core Essentials',
    measurements: tShirtMeasurements,
    active: true
  },

  {
    name: "XORA Heavyweight Oversized Tee",
    shortDescription: "Relaxed heavyweight tee with dropped shoulders and a clean modern silhouette.",
    description: "Constructed from a dense 260gsm cotton fleece-back jersey, this oversized tee channels a deliberate, architectural ease. Dropped shoulder seams fall intentionally low for a contemporary proportion. Finished with a clean hemline and minimal branding.",
    category: 'T-Shirts',
    gender: 'men',
    priceInr: 1499,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Sand Dune', hex: '#D8CBB9' }, { name: 'Slate', hex: '#7D7D7D' }],
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Heavyweight Cotton, 260gsm. Sample specification — pending client confirmation.',
    fitDetails: 'Oversized fit. Dropped shoulders. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not bleach. Tumble dry low. Iron on medium heat.',
    collectionName: 'Core Essentials',
    measurements: tShirtMeasurements,
    active: true
  },

  {
    name: "XORA Slim Fit Polo",
    shortDescription: "Refined piqué cotton polo with a structured collar and short button placket.",
    description: "A wardrobe cornerstone for the considered gentleman. Woven in a classic piqué cotton and finished with a two-button placket and ribbed collar. The slim silhouette transitions effortlessly from weekend dressing to smart-casual occasions.",
    category: 'T-Shirts',
    gender: 'men',
    priceInr: 1699,
    discountPriceInr: 1399,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Navy', hex: '#1B2A41' }, { name: 'Ecru', hex: '#EAE3D6' }, { name: 'Forest', hex: '#2D4A3E' }],
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1627686011747-74adda3d2343?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% Cotton Piqué, enzyme washed. Sample specification — pending client confirmation.',
    fitDetails: 'Slim fit. Choose one size up for a relaxed fit. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not bleach. Lay flat to dry for best results.',
    collectionName: 'Summer Atelier',
    measurements: tShirtMeasurements,
    active: true
  },

  {
    name: "XORA Graphic Logo Tee",
    shortDescription: "Understated chest graphic tee in soft combed cotton with a relaxed fit.",
    description: "Minimal branding, maximum confidence. This relaxed crew tee features a tasteful tonal XORA chest graphic embroidered in self-coloured thread on premium combed cotton jersey. The hem is slightly longer at the back for intentional layering.",
    category: 'T-Shirts',
    gender: 'men',
    priceInr: 1299,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Warm White', hex: '#FAF9F6' }, { name: 'Espresso', hex: '#3D2B1F' }],
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Combed Cotton, 180gsm. Tonal embroidered branding. Sample specification — pending client confirmation.',
    fitDetails: 'Relaxed regular fit. Longer curved hem at back. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not bleach. Tumble dry low. Iron on reverse.',
    collectionName: 'Core Essentials',
    measurements: tShirtMeasurements,
    active: true
  },

  {
    name: "XORA Henley Long-Sleeve Tee",
    shortDescription: "Long-sleeve Henley tee in soft jersey with a three-button placket and relaxed drape.",
    description: "An elevated take on the everyday long-sleeve. The Henley placket with three corozo nut buttons adds a considered detail without sacrificing comfort. Made from our softest single-jersey cotton for a fluid, relaxed drape.",
    category: 'T-Shirts',
    gender: 'men',
    priceInr: 1599,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Oatmeal', hex: '#E8DDD1' }, { name: 'Black', hex: '#1A1A1A' }],
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    fabricDetails: '100% Cotton Single Jersey, 160gsm. Corozo nut buttons. Sample specification — pending client confirmation.',
    fitDetails: 'Regular fit. Slightly relaxed through chest and body. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not tumble dry. Iron on medium heat.',
    collectionName: 'Core Essentials',
    measurements: tShirtMeasurements,
    active: true
  },

  // ─────────────── HOODIES (5) ───────────────

  {
    name: "XORA Classic Pullover Hoodie",
    shortDescription: "Soft brushed-fleece hoodie with a kangaroo pocket, drawstring, and clean minimal finish.",
    description: "Our most-worn layer. Constructed from a mid-weight cotton-rich brushed fleece with a smooth face and plush interior. Features an adjustable two-tone drawstring, kangaroo front pocket, and ribbed cuffs and hem for a comfortable, tailored fit.",
    category: 'Hoodies',
    gender: 'men',
    priceInr: 2499,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Heather Grey', hex: '#A8A6A1' }, { name: 'Deep Brown', hex: '#51453C' }, { name: 'Off White', hex: '#F0ECE5' }],
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '80% Cotton, 20% Polyester, 320gsm brushed fleece. Sample specification — pending client confirmation.',
    fitDetails: 'Relaxed regular fit. Ribbed cuffs and hem. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Tumble dry low. Do not bleach. Iron on low if needed.',
    collectionName: 'Autumn Atelier',
    measurements: hoodiesMeasurements,
    active: true
  },

  {
    name: "XORA Zip-Through Hoodie",
    shortDescription: "Full-zip hoodie in heavyweight fleece with structured silhouette and clean seaming.",
    description: "A versatile layering piece designed for ease and refinement. The full-length zip allows for effortless wear-ability while the structured shoulders and clean seaming elevate it well beyond casual. Finished with a lined hood for added depth.",
    category: 'Hoodies',
    gender: 'men',
    priceInr: 2999,
    discountPriceInr: 2599,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Charcoal', hex: '#3B3836' }, { name: 'Stone Taupe', hex: '#C9BEB0' }],
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '85% Cotton, 15% Polyester, 350gsm fleece. Metal zipper. Sample specification — pending client confirmation.',
    fitDetails: 'Regular fit with structured shoulders. Ribbed hem and cuffs. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not tumble dry. Iron on reverse at low temperature.',
    collectionName: 'Autumn Atelier',
    measurements: hoodiesMeasurements,
    active: true
  },

  {
    name: "XORA Heavyweight Loopback Hoodie",
    shortDescription: "Thick loopback cotton hoodie with a boxy silhouette and premium hand feel.",
    description: "Made from our densest 400gsm loopback cotton jersey, this hoodie is built to last. The signature loopback texture on the interior provides exceptional warmth without excessive weight. The boxy, oversized fit is intentional — designed as a statement layer for cooler months.",
    category: 'Hoodies',
    gender: 'men',
    priceInr: 3299,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Slate Blue', hex: '#4A5568' }],
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Cotton Loopback Jersey, 400gsm. Sample specification — pending client confirmation.',
    fitDetails: 'Oversized boxy fit. Size down if you prefer a more fitted look. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash cold. Reshape while damp. Do not tumble dry. Do not bleach.',
    collectionName: 'Autumn Atelier',
    measurements: hoodiesMeasurements,
    active: true
  },

  {
    name: "XORA Quarter-Zip Sweatshirt",
    shortDescription: "Clean quarter-zip sweatshirt in French terry cotton with a ribbed collar.",
    description: "An elevated take on the everyday sweatshirt. The quarter-zip collar detail adds a quiet, considered refinement. Crafted from fine-gauge French terry cotton with a smooth face and airy loop interior — ideal for layering through transitional seasons.",
    category: 'Hoodies',
    gender: 'men',
    priceInr: 2799,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Ecru', hex: '#E8DFD0' }, { name: 'Forest Green', hex: '#2D4035' }],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    fabricDetails: '100% French Terry Cotton, 280gsm. Metal quarter-zip. Sample specification — pending client confirmation.',
    fitDetails: 'Regular fit. Relaxed through body. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Lay flat to dry. Do not bleach.',
    collectionName: 'Core Essentials',
    measurements: hoodiesMeasurements,
    active: true
  },

  {
    name: "XORA Blanket-Stitch Fleece Hoodie",
    shortDescription: "Cosy sherpa-lined hoodie with blanket-stitch detail and structured fit.",
    description: "Where warmth meets refinement. A structured hoodie with a sherpa-lined hood and interior body for exceptional cold-weather comfort. The blanket-stitch trim at the cuffs and hem is a considered artisanal detail that sets this piece apart from the ordinary.",
    category: 'Hoodies',
    gender: 'men',
    priceInr: 3799,
    discountPriceInr: 3199,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Warm Taupe', hex: '#B5A496' }, { name: 'Deep Navy', hex: '#1B2A41' }],
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1551860863-d98db3dbbee3?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    fabricDetails: 'Outer: 70% Cotton, 30% Polyester. Hood/Interior lining: Sherpa fleece. Sample specification — pending client confirmation.',
    fitDetails: 'Regular to relaxed fit. Slightly structured shoulders. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash cold on delicate. Tumble dry low. Do not iron sherpa lining.',
    collectionName: 'Autumn Atelier',
    measurements: hoodiesMeasurements,
    active: true
  },

  // ─────────────── SHIRTS (5) ───────────────

  {
    name: "XORA Oxford Button-Down Shirt",
    shortDescription: "Crisp cotton Oxford with a classic button-down collar and easy tailored fit.",
    description: "A foundational wardrobe shirt that transitions seamlessly from the boardroom to the weekend. Woven in a heavyweight 120s Oxford cotton with a textured basket weave, this shirt offers structure without stiffness. Finished with mother-of-pearl buttons and a clean, precise placket.",
    category: 'Shirts',
    gender: 'men',
    priceInr: 2299,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'White', hex: '#F5F2EB' }, { name: 'Sky Blue', hex: '#B9CAD6' }, { name: 'Pale Pink', hex: '#E8D4C8' }],
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '100% Cotton Oxford Weave. Mother-of-pearl buttons. Sample specification — pending client confirmation.',
    fitDetails: 'Regular fit with a button-down collar. Tuck or untuck-friendly hem length. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 40°C. Hang to dry. Iron while damp for best results.',
    collectionName: 'Core Essentials',
    measurements: shirtMeasurements,
    active: true
  },

  {
    name: "XORA Linen Camp Collar Shirt",
    shortDescription: "Garment-washed linen with a relaxed camp collar and effortless warm-weather drape.",
    description: "Our most beloved summer shirt. Woven from pure Normandy linen and garment-washed for immediate softness and a relaxed drape. The open camp collar and straight vented hem make it an ideal companion for warmer climates — worn open over a tee or buttoned to the top.",
    category: 'Shirts',
    gender: 'men',
    priceInr: 2799,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Sand Dune', hex: '#D8CBB9' }, { name: 'Warm Alabaster', hex: '#F9F7F2' }, { name: 'Terracotta', hex: '#C57C57' }],
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Garment-Washed Normandy Linen. Corozo nut buttons. Sample specification — pending client confirmation.',
    fitDetails: 'Straight boxy cut for natural airflow. Shirt is designed to be worn untucked. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash cold. Hang to dry. Light iron acceptable. Natural creasing is characteristic of linen.',
    collectionName: 'Summer Atelier',
    measurements: shirtMeasurements,
    active: true
  },

  {
    name: "XORA Poplin Spread Collar Shirt",
    shortDescription: "Fine two-ply poplin with a spread collar and precise tailored construction.",
    description: "Precision craftsmanship in a lightweight 80s two-ply poplin. The spread collar is designed for wearing open or with a tie. Single-needle stitching throughout and precisely matched patterns at the button placket reflect a commitment to understated quality.",
    category: 'Shirts',
    gender: 'men',
    priceInr: 3199,
    discountPriceInr: 2699,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Bright White', hex: '#FAFAF8' }, { name: 'Pale Dove', hex: '#D9D3CC' }],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% Two-Ply Poplin Cotton. Single-needle stitching. Mother-of-pearl buttons. Sample specification — pending client confirmation.',
    fitDetails: 'Slim tailored fit. Ideal for layering under a blazer. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 40°C. Iron while slightly damp for a crisp finish. Hang immediately after washing.',
    collectionName: 'Core Essentials',
    measurements: shirtMeasurements,
    active: true
  },

  {
    name: "XORA Chambray Overshirt",
    shortDescription: "Medium-weight chambray overshirt with chest pockets and clean workwear detailing.",
    description: "A versatile overshirt designed to layer over a tee or wear alone. Woven from a fine chambray cotton in a soft mid-blue, it brings relaxed utility with a refined edge. Features two chest patch pockets and a clean box pleat at the back yoke.",
    category: 'Shirts',
    gender: 'men',
    priceInr: 2599,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Chambray Blue', hex: '#7D9BB5' }, { name: 'Khaki', hex: '#C3B08C' }],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    fabricDetails: '100% Washed Chambray Cotton. Corozo buttons. Sample specification — pending client confirmation.',
    fitDetails: 'Relaxed fit designed for layering. Straight hem, button-through front. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash cold. Tumble dry low. Iron on medium heat. Natural texture is characteristic.',
    collectionName: 'Summer Atelier',
    measurements: shirtMeasurements,
    active: true
  },

  {
    name: "XORA Flannel Check Shirt",
    shortDescription: "Soft brushed flannel in a tonal check with a relaxed, comfortable fit.",
    description: "A seasonal classic elevated by XORA's premium material standards. Woven from a brushed cotton flannel in a subtle tonal check, this shirt is extraordinarily soft and gets better with every wash. Finished with a clean chest pocket and reinforced button placket.",
    category: 'Shirts',
    gender: 'men',
    priceInr: 2499,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Ochre Check', hex: '#C4924A' }, { name: 'Navy Check', hex: '#2C3E50' }],
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Brushed Cotton Flannel. Sample specification — pending client confirmation.',
    fitDetails: 'Regular relaxed fit. Perfect for layering under or over knitwear. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Do not bleach. Tumble dry low. Iron on medium heat.',
    collectionName: 'Autumn Atelier',
    measurements: shirtMeasurements,
    active: true
  },

  // ─────────────── TROUSERS (5) ───────────────

  {
    name: "XORA Tailored Wool Trouser",
    shortDescription: "Clean-front wool trouser with a considered taper and refined finish.",
    description: "Our signature tailored trouser, cut from a breathable high-twist fresco wool blend. Clean-front construction with side-waist adjusters, a concealed hook-and-bar fastening, and subtle pressed crease for a polished, understated silhouette.",
    category: 'Trousers',
    gender: 'men',
    priceInr: 3999,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Charcoal Grey', hex: '#45413E' }, { name: 'Warm Taupe', hex: '#A99B8C' }, { name: 'Navy', hex: '#1B2A41' }],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1556541797-71b8231ed916?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    fabricDetails: '98% Wool, 2% Elastane, Fresco weave. Sample specification — pending client confirmation.',
    fitDetails: 'Slim tapered fit. Mid-rise. Finished with a single break at the hem. Model is 183 cm and wears size M.',
    careInstructions: 'Dry clean only. Steam between wears to maintain shape. Press with a damp cloth.',
    collectionName: 'Core Essentials',
    measurements: trouserMeasurements,
    active: true
  },

  {
    name: "XORA Relaxed Pleated Trouser",
    shortDescription: "Double-pleated drape trouser in year-round tropical wool with side waist tabs.",
    description: "Inspired by classic Italian tailoring, the XORA pleated trouser features double reverse pleats for generous room through the thigh, falling to a clean straight leg. Cut from a lightweight tropical wool for year-round wearability. Side waist tabs allow for a precise waist fit.",
    category: 'Trousers',
    gender: 'men',
    priceInr: 4499,
    discountPriceInr: 3799,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Stone Putty', hex: '#D9D2C7' }, { name: 'Soft Mushroom', hex: '#B2A79A' }],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1562693053-ee785530e9f0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1556541797-71b8231ed916?auto=format&fit=crop&w=900&q=85'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    fabricDetails: '100% High-Twist Tropical Wool. Sample specification — pending client confirmation.',
    fitDetails: 'Relaxed through hip and thigh. High-waisted with double reverse pleats. Model is 183 cm and wears size M.',
    careInstructions: 'Dry clean recommended. Can hand wash cold with care. Press reverse side with damp cloth.',
    collectionName: 'Core Essentials',
    measurements: trouserMeasurements,
    active: true
  },

  {
    name: "XORA Cotton Chino Trouser",
    shortDescription: "Versatile straight-leg chino in premium garment-washed cotton with a clean finish.",
    description: "The everyday trouser that does everything well. Cut from a garment-washed cotton twill for a relaxed, slightly broken-in feel from the first wear. Features a clean flat-front construction, straight leg from hip to hem, and an invisible back welt pocket.",
    category: 'Trousers',
    gender: 'men',
    priceInr: 2999,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Khaki', hex: '#BFB08A' }, { name: 'Navy', hex: '#2C3E50' }, { name: 'Olive', hex: '#6B7C5A' }],
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1562693053-ee785530e9f0?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Garment-Washed Cotton Twill. Sample specification — pending client confirmation.',
    fitDetails: 'Straight fit from hip to hem. Mid-rise. Works well tucked or untucked. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Tumble dry low. Iron while damp on medium heat.',
    collectionName: 'Summer Atelier',
    measurements: trouserMeasurements,
    active: true
  },

  {
    name: "XORA Linen Wide-Leg Trouser",
    shortDescription: "Relaxed wide-leg linen trouser with a high rise and effortless warm-weather drape.",
    description: "An architectural statement in pure linen. The wide-leg cut falls with a natural weight and ease, ideal for warmer climates or elevated resort dressing. High-rise construction with an elasticated back waist for comfort without sacrificing silhouette.",
    category: 'Trousers',
    gender: 'men',
    priceInr: 3499,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Natural Linen', hex: '#DDD3C1' }, { name: 'Warm Sand', hex: '#C9B898' }],
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    fabricDetails: '100% Pure Linen. Elasticated back waist. Sample specification — pending client confirmation.',
    fitDetails: 'Wide-leg relaxed fit. High-rise. Natural creasing of linen is characteristic of this fabric. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash cold on delicate. Hang to dry. Press with a hot iron for a crisp finish if preferred.',
    collectionName: 'Summer Atelier',
    measurements: trouserMeasurements,
    active: true
  },

  {
    name: "XORA Jogger Trouser",
    shortDescription: "Premium tapered jogger in French terry cotton with an elasticated waist and ankle.",
    description: "The refined answer to the everyday jogger. Cut from our heaviest French terry cotton, these tapered trousers offer a clean, contemporary silhouette with the ease of a drawstring waist and elasticated ankle cuffs. Designed to be presentable beyond the home.",
    category: 'Trousers',
    gender: 'men',
    priceInr: 2799,
    discountPriceInr: null,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: [{ name: 'Ash Grey', hex: '#BBBAB5' }, { name: 'Deep Charcoal', hex: '#35322F' }],
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1602619075660-d0f5459cb189?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1556541797-71b8231ed916?auto=format&fit=crop&w=900&q=85'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    fabricDetails: '85% Cotton, 15% Polyester, French Terry 300gsm. Sample specification — pending client confirmation.',
    fitDetails: 'Tapered fit with a relaxed thigh and fitted ankle. Drawstring waist for adjustability. Model is 183 cm and wears size M.',
    careInstructions: 'Machine wash at 30°C. Tumble dry low. Do not bleach or iron.',
    collectionName: 'Core Essentials',
    measurements: trouserMeasurements,
    active: true
  }
];

// These four Unsplash images were downloaded and visually reviewed against
// their category labels. Keep all product detail and inventory data intact,
// while ensuring legacy photo IDs cannot show unrelated or women's garments.
const verifiedMenswearImages = {
  'T-Shirts': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85',
  Hoodies: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=85',
  Shirts: 'https://images.unsplash.com/photo-1611619668823-13e82692eddc?auto=format&fit=crop&w=900&q=85',
  Trousers: 'https://images.unsplash.com/photo-1792007195216-c4b6e8bd8d3d?auto=format&fit=crop&w=900&q=85'
};

// Replace only catalogue image references; prices, stock, variants, names,
// collection membership, and archive state remain untouched.
for (const product of productsData) {
  const verifiedImage = verifiedMenswearImages[product.category];
  if (verifiedImage && product.gender === 'men') product.images = [verifiedImage];
}

export const collectionsData = [...new Set(productsData.map((product) => product.collectionName).filter(Boolean))]
  .map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: `A considered edit of XORA menswear from the ${name} collection.`
  }));
