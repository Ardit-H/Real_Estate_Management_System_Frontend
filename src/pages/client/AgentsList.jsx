import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthProvider";
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .al-root { font-family: 'DM Sans', system-ui, sans-serif; background: #f2efe8; min-height: 100vh; color: #1a1a12; }
  .al-root * { box-sizing: border-box; margin: 0; padding: 0; }
 
  .al-hero {
    background: #1a1714;
    border-bottom: 1px solid rgba(201,184,122,0.14);
    padding: 36px 40px 32px;
    position: relative; overflow: hidden;
  }
  .al-hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(201,184,122,0.04) 1px, transparent 1px);
    background-size: 22px 22px; pointer-events: none;
  }
  .al-hero-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(201,184,122,0.55) 35%, rgba(201,184,122,0.55) 65%, transparent);
  }
  .al-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .al-hero-label { font-size: 10px; font-weight: 600; color: rgba(201,184,122,0.55); text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 8px; }
  .al-hero-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; font-weight: 600; color: #f5f0e8; letter-spacing: -.3px; line-height: 1.15; margin-bottom: 8px; }
  .al-hero-sub { font-size: 13.5px; color: rgba(245,240,232,0.42); line-height: 1.6; }
 
  .al-content { max-width: 1100px; margin: 0 auto; padding: 32px 40px; }
 
  .al-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; flex-wrap: wrap;
  }
  .al-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1px solid #e4ddd2; padding: 0 14px;
    height: 40px; flex: 1; min-width: 220px; max-width: 380px;
    transition: border-color .15s, box-shadow .15s;
  }
  .al-search-wrap:focus-within { border-color: #6b6340; box-shadow: 0 0 0 3px rgba(107,99,64,.08); }
  .al-search-icon { color: #c0b8a0; flex-shrink: 0; }
  .al-search-inp { flex: 1; border: none; outline: none; font-size: 13.5px; color: #1a1a12; font-family: 'DM Sans', sans-serif; background: transparent; }
  .al-search-inp::placeholder { color: #c0b8a0; }
 
  .al-filter-btn {
    height: 40px; padding: 0 16px;
    border: 1px solid #e4ddd2; background: #fff;
    font-size: 12.5px; font-weight: 500; color: #6b6340;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 7px;
    transition: all .14s;
  }
  .al-filter-btn:hover { background: #f7f4ee; border-color: #c8b870; }
  .al-filter-btn.active { background: #1a1a12; color: #f4f1ea; border-color: #1a1a12; }
 
  .al-count { font-size: 12.5px; color: #9a8c7a; margin-left: auto; white-space: nowrap; }
 
  .al-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 18px;
  }
 
  .al-card {
    background: #fff; border: 1px solid #e4ddd2;
    padding: 24px; position: relative;
    transition: box-shadow .18s, border-color .18s, transform .18s;
    cursor: pointer;
  }
  .al-card:hover { box-shadow: 0 6px 28px rgba(26,26,18,.09); border-color: #c8b870; transform: translateY(-2px); }
 
  .al-card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
  .al-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 600; flex-shrink: 0;
    font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: .3px;
    border: 2px solid rgba(201,184,122,.2);
  }
  .al-card-name { font-size: 16px; font-weight: 500; color: #1a1a12; margin-bottom: 2px; font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: -.1px; line-height: 1.2; }
  .al-card-email { font-size: 12px; color: #9a8c7a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 
  .al-stars { display: flex; gap: 2px; align-items: center; }
  .al-star { font-size: 13px; line-height: 1; }
  .al-rating-val { font-size: 13px; font-weight: 500; color: #1a1a12; margin-left: 5px; }
  .al-rating-cnt { font-size: 11.5px; color: #b0a890; margin-left: 3px; }
 
  .al-divider { height: 1px; background: #f0e8de; margin: 14px 0; }
 
  .al-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .al-tag {
    font-size: 11px; font-weight: 500; padding: 3px 10px;
    background: #f7f4ee; color: #6b6340; border: 1px solid #e4ddd2;
  }
  .al-tag-spec { background: rgba(201,184,122,0.1); color: #7a6a38; border-color: rgba(201,184,122,0.25); }
 
  .al-meta { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
  .al-meta-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #6b6040; }
  .al-meta-icon { color: #c0b0a0; flex-shrink: 0; }
 
  .al-review-btn {
    width: 100%; height: 38px;
    background: #1a1a12; color: #f4f1ea;
    border: none; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all .16s; letter-spacing: .2px;
  }
  .al-review-btn:hover { background: #2a2a18; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,26,18,.22); }
  .al-review-btn.reviewed { background: #2a5040; }
  .al-review-btn.reviewed:hover { background: #1e3a2e; }
 
  /* ── Modal ── */
  .al-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    z-index: 500; display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: al-fade .2s ease;
  }
  @keyframes al-fade { from{opacity:0} to{opacity:1} }
  .al-modal {
    background: #fff; width: 100%; max-width: 520px;
    max-height: calc(100vh - 40px); overflow-y: auto;
    animation: al-up .22s ease;
  }
  @keyframes al-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
 
  .al-modal-head {
    background: #1a1714; padding: 22px 26px 18px;
    border-bottom: 1px solid rgba(201,184,122,0.12);
    display: flex; align-items: flex-start; gap: 14px; position: relative;
  }
  .al-modal-head::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,transparent,rgba(201,184,122,.5) 30%,rgba(201,184,122,.5) 70%,transparent);
  }
  .al-modal-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 600; color: #f5f0e8; margin-bottom: 3px; }
  .al-modal-sub { font-size: 12px; color: rgba(245,240,232,.38); }
  .al-close-btn {
    position: absolute; top: 14px; right: 14px;
    width: 30px; height: 30px; background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1); color: rgba(245,240,232,.55);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; line-height: 1; transition: all .14s;
  }
  .al-close-btn:hover { background: rgba(255,255,255,.13); color: #f5f0e8; }
 
  .al-modal-body { padding: 26px; }
 
  .al-star-select { display: flex; gap: 8px; margin-bottom: 6px; }
  .al-star-sel-btn {
    font-size: 26px; background: none; border: none; cursor: pointer;
    padding: 2px; transition: transform .12s; line-height: 1;
    opacity: .25; filter: grayscale(100%);
  }
  .al-star-sel-btn.on { opacity: 1; filter: none; transform: scale(1.08); }
  .al-star-sel-btn:hover { transform: scale(1.15); opacity: .7; }
 
  .al-star-hint { font-size: 12px; color: #a09080; height: 16px; margin-bottom: 18px; font-family: 'DM Sans', sans-serif; }
 
  .al-form-label { font-size: 10.5px; font-weight: 600; color: #8a8070; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
 
  .al-submit-btn {
    width: 100%; height: 44px; background: #1a1a12; color: #f4f1ea;
    border: none; font-size: 13.5px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    transition: all .16s; letter-spacing: .3px; margin-top: 20px;
  }
  .al-submit-btn:hover:not(:disabled) { background: #2a2a18; box-shadow: 0 4px 16px rgba(26,26,18,.25); }
  .al-submit-btn:disabled { background: #b0a890; cursor: not-allowed; }
 
  .al-error-banner {
    background: #fef2f2; border: 1px solid #fecaca; color: #9b2828;
    padding: 10px 14px; font-size: 12.5px; margin-bottom: 16px; display: flex; gap: 8px; align-items: center;
  }
  .al-success-banner {
    background: #f0faf4; border: 1px solid #b0d8bc; color: #1e5c38;
    padding: 10px 14px; font-size: 12.5px; margin-bottom: 16px; display: flex; gap: 8px; align-items: center;
  }
 
  /* Detail panel inside modal */
  .al-detail-bio { font-size: 13.5px; color: #4a4438; line-height: 1.7; font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif; background: #f7f4ee; border-left: 2px solid rgba(201,184,122,.4); padding: 12px 16px; margin-bottom: 20px; }
  .al-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .al-detail-cell { background: #f7f4ee; border: 1px solid #e4ddd2; padding: 12px 14px; }
  .al-detail-cell-label { font-size: 10px; font-weight: 600; color: #a09080; text-transform: uppercase; letter-spacing: .9px; margin-bottom: 4px; }
  .al-detail-cell-val { font-size: 13.5px; color: #1a1a12; font-weight: 400; }
 
  .al-empty { padding: 56px 0; text-align: center; }
  .al-empty-icon { font-size: 40px; margin-bottom: 14px; opacity: .35; }
  .al-empty-title { font-size: 17px; color: #6b6040; font-family: 'Cormorant Garamond', serif; margin-bottom: 6px; }
  .al-empty-sub { font-size: 13px; color: #b0a890; }
 
  @keyframes al-spin { to{transform:rotate(360deg)} }
  .al-spinner { width: 36px; height: 36px; border: 2.5px solid #e4ddd2; border-top-color: #6b6340; border-radius: 50%; animation: al-spin .7s linear infinite; margin: 0 auto 14px; }
 
  .al-skeleton { animation: al-pulse 1.5s ease infinite; background: #e8e2d6; }
  @keyframes al-pulse { 0%,100%{opacity:.4} 50%{opacity:.85} }
 
  .al-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    background: #1a1a12; padding: 13px 20px;
    border: 1px solid rgba(201,184,122,.15);
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 9px;
    box-shadow: 0 12px 40px rgba(0,0,0,.32); max-width: 320px;
    animation: al-up .22s ease;
  }
  .al-section-divider { display: flex; align-items: center; gap: 14px; margin: 20px 0 16px; }
  .al-section-divider span { font-size: 10px; font-weight: 600; color: #a09080; text-transform: uppercase; letter-spacing: 1.1px; white-space: nowrap; }
  .al-section-divider::before,.al-section-divider::after { content:''; flex:1; height:1px; background:#ebe4d8; }
`;
 
const STAR_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };
 
function getInitials(n) {
  if (!n) return "??";
  return n.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
}
 
const AVATAR_PALETTES = [
  { bg: "rgba(99,102,241,.12)",  text: "#4f46e5", border: "rgba(99,102,241,.2)"  },
  { bg: "rgba(16,185,129,.1)",   text: "#059669", border: "rgba(16,185,129,.2)"  },
  { bg: "rgba(245,158,11,.1)",   text: "#d97706", border: "rgba(245,158,11,.2)"  },
  { bg: "rgba(239,68,68,.1)",    text: "#dc2626", border: "rgba(239,68,68,.2)"   },
  { bg: "rgba(59,130,246,.1)",   text: "#2563eb", border: "rgba(59,130,246,.2)"  },
  { bg: "rgba(168,85,247,.1)",   text: "#7c3aed", border: "rgba(168,85,247,.2)"  },
];
 
function avatarPalette(id) {
  return AVATAR_PALETTES[(id || 0) % AVATAR_PALETTES.length];
}
 
function Stars({ value = 0, size = 13, gap = 2 }) {
  const filled = Math.round(Number(value));
  return (
    <div className="al-stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className="al-star" style={{ fontSize: size, color: s <= filled ? "#c8a840" : "#ddd6c8" }}>★</span>
      ))}
    </div>
  );
}
 
function AgentCard({ agent, onReview, reviewed }) {
  const pal = avatarPalette(agent.user_id);
  const initials = getInitials(agent._name);
  const rating = Number(agent.rating || 0).toFixed(1);
  const reviews = agent.total_reviews || 0;
 
  return (
    <div className="al-card">
      <div className="al-card-top">
        {agent.photo_url ? (
          <img src={agent.photo_url} alt={agent._name}
            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(201,184,122,.2)", flexShrink: 0 }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="al-avatar" style={{ background: pal.bg, color: pal.text, borderColor: pal.border }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="al-card-name">{agent._name || "—"}</div>
          <div className="al-card-email">{agent._email || "—"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
            <Stars value={agent.rating} />
            <span className="al-rating-val">{rating}</span>
            <span className="al-rating-cnt">({reviews})</span>
          </div>
        </div>
      </div>
 
      {(agent.specialization || agent.experience_years != null || agent.license || agent.phone) && (
        <div className="al-meta">
          {agent.specialization && (
            <div className="al-meta-row">
              <span className="al-meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </span>
              {agent.specialization}
            </div>
          )}
          {agent.experience_years != null && (
            <div className="al-meta-row">
              <span className="al-meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              {agent.experience_years} year{agent.experience_years !== 1 ? "s" : ""} of experience
            </div>
          )}
          {agent.license && (
            <div className="al-meta-row">
              <span className="al-meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              </span>
              License: {agent.license}
            </div>
          )}
          {agent.phone && (
            <div className="al-meta-row">
              <span className="al-meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              {agent.phone}
            </div>
          )}
        </div>
      )}
 
      {agent.bio && (
        <p style={{ fontSize: 12.5, color: "#7a6a50", fontStyle: "italic", fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.6, marginBottom: 14, borderLeft: "2px solid rgba(201,184,122,.3)", paddingLeft: 10 }}>
          "{agent.bio.length > 85 ? agent.bio.slice(0, 85) + "…" : agent.bio}"
        </p>
      )}
 
      <button
            className={`al-review-btn ${reviewed ? "reviewed" : ""}`}
            onClick={() => !reviewed && onReview(agent)}
            style={{ cursor: reviewed ? "default" : "pointer" }}
            title={reviewed ? "You have already reviewed this agent" : "Leave a review"}
        >
        {reviewed ? (
          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Reviewed</>
        ) : (
          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Leave a Review</>
        )}
      </button>
    </div>
  );
}
 
function ReviewModal({ agent, onClose, onSubmitted }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
 
  const pal = avatarPalette(agent.user_id);
  const display = hovered || stars;
 
  const handleSubmit = async () => {
    if (!stars) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    setError(null);
  try {
            await api.patch(`/api/users/agents/${agent.user_id}/rate`, {
                rating: stars
            });
            
            // Update UI lokalisht
            const currentReviews = agent.total_reviews || 0;
            const currentRating  = Number(agent.rating || 0);
            const newReviews     = currentReviews + 1;
            const newRating      = ((currentRating * currentReviews) + stars) / newReviews;
            
            onSubmitted(agent.user_id, Number(newRating.toFixed(2)), newReviews);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Error submitting review";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };
    
  return (
    <div className="al-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="al-modal">
        {/* Header */}
        <div className="al-modal-head">
          <div className="al-avatar" style={{ width: 46, height: 46, fontSize: 15, background: pal.bg, color: pal.text, borderColor: pal.border, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, flexShrink: 0 }}>
            {agent.photo_url
              ? <img src={agent.photo_url} alt="" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
              : getInitials(agent._name)
            }
          </div>
          <div>
            <div className="al-modal-title">{agent._name}</div>
            <div className="al-modal-sub">Rate your experience with this agent</div>
          </div>
          <button className="al-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
 
        <div className="al-modal-body">
          {error   && <div className="al-error-banner"><span>⚠</span>{error}</div>}
 
          {/* Agent details */}
          {(agent.specialization || agent.experience_years != null || agent.license || agent.phone) && (
            <div className="al-detail-grid">
              {agent.specialization && (
                <div className="al-detail-cell">
                  <div className="al-detail-cell-label">Specialization</div>
                  <div className="al-detail-cell-val">{agent.specialization}</div>
                </div>
              )}
              {agent.experience_years != null && (
                <div className="al-detail-cell">
                  <div className="al-detail-cell-label">Experience</div>
                  <div className="al-detail-cell-val">{agent.experience_years} year{agent.experience_years !== 1 ? "s" : ""}</div>
                </div>
              )}
              {agent.license && (
                <div className="al-detail-cell">
                  <div className="al-detail-cell-label">License</div>
                  <div className="al-detail-cell-val">{agent.license}</div>
                </div>
              )}
              {agent.phone && (
                <div className="al-detail-cell">
                  <div className="al-detail-cell-label">Phone</div>
                  <div className="al-detail-cell-val">{agent.phone}</div>
                </div>
              )}
            </div>
          )}
 
          {agent.bio && (
            <div className="al-detail-bio">"{agent.bio}"</div>
          )}
 
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "10px 0", borderTop: "1px solid #ebe4d8", borderBottom: "1px solid #ebe4d8" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#a09080", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 3 }}>Current rating</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars value={agent.rating} size={14} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a12" }}>{Number(agent.rating || 0).toFixed(1)}</span>
                <span style={{ fontSize: 12, color: "#b0a890" }}>({agent.total_reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
 
          {/* Star selector */}
          <div style={{ marginTop: 18 }}>
            <label className="al-form-label" style={{ marginBottom: 10 }}>Your Rating</label>
            <div className="al-star-select">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={`al-star-sel-btn ${s <= (hovered || stars) ? "on" : ""}`}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                  type="button">
                  ★
                </button>
              ))}
            </div>
            <p className="al-star-hint">
              {display ? `${display} — ${STAR_LABELS[display]}` : "Click to select a rating"}
            </p>
          </div>
 
          <button className="al-submit-btn" onClick={handleSubmit} disabled={submitting || !stars}>
            {submitting ? (
              <><div style={{ width: 14, height: 14, border: "2px solid rgba(244,241,234,.25)", borderTopColor: "#f4f1ea", borderRadius: "50%", animation: "al-spin .7s linear infinite" }} /> Submitting…</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Submit Review</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="al-toast" style={{ color: type === "error" ? "#f0a0a0" : "#a0c8a0", borderColor: type === "error" ? "rgba(240,160,160,.18)" : "rgba(160,200,160,.18)" }}>
      <span>{type === "error" ? "⚠" : "✓"}</span>
      {msg}
    </div>
  );
}
 
export default function AgentsList() {
    const { user } = useContext(AuthContext);
  const [agents,   setAgents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sortBy,   setSortBy]   = useState("rating");
  const [selected, setSelected] = useState(null);
  const [reviewed, setReviewed] = useState(() => {
    try {
        const saved = localStorage.getItem(`reviewed_agents_${user?.id || "guest"}`);
        return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
});
  const [toast,    setToast]    = useState(null);
 
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
 
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, profilesRes] = await Promise.all([
        api.get("/api/users/agents/list"),
        api.get("/api/users/agents"),
      ]);
 
      const users    = Array.isArray(usersRes.data)    ? usersRes.data    : [];
      const profiles = Array.isArray(profilesRes.data) ? profilesRes.data : [];
 
      const profileMap = {};
      profiles.forEach(p => { profileMap[p.user_id] = p; });
 
      const merged = users.map(u => {
        const prof = profileMap[u.id] || {};
        return {
          ...prof,
          user_id:          u.id,
          _name:            `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Agent",
          _email:           u.email || "",
          rating:           prof.rating         ?? 0,
          total_reviews:    prof.total_reviews   ?? 0,
          experience_years: prof.experience_years ?? null,
          specialization:   prof.specialization  ?? null,
          license:          prof.license         ?? null,
          phone:            prof.phone           ?? null,
          bio:              prof.bio             ?? null,
          photo_url:        prof.photo_url       ?? null,
        };
      });
 
      setAgents(merged);
    } catch (err) {
      notify("Could not load agents. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchAgents(); }, [fetchAgents]);
 
  const handleReviewSubmitted = (userId, newRating, newReviews) => {
        setAgents(prev => prev.map(a =>
            a.user_id === userId ? { ...a, rating: newRating, total_reviews: newReviews } : a
        ));
        setReviewed(prev => {
            const updated = { ...prev, [userId]: true };
            try {
                localStorage.setItem(
                    `reviewed_agents_${user?.id || "guest"}`,
                    JSON.stringify(updated)
                );
            } catch {}
            return updated;
        });
        setSelected(null);
        notify("Your review has been submitted. Thank you!");
    };
 
  const filtered = agents
    .filter(a => {
      const q = search.toLowerCase();
      return !q || a._name.toLowerCase().includes(q) ||
        (a.specialization || "").toLowerCase().includes(q) ||
        (a._email || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "rating")   return Number(b.rating) - Number(a.rating);
      if (sortBy === "reviews")  return (b.total_reviews || 0) - (a.total_reviews || 0);
      if (sortBy === "name")     return a._name.localeCompare(b._name);
      if (sortBy === "exp")      return (b.experience_years || 0) - (a.experience_years || 0);
      return 0;
    });
 
  const SORTS = [
    { id: "rating",  label: "Top Rated" },
    { id: "reviews", label: "Most Reviewed" },
    { id: "exp",     label: "Experience" },
    { id: "name",    label: "Name A–Z" },
  ];
 
  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="al-root">
 
        {/* Hero */}
        <div className="al-hero">
          <div className="al-hero-top-line" />
          <div className="al-hero-inner">
            <p className="al-hero-label">Our Team</p>
            <h1 className="al-hero-title">Meet Our Agents</h1>
            <p className="al-hero-sub">Browse our professional team and share your experience by leaving a review.</p>
          </div>
        </div>
 
        <div className="al-content">
 
          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search-wrap">
              <span className="al-search-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input className="al-search-inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialization, email…" />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#b0a890", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>✕</button>
              )}
            </div>
 
            {SORTS.map(s => (
              <button key={s.id} className={`al-filter-btn ${sortBy === s.id ? "active" : ""}`} onClick={() => setSortBy(s.id)}>
                {s.label}
              </button>
            ))}
 
            <span className="al-count">
              {!loading && `${filtered.length} agent${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>
 
          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="al-spinner" />
              <p style={{ fontSize: 13, color: "#a09080", fontFamily: "'DM Sans', sans-serif" }}>Loading agents…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty-icon">🔍</div>
              <div className="al-empty-title">{search ? "No agents match your search" : "No agents found"}</div>
              <div className="al-empty-sub">{search ? "Try a different name or specialization" : "Check back later"}</div>
            </div>
          ) : (
            <div className="al-grid">
              {filtered.map(agent => (
                <AgentCard
                  key={agent.user_id}
                  agent={agent}
                  onReview={a => setSelected(a)}
                  reviewed={!!reviewed[agent.user_id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
 
      {selected && (
        <ReviewModal
          agent={selected}
          onClose={() => setSelected(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
 
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 