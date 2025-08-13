import type { CatalogCategory } from '@/shared/types/catalog';

export interface TreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: TreeNode[];
  level: number;
  data: CatalogCategory;
}

export function buildTree(items: CatalogCategory[]): TreeNode[] {
  const byId = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  for (const it of items) {
    byId.set(it.id, { id: it.id, name: it.name, parentId: it.parentId ?? null, children: [], level: 1, data: it });
  }
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      const parent = byId.get(node.parentId)!;
      node.level = (parent.level ?? 0) + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sort = (arr: TreeNode[]) => {
    arr.sort((a,b)=>(a.data.position ?? 0)-(b.data.position ?? 0) || a.name.localeCompare(b.name));
    for (const n of arr) sort(n.children);
  };
  sort(roots);
  return roots;
}

export function flatten(nodes: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  const walk = (arr: TreeNode[]) => {
    for (const n of arr) { out.push(n); walk(n.children) }
  };
  walk(nodes);
  return out;
}

export function clampDepth(targetParent: TreeNode | null, newLevel: number, max = 4) {
  return newLevel <= max;
}