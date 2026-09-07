import { useNavigate } from "react-router-dom";
import QuestionForm from "../../components/questions/QuestionForm.jsx";
import { questionService } from "../../services/questionService.js";
import { Alert } from "../../components/common/UI.jsx";
import { useState } from "react";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (payload) => {
    try {
      const res = await questionService.create(payload);
      navigate(`/interviewer/questions/${res.data.QuestionId}/edit`, { state: { saved: true } });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="page-title">Create Question</h1>
      </div>
      <Alert>{error}</Alert>
      <QuestionForm onSubmit={handleSubmit} onCancel={() => navigate("/interviewer/questions")} />
    </div>
  );
}