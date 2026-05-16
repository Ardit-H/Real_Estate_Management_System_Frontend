import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import Modal         from "../../components/agent/properties/Modal";
import PropertyForm  from "../../components/agent/properties/PropertyForm";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ALL_STATUSES   = ["AVAILABLE", "PENDING", "SOLD", "RENTED", "INACTIVE"];
const ALL_TYPES      = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const ALL_LISTINGS   = ["SALE", "RENT", "BOTH"];

const STATUS_BADGE = {
  AVAILABLE: { bg: "rgba(29,158,117,0.15)", color: "#1D9E75",  border: "rgba(29,158,117,0.3)"  },
  SOLD:      { bg: "rgba(216,90,48,0.15)",  color: "#D85A30",  border: "rgba(216,90,48,0.3)"   },
  PENDING:   { bg: "rgba(201,184,122,0.15)",color: "#c9b87a",  border: "rgba(201,184,122,0.3)" },
  RENTED:    { bg: "rgba(55,138,221,0.15)", color: "#378ADD",  border: "rgba(55,138,221,0.3)"  },
  INACTIVE:  { bg: "rgba(136,135,128,0.15)",color: "#888780",  border: "rgba(136,135,128,0.3)" },
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

// ─── Global CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ap-wrap * { box-sizing: border-box; }
  .ap-wrap { font-family: 'DM Sans', system-ui, sans-serif; }

  .ap-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .ap-row { transition: opacity 0.5s; }

  .ap-th-sort:hover { color: #c9b87a !important; }

  .ap-btn-action { transition: all 0.14s ease; }
  .ap-btn-action:hover { transform: translateY(-1px); opacity: 0.85; }

  .ap-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }

  @keyframes ap-fade-up  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes ap-scale-in { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes ap-spin     { to{transform:rotate(360deg)} }
  @keyframes ap-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-pulse    { 0%,100%{opacity:.35} 50%{opacity:.75} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

// ─── Small UI components ──────────────────────────────────────────────────────

function Badge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.INACTIVE;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: "0.4px",
      padding: "3px 10px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      display: "inline-block",
      fontFamily: "'DM Sans', sans-serif",
    }}>{status}</span>
  );
}

function SchemaTag({ name }) {
  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: 10.5,
      background: "rgba(138,125,94,0.1)",
      color: "#8a7d5e",
      border: "1px solid rgba(138,125,94,0.2)",
      padding: "2px 8px",
      borderRadius: 6,
      whiteSpace: "nowrap",
    }}>{name || "—"}</span>
  );
}

function SortArrow({ active, asc }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.28, fontSize: 10, color: active ? "#c9b87a" : "inherit" }}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714",
      color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12,
      fontSize: 13, fontWeight: 400,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 340,
      fontFamily: "'DM Sans', sans-serif",
      animation: "ap-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Overlay base ─────────────────────────────────────────────────────────────

function Overlay({ children, onClose, loading }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,6,4,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      {children}
    </div>
  );
}

const ModalBox = ({ children, maxWidth = 480 }) => (
  <div style={{
    width: "100%", maxWidth,
    background: "#faf7f2",
    borderRadius: 18,
    boxShadow: "0 44px 100px rgba(0,0,0,0.55)",
    animation: "ap-scale-in 0.22s ease",
    overflow: "hidden",
  }}>
    {children}
  </div>
);

