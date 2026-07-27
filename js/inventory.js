// Lógica principal del dashboard: categorías, productos y ajustes de stock.

let categories = [];
let activeCategoryId = null;
const LOW_STOCK_THRESHOLD = 5;

const ICONS = {
  minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  history: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>',
  warning: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
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
    .order('model');

  if (error) {
    console.error('Error cargando productos:', error.message);
    grid.innerHTML = '<p class="empty-text">Error al cargar productos.</p>';
    return;
  }

  renderProducts(data);
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  const countBadge = document.getElementById('products-count');
  grid.innerHTML = '';
  countBadge.textContent = products.length;

  if (products.length === 0) {
    grid.innerHTML = '<p class="empty-text">No hay productos en esta categoría todavía.</p>';
    return;
  }

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
async function handleAddProduct(e) {
  e.preventDefault();

  const payload = {
    category_id: Number(document.getElementById('product-category').value),
    model: document.getElementById('product-model').value.trim(),
    size: document.getElementById('product-size').value,
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
  });
  document.getElementById('open-history').addEventListener('click', () => {
    openHistoryModal(null, 'Historial de movimientos');
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
  document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);
}

document.addEventListener('DOMContentLoaded', initDashboard);
