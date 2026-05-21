import type { Member, Relationship } from '../types';

export interface TreeLayout {
  nodes: {
    member: Member;
    x: number;
    y: number;
    isSpouse: boolean;
    spouseId: string | null;
  }[];
  lines: {
    id: string;
    type: 'spouse' | 'parent-child';
    path: string; // SVG path string (M ... L ... or cubic Bezier)
  }[];
  dimensions: {
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

const CARD_WIDTH = 220;
const CARD_HEIGHT = 90;
const SPOUSE_SPACING = 40; // horizontal spacing between spouse cards
const LEVEL_SPACING = 180; // vertical spacing between generations
const FAMILY_SPACING = 60; // horizontal spacing between sibling families

interface SubtreeLayout {
  id: string; // member id
  spouseId: string | null;
  children: SubtreeLayout[];
  width: number;
  x: number;
  y: number;
}

export function calculateLayout(
  members: Member[],
  relationships: Relationship[],
  focusMemberId: string | null = null
): TreeLayout {
  // If no members, return empty layout
  if (members.length === 0) {
    return {
      nodes: [],
      lines: [],
      dimensions: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
    };
  }

  // 1. Filter members if there is a focus branch
  let activeMembers = [...members];
  let activeRelationships = [...relationships];

  if (focusMemberId) {
    const branchIds = getBranchMemberIds(focusMemberId, members, relationships);
    activeMembers = members.filter((m) => branchIds.has(m.id));
    activeRelationships = relationships.filter(
      (r) =>
        (r.parentId && branchIds.has(r.parentId) && r.childId && branchIds.has(r.childId)) ||
        (r.spouseId1 && branchIds.has(r.spouseId1) && r.spouseId2 && branchIds.has(r.spouseId2))
    );
  }

  // Helper maps
  const memberMap = new Map<string, Member>();
  activeMembers.forEach((m) => memberMap.set(m.id, m));

  const spouseMap = new Map<string, string>(); // memberId -> spouseId
  const childrenMap = new Map<string, string[]>(); // memberId -> childIds
  const parentMap = new Map<string, string[]>(); // childId -> parentIds

  activeRelationships.forEach((r) => {
    if (r.spouseId1 && r.spouseId2) {
      if (memberMap.has(r.spouseId1) && memberMap.has(r.spouseId2)) {
        spouseMap.set(r.spouseId1, r.spouseId2);
        spouseMap.set(r.spouseId2, r.spouseId1);
      }
    } else if (r.parentId && r.childId) {
      if (memberMap.has(r.parentId) && memberMap.has(r.childId)) {
        const kids = childrenMap.get(r.parentId) || [];
        if (!kids.includes(r.childId)) {
          kids.push(r.childId);
          childrenMap.set(r.parentId, kids);
        }
        const parents = parentMap.get(r.childId) || [];
        if (!parents.includes(r.parentId)) {
          parents.push(r.parentId);
          parentMap.set(r.childId, parents);
        }
      }
    }
  });

  // Find children of a couple (combine children of either parent)
  function getCoupleChildren(memberId: string, spouseId: string | null): string[] {
    const kids = new Set<string>();
    (childrenMap.get(memberId) || []).forEach((c) => kids.add(c));
    if (spouseId) {
      (childrenMap.get(spouseId) || []).forEach((c) => kids.add(c));
    }
    // Only return children that exist in memberMap
    return Array.from(kids).filter((kidId) => memberMap.has(kidId));
  }

  // Track laid out members to prevent duplicates
  const visited = new Set<string>();

  // Recursive subtree width calculator
  function buildSubtree(memberId: string, level: number): SubtreeLayout | null {
    if (visited.has(memberId)) return null;
    visited.add(memberId);

    const spouseId = spouseMap.get(memberId) || null;
    if (spouseId) {
      visited.add(spouseId);
    }

    const childIds = getCoupleChildren(memberId, spouseId);
    const childrenLayouts: SubtreeLayout[] = [];

    childIds.forEach((childId) => {
      // If the child is already visited (e.g. from another branch), skip
      const layout = buildSubtree(childId, level + 1);
      if (layout) {
        childrenLayouts.push(layout);
      }
    });

    // Calculate width of this subtree
    let width = CARD_WIDTH;
    if (spouseId) {
      width = CARD_WIDTH * 2 + SPOUSE_SPACING;
    }

    if (childrenLayouts.length > 0) {
      const childrenTotalWidth =
        childrenLayouts.reduce((acc, c) => acc + c.width, 0) +
        (childrenLayouts.length - 1) * FAMILY_SPACING;
      width = Math.max(width, childrenTotalWidth);
    }

    return {
      id: memberId,
      spouseId,
      children: childrenLayouts,
      width,
      x: 0,
      y: level * LEVEL_SPACING,
    };
  }

  // 2. Find roots (members with no parents in active tree)
  const roots: string[] = [];
  activeMembers.forEach((m) => {
    const parents = parentMap.get(m.id) || [];
    const hasActiveParents = parents.some((pId) => memberMap.has(pId));
    if (!hasActiveParents) {
      // Only add as root if not already visited as a spouse of a root
      if (!visited.has(m.id)) {
        roots.push(m.id);
        // Mark as root, and recursively visit to mark its descendants
        const spouseId = spouseMap.get(m.id);
        visited.add(m.id);
        if (spouseId) visited.add(spouseId);
      }
    }
  });

  // Reset visited set for layout building
  visited.clear();

  // Build subtrees for all roots
  const rootLayouts: SubtreeLayout[] = [];
  roots.forEach((rootId) => {
    const layout = buildSubtree(rootId, 0);
    if (layout) {
      rootLayouts.push(layout);
    }
  });

  // Handle any members that were missed due to disconnected graphs/loops
  activeMembers.forEach((m) => {
    if (!visited.has(m.id)) {
      const layout = buildSubtree(m.id, 0);
      if (layout) {
        rootLayouts.push(layout);
      }
    }
  });

  // 3. Assign X coordinates recursively
  function assignX(layout: SubtreeLayout, leftBoundary: number) {
    // Center of this layout's allocated width
    const centerX = leftBoundary + layout.width / 2;
    layout.x = centerX;

    if (layout.children.length > 0) {
      // Lay out children left-to-right beneath parents
      const childrenTotalWidth =
        layout.children.reduce((acc, c) => acc + c.width, 0) +
        (layout.children.length - 1) * FAMILY_SPACING;
      
      let currentLeft = centerX - childrenTotalWidth / 2;

      layout.children.forEach((child) => {
        assignX(child, currentLeft);
        currentLeft += child.width + FAMILY_SPACING;
      });
    }
  }

  // Position root trees side-by-side
  let currentLeft = 0;
  rootLayouts.forEach((rootLayout) => {
    assignX(rootLayout, currentLeft);
    currentLeft += rootLayout.width + FAMILY_SPACING * 2;
  });

  // Flatten the layout tree to list of node positions
  const nodesList: TreeLayout['nodes'] = [];
  const linesList: TreeLayout['lines'] = [];

  function collectPositions(layout: SubtreeLayout) {
    const m = memberMap.get(layout.id);
    if (!m) return;

    let parentCenterX = layout.x;

    if (layout.spouseId) {
      const s = memberMap.get(layout.spouseId);
      if (s) {
        // Place primary member on the left, spouse on the right
        const offset = (CARD_WIDTH + SPOUSE_SPACING) / 2;
        const x1 = layout.x - offset;
        const x2 = layout.x + offset;

        nodesList.push({ member: m, x: x1, y: layout.y, isSpouse: false, spouseId: s.id });
        nodesList.push({ member: s, x: x2, y: layout.y, isSpouse: true, spouseId: m.id });

        // Spouse line (horizontal connection)
        const lineId = `spouse-${m.id}-${s.id}`;
        // Draw line from right edge of member to left edge of spouse
        const fromX = x1 + CARD_WIDTH / 2;
        const toX = x2 - CARD_WIDTH / 2;
        const lineY = layout.y + CARD_HEIGHT / 2;
        
        linesList.push({
          id: lineId,
          type: 'spouse',
          path: `M ${fromX} ${lineY} L ${toX} ${lineY}`,
        });

        parentCenterX = layout.x; // Midpoint is layout.x
      }
    } else {
      nodesList.push({ member: m, x: layout.x, y: layout.y, isSpouse: false, spouseId: null });
      parentCenterX = layout.x;
    }

    // Connect parents to children
    if (layout.children.length > 0) {
      const parentLineY = layout.y + CARD_HEIGHT;
      const unionY = layout.y + CARD_HEIGHT + (LEVEL_SPACING - CARD_HEIGHT) / 2;

      // Vertical line dropping down from the parents midpoint
      const midX = parentCenterX;
      const startY = layout.spouseId ? layout.y + CARD_HEIGHT / 2 : parentLineY;

      // Draw path from parents to split point
      const splitId = `split-${layout.id}`;
      linesList.push({
        id: splitId,
        type: 'parent-child',
        path: `M ${midX} ${startY} L ${midX} ${unionY}`,
      });

      // Find children bounds to draw horizontal bar
      const firstChildX = layout.children[0].x;
      const lastChildX = layout.children[layout.children.length - 1].x;

      if (layout.children.length > 1) {
        linesList.push({
          id: `bar-${layout.id}`,
          type: 'parent-child',
          path: `M ${firstChildX} ${unionY} L ${lastChildX} ${unionY}`,
        });
      }

      // Draw downward line to each child node
      layout.children.forEach((child) => {
        const childTopY = child.y;
        linesList.push({
          id: `child-connect-${layout.id}-${child.id}`,
          type: 'parent-child',
          path: `M ${child.x} ${unionY} L ${child.x} ${childTopY}`,
        });

        collectPositions(child);
      });
    }
  }

  rootLayouts.forEach((r) => collectPositions(r));

  // 4. Calculate dimensions for canvas styling and sizing
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodesList.forEach((n) => {
    if (n.x - CARD_WIDTH / 2 < minX) minX = n.x - CARD_WIDTH / 2;
    if (n.x + CARD_WIDTH / 2 > maxX) maxX = n.x + CARD_WIDTH / 2;
    if (n.y < minY) minY = n.y;
    if (n.y + CARD_HEIGHT > maxY) maxY = n.y + CARD_HEIGHT;
  });

  // Safe fallback if nodes are empty
  if (minX === Infinity) {
    minX = 0; maxX = 0; minY = 0; maxY = 0;
  }

  // Padding
  const padding = 150;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  return {
    nodes: nodesList,
    lines: linesList,
    dimensions: {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      maxX,
      minY,
      maxY,
    },
  };
}

/**
 * Returns a set of member IDs that belong to the focus member's branch (ancestors + descendants).
 */
export function getBranchMemberIds(
  memberId: string,
  _members: Member[],
  relationships: Relationship[]
): Set<string> {
  const branch = new Set<string>();
  branch.add(memberId);

  const spouseMap = new Map<string, string>();
  const parentMap = new Map<string, string[]>(); // childId -> parentIds
  const childMap = new Map<string, string[]>();  // parentId -> childIds

  relationships.forEach((r) => {
    if (r.spouseId1 && r.spouseId2) {
      spouseMap.set(r.spouseId1, r.spouseId2);
      spouseMap.set(r.spouseId2, r.spouseId1);
    } else if (r.parentId && r.childId) {
      const parents = parentMap.get(r.childId) || [];
      parents.push(r.parentId);
      parentMap.set(r.childId, parents);

      const kids = childMap.get(r.parentId) || [];
      kids.push(r.childId);
      childMap.set(r.parentId, kids);
    }
  });

  // Add spouses of anyone in the branch
  function addSpouses() {
    const current = Array.from(branch);
    current.forEach((id) => {
      const spouse = spouseMap.get(id);
      if (spouse) branch.add(spouse);
    });
  }

  // Traverse upwards (ancestors)
  const ancestorQueue = [memberId];
  while (ancestorQueue.length > 0) {
    const curr = ancestorQueue.shift()!;
    const parents = parentMap.get(curr) || [];
    parents.forEach((p) => {
      if (!branch.has(p)) {
        branch.add(p);
        ancestorQueue.push(p);
      }
    });
  }

  // Traverse downwards (descendants)
  const descendantQueue = [memberId];
  // Also push spouses of starting member to catch children
  const sp = spouseMap.get(memberId);
  if (sp) descendantQueue.push(sp);

  while (descendantQueue.length > 0) {
    const curr = descendantQueue.shift()!;
    const children = childMap.get(curr) || [];
    children.forEach((c) => {
      if (!branch.has(c)) {
        branch.add(c);
        descendantQueue.push(c);
        // Also capture the child's spouse
        const childSpouse = spouseMap.get(c);
        if (childSpouse) branch.add(childSpouse);
      }
    });
  }

  // Final sweep for spouses
  addSpouses();

  return branch;
}
