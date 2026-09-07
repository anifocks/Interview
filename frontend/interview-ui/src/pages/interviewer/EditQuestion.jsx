import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionForm from "../../components/questions/QuestionForm.jsx";
import { questionService } from "../../services/questionService.js";
import { Alert, Spinner } from "../../components/common/UI.jsx";

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    questionService
      .get(id)
      .then((res) => {
        const q = res.data;
        setInitial({
          questionCode: q.QuestionCode,
          questionText: q.QuestionText,
          questionType: q.QuestionType,
          category: q.Category,
          difficulty: q.Difficulty,
          expectedAnswer: q.ExpectedAnswer,
          weakAnswer: q.WeakAnswer,
          isCommon: Boolean(q.IsCommon),
          options: (q.Options || []).map((o) => ({
            optionLabel: o.OptionLabel,
            optionText: o.OptionText,
            isCorrect: Boolean(o.IsCorrect)
          }))
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    await questionService.update(id, payload);
    navigate("/interviewer/questions");
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="card-header">
        <h1 className="page-title">Edit Question</h1>
      </div>
      <Alert>{error}</Alert>
      <QuestionForm
        initial={initial}
        key={initial?.questionCode || "q"}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/interviewer/questions")}
      />
    </div>
  );
}