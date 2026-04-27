import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

// ─── Slideshow images (same set as Login) ─────────────────────────────────────
const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=90",
    label: "Luxury Villa",
    location: "Sarandë, Albania",
    price: "€420,000",
    tag: "For Sale",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=90",
    label: "Modern Penthouse",
    location: "Tirana, Albania",
    price: "€320,000",
    tag: "New Listing",
  },
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=90",
    label: "Seaside Retreat",
    location: "Vlorë, Albania",
    price: "€185,000",
    tag: "Hot Deal",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=90",
    label: "Country Estate",
    location: "Shkodër, Albania",
    price: "€270,000",
    tag: "For Sale",
  },
  {
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400&q=90",
    label: "Private Pool Villa",
    location: "Durrës, Albania",
    price: "€510,000",
    tag: "Premium",
  },
];

// ─── Role options ─────────────────────────────────────────────────────────────
const ROLES = [
  { value: "client", label: "Client",  icon: "👤", desc: "Browse & inquire about properties" },
  { value: "agent",  label: "Agent",   icon: "🤝", desc: "List and manage properties" },
  { value: "admin",  label: "Admin",   icon: "⚙️",  desc: "Full platform access" },
];

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function TagPill({ label }) {
  const colors = {
    "For Sale":    { bg: "rgba(255,255,255,0.12)", color: "#fff" },
    "New Listing": { bg: "rgba(100,200,120,0.25)", color: "#7ee89a" },
    "Hot Deal":    { bg: "rgba(255,140,80,0.25)",  color: "#ffb07c" },
    "Premium":     { bg: "rgba(200,170,80,0.25)",  color: "#e2c97e" },
  };
  const c = colors[label] || colors["For Sale"];
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
      background: c.bg, color: c.color, border: `1px solid ${c.color}33`,
    }}>{label}</span>
  );
}

