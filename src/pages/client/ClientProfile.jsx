import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#f0ece3", borderRadius: 14, height: 280, animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ background: "#f0ece3", borderRadius: 14, height: 140, animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>
      <div style={{ background: "#f0ece3", borderRadius: 14, height: 420, animation: "pulse 1.4s ease-in-out infinite" }} />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#a0997e", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inp = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #d9d4c7",
  borderRadius: "8px", fontSize: "13.5px", color: "#2c2c1e",
  background: "#fff", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", transition: "border-color 0.15s",
};
const sel = { ...inp, cursor: "pointer" };

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ photoUrl, name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "CL";
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "3px solid #a3c9b0" }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #5a5f3a, #3d4228)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#c8ccaa", fontSize: size * 0.32, fontWeight: 700,
      border: "3px solid #a3c9b0", flexShrink: 0,
    }}>{initials}</div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientProfile() {
  const { user } = useContext(AuthContext);
  const [activeTab,   setActiveTab]   = useState("profile");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [savingUser,  setSavingUser]  = useState(false);
  const [savingPw,    setSavingPw]    = useState(false);
  const [toast,       setToast]       = useState(null);
  const [userInfo,    setUserInfo]    = useState(null);
  const [profile,     setProfile]     = useState(null);

  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "" });
  const [profileForm, setProfileForm] = useState({
    phone: "", preferred_contact: "EMAIL",
    budget_min: "", budget_max: "",
    preferred_type: "", preferred_city: "", photo_url: "",
  });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });

  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  const setU   = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setP   = (k, v) => setProfileForm(p => ({ ...p, [k]: v }));
  const setPw  = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

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

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (profileForm.budget_min && profileForm.budget_max) {
      if (Number(profileForm.budget_min) > Number(profileForm.budget_max)) {
        notify("Buxheti minimal nuk mund të jetë më i madh se maksimali", "error"); return;
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
    } finally { setSaving(false); }
  };

  // ── Save user ───────────────────────────────────────────────────────────────
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
    } finally { setSavingUser(false); }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePw = async () => {
    if (pwForm.new_password !== pwForm.confirm) { notify("Fjalëkalimet nuk përputhen", "error"); return; }
    if (pwForm.new_password.length < 8)         { notify("Fjalëkalimi duhet të ketë minimum 8 karaktere", "error"); return; }
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
    } finally { setSavingPw(false); }
  };

  const fullName = userInfo
    ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()
    : user?.fullName || "Client";

  const TABS = [
    { id: "profile",  label: "Profili im",  icon: "👤" },
    { id: "account",  label: "Llogaria",    icon: "✉️" },
    { id: "password", label: "Fjalëkalimi", icon: "🔒" },
  ];

  // ── Save button (shared style) ──────────────────────────────────────────────
  const SaveBtn = ({ onClick, disabled, label, loading: l }) => (
    <button onClick={onClick} disabled={disabled || l}
      style={{ padding: "9px 22px", borderRadius: "10px", border: "none", background: (disabled || l) ? "#a3a380" : "linear-gradient(135deg,#5a5f3a,#3d4228)", color: "#fff", fontSize: "13.5px", fontWeight: 700, cursor: (disabled || l) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
      {l ? "Duke ruajtur..." : label}
    </button>
  );

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          {!loading && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar photoUrl={profile?.photo_url} name={fullName} size={80} />
            </div>
          )}
          <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            {fullName || "Profili im"}
          </h1>
          <p style={{ margin: "0 0 10px", color: "#c8ccaa", fontSize: "14px" }}>
            {userInfo?.email}
          </p>
          <span style={{ background: "rgba(255,255,255,0.15)", color: "#c8ccaa", border: "1px solid rgba(255,255,255,0.25)", padding: "3px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            Client
          </span>

          {/* Quick info pills */}
          {profile && (
            <div style={{ display: "flex", gap: "10px", maxWidth: "520px", margin: "20px auto 0", justifyContent: "center", flexWrap: "wrap" }}>
              {profile.preferred_city && (
                <div style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12.5, color: "#c8ccaa" }}>
                  📍 {profile.preferred_city}
                </div>
              )}
              {profile.preferred_type && (
                <div style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12.5, color: "#c8ccaa" }}>
                  🏠 {profile.preferred_type}
                </div>
              )}
              {(profile.budget_min || profile.budget_max) && (
                <div style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12.5, color: "#c8ccaa" }}>
                  💰 {profile.budget_min ? `€${Number(profile.budget_min).toLocaleString("de-DE")}` : "—"} → {profile.budget_max ? `€${Number(profile.budget_max).toLocaleString("de-DE")}` : "—"}
                </div>
              )}
              {profile.phone && (
                <div style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12.5, color: "#c8ccaa" }}>
                  📞 {profile.phone}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 24px", maxWidth: "1000px", margin: "0 auto" }}>
          {loading ? <Skeleton /> : (
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>

              {/* ── Sidebar nav ── */}
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #ede9df", overflow: "hidden", boxShadow: "0 2px 12px rgba(90,95,58,0.08)" }}>
                {TABS.map((tab, i) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "13px 18px", border: "none", background: activeTab === tab.id ? "#f5f2eb" : "#fff",
                      borderLeft: `3px solid ${activeTab === tab.id ? "#5a5f3a" : "transparent"}`,
                      color: activeTab === tab.id ? "#2c2c1e" : "#8a8469",
                      fontWeight: activeTab === tab.id ? 700 : 400,
                      fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left",
                      borderBottom: i < TABS.length - 1 ? "1px solid #f0ece3" : "none",
                      transition: "all 0.15s",
                    }}>
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Main panel ── */}
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #ede9df", overflow: "hidden", boxShadow: "0 2px 12px rgba(90,95,58,0.08)" }}>

                {/* Panel header — same strip pattern */}
                <div style={{ height: "4px", background: "linear-gradient(90deg, #5a5f3a, #a3a380)" }} />
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0ece3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#2c2c1e" }}>
                      {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                    </h2>
                    {activeTab === "profile" && (
                      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#a0997e" }}>
                        {profile ? "Ndrysho preferencat tua" : "Krijo profilin tënd"}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ padding: "22px 24px" }}>

                  {/* ── TAB: Profile ── */}
                  {activeTab === "profile" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Field label="Telefon">
                          <input style={inp} value={profileForm.phone} onChange={e => setP("phone", e.target.value)} placeholder="+38344123456" />
                        </Field>
                        <Field label="Mënyra e preferuar e kontaktit">
                          <select style={sel} value={profileForm.preferred_contact} onChange={e => setP("preferred_contact", e.target.value)}>
                            <option value="EMAIL">✉️ Email</option>
                            <option value="PHONE">📞 Telefon</option>
                            <option value="WHATSAPP">💬 WhatsApp</option>
                          </select>
                        </Field>
                      </div>

                      {/* Budget section */}
                      <div style={{ background: "#f5f2eb", border: "1px solid #e5e0d4", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#5a5f3a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                          💰 Buxheti i preferuar (€)
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <Field label="Minimal">
                            <input style={inp} type="number" min="0" value={profileForm.budget_min} onChange={e => setP("budget_min", e.target.value)} placeholder="p.sh. 50000" />
                          </Field>
                          <Field label="Maksimal">
                            <input style={inp} type="number" min="0" value={profileForm.budget_max} onChange={e => setP("budget_max", e.target.value)} placeholder="p.sh. 200000" />
                          </Field>
                        </div>
                        {profileForm.budget_min && profileForm.budget_max &&
                          Number(profileForm.budget_min) > Number(profileForm.budget_max) && (
                          <p style={{ fontSize: 12, color: "#8b4513", marginTop: 6 }}>
                            ⚠️ Buxheti minimal nuk mund të jetë më i madh se maksimali
                          </p>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Field label="Tipi i pronës së preferuar" hint="p.sh. APARTMENT, HOUSE, VILLA">
                          <input style={inp} value={profileForm.preferred_type} onChange={e => setP("preferred_type", e.target.value)} placeholder="p.sh. APARTMENT" />
                        </Field>
                        <Field label="Qyteti i preferuar">
                          <input style={inp} value={profileForm.preferred_city} onChange={e => setP("preferred_city", e.target.value)} placeholder="p.sh. Prishtinë" />
                        </Field>
                      </div>

                      <Field label="URL e fotos së profilit">
                        <input style={inp} value={profileForm.photo_url} onChange={e => setP("photo_url", e.target.value)} placeholder="https://..." />
                      </Field>

                      {!profile && (
                        <div style={{ background: "#edf5f0", border: "1px solid #a3c9b0", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#2a6049", marginBottom: 14 }}>
                          Plotëso profilin tënd për të personalizuar shërbimin
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f0ece3", paddingTop: 16, marginTop: 8 }}>
                        <SaveBtn onClick={handleSaveProfile} loading={saving} label={profile ? "Ruaj ndryshimet" : "Krijo profilin"} />
                      </div>
                    </>
                  )}

                  {/* ── TAB: Account ── */}
                  {activeTab === "account" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Field label="Emri">
                          <input style={inp} value={userForm.first_name} onChange={e => setU("first_name", e.target.value)} />
                        </Field>
                        <Field label="Mbiemri">
                          <input style={inp} value={userForm.last_name} onChange={e => setU("last_name", e.target.value)} />
                        </Field>
                      </div>
                      <Field label="Email">
                        <input style={inp} type="email" value={userForm.email} onChange={e => setU("email", e.target.value)} />
                      </Field>

                      {/* Info row */}
                      <div style={{ background: "#f5f2eb", border: "1px solid #e5e0d4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6b6651", marginBottom: 14 }}>
                        Roli: <strong style={{ color: "#2a6049" }}>Client</strong> &nbsp;·&nbsp;
                        Tenant ID: <strong>{userInfo?.tenant_id}</strong> &nbsp;·&nbsp;
                        Status: <strong style={{ color: userInfo?.is_active ? "#2a6049" : "#8b4513" }}>
                          {userInfo?.is_active ? "Aktiv" : "Joaktiv"}
                        </strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f0ece3", paddingTop: 16 }}>
                        <SaveBtn onClick={handleSaveUser} loading={savingUser} label="Ruaj ndryshimet" />
                      </div>
                    </>
                  )}

                  {/* ── TAB: Password ── */}
                  {activeTab === "password" && (
                    <>
                      <Field label="Fjalëkalimi aktual">
                        <input style={inp} type="password" value={pwForm.current_password} onChange={e => setPw("current_password", e.target.value)} placeholder="••••••••" />
                      </Field>
                      <Field label="Fjalëkalimi i ri">
                        <input style={inp} type="password" value={pwForm.new_password} onChange={e => setPw("new_password", e.target.value)} placeholder="Min. 8 karaktere" />
                      </Field>
                      <Field label="Konfirmo fjalëkalimin">
                        <input style={inp} type="password" value={pwForm.confirm} onChange={e => setPw("confirm", e.target.value)} placeholder="••••••••" />
                      </Field>

                      {pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                        <p style={{ fontSize: 12.5, color: "#8b4513", marginTop: -8, marginBottom: 14 }}>
                          ⚠️ Fjalëkalimet nuk përputhen
                        </p>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f0ece3", paddingTop: 16 }}>
                        <SaveBtn
                          onClick={handleChangePw}
                          disabled={!pwForm.current_password || !pwForm.new_password}
                          loading={savingPw}
                          label="Ndrysho fjalëkalimin"
                        />
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes pulse         { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes spin          { to{transform:rotate(360deg)} }
      `}</style>
    </MainLayout>
  );
}