import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Teacher } from '../services/teacherService';
import { Class } from '../types/Class';
import { Customer } from '../types/Customer';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';

interface TeacherScheduleViewProps {
  teacher: Teacher;
  onBack: () => void;
}

type DayOfWeek = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';

const daysOrder: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

interface ScheduleItem {
  class: Class;
  day: DayOfWeek;
  timeRange: string;
  startTime: number;
  studentCount: number;
}

const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({ teacher, onBack }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  useEffect(() => {
    loadTeacherClasses();
  }, [teacher.id]);

  const loadTeacherClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allClasses, allStudents] = await Promise.all([
        classService.getAllClasses(),
        studentService.getAllStudents()
      ]);
      const teacherClasses = allClasses.filter(c => c.teacherId === teacher.id);
      setClasses(teacherClasses);
      setStudents(allStudents);
    } catch (err) {
      console.error('Error loading teacher classes:', err);
      setError('Dersler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getStudentCountForClass = (classId: string): number => {
    return students.filter(s => s.classId === classId).length;
  };

  const getScheduleItems = (): ScheduleItem[] => {
    const items: ScheduleItem[] = [];

    classes.forEach(classItem => {
      if (classItem.days && classItem.timeRange) {
        const studentCount = getStudentCountForClass(classItem.id);
        classItem.days.forEach(day => {
          const timeRange = classItem.timeRange;
          const startTime = timeRange.split('-')[0].trim();
          items.push({
            class: classItem,
            day: day as DayOfWeek,
            timeRange: timeRange,
            startTime: parseTimeToMinutes(startTime),
            studentCount: studentCount
          });
        });
      }
    });

    return items.sort((a, b) => a.startTime - b.startTime);
  };

  const getScheduleByDay = (): Map<DayOfWeek, ScheduleItem[]> => {
    const scheduleMap = new Map<DayOfWeek, ScheduleItem[]>();

    daysOrder.forEach(day => {
      scheduleMap.set(day, []);
    });

    const items = getScheduleItems();
    items.forEach(item => {
      const dayItems = scheduleMap.get(item.day) || [];
      dayItems.push(item);
      scheduleMap.set(item.day, dayItems);
    });

    return scheduleMap;
  };

  const getTotalLessonsPerDay = (items: ScheduleItem[]): number => {
    let totalMinutes = 0;
    items.forEach(item => {
      const [start, end] = item.timeRange.split('-').map(t => t.trim());
      const startMin = parseTimeToMinutes(start);
      const endMin = parseTimeToMinutes(end);
      totalMinutes += (endMin - startMin);
    });
    return Math.round(totalMinutes / 40);
  };

  const scheduleByDay = getScheduleByDay();
  const totalWeeklyLessons = Array.from(scheduleByDay.values())
    .reduce((sum, items) => sum + getTotalLessonsPerDay(items), 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
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
              <span>Öğretmenler</span>
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {teacher.name} - Ders Programı
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === 'weekly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Haftalık
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Günlük
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Toplam Sınıf</p>
                  <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Haftalık Ders Saati</p>
                  <p className="text-2xl font-bold text-green-900">{totalWeeklyLessons} ders</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Ders Günü Sayısı</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Array.from(scheduleByDay.values()).filter(items => items.length > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Schedule View */}
      {classes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz atanmış ders yok</h3>
          <p className="text-gray-500">Bu öğretmene henüz bir sınıf atanmamış.</p>
        </div>
      ) : (
        <>
          {viewMode === 'weekly' ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Haftalık Ders Programı</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {daysOrder.map(day => {
                  const dayItems = scheduleByDay.get(day) || [];
                  const totalLessons = getTotalLessonsPerDay(dayItems);

                  return (
                    <div key={day} className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-32 flex-shrink-0">
                          <h4 className="font-medium text-gray-900">{day}</h4>
                          {dayItems.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {totalLessons} ders
                            </p>
                          )}
                        </div>
                        <div className="flex-1">
                          {dayItems.length === 0 ? (
                            <p className="text-gray-400 italic">Ders yok</p>
                          ) : (
                            <div className="space-y-2">
                              {dayItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.timeRange}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {item.class.name} - {item.class.level}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {item.studentCount} öğrenci
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOrder.map(day => {
                const dayItems = scheduleByDay.get(day) || [];
                const totalLessons = getTotalLessonsPerDay(dayItems);

                if (dayItems.length === 0) return null;

                return (
                  <div key={day} className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-blue-600 text-white">
                      <h4 className="font-semibold">{day}</h4>
                      <p className="text-xs opacity-90">{totalLessons} ders</p>
                    </div>
                    <div className="p-4 space-y-2">
                      {dayItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <p className="text-sm font-medium text-gray-900">
                              {item.timeRange}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {item.class.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {item.class.level}
                            </span>
                            <span className="text-xs text-gray-600">
                              {item.studentCount} öğrenci
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherScheduleView;
