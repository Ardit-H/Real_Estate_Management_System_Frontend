import { useState, useEffect, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { C, CSS } from "../../components/admin/profile/profileConstants.js";
import { Toast, Loader } from "../../components/admin/profile/ProfileUI.jsx";
import { ProfileSidebar } from "../../components/admin/profile/ProfileSidebar.jsx";
import { AccountTab, PasswordTab, InfoTab } from "../../components/admin/profile/ProfileTabs.jsx";
 
export default function AdminProfile() {
  const { user } = useContext(AuthContext);
  const [activeTab,  setActiveTab]  = useState("account");
  const [loading,    setLoading]    = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);
  const [toast,      setToast]      = useState(null);
 
  const [userInfo, setUserInfo] = useState(null);
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "" });
  const [pwForm,   setPwForm]   = useState({ current_password: "", new_password: "", confirm: "" });
 
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  const setU   = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setPw  = (k, v) => setPwForm(p => ({ ...p, [k]: v }));
 
  useEffect(() => {
    setLoading(true);
    api.get("/api/users/me")
      .then(res => {
        const data = res.data;
        setUserInfo(data);
        setUserForm({ first_name: data.first_name ?? "", last_name: data.last_name ?? "", email: data.email ?? "" });
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        notify("Error loading data", "error");
      })
      .finally(() => setLoading(false));
  }, []);
 
  const handleSaveUser = async () => {
    if (!userForm.email.trim()) { notify("Email cannot be empty", "error"); return; }
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
      notify("Data updated successfully");
    } catch (err) {
      notify(err.response?.data?.message || err.response?.data?.error || "Error saving", "error");
    } finally { setSavingUser(false); }
  };
 
  const handleChangePw = async () => {
    if (!pwForm.current_password) { notify("Enter your current password", "error"); return; }
    if (pwForm.new_password !== pwForm.confirm) { notify("Passwords do not match", "error"); return; }
    if (pwForm.new_password.length < 8) { notify("Password must be at least 8 characters", "error"); return; }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwForm.new_password)) { notify("Password must contain letters and numbers", "error"); return; }
    setSavingPw(true);
    try {
      await api.patch("/api/users/me/password", { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      notify("Password changed successfully");
    } catch (err) {
      notify(err.response?.data?.message || err.response?.data?.error || "Error changing password", "error");
    } finally { setSavingPw(false); }
  };
 
  const fullName = userInfo
    ? `${userInfo.first_name ?? ""} ${userInfo.last_name ?? ""}`.trim() || "Admin"
    : user?.fullName || "Admin";
 
  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ap">
 
        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · Profile</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Administrator{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Profile</span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>Manage your account details</p>
          </div>
        </div>
 
        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 980, margin: "0 auto" }}>
          {loading ? <Loader /> : (
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
 
              <ProfileSidebar fullName={fullName} userInfo={userInfo} activeTab={activeTab} setActiveTab={setActiveTab} />
 
              <div>
                {/* Panel header */}
                <div style={{ marginBottom: 0 }}>
                  {activeTab === "account" && (
                    <AccountTab userForm={userForm} setU={setU} userInfo={userInfo} savingUser={savingUser} onSave={handleSaveUser} />
                  )}
                  {activeTab === "password" && (
                    <PasswordTab pwForm={pwForm} setPw={setPw} savingPw={savingPw} onSave={handleChangePw} />
                  )}
                  {activeTab === "info" && (
                    <InfoTab userInfo={userInfo} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
 
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
 