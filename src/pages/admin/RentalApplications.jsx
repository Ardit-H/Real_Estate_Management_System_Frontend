import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_CFG = {
  PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
  APPROVED:  { bg: "#EAF3DE", color: "#3B6D11" },
  REJECTED:  { bg: "#FCEBEB", color: "#A32D2D" },
  CANCELLED: { bg: "#F1EFE8", color: "#5F5E5A" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block" }}>
      {label ?? "—"}
    </span>
  );
}

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e8edf4", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: type === "error" ? "#fee2e2" : "#ecfdf5", color: type === "error" ? "#b91c1c" : "#047857", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340 }}>
      {msg}
    </div>
  );
}

// ─── Shared table styles ──────────────────────────────────────────────────────

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#64748b", borderBottom: "1px solid #e8edf4", background: "#f8fafc", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e8edf4", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 4px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 6px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

const pgBtn = (disabled) => ({ fontSize: 13, padding: "5px 12px", borderRadius: 8, border: "0.5px solid #d1d5db", background: "transparent", color: disabled ? "#cbd5e1" : "#374151", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 });

const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });

// ─── Application detail modal ─────────────────────────────────────────────────

function AppDetailModal({ app: a, onClose }) {
  return (
    <Modal title={`Aplikim #${a.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID", `#${a.id}`],
          ["Listing", `#${a.listing_id}`],
          ["Client", `#${a.client_id}`],
          ["Status", "badge"],
          ["Income", fmtPrice(a.income)],
          ["Move-in Date", fmtDate(a.move_in_date)],
          ["Reviewed By", a.reviewed_by ? `#${a.reviewed_by}` : "—"],
          ["Reviewed At", fmtDateTime(a.reviewed_at)],
          ["Created", fmtDateTime(a.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={a.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{val}</p>}
          </div>
        ))}
      </div>
      {a.message && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Mesazhi i Klientit</p>
          <div style={{ background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {a.message}
          </div>
        </div>
      )}
      {a.rejection_reason && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Arsyeja e Refuzimit</p>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
            {a.rejection_reason}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({ app, onClose, onSuccess, notify }) {
  const [status, setStatus]   = useState("APPROVED");
  const [reason, setReason]   = useState("");
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async () => {
    if (status === "REJECTED" && !reason.trim()) {
      notify("Arsyeja e refuzimit është e detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      // PATCH /api/rentals/applications/{id}/review
      await api.patch(`/api/rentals/applications/${app.id}/review`, {
        status,
        rejection_reason: status === "REJECTED" ? reason : null,
      });
      notify(`Aplikimi u shënua si ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë shqyrtimit", "error");
    } finally {
      setSaving(false);
    }
  };

  const isReject = status === "REJECTED";
  return (
    <Modal title={`Shqyrto Aplikimin #${app.id}`} onClose={onClose}>
      <div style={{ background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13 }}>
        <span style={{ color: "#64748b" }}>Client <strong>#{app.client_id}</strong> aplikoi për Listing <strong>#{app.listing_id}</strong></span>
        {app.income && <span style={{ marginLeft: 12, color: "#047857" }}>Të ardhura: {fmtPrice(app.income)}</span>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
          Vendimi <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {["APPROVED", "REJECTED"].map((s) => (
            <button key={s} onClick={() => setStatus(s)} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: status === s ? "2px solid " + (s === "APPROVED" ? "#22c55e" : "#ef4444") : "1px solid #d1d5db",
              background: status === s ? (s === "APPROVED" ? "#ecfdf5" : "#fef2f2") : "#fff",
              color: status === s ? (s === "APPROVED" ? "#15803d" : "#b91c1c") : "#374151",
            }}>
              {s === "APPROVED" ? "✓ Approve" : "✕ Reject"}
            </button>
          ))}
        </div>
      </div>

      {isReject && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
            Arsyeja e refuzimit <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            value={reason} onChange={(e) => setReason(e.target.value)}
            rows={3} placeholder="Shkruaj arsyen e refuzimit..."
            style={{ width: "100%", padding: "8px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
          />
        </div>
      )}

      <div style={{
        background: isReject ? "#fef2f2" : "#ecfdf5",
        border: `1px solid ${isReject ? "#fecaca" : "#a7f3d0"}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 18,
        fontSize: 13, color: isReject ? "#b91c1c" : "#047857",
      }}>
        {isReject ? "⚠️ Aplikimi do të shënohet si REJECTED — klienti do njoftohet." : "✓ Aplikimi do të shënohet si APPROVED."}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${isReject ? "btn--danger" : "btn--primary"}`} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shqyrtuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Applications by listing modal ───────────────────────────────────────────

function AppsByListingModal({ listingId, onClose, notify }) {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/rentals/applications/listing/{listingId}
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setLoading(false);
    }
  }, [listingId, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Modal title={`Aplikimet për Listing #${listingId}`} onClose={onClose} maxWidth={680}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>Duke ngarkuar…</div>
      ) : apps.length === 0 ? (
        <Empty icon="📋" text="Nuk ka aplikime për këtë listing." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {apps.map((a) => (
            <div key={a.id} style={{ border: "1px solid #e8edf4", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>#{a.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Client #{a.client_id}</span>
                  <Badge label={a.status} />
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
                  {a.income && <span>💰 {fmtPrice(a.income)}</span>}
                  {a.move_in_date && <span>📅 Move-in: {fmtDate(a.move_in_date)}</span>}
                  <span>🕐 {fmtDateTime(a.created_at)}</span>
                </div>
                {a.message && (
                  <p style={{ fontSize: 12, color: "#475569", margin: "6px 0 0", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    "{a.message}"
                  </p>
                )}
              </div>
              {a.status === "PENDING" && (
                <button style={btnSm("#fffbeb", "#92400e", "#fde68a")} onClick={() => setReviewTarget(a)}>
                  Shqyrto
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          app={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); fetch(); notify("Aplikimi u shqyrtua"); }}
          notify={notify}
        />
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminRentalApplications() {
  // We browse applications by selecting a listing ID
  const [listingId, setListingId]     = useState("");
  const [inputId, setInputId]         = useState("");
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [statusF, setStatusF]         = useState("");

  const [detailTarget, setDetail]     = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [listingModal, setListingModal] = useState(null);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchApps = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [listingId, notify]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const displayed = statusF ? apps.filter((a) => a.status === statusF) : apps;

  const counts = APP_STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }), {});

  const statusColors = { PENDING: "#f59e0b", APPROVED: "#22c55e", REJECTED: "#ef4444", CANCELLED: "#94a3b8" };

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Rental Applications</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Admin view — shiko dhe shqyrto aplikimet sipas listing
        </p>
      </div>

      {/* Stats */}
      {apps.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {APP_STATUSES.map((s) => (
            <div key={s} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4", padding: "12px 18px", flex: "1 1 100px", minWidth: 90 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: statusColors[s], margin: 0, letterSpacing: "-0.02em" }}>{counts[s]}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid #e8edf4", flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>Listing ID:</label>
          <input type="number" value={inputId} onChange={(e) => setInputId(e.target.value)}
            placeholder="ex: 5"
            style={{ width: 110, padding: "7px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none" }}
          />
          <button onClick={() => setListingId(inputId ? Number(inputId) : "")}
            style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer" }}>
            Load
          </button>
          {listingId && (
            <button onClick={() => setListingModal(listingId)}
              style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500 }}>
              Shiko si modal →
            </button>
          )}
          <div style={{ marginLeft: "auto" }}>
            <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
              style={{ padding: "7px 10px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", cursor: "pointer" }}>
              <option value="">All statuses</option>
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {!listingId ? (
          <Empty icon="📋" text="Shkruaj Listing ID dhe kliko Load për të parë aplikimet." />
        ) : loading ? <Loader /> : displayed.length === 0 ? (
          <Empty icon="📋" text={statusF ? `Nuk ka aplikime me status ${statusF}.` : "Nuk ka aplikime për këtë listing."} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
              <thead>
                <tr>
                  {["#ID", "Client", "Status", "Income", "Move-in Date", "Reviewed By", "Reviewed At", "Created", "Actions"].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((a) => (
                  <tr key={a.id}
                    onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "#f8fafc"))}
                    onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""))}>
                    <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{a.id}</td>
                    <td style={TD}>
                      <span style={{ background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        #{a.client_id}
                      </span>
                    </td>
                    <td style={TD}><Badge label={a.status} /></td>
                    <td style={{ ...TD, fontWeight: 500 }}>{fmtPrice(a.income)}</td>
                    <td style={{ ...TD, color: "#64748b" }}>{fmtDate(a.move_in_date)}</td>
                    <td style={{ ...TD, color: "#64748b" }}>{a.reviewed_by ? `#${a.reviewed_by}` : "—"}</td>
                    <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDateTime(a.reviewed_at)}</td>
                    <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDateTime(a.created_at)}</td>
                    <td style={TD}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")} onClick={() => setDetail(a)}>Detail</button>
                        {a.status === "PENDING" && (
                          <button style={btnSm("#fffbeb", "#92400e", "#fde68a")} onClick={() => setReviewTarget(a)}>Shqyrto</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailTarget  && <AppDetailModal app={detailTarget} onClose={() => setDetail(null)} />}
      {reviewTarget  && (
        <ReviewModal
          app={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); fetchApps(); notify("Aplikimi u shqyrtua"); }}
          notify={notify}
        />
      )}
      {listingModal  && <AppsByListingModal listingId={listingModal} onClose={() => setListingModal(null)} notify={notify} />}
      {toast         && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
