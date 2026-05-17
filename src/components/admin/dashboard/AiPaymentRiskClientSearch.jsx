import { useState } from "react";
import PaymentRiskPanel from "./PaymentRiskPanel";
import { C } from "./dashboardConstants";

export default function AiPaymentRiskClientSearch() {
  const [inputVal, setInputVal] = useState("");
  const [clientId, setClientId] = useState(null);

  const handleAnalyze = () => {
    const id = parseInt(inputVal, 10);
    if (id > 0) setClientId(id);
  };

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,maxWidth:420}}>
        <input
          className="risk-input"
          type="number" min="1"
          placeholder="Enter client ID..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
        />
        <button className="ad-btn" onClick={handleAnalyze} disabled={!inputVal}
          style={{padding:"9px 18px",borderRadius:9,background:inputVal?C.dark:"#e8e2d6",color:inputVal?C.goldL:C.textMut,fontSize:13,fontWeight:600,border:`1px solid ${inputVal?C.gold+"40":"transparent"}`,flexShrink:0}}>
          ✨ Analyze
        </button>
        {clientId && (
          <button className="ad-btn" onClick={() => { setClientId(null); setInputVal(""); }}
            style={{padding:"9px 14px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"transparent",color:C.textSub,fontSize:13,fontWeight:500,flexShrink:0}}>
            Clear
          </button>
        )}
      </div>
      {clientId && <PaymentRiskPanel key={clientId} clientId={clientId} />}
    </div>
  );
}