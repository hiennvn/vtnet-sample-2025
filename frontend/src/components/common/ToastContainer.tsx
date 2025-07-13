import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import './Toast.css';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right', 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Event listeners for different toast types
    const handleSuccess = (e: CustomEvent<ToastItem>) => addToast(e.detail);
    const handleError = (e: CustomEvent<ToastItem>) => addToast(e.detail);
    const handleInfo = (e: CustomEvent<ToastItem>) => addToast(e.detail);
    const handleWarning = (e: CustomEvent<ToastItem>) => addToast(e.detail);

    // Add event listeners
    window.addEventListener('toast:success', handleSuccess as EventListener);
    window.addEventListener('toast:error', handleError as EventListener);
    window.addEventListener('toast:info', handleInfo as EventListener);
    window.addEventListener('toast:warning', handleWarning as EventListener);

    // Clean up event listeners
    return () => {
      window.removeEventListener('toast:success', handleSuccess as EventListener);
      window.removeEventListener('toast:error', handleError as EventListener);
      window.removeEventListener('toast:info', handleInfo as EventListener);
      window.removeEventListener('toast:warning', handleWarning as EventListener);
    };
  }, []);

  // Add a new toast to the stack
  const addToast = (toast: ToastItem) => {
    setToasts(prev => {
      // Limit the number of toasts
      const limitedToasts = [...prev, toast].slice(-maxToasts);
      return limitedToasts;
    });
  };

  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className={`toast-container ${position}`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          showRetry={toast.showRetry}
          onRetry={toast.onRetry}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 