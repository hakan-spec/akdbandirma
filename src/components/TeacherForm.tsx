import React, { useState } from 'react';
import { Save, X, User } from 'lucide-react';
import { Teacher } from '../services/teacherService';

interface TeacherFormProps {
  teacher?: Teacher | null;
  onSubmit: (name: string, isActive: boolean) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    isActive: teacher?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData.name.trim(), formData.isActive);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>{teacher ? 'Öğretmeni Düzenle' : 'Yeni Öğretmen Ekle'}</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öğretmen Adı *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Ahmet Yılmaz"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">
              Öğretmenin tam adını girin
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Aktif öğretmen</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Aktif olmayan öğretmenler sınıf atama listesinde görünmez
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Öğretmen Hakkında</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Öğretmenler sınıflara atanabilir</li>
              <li>• Pasif öğretmenler sınıf seçim listesinde görünmez</li>
              <li>• Öğretmen silinirse, atandığı sınıflardan otomatik çıkarılır</li>
              <li>• Öğretmen adları benzersiz olmak zorunda değildir</li>
            </ul>
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
              disabled={loading || !formData.name.trim()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{teacher ? 'Güncelle' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;