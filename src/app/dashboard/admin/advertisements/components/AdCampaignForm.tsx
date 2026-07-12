"use client";

import React, { useState } from "react";
import { X, Upload, Save, Loader2 } from "lucide-react";
import Image from "next/image";

interface SlotData {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface AdCampaignFormProps {
  campaign?: Record<string, unknown> | null;
  slots: SlotData[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AdCampaignForm({ campaign, slots, onClose, onSuccess }: AdCampaignFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: (campaign?.title as string) || "",
    slotId: (campaign?.slotId as string) || (slots.length > 0 ? (slots[0].id as string) : ""),
    imageUrl: (campaign?.imageUrl as string) || "",
    linkUrl: (campaign?.linkUrl as string) || "",
    scriptCode: (campaign?.scriptCode as string) || "",
    priority: (campaign?.priority as number)?.toString() || "0",
    startDate: campaign?.startDate ? new Date(campaign.startDate as string | Date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: campaign?.endDate ? new Date(campaign.endDate as string | Date).toISOString().slice(0, 10) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: (campaign?.isActive as boolean) ?? true,
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload-signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get signature");
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("api_key", apiKey);
      formDataObj.append("timestamp", timestamp.toString());
      formDataObj.append("signature", signature);
      formDataObj.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataObj,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const data = await uploadRes.json();
      setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = campaign ? `/api/admin/advertisements/campaigns/${campaign.id}` : `/api/admin/advertisements/campaigns`;
      const method = campaign ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority, 10) || 0,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save campaign");
      }

      onSuccess();
    } catch (error: unknown) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold">{campaign ? "Edit Campaign" : "New Campaign"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                placeholder="e.g. Summer Sale Banner"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold">Ad Slot</label>
              <select
                required
                value={formData.slotId}
                onChange={e => setFormData({ ...formData, slotId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                {slots.map(s => (
                  <option key={s.id as string} value={s.id as string}>
                    {s.name as string} {s.description ? `(${s.description})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Ad Format</h3>
              <p className="text-xs text-slate-500 mb-2">Provide either an Image + Link OR a Raw Script Code (e.g. AdSense).</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="https://..."
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span className="text-sm font-medium">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 w-32 h-20 relative">
                      <Image src={formData.imageUrl} alt="Ad Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Link URL</label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    placeholder="https://target-website.com"
                  />
                </div>

                <div className="flex items-center gap-4 py-2">
                  <hr className="flex-1 border-slate-200 dark:border-slate-800" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
                  <hr className="flex-1 border-slate-200 dark:border-slate-800" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Raw Script Code</label>
                  <textarea
                    value={formData.scriptCode}
                    onChange={e => setFormData({ ...formData, scriptCode: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-24 font-mono text-xs"
                    placeholder="<script async src='...'></script>"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Start Date & Time</label>
              <input
                required
                type="datetime-local"
                value={formData.startDate ? formData.startDate.slice(0, 16) : ""}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">End Date & Time</label>
              <input
                required
                type="datetime-local"
                value={formData.endDate ? formData.endDate.slice(0, 16) : ""}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Priority (Higher = Shows first)</label>
              <input
                type="number"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="space-y-2 flex items-center gap-3 mt-8">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                Campaign is Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
