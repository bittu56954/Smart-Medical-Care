import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Footer from '../components/common/Footer';
import {
  Users,
  Pill,
  Scan,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  AlertTriangle,
  PackageCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [scans, setScans] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const results = await Promise.allSettled([
        adminService.getAdminStats(),
        adminService.getAllUsers(),
        adminService.getAllMedicines(),
        adminService.getAllScans()
      ]);

      const [statRes, userRes, medRes, scanRes] = results;

      if (statRes.status === 'fulfilled' && statRes.value?.data?.success) {
        setStats(statRes.value.data.stats);
      }
      if (userRes.status === 'fulfilled' && userRes.value?.data?.success) {
        setUsers(userRes.value.data.users || []);
      }
      if (medRes.status === 'fulfilled' && medRes.value?.data?.success) {
        setMedicines(medRes.value.data.medicines || []);
      }
      if (scanRes.status === 'fulfilled' && scanRes.value?.data?.success) {
        setScans(scanRes.value.data.scans || []);
      }
    } catch (err) {
      console.warn('[ADMIN DASHBOARD] Data loading notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account and all their saved data?')) return;

    try {
      const res = await adminService.deleteUser(userId);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Admin Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, background: 'var(--danger-bg)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Administrator Portal
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0 0', letterSpacing: '-0.5px' }}>
              Smart Medical Care Oversight & Analytics
            </h1>
          </div>
        </div>

        {error && <Alert type="danger" message={error} />}

        {loading ? (
          <LoadingSpinner text="Fetching platform statistics..." />
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registered Users</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>{stats?.totalUsers || 0}</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Saved Medicines</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', marginTop: '0.2rem' }}>{stats?.totalMedicines || 0}</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Scans Logged</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.2rem' }}>{stats?.totalScans || 0}</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unidentified Scans</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{stats?.unidentifiedScans || 0}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
              {[
                { key: 'users', label: `Users (${users.length})` },
                { key: 'medicines', label: `Medicines (${medicines.length})` },
                { key: 'scans', label: `Scan Audit (${scans.length})` }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeTab === tab.key ? '#0284c7' : 'var(--bg-surface)',
                    color: activeTab === tab.key ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Users */}
            {activeTab === 'users' && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        <th style={{ padding: '1rem 1.5rem' }}>User</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Email</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Role</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Verified</th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', background: u.role === 'admin' ? 'var(--danger-bg)' : 'var(--info-bg)', color: u.role === 'admin' ? '#ef4444' : '#0284c7' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', background: u.isVerified ? 'var(--success-bg)' : 'var(--warning-bg)', color: u.isVerified ? 'var(--success-text)' : 'var(--warning-text)' }}>
                              {u.isVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleToggleRole(u._id, u.role)}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Toggle Role
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--danger-border)', background: 'var(--danger-bg)', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Medicines */}
            {activeTab === 'medicines' && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        <th style={{ padding: '1rem 1.5rem' }}>Medicine Name</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Generic Formula</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Manufacturer</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m) => (
                        <tr key={m._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{m.name}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#0d9488', fontWeight: 600 }}>{m.genericName}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{m.manufacturer}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: m.status === 'expired' ? '#ef4444' : 'var(--text-main)' }}>{m.expDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Scans */}
            {activeTab === 'scans' && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        <th style={{ padding: '1rem 1.5rem' }}>Scan Event</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Confidence</th>
                        <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.imageName || 'Scanned Label'}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', background: s.status === 'identified' ? 'var(--success-bg)' : 'var(--danger-bg)', color: s.status === 'identified' ? 'var(--success-text)' : 'var(--danger-text)' }}>
                              {s.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{s.confidenceScore || 0}%</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(s.scanDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
