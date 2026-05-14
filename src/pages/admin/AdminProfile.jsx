import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants (nga Notifications) ───────────────────────────────────────────
const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ap*{box-sizing:border-box}
  .ap{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .ap-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .ap-btn:hover{opacity:.85;transform:translateY(-1px)}
  .ap-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .ap-tab-btn{transition:all .15s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;width:100%;text-align:left}
  .ap-tab-btn:hover{background:#f5f0e8!important}
  .ap-input{font-family:'DM Sans',sans-serif;width:100%;padding:10px 14px;border:1.5px solid #e8e2d6;border-radius:10px;background:#faf7f2;font-size:13.5px;color:#1a1714;outline:none;transition:border-color .15s;}
  .ap-input:focus{border-color:#c9b87a;box-shadow:0 0 0 3px rgba(201,184,122,.13);}
  .ap-input::placeholder{color:#b0a890;}
  @keyframes ap-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ap-spin{to{transform:rotate(360deg)}}
  @keyframes ap-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .ap-card{animation:ap-fade-up .35s ease both}
`;

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "ap-toast .2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{
        width: 28, height: 28, margin: "0 auto",
        border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`,
        borderRadius: "50%", animation: "ap-spin .7s linear infinite",
      }} />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 11.5, fontWeight: 600, color: C.textSub,
        textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6,
      }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: C.textMut, marginTop: 5, marginBottom: 0 }}>{hint}</p>}
    </div>
  );
}

function Avatar({ name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "AD";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.dark, fontSize: size * 0.32, fontWeight: 700,
      border: `3px solid ${C.border}`, flexShrink: 0,
      fontFamily: "'Cormorant Garamond',Georgia,serif",
    }}>{initials}</div>
  );
}

