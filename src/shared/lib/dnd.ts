export interface DragPayload { id: number }
export const DND = {
  key: 'catalog-node-id',
  encode(id:number){ return String(id) },
  decode(data:string){ const n = Number(data); return Number.isFinite(n) ? n : null }
};