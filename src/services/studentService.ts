import { supabase } from '../lib/supabase';
import { Customer, Interview, PriceQuote, ReferralPayment, BonusPayment } from '../types/Customer';

// Transform database row to Customer type
const transformStudentRow = (row: any): Customer => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  surname: row.surname,
  phone: row.phone,
  email: row.email || '',
  contactType: row.contact_type,
  registrationType: row.registration_type,
  status: row.status,
  educationLevel: row.education_level,
  languages: row.languages || ['İngilizce'],
  interestedLevels: row.interested_levels || [],
  placementTestLevel: row.placement_test_level,
  placementTestTeacher: row.placement_test_teacher || '',
  notes: row.notes || '',
  followUpDate: row.follow_up_date,
  lastContact: row.last_contact,
  createdAt: row.created_at,
  referralCode: row.referral_code,
  referredByStudentId: row.referred_by_student_id,
  referralEarnings: row.referral_earnings || 0,
  referredStudentBonus: row.referred_student_bonus || 0,
  referralPayments: [],
  bonusPayments: [],
  totalReferralEarningsPaid: 0,
  totalReferredBonusPaid: 0,
  referrerInfo: row.referrer ? {
    id: row.referrer.id,
    name: row.referrer.name,
    surname: row.referrer.surname,
    referralCode: row.referrer.referral_code
  } : undefined,
  interviews: [],
  priceQuotes: [],
  classId: row.class_id
});

// Transform Customer type to database insert
const transformCustomerToInsert = (customer: Omit<Customer, 'id' | 'createdAt' | 'interviews' | 'priceQuotes'>) => ({
  user_id: customer.userId,
  name: customer.name,
  surname: customer.surname,
  phone: customer.phone,
  email: customer.email || '',
  contact_type: customer.contactType,
  registration_type: customer.registrationType,
  status: customer.status,
  education_level: customer.educationLevel,
  languages: customer.languages,
  interested_levels: customer.interestedLevels,
  placement_test_level: customer.placementTestLevel || null,
  placement_test_teacher: customer.placementTestTeacher || '',
  notes: customer.notes || '',
  follow_up_date: customer.followUpDate || null,
  last_contact: customer.lastContact || null,
  referral_code: customer.referralCode || null,
  referred_by_student_id: customer.referredByStudentId || null,
  referral_earnings: customer.referralEarnings || 0,
  class_id: customer.classId || null
});

// Benzersiz referans kodu oluştur
const generateReferralCode = (studentId: string, name: string, surname: string): string => {
  const initials = (name.charAt(0) + surname.charAt(0)).toUpperCase();
  const shortId = studentId.substring(0, 6).toUpperCase();
  return `${initials}${shortId}`;
};

// Referans kodu ile öğrenci bul
const findStudentByReferralCode = async (referralCode: string) => {
  console.log('DEBUG: findStudentByReferralCode - Searching for referralCode:', referralCode);
  const { data, error } = await supabase
    .from('students')
    .select('id, name, surname, referral_code')
    .eq('referral_code', referralCode)
    .single();

  if (error) {
    console.error('DEBUG: findStudentByReferralCode - Error:', error.message);
    return null;
  }
  if (data) {
    console.log('DEBUG: findStudentByReferralCode - Found data:', data);
  } else {
    console.log('DEBUG: findStudentByReferralCode - No data found for code:', referralCode);
  }
  return data;
};

