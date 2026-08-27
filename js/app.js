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
  shopkeepers: [],
  shopkeeperSales: [],
  view: 'dashboard',
  inventoryTab: 'All',
  reportFrom: null,
  reportTo: null,
};

const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
const todayStr = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
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

// Formats an invoice sequence number like "INV-0007"
function formatInvoice(n) {
  return `INV-${String(n).padStart(4, '0')}`;
}

// Atomically reserves the next invoice number using a Firestore transaction,
// so two sales recorded at nearly the same time never collide.
async function getNextInvoiceNo() {
  const counterRef = db.collection('meta').doc('counters');
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(counterRef);
    const current = doc.exists ? (doc.data().nextInvoiceNo || 1) : 1;
    tx.set(counterRef, { nextInvoiceNo: current + 1 }, { merge: true });
    return current;
  });
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// Prevents duplicate saves: disables a form's submit button the instant it's
// submitted, so a slow connection + an impatient second tap can't double-save.
function guardDoubleSubmit(form) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return () => {};
  if (btn.disabled) return null; // already submitting — caller should abort
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving…';
  return () => { btn.disabled = false; btn.textContent = original; }; // call on error to re-enable
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

const moreSheetBackdrop = document.getElementById('more-sheet-backdrop');
const moreBtn = document.getElementById('bottom-more-btn');
const MORE_SHEET_VIEWS = ['reports', 'lowstock', 'recentsales', 'shopkeepers'];

function openMoreSheet() { moreSheetBackdrop.classList.add('show'); }
function closeMoreSheet() { moreSheetBackdrop.classList.remove('show'); }

moreBtn.addEventListener('click', openMoreSheet);
moreSheetBackdrop.addEventListener('click', (e) => { if (e.target === moreSheetBackdrop) closeMoreSheet(); });
document.getElementById('more-sheet-cancel').addEventListener('click', closeMoreSheet);
document.querySelectorAll('.more-sheet-item[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => { closeMoreSheet(); setView(btn.dataset.view); });
});

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item[data-view], .bottom-nav-item[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  moreBtn.classList.toggle('active', MORE_SHEET_VIEWS.includes(view));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  target.classList.add('active');
  target.classList.remove('view-enter');
  // eslint-disable-next-line no-unused-expressions
  void target.offsetWidth; // restart animation
  target.classList.add('view-enter');
  const titles = { dashboard: 'Dashboard', reports: 'Reports', lowstock: 'Low Stock', recentsales: 'Recent Sales', inventory: 'Inventory', sales: 'Sales', customers: 'Customers & Dues', shopkeepers: 'Shopkeepers', suppliers: 'Suppliers & Purchases' };
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
    ['shopkeepers', (docs) => (state.shopkeepers = docs)],
    ['shopkeeperSales', (docs) => (state.shopkeeperSales = docs)],
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
  if (state.view === 'reports') renderReports();
  if (state.view === 'lowstock') renderLowStock();
  if (state.view === 'recentsales') renderRecentSales();
  if (state.view === 'inventory') renderInventory();
  if (state.view === 'sales') renderSales();
  if (state.view === 'customers') renderCustomers();
  if (state.view === 'shopkeepers') renderShopkeepers();
  if (state.view === 'suppliers') renderSuppliers();
}

