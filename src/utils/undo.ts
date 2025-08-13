// src/utils/undo.ts
export type UndoAction = {
  label: string
  do: () => Promise<void> | void
  undo: () => Promise<void> | void
  ts?: number
}

export class UndoStack {
  private stack: UndoAction[] = []
  private redoStack: UndoAction[] = []
  private max = 50

  push(action: UndoAction) {
    action.ts = Date.now()
    this.stack.push(action)
    if (this.stack.length > this.max) this.stack.shift()
    this.redoStack = []
  }
  async undo() {
    const a = this.stack.pop()
    if (!a) return
    await a.undo()
    this.redoStack.push(a)
  }
  async redo() {
    const a = this.redoStack.pop()
    if (!a) return
    await a.do()
    this.stack.push(a)
  }
  canUndo() { return this.stack.length > 0 }
  canRedo() { return this.redoStack.length > 0 }
}