export const studentService = {
  // Get all students with their interviews and price quotes
  async getAllStudents(): Promise<Customer[]> {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    // Get referral payments for all students
    const { data: referralPayments, error: referralPaymentsError } = await supabase
      .from('referral_payments')
      .select('*')
      .order('paid_at', { ascending: false });

    if (referralPaymentsError) {
      console.error('Error fetching referral payments:', referralPaymentsError);
      throw referralPaymentsError;
    }

    // Get bonus payments for all students
    const { data: bonusPayments, error: bonusPaymentsError } = await supabase
      .from('bonus_payments')
      .select('*')
      .order('paid_at', { ascending: false });

    if (bonusPaymentsError) {
      console.error('Error fetching bonus payments:', bonusPaymentsError);
      throw bonusPaymentsError;
    }

    // Get interviews for all students
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('*')
      .order('date', { ascending: false });

    if (interviewsError) {
      console.error('Error fetching interviews:', interviewsError);
      throw interviewsError;
    }

    // Get price quotes for all students
    const { data: priceQuotes, error: quotesError } = await supabase
      .from('price_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (quotesError) {
      console.error('Error fetching price quotes:', quotesError);
      throw quotesError;
    }

    // Transform and combine data
    return students.map(student => {
      const studentReferralPayments = referralPayments
        ?.filter(payment => payment.student_id === student.id)
        .map(payment => ({
          id: payment.id,
          studentId: payment.student_id,
          amount: payment.amount,
          paidAt: payment.paid_at,
          userId: payment.user_id,
          notes: payment.notes || '',
          createdAt: payment.created_at
        })) || [];

      const studentBonusPayments = bonusPayments
        ?.filter(payment => payment.student_id === student.id)
        .map(payment => ({
          id: payment.id,
          studentId: payment.student_id,
          amount: payment.amount,
          paidAt: payment.paid_at,
          userId: payment.user_id,
          notes: payment.notes || '',
          createdAt: payment.created_at
        })) || [];

      const studentInterviews = interviews
        ?.filter(interview => interview.student_id === student.id)
        .map(interview => ({
          id: interview.id,
          date: interview.date,
          type: interview.type as any,
          notes: interview.notes,
          outcome: interview.outcome,
          followUpDate: interview.follow_up_date
        })) || [];

      const studentQuotes = priceQuotes
        ?.filter(quote => quote.student_id === student.id)
        .map(quote => ({
          id: quote.id,
          courseLevel: quote.course_level,
          courseDuration: quote.course_duration,
          totalPrice: quote.total_price,
          cashPrice: quote.cash_price,
          installmentPrice: quote.installment_price,
          paymentType: quote.payment_type as any,
          installmentCount: quote.installment_count,
          installmentAmount: quote.installment_amount,
          discount: quote.discount,
          finalPrice: quote.final_price,
          notes: quote.notes,
          isAccepted: quote.is_accepted,
          createdAt: quote.created_at
        })) || [];

      // Calculate total payments
      const totalReferralEarningsPaid = studentReferralPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalReferredBonusPaid = studentBonusPayments.reduce((sum, payment) => sum + payment.amount, 0);

      return {
        ...transformStudentRow(student),
        referralPayments: studentReferralPayments,
        bonusPayments: studentBonusPayments,
        totalReferralEarningsPaid,
        totalReferredBonusPaid,
        interviews: studentInterviews,
        priceQuotes: studentQuotes
      };
    });
  },

  // Add new student
  async addStudent(studentData: Omit<Customer, 'id' | 'createdAt' | 'interviews' | 'priceQuotes'>, referredByReferralCode?: string): Promise<Customer> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let referredByStudentId = null;
    console.log('DEBUG: addStudent - received referredByReferralCode from form:', referredByReferralCode);

    if (referredByReferralCode && referredByReferralCode.trim() !== '') {
      // Hata ayıklama amaçlı kısa bir gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms gecikme
      
      const referrer = await findStudentByReferralCode(referredByReferralCode.trim().toUpperCase());
      if (referrer) {
        referredByStudentId = referrer.id;
        console.log('DEBUG: addStudent - Referrer found, setting referredByStudentId to:', referredByStudentId);
      } else {
        console.log('DEBUG: addStudent - Referrer NOT found for code:', referredByReferralCode);
        // Debug için tüm mevcut referans kodlarını listele
        const { data: allReferralCodes } = await supabase.from('students').select('name, surname, referral_code').not('referral_code', 'is', null);
        console.log('DEBUG: addStudent - All existing referral codes in DB:', allReferralCodes);
      }
    } else {
      console.log('DEBUG: addStudent - referredByReferralCode is empty or undefined, skipping referrer lookup.');
    }

    console.log('DEBUG: addStudent - referredByStudentId before DB insert:', referredByStudentId);

    const insertData = transformCustomerToInsert(studentData);
    insertData.user_id = user.id;
    insertData.referred_by_student_id = referredByStudentId;
    
    const { data, error } = await supabase
      .from('students')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('DEBUG: addStudent - Error during student insert:', error.message);
      throw error;
    }

    console.log('DEBUG: addStudent - Student inserted successfully. Full data:', data);
    console.log('DEBUG: addStudent - data.status after insert:', data.status);
    console.log('DEBUG: addStudent - data.referred_by_student_id after insert:', data.referred_by_student_id);

    // Eğer öğrenci 'kayitli' ise ve referans kodu yoksa, bir tane oluştur
    if (data.status === 'kayitli') {
      if (!data.referral_code) {
        console.log('DEBUG: addStudent - Student is kayitli and has no referral code, generating one.');
        const referralCode = generateReferralCode(data.id, data.name, data.surname);
        
        const { error: updateError } = await supabase
          .from('students')
          .update({ referral_code: referralCode })
          .eq('id', data.id);
        
        if (updateError) {
          console.error('DEBUG: addStudent - Error updating referral code after insert:', updateError.message);
        }
        
        data.referral_code = referralCode;
        console.log('DEBUG: addStudent - Referral code created and updated:', referralCode);
      } else {
        console.log('DEBUG: addStudent - Student is kayitli and already has a referral code:', data.referral_code);
      }

      // Bu yeni eklenen öğrenci referans ile geldiyse ve 'kayitli' ise kazancı artır
      console.log('DEBUG: addStudent - Checking earnings condition (is kayitli and has referrer):', data.status === 'kayitli' && !!referredByStudentId);
      if (!!referredByStudentId) {
        console.log('DEBUG: addStudent - Student is kayitli and has referrer, attempting to increment earnings for:', referredByStudentId);
        
        // Referans veren öğrencinin kazancını artır
        const { error: earningsError } = await supabase
          .rpc('increment_referral_earnings', { 
            student_id: referredByStudentId, 
            amount: 1000 
          });
        
        if (earningsError) {
          console.error('DEBUG: addStudent - Error incrementing referral earnings via RPC:', earningsError.message);
          // Fallback: direct update
          const { data: referrerData } = await supabase
            .from('students')
            .select('referral_earnings')
            .eq('id', referredByStudentId)
            .single();
          
          if (referrerData) {
            const newEarnings = (referrerData.referral_earnings || 0) + 1000;
            await supabase
              .from('students')
              .update({ referral_earnings: newEarnings })
              .eq('id', referredByStudentId);
            console.log('DEBUG: addStudent - Fallback: Referral earnings updated for student:', referredByStudentId, 'to', newEarnings);
          }
        } else {
          console.log('DEBUG: addStudent - RPC increment_referral_earnings succeeded for:', referredByStudentId);
        }
        
        // Referans alan öğrencinin (yeni eklenen öğrenci) bonusunu güncelle
        console.log('DEBUG: addStudent - Setting referred student bonus for new student:', data.id);
        const { error: bonusError } = await supabase
          .from('students')
          .update({ referred_student_bonus: 1000 })
          .eq('id', data.id);
        
        if (bonusError) {
          console.error('DEBUG: addStudent - Error updating referred student bonus:', bonusError.message);
        } else {
          console.log('DEBUG: addStudent - Referred student bonus set to 1000 for:', data.id);
          data.referred_student_bonus = 1000;
        }
      }
    } else {
      console.log('DEBUG: addStudent - Student status is not kayitli, status:', data.status);
    }

    return {
      ...transformStudentRow(data),
      interviews: [],
      priceQuotes: []
    };
  },

  // Update student
  async updateStudent(id: string, studentData: Partial<Customer>): Promise<Customer> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Mevcut öğrenci verilerini çek (eski durumu ve referans ID'sini kontrol etmek için)
    const { data: oldStudentData, error: fetchError } = await supabase
      .from('students')
      .select('status, referred_by_student_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('DEBUG: updateStudent - Error fetching old student data:', fetchError.message);
      throw fetchError;
    }

    const oldStatus = oldStudentData.status;
    const oldReferredByStudentId = oldStudentData.referred_by_student_id;
    console.log('DEBUG: updateStudent - oldStatus:', oldStatus, 'oldReferredByStudentId:', oldReferredByStudentId);

    // Sadece studentData içinde gelen alanları içeren bir obje oluştur
    const updatePayload: { [key: string]: any } = {};
    if (studentData.name !== undefined) updatePayload.name = studentData.name;
    if (studentData.surname !== undefined) updatePayload.surname = studentData.surname;
    if (studentData.phone !== undefined) updatePayload.phone = studentData.phone;
    if (studentData.email !== undefined) updatePayload.email = studentData.email;
    if (studentData.contactType !== undefined) updatePayload.contact_type = studentData.contactType;
    if (studentData.registrationType !== undefined) updatePayload.registration_type = studentData.registrationType;
    if (studentData.status !== undefined) updatePayload.status = studentData.status;
    if (studentData.educationLevel !== undefined) updatePayload.education_level = studentData.educationLevel;
    if (studentData.languages !== undefined) updatePayload.languages = studentData.languages;
    if (studentData.interestedLevels !== undefined) updatePayload.interested_levels = studentData.interestedLevels;
    if (studentData.placementTestLevel !== undefined) updatePayload.placement_test_level = studentData.placementTestLevel;
    if (studentData.placementTestTeacher !== undefined) updatePayload.placement_test_teacher = studentData.placementTestTeacher;
    if (studentData.notes !== undefined) updatePayload.notes = studentData.notes;
    if (studentData.followUpDate !== undefined) updatePayload.follow_up_date = studentData.followUpDate || null;
    if (studentData.lastContact !== undefined) updatePayload.last_contact = studentData.lastContact || null;
    if (studentData.referralCode !== undefined) updatePayload.referral_code = studentData.referralCode;
    if (studentData.referredByStudentId !== undefined) updatePayload.referred_by_student_id = studentData.referredByStudentId;
    if (studentData.referralEarnings !== undefined) updatePayload.referral_earnings = studentData.referralEarnings;
    if (studentData.referredStudentBonus !== undefined) updatePayload.referred_student_bonus = studentData.referredStudentBonus;
    if (studentData.referralEarningsPaidAt !== undefined) updatePayload.referral_earnings_paid_at = studentData.referralEarningsPaidAt || null;
    if (studentData.referredStudentBonusPaidAt !== undefined) updatePayload.referred_student_bonus_paid_at = studentData.referredStudentBonusPaidAt || null;
    if (studentData.classId !== undefined) updatePayload.class_id = studentData.classId;

    // user_id'yi de güncelleme payload'ına ekle
    updatePayload.user_id = user.id;
    
    const { data, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    console.log('DEBUG: updateStudent - data after update:', data);
    console.log('DEBUG: updateStudent - data.referred_by_student_id after update:', data?.referred_by_student_id);
    console.log('DEBUG: updateStudent - data.status after update:', data?.status);
    if (error) {
      console.error('DEBUG: updateStudent - Error during student update:', error.message);
      throw error;
    }

    // Referans kodu oluşturma (eğer kayıtlı duruma geçtiyse ve kodu yoksa)
    if (data.status === 'kayitli' && !data.referral_code) {
      console.log('DEBUG: updateStudent - Student became kayitli, creating referral code');
      const referralCode = generateReferralCode(data.id, data.name, data.surname);
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ referral_code: referralCode })
        .eq('id', id);
      
      if (updateError) {
        console.error('DEBUG: updateStudent - Error updating referral code:', updateError.message);
      }
      
      data.referral_code = referralCode;
      console.log('DEBUG: updateStudent - referral code created:', referralCode);
    }
    
    // Kazanç artırma mantığı: Sadece durum "kayıtlı"ya GEÇİŞ YAPTIYSA ve referans veren varsa
    const newStatus = studentData.status; // Güncellenmek istenen durum
    const isNowKayitli = newStatus === 'kayitli';
    const wasNotKayitliBefore = oldStatus !== 'kayitli';
    const hasReferrer = oldReferredByStudentId !== null;

    console.log('DEBUG: updateStudent - Earnings conditions check:');
    console.log(`  isNowKayitli: ${isNowKayitli}`);
    console.log(`  wasNotKayitliBefore: ${wasNotKayitliBefore}`);
    console.log(`  hasReferrer: ${hasReferrer}`);

    if (isNowKayitli && wasNotKayitliBefore && hasReferrer) {
      console.log('DEBUG: updateStudent - Conditions met for incrementing earnings for:', oldReferredByStudentId);
      
      // Referans veren öğrencinin kazancını artır
      const { error: earningsError } = await supabase
        .rpc('increment_referral_earnings', { 
          student_id: oldReferredByStudentId,
          amount: 1000 
        });
      
      if (earningsError) {
        console.error('DEBUG: updateStudent - Error incrementing referral earnings via RPC:', earningsError.message);
        // Fallback: doğrudan güncelleme
        const { data: referrerData } = await supabase
          .from('students')
          .select('referral_earnings')
          .eq('id', oldReferredByStudentId)
          .single();
        
        if (referrerData) {
          const newEarnings = (referrerData.referral_earnings || 0) + 1000;
          await supabase
            .from('students')
            .update({ referral_earnings: newEarnings })
            .eq('id', oldReferredByStudentId);
          console.log('DEBUG: updateStudent - Fallback: Referral earnings updated for student:', oldReferredByStudentId, 'to', newEarnings);
        }
      } else {
        console.log('DEBUG: updateStudent - RPC increment_referral_earnings succeeded for:', oldReferredByStudentId);
      }
      
      // Referans alan öğrencinin (güncellenen öğrenci) bonusunu güncelle
      console.log('DEBUG: updateStudent - Setting referred student bonus for updated student:', id);
      const { error: bonusError } = await supabase
        .from('students')
        .update({ referred_student_bonus: 1000 })
        .eq('id', id);
      
      if (bonusError) {
        console.error('DEBUG: updateStudent - Error updating referred student bonus:', bonusError.message);
      } else {
        console.log('DEBUG: updateStudent - Referred student bonus set to 1000 for:', id);
      }
    } else {
      console.log('DEBUG: updateStudent - Earnings not incremented - conditions not met.');
    }

    // Güncellenmiş öğrenciyi döndür
    const students = await this.getAllStudents();
    const updatedStudent = students.find(s => s.id === id);
    
    if (!updatedStudent) {
      throw new Error('Student not found after update');
    }

    return updatedStudent;
  },

  // Delete student
  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Add interview
  async addInterview(studentId: string, interviewData: Omit<Interview, 'id'>): Promise<Interview> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        student_id: studentId,
        date: interviewData.date,
        type: interviewData.type,
        notes: interviewData.notes,
        outcome: interviewData.outcome || '',
        follow_up_date: interviewData.followUpDate || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding interview:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      type: data.type as any,
      notes: data.notes,
      outcome: data.outcome,
      followUpDate: data.follow_up_date
    };
  },

  // Add price quote
  async addPriceQuote(studentId: string, quoteData: Omit<PriceQuote, 'id'>): Promise<PriceQuote> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('price_quotes')
      .insert({
        user_id: user.id,
        student_id: studentId,
        course_level: quoteData.courseLevel,
        course_duration: quoteData.courseDuration,
        total_price: quoteData.totalPrice,
        payment_type: quoteData.paymentType,
        installment_count: quoteData.installmentCount || null,
        installment_amount: quoteData.installmentAmount || null,
        discount: quoteData.discount || 0,
        final_price: quoteData.finalPrice,
        notes: quoteData.notes || '',
        is_accepted: quoteData.isAccepted || false,
        cash_price: quoteData.cashPrice || null,
        installment_price: quoteData.installmentPrice || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding price quote:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      courseLevel: data.course_level,
      courseDuration: data.course_duration,
      totalPrice: data.total_price,
      cashPrice: data.cash_price,
      installmentPrice: data.installment_price,
      paymentType: data.payment_type as any,
      installmentCount: data.installment_count,
      installmentAmount: data.installment_amount,
      discount: data.discount,
      finalPrice: data.final_price,
      notes: data.notes,
      isAccepted: data.is_accepted,
      createdAt: data.created_at
    };
  },

  // Get interviews within date range for reporting
  async getInterviewsByDateRange(startDate: string, endDate: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching interviews by date range:', error);
      throw error;
    }

    return data.map(interview => ({
      id: interview.id,
      userId: interview.user_id,
      date: interview.date,
      type: interview.type as any,
      notes: interview.notes,
      outcome: interview.outcome,
      followUpDate: interview.follow_up_date
    }));
  },

  // Get referred students within date range for reporting
  async getReferredStudentsByDateRange(startDate: string, endDate: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        referrer:referred_by_student_id(id, name, surname, referral_code)
      `)
      .not('referred_by_student_id', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referred students by date range:', error);
      throw error;
    }

    return data.map(student => ({
      ...transformStudentRow(student),
      interviews: [],
      priceQuotes: []
    }));
  },

  // Referans ile gelen öğrencileri getir
  async getReferredStudents(studentId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('referred_by_student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referred students:', error);
      throw error;
    }

    return data.map(student => ({
      ...transformStudentRow(student),
      interviews: [],
      priceQuotes: []
    }));
  },

  // Add referral payment
  async addReferralPayment(studentId: string, amount: number, notes?: string): Promise<ReferralPayment> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('referral_payments')
      .insert({
        student_id: studentId,
        amount: amount,
        user_id: user.id,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding referral payment:', error);
      throw error;
    }

    return {
      id: data.id,
      studentId: data.student_id,
      amount: data.amount,
      paidAt: data.paid_at,
      userId: data.user_id,
      notes: data.notes || '',
      createdAt: data.created_at
    };
  },

  // Add bonus payment
  async addBonusPayment(studentId: string, amount: number, notes?: string): Promise<BonusPayment> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('bonus_payments')
      .insert({
        student_id: studentId,
        amount: amount,
        user_id: user.id,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding bonus payment:', error);
      throw error;
    }

    return {
      id: data.id,
      studentId: data.student_id,
      amount: data.amount,
      paidAt: data.paid_at,
      userId: data.user_id,
      notes: data.notes || '',
      createdAt: data.created_at
    };
  },

  // Get financial report data for a date range
  async getFinancialReportData(startDate: string, endDate: string): Promise<{
    totalPotentialReferralEarnings: number;
    totalPotentialBonusPayments: number;
    totalReferralPaymentsMade: number;
    totalBonusPaymentsMade: number;
    unpaidReferralEarnings: number;
    unpaidBonusPayments: number;
  }> {
    // Get students who became 'kayitli' in the date range and have referrers
    const { data: referredStudents, error: referredError } = await supabase
      .from('students')
      .select('id, referred_by_student_id, status, created_at')
      .not('referred_by_student_id', 'is', null)
      .eq('status', 'kayitli')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (referredError) {
      console.error('Error fetching referred students for financial report:', referredError);
      throw referredError;
    }

    // Calculate potential earnings (1000 TL per referred student)
    const totalPotentialReferralEarnings = (referredStudents?.length || 0) * 1000;
    const totalPotentialBonusPayments = (referredStudents?.length || 0) * 1000;

    // Get actual payments made in the date range
    const { data: referralPayments, error: referralPaymentsError } = await supabase
      .from('referral_payments')
      .select('amount')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    if (referralPaymentsError) {
      console.error('Error fetching referral payments for financial report:', referralPaymentsError);
      throw referralPaymentsError;
    }

    const { data: bonusPayments, error: bonusPaymentsError } = await supabase
      .from('bonus_payments')
      .select('amount')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    if (bonusPaymentsError) {
      console.error('Error fetching bonus payments for financial report:', bonusPaymentsError);
      throw bonusPaymentsError;
    }

    const totalReferralPaymentsMade = referralPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const totalBonusPaymentsMade = bonusPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

    // Calculate unpaid amounts
    const unpaidReferralEarnings = Math.max(0, totalPotentialReferralEarnings - totalReferralPaymentsMade);
    const unpaidBonusPayments = Math.max(0, totalPotentialBonusPayments - totalBonusPaymentsMade);

    return {
      totalPotentialReferralEarnings,
      totalPotentialBonusPayments,
      totalReferralPaymentsMade,
      totalBonusPaymentsMade,
      unpaidReferralEarnings,
      unpaidBonusPayments
    };
  },

  // Referans kodu ile öğrenci bul (public method)
  async findStudentByReferralCode(referralCode: string) {
    return findStudentByReferralCode(referralCode);
  }
};