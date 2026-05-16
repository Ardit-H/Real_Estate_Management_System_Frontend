import { useState, useEffect } from "react";
import api from "../../../api/axios";

export default function ProfileModal({ user, profile, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    first_name:        user?.first_name||"",
    last_name:         user?.last_name||"",
    email:             user?.email||"",
    phone:             profile?.phone||"",
    preferred_contact: profile?.preferred_contact||"EMAIL",
    budget_min:        profile?.budget_min||"",
    budget_max:        profile?.budget_max||"",
    preferred_type:    profile?.preferred_type||"",
    preferred_city:    profile?.preferred_city||"",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  useEffect(()=>{ document.body.style.overflow="hidden"; return()=>{ document.body.style.overflow=""; }; },[]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put("/api/users/me",{ first_name:form.first_name, last_name:form.last_name, email:form.email }),
        api.put("/api/users/clients/me",{
          phone:             form.phone||null,
          preferred_contact: form.preferred_contact||null,
          budget_min:        form.budget_min?Number(form.budget_min):null,
          budget_max:        form.budget_max?Number(form.budget_max):null,
          preferred_type:    form.preferred_type||null,
          preferred_city:    form.preferred_city||null,
        }),
      ]);
      onSuccess();
    } catch(err) { notify(err.response?.data?.message||"Error saving profile","error"); }
    finally { setSaving(false); }
  };

  const INP = { width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0", borderRadius:10, fontSize:13.5, color:"#1a1714", background:"#fff", fontFamily:"'DM Sans',sans-serif", outline:"none" };
  const ML  = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
  const R2  = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:560, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"cd-fade-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"20px 26px", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <p style={{ position:"relative", fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:0, color:"#f5f0e8" }}>Edit Profile</p>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:9, width:32, height:32, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 26px" }}>
          <p style={{ fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>Personal Info</p>
          <div style={R2}>
            <div><label style={ML}>First Name</label><input style={INP} value={form.first_name} onChange={e=>set("first_name",e.target.value)}/></div>
            <div><label style={ML}>Last Name</label><input style={INP} value={form.last_name} onChange={e=>set("last_name",e.target.value)}/></div>
          </div>
          <div style={{ marginBottom:14 }}><label style={ML}>Email</label><input style={INP} type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
          <p style={{ fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, marginTop:6, borderTop:"1px solid #e8e2d6", paddingTop:16 }}>Preferences</p>
          <div style={R2}>
            <div><label style={ML}>Phone</label><input style={INP} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+383..."/></div>
            <div><label style={ML}>Preferred Contact</label>
              <select style={{ ...INP, cursor:"pointer" }} value={form.preferred_contact} onChange={e=>set("preferred_contact",e.target.value)}>
                <option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>
          <div style={R2}>
            <div><label style={ML}>Budget Min (€)</label><input style={INP} type="number" value={form.budget_min} onChange={e=>set("budget_min",e.target.value)} placeholder="50000"/></div>
            <div><label style={ML}>Budget Max (€)</label><input style={INP} type="number" value={form.budget_max} onChange={e=>set("budget_max",e.target.value)} placeholder="200000"/></div>
          </div>
          <div style={R2}>
            <div><label style={ML}>Preferred Type</label><input style={INP} value={form.preferred_type} onChange={e=>set("preferred_type",e.target.value)} placeholder="APARTMENT"/></div>
            <div><label style={ML}>Preferred City</label><input style={INP} value={form.preferred_city} onChange={e=>set("preferred_city",e.target.value)} placeholder="Prishtinë"/></div>
          </div>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
            <button onClick={onClose} className="cd-btn" style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="cd-btn" style={{ padding:"10px 22px", borderRadius:10, background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {saving ? "Saving…" : "✓ Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}