import { afterEach, expect, test, vi } from 'vitest';
import { DEFAULT_BINDINGS, GameInput } from '../src/game/input';
import type { Action, Phase } from '../src/game/types';

afterEach(()=>vi.unstubAllGlobals());
test('one press produces one lane change, repeats are ignored, down alias cannot shadow slide, focus loss pauses',()=>{
  const surface=new EventTarget(),doc=new EventTarget();
  vi.stubGlobal('window',surface);vi.stubGlobal('document',doc);vi.stubGlobal('HTMLElement',class {});
  const actions:Action[]=[];let phase:Phase='running',blurred=false;
  const input=new GameInput(a=>actions.push(a),()=>phase,()=>{blurred=true;});
  // Root adapts persisted down bindings to the simulation slide action.
  input.setBindings({...DEFAULT_BINDINGS,...{down:['KeyS']},slide:['KeyS']});
  const key=(type:string,code:string,repeat=false)=>{const e=new Event(type,{cancelable:true});Object.assign(e,{code,repeat});surface.dispatchEvent(e);return e;};
  expect(key('keydown','KeyA').defaultPrevented).toBe(true);
  key('keydown','KeyA',true);key('keydown','KeyA');expect(actions).toEqual(['left']);
  key('keyup','KeyA');key('keydown','KeyA');key('keydown','KeyS');expect(actions).toEqual(['left','left','slide']);
  phase='ready';expect(key('keydown','Space').defaultPrevented).toBe(false);
  surface.dispatchEvent(new Event('blur'));expect(blurred).toBe(true);
  input.dispose();const before=actions.length;phase='running';key('keydown','KeyD');expect(actions).toHaveLength(before);
});
