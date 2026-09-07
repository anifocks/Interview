import { api } from "../utils/api.js";

export const interviewService = {
  create: (candidateId) =>
    api.request("/interviews", { method: "POST", body: { candidateId } }),
  list: () => api.request("/interviews"),
  mine: () => api.request("/interviews/mine"),
  forCandidate: (candidateId) => api.request(`/interviews/candidate/${candidateId}`),
  get: (id) => api.request(`/interviews/${id}`),
  getQuestions: (id) => api.request(`/interviews/${id}/questions`),
  start: (id) => api.request(`/interviews/${id}/start`, { method: "PUT" }),
  complete: (id, payload) =>
    api.request(`/interviews/${id}/complete`, { method: "PUT", body: payload }),
  saveAnswer: (interviewId, payload) =>
    api.request(`/interviews/${interviewId}/answers`, { method: "POST", body: payload }),
  updateAnswer: (interviewId, answerId, payload) =>
    api.request(`/interviews/${interviewId}/answers/${answerId}`, {
      method: "PUT",
      body: payload
    })
};