import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { candidateService } from "../../services/candidateService.js";
import { questionService } from "../../services/questionService.js";
import { interviewService } from "../../services/interviewService.js";
import { StatusBadge, formatDate, Spinner, EmptyState } from "../../components/common/UI.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ candidates: 0, questions: 0, interviews: 0, inProgress: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([candidateService.list(), questionService.list(), interviewService.list()])
      .then(([candidates, questions, interviews]) => {
        const data = interviews.data || [];
        setStats({
          candidates: candidates.data.length,
          questions: questions.data.length,
          interviews: data.length,
          inProgress: data.filter((i) => i.Status === "IN_PROGRESS").length
        });
        setRecent(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.fullName}</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.candidates}</div>
          <div className="stat-label">Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.questions}</div>
          <div className="stat-label">Active Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.interviews}</div>
          <div className="stat-label">Total Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div className="card mt">
        <div className="card-header">
          <h2 className="card-title">Recent Interviews</h2>
          <div className="row">
            <Link className="btn btn-secondary btn-sm" to="/interviewer/candidates">Candidates</Link>
            <Link className="btn btn-secondary btn-sm" to="/interviewer/scores">Scores</Link>
            <Link className="btn btn-secondary btn-sm" to="/interviewer/questions">Question Bank</Link>
          </div>
        </div>

        {recent.length === 0 ? (
          <EmptyState message="No interviews yet. Start one from the Candidates page." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i.InterviewId}>
                    <td>{i.CandidateName}</td>
                    <td>{i.Position}</td>
                    <td>{formatDate(i.InterviewDate)}</td>
                    <td><StatusBadge status={i.Status} /></td>
                    <td>{i.OverallScore != null ? i.OverallScore : "-"}</td>
                    <td>
                      <Link className="btn btn-secondary btn-sm" to={`/interviewer/interviews/${i.InterviewId}`}>
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