// ─── Main Register Component ──────────────────────────────────────────────────
export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [role,        setRole]        = useState("client");
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [slide,       setSlide]       = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide(s => (s + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateSlug = (name) =>
    name.toLowerCase().trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !companyName) {
      setError("Please fill in all fields.");
      return;
    }
    setError(""); setLoading(true);
    const res = await register({
      email, password, firstName, lastName, role,
      tenantSlug: generateSlug(companyName),
      tenantName: companyName,
    });
    setLoading(false);
    if (!res) { setError("Registration failed. Please try again."); return; }
    if (role === "admin")      navigate("/admin");
    else if (role === "agent") navigate("/agent");
    else navigate("/client");
  };

  const current = SLIDES[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }

        .reg-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e4ddd0;
          border-radius: 11px;
          font-size: 13px;
          color: #1a1714;
          background: #fcfaf7;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          appearance: none;
        }
        .reg-input::placeholder { color: #b8b0a0; }
        .reg-input:focus {
          border-color: #8a7d5e;
          box-shadow: 0 0 0 4px rgba(138,125,94,0.12);
          outline: none;
          background: #fff;
        }

        .role-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 11px;
          border: 1.5px solid #e4ddd0;
          border-radius: 11px;
          cursor: pointer;
          transition: all 0.18s;
          background: #fcfaf7;
          flex: 1;
        }
        .role-card:hover {
          border-color: #8a7d5e;
          background: #f5f0e8;
        }
        .role-card.selected {
          border-color: #1a1714;
          background: #1a1714;
        }

        .reg-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #1a1714 0%, #2e2a22 100%);
          color: #e8dfc8;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          transition: all 0.22s;
          box-shadow: 0 4px 20px rgba(26,23,20,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .reg-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2e2a22 0%, #45402f 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(26,23,20,0.35);
        }
        .reg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-link-btn {
          width: 100%;
          padding: 11px;
          border: 1.5px solid #e4ddd0;
          border-radius: 12px;
          background: transparent;
          font-size: 13.5px;
          font-weight: 500;
          color: #6b6248;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
        }
        .login-link-btn:hover {
          border-color: #8a7d5e;
          color: #1a1714;
          background: #f8f4ed;
        }

        .dot-btn {
          border: none; cursor: pointer; padding: 0;
          transition: all 0.3s; border-radius: 4px;
        }

        .slide-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 0.7s ease;
        }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overflow: "hidden",
        background: "#f5f0e8",
      }}>

        {/* ── LEFT PANEL — slideshow ── */}
        <div style={{
          flex: "1 1 55%",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}>
          <img
            key={slide}
            src={current.url}
            alt={current.label}
            className="slide-img"
            style={{ opacity: 1, zIndex: 2, animation: "fadeIn 0.7s ease forwards" }}
          />

          {/* Overlays */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 50%)",
          }} />

          {/* Logo */}
          <div style={{
            position: "absolute", top: 40, left: 48, zIndex: 10,
            display: "flex", alignItems: "center", gap: 12,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeIn 0.6s ease forwards" : "none",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🏡</div>
            <span style={{ fontSize: 19, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>
              PropManager
            </span>
          </div>

          {/* Live badge */}
          <div style={{
            position: "absolute", top: 44, right: 24, zIndex: 10,
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999, padding: "6px 14px",
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeIn 0.8s ease 0.4s forwards" : "none",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#4ade80",
              animation: "pulseDot 1.8s ease infinite",
            }} />
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              Join 840+ clients today
            </span>
          </div>

          {/* Centered hero text */}
          <div style={{
            position: "absolute",
            top: "50%", left: 48,
            transform: "translateY(-50%)",
            zIndex: 10,
            maxWidth: 440,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px",
            }}>Start your journey</p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(38px, 4vw, 58px)",
              fontWeight: 700, color: "#fff",
              margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.5px",
            }}>
              Your dream<br />
              <span style={{ color: "#e2c97e" }}>property awaits.</span>
            </h1>
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0,
            }}>
              Create your account and get instant access to thousands of verified listings across Albania.
            </p>
          </div>

          {/* Bottom property info */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            zIndex: 10, padding: "36px 48px",
          }}>
            <div style={{ marginBottom: 10 }}>
              <TagPill label={current.tag} />
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(22px, 2.5vw, 32px)",
              fontWeight: 700, color: "#fff",
              margin: "0 0 6px", letterSpacing: "-0.3px", lineHeight: 1.1,
            }}>{current.label}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>📍 {current.location}</span>
              <span style={{
                fontSize: 18, fontWeight: 700, color: "#e2c97e",
                fontFamily: "'Cormorant Garamond', serif",
              }}>{current.price}</span>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {SLIDES.map((_, i) => (
                <button key={i} className="dot-btn" onClick={() => setSlide(i)} style={{
                  width: i === slide ? 22 : 7,
                  height: 7,
                  background: i === slide ? "#e2c97e" : "rgba(255,255,255,0.35)",
                  borderRadius: i === slide ? 4 : "50%",
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — register form ── */}
        <div style={{
          flex: "0 0 460px",
          background: "#faf7f2",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "32px 44px",
          position: "relative",
          overflowY: "auto",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "slideInRight 0.7s ease 0.2s forwards" : "none",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.08)",
          zIndex: 20,
        }}>
          {/* Accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #1a1714, #8a7d5e, #c9b87a, #8a7d5e, #1a1714)",
          }} />

          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: "#8a7d5e",
              textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 6px",
            }}>Get Started</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 28, fontWeight: 700, color: "#1a1714",
              letterSpacing: "-0.5px", margin: "0 0 6px", lineHeight: 1.15,
            }}>
              Create your<br />account
            </h2>
            <p style={{ fontSize: 13, color: "#9c9082", margin: 0, lineHeight: 1.6 }}>
              Join thousands managing properties smarter.
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>

            {/* Company name */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
              }}>Company Name</label>
              <input
                className="reg-input"
                placeholder="Acme Properties"

                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>

            {/* First + Last name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600,
                  color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
                }}>First Name</label>
                <input
                  className="reg-input"
                  placeholder="John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600,
                  color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
                }}>Last Name</label>
                <input
                  className="reg-input"
                  placeholder="Doe"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
              }}>Email Address</label>
              <input
                className="reg-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="reg-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 46 }}
                />
                <button onClick={() => setShowPw(p => !p)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 15, color: "#9c9082", transition: "color 0.15s", padding: 0,
                }}>{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8,
              }}>Account Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    className={`role-card ${role === r.value ? "selected" : ""}`}
                    onClick={() => setRole(r.value)}
                    style={{ border: "none", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{r.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 12, fontWeight: 700,
                        color: role === r.value ? "#e8dfc8" : "#1a1714",
                        letterSpacing: "0.2px",
                      }}>{r.label}</div>
                      <div style={{
                        fontSize: 10, lineHeight: 1.4,
                        color: role === r.value ? "rgba(232,223,200,0.6)" : "#9c9082",
                        marginTop: 2,
                      }}>{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fff8f5", border: "1px solid #f5c6a0",
                borderRadius: 10, padding: "11px 15px",
                fontSize: 13, color: "#7a3a1a",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button className="reg-btn" onClick={handleRegister} disabled={loading}>
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #e8dfc8",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
              <span style={{ fontSize: 12, color: "#b0a88e" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
            </div>

            {/* Login link */}
            <Link to="/" className="login-link-btn">
              Already have an account? <strong style={{ color: "#3d3828" }}>Sign in</strong>
            </Link>
          </div>

          {/* Footer */}
          <p style={{
            fontSize: 11.5, color: "#b0a88e", textAlign: "center",
            marginTop: 18, lineHeight: 1.7,
          }}>
            By registering you agree to our{" "}
            <span style={{ color: "#6b6248", fontWeight: 600, cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#6b6248", fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>.
          </p>

          {/* Bottom logo */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            opacity: 0.3, marginTop: 12,
          }}>
            <span style={{ fontSize: 13 }}>🏡</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1a1714", letterSpacing: "0.3px" }}>PropManager</span>
          </div>
        </div>
      </div>
    </>
  );
}