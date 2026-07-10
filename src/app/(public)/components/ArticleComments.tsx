"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addComment } from "@/lib/actions/article-actions";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";

type CommentProp = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
};

export default function ArticleComments({
  articleId,
  slug,
  comments,
}: {
  articleId: string;
  slug: string;
  comments: CommentProp[];
}) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await addComment(articleId, content, slug);
      if (res.success) {
        setContent("");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Failed to post comment");
      } else {
        setError("Failed to post comment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 border-t border-structural bg-surface-muted/30">
      <h3 className="text-xl font-condensed font-bold uppercase tracking-widest text-text-primary mb-6 flex items-center gap-2">
        Join the Conversation <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
      </h3>
      
      {status === "loading" ? (
        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
      ) : status === "authenticated" ? (
        <form onSubmit={handleSubmit} className="bg-white p-4 border border-structural mb-8 shadow-sm">
          <div className="flex gap-3 mb-3">
             {session?.user?.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full shadow-sm" />
                </>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 shrink-0">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y"
                  required
                />
              </div>
          </div>
          <div className="flex justify-between items-center">
            {error ? <span className="text-rose-500 text-xs ml-11">{error}</span> : <div />}
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-primary text-white px-5 py-2 text-xs font-condensed font-bold uppercase tracking-widest hover:bg-primary-dark transition disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 border border-structural mb-8 text-center flex flex-col items-center">
          <MessageSquare size={32} className="text-slate-300 mb-3" />
          <p className="text-sm text-text-secondary mb-4">You must be logged in to participate in the discussion.</p>
          <div className="flex flex-wrap justify-center gap-3">
             <Link href="/login" className="inline-block border-2 border-primary text-primary px-6 py-2.5 text-xs font-condensed font-bold uppercase tracking-widest hover:bg-primary/5 transition">
              Sign In
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
             {comment.user.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comment.user.image} alt="Profile" className="h-10 w-10 rounded-full shadow-sm shrink-0" />
                </>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 shrink-0">
                  {comment.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 bg-white p-4 border border-structural shadow-sm">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-sm text-text-primary">{comment.user.name || "Anonymous"}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(comment.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
