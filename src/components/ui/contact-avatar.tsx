'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getIdentityClass, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

export interface ContactAvatarProps {
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  size?: ContactAvatarSize;
  className?: string;
  fallbackClassName?: string;
}

export type ContactAvatarSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl';

/**
 * Escala fechada de diâmetros (`FH-30.01`). Só o diâmetro é
 * declarado: o corpo da letra é derivado dele em CSS
 * (`.avatar-identity`), então não há par para manter em sincronia e
 * um `className="size-9"` na chamada continua proporcional.
 */
const SIZE_CLASSES: Record<ContactAvatarSize, string> = {
  xs: 'size-5',
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
  xl: 'size-12',
  '2xl': 'size-14',
};

export function ContactAvatar({
  name,
  phone,
  avatarUrl,
  size = 'default',
  className,
  fallbackClassName,
}: ContactAvatarProps) {
  const displayName = name || phone || '';
  const initials = getInitials(name, phone);
  const identity = getIdentityClass(displayName);

  return (
    <Avatar
      className={cn(
        SIZE_CLASSES[size],
        // O anel de identidade é o único contorno: o anel neutro do
        // primitivo, com mix-blend por cima do matiz, embaçava a borda.
        'shrink-0 after:hidden',
        'avatar-identity',
        identity,
        className
      )}
    >
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={displayName || 'Avatar'}
          className="aspect-square size-full rounded-full object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          // 38% do diâmetro, medido pelo círculo via container query.
          // Precisa ser utility para vencer o `text-sm` do primitivo.
          'avatar-identity-label text-[length:38cqw]',
          'flex size-full select-none items-center justify-center bg-transparent text-current',
          fallbackClassName
        )}
      >
        <span className="avatar-identity-glyphs">{initials}</span>
      </AvatarFallback>
    </Avatar>
  );
}
