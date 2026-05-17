export const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .bj *{box-sizing:border-box}
  .bj{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .bj-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .bj-btn:hover{opacity:.85;transform:translateY(-1px)}
  .bj-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  @keyframes bj-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bj-spin{to{transform:rotate(360deg)}}
  .bj-card{animation:bj-fade-up .35s ease both}
  .bj-job-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);padding:20px 22px;transition:box-shadow .2s,transform .2s}
  .bj-job-card:hover{box-shadow:0 6px 28px rgba(20,16,10,.10);transform:translateY(-2px)}
`;
 
export const JOBS = [
  { id:"overdue-payments",   name:"Mark Overdue Payments",    schedule:"Daily at 00:00",       icon:"💳", description:"Marks PENDING payments with past due_date as OVERDUE.",                                         color:"#dc2626", bg:"#fef2f2" },
  { id:"expiring-contracts", name:"Check Expiring Contracts", schedule:"Daily at 08:00",       icon:"📄", description:"Finds leases expiring within 30 days and sends alerts.",                                        color:"#d97706", bg:"#fffbeb" },
  { id:"system-stats",       name:"Log System Stats",         schedule:"Every 6 hours",        icon:"📊", description:"Logs active lease count per tenant for monitoring.",                                             color:"#7c3aed", bg:"#f5f3ff" },
  { id:"health-check",       name:"Health Check",             schedule:"Every 60 seconds",     icon:"🩺", description:"Verifies active schemas are reachable.",                                                         color:"#059669", bg:"#ecfdf5" },
  { id:"weekly-report",      name:"Weekly Admin Report",      schedule:"Mondays at 09:00",     icon:"📈", description:"Generates weekly summary: overdue, expiring, unassigned leads.",                                 color:"#2563eb", bg:"#eff6ff" },
];
 
export const LEGEND = [
  { icon:"💳", label:"Payments",  color:"#dc2626", bg:"#fef2f2" },
  { icon:"📄", label:"Contracts", color:"#d97706", bg:"#fffbeb" },
  { icon:"📊", label:"Stats",     color:"#7c3aed", bg:"#f5f3ff" },
  { icon:"🩺", label:"Health",    color:"#059669", bg:"#ecfdf5" },
  { icon:"📈", label:"Reports",   color:"#2563eb", bg:"#eff6ff" },
];
 