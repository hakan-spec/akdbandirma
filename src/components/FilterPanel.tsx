import React from 'react';
import { X, Filter } from 'lucide-react';
import { CustomerStatus, EducationLevel, ContactType, RegistrationType, FollowUpStatus, LanguageLevel } from '../types/Customer';

interface FilterPanelProps {
  filters: {
    status: CustomerStatus | '';
    educationLevel: EducationLevel | '';
    contactType: ContactType | '';
    registrationType: RegistrationType | '';
    languageLevel: LanguageLevel | '';
    placementTestLevel: LanguageLevel | '';
    followUpStatus: FollowUpStatus | '';
  };
  onFiltersChange: (filters: {
    status: CustomerStatus | '';
    educationLevel: EducationLevel | '';
    contactType: ContactType | '';
    registrationType: RegistrationType | '';
    languageLevel: LanguageLevel | '';
    placementTestLevel: LanguageLevel | '';
    followUpStatus: FollowUpStatus | '';
  }) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      educationLevel: '',
      contactType: '',
      registrationType: '',
      languageLevel: '',
      placementTestLevel: '',
      followUpStatus: ''
    });
  };

  const hasActiveFilters = filters.status || filters.educationLevel || filters.contactType || filters.registrationType || filters.languageLevel || filters.placementTestLevel || filters.followUpStatus;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtreler</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <option value="yeni">Yeni</option>
            <option value="ilgili">İlgili</option>
            <option value="kayitli">Kayıtlı</option>
            <option value="iptal">İptal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kayıt Türü
          </label>
          <select
            value={filters.registrationType}
            onChange={(e) => handleFilterChange('registrationType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <option value="yeni-kayit">Yeni Kayıt</option>
            <option value="kayit-yenileme">Kayıt Yenileme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eğitim Seviyesi
          </label>
          <select
            value={filters.educationLevel}
            onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <option value="ilkogretim">İlköğretim</option>
            <option value="lise">Lise</option>
            <option value="universite">Üniversite</option>
            <option value="yetiskin">Yetişkin</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İletişim Türü
          </label>
          <select
            value={filters.contactType}
            onChange={(e) => handleFilterChange('contactType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <option value="telefon">Telefon</option>
            <option value="yuz-yuze">Yüz Yüze</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlgilenilen Seviye
          </label>
          <select
            value={filters.languageLevel}
            onChange={(e) => handleFilterChange('languageLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <optgroup label="İlköğretim Seviyeleri">
              <option value="starter2">Starter 2</option>
              <option value="starter3">Starter 3</option>
              <option value="starter4">Starter 4</option>
              <option value="level5">Level 5</option>
              <option value="level6">Level 6</option>
              <option value="level7">Level 7</option>
              <option value="level8">Level 8</option>
            </optgroup>
            <optgroup label="Lise/Üniversite/Yetişkin Seviyeleri">
              <option value="A1.1">A1.1</option>
              <option value="A1.2">A1.2</option>
              <option value="A2.1">A2.1</option>
              <option value="A2.2">A2.2</option>
              <option value="B1.1">B1.1</option>
              <option value="B1.2">B1.2</option>
              <option value="B2.1">B2.1</option>
              <option value="B2.2">B2.2</option>
              <option value="C1.1">C1.1</option>
              <option value="C1.2">C1.2</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seviye Tespit Sınavı Sonucu
          </label>
          <select
            value={filters.placementTestLevel}
            onChange={(e) => handleFilterChange('placementTestLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <optgroup label="İlköğretim Seviyeleri">
              <option value="starter2">Starter 2</option>
              <option value="starter3">Starter 3</option>
              <option value="starter4">Starter 4</option>
              <option value="level5">Level 5</option>
              <option value="level6">Level 6</option>
              <option value="level7">Level 7</option>
              <option value="level8">Level 8</option>
            </optgroup>
            <optgroup label="Lise/Üniversite/Yetişkin Seviyeleri">
              <option value="A1.1">A1.1</option>
              <option value="A1.2">A1.2</option>
              <option value="A2.1">A2.1</option>
              <option value="A2.2">A2.2</option>
              <option value="B1.1">B1.1</option>
              <option value="B1.2">B1.2</option>
              <option value="B2.1">B2.1</option>
              <option value="B2.2">B2.2</option>
              <option value="C1.1">C1.1</option>
              <option value="C1.2">C1.2</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Takip Durumu
          </label>
          <select
            value={filters.followUpStatus}
            onChange={(e) => handleFilterChange('followUpStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tümü</option>
            <option value="geciken">🔴 Geciken Takipler</option>
            <option value="bu-hafta">🟠 Bu Haftaki Takipler</option>
            <option value="gelecek-hafta">🟡 Gelecek Haftaki Takipler</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;