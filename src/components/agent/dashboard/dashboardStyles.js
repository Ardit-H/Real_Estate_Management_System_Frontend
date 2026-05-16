export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ad * { box-sizing: border-box; }
  .ad { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .ad-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }

  .ad-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .ad-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  @keyframes ad-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ad-scale-in { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes ad-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ad-spin     { to{transform:rotate(360deg)} }
  @keyframes ad-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }

  .ad-stat { animation: ad-fade-up 0.4s ease both; }
  .ad-stat:nth-child(1) { animation-delay: 0.05s; }
  .ad-stat:nth-child(2) { animation-delay: 0.10s; }
  .ad-stat:nth-child(3) { animation-delay: 0.15s; }
  .ad-stat:nth-child(4) { animation-delay: 0.20s; }
  .ad-stat:nth-child(5) { animation-delay: 0.25s; }
  .ad-stat:nth-child(6) { animation-delay: 0.30s; }

  .ad-section { animation: ad-fade-up 0.5s ease 0.2s both; }
  .ad-row:hover { background: #f5f0e8 !important; }

  .ad-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: ad-pulse 1.5s ease infinite;
  }

  .risk-input {
    width: 100%;
    padding: 9px 13px;
    border: 1.5px solid #e8e2d6;
    border-radius: 9px;
    font-size: 13px;
    color: #1a1714;
    background: #faf7f2;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color .2s;
  }
  .risk-input:focus {
    border-color: #8a7d5e;
    box-shadow: 0 0 0 3px rgba(138,125,94,.13);
  }
`;