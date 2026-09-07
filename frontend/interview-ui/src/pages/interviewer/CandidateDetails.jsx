import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { candidateService } from "../../services/candidateService.js";
import { questionService } from "../../services/questionService.js";
import { assignmentService } from "../../services/assignmentService.js";
import { interviewService } from "../../services/interviewService.js";
import { Spinner, EmptyState, Alert, StatusBadge, formatDate } from "../../components/common/UI.jsx";

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [tab, setTab] = useState("assign");
  const [typeTab, setTypeTab] = useState("MCQ");
  const [manageMode, setManageMode] = useState(false);

  const candidateId = Number(id);

  const enrichOptions = (assignments) => {
    const mcqIds = assignments.filter((a) => a.QuestionType === "MCQ").map((a) => a.QuestionId);
    if (mcqIds.length === 0) {
      return;
    }
    Promise.all(mcqIds.map((qid) => questionService.get(qid).catch(() => null)))
      .then((results) => {
        const optMap = new Map();
        results.forEach((r) => {
          if (r && r.data) optMap.set(r.data.QuestionId, r.data.Options || []);
        });
        setAssigned((prev) => prev.map((a) =>
          a.questionType === "MCQ"
            ? { ...a, options: optMap.get(a.questionId) || [] }
            : a
        ));
      })
      .catch(() => {});
  };

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      candidateService.get(candidateId),
      questionService.list(),
      assignmentService.getForCandidate(candidateId),
      interviewService.forCandidate(candidateId)
    ])
      .then(([cand, questions, assignments, history]) => {
        setCandidate(cand.data);
        setAllQuestions(questions.data);
        setAssigned(assignments.data.map((a) => ({
          questionId: a.QuestionId,
          questionCode: a.QuestionCode,
          questionText: a.QuestionText,
          questionType: a.QuestionType,
          category: a.Category,
          difficulty: a.Difficulty,
          isCommon: a.IsCommon,
          expectedAnswer: a.ExpectedAnswer,
          weakAnswer: a.WeakAnswer,
          publishedAt: a.PublishedAt || null,
          options: []
        })));
        enrichOptions(assignments.data);
        setInterviews(history.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [candidateId]);

  if (loading) return <Spinner />;

  if (!candidate) {
    return <EmptyState message="Candidate not found." />;
  }

  const assignedIds = new Set(assigned.map((a) => a.questionId));
  const available = allQuestions.filter((q) => !assignedIds.has(q.QuestionId));

  const toggleAssign = (question) => {
    setAssigned((prev) =>
      prev.some((a) => a.questionId === question.QuestionId)
        ? prev.filter((a) => a.questionId !== question.QuestionId)
        : [...prev, {
            questionId: question.QuestionId,
            questionCode: question.QuestionCode,
            questionText: question.QuestionText,
            questionType: question.QuestionType,
            category: question.Category,
            difficulty: question.Difficulty,
            isCommon: question.IsCommon,
            expectedAnswer: question.ExpectedAnswer,
            weakAnswer: question.WeakAnswer,
            publishedAt: null,
            options: []
          }]
    );
  };

  const move = (from, to) => {
    setAssigned((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const removeAssigned = (questionId) => {
    setAssigned((prev) => prev.filter((a) => a.questionId !== questionId));
  };

  const saveAssignments = async () => {
    setBusy(true);
    setError("");
    try {
      await assignmentService.replaceForCandidate(candidateId, assigned.map((a) => a.questionId));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startInterview = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await interviewService.create(candidateId);
      navigate(`/interviewer/interviews/${res.data.interview.InterviewId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (questionId, shouldPublish) => {
    setBusy(true);
    setError("");
    try {
      if (shouldPublish) {
        await assignmentService.publishQuestion(candidateId, questionId);
      } else {
        await assignmentService.unpublishQuestion(candidateId, questionId);
      }
      setAssigned((prev) =>
        prev.map((a) =>
          a.questionId === questionId ? { ...a, publishedAt: shouldPublish ? new Date().toISOString() : null } : a
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const publishAllPublishable = async () => {
    setBusy(true);
    setError("");
    try {
      await assignmentService.publishAllForCandidate(candidateId);
      setAssigned((prev) =>
        prev.map((a) =>
          a.questionType === "MCQ" ? a : { ...a, publishedAt: a.publishedAt || new Date().toISOString() }
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const TYPE_ORDER = ["MCQ", "ORAL", "WRITTEN"];
  const grouped = TYPE_ORDER.reduce((acc, t) => {
    acc[t] = assigned.filter((a) => a.questionType === t);
    return acc;
  }, {});

  const renderDetailCard = (q) => (
    <div key={q.questionId} className="detail-card">
      <div className="detail-card-header">
        <div className="detail-code">{q.questionCode}</div>
        <div className="detail-summary">
          <span className={`badge badge-${q.questionType.toLowerCase()}`}>{q.questionType}</span>
          {q.category && <span className="badge">{q.category}</span>}
          {q.difficulty && <span className="badge">{q.difficulty}</span>}
          {q.isCommon && <span className="badge badge-success">Common</span>}
        </div>
      </div>

      <div className="detail-item">
        <div className="detail-item-label">Question</div>
        <div className="detail-item-value">{q.questionText}</div>
      </div>

      {q.questionType === "MCQ" && (q.options || []).length > 0 && (
        <div className="detail-item">
          <div className="detail-item-label">Options</div>
          <div className="mcq-list">
            {(q.options || []).map((opt) => (
              <div key={opt.OptionId} className={`mcq-option ${opt.IsCorrect ? "correct" : ""}`}>
                <strong>{opt.OptionLabel}.</strong>
                <div style={{ flex: 1 }}>{opt.OptionText}</div>
                {opt.IsCorrect && <span className="badge badge-success">CORRECT</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-answers">
        {q.expectedAnswer && (
          <div className="expected-answer"><strong>Expected Answer</strong><br />{q.expectedAnswer}</div>
        )}
        {q.weakAnswer && (
          <div className="weak-answer"><strong>Weak Answer</strong><br />{q.weakAnswer}</div>
        )}
      </div>

      <div className="detail-actions">
        {q.questionType === "MCQ" ? (
          <span className="badge badge-success">Always visible to candidate</span>
        ) : q.publishedAt ? (
          <>
            <span className="badge badge-success">Published to candidate</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => togglePublish(q.questionId, false)}
              disabled={busy}
            >
              Unpublish
            </button>
          </>
        ) : (
          <>
            <span className="badge">Not published</span>
            <button
              className="btn btn-success btn-sm"
              onClick={() => togglePublish(q.questionId, true)}
              disabled={busy}
            >
              Publish to Candidate
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="card-header">
        <div>
          <h1 className="page-title">{candidate.CandidateName}</h1>
          <div className="muted">
            {candidate.Position} &middot; {candidate.Email} &middot; {candidate.Phone} &middot; Login: {candidate.Username || "-"}
          </div>
        </div>
        <button className="btn" onClick={startInterview} disabled={busy}>
          {busy ? "Creating..." : "+ Start Interview"}
        </button>
      </div>

      <Alert>{error}</Alert>

      <div className="tabs">
        <button className={`tab ${tab === "assign" ? "active" : ""}`} onClick={() => setTab("assign")}>Assigned Questions</button>
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>Interview History</button>
      </div>

      {tab === "assign" && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assigned Questions ({assigned.length})</h2>
            <div className="row">
              {!manageMode && (
                <button className="btn btn-success btn-sm" onClick={publishAllPublishable} disabled={busy}>
                  Publish All Oral/Written
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setManageMode((m) => !m)}>
                {manageMode ? "Done" : "Manage Assignment"}
              </button>
            </div>
          </div>

          {manageMode ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div className="section-label">Available questions</div>
                  {available.length === 0 ? (
                    <EmptyState message="All questions are already assigned." />
                  ) : (
                    <div className="stack">
                      {available.map((q) => (
                        <label key={q.QuestionId} className="assignment-item" style={{ cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleAssign(q)}
                          />
                          <div style={{ flex: 1 }}>
                            <strong>{q.QuestionCode}</strong> <span className={`badge badge-${q.QuestionType.toLowerCase()}`}>{q.QuestionType}</span> <span className="muted">{q.Category} / {q.Difficulty}</span>
                            <div className="muted" style={{ fontSize: 13 }}>{q.QuestionText}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="section-label">Assigned (drag to reorder)</div>
                  {assigned.length === 0 ? (
                    <EmptyState message="No questions assigned yet." />
                  ) : (
                    <div>
                      {assigned.map((a, idx) => (
                        <div
                          key={a.questionId}
                          className={`assignment-item ${dragIndex === idx ? "dragging" : ""}`}
                          draggable
                          onDragStart={() => setDragIndex(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIndex !== null && dragIndex !== idx) move(dragIndex, idx);
                            setDragIndex(null);
                          }}
                          onDragEnd={() => setDragIndex(null)}
                        >
                          <span className="drag-handle">&#8801;</span>
                          <span className="muted" style={{ width: 24 }}>{idx + 1}</span>
                          <div style={{ flex: 1 }}>
                            <strong>{a.questionCode}</strong> <span className={`badge badge-${a.questionType.toLowerCase()}`}>{a.questionType}</span>
                            <div className="muted" style={{ fontSize: 13 }}>{a.questionText}</div>
                          </div>
                          <div className="row">
                            <button className="btn btn-secondary btn-sm" disabled={idx === 0} onClick={() => move(idx, idx - 1)}>&#8593;</button>
                            <button className="btn btn-secondary btn-sm" disabled={idx === assigned.length - 1} onClick={() => move(idx, idx + 1)}>&#8595;</button>
                            <button className="btn btn-danger btn-sm" onClick={() => removeAssigned(a.questionId)}>x</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="row mt">
                <button className="btn" onClick={saveAssignments} disabled={busy}>
                  {busy ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="tabs">
                {TYPE_ORDER.map((t) => (
                  <button
                    key={t}
                    className={`tab ${typeTab === t ? "active" : ""}`}
                    onClick={() => setTypeTab(t)}
                  >
                    {t} ({grouped[t].length})
                  </button>
                ))}
              </div>

              {assigned.length === 0 ? (
                <EmptyState message="No questions assigned to this candidate yet." />
              ) : grouped[typeTab].length === 0 ? (
                <EmptyState message={`No ${typeTab} questions assigned to this candidate.`} />
              ) : (
                <div className="stack">
                  {grouped[typeTab].map((q) => renderDetailCard(q))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <h2 className="card-title">Interview History</h2>
          {interviews.length === 0 ? (
            <EmptyState message="No interviews for this candidate yet." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Comments</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((iv) => (
                    <tr key={iv.InterviewId}>
                      <td>#{iv.InterviewId}</td>
                      <td>{formatDate(iv.InterviewDate)}</td>
                      <td><StatusBadge status={iv.Status} /></td>
                      <td>{iv.OverallScore != null ? iv.OverallScore : "-"}</td>
                      <td>{iv.OverallComments || "-"}</td>
                      <td>
                        <Link className="btn btn-secondary btn-sm" to={`/interviewer/interviews/${iv.InterviewId}`}>Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}