import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { Member, Relationship } from '../types';
import { MemberNode } from './MemberNode';
import { calculateLayout } from '../utils/layout';
import type { TreeLayout } from '../utils/layout';

interface TreeCanvasProps {
  members: Member[];
  relationships: Relationship[];
  focusMemberId: string | null;
  searchQuery: string;
  onSelectMember: (member: Member) => void;
  hoveredMemberId: string | null;
  setHoveredMemberId: (id: string | null) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  centerMemberId: string | null;
  onClearCenterMember: () => void;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  members,
  relationships,
  focusMemberId,
  searchQuery,
  onSelectMember,
  hoveredMemberId,
  setHoveredMemberId,
  zoom,
  setZoom,
  pan,
  setPan,
  centerMemberId,
  onClearCenterMember,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);
  const touchStartPan = useRef({ x: 0, y: 0 });
  const touchStartZoom = useRef(1);

  // Compute Layout (memoized for performance optimization)
  const layout = useMemo(() => {
    return calculateLayout(members, relationships, focusMemberId);
  }, [members, relationships, focusMemberId]);

  // Filter highlights based on hover
  const relatedMemberIds = new Set<string>();
  if (hoveredMemberId) {
    relatedMemberIds.add(hoveredMemberId);
    relationships.forEach((r) => {
      if (r.spouseId1 === hoveredMemberId && r.spouseId2) relatedMemberIds.add(r.spouseId2);
      if (r.spouseId2 === hoveredMemberId && r.spouseId1) relatedMemberIds.add(r.spouseId1);
      if (r.parentId === hoveredMemberId && r.childId) relatedMemberIds.add(r.childId);
      if (r.childId === hoveredMemberId && r.parentId) relatedMemberIds.add(r.parentId);
    });
  }

  // Double-tap or Fit-to-Screen center helper
  const fitToScreen = () => {
    if (!containerRef.current || layout.nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Find tree bounding box center
    const treeWidth = layout.dimensions.maxX - layout.dimensions.minX;
    const treeHeight = layout.dimensions.maxY - layout.dimensions.minY;
    const treeCenterX = layout.dimensions.minX + treeWidth / 2;
    const treeCenterY = layout.dimensions.minY + treeHeight / 2;

    // Viewport size
    const viewWidth = rect.width;
    const viewHeight = rect.height;

    // Calculate zoom to fit
    const zoomX = (viewWidth - 100) / treeWidth;
    const zoomY = (viewHeight - 100) / treeHeight;
    const newZoom = Math.max(0.2, Math.min(1.2, Math.min(zoomX, zoomY)));

    // Calculate pan to center
    const newPanX = viewWidth / 2 - treeCenterX * newZoom;
    const newPanY = viewHeight / 2 - treeCenterY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Run fitToScreen on layout change or initial load
  useEffect(() => {
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMemberId, members.length, relationships.length]);

  // Handle manual recenter requests (sentinel zoom = 0.999)
  useEffect(() => {
    if (zoom === 0.999) {
      fitToScreen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // Handle focusing/centering on a specific family member node
  useEffect(() => {
    if (centerMemberId && containerRef.current && layout.nodes.length > 0) {
      const node = layout.nodes.find((n) => n.member.id === centerMemberId);
      if (node) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewWidth = rect.width;
        const viewHeight = rect.height;

        const targetZoom = 1.0;
        const targetX = node.x;
        const targetY = node.y + 45; // Center of the 90px card height

        const newPanX = viewWidth / 2 - targetX * targetZoom;
        const newPanY = viewHeight / 2 - targetY * targetZoom;

        setZoom(targetZoom);
        setPan({ x: newPanX, y: newPanY });
      }
      onClearCenterMember();
    }
  }, [centerMemberId, layout.nodes, setZoom, setPan, onClearCenterMember]);

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.member-node')) return; // ignore click on card
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zooming via Wheel
  const handleWheel = (e: React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    const zoomStep = 1.1;
    let newZoom = e.deltaY < 0 ? zoom * zoomStep : zoom / zoomStep;
    newZoom = Math.max(0.15, Math.min(3, newZoom));

    setZoom(newZoom);
    setPan({
      x: mouseX - canvasX * newZoom,
      y: mouseY - canvasY * newZoom,
    });
  };

  // Mobile Touch Support (Pinch-to-zoom and Pan)
  const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchMid = (t1: React.Touch, t2: React.Touch) => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.member-node')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      touchStartDist.current = dist;
      touchStartPan.current = { ...pan };
      touchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    } else if (e.touches.length === 2 && touchStartDist.current !== null && containerRef.current) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const factor = dist / touchStartDist.current;
      
      let newZoom = touchStartZoom.current * factor;
      newZoom = Math.max(0.15, Math.min(3, newZoom));

      const rect = containerRef.current.getBoundingClientRect();
      const mid = getTouchMid(e.touches[0], e.touches[1]);
      const midX = mid.x - rect.left;
      const midY = mid.y - rect.top;

      const canvasX = (midX - touchStartPan.current.x) / touchStartZoom.current;
      const canvasY = (midY - touchStartPan.current.y) / touchStartZoom.current;

      setZoom(newZoom);
      setPan({
        x: midX - canvasX * newZoom,
        y: midY - canvasY * newZoom,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  // Determine lines classes for highlighting
  const getLineState = (line: TreeLayout['lines'][0]) => {
    if (!hoveredMemberId) return 'normal';
    
    // Extrapolate member IDs from the line ID
    // e.g. "spouse-m1-m2" -> spouse link between m1 and m2
    // e.g. "child-connect-m1-m3" -> parent connection from m1 to m3
    const ids = line.id.split('-');
    
    // Check if the connection connects any hovered relationships
    if (line.type === 'spouse') {
      const m1 = ids[1];
      const m2 = ids[2];
      if ((m1 === hoveredMemberId && m2 === spouseMapGet(m1)) || (m2 === hoveredMemberId && m1 === spouseMapGet(m2))) {
        return 'highlighted';
      }
    } else if (line.id.startsWith('split-')) {
      const parentId = ids[1];
      if (parentId === hoveredMemberId) {
        return 'highlighted';
      }
      // Highlight parent-split if children of parent are hovered
      const childrenIds = relationships
        .filter((r) => r.parentId === parentId && r.childId)
        .map((r) => r.childId!);
      if (childrenIds.includes(hoveredMemberId)) {
        return 'highlighted';
      }
    } else if (line.id.startsWith('bar-')) {
      const parentId = ids[1];
      // Highlight sibling-bar if parent or any of the children are hovered
      if (parentId === hoveredMemberId) return 'highlighted';
      const childrenIds = relationships
        .filter((r) => r.parentId === parentId && r.childId)
        .map((r) => r.childId!);
      if (childrenIds.includes(hoveredMemberId)) return 'highlighted';
    } else if (line.id.startsWith('child-connect-')) {
      const parentId = ids[2];
      const childId = ids[3];
      if (parentId === hoveredMemberId || childId === hoveredMemberId) {
        return 'highlighted';
      }
    }

    return 'muted';
  };

  const spouseMapGet = (id: string): string | undefined => {
    const relation = relationships.find(
      (r) => r.spouseId1 === id || r.spouseId2 === id
    );
    if (!relation) return undefined;
    return relation.spouseId1 === id ? relation.spouseId2 : relation.spouseId1;
  };

  return (
    <div
      ref={containerRef}
      className="tree-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="tree-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: layout.dimensions.width || '100%',
          height: layout.dimensions.height || '100%',
        }}
      >
        {/* SVG connection lines layer */}
        {layout.nodes.length > 0 && (
          <svg
            className="svg-layer"
            style={{
              left: layout.dimensions.minX,
              top: layout.dimensions.minY,
              width: layout.dimensions.maxX - layout.dimensions.minX,
              height: layout.dimensions.maxY - layout.dimensions.minY,
            }}
            viewBox={`${layout.dimensions.minX} ${layout.dimensions.minY} ${
              layout.dimensions.maxX - layout.dimensions.minX
            } ${layout.dimensions.maxY - layout.dimensions.minY}`}
          >
            {layout.lines.map((line) => {
              const lineState = getLineState(line);
              return (
                <path
                  key={line.id}
                  d={line.path}
                  className={`connection-line ${line.type} ${
                    lineState === 'highlighted' ? 'highlighted' : ''
                  } ${lineState === 'muted' ? 'muted' : ''}`}
                />
              );
            })}
          </svg>
        )}

        {/* HTML nodes layer */}
        {layout.nodes.map(({ member, x, y }) => {
          let state: 'normal' | 'highlighted' | 'muted' = 'normal';
          
          if (hoveredMemberId) {
            state = relatedMemberIds.has(member.id) ? 'highlighted' : 'muted';
          }

          // Search matches filter (glow green/blue if match)
          const isSearchMatch =
            searchQuery.trim() !== '' &&
            `${member.firstName} ${member.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          if (isSearchMatch) {
            state = 'highlighted';
          }

          return (
            <MemberNode
              key={member.id}
              member={member}
              x={x}
              y={y}
              relationState={state}
              onHoverStart={() => setHoveredMemberId(member.id)}
              onHoverEnd={() => setHoveredMemberId(null)}
              onClick={() => onSelectMember(member)}
            />
          );
        })}
      </div>
    </div>
  );
};
