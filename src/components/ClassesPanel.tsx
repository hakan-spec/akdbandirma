import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, BookOpen, Edit, Trash2, UserPlus, Search, Filter, X, User } from 'lucide-react';
import { Class } from '../types/Class';
import { Customer } from '../types/Customer';
import { LanguageLevel } from '../types/Customer';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { teacherService, Teacher } from '../services/teacherService';
import ClassForm from './ClassForm';
import AddStudentToClassForm from './AddStudentToClassForm';

interface ClassesPanelProps {
  onBack: () => void;
  onViewClassDetails: (classItem: Class) => void;
  onStudentsUpdated: () => void;
}

const ClassesPanel: React.FC<ClassesPanelProps> = ({ onBack, onViewClassDetails, onStudentsUpdated }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Customer[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'addStudent'>('list');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    level: '' as LanguageLevel | '',
    day: '',
    timeRange: '',
    tag: '',
    teacherId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Filter classes based on search and filters
  useEffect(() => {
    let filtered = classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.level) {
      filtered = filtered.filter(classItem => classItem.level === filters.level);
    }
    if (filters.day) {
      filtered = filtered.filter(classItem => 
        classItem.days && classItem.days.includes(filters.day)
      );
    }
    if (filters.timeRange) {
      filtered = filtered.filter(classItem => 
        classItem.timeRange && classItem.timeRange.toLowerCase().includes(filters.timeRange.toLowerCase())
      );
    }
    if (filters.tag) {
      filtered = filtered.filter(classItem => 
        classItem.tags && classItem.tags.includes(filters.tag)
      );
    }
    if (filters.teacherId) {
      filtered = filtered.filter(classItem => {
        if (filters.teacherId === 'unassigned') {
          return !classItem.teacherId;
        }
        return classItem.teacherId === filters.teacherId;
      });
    }

    setFilteredClasses(filtered);
  }, [classes, searchTerm, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const classesData = await classService.getAllClasses();
      const studentsData = await studentService.getAllStudents();
      const teachersData = await teacherService.getAllTeachers();
      setClasses(classesData);
      setFilteredClasses(classesData);
      setStudents(studentsData);
      setAllTeachers(teachersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (name: string, level: any, startDate?: string, endDate?: string, days?: string[], timeRange?: string, tags?: string[], teacherId?: string | null) => {
    try {
      setActionLoading(true);
      await classService.addClass(name, level, startDate, endDate, days, timeRange, tags, teacherId);
      await loadData();
      setCurrentView('list');
    } catch (err) {
      console.error('Error adding class:', err);
      setError('Sınıf eklenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateClass = async (id: string, name: string, level: any, startDate?: string, endDate?: string, days?: string[], timeRange?: string, tags?: string[], teacherId?: string | null) => {
    try {
      setActionLoading(true);
      await classService.updateClass(id, name, level, startDate, endDate, days, timeRange, tags, teacherId);
      await loadData();
      setCurrentView('list');
      setSelectedClass(null);
    } catch (err) {
      console.error('Error updating class:', err);
      setError('Sınıf güncellenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Bu sınıfı silmek istediğinizden emin misiniz? Sınıftaki öğrenciler sınıfsız kalacaktır.')) {
      return;
    }

    try {
      setActionLoading(true);
      await classService.deleteClass(classId);
      await loadData();
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Sınıf silinirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: string, classId: string) => {
    try {
      setActionLoading(true);
      await classService.assignStudentToClass(studentId, classId);
      await loadData();
      onStudentsUpdated();
      setCurrentView('list');
      setSelectedClass(null);
    } catch (err) {
      console.error('Error assigning student to class:', err);
      setError('Öğrenci sınıfa eklenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStudentsInClass = (classId: string) => {
    return students.filter(student => student.classId === classId);
  };

  const getUnassignedStudents = () => {
    return students.filter(student => !student.classId);
  };

  const clearFilters = () => {
    setFilters({
      level: '',
      day: '',
      timeRange: '',
      tag: '',
      teacherId: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.level || filters.day || filters.timeRange || filters.tag || filters.teacherId || searchTerm;

  // Get unique values for filter options
  const uniqueLevels = [...new Set(classes.map(c => c.level))];
  const uniqueDays = [...new Set(classes.flatMap(c => c.days || []))];
  const uniqueTimeRanges = [...new Set(classes.map(c => c.timeRange).filter(Boolean))];
  const uniqueTags = [...new Set(classes.flatMap(c => c.tags || []))];
  const activeTeachers = allTeachers.filter(t => t.isActive);

  if (currentView === 'form') {
    return (
      <ClassForm
        class={selectedClass}
        onSubmit={selectedClass 
          ? (name, level, startDate, endDate, days, timeRange, tags) => handleUpdateClass(selectedClass.id, name, level, startDate, endDate, days, timeRange, tags)
          : handleAddClass
        }
        onCancel={() => {
          setCurrentView('list');
          setSelectedClass(null);
        }}
        loading={actionLoading}
      />
    );
  }

  if (currentView === 'addStudent' && selectedClass) {
    return (
      <AddStudentToClassForm
        class={selectedClass}
        availableStudents={getUnassignedStudents()}
        onSubmit={(studentId) => handleAssignStudent(studentId, selectedClass.id)}
        onCancel={() => {
          setCurrentView('list');
          setSelectedClass(null);
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
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Sınıflar</h1>
            </div>
            <button
              onClick={() => setCurrentView('form')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Sınıf</span>
            </button>
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
                  placeholder="Sınıf adı veya seviye ara..."
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
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[filters.level, filters.day, filters.timeRange, searchTerm].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Filtreleri Temizle</span>
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seviye
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as LanguageLevel | '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Tüm Seviyeler</option>
                    <optgroup label="İlkokul Seviyeleri">
                      {uniqueLevels.filter(level => ['starter2', 'starter3', 'starter4', 'level5', 'level6', 'level7', 'level8'].includes(level)).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Lise/Üniversite/Yetişkin Seviyeleri">
                      {uniqueLevels.filter(level => ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2'].includes(level)).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ders Günü
                  </label>
                  <select
                    value={filters.day}
                    onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Tüm Günler</option>
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saat Aralığı
                  </label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Tüm Saatler</option>
                    {uniqueTimeRanges.map(timeRange => (
                      <option key={timeRange} value={timeRange}>{timeRange}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiket
                  </label>
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Tüm Etiketler</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğretmen
                  </label>
                  <select
                    value={filters.teacherId}
                    onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Tüm Öğretmenler</option>
                    <option value="unassigned">Atanmamış Sınıflar</option>
                    {activeTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
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
                  loadData();
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

      {/* Classes List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length === 0 ? (
            classes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sınıf yok</h3>
              <p className="text-gray-500 mb-4">İlk sınıfınızı oluşturmak için "Yeni Sınıf" butonuna tıklayın.</p>
              <button
                onClick={() => setCurrentView('form')}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Sınıf Oluştur</span>
              </button>
            </div>
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Filtrelere uygun sınıf bulunamadı</h3>
                <p className="text-gray-500 mb-4">Arama kriterlerinizi değiştirmeyi deneyin.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Filtreleri Temizle</span>
                </button>
              </div>
            )
          ) : (
            filteredClasses.map((classItem) => {
              const studentsInClass = getStudentsInClass(classItem.id);
              return (
                <div 
                  key={classItem.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewClassDetails(classItem)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {classItem.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.level}
                      </span>
                      {classItem.startDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Başlama: {new Date(classItem.startDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                      {classItem.endDate && (
                        <p className="text-xs text-gray-500">
                          Bitiş: {new Date(classItem.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                      {classItem.days && classItem.days.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Günler: {classItem.days.join(', ')}
                        </p>
                      )}
                      {classItem.timeRange && (
                        <p className="text-xs text-gray-500">
                          Saat: {classItem.timeRange}
                        </p>
                      )}
                      {classItem.tags && classItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {classItem.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {classItem.teacherName && (
                        <p className="text-xs text-gray-600 mt-1">
                          <User className="h-3 w-3 inline mr-1" />
                          Öğretmen: <span className="font-medium">{classItem.teacherName}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(classItem);
                          setCurrentView('form');
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(classItem.id);
                        }}
                        disabled={actionLoading}
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {studentsInClass.length} öğrenci
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClass(classItem);
                        setCurrentView('addStudent');
                      }}
                      className="flex items-center space-x-1 text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>Öğrenci Ekle</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      Öğrenci detaylarını görmek için sınıfa tıklayın
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Oluşturulma: {new Date(classItem.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ClassesPanel;