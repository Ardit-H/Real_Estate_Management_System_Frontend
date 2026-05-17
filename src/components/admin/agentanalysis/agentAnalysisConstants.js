export const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .aa *{box-sizing:border-box}
  .aa{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .aa-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden;transition:box-shadow .2s,transform .2s}
  .aa-card:hover{box-shadow:0 6px 28px rgba(20,16,10,.11);transform:translateY(-2px)}
  .aa-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .aa-btn:hover{opacity:.85;transform:translateY(-1px)}
  @keyframes aa-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes aa-spin{to{transform:rotate(360deg)}}
  @keyframes aa-pulse{0%,100%{opacity:.35}50%{opacity:.8}}
  .aa-card{animation:aa-fade-up .35s ease both}
`;
 
export const LEVEL_CFG = {
  EXCELLENT:         { color: "#059669", bg: "#ecfdf5", bar: "#059669" },
  GOOD:              { color: "#0ea5e9", bg: "#f0f9ff", bar: "#0ea5e9" },
  AVERAGE:           { color: "#d97706", bg: "#fffbeb", bar: "#d97706" },
  NEEDS_IMPROVEMENT: { color: "#dc2626", bg: "#fef2f2", bar: "#dc2626" },
};
 