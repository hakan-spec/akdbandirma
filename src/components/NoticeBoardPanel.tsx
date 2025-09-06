import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import { Message } from '../types/Message';
import StickyNotesPanel from './StickyNotesPanel';

interface NoticeBoardPanelProps {
  onBack: () => void;
}

const NoticeBoardPanel: React.FC<NoticeBoardPanelProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notları en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Notları yükle
  useEffect(() => {
    loadMessages();
  }, []);

  // Yeni notlar geldiğinde en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gerçek zamanlı not aboneliği
  useEffect(() => {
    const unsubscribe = messageService.subscribeToMessages((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return unsubscribe;
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMessages = await messageService.getMessages();
      setMessages(fetchedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Notlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim() || sending) return;

    try {
      setSending(true);
      setError(null);
      
      const sentMessage = await messageService.sendMessage(newNote);
      setNewNote('');
      
      // Gönderilen mesajı hemen yerel duruma ekle
      setMessages(prev => [...prev, sentMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Not gönderilirken hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (message: Message) => {
    if (message.userId === user?.id) {
      return 'Siz';
    }
    // Diğer kullanıcılar için ID'nin ilk 8 karakterini göster
    return `Kullanıcı: ${message.userId.substring(0, 8)}...`;
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] flex">
      {/* Left Side - Sticky Notes */}
      <div className="w-80 bg-white shadow-sm rounded-l-lg border-r border-gray-200">
        <StickyNotesPanel />
      </div>

      {/* Right Side - Messages */}
      <div className="flex-1 flex flex-col">
      {/* Header */}
        <div className="bg-white shadow-sm rounded-tr-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Ana Sayfa</span>
            </button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Ortak Pano</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Tüm kullanıcılar görebilir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadMessages();
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Tekrar dene
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Mesajlar yükleniyor...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesaj yok</h3>
                <p className="text-gray-500">İlk mesajı göndererek sohbeti başlatın!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.userId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                          }`}
                        >
                          {getUserDisplayName(message)}
                        </span>
                        <span
                          className={`text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Note Input */}
        <div className="bg-white border-t border-gray-200 rounded-br-lg">
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Mesajınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
                maxLength={1000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {newNote.length}/1000 karakter
                </span>
                <span className="text-xs text-gray-500">
                  Shift+Enter: Yeni satır, Enter: Gönder
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newNote.trim() || sending}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default NoticeBoardPanel;