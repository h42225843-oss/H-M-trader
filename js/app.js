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
  lang: 'en',
};

const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
const todayStr = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/* ---------------- Language (English / Urdu) ---------------- */
const translations = {
  en: {
    loginSub: 'Ledger & Stock Register',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signIn: 'Sign in',
    navDashboard: 'Dashboard',
    navReports: 'Reports',
    navLowStock: 'Low Stock',
    navRecentSales: 'Recent Sales',
    navInventory: 'Inventory',
    navSales: 'Sales',
    navCustomers: 'Customers & Dues',
    navShopkeepers: 'Shopkeepers',
    navSuppliers: 'Suppliers & Purchases',
    langToggleLabel: 'اردو / English',
    signOut: 'Sign out',
    navHome: 'Home',
    navStock: 'Stock',
    navDues: 'Dues',
    navSuppliersShort: 'Suppliers',
    navMore: 'More',
    cancel: 'Cancel',

    edit: 'Edit',
    delete: 'Delete',
    saveChanges: 'Save changes',
    share: 'Share',
    recordPayment: 'Record payment',
    settled: 'Settled',
    clearStatus: 'Clear',
    saving: 'Saving…',
    saveFailed: 'Save failed — try again',
    pcs: 'pcs',
    crate: 'crate',
    crates: 'crates',
    walkIn: 'Walk-in',
    unitPriceAuto: 'unit price auto',
    selectProduct: 'Select product…',
    selectSupplier: 'Select supplier…',
    selectShopkeeper: 'Select shopkeeper…',
    addAnotherItem: '+ Add another item',

    colName: 'Name',
    colCategory: 'Category',
    colStock: 'Stock',
    colCrates: 'Crates',
    colPcs: 'Pcs',
    colCost: 'Cost',
    colSalePrice: 'Sale price',
    colPhone: 'Phone',
    colDue: 'Due',
    colInvoice: 'Invoice',
    colDate: 'Date',
    colCustomer: 'Customer',
    colShopkeeperCol: 'Shopkeeper',
    colItems: 'Items',
    colTotal: 'Total',
    colPaid: 'Paid',
    colSupplierCol: 'Supplier',
    colProduct: 'Product',
    colStockLeft: 'Stock left',
    colReorderAt: 'Reorder at',
    colQtySold: 'Qty Sold',
    colRevenue: 'Revenue',

    productsHeading: 'Products',
    lowStockHeading: 'Low Stock',
    dateRangeHeading: 'Date Range',
    topProductsHeading: 'Top Products in Range',
    recentSalesHeading: 'Recent Sales',
    allSalesHeading: 'All sales',
    customersHeading: 'Customers',
    shopkeepersHeading: 'Shopkeepers',
    salesToShopkeepersHeading: 'Sales to Shopkeepers',
    suppliersHeading: 'Suppliers',
    purchasesHeading: 'Purchases',

    addProductBtn: '+ Add product',
    recordSaleBtn: '+ Record sale',
    addCustomerBtn: '+ Add customer',
    addShopkeeperBtn: '+ Add shopkeeper',
    addSupplierBtn: '+ Add supplier',
    recordPurchaseBtn: '+ Record purchase',
    applyBtn: 'Apply',
    last7Btn: 'Last 7 days',
    last30Btn: 'Last 30 days',
    thisMonthBtn: 'This month',
    fromLabel: 'From',
    toLabel: 'To',

    editProductTitle: 'Edit product',
    addProductTitle: 'Add product',
    editSaleTitlePrefix: 'Edit sale',
    recordSaleTitle: 'Record sale',
    editCustomerTitle: 'Edit customer',
    addCustomerTitle: 'Add customer',
    editShopkeeperTitle: 'Edit shopkeeper',
    addShopkeeperTitle: 'Add shopkeeper',
    editSupplierTitle: 'Edit supplier',
    addSupplierTitle: 'Add supplier',
    editPurchaseTitle: 'Edit purchase',
    recordPurchaseTitle: 'Record purchase',
    recordSaleToShopkeeperTitle: 'Record sale to shopkeeper',
    recordPaymentPrefix: 'Record payment',

    productNameLabel: 'Product name',
    categoryLabel: 'Category',
    totalCratesLabel: 'Total Crates',
    totalPcsLabel: 'Total Pcs',
    piecesPerCrateLabel: 'Pieces per crate',
    piecesPerCrateHint: '— how many pcs make up 1 crate (leave blank if sold loose only)',
    lowStockAlertLabel: 'Low stock alert at (pcs)',
    costPriceLabel: 'Cost price (per pc)',
    salePriceLabel: 'Sale price (per pc)',
    nameLabel: 'Name',
    phoneLabel: 'Phone',
    customerLabel: 'Customer',
    shopkeeperLabel: 'Shopkeeper',
    supplierLabel: 'Supplier',
    amountPaidNowLabel: 'Amount paid now',
    amountReceivedLabel: 'Amount received',
    currentDueLabel: 'Current due:',
    itemsLabel: 'Items:',
    totalLabelColon: 'Total:',
    deleteSaleBtn: 'Delete sale',
    savePaymentBtn: 'Save payment',
    saveSaleBtn: 'Save sale',
    savePurchaseBtn: 'Save purchase',

    noProductsEmpty: 'No products yet. Add your first bottle product to get started.',
    nothingLowStock: 'Nothing running low right now.',
    noSalesInRange: 'No sales in this range.',
    noSalesRecorded: 'No sales recorded yet.',
    noCustomersYet: 'No customers yet.',
    noShopkeepersYet: 'No shopkeepers yet.',
    noSalesToShopkeepersYet: 'No sales to shopkeepers recorded yet.',
    noSuppliersYet: 'No suppliers yet.',
    noPurchasesYet: 'No purchases recorded yet.',

    productUpdated: 'Product updated',
    productAdded: 'Product added',
    productDeleted: 'Product deleted',
    saleRecorded: 'Sale recorded',
    saleUpdated: 'Sale updated',
    saleDeleted: 'Sale deleted',
    addProductFirst: 'Add a product first',
    addAtLeastOneItem: 'Add at least one valid item',
    customerUpdated: 'Customer updated',
    customerAdded: 'Customer added',
    customerDeleted: 'Customer deleted',
    enterValidAmount: 'Enter a valid amount',
    paymentRecorded: 'Payment recorded',
    shopkeeperUpdated: 'Shopkeeper updated',
    shopkeeperAdded: 'Shopkeeper added',
    shopkeeperDeleted: 'Shopkeeper deleted',
    selectShopkeeperToast: 'Select a shopkeeper',
    supplierUpdated: 'Supplier updated',
    supplierAdded: 'Supplier added',
    supplierDeleted: 'Supplier deleted',
    purchaseUpdated: 'Purchase updated',
    purchaseRecordedStockUpdated: 'Purchase recorded, stock updated',
    purchaseDeleted: 'Purchase deleted',
    addSupplierFirst: 'Add a supplier first',
    addShopkeeperFirst: 'Add a shopkeeper first',
    notEnoughStockFor: 'Not enough stock for',

    confirmDeleteCannotUndo: 'This cannot be undone.',
    confirmDeleteSaleBody: 'Delete this sale? Stock and customer dues will be reversed.',
    confirmDeleteShopkeeperSaleBody: 'Delete this sale? Stock and dues will be reversed.',
    confirmStillHasDue: 'still has',
    confirmDueDeleteAnyway: 'due. Delete anyway?',
    confirmDeleteCustomerPrefix: 'Delete customer',
    confirmDeleteShopkeeperPrefix: 'Delete shopkeeper',
    confirmDeleteSupplierPrefix: 'Delete supplier',
    confirmDeleteSupplierSuffix: '? Past purchases will keep showing their recorded name.',
    confirmDeletePurchasePrefix: 'Delete this purchase from',
    confirmDeletePurchaseSuffix: '? Stock added by it will be reversed.',

    statTodaySales: "Today's Sales",
    statSalesRecordedToday: 'Sales Recorded Today',
    statTotalDues: 'Total Dues Owed',
    statStockValue: 'Stock Value',
    statTotalCrates: 'Total Crates',
    statTotalPcs: 'Total Pcs',
    statWeekSales: "This Week's Sales",
    statTotalProfit: 'Total Profit',
    statCustomers: 'Customers',
    statSuppliers: 'Suppliers',
    statAvgSale: 'Average Sale Value',
    statTopProduct: 'Top-Selling Product',
    statSalesInRange: 'Sales in Range',
    statProfitInRange: 'Profit in Range',
    statSalesCount: 'Sales Count',
    statAverageSale: 'Average Sale',

    waInvoiceLabel: 'Invoice:',
    waDateLabel: 'Date:',
    waCustomerLabel: 'Customer:',
    waShopkeeperLabel: 'Shopkeeper:',
    waTotalLabel: 'Total:',
    waPaidLabel: 'Paid:',
    waDueLabel: 'Due:',
    waStatusSettled: 'Status: Settled',
    waThanks: 'Thank you for your business!',
    waShareTitle: 'H.M Traders Invoice',
  },
  ur: {
    loginSub: 'لیجر اور اسٹاک رجسٹر',
    emailLabel: 'ای میل',
    passwordLabel: 'پاس ورڈ',
    signIn: 'سائن ان کریں',
    navDashboard: 'ڈیش بورڈ',
    navReports: 'رپورٹس',
    navLowStock: 'کم اسٹاک',
    navRecentSales: 'حالیہ فروخت',
    navInventory: 'انوینٹری',
    navSales: 'فروخت',
    navCustomers: 'کسٹمرز اور واجبات',
    navShopkeepers: 'دکاندار',
    navSuppliers: 'سپلائرز اور خریداری',
    langToggleLabel: 'اردو / English',
    signOut: 'سائن آؤٹ',
    navHome: 'ہوم',
    navStock: 'اسٹاک',
    navDues: 'واجبات',
    navSuppliersShort: 'سپلائرز',
    navMore: 'مزید',
    cancel: 'منسوخ کریں',

    edit: 'ترمیم',
    delete: 'حذف کریں',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    share: 'شیئر کریں',
    recordPayment: 'ادائیگی درج کریں',
    settled: 'ادا شدہ',
    clearStatus: 'صاف',
    saving: 'محفوظ ہو رہا ہے…',
    saveFailed: 'محفوظ کرنے میں ناکامی — دوبارہ کوشش کریں',
    pcs: 'عدد',
    crate: 'کریٹ',
    crates: 'کریٹس',
    walkIn: 'واک اِن',
    unitPriceAuto: 'قیمت خودکار',
    selectProduct: 'پروڈکٹ منتخب کریں…',
    selectSupplier: 'سپلائر منتخب کریں…',
    selectShopkeeper: 'دکاندار منتخب کریں…',
    addAnotherItem: '+ ایک اور آئٹم شامل کریں',

    colName: 'نام',
    colCategory: 'کیٹیگری',
    colStock: 'اسٹاک',
    colCrates: 'کریٹس',
    colPcs: 'عدد',
    colCost: 'لاگت',
    colSalePrice: 'فروخت قیمت',
    colPhone: 'فون',
    colDue: 'واجب الادا',
    colInvoice: 'انوائس',
    colDate: 'تاریخ',
    colCustomer: 'کسٹمر',
    colShopkeeperCol: 'دکاندار',
    colItems: 'اشیاء',
    colTotal: 'کل',
    colPaid: 'ادا شدہ',
    colSupplierCol: 'سپلائر',
    colProduct: 'پروڈکٹ',
    colStockLeft: 'باقی اسٹاک',
    colReorderAt: 'دوبارہ آرڈر پر',
    colQtySold: 'فروخت شدہ مقدار',
    colRevenue: 'آمدنی',

    productsHeading: 'پروڈکٹس',
    lowStockHeading: 'کم اسٹاک',
    dateRangeHeading: 'تاریخ کی حد',
    topProductsHeading: 'اس مدت کی بہترین پروڈکٹس',
    recentSalesHeading: 'حالیہ فروخت',
    allSalesHeading: 'تمام فروخت',
    customersHeading: 'کسٹمرز',
    shopkeepersHeading: 'دکاندار',
    salesToShopkeepersHeading: 'دکانداروں کو فروخت',
    suppliersHeading: 'سپلائرز',
    purchasesHeading: 'خریداری',

    addProductBtn: '+ پروڈکٹ شامل کریں',
    recordSaleBtn: '+ فروخت درج کریں',
    addCustomerBtn: '+ کسٹمر شامل کریں',
    addShopkeeperBtn: '+ دکاندار شامل کریں',
    addSupplierBtn: '+ سپلائر شامل کریں',
    recordPurchaseBtn: '+ خریداری درج کریں',
    applyBtn: 'لاگو کریں',
    last7Btn: 'گزشتہ 7 دن',
    last30Btn: 'گزشتہ 30 دن',
    thisMonthBtn: 'اس مہینے',
    fromLabel: 'سے',
    toLabel: 'تک',

    editProductTitle: 'پروڈکٹ میں ترمیم کریں',
    addProductTitle: 'پروڈکٹ شامل کریں',
    editSaleTitlePrefix: 'فروخت میں ترمیم کریں',
    recordSaleTitle: 'فروخت درج کریں',
    editCustomerTitle: 'کسٹمر میں ترمیم کریں',
    addCustomerTitle: 'کسٹمر شامل کریں',
    editShopkeeperTitle: 'دکاندار میں ترمیم کریں',
    addShopkeeperTitle: 'دکاندار شامل کریں',
    editSupplierTitle: 'سپلائر میں ترمیم کریں',
    addSupplierTitle: 'سپلائر شامل کریں',
    editPurchaseTitle: 'خریداری میں ترمیم کریں',
    recordPurchaseTitle: 'خریداری درج کریں',
    recordSaleToShopkeeperTitle: 'دکاندار کو فروخت درج کریں',
    recordPaymentPrefix: 'ادائیگی درج کریں',

    productNameLabel: 'پروڈکٹ کا نام',
    categoryLabel: 'کیٹیگری',
    totalCratesLabel: 'کل کریٹس',
    totalPcsLabel: 'کل عدد',
    piecesPerCrateLabel: 'فی کریٹ عدد',
    piecesPerCrateHint: '— ایک کریٹ میں کتنے عدد ہیں (اگر صرف کھلا فروخت ہوتا ہے تو خالی چھوڑ دیں)',
    lowStockAlertLabel: 'کم اسٹاک الرٹ (عدد)',
    costPriceLabel: 'لاگت قیمت (فی عدد)',
    salePriceLabel: 'فروخت قیمت (فی عدد)',
    nameLabel: 'نام',
    phoneLabel: 'فون',
    customerLabel: 'کسٹمر',
    shopkeeperLabel: 'دکاندار',
    supplierLabel: 'سپلائر',
    amountPaidNowLabel: 'ابھی ادا کی گئی رقم',
    amountReceivedLabel: 'وصول شدہ رقم',
    currentDueLabel: 'موجودہ واجب الادا:',
    itemsLabel: 'اشیاء:',
    totalLabelColon: 'کل:',
    deleteSaleBtn: 'فروخت حذف کریں',
    savePaymentBtn: 'ادائیگی محفوظ کریں',
    saveSaleBtn: 'فروخت محفوظ کریں',
    savePurchaseBtn: 'خریداری محفوظ کریں',

    noProductsEmpty: 'ابھی تک کوئی پروڈکٹ نہیں۔ شروع کرنے کے لیے اپنی پہلی بوتل پروڈکٹ شامل کریں۔',
    nothingLowStock: 'اس وقت کوئی چیز کم نہیں ہے۔',
    noSalesInRange: 'اس مدت میں کوئی فروخت نہیں۔',
    noSalesRecorded: 'ابھی تک کوئی فروخت درج نہیں ہوئی۔',
    noCustomersYet: 'ابھی تک کوئی کسٹمر نہیں۔',
    noShopkeepersYet: 'ابھی تک کوئی دکاندار نہیں۔',
    noSalesToShopkeepersYet: 'ابھی تک دکانداروں کو کوئی فروخت درج نہیں ہوئی۔',
    noSuppliersYet: 'ابھی تک کوئی سپلائر نہیں۔',
    noPurchasesYet: 'ابھی تک کوئی خریداری درج نہیں ہوئی۔',

    productUpdated: 'پروڈکٹ اپ ڈیٹ ہو گئی',
    productAdded: 'پروڈکٹ شامل ہو گئی',
    productDeleted: 'پروڈکٹ حذف ہو گئی',
    saleRecorded: 'فروخت درج ہو گئی',
    saleUpdated: 'فروخت اپ ڈیٹ ہو گئی',
    saleDeleted: 'فروخت حذف ہو گئی',
    addProductFirst: 'پہلے ایک پروڈکٹ شامل کریں',
    addAtLeastOneItem: 'کم از کم ایک درست آئٹم شامل کریں',
    customerUpdated: 'کسٹمر اپ ڈیٹ ہو گیا',
    customerAdded: 'کسٹمر شامل ہو گیا',
    customerDeleted: 'کسٹمر حذف ہو گیا',
    enterValidAmount: 'ایک درست رقم درج کریں',
    paymentRecorded: 'ادائیگی درج ہو گئی',
    shopkeeperUpdated: 'دکاندار اپ ڈیٹ ہو گیا',
    shopkeeperAdded: 'دکاندار شامل ہو گیا',
    shopkeeperDeleted: 'دکاندار حذف ہو گیا',
    selectShopkeeperToast: 'ایک دکاندار منتخب کریں',
    supplierUpdated: 'سپلائر اپ ڈیٹ ہو گیا',
    supplierAdded: 'سپلائر شامل ہو گیا',
    supplierDeleted: 'سپلائر حذف ہو گیا',
    purchaseUpdated: 'خریداری اپ ڈیٹ ہو گئی',
    purchaseRecordedStockUpdated: 'خریداری درج ہو گئی، اسٹاک اپ ڈیٹ ہو گیا',
    purchaseDeleted: 'خریداری حذف ہو گئی',
    addSupplierFirst: 'پہلے ایک سپلائر شامل کریں',
    addShopkeeperFirst: 'پہلے ایک دکاندار شامل کریں',
    notEnoughStockFor: 'کافی اسٹاک نہیں ہے:',

    confirmDeleteCannotUndo: 'یہ واپس نہیں ہو سکتا۔',
    confirmDeleteSaleBody: 'یہ فروخت حذف کریں؟ اسٹاک اور کسٹمر کے واجبات واپس ہو جائیں گے۔',
    confirmDeleteShopkeeperSaleBody: 'یہ فروخت حذف کریں؟ اسٹاک اور واجبات واپس ہو جائیں گے۔',
    confirmStillHasDue: 'کے ذمے ابھی بھی',
    confirmDueDeleteAnyway: 'واجب الادا ہے۔ پھر بھی حذف کریں؟',
    confirmDeleteCustomerPrefix: 'کسٹمر حذف کریں',
    confirmDeleteShopkeeperPrefix: 'دکاندار حذف کریں',
    confirmDeleteSupplierPrefix: 'سپلائر حذف کریں',
    confirmDeleteSupplierSuffix: '؟ پرانی خریداریوں میں ان کا نام ویسے ہی نظر آتا رہے گا۔',
    confirmDeletePurchasePrefix: 'یہ خریداری حذف کریں از',
    confirmDeletePurchaseSuffix: '؟ اس سے شامل ہونے والا اسٹاک واپس لے لیا جائے گا۔',

    statTodaySales: 'آج کی فروخت',
    statSalesRecordedToday: 'آج درج شدہ فروخت',
    statTotalDues: 'کل واجب الادا رقم',
    statStockValue: 'اسٹاک کی مالیت',
    statTotalCrates: 'کل کریٹس',
    statTotalPcs: 'کل عدد',
    statWeekSales: 'اس ہفتے کی فروخت',
    statTotalProfit: 'کل منافع',
    statCustomers: 'کسٹمرز',
    statSuppliers: 'سپلائرز',
    statAvgSale: 'اوسط فروخت قیمت',
    statTopProduct: 'سب سے زیادہ فروخت ہونے والی پروڈکٹ',
    statSalesInRange: 'اس مدت کی فروخت',
    statProfitInRange: 'اس مدت کا منافع',
    statSalesCount: 'فروخت کی تعداد',
    statAverageSale: 'اوسط فروخت',

    waInvoiceLabel: 'انوائس:',
    waDateLabel: 'تاریخ:',
    waCustomerLabel: 'کسٹمر:',
    waShopkeeperLabel: 'دکاندار:',
    waTotalLabel: 'کل:',
    waPaidLabel: 'ادا شدہ:',
    waDueLabel: 'واجب الادا:',
    waStatusSettled: 'حیثیت: ادا شدہ',
    waThanks: 'آپ کے کاروبار کا شکریہ!',
    waShareTitle: 'ایچ ایم ٹریڈرز انوائس',
  },
};

