export interface Bank {
  id: number;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  adminUsername: string;
  adminId: number;
  totalClients: number;
  totalUsers: number;
}

export interface BankCreateRequest {
  bankName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  adminUsername: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
}
