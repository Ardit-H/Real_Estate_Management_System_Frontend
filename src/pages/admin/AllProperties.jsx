import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  AVAILABLE: { bg: "#EAF3DE", color: "#3B6D11" },
  SOLD:      { bg: "#FCEBEB", color: "#A32D2D" },
  PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
  RENTED:    { bg: "#E6F1FB", color: "#185FA5" },
  INACTIVE:  { bg: "#F1EFE8", color: "#5F5E5A" },
};

const COLUMNS = [
  { label: "#ID",           sortKey: "id",          width: 68  },
  { label: "Title",         sortKey: "title",        width: 195 },
  { label: "Agent",         sortKey: null,           width: 140 },
  { label: "Price",         sortKey: "price",        width: 128 },
  { label: "Status",        sortKey: "status",       width: 112 },
  { label: "Type",          sortKey: "type",         width: 108 },
  { label: "Listing",       sortKey: "listingType",  width: 82  },
  { label: "Tenant schema", sortKey: null,           width: 170 },
  { label: "Created",       sortKey: "createdAt",    width: 100 },
  { label: "Actions",       sortKey: null,           width: 130 },
];
const TABLE_MIN_WIDTH = COLUMNS.reduce((s, c) => s + c.width, 0);

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Badge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.INACTIVE;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
    }}>
      {status}
    </span>
  );
}

function SchemaTag({ name }) {
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11,
      background: "var(--color-background-tertiary, #f4f4f2)",
      color: "var(--color-text-secondary)",
      padding: "2px 7px", borderRadius: 4,
      whiteSpace: "nowrap",
    }}>
      {name || "—"}
    </span>
  );
}

function SortArrow({ active, asc }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.28, fontSize: 11 }}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
        {label}:
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        fontSize: 13, padding: "5px 10px",
        borderRadius: "var(--border-radius-md)",
        border: "0.5px solid var(--color-border-secondary)",
        background: "var(--color-background-primary)",
        color: "var(--color-text-primary)", cursor: "pointer",
      }}>
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Delete Modal — same style as AgentSales.jsx ─────────────────────────────

