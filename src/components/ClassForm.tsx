import React, { useState, useEffect } from 'react';
import { Save, X, BookOpen, User } from 'lucide-react';
import { Class } from '../types/Class';
import { LanguageLevel } from '../types/Customer';
import { teacherService, Teacher } from '../services/teacherService';

interface ClassFormProps {
  class?: Class | null;
  onSubmit: (name: string, level: LanguageLevel, startDate?: string, endDate?: string, days?: string[], timeRange?: string, tags?: string[], teacherId?: string | null) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const levelOptions: { value: LanguageLevel; label: string; category: string }[] = [
  // İlkokul seviyeleri
  { value: 'starter2', label: 'Starter 2', category: 'İlkokul' },
  { value: 'starter3', label: 'Starter 3', category: 'İlkokul' },
  { value: 'starter4', label: 'Starter 4', category: 'İlkokul' },
  { value: 'level5', label: 'Level 5', category: 'İlkokul' },
  { value: 'level6', label: 'Level 6', category: 'İlkokul' },
  { value: 'level7', label: 'Level 7', category: 'İlkokul' },
  { value: 'level8', label: 'Level 8', category: 'İlkokul' },
  // Lise, üniversite ve yetişkin seviyeleri
  { value: 'A1.1', label: 'A1.1', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'A1.2', label: 'A1.2', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'A2.1', label: 'A2.1', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'A2.2', label: 'A2.2', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'B1.1', label: 'B1.1', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'B1.2', label: 'B1.2', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'B2.1', label: 'B2.1', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'B2.2', label: 'B2.2', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'C1.1', label: 'C1.1', category: 'Lise/Üniversite/Yetişkin' },
  { value: 'C1.2', label: 'C1.2', category: 'Lise/Üniversite/Yetişkin' }
];

const tagOptions = ['İlköğretim', 'Lise', 'Üniversite', 'Yetişkin', 'Sınav Grubu'];

const ClassForm: React.FC<ClassFormProps> = ({ class: classData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    level: classData?.level || 'A1.1' as LanguageLevel,
    startDate: classData?.startDate ? classData.startDate.split('T')[0] : '', // Yeni eklendi
    endDate: classData?.endDate ? classData.endDate.split('T')[0] : '',       // Yeni eklendi
    days: classData?.days || [], // Yeni eklendi
    timeRange: classData?.timeRange || '', // Yeni eklendi
    tags: classData?.tags || [], // Yeni eklendi
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(classData?.teacherId || null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const activeTeachers = await teacherService.getAllTeachers();
        setTeachers(activeTeachers);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      days: checked
        ? [...prev.days, day]
        : prev.days.filter(d => d !== day)
    }));
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData.name, formData.level, formData.startDate, formData.endDate, formData.days, formData.timeRange, formData.tags, selectedTeacherId);
  };

  const groupedLevels = levelOptions.reduce((acc, level) => {
    if (!acc[level.category]) {
      acc[level.category] = [];
    }
    acc[level.category].push(level);
    return acc;
  }, {} as Record<string, typeof levelOptions>);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>{classData ? 'Sınıfı Düzenle' : 'Yeni Sınıf Oluştur'}</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sınıf Adı *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: İngilizce A1.1 Grubu, Starter 2 Sınıfı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seviye *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as LanguageLevel }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(groupedLevels).map(([category, levels]) => (
                <optgroup key={category} label={category}>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlama Tarihi
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ders Günleri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ders Günleri
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.days.includes(day)}
                    onChange={(e) => handleDayChange(day, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ders Saati Aralığı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ders Saati Aralığı (Örn: 10:00 - 12:00)
            </label>
            <input
              type="text"
              value={formData.timeRange}
              onChange={(e) => setFormData(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: 09:00 - 12:00"
            />
          </div>

          {/* Etiketler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiketler
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {tagOptions.map(tag => (
                <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={(e) => handleTagChange(tag, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Sınıfın ait olduğu kategorileri veya özelliklerini seçin.
            </p>
          </div>

          {/* Öğretmen Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Öğretmen
            </label>
            <select
              value={selectedTeacherId || ''}
              onChange={(e) => setSelectedTeacherId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingTeachers}
            >
              <option value="">Öğretmen Seçin (Opsiyonel)</option>
              {loadingTeachers ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))
              )}
            </select>
            {loadingTeachers && (
              <p className="text-sm text-gray-500 mt-1">Öğretmenler yükleniyor...</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Bu sınıfa atanacak öğretmeni seçin.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Sınıf Hakkında</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sınıf oluşturduktan sonra öğrencileri bu sınıfa ekleyebilirsiniz</li>
              <li>• Sınıf adını ve seviyesini istediğiniz zaman değiştirebilirsiniz</li>
              <li>• Öğrenciler birden fazla sınıfa ait olamaz</li>
              <li>• Etiketler sınıfları kategorize etmenize yardımcı olur</li>
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
              <span>{classData ? 'Güncelle' : 'Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;