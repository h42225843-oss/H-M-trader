/* ============================================================
   H.M Traders — Ledger
   All data lives in Firestore under a single owner account.
   ============================================================ */

const state = {
  products: [],
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  view: 'dashboard',
  inventoryTab: 'All',
};

const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
const todayStr = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const uid = () => Math.random().toString(36).slice(2, 10);

// Formats a raw piece-count as "N crates + M pcs" using the product's crate size.
function crateBreakdown(pcs, perCrate) {
  const size = Number(perCrate) > 0 ? Number(perCrate) : null;
  if (!size) return `${pcs} pcs`;
  const crates = Math.floor(pcs / size);
  const rem = pcs % size;
  if (crates === 0) return `${rem} pcs`;
  if (rem === 0) return `${crates} crate${crates !== 1 ? 's' : ''}`;
  return `${crates} crate${crates !== 1 ? 's' : ''} + ${rem} pcs`;
}

// Splits raw pcs into { crates, pcs } separately, using the product's crate size.
function splitCratesPcs(pcs, perCrate) {
  const size = Number(perCrate) > 0 ? Number(perCrate) : null;
  if (!size) return { crates: null, pcs };
  return { crates: Math.floor(pcs / size), pcs: pcs % size };
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- Auth ---------------- */
const splashEl = document.getElementById('splash');
const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
let splashShown = Date.now();

function revealAfterSplash(fn) {
  // keep the splash on screen briefly so the animation isn't a flash
  const elapsed = Date.now() - splashShown;
  const wait = Math.max(650 - elapsed, 0);
  setTimeout(() => {
    splashEl.classList.add('splash-out');
    setTimeout(() => splashEl.classList.add('hidden'), 500);
    fn();
  }, wait);
}

auth.onAuthStateChanged((user) => {
  if (user) {
    revealAfterSplash(() => {
      loginScreen.classList.add('hidden');
      appEl.classList.remove('hidden');
      appEl.classList.add('app-in');
      attachListeners();
    });
  } else {
    revealAfterSplash(() => {
      appEl.classList.add('hidden');
      loginScreen.classList.remove('hidden');
      loginScreen.classList.add('login-in');
    });
  }
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  auth.signInWithEmailAndPassword(email, password).catch((err) => {
    errEl.textContent = err.message.replace('Firebase: ', '');
  });
});

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

/* ---------------- Navigation ---------------- */
document.querySelectorAll('.nav-item[data-view], .bottom-nav-item[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item[data-view], .bottom-nav-item[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  target.classList.add('active');
  target.classList.remove('view-enter');
  // eslint-disable-next-line no-unused-expressions
  void target.offsetWidth; // restart animation
  target.classList.add('view-enter');
  const titles = { dashboard: 'Dashboard', inventory: 'Inventory', sales: 'Sales', customers: 'Customers & Dues', suppliers: 'Suppliers & Purchases' };
  document.getElementById('view-title').textContent = titles[view];
  renderAll();
}

document.getElementById('topbar-date').textContent = todayStr();

/* ---------------- Firestore live sync ---------------- */
let unsubscribers = [];
function attachListeners() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];

  const cols = [
    ['products', (docs) => (state.products = docs)],
    ['customers', (docs) => (state.customers = docs)],
    ['suppliers', (docs) => (state.suppliers = docs)],
    ['sales', (docs) => (state.sales = docs)],
    ['purchases', (docs) => (state.purchases = docs)],
  ];

  cols.forEach(([name, setter]) => {
    const unsub = db.collection(name).onSnapshot((snap) => {
      setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      renderAll();
    }, (err) => console.error(name, err));
    unsubscribers.push(unsub);
  });
}

