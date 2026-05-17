export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ad *{box-sizing:border-box}
  .ad{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .ad-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .ad-btn:hover{opacity:.85;transform:translateY(-1px)}
  .ad-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .ad-row{transition:background .15s}
  .ad-row:hover{background:#f5f0e8!important}
  @keyframes ad-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ad-spin{to{transform:rotate(360deg)}}
  @keyframes ad-pulse{0%,100%{opacity:.38}50%{opacity:.82}}
  .ad-card{animation:ad-fade-up .35s ease both}
  .ad-stat{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);padding:18px 20px;transition:box-shadow .2s,transform .2s;animation:ad-fade-up .35s ease both}
  .ad-stat:hover{box-shadow:0 6px 28px rgba(20,16,10,.10);transform:translateY(-2px)}
  .ad-skeleton{background:#ede9df;border-radius:10px;animation:ad-pulse 1.5s ease infinite}
  .risk-input{width:100%;padding:9px 13px;border:1.5px solid #e8e2d6;border-radius:9px;font-size:13px;color:#1a1714;background:#faf7f2;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  .risk-input:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.13)}
`;