const ModalHeader = ({ title, onClose, loading }) => (
  <div style={{
    padding: "18px 24px",
    borderBottom: "1px solid rgba(138,125,94,0.15)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <span style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 700, fontSize: 17, color: "#1a1714",
    }}>{title}</span>
    <button onClick={onClose} disabled={loading} style={{
      width: 30, height: 30, display: "flex", alignItems: "center",
      justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)",
      background: "rgba(138,125,94,0.08)",
      color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8,
    }}>✕</button>
  </div>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ target, onCancel, onConfirm, loading }) {
  if (!target) return null;
  return (
    <Overlay onClose={onCancel} loading={loading}>
      <ModalBox maxWidth={480}>
        <ModalHeader title="Konfirmo fshirjen" onClose={onCancel} loading={loading} />
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#4a4438", marginBottom: 20, lineHeight: 1.6 }}>
            A jeni i sigurt që dëshironi të fshini pronën{" "}
            <strong style={{ color: "#1a1714" }}>#{target.id} — "{target.title || "Untitled"}"</strong>?
          </p>
          <div style={{
            background: "rgba(216,90,48,0.08)",
            border: "1px solid rgba(216,90,48,0.2)",
            borderRadius: 10, padding: "12px 15px", marginBottom: 22,
            fontSize: 13, color: "#D85A30",
          }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              This will hide the property from all tenants.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              The record is not physically deleted — it is marked with{" "}
              <code style={{
                fontFamily: "monospace", fontSize: 12,
                background: "rgba(216,90,48,0.12)", padding: "1px 6px", borderRadius: 4,
              }}>deleted_at</code>{" "}
              and will no longer appear in any listing or search result.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancel} disabled={loading} style={secondaryBtn}>Anulo</button>
            <button onClick={onConfirm} disabled={loading} style={dangerBtn}>
              {loading ? "Duke fshirë..." : "Fshi pronën"}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────

function StatusModal({ target, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(target?.status || "AVAILABLE");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/properties/${target.id}/status`, { status });
      notify(`Statusi u ndryshua në ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit", "error");
    } finally {
      setSaving(false);
    }
  };

  const preview = STATUS_BADGE[status] || STATUS_BADGE.INACTIVE;

  return (
    <Overlay onClose={onClose}>
      <ModalBox maxWidth={460}>
        <ModalHeader title={`Ndrysho statusin — #${target.id}`} onClose={onClose} />
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 13, color: "#8a7d5e", marginBottom: 16 }}>
            Statusi aktual: <Badge status={target.status} />
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Statusi i ri <span style={{ color: "#D85A30" }}>*</span></label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={selectSt}
            >
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{
            background: preview.bg,
            border: `1px solid ${preview.border}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: preview.color, fontWeight: 500,
          }}>
            Admin override → prona do të shënohet si <strong>{status}</strong> menjëherë.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={secondaryBtn}>Anulo</button>
            <button onClick={handleSubmit} disabled={saving} style={primaryBtn}>
              {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

// ─── Agent Properties Modal ───────────────────────────────────────────────────

function AgentModal({ agentId, onClose }) {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE = 8;

  const fetchAgent = useCallback(async () => {
    setLoading(true);
    try {
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

  useEffect(() => { fetchAgent(); }, [fetchAgent]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <Overlay onClose={onClose}>
      <ModalBox maxWidth={700}>
        <ModalHeader title={`Pronat e Agjentit #${agentId}`} onClose={onClose} />
        <div style={{ padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8a7d5e" }}>
              <div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "2px solid rgba(138,125,94,0.2)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ap-spin .8s linear infinite" }} />
              <p style={{ fontSize: 13 }}>Duke ngarkuar…</p>
            </div>
          ) : props.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#b0a890" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🏠</div>
              <p style={{ fontSize: 14 }}>Ky agjent nuk ka prona aktive.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: "#8a7d5e", marginBottom: 14 }}>{total} prona gjithsej</p>
              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(138,125,94,0.15)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(138,125,94,0.06)" }}>
                      {["#", "Title", "Price", "Status", "Type", "Created"].map((h) => (
                        <th key={h} style={{
                          padding: "9px 12px", textAlign: "left",
                          fontWeight: 500, fontSize: 11, color: "#8a7d5e",
                          borderBottom: "1px solid rgba(138,125,94,0.12)",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase", letterSpacing: "0.5px",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {props.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(138,125,94,0.08)" }}>
                        <td style={{ padding: "9px 12px", color: "#b0a890", fontFamily: "monospace", fontSize: 11 }}>#{p.id}</td>
                        <td style={{ padding: "9px 12px", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1a1714" }} title={p.title}>{p.title}</td>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#1a1714" }}>{fmtPrice(p.price, p.currency)}</td>
                        <td style={{ padding: "9px 12px" }}><Badge status={p.status} /></td>
                        <td style={{ padding: "9px 12px", color: "#8a7d5e" }}>{p.type}</td>
                        <td style={{ padding: "9px 12px", color: "#b0a890" }}>{fmtDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <button style={secondaryBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                  <span style={{ fontSize: 13, color: "#8a7d5e", padding: "4px 8px" }}>{page + 1} / {totalPages}</span>
                  <button style={secondaryBtn} disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </ModalBox>
    </Overlay>
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
    <Overlay onClose={onClose}>
      <ModalBox maxWidth={620}>
        <ModalHeader title={`Price History — #${target.id} "${target.title}"`} onClose={onClose} />
        <div style={{ padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8a7d5e" }}>
              <div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "2px solid rgba(138,125,94,0.2)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ap-spin .8s linear infinite" }} />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#b0a890" }}>
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
                    padding: "14px 16px", borderRadius: 12,
                    background: i === 0 ? "rgba(55,138,221,0.06)" : "rgba(138,125,94,0.04)",
                    border: `1px solid ${i === 0 ? "rgba(55,138,221,0.15)" : "rgba(138,125,94,0.12)"}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isDown ? "rgba(216,90,48,0.1)" : isUp ? "rgba(29,158,117,0.1)" : "rgba(138,125,94,0.1)",
                      fontSize: 16,
                      color: isDown ? "#D85A30" : isUp ? "#1D9E75" : "#8a7d5e",
                    }}>
                      {isDown ? "↓" : isUp ? "↑" : "•"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        {h.old_price != null && (
                          <span style={{ fontSize: 13, color: "#b0a890", textDecoration: "line-through" }}>
                            {fmtPrice(h.old_price, h.currency)}
                          </span>
                        )}
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>
                          {fmtPrice(h.new_price, h.currency)}
                        </span>
                        {i === 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 9px",
                            background: "rgba(55,138,221,0.12)", color: "#378ADD", borderRadius: 999,
                          }}>Latest</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        {h.reason && <span style={{ fontSize: 12, color: "#6b6340" }}>📝 {h.reason}</span>}
                        <span style={{ fontSize: 12, color: "#b0a890" }}>🕐 {fmtDate(h.changed_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ModalBox>
    </Overlay>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────

function AnalyticsPanel({ rows, total }) {
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = rows.filter((p) => p.status === s).length;
    return acc;
  }, {});

  const totalShown = rows.length;

  const buckets = [
    { label: "< 50k",     min: 0,       max: 50000   },
    { label: "50k–150k",  min: 50000,   max: 150000  },
    { label: "150k–300k", min: 150000,  max: 300000  },
    { label: "300k–500k", min: 300000,  max: 500000  },
    { label: "> 500k",    min: 500000,  max: Infinity },
  ];
  const bucketCounts = buckets.map((b) =>
    rows.filter((p) => { const v = Number(p.price); return v >= b.min && v < b.max; }).length
  );
  const maxBucket = Math.max(...bucketCounts, 1);

  const topViewed = [...rows]
    .filter((p) => p.view_count != null)
    .sort((a, b) => Number(b.view_count) - Number(a.view_count))
    .slice(0, 5);

  const statusColors = {
    AVAILABLE: "#1D9E75",
    SOLD:      "#D85A30",
    RENTED:    "#378ADD",
    PENDING:   "#c9b87a",
    INACTIVE:  "#888780",
  };

  const statCard = (label, value, sub, color) => (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(138,125,94,0.15)",
      borderRadius: 12,
      padding: "14px 18px",
      flex: "1 1 130px", minWidth: 110,
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: color || "#1a1714", margin: "0 0 2px", letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "#b0a890", margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(160deg, #141210 0%, #1e1a14 100%)",
      borderRadius: 14,
      border: "1px solid rgba(201,184,122,0.12)",
      padding: "20px 22px",
      marginBottom: 22,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />

      <p style={{ fontSize: 12, fontWeight: 600, color: "#c9b87a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8, position: "relative", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        📊 Analytics Dashboard
        <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(245,240,232,0.3)" }}>(based on current page / filter)</span>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, position: "relative" }}>
        {statCard("Total shown", totalShown, `of ${total} total`)}
        {statCard("Available", counts.AVAILABLE, "active listings", "#1D9E75")}
        {statCard("Sold", counts.SOLD, "completed", "#D85A30")}
        {statCard("Rented", counts.RENTED, "occupied", "#378ADD")}
        {statCard("Pending", counts.PENDING, "in progress", "#c9b87a")}
        {statCard("Inactive", counts.INACTIVE, "hidden", "#888780")}
      </div>

      {totalShown > 0 && (
        <div style={{ marginBottom: 18, position: "relative" }}>
          <p style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px" }}>Status distribution</p>
          <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 1 }}>
            {ALL_STATUSES.map((s) => {
              const pct = totalShown > 0 ? (counts[s] / totalShown) * 100 : 0;
              return pct > 0 ? (
                <div key={s} title={`${s}: ${counts[s]} (${Math.round(pct)}%)`}
                  style={{ width: `${pct}%`, background: statusColors[s], transition: "width .4s" }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {ALL_STATUSES.map((s) => (
              <span key={s} style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColors[s], display: "inline-block" }} />
                {s} ({counts[s]})
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative" }}>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(138,125,94,0.12)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#8a7d5e", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Price distribution</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {buckets.map((b, i) => {
              const pct = Math.round((bucketCounts[i] / maxBucket) * 100);
              return (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10.5, color: "#b0a890", width: 68, flexShrink: 0, textAlign: "right" }}>{b.label}</span>
                  <div style={{ flex: 1, height: 12, background: "rgba(138,125,94,0.08)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: "linear-gradient(90deg,#8a7d5e,#c9b87a)", transition: "width .5s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#1a1714", fontWeight: 500, width: 18, textAlign: "right" }}>{bucketCounts[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(138,125,94,0.12)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#8a7d5e", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Most viewed</p>
          {topViewed.length === 0 ? (
            <p style={{ fontSize: 12, color: "#b0a890" }}>No data</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topViewed.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "#c9b87a" : i === 1 ? "#888780" : "#8a6d4e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9.5, fontWeight: 700, color: "#1a1714",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 12, color: "#4a4438", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.title}>{p.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#8a7d5e", background: "rgba(138,125,94,0.1)", border: "1px solid rgba(138,125,94,0.15)", padding: "2px 7px", borderRadius: 999 }}>
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
      background: "linear-gradient(135deg, #1a1714 0%, #201c18 100%)",
      borderRadius: 12,
      border: "1px solid rgba(201,184,122,0.12)",
      padding: "18px 20px",
      marginBottom: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#c9b87a", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          🔍 Advanced Filters
        </p>
        {hasAny && (
          <button onClick={onClear} style={{
            fontSize: 11.5, padding: "4px 11px", borderRadius: 7,
            border: "1px solid rgba(201,184,122,0.2)", background: "transparent",
            color: "rgba(245,240,232,0.4)", cursor: "pointer",
          }}>Clear all ×</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 10 }}>
        {[
          { label: "Status", key: "status", opts: ALL_STATUSES },
          { label: "Type", key: "type", opts: ALL_TYPES },
          { label: "Listing type", key: "listingType", opts: ALL_LISTINGS },
        ].map(({ label, key, opts }) => (
          <div key={key}>
            <label style={darkFieldLabel}>{label}</label>
            <select value={filters[key]} onChange={(e) => set(key, e.target.value)} style={darkSelectSt}>
              <option value="">All</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div>
          <label style={darkFieldLabel}>Agent ID</label>
          <input type="number" placeholder="ex: 5" value={filters.agentId} onChange={(e) => set("agentId", e.target.value)} style={darkInputSt} />
        </div>
        <div>
          <label style={darkFieldLabel}>Price min (€)</label>
          <input type="number" placeholder="ex: 50000" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} style={darkInputSt} />
        </div>
        <div>
          <label style={darkFieldLabel}>Price max (€)</label>
          <input type="number" placeholder="ex: 500000" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} style={darkInputSt} />
        </div>
        <div>
          <label style={darkFieldLabel}>City</label>
          <input type="text" placeholder="ex: Tirana" value={filters.city} onChange={(e) => set("city", e.target.value)} style={darkInputSt} />
        </div>
        <div>
          <label style={darkFieldLabel}>Featured</label>
          <select value={filters.isFeatured} onChange={(e) => set("isFeatured", e.target.value)} style={darkSelectSt}>
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button onClick={onApply} style={primaryBtn}>Apply filters</button>
      </div>
    </div>
  );
}

// ─── Shared button / input styles ─────────────────────────────────────────────

const primaryBtn = {
  padding: "9px 18px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
  color: "#1a1714", fontSize: 13, fontWeight: 700, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
const secondaryBtn = {
  padding: "9px 16px", borderRadius: 10,
  border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent",
  color: "#6b6248", fontSize: 13, fontWeight: 500, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
const dangerBtn = {
  padding: "9px 18px", borderRadius: 10, border: "none",
  background: "#D85A30", color: "#fff",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
const fieldLabel = {
  fontSize: 11, fontWeight: 600, color: "#8a7d5e",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const darkFieldLabel = {
  fontSize: 10.5, fontWeight: 600, color: "rgba(245,240,232,0.38)",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const selectSt = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9,
  background: "#fff", color: "#1a1714", outline: "none", cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
const darkSelectSt = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid rgba(245,240,232,0.1)", borderRadius: 9,
  background: "rgba(245,240,232,0.06)", color: "#f5f0e8",
  outline: "none", cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
const darkInputSt = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid rgba(245,240,232,0.1)", borderRadius: 9,
  background: "rgba(245,240,232,0.06)", color: "#f5f0e8",
  outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

// ─── Table cell styles ────────────────────────────────────────────────────────

const TH = {
  padding: "10px 10px", textAlign: "left",
  fontWeight: 600, fontSize: 10.5,
  color: "#8a7d5e",
  borderBottom: "1px solid rgba(138,125,94,0.15)",
  background: "rgba(138,125,94,0.04)",
  whiteSpace: "nowrap", overflow: "hidden", userSelect: "none",
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const TD = {
  padding: "10px 10px",
  borderBottom: "1px solid rgba(138,125,94,0.08)",
  fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  color: "#1a1714",
};

// ─── Main content ─────────────────────────────────────────────────────────────

function AllPropertiesContent() {
  const { user } = useContext(AuthContext);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating,   setCreating]   = useState(false);
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

  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [search, setSearch]   = useState("");

  const EMPTY_FILTERS = {
    status: "", type: "", listingType: "",
    agentId: "", minPrice: "", maxPrice: "",
    city: "", isFeatured: "",
  };
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [appliedFilters, setApplied]  = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc]     = useState(false);

  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [deletedId,     setDeletedId]     = useState(null);
  const [statusTarget,  setStatusTarget]  = useState(null);
  const [agentModal,    setAgentModal]    = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasApplied = Object.values(appliedFilters).some((v) => v !== "" && v != null);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await api.post("/api/properties", data);
      notify("Property created successfully!");
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create property", "error");
    } finally {
      setCreating(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const af = appliedFilters;
      const hasFilter = Object.values(af).some((v) => v !== "" && v != null);
      const raw = search.trim();

      const normalise = (data) => ({
        rows:  data.content ?? (Array.isArray(data) ? data : [data].filter(Boolean)),
        total: data.totalElements ?? (Array.isArray(data) ? data.length : 1),
      });

      const dedup = (arr) => {
        const seen = new Set();
        return arr.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
      };

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
        const isNum    = stripped !== "" && !isNaN(asNum) && Number.isInteger(asNum) && asNum > 0;

        if (isNum) {
          const [byId, byAgent] = await Promise.allSettled([
            api.get(`/api/properties/${asNum}`),
            api.get(`/api/properties/agent/${asNum}`, { params: { page, size: PAGE_SIZE } }),
          ]);
          const merged = [];
          if (byId.status === "fulfilled") {
            const d = byId.value.data;
            if (d && d.id && !d.content) merged.push(toSummary(d));
          }
          if (byAgent.status === "fulfilled") {
            const { rows: agentRows } = normalise(byAgent.value.data);
            merged.push(...agentRows);
          }
          const final = dedup(merged);
          setRows(final); setTotal(final.length);
        } else {
          const kw      = stripped;
          const kwLower = kw.toLowerCase();
          const matchedType = ALL_TYPES.find((t) => t.toLowerCase() === kwLower || t.toLowerCase().includes(kwLower));
          const requests = [
            api.get("/api/properties/search", { params: { keyword: kw, page: 0, size: 50 } }),
            api.get("/api/properties/filter",  { params: { city: kw, page: 0, size: 50 } }),
            api.get("/api/properties",          { params: { page: 0, size: 100, sortBy: "createdAt", sortDir: "desc" } }),
          ];
          if (matchedType) requests.push(api.get("/api/properties/filter", { params: { type: matchedType, page: 0, size: 50 } }));

          const settled = await Promise.allSettled(requests);
          const ftsRows  = settled[0].status === "fulfilled" ? normalise(settled[0].value.data).rows : [];
          const cityRows = settled[1].status === "fulfilled" ? normalise(settled[1].value.data).rows : [];
          const allRows  = settled[2].status === "fulfilled" ? normalise(settled[2].value.data).rows : [];
          const typeRows = (settled[3] && settled[3].status === "fulfilled") ? normalise(settled[3].value.data).rows : [];
          const titleMatches = allRows.filter((p) => p.title && p.title.toLowerCase().includes(kwLower));
          const merged = dedup([...ftsRows, ...cityRows, ...titleMatches, ...typeRows]);
          setRows(merged); setTotal(merged.length);
        }

      } else if (af.agentId) {
        const res = await api.get(`/api/properties/agent/${af.agentId}`, { params: { page, size: PAGE_SIZE } });
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
          params: { page, size: PAGE_SIZE, sortBy: sortField, sortDir: sortAsc ? "asc" : "desc" },
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

  function PageBtn({ n }) {
    const active = n === page;
    return (
      <button onClick={() => setPage(n)} className="ap-pg" style={{
        fontSize: 13, padding: "5px 11px",
        borderRadius: 9,
        border: `1.5px solid ${active ? "#c9b87a" : "rgba(138,125,94,0.2)"}`,
        background: active ? "#c9b87a" : "transparent",
        color: active ? "#1a1714" : "#8a7d5e",
        fontWeight: active ? 700 : 400, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}>{n + 1}</button>
    );
  }

  const activeFilterCount = Object.values(appliedFilters).filter((v) => v !== "" && v != null).length;

  return (
    <div className="ap-wrap" style={{ padding: "1.5rem 0" }}>
      <style>{CSS}</style>

      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
        borderRadius: 16,
        padding: "28px 28px 24px",
        marginBottom: 22,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", position: "relative" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 28, fontWeight: 700,
              color: "#f5f0e8", margin: "0 0 4px",
              letterSpacing: "-0.4px",
            }}>All Properties</h1>
            <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Admin view — full control over all properties
            </p>
          </div>

          {/* Toggle buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowAnalytics((v) => !v)}
              style={{
                fontSize: 12, padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                border: `1px solid ${showAnalytics ? "rgba(201,184,122,0.4)" : "rgba(245,240,232,0.1)"}`,
                background: showAnalytics ? "rgba(201,184,122,0.12)" : "transparent",
                color: showAnalytics ? "#c9b87a" : "rgba(245,240,232,0.4)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: showAnalytics ? 600 : 400,
              }}>
              📊 Analytics
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                fontSize: 12, padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                border: `1px solid ${activeFilterCount > 0 ? "rgba(201,184,122,0.5)" : "rgba(245,240,232,0.1)"}`,
                background: activeFilterCount > 0 ? "rgba(201,184,122,0.12)" : showFilters ? "rgba(245,240,232,0.05)" : "transparent",
                color: activeFilterCount > 0 ? "#c9b87a" : "rgba(245,240,232,0.4)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: activeFilterCount > 0 ? 600 : 400,
              }}>
              🔍 Filters {activeFilterCount > 0 ? `● ${activeFilterCount}` : ""}
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              style={primaryBtn}>
              + Add Property
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          marginTop: 18,
          background: "rgba(245,240,232,0.06)",
          border: "1.5px solid rgba(245,240,232,0.09)",
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, padding: "0 16px" }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.3)" strokeWidth={2} style={{ flexShrink: 0 }}>
              <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, city, agent ID or #property-ID…"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13.5, width: "100%", color: "#f5f0e8", height: 46,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                border: "none", background: "transparent", cursor: "pointer",
                fontSize: 18, lineHeight: 1, padding: 0, color: "rgba(245,240,232,0.3)",
              }}>×</button>
            )}
          </div>
          <button style={{
            padding: "0 24px", height: 46, cursor: "pointer",
            background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
            color: "#1a1714", border: "none",
            fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* ── Analytics ─────────────────────────────────────────────── */}
      {showAnalytics && <AnalyticsPanel rows={rows} total={total} />}

      {/* ── Filter panel ──────────────────────────────────────────── */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={() => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); }}
          onApply={() => { setApplied(filters); setPage(0); }}
        />
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "rgba(216,90,48,0.08)", color: "#D85A30", fontSize: 13,
          padding: "10px 16px", marginBottom: "1rem",
          borderRadius: 10, border: "1px solid rgba(216,90,48,0.2)",
        }}>{error}</div>
      )}

      {/* ── Table card wrapper ─────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(138,125,94,0.15)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(20,16,10,0.06)",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: TABLE_MIN_WIDTH, borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              {COLUMNS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.label}
                    className={c.sortKey ? "ap-th-sort" : ""}
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
                <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "3rem", color: "#8a7d5e" }}>
                  <div style={{ width: 24, height: 24, margin: "0 auto 10px", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ap-spin .8s linear infinite" }} />
                  <p style={{ margin: 0, fontSize: 13 }}>Loading…</p>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "3rem", color: "#b0a890" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🏘️</div>
                  <p style={{ margin: 0, fontSize: 14 }}>No properties found</p>
                </td></tr>
              ) : rows.map((p) => {
                const isDeleted = p.id === deletedId;
                return (
                  <tr key={p.id} className="ap-row"
                    style={{ opacity: isDeleted ? 0.2 : 1 }}
                  >
                    <td style={{ ...TD, fontFamily: "monospace", fontSize: 11.5, color: "#b0a890" }}>
                      #{p.id}
                    </td>
                    <td style={{ ...TD, fontWeight: 500, color: "#1a1714" }} title={p.title ?? ""}>
                      {p.title ?? "—"}
                    </td>
                    <td style={TD}>
                      {p.agent_id != null ? (
                        <button
                          onClick={() => setAgentModal(p.agent_id)}
                          title="View agent's properties"
                          style={{
                            fontSize: 11.5, padding: "3px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(201,184,122,0.25)",
                            background: "rgba(201,184,122,0.08)",
                            color: "#c9b87a",
                            cursor: "pointer", fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                          #{p.agent_id}
                        </button>
                      ) : "—"}
                    </td>
                    <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(p.price, p.currency)}</td>
                    <td style={TD}><Badge status={p.status} /></td>
                    <td style={{ ...TD, color: "#8a7d5e" }}>{p.type ?? "—"}</td>
                    <td style={{ ...TD, color: "#8a7d5e" }}>{p.listing_type ?? "—"}</td>
                    <td style={TD}><SchemaTag name={tenantSchema} /></td>
                    <td style={{ ...TD, color: "#b0a890" }}>{fmtDate(p.created_at)}</td>

                    <td style={TD}>
                      <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                        <button className="ap-btn-action"
                          onClick={() => setStatusTarget(p)}
                          title="Change status (admin override)"
                          style={{
                            fontSize: 11, padding: "4px 9px", borderRadius: 8,
                            border: "1px solid rgba(29,158,117,0.3)",
                            background: "rgba(29,158,117,0.06)", cursor: "pointer",
                            color: "#1D9E75", whiteSpace: "nowrap",
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                          Status
                        </button>

                        <button className="ap-btn-action"
                          onClick={() => setHistoryTarget({ id: p.id, title: p.title })}
                          title="View price history"
                          style={{
                            fontSize: 11, padding: "4px 9px", borderRadius: 8,
                            border: "1px solid rgba(55,138,221,0.25)",
                            background: "rgba(55,138,221,0.06)", cursor: "pointer",
                            color: "#378ADD", whiteSpace: "nowrap",
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                          History
                        </button>

                        <button className="ap-btn-action"
                          disabled={isDeleted}
                          onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                          title="Soft delete"
                          style={{
                            fontSize: 11, padding: "4px 9px", borderRadius: 8,
                            border: "1px solid rgba(216,90,48,0.25)",
                            background: "rgba(216,90,48,0.06)",
                            cursor: isDeleted ? "default" : "pointer",
                            color: "#D85A30", whiteSpace: "nowrap",
                            opacity: isDeleted ? 0.35 : 1,
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
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
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "#8a7d5e", marginRight: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {total} properties — page {page + 1} of {totalPages}
        </span>
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="ap-pg" style={{
          fontSize: 13, padding: "5px 11px", borderRadius: 9,
          border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
          cursor: page === 0 ? "default" : "pointer",
          opacity: page === 0 ? 0.38 : 1, color: "#8a7d5e",
          fontFamily: "'DM Sans', sans-serif",
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
              ? <span key={`e-${idx}`} style={{ fontSize: 13, color: "#b0a890", padding: "0 2px" }}>…</span>
              : <PageBtn key={item} n={item} />
          )}

        <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="ap-pg" style={{
          fontSize: 13, padding: "5px 11px", borderRadius: 9,
          border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
          cursor: page >= totalPages - 1 ? "default" : "pointer",
          opacity: page >= totalPages - 1 ? 0.38 : 1, color: "#8a7d5e",
          fontFamily: "'DM Sans', sans-serif",
        }}>Next →</button>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
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
        <AgentModal agentId={agentModal} onClose={() => setAgentModal(null)} />
      )}

      {historyTarget && (
        <PriceHistoryModal target={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      {createOpen && (
        <Modal title="Add New Property" onClose={() => setCreateOpen(false)} wide>
          <PropertyForm onSubmit={handleCreate} loading={creating} />
        </Modal>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function AdminProperties() {
  return (
    <MainLayout role="admin">
      <div style={{ backgroundColor: "#f2ede4", minHeight: "100vh", padding: 24 }}>
      <AllPropertiesContent />
      </div>
    </MainLayout>
  );
}
