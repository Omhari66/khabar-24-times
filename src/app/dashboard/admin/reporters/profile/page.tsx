"use client";

import { useSession } from "next-auth/react";
import { User, Shield, Mail, Key, AlertCircle } from "lucide-react";

export default function ReporterProfilePage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
        <p className="text-xs text-slate-500 mt-2">Loading active session...</p>
      </div>
    );
  }

  const { name, email, role, image } = session.user;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Administrator Profile</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Viewing security details of the active newsroom administrator.
        </p>
      </div>

      <div className="bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-850">
          {image ? (
            <img
              src={image}
              alt={name || "Admin"}
              className="h-20 w-20 rounded-full object-cover border-2 border-blue-500/20 shadow-md"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border-2 border-blue-500/20 shadow-md">
              <User className="h-10 w-10" />
            </div>
          )}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-55">
              {name || "Administrator"}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-0.5 w-fit mx-auto sm:mx-0 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100/50">
              <Shield className="h-3 w-3" />
              SYSTEM ROLE: {role || "ADMIN"}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300">Identity Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                  Email Address
                </span>
                <span className="font-semibold text-slate-755 dark:text-slate-200">{email}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-3">
              <Key className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                  Access Level
                </span>
                <span className="font-semibold text-slate-755 dark:text-slate-200">Full System Read/Write</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit compliance notice */}
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/20 text-xs rounded-2xl flex items-start gap-2.5 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="font-bold">Security & Audit Compliance</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every action you perform within the Reporter identity system—including adding reporters, modifying card parameters, renewing expirations, or toggling suspensions—is strictly compiled in the system audit logs under your active session ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
