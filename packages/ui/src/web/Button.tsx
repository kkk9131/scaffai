import React from 'react';
import { ButtonProps } from '../shared/types';
import { cn, getSizeClasses, getColorClasses } from '../shared/utils';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  testID,
  onClick,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    getSizeClasses(size, 'padding'),
    getSizeClasses(size, 'text'),
    getColorClasses(color, variant),
    fullWidth ? 'w-full' : '',
    disabled ? 'pointer-events-none' : '',
  ].filter(Boolean);

  return (
    <button
      type="button"
      className={cn(baseClasses, className)}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testID}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};