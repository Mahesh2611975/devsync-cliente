import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch primary dashboard data
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}`);
        setData(ws);

        // 2. Fetch pending approvals independently to prevent 403 from breaking the view
        try {
          const reqs = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}/pending-approvals`);
          setPending(reqs?.pendingRequests || reqs || []);
        } catch (err) {
          console.warn("Pending approvals restricted or unavailable:", err.message);
          setPending([]); // Fallback to empty list on permission error
        }
      } catch (e) {
        console.error("Critical Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workspaceId]);

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-6">
        <div>
          <h2 className="text-[#FF4500] font-black text-xl mb-10">DevSync</h2>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Channels</p>
            <div className="space-y-2">
              {data?.channels?.map(ch => (
                <div key={ch.id} className="text-sm text-gray-300 hover:text-[#FF4500] cursor-pointer transition">
                  # {ch.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Only show button if there are pending requests or treat it as an Admin feature */}
        <button className="text-left text-sm text-gray-400 hover:text-white flex items-center justify-between group">
          Manage Team
          {pending.length > 0 && (
            <span className="bg-[#FF4500] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-10">
        {loading ? (
          <div className="text-gray-500">Loading your workspace...</div>
        ) : (
          <div className="max-w-4xl">
            <p className="text-xs text-[#FF4500] font-bold uppercase tracking-widest mb-1">
              {data?.formattedDate}
            </p>
            <h1 className="text-4xl font-black mb-2">{data?.workspace?.name || "Workspace"}</h1>
            <p className="text-gray-500 mb-10">Welcome back to your team dashboard.</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Members</p>
                <p className="text-5xl font-bold mt-2">{data?.totalMembers ?? 0}</p>
              </div>
              <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Channels</p>
                <p className="text-5xl font-bold mt-2">{data?.totalChannels ?? 0}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}