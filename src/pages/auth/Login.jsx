import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

// ─── Animated floating property cards data ───────────────────────────────────
const PROPERTIES = [
  { type: "Villa",       city: "Tiranë",    price: "€285,000", beds: 4, area: "220m²", img: "🏡" },
  { type: "Apartment",   city: "Prishtinë", price: "€95,000",  beds: 2, area: "78m²",  img: "🏢" },
  { type: "Office",      city: "Shkodër",   price: "€3,200/mo",beds: 0, area: "140m²", img: "🏬" },
  { type: "House",       city: "Vlorë",     price: "€165,000", beds: 3, area: "160m²", img: "🏠" },
  { type: "Penthouse",   city: "Durrës",    price: "€320,000", beds: 5, area: "300m²", img: "🏙️" },
];

const STATS = [
  { value: "2,400+", label: "Properties" },
  { value: "840+",   label: "Happy Clients" },
  { value: "12",     label: "Cities" },
];

// ─── Floating property card ───────────────────────────────────────────────────
function FloatingCard({ prop, style }) {
  return (
    <div style={{
      position: "absolute",
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: "14px",
      padding: "12px 16px",
      minWidth: "170px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{prop.img}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>{prop.type}</div>
          <div style={{ fontSize: 11, color: "#c8ccaa" }}>📍 {prop.city}</div>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#e8e4b8" }}>{prop.price}</div>
      {prop.beds > 0 && (
        <div style={{ fontSize: 11, color: "#a3a380", marginTop: 3 }}>
          🛏 {prop.beds} beds · 📐 {prop.area}
        </div>
      )}
      {prop.beds === 0 && (
        <div style={{ fontSize: 11, color: "#a3a380", marginTop: 3 }}>📐 {prop.area}</div>
      )}
    </div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Plotëso email-in dhe fjalëkalimin"); return; }
    setError(""); setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (!user) { setError("Email ose fjalëkalim i gabuar"); return; }
    if (user.role === "admin")  navigate("/admin");
    else if (user.role === "agent") navigate("/agent");
    else navigate("/client");
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Sora:wght@300;400;500;600&display=swap');

        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-18px) rotate(-2deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(3deg); }
          50%      { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-22px) rotate(-1deg); }
        }
        @keyframes floatD {
          0%,100% { transform: translateY(0px) rotate(2deg); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes floatE {
          0%,100% { transform: translateY(0px) rotate(-3deg); }
          50%      { transform: translateY(-16px) rotate(-3deg); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .login-input:focus {
          border-color: #a3a380 !important;
          box-shadow: 0 0 0 3px rgba(163,163,128,0.2) !important;
          outline: none;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(90,95,58,0.5) !important;
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .login-link:hover {
          color: #e8e4b8 !important;
          text-decoration: underline;
        }
        .show-pw-btn:hover {
          color: #c8ccaa !important;
        }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Sora', system-ui, sans-serif",
        overflow: "hidden",
      }}>

        {/* ── LEFT PANEL — animated hero ── */}
        <div style={{
          flex: "1 1 55%",
          position: "relative",
          background: "linear-gradient(135deg, #3d4228 0%, #5a5f3a 40%, #4a5030 70%, #3d4228 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 8s ease infinite",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "60px 64px",
          overflow: "hidden",
        }}>
          {/* Background texture dots */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Big circle glow */}
          <div style={{
            position: "absolute", top: "-120px", right: "-120px",
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,204,170,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-80px", left: "-80px",
            width: "360px", height: "360px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,163,128,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 56,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "slideInLeft 0.6s ease forwards" : "none",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🏡</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              PropManager
            </span>
          </div>

          {/* Headline */}
          <div style={{
            opacity: mounted ? 1 : 0,
            animation: mounted ? "slideInLeft 0.7s ease 0.1s forwards" : "none",
            marginBottom: 20,
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(36px, 4vw, 54px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.12,
              letterSpacing: "-1px",
              margin: 0,
            }}>
              Gjej pronën<br />
              <span style={{
                background: "linear-gradient(90deg, #c8ccaa, #e8e4b8, #a3a380)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}>
                e ëndrrave tua.
              </span>
            </h1>
          </div>

          <p style={{
            fontSize: 15, color: "#c8ccaa", lineHeight: 1.7,
            maxWidth: 380, marginBottom: 48,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "slideInLeft 0.7s ease 0.2s forwards" : "none",
          }}>
            Platforma më e avancuar për menaxhimin e pronave — shitje, qira, dhe kontrata, gjithçka në një vend.
          </p>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 32, marginBottom: 64,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeInUp 0.7s ease 0.35s forwards" : "none",
          }}>
            {STATS.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#e8e4b8", letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#a3a380", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Floating property cards */}
          <FloatingCard prop={PROPERTIES[0]} style={{ top: "12%",  right: "8%",  animation: "floatA 5s ease-in-out infinite", animationDelay: "0s" }} />
          <FloatingCard prop={PROPERTIES[1]} style={{ top: "34%",  right: "2%",  animation: "floatB 6s ease-in-out infinite", animationDelay: "1s" }} />
          <FloatingCard prop={PROPERTIES[2]} style={{ bottom: "28%",right: "10%", animation: "floatC 7s ease-in-out infinite", animationDelay: "0.5s" }} />
          <FloatingCard prop={PROPERTIES[3]} style={{ bottom: "10%",right: "3%",  animation: "floatD 5.5s ease-in-out infinite", animationDelay: "1.5s" }} />

          {/* Live indicator */}
          <div style={{
            position: "absolute", bottom: 32, left: 64,
            display: "flex", alignItems: "center", gap: 8,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeInUp 0.6s ease 0.5s forwards" : "none",
          }}>
            <div style={{ position: "relative", width: 10, height: 10 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "#a3c9b0", animation: "pulse-ring 1.5s ease-out infinite",
              }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2a6049" }} />
            </div>
            <span style={{ fontSize: 12, color: "#a3a380" }}>84 prona të reja këtë javë</span>
          </div>
        </div>

        {/* ── RIGHT PANEL — login form ── */}
        <div style={{
          flex: "0 0 420px",
          background: "#faf8f3",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "slideInRight 0.7s ease 0.15s forwards" : "none",
        }}>
          {/* Top decoration */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: "linear-gradient(90deg, #5a5f3a, #a3a380, #5a5f3a)",
          }} />

          {/* Form header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 800, color: "#2c2c1e",
              letterSpacing: "-0.5px", margin: "0 0 8px",
            }}>
              Mirë se ktheve 👋
            </h2>
            <p style={{ fontSize: 14, color: "#8a8469", margin: 0 }}>
              Kyqu në llogarinë tënde
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Email
              </label>
              <input
                className="login-input"
                type="email"
                placeholder="emri@shembull.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                style={{
                  width: "100%", padding: "11px 14px",
                  border: "1.5px solid #d9d4c7", borderRadius: 10,
                  fontSize: 14, color: "#2c2c1e", background: "#fff",
                  fontFamily: "inherit", boxSizing: "border-box",
                  transition: "all 0.15s",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Fjalëkalimi
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px",
                    border: "1.5px solid #d9d4c7", borderRadius: 10,
                    fontSize: 14, color: "#2c2c1e", background: "#fff",
                    fontFamily: "inherit", boxSizing: "border-box",
                    transition: "all 0.15s",
                  }}
                />
                <button
                  className="show-pw-btn"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 16, color: "#a0997e", transition: "color 0.15s",
                  }}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fff5ee", border: "1px solid #f5c6a0",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: "#8b4513",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit button */}
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: "13px",
                background: loading ? "#a3a380" : "linear-gradient(135deg, #5a5f3a, #3d4228)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginTop: 4,
                transition: "all 0.18s",
                boxShadow: "0 4px 16px rgba(90,95,58,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  Duke u kyçur...
                </>
              ) : "Kyçu →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e5e0d4" }} />
              <span style={{ fontSize: 12, color: "#a0997e" }}>ose</span>
              <div style={{ flex: 1, height: 1, background: "#e5e0d4" }} />
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="login-link"
              style={{
                display: "block", textAlign: "center",
                padding: "11px", borderRadius: 10,
                border: "1.5px solid #d9d4c7", background: "#fff",
                fontSize: 13.5, fontWeight: 600, color: "#5a5f3a",
                textDecoration: "none", transition: "all 0.15s",
              }}
            >
              Nuk ke llogari? Regjistrohu
            </Link>
          </div>

          {/* Footer note */}
          <p style={{ fontSize: 11.5, color: "#a0997e", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
            Duke u kyçur, pranon{" "}
            <span style={{ color: "#5a5f3a", fontWeight: 600, cursor: "pointer" }}>Kushtet e Shërbimit</span>
            {" "}dhe{" "}
            <span style={{ color: "#5a5f3a", fontWeight: 600, cursor: "pointer" }}>Politikën e Privatësisë</span>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}