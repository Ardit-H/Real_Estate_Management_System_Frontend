import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  ACTIVE:            { bg: "#edf5f0", color: "#2a6049", dot: "#2a6049",  border: "#a3c9b0" },
  ENDED:             { bg: "#f5f2eb", color: "#8a8469", dot: "#a0997e",  border: "#d9d4c7" },
  CANCELLED:         { bg: "#fff5ee", color: "#8b4513", dot: "#c9723a",  border: "#f5c6a0" },
  PENDING_SIGNATURE: { bg: "#fffbeb", color: "#c9a84c", dot: "#c9a84c",  border: "#f0d878" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v, cur = "EUR") => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
      fontFamily: "'Georgia', serif",
    }}>{msg}</div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "#f0ece3", borderRadius: 14, height: 100, animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f5f2eb", color: "#8a8469", dot: "#a0997e", border: "#d9d4c7" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status?.replace("_", " ")}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "20px 0 4px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page === 0 ? "#f5f2eb" : "#fff", color: page === 0 ? "#c5bfaf" : "#5a5f3a", cursor: page === 0 ? "not-allowed" : "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <span style={{ fontSize: 13, color: "#8a8469", padding: "0 8px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page >= totalPages - 1 ? "#f5f2eb" : "#fff", color: page >= totalPages - 1 ? "#c5bfaf" : "#5a5f3a", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ContractDetailModal({ contract, onClose, onViewPayments }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const expired  = days !== null && days <= 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,20,10,0.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeInOverlay 0.2s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 600, background: "#faf8f3", borderRadius: 18, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto", animation: "slideUpModal .25s ease", fontFamily: "'Georgia', serif" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "22px 26px", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#fff" }}>Kontratë #{contract.id}</p>
              <p style={{ fontSize: 12, color: "#c8ccaa", margin: 0 }}>Prona #{contract.property_id}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "22px 26px" }}>
          {/* Status + days */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f2eb", borderRadius: 10, padding: "12px 16px", marginBottom: 20, border: "1px solid #e5e0d4" }}>
            <StatusBadge status={contract.status} />
            {contract.status === "ACTIVE" && days !== null && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: expiring ? "#c9a84c" : expired ? "#8b4513" : "#8a8469" }}>
                {expiring ? `⚠️ Skadon pas ${days} ditësh` : expired ? "⚠️ Kontrata ka skaduar" : `${days} ditë të mbetura`}
              </span>
            )}
          </div>

          {/* Expiring warning */}
          {expiring && (
            <div style={{ background: "#fffbeb", border: "1px solid #f0d878", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#8a5a00" }}>
              ⚠️ Kontrata juaj skadon brenda <strong>{days} ditësh</strong>. Kontaktoni agjentin tuaj për rinovim.
            </div>
          )}

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Prona",         value: `#${contract.property_id}` },
              { label: "Agjenti",       value: contract.agent_id ? `#${contract.agent_id}` : "—" },
              { label: "Data fillimit", value: fmtDate(contract.start_date) },
              { label: "Data mbarimit", value: fmtDate(contract.end_date) },
              { label: "Qiraja mujore", value: fmtMoney(contract.rent, contract.currency) },
              { label: "Depozita",      value: fmtMoney(contract.deposit, contract.currency) },
              { label: "Krijuar më",    value: fmtDT(contract.created_at) },
              { label: "Ndryshuar",     value: fmtDT(contract.updated_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e5e0d4" }}>
                <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#2c2c1e" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Contract file */}
          {contract.contract_file_url && (
            <div style={{ background: "#f5f2eb", border: "1px solid #e5e0d4", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "#5a5f3a", fontSize: 13.5, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                📄 Hap dokumentin e kontratës ↗
              </a>
            </div>
          )}

          {/* Actions */}
          <div style={{ borderTop: "1px solid #e5e0d4", paddingTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose}
              style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Mbyll
            </button>
            {contract.status === "ACTIVE" && (
              <button onClick={() => { onClose(); onViewPayments(contract); }}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #5a5f3a, #3d4228)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                💳 Shiko Pagesat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Modal ───────────────────────────────────────────────────────────
function ContractPaymentsModal({ contract, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [listRes, sumRes] = await Promise.all([
          api.get(`/api/payments/contract/${contract.id}`),
          api.get(`/api/payments/contract/${contract.id}/summary`),
        ]);
        setPayments(Array.isArray(listRes.data) ? listRes.data : []);
        setSummary(sumRes.data);
      } catch { notify("Gabim gjatë ngarkimit të pagesave", "error"); }
      finally   { setLoading(false); }
    };
    load();
  }, [contract.id, notify]);

  const PAY_STATUS = {
    PENDING:  { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878" },
    PAID:     { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0" },
    FAILED:   { bg: "#fff5ee", color: "#8b4513", border: "#f5c6a0" },
    OVERDUE:  { bg: "#fff5ee", color: "#8b3a1c", border: "#e8b090" },
    REFUNDED: { bg: "#f5f2eb", color: "#5a5f3a", border: "#d9d4c7" },
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(20,20,10,0.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeInOverlay 0.2s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 680, background: "#faf8f3", borderRadius: 18, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto", animation: "slideUpModal .25s ease", fontFamily: "'Georgia', serif" }}>

        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "22px 26px", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#fff" }}>💳 Pagesat — Kontratë #{contract.id}</p>
            <p style={{ fontSize: 12, color: "#c8ccaa", margin: 0 }}>Qiraja: {fmtMoney(contract.rent, contract.currency)} / muaj</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "22px 26px" }}>
          {/* Summary */}
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Pagesa", value: summary.total_payments,                                    color: "#5a5f3a", bg: "#f5f2eb" },
                { label: "Paguar",       value: `€${Number(summary.total_paid    || 0).toLocaleString()}`, color: "#2a6049", bg: "#edf5f0" },
                { label: "Në Pritje",    value: `€${Number(summary.total_pending || 0).toLocaleString()}`, color: "#c9a84c", bg: "#fffbeb" },
                ...(summary.overdue_count > 0 ? [{ label: "Vonuar", value: summary.overdue_count, color: "#8b4513", bg: "#fff5ee" }] : []),
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e0d4" }}>
                  <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e5e0d4", borderTop: "3px solid #5a5f3a", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#8a8469" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
              <p>Nuk ka pagesa për këtë kontratë.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {payments.map(p => {
                const overdue = p.status === "OVERDUE" || (p.status === "PENDING" && p.due_date && new Date(p.due_date) < new Date());
                const s = PAY_STATUS[overdue ? "OVERDUE" : p.status] || { bg: "#f5f2eb", color: "#8a8469", border: "#d9d4c7" };
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: overdue ? "#fff9f5" : "#fff", borderRadius: 10, border: `1px solid ${overdue ? "#f5c6a0" : "#e5e0d4"}` }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#2c2c1e" }}>€{Number(p.amount).toLocaleString("de-DE")}</span>
                        <span style={{ background: "#f5f2eb", color: "#6b6651", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.payment_type}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#8a8469", margin: 0 }}>
                        Due: {fmtDate(p.due_date)}{p.paid_date && ` · Paguar: ${fmtDate(p.paid_date)}`}{p.payment_method && ` · ${p.payment_method}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {overdue && <span style={{ fontSize: 12, color: "#8b4513", fontWeight: 600 }}>⚠️ Vonuar</span>}
                      <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>{p.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: "1px solid #e5e0d4", paddingTop: 16, marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose}
              style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Mbyll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contract Card ────────────────────────────────────────────────────────────
function ContractCard({ contract, onDetail, onPayments }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const s        = STATUS_STYLE[contract.status] || STATUS_STYLE.ENDED;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e5e0d4",
      boxShadow: "0 2px 12px rgba(90,95,58,0.08)", overflow: "hidden",
      transition: "transform 0.18s, box-shadow 0.18s", fontFamily: "'Georgia', serif",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.08)"; }}
    >
      <div style={{ height: 4, background: s.dot }} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a0997e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
              Kontratë #{contract.id}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "#edf2e8", color: "#3d5227", border: "1px solid #c8d4b0", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                Prona #{contract.property_id}
              </span>
            </div>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        {/* Details row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Qiraja",        value: `${fmtMoney(contract.rent, contract.currency)}/muaj` },
            { label: "Depozita",      value: fmtMoney(contract.deposit, contract.currency) },
            { label: "Data fillimit", value: fmtDate(contract.start_date) },
            { label: "Data mbarimit", value: fmtDate(contract.end_date) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f5f2eb", borderRadius: 8, padding: "8px 12px", border: "1px solid #e5e0d4" }}>
              <div style={{ fontSize: 10.5, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2c2c1e" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Expiring banner */}
        {expiring && (
          <div style={{ background: "#fffbeb", border: "1px solid #f0d878", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12.5, color: "#8a5a00", display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ Kontrata skadon brenda <strong>{days} ditësh</strong>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => onDetail(contract)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f5f2eb"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
            Detaje
          </button>
          {contract.status === "ACTIVE" && (
            <button onClick={() => onPayments(contract)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #5a5f3a, #3d4228)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              💳 Pagesat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientContracts() {
  const { user }           = useContext(AuthContext);
  const [contracts,        setContracts]      = useState([]);
  const [loading,          setLoading]        = useState(true);
  const [page,             setPage]           = useState(0);
  const [totalPages,       setTotalPages]     = useState(0);
  const [totalElements,    setTotalElements]  = useState(0);
  const [detailTarget,     setDetailTarget]   = useState(null);
  const [paymentsTarget,   setPaymentsTarget] = useState(null);
  const [toast,            setToast]          = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease/client/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content     || []);
      setTotalPages(res.data.totalPages  || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch { notify("Gabim gjatë ngarkimit të kontratave", "error"); }
    finally   { setLoading(false); }
  }, [user?.id, page, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const stats = {
    active:   contracts.filter(c => c.status === "ACTIVE").length,
    pending:  contracts.filter(c => c.status === "PENDING_SIGNATURE").length,
    expiring: contracts.filter(c => {
      const d = daysUntil(c.end_date);
      return d !== null && d <= 30 && d > 0 && c.status === "ACTIVE";
    }).length,
  };

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Kontratat e Mia
          </h1>
          <p style={{ margin: "0 0 24px", color: "#c8ccaa", fontSize: "15px" }}>
            Shiko dhe menaxho kontratat tuaja të qirasë
          </p>

          {!loading && contracts.length > 0 && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Total",           value: totalElements, accent: "#c8ccaa" },
                { label: "Aktive",          value: stats.active,  accent: "#a3c9b0" },
                { label: "Prisë Nënshkrim", value: stats.pending, accent: "#c9a84c" },
                { label: "Skadojnë Shpejt", value: stats.expiring,accent: "#f5c6a0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", borderRadius: 12, padding: "12px 22px", border: "1px solid rgba(255,255,255,0.15)", minWidth: 90 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#c8ccaa", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px" }}>

          {/* Expiring warning */}
          {stats.expiring > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #f0d878", borderRadius: 12, padding: "14px 20px", marginBottom: 22, fontSize: 13.5, color: "#8a5a00", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ Keni <strong>{stats.expiring}</strong> kontratë që skadon brenda 30 ditëve. Kontaktoni agjentin tuaj.
            </div>
          )}

          {/* Content */}
          {loading ? (
            <Skeleton />
          ) : contracts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px", fontSize: 18 }}>Nuk keni kontrata qiraje</h3>
              <p style={{ margin: 0, fontSize: 14 }}>Kontratat tuaja do të shfaqen këtu pasi të jenë krijuar nga agjenti.</p>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8a8469" }}>
                {totalElements} kontratë{totalElements !== 1 ? " gjithsej" : ""}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {contracts.map(c => (
                  <ContractCard
                    key={c.id} contract={c}
                    onDetail={setDetailTarget}
                    onPayments={setPaymentsTarget}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {detailTarget && (
        <ContractDetailModal
          contract={detailTarget}
          onClose={() => setDetailTarget(null)}
          onViewPayments={(c) => { setDetailTarget(null); setPaymentsTarget(c); }}
        />
      )}
      {paymentsTarget && (
        <ContractPaymentsModal
          contract={paymentsTarget}
          onClose={() => setPaymentsTarget(null)}
          notify={notify}
        />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}