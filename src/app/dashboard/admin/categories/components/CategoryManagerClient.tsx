"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Folder, FolderOpen, Loader2, X, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  _count: { articles: number };
};

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManagerClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync slug with name if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setParentId("");
    setSlugManuallyEdited(false);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || "");
    setSlugManuallyEdited(false);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      setIsLoading(false);
      return;
    }

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const body: Record<string, string | null> = {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save category");
      }

      const savedCategory = await res.json();

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === savedCategory.id ? { ...c, ...savedCategory } : c))
        );
        setSuccessMsg("Category updated successfully.");
      } else {
        setCategories((prev) =>
          [...prev, { ...savedCategory, _count: { articles: 0 } }].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        setSuccessMsg("Category created successfully.");
      }

      setTimeout(() => {
        closeModal();
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete category.");
    }
  };

  // Separate into parents and children for display
  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => !!c.parentId);

  // Available parents for the dropdown: exclude the category being edited (and its own children)
  const availableParents = categories.filter(
    (c) => c.id !== editingCategory?.id && !c.parentId // only allow root categories as parents (2-level hierarchy)
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{rootCategories.length}</div>
          <div className="text-sm text-slate-500 mt-0.5">Parent Categories</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{subCategories.length}</div>
          <div className="text-sm text-slate-500 mt-0.5">Subcategories</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {/* Root categories first */}
              {rootCategories.map((cat) => {
                const hasArticles = cat._count.articles > 0;
                const childrenOfThis = categories.filter((c) => c.parentId === cat.id);

                return (
                  <React.Fragment key={cat.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors bg-slate-50/30 dark:bg-slate-900/30">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                          {childrenOfThis.length > 0 ? <FolderOpen size={16} /> : <Folder size={16} />}
                        </div>
                        <span className="flex items-center gap-1">
                          {cat.name}
                          {childrenOfThis.length > 0 && (
                            <span className="ml-1 text-xs font-normal text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                              {childrenOfThis.length} sub
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{cat.slug}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">— Root</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          hasArticles ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {cat._count.articles} {cat._count.articles === 1 ? "article" : "articles"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={hasArticles || childrenOfThis.length > 0}
                          title={
                            hasArticles
                              ? "Cannot delete: has articles"
                              : childrenOfThis.length > 0
                              ? "Cannot delete: has subcategories"
                              : "Delete category"
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                            hasArticles || childrenOfThis.length > 0
                              ? "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                              : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                    {/* Subcategories indented */}
                    {childrenOfThis.map((child) => {
                      const childHasArticles = child._count.articles > 0;
                      return (
                        <tr key={child.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-3 text-slate-700 dark:text-slate-300 flex items-center gap-3">
                            <div className="flex items-center gap-2 pl-6">
                              <ChevronRight size={14} className="text-slate-400 shrink-0" />
                              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                                <Folder size={13} />
                              </div>
                              <span className="font-medium text-sm">{child.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">{child.slug}</td>
                          <td className="px-6 py-3">
                            <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                              {cat.name}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              childHasArticles ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {child._count.articles} {child._count.articles === 1 ? "article" : "articles"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right space-x-2">
                            <button
                              onClick={() => openEditModal(child)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(child.id)}
                              disabled={childHasArticles}
                              title={childHasArticles ? "Cannot delete: has articles" : "Delete subcategory"}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                                childHasArticles
                                  ? "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                  : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">
                  {successMsg}
                </div>
              )}

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Parent Category <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm"
                >
                  <option value="">— None (Root Category)</option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Select a parent to make this a subcategory (e.g. Auraiya under Uttar Pradesh).
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={parentId ? "e.g. Auraiya" : "e.g. Uttar Pradesh"}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="e.g. auraiya"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-mono text-sm"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  This forms the URL for the category page (e.g., /category/auraiya).
                </p>
              </div>

              <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !!successMsg}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
