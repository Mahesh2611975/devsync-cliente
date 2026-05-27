import React, { useState, useEffect } from 'react';
import { safeFetch } from '../utils/safeFetch';

const TeamManagementModal = ({ isOpen, onClose, teamId, currentUserId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchMembers();
    }
  }, [isOpen, teamId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeFetch(`/api/teams/${teamId}/members`);
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMember = async (requestId) => {
    try {
      await safeFetch(`/api/teams/approve/${requestId}`, {
        method: 'POST',
      });
      fetchMembers(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await safeFetch(`/api/teams/${teamId}/members/${memberUserId}`, {
        method: 'DELETE',
      });
      setMembers(members.filter(member => member.userId !== memberUserId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  const isCurrentUserLead = members.find(m => m.userId === currentUserId)?.role === 'LEAD';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Team Management</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body Content */}
        <div style={styles.body}>
          {loading && <p style={styles.infoText}>Loading team members...</p>}
          {error && <p style={styles.errorText}>Error: {error}</p>}
          
          {!loading && !error && members.length === 0 && (
            <p style={styles.infoText}>No members found in this workspace.</p>
          )}

          {!loading && members.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={styles.username}>{member.userName || `User #${member.userId}`}</strong>
                      {member.userId === currentUserId && <span style={styles.youBadge}> (You)</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge(member.role)}>{member.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(member.status)}>{member.status}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        {member.status === 'PENDING' && isCurrentUserLead && (
                          <button onClick={() => handleApproveMember(member.userId)} style={styles.approveBtn}>
                            Approve
                          </button>
                        )}

                        {(isCurrentUserLead || member.userId === currentUserId) && member.role !== 'LEAD' && (
                          <button 
                            onClick={() => handleRemoveMember(member.userId)}
                            style={member.userId === currentUserId ? styles.leaveBtn : styles.removeBtn}
                          >
                            {member.userId === currentUserId ? 'Leave' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', color: '#FFFFFF' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.025em' },
  closeButton: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', padding: '4px', borderRadius: '4px' },
  body: { maxHeight: '400px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', color: '#888', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', verticalAlign: 'middle', fontSize: '14px' },
  username: { fontWeight: '600', color: '#FFF' },
  actionGroup: { display: 'flex', gap: '8px' },
  approveBtn: { backgroundColor: '#FF4500', color: '#000', fontWeight: '700', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  removeBtn: { backgroundColor: '#DC3545', color: '#FFF', fontWeight: '600', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  leaveBtn: { backgroundColor: '#333333', color: '#FFF', fontWeight: '600', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  errorText: { color: '#FF4500', fontWeight: 'bold', fontSize: '14px' },
  infoText: { color: '#888', fontSize: '14px' },
  youBadge: { fontSize: '12px', color: '#FF4500', fontWeight: '500' },
  roleBadge: (role) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: role === 'LEAD' ? 'rgba(255, 69, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: role === 'LEAD' ? '#FF4500' : '#CCC', border: role === 'LEAD' ? '1px solid rgba(255, 69, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)' }),
  statusBadge: (status) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: status === 'APPROVED' ? 'rgba(40, 167, 69, 0.15)' : 'rgba(255, 193, 7, 0.15)', color: status === 'APPROVED' ? '#28C76F' : '#FF9F43' }),
};

export default TeamManagementModal;