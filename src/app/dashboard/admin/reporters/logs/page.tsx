"use client";

import { useEffect, useState } from "react";
import { History, RefreshCw, AlertCircle, Laptop, Smartphone, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ScanLog {
  id: string;
  createdAt: string;
  ipAddress: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  reporter: {
    fullName: string;
    reporterId: string;
    photo: string;
    designation: string;
    department: string;
  };
}

export default function VerificationLogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reporters/logs?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load scan logs");
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load scan logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase() === "mobile") return Smartphone;
    if (device.toLowerCase() === "desktop") return Laptop;
    return HelpCircle;
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Verification Logs</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Real-time tracking of public QR code scan events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-350 rounded-xl transition-colors"
          title="Refresh Logs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Loading verification logs...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center text-slate-400 space-y-2">
            <History className="h-8 w-8 mx-auto stroke-slate-300 dark:stroke-slate-700" />
            <p className="text-xs font-semibold">No QR scan events registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="p-4">Reporter Name</th>
                  <th className="p-4">Scan Date & Time</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Geo Location</th>
                  <th className="p-4">Device Info</th>
                  <th className="p-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {logs.map((log) => {
                  const DeviceIcon = getDeviceIcon(log.device);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      {/* Photo & Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={log.reporter.photo}
                            alt={log.reporter.fullName}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100">
                              {log.reporter.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              {log.reporter.reporterId} • {log.reporter.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>

                      {/* IP */}
                      <td className="p-4 font-mono font-bold text-slate-655 dark:text-slate-350">
                        {log.ipAddress}
                      </td>

                      {/* Geo */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-850 dark:text-slate-200">
                          {log.city || "Unknown City"}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px]">
                          {log.country || "Unknown Country"}
                        </span>
                      </td>

                      {/* User Agent */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-4 w-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {log.browser}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                              on {log.os}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Profile Link */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/admin/reporters/list?query=${log.reporter.reporterId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-655 dark:text-blue-400 hover:underline"
                        >
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Total logs recorded: {total}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
