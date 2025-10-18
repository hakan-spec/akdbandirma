import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Phone, Mail, Calendar, MessageSquare, User, Clock, Calculator, CreditCard, Gift, Users, CheckCircle, DollarSign, History, Wallet, FileText } from 'lucide-react';
import { Customer, Interview, ContactType, RegistrationType, PriceQuote, ReferralPayment, BonusPayment } from '../types/Customer';
import CustomerForm from './CustomerForm';
import InterviewForm from './InterviewForm';
import PriceQuoteForm from './PriceQuoteForm';
import { generateStudentReportPdf } from '../utils/pdfGenerator';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onUpdate: (customer: Customer) => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
  loading?: boolean;
}

const statusConfig = {
  yeni: { label: 'Yeni', color: 'bg-yellow-100 text-yellow-800', icon: '🆕' },
  ilgili: { label: 'İlgili', color: 'bg-blue-100 text-blue-800', icon: '👀' },
  kayitli: { label: 'Kayıtlı', color: 'bg-green-100 text-green-800', icon: '✅' },
  iptal: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: '❌' }
};

const educationConfig = {
  ilkogretim: 'İlköğretim',
  lise: 'Lise',
  universite: 'Üniversite',
  yetiskin: 'Yetişkin'
};

const levelConfig = {
  // İlkokul seviyeleri
  'starter2': 'Starter 2',
  'starter3': 'Starter 3', 
  'starter4': 'Starter 4',
  'level5': 'Level 5',
  'level6': 'Level 6',
  'level7': 'Level 7',
  'level8': 'Level 8',
  // Lise, üniversite ve yetişkin seviyeleri
  'A1.1': 'A1.1',
  'A1.2': 'A1.2',
  'A2.1': 'A2.1',
  'A2.2': 'A2.2',
  'B1.1': 'B1.1',
  'B1.2': 'B1.2',
  'B2.1': 'B2.1',
  'B2.2': 'B2.2',
  'C1.1': 'C1.1',
  'C1.2': 'C1.2'
};

const contactTypeConfig = {
  telefon: { label: 'Telefon', icon: Phone },
  'yuz-yuze': { label: 'Yüz Yüze', icon: User }
};

