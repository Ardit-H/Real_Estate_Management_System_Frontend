import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ALL_STATUSES   = ["AVAILABLE", "PENDING", "SOLD", "RENTED", "INACTIVE"];
const ALL_TYPES      = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const ALL_LISTINGS   = ["SALE", "RENT", "BOTH"];

const STATUS_BADGE = {
  AVAILABLE: { bg: "#EAF3DE", color: "#3B6D11" },
  SOLD:      { bg: "#FCEBEB", color: "#A32D2D" },
  PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
  RENTED:    { bg: "#E6F1FB", color: "#185FA5" },
  INACTIVE:  { bg: "#F1EFE8", color: "#5F5E5A" },
};

const COLUMNS = [
  { label: "#ID",           sortKey: "id",          width: 64  },
  { label: "Title",         sortKey: "title",        width: 185 },
  { label: "Agent",         sortKey: null,           width: 100 },
  { label: "Price",         sortKey: "price",        width: 120 },
  { label: "Status",        sortKey: "status",       width: 108 },
  { label: "Type",          sortKey: "type",         width: 100 },
  { label: "Listing",       sortKey: "listingType",  width: 75  },
  { label: "Tenant schema", sortKey: null,           width: 160 },
  { label: "Created",       sortKey: "createdAt",    width: 96  },
  { label: "Actions",       sortKey: null,           width: 175 },
];
const TABLE_MIN_WIDTH = COLUMNS.reduce((s, c) => s + c.width, 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

// ─── Small UI components ──────────────────────────────────────────────────────

function Badge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.INACTIVE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
    }}>{status}</span>
  );
}

function SchemaTag({ name }) {
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11,
      background: "var(--color-background-tertiary,#f4f4f2)",
      color: "var(--color-text-secondary)",
      padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
    }}>{name || "—"}</span>
  );
}

function SortArrow({ active, asc }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.28, fontSize: 11 }}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const bg = type === "error" ? "#fee2e2" : "#ecfdf5";
  const co = type === "error" ? "#b91c1c" : "#047857";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: co, padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

// Shared modal wrapper — same style as AgentSales.jsx
function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth,
        background: "#ffffff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
          position: "sticky", top: 0, background: "#fff", zIndex: 1,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", border: "none", background: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Delete Modal — same style as AgentSales.jsx ──────────────────────────────

