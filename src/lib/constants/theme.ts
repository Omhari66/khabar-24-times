export function getBadgeColor(label: string): string {
  const normalizedLabel = label.toLowerCase().trim();

  switch (normalizedLabel) {
    case "breaking":
    case "breaking news":
      return "bg-red-600 text-white";
    case "trending":
      return "bg-amber-500 text-white";
    case "editor's pick":
    case "editors pick":
    case "curated":
      return "bg-blue-600 text-white";
    case "feature":
    case "featured":
      return "bg-emerald-600 text-white";
    default:
      // Neutral fallback for standard categories (Politics, Sports, etc.)
      return "bg-slate-700 text-white";
  }
}

export function getLabelColor(label: string): string {
  const normalizedLabel = label.toLowerCase().trim();

  switch (normalizedLabel) {
    case "breaking":
    case "breaking news":
      return "text-red-600";
    case "trending":
      return "text-amber-500";
    case "editor's pick":
    case "editors pick":
    case "curated":
      return "text-blue-600";
    case "feature":
    case "featured":
      return "text-emerald-600";
    default:
      return "text-slate-700";
  }
}
