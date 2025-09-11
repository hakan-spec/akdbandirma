import { supabase } from '../lib/supabase';
import { Class } from '../types/Class';
import { LanguageLevel } from '../types/Customer';

const transformClassRow = (row: any): Class => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  level: row.level as LanguageLevel,
  studentIds: [], // This will be populated separately if needed
  createdAt: row.created_at,
  startDate: row.start_date, // Yeni eklendi
  endDate: row.end_date,     // Yeni eklendi
  days: row.days || [], // Yeni eklendi
  timeRange: row.time_range || '', // Yeni eklendi
  tags: row.tags || [], // Yeni eklendi
  teacherId: row.teacher_id,
  teacherName: row.teachers?.name || undefined
});

export const classService = {
  // Tüm sınıfları getir
  async getAllClasses(): Promise<Class[]> {
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select(`
        *,
        teachers!classes_teacher_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (classesError) {
      console.error('Error fetching classes:', classesError);
      throw classesError;
    }

    return classesData.map(row => transformClassRow(row));
  },

  // Yeni sınıf ekle
  async addClass(name: string, level: LanguageLevel, startDate?: string, endDate?: string, days?: string[], timeRange?: string, tags?: string[], teacherId?: string | null): Promise<Class> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        user_id: user.id,
        name: name.trim(),
        level: level,
        start_date: startDate || null, // Yeni eklendi
        end_date: endDate || null,     // Yeni eklendi
        days: days || [], // Yeni eklendi
        time_range: timeRange || '', // Yeni eklendi
        tags: tags || [], // Yeni eklendi
        teacher_id: teacherId || null
      })
      .select(`
        *,
        teachers!classes_teacher_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error('Error adding class:', error);
      throw error;
    }

    return transformClassRow(data);
  },

  // Sınıfı güncelle
  async updateClass(id: string, name: string, level: LanguageLevel, startDate?: string, endDate?: string, days?: string[], timeRange?: string, tags?: string[], teacherId?: string | null): Promise<Class> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('classes')
      .update({
        name: name.trim(),
        level: level,
        start_date: startDate || null, // Yeni eklendi
        end_date: endDate || null,     // Yeni eklendi
        days: days || [], // Yeni eklendi
        time_range: timeRange || '', // Yeni eklendi
        tags: tags || [], // Yeni eklendi
        teacher_id: teacherId || null
      })
      .eq('id', id)
      .select(`
        *,
        teachers!classes_teacher_id_fkey(name)
      `)
      .single();

    if (error) {
      // Handle case where class is not found (might have been deleted)
      if (error.code === 'PGRST116') {
        throw new Error('CLASS_NOT_FOUND');
      }
      console.error('Error updating class:', error);
      throw error;
    }

    return transformClassRow(data);
  },

  // Sınıfı sil
  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Öğrenciyi sınıfa ata
  async assignStudentToClass(studentId: string, classId: string | null): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ class_id: classId })
      .eq('id', studentId);

    if (error) {
      console.error('Error assigning student to class:', error);
      throw error;
    }
  },

  // Bir sınıftaki öğrencileri getir
  async getStudentsInClass(classId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching students in class:', error);
      throw error;
    }

    return data.map(student => student.id);
  },
};