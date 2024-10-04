export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    count?: number;
    data: Product | Product[]
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}
