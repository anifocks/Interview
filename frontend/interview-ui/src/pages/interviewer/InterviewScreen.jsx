import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService.js";
import { assignmentService } from "../../services/assignmentService.js";
import { Spinner, Alert, StatusBadge, formatDate } from "../../components/common/UI.jsx";

const ORAL_CRITERIA = [
  "Python Programming", "ML Concepts", "Deep Learning", "LLM & GenAI",
  "Prompt Engineering", "API Integration", "DSA", "Problem Solving",
  "System Design", "Communication"
];

const WRITTEN_CRITERIA = [
  "Technical Accuracy", "Code Quality", "Logical Thinking",
  "Solution Approach", "Documentation/Explanation"
];

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function InterviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("questions");
  const [current, setCurrent] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [criteriaInit, setCriteriaInit] = useState(false);
  const [overallComments, setOverallComments] = useState("");

  const interviewId = Number(id);

  const writtenAutoFor = (questions) => {
    const mcqs = (questions || []).filter((q) => q.questionType === "MCQ");
    if (mcqs.length === 0) return null;
    const correct = mcqs.filter((q) => q.answer && q.answer.isCorrect === true).length;
    return Math.max(0, Math.min(10, Math.round((correct / mcqs.length) * 10)));
  };

  const load = (isPoll = false) => {
    if (!isPoll) setLoading(true);
    if (!isPoll) setError("");
    interviewService
      .get(interviewId)
      .then((res) => {
        setData(res.data);
        const saved = res.data.criteria || [];
        if (saved.length > 0 && !isPoll) {
          setCriteria(
            saved.map((c) => ({ category: c.Category, criteriaName: c.CriteriaName, score: String(c.Score), comments: c.Comments || "" }))
          );
        } else if (!criteriaInit) {
          const auto = writtenAutoFor(res.data.questions);
          setCriteria([
            ...ORAL_CRITERIA.map((name) => ({ category: "ORAL", criteriaName: name, score: "", comments: "" })),
            ...WRITTEN_CRITERIA.map((name) => ({
              category: "WRITTEN",
              criteriaName: name,
              score: auto != null ? String(auto) : "",
              comments: ""
            }))
          ]);
          setCriteriaInit(true);
        }
        if (!isPoll) setOverallComments(res.data.interview.OverallComments || "");
      })
      .catch((err) => { if (!isPoll) setError(err.message); })
      .finally(() => { if (!isPoll) setLoading(false); });
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [interviewId, criteriaInit]);

  const mcqStats = useMemo(() => {
    const mcqs = (data?.questions || []).filter((q) => q.questionType === "MCQ");
    const total = mcqs.length;
    const correct = mcqs.filter((q) => q.answer && q.answer.isCorrect === true).length;
    const auto = total > 0 ? Math.max(0, Math.min(10, Math.round((correct / total) * 10))) : null;
    return { total, correct, auto };
  }, [data]);

  const interview = data?.interview;
  const questions = data?.questions || [];
  const isCompleted = interview?.Status === "COMPLETED";

  const answeredCount = useMemo(
    () => questions.filter((q) => q.answer && (q.answer.candidateAnswer || q.answer.isAnswered)).length,
    [questions]
  );

  const publishedCount = useMemo(
    () => questions.filter((q) => q.questionType !== "MCQ" && q.publishedAt).length,
    [questions]
  );

  const publishableCount = useMemo(
    () => questions.filter((q) => q.questionType !== "MCQ").length,
    [questions]
  );

  const togglePublish = async (questionId, shouldPublish) => {
    setBusy(true);
    setError("");
    try {
      if (shouldPublish) {
        await assignmentService.publishQuestion(interview.CandidateId, questionId);
      } else {
        await assignmentService.unpublishQuestion(interview.CandidateId, questionId);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const publishAll = async () => {
    setBusy(true);
    setError("");
    try {
      await assignmentService.publishAllForCandidate(interview.CandidateId);
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
      await interviewService.start(interviewId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveCurrent = async (payload, answerId) => {
    setBusy(true);
    setError("");
    try {
      if (answerId) {
        await interviewService.updateAnswer(interviewId, answerId, payload);
      } else {
        await interviewService.saveAnswer(interviewId, payload);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const completeInterview = async () => {
    const filled = criteria.filter((c) => c.score !== "" && c.score != null && Number(c.score) >= 0 && Number(c.score) <= 10);
    if (filled.length === 0) {
      setError("Enter at least one criteria score before completing.");
      return;
    }
    if (!window.confirm("Complete this interview? Scores and criteria will be final.")) return;

    setBusy(true);
    setError("");
    try {
      await interviewService.complete(interviewId, {
        overallComments: overallComments || null,
        criteria: filled.map((c) => ({
          category: c.category,
          criteriaName: c.criteriaName,
          score: Number(c.score),
          comments: c.comments || null
        }))
      });
      load();
      setTab("result");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setCriteriaScore = (index, key, value) => {
    setCriteria((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  };

  const fillWrittenFromMcqs = () => {
    if (mcqStats.auto == null) return;
    setCriteria((prev) =>
      prev.map((c) => (c.category === "WRITTEN" ? { ...c, score: String(mcqStats.auto) } : c))
    );
  };

  if (loading) return <Spinner />;
  if (!data) return <Alert>{error || "Interview not found."}</Alert>;

  const statusClass = interview.Status ? interview.Status.toLowerCase().replace("_", "-") : "";

  const questionState = (q, idx) =>
    (q.answer && (q.answer.candidateAnswer || q.answer.isAnswered) ? "answered" : "") +
    (idx === current ? " active" : "");

  return (
    <div>
      <div className="interview-layout">
        <div className="card">
          <div className="interview-header">
            <div className="interview-header-info">
              <h1 className="card-title" style={{ margin: 0 }}>{interview.CandidateName}</h1>
              <div className="muted">
                {interview.Position} &middot; Interview #{interview.InterviewId} &middot; {formatDate(interview.InterviewDate)} &middot; Interviewer: {interview.InterviewerName || "-"}
              </div>
            </div>
            <StatusBadge status={interview.Status} />
            <button onClick={() => navigate("/interviewer/candidates")} className="btn btn-secondary btn-sm">Back</button>
          </div>
        </div>

        <Alert>{error}</Alert>

        {interview.Status === "NOT_STARTED" && (
          <div className="card">
            <h2 className="card-title">Ready to start</h2>
            <p className="muted">
              {questions.length} questions assigned. Start the interview when the candidate is ready.
            </p>
            <button className="btn btn-success" onClick={startInterview} disabled={busy}>
              {busy ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}

        {(interview.Status === "IN_PROGRESS" || isCompleted) && (
          <>
            <div className="tabs">
              <button className={`tab ${tab === "questions" ? "active" : ""}`} onClick={() => setTab("questions")}>
                Questions ({answeredCount}/{questions.length})
              </button>
              <button className={`tab ${tab === "scoring" ? "active" : ""}`} onClick={() => setTab("scoring")}>Scoring</button>
              {isCompleted && <button className={`tab ${tab === "result" ? "active" : ""}`} onClick={() => setTab("result")}>Result</button>}
            </div>

            {tab === "questions" && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Question {(current >= 0 && current < questions.length) ? current + 1 : 0} of {questions.length}</h2>
                  <div className="interview-q-nav">
                    {questions.map((q, idx) => (
                      <button
                        key={q.questionId}
                        className={`q-dot ${questionState(q, idx)} ${q.publishedAt ? "published" : ""}`.trim()}
                        onClick={() => setCurrent(idx)}
                        title={q.questionType === "MCQ" ? `${q.questionCode} (always visible)` : `${q.questionCode}${q.publishedAt ? " (published)" : " (not published)"}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  {!isCompleted && publishableCount > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={publishAll} disabled={busy}>
                      Publish All ({publishedCount}/{publishableCount})
                    </button>
                  )}
                </div>

                {questions.length === 0 && (
                  <Alert>No questions are assigned to this candidate yet. Add them from the candidate details page.</Alert>
                )}

                {questions.length > 0 && (
                  <QuestionPanel
                    key={`${questions[current].questionId}-${questions[current].answer?.answerId || "new"}`}
                    question={questions[current]}
                    index={current}
                    total={questions.length}
                    isCompleted={isCompleted}
                    onSave={saveCurrent}
                    onPublish={(qid) => togglePublish(qid, true)}
                    onUnpublish={(qid) => togglePublish(qid, false)}
                    busy={busy}
                    navNext={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
                    navPrev={() => setCurrent((c) => Math.max(c - 1, 0))}
                  />
                )}
              </div>
            )}

            {tab === "scoring" && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Interview Scoring</h2>
                  {!isCompleted && (
                    <button className="btn btn-success" onClick={completeInterview} disabled={busy}>
                      {busy ? "Saving..." : "Complete Interview"}
                    </button>
                  )}
                </div>

                {isCompleted && <Alert type="success">This interview has been completed.</Alert>}

                <CriteriaGrid section="ORAL" label="Oral" criteria={criteria.filter((c) => c.category === "ORAL")} disabled={isCompleted} onChange={setCriteriaScore} />
                <CriteriaGrid
                  section="WRITTEN"
                  label="Written"
                  criteria={criteria.filter((c) => c.category === "WRITTEN")}
                  disabled={isCompleted}
                  onChange={setCriteriaScore}
                  autoSummary={mcqStats.total > 0 ? { correct: mcqStats.correct, total: mcqStats.total, auto: mcqStats.auto } : null}
                  onFillAuto={fillWrittenFromMcqs}
                />

                <div className="field mt">
                  <label>Overall Comments</label>
                  <textarea
                    value={overallComments}
                    onChange={(e) => setOverallComments(e.target.value)}
                    disabled={isCompleted}
                    placeholder="Summary / recommendation for the hiring team"
                  />
                </div>

                {isCompleted && <button className="btn btn-secondary mt" onClick={() => setTab("result")}>View Result</button>}
                {!isCompleted && busy && <p className="muted mt">Completing interview...</p>}
              </div>
            )}

            {tab === "result" && isCompleted && (
              <ResultView interview={interview} criteria={criteria.filter((c) => c.score !== "" && c.score != null)} mcqStats={mcqStats} />
            )}
          </>
        )}

        {interview.Status === "CANCELLED" && <Alert>This interview was cancelled.</Alert>}
      </div>
    </div>
  );
}

function QuestionPanel({ question, index, total, isCompleted, onSave, onPublish, onUnpublish, busy, navNext, navPrev }) {
  const [form, setForm] = useState({ candidateAnswer: "", interviewerNotes: "", score: "", optionId: "" });
  const [showExpected, setShowExpected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const answer = question.answer;

  useEffect(() => {
    let optionId = "";
    if (question.questionType === "MCQ" && answer?.candidateAnswer) {
      const label = answer.candidateAnswer.split(".")[0].trim();
      const match = (question.options || []).find((o) => String(o.label) === label);
      optionId = match ? String(match.optionId) : "";
    }
    setForm({
      candidateAnswer: answer?.candidateAnswer || "",
      interviewerNotes: answer?.interviewerNotes || "",
      score: answer?.score != null ? String(answer.score) : "",
      optionId
    });
    setShowExpected(false);
    setError("");
  }, [question.questionId, answer?.answerId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectOption = (optionId) => setForm((f) => ({ ...f, optionId: String(optionId) }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        questionId: question.questionId,
        candidateAnswer: form.candidateAnswer.trim() || null,
        interviewerNotes: form.interviewerNotes.trim() || null,
        score: form.score ? Number(form.score) : null,
        optionId: form.optionId ? Number(form.optionId) : null
      };
      await onSave(payload, answer?.answerId);
      navNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Alert>{error}</Alert>

      <div className="section-label">Question {index + 1}</div>
      <div className="question-text">{question.questionText}</div>

      <div className="row mt">
        <span className={`badge badge-${question.questionType.toLowerCase()}`}>{question.questionType}</span>
        {question.category && <span className="badge">{question.category}</span>}
        {question.difficulty && <span className="badge">{question.difficulty}</span>}
        {question.isCommon && <span className="badge">Common</span>}
      </div>

      {!isCompleted && question.questionType === "MCQ" && (
        <div className="row mt" style={{ alignItems: "center", gap: 10 }}>
          <span className="badge badge-success">Always visible to candidate</span>
        </div>
      )}

      {!isCompleted && question.questionType !== "MCQ" && (
        <div className="row mt" style={{ alignItems: "center", gap: 10 }}>
          {question.publishedAt ? (
            <>
              <span className="badge badge-success">Published to candidate</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onUnpublish(question.questionId)} disabled={busy}>
                Unpublish
              </button>
            </>
          ) : (
            <>
              <span className="badge">Not published</span>
              <button className="btn btn-success btn-sm" onClick={() => onPublish(question.questionId)} disabled={busy}>
                Publish to Candidate
              </button>
            </>
          )}
        </div>
      )}

      {question.questionType === "MCQ" && (
        <div className="mcq-list">
          {question.options.map((opt) => {
            const selected = Number(opt.optionId) === Number(form.optionId);
            return (
              <div
                key={opt.optionId}
                className={`mcq-option ${selected ? "selected" : ""} ${opt.isCorrect ? "correct" : ""}`}
                onClick={() => !isCompleted && selectOption(opt.optionId)}
                style={!isCompleted && !selected ? { cursor: "pointer" } : undefined}
              >
                <strong>{opt.label}.</strong>
                <div style={{ flex: 1 }}>{opt.text}</div>
                {opt.isCorrect && <span className="badge">CORRECT</span>}
                {selected && <span className="badge">SELECTED</span>}
              </div>
            );
          })}
          {isCompleted && answer?.candidateAnswer && (
            <div className="muted">Candidate selected: <strong>{answer.candidateAnswer}</strong></div>
          )}
        </div>
      )}

      {question.questionType === "MCQ" && answer?.isCorrect != null && (
        <div className="row mt">
          <span className={`badge ${answer.isCorrect ? "badge-success" : "badge-danger"}`}>
            {answer.isCorrect ? "Correct (+1)" : "Incorrect (0)"}
          </span>
          <span className="muted" style={{ fontSize: 13 }}>Auto-scored when the candidate answered.</span>
        </div>
      )}

      {!isCompleted && (
        <button className="btn btn-secondary btn-sm mt" onClick={() => setShowExpected((s) => !s)}>
          {showExpected ? "Hide Expected Answer" : "Show Expected Answer"}
        </button>
      )}
      {showExpected && question.expectedAnswer && (
        <div className="expected-answer"><strong>Expected:</strong><br />{question.expectedAnswer}</div>
      )}
      {showExpected && question.weakAnswer && (
        <div className="weak-answer"><strong>Weak Answer:</strong><br />{question.weakAnswer}</div>
      )}
      {showExpected && (question.followUps || []).length > 0 && (
        <div className="expected-answer mt">
          <strong>Follow-up Questions:</strong>
          {(question.followUps || []).map((f) => (
            <div key={f.questionId} className="mt">
              <div><strong>{f.questionCode}</strong> — {f.questionText}</div>
              {f.expectedAnswer && <div className="muted">Expected: {f.expectedAnswer}</div>}
              {f.weakAnswer && <div className="muted">Weak: {f.weakAnswer}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="form-grid">
        <div className="field full">
          <label>Candidate Answer</label>
          <textarea
            value={form.candidateAnswer}
            onChange={set("candidateAnswer")}
            disabled={isCompleted}
            placeholder="Enter the answer given by the candidate"
          />
        </div>
        {!isCompleted && (
          <>
            <div className="field">
              <label>Score (0 - 10)</label>
              <select value={form.score} onChange={set("score")}>
                <option value="">Not scored</option>
                {SCORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Interviewer Notes</label>
              <textarea value={form.interviewerNotes} onChange={set("interviewerNotes")} />
            </div>
          </>
        )}
      </div>

      {isCompleted && answer && (
        <div className="row mt">
          <span className="badge">Score: {answer.score ?? "-"}</span>
          {answer.interviewerNotes && <span className="muted">Notes: {answer.interviewerNotes}</span>}
        </div>
      )}

      {!isCompleted && (
        <>
          <div className="nav-buttons">
            <button className="btn btn-secondary" disabled={index === 0} onClick={navPrev}>&#8592; Previous</button>
            <div className="row">
              <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Answer"}</button>
              <button className="btn btn-secondary" disabled={index === total - 1} onClick={navNext}>Next &#8594;</button>
            </div>
          </div>
          <p className="muted mt">Complete the 15-criteria assessment in the Scoring tab before finishing.</p>
        </>
      )}
    </div>
  );
}

function CriteriaGrid({ section, label, criteria, disabled, onChange, autoSummary, onFillAuto }) {
  if (criteria.length === 0) return null;
  return (
    <>
      <div className="section-label">{label} ({criteria.length} criteria)</div>
      {autoSummary && (
        <div className="row" style={{ marginBottom: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            Auto-scored from MCQs: {autoSummary.correct} of {autoSummary.total} correct &#8594;
            {autoSummary.auto}/10 per criterion
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onFillAuto} disabled={disabled}>
            Fill from MCQs
          </button>
        </div>
      )}
      <div className="criteria-grid">
        {criteria.map((c) => {
          const realIdx = criteria.indexOf(c);
          return (
            <div className="criteria-card" key={c.criteriaName}>
              <h4>{c.criteriaName}</h4>
              <div className="row">
                <select
                  value={c.score}
                  disabled={disabled}
                  onChange={(e) => onChange(realIdx, "score", e.target.value)}
                >
                  <option value="">-</option>
                  {SCORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="muted">/ 10</span>
              </div>
              <div className="field mt">
                <textarea
                  placeholder="Comments"
                  value={c.comments}
                  disabled={disabled}
                  onChange={(e) => onChange(realIdx, "comments", e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ResultView({ interview, criteria, mcqStats }) {
  const oral = criteria.filter((c) => c.category === "ORAL");
  const written = criteria.filter((c) => c.category === "WRITTEN");
  const oralTotal = oral.reduce((s, c) => s + Number(c.score || 0), 0);
  const writtenTotal = written.reduce((s, c) => s + Number(c.score || 0), 0);
  const grand = oralTotal + writtenTotal;

  const Table = ({ rows, total }) => (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Criteria</th><th>Score</th><th>Max</th></tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.criteriaName}>
              <td>{c.criteriaName}</td>
              <td>{c.score}</td>
              <td>10</td>
            </tr>
          ))}
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{total}</strong></td>
            <td><strong>{rows.length * 10}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Technical Interview Result</h2>
        <StatusBadge status={interview.Status} />
      </div>

      <div className="muted">
        Candidate: <strong>{interview.CandidateName}</strong> ({interview.Position})
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div className="section-label">Oral</div>
          <Table rows={oral} total={oralTotal} />
        </div>
        <div>
          <div className="section-label">Written</div>
          <Table rows={written} total={writtenTotal} />
          {mcqStats && mcqStats.total > 0 && (
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              Written section auto-scored from MCQs: {mcqStats.correct} of {mcqStats.total} correct.
            </p>
          )}
        </div>
      </div>

      <div className="row mt" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="section-label">Overall Score</div>
          <div className="stat-number">{grand} / 150</div>
        </div>
        <div style={{ maxWidth: 500 }}>
          <div className="section-label">Overall Comments</div>
          <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{interview.OverallComments || "-"}</div>
        </div>
      </div>
    </div>
  );
}