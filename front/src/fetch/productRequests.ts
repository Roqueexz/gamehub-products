import type { ProductDTO } from "@/dto/ProductDTO";
import { apiRequest } from "@/fetch/api";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: string;
  maxPrice?: string;
}

export interface ProductListResponse {
  data: ProductDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
}

export function getProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  return apiRequest<ProductListResponse>(`/products?${params.toString()}`);
}

export function createProduct(product: Omit<ProductDTO, "id">) {
  return apiRequest<ProductDTO>("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
}

export function updateProduct(id: number, product: Partial<Omit<ProductDTO, "id">>) {
  return apiRequest<ProductDTO>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product)
  });
}

export function deleteProduct(id: number) {
  return apiRequest<{ message: string }>(`/products/${id}`, {
    method: "DELETE"
  });
}

export function getProductStats() {
  return apiRequest<CategoryStats[]>("/products/stats");
}

export function getLowStockProducts(threshold?: number) {
  const params = threshold ? `?threshold=${threshold}` : "";
  return apiRequest<ProductDTO[]>(`/products/low-stock${params}`);
}
