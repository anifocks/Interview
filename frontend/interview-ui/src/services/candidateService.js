import { api } from "../utils/api.js";

export const candidateService = {
  list: () => api.request("/candidates"),
  get: (id) => api.request(`/candidates/${id}`),
  create: (payload) => api.request("/candidates", { method: "POST", body: payload }),
  update: (id, payload) => api.request(`/candidates/${id}`, { method: "PUT", body: payload }),
  remove: (id) => api.request(`/candidates/${id}`, { method: "DELETE" })
};