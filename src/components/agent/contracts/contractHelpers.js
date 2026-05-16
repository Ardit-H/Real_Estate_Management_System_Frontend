// ── Constants ─────────────────────────────────────────────────────────────────
export const LEASE_STATUSES = ["ACTIVE","ENDED","CANCELLED","PENDING_SIGNATURE"];
export const CURRENCIES     = ["EUR","USD","ALL"];

// ── Status config ─────────────────────────────────────────────────────────────
export const STATUS_CFG = {
  ACTIVE:            { strip:"#7eb8a4", pill:"rgba(126,184,164,0.1)",  pillBorder:"rgba(126,184,164,0.25)", color:"#2a6049",  label:"Active" },
  ENDED:             { strip:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248",  label:"Ended" },
  CANCELLED:         { strip:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513",  label:"Cancelled" },
  PENDING_SIGNATURE: { strip:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30",  label:"Pending Signature" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
export const fmtMoney = (v, cur="EUR") => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
}

// ── Validator ─────────────────────────────────────────────────────────────────
export function validateContractForm(form, notify) {
  if(!form.property_id||isNaN(Number(form.property_id))||Number(form.property_id)<=0){notify("Property ID duhet të jetë numër pozitiv","error");return false;}
  if(form.listing_id&&(isNaN(Number(form.listing_id))||Number(form.listing_id)<=0)){notify("Listing ID duhet të jetë numër pozitiv","error");return false;}
  if(!form.client_id||isNaN(Number(form.client_id))||Number(form.client_id)<=0){notify("Client ID duhet të jetë numër pozitiv","error");return false;}
  if(!form.start_date){notify("Data e fillimit është e detyrueshme","error");return false;}
  if(!form.end_date){notify("Data e mbarimit është e detyrueshme","error");return false;}
  if(new Date(form.end_date)<=new Date(form.start_date)){notify("Data e mbarimit duhet të jetë pas datës së fillimit","error");return false;}
  if(!form.rent||isNaN(Number(form.rent))||Number(form.rent)<=0){notify("Qiraja mujore duhet të jetë më e madhe se 0","error");return false;}
  if(Number(form.rent)>999999999){notify("Qiraja është shumë e madhe","error");return false;}
  if(form.deposit&&(isNaN(Number(form.deposit))||Number(form.deposit)<0)){notify("Depozita nuk mund të jetë negative","error");return false;}
  if(form.contract_file_url&&form.contract_file_url.length>500){notify("URL nuk mund të kalojë 500 karaktere","error");return false;}
  if(form.contract_file_url&&!form.contract_file_url.startsWith("http")){notify("URL duhet të fillojë me http/https","error");return false;}
  return true;
}

// ── Shared inline styles ──────────────────────────────────────────────────────
export const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
export const SEL_S = {...INP_S,cursor:"pointer"};
export const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
export const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};