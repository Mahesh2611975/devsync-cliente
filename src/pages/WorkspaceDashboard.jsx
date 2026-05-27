import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from '../components/dashboard/Sidebar';
import FeatureHeader from '../components/dashboard/FeatureHeader';
import ModuleContainer from '../components/dashboard/ModuleContainer';
import TeamManagementModal from './TeamManagementModal';

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  
  // Clean, scalable state
  const [nav, setNav] = useState({
    activeFeature: 'overview',
    selectedChannel: null,
    selectedBugRoom: null,
    selectedDeployment: null
  });

  const currentUserId = data?.currentUserId || data?.userId || 1;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const ws = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}`);
        if (!isMounted) return;
        setData(ws);

        try {
          const reqs = await safeFetch(`/api/v1/dashboard/workspace/${workspaceId}/pending-approvals`);
          if (isMounted) setPending(reqs?.pendingRequests || reqs || []);
        } catch (err) {
          console.warn("Pending approvals restricted or unavailable:", err.message);
          if (isMounted) setPending([]);
        }
      } catch (e) {
        console.error("Critical Fetch Error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [workspaceId]);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar 
        data={data} 
        nav={nav} 
        setNav={setNav} 
        setIsTeamModalOpen={setIsTeamModalOpen} 
        pending={pending}
      />
      
      <main className="flex-1 flex flex-col bg-[#050505] overflow-y-auto">
        <FeatureHeader activeFeature={nav.activeFeature} />
        
        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-gray-600 animate-pulse font-mono text-sm">Synchronizing workspace components...</div>
          ) : (
            <ModuleContainer nav={nav} workspaceData={data} />
          )}
        </div>
      </main>

      <TeamManagementModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        teamId={workspaceId} 
        currentUserId={currentUserId}
      />
    </div>
  );
}