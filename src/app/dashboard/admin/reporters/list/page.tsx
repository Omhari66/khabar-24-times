"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Trash2,
  Download,
  Upload,
  Calendar,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { generateReporterCardPdf } from "@/lib/utils/pdf-generator"; // client-side PDF trigger

interface Reporter {
  id: string;
  uuid: string;
  reporterId: string;
  fullName: string;
  photo: string;
  email: string;
  phone: string;
  bloodGroup: string;
  designation: string;
  department: string;
  state: string;
  district: string;
  officeAddress: string;
  joiningDate: string;
  validTill: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  dateOfBirth: string;
  aadhaarLast4: string;
  emergencyContact: string;
  emergencyPhone: string;
  qrToken: string;
}

export default function ReportersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get("query") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [dept, setDept] = useState(searchParams.get("department") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const limit = 8;

  // Selected for Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Preview Modal
  const [previewReporter, setPreviewReporter] = useState<Reporter | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [cardFlip, setCardFlip] = useState(false); // 3D Card rotation

  // Renew Modal
  const [renewReporter, setRenewReporter] = useState<Reporter | null>(null);
  const [newValidTill, setNewValidTill] = useState("");
  const [renewing, setRenewing] = useState(false);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Trigger Data Fetch
  const fetchReporters = async () => {
    setLoading(true);
    setError(null);
    try {
      const qParams = new URLSearchParams();
      if (search) qParams.set("query", search);
      if (status) qParams.set("status", status);
      if (dept) qParams.set("department", dept);
      if (state) qParams.set("state", state);
      qParams.set("page", page.toString());
      qParams.set("limit", limit.toString());

      const res = await fetch(`/api/admin/reporters?${qParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load reporters list");
      const data = await res.json();
      setReporters(data.reporters);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporters();
    // Update browser URL query strings
    const urlParams = new URLSearchParams();
    if (search) urlParams.set("query", search);
    if (status) urlParams.set("status", status);
    if (dept) urlParams.set("department", dept);
    if (state) urlParams.set("state", state);
    urlParams.set("page", page.toString());
    router.replace(`/dashboard/admin/reporters/list?${urlParams.toString()}`);
  }, [search, status, dept, state, page]);

  // Bulk Operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(reporters.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} reporter card(s)? This action is permanent.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/reporters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Bulk deletion failed");
      setSelectedIds([]);
      fetchReporters();
      alert("Selected reporter card(s) deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to execute bulk deletion");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Status Toggles
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reporters/${id}/status`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to change card status");
      fetchReporters();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Card Renewal
  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewReporter || !newValidTill) return;

    setRenewing(true);
    try {
      const res = await fetch(`/api/admin/reporters/${renewReporter.id}/renew`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validTill: new Date(newValidTill).toISOString() }),
      });

      if (!res.ok) throw new Error("Renewal failed");
      setRenewReporter(null);
      setNewValidTill("");
      fetchReporters();
      alert("Reporter card renewed successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to renew card");
    } finally {
      setRenewing(false);
    }
  };

  // Export Spreadsheet
  const handleExport = () => {
    const qParams = new URLSearchParams();
    if (search) qParams.set("query", search);
    if (status) qParams.set("status", status);
    if (dept) qParams.set("department", dept);
    if (state) qParams.set("state", state);
    
    window.open(`/api/admin/reporters/export-excel?${qParams.toString()}`, "_blank");
  };

  // Import CSV
  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("/api/admin/reporters/import-csv", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to import CSV");

      setImportResult(json);
      fetchReporters();
      setImportFile(null);
    } catch (err: any) {
      alert(err.message || "CSV Import Failed");
    } finally {
      setImporting(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async (reporter: Reporter) => {
    setDownloadingPdf(true);
    try {
      const siteUrl = window.location.origin;
      const pdfBytes = await generateReporterCardPdf(
        {
          ...reporter,
          joiningDate: new Date(reporter.joiningDate),
          validTill: new Date(reporter.validTill),
        },
        siteUrl
      );

      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `BS_Card_${reporter.reporterId}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to render PDF card file");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Reporter Registries</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Create, edit, suspend, renew, and print digital/physical cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Bulk Import CSV
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </button>
          <Link
            href="/dashboard/admin/reporters/generate"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-blue-500/10"
          >
            + Add Reporter
          </Link>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>

        {/* Department */}
        <input
          type="text"
          placeholder="Filter Department"
          value={dept}
          onChange={(e) => {
            setDept(e.target.value);
            setPage(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none w-36"
        />

        {/* State */}
        <input
          type="text"
          placeholder="Filter State"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none w-36"
        />

        {/* Clear Filters */}
        {(search || status || dept || state) && (
          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              setDept("");
              setState("");
              setPage(1);
            }}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 rounded-xl animate-fadeIn">
          <span className="text-xs font-bold text-red-700 dark:text-red-400">
            {selectedIds.length} reporter(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {bulkDeleting ? "Deleting..." : "Bulk Delete"}
          </button>
        </div>
      )}

      {/* Main Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Loading registered reporters...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : reporters.length === 0 ? (
          <div className="py-24 text-center text-slate-400 space-y-2">
            <SlidersHorizontal className="h-8 w-8 mx-auto stroke-slate-300 dark:stroke-slate-700" />
            <p className="text-xs font-semibold">No reporter cards match these criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={reporters.length > 0 && selectedIds.length === reporters.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="p-4">Reporter Details</th>
                  <th className="p-4">ID / QR</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Card Status</th>
                  <th className="p-4">Valid Till</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {reporters.map((rep) => {
                  const isSelected = selectedIds.includes(rep.id);
                  return (
                    <tr
                      key={rep.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors ${
                        isSelected ? "bg-blue-50/10 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Selection Box */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(rep.id, e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                      </td>

                      {/* Photo & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rep.photo}
                            alt={rep.fullName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                          />
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100">
                              {rep.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              {rep.designation} • {rep.department}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID / QR Token */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {rep.reporterId}
                        </span>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          Token: {rep.qrToken}
                        </p>
                      </td>

                      {/* Location Details */}
                      <td className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">{rep.district}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{rep.state}</p>
                      </td>

                      {/* Status Badges */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(rep.id)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all hover:scale-105 active:scale-95 ${
                            rep.status === "ACTIVE"
                              ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50"
                              : rep.status === "EXPIRED"
                              ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200/50"
                              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50"
                          }`}
                          title="Click to toggle Status"
                        >
                          {rep.status}
                        </button>
                      </td>

                      {/* Valid Till Date */}
                      <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {new Date(rep.validTill).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Operations */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Card */}
                          <button
                            onClick={() => {
                              setPreviewReporter(rep);
                              setCardFlip(false);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
                            title="Preview ID Card"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Renew Card */}
                          <button
                            onClick={() => {
                              setRenewReporter(rep);
                              setNewValidTill(rep.validTill.split("T")[0]);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
                            title="Renew Card"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>

                          {/* Edit Form Link */}
                          <Link
                            href={`/dashboard/admin/reporters/generate?edit=${rep.id}`}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                            title="Edit Profile"
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Showing {reporters.length} of {total} reporters
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RENEW MODAL */}
      {renewReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Renew Identity Card
              </h3>
              <button
                onClick={() => setRenewReporter(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Extending validity for **{renewReporter.fullName}** ({renewReporter.reporterId}). This resets status to **ACTIVE**.
            </p>
            <form onSubmit={handleRenew} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  New Validity Date
                </label>
                <input
                  type="date"
                  required
                  value={newValidTill}
                  onChange={(e) => setNewValidTill(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={renewing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {renewing ? "Renewing..." : "Confirm Renewal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Bulk CSV Reporter Import
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                  setImportFile(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!importResult ? (
              <form onSubmit={handleImportCsv} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload a standard CSV file with headers. Required columns: <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">fullName</code>, <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">email</code>, <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">phone</code>, <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">designation</code>, and <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">department</code>.
                </p>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-blue-650 dark:text-blue-400 block">
                      {importFile ? importFile.name : "Select CSV Spreadsheet File"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Max size 2MB</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {importing ? "Importing records..." : "Trigger Bulk Import"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Successfully processed: {importResult.successCount} reporters.
                </div>
                {importResult.failCount > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-red-500">Failed rows ({importResult.failCount}):</p>
                    <div className="max-h-32 overflow-y-auto text-[10px] font-mono p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl space-y-1 text-slate-500">
                      {importResult.errors.map((err: string, i: number) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResult(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D PREMIUM CARD PREVIEW MODAL */}
      {previewReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Print Card Preview
              </h3>
              <button
                onClick={() => setPreviewReporter(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3D Flippable Card Container */}
            <div className="flex justify-center items-center py-6 perspective-1000">
              <div
                onClick={() => setCardFlip(!cardFlip)}
                className={`relative w-[337.5px] h-[212.5px] rounded-2xl shadow-2xl transition-transform duration-700 transform-style-3d cursor-pointer ${
                  cardFlip ? "rotate-y-180" : ""
                }`}
              >
                {/* CARD FRONT */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border-2 border-slate-850 p-4 flex flex-col justify-between overflow-hidden shadow-inner select-none">
                  {/* Decorative gold background gradient band */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />

                  {/* Header Line */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest text-slate-100">
                        KHABAR24TIMES
                      </h4>
                      <p className="text-[6px] font-bold text-yellow-500 uppercase tracking-widest">
                        PRESS IDENTITY CARD
                      </p>
                    </div>
                    <span className="text-[5px] bg-yellow-500 text-slate-950 font-bold px-1 rounded-full">
                      CR80 SIZE
                    </span>
                  </div>

                  {/* Details section */}
                  <div className="flex gap-3 my-auto items-center">
                    <img
                      src={previewReporter.photo}
                      alt={previewReporter.fullName}
                      className="w-[72px] h-[90px] object-cover rounded border border-slate-700 shadow-lg"
                    />
                    <div className="space-y-1 flex-1">
                      <h5 className="text-[11px] font-black tracking-wide text-white leading-tight uppercase">
                        {previewReporter.fullName}
                      </h5>
                      <p className="text-[7.5px] font-bold text-slate-400">
                        {previewReporter.designation}
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[6.5px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block font-bold">DEPT:</span>
                          <span className="font-semibold">{previewReporter.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold">BLOOD GRP:</span>
                          <span className="font-semibold">{previewReporter.bloodGroup}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold">REPORTER ID:</span>
                          <span className="font-mono font-bold text-yellow-500">
                            {previewReporter.reporterId}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold">VALID TILL:</span>
                          <span className="font-bold">
                            {new Date(previewReporter.validTill).toLocaleDateString("en-IN", {
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer scan link */}
                  <div className="flex justify-between items-center border-t border-slate-850 pt-1 text-[5px] text-slate-500">
                    <span>STATUS: <span className="font-bold text-green-500">{previewReporter.status}</span></span>
                    <span className="font-bold text-yellow-500/80">CLICK CARD TO FLIP</span>
                  </div>
                </div>

                {/* CARD BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border-2 border-slate-850 p-4 flex flex-col justify-between overflow-hidden shadow-inner select-none">
                  {/* Decorative backdrop */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                  <div>
                    <h5 className="text-[7.5px] font-black text-yellow-500 tracking-wider mb-1">
                      TERMS & CONDITIONS
                    </h5>
                    <ul className="text-[5.5px] space-y-0.5 text-slate-300 list-disc pl-2.5 font-medium leading-relaxed">
                      <li>This identity card is strictly non-transferable.</li>
                      <li>Holders are authorized to query details on behalf of the CMS.</li>
                      <li>Scan front QR code to verify active credentials online.</li>
                      <li>If found, please return to office address immediately.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-[5.5px]">
                    <div>
                      <span className="text-yellow-500 font-bold block">EMERGENCY CONTACT</span>
                      <span className="text-slate-350">{previewReporter.emergencyContact}</span>
                      <span className="text-slate-350 block font-mono font-bold">
                        +91 {previewReporter.emergencyPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-yellow-500 font-bold block">HEADQUARTERS</span>
                      <p className="text-slate-400 leading-snug line-clamp-2">
                        {previewReporter.officeAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[5.5px] text-slate-500 border-t border-slate-850/60 pt-1 mt-1">
                    <span className="font-bold text-yellow-500">www.khabar24times.in</span>
                    <span>BACK SIDE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print/Download triggers */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPdf(previewReporter)}
                disabled={downloadingPdf}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                <Download className="h-4 w-4" />
                {downloadingPdf ? "Generating..." : "Download PDF Card"}
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Print Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
