import { useState } from "react";
import api from "../../api/axios";
import { createPortal } from "react-dom";

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
                <p style={{margin:0,fontSize:11,color:"rgba(245,240,232,.4)"}}>Powered by Groq • LLaMA 3.1</p>
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
    } catch(e) {
      alert("AI error: " + (e.response?.data?.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  const modal = open && result && createPortal(
    <div
      style={{
        position:"fixed", inset:0, zIndex:99999,
        background:"rgba(8,6,4,0.82)",
        backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, fontFamily:"'DM Sans',sans-serif",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width:"100%", maxWidth:560,
          background:"#faf7f2",
          borderRadius:20,
          boxShadow:"0 48px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,184,122,0.15)",
          overflow:"hidden",
          animation:"ai-fade .26s cubic-bezier(0.16,1,0.3,1)",
          maxHeight:"88vh", display:"flex", flexDirection:"column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 50%,#241e16 100%)",
          padding:"18px 22px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0, position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(201,184,122,0.15)",border:"1.5px solid rgba(201,184,122,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
              ✨
            </div>
            <div>
              <p style={{margin:0,fontSize:15,fontWeight:700,color:"#f5f0e8",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
                AI Contract Summary
              </p>
              <p style={{margin:0,fontSize:11,color:"rgba(245,240,232,0.38)"}}>
                Contract #{contract.id} · Powered by Groq
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{width:30,height:30,borderRadius:8,background:"rgba(245,240,232,0.08)",border:"1px solid rgba(245,240,232,0.12)",color:"rgba(245,240,232,0.55)",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
          >✕</button>
        </div>

        {/* Meta strip */}
        <div style={{background:"#f0ece3",borderBottom:"1.5px solid #e8e2d6",padding:"10px 22px",display:"flex",gap:24,flexWrap:"wrap",flexShrink:0}}>
          {[
            ["Property",  `#${contract.property_id}`],
            ["Client",    `#${contract.client_id}`],
            ["Rent",      `€${Number(contract.rent).toLocaleString("de-DE")}/mo`],
            ["Status",    contract.status],
          ].map(([l,v]) => (
            <div key={l} style={{display:"flex",flexDirection:"column",gap:1}}>
              <span style={{fontSize:9.5,fontWeight:700,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px"}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600,color:"#1a1714"}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{padding:"18px 22px",overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:10}}>
          {[
            { icon:"📋", label:"Summary",               value: result.summary },
            { icon:"📅", label:"Key Dates",             value: result.key_dates },
            { icon:"💰", label:"Financial Obligations", value: result.financial_obligations },
            { icon:"⚠️", label:"Risks",                 value: result.risks },
            { icon:"📊", label:"Status Note",           value: result.status_note },
          ].filter(s => s.value).map(({ icon, label, value }) => (
            <div key={label} style={{background:"#f8f5f0",border:"1.5px solid #ede9df",borderRadius:12,padding:"13px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.9px",textTransform:"uppercase",color:"#9a8c6e",marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
                <span>{icon}</span>{label}
              </div>
              <p style={{margin:0,fontSize:13.5,color:"#1a1714",lineHeight:1.65}}>{value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:"12px 22px",borderTop:"1.5px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fdf9f4",flexShrink:0}}>
          <span style={{fontSize:11.5,color:"#b0a890"}}>AI-generated · may not be 100% accurate</span>
          <button
            onClick={() => setOpen(false)}
            style={{padding:"8px 20px",borderRadius:9,background:"linear-gradient(135deg,#c9b87a,#b0983e)",border:"none",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
          >Close</button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <style>{CSS}</style>
      <button
        className="ai-btn"
        onClick={summarize}
        disabled={loading}
        style={{padding:"7px 14px",borderRadius:9,background:loading?"#f0fdf4":"linear-gradient(135deg,#d4f1e4,#bbedd6)",color:"#059669",border:"1.5px solid #86efac",fontSize:12.5,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,cursor:loading?"not-allowed":"pointer"}}
      >
        {loading
          ? <div style={{width:13,height:13,border:"2px solid #86efac",borderTop:"2px solid #059669",borderRadius:"50%",animation:"ai-spin .7s linear infinite"}}/>
          : <span style={{fontSize:14}}>✨</span>
        }
        {loading ? "Analyzing..." : "AI Summary"}
      </button>

      {modal}
    </>
  );
}

