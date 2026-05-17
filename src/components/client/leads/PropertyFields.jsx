import { Field } from "./LeadsUI";
import { HomeIcon } from "./LeadsIcons";
import { TYPE_FIELDS, PROPERTY_TYPES, CURRENCIES, PRICE_PERIODS, INP_S, SEL_S } from "./leadsConstants";
 
export default function PropertyFields({ form, setForm }) {
  const set = (k, v) => setForm(p => ({
    ...p,
    property_data: { ...p.property_data, [k]: v },
  }));
 
  const pd     = form.property_data || {};
  const isRent = form.type === "RENT";
  const fields = TYPE_FIELDS[pd.type || "APARTMENT"] || TYPE_FIELDS.APARTMENT;
 
  const accent = isRent ? "#7eb8a4" : "#c9b87a";
  const bg     = isRent ? "rgba(126,184,164,0.06)" : "rgba(201,184,122,0.06)";
  const border = isRent ? "rgba(126,184,164,0.18)" : "rgba(201,184,122,0.18)";
 
  const handlePrice = val => {
    set("price", val);
    if (val && pd.area_sqm && Number(pd.area_sqm) > 0)
      set("price_per_sqm", (Number(val) / Number(pd.area_sqm)).toFixed(2));
  };
 
  const handleAreaSqm = val => {
    set("area_sqm", val);
    if (val && pd.price && Number(val) > 0)
      set("price_per_sqm", (Number(pd.price) / Number(val)).toFixed(2));
    else if (val && pd.price_per_sqm && Number(val) > 0)
      set("price", (Number(pd.price_per_sqm) * Number(val)).toFixed(2));
  };
 
  const handlePricePerSqm = val => {
    set("price_per_sqm", val);
    if (val && pd.area_sqm && Number(pd.area_sqm) > 0)
      set("price", (Number(val) * Number(pd.area_sqm)).toFixed(2));
  };
 
  const handleTypeChange = val => {
    const nf = TYPE_FIELDS[val] || TYPE_FIELDS.APARTMENT;
    set("type", val);
    if (!nf.floor)        set("floor", "");
    if (!nf.total_floors) set("total_floors", "");
    if (!nf.bedrooms)     set("bedrooms", "");
    if (!nf.bathrooms)    set("bathrooms", "");
    if (!nf.year_built)   set("year_built", "");
  };
 
  const roomCols  = [true, fields.bedrooms, fields.bathrooms].filter(Boolean).length;
  const floorCols = [fields.floor, fields.total_floors, fields.year_built].filter(Boolean).length;
  const priceCols = isRent ? 4 : 3;
 
  return (
    <div style={{
      marginTop: 8, padding: "16px 14px", background: bg,
      borderRadius: 12, border: `1.5px solid ${border}`, marginBottom: 14,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: accent,
        textTransform: "uppercase", letterSpacing: "1px",
        marginBottom: 14, display: "flex", alignItems: "center", gap: 6,
      }}>
        <HomeIcon /> Property details
        <span style={{ fontSize: 10, fontWeight: 400, color: "#b0a890", textTransform: "none", letterSpacing: 0 }}>
          (agent will register in the system)
        </span>
      </p>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Property title" required>
          <input className="cl-in" style={INP_S}
            value={pd.title || ""}
            onChange={e => set("title", e.target.value)}
            placeholder="e.g. 2+1 Apartment Tirana" />
        </Field>
        <Field label="Property type" required>
          <select className="cl-in" style={SEL_S}
            value={pd.type || "APARTMENT"}
            onChange={e => handleTypeChange(e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
 
      {/* Price block */}
      <div style={{
        background: "#fff", border: "1px solid #e8e2d6",
        borderRadius: 10, padding: "12px 14px", marginBottom: 12,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "#9a8c6e",
          textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 10px",
        }}>
          💡 Fill any two price fields — the third calculates automatically
        </p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${priceCols}, 1fr)`, gap: 12 }}>
          <Field label={isRent ? "Rent price" : "Asking price"} required>
            <input className="cl-in" style={INP_S} type="number" min="0"
              value={pd.price || ""}
              onChange={e => handlePrice(e.target.value)}
              placeholder={isRent ? "500" : "120000"} />
          </Field>
          <Field label="Price per m²">
            <input className="cl-in" style={INP_S} type="number" min="0"
              value={pd.price_per_sqm || ""}
              onChange={e => handlePricePerSqm(e.target.value)}
              placeholder="1200" />
          </Field>
          <Field label="Currency">
            <select className="cl-in" style={SEL_S}
              value={pd.currency || "EUR"}
              onChange={e => set("currency", e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          {isRent && (
            <Field label="Period">
              <select className="cl-in" style={SEL_S}
                value={pd.price_period || "MONTHLY"}
                onChange={e => set("price_period", e.target.value)}>
                {PRICE_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
        </div>
        {pd.price && pd.area_sqm && pd.price_per_sqm && (
          <div style={{
            marginTop: 8, padding: "6px 10px",
            background: "#f0fdf4", borderRadius: 7, border: "1px solid #a7f3d0",
            fontSize: 12, color: "#047857", display: "flex", gap: 16, flexWrap: "wrap",
          }}>
            <span>Total: <strong>€{Number(pd.price).toLocaleString("de-DE")}</strong></span>
            <span>Per m²: <strong>€{Number(pd.price_per_sqm).toLocaleString("de-DE")}</strong></span>
            <span>Area: <strong>{pd.area_sqm} m²</strong></span>
          </div>
        )}
      </div>
 
      {/* Area + Bedrooms + Bathrooms */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${roomCols}, 1fr)`, gap: 12 }}>
        <Field label="Area (m²)">
          <input className="cl-in" style={INP_S} type="number" min="0"
            value={pd.area_sqm || ""}
            onChange={e => handleAreaSqm(e.target.value)}
            placeholder="85" />
        </Field>
        {fields.bedrooms && (
          <Field label="Bedrooms">
            <input className="cl-in" style={INP_S} type="number" min="0"
              value={pd.bedrooms || ""}
              onChange={e => set("bedrooms", e.target.value)}
              placeholder="2" />
          </Field>
        )}
        {fields.bathrooms && (
          <Field label="Bathrooms">
            <input className="cl-in" style={INP_S} type="number" min="0"
              value={pd.bathrooms || ""}
              onChange={e => set("bathrooms", e.target.value)}
              placeholder="1" />
          </Field>
        )}
      </div>
 
      {/* Floor + Total floors + Year built */}
      {floorCols > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${floorCols}, 1fr)`, gap: 12 }}>
          {fields.floor && (
            <Field label="Floor">
              <input className="cl-in" style={INP_S} type="number"
                value={pd.floor || ""}
                onChange={e => set("floor", e.target.value)}
                placeholder="3" />
            </Field>
          )}
          {fields.total_floors && (
            <Field label="Total floors">
              <input className="cl-in" style={INP_S} type="number" min="1"
                value={pd.total_floors || ""}
                onChange={e => set("total_floors", e.target.value)}
                placeholder="8" />
            </Field>
          )}
          {fields.year_built && (
            <Field label="Year built">
              <input className="cl-in" style={INP_S}
                type="number" min="1900" max={new Date().getFullYear()}
                value={pd.year_built || ""}
                onChange={e => set("year_built", e.target.value)}
                placeholder="2015" />
            </Field>
          )}
        </div>
      )}
 
      {/* City + Street */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="City" required>
          <input className="cl-in" style={INP_S}
            value={pd.city || ""}
            onChange={e => set("city", e.target.value)}
            placeholder="Tirana" />
        </Field>
        <Field label="Street / Area">
          <input className="cl-in" style={INP_S}
            value={pd.street || ""}
            onChange={e => set("street", e.target.value)}
            placeholder="Rr. e Durrësit" />
        </Field>
      </div>
 
      <Field label="Description" hint="Condition, features, included appliances, etc.">
        <textarea className="cl-in"
          value={pd.description || ""}
          onChange={e => set("description", e.target.value)}
          rows={2}
          placeholder="Newly renovated, equipped kitchen, parking..."
          style={{ ...INP_S, resize: "vertical" }} />
      </Field>
    </div>
  );
}
 