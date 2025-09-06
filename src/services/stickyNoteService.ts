import { supabase } from '../lib/supabase';
import { StickyNote } from '../types/Customer';

export const stickyNoteService = {
  // Tüm yapışkan notları getir
  async getStickyNotes(): Promise<StickyNote[]> {
    const { data, error } = await supabase
      .from('sticky_notes')
      .select(`
        id,
        user_id,
        content,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sticky notes:', error);
      throw error;
    }

    return data.map(note => ({
      id: note.id,
      userId: note.user_id,
      content: note.content,
      createdAt: note.created_at
    }));
  },

  // Yeni yapışkan not ekle
  async addStickyNote(content: string): Promise<StickyNote> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({
        content: content.trim(),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding sticky note:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at
    };
  },

  // Yapışkan notu güncelle
  async updateStickyNote(id: string, content: string): Promise<StickyNote> {
    const { data, error } = await supabase
      .from('sticky_notes')
      .update({ content: content.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sticky note:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at
    };
  },

  // Yapışkan notu sil
  async deleteStickyNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('sticky_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  },

  // Gerçek zamanlı yapışkan not aboneliği
  subscribeToStickyNotes(
    onInsert: (note: StickyNote) => void,
    onUpdate: (note: StickyNote) => void,
    onDelete: (noteId: string) => void
  ) {
    const subscription = supabase
      .channel('sticky_notes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sticky_notes'
        },
        (payload) => {
          const newNote: StickyNote = {
            id: payload.new.id,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: payload.new.created_at
          };
          onInsert(newNote);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sticky_notes'
        },
        (payload) => {
          const updatedNote: StickyNote = {
            id: payload.new.id,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: payload.new.created_at
          };
          onUpdate(updatedNote);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sticky_notes'
        },
        (payload) => {
          onDelete(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};