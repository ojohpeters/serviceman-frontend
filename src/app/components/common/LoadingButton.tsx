'use client';

import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary';
  size?: 'sm' | 'lg';
}

export default function LoadingButton({
  loading = false,
  loadingText,
  children,
  icon,
  variant = 'primary',
  size,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const sizeClass = size ? `btn-${size}` : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className} d-flex align-items-center justify-content-center gap-2`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        <>
          {icon && <i className={icon}></i>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

