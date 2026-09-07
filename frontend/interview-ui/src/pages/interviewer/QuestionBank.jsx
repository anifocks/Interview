import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { questionService } from "../../services/questionService.js";
import { candidateService } from "../../services/candidateService.js";
import { assignmentService } from "../../services/assignmentService.js";
import { Spinner, EmptyState, Alert, StatusBadge } from "../../components/common/UI.jsx";

const CATEGORIES = [
  "Requirement", "Python", "PostgreSQL", "Data Pipeline", "API",
  "System Design", "RLS", "Problem Solving", "Communication", "GenAI",
  "Architecture", "RAG", "Deployment", "ML",
  "Database", "Production Monitoring", "Multi-Tenant Security",
  "Database Performance", "Requirement Handling", "Data Pipeline Reliability"
];

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const [assignQ, setAssignQ] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [viewQ, setViewQ] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    questionService
      .list({ type: type || null, category: category || null })
      .then((res) => setQuestions(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [type, category]);

  const openAssign = async (q) => {
    setAssignQ(q);
    setQuery("");
    setAssignError("");
    try {
      const [candRes, assignRes] = await Promise.all([
        candidateService.list(),
        assignmentService.getForQuestion(q.QuestionId)
      ]);
      setCandidates(candRes.data || []);
      setSelected((assignRes.data || []).map((a) => a.CandidateId));
    } catch (err) {
      setAssignError(err.message);
    }
  };

  const closeAssign = () => {
    setAssignQ(null);
    setCandidates([]);
    setSelected([]);
    setQuery("");
    setAssignError("");
  };

  const openView = async (q) => {
    setError("");
    try {
      const res = await questionService.get(q.QuestionId);
      setViewQ(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const closeView = () => setViewQ(null);

  const toggleCandidate = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visible = filtered.map((c) => c.CandidateId);
    const allVisibleSelected = visible.every((id) => selected.includes(id));
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visible.includes(id))
        : [...new Set([...prev, ...visible])]
    );
  };

  const saveAssign = async () => {
    setAssignBusy(true);
    setAssignError("");
    try {
      await assignmentService.replaceForQuestion(assignQ.QuestionId, selected);
      closeAssign();
      load();
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignBusy(false);
    }
  };

  const toggleStatus = async (q) => {
    const deactivating = q.IsActive;
    if (!window.confirm(`${deactivating ? "Deactivate" : "Activate"} question "${q.QuestionCode}"?`)) return;
    setError("");
    try {
      await questionService.setStatus(q.QuestionId, !q.IsActive);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (q) => {
    if (!window.confirm(`Deactivate question "${q.QuestionCode}"?`)) return;
    try {
      await questionService.remove(q.QuestionId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  const filtered = candidates.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.CandidateName || "").toLowerCase().includes(q) ||
      (c.Email || "").toLowerCase().includes(q) ||
      (c.Position || "").toLowerCase().includes(q)
    );
  });

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.CandidateId));

  return (
    <div>
      <div className="card-header">
        <div>
          <h1 className="page-title">Question Bank</h1>
        </div>
        <Link className="btn" to="/interviewer/questions/new">+ Create Question</Link>
      </div>

      <Alert>{error}</Alert>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="ORAL">Oral</option>
              <option value="MCQ">MCQ</option>
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState message="No questions match the filter." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Type</th>
                  <th>Common</th>
                  <th>Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.QuestionId}>
                    <td><strong>{q.QuestionCode}</strong></td>
                    <td style={{ maxWidth: 380 }}>{q.QuestionText}</td>
                    <td>{q.Category}</td>
                    <td>{q.Difficulty}</td>
                    <td><span className={`badge badge-${q.QuestionType.toLowerCase()}`}>{q.QuestionType}</span></td>
                    <td>{q.IsCommon ? "Yes" : "No"}</td>
                    <td>
                      {q.AssignedCount ? `${q.AssignedCount} candidate${q.AssignedCount > 1 ? "s" : ""}` : <span className="muted">None</span>}
                    </td>
                    <td><StatusBadge status={q.IsActive ? "ACTIVE" : "INACTIVE"} /></td>
                    <td className="nowrap">
                      <div className="row">
                        <button className="btn btn-secondary btn-sm" onClick={() => openView(q)}>View</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openAssign(q)}>Assign</button>
                        <Link className="btn btn-secondary btn-sm" to={`/interviewer/questions/${q.QuestionId}/edit`}>Edit</Link>
                        <button className="btn btn-sm" onClick={() => toggleStatus(q)}>
                          {q.IsActive ? "Deactivate" : "Activate"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(q)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewQ && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeView()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">{viewQ.QuestionCode}</h2>
              <button className="btn btn-secondary btn-sm" onClick={closeView}>X</button>
            </div>
            <div className="modal-body">
              <div className="row" style={{ marginBottom: 10 }}>
                <span className={`badge badge-${viewQ.QuestionType.toLowerCase()}`}>{viewQ.QuestionType}</span>
                <span className="badge">{viewQ.Category}</span>
                <span className="badge">{viewQ.Difficulty}</span>
                <span className="badge">{viewQ.IsCommon ? "Common" : "Specific"}</span>
                <StatusBadge status={viewQ.IsActive ? "ACTIVE" : "INACTIVE"} />
              </div>
              <div className="question-text">{viewQ.QuestionText}</div>

              <div className="mt">
                {viewQ.QuestionType === "MCQ" && (viewQ.Options || []).map((opt) => (
                  <div
                    key={opt.OptionId}
                    className={`mcq-option ${opt.IsCorrect ? "correct" : ""}`}
                    style={{ cursor: "default" }}
                  >
                    <strong>{opt.OptionLabel}.</strong>
                    <div style={{ flex: 1 }}>{opt.OptionText}</div>
                    {opt.IsCorrect && <span className="status-badge status-active">Correct</span>}
                  </div>
                ))}
              </div>

              {viewQ.ExpectedAnswer && (
                <div className="field full mt">
                  <label>Expected Answer</label>
                  <div className="card-sub">{viewQ.ExpectedAnswer}</div>
                </div>
              )}
              {viewQ.WeakAnswer && (
                <div className="field full mt">
                  <label>Weak Answer</label>
                  <div className="card-sub">{viewQ.WeakAnswer}</div>
                </div>
              )}
              {viewQ.QuestionType === "ORAL" && (viewQ.FollowUps || []).length > 0 && (
                <div className="field full mt">
                  <label>Follow-up Questions</label>
                  {(viewQ.FollowUps || []).map((f) => (
                    <div key={f.QuestionId} className="field full">
                      <div className="card-sub"><strong>{f.QuestionCode}</strong> — {f.QuestionText}</div>
                      {f.ExpectedAnswer && <div className="card-sub">Expected: {f.ExpectedAnswer}</div>}
                      {f.WeakAnswer && <div className="card-sub">Weak: {f.WeakAnswer}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Link className="btn btn-secondary" to={`/interviewer/questions/${viewQ.QuestionId}/edit`}>Edit</Link>
              <button className="btn" onClick={closeView}>Close</button>
            </div>
          </div>
        </div>
      )}

      {assignQ && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeAssign()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">Assign "{assignQ.QuestionCode}" to Candidates</h2>
              <button className="btn btn-secondary btn-sm" onClick={closeAssign}>X</button>
            </div>

            <div className="modal-body">
              <Alert>{assignError}</Alert>
              <div className="muted" style={{ marginBottom: 12 }}>{assignQ.QuestionText}</div>

              {candidates.length === 0 ? (
                <EmptyState message="No candidates yet. Create candidates first." />
              ) : (
                <>
                  <div className="row" style={{ marginBottom: 12 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <input
                        placeholder="Search candidates..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <label className="candidate-pick" style={{ alignItems: "center" }}>
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} />
                      All ({filtered.length})
                    </label>
                  </div>

                  {filtered.map((c) => (
                    <label key={c.CandidateId} className="candidate-pick">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.CandidateId)}
                        onChange={() => toggleCandidate(c.CandidateId)}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>{c.CandidateName}</strong>{" "}
                        <span className="muted">{c.Position || ""}</span>
                        <div className="muted" style={{ fontSize: 13 }}>{c.Email}</div>
                      </div>
                      <StatusBadge status={c.Status} />
                    </label>
                  ))}
                  {filtered.length === 0 && <EmptyState message="No candidates match the search." />}
                </>
              )}
            </div>

            <div className="modal-footer">
              <span className="muted">{selected.length} selected</span>
              <button className="btn btn-secondary" onClick={closeAssign}>Cancel</button>
              <button className="btn" onClick={saveAssign} disabled={assignBusy}>
                {assignBusy ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}