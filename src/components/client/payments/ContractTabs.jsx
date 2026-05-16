import { CONTRACT_STATUS_CFG } from "./paymentsHelpers";

export default function ContractTabs({ contracts, selectedId, onSelect }) {
  if (contracts.length === 0) return null;
  return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
      <button onClick={() => onSelect(null)} className="cp-chip"
        style={{
          padding:"7px 16px", borderRadius:999, fontSize:12.5, fontWeight:600,
          border:`1.5px solid ${selectedId===null?"#1a1714":"#e4ddd0"}`,
          background:selectedId===null?"#1a1714":"transparent",
          color:selectedId===null?"#f5f0e8":"#6b6248",
          cursor:"pointer", fontFamily:"inherit",
        }}>
        All Contracts
      </button>
      {contracts.map(c => {
        const s      = CONTRACT_STATUS_CFG[c.status] || CONTRACT_STATUS_CFG.ENDED;
        const active = selectedId === c.id;
        return (
          <button key={c.id} onClick={() => onSelect(c.id)} className="cp-chip"
            style={{
              padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600,
              border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
              background:active?"#1a1714":"transparent",
              color:active?"#f5f0e8":"#6b6248",
              cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:7,
            }}>
            Contract #{c.id}
            <span style={{
              background:active?"rgba(245,240,232,0.12)":s.pill,
              color:active?"rgba(245,240,232,0.7)":s.color,
              border:`1px solid ${active?"rgba(245,240,232,0.2)":s.pillBorder}`,
              padding:"1px 8px", borderRadius:999, fontSize:10.5, fontWeight:700,
            }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}