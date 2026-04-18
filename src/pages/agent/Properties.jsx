import { useState, useEffect, useContext, useCallback, useRef } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";


const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", cls: "badge--green"  },
  SOLD:      { label: "Sold",      cls: "badge--red"    },
  RENTED:    { label: "Rented",    cls: "badge--blue"   },
  PENDING:   { label: "Pending",   cls: "badge--amber"  },
  INACTIVE:  { label: "Inactive",  cls: "badge--gray"   },
};

const TYPE_OPTIONS    = ["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"];
const LISTING_OPTIONS = ["SALE","RENT","BOTH"];
const FEATURE_OPTIONS = ["parking","pool","furnished","elevator","balcony","garden","gym","security","air_conditioning","storage","fireplace"];
const TYPE_ICONS      = { APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡", COMMERCIAL:"🏪", LAND:"🌿", OFFICE:"🏛️" };

const BASE_URL = "http://localhost:8080";


const fmtPrice = (p, c = "EUR") =>
  `${c} ${Number(p || 0).toLocaleString("en-US")}`;



function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div className="stat-card__icon" style={{ background: color + "18" }}>
          <span style={{ fontSize:18 }}>{icon}</span>
        </div>
      </div>
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function PropImage({ src, title }) {
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

function Toast({ msg, type }) {
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:500,
      background: type === "error" ? "#dc2626" : "#059669",
      color:"white", padding:"12px 20px", borderRadius:"var(--radius-md)",
      fontSize:13.5, fontWeight:500,
      boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
      animation:"dropdownIn 200ms ease",
    }}>
      {type === "error" ? "✕ " : "✓ "}{msg}
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:300, padding:24,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"white", borderRadius:"var(--radius-xl)",
        width:"100%", maxWidth: wide ? 800 : 580,
        boxShadow:"0 24px 60px rgba(15,23,42,0.18)",
        animation:"dropdownIn 200ms ease",
        maxHeight:"90vh", overflow:"hidden",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{
          padding:"20px 24px", borderBottom:"1px solid var(--border-light)",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
        }}>
          <span style={{ fontWeight:600, fontSize:15 }}>{title}</span>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:20, color:"var(--text-muted)", lineHeight:1,
          }}>✕</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1 }}>{children}</div>
      </div>
    </div>
  );
}


function PropertyForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title:        initial.title        || "",
    description:  initial.description  || "",
    type:         initial.type         || "APARTMENT",
    listingType:  initial.listing_type || "SALE",
    price:        initial.price        || "",
    currency:     initial.currency     || "EUR",
    pricePerSqm:  initial.price_per_sqm|| "",
    bedrooms:     initial.bedrooms     || "",
    bathrooms:    initial.bathrooms    || "",
    areaSqm:      initial.area_sqm     || "",
    floor:        initial.floor        || "",
    totalFloors:  initial.total_floors || "",
    yearBuilt:    initial.year_built   || "",
    isFeatured:   initial.is_featured  || false,
    features:     initial.features     || [],

    street:       initial.city    ? "" : "",
    city:         initial.city         || "",
    state:        initial.state        || "",
    country:      initial.country      || "",
    zipCode:      initial.zip_code     || "",
    latitude:     initial.latitude     || "",
    longitude:    initial.longitude    || "",
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggleFeature = (f) =>
    setForm(p => ({
      ...p,
      features: p.features.includes(f)
        ? p.features.filter(x => x !== f)
        : [...p.features, f],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = (v) => v !== "" && v != null ? Number(v) : undefined;
    const hasAddress = form.city || form.street || form.country;
    onSubmit({
      title:        form.title,
      description:  form.description  || undefined,
      type:         form.type,
      listingType:  form.listingType,
      price:        num(form.price),
      currency:     form.currency,
      price_per_sqm: num(form.pricePerSqm),
      bedrooms:     num(form.bedrooms),
      bathrooms:    num(form.bathrooms),
      area_sqm:     num(form.areaSqm),
      floor:        num(form.floor),
      total_floors: num(form.totalFloors),
      year_built:   num(form.yearBuilt),
      is_featured:  form.isFeatured,
      features:     form.features.length ? form.features : undefined,
      address:      hasAddress ? {
        street:    form.street    || undefined,
        city:      form.city      || undefined,
        state:     form.state     || undefined,
        country:   form.country   || undefined,
        zip_code:  form.zipCode   || undefined,
        latitude:  num(form.latitude),
        longitude: num(form.longitude),
      } : undefined,
    });
  };

  const inputStyle = { marginBottom:0 };

  return (
    <form onSubmit={handleSubmit}>

  
      <div style={{ marginBottom:20 }}>
        <div style={{
          fontSize:11, fontWeight:600, color:"var(--text-muted)",
          textTransform:"uppercase", letterSpacing:"0.08em",
          marginBottom:14, paddingBottom:8,
          borderBottom:"1px solid var(--border-light)",
        }}>Basic Info</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group" style={{ gridColumn:"1/-1", ...inputStyle }}>
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={set("title")}
              required placeholder="e.g. Modern 2BR Apartment in Center" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={set("type")}>
              {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Listing Type</label>
            <select className="form-select" value={form.listingType} onChange={set("listingType")}>
              {LISTING_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn:"1/-1", ...inputStyle }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={form.description}
              onChange={set("description")} placeholder="Describe the property…"
              style={{ resize:"vertical" }} />
          </div>
        </div>
      </div>


      <div style={{ marginBottom:20 }}>
        <div style={{
          fontSize:11, fontWeight:600, color:"var(--text-muted)",
          textTransform:"uppercase", letterSpacing:"0.08em",
          marginBottom:14, paddingBottom:8,
          borderBottom:"1px solid var(--border-light)",
        }}>Pricing</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Price *</label>
            <input className="form-input" type="number" min="0" value={form.price}
              onChange={setNum("price")} required placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Currency</label>
            <select className="form-select" value={form.currency} onChange={set("currency")}>
              <option>EUR</option><option>USD</option><option>GBP</option>
            </select>
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Price / m²</label>
            <input className="form-input" type="number" min="0" value={form.pricePerSqm}
              onChange={setNum("pricePerSqm")} placeholder="0" />
          </div>
        </div>
      </div>

 
      <div style={{ marginBottom:20 }}>
        <div style={{
          fontSize:11, fontWeight:600, color:"var(--text-muted)",
          textTransform:"uppercase", letterSpacing:"0.08em",
          marginBottom:14, paddingBottom:8,
          borderBottom:"1px solid var(--border-light)",
        }}>Property Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Bedrooms</label>
            <input className="form-input" type="number" min="0" value={form.bedrooms}
              onChange={setNum("bedrooms")} placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Bathrooms</label>
            <input className="form-input" type="number" min="0" value={form.bathrooms}
              onChange={setNum("bathrooms")} placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Area (m²)</label>
            <input className="form-input" type="number" min="0" value={form.areaSqm}
              onChange={setNum("areaSqm")} placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Floor</label>
            <input className="form-input" type="number" value={form.floor}
              onChange={setNum("floor")} placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Total Floors</label>
            <input className="form-input" type="number" min="0" value={form.totalFloors}
              onChange={setNum("totalFloors")} placeholder="0" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Year Built</label>
            <input className="form-input" type="number" min="1800" max="2030"
              value={form.yearBuilt} onChange={setNum("yearBuilt")} placeholder="2024" />
          </div>
        </div>

        {/* Featured toggle */}
        <div style={{ marginTop:14 }}>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
            <div style={{
              width:40, height:22, borderRadius:11,
              background: form.isFeatured ? "var(--brand-500)" : "var(--surface-3)",
              position:"relative", transition:"background 200ms", flexShrink:0,
            }} onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}>
              <div style={{
                position:"absolute", top:3, left: form.isFeatured ? 21 : 3,
                width:16, height:16, borderRadius:"50%", background:"white",
                transition:"left 200ms",
                boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
            <span className="form-label" style={{ marginBottom:0 }}>Featured Listing</span>
          </label>
        </div>
      </div>

 
      <div style={{ marginBottom:20 }}>
        <div style={{
          fontSize:11, fontWeight:600, color:"var(--text-muted)",
          textTransform:"uppercase", letterSpacing:"0.08em",
          marginBottom:14, paddingBottom:8,
          borderBottom:"1px solid var(--border-light)",
        }}>Address</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="form-group" style={{ gridColumn:"1/-1", ...inputStyle }}>
            <label className="form-label">Street</label>
            <input className="form-input" value={form.street}
              onChange={set("street")} placeholder="e.g. Rr. Nënë Tereza 12" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">City</label>
            <input className="form-input" value={form.city}
              onChange={set("city")} placeholder="Prishtina" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">State / Region</label>
            <input className="form-input" value={form.state}
              onChange={set("state")} placeholder="Kosovo" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Country</label>
            <input className="form-input" value={form.country}
              onChange={set("country")} placeholder="Kosovo" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Zip Code</label>
            <input className="form-input" value={form.zipCode}
              onChange={set("zipCode")} placeholder="10000" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Latitude</label>
            <input className="form-input" type="number" step="any"
              value={form.latitude} onChange={setNum("latitude")} placeholder="42.6629" />
          </div>
          <div className="form-group" style={inputStyle}>
            <label className="form-label">Longitude</label>
            <input className="form-input" type="number" step="any"
              value={form.longitude} onChange={setNum("longitude")} placeholder="21.1655" />
          </div>
        </div>
      </div>

  
      <div style={{ marginBottom:24 }}>
        <div style={{
          fontSize:11, fontWeight:600, color:"var(--text-muted)",
          textTransform:"uppercase", letterSpacing:"0.08em",
          marginBottom:14, paddingBottom:8,
          borderBottom:"1px solid var(--border-light)",
        }}>Features & Amenities</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {FEATURE_OPTIONS.map(f => (
            <button type="button" key={f}
              onClick={() => toggleFeature(f)}
              style={{
                padding:"5px 12px", borderRadius:20, fontSize:12.5,
                cursor:"pointer", transition:"all 150ms",
                border: form.features.includes(f)
                  ? "1px solid var(--brand-400)"
                  : "1px solid var(--border-medium)",
                background: form.features.includes(f)
                  ? "var(--brand-50)"
                  : "var(--surface-0)",
                color: form.features.includes(f)
                  ? "var(--brand-600)"
                  : "var(--text-secondary)",
                fontWeight: form.features.includes(f) ? 500 : 400,
              }}>
              {form.features.includes(f) ? "✓ " : ""}{f.replace(/_/g," ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Saving…" : (initial.title ? "Save Changes" : "Create Property")}
        </button>
      </div>
    </form>
  );
}


function ImageManager({ property, onClose }) {
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption]     = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [preview, setPreview]     = useState(null);
  const [toast, setToast]         = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  };

  const loadImages = useCallback(async () => {
    try {
      const r = await api.get(`/api/properties/${property.id}/images`);
      setImages(r.data);
    } catch { setImages([]); }
    finally { setLoading(false); }
  }, [property.id]);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPreview({ file: f, url: URL.createObjectURL(f) });
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", preview.file);
      if (caption) fd.append("caption", caption);
      fd.append("primary", String(isPrimary));

      await api.post(`/api/properties/${property.id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Image uploaded!");
      setPreview(null);
      setCaption("");
      setIsPrimary(false);
      if (fileRef.current) fileRef.current.value = "";
      loadImages();
    } catch (e) {
      showToast(e.response?.data?.message || "Upload failed", "error");
    } finally { setUploading(false); }
  };

  const handleSetPrimary = async (imgId) => {
    try {
      await api.patch(`/api/properties/${property.id}/images/${imgId}/primary`);
      showToast("Primary image set!");
      loadImages();
    } catch { showToast("Failed", "error"); }
  };

  const handleDelete = async (imgId) => {
    try {
      await api.delete(`/api/properties/${property.id}/images/${imgId}`);
      showToast("Image deleted.");
      loadImages();
    } catch { showToast("Failed", "error"); }
  };

  return (
    <Modal title={`Images — ${property.title}`} onClose={onClose} wide>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

  
      <div style={{
        border:"2px dashed var(--border-medium)", borderRadius:"var(--radius-lg)",
        padding:20, marginBottom:20, background:"var(--surface-1)",
      }}>
        <div style={{ marginBottom:14, fontWeight:500, fontSize:13 }}>Upload New Image</div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
  
          <div>
            <input type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange} style={{ display:"none" }} />
            <button className="btn btn--secondary btn--sm"
              onClick={() => fileRef.current?.click()}>
              📂 Choose Image
            </button>
          </div>

   
          <div style={{ flex:1, minWidth:160 }}>
            <input className="form-input" placeholder="Caption (optional)"
              value={caption} onChange={e => setCaption(e.target.value)} />
          </div>

       
          <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer",
            fontSize:13, color:"var(--text-secondary)", whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={isPrimary}
              onChange={e => setIsPrimary(e.target.checked)} />
            Set as primary
          </label>

    
          <button className="btn btn--primary btn--sm"
            onClick={handleUpload} disabled={!preview || uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>

   
        {preview && (
          <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:12 }}>
            <img src={preview.url} alt="preview"
              style={{ width:80, height:60, objectFit:"cover", borderRadius:8,
                border:"1px solid var(--border-light)" }} />
            <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
              {preview.file.name}
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
                {(preview.file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button className="btn btn--ghost btn--sm"
              onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value=""; }}>
              ✕ Remove
            </button>
          </div>
        )}
      </div>

   
      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>
          Loading images…
        </div>
      ) : images.length === 0 ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>
          No images yet. Upload the first one above.
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
          {images.map(img => {
            const src = img.image_url?.startsWith("http")
              ? img.image_url : BASE_URL + img.image_url;
            return (
              <div key={img.id} style={{
                borderRadius:"var(--radius-md)", overflow:"hidden",
                border: img.is_primary
                  ? "2px solid var(--brand-500)"
                  : "1px solid var(--border-light)",
                position:"relative",
              }}>
                <img src={src} alt={img.caption || "property"}
                  style={{ width:"100%", height:120, objectFit:"cover", display:"block" }} />

                {img.is_primary && (
                  <div style={{
                    position:"absolute", top:6, left:6,
                    background:"var(--brand-500)", color:"white",
                    fontSize:10, fontWeight:600, padding:"2px 8px",
                    borderRadius:20,
                  }}>PRIMARY</div>
                )}

                <div style={{ padding:"8px 10px", background:"white" }}>
                  {img.caption && (
                    <div style={{ fontSize:12, color:"var(--text-secondary)",
                      marginBottom:6, whiteSpace:"nowrap", overflow:"hidden",
                      textOverflow:"ellipsis" }}>
                      {img.caption}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:6 }}>
                    {!img.is_primary && (
                      <button className="btn btn--secondary btn--sm"
                        style={{ fontSize:11, padding:"3px 8px" }}
                        onClick={() => handleSetPrimary(img.id)}>
                        ★ Primary
                      </button>
                    )}
                    <button className="btn btn--danger btn--sm"
                      style={{ fontSize:11, padding:"3px 8px", marginLeft:"auto" }}
                      onClick={() => handleDelete(img.id)}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}


function PriceHistory({ propertyId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/properties/${propertyId}/price-history`)
      .then(r => setHistory(r.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <Modal title="Price History" onClose={onClose}>
      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>Loading…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>
          No price changes recorded yet.
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {history.map(h => {
            const diff = h.new_price - h.old_price;
            const pct  = h.old_price ? ((diff/h.old_price)*100).toFixed(1) : null;
            return (
              <div key={h.id} style={{
                display:"flex", gap:12, alignItems:"flex-start",
                padding:"12px 14px", borderRadius:"var(--radius-md)",
                background:"var(--surface-1)", border:"1px solid var(--border-light)",
              }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  background: diff >= 0 ? "#ecfdf5" : "#fef2f2",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, flexShrink:0,
                }}>{diff >= 0 ? "↑" : "↓"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>
                      {fmtPrice(h.old_price, h.currency)} → {fmtPrice(h.new_price, h.currency)}
                    </span>
                    {pct && (
                      <span style={{
                        fontSize:12, fontWeight:500, padding:"2px 8px", borderRadius:20,
                        background: diff >= 0 ? "#ecfdf5" : "#fef2f2",
                        color: diff >= 0 ? "#059669" : "#dc2626",
                      }}>{diff >= 0 ? "+" : ""}{pct}%</span>
                    )}
                  </div>
                  {h.reason && (
                    <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>
                      {h.reason}
                    </div>
                  )}
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>
                    {new Date(h.changed_at).toLocaleDateString("en-GB", {
                      day:"numeric", month:"short", year:"numeric"
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}


export default function AgentProperties() {
  const { user } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  };
  const closeModal = () => { setModal(null); setSelected(null); };


  const fetchProperties = useCallback(async (p = 0) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/properties/agent/${user.id}`, {
        params: { page: p, size: 10 },
      });
      setProperties(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch { setError("Could not load properties."); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchProperties(0); }, [fetchProperties]);


  const stats = {
    total:     properties.length,
    available: properties.filter(p => p.status === "AVAILABLE").length,
    rented:    properties.filter(p => p.status === "RENTED").length,
    sold:      properties.filter(p => p.status === "SOLD").length,
    views:     properties.reduce((s,p) => s + (p.view_count||0), 0),
  };


  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post("/api/properties", data);
      showToast("Property created!");
      closeModal();
      fetchProperties(0);
    } catch (e) { showToast(e.response?.data?.message || "Create failed","error"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await api.put(`/api/properties/${selected.id}`, data);
      showToast("Property updated!");
      closeModal();
      fetchProperties(page);
    } catch (e) { showToast(e.response?.data?.message || "Update failed","error"); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await api.patch(`/api/properties/${selected.id}/status`, { status: newStatus });
      showToast("Status updated!");
      closeModal();
      fetchProperties(page);
    } catch (e) { showToast(e.response?.data?.message || "Failed","error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/api/properties/${selected.id}`);
      showToast("Property deleted.");
      closeModal();
      fetchProperties(0);
    } catch (e) { showToast(e.response?.data?.message || "Delete failed","error"); }
    finally { setSaving(false); }
  };


  return (
    <MainLayout role="agent">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Properties</h1>
          <p className="page-subtitle">Manage and track your property listings</p>
        </div>
        <button className="btn btn--primary" onClick={() => setModal("create")}>
          <span style={{ fontSize:16 }}>+</span> Add Property
        </button>
      </div>

   
      <div className="stat-grid">
        <StatCard icon="🏠" label="Total Listings" value={stats.total}     color="#6366f1" />
        <StatCard icon="✅" label="Available"       value={stats.available} color="#059669" />
        <StatCard icon="🔑" label="Rented"          value={stats.rented}    color="#2563eb" />
        <StatCard icon="💰" label="Sold"            value={stats.sold}      color="#d97706" />
        <StatCard icon="👁" label="Total Views"     value={stats.views}     color="#7c3aed" />
      </div>

   
      <div className="card">
        <div className="card__header">
          <span className="card__title">Property Listings</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>
            {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
          </span>
        </div>

        {loading ? (
          <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--text-muted)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            Loading properties…
          </div>
        ) : error ? (
          <div style={{ padding:"48px 24px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ color:"var(--text-secondary)" }}>{error}</div>
            <button className="btn btn--secondary btn--sm"
              style={{ marginTop:16 }} onClick={() => fetchProperties(0)}>
              Retry
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🏡</div>
            <div style={{ fontWeight:600, marginBottom:6 }}>No properties yet</div>
            <div className="text-muted" style={{ marginBottom:20 }}>
              Start by adding your first listing
            </div>
            <button className="btn btn--primary" onClick={() => setModal("create")}>
              + Add Property
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.INACTIVE;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <PropImage src={p.primaryImage || p.primary_image || p.imageUrl} title={p.title} />
                            <div style={{ minWidth:0 }}>
                              <div style={{
                                fontWeight:500, fontSize:13.5,
                                whiteSpace:"nowrap", overflow:"hidden",
                                textOverflow:"ellipsis", maxWidth:200,
                              }}>{p.title}</div>
                              {p.city && (
                                <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                                  📍 {p.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize:13 }}>
                            {TYPE_ICONS[p.type]||"🏠"} {p.type}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight:600, fontFamily:"var(--font-mono)", fontSize:13 }}>
                            {fmtPrice(p.price, p.currency)}
                          </span>
                        </td>
                        <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                        <td>
                          <span style={{ fontSize:13, color:"var(--text-secondary)" }}>
                            👁 {p.view_count||0}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn--secondary btn--sm" title="Manage Images"
                              onClick={() => { setSelected(p); setModal("images"); }}>🖼️</button>
                            <button className="btn btn--secondary btn--sm" title="Edit"
                              onClick={() => { setSelected(p); setModal("edit"); }}>✏️</button>
                            <button className="btn btn--secondary btn--sm" title="Change Status"
                              onClick={() => { setSelected(p); setModal("status"); }}>🔄</button>
                            <button className="btn btn--secondary btn--sm" title="Price History"
                              onClick={() => { setSelected(p); setModal("history"); }}>📈</button>
                            <button className="btn btn--danger btn--sm" title="Delete"
                              onClick={() => { setSelected(p); setModal("delete"); }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

         
            {totalPages > 1 && (
              <div style={{
                padding:"14px 22px", borderTop:"1px solid var(--border-light)",
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <span style={{ fontSize:12.5, color:"var(--text-muted)" }}>
                  Page {page+1} of {totalPages}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn btn--secondary btn--sm"
                    disabled={page===0} onClick={() => fetchProperties(page-1)}>← Prev</button>
                  <button className="btn btn--secondary btn--sm"
                    disabled={page>=totalPages-1} onClick={() => fetchProperties(page+1)}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

  
      {modal === "create" && (
        <Modal title="Add New Property" onClose={closeModal} wide>
          <PropertyForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title={`Edit: ${selected.title}`} onClose={closeModal} wide>
          <PropertyForm initial={selected} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}

      {modal === "images" && selected && (
        <ImageManager property={selected} onClose={closeModal} />
      )}

      {modal === "status" && selected && (
        <Modal title="Change Status" onClose={closeModal}>
          <p style={{ marginBottom:20, color:"var(--text-secondary)", fontSize:13.5 }}>
            Current status of <strong>{selected.title}</strong>:&nbsp;
            <span className={`badge ${STATUS_CONFIG[selected.status]?.cls}`}>
              {STATUS_CONFIG[selected.status]?.label}
            </span>
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} className="btn btn--secondary"
                style={{
                  justifyContent:"flex-start",
                  background:   selected.status===key ? "var(--brand-50)"   : undefined,
                  borderColor:  selected.status===key ? "var(--brand-400)"  : undefined,
                  color:        selected.status===key ? "var(--brand-600)"  : undefined,
                }}
                onClick={() => handleStatusChange(key)}
                disabled={saving || selected.status===key}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                {selected.status===key && (
                  <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)" }}>
                    current
                  </span>
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "history" && selected && (
        <PriceHistory propertyId={selected.id} onClose={closeModal} />
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Property" onClose={closeModal}>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
            <p style={{ fontWeight:600, marginBottom:8 }}>Are you sure?</p>
            <p style={{ color:"var(--text-secondary)", fontSize:13.5, marginBottom:24 }}>
              "<strong>{selected.title}</strong>" will be soft-deleted and hidden from listings.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
}
