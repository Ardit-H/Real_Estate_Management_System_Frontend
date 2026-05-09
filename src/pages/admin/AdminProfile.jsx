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
    }}>{msg}</div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: 32, height: 32, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
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

function Avatar({ name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "AD";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #818cf8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.32, fontWeight: 600,
      border: "3px solid #eef2ff", flexShrink: 0,
    }}>{initials}</div>
  );
}

function InfoBadge({ label, value, color = "#6366f1", bg = "#eef2ff" }) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: "10px 14px",
      border: `1px solid ${color}20` }}>
      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 600, color }}>{value || "—"}</p>
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

  // Raw data nga API — ruhet si objekt i paprekur
  const [userInfo, setUserInfo] = useState(null);

  // Form state — plotësohet nga userInfo kur vie nga API
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "" });
  const [pwForm, setPwForm]     = useState({
    current_password: "", new_password: "", confirm: "",
  });

  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  const setU  = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  // ── Load të dhënat nga API ──────────────────────────────────────────────────
  // Backend → UserResponse record me @JsonProperty:
  //   first_name, last_name, email, id, tenant_id, role, is_active, created_at
  useEffect(() => {
    setLoading(true);
    api.get("/api/users/me")
      .then(res => {
        const data = res.data;
        setUserInfo(data);

        // Plotëso form-et direkt me të dhënat e API-së
        // Emrat e fushave duhet të përputhen me @JsonProperty nga backend-i:
        // @JsonProperty("first_name") → res.data.first_name
        // @JsonProperty("last_name")  → res.data.last_name
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
  }, []); // vetëm një herë kur montohet komponenti

  // ── Save account — PUT /api/users/me ────────────────────────────────────────
  // Backend pret: { first_name, last_name, email }
  // Kthen: UserResponse me të njëjtat fusha snake_case
  const handleSaveUser = async () => {
    if (!userForm.email.trim()) {
      notify("Email-i nuk mund të jetë bosh", "error"); return;
    }
    setSavingUser(true);
    try {
      const res = await api.put("/api/users/me", {
        first_name: userForm.first_name.trim() || null,
        last_name:  userForm.last_name.trim()  || null,
        email:      userForm.email.trim()       || null,
      });

      const updated = res.data;
      setUserInfo(updated);

      // Rifresko form-et me të dhënat e reja nga response-i
      setUserForm({
        first_name: updated.first_name ?? "",
        last_name:  updated.last_name  ?? "",
        email:      updated.email      ?? "",
      });

      notify("Të dhënat u ndryshuan me sukses");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Gabim gjatë ruajtjes";
      notify(msg, "error");
    } finally {
      setSavingUser(false);
    }
  };

  // ── Change password — PATCH /api/users/me/password ─────────────────────────
  // Backend pret: { current_password, new_password }
  const handleChangePw = async () => {
    if (!pwForm.current_password) {
      notify("Shkruaj fjalëkalimin aktual", "error"); return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      notify("Fjalëkalimet nuk përputhen", "error"); return;
    }
    if (pwForm.new_password.length < 8) {
      notify("Fjalëkalimi duhet të ketë minimum 8 karaktere", "error"); return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwForm.new_password)) {
      notify("Fjalëkalimi duhet të përmbajë shkronja dhe numra", "error"); return;
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
      const msg = err.response?.data?.message || err.response?.data?.error || "Gabim gjatë ndryshimit";
      notify(msg, "error");
    } finally {
      setSavingPw(false);
    }
  };

  // Emri i plotë — nga userInfo (API) ose fallback tek AuthContext
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

  return (
    <MainLayout role="admin">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Profili i Administratorit</h1>
          <p className="page-subtitle">Menaxho të dhënat e llogarisë suaj</p>
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
                  <Avatar name={fullName} size={88} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{fullName}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 12 }}>
                  {userInfo?.email}
                </p>
                <span style={{ background: "#eef2ff", color: "#6366f1",
                  padding: "3px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
                  Administrator
                </span>

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #e8edf4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    <span>Status</span>
                    <span style={{ color: userInfo?.is_active ? "#059669" : "#dc2626", fontWeight: 600 }}>
                      {userInfo?.is_active ? "● Aktiv" : "● Joaktiv"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    <span>Tenant ID</span>
                    <strong>{userInfo?.tenant_id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 13, color: "#64748b" }}>
                    <span>Anëtar që</span>
                    <strong>{fmtDate(userInfo?.created_at)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="card" style={{ overflow: "hidden" }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 16px", border: "none", background: "none",
                  borderLeft: activeTab === tab.id ? "3px solid #6366f1" : "3px solid transparent",
                  color: activeTab === tab.id ? "#6366f1" : "#475569",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ───────────────────────────────────────────────── */}
          <div>

            {/* TAB: Account */}
            {activeTab === "account" && (
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">Të dhënat e llogarisë</h2>
                </div>
                <div className="card__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Emri">
                      <input
                        className="form-input"
                        value={userForm.first_name}
                        onChange={e => setU("first_name", e.target.value)}
                        placeholder="Emri juaj"
                      />
                    </Field>
                    <Field label="Mbiemri">
                      <input
                        className="form-input"
                        value={userForm.last_name}
                        onChange={e => setU("last_name", e.target.value)}
                        placeholder="Mbiemri juaj"
                      />
                    </Field>
                  </div>
                  <Field label="Email">
                    <input
                      className="form-input"
                      type="email"
                      value={userForm.email}
                      onChange={e => setU("email", e.target.value)}
                      placeholder="email@shembull.com"
                    />
                  </Field>

                  {/* Të dhëna read-only */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e8edf4",
                    borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Të dhëna të palëvizshme
                    </p>
                    Roli: <strong style={{ color: "#6366f1" }}>Administrator</strong>
                    &nbsp;·&nbsp; Tenant ID: <strong>{userInfo?.tenant_id}</strong>
                    &nbsp;·&nbsp; User ID: <strong>{userInfo?.id}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                    <button
                      className="btn btn--primary"
                      onClick={handleSaveUser}
                      disabled={savingUser}
                    >
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
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 18,
                    fontSize: 13, color: "#92400e" }}>
                    ⚠️ Si administrator, sigurohuni që fjalëkalimi juaj të jetë i fortë.
                    Rekomandohet të paktën 12 karaktere me simbole.
                  </div>
                  <Field label="Fjalëkalimi aktual">
                    <input className="form-input" type="password"
                      value={pwForm.current_password}
                      onChange={e => setPw("current_password", e.target.value)}
                      placeholder="••••••••" />
                  </Field>
                  <Field label="Fjalëkalimi i ri"
                    hint="Min. 8 karaktere, duhet të përmbajë shkronja dhe numra">
                    <input className="form-input" type="password"
                      value={pwForm.new_password}
                      onChange={e => setPw("new_password", e.target.value)}
                      placeholder="Min. 8 karaktere" />
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
                    <button
                      className="btn btn--primary"
                      onClick={handleChangePw}
                      disabled={savingPw || !pwForm.current_password || !pwForm.new_password}
                    >
                      {savingPw ? "Duke ndryshuar..." : "Ndrysho fjalëkalimin"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: System Info */}
            {activeTab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card">
                  <div className="card__header">
                    <h2 className="card__title">Informacione të llogarisë</h2>
                  </div>
                  <div className="card__body">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <InfoBadge label="User ID"   value={`#${userInfo?.id}`} />
                      <InfoBadge label="Tenant ID" value={`#${userInfo?.tenant_id}`} />
                      <InfoBadge label="Roli"      value="ADMIN"
                        color="#6366f1" bg="#eef2ff" />
                      <InfoBadge label="Status"
                        value={userInfo?.is_active ? "Aktiv" : "Joaktiv"}
                        color={userInfo?.is_active ? "#059669" : "#dc2626"}
                        bg={userInfo?.is_active ? "#ecfdf5" : "#fef2f2"} />
                      <InfoBadge label="Email"     value={userInfo?.email} />
                      <InfoBadge label="Anëtar që" value={fmtDate(userInfo?.created_at)} />
                    </div>
                  </div>
                </div>

                {/* Permissions overview */}
                <div className="card">
                  <div className="card__header">
                    <h2 className="card__title">Privilegjet e administratorit</h2>
                  </div>
                  <div className="card__body">
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
                          fontSize: 13, color: "#374151",
                          padding: "8px 12px", background: "#f8fafc",
                          borderRadius: 8, border: "1px solid #e8edf4",
                        }}>
                          <span style={{ color: "#059669", fontSize: 12 }}>✓</span>
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

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}
