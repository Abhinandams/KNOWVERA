import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

const Input: React.FC<Props> = ({ label, error, className = '', ...rest }) => {
  const base = 'w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary';
  return (
    <label className="block">
      {label && <div className="mb-1 text-sm text-gray-600">{label}</div>}
      <input className={`${base} ${className}`} {...rest} />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  );
};

export default Input;