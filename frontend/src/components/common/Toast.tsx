import React, { useState, useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000, // Default 5 seconds
  showRetry = false,
  onRetry,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Set up auto-dismiss
  useEffect(() => {
    if (duration > 0) {
      // Calculate progress step based on duration
      const step = 100 / (duration / 100); // Update every 100ms
      
      // Set up interval to update progress bar
      const interval = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - step;
          return newProgress > 0 ? newProgress : 0;
        });
      }, 100);
      
      setIntervalId(interval);
      
      // Set timeout to close toast
      const timeout = window.setTimeout(() => {
        handleClose();
      }, duration);
      
      setTimeoutId(timeout);
      
      return () => {
        if (timeout) window.clearTimeout(timeout);
        if (interval) window.clearInterval(interval);
      };
    }
  }, [duration]);

  // Handle mouse enter - pause the timer
  const handleMouseEnter = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    if (intervalId) window.clearInterval(intervalId);
  };

  // Handle mouse leave - resume the timer
  const handleMouseLeave = () => {
    if (duration > 0) {
      // Calculate remaining time based on progress
      const remainingTime = (duration * progress) / 100;
      
      // Set up new interval for progress bar
      const step = 100 / (remainingTime / 100);
      const interval = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - step;
          return newProgress > 0 ? newProgress : 0;
        });
      }, 100);
      
      setIntervalId(interval);
      
      // Set up new timeout for closing
      const timeout = window.setTimeout(() => {
        handleClose();
      }, remainingTime);
      
      setTimeoutId(timeout);
    }
  };

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      onClose(id);
    }, 300); // Animation duration
  };

  // Handle retry
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'info':
        return <i className="fas fa-info-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'show' : 'hide'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <div className="toast-actions">
          {showRetry && (
            <button className="toast-retry" onClick={handleRetry}>
              <i className="fas fa-redo"></i>
            </button>
          )}
          <button className="toast-close" onClick={() => handleClose()}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Toast; 