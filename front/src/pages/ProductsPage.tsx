"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import type { ProductDTO } from "@/dto/ProductDTO";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProducts,
} from "@/fetch/productRequests";
import { measurePerformance } from "@/utils/measurePerformance";

const PAGE_SIZE = 24;

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("gamehub-token");
    if (!token) return;
    try {
      const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(encoded));
      setIsAdmin(payload.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Debounce search input — waits 400ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await measurePerformance(
        "carregamento de produtos",
        () => getProducts({ search: debouncedSearch, category, sort, page, limit: PAGE_SIZE, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })
      );
      setProducts(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort, page, minPrice, maxPrice]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [category, sort, minPrice, maxPrice]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setCreating(true);
    setCreateMessage("");
    setError("");
    try {
      const newProduct = await createProduct({
        name: String(data.get("name") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        category: String(data.get("category") ?? "Jogos") as ProductDTO["category"],
        price: Number(data.get("price")),
        stock: Number(data.get("stock"))
      });
      setCreateMessage("Produto cadastrado com sucesso!");
      form.reset();
      // Add to local state without full reload (only if on page 1 sorted by name)
      if (page === 1) {
        setProducts((prev) => [newProduct, ...prev].slice(0, PAGE_SIZE));
        setTotal((prev) => prev + 1);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível cadastrar o produto.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir este produto?")) return;
    try {
      await deleteProduct(id);
      // Update local state without full reload
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir.");
    }
  }

  async function handleEdit(product: ProductDTO) {
    setEditingProduct(product);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const updated = await updateProduct(editingProduct.id, {
        name: String(data.get("name") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        category: String(data.get("category") ?? editingProduct.category) as ProductDTO["category"],
        price: Number(data.get("price")),
        stock: Number(data.get("stock"))
      });
      setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setEditingProduct(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o produto.");
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h1>Produtos</h1>
          <p>Pesquise e consulte o estoque da loja.</p>
        </div>
        <span className="result-count">{total} produtos encontrados</span>
      </div>

      {isAdmin && (
        <form className="product-create-form" onSubmit={handleCreate}>
          <h2>Cadastrar produto</h2>
          <div className="product-create-form__grid">
            <label>Nome<input name="name" required minLength={2} maxLength={100} placeholder="Nome do produto" /></label>
            <label>Descrição<input name="description" required minLength={3} maxLength={500} placeholder="Descrição curta" /></label>
            <label>Categoria<select name="category" defaultValue="Jogos"><option value="Consoles">Consoles</option><option value="Jogos">Jogos</option><option value="Acessórios">Acessórios</option><option value="Periféricos">Periféricos</option><option value="Hardware">Hardware</option></select></label>
            <label>Preço<input name="price" type="number" min="0.01" step="0.01" required defaultValue="199.90" /></label>
            <label>Estoque<input name="stock" type="number" min="0" step="1" required defaultValue="10" /></label>
            <button className="button" disabled={creating}>{creating ? "Cadastrando..." : "Cadastrar produto"}</button>
          </div>
          {createMessage && <p className="form-success" role="status">{createMessage}</p>}
        </form>
      )}

      {editingProduct && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h2>Editar produto</h2>
              <button className="modal__close" onClick={() => setEditingProduct(null)} aria-label="Fechar">✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal__grid">
                <label>Nome<input name="name" required minLength={2} maxLength={100} defaultValue={editingProduct.name} /></label>
                <label>Descrição<input name="description" required minLength={3} maxLength={500} defaultValue={editingProduct.description} /></label>
                <label>Categoria
                  <select name="category" defaultValue={editingProduct.category}>
                    <option value="Consoles">Consoles</option>
                    <option value="Jogos">Jogos</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </label>
                <label>Preço<input name="price" type="number" min="0.01" step="0.01" required defaultValue={editingProduct.price} /></label>
                <label>Estoque<input name="stock" type="number" min="0" step="1" required defaultValue={editingProduct.stock} /></label>
              </div>
              <div className="modal__actions">
                <button type="button" className="button button--secondary" onClick={() => setEditingProduct(null)}>Cancelar</button>
                <button type="submit" className="button">Salvar alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="filters">
        <label>
          Buscar
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou descrição..." />
        </label>
        <label>
          Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>
            <option value="Consoles">Consoles</option>
            <option value="Jogos">Jogos</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Periféricos">Periféricos</option>
            <option value="Hardware">Hardware</option>
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Nome</option>
            <option value="price">Preço</option>
          </select>
        </label>
        <label>
          Preço mín.
          <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="R$ 0,00" />
        </label>
        <label>
          Preço máx.
          <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="R$ 9.999" />
        </label>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={loadProducts} /> : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} onEdit={isAdmin ? handleEdit : undefined} />
            ))}
            {products.length === 0 && <p>Nenhum produto encontrado.</p>}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="button button--secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>
              <span className="pagination__info">Página {page} de {totalPages}</span>
              <button
                className="button button--secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
