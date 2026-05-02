import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

const NAV_CONFIG = {
  admin: [
    { group: "Overview", items: [
      { to: "/admin/dashboard",       label: "Dashboard",        emoji: "◼" },
      { to: "/admin/audit-logs",      label: "Audit Logs",       emoji: "📋" },
    ]},
    { group: "Properties", items: [
      { to: "/admin/AllProperties",   label: "All Properties",   emoji: "🏢" },
      { to: "/admin/sales",           label: "Sales",            emoji: "💰" },
      { to: "/admin/rentals",         label: "Rentals",          emoji: "🔑" },
    ]},
    { group: "People", items: [
      { to: "/admin/users",          label: "Users",           emoji: "🤝" },
      { to: "/admin/agents",          label: "Agents",           emoji: "🤝" },
      { to: "/admin/clients",         label: "Clients",          emoji: "👤" },
      { to: "/admin/leads",           label: "Leads",            emoji: "🎯" },
    ]},
    { group: "Operations", items: [
      { to: "/admin/contracts",       label: "Contracts",        emoji: "📄" },
      { to: "/admin/payments",        label: "Payments",         emoji: "💳" },
      { to: "/admin/maintenance",     label: "Maintenance",      emoji: "🔧" },
      { to: "/admin/notifications",   label: "Notifications",    emoji: "🔔" },
    ]},
    { group: "System", items: [
      { to: "/admin/background-jobs", label: "Background Jobs",  emoji: "⚙️" },
      { to: "/admin/settings",        label: "Settings",         emoji: "🛠️" },
    ]},
  ],
  agent: [
    { group: "Overview", items: [
      { to: "/agent",                 label: "Dashboard",        emoji: "◼" },
      { to: "/agent/my-stats",        label: "My Performance",   emoji: "📈" },
    ]},
    { group: "Listings", items: [
      { to: "/agent/properties",      label: "Properties",       emoji: "🏢" },
      { to: "/agent/sales",           label: "Sale Listings",    emoji: "💰" },
      { to: "/agent/rentals",         label: "Rental Listings",  emoji: "🔑" },
    ]},
    { group: "Clients", items: [
      { to: "/agent/leads",           label: "My Leads",         emoji: "🎯" },
      { to: "/agent/clients",         label: "My Clients",       emoji: "👥" },
      { to: "/agent/applications",    label: "Applications",     emoji: "📋" },
    ]},
    { group: "Finance", items: [
      { to: "/agent/contracts",       label: "Contracts",        emoji: "📄" },
      { to: "/agent/payments",        label: "Payments",         emoji: "💳" },
      { to: "/agent/maintenance",     label: "Maintenance",      emoji: "🔧" },
    ]},
    { group: "Tools", items: [
      { to: "/agent/ai-assistant",    label: "AI Assistant",     emoji: "🤖" },
      { to: "/agent/notifications",   label: "Notifications",    emoji: "🔔" },
    ]},
  ],
  client: [
    { group: "Explore", items: [
      { to: "/client/clientdashboard",        label: "Home",          emoji: "◼" },
      { to: "/client/browseproperties", label: "Browse Properties",  emoji: "🔍" },
      { to: "/client/savedproperties",  label: "Saved Properties",   emoji: "❤️" },
    ]},
    { group: "My Activity", items: [
      { to: "/client/myapplications",   label: "My Applications",    emoji: "📋" },
      { to: "/client/mycontracts",      label: "My Contracts",       emoji: "📄" },
      { to: "/client/mypayments",       label: "My Payments",        emoji: "💳" },
    ]},
    { group: "Support", items: [
      { to: "/client/maintenance",      label: "Maintenance",        emoji: "🔧" },
      { to: "/client/ai-assistant",     label: "AI Assistant",       emoji: "🤖" },
      { to: "/client/notifications",    label: "Notifications",      emoji: "🔔" },
    ]},
  ],
};

