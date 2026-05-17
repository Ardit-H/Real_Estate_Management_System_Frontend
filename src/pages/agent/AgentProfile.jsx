import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { GLOBAL_CSS, I } from "../../components/agent/profile/profileConstants.jsx";
import { Toast, Skeleton, Avatar, StarRating, StatChip } from "../../components/agent/profile/ProfileUI.jsx";
import { ProfileSidebar } from "../../components/agent/profile/ProfileSidebar.jsx";
import { ProfileTab, AccountTab, PasswordTab } from "../../components/agent/profile/ProfileTabs.jsx";
 
export default function AgentProfile() {
  const { user }       = useContext(AuthContext);
  const [profile,      setProfile]     = useState(null);
  const [userInfo,     setUserInfo]    = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);
  const [savingUser,   setSavingUser]  = useState(false);
  const [savingPw,     setSavingPw]    = useState(false);
  const [activeTab,    setActiveTab]   = useState("profile");
  const [toast,        setToast]       = useState(null);
 
  const [profileForm, setProfileForm] = useState({phone:"",license:"",bio:"",experience_years:"",specialization:"",photo_url:""});
  const [userForm,    setUserForm]    = useState({first_name:"",last_name:"",email:""});
  const [pwForm,      setPwForm]      = useState({current_password:"",new_password:"",confirm:""});
 
  const notify = (msg, type="success") => setToast({msg,type,key:Date.now()});
  const setP   = (k,v) => setProfileForm(p=>({...p,[k]:v}));
  const setU   = (k,v) => setUserForm(p=>({...p,[k]:v}));
  const setPw  = (k,v) => setPwForm(p=>({...p,[k]:v}));
 
  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      try {
        const [meRes,profileRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/users/agents/me").catch(()=>({data:null})),
        ]);
        setUserInfo(meRes.data);
        setUserForm({first_name:meRes.data.first_name||"",last_name:meRes.data.last_name||"",email:meRes.data.email||""});
        if(profileRes.data){
          setProfile(profileRes.data);
          setProfileForm({
            phone:            profileRes.data.phone            ||"",
            license:          profileRes.data.license          ||"",
            bio:              profileRes.data.bio              ||"",
            experience_years: profileRes.data.experience_years ||"",
            specialization:   profileRes.data.specialization   ||"",
            photo_url:        profileRes.data.photo_url        ||"",
          });
        }
      } catch { notify("Error loading profile","error"); }
      finally   { setLoading(false); }
    };
    load();
  },[]);
 
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/api/users/agents/me",{
        phone:profileForm.phone||null,
        license:profileForm.license||null,
        bio:profileForm.bio||null,
        experience_years:profileForm.experience_years?Number(profileForm.experience_years):null,
        specialization:profileForm.specialization||null,
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
 
  const fullName = userInfo?`${userInfo.first_name||""} ${userInfo.last_name||""}`.trim():user?.fullName||"Agent";
 
  const TABS = [
    {id:"profile", label:"Agent Profile", Icon:I.user},
    {id:"account", label:"Account",       Icon:I.mail},
    {id:"password",label:"Password",      Icon:I.lock},
  ];
 
  return (
    <MainLayout role="agent">
      <style>{GLOBAL_CSS}</style>
      <div className="ap-root">
 
        {/* ── Identity header ── */}
        <div style={{background:"#1a1a12",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{maxWidth:1020,margin:"0 auto",padding:"32px 36px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
            <Avatar photoUrl={loading?null:profile?.photo_url} name={loading?"":fullName} size={68}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:"10px",fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.2px",margin:"0 0 5px",fontFamily:"'DM Sans',sans-serif"}}>Agent Account</p>
              <h1 style={{fontSize:"26px",fontWeight:600,color:"#f4f1ea",margin:"0 0 2px",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-.2px",lineHeight:1.1}}>
                {loading?"":fullName||"—"}
              </h1>
              <p style={{fontSize:"13px",color:"rgba(255,255,255,.38)",margin:0,fontFamily:"'DM Sans',sans-serif"}}>
                {loading?"":userInfo?.email}
              </p>
            </div>
 
            {!loading&&profile&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)"}}>
                  <StarRating value={profile.rating||0}/>
                  <span style={{fontSize:"11.5px",color:"rgba(255,255,255,.35)",fontFamily:"'DM Sans',sans-serif"}}>
                    ({profile.total_reviews||0})
                  </span>
                </div>
                {profile.specialization&&<StatChip icon={I.tag(12)} value={profile.specialization}/>}
                {profile.experience_years!=null&&<StatChip icon={I.clock(12)} value={`${profile.experience_years} yr exp`}/>}
                {profile.phone&&<StatChip icon={I.phone(12)} value={profile.phone}/>}
                {profile.license&&<StatChip icon={I.award(12)} value={profile.license}/>}
              </div>
            )}
          </div>
 
          <div style={{maxWidth:1020,margin:"0 auto",padding:"0 36px",display:"flex"}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="ap-tab" onClick={()=>setActiveTab(tab.id)}
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
 
        {/* ── Content ── */}
        <div style={{maxWidth:1020,margin:"0 auto",padding:"32px 36px"}}>
          {loading ? <Skeleton /> : (
            <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:24,alignItems:"start",animation:"ap-up .22s ease"}}>
 
              <ProfileSidebar fullName={fullName} userInfo={userInfo} profile={profile} />
 
              {/* Form panel */}
              <div style={{background:"#fff",border:"1px solid #e4ddd2",minHeight:400}}>
                <div style={{padding:"22px 28px",borderBottom:"1px solid #efe8de",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <h2 style={{margin:"0 0 3px",fontSize:"20px",fontWeight:600,color:"#1a1a12",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-.2px"}}>
                      {TABS.find(t=>t.id===activeTab)?.label}
                    </h2>
                    <p style={{margin:0,fontSize:"12.5px",color:"#9a8c7a",fontFamily:"'DM Sans',sans-serif"}}>
                      {activeTab==="profile"  &&(profile?"Update your professional agent profile":"Create your professional agent profile")}
                      {activeTab==="account"  &&"Manage your personal information and login email"}
                      {activeTab==="password" &&"Set a strong password to keep your account secure"}
                    </p>
                  </div>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"#f4f1ea",display:"flex",alignItems:"center",justifyContent:"center",color:"#8a7a60",flexShrink:0}}>
                    {activeTab==="profile"  && I.user(15)}
                    {activeTab==="account"  && I.mail(15)}
                    {activeTab==="password" && I.lock(15)}
                  </div>
                </div>
 
                <div style={{padding:"28px"}}>
                  {activeTab==="profile" && (
                    <ProfileTab profileForm={profileForm} setP={setP} profile={profile} saving={saving} onSave={handleSaveProfile} />
                  )}
                  {activeTab==="account" && (
                    <AccountTab userForm={userForm} setU={setU} userInfo={userInfo} savingUser={savingUser} onSave={handleSaveUser} />
                  )}
                  {activeTab==="password" && (
                    <PasswordTab pwForm={pwForm} setPw={setPw} savingPw={savingPw} onSave={handleChangePw} />
                  )}
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
 