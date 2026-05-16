// Constants
export const CATEGORIES = ["PLUMBING","ELECTRICAL","HVAC","STRUCTURAL","CLEANING","OTHER"];
export const PRIORITIES = ["LOW","MEDIUM","HIGH","URGENT"];

export const CAT_EMOJI  = { PLUMBING:"🔧",ELECTRICAL:"⚡",HVAC:"❄️",STRUCTURAL:"🏗️",CLEANING:"🧹",OTHER:"🔩" };

export const PRI_CFG    = { 
  LOW:{color:"#059669",bg:"#ecfdf5",dot:"#059669",label:"Low"}, 
  MEDIUM:{color:"#d97706",bg:"#fffbeb",dot:"#d97706",label:"Medium"}, 
  HIGH:{color:"#ea580c",bg:"#fff7ed",dot:"#ea580c",label:"High"}, 
  URGENT:{color:"#dc2626",bg:"#fef2f2",dot:"#dc2626",label:"Urgent"} 
};

export const STA_CFG    = { 
  OPEN:{color:"#2563eb",bg:"#eff6ff",label:"Open"}, 
  IN_PROGRESS:{color:"#d97706",bg:"#fffbeb",label:"In Progress"}, 
  COMPLETED:{color:"#059669",bg:"#ecfdf5",label:"Completed"}, 
  CANCELLED:{color:"#64748b",bg:"#f1f5f9",label:"Cancelled"} 
};

export const C = { 
  dark:"#1a1714",gold:"#c9b87a",goldL:"#e8d9a0",border:"#e8e2d6",
  surface:"#faf7f2",muted:"#9a8c6e",text:"#1a1714",textMut:"#b0a890",textSub:"#6b6340" 
};

// Global CSS
export const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
.cl*{box-sizing:border-box}.cl{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
.cl-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}.cl-btn:hover{opacity:.85;transform:translateY(-1px)}
.cl-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
.cl-row{transition:background .15s;cursor:pointer}.cl-row:hover{background:#f5f0e8!important}
.cl-in{width:100%;padding:10px 13px;border:1.5px solid #e4ddd0;border-radius:10px;font-size:13.5px;color:#1a1714;background:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.cl-in:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.12)}
@keyframes cl-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes cl-scale-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes cl-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cl-spin{to{transform:rotate(360deg)}}`;

// Helpers
export const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "—";
export const fmtDT    = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
export const fmtRel   = d => { 
  if(!d)return"—"; 
  const diff=Date.now()-new Date(d).getTime(); 
  const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),days=Math.floor(diff/86400000); 
  if(m<60)return`${m}m ago`; 
  if(h<24)return`${h}h ago`; 
  return`${days}d ago`; 
};