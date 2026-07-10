export function ArticleSummaryBox({ summary }: { summary?: string | null }) {
  if (!summary) return null;

  // Split by newlines or bullet points to create a list
  const points = summary.split(/\n|•|-/g).map(s => s.trim()).filter(Boolean);

  if (points.length === 0) return null;

  return (
    <div className="bg-slate-50 border-l-4 border-red-600 p-5 my-6 rounded-r-lg shadow-sm">
      <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
        <span>Story Highlights</span>
      </h3>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="text-slate-700 font-medium text-sm flex items-start gap-2">
            <span className="text-red-600 mt-1 flex-shrink-0">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
