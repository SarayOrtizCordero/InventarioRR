// Lógica principal del dashboard: categorías, modelos, variantes y ajustes de stock.

let categories = [];
let activeCategoryId = null;
let activeModel = null;
let categoryProducts = [];
const LOW_STOCK_THRESHOLD = 5;

const ICONS = {
  minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  history: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>',
  warning: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  chevron: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function initDashboard() {
  const session = await requireSession();
  if (!session) return;

  const profile = await getCurrentProfile();
  if (profile) {
    const avatarEl = document.getElementById('user-avatar');
    avatarEl.textContent = profile.full_name.trim().charAt(0).toUpperCase();
    avatarEl.title = profile.full_name;
  }

  document.getElementById('logout-btn').addEventListener('click', logout);

  await loadCategories();
  await loadProducts();

  wireModals();
}

// --- Categorías ---
async function loadCategories() {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('id, name')
    .order('id');

  if (error) {
    console.error('Error cargando categorías:', error.message);
    return;
  }

  categories = data;
  activeCategoryId = categories[0]?.id ?? null;

  const tabsContainer = document.getElementById('category-tabs');
  const selectEl = document.getElementById('product-category');
  tabsContainer.innerHTML = '';
  selectEl.innerHTML = '';

  categories.forEach((cat) => {
    const tab = document.createElement('button');
    tab.className = 'category-tab' + (cat.id === activeCategoryId ? ' active' : '');
    tab.textContent = cat.name;
    tab.addEventListener('click', () => {
      activeCategoryId = cat.id;
      activeModel = null;
      document.querySelectorAll('.category-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      loadProducts();
    });
    tabsContainer.appendChild(tab);

    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    selectEl.appendChild(option);
  });
}

// --- Productos ---
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<p class="empty-text">Cargando...</p>';

  const { data, error } = await supabaseClient
    .from('products')
    .select('id, model, size, color, quantity, category_id')
    .eq('category_id', activeCategoryId)
    .order('model')
    .order('size')
    .order('color');

  if (error) {
    console.error('Error cargando productos:', error.message);
    grid.innerHTML = '<p class="empty-text">Error al cargar productos.</p>';
    return;
  }

  categoryProducts = data;
  renderCurrentView();
}

function renderCurrentView() {
  if (activeModel) {
    renderVariants();
  } else {
    renderModels();
  }
}

function setProductsPanelHeader({ showBack, title, count }) {
  document.getElementById('back-to-models').classList.toggle('hidden', !showBack);
  document.getElementById('products-panel-title').textContent = title;
  document.getElementById('products-count').textContent = count;
  document.getElementById('variant-filters').classList.toggle('hidden', !showBack);
}

// --- Vista de modelos (agrupados por nombre dentro de la categoría) ---
function renderModels() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  const groups = new Map();
  categoryProducts.forEach((p) => {
    if (!groups.has(p.model)) groups.set(p.model, []);
    groups.get(p.model).push(p);
  });

  setProductsPanelHeader({ showBack: false, title: 'Productos', count: groups.size });

  if (groups.size === 0) {
    grid.innerHTML = '<p class="empty-text">No hay productos en esta categoría todavía.</p>';
    return;
  }

  Array.from(groups.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'es'))
    .forEach(([model, variants]) => {
      const totalQty = variants.reduce((sum, v) => sum + v.quantity, 0);
      const lowStock = variants.some((v) => v.quantity <= LOW_STOCK_THRESHOLD);

      const card = document.createElement('article');
      card.className = 'model-card';
      card.innerHTML = `
        <div class="model-card-info">
          <h3>${escapeHtml(model)}</h3>
          <p class="model-card-meta">
            ${variants.length} ${variants.length === 1 ? 'variante' : 'variantes'} · ${totalQty} unidades
            ${lowStock ? `<span class="stock-badge">${ICONS.warning} Stock bajo</span>` : ''}
          </p>
        </div>
        <span class="model-card-chevron">${ICONS.chevron}</span>
      `;
      card.addEventListener('click', () => enterModel(model));
      grid.appendChild(card);
    });
}

function enterModel(model) {
  activeModel = model;
  document.getElementById('filter-color').value = '';
  document.getElementById('filter-size').value = '';
  renderVariants();
}

function exitToModels() {
  activeModel = null;
  renderModels();
}

