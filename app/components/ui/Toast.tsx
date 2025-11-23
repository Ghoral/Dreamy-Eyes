"use client";

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const getToastClasses = () => {
    const baseClasses = 'toast position-fixed top-0 end-0 m-3';
    const typeClasses = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      info: 'bg-info text-white'
    };
    
    return `${baseClasses} ${typeClasses[type]} ${isAnimating ? 'show' : 'fade'}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={getToastClasses()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ 
        zIndex: 9999,
        minWidth: '250px',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="toast-header border-0">
        <strong className="me-auto">{getIcon()} {type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default Toast;
