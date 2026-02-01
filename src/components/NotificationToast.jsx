import React, { useEffect } from 'react';

/**
 * Composant de notification toast avec auto-close
 */
const NotificationToast = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : 'bg-red-500';

  const iconBgColor = type === 'success'
    ? 'bg-green-400'
    : 'bg-red-400';

  const icon = type === 'success' ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-md flex items-center space-x-3 border-l-4 ${type === 'success' ? 'border-green-300' : 'border-red-300'}`}>
        <div className={`flex-shrink-0 p-1 rounded-full ${iconBgColor}`}>
          {icon}
        </div>
        <p className="text-sm font-medium flex-1 text-white">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-800 hover:text-gray-600 transition-colors ml-2 p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded"
          aria-label="Fermer la notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
