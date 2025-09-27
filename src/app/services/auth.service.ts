import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { LoginRequest, LoginResponse, LogoutResponse } from "../models/Login.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";


@Injectable({
    providedIn: 'root',
})

export class AuthService {
    constructor(private http: HttpClient) { }
    url = environment.apiUrl;

    login(data: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.url}/login`, { data: data });
    }

    logout(): Observable<LogoutResponse> {
        return this.http.post<LogoutResponse>(`${this.url}/vouchercodes/logout`, {});
    }
}

