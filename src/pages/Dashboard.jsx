// src/pages/Dashboard.jsx

import {
  Bell,
  Search,
  Settings,
  Users,
  FolderKanban,
  LayoutDashboard,
  Clock3,
  Star,
  ExternalLink,
  Plus,
  Zap,
  ChevronRight,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateTeamModal from "../pages/CreateTeamModal";
import Toast from "../pages/Toast";
import { safeFetch, ApiHtmlError } from "../utils/safeFetch";

const API_BASE = "/api/v1/dashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const data = await safeFetch(`${API_BASE}/summary`);
      if (data?.frequentlyAccessed) {
        data.frequentlyAccessed.sort(
          (a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
        );
      }
      setDashboardData(data);
    } catch (error) {
      if (error instanceof ApiHtmlError) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setToast({ message: "Failed to load dashboard. Please refresh.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const trackAccess = async (item) => {
    if (!item?.id) return;
    try {
      const resolvedName = item.entityName || item.name || item.title || "Unknown Item";
      await safeFetch(`${API_BASE}/track-access`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          entityId: item.id,
          entityType: item.type || item.entityType || "UNKNOWN",
          entityName: resolvedName,
          description: item.description || `User opened ${resolvedName}`,
        }).toString(),
      });
    } catch (error) {
      console.warn("Activity tracking failed:", error.message);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setDashboardData((prev) => ({
      ...prev,
      workspaces: [...(prev?.workspaces ?? []), { id: newTeam.id, name: newTeam.name }],
    }));
    setToast({ message: `"${newTeam.name}" team created successfully!`, type: "success" });
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingInner}>
          <div style={styles.loadingLogo}>DS</div>
          <p style={styles.loadingText}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  const initials = dashboardData?.userName
    ? dashboardData.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "M";

  return (
    <div style={styles.root}>
      <style>{globalCSS}</style>

      <CreateTeamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleTeamCreated}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>
            <Zap size={16} strokeWidth={2.5} style={{ color: "#fff" }} />
          </div>
          <span style={styles.logoText}>DevSync</span>
        </div>

        {/* Primary nav */}
        <nav style={styles.nav}>
          <p style={styles.navLabel}>Menu</p>
          <SidebarItem icon={<LayoutDashboard size={17} />} text="Dashboard" active />
          <SidebarItem icon={<Clock3 size={17} />} text="Recent" />
          <SidebarItem icon={<Bell size={17} />} text="Notifications" badge={3} />
          <SidebarItem icon={<Activity size={17} />} text="Activity" />
        </nav>

        {/* Workspaces */}
        <div style={styles.workspaceSection}>
          <div style={styles.workspaceHeader}>
            <p style={styles.navLabel}>Workspaces</p>
            <button
              onClick={() => setModalOpen(true)}
              style={styles.addBtn}
              title="New workspace"
              className="ds-add-btn"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div style={styles.workspaceList}>
            {dashboardData?.workspaces?.map((ws, idx) => (
              <button
                key={`ws-${ws.id || idx}`}
                onClick={() => {
                  if (!ws.id) return;
                  trackAccess({ id: ws.id, entityType: "WORKSPACE", entityName: ws.name });
                  navigate(`/workspace/${ws.id}`);
                }}
                style={styles.wsItem}
                className="ds-ws-item"
              >
                <div style={styles.wsAvatar}>
                  {ws.name?.charAt(0).toUpperCase() || "W"}
                </div>
                <span style={styles.wsName}>{ws.name}</span>
                <ExternalLink size={13} style={{ color: "rgba(255,255,255,0.25)", marginLeft: "auto" }} />
              </button>
            ))}

            {(!dashboardData?.workspaces || dashboardData.workspaces.length === 0) && (
              <button
                onClick={() => setModalOpen(true)}
                style={styles.wsEmpty}
                className="ds-ws-empty"
              >
                <Plus size={14} />
                <span>Create first workspace</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarDivider} />
          <button style={styles.settingsBtn} className="ds-settings-btn">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={styles.main}>

        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.searchWrap}>
            <Search size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search projects, teams, files…"
              style={styles.searchInput}
            />
            <kbd style={styles.kbdHint}>⌘K</kbd>
          </div>

          <div style={styles.topbarRight}>
            <button
              onClick={() => setModalOpen(true)}
              style={styles.createBtn}
              className="ds-create-btn"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Team</span>
            </button>

            <button style={styles.iconBtn} className="ds-icon-btn">
              <Bell size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
              <span style={styles.notifDot} />
            </button>

            <div style={styles.avatar} title={dashboardData?.userName}>
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div style={styles.body}>

          {/* Hero Banner */}
          <div style={styles.heroBanner}>
            <div style={styles.heroNoise} />
            <div style={styles.heroContent}>
              <p style={styles.heroDate}>{dashboardData?.formattedDate}</p>
              <h1 style={styles.heroTitle}>
                Hello, {dashboardData?.userName} 👋
              </h1>
              <p style={styles.heroSub}>Here's what's happening in your workspace today.</p>
              <button style={styles.heroBtn} className="ds-hero-btn">
                <TrendingUp size={15} />
                View analytics
              </button>
            </div>
            <div style={styles.heroArtWrap}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/1048/1048941.png"
                alt=""
                style={styles.heroArt}
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={styles.statsRow}>
            {[
              { label: "Total Projects", value: dashboardData?.userApps?.length ?? 0, icon: <FolderKanban size={18} /> },
              { label: "Workspaces",     value: dashboardData?.workspaces?.length ?? 0, icon: <Users size={18} /> },
              { label: "Recent Items",   value: dashboardData?.frequentlyAccessed?.length ?? 0, icon: <Star size={18} /> },
              { label: "Active Now",     value: "Online", icon: <Activity size={18} />, isOnline: true },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Your Apps */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Apps</h2>
                <p style={styles.sectionSub}>Quick access to all your tools</p>
              </div>
              <button style={styles.viewAll} className="ds-view-all">
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div style={styles.appsGrid}>
              {dashboardData?.userApps?.map((app, idx) => (
                <AppCard
                  key={`app-${app.id || idx}`}
                  app={app}
                  onClick={() => {
                    if (!app.id) return;
                    trackAccess({ id: app.id, type: app.type, entityName: app.name });
                    navigate(app.targetUrl);
                  }}
                />
              ))}
            </div>
          </section>

          {/* Frequently Accessed */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Frequently Accessed</h2>
                <p style={styles.sectionSub}>Your most visited items</p>
              </div>
            </div>

            <div style={styles.freqList}>
              {dashboardData?.frequentlyAccessed?.map((item, idx) => (
                <FreqCard
                  key={`freq-${item.id || idx}`}
                  item={item}
                  onOpen={() => {
                    if (!item.id) return;
                    trackAccess({
                      id: item.id,
                      entityType: item.entityType,
                      entityName: item.title,
                      description: item.description,
                    });
                    if (item.entityType === "WORKSPACE") navigate(`/workspace/${item.id}`);
                  }}
                />
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function SidebarItem({ icon, text, active, badge }) {
  return (
    <button
      style={{
        ...styles.sidebarItem,
        ...(active ? styles.sidebarItemActive : {}),
      }}
      className={active ? "" : "ds-sidebar-item"}
    >
      <span style={{ opacity: active ? 1 : 0.5, display: "flex" }}>{icon}</span>
      <span style={styles.sidebarItemText}>{text}</span>
      {badge && <span style={styles.badge}>{badge}</span>}
    </button>
  );
}

function StatCard({ label, value, icon, isOnline }) {
  return (
    <div style={styles.statCard} className="ds-stat-card">
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={styles.statValue}>
          {isOnline ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={styles.onlineDot} />
              {value}
            </span>
          ) : value}
        </p>
        <p style={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function AppCard({ app, onClick }) {
  return (
    <button onClick={onClick} style={styles.appCard} className="ds-app-card">
      <div style={styles.appIconWrap}>
        <FolderKanban size={22} style={{ color: "#FF4500" }} />
      </div>
      <div style={styles.appInfo}>
        <h3 style={styles.appName}>{app.name}</h3>
        <span style={styles.appType}>{app.type}</span>
      </div>
      <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.2)", marginLeft: "auto", flexShrink: 0 }} />
    </button>
  );
}

function FreqCard({ item, onOpen }) {
  return (
    <div style={styles.freqCard} className="ds-freq-card">
      <div style={styles.freqLeft}>
        <div style={styles.freqIconWrap}>
          <Star size={16} style={{ color: "#FF4500" }} fill="rgba(255,69,0,0.3)" />
        </div>
        <div>
          <h3 style={styles.freqTitle}>{item.title}</h3>
          <p style={styles.freqDesc}>{item.description}</p>
          <p style={styles.freqTime}>
            Last accessed: {new Date(item.lastAccessedAt).toLocaleString()}
          </p>
        </div>
      </div>
      <button onClick={onOpen} style={styles.openBtn} className="ds-open-btn">
        Open <ExternalLink size={13} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

const ORANGE = "#FF4500";
const ORANGE_DIM = "rgba(255,69,0,0.12)";
const ORANGE_HOVER = "#e03d00";
const BG_ROOT = "#080808";
const BG_SURFACE = "#111111";
const BG_ELEVATED = "#181818";
const BG_CARD = "#141414";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_DIM = "rgba(255,255,255,0.22)";

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; }

  .ds-sidebar-item:hover {
    background: rgba(255,255,255,0.04) !important;
    color: rgba(255,255,255,0.85) !important;
  }
  .ds-sidebar-item:hover span { opacity: 0.85 !important; }

  .ds-add-btn:hover {
    background: ${ORANGE} !important;
    color: #fff !important;
    transform: scale(1.05);
  }

  .ds-ws-item:hover {
    background: ${ORANGE_DIM} !important;
    border-color: rgba(255,69,0,0.25) !important;
  }

  .ds-ws-empty:hover {
    border-color: rgba(255,69,0,0.4) !important;
    color: rgba(255,69,0,0.8) !important;
  }

  .ds-settings-btn:hover {
    background: ${ORANGE} !important;
    color: #fff !important;
  }

  .ds-create-btn:hover { background: ${ORANGE_HOVER} !important; }

  .ds-icon-btn:hover { background: rgba(255,255,255,0.07) !important; }

  .ds-stat-card:hover {
    border-color: rgba(255,69,0,0.25) !important;
    background: ${BG_ELEVATED} !important;
  }

  .ds-app-card:hover {
    background: ${BG_ELEVATED} !important;
    border-color: rgba(255,69,0,0.3) !important;
    transform: translateY(-2px);
  }

  .ds-freq-card:hover {
    border-color: rgba(255,69,0,0.2) !important;
    background: ${BG_ELEVATED} !important;
  }

  .ds-open-btn:hover { background: ${ORANGE_HOVER} !important; }

  .ds-hero-btn:hover { background: rgba(255,255,255,0.25) !important; }

  .ds-view-all:hover { color: ${ORANGE} !important; }

  .ds-app-card, .ds-stat-card { transition: all 0.18s ease; }
`;

const styles = {
  // ── Root
  root: {
    display: "flex",
    height: "100vh",
    background: BG_ROOT,
    fontFamily: "'DM Sans', sans-serif",
    overflow: "hidden",
  },

  // ── Loading
  loadingScreen: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: BG_ROOT,
  },
  loadingInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  loadingLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: ORANGE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 18,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 14,
    letterSpacing: "0.04em",
  },

  // ── Sidebar
  sidebar: {
    width: 255,
    background: BG_SURFACE,
    borderRight: `1px solid ${BORDER}`,
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    flexShrink: 0,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
    paddingLeft: 6,
  },
  logoMark: {
    width: 34,
    height: 34,
    background: ORANGE,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: TEXT_PRIMARY,
    letterSpacing: "-0.5px",
  },

  // ── Nav
  nav: { display: "flex", flexDirection: "column", gap: 3 },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: TEXT_DIM,
    marginBottom: 6,
    marginTop: 4,
    paddingLeft: 10,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    width: "100%",
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    transition: "all 0.15s ease",
    textAlign: "left",
  },
  sidebarItemActive: {
    background: ORANGE_DIM,
    color: ORANGE,
    fontWeight: 500,
  },
  sidebarItemText: {
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
  },
  badge: {
    marginLeft: "auto",
    background: ORANGE,
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 20,
    padding: "1px 6px",
  },

  // ── Workspace section
  workspaceSection: { marginTop: 28, flex: 1, overflow: "hidden" },
  workspaceHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    border: "none",
    background: "rgba(255,69,0,0.12)",
    color: ORANGE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  workspaceList: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflowY: "auto",
    maxHeight: 200,
  },
  wsItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.15s ease",
    textAlign: "left",
  },
  wsAvatar: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: "rgba(255,69,0,0.18)",
    color: ORANGE,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  wsName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  wsEmpty: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 10px",
    borderRadius: 10,
    border: `1px dashed ${BORDER}`,
    background: "transparent",
    color: TEXT_DIM,
    cursor: "pointer",
    fontSize: 12.5,
    transition: "all 0.15s ease",
    width: "100%",
  },

  // ── Sidebar footer
  sidebarFooter: { marginTop: "auto" },
  sidebarDivider: { height: 1, background: BORDER, margin: "16px 0" },
  settingsBtn: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s ease",
  },

  // ── Main content
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  // ── Topbar
  topbar: {
    height: 68,
    background: BG_SURFACE,
    borderBottom: `1px solid ${BORDER}`,
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    gap: 16,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: BG_ELEVATED,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "0 14px",
    height: 40,
    width: 340,
    flexShrink: 0,
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: TEXT_PRIMARY,
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    flex: 1,
    minWidth: 0,
  },
  kbdHint: {
    fontSize: 11,
    color: TEXT_DIM,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${BORDER}`,
    borderRadius: 5,
    padding: "1px 5px",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: ORANGE,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "0 16px",
    height: 38,
    fontSize: 13.5,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "background 0.15s ease",
    flexShrink: 0,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: `1px solid ${BORDER}`,
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transition: "background 0.15s ease",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: ORANGE,
    border: `1.5px solid ${BG_SURFACE}`,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${ORANGE}, #ff7a00)`,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },

  // ── Body
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },

  // ── Hero Banner
  heroBanner: {
    background: `linear-gradient(135deg, ${ORANGE} 0%, #ff6a00 60%, #ff8c00 100%)`,
    borderRadius: 20,
    padding: "32px 36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    minHeight: 160,
  },
  heroNoise: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
    backgroundSize: "200px 200px",
    opacity: 0.4,
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroDate: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    fontWeight: 400,
    letterSpacing: "0.02em",
  },
  heroTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 32,
    color: "#fff",
    marginTop: 6,
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    fontWeight: 400,
  },
  heroBtn: {
    marginTop: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    borderRadius: 10,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    transition: "background 0.15s",
  },
  heroArtWrap: {
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
  },
  heroArt: {
    width: 140,
    opacity: 0.92,
    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
  },

  // ── Stats
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    flexShrink: 0,
  },
  statCard: {
    background: BG_CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "default",
    transition: "all 0.18s ease",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: ORANGE_DIM,
    color: ORANGE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    color: TEXT_PRIMARY,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    fontWeight: 400,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    flexShrink: 0,
  },

  // ── Section
  section: { display: "flex", flexDirection: "column", gap: 16 },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    color: TEXT_PRIMARY,
    letterSpacing: "-0.2px",
  },
  sectionSub: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    marginTop: 3,
  },
  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    background: "none",
    border: "none",
    color: TEXT_MUTED,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "color 0.15s",
    padding: 0,
  },

  // ── Apps grid
  appsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 12,
  },
  appCard: {
    background: BG_CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 0.18s ease",
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: ORANGE_DIM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  appInfo: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  appName: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: 14.5,
    color: TEXT_PRIMARY,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  appType: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 400,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  // ── Frequently accessed
  freqList: { display: "flex", flexDirection: "column", gap: 10 },
  freqCard: {
    background: BG_CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    transition: "all 0.18s ease",
  },
  freqLeft: { display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 },
  freqIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(255,69,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  freqTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: TEXT_PRIMARY,
    letterSpacing: "-0.1px",
  },
  freqDesc: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 3,
    lineHeight: 1.5,
  },
  freqTime: {
    fontSize: 11.5,
    color: TEXT_DIM,
    marginTop: 6,
    letterSpacing: "0.01em",
  },
  openBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: ORANGE,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "background 0.15s ease",
  },
};