import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Phone, User, BookOpen, LogOut, Clock, AlertTriangle, BarChart3, Clipboard } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import { studentService } from './services/studentService';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import CustomerDetail from './components/CustomerDetail';
import FilterPanel from './components/FilterPanel';
import ReportPanel from './components/ReportPanel';
import NoticeBoardPanel from './components/NoticeBoardPanel';
import ClassesPanel from './components/ClassesPanel';
import ClassDetailPanel from './components/ClassDetailPanel';
import TeachersPanel from './components/TeachersPanel';
import { Class } from './types/Class';
import { Customer, CustomerStatus, EducationLevel, ContactType, RegistrationType, LanguageLevel, FollowUpStatus } from './types/Customer';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [appError, setAppError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'detail' | 'reports' | 'noticeBoard' | 'classes' | 'classDetail' | 'teachers'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as CustomerStatus | '',
    educationLevel: '' as EducationLevel | '',
    contactType: '' as ContactType | '',
    registrationType: '' as RegistrationType | '',
    languageLevel: '' as LanguageLevel | '',
    placementTestLevel: '' as LanguageLevel | '',
    followUpStatus: '' as FollowUpStatus | ''
  });

  // Load students from Supabase when user is available
  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  // Filter customers based on search and filters
  useEffect(() => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );

    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }
    if (filters.educationLevel) {
      filtered = filtered.filter(customer => customer.educationLevel === filters.educationLevel);
    }
    if (filters.contactType) {
      filtered = filtered.filter(customer => customer.contactType === filters.contactType);
    }
    if (filters.registrationType) {
      filtered = filtered.filter(customer => customer.registrationType === filters.registrationType);
    }
    if (filters.languageLevel) {
      filtered = filtered.filter(customer => customer.interestedLevels.includes(filters.languageLevel as LanguageLevel));
    }
    if (filters.placementTestLevel) {
      filtered = filtered.filter(customer => customer.placementTestLevel === filters.placementTestLevel);
    }
    if (filters.followUpStatus) {
      filtered = filtered.filter(customer => {
        if (!customer.followUpDate) return false;
        
        const followUpDate = new Date(customer.followUpDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filters.followUpStatus === 'geciken') {
          return followUpDate < today;
        }
        
        if (filters.followUpStatus === 'bu-hafta') {
          const startOfWeek = new Date(today);
          const dayOfWeek = today.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'yi hafta başı yap
          startOfWeek.setDate(today.getDate() + diff);
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          
          return followUpDate >= startOfWeek && followUpDate <= endOfWeek;
        }
        
        if (filters.followUpStatus === 'gelecek-hafta') {
          const startOfNextWeek = new Date(today);
          const dayOfWeek = today.getDay();
          const diff = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Gelecek Pazartesi
          startOfNextWeek.setDate(today.getDate() + diff);
          startOfNextWeek.setHours(0, 0, 0, 0);
          
          const endOfNextWeek = new Date(startOfNextWeek);
          endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
          endOfNextWeek.setHours(23, 59, 59, 999);
          
          return followUpDate >= startOfNextWeek && followUpDate <= endOfNextWeek;
        }
        
        return false;
      });
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const students = await studentService.getAllStudents();
      setCustomers(students);
      setFilteredCustomers(students);
      return students;
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Öğrenciler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'interviews' | 'priceQuotes'>, referralCode?: string) => {
    try {
      setLoading(true);
      await studentService.addStudent(customerData, referralCode);
      setCurrentView('list');
      await loadStudents();
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Öğrenci eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      setLoading(true);
      await studentService.updateStudent(updatedCustomer.id, updatedCustomer);
      const updatedStudents = await loadStudents();
      setSelectedCustomer(updatedStudents.find(c => c.id === updatedCustomer.id) || null);
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Öğrenci güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      const updatedStudents = await loadStudents();
      setSelectedCustomer(updatedStudents.find(c => c.id === selectedCustomer.id) || null);
    } catch (err) {
      console.error('Error refreshing customer:', err);
      setError('Öğrenci verileri yenilenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      await studentService.deleteStudent(customerId);
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      setCurrentView('list');
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Öğrenci silinirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudentNotes = async (studentId: string, newNotes: string) => {
    try {
      setLoading(true);
      await studentService.updateStudent(studentId, { notes: newNotes });
      await loadStudents();
    } catch (err) {
      console.error('Error updating student notes:', err);
      setError('Öğrenci notları güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('detail');
  };

  const handleViewClassDetails = (classItem: Class) => {
    setSelectedClassForDetail(classItem);
    setCurrentView('classDetail');
  };

  const stats = {
    total: customers.length,
    new: customers.filter(c => c.status === 'yeni').length,
    interested: customers.filter(c => c.status === 'ilgili').length,
    enrolled: customers.filter(c => c.status === 'kayitli').length,
    overdueFollowUps: customers.filter(c => {
      if (!c.followUpDate) return false;
      const followUpDate = new Date(c.followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return followUpDate < today;
    }).length,
    thisWeekFollowUps: customers.filter(c => {
      if (!c.followUpDate) return false;
      const followUpDate = new Date(c.followUpDate);
      const today = new Date();
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'yi hafta başı yap
      startOfWeek.setDate(today.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return followUpDate >= startOfWeek && followUpDate <= endOfWeek;
    }).length
  };

  // Show loading spinner while authentication is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Show app error if any critical error occurred
  if (appError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Uygulama Hatası</h3>
            <p className="text-gray-600 mb-4">{appError}</p>
            <button
              onClick={() => {
                setAppError(null);
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // Wrap the main app content in error boundary
  try {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center space-x-3 text-gray-900 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Dil Kursu Öğrenci Takip</h1>
              <div className="ml-4 text-sm text-gray-600">
                Hoş geldiniz, {user.email}
              </div>
            </button>
            <div className="flex items-center space-x-6">
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{stats.total}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-gray-600">{stats.new}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-600">{stats.interested}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-600">{stats.enrolled}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Takip İstatistikleri */}
              {(stats.overdueFollowUps > 0 || stats.thisWeekFollowUps > 0) && (
                <div className="bg-orange-50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-3">
                    {stats.overdueFollowUps > 0 && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Geciken: {stats.overdueFollowUps}</span>
                      </div>
                    )}
                    {stats.thisWeekFollowUps > 0 && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">Bu Hafta: {stats.thisWeekFollowUps}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigasyon Butonları */}
              <button
                onClick={() => setCurrentView('teachers')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Öğretmenler</span>
              </button>
              <button
                onClick={() => setCurrentView('classes')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Sınıflar</span>
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Raporlar</span>
              </button>
              <button
                onClick={() => setCurrentView('noticeBoard')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Clipboard className="h-4 w-4" />
                <span className="text-sm">Ortak Pano</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600">
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    loadStudents();
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Tekrar dene
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Yükleniyor...</span>
          </div>
        )}

        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ad, soyad veya telefon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtrele</span>
                </button>
              </div>
              <button
                onClick={() => setCurrentView('form')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Öğrenci</span>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* Customer List */}
            <CustomerList
              customers={filteredCustomers}
              onCustomerSelect={handleCustomerSelect}
            />
          </div>
        )}

        {currentView === 'form' && (
          <CustomerForm
            onSubmit={handleAddCustomer}
            onCancel={() => setCurrentView('list')}
            loading={loading}
          />
        )}

        {currentView === 'detail' && selectedCustomer && (
          <CustomerDetail
            customer={selectedCustomer}
            onBack={() => setCurrentView('list')}
            onUpdate={handleUpdateCustomer}
            onRefresh={refreshSelectedCustomer}
            onDelete={handleDeleteCustomer}
            loading={loading}
          />
        )}

        {currentView === 'reports' && (
          <ReportPanel
            onBack={() => setCurrentView('list')}
            currentUserId={user.id}
            currentUserEmail={user.email || ''}
          />
        )}

        {currentView === 'noticeBoard' && (
          <NoticeBoardPanel
            onBack={() => setCurrentView('list')}
          />
        )}

        {currentView === 'classes' && (
          <ClassesPanel
            onBack={() => setCurrentView('list')}
            onViewClassDetails={handleViewClassDetails}
            onStudentsUpdated={loadStudents}
          />
        )}

        {currentView === 'classDetail' && selectedClassForDetail && (
          <ClassDetailPanel
            classItem={selectedClassForDetail}
            studentsInClass={customers.filter(s => s.classId === selectedClassForDetail.id)}
            onBack={() => setCurrentView('classes')}
            onRemoveStudent={async (studentId: string, classId: string | null) => {
              try {
                setLoading(true);
                const { classService } = await import('./services/classService');
                await classService.assignStudentToClass(studentId, classId);
                await loadStudents();
              } catch (err) {
                console.error('Error removing student from class:', err);
                setError('Öğrenci sınıftan çıkarılırken hata oluştu.');
              } finally {
                setLoading(false);
              }
            }}
            onUpdateStudentNotes={handleUpdateStudentNotes}
            loading={loading}
          />
        )}

        {currentView === 'teachers' && (
          <TeachersPanel
            onBack={() => setCurrentView('list')}
          />
        )}
      </main>
    </div>
  );
  } catch (error) {
    console.error('App render error:', error);
    setAppError('Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    return null;
  }
}

export default App;