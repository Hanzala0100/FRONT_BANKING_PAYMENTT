

export interface LoginRequest {
    pincode: string;
    staffName: string;
    outletId: number;
}


export interface LoginResponse {
    accessToken: string;
}


export interface LogoutResponse {
    success: boolean;
    message: string;
}