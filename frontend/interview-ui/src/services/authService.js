import { authApi } from "../utils/api.js";

export const authService = {
  login: (username, password) =>
    authApi.request("/auth/login", { method: "POST", body: { username, password } }),
  register: (payload) =>
    authApi.request("/auth/register", { method: "POST", body: payload }),
  me: () => authApi.request("/auth/me"),
  listUsers: () => authApi.request("/auth/users"),
  createUser: (payload) => authApi.request("/auth/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => authApi.request(`/auth/users/${id}`, { method: "PUT", body: payload }),
  deactivateUser: (id) => authApi.request(`/auth/users/${id}/deactivate`, { method: "PATCH" }),
  activateUser: (id) => authApi.request(`/auth/users/${id}/activate`, { method: "PATCH" })
};