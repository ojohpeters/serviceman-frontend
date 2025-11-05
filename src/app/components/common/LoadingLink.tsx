'use client';

import React from 'react';
import Link from 'next/link';
import { useLoading } from '../../contexts/LoadingContext';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
  onClick?: () => void;
}

export default function LoadingLink({
  href,
  children,
  className = '',
  loadingMessage = 'Loading...',
  onClick,
}: LoadingLinkProps) {
  const { startLoading } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    // Don't show loading for hash links or external links
    if (href.startsWith('#') || href.startsWith('http')) {
      return;
    }

    startLoading(loadingMessage);
    
    if (onClick) {
      onClick();
    }

    // Stop loading after navigation (will be handled by Next.js route change)
    setTimeout(() => {
      // The TopLoadingBar will handle the visual feedback
    }, 100);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

