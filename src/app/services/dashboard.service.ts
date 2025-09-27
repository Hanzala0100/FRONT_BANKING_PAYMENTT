import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { OutletDataResponse, VoucherStatsResponse } from "../models/VoucherResponse.interface";
import { OutletResponse } from "../models/Outlet.interface";

@Injectable({
    providedIn: 'root',
})

export class DashboardService {

    constructor(private http: HttpClient) { }
    url = environment.apiUrl;

    getSuccessfulRedeemsPerOutlet(): Observable<OutletDataResponse> {
        return this.http.get<OutletDataResponse>(`${this.url}/vouchercodes/getSuccessfulRedeemsPerOutlet`);
    }

    getAllVouchersData(): Observable<VoucherStatsResponse> {
        return this.http.get<VoucherStatsResponse>(`${this.url}/vouchercodes/getAllVouchersData`);
    }

    getAllOutlets(): Observable<OutletResponse> {
        return this.http.get<OutletResponse>(`${this.url}/vouchercodes/getAllOutlets`);
    }
}