function renderLowStock() {
  const el = document.getElementById('view-lowstock');
  const lowStock = state.products.filter((p) => p.stock <= (p.lowStockAt ?? 5));
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>Low Stock</h3></div>
      ${lowStock.length ? `
        <table><thead><tr><th>Product</th><th>Category</th><th>Stock left</th><th>Reorder at</th><th></th></tr></thead>
        <tbody>${lowStock.map((p) => `
          <tr>
            <td data-label="Product">${p.name}</td>
            <td data-label="Category">${p.category || '—'}</td>
            <td data-label="Stock" class="mono">${crateBreakdown(p.stock, p.unitsPerCrate)}</td>
            <td data-label="Reorder at" class="mono">${p.lowStockAt ?? 5} pcs</td>
            <td data-label=""><button class="btn secondary small" onclick="editProduct('${p.id}')">Edit</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">Nothing running low right now.</div>`}
    </div>
  `;
}

function toDateInputValue(d) {
  return d.toISOString().slice(0, 10);
}

function renderReports() {
  const el = document.getElementById('view-reports');

  // Default range: last 30 days, first time only
  if (!state.reportFrom || !state.reportTo) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 29);
    state.reportFrom = toDateInputValue(from);
    state.reportTo = toDateInputValue(to);
  }

  const fromDate = new Date(state.reportFrom + 'T00:00:00');
  const toDate = new Date(state.reportTo + 'T23:59:59');
  const inRange = state.sales.filter((s) => {
    const d = new Date(s.date);
    return d >= fromDate && d <= toDate;
  });

  const totalSales = inRange.reduce((a, s) => a + s.total, 0);
  const totalProfit = inRange.reduce((a, s) => {
    const saleProfit = s.items.reduce((sa, i) => {
      const p = state.products.find((x) => x.id === i.productId);
      const cost = p ? p.costPrice : 0;
      return sa + (i.price - cost) * i.qty;
    }, 0);
    return a + saleProfit;
  }, 0);
  const avgSale = inRange.length ? totalSales / inRange.length : 0;

  const qtyByProduct = {};
  inRange.forEach((s) => s.items.forEach((i) => {
    if (!qtyByProduct[i.name]) qtyByProduct[i.name] = { qty: 0, revenue: 0 };
    qtyByProduct[i.name].qty += i.qty;
    qtyByProduct[i.name].revenue += i.lineTotal;
  }));
  const topProducts = Object.entries(qtyByProduct).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);

  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>Date Range</h3></div>
      <div style="display:flex; gap:14px; flex-wrap:wrap; align-items:flex-end; padding:16px 20px;">
        <label style="margin:0;">From<input type="date" id="rep-from" value="${state.reportFrom}" /></label>
        <label style="margin:0;">To<input type="date" id="rep-to" value="${state.reportTo}" /></label>
        <button class="btn small" id="rep-apply">Apply</button>
        <button class="btn secondary small" id="rep-last7">Last 7 days</button>
        <button class="btn secondary small" id="rep-last30">Last 30 days</button>
        <button class="btn secondary small" id="rep-thismonth">This month</button>
      </div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card"><div class="label">Sales in Range</div><div class="value">${money(totalSales)}</div></div>
      <div class="stat-card"><div class="label">Profit in Range</div><div class="value">${money(totalProfit)}</div></div>
      <div class="stat-card"><div class="label">Sales Count</div><div class="value">${inRange.length}</div></div>
      <div class="stat-card"><div class="label">Average Sale</div><div class="value">${money(avgSale)}</div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Top Products in Range</h3></div>
      ${topProducts.length ? `
        <table><thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
        <tbody>${topProducts.map(([name, d]) => `
          <tr>
            <td data-label="Product">${name}</td>
            <td data-label="Qty Sold" class="mono">${d.qty}</td>
            <td data-label="Revenue" class="mono">${money(d.revenue)}</td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No sales in this range.</div>`}
    </div>
  `;

  document.getElementById('rep-apply').addEventListener('click', () => {
    state.reportFrom = document.getElementById('rep-from').value || state.reportFrom;
    state.reportTo = document.getElementById('rep-to').value || state.reportTo;
    renderReports();
  });
  document.getElementById('rep-last7').addEventListener('click', () => {
    const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6);
    state.reportFrom = toDateInputValue(from); state.reportTo = toDateInputValue(to);
    renderReports();
  });
  document.getElementById('rep-last30').addEventListener('click', () => {
    const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29);
    state.reportFrom = toDateInputValue(from); state.reportTo = toDateInputValue(to);
    renderReports();
  });
  document.getElementById('rep-thismonth').addEventListener('click', () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    state.reportFrom = toDateInputValue(from); state.reportTo = toDateInputValue(now);
    renderReports();
  });
}

function renderRecentSales() {
  const el = document.getElementById('view-recentsales');
  const recent = state.sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 25);
  const recentTotal = recent.reduce((a, s) => a + s.total, 0);
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h3>Recent Sales</h3>
        <span class="mono" style="font-size:13px; color:var(--muted);">${recent.length} shown · ${money(recentTotal)} total</span>
      </div>
      ${renderSalesTable(recent)}
    </div>
  `;
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
  const stockValue = state.products.reduce((a, p) => a + p.stock * p.costPrice, 0);
  const totalPcs = state.products.reduce((a, p) => a + (p.stock || 0), 0);
  const totalCrates = state.products.reduce((a, p) => {
    if (!p.unitsPerCrate) return a;
    return a + Math.floor((p.stock || 0) / p.unitsPerCrate);
  }, 0);

  // This week's total sales (last 7 days including today)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const weekSales = state.sales.filter((s) => new Date(s.date) >= weekAgo);
  const weekTotal = weekSales.reduce((a, s) => a + s.total, 0);

  // Total profit — uses each product's current cost price as an estimate
  const totalProfit = state.sales.reduce((a, s) => {
    const saleProfit = s.items.reduce((sa, i) => {
      const p = state.products.find((x) => x.id === i.productId);
      const cost = p ? p.costPrice : 0;
      return sa + (i.price - cost) * i.qty;
    }, 0);
    return a + saleProfit;
  }, 0);

  // Average sale value (all-time)
  const avgSale = state.sales.length ? state.sales.reduce((a, s) => a + s.total, 0) / state.sales.length : 0;

  // Top-selling product by quantity across all sales
  const qtyByProduct = {};
  state.sales.forEach((s) => s.items.forEach((i) => {
    qtyByProduct[i.name] = (qtyByProduct[i.name] || 0) + i.qty;
  }));
  const topProductEntry = Object.entries(qtyByProduct).sort((a, b) => b[1] - a[1])[0];
  const topProductLabel = topProductEntry ? `${topProductEntry[0]} (${topProductEntry[1]} sold)` : '—';


  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="label">Today's Sales</div><div class="value">${money(todayTotal)}</div></div>
      <div class="stat-card"><div class="label">Sales Recorded Today</div><div class="value">${todaysSales.length}</div></div>
      <div class="stat-card ${totalDue > 0 ? 'warn' : ''}"><div class="label">Total Dues Owed</div><div class="value">${money(totalDue)}</div></div>
      <div class="stat-card"><div class="label">Stock Value</div><div class="value">${money(stockValue)}</div></div>
      <div class="stat-card"><div class="label">Total Crates</div><div class="value">${totalCrates}</div></div>
      <div class="stat-card"><div class="label">Total Pcs</div><div class="value">${totalPcs}</div></div>
      <div class="stat-card"><div class="label">This Week's Sales</div><div class="value">${money(weekTotal)}</div></div>
      <div class="stat-card"><div class="label">Total Profit</div><div class="value">${money(totalProfit)}</div></div>
      <div class="stat-card"><div class="label">Customers</div><div class="value">${state.customers.length}</div></div>
      <div class="stat-card"><div class="label">Suppliers</div><div class="value">${state.suppliers.length}</div></div>
      <div class="stat-card"><div class="label">Average Sale Value</div><div class="value">${money(avgSale)}</div></div>
      <div class="stat-card"><div class="label">Top-Selling Product</div><div class="value" style="font-size:15px; line-height:1.3;">${topProductLabel}</div></div>
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
  const initialCrates = p.unitsPerCrate ? Math.floor(p.stock / p.unitsPerCrate) : 0;
  const initialPcs = p.unitsPerCrate ? p.stock % p.unitsPerCrate : p.stock;

  showModal(`
    <h3>${isEdit ? 'Edit product' : 'Add product'}</h3>
    <form id="product-form">
      <label>Product name<input required id="p-name" value="${p.name}" placeholder="e.g. 500ml Water Bottle" /></label>
      <label>Category<input id="p-category" value="${p.category}" placeholder="e.g. Water, Juice, Glass" /></label>

      <div class="line-item-row" style="grid-template-columns:1fr 1fr;">
        <label style="margin:0;">Total Crates<input type="number" id="p-crates" value="${initialCrates}" min="0" /></label>
        <label style="margin:0;">Total Pcs<input type="number" id="p-pcs" value="${initialPcs}" min="0" /></label>
      </div>
      <label>Pieces per crate <span style="font-weight:400;">— how many pcs make up 1 crate (leave blank if sold loose only)</span><input type="number" id="p-percrate" value="${p.unitsPerCrate || ''}" placeholder="e.g. 12 or 24" /></label>

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

  // Keep "Total Pcs" always smaller than "Pieces per crate" — auto-roll any overflow into
  // whole crates the moment you tab away, so what's on screen always matches what gets saved.
  const cratesInput = document.getElementById('p-crates');
  const pcsInput = document.getElementById('p-pcs');
  const percrateInput = document.getElementById('p-percrate');
  function normalizeCrateFields() {
    const size = Number(percrateInput.value) || 0;
    if (size <= 0) return;
    let crates = Number(cratesInput.value) || 0;
    let pcs = Number(pcsInput.value) || 0;
    if (pcs >= size || pcs < 0) {
      crates += Math.floor(pcs / size);
      pcs = pcs % size;
      cratesInput.value = crates;
      pcsInput.value = pcs;
    }
  }
  pcsInput.addEventListener('change', normalizeCrateFields);
  percrateInput.addEventListener('change', normalizeCrateFields);

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return; // already submitting
    const perCrate = Number(document.getElementById('p-percrate').value) || null;
    const crates = Number(document.getElementById('p-crates').value) || 0;
    const looseP = Number(document.getElementById('p-pcs').value) || 0;
    const stock = perCrate ? (crates * perCrate + looseP) : looseP;
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
    try {
      if (isEdit) {
        await db.collection('products').doc(existing.id).update(data);
        toast('Product updated');
      } else {
        await db.collection('products').add(data);
        toast('Product added');
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
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
    <table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th></th></tr></thead>
    <tbody>${sales.map((s) => `
      <tr>
        <td data-label="Invoice" class="mono">${s.invoiceNo ? formatInvoice(s.invoiceNo) : '—'}</td>
        <td data-label="Date">${formatDateTime(s.date)}</td>
        <td data-label="Customer">${s.customerName || 'Walk-in'}</td>
        <td data-label="Items">${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
        <td data-label="Total" class="mono">${money(s.total)}</td>
        <td data-label="Paid" class="mono">${money(s.paid)}</td>
        <td data-label="Due">${s.due > 0 ? `<span class="pill warn">${money(s.due)}</span>` : `<span class="pill ok">Settled</span>`}</td>
        <td data-label=""><button class="btn secondary small" onclick="editSale('${s.id}')">Edit</button> <button class="btn secondary small" onclick="shareSaleWhatsApp('${s.id}')" title="Share on WhatsApp">Share</button></td>
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
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const rows = [...document.querySelectorAll('.line-item-row')];
    const items = rows.map((r) => {
      const productId = r.querySelector('.li-product').value;
      const qty = Number(r.querySelector('.li-qty').value);
      const p = state.products.find((x) => x.id === productId);
      return { productId, name: p.name, qty, price: p.salePrice, lineTotal: p.salePrice * qty };
    }).filter((i) => i.productId && i.qty > 0);

    if (!items.length) { toast('Add at least one valid item'); reEnable(); return; }

    // check stock
    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (item.qty > p.stock) { toast(`Not enough stock for ${p.name}`); reEnable(); return; }
    }

    const total = items.reduce((a, i) => a + i.lineTotal, 0);
    const paid = Number(document.getElementById('s-paid').value) || 0;
    const due = Math.max(total - paid, 0);
    const customerId = document.getElementById('s-customer').value;
    const customer = state.customers.find((c) => c.id === customerId);
    const invoiceNo = await getNextInvoiceNo();

    const batch = db.batch();
    const saleRef = db.collection('sales').doc();
    batch.set(saleRef, {
      invoiceNo,
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
    try {
      await batch.commit();
      toast('Sale recorded');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
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
    <h3>Edit sale ${s.invoiceNo ? formatInvoice(s.invoiceNo) : ''} — ${s.customerName || 'Walk-in'}</h3>
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
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const newPaid = Number(document.getElementById('es-paid').value) || 0;
    const newDue = Math.max(s.total - newPaid, 0);
    const dueDelta = newDue - s.due;
    const batch = db.batch();
    batch.update(db.collection('sales').doc(s.id), { paid: newPaid, due: newDue });
    if (s.customerId && dueDelta !== 0) {
      const customer = state.customers.find((c) => c.id === s.customerId);
      if (customer) batch.update(db.collection('customers').doc(customer.id), { totalDue: (customer.totalDue || 0) + dueDelta });
    }
    try {
      await batch.commit();
      toast('Sale updated');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
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

window.shareSaleWhatsApp = async (id) => {
  const s = state.sales.find((x) => x.id === id);
  if (!s) return;
  const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = [
    `*H.M Traders*`,
    s.invoiceNo ? `Invoice: ${formatInvoice(s.invoiceNo)}` : '',
    `Date: ${dateStr}`,
    `Customer: ${s.customerName || 'Walk-in'}`,
    '',
    ...s.items.map((i) => `${i.name} ×${i.qty} — ${money(i.lineTotal)}`),
    '',
    `Total: ${money(s.total)}`,
    `Paid: ${money(s.paid)}`,
    s.due > 0 ? `Due: ${money(s.due)}` : `Status: Settled`,
    '',
    'Thank you for your business!',
  ].filter(Boolean);
  const text = lines.join('\n');

  // Prefer the phone's native "Share to…" sheet (WhatsApp, SMS, Email, etc.),
  // same as sharing a photo from the Gallery.
  if (navigator.share) {
    try {
      await navigator.share({ title: 'H.M Traders Invoice', text });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return; // user cancelled the share sheet
      // otherwise fall through to the WhatsApp link below
    }
  }

  // Fallback (e.g. desktop browsers without native share support, or if native share
  // failed for another reason): open WhatsApp's generic composer so the person can pick
  // who to send it to themselves — never auto-target a stored number, since it may be
  // test/placeholder data rather than a real contact.
  const message = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${message}`, '_blank');
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
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const data = {
      name: document.getElementById('c-name').value.trim(),
      phone: document.getElementById('c-phone').value.trim(),
    };
    try {
      if (isEdit) {
        await db.collection('customers').doc(existing.id).update(data);
        toast('Customer updated');
      } else {
        await db.collection('customers').add({ ...data, totalDue: 0 });
        toast('Customer added');
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
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
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const amt = Number(document.getElementById('pay-amount').value);
    if (amt <= 0 || amt > c.totalDue) { toast('Enter a valid amount'); reEnable(); return; }
    try {
      await db.collection('customers').doc(c.id).update({ totalDue: c.totalDue - amt });
      toast('Payment recorded');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });
};

/* ============================================================
   SHOPKEEPERS (wholesale buyers, tracked separately from retail customers)
   ============================================================ */
function renderShopkeepers() {
  const el = document.getElementById('view-shopkeepers');
  const sales = state.shopkeeperSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>Shopkeepers</h3><button class="btn small" id="add-shopkeeper-btn">+ Add shopkeeper</button></div>
      ${state.shopkeepers.length ? `
        <table><thead><tr><th>Name</th><th>Phone</th><th>Due</th><th></th></tr></thead>
        <tbody>${state.shopkeepers.map((k) => `
          <tr>
            <td data-label="Name">${k.name}</td>
            <td data-label="Phone">${k.phone || '—'}</td>
            <td data-label="Due">${k.totalDue > 0 ? `<span class="pill warn">${money(k.totalDue)}</span>` : `<span class="pill ok">Clear</span>`}</td>
            <td data-label="">
              ${k.totalDue > 0 ? `<button class="btn secondary small" onclick="openShopkeeperPaymentModal('${k.id}')">Record payment</button>` : ''}
              <button class="btn secondary small" onclick="editShopkeeper('${k.id}')">Edit</button>
            </td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No shopkeepers yet.</div>`}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Sales to Shopkeepers</h3><button class="btn small" id="add-shopkeeper-sale-btn">+ Record sale</button></div>
      ${sales.length ? `
        <table><thead><tr><th>Invoice</th><th>Date</th><th>Shopkeeper</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th></th></tr></thead>
        <tbody>${sales.map((s) => `
          <tr>
            <td data-label="Invoice" class="mono">${s.invoiceNo ? formatInvoice(s.invoiceNo) : '—'}</td>
            <td data-label="Date">${formatDateTime(s.date)}</td>
            <td data-label="Shopkeeper">${s.shopkeeperName}</td>
            <td data-label="Items">${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
            <td data-label="Total" class="mono">${money(s.total)}</td>
            <td data-label="Paid" class="mono">${money(s.paid)}</td>
            <td data-label="Due">${s.due > 0 ? `<span class="pill warn">${money(s.due)}</span>` : `<span class="pill ok">Settled</span>`}</td>
            <td data-label=""><button class="btn secondary small" onclick="editShopkeeperSale('${s.id}')">Edit</button> <button class="btn secondary small" onclick="shareShopkeeperSaleWhatsApp('${s.id}')">Share</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No sales to shopkeepers recorded yet.</div>`}
    </div>
  `;
  document.getElementById('add-shopkeeper-btn').addEventListener('click', () => openShopkeeperModal());
  document.getElementById('add-shopkeeper-sale-btn').addEventListener('click', () => openShopkeeperSaleModal());
}

function openShopkeeperModal(existing) {
  const isEdit = !!existing;
  const k = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? 'Edit shopkeeper' : 'Add shopkeeper'}</h3>
    <form id="shopkeeper-form">
      <label>Name<input required id="k-name" value="${k.name}" /></label>
      <label>Phone<input id="k-phone" value="${k.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="k-delete">Delete</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Add shopkeeper'}</button>
      </div>
    </form>
  `);
  document.getElementById('shopkeeper-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const data = {
      name: document.getElementById('k-name').value.trim(),
      phone: document.getElementById('k-phone').value.trim(),
    };
    try {
      if (isEdit) {
        await db.collection('shopkeepers').doc(existing.id).update(data);
        toast('Shopkeeper updated');
      } else {
        await db.collection('shopkeepers').add({ ...data, totalDue: 0 });
        toast('Shopkeeper added');
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });
  if (isEdit) {
    document.getElementById('k-delete').addEventListener('click', async () => {
      if (k.totalDue > 0 && !confirm(`${k.name} still has ${money(k.totalDue)} due. Delete anyway?`)) return;
      if (k.totalDue <= 0 && !confirm(`Delete shopkeeper "${k.name}"?`)) return;
      await db.collection('shopkeepers').doc(existing.id).delete();
      toast('Shopkeeper deleted');
      closeModal();
    });
  }
}

window.editShopkeeper = (id) => {
  const k = state.shopkeepers.find((x) => x.id === id);
  if (k) openShopkeeperModal(k);
};

window.openShopkeeperPaymentModal = (shopkeeperId) => {
  const k = state.shopkeepers.find((x) => x.id === shopkeeperId);
  showModal(`
    <h3>Record payment — ${k.name}</h3>
    <form id="shopkeeper-payment-form">
      <p style="color:var(--muted); font-size:14px; margin:0;">Current due: <strong class="mono">${money(k.totalDue)}</strong></p>
      <label>Amount received<input required type="number" max="${k.totalDue}" id="kpay-amount" /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save payment</button>
      </div>
    </form>
  `);
  document.getElementById('shopkeeper-payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const amt = Number(document.getElementById('kpay-amount').value);
    if (amt <= 0 || amt > k.totalDue) { toast('Enter a valid amount'); reEnable(); return; }
    try {
      await db.collection('shopkeepers').doc(k.id).update({ totalDue: k.totalDue - amt });
      toast('Payment recorded');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });
};

function openShopkeeperSaleModal() {
  if (!state.products.length) { toast('Add a product first'); return; }
  if (!state.shopkeepers.length) { toast('Add a shopkeeper first'); return; }
  const rowId = uid();
  showModal(`
    <h3>Record sale to shopkeeper</h3>
    <form id="shopkeeper-sale-form">
      <label>Shopkeeper
        <select id="ks-shopkeeper" required>
          <option value="">Select shopkeeper…</option>
          ${state.shopkeepers.map((k) => `<option value="${k.id}">${k.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="ks-line-items">
        ${shopkeeperSaleLineRow(rowId)}
      </div>
      <button type="button" class="btn secondary small" id="ks-add-line-btn" style="align-self:flex-start;">+ Add another item</button>
      <label>Amount paid now<input type="number" id="ks-paid" value="0" required /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save sale</button>
      </div>
    </form>
  `);

  document.getElementById('ks-add-line-btn').addEventListener('click', () => {
    document.getElementById('ks-line-items').insertAdjacentHTML('beforeend', shopkeeperSaleLineRow(uid()));
  });

  document.getElementById('shopkeeper-sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const rows = [...document.querySelectorAll('#ks-line-items .line-item-row')];
    const items = rows.map((r) => {
      const productId = r.querySelector('.li-product').value;
      const qty = Number(r.querySelector('.li-qty').value);
      const p = state.products.find((x) => x.id === productId);
      return p ? { productId, name: p.name, qty, price: p.salePrice, lineTotal: p.salePrice * qty } : null;
    }).filter((i) => i && i.productId && i.qty > 0);

    if (!items.length) { toast('Add at least one valid item'); reEnable(); return; }

    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (item.qty > p.stock) { toast(`Not enough stock for ${p.name}`); reEnable(); return; }
    }

    const total = items.reduce((a, i) => a + i.lineTotal, 0);
    const paid = Number(document.getElementById('ks-paid').value) || 0;
    const due = Math.max(total - paid, 0);
    const shopkeeperId = document.getElementById('ks-shopkeeper').value;
    const shopkeeper = state.shopkeepers.find((k) => k.id === shopkeeperId);
    if (!shopkeeper) { toast('Select a shopkeeper'); reEnable(); return; }
    const invoiceNo = await getNextInvoiceNo();

    const batch = db.batch();
    const saleRef = db.collection('shopkeeperSales').doc();
    batch.set(saleRef, {
      invoiceNo,
      shopkeeperId,
      shopkeeperName: shopkeeper.name,
      items,
      total, paid, due,
      date: new Date().toISOString(),
    });
    items.forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      batch.update(db.collection('products').doc(i.productId), { stock: p.stock - i.qty });
    });
    if (due > 0) {
      batch.update(db.collection('shopkeepers').doc(shopkeeper.id), { totalDue: (shopkeeper.totalDue || 0) + due });
    }
    try {
      await batch.commit();
      toast('Sale recorded');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });
}

function shopkeeperSaleLineRow(rowId) {
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

window.editShopkeeperSale = (id) => {
  const s = state.shopkeeperSales.find((x) => x.id === id);
  if (!s) return;
  showModal(`
    <h3>Edit sale ${s.invoiceNo ? formatInvoice(s.invoiceNo) : ''} — ${s.shopkeeperName}</h3>
    <p style="color:var(--muted); font-size:14px; margin:0;">Items: ${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}<br/>Total: <strong class="mono">${money(s.total)}</strong></p>
    <form id="edit-shopkeeper-sale-form">
      <label>Amount paid<input required type="number" id="eks-paid" value="${s.paid}" /></label>
      <div class="modal-actions">
        <button type="button" class="btn danger" id="eks-delete">Delete sale</button>
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">Save changes</button>
      </div>
    </form>
  `);

  document.getElementById('edit-shopkeeper-sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const newPaid = Number(document.getElementById('eks-paid').value) || 0;
    const newDue = Math.max(s.total - newPaid, 0);
    const dueDelta = newDue - s.due;
    const batch = db.batch();
    batch.update(db.collection('shopkeeperSales').doc(s.id), { paid: newPaid, due: newDue });
    if (dueDelta !== 0) {
      const shopkeeper = state.shopkeepers.find((k) => k.id === s.shopkeeperId);
      if (shopkeeper) batch.update(db.collection('shopkeepers').doc(shopkeeper.id), { totalDue: (shopkeeper.totalDue || 0) + dueDelta });
    }
    try {
      await batch.commit();
      toast('Sale updated');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });

  document.getElementById('eks-delete').addEventListener('click', async () => {
    if (!confirm('Delete this sale? Stock and dues will be reversed.')) return;
    const batch = db.batch();
    batch.delete(db.collection('shopkeeperSales').doc(s.id));
    s.items.forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      if (p) batch.update(db.collection('products').doc(i.productId), { stock: p.stock + i.qty });
    });
    if (s.due > 0) {
      const shopkeeper = state.shopkeepers.find((k) => k.id === s.shopkeeperId);
      if (shopkeeper) batch.update(db.collection('shopkeepers').doc(shopkeeper.id), { totalDue: Math.max((shopkeeper.totalDue || 0) - s.due, 0) });
    }
    await batch.commit();
    toast('Sale deleted');
    closeModal();
  });
};

window.shareShopkeeperSaleWhatsApp = async (id) => {
  const s = state.shopkeeperSales.find((x) => x.id === id);
  if (!s) return;
  const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = [
    `*H.M Traders*`,
    s.invoiceNo ? `Invoice: ${formatInvoice(s.invoiceNo)}` : '',
    `Date: ${dateStr}`,
    `Shopkeeper: ${s.shopkeeperName}`,
    '',
    ...s.items.map((i) => `${i.name} ×${i.qty} — ${money(i.lineTotal)}`),
    '',
    `Total: ${money(s.total)}`,
    `Paid: ${money(s.paid)}`,
    s.due > 0 ? `Due: ${money(s.due)}` : `Status: Settled`,
    '',
    'Thank you for your business!',
  ].filter(Boolean);
  const text = lines.join('\n');

  if (navigator.share) {
    try {
      await navigator.share({ title: 'H.M Traders Invoice', text });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const message = encodeURIComponent(text);
  const shopkeeper = state.shopkeepers.find((k) => k.id === s.shopkeeperId);
  const phone = shopkeeper && shopkeeper.phone ? shopkeeper.phone.replace(/[^0-9]/g, '') : '';
  const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  window.open(url, '_blank');
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
            <td data-label=""><button class="btn secondary small" onclick="editSupplier('${s.id}')">Edit</button> <button class="btn danger small" onclick="deleteSupplier('${s.id}')">Delete</button></td>
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
            <td data-label=""><button class="btn secondary small" onclick="editPurchase('${p.id}')">Edit</button> <button class="btn danger small" onclick="deletePurchase('${p.id}')">Delete</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">No purchases recorded yet.</div>`}
    </div>
  `;

  document.getElementById('add-supplier-btn').addEventListener('click', () => openSupplierModal());
  document.getElementById('add-purchase-btn').addEventListener('click', () => openPurchaseModal());
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
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const data = {
      name: document.getElementById('sup-name').value.trim(),
      phone: document.getElementById('sup-phone').value.trim(),
    };
    try {
      if (isEdit) {
        await db.collection('suppliers').doc(existing.id).update(data);
        toast('Supplier updated');
      } else {
        await db.collection('suppliers').add(data);
        toast('Supplier added');
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
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

window.deleteSupplier = async (id) => {
  const s = state.suppliers.find((x) => x.id === id);
  if (!s) return;
  if (!confirm(`Delete supplier "${s.name}"? Past purchases will keep showing their recorded name.`)) return;
  await db.collection('suppliers').doc(id).delete();
  toast('Supplier deleted');
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

window.editPurchase = (id) => {
  const p = state.purchases.find((x) => x.id === id);
  if (p) openPurchaseModal(p);
};

function openPurchaseModal(existing) {
  const isEdit = !!existing;
  if (!state.suppliers.length) { toast('Add a supplier first'); return; }
  if (!state.products.length) { toast('Add a product first'); return; }
  showModal(`
    <h3>${isEdit ? 'Edit purchase' : 'Record purchase'}</h3>
    <form id="purchase-form">
      <label>Supplier
        <select id="pu-supplier" required>
          <option value="">Select supplier…</option>
          ${state.suppliers.map((s) => `<option value="${s.id}" ${isEdit && existing.supplierId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="purchase-line-items">
        ${isEdit ? existing.items.map((i) => purchaseLineRow(i)).join('') : purchaseLineRow()}
      </div>
      <button type="button" class="btn secondary small" id="add-pline-btn" style="align-self:flex-start;">+ Add another item</button>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="pu-delete">Delete</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Save purchase'}</button>
      </div>
    </form>
  `);

  document.getElementById('add-pline-btn').addEventListener('click', () => {
    document.getElementById('purchase-line-items').insertAdjacentHTML('beforeend', purchaseLineRow());
  });

  if (isEdit) {
    document.getElementById('pu-delete').addEventListener('click', () => {
      closeModal();
      deletePurchase(existing.id);
    });
  }

  document.getElementById('purchase-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const rows = [...document.querySelectorAll('#purchase-line-items .line-item-row')];
    const items = rows.map((r) => {
      const productId = r.querySelector('.li-product').value;
      const p = state.products.find((x) => x.id === productId);
      if (!p) return null;
      const crates = Number(r.querySelector('.li-crates').value) || 0;
      const looseP = Number(r.querySelector('.li-pcs').value) || 0;
      const qty = p.unitsPerCrate ? (crates * p.unitsPerCrate + looseP) : looseP;
      const costEach = Number(r.querySelector('.li-cost').value);
      return { productId, name: p.name, qty, costEach, lineTotal: qty * costEach };
    }).filter((i) => i && i.productId && i.qty > 0);

    if (!items.length) { toast('Add at least one valid item'); reEnable(); return; }

    const supplierId = document.getElementById('pu-supplier').value;
    const supplier = state.suppliers.find((s) => s.id === supplierId);
    const total = items.reduce((a, i) => a + i.lineTotal, 0);

    try {
      const batch = db.batch();
      if (isEdit) {
        // Net stock delta per product: remove what the old purchase added, then add what the new one adds.
        const delta = {};
        existing.items.forEach((i) => { delta[i.productId] = (delta[i.productId] || 0) - i.qty; });
        items.forEach((i) => { delta[i.productId] = (delta[i.productId] || 0) + i.qty; });
        Object.entries(delta).forEach(([productId, change]) => {
          if (change === 0) return;
          const p = state.products.find((x) => x.id === productId);
          if (p) batch.update(db.collection('products').doc(productId), { stock: Math.max(p.stock + change, 0) });
        });
        // Keep cost price current for items still in the new list
        items.forEach((i) => {
          batch.update(db.collection('products').doc(i.productId), { costPrice: i.costEach });
        });
        batch.update(db.collection('purchases').doc(existing.id), {
          supplierId, supplierName: supplier.name, items, total,
        });
      } else {
        const purchaseRef = db.collection('purchases').doc();
        batch.set(purchaseRef, {
          supplierId, supplierName: supplier.name, items, total, date: new Date().toISOString(),
        });
        items.forEach((i) => {
          const p = state.products.find((x) => x.id === i.productId);
          batch.update(db.collection('products').doc(i.productId), {
            stock: p.stock + i.qty,
            costPrice: i.costEach,
          });
        });
      }
      await batch.commit();
      toast(isEdit ? 'Purchase updated' : 'Purchase recorded, stock updated');
      closeModal();
    } catch (err) {
      reEnable();
      toast('Save failed — try again');
    }
  });
}

function purchaseLineRow(existingItem) {
  const selectedProductId = existingItem ? existingItem.productId : '';
  const p = existingItem ? state.products.find((x) => x.id === existingItem.productId) : null;
  const split = existingItem ? splitCratesPcs(existingItem.qty, p ? p.unitsPerCrate : null) : { crates: 0, pcs: 0 };
  return `
    <div class="line-item-row" style="grid-template-columns:1.6fr 0.7fr 0.7fr 0.8fr auto;">
      <select class="li-product">
        <option value="">Select product…</option>
        ${state.products.map((pr) => `<option value="${pr.id}" ${pr.id === selectedProductId ? 'selected' : ''}>${pr.name}${pr.unitsPerCrate ? ` (${pr.unitsPerCrate}/crate)` : ''}</option>`).join('')}
      </select>
      <input class="li-crates" type="number" min="0" value="${split.crates ?? 0}" placeholder="Crates" title="Crates" />
      <input class="li-pcs" type="number" min="0" value="${split.pcs ?? 0}" placeholder="Pcs" title="Loose pcs" />
      <input class="li-cost" type="number" min="0" value="${existingItem ? existingItem.costEach : ''}" placeholder="Cost/pc" />
      <button type="button" class="btn secondary small" onclick="this.closest('.line-item-row').remove()">✕</button>
    </div>
  `;
}

/* ============================================================
   Modal helper
   ============================================================ */
function showModal(innerHtml) {
  // Remove any leftover modal instantly first — guarantees only one ever exists,
  // so a fast-opened new modal can never get mixed up with a closing old one.
  const stale = document.getElementById('modal-overlay');
  if (stale) stale.remove();

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
    setTimeout(() => {
      // Only remove if it's still the same element (a newer modal may have already replaced it)
      if (existing.parentNode) existing.remove();
    }, 160);
  }
}

/* ---------------- PWA service worker ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });

  // Auto-refresh: whenever a newer version of the app takes over, reload once
  // automatically so the app never gets stuck showing an old cached version.
  let hasReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  });
}
