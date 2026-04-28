'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface UserAvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
  className?: string;
  loading?: boolean;
  alt?: string;
  rounded?: boolean;
}

/**
 * Reusable user avatar with skeleton-while-loading and gradient
 * fallback initials when no image / image fails. Use for profile,
 * header pill, comment threads — anywhere a user pic goes.
 */
export function UserAvatar({
  src,
  firstName = '',
  lastName = '',
  size = 40,
  className,
  loading,
  alt,
  rounded = true,
}: UserAvatarProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = !!src && !imgError;
  const dimension = { width: size, height: size };
  const radius = rounded ? 'rounded-full' : 'rounded-[12px]';

  if (loading) {
    return (
      <div style={dimension} className={cn('inline-block', className)}>
        <Skeleton circle={rounded} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden text-white font-bold select-none',
        radius,
        className
      )}
      style={{
        ...dimension,
        background: showImage ? undefined : 'var(--gradient)',
        boxShadow: showImage ? undefined : '0 8px 32px var(--accent-glow)',
        fontSize: Math.max(11, Math.round(size * 0.36)),
      }}
      aria-label={alt ?? `${firstName} ${lastName}`}
    >
      {showImage ? (
        <>
          {!imgLoaded && (
            <Skeleton
              circle={rounded}
              className="absolute inset-0"
            />
          )}
          <Image
            src={src!}
            alt={alt ?? `${firstName} ${lastName}`}
            width={size}
            height={size}
            unoptimized
            className={cn(
              'object-cover transition-opacity duration-200',
              radius,
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoadingComplete={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <span>{initials(firstName, lastName) || '?'}</span>
      )}
    </div>
  );
}
