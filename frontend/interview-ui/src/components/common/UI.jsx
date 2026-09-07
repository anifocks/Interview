export function Alert({ type = "error", children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}

export function Spinner() {
  return <div className="spinner">Loading...</div>;
}

export function StatusBadge({ status }) {
  const cls = status ? String(status).toLowerCase().replace("_", "-") : "";
  return <span className={`status-badge status-${cls}`}>{status}</span>;
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export function EmptyState({ message }) {
  return <div className="empty-state">{message}</div>;
}