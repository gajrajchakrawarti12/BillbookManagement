import type { EntityId, IsoDateTime } from "./Company";

export interface Product {
  id: EntityId;
  businessId: EntityId;
  productCode: string;
  name: string;
  description: string | null;
  unitOfMeasure: string;
  currentUnitPrice: number;
  defaultTaxRate: number;
  isActive: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  _id?: string;
  sku?: string;
  hsn?: string;
  category?: string;
  price?: number;
  sellingPrice?: string;
  stockQty?: string;
  unit?: string;
  lowStockAlert?: string;
  active?: boolean;
}

export interface ProductForm {
  name: string;
  productCode: string;
  description: string;
  unitOfMeasure: string;
  currentUnitPrice: string;
  defaultTaxRate: string;
}

export type ProductView = Product & {
  _id?: string;
  sku?: string;
  category?: string;
  sellingPrice?: string;
  stockQty?: string;
  unit?: string;
  isActive?: boolean;
  lowStockAlert?: string;
  companyId?: string;
  active?: boolean;
};
