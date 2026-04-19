import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axios";
import { BASE_URL } from "../../constants/propertyConstants";
import Modal from "./Modal";
import Toast from "./Toast";

export default function ImageManager({ property, onClose }) {
  const [images,    setImages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption,   setCaption]   = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [toast,     setToast]     = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadImages = useCallback(async () => {
    try {
      const r = await api.get(`/api/properties/${property.id}/images`);
      setImages(r.data);
    } catch { setImages([]); }
    finally { setLoading(false); }
  }, [property.id]);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setPreview({ file: f, url: URL.createObjectURL(f) });
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", preview.file);
      if (caption) fd.append("caption", caption);
      fd.append("primary", String(isPrimary));
      await api.post(`/api/properties/${property.id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Image uploaded!");
      setPreview(null); setCaption(""); setIsPrimary(false);
      if (fileRef.current) fileRef.current.value = "";
      loadImages();
    } catch (e) {
      showToast(e.response?.data?.message || "Upload failed", "error");
    } finally { setUploading(false); }
  };

  const handleSetPrimary = async (imgId) => {
    try {
      await api.patch(`/api/properties/${property.id}/images/${imgId}/primary`);
      showToast("Primary image set!");
      loadImages();
    } catch { showToast("Failed", "error"); }
  };

  const handleDelete = async (imgId) => {
    try {
      await api.delete(`/api/properties/${property.id}/images/${imgId}`);
      showToast("Image deleted.");
      loadImages();
    } catch { showToast("Failed", "error"); }
  };

  return (
    <Modal title={`Images — ${property.title}`} onClose={onClose} wide>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Upload area */}
      <div style={{ border:"2px dashed var(--border-medium)", borderRadius:"var(--radius-lg)", padding:20, marginBottom:20, background:"var(--surface-1)" }}>
        <div style={{ marginBottom:14, fontWeight:500, fontSize:13 }}>Upload New Image</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div>
            <input type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display:"none" }} />
            <button className="btn btn--secondary btn--sm" onClick={() => fileRef.current?.click()}>📂 Choose Image</button>
          </div>
          <div style={{ flex:1, minWidth:160 }}>
            <input className="form-input" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:"var(--text-secondary)", whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} />
            Set as primary
          </label>
          <button className="btn btn--primary btn--sm" onClick={handleUpload} disabled={!preview || uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {preview && (
          <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:12 }}>
            <img src={preview.url} alt="preview" style={{ width:80, height:60, objectFit:"cover", borderRadius:8, border:"1px solid var(--border-light)" }} />
            <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
              {preview.file.name}
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{(preview.file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>✕ Remove</button>
          </div>
        )}
      </div>

      {/* Image grid */}
      {loading ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>Loading images…</div>
      ) : images.length === 0 ? (
        <div style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>No images yet. Upload the first one above.</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
          {images.map(img => {
            const src = img.image_url?.startsWith("http") ? img.image_url : BASE_URL + img.image_url;
            return (
              <div key={img.id} style={{ borderRadius:"var(--radius-md)", overflow:"hidden", border: img.is_primary ? "2px solid var(--brand-500)" : "1px solid var(--border-light)", position:"relative" }}>
                <img src={src} alt={img.caption || "property"} style={{ width:"100%", height:120, objectFit:"cover", display:"block" }} />
                {img.is_primary && (
                  <div style={{ position:"absolute", top:6, left:6, background:"var(--brand-500)", color:"white", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>PRIMARY</div>
                )}
                <div style={{ padding:"8px 10px", background:"white" }}>
                  {img.caption && <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{img.caption}</div>}
                  <div style={{ display:"flex", gap:6 }}>
                    {!img.is_primary && (
                      <button className="btn btn--secondary btn--sm" style={{ fontSize:11, padding:"3px 8px" }} onClick={() => handleSetPrimary(img.id)}>★ Primary</button>
                    )}
                    <button className="btn btn--danger btn--sm" style={{ fontSize:11, padding:"3px 8px", marginLeft:"auto" }} onClick={() => handleDelete(img.id)}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