function InfoBadge({ label, value, color, bg }) {
  const _color = color || C.textSub;
  const _bg    = bg    || "#f0ece3";
  return (
    <div style={{
      background: _bg, borderRadius: 11, padding: "12px 14px",
      border: `1.5px solid ${_color}22`,
    }}>
      <p style={{
        fontSize: 10, color: C.textMut, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5,
      }}>{label}</p>
      <p style={{ fontSize: 14.5, fontWeight: 700, color: _color, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminProfile() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading]     = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPw, setSavingPw]   = useState(false);
  const [toast, setToast]         = useState(null);

  const [userInfo, setUserInfo] = useState(null);
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "" });
  const [pwForm, setPwForm]     = useState({ current_password: "", new_password: "", confirm: "" });

  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  const setU   = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setPw  = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoading(true);
    api.get("/api/users/me")
      .then(res => {
        const data = res.data;
        setUserInfo(data);
        setUserForm({
          first_name: data.first_name ?? "",
          last_name:  data.last_name  ?? "",
          email:      data.email      ?? "",
        });
      })
      .catch(err => {
        console.error("Gabim gjatë ngarkimit të profilit:", err);
        notify("Gabim gjatë ngarkimit të të dhënave", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveUser = async () => {
    if (!userForm.email.trim()) { notify("Email-i nuk mund të jetë bosh", "error"); return; }
    setSavingUser(true);
    try {
      const res = await api.put("/api/users/me", {
        first_name: userForm.first_name.trim() || null,
        last_name:  userForm.last_name.trim()  || null,
        email:      userForm.email.trim()       || null,
      });
      const updated = res.data;
      setUserInfo(updated);
      setUserForm({ first_name: updated.first_name ?? "", last_name: updated.last_name ?? "", email: updated.email ?? "" });
      notify("Të dhënat u ndryshuan me sukses");
    } catch (err) {
      notify(err.response?.data?.message || err.response?.data?.error || "Gabim gjatë ruajtjes", "error");
    } finally { setSavingUser(false); }
  };

  const handleChangePw = async () => {
    if (!pwForm.current_password) { notify("Shkruaj fjalëkalimin aktual", "error"); return; }
    if (pwForm.new_password !== pwForm.confirm) { notify("Fjalëkalimet nuk përputhen", "error"); return; }
    if (pwForm.new_password.length < 8) { notify("Fjalëkalimi duhet të ketë minimum 8 karaktere", "error"); return; }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwForm.new_password)) { notify("Fjalëkalimi duhet të përmbajë shkronja dhe numra", "error"); return; }
    setSavingPw(true);
    try {
      await api.patch("/api/users/me/password", {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      notify("Fjalëkalimi u ndryshua me sukses");
    } catch (err) {
      notify(err.response?.data?.message || err.response?.data?.error || "Gabim gjatë ndryshimit", "error");
    } finally { setSavingPw(false); }
  };

  const fullName = userInfo
    ? `${userInfo.first_name ?? ""} ${userInfo.last_name ?? ""}`.trim() || "Admin"
    : user?.fullName || "Admin";

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL", {
    day: "2-digit", month: "long", year: "numeric",
  }) : "—";

  const TABS = [
    { id: "account",  label: "Llogaria",     icon: "✉️" },
    { id: "password", label: "Fjalëkalimi",  icon: "🔒" },
    { id: "info",     label: "Info sistemi", icon: "ℹ️" },
  ];

  // Shared button style
  const btnPrimary = {
    padding: "9px 20px", borderRadius: 10,
    background: `linear-gradient(135deg,${C.gold},${C.goldL})`,
    color: C.dark, fontWeight: 600, fontSize: 13.5,
    border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    transition: "all .17s ease", boxShadow: `0 2px 8px ${C.gold}44`,
  };
  const btnDisabled = { ...btnPrimary, opacity: 0.5, cursor: "not-allowed" };

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ap">

        {/* ── HERO (same as Notifications) ── */}
        <div style={{
          background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",
          minHeight: 180, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          {/* dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",
            backgroundSize: "22px 22px", pointerEvents: "none",
          }} />
          {/* gold top line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`,
          }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>
              Admin · Profili
            </p>
            <h1 style={{
              margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8",
              letterSpacing: "-0.4px",
            }}>
              Profili{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Administratorit</span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Menaxho të dhënat e llogarisë suaj
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 980, margin: "0 auto" }}>
          {loading ? <Loader /> : (
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>

              {/* ── Sidebar ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Avatar card */}
                <div className="ap-card">
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                      <Avatar name={fullName} size={88} />
                    </div>
                    <h3 style={{
                      fontWeight: 700, fontSize: 18, marginBottom: 4,
                      fontFamily: "'Cormorant Garamond',Georgia,serif", color: C.text,
                    }}>{fullName}</h3>
                    <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>
                      {userInfo?.email}
                    </p>
                    <span style={{
                      background: `${C.gold}22`, color: C.textSub,
                      padding: "3px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                      border: `1px solid ${C.gold}44`,
                    }}>Administrator</span>

                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                      {[
                        { label: "Status", value: userInfo?.is_active ? "● Aktiv" : "● Joaktiv", valueColor: userInfo?.is_active ? "#059669" : "#dc2626" },
                        { label: "Tenant ID", value: `#${userInfo?.tenant_id}` },
                        { label: "Anëtar që", value: fmtDate(userInfo?.created_at) },
                      ].map(row => (
                        <div key={row.label} style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: 12.5, color: C.muted, marginBottom: 8,
                        }}>
                          <span>{row.label}</span>
                          <strong style={{ color: row.valueColor || C.textSub }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nav tabs */}
                <div className="ap-card" style={{ overflow: "hidden" }}>
                  {TABS.map(tab => (
                    <button key={tab.id} className="ap-tab-btn" onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 16px", background: activeTab === tab.id ? "#fff8ee" : "transparent",
                        borderLeft: activeTab === tab.id ? `3px solid ${C.gold}` : `3px solid transparent`,
                        color: activeTab === tab.id ? C.dark : C.muted,
                        fontWeight: activeTab === tab.id ? 600 : 400,
                        fontSize: 13.5, borderBottom: `1px solid ${C.border}`,
                      }}>
                      <span>{tab.icon}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif" }}>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Main content ── */}
              <div>

                {/* TAB: Account */}
                {activeTab === "account" && (
                  <div className="ap-card">
                    {/* card header */}
                    <div style={{
                      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                      background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                        Të dhënat e llogarisë
                      </p>
                    </div>
                    <div style={{ padding: "22px 22px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Field label="Emri">
                          <input className="ap-input" value={userForm.first_name}
                            onChange={e => setU("first_name", e.target.value)} placeholder="Emri juaj" />
                        </Field>
                        <Field label="Mbiemri">
                          <input className="ap-input" value={userForm.last_name}
                            onChange={e => setU("last_name", e.target.value)} placeholder="Mbiemri juaj" />
                        </Field>
                      </div>
                      <Field label="Email">
                        <input className="ap-input" type="email" value={userForm.email}
                          onChange={e => setU("email", e.target.value)} placeholder="email@shembull.com" />
                      </Field>

                      {/* Read-only info */}
                      <div style={{
                        background: "#f0ece3", border: `1.5px solid ${C.border}`,
                        borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.textSub, marginBottom: 18,
                      }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                          Të dhëna të palëvizshme
                        </p>
                        Roli: <strong style={{ color: C.textSub }}>Administrator</strong>
                        &nbsp;·&nbsp; Tenant ID: <strong>{userInfo?.tenant_id}</strong>
                        &nbsp;·&nbsp; User ID: <strong>{userInfo?.id}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="ap-btn" onClick={handleSaveUser} disabled={savingUser}
                          style={savingUser ? btnDisabled : btnPrimary}>
                          {savingUser ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: Password */}
                {activeTab === "password" && (
                  <div className="ap-card">
                    <div style={{
                      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                      background: "#fdf9f4",
                    }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                        Ndrysho fjalëkalimin
                      </p>
                    </div>
                    <div style={{ padding: "22px 22px" }}>
                      <div style={{
                        background: "#fffbeb", border: "1.5px solid #fde68a",
                        borderRadius: 10, padding: "11px 14px", marginBottom: 20,
                        fontSize: 13, color: "#92400e",
                      }}>
                        ⚠️ Si administrator, sigurohuni që fjalëkalimi juaj të jetë i fortë.
                        Rekomandohet të paktën 12 karaktere me simbole.
                      </div>
                      <Field label="Fjalëkalimi aktual">
                        <input className="ap-input" type="password" value={pwForm.current_password}
                          onChange={e => setPw("current_password", e.target.value)} placeholder="••••••••" />
                      </Field>
                      <Field label="Fjalëkalimi i ri" hint="Min. 8 karaktere, duhet të përmbajë shkronja dhe numra">
                        <input className="ap-input" type="password" value={pwForm.new_password}
                          onChange={e => setPw("new_password", e.target.value)} placeholder="Min. 8 karaktere" />
                      </Field>
                      <Field label="Konfirmo fjalëkalimin">
                        <input className="ap-input" type="password" value={pwForm.confirm}
                          onChange={e => setPw("confirm", e.target.value)} placeholder="••••••••" />
                      </Field>
                      {pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                        <p style={{ fontSize: 12.5, color: "#dc2626", marginTop: -10, marginBottom: 16 }}>
                          Fjalëkalimet nuk përputhen
                        </p>
                      )}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="ap-btn" onClick={handleChangePw}
                          disabled={savingPw || !pwForm.current_password || !pwForm.new_password}
                          style={(savingPw || !pwForm.current_password || !pwForm.new_password) ? btnDisabled : btnPrimary}>
                          {savingPw ? "Duke ndryshuar..." : "Ndrysho fjalëkalimin"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: System Info */}
                {activeTab === "info" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div className="ap-card">
                      <div style={{
                        padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                        background: "#fdf9f4",
                      }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                          Informacione të llogarisë
                        </p>
                      </div>
                      <div style={{ padding: "20px 22px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <InfoBadge label="User ID"   value={`#${userInfo?.id}`} />
                          <InfoBadge label="Tenant ID" value={`#${userInfo?.tenant_id}`} />
                          <InfoBadge label="Roli"      value="ADMIN"
                            color={C.textSub} bg={`${C.gold}18`} />
                          <InfoBadge label="Status"
                            value={userInfo?.is_active ? "Aktiv" : "Joaktiv"}
                            color={userInfo?.is_active ? "#059669" : "#dc2626"}
                            bg={userInfo?.is_active ? "#ecfdf5" : "#fef2f2"} />
                          <InfoBadge label="Email"     value={userInfo?.email} />
                          <InfoBadge label="Anëtar që" value={fmtDate(userInfo?.created_at)} />
                        </div>
                      </div>
                    </div>

                    <div className="ap-card">
                      <div style={{
                        padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                        background: "#fdf9f4",
                      }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                          Privilegjet e administratorit
                        </p>
                      </div>
                      <div style={{ padding: "20px 22px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            "Menaxhim i plotë i pronave",
                            "Asignimin e agjentëve tek leads",
                            "Menaxhim i të gjitha leads",
                            "Kontroll i statusit të users",
                            "Ndryshim i roleve të users",
                            "Fshirje (soft delete) e users",
                            "Qasje tek të gjitha kontratat",
                            "Qasje tek të gjitha pagesat",
                            "Menaxhim i agjentëve",
                            "Qasje tek background jobs",
                          ].map(perm => (
                            <div key={perm} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              fontSize: 13, color: C.textSub,
                              padding: "9px 12px", background: "#f0ece3",
                              borderRadius: 9, border: `1.5px solid ${C.border}`,
                            }}>
                              <span style={{ color: "#059669", fontSize: 12, flexShrink: 0 }}>✓</span>
                              {perm}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}