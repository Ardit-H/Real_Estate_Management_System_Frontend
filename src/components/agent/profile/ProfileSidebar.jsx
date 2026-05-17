import { I } from "./profileConstants.jsx";
import { StarRating, Banner } from "./ProfileUI.jsx";
 
export function ProfileSidebar({ fullName, userInfo, profile }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
 
      {/* Overview card */}
      <div style={{background:"#fff",border:"1px solid #e4ddd2",padding:"22px 20px"}}>
        <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.1px",margin:"0 0 16px",fontFamily:"'DM Sans',sans-serif"}}>Overview</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {icon:I.user(13),  label:"Name",           val:fullName||"—"},
            {icon:I.mail(13),  label:"Email",          val:userInfo?.email||"—"},
            {icon:I.phone(13), label:"Phone",          val:profile?.phone||"—"},
            {icon:I.tag(13),   label:"Specialization", val:profile?.specialization||"—"},
            {icon:I.clock(13), label:"Experience",     val:profile?.experience_years!=null?`${profile.experience_years} years`:"—"},
            {icon:I.award(13), label:"License",        val:profile?.license||"—"},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{color:"#a09080",marginTop:2,flexShrink:0}}>{row.icon}</span>
              <div style={{minWidth:0}}>
                <p style={{fontSize:"10px",fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 1px",fontFamily:"'DM Sans',sans-serif"}}>{row.label}</p>
                <p style={{fontSize:"13px",color:row.val==="—"?"#c0b8a8":"#1a1a12",margin:0,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Rating card */}
      {profile && (
        <div style={{background:"#fff",border:"1px solid #e4ddd2",padding:"18px 20px"}}>
          <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.1px",margin:"0 0 14px",fontFamily:"'DM Sans',sans-serif"}}>Rating</p>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:"32px",fontWeight:600,color:"#1a1a12",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-.5px"}}>{Number(profile.rating||0).toFixed(1)}</span>
            <div>
              <div style={{display:"flex",gap:3,marginBottom:3}}>
                {[1,2,3,4,5].map(s=>(
                  <span key={s} style={{color:s<=Math.round(profile.rating||0)?"#c8a840":"#ddd6c8"}}>{I.star(13)}</span>
                ))}
              </div>
              <p style={{fontSize:"12px",color:"#9a8c7a",margin:0,fontFamily:"'DM Sans',sans-serif"}}>{profile.total_reviews||0} reviews</p>
            </div>
          </div>
          {profile.bio&&(
            <p style={{fontSize:"13px",color:"#6b6040",fontStyle:"italic",margin:0,fontFamily:"'Cormorant Garamond',Georgia,serif",lineHeight:1.6,borderTop:"1px solid #ebe4d8",paddingTop:12}}>
              "{profile.bio.length>120?profile.bio.slice(0,120)+"…":profile.bio}"
            </p>
          )}
        </div>
      )}
 
      {/* Account status */}
      <div style={{background:"#fff",border:"1px solid #e4ddd2",padding:"18px 20px"}}>
        <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.1px",margin:"0 0 14px",fontFamily:"'DM Sans',sans-serif"}}>Account</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"12.5px",color:"#8a8070",fontFamily:"'DM Sans',sans-serif"}}>Role</span>
            <span style={{fontSize:"12.5px",color:"#2a4060",fontWeight:500,fontFamily:"'DM Sans',sans-serif"}}>Agent</span>
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
 
      {!profile&&(
        <Banner type="warn">
          Agent profile not created. Fill in the form to create your professional profile.
        </Banner>
      )}
    </div>
  );
}
 