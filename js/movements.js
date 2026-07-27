// Historial de movimientos de stock (entradas/salidas).

let currentMovements = [];
let currentShowProduct = true;
let currentFilter = 'all';

const MOVEMENT_ICONS = {
  entrada: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  salida: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchMovements(productId = null) {
  let query = supabaseClient
    .from('stock_movements')
    .select('id, type, quantity, note, created_at, product_id, products(model, size, color), profiles(full_name)')
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error cargando historial:', error.message);
    return [];
  }
  return data;
}

function formatDayLabel(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, now)) return 'Hoy';
  if (isSameDay(date, yesterday)) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function renderMovements(movements) {
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  const filtered = currentFilter === 'all' ? movements : movements.filter((m) => m.type === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-text">No hay movimientos que coincidan con este filtro.</p>';
    return;
  }

  let lastDayLabel = null;

  filtered.forEach((m) => {
    const dayLabel = formatDayLabel(m.created_at);
    if (dayLabel !== lastDayLabel) {
      const header = document.createElement('p');
      header.className = 'history-date-header';
      header.textContent = dayLabel;
      container.appendChild(header);
      lastDayLabel = dayLabel;
    }

    const sign = m.type === 'entrada' ? '+' : '−';
    const userName = m.profiles ? escapeHtml(m.profiles.full_name) : 'Usuario';

    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
      <span class="history-icon ${m.type}">${MOVEMENT_ICONS[m.type]}</span>
      <div class="history-content">
        <span class="history-amount ${m.type}">${sign}${m.quantity} unidades</span>
        ${currentShowProduct && m.products ? `<span class="history-product">${escapeHtml(m.products.model)} · Talla ${escapeHtml(m.products.size)} · ${escapeHtml(m.products.color)}</span>` : ''}
        <span class="history-meta">${userName} · ${formatTime(m.created_at)}${m.note ? ' · ' + escapeHtml(m.note) : ''}</span>
      </div>
    `;
    container.appendChild(row);
  });
}

function setHistoryFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.history-filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderMovements(currentMovements);
}

async function openHistoryModal(productId = null, title = 'Historial de movimientos') {
  document.getElementById('history-modal-title').textContent = title;
  currentShowProduct = !productId;
  currentFilter = 'all';
  document.querySelectorAll('.history-filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });

  currentMovements = await fetchMovements(productId);
  renderMovements(currentMovements);
  document.getElementById('history-modal').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.history-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setHistoryFilter(btn.dataset.filter));
  });
});
