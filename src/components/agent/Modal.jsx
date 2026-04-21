import { useEffect } from "react";

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:300, padding:24,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"white", borderRadius:"var(--radius-xl)",
        width:"100%", maxWidth: wide ? 800 : 580,
        boxShadow:"0 24px 60px rgba(15,23,42,0.18)",
        animation:"dropdownIn 200ms ease",
        maxHeight:"90vh", overflow:"hidden",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{
          padding:"20px 24px", borderBottom:"1px solid var(--border-light)",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
        }}>
          <span style={{ fontWeight:600, fontSize:15 }}>{title}</span>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:20, color:"var(--text-muted)", lineHeight:1,
          }}>✕</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1 }}>{children}</div>
      </div>
    </div>
  );
}
