export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sp * { box-sizing: border-box; }
  .sp {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  /* cards */
  .sp-card { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; }
  .sp-card:hover { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(20,16,10,0.16) !important; }
  .sp-card:hover .sp-img { transform: scale(1.06); }
  .sp-img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }

  /* unsave button */
  .sp-unsave { transition: all 0.15s ease; }
  .sp-unsave:hover { transform: scale(1.15) !important; background: rgba(192,57,43,0.9) !important; }

  /* view toggle */
  .sp-view-btn { transition: all 0.14s ease; }

  /* pagination */
  .sp-pg:hover:not(:disabled) { background: #ede9df !important; border-color: #8a7d5e !important; }

  /* back btn */
  .sp-back:hover { background: rgba(201,184,122,0.14) !important; color: rgba(245,240,232,0.85) !important; }

  @keyframes sp-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes sp-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes sp-card-in  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sp-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sp-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes sp-fade-in  { from{opacity:0} to{opacity:1} }
`;