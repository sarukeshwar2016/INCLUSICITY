import React from 'react';

const Button = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    secondary: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100",
    link: "bg-transparent underline-offset-4 hover:underline text-violet-600 hover:bg-transparent"
  };
  
  const sizes = {
    sm: "text-sm h-8 px-3",
    md: "text-sm h-10 py-2 px-4",
    lg: "text-base h-12 px-6"
  };
  
  const buttonClasses = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;