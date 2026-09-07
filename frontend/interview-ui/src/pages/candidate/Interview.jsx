import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { interviewService } from "../../services/interviewService.js";
import { Spinner, Alert, StatusBadge } from "../../components/common/UI.jsx";

const TAB_ORDER = ["MCQ", "ORAL", "WRITTEN"];

export default function CandidateInterview() {
  const { id } = useParams();
  const interviewId = Number(id);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeTab, setTypeTab] = useState("MCQ");
  const [typeIndex, setTypeIndex] = useState(0);

  const load = (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    interviewService
      .get(interviewId)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (!silent) setError(err.message);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 4000);
    return () => clearInterval(timer);
  }, [interviewId]);

  const interview = data?.interview;
  const questions = data?.questions || [];
  const isCompleted = interview?.Status === "COMPLETED";
  const isActive = interview?.Status === "IN_PROGRESS";

  const grouped = useMemo(() => {
    const byType = { MCQ: [], ORAL: [], WRITTEN: [] };
    questions.forEach((q) => {
      if (byType[q.questionType]) byType[q.questionType].push(q);
    });
    return byType;
  }, [questions]);

  const availableTabs = useMemo(
    () => TAB_ORDER.filter((t) => grouped[t].length > 0),
    [grouped]
  );

  const typeQuestions = grouped[typeTab] || [];
  const answered = useMemo(
    () => typeQuestions.filter((q) => q.answer && (q.answer.candidateAnswer || q.answer.isAnswered)).length,
    [typeQuestions]
  );
  const question = typeQuestions[typeIndex] || null;

  const switchTab = (tab) => {
    setTypeTab(tab);
    setTypeIndex(0);
  };

  if (loading) return <Spinner />;
  if (!data) return <Alert>{error || "Interview not found."}</Alert>;

  return (
    <div>
      <div className="card">
        <div className="interview-header">
          <div className="interview-header-info">
            <h1 className="card-title" style={{ margin: 0 }}>Technical Interview</h1>
            <div className="muted">
              {interview.Position} &middot;{" "}
              {typeQuestions.length > 0
                ? `${answered}/${typeQuestions.length} ${typeTab}`
                : `${questions.length} question${questions.length !== 1 ? "s" : ""}`}
            </div>
          </div>
          <StatusBadge status={interview.Status} />
        </div>
      </div>

      <Alert>{error}</Alert>

      {interview.Status === "NOT_STARTED" && (
        <div className="card">
          <p className="muted">Your interview has not started yet. The interviewer will start the session when you are ready.</p>
        </div>
      )}

      {interview.Status === "CANCELLED" && (
        <div className="card"><Alert type="error">This interview has been cancelled.</Alert></div>
      )}

      {(isActive || isCompleted) && questions.length === 0 && (
        <div className="card"><Alert>No questions are available yet. The interviewer still needs to publish the oral/written questions. Please wait.</Alert></div>
      )}

      {(isActive || isCompleted) && questions.length > 0 && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {availableTabs.map((tab) => {
            const qs = grouped[tab];
            const ans = qs.filter((q) => q.answer && (q.answer.candidateAnswer || q.answer.isAnswered)).length;
            return (
              <button
                key={tab}
                className={`tab ${typeTab === tab ? "active" : ""}`}
                onClick={() => switchTab(tab)}
              >
                {tab} ({ans}/{qs.length})
              </button>
            );
          })}
          {availableTabs.length === 0 && (
            <div className="muted">No questions assigned.</div>
          )}
        </div>
      )}

      {(isActive || isCompleted) && typeQuestions.length > 0 && question && (
        <div className="card">
          {typeQuestions.length > 1 && (
            <div className="interview-q-nav" style={{ marginBottom: 14 }}>
              {typeQuestions.map((q, idx) => (
                <button
                  key={q.questionId}
                  className={`q-dot ${q.answer && (q.answer.candidateAnswer || q.answer.isAnswered) ? "answered" : ""} ${idx === typeIndex ? "active" : ""}`.trim()}
                  onClick={() => setTypeIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          <CandidateQuestion
            key={`${question.questionId}-${question.answer?.answerId || "new"}`}
            interviewId={interviewId}
            question={question}
            isCompleted={isCompleted}
            onAfterSave={load}
          />

          {isActive && (
            <div className="nav-buttons" style={{ marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                disabled={typeIndex === 0}
                onClick={() => setTypeIndex((i) => i - 1)}
              >
                &#8592; Previous
              </button>
              {typeIndex < typeQuestions.length - 1 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setTypeIndex((i) => i + 1)}
                >
                  Next &#8594;
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="card">
          <Alert type="success">Your interview has been completed. Thank you!</Alert>
        </div>
      )}
    </div>
  );
}

function CandidateQuestion({ interviewId, question, isCompleted, onAfterSave }) {
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [optionId, setOptionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const answer = question.answer;

  useEffect(() => {
    let opt = "";
    if (question.questionType === "MCQ" && answer?.candidateAnswer) {
      const label = answer.candidateAnswer.split(".")[0].trim();
      const match = (question.options || []).find((o) => String(o.label) === label);
      opt = match ? String(match.optionId) : "";
    }
    setCandidateAnswer(answer?.candidateAnswer || "");
    setOptionId(opt);
    setMsg("");
    setError("");
  }, [question.questionId, answer?.answerId]);

  const submit = async () => {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const payload = {
        questionId: question.questionId,
        optionId: optionId ? Number(optionId) : null
      };
      if (question.questionType === "ORAL") {
        if (!candidateAnswer.trim()) {
          setError("Please type your answer before submitting.");
          setSaving(false);
          return;
        }
        payload.candidateAnswer = candidateAnswer.trim();
      }
      if (question.answer?.answerId) {
        await interviewService.updateAnswer(interviewId, question.answer.answerId, payload);
      } else {
        await interviewService.saveAnswer(interviewId, payload);
      }
      setMsg("Answer saved.");
      onAfterSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Alert>{error}</Alert>
      {msg && <Alert type="success">{msg}</Alert>}

      <div className="section-label">{question.questionCode}</div>
      <div className="question-text">{question.questionText}</div>

      <div className="row mt">
        <span className={`badge badge-${question.questionType.toLowerCase()}`}>{question.questionType}</span>
        {question.category && <span className="badge">{question.category}</span>}
      </div>

      {question.questionType === "MCQ" && (
        <div className="mcq-list">
          {question.options.map((opt) => (
            <div
              key={opt.optionId}
              className={`mcq-option ${Number(opt.optionId) === Number(optionId) ? "selected" : ""}`}
              onClick={() => !isCompleted && setOptionId(String(opt.optionId))}
              style={!isCompleted ? { cursor: "pointer" } : undefined}
            >
              <strong>{opt.label}.</strong>
              <div style={{ flex: 1 }}>{opt.text}</div>
            </div>
          ))}
        </div>
      )}

      {question.questionType === "ORAL" && (
        <div className="field mt">
          <label>Your Answer</label>
          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            disabled={isCompleted}
            placeholder="Type your answer here"
            style={{ minHeight: 120 }}
          />
        </div>
      )}

      {question.questionType === "WRITTEN" && (
        <div className="field mt">
          <label>Your Answer</label>
          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            disabled={isCompleted}
            placeholder="Write your answer here"
            style={{ minHeight: 160 }}
          />
        </div>
      )}

      {question.answer?.candidateAnswer && question.questionType === "MCQ" && (
        <div className="muted mt">Your selection: <strong>{question.answer.candidateAnswer}</strong></div>
      )}

      {!isCompleted && (
        <button className="btn btn-success mt" onClick={submit} disabled={saving}>
          {saving ? "Saving..." : "Submit Answer"}
        </button>
      )}
    </div>
  );
}
