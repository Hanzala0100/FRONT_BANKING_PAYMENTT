import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { ApiResponse } from "../models/ApiResponse.interface";
import { Bank, BankCreateRequest } from "../models/Bank.interface";

@Injectable({
    providedIn: 'root',
})
export class SuperAdminService {
    constructor(private http: HttpClient) { }

    private baseUrl = environment.apiUrl + '/superadmin';

    // Create a new bank
    createBank(bankData: BankCreateRequest): Observable<ApiResponse<Bank>> {
        return this.http.post<ApiResponse<Bank>>(`${this.baseUrl}/banks`, bankData);
    }

    // Get all banks
    getAllBanks(): Observable<ApiResponse<Bank[]>> {
        return this.http.get<ApiResponse<Bank[]>>(`${this.baseUrl}/banks`);
    }

    // Get bank by ID
    getBankById(id: number): Observable<ApiResponse<Bank>> {
        return this.http.get<ApiResponse<Bank>>(`${this.baseUrl}/banks/${id}`);
    }

    // Delete a bank
    deleteBank(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/banks/${id}`);
    }
}