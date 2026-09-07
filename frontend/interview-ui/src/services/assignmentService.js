import { api } from "../utils/api.js";

export const assignmentService = {
  getForCandidate: (candidateId) => api.request(`/candidates/${candidateId}/questions`),
  replaceForCandidate: (candidateId, questionIds) =>
    api.request(`/candidates/${candidateId}/questions`, {
      method: "POST",
      body: { questionIds }
    }),
  removeAssignment: (candidateId, questionId) =>
    api.request(`/candidates/${candidateId}/questions/${questionId}`, { method: "DELETE" }),
  publishQuestion: (candidateId, questionId) =>
    api.request(`/candidates/${candidateId}/questions/${questionId}/publish`, { method: "POST" }),
  unpublishQuestion: (candidateId, questionId) =>
    api.request(`/candidates/${candidateId}/questions/${questionId}/publish`, { method: "DELETE" }),
  publishAllForCandidate: (candidateId) =>
    api.request(`/candidates/${candidateId}/questions/publish-all`, { method: "POST" }),
  getForQuestion: (questionId) => api.request(`/questions/${questionId}/candidates`),
  replaceForQuestion: (questionId, candidateIds) =>
    api.request(`/questions/${questionId}/candidates`, {
      method: "PUT",
      body: { candidateIds }
    })
};