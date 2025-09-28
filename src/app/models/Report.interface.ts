export interface Report {
    id: number;
    type: string;
    generatedAt: string;
    fileUrl?: string;
    generatedBy: number;
    generatedByName?: string;
}

export interface ReportStatistics {
    totalReports: number;
    reportsByType: { [key: string]: number };
    recentReports: RecentReport[];
}

export interface RecentReport {
    id: number;
    type: string;
    generatedAt: string;
}

export interface DownloadResponse {
    data: Report;
    downloadUrl: string;
    downloadError?: string;
}