function tr(key) {
  const dict = translations[state.lang] || translations.en;
  return (dict && dict[key] != null) ? dict[key] : (translations.en[key] != null ? translations.en[key] : key);
}

function applyLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  const dict = translations[lang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  try { localStorage.setItem('hm_lang', lang); } catch (e) { /* ignore */ }
  // Re-render the current page's title and content in the new language
  if (typeof setView === 'function' && state.view) setView(state.view);
}

function initLanguage() {
  let saved = 'en';
  try { saved = localStorage.getItem('hm_lang') || 'en'; } catch (e) { /* ignore */ }
  applyLanguage(saved);
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      applyLanguage(state.lang === 'ur' ? 'en' : 'ur');
    });
  }
}

const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
const uid = () => Math.random().toString(36).slice(2, 10);

// Formats a raw piece-count as "N crates + M pcs" using the product's crate size.
function crateBreakdown(pcs, perCrate) {
  const size = Number(perCrate) > 0 ? Number(perCrate) : null;
  if (!size) return `${pcs} ${tr('pcs')}`;
  const crates = Math.floor(pcs / size);
  const rem = pcs % size;
  const crateWord = tr(crates !== 1 && state.lang !== 'ur' ? 'crates' : 'crate');
  if (crates === 0) return `${rem} ${tr('pcs')}`;
  if (rem === 0) return `${crates} ${crateWord}`;
  return `${crates} ${crateWord} + ${rem} ${tr('pcs')}`;
}