function DeleteModal({ target, onCancel, onConfirm, loading }) {
  if (!target) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        animation: "fadeUp .2s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Konfirmo fshirjen</span>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", border: "none", background: "none",
              color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
            A jeni i sigurt që dëshironi të fshini pronën{" "}
            <strong>#{target.id} — "{target.title || "Untitled"}"</strong>?
          </p>

          {/* Info box — same pattern as ContractStatusModal warning */}
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
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

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn btn--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Anulo
            </button>
            <button
              className="btn btn--danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Duke fshirë..." : "Fshi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared cell styles ───────────────────────────────────────────────────────

const TH = {
  padding: "10px 10px",
  textAlign: "left",
  fontWeight: 500,
  fontSize: 12,
  color: "var(--color-text-secondary)",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  background: "var(--color-background-secondary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  userSelect: "none",
};

const TD = {
  padding: "10px 10px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function fmtPrice(price, currency) {
  if (price == null) return "—";
  return `${Number(price).toLocaleString("en-EU")} ${currency || "EUR"}`;
}
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

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

  const [rows, setRows]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("");
  const [type, setType]           = useState("");
  const [listingType, setListing] = useState("");

  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [deletedId, setDeletedId]       = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (search.trim()) {
        res = await api.get("/api/properties/search", {
          params: { keyword: search.trim(), page, size: PAGE_SIZE },
        });
      } else if (status || type || listingType) {
        res = await api.get("/api/properties/filter", {
          params: {
            ...(status      && { status }),
            ...(type        && { type }),
            ...(listingType && { listingType }),
            page, size: PAGE_SIZE,
          },
        });
      } else {
        res = await api.get("/api/properties", {
          params: { page, size: PAGE_SIZE, sortBy: sortField, sortDir: sortAsc ? "asc" : "desc" },
        });
      }
      const data = res.data;
      setRows(data.content ?? (Array.isArray(data) ? data : []));
      setTotal(data.totalElements ?? (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      setError(err.response?.data?.message || "Ndodhi një gabim gjatë ngarkimit.");
    } finally {
      setLoading(false);
    }
  }, [search, status, type, listingType, page, sortField, sortAsc]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [search, status, type, listingType]);

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

  const hasFilters = search || status || type || listingType;

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
      }}>
        {n + 1}
      </button>
    );
  }

  return (
    <div style={{ padding: "1.5rem 0" }}>

      {/* Header + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1, minWidth: 140 }}>All properties</h1>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: "6px 12px", flex: 1, maxWidth: 420, minWidth: 220,
        }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            style={{ flexShrink: 0, color: "var(--color-text-secondary)" }}>
            <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, agent, city or ID…"
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

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <FilterSelect label="Status"  value={status}      onChange={setStatus}
          options={["AVAILABLE","PENDING","SOLD","RENTED","INACTIVE"]} />
        <FilterSelect label="Type"    value={type}        onChange={setType}
          options={["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"]} />
        <FilterSelect label="Listing" value={listingType} onChange={setListing}
          options={["SALE","RENT","BOTH"]} />
        {hasFilters && (
          <button onClick={() => { setSearch(""); setStatus(""); setType(""); setListing(""); }}
            style={{
              fontSize: 12, padding: "5px 12px",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}>
            Clear ×
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#FCEBEB", color: "#A32D2D", fontSize: 13,
          padding: "10px 14px", marginBottom: "1rem",
          borderRadius: "var(--border-radius-md)", border: "0.5px solid #F7C1C1",
        }}>
          {error}
        </div>
      )}

      {/* Table */}
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
              <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "2.5rem", color: "var(--color-text-secondary)" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} style={{ ...TD, textAlign: "center", padding: "2.5rem", color: "var(--color-text-secondary)" }}>No properties found</td></tr>
            ) : rows.map((p) => {
              const isDeleted = p.id === deletedId;
              return (
                <tr key={p.id}
                  style={{ opacity: isDeleted ? 0.3 : 1, transition: "opacity 0.5s" }}
                  onMouseEnter={(e) => { if (!isDeleted) Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "var(--color-background-secondary)")); }}
                  onMouseLeave={(e) => { Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "")); }}
                >
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: 12, color: "var(--color-text-secondary)" }}>#{p.id}</td>
                  <td style={TD} title={p.title ?? ""}>{p.title ?? "—"}</td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{p.agent_id != null ? `Agent #${p.agent_id}` : "—"}</td>
                  <td style={{ ...TD, fontWeight: 500 }}>{fmtPrice(p.price, p.currency)}</td>
                  <td style={TD}><Badge status={p.status} /></td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{p.type ?? "—"}</td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{p.listing_type ?? "—"}</td>
                  <td style={TD}><SchemaTag name={tenantSchema} /></td>
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>{fmtDate(p.created_at)}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={`/admin/properties/${p.id}`} style={{
                        fontSize: 12, padding: "4px 10px",
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid var(--color-border-secondary)",
                        background: "transparent",
                        color: "var(--color-text-primary)",
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}>View</a>

                      <button
                        disabled={isDeleted}
                        onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                        style={{
                          fontSize: 12, padding: "4px 10px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid #F09595",
                          background: "transparent",
                          cursor: isDeleted ? "default" : "pointer",
                          color: "#A32D2D", whiteSpace: "nowrap",
                          opacity: isDeleted ? 0.4 : 1,
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
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

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", marginRight: 4 }}>
          {total} properties — page {page + 1} of {totalPages}
        </span>
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent", cursor: page === 0 ? "default" : "pointer",
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
          background: "transparent", cursor: page >= totalPages - 1 ? "default" : "pointer",
          opacity: page >= totalPages - 1 ? 0.38 : 1, color: "var(--color-text-primary)",
        }}>Next →</button>
      </div>

      {/* Delete modal */}
      <DeleteModal
        target={deleteTarget}
        loading={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
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