function DeleteModal({ target, onCancel, onConfirm, loading }) {
  if (!target) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div style={{
        width: "100%", maxWidth: 480, background: "#ffffff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Konfirmo fshirjen</span>
          <button onClick={onCancel} disabled={loading} style={{
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", border: "none", background: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
            A jeni i sigurt që dëshironi të fshini pronën{" "}
            <strong>#{target.id} — "{target.title || "Untitled"}"</strong>?
          </p>
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 14px", marginBottom: 22,
            fontSize: 13, color: "#b91c1c",
          }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              This will hide the property from all tenants.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              The record is not physically deleted — it is marked with{" "}
              <code style={{
                fontFamily: "monospace", fontSize: 12,
                background: "#fecaca", padding: "1px 5px", borderRadius: 3,
              }}>deleted_at</code>{" "}
              and will no longer appear in any listing, search, or filter result across all schemas.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={onCancel} disabled={loading}>Anulo</button>
            <button className="btn btn--danger"    onClick={onConfirm} disabled={loading}>
              {loading ? "Duke fshirë..." : "Fshi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────

function StatusModal({ target, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(target?.status || "AVAILABLE");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // PATCH /api/properties/{id}/status
      await api.patch(`/api/properties/${target.id}/status`, { status });
      notify(`Statusi u ndryshua në ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit", "error");
    } finally {
      setSaving(false);
    }
  };

  const colors = {
    AVAILABLE: { bg: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
    SOLD:      { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
    RENTED:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    PENDING:   { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
    INACTIVE:  { bg: "#f8fafc", border: "#e2e8f0", color: "#475569" },
  };
  const c = colors[status] || colors.INACTIVE;

  return (
    <Modal title={`Ndrysho statusin — Prona #${target.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Statusi aktual:{" "}
        <Badge status={target.status} />
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
          Statusi i ri <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: "100%", padding: "9px 12px", fontSize: 14,
            border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", color: "#0f172a", cursor: "pointer", outline: "none",
          }}
        >
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {/* Preview pill */}
      <div style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: c.color, fontWeight: 500,
      }}>
        Admin override → prona do të shënohet si <strong>{status}</strong> menjëherë.
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Agent Properties Modal ───────────────────────────────────────────────────

function AgentModal({ agentId, onClose }) {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE = 8;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/properties/agent/{agentId}
      const res = await api.get(`/api/properties/agent/${agentId}`, {
        params: { page, size: PAGE },
      });
      const data = res.data;
      setProps(data.content ?? []);
      setTotal(data.totalElements ?? 0);
    } catch {
      setProps([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <Modal title={`Pronat e Agjentit #${agentId}`} onClose={onClose} maxWidth={700}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Duke ngarkuar…</div>
      ) : props.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🏠</div>
          <p style={{ fontSize: 14 }}>Ky agjent nuk ka prona aktive.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
            {total} prona gjithsej
          </p>
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e8edf4" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Title", "Price", "Status", "Type", "Created"].map((h) => (
                    <th key={h} style={{
                      padding: "9px 12px", textAlign: "left",
                      fontWeight: 500, fontSize: 12, color: "#64748b",
                      borderBottom: "1px solid #e8edf4", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 12px", color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>#{p.id}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={p.title}>{p.title}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 600 }}>{fmtPrice(p.price, p.currency)}</td>
                    <td style={{ padding: "9px 12px" }}><Badge status={p.status} /></td>
                    <td style={{ padding: "9px 12px", color: "#64748b" }}>{p.type}</td>
                    <td style={{ padding: "9px 12px", color: "#94a3b8" }}>{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button className="btn btn--secondary btn--sm"
                disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span style={{ fontSize: 13, color: "#64748b", padding: "4px 8px" }}>
                {page + 1} / {totalPages}
              </span>
              <button className="btn btn--secondary btn--sm"
                disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ─── Price History Modal ──────────────────────────────────────────────────────

function PriceHistoryModal({ target, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // GET /api/properties/{id}/price-history
        const res = await api.get(`/api/properties/${target.id}/price-history`);
        setHistory(res.data ?? []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [target.id]);

  return (
    <Modal title={`Price History — #${target.id} "${target.title}"`} onClose={onClose} maxWidth={620}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Duke ngarkuar…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <p style={{ fontSize: 14 }}>Nuk ka ndryshime çmimi të regjistruara.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((h, i) => {
            const isDown = h.old_price != null && Number(h.new_price) < Number(h.old_price);
            const isUp   = h.old_price != null && Number(h.new_price) > Number(h.old_price);
            return (
              <div key={h.id} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 10,
                background: i === 0 ? "#f0f9ff" : "#f8fafc",
                border: `1px solid ${i === 0 ? "#bae6fd" : "#e8edf4"}`,
              }}>
                {/* Arrow indicator */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDown ? "#fef2f2" : isUp ? "#ecfdf5" : "#f1f5f9",
                  fontSize: 16,
                }}>
                  {isDown ? "↓" : isUp ? "↑" : "•"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    {h.old_price != null && (
                      <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>
                        {fmtPrice(h.old_price, h.currency)}
                      </span>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                      {fmtPrice(h.new_price, h.currency)}
                    </span>
                    {i === 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "2px 8px",
                        background: "#0ea5e9", color: "#fff", borderRadius: 999,
                      }}>Latest</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {h.reason && (
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        📝 {h.reason}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      🕐 {fmtDate(h.changed_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────

function AnalyticsPanel({ rows, total }) {
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = rows.filter((p) => p.status === s).length;
    return acc;
  }, {});

  const totalShown = rows.length;

  // Price buckets from loaded rows
  const buckets = [
    { label: "< 50k",      min: 0,       max: 50000   },
    { label: "50k–150k",   min: 50000,   max: 150000  },
    { label: "150k–300k",  min: 150000,  max: 300000  },
    { label: "300k–500k",  min: 300000,  max: 500000  },
    { label: "> 500k",     min: 500000,  max: Infinity },
  ];
  const bucketCounts = buckets.map((b) =>
    rows.filter((p) => {
      const v = Number(p.price);
      return v >= b.min && v < b.max;
    }).length
  );
  const maxBucket = Math.max(...bucketCounts, 1);

  // Top 5 by view_count
  const topViewed = [...rows]
    .filter((p) => p.view_count != null)
    .sort((a, b) => Number(b.view_count) - Number(a.view_count))
    .slice(0, 5);

  // Status colors for ratio bar
  const statusColors = {
    AVAILABLE: "#22c55e",
    SOLD:      "#ef4444",
    RENTED:    "#3b82f6",
    PENDING:   "#f59e0b",
    INACTIVE:  "#94a3b8",
  };

  const statCard = (label, value, sub, accent) => (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e8edf4", padding: "16px 18px",
      flex: "1 1 140px", minWidth: 120,
    }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: accent || "#0f172a",
        margin: "0 0 2px", letterSpacing: "-0.03em" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{
      background: "#f8fafc", borderRadius: 14,
      border: "1px solid #e8edf4", padding: "20px 22px",
      marginBottom: 22,
    }}>
      <p style={{
        fontSize: 13, fontWeight: 600, color: "#374151",
        margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        📊 Analytics Dashboard
        <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>
          (based on current page / filter)
        </span>
      </p>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {statCard("Total shown", totalShown, `of ${total} total`)}
        {statCard("Available", counts.AVAILABLE, "active listings", "#22c55e")}
        {statCard("Sold", counts.SOLD, "completed", "#ef4444")}
        {statCard("Rented", counts.RENTED, "occupied", "#3b82f6")}
        {statCard("Pending", counts.PENDING, "in progress", "#f59e0b")}
        {statCard("Inactive", counts.INACTIVE, "hidden", "#94a3b8")}
      </div>

      {/* Sold vs Active ratio bar */}
      {totalShown > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>
            Status distribution
          </p>
          <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", gap: 1 }}>
            {ALL_STATUSES.map((s) => {
              const pct = totalShown > 0 ? (counts[s] / totalShown) * 100 : 0;
              return pct > 0 ? (
                <div key={s} title={`${s}: ${counts[s]} (${Math.round(pct)}%)`}
                  style={{ width: `${pct}%`, background: statusColors[s], transition: "width .4s" }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            {ALL_STATUSES.map((s) => (
              <span key={s} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[s], display: "inline-block" }} />
                {s} ({counts[s]})
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Price distribution bar chart */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8edf4", padding: "14px 16px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>
            Price distribution (current page)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {buckets.map((b, i) => {
              const pct = Math.round((bucketCounts[i] / maxBucket) * 100);
              return (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", width: 68, flexShrink: 0, textAlign: "right" }}>
                    {b.label}
                  </span>
                  <div style={{ flex: 1, height: 14, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width: `${pct}%`, background: "#6366f1",
                      transition: "width .5s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#374151", fontWeight: 500, width: 18, textAlign: "right" }}>
                    {bucketCounts[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most viewed */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8edf4", padding: "14px 16px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>
            Most viewed (current page)
          </p>
          {topViewed.length === 0 ? (
            <p style={{ fontSize: 12, color: "#94a3b8" }}>No data</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {topViewed.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#cd7c2f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 12, color: "#374151", flex: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={p.title}>
                    {p.title}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#6366f1",
                    background: "#eef2ff", padding: "2px 6px", borderRadius: 20,
                  }}>
                    {p.view_count} 👁
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Advanced Filter Panel ────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onClear, onApply }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const hasAny = Object.values(filters).some((v) => v !== "" && v != null);

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e8edf4", padding: "16px 20px",
      marginBottom: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>
          🔍 Advanced Filters
        </p>
        {hasAny && (
          <button onClick={onClear} style={{
            fontSize: 12, padding: "4px 10px", borderRadius: 6,
            border: "1px solid #e8edf4", background: "transparent",
            color: "#94a3b8", cursor: "pointer",
          }}>
            Clear all ×
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>

        {/* Status */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Status
          </label>
          <select value={filters.status} onChange={(e) => set("status", e.target.value)}
            style={selectStyle}>
            <option value="">All</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Type
          </label>
          <select value={filters.type} onChange={(e) => set("type", e.target.value)}
            style={selectStyle}>
            <option value="">All</option>
            {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Listing */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Listing type
          </label>
          <select value={filters.listingType} onChange={(e) => set("listingType", e.target.value)}
            style={selectStyle}>
            <option value="">All</option>
            {ALL_LISTINGS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Agent ID */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Agent ID
          </label>
          <input
            type="number" placeholder="ex: 5"
            value={filters.agentId}
            onChange={(e) => set("agentId", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Min price */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Price min (€)
          </label>
          <input
            type="number" placeholder="ex: 50000"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Max price */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Price max (€)
          </label>
          <input
            type="number" placeholder="ex: 500000"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* City */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            City
          </label>
          <input
            type="text" placeholder="ex: Tirana"
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Featured */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Featured
          </label>
          <select value={filters.isFeatured} onChange={(e) => set("isFeatured", e.target.value)}
            style={selectStyle}>
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button onClick={onApply} className="btn btn--primary btn--sm">
          Apply filters
        </button>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #d1d5db", borderRadius: 8,
  background: "#fff", color: "#0f172a", outline: "none", cursor: "pointer",
};
const inputStyle = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid #d1d5db", borderRadius: 8,
  background: "#fff", color: "#0f172a", outline: "none",
  boxSizing: "border-box",
};

// ─── Shared table cell styles ─────────────────────────────────────────────────

const TH = {
  padding: "10px 10px", textAlign: "left",
  fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  background: "var(--color-background-secondary)",
  whiteSpace: "nowrap", overflow: "hidden", userSelect: "none",
};
const TD = {
  padding: "10px 10px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// ─── Main content ─────────────────────────────────────────────────────────────

function AllPropertiesContent() {
  const { user } = useContext(AuthContext);

  const tenantSchema = (() => {
    try {
      const info = JSON.parse(localStorage.getItem("user_info") || "{}");
      if (info.schemaName) return info.schemaName;
      if (info.tenantName && info.tenantId) {
        const slug = info.tenantName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        return `tenant_${slug}_${info.tenantId}`;
      }
      return null;
    } catch { return null; }
  })();

  // ── Table state ────────────────────────────────────────────────
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── Search ─────────────────────────────────────────────────────
  const [search, setSearch]   = useState("");

  // ── Advanced filters ───────────────────────────────────────────
  const EMPTY_FILTERS = {
    status: "", type: "", listingType: "",
    agentId: "", minPrice: "", maxPrice: "",
    city: "", isFeatured: "",
  };
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [appliedFilters, setApplied]  = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // ── Sort ───────────────────────────────────────────────────────
  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc]     = useState(false);

  // ── Modals ─────────────────────────────────────────────────────
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [deletedId,     setDeletedId]     = useState(null);
  const [statusTarget,  setStatusTarget]  = useState(null);
  const [agentModal,    setAgentModal]    = useState(null); // agentId
  const [historyTarget, setHistoryTarget] = useState(null); // { id, title }

  // ── Toast ──────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasApplied = Object.values(appliedFilters).some((v) => v !== "" && v != null);

  // ── Fetch ──────────────────────────────────────────────────────
  //
  // Search strategy (in order of priority):
  //
  //  1. Input is pure number or "#N"  →  parallel calls:
  //       a) GET /api/properties/{id}         (exact property by ID)
  //       b) GET /api/properties/agent/{id}   (all props of that agent)
  //     Merge + deduplicate, show all matches.
  //
  //  2. Input is text  →  four parallel calls:
  //       a) GET /api/properties/search?keyword=   (FTS: title/description/type)
  //       a) FTS search (title/description/type, whole words)
  //       b) filter?city= (LIKE match on address.city)
  //       c) all props, client-side filter by title.includes (partial match)
  //       d) filter?type= if keyword matches a type enum
  //     Merge + deduplicate results.
  //
  //  3. No search, agent filter in panel  →  GET /api/properties/agent/{id}
  //  4. No search, other filters          →  GET /api/properties/filter
  //  5. No search, no filters             →  GET /api/properties  (paginated)

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const af     = appliedFilters;
      const hasFilter = Object.values(af).some((v) => v !== "" && v != null);
      const raw    = search.trim();

      // normalise any API response shape into { rows, total }
      const normalise = (data) => ({
        rows:  data.content ?? (Array.isArray(data) ? data : [data].filter(Boolean)),
        total: data.totalElements ?? (Array.isArray(data) ? data.length : 1),
      });

      // deduplicate array of property objects by id
      const dedup = (arr) => {
        const seen = new Set();
        return arr.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
      };

      // map PropertyResponse (full object from /api/properties/{id})
      // to the PropertySummaryResponse shape the table columns expect
      const toSummary = (d) => ({
        id:           d.id,
        title:        d.title,
        type:         d.type,
        status:       d.status,
        listing_type: d.listingType  ?? d.listing_type,
        bedrooms:     d.bedrooms,
        bathrooms:    d.bathrooms,
        area_sqm:     d.areaSqm      ?? d.area_sqm,
        price:        d.price,
        currency:     d.currency,
        is_featured:  d.isFeatured   ?? d.is_featured,
        view_count:   d.viewCount    ?? d.view_count,
        city:         d.address?.city    ?? null,
        country:      d.address?.country ?? null,
        primary_image: d.images?.[0]?.imageUrl ?? null,
        agent_id:     d.agentId      ?? d.agent_id,
        created_at:   d.createdAt    ?? d.created_at,
      });

      if (raw) {
        const stripped = raw.startsWith("#") ? raw.slice(1) : raw;
        const asNum    = Number(stripped);
        const isNum    = stripped !== "" && !isNaN(asNum) &&
                         Number.isInteger(asNum) && asNum > 0;

        if (isNum) {
          // ── numeric: try property ID AND agent ID in parallel ────────
          const [byId, byAgent] = await Promise.allSettled([
            api.get(`/api/properties/${asNum}`),
            api.get(`/api/properties/agent/${asNum}`, {
              params: { page, size: PAGE_SIZE },
            }),
          ]);

          const merged = [];

          if (byId.status === "fulfilled") {
            const d = byId.value.data;
            // single PropertyResponse object (has no .content)
            if (d && d.id && !d.content) merged.push(toSummary(d));
          }

          if (byAgent.status === "fulfilled") {
            const { rows: agentRows } = normalise(byAgent.value.data);
            merged.push(...agentRows);
          }

          const final = dedup(merged);
          setRows(final);
          setTotal(final.length);

        } else {
          // ── text search strategy ─────────────────────────────────────
          //
          // The backend FTS index (search_vector) uses to_tsvector('english',...)
          // which stems words and requires whole words — "Vila" won't match "Villa"
          // and short/partial words may not match at all.
          //
          // So we fire FOUR parallel requests and merge:
          //   a) /search?keyword=   → FTS on title+description+type (whole words)
          //   b) /filter?city=      → LIKE %keyword% on address.city
          //   c) /filter?type=      → if keyword matches an enum value exactly
          //   d) GET all + client-side title filter → LIKE fallback for partial title
          //      (we fetch page 0 size 100 and filter by title.includes(keyword))

          const kw      = stripped;
          const kwLower = kw.toLowerCase();

          // Check if keyword matches a known property type enum
          const matchedType = ALL_TYPES.find(
            (t) => t.toLowerCase() === kwLower || t.toLowerCase().includes(kwLower)
          );

          const requests = [
            // a) FTS search
            api.get("/api/properties/search", {
              params: { keyword: kw, page: 0, size: 50 },
            }),
            // b) city filter (LIKE %kw%)
            api.get("/api/properties/filter", {
              params: { city: kw, page: 0, size: 50 },
            }),
            // c) all props page 0 for client-side title filter (partial match)
            api.get("/api/properties", {
              params: { page: 0, size: 100, sortBy: "createdAt", sortDir: "desc" },
            }),
          ];

          // d) type filter if keyword looks like a type
          if (matchedType) {
            requests.push(
              api.get("/api/properties/filter", {
                params: { type: matchedType, page: 0, size: 50 },
              })
            );
          }

          const settled = await Promise.allSettled(requests);

          const ftsRows  = settled[0].status === "fulfilled"
            ? normalise(settled[0].value.data).rows : [];
          const cityRows = settled[1].status === "fulfilled"
            ? normalise(settled[1].value.data).rows : [];
          const allRows  = settled[2].status === "fulfilled"
            ? normalise(settled[2].value.data).rows : [];
          const typeRows = (settled[3] && settled[3].status === "fulfilled")
            ? normalise(settled[3].value.data).rows : [];

          // Client-side title filter: include any property whose title
          // contains the search keyword (case-insensitive, partial match)
          const titleMatches = allRows.filter((p) =>
            p.title && p.title.toLowerCase().includes(kwLower)
          );

          const merged = dedup([...ftsRows, ...cityRows, ...titleMatches, ...typeRows]);
          setRows(merged);
          setTotal(merged.length);
        }

      } else if (af.agentId) {
        const res = await api.get(`/api/properties/agent/${af.agentId}`, {
          params: { page, size: PAGE_SIZE },
        });
        const { rows: r, total: t } = normalise(res.data);
        setRows(r); setTotal(t);

      } else if (hasFilter) {
        const res = await api.get("/api/properties/filter", {
          params: {
            ...(af.status      && { status:      af.status }),
            ...(af.type        && { type:        af.type }),
            ...(af.listingType && { listingType: af.listingType }),
            ...(af.minPrice    && { minPrice:    af.minPrice }),
            ...(af.maxPrice    && { maxPrice:    af.maxPrice }),
            ...(af.city        && { city:        af.city }),
            ...(af.isFeatured  && { isFeatured:  af.isFeatured }),
            page, size: PAGE_SIZE,
          },
        });
        const { rows: r, total: t } = normalise(res.data);
        setRows(r); setTotal(t);

      } else {
        const res = await api.get("/api/properties", {
          params: {
            page, size: PAGE_SIZE,
            sortBy:  sortField,
            sortDir: sortAsc ? "asc" : "desc",
          },
        });
        const { rows: r, total: t } = normalise(res.data);
        setRows(r); setTotal(t);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Ndodhi një gabim gjatë ngarkimit.");
    } finally {
      setLoading(false);
    }
  }, [search, appliedFilters, page, sortField, sortAsc]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [search, appliedFilters]);

  function handleSort(key) {
    if (!key) return;
    if (sortField === key) setSortAsc((a) => !a);
    else { setSortField(key); setSortAsc(true); }
  }

  // ── Soft delete ────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/properties/${deleteTarget.id}`);
      setDeletedId(deleteTarget.id);
      setDeleteTarget(null);
      setTimeout(() => { setDeletedId(null); fetchData(); }, 700);
    } catch (err) {
      alert(err.response?.data?.message || "Fshirja dështoi.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Pagination button ──────────────────────────────────────────

  function PageBtn({ n }) {
    const active = n === page;
    return (
      <button onClick={() => setPage(n)} style={{
        fontSize: 13, padding: "4px 10px",
        borderRadius: "var(--border-radius-md)",
        border: "0.5px solid var(--color-border-secondary)",
        background: active ? "var(--color-background-info)" : "transparent",
        color: active ? "var(--color-text-info)" : "var(--color-text-primary)",
        fontWeight: active ? 500 : 400, cursor: "pointer",
      }}>{n + 1}</button>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div style={{ padding: "1.5rem 0" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none} }`}</style>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>All properties</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
            Admin view — full control over all properties
          </p>
        </div>

        {/* Toggle buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAnalytics((v) => !v)}
            style={{
              fontSize: 12, padding: "6px 12px",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: showAnalytics ? "var(--color-background-info)" : "transparent",
              color: showAnalytics ? "var(--color-text-info)" : "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              fontSize: 12, padding: "6px 12px",
              borderRadius: "var(--border-radius-md)",
              border: `0.5px solid ${hasApplied ? "#6366f1" : "var(--color-border-secondary)"}`,
              background: hasApplied ? "#eef2ff" : showFilters ? "var(--color-background-secondary)" : "transparent",
              color: hasApplied ? "#6366f1" : "var(--color-text-secondary)",
              cursor: "pointer", fontWeight: hasApplied ? 500 : 400,
            }}
          >
            🔍 Filters {hasApplied ? "●" : ""}
          </button>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: "6px 12px", flex: 1, maxWidth: 380, minWidth: 200,
        }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            style={{ flexShrink: 0, color: "var(--color-text-secondary)" }}>
            <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city, agent ID or #property-ID…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 14, width: "100%", color: "var(--color-text-primary)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontSize: 18, lineHeight: 1, padding: 0, color: "var(--color-text-secondary)",
            }}>×</button>
          )}
        </div>
      </div>

      {/* ── Analytics ────────────────────────────────────────────── */}
      {showAnalytics && <AnalyticsPanel rows={rows} total={total} />}

      {/* ── Filter panel ─────────────────────────────────────────── */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={() => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); }}
          onApply={() => { setApplied(filters); setPage(0); }}
        />
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#FCEBEB", color: "#A32D2D", fontSize: 13,
          padding: "10px 14px", marginBottom: "1rem",
          borderRadius: "var(--border-radius-md)", border: "0.5px solid #F7C1C1",
        }}>{error}</div>
      )}

      {/* ── Table ────────────────────────────────────────────────── */}
      <div style={{
        overflowX: "auto",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)", width: "100%",
      }}>
        <table style={{ width: "100%", minWidth: TABLE_MIN_WIDTH, borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            {COLUMNS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.label}
                  style={{ ...TH, cursor: c.sortKey ? "pointer" : "default" }}
                  onClick={() => handleSort(c.sortKey)}>
                  {c.label}
                  {c.sortKey && <SortArrow active={sortField === c.sortKey} asc={sortAsc} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "2.5rem", color: "var(--color-text-secondary)" }}>
                Loading…
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "2.5rem", color: "var(--color-text-secondary)" }}>
                No properties found
              </td></tr>
            ) : rows.map((p) => {
              const isDeleted = p.id === deletedId;
              return (
                <tr key={p.id}
                  style={{ opacity: isDeleted ? 0.3 : 1, transition: "opacity 0.5s" }}
                  onMouseEnter={(e) => { if (!isDeleted) Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "var(--color-background-secondary)")); }}
                  onMouseLeave={(e) => { Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "")); }}
                >
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: 12, color: "var(--color-text-secondary)" }}>
                    #{p.id}
                  </td>
                  <td style={TD} title={p.title ?? ""}>{p.title ?? "—"}</td>
                  <td style={TD}>
                    {p.agent_id != null ? (
                      <button
                        onClick={() => setAgentModal(p.agent_id)}
                        title="View agent's properties"
                        style={{
                          fontSize: 12, padding: "3px 8px",
                          borderRadius: 20, border: "1px solid #c7d7fe",
                          background: "#eef2ff", color: "#6366f1",
                          cursor: "pointer", fontWeight: 500,
                        }}
                      >
                        #{p.agent_id}
                      </button>
                    ) : "—"}
                  </td>
                  <td style={{ ...TD, fontWeight: 500 }}>{fmtPrice(p.price, p.currency)}</td>
                  <td style={TD}><Badge status={p.status} /></td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{p.type ?? "—"}</td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{p.listing_type ?? "—"}</td>
                  <td style={TD}><SchemaTag name={tenantSchema} /></td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{fmtDate(p.created_at)}</td>

                  {/* Actions — View removed, only admin actions */}
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>

                      {/* Status override */}
                      <button
                        onClick={() => setStatusTarget(p)}
                        title="Change status (admin override)"
                        style={{
                          fontSize: 11, padding: "4px 8px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid #a7f3d0",
                          background: "transparent", cursor: "pointer",
                          color: "#047857", whiteSpace: "nowrap",
                        }}
                      >
                        Status
                      </button>

                      {/* Price history */}
                      <button
                        onClick={() => setHistoryTarget({ id: p.id, title: p.title })}
                        title="View price history"
                        style={{
                          fontSize: 11, padding: "4px 8px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid #bfdbfe",
                          background: "transparent", cursor: "pointer",
                          color: "#1d4ed8", whiteSpace: "nowrap",
                        }}
                      >
                        History
                      </button>

                      {/* Delete */}
                      <button
                        disabled={isDeleted}
                        onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                        title="Soft delete"
                        style={{
                          fontSize: 11, padding: "4px 8px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid #F09595",
                          background: "transparent",
                          cursor: isDeleted ? "default" : "pointer",
                          color: "#A32D2D", whiteSpace: "nowrap",
                          opacity: isDeleted ? 0.4 : 1,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", marginRight: 4 }}>
          {total} properties — page {page + 1} of {totalPages}
        </span>
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent",
          cursor: page === 0 ? "default" : "pointer",
          opacity: page === 0 ? 0.38 : 1, color: "var(--color-text-primary)",
        }}>← Prev</button>

        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => {
            if (totalPages <= 7) return true;
            if (i === 0 || i === totalPages - 1) return true;
            return Math.abs(i - page) <= 2;
          })
          .reduce((acc, i, idx, arr) => {
            if (idx > 0 && i - arr[idx - 1] > 1) acc.push("…");
            acc.push(i);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…"
              ? <span key={`e-${idx}`} style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "0 2px" }}>…</span>
              : <PageBtn key={item} n={item} />
          )}

        <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent",
          cursor: page >= totalPages - 1 ? "default" : "pointer",
          opacity: page >= totalPages - 1 ? 0.38 : 1, color: "var(--color-text-primary)",
        }}>Next →</button>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}

      <DeleteModal
        target={deleteTarget}
        loading={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {statusTarget && (
        <StatusModal
          target={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => { setStatusTarget(null); fetchData(); }}
          notify={notify}
        />
      )}

      {agentModal != null && (
        <AgentModal
          agentId={agentModal}
          onClose={() => setAgentModal(null)}
        />
      )}

      {historyTarget && (
        <PriceHistoryModal
          target={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function AdminProperties() {
  return (
    <MainLayout role="admin">
      <AllPropertiesContent />
    </MainLayout>
  );
}
