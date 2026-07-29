"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";

export default function ReporterGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    photo: "",
    email: "",
    phone: "",
    bloodGroup: "",
    designation: "",
    department: "",
    state: "Delhi",
    district: "New Delhi",
    officeAddress: "Khabar24Times HQ, Parliament Street, New Delhi - 110001",
    joiningDate: new Date().toISOString().slice(0, 10),
    validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dateOfBirth: "1992-05-15",
    aadhaarLast4: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cardFlip, setCardFlip] = useState(false);

  // Crop States
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropImageName, setCropImageName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [imgRatio, setImgRatio] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fetch reporter details if in edit mode
  useEffect(() => {
    if (!editId) return;

    async function loadReporter() {
      setFetching(true);
      try {
        const res = await fetch(`/api/admin/reporters/${editId}`);
        if (!res.ok) throw new Error("Failed to load reporter details");
        const data = await res.json();
        
        setFormData({
          fullName: data.fullName,
          photo: data.photo,
          email: data.email,
          phone: data.phone,
          bloodGroup: data.bloodGroup,
          designation: data.designation,
          department: data.department,
          state: data.state,
          district: data.district,
          officeAddress: data.officeAddress,
          joiningDate: data.joiningDate.slice(0, 10),
          validTill: data.validTill.slice(0, 10),
          dateOfBirth: data.dateOfBirth.slice(0, 10),
          aadhaarLast4: data.aadhaarLast4,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load reporter profile";
        alert(errorMsg);
        router.push("/dashboard/admin/reporters/list");
      } finally {
        setFetching(false);
      }
    }

    loadReporter();
  }, [editId, router]);

  // Image Selection Handler (Triggers Cropping Modal)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo file size must be less than 5MB");
      return;
    }

    setCropImageName(file.name);
    const localUrl = URL.createObjectURL(file);
    setCropImageUrl(localUrl);
    setZoom(1);
    setPosX(0);
    setPosY(0);
    setShowCropModal(true);
    // Reset file input so same file can be re-selected if cancelled
    e.target.value = "";
  };

  // Drag Panning Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Image Load inside Crop Viewport
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgRatio(img.naturalWidth / img.naturalHeight);
  };

  // Perform Canvas Cropping & Direct Cloudinary Signature Upload with Base64 fallback
  const handleApplyCropAndUpload = async () => {
    if (!cropImageUrl) return;
    setUploading(true);
    setShowCropModal(false);

    try {
      // Re-draw viewport bounds onto high-resolution 400x500 (4:5 ratio) canvas
      const croppedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.src = cropImageUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 500;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas 2D context"));
            return;
          }

          // Background Fill
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const scale = 400 / 240; // Mapping from 240px viewport width to 400px canvas width
          const vWidth = 240;
          const vHeight = 300;

          let renderWidth = vWidth;
          let renderHeight = vHeight;

          // Determine fit aspect ratios
          if (imgRatio > vWidth / vHeight) {
            renderHeight = vHeight;
            renderWidth = vHeight * imgRatio;
          } else {
            renderWidth = vWidth;
            renderHeight = vWidth / imgRatio;
          }

          const finalW = renderWidth * zoom;
          const finalH = renderHeight * zoom;

          // Map center coordinates reflecting posX/posY translations
          const defaultX = (vWidth - finalW) / 2;
          const defaultY = (vHeight - finalH) / 2;

          const drawX = (defaultX + posX) * scale;
          const drawY = (defaultY + posY) * scale;

          ctx.drawImage(img, drawX, drawY, finalW * scale, finalH * scale);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas conversion returned null blob"));
            },
            "image/jpeg",
            0.95
          );
        };
        img.onerror = () => reject(new Error("Failed to load crop source image"));
      });

      // Generate base64 Data URL as local preview fallback
      const base64DataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(croppedBlob);
      });

      // Try uploading to Cloudinary
      try {
        const sigRes = await fetch("/api/upload-signature", { method: "POST" });
        if (!sigRes.ok) throw new Error("Signature fetch failed");
        
        const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

        const croppedFile = new File([croppedBlob], cropImageName || "reporter_cropped.jpg", {
          type: "image/jpeg",
        });

        const formDataObj = new FormData();
        formDataObj.append("file", croppedFile);
        formDataObj.append("api_key", apiKey);
        formDataObj.append("timestamp", timestamp.toString());
        formDataObj.append("signature", signature);
        formDataObj.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formDataObj,
        });

        if (!uploadRes.ok) {
          const errorJson = await uploadRes.json().catch(() => ({}));
          throw new Error(errorJson.error?.message || `Upload failed with status code ${uploadRes.status}`);
        }

        const data = await uploadRes.json();
        if (data.secure_url) {
          setFormData((prev) => ({ ...prev, photo: data.secure_url }));
          return;
        }
      } catch (uploadError) {
        console.warn("Cloudinary upload failed, falling back to local Base64 URL:", uploadError);
      }

      // Automatically fall back to local Base64 data URL if Cloudinary fails or is bypassed
      setFormData((prev) => ({ ...prev, photo: base64DataUrl }));
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Image processing failed: ${errorMsg}`);
    } finally {
      setUploading(false);
      setCropImageUrl("");
    }
  };

  // Submit Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photo) {
      alert("Please upload a reporter photo first");
      return;
    }

    setLoading(true);
    try {
      const url = editId ? `/api/admin/reporters/${editId}` : "/api/admin/reporters";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          joiningDate: new Date(formData.joiningDate).toISOString(),
          validTill: new Date(formData.validTill).toISOString(),
          dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save operation failed");

      alert(editId ? "Reporter card updated successfully!" : "New reporter card created successfully!");
      router.push("/dashboard/admin/reporters/list");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to process form";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Loading reporter details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/reporters/list"
          className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {editId ? "Edit Reporter Card" : "Card Generator"}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Configure identity parameters and review physical outputs instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Om Hari"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Photo (Cloudinary)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-file"
                />
                <label
                  htmlFor="photo-file"
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-blue-605 dark:text-blue-400 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </label>
                {formData.photo && (
                  <div className="h-9 w-9 rounded-lg border overflow-hidden shrink-0">
                    <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="reporter@khabar24times.in"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="9876543210"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Designation
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Senior Investigative Journalist"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Department
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="National News"
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Blood Group <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Select (optional) —</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Aadhaar Last 4 */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Aadhaar (Last 4 digits)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.aadhaarLast4}
                onChange={(e) => setFormData((p) => ({ ...p, aadhaarLast4: e.target.value.replace(/\D/g, "") }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="4321"
              />
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Emergency Contact Name
              </label>
              <input
                type="text"
                required
                value={formData.emergencyContact}
                onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Spouse or Parent Name"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Emergency Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.emergencyPhone}
                onChange={(e) => setFormData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="9876543211"
              />
            </div>

            {/* District beat */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                District / Reporting Beat
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. South Delhi"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                State
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Delhi"
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Joining Date
              </label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData((p) => ({ ...p, joiningDate: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Valid Till */}
            <div className="space-y-1 col-span-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Valid Till
              </label>
              <input
                type="date"
                required
                value={formData.validTill}
                onChange={(e) => setFormData((p) => ({ ...p, validTill: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Office Address */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Office Address (Appears on Card Back)
            </label>
            <textarea
              required
              rows={2}
              value={formData.officeAddress}
              onChange={(e) => setFormData((p) => ({ ...p, officeAddress: e.target.value }))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Triggers */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Card...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editId ? "Update Identity Card" : "Generate Identity Card"}
              </>
            )}
          </button>
        </form>

        {/* Live Card Preview Column */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Live Card Output</h3>
            <button
              onClick={() => setCardFlip(!cardFlip)}
              className="text-xs font-bold text-blue-605 dark:text-blue-400 hover:underline"
            >
              Flip to {cardFlip ? "Front" : "Back"}
            </button>
          </div>

          {/* 3D Flippable Card Display */}
          <div className="flex justify-center items-center py-6 perspective-1000">
            <div
              onClick={() => setCardFlip(!cardFlip)}
              className={`relative w-[337.5px] h-[212.5px] rounded-2xl shadow-2xl transition-transform duration-700 transform-style-3d cursor-pointer ${
                cardFlip ? "rotate-y-180" : ""
              }`}
            >
              {/* CARD FRONT */}
              <div className="absolute inset-0 backface-hidden bg-[#0d1b41] text-white rounded-2xl overflow-hidden shadow-inner select-none flex flex-col">
                {/* Gold Top Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#daa520]" />
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#050f2d] flex justify-between items-center px-2 z-10">
                  <span className="text-[3.5px] text-[#c8d2e1]">info@khabar24times.in</span>
                  <span className="text-[3.5px] font-bold text-[#daa520]">www.khabar24times.in</span>
                </div>
                
                <div className="flex-1 p-3 pt-4 relative">
                  {/* Header Area */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      {/* Logo Circle */}
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center border border-[#b4141e]">
                        <span className="text-[#b4141e] font-black text-[10px]">K</span>
                      </div>
                      <div>
                        <h4 className="text-[8px] font-black text-white leading-none">KHABAR24TIMES</h4>
                        <p className="text-[4px] text-[#c8d2e1]">Sehar Ki Har Badi Khabar App Tak</p>
                      </div>
                    </div>
                    {/* INDIA Badge */}
                    <div className="border border-[#daa520] bg-[#1e3264] rounded px-1.5 py-0.5">
                      <span className="text-[#daa520] font-bold text-[5px]">INDIA</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mt-2">
                    <p className="text-[#daa520] font-bold text-[5px]">OFFICIAL MEDIA IDENTITY</p>
                    <h3 className="text-white font-black text-lg leading-tight">PRESS CARD</h3>
                    <div className="w-20 h-0.5 bg-[#daa520] mt-0.5" />
                  </div>

                  {/* Body Content */}
                  <div className="mt-2 flex gap-3">
                    {/* Photo Left */}
                    <div className="relative">
                      <div className="bg-white p-0.5 w-[60px] h-[75px]">
                        {formData.photo ? (
                          <img
                            src={formData.photo}
                            alt="Reporter"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#283c64] flex items-center justify-center text-white font-bold text-lg">
                            {(formData.fullName || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Stamp Overlay */}
                      <div className="absolute -bottom-2 -right-3 w-10 h-10 opacity-90 mix-blend-screen pointer-events-none">
                        <img src="/stamp.png" alt="Stamp" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Details Right */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[11px] font-black uppercase text-white truncate max-w-[140px] leading-tight">
                        {formData.fullName || "REPORTER NAME"}
                      </h4>
                      
                      {/* Designation Pill */}
                      <div className="inline-block bg-[#b4141e] px-1.5 py-0.5 rounded text-[6px] font-bold text-white max-w-[140px] truncate uppercase">
                        {formData.designation || "REPORTER"}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[5px]">
                        <span className="font-bold text-[#daa520]">PRESS ID:</span>
                        <span className="font-bold text-[#daa520]">{editId ? formData.reporterId : "BS-2026XXXX"}</span>
                      </div>
                      
                      <div className="text-[5px] text-[#c8d2e1] truncate max-w-[140px]">
                        {formData.district || "District"}, {formData.state || "State"}
                      </div>

                      {formData.dateOfBirth && (
                        <div className="mt-1">
                          <span className="text-[#daa520] font-bold text-[4px] block">DATE OF BIRTH</span>
                          <span className="text-white font-bold text-[6px] block">
                            {new Date(formData.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div>
                          <span className="text-[#daa520] font-bold text-[4px] block">ISSUED ON</span>
                          <span className="text-white font-bold text-[5px] block truncate">
                            {formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "MM/DD/YYYY"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#daa520] font-bold text-[4px] block">CARD VALIDITY</span>
                          <span className="text-white font-bold text-[5px] block truncate">
                            {formData.validTill ? new Date(formData.validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "MM/DD/YYYY"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#28c850]" />
                        <span className="text-[#28c850] font-bold text-[7px]">ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Area */}
                  <div className="absolute bottom-4 right-3 text-right">
                    <img src="/signature.png" alt="Signature" className="h-5 ml-auto mix-blend-screen opacity-90" />
                    <p className="text-[5px] font-bold text-[#c8d2e1] mt-0.5">EDITOR-IN-CHIEF</p>
                    <p className="text-[4px] text-[#96a5b9]">Khabar24Times</p>
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#f8fafe] text-slate-800 rounded-2xl overflow-hidden shadow-inner select-none flex flex-col">
                {/* Teal Top Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#008080]" />
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#0f193c] flex justify-between items-center px-2 z-10">
                  <span className="text-[3.5px] text-[#c8d2e1]">info@khabar24times.in</span>
                  <span className="text-[3.5px] font-bold text-[#daa520]">www.khabar24times.in</span>
                </div>

                <div className="flex-1 p-3 pt-4 relative">
                  {/* Top Header & QR */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[6px] font-bold text-[#008080]">IDENTITY VERIFICATION</h4>
                      <p className="text-[10px] font-black text-[#0f193c]">Terms & Conditions</p>
                      <p className="text-[5px] text-[#5a6478] max-w-[150px] leading-tight mt-1">
                        Scan the secure QR code to verify this card from the official website.
                      </p>
                    </div>
                    {/* QR Code Box */}
                    <div className="text-center">
                      <div className="bg-white p-1 border border-slate-200 shadow-sm rounded-md w-[45px] h-[45px] flex items-center justify-center">
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[5px] text-slate-400 font-bold border border-dashed border-slate-300">QR</div>
                      </div>
                      <p className="text-[4px] font-bold text-[#008080] mt-0.5 tracking-wider">SCAN TO VERIFY</p>
                    </div>
                  </div>

                  {/* Verification Status Box */}
                  <div className="bg-[#f0fff5] border border-[#28c850] rounded px-2 py-1 flex justify-between items-center mt-2">
                    <div>
                      <p className="text-[#14963c] font-bold text-[6px]">CARD VERIFICATION PASSED</p>
                      <p className="text-[#468c5a] text-[4.5px]">Active press identity credential</p>
                    </div>
                    <div className="bg-[#28c850] text-white px-2 py-0.5 rounded-full text-[5px] font-bold">
                      ACTIVE
                    </div>
                  </div>

                  {/* Usage Guidelines */}
                  <div className="mt-2">
                    <p className="text-[5.5px] font-bold text-[#323c5a] mb-0.5">USAGE GUIDELINES</p>
                    <ul className="space-y-0.5">
                      {[
                        "This identity card remains the property of Khabar24Times.",
                        "The card holder must carry it during authorised reporting or official media duty.",
                        "Unauthorised use, copying, alteration or transfer of this card is prohibited.",
                        "If found, please return it to the issuing organisation or contact its official office."
                      ].map((item, i) => (
                        <li key={i} className="flex gap-1 items-start text-[4.5px] text-[#3c465f] leading-tight">
                          <div className="w-0.5 h-0.5 bg-[#008080] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Important Notice */}
                  <div className="absolute bottom-4 left-3 right-3 bg-[#fffceb] border border-[#daa520] rounded px-2 py-1">
                    <p className="text-[#8c6400] font-bold text-[5px]">IMPORTANT NOTICE</p>
                    <p className="text-[#645014] text-[4px] leading-tight mt-0.5">
                      A premier news publishing agency committed to delivering verified news.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/20 text-xs rounded-2xl flex items-start gap-2.5 text-blue-655 dark:text-blue-400">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Security Compliance</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                By clicking **Generate**, a unique, secure verification token is created in the database and mapped to this card. Personal numbers or sensitive credentials are never stored directly in the QR code itself.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM PHOTO CROPPER MODAL */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-slate-100 relative">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm tracking-wide text-white">
                CROP REPORTER PHOTO
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageUrl("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-850"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Viewport Area */}
            <div className="flex flex-col items-center gap-4">
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative w-[240px] h-[300px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-move shadow-inner select-none flex items-center justify-center"
              >
                <img
                  src={cropImageUrl}
                  alt="Crop Target"
                  onLoad={onImageLoad}
                  style={{
                    position: "absolute",
                    width: imgRatio > 240 / 300 ? "auto" : "100%",
                    height: imgRatio > 240 / 300 ? "100%" : "auto",
                    maxWidth: "none",
                    maxHeight: "none",
                    transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${zoom})`,
                    top: "50%",
                    left: "50%",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
                {/* Visual circular/square mask boundary */}
                <div className="absolute inset-0 border-[6px] border-slate-950/60 pointer-events-none rounded-2xl" />
                <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-2xl m-[5px]" />
              </div>

              <p className="text-[10px] text-slate-400 text-center font-medium">
                Drag photo inside the frame to adjust layout, or use controls below.
              </p>
            </div>

            {/* Sliders Control Panel */}
            <div className="space-y-4">
              {/* Zoom Slider */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[9px] text-slate-400 uppercase tracking-wider">
                  <span>Zoom Scale</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                />
              </div>

              {/* Pan X Slider */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[9px] text-slate-400 uppercase tracking-wider">
                  <span>Horizontal Pan</span>
                  <span>{posX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={posX}
                  onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                />
              </div>

              {/* Pan Y Slider */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[9px] text-slate-400 uppercase tracking-wider">
                  <span>Vertical Pan</span>
                  <span>{posY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageUrl("");
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCropAndUpload}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-500/15"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
