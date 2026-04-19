import { useState } from "react";
import { BASE_URL } from "../../constants/propertyConstants";

export default function PropImage({ src, title }) {
  const [err, setErr] = useState(false);
  const fullSrc = src && !err ? (src.startsWith("http") ? src : BASE_URL + src) : null;

  if (!fullSrc)
    return (
      <div style={{
        width:52, height:44, borderRadius:8,
        background:"var(--surface-2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, flexShrink:0,
      }}>🏠</div>
    );

  return (
    <img src={fullSrc} alt={title} onError={() => setErr(true)}
      style={{ width:52, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
  );
}
