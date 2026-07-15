"use client";

import { useEffect, useState } from "react";
import { Settings, Save, ShieldCheck, RefreshCw } from "lucide-react";

export default function ReporterSettingsPage() {
  const [settings, setSettings] = useState({
    defaultValidityMonths: 12,
    orgName: "Khabar24Times",
    websiteUrl: "www.khabar24times.in",
    officeAddress: "Khabar24Times Headquarters, Parliament Street, New Delhi - 110001",
    supportEmail: "compliance@khabar24times.in",
    emergencyPhone: "9876543210",
    termsText: "1. This identity card remains the property of Khabar24Times.\n2. Holders are authorized to collect news on behalf of Khabar24Times.\n3. Any misuse of this card results in immediate suspension.",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bs_reporter_settings");
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("bs_reporter_settings", JSON.stringify(settings));
      setSaving(false);
      alert("Settings saved successfully.");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">System Settings</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Configure default values and terms printed on identity cards.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            General Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Validity */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Default Validity Period
              </label>
              <select
                value={settings.defaultValidityMonths}
                onChange={(e) => setSettings((p) => ({ ...p, defaultValidityMonths: parseInt(e.target.value, 10) }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
              </select>
            </div>

            {/* Org Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={settings.orgName}
                onChange={(e) => setSettings((p) => ({ ...p, orgName: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Website Domain (On Card)
              </label>
              <input
                type="text"
                required
                value={settings.websiteUrl}
                onChange={(e) => setSettings((p) => ({ ...p, websiteUrl: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Compliance/Support Email
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Office Address */}
          <div className="space-y-1 text-xs">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Default Headquarters Address
            </label>
            <textarea
              required
              rows={2}
              value={settings.officeAddress}
              onChange={(e) => setSettings((p) => ({ ...p, officeAddress: e.target.value }))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-650 dark:text-blue-400" />
            Identity Card Backside Text
          </h3>

          <div className="space-y-4 text-xs">
            {/* Terms */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Custom Terms of Use (Up to 5 lines)
              </label>
              <textarea
                required
                rows={4}
                value={settings.termsText}
                onChange={(e) => setSettings((p) => ({ ...p, termsText: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
              />
            </div>

            {/* Emergency Phone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Default Emergency Hotline Number
              </label>
              <input
                type="tel"
                required
                value={settings.emergencyPhone}
                onChange={(e) => setSettings((p) => ({ ...p, emergencyPhone: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-605 hover:bg-blue-700 text-white py-3 rounded-2xl text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving preferences..." : "Save Config Preferences"}
        </button>
      </form>
    </div>
  );
}
