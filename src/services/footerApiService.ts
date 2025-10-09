// خدمة API لجلب إعدادات الفوتر في الموقع الرئيسي
const API_BASE_URL = 'http://localhost:3001/api/footer-settings';

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface FaqLink {
  title: string;
  href: string;
}

export interface SocialLink {
  name: 'Facebook' | 'LinkedIn' | 'WhatsApp' | 'Telegram';
  href: string;
  icon: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
}

export interface FooterSettings {
  _id?: string;
  contactInfo: ContactInfo;
  faqLinks: FaqLink[];
  socialLinks: SocialLink[];
  companyInfo: CompanyInfo;
  isActive?: boolean;
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class FooterApiService {
  
  // جلب إعدادات الفوتر النشطة للموقع الرئيسي
  async getFooterSettings(): Promise<FooterSettings | null> {
    try {
      console.log('🔍 جلب إعدادات الفوتر من API...');
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<FooterSettings> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ تم جلب إعدادات الفوتر بنجاح');
        return result.data;
      } else {
        console.error('❌ فشل في جلب إعدادات الفوتر:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال بـ API:', error);
      return null;
    }
  }

  // اختبار الاتصال بـ API
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 اختبار الاتصال بـ Footer API...');

      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ الاتصال بـ API يعمل بشكل صحيح');
        return true;
      } else {
        console.error('❌ فشل في الاتصال بـ API');
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
      return false;
    }
  }

  // جلب البيانات الافتراضية للفوتر (fallback)
  getDefaultFooterSettings(): FooterSettings {
    return {
      contactInfo: {
        email: 'contact@ma-training-consulting.com',
        phone: '+33 1 23 45 67 89',
        address: '123 Avenue des Champs-Élysées, 75008 Paris'
      },
      faqLinks: [
        { title: 'Comment s\'inscrire ?', href: '#' },
        { title: 'Conditions de partenariat', href: '#' },
        { title: 'Avantages du programme', href: '#' },
        { title: 'Nos partenaires', href: '#' }
      ],
      socialLinks: [
        { name: 'Facebook', href: '#', icon: 'FaFacebookF' },
        { name: 'LinkedIn', href: '#', icon: 'FaLinkedinIn' },
        { name: 'WhatsApp', href: '#', icon: 'FaWhatsapp' },
        { name: 'Telegram', href: '#', icon: 'FaTelegramPlane' }
      ],
      companyInfo: {
        name: 'MA-TRAINING-CONSULTING',
        description: 'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.'
      },
      isActive: true
    };
  }
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
export const footerApiService = new FooterApiService();

// تصدير الكلاس أيضاً للاستخدام المتقدم
export default FooterApiService;
