"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import LinkExtension from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Youtube from "@tiptap/extension-youtube";
import TiptapImage from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  FilePenLine,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  MessageSquare,
  Quote,
  Save,
  Send,
  Sparkles,
  Unlink,
  XCircle,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Minus,
  Code,
  ImagePlus,
  Video as YoutubeIcon,
  Undo,
  Redo,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: unknown;
    coverImageUrl?: string | null;
    categoryId: string;
    status: string;
    editorBrief?: { angle?: string; checklist?: string[] } | null;
    coverImageCaption?: string | null;
    photographerCredit?: string | null;
  };
  categories: Category[];
  mode?: "reporter" | "editor" | "admin";
  isAdmin?: boolean;
}

const OPENING_ANGLES = [
  "Lead with what changed in the last 24 hours.",
  "Start with the strongest verified number or consequence.",
  "Open with a scene that places the reader at the center of the story.",
  "Frame the story as a question the article will answer.",
];

const REPORTER_CHECKLIST = [
  "The headline says what happened, not just the topic.",
  "The first two paragraphs establish who, what, when, and why it matters.",
  "At least one quote, datapoint, or direct observation supports the central claim.",
  "The ending leaves the reader with the next development or implication.",
];

function createSlug(value: string) {
  return value
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}\-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function extractPlainText(content: unknown): string {
  if (!content || typeof content !== "object") return "";

  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child && typeof child === "object") walk(child as Record<string, unknown>);
      }
    }
  }

  walk(content as Record<string, unknown>);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function storyPrompt(categoryName?: string) {
  return [
    `Angle: Why this ${categoryName ? categoryName.toLowerCase() : "story"} matters right now`,
    "Key fact:",
    "Key voice or source:",
    "What changes next:",
  ].join("\n");
}

