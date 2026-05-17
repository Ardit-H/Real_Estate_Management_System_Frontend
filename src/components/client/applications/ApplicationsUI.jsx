import { useEffect } from "react";
import { S, ChevronLeftIcon, ChevronRightIcon } from "./applicationsConstants";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}
 
export function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "#f0ece3", borderRadius: "14px", height: "160px", animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  );
}
 
export function Pagination({ page, totalPages, onLoadApps, statusFilter }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "36px", flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onLoadApps(page - 1, statusFilter)}
        style={S.pageBtn(false, page === 0)}><ChevronLeftIcon /></button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (
          <span key={p} style={{ display: "flex", gap: "6px" }}>
            {gap && <span style={{ padding: "6px 4px", color: "#8a8469" }}>…</span>}
            <button onClick={() => onLoadApps(p, statusFilter)} style={S.pageBtn(p === page, false)}>{p + 1}</button>
          </span>
        );
      })}
      <button disabled={page === totalPages - 1} onClick={() => onLoadApps(page + 1, statusFilter)}
        style={S.pageBtn(false, page === totalPages - 1)}><ChevronRightIcon /></button>
    </div>
  );
}
 