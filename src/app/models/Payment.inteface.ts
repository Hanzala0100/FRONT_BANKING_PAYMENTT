

export interface Payment {
    id: number;
    clientId?: number;
    beneficiaryId?: number;
    beneficiaryName: string;
    beneficiaryAccountNumber: string;
    amount: number;
    paymentDate: string;
    status: string;
    approvedBy?: number;
    approvedByName: string;
    createdAt: string;
    clientName: string;
}

export interface PaymentCreateRequest {
    clientId: number;
    beneficiaryId: number;
    amount: number;
    paymentDate: string;
}

export interface PaymentApprovalRequest {
    notes: string;
}