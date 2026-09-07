import { api } from "../utils/api.js";

export const questionService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "")
    ).toString();
    return api.request(`/questions${qs ? `?${qs}` : ""}`);
  },
  listCommon: () => api.request("/questions/common"),
  listOral: () => api.request("/questions/oral"),
  get: (id) => api.request(`/questions/${id}`),
  create: (payload) => api.request("/questions", { method: "POST", body: payload }),
  update: (id, payload) => api.request(`/questions/${id}`, { method: "PUT", body: payload }),
  setStatus: (id, isActive) => api.request(`/questions/${id}/status`, { method: "PATCH", body: { isActive } }),
  remove: (id) => api.request(`/questions/${id}`, { method: "DELETE" })
};