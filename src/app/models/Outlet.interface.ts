export interface Outlet {
    id: number;
    name: string;
    pincode: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface OutletResponse {
    data: Outlet[];
}
