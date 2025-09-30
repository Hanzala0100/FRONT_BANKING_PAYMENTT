export interface Beneficiary {
    beneficiaryId: number;
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