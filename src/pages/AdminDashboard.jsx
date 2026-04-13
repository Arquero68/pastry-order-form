import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const categoryIcons = {
  cakes: '🎂',
  tarts: '🥧',
  cupcakes: '🧁',
  'specialty-bread': '🍞',
};

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', base_price: '', category: 'cakes', image_url: '', sizes: [] });
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (activeTab === 'orders') {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orderData) {
          setOrders(orderData);
          const orderIds = orderData.map((o) => o.id);
          const { data: itemData } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds)
            .order('created_at');

          if (itemData) {
            const grouped = {};
            itemData.forEach((item) => {
              if (!grouped[item.order_id]) grouped[item.order_id] = [];
              grouped[item.order_id].push(item);
            });
            setOrderItems(grouped);
          }
        }
      } else {
        const { data } = await supabase.from('products').select('*').order('category');
        if (data) setProducts(data);
      }
      setLoading(false);
    };
    load();
  }, [activeTab]);

  const refresh = () => setActiveTab((prev) => prev);

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    
    // Send confirmation email when status changes to 'confirmed'
    if (newStatus === 'confirmed') {
      const { data: order } = await supabase.from('orders').select('customer_email').eq('id', orderId).single();
      if (order?.customer_email) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ order_id: orderId, status: newStatus }),
          });
          const result = await response.json();
          console.log('Confirmation email:', result);
        } catch (err) {
          console.error('Failed to send confirmation email:', err);
        }
      }
    }
    
    refresh();
  };

  const deleteOrder = async (orderId) => {
    if (confirm('Delete this order and all its items?')) {
      await supabase.from('orders').delete().eq('id', orderId);
      refresh();
    }
  };

  const saveProduct = async (product) => {
    try {
      const productData = {
        ...product,
        base_price: parseFloat(product.base_price) || 0,
        sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
      };

      let error;
      if (product.id) {
        const { error: updateError } = await supabase.from('products').update(productData).eq('id', product.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('products').insert(productData);
        error = insertError;
      }

      if (error) throw error;
      setEditingProduct(null);
      setShowNewProductForm(false);
      refresh();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product: ' + err.message);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      refresh();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const toggleProductActive = async (product) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
      if (error) throw error;
      refresh();
    } catch (err) {
      console.error('Error toggling product:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CKeyks Admin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex gap-4 sm:gap-6 text-sm whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-gray-600">Pending:</span>
            <span className="font-bold text-gray-900">{orders.filter((o) => o.status === 'pending').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-gray-600">Confirmed:</span>
            <span className="font-bold text-gray-900">{orders.filter((o) => o.status === 'confirmed').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-600">Completed:</span>
            <span className="font-bold text-gray-900">{orders.filter((o) => o.status === 'completed').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-gray-600">Revenue:</span>
            <span className="font-bold text-gray-900">
              ₱{orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl font-medium text-sm transition-all touch-manipulation ${
              activeTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="sm:hidden">Orders</span>
            <span className="hidden sm:inline">Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl font-medium text-sm transition-all touch-manipulation ${
              activeTab === 'products' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="sm:hidden">Products</span>
            <span className="hidden sm:inline">Products ({products.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : activeTab === 'orders' ? (
          <OrdersList
            orders={orders}
            orderItems={orderItems}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
            getStatusColor={getStatusColor}
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
          />
        ) : (
          <ProductsManager
            products={products}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            showNewProductForm={showNewProductForm}
            setShowNewProductForm={setShowNewProductForm}
            saveProduct={saveProduct}
            deleteProduct={deleteProduct}
            toggleProductActive={toggleProductActive}
          />
        )}
      </div>
    </div>
  );
}

function OrdersList({ orders, orderItems, expandedOrder, setExpandedOrder, getStatusColor, updateOrderStatus, deleteOrder }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-gray-500 font-medium text-lg">No orders yet</p>
        <p className="text-gray-400 text-sm mt-1">Orders placed by customers will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const items = orderItems[order.id] || [];
        const isExpanded = expandedOrder === order.id;

        return (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">{order.customer_name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  <span className="whitespace-nowrap">{order.customer_phone}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="whitespace-nowrap">Pickup: {order.pickup_date}</span>
                  <span>·</span>
                  <span className="font-semibold text-gray-700">₱{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                  <span>·</span>
                  <span className="whitespace-nowrap">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <select
                  value={order.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, e.target.value);
                  }}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-2 sm:py-1.5 bg-white focus:border-blue-500 outline-none touch-manipulation min-w-[90px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOrder(order.id);
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
                  title="Delete order"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''} hidden sm:block`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                <div className="text-xs text-gray-400 mb-2 sm:hidden">
                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {order.custom_notes && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                    <p className="text-sm text-amber-800">{order.custom_notes}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl flex-shrink-0">
                          {categoryIcons[item.product_category] || '📦'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            {item.size_choice} · {item.design_choice}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-semibold text-gray-900">₱{parseFloat(item.line_total).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">× {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">₱{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductsManager({ products, editingProduct, setEditingProduct, newProduct, setNewProduct, showNewProductForm, setShowNewProductForm, saveProduct, deleteProduct, toggleProductActive }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowNewProductForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {showNewProductForm && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">New Product</h3>
          <ProductForm
            product={newProduct}
            onChange={setNewProduct}
            onSave={() => saveProduct(newProduct)}
            onCancel={() => {
              setShowNewProductForm(false);
              setNewProduct({ name: '', description: '', base_price: '', category: 'cakes', image_url: '', sizes: [] });
            }}
          />
        </div>
      )}

      {editingProduct && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Edit Product</h3>
          <ProductForm
            product={editingProduct}
            onChange={setEditingProduct}
            onSave={() => saveProduct(editingProduct)}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
          <div className="text-5xl mb-4">🧁</div>
          <p className="text-gray-500 font-medium">No products yet</p>
          <p className="text-gray-400 text-sm mt-1">Add products to display them on the order form</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                          {categoryIcons[product.category] || '📦'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[250px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 capitalize">
                      {product.category === 'specialty-bread' ? 'Bread' : product.category}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-900">₱{parseFloat(product.base_price).toFixed(2)}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <button
                        onClick={() => toggleProductActive(product)}
                        className={`px-2.5 py-1.5 sm:py-1 rounded-full text-xs font-medium cursor-pointer transition-colors touch-manipulation ${
                          product.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 px-2 py-1.5 sm:py-1 rounded-lg transition-colors touch-manipulation"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-2 py-1.5 sm:py-1 rounded-lg transition-colors touch-manipulation"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onChange, onSave, onCancel }) {
  const handleChange = (field, value) => {
    onChange({ ...product, [field]: value });
  };

  const defaultSizes = [
    { id: 'regular', label: 'Regular', serves: 'Standard', price_modifier: 0 },
  ];

  const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []);
  const currentSizes = Array.isArray(parsedSizes) && parsedSizes.length > 0 ? parsedSizes : defaultSizes;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name *</label>
          <input
            type="text"
            value={product.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Chocolate Fudge Cake"
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
          <select
            value={product.category || 'cakes'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
          >
            <option value="cakes">Cakes</option>
            <option value="tarts">Tarts</option>
            <option value="cupcakes">Cupcakes</option>
            <option value="specialty-bread">Specialty Bread</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
        <textarea
          value={product.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Short description of the product..."
          rows={2}
          className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Base Price (₱) *</label>
          <input
            type="number"
            value={product.base_price || ''}
            onChange={(e) => handleChange('base_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
          <input
            type="text"
            value={product.image_url || ''}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Sizes (JSON)
        </label>
        <input
          type="text"
          value={JSON.stringify(currentSizes)}
          readOnly
          className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-500 font-mono"
        />
        <p className="text-xs text-gray-400 mt-1 hidden sm:block">Use the size editor above to configure product sizes</p>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2.5 sm:py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors touch-manipulation">
          Cancel
        </button>
        <button
          onClick={() => {
            handleChange('sizes', currentSizes);
            setTimeout(() => onSave(), 0);
          }}
          disabled={!product.name || product.base_price === '' || product.base_price === null}
          className="px-4 py-2.5 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Save Product
        </button>
      </div>
    </div>
  );
}
