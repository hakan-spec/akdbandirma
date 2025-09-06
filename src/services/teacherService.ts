import { supabase } from '../lib/supabase';

export interface Teacher {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  userId?: string;
}

export const teacherService = {
  // Tüm aktif öğretmenleri getir
  async getActiveTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }

    return data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      isActive: teacher.is_active,
      createdAt: teacher.created_at,
      userId: teacher.user_id
    }));
  },

  // Tüm öğretmenleri getir (aktif/pasif dahil)
  async getAllTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all teachers:', error);
      throw error;
    }

    return data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      isActive: teacher.is_active,
      createdAt: teacher.created_at,
      userId: teacher.user_id
    }));
  },

  // Yeni öğretmen ekle
  async addTeacher(name: string): Promise<Teacher> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding teacher:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      isActive: data.is_active,
      createdAt: data.created_at,
      userId: data.user_id
    };
  },

  // Öğretmeni güncelle
  async updateTeacher(id: string, name: string, isActive: boolean = true): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .update({
        name: name.trim(),
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      isActive: data.is_active,
      createdAt: data.created_at,
      userId: data.user_id
    };
  },

  // Öğretmeni sil
  async deleteTeacher(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  // Öğretmeni pasif yap (silmek yerine)
  async deactivateTeacher(id: string): Promise<Teacher> {
    return this.updateTeacher(id, '', false);
  }
};