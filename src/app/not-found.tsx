import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import SiteFooter from "./(public)/components/SiteFooter";
import SiteHeader from "./(public)/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="w-full rounded-2xl sm:rounded-[36px] border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg p-6 sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-white">
            <AlertTriangle size={32} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            पेज नहीं मिला
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            यह पेज यहां उपलब्ध नहीं है।
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600">
            संभव है कि लेख स्थानांतरित हो गया हो, लिंक पुराना हो या पता गलत हो।
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            मुखपृष्ठ पर लौटें
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
