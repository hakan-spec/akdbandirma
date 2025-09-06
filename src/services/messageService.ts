import { supabase } from '../lib/supabase';
import { Message } from '../types/Message';

export const messageService = {
  // Tüm mesajları getir
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        user_id,
        content,
        created_at
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data.map(message => ({
      id: message.id,
      userId: message.user_id,
      content: message.content,
      createdAt: message.created_at
    }));
  },

  // Yeni mesaj gönder
  async sendMessage(content: string): Promise<Message> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: content.trim(),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at
    };
  },

  // Gerçek zamanlı mesaj aboneliği
  subscribeToMessages(callback: (message: Message) => void) {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: payload.new.created_at
          };
          callback(newMessage);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};