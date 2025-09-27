import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { RedeemResponse, reedeemRequest } from "../models/Redeem.interface";
import { VoucherResponse } from "../models/VoucherResponse.interface";

@Injectable({
    providedIn: 'root',
})
export class VoucherService {
    constructor(private http: HttpClient) { }
    url = environment.apiUrl;

    redeemVoucher(data: reedeemRequest): Observable<RedeemResponse> {
        return this.http.post<RedeemResponse>(`${this.url}/vouchercodes/redeem`, { data: data });
    }

    getAllVouchers(): Observable<VoucherResponse> {
        return this.http.get<VoucherResponse>(`${this.url}/vouchercodes/getAllAvailableVouchers`);
    }
}