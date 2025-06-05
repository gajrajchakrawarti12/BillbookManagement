interface Product {
  price: number;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  sku?: string;
  description?: string;
  hsn?: string;
  category?: string;
  basePrice?:string;
  sellingPrice: string;
  purchasePrice?: string;
  stockQty?: string;
  unit?: string;
  taxGroup?: string;
  images?: string[];
  isActive?: boolean;
  lowStockAlert?: string;
  barcode?: string;
  companyId?: string;
  tags?: string[];
  attributes?: {
    [key: string]: string;
  };
}

export type { Product }; 