function renderAll() {
  if (state.view === 'dashboard') renderDashboard();
  if (state.view === 'inventory') renderInventory();
  if (state.view === 'sales') renderSales();
  if (state.view === 'customers') renderCustomers();
  if (state.view === 'suppliers') renderSuppliers();
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard() {
  const el = document.getElementById('view-dashboard');
  const todayKey = new Date().toDateString();
  const todaysSales = state.sales.filter((s) => new Date(s.date).toDateString() === todayKey);
  const todayTotal = todaysSales.reduce((a, s) => a + s.total, 0);
  const totalDue = state.customers.reduce((a, c) => a + (c.totalDue || 0), 0);
  const lowStock = state.products.filter((p) => p.stock <= (p.lowStockAt ?? 5));
  const stockValue = state.products.reduce((a, p) => a + p.stock * p.costPrice, 0);
  const totalPcs = state.products.reduce((a, p) => a + (p.stock || 0), 0);
  // Total crates = sum of full crates across all products that have a crate size set.
  const totalCrates = state.products.reduce((a, p) => {
    if (!p.unitsPerCrate) return a;
    return a + Math.floor((p.stock || 0) / p.unitsPerCrate);
  }, 0);

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="label">Today's Sales</div><div class="value">${money(todayTotal)}</div></div>
      <div class="stat-card"><div class="label">Sales Recorded Today</div><div class="value">${todaysSales.length}</div></div>
      <div class="stat-card ${totalDue > 0 ? 'warn' : ''}"><div class="label">Total Dues Owed</div><div class="value">${money(totalDue)}</div></div>
      <div class="stat-card"><div class="label">Stock Value</div><div class="value">${money(stockValue)}</div></div>
      <div class="stat-card"><div class="label">Total Crates</div><div class="value">${totalCrates}</div></div>
      <div class="stat-card"><div class="label">Total Pcs</div><div class="value">${totalPcs}</div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Low Stock</h3></div>
      ${lowStock.length ? `
        <table><thead><tr><th>Product</th><th>Stock left</th><th>Reorder at</th></tr></thead>
        <tbody>${lowStock.map((p) => `
          <tr>
            <td data-label="Product">${p.name}</td>
            <td data-label="Stock" class="mono">${crateBreakdown(p.stock, p.unitsPerCrate)}</td>
            <td data-label="Reorder at" class="mono">${p.lowStockAt ?? 5} pcs</td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">Nothing running low right now.</div>`}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Recent Sales</h3></div>
      ${renderSalesTable(state.sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6))}
    </div>
  `;
}

/* ============================================================
   INVENTORY
   ============================================================ */
function renderInventory() {
  const el = document.getElementById('view-inventory');

  if (!state.products.length) {
    el.innerHTML = `
      <div class="panel">
        <div class="panel-head"><h3>Products</h3><button class="btn small" id="add-product-btn">+ Add product</button></div>
        <div class="empty-state">No products yet. Add your first bottle product to get started.</div>
      </div>
    `;
    document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());
    return;
  }

  // Group products by category (e.g. different companies/brands)
  const groups = {};
  state.products.forEach((p) => {
    const key = p.category?.trim() || 'Uncategorized';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  const categoryNames = Object.keys(groups).sort();
  if (!state.inventoryTab || !categoryNames.includes(state.inventoryTab)) {
    state.inventoryTab = 'All';
  }

  function categoryTotals(products) {
    const pcs = products.reduce((a, p) => a + (p.stock || 0), 0);
    const crates = products.reduce((a, p) => p.unitsPerCrate ? a + Math.floor((p.stock || 0) / p.unitsPerCrate) : a, 0);
    return { pcs, crates };
  }

  const tabs = ['All', ...categoryNames];
  const activeProducts = state.inventoryTab === 'All' ? state.products : groups[state.inventoryTab];
  const t = categoryTotals(activeProducts);

  el.innerHTML = `
    <div class="category-tabs">
      ${tabs.map((cat) => `<button class="cat-tab ${cat === state.inventoryTab ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('')}
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr); margin-bottom:18px;">
      <div class="stat-card"><div class="label">${state.inventoryTab} — Crates</div><div class="value">${t.crates}</div></div>
      <div class="stat-card"><div class="label">${state.inventoryTab} — Pcs</div><div class="value">${t.pcs}</div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Products</h3><button class="btn small" id="add-product-btn">+ Add product</button></div>
      <table><thead><tr><th>Name</th><th>Category</th><th>Crates</th><th>Pcs</th><th>Cost</th><th>Sale price</th><th></th></tr></thead>
      <tbody>${activeProducts.map((p) => {
        const split = splitCratesPcs(p.stock, p.unitsPerCrate);
        const low = p.stock <= (p.lowStockAt ?? 5);
        return `
        <tr>
          <td data-label="Name">${p.name}</td>
          <td data-label="Category">${p.category || '—'}</td>
          <td data-label="Crates" class="mono">${split.crates === null ? '—' : (low ? `<span class="pill warn">${split.crates}</span>` : split.crates)}</td>
          <td data-label="Pcs" class="mono">${low && split.crates === null ? `<span class="pill warn">${split.pcs}</span>` : split.pcs}</td>
          <td data-label="Cost" class="mono">${money(p.costPrice)}</td>
          <td data-label="Sale price" class="mono">${money(p.salePrice)}</td>
          <td data-label=""><button class="btn secondary small" onclick="editProduct('${p.id}')">Edit</button></td>
        </tr>`;
      }).join('')}</tbody></table>
    </div>
  `;
  document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());
  document.querySelectorAll('.cat-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.inventoryTab = btn.dataset.cat;
      renderInventory();
    });
  });
}

