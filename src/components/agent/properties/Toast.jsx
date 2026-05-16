export default function Toast({ msg, type }) {
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:500,
      background: type === "error" ? "#dc2626" : "#059669",
      color:"white", padding:"12px 20px", borderRadius:"var(--radius-md)",
      fontSize:13.5, fontWeight:500,
      boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
      animation:"dropdownIn 200ms ease",
    }}>
      {type === "error" ? "✕ " : "✓ "}{msg}
    </div>
  );
}
