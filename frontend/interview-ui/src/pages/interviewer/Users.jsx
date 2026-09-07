import { useEffect, useState } from "react";
import { authService } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Spinner, EmptyState, Alert, StatusBadge, formatDate } from "../../components/common/UI.jsx";

const emptyForm = {
  username: "",
  fullName: "",
  email: "",
  role: "CANDIDATE",
  password: ""
};

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    authService
      .listUsers()
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      username: u.Username,
      fullName: u.FullName || "",
      email: u.Email || "",
      role: u.Role,
      password: ""
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editing) {
        await authService.updateUser(editing.UserId, form);
      } else {
        await authService.createUser(form);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    const action = u.IsActive ? "deactivate" : "activate";
    if (!window.confirm(`${action === "deactivate" ? "Deactivate" : "Activate"} user "${u.Username}"?`)) {
      return;
    }
    setError("");
    try {
      if (action === "deactivate") {
        await authService.deactivateUser(u.UserId);
      } else {
        await authService.activateUser(u.UserId);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="card-header">
        <h1 className="page-title">Users</h1>
        <button className="btn" onClick={openCreate}>+ Add User</button>
      </div>

      <Alert>{error}</Alert>

      {formOpen && (
        <form className="card mt" onSubmit={handleSubmit}>
          <h2 className="card-title">{editing ? `Edit User: ${editing.Username}` : "Add User"}</h2>

          <div className="form-grid">
            {!editing && (
              <div className="field">
                <label>Username *</label>
                <input value={form.username} onChange={set("username")} required={!editing} />
              </div>
            )}
            <div className="field">
              <label>Full Name *</label>
              <input value={form.fullName} onChange={set("fullName")} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set("email")} />
            </div>
            <div className="field">
              <label>Type *</label>
              <select value={form.role} onChange={set("role")}>
                <option value="INTERVIEWER">Interviewer</option>
                <option value="CANDIDATE">Candidate</option>
              </select>
            </div>
            <div className="field">
              <label>{editing ? "New Password" : "Password *"}</label>
              <input
                type="text"
                value={form.password}
                onChange={set("password")}
                required={!editing}
                placeholder={editing ? "Leave blank to keep current password" : ""}
              />
            </div>
          </div>

          <div className="row mt">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Saving..." : editing ? "Save Changes" : "Create User"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      {users.length === 0 ? (
        <EmptyState message="No users yet." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.UserId}>
                    <td>{u.FullName || <span className="muted">-</span>}</td>
                    <td>{u.Username}</td>
                    <td>{u.Email || <span className="muted">-</span>}</td>
                    <td><span className={`role-badge role-${u.Role}`}>{u.Role}</span></td>
                    <td><StatusBadge status={u.IsActive ? "ACTIVE" : "INACTIVE"} /></td>
                    <td>{formatDate(u.CreatedAt)}</td>
                    <td className="nowrap">
                      <div className="row">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                        <button
                          className="btn btn-sm"
                          disabled={u.UserId === user?.userId}
                          onClick={() => toggleActive(u)}
                        >
                          {u.IsActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}