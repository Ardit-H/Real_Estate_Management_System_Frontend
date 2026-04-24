import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
      animation: "fadeUp .25s ease",
    }}>{msg}</div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: 32, height: 32, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #10b981",
        borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Avatar({ photoUrl, name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "CL";
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name}
        style={{ width: size, height: size, borderRadius: "50%",
          objectFit: "cover", border: "3px solid #d1fae5" }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #10b981, #34d399)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.32, fontWeight: 600,
      border: "3px solid #d1fae5", flexShrink: 0,
    }}>{initials}</div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientProfile() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [toast, setToast] = useState(null);

  // Data
  const [userInfo, setUserInfo]   = useState(null);
  const [profile, setProfile]     = useState(null);

  // Forms
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "" });
  const [profileForm, setProfileForm] = useState({
    phone: "", preferred_contact: "EMAIL",
    budget_min: "", budget_max: "",
    preferred_type: "", preferred_city: "", photo_url: "",
  });
  const [pwForm, setPwForm] = useState({
    current_password: "", new_password: "", confirm: "",
  });

  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  const setU  = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setP  = (k, v) => setProfileForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [meRes, profileRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/users/clients/me").catch(() => ({ data: null })),
        ]);
        setUserInfo(meRes.data);
        setUserForm({
          first_name: meRes.data.first_name || "",
          last_name:  meRes.data.last_name  || "",
          email:      meRes.data.email      || "",
        });
        if (profileRes.data) {
          setProfile(profileRes.data);
          setProfileForm({
            phone:             profileRes.data.phone             || "",
            preferred_contact: profileRes.data.preferred_contact || "EMAIL",
            budget_min:        profileRes.data.budget_min        ?? "",
            budget_max:        profileRes.data.budget_max        ?? "",
            preferred_type:    profileRes.data.preferred_type    || "",
            preferred_city:    profileRes.data.preferred_city    || "",
            photo_url:         profileRes.data.photo_url         || "",
          });
        }
      } catch {
        notify("Gabim gjatë ngarkimit të profilit", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Save client profile — PUT /api/users/clients/me ─────────────────────────
  const handleSaveProfile = async () => {
    // Frontend validation (mirrors ClientProfileService)
    if (profileForm.budget_min && profileForm.budget_max) {
      if (Number(profileForm.budget_min) > Number(profileForm.budget_max)) {
        notify("Buxheti minimal nuk mund të jetë më i madh se maksimali", "error");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await api.put("/api/users/clients/me", {
        phone:             profileForm.phone             || null,
        preferred_contact: profileForm.preferred_contact || null,
        budget_min:        profileForm.budget_min !== "" ? Number(profileForm.budget_min) : null,
        budget_max:        profileForm.budget_max !== "" ? Number(profileForm.budget_max) : null,
        preferred_type:    profileForm.preferred_type    || null,
        preferred_city:    profileForm.preferred_city    || null,
        photo_url:         profileForm.photo_url         || null,
      });
      setProfile(res.data);
      notify("Profili u ruajt me sukses");
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Save user info — PUT /api/users/me ──────────────────────────────────────
  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      const res = await api.put("/api/users/me", {
        first_name: userForm.first_name || null,
        last_name:  userForm.last_name  || null,
        email:      userForm.email      || null,
      });
      setUserInfo(res.data);
      notify("Të dhënat u ndryshuan me sukses");
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSavingUser(false);
    }
  };

  // ── Change password — PATCH /api/users/me/password ─────────────────────────
  const handleChangePw = async () => {
    if (pwForm.new_password !== pwForm.confirm) {
      notify("Fjalëkalimet nuk përputhen", "error"); return;
    }
    if (pwForm.new_password.length < 8) {
      notify("Fjalëkalimi duhet të ketë minimum 8 karaktere", "error"); return;
    }
    setSavingPw(true);
    try {
      await api.patch("/api/users/me/password", {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      notify("Fjalëkalimi u ndryshua me sukses");
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit", "error");
    } finally {
      setSavingPw(false);
    }
  };

  const fullName = userInfo
    ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()
    : user?.fullName || "Client";

  const TABS = [
    { id: "profile",  label: "Profili im",    icon: "👤" },
    { id: "account",  label: "Llogaria",       icon: "✉️" },
    { id: "password", label: "Fjalëkalimi",    icon: "🔒" },
  ];

  return (
    <MainLayout role="client">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Profili im</h1>
          <p className="page-subtitle">Menaxho preferencat dhe të dhënat e tua</p>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Avatar card */}
            <div className="card">
              <div style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <Avatar photoUrl={profile?.photo_url} name={fullName} size={88} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{fullName}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 10 }}>
                  {userInfo?.email}
                </p>
                <span style={{ background: "#ecfdf5", color: "#10b981",
                  padding: "3px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                  Client
                </span>

                {profile && (
                  <div style={{ marginTop: 18, paddingTop: 18,
                    borderTop: "1px solid #e8edf4", textAlign: "left" }}>
                    {profile.preferred_city && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 6 }}>
                        📍 {profile.preferred_city}
                      </p>
                    )}
                    {profile.preferred_type && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 6 }}>
                        🏠 {profile.preferred_type}
                      </p>
                    )}
                    {(profile.budget_min || profile.budget_max) && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 6 }}>
                        💰 {profile.budget_min ? `€${Number(profile.budget_min).toLocaleString("de-DE")}` : "—"}
                        {" → "}
                        {profile.budget_max ? `€${Number(profile.budget_max).toLocaleString("de-DE")}` : "—"}
                      </p>
                    )}
                    {profile.phone && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 6 }}>
                        📞 {profile.phone}
                      </p>
                    )}
                    {profile.preferred_contact && (
                      <p style={{ fontSize: 12.5, color: "#475569" }}>
                        ✉️ Kontakt: {profile.preferred_contact}
                      </p>
                    )}
                  </div>
                )}

                {!profile && (
                  <div style={{ marginTop: 16, padding: "10px 14px",
                    background: "#ecfdf5", border: "1px solid #a7f3d0",
                    borderRadius: 8, fontSize: 12.5, color: "#065f46" }}>
                    Plotëso profilin tënd për të personalizuar shërbimin
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <div className="card" style={{ overflow: "hidden" }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 16px", border: "none", background: "none",
                  borderLeft: activeTab === tab.id ? "3px solid #10b981" : "3px solid transparent",
                  color: activeTab === tab.id ? "#10b981" : "#475569",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main ──────────────────────────────────────────────────────── */}
          <div>

            {/* TAB: Client Profile */}
            {activeTab === "profile" && (
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">Profili im</h2>
                  <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                    {profile ? "Ndrysho" : "Krijo"} preferencat tua
                  </span>
                </div>
                <div className="card__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Telefon">
                      <input className="form-input" value={profileForm.phone}
                        onChange={e => setP("phone", e.target.value)}
                        placeholder="+38344123456" />
                    </Field>
                    <Field label="Mënyra e preferuar e kontaktit">
                      <select className="form-select" value={profileForm.preferred_contact}
                        onChange={e => setP("preferred_contact", e.target.value)}>
                        <option value="EMAIL">✉️ Email</option>
                        <option value="PHONE">📞 Telefon</option>
                        <option value="WHATSAPP">💬 WhatsApp</option>
                      </select>
                    </Field>
                  </div>

                  <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 10, padding: "14px 16px", marginBottom: 14,
                  }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: "#166534",
                      marginBottom: 10 }}>
                      💰 Buxheti i preferuar (€)
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Minimal">
                        <input className="form-input" type="number" min="0"
                          value={profileForm.budget_min}
                          onChange={e => setP("budget_min", e.target.value)}
                          placeholder="p.sh. 50000" />
                      </Field>
                      <Field label="Maksimal">
                        <input className="form-input" type="number" min="0"
                          value={profileForm.budget_max}
                          onChange={e => setP("budget_max", e.target.value)}
                          placeholder="p.sh. 200000" />
                      </Field>
                    </div>
                    {profileForm.budget_min && profileForm.budget_max &&
                      Number(profileForm.budget_min) > Number(profileForm.budget_max) && (
                      <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
                        ⚠️ Buxheti minimal nuk mund të jetë më i madh se maksimali
                      </p>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Tipi i pronës së preferuar"
                      hint="p.sh. APARTMENT, HOUSE, VILLA, COMMERCIAL">
                      <input className="form-input" value={profileForm.preferred_type}
                        onChange={e => setP("preferred_type", e.target.value)}
                        placeholder="p.sh. APARTMENT" />
                    </Field>
                    <Field label="Qyteti i preferuar">
                      <input className="form-input" value={profileForm.preferred_city}
                        onChange={e => setP("preferred_city", e.target.value)}
                        placeholder="p.sh. Prishtinë" />
                    </Field>
                  </div>

                  <Field label="URL e fotos së profilit">
                    <input className="form-input" value={profileForm.photo_url}
                      onChange={e => setP("photo_url", e.target.value)}
                      placeholder="https://..." />
                  </Field>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button className="btn btn--primary"
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Duke ruajtur..." : profile ? "Ruaj ndryshimet" : "Krijo profilin"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Account */}
            {activeTab === "account" && (
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">Të dhënat e llogarisë</h2>
                </div>
                <div className="card__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Emri">
                      <input className="form-input" value={userForm.first_name}
                        onChange={e => setU("first_name", e.target.value)} />
                    </Field>
                    <Field label="Mbiemri">
                      <input className="form-input" value={userForm.last_name}
                        onChange={e => setU("last_name", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Email">
                    <input className="form-input" type="email" value={userForm.email}
                      onChange={e => setU("email", e.target.value)} />
                  </Field>
                  <div style={{ background: "#f8fafc", border: "1px solid #e8edf4",
                    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                    Roli: <strong style={{ color: "#10b981" }}>Client</strong> &nbsp;·&nbsp;
                    Tenant ID: <strong>{userInfo?.tenant_id}</strong> &nbsp;·&nbsp;
                    Status: <strong style={{ color: userInfo?.is_active ? "#059669" : "#dc2626" }}>
                      {userInfo?.is_active ? "Aktiv" : "Joaktiv"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                    <button className="btn btn--primary"
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={handleSaveUser} disabled={savingUser}>
                      {savingUser ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Password */}
            {activeTab === "password" && (
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">Ndrysho fjalëkalimin</h2>
                </div>
                <div className="card__body">
                  <Field label="Fjalëkalimi aktual">
                    <input className="form-input" type="password"
                      value={pwForm.current_password}
                      onChange={e => setPw("current_password", e.target.value)}
                      placeholder="••••••••" />
                  </Field>
                  <Field label="Fjalëkalimi i ri">
                    <input className="form-input" type="password"
                      value={pwForm.new_password}
                      onChange={e => setPw("new_password", e.target.value)}
                      placeholder="Min. 8 karaktere, shkronja + numër" />
                  </Field>
                  <Field label="Konfirmo fjalëkalimin">
                    <input className="form-input" type="password"
                      value={pwForm.confirm}
                      onChange={e => setPw("confirm", e.target.value)}
                      placeholder="••••••••" />
                  </Field>
                  {pwForm.new_password && pwForm.confirm &&
                    pwForm.new_password !== pwForm.confirm && (
                    <p style={{ fontSize: 12.5, color: "#dc2626", marginTop: -10, marginBottom: 14 }}>
                      Fjalëkalimet nuk përputhen
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn btn--primary"
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={handleChangePw}
                      disabled={savingPw || !pwForm.current_password || !pwForm.new_password}>
                      {savingPw ? "Duke ndryshuar..." : "Ndrysho fjalëkalimin"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}