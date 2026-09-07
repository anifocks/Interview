import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { interviewService } from "../../services/interviewService.js";
import { Spinner, EmptyState, Alert, StatusBadge, formatDate } from "../../components/common/UI.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    interviewService
      .mine()
      .then((res) => setInterviews(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const active = interviews.find((i) => i.Status === "IN_PROGRESS" || i.Status === "NOT_STARTED");

  return (
    <div>
      <h1 className="page-title">My Interviews, {user?.fullName}</h1>

      <Alert>{error}</Alert>

      {active && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Upcoming Interview</h2>
              <p className="muted">{active.Position} &middot; Interviewer: {active.InterviewerName || "-"}</p>
            </div>
            <StatusBadge status={active.Status} />
          </div>
          {active.Status === "NOT_STARTED" ? (
            <p className="muted">Your interview is ready. It will become active when the interviewer starts the session.</p>
          ) : (
            <Link className="btn btn-success" to={`/candidate/interview/${active.InterviewId}`}>Continue Interview</Link>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Interview History</h2>
        {interviews.length === 0 ? (
          <EmptyState message="No interviews scheduled." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Position</th>
                  <th>Interviewer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((i) => (
                  <tr key={i.InterviewId}>
                    <td>#{i.InterviewId}</td>
                    <td>{i.Position}</td>
                    <td>{i.InterviewerName || "-"}</td>
                    <td>{formatDate(i.InterviewDate)}</td>
                    <td><StatusBadge status={i.Status} /></td>
                    <td>
                      {i.Status !== "NOT_STARTED" && i.Status !== "CANCELLED" && (
                        <Link className="btn btn-secondary btn-sm" to={`/candidate/interview/${i.InterviewId}`}>Open</Link>
                      )}
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