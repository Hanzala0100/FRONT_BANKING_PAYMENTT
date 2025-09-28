import { VerificationStatus } from "../enums/Verification-status.enum";


export interface Client {
    id: number;
    name: string;
    registrationNumber: string;
    address: string;
    verificationStatus: VerificationStatus;
    verifiedBy?: number;
    verifiedAt?: string;
    bankId: number;
    bankName: string;
    totalEmployees: number;
    totalBeneficiaries: number;
    totalPayments: number;
}

export interface ClientCreateRequest {
    name: string;
    registrationNumber: string;
    address: string;
    bankId: number;
    bankName: string;
}

export interface ClientUserCreateRequest {
    id: number;
    username: string;
    fullName: string;
    password: string;
    email: string;
    role: string;
    clientId?: number;
}

export interface ClientVerificationRequest {
    verificationStatus: VerificationStatus;
    notes: string;
}