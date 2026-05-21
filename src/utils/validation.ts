import type { Member, Relationship } from '../types';

/**
 * Checks if adding a parent-child relationship creates a cycle.
 * i.e., Checks if the child is already an ancestor of the parent.
 */
export function checkParentChildCycle(
  parentId: string,
  childId: string,
  relationships: Relationship[]
): boolean {
  if (parentId === childId) return true;

  // Build an adjacency list of parent -> child
  const parentToChildren = new Map<string, string[]>();
  relationships.forEach((r) => {
    if (r.parentId && r.childId) {
      const children = parentToChildren.get(r.parentId) || [];
      children.push(r.childId);
      parentToChildren.set(r.parentId, children);
    }
  });

  // Temporarily add the new proposed relationship
  const currentChildren = parentToChildren.get(parentId) || [];
  parentToChildren.set(parentId, [...currentChildren, childId]);

  // DFS to find if we can reach parentId starting from childId
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const children = parentToChildren.get(node) || [];
    for (const child of children) {
      if (!visited.has(child)) {
        if (hasCycle(child)) return true;
      } else if (recursionStack.has(child)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  // Check if we can find a cycle starting from the new child node
  return hasCycle(childId);
}

/**
 * Validates whether a new relationship is allowed.
 * Returns an error string if invalid, or null if valid.
 */
export function validateRelationship(
  newRelation: {
    type: 'Spouse' | 'Parent-Child';
    p1: string; // Parent or Spouse 1
    p2: string; // Child or Spouse 2
  },
  relationships: Relationship[],
  members: Member[]
): string | null {
  const { type, p1, p2 } = newRelation;

  if (!p1 || !p2) {
    return 'Both family members must be selected.';
  }

  if (p1 === p2) {
    return 'A family member cannot have a relationship with themselves.';
  }

  if (type === 'Spouse') {
    // Check if either partner already has a spouse in the tree (since the tree visual layout supports only 1 spouse)
    const spouse1 = relationships.find((r) => r.spouseId1 === p1 || r.spouseId2 === p1);
    const spouse2 = relationships.find((r) => r.spouseId1 === p2 || r.spouseId2 === p2);

    if (spouse1) {
      const spouseName = members.find((m) => m.id === p1)?.firstName || 'Member';
      return `${spouseName} already has a registered spouse. The layout currently supports one spouse per member.`;
    }
    if (spouse2) {
      const spouseName = members.find((m) => m.id === p2)?.firstName || 'Member';
      return `${spouseName} already has a registered spouse. The layout currently supports one spouse per member.`;
    }

    // Check if they are already married to each other
    const alreadySpouses = relationships.some(
      (r) =>
        r.spouseId1 &&
        r.spouseId2 &&
        ((r.spouseId1 === p1 && r.spouseId2 === p2) ||
          (r.spouseId1 === p2 && r.spouseId2 === p1))
    );
    if (alreadySpouses) {
      return 'These members are already registered as spouses.';
    }

    // Check if they are in a parent-child relationship
    const isParentChild = relationships.some(
      (r) =>
        r.parentId &&
        r.childId &&
        ((r.parentId === p1 && r.childId === p2) ||
          (r.parentId === p2 && r.childId === p1))
    );
    if (isParentChild) {
      return 'Cannot establish spouse relationship: they have a parent-child relationship.';
    }
  } else if (type === 'Parent-Child') {
    // p1 = parent, p2 = child
    // Check if the parent is already married to the child
    const areSpouses = relationships.some(
      (r) =>
        r.spouseId1 &&
        r.spouseId2 &&
        ((r.spouseId1 === p1 && r.spouseId2 === p2) ||
          (r.spouseId1 === p2 && r.spouseId2 === p1))
    );
    if (areSpouses) {
      return 'Cannot establish parent-child relationship: they are registered as spouses.';
    }

    // Check if relationship already exists
    const alreadyParentChild = relationships.some(
      (r) => r.parentId === p1 && r.childId === p2
    );
    if (alreadyParentChild) {
      return 'This parent-child relationship is already registered.';
    }

    // Check if this child already has 2 parents
    const parentCount = relationships.filter((r) => r.childId === p2).length;
    if (parentCount >= 2) {
      return 'A child cannot have more than 2 parents.';
    }

    // Cycle detection
    if (checkParentChildCycle(p1, p2, relationships)) {
      return 'This relationship creates a circular hierarchy (loop) which is genealogically impossible.';
    }
  }

  return null;
}
