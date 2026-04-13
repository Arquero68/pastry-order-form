export default function OrderSuccess({ onNewOrder }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-6">We'll contact you shortly to confirm the details.</p>
        <button
          onClick={onNewOrder}
          className="w-full bg-blue-600 text-white py-4 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors touch-manipulation text-lg"
        >
          Place Another Order
        </button>
      </div>
    </div>
  );
}
