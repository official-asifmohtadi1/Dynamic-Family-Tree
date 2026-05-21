import React, { useMemo } from 'react';
import type { Member, Relationship } from '../types';
import { X, Users, Heart, GitBranch, Crown, Calendar, TrendingUp, Baby } from 'lucide-react';

interface StatsPanelProps {
  members: Member[];
  relationships: Relationship[];
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ members, relationships, onClose }) => {
  const stats = useMemo(() => {
    if (members.length === 0) return null;

    // Gender breakdown
    const males = members.filter((m) => m.gender === 'Male').length;
    const females = members.filter((m) => m.gender === 'Female').length;
    const others = members.filter((m) => m.gender === 'Other').length;

    // Living vs deceased
    const living = members.filter((m) => !m.dod).length;
    const deceased = members.filter((m) => !!m.dod).length;

    // Oldest & youngest (among those with birth dates)
    const withDob = members.filter((m) => m.dob);
    let oldest: Member | null = null;
    let youngest: Member | null = null;
    if (withDob.length > 0) {
      oldest = withDob.reduce((a, b) => (a.dob < b.dob ? a : b));
      youngest = withDob.reduce((a, b) => (a.dob > b.dob ? a : b));
    }

    // Total relationships
    const spouseRelations = relationships.filter((r) => r.spouseId1 && r.spouseId2).length;
    const parentChildRelations = relationships.filter((r) => r.parentId && r.childId).length;

    // Most connected member (most relationships)
    const connectionCount = new Map<string, number>();
    members.forEach((m) => connectionCount.set(m.id, 0));
    relationships.forEach((r) => {
      if (r.spouseId1) connectionCount.set(r.spouseId1, (connectionCount.get(r.spouseId1) || 0) + 1);
      if (r.spouseId2) connectionCount.set(r.spouseId2, (connectionCount.get(r.spouseId2) || 0) + 1);
      if (r.parentId) connectionCount.set(r.parentId, (connectionCount.get(r.parentId) || 0) + 1);
      if (r.childId) connectionCount.set(r.childId, (connectionCount.get(r.childId) || 0) + 1);
    });
    let mostConnectedId = '';
    let maxConnections = 0;
    connectionCount.forEach((count, id) => {
      if (count > maxConnections) {
        maxConnections = count;
        mostConnectedId = id;
      }
    });
    const mostConnected = members.find((m) => m.id === mostConnectedId) || null;

    // Generation depth: BFS from roots
    const parentMap = new Map<string, string[]>();
    const childMap = new Map<string, string[]>();
    relationships.forEach((r) => {
      if (r.parentId && r.childId) {
        const parents = parentMap.get(r.childId) || [];
        parents.push(r.parentId);
        parentMap.set(r.childId, parents);
        const children = childMap.get(r.parentId) || [];
        children.push(r.childId);
        childMap.set(r.parentId, children);
      }
    });
    const roots = members.filter((m) => !parentMap.has(m.id) || parentMap.get(m.id)!.length === 0);
    const depthMap = new Map<string, number>();
    const queue: { id: string; depth: number }[] = roots.map((r) => ({ id: r.id, depth: 0 }));
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depthMap.has(id) && depthMap.get(id)! >= depth) continue;
      depthMap.set(id, depth);
      (childMap.get(id) || []).forEach((childId) => queue.push({ id: childId, depth: depth + 1 }));
    }
    const maxDepth = Math.max(0, ...Array.from(depthMap.values()));
    const generations = maxDepth + 1;

    // Average age (for deceased members with both dob and dod)
    const withFullDates = members.filter((m) => m.dob && m.dod);
    let avgLifespan: number | null = null;
    if (withFullDates.length > 0) {
      const totalYears = withFullDates.reduce((sum, m) => {
        const birth = parseInt(m.dob.split('-')[0]);
        const death = parseInt(m.dod!.split('-')[0]);
        return sum + (death - birth);
      }, 0);
      avgLifespan = Math.round(totalYears / withFullDates.length);
    }

    return {
      total: members.length,
      males,
      females,
      others,
      living,
      deceased,
      oldest,
      youngest,
      spouseRelations,
      parentChildRelations,
      mostConnected,
      maxConnections,
      generations,
      avgLifespan,
    };
  }, [members, relationships]);

  if (!stats) return null;

  const StatCard = ({
    icon,
    label,
    value,
    sub,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
  }) => (
    <div className="stat-card glass">
      <div className="stat-icon" style={{ color: color || 'hsl(var(--color-primary))' }}>
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container glass stats-panel-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="stats-panel-header">
          <TrendingUp size={24} style={{ color: 'hsl(var(--color-primary))' }} />
          <h2 className="stats-panel-title">Family Tree Analytics</h2>
          <p className="stats-panel-subtitle">
            Statistical overview of {stats.total} family members across {stats.generations} generation
            {stats.generations !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={<Users size={22} />}
            label="Total Members"
            value={stats.total}
            sub={`${stats.living} living · ${stats.deceased} deceased`}
          />
          <StatCard
            icon={<Heart size={22} />}
            label="Couples / Marriages"
            value={stats.spouseRelations}
            sub={`${stats.parentChildRelations} parent-child links`}
            color="hsl(var(--color-female))"
          />
          <StatCard
            icon={<GitBranch size={22} />}
            label="Generations"
            value={stats.generations}
            sub="depth of family tree"
            color="hsl(var(--color-secondary))"
          />
          {stats.avgLifespan !== null && (
            <StatCard
              icon={<Calendar size={22} />}
              label="Avg. Lifespan"
              value={`${stats.avgLifespan} yrs`}
              sub={`based on ${members.filter((m) => m.dob && m.dod).length} records`}
              color="hsl(280 90% 65%)"
            />
          )}
        </div>

        <div className="stats-section">
          <h3 className="stats-section-title">Gender Breakdown</h3>
          <div className="gender-bar-wrapper">
            {stats.total > 0 && (
              <div className="gender-bar">
                {stats.males > 0 && (
                  <div
                    className="gender-bar-segment male"
                    style={{ width: `${(stats.males / stats.total) * 100}%` }}
                    title={`Male: ${stats.males}`}
                  />
                )}
                {stats.females > 0 && (
                  <div
                    className="gender-bar-segment female"
                    style={{ width: `${(stats.females / stats.total) * 100}%` }}
                    title={`Female: ${stats.females}`}
                  />
                )}
                {stats.others > 0 && (
                  <div
                    className="gender-bar-segment other"
                    style={{ width: `${(stats.others / stats.total) * 100}%` }}
                    title={`Other: ${stats.others}`}
                  />
                )}
              </div>
            )}
            <div className="gender-legend">
              <span className="gender-legend-item">
                <span className="gender-dot male" /> Male ({stats.males})
              </span>
              <span className="gender-legend-item">
                <span className="gender-dot female" /> Female ({stats.females})
              </span>
              {stats.others > 0 && (
                <span className="gender-legend-item">
                  <span className="gender-dot other" /> Other ({stats.others})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="stats-highlights">
          {stats.oldest && (
            <div className="highlight-card glass">
              <Crown size={16} style={{ color: 'hsl(45 100% 60%)' }} />
              <div>
                <div className="highlight-label">Oldest Member</div>
                <div className="highlight-name">
                  {stats.oldest.firstName} {stats.oldest.lastName}
                </div>
                <div className="highlight-detail">Born {stats.oldest.dob?.split('-')[0]}</div>
              </div>
            </div>
          )}
          {stats.youngest && stats.youngest.id !== stats.oldest?.id && (
            <div className="highlight-card glass">
              <Baby size={16} style={{ color: 'hsl(var(--color-secondary))' }} />
              <div>
                <div className="highlight-label">Youngest Member</div>
                <div className="highlight-name">
                  {stats.youngest.firstName} {stats.youngest.lastName}
                </div>
                <div className="highlight-detail">Born {stats.youngest.dob?.split('-')[0]}</div>
              </div>
            </div>
          )}
          {stats.mostConnected && stats.maxConnections > 0 && (
            <div className="highlight-card glass">
              <GitBranch size={16} style={{ color: 'hsl(var(--color-primary))' }} />
              <div>
                <div className="highlight-label">Most Connected</div>
                <div className="highlight-name">
                  {stats.mostConnected.firstName} {stats.mostConnected.lastName}
                </div>
                <div className="highlight-detail">{stats.maxConnections} relationships</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
