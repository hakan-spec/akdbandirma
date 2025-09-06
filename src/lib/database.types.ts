export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          user_id: string
          name: string
          surname: string
          phone: string
          email: string
          contact_type: string
          registration_type: string
          status: string
          education_level: string
          languages: string[]
          interested_levels: string[]
          placement_test_level: string | null
          placement_test_teacher: string
          referral_code: string | null
          referral_earnings: number
          referred_by_student_id: string | null
          referred_student_bonus: number
          notes: string
          follow_up_date: string | null
          last_contact: string | null
          created_at: string
          class_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          surname: string
          phone: string
          email?: string
          contact_type?: string
          registration_type?: string
          status?: string
          education_level?: string
          languages?: string[]
          interested_levels?: string[]
          placement_test_level?: string | null
          placement_test_teacher?: string
          referral_code?: string | null
          referral_earnings?: number
          referred_by_student_id?: string | null
          referred_student_bonus?: number
          notes?: string
          follow_up_date?: string | null
          last_contact?: string | null
          created_at?: string
          class_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          surname?: string
          phone?: string
          email?: string
          contact_type?: string
          registration_type?: string
          status?: string
          education_level?: string
          languages?: string[]
          interested_levels?: string[]
          placement_test_level?: string | null
          placement_test_teacher?: string
          referral_code?: string | null
          referral_earnings?: number
          referred_by_student_id?: string | null
          referred_student_bonus?: number
          notes?: string
          follow_up_date?: string | null
          last_contact?: string | null
          created_at?: string
          class_id?: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          student_id: string
          date: string
          type: string
          notes: string
          outcome: string
          follow_up_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          student_id: string
          date: string
          type?: string
          notes: string
          outcome?: string
          follow_up_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string
          date?: string
          type?: string
          notes?: string
          outcome?: string
          follow_up_date?: string | null
          created_at?: string
        }
      }
      price_quotes: {
        Row: {
          id: string
          user_id: string
          student_id: string
          course_level: string
          course_duration: string
          total_price: number
          payment_type: string
          installment_count: number | null
          installment_amount: number | null
          discount: number
          final_price: number
          notes: string
          is_accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          student_id: string
          course_level: string
          course_duration: string
          total_price?: number
          payment_type?: string
          installment_count?: number | null
          installment_amount?: number | null
          discount?: number
          final_price?: number
          notes?: string
          is_accepted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_id?: string
          course_level?: string
          course_duration?: string
          total_price?: number
          payment_type?: string
          installment_count?: number | null
          installment_amount?: number | null
          discount?: number
          final_price?: number
          notes?: string
          is_accepted?: boolean
          created_at?: string
        }
      }
      referral_payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          paid_at: string
          user_id: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          paid_at?: string
          user_id: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          paid_at?: string
          user_id?: string
          notes?: string
          created_at?: string
        }
      }
      bonus_payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          paid_at: string
          user_id: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          paid_at?: string
          user_id: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          paid_at?: string
          user_id?: string
          notes?: string
          created_at?: string
        }
      }
      sticky_notes: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          user_id: string
          name: string
          level: string
          created_at: string
          start_date: string | null
          end_date: string | null
          days: string[]
          time_range: string
          tags: string[]
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          level: string
          created_at?: string
          start_date?: string | null
          end_date?: string | null
          days?: string[]
          time_range?: string
          tags?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          level?: string
          created_at?: string
          start_date?: string | null
          end_date?: string | null
          days?: string[]
          time_range?: string
          tags?: string[]
        }
      }
      teachers: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
          user_id?: string | null
        }
      }
    }
  }
}