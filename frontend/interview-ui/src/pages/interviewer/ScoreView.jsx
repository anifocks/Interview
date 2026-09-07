import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { interviewService } from "../../services/interviewService.js";
import { candidateService } from "../../services/candidateService.js";
import { Spinner, EmptyState, Alert, StatusBadge, formatDate } from "../../components/common/UI.jsx";

export default function ScoreView() {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ status: "", candidateId: "" });

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([interviewService.list(), candidateService.list()])
      .then(([ivRes, candRes]) => {
        setInterviews(ivRes.data || []);
        setCandidates(candRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner />;

  const uniqueInterviews = interviews.filter(
    (iv, idx, arr) => arr.findIndex((x) => x.InterviewId === iv.InterviewId) === idx
  );

  const filtered = uniqueInterviews.filter((iv) => {
    if (filter.status && iv.Status !== filter.status) return false;
    if (filter.candidateId && iv.CandidateId !== Number(filter.candidateId)) return false;
    return true;
  });

  const completed = filtered.filter((iv) => iv.Status === "COMPLETED");
  const avgScore =
    completed.length > 0
      ? (completed.reduce((s, iv) => s + (iv.OverallScore || 0), 0) / completed.length).toFixed(1)
      : "-";

  return (
    <div>
      <h1 className="page-title">Candidate Scores</h1>

      <Alert>{error}</Alert>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{filtered.length}</div>
          <div className="stat-label">Total Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completed.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgScore}</div>
          <div className="stat-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completed.length > 0 ? Math.max(...completed.map((iv) => iv.OverallScore || 0)) : "-"}</div>
          <div className="stat-label">Highest Score</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Scores</h2>
          <div className="row" style={{ gap: 12 }}>
            <select
              className="form-control"
              style={{ width: 180 }}
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              className="form-control"
              style={{ width: 220 }}
              value={filter.candidateId}
              onChange={(e) => setFilter((f) => ({ ...f, candidateId: e.target.value }))}
            >
              <option value="">All Candidates</option>
              {candidates.map((c) => (
                <option key={c.CandidateId} value={c.CandidateId}>
                  {c.CandidateName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No interviews found." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Interviewer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Comments</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((iv) => (
                  <tr key={iv.InterviewId}>
                    <td>{iv.CandidateName}</td>
                    <td>{iv.Position}</td>
                    <td>{iv.InterviewerName || "-"}</td>
                    <td>{formatDate(iv.InterviewDate)}</td>
                    <td><StatusBadge status={iv.Status} /></td>
                    <td>
                      {iv.OverallScore != null ? (
                        <span className="stat-number" style={{ fontSize: 16 }}>
                          {iv.OverallScore}
                          <span className="muted" style={{ fontSize: 12 }}>/150</span>
                        </span>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {iv.OverallComments || "-"}
                    </td>
                    <td>
                      <Link className="btn btn-secondary btn-sm" to={`/interviewer/interviews/${iv.InterviewId}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