// Splits raw pcs into { crates, pcs } separately, using the product's crate size.
function splitCratesPcs(pcs, perCrate) {
  const size = Number(perCrate) > 0 ? Number(perCrate) : null;
  if (!size) return { crates: null, pcs };
  return { crates: Math.floor(pcs / size), pcs: pcs % size };
}

// True on a real desktop/laptop (mouse-driven, no touch) — false on phones/tablets.
// Used to skip the OS share menu on PC and jump straight to WhatsApp instead.
function isDesktopDevice() {
  return window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(pointer: coarse)').matches;
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

// Animates every [data-countup] number inside a container from 0 to its real value.
// data-format is "money" or "int". Call right after setting a panel's innerHTML.
function animateCountUps(container) {
  container.querySelectorAll('[data-countup]').forEach((el) => {
    const target = Number(el.dataset.countup) || 0;
    const isMoney = el.dataset.format === 'money';
    const duration = 650;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const current = Math.round(target * eased);
      el.textContent = isMoney ? money(current) : current.toLocaleString('en-PK');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
  btn.textContent = tr('saving');
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
  const dict = translations[state.lang] || translations.en;
  const titles = { dashboard: dict.navDashboard, reports: dict.navReports, lowstock: dict.navLowStock, recentsales: dict.navRecentSales, inventory: dict.navInventory, sales: dict.navSales, customers: dict.navCustomers, shopkeepers: dict.navShopkeepers, suppliers: dict.navSuppliers };
  document.getElementById('view-title').textContent = titles[view];
  renderAll();
}

document.getElementById('topbar-date').textContent = todayStr();
initLanguage();

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
      <div class="panel-head"><h3>${tr('lowStockHeading')}</h3></div>
      ${lowStock.length ? `
        <table><thead><tr><th>${tr('colProduct')}</th><th>${tr('colCategory')}</th><th>${tr('colStockLeft')}</th><th>${tr('colReorderAt')}</th><th></th></tr></thead>
        <tbody>${lowStock.map((p) => `
          <tr>
            <td data-label="${tr('colProduct')}">${p.name}</td>
            <td data-label="${tr('colCategory')}">${p.category || '—'}</td>
            <td data-label="${tr('colStock')}" class="mono">${crateBreakdown(p.stock, p.unitsPerCrate)}</td>
            <td data-label="${tr('colReorderAt')}" class="mono">${p.lowStockAt ?? 5} ${tr('pcs')}</td>
            <td data-label=""><button class="btn secondary small" onclick="editProduct('${p.id}')">${tr('edit')}</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('nothingLowStock')}</div>`}
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
      <div class="panel-head"><h3>${tr('dateRangeHeading')}</h3></div>
      <div style="display:flex; gap:14px; flex-wrap:wrap; align-items:flex-end; padding:16px 20px;">
        <label style="margin:0;">${tr('fromLabel')}<input type="date" id="rep-from" value="${state.reportFrom}" /></label>
        <label style="margin:0;">${tr('toLabel')}<input type="date" id="rep-to" value="${state.reportTo}" /></label>
        <button class="btn small" id="rep-apply">${tr('applyBtn')}</button>
        <button class="btn secondary small" id="rep-last7">${tr('last7Btn')}</button>
        <button class="btn secondary small" id="rep-last30">${tr('last30Btn')}</button>
        <button class="btn secondary small" id="rep-thismonth">${tr('thisMonthBtn')}</button>
      </div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card"><div class="label">${tr('statSalesInRange')}</div><div class="value" data-countup="${totalSales}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statProfitInRange')}</div><div class="value" data-countup="${totalProfit}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statSalesCount')}</div><div class="value" data-countup="${inRange.length}" data-format="int">0</div></div>
      <div class="stat-card"><div class="label">${tr('statAverageSale')}</div><div class="value" data-countup="${Math.round(avgSale)}" data-format="money">Rs 0</div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>${tr('topProductsHeading')}</h3></div>
      ${topProducts.length ? `
        <table><thead><tr><th>${tr('colProduct')}</th><th>${tr('colQtySold')}</th><th>${tr('colRevenue')}</th></tr></thead>
        <tbody>${topProducts.map(([name, d]) => `
          <tr>
            <td data-label="${tr('colProduct')}">${name}</td>
            <td data-label="${tr('colQtySold')}" class="mono">${d.qty}</td>
            <td data-label="${tr('colRevenue')}" class="mono">${money(d.revenue)}</td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noSalesInRange')}</div>`}
    </div>
  `;
  animateCountUps(el);

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
        <h3>${tr('recentSalesHeading')}</h3>
        <span class="mono" style="font-size:13px; color:var(--muted);">${recent.length} · ${money(recentTotal)}</span>
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
  const topProductLabel = topProductEntry ? `${topProductEntry[0]} (${topProductEntry[1]})` : '—';


  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="label">${tr('statTodaySales')}</div><div class="value" data-countup="${todayTotal}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statSalesRecordedToday')}</div><div class="value" data-countup="${todaysSales.length}" data-format="int">0</div></div>
      <div class="stat-card ${totalDue > 0 ? 'warn' : ''}"><div class="label">${tr('statTotalDues')}</div><div class="value" data-countup="${totalDue}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statStockValue')}</div><div class="value" data-countup="${stockValue}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statTotalCrates')}</div><div class="value" data-countup="${totalCrates}" data-format="int">0</div></div>
      <div class="stat-card"><div class="label">${tr('statTotalPcs')}</div><div class="value" data-countup="${totalPcs}" data-format="int">0</div></div>
      <div class="stat-card"><div class="label">${tr('statWeekSales')}</div><div class="value" data-countup="${weekTotal}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statTotalProfit')}</div><div class="value" data-countup="${totalProfit}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statCustomers')}</div><div class="value" data-countup="${state.customers.length}" data-format="int">0</div></div>
      <div class="stat-card"><div class="label">${tr('statSuppliers')}</div><div class="value" data-countup="${state.suppliers.length}" data-format="int">0</div></div>
      <div class="stat-card"><div class="label">${tr('statAvgSale')}</div><div class="value" data-countup="${Math.round(avgSale)}" data-format="money">Rs 0</div></div>
      <div class="stat-card"><div class="label">${tr('statTopProduct')}</div><div class="value" style="font-size:15px; line-height:1.3;">${topProductLabel}</div></div>
    </div>
  `;
  animateCountUps(el);
}

/* ============================================================
   INVENTORY
   ============================================================ */
function renderInventory() {
  const el = document.getElementById('view-inventory');

  if (!state.products.length) {
    el.innerHTML = `
      <div class="panel">
        <div class="panel-head"><h3>${tr('productsHeading')}</h3><button class="btn small" id="add-product-btn">${tr('addProductBtn')}</button></div>
        <div class="empty-state">${tr('noProductsEmpty')}</div>
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
  const catTotals = categoryTotals(activeProducts);

  el.innerHTML = `
    <div class="category-tabs">
      ${tabs.map((cat) => `<button class="cat-tab ${cat === state.inventoryTab ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('')}
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr); margin-bottom:18px;">
      <div class="stat-card"><div class="label">${state.inventoryTab} — ${tr('colCrates')}</div><div class="value">${catTotals.crates}</div></div>
      <div class="stat-card"><div class="label">${state.inventoryTab} — ${tr('colPcs')}</div><div class="value">${catTotals.pcs}</div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>${tr('productsHeading')}</h3><button class="btn small" id="add-product-btn">${tr('addProductBtn')}</button></div>
      <table><thead><tr><th>${tr('colName')}</th><th>${tr('colCategory')}</th><th>${tr('colCrates')}</th><th>${tr('colPcs')}</th><th>${tr('colCost')}</th><th>${tr('colSalePrice')}</th><th></th></tr></thead>
      <tbody>${activeProducts.map((p) => {
        const split = splitCratesPcs(p.stock, p.unitsPerCrate);
        const low = p.stock <= (p.lowStockAt ?? 5);
        return `
        <tr>
          <td data-label="${tr('colName')}">${p.name}</td>
          <td data-label="${tr('colCategory')}">${p.category || '—'}</td>
          <td data-label="${tr('colCrates')}" class="mono">${split.crates === null ? '—' : (low ? `<span class="pill warn">${split.crates}</span>` : split.crates)}</td>
          <td data-label="${tr('colPcs')}" class="mono">${low && split.crates === null ? `<span class="pill warn">${split.pcs}</span>` : split.pcs}</td>
          <td data-label="${tr('colCost')}" class="mono">${money(p.costPrice)}</td>
          <td data-label="${tr('colSalePrice')}" class="mono">${money(p.salePrice)}</td>
          <td data-label=""><button class="btn secondary small" onclick="editProduct('${p.id}')">${tr('edit')}</button></td>
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
    <h3>${isEdit ? tr('editProductTitle') : tr('addProductTitle')}</h3>
    <form id="product-form">
      <label>${tr('productNameLabel')}<input required id="p-name" value="${p.name}" placeholder="e.g. 500ml Water Bottle" /></label>
      <label>${tr('categoryLabel')}<input id="p-category" value="${p.category}" placeholder="e.g. Water, Juice, Glass" /></label>

      <div class="line-item-row" style="grid-template-columns:1fr 1fr;">
        <label style="margin:0;">${tr('totalCratesLabel')}<input type="number" id="p-crates" value="${initialCrates}" min="0" /></label>
        <label style="margin:0;">${tr('totalPcsLabel')}<input type="number" id="p-pcs" value="${initialPcs}" min="0" /></label>
      </div>
      <label>${tr('piecesPerCrateLabel')} <span style="font-weight:400;">${tr('piecesPerCrateHint')}</span><input type="number" id="p-percrate" value="${p.unitsPerCrate || ''}" placeholder="e.g. 12 or 24" /></label>

      <label>${tr('lowStockAlertLabel')}<input type="number" id="p-lowstock" value="${p.lowStockAt}" /></label>
      <label>${tr('costPriceLabel')}<input required type="number" id="p-cost" value="${p.costPrice}" /></label>
      <label>${tr('salePriceLabel')}<input required type="number" id="p-sale" value="${p.salePrice}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="p-delete">${tr('delete')}</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${isEdit ? tr('saveChanges') : tr('addProductBtn').replace('+ ', '')}</button>
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
    const perCrate = Number(percrateInput.value) || null;
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
        toast(tr('productUpdated'));
      } else {
        await db.collection('products').add(data);
        toast(tr('productAdded'));
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });

  if (isEdit) {
    document.getElementById('p-delete').addEventListener('click', async () => {
      if (confirm(`${tr('delete')} "${p.name}"? ${tr('confirmDeleteCannotUndo')}`)) {
        await db.collection('products').doc(existing.id).delete();
        toast(tr('productDeleted'));
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
  if (!sales.length) return `<div class="empty-state">${tr('noSalesRecorded')}</div>`;
  return `
    <table><thead><tr><th>${tr('colInvoice')}</th><th>${tr('colDate')}</th><th>${tr('colCustomer')}</th><th>${tr('colItems')}</th><th>${tr('colTotal')}</th><th>${tr('colPaid')}</th><th>${tr('colDue')}</th><th></th></tr></thead>
    <tbody>${sales.map((s) => `
      <tr>
        <td data-label="${tr('colInvoice')}" class="mono">${s.invoiceNo ? formatInvoice(s.invoiceNo) : '—'}</td>
        <td data-label="${tr('colDate')}">${formatDateTime(s.date)}</td>
        <td data-label="${tr('colCustomer')}">${s.customerName || tr('walkIn')}</td>
        <td data-label="${tr('colItems')}">${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
        <td data-label="${tr('colTotal')}" class="mono">${money(s.total)}</td>
        <td data-label="${tr('colPaid')}" class="mono">${money(s.paid)}</td>
        <td data-label="${tr('colDue')}">${s.due > 0 ? `<span class="pill warn">${money(s.due)}</span>` : `<span class="pill ok">${tr('settled')}</span>`}</td>
        <td data-label=""><button class="btn secondary small" onclick="editSale('${s.id}')">${tr('edit')}</button> <button class="btn secondary small" onclick="shareSaleWhatsApp('${s.id}')" title="Share on WhatsApp">${tr('share')}</button></td>
      </tr>`).join('')}</tbody></table>
  `;
}

function renderSales() {
  const el = document.getElementById('view-sales');
  const sorted = state.sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h3>${tr('allSalesHeading')}</h3><button class="btn small" id="add-sale-btn">${tr('recordSaleBtn')}</button></div>
      ${renderSalesTable(sorted)}
    </div>
  `;
  document.getElementById('add-sale-btn').addEventListener('click', openSaleModal);
}

function openSaleModal() {
  if (!state.products.length) { toast(tr('addProductFirst')); return; }
  const rowId = uid();
  showModal(`
    <h3>${tr('recordSaleTitle')}</h3>
    <form id="sale-form">
      <label>${tr('customerLabel')}
        <select id="s-customer">
          <option value="">${tr('walkIn')}</option>
          ${state.customers.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="line-items">
        ${saleLineRow(rowId)}
      </div>
      <button type="button" class="btn secondary small" id="add-line-btn" style="align-self:flex-start;">${tr('addAnotherItem')}</button>
      <label>${tr('amountPaidNowLabel')}<input type="number" id="s-paid" value="0" required /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('saveSaleBtn')}</button>
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

    if (!items.length) { toast(tr('addAtLeastOneItem')); reEnable(); return; }

    // check stock
    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (item.qty > p.stock) { toast(`${tr('notEnoughStockFor')} ${p.name}`); reEnable(); return; }
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
      toast(tr('saleRecorded'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
}

function saleLineRow(rowId) {
  return `
    <div class="line-item-row" data-row="${rowId}">
      <select class="li-product">
        <option value="">${tr('selectProduct')}</option>
        ${state.products.map((p) => `<option value="${p.id}">${p.name} (${crateBreakdown(p.stock, p.unitsPerCrate)})</option>`).join('')}
      </select>
      <input class="li-qty" type="number" min="1" value="1" placeholder="Qty" />
      <span class="mono" style="font-size:12px;color:var(--muted);">${tr('unitPriceAuto')}</span>
      <button type="button" class="btn secondary small" onclick="this.closest('.line-item-row').remove()">✕</button>
    </div>
  `;
}

window.editSale = (id) => {
  const s = state.sales.find((x) => x.id === id);
  if (!s) return;
  showModal(`
    <h3>${tr('editSaleTitlePrefix')} ${s.invoiceNo ? formatInvoice(s.invoiceNo) : ''} — ${s.customerName || tr('walkIn')}</h3>
    <p style="color:var(--muted); font-size:14px; margin:0;">${tr('itemsLabel')} ${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}<br/>${tr('totalLabelColon')} <strong class="mono">${money(s.total)}</strong></p>
    <form id="edit-sale-form">
      <label>${tr('amountPaidNowLabel')}<input required type="number" id="es-paid" value="${s.paid}" /></label>
      <div class="modal-actions">
        <button type="button" class="btn danger" id="es-delete">${tr('deleteSaleBtn')}</button>
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('saveChanges')}</button>
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
      toast(tr('saleUpdated'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });

  document.getElementById('es-delete').addEventListener('click', async () => {
    if (!confirm(tr('confirmDeleteSaleBody'))) return;
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
    toast(tr('saleDeleted'));
    closeModal();
  });
};

window.shareSaleWhatsApp = async (id) => {
  const s = state.sales.find((x) => x.id === id);
  if (!s) return;
  const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = [
    `*H.M Traders*`,
    s.invoiceNo ? `${tr('waInvoiceLabel')} ${formatInvoice(s.invoiceNo)}` : '',
    `${tr('waDateLabel')} ${dateStr}`,
    `${tr('waCustomerLabel')} ${s.customerName || tr('walkIn')}`,
    '',
    ...s.items.map((i) => `${i.name} ×${i.qty} — ${money(i.lineTotal)}`),
    '',
    `${tr('waTotalLabel')} ${money(s.total)}`,
    `${tr('waPaidLabel')} ${money(s.paid)}`,
    s.due > 0 ? `${tr('waDueLabel')} ${money(s.due)}` : tr('waStatusSettled'),
    '',
    tr('waThanks'),
  ].filter(Boolean);
  const text = lines.join('\n');

  // Prefer the phone's native "Share to…" sheet (WhatsApp, SMS, Email, etc.),
  // same as sharing a photo from the Gallery — but skip it on a real desktop/PC,
  // where WhatsApp usually isn't a registered share target, and go straight there instead.
  if (navigator.share && !isDesktopDevice()) {
    try {
      await navigator.share({ title: tr('waShareTitle'), text });
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
      <div class="panel-head"><h3>${tr('customersHeading')}</h3><button class="btn small" id="add-customer-btn">${tr('addCustomerBtn')}</button></div>
      ${state.customers.length ? `
        <table><thead><tr><th>${tr('colName')}</th><th>${tr('colPhone')}</th><th>${tr('colDue')}</th><th></th></tr></thead>
        <tbody>${state.customers.map((c) => `
          <tr>
            <td data-label="${tr('colName')}">${c.name}</td>
            <td data-label="${tr('colPhone')}">${c.phone || '—'}</td>
            <td data-label="${tr('colDue')}">${c.totalDue > 0 ? `<span class="pill warn">${money(c.totalDue)}</span>` : `<span class="pill ok">${tr('clearStatus')}</span>`}</td>
            <td data-label="">
              ${c.totalDue > 0 ? `<button class="btn secondary small" onclick="openPaymentModal('${c.id}')">${tr('recordPayment')}</button>` : ''}
              <button class="btn secondary small" onclick="editCustomer('${c.id}')">${tr('edit')}</button>
            </td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noCustomersYet')}</div>`}
    </div>
  `;
  document.getElementById('add-customer-btn').addEventListener('click', () => openCustomerModal());
}

function openCustomerModal(existing) {
  const isEdit = !!existing;
  const c = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? tr('editCustomerTitle') : tr('addCustomerTitle')}</h3>
    <form id="customer-form">
      <label>${tr('nameLabel')}<input required id="c-name" value="${c.name}" /></label>
      <label>${tr('phoneLabel')}<input id="c-phone" value="${c.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="c-delete">${tr('delete')}</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${isEdit ? tr('saveChanges') : tr('addCustomerBtn').replace('+ ', '')}</button>
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
        toast(tr('customerUpdated'));
      } else {
        await db.collection('customers').add({ ...data, totalDue: 0 });
        toast(tr('customerAdded'));
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
  if (isEdit) {
    document.getElementById('c-delete').addEventListener('click', async () => {
      if (c.totalDue > 0 && !confirm(`${c.name} ${tr('confirmStillHasDue')} ${money(c.totalDue)} ${tr('confirmDueDeleteAnyway')}`)) return;
      if (c.totalDue <= 0 && !confirm(`${tr('confirmDeleteCustomerPrefix')} "${c.name}"?`)) return;
      await db.collection('customers').doc(existing.id).delete();
      toast(tr('customerDeleted'));
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
    <h3>${tr('recordPaymentPrefix')} — ${c.name}</h3>
    <form id="payment-form">
      <p style="color:var(--muted); font-size:14px; margin:0;">${tr('currentDueLabel')} <strong class="mono">${money(c.totalDue)}</strong></p>
      <label>${tr('amountReceivedLabel')}<input required type="number" max="${c.totalDue}" id="pay-amount" /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('savePaymentBtn')}</button>
      </div>
    </form>
  `);
  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const amt = Number(document.getElementById('pay-amount').value);
    if (amt <= 0 || amt > c.totalDue) { toast(tr('enterValidAmount')); reEnable(); return; }
    try {
      await db.collection('customers').doc(c.id).update({ totalDue: c.totalDue - amt });
      toast(tr('paymentRecorded'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
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
      <div class="panel-head"><h3>${tr('shopkeepersHeading')}</h3><button class="btn small" id="add-shopkeeper-btn">${tr('addShopkeeperBtn')}</button></div>
      ${state.shopkeepers.length ? `
        <table><thead><tr><th>${tr('colName')}</th><th>${tr('colPhone')}</th><th>${tr('colDue')}</th><th></th></tr></thead>
        <tbody>${state.shopkeepers.map((k) => `
          <tr>
            <td data-label="${tr('colName')}">${k.name}</td>
            <td data-label="${tr('colPhone')}">${k.phone || '—'}</td>
            <td data-label="${tr('colDue')}">${k.totalDue > 0 ? `<span class="pill warn">${money(k.totalDue)}</span>` : `<span class="pill ok">${tr('clearStatus')}</span>`}</td>
            <td data-label="">
              ${k.totalDue > 0 ? `<button class="btn secondary small" onclick="openShopkeeperPaymentModal('${k.id}')">${tr('recordPayment')}</button>` : ''}
              <button class="btn secondary small" onclick="editShopkeeper('${k.id}')">${tr('edit')}</button>
            </td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noShopkeepersYet')}</div>`}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>${tr('salesToShopkeepersHeading')}</h3><button class="btn small" id="add-shopkeeper-sale-btn">${tr('recordSaleBtn')}</button></div>
      ${sales.length ? `
        <table><thead><tr><th>${tr('colInvoice')}</th><th>${tr('colDate')}</th><th>${tr('colShopkeeperCol')}</th><th>${tr('colItems')}</th><th>${tr('colTotal')}</th><th>${tr('colPaid')}</th><th>${tr('colDue')}</th><th></th></tr></thead>
        <tbody>${sales.map((s) => `
          <tr>
            <td data-label="${tr('colInvoice')}" class="mono">${s.invoiceNo ? formatInvoice(s.invoiceNo) : '—'}</td>
            <td data-label="${tr('colDate')}">${formatDateTime(s.date)}</td>
            <td data-label="${tr('colShopkeeperCol')}">${s.shopkeeperName}</td>
            <td data-label="${tr('colItems')}">${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
            <td data-label="${tr('colTotal')}" class="mono">${money(s.total)}</td>
            <td data-label="${tr('colPaid')}" class="mono">${money(s.paid)}</td>
            <td data-label="${tr('colDue')}">${s.due > 0 ? `<span class="pill warn">${money(s.due)}</span>` : `<span class="pill ok">${tr('settled')}</span>`}</td>
            <td data-label=""><button class="btn secondary small" onclick="editShopkeeperSale('${s.id}')">${tr('edit')}</button> <button class="btn secondary small" onclick="shareShopkeeperSaleWhatsApp('${s.id}')">${tr('share')}</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noSalesToShopkeepersYet')}</div>`}
    </div>
  `;
  document.getElementById('add-shopkeeper-btn').addEventListener('click', () => openShopkeeperModal());
  document.getElementById('add-shopkeeper-sale-btn').addEventListener('click', () => openShopkeeperSaleModal());
}

function openShopkeeperModal(existing) {
  const isEdit = !!existing;
  const k = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? tr('editShopkeeperTitle') : tr('addShopkeeperTitle')}</h3>
    <form id="shopkeeper-form">
      <label>${tr('nameLabel')}<input required id="k-name" value="${k.name}" /></label>
      <label>${tr('phoneLabel')}<input id="k-phone" value="${k.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="k-delete">${tr('delete')}</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${isEdit ? tr('saveChanges') : tr('addShopkeeperBtn').replace('+ ', '')}</button>
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
        toast(tr('shopkeeperUpdated'));
      } else {
        await db.collection('shopkeepers').add({ ...data, totalDue: 0 });
        toast(tr('shopkeeperAdded'));
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
  if (isEdit) {
    document.getElementById('k-delete').addEventListener('click', async () => {
      if (k.totalDue > 0 && !confirm(`${k.name} ${tr('confirmStillHasDue')} ${money(k.totalDue)} ${tr('confirmDueDeleteAnyway')}`)) return;
      if (k.totalDue <= 0 && !confirm(`${tr('confirmDeleteShopkeeperPrefix')} "${k.name}"?`)) return;
      await db.collection('shopkeepers').doc(existing.id).delete();
      toast(tr('shopkeeperDeleted'));
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
    <h3>${tr('recordPaymentPrefix')} — ${k.name}</h3>
    <form id="shopkeeper-payment-form">
      <p style="color:var(--muted); font-size:14px; margin:0;">${tr('currentDueLabel')} <strong class="mono">${money(k.totalDue)}</strong></p>
      <label>${tr('amountReceivedLabel')}<input required type="number" max="${k.totalDue}" id="kpay-amount" /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('savePaymentBtn')}</button>
      </div>
    </form>
  `);
  document.getElementById('shopkeeper-payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reEnable = guardDoubleSubmit(e.target);
    if (!reEnable) return;
    const amt = Number(document.getElementById('kpay-amount').value);
    if (amt <= 0 || amt > k.totalDue) { toast(tr('enterValidAmount')); reEnable(); return; }
    try {
      await db.collection('shopkeepers').doc(k.id).update({ totalDue: k.totalDue - amt });
      toast(tr('paymentRecorded'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
};

function openShopkeeperSaleModal() {
  if (!state.products.length) { toast(tr('addProductFirst')); return; }
  if (!state.shopkeepers.length) { toast(tr('addShopkeeperFirst')); return; }
  const rowId = uid();
  showModal(`
    <h3>${tr('recordSaleToShopkeeperTitle')}</h3>
    <form id="shopkeeper-sale-form">
      <label>${tr('shopkeeperLabel')}
        <select id="ks-shopkeeper" required>
          <option value="">${tr('selectShopkeeper')}</option>
          ${state.shopkeepers.map((k) => `<option value="${k.id}">${k.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="ks-line-items">
        ${shopkeeperSaleLineRow(rowId)}
      </div>
      <button type="button" class="btn secondary small" id="ks-add-line-btn" style="align-self:flex-start;">${tr('addAnotherItem')}</button>
      <label>${tr('amountPaidNowLabel')}<input type="number" id="ks-paid" value="0" required /></label>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('saveSaleBtn')}</button>
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

    if (!items.length) { toast(tr('addAtLeastOneItem')); reEnable(); return; }

    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (item.qty > p.stock) { toast(`${tr('notEnoughStockFor')} ${p.name}`); reEnable(); return; }
    }

    const total = items.reduce((a, i) => a + i.lineTotal, 0);
    const paid = Number(document.getElementById('ks-paid').value) || 0;
    const due = Math.max(total - paid, 0);
    const shopkeeperId = document.getElementById('ks-shopkeeper').value;
    const shopkeeper = state.shopkeepers.find((k) => k.id === shopkeeperId);
    if (!shopkeeper) { toast(tr('selectShopkeeperToast')); reEnable(); return; }
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
      toast(tr('saleRecorded'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
}

function shopkeeperSaleLineRow(rowId) {
  return `
    <div class="line-item-row" data-row="${rowId}">
      <select class="li-product">
        <option value="">${tr('selectProduct')}</option>
        ${state.products.map((p) => `<option value="${p.id}">${p.name} (${crateBreakdown(p.stock, p.unitsPerCrate)})</option>`).join('')}
      </select>
      <input class="li-qty" type="number" min="1" value="1" placeholder="Qty" />
      <span class="mono" style="font-size:12px;color:var(--muted);">${tr('unitPriceAuto')}</span>
      <button type="button" class="btn secondary small" onclick="this.closest('.line-item-row').remove()">✕</button>
    </div>
  `;
}

window.editShopkeeperSale = (id) => {
  const s = state.shopkeeperSales.find((x) => x.id === id);
  if (!s) return;
  showModal(`
    <h3>${tr('editSaleTitlePrefix')} ${s.invoiceNo ? formatInvoice(s.invoiceNo) : ''} — ${s.shopkeeperName}</h3>
    <p style="color:var(--muted); font-size:14px; margin:0;">${tr('itemsLabel')} ${s.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}<br/>${tr('totalLabelColon')} <strong class="mono">${money(s.total)}</strong></p>
    <form id="edit-shopkeeper-sale-form">
      <label>${tr('amountPaidNowLabel')}<input required type="number" id="eks-paid" value="${s.paid}" /></label>
      <div class="modal-actions">
        <button type="button" class="btn danger" id="eks-delete">${tr('deleteSaleBtn')}</button>
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${tr('saveChanges')}</button>
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
      toast(tr('saleUpdated'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });

  document.getElementById('eks-delete').addEventListener('click', async () => {
    if (!confirm(tr('confirmDeleteShopkeeperSaleBody'))) return;
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
    toast(tr('saleDeleted'));
    closeModal();
  });
};

window.shareShopkeeperSaleWhatsApp = async (id) => {
  const s = state.shopkeeperSales.find((x) => x.id === id);
  if (!s) return;
  const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = [
    `*H.M Traders*`,
    s.invoiceNo ? `${tr('waInvoiceLabel')} ${formatInvoice(s.invoiceNo)}` : '',
    `${tr('waDateLabel')} ${dateStr}`,
    `${tr('waShopkeeperLabel')} ${s.shopkeeperName}`,
    '',
    ...s.items.map((i) => `${i.name} ×${i.qty} — ${money(i.lineTotal)}`),
    '',
    `${tr('waTotalLabel')} ${money(s.total)}`,
    `${tr('waPaidLabel')} ${money(s.paid)}`,
    s.due > 0 ? `${tr('waDueLabel')} ${money(s.due)}` : tr('waStatusSettled'),
    '',
    tr('waThanks'),
  ].filter(Boolean);
  const text = lines.join('\n');

  if (navigator.share && !isDesktopDevice()) {
    try {
      await navigator.share({ title: tr('waShareTitle'), text });
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
      <div class="panel-head"><h3>${tr('suppliersHeading')}</h3><button class="btn small" id="add-supplier-btn">${tr('addSupplierBtn')}</button></div>
      ${state.suppliers.length ? `
        <table><thead><tr><th>${tr('colName')}</th><th>${tr('colPhone')}</th><th></th></tr></thead>
        <tbody>${state.suppliers.map((s) => `
          <tr>
            <td data-label="${tr('colName')}">${s.name}</td>
            <td data-label="${tr('colPhone')}">${s.phone || '—'}</td>
            <td data-label=""><button class="btn secondary small" onclick="editSupplier('${s.id}')">${tr('edit')}</button> <button class="btn danger small" onclick="deleteSupplier('${s.id}')">${tr('delete')}</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noSuppliersYet')}</div>`}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>${tr('purchasesHeading')}</h3><button class="btn small" id="add-purchase-btn">${tr('recordPurchaseBtn')}</button></div>
      ${purchases.length ? `
        <table><thead><tr><th>${tr('colDate')}</th><th>${tr('colSupplierCol')}</th><th>${tr('colItems')}</th><th>${tr('colTotal')}</th><th></th></tr></thead>
        <tbody>${purchases.map((p) => `
          <tr>
            <td data-label="${tr('colDate')}">${new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
            <td data-label="${tr('colSupplierCol')}">${p.supplierName}</td>
            <td data-label="${tr('colItems')}">${p.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
            <td data-label="${tr('colTotal')}" class="mono">${money(p.total)}</td>
            <td data-label=""><button class="btn secondary small" onclick="editPurchase('${p.id}')">${tr('edit')}</button> <button class="btn danger small" onclick="deletePurchase('${p.id}')">${tr('delete')}</button></td>
          </tr>`).join('')}</tbody></table>
      ` : `<div class="empty-state">${tr('noPurchasesYet')}</div>`}
    </div>
  `;

  document.getElementById('add-supplier-btn').addEventListener('click', () => openSupplierModal());
  document.getElementById('add-purchase-btn').addEventListener('click', () => openPurchaseModal());
}

function openSupplierModal(existing) {
  const isEdit = !!existing;
  const s = existing || { name: '', phone: '' };
  showModal(`
    <h3>${isEdit ? tr('editSupplierTitle') : tr('addSupplierTitle')}</h3>
    <form id="supplier-form">
      <label>${tr('nameLabel')}<input required id="sup-name" value="${s.name}" /></label>
      <label>${tr('phoneLabel')}<input id="sup-phone" value="${s.phone || ''}" /></label>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="sup-delete">${tr('delete')}</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${isEdit ? tr('saveChanges') : tr('addSupplierBtn').replace('+ ', '')}</button>
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
        toast(tr('supplierUpdated'));
      } else {
        await db.collection('suppliers').add(data);
        toast(tr('supplierAdded'));
      }
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
    }
  });
  if (isEdit) {
    document.getElementById('sup-delete').addEventListener('click', async () => {
      if (!confirm(`${tr('confirmDeleteSupplierPrefix')} "${s.name}"${tr('confirmDeleteSupplierSuffix')}`)) return;
      await db.collection('suppliers').doc(existing.id).delete();
      toast(tr('supplierDeleted'));
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
  if (!confirm(`${tr('confirmDeleteSupplierPrefix')} "${s.name}"${tr('confirmDeleteSupplierSuffix')}`)) return;
  await db.collection('suppliers').doc(id).delete();
  toast(tr('supplierDeleted'));
};

window.deletePurchase = async (id) => {
  const p = state.purchases.find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`${tr('confirmDeletePurchasePrefix')} ${p.supplierName}${tr('confirmDeletePurchaseSuffix')}`)) return;
  const batch = db.batch();
  batch.delete(db.collection('purchases').doc(p.id));
  p.items.forEach((i) => {
    const prod = state.products.find((x) => x.id === i.productId);
    if (prod) batch.update(db.collection('products').doc(i.productId), { stock: Math.max(prod.stock - i.qty, 0) });
  });
  await batch.commit();
  toast(tr('purchaseDeleted'));
};

window.editPurchase = (id) => {
  const p = state.purchases.find((x) => x.id === id);
  if (p) openPurchaseModal(p);
};

function openPurchaseModal(existing) {
  const isEdit = !!existing;
  if (!state.suppliers.length) { toast(tr('addSupplierFirst')); return; }
  if (!state.products.length) { toast(tr('addProductFirst')); return; }
  showModal(`
    <h3>${isEdit ? tr('editPurchaseTitle') : tr('recordPurchaseTitle')}</h3>
    <form id="purchase-form">
      <label>${tr('supplierLabel')}
        <select id="pu-supplier" required>
          <option value="">${tr('selectSupplier')}</option>
          ${state.suppliers.map((s) => `<option value="${s.id}" ${isEdit && existing.supplierId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </label>
      <div class="line-items" id="purchase-line-items">
        ${isEdit ? existing.items.map((i) => purchaseLineRow(i)).join('') : purchaseLineRow()}
      </div>
      <button type="button" class="btn secondary small" id="add-pline-btn" style="align-self:flex-start;">${tr('addAnotherItem')}</button>
      <div class="modal-actions">
        ${isEdit ? `<button type="button" class="btn danger" id="pu-delete">${tr('delete')}</button>` : ''}
        <button type="button" class="btn secondary" id="modal-cancel">${tr('cancel')}</button>
        <button type="submit" class="btn">${isEdit ? tr('saveChanges') : tr('savePurchaseBtn')}</button>
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

    if (!items.length) { toast(tr('addAtLeastOneItem')); reEnable(); return; }

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
      toast(isEdit ? tr('purchaseUpdated') : tr('purchaseRecordedStockUpdated'));
      closeModal();
    } catch (err) {
      reEnable();
      toast(tr('saveFailed'));
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
        <option value="">${tr('selectProduct')}</option>
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
