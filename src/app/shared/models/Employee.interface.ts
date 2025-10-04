export interface Employee {
  employeeId: number;
  clientId: number;
  userName: string;
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
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  accountNumber: number;
  bankName: string;
  ifsccode: string;
  salaryAmount: number;
}




export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
export interface EmployeePaginatedResponse {
  data: Employee[];
  pagination: Pagination;
  message: string;
  success: boolean;
}



