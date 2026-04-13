import { useState } from 'react';

export default function CheckoutForm({ cart, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pickupDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.phone.trim()) {
      e.phone = 'Phone is required';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      e.phone = 'Enter a valid phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Enter a valid email';
    }
    if (!formData.pickupDate) e.pickupDate = 'Pickup date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Order submission error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto animate-slide-up sm:animate-none" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Checkout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -m-2 touch-manipulation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Order Summary ({cart.length} item{cart.length !== 1 ? 's' : ''})</div>
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.quantity}× {item.productName} ({item.sizeLabel})</span>
                <span className="font-medium">₱{item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t">
              <span>Total</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Dela Cruz"
              className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09XX XXX XXXX"
              className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@email.com"
              className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Date *</label>
            <input
              type="date"
              value={formData.pickupDate}
              onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${errors.pickupDate ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Allergies, custom messages, delivery preferences..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : `Place Order · ₱${subtotal.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
