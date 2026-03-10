import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  children: React.ReactNode;
};

const variants = {
  primary: 'bg-emerald-600 text-white hover:bg-opacity-95',
  ghost: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const;

const Button: React.FC<Props> = ({ variant = 'primary', children, className = '', ...rest }) => {
  const base = 'px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary';
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;