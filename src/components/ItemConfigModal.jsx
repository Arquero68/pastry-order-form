import { useState } from 'react';

const designOptions = [
  { id: 'minimalist', label: 'Minimalist', icon: '✨' },
  { id: 'floral', label: 'Floral', icon: '🌸' },
  { id: 'character', label: 'Character', icon: '🎨' },
  { id: 'custom-theme', label: 'Custom Theme', icon: '🎭' },
];

export default function ItemConfigModal({ product, onClose, onAdd }) {
  const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []);
  const sizes = Array.isArray(parsedSizes) ? parsedSizes : [];
  const defaultSizeId = sizes.length > 0 ? sizes[0].id : '';
  const [selectedSize, setSelectedSize] = useState(defaultSizeId);
  const [selectedDesign, setSelectedDesign] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCakeType, setSelectedCakeType] = useState('icing');
  const isCustom = product.category === 'custom-cake';
  const isCookie = product.category === 'cookies';
  const showDesign = !isCustom && !isCookie;
  const reqDesign = !isCustom && !isCookie;

  const cakeTypeOptions = [
    { id: 'icing', label: 'Icing', icon: '🧁' },
    { id: 'fondant', label: 'Fondant', icon: '🎂' },
  ];

  const sizeObj = sizes.find((s) => s.id === selectedSize);
  const price = product.base_price + (sizeObj?.price_modifier || 0);
  const lineTotal = price * quantity;

  const handleAdd = () => {
    if (!selectedSize) return;
    const finalDesign = isCookie ? 'minimalist' : (reqDesign ? selectedDesign : '');
    const finalDesignLabel = isCookie ? 'Minimalist' : (reqDesign ? designOptions.find((d) => d.id === selectedDesign)?.label || selectedDesign : '');
    onAdd({
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      sizeId: selectedSize,
      sizeLabel: sizeObj?.label || selectedSize,
      designId: finalDesign,
      designLabel: finalDesignLabel,
      quantity,
      unitPrice: price,
      lineTotal,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-none" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -m-2 touch-manipulation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            {isCustom && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cake Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {cakeTypeOptions.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedCakeType(type.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-1 sm:gap-2 transition-all min-h-[72px] ${
                        selectedCakeType === type.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl sm:text-xl">{type.icon}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size / Package</label>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.id)}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-h-[72px] ${
                      selectedSize === size.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm sm:text-base text-gray-800">{size.label}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{size.serves}</div>
                  </button>
                ))}
              </div>
            </div>

            {showDesign && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Design Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {designOptions.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setSelectedDesign(design.id)}
                    className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-1 sm:gap-2 transition-all min-h-[72px] ${
                      selectedDesign === design.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl sm:text-xl">{design.icon}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{design.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 font-semibold text-gray-600 touch-manipulation"
                >
                  −
                </button>
                <span className="w-16 text-center text-xl font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 font-semibold text-gray-600 touch-manipulation"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-4 sm:p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 font-medium">Item total</span>
            <span className="text-2xl font-bold text-gray-900">₱{lineTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={!selectedSize || (reqDesign && !selectedDesign)}
            onClick={handleAdd}
            className="w-full bg-blue-600 text-white py-4 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-lg"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
