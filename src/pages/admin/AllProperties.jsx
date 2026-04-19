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

// Column definitions — widths are fixed px so table never squeezes columns
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

// ─── Small UI helpers ─────────────────────────────────────────────────────────

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

// Reusable select dropdown for filters
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: 13, padding: "5px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)", cursor: "pointer",
        }}
      >
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

function AllPropertiesContent() {
  const { user } = useContext(AuthContext);

  // Derive tenant schema from localStorage (set during login via JWT claims)
  // AuthProvider stores user_info which has tenantId.
  // The actual schema_name is embedded in the JWT and used by the backend;
  // for display purposes we reconstruct it the same way SchemaProvisioningService does:
  // "tenant_" + slug.toLowerCase().replaceAll("[^a-z0-9]", "_") + "_" + tenantId
  // But we only have tenantId in user_info, so we show it as a readable tag.
  const tenantSchema = (() => {
    try {
      const info = JSON.parse(localStorage.getItem("user_info") || "{}");
      // If your login response ever adds schemaName to user_info, use it directly.
      // Otherwise fall back to a readable label using tenantName + tenantId.
      if (info.schemaName) return info.schemaName;
      if (info.tenantName && info.tenantId) {
        const slug = info.tenantName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        return `tenant_${slug}_${info.tenantId}`;
      }
      return null;
    } catch {
      return null;
    }
  })();

  // ── State ──────────────────────────────────────────────────────

  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Filters (match backend @RequestParam names exactly)
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");   // PropertyStatus enum
  const [type, setType]         = useState("");   // PropertyType enum
  const [listingType, setListing] = useState(""); // ListingType enum

  // Sort
  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc,   setSortAsc  ] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting,     setDeleting    ] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const sortParam = `${sortField},${sortAsc ? "asc" : "desc"}`;

    try {
      let res;

      if (search.trim()) {
        // GET /api/properties/search?keyword=&page=&size=
        // Note: search endpoint doesn't support sort param per your controller
        res = await api.get("/api/properties/search", {
          params: {
            keyword: search.trim(),
            page,
            size: PAGE_SIZE,
          },
        });

      } else if (status || type || listingType) {
        // GET /api/properties/filter — params match @RequestParam names exactly
        res = await api.get("/api/properties/filter", {
          params: {
            ...(status      && { status }),
            ...(type        && { type }),
            ...(listingType && { listingType }),
            page,
            size: PAGE_SIZE,
          },
        });

      } else {
        // GET /api/properties?page=&size=&sortBy=&sortDir=
        // Controller uses sortBy + sortDir (not Spring's default sort param)
        res = await api.get("/api/properties", {
          params: {
            page,
            size: PAGE_SIZE,
            sortBy:  sortField,
            sortDir: sortAsc ? "asc" : "desc",
          },
        });
      }

      // Spring Page<T> response shape:
      // { content: [], totalElements: N, totalPages: N, ... }
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

  // Reset to page 0 whenever filters or search change
  useEffect(() => { setPage(0); }, [search, status, type, listingType]);

  // ── Sort handler ───────────────────────────────────────────────

  function handleSort(key) {
    if (!key) return;
    if (sortField === key) setSortAsc((a) => !a);
    else { setSortField(key); setSortAsc(true); }
  }

  // ── Delete handler ─────────────────────────────────────────────

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // DELETE /api/properties/{id}  — requires ADMIN or AGENT role
      await api.delete(`/api/properties/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Fshirja dështoi.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Clear all filters ──────────────────────────────────────────

  const hasFilters = search || status || type || listingType;
  function clearFilters() {
    setSearch(""); setStatus(""); setType(""); setListing("");
  }

  // ── Row hover helper ───────────────────────────────────────────

  function onRowEnter(e) {
    Array.from(e.currentTarget.cells).forEach(
      (c) => (c.style.background = "var(--color-background-secondary)")
    );
  }
  function onRowLeave(e) {
    Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""));
  }

  // ── Pagination buttons ─────────────────────────────────────────

  function PageBtn({ n }) {
    const active = n === page;
    return (
      <button
        onClick={() => setPage(n)}
        style={{
          fontSize: 13, padding: "4px 10px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: active ? "var(--color-background-info)" : "transparent",
          color: active ? "var(--color-text-info)" : "var(--color-text-primary)",
          fontWeight: active ? 500 : 400, cursor: "pointer",
        }}
      >
        {n + 1}
      </button>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div style={{ padding: "1.5rem 0" }}>

      {/* ── Header + search bar ─────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1, minWidth: 140 }}>
          All properties
        </h1>

        {/* Search */}
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
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, agent, city or ID…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 14, width: "100%", color: "var(--color-text-primary)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                border: "none", background: "transparent",
                cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
                color: "var(--color-text-secondary)",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 10, marginBottom: "1rem",
        flexWrap: "wrap", alignItems: "center",
      }}>
        <FilterSelect
          label="Status" value={status} onChange={setStatus}
          options={["AVAILABLE","PENDING","SOLD","RENTED","INACTIVE"]}
        />
        <FilterSelect
          label="Type" value={type} onChange={setType}
          options={["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"]}
        />
        <FilterSelect
          label="Listing" value={listingType} onChange={setListing}
          options={["SALE","RENT","BOTH"]}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              fontSize: 12, padding: "5px 12px",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Error banner ────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#FCEBEB", color: "#A32D2D", fontSize: 13,
          padding: "10px 14px", marginBottom: "1rem",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid #F7C1C1",
        }}>
          {error}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      {/* Outer div scrolls horizontally — table never squeezes below minWidth */}
      <div style={{
        overflowX: "auto",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        width: "100%",
      }}>
        <table style={{
          width: "100%",
          minWidth: TABLE_MIN_WIDTH,
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}>
          <colgroup>
            {COLUMNS.map((c) => (
              <col key={c.label} style={{ width: c.width }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.label}
                  style={{ ...TH, cursor: c.sortKey ? "pointer" : "default" }}
                  onClick={() => handleSort(c.sortKey)}
                >
                  {c.label}
                  {c.sortKey && (
                    <SortArrow
                      active={sortField === c.sortKey}
                      asc={sortAsc}
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
                  ...TD, textAlign: "center", padding: "2.5rem",
                  color: "var(--color-text-secondary)",
                }}>
                  <span style={{ opacity: 0.6 }}>Loading…</span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{
                  ...TD, textAlign: "center", padding: "2.5rem",
                  color: "var(--color-text-secondary)",
                }}>
                  No properties found
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} onMouseEnter={onRowEnter} onMouseLeave={onRowLeave}>

                  {/* #ID — PropertySummaryResponse.id */}
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: 12,
                    color: "var(--color-text-secondary)" }}>
                    #{p.id}
                  </td>

                  {/* Title — PropertySummaryResponse.title */}
                  <td style={TD} title={p.title ?? ""}>{p.title ?? "—"}</td>

                  {/* Agent — PropertySummaryResponse.agent_id (no name in DTO)
                      agentId is the only agent field in PropertySummaryResponse.
                      If you later add agentName to the DTO, replace this. */}
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>
                    {p.agent_id != null ? `Agent #${p.agent_id}` : "—"}
                  </td>

                  {/* Price — PropertySummaryResponse.price + currency */}
                  <td style={{ ...TD, fontWeight: 500 }}>
                    {fmtPrice(p.price, p.currency)}
                  </td>

                  {/* Status — PropertySummaryResponse.status */}
                  <td style={TD}>
                    <Badge status={p.status} />
                  </td>

                  {/* Type — PropertySummaryResponse.type */}
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>
                    {p.type ?? "—"}
                  </td>

                  {/* Listing type — PropertySummaryResponse.listing_type */}
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>
                    {p.listing_type ?? "—"}
                  </td>

                  {/* Tenant schema — derived from logged-in user's JWT context.
                      PropertySummaryResponse has no schemaName field (by design —
                      schema isolation is transparent). We display the current
                      tenant's schema which is the same for every row this admin sees. */}
                  <td style={TD}>
                    <SchemaTag name={tenantSchema} />
                  </td>

                  {/* Created — PropertySummaryResponse.created_at */}
                  <td style={{ ...TD, color: "var(--color-text-secondary)" }}>
                    {fmtDate(p.created_at)}
                  </td>

                  {/* Actions */}
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a
                        href={`/admin/properties/${p.id}`}
                        style={{
                          fontSize: 12, padding: "4px 10px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid var(--color-border-secondary)",
                          background: "transparent", cursor: "pointer",
                          color: "var(--color-text-primary)",
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        View
                      </a>
                      <button
                        onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                        style={{
                          fontSize: 12, padding: "4px 10px",
                          borderRadius: "var(--border-radius-md)",
                          border: "0.5px solid #F7C1C1",
                          background: "transparent", cursor: "pointer",
                          color: "#A32D2D", whiteSpace: "nowrap",
                        }}
                      >
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

      {/* ── Pagination ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginTop: "1rem", justifyContent: "flex-end", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", marginRight: 4 }}>
          {total} properties — page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          style={{
            fontSize: 13, padding: "4px 10px",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-secondary)",
            background: "transparent",
            cursor: page === 0 ? "default" : "pointer",
            opacity: page === 0 ? 0.38 : 1,
            color: "var(--color-text-primary)",
          }}
        >
          ← Prev
        </button>

        {/* Show max 7 page buttons to avoid overflow */}
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => {
            if (totalPages <= 7) return true;
            if (i === 0 || i === totalPages - 1) return true;
            return Math.abs(i - page) <= 2;
          })
          .reduce((acc, i, idx, arr) => {
            if (idx > 0 && i - arr[idx - 1] > 1) {
              acc.push("…");
            }
            acc.push(i);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`}
                style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "0 2px" }}>
                …
              </span>
            ) : (
              <PageBtn key={item} n={item} />
            )
          )}

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
          style={{
            fontSize: 13, padding: "4px 10px",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-secondary)",
            background: "transparent",
            cursor: page >= totalPages - 1 ? "default" : "pointer",
            opacity: page >= totalPages - 1 ? 0.38 : 1,
            color: "var(--color-text-primary)",
          }}
        >
          Next →
        </button>
      </div>

      {/* ── Delete confirmation modal ────────────────────────────── */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.42)",
            display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-lg)",
              padding: "1.5rem 1.75rem",
              maxWidth: 400, width: "90%",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              Delete property #{deleteTarget.id}?
            </h2>
            <p style={{
              fontSize: 14, color: "var(--color-text-secondary)",
              marginBottom: "1.25rem", lineHeight: 1.6,
            }}>
              "{deleteTarget.title}" do të fshihet me soft delete —
              rekordi mbetet në bazën e të dhënave me{" "}
              <code style={{ fontFamily: "monospace", fontSize: 12 }}>deleted_at</code>{" "}
              të vendosur. Kjo veprim kërkon rol ADMIN ose AGENT.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                style={{
                  fontSize: 13, padding: "7px 18px",
                  borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "transparent", cursor: "pointer",
                  color: "var(--color-text-primary)",
                }}
              >
                Anulo
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  fontSize: 13, padding: "7px 18px",
                  borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid #F7C1C1",
                  background: "#FCEBEB",
                  cursor: deleting ? "wait" : "pointer",
                  color: "#A32D2D", fontWeight: 500,
                }}
              >
                {deleting ? "Duke fshirë…" : "Po, fshi"}
              </button>
            </div>
          </div>
        </div>
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
