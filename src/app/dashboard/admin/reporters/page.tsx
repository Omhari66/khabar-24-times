"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  TrendingUp,
  ArrowRight,
  Eye,
} from "lucide-react";

interface AnalyticsData {
  counts: {
    TOTAL: number;
    ACTIVE: number;
    SUSPENDED: number;
    EXPIRED: number;
  };
  recentScans: Array<{
    id: string;
    createdAt: string;
    ipAddress: string;
    city: string;
    country: string;
    browser: string;
    os: string;
    reporter: {
      fullName: string;
      reporterId: string;
      photo: string;
    };
  }>;
  recentReporters: Array<{
    id: string;
    fullName: string;
    reporterId: string;
    photo: string;
    designation: string;
    department: string;
    status: string;
  }>;
  topScanned: Array<{
    fullName: string;
    reporterId: string;
    photo: string;
    designation: string;
    scans: number;
  }>;
  scansTrend: Array<{
    name: string;
    scans: number;
  }>;
}

export default function ReportersDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/reporters/analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Failed to load Dashboard</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Please check your database connection or reload the page.
        </p>
      </div>
    );
  }

  // Calculate dynamic coordinate mapping for custom SVG line chart
  const maxScanCount = Math.max(...data.scansTrend.map((d) => d.scans), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const points = data.scansTrend
    .map((item, idx) => {
      const x = (idx / (data.scansTrend.length - 1)) * (chartWidth - 40) + 20;
      const y = chartHeight - (item.scans / maxScanCount) * (chartHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  // Create standard SVG path coordinates for fills
  const fillPoints =
    data.scansTrend.length > 0
      ? `20,${chartHeight - 20} ${points} ${
          (data.scansTrend.length - 1) * ((chartWidth - 40) / (data.scansTrend.length - 1)) + 20
        },${chartHeight - 20}`
      : "";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-50">
          Reporters ID Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor active credentials, print cards, and trace real-time verification scans.
        </p>
      </div>

      {/* Grid: Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Reporters"
          value={data.counts.TOTAL}
          icon={Users}
          color="blue"
          sub="Identity Cards Issued"
        />
        <StatCard
          title="Active Cards"
          value={data.counts.ACTIVE}
          icon={CheckCircle}
          color="green"
          sub="Verified & Live"
        />
        <StatCard
          title="Expired Cards"
          value={data.counts.EXPIRED}
          icon={AlertTriangle}
          color="orange"
          sub="Requires Renewal"
        />
        <StatCard
          title="Suspended Cards"
          value={data.counts.SUSPENDED}
          icon={XCircle}
          color="red"
          sub="Access Revoked"
        />
      </div>

      {/* Grid: Charts & Top Scanned */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Verification Scan Trend Chart */}
        <div className="xl:col-span-2 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Verification Scans</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Scan trends over the past 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Scan Tracker
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-[180px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3,3" className="stroke-slate-200 dark:stroke-slate-800" />
              <line x1="20" y1="70" x2={chartWidth - 20} y2="70" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3,3" className="stroke-slate-200 dark:stroke-slate-800" />
              <line x1="20" y1="120" x2={chartWidth - 20} y2="120" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3,3" className="stroke-slate-200 dark:stroke-slate-800" />
              <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#94a3b8" strokeWidth="1" className="stroke-slate-300 dark:stroke-slate-700" />

              {/* Gradient Area Fill */}
              {fillPoints && (
                <polygon points={fillPoints} fill="url(#chartGrad)" />
              )}

              {/* Data Line */}
              {points && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              )}

              {/* Data Points & Values */}
              {data.scansTrend.map((item, idx) => {
                const x = (idx / (data.scansTrend.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - (item.scans / maxScanCount) * (chartHeight - 40) - 20;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fontWeight="bold" className="fill-slate-600 dark:fill-slate-400">
                      {item.scans}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {data.scansTrend.map((item, idx) => {
                const x = (idx / (data.scansTrend.length - 1)) * (chartWidth - 40) + 20;
                return (
                  <text key={idx} x={x} y={chartHeight - 4} textAnchor="middle" fontSize="7" fontWeight="bold" className="fill-slate-400 dark:fill-slate-500 uppercase">
                    {item.name}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Top Scanned Reporters */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Top Verified Cards</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Most active cards scanned by public</p>

            {data.topScanned.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <QrCode className="h-8 w-8 mb-2 stroke-slate-300 dark:stroke-slate-700" />
                <span className="text-xs font-semibold">No scan logs available</span>
              </div>
            ) : (
              <div className="space-y-4">
                {data.topScanned.map((item, idx) => {
                  const maxScans = data.topScanned[0]?.scans || 1;
                  const percent = (item.scans / maxScans) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.photo}
                            alt={item.fullName}
                            className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span className="text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                            {item.fullName}
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400">{item.scans} scans</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/admin/reporters/logs"
            className="flex items-center justify-center gap-1.5 mt-5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            All verification records
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verification Logs */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">Recent Scans</h3>
          {data.recentScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <QrCode className="h-8 w-8 mb-2 stroke-slate-300 dark:stroke-slate-700" />
              <span className="text-xs font-semibold">No scans registered yet</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentScans.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={log.reporter.photo}
                      alt={log.reporter.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{log.reporter.fullName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{log.reporter.reporterId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {log.city}, {log.country}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Reporters */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">Latest Registered</h3>
            {data.recentReporters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Users className="h-8 w-8 mb-2 stroke-slate-300 dark:stroke-slate-700" />
                <span className="text-xs font-semibold">No reporters created yet</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentReporters.map((rep) => (
                  <div key={rep.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={rep.photo}
                        alt={rep.fullName}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{rep.fullName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{rep.designation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          rep.status === "ACTIVE"
                            ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400"
                            : rep.status === "EXPIRED"
                            ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                            : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {rep.status}
                      </span>
                      <Link
                        href={`/dashboard/admin/reporters/list?query=${rep.reporterId}`}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/admin/reporters/list"
            className="flex items-center justify-center gap-1.5 mt-5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            Manage all reporters
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stats Card Helper
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "orange" | "red";
  sub: string;
}) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/25 border-blue-100/50 dark:border-blue-950/30",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/25 border-green-100/50 dark:border-green-950/30",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/25 border-orange-100/50 dark:border-orange-950/30",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/25 border-red-100/50 dark:border-red-950/30",
  };

  return (
    <div className={`p-5 rounded-3xl border ${colorMap[color]} shadow-sm flex flex-col justify-between h-32`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <Icon className="h-5 w-5 opacity-80" />
      </div>
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          {value}
        </h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-96 bg-slate-150 dark:bg-slate-800/80 rounded-md mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[260px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-[260px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    </div>
  );
}
