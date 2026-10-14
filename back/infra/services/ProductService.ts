import { ProductRepository, type ProductFilters } from "../repositories/ProductRepository";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  list(filters: ProductFilters) {
    return this.repository.findAll(filters);
  }

  count(filters: Omit<ProductFilters, 'limit' | 'offset'>) {
    return this.repository.countAll(filters);
  }

  create(input: CreateProductDTO) {
    return this.repository.create(input);
  }

  async remove(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Identificador de produto inválido.");
    }
    await this.repository.delete(id);
  }

  async update(id: number, input: Partial<CreateProductDTO>) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Identificador de produto inválido.");
    }
    return this.repository.update(id, input);
  }

  dashboard() {
    return this.repository.getDashboard();
  }

  stats() {
    return this.repository.getStats();
  }

  lowStockProducts(threshold?: number) {
    return this.repository.getLowStockProducts(threshold);
  }
}
