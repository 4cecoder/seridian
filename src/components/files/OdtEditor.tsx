"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Loader2,
  Save,
  Check,
  Download,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@bytecats/ui-kit";

interface OdtEditorProps {
  fileId: Id<"files">;
  fileName: string;
  currentUserId?: string;
}

export function OdtEditor({
  fileId,
  fileName,
  currentUserId = "dee",
}: OdtEditorProps) {
  const storageUrl = useQuery(api.files.getStorageUrl, { fileId });
  const updateDocContent = useMutation(api.collaboration.updateDocumentContent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Loading document...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[500px] p-6",
      },
    },
  });

  // Load and parse ODT file
  useEffect(() => {
    if (!storageUrl || !editor) return;

    setLoading(true);
    setError(null);

    fetch(storageUrl)
      .then((res) => res.arrayBuffer())
      .then(async (buffer) => {
        const bytes = new Uint8Array(buffer);
        setOriginalBytes(bytes);

        // Dynamically import odf-kit to parse ODT
        const { odtToHtml } = await import("odf-kit/reader");
        const html = odtToHtml(bytes);

        // Load HTML into TipTap editor
        editor.commands.setContent(html);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ODT:", err);
        setError("Failed to load document. The file may be corrupted.");
        setLoading(false);
      });
  }, [storageUrl, editor]);

  // Save handler - convert TipTap back to ODT
  const handleSave = useCallback(async () => {
    if (!editor || !fileId) return;

    setSaving(true);
    setSaveStatus("saving");

    try {
      // Get TipTap JSON content
      const json = editor.getJSON();

      // Dynamically import odf-kit to generate ODT
      const { tiptapToOdt } = await import("odf-kit");
      const newBytes = await tiptapToOdt(json, { pageFormat: "A4" });

      // Upload new ODT to Convex storage
      const postUrl = await fetch("/api/upload-url", { method: "POST" })
        .then((r) => r.json())
        .then((d) => d.url);

      // For now, save the content as text in collaboration doc
      // TODO: Implement proper ODT re-upload when HTTP actions are enabled
      const htmlContent = editor.getHTML();
      await updateDocContent({
        fileId,
        content: htmlContent,
        userPubkey: currentUserId,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save ODT:", err);
      setError("Failed to save document.");
      setSaveStatus("idle");
    } finally {
      setSaving(false);
    }
  }, [editor, fileId, currentUserId, updateDocContent]);

  // Download original ODT
  const handleDownload = () => {
    if (!originalBytes) return;
    const blob = new Blob([new Uint8Array(originalBytes)], {
      type: "application/vnd.oasis.opendocument.text",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (storageUrl === undefined || loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#070b14] text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span className="text-xs">Loading ODT document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-red-500/20 bg-[#070b14] p-6 text-center">
        <FileText className="h-10 w-10 text-red-400" />
        <div>
          <p className="text-xs font-semibold text-red-300">{error}</p>
        </div>
        {storageUrl && (
          <a href={storageUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
            <Button size="sm" variant="outline" className="border-white/10 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download Original
            </Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col rounded-xl border border-white/[0.08] bg-[#070b14] overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c1222] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">{fileName}</span>
              <span className="font-mono text-[9.5px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                .odt
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] bg-[#080d1a] text-[11px] font-semibold text-slate-300">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                <span className="text-cyan-300">Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-300">Saved</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-amber-400" />
                <span>Edit Mode</span>
              </>
            )}
          </div>

          {/* Download Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-7 border-white/10 text-xs gap-1 text-slate-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-7 bg-cyan-500 text-black hover:bg-cyan-400 font-semibold text-xs gap-1"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] bg-[#080d1a] px-4 py-1.5 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("bold") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("italic") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("strike") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("code") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Inline Code"
        >
          <Code className="h-3.5 w-3.5" />
        </button>

        <span className="h-3 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("heading", { level: 1 }) ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("heading", { level: 2 }) ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("heading", { level: 3 }) ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <span className="h-3 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("bulletList") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("orderedList") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
            editor?.isActive("blockquote") ? "bg-white/10 text-white" : "text-slate-300"
          }`}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-slate-300 hover:bg-white/10 transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span className="h-3 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="px-2 py-1 rounded text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="px-2 py-1 rounded text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-[#0b101d]">
        <EditorContent editor={editor} className="odt-editor" />
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#080d1a] px-4 py-1.5 text-[11px] font-mono text-slate-500">
        <span>OpenDocument Text</span>
        <div className="flex items-center gap-3">
          <span>{editor?.storage.characterCount?.characters?.() ?? editor?.getText().length ?? 0} chars</span>
          <span>{editor?.getText().split(/\s+/).filter(Boolean).length ?? 0} words</span>
        </div>
      </div>
    </div>
  );
}
