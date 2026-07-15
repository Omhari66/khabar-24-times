"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  RefreshCw,
  Award,
} from "lucide-react";

interface VerificationResponse {
  verified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "NOT_FOUND";
  reporter?: {
    fullName: string;
    photo: string;
    designation: string;
    department: string;
    reporterId: string;
    joiningDate: string;
    validTill: string;
    officeAddress: string;
    phone: string;
    email: string;
    bloodGroup: string;
    emergencyContact: string;
    emergencyPhone: string;
    state: string;
    district: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function VerificationPage({ params }: { params: { token: string } }) {
  const token = params.token;
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch(`/api/verify/${token}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Verification fetch error", e);
        setData({ verified: false, status: "NOT_FOUND" });
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <h2 className="text-sm font-bold tracking-wider text-slate-400">CONNECTING SECURE VERIFIER...</h2>
      </div>
    );
  }

  const status = data?.status || "NOT_FOUND";

  // CASE 1: NOT FOUND (404)
  if (status === "NOT_FOUND" || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-slate-900/60 border border-red-950/40 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="h-16 w-16 bg-red-950/40 border border-red-550/40 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-red-500 uppercase tracking-tight">
              404 Verification Failed
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              No matching credentials or reporter records were discovered for this token. This QR code may be counterfeit or expired.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
            Khabar24Times Security Center
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: SUSPENDED
  if (status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-slate-900/60 border border-red-950/50 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Pulsing red glow in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-655/10 rounded-full blur-3xl pointer-events-none" />

          <div className="h-16 w-16 bg-red-950/50 border border-red-500/40 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/20 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2 relative">
            <h1 className="text-2xl font-black text-red-500 uppercase tracking-tight">
              Reporter Suspended
            </h1>
            <p className="text-xs text-slate-350 leading-relaxed">
              This identity card has been suspended by Khabar24Times. The holder is no longer authorized to act as a representative.
            </p>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-[11px] text-slate-400 space-y-1">
            <p className="font-bold">Need assistance?</p>
            <p>Please contact Khabar24Times Compliance Center.</p>
            <p className="text-blue-400 font-semibold mt-1">compliance@khabar24times.in</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
            Khabar24Times Compliance Department
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: EXPIRED
  if (status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-slate-900/60 border border-orange-950/50 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Expired glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-655/10 rounded-full blur-3xl pointer-events-none" />

          <div className="h-16 w-16 bg-orange-950/50 border border-orange-500/40 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2 relative">
            <h1 className="text-2xl font-black text-orange-500 uppercase tracking-tight">
              Reporter Expired
            </h1>
            <p className="text-xs text-slate-350 leading-relaxed">
              This reporter identity card has expired and is no longer valid. The holder must renew their card to reactivate verification status.
            </p>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-[11px] text-slate-400 space-y-1">
            <p className="font-bold">Instructions for Holder:</p>
            <p>Please contact the Khabar24Times administration desk to issue a renewal.</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
            Khabar24Times Administration
          </div>
        </div>
      </div>
    );
  }

  // CASE 4: ACTIVE (Verified)
  const rep = data.reporter!;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 select-none relative overflow-hidden">
      {/* Premium glowing background dots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphic Verification Card */}
      <div className="max-w-md w-full bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-slideUp">
        {/* Shine Card Highlight */}
        <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Verification Status Badge */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5 pb-4 border-b border-white/5">
          <div className="h-16 w-16 bg-green-950/40 border border-green-550/40 text-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 animate-pulse">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/25 px-3 py-1 rounded-full text-green-400 text-xs font-bold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              Verified Reporter
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              Verified by Khabar24Times
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center sm:flex-row gap-5">
          <img
            src={rep.photo}
            alt={rep.fullName}
            className="h-28 w-28 rounded-2xl object-cover border-2 border-white/10 shadow-2xl shrink-0"
          />
          <div className="text-center sm:text-left space-y-1.5 min-w-0">
            <h2 className="text-xl font-black tracking-tight text-white uppercase truncate">
              {rep.fullName}
            </h2>
            <p className="text-xs font-bold text-yellow-500/90">{rep.designation}</p>
            <p className="text-[11px] text-slate-400 font-semibold">{rep.department} Department</p>
            <div className="inline-block font-mono text-[10px] bg-slate-950/50 px-2.5 py-1 rounded-lg text-blue-400 font-bold tracking-wide border border-white/5">
              ID: {rep.reporterId}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3.5 pt-2 border-t border-white/5 text-xs">
          {/* Validity details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Joined</span>
                <span className="font-semibold">
                  {new Date(rep.joiningDate).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500/80" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Valid Till</span>
                <span className="font-semibold text-yellow-500/90">
                  {new Date(rep.validTill).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Blood group */}
          <div className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl flex items-center gap-3">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Blood Group</span>
              <span className="font-semibold">{rep.bloodGroup}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold truncate">Phone: +91 {rep.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold truncate">Email: {rep.email}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">HQ Office Address</span>
                <p className="text-[11px] text-slate-300 leading-snug">{rep.officeAddress}</p>
              </div>
            </div>
          </div>

          {/* Emergency Details */}
          <div className="p-4 bg-slate-950/35 border border-white/5 rounded-2xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
              Emergency Contact details
            </span>
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold">{rep.emergencyContact}</span>
              <span className="font-mono font-bold text-slate-300">+91 {rep.emergencyPhone}</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 pt-3">
          <span>Card Issue: {new Date(rep.createdAt).toLocaleDateString("en-IN")}</span>
          <span>Last Sync: {new Date(rep.updatedAt).toLocaleDateString("en-IN")}</span>
        </div>
      </div>

      {/* Center Footer logo */}
      <div className="mt-8 text-center text-xs space-y-1">
        <p className="font-black tracking-widest text-slate-400 uppercase">KHABAR24TIMES</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">
          Live Verification Service Platform
        </p>
      </div>
    </div>
  );
}
