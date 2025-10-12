// Safe initialization utilities to prevent variable access errors

/**
 * Safely check if we're in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Safely access localStorage with fallback
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (!isBrowser()) return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (!isBrowser()) return false;
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (!isBrowser()) return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      return false;
    }
  }
};

/**
 * Safe delay function for initialization
 */
export const safeDelay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => {
    if (isBrowser() && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    } else {
      setTimeout(resolve, ms);
    }
  });
};

/**
 * Safe initialization wrapper
 */
export const safeInit = async <T>(
  initFn: () => T | Promise<T>,
  fallback: T,
  retries: number = 3
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      await safeDelay(i * 50); // Progressive delay
      const result = await initFn();
      return result;
    } catch (error) {
      console.warn(`Initialization attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('All initialization attempts failed, using fallback');
        return fallback;
      }
    }
  }
  return fallback;
};
