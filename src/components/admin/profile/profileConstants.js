export const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ap*{box-sizing:border-box}
  .ap{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .ap-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .ap-btn:hover{opacity:.85;transform:translateY(-1px)}
  .ap-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .ap-tab-btn{transition:all .15s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;width:100%;text-align:left}
  .ap-tab-btn:hover{background:#f5f0e8!important}
  .ap-input{font-family:'DM Sans',sans-serif;width:100%;padding:10px 14px;border:1.5px solid #e8e2d6;border-radius:10px;background:#faf7f2;font-size:13.5px;color:#1a1714;outline:none;transition:border-color .15s;}
  .ap-input:focus{border-color:#c9b87a;box-shadow:0 0 0 3px rgba(201,184,122,.13);}
  .ap-input::placeholder{color:#b0a890;}
  @keyframes ap-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ap-spin{to{transform:rotate(360deg)}}
  @keyframes ap-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .ap-card{animation:ap-fade-up .35s ease both}
`;
 
export const btnPrimary = {
  padding: "9px 20px", borderRadius: 10,
  background: `linear-gradient(135deg,#c9b87a,#e8d9a0)`,
  color: "#1a1714", fontWeight: 600, fontSize: 13.5,
  border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  transition: "all .17s ease", boxShadow: `0 2px 8px #c9b87a44`,
};
export const btnDisabled = { ...btnPrimary, opacity: 0.5, cursor: "not-allowed" };
 
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" }) : "—";
 
export const ADMIN_PERMISSIONS = [
  "Full property management",
  "Assigning agents to leads",
  "Management of all leads",
  "User status control",
  "Changing user roles",
  "Soft delete of users",
  "Access to all contracts",
  "Access to all payments",
  "Agent management",
  "Access to background jobs",
];
 