'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { useUploadAvatar, useDeleteAvatar, AVATAR_MAX_BYTES, AVATAR_ALLOWED_MIME } from '@/lib/hooks';
import { UserAvatar } from './user-avatar';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
  loading?: boolean;
}

/**
 * Avatar with hover overlay → click to upload, button to remove.
 * Drives the `useUploadAvatar` / `useDeleteAvatar` hooks.
 */
export function AvatarUploader({
  src,
  firstName,
  lastName,
  size = 96,
  loading,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const busy = upload.isPending || remove.isPending;
  const displayedSrc = previewUrl ?? src ?? null;

  const onPick = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    upload.mutate(file, {
      onSettled: () => {
        URL.revokeObjectURL(localUrl);
        setPreviewUrl(null);
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <UserAvatar
          src={displayedSrc}
          firstName={firstName}
          lastName={lastName}
          size={size}
          loading={loading}
        />

        {!loading && (
          <button
            type="button"
            onClick={onPick}
            disabled={busy}
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-black/50 text-white opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200 disabled:cursor-not-allowed',
              busy && 'opacity-100'
            )}
            aria-label="Change avatar"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ALLOWED_MIME.join(',')}
          className="hidden"
          onChange={onChange}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          className="text-[12px] font-medium text-[var(--accent-text)] hover:opacity-80 transition disabled:opacity-50"
        >
          {src ? 'Change photo' : 'Upload photo'}
        </button>
        {src && (
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={busy}
            className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--danger)] transition disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        )}
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1 text-center">
          JPEG, PNG, WebP · max {Math.round(AVATAR_MAX_BYTES / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
}
