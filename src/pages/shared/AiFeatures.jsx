import { useState } from "react";
import api from "../../api/axios";

// ─── Shared styles ────────────────────────────────────────────────────────────
const C = {
  dark:"#1a1714", gold:"#c9b87a", goldL:"#e8d9a0",
  border:"#e8e2d6", surface:"#faf7f2", muted:"#9a8c6e",
  text:"#1a1714", textMut:"#b0a890", textSub:"#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ai-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .ai-btn:hover{opacity:.85;transform:translateY(-1px)}
  .ai-in{width:100%;padding:10px 13px;border:1.5px solid #e4ddd0;border-radius:10px;font-size:13.5px;color:#1a1714;background:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  .ai-in:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.12)}
  @keyframes ai-spin{to{transform:rotate(360deg)}}
  @keyframes ai-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .ai-result{animation:ai-fade .3s ease}
`;

function AiSpinner() {
  return <div style={{width:20,height:20,border:"2px solid #e8e2d6",borderTop:`2px solid ${C.gold}`,borderRadius:"50%",animation:"ai-spin .7s linear infinite",display:"inline-block"}}/>;
}

function AiCard({title,icon,children}) {
  return (
    <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 16px rgba(20,16,10,.06)"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>{icon}</span>
        <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{title}</p>
      </div>
      <div style={{padding:18}}>{children}</div>
    </div>
  );
}

function AiButton({onClick,loading,children,disabled=false}) {
  return (
    <button className="ai-btn" onClick={onClick} disabled={loading||disabled}
      style={{padding:"9px 20px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700,display:"inline-flex",alignItems:"center",gap:8,opacity:disabled?.5:1}}>
      {loading ? <AiSpinner/> : "✨"} {children}
    </button>
  );
}

function Field({label,children}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:5}}>{label}</label>
      {children}
    </div>
  );
}

function ResultBox({children}) {
  return (
    <div className="ai-result" style={{marginTop:16,padding:14,background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,fontSize:13.5,color:"#166534",lineHeight:1.7}}>
      {children}
    </div>
  );
}

function ErrorBox({msg}) {
  return <div style={{marginTop:12,padding:12,background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:10,fontSize:13,color:"#dc2626"}}>{msg}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PROPERTY DESCRIPTION GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function AiDescriptionGenerator({ onResult }) {
  const [form, setForm] = useState({ type:"APARTMENT", bedrooms:2, bathrooms:1, areaSqm:75, floor:3, yearBuilt:2015, city:"Prishtina", features:"parking,elevator", price:80000 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const r = await api.post("/api/ai/property/description", form);
      setResult(r.data);
      if (onResult) onResult(r.data);
    } catch(e) { setError(e.response?.data?.message || "AI service error"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div>
        <AiCard title="AI Property Description" icon="🏠">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Type">
              <select className="ai-in" value={form.type} onChange={e=>set("type",e.target.value)}>
                {["APARTMENT","HOUSE","VILLA","OFFICE","COMMERCIAL","LAND"].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="City"><input className="ai-in" value={form.city} onChange={e=>set("city",e.target.value)}/></Field>
            <Field label="Bedrooms"><input className="ai-in" type="number" value={form.bedrooms} onChange={e=>set("bedrooms",+e.target.value)}/></Field>
            <Field label="Bathrooms"><input className="ai-in" type="number" value={form.bathrooms} onChange={e=>set("bathrooms",+e.target.value)}/></Field>
            <Field label="Area (sqm)"><input className="ai-in" type="number" value={form.areaSqm} onChange={e=>set("areaSqm",+e.target.value)}/></Field>
            <Field label="Year Built"><input className="ai-in" type="number" value={form.yearBuilt} onChange={e=>set("yearBuilt",+e.target.value)}/></Field>
            <Field label="Price (€)"><input className="ai-in" type="number" value={form.price} onChange={e=>set("price",+e.target.value)}/></Field>
            <Field label="Features"><input className="ai-in" value={form.features} onChange={e=>set("features",e.target.value)} placeholder="parking,pool,..."/></Field>
          </div>
          <div style={{marginTop:14}}><AiButton onClick={generate} loading={loading}>Generate Description</AiButton></div>
          {error && <ErrorBox msg={error}/>}
          {result && (
            <ResultBox>
              <p style={{margin:"0 0 6px",fontWeight:700,fontSize:15}}>{result.title}</p>
              <p style={{margin:0}}>{result.description}</p>
            </ResultBox>
          )}
        </AiCard>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PRICE ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function AiPriceEstimator() {
  const [form, setForm] = useState({ type:"APARTMENT", areaSqm:75, bedrooms:2, city:"Prishtina", floor:3, totalFloors:8, yearBuilt:2015, listingType:"SALE" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const CONF_COLOR = { HIGH:"#059669", MEDIUM:"#d97706", LOW:"#dc2626" };

  const estimate = async () => {
    setLoading(true); setError(null);
    try {
      const r = await api.post("/api/ai/property/estimate", form);
      setResult(r.data);
    } catch(e) { setError(e.response?.data?.message || "AI service error"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div>
        <AiCard title="AI Price Estimator" icon="💰">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Type">
              <select className="ai-in" value={form.type} onChange={e=>set("type",e.target.value)}>
                {["APARTMENT","HOUSE","VILLA","OFFICE","COMMERCIAL","LAND"].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Listing Type">
              <select className="ai-in" value={form.listingType} onChange={e=>set("listingType",e.target.value)}>
                <option>SALE</option><option>RENT</option>
              </select>
            </Field>
            <Field label="Area (sqm)"><input className="ai-in" type="number" value={form.areaSqm} onChange={e=>set("areaSqm",e.target.value)}/></Field>
            <Field label="City"><input className="ai-in" value={form.city} onChange={e=>set("city",e.target.value)}/></Field>
            <Field label="Bedrooms"><input className="ai-in" type="number" value={form.bedrooms} onChange={e=>set("bedrooms",+e.target.value)}/></Field>
            <Field label="Year Built"><input className="ai-in" type="number" value={form.yearBuilt} onChange={e=>set("yearBuilt",+e.target.value)}/></Field>
            <Field label="Floor"><input className="ai-in" type="number" value={form.floor} onChange={e=>set("floor",+e.target.value)}/></Field>
            <Field label="Total Floors"><input className="ai-in" type="number" value={form.totalFloors} onChange={e=>set("totalFloors",+e.target.value)}/></Field>
          </div>
          <div style={{marginTop:14}}><AiButton onClick={estimate} loading={loading}>Estimate Price</AiButton></div>
          {error && <ErrorBox msg={error}/>}
          {result && (
            <div className="ai-result" style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                ["Estimated Price", `€${Number(result.estimated_price).toLocaleString("de-DE")}`, C.gold],
                ["Price per sqm",   `€${Number(result.price_per_sqm).toLocaleString("de-DE")}`,   C.gold],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:"#f5f0e8",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                  <p style={{margin:0,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{l}</p>
                  <p style={{margin:0,fontSize:22,fontWeight:700,color:c,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{v}</p>
                </div>
              ))}
              <div style={{gridColumn:"span 2",background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:12}}>
                <span style={{background:CONF_COLOR[result.confidence]||"#64748b",color:"#fff",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,marginRight:8}}>{result.confidence}</span>
                <span style={{fontSize:13,color:"#166534"}}>{result.reasoning}</span>
              </div>
            </div>
          )}
        </AiCard>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CHAT WIDGET — FIXED
// ═══════════════════════════════════════════════════════════════════════════════
export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:"assistant", content:"👋 Welcome! I am your real estate assistant. How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg    = { role:"user", content:input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const historyToSend = messages.slice(1); 

      const r = await api.post("/api/ai/chat", {
        message: input,          
        history: historyToSend,  
      });

      setMessages([...newHistory, { role:"assistant", content: r.data.message }]);
    } catch {
      setMessages([...newHistory, {
        role:"assistant",
        content:"An error occurred. Please try again.",
      }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <style>{CSS}{`
        @keyframes ai-spin{to{transform:rotate(360deg)}}
        @keyframes ai-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .chat-msg{animation:ai-fade .2s ease}
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:#e8e2d6;border-radius:2px}
      `}</style>

      <div style={{position:"fixed",bottom:28,right:28,zIndex:9000}}>

        {/* Toggle button */}
        <button className="ai-btn" onClick={()=>setOpen(p=>!p)}
          style={{width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 28px rgba(201,184,122,0.45)"}}>
          {open ? "✕" : "💬"}
        </button>

        {/* Chat panel */}
        {open && (
          <div style={{position:"absolute",bottom:64,right:0,width:340,background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,.22)",overflow:"hidden",animation:"ai-fade .2s ease"}}>

            {/* Header */}
            <div style={{background:C.dark,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,border:`1.5px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:600,color:"#f5f0e8"}}>AI Real Estate Assistant</p>
                <p style={{margin:0,fontSize:11,color:"rgba(245,240,232,.4)"}}>Powered by Gemini</p>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-scroll" style={{height:300,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
              {messages.map((m,i)=>(
                <div key={i} className="chat-msg" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{
                    maxWidth:"82%",padding:"9px 13px",borderRadius:12,fontSize:13,lineHeight:1.55,
                    background:   m.role==="user" ? C.dark    : "#f0ece3",
                    color:        m.role==="user" ? "#f5f0e8" : C.text,
                    borderBottomRightRadius: m.role==="user"      ? 2  : 12,
                    borderBottomLeftRadius:  m.role==="assistant" ? 2  : 12,
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div style={{display:"flex",justifyContent:"flex-start"}}>
                  <div style={{background:"#f0ece3",padding:"10px 14px",borderRadius:12,display:"flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#c9b87a",animation:`ai-spin .9s ease-in-out ${i*0.2}s infinite`}}/>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{borderTop:`1px solid ${C.border}`,padding:10,display:"flex",gap:8}}>
              <input
                className="ai-in"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Shkruani pyetjen tuaj..."
                style={{flex:1,padding:"8px 12px",fontSize:13}}
              />
              <button className="ai-btn" onClick={send} disabled={loading||!input.trim()}
                style={{padding:"8px 14px",borderRadius:9,background:input.trim()?C.dark:"#e8e2d6",color:input.trim()?"#f5f0e8":"#b0a890",fontSize:13,fontWeight:600,transition:"all .15s"}}>
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONTRACT SUMMARIZER
// ═══════════════════════════════════════════════════════════════════════════════
export function AiContractSummaryButton({ contract }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const summarize = async () => {
    setLoading(true);
    try {
      const r = await api.post("/api/ai/contract/summary", {
        contract_id: contract.id,
        property_id: contract.property_id,
        client_id:   contract.client_id,
        agent_id:    contract.agent_id,
        start_date:  contract.start_date,
        end_date:    contract.end_date,
        rent:        contract.rent,
        deposit:     contract.deposit,
        status:      contract.status,
      });
      setResult(r.data);
      setOpen(true);
    } catch(e) { alert("AI error: " + (e.response?.data?.message || "Please try again")); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <button className="ai-btn" onClick={summarize} disabled={loading}
        style={{padding:"5px 12px",borderRadius:8,background:"#f0fdf4",color:"#059669",border:"1px solid #86efac",fontSize:11.5,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>
        {loading ? <div style={{width:12,height:12,border:"2px solid #86efac",borderTop:"2px solid #059669",borderRadius:"50%",animation:"ai-spin .7s linear infinite"}}/> : "✨"} AI Summary
      </button>

      {open && result && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:C.surface,borderRadius:16,boxShadow:"0 32px 80px rgba(0,0,0,.35)",overflow:"hidden",animation:"ai-fade .22s ease"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{margin:0,fontSize:16,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>✨ AI Contract Summary #{contract.id}</p>
              <button onClick={()=>setOpen(false)} style={{border:"none",background:"none",color:C.muted,cursor:"pointer",fontSize:18}}>✕</button>
            </div>
            <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
              {[
                ["📋 Summary",               result.summary],
                ["📅 Key Dates",             result.key_dates],
                ["💰 Financial Obligations", result.financial_obligations],
                ["⚠️ Risks",                result.risks],
                ["📊 Status",               result.status_note],
              ].map(([l,v])=>(
                <div key={l} style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px"}}>
                  <p style={{margin:"0 0 4px",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px"}}>{l}</p>
                  <p style={{margin:0,fontSize:13.5,color:C.text,lineHeight:1.6}}>{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PAYMENT RISK PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export function AiPaymentRiskPanel({ clientId }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const RISK_CFG = {
    LOW:      { color:"#059669", bg:"#ecfdf5", bar:"#059669" },
    MEDIUM:   { color:"#d97706", bg:"#fffbeb", bar:"#d97706" },
    HIGH:     { color:"#ea580c", bg:"#fff7ed", bar:"#ea580c" },
    CRITICAL: { color:"#dc2626", bg:"#fef2f2", bar:"#dc2626" },
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/api/ai/payments/risk/${clientId}`);
      setResult(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cfg = result ? (RISK_CFG[result.risk_level] || RISK_CFG.MEDIUM) : null;

  return (
    <>
      <style>{CSS}</style>
      <div>
        <AiCard title="AI Payment Risk Analysis" icon="🚨">
          {!result ? (
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <p style={{fontSize:13,color:C.muted,marginBottom:14}}>Analyze this client's payment behavior and risk score.</p>
              <AiButton onClick={analyze} loading={loading}>Analyze Risk</AiButton>
            </div>
          ) : (
            <div className="ai-result">
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>Risk Score</span>
                  <span style={{background:cfg.bg,color:cfg.color,padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{result.risk_level} ({result.risk_score}/10)</span>
                </div>
                <div style={{height:8,background:"#e8e2d6",borderRadius:10,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${result.risk_score*10}%`,background:cfg.bar,borderRadius:10,transition:"width .5s ease"}}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                  <p style={{margin:0,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:3}}>Total Payments</p>
                  <p style={{margin:0,fontSize:20,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{result.total_payments}</p>
                </div>
                <div style={{background:"#fef2f2",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                  <p style={{margin:0,fontSize:10,color:"#9a3412",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:3}}>Overdue</p>
                  <p style={{margin:0,fontSize:20,fontWeight:700,color:"#dc2626",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{result.overdue_payments}</p>
                </div>
              </div>
              <div style={{background:cfg.bg,borderRadius:10,padding:"10px 14px",marginBottom:10}}>
                <p style={{margin:"0 0 4px",fontSize:10.5,color:cfg.color,fontWeight:600,textTransform:"uppercase"}}>Analysis</p>
                <p style={{margin:0,fontSize:13,color:C.text}}>{result.reasoning}</p>
              </div>
              <div style={{background:"#eff6ff",borderRadius:10,padding:"10px 14px"}}>
                <p style={{margin:"0 0 4px",fontSize:10.5,color:"#2563eb",fontWeight:600,textTransform:"uppercase"}}>Recommendation</p>
                <p style={{margin:0,fontSize:13,color:C.text}}>{result.recommendation}</p>
              </div>
              <button className="ai-btn" onClick={()=>setResult(null)}
                style={{marginTop:12,padding:"6px 14px",borderRadius:8,border:`1.5px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12}}>
                Re-analyze
              </button>
            </div>
          )}
        </AiCard>
      </div>
    </>
  );
}

