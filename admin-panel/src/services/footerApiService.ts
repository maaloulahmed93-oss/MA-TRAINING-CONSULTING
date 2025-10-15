import { API_BASE_URL } from '../config/api';
// خدمة API لإدارة إعدادات الفوتر
const API_BASE_URL_FOOTER = `${API_BASE_URL}/footer-settings`;

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
  
  // جلب إعدادات الفوتر النشطة
  async getFooterSettings(): Promise<FooterSettings | null> {
    try {
      console.log('🔍 جلب إعدادات الفوتر من API...');
      
      const response = await fetch(API_BASE_URL_FOOTER, {
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

  // تحديث إعدادات الفوتر
  async updateFooterSettings(settings: Omit<FooterSettings, '_id' | 'createdAt' | 'updatedAt'>): Promise<FooterSettings | null> {
    try {
      console.log('🔄 تحديث إعدادات الفوتر...');
      console.log('📝 البيانات المرسلة:', settings);

      const response = await fetch(API_BASE_URL_FOOTER, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          updatedBy: 'admin-panel'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<FooterSettings> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ تم تحديث إعدادات الفوتر بنجاح');
        return result.data;
      } else {
        console.error('❌ فشل في تحديث إعدادات الفوتر:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث إعدادات الفوتر:', error);
      return null;
    }
  }

  // إعادة تعيين الإعدادات للقيم الافتراضية
  async resetFooterSettings(): Promise<FooterSettings | null> {
    try {
      console.log('🔄 إعادة تعيين إعدادات الفوتر للقيم الافتراضية...');

      const response = await fetch(`${API_BASE_URL_FOOTER}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<FooterSettings> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ تم إعادة تعيين إعدادات الفوتر بنجاح');
        return result.data;
      } else {
        console.error('❌ فشل في إعادة تعيين إعدادات الفوتر:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في إعادة تعيين إعدادات الفوتر:', error);
      return null;
    }
  }

  // جلب تاريخ التحديثات
  async getFooterHistory(): Promise<any[] | null> {
    try {
      console.log('📜 جلب تاريخ تحديثات الفوتر...');

      const response = await fetch(`${API_BASE_URL_FOOTER}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any[]> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ تم جلب تاريخ التحديثات بنجاح');
        return result.data;
      } else {
        console.error('❌ فشل في جلب تاريخ التحديثات:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في جلب تاريخ التحديثات:', error);
      return null;
    }
  }

  // اختبار الاتصال بـ API
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 اختبار الاتصال بـ Footer API...');

      const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`, {
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
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
export const footerApiService = new FooterApiService();

// تصدير الكلاس أيضاً للاستخدام المتقدم
export default FooterApiService;