function openProductModal(existing) {
  const isEdit = !!existing;
  const p = existing || { name: '', category: '', stock: 0, unit: 'pcs', unitsPerCrate: '', costPrice: '', salePrice: '', lowStockAt: 5 };
  const initialCrates = p.unitsPerCrate ? Math.floor(p.stock / p.unitsPerCrate) : '';
  const initialExtraPcs = p.unitsPerCrate ? p.stock % p.unitsPerCrate : p.stock;

  showModal(`
    <h3>${isEdit ? 'Edit product' : 'Add product'}</h3>
    <form id="product-form">
      <label>Product name<input required id="p-name" value="${p.name}" placeholder="e.g. 500ml Water Bottle" /></label>
      <label>Category<input id="p-category" value="${p.category}" placeholder="e.g. Water, Juice, Glass" /></label>
      <label>Pieces per crate <span style="font-weight:400;">(leave blank if sold loose, not by the crate)</span><input type="number" id="p-percrate" value="${p.unitsPerCrate || ''}" placeholder="e.g. 12 or 24" /></label>

      <div id="stock-crate-fields" class="line-item-row" style="grid-template-columns:1fr 1fr; display:${p.unitsPerCrate ? 'grid' : 'none'};">
        <label style="margin:0;">Crates<input type="number" id="p-crates" value="${initialCrates}" min="0" /></label>
        <label style="margin:0;">Extra pcs<input type="number" id="p-extrapcs" value="${initialExtraPcs}" min="0" /></label>
      </div>
      <div id="stock-loose-field" style="display:${p.unitsPerCrate ? 'none' : 'block'};">
        <label>Current stock (pcs)<input type="number" id="p-stock-loose" value="${p.unitsPerCrate ? '' : p.stock}" /></label>
      </div>

      <label>Low stock alert at (pcs)<input type="number" id="p-lowstock" value="${p.lowStockAt}" /></label>
      <label>Cost price (per pc)<input required type="number" id="p-cost" value="${p.costPrice}" /></label>
      <label>Sale price (per pc)<input required type="number" id="p-sale" value="${p.salePrice}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="p-delete">Delete</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Add product'}</button>
      </div>
    </form>
  `);

  const perCrateInput = document.getElementById('p-percrate');
  const crateFields = document.getElementById('stock-crate-fields');
  const looseField = document.getElementById('stock-loose-field');
  perCrateInput.addEventListener('input', () => {
    const hasCrateSize = Number(perCrateInput.value) > 0;
    crateFields.style.display = hasCrateSize ? 'grid' : 'none';
    looseField.style.display = hasCrateSize ? 'none' : 'block';
  });

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const perCrate = Number(perCrateInput.value) || null;
    const stock = perCrate
      ? (Number(document.getElementById('p-crates').value) || 0) * perCrate + (Number(document.getElementById('p-extrapcs').value) || 0)
      : (Number(document.getElementById('p-stock-loose').value) || 0);
    const data = {
      name: document.getElementById('p-name').value.trim(),
      category: document.getElementById('p-category').value.trim(),
      unit: 'pcs',
      stock,
      unitsPerCrate: perCrate,
      lowStockAt: Number(document.getElementById('p-lowstock').value) || 5,
      costPrice: Number(document.getElementById('p-cost').value),
      salePrice: Number(document.getElementById('p-sale').value),
    };
    if (isEdit) {
      await db.collection('products').doc(existing.id).update(data);
      toast('Product updated');
    } else {
      await db.collection('products').add(data);
      toast('Product added');
    }
    closeModal();
  });

  if (isEdit) {
    document.getElementById('p-delete').addEventListener('click', async () => {
      if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
        await db.collection('products').doc(existing.id).delete();
        toast('Product deleted');
        closeModal();
      }
    });
  }
}

