import type { CategoryDTO, CategoryNode } from '@/shared/types/catalog';

export function buildTree(rows: CategoryDTO[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  rows.forEach(r => map.set(r.id, { ...r, children: [], level: 1 }));

  const roots: CategoryNode[] = [];
  rows.forEach(r => {
    const node = map.get(r.id)!;
    if (!r.parentId) {
      roots.push(node);
    } else {
      const p = map.get(r.parentId);
      if (p) {
        node.level = (p.level ?? 1) + 1;
        p.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  const sortRec = (list: CategoryNode[]) => {
    list.sort((a, b) => a.position - b.position);
    list.forEach(n => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

export function flattenTree(nodes: CategoryNode[]): CategoryDTO[] {
  const out: CategoryDTO[] = [];
  const walk = (list: CategoryNode[]) => {
    list.forEach((n, idx) => {
      out.push({
        id: n.id,
        name: n.name,
        slug: n.slug,
        parentId: n.parentId,
        position: typeof n.position === 'number' ? n.position : idx + 1,
        isVisible: n.isVisible,
        metaTitle: n.metaTitle,
        h1: n.h1,
        metaDescription: n.metaDescription,
      });
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return out;
}

export function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const child = findNode(n.children, id);
    if (child) return child;
  }
  return null;
}
