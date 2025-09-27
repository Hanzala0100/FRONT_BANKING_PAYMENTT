export interface VoucherLog {
    id: number;
    code: string;
    outletId: number;
    staffName: string;
    action: string;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
