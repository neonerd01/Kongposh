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
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mainNav.style.display = '';
      });
    });
  }

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

  /* ---------- Cart ---------- */
  let cart = []; // { name, price, qty }
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
    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
    } else {
      cartEmptyEl.style.display = 'none';
      cart.forEach((item, i) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML = `
          <div>
            <div class="cart-line-name">${item.name}</div>
            <div class="cart-line-qty">Qty ${item.qty} · $${item.price} each</div>
          </div>
          <button class="cart-line-remove" data-index="${i}">Remove</button>
        `;
        cartItemsEl.appendChild(line);
      });
      cartItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = Number(e.target.dataset.index);
          cart.splice(idx, 1);
          renderCart();
        });
      });
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = `$${total}`;
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;
  }

  function addToCart(name, price, btn) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    renderCart();
    showToast(`${name} added to bag`);
    if (btn) {
      btn.classList.add('added');
      btn.textContent = 'Added';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = 'Add';
      }, 1200);
    }
  }

  // FIX: only wire up real "Add to cart" buttons (ones with data-name/data-price).
  // "Choose This Design" buttons reuse the .btn-add class for styling only and
  // have their own onclick="chooseDesign(...)" handler — without this filter,
  // clicking them was also silently triggering a broken addToCart(undefined, NaN) call.
  document.querySelectorAll('.btn-add[data-name]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      addToCart(name, price, btn);
    });
  });

  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your bag is empty');
      return;
    }
    showToast('Checkout is not connected yet — this is a UI demo');
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

  renderCart();
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
