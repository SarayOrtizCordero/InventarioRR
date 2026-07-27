// Historial de movimientos de stock (entradas/salidas).

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

function renderMovements(movements, { showProduct = true } = {}) {
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  if (movements.length === 0) {
    container.innerHTML = '<p class="empty-text">Todavía no hay movimientos registrados.</p>';
    return;
  }

  movements.forEach((m) => {
    const row = document.createElement('div');
    row.className = `history-row history-${m.type}`;

    const date = new Date(m.created_at).toLocaleString('es-ES');
    const productLabel = showProduct && m.products
      ? `${m.products.model} (${m.products.size}, ${m.products.color}) — `
      : '';
    const sign = m.type === 'entrada' ? '+' : '-';
    const userName = m.profiles ? m.profiles.full_name : 'Usuario';

    row.innerHTML = `
      <span class="history-type">${m.type === 'entrada' ? 'Entrada' : 'Salida'}</span>
      <span class="history-detail">${productLabel}${sign}${m.quantity} unidades</span>
      <span class="history-meta">${userName} · ${date}${m.note ? ' · ' + m.note : ''}</span>
    `;
    container.appendChild(row);
  });
}

async function openHistoryModal(productId = null, title = 'Historial de movimientos') {
  document.getElementById('history-modal-title').textContent = title;
  const movements = await fetchMovements(productId);
  renderMovements(movements, { showProduct: !productId });
  document.getElementById('history-modal').classList.remove('hidden');
}
