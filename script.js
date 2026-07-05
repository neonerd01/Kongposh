document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mainNav.classList.toggle('mobile-open', isOpen);
      mainNav.style.display = isOpen ? 'flex' : '';
      if (isOpen) {
        mainNav.style.position = 'absolute';
        mainNav.style.top = '76px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.flexDirection = 'column';
        mainNav.style.background = '#EFE7D8';
        mainNav.style.padding = '18px 28px';
        mainNav.style.borderBottom = '1px solid rgba(43,38,32,0.14)';
        mainNav.style.gap = '16px';
      }
    });
    mainNav.querySelectorAll('a:not(.nav-more-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mainNav.style.display = '';
      });
    });
  }

  /* ---------- "More" nav dropdown ---------- */
  document.querySelectorAll('.nav-more-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggle.parentElement.classList.toggle('open');
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  });

  /* ---------- Product filtering ---------- */
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.product-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Storage helpers ---------- */
  const ORDER_LIST_KEY = 'kongposh_order_list';
  const WISHLIST_KEY = 'kongposh_wishlist';

  function loadItems(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveItems(key, items) {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
  }
  function slugify(name, page) {
    return (page + '::' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  // Just the filename (e.g. "embroidery.html"), never the full path — so ids
  // stay identical whether the site is hosted at the domain root or in a
  // subfolder (e.g. GitHub Pages project sites like /Kongposh/embroidery.html).
  function currentPageFile() {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : 'index.html';
  }
  function parsePrice(text) {
    const match = (text || '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /* ---------- Custom Order List (replaces traditional cart — every piece here is made to order, not fixed stock) ---------- */
  let orderList = loadItems(ORDER_LIST_KEY);
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartTotalEl = document.getElementById('cart-total');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('cart-toggle').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function renderCart() {
    cartItemsEl.querySelectorAll('.cart-line').forEach(el => el.remove());
    if (orderList.length === 0) {
      cartEmptyEl.style.display = 'block';
    } else {
      cartEmptyEl.style.display = 'none';
      orderList.forEach((item) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML = `
          ${item.img ? `<img class="cart-line-img" src="${item.img}" alt="">` : ''}
          <div class="cart-line-body">
            <div class="cart-line-name">${item.name}</div>
            <div class="cart-line-qty">${item.priceText || ''}</div>
          </div>
          <button class="cart-line-remove" data-id="${item.id}">Remove</button>
        `;
        cartItemsEl.appendChild(line);
      });
      cartItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          removeFromOrderList(e.target.dataset.id);
        });
      });
    }
    const total = orderList.reduce((sum, item) => sum + (item.price || 0), 0);
    cartTotalEl.textContent = `$${total}`;
    cartCountEl.textContent = orderList.length;
    syncListButtons();
  }

  function addToOrderList(item, btn) {
    const exists = orderList.find(i => i.id === item.id);
    if (exists) {
      showToast(`${item.name} is already in your Custom Order List`);
      return;
    }
    orderList.push(item);
    saveItems(ORDER_LIST_KEY, orderList);
    renderCart();
    showToast(`${item.name} added to your Custom Order List`);
    if (btn) {
      btn.classList.add('added');
      const label = btn.querySelector('.btn-label');
      if (label) label.textContent = 'Added';
      setTimeout(() => {
        btn.classList.remove('added');
        if (label) label.textContent = 'Add to List';
      }, 1400);
    }
  }

  function removeFromOrderList(id) {
    orderList = orderList.filter(i => i.id !== id);
    saveItems(ORDER_LIST_KEY, orderList);
    renderCart();
  }

  // Keep every "+ Add to List" button in sync with what's actually stored (e.g. after removing via the drawer)
  function syncListButtons() {
    document.querySelectorAll('.btn-list-add[data-item-id]').forEach(btn => {
      const inList = orderList.some(i => i.id === btn.dataset.itemId);
      btn.classList.toggle('added', inList);
      const label = btn.querySelector('.btn-label');
      if (label) label.textContent = inList ? 'Added' : 'Add to List';
    });
  }

  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (orderList.length === 0) {
      showToast('Your Custom Order List is empty');
      return;
    }
    // TODO: replace with your real WhatsApp number (country code + number, no + or spaces)
    const WHATSAPP_NUMBER = '910000000000';
    const lines = orderList.map((item, i) => `${i + 1}. ${item.name} (${item.priceText || 'price on request'})`);
    const message = `Hi KONGPOSH! I'd like to start a custom order for:\n\n${lines.join('\n')}\n\nPlease let me know the next steps.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------- Newsletter ---------- */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("You're on the list — thank you");
      newsletterForm.reset();
    });
  }

  /* ---------- Wishlist ---------- */
  let wishlist = loadItems(WISHLIST_KEY);
  const wishCountEl = document.getElementById('wishlist-count');
  const wishItemsEl = document.getElementById('wishlist-items');
  const wishEmptyEl = document.getElementById('wishlist-empty');
  const wishDrawer = document.getElementById('wishlist-drawer');
  const wishOverlay = document.getElementById('wishlist-overlay');

  function openWishlist() {
    wishDrawer.classList.add('open');
    wishOverlay.classList.add('open');
    wishDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeWishlist() {
    wishDrawer.classList.remove('open');
    wishOverlay.classList.remove('open');
    wishDrawer.setAttribute('aria-hidden', 'true');
  }
  const wishToggleBtn = document.getElementById('wishlist-toggle');
  if (wishToggleBtn) {
    wishToggleBtn.addEventListener('click', openWishlist);
    document.getElementById('wishlist-close').addEventListener('click', closeWishlist);
    wishOverlay.addEventListener('click', closeWishlist);
  }

  function renderWishlist() {
    if (!wishItemsEl) return;
    wishItemsEl.querySelectorAll('.cart-line').forEach(el => el.remove());
    if (wishlist.length === 0) {
      wishEmptyEl.style.display = 'block';
    } else {
      wishEmptyEl.style.display = 'none';
      wishlist.forEach((item) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML = `
          ${item.img ? `<img class="cart-line-img" src="${item.img}" alt="">` : ''}
          <div class="cart-line-body">
            <div class="cart-line-name">${item.name}</div>
            <div class="cart-line-qty">${item.priceText || ''}</div>
          </div>
          <button class="cart-line-remove" data-id="${item.id}">Remove</button>
        `;
        wishItemsEl.appendChild(line);
      });
      wishItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
        btn.addEventListener('click', (e) => toggleWishlist(
          wishlist.find(i => i.id === e.target.dataset.id)
        ));
      });
    }
    if (wishCountEl) wishCountEl.textContent = wishlist.length;
    syncWishButtons();
  }

  function toggleWishlist(item, btn) {
    const idx = wishlist.findIndex(i => i.id === item.id);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast(`${item.name} removed from wishlist`);
    } else {
      wishlist.push(item);
      showToast(`${item.name} saved to wishlist`);
    }
    saveItems(WISHLIST_KEY, wishlist);
    renderWishlist();
  }

  function syncWishButtons() {
    document.querySelectorAll('.wish-btn[data-item-id]').forEach(btn => {
      const saved = wishlist.some(i => i.id === btn.dataset.itemId);
      btn.classList.toggle('active', saved);
    });
  }

  const shareBtn = document.getElementById('wishlist-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (wishlist.length === 0) {
        showToast('Your wishlist is empty');
        return;
      }
      const text = `My KONGPOSH wishlist:\n${wishlist.map(i => `• ${i.name}`).join('\n')}`;
      if (navigator.share) {
        try { await navigator.share({ title: 'My KONGPOSH Wishlist', text }); }
        catch (e) { /* user cancelled share — nothing to do */ }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast('Wishlist copied to clipboard');
      } else {
        showToast('Sharing is not supported on this browser');
      }
    });
  }

  const moveAllBtn = document.getElementById('wishlist-move-all-btn');
  if (moveAllBtn) {
    moveAllBtn.addEventListener('click', () => {
      if (wishlist.length === 0) {
        showToast('Your wishlist is empty');
        return;
      }
      let added = 0;
      wishlist.forEach(item => {
        if (!orderList.some(i => i.id === item.id)) {
          orderList.push(item);
          added++;
        }
      });
      saveItems(ORDER_LIST_KEY, orderList);
      renderCart();
      showToast(added > 0 ? `${added} design(s) added to your Custom Order List` : 'Already in your Custom Order List');
    });
  }

  /* ---------- Quick View modal (built once, reused for every card) ---------- */
  const qvOverlay = document.createElement('div');
  qvOverlay.className = 'qv-overlay';
  qvOverlay.id = 'qv-overlay';
  const qvModal = document.createElement('div');
  qvModal.className = 'qv-modal';
  qvModal.id = 'qv-modal';
  qvModal.setAttribute('aria-hidden', 'true');
  qvModal.innerHTML = `
    <button class="icon-btn qv-close" id="qv-close" aria-label="Close quick view">✕</button>
    <div class="qv-body">
      <div class="qv-gallery">
        <div class="qv-main-img"><img id="qv-main-img" src="" alt=""></div>
        <div class="qv-thumbs" id="qv-thumbs"></div>
      </div>
      <div class="qv-info">
        <h3 id="qv-name"></h3>
        <p class="price" id="qv-price"></p>
        <p class="card-desc" id="qv-desc"></p>
        <div class="qv-actions" id="qv-actions"></div>
      </div>
    </div>
  `;
  document.body.appendChild(qvOverlay);
  document.body.appendChild(qvModal);

  function closeQuickView() {
    qvOverlay.classList.remove('open');
    qvModal.classList.remove('open');
    qvModal.setAttribute('aria-hidden', 'true');
  }
  qvOverlay.addEventListener('click', closeQuickView);
  qvModal.querySelector('#qv-close').addEventListener('click', closeQuickView);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuickView();
  });

  function openQuickView({ item, images, desc, primaryBtn }) {
    const mainImgEl = qvModal.querySelector('#qv-main-img');
    const thumbsEl = qvModal.querySelector('#qv-thumbs');
    mainImgEl.src = images[0] || '';
    mainImgEl.alt = item.name;
    thumbsEl.innerHTML = '';
    if (images.length > 1) {
      images.forEach((src, i) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.alt = `${item.name} view ${i + 1}`;
        if (i === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => {
          mainImgEl.src = src;
          thumbsEl.querySelectorAll('img').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
        thumbsEl.appendChild(thumb);
      });
    }
    qvModal.querySelector('#qv-name').textContent = item.name;
    qvModal.querySelector('#qv-price').textContent = item.priceText;
    qvModal.querySelector('#qv-desc').textContent = desc || '';

    const actionsEl = qvModal.querySelector('#qv-actions');
    actionsEl.innerHTML = '';
    if (primaryBtn) {
      const clonedBtn = primaryBtn.cloneNode(true);
      clonedBtn.addEventListener('click', closeQuickView);
      actionsEl.appendChild(clonedBtn);
    }
    const qvListBtn = document.createElement('button');
    qvListBtn.className = 'btn-list-add';
    qvListBtn.type = 'button';
    qvListBtn.innerHTML = '<span aria-hidden="true">+</span><span class="btn-label">Add to List</span>';
    qvListBtn.addEventListener('click', () => addToOrderList(item, qvListBtn));
    actionsEl.appendChild(qvListBtn);

    const qvDetailsLink = document.createElement('a');
    qvDetailsLink.className = 'btn btn-ghost';
    qvDetailsLink.textContent = 'View Full Details';
    qvDetailsLink.href = `product.html?id=${encodeURIComponent(item.id)}`;
    actionsEl.appendChild(qvDetailsLink);

    qvOverlay.classList.add('open');
    qvModal.classList.add('open');
    qvModal.setAttribute('aria-hidden', 'false');
  }

  /* ---------- Inject wishlist heart + "Add to List" button onto every real product card ----------
     Runs generically so every category page benefits automatically — no per-page markup needed. */
  document.querySelectorAll('.product-card').forEach(card => {
    const media = card.querySelector('.card-media');
    const foot = card.querySelector('.card-foot');
    const nameEl = card.querySelector('.card-body h3');
    const priceEl = card.querySelector('.price');
    const imgEl = card.querySelector('.card-media img');
    if (!media || !foot || !nameEl || !priceEl) return; // skip non-product cards (e.g. review cards)

    const name = nameEl.textContent.trim();
    const priceText = priceEl.textContent.trim();
    const descEl = card.querySelector('.card-desc');
    const allImgs = Array.from(card.querySelectorAll('.card-media img')).map(el => el.getAttribute('src'));
    const pageFile = currentPageFile();
    const item = {
      id: slugify(name, pageFile),
      name,
      priceText,
      price: parsePrice(priceText),
      img: imgEl ? imgEl.getAttribute('src') : '',
      page: pageFile,
    };

    // "Customizable" badge — every KONGPOSH piece is made to order. Skip if a page
    // (like the homepage) already hardcoded one, so we don't duplicate it.
    if (!media.querySelector('.tag-customizable')) {
      const custTag = document.createElement('span');
      custTag.className = 'tag tag-customizable tag-right';
      custTag.textContent = 'Customizable';
      media.appendChild(custTag);
    }

    const wishBtn = document.createElement('button');
    wishBtn.className = 'wish-btn';
    wishBtn.type = 'button';
    wishBtn.setAttribute('aria-label', 'Save to wishlist');
    wishBtn.dataset.itemId = item.id;
    wishBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20.5s-7.5-4.6-9.8-9.4C.8 7.8 2.4 4.5 5.7 3.8c2-.4 3.9.5 5 2.1 1.1-1.6 3-2.5 5-2.1 3.3.7 4.9 4 3.5 7.3-2.3 4.8-9.8 9.4-9.8 9.4z"/></svg>';
    wishBtn.addEventListener('click', () => toggleWishlist(item));
    media.appendChild(wishBtn);

    const qvBtn = document.createElement('button');
    qvBtn.className = 'quick-view-btn';
    qvBtn.type = 'button';
    qvBtn.setAttribute('aria-label', `Quick view ${name}`);
    qvBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    qvBtn.addEventListener('click', () => openQuickView({
      item,
      images: allImgs.length ? allImgs : [item.img],
      desc: descEl ? descEl.textContent.trim() : '',
      primaryBtn: card.querySelector('.btn-add'),
    }));
    media.appendChild(qvBtn);

    // "View Details" link — sends the shopper to the full product.html page for this design.
    // Injected generically like everything else above, so no per-page HTML edits are needed.
    if (descEl && !card.querySelector('.view-details-link')) {
      const detailsLink = document.createElement('a');
      detailsLink.className = 'view-details-link';
      detailsLink.href = `product.html?id=${encodeURIComponent(item.id)}`;
      detailsLink.textContent = 'View Full Details →';
      descEl.insertAdjacentElement('afterend', detailsLink);
    }

    const listBtn = document.createElement('button');
    listBtn.className = 'btn-list-add';
    listBtn.type = 'button';
    listBtn.dataset.itemId = item.id;
    listBtn.innerHTML = '<span aria-hidden="true">+</span><span class="btn-label">Add to List</span>';
    listBtn.addEventListener('click', () => addToOrderList(item, listBtn));
    foot.appendChild(listBtn);
  });

  /* ---------- Cross-page "Customize This Design" handoff ----------
     product.html's Customize button links to
     <category-page>.html?design=NAME&type=TYPE#custom-order — this
     picks those query params up on load and pre-fills the form,
     the same way chooseDesign() does when clicking a card directly. */
  (function prefillFromQueryParams() {
    const params = new URLSearchParams(location.search);
    const design = params.get('design');
    const type = params.get('type');
    const designInput = document.getElementById('selected-design');
    const typeSelect = document.getElementById('product-type');
    if (!design && !type) return;
    if (designInput && design) designInput.value = design;
    if (typeSelect && type) typeSelect.value = type;
    if (designInput || typeSelect) {
      showToast(design ? `"${design}" selected — tell us how you'd like yours made below.` : 'Tell us how you\'d like yours made below.');
    }
  })();

  syncWishButtons();
  renderWishlist();
  renderCart();

  /* ---------- Expose shared helpers for product.html's own script ----------
     product-page.js (loaded after this file) calls these so wishlist/order-list
     behavior — storage, ids, toasts, header counts — stays identical everywhere. */
  window.KP = { addToOrderList, toggleWishlist, showToast };
});

