import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ItemConfigModal from './ItemConfigModal';
import CartSidebar from './CartSidebar';
import CheckoutForm from './CheckoutForm';
import CustomCakeInquiry from './CustomCakeInquiry';
import OrderSuccess from './OrderSuccess';

const categoryIcons = {
  'custom-cake': '🎨',
  cookies: '🍪',
};

const categoryLabels = {
  'custom-cake': 'Custom Cake',
  cookies: 'Cookies',
};



export default function OrderForm() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [configProduct, setConfigProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCustomCakeInquiry, setShowCustomCakeInquiry] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const filteredProducts = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
    setConfigProduct(null);
    setShowCart(true);
  };

  const updateCartQuantity = (idx, qty) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, quantity: qty, lineTotal: qty * item.unitPrice } : item
      )
    );
  };

  const removeFromCart = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitOrder = async (customerInfo) => {
    const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || '',
        pickup_date: customerInfo.pickupDate,
        custom_notes: customerInfo.notes || '',
        total_amount: subtotal,
      })
      .select()
      .single();

    if (orderError) {
      alert('Failed to create order: ' + orderError.message);
      return;
    }

    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId || null,
      product_name: item.productName,
      product_category: item.productCategory,
      size_choice: item.sizeLabel,
      design_choice: item.designLabel,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      alert('Failed to save order items: ' + itemsError.message);
      return;
    }

    setCart([]);
    setShowCheckout(false);
    setSubmitted(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (submitted) {
    return <OrderSuccess onNewOrder={() => setSubmitted(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CKeyks</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Custom Pastry Orders</p>
            </div>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all touch-manipulation ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat !== 'all' && <span>{categoryIcons[cat]}</span>}
                {cat === 'all' ? 'All Items' : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500 font-medium">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
               <button
                 key={product.id}
                 onClick={() => product.category === 'custom-cake' ? setShowCustomCakeInquiry(true) : setConfigProduct(product)}
                 className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-left hover:shadow-lg hover:border-blue-300 transition-all group touch-manipulation"
               >
                 <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                   {product.image_url ? (
                     <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">
                       {categoryIcons[product.category] || '📦'}
                     </span>
                   )}
                 </div>
                 <div className="p-3 sm:p-4">
                   <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                   <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 hidden sm:block">{product.description}</p>
                   <div className="flex items-center justify-between mt-2 sm:mt-3">
                     <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                       Tap to order
                     </span>
                   </div>
                 </div>
               </button>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {configProduct && (
        <ItemConfigModal
          product={configProduct}
          onClose={() => setConfigProduct(null)}
          onAdd={addToCart}
        />
      )}

      {showCheckout && (
        <CheckoutForm
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleSubmitOrder}
        />
      )}

      {showCustomCakeInquiry && (
        <CustomCakeInquiry
          onClose={() => setShowCustomCakeInquiry(false)}
          onSubmit={handleSubmitOrder}
        />
      )}

      <CartSidebar
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onProceed={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        onClose={() => setShowCart(false)}
        isOpen={showCart}
      />
    </div>
  );
}