// --- Vista de variantes (talla + color) de un modelo ---
function populateFilterOptions(variants) {
  const colorSelect = document.getElementById('filter-color');
  const sizeSelect = document.getElementById('filter-size');
  const currentColor = colorSelect.value;
  const currentSize = sizeSelect.value;

  const colors = [...new Set(variants.map((v) => v.color))].sort((a, b) => a.localeCompare(b, 'es'));
  const sizes = [...new Set(variants.map((v) => v.size))].sort((a, b) => a.localeCompare(b, 'es'));

  colorSelect.innerHTML =
    '<option value="">Todos los colores</option>' +
    colors.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  sizeSelect.innerHTML =
    '<option value="">Todas las tallas</option>' +
    sizes.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');

  colorSelect.value = colors.includes(currentColor) ? currentColor : '';
  sizeSelect.value = sizes.includes(currentSize) ? currentSize : '';
}

function renderVariants() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  const allVariants = categoryProducts.filter((p) => p.model === activeModel);
  populateFilterOptions(allVariants);

  const colorFilter = document.getElementById('filter-color').value;
  const sizeFilter = document.getElementById('filter-size').value;

  const filtered = allVariants.filter(
    (p) => (!colorFilter || p.color === colorFilter) && (!sizeFilter || p.size === sizeFilter)
  );

  setProductsPanelHeader({ showBack: true, title: activeModel, count: filtered.length });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-text">No hay variantes que coincidan con este filtro.</p>';
    return;
  }

  renderProductCards(filtered);
}

