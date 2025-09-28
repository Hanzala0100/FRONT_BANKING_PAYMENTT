export interface Beneficiary {
    id: number;
    clientId: number;
    fullName: string;
    accountNumber: number;
    bankName: string;
    ifscCode: string;
    totalPayments: number;
}

export interface BeneficiaryCreateRequest {
    clientId: number;
    fullName: string;
    accountNumber: number;
    bankName: string;
    ifscCode: string;
}