import React from 'react';
import { CardProps } from '../shared/types';
import { cn, getSizeClasses } from '../shared/utils';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  title,
  subtitle,
  className,
  testID,
  ...props
}) => {
  const baseClasses = [
    'rounded-lg transition-shadow duration-200',
    getSizeClasses(padding, 'padding'),
  ];

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      data-testid={testID}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};