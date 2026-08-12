"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { cn } from "@/lib/utils";
import { Camera, X, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  pubkey: string;
  name: string;
  avatarUrl: string | null;
  onAvatarChange?: (url: string | null) => void;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-5 w-5",
  xl: "h-7 w-7",
};

export function AvatarUpload({
  pubkey,
  name,
  avatarUrl,
  onAvatarChange,
  size = "md",
  className,
}: AvatarUploadProps) {
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const removeAvatar = useMutation(api.users.removeAvatar);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await updateAvatar({
        pubkey,
        avatarStorageId: storageId,
      });

      const avatarUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
      onAvatarChange?.(avatarUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [pubkey, generateUploadUrl, updateAvatar, onAvatarChange]);

  const handleRemove = useCallback(async () => {
    setUploading(true);
    try {
      await removeAvatar({ pubkey });
      setPreview(null);
      onAvatarChange?.(null);
    } finally {
      setUploading(false);
    }
  }, [pubkey, removeAvatar, onAvatarChange]);

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayUrl = preview || avatarUrl;

  return (
    <div className={cn("relative group", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden transition-all",
          sizeClasses[size],
          !displayUrl && "bg-seridian-500/10 text-seridian-400 border border-seridian-500/20",
          !uploading && "hover:ring-2 hover:ring-seridian-500/40 cursor-pointer",
          uploading && "cursor-wait"
        )}
      >
        {uploading ? (
          <Loader2 className={cn("animate-spin text-seridian-400", iconSizes[size])} />
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={`${name}'s avatar`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-bold">{initials}</span>
        )}

        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className={cn("text-white", iconSizes[size])} />
          </div>
        )}
      </button>

      {displayUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400"
          aria-label="Remove avatar"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
