// Toast service for displaying notifications

interface ToastOptions {
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
}

// Simple implementation - in a real app this would use a toast library
const toastService = {
  showSuccess: (message: string, options: ToastOptions = {}): string => {
    console.log('SUCCESS:', message);
    // In a real app, this would display a success toast
    return message;
  },
  
  showError: (message: string, options: ToastOptions = {}): string => {
    console.error('ERROR:', message);
    // In a real app, this would display an error toast with retry option if specified
    if (options.showRetry && options.onRetry) {
      console.log('Retry option available');
    }
    return message;
  },
  
  showInfo: (message: string, options: ToastOptions = {}): string => {
    console.info('INFO:', message);
    // In a real app, this would display an info toast
    return message;
  },
  
  showWarning: (message: string, options: ToastOptions = {}): string => {
    console.warn('WARNING:', message);
    // In a real app, this would display a warning toast
    return message;
  }
};

export default toastService; 