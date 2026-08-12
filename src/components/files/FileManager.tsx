"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";
import { FileUpload } from "./FileUpload";
import {
  Folder, File, FileText, FileImage, FileVideo, FileAudio, FileCode, FileArchive,
  FileJson, FileSpreadsheet, Presentation, Eye, Download, Trash2, Copy, Info,
  Grid, List, Search, ChevronRight, Plus, X, Clock, HardDrive, ArrowLeft
} from "lucide-react";

type FileRecord = Doc<"files">;

const FILE_TYPE_CONFIG: Record<string, { icon: typeof File; color: string; label: string }> = {
  "image/": { icon: FileImage, color: "text-pink-400 bg-pink-500/10", label: "Image" },
  "video/": { icon: FileVideo, color: "text-purple-400 bg-purple-500/10", label: "Video" },
  "audio/": { icon: FileAudio, color: "text-amber-400 bg-amber-500/10", label: "Audio" },
  "application/pdf": { icon: FileText, color: "text-red-400 bg-red-500/10", label: "PDF" },
  "application/zip": { icon: FileArchive, color: "text-yellow-400 bg-yellow-500/10", label: "Archive" },
  "application/json": { icon: FileJson, color: "text-emerald-400 bg-emerald-500/10", label: "JSON" },
  "text/": { icon: FileText, color: "text-blue-400 bg-blue-500/10", label: "Text" },
  "text/html": { icon: FileCode, color: "text-orange-400 bg-orange-500/10", label: "HTML" },
  "text/css": { icon: FileCode, color: "text-cyan-400 bg-cyan-500/10", label: "CSS" },
  "text/javascript": { icon: FileCode, color: "text-yellow-400 bg-yellow-500/10", label: "JavaScript" },
  "application/vnd.openxmlformats-officedocument": { icon: Presentation, color: "text-orange-400 bg-orange-500/10", label: "Document" },
  "spreadsheet": { icon: FileSpreadsheet, color: "text-green-400 bg-green-500/10", label: "Spreadsheet" },
};

