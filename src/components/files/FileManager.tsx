"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button, Skeleton } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";
import { FileUpload } from "./FileUpload";

type FileRecord = Doc<"files">;

const fileTypeIcons: Record<string, string> = {
  "image/": "\u{1F5BC}",
  "application/pdf": "\u{1F4C4}",
  "text/": "\u{1F4DD}",
  "application/zip": "\u{1F4E6}",
  "application/json": "{ }",
  "video/": "\u{1F3AC}",
  "audio/": "\u{1F3B5}",
};

function getFileIcon(type: string): string {
  for (const [prefix, icon] of Object.entries(fileTypeIcons)) {
    if (type.startsWith(prefix)) return icon;
  }
  return "\u{1F4CE}";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FileManagerProps {
  clientId?: Id<"clients">;
}

export function FileManager({ clientId }: FileManagerProps) {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(
    undefined,
  );
  const [showUpload, setShowUpload] = useState(false);

  const files = useQuery(api.files.list, {
    parentId: currentFolder,
  });
  const removeFile = useMutation(api.files.remove);

  const folders = files?.filter((f) => f.type === "folder") ?? [];
  const fileItems = files?.filter((f) => f.type !== "folder") ?? [];

  async function handleDelete(fileId: Id<"files">) {
    await removeFile({ fileId });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Files</h2>
          <p className="text-sm text-slate-500">
            {files === undefined
              ? "Loading..."
              : `${fileItems.length} file${fileItems.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
          className="self-start"
        >
          {showUpload ? "Close" : "+ Upload"}
        </Button>
      </div>

      {showUpload && (
        <FileUpload
          parentId={currentFolder}
          clientId={clientId}
          onComplete={() => setShowUpload(false)}
        />
      )}

      {currentFolder && (
        <button
          type="button"
          onClick={() => setCurrentFolder(undefined)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          &larr; Back to root
        </button>
      )}

      {files === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[48px] rounded-lg" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-sm text-slate-600">
          {currentFolder
            ? "This folder is empty."
            : "No files yet. Upload your first file to get started."}
        </div>
      ) : (
        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder._id}
              type="button"
              onClick={() => setCurrentFolder(folder._id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-2.5 text-left",
                "transition-all duration-150",
                "hover:border-seridian-500/20 hover:bg-[#0c1222]",
              )}
            >
              <span className="text-base" aria-hidden="true">
                📁
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200 group-hover:text-white">
                {folder.name}
              </span>
              <span className="text-[11px] text-slate-600">
                {formatDate(folder.createdAt)}
              </span>
            </button>
          ))}

          {fileItems.map((file) => (
            <div
              key={file._id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-2.5",
                "transition-all duration-150",
                "hover:border-seridian-500/20 hover:bg-[#0c1222]",
              )}
            >
              <span className="text-base" aria-hidden="true">
                {getFileIcon(file.type)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200 group-hover:text-white">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-600">
                  {formatFileSize(file.size)} · {formatDate(file.createdAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400"
                onClick={() => handleDelete(file._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
