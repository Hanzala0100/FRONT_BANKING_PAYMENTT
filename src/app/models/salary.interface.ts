export interface SalaryDisbursement {
    id: number;
    clientId: number;
    employeeId: number;
    employeeName: string;
    employeeAccountNumber: string;
    amount: number;
    status: string;
    disbursementDate: string;
    createdAt: string;
    clientName: string;
}

export interface SalaryCreateRequest {
    clientId: number;
    employeeId: number;
    amount: number;
    disbursementDate: string;
}

export interface BatchSalaryCreateRequest {
    clientId: number;
    employees: BatchEmployeeSalary[];
    disbursementDate: string;
}

export interface BatchEmployeeSalary {
    employeeId: number;
    amount: number;
}

export interface BatchSalaryResponse {
    totalProcessed: number;
    successful: number;
    failed: number;
    processedSalaries: SalaryDisbursement[];
    errors: string[];
}

export interface BulkEmployeeImportResponse {
    totalRecords: number;
    successful: number;
    failed: number;
    importedEmployees: Employee[];
    errors: string[];
}