export interface Employee {
  employeeId: number;
  clientId: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  accountNumber: number;
  bankName: string;
  ifsccode: string;
  salaryAmount: number;
}

export interface EmployeeCreateRequest {

  clientId: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  accountNumber: number;
  bankName: string;
  ifsccode: string;
  salaryAmount: number;
}


