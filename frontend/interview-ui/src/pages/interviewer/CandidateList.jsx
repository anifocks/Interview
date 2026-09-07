import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { candidateService } from "../../services/candidateService.js";
import { interviewService } from "../../services/interviewService.js";
import { Spinner, EmptyState, StatusBadge, Alert } from "../../components/common/UI.jsx";

export default function CandidateList() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    candidateService
      .list()
      .then((res) => setCandidates(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startInterview = async (candidateId) => {
    setStarting(candidateId);
    setError("");
    try {
      const res = await interviewService.create(candidateId);
      navigate(`/interviewer/interviews/${res.data.interview.InterviewId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(null);
    }
  };

  const removeCandidate = async (candidate) => {
    if (!window.confirm(`Delete candidate "${candidate.CandidateName}"? This will also cancel their open interviews.`)) {
      return;
    }
    try {
      await candidateService.remove(candidate.CandidateId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="card-header">
        <h1 className="page-title">Candidates</h1>
        <Link className="btn" to="/interviewer/candidates/new">+ Add Candidate</Link>
      </div>

      <Alert>{error}</Alert>

      {candidates.length === 0 ? (
        <EmptyState message="No candidates yet." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Login</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.CandidateId}>
                    <td><Link to={`/interviewer/candidates/${c.CandidateId}`}>{c.CandidateName}</Link></td>
                    <td>{c.Email}</td>
                    <td>{c.Phone}</td>
                    <td>{c.Position}</td>
                    <td>{c.Username || <span className="muted">-</span>}</td>
                    <td><StatusBadge status={c.Status} /></td>
                    <td className="nowrap">
                      <div className="row">
                        <Link className="btn btn-secondary btn-sm" to={`/interviewer/candidates/${c.CandidateId}`}>Details</Link>
                        <button
                          className="btn btn-sm"
                          disabled={starting === c.CandidateId}
                          onClick={() => startInterview(c.CandidateId)}
                        >
                          {starting === c.CandidateId ? "Creating..." : "Interview"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeCandidate(c)}>Delete</button>
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