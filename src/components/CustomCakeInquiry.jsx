import { useState } from 'react';

const moistCakeFlavors = [
  { name: 'Chocolate Ganache', emoji: '🍫', color: '#3D2314' },
  { name: 'Red Velvet', emoji: '❤️', color: '#CC0000' },
  { name: 'Vanilla Butter', emoji: '🧈', color: '#F5DEB3' },
  { name: 'Creamcheese Pound', emoji: '🧀', color: '#FFFDD0' },
  { name: 'Ube Moist', emoji: '🟣', color: '#6B3FA0' },
  { name: 'Carrot Walnut', emoji: '🥕', color: '#FF6600' },
  { name: 'Banana Creamcheese', emoji: '🍌', color: '#FFE135' },
];

const chiffonCakeFlavors = [
  { name: 'Vanilla', emoji: '🌸', color: '#F5F5DC' },
  { name: 'Dulce de Leche', emoji: '🍮', color: '#D2691E' },
  { name: 'Ube', emoji: '🟣', color: '#6B3FA0' },
  { name: 'Matcha', emoji: '🍵', color: '#4CAF50' },
  { name: 'Café Latte', emoji: '☕', color: '#6F4E37' },
];

export default function CustomCakeInquiry({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateNeeded: '',
    venue: '',
    age: '',
    celebrantName: '',
    gender: '',
    theme: '',
    flavor: '',
    sizeTier: '',
    budget: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    if (!formData.dateNeeded) e.dateNeeded = 'Date needed is required';
    if (!formData.venue.trim()) e.venue = 'Venue is required';
    if (!formData.age.trim()) e.age = 'Age is required';
    if (!formData.celebrantName.trim()) e.celebrantName = 'Celebrant name is required';
    if (!formData.gender) e.gender = 'Gender is required';
    if (!formData.theme.trim()) e.theme = 'Theme is required';
    if (!formData.flavor.trim()) e.flavor = 'Flavor is required';
    if (!formData.sizeTier.trim()) e.sizeTier = 'Size/tier is required';
    if (!formData.budget.trim()) e.budget = 'Budget is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const inquiryText = `Custom Cake Inquiry
  
Date Needed: ${formData.dateNeeded}
Venue: ${formData.venue}
Age of Celebrant: ${formData.age}
Name of Celebrant: ${formData.celebrantName}
Gender: ${formData.gender}
Desired Theme: ${formData.theme}
Cake Flavor: ${formData.flavor}
Size/Tier: ${formData.sizeTier}
Budget: ${formData.budget}
  
Additional Notes: ${formData.notes || 'None'}`;

      await onSubmit({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        pickupDate: formData.dateNeeded,
        notes: inquiryText,
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) => `w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${errors[field] ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto animate-slide-up sm:animate-none" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🎂</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Custom Cake Inquiry</h2>
              </div>
              <p className="text-blue-100 text-sm">Tell us about your dream cake and we'll make it happen!</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-2 -m-2 touch-manipulation transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Contact Information Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Juan Dela Cruz" className={inputClass('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="09XX XXX XXXX" className={inputClass('phone')} />
                {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.phone}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@email.com" className={inputClass('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.email}</p>}
            </div>
          </div>

          {/* Event Details Section */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Event Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Needed <span className="text-red-500">*</span></label>
                <input type="date" value={formData.dateNeeded} onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })} min={new Date().toISOString().split('T')[0]} className={inputClass('dateNeeded')} />
                {errors.dateNeeded && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.dateNeeded}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue <span className="text-red-500">*</span></label>
                <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="e.g., Greenbelt Mall" className={inputClass('venue')} />
                {errors.venue && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.venue}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age <span className="text-red-500">*</span></label>
                <input type="text" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="e.g., 1st birthday" className={inputClass('age')} />
                {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Celebrant Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.celebrantName} onChange={(e) => setFormData({ ...formData, celebrantName: e.target.value })} placeholder="Name" className={inputClass('celebrantName')} />
                {errors.celebrantName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.celebrantName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputClass('gender')}>
                  <option value="">Select</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="neutral">Neutral</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.gender}</p>}
              </div>
            </div>
          </div>

          {/* Cake Specifications Section */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Cake Specifications
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Desired Theme <span className="text-red-500">*</span></label>
              <input type="text" value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })} placeholder="e.g., Superheroes, Floral, Princess" className={inputClass('theme')} />
              {errors.theme && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.theme}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cake Flavor <span className="text-red-500">*</span></label>
                <select
                  value={formData.flavor}
                  onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                  className={inputClass('flavor')}
                >
                  <option value="">Select flavor</option>
                  <optgroup label="Moist Cakes">
                    {moistCakeFlavors.map((flavor) => (
                      <option key={flavor.name} value={flavor.name}>{flavor.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Chiffon Cakes (not for fondant)">
                    {chiffonCakeFlavors.map((flavor) => (
                      <option key={flavor.name} value={flavor.name}>{flavor.name}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.flavor && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.flavor}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Size/Tier <span className="text-red-500">*</span></label>
                <select
                  value={formData.sizeTier}
                  onChange={(e) => setFormData({ ...formData, sizeTier: e.target.value })}
                  className={inputClass('sizeTier')}
                >
                  <option value="">Select size</option>
                  <optgroup label="Single Tier">
                    <option value="6 inch (serves 8-12)">6 inch (serves 8-12)</option>
                    <option value="8 inch (serves 15-20)">8 inch (serves 15-20)</option>
                    <option value="10 inch (serves 25-30)">10 inch (serves 25-30)</option>
                    <option value="12 inch (serves 35-40)">12 inch (serves 35-40)</option>
                  </optgroup>
                  <optgroup label="Multi-Tier">
                    <option value="2-tier (6+8 inch, serves 30-40)">2-tier (6+8 inch, serves 30-40)</option>
                    <option value="2-tier (8+10 inch, serves 40-50)">2-tier (8+10 inch, serves 40-50)</option>
                    <option value="2-tier (10+12 inch, serves 50-65)">2-tier (10+12 inch, serves 50-65)</option>
                    <option value="3-tier (6+8+10 inch, serves 60-80)">3-tier (6+8+10 inch, serves 60-80)</option>
                    <option value="3-tier (8+10+12 inch, serves 80-100)">3-tier (8+10+12 inch, serves 80-100)</option>
                    <option value="4-tier (6+8+10+12 inch, serves 120-150)">4-tier (6+8+10+12 inch, serves 120-150)</option>
                  </optgroup>
                  <optgroup label="Custom">
                    <option value="Custom size (please specify in notes)">Custom size (please specify in notes)</option>
                  </optgroup>
                </select>
                {errors.sizeTier && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.sizeTier}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget <span className="text-red-500">*</span></label>
                <input type="text" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g., ₱5000" className={inputClass('budget')} />
                {errors.budget && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.budget}</p>}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Allergies, custom messages, special requests, or any other details..." rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all resize-none" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Inquiry'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
