import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  .cp-root { font-family: 'DM Sans', system-ui, sans-serif; background: #f2efe8; min-height: 100vh; color: #1a1a12; }
  .cp-root * { box-sizing: border-box; }

  .cp-inp { width:100%; padding:11px 14px; border:1px solid #ddd6c8; border-radius:0; font-size:14px; color:#1a1a12; background:#fff; outline:none; font-family:'DM Sans',sans-serif; transition:border-color .15s,box-shadow .15s; }
  .cp-inp:focus { border-color:#6b6340; box-shadow:0 0 0 3px rgba(107,99,64,.1); }
  .cp-inp::placeholder { color:#b8b0a0; }
  .cp-sel { cursor:pointer; }

  .cp-tab { transition:all .15s ease; cursor:pointer; }
  .cp-tab:hover { background:#f7f4ee !important; }

  .cp-save { transition:all .18s ease; }
  .cp-save:hover:not(:disabled) { background:#2a2a18 !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(28,28,16,.25) !important; }
  .cp-save:active:not(:disabled) { transform:translateY(0); }

  @keyframes cp-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-spin { to{transform:rotate(360deg)} }
  @keyframes cp-pulse{ 0%,100%{opacity:.4} 50%{opacity:.85} }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  user: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  lock: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  pin:  (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  home: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  euro: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7 7 0 1 0 0 12"/></svg>,
  phone:(s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  check:(s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  warn: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  eye:  (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:(s=14)=> <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  arrowR:(s=14)=> <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background:"#1a1a12", color: type==="error" ? "#f0a0a0" : "#a0c8a0",
      padding:"14px 20px", borderRadius:0, fontSize:13, fontWeight:400,
      fontFamily:"'DM Sans',sans-serif",
      boxShadow:"0 12px 40px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,160,160,.18)":"rgba(160,200,160,.18)"}`,
      maxWidth:340, display:"flex", alignItems:"center", gap:10,
      animation:"cp-up .25s ease",
    }}>
      <span style={{opacity:.7}}>{type==="error" ? I.warn(13) : I.check(13)}</span>
      {msg}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  const bar = (h, w="100%", mb=0) => (
    <div style={{height:h, width:w, background:"#e8e2d6", borderRadius:0, marginBottom:mb, animation:"cp-pulse 1.6s ease infinite"}}/>
  );
  return (
    <div style={{display:"grid", gridTemplateColumns:"260px 1fr", gap:24}}>
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        {bar(72)} {bar(52)} {bar(52)} {bar(52)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,padding:"32px",background:"#fff",border:"1px solid #e4ddd2"}}>
        {bar(28,"60%",20)} {bar(16,"100%",8)} {bar(16,"80%",24)} {bar(44,"100%",8)} {bar(44,"100%",8)} {bar(44,"100%")}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ photoUrl, name, size=68 }) {
  const initials = name
    ? name.trim().split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("")
    : "?";
  if (photoUrl) return (
    <img src={photoUrl} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.2)",flexShrink:0}}/>
  );
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"2px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.85)",fontSize:size*.3,fontWeight:600,fontFamily:"'Cormorant Garamond',Georgia,serif",flexShrink:0,letterSpacing:".5px"}}>
      {initials}
    </div>
  );
}

// ─── Password input with toggle ───────────────────────────────────────────────
function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <input className="cp-inp" type={show?"text":"password"} value={value} onChange={onChange}
        placeholder={placeholder} style={{paddingRight:42}}/>
      <button onClick={()=>setShow(p=>!p)}
        style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9a8c6e",display:"flex",alignItems:"center",padding:0,transition:"color .15s"}}
        tabIndex={-1}>
        {show ? I.eyeOff(14) : I.eye(14)}
      </button>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children, hint, required }) {
  return (
    <div style={{marginBottom:20}}>
      <label style={{display:"block",fontSize:"10.5px",fontWeight:600,color:"#8a8070",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
        {label}{required && <span style={{color:"#b84040",marginLeft:3}}>*</span>}
      </label>
      {children}
      {hint && <p style={{fontSize:12,color:"#aaa090",marginTop:6,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>{hint}</p>}
    </div>
  );
}

// ─── Euro prefix input ────────────────────────────────────────────────────────
function EuroInput({ value, onChange, placeholder }) {
  return (
    <div style={{position:"relative"}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#9a8c6e",fontSize:13,fontFamily:"'DM Sans',sans-serif",pointerEvents:"none",userSelect:"none"}}>€</span>
      <input className="cp-inp" type="number" min="0" value={value} onChange={onChange} placeholder={placeholder} style={{paddingLeft:28}}/>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Section({ title }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,margin:"28px 0 20px"}}>
      <span style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.2px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{title}</span>
      <div style={{flex:1,height:1,background:"#ebe4d8"}}/>
    </div>
  );
}

// ─── Stat chip (top bar) ──────────────────────────────────────────────────────
function StatChip({ icon, value }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:0,color:"rgba(255,255,255,.65)",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",letterSpacing:".1px"}}>
      <span style={{opacity:.55}}>{icon}</span>
      {value}
    </div>
  );
}

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveBtn({ onClick, disabled, label, loading: l }) {
  return (
    <button className="cp-save" onClick={onClick} disabled={disabled||l}
      style={{padding:"11px 28px",borderRadius:0,border:"none",background:disabled||l?"#b0a890":"#1a1a12",color:"#f4f1ea",fontSize:"13px",fontWeight:500,cursor:disabled||l?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:".3px",display:"flex",alignItems:"center",gap:9,opacity:disabled||l?.6:1,boxShadow:disabled||l?"none":"0 4px 16px rgba(26,26,18,.22)"}}>
      {l ? (
        <><div style={{width:13,height:13,border:"1.5px solid rgba(244,241,234,.3)",borderTop:"1.5px solid #f4f1ea",borderRadius:"50%",animation:"cp-spin .7s linear infinite"}}/> Saving…</>
      ) : (
        <>{label} <span style={{opacity:.5}}>{I.arrowR(13)}</span></>
      )}
    </button>
  );
}

// ─── Info / Alert banner ──────────────────────────────────────────────────────
function Banner({ type="info", children }) {
  const cfg = {
    info:    {bg:"#f7f4ee",border:"#ddd6c8",color:"#6b6040",icon:I.info()},
    warn:    {bg:"#fdf6e8",border:"#e8c880",color:"#7a5a10",icon:I.warn()},
    success: {bg:"#f0f8f2",border:"#b8d8c0",color:"#2a5840",icon:I.check()},
    error:   {bg:"#fef2f2",border:"#e8b8b8",color:"#8b2020",icon:I.warn()},
  }[type];
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:0,marginBottom:20,fontSize:"13px",color:cfg.color,fontFamily:"'DM Sans',sans-serif",lineHeight:1.55}}>
      <span style={{marginTop:1,opacity:.8}}>{cfg.icon}</span>
      {children}
    </div>
  );
}

// ─── Meta row (account info) ──────────────────────────────────────────────────
function MetaGrid({ userInfo }) {
  const items = [
    {label:"Role",       value:"Client",                                              color:"#2a5040"},
    {label:"Status",     value:userInfo?.is_active?"Active":"Inactive",               color:userInfo?.is_active?"#2a5040":"#8b3010"},
    {label:"Tenant ID",  value:userInfo?.tenant_id?`#${userInfo.tenant_id}`:"—",      color:"#6b6040"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
      {items.map(item=>(
        <div key={item.label} style={{padding:"14px 16px",background:"#f7f4ee",border:"1px solid #e4ddd2"}}>
          <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 5px",fontFamily:"'DM Sans',sans-serif"}}>{item.label}</p>
          <p style={{fontSize:14,fontWeight:500,color:item.color,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientProfile() {
  const { user }       = useContext(AuthContext);
  const [activeTab,    setActiveTab]   = useState("profile");
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);
  const [savingUser,   setSavingUser]  = useState(false);
  const [savingPw,     setSavingPw]    = useState(false);
  const [toast,        setToast]       = useState(null);
  const [userInfo,     setUserInfo]    = useState(null);
  const [profile,      setProfile]     = useState(null);

  const [userForm,    setUserForm]    = useState({first_name:"",last_name:"",email:""});
  const [profileForm, setProfileForm] = useState({phone:"",preferred_contact:"EMAIL",budget_min:"",budget_max:"",preferred_type:"",preferred_city:"",photo_url:""});
  const [pwForm,      setPwForm]      = useState({current_password:"",new_password:"",confirm:""});

  const notify = (msg, type="success") => setToast({msg,type,key:Date.now()});
  const setU   = (k,v) => setUserForm(p=>({...p,[k]:v}));
  const setP   = (k,v) => setProfileForm(p=>({...p,[k]:v}));
  const setPw  = (k,v) => setPwForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      try {
        const [meRes,profileRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/users/clients/me").catch(()=>({data:null})),
        ]);
        setUserInfo(meRes.data);
        setUserForm({first_name:meRes.data.first_name||"",last_name:meRes.data.last_name||"",email:meRes.data.email||""});
        if(profileRes.data){
          setProfile(profileRes.data);
          setProfileForm({
            phone:             profileRes.data.phone             ||"",
            preferred_contact: profileRes.data.preferred_contact ||"EMAIL",
            budget_min:        profileRes.data.budget_min        ??"",
            budget_max:        profileRes.data.budget_max        ??"",
            preferred_type:    profileRes.data.preferred_type    ||"",
            preferred_city:    profileRes.data.preferred_city    ||"",
            photo_url:         profileRes.data.photo_url         ||"",
          });
        }
      } catch { notify("Error loading profile","error"); }
      finally   { setLoading(false); }
    };
    load();
  },[]);

  const handleSaveProfile = async () => {
    if(profileForm.budget_min&&profileForm.budget_max&&Number(profileForm.budget_min)>Number(profileForm.budget_max)){
      notify("Minimum budget cannot exceed maximum","error"); return;
    }
    setSaving(true);
    try {
      const res = await api.put("/api/users/clients/me",{
        phone:profileForm.phone||null, preferred_contact:profileForm.preferred_contact||null,
        budget_min:profileForm.budget_min!==""?Number(profileForm.budget_min):null,
        budget_max:profileForm.budget_max!==""?Number(profileForm.budget_max):null,
        preferred_type:profileForm.preferred_type||null,
        preferred_city:profileForm.preferred_city||null,
        photo_url:profileForm.photo_url||null,
      });
      setProfile(res.data); notify("Profile saved");
    } catch(err){ notify(err.response?.data?.message||"Error","error"); }
    finally { setSaving(false); }
  };

  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      const res = await api.put("/api/users/me",{first_name:userForm.first_name||null,last_name:userForm.last_name||null,email:userForm.email||null});
      setUserInfo(res.data); notify("Account updated");
    } catch(err){ notify(err.response?.data?.message||"Error","error"); }
    finally { setSavingUser(false); }
  };

  const handleChangePw = async () => {
    if(pwForm.new_password!==pwForm.confirm){ notify("Passwords do not match","error"); return; }
    if(pwForm.new_password.length<8){ notify("Password must be at least 8 characters","error"); return; }
    setSavingPw(true);
    try {
      await api.patch("/api/users/me/password",{current_password:pwForm.current_password,new_password:pwForm.new_password});
      setPwForm({current_password:"",new_password:"",confirm:""}); notify("Password changed");
    } catch(err){ notify(err.response?.data?.message||"Error","error"); }
    finally { setSavingPw(false); }
  };

  const fullName = userInfo?`${userInfo.first_name||""} ${userInfo.last_name||""}`.trim():user?.fullName||"Client";

  const TABS = [
    {id:"profile", label:"My Profile", Icon:I.user},
    {id:"account", label:"Account",    Icon:I.mail},
    {id:"password",label:"Password",   Icon:I.lock},
  ];

  const pwMatch   = pwForm.new_password && pwForm.confirm && pwForm.new_password===pwForm.confirm && pwForm.new_password.length>=8;
  const pwMismatch= pwForm.confirm && pwForm.new_password!==pwForm.confirm;
  const pwShort   = pwForm.new_password && pwForm.new_password.length<8;

  return (
    <MainLayout role="client">
      <style>{GLOBAL_CSS}</style>
      <div className="cp-root">

        {/* ════════════════════════════════════════════════════
            IDENTITY HEADER
        ════════════════════════════════════════════════════ */}
        <div style={{background:"#1a1a12",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 36px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>

            <Avatar photoUrl={loading?null:profile?.photo_url} name={loading?"":fullName} size={68}/>

            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:"10px",fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.2px",margin:"0 0 5px",fontFamily:"'DM Sans',sans-serif"}}>Client Account</p>
              <h1 style={{fontSize:"26px",fontWeight:600,color:"#f4f1ea",margin:"0 0 2px",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-.2px",lineHeight:1.1}}>
                {loading?"":fullName||"—"}
              </h1>
              <p style={{fontSize:"13px",color:"rgba(255,255,255,.38)",margin:0,fontFamily:"'DM Sans',sans-serif"}}>
                {loading?"":userInfo?.email}
              </p>
            </div>

            {/* Quick info chips */}
            {!loading&&profile&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {profile.preferred_city&&<StatChip icon={I.pin(12)} value={profile.preferred_city}/>}
                {profile.preferred_type&&<StatChip icon={I.home(12)} value={profile.preferred_type}/>}
                {profile.phone&&         <StatChip icon={I.phone(12)} value={profile.phone}/>}
                {(profile.budget_min||profile.budget_max)&&(
                  <StatChip icon={I.euro(12)} value={`€${profile.budget_min?Number(profile.budget_min).toLocaleString("de-DE"):"—"} – €${profile.budget_max?Number(profile.budget_max).toLocaleString("de-DE"):"—"}`}/>
                )}
              </div>
            )}
          </div>

          {/* Tab bar — inside header */}
          <div style={{maxWidth:1000,margin:"0 auto",padding:"0 36px",display:"flex",gap:0}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="cp-tab" onClick={()=>setActiveTab(tab.id)}
                style={{
                  padding:"13px 22px",border:"none",background:"transparent",
                  color:activeTab===tab.id?"#f4f1ea":"rgba(255,255,255,.38)",
                  fontSize:"13px",fontWeight:activeTab===tab.id?500:400,
                  fontFamily:"'DM Sans',sans-serif",cursor:"pointer",
                  borderBottom:`2px solid ${activeTab===tab.id?"#c8b870":"transparent"}`,
                  display:"flex",alignItems:"center",gap:8,
                  transition:"all .15s",letterSpacing:".1px",
                }}>
                <span style={{opacity:activeTab===tab.id?1:.5}}>{tab.Icon(14)}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            CONTENT
        ════════════════════════════════════════════════════ */}
        <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 36px"}}>
          {loading ? <Skeleton /> : (
            <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:24,alignItems:"start",animation:"cp-up .22s ease"}}>

              {/* ── Sidebar info ── */}
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                {/* Summary card */}
                <div style={{background:"#fff",border:"1px solid #e4ddd2",padding:"22px 20px"}}>
                  <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.1px",margin:"0 0 16px",fontFamily:"'DM Sans',sans-serif"}}>Overview</p>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    {[
                      {icon:I.user(13), label:"Name",   val:fullName||"—"},
                      {icon:I.mail(13), label:"Email",  val:userInfo?.email||"—"},
                      {icon:I.phone(13),label:"Phone",  val:profile?.phone||"—"},
                      {icon:I.pin(13),  label:"City",   val:profile?.preferred_city||"—"},
                      {icon:I.home(13), label:"Type",   val:profile?.preferred_type||"—"},
                    ].map(row=>(
                      <div key={row.label} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{color:"#a09080",marginTop:2,flexShrink:0}}>{row.icon}</span>
                        <div style={{minWidth:0}}>
                          <p style={{fontSize:"10px",fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 1px",fontFamily:"'DM Sans',sans-serif"}}>{row.label}</p>
                          <p style={{fontSize:"13px",color:row.val==="—"?"#c0b8a8":"#1a1a12",margin:0,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.val}</p>
                        </div>
                      </div>
                    ))}
                    {(profile?.budget_min||profile?.budget_max)&&(
                      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{color:"#a09080",marginTop:2,flexShrink:0}}>{I.euro(13)}</span>
                        <div>
                          <p style={{fontSize:"10px",fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 1px",fontFamily:"'DM Sans',sans-serif"}}>Budget</p>
                          <p style={{fontSize:"13px",color:"#1a1a12",margin:0,fontFamily:"'DM Sans',sans-serif"}}>
                            €{profile.budget_min?Number(profile.budget_min).toLocaleString("de-DE"):"—"}
                            <span style={{color:"#c0b0a0",margin:"0 4px"}}>–</span>
                            €{profile.budget_max?Number(profile.budget_max).toLocaleString("de-DE"):"—"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account status card */}
                <div style={{background:"#fff",border:"1px solid #e4ddd2",padding:"18px 20px"}}>
                  <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.1px",margin:"0 0 14px",fontFamily:"'DM Sans',sans-serif"}}>Account Status</p>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:"12.5px",color:"#8a8070",fontFamily:"'DM Sans',sans-serif"}}>Role</span>
                      <span style={{fontSize:"12.5px",color:"#2a5040",fontWeight:500,fontFamily:"'DM Sans',sans-serif"}}>Client</span>
                    </div>
                    <div style={{height:1,background:"#f0e8de"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:"12.5px",color:"#8a8070",fontFamily:"'DM Sans',sans-serif"}}>Status</span>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:userInfo?.is_active?"#2a8040":"#c04040"}}/>
                        <span style={{fontSize:"12.5px",color:userInfo?.is_active?"#2a5040":"#8b3010",fontWeight:500,fontFamily:"'DM Sans',sans-serif"}}>{userInfo?.is_active?"Active":"Inactive"}</span>
                      </div>
                    </div>
                    {userInfo?.tenant_id&&<>
                      <div style={{height:1,background:"#f0e8de"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:"12.5px",color:"#8a8070",fontFamily:"'DM Sans',sans-serif"}}>Tenant</span>
                        <span style={{fontSize:"12px",color:"#6b6040",fontFamily:"'DM Sans',sans-serif"}}>#{userInfo.tenant_id}</span>
                      </div>
                    </>}
                  </div>
                </div>
              </div>

              {/* ── Form panel ── */}
              <div style={{background:"#fff",border:"1px solid #e4ddd2",minHeight:400}}>
                {/* Panel header */}
                <div style={{padding:"22px 28px",borderBottom:"1px solid #efe8de",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <h2 style={{margin:"0 0 3px",fontSize:"20px",fontWeight:600,color:"#1a1a12",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-.2px"}}>
                      {TABS.find(t=>t.id===activeTab)?.label}
                    </h2>
                    <p style={{margin:0,fontSize:"12.5px",color:"#9a8c7a",fontFamily:"'DM Sans',sans-serif"}}>
                      {activeTab==="profile" &&(profile?"Update your preferences and contact details":"Complete your profile to personalise your experience")}
                      {activeTab==="account" &&"Manage your personal information and login email"}
                      {activeTab==="password"&&"Set a strong password to keep your account secure"}
                    </p>
                  </div>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"#f4f1ea",display:"flex",alignItems:"center",justifyContent:"center",color:"#8a7a60",flexShrink:0}}>
                    {activeTab==="profile"  && I.user(15)}
                    {activeTab==="account"  && I.mail(15)}
                    {activeTab==="password" && I.lock(15)}
                  </div>
                </div>

                {/* ── Form body ── */}
                <div style={{padding:"28px"}}>

                  {/* ─ PROFILE TAB ─ */}
                  {activeTab==="profile"&&<>
                    {!profile&&(
                      <Banner type="info">
                        Fill in your preferences so we can match you with the best properties.
                      </Banner>
                    )}

                    <Section title="Contact Details"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <Field label="Phone number">
                        <input className="cp-inp" value={profileForm.phone} onChange={e=>setP("phone",e.target.value)} placeholder="+383 44 123 456"/>
                      </Field>
                      <Field label="Preferred contact">
                        <select className="cp-inp cp-sel" value={profileForm.preferred_contact} onChange={e=>setP("preferred_contact",e.target.value)}>
                          <option value="EMAIL">Email</option>
                          <option value="PHONE">Phone</option>
                          <option value="WHATSAPP">WhatsApp</option>
                        </select>
                      </Field>
                    </div>

                    <Section title="Property Preferences"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <Field label="Property type" hint="APARTMENT · HOUSE · VILLA · COMMERCIAL">
                        <input className="cp-inp" value={profileForm.preferred_type} onChange={e=>setP("preferred_type",e.target.value)} placeholder="e.g. APARTMENT"/>
                      </Field>
                      <Field label="Preferred city">
                        <input className="cp-inp" value={profileForm.preferred_city} onChange={e=>setP("preferred_city",e.target.value)} placeholder="e.g. Tirana"/>
                      </Field>
                    </div>

                    <Section title="Budget Range (EUR)"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <Field label="Minimum">
                        <EuroInput value={profileForm.budget_min} onChange={e=>setP("budget_min",e.target.value)} placeholder="50,000"/>
                      </Field>
                      <Field label="Maximum">
                        <EuroInput value={profileForm.budget_max} onChange={e=>setP("budget_max",e.target.value)} placeholder="500,000"/>
                      </Field>
                    </div>
                    {profileForm.budget_min&&profileForm.budget_max&&Number(profileForm.budget_min)>Number(profileForm.budget_max)&&(
                      <Banner type="warn">Minimum budget cannot exceed maximum budget.</Banner>
                    )}

                    <Section title="Profile Photo"/>
                    <Field label="Photo URL">
                      <input className="cp-inp" value={profileForm.photo_url} onChange={e=>setP("photo_url",e.target.value)} placeholder="https://…"/>
                    </Field>
                    {profileForm.photo_url&&(
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#f7f4ee",border:"1px solid #e4ddd2",marginBottom:20,marginTop:-14}}>
                        <img src={profileForm.photo_url} alt="preview" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"1px solid #ddd6c8"}} onError={e=>{e.target.style.display="none";}}/>
                        <span style={{fontSize:"12px",color:"#9a8c7a",fontFamily:"'DM Sans',sans-serif"}}>Photo preview</span>
                      </div>
                    )}

                    <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22,marginTop:8}}>
                      <SaveBtn onClick={handleSaveProfile} loading={saving} label={profile?"Save Changes":"Create Profile"}/>
                    </div>
                  </>}

                  {/* ─ ACCOUNT TAB ─ */}
                  {activeTab==="account"&&<>
                    <Section title="Personal Information"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <Field label="First name" required>
                        <input className="cp-inp" value={userForm.first_name} onChange={e=>setU("first_name",e.target.value)} placeholder="First name"/>
                      </Field>
                      <Field label="Last name" required>
                        <input className="cp-inp" value={userForm.last_name} onChange={e=>setU("last_name",e.target.value)} placeholder="Last name"/>
                      </Field>
                    </div>

                    <Section title="Login Details"/>
                    <Field label="Email address" required>
                      <input className="cp-inp" type="email" value={userForm.email} onChange={e=>setU("email",e.target.value)} placeholder="your@email.com"/>
                    </Field>

                    <Section title="Account Information"/>
                    <MetaGrid userInfo={userInfo}/>

                    <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22}}>
                      <SaveBtn onClick={handleSaveUser} loading={savingUser} label="Save Changes"/>
                    </div>
                  </>}

                  {/* ─ PASSWORD TAB ─ */}
                  {activeTab==="password"&&<>
                    <Banner type="info">
                      Use at least 8 characters. Mix letters, numbers, and symbols for a stronger password.
                    </Banner>

                    <Section title="Current Password"/>
                    <Field label="Current password" required>
                      <PwInput value={pwForm.current_password} onChange={e=>setPw("current_password",e.target.value)} placeholder="Enter your current password"/>
                    </Field>

                    <Section title="New Password"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <Field label="New password" required>
                        <PwInput value={pwForm.new_password} onChange={e=>setPw("new_password",e.target.value)} placeholder="Min. 8 characters"/>
                      </Field>
                      <Field label="Confirm new password" required>
                        <PwInput value={pwForm.confirm} onChange={e=>setPw("confirm",e.target.value)} placeholder="Repeat new password"/>
                      </Field>
                    </div>

                    {/* Live feedback */}
                    <div style={{marginTop:-8,marginBottom:20,display:"flex",flexDirection:"column",gap:5}}>
                      {pwShort   &&<p style={{fontSize:"12px",color:"#9a7010",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.warn(12)} Password must be at least 8 characters</p>}
                      {pwMismatch&&<p style={{fontSize:"12px",color:"#b04040",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.warn(12)} Passwords do not match</p>}
                      {pwMatch   &&<p style={{fontSize:"12px",color:"#2a6040",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.check(12)} Passwords match</p>}
                    </div>

                    {/* Strength bar */}
                    {pwForm.new_password&&(()=>{
                      const len = pwForm.new_password.length;
                      const hasNum = /\d/.test(pwForm.new_password);
                      const hasSym = /[^a-zA-Z0-9]/.test(pwForm.new_password);
                      const score  = (len>=8?1:0)+(len>=12?1:0)+hasNum+hasSym;
                      const labels = ["","Weak","Fair","Good","Strong"];
                      const colors = ["","#c04040","#d08020","#8a9040","#2a6040"];
                      return (
                        <div style={{marginBottom:20}}>
                          <div style={{height:3,background:"#ebe4d8",borderRadius:0,overflow:"hidden",marginBottom:6}}>
                            <div style={{height:"100%",width:`${score*25}%`,background:colors[score],transition:"width .3s ease"}}/>
                          </div>
                          {score>0&&<p style={{fontSize:"11px",color:colors[score],fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{labels[score]}</p>}
                        </div>
                      );
                    })()}

                    <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22}}>
                      <SaveBtn onClick={handleChangePw} disabled={!pwForm.current_password||!pwForm.new_password||pwMismatch||pwShort} loading={savingPw} label="Change Password"/>
                    </div>
                  </>}

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}