import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, StickyNote as StickyNoteIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { stickyNoteService } from '../services/stickyNoteService';
import { StickyNote } from '../types/Customer';

const StickyNotesPanel: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Notları yükle
  useEffect(() => {
    loadNotes();
  }, []);

  // Gerçek zamanlı not aboneliği
  useEffect(() => {
    const unsubscribe = stickyNoteService.subscribeToStickyNotes(
      (newNote) => {
        setNotes(prev => [newNote, ...prev]);
      },
      (updatedNote) => {
        setNotes(prev => prev.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        ));
      },
      (deletedNoteId) => {
        setNotes(prev => prev.filter(note => note.id !== deletedNoteId));
      }
    );

    return unsubscribe;
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await stickyNoteService.getStickyNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Error loading sticky notes:', err);
      setError('Notlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNoteContent.trim()) return;

    try {
      setActionLoading('add');
      setError(null);
      
      const addedNote = await stickyNoteService.addStickyNote(newNoteContent);
      setNewNoteContent('');
      setShowAddForm(false);
      
      // Notu hemen yerel duruma ekle
      setNotes(prev => [addedNote, ...prev]);
    } catch (err) {
      console.error('Error adding sticky note:', err);
      setError('Not eklenirken hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      setActionLoading(noteId);
      setError(null);
      
      const updatedNote = await stickyNoteService.updateStickyNote(noteId, editingContent);
      setEditingNoteId(null);
      setEditingContent('');
      
      // Notu hemen yerel durumda güncelle
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
    } catch (err) {
      console.error('Error updating sticky note:', err);
      setError('Not güncellenirken hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return;

    try {
      setActionLoading(noteId);
      setError(null);
      
      await stickyNoteService.deleteStickyNote(noteId);
      
      // Notu hemen yerel durumdan kaldır
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting sticky note:', err);
      setError('Not silinirken hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const startEditing = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const getUserDisplayName = (note: StickyNote) => {
    if (note.userId === user?.id) {
      return 'Siz';
    }
    return `Kullanıcı: ${note.userId.substring(0, 8)}...`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <StickyNoteIcon className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium text-gray-900">Yapışkan Notlar</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-1 text-sm bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ekle</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 bg-yellow-50">
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Yeni not yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none text-sm"
              rows={3}
              maxLength={500}
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newNoteContent.length}/500 karakter
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNoteContent('');
                  }}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="h-3 w-3" />
                  <span>İptal</span>
                </button>
                <button
                  type="submit"
                  disabled={!newNoteContent.trim() || actionLoading === 'add'}
                  className="flex items-center space-x-1 text-sm bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'add' ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm text-gray-600">Yükleniyor...</span>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNoteIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Henüz yapışkan not yok</p>
            <p className="text-xs text-gray-400 mt-1">İlk notu eklemek için "Ekle" butonuna tıklayın</p>
          </div>
        ) : (
          notes.map((note) => {
            const isOwnNote = note.userId === user?.id;
            const isEditing = editingNoteId === note.id;
            
            return (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-l-4 shadow-sm ${
                  isOwnNote 
                    ? 'bg-yellow-50 border-l-yellow-400' 
                    : 'bg-gray-50 border-l-gray-400'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {editingContent.length}/500 karakter
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-3 w-3" />
                          <span>İptal</span>
                        </button>
                        <button
                          onClick={() => handleEditNote(note.id)}
                          disabled={!editingContent.trim() || actionLoading === note.id}
                          className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === note.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          <span>Kaydet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-medium ${
                        isOwnNote ? 'text-yellow-800' : 'text-gray-600'
                      }`}>
                        {getUserDisplayName(note)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(note.createdAt)}
                        </span>
                        {isOwnNote && (
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => startEditing(note)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={actionLoading === note.id}
                              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === note.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StickyNotesPanel;