window.editProduct = (id) => {
  const p = state.products.find((x) => x.id === id);
  if (p) openProductModal(p);
};

/* ============================================================
   SALES
   ============================================================ */
function renderSalesTable(sales) {
  if (!sales.length) return `<div class="empty-state">No sales recorded yet.</div>`;
  return `
    <table><thead><tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th></th></tr></thead>
    <tbody>${sales.map((s) => `
      <tr>
        <td data-label="Date">${new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
        <td data-label="Customer">${s.customerName || 'Walk-in'}</td>
        <td data-label="Items">${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
        <td data-label="Total" class="mono">${money(s.total)}</td>
        <td data-label="Paid" class="mono">${money(s.paid)}</td>
        <td data-label="Due">${s.due > 0 ? `<span class="pill warn">${money(s.due)}</span>` : `<span class="pill ok">Settled</span>`}</td>
        <td data-label=""><button class="btn secondary small" onclick="editSale('${s.id}')">Edit</button></td>
      </tr>`).join('')}</tbody></table>
  `;
}

function renderSales() {
  const el = document.getElementById('view-sales');
  const sorted = state.sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>All sales</h3><button class="btn small" id="add-sale-btn">+ Record sale</button></div>
      ${renderSalesTable(sorted)}
    </div>
  `;
  document.getElementById('add-sale-btn').addEventListener('click', openSaleModal);
}

function openSaleModal() {
  if (!state.products.length) { toast('Add a product first'); return; }
  const rowId = uid();
  showModal(`
    <h3>Record sale</h3>
    <form id="sale-form">
      <label>Customer
        <select id="s-customer">
          <option value="">Walk-in (no account)</option>
          ${state.customers.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="line-items">
        ${saleLineRow(rowId)}
      </div>
      <button type="button" class="btn secondary small" id="add-line-btn" style="align-self:flex-start;">+ Add another item</button>
      <label>Amount paid now<input type="number" id="s-paid" value="0" required /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save sale</button>
      </div>
    </form>
  `);

  document.getElementById('add-line-btn').addEventListener('click', () => {
    document.getElementById('line-items').insertAdjacentHTML('beforeend', saleLineRow(uid()));
  });

  document.getElementById('sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rows = [...document.querySelectorAll('.line-item-row')];
    const items = rows.map((r) => {
      const productId = r.querySelector('.li-product').value;
      const qty = Number(r.querySelector('.li-qty').value);
      const p = state.products.find((x) => x.id === productId);
      return { productId, name: p.name, qty, price: p.salePrice, lineTotal: p.salePrice * qty };
    }).filter((i) => i.productId && i.qty > 0);

    if (!items.length) { toast('Add at least one valid item'); return; }

    // check stock
    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (item.qty > p.stock) { toast(`Not enough stock for ${p.name}`); return; }
    }

    const total = items.reduce((a, i) => a + i.lineTotal, 0);
    const paid = Number(document.getElementById('s-paid').value) || 0;
    const due = Math.max(total - paid, 0);
    const customerId = document.getElementById('s-customer').value;
    const customer = state.customers.find((c) => c.id === customerId);

    const batch = db.batch();
    const saleRef = db.collection('sales').doc();
    batch.set(saleRef, {
      customerId: customerId || null,
      customerName: customer ? customer.name : 'Walk-in',
      items,
      total, paid, due,
      date: new Date().toISOString(),
    });
    items.forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      batch.update(db.collection('products').doc(i.productId), { stock: p.stock - i.qty });
    });
    if (customer && due > 0) {
      batch.update(db.collection('customers').doc(customer.id), { totalDue: (customer.totalDue || 0) + due });
    }
    await batch.commit();
    toast('Sale recorded');
    closeModal();
  });
}

function saleLineRow(rowId) {
  return `
    <div class="line-item-row" data-row="${rowId}">
      <select class="li-product">
        <option value="">Select product…</option>
        ${state.products.map((p) => `<option value="${p.id}">${p.name} (${crateBreakdown(p.stock, p.unitsPerCrate)} left)</option>`).join('')}
      </select>
      <input class="li-qty" type="number" min="1" value="1" placeholder="Qty" />
      <span class="mono" style="font-size:12px;color:var(--muted);">unit price auto</span>
      <button type="button" class="btn secondary small" onclick="this.closest('.line-item-row').remove()">✕</button>
    </div>
  `;
}

window.editSale = (id) => {
  const s = state.sales.find((x) => x.id === id);
  if (!s) return;
  showModal(`
    <h3>Edit sale — ${s.customerName || 'Walk-in'}</h3>
    <p style="color:var(--muted); font-size:14px; margin:0;">Items: ${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}<br/>Total: <strong class="mono">${money(s.total)}</strong></p>
    <form id="edit-sale-form">
      <label>Amount paid<input required type="number" id="es-paid" value="${s.paid}" /></label>
      <div class="modal-actions">
        <button type="button" class="btn danger" id="es-delete">Delete sale</button>
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save changes</button>
      </div>
    </form>
  `);

  document.getElementById('edit-sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPaid = Number(document.getElementById('es-paid').value) || 0;
    const newDue = Math.max(s.total - newPaid, 0);
    const dueDelta = newDue - s.due;
    const batch = db.batch();
    batch.update(db.collection('sales').doc(s.id), { paid: newPaid, due: newDue });
    if (s.customerId && dueDelta !== 0) {
      const customer = state.customers.find((c) => c.id === s.customerId);
      if (customer) batch.update(db.collection('customers').doc(customer.id), { totalDue: (customer.totalDue || 0) + dueDelta });
    }
    await batch.commit();
    toast('Sale updated');
    closeModal();
  });

  document.getElementById('es-delete').addEventListener('click', async () => {
    if (!confirm('Delete this sale? Stock and customer dues will be reversed.')) return;
    const batch = db.batch();
    batch.delete(db.collection('sales').doc(s.id));
    s.items.forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      if (p) batch.update(db.collection('products').doc(i.productId), { stock: p.stock + i.qty });
    });
    if (s.customerId && s.due > 0) {
      const customer = state.customers.find((c) => c.id === s.customerId);
      if (customer) batch.update(db.collection('customers').doc(customer.id), { totalDue: Math.max((customer.totalDue || 0) - s.due, 0) });
    }
    await batch.commit();
    toast('Sale deleted');
    closeModal();
  });
};

/* ============================================================
   CUSTOMERS & DUES
   ============================================================ */
function renderCustomers() {
  const el = document.getElementById('view-customers');
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>Customers</h3><button class="btn small" id="add-customer-btn">+ Add customer</button></div>
      ${state.customers.length ? `
        <table><thead><tr><th>Name</th><th>Phone</th><th>Due</th><th></th></tr></thead>
        <tbody>${state.customers.map((c) => `
          <tr>
            <td data-label="Name">${c.name}</td>
            <td data-label="Phone">${c.phone || '—'}</td>
            <td data-label="Due">${c.totalDue > 0 ? `<span class="pill warn">${money(c.totalDue)}</span>` : `<span class="pill ok">Clear</span>`}</td>
            <td data-label="">
              ${c.totalDue > 0 ? `<button class="btn secondary small" onclick="openPaymentModal('${c.id}')">Record payment</button>` : ''}
              <button class="btn secondary small" onclick="editCustomer('${c.id}')">Edit</button>
            </td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No customers yet.</div>`}
    </div>
  `;
  document.getElementById('add-customer-btn').addEventListener('click', () => openCustomerModal());
}

function openCustomerModal(existing) {
  const isEdit = !!existing;
  const c = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? 'Edit customer' : 'Add customer'}</h3>
    <form id="customer-form">
      <label>Name<input required id="c-name" value="${c.name}" /></label>
      <label>Phone<input id="c-phone" value="${c.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="c-delete">Delete</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Add customer'}</button>
      </div>
    </form>
  `);
  document.getElementById('customer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('c-name').value.trim(),
      phone: document.getElementById('c-phone').value.trim(),
    };
    if (isEdit) {
      await db.collection('customers').doc(existing.id).update(data);
      toast('Customer updated');
    } else {
      await db.collection('customers').add({ ...data, totalDue: 0 });
      toast('Customer added');
    }
    closeModal();
  });
  if (isEdit) {
    document.getElementById('c-delete').addEventListener('click', async () => {
      if (c.totalDue > 0 && !confirm(`${c.name} still has ${money(c.totalDue)} due. Delete anyway?`)) return;
      if (c.totalDue <= 0 && !confirm(`Delete customer "${c.name}"?`)) return;
      await db.collection('customers').doc(existing.id).delete();
      toast('Customer deleted');
      closeModal();
    });
  }
}

window.editCustomer = (id) => {
  const c = state.customers.find((x) => x.id === id);
  if (c) openCustomerModal(c);
};

window.openPaymentModal = (customerId) => {
  const c = state.customers.find((x) => x.id === customerId);
  showModal(`
    <h3>Record payment — ${c.name}</h3>
    <form id="payment-form">
      <p style="color:var(--muted); font-size:14px; margin:0;">Current due: <strong class="mono">${money(c.totalDue)}</strong></p>
      <label>Amount received<input required type="number" max="${c.totalDue}" id="pay-amount" /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save payment</button>
      </div>
    </form>
  `);
  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amt = Number(document.getElementById('pay-amount').value);
    if (amt <= 0 || amt > c.totalDue) { toast('Enter a valid amount'); return; }
    await db.collection('customers').doc(c.id).update({ totalDue: c.totalDue - amt });
    toast('Payment recorded');
    closeModal();
  });
};

