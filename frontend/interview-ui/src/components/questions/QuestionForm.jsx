import { useState } from "react";
import { Alert } from "../common/UI.jsx";

const CATEGORIES = [
  "Requirement", "Python", "PostgreSQL", "Data Pipeline", "API",
  "System Design", "RLS", "Problem Solving", "Communication", "GenAI",
  "Architecture", "RAG", "Deployment", "ML"
];

const DIFFICULTIES = ["Easy", "Medium", "Tough"];

const emptyOptions = [
  { optionLabel: "A", optionText: "", isCorrect: true },
  { optionLabel: "B", optionText: "", isCorrect: false },
  { optionLabel: "C", optionText: "", isCorrect: false },
  { optionLabel: "D", optionText: "", isCorrect: false }
];

export default function QuestionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      questionCode: "",
      questionText: "",
      questionType: "ORAL",
      category: "",
      difficulty: "Medium",
      expectedAnswer: "",
      weakAnswer: "",
      isCommon: false,
      options: emptyOptions
    }
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setBool = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const setType = (type) => setForm((f) => ({ ...f, questionType: type }));

  const setOption = (index, key, value) => {
    setForm((f) => {
      const options = f.options.map((o, i) => (i === index ? { ...o, [key]: value } : o));
      return { ...f, options };
    });
  };

  const setCorrect = (index) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, isCorrect: i === index }))
    }));
  };

  const addOption = () => {
    setForm((f) => {
      const label = String.fromCharCode(65 + f.options.length);
      return { ...f, options: [...f.options, { optionLabel: label, optionText: "", isCorrect: false }] };
    });
  };

  const removeOption = (index) => {
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.questionText.trim()) return setError("Question text is required.");
    if (!form.category.trim()) return setError("Category is required.");
    if (!form.difficulty.trim()) return setError("Difficulty is required.");
    if (form.questionType === "MCQ") {
      const filled = form.options.filter((o) => o.optionText.trim());
      if (filled.length < 4) return setError("MCQ needs all four options with text.");
      if (!filled.some((o) => o.isCorrect)) return setError("Select a correct option.");
    }

    setBusy(true);
    try {
      const payload = { ...form, isCommon: Boolean(form.isCommon) };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <Alert>{error}</Alert>

      <div className="form-grid">
        <div className="field">
          <label>Question Type</label>
          <div className="radio-row">
            <label>
              <input type="radio" name="qtype" checked={form.questionType === "ORAL"} onChange={() => setType("ORAL")} />
              Oral
            </label>
            <label>
              <input type="radio" name="qtype" checked={form.questionType === "MCQ"} onChange={() => setType("MCQ")} />
              MCQ
            </label>
            <label>
              <input type="radio" name="qtype" checked={form.questionType === "WRITTEN"} onChange={() => setType("WRITTEN")} />
              Written
            </label>
          </div>
        </div>

        <div className="field">
          <label>Question Code (optional)</label>
          <input value={form.questionCode} onChange={set("questionCode")} placeholder="Auto-generated if blank, e.g. MCQ-11" />
        </div>

        <div className={`field ${form.questionType === "MCQ" ? "full" : ""}`}>
          <label>Question *</label>
          <textarea value={form.questionText} onChange={set("questionText")} placeholder="Enter the question text" />
        </div>

        <div className="field">
          <label>Category</label>
          <input list="category-list" value={form.category} onChange={set("category")} />
          <datalist id="category-list">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div className="field">
          <label>Difficulty</label>
          <select value={form.difficulty} onChange={set("difficulty")}>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="field full">
          <label>Common Question?</label>
          <label className="radio-row">
            <input type="checkbox" checked={form.isCommon} onChange={setBool("isCommon")} />
            This question is asked to all candidates
          </label>
        </div>

        <div className="field full">
          <label>Expected Answer (interviewer only)</label>
          <textarea value={form.expectedAnswer} onChange={set("expectedAnswer")} />
        </div>

        <div className="field full">
          <label>Weak Answer (interviewer only)</label>
          <textarea value={form.weakAnswer} onChange={set("weakAnswer")} />
        </div>

        {form.questionType === "MCQ" && (
          <div className="field full">
            <label>Options</label>
            {form.options.map((opt, idx) => (
              <div className="row" key={idx} style={{ marginBottom: 8 }}>
                <span className="badge">{opt.optionLabel}</span>
                <input
                  style={{ flex: 1 }}
                  value={opt.optionText}
                  placeholder={`Option ${opt.optionLabel}`}
                  onChange={(e) => setOption(idx, "optionText", e.target.value)}
                />
                <label className="nowrap" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="correct"
                    checked={opt.isCorrect}
                    onChange={() => setCorrect(idx)}
                  /> Correct Answer
                </label>
                {form.options.length > 2 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOption(idx)}>x</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>+ Add option</button>
          </div>
        )}
      </div>

      <div className="row mt">
        <button className="btn" type="submit" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        {onCancel && (
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}