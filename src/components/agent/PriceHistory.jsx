import { useState, useEffect } from "react";
import api from "../../api/axios";
import { fmtPrice } from "../../constants/propertyConstants";
import Modal from "./Modal";

export default function PriceHistory({ propertyId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/properties/${propertyId}/price-history`)
      .then(r => setHistory(r.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <Modal title="Price History" onClose={onClose}>
      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>Loading…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>No price changes recorded yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {history.map(h => {
            const diff = h.new_price - h.old_price;
            const pct  = h.old_price ? ((diff / h.old_price) * 100).toFixed(1) : null;
            return (
              <div key={h.id} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", borderRadius:"var(--radius-md)", background:"var(--surface-1)", border:"1px solid var(--border-light)" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background: diff >= 0 ? "#ecfdf5" : "#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                  {diff >= 0 ? "↑" : "↓"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>
                      {fmtPrice(h.old_price, h.currency)} → {fmtPrice(h.new_price, h.currency)}
                    </span>
                    {pct && (
                      <span style={{ fontSize:12, fontWeight:500, padding:"2px 8px", borderRadius:20, background: diff >= 0 ? "#ecfdf5" : "#fef2f2", color: diff >= 0 ? "#059669" : "#dc2626" }}>
                        {diff >= 0 ? "+" : ""}{pct}%
                      </span>
                    )}
                  </div>
                  {h.reason && <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>{h.reason}</div>}
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>
                    {new Date(h.changed_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
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
