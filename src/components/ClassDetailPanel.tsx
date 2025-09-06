import React, { useState } from 'react';
import { ArrowLeft, Users, BookOpen, UserMinus, Phone, Mail, MessageSquare, Save, X } from 'lucide-react';
import { Class } from '../types/Class';
import { Customer } from '../types/Customer';

interface ClassDetailPanelProps {
  classItem: Class;
  studentsInClass: Customer[];
  onBack: () => void;
  onRemoveStudent: (studentId: string, classId: string | null) => Promise<void>;
  onUpdateStudentNotes: (studentId: string, notes: string) => Promise<void>;
  loading: boolean;
}

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

const statusConfig = {
  yeni: { label: 'Yeni', color: 'bg-yellow-100 text-yellow-800', icon: '🆕' },
  ilgili: { label: 'İlgili', color: 'bg-blue-100 text-blue-800', icon: '👀' },
  kayitli: { label: 'Kayıtlı', color: 'bg-green-100 text-green-800', icon: '✅' },
  iptal: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: '❌' }
};

const ClassDetailPanel: React.FC<ClassDetailPanelProps> = ({
  classItem,
  studentsInClass,
  onBack,
  onRemoveStudent,
  onUpdateStudentNotes,
  loading
}) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentStudentForNotes, setCurrentStudentForNotes] = useState<Customer | null>(null);
  const [editingNotesContent, setEditingNotesContent] = useState('');
  const [notesActionLoading, setNotesActionLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleEditNotes = (student: Customer) => {
    setCurrentStudentForNotes(student);
    setEditingNotesContent(student.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!currentStudentForNotes || notesActionLoading) return;

    try {
      setNotesActionLoading(true);
      await onUpdateStudentNotes(currentStudentForNotes.id, editingNotesContent);
      setShowNotesModal(false);
      setCurrentStudentForNotes(null);
      setEditingNotesContent('');
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setNotesActionLoading(false);
    }
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
              <span>Sınıflar Listesi</span>
            </button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Sınıf Detayı</h1>
            </div>
            <div className="w-24"></div> {/* Spacer */}
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{classItem.name}</h2>
              <p className="text-gray-600">{levelConfig[classItem.level] || classItem.level}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {studentsInClass.length} öğrenci
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Oluşturulma: {formatDate(classItem.createdAt)}
                </div>
              </div>
              {classItem.startDate && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Başlama Tarihi:</span> {formatDate(classItem.startDate)}
                </div>
              )}
              {classItem.endDate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Bitiş Tarihi:</span> {formatDate(classItem.endDate)}
                </div>
              )}
              {classItem.days && classItem.days.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Ders Günleri:</span> {classItem.days.join(', ')}
                </div>
              )}
              {classItem.timeRange && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Ders Saati:</span> {classItem.timeRange}
                </div>
              )}
              {classItem.tags && classItem.tags.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Etiketler:</span>{' '}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {classItem.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {classItem.teacherName && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Öğretmen:</span> {classItem.teacherName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sınıftaki Öğrenciler</h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Öğrenciler yükleniyor...</span>
            </div>
          ) : studentsInClass.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bu sınıfta henüz öğrenci yok</h3>
              <p className="text-gray-500">Öğrenci eklemek için sınıflar listesine dönün ve "Öğrenci Ekle" butonunu kullanın.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notlar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInClass.map((student) => {
                    const statusInfo = statusConfig[student.status];
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {student.name.charAt(0).toUpperCase()}
                                  {student.surname.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name} {student.surname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.languages.join(', ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{student.phone}</span>
                            </div>
                            {student.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{student.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <span className="mr-1">{statusInfo.icon}</span>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.notes ? (
                            <p className="text-xs text-gray-600 max-w-xs truncate" title={student.notes}>
                              {student.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not yok</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditNotes(student)}
                              disabled={loading || notesActionLoading}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Not</span>
                            </button>
                            <button
                            onClick={() => onRemoveStudent(student.id, null)}
                            disabled={loading || notesActionLoading}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserMinus className="h-4 w-4" />
                            <span>Sınıftan Çıkar</span>
                          </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Notes Edit Modal */}
      {showNotesModal && currentStudentForNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentStudentForNotes.name} {currentStudentForNotes.surname} için Notlar
            </h3>
            <textarea
              value={editingNotesContent}
              onChange={(e) => setEditingNotesContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              rows={6}
              placeholder="Öğrenci hakkında notlar..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>İptal</span>
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={notesActionLoading}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {notesActionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPanel;