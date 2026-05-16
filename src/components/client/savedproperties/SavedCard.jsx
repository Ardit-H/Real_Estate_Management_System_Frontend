import { buildImg, getBadge, typeLbl, fmtPrice, PLACEHOLDER } from "./savedPropertiesConstants";
import { BedIcon, BathIcon, AreaIcon, PinIcon, CalendarIcon, HeartOffIcon, TypeIcon } from "./savedPropertiesIcons";

export default function SavedCard({ item, viewMode, onUnsave, idx }) {
  const badge   = getBadge(item.listingType);
  const img     = buildImg(item.primaryImage) || PLACEHOLDER;
  const isGrid  = viewMode === "grid";
  const savedFmt = item.savedAt
    ? new Date(item.savedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})
    : null;

  return (
    <div className="sp-card"
      style={{
        background:"#fff",
        borderRadius:14,
        overflow:"hidden",
        boxShadow:"0 2px 16px rgba(20,16,10,0.08)",
        border:"1.5px solid #ece6da",
        display:isGrid?"block":"flex",
        minHeight:isGrid?"auto":"150px",
        width:"100%",
        fontFamily:"'DM Sans',sans-serif",
        cursor:"pointer",
        animation:`sp-card-in 0.38s ease ${Math.min(idx*0.05,0.4)}s both`,
      }}>

      {/* ── Image ── */}
      <div style={{
        position:"relative",
        width:isGrid?"100%":"210px",
        minWidth:isGrid?"auto":"210px",
        height:isGrid?"185px":"100%",
        minHeight:isGrid?"185px":"150px",
        background:"#ede9df",
        flexShrink:0,
        overflow:"hidden",
      }}>
        <img src={img} alt={item.title} className="sp-img"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(8,6,4,0.55) 0%, rgba(8,6,4,0.1) 50%, transparent 100%)"}}/>

        {/* Listing type badge */}
        <span style={{
          position:"absolute",top:10,left:10,
          background:badge.bg,
          backdropFilter:"blur(10px)",
          color:"#f5f0e8",
          fontSize:9.5,fontWeight:600,
          padding:"4px 11px",borderRadius:999,
          letterSpacing:"0.6px",textTransform:"uppercase",
          display:"flex",alignItems:"center",gap:5,
          border:`1px solid ${badge.dot}38`,
        }}>
          <span style={{width:4,height:4,borderRadius:"50%",background:badge.dot,display:"inline-block",flexShrink:0,boxShadow:`0 0 5px ${badge.dot}`}}/>
          {badge.label}
        </span>

        {/* Unsave (remove) button */}
        <button className="sp-unsave" onClick={()=>onUnsave(item.propertyId)} title="Remove from saved"
          style={{
            position:"absolute",top:8,right:8,
            background:"rgba(192,57,43,0.78)",
            backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:"50%",width:30,height:30,
            cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",
          }}>
          <HeartOffIcon/>
        </button>

        {/* Property type bottom-left */}
        <span style={{
          position:"absolute",bottom:9,left:10,
          color:"rgba(245,240,232,0.72)",
          fontSize:11,
          fontFamily:"'DM Sans',sans-serif",
          display:"flex",alignItems:"center",gap:5,
        }}>
          <TypeIcon type={item.type} size={11}/>
          {typeLbl(item.type)}
        </span>

        {/* Saved date chip bottom-right */}
        {savedFmt && (
          <span style={{
            position:"absolute",bottom:9,right:10,
            background:"rgba(8,6,4,0.5)",
            backdropFilter:"blur(6px)",
            color:"rgba(245,240,232,0.55)",
            fontSize:10,padding:"3px 8px",borderRadius:999,
            display:"flex",alignItems:"center",gap:4,
            border:"1px solid rgba(245,240,232,0.1)",
          }}>
            <CalendarIcon/> {savedFmt}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{padding:isGrid?"13px 15px 15px":"14px 20px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          {/* Location */}
          {(item.city||item.country) && (
            <div style={{display:"flex",alignItems:"center",gap:4,color:"#b0a890",fontSize:11,marginBottom:5}}>
              <PinIcon/>
              {[item.city,item.country].filter(Boolean).join(", ")}
            </div>
          )}

          {/* Title */}
          <h3 style={{
            margin:"0 0 8px",
            fontSize:isGrid?"16.5px":"17.5px",
            fontWeight:700,
            color:"#1a1714",
            lineHeight:1.22,
            overflow:"hidden",
            textOverflow:"ellipsis",
            display:"-webkit-box",
            WebkitLineClamp:2,
            WebkitBoxOrient:"vertical",
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            letterSpacing:"-0.1px",
          }}>
            {item.title}
          </h3>

          {/* Price */}
          <div style={{
            fontSize:isGrid?"19px":"21px",
            fontWeight:700,
            color:"#1a1714",
            marginBottom:11,
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            letterSpacing:"-0.4px",
          }}>
            {fmtPrice(item.price, item.currency)}
          </div>
        </div>

        <div>
          {/* Stats row */}
          <div style={{
            display:"flex",gap:14,
            color:"#9a8c6e",fontSize:11.5,
            flexWrap:"wrap",
            paddingTop:10,
            borderTop:"1.5px solid #f0ece3",
            marginBottom:item.note?8:0,
          }}>
            {item.bedrooms!=null && (
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <BedIcon/> {item.bedrooms}
              </span>
            )}
            {item.bathrooms!=null && (
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <BathIcon/> {item.bathrooms}
              </span>
            )}
            {item.areaSqm!=null && (
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <AreaIcon/> {item.areaSqm} m²
              </span>
            )}
          </div>

          {/* Note if present */}
          {item.note && (
            <div style={{
              fontSize:12,color:"#8a7d5e",marginTop:6,
              fontStyle:"italic",lineHeight:1.5,
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              paddingLeft:8,borderLeft:"2px solid #e0d8c8",
            }}>
              "{item.note}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}