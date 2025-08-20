import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorPopupProps {
  isVisible: boolean;
  message?: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  isVisible,
  message = "Something went wrong, please try again.",
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-2 opacity-0 scale-95"
      )}
      onTransitionEnd={handleAnimationEnd}
    >
      <Alert 
        variant="destructive" 
        className="w-80 shadow-lg border-red-200 bg-red-50 text-red-800 relative pr-12"
      >
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 font-medium">
          {message}
        </AlertDescription>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 transition-colors"
          aria-label="Close error popup"
        >
          <X className="h-4 w-4 text-red-600" />
        </button>
      </Alert>
    </div>
  );
};

// Hook to manage error popup state
export const useErrorPopup = () => {
  const [error, setError] = useState<{
    isVisible: boolean;
    message: string;
  }>({
    isVisible: false,
    message: ""
  });

  const showError = (message?: string) => {
    setError({
      isVisible: true,
      message: message || "Something went wrong, please try again."
    });
  };

  const hideError = () => {
    setError(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    error,
    showError,
    hideError
  };
};
