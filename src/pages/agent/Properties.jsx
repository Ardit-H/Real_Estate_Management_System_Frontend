import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

import StatCard      from "../../components/agent/StatCard";
import Toast         from "../../components/agent/Toast";
import Modal         from "../../components/agent/Modal";
import PropertyForm  from "../../components/agent/PropertyForm";
import ImageManager  from "../../components/agent/ImageManager";
import PriceHistory  from "../../components/agent/PriceHistory";
import PropertyTable from "../../components/agent/PropertyTable";
import { STATUS_CONFIG } from "../../constants/propertyConstants";

export default function AgentProperties() {
  const { user } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [modal,      setModal]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const showToast  = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const openModal  = (type, prop) => { setSelected(prop); setModal(type); };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProperties = useCallback(async (p = 0) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/properties/agent/${user.id}`, { params: { page: p, size: 10 } });
      setProperties(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch { setError("Could not load properties."); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchProperties(0); }, [fetchProperties]);

  // ── Stats ──────────────────────────────────────────────────
  const stats = {
    total:     properties.length,
    available: properties.filter(p => p.status === "AVAILABLE").length,
    rented:    properties.filter(p => p.status === "RENTED").length,
    sold:      properties.filter(p => p.status === "SOLD").length,
    views:     properties.reduce((s, p) => s + (p.view_count || 0), 0),
  };

  // ── CRUD handlers ──────────────────────────────────────────
  const handleCreate = async (data) => {
    setSaving(true);
    try { await api.post("/api/properties", data); showToast("Property created!"); closeModal(); fetchProperties(0); }
    catch (e) { showToast(e.response?.data?.message || "Create failed", "error"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try { await api.put(`/api/properties/${selected.id}`, data); showToast("Property updated!"); closeModal(); fetchProperties(page); }
    catch (e) { showToast(e.response?.data?.message || "Update failed", "error"); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try { await api.patch(`/api/properties/${selected.id}/status`, { status: newStatus }); showToast("Status updated!"); closeModal(); fetchProperties(page); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await api.delete(`/api/properties/${selected.id}`); showToast("Property deleted."); closeModal(); fetchProperties(0); }
    catch (e) { showToast(e.response?.data?.message || "Delete failed", "error"); }
    finally { setSaving(false); }
  };

  // ──────────────────────────────────────────────────────────
  return (
    <MainLayout role="agent">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Properties</h1>
          <p className="page-subtitle">Manage and track your property listings</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal("create", null)}>
          <span style={{ fontSize:16 }}>+</span> Add Property
        </button>
      </div>

      <div className="stat-grid">
        <StatCard icon="🏠" label="Total Listings" value={stats.total}     color="#6366f1" />
        <StatCard icon="✅" label="Available"       value={stats.available} color="#059669" />
        <StatCard icon="🔑" label="Rented"          value={stats.rented}    color="#2563eb" />
        <StatCard icon="💰" label="Sold"            value={stats.sold}      color="#d97706" />
        <StatCard icon="👁" label="Total Views"     value={stats.views}     color="#7c3aed" />
      </div>

      <div className="card">
        <div className="card__header">
          <span className="card__title">Property Listings</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>
            {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
          </span>
        </div>
        <PropertyTable
          properties={properties}
          page={page}
          totalPages={totalPages}
          onPageChange={fetchProperties}
          onAction={openModal}
          loading={loading}
          error={error}
          onRetry={() => fetchProperties(0)}
        />
      </div>

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Add New Property" onClose={closeModal} wide>
          <PropertyForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title={`Edit: ${selected.title}`} onClose={closeModal} wide>
          <PropertyForm initial={selected} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}

      {modal === "images"  && selected && <ImageManager property={selected} onClose={closeModal} />}
      {modal === "history" && selected && <PriceHistory propertyId={selected.id} onClose={closeModal} />}

      {modal === "status" && selected && (
        <Modal title="Change Status" onClose={closeModal}>
          <p style={{ marginBottom:20, color:"var(--text-secondary)", fontSize:13.5 }}>
            Current status of <strong>{selected.title}</strong>:&nbsp;
            <span className={`badge ${STATUS_CONFIG[selected.status]?.cls}`}>{STATUS_CONFIG[selected.status]?.label}</span>
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} className="btn btn--secondary"
                style={{ justifyContent:"flex-start", background: selected.status===key ? "var(--brand-50)" : undefined, borderColor: selected.status===key ? "var(--brand-400)" : undefined, color: selected.status===key ? "var(--brand-600)" : undefined }}
                onClick={() => handleStatusChange(key)} disabled={saving || selected.status===key}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                {selected.status===key && <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)" }}>current</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Property" onClose={closeModal}>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
            <p style={{ fontWeight:600, marginBottom:8 }}>Are you sure?</p>
            <p style={{ color:"var(--text-secondary)", fontSize:13.5, marginBottom:24 }}>
              "<strong>{selected.title}</strong>" will be soft-deleted and hidden from listings.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
}
