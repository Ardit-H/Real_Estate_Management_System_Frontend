import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { Field, Row2 } from "./ContractBadges";
import { CURRENCIES, INP_S, SEL_S, BTN_PRI, BTN_SEC, validateContractForm } from "./contractHelpers";

export default function ContractModal({ initial, initialPropertyId, initialListingId, initialClientId, onClose, onSuccess, notify }) {
  const [form,setForm]=useState({
    property_id: initial?.property_id ? String(initial.property_id) : (initialPropertyId||""),
    listing_id:  initial?.listing_id  ? String(initial.listing_id)  : (initialListingId||""),
    client_id:   initial?.client_id   ? String(initial.client_id)   : (initialClientId||""),
    start_date:  initial?.start_date  ?? "",
    end_date:    initial?.end_date    ?? "",
    rent:        initial?.rent        ? String(initial.rent) : "",
    deposit:     initial?.deposit     ? String(initial.deposit) : "",
    currency:    initial?.currency    ?? "EUR",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSubmit=async()=>{
    if(!validateContractForm(form,notify)) return;
    setSaving(true);
    try{
      const payload={
        property_id:Number(form.property_id),
        listing_id:form.listing_id?Number(form.listing_id):null,
        client_id:Number(form.client_id),
        start_date:form.start_date,
        end_date:form.end_date,
        rent:Number(form.rent),
        deposit:form.deposit?Number(form.deposit):null,
        currency:form.currency,
        contract_file_url:form.contract_file_url||null,
      };
      initial ? await api.put(`/api/contracts/lease/${initial.id}`,payload) : await api.post("/api/contracts/lease",payload);
      onSuccess();
    }catch(err){ notify(err.response?.data?.message||"Gabim gjatë ruajtjes","error"); }
    finally{ setSaving(false); }
  };

  const minEndDate=form.start_date?new Date(new Date(form.start_date).getTime()+86400000).toISOString().split("T")[0]:undefined;

  return (
    <Modal title={initial?`Edit Kontratë #${initial.id}`:"New Lease Contract"} onClose={onClose} wide>
      {(initialPropertyId||initialListingId)&&!initial&&(
        <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#a8923e"}}>
          📋 Po krijon kontratë{initialPropertyId&&` për Property #${initialPropertyId}`}{initialListingId&&` · Listing #${initialListingId}`}{initialClientId&&` · Client #${initialClientId}`}
        </div>
      )}
      <Row2>
        <Field label="Property ID" required hint="ID numerike e pronës"><input className="ac-in" style={INP_S} type="number" min="1" value={form.property_id} onChange={e=>set("property_id",e.target.value)} placeholder="42"/></Field>
        <Field label="Listing ID" hint="Opcionale"><input className="ac-in" style={INP_S} type="number" min="1" value={form.listing_id} onChange={e=>set("listing_id",e.target.value)} placeholder="(opcional)"/></Field>
      </Row2>
      <Field label="Client ID" required><input className="ac-in" style={INP_S} type="number" min="1" value={form.client_id} onChange={e=>set("client_id",e.target.value)} placeholder="ID e klientit"/></Field>
      <Row2>
        <Field label="Data fillimit" required><input className="ac-in" style={INP_S} type="date" value={form.start_date} onChange={e=>set("start_date",e.target.value)}/></Field>
        <Field label="Data mbarimit" required><input className="ac-in" style={INP_S} type="date" value={form.end_date} onChange={e=>set("end_date",e.target.value)} min={minEndDate}/></Field>
      </Row2>
      <Row2>
        <Field label="Qiraja mujore" required><input className="ac-in" style={INP_S} type="number" min="0.01" step="0.01" value={form.rent} onChange={e=>set("rent",e.target.value)} placeholder="450"/></Field>
        <Field label="Depozita"><input className="ac-in" style={INP_S} type="number" min="0" step="0.01" value={form.deposit} onChange={e=>set("deposit",e.target.value)} placeholder="900"/></Field>
      </Row2>
      <Row2>
        <Field label="Monedha"><select className="ac-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
        <Field label="URL Kontratë" hint="Duhet të fillojë me http/https"><input className="ac-in" style={INP_S} value={form.contract_file_url} onChange={e=>set("contract_file_url",e.target.value)} placeholder="https://..." maxLength={500}/></Field>
      </Row2>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke ruajtur...":initial?"Ruaj ndryshimet":"Krijo kontratë"}</button>
      </div>
    </Modal>
  );
}