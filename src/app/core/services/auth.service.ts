import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { LoginRequest, LoginResponse } from "../../shared/models/Auth.interface";
import { ApiResponse } from "../../shared/models/ApiResponse.interface";


@Injectable({
    providedIn: 'root',
})

export class AuthService {
    constructor(private http: HttpClient) { }
    url = environment.apiUrl + '/Auth';

    login(data: LoginRequest): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.url}/login`, data);
    }

    logout(): Observable<ApiResponse<null>> {
        return this.http.post<ApiResponse<null>>(`${this.url}/logout`, {});
    }
}

