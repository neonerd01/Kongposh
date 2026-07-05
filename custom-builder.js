/* =========================================================
   custom-builder.js — Custom Product Builder
   Runs after script.js (products-data.js is loaded directly on
   this page, so KONGPOSH_PRODUCTS is available immediately —
   no lazy-loading needed here, unlike the search overlay).
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const COLOR_PALETTE = [
    'Ivory', 'Sage Green', 'Rust Red', 'Gold', 'Charcoal',
    'Blush Pink', 'Sky Blue', 'Maroon', 'Mustard', 'Lavender',
  ];

  const state = {
    categoryPage: '',
    categoryLabel: '',
    type: '',
    design: null, // a KONGPOSH_PRODUCTS entry, or null for "fully original"
    colors: new Set(),
    size: 'One Size / Not Applicable',
    notes: '',
  };

  const categorySelect = document.getElementById('cb-category-select');
  const typeSelect = document.getElementById('cb-type-select');
  const designGrid = document.getElementById('cb-design-grid');
  const colorsRow = document.getElementById('cb-colors');
  const sizeSelect = document.getElementById('cb-size-select');
  const sizeCustomInput = document.getElementById('cb-size-custom');
  const notesEl = document.getElementById('cb-notes');

  /* ---------- Step 1: Categories ---------- */
  const categories = [];
  const seenPages = new Set();
  KONGPOSH_PRODUCTS.forEach(p => {
    if (!seenPages.has(p.page)) {
      seenPages.add(p.page);
      categories.push({ page: p.page, label: p.pageLabel });
    }
  });
  categories.sort((a, b) => a.label.localeCompare(b.label));

  categorySelect.innerHTML = '<option value="">Choose a category…</option>' +
    categories.map(c => `<option value="${c.page}">${c.label}</option>`).join('');

  categorySelect.addEventListener('change', () => {
    const chosen = categories.find(c => c.page === categorySelect.value);
    state.categoryPage = chosen ? chosen.page : '';
    state.categoryLabel = chosen ? chosen.label : '';
    state.type = '';
    state.design = null;
    populateTypes();
    renderDesignGrid();
    updateSummary();
  });

  /* ---------- Step 2: Types (depend on category) ---------- */
  function populateTypes() {
    if (!state.categoryPage) {
      typeSelect.innerHTML = '<option value="">Pick a category first</option>';
      typeSelect.disabled = true;
      return;
    }
    const types = [];
    const seenTypes = new Set();
    KONGPOSH_PRODUCTS.filter(p => p.page === state.categoryPage).forEach(p => {
      if (!seenTypes.has(p.type)) { seenTypes.add(p.type); types.push(p.type); }
    });
    typeSelect.disabled = false;
    typeSelect.innerHTML = '<option value="">Choose a type…</option>' +
      types.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  typeSelect.addEventListener('change', () => {
    state.type = typeSelect.value;
    state.design = null;
    renderDesignGrid();
    updateSummary();
  });

  /* ---------- Step 3: Reference design picker ---------- */
  function renderDesignGrid() {
    if (!state.categoryPage || !state.type) {
      designGrid.innerHTML = '<p class="cart-empty">Pick a category and type above to see reference designs.</p>';
      return;
    }
    const options = KONGPOSH_PRODUCTS.filter(p => p.page === state.categoryPage && p.type === state.type);
    const originalCard = `
      <button type="button" class="cb-design-card cb-design-original active" data-design-id="">
        <div class="cb-design-original-icon">✎</div>
        <div class="cb-design-name">Fully Original</div>
        <div class="cb-design-price">No reference photo</div>
      </button>`;
    const designCards = options.map(p => {
      const img = (p.images && p.images[0]) || '';
      return `
        <button type="button" class="cb-design-card" data-design-id="${p.id}">
          ${img ? `<img src="${img}" alt="${p.name}">` : `<div class="cb-design-noimg"></div>`}
          <div class="cb-design-name">${p.name}</div>
          <div class="cb-design-price">${p.priceText}</div>
        </button>`;
    }).join('');
    designGrid.innerHTML = originalCard + designCards;

    designGrid.querySelectorAll('.cb-design-card').forEach(card => {
      card.addEventListener('click', () => {
        designGrid.querySelectorAll('.cb-design-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const id = card.dataset.designId;
        state.design = id ? KONGPOSH_PRODUCTS.find(p => p.id === id) : null;
        updateSummary();
      });
    });
  }

  /* ---------- Step 4: Colors ---------- */
  colorsRow.innerHTML = COLOR_PALETTE.map(c => `<button type="button" class="cb-chip" data-color="${c}">${c}</button>`).join('');
  colorsRow.querySelectorAll('.cb-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const color = chip.dataset.color;
      if (state.colors.has(color)) { state.colors.delete(color); chip.classList.remove('active'); }
      else { state.colors.add(color); chip.classList.add('active'); }
      updateSummary();
    });
  });

  /* ---------- Step 5: Size ---------- */
  sizeSelect.addEventListener('change', () => {
    if (sizeSelect.value === 'custom') {
      sizeCustomInput.style.display = 'block';
      state.size = sizeCustomInput.value.trim() || 'Custom (see notes)';
    } else {
      sizeCustomInput.style.display = 'none';
      state.size = sizeSelect.value;
    }
    updateSummary();
  });
  sizeCustomInput.addEventListener('input', () => {
    state.size = sizeCustomInput.value.trim() || 'Custom (unspecified)';
    updateSummary();
  });

  /* ---------- Step 6: Notes ---------- */
  notesEl.addEventListener('input', () => {
    state.notes = notesEl.value.trim();
    updateSummary();
  });

  /* ---------- Live summary ---------- */
  function updateSummary() {
    document.getElementById('cb-sum-category').textContent = state.categoryLabel || '—';
    document.getElementById('cb-sum-type').textContent = state.type || '—';

    const designRow = document.getElementById('cb-sum-design-row');
    if (state.design) {
      designRow.style.display = 'flex';
      document.getElementById('cb-sum-design-img').src = (state.design.images && state.design.images[0]) || '';
      document.getElementById('cb-sum-design-name').textContent = state.design.name;
      document.getElementById('cb-sum-design-price').textContent = state.design.priceText + ' (starting)';
    } else {
      designRow.style.display = 'none';
    }

    document.getElementById('cb-sum-colors').textContent = state.colors.size ? Array.from(state.colors).join(', ') : '—';
    document.getElementById('cb-sum-size').textContent = state.size || '—';
    document.getElementById('cb-sum-notes').textContent = state.notes || '—';
  }

  /* ---------- Validation ---------- */
  function validate() {
    if (!state.categoryPage || !state.type) {
      if (window.KP) window.KP.showToast('Please choose a category and product type first');
      return false;
    }
    return true;
  }

  function buildDescriptionLines() {
    const lines = [];
    lines.push(`Category: ${state.categoryLabel}`);
    lines.push(`Type: ${state.type}`);
    lines.push(state.design ? `Reference design: ${state.design.name}` : 'Reference design: Fully original (no reference)');
    lines.push(`Colors: ${state.colors.size ? Array.from(state.colors).join(', ') : 'Not specified'}`);
    lines.push(`Size: ${state.size}`);
    if (state.notes) lines.push(`Notes: ${state.notes}`);
    return lines;
  }

  /* ---------- Add to Custom Order List ---------- */
  document.getElementById('cb-add-btn').addEventListener('click', () => {
    if (!validate()) return;
    const colorSummary = state.colors.size ? ` (${Array.from(state.colors).join(', ')})` : '';
    const name = state.design
      ? `Custom ${state.type} — based on ${state.design.name}${colorSummary}`
      : `Custom ${state.type} — Original Design${colorSummary}`;
    const item = {
      id: 'custom-build::' + (state.categoryPage + '::' + state.type + '::' + Date.now())
        .toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      priceText: state.design ? `${state.design.priceText} (starting)` : 'Custom quote',
      price: state.design ? state.design.price : 0,
      img: state.design && state.design.images ? state.design.images[0] || '' : '',
      page: state.categoryPage,
      builderDetails: buildDescriptionLines(),
    };
    if (window.KP && window.KP.addToOrderList) {
      window.KP.addToOrderList(item);
    }
  });

  /* ---------- Send via WhatsApp Now ---------- */
  document.getElementById('cb-whatsapp-btn').addEventListener('click', () => {
    if (!validate()) return;
    const number = (window.KP && window.KP.WHATSAPP_NUMBER) || '910000000000';
    const lines = buildDescriptionLines();
    const message = `Hi KONGPOSH! I'd like to build a custom piece:\n\n${lines.join('\n')}\n\nCould you help me with next steps and pricing?`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  updateSummary();
});