/* ============================================================
   SUPPLIERS & PURCHASES
   ============================================================ */
function renderSuppliers() {
  const el = document.getElementById('view-suppliers');
  const purchases = state.purchases.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>Suppliers</h3><button class="btn small" id="add-supplier-btn">+ Add supplier</button></div>
      ${state.suppliers.length ? `
        <table><thead><tr><th>Name</th><th>Phone</th><th></th></tr></thead>
        <tbody>${state.suppliers.map((s) => `
          <tr>
            <td data-label="Name">${s.name}</td>
            <td data-label="Phone">${s.phone || '—'}</td>
            <td data-label=""><button class="btn secondary small" onclick="editSupplier('${s.id}')">Edit</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No suppliers yet.</div>`}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Purchases</h3><button class="btn small" id="add-purchase-btn">+ Record purchase</button></div>
      ${purchases.length ? `
        <table><thead><tr><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th></th></tr></thead>
        <tbody>${purchases.map((p) => `
          <tr>
            <td data-label="Date">${new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
            <td data-label="Supplier">${p.supplierName}</td>
            <td data-label="Items">${p.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
            <td data-label="Total" class="mono">${money(p.total)}</td>
            <td data-label=""><button class="btn secondary small" onclick="deletePurchase('${p.id}')">Delete</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No purchases recorded yet.</div>`}
    </div>
  `;

  document.getElementById('add-supplier-btn').addEventListener('click', () => openSupplierModal());
  document.getElementById('add-purchase-btn').addEventListener('click', openPurchaseModal);
}

function openSupplierModal(existing) {
  const isEdit = !!existing;
  const s = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? 'Edit supplier' : 'Add supplier'}</h3>
    <form id="supplier-form">
      <label>Name<input required id="sup-name" value="${s.name}" /></label>
      <label>Phone<input id="sup-phone" value="${s.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="sup-delete">Delete</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Add supplier'}</button>
      </div>
    </form>
  `);
  document.getElementById('supplier-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('sup-name').value.trim(),
      phone: document.getElementById('sup-phone').value.trim(),
    };
    if (isEdit) {
      await db.collection('suppliers').doc(existing.id).update(data);
      toast('Supplier updated');
    } else {
      await db.collection('suppliers').add(data);
      toast('Supplier added');
    }
    closeModal();
  });
  if (isEdit) {
    document.getElementById('sup-delete').addEventListener('click', async () => {
      if (!confirm(`Delete supplier "${s.name}"? Past purchases will keep showing their recorded name.`)) return;
      await db.collection('suppliers').doc(existing.id).delete();
      toast('Supplier deleted');
      closeModal();
    });
  }
}

