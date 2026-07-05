/* =========================================================
   KONGPOSH — central product database
   Powers product.html?id=... (shared detail page) and the
   "You May Also Like" panel. Also used to keep the id scheme
   identical to what script.js's slugify() computes on category
   pages, so wishlist/order-list entries added from either place
   always match the same product.
   ---------------------------------------------------------
   id = slugify(page + '::' + name)  — same formula as script.js
========================================================= */

function kpSlugify(name, page) {
  return (page + '::' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const KONGPOSH_PRODUCTS_RAW = [
  /* ---------------- Embroidery ---------------- */
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoops', type: 'Embroidery Hoop', name: 'Embroidery Hoop — Design 1', priceText: 'From $18', images: ['emb-hoops1.jpeg'], desc: 'Hand-stitched hoop art. Shown as a made example — yours will be made fresh for you.', tag: 'Reference Design' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoops', type: 'Embroidery Hoop', name: 'Embroidery Hoop — Design 2', priceText: 'From $18', images: ['emb-hoops2.jpeg'], desc: 'Hand-stitched hoop art. Shown as a made example — yours will be made fresh for you.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoops', type: 'Embroidery Hoop', name: 'Embroidery Hoop — Design 3', priceText: 'From $18', images: ['emb-hoops3.jpeg'], desc: 'Hand-stitched hoop art. Shown as a made example — yours will be made fresh for you.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoodies', type: 'Hoodie', name: 'Embroidered Hoodie — Design 1', priceText: 'From $42', images: ['emb-hoodie1.jpeg'], desc: 'Shown as a made example — yours will be embroidered fresh to your spec.', tag: 'Reference Design' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoodies', type: 'Hoodie', name: 'Embroidered Hoodie — Design 2', priceText: 'From $42', images: ['emb-hoodie2.jpeg'], desc: 'Shown as a made example — yours will be embroidered fresh to your spec.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'hoodies', type: 'Hoodie', name: 'Embroidered Hoodie — Design 3', priceText: 'From $42', images: ['emb-hoodie3.jpeg'], desc: 'Shown as a made example — yours will be embroidered fresh to your spec.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'handkerchiefs', type: 'Handkerchief', name: 'Embroidered Handkerchief — Design 1', priceText: 'From $9', images: ['emb-handkerchief1.jpeg'], desc: 'Shown as a made example — yours will be stitched fresh to your spec.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'handkerchiefs', type: 'Handkerchief', name: 'Embroidered Handkerchief — Design 2', priceText: 'From $9', images: ['emb-handkerchief2.jpeg'], desc: 'Shown as a made example — yours will be stitched fresh to your spec.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'tshirts', type: 'T-Shirt', name: 'Embroidered T-Shirt — Design 1', priceText: 'From $28', images: ['emb-tshirt1.jpeg'], desc: 'Shown as a made example — yours will be embroidered fresh to your spec.' },
  { page: 'embroidery.html', pageLabel: 'Embroidery', category: 'shirts', type: 'Shirt', name: 'Embroidered Shirt — Design 1', priceText: 'From $36', images: ['emd-shirt1.jpeg'], desc: 'Shown as a made example — yours will be embroidered fresh to your spec.' },

  /* ---------------- Crochet ---------------- */
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'bookcovers', type: 'Book Cover', name: 'Crochet Book Cover — Design 1', priceText: 'From $16', images: ['cro-bookcover1.jpeg', 'cro-bookcover1.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'bookcovers', type: 'Book Cover', name: 'Crochet Book Cover — Design 2', priceText: 'From $16', images: ['cro-bookcover2.jpeg', 'cro-bookcover2.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'scarfs', type: 'Scarf', name: 'Crochet Scarf — Design 1', priceText: 'From $24', images: ['cro-scarf1.jpeg', 'cro-scarf1.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'scarfs', type: 'Scarf', name: 'Crochet Scarf — Design 2', priceText: 'From $24', images: ['cro-scarf2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'scarfs', type: 'Scarf', name: 'Crochet Scarf — Design 3', priceText: 'From $24', images: ['cro-scarf3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'scarfs', type: 'Scarf', name: 'Crochet Scarf — Design 4', priceText: 'From $24', images: ['cro-scarf4.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'scarfs', type: 'Scarf', name: 'Crochet Scarf with Accessory', priceText: 'From $28', images: ['cro-scarfwithaccessory1.jpeg'], desc: 'Scarf paired with a matching accessory, shown as a made example.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'phonecases', type: 'Phone Case', name: 'Crochet Phone Case — Design 1', priceText: 'From $14', images: ['cro-phonecase1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'phonecases', type: 'Phone Case', name: 'Crochet Phone Case — Design 2', priceText: 'From $14', images: ['cro-phonecase2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'phonecases', type: 'Phone Case', name: 'Crochet Phone Case — Other Design', priceText: 'From $14', images: ['other-phonecase-design.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'keychains', type: 'Keychain', name: 'Crochet Keychain — Design 1', priceText: 'From $8', images: ['cro-keychain1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'accessories', type: 'Accessory', name: 'Crochet Accessory — Design 1', priceText: 'From $12', images: ['cro-accessories.jpeg', 'cro-accessories1.1.jpeg', 'cro-accessories1.2.jpeg', 'cro-accessories1.3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'accessories', type: 'Accessory', name: 'Crochet Accessory — Design 2', priceText: 'From $12', images: ['cro-accessories2.jpeg', 'cro-accessories2.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'capscarfset', type: 'Cap & Scarf Set', name: 'Cap & Scarf Set — Design 1', priceText: 'From $32', images: ['cro-cap-scarf1.jpeg'], desc: 'Matching cap and scarf, shown as a made example.', tag: 'New' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'capscarfset', type: 'Cap & Scarf Set', name: 'Cap & Scarf Set — Design 2', priceText: 'From $32', images: ['cro-cap-scarf2.jpeg'], desc: 'Matching cap and scarf, shown as a made example.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'gloves', type: 'Glove', name: 'Crochet Glove — Design 1', priceText: 'From $18', images: ['cro-glove1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'crochet.html', pageLabel: 'Crochet', category: 'gloves', type: 'Glove', name: 'Crochet Glove — Design 2', priceText: 'From $18', images: ['cro-glove2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },

  /* ---------------- Jewellery ---------------- */
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 1', priceText: 'From $85', images: ['jew-bridal1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Reference Design' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 2', priceText: 'From $85', images: ['jew-bridal2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 3', priceText: 'From $85', images: ['jew-bridal3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 4', priceText: 'From $85', images: ['jew-bridal4.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 5', priceText: 'From $85', images: ['jew-bridal5.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bridal', type: 'Bridal Set', name: 'Resin Bridal Set — Design 6', priceText: 'From $85', images: ['jew-bridal-6.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumkas', type: 'Jhumka', name: 'Resin Jhumka — Design 1', priceText: 'From $22', images: ['jew-jhumke1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumkas', type: 'Jhumka', name: 'Resin Jhumka — Design 2', priceText: 'From $22', images: ['jew-jhumke2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumkas', type: 'Jhumka', name: 'Resin Jhumka — Design 3', priceText: 'From $22', images: ['jew-jhumke3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumkas', type: 'Jhumka', name: 'Resin Jhumka — Design 4', priceText: 'From $22', images: ['jew-jhumke4.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumkas', type: 'Jhumka', name: 'Resin Jhumka — Design 5', priceText: 'From $22', images: ['jew-jhumke5.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumka-pendant-set', type: 'Jhumka Pendant Set', name: 'Jhumka Pendant Set — Design 1', priceText: 'From $30', images: ['jew-jhumke-pendant1.jpeg'], desc: 'Matching jhumka and pendant, shown as a made example.', tag: 'New' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumka-pendant-set', type: 'Jhumka Pendant Set', name: 'Jhumka Pendant Set — Design 2', priceText: 'From $30', images: ['jew-jhumke-pendant2.jpeg'], desc: 'Matching jhumka and pendant, shown as a made example.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumka-pendant-set', type: 'Jhumka Pendant Set', name: 'Jhumka Pendant Set — Design 3', priceText: 'From $30', images: ['jew-jhumke-pendant-3.jpeg'], desc: 'Matching jhumka and pendant, shown as a made example.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'jhumka-pendant-set', type: 'Jhumka Pendant Set', name: 'Jhumka Pendant Set — Design 4', priceText: 'From $30', images: ['jew-jhumke-pendant4.jpeg'], desc: 'Matching jhumka and pendant, shown as a made example.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'pendants', type: 'Pendant', name: 'Resin Pendant — Design 1', priceText: 'From $15', images: ['jew-pendant1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'pendants', type: 'Pendant', name: 'Resin Pendant — Design 2', priceText: 'From $15', images: ['jew-pendant2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bangles', type: 'Bangle', name: 'Resin Bangle', priceText: 'From $20', images: [], desc: 'Made to order — photos coming soon.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'rings', type: 'Ring', name: 'Resin Ring', priceText: 'From $18', images: [], desc: 'Made to order — photos coming soon.' },
  { page: 'jewellery.html', pageLabel: 'Jewellery', category: 'bracelets', type: 'Bracelet', name: 'Resin Bracelet', priceText: 'From $16', images: [], desc: 'Made to order — photos coming soon.' },

  /* ---------------- Ribbon Art ---------------- */
  { page: 'ribbon.html', pageLabel: 'Ribbon Art', category: 'ribbon', type: 'Ribbon Art', name: 'Ribbon Art — Design 1', priceText: 'From $12', images: ['ribbon-1.jpeg', 'ribbon1.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
  { page: 'ribbon.html', pageLabel: 'Ribbon Art', category: 'ribbon', type: 'Ribbon Art', name: 'Ribbon Art — Design 2', priceText: 'From $12', images: ['ribbon2.jpeg', 'ribbon2.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'ribbon.html', pageLabel: 'Ribbon Art', category: 'ribbon', type: 'Ribbon Art', name: 'Ribbon Art — Design 3', priceText: 'From $12', images: ['ribbon3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'ribbon.html', pageLabel: 'Ribbon Art', category: 'ribbon', type: 'Ribbon Art', name: 'Ribbon Art — Design 4', priceText: 'From $14', images: ['ribbon4.jpeg', 'ribbon4.1.jpeg', 'ribbon4.2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'ribbon.html', pageLabel: 'Ribbon Art', category: 'ribbon', type: 'Ribbon Art', name: 'Ribbon Art — Design 5', priceText: 'From $12', images: ['ribbon5.jpeg', 'ribbon5.1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },

  /* ---------------- Birthday Gifts ---------------- */
  { page: 'birthday-gifts.html', pageLabel: 'Birthday Gifts', category: 'birthday', type: 'Birthday Gift', name: 'Birthday Gift — Design 1', priceText: 'From $20', images: ['birthday1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'birthday-gifts.html', pageLabel: 'Birthday Gifts', category: 'birthday', type: 'Birthday Gift', name: 'Birthday Gift — Design 2', priceText: 'From $20', images: ['birthday2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'birthday-gifts.html', pageLabel: 'Birthday Gifts', category: 'birthday', type: 'Birthday Gift', name: 'Birthday Gift — Design 3', priceText: 'From $20', images: ['birthday3.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },

  /* ---------------- Resin Gift Preservation ---------------- */
  { page: 'resin-gift-preservation.html', pageLabel: 'Resin Gift Preservation', category: 'resin', type: 'Resin Gift Preservation', name: 'Resin Gift Preservation — Design 1', priceText: 'From $28', images: ['rasin-gift1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'Best Seller' },
  { page: 'resin-gift-preservation.html', pageLabel: 'Resin Gift Preservation', category: 'resin', type: 'Resin Gift Preservation', name: 'Resin Gift Preservation — Design 2', priceText: 'From $28', images: ['rasin-giftpreservation1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },
  { page: 'resin-gift-preservation.html', pageLabel: 'Resin Gift Preservation', category: 'resin', type: 'Resin Gift Preservation', name: 'Resin Gift Preservation — Design 3', priceText: 'From $28', images: ['rasin-giftpreservation2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },

  /* ---------------- Calligraphy ---------------- */
  { page: 'calligraphy.html', pageLabel: 'Calligraphy', category: 'calligraphy', type: 'Name Calligraphy', name: 'Custom Name Calligraphy', priceText: 'From $14', images: ['calli-name1.jpeg'], desc: 'A name or short phrase, hand-lettered — shown as a made example.', tag: 'New' },
  { page: 'calligraphy.html', pageLabel: 'Calligraphy', category: 'calligraphy', type: 'Photo & Quote Calligraphy', name: 'Custom Photo / Quote Calligraphy', priceText: 'From $18', images: ['calli-photo1.jpeg'], desc: 'A photo paired with hand-lettered text — shown as a made example.' },

  /* ---------------- Car Hangings ---------------- */
  { page: 'car-hangings.html', pageLabel: 'Car Hangings', category: 'car-hangings', type: 'Car Hanging', name: 'Car Hanging — Design 1', priceText: 'From $10', images: ['car-hanging1.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
  { page: 'car-hangings.html', pageLabel: 'Car Hangings', category: 'car-hangings', type: 'Car Hanging', name: 'Car Hanging — Design 2', priceText: 'From $10', images: ['car-hanging2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.' },

  /* ---------------- Nikkah Dupatta ---------------- */
  { page: 'nikkah-dupatta.html', pageLabel: 'Nikkah Dupatta', category: 'nikkah', type: 'Nikkah Dupatta', name: 'Nikkah Dupatta — Design 1', priceText: 'From $45', images: ['nikkah-dupatta1.jpeg', 'nikkah-dupatta1.1.jpeg', 'nikkah-dupatta1.2.jpeg'], desc: 'Shown as a made example — yours will be made fresh for you.', tag: 'New' },
];

// Finalize: compute id + numeric price for every product, matching script.js's parsePrice/slugify exactly.
const KONGPOSH_PRODUCTS = KONGPOSH_PRODUCTS_RAW.map(p => {
  const priceMatch = (p.priceText || '').match(/[\d.]+/);
  return Object.assign({}, p, {
    id: kpSlugify(p.name, p.page),
    price: priceMatch ? parseFloat(priceMatch[0]) : 0,
  });
});

function kpGetProductById(id) {
  return KONGPOSH_PRODUCTS.find(p => p.id === id) || null;
}

function kpGetRelated(product, limit) {
  if (!product) return [];
  limit = limit || 4;
  const sameType = KONGPOSH_PRODUCTS.filter(p => p.id !== product.id && p.page === product.page && p.type === product.type);
  const sameCategory = KONGPOSH_PRODUCTS.filter(p => p.id !== product.id && p.page === product.page && p.category === product.category && p.type !== product.type);
  const samePage = KONGPOSH_PRODUCTS.filter(p => p.id !== product.id && p.page === product.page && p.category !== product.category);
  const seen = new Set();
  const result = [];
  [...sameType, ...sameCategory, ...samePage].forEach(p => {
    if (!seen.has(p.id) && result.length < limit) { seen.add(p.id); result.push(p); }
  });
  return result;
}

// Top-level `const`/`let` do NOT create properties on `window` the way `var` does —
// explicitly attach here so any code checking `window.KONGPOSH_PRODUCTS` (e.g. the
// lazy-loaded search overlay in script.js) sees it as soon as this file has run.
if (typeof window !== 'undefined') {
  window.KONGPOSH_PRODUCTS = KONGPOSH_PRODUCTS;
  window.kpGetProductById = kpGetProductById;
  window.kpGetRelated = kpGetRelated;
}
