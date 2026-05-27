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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateTeamModal from "../pages/CreateTeamModal";
import Toast          from "../pages/Toast";
import { safeFetch, ApiHtmlError } from "../utils/safeFetch";

const API_BASE = "/api/v1/dashboard";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [modalOpen, setModalOpen]         = useState(false);
  const [toast, setToast]                 = useState({ message: "", type: "success" });

  // Prevent React 18 Strict Mode double-invocation of useEffect
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboardSummary();
  }, []);

  // ─── Fetch dashboard summary ──────────────────────────────────────────────

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
        console.error("Session expired or token is stale. Redirecting to login.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      console.error("Dashboard load failed:", error.message);
      setToast({ message: "Failed to load dashboard. Please refresh.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Track access (non-critical) ─────────────────────────────────────────

  const trackAccess = async (item) => {
    if (!item?.id) {
      console.warn("trackAccess skipped — item has no id:", item);
      return;
    }

    try {
      const resolvedName =
        item.entityName || item.name || item.title || "Unknown Item";

      await safeFetch(`${API_BASE}/track-access`, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          entityId:    item.id,
          entityType:  item.type || item.entityType || "UNKNOWN",
          entityName:  resolvedName,
          description: item.description || `User opened ${resolvedName}`,
        }).toString(),
      });
    } catch (error) {
      console.warn("Activity tracking failed (non-critical):", error.message);
    }
  };

  // ─── Team created callback ────────────────────────────────────────────────

  const handleTeamCreated = (newTeam) => {
    setDashboardData((prev) => ({
      ...prev,
      workspaces: [...(prev?.workspaces ?? []), { id: newTeam.id, name: newTeam.name }],
    }));
    setToast({ message: `"${newTeam.name}" team created successfully!`, type: "success" });
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold bg-[#0a0a0a] text-white">
        Loading Dashboard...
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">

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

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-[260px] bg-[#111111] border-r border-white/10 p-5 flex flex-col">
        <div className="text-2xl font-bold text-[#FF4500] mb-10">DevSync</div>

        <div className="space-y-3">
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" active />
          <SidebarItem icon={<Clock3 size={20} />}          text="Recent" />
          <SidebarItem icon={<Bell size={20} />}            text="Notifications" />
        </div>

        {/* Workspaces */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/30 text-sm uppercase font-semibold tracking-widest">
              Workspaces
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              title="Create new team"
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#FF4500]/15 hover:bg-[#FF4500] text-[#FF4500] hover:text-white transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData?.workspaces?.map((workspace, idx) => (
              <button
                key={`workspace-${workspace.id || idx}`}
                onClick={() => {
                  if (!workspace.id) return;
                  trackAccess({
                    id:         workspace.id,
                    entityType: "WORKSPACE",
                    entityName: workspace.name,
                  });
                  navigate(`/workspace/${workspace.id}`);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#FF4500]/10 transition"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-[#FF4500]" />
                  <span className="font-medium text-white/70">{workspace.name}</span>
                </div>
                <ExternalLink size={16} className="text-white/30" />
              </button>
            ))}

            {(!dashboardData?.workspaces || dashboardData.workspaces.length === 0) && (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-white/10 hover:border-[#FF4500]/40 text-white/30 hover:text-[#FF4500] transition text-sm"
              >
                <Plus size={15} />
                Create your first team
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-[#FF4500] text-white py-3 rounded-xl hover:bg-[#e03d00] transition font-bold">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <div className="h-[80px] bg-[#111111] border-b border-white/10 px-8 flex items-center justify-between">
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-xl w-[350px]">
            <Search size={18} className="text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none ml-3 w-full text-white placeholder-white/30"
            />
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#e03d00] text-white text-sm font-bold px-4 py-2 rounded-xl transition"
            >
              <Plus size={16} />
              Create Team
            </button>
            <Bell className="text-white/50 cursor-pointer" />
            <div className="w-10 h-10 rounded-full bg-[#FF4500] text-white flex items-center justify-center font-bold">
              M
            </div>
          </div>
        </div>

        <div className="p-8">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#FF4500] to-[#ff6a00] rounded-3xl p-8 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-white/70 text-lg">{dashboardData?.formattedDate}</p>
              <h1 className="text-4xl font-bold mt-2 text-white">
                Hello, {dashboardData?.userName}
              </h1>
              <p className="mt-3 text-white/80">Welcome back to your workspace dashboard.</p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1048/1048941.png"
              alt="banner"
              className="w-[180px]"
            />
          </div>

          {/* Your Apps */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Your Apps</h2>
              <button className="text-[#FF4500] font-semibold hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {dashboardData?.userApps?.map((app, idx) => (
                <button
                  key={`app-${app.id || idx}`}
                  onClick={() => {
                    if (!app.id) return;
                    trackAccess({ id: app.id, type: app.type, entityName: app.name });
                    navigate(app.targetUrl);
                  }}
                  className="bg-[#111111] rounded-2xl p-5 border border-white/10 hover:border-[#FF4500]/50 hover:shadow-lg hover:shadow-[#FF4500]/10 transition text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FF4500]/15 flex items-center justify-center">
                    <FolderKanban className="text-[#FF4500]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{app.name}</h3>
                  <p className="text-sm text-white/40 mt-1">{app.type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Frequently Accessed */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <Star className="text-[#c8f135]" fill="#c8f135" />
              <h2 className="text-2xl font-bold text-white">Frequently Accessed</h2>
            </div>

            <div className="space-y-4">
              {dashboardData?.frequentlyAccessed?.map((item, idx) => (
                <div
                  key={`freq-${item.id || idx}`}
                  className="bg-[#111111] rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:border-[#FF4500]/40 hover:shadow-md hover:shadow-[#FF4500]/5 transition"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                    <p className="text-white/50 mt-1">{item.description}</p>
                    <p className="text-sm text-white/30 mt-2">
                      Last Accessed: {new Date(item.lastAccessedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!item.id) return;
                      trackAccess({
                        id:          item.id,
                        entityType:  item.entityType,
                        entityName:  item.title,
                        description: item.description,
                      });
                      if (item.entityType === "WORKSPACE") {
                        navigate(`/workspace/${item.id}`);
                      }
                    }}
                    className="bg-[#FF4500] text-white px-5 py-2 rounded-xl hover:bg-[#e03d00] transition font-semibold"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, active }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        active
          ? "bg-[#FF4500]/15 text-[#FF4500] font-semibold"
          : "hover:bg-white/5 text-white/60"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}