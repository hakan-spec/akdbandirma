import html2pdf from 'html2pdf.js';
import { Customer } from '../types/Customer';

const levelConfig = {
  // İlkokul seviyeleri
  'starter2': 'Starter 2',
  'starter3': 'Starter 3', 
  'starter4': 'Starter 4',
  'level5': 'Level 5',
  'level6': 'Level 6',
  'level7': 'Level 7',
  'level8': 'Level 8',
  // Lise, üniversite ve yetişkin seviyeleri
  'A1.1': 'A1.1',
  'A1.2': 'A1.2',
  'A2.1': 'A2.1',
  'A2.2': 'A2.2',
  'B1.1': 'B1.1',
  'B1.2': 'B1.2',
  'B2.1': 'B2.1',
  'B2.2': 'B2.2',
  'C1.1': 'C1.1',
  'C1.2': 'C1.2'
};

const educationConfig = {
  ilkogretim: 'İlköğretim',
  lise: 'Lise',
  universite: 'Üniversite',
  yetiskin: 'Yetişkin'
};

const contactTypeConfig = {
  telefon: 'Telefon',
  'yuz-yuze': 'Yüz Yüze'
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export const generateStudentReportPdf = async (customer: Customer) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Öğrenci Raporu - ${customer.name} ${customer.surname}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 15px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        
        .logo {
          font-size: 22px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 6px;
        }
        
        .contact-info {
          font-size: 10px;
          color: #666;
          line-height: 1.3;
        }
        
        .section {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 4px;
          margin-bottom: 10px;
        }
        
        .student-info {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 10px;
          color: #666;
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .info-value {
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 10px;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          background: #f0f9ff;
          border-radius: 6px;
          border-left: 3px solid #0ea5e9;
        }
        
        .feature-icon {
          color: #0ea5e9;
          margin-right: 6px;
          font-weight: bold;
        }
        
        .feature-text {
          font-size: 11px;
          color: #0c4a6e;
          font-weight: 500;
        }
        
        .quote-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }
        
        .quote-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .quote-type {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .quote-date {
          font-size: 10px;
          color: #666;
        }
        
        .quote-notes {
          font-size: 11px;
          color: #374151;
          line-height: 1.5;
          margin-bottom: 6px;
        }
        
        .price-highlight {
          background: #fef3c7;
          color: #92400e;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin: 6px 0;
        }
        
        .payment-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }
        
        .payment-item {
          font-size: 10px;
          color: #666;
        }
        
        .payment-value {
          font-weight: 600;
          color: #333;
        }
        
        .no-data {
          text-align: center;
          color: #9ca3af;
          font-style: italic;
          padding: 15px;
          font-size: 12px;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }
        
        .tag {
          background: #e0e7ff;
          color: #3730a3;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 500;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }
        
        @media print {
          .container {
            max-width: none;
            margin: 0;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Amerikan Kültür Yabancı Dil Kursu</div>
          <div class="contact-info">
            <div>Haydar Çavuş Mah. İnönü Cd. No:5, Bandırma/Balıkesir</div>
            <div>Tel: 0 266 713 06 57 | WhatsApp: 0507 626 28 82</div>
            <div>E-posta: bandirma@amerikankultur.com | Web: www.amerikankultur.com</div>
          </div>
        </div>

        <!-- Öğrenci Bilgileri -->
        <div class="section">
          <h2 class="section-title">Öğrenci Bilgileri</h2>
          <div class="student-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Adı Soyadı</span>
                <span class="info-value">${customer.name} ${customer.surname}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Telefon</span>
                <span class="info-value">${customer.phone}</span>
              </div>
              <div class="info-item">
                <span class="info-label">E-posta</span>
                <span class="info-value">${customer.email || 'Belirtilmemiş'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Eğitim Seviyesi</span>
                <span class="info-value">${educationConfig[customer.educationLevel]}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Kayıt Tarihi</span>
                <span class="info-value">${formatShortDate(customer.createdAt)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Durum</span>
                <span class="info-value">${customer.status === 'yeni' ? 'Yeni' : customer.status === 'ilgili' ? 'İlgili' : customer.status === 'kayitli' ? 'Kayıtlı' : 'İptal'}</span>
              </div>
            </div>
            
            <div class="info-item">
              <span class="info-label">İlgilenilen Diller</span>
              <div class="tags">
                ${customer.languages.map(lang => `<span class="tag">${lang}</span>`).join('')}
              </div>
            </div>
            
            ${customer.interestedLevels.length > 0 ? `
            <div class="info-item" style="margin-top: 15px;">
              <span class="info-label">İlgilenilen Seviyeler</span>
              <div class="tags">
                ${customer.interestedLevels.map(level => `<span class="tag">${levelConfig[level] || level}</span>`).join('')}
              </div>
            </div>
            ` : ''}
            
            ${customer.placementTestLevel ? `
            <div class="info-item" style="margin-top: 15px;">
              <span class="info-label">Seviye Tespit Sınavı Sonucu</span>
              <span class="info-value">${levelConfig[customer.placementTestLevel]} ${customer.placementTestTeacher ? `(Sınavı yapan: ${customer.placementTestTeacher})` : ''}</span>
            </div>
            ` : ''}
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
        <!-- Fiyat Teklifleri -->
        <div class="section">
          <h2 class="section-title">Fiyat Teklifleri (${customer.priceQuotes?.length || 0} Teklif)</h2>
          ${!customer.priceQuotes || customer.priceQuotes.length === 0 ? `
            <div class="no-data">Henüz fiyat teklifi bulunmamaktadır.</div>
          ` : customer.priceQuotes.map(quote => `
            <div class="quote-item">
              <div class="quote-header">
                <div>
                  <div style="font-weight: bold; font-size: 16px;">${quote.courseLevel}</div>
                  <div style="font-size: 14px; color: #666;">${quote.courseDuration}</div>
                </div>
                <span class="quote-date">${formatShortDate(quote.createdAt)}</span>
              </div>
              
              <div class="price-highlight">
                Son Fiyat: ${quote.finalPrice.toLocaleString('tr-TR')} ₺
              </div>
              
              <div class="payment-details">
                <div class="payment-item">
                  <span>Ödeme Türü:</span>
                  <span class="payment-value">${quote.paymentType === 'pesin' ? 'Peşin' : 'Taksit'}</span>
                </div>
                ${quote.cashPrice ? `
                <div class="payment-item">
                  <span>Peşin Fiyat:</span>
                  <span class="payment-value">${quote.cashPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                ` : ''}
                ${quote.installmentPrice ? `
                <div class="payment-item">
                  <span>Taksitli Fiyat:</span>
                  <span class="payment-value">${quote.installmentPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                ` : ''}
                ${quote.paymentType === 'taksit' && quote.installmentCount ? `
                <div class="payment-item">
                  <span>Taksit Sayısı:</span>
                  <span class="payment-value">${quote.installmentCount} Ay</span>
                </div>
                ` : ''}
                ${quote.paymentType === 'taksit' && quote.installmentAmount ? `
                <div class="payment-item">
                  <span>Aylık Taksit:</span>
                  <span class="payment-value">${quote.installmentAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                ` : ''}
                ${quote.discount && quote.discount > 0 ? `
                <div class="payment-item">
                  <span>İndirim:</span>
                  <span class="payment-value" style="color: #dc2626;">-${quote.discount.toLocaleString('tr-TR')} ₺</span>
                </div>
                ` : ''}
              </div>
              
              ${quote.notes ? `
                <div class="quote-notes" style="margin-top: 10px;">
                  <strong>Teklif Notları:</strong> ${quote.notes}
                </div>
              ` : ''}
              
              ${quote.isAccepted ? `
                <div style="margin-top: 10px; color: #059669; font-weight: bold; font-size: 13px;">
                  ✓ Bu teklif kabul edilmiştir
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>Bu rapor ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} tarihinde oluşturulmuştur.</div>
          <div style="margin-top: 5px;">Amerikan Kültür Yabancı Dil Kursu - Öğrenci Takip Sistemi</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const options = {
    margin: 0.5,
    filename: `${customer.name}_${customer.surname}_Rapor_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  try {
    await html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw new Error('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};