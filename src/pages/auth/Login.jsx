import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

// ─── Property slideshow images (high-quality Unsplash) ───────────────────────
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

const STATS = [
  { value: "2,400+", label: "Properties" },
  { value: "840+",   label: "Happy Clients" },
  { value: "12",     label: "Cities" },
];

// ─── Floating property cards data ────────────────────────────────────────────
const CARDS = [
  { type: "Villa",     city: "Tiranë",    price: "€285,000", beds: 4, area: "220m²", img: "🏡" },
  { type: "Apartment", city: "Prishtinë", price: "€95,000",  beds: 2, area: "78m²",  img: "🏢" },
  { type: "Penthouse", city: "Durrës",    price: "€320,000", beds: 5, area: "300m²", img: "🏙️" },
];

function FloatingCard({ prop, style }) {
  return (
    <div style={{
      position: "absolute",
      background: "rgba(15,12,8,0.55)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "16px",
      padding: "14px 18px",
      minWidth: "175px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      zIndex: 10,
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>{prop.img}</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>{prop.type}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>📍 {prop.city}</div>
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#e2c97e", letterSpacing: "-0.3px" }}>{prop.price}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
        {prop.beds > 0 ? `🛏 ${prop.beds} beds · ` : ""}📐 {prop.area}
      </div>
    </div>
  );
}

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function TagPill({ label }) {
  const colors = {
    "For Sale":   { bg: "rgba(255,255,255,0.12)", color: "#fff" },
    "New Listing":{ bg: "rgba(100,200,120,0.25)", color: "#7ee89a" },
    "Hot Deal":   { bg: "rgba(255,140,80,0.25)",  color: "#ffb07c" },
    "Premium":    { bg: "rgba(200,170,80,0.25)",  color: "#e2c97e" },
  };
  const c = colors[label] || colors["For Sale"];
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.color}33`,
    }}>{label}</span>
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
  const [slide,    setSlide]    = useState(0);
  const [prevSlide,setPrevSlide]= useState(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setPrevSlide(slide);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setTransitioning(false);
        setPrevSlide(null);
      }, 700);
    }, 3000);
    return () => clearInterval(interval);
  }, [slide]);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password"); return; }
    setError(""); setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (!user) { setError("Invalid email or password"); return; }
    if (user.role === "admin")       navigate("/admin");
    else if (user.role === "agent")  navigate("/agent");
    else navigate("/client/clientdashboard");
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  const current = SLIDES[slide];
  const previous = prevSlide !== null ? SLIDES[prevSlide] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(-1.5deg); }
          50%      { transform: translateY(-14px) rotate(-1.5deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(2deg); }
          50%      { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-11px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e4ddd0;
          border-radius: 12px;
          font-size: 14px;
          color: #1a1714;
          background: #fcfaf7;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .login-input::placeholder { color: #b8b0a0; }
        .login-input:focus {
          border-color: #8a7d5e;
          box-shadow: 0 0 0 4px rgba(138,125,94,0.12);
          outline: none;
          background: #fff;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
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
          box-shadow: 0 4px 20px rgba(26,23,20,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2e2a22 0%, #45402f 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(26,23,20,0.35);
          color: #f5ead5;
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .register-btn {
          width: 100%;
          padding: 13px;
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
        .register-btn:hover {
          border-color: #8a7d5e;
          color: #1a1714;
          background: #f8f4ed;
        }

        .dot-btn {
          width: 7px; height: 7px; border-radius: 50%;
          border: none; cursor: pointer; padding: 0;
          transition: all 0.3s;
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

        {/* ── LEFT PANEL — image slideshow ── */}
        <div style={{
          flex: "1 1 58%",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}>
          {/* Previous slide (fading out) */}
          {previous && (
            <img
              src={previous.url}
              alt=""
              className="slide-img"
              style={{ opacity: 0, zIndex: 1 }}
            />
          )}
          {/* Current slide */}
          <img
            key={slide}
            src={current.url}
            alt={current.label}
            className="slide-img"
            style={{
              opacity: 1,
              zIndex: 2,
              animation: "fadeIn 0.7s ease forwards",
            }}
          />

          {/* Dark gradient overlays */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
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
            <span style={{
              fontSize: 19, fontWeight: 600, color: "#fff",
              letterSpacing: "-0.2px",
              fontFamily: "'DM Sans', sans-serif",
            }}>PropManager</span>
          </div>

          {/* Floating property cards */}
          <FloatingCard prop={CARDS[0]} style={{
            top: "18%", right: "6%",
            animation: "floatA 5.5s ease-in-out infinite",
            zIndex: 10,
          }} />
          <FloatingCard prop={CARDS[1]} style={{
            top: "42%", right: "3%",
            animation: "floatB 7s ease-in-out infinite",
            animationDelay: "1.2s",
            zIndex: 10,
          }} />
          <FloatingCard prop={CARDS[2]} style={{
            top: "64%", right: "8%",
            animation: "floatC 6s ease-in-out infinite",
            animationDelay: "0.6s",
            zIndex: 10,
          }} />

          {/* Bottom property info */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            zIndex: 10, padding: "40px 48px",
          }}>
            {/* Tag */}
            <div style={{ marginBottom: 12 }}>
              <TagPill label={current.tag} />
            </div>

            {/* Property name */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(32px, 3.5vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
              animation: "slideUp 0.5s ease forwards",
              key: slide,
            }}>
              {current.label}
            </h2>

            <div style={{
              display: "flex", alignItems: "center", gap: 20,
              marginBottom: 28,
              animation: "slideUp 0.5s ease 0.08s both",
            }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                📍 {current.location}
              </span>
              <span style={{
                fontSize: 20, fontWeight: 700, color: "#e2c97e",
                fontFamily: "'Cormorant Garamond', serif",
              }}>{current.price}</span>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 36, marginBottom: 28,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: 24,
              animation: "slideUp 0.5s ease 0.15s both",
            }}>
              {STATS.map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1,
                  }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className="dot-btn"
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? 22 : 7,
                    background: i === slide ? "#e2c97e" : "rgba(255,255,255,0.35)",
                    borderRadius: i === slide ? 4 : "50%",
                  }}
                />
              ))}
            </div>
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
              84 new listings this week
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL — login form ── */}
        <div style={{
          flex: "0 0 420px",
          background: "#faf7f2",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 48px",
          position: "relative",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "slideInRight 0.7s ease 0.2s forwards" : "none",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.08)",
          zIndex: 20,
        }}>
          {/* Accent line top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #1a1714, #8a7d5e, #c9b87a, #8a7d5e, #1a1714)",
          }} />

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: "#8a7d5e",
              textTransform: "uppercase", letterSpacing: "1.5px",
              margin: "0 0 10px",
            }}>Welcome Back</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 700,
              color: "#1a1714",
              letterSpacing: "-0.5px",
              margin: "0 0 10px",
              lineHeight: 1.15,
            }}>
              Sign in to your<br />account
            </h2>
            <p style={{ fontSize: 13.5, color: "#9c9082", margin: 0, lineHeight: 1.6 }}>
              Access your properties, clients, and contracts.
            </p>
          </div>

          {/* Form fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#6b6248", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 7,
              }}>Email Address</label>
              <input
                className="login-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#6b6248", textTransform: "uppercase", letterSpacing: "0.8px",
                }}>Password</label>
                <span style={{ fontSize: 12, color: "#8a7d5e", cursor: "pointer", fontWeight: 500 }}>
                  Forgot?
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  style={{ paddingRight: 46 }}
                />
                <button
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 15, color: "#9c9082", transition: "color 0.15s", padding: 0,
                  }}
                >{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fff8f5",
                border: "1px solid #f5c6a0",
                borderRadius: 10, padding: "11px 15px",
                fontSize: 13, color: "#7a3a1a",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Sign in button */}
            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #e8dfc8",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : "Sign In →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
              <span style={{ fontSize: 12, color: "#b0a88e" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e8e0d0" }} />
            </div>

            {/* Register link */}
            <Link to="/register" className="register-btn">
              Don't have an account? <strong style={{ color: "#3d3828" }}>Create one</strong>
            </Link>
          </div>

          {/* Footer */}
          <p style={{
            fontSize: 11.5, color: "#b0a88e", textAlign: "center",
            marginTop: 36, lineHeight: 1.7,
          }}>
            By signing in you agree to our{" "}
            <span style={{ color: "#6b6248", fontWeight: 600, cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#6b6248", fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>.
          </p>

          {/* Bottom logo repeat subtle */}
          <div style={{
            position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 7, opacity: 0.35,
          }}>
            <span style={{ fontSize: 14 }}>🏡</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1714", letterSpacing: "0.3px" }}>PropManager</span>
          </div>
        </div>
      </div>
    </>
  );
}