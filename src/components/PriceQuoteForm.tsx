import React, { useState } from 'react';
import { Save, X, Calculator, CreditCard, Percent } from 'lucide-react';
import { PriceQuote, PaymentType } from '../types/Customer';

interface PriceQuoteFormProps {
  customerId: string;
  onSubmit: (quote: Omit<PriceQuote, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PriceQuoteForm: React.FC<PriceQuoteFormProps> = ({ customerId, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    courseLevel: '',
    courseDuration: '',
    totalPrice: 0,
    cashPrice: 0, // Peşin fiyatı
    installmentPrice: 0, // Taksitli fiyat
    paymentType: 'pesin' as PaymentType,
    installmentCount: 2,
    discount: 0,
    notes: ''
  });

  const [calculatedData, setCalculatedData] = useState({
    installmentAmount: 0,
    finalPrice: 0
  });

  // Fiyat hesaplamaları
  React.useEffect(() => {
    const basePrice = formData.paymentType === 'pesin' ? formData.cashPrice : formData.installmentPrice;
    const discountedPrice = basePrice - (formData.discount || 0);
    const installmentAmount = formData.paymentType === 'taksit' && formData.installmentCount > 0 
      ? discountedPrice / formData.installmentCount 
      : 0;

    setCalculatedData({
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      finalPrice: discountedPrice
    });
  }, [formData.cashPrice, formData.installmentPrice, formData.discount, formData.paymentType, formData.installmentCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalPrice: formData.paymentType === 'pesin' ? formData.cashPrice : formData.installmentPrice,
      installmentAmount: formData.paymentType === 'taksit' ? calculatedData.installmentAmount : undefined,
      installmentCount: formData.paymentType === 'taksit' ? formData.installmentCount : undefined,
      finalPrice: calculatedData.finalPrice,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Yeni Fiyat Teklifi</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurs Seviyesi *
              </label>
              <input
                type="text"
                required
                value={formData.courseLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, courseLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: A1.1, Starter 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kur Türü *
              </label>
              <div className="space-y-2">
                {['1 Kur', '1+1', '2+1', '2+2', 'Özel Ders'].map(kurType => (
                  <label key={kurType} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.courseDuration.includes(kurType)}
                      onChange={(e) => {
                        const newDurations = e.target.checked
                          ? [...formData.courseDuration.split(', ').filter(d => d), kurType]
                          : formData.courseDuration.split(', ').filter(d => d !== kurType);
                        setFormData(prev => ({ ...prev, courseDuration: newDurations.join(', ') }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{kurType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calculator className="h-4 w-4 inline mr-1" />
                    Peşin Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.cashPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cashPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calculator className="h-4 w-4 inline mr-1" />
                    Taksitli Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.installmentPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Percent className="h-4 w-4 inline mr-1" />
                İndirim (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              
              {/* Fiyat Farkı Gösterimi */}
              {formData.cashPrice > 0 && formData.installmentPrice > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Peşin Fiyat:</span>
                      <span className="font-medium text-green-600">{formData.cashPrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Taksitli Fiyat:</span>
                      <span className="font-medium text-blue-600">{formData.installmentPrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                      <span className="font-medium text-gray-700">Fark:</span>
                      <span className="font-bold text-orange-600">
                        {(formData.installmentPrice - formData.cashPrice).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Ödeme Türü *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="pesin"
                  checked={formData.paymentType === 'pesin'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as PaymentType }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Peşin Ödeme</div>
                  <div className="text-sm text-gray-500">Tek seferde ödeme</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="taksit"
                  checked={formData.paymentType === 'taksit'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as PaymentType }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Taksitli Ödeme</div>
                  <div className="text-sm text-gray-500">Aylık taksitler</div>
                </div>
              </label>
            </div>
          </div>

          {formData.paymentType === 'taksit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taksit Sayısı
              </label>
              <select
                value={formData.installmentCount}
                onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
              >
                <option value={2}>2 Taksit</option>
                <option value={3}>3 Taksit</option>
                <option value={4}>4 Taksit</option>
                <option value={5}>5 Taksit</option>
                <option value={6}>6 Taksit</option>
                <option value={7}>7 Taksit</option>
                <option value={8}>8 Taksit</option>
                <option value={9}>9 Taksit</option>
                <option value={10}>10 Taksit</option>
                <option value={11}>11 Taksit</option>
                <option value={12}>12 Taksit</option>
              </select>
            </div>
          )}

          {/* Fiyat Özeti */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Fiyat Özeti</h3>
            <div className="space-y-2 text-sm">
              {/* Seçilen Ödeme Türüne Göre Fiyat */}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {formData.paymentType === 'pesin' ? 'Peşin Fiyat:' : 'Taksitli Fiyat:'}
                </span>
                <span className="font-medium">
                  {(formData.paymentType === 'pesin' ? formData.cashPrice : formData.installmentPrice).toLocaleString('tr-TR')} ₺
                </span>
              </div>
              
              {/* Diğer Ödeme Türünün Fiyatını da Göster */}
              {formData.cashPrice > 0 && formData.installmentPrice > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>
                    {formData.paymentType === 'pesin' ? 'Taksitli Fiyat:' : 'Peşin Fiyat:'}
                  </span>
                  <span>
                    {(formData.paymentType === 'pesin' ? formData.installmentPrice : formData.cashPrice).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              )}
              
              {formData.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>İndirim:</span>
                  <span>-{formData.discount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-900">Net Fiyat:</span>
                <span className="font-bold text-lg text-blue-600">{calculatedData.finalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              {formData.paymentType === 'taksit' && calculatedData.installmentAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Aylık Taksit:</span>
                  <span className="font-medium">{calculatedData.installmentAmount.toLocaleString('tr-TR')} ₺ x {formData.installmentCount}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teklif Notları
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Teklif ile ilgili özel notlar, koşullar vb..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>İptal</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Teklifi Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceQuoteForm;