import { I } from "./profileConstants.jsx";
import { Field, Section, MetaGrid, PwInput, Banner, SaveBtn } from "./ProfileUI.jsx";
 
export function ProfileTab({ profileForm, setP, profile, saving, onSave }) {
  return (
    <>
      <Section title="Professional Details"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Phone number">
          <input className="ap-inp" value={profileForm.phone} onChange={e=>setP("phone",e.target.value)} placeholder="+383 44 123 456"/>
        </Field>
        <Field label="License number">
          <input className="ap-inp" value={profileForm.license} onChange={e=>setP("license",e.target.value)} placeholder="REA-2024-001"/>
        </Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Specialization">
          <input className="ap-inp" value={profileForm.specialization} onChange={e=>setP("specialization",e.target.value)} placeholder="Residential, Commercial…"/>
        </Field>
        <Field label="Years of experience">
          <input className="ap-inp" type="number" min="0" max="60" value={profileForm.experience_years} onChange={e=>setP("experience_years",e.target.value)} placeholder="0"/>
        </Field>
      </div>
 
      <Section title="Biography"/>
      <Field label="Professional bio">
        <textarea className="ap-inp" rows={5} value={profileForm.bio} onChange={e=>setP("bio",e.target.value)}
          placeholder="Write a brief professional introduction — your expertise, achievements, and what makes you stand out…"
          style={{resize:"vertical",lineHeight:1.7}}/>
      </Field>
 
      <Section title="Profile Photo"/>
      <Field label="Photo URL">
        <input className="ap-inp" value={profileForm.photo_url} onChange={e=>setP("photo_url",e.target.value)} placeholder="https://…"/>
      </Field>
      {profileForm.photo_url&&(
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#f7f4ee",border:"1px solid #e4ddd2",marginBottom:20,marginTop:-14}}>
          <img src={profileForm.photo_url} alt="preview" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"1px solid #ddd6c8"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontSize:"12px",color:"#9a8c7a",fontFamily:"'DM Sans',sans-serif"}}>Photo preview</span>
        </div>
      )}
 
      <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22,marginTop:8}}>
        <SaveBtn onClick={onSave} loading={saving} label={profile?"Save Changes":"Create Profile"}/>
      </div>
    </>
  );
}
 
export function AccountTab({ userForm, setU, userInfo, savingUser, onSave }) {
  return (
    <>
      <Section title="Personal Information"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="First name" required>
          <input className="ap-inp" value={userForm.first_name} onChange={e=>setU("first_name",e.target.value)} placeholder="First name"/>
        </Field>
        <Field label="Last name" required>
          <input className="ap-inp" value={userForm.last_name} onChange={e=>setU("last_name",e.target.value)} placeholder="Last name"/>
        </Field>
      </div>
 
      <Section title="Login Details"/>
      <Field label="Email address" required>
        <input className="ap-inp" type="email" value={userForm.email} onChange={e=>setU("email",e.target.value)} placeholder="your@email.com"/>
      </Field>
 
      <Section title="Account Information"/>
      <MetaGrid userInfo={userInfo}/>
 
      <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22}}>
        <SaveBtn onClick={onSave} loading={savingUser} label="Save Changes"/>
      </div>
    </>
  );
}
 
export function PasswordTab({ pwForm, setPw, savingPw, onSave }) {
  const pwMatch    = pwForm.new_password && pwForm.confirm && pwForm.new_password===pwForm.confirm && pwForm.new_password.length>=8;
  const pwMismatch = pwForm.confirm && pwForm.new_password!==pwForm.confirm;
  const pwShort    = pwForm.new_password && pwForm.new_password.length<8;
 
  return (
    <>
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
 
      <div style={{marginTop:-8,marginBottom:20,display:"flex",flexDirection:"column",gap:5}}>
        {pwShort   &&<p style={{fontSize:"12px",color:"#9a7010",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.warn(12)} Password must be at least 8 characters</p>}
        {pwMismatch&&<p style={{fontSize:"12px",color:"#b04040",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.warn(12)} Passwords do not match</p>}
        {pwMatch   &&<p style={{fontSize:"12px",color:"#2a6040",display:"flex",alignItems:"center",gap:5,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{I.check(12)} Passwords match</p>}
      </div>
 
      {pwForm.new_password&&(()=>{
        const len=pwForm.new_password.length;
        const hasNum=/\d/.test(pwForm.new_password);
        const hasSym=/[^a-zA-Z0-9]/.test(pwForm.new_password);
        const score=(len>=8?1:0)+(len>=12?1:0)+hasNum+hasSym;
        const labels=["","Weak","Fair","Good","Strong"];
        const colors=["","#c04040","#d08020","#8a9040","#2a6040"];
        return (
          <div style={{marginBottom:20}}>
            <div style={{height:3,background:"#ebe4d8",overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",width:`${score*25}%`,background:colors[score],transition:"width .3s ease"}}/>
            </div>
            {score>0&&<p style={{fontSize:"11px",color:colors[score],fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{labels[score]}</p>}
          </div>
        );
      })()}
 
      <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #efe8de",paddingTop:22}}>
        <SaveBtn onClick={onSave} disabled={!pwForm.current_password||!pwForm.new_password||pwMismatch||pwShort} loading={savingPw} label="Change Password"/>
      </div>
    </>
  );
}
 