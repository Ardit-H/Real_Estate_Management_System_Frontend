import { C, btnPrimary, btnDisabled, fmtDate, ADMIN_PERMISSIONS } from "./profileConstants.js";
import { Field, Avatar, InfoBadge } from "./ProfileUI.jsx";
 
export function AccountTab({ userForm, setU, userInfo, savingUser, onSave }) {
  return (
    <div className="ap-card">
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Account details</p>
      </div>
      <div style={{ padding: "22px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="First name">
            <input className="ap-input" value={userForm.first_name} onChange={e => setU("first_name", e.target.value)} placeholder="Your first name" />
          </Field>
          <Field label="Last name">
            <input className="ap-input" value={userForm.last_name} onChange={e => setU("last_name", e.target.value)} placeholder="Your last name" />
          </Field>
        </div>
        <Field label="Email">
          <input className="ap-input" type="email" value={userForm.email} onChange={e => setU("email", e.target.value)} placeholder="email@example.com" />
        </Field>
        <div style={{ background: "#f0ece3", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.textSub, marginBottom: 18 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Read-only fields</p>
          Role: <strong style={{ color: C.textSub }}>Administrator</strong>
          &nbsp;·&nbsp; Tenant ID: <strong>{userInfo?.tenant_id}</strong>
          &nbsp;·&nbsp; User ID: <strong>{userInfo?.id}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="ap-btn" onClick={onSave} disabled={savingUser} style={savingUser ? btnDisabled : btnPrimary}>
            {savingUser ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
export function PasswordTab({ pwForm, setPw, savingPw, onSave }) {
  const canSave = !savingPw && !!pwForm.current_password && !!pwForm.new_password;
  return (
    <div className="ap-card">
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Change password</p>
      </div>
      <div style={{ padding: "22px 22px" }}>
        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "11px 14px", marginBottom: 20, fontSize: 13, color: "#92400e" }}>
          ⚠️ As an administrator, make sure your password is strong. At least 12 characters with symbols is recommended.
        </div>
        <Field label="Current password">
          <input className="ap-input" type="password" value={pwForm.current_password} onChange={e => setPw("current_password", e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="New password" hint="Min. 8 characters, must contain letters and numbers">
          <input className="ap-input" type="password" value={pwForm.new_password} onChange={e => setPw("new_password", e.target.value)} placeholder="Min. 8 characters" />
        </Field>
        <Field label="Confirm password">
          <input className="ap-input" type="password" value={pwForm.confirm} onChange={e => setPw("confirm", e.target.value)} placeholder="••••••••" />
        </Field>
        {pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
          <p style={{ fontSize: 12.5, color: "#dc2626", marginTop: -10, marginBottom: 16 }}>Passwords do not match</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="ap-btn" onClick={onSave} disabled={!canSave} style={!canSave ? btnDisabled : btnPrimary}>
            {savingPw ? "Changing..." : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
export function InfoTab({ userInfo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ap-card">
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Account information</p>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoBadge label="User ID"   value={`#${userInfo?.id}`} />
            <InfoBadge label="Tenant ID" value={`#${userInfo?.tenant_id}`} />
            <InfoBadge label="Role"      value="ADMIN" color={C.textSub} bg={`${C.gold}18`} />
            <InfoBadge label="Status"    value={userInfo?.is_active ? "Active" : "Inactive"} color={userInfo?.is_active ? "#059669" : "#dc2626"} bg={userInfo?.is_active ? "#ecfdf5" : "#fef2f2"} />
            <InfoBadge label="Email"     value={userInfo?.email} />
            <InfoBadge label="Member since" value={fmtDate(userInfo?.created_at)} />
          </div>
        </div>
      </div>
 
      <div className="ap-card">
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Administrator privileges</p>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ADMIN_PERMISSIONS.map(perm => (
              <div key={perm} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSub, padding: "9px 12px", background: "#f0ece3", borderRadius: 9, border: `1.5px solid ${C.border}` }}>
                <span style={{ color: "#059669", fontSize: 12, flexShrink: 0 }}>✓</span>
                {perm}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 