import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, categoryService, orderService, productService } from '../services/api';
import { BarChart3, Boxes, LayoutDashboard, LogOut, Package, PenSquare, Plus, Search, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { catalogUnitsToRupees, formatInr, rupeesToCatalogUnits } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'catalogue', label: 'Categories & Collections', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: Boxes },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const getInventoryStatus = (stock) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
};

const initialProductForm = {
  name: '',
  description: '',
  category: 'T-Shirts',
  gender: 'men',
  price: '',
  discountPrice: '',
  sizes: 'XS,S,M,L,XL',
  shortDescription: '',
  collection: '',
  fabricDetails: '',
  fitDetails: '',
  careInstructions: '',
  measurements: '',
  colours: 'Neutral,Black',
  stock: '25',
  images: '',
  featured: false,
  newArrival: false,
  bestSeller: false,
  active: true
};

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    deliveredOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionRecords, setCollectionRecords] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [collectionForm, setCollectionForm] = useState({ name: '', description: '' });
  const [collectionRename, setCollectionRename] = useState({ current: '', name: '', description: '' });
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [editingId, setEditingId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, customersRes, firstProductsRes, ordersRes, categoriesRes, collectionsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getCustomers(),
        productService.getProducts({ limit: 100, page: 1 }),
        orderService.getAllOrders({ limit: 50 }),
        categoryService.getCategories(),
        productService.getCollections()
      ]);

      const productPages = firstProductsRes.data.totalPages > 1
        ? await Promise.all(Array.from({ length: firstProductsRes.data.totalPages - 1 }, (_, index) => productService.getProducts({ limit: 100, page: index + 2 })))
        : [];

      if (statsRes.data.success) {
        setStats(statsRes.data.stats || statsRes.data);
        setChartData(statsRes.data.chartData || []);
        setCategoryDistribution(statsRes.data.categoryDistribution || []);
      }

      if (customersRes.data.success) setCustomers(customersRes.data.customers || []);
      if (firstProductsRes.data.success) setProducts([...(firstProductsRes.data.products || []), ...productPages.flatMap((page) => page.data.products || [])]);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders || []);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories || []);
      if (collectionsRes.data.success) {
        setCollections(collectionsRes.data.collections || []);
        setCollectionRecords(collectionsRes.data.collectionRecords || []);
      }
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not load admin data. Check the API connection and your administrator session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const originalProduct = editingId ? products.find((product) => product._id === editingId) : null;
      const payload = {
        ...productForm,
        measurements: productForm.measurements ? JSON.parse(productForm.measurements) : undefined,
        price: rupeesToCatalogUnits(productForm.price),
        discountPrice: productForm.discountPrice ? rupeesToCatalogUnits(productForm.discountPrice) : null,
        stock: Number(productForm.stock),
        sizes: productForm.sizes.split(',').map((v) => v.trim()).filter(Boolean),
        colours: productForm.colours.split(',').map((value) => {
          const name = value.trim();
          const existingColour = originalProduct?.colours?.find((colour) => colour.name.toLowerCase() === name.toLowerCase());
          return { name, hex: existingColour?.hex || '#D4C5B9' };
        }).filter((colour) => colour.name),
        images: productForm.images
          ? productForm.images.split(',').map((value) => value.trim()).filter(Boolean)
          : originalProduct?.images || []
      };

      if (editingId) {
        await productService.updateProduct(editingId, payload);
        setNotice('Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        setNotice('Product created successfully.');
      }

      setProductForm(initialProductForm);
      setEditingId(null);
      await loadAdminData();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Product save failed.');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      gender: product.gender,
      price: String(catalogUnitsToRupees(product.price)),
      discountPrice: product.discountPrice ? String(catalogUnitsToRupees(product.discountPrice)) : '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      shortDescription: product.shortDescription || '',
      collection: product.collection || '',
      fabricDetails: product.fabricDetails || '',
      fitDetails: product.fitDetails || '',
      careInstructions: product.careInstructions || '',
      measurements: product.measurements ? JSON.stringify(product.measurements, null, 2) : '',
      colours: Array.isArray(product.colours) ? product.colours.map((c) => c.name).join(', ') : '',
      stock: String(product.stock),
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
        bestSeller: Boolean(product.bestSeller),
        active: product.active === true
    });
  };

  const handleArchiveToggle = async (product) => {
    try {
      await productService.updateProduct(product._id, { active: product.active !== true });
      setNotice(product.active === true ? 'Product archived; its order history is preserved.' : 'Product activated.');
      await loadAdminData();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not update product status.');
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingCategoryId) await categoryService.updateCategory(editingCategoryId, categoryForm);
      else await categoryService.createCategory(categoryForm);
      setCategoryForm({ name: '', description: '', image: '' });
      setEditingCategoryId(null);
      setNotice('Category saved.');
      await loadAdminData();
    } catch (err) { setNotice(err.response?.data?.message || 'Category save failed.'); }
  };

  const handleCollectionRename = async (event) => {
    event.preventDefault();
    try {
      await productService.renameCollection(collectionRename.current, collectionRename.name, collectionRename.description);
      setCollectionRename({ current: '', name: '', description: '' });
      setNotice('Collection renamed.');
      await loadAdminData();
    } catch (err) { setNotice(err.response?.data?.message || 'Collection rename failed.'); }
  };

  const handleCollectionCreate = async (event) => {
    event.preventDefault();
    try {
      await productService.createCollection(collectionForm);
      setCollectionForm({ name: '', description: '' });
      setNotice('Collection created. Add products to it from the product form.');
      await loadAdminData();
    } catch (err) { setNotice(err.response?.data?.message || 'Collection creation failed.'); }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({ name: category.name, description: category.description || '', image: category.image || '' });
  };

  const handleCollectionRemove = async (name) => {
    if (!window.confirm(`Remove “${name}” and unassign its products?`)) return;
    try {
      await productService.removeCollection(name);
      setNotice('Collection removed and products unassigned.');
      await loadAdminData();
    } catch (err) { setNotice(err.response?.data?.message || 'Collection removal failed.'); }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, { orderStatus: status });
      loadAdminData();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleCustomerStatus = async (id, status) => {
    try {
      await adminService.updateCustomerStatus(id, { status });
      setNotice('Customer account status updated.');
      await loadAdminData();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Customer status update failed.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(productSearch.toLowerCase())
  );

  const metricCards = [
    ['Total Products', stats.totalProducts],
    ['Total Orders', stats.totalOrders],
    ['Total Customers', stats.totalCustomers],
    ['Total Revenue', formatInr(stats.totalRevenue)],
    ['Pending Orders', stats.pendingOrders],
    ['Low Stock Products', stats.lowStockProducts]
  ];
  const inputClass = 'w-full min-w-0 border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal';
  const panelClass = 'bg-xora-offwhite border border-xora-taupe/30 p-4 sm:p-6 rounded-xs';

  return (
    <div className="bg-xora-cream min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">Atelier Portal</span>
            <h1 className="font-serif text-3xl sm:text-4xl text-xora-charcoal mt-1">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-xora-taupe-dark">Signed in as {user?.name || 'Administrator'}</p>
        </div>

        <nav aria-label="Admin sections" className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 mb-6">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              aria-current={activeSection === id ? 'page' : undefined}
              className={`min-w-0 flex items-center justify-center gap-2 border px-2 py-3 text-[11px] uppercase tracking-wider transition-colors ${
                activeSection === id
                  ? 'border-xora-charcoal bg-xora-charcoal text-xora-offwhite'
                  : 'border-xora-taupe/30 bg-xora-offwhite text-xora-charcoal hover:border-xora-charcoal'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="min-w-0 flex items-center justify-center gap-2 border border-xora-taupe/30 bg-xora-offwhite px-2 py-3 text-[11px] uppercase tracking-wider text-xora-charcoal hover:border-xora-charcoal"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </nav>

        {loading && <div role="status" className="mb-4 text-sm text-xora-taupe-dark">Loading admin data…</div>}
        {notice && (
          <div role="status" className="mb-6 rounded-xs border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            {notice}
          </div>
        )}

        {activeSection === 'dashboard' && (
          <section aria-label="Dashboard overview">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
              {metricCards.map(([label, value]) => (
                <div key={label} className="bg-xora-offwhite border border-xora-taupe/30 p-4 rounded-xs min-w-0">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-xora-taupe-dark">{label}</div>
                  <div className="font-serif text-xl sm:text-2xl mt-2 text-xora-charcoal break-words">{value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className={panelClass}>
                <h2 className="font-serif text-2xl text-xora-charcoal mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex flex-wrap items-center justify-between gap-2 border-b border-xora-taupe/20 pb-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-xora-charcoal truncate">{order.customer?.name || 'Customer'}</p>
                        <p className="text-xora-taupe-dark">{order.orderStatus} · {order.paymentMethod}</p>
                      </div>
                      <span className="font-medium text-xora-charcoal">{formatInr(order.total)}</span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-xs text-xora-taupe-dark">No orders yet.</p>}
                </div>
              </div>
              <div className={panelClass}>
                <h2 className="font-serif text-2xl text-xora-charcoal mb-4">Inventory Attention</h2>
                <div className="space-y-3">
                  {products.filter((product) => product.stock <= 10).slice(0, 6).map((product) => (
                    <div key={product._id} className="flex items-center justify-between gap-3 border-b border-xora-taupe/20 pb-3 text-xs">
                      <span className="truncate text-xora-charcoal">{product.name}</span>
                      <span className="flex-shrink-0 text-amber-800">{getInventoryStatus(product.stock)} · {product.stock}</span>
                    </div>
                  ))}
                  {products.every((product) => product.stock > 10) && <p className="text-xs text-xora-taupe-dark">No low or out-of-stock products.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'catalogue' && (
          <section aria-label="Category and collection management" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className={panelClass}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-serif text-2xl">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h2>
                {editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: '', description: '', image: '' }); }} className="text-xs underline">Cancel</button>}
              </div>
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <label className="block text-[11px]">Name<input className={`${inputClass} mt-1`} value={categoryForm.name} onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value }))} required maxLength={80} readOnly={Boolean(editingCategoryId)} /></label>
                <label className="block text-[11px]">Description<textarea className={`${inputClass} mt-1`} value={categoryForm.description} onChange={(event) => setCategoryForm((form) => ({ ...form, description: event.target.value }))} rows="2" maxLength={500} /></label>
                <label className="block text-[11px]">Category image URL<input className={`${inputClass} mt-1`} value={categoryForm.image} onChange={(event) => setCategoryForm((form) => ({ ...form, image: event.target.value }))} maxLength={2048} /></label>
                <button className="btn-luxury w-full" type="submit">{editingCategoryId ? 'Save Category' : 'Add Category'}</button>
              </form>
              <div className="mt-6 space-y-2">
                {categories.map((category) => <div key={category._id} className="flex items-center justify-between gap-3 border-t border-xora-taupe/20 py-3 text-xs">
                  <div><p className="font-medium">{category.name} <span className={category.active === false ? 'text-red-700' : 'text-emerald-800'}>{category.active === false ? '· Archived' : '· Active'}</span></p><p className="text-xora-taupe-dark">{category.itemCount || 0} active products</p></div>
                  <button type="button" onClick={() => handleCategoryEdit(category)} className="underline">Edit details</button>
                </div>)}
              </div>
            </div>

            <div className={`${panelClass} space-y-6`}>
              <div>
                <h2 className="font-serif text-2xl mb-3">Collections</h2>
                <p className="text-xs text-xora-taupe-dark mb-4">Collections are stored independently so an empty collection can be prepared before products are assigned.</p>
                <form onSubmit={handleCollectionCreate} className="space-y-3">
                  <label className="block text-[11px]">New collection name<input className={`${inputClass} mt-1`} value={collectionForm.name} onChange={(event) => setCollectionForm((form) => ({ ...form, name: event.target.value }))} required maxLength={100} /></label>
                  <label className="block text-[11px]">Description<textarea className={`${inputClass} mt-1`} value={collectionForm.description} onChange={(event) => setCollectionForm((form) => ({ ...form, description: event.target.value }))} rows="2" maxLength={500} /></label>
                  <button className="btn-luxury w-full" type="submit">Create Collection</button>
                </form>
              </div>
              <form onSubmit={handleCollectionRename} className="space-y-3 border-t border-xora-taupe/20 pt-5">
                <h3 className="font-serif text-xl">Rename Collection</h3>
                <label className="block text-[11px]">Collection<select className={`${inputClass} mt-1`} value={collectionRename.current} onChange={(event) => { const current = event.target.value; const record = collectionRecords.find((item) => item.name === current); setCollectionRename({ current, name: current, description: record?.description || '' }); }} required><option value="">Choose a collection</option>{collections.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
                <label className="block text-[11px]">New name<input className={`${inputClass} mt-1`} value={collectionRename.name} onChange={(event) => setCollectionRename((form) => ({ ...form, name: event.target.value }))} required maxLength={100} /></label>
                <label className="block text-[11px]">Description<textarea className={`${inputClass} mt-1`} value={collectionRename.description} onChange={(event) => setCollectionRename((form) => ({ ...form, description: event.target.value }))} rows="2" maxLength={500} /></label>
                <button className="btn-luxury-outline w-full" type="submit" disabled={!collectionRename.current}>Save Collection</button>
              </form>
              <div className="border-t border-xora-taupe/20 pt-4 space-y-2">
                {collections.map((name) => <div key={name} className="flex justify-between items-center text-xs border-b border-xora-taupe/10 py-2"><span>{name}</span><button type="button" onClick={() => handleCollectionRemove(name)} className="text-red-700 underline">Remove</button></div>)}
                {collections.length === 0 && <p className="text-xs text-xora-taupe-dark">No collections yet.</p>}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'products' && (
          <section aria-label="Product management" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className={`${panelClass} xl:col-span-5 h-fit`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-serif text-2xl text-xora-charcoal">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setProductForm(initialProductForm); }} className="text-xs underline underline-offset-4">Cancel</button>}
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-[11px] text-xora-taupe-dark">Product name *
                  <input name="name" value={productForm.name} onChange={handleChange} placeholder="Oversized Linen Shirt" className={`${inputClass} mt-1`} required />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Description *
                  <textarea name="description" value={productForm.description} onChange={handleChange} rows="3" placeholder="Product description" className={`${inputClass} mt-1 resize-y`} required />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Short description
                  <input name="shortDescription" value={productForm.shortDescription} onChange={handleChange} className={`${inputClass} mt-1`} maxLength={300} />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-[11px] text-xora-taupe-dark">Category *
                    <select name="category" value={productForm.category} onChange={handleChange} className={`${inputClass} mt-1`} required>
                      {!categories.some((category) => category.name === productForm.category) && <option value={productForm.category}>{productForm.category} (existing)</option>}
                      {categories.filter((category) => category.active !== false).map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
                    </select>
                  </label>
                  <label className="block text-[11px] text-xora-taupe-dark">Gender *
                    <select name="gender" value={productForm.gender} onChange={handleChange} className={`${inputClass} mt-1`} required>
                      {productForm.gender === 'women' && <option value="women">Women (legacy)</option>}
                      <option value="men">Men</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-[11px] text-xora-taupe-dark">Price (₹) *
                    <input name="price" type="number" min="0" step="1" value={productForm.price} onChange={handleChange} placeholder="2499" className={`${inputClass} mt-1`} required />
                  </label>
                  <label className="block text-[11px] text-xora-taupe-dark">Sale price (₹, optional)
                    <input name="discountPrice" type="number" min="0" step="1" value={productForm.discountPrice} onChange={handleChange} placeholder="Optional" className={`${inputClass} mt-1`} />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-[11px] text-xora-taupe-dark">Sizes (comma separated)
                    <input name="sizes" value={productForm.sizes} onChange={handleChange} placeholder="S, M, L, XL" className={`${inputClass} mt-1`} />
                  </label>
                  <label className="block text-[11px] text-xora-taupe-dark">Stock quantity
                    <input name="stock" type="number" min="0" value={productForm.stock} onChange={handleChange} placeholder="25" className={`${inputClass} mt-1`} />
                  </label>
                </div>
                <label className="block text-[11px] text-xora-taupe-dark">Colours (comma separated)
                  <input name="colours" value={productForm.colours} onChange={handleChange} placeholder="Beige, White" className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Product image URL(s), comma separated
                  <input name="images" value={productForm.images} onChange={handleChange} placeholder="https://..." className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Collection name
                  <select name="collection" value={productForm.collection} onChange={handleChange} className={`${inputClass} mt-1`}>
                    <option value="">No collection</option>
                    {!collections.includes(productForm.collection) && productForm.collection && <option value={productForm.collection}>{productForm.collection} (existing)</option>}
                    {collections.map((collection) => <option key={collection} value={collection}>{collection}</option>)}
                  </select>
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Materials (verified composition only)
                  <textarea name="fabricDetails" value={productForm.fabricDetails} onChange={handleChange} rows="2" className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Fit / style information
                  <textarea name="fitDetails" value={productForm.fitDetails} onChange={handleChange} rows="2" className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Care instructions
                  <textarea name="careInstructions" value={productForm.careInstructions} onChange={handleChange} rows="2" className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-[11px] text-xora-taupe-dark">Garment measurements by size (JSON, centimetres)
                  <textarea name="measurements" value={productForm.measurements} onChange={handleChange} rows="4" placeholder={'{"M":{"chest":102,"length":70}}'} className={`${inputClass} mt-1 font-mono`} />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-xora-charcoal">
                  <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={productForm.featured} onChange={handleChange} /> Featured</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="newArrival" checked={productForm.newArrival} onChange={handleChange} /> New</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="bestSeller" checked={productForm.bestSeller} onChange={handleChange} /> Best</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="active" checked={productForm.active} onChange={handleChange} /> Active</label>
                </div>
                <button type="submit" className="btn-luxury w-full py-3 text-[10px] flex items-center justify-center gap-2">
                  {editingId ? <PenSquare className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </form>
            </div>

            <div className={`${panelClass} xl:col-span-7`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="font-serif text-2xl text-xora-charcoal">Products ({products.length})</h2>
                <label className="relative block w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xora-taupe-dark" />
                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products" className={`${inputClass} pl-9`} />
                </label>
              </div>
              <div className="space-y-3 max-h-[720px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-xora-taupe/20 bg-white p-3 rounded-xs">
                    <img src={getProductImage(product)} alt={product.name} className="w-16 h-20 object-cover rounded-xs bg-xora-sand flex-shrink-0" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getProductImage({ category: product.category }); }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xora-charcoal break-words">{product.name}</p>
                      <p className={`text-[11px] ${product.active === true ? 'text-emerald-800' : 'text-amber-800'}`}>{product.active === true ? 'Active' : 'Archived'}</p>
                      <p className="text-[11px] text-xora-taupe-dark">{product.category} · {product.gender}</p>
                    </div>
                    <div className="sm:min-w-28 text-xs sm:text-right text-xora-charcoal">
                      <p className="font-medium">{formatInr(product.discountPrice || product.price)}</p>
                      <p className="text-[11px] text-xora-taupe-dark">Stock: {product.stock}</p>
                      <p className={`text-[11px] ${product.stock <= 10 ? 'text-amber-800' : 'text-emerald-800'}`}>{getInventoryStatus(product.stock)}</p>
                    </div>
                    <div className="flex gap-2 sm:ml-2">
                      <button type="button" onClick={() => handleEdit(product)} className="text-xs px-3 py-2 border border-xora-taupe/30 hover:border-xora-charcoal">Edit</button>
                      <button type="button" onClick={() => handleArchiveToggle(product)} className={`text-xs px-3 py-2 border ${product.active === true ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'}`}>{product.active === true ? 'Archive' : 'Activate'}</button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && <p className="py-8 text-center text-xs text-xora-taupe-dark">No products match this search.</p>}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'inventory' && (
          <section className={panelClass}>
            <div className="flex items-center gap-2 mb-4"><Boxes className="w-5 h-5" /><h2 className="font-serif text-2xl">Inventory</h2></div>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-xora-taupe/20 py-3 text-xs">
                  <div className="min-w-0"><p className="font-medium text-xora-charcoal break-words">{product.name}</p><p className="text-xora-taupe-dark">{product.category}</p></div>
                  <div className="flex items-center gap-4"><span>{product.stock} units</span><span className={product.stock <= 10 ? 'text-amber-800' : 'text-emerald-800'}>{getInventoryStatus(product.stock)}</span><button type="button" onClick={() => { handleEdit(product); setActiveSection('products'); }} className="underline underline-offset-4">Update stock</button></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'orders' && (
          <section className={panelClass}>
            <h2 className="font-serif text-2xl text-xora-charcoal mb-4">Orders ({orders.length})</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <article key={order._id} className="border border-xora-taupe/20 bg-white p-4 rounded-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 text-xs">
                      <p className="font-medium text-xora-charcoal">{order.customer?.name || 'Customer'} · {order.customer?.email || ''}</p>
                      <p className="text-xora-taupe-dark">{order.customer?.phone || 'No mobile number'} · {order.paymentMethod} · Payment: {order.paymentStatus}</p>
                      <p className="mt-2 text-xora-charcoal">{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'No items'}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <span className="font-medium text-xs text-xora-charcoal">{formatInr(order.total)}</span>
                      <select aria-label={`Order status for ${order.customer?.name || 'customer'}`} value={order.orderStatus} onChange={(e) => handleOrderStatus(order._id, e.target.value)} className="max-w-40 border border-xora-taupe/40 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-xora-charcoal">
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
              {orders.length === 0 && <p className="text-xs text-xora-taupe-dark">No orders yet.</p>}
            </div>
          </section>
        )}

        {activeSection === 'customers' && (
          <section className={panelClass}>
            <h2 className="font-serif text-2xl text-xora-charcoal mb-4">Customers ({customers.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {customers.map((customer) => (
                <article key={customer._id} className="border border-xora-taupe/20 bg-white p-4 rounded-xs min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 text-xs">
                      <p className="font-medium text-xora-charcoal break-words">{customer.name}</p>
                      <p className="text-xora-taupe-dark break-all">{customer.email}</p>
                      <p className="text-xora-taupe-dark">{customer.phone || 'No mobile number'}</p>
                      <p className="mt-2">{customer.orderCount} orders · {formatInr(customer.totalSpent)} spent</p>
                    </div>
                    <select aria-label={`Account status for ${customer.name}`} value={customer.status} onChange={(e) => handleCustomerStatus(customer._id, e.target.value)} className="border border-xora-taupe/40 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-xora-charcoal">
                      {['active', 'inactive', 'suspended'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </article>
              ))}
              {customers.length === 0 && <p className="text-xs text-xora-taupe-dark">No registered customers yet.</p>}
            </div>
          </section>
        )}

        {activeSection === 'analytics' && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {metricCards.map(([label, value]) => <div key={label} className={`${panelClass} min-w-0`}><p className="text-[10px] uppercase tracking-wider text-xora-taupe-dark">{label}</p><p className="font-serif text-xl sm:text-2xl mt-2 break-words">{value}</p></div>)}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className={panelClass}>
                <h2 className="font-serif text-2xl mb-5">Sales by Month</h2>
                <div className="space-y-4">
                  {chartData.map((entry) => {
                    const maxRevenue = Math.max(...chartData.map((month) => month.revenue || 0), 1);
                    return <div key={entry.month} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 text-xs"><span>{entry.month}</span><div className="h-2 bg-xora-sand"><div className="h-full bg-xora-charcoal" style={{ width: `${Math.max(0, (entry.revenue / maxRevenue) * 100)}%` }} /></div><span>{formatInr(entry.revenue)} · {entry.orders} orders</span></div>;
                  })}
                </div>
              </div>
              <div className={panelClass}>
                <h2 className="font-serif text-2xl mb-5">Products by Category</h2>
                <div className="space-y-3">
                  {categoryDistribution.map((category) => <div key={category.name} className="flex justify-between gap-3 border-b border-xora-taupe/20 pb-2 text-xs"><span>{category.name}</span><span>{category.count} products</span></div>)}
                  {categoryDistribution.length === 0 && <p className="text-xs text-xora-taupe-dark">No product categories available.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'settings' && (
          <section className={`${panelClass} max-w-2xl`}>
            <h2 className="font-serif text-2xl text-xora-charcoal mb-4">Admin Settings</h2>
            <dl className="space-y-3 text-xs">
              <div className="flex flex-wrap justify-between gap-2 border-b border-xora-taupe/20 pb-3"><dt className="text-xora-taupe-dark">Administrator</dt><dd>{user?.name || 'Administrator'}</dd></div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-xora-taupe/20 pb-3"><dt className="text-xora-taupe-dark">Email</dt><dd className="break-all">{user?.email}</dd></div>
              <div className="flex flex-wrap justify-between gap-2"><dt className="text-xora-taupe-dark">Role</dt><dd className="capitalize">{user?.role}</dd></div>
            </dl>
            <button type="button" onClick={handleLogout} className="mt-6 btn-luxury-outline inline-flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
          </section>
        )}
      </div>
    </div>
  );
}
