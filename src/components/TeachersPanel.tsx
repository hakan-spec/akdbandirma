import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Edit, Trash2, Search, User, CheckCircle, XCircle } from 'lucide-react';
import { teacherService, Teacher } from '../services/teacherService';
import TeacherForm from './TeacherForm';

interface TeachersPanelProps {
  onBack: () => void;
}

const TeachersPanel: React.FC<TeachersPanelProps> = ({ onBack }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  // Filter teachers based on search and active status
  useEffect(() => {
    let filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showActiveOnly) {
      filtered = filtered.filter(teacher => teacher.isActive);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, showActiveOnly]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const teachersData = await teacherService.getAllTeachers();
      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Öğretmenler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (name: string, isActive: boolean = true) => {
    try {
      setActionLoading(true);
      await teacherService.addTeacher(name);
      await loadTeachers();
      setCurrentView('list');
    } catch (err) {
      console.error('Error adding teacher:', err);
      setError('Öğretmen eklenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeacher = async (id: string, name: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      await teacherService.updateTeacher(id, name, isActive);
      await loadTeachers();
      setCurrentView('list');
      setSelectedTeacher(null);
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError('Öğretmen güncellenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`${teacherName} isimli öğretmeni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await teacherService.deleteTeacher(teacherId);
      await loadTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Öğretmen silinirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (teacher: Teacher) => {
    try {
      setActionLoading(true);
      await teacherService.updateTeacher(teacher.id, teacher.name, !teacher.isActive);
      await loadTeachers();
    } catch (err) {
      console.error('Error toggling teacher status:', err);
      setError('Öğretmen durumu güncellenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive).length,
    inactive: teachers.filter(t => !t.isActive).length
  };

  if (currentView === 'form') {
    return (
      <TeacherForm
        teacher={selectedTeacher}
        onSubmit={selectedTeacher 
          ? (name, isActive) => handleUpdateTeacher(selectedTeacher.id, name, isActive)
          : handleAddTeacher
        }
        onCancel={() => {
          setCurrentView('list');
          setSelectedTeacher(null);
        }}
        loading={actionLoading}
      />
    );
  }

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
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Öğretmen Yönetimi</h1>
            </div>
            <button
              onClick={() => setCurrentView('form')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Öğretmen</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Toplam Öğretmen</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Aktif Öğretmen</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pasif Öğretmen</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Öğretmen adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sadece aktif öğretmenler</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadTeachers();
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

      {/* Teachers List */}
      {!loading && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Öğretmenler ({filteredTeachers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {filteredTeachers.length === 0 ? (
              teachers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz öğretmen yok</h3>
                  <p className="text-gray-500 mb-4">İlk öğretmeninizi eklemek için "Yeni Öğretmen" butonuna tıklayın.</p>
                  <button
                    onClick={() => setCurrentView('form')}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Yeni Öğretmen Ekle</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Arama kriterlerine uygun öğretmen bulunamadı</h3>
                  <p className="text-gray-500">Arama terimini değiştirmeyi deneyin.</p>
                </div>
              )
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğretmen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(teacher)}
                          disabled={actionLoading}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                            teacher.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {teacher.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Pasif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setCurrentView('form');
                            }}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPanel;