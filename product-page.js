/* =========================================================
   product.html renderer
   Runs after script.js (which already wired header/drawers,
   wishlist/order-list logic, and exposed window.KP for reuse).
   Reads ?id= from the URL and renders the matching product
   from products-data.js, plus a "You May Also Like" row.
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const product = id ? kpGetProductById(id) : null;
  const layout = document.getElementById('pd-layout');

  if (!product) {
    layout.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 0;">
        <h1 style="font-size:1.6rem;">We couldn't find that design</h1>
        <p class="card-desc">It may have been renamed or removed. Browse our full collections instead.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:10px;">Back to Home</a>
      </div>`;
    document.getElementById('pd-related-grid').closest('section').style.display = 'none';
    document.getElementById('pd-recently-viewed-section').style.display = 'none';
    document.title = 'Design not found — KONGPOSH';
    return;
  }

  document.title = `${product.name} — KONGPOSH`;

  /* ---------- Breadcrumb ---------- */
  const crumb = document.getElementById('pd-breadcrumb');
  crumb.innerHTML = `
    <a href="index.html">Home</a>
    <span class="crumb-sep">/</span>
    <a href="${product.page}">${product.pageLabel}</a>
    <span class="crumb-sep">/</span>
    <span class="crumb-current">${product.name}</span>
  `;

  /* ---------- Gallery ---------- */
  const images = product.images && product.images.length ? product.images : [];
  const mainImgTag = document.getElementById('pd-main-img-tag');
  const thumbsEl = document.getElementById('pd-thumbs');
  const tagEl = document.getElementById('pd-tag');

  if (images.length) {
    mainImgTag.src = images[0];
    mainImgTag.alt = product.name;
  } else {
    document.getElementById('pd-main-img').innerHTML = `<div class="img-placeholder" data-label="Photo coming soon"></div>`;
  }
  if (product.tag) {
    tagEl.textContent = product.tag;
    tagEl.style.display = 'inline-block';
    tagEl.className = 'tag ' + (product.tag === 'Best Seller' ? 'tag-gold' : product.tag === 'New' ? 'tag-sage' : 'tag-gold');
  }
  if (images.length > 1) {
    images.forEach((src, i) => {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.alt = `${product.name} view ${i + 1}`;
      if (i === 0) thumb.classList.add('active');
      thumb.addEventListener('click', () => {
        mainImgTag.src = src;
        thumbsEl.querySelectorAll('img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      thumbsEl.appendChild(thumb);
    });
  }

  /* ---------- Info ---------- */
  document.getElementById('pd-type').textContent = product.type;
  document.getElementById('pd-name').textContent = product.name;
  document.getElementById('pd-price').textContent = product.priceText;
  document.getElementById('pd-desc').textContent = product.desc || '';

  const categoryPage = product.page;
  document.getElementById('pd-back-link').href = categoryPage;
  document.getElementById('pd-customize-btn').href =
    `${categoryPage}?design=${encodeURIComponent(product.name)}&type=${encodeURIComponent(product.type)}#custom-order`;

  /* ---------- Quantity selector ---------- */
  const qtyInput = document.getElementById('pd-qty-input');
  const qtyMinus = document.getElementById('pd-qty-minus');
  const qtyPlus = document.getElementById('pd-qty-plus');

  function getQty() {
    const val = parseInt(qtyInput.value, 10);
    return (!val || val < 1) ? 1 : val;
  }
  function setQty(val) {
    qtyInput.value = Math.max(1, val);
    syncStickyBar();
  }
  qtyMinus.addEventListener('click', () => setQty(getQty() - 1));
  qtyPlus.addEventListener('click', () => setQty(getQty() + 1));
  qtyInput.addEventListener('change', () => setQty(getQty()));

  /* ---------- Wishlist / Order List actions ----------
     window.KP is exposed by script.js after its own DOMContentLoaded
     handler runs (script.js is loaded before this file, so its
     listener fires first). Re-uses the exact same storage, ids and
     toasts as every category page, so items match up either way. */
  const item = {
    id: product.id,
    name: product.name,
    priceText: product.priceText,
    price: product.price,
    img: images[0] || '',
    page: product.page,
  };

  const wishBtn = document.getElementById('pd-wish-btn');
  const listBtn = document.getElementById('pd-list-btn');
  const buyNowBtn = document.getElementById('pd-buy-now-btn');

  function syncWishBtn() {
    let saved = false;
    try {
      const raw = localStorage.getItem('kongposh_wishlist');
      const list = raw ? JSON.parse(raw) : [];
      saved = list.some(i => i.id === item.id);
    } catch (e) { /* storage unavailable */ }
    wishBtn.classList.toggle('added', saved);
    wishBtn.querySelector('.btn-label').textContent = saved ? 'Saved to Wishlist' : 'Save to Wishlist';
  }
  function syncListBtn() {
    let inList = false;
    try {
      const raw = localStorage.getItem('kongposh_order_list');
      const list = raw ? JSON.parse(raw) : [];
      inList = list.some(i => i.id === item.id);
    } catch (e) { /* storage unavailable */ }
    listBtn.classList.toggle('added', inList);
    listBtn.querySelector('.btn-label').textContent = inList ? 'Added' : 'Add to List';
  }

  wishBtn.addEventListener('click', () => {
    if (window.KP && window.KP.toggleWishlist) window.KP.toggleWishlist(item);
    syncWishBtn();
  });
  listBtn.addEventListener('click', () => {
    const qty = getQty();
    if (window.KP && window.KP.addToOrderList) window.KP.addToOrderList(Object.assign({}, item, { qty }), listBtn);
    syncListBtn();
  });
  syncWishBtn();
  syncListBtn();

  /* ---------- Buy Now — fast single-item WhatsApp inquiry, bypasses the
     shared Order List entirely so it never mixes with other saved designs. ---------- */
  function buyNowMessage() {
    const qty = getQty();
    const qtyPrefix = qty > 1 ? `${qty}x ` : '';
    return `Hi KONGPOSH! I'd like to order:\n\n${qtyPrefix}${product.name} (${product.priceText})\n\nPlease let me know the next steps.`;
  }
  function openBuyNow() {
    const number = (window.KP && window.KP.WHATSAPP_NUMBER) || '919103830394';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(buyNowMessage())}`, '_blank');
  }
  buyNowBtn.addEventListener('click', openBuyNow);

  /* ---------- Sticky mobile bar — mirrors Buy Now, shown only on small screens via CSS ---------- */
  const stickyBar = document.getElementById('pd-sticky-bar');
  const stickyPriceText = document.getElementById('pd-sticky-price-text');
  const stickyBuyBtn = document.getElementById('pd-sticky-buy-btn');
  function syncStickyBar() {
    const qty = getQty();
    stickyPriceText.textContent = qty > 1 ? `${product.priceText} × ${qty}` : product.priceText;
  }
  stickyBuyBtn.addEventListener('click', openBuyNow);
  syncStickyBar();
  document.body.classList.add('has-sticky-bar');

  /* ---------- Recently Viewed ----------
     Tracks every product page visit in localStorage (most-recent-first, capped),
     then renders everyone else's history here, excluding the current product. */
  const RECENTLY_VIEWED_KEY = 'kongposh_recently_viewed';
  function recordRecentlyViewed() {
    let list = [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) { list = []; }
    list = list.filter(p => p.id !== product.id);
    list.unshift({ id: product.id, name: product.name, priceText: product.priceText, img: images[0] || '', desc: product.desc || '' });
    list = list.slice(0, 8);
    try { localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }
  function renderRecentlyViewed() {
    let list = [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) { list = []; }
    list = list.filter(p => p.id !== product.id).slice(0, 4);
    const section = document.getElementById('pd-recently-viewed-section');
    const grid = document.getElementById('pd-recently-viewed-grid');
    if (!list.length) {
      section.style.display = 'none';
      return;
    }
    list.forEach(p => {
      const card = document.createElement('a');
      card.className = 'product-card';
      card.style.textDecoration = 'none';
      card.href = `product.html?id=${encodeURIComponent(p.id)}`;
      card.innerHTML = `
        <div class="card-media">
          ${p.img ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
                  : `<div class="img-placeholder" data-label="Photo coming soon"></div>`}
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p class="card-desc">${p.desc || ''}</p>
          <div class="card-foot"><span class="price">${p.priceText}</span></div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  renderRecentlyViewed(); // render before recording, so current product never shows in its own history
  recordRecentlyViewed();

  /* ---------- You May Also Like ---------- */
  const relatedGrid = document.getElementById('pd-related-grid');
  const related = kpGetRelated(product, 4);
  if (!related.length) {
    relatedGrid.closest('section').style.display = 'none';
  } else {
    related.forEach(p => {
      const img = (p.images && p.images[0]) || '';
      const card = document.createElement('a');
      card.className = 'product-card';
      card.style.textDecoration = 'none';
      card.href = `product.html?id=${encodeURIComponent(p.id)}`;
      card.innerHTML = `
        <div class="card-media">
          ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
                : `<div class="img-placeholder" data-label="Photo coming soon"></div>`}
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p class="card-desc">${p.desc || ''}</p>
          <div class="card-foot"><span class="price">${p.priceText}</span></div>
        </div>
      `;
      relatedGrid.appendChild(card);
    });
  }
});
