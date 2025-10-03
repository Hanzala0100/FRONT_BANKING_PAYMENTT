import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../../shared/models/ApiResponse.interface";
import { User, UserCreateRequest } from "../../shared/models/User.interface";
import { Employee, EmployeeCreateRequest, EmployeePaginatedResponse } from "../../shared/models/Employee.interface";
import { BatchSalaryCreateRequest, BatchSalaryResponse, BulkEmployeeImportResponse, SalaryCreateRequest, SalaryDisbursement } from "../../shared/models/Salary.interface";
import { Beneficiary, BeneficiaryCreateRequest, BeneficiaryPaginatedData } from "../../shared/models/Beneficiary.interface";
import { Payment, PaymentCreateRequest } from "../../shared/models/Payment.inteface";

@Injectable({
  providedIn: 'root',
})
export class ClientUserService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/Client';

  // USER MANAGEMENT

  createUser(userData: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users`, userData);
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`);
  }

  getUserById(userId: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`);
  }

  // EMPLOYEE MANAGEMENT

  createEmployee(employeeData: EmployeeCreateRequest): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.baseUrl}/employees`, employeeData);
  }

  updateEmployee(employeeId: number, employeeData: Employee): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/employees/${employeeId}`, employeeData);
  }

  deleteEmployee(employeeId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/employees/${employeeId}`);
  }

  getEmployeeById(employeeId: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.baseUrl}/employees/${employeeId}`);
  }

  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.baseUrl}/employees`);
  }


  getPaginatedEmployees(pageNumber: number, pageSize: number, clientId?: number, searchTerm?: string, sortDescending?: boolean): Observable<ApiResponse<EmployeePaginatedResponse>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    if (clientId) {
      params = params.set('ClientId', clientId.toString());
    }
    if (searchTerm) {
      params = params.set('SearchTerm', searchTerm);
    }
    if (sortDescending !== undefined) {
      params = params.set('SortDescending', sortDescending.toString());
    }
    return this.http.get<ApiResponse<EmployeePaginatedResponse>>(`${this.baseUrl}/paginated-employee`, { params });
  }
  bulkImportEmployees(csvFile: File): Observable<ApiResponse<BulkEmployeeImportResponse>> {
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    return this.http.post<ApiResponse<BulkEmployeeImportResponse>>(`${this.baseUrl}/employees/bulk-import`, formData);
  }

  // BENEFICIARY MANAGEMENT

  createBeneficiary(beneficiaryData: BeneficiaryCreateRequest): Observable<ApiResponse<Beneficiary>> {
    return this.http.post<ApiResponse<Beneficiary>>(`${this.baseUrl}/beneficiaries`, beneficiaryData);
  }

  getBeneficiaries(): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(`${this.baseUrl}/beneficiaries`);
  }

  getBeneficiaryById(beneficiaryId: number): Observable<ApiResponse<Beneficiary>> {
    return this.http.get<ApiResponse<Beneficiary>>(`${this.baseUrl}/beneficiaries/${beneficiaryId}`);
  }

  updateBeneficiary(beneficiaryId: number, beneficiaryData: Beneficiary): Observable<ApiResponse<Beneficiary>> {
    return this.http.put<ApiResponse<Beneficiary>>(`${this.baseUrl}/beneficiaries/${beneficiaryId}`, beneficiaryData);
  }

  deleteBeneficiary(beneficiaryId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/beneficiaries/${beneficiaryId}`);
  }

  getPaginatedBeneficiaries(pageNumber: number, pageSize: number, clientId?: number, searchTerm?: string, sortDescending?: boolean): Observable<ApiResponse<BeneficiaryPaginatedData>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    if (clientId) {
      params = params.set('ClientId', clientId.toString());
    }
    if (searchTerm) {
      params = params.set('SearchTerm', searchTerm);
    }
    if (sortDescending !== undefined) {
      params = params.set('SortDescending', sortDescending.toString());
    }
    return this.http.get<ApiResponse<BeneficiaryPaginatedData>>(`${this.baseUrl}/paginated-beneficiary`, { params });
  }

  // PAYMENT MANAGEMENT

  createPayment(paymentData: PaymentCreateRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/payments`, paymentData);
  }

  getPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments`);
  }

  getPaymentById(paymentId: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/payments/${paymentId}`);
  }

  deletePayment(paymentId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/payments/${paymentId}`);
  }



  // SALARY DISBURSEMENT

  createSalaryDisbursement(salaryData: SalaryCreateRequest): Observable<ApiResponse<SalaryDisbursement>> {
    return this.http.post<ApiResponse<SalaryDisbursement>>(`${this.baseUrl}/salary-disbursements`, salaryData);
  }

  createBatchSalaryDisbursement(batchData: BatchSalaryCreateRequest): Observable<ApiResponse<BatchSalaryResponse>> {
    return this.http.post<ApiResponse<BatchSalaryResponse>>(`${this.baseUrl}/salary-disbursements/batch`, batchData);
  }

  getSalaryDisbursements(): Observable<ApiResponse<SalaryDisbursement[]>> {
    return this.http.get<ApiResponse<SalaryDisbursement[]>>(`${this.baseUrl}/salary-disbursements`);
  }

  processSalaryDisbursement(salaryId: number): Observable<ApiResponse<SalaryDisbursement>> {
    return this.http.post<ApiResponse<SalaryDisbursement>>(`${this.baseUrl}/salary-disbursements/${salaryId}/process`, {});
  }

  // DOCUMENT MANAGEMENT

  uploadDocument(documentData: FormData): Observable<ApiResponse<Document>> {
    return this.http.post<ApiResponse<Document>>(`${this.baseUrl}/documents`, documentData);
  }

  getDocuments(): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/documents`);
  }

  getDocumentById(documentId: number): Observable<ApiResponse<Document>> {
    return this.http.get<ApiResponse<Document>>(`${this.baseUrl}/documents/${documentId}`);
  }

  getDocumentsByType(docType: string): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/documents/type/${docType}`);
  }

  updateDocument(documentId: number, documentData: FormData): Observable<ApiResponse<Document>> {
    return this.http.put<ApiResponse<Document>>(`${this.baseUrl}/documents/${documentId}`, documentData);
  }

  deleteDocument(documentId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/documents/${documentId}`);
  }
}
