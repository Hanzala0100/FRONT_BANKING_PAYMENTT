import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/ApiResponse.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { ClientVerificationRequest } from "../models/Document.interface";
import { User, UserCreateRequest } from "../models/User.interface";
import { Payment, PaymentApprovalRequest } from "../models/Payment.inteface";
import { Client, ClientCreateRequest, ClientUserCreateRequest } from "../models/Client.interface";

@Injectable({
    providedIn: 'root',
})
export class BankUserService {
    constructor(private http: HttpClient) { }

    private baseUrl = environment.apiUrl + '/bankuser';

    // CLIENT MANAGEMENT

    createClient(clientData: ClientCreateRequest): Observable<ApiResponse<Client>> {
        return this.http.post<ApiResponse<Client>>(`${this.baseUrl}/clients`, clientData);
    }

    getAllClients(): Observable<ApiResponse<Client[]>> {
        return this.http.get<ApiResponse<Client[]>>(`${this.baseUrl}/clients`);
    }

    getClientById(clientId: number): Observable<ApiResponse<Client>> {
        return this.http.get<ApiResponse<Client>>(`${this.baseUrl}/clients/${clientId}`);
    }

    updateClient(clientId: number, clientData: Client): Observable<ApiResponse<Client>> {
        return this.http.put<ApiResponse<Client>>(`${this.baseUrl}/clients/${clientId}`, clientData);
    }

    deleteClient(clientId: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/clients/${clientId}`);
    }

    // CLIENT VERIFICATION

    verifyClient(clientId: number, request: ClientVerificationRequest): Observable<ApiResponse<Client>> {
        return this.http.put<ApiResponse<Client>>(`${this.baseUrl}/clients/${clientId}/verify`, request);
    }

    getClientsByVerificationStatus(status: string): Observable<ApiResponse<Client[]>> {
        return this.http.get<ApiResponse<Client[]>>(`${this.baseUrl}/clients/verification-status/${status}`);
    }

    getClientsWithPendingVerification(): Observable<ApiResponse<Client[]>> {
        return this.http.get<ApiResponse<Client[]>>(`${this.baseUrl}/clients/pending-verification`);
    }

    // CLIENT DOCUMENTS

    uploadClientDocument(clientId: number, documentData: FormData): Observable<ApiResponse<Document>> {
        return this.http.post<ApiResponse<Document>>(`${this.baseUrl}/clients/${clientId}/documents`, documentData);
    }

    getClientDocuments(clientId: number): Observable<ApiResponse<Document[]>> {
        return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/clients/${clientId}/documents`);
    }

    // CLIENT USER MANAGEMENT

    createClientUser(clientId: number, userData: UserCreateRequest): Observable<ApiResponse<ClientUserCreateRequest>> {
        return this.http.post<ApiResponse<ClientUserCreateRequest>>(`${this.baseUrl}/clients/${clientId}/users`, userData);
    }

    getClientUsers(clientId: number): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/clients/${clientId}/users`);
    }

    getClientUserById(clientId: number, userId: number): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.baseUrl}/clients/${clientId}/users/${userId}`);
    }

    deleteClientUser(clientId: number, userId: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/clients/${clientId}/users/${userId}`);
    }

    // PAYMENT MANAGEMENT

    getPendingPayments(): Observable<ApiResponse<Payment[]>> {
        return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments/pending`);
    }

    getPaymentsByStatus(status: string): Observable<ApiResponse<Payment[]>> {
        const params = new HttpParams().set('status', status);
        return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments`, { params });
    }

    getPaymentById(paymentId: number): Observable<ApiResponse<Payment>> {
        return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/payments/${paymentId}`);
    }

    approvePayment(paymentId: number, request: PaymentApprovalRequest): Observable<ApiResponse<Payment>> {
        return this.http.put<ApiResponse<Payment>>(`${this.baseUrl}/payments/${paymentId}/approve`, request);
    }

    rejectPayment(paymentId: number, request: PaymentApprovalRequest): Observable<ApiResponse<Payment>> {
        return this.http.put<ApiResponse<Payment>>(`${this.baseUrl}/payments/${paymentId}/reject`, request);
    }
}