export interface Employee {
    clientId: number;
    username: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    accountNumber: number;
    bankName: string;
    ifscCode: string;
    salaryAmount: number;
}

export interface EmployeeCreateRequest extends Employee { }