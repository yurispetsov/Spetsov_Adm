export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  isVisible: boolean;
  metaTitle?: string;
  h1?: string;
  metaDescription?: string;
}

export interface CategoryNode extends CategoryDTO {
  children: CategoryNode[];
  level: number;
}
