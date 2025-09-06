export type ContactType = 'telefon' | 'yuz-yuze';
export type CustomerStatus = 'yeni' | 'ilgili' | 'kayitli' | 'iptal';
export type EducationLevel = 'ilkogretim' | 'lise' | 'universite' | 'yetiskin';
export type RegistrationType = 'yeni-kayit' | 'kayit-yenileme';
export type LanguageLevel = 
  // İlkokul seviyeleri
  | 'starter2' | 'starter3' | 'starter4' | 'level5' | 'level6' | 'level7' | 'level8'
  // Lise, üniversite ve yetişkin seviyeleri
  | 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2' | 'B2.1' | 'B2.2' | 'C1.1' | 'C1.2';

export type PaymentType = 'pesin' | 'taksit';

export type FollowUpStatus = 'geciken' | 'bu-hafta' | 'gelecek-hafta';

export interface PriceQuote {
  id: string;
  userId?: string;
  courseLevel: string;
  courseDuration: string; // Örn: "1 Kur", "1+1, 2+1", "Özel Ders"
  totalPrice: number;
  cashPrice?: number; // Peşin fiyat
  installmentPrice?: number; // Taksitli fiyat
  paymentType: PaymentType;
  installmentCount?: number; // Taksit sayısı
  installmentAmount?: number; // Taksit tutarı
  discount?: number; // İndirim tutarı
  finalPrice: number; // Son fiyat
  notes?: string;
  createdAt: string;
  isAccepted?: boolean; // Teklif kabul edildi mi
}

export interface Interview {
  id: string;
  userId?: string;
  date: string;
  type: ContactType;
  notes: string;
  outcome: string;
  followUpDate?: string;
}

export interface Customer {
  id: string;
  userId?: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  contactType: ContactType;
  registrationType: RegistrationType;
  status: CustomerStatus;
  educationLevel: EducationLevel;
  interestedLevels: LanguageLevel[];
  placementTestLevel?: LanguageLevel; // Seviye tespit sınavı sonucu
  placementTestTeacher?: string; // Seviye tespit sınavını yapan öğretmen
  languages: string[];
  notes: string;
  interviews: Interview[];
  priceQuotes: PriceQuote[];
  createdAt: string;
  lastContact?: string;
  followUpDate?: string;
  referralCode?: string;
  referredByStudentId?: string;
  referralEarnings?: number;
  referredStudentBonus?: number;
  referralPayments: ReferralPayment[];
  bonusPayments: BonusPayment[];
  totalReferralEarningsPaid: number;
  totalReferredBonusPaid: number;
  referrerInfo?: {
    id: string;
    name: string;
    surname: string;
    referralCode: string;
  };
  classId?: string;
}

export interface ReferralPayment {
  id: string;
  studentId: string;
  amount: number;
  paidAt: string;
  userId: string;
  notes: string;
  createdAt: string;
}

export interface BonusPayment {
  id: string;
  studentId: string;
  amount: number;
  paidAt: string;
  userId: string;
  notes: string;
  createdAt: string;
}
export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  userEmail?: string; // Kullanıcının e-postası (opsiyonel)
}

export interface StickyNote {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  userEmail?: string; // Notu oluşturan kullanıcının e-postası (opsiyonel)
}