const registrationTypeConfig = {
  'yeni-kayit': { label: 'Yeni Kayıt', color: 'bg-green-100 text-green-800' },
  'kayit-yenileme': { label: 'Kayıt Yenileme', color: 'bg-purple-100 text-purple-800' }
};

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onBack, onUpdate, onRefresh, onDelete, loading = false }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showPriceQuoteForm, setShowPriceQuoteForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [referredStudents, setReferredStudents] = useState<Customer[]>([]);
  const [referredStudentsLoading, setReferredStudentsLoading] = useState(false);
  const [showReferralPaymentModal, setShowReferralPaymentModal] = useState(false);
  const [showBonusPaymentModal, setShowBonusPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Referans ile gelen öğrencileri yükle
  useEffect(() => {
    if (customer.referralCode) {
      loadReferredStudents();
    }
  }, [customer.id, customer.referralCode]);

  const loadReferredStudents = async () => {
    try {
      setReferredStudentsLoading(true);
      const { studentService } = await import('../services/studentService');
      const referred = await studentService.getReferredStudents(customer.id);
      setReferredStudents(referred);
    } catch (err) {
      console.error('Error loading referred students:', err);
    } finally {
      setReferredStudentsLoading(false);
    }
  };

  const handleUpdate = async (updatedData: Omit<Customer, 'id' | 'createdAt' | 'interviews' | 'priceQuotes'>) => {
    const updatedCustomer = {
      ...customer,
      ...updatedData
    };
    await onUpdate(updatedCustomer);
    setShowEditForm(false);
  };

  const handleAddInterview = async (interviewData: Omit<Interview, 'id'>) => {
    try {
      setActionLoading(true);

      console.log('DEBUG: handleAddInterview - interviewData:', interviewData);
      console.log('DEBUG: handleAddInterview - customer.followUpDate before:', customer.followUpDate);

      // Add interview to database
      const { studentService } = await import('../services/studentService');
      await studentService.addInterview(customer.id, interviewData);

      // Check if status should be updated based on outcome
      let updatedStatus = customer.status;
      if (interviewData.outcome &&
          (interviewData.outcome.toLowerCase().includes('kayıt oldu') ||
           interviewData.outcome.toLowerCase().includes('kayıt edildi') ||
           interviewData.outcome.toLowerCase().includes('kaydoldu'))) {
        updatedStatus = 'kayitli';
      }

      // Update follow-up date logic:
      // - If student is enrolled, always remove follow-up completely
      // - Otherwise, use the new follow-up date from the interview (which may be undefined to clear it)
      let updatedFollowUpDate: string | undefined;
      if (updatedStatus === 'kayitli') {
        updatedFollowUpDate = undefined;
      } else {
        updatedFollowUpDate = interviewData.followUpDate;
      }

      console.log('DEBUG: handleAddInterview - updatedFollowUpDate:', updatedFollowUpDate);

      // Update customer with new status and last contact
      const updatedCustomer = {
        ...customer,
        lastContact: interviewData.date,
        status: updatedStatus,
        followUpDate: updatedFollowUpDate
      };

      console.log('DEBUG: handleAddInterview - updatedCustomer.followUpDate:', updatedCustomer.followUpDate);

      await onUpdate(updatedCustomer);
      setShowInterviewForm(false);
    } catch (err) {
      console.error('Error adding interview:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPriceQuote = async (quoteData: Omit<PriceQuote, 'id'>) => {
    try {
      setActionLoading(true);
      
      // Add price quote to database
      const { studentService } = await import('../services/studentService');
      await studentService.addPriceQuote(customer.id, quoteData);
      
      // Refresh customer data
      await onRefresh();
      
      setShowPriceQuoteForm(false);
    } catch (err) {
      console.error('Error adding price quote:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await onDelete(customer.id);
    } catch (err) {
      console.error('Error deleting student:', err);
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddReferralPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    try {
      setActionLoading(true);
      const { studentService } = await import('../services/studentService');
      await studentService.addReferralPayment(customer.id, parseFloat(paymentAmount), paymentNotes);
      
      // Refresh customer data
      await onRefresh();
      
      setShowReferralPaymentModal(false);
      setPaymentAmount('');
      setPaymentNotes('');
    } catch (err) {
      console.error('Error adding referral payment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBonusPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    try {
      setActionLoading(true);
      const { studentService } = await import('../services/studentService');
      await studentService.addBonusPayment(customer.id, parseFloat(paymentAmount), paymentNotes);
      
      // Refresh customer data
      await onRefresh();
      
      setShowBonusPaymentModal(false);
      setPaymentAmount('');
      setPaymentNotes('');
    } catch (err) {
      console.error('Error adding bonus payment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setPdfLoading(true);
      await generateStudentReportPdf(customer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('PDF oluşturulurken hata oluştu.');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const copyReferralCode = () => {
    if (customer.referralCode) {
      navigator.clipboard.writeText(customer.referralCode);
      // You could add a toast notification here
    }
  };

  // Debug: Log customer data to see referral bonus
  console.log('DEBUG CustomerDetail - customer data:', {
    id: customer.id,
    name: customer.name,
    referralCode: customer.referralCode,
    referredByStudentId: customer.referredByStudentId,
    referredStudentBonus: customer.referredStudentBonus,
    referralEarnings: customer.referralEarnings,
    totalReferralEarningsPaid: customer.totalReferralEarningsPaid,
    totalReferredBonusPaid: customer.totalReferredBonusPaid
  });

  if (showEditForm) {
    return (
      <CustomerForm
        customer={customer}
        onSubmit={handleUpdate}
        onCancel={() => setShowEditForm(false)}
      />
    );
  }

  if (showInterviewForm) {
    return (
      <InterviewForm
        customerId={customer.id}
        onSubmit={handleAddInterview}
        onCancel={() => setShowInterviewForm(false)}
        loading={actionLoading}
      />
    );
  }

  if (showPriceQuoteForm) {
    return (
      <PriceQuoteForm
        customerId={customer.id}
        onSubmit={handleAddPriceQuote}
        onCancel={() => setShowPriceQuoteForm(false)}
        loading={actionLoading}
      />
    );
  }

  const statusInfo = statusConfig[customer.status];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Öğrenci Listesi</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowInterviewForm(true)}
                disabled={loading || actionLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Görüşme Ekle</span>
              </button>
              <button
                onClick={() => setShowPriceQuoteForm(true)}
                disabled={loading || actionLoading}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Calculator className="h-4 w-4" />
                <span>Fiyat Teklifi</span>
              </button>
              <button
                onClick={handleGeneratePdf}
                disabled={loading || actionLoading || pdfLoading}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {pdfLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>{pdfLoading ? 'Oluşturuluyor...' : 'PDF Rapor'}</span>
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                disabled={loading || actionLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || actionLoading}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xl font-semibold">
                  {customer.name.charAt(0).toUpperCase()}
                  {customer.surname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name} {customer.surname}
                </h1>
                <p className="text-gray-600">{customer.languages.join(', ')}</p>
                {customer.referralCode && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      Referans Kodu: {customer.referralCode}
                    </span>
                    <button
                      onClick={copyReferralCode}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Kopyala
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <span className="mr-1">{statusInfo.icon}</span>
                {statusInfo.label}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Kayıt: {formatShortDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{customer.email || 'Belirtilmemiş'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">İletişim Türü</p>
                  <p className="font-medium">{contactTypeConfig[customer.contactType].label}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Kayıt Türü</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${registrationTypeConfig[customer.registrationType].color}`}>
                    {registrationTypeConfig[customer.registrationType].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Eğitim Seviyesi</p>
                  <p className="font-medium">{educationConfig[customer.educationLevel]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kurs Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">İlgilenilen Diller</p>
                <div className="flex flex-wrap gap-2">
                  {customer.languages.map(language => (
                    <span key={language} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">İlgilenilen Seviyeler</p>
                <div className="flex flex-wrap gap-2">
                  {customer.interestedLevels.map(level => (
                    <span key={level} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {levelConfig[level]}
                    </span>
                  ))}
                </div>
              </div>
              {customer.placementTestLevel && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Seviye Tespit Sınavı Sonucu</p>
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
                      {levelConfig[customer.placementTestLevel]}
                    </span>
                    {customer.placementTestTeacher && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Sınavı yapan:</span> {customer.placementTestTeacher}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referral Information */}
          {(customer.referralCode || customer.referralEarnings! > 0 || referredStudents.length > 0 || customer.referredStudentBonus! > 0) && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Gift className="h-5 w-5 text-green-600 mr-2" />
                Referans Bilgileri
              </h2>
              <div className="space-y-4">
                {customer.referralCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Referans Kodu</p>
                        <p className="text-lg font-bold text-green-700">{customer.referralCode}</p>
                      </div>
                      <button
                        onClick={copyReferralCode}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Kopyala
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Bu kodu paylaşarak yeni öğrenciler getirin ve her kayıt için 1000 TL kazanın!
                    </p>
                  </div>
                )}
                
                {/* Referans Veren Öğrenci İstatistikleri */}
                {(customer.referralCode || customer.referralEarnings! > 0 || referredStudents.length > 0) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{referredStudents.length}</p>
                      <p className="text-sm text-blue-600">Getirdiği Öğrenci</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Gift className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {((customer.referralEarnings || 0) + (customer.referredStudentBonus || 0)).toLocaleString('tr-TR')} ₺
                      </p>
                      <p className="text-sm text-green-600">Toplam Kazanç</p>
                      {(customer.referralEarnings || 0) > 0 && (customer.referredStudentBonus || 0) > 0 && (
                        <div className="text-xs text-green-500 mt-1">
                          <div>Referans: {(customer.referralEarnings || 0).toLocaleString('tr-TR')} ₺</div>
                          <div>Bonus: {(customer.referredStudentBonus || 0).toLocaleString('tr-TR')} ₺</div>
                        </div>
                      )}
                    </div>
                  </div>
                    
                    {/* Referral Earnings Payment Status */}
                    {customer.referralEarnings! > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Referans Kazancı Ödemesi</p>
                            <p className="text-lg font-bold text-blue-700">{(customer.referralEarnings || 0).toLocaleString('tr-TR')} ₺</p>
                            <div className="text-sm text-blue-600 mt-1">
                              <p>Ödenen: {customer.totalReferralEarningsPaid.toLocaleString('tr-TR')} ₺</p>
                              <p className="font-medium">Kalan: {((customer.referralEarnings || 0) - customer.totalReferralEarningsPaid).toLocaleString('tr-TR')} ₺</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {((customer.referralEarnings || 0) - customer.totalReferralEarningsPaid) > 0 ? (
                              <button
                                onClick={() => setShowReferralPaymentModal(true)}
                                disabled={loading || actionLoading}
                                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                <Wallet className="h-3 w-3" />
                                <span>Ödeme Yap</span>
                              </button>
                            ) : (
                              <div className="text-right">
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Tamamen Ödendi</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Referans vererek kazandığınız tutar
                        </p>
                        
                        {/* Payment History */}
                        {customer.referralPayments.length > 0 && (
                          <div className="mt-3 border-t border-blue-200 pt-3">
                            <div className="flex items-center space-x-1 mb-2">
                              <History className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-blue-900">Ödeme Geçmişi</span>
                            </div>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {customer.referralPayments.map(payment => (
                                <div key={payment.id} className="flex justify-between items-center text-xs">
                                  <span className="text-blue-700">{formatShortDate(payment.paidAt)}</span>
                                  <span className="font-medium text-blue-800">{payment.amount.toLocaleString('tr-TR')} ₺</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Referans Alan Öğrenci Bonusu */}
                {customer.referredStudentBonus! > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Referans Bonusu</p>
                        <p className="text-lg font-bold text-purple-700">{(customer.referredStudentBonus || 0).toLocaleString('tr-TR')} ₺</p>
                        <div className="text-sm text-purple-600 mt-1">
                          <p>Ödenen: {customer.totalReferredBonusPaid.toLocaleString('tr-TR')} ₺</p>
                          <p className="font-medium">Kalan: {((customer.referredStudentBonus || 0) - customer.totalReferredBonusPaid).toLocaleString('tr-TR')} ₺</p>
                        </div>
                        {customer.referrerInfo && (
                          <div className="text-xs text-purple-600 mt-1">
                            <p>Referans veren: <span className="font-medium">{customer.referrerInfo.name} {customer.referrerInfo.surname}</span></p>
                            <p>Referans kodu: <span className="font-medium">{customer.referrerInfo.referralCode}</span></p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {((customer.referredStudentBonus || 0) - customer.totalReferredBonusPaid) > 0 ? (
                          <button
                            onClick={() => setShowBonusPaymentModal(true)}
                            disabled={loading || actionLoading}
                            className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            <Wallet className="h-3 w-3" />
                            <span>Ödeme Yap</span>
                          </button>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Tamamen Ödendi</span>
                            </div>
                          </div>
                        )}
                        <Gift className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      Referans ile kayıt olduğunuz için aldığınız bonus
                    </p>
                    
                    {/* Payment History */}
                    {customer.bonusPayments.length > 0 && (
                      <div className="mt-3 border-t border-purple-200 pt-3">
                        <div className="flex items-center space-x-1 mb-2">
                          <History className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-900">Ödeme Geçmişi</span>
                        </div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {customer.bonusPayments.map(payment => (
                            <div key={payment.id} className="flex justify-between items-center text-xs">
                              <span className="text-purple-700">{formatShortDate(payment.paidAt)}</span>
                              <span className="font-medium text-purple-800">{payment.amount.toLocaleString('tr-TR')} ₺</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {referredStudents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Referansıyla Gelen Öğrenciler:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {referredStudentsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                      ) : (
                        referredStudents.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{student.name} {student.surname}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[student.status].color}`}>
                                {statusConfig[student.status].label}
                              </span>
                              {student.status === 'kayitli' && (
                                <span className="text-xs text-green-600 font-medium">+1000 ₺</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Interviews and Price Quotes */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interviews */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Görüşme Geçmişi</h2>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                {customer.interviews.length} görüşme
              </span>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {customer.interviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Henüz görüşme kaydı yok</p>
                </div>
              ) : (
                customer.interviews.map(interview => {
                  const InterviewIcon = contactTypeConfig[interview.type].icon;
                  return (
                    <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <InterviewIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {contactTypeConfig[interview.type].label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(interview.date)}
                        </span>
                      </div>
                      {interview.outcome && (
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Sonuç: {interview.outcome}
                        </p>
                      )}
                      {interview.notes && (
                        <p className="text-sm text-gray-700 mb-2">
                          {interview.notes}
                        </p>
                      )}
                      {interview.followUpDate && (
                        <div className="flex items-center space-x-1 text-sm text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span>Takip: {formatDate(interview.followUpDate)}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Price Quotes */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Fiyat Teklifleri</h2>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                {customer.priceQuotes?.length || 0} teklif
              </span>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {!customer.priceQuotes || customer.priceQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Henüz fiyat teklifi yok</p>
                </div>
              ) : (
                customer.priceQuotes.map(quote => (
                  <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {quote.courseLevel}
                        </div>
                        <div className="text-sm text-gray-600">
                          {quote.courseDuration}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(quote.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">
                          {quote.finalPrice.toLocaleString('tr-TR')} ₺
                        </div>
                        {quote.cashPrice && quote.installmentPrice && (
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Peşin: {quote.cashPrice.toLocaleString('tr-TR')} ₺</div>
                            <div>Taksitli: {quote.installmentPrice.toLocaleString('tr-TR')} ₺</div>
                          </div>
                        )}
                        {quote.discount && quote.discount > 0 && (
                          <div className="text-xs text-red-600">
                            {quote.discount.toLocaleString('tr-TR')} ₺ indirim
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {quote.paymentType === 'pesin' ? 'Peşin' : `${quote.installmentCount} Taksit`}
                        </span>
                      </div>
                      {quote.paymentType === 'taksit' && quote.installmentAmount && (
                        <span className="text-sm text-green-600">
                          {quote.installmentAmount.toLocaleString('tr-TR')} ₺/ay
                        </span>
                      )}
                    </div>
                    
                    {quote.notes && (
                      <p className="text-sm text-gray-700 mt-2">
                        {quote.notes}
                      </p>
                    )}
                    
                    {quote.isAccepted && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Kabul Edildi
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {/* Follow-up */}
          {customer.followUpDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Takip Tarihi</p>
                  <p className="text-sm text-orange-700">
                    {formatDate(customer.followUpDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Öğrenciyi Sil</h3>
            <p className="text-gray-600 mb-4">
              {customer.name} {customer.surname} isimli öğrenciyi silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {actionLoading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Payment Modal */}
      {showBonusPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Referans Bonusu Ödemesi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Toplam Bonus: <span className="font-medium">{(customer.referredStudentBonus || 0).toLocaleString('tr-TR')} ₺</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Ödenen: <span className="font-medium">{customer.totalReferredBonusPaid.toLocaleString('tr-TR')} ₺</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Kalan: <span className="font-medium text-purple-600">{((customer.referredStudentBonus || 0) - customer.totalReferredBonusPaid).toLocaleString('tr-TR')} ₺</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ödeme Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0.00"
                  min="0"
                  max={(customer.referredStudentBonus || 0) - customer.totalReferredBonusPaid}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Ödeme ile ilgili notlar..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBonusPaymentModal(false);
                  setPaymentAmount('');
                  setPaymentNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddBonusPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || actionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Kaydediliyor...' : 'Ödeme Yap'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Referral Payment Modal */}
      {showReferralPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Referans Kazancı Ödemesi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Toplam Kazanç: <span className="font-medium">{(customer.referralEarnings || 0).toLocaleString('tr-TR')} ₺</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Ödenen: <span className="font-medium">{customer.totalReferralEarningsPaid.toLocaleString('tr-TR')} ₺</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Kalan: <span className="font-medium text-blue-600">{((customer.referralEarnings || 0) - customer.totalReferralEarningsPaid).toLocaleString('tr-TR')} ₺</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ödeme Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  max={(customer.referralEarnings || 0) - customer.totalReferralEarningsPaid}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Ödeme ile ilgili notlar..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReferralPaymentModal(false);
                  setPaymentAmount('');
                  setPaymentNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddReferralPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Kaydediliyor...' : 'Ödeme Yap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;