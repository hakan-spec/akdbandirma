import { LanguageLevel } from './Customer';

export interface Class {
  id: string;
  userId: string;
  name: string;
  level: LanguageLevel;
  studentIds: string[]; // IDs of students in this class
  createdAt: string;
  startDate?: string; // Yeni eklendi
  endDate?: string;   // Yeni eklendi
  days: string[]; // Yeni eklendi: Ders günleri (örn: ['Pazartesi', 'Çarşamba'])
  timeRange: string; // Yeni eklendi: Ders saati aralığı (örn: '10:00 - 12:00')
  tags: string[]; // Yeni eklendi: Sınıf etiketleri
  teacherId?: string; // Yeni eklendi: Atanan öğretmenin ID'si
  teacherName?: string; // Yeni eklendi: Atanan öğretmenin adı (frontend için)
}