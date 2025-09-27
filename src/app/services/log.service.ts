import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { VoucherLog } from "../models/Logs.interface";


@Injectable({
    providedIn: 'root',
})

export class LogService {
    constructor(private http: HttpClient) { }
    url = environment.apiUrl;

    getAllLogs(): Observable<VoucherLog[]> {
        return this.http.get<VoucherLog[]>(`${this.url}/vouchercodes/getAllLogs`);
    }


}