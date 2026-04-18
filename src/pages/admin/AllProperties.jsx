import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  AVAILABLE: { background: "#EAF3DE", color: "#3B6D11" },
  SOLD:      { background: "#FCEBEB", color: "#A32D2D" },
  PENDING:   { background: "#FAEEDA", color: "#854F0B" },
  RENTED:    { background: "#E6F1FB", color: "#185FA5" },
  INACTIVE:  { background: "#F1EFE8", color: "#5F5E5A" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.INACTIVE;
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function SchemaTag({ name }) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 11,
        background: "var(--color-background-tertiary, #f4f4f2)",
        color: "var(--color-text-secondary)",
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {name || "—"}
    </span>
  );
}

function SortIcon({ active, dir }) {
  if (!active) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
  return <span style={{ marginLeft: 4 }}>{dir === 1 ? "↑" : "↓"}</span>;
}

const thBase = {
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

const tdBase = {
  padding: "10px 10px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// Each column has an explicit px width.
// The table gets minWidth = sum of all columns so it never squeezes —
// the outer div handles horizontal scrolling instead.
const COLUMNS = [
  { label: "#ID",           sortKey: "id",          width: 64  },
  { label: "Title",         sortKey: "title",        width: 190 },
  { label: "Agent",         sortKey: null,           width: 135 },
  { label: "Price",         sortKey: "price",        width: 125 },
  { label: "Status",        sortKey: "status",       width: 115 },
  { label: "Type",          sortKey: "type",         width: 110 },
  { label: "Listing",       sortKey: "listingType",  width: 85  },
  { label: "Tenant schema", sortKey: null,           width: 160 },
  { label: "Created",       sortKey: "createdAt",    width: 100 },
  { label: "Actions",       sortKey: null,           width: 125 },
];

const TOTAL_MIN_WIDTH = COLUMNS.reduce((s, c) => s + c.width, 0);

function AdminPropertiesContent() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [typeFilter, setType]       = useState("");
  const [listingFilter, setListing] = useState("");

  const [sortField, setSortField]   = useState("createdAt");
  const [sortDir, setSortDir]       = useState("desc");

  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (search.trim()) {
        const res = await api.get("/api/properties/search", {
          params: {
            keyword: search.trim(),
            page,
            size: PAGE_SIZE,
            sort: `${sortField},${sortDir}`,
          },
        });
        setProperties(res.data.content ?? res.data);
        setTotal(res.data.totalElements ?? (res.data.length || 0));
        return;
      }

      if (statusFilter || typeFilter || listingFilter) {
        const res = await api.get("/api/properties/filter", {
          params: {
            status:       statusFilter  || undefined,
            type:         typeFilter    || undefined,
            listing_type: listingFilter || undefined,
            page,
            size: PAGE_SIZE,
            sort: `${sortField},${sortDir}`,
          },
        });
        setProperties(res.data.content ?? res.data);
        setTotal(res.data.totalElements ?? (res.data.length || 0));
        return;
      }

      const res = await api.get("/api/properties", {
        params: { page, size: PAGE_SIZE, sort: `${sortField},${sortDir}` },
      });
      setProperties(res.data.content ?? res.data);
      setTotal(res.data.totalElements ?? (res.data.length || 0));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, listingFilter, page, sortField, sortDir]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);
  useEffect(() => { setPage(0); }, [search, statusFilter, typeFilter, listingFilter]);

  function handleSort(key) {
    if (!key) return;
    if (sortField === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(key); setSortDir("asc"); }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await api.delete(`/api/properties/${id}`);
      setDeleteId(null);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

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

  return (
    <div style={{ padding: "1.5rem 0" }}>

      {/* ── Header + search ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12,
        marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1, minWidth: 120 }}>
          All properties
        </h1>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: "6px 12px", flex: 1, maxWidth: 400, minWidth: 200,
        }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            style={{ flexShrink: 0, color: "var(--color-text-secondary)" }}>
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, agent, city or ID…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 14, width: "100%", color: "var(--color-text-primary)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontSize: 16, color: "var(--color-text-secondary)", padding: 0, lineHeight: 1,
            }}>×</button>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem",
        flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Status",  value: statusFilter,  set: setStatus,
            options: ["AVAILABLE","PENDING","SOLD","RENTED","INACTIVE"] },
          { label: "Type",    value: typeFilter,    set: setType,
            options: ["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"] },
          { label: "Listing", value: listingFilter, set: setListing,
            options: ["SALE","RENT","BOTH"] },
        ].map(({ label, value, set, options }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              {label}:
            </span>
            <select value={value} onChange={(e) => set(e.target.value)} style={{
              fontSize: 13, padding: "5px 10px",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: "var(--color-background-primary)",
              color: "var(--color-text-primary)", cursor: "pointer",
            }}>
              <option value="">All</option>
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {(statusFilter || typeFilter || listingFilter || search) && (
          <button
            onClick={() => { setSearch(""); setStatus(""); setType(""); setListing(""); }}
            style={{
              fontSize: 12, padding: "4px 10px",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#FCEBEB", color: "#A32D2D",
          padding: "10px 14px", borderRadius: "var(--border-radius-md)",
          fontSize: 13, marginBottom: "1rem", border: "0.5px solid #F7C1C1",
        }}>
          {error}
        </div>
      )}

      {/* ── Table wrapper — scrolls horizontally, never squeezes ── */}
      <div style={{
        overflowX: "auto",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        width: "100%",
      }}>
        <table style={{
          minWidth: TOTAL_MIN_WIDTH,
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}>
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.label} style={{ width: col.width }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  style={{ ...thBase, cursor: col.sortKey ? "pointer" : "default" }}
                  onClick={() => handleSort(col.sortKey)}
                >
                  {col.label}
                  {col.sortKey && (
                    <SortIcon
                      active={sortField === col.sortKey}
                      dir={sortDir === "asc" ? 1 : -1}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{
                  ...tdBase, textAlign: "center", padding: "2rem",
                  color: "var(--color-text-secondary)",
                }}>
                  Loading…
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{
                  ...tdBase, textAlign: "center", padding: "2rem",
                  color: "var(--color-text-secondary)",
                }}>
                  No properties found
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr
                  key={p.id}
                  onMouseEnter={(e) =>
                    Array.from(e.currentTarget.cells).forEach(
                      (c) => (c.style.background = "var(--color-background-secondary)")
                    )
                  }
                  onMouseLeave={(e) =>
                    Array.from(e.currentTarget.cells).forEach(
                      (c) => (c.style.background = "")
                    )
                  }
                >
                  <td style={{ ...tdBase, fontFamily: "monospace", fontSize: 12,
                    color: "var(--color-text-secondary)" }}>
                    #{p.id}
                  </td>
                  <td style={tdBase} title={p.title}>{p.title}</td>
                  <td style={tdBase} title={p.agentName || `Agent #${p.agentId}`}>
                    {p.agentName || `Agent #${p.agentId}`}
                  </td>
                  <td style={{ ...tdBase, fontWeight: 500 }}>
                    {fmtPrice(p.price, p.currency)}
                  </td>
                  <td style={tdBase}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ ...tdBase, color: "var(--color-text-secondary)" }}>
                    {p.type}
                  </td>
                  <td style={{ ...tdBase, color: "var(--color-text-secondary)" }}>
                    {p.listingType}
                  </td>
                  <td style={tdBase}>
                    <SchemaTag name={p.schemaName || p.tenantSchema} />
                  </td>
                  <td style={{ ...tdBase, color: "var(--color-text-secondary)" }}>
                    {fmtDate(p.createdAt)}
                  </td>
                  <td style={tdBase}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={`/properties/${p.id}`} style={{
                        fontSize: 12, padding: "4px 10px",
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid var(--color-border-secondary)",
                        background: "transparent", cursor: "pointer",
                        color: "var(--color-text-primary)",
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}>
                        View
                      </a>
                      <button onClick={() => setDeleteId(p.id)} style={{
                        fontSize: 12, padding: "4px 10px",
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid #F7C1C1",
                        background: "transparent", cursor: "pointer",
                        color: "#A32D2D", whiteSpace: "nowrap",
                      }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8,
        marginTop: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          {total} properties — page {page + 1} of {totalPages}
        </span>
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent",
          cursor: page === 0 ? "default" : "pointer",
          opacity: page === 0 ? 0.4 : 1,
          color: "var(--color-text-primary)",
        }}>
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            fontSize: 13, padding: "4px 10px",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-secondary)",
            background: i === page ? "var(--color-background-info)" : "transparent",
            cursor: "pointer",
            color: i === page ? "var(--color-text-info)" : "var(--color-text-primary)",
            fontWeight: i === page ? 500 : 400,
          }}>
            {i + 1}
          </button>
        ))}
        <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent",
          cursor: page >= totalPages - 1 ? "default" : "pointer",
          opacity: page >= totalPages - 1 ? 0.4 : 1,
          color: "var(--color-text-primary)",
        }}>
          Next →
        </button>
      </div>

      {/* ── Delete confirm modal ──────────────────────────────────── */}
      {deleteId && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.5rem", maxWidth: 380, width: "90%",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              Delete property #{deleteId}?
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)",
              marginBottom: "1.25rem" }}>
              This performs a soft delete — the record stays in the database with{" "}
              <code style={{ fontFamily: "monospace", fontSize: 12 }}>deleted_at</code> set.
              Only admins can do this.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button disabled={deleting} onClick={() => setDeleteId(null)} style={{
                fontSize: 13, padding: "6px 16px",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-secondary)",
                background: "transparent", cursor: "pointer",
                color: "var(--color-text-primary)",
              }}>
                Cancel
              </button>
              <button disabled={deleting} onClick={() => handleDelete(deleteId)} style={{
                fontSize: 13, padding: "6px 16px",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid #F7C1C1", background: "#FCEBEB",
                cursor: deleting ? "wait" : "pointer",
                color: "#A32D2D", fontWeight: 500,
              }}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProperties() {
  return (
    <MainLayout role="admin">
      <AdminPropertiesContent />
    </MainLayout>
  );
}
