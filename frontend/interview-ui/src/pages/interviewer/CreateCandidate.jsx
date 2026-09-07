import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { candidateService } from "../../services/candidateService.js";
import { Alert, Spinner, EmptyState } from "../../components/common/UI.jsx";

export default function CreateCandidate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    candidateName: "",
    email: "",
    phone: "",
    position: "",
    createLogin: false,
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await candidateService.create(form);
      navigate(`/interviewer/candidates/${res.data.CandidateId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="page-title">Add Candidate</h1>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>

        <div className="form-grid">
          <div className="field full">
            <label>Candidate Name *</label>
            <input value={form.candidateName} onChange={set("candidateName")} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={set("phone")} />
          </div>
          <div className="field full">
            <label>Position</label>
            <input value={form.position} onChange={set("position")} placeholder="e.g. Senior Engineer" />
          </div>

          <div className="field full">
            <label className="radio-row">
              <input type="checkbox" checked={form.createLogin} onChange={setCheck("createLogin")} />
              Create candidate login account
            </label>
          </div>

          {form.createLogin && (
            <>
              <div className="field">
                <label>Username</label>
                <input value={form.username} onChange={set("username")} required={form.createLogin} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="text" value={form.password} onChange={set("password")} required={form.createLogin} />
              </div>
            </>
          )}
        </div>

        <div className="row mt">
          <button className="btn" type="submit" disabled={busy}>{busy ? "Saving..." : "Save Candidate"}</button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}