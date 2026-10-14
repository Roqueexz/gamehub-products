import { db } from "../database/db";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";
import type { Product } from "../../src/model/Product";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  minPrice?: number;
  maxPrice?: number;
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock)
  };
}

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<Product[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const parameter = `$${values.length}`;
      conditions.push(`(name ILIKE ${parameter} OR description ILIKE ${parameter})`);
    }

    if (filters.category) {
      values.push(filters.category);
      conditions.push(`category = $${values.length}`);
    }

    if (filters.minPrice !== undefined) {
      values.push(filters.minPrice);
      conditions.push(`price >= $${values.length}`);
    }

    if (filters.maxPrice !== undefined) {
      values.push(filters.maxPrice);
      conditions.push(`price <= $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = filters.sort === "price" ? "price ASC" : "name ASC";
    const sql = `SELECT id, name, description, category, price, stock FROM products ${where} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    values.push(filters.limit ?? 24);
    values.push(filters.offset ?? 0);

    const startedAt = performance.now();
    const result = await db.query(sql, values);
    console.info(`[ProductRepository] findAll: ${result.rowCount ?? 0} linhas em ${(performance.now() - startedAt).toFixed(2)} ms`);
    return result.rows.map(mapProduct);
  }


  async countAll(filters: Omit<ProductFilters, 'limit' | 'offset'>): Promise<number> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const parameter = `$${values.length}`;
      conditions.push(`(name ILIKE ${parameter} OR description ILIKE ${parameter})`);
    }

    if (filters.category) {
      values.push(filters.category);
      conditions.push(`category = $${values.length}`);
    }

    if (filters.minPrice !== undefined) {
      values.push(filters.minPrice);
      conditions.push(`price >= $${values.length}`);
    }

    if (filters.maxPrice !== undefined) {
      values.push(filters.maxPrice);
      conditions.push(`price <= $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db.query(`SELECT COUNT(*) AS total FROM products ${where}`, values);
    return Number(result.rows[0].total);
  }


  async create(input: CreateProductDTO): Promise<Product> {
    const result = await db.query(
      `INSERT INTO products (name, description, category, price, stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, category, price, stock`,
      [input.name, input.description, input.category, input.price, input.stock]
    );
    return mapProduct(result.rows[0]);
  }

  async update(id: number, input: Partial<CreateProductDTO>): Promise<Product> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) { values.push(input.name); fields.push(`name = $${values.length}`); }
    if (input.description !== undefined) { values.push(input.description); fields.push(`description = $${values.length}`); }
    if (input.category !== undefined) { values.push(input.category); fields.push(`category = $${values.length}`); }
    if (input.price !== undefined) { values.push(input.price); fields.push(`price = $${values.length}`); }
    if (input.stock !== undefined) { values.push(input.stock); fields.push(`stock = $${values.length}`); }

    if (fields.length === 0) throw new Error("Nenhum campo para atualizar.");

    values.push(id);
    const result = await db.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, name, description, category, price, stock`,
      values
    );
    if (result.rowCount === 0) throw new Error("Produto não encontrado.");
    return mapProduct(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
  }

  async getDashboard() {
    const startedAt = performance.now();
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE stock <= 5) AS low_stock,
        COALESCE(SUM(price * stock), 0) AS inventory_value,
        COUNT(DISTINCT category) AS categories
      FROM products
    `);
    console.info(`[ProductRepository] dashboard: 1 consulta em ${(performance.now() - startedAt).toFixed(2)} ms`);

    const row = result.rows[0];
    return {
      totalProducts: Number(row.total_products),
      lowStock: Number(row.low_stock),
      inventoryValue: Number(row.inventory_value),
      categories: Number(row.categories)
    };
  }

  async getStats() {
    const result = await db.query(`
      SELECT
        category,
        COUNT(*) AS total,
        ROUND(AVG(price)::numeric, 2) AS avg_price,
        MIN(price) AS min_price,
        MAX(price) AS max_price,
        SUM(stock) AS total_stock
      FROM products
      GROUP BY category
      ORDER BY total DESC
    `);
    return result.rows.map((row: Record<string, unknown>) => ({
      category: String(row.category),
      total: Number(row.total),
      avgPrice: Number(row.avg_price),
      minPrice: Number(row.min_price),
      maxPrice: Number(row.max_price),
      totalStock: Number(row.total_stock)
    }));
  }

  async getLowStockProducts(threshold = 5): Promise<Product[]> {
    const result = await db.query(
      `SELECT id, name, description, category, price, stock FROM products WHERE stock <= $1 ORDER BY stock ASC, name ASC LIMIT 50`,
      [threshold]
    );
    return result.rows.map(mapProduct);
  }
}
