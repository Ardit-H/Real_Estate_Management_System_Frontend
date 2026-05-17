import { TYPE_ICON, TagIcon, PinIcon, AreaIcon, BedIcon, CalendarIcon, UserIcon, ClockIcon, ArrowRightIcon } from "./LeadsIcons";
import { STATUS, TYPE_LABEL, parsePD, fmtDate } from "./leadsConstants";
 
export default function LeadCard({ lead, onClick, idx }) {
  const pd = parsePD(lead.message);
  const s  = STATUS[lead.status] || STATUS.NEW;
 
  return (
    <div className="cl-card" onClick={onClick}
      style={{
        background: "#fff", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 2px 14px rgba(20,16,10,0.08)",
        border: "1.5px solid #ece6da", cursor: "pointer", display: "flex",
        animation: `cl-card-in 0.38s ease ${Math.min(idx * 0.06, 0.4)}s both`,
      }}>
 
      {/* Left accent strip */}
      <div style={{ width: 4, background: `linear-gradient(to bottom,${s.strip},${s.strip}66)`, flexShrink: 0 }}/>
 
      {/* Icon column */}
      <div style={{
        width: 60, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 7, padding: "14px 8px",
        background: `${s.strip}07`, borderRight: "1.5px solid #f0ece3",
      }}>
        <div style={{
          color: s.strip, width: 28, height: 28, borderRadius: 8,
          background: `${s.strip}12`, border: `1.5px solid ${s.strip}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {TYPE_ICON[lead.type] || <TagIcon />}
        </div>
        <span style={{
          fontSize: 8.5, fontWeight: 700, color: s.color,
          textTransform: "uppercase", letterSpacing: "0.5px",
          textAlign: "center", lineHeight: 1.3,
          background: `${s.strip}12`, padding: "2px 6px",
          borderRadius: 5, border: `1px solid ${s.strip}25`,
        }}>
          {s.label}
        </span>
      </div>
 
      {/* Main content */}
      <div style={{
        flex: 1, padding: "13px 18px",
        display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0,
      }}>
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: 12, marginBottom: 5,
          }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{
                margin: "0 0 3px", fontSize: 15.5, fontWeight: 700,
                color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif",
                letterSpacing: "-0.1px", lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {TYPE_LABEL[lead.type] || lead.type}
                {pd?.title && (
                  <span style={{ fontWeight: 400, color: "#9a8c6e", fontSize: 13.5 }}>
                    {" "}— {pd.title}
                  </span>
                )}
              </h3>
              <p style={{
                fontSize: 11.5, color: "#b0a890", margin: 0,
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <span>#{lead.id}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <ClockIcon />{fmtDate(lead.created_at)}
                </span>
                {pd?.city && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <PinIcon />{pd.city}
                  </span>
                )}
              </p>
            </div>
 
            {pd?.price && (
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{
                  fontSize: 17, fontWeight: 700, color: "#1a1714",
                  fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.3px",
                }}>
                  €{Number(pd.price).toLocaleString("de-DE")}
                  {pd.price_period && lead.type === "RENT" && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: "#9a8c6e" }}>
                      /{pd.price_period}
                    </span>
                  )}
                </div>
                {pd.price_per_sqm && (
                  <div style={{ fontSize: 11, color: "#9a8c6e" }}>
                    €{Number(pd.price_per_sqm).toLocaleString("de-DE")}/m²
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* Footer */}
        <div style={{
          display: "flex", gap: 14, paddingTop: 9,
          borderTop: "1px solid #f0ece3", flexWrap: "wrap", alignItems: "center",
        }}>
          {pd?.area_sqm && (
            <span style={{ fontSize: 12, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 4 }}>
              <AreaIcon />{pd.area_sqm} m²
            </span>
          )}
          {pd?.bedrooms && (
            <span style={{ fontSize: 12, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 4 }}>
              <BedIcon />{pd.bedrooms} beds
            </span>
          )}
          {lead.preferred_date && (
            <span style={{ fontSize: 12, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarIcon />{fmtDate(lead.preferred_date)}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 4 }}>
            <UserIcon />
            {lead.agent_name || (lead.assigned_agent_id ? `Agent #${lead.assigned_agent_id}` : "Not assigned yet")}
          </span>
          <span style={{
            marginLeft: "auto", fontSize: 11.5, color: "#c9b87a",
            fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
          }}>
            View details <ArrowRightIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
 