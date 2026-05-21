import { useState, useEffect } from 'react';
import type { Member, Relationship } from './types';
import { INITIAL_MEMBERS, INITIAL_RELATIONSHIPS } from './utils/sampleData';
import { Navbar } from './components/Navbar';
import { TreeView } from './components/TreeView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberDetailModal } from './components/MemberDetailModal';
import { StatsPanel } from './components/StatsPanel';
import { Toast } from './components/Toast';
import type { ToastType } from './components/Toast';

export default function App() {
  // Global Database state
  const [members, setMembers] = useState<Member[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Navigation and Auth states
  const [currentView, setView] = useState<'tree' | 'admin'>('tree');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('heritage_admin_auth') === 'true';
  });

  // UI Focus & Search states
  const [focusMemberId, setFocusMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [centerMemberId, setCenterMemberId] = useState<string | null>(null);

  // Zoom & Pan persistence
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 100, y: 100 });

  // Detail Modal overlay
  const [selectedDetailMember, setSelectedDetailMember] = useState<Member | null>(null);

  // Stats panel
  const [showStats, setShowStats] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // 1. Initial Data Loading
  useEffect(() => {
    const storedMembers = localStorage.getItem('heritage_members');
    const storedRelationships = localStorage.getItem('heritage_relationships');

    if (storedMembers && storedRelationships) {
      setMembers(JSON.parse(storedMembers));
      setRelationships(JSON.parse(storedRelationships));
    } else {
      setMembers(INITIAL_MEMBERS);
      setRelationships(INITIAL_RELATIONSHIPS);
      localStorage.setItem('heritage_members', JSON.stringify(INITIAL_MEMBERS));
      localStorage.setItem('heritage_relationships', JSON.stringify(INITIAL_RELATIONSHIPS));
    }
  }, []);

  // Show dynamic toast helper
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Sync auth state to localStorage
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('heritage_admin_auth', 'true');
    showToast('Logged in as administrator.', 'success');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('heritage_admin_auth');
    showToast('Admin logged out.', 'success');
  };

  // 2. CRUD Operations
  const handleAddMember = (newMember: Member) => {
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem('heritage_members', JSON.stringify(updated));
  };

  const handleUpdateMember = (updatedMember: Member) => {
    const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    setMembers(updated);
    localStorage.setItem('heritage_members', JSON.stringify(updated));
    if (selectedDetailMember && selectedDetailMember.id === updatedMember.id) {
      setSelectedDetailMember(updatedMember);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.filter((m) => m.id !== memberId);
    setMembers(updatedMembers);
    localStorage.setItem('heritage_members', JSON.stringify(updatedMembers));

    const updatedRelations = relationships.filter(
      (r) =>
        r.spouseId1 !== memberId &&
        r.spouseId2 !== memberId &&
        r.parentId !== memberId &&
        r.childId !== memberId
    );
    setRelationships(updatedRelations);
    localStorage.setItem('heritage_relationships', JSON.stringify(updatedRelations));

    if (focusMemberId === memberId) {
      setFocusMemberId(null);
    }
  };

  const handleAddRelationship = (newRelation: Relationship) => {
    const updated = [...relationships, newRelation];
    setRelationships(updated);
    localStorage.setItem('heritage_relationships', JSON.stringify(updated));
  };

  const handleDeleteRelationship = (relationId: string) => {
    const updated = relationships.filter((r) => r.id !== relationId);
    setRelationships(updated);
    localStorage.setItem('heritage_relationships', JSON.stringify(updated));
  };

  // 3. Export: Download family data as JSON file
  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      members,
      relationships,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `heritage-family-tree-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${members.length} members successfully!`, 'success');
  };

  // 4. Import: Read a JSON backup and restore data
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const data = JSON.parse(raw);

        // Validate structure
        if (!Array.isArray(data.members) || !Array.isArray(data.relationships)) {
          showToast('Invalid file format. Expected { members, relationships }.', 'error');
          return;
        }

        const confirmed = window.confirm(
          `This will replace all current data with ${data.members.length} members and ${data.relationships.length} relationships from the backup.\n\nContinue?`
        );
        if (!confirmed) return;

        setMembers(data.members);
        setRelationships(data.relationships);
        localStorage.setItem('heritage_members', JSON.stringify(data.members));
        localStorage.setItem('heritage_relationships', JSON.stringify(data.relationships));
        setFocusMemberId(null);
        setSelectedDetailMember(null);
        showToast(
          `Imported ${data.members.length} members and ${data.relationships.length} relationships!`,
          'success'
        );
      } catch {
        showToast('Failed to parse the file. Please use a valid Heritage JSON export.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setView={setView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onShowStats={() => setShowStats(true)}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Container Viewport */}
      <main className="main-content">
        {currentView === 'tree' ? (
          <TreeView
            members={members}
            relationships={relationships}
            focusMemberId={focusMemberId}
            onClearFocusBranch={() => setFocusMemberId(null)}
            onSelectMember={(m) => setSelectedDetailMember(m)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hoveredMemberId={hoveredMemberId}
            setHoveredMemberId={setHoveredMemberId}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            centerMemberId={centerMemberId}
            setCenterMemberId={setCenterMemberId}
          />
        ) : !isAdmin ? (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AdminDashboard
            members={members}
            relationships={relationships}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onAddRelationship={handleAddRelationship}
            onDeleteRelationship={handleDeleteRelationship}
            showToast={showToast}
          />
        )}
      </main>

      {/* Stats Panel Overlay */}
      {showStats && (
        <StatsPanel
          members={members}
          relationships={relationships}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Member Details Modal Overlay */}
      {selectedDetailMember && (
        <MemberDetailModal
          member={selectedDetailMember}
          allMembers={members}
          relationships={relationships}
          onClose={() => setSelectedDetailMember(null)}
          onSelectMember={(id) => {
            const next = members.find((m) => m.id === id);
            if (next) setSelectedDetailMember(next);
            setCenterMemberId(id);
          }}
          onFocusBranch={(id) => setFocusMemberId(id)}
          isFocusedBranch={focusMemberId === selectedDetailMember.id}
          onClearFocusBranch={() => setFocusMemberId(null)}
        />
      )}

      {/* Toast Overlay */}
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
