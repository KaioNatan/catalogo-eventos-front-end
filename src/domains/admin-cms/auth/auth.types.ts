export interface IAdminUser {
  id: number;
  name: string;
  email: string;
  role: "Admin";
  /** Access JWT (Bearer) — legado: alguns testes usam o nome `token`. */
  token: string;
}

export interface IAdminAuthSession {
  user: IAdminUser;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthContextValue {
  user: IAdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
