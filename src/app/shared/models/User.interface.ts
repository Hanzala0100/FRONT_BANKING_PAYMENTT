export interface User {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  role: string;
  bankId: number | null;
  bankName: string | null;
  clientId: number | null;
  clientName: string | null;
}

export interface UserCreateRequest {
  fullName: string;
  email: string;
  userName: string;
  password: string;
  role: string;
  clientId?: number;
}
