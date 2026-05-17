import { useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { CSS } from "../../components/admin/sales/salesConstants.js";
import { Toast, Tabs } from "../../components/admin/sales/SalesUI.jsx";
import { ListingsSection } from "../../components/admin/sales/ListingsSection.jsx";
import { ContractsSection } from "../../components/admin/sales/ContractsSection.jsx";
import { PaymentsSection } from "../../components/admin/sales/PaymentsSection.jsx";
 
export default function AdminSales() {
  const [tab, setTab]     = useState("listings");
  const [toast, setToast] = useState(null);
  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill,  setPaymentPrefill]  = useState(null);
 
  const notify      = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
  const goToContract = (pf) => { setContractPrefill(pf); setTab("contracts"); };
  const goToPayment  = (pf) => { setPaymentPrefill(pf);  setTab("payments");  };
 
  return (
    <MainLayout role="admin">
      <div style={{ backgroundColor: "#f2ede4", minHeight: "100vh", padding: 24 }}>
        <style>{CSS}</style>
        <div className="as-wrap" style={{ padding: "1.5rem 0" }}>
 
          {/* ── Hero ── */}
          <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", borderRadius:16, padding:"28px 28px 24px", marginBottom:22, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
            <div style={{ position:"relative" }}>
              <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:700, color:"#f5f0e8", margin:"0 0 4px", letterSpacing:"-0.4px" }}>Sales Management</h1>
              <p style={{ fontSize:13, color:"rgba(245,240,232,0.35)", margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>
                Admin view — full control over sale listings, contracts and payments.
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", padding:"10px 14px", background:"rgba(201,184,122,0.06)", borderRadius:9, border:"1px solid rgba(201,184,122,0.12)", fontSize:13 }}>
                {["🏷️ 1. Listing","────","📄 2. Contract","────","💳 3. Payment"].map((t,i) => (
                  <span key={i} style={{ fontWeight:t.includes(".")?"600":"400", color:t.includes(".")?((t.includes("1")&&tab==="listings")||(t.includes("2")&&tab==="contracts")||(t.includes("3")&&tab==="payments"))?"#c9b87a":"rgba(245,240,232,0.28)":"rgba(201,184,122,0.25)", fontFamily:"'DM Sans',sans-serif" }}>{t}</span>
                ))}
                <span style={{ marginLeft:"auto", color:"rgba(201,184,122,0.5)", fontSize:11.5, fontFamily:"'DM Sans',sans-serif" }}>
                  Click "Contract →" or "Payments →" for quick workflow
                </span>
              </div>
            </div>
          </div>
 
          <Tabs active={tab} onChange={setTab} />
 
          {tab === "listings"  && <ListingsSection  onGoContract={goToContract} notify={notify} />}
          {tab === "contracts" && <ContractsSection prefill={contractPrefill} onGoPayment={goToPayment} notify={notify} />}
          {tab === "payments"  && <PaymentsSection  prefill={paymentPrefill} notify={notify} />}
 
          {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
        </div>
      </div>
    </MainLayout>
  );
}
 