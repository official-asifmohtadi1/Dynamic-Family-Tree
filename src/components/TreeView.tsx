import React from 'react';
import type { Member, Relationship } from '../types';
import { TreeCanvas } from './TreeCanvas';
import { ZoomIn, ZoomOut, Maximize2, Search, X, Printer } from 'lucide-react';

interface TreeViewProps {
  members: Member[];
  relationships: Relationship[];
  focusMemberId: string | null;
  onClearFocusBranch: () => void;
  onSelectMember: (member: Member) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hoveredMemberId: string | null;
  setHoveredMemberId: (id: string | null) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  centerMemberId: string | null;
  setCenterMemberId: (id: string | null) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  members,
  relationships,
  focusMemberId,
  onClearFocusBranch,
  onSelectMember,
  searchQuery,
  setSearchQuery,
  hoveredMemberId,
  setHoveredMemberId,
  zoom,
  setZoom,
  pan,
  setPan,
  centerMemberId,
  setCenterMemberId,
}) => {
  // Find name of focus member
  const focusMember = members.find((m) => m.id === focusMemberId) || null;

  // Compute search autocomplete results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return members
      .filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, members]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(Math.min(3, zoom * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.15, zoom / 1.2));
  };

  // Recenter (Fit to Screen) trigger helper
  const handleRecenter = () => {
    setZoom(0); 
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Branch Focus Banner */}
      {focusMember && (
        <div className="focus-banner glass">
          <div className="focus-banner-text">
            Viewing lineage of <span>{focusMember.firstName} {focusMember.lastName}</span>
          </div>
          <button className="clear-focus-btn" onClick={onClearFocusBranch}>
            Show Full Tree
          </button>
        </div>
      )}

      {/* Floating HUD Controls */}
      <div className="hud-controls">
        <div className="hud-group glass">
          <button className="hud-button" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button className="hud-button" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button className="hud-button" onClick={handleRecenter} title="Fit to Screen">
            <Maximize2 size={18} />
          </button>
          <button className="hud-button" onClick={() => window.print()} title="Print / Export to PDF">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Search HUD Container */}
      <div className="search-hud-container">
        <div className="search-hud glass">
          <Search size={18} color="hsl(var(--text-muted))" />
          <input
            type="text"
            className="search-input"
            placeholder="Locate family member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'hsl(var(--text-secondary))',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="search-results-dropdown glass">
            {searchResults.map((m) => (
              <button
                key={m.id}
                className="search-result-item"
                onClick={() => {
                  onSelectMember(m);
                  setCenterMemberId(m.id);
                  setSearchQuery(''); // clear query to close dropdown
                }}
              >
                <span className="search-result-name">
                  {m.firstName} {m.lastName}
                </span>
                <span className="search-result-sub">
                  Born {m.dob ? m.dob.split('-')[0] : '?'} · {m.gender}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <TreeCanvas
        members={members}
        relationships={relationships}
        focusMemberId={focusMemberId}
        searchQuery={searchQuery}
        onSelectMember={onSelectMember}
        hoveredMemberId={hoveredMemberId}
        setHoveredMemberId={setHoveredMemberId}
        zoom={zoom}
        setZoom={(z) => {
          if (z === 0) {
            setZoom(0.999); 
          } else {
            setZoom(z);
          }
        }}
        pan={pan}
        setPan={setPan}
        centerMemberId={centerMemberId}
        onClearCenterMember={() => setCenterMemberId(null)}
      />
    </div>
  );
};
