import React, { useState, useEffect } from 'react';
import { Save, X, Phone, Mail, User, GraduationCap } from 'lucide-react';
import { Customer, ContactType, CustomerStatus, EducationLevel, LanguageLevel, RegistrationType } from '../types/Customer';
import { teacherService, Teacher } from '../services/teacherService';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'interviews' | 'priceQuotes'>, referredByReferralCode?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const languageOptions = [
  'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'İtalyanca', 'Rusça', 'Çince', 'Japonca',
  'Sınav Hazırlık'
];

const primaryLevels = [
  { value: 'starter2', label: 'Starter 2' },
  { value: 'starter3', label: 'Starter 3' },
  { value: 'starter4', label: 'Starter 4' },
  { value: 'level5', label: 'Level 5' },
  { value: 'level6', label: 'Level 6' },
  { value: 'level7', label: 'Level 7' },
  { value: 'level8', label: 'Level 8' }
];

const adultLevels = [
  { value: 'A1.1', label: 'A1.1' },
  { value: 'A1.2', label: 'A1.2' },
  { value: 'A2.1', label: 'A2.1' },
  { value: 'A2.2', label: 'A2.2' },
  { value: 'B1.1', label: 'B1.1' },
  { value: 'B1.2', label: 'B1.2' },
  { value: 'B2.1', label: 'B2.1' },
  { value: 'B2.2', label: 'B2.2' },
  { value: 'C1.1', label: 'C1.1' },
  { value: 'C1.2', label: 'C1.2' }
];

