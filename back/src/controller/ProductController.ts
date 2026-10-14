import type { Request, Response } from "express";
import { createProductSchema } from "../dto/CreateProductDTO";
import { ProductService } from "../../infra/services/ProductService";

export class ProductController {
  constructor(private readonly service = new ProductService()) {}

  list = async (request: Request, response: Response) => {
    const limit = Math.min(Number(request.query.limit ?? 24), 100);
    const page = Math.max(Number(request.query.page ?? 1), 1);
    const offset = (page - 1) * limit;

    const rawMin = request.query.minPrice ? Number(request.query.minPrice) : undefined;
    const rawMax = request.query.maxPrice ? Number(request.query.maxPrice) : undefined;

    const filters = {
      search: String(request.query.search ?? ""),
      category: String(request.query.category ?? ""),
      sort: String(request.query.sort ?? "name"),
      limit,
      offset,
      minPrice: rawMin !== undefined && !Number.isNaN(rawMin) ? rawMin : undefined,
      maxPrice: rawMax !== undefined && !Number.isNaN(rawMax) ? rawMax : undefined
    };

    const [products, total] = await Promise.all([
      this.service.list(filters),
      this.service.count(filters)
    ]);

    response.json({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  };


  create = async (request: Request, response: Response) => {
    const parsed = createProductSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos.",
        errors: parsed.error.flatten().fieldErrors
      });
      return;
    }
    const product = await this.service.create(parsed.data);
    response.status(201).json(product);
  };

  update = async (request: Request, response: Response) => {
    const parsed = createProductSchema.partial().safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos.",
        errors: parsed.error.flatten().fieldErrors
      });
      return;
    }
    const product = await this.service.update(Number(request.params.id), parsed.data);
    response.json(product);
  };

  remove = async (request: Request, response: Response) => {
    await this.service.remove(Number(request.params.id));
    response.json({ message: "Produto excluído com sucesso." });
  };

  dashboard = async (_request: Request, response: Response) => {
    response.json(await this.service.dashboard());
  };

  stats = async (_request: Request, response: Response) => {
    response.json(await this.service.stats());
  };

  lowStock = async (_request: Request, response: Response) => {
    const threshold = Number(_request.query.threshold ?? 5);
    response.json(await this.service.lowStockProducts(threshold));
  };
}
