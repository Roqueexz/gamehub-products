"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { apiRequest } from "@/fetch/api";
import { getLowStockProducts, getProductStats, type CategoryStats } from "@/fetch/productRequests";
import type { ProductDTO } from "@/dto/ProductDTO";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardDTO {
  totalProducts: number;
  lowStock: number;
  inventoryValue: number;
  categories: number;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductDTO[]>([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<DashboardDTO>("/dashboard"),
      getProductStats(),
      getLowStockProducts(5)
    ])
      .then(([dashboard, categoryStats, lowStock]) => {
        setData(dashboard);
        setStats(categoryStats);
        setLowStockProducts(lowStock);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Erro ao carregar dashboard.");
      });
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <p className="state-message">Carregando indicadores...</p>;

  return (
    <section>
      <span className="eyebrow">VISÃO GERAL</span>
      <h1>Dashboard</h1>
      <p className="section-intro">Indicadores atuais do catálogo GameHub.</p>

      <div className="metrics-grid">
        <MetricCard label="Produtos" value={String(data.totalProducts)} description="Itens cadastrados" />
        <MetricCard
          label="Estoque baixo"
          value={String(data.lowStock)}
          description="Cinco unidades ou menos"
          alert={data.lowStock > 0}
        />
        <MetricCard label="Categorias" value={String(data.categories)} description="Categorias disponíveis" />
        <MetricCard label="Valor em estoque" value={data.inventoryValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} description="Preço × quantidade" />
      </div>

      {data.lowStock > 0 && (
        <div className="alert-banner">
          <span className="alert-banner__icon">⚠️</span>
          <span>
            <strong>{data.lowStock} produtos</strong> com estoque crítico (≤ 5 unidades)
          </span>
          <button
            className="button button--secondary"
            onClick={() => setShowLowStock((v) => !v)}
          >
            {showLowStock ? "Ocultar lista" : "Ver lista"}
          </button>
        </div>
      )}

      {showLowStock && lowStockProducts.length > 0 && (
        <div className="low-stock-table-wrapper">
          <h2>Produtos com estoque crítico</h2>
          <table className="low-stock-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><span className="category-pill">{product.category}</span></td>
                  <td>{product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td><span className={product.stock === 0 ? "stock stock--critical" : "stock stock--low"}>{product.stock === 0 ? "Esgotado" : `${product.stock} un.`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.length > 0 && (
        <div className="chart-section">
          <h2>Distribuição por categoria</h2>
          <p>Quantidade de produtos cadastrados em cada categoria.</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e6f0" />
                <XAxis dataKey="category" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(value: any) => [value.toLocaleString("pt-BR"), "Produtos"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e1e6f0" }}
                />
                <Bar dataKey="total" fill="#5146e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="stats-table-wrapper">
            <h3>Preço médio por categoria</h3>
            <table className="low-stock-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Produtos</th>
                  <th>Preço médio</th>
                  <th>Menor preço</th>
                  <th>Maior preço</th>
                  <th>Total em estoque</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.category}>
                    <td><span className="category-pill">{stat.category}</span></td>
                    <td>{stat.total.toLocaleString("pt-BR")}</td>
                    <td>{stat.avgPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>{stat.minPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>{stat.maxPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>{stat.totalStock.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
