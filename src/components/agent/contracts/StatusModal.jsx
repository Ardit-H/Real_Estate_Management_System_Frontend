import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { StatusBadge, Field } from "./ContractBadges";
import { LEASE_STATUSES, SEL_S, BTN_PRI, BTN_SEC } from "./contractHelpers";

export default function StatusModal({ contract, onClose, onSuccess, notify }) {
  const [status,setStatus]=useState("ACTIVE");
  const [saving,setSaving]=useState(false);

  const handleSubmit=async()=>{
    setSaving(true);
    try{
      await api.patch(`/api/contracts/lease/${contract.id}/status`,{status});
      onSuccess();
    }catch(err){ notify(err.response?.data?.message||"Gabim","error"); }
    finally{ setSaving(false); }
  };

  const commissionTotal=contract.rent
    ? (Number(contract.rent)*0.03).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})
    : null;

  return (
    <Modal title={`Ndrysho statusin — Kontratë #${contract.id}`} onClose={onClose}>
      <p style={{fontSize:13.5,color:"#6b6248",marginBottom:16}}>Statusi aktual: <StatusBadge status={contract.status}/></p>
      <Field label="Statusi i ri">
        <select className="ac-in" style={SEL_S} value={status} onChange={e=>setStatus(e.target.value)}>
          {LEASE_STATUSES.filter(s=>s!==contract.status).map(s=><option key={s}>{s}</option>)}
        </select>
      </Field>
      {status==="ACTIVE"&&contract.status==="PENDING_SIGNATURE"&&(
        <div style={{background:"rgba(126,184,164,0.08)",border:"1.5px solid rgba(126,184,164,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#2a6049"}}>
          💡 Duke shënuar ACTIVE, sistemi do të krijojë automatikisht pagesat e komisionit (3% e qirasë mujore{commissionTotal?` = €${commissionTotal}`:""}).
        </div>
      )}
      {(status==="CANCELLED"||status==="ENDED")&&(
        <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#a8923e"}}>
          ⚠️ Ky veprim nuk mund të kthehet pas konfirmimit.
        </div>
      )}
      <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={{...BTN_PRI,...(status==="CANCELLED"?{background:"#8b3a1c"}:{})}} onClick={handleSubmit} disabled={saving}>
          {saving?"Duke ndryshuar...":`Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}