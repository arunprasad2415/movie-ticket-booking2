import React, { useState } from "react";

const BarChart = ({ title, subtitle, rows, format = (v) => v, empty = "No data yet." }) => {
  const [view, setView] = useState("chart");
  const [tip, setTip] = useState(null);
  const max = Math.max(0, ...rows.map((r) => r.value));

  const moveTip = (row) => (e) => {
    const box = e.currentTarget.parentElement.getBoundingClientRect();
    setTip({ row, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  return (
    <section className="chart-card">
      <header className="chart-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="chart-toggle" role="tablist" aria-label={`${title} view`}>
          {["chart", "table"].map((v) => (
            <button key={v} role="tab" aria-selected={view === v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
              {v === "chart" ? "Chart" : "Table"}
            </button>
          ))}
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="chart-empty">{empty}</p>
      ) : view === "chart" ? (
        <div className="bars" onMouseLeave={() => setTip(null)}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`bar-row ${row.onClick ? "clickable" : ""}`}
              style={{ "--i": i, "--p": max ? Math.max(row.value / max, row.value > 0 ? 0.015 : 0) : 0 }}
              onMouseMove={moveTip(row)}
              onClick={row.onClick}
              onKeyDown={(e) => row.onClick && e.key === "Enter" && row.onClick()}
              tabIndex={row.onClick ? 0 : undefined}
              role={row.onClick ? "link" : undefined}
              aria-label={`${row.label}: ${format(row.value)}`}
            >
              <span className="bar-label" title={row.label}>{row.label}</span>
              <span className="bar-track">
                <span className="bar" />
                <span className="bar-value">{format(row.value)}</span>
              </span>
            </div>
          ))}
          {tip && (
            <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>
              <strong>{tip.row.label}</strong>
              <span>{format(tip.row.value)}</span>
              {tip.row.hint && <small>{tip.row.hint}</small>}
              {tip.row.onClick && <em>Click to open</em>}
            </div>
          )}
        </div>
      ) : (
        <table className="chart-table">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} onClick={row.onClick} className={row.onClick ? "clickable" : ""}>
                <td>{row.label}</td>
                <td>{format(row.value)}</td>
                <td className="dim">{row.hint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default BarChart;
