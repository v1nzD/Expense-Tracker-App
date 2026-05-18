import api from "./client";

type Register = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
  };
};

export const registerUser = async (data: Register) => {
  try {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  try {
    const res = await api.post("/auth/login", data);

    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