window.editSupplier = (id) => {
  const s = state.suppliers.find((x) => x.id === id);
  if (s) openSupplierModal(s);
};

window.deletePurchase = async (id) => {
  const p = state.purchases.find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`Delete this purchase from ${p.supplierName}? Stock added by it will be reversed.`)) return;
  const batch = db.batch();
  batch.delete(db.collection('purchases').doc(p.id));
  p.items.forEach((i) => {
    const prod = state.products.find((x) => x.id === i.productId);
    if (prod) batch.update(db.collection('products').doc(i.productId), { stock: Math.max(prod.stock - i.qty, 0) });
  });
  await batch.commit();
  toast('Purchase deleted');
};

function openPurchaseModal() {
  if (!state.suppliers.length) { toast('Add a supplier first'); return; }
  if (!state.products.length) { toast('Add a product first'); return; }
  showModal(`
    <h3>Record purchase</h3>
    <form id="purchase-form">
      <label>Supplier
        <select id="pu-supplier" required>
          <option value="">Select supplier…</option>
          ${state.suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="purchase-line-items">
        ${purchaseLineRow()}
      </div>
      <button type="button" class="btn secondary small" id="add-pline-btn" style="align-self:flex-start;">+ Add another item</button>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save purchase</button>
      </div>
    </form>
  `);

  document.getElementById('add-pline-btn').addEventListener('click', () => {
    document.getElementById('purchase-line-items').insertAdjacentHTML('beforeend', purchaseLineRow());
  });

  document.getElementById('purchase-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rows = [...document.querySelectorAll('#purchase-line-items .line-item-row')];
    const items = rows.map((r) => {
      const productId = r.querySelector('.li-product').value;
      const qty = Number(r.querySelector('.li-qty').value);
      const costEach = Number(r.querySelector('.li-cost').value);
      const p = state.products.find((x) => x.id === productId);
      return { productId, name: p.name, qty, costEach, lineTotal: qty * costEach };
    }).filter((i) => i.productId && i.qty > 0);

    if (!items.length) { toast('Add at least one valid item'); return; }

    const supplierId = document.getElementById('pu-supplier').value;
    const supplier = state.suppliers.find((s) => s.id === supplierId);
    const total = items.reduce((a, i) => a + i.lineTotal, 0);

    const batch = db.batch();
    const purchaseRef = db.collection('purchases').doc();
    batch.set(purchaseRef, {
      supplierId, supplierName: supplier.name, items, total, date: new Date().toISOString(),
    });
    items.forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      batch.update(db.collection('products').doc(i.productId), {
        stock: p.stock + i.qty,
        costPrice: i.costEach, // keep cost price current
      });
    });
    await batch.commit();
    toast('Purchase recorded, stock updated');
    closeModal();
  });
}

function purchaseLineRow() {
  return `
    <div class="line-item-row">
      <select class="li-product">
        <option value="">Select product…</option>
        ${state.products.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
      <input class="li-qty" type="number" min="1" value="1" placeholder="Qty" />
      <input class="li-cost" type="number" min="0" placeholder="Cost/unit" />
      <button type="button" class="btn secondary small" onclick="this.closest('.line-item-row').remove()">✕</button>
    </div>
  `;
}

/* ============================================================
   Modal helper
   ============================================================ */
function showModal(innerHtml) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${innerHtml}</div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  const cancelBtn = overlay.querySelector('#modal-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
}
function closeModal() {
  const existing = document.getElementById('modal-overlay');
  if (existing) {
    existing.classList.add('closing');
    setTimeout(() => existing.remove(), 160);
  }
}

/* ---------------- PWA service worker ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
