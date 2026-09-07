import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../components/common/ProtectedLayout.jsx";

import Login from "../pages/Login.jsx";

import InterviewerDashboard from "../pages/interviewer/Dashboard.jsx";
import Users from "../pages/interviewer/Users.jsx";
import CandidateList from "../pages/interviewer/CandidateList.jsx";
import CreateCandidate from "../pages/interviewer/CreateCandidate.jsx";
import CandidateDetails from "../pages/interviewer/CandidateDetails.jsx";
import QuestionBank from "../pages/interviewer/QuestionBank.jsx";
import CreateQuestion from "../pages/interviewer/CreateQuestion.jsx";
import EditQuestion from "../pages/interviewer/EditQuestion.jsx";
import InterviewScreen from "../pages/interviewer/InterviewScreen.jsx";
import ScoreView from "../pages/interviewer/ScoreView.jsx";

import CandidateDashboard from "../pages/candidate/Dashboard.jsx";
import CandidateInterview from "../pages/candidate/Interview.jsx";

function Home() {
  return <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/interviewer/dashboard"
        element={<ProtectedLayout role="INTERVIEWER"><InterviewerDashboard /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/users"
        element={<ProtectedLayout role="INTERVIEWER"><Users /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/candidates"
        element={<ProtectedLayout role="INTERVIEWER"><CandidateList /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/candidates/new"
        element={<ProtectedLayout role="INTERVIEWER"><CreateCandidate /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/candidates/:id"
        element={<ProtectedLayout role="INTERVIEWER"><CandidateDetails /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/questions"
        element={<ProtectedLayout role="INTERVIEWER"><QuestionBank /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/questions/new"
        element={<ProtectedLayout role="INTERVIEWER"><CreateQuestion /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/questions/:id/edit"
        element={<ProtectedLayout role="INTERVIEWER"><EditQuestion /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/scores"
        element={<ProtectedLayout role="INTERVIEWER"><ScoreView /></ProtectedLayout>}
      />
      <Route
        path="/interviewer/interviews/:id"
        element={<ProtectedLayout role="INTERVIEWER"><InterviewScreen /></ProtectedLayout>}
      />

      <Route
        path="/candidate/dashboard"
        element={<ProtectedLayout role="CANDIDATE"><CandidateDashboard /></ProtectedLayout>}
      />
      <Route
        path="/candidate/interview/:id"
        element={<ProtectedLayout role="CANDIDATE"><CandidateInterview /></ProtectedLayout>}
      />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}