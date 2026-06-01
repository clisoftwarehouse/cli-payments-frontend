export type AuthUser = {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: { id: number; name: string } | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: AuthUser;
};
