import { ModalWrap, MH } from "./LeadsUI";
import { TYPE_ICON, TagIcon, HomeIcon, PinIcon, AreaIcon, BedIcon, CalendarIcon } from "./LeadsIcons";
import { STATUS, TYPE_LABEL, SOURCE_LABEL, parsePD, cleanMsg, fmtDate, fmtDateTime } from "./leadsConstants";
 
export default function LeadDetailModal({ lead, onClose }) {
  const pd = parsePD(lead.message);
  const s  = STATUS[lead.status] || STATUS.NEW;
 
  return (
    <ModalWrap onClose={onClose} maxW={580}>
      <MH
        title={TYPE_LABEL[lead.type] || lead.type}
        sub={`Request #${lead.id} · ${fmtDateTime(lead.created_at)}`}
        onClose={onClose}
      />
      <div style={{ padding: "22px 26px" }}>
 
        {/* Status banner */}
        <div style={{
          marginBottom: 20, padding: "14px 16px", background: s.pill,
          borderRadius: 12, border: `1.5px solid ${s.pillBorder}`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${s.strip}18`, border: `1.5px solid ${s.strip}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: s.strip, flexShrink: 0,
          }}>
            {TYPE_ICON[lead.type] || <TagIcon />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 9.5, color: "#b0a890", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 5px",
            }}>Request status</p>
            <span style={{
              background: `${s.strip}16`, color: s.color,
              border: `1.5px solid ${s.strip}35`,
              padding: "3px 13px", borderRadius: 999,
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.4px", textTransform: "uppercase",
            }}>{s.label}</span>
          </div>
          <p style={{
            fontSize: 12.5, color: "#6b6248", lineHeight: 1.65,
            maxWidth: 220, margin: 0,
            fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: "italic",
          }}>
            {lead.status === "NEW" && !lead.assigned_agent_id && "Your request has been received. An admin will assign an agent shortly."}
            {lead.status === "NEW" && lead.assigned_agent_id  && "An agent is reviewing your request."}
            {lead.status === "IN_PROGRESS"                    && "Your agent is actively working on this. You will be contacted soon."}
            {lead.status === "DONE"                           && "Request completed successfully. Thank you!"}
            {lead.status === "REJECTED"                       && "This request could not be fulfilled. Feel free to submit a new one."}
          </p>
        </div>
 
        {/* Details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Type",           value: TYPE_LABEL[lead.type] || lead.type },
            { label: "Source",         value: SOURCE_LABEL[lead.source] || lead.source },
            { label: "Preferred date", value: fmtDate(lead.preferred_date) },
            { label: "Assigned agent", value: lead.agent_name || (lead.assigned_agent_id ? `Agent #${lead.assigned_agent_id}` : "Not assigned yet") },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "#fff", borderRadius: 11,
              padding: "11px 14px", border: "1.5px solid #e8e2d6",
            }}>
              <p style={{ fontSize: 9.5, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>{label}</p>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1714", margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{value}</p>
            </div>
          ))}
        </div>
 
        {/* Property data */}
        {pd && (
          <div style={{
            background: "rgba(201,184,122,0.06)",
            border: "1.5px solid rgba(201,184,122,0.18)",
            borderRadius: 12, padding: "14px 16px", marginBottom: 14,
          }}>
            <p style={{
              fontSize: 9.5, fontWeight: 700, color: "#c9b87a",
              textTransform: "uppercase", letterSpacing: "0.8px",
              marginBottom: 10, display: "flex", alignItems: "center", gap: 5,
            }}>
              <HomeIcon /> Property details
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {pd.title && (
                <div style={{
                  background: "#fff", borderRadius: 8, padding: "8px 12px",
                  border: "1px solid #e8e2d6", gridColumn: "span 2",
                }}>
                  <p style={{ fontSize: 10, color: "#b0a890", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Title</p>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", color: "#1a1714" }}>{pd.title}</p>
                </div>
              )}
              {[
                pd.type        && { icon: <TagIcon/>,      text: pd.type },
                pd.city        && { icon: <PinIcon/>,      text: pd.city },
                pd.area_sqm    && { icon: <AreaIcon/>,     text: `${pd.area_sqm} m²` },
                pd.bedrooms    && { icon: <BedIcon/>,      text: `${pd.bedrooms} bedrooms` },
                pd.bathrooms   && { icon: null,            text: `${pd.bathrooms} bathrooms` },
                pd.floor       && { icon: null,            text: `Floor ${pd.floor}${pd.total_floors ? ` / ${pd.total_floors}` : ""}` },
                pd.year_built  && { icon: <CalendarIcon/>, text: `Built: ${pd.year_built}` },
                pd.price       && {
                  icon: null,
                  text: `€${Number(pd.price).toLocaleString("de-DE")} ${pd.currency}${lead.type === "RENT" && pd.price_period ? ` / ${pd.price_period}` : ""}`,
                  bold: true,
                },
                pd.price_per_sqm && { icon: null, text: `€${Number(pd.price_per_sqm).toLocaleString("de-DE")} / m²` },
              ].filter(Boolean).map((item, i) => (
                <span key={i} style={{
                  fontSize: 13, color: "#4a4438",
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 10px", background: "#fff",
                  borderRadius: 8, border: "1px solid #e8e2d6",
                  fontWeight: item.bold ? 600 : 400,
                }}>
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
            {pd.description && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e8e2d6" }}>
                <p style={{ fontSize: 10, color: "#b0a890", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Notes</p>
                <p style={{ fontSize: 13, color: "#4a4438", margin: 0, lineHeight: 1.6 }}>{pd.description}</p>
              </div>
            )}
          </div>
        )}
 
        {/* Message */}
        {lead.message && cleanMsg(lead.message) && (
          <div style={{ background: "#fff", border: "1.5px solid #e8e2d6", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 9.5, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Your message</p>
            <p style={{ fontSize: 14.5, color: "#3c3830", lineHeight: 1.85, fontStyle: "italic", margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>"{cleanMsg(lead.message)}"</p>
          </div>
        )}
 
        <div style={{ borderTop: "1px solid #e8e2d6", paddingTop: 16, marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="cl-btn" style={{
            padding: "10px 22px", borderRadius: 10,
            border: "1.5px solid #e4ddd0", background: "transparent",
            color: "#6b6248", fontSize: 13.5, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>Close</button>
        </div>
      </div>
    </ModalWrap>
  );
}
 