const getLevelOptions = (educationLevel: EducationLevel): { value: LanguageLevel; label: string }[] => {
  switch (educationLevel) {
    case 'ilkogretim':
      return [...primaryLevels, ...adultLevels];
    case 'lise':
    case 'universite':
    case 'yetiskin':
      return adultLevels;
    default:
      return [];
  }
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, loading = false }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    surname: customer?.surname || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    contactType: customer?.contactType || 'telefon' as ContactType,
    registrationType: customer?.registrationType || 'yeni-kayit' as RegistrationType,
    status: customer?.status || 'yeni' as CustomerStatus,
    educationLevel: customer?.educationLevel || 'lise' as EducationLevel,
    languages: customer?.languages || ['İngilizce'],
    interestedLevels: customer?.interestedLevels || [] as LanguageLevel[],
    placementTestLevel: customer?.placementTestLevel || '' as LanguageLevel | '',
    placementTestTeacher: customer?.placementTestTeacher || '',
    notes: customer?.notes || '',
    followUpDate: customer?.followUpDate || '',
    referredByReferralCode: ''
  });

  // Load active teachers when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const activeTeachers = await teacherService.getActiveTeachers();
        setTeachers(activeTeachers);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // referredByReferralCode'u formData'dan çıkar ve temizle
    const { referredByReferralCode, ...restFormData } = formData;
    
    const customerData = {
      ...restFormData,
      lastContact: new Date().toISOString()
    };
    
    // Referans kodunu sadece yeni öğrenci eklerken gönder
    const referralCode = !customer && referredByReferralCode && referredByReferralCode.trim() !== '' 
      ? referredByReferralCode.trim().toUpperCase() 
      : undefined;
    
    console.log('DEBUG: CustomerForm - formData.referredByReferralCode before onSubmit:', formData.referredByReferralCode);
    console.log('DEBUG: CustomerForm - Submitting with referralCode:', referralCode); // Debug log
    onSubmit(customerData, referralCode);
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked 
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }));
  };

  const handleLevelChange = (level: LanguageLevel, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interestedLevels: checked 
        ? [...prev.interestedLevels, level]
        : prev.interestedLevels.filter(l => l !== level)
    }));
  };

  const handlePlacementTestLevelChange = (level: LanguageLevel | '') => {
    setFormData(prev => ({
      ...prev,
      placementTestLevel: level || undefined,
      placementTestTeacher: level ? prev.placementTestTeacher : '' // Seviye silinirse öğretmeni de temizle
    }));
  };

  // Eğitim seviyesi değiştiğinde seviyeleri temizle
  const handleEducationLevelChange = (newEducationLevel: EducationLevel) => {
    setFormData(prev => ({
      ...prev,
      educationLevel: newEducationLevel,
      interestedLevels: [], // Seviyeleri temizle
      placementTestLevel: undefined, // Seviye tespit sınavı sonucunu da temizle
      placementTestTeacher: '' // Öğretmeni de temizle
    }));
  };

  const availableLevels = getLevelOptions(formData.educationLevel);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Ad *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soyad *
              </label>
              <input
                type="text"
                required
                value={formData.surname}
                onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Telefon *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0555 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          {/* Status and Education */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Türü
              </label>
              <select
                value={formData.contactType}
                onChange={(e) => setFormData(prev => ({ ...prev, contactType: e.target.value as ContactType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="telefon">Telefon</option>
                <option value="yuz-yuze">Yüz Yüze</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kayıt Türü
              </label>
              <select
                value={formData.registrationType}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationType: e.target.value as RegistrationType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="yeni-kayit">Yeni Kayıt</option>
                <option value="kayit-yenileme">Kayıt Yenileme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 inline mr-1" />
                Eğitim Seviyesi
              </label>
              <select
                value={formData.educationLevel}
                onChange={(e) => handleEducationLevelChange(e.target.value as EducationLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ilkogretim">İlköğretim</option>
                <option value="lise">Lise</option>
                <option value="universite">Üniversite</option>
                <option value="yetiskin">Yetişkin</option>
              </select>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              İlgilenilen Diller
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languageOptions.map(language => (
                <label key={language} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={(e) => handleLanguageChange(language, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              İlgilenilen Seviyeler ({formData.educationLevel === 'ilkogretim' ? 'İlkokul' : 
                formData.educationLevel === 'lise' ? 'Lise' : 
                formData.educationLevel === 'universite' ? 'Üniversite' : 'Yetişkin'} Seviyeleri)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableLevels.map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interestedLevels.includes(value)}
                    onChange={(e) => handleLevelChange(value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {availableLevels.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Önce eğitim seviyesini seçin
              </p>
            )}
          </div>

          {/* Placement Test Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seviye Tespit Sınavı Sonucu ({formData.educationLevel === 'ilkogretim' ? 'İlkokul' : 
                  formData.educationLevel === 'lise' ? 'Lise' : 
                  formData.educationLevel === 'universite' ? 'Üniversite' : 'Yetişkin'} Seviyeleri)
              </label>
              <select
                value={formData.placementTestLevel || ''}
                onChange={(e) => handlePlacementTestLevelChange(e.target.value as LanguageLevel | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Henüz sınav yapılmadı</option>
                {availableLevels.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Müşterinin seviye tespit sınavından aldığı sonuç
              </p>
              {availableLevels.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Önce eğitim seviyesini seçin
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sınavı Yapan Öğretmen
              </label>
              <select
                value={formData.placementTestTeacher}
                onChange={(e) => setFormData(prev => ({ ...prev, placementTestTeacher: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.placementTestLevel}
              >
                <option value="">Öğretmen seçin</option>
                {loadingTeachers ? (
                  <option disabled>Yükleniyor...</option>
                ) : (
                  teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                  ))
                )}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Seviye tespit sınavını yapan öğretmeni seçin
              </p>
              {loadingTeachers && (
                <p className="text-sm text-gray-500 mt-1">Öğretmenler yükleniyor...</p>
              )}
              {!formData.placementTestLevel && (
                <p className="text-sm text-gray-500 italic">
                  Önce sınav sonucunu seçin
                </p>
              )}
              {!loadingTeachers && teachers.length === 0 && (
                <p className="text-sm text-red-500 italic mt-1">
                  Aktif öğretmen bulunamadı. Lütfen önce öğretmen ekleyin.
                </p>
              )}
            </div>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Takip Tarihi
            </label>
            <input
              type="date"
              value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
            />
          </div>

          {/* Referral Code - Only for new customers */}
          {!customer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referans Kodu (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.referredByReferralCode}
                onChange={(e) => setFormData(prev => ({ ...prev, referredByReferralCode: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
                placeholder="Örn: AY123456"
                maxLength={8}
              />
              <p className="text-sm text-gray-500 mt-1">
                Bu öğrenci başka bir öğrencinin referansıyla geliyorsa, referans kodunu girin
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Öğrenci hakkında notlar..."
            />
          </div>

          {/* Actions */}
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
                  <span>{customer ? 'Güncelle' : 'Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;