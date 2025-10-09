// Service for managing global contact email
export class GlobalEmailService {
  private static readonly API_BASE = 'http://localhost:3001/api/partnerships';
  private static cachedEmail: string = 'ahmedmaalou78l@gmail.com';

  // Get global contact email from backend
  static async getGlobalEmail(): Promise<string> {
    try {
      // Always fetch from backend to get latest email
      console.log('🔄 Fetching latest global email from Backend...');
      const response = await fetch(`${this.API_BASE}/global-email`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.email) {
          this.cachedEmail = data.data.email;
          console.log('✅ Global email loaded from Backend:', this.cachedEmail);
          return this.cachedEmail;
        }
      }
      
      // Fallback to default email
      console.log('⚠️ Backend not available, using default email');
      return 'ahmedmaalou78l@gmail.com';
      
    } catch (error) {
      console.error('❌ Error fetching global email:', error);
      // Fallback to default email
      return 'ahmedmaalou78l@gmail.com';
    }
  }

  // Clear cache (useful when email is updated)
  static clearCache(): void {
    this.cachedEmail = 'ahmedmaalou78l@gmail.com';
  }

  // Get email synchronously (returns cached or default)
  static getCachedEmail(): string {
    return this.cachedEmail;
  }
}

export default GlobalEmailService;
