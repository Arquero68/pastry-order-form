export default function CartSidebar({ cart, onUpdateQuantity, onRemove, onProceed, onClose, isOpen }) {
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <div className={`fixed inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ltr:right-0 rtl:left-0 ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'} max-h-[85dvh] lg:max-h-none rounded-t-2xl lg:rounded-none`}>
        <div className="p-4 border-b flex items-center justify-between touch-manipulation">
          <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -m-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Tap a product to get started</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.productName}</div>
                    <div className="text-sm text-gray-500">{item.sizeLabel} · {item.designLabel}</div>
                  </div>
                  <button onClick={() => onRemove(idx)} className="text-gray-300 hover:text-red-500 ml-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded-md bg-white border flex items-center justify-center text-sm font-semibold hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="w-7 h-7 rounded-md bg-white border flex items-center justify-center text-sm font-semibold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">₱{item.lineTotal.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">₱{subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onProceed}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
