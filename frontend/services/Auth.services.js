import API from "../api/axios";

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const logoutUser = () => {
  return API.post("/auth/logout");
};

export const getProfile = () => {
  return API.get("/auth/me");
};