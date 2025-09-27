export interface Voucher {
    id: number;
    code: string;
    status: string;
    redeemedAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface VoucherResponse {
    count: number;
    data: Voucher[];
}



// http://localhost:5500/vouchercodes/
export interface VoucherCodeResponse {
    data: Voucher[];
}

export interface VoucherStatsResponse {
    totalVouchers: number;
    totalAvailableVouchers: number;
    totalRedemeedVouchers: number;
}



export interface OutletData {
    id: number;
    name: string;
    pincode: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    successful_redeems: number;
}

export interface OutletDataResponse {
    [outletName: string]: OutletData;
}
