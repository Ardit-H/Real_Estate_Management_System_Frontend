import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
      animation: "fadeUp .25s ease",
    }}>
      {msg}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function StarRating({ value = 0 }) {
  const stars = Math.round(Number(value) * 2) / 2;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="16" height="16" viewBox="0 0 24 24"
          fill={s <= stars ? "#f59e0b" : "#e2e8f0"}
          stroke={s <= stars ? "#f59e0b" : "#cbd5e1"}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}>
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ photoUrl, name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "AG";
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: "3px solid #eef2ff" }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #818cf8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.32, fontWeight: 600,
      border: "3px solid #eef2ff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{
        width: 32, height: 32, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentProfile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    phone: "", license: "", bio: "",
    experience_years: "", specialization: "", photo_url: "",
  });
  const [userForm, setUserForm] = useState({
    first_name: "", last_name: "", email: "",
  });
  const [pwForm, setPwForm] = useState({
    current_password: "", new_password: "", confirm: "",
  });
  const [savingPw, setSavingPw] = useState(false);

  const notify = (msg, type = "success") =>
    setToast({ msg, type, key: Date.now() });

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [meRes, profileRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/users/agents/me").catch(() => ({ data: null })),
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
            phone:            profileRes.data.phone            || "",
            license:          profileRes.data.license          || "",
            bio:              profileRes.data.bio              || "",
            experience_years: profileRes.data.experience_years || "",
            specialization:   profileRes.data.specialization   || "",
            photo_url:        profileRes.data.photo_url        || "",
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

  // ── Save agent profile ────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        phone:            profileForm.phone            || null,
        license:          profileForm.license          || null,
        bio:              profileForm.bio              || null,
        experience_years: profileForm.experience_years
          ? Number(profileForm.experience_years) : null,
        specialization:   profileForm.specialization   || null,
        photo_url:        profileForm.photo_url        || null,
      };
      const res = await api.put("/api/users/agents/me", payload);
      setProfile(res.data);
      notify("Profili u ruajt me sukses");
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Save user info ────────────────────────────────────────────────────────────
  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      const res = await api.put("/api/users/me", {
        first_name: userForm.first_name || null,
        last_name:  userForm.last_name  || null,
        email:      userForm.email      || null,
      });
      setUserInfo(res.data);
      notify("Të dhënat u ndryshua me sukses");
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSavingUser(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────────
  const handleChangePw = async () => {
    if (pwForm.new_password !== pwForm.confirm) {
      notify("Fjalëkalimet nuk përputhen", "error");
      return;
    }
    if (pwForm.new_password.length < 8) {
      notify("Fjalëkalimi duhet të ketë minimum 8 karaktere", "error");
      return;
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

  const setP = (k, v) => setProfileForm(p => ({ ...p, [k]: v }));
  const setU = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  const fullName = userInfo
    ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()
    : user?.fullName || "Agent";

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Menaxho profilin dhe kredencialet e tua</p>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── Sidebar card ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <Avatar photoUrl={profile?.photo_url} name={fullName} size={88} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{fullName}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 10 }}>
                  {userInfo?.email}
                </p>
                <span style={{
                  background: "#eef2ff", color: "#6366f1",
                  padding: "3px 12px", borderRadius: 20,
                  fontSize: 11.5, fontWeight: 500,
                }}>Agent</span>

                {profile && (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #e8edf4" }}>
                    <div style={{ marginBottom: 10 }}>
                      <StarRating value={profile.rating || 0} />
                      <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>
                        {profile.total_reviews || 0} vlerësime
                      </p>
                    </div>
                    {profile.specialization && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginTop: 8 }}>
                        🎯 {profile.specialization}
                      </p>
                    )}
                    {profile.experience_years != null && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                        📅 {profile.experience_years} vite përvojë
                      </p>
                    )}
                    {profile.phone && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                        📞 {profile.phone}
                      </p>
                    )}
                    {profile.license && (
                      <p style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                        📋 {profile.license}
                      </p>
                    )}
                  </div>
                )}

                {!profile && (
                  <div style={{
                    marginTop: 16, padding: "10px 14px",
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 8, fontSize: 12.5, color: "#92400e",
                  }}>
                    Profili i agjentit nuk është krijuar. Plotëso formularin.
                  </div>
                )}
              </div>
            </div>

            {/* Nav tabs */}
            <div className="card" style={{ overflow: "hidden" }}>
              {[
                { id: "profile", label: "Profili i Agjentit", icon: "👤" },
                { id: "account", label: "Llogaria", icon: "✉️" },
                { id: "password", label: "Fjalëkalimi", icon: "🔒" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 16px", border: "none", background: "none",
                    borderLeft: activeTab === tab.id ? "3px solid #6366f1" : "3px solid transparent",
                    color: activeTab === tab.id ? "#6366f1" : "#475569",
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
                    textAlign: "left", transition: "all .15s ease",
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <div>

            {/* TAB: Agent Profile */}
            {activeTab === "profile" && (
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">Profili i Agjentit</h2>
                  <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                    {profile ? "Ndrysho" : "Krijo"} profilin tënd profesional
                  </span>
                </div>
                <div className="card__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Telefon">
                      <input className="form-input" value={profileForm.phone}
                        onChange={e => setP("phone", e.target.value)}
                        placeholder="+38344123456" />
                    </Field>
                    <Field label="Licença">
                      <input className="form-input" value={profileForm.license}
                        onChange={e => setP("license", e.target.value)}
                        placeholder="REA-2024-001" />
                    </Field>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Specializimi">
                      <input className="form-input" value={profileForm.specialization}
                        onChange={e => setP("specialization", e.target.value)}
                        placeholder="Prona rezidenciale, Komerciale..." />
                    </Field>
                    <Field label="Vite Përvojë">
                      <input className="form-input" type="number" min="0" max="60"
                        value={profileForm.experience_years}
                        onChange={e => setP("experience_years", e.target.value)}
                        placeholder="0" />
                    </Field>
                  </div>
                  <Field label="Bio">
                    <textarea className="form-textarea" rows={4}
                      value={profileForm.bio}
                      onChange={e => setP("bio", e.target.value)}
                      placeholder="Rrëfim i shkurtër profesional..."
                      style={{
                        width: "100%", padding: "9px 12px",
                        border: "1px solid #cbd5e1", borderRadius: 10,
                        fontSize: 14, fontFamily: "inherit", resize: "vertical",
                        outline: "none",
                      }} />
                  </Field>
                  <Field label="URL e Fotos">
                    <input className="form-input" value={profileForm.photo_url}
                      onChange={e => setP("photo_url", e.target.value)}
                      placeholder="https://..." />
                  </Field>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button className="btn btn--primary" onClick={handleSaveProfile} disabled={saving}>
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
                  <div style={{
                    background: "#f8fafc", border: "1px solid #e8edf4",
                    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#64748b",
                  }}>
                    Roli: <strong style={{ color: "#6366f1" }}>Agent</strong> &nbsp;·&nbsp;
                    Tenant ID: <strong>{userInfo?.tenant_id}</strong> &nbsp;·&nbsp;
                    Status: <strong style={{ color: userInfo?.is_active ? "#059669" : "#dc2626" }}>
                      {userInfo?.is_active ? "Aktiv" : "Joaktiv"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                    <button className="btn btn--primary" onClick={handleSaveUser} disabled={savingUser}>
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
                  <Field label="Fjalëkalimi aktual" required>
                    <input className="form-input" type="password"
                      value={pwForm.current_password}
                      onChange={e => setPw("current_password", e.target.value)}
                      placeholder="••••••••" />
                  </Field>
                  <Field label="Fjalëkalimi i ri" required>
                    <input className="form-input" type="password"
                      value={pwForm.new_password}
                      onChange={e => setPw("new_password", e.target.value)}
                      placeholder="Min. 8 karaktere, shkronja + numër" />
                  </Field>
                  <Field label="Konfirmo fjalëkalimin" required>
                    <input className="form-input" type="password"
                      value={pwForm.confirm}
                      onChange={e => setPw("confirm", e.target.value)}
                      placeholder="••••••••" />
                  </Field>
                  {pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                    <p style={{ fontSize: 12.5, color: "#dc2626", marginTop: -10, marginBottom: 14 }}>
                      Fjalëkalimet nuk përputhen
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn btn--primary" onClick={handleChangePw}
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