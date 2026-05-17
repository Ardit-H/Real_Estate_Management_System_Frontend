import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { CONTRACT_STATUSES, fmtPrice, fmtDate, INP_S, SEL_S, BTN_PRI, BTN_SEC } from "./salesConstants.js";
import { Badge, Modal, Field, FormRow, Loader, EmptyState, Pagination, AgentTable, TableHead } from "./SalesUI.jsx";
 
// ─── status filter options — all statuses + "All" ────────────────────────────
const ALL_CONTRACT_STATUSES = ["", ...CONTRACT_STATUSES]; // "" = All
 
export function ContractsSection({ prefill, onSelectPayment, notify, currentUserId }) {
  const [contracts,     setContracts]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [statusFilter,  setStatusFilter]  = useState("");   // "" = all statuses
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [statusTarget,  setStatusTarget]  = useState(null);
 
  // ── fetch — all contracts, filtered by status when chosen ─────────────────
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      // backend supports GET /api/sales/contracts (all, paginated, sorted by createdAt desc)
      // and GET /api/sales/contracts/agent/{agentId} — we use the general endpoint so
      // the agent sees all contracts, then filter client-side by agentId = currentUserId
      // for action gating. Status filtering uses the status query param when available;
      // since the backend /api/sales/contracts always returns all statuses, we fetch all
      // and rely on statusFilter to visually guide — OR we use the status endpoint.
      let url;
      if (statusFilter) {
        // GET /api/sales/listings/status/{status} exists for listings;
        // for contracts use GET /api/sales/contracts and filter client-side
        // because backend has no /api/sales/contracts/status/{status} route —
        // the agent endpoint covers this well enough at small scale.
        url = `/api/sales/contracts/agent/${currentUserId}?page=${page}&size=20`;
      } else {
        url = `/api/sales/contracts/agent/${currentUserId}?page=${page}&size=20`;
      }
      const res = await api.get(url);
      let data = res.data.content || [];
 
      // client-side status filter (backend doesn't have a contracts/status route)
      if (statusFilter) {
        data = data.filter(c => c.status === statusFilter);
      }
 
      setContracts(data);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      notify("Error loading contracts", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, currentUserId, notify]);
 
  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => {
    if (prefill?.listingId) { setEditTarget(null); setModalOpen(true); }
  }, [prefill]);
 
  // ── action gating helpers ─────────────────────────────────────────────────
  // A contract is editable only when PENDING and belongs to this agent
  const canEdit    = (c) => c.status === "PENDING"    && c.agent_id === currentUserId;
  // Status can be changed from PENDING → COMPLETED | CANCELLED
  const canStatus  = (c) => c.status === "PENDING"    && c.agent_id === currentUserId;
  // Payments button — visible for any non-cancelled contract of this agent
  const canPayment = (c) => c.status !== "CANCELLED"  && c.agent_id === currentUserId;
 
  // ── status pill colors for filter tabs ───────────────────────────────────
  const STATUS_TABS = [
    { value: "",           label: "All" },
    { value: "PENDING",    label: "Pending" },
    { value: "COMPLETED",  label: "Completed" },
    { value: "CANCELLED",  label: "Cancelled" },
  ];
 
  return (
    <>
      <AgentTable>
        <TableHead>
          <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>
            Sale Contracts
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Status filter tabs */}
            <div style={{ display: "flex", gap: 4, background: "#f0ece3", borderRadius: 999, padding: "3px" }}>
              {STATUS_TABS.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setStatusFilter(t.value); setPage(0); }}
                  style={{
                    padding: "4px 12px", borderRadius: 999, border: "none",
                    background: statusFilter === t.value ? "#fff" : "transparent",
                    color: statusFilter === t.value ? "#1a1714" : "#9a8c6e",
                    fontWeight: statusFilter === t.value ? 600 : 400,
                    fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    boxShadow: statusFilter === t.value ? "0 1px 4px rgba(0,0,0,0.09)" : "none",
                    transition: "all 0.14s",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            <button
              className="as-btn"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{ ...BTN_PRI, padding: "7px 16px", fontSize: 12.5 }}>
              + New Contract
            </button>
          </div>
        </TableHead>
 
        {loading ? (
          <Loader />
        ) : contracts.length === 0 ? (
          <EmptyState
            icon="📄"
            text={statusFilter ? `No ${statusFilter.toLowerCase()} contracts.` : "No contracts yet."}
          />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#faf7f2" }}>
                    {["#", "Property", "Buyer ID", "Sale Price", "Contract Date", "Handover", "Status", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", fontSize: 10.5, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 16px", borderBottom: "1.5px solid #e8e2d6", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid #f0ece3",
                        transition: "background 0.12s",
                        // subtle visual dimming for finalised contracts so agent
                        // can immediately tell which rows are no longer actionable
                        opacity: c.status === "CANCELLED" ? 0.62 : 1,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf7f2"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
 
                      <td style={{ padding: "12px 16px", color: "#b0a890", fontSize: 12 }}>{c.id}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "2px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600 }}>
                          #{c.property_id}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#1a1714", fontSize: 13 }}>#{c.buyer_id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                        {fmtPrice(c.sale_price)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "#9a8c6e" }}>{fmtDate(c.contract_date)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "#9a8c6e" }}>{fmtDate(c.handover_date)}</td>
                      <td style={{ padding: "12px 16px" }}><Badge label={c.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {/* Edit — only PENDING contracts of this agent */}
                          {canEdit(c) && (
                            <button
                              onClick={() => { setEditTarget(c); setModalOpen(true); }}
                              style={{ ...BTN_SEC, padding: "5px 11px", fontSize: 12 }}>
                              Edit
                            </button>
                          )}
 
                          {/* Status change — only PENDING contracts of this agent */}
                          {canStatus(c) && (
                            <button
                              onClick={() => setStatusTarget(c)}
                              style={{ padding: "5px 11px", borderRadius: 9, border: "1.5px solid #e4ddd0", background: "transparent", color: "#6b6248", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                              Status
                            </button>
                          )}
 
                          {/* Payments — any non-cancelled contract of this agent */}
                          {canPayment(c) && (
                            <button
                              onClick={() => onSelectPayment({ contractId: c.id, salePrice: c.sale_price })}
                              style={{ ...BTN_PRI, padding: "5px 11px", fontSize: 12 }}>
                              Payments →
                            </button>
                          )}
 
                          {/* No actions available label — finalised contracts not owned by agent */}
                          {!canEdit(c) && !canStatus(c) && !canPayment(c) && (
                            <span style={{ fontSize: 11.5, color: "#b0a890", background: "#f0ece3", padding: "3px 10px", borderRadius: 999, fontStyle: "italic" }}>
                              {c.agent_id !== currentUserId ? "View only" : c.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </AgentTable>
 
      {modalOpen && (
        <ContractModal
          initial={editTarget}
          prefill={prefill}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); fetchContracts(); notify(editTarget ? "Contract updated" : "Contract created"); }}
          notify={notify}
        />
      )}
      {statusTarget && (
        <ContractStatusModal
          contract={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => { setStatusTarget(null); fetchContracts(); notify("Status updated"); }}
          notify={notify}
        />
      )}
    </>
  );
}
 
export function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:      initial?.property_id      ?? prefill?.propertyId  ?? "",
    listing_id:       initial?.listing_id        ?? prefill?.listingId   ?? "",
    buyer_id:         initial?.buyer_id          ?? "",
    sale_price:       initial?.sale_price        ?? prefill?.price       ?? "",
    currency:         initial?.currency          ?? "EUR",
    contract_date:    initial?.contract_date     ?? "",
    handover_date:    initial?.handover_date     ?? "",
    contract_file_url:initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) {
      notify("Property ID, Buyer ID and price are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        buyer_id:          Number(form.buyer_id),
        sale_price:        Number(form.sale_price),
        currency:          form.currency,
        contract_date:     form.contract_date     || null,
        handover_date:     form.handover_date     || null,
        contract_file_url: form.contract_file_url || null,
      };
      initial
        ? await api.put(`/api/sales/contracts/${initial.id}`, payload)
        : await api.post("/api/sales/contracts", payload);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} wide>
      <FormRow>
        <Field label="Property ID" required>
          <input className="as-in" style={INP_S} type="number" value={form.property_id} onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Listing ID">
          <input className="as-in" style={INP_S} type="number" value={form.listing_id} onChange={e => set("listing_id", e.target.value)} placeholder="(optional)" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Buyer ID" required>
          <input className="as-in" style={INP_S} type="number" value={form.buyer_id} onChange={e => set("buyer_id", e.target.value)} disabled={!!initial} placeholder="Buyer ID" />
        </Field>
        <Field label="Sale Price" required>
          <input className="as-in" style={INP_S} type="number" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} placeholder="ex: 145000" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="as-in" style={SEL_S} value={form.currency} onChange={e => set("currency", e.target.value)}>
            <option>EUR</option><option>USD</option><option>ALL</option>
          </select>
        </Field>
        <Field label="Contract Date">
          <input className="as-in" style={INP_S} type="date" value={form.contract_date} onChange={e => set("contract_date", e.target.value)} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Handover Date">
          <input className="as-in" style={INP_S} type="date" value={form.handover_date} onChange={e => set("handover_date", e.target.value)} min={form.contract_date || undefined} />
        </Field>
        <Field label="Contract File URL">
          <input className="as-in" style={INP_S} value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} placeholder="https://..." />
        </Field>
      </FormRow>
      <div style={{ display: "flex", gap: 9, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={BTN_SEC} onClick={onClose}>Cancel</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create contract"}
        </button>
      </div>
    </Modal>
  );
}
 
export function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status,  setStatus]  = useState("COMPLETED");
  const [saving,  setSaving]  = useState(false);
 
  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/sales/contracts/${contract.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={`Change Status — Contract #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: "#6b6248", marginBottom: 16 }}>
        Current status: <Badge label={contract.status} />
      </p>
      <Field label="New status">
        <select className="as-in" style={SEL_S} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      {status === "COMPLETED" && (
        <div style={{ background: "rgba(126,184,164,0.08)", border: "1.5px solid rgba(126,184,164,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#2a6049" }}>
          💡 Marking as COMPLETED will automatically create commission payments (3% of sale price).
        </div>
      )}
      {status === "CANCELLED" && (
        <div style={{ background: "rgba(212,133,90,0.08)", border: "1.5px solid rgba(212,133,90,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#8b4013" }}>
          ⚠️ Cancelling the contract is irreversible.
        </div>
      )}
      <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
        <button style={BTN_SEC} onClick={onClose}>Cancel</button>
        <button
          style={{ ...BTN_PRI, ...(status === "CANCELLED" ? { background: "#8b3a1c" } : {}) }}
          onClick={handleSubmit}
          disabled={saving}>
          {saving ? "Updating..." : `Confirm — ${status}`}
        </button>
      </div>
    </Modal>
  );
}