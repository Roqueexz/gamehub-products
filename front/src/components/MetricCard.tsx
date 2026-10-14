interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  alert?: boolean;
}

export function MetricCard({ label, value, description, alert }: MetricCardProps) {
  return (
    <article className={`metric-card ${alert ? "metric-card--alert" : ""}`.trim()}>
      <span>{label}</span>
      <strong>
        {value}
        {alert && <span className="metric-card__alert-dot" title="Alerta de estoque crítico" />}
      </strong>
      <small>{description}</small>
    </article>
  );
}
