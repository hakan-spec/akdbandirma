import React from 'react';
import { Phone, Mail, Calendar, User, MessageSquare } from 'lucide-react';
import { Customer, CustomerStatus, EducationLevel, ContactType, RegistrationType } from '../types/Customer';

interface CustomerListProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

const statusConfig = {
  yeni: { label: 'Yeni', color: 'bg-yellow-100 text-yellow-800', icon: '🆕' },
  ilgili: { label: 'İlgili', color: 'bg-blue-100 text-blue-800', icon: '👀' },
  kayitli: { label: 'Kayıtlı', color: 'bg-green-100 text-green-800', icon: '✅' },
  iptal: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: '❌' }
};

const educationConfig = {
  ilkogretim: 'İlköğretim',
  lise: 'Lise',
  universite: 'Üniversite',
  yetiskin: 'Yetişkin'
};

const contactTypeConfig = {
  telefon: { label: 'Telefon', icon: Phone },
  'yuz-yuze': { label: 'Yüz Yüze', icon: User }
};

const registrationTypeConfig = {
  'yeni-kayit': { label: 'Yeni Kayıt', color: 'bg-green-100 text-green-800' },
  'kayit-yenileme': { label: 'Kayıt Yenileme', color: 'bg-purple-100 text-purple-800' }
};

const CustomerList: React.FC<CustomerListProps> = ({ customers, onCustomerSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz öğrenci yok</h3>
        <p className="text-gray-500">İlk öğrencinizi eklemek için "Yeni Öğrenci" butonuna tıklayın.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Öğrenci Bilgileri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İletişim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Eğitim Seviyesi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Türü
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Görüşme
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => {
              const statusInfo = statusConfig[customer.status];
              const ContactIcon = contactTypeConfig[customer.contactType].icon;
              const lastInterview = customer.interviews[customer.interviews.length - 1];

              return (
                <tr
                  key={customer.id}
                  onClick={() => onCustomerSelect(customer)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                            {customer.surname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name} {customer.surname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.languages.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <ContactIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <span className="mr-1">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {educationConfig[customer.educationLevel]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${registrationTypeConfig[customer.registrationType].color}`}>
                      {registrationTypeConfig[customer.registrationType].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      {lastInterview ? (
                        <>
                          <div className="flex items-center space-x-1 text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(lastInterview.date)}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {contactTypeConfig[lastInterview.type].label}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Henüz görüşme yok</span>
                      )}
                      {customer.interviews.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <MessageSquare className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {customer.interviews.length} görüşme
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;