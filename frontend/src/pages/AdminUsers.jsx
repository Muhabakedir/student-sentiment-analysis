import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus, Trash2, Shield,
  Crown, ToggleLeft, ToggleRight, KeyRound, X, AlertCircle,
} from "lucide-react";
import API from "../config";

export default function AdminUsers() {
  const { token, isSuperAdmin } = useAuth();
  const [users, setUsers]             = useState([]);
  const [resetRequests, setResetRequests] = useState([]);  // pending reset requests
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState({ email: "", is_superadmin: false });
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [adding, setAdding]           = useState(false);

  // Set password modal
  const [setPassModal, setSetPassModal] = useState(null);  // { id, email }
  const [settingPass, setSettingPass]   = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
    else                    { setError(msg);   setTimeout(() => setError(""),   4000); }
  };

  const fetchAll = async () => {
    try {
      const [usersRes, resetRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/reset-requests`, { headers }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (resetRes.ok) setResetRequests(await resetRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const r = await fetch(`${API}/api/admin/users`, {
        method: "POST", headers,
        body: JSON.stringify({ email: form.email.trim(), is_superadmin: form.is_superadmin }),
      });
      if (r.ok) {
        flash("success", `Admin ${form.email} created.`);
        setForm({ email: "", is_superadmin: false });
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to create admin.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
    finally { setAdding(false); }
  };

  const handleToggle = async (id, email) => {
    try {
      const r = await fetch(`${API}/api/admin/users/${id}/toggle`, { method: "PATCH", headers });
      if (r.ok) {
        const d = await r.json();
        flash("success", `${email} is now ${d.is_active ? "active" : "inactive"}.`);
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to update.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Permanently delete admin ${email}?`)) return;
    try {
      const r = await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers });
      if (r.ok) { flash("success", `${email} deleted.`); fetchAll(); }
      else { const d = await r.json(); flash("error", d.detail || "Failed to delete."); }
    } catch { flash("error", "Cannot connect to backend."); }
  };

  const handleSetPassword = async () => {
    setSettingPass(true);
    try {
      const r = await fetch(`${API}/api/admin/users/${setPassModal.id}/set-password`, {
        method: "PATCH", headers,
      });
      if (r.ok) {
        const d = await r.json();
        flash("success", d.message);
        setSetPassModal(null);
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to trigger reset.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
    finally { setSettingPass(false); }
  };

  // Check if a user has a pending reset request
  const hasPendingReset = (email) => resetRequests.some(r => r.email === email);

  if (!isSuperAdmin) {
    return (
      <div className="bg-white dark:bg-black rounded-2xl p-10 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
        <Crown size={32} className="mx-auto text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">Superadmin Access Required</p>
        <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Only the superadmin can manage administrator accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Pending reset requests banner */}
      {resetRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {resetRequests.length} pending password reset request{resetRequests.length > 1 ? "s" : ""}
              </p>
              <div className="mt-2 space-y-1">
                {resetRequests.map((r, i) => {
                  const user = users.find(u => u.email === r.email);
                  return (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        <span className="font-medium">{r.email}</span> requested at {new Date(r.requested).toLocaleString()}
                      </p>
                      {user && (
                        <button
                          onClick={() => { setSetPassModal({ id: user.id, email: user.email }); }}
                          className="text-xs px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800 text-amber-700 dark:text-amber-300 font-medium transition-colors shrink-0 border border-amber-200 dark:border-amber-800"
                        >
                          Send Reset Link
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Form */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-5 flex items-center gap-2">
          <UserPlus size={16} className="text-violet-500 dark:text-gray-500" />
          Add New Admin
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="newadmin@university.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-600">
            An activation link will be emailed to this address. The new admin sets their own password.
          </p>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div onClick={() => setForm({ ...form, is_superadmin: !form.is_superadmin })}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.is_superadmin ? "bg-yellow-400" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_superadmin ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Crown size={14} className={form.is_superadmin ? "text-yellow-500" : "text-gray-400"} />
              Grant superadmin privileges
            </span>
          </label>
          <button type="submit" disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            <UserPlus size={15} />
            {adding ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {error   && <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2">{error}</p>}
        {success && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">{success}</p>}
      </div>

      {/* Admin List */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-300 flex items-center gap-2">
            <Shield size={15} className="text-violet-500 dark:text-gray-500" />
            All Admin Accounts
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-lg">
            {users.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-600">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map(user => (
              <div key={user.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${user.is_superadmin ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"}`}>
                    {user.is_superadmin ? <Crown size={15} /> : user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate">{user.email}</p>
                      {user.is_superadmin && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Superadmin
                        </span>
                      )}
                      {user.status === "pending" && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Pending Activation
                        </span>
                      )}
                      {hasPendingReset(user.email) && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1">
                          <AlertCircle size={10} /> Reset requested
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-600">Added {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.is_active
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-600"
                  }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>

                  {/* Set password */}
                  <button
                    onClick={() => { setSetPassModal({ id: user.id, email: user.email }); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Trigger password reset"
                  >
                    <KeyRound size={15} />
                  </button>

                  {/* Toggle active */}
                  <button onClick={() => handleToggle(user.id, user.email)}
                    className="p-2 rounded-xl text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={user.is_active ? "Deactivate" : "Activate"}>
                    {user.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(user.id, user.email)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Delete admin">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Set Password Modal */}
      {setPassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                  <KeyRound size={15} className="text-violet-500 dark:text-gray-500" />
                  Trigger Password Reset
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5">{setPassModal.email}</p>
              </div>
              <button onClick={() => setSetPassModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                  Send password reset link?
                </p>
                <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">
                  A secure reset link will be emailed to <strong>{setPassModal.email}</strong>. The link expires in 15 minutes.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSetPassModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSetPassword} disabled={settingPass}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                  {settingPass ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
