import React, { useState } from 'react';
import { BarChart3, Calendar, Phone, User, CheckCircle, TrendingUp, FileText, ArrowLeft, Users, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { studentService } from '../services/studentService';
import { Interview } from '../types/Customer';

interface ReportPanelProps {
  onBack: () => void;
  currentUserId: string;
  currentUserEmail: string;
}

interface ReportData {
  totalInterviews: number;
  phoneInterviews: number;
  faceToFaceInterviews: number;
  enrolledStudents: number;
  referredStudentsCount: number;
  totalPotentialReferralEarnings: number;
  totalPotentialBonusPayments: number;
  totalReferralPaymentsMade: number;
  totalBonusPaymentsMade: number;
  unpaidReferralEarnings: number;
  unpaidBonusPayments: number;
  referredStudentsCount: number;
  interviewsByDate: { [date: string]: number };
  interviewsByUser: { [userId: string]: number };
  enrolledStudentsByUser: { [userId: string]: number };
}

const ReportPanel: React.FC<ReportPanelProps> = ({ onBack, currentUserId, currentUserEmail }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add time to make it inclusive of the full day
      const startDateTime = startDate + 'T00:00:00';
      const endDateTime = endDate + 'T23:59:59';

      const interviews = await studentService.getInterviewsByDateRange(startDateTime, endDateTime);

      // Get referred students in the same date range
      const referredStudents = await studentService.getReferredStudentsByDateRange(startDateTime, endDateTime);

      // Get financial data
      const financialData = await studentService.getFinancialReportData(startDateTime, endDateTime);

      // Calculate statistics
      const totalInterviews = interviews.length;
      const phoneInterviews = interviews.filter(i => i.type === 'telefon').length;
      const faceToFaceInterviews = interviews.filter(i => i.type === 'yuz-yuze').length;
      
      // Count enrolled students based on outcome keywords
      const enrollmentKeywords = ['kayıt oldu', 'kaydoldu', 'kayıt edildi', 'kayıt', 'enrolled'];
      const enrolledStudents = interviews.filter(i => 
        i.outcome && enrollmentKeywords.some(keyword => 
          i.outcome.toLowerCase().includes(keyword.toLowerCase())
        )
      ).length;

      // Group interviews by date
      const interviewsByDate: { [date: string]: number } = {};
      const interviewsByUser: { [userId: string]: number } = {};
      const enrolledStudentsByUser: { [userId: string]: number } = {};
      
      interviews.forEach(interview => {
        const date = new Date(interview.date).toLocaleDateString('tr-TR');
        interviewsByDate[date] = (interviewsByDate[date] || 0) + 1;
        
        // Group by user
        const userId = interview.userId || 'unknown';
        interviewsByUser[userId] = (interviewsByUser[userId] || 0) + 1;
        
        // Count enrolled students by user
        if (interview.outcome && enrollmentKeywords.some(keyword => 
          interview.outcome.toLowerCase().includes(keyword.toLowerCase())
        )) {
          enrolledStudentsByUser[userId] = (enrolledStudentsByUser[userId] || 0) + 1;
        }
      });

      setReportData({
        totalInterviews,
        phoneInterviews,
        faceToFaceInterviews,
        enrolledStudents,
        referredStudentsCount: referredStudents.length,
        ...financialData,
        referredStudentsCount: referredStudents.length,
        interviewsByDate,
        interviewsByUser,
        enrolledStudentsByUser
      });
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Rapor oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <span>Ana Sayfa</span>
            </button>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Görüşme Raporları</h1>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Rapor Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Görüşme</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalInterviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Telefon Görüşmesi</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.phoneInterviews}</p>
                  <p className="text-xs text-gray-500">
                    {reportData.totalInterviews > 0 
                      ? `%${Math.round((reportData.phoneInterviews / reportData.totalInterviews) * 100)}`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Yüz Yüze Görüşme</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.faceToFaceInterviews}</p>
                  <p className="text-xs text-gray-500">
                    {reportData.totalInterviews > 0 
                      ? `%${Math.round((reportData.faceToFaceInterviews / reportData.totalInterviews) * 100)}`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Kayıt Olan</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.enrolledStudents}</p>
                  <p className="text-xs text-gray-500">
                    {reportData.totalInterviews > 0 
                      ? `%${Math.round((reportData.enrolledStudents / reportData.totalInterviews) * 100)} dönüşüm`
                      : '0% dönüşüm'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Referansla Kayıt</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.referredStudentsCount}</p>
                  <p className="text-xs text-gray-500">
                    {reportData.enrolledStudents > 0 
                      ? `%${Math.round((reportData.referredStudentsCount / reportData.enrolledStudents) * 100)} referans oranı`
                      : '0% referans oranı'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Potansiyel Kazanç</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(reportData.totalPotentialReferralEarnings + reportData.totalPotentialBonusPayments).toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-gray-500">
                    Referans + Bonus
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Referans Ödemesi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalReferralPaymentsMade.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-gray-500">
                    Ödenen tutar
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Bonus Ödemesi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalBonusPaymentsMade.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-gray-500">
                    Ödenen tutar
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ödenmemiş Referans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.unpaidReferralEarnings.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-gray-500">
                    Bekleyen ödeme
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ödenmemiş Bonus</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.unpaidBonusPayments.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-gray-500">
                    Bekleyen ödeme
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapor Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Rapor Tarihi Aralığı</p>
                <p className="font-medium text-gray-900">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Dönüşüm Oranı</p>
                <p className="font-medium text-gray-900">
                  {reportData.totalInterviews > 0 
                    ? `%${Math.round((reportData.enrolledStudents / reportData.totalInterviews) * 100)}`
                    : '0%'
                  } (Kayıt olan / Toplam görüşme)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Referans Oranı</p>
                <p className="font-medium text-gray-900">
                  {reportData.enrolledStudents > 0 
                    ? `%${Math.round((reportData.referredStudentsCount / reportData.enrolledStudents) * 100)}`
                    : '0%'
                  } (Referansla kayıt / Toplam kayıt)
                </p>
              </div>
            </div>
            
            {/* Financial Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Finansal Özet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Toplam Potansiyel Kazanç</p>
                  <p className="text-lg font-bold text-green-800">
                    {(reportData.totalPotentialReferralEarnings + reportData.totalPotentialBonusPayments).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Toplam Ödenen</p>
                  <p className="text-lg font-bold text-blue-800">
                    {(reportData.totalReferralPaymentsMade + reportData.totalBonusPaymentsMade).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600 mb-1">Toplam Ödenmemiş</p>
                  <p className="text-lg font-bold text-red-800">
                    {(reportData.unpaidReferralEarnings + reportData.unpaidBonusPayments).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ödeme Oranı</p>
                  <p className="text-lg font-bold text-gray-800">
                    {(reportData.totalPotentialReferralEarnings + reportData.totalPotentialBonusPayments) > 0 
                      ? `%${Math.round(((reportData.totalReferralPaymentsMade + reportData.totalBonusPaymentsMade) / (reportData.totalPotentialReferralEarnings + reportData.totalPotentialBonusPayments)) * 100)}`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          {Object.keys(reportData.interviewsByDate).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Görüşme Dağılımı</h3>
              <div className="space-y-3">
                {Object.entries(reportData.interviewsByDate)
                  .sort(([a], [b]) => new Date(a.split('.').reverse().join('-')).getTime() - new Date(b.split('.').reverse().join('-')).getTime())
                  .map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{date}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max((count / Math.max(...Object.values(reportData.interviewsByDate))) * 100, 5)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* User Breakdown */}
          {Object.keys(reportData.interviewsByUser).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Bazlı Görüşme Dağılımı</h3>
              <div className="space-y-3">
                {Object.entries(reportData.interviewsByUser)
                  .sort(([, a], [, b]) => b - a) // En çok görüşme yapandan aza doğru sırala
                  .map(([userId, count]) => {
                    const isCurrentUser = userId === currentUserId;
                    const displayName = isCurrentUser ? `Siz (${currentUserEmail})` : `Kullanıcı: ${userId.substring(0, 8)}...`;
                    
                    return (
                      <div key={userId} className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                        isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isCurrentUser ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <span className={`font-medium ${
                            isCurrentUser ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {displayName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                isCurrentUser ? 'bg-blue-600' : 'bg-gray-500'
                              }`}
                              style={{ 
                                width: `${Math.max((count / Math.max(...Object.values(reportData.interviewsByUser))) * 100, 5)}%` 
                              }}
                            ></div>
                          </div>
                          <span className={`font-bold w-8 text-right ${
                            isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {count}
                          </span>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {reportData.totalInterviews > 0 
                              ? `%${Math.round((count / reportData.totalInterviews) * 100)}`
                              : '0%'
                            }
                          </span>
                        </div>
                        {/* Kayıt olan öğrenci sayısı */}
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Kayıt ettirdiği:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              isCurrentUser ? 'text-green-700' : 'text-green-600'
                            }`}>
                              {reportData.enrolledStudentsByUser[userId] || 0} öğrenci
                            </span>
                            <span className="text-xs text-gray-500">
                              ({count > 0 
                                ? `%${Math.round(((reportData.enrolledStudentsByUser[userId] || 0) / count) * 100)} dönüşüm`
                                : '0% dönüşüm'
                              })
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Info Note */}
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  <strong>Not:</strong> Güvenlik nedeniyle diğer kullanıcıların tam isimleri gösterilmemektedir. 
                  Sadece kullanıcı ID'lerinin ilk 8 karakteri görüntülenmektedir.
                </p>
              </div>
            </div>
          )}
          {/* No Data Message */}
          {reportData.totalInterviews === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Bulunamadı</h3>
              <p className="text-gray-500">
                Seçilen tarih aralığında görüşme veya referans kaydı bulunmuyor.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPanel;