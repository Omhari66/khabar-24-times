"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Folder,
  UploadCloud,
  Search,
  Trash2,
  FolderPlus,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  altText?: string;
  caption?: string;
  copyright?: string;
  photographer?: string;
  folderId?: string;
  createdAt: string;
}

interface MediaLibraryProps {
  onSelect?: (asset: MediaAsset) => void;
  selectionMode?: "single" | "multiple" | "none";
  className?: string;
}

export default function MediaLibrary({ onSelect, selectionMode = "none", className = "" }: MediaLibraryProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const folderQuery = currentFolderId ? `?folderId=${currentFolderId}` : "";
      
      const [foldersRes, assetsRes] = await Promise.all([
        fetch(`/api/admin/media${folderQuery ? folderQuery + "&type=folder" : "?type=folder"}`),
        fetch(`/api/admin/media${folderQuery}`)
      ]);

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.data || []);
      }
      
      if (assetsRes.ok) {
        const data = await assetsRes.json();
        setAssets(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch media", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // 1. Get signature
        const sigRes = await fetch("/api/upload-signature", { method: "POST" });
        if (!sigRes.ok) throw new Error("Failed to get signature");
        const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
        const cloudinaryData = await uploadRes.json();

        // 3. Save to our DB
        const saveRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
            url: cloudinaryData.secure_url,
            folderId: currentFolderId || undefined,
          }),
        });

        if (!saveRes.ok) throw new Error("Failed to save media to DB");
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
    
    setIsUploading(false);
    fetchMedia();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name:");
    if (!name) return;

    try {
      await fetch("/api/admin/media?type=folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: currentFolderId || null }),
      });
      fetchMedia();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelection = (asset: MediaAsset) => {
    if (selectionMode === "single") {
      if (onSelect) onSelect(asset);
      return;
    }
    
    const newSel = new Set(selectedAssets);
    if (newSel.has(asset.id)) {
      newSel.delete(asset.id);
    } else {
      newSel.add(asset.id);
    }
    setSelectedAssets(newSel);
    setActiveAsset(asset);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-8rem)] min-h-[600px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentFolderId(null)}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Media Library
          </button>
          {currentFolderId && (
            <>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-500">Subfolder</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64"
            />
          </div>
          
          <button onClick={createFolder} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="New Folder">
            <FolderPlus size={20} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleUpload(e.target.files)} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Grid */}
        <div 
          className={`flex-1 overflow-y-auto p-6 ${isDragging ? "bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-400" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="animate-spin text-slate-300" />
            </div>
          ) : folders.length === 0 && assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Drag and drop images here</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                Supported formats: WebP, AVIF, JPEG, PNG. Images will be automatically optimized.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folders */}
              {folders.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Folders</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {folders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors group"
                      >
                        <Folder size={24} className="text-blue-500 group-hover:text-blue-600 transition-colors" fill="currentColor" fillOpacity={0.2} />
                        <span className="text-sm font-medium truncate">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Assets */}
              {assets.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Assets</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {assets.map(asset => {
                      const isSelected = selectedAssets.has(asset.id);
                      const isActive = activeAsset?.id === asset.id;
                      
                      return (
                        <div 
                          key={asset.id} 
                          onClick={() => toggleSelection(asset)}
                          className={`relative aspect-square group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? "border-blue-500 shadow-md" : 
                            isActive ? "border-slate-400" : "border-transparent hover:border-slate-300"
                          }`}
                        >
                          <Image 
                            src={asset.url} 
                            alt={asset.filename} 
                            fill 
                            className="object-cover bg-slate-100 dark:bg-slate-800" 
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                          <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Detail Panel */}
        {activeAsset && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 overflow-y-auto p-5 hidden md:block">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Asset Details</h3>
            
            <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 border border-slate-200 dark:border-slate-700">
              <Image 
                src={activeAsset.url} 
                alt={activeAsset.filename} 
                fill 
                className="object-contain" 
              />
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Filename</span>
                <span className="block text-slate-900 dark:text-slate-200 break-all">{activeAsset.filename}</span>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Uploaded</span>
                  <span className="block text-slate-900 dark:text-slate-200">
                    {new Date(activeAsset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">File Size</span>
                  <span className="block text-slate-900 dark:text-slate-200">{formatBytes(activeAsset.fileSize)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Alt Text (SEO)</label>
                  <input type="text" defaultValue={activeAsset.altText || ""} className="w-full text-sm py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Caption</label>
                  <input type="text" defaultValue={activeAsset.caption || ""} className="w-full text-sm py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Photographer / Credit</label>
                  <input type="text" defaultValue={activeAsset.photographer || ""} className="w-full text-sm py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                
                <button className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors mt-2">
                  Save Metadata
                </button>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium transition-colors">
                  <Trash2 size={16} />
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