function renderProductCards(products) {
  const grid = document.getElementById('products-grid');

  products.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    const lowStock = p.quantity <= LOW_STOCK_THRESHOLD;
    const model = escapeHtml(p.model);
    const size = escapeHtml(p.size);
    const color = escapeHtml(p.color);
    card.innerHTML = `
      <h3>${model}</h3>
      <p class="product-variant">Talla ${size} · ${color}</p>
      ${lowStock ? `<span class="stock-badge">${ICONS.warning} Stock bajo</span>` : ''}
      <p class="product-quantity">${p.quantity} <span>unidades</span></p>
      <div class="product-actions">
        <div class="stock-stepper">
          <button class="stepper-minus" data-id="${p.id}" data-type="salida" title="Restar stock" aria-label="Restar stock">${ICONS.minus}</button>
          <button class="stepper-plus" data-id="${p.id}" data-type="entrada" title="Sumar stock" aria-label="Sumar stock">${ICONS.plus}</button>
        </div>
        <div class="product-actions-secondary">
          <button class="icon-btn btn-history" data-id="${p.id}" data-label="${model} (${size}, ${color})" title="Ver historial" aria-label="Ver historial">${ICONS.history}</button>
          <button class="icon-btn danger btn-delete" data-id="${p.id}" title="Eliminar producto" aria-label="Eliminar producto">${ICONS.trash}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.stepper-minus, .stepper-plus').forEach((btn) => {
    btn.addEventListener('click', () => openStockModal(btn.dataset.id, btn.dataset.type));
  });
  grid.querySelectorAll('.btn-history').forEach((btn) => {
    btn.addEventListener('click', () => openHistoryModal(btn.dataset.id, `Historial · ${btn.dataset.label}`));
  });
  grid.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

async function deleteProduct(productId) {
  if (!confirm('¿Eliminar este producto? Se borrará también su historial de movimientos.')) return;

  const { error } = await supabaseClient.from('products').delete().eq('id', productId);
  if (error) {
    alert('No se pudo eliminar el producto: ' + error.message);
    return;
  }
  await loadProducts();
}

// --- Modal: añadir producto ---
async function loadModelOptionsForCategory(categoryId) {
  const modelSelect = document.getElementById('product-model-select');
  modelSelect.innerHTML = '<option value="">Cargando modelos...</option>';

  const { data, error } = await supabaseClient
    .from('products')
    .select('model')
    .eq('category_id', categoryId);

  const models = error ? [] : [...new Set(data.map((p) => p.model))].sort((a, b) => a.localeCompare(b, 'es'));

  modelSelect.innerHTML =
    '<option value="" disabled selected>Selecciona un modelo</option>' +
    models.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('') +
    '<option value="__new__">+ Nuevo modelo…</option>';

  const newModelInput = document.getElementById('product-model-new');
  newModelInput.value = '';
  newModelInput.classList.add('hidden');
  newModelInput.required = false;
}

function getSelectedModel() {
  const modelSelect = document.getElementById('product-model-select');
  return modelSelect.value === '__new__'
    ? document.getElementById('product-model-new').value.trim()
    : modelSelect.value;
}

function getSelectedSize() {
  const sizeSelect = document.getElementById('product-size-select');
  return sizeSelect.value === '__new__'
    ? document.getElementById('product-size-new').value.trim()
    : sizeSelect.value;
}

async function handleAddProduct(e) {
  e.preventDefault();

  const payload = {
    category_id: Number(document.getElementById('product-category').value),
    model: getSelectedModel(),
    size: getSelectedSize(),
    color: document.getElementById('product-color').value.trim(),
    quantity: 0,
  };

  const { data: product, error } = await supabaseClient
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) {
    alert('No se pudo crear el producto: ' + error.message);
    return;
  }

  const initialQty = Number(document.getElementById('product-quantity').value) || 0;
  if (initialQty > 0) {
    await registerMovement(product.id, 'entrada', initialQty, 'Alta inicial de producto');
  }

  document.getElementById('add-product-form').reset();
  document.getElementById('product-model-new').classList.add('hidden');
  document.getElementById('product-model-new').required = false;
  document.getElementById('product-size-new').classList.add('hidden');
  document.getElementById('product-size-new').required = false;
  closeModal('add-product-modal');

  if (product.category_id === activeCategoryId) {
    await loadProducts();
  }
}

// --- Modal: ajustar stock ---
function openStockModal(productId, type) {
  document.getElementById('stock-product-id').value = productId;
  document.getElementById('stock-type').value = type;
  document.getElementById('stock-modal-title').textContent =
    type === 'entrada' ? 'Sumar stock' : 'Restar stock';
  document.getElementById('stock-quantity').value = 1;
  document.getElementById('stock-note').value = '';
  document.getElementById('stock-modal').classList.remove('hidden');
}

async function handleStockSubmit(e) {
  e.preventDefault();

  const productId = document.getElementById('stock-product-id').value;
  const type = document.getElementById('stock-type').value;
  const quantity = Number(document.getElementById('stock-quantity').value);
  const note = document.getElementById('stock-note').value.trim() || null;

  const ok = await registerMovement(productId, type, quantity, note);
  if (!ok) return;

  closeModal('stock-modal');
  await loadProducts();
}

async function registerMovement(productId, type, quantity, note) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  const { error } = await supabaseClient.from('stock_movements').insert({
    product_id: Number(productId),
    type,
    quantity,
    note,
    user_id: session.user.id,
  });

  if (error) {
    alert('No se pudo registrar el movimiento: ' + error.message);
    return false;
  }
  return true;
}

// --- Modales genéricos ---
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function wireModals() {
  document.getElementById('open-add-product').addEventListener('click', () => {
    document.getElementById('add-product-modal').classList.remove('hidden');
    loadModelOptionsForCategory(Number(document.getElementById('product-category').value));
  });
  document.getElementById('open-history').addEventListener('click', () => {
    openHistoryModal(null, 'Historial de movimientos');
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
  document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);

  document.getElementById('product-category').addEventListener('change', (e) => {
    loadModelOptionsForCategory(Number(e.target.value));
  });

  document.getElementById('product-model-select').addEventListener('change', (e) => {
    const newModelInput = document.getElementById('product-model-new');
    const isNew = e.target.value === '__new__';
    newModelInput.classList.toggle('hidden', !isNew);
    newModelInput.required = isNew;
    if (isNew) newModelInput.focus();
  });

  document.getElementById('product-size-select').addEventListener('change', (e) => {
    const newSizeInput = document.getElementById('product-size-new');
    const isNew = e.target.value === '__new__';
    newSizeInput.classList.toggle('hidden', !isNew);
    newSizeInput.required = isNew;
    if (isNew) newSizeInput.focus();
  });

  document.getElementById('back-to-models').addEventListener('click', exitToModels);
  document.getElementById('filter-color').addEventListener('change', renderVariants);
  document.getElementById('filter-size').addEventListener('change', renderVariants);
}

document.addEventListener('DOMContentLoaded', initDashboard);
