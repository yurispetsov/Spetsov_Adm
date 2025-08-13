type Undoable = () => void;

export class UndoRedo {
  private undoStack: Undoable[] = [];
  private redoStack: Undoable[] = [];
  push(undo: Undoable) {
    this.undoStack.push(undo);
    this.redoStack = [];
  }
  undo() {
    const fn = this.undoStack.pop();
    if (fn) { fn(); this.redoStack.push(fn); }
  }
  redo() {
    const fn = this.redoStack.pop();
    if (fn) { fn(); this.undoStack.push(fn); }
  }
}