const ROLE_META = {
  admin:  { label: "Administrator", accent: "#c9b87a", tag: "Admin"  },
  agent:  { label: "Agent",         accent: "#7eb8a4", tag: "Agent"  },
  client: { label: "Client",        accent: "#a4c4b0", tag: "Client" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
}

export default function Sidebar({ role = "admin", collapsed = false }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const activeRole  = user?.role || role;
  const nav         = NAV_CONFIG[activeRole] || NAV_CONFIG.admin;
  const meta        = ROLE_META[activeRole]  || ROLE_META.admin;
  const displayName = user?.fullName || "—";
  const initials    = getInitials(user?.fullName);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        .sb {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: ${collapsed ? "58px" : "218px"};
          height: 100vh;
          background: #1a1714;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          z-index: 100;
          transition: width 220ms cubic-bezier(0.4,0,0.2,1);
        }
        .sb::before {
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px);
          background-size:18px 18px;pointer-events:none;z-index:0;
        }
        .sb-top-bar {
          position:absolute;top:0;left:0;right:0;height:2px;z-index:2;
          background:linear-gradient(90deg,transparent,#c9b87a 35%,#c9b87a 65%,transparent);
        }
        .sb-body { position:relative;z-index:1;display:flex;flex-direction:column;height:100%; }

        .sb-brand {
          display:flex;align-items:center;gap:10px;
          padding:${collapsed?"18px 0":"17px 15px"};
          justify-content:${collapsed?"center":"flex-start"};
          border-bottom:1px solid rgba(255,255,255,0.055);
        }
        .sb-logo-box {
          width:31px;height:31px;border-radius:8px;flex-shrink:0;
          background:rgba(201,184,122,0.11);border:1px solid rgba(201,184,122,0.2);
          display:flex;align-items:center;justify-content:center;font-size:15px;
        }
        .sb-brand-name {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:15.5px;font-weight:700;color:#f5f0e8;letter-spacing:-0.2px;line-height:1.1;white-space:nowrap;
        }
        .sb-role-tag {
          font-size:8.5px;font-weight:600;letter-spacing:0.9px;text-transform:uppercase;line-height:1;
        }

        .sb-nav { flex:1;overflow-y:auto;overflow-x:hidden;padding:5px 0 10px;scrollbar-width:none; }
        .sb-nav::-webkit-scrollbar { display:none; }

        .sb-group { padding:0 7px;margin-bottom:0; }
        .sb-group-label {
          display:block;font-size:8px;font-weight:600;letter-spacing:1.4px;
          text-transform:uppercase;color:rgba(255,255,255,0.16);
          padding:12px 8px 4px;white-space:nowrap;
        }

        .sb-link {
          display:flex;align-items:center;gap:8px;
          padding:6.5px 8px;border-radius:7px;
          text-decoration:none;color:rgba(255,255,255,0.38);
          font-size:12px;font-weight:400;
          transition:all 0.14s ease;position:relative;
          white-space:nowrap;overflow:hidden;margin-bottom:1px;
          justify-content:${collapsed?"center":"flex-start"};
        }
        .sb-link:hover { color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.05); }
        .sb-link:hover .sb-em { opacity:0.85; }
        .sb-link.active {
          color:#f5f0e8 !important;background:rgba(201,184,122,0.1) !important;font-weight:500;
        }
        .sb-link.active .sb-em { opacity:1; }
        .sb-link.active::before {
          content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
          width:2px;height:52%;background:#c9b87a;border-radius:0 2px 2px 0;
        }

        .sb-em { font-size:12px;line-height:1;opacity:0.45;flex-shrink:0;width:15px;text-align:center;transition:opacity 0.14s; }
        .sb-lbl { flex:1;overflow:hidden;text-overflow:ellipsis; }

        .sb-footer {
          padding:10px 11px;border-top:1px solid rgba(255,255,255,0.055);
          display:flex;align-items:center;gap:8px;
        }
        .sb-avatar {
          width:29px;height:29px;border-radius:7px;flex-shrink:0;
          background:rgba(201,184,122,0.1);border:1px solid rgba(201,184,122,0.17);
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:600;color:#c9b87a;letter-spacing:0.2px;
        }
        .sb-uname { display:block;font-size:11.5px;font-weight:500;color:#f5f0e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:112px;line-height:1.2; }
        .sb-urole { display:block;font-size:9px;color:#5a5438;letter-spacing:0.2px; }
        .sb-logout { margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.18);font-size:12px;padding:5px;border-radius:6px;transition:all 0.14s;flex-shrink:0; }
        .sb-logout:hover { color:#f5f0e8;background:rgba(255,255,255,0.07); }
      `}</style>

      <aside className="sb">
        <div className="sb-top-bar"/>
        <div className="sb-body">

          <div className="sb-brand">
            <div className="sb-logo-box">🏡</div>
            {!collapsed && (
              <div>
                <div className="sb-brand-name">PropManager</div>
                <div className="sb-role-tag" style={{color:meta.accent,marginTop:3}}>{meta.tag}</div>
              </div>
            )}
          </div>

          <nav className="sb-nav">
            {nav.map(group => (
              <div key={group.group} className="sb-group">
                {!collapsed && <span className="sb-group-label">{group.group}</span>}
                {group.items.map(item => {
                  const active = location.pathname===item.to || location.pathname.startsWith(item.to+"/");
                  return (
                    <NavLink key={item.to} to={item.to} title={collapsed?item.label:undefined}
                      className={`sb-link${active?" active":""}`}>
                      <span className="sb-em">{item.emoji}</span>
                      {!collapsed && <span className="sb-lbl">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {!collapsed && (
            <div className="sb-footer">
              <div className="sb-avatar">{initials}</div>
              <div style={{flex:1,minWidth:0}}>
                <span className="sb-uname">{displayName}</span>
                <span className="sb-urole">{meta.label}</span>
              </div>
              {logout && <button className="sb-logout" onClick={logout} title="Sign out">🚪</button>}
            </div>
          )}

        </div>
      </aside>
    </>
  );
}