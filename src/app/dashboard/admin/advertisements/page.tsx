"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Code, Eye, Calendar } from "lucide-react";
import { AdCampaignForm } from "./components/AdCampaignForm";

export default function AdvertisementsPage() {
  const [slots, setSlots] = useState<{id: string; name: string; [key: string]: unknown}[]>([]);
  const [campaigns, setCampaigns] = useState<{id: string; title: string; imageUrl?: string; startDate: string; endDate: string; isActive: boolean; slot: {name: string}; _count?: {impressions: number}; [key: string]: unknown}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Record<string, unknown> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, campaignsRes] = await Promise.all([
        fetch("/api/admin/advertisements/slots"),
        fetch("/api/admin/advertisements/campaigns")
      ]);
      if (slotsRes.ok) setSlots(await slotsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad campaign?")) return;
    try {
      await fetch(`/api/admin/advertisements/campaigns/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSlot = async () => {
    const name = prompt("Enter slot name (e.g. homepage-top-banner):");
    if (!name) return;
    try {
      await fetch("/api/admin/advertisements/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Advertisements</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage ad slots and campaigns across your news portal.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateSlot}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl transition"
          >
            Add Slot
          </button>
          <button 
            onClick={() => { setEditingCampaign(null); setIsFormOpen(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition shadow-sm shadow-blue-600/20"
          >
            <Plus size={18} /> New Campaign
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No campaigns found. Create a new campaign to get started.
                    </td>
                  </tr>
                ) : campaigns.map(c => {
                  const isImage = !!c.imageUrl;
                  const isActiveDate = new Date(c.startDate) <= new Date() && new Date(c.endDate) > new Date();
                  const trulyActive = c.isActive && isActiveDate;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.title}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                          {isImage ? <><ImageIcon size={14} className="text-blue-500" /> Image</> : <><Code size={14} className="text-amber-500" /> Script</>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {c.slot?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {trulyActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Eye size={12} className="inline mr-1 text-slate-400" /> {c._count?.impressions || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setEditingCampaign(c); setIsFormOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition ml-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <AdCampaignForm 
          campaign={editingCampaign} 
          slots={slots} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  );
}
