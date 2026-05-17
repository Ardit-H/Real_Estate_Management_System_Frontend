export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cd * { box-sizing: border-box; }
  .cd { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .cd-stat { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .cd-stat:hover { transform: translateY(-5px); box-shadow: 0 20px 44px rgba(20,16,10,0.13) !important; }
  .cd-prop { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; cursor: pointer; }
  .cd-prop:hover { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(20,16,10,0.16) !important; }
  .cd-prop:hover .cd-img { transform: scale(1.06); }
  .cd-img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }
  .cd-btn { transition: all 0.17s ease; }
  .cd-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .cd-item { transition: background 0.14s ease; }
  .cd-item:hover { background: #faf7f2 !important; }
  .cd-qa { transition: all 0.2s ease; cursor: pointer; }
  .cd-qa:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(20,16,10,0.12) !important; }
  @keyframes cd-spin    { to{transform:rotate(360deg)} }
  @keyframes cd-toast   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cd-shimmer { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes cd-fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cd-glow    { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes cd-pulse   { 0%,100%{opacity:.38} 50%{opacity:.82} }
`;