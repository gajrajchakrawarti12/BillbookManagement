import type { EntityId } from "../interfaces/Company";
import type { Product, ProductView } from "../interfaces/Product";
import { apiRequest } from "./apiClient";

export async function getProducts(businessId: EntityId | undefined) {
  const products = await apiRequest<Record<string, unknown>[]>(
    `/businesses/${businessId}/products`,
  );
  return products.map(normalizeProduct);
}

export async function getProduct(businessId: EntityId, productId: EntityId) {
  const product = await apiRequest<Record<string, unknown>>(
    `/businesses/${businessId}/products/${productId}`,
  );
  return normalizeProduct(product);
}

function normalizeProduct(product: Record<string, unknown>): ProductView {
  return {
    businessId: (product.business_id ?? product.businessId) as EntityId,
    createdAt: String(product.created_at ?? product.createdAt ?? ""),
    updatedAt: String(product.updated_at ?? product.updatedAt ?? ""),
    id: (product.id ?? product._id) as EntityId,
    _id: String(product.id ?? product._id ?? ""),
    productCode: String(product.product_code ?? product.productCode ?? ""),
    sku: String(product.product_code ?? product.productCode ?? ""),
    name: String(product.name ?? ""),
    description: (product.description as string | null | undefined) ?? null,
    unitOfMeasure: String(product.unit_of_measure ?? product.unitOfMeasure ?? "unit"),
    unit: String(product.unit_of_measure ?? product.unitOfMeasure ?? "unit"),
    currentUnitPrice: Number(product.current_unit_price ?? product.currentUnitPrice ?? 0),
    sellingPrice: String(product.current_unit_price ?? product.currentUnitPrice ?? 0),
    defaultTaxRate: Number(product.default_tax_rate ?? product.defaultTaxRate ?? 0),
    active: Boolean(product.active ?? product.is_active ?? true),
    isActive: Boolean(product.active ?? product.is_active ?? true),
  };
}

export async function postProduct(
  businessId: EntityId,
  data: Partial<ProductView>,
) {
  return apiRequest<Product>(`/businesses/${businessId}/products`, {
    method: "POST",
    body: JSON.stringify({
      productCode: data.productCode ?? data.sku,
      name: data.name,
      description: data.description,
      unitOfMeasure: data.unitOfMeasure ?? data.unit,
      currentUnitPrice: data.currentUnitPrice ?? Number(data.sellingPrice ?? 0),
      defaultTaxRate: data.defaultTaxRate ?? 0,
      active: data.active ?? data.isActive ?? true,
    }),
  });
}

export async function putProduct(
  businessId: EntityId,
  productId: EntityId,
  data: Partial<ProductView>,
) {
  return apiRequest<Product>(`/businesses/${businessId}/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({
      productCode: data.productCode ?? data.sku,
      name: data.name,
      description: data.description,
      unitOfMeasure: data.unitOfMeasure ?? data.unit,
      currentUnitPrice: data.currentUnitPrice ?? Number(data.sellingPrice ?? 0),
      defaultTaxRate: data.defaultTaxRate ?? 0,
      active: data.active ?? data.isActive ?? true,
    }),
  });
}
