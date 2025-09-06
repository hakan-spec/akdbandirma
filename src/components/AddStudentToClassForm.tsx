import React, { useState } from 'react';
import { UserPlus, X, Users, Search } from 'lucide-react';
import { Class } from '../types/Class';
import { Customer } from '../types/Customer';

interface AddStudentToClassFormProps {
  class: Class;
  availableStudents: Customer[];
  onSubmit: (studentId: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AddStudentToClassForm: React.FC<AddStudentToClassFormProps> = ({
  class: classData,
  availableStudents,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId) {
      onSubmit(selectedStudentId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <span>Sınıfa Öğrenci Ekle</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            <strong>{classData.name}</strong> ({classData.level}) sınıfına öğrenci ekleyin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {availableStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eklenebilecek öğrenci yok</h3>
              <p className="text-gray-500">
                Tüm öğrenciler zaten bir sınıfa atanmış durumda veya henüz öğrenci kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öğrenci Ara
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ad, soyad veya telefon ara..."
                  />
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Öğrenci Seçin *
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Arama kriterlerine uygun öğrenci bulunamadı.
                    </p>
                  ) : (
                    filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="selectedStudent"
                          value={student.id}
                          checked={selectedStudentId === student.id}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name} {student.surname}
                              </p>
                              <p className="text-sm text-gray-500">{student.phone}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {student.educationLevel === 'ilkogretim' ? 'İlköğretim' :
                                 student.educationLevel === 'lise' ? 'Lise' :
                                 student.educationLevel === 'universite' ? 'Üniversite' : 'Yetişkin'}
                              </span>
                              {student.interestedLevels.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  İlgilendiği: {student.interestedLevels.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {selectedStudentId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Seçilen öğrenci:</strong> {
                      filteredStudents.find(s => s.id === selectedStudentId)?.name
                    } {
                      filteredStudents.find(s => s.id === selectedStudentId)?.surname
                    }
                  </p>
                </div>
              )}
            </>
          )}

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
              disabled={loading || !selectedStudentId || availableStudents.length === 0}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>Sınıfa Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentToClassForm;