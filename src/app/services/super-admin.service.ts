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

    private baseUrl = environment.apiUrl + '/SuperAdmin';

    createBank(bankData: BankCreateRequest): Observable<ApiResponse<Bank>> {
        return this.http.post<ApiResponse<Bank>>(`${this.baseUrl}/banks`, bankData);
    }

    getAllBanks(): Observable<ApiResponse<Bank[]>> {
        return this.http.get<ApiResponse<Bank[]>>(`${this.baseUrl}/banks`);
    }

    getBankById(id: number): Observable<ApiResponse<Bank>> {
        return this.http.get<ApiResponse<Bank>>(`${this.baseUrl}/banks/${id}`);
    }

    deleteBank(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/banks/${id}`);
    }
}