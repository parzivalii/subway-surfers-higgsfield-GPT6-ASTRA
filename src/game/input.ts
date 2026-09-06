import { type Action, type Phase } from './types';

export type Bindings = Record<Action, string[]>;
export const DEFAULT_BINDINGS: Bindings = {
  left:['KeyA','ArrowLeft'], right:['KeyD','ArrowRight'], jump:['KeyW','ArrowUp'],
  slide:['KeyS','ArrowDown'], board:['Space'], pause:['Escape','KeyP'], confirm:['Enter'],
};
const editable = (target: EventTarget | null): boolean => target instanceof HTMLElement && (!!target.closest('input,textarea,select,[contenteditable="true"]'));
export class GameInput {
  private bindings: Bindings;
  private readonly down = new Set<string>();
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (editable(event.target)) return;
    const phase = this.phase();
    const action = (Object.keys(DEFAULT_BINDINGS) as Action[]).find(key => this.bindings[key]?.includes(event.code));
    if (!action) return;
    // In menus, leave browser focus/button activation intact. Enter only starts when
    // the shell reports ready and focus is not already on a real button.
    const gameplay = phase === 'running' || phase === 'countdown';
    const menuPause = phase === 'paused' && action === 'pause';
    if (!gameplay && !menuPause) return;
    event.preventDefault();
    if (event.repeat || this.down.has(event.code)) return;
    this.down.add(event.code); this.dispatch(action);
  };
  private readonly onKeyUp = (event: KeyboardEvent) => { this.down.delete(event.code); };
  private readonly onBlur = () => { this.down.clear(); this.focusLoss(); };
  private readonly onVisibility = () => { if (document.hidden) this.onBlur(); };
  constructor(dispatch: (action: Action) => void, phase: () => Phase, focusLoss: () => void, bindings: Bindings = DEFAULT_BINDINGS) {
    this.dispatch = dispatch; this.phase = phase; this.focusLoss = focusLoss; this.bindings = bindings;
    window.addEventListener('keydown',this.onKeyDown); window.addEventListener('keyup',this.onKeyUp);
    window.addEventListener('blur',this.onBlur); document.addEventListener('visibilitychange',this.onVisibility);
  }
  private readonly dispatch: (action: Action) => void;
  private readonly phase: () => Phase;
  private readonly focusLoss: () => void;
  setBindings(bindings: Bindings): void { this.bindings = bindings; this.down.clear(); }
  dispose(): void {
    window.removeEventListener('keydown',this.onKeyDown); window.removeEventListener('keyup',this.onKeyUp);
    window.removeEventListener('blur',this.onBlur); document.removeEventListener('visibilitychange',this.onVisibility); this.down.clear();
  }
}