function getFileConfig(mimeType: string) {
  for (const [prefix, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (mimeType.startsWith(prefix)) return config;
  }
  return { icon: File, color: "text-slate-400 bg-slate-500/10", label: "File" };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf" || mimeType.startsWith("text/");
}

interface FileManagerProps {
  clientId?: Id<"clients">;
}

export function FileManager({ clientId }: FileManagerProps) {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>();
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FileRecord | null>(null);

  const files = useQuery(api.files.list, { parentId: currentFolder });
  const removeFile = useMutation(api.files.remove);

  const folders = useMemo(() => files?.filter((f) => f.type === "folder") ?? [], [files]);
  const fileItems = useMemo(() => {
    const items = files?.filter((f) => f.type !== "folder") ?? [];
    if (!search) return items;
    return items.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const totalSize = useMemo(() => fileItems.reduce((sum, f) => sum + f.size, 0), [fileItems]);

  const handleDelete = useCallback(async (fileId: Id<"files">) => {
    await removeFile({ fileId });
    setDeleteConfirm(null);
    setSelectedFile(null);
  }, [removeFile]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-400">{fileItems.length} files · {formatBytes(totalSize)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="h-7 w-40 pl-8 bg-white/5 border-white/10 text-xs"
            />
          </div>
          <div className="flex items-center rounded-md border border-white/10 bg-white/[0.03] p-0.5">
            <button type="button" onClick={() => setViewMode("list")} className={cn("h-6 w-6 flex items-center justify-center rounded text-xs", viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500")}><List className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => setViewMode("grid")} className={cn("h-6 w-6 flex items-center justify-center rounded text-xs", viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500")}><Grid className="h-3.5 w-3.5" /></button>
          </div>
          <Button size="sm" onClick={() => setShowUpload(!showUpload)} className="h-7 bg-seridian-500 text-white hover:bg-seridian-400 text-xs">
            {showUpload ? <X className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            {showUpload ? "Close" : "Upload"}
          </Button>
        </div>
      </div>

      {/* Upload area */}
      {showUpload && (
        <FileUpload parentId={currentFolder} clientId={clientId} onComplete={() => setShowUpload(false)} />
      )}

      {/* Breadcrumbs */}
      {currentFolder && (
        <button type="button" onClick={() => setCurrentFolder(undefined)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to root
        </button>
      )}

      {/* Content */}
      {files === undefined ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : files.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-sm text-slate-600">
          {currentFolder ? "Empty folder" : "No files yet"}
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-0.5">
          {/* Folders */}
          {folders.map((folder) => (
            <button key={folder._id} type="button" onClick={() => setCurrentFolder(folder._id)} className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0c1222]/60 px-3 py-2 text-left transition-colors hover:border-white/[0.1] hover:bg-[#0c1222]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400"><Folder className="h-4 w-4" /></div>
              <span className="flex-1 truncate text-sm text-slate-200 group-hover:text-white">{folder.name}</span>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
            </button>
          ))}

          {/* Files */}
          {fileItems.map((file) => {
            const config = getFileConfig(file.type);
            const Icon = config.icon;
            return (
              <div key={file._id} className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0c1222]/60 px-3 py-2 transition-colors hover:border-white/[0.1] hover:bg-[#0c1222]">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.color)}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-slate-200 group-hover:text-white">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{formatBytes(file.size)} · {config.label} · {formatDate(file.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPreviewable(file.type) && (
                    <button type="button" onClick={() => setPreviewFile(file)} className="h-7 w-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10"><Eye className="h-3.5 w-3.5" /></button>
                  )}
                  <button type="button" onClick={() => setSelectedFile(file)} className="h-7 w-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10"><Info className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => setDeleteConfirm(file)} className="h-7 w-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <button key={folder._id} type="button" onClick={() => setCurrentFolder(folder._id)} className="group flex flex-col items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0c1222]/60 p-4 transition-colors hover:border-white/[0.1]">
              <Folder className="h-8 w-8 text-yellow-400" />
              <span className="truncate text-xs text-slate-300 group-hover:text-white w-full text-center">{folder.name}</span>
            </button>
          ))}
          {fileItems.map((file) => {
            const config = getFileConfig(file.type);
            const Icon = config.icon;
            return (
              <button key={file._id} type="button" onClick={() => isPreviewable(file.type) ? setPreviewFile(file) : setSelectedFile(file)} className="group flex flex-col items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0c1222]/60 p-4 transition-colors hover:border-white/[0.1]">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", config.color)}><Icon className="h-6 w-6" /></div>
                <span className="truncate text-xs text-slate-300 group-hover:text-white w-full text-center">{file.name}</span>
                <span className="text-[10px] text-slate-600">{formatBytes(file.size)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(o) => !o && setPreviewFile(null)}>
        {previewFile && (
          <DialogContent className="max-w-2xl border-white/[0.06] bg-[#0c1222] p-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b border-white/[0.06]">
              <DialogTitle className="text-sm text-white flex items-center gap-2">
                {(() => { const Icon = getFileConfig(previewFile.type).icon; return <Icon className="h-4 w-4 text-slate-400" />; })()}
                {previewFile.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center min-h-[300px] bg-[#070b14] p-4">
              {previewFile.type.startsWith("image/") ? (
                <img src={`https://fine-flamingo-162.convex.site/api/storage/${previewFile.storageId}`} alt={previewFile.name} className="max-h-[400px] max-w-full rounded-lg object-contain" />
              ) : previewFile.type === "application/pdf" ? (
                <iframe src={`https://fine-flamingo-162.convex.site/api/storage/${previewFile.storageId}`} className="h-[400px] w-full rounded-lg border border-white/10" title={previewFile.name} />
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                  Preview not available for this file type
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={(o) => !o && setSelectedFile(null)}>
        {selectedFile && (
          <DialogContent className="max-w-sm border-white/[0.06] bg-[#0c1222] p-4 space-y-3">
            <div className="flex items-start gap-3">
              {(() => { const config = getFileConfig(selectedFile.type); const Icon = config.icon; return <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", config.color)}><Icon className="h-5 w-5" /></div>; })()}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white truncate">{selectedFile.name}</h3>
                <p className="text-xs text-slate-500">{selectedFile.type}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="text-slate-300">{formatBytes(selectedFile.size)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span className="text-slate-300">{formatDate(selectedFile.createdAt)} {formatTime(selectedFile.createdAt)}</span></div>
              {selectedFile.parentId && <div className="flex justify-between"><span className="text-slate-500">Folder</span><span className="text-slate-300">{selectedFile.parentId}</span></div>}
            </div>
            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              {isPreviewable(selectedFile.type) && <Button size="sm" variant="outline" onClick={() => { setPreviewFile(selectedFile); setSelectedFile(null); }} className="flex-1 border-white/10 text-xs"><Eye className="h-3.5 w-3.5 mr-1" />Preview</Button>}
              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(selectedFile)} className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        {deleteConfirm && (
          <DialogContent className="max-w-sm border-white/[0.06] bg-[#0c1222] p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Delete file?</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete <span className="text-white">{deleteConfirm.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-slate-400 text-xs">Cancel</Button>
              <Button size="sm" onClick={() => handleDelete(deleteConfirm._id)} className="bg-red-500 text-white hover:bg-red-400 text-xs">Delete</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