export default function ArticleForm({
  initialData,
  categories,
  mode = "reporter",
  isAdmin = false,
}: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [coverImageCaption, setCoverImageCaption] = useState(initialData?.coverImageCaption || "");
  const [photographerCredit, setPhotographerCredit] = useState(initialData?.photographerCredit || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<"DRAFT" | "PENDING" | null>(null);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData);
  const [isActioning, setIsActioning] = useState<"save" | "publish" | "reject" | "admin-save" | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editorBrief, setEditorBrief] = useState<{ angle?: string; checklist?: string[] }>(
    initialData?.editorBrief || { angle: "", checklist: [] }
  );

  // AI Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTemplate, setAiTemplate] = useState("general");
  const [aiRawData, setAiRawData] = useState("");
  const [aiGeneratedHtml, setAiGeneratedHtml] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleGenerateAi = async () => {
    if (!aiRawData.trim()) {
      setAiError("Please provide some raw data to generate a story.");
      return;
    }
    setIsGeneratingAi(true);
    setAiError("");
    setAiGeneratedHtml("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: aiTemplate, rawData: aiRawData })
      });

      if (!response.ok) {
        let errMessage = "Failed to generate AI story.";
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      setAiGeneratedHtml(data.html);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI Generation failed.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const insertAiContent = () => {
    if (editor && aiGeneratedHtml) {
      editor.chain().focus().insertContent(aiGeneratedHtml).run();
      setIsAiModalOpen(false);
      setAiRawData("");
      setAiGeneratedHtml("");
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          className: "font-semibold text-emerald-800 underline underline-offset-4",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Superscript,
      Subscript,
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-xl",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-6 border border-slate-200",
        },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: "Write your story here...",
      }),
    ],
    content: initialData?.content || {
      type: "doc",
      content: [{ type: "paragraph", content: [] }],
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] max-h-[620px] overflow-y-auto px-5 py-4 focus:outline-none " +
          "[&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-black [&_h1.is-empty::before]:content-[attr(data-placeholder)] [&_h1.is-empty::before]:text-slate-300 [&_h1.is-empty::before]:float-left [&_h1.is-empty::before]:pointer-events-none " +
          "[&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-black [&_h2.is-empty::before]:content-[attr(data-placeholder)] [&_h2.is-empty::before]:text-slate-300 [&_h2.is-empty::before]:float-left [&_h2.is-empty::before]:pointer-events-none " +
          "[&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3.is-empty::before]:content-[attr(data-placeholder)] [&_h3.is-empty::before]:text-slate-300 [&_h3.is-empty::before]:float-left [&_h3.is-empty::before]:pointer-events-none " +
          "[&_p]:my-3 [&_p]:leading-8 [&_p]:text-slate-700 [&_p.is-empty::before]:content-[attr(data-placeholder)] [&_p.is-empty::before]:text-slate-300 [&_p.is-empty::before]:float-left [&_p.is-empty::before]:pointer-events-none " +
          "[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc " +
          "[&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal " +
          "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic " +
          "[&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-slate-100 " +
          "[&_pre]:my-5 [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-slate-50 " +
          "[&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_code]:text-pink-600",
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      const base = createSlug(title);
      const suffix = Date.now().toString(36).slice(-4);
      setSlug(initialData ? base : `${base}-${suffix}`);
    }
  }, [initialData, slugManuallyEdited, title]);

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const plainText = extractPlainText(editor?.getJSON());
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characterCount = editor?.storage.characterCount?.characters() || plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const seoDescription = plainText.slice(0, 155).trim();
  const headlineScore =
    title.length >= 45 && title.length <= 90
      ? "Strong"
      : title.length > 0
        ? "Needs tuning"
        : "Missing";

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const signatureResponse = await fetch("/api/upload-signature", {
        method: "POST",
      });

      if (!signatureResponse.ok) {
        throw new Error("Failed to retrieve upload credentials from server");
      }

      const { signature, timestamp, cloudName, apiKey, folder } =
        await signatureResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadResponse.ok) {
        let cloudinaryError = "";
        try {
          const errorBody = await uploadResponse.json();
          cloudinaryError = errorBody?.error?.message || JSON.stringify(errorBody);
        } catch {
          cloudinaryError = `HTTP ${uploadResponse.status}`;
        }
        throw new Error(`Cloudinary upload failed: ${cloudinaryError}`);
      }

      const data = await uploadResponse.json();
      setCoverImageUrl(data.secure_url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const submitReporterArticle = async (targetStatus: "DRAFT" | "PENDING") => {
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    if (!categoryId) return setError("Please select a category");
    if (!editor || editor.isEmpty) return setError("Article content cannot be empty");

    setIsSubmitting(targetStatus);
    setError("");

    try {
      const response = await fetch(initialData ? `/api/articles/${initialData.id}` : "/api/articles", {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: editor.getJSON(),
          coverImageUrl: coverImageUrl || null,
          coverImageCaption: coverImageCaption || null,
          photographerCredit: photographerCredit || null,
          categoryId,
          status: targetStatus,
          editorBrief,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save article");
      }

      router.push("/dashboard/reporter");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!initialData) return;
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    if (!categoryId) return setError("Please select a category");
    if (!editor || editor.isEmpty) return setError("Article content cannot be empty");

    setIsActioning("save");
    setError("");

    try {
      const response = await fetch(`/api/articles/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: editor.getJSON(),
          coverImageUrl: coverImageUrl || null,
          coverImageCaption: coverImageCaption || null,
          photographerCredit: photographerCredit || null,
          categoryId,
          editorBrief,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save changes");
      }

      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save changes");
    } finally {
      setIsActioning(null);
    }
  };

  // Admin-specific: save changes while keeping the article PUBLISHED
  const handleAdminSave = async () => {
    if (!initialData) return;
    if (!title.trim()) return setError("Title is required");
    if (!slug.trim()) return setError("Slug is required");
    if (!categoryId) return setError("Please select a category");
    if (!editor || editor.isEmpty) return setError("Article content cannot be empty");

    setIsActioning("admin-save");
    setError("");

    try {
      const response = await fetch(`/api/articles/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: editor.getJSON(),
          coverImageUrl: coverImageUrl || null,
          coverImageCaption: coverImageCaption || null,
          photographerCredit: photographerCredit || null,
          categoryId,
          // Explicitly keep PUBLISHED — do NOT change status
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save changes");
      }

      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save changes");
    } finally {
      setIsActioning(null);
    }
  };

  const handlePublish = async () => {
    if (!initialData) return;

    setIsActioning("publish");
    setError("");

    try {
      const response = await fetch(`/api/articles/${initialData.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to publish article");
      }

      router.push("/dashboard/editor");
      router.refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish article"
      );
    } finally {
      setIsActioning(null);
    }
  };

  const handleReject = async () => {
    if (!initialData) return;
    if (!rejectionNote.trim()) return setError("A rejection note is required");

    setIsActioning("reject");
    setError("");

    try {
      const response = await fetch(`/api/articles/${initialData.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionNote: rejectionNote.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to reject article");
      }

      router.push("/dashboard/editor");
      router.refresh();
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : "Failed to reject article"
      );
    } finally {
      setIsActioning(null);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const injectPrompt = () => {
    if (!editor) return;
    editor.commands.insertContent({
      type: "paragraph",
      content: [{ type: "text", text: storyPrompt(selectedCategory?.name) }],
    });
  };

  const injectOpeningAngle = (angle: string) => {
    if (!editor) return;
    editor.commands.insertContent({
      type: "paragraph",
      content: [{ type: "text", text: angle }],
    });
  };

  const addYoutubeVideo = () => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const addImage = () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const altText = window.prompt("Enter image caption/alt text:");
      
      try {
        setIsUploading(true);
        const signatureResponse = await fetch("/api/upload-signature", { method: "POST" });
        if (!signatureResponse.ok) throw new Error("Failed to get upload credentials");
        
        const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json();
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        
        const data = await uploadResponse.json();
        editor.commands.setImage({ src: data.secure_url, alt: altText || "" });
      } catch (err) {
        console.error(err);
        setError("Failed to upload article image");
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="glass-panel-strong rounded-[32px] border border-white/70 p-6 md:p-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            Changes saved. Continue reviewing or publish when ready.
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Article title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a precise, high-signal headline"
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="story-url-slug"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cover image
            </label>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {coverImageUrl ? (
                <div className="relative w-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 md:w-96 flex justify-center">
                  <Image
                    src={coverImageUrl}
                    alt="Cover preview"
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 384px"
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="absolute inset-x-4 bottom-4 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/80 text-center"
                  >
                    Remove cover
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 md:w-72">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin text-emerald-700" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-slate-400" />
                      <span className="mt-2 text-sm font-semibold text-slate-700">
                        Upload cover image
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        PNG, JPG, JPEG, WebP
                      </span>
                    </>
                  )}
                </label>
              )}
              
              {coverImageUrl ? (
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Image Caption</label>
                    <input
                      type="text"
                      value={coverImageCaption || ""}
                      onChange={(e) => setCoverImageCaption(e.target.value)}
                      placeholder="E.g. A new Kia SUV prototype testing..."
                      className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Photographer Credit</label>
                    <input
                      type="text"
                      value={photographerCredit || ""}
                      onChange={(e) => setPhotographerCredit(e.target.value)}
                      placeholder="E.g. Photo: Kia Motor"
                      className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Use a visually clean cover that supports the story, not just decorates it.</p>
                  <p>High-contrast, documentary-style imagery works best for this design.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-slate-700">
                Article body
              </label>
              <div className="flex gap-2">
                {mode === "reporter" && (
                  <button
                    type="button"
                    onClick={injectPrompt}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
                  >
                    <Sparkles size={13} />
                    Insert story brief prompt
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-900 transition hover:bg-indigo-200"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    AI Assistant
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[rgba(255,255,255,0.75)]">
              {editor && (
                <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-white/80 p-2">
                  {/* Formatting */}
                  <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
                    <UnderlineIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough (Ctrl+Shift+S)">
                    <Strikethrough size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Colors */}
                  <ToolbarButton active={editor.isActive("textStyle", { color: "#ef4444" })} onClick={() => editor.chain().focus().setColor("#ef4444").run()} title="Red Text">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("textStyle", { color: "#3b82f6" })} onClick={() => editor.chain().focus().setColor("#3b82f6").run()} title="Blue Text">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("textStyle", { color: "#10b981" })} onClick={() => editor.chain().focus().setColor("#10b981").run()} title="Green Text">
                    <div className="w-4 h-4 rounded-full bg-emerald-500" />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} title="Highlight (Yellow)">
                    <Highlighter size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Headings */}
                  <ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1, }).run()} title="Heading 1 (Ctrl+Alt+1)">
                    <Heading1 size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2 (Ctrl+Alt+2)">
                    <Heading2 size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3 (Ctrl+Alt+3)">
                    <Heading3 size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Alignment */}
                  <ToolbarButton active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left">
                    <AlignLeft size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center">
                    <AlignCenter size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right">
                    <AlignRight size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Lists & Quotes */}
                  <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list (Ctrl+Shift+8)">
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list (Ctrl+Shift+7)">
                    <ListOrdered size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote (Ctrl+Shift+B)">
                    <Quote size={16} />
                  </ToolbarButton>
                  
                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Formatting Extras */}
                  <ToolbarButton active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">
                    <SuperscriptIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">
                    <SubscriptIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <Minus size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block (Ctrl+Alt+C)">
                    <Code size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* Inserts */}
                  <ToolbarButton active={editor.isActive("link")} onClick={setLink} title="Add link">
                    <LinkIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                    <Unlink size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("image")} onClick={addImage} title="Insert Image">
                    <ImagePlus size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={editor.isActive("youtube")} onClick={addYoutubeVideo} title="Insert YouTube Video">
                    <YoutubeIcon size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

                  {/* History */}
                  <ToolbarButton active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo size={16} />
                  </ToolbarButton>
                  <ToolbarButton active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo size={16} />
                  </ToolbarButton>
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>

          {mode === "admin" ? (
            // Admin editing a published article
            <div className="space-y-4 border-t border-slate-200 pt-6">
              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  Article updated and remains published live.
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/dashboard/editor"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                >
                  <ArrowLeft size={15} />
                  Back to editor dashboard
                </Link>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAdminSave}
                    disabled={isActioning !== null || isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isActioning === "admin-save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save &amp; Keep Published
                  </button>
                </div>
              </div>
            </div>
          ) : mode === "editor" ? (
            <div className="space-y-4 border-t border-slate-200 pt-6">
              {isRejecting && (
                <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-800">
                    <MessageSquare size={14} />
                    Rejection note
                  </label>
                  <textarea
                    value={rejectionNote}
                    onChange={(event) => setRejectionNote(event.target.value)}
                    rows={4}
                    placeholder="Explain what needs to change before this can be published."
                    className="w-full resize-none rounded-[18px] border border-rose-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/dashboard/editor"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                >
                  <ArrowLeft size={15} />
                  Back to editor dashboard
                </Link>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isActioning !== null || isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 disabled:opacity-50"
                  >
                    {isActioning === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save changes
                  </button>
                  {isRejecting ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectionNote("");
                        }}
                        className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isActioning !== null || !rejectionNote.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        {isActioning === "reject" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Confirm reject
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      disabled={isActioning !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isActioning !== null || isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isActioning === "publish" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve and publish
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/dashboard/reporter"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <ArrowLeft size={15} />
                Back to dashboard
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => submitReporterArticle("DRAFT")}
                  disabled={isSubmitting !== null || isUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 disabled:opacity-50"
                >
                  {isSubmitting === "DRAFT" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => submitReporterArticle("PENDING")}
                  disabled={isSubmitting !== null || isUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting === "PENDING" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit for review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="glass-panel rounded-[30px] border border-white/70 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <FilePenLine size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Story diagnostics
              </p>
              <h2 className="text-lg font-black text-slate-950">Reporter assist</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InsightCard label="Headline" value={headlineScore} />
            <InsightCard label="Words" value={String(wordCount)} />
            <InsightCard label="Characters" value={String(characterCount)} />
            <InsightCard label="Read time" value={`${readingTime} min`} />
            <InsightCard label="Section" value={selectedCategory?.name ?? "None"} />
          </div>
        </div>

        <div className="glass-panel rounded-[30px] border border-white/70 p-6">
          <h3 className="text-lg font-black text-slate-950">SEO preview</h3>
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-emerald-800">
              /article/{slug || "your-story-slug"}
            </p>
            <p className="mt-2 text-base font-bold text-slate-950">
              {title || "Your headline appears here"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {seoDescription || "Add article body text to generate a search-style preview snippet."}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[30px] border border-white/70 p-6">
          <h3 className="text-lg font-black text-slate-950">
            {mode === "editor" ? "Assign Editor Brief" : editorBrief.angle ? "Editor's Brief" : "Opening ideas"}
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              {mode === "editor" && <p className="text-sm font-semibold text-slate-700 mb-2">Select Angle</p>}
              <div className="space-y-2">
                {OPENING_ANGLES.map((angle) => {
                  const isSelected = editorBrief.angle === angle;
                  if (mode === "reporter" && editorBrief.angle && !isSelected) return null;

                  return (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => {
                        if (mode === "editor") {
                          setEditorBrief({ ...editorBrief, angle: isSelected ? undefined : angle });
                        } else {
                          injectOpeningAngle(angle);
                        }
                      }}
                      className={`block w-full rounded-[22px] border px-4 py-3 text-left text-sm leading-6 transition ${
                        isSelected 
                          ? 'border-amber-300 bg-amber-50 text-amber-900 font-medium shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      {angle}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-950 mb-3 mt-6">Editorial checklist</h3>
              <ul className={`space-y-3 ${mode === "editor" ? "rounded-[24px] border border-slate-200 bg-white p-5" : ""}`}>
                {REPORTER_CHECKLIST.map((item) => {
                  const isChecked = mode === "reporter" ? true : (editorBrief.checklist?.includes(item) || false);
                  
                  return (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      {mode === "editor" ? (
                        <button 
                          type="button"
                          onClick={() => {
                            const newChecklist = (editorBrief.checklist?.includes(item))
                              ? editorBrief.checklist?.filter(i => i !== item) || []
                              : [...(editorBrief.checklist || []), item];
                            setEditorBrief({ ...editorBrief, checklist: newChecklist });
                          }}
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isChecked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-slate-50'}`}
                        >
                          {isChecked && <CheckCircle2 size={12} strokeWidth={3} />}
                        </button>
                      ) : (
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-700" />
                      )}
                      <span className={mode === "editor" && !isChecked ? "opacity-60" : ""}>{item}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 shrink-0">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                AI Story Generator
              </h2>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Story Type</label>
                <select
                  value={aiTemplate}
                  onChange={(e) => setAiTemplate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="general">सामान्य समाचार रिपोर्ट</option>
                  <option value="sports">खेल मैच / स्कोर</option>
                  <option value="weather">मौसम अपडेट</option>
                  <option value="earnings">कॉर्पोरेट आय रिपोर्ट</option>
                  <option value="seo">🔍 SEO ऑप्टिमाइज़र (पूरा लेख पेस्ट करें)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Raw Facts & Data</label>
                <textarea
                  value={aiRawData}
                  onChange={(e) => setAiRawData(e.target.value)}
                  placeholder={aiTemplate === 'seo'
                    ? 'यहाँ अपना पूरा लिखा हुआ आर्टिकल पेस्ट करें — AI इसे SEO-फ्रेंडली बना देगा...'
                    : 'स्कोर, तापमान, आँकड़े, या बुनियादी तथ्य यहाँ पेस्ट करें...'
                  }
                  className="h-48 w-full resize-y rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {aiError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {aiError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !aiRawData.trim()}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isGeneratingAi ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {isGeneratingAi ? "Generating..." : "Generate Story"}
                </button>
              </div>

              {aiGeneratedHtml && (
                <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Preview</h3>
                  <div 
                    className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 [&>p]:mb-3 [&>h2]:font-black [&>h2]:mb-3 [&>h2]:text-xl [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-lg [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3"
                    dangerouslySetInnerHTML={{ __html: aiGeneratedHtml }}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={insertAiContent}
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Insert into Article
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-xl p-2 transition ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
