"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, Loader2, X, Trash2, AlertTriangle, Users, UserCheck } from "lucide-react";

import { Role } from "@prisma/client";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  _count: { articles: number };
};

export default function UserTable({
  initialUsers,
  initialSiteUsers,
  currentUserId,
}: {
  initialUsers: User[];
  initialSiteUsers: User[];
  currentUserId: string;
}) {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [siteUsers, setSiteUsers] = useState<User[]>(initialSiteUsers);

  // Modal state — "role" | "password" | "delete" | null
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"role" | "password" | "delete" | "promote" | null>(null);

  // Form state
  const [newRole, setNewRole] = useState<Role>("REPORTER");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const openModal = (user: User, type: "role" | "password" | "delete" | "promote") => {
    setEditingUser(user);
    if (type === "role") setNewRole(user.role);
    if (type === "promote") setNewRole("REPORTER");
    if (type === "password") setNewPassword("");
    setModalType(type);
    setError("");
    setSuccessMsg("");
  };

  const closeModal = () => {
    setEditingUser(null);
    setModalType(null);
    setError("");
    setSuccessMsg("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !modalType) return;

    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    const payload: Record<string, string> = {};

    if (modalType === "role" || modalType === "promote") {
      if (editingUser.id === currentUserId && newRole !== "ADMIN") {
        setError("You cannot revoke your own ADMIN privileges.");
        setIsLoading(false);
        return;
      }
      payload.role = newRole;
    } else if (modalType === "password") {
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }
      payload.password = newPassword;
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user");
      }

      const updatedUser = await res.json();

      if (modalType === "promote") {
        // Move user from siteUsers list to team users list
        setSiteUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
        setUsers((prev) => [...prev, { ...editingUser, role: updatedUser.role }].sort((a, b) => a.email.localeCompare(b.email)));
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u))
        );
      }

      setSuccessMsg(
        modalType === "promote"
          ? `User promoted to ${updatedUser.role} successfully.`
          : `Successfully updated ${modalType === "role" ? "role" : "password"}.`
      );
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

  const handleDelete = async () => {
    if (!editingUser) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
      setSiteUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
      setSuccessMsg("User deleted successfully.");
      setTimeout(() => {
        closeModal();
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const ROLE_COLORS: Record<Role, string> = {
    ADMIN: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    EDITOR: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    REPORTER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    USER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const renderUserRow = (user: User, isSiteUser = false) => {
    const initials = (user.name || user.email)
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    const isSelf = user.id === currentUserId;

    return (
      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                {user.name || <span className="text-slate-400 italic font-normal">No name</span>}
                {isSelf && (
                  <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ROLE_COLORS[user.role]}`}>
            {user.role}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{user._count.articles}</span>
            {user._count.articles > 0 && (
              <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, (user._count.articles / 10) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {isSiteUser ? (
              /* Site users get a "Promote" button instead of role change */
              <button
                onClick={() => openModal(user, "promote")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors text-xs font-medium"
              >
                <UserCheck size={12} />
                <span>Assign Role</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => openModal(user, "role")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-xs"
                >
                  <Shield size={12} />
                  <span className="hidden sm:inline">Role</span>
                </button>
                <button
                  onClick={() => openModal(user, "password")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg transition-colors text-xs"
                >
                  <KeyRound size={12} />
                  <span className="hidden sm:inline">Password</span>
                </button>
              </>
            )}
            {!isSelf && (
              <button
                onClick={() => openModal(user, "delete")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg transition-colors text-xs"
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* ── Team Members Table ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Editorial Team</h2>
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">{users.length} member{users.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Articles</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {users.map((user) => renderUserRow(user, false))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Site Users / Subscribers Table ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Site Users &amp; Subscribers</h2>
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">{siteUsers.length} user{siteUsers.length !== 1 ? "s" : ""}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Users who signed up via Google or subscribed to newsletters. Use <strong>Assign Role</strong> to promote them to Reporter, Editor, or Admin.
        </p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Articles</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {siteUsers.map((user) => renderUserRow(user, true))}
                {siteUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No site users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {modalType && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {modalType === "role" && <><Shield size={18} className="text-blue-600" /> Update Role</>}
                {modalType === "promote" && <><UserCheck size={18} className="text-blue-600" /> Assign Role</>}
                {modalType === "password" && <><KeyRound size={18} className="text-amber-500" /> Reset Password</>}
                {modalType === "delete" && <><Trash2 size={18} className="text-rose-600" /> Delete User</>}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {modalType === "delete" ? "Permanently delete" : "Updating"}{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{editingUser.name || editingUser.email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">
                  {successMsg}
                </div>
              )}

              {modalType === "delete" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl">
                    <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-rose-800 dark:text-rose-300">
                      <p className="font-semibold mb-1">This action is irreversible.</p>
                      <p>The user will be permanently removed. Their articles will be preserved but shown as authored by &quot;News Desk&quot;.</p>
                      {editingUser._count.articles > 0 && (
                        <p className="mt-2 font-medium">
                          This user has {editingUser._count.articles} article(s) — they will remain published under the News Desk.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeModal}
                      disabled={isLoading}
                      className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading || !!successMsg}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      Delete User
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  {(modalType === "role" || modalType === "promote") ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {modalType === "promote" ? "Assign Role" : "Select New Role"}
                      </label>
                      {modalType === "promote" && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          This user will be promoted from <strong>USER</strong> to the selected role and gain access to the editorial dashboard.
                        </p>
                      )}
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as Role)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      >
                        {modalType === "role" && <option value="USER">USER</option>}
                        <option value="REPORTER">REPORTER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      {editingUser.id === currentUserId && newRole !== "ADMIN" && (
                        <p className="text-xs text-rose-500 font-medium">
                          Warning: Changing your own role will lock you out of the admin dashboard.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        required
                        minLength={6}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  )}

                  <div className="mt-6 flex gap-3 justify-end">
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
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : modalType === "promote" ? "Assign Role" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
