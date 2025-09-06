export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  userEmail?: string; // Kullanıcının e-postası (opsiyonel)
}