import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../../shared/models/ApiResponse.interface";
import { DownloadResponse, ReportStatistics, Report } from "../../shared/models/Report.interface";


@Injectable({
    providedIn: 'root',
})
export class ReportService {
    constructor(private http: HttpClient) { }

    private baseUrl = environment.apiUrl + '/report';

    generateReport(): Observable<ApiResponse<Report>> {
        return this.http.post<ApiResponse<Report>>(`${this.baseUrl}/generate-report`, {});
    }

    getMyReports(): Observable<ApiResponse<Report[]>> {
        return this.http.get<ApiResponse<Report[]>>(`${this.baseUrl}/my-reports`);
    }

    getReportById(id: number): Observable<ApiResponse<Report>> {
        return this.http.get<ApiResponse<Report>>(`${this.baseUrl}/${id}`);
    }

    downloadReport(id: number): Observable<ApiResponse<DownloadResponse>> {
        return this.http.get<ApiResponse<DownloadResponse>>(`${this.baseUrl}/download-report/${id}`);
    }

    deleteReport(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    }

    getReportStatistics(): Observable<ApiResponse<ReportStatistics>> {
        return this.http.get<ApiResponse<ReportStatistics>>(`${this.baseUrl}/statistics`);
    }
}