import React, { useState } from 'react';
import { Save, X, Calendar, MessageSquare, Target } from 'lucide-react';
import { Interview, ContactType } from '../types/Customer';

interface InterviewFormProps {
  customerId: string;
  onSubmit: (interview: Omit<Interview, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ customerId, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    type: 'telefon' as ContactType,
    notes: '',
    outcome: '',
    followUpDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      followUpDate: formData.followUpDate || undefined
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Yeni Görüşme Ekle</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Görüşme Tarihi ve Saati *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Görüşme Türü *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ContactType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="telefon">Telefon</option>
                <option value="yuz-yuze">Yüz Yüze</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="h-4 w-4 inline mr-1" />
              Görüşme Sonucu
            </label>
            <select
              value={formData.outcome}
              onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sonuç seçin...</option>
              <option value="Kayıt oldu">Kayıt oldu</option>
              <option value="Düşünüyor">Düşünüyor</option>
              <option value="Şuan düşünmüyor">Şuan düşünmüyor</option>
              <option value="Fiyat pahalı">Fiyat pahalı</option>
              <option value="Kayıt olmayacak">Kayıt olmayacak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Görüşme Notları *
            </label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Görüşmede konuşulanları, öğrencinin sorularını, verilen bilgileri detaylıca yazın..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Takip Tarihi
            </label>
            <input
              type="date"
              value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                followUpDate: e.target.value ? new Date(e.target.value).toISOString() : '' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
            />
            <p className="text-sm text-gray-500 mt-1">
              Öğrenci ile tekrar iletişim kurulacak tarih
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                  <span>Görüşmeyi Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;