/* ---------- Scroll reveal ---------- */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('reveal-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
})();

/* ---------- Animated stat counters ---------- */
(function () {
  const stats = document.querySelectorAll('.stat-num[data-count-to]');
  if (!stats.length || !('IntersectionObserver' in window)) return;
  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  stats.forEach(el => observer.observe(el));
})();

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) openItem.classList.remove('open');
    });
    item.classList.toggle('open', !wasOpen);
  });
});

/* ---------- Product photo sliders (multiple photos of one design) ----------
   Usage in HTML:
   <div class="card-slider" id="slider-xyz">
     <div class="slide active"><img src="..."></div>
     <div class="slide"><img src="..."></div>
     <button class="slider-arrow prev" onclick="moveSlide('slider-xyz',-1)">‹</button>
     <button class="slider-arrow next" onclick="moveSlide('slider-xyz',1)">›</button>
     <div class="slider-dots">
       <button class="slider-dot active" onclick="goToSlide('slider-xyz',0)"></button>
       <button class="slider-dot" onclick="goToSlide('slider-xyz',1)"></button>
     </div>
   </div>
------------------------------------------------------------------------- */
function moveSlide(sliderId, direction) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.slider-dot');
  let idx = Array.from(slides).findIndex(s => s.classList.contains('active'));
  if (idx === -1) idx = 0;
  slides[idx].classList.remove('active');
  if (dots[idx]) dots[idx].classList.remove('active');
  idx = (idx + direction + slides.length) % slides.length;
  slides[idx].classList.add('active');
  if (dots[idx]) dots[idx].classList.add('active');
}

function goToSlide(sliderId, targetIdx) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.slider-dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (slides[targetIdx]) slides[targetIdx].classList.add('active');
  if (dots[targetIdx]) dots[targetIdx].classList.add('active');
}
