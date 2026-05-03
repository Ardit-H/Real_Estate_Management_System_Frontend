import { useState } from "react";
import { TYPE_OPTIONS, LISTING_OPTIONS, FEATURE_OPTIONS } from "../../constants/propertyConstants";
import api from "../../api/axios";

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize:11, fontWeight:600, color:"var(--text-muted)",
    textTransform:"uppercase", letterSpacing:"0.08em",
    marginBottom:14, paddingBottom:8,
    borderBottom:"1px solid var(--border-light)",
  }}>{children}</div>
);

function AiSpinner() {
  return (
    <div style={{
      width:14, height:14, border:"2px solid #e8e2d6",
      borderTop:"2px solid #c9b87a", borderRadius:"50%",
      animation:"ai-spin .7s linear infinite", display:"inline-block",
    }}/>
  );
}

export default function PropertyForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title:       initial.title        || "",
    description: initial.description  || "",
    type:        initial.type         || "APARTMENT",
    listingType: initial.listing_type || "SALE",
    price:       initial.price        || "",
    currency:    initial.currency     || "EUR",
    pricePerSqm: initial.price_per_sqm|| "",
    bedrooms:    initial.bedrooms     || "",
    bathrooms:   initial.bathrooms    || "",
    areaSqm:     initial.area_sqm     || "",
    floor:       initial.floor        || "",
    totalFloors: initial.total_floors || "",
    yearBuilt:   initial.year_built   || "",
    isFeatured:  initial.is_featured  || false,
    features:    initial.features     || [],
    street:      "",
    city:        initial.city         || "",
    state:       initial.state        || "",
    country:     initial.country      || "",
    zipCode:     initial.zip_code     || "",
    latitude:    initial.latitude     || "",
    longitude:   initial.longitude    || "",
  });

  // AI state
  const [aiDescLoading,  setAiDescLoading]  = useState(false);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiPriceResult,  setAiPriceResult]  = useState(null);
  const [aiError,        setAiError]        = useState(null);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggleFeature = (f) => setForm(p => ({
    ...p,
    features: p.features.includes(f)
      ? p.features.filter(x => x !== f)
      : [...p.features, f],
  }));

  // ── AI: Generate Description ───────────────────────────────
  // Thirret PASI agjenti ka plotësuar: type, city, bedrooms, area
  const generateDescription = async () => {
    setAiDescLoading(true); setAiError(null);
    try {
      const r = await api.post("/api/ai/property/description", {
        type:      form.type,
        bedrooms:  form.bedrooms  || 0,
        bathrooms: form.bathrooms || 0,
        areaSqm:   form.areaSqm   || 0,
        floor:     form.floor     || 0,
        yearBuilt: form.yearBuilt || 0,
        city:      form.city,
        features:  form.features.join(", ") || "none",
        price:     form.price     || 0,
      });
      setForm(p => ({
        ...p,
        title:       r.data.title       || p.title,
        description: r.data.description || p.description,
      }));
    } catch (e) {
      setAiError("AI description failed: " + (e.response?.data?.message || "try again"));
    } finally { setAiDescLoading(false); }
  };

  // ── AI: Estimate Price ─────────────────────────────────────
  // Thirret PASI agjenti ka plotësuar: type, area, city
  const estimatePrice = async () => {
    setAiPriceLoading(true); setAiError(null); setAiPriceResult(null);
    try {
      const r = await api.post("/api/ai/property/estimate", {
        type:        form.type,
        areaSqm:     form.areaSqm    || "0",
        bedrooms:    form.bedrooms   || 0,
        city:        form.city,
        floor:       form.floor      || "0",
        totalFloors: form.totalFloors|| "0",
        yearBuilt:   form.yearBuilt  || 0,
        listingType: form.listingType,
      });
      setAiPriceResult(r.data);
    } catch (e) {
      setAiError("AI price failed: " + (e.response?.data?.message || "try again"));
    } finally { setAiPriceLoading(false); }
  };

  // Butoni AI aktivizohet vetëm kur fushat bazë janë plotësuar
  const canGenerateDesc  = form.type && form.city && (form.bedrooms || form.areaSqm);
  const canEstimatePrice = form.type && form.city && form.areaSqm;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = (v) => v !== "" && v != null ? Number(v) : undefined;
    const hasAddress = form.city || form.street || form.country;
    onSubmit({
      title:         form.title,
      description:   form.description  || undefined,
      type:          form.type,
      listingType:   form.listingType,
      price:         num(form.price),
      currency:      form.currency,
      price_per_sqm: num(form.pricePerSqm),
      bedrooms:      num(form.bedrooms),
      bathrooms:     num(form.bathrooms),
      area_sqm:      num(form.areaSqm),
      floor:         num(form.floor),
      total_floors:  num(form.totalFloors),
      year_built:    num(form.yearBuilt),
      is_featured:   form.isFeatured,
      features:      form.features.length ? form.features : undefined,
      address: hasAddress ? {
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

  const g = { marginBottom:0 };

  return (
    <>
      <style>{`@keyframes ai-spin{to{transform:rotate(360deg)}}`}</style>
      <form onSubmit={handleSubmit}>

        {/* ── Basic Info ──────────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Basic Info</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="form-group" style={g}>
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={set("type")}>
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={g}>
              <label className="form-label">Listing Type</label>
              <select className="form-select" value={form.listingType} onChange={set("listingType")}>
                {LISTING_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Property Details ────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Property Details</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <div className="form-group" style={g}><label className="form-label">Bedrooms</label><input className="form-input" type="number" min="0" value={form.bedrooms} onChange={setNum("bedrooms")} placeholder="0" /></div>
            <div className="form-group" style={g}><label className="form-label">Bathrooms</label><input className="form-input" type="number" min="0" value={form.bathrooms} onChange={setNum("bathrooms")} placeholder="0" /></div>
            <div className="form-group" style={g}><label className="form-label">Area (m²)</label><input className="form-input" type="number" min="0" value={form.areaSqm} onChange={setNum("areaSqm")} placeholder="0" /></div>
            <div className="form-group" style={g}><label className="form-label">Floor</label><input className="form-input" type="number" value={form.floor} onChange={setNum("floor")} placeholder="0" /></div>
            <div className="form-group" style={g}><label className="form-label">Total Floors</label><input className="form-input" type="number" min="0" value={form.totalFloors} onChange={setNum("totalFloors")} placeholder="0" /></div>
            <div className="form-group" style={g}><label className="form-label">Year Built</label><input className="form-input" type="number" min="1800" max="2030" value={form.yearBuilt} onChange={setNum("yearBuilt")} placeholder="2024" /></div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <div style={{ width:40, height:22, borderRadius:11, background: form.isFeatured ? "var(--brand-500)" : "var(--surface-3)", position:"relative", transition:"background 200ms", flexShrink:0 }}
                onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}>
                <div style={{ position:"absolute", top:3, left: form.isFeatured ? 21 : 3, width:16, height:16, borderRadius:"50%", background:"white", transition:"left 200ms", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <span className="form-label" style={{ marginBottom:0 }}>Featured Listing</span>
            </label>
          </div>
        </div>

        {/* ── Address ─────────────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Address</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="form-group" style={{ gridColumn:"1/-1", ...g }}><label className="form-label">Street</label><input className="form-input" value={form.street} onChange={set("street")} placeholder="e.g. Rr. Nënë Tereza 12" /></div>
            <div className="form-group" style={g}><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={set("city")} placeholder="Prishtina" /></div>
            <div className="form-group" style={g}><label className="form-label">State / Region</label><input className="form-input" value={form.state} onChange={set("state")} placeholder="Kosovo" /></div>
            <div className="form-group" style={g}><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={set("country")} placeholder="Kosovo" /></div>
            <div className="form-group" style={g}><label className="form-label">Zip Code</label><input className="form-input" value={form.zipCode} onChange={set("zipCode")} placeholder="10000" /></div>
            <div className="form-group" style={g}><label className="form-label">Latitude</label><input className="form-input" type="number" step="any" value={form.latitude} onChange={setNum("latitude")} placeholder="42.6629" /></div>
            <div className="form-group" style={g}><label className="form-label">Longitude</label><input className="form-input" type="number" step="any" value={form.longitude} onChange={setNum("longitude")} placeholder="21.1655" /></div>
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Features & Amenities</SectionTitle>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {FEATURE_OPTIONS.map(f => (
              <button type="button" key={f} onClick={() => toggleFeature(f)} style={{
                padding:"5px 12px", borderRadius:20, fontSize:12.5, cursor:"pointer", transition:"all 150ms",
                border:      form.features.includes(f) ? "1px solid var(--brand-400)" : "1px solid var(--border-medium)",
                background:  form.features.includes(f) ? "var(--brand-50)"            : "var(--surface-0)",
                color:       form.features.includes(f) ? "var(--brand-600)"           : "var(--text-secondary)",
                fontWeight:  form.features.includes(f) ? 500 : 400,
              }}>
                {form.features.includes(f) ? "✓ " : ""}{f.replace(/_/g," ")}
              </button>
            ))}
          </div>
        </div>

        {/* ── AI Section — shfaqet pasi fushat bazë janë plotësuar ── */}
        <div style={{ marginBottom:20, padding:"14px 16px", background:"#fdf9f4", border:"1.5px solid #e8dfc8", borderRadius:12 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#8a7d5e", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>
            ✨ AI Assistance
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom: (aiPriceResult || aiError) ? 12 : 0 }}>

            {/* Generate Title & Description */}
            <div style={{ flex:1, minWidth:200 }}>
              <button type="button" onClick={generateDescription}
                disabled={aiDescLoading || !canGenerateDesc}
                title={!canGenerateDesc ? "Fill in Type, City and Bedrooms/Area first" : ""}
                style={{
                  width:"100%", padding:"9px 14px", borderRadius:10,
                  border:"1.5px solid #c9b87a",
                  background: canGenerateDesc ? "linear-gradient(135deg,#c9b87a,#b0983e)" : "#f0ece3",
                  color: canGenerateDesc ? "#1a1714" : "#b0a890",
                  fontSize:13, fontWeight:700, cursor: canGenerateDesc ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                  transition:"all .15s",
                }}>
                {aiDescLoading ? <AiSpinner/> : "✨"}
                Generate Title & Description
              </button>
              {!canGenerateDesc && (
                <p style={{ margin:"4px 0 0", fontSize:11, color:"#b0a890", textAlign:"center" }}>
                  Fill Type, City + Bedrooms or Area first
                </p>
              )}
            </div>

            {/* Estimate Price */}
            <div style={{ flex:1, minWidth:200 }}>
              <button type="button" onClick={estimatePrice}
                disabled={aiPriceLoading || !canEstimatePrice}
                title={!canEstimatePrice ? "Fill in Type, City and Area first" : ""}
                style={{
                  width:"100%", padding:"9px 14px", borderRadius:10,
                  border:"1.5px solid #c9b87a",
                  background: canEstimatePrice ? "linear-gradient(135deg,#c9b87a,#b0983e)" : "#f0ece3",
                  color: canEstimatePrice ? "#1a1714" : "#b0a890",
                  fontSize:13, fontWeight:700, cursor: canEstimatePrice ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                  transition:"all .15s",
                }}>
                {aiPriceLoading ? <AiSpinner/> : "💰"}
                Estimate Price
              </button>
              {!canEstimatePrice && (
                <p style={{ margin:"4px 0 0", fontSize:11, color:"#b0a890", textAlign:"center" }}>
                  Fill Type, City + Area first
                </p>
              )}
            </div>
          </div>

          {/* Price result */}
          {aiPriceResult && (
            <div style={{ padding:"10px 14px", background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:10, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:13, color:"#166534", flex:1 }}>
                💡 Suggested: <strong>€{Number(aiPriceResult.estimated_price).toLocaleString("de-DE")}</strong>
                &nbsp;·&nbsp; €{Number(aiPriceResult.price_per_sqm).toLocaleString("de-DE")}/m²
                &nbsp;·&nbsp; <strong>{aiPriceResult.confidence}</strong> confidence
              </span>
              <button type="button"
                onClick={() => setForm(p => ({
                  ...p,
                  price:       String(aiPriceResult.estimated_price),
                  pricePerSqm: String(aiPriceResult.price_per_sqm),
                }))}
                style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#059669", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Use this price
              </button>
              <p style={{ margin:"4px 0 0", fontSize:11.5, color:"#166534", width:"100%" }}>{aiPriceResult.reasoning}</p>
            </div>
          )}

          {aiError && (
            <p style={{ margin:"6px 0 0", fontSize:12, color:"#dc2626" }}>{aiError}</p>
          )}
        </div>

        {/* ── Title & Description — plotësohen nga AI ose manualisht ── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Title & Description</SectionTitle>
          <div style={{ display:"grid", gap:14 }}>
            <div className="form-group" style={g}>
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={set("title")}
                required
                placeholder="e.g. Modern 2BR Apartment in Center — or generate with AI above"
              />
            </div>
            <div className="form-group" style={g}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe the property… or generate with AI above"
                style={{ resize:"vertical" }}
              />
            </div>
          </div>
        </div>

        {/* ── Pricing ─────────────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <SectionTitle>Pricing</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <div className="form-group" style={g}>
              <label className="form-label">Price *</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={setNum("price")} required placeholder="0" />
            </div>
            <div className="form-group" style={g}>
              <label className="form-label">Currency</label>
              <select className="form-select" value={form.currency} onChange={set("currency")}>
                <option>EUR</option><option>USD</option><option>GBP</option>
              </select>
            </div>
            <div className="form-group" style={g}>
              <label className="form-label">Price / m²</label>
              <input className="form-input" type="number" min="0" value={form.pricePerSqm} onChange={setNum("pricePerSqm")} placeholder="0" />
            </div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Saving…" : (initial.title ? "Save Changes" : "Create Property")}
          </button>
        </div>
      </form>
    </>
  );
}