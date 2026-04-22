import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

export default function ClientApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadApps = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/my?page=${pg}&size=10`);
      setApps(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps(0);
  }, [loadApps]);

  const STATUS_STYLE = {
    PENDING:   { bg: "#fffbeb", color: "#d97706" },
    APPROVED:  { bg: "#ecfdf5", color: "#059669" },
    REJECTED:  { bg: "#fef2f2", color: "#dc2626" },
    CANCELLED: { bg: "#f1f5f9", color: "#64748b" },
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh" }}>
        
        {/* Header (same vibe si BrowseProperties) */}
        <div style={{
          background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)",
          padding: "40px 24px",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#fff", marginBottom: 6 }}>
            My Applications
          </h1>
          <p style={{ color: "#c8ccaa" }}>
            Track and manage your rental applications
          </p>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
          
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : apps.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px",
              color: "#8a8469"
            }}>
              <div style={{ fontSize: 40 }}>📭</div>
              <p>No applications yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {apps.map(app => {
                const s = STATUS_STYLE[app.status] || STATUS_STYLE.CANCELLED;

                return (
                  <div key={app.id} style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e5e0d4",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                  }}>
                    
                    {/* Top */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8
                    }}>
                      <div>
                        <p style={{ fontWeight: 700, margin: 0 }}>
                          Listing #{app.listing_id}
                        </p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                          {fmtDate(app.created_at)}
                        </p>
                      </div>

                      <span style={{
                        background: s.bg,
                        color: s.color,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {app.status}
                      </span>
                    </div>

                    {/* Message */}
                    {app.message && (
                      <p style={{
                        fontStyle: "italic",
                        color: "#475569",
                        marginBottom: 6
                      }}>
                        "{app.message}"
                      </p>
                    )}

                    {/* Approved */}
                    {app.status === "APPROVED" && (
                      <div style={{
                        background: "#ecfdf5",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "#047857"
                      }}>
                        🎉 Approved! Agent will contact you.
                      </div>
                    )}

                    {/* Rejected */}
                    {app.rejection_reason && (
                      <div style={{
                        background: "#fef2f2",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "#dc2626",
                        marginTop: 6
                      }}>
                        ✕ Reason: {app.rejection_reason}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}