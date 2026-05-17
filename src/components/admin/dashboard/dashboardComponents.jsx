import { C } from "./dashboardConstants";

// Skeleton Component
export function Skeleton({ rows=4, h=44 }) {
  return (
    <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="ad-skeleton" style={{height:h,opacity:1-i*0.15}}/>
      ))}
    </div>
  );
}

// Empty Row Component
export function EmptyRow({ icon, text }) {
  return (
    <div style={{padding:"36px 20px",textAlign:"center",color:C.textMut}}>
      <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
      <p style={{fontSize:13,margin:0}}>{text}</p>
    </div>
  );
}