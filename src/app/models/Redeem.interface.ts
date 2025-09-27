import { Outlet } from "./Outlet.interface";

export interface RedeemResponse {
    success: boolean;
    data: {
        timestamp: string;
        id: number;
        code: string;
        outletId: number;
        staffName: string;
        action: 'redeem_success' | 'redeem_fail_already_redeemed' | 'redeem_fail_invalid';
        updatedAt: string;
        createdAt: string;
        outlet: Outlet;
    };
}


export interface reedeemRequest {

    code: string;
}