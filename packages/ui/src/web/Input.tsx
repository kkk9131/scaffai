import React, { forwardRef } from 'react';
import { InputFieldProps } from '../shared/types';
import { cn, getSizeClasses } from '../shared/utils';

export const Input = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  placeholder,
  value,
  defaultValue,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  className,
  testID,
  onChange,
  ...props
}, ref) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange?.(newValue);
  };

  const inputClasses = [
    'block w-full rounded-lg border shadow-sm transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    getSizeClasses('md', 'padding'),
    error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500' 
      : 'border-gray-300 text-gray-900 placeholder-gray-400',
    disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white',
  ].filter(Boolean);

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(inputClasses)}
        onChange={handleChange}
        data-testid={testID}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={cn(
          'text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});