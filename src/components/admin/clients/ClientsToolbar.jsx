// src/components/admin/clients/ClientsToolbar.jsx

import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthProvider";
import api from "../../../api/axios";

function InviteModal({ token, onClose }) {
  const link = `${window.location.origin}/register?token=${token}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="ac-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ac-modal" style={{ maxWidth: 500 }}>
        <div className="ac-modal-header">
          <p className="ac-modal-title">Invite Client</p>
          <p className="ac-modal-sub">Link valid për 7 ditë · single-use</p>
        </div>
        <div className="ac-modal-body">
          <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "12px 15px", marginBottom: 18, fontSize: 13, color: "rgba(245,240,232,0.65)", lineHeight: 1.6 }}>
            <strong style={{ color: "#34d399" }}>ℹ️ Si funksionon</strong><br />
            Klienti hap këtë link, plotëson emrin, emailin dhe fjalëkalimin.
            Llogaria e tij krijohet automatikisht në kompaninë tuaj si <strong>Client</strong>.
            Linku skadon pas <strong>7 ditëve</strong> ose pasi të përdoret.
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(201,184,122,0.5)", marginBottom: 8 }}>
              Invitation Link
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, padding: "10px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,184,122,0.14)", borderRadius: 9, fontSize: 12, color: "rgba(245,240,232,0.6)", wordBreak: "break-all", fontFamily: "monospace" }}>
                {link}
              </div>
              <button
                onClick={handleCopy}
                style={{ height: 40, padding: "0 16px", borderRadius: 9, border: copied ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(52,211,153,0.25)", background: copied ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.07)", color: "#34d399", fontSize: 12.5, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="ac-modal-footer">
            <button className="ac-btn-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsToolbar({ search, setSearch, filterActive, setFilterActive, count }) {
  const { user }            = useContext(AuthContext);
  const [token,     setToken]     = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error,     setError]     = useState(null);

  const handleInvite = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post("/api/invites", {
        role:      "CLIENT",
        tenant_id: user.tenantId,
      });
      setToken(res.data.token);
    } catch {
      setError("Gabim gjatë gjenerimit të linkut");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="ac-toolbar">
        <div className="ac-search">
          <span className="ac-search-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or city..."
          />
        </div>
        <button
          className={`ac-filter-btn ${filterActive === true ? "active" : ""}`}
          onClick={() => setFilterActive(p => p === true ? null : true)}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} /> Active
        </button>
        <button
          className={`ac-filter-btn ${filterActive === false ? "active" : ""}`}
          onClick={() => setFilterActive(p => p === false ? null : false)}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> Inactive
        </button>
        <span className="ac-count">{count} client{count !== 1 ? "s" : ""}</span>

        <button
          onClick={handleInvite}
          disabled={generating}
          style={{ height: 40, padding: "0 18px", background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.17s", opacity: generating ? 0.6 : 1 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {generating ? "Generating..." : "Invite Client"}
        </button>

        {error && <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>}
      </div>

      {token && <InviteModal token={token} onClose={() => setToken(null)} />}
    </>
  );
}