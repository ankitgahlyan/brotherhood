import { Buffer } from 'buffer';

(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
if (typeof self !== 'undefined') {
  (self as any).Buffer = (self as any).Buffer || Buffer;
}
if (typeof window !== 'undefined') {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

export { Buffer };
export default Buffer;
