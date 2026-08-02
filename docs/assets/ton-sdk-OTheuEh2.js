import { r as tc } from './tonconnect-DPuITiDr.js';
import { c as Ji } from './react-8fKfBBvl.js';
var kr = {},
  Cr = {},
  Ln = {},
  Qo;
function En() {
  return (
    Qo ||
      ((Qo = 1),
      Object.defineProperty(Ln, '__esModule', { value: !0 }),
      (Ln.inspectSymbol = void 0),
      (Ln.inspectSymbol = Symbol.for('nodejs.util.inspect.custom'))),
    Ln
  );
}
var Vn = {},
  Xo;
function co() {
  if (Xo) return Vn;
  ((Xo = 1),
    Object.defineProperty(Vn, '__esModule', { value: !0 }),
    (Vn.crc16 = void 0));
  function t(d) {
    let a = 0;
    const e = Buffer.alloc(d.length + 2);
    e.set(d);
    for (let r of e) {
      let n = 128;
      for (; n > 0;)
        ((a <<= 1),
          r & n && (a += 1),
          (n >>= 1),
          a > 65535 && ((a &= 65535), (a ^= 4129)));
    }
    return Buffer.from([Math.floor(a / 256), a % 256]);
  }
  return ((Vn.crc16 = t), Vn);
}
var es;
function hr() {
  if (es) return Cr;
  es = 1;
  var t;
  (Object.defineProperty(Cr, '__esModule', { value: !0 }),
    (Cr.address = Cr.Address = void 0));
  const d = En(),
    u = co(),
    a = 17,
    e = 81,
    r = 128;
  function n(f) {
    if (typeof f == 'string' && !i.isFriendly(f))
      throw new Error('Unknown address type');
    const o = Buffer.isBuffer(f) ? f : Buffer.from(f, 'base64');
    if (o.length !== 36)
      throw new Error('Unknown address type: byte length is not equal to 36');
    const y = o.subarray(0, 34),
      v = o.subarray(34, 36),
      w = (0, u.crc16)(y);
    if (!(w[0] === v[0] && w[1] === v[1]))
      throw new Error('Invalid checksum: ' + f);
    let R = y[0],
      C = !1,
      P = !1;
    if ((R & r && ((C = !0), (R = R ^ r)), R !== a && R !== e))
      throw 'Unknown address tag';
    P = R === a;
    let E = null;
    y[1] === 255 ? (E = -1) : (E = y[1]);
    const N = y.subarray(2, 34);
    return { isTestOnly: C, isBounceable: P, workchain: E, hashPart: N };
  }
  let i = class dr {
    static isAddress(o) {
      return o instanceof dr;
    }
    static isFriendly(o) {
      return !(o.length !== 48 || !/^[A-Za-z0-9+/_-]+$/.test(o));
    }
    static isRaw(o) {
      if (o.indexOf(':') === -1) return !1;
      let [y, v] = o.split(':');
      return !(
        !Number.isInteger(parseFloat(y)) ||
        !/[a-f0-9]+/.test(v.toLowerCase()) ||
        v.length !== 64
      );
    }
    static normalize(o) {
      return typeof o == 'string' ? dr.parse(o).toString() : o.toString();
    }
    static parse(o) {
      if (dr.isFriendly(o)) return this.parseFriendly(o).address;
      if (dr.isRaw(o)) return this.parseRaw(o);
      throw new Error('Unknown address type: ' + o);
    }
    static parseRaw(o) {
      let y = parseInt(o.split(':')[0]),
        v = Buffer.from(o.split(':')[1], 'hex');
      return new dr(y, v);
    }
    static parseFriendly(o) {
      if (Buffer.isBuffer(o)) {
        let y = n(o);
        return {
          isBounceable: y.isBounceable,
          isTestOnly: y.isTestOnly,
          address: new dr(y.workchain, y.hashPart),
        };
      } else {
        let y = o.replace(/\-/g, '+').replace(/_/g, '/'),
          v = n(y);
        return {
          isBounceable: v.isBounceable,
          isTestOnly: v.isTestOnly,
          address: new dr(v.workchain, v.hashPart),
        };
      }
    }
    constructor(o, y) {
      if (
        ((this.toRawString = () =>
          this.workChain + ':' + this.hash.toString('hex')),
        (this.toRaw = () => {
          const v = Buffer.alloc(36);
          return (
            v.set(this.hash),
            v.set(
              [this.workChain, this.workChain, this.workChain, this.workChain],
              32,
            ),
            v
          );
        }),
        (this.toStringBuffer = (v) => {
          let w = v && v.testOnly !== void 0 ? v.testOnly : !1,
            C = (v && v.bounceable !== void 0 ? v.bounceable : !0) ? a : e;
          w && (C |= r);
          const P = Buffer.alloc(34);
          ((P[0] = C), (P[1] = this.workChain), P.set(this.hash, 2));
          const E = Buffer.alloc(36);
          return (E.set(P), E.set((0, u.crc16)(P), 34), E);
        }),
        (this.toString = (v) => {
          let w = v && v.urlSafe !== void 0 ? v.urlSafe : !0,
            R = this.toStringBuffer(v);
          return w
            ? R.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
            : R.toString('base64');
        }),
        (this[t] = () => this.toString()),
        y.length !== 32)
      )
        throw new Error('Invalid address hash length: ' + y.length);
      ((this.workChain = o), (this.hash = y), Object.freeze(this));
    }
    equals(o) {
      return o.workChain !== this.workChain ? !1 : o.hash.equals(this.hash);
    }
  };
  ((Cr.Address = i), (t = d.inspectSymbol));
  function s(f) {
    return i.parse(f);
  }
  return ((Cr.address = s), Cr);
}
var Fn = {},
  ts;
function fo() {
  if (ts) return Fn;
  ts = 1;
  var t;
  (Object.defineProperty(Fn, '__esModule', { value: !0 }),
    (Fn.ExternalAddress = void 0));
  const d = En();
  let u = class rc {
    static isAddress(e) {
      return e instanceof rc;
    }
    constructor(e, r) {
      ((this[t] = () => this.toString()), (this.value = e), (this.bits = r));
    }
    toString() {
      return `External<${this.bits}:${this.value}>`;
    }
  };
  return ((Fn.ExternalAddress = u), (t = d.inspectSymbol), Fn);
}
var Zn = {},
  Sr = {},
  rs;
function nc() {
  if (rs) return Sr;
  ((rs = 1),
    Object.defineProperty(Sr, '__esModule', { value: !0 }),
    (Sr.base32Decode = Sr.base32Encode = void 0));
  const t = 'abcdefghijklmnopqrstuvwxyz234567';
  function d(e) {
    const r = e.byteLength;
    let n = 0,
      i = 0,
      s = '';
    for (let f = 0; f < r; f++)
      for (i = (i << 8) | e[f], n += 8; n >= 5;)
        ((s += t[(i >>> (n - 5)) & 31]), (n -= 5));
    return (n > 0 && (s += t[(i << (5 - n)) & 31]), s);
  }
  Sr.base32Encode = d;
  function u(e, r) {
    const n = e.indexOf(r);
    if (n === -1) throw new Error('Invalid character found: ' + r);
    return n;
  }
  function a(e) {
    let r;
    r = e.toLowerCase();
    const { length: n } = r;
    let i = 0,
      s = 0,
      f = 0;
    const o = Buffer.alloc(((n * 5) / 8) | 0);
    for (let y = 0; y < n; y++)
      ((s = (s << 5) | u(t, r[y])),
        (i += 5),
        i >= 8 && ((o[f++] = (s >>> (i - 8)) & 255), (i -= 8)));
    return o;
  }
  return ((Sr.base32Decode = a), Sr);
}
var ns;
function rf() {
  if (ns) return Zn;
  ns = 1;
  var t;
  (Object.defineProperty(Zn, '__esModule', { value: !0 }),
    (Zn.ADNLAddress = void 0));
  const d = En(),
    u = nc(),
    a = co();
  let e = class oo {
    static parseFriendly(n) {
      if (n.length !== 55) throw Error('Invalid address');
      n = 'f' + n;
      let i = (0, u.base32Decode)(n);
      if (i[0] !== 45) throw Error('Invalid address');
      let s = i.slice(33);
      if (!(0, a.crc16)(i.slice(0, 33)).equals(s))
        throw Error('Invalid address');
      return new oo(i.slice(1, 33));
    }
    static parseRaw(n) {
      const i = Buffer.from(n, 'base64');
      return new oo(i);
    }
    constructor(n) {
      if (
        ((this.toRaw = () => this.address.toString('hex').toUpperCase()),
        (this.toString = () => {
          let i = Buffer.concat([Buffer.from([45]), this.address]),
            s = (0, a.crc16)(i);
          return ((i = Buffer.concat([i, s])), (0, u.base32Encode)(i).slice(1));
        }),
        (this[t] = () => this.toString()),
        n.length !== 32)
      )
        throw Error('Invalid address');
      this.address = n;
    }
    equals(n) {
      return this.address.equals(n.address);
    }
  };
  return ((Zn.ADNLAddress = e), (t = d.inspectSymbol), Zn);
}
var Hn = {},
  Br = {},
  Wn = {},
  Kn = {},
  Pr = {},
  as;
function Si() {
  if (as) return Pr;
  ((as = 1),
    Object.defineProperty(Pr, '__esModule', { value: !0 }),
    (Pr.paddedBufferToBits = Pr.bitsToPaddedBuffer = void 0));
  const t = Bi(),
    d = gr();
  function u(e) {
    let r = new t.BitBuilder(Math.ceil(e.length / 8) * 8);
    r.writeBits(e);
    let n = Math.ceil(e.length / 8) * 8 - e.length;
    for (let i = 0; i < n; i++) i === 0 ? r.writeBit(1) : r.writeBit(0);
    return r.buffer();
  }
  Pr.bitsToPaddedBuffer = u;
  function a(e) {
    let r = 0;
    for (let n = e.length - 1; n >= 0; n--)
      if (e[n] !== 0) {
        const i = e[n];
        let s = i & -i;
        ((s & 1) == 0 && (s = Math.log2(s) + 1),
          n > 0 && (r = n << 3),
          (r += 8 - s));
        break;
      }
    return new d.BitString(e, 0, r);
  }
  return ((Pr.paddedBufferToBits = a), Pr);
}
var is;
function gr() {
  if (is) return Kn;
  is = 1;
  var t;
  (Object.defineProperty(Kn, '__esModule', { value: !0 }),
    (Kn.BitString = void 0));
  const d = Si(),
    u = En();
  let a = class ki {
    static isBitString(r) {
      return r instanceof ki;
    }
    constructor(r, n, i) {
      if (((this[t] = () => this.toString()), i < 0))
        throw new Error(`Length ${i} is out of bounds`);
      ((this._length = i), (this._data = r), (this._offset = n));
    }
    get length() {
      return this._length;
    }
    at(r) {
      if (r >= this._length)
        throw new Error(`Index ${r} > ${this._length} is out of bounds`);
      if (r < 0) throw new Error(`Index ${r} < 0 is out of bounds`);
      let n = (this._offset + r) >> 3,
        i = 7 - ((this._offset + r) % 8);
      return (this._data[n] & (1 << i)) !== 0;
    }
    substring(r, n) {
      if (r > this._length)
        throw new Error(`Offset(${r}) > ${this._length} is out of bounds`);
      if (r < 0) throw new Error(`Offset(${r}) < 0 is out of bounds`);
      if (n === 0) return ki.EMPTY;
      if (r + n > this._length)
        throw new Error(
          `Offset ${r} + Length ${n} > ${this._length} is out of bounds`,
        );
      return new ki(this._data, this._offset + r, n);
    }
    subbuffer(r, n) {
      if (r > this._length) throw new Error(`Offset ${r} is out of bounds`);
      if (r < 0) throw new Error(`Offset ${r} is out of bounds`);
      if (r + n > this._length)
        throw new Error(`Offset + Length = ${r + n} is out of bounds`);
      if (n % 8 !== 0 || (this._offset + r) % 8 !== 0) return null;
      let i = (this._offset + r) >> 3,
        s = i + (n >> 3);
      return this._data.subarray(i, s);
    }
    equals(r) {
      if (this._length !== r._length) return !1;
      for (let n = 0; n < this._length; n++)
        if (this.at(n) !== r.at(n)) return !1;
      return !0;
    }
    toString() {
      const r = (0, d.bitsToPaddedBuffer)(this);
      if (this._length % 4 === 0) {
        const n = r
          .subarray(0, Math.ceil(this._length / 8))
          .toString('hex')
          .toUpperCase();
        return this._length % 8 === 0 ? n : n.substring(0, n.length - 1);
      } else {
        const n = r.toString('hex').toUpperCase();
        return this._length % 8 <= 4
          ? n.substring(0, n.length - 1) + '_'
          : n + '_';
      }
    }
  };
  return (
    (Kn.BitString = a),
    (t = u.inspectSymbol),
    (a.EMPTY = new a(Buffer.alloc(0), 0, 0)),
    Kn
  );
}
var os;
function Bi() {
  if (os) return Wn;
  ((os = 1),
    Object.defineProperty(Wn, '__esModule', { value: !0 }),
    (Wn.BitBuilder = void 0));
  const t = hr(),
    d = fo(),
    u = gr();
  let a = class {
    constructor(r = 1023) {
      ((this._buffer = Buffer.alloc(Math.ceil(r / 8))), (this._length = 0));
    }
    get length() {
      return this._length;
    }
    writeBit(r) {
      let n = this._length;
      if (n > this._buffer.length * 8) throw new Error('BitBuilder overflow');
      (((typeof r == 'boolean' && r === !0) ||
        (typeof r == 'number' && r > 0)) &&
        (this._buffer[(n / 8) | 0] |= 1 << (7 - (n % 8))),
        this._length++);
    }
    writeBits(r) {
      for (let n = 0; n < r.length; n++) this.writeBit(r.at(n));
    }
    writeBuffer(r) {
      if (this._length % 8 === 0) {
        if (this._length + r.length * 8 > this._buffer.length * 8)
          throw new Error('BitBuilder overflow');
        (r.copy(this._buffer, this._length / 8),
          (this._length += r.length * 8));
      } else for (let n = 0; n < r.length; n++) this.writeUint(r[n], 8);
    }
    writeUint(r, n) {
      if (n < 0 || !Number.isSafeInteger(n))
        throw Error(`invalid bit length. Got ${n}`);
      const i = BigInt(r);
      if (n === 0) {
        if (i !== 0n) throw Error(`value is not zero for ${n} bits. Got ${r}`);
        return;
      }
      const s = 1n << BigInt(n);
      if (i < 0 || i >= s)
        throw Error(`bitLength is too small for a value ${r}. Got ${n}`);
      if (this._length + n > this._buffer.length * 8)
        throw new Error('BitBuilder overflow');
      const f = 8 - (this._length % 8);
      if (f > 0) {
        const o = Math.floor(this._length / 8);
        if (n < f) {
          const y = Number(i);
          ((this._buffer[o] |= y << (f - n)), (this._length += n));
        } else {
          const y = Number(i >> BigInt(n - f));
          ((this._buffer[o] |= y), (this._length += f));
        }
      }
      for (n -= f; n > 0;)
        n >= 8
          ? ((this._buffer[this._length / 8] = Number(
              (i >> BigInt(n - 8)) & 0xffn,
            )),
            (this._length += 8),
            (n -= 8))
          : ((this._buffer[this._length / 8] = Number(
              (i << BigInt(8 - n)) & 0xffn,
            )),
            (this._length += n),
            (n = 0));
    }
    writeInt(r, n) {
      let i = BigInt(r);
      if (n < 0 || !Number.isSafeInteger(n))
        throw Error(`invalid bit length. Got ${n}`);
      if (n === 0) {
        if (i !== 0n) throw Error(`value is not zero for ${n} bits. Got ${r}`);
        return;
      }
      if (n === 1) {
        if (i !== -1n && i !== 0n)
          throw Error(`value is not zero or -1 for ${n} bits. Got ${r}`);
        this.writeBit(i === -1n);
        return;
      }
      let s = 1n << (BigInt(n) - 1n);
      if (i < -s || i >= s)
        throw Error(`value is out of range for ${n} bits. Got ${r}`);
      (i < 0 ? (this.writeBit(!0), (i = s + i)) : this.writeBit(!1),
        this.writeUint(i, n - 1));
    }
    writeVarUint(r, n) {
      let i = BigInt(r);
      if (n < 0 || !Number.isSafeInteger(n))
        throw Error(`invalid bit length. Got ${n}`);
      if (i < 0) throw Error(`value is negative. Got ${r}`);
      if (i === 0n) {
        this.writeUint(0, n);
        return;
      }
      const s = Math.ceil(i.toString(2).length / 8),
        f = s * 8;
      (this.writeUint(s, n), this.writeUint(i, f));
    }
    writeVarInt(r, n) {
      let i = BigInt(r);
      if (n < 0 || !Number.isSafeInteger(n))
        throw Error(`invalid bit length. Got ${n}`);
      if (i === 0n) {
        this.writeUint(0, n);
        return;
      }
      let s = i > 0 ? i : -i;
      const f = Math.ceil((s.toString(2).length + 1) / 8),
        o = f * 8;
      (this.writeUint(f, n), this.writeInt(i, o));
    }
    writeCoins(r) {
      this.writeVarUint(r, 4);
    }
    writeAddress(r) {
      if (r == null) {
        this.writeUint(0, 2);
        return;
      }
      if (t.Address.isAddress(r)) {
        (this.writeUint(2, 2),
          this.writeUint(0, 1),
          this.writeInt(r.workChain, 8),
          this.writeBuffer(r.hash));
        return;
      }
      if (d.ExternalAddress.isAddress(r)) {
        (this.writeUint(1, 2),
          this.writeUint(r.bits, 9),
          this.writeUint(r.value, r.bits));
        return;
      }
      throw Error(`Invalid address. Got ${r}`);
    }
    build() {
      return new u.BitString(this._buffer, 0, this._length);
    }
    buffer() {
      if (this._length % 8 !== 0)
        throw new Error('BitBuilder buffer is not byte aligned');
      return this._buffer.subarray(0, this._length / 8);
    }
  };
  return ((Wn.BitBuilder = a), Wn);
}
var $n = {},
  Gn = {},
  ss;
function Xa() {
  if (ss) return Gn;
  ((ss = 1),
    Object.defineProperty(Gn, '__esModule', { value: !0 }),
    (Gn.CellType = void 0));
  var t;
  return (
    (function (d) {
      ((d[(d.Ordinary = -1)] = 'Ordinary'),
        (d[(d.PrunedBranch = 1)] = 'PrunedBranch'),
        (d[(d.Library = 2)] = 'Library'),
        (d[(d.MerkleProof = 3)] = 'MerkleProof'),
        (d[(d.MerkleUpdate = 4)] = 'MerkleUpdate'));
    })(t || (Gn.CellType = t = {})),
    Gn
  );
}
var Yn = {},
  Jn = {},
  Ar = {},
  Qn = {},
  ls;
function nf() {
  if (ls) return Qn;
  ((ls = 1),
    Object.defineProperty(Qn, '__esModule', { value: !0 }),
    (Qn.readUnaryLength = void 0));
  function t(d) {
    let u = 0;
    for (; d.loadBit();) u++;
    return u;
  }
  return ((Qn.readUnaryLength = t), Qn);
}
var xr = {},
  Xn = {},
  us;
function pr() {
  if (us) return Xn;
  ((us = 1),
    Object.defineProperty(Xn, '__esModule', { value: !0 }),
    (Xn.BitReader = void 0));
  const t = hr(),
    d = fo();
  let u = class ac {
    constructor(e, r = 0) {
      ((this._checkpoints = []), (this._bits = e), (this._offset = r));
    }
    get offset() {
      return this._offset;
    }
    get remaining() {
      return this._bits.length - this._offset;
    }
    skip(e) {
      if (e < 0 || this._offset + e > this._bits.length)
        throw new Error(`Index ${this._offset + e} is out of bounds`);
      this._offset += e;
    }
    reset() {
      this._checkpoints.length > 0
        ? (this._offset = this._checkpoints.pop())
        : (this._offset = 0);
    }
    save() {
      this._checkpoints.push(this._offset);
    }
    loadBit() {
      let e = this._bits.at(this._offset);
      return (this._offset++, e);
    }
    preloadBit() {
      return this._bits.at(this._offset);
    }
    loadBits(e) {
      let r = this._bits.substring(this._offset, e);
      return ((this._offset += e), r);
    }
    preloadBits(e) {
      return this._bits.substring(this._offset, e);
    }
    loadBuffer(e) {
      let r = this._preloadBuffer(e, this._offset);
      return ((this._offset += e * 8), r);
    }
    preloadBuffer(e) {
      return this._preloadBuffer(e, this._offset);
    }
    loadUint(e) {
      return this._toSafeInteger(this.loadUintBig(e), 'loadUintBig');
    }
    loadUintBig(e) {
      let r = this.preloadUintBig(e);
      return ((this._offset += e), r);
    }
    preloadUint(e) {
      return this._toSafeInteger(
        this._preloadUint(e, this._offset),
        'preloadUintBig',
      );
    }
    preloadUintBig(e) {
      return this._preloadUint(e, this._offset);
    }
    loadInt(e) {
      let r = this._preloadInt(e, this._offset);
      return ((this._offset += e), this._toSafeInteger(r, 'loadUintBig'));
    }
    loadIntBig(e) {
      let r = this._preloadInt(e, this._offset);
      return ((this._offset += e), r);
    }
    preloadInt(e) {
      return this._toSafeInteger(
        this._preloadInt(e, this._offset),
        'preloadIntBig',
      );
    }
    preloadIntBig(e) {
      return this._preloadInt(e, this._offset);
    }
    loadVarUint(e) {
      let r = Number(this.loadUint(e));
      return this._toSafeInteger(this.loadUintBig(r * 8), 'loadVarUintBig');
    }
    loadVarUintBig(e) {
      let r = Number(this.loadUint(e));
      return this.loadUintBig(r * 8);
    }
    preloadVarUint(e) {
      let r = Number(this._preloadUint(e, this._offset));
      return this._toSafeInteger(
        this._preloadUint(r * 8, this._offset + e),
        'preloadVarUintBig',
      );
    }
    preloadVarUintBig(e) {
      let r = Number(this._preloadUint(e, this._offset));
      return this._preloadUint(r * 8, this._offset + e);
    }
    loadVarInt(e) {
      let r = Number(this.loadUint(e));
      return this._toSafeInteger(this.loadIntBig(r * 8), 'loadVarIntBig');
    }
    loadVarIntBig(e) {
      let r = Number(this.loadUint(e));
      return this.loadIntBig(r * 8);
    }
    preloadVarInt(e) {
      let r = Number(this._preloadUint(e, this._offset));
      return this._toSafeInteger(
        this._preloadInt(r * 8, this._offset + e),
        'preloadVarIntBig',
      );
    }
    preloadVarIntBig(e) {
      let r = Number(this._preloadUint(e, this._offset));
      return this._preloadInt(r * 8, this._offset + e);
    }
    loadCoins() {
      return this.loadVarUintBig(4);
    }
    preloadCoins() {
      return this.preloadVarUintBig(4);
    }
    loadAddress() {
      let e = Number(this._preloadUint(2, this._offset));
      if (e === 2) return this._loadInternalAddress();
      throw new Error('Invalid address: ' + e);
    }
    loadMaybeAddress() {
      let e = Number(this._preloadUint(2, this._offset));
      if (e === 0) return ((this._offset += 2), null);
      if (e === 2) return this._loadInternalAddress();
      throw new Error('Invalid address');
    }
    loadExternalAddress() {
      if (Number(this._preloadUint(2, this._offset)) === 1)
        return this._loadExternalAddress();
      throw new Error('Invalid address');
    }
    loadMaybeExternalAddress() {
      let e = Number(this._preloadUint(2, this._offset));
      if (e === 0) return ((this._offset += 2), null);
      if (e === 1) return this._loadExternalAddress();
      throw new Error('Invalid address');
    }
    loadAddressAny() {
      let e = Number(this._preloadUint(2, this._offset));
      if (e === 0) return ((this._offset += 2), null);
      if (e === 2) return this._loadInternalAddress();
      if (e === 1) return this._loadExternalAddress();
      throw Error(e === 3 ? 'Unsupported' : 'Unreachable');
    }
    loadPaddedBits(e) {
      if (e % 8 !== 0) throw new Error('Invalid number of bits');
      let r = e;
      for (;;)
        if (this._bits.at(this._offset + r - 1)) {
          r--;
          break;
        } else r--;
      let n = this._bits.substring(this._offset, r);
      return ((this._offset += e), n);
    }
    clone() {
      return new ac(this._bits, this._offset);
    }
    _preloadInt(e, r) {
      if (e == 0) return 0n;
      let n = this._bits.at(r),
        i = 0n;
      for (let s = 0; s < e - 1; s++)
        this._bits.at(r + 1 + s) && (i += 1n << BigInt(e - s - 1 - 1));
      return (n && (i = i - (1n << BigInt(e - 1))), i);
    }
    _preloadUint(e, r) {
      if (e == 0) return 0n;
      let n = 0n;
      for (let i = 0; i < e; i++)
        this._bits.at(r + i) && (n += 1n << BigInt(e - i - 1));
      return n;
    }
    _preloadBuffer(e, r) {
      let n = this._bits.subbuffer(r, e * 8);
      if (n) return n;
      let i = Buffer.alloc(e);
      for (let s = 0; s < e; s++)
        i[s] = Number(this._preloadUint(8, r + s * 8));
      return i;
    }
    _loadInternalAddress() {
      if (Number(this._preloadUint(2, this._offset)) !== 2)
        throw Error('Invalid address');
      let r, n;
      this._preloadUint(1, this._offset + 2) !== 0n &&
        ((n = Number(this._preloadUint(5, this._offset + 3))),
        (r = this._preloadUint(n, this._offset + 8)),
        (this._offset += 5 + n));
      let i = Number(this._preloadInt(8, this._offset + 3)),
        s = this._preloadBuffer(32, this._offset + 11);
      if (n !== void 0 && r !== void 0) {
        let f = Number(r),
          o = 0,
          y = 0,
          v = n;
        for (; v > 0;) {
          let w = Math.min(8 - y, v),
            R = ((1 << w) - 1) << (8 - y - w),
            C = ((f >> (v - w)) & ((1 << w) - 1)) << (8 - y - w);
          ((s[o] = (s[o] & ~R) | C),
            (v -= w),
            (y += w),
            y === 8 && (o++, (y = 0)));
        }
      }
      return ((this._offset += 267), new t.Address(i, s));
    }
    _loadExternalAddress() {
      if (Number(this._preloadUint(2, this._offset)) !== 1)
        throw Error('Invalid address');
      let r = Number(this._preloadUint(9, this._offset + 2)),
        n = this._preloadUint(r, this._offset + 11);
      return ((this._offset += 11 + r), new d.ExternalAddress(n, r));
    }
    _toSafeInteger(e, r) {
      if (
        BigInt(Number.MAX_SAFE_INTEGER) < e ||
        e < BigInt(Number.MIN_SAFE_INTEGER)
      )
        throw new TypeError(
          `${e} is out of safe integer range. Use ${r} instead`,
        );
      return Number(e);
    }
  };
  return ((Xn.BitReader = u), Xn);
}
var cs;
function Pi() {
  if (cs) return xr;
  ((cs = 1),
    Object.defineProperty(xr, '__esModule', { value: !0 }),
    (xr.convertToMerkleProof = xr.exoticMerkleProof = void 0));
  const t = pr(),
    d = dt();
  function u(e, r) {
    const n = new t.BitReader(e);
    if (e.length !== 280)
      throw new Error(
        `Merkle Proof cell must have exactly (8 + 256 + 16) bits, got "${e.length}"`,
      );
    if (r.length !== 1)
      throw new Error(
        `Merkle Proof cell must have exactly 1 ref, got "${r.length}"`,
      );
    let s = n.loadUint(8);
    if (s !== 3)
      throw new Error(`Merkle Proof cell must have type 3, got "${s}"`);
    const f = n.loadBuffer(32),
      o = n.loadUint(16),
      y = r[0].hash(0),
      v = r[0].depth(0);
    if (o !== v)
      throw new Error(
        `Merkle Proof cell ref depth must be exactly "${o}", got "${v}"`,
      );
    if (!f.equals(y))
      throw new Error(
        `Merkle Proof cell ref hash must be exactly "${f.toString('hex')}", got "${y.toString('hex')}"`,
      );
    return { proofDepth: o, proofHash: f };
  }
  xr.exoticMerkleProof = u;
  function a(e) {
    return (0, d.beginCell)()
      .storeUint(3, 8)
      .storeBuffer(e.hash(0))
      .storeUint(e.depth(0), 16)
      .storeRef(e)
      .endCell({ exotic: !0 });
  }
  return ((xr.convertToMerkleProof = a), xr);
}
var ds;
function ho() {
  if (ds) return Ar;
  ((ds = 1),
    Object.defineProperty(Ar, '__esModule', { value: !0 }),
    (Ar.generateMerkleProof = Ar.generateMerkleProofDirect = void 0));
  const t = dt(),
    d = nf(),
    u = Pi();
  function a(i) {
    return (0, t.beginCell)()
      .storeUint(1, 8)
      .storeUint(1, 8)
      .storeBuffer(i.hash(0))
      .storeUint(i.depth(0), 16)
      .endCell({ exotic: !0 });
  }
  function e(i, s, f, o) {
    const y = s.asCell();
    if (o.length == 0) return a(y);
    let v = s.loadBit() ? 1 : 0,
      w = 0,
      R = i;
    if (v === 0) {
      w = (0, d.readUnaryLength)(s);
      for (let C = 0; C < w; C++) R += s.loadBit() ? '1' : '0';
    } else if ((s.loadBit() ? 1 : 0) === 0) {
      w = s.loadUint(Math.ceil(Math.log2(f + 1)));
      for (let P = 0; P < w; P++) R += s.loadBit() ? '1' : '0';
    } else {
      let P = s.loadBit() ? '1' : '0';
      w = s.loadUint(Math.ceil(Math.log2(f + 1)));
      for (let E = 0; E < w; E++) R += P;
    }
    if (f - w === 0) return y;
    {
      let C = y.beginParse(),
        P = C.loadRef(),
        E = C.loadRef();
      if (!P.isExotic) {
        const N = o.filter((D) => R + '0' === D.slice(0, R.length + 1));
        P = e(R + '0', P.beginParse(), f - w - 1, N);
      }
      if (!E.isExotic) {
        const N = o.filter((D) => R + '1' === D.slice(0, R.length + 1));
        E = e(R + '1', E.beginParse(), f - w - 1, N);
      }
      return (0, t.beginCell)().storeSlice(C).storeRef(P).storeRef(E).endCell();
    }
  }
  function r(i, s, f) {
    s.forEach((y) => {
      if (!i.has(y))
        throw new Error(
          `Trying to generate merkle proof for a missing key "${y}"`,
        );
    });
    const o = (0, t.beginCell)().storeDictDirect(i).asSlice();
    return e(
      '',
      o,
      f.bits,
      s.map((y) => f.serialize(y).toString(2).padStart(f.bits, '0')),
    );
  }
  Ar.generateMerkleProofDirect = r;
  function n(i, s, f) {
    return (0, u.convertToMerkleProof)(r(i, s, f));
  }
  return ((Ar.generateMerkleProof = n), Ar);
}
var ea = {},
  fs;
function ic() {
  if (fs) return ea;
  ((fs = 1),
    Object.defineProperty(ea, '__esModule', { value: !0 }),
    (ea.generateMerkleUpdate = void 0));
  const t = dt(),
    d = ho();
  function u(e, r) {
    return (0, t.beginCell)()
      .storeUint(4, 8)
      .storeBuffer(e.hash(0))
      .storeBuffer(r.hash(0))
      .storeUint(e.depth(0), 16)
      .storeUint(r.depth(0), 16)
      .storeRef(e)
      .storeRef(r)
      .endCell({ exotic: !0 });
  }
  function a(e, r, n, i) {
    const s = (0, d.generateMerkleProof)(e, [r], n).refs[0];
    e.set(r, i);
    const f = (0, d.generateMerkleProof)(e, [r], n).refs[0];
    return u(s, f);
  }
  return ((ea.generateMerkleUpdate = a), ea);
}
var ta = {},
  hs;
function af() {
  if (hs) return ta;
  ((hs = 1),
    Object.defineProperty(ta, '__esModule', { value: !0 }),
    (ta.parseDict = void 0));
  function t(a) {
    let e = 0;
    for (; a.loadBit();) e++;
    return e;
  }
  function d(a, e, r, n, i) {
    let s = e.loadBit() ? 1 : 0,
      f = 0,
      o = a;
    if (s === 0) {
      f = t(e);
      for (let y = 0; y < f; y++) o += e.loadBit() ? '1' : '0';
    } else if ((e.loadBit() ? 1 : 0) === 0) {
      f = e.loadUint(Math.ceil(Math.log2(r + 1)));
      for (let v = 0; v < f; v++) o += e.loadBit() ? '1' : '0';
    } else {
      let v = e.loadBit() ? '1' : '0';
      f = e.loadUint(Math.ceil(Math.log2(r + 1)));
      for (let w = 0; w < f; w++) o += v;
    }
    if (r - f === 0) n.set(BigInt('0b' + o), i(e));
    else {
      let y = e.loadRef(),
        v = e.loadRef();
      (y.isExotic || d(o + '0', y.beginParse(), r - f - 1, n, i),
        v.isExotic || d(o + '1', v.beginParse(), r - f - 1, n, i));
    }
  }
  function u(a, e, r) {
    let n = new Map();
    return (a && d('', a, e, n, r), n);
  }
  return ((ta.parseDict = u), ta);
}
var _t = {},
  ra = {},
  gs;
function of() {
  if (gs) return ra;
  ((gs = 1),
    Object.defineProperty(ra, '__esModule', { value: !0 }),
    (ra.findCommonPrefix = void 0));
  function t(d, u = 0) {
    if (d.length === 0) return '';
    let a = d[0].slice(u);
    for (let e = 1; e < d.length; e++) {
      const r = d[e];
      for (; r.indexOf(a, u) !== u;)
        if (((a = a.substring(0, a.length - 1)), a === '')) return a;
    }
    return a;
  }
  return ((ra.findCommonPrefix = t), ra);
}
var ps;
function sf() {
  if (ps) return _t;
  ((ps = 1),
    Object.defineProperty(_t, '__esModule', { value: !0 }),
    (_t.serializeDict =
      _t.detectLabelType =
      _t.writeLabelSame =
      _t.writeLabelLong =
      _t.writeLabelShort =
      _t.buildTree =
        void 0));
  const t = dt(),
    d = of();
  function u(D, G) {
    for (; D.length < G;) D = '0' + D;
    return D;
  }
  function a(D, G) {
    if (D.size === 0) throw Error('Internal inconsistency');
    let te = new Map(),
      W = new Map();
    for (let [F, K] of D.entries()) F[G] === '0' ? te.set(F, K) : W.set(F, K);
    if (te.size === 0) throw Error('Internal inconsistency. Left emtpy.');
    if (W.size === 0) throw Error('Internal inconsistency. Right emtpy.');
    return { left: te, right: W };
  }
  function e(D, G) {
    if (D.size === 0) throw Error('Internal inconsistency');
    if (D.size === 1) return { type: 'leaf', value: Array.from(D.values())[0] };
    let { left: te, right: W } = a(D, G);
    return { type: 'fork', left: r(te, G + 1), right: r(W, G + 1) };
  }
  function r(D, G = 0) {
    if (D.size === 0) throw Error('Internal inconsistency');
    const te = (0, d.findCommonPrefix)(Array.from(D.keys()), G);
    return { label: te, node: e(D, te.length + G) };
  }
  function n(D, G) {
    let te = new Map();
    for (let W of Array.from(D.keys())) {
      const F = u(W.toString(2), G);
      te.set(F, D.get(W));
    }
    return r(te);
  }
  _t.buildTree = n;
  function i(D, G) {
    G.storeBit(0);
    for (let te = 0; te < D.length; te++) G.storeBit(1);
    return (
      G.storeBit(0),
      D.length > 0 && G.storeUint(BigInt('0b' + D), D.length),
      G
    );
  }
  _t.writeLabelShort = i;
  function s(D) {
    return 1 + D.length + 1 + D.length;
  }
  function f(D, G, te) {
    (te.storeBit(1), te.storeBit(0));
    let W = Math.ceil(Math.log2(G + 1));
    return (
      te.storeUint(D.length, W),
      D.length > 0 && te.storeUint(BigInt('0b' + D), D.length),
      te
    );
  }
  _t.writeLabelLong = f;
  function o(D, G) {
    return 2 + Math.ceil(Math.log2(G + 1)) + D.length;
  }
  function y(D, G, te, W) {
    (W.storeBit(1), W.storeBit(1), W.storeBit(D));
    let F = Math.ceil(Math.log2(te + 1));
    W.storeUint(G, F);
  }
  _t.writeLabelSame = y;
  function v(D) {
    return 3 + Math.ceil(Math.log2(D + 1));
  }
  function w(D) {
    if (D.length === 0 || D.length === 1) return !0;
    for (let G = 1; G < D.length; G++) if (D[G] !== D[0]) return !1;
    return !0;
  }
  function R(D, G) {
    let te = 'short',
      W = s(D),
      F = o(D, G);
    if ((F < W && ((W = F), (te = 'long')), w(D))) {
      let K = v(G);
      K < W && ((W = K), (te = 'same'));
    }
    return te;
  }
  _t.detectLabelType = R;
  function C(D, G, te) {
    let W = R(D, G);
    W === 'short'
      ? i(D, te)
      : W === 'long'
        ? f(D, G, te)
        : W === 'same' && y(D[0] === '1', D.length, G, te);
  }
  function P(D, G, te, W) {
    if ((D.type === 'leaf' && te(D.value, W), D.type === 'fork')) {
      const F = (0, t.beginCell)(),
        K = (0, t.beginCell)();
      (E(D.left, G - 1, te, F),
        E(D.right, G - 1, te, K),
        W.storeRef(F),
        W.storeRef(K));
    }
  }
  function E(D, G, te, W) {
    (C(D.label, G, W), P(D.node, G - D.label.length, te, W));
  }
  function N(D, G, te, W) {
    const F = n(D, G);
    E(F, G, te, W);
  }
  return ((_t.serializeDict = N), _t);
}
var Ir = {},
  ms;
function lf() {
  if (ms) return Ir;
  ((ms = 1),
    Object.defineProperty(Ir, '__esModule', { value: !0 }),
    (Ir.deserializeInternalKey = Ir.serializeInternalKey = void 0));
  const t = hr(),
    d = gr(),
    u = Si();
  function a(r) {
    if (typeof r == 'number') {
      if (!Number.isSafeInteger(r))
        throw Error('Invalid key type: not a safe integer: ' + r);
      return 'n:' + r.toString(10);
    } else {
      if (typeof r == 'bigint') return 'b:' + r.toString(10);
      if (t.Address.isAddress(r)) return 'a:' + r.toString();
      if (Buffer.isBuffer(r)) return 'f:' + r.toString('hex');
      if (d.BitString.isBitString(r)) return 'B:' + r.toString();
      throw Error('Invalid key type');
    }
  }
  Ir.serializeInternalKey = a;
  function e(r) {
    let n = r.slice(0, 2),
      i = r.slice(2);
    if (n === 'n:') return parseInt(i, 10);
    if (n === 'b:') return BigInt(i);
    if (n === 'a:') return t.Address.parse(i);
    if (n === 'f:') return Buffer.from(i, 'hex');
    if (n === 'B:') {
      const s = i.slice(-1) == '_';
      if (s || i.length % 2 != 0) {
        let o = s ? i.length - 1 : i.length;
        const y = i.substr(0, o) + '0';
        return !s && (o & 1) !== 0
          ? new d.BitString(Buffer.from(y, 'hex'), 0, o << 2)
          : (0, u.paddedBufferToBits)(Buffer.from(y, 'hex'));
      } else return new d.BitString(Buffer.from(i, 'hex'), 0, i.length << 2);
    }
    throw Error('Invalid key type: ' + n);
  }
  return ((Ir.deserializeInternalKey = e), Ir);
}
var ys;
function mr() {
  if (ys) return Jn;
  ((ys = 1),
    Object.defineProperty(Jn, '__esModule', { value: !0 }),
    (Jn.Dictionary = void 0));
  const t = hr(),
    d = dt(),
    u = Cn(),
    a = gr(),
    e = ho(),
    r = ic(),
    n = af(),
    i = sf(),
    s = lf();
  let f = class fr {
    static empty(q, ie) {
      return q && ie ? new fr(new Map(), q, ie) : new fr(new Map(), null, null);
    }
    static load(q, ie, Se) {
      let Ee;
      if (Se instanceof u.Cell) {
        if (Se.isExotic) return fr.empty(q, ie);
        Ee = Se.beginParse();
      } else Ee = Se;
      let He = Ee.loadMaybeRef();
      return He && !He.isExotic
        ? fr.loadDirect(q, ie, He.beginParse())
        : fr.empty(q, ie);
    }
    static loadDirect(q, ie, Se) {
      if (!Se) return fr.empty(q, ie);
      let Ee;
      Se instanceof u.Cell ? (Ee = Se.beginParse()) : (Ee = Se);
      let He = (0, n.parseDict)(Ee, q.bits, ie.parse),
        L = new Map();
      for (let [Be, ge] of He)
        L.set((0, s.serializeInternalKey)(q.parse(Be)), ge);
      return new fr(L, q, ie);
    }
    constructor(q, ie, Se) {
      ((this._key = ie), (this._value = Se), (this._map = q));
    }
    get size() {
      return this._map.size;
    }
    get(q) {
      return this._map.get((0, s.serializeInternalKey)(q));
    }
    has(q) {
      return this._map.has((0, s.serializeInternalKey)(q));
    }
    set(q, ie) {
      return (this._map.set((0, s.serializeInternalKey)(q), ie), this);
    }
    delete(q) {
      const ie = (0, s.serializeInternalKey)(q);
      return this._map.delete(ie);
    }
    clear() {
      this._map.clear();
    }
    *[Symbol.iterator]() {
      for (const [q, ie] of this._map)
        yield [(0, s.deserializeInternalKey)(q), ie];
    }
    keys() {
      return Array.from(this._map.keys()).map((q) =>
        (0, s.deserializeInternalKey)(q),
      );
    }
    values() {
      return Array.from(this._map.values());
    }
    store(q, ie, Se) {
      if (this._map.size === 0) q.storeBit(0);
      else {
        let Ee = this._key;
        ie != null && (Ee = ie);
        let He = this._value;
        if ((Se != null && (He = Se), !Ee))
          throw Error('Key serializer is not defined');
        if (!He) throw Error('Value serializer is not defined');
        let L = new Map();
        for (const [ge, ve] of this._map)
          L.set(Ee.serialize((0, s.deserializeInternalKey)(ge)), ve);
        q.storeBit(1);
        let Be = (0, d.beginCell)();
        ((0, i.serializeDict)(L, Ee.bits, He.serialize, Be),
          q.storeRef(Be.endCell()));
      }
    }
    storeDirect(q, ie, Se) {
      if (this._map.size === 0)
        throw Error('Cannot store empty dictionary directly');
      let Ee = this._key;
      ie != null && (Ee = ie);
      let He = this._value;
      if ((Se != null && (He = Se), !Ee))
        throw Error('Key serializer is not defined');
      if (!He) throw Error('Value serializer is not defined');
      let L = new Map();
      for (const [Be, ge] of this._map)
        L.set(Ee.serialize((0, s.deserializeInternalKey)(Be)), ge);
      (0, i.serializeDict)(L, Ee.bits, He.serialize, q);
    }
    generateMerkleProof(q) {
      return (0, e.generateMerkleProof)(this, q, this._key);
    }
    generateMerkleProofDirect(q) {
      return (0, e.generateMerkleProofDirect)(this, q, this._key);
    }
    generateMerkleUpdate(q, ie) {
      return (0, r.generateMerkleUpdate)(this, q, this._key, ie);
    }
  };
  ((Jn.Dictionary = f),
    (f.Keys = {
      Address: () => o(),
      BigInt: ($) => y($),
      Int: ($) => v($),
      BigUint: ($) => w($),
      Uint: ($) => R($),
      Buffer: ($) => C($),
      BitString: ($) => P($),
    }),
    (f.Values = {
      BigInt: ($) => N($),
      Int: ($) => E($),
      BigVarInt: ($) => D($),
      BigUint: ($) => W($),
      Uint: ($) => te($),
      BigVarUint: ($) => G($),
      Bool: () => F(),
      Address: () => K(),
      Cell: () => Y(),
      Buffer: ($) => we($),
      BitString: ($) => Ce($),
      Dictionary: ($, q) => ue($, q),
    }));
  function o() {
    return {
      bits: 267,
      serialize: ($) => {
        if (!t.Address.isAddress($)) throw Error('Key is not an address');
        return (0, d.beginCell)()
          .storeAddress($)
          .endCell()
          .beginParse()
          .preloadUintBig(267);
      },
      parse: ($) =>
        (0, d.beginCell)()
          .storeUint($, 267)
          .endCell()
          .beginParse()
          .loadAddress(),
    };
  }
  function y($) {
    return {
      bits: $,
      serialize: (q) => {
        if (typeof q != 'bigint') throw Error('Key is not a bigint');
        return (0, d.beginCell)()
          .storeInt(q, $)
          .endCell()
          .beginParse()
          .loadUintBig($);
      },
      parse: (q) =>
        (0, d.beginCell)().storeUint(q, $).endCell().beginParse().loadIntBig($),
    };
  }
  function v($) {
    return {
      bits: $,
      serialize: (q) => {
        if (typeof q != 'number') throw Error('Key is not a number');
        if (!Number.isSafeInteger(q))
          throw Error('Key is not a safe integer: ' + q);
        return (0, d.beginCell)()
          .storeInt(q, $)
          .endCell()
          .beginParse()
          .loadUintBig($);
      },
      parse: (q) =>
        (0, d.beginCell)().storeUint(q, $).endCell().beginParse().loadInt($),
    };
  }
  function w($) {
    return {
      bits: $,
      serialize: (q) => {
        if (typeof q != 'bigint') throw Error('Key is not a bigint');
        if (q < 0) throw Error('Key is negative: ' + q);
        return (0, d.beginCell)()
          .storeUint(q, $)
          .endCell()
          .beginParse()
          .loadUintBig($);
      },
      parse: (q) =>
        (0, d.beginCell)()
          .storeUint(q, $)
          .endCell()
          .beginParse()
          .loadUintBig($),
    };
  }
  function R($) {
    return {
      bits: $,
      serialize: (q) => {
        if (typeof q != 'number') throw Error('Key is not a number');
        if (!Number.isSafeInteger(q))
          throw Error('Key is not a safe integer: ' + q);
        if (q < 0) throw Error('Key is negative: ' + q);
        return (0, d.beginCell)()
          .storeUint(q, $)
          .endCell()
          .beginParse()
          .loadUintBig($);
      },
      parse: (q) =>
        Number(
          (0, d.beginCell)().storeUint(q, $).endCell().beginParse().loadUint($),
        ),
    };
  }
  function C($) {
    return {
      bits: $ * 8,
      serialize: (q) => {
        if (!Buffer.isBuffer(q)) throw Error('Key is not a buffer');
        return (0, d.beginCell)()
          .storeBuffer(q)
          .endCell()
          .beginParse()
          .loadUintBig($ * 8);
      },
      parse: (q) =>
        (0, d.beginCell)()
          .storeUint(q, $ * 8)
          .endCell()
          .beginParse()
          .loadBuffer($),
    };
  }
  function P($) {
    return {
      bits: $,
      serialize: (q) => {
        if (!a.BitString.isBitString(q)) throw Error('Key is not a BitString');
        return (0, d.beginCell)()
          .storeBits(q)
          .endCell()
          .beginParse()
          .loadUintBig($);
      },
      parse: (q) =>
        (0, d.beginCell)().storeUint(q, $).endCell().beginParse().loadBits($),
    };
  }
  function E($) {
    return {
      serialize: (q, ie) => {
        ie.storeInt(q, $);
      },
      parse: (q) => {
        let ie = q.loadInt($);
        return (q.endParse(), ie);
      },
    };
  }
  function N($) {
    return {
      serialize: (q, ie) => {
        ie.storeInt(q, $);
      },
      parse: (q) => {
        let ie = q.loadIntBig($);
        return (q.endParse(), ie);
      },
    };
  }
  function D($) {
    return {
      serialize: (q, ie) => {
        ie.storeVarInt(q, $);
      },
      parse: (q) => {
        let ie = q.loadVarIntBig($);
        return (q.endParse(), ie);
      },
    };
  }
  function G($) {
    return {
      serialize: (q, ie) => {
        ie.storeVarUint(q, $);
      },
      parse: (q) => {
        let ie = q.loadVarUintBig($);
        return (q.endParse(), ie);
      },
    };
  }
  function te($) {
    return {
      serialize: (q, ie) => {
        ie.storeUint(q, $);
      },
      parse: (q) => {
        let ie = q.loadUint($);
        return (q.endParse(), ie);
      },
    };
  }
  function W($) {
    return {
      serialize: (q, ie) => {
        ie.storeUint(q, $);
      },
      parse: (q) => {
        let ie = q.loadUintBig($);
        return (q.endParse(), ie);
      },
    };
  }
  function F() {
    return {
      serialize: ($, q) => {
        q.storeBit($);
      },
      parse: ($) => {
        let q = $.loadBit();
        return ($.endParse(), q);
      },
    };
  }
  function K() {
    return {
      serialize: ($, q) => {
        q.storeAddress($);
      },
      parse: ($) => {
        let q = $.loadAddress();
        return ($.endParse(), q);
      },
    };
  }
  function Y() {
    return {
      serialize: ($, q) => {
        q.storeRef($);
      },
      parse: ($) => {
        let q = $.loadRef();
        return ($.endParse(), q);
      },
    };
  }
  function ue($, q) {
    return {
      serialize: (ie, Se) => {
        ie.store(Se);
      },
      parse: (ie) => {
        let Se = f.load($, q, ie);
        return (ie.endParse(), Se);
      },
    };
  }
  function we($) {
    return {
      serialize: (q, ie) => {
        if (q.length !== $) throw Error('Invalid buffer size');
        ie.storeBuffer(q);
      },
      parse: (q) => {
        let ie = q.loadBuffer($);
        return (q.endParse(), ie);
      },
    };
  }
  function Ce($) {
    return {
      serialize: (q, ie) => {
        if (q.length !== $) throw Error('Invalid BitString size');
        ie.storeBits(q);
      },
      parse: (q) => {
        let ie = q.loadBits($);
        return (q.endParse(), ie);
      },
    };
  }
  return Jn;
}
var Lt = {},
  bs;
function oc() {
  if (bs) return Lt;
  ((bs = 1),
    Object.defineProperty(Lt, '__esModule', { value: !0 }),
    (Lt.writeString = Lt.stringToCell = Lt.readString = void 0));
  const t = dt();
  function d(n) {
    if (n.remainingBits % 8 !== 0)
      throw new Error(`Invalid string length: ${n.remainingBits}`);
    if (n.remainingRefs !== 0 && n.remainingRefs !== 1)
      throw new Error(`invalid number of refs: ${n.remainingRefs}`);
    let i;
    return (
      n.remainingBits === 0
        ? (i = Buffer.alloc(0))
        : (i = n.loadBuffer(n.remainingBits / 8)),
      n.remainingRefs === 1 &&
        (i = Buffer.concat([i, d(n.loadRef().beginParse())])),
      i
    );
  }
  function u(n) {
    return d(n).toString();
  }
  Lt.readString = u;
  function a(n, i) {
    if (n.length > 0) {
      let s = Math.floor(i.availableBits / 8);
      if (n.length > s) {
        let f = n.subarray(0, s),
          o = n.subarray(s);
        i = i.storeBuffer(f);
        let y = (0, t.beginCell)();
        (a(o, y), (i = i.storeRef(y.endCell())));
      } else i = i.storeBuffer(n);
    }
  }
  function e(n) {
    let i = (0, t.beginCell)();
    return (a(Buffer.from(n), i), i.endCell());
  }
  Lt.stringToCell = e;
  function r(n, i) {
    a(Buffer.from(n), i);
  }
  return ((Lt.writeString = r), Lt);
}
var ws;
function go() {
  if (ws) return Yn;
  ws = 1;
  var t;
  (Object.defineProperty(Yn, '__esModule', { value: !0 }), (Yn.Slice = void 0));
  const d = En(),
    u = mr(),
    a = dt(),
    e = oc();
  let r = class so {
    constructor(i, s) {
      ((this[t] = () => this.toString()),
        (this._reader = i.clone()),
        (this._refs = [...s]),
        (this._refsOffset = 0));
    }
    get remainingBits() {
      return this._reader.remaining;
    }
    get offsetBits() {
      return this._reader.offset;
    }
    get remainingRefs() {
      return this._refs.length - this._refsOffset;
    }
    get offsetRefs() {
      return this._refsOffset;
    }
    skip(i) {
      return (this._reader.skip(i), this);
    }
    loadBit() {
      return this._reader.loadBit();
    }
    preloadBit() {
      return this._reader.preloadBit();
    }
    loadBoolean() {
      return this.loadBit();
    }
    loadMaybeBoolean() {
      return this.loadBit() ? this.loadBoolean() : null;
    }
    loadBits(i) {
      return this._reader.loadBits(i);
    }
    preloadBits(i) {
      return this._reader.preloadBits(i);
    }
    loadUint(i) {
      return this._reader.loadUint(i);
    }
    loadUintBig(i) {
      return this._reader.loadUintBig(i);
    }
    preloadUint(i) {
      return this._reader.preloadUint(i);
    }
    preloadUintBig(i) {
      return this._reader.preloadUintBig(i);
    }
    loadMaybeUint(i) {
      return this.loadBit() ? this.loadUint(i) : null;
    }
    loadMaybeUintBig(i) {
      return this.loadBit() ? this.loadUintBig(i) : null;
    }
    loadInt(i) {
      return this._reader.loadInt(i);
    }
    loadIntBig(i) {
      return this._reader.loadIntBig(i);
    }
    preloadInt(i) {
      return this._reader.preloadInt(i);
    }
    preloadIntBig(i) {
      return this._reader.preloadIntBig(i);
    }
    loadMaybeInt(i) {
      return this.loadBit() ? this.loadInt(i) : null;
    }
    loadMaybeIntBig(i) {
      return this.loadBit() ? this.loadIntBig(i) : null;
    }
    loadVarUint(i) {
      return this._reader.loadVarUint(i);
    }
    loadVarUintBig(i) {
      return this._reader.loadVarUintBig(i);
    }
    preloadVarUint(i) {
      return this._reader.preloadVarUint(i);
    }
    preloadVarUintBig(i) {
      return this._reader.preloadVarUintBig(i);
    }
    loadVarInt(i) {
      return this._reader.loadVarInt(i);
    }
    loadVarIntBig(i) {
      return this._reader.loadVarIntBig(i);
    }
    preloadVarInt(i) {
      return this._reader.preloadVarInt(i);
    }
    preloadVarIntBig(i) {
      return this._reader.preloadVarIntBig(i);
    }
    loadCoins() {
      return this._reader.loadCoins();
    }
    preloadCoins() {
      return this._reader.preloadCoins();
    }
    loadMaybeCoins() {
      return this._reader.loadBit() ? this._reader.loadCoins() : null;
    }
    loadAddress() {
      return this._reader.loadAddress();
    }
    loadMaybeAddress() {
      return this._reader.loadMaybeAddress();
    }
    loadExternalAddress() {
      return this._reader.loadExternalAddress();
    }
    loadMaybeExternalAddress() {
      return this._reader.loadMaybeExternalAddress();
    }
    loadAddressAny() {
      return this._reader.loadAddressAny();
    }
    loadRef() {
      if (this._refsOffset >= this._refs.length)
        throw new Error('No more references');
      return this._refs[this._refsOffset++];
    }
    preloadRef() {
      if (this._refsOffset >= this._refs.length)
        throw new Error('No more references');
      return this._refs[this._refsOffset];
    }
    loadMaybeRef() {
      return this.loadBit() ? this.loadRef() : null;
    }
    preloadMaybeRef() {
      return this.preloadBit() ? this.preloadRef() : null;
    }
    loadBuffer(i) {
      return this._reader.loadBuffer(i);
    }
    preloadBuffer(i) {
      return this._reader.preloadBuffer(i);
    }
    loadStringTail() {
      return (0, e.readString)(this);
    }
    loadMaybeStringTail() {
      return this.loadBit() ? (0, e.readString)(this) : null;
    }
    loadStringRefTail() {
      return (0, e.readString)(this.loadRef().beginParse());
    }
    loadMaybeStringRefTail() {
      const i = this.loadMaybeRef();
      return i ? (0, e.readString)(i.beginParse()) : null;
    }
    loadDict(i, s) {
      return u.Dictionary.load(i, s, this);
    }
    loadDictDirect(i, s) {
      return u.Dictionary.loadDirect(i, s, this);
    }
    endParse() {
      if (this.remainingBits > 0 || this.remainingRefs > 0)
        throw new Error('Slice is not empty');
    }
    asCell() {
      return (0, a.beginCell)().storeSlice(this).endCell();
    }
    asBuilder() {
      return (0, a.beginCell)().storeSlice(this);
    }
    clone(i = !1) {
      if (i) {
        let s = this._reader.clone();
        return (s.reset(), new so(s, this._refs));
      } else {
        let s = new so(this._reader, this._refs);
        return ((s._refsOffset = this._refsOffset), s);
      }
    }
    toString() {
      return this.asCell().toString();
    }
  };
  return ((Yn.Slice = r), (t = d.inspectSymbol), Yn);
}
var na = {},
  aa = {},
  vs;
function sc() {
  if (vs) return aa;
  ((vs = 1),
    Object.defineProperty(aa, '__esModule', { value: !0 }),
    (aa.exoticLibrary = void 0));
  const t = pr();
  function d(u, a) {
    const e = new t.BitReader(u);
    if (u.length !== 264)
      throw new Error(
        `Library cell must have exactly (8 + 256) bits, got "${u.length}"`,
      );
    let n = e.loadUint(8);
    if (n !== 2) throw new Error(`Library cell must have type 2, got "${n}"`);
    return {};
  }
  return ((aa.exoticLibrary = d), aa);
}
var ia = {},
  _s;
function po() {
  if (_s) return ia;
  ((_s = 1),
    Object.defineProperty(ia, '__esModule', { value: !0 }),
    (ia.exoticMerkleUpdate = void 0));
  const t = pr();
  function d(u, a) {
    const e = new t.BitReader(u),
      r = 8 + 2 * 272;
    if (u.length !== r)
      throw new Error(
        `Merkle Update cell must have exactly (8 + (2 * (256 + 16))) bits, got "${u.length}"`,
      );
    if (a.length !== 2)
      throw new Error(
        `Merkle Update cell must have exactly 2 refs, got "${a.length}"`,
      );
    let n = e.loadUint(8);
    if (n !== 4)
      throw new Error(`Merkle Update cell type must be exactly 4, got "${n}"`);
    const i = e.loadBuffer(32),
      s = e.loadBuffer(32),
      f = e.loadUint(16),
      o = e.loadUint(16);
    if (f !== a[0].depth(0))
      throw new Error(
        `Merkle Update cell ref depth must be exactly "${f}", got "${a[0].depth(0)}"`,
      );
    if (!i.equals(a[0].hash(0)))
      throw new Error(
        `Merkle Update cell ref hash must be exactly "${i.toString('hex')}", got "${a[0].hash(0).toString('hex')}"`,
      );
    if (o !== a[1].depth(0))
      throw new Error(
        `Merkle Update cell ref depth must be exactly "${o}", got "${a[1].depth(0)}"`,
      );
    if (!s.equals(a[1].hash(0)))
      throw new Error(
        `Merkle Update cell ref hash must be exactly "${s.toString('hex')}", got "${a[1].hash(0).toString('hex')}"`,
      );
    return { proofDepth1: f, proofDepth2: o, proofHash1: i, proofHash2: s };
  }
  return ((ia.exoticMerkleUpdate = d), ia);
}
var oa = {},
  sa = {},
  ks;
function mo() {
  if (ks) return sa;
  ((ks = 1),
    Object.defineProperty(sa, '__esModule', { value: !0 }),
    (sa.LevelMask = void 0));
  let t = class lc {
    constructor(a = 0) {
      ((this._mask = 0),
        (this._mask = a),
        (this._hashIndex = d(this._mask)),
        (this._hashCount = this._hashIndex + 1));
    }
    get value() {
      return this._mask;
    }
    get level() {
      return 32 - Math.clz32(this._mask);
    }
    get hashIndex() {
      return this._hashIndex;
    }
    get hashCount() {
      return this._hashCount;
    }
    apply(a) {
      return new lc(this._mask & ((1 << a) - 1));
    }
    isSignificant(a) {
      return a === 0 || (this._mask >> (a - 1)) % 2 !== 0;
    }
  };
  sa.LevelMask = t;
  function d(u) {
    return (
      (u = u - ((u >> 1) & 1431655765)),
      (u = (u & 858993459) + ((u >> 2) & 858993459)),
      (((u + (u >> 4)) & 252645135) * 16843009) >> 24
    );
  }
  return sa;
}
var Cs;
function yo() {
  if (Cs) return oa;
  ((Cs = 1),
    Object.defineProperty(oa, '__esModule', { value: !0 }),
    (oa.exoticPruned = void 0));
  const t = pr(),
    d = mo();
  function u(a, e) {
    let r = new t.BitReader(a),
      n = r.loadUint(8);
    if (n !== 1)
      throw new Error(`Pruned branch cell must have type 1, got "${n}"`);
    if (e.length !== 0)
      throw new Error(`Pruned Branch cell can't has refs, got "${e.length}"`);
    let i;
    if (a.length === 280) i = new d.LevelMask(1);
    else {
      if (((i = new d.LevelMask(r.loadUint(8))), i.level < 1 || i.level > 3))
        throw new Error(
          `Pruned Branch cell level must be >= 1 and <= 3, got "${i.level}/${i.value}"`,
        );
      const y = 16 + i.apply(i.level - 1).hashCount * 272;
      if (a.length !== y)
        throw new Error(
          `Pruned branch cell must have exactly ${y} bits, got "${a.length}"`,
        );
    }
    let s = [],
      f = [],
      o = [];
    for (let y = 0; y < i.level; y++) f.push(r.loadBuffer(32));
    for (let y = 0; y < i.level; y++) o.push(r.loadUint(16));
    for (let y = 0; y < i.level; y++) s.push({ depth: o[y], hash: f[y] });
    return { mask: i.value, pruned: s };
  }
  return ((oa.exoticPruned = u), oa);
}
var Ss;
function uf() {
  if (Ss) return na;
  ((Ss = 1),
    Object.defineProperty(na, '__esModule', { value: !0 }),
    (na.resolveExotic = void 0));
  const t = pr(),
    d = Xa(),
    u = sc(),
    a = Pi(),
    e = po(),
    r = yo(),
    n = mo();
  function i(v, w) {
    let R = (0, r.exoticPruned)(v, w),
      C = [],
      P = [],
      E = new n.LevelMask(R.mask);
    for (let N = 0; N < R.pruned.length; N++)
      (C.push(R.pruned[N].depth), P.push(R.pruned[N].hash));
    return { type: d.CellType.PrunedBranch, depths: C, hashes: P, mask: E };
  }
  function s(v, w) {
    (0, u.exoticLibrary)(v, w);
    let R = [],
      C = [],
      P = new n.LevelMask();
    return { type: d.CellType.Library, depths: R, hashes: C, mask: P };
  }
  function f(v, w) {
    (0, a.exoticMerkleProof)(v, w);
    let R = [],
      C = [],
      P = new n.LevelMask(w[0].level() >> 1);
    return { type: d.CellType.MerkleProof, depths: R, hashes: C, mask: P };
  }
  function o(v, w) {
    (0, e.exoticMerkleUpdate)(v, w);
    let R = [],
      C = [],
      P = new n.LevelMask((w[0].level() | w[1].level()) >> 1);
    return { type: d.CellType.MerkleUpdate, depths: R, hashes: C, mask: P };
  }
  function y(v, w) {
    let C = new t.BitReader(v).preloadUint(8);
    if (C === 1) return i(v, w);
    if (C === 2) return s(v, w);
    if (C === 3) return f(v, w);
    if (C === 4) return o(v, w);
    throw Error('Invalid exotic cell type: ' + C);
  }
  return ((na.resolveExotic = y), na);
}
var la = {},
  Vt = {},
  Bs;
function uc() {
  if (Bs) return Vt;
  ((Bs = 1),
    Object.defineProperty(Vt, '__esModule', { value: !0 }),
    (Vt.getRepr = Vt.getBitsDescriptor = Vt.getRefsDescriptor = void 0));
  const t = Xa(),
    d = Si();
  function u(r, n, i) {
    return r.length + (i !== t.CellType.Ordinary ? 1 : 0) * 8 + n * 32;
  }
  Vt.getRefsDescriptor = u;
  function a(r) {
    let n = r.length;
    return Math.ceil(n / 8) + Math.floor(n / 8);
  }
  Vt.getBitsDescriptor = a;
  function e(r, n, i, s, f, o) {
    const y = Math.ceil(n.length / 8),
      v = Buffer.alloc(2 + y + 34 * i.length);
    let w = 0;
    ((v[w++] = u(i, f, o)),
      (v[w++] = a(r)),
      (0, d.bitsToPaddedBuffer)(n).copy(v, w),
      (w += y));
    for (const R of i) {
      let C;
      (o == t.CellType.MerkleProof || o == t.CellType.MerkleUpdate
        ? (C = R.depth(s + 1))
        : (C = R.depth(s)),
        (v[w++] = Math.floor(C / 256)),
        (v[w++] = C % 256));
    }
    for (const R of i) {
      let C;
      (o == t.CellType.MerkleProof || o == t.CellType.MerkleUpdate
        ? (C = R.hash(s + 1))
        : (C = R.hash(s)),
        C.copy(v, w),
        (w += 32));
    }
    return v;
  }
  return ((Vt.getRepr = e), Vt);
}
var Qi = {},
  Et = {},
  Ci = { exports: {} },
  cf = Ci.exports,
  Ps;
function bo() {
  return (
    Ps ||
      ((Ps = 1),
      (function (t, d) {
        (function (u, a) {
          t.exports = a();
        })(cf, function () {
          var u =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          function a(U, k, M, j) {
            var V,
              x,
              J,
              Q = k || [0],
              re = (M = M || 0) >>> 3,
              ce = j === -1 ? 3 : 0;
            for (V = 0; V < U.length; V += 1)
              ((x = (J = V + re) >>> 2),
                Q.length <= x && Q.push(0),
                (Q[x] |= U[V] << (8 * (ce + j * (J % 4)))));
            return { value: Q, binLen: 8 * U.length + M };
          }
          function e(U, k, M) {
            switch (k) {
              case 'UTF8':
              case 'UTF16BE':
              case 'UTF16LE':
                break;
              default:
                throw new Error('encoding must be UTF8, UTF16BE, or UTF16LE');
            }
            switch (U) {
              case 'HEX':
                return function (j, V, x) {
                  return (function (J, Q, re, ce) {
                    var Pe, S, me, ze;
                    if (J.length % 2 != 0)
                      throw new Error(
                        'String of HEX type must be in byte increments',
                      );
                    var se = Q || [0],
                      fe = (re = re || 0) >>> 3,
                      $e = ce === -1 ? 3 : 0;
                    for (Pe = 0; Pe < J.length; Pe += 2) {
                      if (((S = parseInt(J.substr(Pe, 2), 16)), isNaN(S)))
                        throw new Error(
                          'String of HEX type contains invalid characters',
                        );
                      for (me = (ze = (Pe >>> 1) + fe) >>> 2; se.length <= me;)
                        se.push(0);
                      se[me] |= S << (8 * ($e + ce * (ze % 4)));
                    }
                    return { value: se, binLen: 4 * J.length + re };
                  })(j, V, x, M);
                };
              case 'TEXT':
                return function (j, V, x) {
                  return (function (J, Q, re, ce, Pe) {
                    var S,
                      me,
                      ze,
                      se,
                      fe,
                      $e,
                      Ye,
                      tt,
                      Ct = 0,
                      ht = re || [0],
                      mt = (ce = ce || 0) >>> 3;
                    if (Q === 'UTF8')
                      for (
                        Ye = Pe === -1 ? 3 : 0, ze = 0;
                        ze < J.length;
                        ze += 1
                      )
                        for (
                          me = [],
                            128 > (S = J.charCodeAt(ze))
                              ? me.push(S)
                              : 2048 > S
                                ? (me.push(192 | (S >>> 6)),
                                  me.push(128 | (63 & S)))
                                : 55296 > S || 57344 <= S
                                  ? me.push(
                                      224 | (S >>> 12),
                                      128 | ((S >>> 6) & 63),
                                      128 | (63 & S),
                                    )
                                  : ((ze += 1),
                                    (S =
                                      65536 +
                                      (((1023 & S) << 10) |
                                        (1023 & J.charCodeAt(ze)))),
                                    me.push(
                                      240 | (S >>> 18),
                                      128 | ((S >>> 12) & 63),
                                      128 | ((S >>> 6) & 63),
                                      128 | (63 & S),
                                    )),
                            se = 0;
                          se < me.length;
                          se += 1
                        ) {
                          for (fe = ($e = Ct + mt) >>> 2; ht.length <= fe;)
                            ht.push(0);
                          ((ht[fe] |= me[se] << (8 * (Ye + Pe * ($e % 4)))),
                            (Ct += 1));
                        }
                    else
                      for (
                        Ye = Pe === -1 ? 2 : 0,
                          tt =
                            (Q === 'UTF16LE' && Pe !== 1) ||
                            (Q !== 'UTF16LE' && Pe === 1),
                          ze = 0;
                        ze < J.length;
                        ze += 1
                      ) {
                        for (
                          S = J.charCodeAt(ze),
                            tt === !0 &&
                              (S = ((se = 255 & S) << 8) | (S >>> 8)),
                            fe = ($e = Ct + mt) >>> 2;
                          ht.length <= fe;
                        )
                          ht.push(0);
                        ((ht[fe] |= S << (8 * (Ye + Pe * ($e % 4)))),
                          (Ct += 2));
                      }
                    return { value: ht, binLen: 8 * Ct + ce };
                  })(j, k, V, x, M);
                };
              case 'B64':
                return function (j, V, x) {
                  return (function (J, Q, re, ce) {
                    var Pe,
                      S,
                      me,
                      ze,
                      se,
                      fe,
                      $e = 0,
                      Ye = Q || [0],
                      tt = (re = re || 0) >>> 3,
                      Ct = ce === -1 ? 3 : 0,
                      ht = J.indexOf('=');
                    if (J.search(/^[a-zA-Z0-9=+/]+$/) === -1)
                      throw new Error('Invalid character in base-64 string');
                    if (((J = J.replace(/=/g, '')), ht !== -1 && ht < J.length))
                      throw new Error("Invalid '=' found in base-64 string");
                    for (Pe = 0; Pe < J.length; Pe += 4) {
                      for (
                        ze = J.substr(Pe, 4), me = 0, S = 0;
                        S < ze.length;
                        S += 1
                      )
                        me |= u.indexOf(ze.charAt(S)) << (18 - 6 * S);
                      for (S = 0; S < ze.length - 1; S += 1) {
                        for (se = (fe = $e + tt) >>> 2; Ye.length <= se;)
                          Ye.push(0);
                        ((Ye[se] |=
                          ((me >>> (16 - 8 * S)) & 255) <<
                          (8 * (Ct + ce * (fe % 4)))),
                          ($e += 1));
                      }
                    }
                    return { value: Ye, binLen: 8 * $e + re };
                  })(j, V, x, M);
                };
              case 'BYTES':
                return function (j, V, x) {
                  return (function (J, Q, re, ce) {
                    var Pe,
                      S,
                      me,
                      ze,
                      se = Q || [0],
                      fe = (re = re || 0) >>> 3,
                      $e = ce === -1 ? 3 : 0;
                    for (S = 0; S < J.length; S += 1)
                      ((Pe = J.charCodeAt(S)),
                        (me = (ze = S + fe) >>> 2),
                        se.length <= me && se.push(0),
                        (se[me] |= Pe << (8 * ($e + ce * (ze % 4)))));
                    return { value: se, binLen: 8 * J.length + re };
                  })(j, V, x, M);
                };
              case 'ARRAYBUFFER':
                try {
                  new ArrayBuffer(0);
                } catch {
                  throw new Error(
                    'ARRAYBUFFER not supported by this environment',
                  );
                }
                return function (j, V, x) {
                  return (function (J, Q, re, ce) {
                    return a(new Uint8Array(J), Q, re, ce);
                  })(j, V, x, M);
                };
              case 'UINT8ARRAY':
                try {
                  new Uint8Array(0);
                } catch {
                  throw new Error(
                    'UINT8ARRAY not supported by this environment',
                  );
                }
                return function (j, V, x) {
                  return a(j, V, x, M);
                };
              default:
                throw new Error(
                  'format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY',
                );
            }
          }
          function r(U, k, M, j) {
            switch (U) {
              case 'HEX':
                return function (V) {
                  return (function (x, J, Q, re) {
                    var ce,
                      Pe,
                      S = '',
                      me = J / 8,
                      ze = Q === -1 ? 3 : 0;
                    for (ce = 0; ce < me; ce += 1)
                      ((Pe = x[ce >>> 2] >>> (8 * (ze + Q * (ce % 4)))),
                        (S +=
                          '0123456789abcdef'.charAt((Pe >>> 4) & 15) +
                          '0123456789abcdef'.charAt(15 & Pe)));
                    return re.outputUpper ? S.toUpperCase() : S;
                  })(V, k, M, j);
                };
              case 'B64':
                return function (V) {
                  return (function (x, J, Q, re) {
                    var ce,
                      Pe,
                      S,
                      me,
                      ze,
                      se = '',
                      fe = J / 8,
                      $e = Q === -1 ? 3 : 0;
                    for (ce = 0; ce < fe; ce += 3)
                      for (
                        me = ce + 1 < fe ? x[(ce + 1) >>> 2] : 0,
                          ze = ce + 2 < fe ? x[(ce + 2) >>> 2] : 0,
                          S =
                            (((x[ce >>> 2] >>> (8 * ($e + Q * (ce % 4)))) &
                              255) <<
                              16) |
                            (((me >>> (8 * ($e + Q * ((ce + 1) % 4)))) & 255) <<
                              8) |
                            ((ze >>> (8 * ($e + Q * ((ce + 2) % 4)))) & 255),
                          Pe = 0;
                        Pe < 4;
                        Pe += 1
                      )
                        se +=
                          8 * ce + 6 * Pe <= J
                            ? u.charAt((S >>> (6 * (3 - Pe))) & 63)
                            : re.b64Pad;
                    return se;
                  })(V, k, M, j);
                };
              case 'BYTES':
                return function (V) {
                  return (function (x, J, Q) {
                    var re,
                      ce,
                      Pe = '',
                      S = J / 8,
                      me = Q === -1 ? 3 : 0;
                    for (re = 0; re < S; re += 1)
                      ((ce = (x[re >>> 2] >>> (8 * (me + Q * (re % 4)))) & 255),
                        (Pe += String.fromCharCode(ce)));
                    return Pe;
                  })(V, k, M);
                };
              case 'ARRAYBUFFER':
                try {
                  new ArrayBuffer(0);
                } catch {
                  throw new Error(
                    'ARRAYBUFFER not supported by this environment',
                  );
                }
                return function (V) {
                  return (function (x, J, Q) {
                    var re,
                      ce = J / 8,
                      Pe = new ArrayBuffer(ce),
                      S = new Uint8Array(Pe),
                      me = Q === -1 ? 3 : 0;
                    for (re = 0; re < ce; re += 1)
                      S[re] = (x[re >>> 2] >>> (8 * (me + Q * (re % 4)))) & 255;
                    return Pe;
                  })(V, k, M);
                };
              case 'UINT8ARRAY':
                try {
                  new Uint8Array(0);
                } catch {
                  throw new Error(
                    'UINT8ARRAY not supported by this environment',
                  );
                }
                return function (V) {
                  return (function (x, J, Q) {
                    var re,
                      ce = J / 8,
                      Pe = Q === -1 ? 3 : 0,
                      S = new Uint8Array(ce);
                    for (re = 0; re < ce; re += 1)
                      S[re] = (x[re >>> 2] >>> (8 * (Pe + Q * (re % 4)))) & 255;
                    return S;
                  })(V, k, M);
                };
              default:
                throw new Error(
                  'format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY',
                );
            }
          }
          var n = [
              1116352408, 1899447441, 3049323471, 3921009573, 961987163,
              1508970993, 2453635748, 2870763221, 3624381080, 310598401,
              607225278, 1426881987, 1925078388, 2162078206, 2614888103,
              3248222580, 3835390401, 4022224774, 264347078, 604807628,
              770255983, 1249150122, 1555081692, 1996064986, 2554220882,
              2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
              113926993, 338241895, 666307205, 773529912, 1294757372,
              1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
              2730485921, 2820302411, 3259730800, 3345764771, 3516065817,
              3600352804, 4094571909, 275423344, 430227734, 506948616,
              659060556, 883997877, 958139571, 1322822218, 1537002063,
              1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
              2428436474, 2756734187, 3204031479, 3329325298,
            ],
            i = [
              3238371032, 914150663, 812702999, 4144912697, 4290775857,
              1750603025, 1694076839, 3204075428,
            ],
            s = [
              1779033703, 3144134277, 1013904242, 2773480762, 1359893119,
              2600822924, 528734635, 1541459225,
            ],
            f = 'Chosen SHA variant is not supported';
          function o(U, k) {
            var M,
              j,
              V = U.binLen >>> 3,
              x = k.binLen >>> 3,
              J = V << 3,
              Q = (4 - V) << 3;
            if (V % 4 != 0) {
              for (M = 0; M < x; M += 4)
                ((j = (V + M) >>> 2),
                  (U.value[j] |= k.value[M >>> 2] << J),
                  U.value.push(0),
                  (U.value[j + 1] |= k.value[M >>> 2] >>> Q));
              return (
                (U.value.length << 2) - 4 >= x + V && U.value.pop(),
                { value: U.value, binLen: U.binLen + k.binLen }
              );
            }
            return {
              value: U.value.concat(k.value),
              binLen: U.binLen + k.binLen,
            };
          }
          function y(U) {
            var k = { outputUpper: !1, b64Pad: '=', outputLen: -1 },
              M = U || {},
              j = 'Output length must be a multiple of 8';
            if (
              ((k.outputUpper = M.outputUpper || !1),
              M.b64Pad && (k.b64Pad = M.b64Pad),
              M.outputLen)
            ) {
              if (M.outputLen % 8 != 0) throw new Error(j);
              k.outputLen = M.outputLen;
            } else if (M.shakeLen) {
              if (M.shakeLen % 8 != 0) throw new Error(j);
              k.outputLen = M.shakeLen;
            }
            if (typeof k.outputUpper != 'boolean')
              throw new Error('Invalid outputUpper formatting option');
            if (typeof k.b64Pad != 'string')
              throw new Error('Invalid b64Pad formatting option');
            return k;
          }
          function v(U, k, M, j) {
            var V = U + ' must include a value and format';
            if (!k) {
              if (!j) throw new Error(V);
              return j;
            }
            if (k.value === void 0 || !k.format) throw new Error(V);
            return e(k.format, k.encoding || 'UTF8', M)(k.value);
          }
          var w = (function () {
              function U(k, M, j) {
                var V = j || {};
                if (
                  ((this.t = M),
                  (this.i = V.encoding || 'UTF8'),
                  (this.numRounds = V.numRounds || 1),
                  isNaN(this.numRounds) ||
                    this.numRounds !== parseInt(this.numRounds, 10) ||
                    1 > this.numRounds)
                )
                  throw new Error('numRounds must a integer >= 1');
                ((this.o = k),
                  (this.u = []),
                  (this.s = 0),
                  (this.h = !1),
                  (this.v = 0),
                  (this.A = !1),
                  (this.l = []),
                  (this.H = []));
              }
              return (
                (U.prototype.update = function (k) {
                  var M,
                    j = 0,
                    V = this.S >>> 5,
                    x = this.p(k, this.u, this.s),
                    J = x.binLen,
                    Q = x.value,
                    re = J >>> 5;
                  for (M = 0; M < re; M += V)
                    j + this.S <= J &&
                      ((this.m = this.R(Q.slice(M, M + V), this.m)),
                      (j += this.S));
                  ((this.v += j),
                    (this.u = Q.slice(j >>> 5)),
                    (this.s = J % this.S),
                    (this.h = !0));
                }),
                (U.prototype.getHash = function (k, M) {
                  var j,
                    V,
                    x = this.U,
                    J = y(M);
                  if (this.T) {
                    if (J.outputLen === -1)
                      throw new Error(
                        'Output length must be specified in options',
                      );
                    x = J.outputLen;
                  }
                  var Q = r(k, x, this.C, J);
                  if (this.A && this.F) return Q(this.F(J));
                  for (
                    V = this.K(
                      this.u.slice(),
                      this.s,
                      this.v,
                      this.B(this.m),
                      x,
                    ),
                      j = 1;
                    j < this.numRounds;
                    j += 1
                  )
                    (this.T &&
                      x % 32 != 0 &&
                      (V[V.length - 1] &= 16777215 >>> (24 - (x % 32))),
                      (V = this.K(V, x, 0, this.L(this.o), x)));
                  return Q(V);
                }),
                (U.prototype.setHMACKey = function (k, M, j) {
                  if (!this.g) throw new Error('Variant does not support HMAC');
                  if (this.h)
                    throw new Error('Cannot set MAC key after calling update');
                  var V = e(M, (j || {}).encoding || 'UTF8', this.C);
                  this.k(V(k));
                }),
                (U.prototype.k = function (k) {
                  var M,
                    j = this.S >>> 3,
                    V = j / 4 - 1;
                  if (this.numRounds !== 1)
                    throw new Error('Cannot set numRounds with MAC');
                  if (this.A) throw new Error('MAC key already set');
                  for (
                    j < k.binLen / 8 &&
                    (k.value = this.K(
                      k.value,
                      k.binLen,
                      0,
                      this.L(this.o),
                      this.U,
                    ));
                    k.value.length <= V;
                  )
                    k.value.push(0);
                  for (M = 0; M <= V; M += 1)
                    ((this.l[M] = 909522486 ^ k.value[M]),
                      (this.H[M] = 1549556828 ^ k.value[M]));
                  ((this.m = this.R(this.l, this.m)),
                    (this.v = this.S),
                    (this.A = !0));
                }),
                (U.prototype.getHMAC = function (k, M) {
                  var j = y(M);
                  return r(k, this.U, this.C, j)(this.Y());
                }),
                (U.prototype.Y = function () {
                  var k;
                  if (!this.A)
                    throw new Error(
                      'Cannot call getHMAC without first setting MAC key',
                    );
                  var M = this.K(
                    this.u.slice(),
                    this.s,
                    this.v,
                    this.B(this.m),
                    this.U,
                  );
                  return (
                    (k = this.R(this.H, this.L(this.o))),
                    (k = this.K(M, this.U, this.S, k, this.U))
                  );
                }),
                U
              );
            })(),
            R = function (U, k) {
              return (R =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (M, j) {
                    M.__proto__ = j;
                  }) ||
                function (M, j) {
                  for (var V in j)
                    Object.prototype.hasOwnProperty.call(j, V) && (M[V] = j[V]);
                })(U, k);
            };
          function C(U, k) {
            function M() {
              this.constructor = U;
            }
            (R(U, k),
              (U.prototype =
                k === null
                  ? Object.create(k)
                  : ((M.prototype = k.prototype), new M())));
          }
          function P(U, k) {
            return (U << k) | (U >>> (32 - k));
          }
          function E(U, k) {
            return (U >>> k) | (U << (32 - k));
          }
          function N(U, k) {
            return U >>> k;
          }
          function D(U, k, M) {
            return U ^ k ^ M;
          }
          function G(U, k, M) {
            return (U & k) ^ (~U & M);
          }
          function te(U, k, M) {
            return (U & k) ^ (U & M) ^ (k & M);
          }
          function W(U) {
            return E(U, 2) ^ E(U, 13) ^ E(U, 22);
          }
          function F(U, k) {
            var M = (65535 & U) + (65535 & k);
            return (
              ((65535 & ((U >>> 16) + (k >>> 16) + (M >>> 16))) << 16) |
              (65535 & M)
            );
          }
          function K(U, k, M, j) {
            var V = (65535 & U) + (65535 & k) + (65535 & M) + (65535 & j);
            return (
              ((65535 &
                ((U >>> 16) +
                  (k >>> 16) +
                  (M >>> 16) +
                  (j >>> 16) +
                  (V >>> 16))) <<
                16) |
              (65535 & V)
            );
          }
          function Y(U, k, M, j, V) {
            var x =
              (65535 & U) +
              (65535 & k) +
              (65535 & M) +
              (65535 & j) +
              (65535 & V);
            return (
              ((65535 &
                ((U >>> 16) +
                  (k >>> 16) +
                  (M >>> 16) +
                  (j >>> 16) +
                  (V >>> 16) +
                  (x >>> 16))) <<
                16) |
              (65535 & x)
            );
          }
          function ue(U) {
            return E(U, 7) ^ E(U, 18) ^ N(U, 3);
          }
          function we(U) {
            return E(U, 6) ^ E(U, 11) ^ E(U, 25);
          }
          function Ce(U) {
            return [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
          }
          function $(U, k) {
            var M,
              j,
              V,
              x,
              J,
              Q,
              re,
              ce = [];
            for (
              M = k[0], j = k[1], V = k[2], x = k[3], J = k[4], re = 0;
              re < 80;
              re += 1
            )
              ((ce[re] =
                re < 16
                  ? U[re]
                  : P(ce[re - 3] ^ ce[re - 8] ^ ce[re - 14] ^ ce[re - 16], 1)),
                (Q =
                  re < 20
                    ? Y(P(M, 5), G(j, V, x), J, 1518500249, ce[re])
                    : re < 40
                      ? Y(P(M, 5), D(j, V, x), J, 1859775393, ce[re])
                      : re < 60
                        ? Y(P(M, 5), te(j, V, x), J, 2400959708, ce[re])
                        : Y(P(M, 5), D(j, V, x), J, 3395469782, ce[re])),
                (J = x),
                (x = V),
                (V = P(j, 30)),
                (j = M),
                (M = Q));
            return (
              (k[0] = F(M, k[0])),
              (k[1] = F(j, k[1])),
              (k[2] = F(V, k[2])),
              (k[3] = F(x, k[3])),
              (k[4] = F(J, k[4])),
              k
            );
          }
          function q(U, k, M, j) {
            for (
              var V, x = 15 + (((k + 65) >>> 9) << 4), J = k + M;
              U.length <= x;
            )
              U.push(0);
            for (
              U[k >>> 5] |= 128 << (24 - (k % 32)),
                U[x] = 4294967295 & J,
                U[x - 1] = (J / 4294967296) | 0,
                V = 0;
              V < U.length;
              V += 16
            )
              j = $(U.slice(V, V + 16), j);
            return j;
          }
          var ie = (function (U) {
            function k(M, j, V) {
              var x = this;
              if (M !== 'SHA-1') throw new Error(f);
              var J = V || {};
              return (
                ((x = U.call(this, M, j, V) || this).g = !0),
                (x.F = x.Y),
                (x.C = -1),
                (x.p = e(x.t, x.i, x.C)),
                (x.R = $),
                (x.B = function (Q) {
                  return Q.slice();
                }),
                (x.L = Ce),
                (x.K = q),
                (x.m = [
                  1732584193, 4023233417, 2562383102, 271733878, 3285377520,
                ]),
                (x.S = 512),
                (x.U = 160),
                (x.T = !1),
                J.hmacKey && x.k(v('hmacKey', J.hmacKey, x.C)),
                x
              );
            }
            return (C(k, U), k);
          })(w);
          function Se(U) {
            return U == 'SHA-224' ? i.slice() : s.slice();
          }
          function Ee(U, k) {
            var M,
              j,
              V,
              x,
              J,
              Q,
              re,
              ce,
              Pe,
              S,
              me,
              ze,
              se = [];
            for (
              M = k[0],
                j = k[1],
                V = k[2],
                x = k[3],
                J = k[4],
                Q = k[5],
                re = k[6],
                ce = k[7],
                me = 0;
              me < 64;
              me += 1
            )
              ((se[me] =
                me < 16
                  ? U[me]
                  : K(
                      E((ze = se[me - 2]), 17) ^ E(ze, 19) ^ N(ze, 10),
                      se[me - 7],
                      ue(se[me - 15]),
                      se[me - 16],
                    )),
                (Pe = Y(ce, we(J), G(J, Q, re), n[me], se[me])),
                (S = F(W(M), te(M, j, V))),
                (ce = re),
                (re = Q),
                (Q = J),
                (J = F(x, Pe)),
                (x = V),
                (V = j),
                (j = M),
                (M = F(Pe, S)));
            return (
              (k[0] = F(M, k[0])),
              (k[1] = F(j, k[1])),
              (k[2] = F(V, k[2])),
              (k[3] = F(x, k[3])),
              (k[4] = F(J, k[4])),
              (k[5] = F(Q, k[5])),
              (k[6] = F(re, k[6])),
              (k[7] = F(ce, k[7])),
              k
            );
          }
          var He = (function (U) {
              function k(M, j, V) {
                var x = this;
                if (M !== 'SHA-224' && M !== 'SHA-256') throw new Error(f);
                var J = V || {};
                return (
                  ((x = U.call(this, M, j, V) || this).F = x.Y),
                  (x.g = !0),
                  (x.C = -1),
                  (x.p = e(x.t, x.i, x.C)),
                  (x.R = Ee),
                  (x.B = function (Q) {
                    return Q.slice();
                  }),
                  (x.L = Se),
                  (x.K = function (Q, re, ce, Pe) {
                    return (function (S, me, ze, se, fe) {
                      for (
                        var $e,
                          Ye = 15 + (((me + 65) >>> 9) << 4),
                          tt = me + ze;
                        S.length <= Ye;
                      )
                        S.push(0);
                      for (
                        S[me >>> 5] |= 128 << (24 - (me % 32)),
                          S[Ye] = 4294967295 & tt,
                          S[Ye - 1] = (tt / 4294967296) | 0,
                          $e = 0;
                        $e < S.length;
                        $e += 16
                      )
                        se = Ee(S.slice($e, $e + 16), se);
                      return fe === 'SHA-224'
                        ? [se[0], se[1], se[2], se[3], se[4], se[5], se[6]]
                        : se;
                    })(Q, re, ce, Pe, M);
                  }),
                  (x.m = Se(M)),
                  (x.S = 512),
                  (x.U = M === 'SHA-224' ? 224 : 256),
                  (x.T = !1),
                  J.hmacKey && x.k(v('hmacKey', J.hmacKey, x.C)),
                  x
                );
              }
              return (C(k, U), k);
            })(w),
            L = function (U, k) {
              ((this.N = U), (this.I = k));
            };
          function Be(U, k) {
            var M;
            return k > 32
              ? ((M = 64 - k),
                new L((U.I << k) | (U.N >>> M), (U.N << k) | (U.I >>> M)))
              : k !== 0
                ? ((M = 32 - k),
                  new L((U.N << k) | (U.I >>> M), (U.I << k) | (U.N >>> M)))
                : U;
          }
          function ge(U, k) {
            var M;
            return k < 32
              ? ((M = 32 - k),
                new L((U.N >>> k) | (U.I << M), (U.I >>> k) | (U.N << M)))
              : ((M = 64 - k),
                new L((U.I >>> k) | (U.N << M), (U.N >>> k) | (U.I << M)));
          }
          function ve(U, k) {
            return new L(U.N >>> k, (U.I >>> k) | (U.N << (32 - k)));
          }
          function xe(U, k, M) {
            return new L(
              (U.N & k.N) ^ (~U.N & M.N),
              (U.I & k.I) ^ (~U.I & M.I),
            );
          }
          function Re(U, k, M) {
            return new L(
              (U.N & k.N) ^ (U.N & M.N) ^ (k.N & M.N),
              (U.I & k.I) ^ (U.I & M.I) ^ (k.I & M.I),
            );
          }
          function _e(U) {
            var k = ge(U, 28),
              M = ge(U, 34),
              j = ge(U, 39);
            return new L(k.N ^ M.N ^ j.N, k.I ^ M.I ^ j.I);
          }
          function Oe(U, k) {
            var M, j;
            M = (65535 & U.I) + (65535 & k.I);
            var V =
              ((65535 & (j = (U.I >>> 16) + (k.I >>> 16) + (M >>> 16))) << 16) |
              (65535 & M);
            return (
              (M = (65535 & U.N) + (65535 & k.N) + (j >>> 16)),
              (j = (U.N >>> 16) + (k.N >>> 16) + (M >>> 16)),
              new L(((65535 & j) << 16) | (65535 & M), V)
            );
          }
          function De(U, k, M, j) {
            var V, x;
            V = (65535 & U.I) + (65535 & k.I) + (65535 & M.I) + (65535 & j.I);
            var J =
              ((65535 &
                (x =
                  (U.I >>> 16) +
                  (k.I >>> 16) +
                  (M.I >>> 16) +
                  (j.I >>> 16) +
                  (V >>> 16))) <<
                16) |
              (65535 & V);
            return (
              (V =
                (65535 & U.N) +
                (65535 & k.N) +
                (65535 & M.N) +
                (65535 & j.N) +
                (x >>> 16)),
              (x =
                (U.N >>> 16) +
                (k.N >>> 16) +
                (M.N >>> 16) +
                (j.N >>> 16) +
                (V >>> 16)),
              new L(((65535 & x) << 16) | (65535 & V), J)
            );
          }
          function Ze(U, k, M, j, V) {
            var x, J;
            x =
              (65535 & U.I) +
              (65535 & k.I) +
              (65535 & M.I) +
              (65535 & j.I) +
              (65535 & V.I);
            var Q =
              ((65535 &
                (J =
                  (U.I >>> 16) +
                  (k.I >>> 16) +
                  (M.I >>> 16) +
                  (j.I >>> 16) +
                  (V.I >>> 16) +
                  (x >>> 16))) <<
                16) |
              (65535 & x);
            return (
              (x =
                (65535 & U.N) +
                (65535 & k.N) +
                (65535 & M.N) +
                (65535 & j.N) +
                (65535 & V.N) +
                (J >>> 16)),
              (J =
                (U.N >>> 16) +
                (k.N >>> 16) +
                (M.N >>> 16) +
                (j.N >>> 16) +
                (V.N >>> 16) +
                (x >>> 16)),
              new L(((65535 & J) << 16) | (65535 & x), Q)
            );
          }
          function Ke(U, k) {
            return new L(U.N ^ k.N, U.I ^ k.I);
          }
          function g(U) {
            var k = ge(U, 1),
              M = ge(U, 8),
              j = ve(U, 7);
            return new L(k.N ^ M.N ^ j.N, k.I ^ M.I ^ j.I);
          }
          function pe(U) {
            var k = ge(U, 14),
              M = ge(U, 18),
              j = ge(U, 41);
            return new L(k.N ^ M.N ^ j.N, k.I ^ M.I ^ j.I);
          }
          var ne = [
            new L(n[0], 3609767458),
            new L(n[1], 602891725),
            new L(n[2], 3964484399),
            new L(n[3], 2173295548),
            new L(n[4], 4081628472),
            new L(n[5], 3053834265),
            new L(n[6], 2937671579),
            new L(n[7], 3664609560),
            new L(n[8], 2734883394),
            new L(n[9], 1164996542),
            new L(n[10], 1323610764),
            new L(n[11], 3590304994),
            new L(n[12], 4068182383),
            new L(n[13], 991336113),
            new L(n[14], 633803317),
            new L(n[15], 3479774868),
            new L(n[16], 2666613458),
            new L(n[17], 944711139),
            new L(n[18], 2341262773),
            new L(n[19], 2007800933),
            new L(n[20], 1495990901),
            new L(n[21], 1856431235),
            new L(n[22], 3175218132),
            new L(n[23], 2198950837),
            new L(n[24], 3999719339),
            new L(n[25], 766784016),
            new L(n[26], 2566594879),
            new L(n[27], 3203337956),
            new L(n[28], 1034457026),
            new L(n[29], 2466948901),
            new L(n[30], 3758326383),
            new L(n[31], 168717936),
            new L(n[32], 1188179964),
            new L(n[33], 1546045734),
            new L(n[34], 1522805485),
            new L(n[35], 2643833823),
            new L(n[36], 2343527390),
            new L(n[37], 1014477480),
            new L(n[38], 1206759142),
            new L(n[39], 344077627),
            new L(n[40], 1290863460),
            new L(n[41], 3158454273),
            new L(n[42], 3505952657),
            new L(n[43], 106217008),
            new L(n[44], 3606008344),
            new L(n[45], 1432725776),
            new L(n[46], 1467031594),
            new L(n[47], 851169720),
            new L(n[48], 3100823752),
            new L(n[49], 1363258195),
            new L(n[50], 3750685593),
            new L(n[51], 3785050280),
            new L(n[52], 3318307427),
            new L(n[53], 3812723403),
            new L(n[54], 2003034995),
            new L(n[55], 3602036899),
            new L(n[56], 1575990012),
            new L(n[57], 1125592928),
            new L(n[58], 2716904306),
            new L(n[59], 442776044),
            new L(n[60], 593698344),
            new L(n[61], 3733110249),
            new L(n[62], 2999351573),
            new L(n[63], 3815920427),
            new L(3391569614, 3928383900),
            new L(3515267271, 566280711),
            new L(3940187606, 3454069534),
            new L(4118630271, 4000239992),
            new L(116418474, 1914138554),
            new L(174292421, 2731055270),
            new L(289380356, 3203993006),
            new L(460393269, 320620315),
            new L(685471733, 587496836),
            new L(852142971, 1086792851),
            new L(1017036298, 365543100),
            new L(1126000580, 2618297676),
            new L(1288033470, 3409855158),
            new L(1501505948, 4234509866),
            new L(1607167915, 987167468),
            new L(1816402316, 1246189591),
          ];
          function be(U) {
            return U === 'SHA-384'
              ? [
                  new L(3418070365, i[0]),
                  new L(1654270250, i[1]),
                  new L(2438529370, i[2]),
                  new L(355462360, i[3]),
                  new L(1731405415, i[4]),
                  new L(41048885895, i[5]),
                  new L(3675008525, i[6]),
                  new L(1203062813, i[7]),
                ]
              : [
                  new L(s[0], 4089235720),
                  new L(s[1], 2227873595),
                  new L(s[2], 4271175723),
                  new L(s[3], 1595750129),
                  new L(s[4], 2917565137),
                  new L(s[5], 725511199),
                  new L(s[6], 4215389547),
                  new L(s[7], 327033209),
                ];
          }
          function ke(U, k) {
            var M,
              j,
              V,
              x,
              J,
              Q,
              re,
              ce,
              Pe,
              S,
              me,
              ze,
              se,
              fe,
              $e,
              Ye,
              tt = [];
            for (
              M = k[0],
                j = k[1],
                V = k[2],
                x = k[3],
                J = k[4],
                Q = k[5],
                re = k[6],
                ce = k[7],
                me = 0;
              me < 80;
              me += 1
            )
              (me < 16
                ? ((ze = 2 * me), (tt[me] = new L(U[ze], U[ze + 1])))
                : (tt[me] = De(
                    ((se = tt[me - 2]),
                    (fe = void 0),
                    ($e = void 0),
                    (Ye = void 0),
                    (fe = ge(se, 19)),
                    ($e = ge(se, 61)),
                    (Ye = ve(se, 6)),
                    new L(fe.N ^ $e.N ^ Ye.N, fe.I ^ $e.I ^ Ye.I)),
                    tt[me - 7],
                    g(tt[me - 15]),
                    tt[me - 16],
                  )),
                (Pe = Ze(ce, pe(J), xe(J, Q, re), ne[me], tt[me])),
                (S = Oe(_e(M), Re(M, j, V))),
                (ce = re),
                (re = Q),
                (Q = J),
                (J = Oe(x, Pe)),
                (x = V),
                (V = j),
                (j = M),
                (M = Oe(Pe, S)));
            return (
              (k[0] = Oe(M, k[0])),
              (k[1] = Oe(j, k[1])),
              (k[2] = Oe(V, k[2])),
              (k[3] = Oe(x, k[3])),
              (k[4] = Oe(J, k[4])),
              (k[5] = Oe(Q, k[5])),
              (k[6] = Oe(re, k[6])),
              (k[7] = Oe(ce, k[7])),
              k
            );
          }
          var Me = (function (U) {
              function k(M, j, V) {
                var x = this;
                if (M !== 'SHA-384' && M !== 'SHA-512') throw new Error(f);
                var J = V || {};
                return (
                  ((x = U.call(this, M, j, V) || this).F = x.Y),
                  (x.g = !0),
                  (x.C = -1),
                  (x.p = e(x.t, x.i, x.C)),
                  (x.R = ke),
                  (x.B = function (Q) {
                    return Q.slice();
                  }),
                  (x.L = be),
                  (x.K = function (Q, re, ce, Pe) {
                    return (function (S, me, ze, se, fe) {
                      for (
                        var $e,
                          Ye = 31 + (((me + 129) >>> 10) << 5),
                          tt = me + ze;
                        S.length <= Ye;
                      )
                        S.push(0);
                      for (
                        S[me >>> 5] |= 128 << (24 - (me % 32)),
                          S[Ye] = 4294967295 & tt,
                          S[Ye - 1] = (tt / 4294967296) | 0,
                          $e = 0;
                        $e < S.length;
                        $e += 32
                      )
                        se = ke(S.slice($e, $e + 32), se);
                      return fe === 'SHA-384'
                        ? [
                            (se = se)[0].N,
                            se[0].I,
                            se[1].N,
                            se[1].I,
                            se[2].N,
                            se[2].I,
                            se[3].N,
                            se[3].I,
                            se[4].N,
                            se[4].I,
                            se[5].N,
                            se[5].I,
                          ]
                        : [
                            se[0].N,
                            se[0].I,
                            se[1].N,
                            se[1].I,
                            se[2].N,
                            se[2].I,
                            se[3].N,
                            se[3].I,
                            se[4].N,
                            se[4].I,
                            se[5].N,
                            se[5].I,
                            se[6].N,
                            se[6].I,
                            se[7].N,
                            se[7].I,
                          ];
                    })(Q, re, ce, Pe, M);
                  }),
                  (x.m = be(M)),
                  (x.S = 1024),
                  (x.U = M === 'SHA-384' ? 384 : 512),
                  (x.T = !1),
                  J.hmacKey && x.k(v('hmacKey', J.hmacKey, x.C)),
                  x
                );
              }
              return (C(k, U), k);
            })(w),
            qe = [
              new L(0, 1),
              new L(0, 32898),
              new L(2147483648, 32906),
              new L(2147483648, 2147516416),
              new L(0, 32907),
              new L(0, 2147483649),
              new L(2147483648, 2147516545),
              new L(2147483648, 32777),
              new L(0, 138),
              new L(0, 136),
              new L(0, 2147516425),
              new L(0, 2147483658),
              new L(0, 2147516555),
              new L(2147483648, 139),
              new L(2147483648, 32905),
              new L(2147483648, 32771),
              new L(2147483648, 32770),
              new L(2147483648, 128),
              new L(0, 32778),
              new L(2147483648, 2147483658),
              new L(2147483648, 2147516545),
              new L(2147483648, 32896),
              new L(0, 2147483649),
              new L(2147483648, 2147516424),
            ],
            je = [
              [0, 36, 3, 41, 18],
              [1, 44, 10, 45, 2],
              [62, 6, 43, 15, 61],
              [28, 55, 25, 21, 56],
              [27, 20, 39, 8, 14],
            ];
          function Ve(U) {
            var k,
              M = [];
            for (k = 0; k < 5; k += 1)
              M[k] = [
                new L(0, 0),
                new L(0, 0),
                new L(0, 0),
                new L(0, 0),
                new L(0, 0),
              ];
            return M;
          }
          function ot(U) {
            var k,
              M = [];
            for (k = 0; k < 5; k += 1) M[k] = U[k].slice();
            return M;
          }
          function lt(U, k) {
            var M,
              j,
              V,
              x,
              J,
              Q,
              re,
              ce,
              Pe,
              S = [],
              me = [];
            if (U !== null)
              for (j = 0; j < U.length; j += 2)
                k[(j >>> 1) % 5][((j >>> 1) / 5) | 0] = Ke(
                  k[(j >>> 1) % 5][((j >>> 1) / 5) | 0],
                  new L(U[j + 1], U[j]),
                );
            for (M = 0; M < 24; M += 1) {
              for (x = Ve(), j = 0; j < 5; j += 1)
                S[j] =
                  ((J = k[j][0]),
                  (Q = k[j][1]),
                  (re = k[j][2]),
                  (ce = k[j][3]),
                  (Pe = k[j][4]),
                  new L(
                    J.N ^ Q.N ^ re.N ^ ce.N ^ Pe.N,
                    J.I ^ Q.I ^ re.I ^ ce.I ^ Pe.I,
                  ));
              for (j = 0; j < 5; j += 1)
                me[j] = Ke(S[(j + 4) % 5], Be(S[(j + 1) % 5], 1));
              for (j = 0; j < 5; j += 1)
                for (V = 0; V < 5; V += 1) k[j][V] = Ke(k[j][V], me[j]);
              for (j = 0; j < 5; j += 1)
                for (V = 0; V < 5; V += 1)
                  x[V][(2 * j + 3 * V) % 5] = Be(k[j][V], je[j][V]);
              for (j = 0; j < 5; j += 1)
                for (V = 0; V < 5; V += 1)
                  k[j][V] = Ke(
                    x[j][V],
                    new L(
                      ~x[(j + 1) % 5][V].N & x[(j + 2) % 5][V].N,
                      ~x[(j + 1) % 5][V].I & x[(j + 2) % 5][V].I,
                    ),
                  );
              k[0][0] = Ke(k[0][0], qe[M]);
            }
            return k;
          }
          function st(U) {
            var k,
              M,
              j = 0,
              V = [0, 0],
              x = [4294967295 & U, (U / 4294967296) & 2097151];
            for (k = 6; k >= 0; k--)
              ((M = (x[k >> 2] >>> (8 * k)) & 255) === 0 && j === 0) ||
                ((V[(j + 1) >> 2] |= M << (8 * (j + 1))), (j += 1));
            return (
              (j = j !== 0 ? j : 1),
              (V[0] |= j),
              { value: j + 1 > 4 ? V : [V[0]], binLen: 8 + 8 * j }
            );
          }
          function ut(U) {
            return o(st(U.binLen), U);
          }
          function pt(U, k) {
            var M,
              j = st(k),
              V = k >>> 2,
              x = (V - ((j = o(j, U)).value.length % V)) % V;
            for (M = 0; M < x; M++) j.value.push(0);
            return j.value;
          }
          var kt = (function (U) {
            function k(M, j, V) {
              var x = this,
                J = 6,
                Q = 0,
                re = V || {};
              if ((x = U.call(this, M, j, V) || this).numRounds !== 1) {
                if (re.kmacKey || re.hmacKey)
                  throw new Error('Cannot set numRounds with MAC');
                if (x.o === 'CSHAKE128' || x.o === 'CSHAKE256')
                  throw new Error('Cannot set numRounds for CSHAKE variants');
              }
              switch (
                ((x.C = 1),
                (x.p = e(x.t, x.i, x.C)),
                (x.R = lt),
                (x.B = ot),
                (x.L = Ve),
                (x.m = Ve()),
                (x.T = !1),
                M)
              ) {
                case 'SHA3-224':
                  ((x.S = Q = 1152), (x.U = 224), (x.g = !0), (x.F = x.Y));
                  break;
                case 'SHA3-256':
                  ((x.S = Q = 1088), (x.U = 256), (x.g = !0), (x.F = x.Y));
                  break;
                case 'SHA3-384':
                  ((x.S = Q = 832), (x.U = 384), (x.g = !0), (x.F = x.Y));
                  break;
                case 'SHA3-512':
                  ((x.S = Q = 576), (x.U = 512), (x.g = !0), (x.F = x.Y));
                  break;
                case 'SHAKE128':
                  ((J = 31),
                    (x.S = Q = 1344),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = null));
                  break;
                case 'SHAKE256':
                  ((J = 31),
                    (x.S = Q = 1088),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = null));
                  break;
                case 'KMAC128':
                  ((J = 4),
                    (x.S = Q = 1344),
                    x.M(V),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = x.X));
                  break;
                case 'KMAC256':
                  ((J = 4),
                    (x.S = Q = 1088),
                    x.M(V),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = x.X));
                  break;
                case 'CSHAKE128':
                  ((x.S = Q = 1344),
                    (J = x.O(V)),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = null));
                  break;
                case 'CSHAKE256':
                  ((x.S = Q = 1088),
                    (J = x.O(V)),
                    (x.U = -1),
                    (x.T = !0),
                    (x.g = !1),
                    (x.F = null));
                  break;
                default:
                  throw new Error(f);
              }
              return (
                (x.K = function (ce, Pe, S, me, ze) {
                  return (function (se, fe, $e, Ye, tt, Ct, ht) {
                    var mt,
                      xt,
                      It = 0,
                      Dt = [],
                      ar = tt >>> 5,
                      yr = fe >>> 5;
                    for (mt = 0; mt < yr && fe >= tt; mt += ar)
                      ((Ye = lt(se.slice(mt, mt + ar), Ye)), (fe -= tt));
                    for (se = se.slice(mt), fe %= tt; se.length < ar;)
                      se.push(0);
                    for (
                      se[(mt = fe >>> 3) >> 2] ^= Ct << ((mt % 4) * 8),
                        se[ar - 1] ^= 2147483648,
                        Ye = lt(se, Ye);
                      32 * Dt.length < ht &&
                      ((xt = Ye[It % 5][(It / 5) | 0]),
                      Dt.push(xt.I),
                      !(32 * Dt.length >= ht));
                    )
                      (Dt.push(xt.N),
                        (64 * (It += 1)) % tt == 0 && (lt(null, Ye), (It = 0)));
                    return Dt;
                  })(ce, Pe, 0, me, Q, J, ze);
                }),
                re.hmacKey && x.k(v('hmacKey', re.hmacKey, x.C)),
                x
              );
            }
            return (
              C(k, U),
              (k.prototype.O = function (M, j) {
                var V = (function (re) {
                  var ce = re || {};
                  return {
                    funcName: v('funcName', ce.funcName, 1, {
                      value: [],
                      binLen: 0,
                    }),
                    customization: v('Customization', ce.customization, 1, {
                      value: [],
                      binLen: 0,
                    }),
                  };
                })(M || {});
                j && (V.funcName = j);
                var x = o(ut(V.funcName), ut(V.customization));
                if (V.customization.binLen !== 0 || V.funcName.binLen !== 0) {
                  for (
                    var J = pt(x, this.S >>> 3), Q = 0;
                    Q < J.length;
                    Q += this.S >>> 5
                  )
                    ((this.m = this.R(J.slice(Q, Q + (this.S >>> 5)), this.m)),
                      (this.v += this.S));
                  return 4;
                }
                return 31;
              }),
              (k.prototype.M = function (M) {
                var j = (function (J) {
                  var Q = J || {};
                  return {
                    kmacKey: v('kmacKey', Q.kmacKey, 1),
                    funcName: { value: [1128353099], binLen: 32 },
                    customization: v('Customization', Q.customization, 1, {
                      value: [],
                      binLen: 0,
                    }),
                  };
                })(M || {});
                this.O(M, j.funcName);
                for (
                  var V = pt(ut(j.kmacKey), this.S >>> 3), x = 0;
                  x < V.length;
                  x += this.S >>> 5
                )
                  ((this.m = this.R(V.slice(x, x + (this.S >>> 5)), this.m)),
                    (this.v += this.S));
                this.A = !0;
              }),
              (k.prototype.X = function (M) {
                var j = o(
                  { value: this.u.slice(), binLen: this.s },
                  (function (V) {
                    var x,
                      J,
                      Q = 0,
                      re = [0, 0],
                      ce = [4294967295 & V, (V / 4294967296) & 2097151];
                    for (x = 6; x >= 0; x--)
                      ((J = (ce[x >> 2] >>> (8 * x)) & 255) == 0 && Q === 0) ||
                        ((re[Q >> 2] |= J << (8 * Q)), (Q += 1));
                    return (
                      (re[(Q = Q !== 0 ? Q : 1) >> 2] |= Q << (8 * Q)),
                      { value: Q + 1 > 4 ? re : [re[0]], binLen: 8 + 8 * Q }
                    );
                  })(M.outputLen),
                );
                return this.K(
                  j.value,
                  j.binLen,
                  this.v,
                  this.B(this.m),
                  M.outputLen,
                );
              }),
              k
            );
          })(w);
          return (function () {
            function U(k, M, j) {
              if (k == 'SHA-1') this.j = new ie(k, M, j);
              else if (k == 'SHA-224' || k == 'SHA-256')
                this.j = new He(k, M, j);
              else if (k == 'SHA-384' || k == 'SHA-512')
                this.j = new Me(k, M, j);
              else {
                if (
                  k != 'SHA3-224' &&
                  k != 'SHA3-256' &&
                  k != 'SHA3-384' &&
                  k != 'SHA3-512' &&
                  k != 'SHAKE128' &&
                  k != 'SHAKE256' &&
                  k != 'CSHAKE128' &&
                  k != 'CSHAKE256' &&
                  k != 'KMAC128' &&
                  k != 'KMAC256'
                )
                  throw new Error(f);
                this.j = new kt(k, M, j);
              }
            }
            return (
              (U.prototype.update = function (k) {
                this.j.update(k);
              }),
              (U.prototype.getHash = function (k, M) {
                return this.j.getHash(k, M);
              }),
              (U.prototype.setHMACKey = function (k, M, j) {
                this.j.setHMACKey(k, M, j);
              }),
              (U.prototype.getHMAC = function (k, M) {
                return this.j.getHMAC(k, M);
              }),
              U
            );
          })();
        });
      })(Ci)),
    Ci.exports
  );
}
var Xi = {},
  Er = {},
  As;
function df() {
  if (As) return Er;
  ((As = 1),
    Object.defineProperty(Er, '__esModule', { value: !0 }),
    (Er.getSecureRandomWords = Er.getSecureRandomBytes = void 0));
  function t(u) {
    return Buffer.from(window.crypto.getRandomValues(new Uint8Array(u)));
  }
  Er.getSecureRandomBytes = t;
  function d(u) {
    return window.crypto.getRandomValues(new Uint16Array(u));
  }
  return ((Er.getSecureRandomWords = d), Er);
}
var ua = {},
  xs;
function ff() {
  if (xs) return ua;
  ((xs = 1),
    Object.defineProperty(ua, '__esModule', { value: !0 }),
    (ua.hmac_sha512 = void 0));
  async function t(d, u) {
    let a = typeof d == 'string' ? Buffer.from(d, 'utf-8') : d,
      e = typeof u == 'string' ? Buffer.from(u, 'utf-8') : u;
    const r = { name: 'HMAC', hash: 'SHA-512' },
      n = await window.crypto.subtle.importKey('raw', a, r, !1, ['sign']);
    return Buffer.from(await crypto.subtle.sign(r, n, e));
  }
  return ((ua.hmac_sha512 = t), ua);
}
var ca = {},
  Is;
function hf() {
  if (Is) return ca;
  ((Is = 1),
    Object.defineProperty(ca, '__esModule', { value: !0 }),
    (ca.pbkdf2_sha512 = void 0));
  async function t(d, u, a, e) {
    const r = typeof d == 'string' ? Buffer.from(d, 'utf-8') : d,
      n = typeof u == 'string' ? Buffer.from(u, 'utf-8') : u,
      i = await window.crypto.subtle.importKey(
        'raw',
        r,
        { name: 'PBKDF2' },
        !1,
        ['deriveBits'],
      ),
      s = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-512', salt: n, iterations: a },
        i,
        e * 8,
      );
    return Buffer.from(s);
  }
  return ((ca.pbkdf2_sha512 = t), ca);
}
var da = {},
  Es;
function gf() {
  if (Es) return da;
  ((Es = 1),
    Object.defineProperty(da, '__esModule', { value: !0 }),
    (da.sha256 = void 0));
  async function t(d) {
    return typeof d == 'string'
      ? Buffer.from(
          await crypto.subtle.digest('SHA-256', Buffer.from(d, 'utf-8')),
        )
      : Buffer.from(await crypto.subtle.digest('SHA-256', d));
  }
  return ((da.sha256 = t), da);
}
var fa = {},
  Ts;
function pf() {
  if (Ts) return fa;
  ((Ts = 1),
    Object.defineProperty(fa, '__esModule', { value: !0 }),
    (fa.sha512 = void 0));
  async function t(d) {
    return typeof d == 'string'
      ? Buffer.from(
          await crypto.subtle.digest('SHA-512', Buffer.from(d, 'utf-8')),
        )
      : Buffer.from(await crypto.subtle.digest('SHA-512', d));
  }
  return ((fa.sha512 = t), fa);
}
var Rs;
function ei() {
  return (
    Rs ||
      ((Rs = 1),
      (function (t) {
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.sha512 =
            t.sha256 =
            t.pbkdf2_sha512 =
            t.hmac_sha512 =
            t.getSecureRandomWords =
            t.getSecureRandomBytes =
              void 0));
        var d = df();
        (Object.defineProperty(t, 'getSecureRandomBytes', {
          enumerable: !0,
          get: function () {
            return d.getSecureRandomBytes;
          },
        }),
          Object.defineProperty(t, 'getSecureRandomWords', {
            enumerable: !0,
            get: function () {
              return d.getSecureRandomWords;
            },
          }));
        var u = ff();
        Object.defineProperty(t, 'hmac_sha512', {
          enumerable: !0,
          get: function () {
            return u.hmac_sha512;
          },
        });
        var a = hf();
        Object.defineProperty(t, 'pbkdf2_sha512', {
          enumerable: !0,
          get: function () {
            return a.pbkdf2_sha512;
          },
        });
        var e = gf();
        Object.defineProperty(t, 'sha256', {
          enumerable: !0,
          get: function () {
            return e.sha256;
          },
        });
        var r = pf();
        Object.defineProperty(t, 'sha512', {
          enumerable: !0,
          get: function () {
            return r.sha512;
          },
        });
      })(Xi)),
    Xi
  );
}
var Ms;
function mf() {
  if (Ms) return Et;
  Ms = 1;
  var t =
    (Et && Et.__importDefault) ||
    function (n) {
      return n && n.__esModule ? n : { default: n };
    };
  (Object.defineProperty(Et, '__esModule', { value: !0 }),
    (Et.sha256 = Et.sha256_fallback = Et.sha256_sync = void 0));
  const d = t(bo()),
    u = ei();
  function a(n) {
    let i;
    typeof n == 'string'
      ? (i = Buffer.from(n, 'utf-8').toString('hex'))
      : (i = n.toString('hex'));
    let s = new d.default('SHA-256', 'HEX');
    s.update(i);
    let f = s.getHash('HEX');
    return Buffer.from(f, 'hex');
  }
  Et.sha256_sync = a;
  async function e(n) {
    return a(n);
  }
  Et.sha256_fallback = e;
  function r(n) {
    return (0, u.sha256)(n);
  }
  return ((Et.sha256 = r), Et);
}
var Tt = {},
  Os;
function yf() {
  if (Os) return Tt;
  Os = 1;
  var t =
    (Tt && Tt.__importDefault) ||
    function (n) {
      return n && n.__esModule ? n : { default: n };
    };
  (Object.defineProperty(Tt, '__esModule', { value: !0 }),
    (Tt.sha512 = Tt.sha512_fallback = Tt.sha512_sync = void 0));
  const d = t(bo()),
    u = ei();
  function a(n) {
    let i;
    typeof n == 'string'
      ? (i = Buffer.from(n, 'utf-8').toString('hex'))
      : (i = n.toString('hex'));
    let s = new d.default('SHA-512', 'HEX');
    s.update(i);
    let f = s.getHash('HEX');
    return Buffer.from(f, 'hex');
  }
  Tt.sha512_sync = a;
  async function e(n) {
    return a(n);
  }
  Tt.sha512_fallback = e;
  async function r(n) {
    return (0, u.sha512)(n);
  }
  return ((Tt.sha512 = r), Tt);
}
var ha = {},
  Us;
function cc() {
  if (Us) return ha;
  ((Us = 1),
    Object.defineProperty(ha, '__esModule', { value: !0 }),
    (ha.pbkdf2_sha512 = void 0));
  const t = ei();
  function d(u, a, e, r) {
    return (0, t.pbkdf2_sha512)(u, a, e, r);
  }
  return ((ha.pbkdf2_sha512 = d), ha);
}
var Ft = {},
  js;
function ti() {
  if (js) return Ft;
  js = 1;
  var t =
    (Ft && Ft.__importDefault) ||
    function (r) {
      return r && r.__esModule ? r : { default: r };
    };
  (Object.defineProperty(Ft, '__esModule', { value: !0 }),
    (Ft.hmac_sha512 = Ft.hmac_sha512_fallback = void 0));
  const d = t(bo()),
    u = ei();
  async function a(r, n) {
    let i = typeof r == 'string' ? Buffer.from(r, 'utf-8') : r,
      s = typeof n == 'string' ? Buffer.from(n, 'utf-8') : n;
    const f = new d.default('SHA-512', 'HEX', {
      hmacKey: { value: i.toString('hex'), format: 'HEX' },
    });
    f.update(s.toString('hex'));
    const o = f.getHash('HEX');
    return Buffer.from(o, 'hex');
  }
  Ft.hmac_sha512_fallback = a;
  function e(r, n) {
    return (0, u.hmac_sha512)(r, n);
  }
  return ((Ft.hmac_sha512 = e), Ft);
}
var Zt = {},
  zs;
function wo() {
  if (zs) return Zt;
  ((zs = 1),
    Object.defineProperty(Zt, '__esModule', { value: !0 }),
    (Zt.getSecureRandomNumber =
      Zt.getSecureRandomWords =
      Zt.getSecureRandomBytes =
        void 0));
  const t = ei();
  async function d(e) {
    return (0, t.getSecureRandomBytes)(e);
  }
  Zt.getSecureRandomBytes = d;
  async function u(e) {
    return u();
  }
  Zt.getSecureRandomWords = u;
  async function a(e, r) {
    let n = r - e;
    var i = Math.ceil(Math.log2(n));
    if (i > 53) throw new Error('Range is too large');
    for (var s = Math.ceil(i / 8), f = Math.pow(2, i) - 1; ;) {
      let y = await d(i),
        v = (s - 1) * 8,
        w = 0;
      for (var o = 0; o < s; o++) ((w += y[o] * Math.pow(2, v)), (v -= 8));
      if (((w = w & f), !(w >= n))) return e + w;
    }
  }
  return ((Zt.getSecureRandomNumber = a), Zt);
}
var ga = {},
  pa = {},
  Ds;
function bf() {
  return (
    Ds ||
      ((Ds = 1),
      Object.defineProperty(pa, '__esModule', { value: !0 }),
      (pa.wordlist = void 0),
      (pa.wordlist = [
        'abacus',
        'abdomen',
        'abdominal',
        'abide',
        'abiding',
        'ability',
        'ablaze',
        'able',
        'abnormal',
        'abrasion',
        'abrasive',
        'abreast',
        'abridge',
        'abroad',
        'abruptly',
        'absence',
        'absentee',
        'absently',
        'absinthe',
        'absolute',
        'absolve',
        'abstain',
        'abstract',
        'absurd',
        'accent',
        'acclaim',
        'acclimate',
        'accompany',
        'account',
        'accuracy',
        'accurate',
        'accustom',
        'acetone',
        'achiness',
        'aching',
        'acid',
        'acorn',
        'acquaint',
        'acquire',
        'acre',
        'acrobat',
        'acronym',
        'acting',
        'action',
        'activate',
        'activator',
        'active',
        'activism',
        'activist',
        'activity',
        'actress',
        'acts',
        'acutely',
        'acuteness',
        'aeration',
        'aerobics',
        'aerosol',
        'aerospace',
        'afar',
        'affair',
        'affected',
        'affecting',
        'affection',
        'affidavit',
        'affiliate',
        'affirm',
        'affix',
        'afflicted',
        'affluent',
        'afford',
        'affront',
        'aflame',
        'afloat',
        'aflutter',
        'afoot',
        'afraid',
        'afterglow',
        'afterlife',
        'aftermath',
        'aftermost',
        'afternoon',
        'aged',
        'ageless',
        'agency',
        'agenda',
        'agent',
        'aggregate',
        'aghast',
        'agile',
        'agility',
        'aging',
        'agnostic',
        'agonize',
        'agonizing',
        'agony',
        'agreeable',
        'agreeably',
        'agreed',
        'agreeing',
        'agreement',
        'aground',
        'ahead',
        'ahoy',
        'aide',
        'aids',
        'aim',
        'ajar',
        'alabaster',
        'alarm',
        'albatross',
        'album',
        'alfalfa',
        'algebra',
        'algorithm',
        'alias',
        'alibi',
        'alienable',
        'alienate',
        'aliens',
        'alike',
        'alive',
        'alkaline',
        'alkalize',
        'almanac',
        'almighty',
        'almost',
        'aloe',
        'aloft',
        'aloha',
        'alone',
        'alongside',
        'aloof',
        'alphabet',
        'alright',
        'although',
        'altitude',
        'alto',
        'aluminum',
        'alumni',
        'always',
        'amaretto',
        'amaze',
        'amazingly',
        'amber',
        'ambiance',
        'ambiguity',
        'ambiguous',
        'ambition',
        'ambitious',
        'ambulance',
        'ambush',
        'amendable',
        'amendment',
        'amends',
        'amenity',
        'amiable',
        'amicably',
        'amid',
        'amigo',
        'amino',
        'amiss',
        'ammonia',
        'ammonium',
        'amnesty',
        'amniotic',
        'among',
        'amount',
        'amperage',
        'ample',
        'amplifier',
        'amplify',
        'amply',
        'amuck',
        'amulet',
        'amusable',
        'amused',
        'amusement',
        'amuser',
        'amusing',
        'anaconda',
        'anaerobic',
        'anagram',
        'anatomist',
        'anatomy',
        'anchor',
        'anchovy',
        'ancient',
        'android',
        'anemia',
        'anemic',
        'aneurism',
        'anew',
        'angelfish',
        'angelic',
        'anger',
        'angled',
        'angler',
        'angles',
        'angling',
        'angrily',
        'angriness',
        'anguished',
        'angular',
        'animal',
        'animate',
        'animating',
        'animation',
        'animator',
        'anime',
        'animosity',
        'ankle',
        'annex',
        'annotate',
        'announcer',
        'annoying',
        'annually',
        'annuity',
        'anointer',
        'another',
        'answering',
        'antacid',
        'antarctic',
        'anteater',
        'antelope',
        'antennae',
        'anthem',
        'anthill',
        'anthology',
        'antibody',
        'antics',
        'antidote',
        'antihero',
        'antiquely',
        'antiques',
        'antiquity',
        'antirust',
        'antitoxic',
        'antitrust',
        'antiviral',
        'antivirus',
        'antler',
        'antonym',
        'antsy',
        'anvil',
        'anybody',
        'anyhow',
        'anymore',
        'anyone',
        'anyplace',
        'anything',
        'anytime',
        'anyway',
        'anywhere',
        'aorta',
        'apache',
        'apostle',
        'appealing',
        'appear',
        'appease',
        'appeasing',
        'appendage',
        'appendix',
        'appetite',
        'appetizer',
        'applaud',
        'applause',
        'apple',
        'appliance',
        'applicant',
        'applied',
        'apply',
        'appointee',
        'appraisal',
        'appraiser',
        'apprehend',
        'approach',
        'approval',
        'approve',
        'apricot',
        'april',
        'apron',
        'aptitude',
        'aptly',
        'aqua',
        'aqueduct',
        'arbitrary',
        'arbitrate',
        'ardently',
        'area',
        'arena',
        'arguable',
        'arguably',
        'argue',
        'arise',
        'armadillo',
        'armband',
        'armchair',
        'armed',
        'armful',
        'armhole',
        'arming',
        'armless',
        'armoire',
        'armored',
        'armory',
        'armrest',
        'army',
        'aroma',
        'arose',
        'around',
        'arousal',
        'arrange',
        'array',
        'arrest',
        'arrival',
        'arrive',
        'arrogance',
        'arrogant',
        'arson',
        'art',
        'ascend',
        'ascension',
        'ascent',
        'ascertain',
        'ashamed',
        'ashen',
        'ashes',
        'ashy',
        'aside',
        'askew',
        'asleep',
        'asparagus',
        'aspect',
        'aspirate',
        'aspire',
        'aspirin',
        'astonish',
        'astound',
        'astride',
        'astrology',
        'astronaut',
        'astronomy',
        'astute',
        'atlantic',
        'atlas',
        'atom',
        'atonable',
        'atop',
        'atrium',
        'atrocious',
        'atrophy',
        'attach',
        'attain',
        'attempt',
        'attendant',
        'attendee',
        'attention',
        'attentive',
        'attest',
        'attic',
        'attire',
        'attitude',
        'attractor',
        'attribute',
        'atypical',
        'auction',
        'audacious',
        'audacity',
        'audible',
        'audibly',
        'audience',
        'audio',
        'audition',
        'augmented',
        'august',
        'authentic',
        'author',
        'autism',
        'autistic',
        'autograph',
        'automaker',
        'automated',
        'automatic',
        'autopilot',
        'available',
        'avalanche',
        'avatar',
        'avenge',
        'avenging',
        'avenue',
        'average',
        'aversion',
        'avert',
        'aviation',
        'aviator',
        'avid',
        'avoid',
        'await',
        'awaken',
        'award',
        'aware',
        'awhile',
        'awkward',
        'awning',
        'awoke',
        'awry',
        'axis',
        'babble',
        'babbling',
        'babied',
        'baboon',
        'backache',
        'backboard',
        'backboned',
        'backdrop',
        'backed',
        'backer',
        'backfield',
        'backfire',
        'backhand',
        'backing',
        'backlands',
        'backlash',
        'backless',
        'backlight',
        'backlit',
        'backlog',
        'backpack',
        'backpedal',
        'backrest',
        'backroom',
        'backshift',
        'backside',
        'backslid',
        'backspace',
        'backspin',
        'backstab',
        'backstage',
        'backtalk',
        'backtrack',
        'backup',
        'backward',
        'backwash',
        'backwater',
        'backyard',
        'bacon',
        'bacteria',
        'bacterium',
        'badass',
        'badge',
        'badland',
        'badly',
        'badness',
        'baffle',
        'baffling',
        'bagel',
        'bagful',
        'baggage',
        'bagged',
        'baggie',
        'bagginess',
        'bagging',
        'baggy',
        'bagpipe',
        'baguette',
        'baked',
        'bakery',
        'bakeshop',
        'baking',
        'balance',
        'balancing',
        'balcony',
        'balmy',
        'balsamic',
        'bamboo',
        'banana',
        'banish',
        'banister',
        'banjo',
        'bankable',
        'bankbook',
        'banked',
        'banker',
        'banking',
        'banknote',
        'bankroll',
        'banner',
        'bannister',
        'banshee',
        'banter',
        'barbecue',
        'barbed',
        'barbell',
        'barber',
        'barcode',
        'barge',
        'bargraph',
        'barista',
        'baritone',
        'barley',
        'barmaid',
        'barman',
        'barn',
        'barometer',
        'barrack',
        'barracuda',
        'barrel',
        'barrette',
        'barricade',
        'barrier',
        'barstool',
        'bartender',
        'barterer',
        'bash',
        'basically',
        'basics',
        'basil',
        'basin',
        'basis',
        'basket',
        'batboy',
        'batch',
        'bath',
        'baton',
        'bats',
        'battalion',
        'battered',
        'battering',
        'battery',
        'batting',
        'battle',
        'bauble',
        'bazooka',
        'blabber',
        'bladder',
        'blade',
        'blah',
        'blame',
        'blaming',
        'blanching',
        'blandness',
        'blank',
        'blaspheme',
        'blasphemy',
        'blast',
        'blatancy',
        'blatantly',
        'blazer',
        'blazing',
        'bleach',
        'bleak',
        'bleep',
        'blemish',
        'blend',
        'bless',
        'blighted',
        'blimp',
        'bling',
        'blinked',
        'blinker',
        'blinking',
        'blinks',
        'blip',
        'blissful',
        'blitz',
        'blizzard',
        'bloated',
        'bloating',
        'blob',
        'blog',
        'bloomers',
        'blooming',
        'blooper',
        'blot',
        'blouse',
        'blubber',
        'bluff',
        'bluish',
        'blunderer',
        'blunt',
        'blurb',
        'blurred',
        'blurry',
        'blurt',
        'blush',
        'blustery',
        'boaster',
        'boastful',
        'boasting',
        'boat',
        'bobbed',
        'bobbing',
        'bobble',
        'bobcat',
        'bobsled',
        'bobtail',
        'bodacious',
        'body',
        'bogged',
        'boggle',
        'bogus',
        'boil',
        'bok',
        'bolster',
        'bolt',
        'bonanza',
        'bonded',
        'bonding',
        'bondless',
        'boned',
        'bonehead',
        'boneless',
        'bonelike',
        'boney',
        'bonfire',
        'bonnet',
        'bonsai',
        'bonus',
        'bony',
        'boogeyman',
        'boogieman',
        'book',
        'boondocks',
        'booted',
        'booth',
        'bootie',
        'booting',
        'bootlace',
        'bootleg',
        'boots',
        'boozy',
        'borax',
        'boring',
        'borough',
        'borrower',
        'borrowing',
        'boss',
        'botanical',
        'botanist',
        'botany',
        'botch',
        'both',
        'bottle',
        'bottling',
        'bottom',
        'bounce',
        'bouncing',
        'bouncy',
        'bounding',
        'boundless',
        'bountiful',
        'bovine',
        'boxcar',
        'boxer',
        'boxing',
        'boxlike',
        'boxy',
        'breach',
        'breath',
        'breeches',
        'breeching',
        'breeder',
        'breeding',
        'breeze',
        'breezy',
        'brethren',
        'brewery',
        'brewing',
        'briar',
        'bribe',
        'brick',
        'bride',
        'bridged',
        'brigade',
        'bright',
        'brilliant',
        'brim',
        'bring',
        'brink',
        'brisket',
        'briskly',
        'briskness',
        'bristle',
        'brittle',
        'broadband',
        'broadcast',
        'broaden',
        'broadly',
        'broadness',
        'broadside',
        'broadways',
        'broiler',
        'broiling',
        'broken',
        'broker',
        'bronchial',
        'bronco',
        'bronze',
        'bronzing',
        'brook',
        'broom',
        'brought',
        'browbeat',
        'brownnose',
        'browse',
        'browsing',
        'bruising',
        'brunch',
        'brunette',
        'brunt',
        'brush',
        'brussels',
        'brute',
        'brutishly',
        'bubble',
        'bubbling',
        'bubbly',
        'buccaneer',
        'bucked',
        'bucket',
        'buckle',
        'buckshot',
        'buckskin',
        'bucktooth',
        'buckwheat',
        'buddhism',
        'buddhist',
        'budding',
        'buddy',
        'budget',
        'buffalo',
        'buffed',
        'buffer',
        'buffing',
        'buffoon',
        'buggy',
        'bulb',
        'bulge',
        'bulginess',
        'bulgur',
        'bulk',
        'bulldog',
        'bulldozer',
        'bullfight',
        'bullfrog',
        'bullhorn',
        'bullion',
        'bullish',
        'bullpen',
        'bullring',
        'bullseye',
        'bullwhip',
        'bully',
        'bunch',
        'bundle',
        'bungee',
        'bunion',
        'bunkbed',
        'bunkhouse',
        'bunkmate',
        'bunny',
        'bunt',
        'busboy',
        'bush',
        'busily',
        'busload',
        'bust',
        'busybody',
        'buzz',
        'cabana',
        'cabbage',
        'cabbie',
        'cabdriver',
        'cable',
        'caboose',
        'cache',
        'cackle',
        'cacti',
        'cactus',
        'caddie',
        'caddy',
        'cadet',
        'cadillac',
        'cadmium',
        'cage',
        'cahoots',
        'cake',
        'calamari',
        'calamity',
        'calcium',
        'calculate',
        'calculus',
        'caliber',
        'calibrate',
        'calm',
        'caloric',
        'calorie',
        'calzone',
        'camcorder',
        'cameo',
        'camera',
        'camisole',
        'camper',
        'campfire',
        'camping',
        'campsite',
        'campus',
        'canal',
        'canary',
        'cancel',
        'candied',
        'candle',
        'candy',
        'cane',
        'canine',
        'canister',
        'cannabis',
        'canned',
        'canning',
        'cannon',
        'cannot',
        'canola',
        'canon',
        'canopener',
        'canopy',
        'canteen',
        'canyon',
        'capable',
        'capably',
        'capacity',
        'cape',
        'capillary',
        'capital',
        'capitol',
        'capped',
        'capricorn',
        'capsize',
        'capsule',
        'caption',
        'captivate',
        'captive',
        'captivity',
        'capture',
        'caramel',
        'carat',
        'caravan',
        'carbon',
        'cardboard',
        'carded',
        'cardiac',
        'cardigan',
        'cardinal',
        'cardstock',
        'carefully',
        'caregiver',
        'careless',
        'caress',
        'caretaker',
        'cargo',
        'caring',
        'carless',
        'carload',
        'carmaker',
        'carnage',
        'carnation',
        'carnival',
        'carnivore',
        'carol',
        'carpenter',
        'carpentry',
        'carpool',
        'carport',
        'carried',
        'carrot',
        'carrousel',
        'carry',
        'cartel',
        'cartload',
        'carton',
        'cartoon',
        'cartridge',
        'cartwheel',
        'carve',
        'carving',
        'carwash',
        'cascade',
        'case',
        'cash',
        'casing',
        'casino',
        'casket',
        'cassette',
        'casually',
        'casualty',
        'catacomb',
        'catalog',
        'catalyst',
        'catalyze',
        'catapult',
        'cataract',
        'catatonic',
        'catcall',
        'catchable',
        'catcher',
        'catching',
        'catchy',
        'caterer',
        'catering',
        'catfight',
        'catfish',
        'cathedral',
        'cathouse',
        'catlike',
        'catnap',
        'catnip',
        'catsup',
        'cattail',
        'cattishly',
        'cattle',
        'catty',
        'catwalk',
        'caucasian',
        'caucus',
        'causal',
        'causation',
        'cause',
        'causing',
        'cauterize',
        'caution',
        'cautious',
        'cavalier',
        'cavalry',
        'caviar',
        'cavity',
        'cedar',
        'celery',
        'celestial',
        'celibacy',
        'celibate',
        'celtic',
        'cement',
        'census',
        'ceramics',
        'ceremony',
        'certainly',
        'certainty',
        'certified',
        'certify',
        'cesarean',
        'cesspool',
        'chafe',
        'chaffing',
        'chain',
        'chair',
        'chalice',
        'challenge',
        'chamber',
        'chamomile',
        'champion',
        'chance',
        'change',
        'channel',
        'chant',
        'chaos',
        'chaperone',
        'chaplain',
        'chapped',
        'chaps',
        'chapter',
        'character',
        'charbroil',
        'charcoal',
        'charger',
        'charging',
        'chariot',
        'charity',
        'charm',
        'charred',
        'charter',
        'charting',
        'chase',
        'chasing',
        'chaste',
        'chastise',
        'chastity',
        'chatroom',
        'chatter',
        'chatting',
        'chatty',
        'cheating',
        'cheddar',
        'cheek',
        'cheer',
        'cheese',
        'cheesy',
        'chef',
        'chemicals',
        'chemist',
        'chemo',
        'cherisher',
        'cherub',
        'chess',
        'chest',
        'chevron',
        'chevy',
        'chewable',
        'chewer',
        'chewing',
        'chewy',
        'chief',
        'chihuahua',
        'childcare',
        'childhood',
        'childish',
        'childless',
        'childlike',
        'chili',
        'chill',
        'chimp',
        'chip',
        'chirping',
        'chirpy',
        'chitchat',
        'chivalry',
        'chive',
        'chloride',
        'chlorine',
        'choice',
        'chokehold',
        'choking',
        'chomp',
        'chooser',
        'choosing',
        'choosy',
        'chop',
        'chosen',
        'chowder',
        'chowtime',
        'chrome',
        'chubby',
        'chuck',
        'chug',
        'chummy',
        'chump',
        'chunk',
        'churn',
        'chute',
        'cider',
        'cilantro',
        'cinch',
        'cinema',
        'cinnamon',
        'circle',
        'circling',
        'circular',
        'circulate',
        'circus',
        'citable',
        'citadel',
        'citation',
        'citizen',
        'citric',
        'citrus',
        'city',
        'civic',
        'civil',
        'clad',
        'claim',
        'clambake',
        'clammy',
        'clamor',
        'clamp',
        'clamshell',
        'clang',
        'clanking',
        'clapped',
        'clapper',
        'clapping',
        'clarify',
        'clarinet',
        'clarity',
        'clash',
        'clasp',
        'class',
        'clatter',
        'clause',
        'clavicle',
        'claw',
        'clay',
        'clean',
        'clear',
        'cleat',
        'cleaver',
        'cleft',
        'clench',
        'clergyman',
        'clerical',
        'clerk',
        'clever',
        'clicker',
        'client',
        'climate',
        'climatic',
        'cling',
        'clinic',
        'clinking',
        'clip',
        'clique',
        'cloak',
        'clobber',
        'clock',
        'clone',
        'cloning',
        'closable',
        'closure',
        'clothes',
        'clothing',
        'cloud',
        'clover',
        'clubbed',
        'clubbing',
        'clubhouse',
        'clump',
        'clumsily',
        'clumsy',
        'clunky',
        'clustered',
        'clutch',
        'clutter',
        'coach',
        'coagulant',
        'coastal',
        'coaster',
        'coasting',
        'coastland',
        'coastline',
        'coat',
        'coauthor',
        'cobalt',
        'cobbler',
        'cobweb',
        'cocoa',
        'coconut',
        'cod',
        'coeditor',
        'coerce',
        'coexist',
        'coffee',
        'cofounder',
        'cognition',
        'cognitive',
        'cogwheel',
        'coherence',
        'coherent',
        'cohesive',
        'coil',
        'coke',
        'cola',
        'cold',
        'coleslaw',
        'coliseum',
        'collage',
        'collapse',
        'collar',
        'collected',
        'collector',
        'collide',
        'collie',
        'collision',
        'colonial',
        'colonist',
        'colonize',
        'colony',
        'colossal',
        'colt',
        'coma',
        'come',
        'comfort',
        'comfy',
        'comic',
        'coming',
        'comma',
        'commence',
        'commend',
        'comment',
        'commerce',
        'commode',
        'commodity',
        'commodore',
        'common',
        'commotion',
        'commute',
        'commuting',
        'compacted',
        'compacter',
        'compactly',
        'compactor',
        'companion',
        'company',
        'compare',
        'compel',
        'compile',
        'comply',
        'component',
        'composed',
        'composer',
        'composite',
        'compost',
        'composure',
        'compound',
        'compress',
        'comprised',
        'computer',
        'computing',
        'comrade',
        'concave',
        'conceal',
        'conceded',
        'concept',
        'concerned',
        'concert',
        'conch',
        'concierge',
        'concise',
        'conclude',
        'concrete',
        'concur',
        'condense',
        'condiment',
        'condition',
        'condone',
        'conducive',
        'conductor',
        'conduit',
        'cone',
        'confess',
        'confetti',
        'confidant',
        'confident',
        'confider',
        'confiding',
        'configure',
        'confined',
        'confining',
        'confirm',
        'conflict',
        'conform',
        'confound',
        'confront',
        'confused',
        'confusing',
        'confusion',
        'congenial',
        'congested',
        'congrats',
        'congress',
        'conical',
        'conjoined',
        'conjure',
        'conjuror',
        'connected',
        'connector',
        'consensus',
        'consent',
        'console',
        'consoling',
        'consonant',
        'constable',
        'constant',
        'constrain',
        'constrict',
        'construct',
        'consult',
        'consumer',
        'consuming',
        'contact',
        'container',
        'contempt',
        'contend',
        'contented',
        'contently',
        'contents',
        'contest',
        'context',
        'contort',
        'contour',
        'contrite',
        'control',
        'contusion',
        'convene',
        'convent',
        'copartner',
        'cope',
        'copied',
        'copier',
        'copilot',
        'coping',
        'copious',
        'copper',
        'copy',
        'coral',
        'cork',
        'cornball',
        'cornbread',
        'corncob',
        'cornea',
        'corned',
        'corner',
        'cornfield',
        'cornflake',
        'cornhusk',
        'cornmeal',
        'cornstalk',
        'corny',
        'coronary',
        'coroner',
        'corporal',
        'corporate',
        'corral',
        'correct',
        'corridor',
        'corrode',
        'corroding',
        'corrosive',
        'corsage',
        'corset',
        'cortex',
        'cosigner',
        'cosmetics',
        'cosmic',
        'cosmos',
        'cosponsor',
        'cost',
        'cottage',
        'cotton',
        'couch',
        'cough',
        'could',
        'countable',
        'countdown',
        'counting',
        'countless',
        'country',
        'county',
        'courier',
        'covenant',
        'cover',
        'coveted',
        'coveting',
        'coyness',
        'cozily',
        'coziness',
        'cozy',
        'crabbing',
        'crabgrass',
        'crablike',
        'crabmeat',
        'cradle',
        'cradling',
        'crafter',
        'craftily',
        'craftsman',
        'craftwork',
        'crafty',
        'cramp',
        'cranberry',
        'crane',
        'cranial',
        'cranium',
        'crank',
        'crate',
        'crave',
        'craving',
        'crawfish',
        'crawlers',
        'crawling',
        'crayfish',
        'crayon',
        'crazed',
        'crazily',
        'craziness',
        'crazy',
        'creamed',
        'creamer',
        'creamlike',
        'crease',
        'creasing',
        'creatable',
        'create',
        'creation',
        'creative',
        'creature',
        'credible',
        'credibly',
        'credit',
        'creed',
        'creme',
        'creole',
        'crepe',
        'crept',
        'crescent',
        'crested',
        'cresting',
        'crestless',
        'crevice',
        'crewless',
        'crewman',
        'crewmate',
        'crib',
        'cricket',
        'cried',
        'crier',
        'crimp',
        'crimson',
        'cringe',
        'cringing',
        'crinkle',
        'crinkly',
        'crisped',
        'crisping',
        'crisply',
        'crispness',
        'crispy',
        'criteria',
        'critter',
        'croak',
        'crock',
        'crook',
        'croon',
        'crop',
        'cross',
        'crouch',
        'crouton',
        'crowbar',
        'crowd',
        'crown',
        'crucial',
        'crudely',
        'crudeness',
        'cruelly',
        'cruelness',
        'cruelty',
        'crumb',
        'crummiest',
        'crummy',
        'crumpet',
        'crumpled',
        'cruncher',
        'crunching',
        'crunchy',
        'crusader',
        'crushable',
        'crushed',
        'crusher',
        'crushing',
        'crust',
        'crux',
        'crying',
        'cryptic',
        'crystal',
        'cubbyhole',
        'cube',
        'cubical',
        'cubicle',
        'cucumber',
        'cuddle',
        'cuddly',
        'cufflink',
        'culinary',
        'culminate',
        'culpable',
        'culprit',
        'cultivate',
        'cultural',
        'culture',
        'cupbearer',
        'cupcake',
        'cupid',
        'cupped',
        'cupping',
        'curable',
        'curator',
        'curdle',
        'cure',
        'curfew',
        'curing',
        'curled',
        'curler',
        'curliness',
        'curling',
        'curly',
        'curry',
        'curse',
        'cursive',
        'cursor',
        'curtain',
        'curtly',
        'curtsy',
        'curvature',
        'curve',
        'curvy',
        'cushy',
        'cusp',
        'cussed',
        'custard',
        'custodian',
        'custody',
        'customary',
        'customer',
        'customize',
        'customs',
        'cut',
        'cycle',
        'cyclic',
        'cycling',
        'cyclist',
        'cylinder',
        'cymbal',
        'cytoplasm',
        'cytoplast',
        'dab',
        'dad',
        'daffodil',
        'dagger',
        'daily',
        'daintily',
        'dainty',
        'dairy',
        'daisy',
        'dallying',
        'dance',
        'dancing',
        'dandelion',
        'dander',
        'dandruff',
        'dandy',
        'danger',
        'dangle',
        'dangling',
        'daredevil',
        'dares',
        'daringly',
        'darkened',
        'darkening',
        'darkish',
        'darkness',
        'darkroom',
        'darling',
        'darn',
        'dart',
        'darwinism',
        'dash',
        'dastardly',
        'data',
        'datebook',
        'dating',
        'daughter',
        'daunting',
        'dawdler',
        'dawn',
        'daybed',
        'daybreak',
        'daycare',
        'daydream',
        'daylight',
        'daylong',
        'dayroom',
        'daytime',
        'dazzler',
        'dazzling',
        'deacon',
        'deafening',
        'deafness',
        'dealer',
        'dealing',
        'dealmaker',
        'dealt',
        'dean',
        'debatable',
        'debate',
        'debating',
        'debit',
        'debrief',
        'debtless',
        'debtor',
        'debug',
        'debunk',
        'decade',
        'decaf',
        'decal',
        'decathlon',
        'decay',
        'deceased',
        'deceit',
        'deceiver',
        'deceiving',
        'december',
        'decency',
        'decent',
        'deception',
        'deceptive',
        'decibel',
        'decidable',
        'decimal',
        'decimeter',
        'decipher',
        'deck',
        'declared',
        'decline',
        'decode',
        'decompose',
        'decorated',
        'decorator',
        'decoy',
        'decrease',
        'decree',
        'dedicate',
        'dedicator',
        'deduce',
        'deduct',
        'deed',
        'deem',
        'deepen',
        'deeply',
        'deepness',
        'deface',
        'defacing',
        'defame',
        'default',
        'defeat',
        'defection',
        'defective',
        'defendant',
        'defender',
        'defense',
        'defensive',
        'deferral',
        'deferred',
        'defiance',
        'defiant',
        'defile',
        'defiling',
        'define',
        'definite',
        'deflate',
        'deflation',
        'deflator',
        'deflected',
        'deflector',
        'defog',
        'deforest',
        'defraud',
        'defrost',
        'deftly',
        'defuse',
        'defy',
        'degraded',
        'degrading',
        'degrease',
        'degree',
        'dehydrate',
        'deity',
        'dejected',
        'delay',
        'delegate',
        'delegator',
        'delete',
        'deletion',
        'delicacy',
        'delicate',
        'delicious',
        'delighted',
        'delirious',
        'delirium',
        'deliverer',
        'delivery',
        'delouse',
        'delta',
        'deluge',
        'delusion',
        'deluxe',
        'demanding',
        'demeaning',
        'demeanor',
        'demise',
        'democracy',
        'democrat',
        'demote',
        'demotion',
        'demystify',
        'denatured',
        'deniable',
        'denial',
        'denim',
        'denote',
        'dense',
        'density',
        'dental',
        'dentist',
        'denture',
        'deny',
        'deodorant',
        'deodorize',
        'departed',
        'departure',
        'depict',
        'deplete',
        'depletion',
        'deplored',
        'deploy',
        'deport',
        'depose',
        'depraved',
        'depravity',
        'deprecate',
        'depress',
        'deprive',
        'depth',
        'deputize',
        'deputy',
        'derail',
        'deranged',
        'derby',
        'derived',
        'desecrate',
        'deserve',
        'deserving',
        'designate',
        'designed',
        'designer',
        'designing',
        'deskbound',
        'desktop',
        'deskwork',
        'desolate',
        'despair',
        'despise',
        'despite',
        'destiny',
        'destitute',
        'destruct',
        'detached',
        'detail',
        'detection',
        'detective',
        'detector',
        'detention',
        'detergent',
        'detest',
        'detonate',
        'detonator',
        'detoxify',
        'detract',
        'deuce',
        'devalue',
        'deviancy',
        'deviant',
        'deviate',
        'deviation',
        'deviator',
        'device',
        'devious',
        'devotedly',
        'devotee',
        'devotion',
        'devourer',
        'devouring',
        'devoutly',
        'dexterity',
        'dexterous',
        'diabetes',
        'diabetic',
        'diabolic',
        'diagnoses',
        'diagnosis',
        'diagram',
        'dial',
        'diameter',
        'diaper',
        'diaphragm',
        'diary',
        'dice',
        'dicing',
        'dictate',
        'dictation',
        'dictator',
        'difficult',
        'diffused',
        'diffuser',
        'diffusion',
        'diffusive',
        'dig',
        'dilation',
        'diligence',
        'diligent',
        'dill',
        'dilute',
        'dime',
        'diminish',
        'dimly',
        'dimmed',
        'dimmer',
        'dimness',
        'dimple',
        'diner',
        'dingbat',
        'dinghy',
        'dinginess',
        'dingo',
        'dingy',
        'dining',
        'dinner',
        'diocese',
        'dioxide',
        'diploma',
        'dipped',
        'dipper',
        'dipping',
        'directed',
        'direction',
        'directive',
        'directly',
        'directory',
        'direness',
        'dirtiness',
        'disabled',
        'disagree',
        'disallow',
        'disarm',
        'disarray',
        'disaster',
        'disband',
        'disbelief',
        'disburse',
        'discard',
        'discern',
        'discharge',
        'disclose',
        'discolor',
        'discount',
        'discourse',
        'discover',
        'discuss',
        'disdain',
        'disengage',
        'disfigure',
        'disgrace',
        'dish',
        'disinfect',
        'disjoin',
        'disk',
        'dislike',
        'disliking',
        'dislocate',
        'dislodge',
        'disloyal',
        'dismantle',
        'dismay',
        'dismiss',
        'dismount',
        'disobey',
        'disorder',
        'disown',
        'disparate',
        'disparity',
        'dispatch',
        'dispense',
        'dispersal',
        'dispersed',
        'disperser',
        'displace',
        'display',
        'displease',
        'disposal',
        'dispose',
        'disprove',
        'dispute',
        'disregard',
        'disrupt',
        'dissuade',
        'distance',
        'distant',
        'distaste',
        'distill',
        'distinct',
        'distort',
        'distract',
        'distress',
        'district',
        'distrust',
        'ditch',
        'ditto',
        'ditzy',
        'dividable',
        'divided',
        'dividend',
        'dividers',
        'dividing',
        'divinely',
        'diving',
        'divinity',
        'divisible',
        'divisibly',
        'division',
        'divisive',
        'divorcee',
        'dizziness',
        'dizzy',
        'doable',
        'docile',
        'dock',
        'doctrine',
        'document',
        'dodge',
        'dodgy',
        'doily',
        'doing',
        'dole',
        'dollar',
        'dollhouse',
        'dollop',
        'dolly',
        'dolphin',
        'domain',
        'domelike',
        'domestic',
        'dominion',
        'dominoes',
        'donated',
        'donation',
        'donator',
        'donor',
        'donut',
        'doodle',
        'doorbell',
        'doorframe',
        'doorknob',
        'doorman',
        'doormat',
        'doornail',
        'doorpost',
        'doorstep',
        'doorstop',
        'doorway',
        'doozy',
        'dork',
        'dormitory',
        'dorsal',
        'dosage',
        'dose',
        'dotted',
        'doubling',
        'douche',
        'dove',
        'down',
        'dowry',
        'doze',
        'drab',
        'dragging',
        'dragonfly',
        'dragonish',
        'dragster',
        'drainable',
        'drainage',
        'drained',
        'drainer',
        'drainpipe',
        'dramatic',
        'dramatize',
        'drank',
        'drapery',
        'drastic',
        'draw',
        'dreaded',
        'dreadful',
        'dreadlock',
        'dreamboat',
        'dreamily',
        'dreamland',
        'dreamless',
        'dreamlike',
        'dreamt',
        'dreamy',
        'drearily',
        'dreary',
        'drench',
        'dress',
        'drew',
        'dribble',
        'dried',
        'drier',
        'drift',
        'driller',
        'drilling',
        'drinkable',
        'drinking',
        'dripping',
        'drippy',
        'drivable',
        'driven',
        'driver',
        'driveway',
        'driving',
        'drizzle',
        'drizzly',
        'drone',
        'drool',
        'droop',
        'drop-down',
        'dropbox',
        'dropkick',
        'droplet',
        'dropout',
        'dropper',
        'drove',
        'drown',
        'drowsily',
        'drudge',
        'drum',
        'dry',
        'dubbed',
        'dubiously',
        'duchess',
        'duckbill',
        'ducking',
        'duckling',
        'ducktail',
        'ducky',
        'duct',
        'dude',
        'duffel',
        'dugout',
        'duh',
        'duke',
        'duller',
        'dullness',
        'duly',
        'dumping',
        'dumpling',
        'dumpster',
        'duo',
        'dupe',
        'duplex',
        'duplicate',
        'duplicity',
        'durable',
        'durably',
        'duration',
        'duress',
        'during',
        'dusk',
        'dust',
        'dutiful',
        'duty',
        'duvet',
        'dwarf',
        'dweeb',
        'dwelled',
        'dweller',
        'dwelling',
        'dwindle',
        'dwindling',
        'dynamic',
        'dynamite',
        'dynasty',
        'dyslexia',
        'dyslexic',
        'each',
        'eagle',
        'earache',
        'eardrum',
        'earflap',
        'earful',
        'earlobe',
        'early',
        'earmark',
        'earmuff',
        'earphone',
        'earpiece',
        'earplugs',
        'earring',
        'earshot',
        'earthen',
        'earthlike',
        'earthling',
        'earthly',
        'earthworm',
        'earthy',
        'earwig',
        'easeful',
        'easel',
        'easiest',
        'easily',
        'easiness',
        'easing',
        'eastbound',
        'eastcoast',
        'easter',
        'eastward',
        'eatable',
        'eaten',
        'eatery',
        'eating',
        'eats',
        'ebay',
        'ebony',
        'ebook',
        'ecard',
        'eccentric',
        'echo',
        'eclair',
        'eclipse',
        'ecologist',
        'ecology',
        'economic',
        'economist',
        'economy',
        'ecosphere',
        'ecosystem',
        'edge',
        'edginess',
        'edging',
        'edgy',
        'edition',
        'editor',
        'educated',
        'education',
        'educator',
        'eel',
        'effective',
        'effects',
        'efficient',
        'effort',
        'eggbeater',
        'egging',
        'eggnog',
        'eggplant',
        'eggshell',
        'egomaniac',
        'egotism',
        'egotistic',
        'either',
        'eject',
        'elaborate',
        'elastic',
        'elated',
        'elbow',
        'eldercare',
        'elderly',
        'eldest',
        'electable',
        'election',
        'elective',
        'elephant',
        'elevate',
        'elevating',
        'elevation',
        'elevator',
        'eleven',
        'elf',
        'eligible',
        'eligibly',
        'eliminate',
        'elite',
        'elitism',
        'elixir',
        'elk',
        'ellipse',
        'elliptic',
        'elm',
        'elongated',
        'elope',
        'eloquence',
        'eloquent',
        'elsewhere',
        'elude',
        'elusive',
        'elves',
        'email',
        'embargo',
        'embark',
        'embassy',
        'embattled',
        'embellish',
        'ember',
        'embezzle',
        'emblaze',
        'emblem',
        'embody',
        'embolism',
        'emboss',
        'embroider',
        'emcee',
        'emerald',
        'emergency',
        'emission',
        'emit',
        'emote',
        'emoticon',
        'emotion',
        'empathic',
        'empathy',
        'emperor',
        'emphases',
        'emphasis',
        'emphasize',
        'emphatic',
        'empirical',
        'employed',
        'employee',
        'employer',
        'emporium',
        'empower',
        'emptier',
        'emptiness',
        'empty',
        'emu',
        'enable',
        'enactment',
        'enamel',
        'enchanted',
        'enchilada',
        'encircle',
        'enclose',
        'enclosure',
        'encode',
        'encore',
        'encounter',
        'encourage',
        'encroach',
        'encrust',
        'encrypt',
        'endanger',
        'endeared',
        'endearing',
        'ended',
        'ending',
        'endless',
        'endnote',
        'endocrine',
        'endorphin',
        'endorse',
        'endowment',
        'endpoint',
        'endurable',
        'endurance',
        'enduring',
        'energetic',
        'energize',
        'energy',
        'enforced',
        'enforcer',
        'engaged',
        'engaging',
        'engine',
        'engorge',
        'engraved',
        'engraver',
        'engraving',
        'engross',
        'engulf',
        'enhance',
        'enigmatic',
        'enjoyable',
        'enjoyably',
        'enjoyer',
        'enjoying',
        'enjoyment',
        'enlarged',
        'enlarging',
        'enlighten',
        'enlisted',
        'enquirer',
        'enrage',
        'enrich',
        'enroll',
        'enslave',
        'ensnare',
        'ensure',
        'entail',
        'entangled',
        'entering',
        'entertain',
        'enticing',
        'entire',
        'entitle',
        'entity',
        'entomb',
        'entourage',
        'entrap',
        'entree',
        'entrench',
        'entrust',
        'entryway',
        'entwine',
        'enunciate',
        'envelope',
        'enviable',
        'enviably',
        'envious',
        'envision',
        'envoy',
        'envy',
        'enzyme',
        'epic',
        'epidemic',
        'epidermal',
        'epidermis',
        'epidural',
        'epilepsy',
        'epileptic',
        'epilogue',
        'epiphany',
        'episode',
        'equal',
        'equate',
        'equation',
        'equator',
        'equinox',
        'equipment',
        'equity',
        'equivocal',
        'eradicate',
        'erasable',
        'erased',
        'eraser',
        'erasure',
        'ergonomic',
        'errand',
        'errant',
        'erratic',
        'error',
        'erupt',
        'escalate',
        'escalator',
        'escapable',
        'escapade',
        'escapist',
        'escargot',
        'eskimo',
        'esophagus',
        'espionage',
        'espresso',
        'esquire',
        'essay',
        'essence',
        'essential',
        'establish',
        'estate',
        'esteemed',
        'estimate',
        'estimator',
        'estranged',
        'estrogen',
        'etching',
        'eternal',
        'eternity',
        'ethanol',
        'ether',
        'ethically',
        'ethics',
        'euphemism',
        'evacuate',
        'evacuee',
        'evade',
        'evaluate',
        'evaluator',
        'evaporate',
        'evasion',
        'evasive',
        'even',
        'everglade',
        'evergreen',
        'everybody',
        'everyday',
        'everyone',
        'evict',
        'evidence',
        'evident',
        'evil',
        'evoke',
        'evolution',
        'evolve',
        'exact',
        'exalted',
        'example',
        'excavate',
        'excavator',
        'exceeding',
        'exception',
        'excess',
        'exchange',
        'excitable',
        'exciting',
        'exclaim',
        'exclude',
        'excluding',
        'exclusion',
        'exclusive',
        'excretion',
        'excretory',
        'excursion',
        'excusable',
        'excusably',
        'excuse',
        'exemplary',
        'exemplify',
        'exemption',
        'exerciser',
        'exert',
        'exes',
        'exfoliate',
        'exhale',
        'exhaust',
        'exhume',
        'exile',
        'existing',
        'exit',
        'exodus',
        'exonerate',
        'exorcism',
        'exorcist',
        'expand',
        'expanse',
        'expansion',
        'expansive',
        'expectant',
        'expedited',
        'expediter',
        'expel',
        'expend',
        'expenses',
        'expensive',
        'expert',
        'expire',
        'expiring',
        'explain',
        'expletive',
        'explicit',
        'explode',
        'exploit',
        'explore',
        'exploring',
        'exponent',
        'exporter',
        'exposable',
        'expose',
        'exposure',
        'express',
        'expulsion',
        'exquisite',
        'extended',
        'extending',
        'extent',
        'extenuate',
        'exterior',
        'external',
        'extinct',
        'extortion',
        'extradite',
        'extras',
        'extrovert',
        'extrude',
        'extruding',
        'exuberant',
        'fable',
        'fabric',
        'fabulous',
        'facebook',
        'facecloth',
        'facedown',
        'faceless',
        'facelift',
        'faceplate',
        'faceted',
        'facial',
        'facility',
        'facing',
        'facsimile',
        'faction',
        'factoid',
        'factor',
        'factsheet',
        'factual',
        'faculty',
        'fade',
        'fading',
        'failing',
        'falcon',
        'fall',
        'false',
        'falsify',
        'fame',
        'familiar',
        'family',
        'famine',
        'famished',
        'fanatic',
        'fancied',
        'fanciness',
        'fancy',
        'fanfare',
        'fang',
        'fanning',
        'fantasize',
        'fantastic',
        'fantasy',
        'fascism',
        'fastball',
        'faster',
        'fasting',
        'fastness',
        'faucet',
        'favorable',
        'favorably',
        'favored',
        'favoring',
        'favorite',
        'fax',
        'feast',
        'federal',
        'fedora',
        'feeble',
        'feed',
        'feel',
        'feisty',
        'feline',
        'felt-tip',
        'feminine',
        'feminism',
        'feminist',
        'feminize',
        'femur',
        'fence',
        'fencing',
        'fender',
        'ferment',
        'fernlike',
        'ferocious',
        'ferocity',
        'ferret',
        'ferris',
        'ferry',
        'fervor',
        'fester',
        'festival',
        'festive',
        'festivity',
        'fetal',
        'fetch',
        'fever',
        'fiber',
        'fiction',
        'fiddle',
        'fiddling',
        'fidelity',
        'fidgeting',
        'fidgety',
        'fifteen',
        'fifth',
        'fiftieth',
        'fifty',
        'figment',
        'figure',
        'figurine',
        'filing',
        'filled',
        'filler',
        'filling',
        'film',
        'filter',
        'filth',
        'filtrate',
        'finale',
        'finalist',
        'finalize',
        'finally',
        'finance',
        'financial',
        'finch',
        'fineness',
        'finer',
        'finicky',
        'finished',
        'finisher',
        'finishing',
        'finite',
        'finless',
        'finlike',
        'fiscally',
        'fit',
        'five',
        'flaccid',
        'flagman',
        'flagpole',
        'flagship',
        'flagstick',
        'flagstone',
        'flail',
        'flakily',
        'flaky',
        'flame',
        'flammable',
        'flanked',
        'flanking',
        'flannels',
        'flap',
        'flaring',
        'flashback',
        'flashbulb',
        'flashcard',
        'flashily',
        'flashing',
        'flashy',
        'flask',
        'flatbed',
        'flatfoot',
        'flatly',
        'flatness',
        'flatten',
        'flattered',
        'flatterer',
        'flattery',
        'flattop',
        'flatware',
        'flatworm',
        'flavored',
        'flavorful',
        'flavoring',
        'flaxseed',
        'fled',
        'fleshed',
        'fleshy',
        'flick',
        'flier',
        'flight',
        'flinch',
        'fling',
        'flint',
        'flip',
        'flirt',
        'float',
        'flock',
        'flogging',
        'flop',
        'floral',
        'florist',
        'floss',
        'flounder',
        'flyable',
        'flyaway',
        'flyer',
        'flying',
        'flyover',
        'flypaper',
        'foam',
        'foe',
        'fog',
        'foil',
        'folic',
        'folk',
        'follicle',
        'follow',
        'fondling',
        'fondly',
        'fondness',
        'fondue',
        'font',
        'food',
        'fool',
        'footage',
        'football',
        'footbath',
        'footboard',
        'footer',
        'footgear',
        'foothill',
        'foothold',
        'footing',
        'footless',
        'footman',
        'footnote',
        'footpad',
        'footpath',
        'footprint',
        'footrest',
        'footsie',
        'footsore',
        'footwear',
        'footwork',
        'fossil',
        'foster',
        'founder',
        'founding',
        'fountain',
        'fox',
        'foyer',
        'fraction',
        'fracture',
        'fragile',
        'fragility',
        'fragment',
        'fragrance',
        'fragrant',
        'frail',
        'frame',
        'framing',
        'frantic',
        'fraternal',
        'frayed',
        'fraying',
        'frays',
        'freckled',
        'freckles',
        'freebase',
        'freebee',
        'freebie',
        'freedom',
        'freefall',
        'freehand',
        'freeing',
        'freeload',
        'freely',
        'freemason',
        'freeness',
        'freestyle',
        'freeware',
        'freeway',
        'freewill',
        'freezable',
        'freezing',
        'freight',
        'french',
        'frenzied',
        'frenzy',
        'frequency',
        'frequent',
        'fresh',
        'fretful',
        'fretted',
        'friction',
        'friday',
        'fridge',
        'fried',
        'friend',
        'frighten',
        'frightful',
        'frigidity',
        'frigidly',
        'frill',
        'fringe',
        'frisbee',
        'frisk',
        'fritter',
        'frivolous',
        'frolic',
        'from',
        'front',
        'frostbite',
        'frosted',
        'frostily',
        'frosting',
        'frostlike',
        'frosty',
        'froth',
        'frown',
        'frozen',
        'fructose',
        'frugality',
        'frugally',
        'fruit',
        'frustrate',
        'frying',
        'gab',
        'gaffe',
        'gag',
        'gainfully',
        'gaining',
        'gains',
        'gala',
        'gallantly',
        'galleria',
        'gallery',
        'galley',
        'gallon',
        'gallows',
        'gallstone',
        'galore',
        'galvanize',
        'gambling',
        'game',
        'gaming',
        'gamma',
        'gander',
        'gangly',
        'gangrene',
        'gangway',
        'gap',
        'garage',
        'garbage',
        'garden',
        'gargle',
        'garland',
        'garlic',
        'garment',
        'garnet',
        'garnish',
        'garter',
        'gas',
        'gatherer',
        'gathering',
        'gating',
        'gauging',
        'gauntlet',
        'gauze',
        'gave',
        'gawk',
        'gazing',
        'gear',
        'gecko',
        'geek',
        'geiger',
        'gem',
        'gender',
        'generic',
        'generous',
        'genetics',
        'genre',
        'gentile',
        'gentleman',
        'gently',
        'gents',
        'geography',
        'geologic',
        'geologist',
        'geology',
        'geometric',
        'geometry',
        'geranium',
        'gerbil',
        'geriatric',
        'germicide',
        'germinate',
        'germless',
        'germproof',
        'gestate',
        'gestation',
        'gesture',
        'getaway',
        'getting',
        'getup',
        'giant',
        'gibberish',
        'giblet',
        'giddily',
        'giddiness',
        'giddy',
        'gift',
        'gigabyte',
        'gigahertz',
        'gigantic',
        'giggle',
        'giggling',
        'giggly',
        'gigolo',
        'gilled',
        'gills',
        'gimmick',
        'girdle',
        'giveaway',
        'given',
        'giver',
        'giving',
        'gizmo',
        'gizzard',
        'glacial',
        'glacier',
        'glade',
        'gladiator',
        'gladly',
        'glamorous',
        'glamour',
        'glance',
        'glancing',
        'glandular',
        'glare',
        'glaring',
        'glass',
        'glaucoma',
        'glazing',
        'gleaming',
        'gleeful',
        'glider',
        'gliding',
        'glimmer',
        'glimpse',
        'glisten',
        'glitch',
        'glitter',
        'glitzy',
        'gloater',
        'gloating',
        'gloomily',
        'gloomy',
        'glorified',
        'glorifier',
        'glorify',
        'glorious',
        'glory',
        'gloss',
        'glove',
        'glowing',
        'glowworm',
        'glucose',
        'glue',
        'gluten',
        'glutinous',
        'glutton',
        'gnarly',
        'gnat',
        'goal',
        'goatskin',
        'goes',
        'goggles',
        'going',
        'goldfish',
        'goldmine',
        'goldsmith',
        'golf',
        'goliath',
        'gonad',
        'gondola',
        'gone',
        'gong',
        'good',
        'gooey',
        'goofball',
        'goofiness',
        'goofy',
        'google',
        'goon',
        'gopher',
        'gore',
        'gorged',
        'gorgeous',
        'gory',
        'gosling',
        'gossip',
        'gothic',
        'gotten',
        'gout',
        'gown',
        'grab',
        'graceful',
        'graceless',
        'gracious',
        'gradation',
        'graded',
        'grader',
        'gradient',
        'grading',
        'gradually',
        'graduate',
        'graffiti',
        'grafted',
        'grafting',
        'grain',
        'granddad',
        'grandkid',
        'grandly',
        'grandma',
        'grandpa',
        'grandson',
        'granite',
        'granny',
        'granola',
        'grant',
        'granular',
        'grape',
        'graph',
        'grapple',
        'grappling',
        'grasp',
        'grass',
        'gratified',
        'gratify',
        'grating',
        'gratitude',
        'gratuity',
        'gravel',
        'graveness',
        'graves',
        'graveyard',
        'gravitate',
        'gravity',
        'gravy',
        'gray',
        'grazing',
        'greasily',
        'greedily',
        'greedless',
        'greedy',
        'green',
        'greeter',
        'greeting',
        'grew',
        'greyhound',
        'grid',
        'grief',
        'grievance',
        'grieving',
        'grievous',
        'grill',
        'grimace',
        'grimacing',
        'grime',
        'griminess',
        'grimy',
        'grinch',
        'grinning',
        'grip',
        'gristle',
        'grit',
        'groggily',
        'groggy',
        'groin',
        'groom',
        'groove',
        'grooving',
        'groovy',
        'grope',
        'ground',
        'grouped',
        'grout',
        'grove',
        'grower',
        'growing',
        'growl',
        'grub',
        'grudge',
        'grudging',
        'grueling',
        'gruffly',
        'grumble',
        'grumbling',
        'grumbly',
        'grumpily',
        'grunge',
        'grunt',
        'guacamole',
        'guidable',
        'guidance',
        'guide',
        'guiding',
        'guileless',
        'guise',
        'gulf',
        'gullible',
        'gully',
        'gulp',
        'gumball',
        'gumdrop',
        'gumminess',
        'gumming',
        'gummy',
        'gurgle',
        'gurgling',
        'guru',
        'gush',
        'gusto',
        'gusty',
        'gutless',
        'guts',
        'gutter',
        'guy',
        'guzzler',
        'gyration',
        'habitable',
        'habitant',
        'habitat',
        'habitual',
        'hacked',
        'hacker',
        'hacking',
        'hacksaw',
        'had',
        'haggler',
        'haiku',
        'half',
        'halogen',
        'halt',
        'halved',
        'halves',
        'hamburger',
        'hamlet',
        'hammock',
        'hamper',
        'hamster',
        'hamstring',
        'handbag',
        'handball',
        'handbook',
        'handbrake',
        'handcart',
        'handclap',
        'handclasp',
        'handcraft',
        'handcuff',
        'handed',
        'handful',
        'handgrip',
        'handgun',
        'handheld',
        'handiness',
        'handiwork',
        'handlebar',
        'handled',
        'handler',
        'handling',
        'handmade',
        'handoff',
        'handpick',
        'handprint',
        'handrail',
        'handsaw',
        'handset',
        'handsfree',
        'handshake',
        'handstand',
        'handwash',
        'handwork',
        'handwoven',
        'handwrite',
        'handyman',
        'hangnail',
        'hangout',
        'hangover',
        'hangup',
        'hankering',
        'hankie',
        'hanky',
        'haphazard',
        'happening',
        'happier',
        'happiest',
        'happily',
        'happiness',
        'happy',
        'harbor',
        'hardcopy',
        'hardcore',
        'hardcover',
        'harddisk',
        'hardened',
        'hardener',
        'hardening',
        'hardhat',
        'hardhead',
        'hardiness',
        'hardly',
        'hardness',
        'hardship',
        'hardware',
        'hardwired',
        'hardwood',
        'hardy',
        'harmful',
        'harmless',
        'harmonica',
        'harmonics',
        'harmonize',
        'harmony',
        'harness',
        'harpist',
        'harsh',
        'harvest',
        'hash',
        'hassle',
        'haste',
        'hastily',
        'hastiness',
        'hasty',
        'hatbox',
        'hatchback',
        'hatchery',
        'hatchet',
        'hatching',
        'hatchling',
        'hate',
        'hatless',
        'hatred',
        'haunt',
        'haven',
        'hazard',
        'hazelnut',
        'hazily',
        'haziness',
        'hazing',
        'hazy',
        'headache',
        'headband',
        'headboard',
        'headcount',
        'headdress',
        'headed',
        'header',
        'headfirst',
        'headgear',
        'heading',
        'headlamp',
        'headless',
        'headlock',
        'headphone',
        'headpiece',
        'headrest',
        'headroom',
        'headscarf',
        'headset',
        'headsman',
        'headstand',
        'headstone',
        'headway',
        'headwear',
        'heap',
        'heat',
        'heave',
        'heavily',
        'heaviness',
        'heaving',
        'hedge',
        'hedging',
        'heftiness',
        'hefty',
        'helium',
        'helmet',
        'helper',
        'helpful',
        'helping',
        'helpless',
        'helpline',
        'hemlock',
        'hemstitch',
        'hence',
        'henchman',
        'henna',
        'herald',
        'herbal',
        'herbicide',
        'herbs',
        'heritage',
        'hermit',
        'heroics',
        'heroism',
        'herring',
        'herself',
        'hertz',
        'hesitancy',
        'hesitant',
        'hesitate',
        'hexagon',
        'hexagram',
        'hubcap',
        'huddle',
        'huddling',
        'huff',
        'hug',
        'hula',
        'hulk',
        'hull',
        'human',
        'humble',
        'humbling',
        'humbly',
        'humid',
        'humiliate',
        'humility',
        'humming',
        'hummus',
        'humongous',
        'humorist',
        'humorless',
        'humorous',
        'humpback',
        'humped',
        'humvee',
        'hunchback',
        'hundredth',
        'hunger',
        'hungrily',
        'hungry',
        'hunk',
        'hunter',
        'hunting',
        'huntress',
        'huntsman',
        'hurdle',
        'hurled',
        'hurler',
        'hurling',
        'hurray',
        'hurricane',
        'hurried',
        'hurry',
        'hurt',
        'husband',
        'hush',
        'husked',
        'huskiness',
        'hut',
        'hybrid',
        'hydrant',
        'hydrated',
        'hydration',
        'hydrogen',
        'hydroxide',
        'hyperlink',
        'hypertext',
        'hyphen',
        'hypnoses',
        'hypnosis',
        'hypnotic',
        'hypnotism',
        'hypnotist',
        'hypnotize',
        'hypocrisy',
        'hypocrite',
        'ibuprofen',
        'ice',
        'iciness',
        'icing',
        'icky',
        'icon',
        'icy',
        'idealism',
        'idealist',
        'idealize',
        'ideally',
        'idealness',
        'identical',
        'identify',
        'identity',
        'ideology',
        'idiocy',
        'idiom',
        'idly',
        'igloo',
        'ignition',
        'ignore',
        'iguana',
        'illicitly',
        'illusion',
        'illusive',
        'image',
        'imaginary',
        'imagines',
        'imaging',
        'imbecile',
        'imitate',
        'imitation',
        'immature',
        'immerse',
        'immersion',
        'imminent',
        'immobile',
        'immodest',
        'immorally',
        'immortal',
        'immovable',
        'immovably',
        'immunity',
        'immunize',
        'impaired',
        'impale',
        'impart',
        'impatient',
        'impeach',
        'impeding',
        'impending',
        'imperfect',
        'imperial',
        'impish',
        'implant',
        'implement',
        'implicate',
        'implicit',
        'implode',
        'implosion',
        'implosive',
        'imply',
        'impolite',
        'important',
        'importer',
        'impose',
        'imposing',
        'impotence',
        'impotency',
        'impotent',
        'impound',
        'imprecise',
        'imprint',
        'imprison',
        'impromptu',
        'improper',
        'improve',
        'improving',
        'improvise',
        'imprudent',
        'impulse',
        'impulsive',
        'impure',
        'impurity',
        'iodine',
        'iodize',
        'ion',
        'ipad',
        'iphone',
        'ipod',
        'irate',
        'irk',
        'iron',
        'irregular',
        'irrigate',
        'irritable',
        'irritably',
        'irritant',
        'irritate',
        'islamic',
        'islamist',
        'isolated',
        'isolating',
        'isolation',
        'isotope',
        'issue',
        'issuing',
        'italicize',
        'italics',
        'item',
        'itinerary',
        'itunes',
        'ivory',
        'ivy',
        'jab',
        'jackal',
        'jacket',
        'jackknife',
        'jackpot',
        'jailbird',
        'jailbreak',
        'jailer',
        'jailhouse',
        'jalapeno',
        'jam',
        'janitor',
        'january',
        'jargon',
        'jarring',
        'jasmine',
        'jaundice',
        'jaunt',
        'java',
        'jawed',
        'jawless',
        'jawline',
        'jaws',
        'jaybird',
        'jaywalker',
        'jazz',
        'jeep',
        'jeeringly',
        'jellied',
        'jelly',
        'jersey',
        'jester',
        'jet',
        'jiffy',
        'jigsaw',
        'jimmy',
        'jingle',
        'jingling',
        'jinx',
        'jitters',
        'jittery',
        'job',
        'jockey',
        'jockstrap',
        'jogger',
        'jogging',
        'john',
        'joining',
        'jokester',
        'jokingly',
        'jolliness',
        'jolly',
        'jolt',
        'jot',
        'jovial',
        'joyfully',
        'joylessly',
        'joyous',
        'joyride',
        'joystick',
        'jubilance',
        'jubilant',
        'judge',
        'judgingly',
        'judicial',
        'judiciary',
        'judo',
        'juggle',
        'juggling',
        'jugular',
        'juice',
        'juiciness',
        'juicy',
        'jujitsu',
        'jukebox',
        'july',
        'jumble',
        'jumbo',
        'jump',
        'junction',
        'juncture',
        'june',
        'junior',
        'juniper',
        'junkie',
        'junkman',
        'junkyard',
        'jurist',
        'juror',
        'jury',
        'justice',
        'justifier',
        'justify',
        'justly',
        'justness',
        'juvenile',
        'kabob',
        'kangaroo',
        'karaoke',
        'karate',
        'karma',
        'kebab',
        'keenly',
        'keenness',
        'keep',
        'keg',
        'kelp',
        'kennel',
        'kept',
        'kerchief',
        'kerosene',
        'kettle',
        'kick',
        'kiln',
        'kilobyte',
        'kilogram',
        'kilometer',
        'kilowatt',
        'kilt',
        'kimono',
        'kindle',
        'kindling',
        'kindly',
        'kindness',
        'kindred',
        'kinetic',
        'kinfolk',
        'king',
        'kinship',
        'kinsman',
        'kinswoman',
        'kissable',
        'kisser',
        'kissing',
        'kitchen',
        'kite',
        'kitten',
        'kitty',
        'kiwi',
        'kleenex',
        'knapsack',
        'knee',
        'knelt',
        'knickers',
        'knoll',
        'koala',
        'kooky',
        'kosher',
        'krypton',
        'kudos',
        'kung',
        'labored',
        'laborer',
        'laboring',
        'laborious',
        'labrador',
        'ladder',
        'ladies',
        'ladle',
        'ladybug',
        'ladylike',
        'lagged',
        'lagging',
        'lagoon',
        'lair',
        'lake',
        'lance',
        'landed',
        'landfall',
        'landfill',
        'landing',
        'landlady',
        'landless',
        'landline',
        'landlord',
        'landmark',
        'landmass',
        'landmine',
        'landowner',
        'landscape',
        'landside',
        'landslide',
        'language',
        'lankiness',
        'lanky',
        'lantern',
        'lapdog',
        'lapel',
        'lapped',
        'lapping',
        'laptop',
        'lard',
        'large',
        'lark',
        'lash',
        'lasso',
        'last',
        'latch',
        'late',
        'lather',
        'latitude',
        'latrine',
        'latter',
        'latticed',
        'launch',
        'launder',
        'laundry',
        'laurel',
        'lavender',
        'lavish',
        'laxative',
        'lazily',
        'laziness',
        'lazy',
        'lecturer',
        'left',
        'legacy',
        'legal',
        'legend',
        'legged',
        'leggings',
        'legible',
        'legibly',
        'legislate',
        'lego',
        'legroom',
        'legume',
        'legwarmer',
        'legwork',
        'lemon',
        'lend',
        'length',
        'lens',
        'lent',
        'leotard',
        'lesser',
        'letdown',
        'lethargic',
        'lethargy',
        'letter',
        'lettuce',
        'level',
        'leverage',
        'levers',
        'levitate',
        'levitator',
        'liability',
        'liable',
        'liberty',
        'librarian',
        'library',
        'licking',
        'licorice',
        'lid',
        'life',
        'lifter',
        'lifting',
        'liftoff',
        'ligament',
        'likely',
        'likeness',
        'likewise',
        'liking',
        'lilac',
        'lilly',
        'lily',
        'limb',
        'limeade',
        'limelight',
        'limes',
        'limit',
        'limping',
        'limpness',
        'line',
        'lingo',
        'linguini',
        'linguist',
        'lining',
        'linked',
        'linoleum',
        'linseed',
        'lint',
        'lion',
        'lip',
        'liquefy',
        'liqueur',
        'liquid',
        'lisp',
        'list',
        'litigate',
        'litigator',
        'litmus',
        'litter',
        'little',
        'livable',
        'lived',
        'lively',
        'liver',
        'livestock',
        'lividly',
        'living',
        'lizard',
        'lubricant',
        'lubricate',
        'lucid',
        'luckily',
        'luckiness',
        'luckless',
        'lucrative',
        'ludicrous',
        'lugged',
        'lukewarm',
        'lullaby',
        'lumber',
        'luminance',
        'luminous',
        'lumpiness',
        'lumping',
        'lumpish',
        'lunacy',
        'lunar',
        'lunchbox',
        'luncheon',
        'lunchroom',
        'lunchtime',
        'lung',
        'lurch',
        'lure',
        'luridness',
        'lurk',
        'lushly',
        'lushness',
        'luster',
        'lustfully',
        'lustily',
        'lustiness',
        'lustrous',
        'lusty',
        'luxurious',
        'luxury',
        'lying',
        'lyrically',
        'lyricism',
        'lyricist',
        'lyrics',
        'macarena',
        'macaroni',
        'macaw',
        'mace',
        'machine',
        'machinist',
        'magazine',
        'magenta',
        'maggot',
        'magical',
        'magician',
        'magma',
        'magnesium',
        'magnetic',
        'magnetism',
        'magnetize',
        'magnifier',
        'magnify',
        'magnitude',
        'magnolia',
        'mahogany',
        'maimed',
        'majestic',
        'majesty',
        'majorette',
        'majority',
        'makeover',
        'maker',
        'makeshift',
        'making',
        'malformed',
        'malt',
        'mama',
        'mammal',
        'mammary',
        'mammogram',
        'manager',
        'managing',
        'manatee',
        'mandarin',
        'mandate',
        'mandatory',
        'mandolin',
        'manger',
        'mangle',
        'mango',
        'mangy',
        'manhandle',
        'manhole',
        'manhood',
        'manhunt',
        'manicotti',
        'manicure',
        'manifesto',
        'manila',
        'mankind',
        'manlike',
        'manliness',
        'manly',
        'manmade',
        'manned',
        'mannish',
        'manor',
        'manpower',
        'mantis',
        'mantra',
        'manual',
        'many',
        'map',
        'marathon',
        'marauding',
        'marbled',
        'marbles',
        'marbling',
        'march',
        'mardi',
        'margarine',
        'margarita',
        'margin',
        'marigold',
        'marina',
        'marine',
        'marital',
        'maritime',
        'marlin',
        'marmalade',
        'maroon',
        'married',
        'marrow',
        'marry',
        'marshland',
        'marshy',
        'marsupial',
        'marvelous',
        'marxism',
        'mascot',
        'masculine',
        'mashed',
        'mashing',
        'massager',
        'masses',
        'massive',
        'mastiff',
        'matador',
        'matchbook',
        'matchbox',
        'matcher',
        'matching',
        'matchless',
        'material',
        'maternal',
        'maternity',
        'math',
        'mating',
        'matriarch',
        'matrimony',
        'matrix',
        'matron',
        'matted',
        'matter',
        'maturely',
        'maturing',
        'maturity',
        'mauve',
        'maverick',
        'maximize',
        'maximum',
        'maybe',
        'mayday',
        'mayflower',
        'moaner',
        'moaning',
        'mobile',
        'mobility',
        'mobilize',
        'mobster',
        'mocha',
        'mocker',
        'mockup',
        'modified',
        'modify',
        'modular',
        'modulator',
        'module',
        'moisten',
        'moistness',
        'moisture',
        'molar',
        'molasses',
        'mold',
        'molecular',
        'molecule',
        'molehill',
        'mollusk',
        'mom',
        'monastery',
        'monday',
        'monetary',
        'monetize',
        'moneybags',
        'moneyless',
        'moneywise',
        'mongoose',
        'mongrel',
        'monitor',
        'monkhood',
        'monogamy',
        'monogram',
        'monologue',
        'monopoly',
        'monorail',
        'monotone',
        'monotype',
        'monoxide',
        'monsieur',
        'monsoon',
        'monstrous',
        'monthly',
        'monument',
        'moocher',
        'moodiness',
        'moody',
        'mooing',
        'moonbeam',
        'mooned',
        'moonlight',
        'moonlike',
        'moonlit',
        'moonrise',
        'moonscape',
        'moonshine',
        'moonstone',
        'moonwalk',
        'mop',
        'morale',
        'morality',
        'morally',
        'morbidity',
        'morbidly',
        'morphine',
        'morphing',
        'morse',
        'mortality',
        'mortally',
        'mortician',
        'mortified',
        'mortify',
        'mortuary',
        'mosaic',
        'mossy',
        'most',
        'mothball',
        'mothproof',
        'motion',
        'motivate',
        'motivator',
        'motive',
        'motocross',
        'motor',
        'motto',
        'mountable',
        'mountain',
        'mounted',
        'mounting',
        'mourner',
        'mournful',
        'mouse',
        'mousiness',
        'moustache',
        'mousy',
        'mouth',
        'movable',
        'move',
        'movie',
        'moving',
        'mower',
        'mowing',
        'much',
        'muck',
        'mud',
        'mug',
        'mulberry',
        'mulch',
        'mule',
        'mulled',
        'mullets',
        'multiple',
        'multiply',
        'multitask',
        'multitude',
        'mumble',
        'mumbling',
        'mumbo',
        'mummified',
        'mummify',
        'mummy',
        'mumps',
        'munchkin',
        'mundane',
        'municipal',
        'muppet',
        'mural',
        'murkiness',
        'murky',
        'murmuring',
        'muscular',
        'museum',
        'mushily',
        'mushiness',
        'mushroom',
        'mushy',
        'music',
        'musket',
        'muskiness',
        'musky',
        'mustang',
        'mustard',
        'muster',
        'mustiness',
        'musty',
        'mutable',
        'mutate',
        'mutation',
        'mute',
        'mutilated',
        'mutilator',
        'mutiny',
        'mutt',
        'mutual',
        'muzzle',
        'myself',
        'myspace',
        'mystified',
        'mystify',
        'myth',
        'nacho',
        'nag',
        'nail',
        'name',
        'naming',
        'nanny',
        'nanometer',
        'nape',
        'napkin',
        'napped',
        'napping',
        'nappy',
        'narrow',
        'nastily',
        'nastiness',
        'national',
        'native',
        'nativity',
        'natural',
        'nature',
        'naturist',
        'nautical',
        'navigate',
        'navigator',
        'navy',
        'nearby',
        'nearest',
        'nearly',
        'nearness',
        'neatly',
        'neatness',
        'nebula',
        'nebulizer',
        'nectar',
        'negate',
        'negation',
        'negative',
        'neglector',
        'negligee',
        'negligent',
        'negotiate',
        'nemeses',
        'nemesis',
        'neon',
        'nephew',
        'nerd',
        'nervous',
        'nervy',
        'nest',
        'net',
        'neurology',
        'neuron',
        'neurosis',
        'neurotic',
        'neuter',
        'neutron',
        'never',
        'next',
        'nibble',
        'nickname',
        'nicotine',
        'niece',
        'nifty',
        'nimble',
        'nimbly',
        'nineteen',
        'ninetieth',
        'ninja',
        'nintendo',
        'ninth',
        'nuclear',
        'nuclei',
        'nucleus',
        'nugget',
        'nullify',
        'number',
        'numbing',
        'numbly',
        'numbness',
        'numeral',
        'numerate',
        'numerator',
        'numeric',
        'numerous',
        'nuptials',
        'nursery',
        'nursing',
        'nurture',
        'nutcase',
        'nutlike',
        'nutmeg',
        'nutrient',
        'nutshell',
        'nuttiness',
        'nutty',
        'nuzzle',
        'nylon',
        'oaf',
        'oak',
        'oasis',
        'oat',
        'obedience',
        'obedient',
        'obituary',
        'object',
        'obligate',
        'obliged',
        'oblivion',
        'oblivious',
        'oblong',
        'obnoxious',
        'oboe',
        'obscure',
        'obscurity',
        'observant',
        'observer',
        'observing',
        'obsessed',
        'obsession',
        'obsessive',
        'obsolete',
        'obstacle',
        'obstinate',
        'obstruct',
        'obtain',
        'obtrusive',
        'obtuse',
        'obvious',
        'occultist',
        'occupancy',
        'occupant',
        'occupier',
        'occupy',
        'ocean',
        'ocelot',
        'octagon',
        'octane',
        'october',
        'octopus',
        'ogle',
        'oil',
        'oink',
        'ointment',
        'okay',
        'old',
        'olive',
        'olympics',
        'omega',
        'omen',
        'ominous',
        'omission',
        'omit',
        'omnivore',
        'onboard',
        'oncoming',
        'ongoing',
        'onion',
        'online',
        'onlooker',
        'only',
        'onscreen',
        'onset',
        'onshore',
        'onslaught',
        'onstage',
        'onto',
        'onward',
        'onyx',
        'oops',
        'ooze',
        'oozy',
        'opacity',
        'opal',
        'open',
        'operable',
        'operate',
        'operating',
        'operation',
        'operative',
        'operator',
        'opium',
        'opossum',
        'opponent',
        'oppose',
        'opposing',
        'opposite',
        'oppressed',
        'oppressor',
        'opt',
        'opulently',
        'osmosis',
        'other',
        'otter',
        'ouch',
        'ought',
        'ounce',
        'outage',
        'outback',
        'outbid',
        'outboard',
        'outbound',
        'outbreak',
        'outburst',
        'outcast',
        'outclass',
        'outcome',
        'outdated',
        'outdoors',
        'outer',
        'outfield',
        'outfit',
        'outflank',
        'outgoing',
        'outgrow',
        'outhouse',
        'outing',
        'outlast',
        'outlet',
        'outline',
        'outlook',
        'outlying',
        'outmatch',
        'outmost',
        'outnumber',
        'outplayed',
        'outpost',
        'outpour',
        'output',
        'outrage',
        'outrank',
        'outreach',
        'outright',
        'outscore',
        'outsell',
        'outshine',
        'outshoot',
        'outsider',
        'outskirts',
        'outsmart',
        'outsource',
        'outspoken',
        'outtakes',
        'outthink',
        'outward',
        'outweigh',
        'outwit',
        'oval',
        'ovary',
        'oven',
        'overact',
        'overall',
        'overarch',
        'overbid',
        'overbill',
        'overbite',
        'overblown',
        'overboard',
        'overbook',
        'overbuilt',
        'overcast',
        'overcoat',
        'overcome',
        'overcook',
        'overcrowd',
        'overdraft',
        'overdrawn',
        'overdress',
        'overdrive',
        'overdue',
        'overeager',
        'overeater',
        'overexert',
        'overfed',
        'overfeed',
        'overfill',
        'overflow',
        'overfull',
        'overgrown',
        'overhand',
        'overhang',
        'overhaul',
        'overhead',
        'overhear',
        'overheat',
        'overhung',
        'overjoyed',
        'overkill',
        'overlabor',
        'overlaid',
        'overlap',
        'overlay',
        'overload',
        'overlook',
        'overlord',
        'overlying',
        'overnight',
        'overpass',
        'overpay',
        'overplant',
        'overplay',
        'overpower',
        'overprice',
        'overrate',
        'overreach',
        'overreact',
        'override',
        'overripe',
        'overrule',
        'overrun',
        'overshoot',
        'overshot',
        'oversight',
        'oversized',
        'oversleep',
        'oversold',
        'overspend',
        'overstate',
        'overstay',
        'overstep',
        'overstock',
        'overstuff',
        'oversweet',
        'overtake',
        'overthrow',
        'overtime',
        'overtly',
        'overtone',
        'overture',
        'overturn',
        'overuse',
        'overvalue',
        'overview',
        'overwrite',
        'owl',
        'oxford',
        'oxidant',
        'oxidation',
        'oxidize',
        'oxidizing',
        'oxygen',
        'oxymoron',
        'oyster',
        'ozone',
        'paced',
        'pacemaker',
        'pacific',
        'pacifier',
        'pacifism',
        'pacifist',
        'pacify',
        'padded',
        'padding',
        'paddle',
        'paddling',
        'padlock',
        'pagan',
        'pager',
        'paging',
        'pajamas',
        'palace',
        'palatable',
        'palm',
        'palpable',
        'palpitate',
        'paltry',
        'pampered',
        'pamperer',
        'pampers',
        'pamphlet',
        'panama',
        'pancake',
        'pancreas',
        'panda',
        'pandemic',
        'pang',
        'panhandle',
        'panic',
        'panning',
        'panorama',
        'panoramic',
        'panther',
        'pantomime',
        'pantry',
        'pants',
        'pantyhose',
        'paparazzi',
        'papaya',
        'paper',
        'paprika',
        'papyrus',
        'parabola',
        'parachute',
        'parade',
        'paradox',
        'paragraph',
        'parakeet',
        'paralegal',
        'paralyses',
        'paralysis',
        'paralyze',
        'paramedic',
        'parameter',
        'paramount',
        'parasail',
        'parasite',
        'parasitic',
        'parcel',
        'parched',
        'parchment',
        'pardon',
        'parish',
        'parka',
        'parking',
        'parkway',
        'parlor',
        'parmesan',
        'parole',
        'parrot',
        'parsley',
        'parsnip',
        'partake',
        'parted',
        'parting',
        'partition',
        'partly',
        'partner',
        'partridge',
        'party',
        'passable',
        'passably',
        'passage',
        'passcode',
        'passenger',
        'passerby',
        'passing',
        'passion',
        'passive',
        'passivism',
        'passover',
        'passport',
        'password',
        'pasta',
        'pasted',
        'pastel',
        'pastime',
        'pastor',
        'pastrami',
        'pasture',
        'pasty',
        'patchwork',
        'patchy',
        'paternal',
        'paternity',
        'path',
        'patience',
        'patient',
        'patio',
        'patriarch',
        'patriot',
        'patrol',
        'patronage',
        'patronize',
        'pauper',
        'pavement',
        'paver',
        'pavestone',
        'pavilion',
        'paving',
        'pawing',
        'payable',
        'payback',
        'paycheck',
        'payday',
        'payee',
        'payer',
        'paying',
        'payment',
        'payphone',
        'payroll',
        'pebble',
        'pebbly',
        'pecan',
        'pectin',
        'peculiar',
        'peddling',
        'pediatric',
        'pedicure',
        'pedigree',
        'pedometer',
        'pegboard',
        'pelican',
        'pellet',
        'pelt',
        'pelvis',
        'penalize',
        'penalty',
        'pencil',
        'pendant',
        'pending',
        'penholder',
        'penknife',
        'pennant',
        'penniless',
        'penny',
        'penpal',
        'pension',
        'pentagon',
        'pentagram',
        'pep',
        'perceive',
        'percent',
        'perch',
        'percolate',
        'perennial',
        'perfected',
        'perfectly',
        'perfume',
        'periscope',
        'perish',
        'perjurer',
        'perjury',
        'perkiness',
        'perky',
        'perm',
        'peroxide',
        'perpetual',
        'perplexed',
        'persecute',
        'persevere',
        'persuaded',
        'persuader',
        'pesky',
        'peso',
        'pessimism',
        'pessimist',
        'pester',
        'pesticide',
        'petal',
        'petite',
        'petition',
        'petri',
        'petroleum',
        'petted',
        'petticoat',
        'pettiness',
        'petty',
        'petunia',
        'phantom',
        'phobia',
        'phoenix',
        'phonebook',
        'phoney',
        'phonics',
        'phoniness',
        'phony',
        'phosphate',
        'photo',
        'phrase',
        'phrasing',
        'placard',
        'placate',
        'placidly',
        'plank',
        'planner',
        'plant',
        'plasma',
        'plaster',
        'plastic',
        'plated',
        'platform',
        'plating',
        'platinum',
        'platonic',
        'platter',
        'platypus',
        'plausible',
        'plausibly',
        'playable',
        'playback',
        'player',
        'playful',
        'playgroup',
        'playhouse',
        'playing',
        'playlist',
        'playmaker',
        'playmate',
        'playoff',
        'playpen',
        'playroom',
        'playset',
        'plaything',
        'playtime',
        'plaza',
        'pleading',
        'pleat',
        'pledge',
        'plentiful',
        'plenty',
        'plethora',
        'plexiglas',
        'pliable',
        'plod',
        'plop',
        'plot',
        'plow',
        'ploy',
        'pluck',
        'plug',
        'plunder',
        'plunging',
        'plural',
        'plus',
        'plutonium',
        'plywood',
        'poach',
        'pod',
        'poem',
        'poet',
        'pogo',
        'pointed',
        'pointer',
        'pointing',
        'pointless',
        'pointy',
        'poise',
        'poison',
        'poker',
        'poking',
        'polar',
        'police',
        'policy',
        'polio',
        'polish',
        'politely',
        'polka',
        'polo',
        'polyester',
        'polygon',
        'polygraph',
        'polymer',
        'poncho',
        'pond',
        'pony',
        'popcorn',
        'pope',
        'poplar',
        'popper',
        'poppy',
        'popsicle',
        'populace',
        'popular',
        'populate',
        'porcupine',
        'pork',
        'porous',
        'porridge',
        'portable',
        'portal',
        'portfolio',
        'porthole',
        'portion',
        'portly',
        'portside',
        'poser',
        'posh',
        'posing',
        'possible',
        'possibly',
        'possum',
        'postage',
        'postal',
        'postbox',
        'postcard',
        'posted',
        'poster',
        'posting',
        'postnasal',
        'posture',
        'postwar',
        'pouch',
        'pounce',
        'pouncing',
        'pound',
        'pouring',
        'pout',
        'powdered',
        'powdering',
        'powdery',
        'power',
        'powwow',
        'pox',
        'praising',
        'prance',
        'prancing',
        'pranker',
        'prankish',
        'prankster',
        'prayer',
        'praying',
        'preacher',
        'preaching',
        'preachy',
        'preamble',
        'precinct',
        'precise',
        'precision',
        'precook',
        'precut',
        'predator',
        'predefine',
        'predict',
        'preface',
        'prefix',
        'preflight',
        'preformed',
        'pregame',
        'pregnancy',
        'pregnant',
        'preheated',
        'prelaunch',
        'prelaw',
        'prelude',
        'premiere',
        'premises',
        'premium',
        'prenatal',
        'preoccupy',
        'preorder',
        'prepaid',
        'prepay',
        'preplan',
        'preppy',
        'preschool',
        'prescribe',
        'preseason',
        'preset',
        'preshow',
        'president',
        'presoak',
        'press',
        'presume',
        'presuming',
        'preteen',
        'pretended',
        'pretender',
        'pretense',
        'pretext',
        'pretty',
        'pretzel',
        'prevail',
        'prevalent',
        'prevent',
        'preview',
        'previous',
        'prewar',
        'prewashed',
        'prideful',
        'pried',
        'primal',
        'primarily',
        'primary',
        'primate',
        'primer',
        'primp',
        'princess',
        'print',
        'prior',
        'prism',
        'prison',
        'prissy',
        'pristine',
        'privacy',
        'private',
        'privatize',
        'prize',
        'proactive',
        'probable',
        'probably',
        'probation',
        'probe',
        'probing',
        'probiotic',
        'problem',
        'procedure',
        'process',
        'proclaim',
        'procreate',
        'procurer',
        'prodigal',
        'prodigy',
        'produce',
        'product',
        'profane',
        'profanity',
        'professed',
        'professor',
        'profile',
        'profound',
        'profusely',
        'progeny',
        'prognosis',
        'program',
        'progress',
        'projector',
        'prologue',
        'prolonged',
        'promenade',
        'prominent',
        'promoter',
        'promotion',
        'prompter',
        'promptly',
        'prone',
        'prong',
        'pronounce',
        'pronto',
        'proofing',
        'proofread',
        'proofs',
        'propeller',
        'properly',
        'property',
        'proponent',
        'proposal',
        'propose',
        'props',
        'prorate',
        'protector',
        'protegee',
        'proton',
        'prototype',
        'protozoan',
        'protract',
        'protrude',
        'proud',
        'provable',
        'proved',
        'proven',
        'provided',
        'provider',
        'providing',
        'province',
        'proving',
        'provoke',
        'provoking',
        'provolone',
        'prowess',
        'prowler',
        'prowling',
        'proximity',
        'proxy',
        'prozac',
        'prude',
        'prudishly',
        'prune',
        'pruning',
        'pry',
        'psychic',
        'public',
        'publisher',
        'pucker',
        'pueblo',
        'pug',
        'pull',
        'pulmonary',
        'pulp',
        'pulsate',
        'pulse',
        'pulverize',
        'puma',
        'pumice',
        'pummel',
        'punch',
        'punctual',
        'punctuate',
        'punctured',
        'pungent',
        'punisher',
        'punk',
        'pupil',
        'puppet',
        'puppy',
        'purchase',
        'pureblood',
        'purebred',
        'purely',
        'pureness',
        'purgatory',
        'purge',
        'purging',
        'purifier',
        'purify',
        'purist',
        'puritan',
        'purity',
        'purple',
        'purplish',
        'purposely',
        'purr',
        'purse',
        'pursuable',
        'pursuant',
        'pursuit',
        'purveyor',
        'pushcart',
        'pushchair',
        'pusher',
        'pushiness',
        'pushing',
        'pushover',
        'pushpin',
        'pushup',
        'pushy',
        'putdown',
        'putt',
        'puzzle',
        'puzzling',
        'pyramid',
        'pyromania',
        'python',
        'quack',
        'quadrant',
        'quail',
        'quaintly',
        'quake',
        'quaking',
        'qualified',
        'qualifier',
        'qualify',
        'quality',
        'qualm',
        'quantum',
        'quarrel',
        'quarry',
        'quartered',
        'quarterly',
        'quarters',
        'quartet',
        'quench',
        'query',
        'quicken',
        'quickly',
        'quickness',
        'quicksand',
        'quickstep',
        'quiet',
        'quill',
        'quilt',
        'quintet',
        'quintuple',
        'quirk',
        'quit',
        'quiver',
        'quizzical',
        'quotable',
        'quotation',
        'quote',
        'rabid',
        'race',
        'racing',
        'racism',
        'rack',
        'racoon',
        'radar',
        'radial',
        'radiance',
        'radiantly',
        'radiated',
        'radiation',
        'radiator',
        'radio',
        'radish',
        'raffle',
        'raft',
        'rage',
        'ragged',
        'raging',
        'ragweed',
        'raider',
        'railcar',
        'railing',
        'railroad',
        'railway',
        'raisin',
        'rake',
        'raking',
        'rally',
        'ramble',
        'rambling',
        'ramp',
        'ramrod',
        'ranch',
        'rancidity',
        'random',
        'ranged',
        'ranger',
        'ranging',
        'ranked',
        'ranking',
        'ransack',
        'ranting',
        'rants',
        'rare',
        'rarity',
        'rascal',
        'rash',
        'rasping',
        'ravage',
        'raven',
        'ravine',
        'raving',
        'ravioli',
        'ravishing',
        'reabsorb',
        'reach',
        'reacquire',
        'reaction',
        'reactive',
        'reactor',
        'reaffirm',
        'ream',
        'reanalyze',
        'reappear',
        'reapply',
        'reappoint',
        'reapprove',
        'rearrange',
        'rearview',
        'reason',
        'reassign',
        'reassure',
        'reattach',
        'reawake',
        'rebalance',
        'rebate',
        'rebel',
        'rebirth',
        'reboot',
        'reborn',
        'rebound',
        'rebuff',
        'rebuild',
        'rebuilt',
        'reburial',
        'rebuttal',
        'recall',
        'recant',
        'recapture',
        'recast',
        'recede',
        'recent',
        'recess',
        'recharger',
        'recipient',
        'recital',
        'recite',
        'reckless',
        'reclaim',
        'recliner',
        'reclining',
        'recluse',
        'reclusive',
        'recognize',
        'recoil',
        'recollect',
        'recolor',
        'reconcile',
        'reconfirm',
        'reconvene',
        'recopy',
        'record',
        'recount',
        'recoup',
        'recovery',
        'recreate',
        'rectal',
        'rectangle',
        'rectified',
        'rectify',
        'recycled',
        'recycler',
        'recycling',
        'reemerge',
        'reenact',
        'reenter',
        'reentry',
        'reexamine',
        'referable',
        'referee',
        'reference',
        'refill',
        'refinance',
        'refined',
        'refinery',
        'refining',
        'refinish',
        'reflected',
        'reflector',
        'reflex',
        'reflux',
        'refocus',
        'refold',
        'reforest',
        'reformat',
        'reformed',
        'reformer',
        'reformist',
        'refract',
        'refrain',
        'refreeze',
        'refresh',
        'refried',
        'refueling',
        'refund',
        'refurbish',
        'refurnish',
        'refusal',
        'refuse',
        'refusing',
        'refutable',
        'refute',
        'regain',
        'regalia',
        'regally',
        'reggae',
        'regime',
        'region',
        'register',
        'registrar',
        'registry',
        'regress',
        'regretful',
        'regroup',
        'regular',
        'regulate',
        'regulator',
        'rehab',
        'reheat',
        'rehire',
        'rehydrate',
        'reimburse',
        'reissue',
        'reiterate',
        'rejoice',
        'rejoicing',
        'rejoin',
        'rekindle',
        'relapse',
        'relapsing',
        'relatable',
        'related',
        'relation',
        'relative',
        'relax',
        'relay',
        'relearn',
        'release',
        'relenting',
        'reliable',
        'reliably',
        'reliance',
        'reliant',
        'relic',
        'relieve',
        'relieving',
        'relight',
        'relish',
        'relive',
        'reload',
        'relocate',
        'relock',
        'reluctant',
        'rely',
        'remake',
        'remark',
        'remarry',
        'rematch',
        'remedial',
        'remedy',
        'remember',
        'reminder',
        'remindful',
        'remission',
        'remix',
        'remnant',
        'remodeler',
        'remold',
        'remorse',
        'remote',
        'removable',
        'removal',
        'removed',
        'remover',
        'removing',
        'rename',
        'renderer',
        'rendering',
        'rendition',
        'renegade',
        'renewable',
        'renewably',
        'renewal',
        'renewed',
        'renounce',
        'renovate',
        'renovator',
        'rentable',
        'rental',
        'rented',
        'renter',
        'reoccupy',
        'reoccur',
        'reopen',
        'reorder',
        'repackage',
        'repacking',
        'repaint',
        'repair',
        'repave',
        'repaying',
        'repayment',
        'repeal',
        'repeated',
        'repeater',
        'repent',
        'rephrase',
        'replace',
        'replay',
        'replica',
        'reply',
        'reporter',
        'repose',
        'repossess',
        'repost',
        'repressed',
        'reprimand',
        'reprint',
        'reprise',
        'reproach',
        'reprocess',
        'reproduce',
        'reprogram',
        'reps',
        'reptile',
        'reptilian',
        'repugnant',
        'repulsion',
        'repulsive',
        'repurpose',
        'reputable',
        'reputably',
        'request',
        'require',
        'requisite',
        'reroute',
        'rerun',
        'resale',
        'resample',
        'rescuer',
        'reseal',
        'research',
        'reselect',
        'reseller',
        'resemble',
        'resend',
        'resent',
        'reset',
        'reshape',
        'reshoot',
        'reshuffle',
        'residence',
        'residency',
        'resident',
        'residual',
        'residue',
        'resigned',
        'resilient',
        'resistant',
        'resisting',
        'resize',
        'resolute',
        'resolved',
        'resonant',
        'resonate',
        'resort',
        'resource',
        'respect',
        'resubmit',
        'result',
        'resume',
        'resupply',
        'resurface',
        'resurrect',
        'retail',
        'retainer',
        'retaining',
        'retake',
        'retaliate',
        'retention',
        'rethink',
        'retinal',
        'retired',
        'retiree',
        'retiring',
        'retold',
        'retool',
        'retorted',
        'retouch',
        'retrace',
        'retract',
        'retrain',
        'retread',
        'retreat',
        'retrial',
        'retrieval',
        'retriever',
        'retry',
        'return',
        'retying',
        'retype',
        'reunion',
        'reunite',
        'reusable',
        'reuse',
        'reveal',
        'reveler',
        'revenge',
        'revenue',
        'reverb',
        'revered',
        'reverence',
        'reverend',
        'reversal',
        'reverse',
        'reversing',
        'reversion',
        'revert',
        'revisable',
        'revise',
        'revision',
        'revisit',
        'revivable',
        'revival',
        'reviver',
        'reviving',
        'revocable',
        'revoke',
        'revolt',
        'revolver',
        'revolving',
        'reward',
        'rewash',
        'rewind',
        'rewire',
        'reword',
        'rework',
        'rewrap',
        'rewrite',
        'rhyme',
        'ribbon',
        'ribcage',
        'rice',
        'riches',
        'richly',
        'richness',
        'rickety',
        'ricotta',
        'riddance',
        'ridden',
        'ride',
        'riding',
        'rifling',
        'rift',
        'rigging',
        'rigid',
        'rigor',
        'rimless',
        'rimmed',
        'rind',
        'rink',
        'rinse',
        'rinsing',
        'riot',
        'ripcord',
        'ripeness',
        'ripening',
        'ripping',
        'ripple',
        'rippling',
        'riptide',
        'rise',
        'rising',
        'risk',
        'risotto',
        'ritalin',
        'ritzy',
        'rival',
        'riverbank',
        'riverbed',
        'riverboat',
        'riverside',
        'riveter',
        'riveting',
        'roamer',
        'roaming',
        'roast',
        'robbing',
        'robe',
        'robin',
        'robotics',
        'robust',
        'rockband',
        'rocker',
        'rocket',
        'rockfish',
        'rockiness',
        'rocking',
        'rocklike',
        'rockslide',
        'rockstar',
        'rocky',
        'rogue',
        'roman',
        'romp',
        'rope',
        'roping',
        'roster',
        'rosy',
        'rotten',
        'rotting',
        'rotunda',
        'roulette',
        'rounding',
        'roundish',
        'roundness',
        'roundup',
        'roundworm',
        'routine',
        'routing',
        'rover',
        'roving',
        'royal',
        'rubbed',
        'rubber',
        'rubbing',
        'rubble',
        'rubdown',
        'ruby',
        'ruckus',
        'rudder',
        'rug',
        'ruined',
        'rule',
        'rumble',
        'rumbling',
        'rummage',
        'rumor',
        'runaround',
        'rundown',
        'runner',
        'running',
        'runny',
        'runt',
        'runway',
        'rupture',
        'rural',
        'ruse',
        'rush',
        'rust',
        'rut',
        'sabbath',
        'sabotage',
        'sacrament',
        'sacred',
        'sacrifice',
        'sadden',
        'saddlebag',
        'saddled',
        'saddling',
        'sadly',
        'sadness',
        'safari',
        'safeguard',
        'safehouse',
        'safely',
        'safeness',
        'saffron',
        'saga',
        'sage',
        'sagging',
        'saggy',
        'said',
        'saint',
        'sake',
        'salad',
        'salami',
        'salaried',
        'salary',
        'saline',
        'salon',
        'saloon',
        'salsa',
        'salt',
        'salutary',
        'salute',
        'salvage',
        'salvaging',
        'salvation',
        'same',
        'sample',
        'sampling',
        'sanction',
        'sanctity',
        'sanctuary',
        'sandal',
        'sandbag',
        'sandbank',
        'sandbar',
        'sandblast',
        'sandbox',
        'sanded',
        'sandfish',
        'sanding',
        'sandlot',
        'sandpaper',
        'sandpit',
        'sandstone',
        'sandstorm',
        'sandworm',
        'sandy',
        'sanitary',
        'sanitizer',
        'sank',
        'santa',
        'sapling',
        'sappiness',
        'sappy',
        'sarcasm',
        'sarcastic',
        'sardine',
        'sash',
        'sasquatch',
        'sassy',
        'satchel',
        'satiable',
        'satin',
        'satirical',
        'satisfied',
        'satisfy',
        'saturate',
        'saturday',
        'sauciness',
        'saucy',
        'sauna',
        'savage',
        'savanna',
        'saved',
        'savings',
        'savior',
        'savor',
        'saxophone',
        'say',
        'scabbed',
        'scabby',
        'scalded',
        'scalding',
        'scale',
        'scaling',
        'scallion',
        'scallop',
        'scalping',
        'scam',
        'scandal',
        'scanner',
        'scanning',
        'scant',
        'scapegoat',
        'scarce',
        'scarcity',
        'scarecrow',
        'scared',
        'scarf',
        'scarily',
        'scariness',
        'scarring',
        'scary',
        'scavenger',
        'scenic',
        'schedule',
        'schematic',
        'scheme',
        'scheming',
        'schilling',
        'schnapps',
        'scholar',
        'science',
        'scientist',
        'scion',
        'scoff',
        'scolding',
        'scone',
        'scoop',
        'scooter',
        'scope',
        'scorch',
        'scorebook',
        'scorecard',
        'scored',
        'scoreless',
        'scorer',
        'scoring',
        'scorn',
        'scorpion',
        'scotch',
        'scoundrel',
        'scoured',
        'scouring',
        'scouting',
        'scouts',
        'scowling',
        'scrabble',
        'scraggly',
        'scrambled',
        'scrambler',
        'scrap',
        'scratch',
        'scrawny',
        'screen',
        'scribble',
        'scribe',
        'scribing',
        'scrimmage',
        'script',
        'scroll',
        'scrooge',
        'scrounger',
        'scrubbed',
        'scrubber',
        'scruffy',
        'scrunch',
        'scrutiny',
        'scuba',
        'scuff',
        'sculptor',
        'sculpture',
        'scurvy',
        'scuttle',
        'secluded',
        'secluding',
        'seclusion',
        'second',
        'secrecy',
        'secret',
        'sectional',
        'sector',
        'secular',
        'securely',
        'security',
        'sedan',
        'sedate',
        'sedation',
        'sedative',
        'sediment',
        'seduce',
        'seducing',
        'segment',
        'seismic',
        'seizing',
        'seldom',
        'selected',
        'selection',
        'selective',
        'selector',
        'self',
        'seltzer',
        'semantic',
        'semester',
        'semicolon',
        'semifinal',
        'seminar',
        'semisoft',
        'semisweet',
        'senate',
        'senator',
        'send',
        'senior',
        'senorita',
        'sensation',
        'sensitive',
        'sensitize',
        'sensually',
        'sensuous',
        'sepia',
        'september',
        'septic',
        'septum',
        'sequel',
        'sequence',
        'sequester',
        'series',
        'sermon',
        'serotonin',
        'serpent',
        'serrated',
        'serve',
        'service',
        'serving',
        'sesame',
        'sessions',
        'setback',
        'setting',
        'settle',
        'settling',
        'setup',
        'sevenfold',
        'seventeen',
        'seventh',
        'seventy',
        'severity',
        'shabby',
        'shack',
        'shaded',
        'shadily',
        'shadiness',
        'shading',
        'shadow',
        'shady',
        'shaft',
        'shakable',
        'shakily',
        'shakiness',
        'shaking',
        'shaky',
        'shale',
        'shallot',
        'shallow',
        'shame',
        'shampoo',
        'shamrock',
        'shank',
        'shanty',
        'shape',
        'shaping',
        'share',
        'sharpener',
        'sharper',
        'sharpie',
        'sharply',
        'sharpness',
        'shawl',
        'sheath',
        'shed',
        'sheep',
        'sheet',
        'shelf',
        'shell',
        'shelter',
        'shelve',
        'shelving',
        'sherry',
        'shield',
        'shifter',
        'shifting',
        'shiftless',
        'shifty',
        'shimmer',
        'shimmy',
        'shindig',
        'shine',
        'shingle',
        'shininess',
        'shining',
        'shiny',
        'ship',
        'shirt',
        'shivering',
        'shock',
        'shone',
        'shoplift',
        'shopper',
        'shopping',
        'shoptalk',
        'shore',
        'shortage',
        'shortcake',
        'shortcut',
        'shorten',
        'shorter',
        'shorthand',
        'shortlist',
        'shortly',
        'shortness',
        'shorts',
        'shortwave',
        'shorty',
        'shout',
        'shove',
        'showbiz',
        'showcase',
        'showdown',
        'shower',
        'showgirl',
        'showing',
        'showman',
        'shown',
        'showoff',
        'showpiece',
        'showplace',
        'showroom',
        'showy',
        'shrank',
        'shrapnel',
        'shredder',
        'shredding',
        'shrewdly',
        'shriek',
        'shrill',
        'shrimp',
        'shrine',
        'shrink',
        'shrivel',
        'shrouded',
        'shrubbery',
        'shrubs',
        'shrug',
        'shrunk',
        'shucking',
        'shudder',
        'shuffle',
        'shuffling',
        'shun',
        'shush',
        'shut',
        'shy',
        'siamese',
        'siberian',
        'sibling',
        'siding',
        'sierra',
        'siesta',
        'sift',
        'sighing',
        'silenced',
        'silencer',
        'silent',
        'silica',
        'silicon',
        'silk',
        'silliness',
        'silly',
        'silo',
        'silt',
        'silver',
        'similarly',
        'simile',
        'simmering',
        'simple',
        'simplify',
        'simply',
        'sincere',
        'sincerity',
        'singer',
        'singing',
        'single',
        'singular',
        'sinister',
        'sinless',
        'sinner',
        'sinuous',
        'sip',
        'siren',
        'sister',
        'sitcom',
        'sitter',
        'sitting',
        'situated',
        'situation',
        'sixfold',
        'sixteen',
        'sixth',
        'sixties',
        'sixtieth',
        'sixtyfold',
        'sizable',
        'sizably',
        'size',
        'sizing',
        'sizzle',
        'sizzling',
        'skater',
        'skating',
        'skedaddle',
        'skeletal',
        'skeleton',
        'skeptic',
        'sketch',
        'skewed',
        'skewer',
        'skid',
        'skied',
        'skier',
        'skies',
        'skiing',
        'skilled',
        'skillet',
        'skillful',
        'skimmed',
        'skimmer',
        'skimming',
        'skimpily',
        'skincare',
        'skinhead',
        'skinless',
        'skinning',
        'skinny',
        'skintight',
        'skipper',
        'skipping',
        'skirmish',
        'skirt',
        'skittle',
        'skydiver',
        'skylight',
        'skyline',
        'skype',
        'skyrocket',
        'skyward',
        'slab',
        'slacked',
        'slacker',
        'slacking',
        'slackness',
        'slacks',
        'slain',
        'slam',
        'slander',
        'slang',
        'slapping',
        'slapstick',
        'slashed',
        'slashing',
        'slate',
        'slather',
        'slaw',
        'sled',
        'sleek',
        'sleep',
        'sleet',
        'sleeve',
        'slept',
        'sliceable',
        'sliced',
        'slicer',
        'slicing',
        'slick',
        'slider',
        'slideshow',
        'sliding',
        'slighted',
        'slighting',
        'slightly',
        'slimness',
        'slimy',
        'slinging',
        'slingshot',
        'slinky',
        'slip',
        'slit',
        'sliver',
        'slobbery',
        'slogan',
        'sloped',
        'sloping',
        'sloppily',
        'sloppy',
        'slot',
        'slouching',
        'slouchy',
        'sludge',
        'slug',
        'slum',
        'slurp',
        'slush',
        'sly',
        'small',
        'smartly',
        'smartness',
        'smasher',
        'smashing',
        'smashup',
        'smell',
        'smelting',
        'smile',
        'smilingly',
        'smirk',
        'smite',
        'smith',
        'smitten',
        'smock',
        'smog',
        'smoked',
        'smokeless',
        'smokiness',
        'smoking',
        'smoky',
        'smolder',
        'smooth',
        'smother',
        'smudge',
        'smudgy',
        'smuggler',
        'smuggling',
        'smugly',
        'smugness',
        'snack',
        'snagged',
        'snaking',
        'snap',
        'snare',
        'snarl',
        'snazzy',
        'sneak',
        'sneer',
        'sneeze',
        'sneezing',
        'snide',
        'sniff',
        'snippet',
        'snipping',
        'snitch',
        'snooper',
        'snooze',
        'snore',
        'snoring',
        'snorkel',
        'snort',
        'snout',
        'snowbird',
        'snowboard',
        'snowbound',
        'snowcap',
        'snowdrift',
        'snowdrop',
        'snowfall',
        'snowfield',
        'snowflake',
        'snowiness',
        'snowless',
        'snowman',
        'snowplow',
        'snowshoe',
        'snowstorm',
        'snowsuit',
        'snowy',
        'snub',
        'snuff',
        'snuggle',
        'snugly',
        'snugness',
        'speak',
        'spearfish',
        'spearhead',
        'spearman',
        'spearmint',
        'species',
        'specimen',
        'specked',
        'speckled',
        'specks',
        'spectacle',
        'spectator',
        'spectrum',
        'speculate',
        'speech',
        'speed',
        'spellbind',
        'speller',
        'spelling',
        'spendable',
        'spender',
        'spending',
        'spent',
        'spew',
        'sphere',
        'spherical',
        'sphinx',
        'spider',
        'spied',
        'spiffy',
        'spill',
        'spilt',
        'spinach',
        'spinal',
        'spindle',
        'spinner',
        'spinning',
        'spinout',
        'spinster',
        'spiny',
        'spiral',
        'spirited',
        'spiritism',
        'spirits',
        'spiritual',
        'splashed',
        'splashing',
        'splashy',
        'splatter',
        'spleen',
        'splendid',
        'splendor',
        'splice',
        'splicing',
        'splinter',
        'splotchy',
        'splurge',
        'spoilage',
        'spoiled',
        'spoiler',
        'spoiling',
        'spoils',
        'spoken',
        'spokesman',
        'sponge',
        'spongy',
        'sponsor',
        'spoof',
        'spookily',
        'spooky',
        'spool',
        'spoon',
        'spore',
        'sporting',
        'sports',
        'sporty',
        'spotless',
        'spotlight',
        'spotted',
        'spotter',
        'spotting',
        'spotty',
        'spousal',
        'spouse',
        'spout',
        'sprain',
        'sprang',
        'sprawl',
        'spray',
        'spree',
        'sprig',
        'spring',
        'sprinkled',
        'sprinkler',
        'sprint',
        'sprite',
        'sprout',
        'spruce',
        'sprung',
        'spry',
        'spud',
        'spur',
        'sputter',
        'spyglass',
        'squabble',
        'squad',
        'squall',
        'squander',
        'squash',
        'squatted',
        'squatter',
        'squatting',
        'squeak',
        'squealer',
        'squealing',
        'squeamish',
        'squeegee',
        'squeeze',
        'squeezing',
        'squid',
        'squiggle',
        'squiggly',
        'squint',
        'squire',
        'squirt',
        'squishier',
        'squishy',
        'stability',
        'stabilize',
        'stable',
        'stack',
        'stadium',
        'staff',
        'stage',
        'staging',
        'stagnant',
        'stagnate',
        'stainable',
        'stained',
        'staining',
        'stainless',
        'stalemate',
        'staleness',
        'stalling',
        'stallion',
        'stamina',
        'stammer',
        'stamp',
        'stand',
        'stank',
        'staple',
        'stapling',
        'starboard',
        'starch',
        'stardom',
        'stardust',
        'starfish',
        'stargazer',
        'staring',
        'stark',
        'starless',
        'starlet',
        'starlight',
        'starlit',
        'starring',
        'starry',
        'starship',
        'starter',
        'starting',
        'startle',
        'startling',
        'startup',
        'starved',
        'starving',
        'stash',
        'state',
        'static',
        'statistic',
        'statue',
        'stature',
        'status',
        'statute',
        'statutory',
        'staunch',
        'stays',
        'steadfast',
        'steadier',
        'steadily',
        'steadying',
        'steam',
        'steed',
        'steep',
        'steerable',
        'steering',
        'steersman',
        'stegosaur',
        'stellar',
        'stem',
        'stench',
        'stencil',
        'step',
        'stereo',
        'sterile',
        'sterility',
        'sterilize',
        'sterling',
        'sternness',
        'sternum',
        'stew',
        'stick',
        'stiffen',
        'stiffly',
        'stiffness',
        'stifle',
        'stifling',
        'stillness',
        'stilt',
        'stimulant',
        'stimulate',
        'stimuli',
        'stimulus',
        'stinger',
        'stingily',
        'stinging',
        'stingray',
        'stingy',
        'stinking',
        'stinky',
        'stipend',
        'stipulate',
        'stir',
        'stitch',
        'stock',
        'stoic',
        'stoke',
        'stole',
        'stomp',
        'stonewall',
        'stoneware',
        'stonework',
        'stoning',
        'stony',
        'stood',
        'stooge',
        'stool',
        'stoop',
        'stoplight',
        'stoppable',
        'stoppage',
        'stopped',
        'stopper',
        'stopping',
        'stopwatch',
        'storable',
        'storage',
        'storeroom',
        'storewide',
        'storm',
        'stout',
        'stove',
        'stowaway',
        'stowing',
        'straddle',
        'straggler',
        'strained',
        'strainer',
        'straining',
        'strangely',
        'stranger',
        'strangle',
        'strategic',
        'strategy',
        'stratus',
        'straw',
        'stray',
        'streak',
        'stream',
        'street',
        'strength',
        'strenuous',
        'strep',
        'stress',
        'stretch',
        'strewn',
        'stricken',
        'strict',
        'stride',
        'strife',
        'strike',
        'striking',
        'strive',
        'striving',
        'strobe',
        'strode',
        'stroller',
        'strongbox',
        'strongly',
        'strongman',
        'struck',
        'structure',
        'strudel',
        'struggle',
        'strum',
        'strung',
        'strut',
        'stubbed',
        'stubble',
        'stubbly',
        'stubborn',
        'stucco',
        'stuck',
        'student',
        'studied',
        'studio',
        'study',
        'stuffed',
        'stuffing',
        'stuffy',
        'stumble',
        'stumbling',
        'stump',
        'stung',
        'stunned',
        'stunner',
        'stunning',
        'stunt',
        'stupor',
        'sturdily',
        'sturdy',
        'styling',
        'stylishly',
        'stylist',
        'stylized',
        'stylus',
        'suave',
        'subarctic',
        'subatomic',
        'subdivide',
        'subdued',
        'subduing',
        'subfloor',
        'subgroup',
        'subheader',
        'subject',
        'sublease',
        'sublet',
        'sublevel',
        'sublime',
        'submarine',
        'submerge',
        'submersed',
        'submitter',
        'subpanel',
        'subpar',
        'subplot',
        'subprime',
        'subscribe',
        'subscript',
        'subsector',
        'subside',
        'subsiding',
        'subsidize',
        'subsidy',
        'subsoil',
        'subsonic',
        'substance',
        'subsystem',
        'subtext',
        'subtitle',
        'subtly',
        'subtotal',
        'subtract',
        'subtype',
        'suburb',
        'subway',
        'subwoofer',
        'subzero',
        'succulent',
        'such',
        'suction',
        'sudden',
        'sudoku',
        'suds',
        'sufferer',
        'suffering',
        'suffice',
        'suffix',
        'suffocate',
        'suffrage',
        'sugar',
        'suggest',
        'suing',
        'suitable',
        'suitably',
        'suitcase',
        'suitor',
        'sulfate',
        'sulfide',
        'sulfite',
        'sulfur',
        'sulk',
        'sullen',
        'sulphate',
        'sulphuric',
        'sultry',
        'superbowl',
        'superglue',
        'superhero',
        'superior',
        'superjet',
        'superman',
        'supermom',
        'supernova',
        'supervise',
        'supper',
        'supplier',
        'supply',
        'support',
        'supremacy',
        'supreme',
        'surcharge',
        'surely',
        'sureness',
        'surface',
        'surfacing',
        'surfboard',
        'surfer',
        'surgery',
        'surgical',
        'surging',
        'surname',
        'surpass',
        'surplus',
        'surprise',
        'surreal',
        'surrender',
        'surrogate',
        'surround',
        'survey',
        'survival',
        'survive',
        'surviving',
        'survivor',
        'sushi',
        'suspect',
        'suspend',
        'suspense',
        'sustained',
        'sustainer',
        'swab',
        'swaddling',
        'swagger',
        'swampland',
        'swan',
        'swapping',
        'swarm',
        'sway',
        'swear',
        'sweat',
        'sweep',
        'swell',
        'swept',
        'swerve',
        'swifter',
        'swiftly',
        'swiftness',
        'swimmable',
        'swimmer',
        'swimming',
        'swimsuit',
        'swimwear',
        'swinger',
        'swinging',
        'swipe',
        'swirl',
        'switch',
        'swivel',
        'swizzle',
        'swooned',
        'swoop',
        'swoosh',
        'swore',
        'sworn',
        'swung',
        'sycamore',
        'sympathy',
        'symphonic',
        'symphony',
        'symptom',
        'synapse',
        'syndrome',
        'synergy',
        'synopses',
        'synopsis',
        'synthesis',
        'synthetic',
        'syrup',
        'system',
        't-shirt',
        'tabasco',
        'tabby',
        'tableful',
        'tables',
        'tablet',
        'tableware',
        'tabloid',
        'tackiness',
        'tacking',
        'tackle',
        'tackling',
        'tacky',
        'taco',
        'tactful',
        'tactical',
        'tactics',
        'tactile',
        'tactless',
        'tadpole',
        'taekwondo',
        'tag',
        'tainted',
        'take',
        'taking',
        'talcum',
        'talisman',
        'tall',
        'talon',
        'tamale',
        'tameness',
        'tamer',
        'tamper',
        'tank',
        'tanned',
        'tannery',
        'tanning',
        'tantrum',
        'tapeless',
        'tapered',
        'tapering',
        'tapestry',
        'tapioca',
        'tapping',
        'taps',
        'tarantula',
        'target',
        'tarmac',
        'tarnish',
        'tarot',
        'tartar',
        'tartly',
        'tartness',
        'task',
        'tassel',
        'taste',
        'tastiness',
        'tasting',
        'tasty',
        'tattered',
        'tattle',
        'tattling',
        'tattoo',
        'taunt',
        'tavern',
        'thank',
        'that',
        'thaw',
        'theater',
        'theatrics',
        'thee',
        'theft',
        'theme',
        'theology',
        'theorize',
        'thermal',
        'thermos',
        'thesaurus',
        'these',
        'thesis',
        'thespian',
        'thicken',
        'thicket',
        'thickness',
        'thieving',
        'thievish',
        'thigh',
        'thimble',
        'thing',
        'think',
        'thinly',
        'thinner',
        'thinness',
        'thinning',
        'thirstily',
        'thirsting',
        'thirsty',
        'thirteen',
        'thirty',
        'thong',
        'thorn',
        'those',
        'thousand',
        'thrash',
        'thread',
        'threaten',
        'threefold',
        'thrift',
        'thrill',
        'thrive',
        'thriving',
        'throat',
        'throbbing',
        'throng',
        'throttle',
        'throwaway',
        'throwback',
        'thrower',
        'throwing',
        'thud',
        'thumb',
        'thumping',
        'thursday',
        'thus',
        'thwarting',
        'thyself',
        'tiara',
        'tibia',
        'tidal',
        'tidbit',
        'tidiness',
        'tidings',
        'tidy',
        'tiger',
        'tighten',
        'tightly',
        'tightness',
        'tightrope',
        'tightwad',
        'tigress',
        'tile',
        'tiling',
        'till',
        'tilt',
        'timid',
        'timing',
        'timothy',
        'tinderbox',
        'tinfoil',
        'tingle',
        'tingling',
        'tingly',
        'tinker',
        'tinkling',
        'tinsel',
        'tinsmith',
        'tint',
        'tinwork',
        'tiny',
        'tipoff',
        'tipped',
        'tipper',
        'tipping',
        'tiptoeing',
        'tiptop',
        'tiring',
        'tissue',
        'trace',
        'tracing',
        'track',
        'traction',
        'tractor',
        'trade',
        'trading',
        'tradition',
        'traffic',
        'tragedy',
        'trailing',
        'trailside',
        'train',
        'traitor',
        'trance',
        'tranquil',
        'transfer',
        'transform',
        'translate',
        'transpire',
        'transport',
        'transpose',
        'trapdoor',
        'trapeze',
        'trapezoid',
        'trapped',
        'trapper',
        'trapping',
        'traps',
        'trash',
        'travel',
        'traverse',
        'travesty',
        'tray',
        'treachery',
        'treading',
        'treadmill',
        'treason',
        'treat',
        'treble',
        'tree',
        'trekker',
        'tremble',
        'trembling',
        'tremor',
        'trench',
        'trend',
        'trespass',
        'triage',
        'trial',
        'triangle',
        'tribesman',
        'tribunal',
        'tribune',
        'tributary',
        'tribute',
        'triceps',
        'trickery',
        'trickily',
        'tricking',
        'trickle',
        'trickster',
        'tricky',
        'tricolor',
        'tricycle',
        'trident',
        'tried',
        'trifle',
        'trifocals',
        'trillion',
        'trilogy',
        'trimester',
        'trimmer',
        'trimming',
        'trimness',
        'trinity',
        'trio',
        'tripod',
        'tripping',
        'triumph',
        'trivial',
        'trodden',
        'trolling',
        'trombone',
        'trophy',
        'tropical',
        'tropics',
        'trouble',
        'troubling',
        'trough',
        'trousers',
        'trout',
        'trowel',
        'truce',
        'truck',
        'truffle',
        'trump',
        'trunks',
        'trustable',
        'trustee',
        'trustful',
        'trusting',
        'trustless',
        'truth',
        'try',
        'tubby',
        'tubeless',
        'tubular',
        'tucking',
        'tuesday',
        'tug',
        'tuition',
        'tulip',
        'tumble',
        'tumbling',
        'tummy',
        'turban',
        'turbine',
        'turbofan',
        'turbojet',
        'turbulent',
        'turf',
        'turkey',
        'turmoil',
        'turret',
        'turtle',
        'tusk',
        'tutor',
        'tutu',
        'tux',
        'tweak',
        'tweed',
        'tweet',
        'tweezers',
        'twelve',
        'twentieth',
        'twenty',
        'twerp',
        'twice',
        'twiddle',
        'twiddling',
        'twig',
        'twilight',
        'twine',
        'twins',
        'twirl',
        'twistable',
        'twisted',
        'twister',
        'twisting',
        'twisty',
        'twitch',
        'twitter',
        'tycoon',
        'tying',
        'tyke',
        'udder',
        'ultimate',
        'ultimatum',
        'ultra',
        'umbilical',
        'umbrella',
        'umpire',
        'unabashed',
        'unable',
        'unadorned',
        'unadvised',
        'unafraid',
        'unaired',
        'unaligned',
        'unaltered',
        'unarmored',
        'unashamed',
        'unaudited',
        'unawake',
        'unaware',
        'unbaked',
        'unbalance',
        'unbeaten',
        'unbend',
        'unbent',
        'unbiased',
        'unbitten',
        'unblended',
        'unblessed',
        'unblock',
        'unbolted',
        'unbounded',
        'unboxed',
        'unbraided',
        'unbridle',
        'unbroken',
        'unbuckled',
        'unbundle',
        'unburned',
        'unbutton',
        'uncanny',
        'uncapped',
        'uncaring',
        'uncertain',
        'unchain',
        'unchanged',
        'uncharted',
        'uncheck',
        'uncivil',
        'unclad',
        'unclaimed',
        'unclamped',
        'unclasp',
        'uncle',
        'unclip',
        'uncloak',
        'unclog',
        'unclothed',
        'uncoated',
        'uncoiled',
        'uncolored',
        'uncombed',
        'uncommon',
        'uncooked',
        'uncork',
        'uncorrupt',
        'uncounted',
        'uncouple',
        'uncouth',
        'uncover',
        'uncross',
        'uncrown',
        'uncrushed',
        'uncured',
        'uncurious',
        'uncurled',
        'uncut',
        'undamaged',
        'undated',
        'undaunted',
        'undead',
        'undecided',
        'undefined',
        'underage',
        'underarm',
        'undercoat',
        'undercook',
        'undercut',
        'underdog',
        'underdone',
        'underfed',
        'underfeed',
        'underfoot',
        'undergo',
        'undergrad',
        'underhand',
        'underline',
        'underling',
        'undermine',
        'undermost',
        'underpaid',
        'underpass',
        'underpay',
        'underrate',
        'undertake',
        'undertone',
        'undertook',
        'undertow',
        'underuse',
        'underwear',
        'underwent',
        'underwire',
        'undesired',
        'undiluted',
        'undivided',
        'undocked',
        'undoing',
        'undone',
        'undrafted',
        'undress',
        'undrilled',
        'undusted',
        'undying',
        'unearned',
        'unearth',
        'unease',
        'uneasily',
        'uneasy',
        'uneatable',
        'uneaten',
        'unedited',
        'unelected',
        'unending',
        'unengaged',
        'unenvied',
        'unequal',
        'unethical',
        'uneven',
        'unexpired',
        'unexposed',
        'unfailing',
        'unfair',
        'unfasten',
        'unfazed',
        'unfeeling',
        'unfiled',
        'unfilled',
        'unfitted',
        'unfitting',
        'unfixable',
        'unfixed',
        'unflawed',
        'unfocused',
        'unfold',
        'unfounded',
        'unframed',
        'unfreeze',
        'unfrosted',
        'unfrozen',
        'unfunded',
        'unglazed',
        'ungloved',
        'unglue',
        'ungodly',
        'ungraded',
        'ungreased',
        'unguarded',
        'unguided',
        'unhappily',
        'unhappy',
        'unharmed',
        'unhealthy',
        'unheard',
        'unhearing',
        'unheated',
        'unhelpful',
        'unhidden',
        'unhinge',
        'unhitched',
        'unholy',
        'unhook',
        'unicorn',
        'unicycle',
        'unified',
        'unifier',
        'uniformed',
        'uniformly',
        'unify',
        'unimpeded',
        'uninjured',
        'uninstall',
        'uninsured',
        'uninvited',
        'union',
        'uniquely',
        'unisexual',
        'unison',
        'unissued',
        'unit',
        'universal',
        'universe',
        'unjustly',
        'unkempt',
        'unkind',
        'unknotted',
        'unknowing',
        'unknown',
        'unlaced',
        'unlatch',
        'unlawful',
        'unleaded',
        'unlearned',
        'unleash',
        'unless',
        'unleveled',
        'unlighted',
        'unlikable',
        'unlimited',
        'unlined',
        'unlinked',
        'unlisted',
        'unlit',
        'unlivable',
        'unloaded',
        'unloader',
        'unlocked',
        'unlocking',
        'unlovable',
        'unloved',
        'unlovely',
        'unloving',
        'unluckily',
        'unlucky',
        'unmade',
        'unmanaged',
        'unmanned',
        'unmapped',
        'unmarked',
        'unmasked',
        'unmasking',
        'unmatched',
        'unmindful',
        'unmixable',
        'unmixed',
        'unmolded',
        'unmoral',
        'unmovable',
        'unmoved',
        'unmoving',
        'unnamable',
        'unnamed',
        'unnatural',
        'unneeded',
        'unnerve',
        'unnerving',
        'unnoticed',
        'unopened',
        'unopposed',
        'unpack',
        'unpadded',
        'unpaid',
        'unpainted',
        'unpaired',
        'unpaved',
        'unpeeled',
        'unpicked',
        'unpiloted',
        'unpinned',
        'unplanned',
        'unplanted',
        'unpleased',
        'unpledged',
        'unplowed',
        'unplug',
        'unpopular',
        'unproven',
        'unquote',
        'unranked',
        'unrated',
        'unraveled',
        'unreached',
        'unread',
        'unreal',
        'unreeling',
        'unrefined',
        'unrelated',
        'unrented',
        'unrest',
        'unretired',
        'unrevised',
        'unrigged',
        'unripe',
        'unrivaled',
        'unroasted',
        'unrobed',
        'unroll',
        'unruffled',
        'unruly',
        'unrushed',
        'unsaddle',
        'unsafe',
        'unsaid',
        'unsalted',
        'unsaved',
        'unsavory',
        'unscathed',
        'unscented',
        'unscrew',
        'unsealed',
        'unseated',
        'unsecured',
        'unseeing',
        'unseemly',
        'unseen',
        'unselect',
        'unselfish',
        'unsent',
        'unsettled',
        'unshackle',
        'unshaken',
        'unshaved',
        'unshaven',
        'unsheathe',
        'unshipped',
        'unsightly',
        'unsigned',
        'unskilled',
        'unsliced',
        'unsmooth',
        'unsnap',
        'unsocial',
        'unsoiled',
        'unsold',
        'unsolved',
        'unsorted',
        'unspoiled',
        'unspoken',
        'unstable',
        'unstaffed',
        'unstamped',
        'unsteady',
        'unsterile',
        'unstirred',
        'unstitch',
        'unstopped',
        'unstuck',
        'unstuffed',
        'unstylish',
        'unsubtle',
        'unsubtly',
        'unsuited',
        'unsure',
        'unsworn',
        'untagged',
        'untainted',
        'untaken',
        'untamed',
        'untangled',
        'untapped',
        'untaxed',
        'unthawed',
        'unthread',
        'untidy',
        'untie',
        'until',
        'untimed',
        'untimely',
        'untitled',
        'untoasted',
        'untold',
        'untouched',
        'untracked',
        'untrained',
        'untreated',
        'untried',
        'untrimmed',
        'untrue',
        'untruth',
        'unturned',
        'untwist',
        'untying',
        'unusable',
        'unused',
        'unusual',
        'unvalued',
        'unvaried',
        'unvarying',
        'unveiled',
        'unveiling',
        'unvented',
        'unviable',
        'unvisited',
        'unvocal',
        'unwanted',
        'unwarlike',
        'unwary',
        'unwashed',
        'unwatched',
        'unweave',
        'unwed',
        'unwelcome',
        'unwell',
        'unwieldy',
        'unwilling',
        'unwind',
        'unwired',
        'unwitting',
        'unwomanly',
        'unworldly',
        'unworn',
        'unworried',
        'unworthy',
        'unwound',
        'unwoven',
        'unwrapped',
        'unwritten',
        'unzip',
        'upbeat',
        'upchuck',
        'upcoming',
        'upcountry',
        'update',
        'upfront',
        'upgrade',
        'upheaval',
        'upheld',
        'uphill',
        'uphold',
        'uplifted',
        'uplifting',
        'upload',
        'upon',
        'upper',
        'upright',
        'uprising',
        'upriver',
        'uproar',
        'uproot',
        'upscale',
        'upside',
        'upstage',
        'upstairs',
        'upstart',
        'upstate',
        'upstream',
        'upstroke',
        'upswing',
        'uptake',
        'uptight',
        'uptown',
        'upturned',
        'upward',
        'upwind',
        'uranium',
        'urban',
        'urchin',
        'urethane',
        'urgency',
        'urgent',
        'urging',
        'urologist',
        'urology',
        'usable',
        'usage',
        'useable',
        'used',
        'uselessly',
        'user',
        'usher',
        'usual',
        'utensil',
        'utility',
        'utilize',
        'utmost',
        'utopia',
        'utter',
        'vacancy',
        'vacant',
        'vacate',
        'vacation',
        'vagabond',
        'vagrancy',
        'vagrantly',
        'vaguely',
        'vagueness',
        'valiant',
        'valid',
        'valium',
        'valley',
        'valuables',
        'value',
        'vanilla',
        'vanish',
        'vanity',
        'vanquish',
        'vantage',
        'vaporizer',
        'variable',
        'variably',
        'varied',
        'variety',
        'various',
        'varmint',
        'varnish',
        'varsity',
        'varying',
        'vascular',
        'vaseline',
        'vastly',
        'vastness',
        'veal',
        'vegan',
        'veggie',
        'vehicular',
        'velcro',
        'velocity',
        'velvet',
        'vendetta',
        'vending',
        'vendor',
        'veneering',
        'vengeful',
        'venomous',
        'ventricle',
        'venture',
        'venue',
        'venus',
        'verbalize',
        'verbally',
        'verbose',
        'verdict',
        'verify',
        'verse',
        'version',
        'versus',
        'vertebrae',
        'vertical',
        'vertigo',
        'very',
        'vessel',
        'vest',
        'veteran',
        'veto',
        'vexingly',
        'viability',
        'viable',
        'vibes',
        'vice',
        'vicinity',
        'victory',
        'video',
        'viewable',
        'viewer',
        'viewing',
        'viewless',
        'viewpoint',
        'vigorous',
        'village',
        'villain',
        'vindicate',
        'vineyard',
        'vintage',
        'violate',
        'violation',
        'violator',
        'violet',
        'violin',
        'viper',
        'viral',
        'virtual',
        'virtuous',
        'virus',
        'visa',
        'viscosity',
        'viscous',
        'viselike',
        'visible',
        'visibly',
        'vision',
        'visiting',
        'visitor',
        'visor',
        'vista',
        'vitality',
        'vitalize',
        'vitally',
        'vitamins',
        'vivacious',
        'vividly',
        'vividness',
        'vixen',
        'vocalist',
        'vocalize',
        'vocally',
        'vocation',
        'voice',
        'voicing',
        'void',
        'volatile',
        'volley',
        'voltage',
        'volumes',
        'voter',
        'voting',
        'voucher',
        'vowed',
        'vowel',
        'voyage',
        'wackiness',
        'wad',
        'wafer',
        'waffle',
        'waged',
        'wager',
        'wages',
        'waggle',
        'wagon',
        'wake',
        'waking',
        'walk',
        'walmart',
        'walnut',
        'walrus',
        'waltz',
        'wand',
        'wannabe',
        'wanted',
        'wanting',
        'wasabi',
        'washable',
        'washbasin',
        'washboard',
        'washbowl',
        'washcloth',
        'washday',
        'washed',
        'washer',
        'washhouse',
        'washing',
        'washout',
        'washroom',
        'washstand',
        'washtub',
        'wasp',
        'wasting',
        'watch',
        'water',
        'waviness',
        'waving',
        'wavy',
        'whacking',
        'whacky',
        'wham',
        'wharf',
        'wheat',
        'whenever',
        'whiff',
        'whimsical',
        'whinny',
        'whiny',
        'whisking',
        'whoever',
        'whole',
        'whomever',
        'whoopee',
        'whooping',
        'whoops',
        'why',
        'wick',
        'widely',
        'widen',
        'widget',
        'widow',
        'width',
        'wieldable',
        'wielder',
        'wife',
        'wifi',
        'wikipedia',
        'wildcard',
        'wildcat',
        'wilder',
        'wildfire',
        'wildfowl',
        'wildland',
        'wildlife',
        'wildly',
        'wildness',
        'willed',
        'willfully',
        'willing',
        'willow',
        'willpower',
        'wilt',
        'wimp',
        'wince',
        'wincing',
        'wind',
        'wing',
        'winking',
        'winner',
        'winnings',
        'winter',
        'wipe',
        'wired',
        'wireless',
        'wiring',
        'wiry',
        'wisdom',
        'wise',
        'wish',
        'wisplike',
        'wispy',
        'wistful',
        'wizard',
        'wobble',
        'wobbling',
        'wobbly',
        'wok',
        'wolf',
        'wolverine',
        'womanhood',
        'womankind',
        'womanless',
        'womanlike',
        'womanly',
        'womb',
        'woof',
        'wooing',
        'wool',
        'woozy',
        'word',
        'work',
        'worried',
        'worrier',
        'worrisome',
        'worry',
        'worsening',
        'worshiper',
        'worst',
        'wound',
        'woven',
        'wow',
        'wrangle',
        'wrath',
        'wreath',
        'wreckage',
        'wrecker',
        'wrecking',
        'wrench',
        'wriggle',
        'wriggly',
        'wrinkle',
        'wrinkly',
        'wrist',
        'writing',
        'written',
        'wrongdoer',
        'wronged',
        'wrongful',
        'wrongly',
        'wrongness',
        'wrought',
        'xbox',
        'xerox',
        'yahoo',
        'yam',
        'yanking',
        'yapping',
        'yard',
        'yarn',
        'yeah',
        'yearbook',
        'yearling',
        'yearly',
        'yearning',
        'yeast',
        'yelling',
        'yelp',
        'yen',
        'yesterday',
        'yiddish',
        'yield',
        'yin',
        'yippee',
        'yo-yo',
        'yodel',
        'yoga',
        'yogurt',
        'yonder',
        'yoyo',
        'yummy',
        'zap',
        'zealous',
        'zebra',
        'zen',
        'zeppelin',
        'zero',
        'zestfully',
        'zesty',
        'zigzagged',
        'zipfile',
        'zipping',
        'zippy',
        'zips',
        'zit',
        'zodiac',
        'zombie',
        'zone',
        'zoning',
        'zookeeper',
        'zoologist',
        'zoology',
        'zoom',
      ])),
    pa
  );
}
var Ns;
function wf() {
  if (Ns) return ga;
  ((Ns = 1),
    Object.defineProperty(ga, '__esModule', { value: !0 }),
    (ga.newSecureWords = void 0));
  const t = wo(),
    d = bf();
  async function u(a = 6) {
    let e = [];
    for (let r = 0; r < a; r++)
      e.push(
        d.wordlist[await (0, t.getSecureRandomNumber)(0, d.wordlist.length)],
      );
    return e;
  }
  return ((ga.newSecureWords = u), ga);
}
var ma = {},
  qs;
function vf() {
  if (qs) return ma;
  ((qs = 1),
    Object.defineProperty(ma, '__esModule', { value: !0 }),
    (ma.newSecurePassphrase = void 0));
  const t = Tn();
  async function d(u = 6) {
    return (await (0, t.newSecureWords)(u)).join('-');
  }
  return ((ma.newSecurePassphrase = d), ma);
}
var it = {},
  Ht = {},
  Ls;
function _f() {
  if (Ls) return Ht;
  ((Ls = 1),
    Object.defineProperty(Ht, '__esModule', { value: !0 }),
    (Ht.bitsToBytes = Ht.bytesToBits = Ht.lpad = void 0));
  function t(a, e, r) {
    for (; a.length < r;) a = e + a;
    return a;
  }
  Ht.lpad = t;
  function d(a) {
    let e = '';
    for (let r = 0; r < a.length; r++) {
      let n = a.at(r);
      e += t(n.toString(2), '0', 8);
    }
    return e;
  }
  Ht.bytesToBits = d;
  function u(a) {
    if (a.length % 8 !== 0) throw Error('Uneven bits');
    let e = [];
    for (; a.length > 0;)
      (e.push(parseInt(a.slice(0, 8), 2)), (a = a.slice(8)));
    return Buffer.from(e);
  }
  return ((Ht.bitsToBytes = u), Ht);
}
var ya = {},
  Vs;
function dc() {
  if (Vs) return ya;
  ((Vs = 1),
    Object.defineProperty(ya, '__esModule', { value: !0 }),
    (ya.wordlist = void 0));
  const t = [
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    'absent',
    'absorb',
    'abstract',
    'absurd',
    'abuse',
    'access',
    'accident',
    'account',
    'accuse',
    'achieve',
    'acid',
    'acoustic',
    'acquire',
    'across',
    'act',
    'action',
    'actor',
    'actress',
    'actual',
    'adapt',
    'add',
    'addict',
    'address',
    'adjust',
    'admit',
    'adult',
    'advance',
    'advice',
    'aerobic',
    'affair',
    'afford',
    'afraid',
    'again',
    'age',
    'agent',
    'agree',
    'ahead',
    'aim',
    'air',
    'airport',
    'aisle',
    'alarm',
    'album',
    'alcohol',
    'alert',
    'alien',
    'all',
    'alley',
    'allow',
    'almost',
    'alone',
    'alpha',
    'already',
    'also',
    'alter',
    'always',
    'amateur',
    'amazing',
    'among',
    'amount',
    'amused',
    'analyst',
    'anchor',
    'ancient',
    'anger',
    'angle',
    'angry',
    'animal',
    'ankle',
    'announce',
    'annual',
    'another',
    'answer',
    'antenna',
    'antique',
    'anxiety',
    'any',
    'apart',
    'apology',
    'appear',
    'apple',
    'approve',
    'april',
    'arch',
    'arctic',
    'area',
    'arena',
    'argue',
    'arm',
    'armed',
    'armor',
    'army',
    'around',
    'arrange',
    'arrest',
    'arrive',
    'arrow',
    'art',
    'artefact',
    'artist',
    'artwork',
    'ask',
    'aspect',
    'assault',
    'asset',
    'assist',
    'assume',
    'asthma',
    'athlete',
    'atom',
    'attack',
    'attend',
    'attitude',
    'attract',
    'auction',
    'audit',
    'august',
    'aunt',
    'author',
    'auto',
    'autumn',
    'average',
    'avocado',
    'avoid',
    'awake',
    'aware',
    'away',
    'awesome',
    'awful',
    'awkward',
    'axis',
    'baby',
    'bachelor',
    'bacon',
    'badge',
    'bag',
    'balance',
    'balcony',
    'ball',
    'bamboo',
    'banana',
    'banner',
    'bar',
    'barely',
    'bargain',
    'barrel',
    'base',
    'basic',
    'basket',
    'battle',
    'beach',
    'bean',
    'beauty',
    'because',
    'become',
    'beef',
    'before',
    'begin',
    'behave',
    'behind',
    'believe',
    'below',
    'belt',
    'bench',
    'benefit',
    'best',
    'betray',
    'better',
    'between',
    'beyond',
    'bicycle',
    'bid',
    'bike',
    'bind',
    'biology',
    'bird',
    'birth',
    'bitter',
    'black',
    'blade',
    'blame',
    'blanket',
    'blast',
    'bleak',
    'bless',
    'blind',
    'blood',
    'blossom',
    'blouse',
    'blue',
    'blur',
    'blush',
    'board',
    'boat',
    'body',
    'boil',
    'bomb',
    'bone',
    'bonus',
    'book',
    'boost',
    'border',
    'boring',
    'borrow',
    'boss',
    'bottom',
    'bounce',
    'box',
    'boy',
    'bracket',
    'brain',
    'brand',
    'brass',
    'brave',
    'bread',
    'breeze',
    'brick',
    'bridge',
    'brief',
    'bright',
    'bring',
    'brisk',
    'broccoli',
    'broken',
    'bronze',
    'broom',
    'brother',
    'brown',
    'brush',
    'bubble',
    'buddy',
    'budget',
    'buffalo',
    'build',
    'bulb',
    'bulk',
    'bullet',
    'bundle',
    'bunker',
    'burden',
    'burger',
    'burst',
    'bus',
    'business',
    'busy',
    'butter',
    'buyer',
    'buzz',
    'cabbage',
    'cabin',
    'cable',
    'cactus',
    'cage',
    'cake',
    'call',
    'calm',
    'camera',
    'camp',
    'can',
    'canal',
    'cancel',
    'candy',
    'cannon',
    'canoe',
    'canvas',
    'canyon',
    'capable',
    'capital',
    'captain',
    'car',
    'carbon',
    'card',
    'cargo',
    'carpet',
    'carry',
    'cart',
    'case',
    'cash',
    'casino',
    'castle',
    'casual',
    'cat',
    'catalog',
    'catch',
    'category',
    'cattle',
    'caught',
    'cause',
    'caution',
    'cave',
    'ceiling',
    'celery',
    'cement',
    'census',
    'century',
    'cereal',
    'certain',
    'chair',
    'chalk',
    'champion',
    'change',
    'chaos',
    'chapter',
    'charge',
    'chase',
    'chat',
    'cheap',
    'check',
    'cheese',
    'chef',
    'cherry',
    'chest',
    'chicken',
    'chief',
    'child',
    'chimney',
    'choice',
    'choose',
    'chronic',
    'chuckle',
    'chunk',
    'churn',
    'cigar',
    'cinnamon',
    'circle',
    'citizen',
    'city',
    'civil',
    'claim',
    'clap',
    'clarify',
    'claw',
    'clay',
    'clean',
    'clerk',
    'clever',
    'click',
    'client',
    'cliff',
    'climb',
    'clinic',
    'clip',
    'clock',
    'clog',
    'close',
    'cloth',
    'cloud',
    'clown',
    'club',
    'clump',
    'cluster',
    'clutch',
    'coach',
    'coast',
    'coconut',
    'code',
    'coffee',
    'coil',
    'coin',
    'collect',
    'color',
    'column',
    'combine',
    'come',
    'comfort',
    'comic',
    'common',
    'company',
    'concert',
    'conduct',
    'confirm',
    'congress',
    'connect',
    'consider',
    'control',
    'convince',
    'cook',
    'cool',
    'copper',
    'copy',
    'coral',
    'core',
    'corn',
    'correct',
    'cost',
    'cotton',
    'couch',
    'country',
    'couple',
    'course',
    'cousin',
    'cover',
    'coyote',
    'crack',
    'cradle',
    'craft',
    'cram',
    'crane',
    'crash',
    'crater',
    'crawl',
    'crazy',
    'cream',
    'credit',
    'creek',
    'crew',
    'cricket',
    'crime',
    'crisp',
    'critic',
    'crop',
    'cross',
    'crouch',
    'crowd',
    'crucial',
    'cruel',
    'cruise',
    'crumble',
    'crunch',
    'crush',
    'cry',
    'crystal',
    'cube',
    'culture',
    'cup',
    'cupboard',
    'curious',
    'current',
    'curtain',
    'curve',
    'cushion',
    'custom',
    'cute',
    'cycle',
    'dad',
    'damage',
    'damp',
    'dance',
    'danger',
    'daring',
    'dash',
    'daughter',
    'dawn',
    'day',
    'deal',
    'debate',
    'debris',
    'decade',
    'december',
    'decide',
    'decline',
    'decorate',
    'decrease',
    'deer',
    'defense',
    'define',
    'defy',
    'degree',
    'delay',
    'deliver',
    'demand',
    'demise',
    'denial',
    'dentist',
    'deny',
    'depart',
    'depend',
    'deposit',
    'depth',
    'deputy',
    'derive',
    'describe',
    'desert',
    'design',
    'desk',
    'despair',
    'destroy',
    'detail',
    'detect',
    'develop',
    'device',
    'devote',
    'diagram',
    'dial',
    'diamond',
    'diary',
    'dice',
    'diesel',
    'diet',
    'differ',
    'digital',
    'dignity',
    'dilemma',
    'dinner',
    'dinosaur',
    'direct',
    'dirt',
    'disagree',
    'discover',
    'disease',
    'dish',
    'dismiss',
    'disorder',
    'display',
    'distance',
    'divert',
    'divide',
    'divorce',
    'dizzy',
    'doctor',
    'document',
    'dog',
    'doll',
    'dolphin',
    'domain',
    'donate',
    'donkey',
    'donor',
    'door',
    'dose',
    'double',
    'dove',
    'draft',
    'dragon',
    'drama',
    'drastic',
    'draw',
    'dream',
    'dress',
    'drift',
    'drill',
    'drink',
    'drip',
    'drive',
    'drop',
    'drum',
    'dry',
    'duck',
    'dumb',
    'dune',
    'during',
    'dust',
    'dutch',
    'duty',
    'dwarf',
    'dynamic',
    'eager',
    'eagle',
    'early',
    'earn',
    'earth',
    'easily',
    'east',
    'easy',
    'echo',
    'ecology',
    'economy',
    'edge',
    'edit',
    'educate',
    'effort',
    'egg',
    'eight',
    'either',
    'elbow',
    'elder',
    'electric',
    'elegant',
    'element',
    'elephant',
    'elevator',
    'elite',
    'else',
    'embark',
    'embody',
    'embrace',
    'emerge',
    'emotion',
    'employ',
    'empower',
    'empty',
    'enable',
    'enact',
    'end',
    'endless',
    'endorse',
    'enemy',
    'energy',
    'enforce',
    'engage',
    'engine',
    'enhance',
    'enjoy',
    'enlist',
    'enough',
    'enrich',
    'enroll',
    'ensure',
    'enter',
    'entire',
    'entry',
    'envelope',
    'episode',
    'equal',
    'equip',
    'era',
    'erase',
    'erode',
    'erosion',
    'error',
    'erupt',
    'escape',
    'essay',
    'essence',
    'estate',
    'eternal',
    'ethics',
    'evidence',
    'evil',
    'evoke',
    'evolve',
    'exact',
    'example',
    'excess',
    'exchange',
    'excite',
    'exclude',
    'excuse',
    'execute',
    'exercise',
    'exhaust',
    'exhibit',
    'exile',
    'exist',
    'exit',
    'exotic',
    'expand',
    'expect',
    'expire',
    'explain',
    'expose',
    'express',
    'extend',
    'extra',
    'eye',
    'eyebrow',
    'fabric',
    'face',
    'faculty',
    'fade',
    'faint',
    'faith',
    'fall',
    'false',
    'fame',
    'family',
    'famous',
    'fan',
    'fancy',
    'fantasy',
    'farm',
    'fashion',
    'fat',
    'fatal',
    'father',
    'fatigue',
    'fault',
    'favorite',
    'feature',
    'february',
    'federal',
    'fee',
    'feed',
    'feel',
    'female',
    'fence',
    'festival',
    'fetch',
    'fever',
    'few',
    'fiber',
    'fiction',
    'field',
    'figure',
    'file',
    'film',
    'filter',
    'final',
    'find',
    'fine',
    'finger',
    'finish',
    'fire',
    'firm',
    'first',
    'fiscal',
    'fish',
    'fit',
    'fitness',
    'fix',
    'flag',
    'flame',
    'flash',
    'flat',
    'flavor',
    'flee',
    'flight',
    'flip',
    'float',
    'flock',
    'floor',
    'flower',
    'fluid',
    'flush',
    'fly',
    'foam',
    'focus',
    'fog',
    'foil',
    'fold',
    'follow',
    'food',
    'foot',
    'force',
    'forest',
    'forget',
    'fork',
    'fortune',
    'forum',
    'forward',
    'fossil',
    'foster',
    'found',
    'fox',
    'fragile',
    'frame',
    'frequent',
    'fresh',
    'friend',
    'fringe',
    'frog',
    'front',
    'frost',
    'frown',
    'frozen',
    'fruit',
    'fuel',
    'fun',
    'funny',
    'furnace',
    'fury',
    'future',
    'gadget',
    'gain',
    'galaxy',
    'gallery',
    'game',
    'gap',
    'garage',
    'garbage',
    'garden',
    'garlic',
    'garment',
    'gas',
    'gasp',
    'gate',
    'gather',
    'gauge',
    'gaze',
    'general',
    'genius',
    'genre',
    'gentle',
    'genuine',
    'gesture',
    'ghost',
    'giant',
    'gift',
    'giggle',
    'ginger',
    'giraffe',
    'girl',
    'give',
    'glad',
    'glance',
    'glare',
    'glass',
    'glide',
    'glimpse',
    'globe',
    'gloom',
    'glory',
    'glove',
    'glow',
    'glue',
    'goat',
    'goddess',
    'gold',
    'good',
    'goose',
    'gorilla',
    'gospel',
    'gossip',
    'govern',
    'gown',
    'grab',
    'grace',
    'grain',
    'grant',
    'grape',
    'grass',
    'gravity',
    'great',
    'green',
    'grid',
    'grief',
    'grit',
    'grocery',
    'group',
    'grow',
    'grunt',
    'guard',
    'guess',
    'guide',
    'guilt',
    'guitar',
    'gun',
    'gym',
    'habit',
    'hair',
    'half',
    'hammer',
    'hamster',
    'hand',
    'happy',
    'harbor',
    'hard',
    'harsh',
    'harvest',
    'hat',
    'have',
    'hawk',
    'hazard',
    'head',
    'health',
    'heart',
    'heavy',
    'hedgehog',
    'height',
    'hello',
    'helmet',
    'help',
    'hen',
    'hero',
    'hidden',
    'high',
    'hill',
    'hint',
    'hip',
    'hire',
    'history',
    'hobby',
    'hockey',
    'hold',
    'hole',
    'holiday',
    'hollow',
    'home',
    'honey',
    'hood',
    'hope',
    'horn',
    'horror',
    'horse',
    'hospital',
    'host',
    'hotel',
    'hour',
    'hover',
    'hub',
    'huge',
    'human',
    'humble',
    'humor',
    'hundred',
    'hungry',
    'hunt',
    'hurdle',
    'hurry',
    'hurt',
    'husband',
    'hybrid',
    'ice',
    'icon',
    'idea',
    'identify',
    'idle',
    'ignore',
    'ill',
    'illegal',
    'illness',
    'image',
    'imitate',
    'immense',
    'immune',
    'impact',
    'impose',
    'improve',
    'impulse',
    'inch',
    'include',
    'income',
    'increase',
    'index',
    'indicate',
    'indoor',
    'industry',
    'infant',
    'inflict',
    'inform',
    'inhale',
    'inherit',
    'initial',
    'inject',
    'injury',
    'inmate',
    'inner',
    'innocent',
    'input',
    'inquiry',
    'insane',
    'insect',
    'inside',
    'inspire',
    'install',
    'intact',
    'interest',
    'into',
    'invest',
    'invite',
    'involve',
    'iron',
    'island',
    'isolate',
    'issue',
    'item',
    'ivory',
    'jacket',
    'jaguar',
    'jar',
    'jazz',
    'jealous',
    'jeans',
    'jelly',
    'jewel',
    'job',
    'join',
    'joke',
    'journey',
    'joy',
    'judge',
    'juice',
    'jump',
    'jungle',
    'junior',
    'junk',
    'just',
    'kangaroo',
    'keen',
    'keep',
    'ketchup',
    'key',
    'kick',
    'kid',
    'kidney',
    'kind',
    'kingdom',
    'kiss',
    'kit',
    'kitchen',
    'kite',
    'kitten',
    'kiwi',
    'knee',
    'knife',
    'knock',
    'know',
    'lab',
    'label',
    'labor',
    'ladder',
    'lady',
    'lake',
    'lamp',
    'language',
    'laptop',
    'large',
    'later',
    'latin',
    'laugh',
    'laundry',
    'lava',
    'law',
    'lawn',
    'lawsuit',
    'layer',
    'lazy',
    'leader',
    'leaf',
    'learn',
    'leave',
    'lecture',
    'left',
    'leg',
    'legal',
    'legend',
    'leisure',
    'lemon',
    'lend',
    'length',
    'lens',
    'leopard',
    'lesson',
    'letter',
    'level',
    'liar',
    'liberty',
    'library',
    'license',
    'life',
    'lift',
    'light',
    'like',
    'limb',
    'limit',
    'link',
    'lion',
    'liquid',
    'list',
    'little',
    'live',
    'lizard',
    'load',
    'loan',
    'lobster',
    'local',
    'lock',
    'logic',
    'lonely',
    'long',
    'loop',
    'lottery',
    'loud',
    'lounge',
    'love',
    'loyal',
    'lucky',
    'luggage',
    'lumber',
    'lunar',
    'lunch',
    'luxury',
    'lyrics',
    'machine',
    'mad',
    'magic',
    'magnet',
    'maid',
    'mail',
    'main',
    'major',
    'make',
    'mammal',
    'man',
    'manage',
    'mandate',
    'mango',
    'mansion',
    'manual',
    'maple',
    'marble',
    'march',
    'margin',
    'marine',
    'market',
    'marriage',
    'mask',
    'mass',
    'master',
    'match',
    'material',
    'math',
    'matrix',
    'matter',
    'maximum',
    'maze',
    'meadow',
    'mean',
    'measure',
    'meat',
    'mechanic',
    'medal',
    'media',
    'melody',
    'melt',
    'member',
    'memory',
    'mention',
    'menu',
    'mercy',
    'merge',
    'merit',
    'merry',
    'mesh',
    'message',
    'metal',
    'method',
    'middle',
    'midnight',
    'milk',
    'million',
    'mimic',
    'mind',
    'minimum',
    'minor',
    'minute',
    'miracle',
    'mirror',
    'misery',
    'miss',
    'mistake',
    'mix',
    'mixed',
    'mixture',
    'mobile',
    'model',
    'modify',
    'mom',
    'moment',
    'monitor',
    'monkey',
    'monster',
    'month',
    'moon',
    'moral',
    'more',
    'morning',
    'mosquito',
    'mother',
    'motion',
    'motor',
    'mountain',
    'mouse',
    'move',
    'movie',
    'much',
    'muffin',
    'mule',
    'multiply',
    'muscle',
    'museum',
    'mushroom',
    'music',
    'must',
    'mutual',
    'myself',
    'mystery',
    'myth',
    'naive',
    'name',
    'napkin',
    'narrow',
    'nasty',
    'nation',
    'nature',
    'near',
    'neck',
    'need',
    'negative',
    'neglect',
    'neither',
    'nephew',
    'nerve',
    'nest',
    'net',
    'network',
    'neutral',
    'never',
    'news',
    'next',
    'nice',
    'night',
    'noble',
    'noise',
    'nominee',
    'noodle',
    'normal',
    'north',
    'nose',
    'notable',
    'note',
    'nothing',
    'notice',
    'novel',
    'now',
    'nuclear',
    'number',
    'nurse',
    'nut',
    'oak',
    'obey',
    'object',
    'oblige',
    'obscure',
    'observe',
    'obtain',
    'obvious',
    'occur',
    'ocean',
    'october',
    'odor',
    'off',
    'offer',
    'office',
    'often',
    'oil',
    'okay',
    'old',
    'olive',
    'olympic',
    'omit',
    'once',
    'one',
    'onion',
    'online',
    'only',
    'open',
    'opera',
    'opinion',
    'oppose',
    'option',
    'orange',
    'orbit',
    'orchard',
    'order',
    'ordinary',
    'organ',
    'orient',
    'original',
    'orphan',
    'ostrich',
    'other',
    'outdoor',
    'outer',
    'output',
    'outside',
    'oval',
    'oven',
    'over',
    'own',
    'owner',
    'oxygen',
    'oyster',
    'ozone',
    'pact',
    'paddle',
    'page',
    'pair',
    'palace',
    'palm',
    'panda',
    'panel',
    'panic',
    'panther',
    'paper',
    'parade',
    'parent',
    'park',
    'parrot',
    'party',
    'pass',
    'patch',
    'path',
    'patient',
    'patrol',
    'pattern',
    'pause',
    'pave',
    'payment',
    'peace',
    'peanut',
    'pear',
    'peasant',
    'pelican',
    'pen',
    'penalty',
    'pencil',
    'people',
    'pepper',
    'perfect',
    'permit',
    'person',
    'pet',
    'phone',
    'photo',
    'phrase',
    'physical',
    'piano',
    'picnic',
    'picture',
    'piece',
    'pig',
    'pigeon',
    'pill',
    'pilot',
    'pink',
    'pioneer',
    'pipe',
    'pistol',
    'pitch',
    'pizza',
    'place',
    'planet',
    'plastic',
    'plate',
    'play',
    'please',
    'pledge',
    'pluck',
    'plug',
    'plunge',
    'poem',
    'poet',
    'point',
    'polar',
    'pole',
    'police',
    'pond',
    'pony',
    'pool',
    'popular',
    'portion',
    'position',
    'possible',
    'post',
    'potato',
    'pottery',
    'poverty',
    'powder',
    'power',
    'practice',
    'praise',
    'predict',
    'prefer',
    'prepare',
    'present',
    'pretty',
    'prevent',
    'price',
    'pride',
    'primary',
    'print',
    'priority',
    'prison',
    'private',
    'prize',
    'problem',
    'process',
    'produce',
    'profit',
    'program',
    'project',
    'promote',
    'proof',
    'property',
    'prosper',
    'protect',
    'proud',
    'provide',
    'public',
    'pudding',
    'pull',
    'pulp',
    'pulse',
    'pumpkin',
    'punch',
    'pupil',
    'puppy',
    'purchase',
    'purity',
    'purpose',
    'purse',
    'push',
    'put',
    'puzzle',
    'pyramid',
    'quality',
    'quantum',
    'quarter',
    'question',
    'quick',
    'quit',
    'quiz',
    'quote',
    'rabbit',
    'raccoon',
    'race',
    'rack',
    'radar',
    'radio',
    'rail',
    'rain',
    'raise',
    'rally',
    'ramp',
    'ranch',
    'random',
    'range',
    'rapid',
    'rare',
    'rate',
    'rather',
    'raven',
    'raw',
    'razor',
    'ready',
    'real',
    'reason',
    'rebel',
    'rebuild',
    'recall',
    'receive',
    'recipe',
    'record',
    'recycle',
    'reduce',
    'reflect',
    'reform',
    'refuse',
    'region',
    'regret',
    'regular',
    'reject',
    'relax',
    'release',
    'relief',
    'rely',
    'remain',
    'remember',
    'remind',
    'remove',
    'render',
    'renew',
    'rent',
    'reopen',
    'repair',
    'repeat',
    'replace',
    'report',
    'require',
    'rescue',
    'resemble',
    'resist',
    'resource',
    'response',
    'result',
    'retire',
    'retreat',
    'return',
    'reunion',
    'reveal',
    'review',
    'reward',
    'rhythm',
    'rib',
    'ribbon',
    'rice',
    'rich',
    'ride',
    'ridge',
    'rifle',
    'right',
    'rigid',
    'ring',
    'riot',
    'ripple',
    'risk',
    'ritual',
    'rival',
    'river',
    'road',
    'roast',
    'robot',
    'robust',
    'rocket',
    'romance',
    'roof',
    'rookie',
    'room',
    'rose',
    'rotate',
    'rough',
    'round',
    'route',
    'royal',
    'rubber',
    'rude',
    'rug',
    'rule',
    'run',
    'runway',
    'rural',
    'sad',
    'saddle',
    'sadness',
    'safe',
    'sail',
    'salad',
    'salmon',
    'salon',
    'salt',
    'salute',
    'same',
    'sample',
    'sand',
    'satisfy',
    'satoshi',
    'sauce',
    'sausage',
    'save',
    'say',
    'scale',
    'scan',
    'scare',
    'scatter',
    'scene',
    'scheme',
    'school',
    'science',
    'scissors',
    'scorpion',
    'scout',
    'scrap',
    'screen',
    'script',
    'scrub',
    'sea',
    'search',
    'season',
    'seat',
    'second',
    'secret',
    'section',
    'security',
    'seed',
    'seek',
    'segment',
    'select',
    'sell',
    'seminar',
    'senior',
    'sense',
    'sentence',
    'series',
    'service',
    'session',
    'settle',
    'setup',
    'seven',
    'shadow',
    'shaft',
    'shallow',
    'share',
    'shed',
    'shell',
    'sheriff',
    'shield',
    'shift',
    'shine',
    'ship',
    'shiver',
    'shock',
    'shoe',
    'shoot',
    'shop',
    'short',
    'shoulder',
    'shove',
    'shrimp',
    'shrug',
    'shuffle',
    'shy',
    'sibling',
    'sick',
    'side',
    'siege',
    'sight',
    'sign',
    'silent',
    'silk',
    'silly',
    'silver',
    'similar',
    'simple',
    'since',
    'sing',
    'siren',
    'sister',
    'situate',
    'six',
    'size',
    'skate',
    'sketch',
    'ski',
    'skill',
    'skin',
    'skirt',
    'skull',
    'slab',
    'slam',
    'sleep',
    'slender',
    'slice',
    'slide',
    'slight',
    'slim',
    'slogan',
    'slot',
    'slow',
    'slush',
    'small',
    'smart',
    'smile',
    'smoke',
    'smooth',
    'snack',
    'snake',
    'snap',
    'sniff',
    'snow',
    'soap',
    'soccer',
    'social',
    'sock',
    'soda',
    'soft',
    'solar',
    'soldier',
    'solid',
    'solution',
    'solve',
    'someone',
    'song',
    'soon',
    'sorry',
    'sort',
    'soul',
    'sound',
    'soup',
    'source',
    'south',
    'space',
    'spare',
    'spatial',
    'spawn',
    'speak',
    'special',
    'speed',
    'spell',
    'spend',
    'sphere',
    'spice',
    'spider',
    'spike',
    'spin',
    'spirit',
    'split',
    'spoil',
    'sponsor',
    'spoon',
    'sport',
    'spot',
    'spray',
    'spread',
    'spring',
    'spy',
    'square',
    'squeeze',
    'squirrel',
    'stable',
    'stadium',
    'staff',
    'stage',
    'stairs',
    'stamp',
    'stand',
    'start',
    'state',
    'stay',
    'steak',
    'steel',
    'stem',
    'step',
    'stereo',
    'stick',
    'still',
    'sting',
    'stock',
    'stomach',
    'stone',
    'stool',
    'story',
    'stove',
    'strategy',
    'street',
    'strike',
    'strong',
    'struggle',
    'student',
    'stuff',
    'stumble',
    'style',
    'subject',
    'submit',
    'subway',
    'success',
    'such',
    'sudden',
    'suffer',
    'sugar',
    'suggest',
    'suit',
    'summer',
    'sun',
    'sunny',
    'sunset',
    'super',
    'supply',
    'supreme',
    'sure',
    'surface',
    'surge',
    'surprise',
    'surround',
    'survey',
    'suspect',
    'sustain',
    'swallow',
    'swamp',
    'swap',
    'swarm',
    'swear',
    'sweet',
    'swift',
    'swim',
    'swing',
    'switch',
    'sword',
    'symbol',
    'symptom',
    'syrup',
    'system',
    'table',
    'tackle',
    'tag',
    'tail',
    'talent',
    'talk',
    'tank',
    'tape',
    'target',
    'task',
    'taste',
    'tattoo',
    'taxi',
    'teach',
    'team',
    'tell',
    'ten',
    'tenant',
    'tennis',
    'tent',
    'term',
    'test',
    'text',
    'thank',
    'that',
    'theme',
    'then',
    'theory',
    'there',
    'they',
    'thing',
    'this',
    'thought',
    'three',
    'thrive',
    'throw',
    'thumb',
    'thunder',
    'ticket',
    'tide',
    'tiger',
    'tilt',
    'timber',
    'time',
    'tiny',
    'tip',
    'tired',
    'tissue',
    'title',
    'toast',
    'tobacco',
    'today',
    'toddler',
    'toe',
    'together',
    'toilet',
    'token',
    'tomato',
    'tomorrow',
    'tone',
    'tongue',
    'tonight',
    'tool',
    'tooth',
    'top',
    'topic',
    'topple',
    'torch',
    'tornado',
    'tortoise',
    'toss',
    'total',
    'tourist',
    'toward',
    'tower',
    'town',
    'toy',
    'track',
    'trade',
    'traffic',
    'tragic',
    'train',
    'transfer',
    'trap',
    'trash',
    'travel',
    'tray',
    'treat',
    'tree',
    'trend',
    'trial',
    'tribe',
    'trick',
    'trigger',
    'trim',
    'trip',
    'trophy',
    'trouble',
    'truck',
    'true',
    'truly',
    'trumpet',
    'trust',
    'truth',
    'try',
    'tube',
    'tuition',
    'tumble',
    'tuna',
    'tunnel',
    'turkey',
    'turn',
    'turtle',
    'twelve',
    'twenty',
    'twice',
    'twin',
    'twist',
    'two',
    'type',
    'typical',
    'ugly',
    'umbrella',
    'unable',
    'unaware',
    'uncle',
    'uncover',
    'under',
    'undo',
    'unfair',
    'unfold',
    'unhappy',
    'uniform',
    'unique',
    'unit',
    'universe',
    'unknown',
    'unlock',
    'until',
    'unusual',
    'unveil',
    'update',
    'upgrade',
    'uphold',
    'upon',
    'upper',
    'upset',
    'urban',
    'urge',
    'usage',
    'use',
    'used',
    'useful',
    'useless',
    'usual',
    'utility',
    'vacant',
    'vacuum',
    'vague',
    'valid',
    'valley',
    'valve',
    'van',
    'vanish',
    'vapor',
    'various',
    'vast',
    'vault',
    'vehicle',
    'velvet',
    'vendor',
    'venture',
    'venue',
    'verb',
    'verify',
    'version',
    'very',
    'vessel',
    'veteran',
    'viable',
    'vibrant',
    'vicious',
    'victory',
    'video',
    'view',
    'village',
    'vintage',
    'violin',
    'virtual',
    'virus',
    'visa',
    'visit',
    'visual',
    'vital',
    'vivid',
    'vocal',
    'voice',
    'void',
    'volcano',
    'volume',
    'vote',
    'voyage',
    'wage',
    'wagon',
    'wait',
    'walk',
    'wall',
    'walnut',
    'want',
    'warfare',
    'warm',
    'warrior',
    'wash',
    'wasp',
    'waste',
    'water',
    'wave',
    'way',
    'wealth',
    'weapon',
    'wear',
    'weasel',
    'weather',
    'web',
    'wedding',
    'weekend',
    'weird',
    'welcome',
    'west',
    'wet',
    'whale',
    'what',
    'wheat',
    'wheel',
    'when',
    'where',
    'whip',
    'whisper',
    'wide',
    'width',
    'wife',
    'wild',
    'will',
    'win',
    'window',
    'wine',
    'wing',
    'wink',
    'winner',
    'winter',
    'wire',
    'wisdom',
    'wise',
    'wish',
    'witness',
    'wolf',
    'woman',
    'wonder',
    'wood',
    'wool',
    'word',
    'work',
    'world',
    'worry',
    'worth',
    'wrap',
    'wreck',
    'wrestle',
    'wrist',
    'write',
    'wrong',
    'yard',
    'year',
    'yellow',
    'you',
    'young',
    'youth',
    'zebra',
    'zero',
    'zone',
    'zoo',
  ];
  return ((ya.wordlist = t), ya);
}
var Fs;
function fc() {
  if (Fs) return it;
  Fs = 1;
  var t =
    (it && it.__importDefault) ||
    function (F) {
      return F && F.__esModule ? F : { default: F };
    };
  (Object.defineProperty(it, '__esModule', { value: !0 }),
    (it.mnemonicFromRandomSeed =
      it.mnemonicIndexesToBytes =
      it.bytesToMnemonics =
      it.bytesToMnemonicIndexes =
      it.mnemonicNew =
      it.mnemonicValidate =
      it.mnemonicToHDSeed =
      it.mnemonicToWalletKey =
      it.mnemonicToPrivateKey =
      it.mnemonicToSeed =
      it.mnemonicToEntropy =
        void 0));
  const d = t(tc()),
    u = wo(),
    a = ti(),
    e = cc(),
    r = _f(),
    n = dc(),
    i = 1e5;
  async function s(F) {
    const K = await v(F);
    return (await y(K)) && !(await o(K));
  }
  function f(F) {
    return F.map((K) => K.toLowerCase().trim());
  }
  async function o(F) {
    return (
      (
        await (0, e.pbkdf2_sha512)(
          F,
          'TON seed version',
          Math.max(1, Math.floor(i / 256)),
          64,
        )
      )[0] == 0
    );
  }
  async function y(F) {
    return (
      (await (0, e.pbkdf2_sha512)(F, 'TON fast seed version', 1, 64))[0] == 1
    );
  }
  async function v(F, K) {
    return await (0, a.hmac_sha512)(F.join(' '), K && K.length > 0 ? K : '');
  }
  it.mnemonicToEntropy = v;
  async function w(F, K, Y) {
    const ue = await v(F, Y);
    return await (0, e.pbkdf2_sha512)(ue, K, i, 64);
  }
  it.mnemonicToSeed = w;
  async function R(F, K) {
    F = f(F);
    const Y = await w(F, 'TON default seed', K);
    let ue = d.default.sign.keyPair.fromSeed(Y.slice(0, 32));
    return {
      publicKey: Buffer.from(ue.publicKey),
      secretKey: Buffer.from(ue.secretKey),
    };
  }
  it.mnemonicToPrivateKey = R;
  async function C(F, K) {
    let ue = (await R(F, K)).secretKey.slice(0, 32);
    const we = d.default.sign.keyPair.fromSeed(ue);
    return {
      publicKey: Buffer.from(we.publicKey),
      secretKey: Buffer.from(we.secretKey),
    };
  }
  it.mnemonicToWalletKey = C;
  async function P(F, K) {
    return ((F = f(F)), await w(F, 'TON HD Keys seed', K));
  }
  it.mnemonicToHDSeed = P;
  async function E(F, K) {
    F = f(F);
    for (let Y of F) if (n.wordlist.indexOf(Y) < 0) return !1;
    return K && K.length > 0 && !(await s(F)) ? !1 : await o(await v(F, K));
  }
  it.mnemonicValidate = E;
  async function N(F = 24, K) {
    let Y = [];
    for (;;) {
      Y = [];
      for (let ue = 0; ue < F; ue++) {
        let we = await (0, u.getSecureRandomNumber)(0, n.wordlist.length);
        Y.push(n.wordlist[we]);
      }
      if (!(K && K.length > 0 && !(await s(Y))) && (await o(await v(Y, K))))
        break;
    }
    return Y;
  }
  it.mnemonicNew = N;
  function D(F, K) {
    let Y = (0, r.bytesToBits)(F),
      ue = [];
    for (let we = 0; we < K; we++) {
      let Ce = Y.slice(we * 11, we * 11 + 11);
      ue.push(parseInt(Ce, 2));
    }
    return ue;
  }
  it.bytesToMnemonicIndexes = D;
  function G(F, K) {
    let Y = D(F, K),
      ue = [];
    for (let we of Y) ue.push(n.wordlist[we]);
    return ue;
  }
  it.bytesToMnemonics = G;
  function te(F) {
    let K = '';
    for (let Y of F) {
      if (!Number.isSafeInteger(Y) || Y < 0 || Y >= 2028)
        throw Error('Invalid input');
      K += (0, r.lpad)(Y.toString(2), '0', 11);
    }
    for (; K.length % 8 !== 0;) K = K + '0';
    return (0, r.bitsToBytes)(K);
  }
  it.mnemonicIndexesToBytes = te;
  async function W(F, K = 24, Y) {
    const ue = Math.ceil((K * 11) / 8);
    let we = F;
    for (;;) {
      let Ce = await (0, e.pbkdf2_sha512)(
          we,
          'TON mnemonic seed',
          Math.max(1, Math.floor(i / 256)),
          ue,
        ),
        $ = G(Ce, K);
      if (await E($, Y)) return $;
      we = Ce;
    }
  }
  return ((it.mnemonicFromRandomSeed = W), it);
}
var bt = {},
  Zs;
function Hs() {
  if (Zs) return bt;
  Zs = 1;
  var t =
    (bt && bt.__importDefault) ||
    function (s) {
      return s && s.__esModule ? s : { default: s };
    };
  (Object.defineProperty(bt, '__esModule', { value: !0 }),
    (bt.openBox =
      bt.sealBox =
      bt.signVerify =
      bt.sign =
      bt.keyPairFromSeed =
      bt.keyPairFromSecretKey =
        void 0));
  const d = t(tc());
  function u(s) {
    let f = d.default.sign.keyPair.fromSecretKey(new Uint8Array(s));
    return {
      publicKey: Buffer.from(f.publicKey),
      secretKey: Buffer.from(f.secretKey),
    };
  }
  bt.keyPairFromSecretKey = u;
  function a(s) {
    let f = d.default.sign.keyPair.fromSeed(new Uint8Array(s));
    return {
      publicKey: Buffer.from(f.publicKey),
      secretKey: Buffer.from(f.secretKey),
    };
  }
  bt.keyPairFromSeed = a;
  function e(s, f) {
    return Buffer.from(
      d.default.sign.detached(new Uint8Array(s), new Uint8Array(f)),
    );
  }
  bt.sign = e;
  function r(s, f, o) {
    return d.default.sign.detached.verify(
      new Uint8Array(s),
      new Uint8Array(f),
      new Uint8Array(o),
    );
  }
  bt.signVerify = r;
  function n(s, f, o) {
    return Buffer.from(d.default.secretbox(s, f, o));
  }
  bt.sealBox = n;
  function i(s, f, o) {
    let y = d.default.secretbox.open(s, f, o);
    return y ? Buffer.from(y) : null;
  }
  return ((bt.openBox = i), bt);
}
var Wt = {},
  Ws;
function kf() {
  if (Ws) return Wt;
  ((Ws = 1),
    Object.defineProperty(Wt, '__esModule', { value: !0 }),
    (Wt.deriveEd25519Path =
      Wt.deriveED25519HardenedKey =
      Wt.getED25519MasterKeyFromSeed =
        void 0));
  const t = ti(),
    d = 'ed25519 seed',
    u = 2147483648;
  async function a(n) {
    const i = await (0, t.hmac_sha512)(d, n),
      s = i.slice(0, 32),
      f = i.slice(32);
    return { key: s, chainCode: f };
  }
  Wt.getED25519MasterKeyFromSeed = a;
  async function e(n, i) {
    if (i >= u) throw Error('Key index must be less than offset');
    const s = Buffer.alloc(4);
    s.writeUInt32BE(i + u, 0);
    const f = Buffer.concat([Buffer.alloc(1, 0), n.key, s]),
      o = await (0, t.hmac_sha512)(n.chainCode, f),
      y = o.slice(0, 32),
      v = o.slice(32);
    return { key: y, chainCode: v };
  }
  Wt.deriveED25519HardenedKey = e;
  async function r(n, i) {
    let s = await a(n),
      f = [...i];
    for (; f.length > 0;) {
      let o = f[0];
      ((f = f.slice(1)), (s = await e(s, o)));
    }
    return s.key;
  }
  return ((Wt.deriveEd25519Path = r), Wt);
}
var Kt = {},
  Ks;
function Cf() {
  if (Ks) return Kt;
  ((Ks = 1),
    Object.defineProperty(Kt, '__esModule', { value: !0 }),
    (Kt.deriveSymmetricPath =
      Kt.deriveSymmetricHardenedKey =
      Kt.getSymmetricMasterKeyFromSeed =
        void 0));
  const t = ti(),
    d = 'Symmetric key seed';
  async function u(r) {
    const n = await (0, t.hmac_sha512)(d, r),
      i = n.slice(32),
      s = n.slice(0, 32);
    return { key: i, chainCode: s };
  }
  Kt.getSymmetricMasterKeyFromSeed = u;
  async function a(r, n) {
    const i = Buffer.concat([Buffer.alloc(1, 0), Buffer.from(n)]),
      s = await (0, t.hmac_sha512)(r.chainCode, i),
      f = s.slice(32),
      o = s.slice(0, 32);
    return { key: f, chainCode: o };
  }
  Kt.deriveSymmetricHardenedKey = a;
  async function e(r, n) {
    let i = await u(r),
      s = [...n];
    for (; s.length > 0;) {
      let f = s[0];
      ((s = s.slice(1)), (i = await a(i, f)));
    }
    return i.key;
  }
  return ((Kt.deriveSymmetricPath = e), Kt);
}
var $t = {},
  $s;
function Sf() {
  if ($s) return $t;
  (($s = 1),
    Object.defineProperty($t, '__esModule', { value: !0 }),
    ($t.deriveMnemonicsPath =
      $t.deriveMnemonicHardenedKey =
      $t.getMnemonicsMasterKeyFromSeed =
        void 0));
  const t = fc(),
    d = ti(),
    u = 2147483648,
    a = 'TON Mnemonics HD seed';
  async function e(i) {
    const s = await (0, d.hmac_sha512)(a, i),
      f = s.slice(0, 32),
      o = s.slice(32);
    return { key: f, chainCode: o };
  }
  $t.getMnemonicsMasterKeyFromSeed = e;
  async function r(i, s) {
    if (s >= u) throw Error('Key index must be less than offset');
    const f = Buffer.alloc(4);
    f.writeUInt32BE(s + u, 0);
    const o = Buffer.concat([Buffer.alloc(1, 0), i.key, f]),
      y = await (0, d.hmac_sha512)(i.chainCode, o),
      v = y.slice(0, 32),
      w = y.slice(32);
    return { key: v, chainCode: w };
  }
  $t.deriveMnemonicHardenedKey = r;
  async function n(i, s, f = 24, o) {
    let y = await e(i),
      v = [...s];
    for (; v.length > 0;) {
      let w = v[0];
      ((v = v.slice(1)), (y = await r(y, w)));
    }
    return await (0, t.mnemonicFromRandomSeed)(y.key, f, o);
  }
  return (($t.deriveMnemonicsPath = n), $t);
}
var Gs;
function Tn() {
  return (
    Gs ||
      ((Gs = 1),
      (function (t) {
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.getMnemonicsMasterKeyFromSeed =
            t.deriveMnemonicHardenedKey =
            t.deriveMnemonicsPath =
            t.deriveSymmetricPath =
            t.deriveSymmetricHardenedKey =
            t.getSymmetricMasterKeyFromSeed =
            t.deriveEd25519Path =
            t.deriveED25519HardenedKey =
            t.getED25519MasterKeyFromSeed =
            t.signVerify =
            t.sign =
            t.keyPairFromSecretKey =
            t.keyPairFromSeed =
            t.openBox =
            t.sealBox =
            t.mnemonicWordList =
            t.mnemonicToHDSeed =
            t.mnemonicToSeed =
            t.mnemonicToWalletKey =
            t.mnemonicToPrivateKey =
            t.mnemonicValidate =
            t.mnemonicNew =
            t.newSecurePassphrase =
            t.newSecureWords =
            t.getSecureRandomNumber =
            t.getSecureRandomWords =
            t.getSecureRandomBytes =
            t.hmac_sha512 =
            t.pbkdf2_sha512 =
            t.sha512_sync =
            t.sha512 =
            t.sha256_sync =
            t.sha256 =
              void 0));
        var d = mf();
        (Object.defineProperty(t, 'sha256', {
          enumerable: !0,
          get: function () {
            return d.sha256;
          },
        }),
          Object.defineProperty(t, 'sha256_sync', {
            enumerable: !0,
            get: function () {
              return d.sha256_sync;
            },
          }));
        var u = yf();
        (Object.defineProperty(t, 'sha512', {
          enumerable: !0,
          get: function () {
            return u.sha512;
          },
        }),
          Object.defineProperty(t, 'sha512_sync', {
            enumerable: !0,
            get: function () {
              return u.sha512_sync;
            },
          }));
        var a = cc();
        Object.defineProperty(t, 'pbkdf2_sha512', {
          enumerable: !0,
          get: function () {
            return a.pbkdf2_sha512;
          },
        });
        var e = ti();
        Object.defineProperty(t, 'hmac_sha512', {
          enumerable: !0,
          get: function () {
            return e.hmac_sha512;
          },
        });
        var r = wo();
        (Object.defineProperty(t, 'getSecureRandomBytes', {
          enumerable: !0,
          get: function () {
            return r.getSecureRandomBytes;
          },
        }),
          Object.defineProperty(t, 'getSecureRandomWords', {
            enumerable: !0,
            get: function () {
              return r.getSecureRandomWords;
            },
          }),
          Object.defineProperty(t, 'getSecureRandomNumber', {
            enumerable: !0,
            get: function () {
              return r.getSecureRandomNumber;
            },
          }));
        var n = wf();
        Object.defineProperty(t, 'newSecureWords', {
          enumerable: !0,
          get: function () {
            return n.newSecureWords;
          },
        });
        var i = vf();
        Object.defineProperty(t, 'newSecurePassphrase', {
          enumerable: !0,
          get: function () {
            return i.newSecurePassphrase;
          },
        });
        var s = fc();
        (Object.defineProperty(t, 'mnemonicNew', {
          enumerable: !0,
          get: function () {
            return s.mnemonicNew;
          },
        }),
          Object.defineProperty(t, 'mnemonicValidate', {
            enumerable: !0,
            get: function () {
              return s.mnemonicValidate;
            },
          }),
          Object.defineProperty(t, 'mnemonicToPrivateKey', {
            enumerable: !0,
            get: function () {
              return s.mnemonicToPrivateKey;
            },
          }),
          Object.defineProperty(t, 'mnemonicToWalletKey', {
            enumerable: !0,
            get: function () {
              return s.mnemonicToWalletKey;
            },
          }),
          Object.defineProperty(t, 'mnemonicToSeed', {
            enumerable: !0,
            get: function () {
              return s.mnemonicToSeed;
            },
          }),
          Object.defineProperty(t, 'mnemonicToHDSeed', {
            enumerable: !0,
            get: function () {
              return s.mnemonicToHDSeed;
            },
          }));
        var f = dc();
        Object.defineProperty(t, 'mnemonicWordList', {
          enumerable: !0,
          get: function () {
            return f.wordlist;
          },
        });
        var o = Hs();
        (Object.defineProperty(t, 'sealBox', {
          enumerable: !0,
          get: function () {
            return o.sealBox;
          },
        }),
          Object.defineProperty(t, 'openBox', {
            enumerable: !0,
            get: function () {
              return o.openBox;
            },
          }));
        var y = Hs();
        (Object.defineProperty(t, 'keyPairFromSeed', {
          enumerable: !0,
          get: function () {
            return y.keyPairFromSeed;
          },
        }),
          Object.defineProperty(t, 'keyPairFromSecretKey', {
            enumerable: !0,
            get: function () {
              return y.keyPairFromSecretKey;
            },
          }),
          Object.defineProperty(t, 'sign', {
            enumerable: !0,
            get: function () {
              return y.sign;
            },
          }),
          Object.defineProperty(t, 'signVerify', {
            enumerable: !0,
            get: function () {
              return y.signVerify;
            },
          }));
        var v = kf();
        (Object.defineProperty(t, 'getED25519MasterKeyFromSeed', {
          enumerable: !0,
          get: function () {
            return v.getED25519MasterKeyFromSeed;
          },
        }),
          Object.defineProperty(t, 'deriveED25519HardenedKey', {
            enumerable: !0,
            get: function () {
              return v.deriveED25519HardenedKey;
            },
          }),
          Object.defineProperty(t, 'deriveEd25519Path', {
            enumerable: !0,
            get: function () {
              return v.deriveEd25519Path;
            },
          }));
        var w = Cf();
        (Object.defineProperty(t, 'getSymmetricMasterKeyFromSeed', {
          enumerable: !0,
          get: function () {
            return w.getSymmetricMasterKeyFromSeed;
          },
        }),
          Object.defineProperty(t, 'deriveSymmetricHardenedKey', {
            enumerable: !0,
            get: function () {
              return w.deriveSymmetricHardenedKey;
            },
          }),
          Object.defineProperty(t, 'deriveSymmetricPath', {
            enumerable: !0,
            get: function () {
              return w.deriveSymmetricPath;
            },
          }));
        var R = Sf();
        (Object.defineProperty(t, 'deriveMnemonicsPath', {
          enumerable: !0,
          get: function () {
            return R.deriveMnemonicsPath;
          },
        }),
          Object.defineProperty(t, 'deriveMnemonicHardenedKey', {
            enumerable: !0,
            get: function () {
              return R.deriveMnemonicHardenedKey;
            },
          }),
          Object.defineProperty(t, 'getMnemonicsMasterKeyFromSeed', {
            enumerable: !0,
            get: function () {
              return R.getMnemonicsMasterKeyFromSeed;
            },
          }));
      })(Qi)),
    Qi
  );
}
var Ys;
function Bf() {
  if (Ys) return la;
  ((Ys = 1),
    Object.defineProperty(la, '__esModule', { value: !0 }),
    (la.wonderCalculator = void 0));
  const t = gr(),
    d = Xa(),
    u = mo(),
    a = yo(),
    e = Pi(),
    r = uc(),
    n = Tn(),
    i = po(),
    s = sc();
  function f(o, y, v) {
    let w,
      R = null;
    if (o === d.CellType.Ordinary) {
      let W = 0;
      for (let F of v) W = W | F.mask.value;
      w = new u.LevelMask(W);
    } else if (o === d.CellType.PrunedBranch)
      ((R = (0, a.exoticPruned)(y, v)), (w = new u.LevelMask(R.mask)));
    else if (o === d.CellType.MerkleProof)
      ((0, e.exoticMerkleProof)(y, v),
        (w = new u.LevelMask(v[0].mask.value >> 1)));
    else if (o === d.CellType.MerkleUpdate)
      ((0, i.exoticMerkleUpdate)(y, v),
        (w = new u.LevelMask((v[0].mask.value | v[1].mask.value) >> 1)));
    else if (o === d.CellType.Library)
      ((0, s.exoticLibrary)(y, v), (w = new u.LevelMask()));
    else throw new Error('Unsupported exotic type');
    let C = [],
      P = [],
      E = o === d.CellType.PrunedBranch ? 1 : w.hashCount,
      D = w.hashCount - E;
    for (let W = 0, F = 0; W <= w.level; W++) {
      if (!w.isSignificant(W)) continue;
      if (F < D) {
        F++;
        continue;
      }
      let K;
      if (F === D) {
        if (!(W === 0 || o === d.CellType.PrunedBranch)) throw Error('Invalid');
        K = y;
      } else {
        if (!(W !== 0 && o !== d.CellType.PrunedBranch))
          throw Error('Invalid: ' + W + ', ' + o);
        K = new t.BitString(P[F - D - 1], 0, 256);
      }
      let Y = 0;
      for (let $ of v) {
        let q;
        (o == d.CellType.MerkleProof || o == d.CellType.MerkleUpdate
          ? (q = $.depth(W + 1))
          : (q = $.depth(W)),
          (Y = Math.max(Y, q)));
      }
      v.length > 0 && Y++;
      let ue = (0, r.getRepr)(y, K, v, W, w.apply(W).value, o),
        we = (0, n.sha256_sync)(ue),
        Ce = F - D;
      ((C[Ce] = Y), (P[Ce] = we), F++);
    }
    let G = [],
      te = [];
    if (R)
      for (let W = 0; W < 4; W++) {
        const { hashIndex: F } = w.apply(W),
          { hashIndex: K } = w;
        F !== K
          ? (G.push(R.pruned[F].hash), te.push(R.pruned[F].depth))
          : (G.push(P[0]), te.push(C[0]));
      }
    else
      for (let W = 0; W < 4; W++)
        (G.push(P[w.apply(W).hashIndex]), te.push(C[w.apply(W).hashIndex]));
    return { mask: w, hashes: G, depths: te };
  }
  return ((la.wonderCalculator = f), la);
}
var Gt = {},
  ba = {},
  Js;
function Pf() {
  if (Js) return ba;
  ((Js = 1),
    Object.defineProperty(ba, '__esModule', { value: !0 }),
    (ba.topologicalSort = void 0));
  function t(d) {
    let u = [d],
      a = new Map(),
      e = new Set(),
      r = [];
    for (; u.length > 0;) {
      const o = [...u];
      u = [];
      for (let y of o) {
        const v = y.hash().toString('hex');
        if (!a.has(v)) {
          (e.add(v),
            a.set(v, {
              cell: y,
              refs: y.refs.map((w) => w.hash().toString('hex')),
            }));
          for (let w of y.refs) u.push(w);
        }
      }
    }
    let n = new Set();
    function i(o) {
      if (!e.has(o)) return;
      if (n.has(o)) throw Error('Not a DAG');
      n.add(o);
      let y = a.get(o).refs;
      for (let v = y.length - 1; v >= 0; v--) i(y[v]);
      (r.push(o), n.delete(o), e.delete(o));
    }
    for (; e.size > 0;) {
      const o = Array.from(e)[0];
      i(o);
    }
    let s = new Map();
    for (let o = 0; o < r.length; o++) s.set(r[r.length - o - 1], o);
    let f = [];
    for (let o = r.length - 1; o >= 0; o--) {
      let y = r[o];
      const v = a.get(y);
      f.push({ cell: v.cell, refs: v.refs.map((w) => s.get(w)) });
    }
    return f;
  }
  return ((ba.topologicalSort = t), ba);
}
var wa = {},
  Qs;
function Af() {
  if (Qs) return wa;
  ((Qs = 1),
    Object.defineProperty(wa, '__esModule', { value: !0 }),
    (wa.bitsForNumber = void 0));
  function t(d, u) {
    let a = BigInt(d);
    if (u === 'int')
      return a === 0n || a === -1n
        ? 1
        : (a > 0 ? a : -a).toString(2).length + 1;
    if (u === 'uint') {
      if (a < 0) throw Error(`value is negative. Got ${d}`);
      return a.toString(2).length;
    } else throw Error(`invalid mode. Got ${u}`);
  }
  return ((wa.bitsForNumber = t), wa);
}
var va = {},
  Xs;
function hc() {
  if (Xs) return va;
  ((Xs = 1),
    Object.defineProperty(va, '__esModule', { value: !0 }),
    (va.crc32c = void 0));
  const t = 2197175160;
  function d(u) {
    let a = -1;
    for (let r = 0; r < u.length; r++)
      ((a ^= u[r]),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1),
        (a = a & 1 ? (a >>> 1) ^ t : a >>> 1));
    a = a ^ 4294967295;
    let e = Buffer.alloc(4);
    return (e.writeInt32LE(a), e);
  }
  return ((va.crc32c = d), va);
}
var el;
function xf() {
  if (el) return Gt;
  ((el = 1),
    Object.defineProperty(Gt, '__esModule', { value: !0 }),
    (Gt.serializeBoc = Gt.deserializeBoc = Gt.parseBoc = void 0));
  const t = pr(),
    d = gr(),
    u = Cn(),
    a = Pf(),
    e = Af(),
    r = Bi(),
    n = uc(),
    i = Si(),
    s = hc();
  function f(E) {
    return o(E & 7);
  }
  function o(E) {
    let N = 0;
    for (let D = 0; D < 3; D++) ((N += E & 1), (E = E >> 1));
    return N + 1;
  }
  function y(E, N) {
    const D = E.loadUint(8),
      G = D % 8,
      te = !!(D & 8),
      W = E.loadUint(8),
      F = Math.ceil(W / 2),
      K = !!(W % 2),
      Y = D >> 5,
      ue = (D & 16) != 0,
      Ce = ue ? f(Y) * 32 : 0,
      $ = ue ? f(Y) * 2 : 0;
    (E.skip(Ce * 8), E.skip($ * 8));
    let q = d.BitString.EMPTY;
    F > 0 && (K ? (q = E.loadPaddedBits(F * 8)) : (q = E.loadBits(F * 8)));
    let ie = [];
    for (let Se = 0; Se < G; Se++) ie.push(E.loadUint(N * 8));
    return { bits: q, refs: ie, exotic: te };
  }
  function v(E, N) {
    return 2 + Math.ceil(E.bits.length / 8) + E.refs.length * N;
  }
  function w(E) {
    let N = new t.BitReader(new d.BitString(E, 0, E.length * 8)),
      D = N.loadUint(32);
    if (D === 1761568243) {
      let G = N.loadUint(8),
        te = N.loadUint(8),
        W = N.loadUint(G * 8),
        F = N.loadUint(G * 8),
        K = N.loadUint(G * 8),
        Y = N.loadUint(te * 8),
        ue = N.loadBuffer(W * te),
        we = N.loadBuffer(Y);
      return {
        size: G,
        offBytes: te,
        cells: W,
        roots: F,
        absent: K,
        totalCellSize: Y,
        index: ue,
        cellData: we,
        root: [0],
      };
    } else if (D === 2898503464) {
      let G = N.loadUint(8),
        te = N.loadUint(8),
        W = N.loadUint(G * 8),
        F = N.loadUint(G * 8),
        K = N.loadUint(G * 8),
        Y = N.loadUint(te * 8),
        ue = N.loadBuffer(W * te),
        we = N.loadBuffer(Y),
        Ce = N.loadBuffer(4);
      if (!(0, s.crc32c)(E.subarray(0, E.length - 4)).equals(Ce))
        throw Error('Invalid CRC32C');
      return {
        size: G,
        offBytes: te,
        cells: W,
        roots: F,
        absent: K,
        totalCellSize: Y,
        index: ue,
        cellData: we,
        root: [0],
      };
    } else if (D === 3052313714) {
      let G = N.loadUint(1),
        te = N.loadUint(1);
      (N.loadUint(1), N.loadUint(2));
      let W = N.loadUint(3),
        F = N.loadUint(8),
        K = N.loadUint(W * 8),
        Y = N.loadUint(W * 8),
        ue = N.loadUint(W * 8),
        we = N.loadUint(F * 8),
        Ce = [];
      for (let ie = 0; ie < Y; ie++) Ce.push(N.loadUint(W * 8));
      let $ = null;
      G && ($ = N.loadBuffer(K * F));
      let q = N.loadBuffer(we);
      if (te) {
        let ie = N.loadBuffer(4);
        if (!(0, s.crc32c)(E.subarray(0, E.length - 4)).equals(ie))
          throw Error('Invalid CRC32C');
      }
      return {
        size: W,
        offBytes: F,
        cells: K,
        roots: Y,
        absent: ue,
        totalCellSize: we,
        index: $,
        cellData: q,
        root: Ce,
      };
    } else throw Error('Invalid magic');
  }
  Gt.parseBoc = w;
  function R(E) {
    let N = w(E),
      D = new t.BitReader(
        new d.BitString(N.cellData, 0, N.cellData.length * 8),
      ),
      G = [];
    for (let W = 0; W < N.cells; W++) {
      let F = y(D, N.size);
      G.push({ ...F, result: null });
    }
    for (let W = G.length - 1; W >= 0; W--) {
      if (G[W].result) throw Error('Impossible');
      let F = [];
      for (let K of G[W].refs) {
        if (!G[K].result) throw Error('Invalid BOC file');
        F.push(G[K].result);
      }
      G[W].result = new u.Cell({
        bits: G[W].bits,
        refs: F,
        exotic: G[W].exotic,
      });
    }
    let te = [];
    for (let W = 0; W < N.root.length; W++) te.push(G[N.root[W]].result);
    return te;
  }
  Gt.deserializeBoc = R;
  function C(E, N, D, G) {
    let te = (0, n.getRefsDescriptor)(E.refs, E.mask.value, E.type),
      W = (0, n.getBitsDescriptor)(E.bits);
    (G.writeUint(te, 8),
      G.writeUint(W, 8),
      G.writeBuffer((0, i.bitsToPaddedBuffer)(E.bits)));
    for (let F of N) G.writeUint(F, D * 8);
  }
  function P(E, N) {
    let D = (0, a.topologicalSort)(E),
      G = D.length,
      te = N.idx,
      W = N.crc32,
      F = !1,
      K = 0,
      Y = Math.max(Math.ceil((0, e.bitsForNumber)(G, 'uint') / 8), 1),
      ue = 0,
      we = [];
    for (let Se of D) {
      let Ee = v(Se.cell, Y);
      ((ue += Ee), we.push(ue));
    }
    let Ce = Math.max(Math.ceil((0, e.bitsForNumber)(ue, 'uint') / 8), 1),
      $ = (6 + 3 * Y + Ce + 1 * Y + (te ? G * Ce : 0) + ue + (W ? 4 : 0)) * 8,
      q = new r.BitBuilder($);
    if (
      (q.writeUint(3052313714, 32),
      q.writeBit(te),
      q.writeBit(W),
      q.writeBit(F),
      q.writeUint(K, 2),
      q.writeUint(Y, 3),
      q.writeUint(Ce, 8),
      q.writeUint(G, Y * 8),
      q.writeUint(1, Y * 8),
      q.writeUint(0, Y * 8),
      q.writeUint(ue, Ce * 8),
      q.writeUint(0, Y * 8),
      te)
    )
      for (let Se = 0; Se < G; Se++) q.writeUint(we[Se], Ce * 8);
    for (let Se = 0; Se < G; Se++) C(D[Se].cell, D[Se].refs, Y, q);
    if (W) {
      let Se = (0, s.crc32c)(q.buffer());
      q.writeBuffer(Se);
    }
    let ie = q.buffer();
    if (ie.length !== $ / 8) throw Error('Internal error');
    return ie;
  }
  return ((Gt.serializeBoc = P), Gt);
}
var tl;
function Cn() {
  if (tl) return $n;
  tl = 1;
  var t;
  (Object.defineProperty($n, '__esModule', { value: !0 }), ($n.Cell = void 0));
  const d = En(),
    u = gr(),
    a = Xa(),
    e = go(),
    r = uf(),
    n = Bf(),
    i = xf(),
    s = pr(),
    f = dt();
  let o = class lo {
    static fromBoc(v) {
      return (0, i.deserializeBoc)(v);
    }
    static fromBase64(v) {
      let w = lo.fromBoc(Buffer.from(v, 'base64'));
      if (w.length !== 1) throw new Error('Deserialized more than one cell');
      return w[0];
    }
    static fromHex(v) {
      let w = lo.fromBoc(Buffer.from(v, 'hex'));
      if (w.length !== 1) throw new Error('Deserialized more than one cell');
      return w[0];
    }
    constructor(v) {
      ((this._hashes = []),
        (this._depths = []),
        (this.beginParse = (D = !1) => {
          if (this.isExotic && !D)
            throw new Error('Exotic cells cannot be parsed');
          return new e.Slice(new s.BitReader(this.bits), this.refs);
        }),
        (this.hash = (D = 3) =>
          this._hashes[Math.min(this._hashes.length - 1, D)]),
        (this.depth = (D = 3) =>
          this._depths[Math.min(this._depths.length - 1, D)]),
        (this.level = () => this.mask.level),
        (this.equals = (D) => this.hash().equals(D.hash())),
        (this[t] = () => this.toString()));
      let w = u.BitString.EMPTY;
      v && v.bits && (w = v.bits);
      let R = [];
      v && v.refs && (R = [...v.refs]);
      let C,
        P,
        E,
        N = a.CellType.Ordinary;
      if (v && v.exotic) {
        let D = (0, r.resolveExotic)(w, R),
          G = (0, n.wonderCalculator)(D.type, w, R);
        ((E = G.mask), (P = G.depths), (C = G.hashes), (N = D.type));
      } else {
        if (R.length > 4) throw new Error('Invalid number of references');
        if (w.length > 1023)
          throw new Error(`Bits overflow: ${w.length} > 1023`);
        let D = (0, n.wonderCalculator)(a.CellType.Ordinary, w, R);
        ((E = D.mask),
          (P = D.depths),
          (C = D.hashes),
          (N = a.CellType.Ordinary));
      }
      ((this.type = N),
        (this.bits = w),
        (this.refs = R),
        (this.mask = E),
        (this._depths = P),
        (this._hashes = C),
        Object.freeze(this),
        Object.freeze(this.refs),
        Object.freeze(this.bits),
        Object.freeze(this.mask),
        Object.freeze(this._depths),
        Object.freeze(this._hashes));
    }
    get isExotic() {
      return this.type !== a.CellType.Ordinary;
    }
    toBoc(v) {
      let w = v && v.idx !== null && v.idx !== void 0 ? v.idx : !1,
        R = v && v.crc32 !== null && v.crc32 !== void 0 ? v.crc32 : !0;
      return (0, i.serializeBoc)(this, { idx: w, crc32: R });
    }
    toString(v) {
      let w = v || '',
        R = 'x';
      this.isExotic &&
        (this.type === a.CellType.MerkleProof
          ? (R = 'p')
          : this.type === a.CellType.MerkleUpdate
            ? (R = 'u')
            : this.type === a.CellType.PrunedBranch && (R = 'p'));
      let C = w + (this.isExotic ? R : 'x') + '{' + this.bits.toString() + '}';
      for (let P in this.refs) {
        const E = this.refs[P];
        C +=
          `
` + E.toString(w + ' ');
      }
      return C;
    }
    asSlice() {
      return this.beginParse();
    }
    asBuilder() {
      return (0, f.beginCell)().storeSlice(this.asSlice());
    }
  };
  return (($n.Cell = o), (t = d.inspectSymbol), (o.EMPTY = new o()), $n);
}
var rl;
function dt() {
  if (rl) return Br;
  ((rl = 1),
    Object.defineProperty(Br, '__esModule', { value: !0 }),
    (Br.Builder = Br.beginCell = void 0));
  const t = Bi(),
    d = Cn(),
    u = oc();
  function a() {
    return new e();
  }
  Br.beginCell = a;
  let e = class gc {
    constructor() {
      ((this._bits = new t.BitBuilder()), (this._refs = []));
    }
    get bits() {
      return this._bits.length;
    }
    get refs() {
      return this._refs.length;
    }
    get availableBits() {
      return 1023 - this.bits;
    }
    get availableRefs() {
      return 4 - this.refs;
    }
    storeBit(n) {
      return (this._bits.writeBit(n), this);
    }
    storeBits(n) {
      return (this._bits.writeBits(n), this);
    }
    storeBuffer(n, i) {
      if (i != null && n.length !== i)
        throw Error(`Buffer length ${n.length} is not equal to ${i}`);
      return (this._bits.writeBuffer(n), this);
    }
    storeMaybeBuffer(n, i) {
      return (
        n !== null
          ? (this.storeBit(1), this.storeBuffer(n, i))
          : this.storeBit(0),
        this
      );
    }
    storeUint(n, i) {
      return (this._bits.writeUint(n, i), this);
    }
    storeMaybeUint(n, i) {
      return (
        n != null ? (this.storeBit(1), this.storeUint(n, i)) : this.storeBit(0),
        this
      );
    }
    storeInt(n, i) {
      return (this._bits.writeInt(n, i), this);
    }
    storeMaybeInt(n, i) {
      return (
        n != null ? (this.storeBit(1), this.storeInt(n, i)) : this.storeBit(0),
        this
      );
    }
    storeVarUint(n, i) {
      return (this._bits.writeVarUint(n, i), this);
    }
    storeMaybeVarUint(n, i) {
      return (
        n != null
          ? (this.storeBit(1), this.storeVarUint(n, i))
          : this.storeBit(0),
        this
      );
    }
    storeVarInt(n, i) {
      return (this._bits.writeVarInt(n, i), this);
    }
    storeMaybeVarInt(n, i) {
      return (
        n != null
          ? (this.storeBit(1), this.storeVarInt(n, i))
          : this.storeBit(0),
        this
      );
    }
    storeCoins(n) {
      return (this._bits.writeCoins(n), this);
    }
    storeMaybeCoins(n) {
      return (
        n != null ? (this.storeBit(1), this.storeCoins(n)) : this.storeBit(0),
        this
      );
    }
    storeAddress(n) {
      return (this._bits.writeAddress(n), this);
    }
    storeRef(n) {
      if (this._refs.length >= 4) throw new Error('Too many references');
      if (n instanceof d.Cell) this._refs.push(n);
      else if (n instanceof gc) this._refs.push(n.endCell());
      else throw new Error('Invalid argument');
      return this;
    }
    storeMaybeRef(n) {
      return (
        n ? (this.storeBit(1), this.storeRef(n)) : this.storeBit(0),
        this
      );
    }
    storeSlice(n) {
      let i = n.clone();
      for (
        i.remainingBits > 0 && this.storeBits(i.loadBits(i.remainingBits));
        i.remainingRefs > 0;
      )
        this.storeRef(i.loadRef());
      return this;
    }
    storeMaybeSlice(n) {
      return (
        n ? (this.storeBit(1), this.storeSlice(n)) : this.storeBit(0),
        this
      );
    }
    storeBuilder(n) {
      return this.storeSlice(n.endCell().beginParse());
    }
    storeMaybeBuilder(n) {
      return (
        n ? (this.storeBit(1), this.storeBuilder(n)) : this.storeBit(0),
        this
      );
    }
    storeWritable(n) {
      return (typeof n == 'object' ? n.writeTo(this) : n(this), this);
    }
    storeMaybeWritable(n) {
      return (
        n ? (this.storeBit(1), this.storeWritable(n)) : this.storeBit(0),
        this
      );
    }
    store(n) {
      return (this.storeWritable(n), this);
    }
    storeStringTail(n) {
      return ((0, u.writeString)(n, this), this);
    }
    storeMaybeStringTail(n) {
      return (
        n != null
          ? (this.storeBit(1), (0, u.writeString)(n, this))
          : this.storeBit(0),
        this
      );
    }
    storeStringRefTail(n) {
      return (this.storeRef(a().storeStringTail(n)), this);
    }
    storeMaybeStringRefTail(n) {
      return (
        n != null
          ? (this.storeBit(1), this.storeStringRefTail(n))
          : this.storeBit(0),
        this
      );
    }
    storeDict(n, i, s) {
      return (n ? n.store(this, i, s) : this.storeBit(0), this);
    }
    storeDictDirect(n, i, s) {
      return (n.storeDirect(this, i, s), this);
    }
    endCell(n) {
      return new d.Cell({
        bits: this._bits.build(),
        refs: this._refs,
        exotic: n == null ? void 0 : n.exotic,
      });
    }
    asCell() {
      return this.endCell();
    }
    asSlice() {
      return this.endCell().beginParse();
    }
  };
  return ((Br.Builder = e), Br);
}
var Tr = {},
  Yt = {},
  nl;
function pc() {
  if (nl) return Yt;
  ((nl = 1),
    Object.defineProperty(Yt, '__esModule', { value: !0 }),
    (Yt.SimpleLibraryValue =
      Yt.storeSimpleLibrary =
      Yt.loadSimpleLibrary =
        void 0));
  function t(u) {
    return { public: u.loadBit(), root: u.loadRef() };
  }
  Yt.loadSimpleLibrary = t;
  function d(u) {
    return (a) => {
      (a.storeBit(u.public), a.storeRef(u.root));
    };
  }
  return (
    (Yt.storeSimpleLibrary = d),
    (Yt.SimpleLibraryValue = {
      serialize(u, a) {
        d(u)(a);
      },
      parse(u) {
        return t(u);
      },
    }),
    Yt
  );
}
var Rr = {},
  al;
function mc() {
  if (al) return Rr;
  ((al = 1),
    Object.defineProperty(Rr, '__esModule', { value: !0 }),
    (Rr.storeTickTock = Rr.loadTickTock = void 0));
  function t(u) {
    return { tick: u.loadBit(), tock: u.loadBit() };
  }
  Rr.loadTickTock = t;
  function d(u) {
    return (a) => {
      (a.storeBit(u.tick), a.storeBit(u.tock));
    };
  }
  return ((Rr.storeTickTock = d), Rr);
}
var il;
function ri() {
  if (il) return Tr;
  ((il = 1),
    Object.defineProperty(Tr, '__esModule', { value: !0 }),
    (Tr.storeStateInit = Tr.loadStateInit = void 0));
  const t = mr(),
    d = pc(),
    u = mc();
  function a(r) {
    let n;
    r.loadBit() && (n = r.loadUint(5));
    let i;
    r.loadBit() && (i = (0, u.loadTickTock)(r));
    let s = r.loadMaybeRef(),
      f = r.loadMaybeRef(),
      o = r.loadDict(t.Dictionary.Keys.BigUint(256), d.SimpleLibraryValue);
    return (
      o.size === 0 && (o = void 0),
      { splitDepth: n, special: i, code: s, data: f, libraries: o }
    );
  }
  Tr.loadStateInit = a;
  function e(r) {
    return (n) => {
      (r.splitDepth !== null && r.splitDepth !== void 0
        ? (n.storeBit(!0), n.storeUint(r.splitDepth, 5))
        : n.storeBit(!1),
        r.special !== null && r.special !== void 0
          ? (n.storeBit(!0), n.store((0, u.storeTickTock)(r.special)))
          : n.storeBit(!1),
        n.storeMaybeRef(r.code),
        n.storeMaybeRef(r.data),
        n.storeDict(r.libraries));
    };
  }
  return ((Tr.storeStateInit = e), Tr);
}
var ol;
function If() {
  if (ol) return Hn;
  ((ol = 1),
    Object.defineProperty(Hn, '__esModule', { value: !0 }),
    (Hn.contractAddress = void 0));
  const t = dt(),
    d = ri(),
    u = hr();
  function a(e, r) {
    let n = (0, t.beginCell)()
      .store((0, d.storeStateInit)(r))
      .endCell()
      .hash();
    return new u.Address(e, n);
  }
  return ((Hn.contractAddress = a), Hn);
}
var Rt = {},
  sl;
function Ef() {
  if (sl) return Rt;
  ((sl = 1),
    Object.defineProperty(Rt, '__esModule', { value: !0 }),
    (Rt.parseTuple =
      Rt.serializeTuple =
      Rt.parseTupleItem =
      Rt.serializeTupleItem =
        void 0));
  const t = dt(),
    d = BigInt('-9223372036854775808'),
    u = BigInt('9223372036854775807');
  function a(s, f) {
    if (s.type === 'null') f.storeUint(0, 8);
    else if (s.type === 'int')
      s.value <= u && s.value >= d
        ? (f.storeUint(1, 8), f.storeInt(s.value, 64))
        : (f.storeUint(256, 15), f.storeInt(s.value, 257));
    else if (s.type === 'nan') f.storeInt(767, 16);
    else if (s.type === 'cell') (f.storeUint(3, 8), f.storeRef(s.cell));
    else if (s.type === 'slice')
      (f.storeUint(4, 8),
        f.storeUint(0, 10),
        f.storeUint(s.cell.bits.length, 10),
        f.storeUint(0, 3),
        f.storeUint(s.cell.refs.length, 3),
        f.storeRef(s.cell));
    else if (s.type === 'builder') (f.storeUint(5, 8), f.storeRef(s.cell));
    else if (s.type === 'tuple') {
      let o = null,
        y = null;
      for (let v = 0; v < s.items.length; v++) {
        let w = o;
        ((o = y),
          (y = w),
          v > 1 && (o = (0, t.beginCell)().storeRef(y).storeRef(o).endCell()));
        let R = (0, t.beginCell)();
        (a(s.items[v], R), (y = R.endCell()));
      }
      (f.storeUint(7, 8),
        f.storeUint(s.items.length, 16),
        o && f.storeRef(o),
        y && f.storeRef(y));
    } else throw Error('Invalid value');
  }
  Rt.serializeTupleItem = a;
  function e(s) {
    let f = s.loadUint(8);
    if (f === 0) return { type: 'null' };
    if (f === 1) return { type: 'int', value: s.loadIntBig(64) };
    if (f === 2)
      return s.loadUint(7) === 0
        ? { type: 'int', value: s.loadIntBig(257) }
        : (s.loadBit(), { type: 'nan' });
    if (f === 3) return { type: 'cell', cell: s.loadRef() };
    if (f === 4) {
      let o = s.loadUint(10),
        y = s.loadUint(10),
        v = s.loadUint(3),
        w = s.loadUint(3),
        R = s.loadRef().beginParse();
      R.skip(o);
      let C = R.loadBits(y - o),
        P = (0, t.beginCell)().storeBits(C);
      if (v < w) {
        for (let E = 0; E < v; E++) R.loadRef();
        for (let E = 0; E < w - v; E++) P.storeRef(R.loadRef());
      }
      return { type: 'slice', cell: P.endCell() };
    } else {
      if (f === 5) return { type: 'builder', cell: s.loadRef() };
      if (f === 7) {
        let o = s.loadUint(16),
          y = [];
        if (o > 1) {
          let v = s.loadRef().beginParse(),
            w = s.loadRef().beginParse();
          y.unshift(e(w));
          for (let R = 0; R < o - 2; R++) {
            let C = v;
            ((v = C.loadRef().beginParse()),
              (w = C.loadRef().beginParse()),
              y.unshift(e(w)));
          }
          y.unshift(e(v));
        } else o === 1 && y.push(e(s.loadRef().beginParse()));
        return { type: 'tuple', items: y };
      } else throw Error('Unsupported stack item');
    }
  }
  Rt.parseTupleItem = e;
  function r(s, f) {
    if (s.length > 0) {
      let o = (0, t.beginCell)();
      (r(s.slice(0, s.length - 1), o),
        f.storeRef(o.endCell()),
        a(s[s.length - 1], f));
    }
  }
  function n(s) {
    let f = (0, t.beginCell)();
    f.storeUint(s.length, 24);
    let o = [...s];
    return (r(o, f), f.endCell());
  }
  Rt.serializeTuple = n;
  function i(s) {
    let f = [],
      o = s.beginParse(),
      y = o.loadUint(24);
    for (let v = 0; v < y; v++) {
      let w = o.loadRef();
      (f.unshift(e(o)), (o = w.beginParse()));
    }
    return f;
  }
  return ((Rt.parseTuple = i), Rt);
}
var _a = {},
  ll;
function Tf() {
  if (ll) return _a;
  ((ll = 1),
    Object.defineProperty(_a, '__esModule', { value: !0 }),
    (_a.TupleReader = void 0));
  class t {
    constructor(u) {
      this.items = [...u];
    }
    get remaining() {
      return this.items.length;
    }
    peek() {
      if (this.items.length === 0) throw Error('EOF');
      return this.items[0];
    }
    pop() {
      if (this.items.length === 0) throw Error('EOF');
      let u = this.items[0];
      return (this.items.splice(0, 1), u);
    }
    skip(u = 1) {
      for (let a = 0; a < u; a++) this.pop();
      return this;
    }
    readBigNumber() {
      let u = this.pop();
      if (u.type !== 'int') throw Error('Not a number');
      return u.value;
    }
    readBigNumberOpt() {
      let u = this.pop();
      if (u.type === 'null') return null;
      if (u.type !== 'int') throw Error('Not a number');
      return u.value;
    }
    readNumber() {
      return Number(this.readBigNumber());
    }
    readNumberOpt() {
      let u = this.readBigNumberOpt();
      return u !== null ? Number(u) : null;
    }
    readBoolean() {
      return this.readNumber() !== 0;
    }
    readBooleanOpt() {
      let u = this.readNumberOpt();
      return u !== null ? u !== 0 : null;
    }
    readAddress() {
      let u = this.readCell().beginParse().loadAddress();
      if (u !== null) return u;
      throw Error('Not an address');
    }
    readAddressOpt() {
      let u = this.readCellOpt();
      return u !== null ? u.beginParse().loadMaybeAddress() : null;
    }
    readCell() {
      let u = this.pop();
      if (u.type !== 'cell' && u.type !== 'slice' && u.type !== 'builder')
        throw Error('Not a cell: ' + u.type);
      return u.cell;
    }
    readCellOpt() {
      let u = this.pop();
      if (u.type === 'null') return null;
      if (u.type !== 'cell' && u.type !== 'slice' && u.type !== 'builder')
        throw Error('Not a cell');
      return u.cell;
    }
    readTuple() {
      let u = this.pop();
      if (u.type !== 'tuple') throw Error('Not a tuple');
      return new t(u.items);
    }
    readTupleOpt() {
      let u = this.pop();
      if (u.type === 'null') return null;
      if (u.type !== 'tuple') throw Error('Not a tuple');
      return new t(u.items);
    }
    static readLispList(u) {
      const a = [];
      let e = u;
      for (; e !== null;) {
        var r = e.pop();
        if (
          e.items.length === 0 ||
          (e.items[0].type !== 'tuple' && e.items[0].type !== 'null')
        )
          throw Error(
            'Lisp list consists only from (any, tuple) elements and ends with null',
          );
        ((e = e.readTupleOpt()), a.push(r));
      }
      return a;
    }
    readLispListDirect() {
      return this.items.length === 1 && this.items[0].type === 'null'
        ? []
        : t.readLispList(this);
    }
    readLispList() {
      return t.readLispList(this.readTupleOpt());
    }
    readBuffer() {
      let u = this.readCell().beginParse();
      if (u.remainingRefs !== 0 || u.remainingBits % 8 !== 0)
        throw Error('Not a buffer');
      return u.loadBuffer(u.remainingBits / 8);
    }
    readBufferOpt() {
      let u = this.readCellOpt();
      if (u !== null) {
        let a = u.beginParse();
        if (a.remainingRefs !== 0 || a.remainingBits % 8 !== 0)
          throw Error('Not a buffer');
        return a.loadBuffer(a.remainingBits / 8);
      } else return null;
    }
    readString() {
      return this.readCell().beginParse().loadStringTail();
    }
    readStringOpt() {
      let u = this.readCellOpt();
      return u !== null ? u.beginParse().loadStringTail() : null;
    }
  }
  return ((_a.TupleReader = t), _a);
}
var ka = {},
  ul;
function Rf() {
  if (ul) return ka;
  ((ul = 1),
    Object.defineProperty(ka, '__esModule', { value: !0 }),
    (ka.TupleBuilder = void 0));
  const t = dt(),
    d = Cn(),
    u = go();
  class a {
    constructor() {
      this._tuple = [];
    }
    writeNumber(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({ type: 'int', value: BigInt(r) });
    }
    writeBoolean(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({ type: 'int', value: r ? -1n : 0n });
    }
    writeBuffer(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({
            type: 'slice',
            cell: (0, t.beginCell)().storeBuffer(r).endCell(),
          });
    }
    writeString(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({
            type: 'slice',
            cell: (0, t.beginCell)().storeStringTail(r).endCell(),
          });
    }
    writeCell(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : r instanceof d.Cell
          ? this._tuple.push({ type: 'cell', cell: r })
          : r instanceof u.Slice &&
            this._tuple.push({ type: 'cell', cell: r.asCell() });
    }
    writeSlice(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : r instanceof d.Cell
          ? this._tuple.push({ type: 'slice', cell: r })
          : r instanceof u.Slice &&
            this._tuple.push({ type: 'slice', cell: r.asCell() });
    }
    writeBuilder(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : r instanceof d.Cell
          ? this._tuple.push({ type: 'builder', cell: r })
          : r instanceof u.Slice &&
            this._tuple.push({ type: 'builder', cell: r.asCell() });
    }
    writeTuple(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({ type: 'tuple', items: r });
    }
    writeAddress(r) {
      r == null
        ? this._tuple.push({ type: 'null' })
        : this._tuple.push({
            type: 'slice',
            cell: (0, t.beginCell)().storeAddress(r).endCell(),
          });
    }
    build() {
      return [...this._tuple];
    }
  }
  return ((ka.TupleBuilder = a), ka);
}
var eo = {},
  Jt = {},
  Mr = {},
  cl;
function yc() {
  if (cl) return Mr;
  ((cl = 1),
    Object.defineProperty(Mr, '__esModule', { value: !0 }),
    (Mr.fromNano = Mr.toNano = void 0));
  function t(u) {
    if (typeof u == 'bigint') return u * 1000000000n;
    {
      if (typeof u == 'number') {
        if (!Number.isFinite(u)) throw Error('Invalid number');
        if (Math.log10(u) <= 6)
          u = u.toLocaleString('en', {
            minimumFractionDigits: 9,
            useGrouping: !1,
          });
        else if (u - Math.trunc(u) === 0)
          u = u.toLocaleString('en', {
            maximumFractionDigits: 0,
            useGrouping: !1,
          });
        else
          throw Error(
            'Not enough precision for a number value. Use string value instead',
          );
      }
      let a = !1;
      for (; u.startsWith('-');) ((a = !a), (u = u.slice(1)));
      if (u === '.') throw Error('Invalid number');
      let e = u.split('.');
      if (e.length > 2) throw Error('Invalid number');
      let r = e[0],
        n = e[1];
      if ((r || (r = '0'), n || (n = '0'), n.length > 9))
        throw Error('Invalid number');
      for (; n.length < 9;) n += '0';
      let i = BigInt(r) * 1000000000n + BigInt(n);
      return (a && (i = -i), i);
    }
  }
  Mr.toNano = t;
  function d(u) {
    let a = BigInt(u),
      e = !1;
    a < 0 && ((e = !0), (a = -a));
    let n = (a % 1000000000n).toString();
    for (; n.length < 9;) n = '0' + n;
    n = n.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    let f = `${(a / 1000000000n).toString()}${n === '0' ? '' : `.${n}`}`;
    return (e && (f = '-' + f), f);
  }
  return ((Mr.fromNano = d), Mr);
}
var Bt = {},
  dl;
function bc() {
  if (dl) return Bt;
  ((dl = 1),
    Object.defineProperty(Bt, '__esModule', { value: !0 }),
    (Bt.packExtraCurrencyCell =
      Bt.packExtraCurrencyDict =
      Bt.storeExtraCurrency =
      Bt.loadMaybeExtraCurrency =
      Bt.loadExtraCurrency =
        void 0));
  const t = dt(),
    d = mr();
  function u(i) {
    let s =
        i instanceof d.Dictionary
          ? i
          : d.Dictionary.loadDirect(
              d.Dictionary.Keys.Uint(32),
              d.Dictionary.Values.BigVarUint(5),
              i,
            ),
      f = {};
    for (let [o, y] of s) f[o] = y;
    return f;
  }
  Bt.loadExtraCurrency = u;
  function a(i) {
    const s = i.loadMaybeRef();
    return s === null ? s : u(s);
  }
  Bt.loadMaybeExtraCurrency = a;
  function e(i) {
    return (s) => {
      s.storeDict(r(i));
    };
  }
  Bt.storeExtraCurrency = e;
  function r(i) {
    const s = d.Dictionary.empty(
      d.Dictionary.Keys.Uint(32),
      d.Dictionary.Values.BigVarUint(5),
    );
    return (Object.entries(i).map(([f, o]) => s.set(Number(f), o)), s);
  }
  Bt.packExtraCurrencyDict = r;
  function n(i) {
    return (0, t.beginCell)().storeDictDirect(r(i)).endCell();
  }
  return ((Bt.packExtraCurrencyCell = n), Bt);
}
var fl;
function Mf() {
  if (fl) return Jt;
  ((fl = 1),
    Object.defineProperty(Jt, '__esModule', { value: !0 }),
    (Jt.comment = Jt.external = Jt.internal = void 0));
  const t = hr(),
    d = Cn(),
    u = dt(),
    a = yc(),
    e = bc();
  function r(s) {
    let f = !0;
    s.bounce !== null && s.bounce !== void 0 && (f = s.bounce);
    let o;
    if (typeof s.to == 'string') o = t.Address.parse(s.to);
    else if (t.Address.isAddress(s.to)) o = s.to;
    else throw new Error(`Invalid address ${s.to}`);
    let y;
    typeof s.value == 'string' ? (y = (0, a.toNano)(s.value)) : (y = s.value);
    let v;
    s.extracurrency && (v = (0, e.packExtraCurrencyDict)(s.extracurrency));
    let w = d.Cell.EMPTY;
    return (
      typeof s.body == 'string'
        ? (w = (0, u.beginCell)()
            .storeUint(0, 32)
            .storeStringTail(s.body)
            .endCell())
        : s.body && (w = s.body),
      {
        info: {
          type: 'internal',
          dest: o,
          value: { coins: y, other: v },
          bounce: f,
          ihrDisabled: !0,
          bounced: !1,
          ihrFee: 0n,
          forwardFee: 0n,
          createdAt: 0,
          createdLt: 0n,
        },
        init: s.init ?? void 0,
        body: w,
      }
    );
  }
  Jt.internal = r;
  function n(s) {
    let f;
    if (typeof s.to == 'string') f = t.Address.parse(s.to);
    else if (t.Address.isAddress(s.to)) f = s.to;
    else throw new Error(`Invalid address ${s.to}`);
    return {
      info: { type: 'external-in', dest: f, importFee: 0n },
      init: s.init ?? void 0,
      body: s.body || d.Cell.EMPTY,
    };
  }
  Jt.external = n;
  function i(s) {
    return (0, u.beginCell)().storeUint(0, 32).storeStringTail(s).endCell();
  }
  return ((Jt.comment = i), Jt);
}
var Or = {},
  Ur = {},
  jr = {},
  hl;
function wc() {
  if (hl) return jr;
  ((hl = 1),
    Object.defineProperty(jr, '__esModule', { value: !0 }),
    (jr.storeAccountState = jr.loadAccountState = void 0));
  const t = ri();
  function d(a) {
    return a.loadBit()
      ? { type: 'active', state: (0, t.loadStateInit)(a) }
      : a.loadBit()
        ? { type: 'frozen', stateHash: a.loadUintBig(256) }
        : { type: 'uninit' };
  }
  jr.loadAccountState = d;
  function u(a) {
    return (e) => {
      a.type === 'active'
        ? (e.storeBit(!0), e.store((0, t.storeStateInit)(a.state)))
        : a.type === 'frozen'
          ? (e.storeBit(!1), e.storeBit(!0), e.storeUint(a.stateHash, 256))
          : a.type === 'uninit' && (e.storeBit(!1), e.storeBit(!1));
    };
  }
  return ((jr.storeAccountState = u), jr);
}
var zr = {},
  gl;
function nr() {
  if (gl) return zr;
  ((gl = 1),
    Object.defineProperty(zr, '__esModule', { value: !0 }),
    (zr.storeCurrencyCollection = zr.loadCurrencyCollection = void 0));
  const t = mr();
  function d(a) {
    const e = a.loadCoins(),
      r = a.loadDict(
        t.Dictionary.Keys.Uint(32),
        t.Dictionary.Values.BigVarUint(5),
      );
    return r.size === 0 ? { coins: e } : { other: r, coins: e };
  }
  zr.loadCurrencyCollection = d;
  function u(a) {
    return (e) => {
      (e.storeCoins(a.coins), a.other ? e.storeDict(a.other) : e.storeBit(0));
    };
  }
  return ((zr.storeCurrencyCollection = u), zr);
}
var pl;
function vc() {
  if (pl) return Ur;
  ((pl = 1),
    Object.defineProperty(Ur, '__esModule', { value: !0 }),
    (Ur.storeAccountStorage = Ur.loadAccountStorage = void 0));
  const t = wc(),
    d = nr();
  function u(e) {
    return {
      lastTransLt: e.loadUintBig(64),
      balance: (0, d.loadCurrencyCollection)(e),
      state: (0, t.loadAccountState)(e),
    };
  }
  Ur.loadAccountStorage = u;
  function a(e) {
    return (r) => {
      (r.storeUint(e.lastTransLt, 64),
        r.store((0, d.storeCurrencyCollection)(e.balance)),
        r.store((0, t.storeAccountState)(e.state)));
    };
  }
  return ((Ur.storeAccountStorage = a), Ur);
}
var Dr = {},
  Nr = {},
  ml;
function Of() {
  if (ml) return Nr;
  ((ml = 1),
    Object.defineProperty(Nr, '__esModule', { value: !0 }),
    (Nr.storeStorageExtraInfo = Nr.loadStorageExtraInfo = void 0));
  function t(u) {
    let a = u.loadUint(3);
    if (a === 0) return null;
    if (a === 1) return { dictHash: u.loadUintBig(256) };
    throw new Error(`Invalid storage extra info header: ${a}`);
  }
  Nr.loadStorageExtraInfo = t;
  function d(u) {
    return (a) => {
      u === null || typeof u > 'u'
        ? a.storeUint(0, 3)
        : (a.storeUint(1, 3), a.storeUint(u.dictHash, 256));
    };
  }
  return ((Nr.storeStorageExtraInfo = d), Nr);
}
var qr = {},
  yl;
function Ai() {
  if (yl) return qr;
  ((yl = 1),
    Object.defineProperty(qr, '__esModule', { value: !0 }),
    (qr.storeStorageUsed = qr.loadStorageUsed = void 0));
  function t(u) {
    return { cells: u.loadVarUintBig(3), bits: u.loadVarUintBig(3) };
  }
  qr.loadStorageUsed = t;
  function d(u) {
    return (a) => {
      (a.storeVarUint(u.cells, 3), a.storeVarUint(u.bits, 3));
    };
  }
  return ((qr.storeStorageUsed = d), qr);
}
var bl;
function _c() {
  if (bl) return Dr;
  ((bl = 1),
    Object.defineProperty(Dr, '__esModule', { value: !0 }),
    (Dr.storeStorageInfo = Dr.loadStorageInfo = void 0));
  const t = Of(),
    d = Ai();
  function u(e) {
    return {
      used: (0, d.loadStorageUsed)(e),
      storageExtra: (0, t.loadStorageExtraInfo)(e),
      lastPaid: e.loadUint(32),
      duePayment: e.loadMaybeCoins(),
    };
  }
  Dr.loadStorageInfo = u;
  function a(e) {
    return (r) => {
      (r.store((0, d.storeStorageUsed)(e.used)),
        r.store((0, t.storeStorageExtraInfo)(e.storageExtra)),
        r.storeUint(e.lastPaid, 32),
        r.storeMaybeCoins(e.duePayment));
    };
  }
  return ((Dr.storeStorageInfo = a), Dr);
}
var wl;
function kc() {
  if (wl) return Or;
  ((wl = 1),
    Object.defineProperty(Or, '__esModule', { value: !0 }),
    (Or.storeAccount = Or.loadAccount = void 0));
  const t = vc(),
    d = _c();
  function u(e) {
    return {
      addr: e.loadAddress(),
      storageStats: (0, d.loadStorageInfo)(e),
      storage: (0, t.loadAccountStorage)(e),
    };
  }
  Or.loadAccount = u;
  function a(e) {
    return (r) => {
      (r.storeAddress(e.addr),
        r.store((0, d.storeStorageInfo)(e.storageStats)),
        r.store((0, t.storeAccountStorage)(e.storage)));
    };
  }
  return ((Or.storeAccount = a), Or);
}
var Lr = {},
  vl;
function Cc() {
  if (vl) return Lr;
  ((vl = 1),
    Object.defineProperty(Lr, '__esModule', { value: !0 }),
    (Lr.storeAccountStatus = Lr.loadAccountStatus = void 0));
  function t(u) {
    const a = u.loadUint(2);
    if (a === 0) return 'uninitialized';
    if (a === 1) return 'frozen';
    if (a === 2) return 'active';
    if (a === 3) return 'non-existing';
    throw Error('Invalid data');
  }
  Lr.loadAccountStatus = t;
  function d(u) {
    return (a) => {
      if (u === 'uninitialized') a.storeUint(0, 2);
      else if (u === 'frozen') a.storeUint(1, 2);
      else if (u === 'active') a.storeUint(2, 2);
      else if (u === 'non-existing') a.storeUint(3, 2);
      else throw Error('Invalid data');
      return a;
    };
  }
  return ((Lr.storeAccountStatus = d), Lr);
}
var Vr = {},
  _l;
function vo() {
  if (_l) return Vr;
  ((_l = 1),
    Object.defineProperty(Vr, '__esModule', { value: !0 }),
    (Vr.storeAccountStatusChange = Vr.loadAccountStatusChange = void 0));
  function t(u) {
    return u.loadBit() ? (u.loadBit() ? 'deleted' : 'frozen') : 'unchanged';
  }
  Vr.loadAccountStatusChange = t;
  function d(u) {
    return (a) => {
      if (u == 'unchanged') a.storeBit(0);
      else if (u === 'frozen') (a.storeBit(1), a.storeBit(0));
      else if (u === 'deleted') (a.storeBit(1), a.storeBit(1));
      else throw Error('Invalid account status change');
    };
  }
  return ((Vr.storeAccountStatusChange = d), Vr);
}
var Mt = {},
  Fr = {},
  Zr = {},
  kl;
function Sc() {
  if (kl) return Zr;
  ((kl = 1),
    Object.defineProperty(Zr, '__esModule', { value: !0 }),
    (Zr.storeCommonMessageInfoRelaxed = Zr.loadCommonMessageInfoRelaxed =
      void 0));
  const t = nr();
  function d(a) {
    if (!a.loadBit()) {
      const s = a.loadBit(),
        f = a.loadBit(),
        o = a.loadBit(),
        y = a.loadMaybeAddress(),
        v = a.loadAddress(),
        w = (0, t.loadCurrencyCollection)(a),
        R = a.loadCoins(),
        C = a.loadCoins(),
        P = a.loadUintBig(64),
        E = a.loadUint(32);
      return {
        type: 'internal',
        ihrDisabled: s,
        bounce: f,
        bounced: o,
        src: y,
        dest: v,
        value: w,
        ihrFee: R,
        forwardFee: C,
        createdLt: P,
        createdAt: E,
      };
    }
    if (!a.loadBit())
      throw Error(
        'External In message is not possible for CommonMessageInfoRelaxed',
      );
    const e = a.loadMaybeAddress(),
      r = a.loadMaybeExternalAddress(),
      n = a.loadUintBig(64),
      i = a.loadUint(32);
    return {
      type: 'external-out',
      src: e,
      dest: r,
      createdLt: n,
      createdAt: i,
    };
  }
  Zr.loadCommonMessageInfoRelaxed = d;
  function u(a) {
    return (e) => {
      if (a.type === 'internal')
        (e.storeBit(0),
          e.storeBit(a.ihrDisabled),
          e.storeBit(a.bounce),
          e.storeBit(a.bounced),
          e.storeAddress(a.src),
          e.storeAddress(a.dest),
          e.store((0, t.storeCurrencyCollection)(a.value)),
          e.storeCoins(a.ihrFee),
          e.storeCoins(a.forwardFee),
          e.storeUint(a.createdLt, 64),
          e.storeUint(a.createdAt, 32));
      else if (a.type === 'external-out')
        (e.storeBit(1),
          e.storeBit(1),
          e.storeAddress(a.src),
          e.storeAddress(a.dest),
          e.storeUint(a.createdLt, 64),
          e.storeUint(a.createdAt, 32));
      else throw new Error('Unknown CommonMessageInfo type');
    };
  }
  return ((Zr.storeCommonMessageInfoRelaxed = u), Zr);
}
var Cl;
function Bc() {
  if (Cl) return Fr;
  ((Cl = 1),
    Object.defineProperty(Fr, '__esModule', { value: !0 }),
    (Fr.storeMessageRelaxed = Fr.loadMessageRelaxed = void 0));
  const t = dt(),
    d = Sc(),
    u = ri();
  function a(r) {
    const n = (0, d.loadCommonMessageInfoRelaxed)(r);
    let i = null;
    r.loadBit() &&
      (r.loadBit()
        ? (i = (0, u.loadStateInit)(r.loadRef().beginParse()))
        : (i = (0, u.loadStateInit)(r)));
    const s = r.loadBit() ? r.loadRef() : r.asCell();
    return { info: n, init: i, body: s };
  }
  Fr.loadMessageRelaxed = a;
  function e(r, n) {
    return (i) => {
      if ((i.store((0, d.storeCommonMessageInfoRelaxed)(r.info)), r.init)) {
        i.storeBit(!0);
        let f = (0, t.beginCell)().store((0, u.storeStateInit)(r.init)),
          o = !1;
        (n && n.forceRef
          ? (o = !0)
          : i.availableBits - 2 >= f.bits
            ? (o = !1)
            : (o = !0),
          o
            ? (i.storeBit(!0), i.storeRef(f))
            : (i.storeBit(!1), i.storeBuilder(f)));
      } else i.storeBit(!1);
      let s = !1;
      (n && n.forceRef
        ? (s = !0)
        : i.availableBits - 1 >= r.body.bits.length &&
            i.refs + r.body.refs.length <= 4 &&
            !r.body.isExotic
          ? (s = !1)
          : (s = !0),
        s
          ? (i.storeBit(!0), i.storeRef(r.body))
          : (i.storeBit(!1), i.storeBuilder(r.body.asBuilder())));
    };
  }
  return ((Fr.storeMessageRelaxed = e), Fr);
}
var Hr = {},
  Sl;
function Pc() {
  if (Sl) return Hr;
  ((Sl = 1),
    Object.defineProperty(Hr, '__esModule', { value: !0 }),
    (Hr.storeLibRef = Hr.loadLibRef = void 0));
  function t(u) {
    return u.loadUint(1) === 0
      ? { type: 'hash', libHash: u.loadBuffer(32) }
      : { type: 'ref', library: u.loadRef() };
  }
  Hr.loadLibRef = t;
  function d(u) {
    return (a) => {
      u.type === 'hash'
        ? (a.storeUint(0, 1), a.storeBuffer(u.libHash))
        : (a.storeUint(1, 1), a.storeRef(u.library));
    };
  }
  return ((Hr.storeLibRef = d), Hr);
}
var Bl;
function Uf() {
  if (Bl) return Mt;
  ((Bl = 1),
    Object.defineProperty(Mt, '__esModule', { value: !0 }),
    (Mt.loadOutList =
      Mt.storeOutList =
      Mt.loadOutAction =
      Mt.storeOutAction =
        void 0));
  const t = Bc(),
    d = dt(),
    u = nr(),
    a = Pc();
  function e(P) {
    switch (P.type) {
      case 'sendMsg':
        return n(P);
      case 'setCode':
        return s(P);
      case 'reserve':
        return o(P);
      case 'changeLibrary':
        return v(P);
      default:
        throw new Error(`Unknown action type ${P.type}`);
    }
  }
  Mt.storeOutAction = e;
  const r = 247711853;
  function n(P) {
    return (E) => {
      E.storeUint(r, 32)
        .storeUint(P.mode, 8)
        .storeRef(
          (0, d.beginCell)()
            .store((0, t.storeMessageRelaxed)(P.outMsg))
            .endCell(),
        );
    };
  }
  const i = 2907562126;
  function s(P) {
    return (E) => {
      E.storeUint(i, 32).storeRef(P.newCode);
    };
  }
  const f = 921090057;
  function o(P) {
    return (E) => {
      E.storeUint(f, 32)
        .storeUint(P.mode, 8)
        .store((0, u.storeCurrencyCollection)(P.currency));
    };
  }
  const y = 653925844;
  function v(P) {
    return (E) => {
      E.storeUint(y, 32)
        .storeUint(P.mode, 7)
        .store((0, a.storeLibRef)(P.libRef));
    };
  }
  function w(P) {
    const E = P.loadUint(32);
    if (E === r) {
      const N = P.loadUint(8),
        D = (0, t.loadMessageRelaxed)(P.loadRef().beginParse());
      return { type: 'sendMsg', mode: N, outMsg: D };
    }
    if (E === i) return { type: 'setCode', newCode: P.loadRef() };
    if (E === f) {
      const N = P.loadUint(8),
        D = (0, u.loadCurrencyCollection)(P);
      return { type: 'reserve', mode: N, currency: D };
    }
    if (E === y) {
      const N = P.loadUint(7),
        D = (0, a.loadLibRef)(P);
      return { type: 'changeLibrary', mode: N, libRef: D };
    }
    throw new Error(`Unknown out action tag 0x${E.toString(16)}`);
  }
  Mt.loadOutAction = w;
  function R(P) {
    const E = P.reduce(
      (N, D) => (0, d.beginCell)().storeRef(N).store(e(D)).endCell(),
      (0, d.beginCell)().endCell(),
    );
    return (N) => {
      N.storeSlice(E.beginParse());
    };
  }
  Mt.storeOutList = R;
  function C(P) {
    const E = [];
    for (; P.remainingRefs;) {
      const N = P.loadRef();
      (E.push(w(P)), (P = N.beginParse()));
    }
    return E.reverse();
  }
  return ((Mt.loadOutList = C), Mt);
}
var Wr = {},
  Pl;
function Ac() {
  if (Pl) return Wr;
  ((Pl = 1),
    Object.defineProperty(Wr, '__esModule', { value: !0 }),
    (Wr.storeCommonMessageInfo = Wr.loadCommonMessageInfo = void 0));
  const t = nr();
  function d(a) {
    if (!a.loadBit()) {
      const s = a.loadBit(),
        f = a.loadBit(),
        o = a.loadBit(),
        y = a.loadAddress(),
        v = a.loadAddress(),
        w = (0, t.loadCurrencyCollection)(a),
        R = a.loadCoins(),
        C = a.loadCoins(),
        P = a.loadUintBig(64),
        E = a.loadUint(32);
      return {
        type: 'internal',
        ihrDisabled: s,
        bounce: f,
        bounced: o,
        src: y,
        dest: v,
        value: w,
        ihrFee: R,
        forwardFee: C,
        createdLt: P,
        createdAt: E,
      };
    }
    if (!a.loadBit()) {
      const s = a.loadMaybeExternalAddress(),
        f = a.loadAddress(),
        o = a.loadCoins();
      return { type: 'external-in', src: s, dest: f, importFee: o };
    }
    const e = a.loadAddress(),
      r = a.loadMaybeExternalAddress(),
      n = a.loadUintBig(64),
      i = a.loadUint(32);
    return {
      type: 'external-out',
      src: e,
      dest: r,
      createdLt: n,
      createdAt: i,
    };
  }
  Wr.loadCommonMessageInfo = d;
  function u(a) {
    return (e) => {
      if (a.type === 'internal')
        (e.storeBit(0),
          e.storeBit(a.ihrDisabled),
          e.storeBit(a.bounce),
          e.storeBit(a.bounced),
          e.storeAddress(a.src),
          e.storeAddress(a.dest),
          e.store((0, t.storeCurrencyCollection)(a.value)),
          e.storeCoins(a.ihrFee),
          e.storeCoins(a.forwardFee),
          e.storeUint(a.createdLt, 64),
          e.storeUint(a.createdAt, 32));
      else if (a.type === 'external-in')
        (e.storeBit(1),
          e.storeBit(0),
          e.storeAddress(a.src),
          e.storeAddress(a.dest),
          e.storeCoins(a.importFee));
      else if (a.type === 'external-out')
        (e.storeBit(1),
          e.storeBit(1),
          e.storeAddress(a.src),
          e.storeAddress(a.dest),
          e.storeUint(a.createdLt, 64),
          e.storeUint(a.createdAt, 32));
      else throw new Error('Unknown CommonMessageInfo type');
    };
  }
  return ((Wr.storeCommonMessageInfo = u), Wr);
}
var Kr = {},
  Al;
function xc() {
  if (Al) return Kr;
  ((Al = 1),
    Object.defineProperty(Kr, '__esModule', { value: !0 }),
    (Kr.storeComputeSkipReason = Kr.loadComputeSkipReason = void 0));
  function t(u) {
    let a = u.loadUint(2);
    if (a === 0) return 'no-state';
    if (a === 1) return 'bad-state';
    if (a === 2) return 'no-gas';
    throw new Error(`Unknown ComputeSkipReason: ${a}`);
  }
  Kr.loadComputeSkipReason = t;
  function d(u) {
    return (a) => {
      if (u === 'no-state') a.storeUint(0, 2);
      else if (u === 'bad-state') a.storeUint(1, 2);
      else if (u === 'no-gas') a.storeUint(2, 2);
      else throw new Error(`Unknown ComputeSkipReason: ${u}`);
    };
  }
  return ((Kr.storeComputeSkipReason = d), Kr);
}
var $r = {},
  xl;
function Ic() {
  if (xl) return $r;
  ((xl = 1),
    Object.defineProperty($r, '__esModule', { value: !0 }),
    ($r.storeDepthBalanceInfo = $r.loadDepthBalanceInfo = void 0));
  const t = nr();
  function d(a) {
    return {
      splitDepth: a.loadUint(5),
      balance: (0, t.loadCurrencyCollection)(a),
    };
  }
  $r.loadDepthBalanceInfo = d;
  function u(a) {
    return (e) => {
      (e.storeUint(a.splitDepth, 5),
        e.store((0, t.storeCurrencyCollection)(a.balance)));
    };
  }
  return (($r.storeDepthBalanceInfo = u), $r);
}
var Gr = {},
  Il;
function Ec() {
  if (Il) return Gr;
  ((Il = 1),
    Object.defineProperty(Gr, '__esModule', { value: !0 }),
    (Gr.storeHashUpdate = Gr.loadHashUpdate = void 0));
  function t(u) {
    if (u.loadUint(8) !== 114) throw Error('Invalid data');
    const a = u.loadBuffer(32),
      e = u.loadBuffer(32);
    return { oldHash: a, newHash: e };
  }
  Gr.loadHashUpdate = t;
  function d(u) {
    return (a) => {
      (a.storeUint(114, 8), a.storeBuffer(u.oldHash), a.storeBuffer(u.newHash));
    };
  }
  return ((Gr.storeHashUpdate = d), Gr);
}
var Ca = {},
  El;
function Tc() {
  if (El) return Ca;
  ((El = 1),
    Object.defineProperty(Ca, '__esModule', { value: !0 }),
    (Ca.loadMasterchainStateExtra = void 0));
  const t = mr(),
    d = nr();
  function u(a) {
    if (a.loadUint(16) !== 52262) throw Error('Invalid data');
    a.loadBit() && a.loadRef();
    let e = a.loadUintBig(256),
      r = t.Dictionary.load(
        t.Dictionary.Keys.Int(32),
        t.Dictionary.Values.Cell(),
        a,
      );
    const n = (0, d.loadCurrencyCollection)(a);
    return { config: r, configAddress: e, globalBalance: n };
  }
  return ((Ca.loadMasterchainStateExtra = u), Ca);
}
var Qt = {},
  Tl;
function Rc() {
  if (Tl) return Qt;
  ((Tl = 1),
    Object.defineProperty(Qt, '__esModule', { value: !0 }),
    (Qt.MessageValue = Qt.storeMessage = Qt.loadMessage = void 0));
  const t = dt(),
    d = Ac(),
    u = ri();
  function a(r) {
    const n = (0, d.loadCommonMessageInfo)(r);
    let i = null;
    r.loadBit() &&
      (r.loadBit()
        ? (i = (0, u.loadStateInit)(r.loadRef().beginParse()))
        : (i = (0, u.loadStateInit)(r)));
    const s = r.loadBit() ? r.loadRef() : r.asCell();
    return { info: n, init: i, body: s };
  }
  Qt.loadMessage = a;
  function e(r, n) {
    return (i) => {
      if ((i.store((0, d.storeCommonMessageInfo)(r.info)), r.init)) {
        i.storeBit(!0);
        let f = (0, t.beginCell)().store((0, u.storeStateInit)(r.init)),
          o = !1;
        (n && n.forceRef
          ? (o = !0)
          : (o = i.availableBits - 2 < f.bits + r.body.bits.length),
          o
            ? (i.storeBit(!0), i.storeRef(f))
            : (i.storeBit(!1), i.storeBuilder(f)));
      } else i.storeBit(!1);
      let s = !1;
      (n && n.forceRef
        ? (s = !0)
        : (s =
            i.availableBits - 1 < r.body.bits.length ||
            i.refs + r.body.refs.length > 4),
        s
          ? (i.storeBit(!0), i.storeRef(r.body))
          : (i.storeBit(!1), i.storeBuilder(r.body.asBuilder())));
    };
  }
  return (
    (Qt.storeMessage = e),
    (Qt.MessageValue = {
      serialize(r, n) {
        n.storeRef((0, t.beginCell)().store(e(r)));
      },
      parse(r) {
        return a(r.loadRef().beginParse());
      },
    }),
    Qt
  );
}
var Sa = {},
  Rl;
function jf() {
  if (Rl) return Sa;
  ((Rl = 1),
    Object.defineProperty(Sa, '__esModule', { value: !0 }),
    (Sa.SendMode = void 0));
  var t;
  return (
    (function (d) {
      ((d[(d.CARRY_ALL_REMAINING_BALANCE = 128)] =
        'CARRY_ALL_REMAINING_BALANCE'),
        (d[(d.CARRY_ALL_REMAINING_INCOMING_VALUE = 64)] =
          'CARRY_ALL_REMAINING_INCOMING_VALUE'),
        (d[(d.DESTROY_ACCOUNT_IF_ZERO = 32)] = 'DESTROY_ACCOUNT_IF_ZERO'),
        (d[(d.PAY_GAS_SEPARATELY = 1)] = 'PAY_GAS_SEPARATELY'),
        (d[(d.IGNORE_ERRORS = 2)] = 'IGNORE_ERRORS'),
        (d[(d.NONE = 0)] = 'NONE'));
    })(t || (Sa.SendMode = t = {})),
    Sa
  );
}
var Ba = {},
  Ml;
function zf() {
  if (Ml) return Ba;
  ((Ml = 1),
    Object.defineProperty(Ba, '__esModule', { value: !0 }),
    (Ba.ReserveMode = void 0));
  var t;
  return (
    (function (d) {
      ((d[(d.THIS_AMOUNT = 0)] = 'THIS_AMOUNT'),
        (d[(d.LEAVE_THIS_AMOUNT = 1)] = 'LEAVE_THIS_AMOUNT'),
        (d[(d.AT_MOST_THIS_AMOUNT = 2)] = 'AT_MOST_THIS_AMOUNT'),
        (d[(d.LEAVE_MAX_THIS_AMOUNT = 3)] = 'LEAVE_MAX_THIS_AMOUNT'),
        (d[(d.BEFORE_BALANCE_PLUS_THIS_AMOUNT = 4)] =
          'BEFORE_BALANCE_PLUS_THIS_AMOUNT'),
        (d[(d.LEAVE_BBALANCE_PLUS_THIS_AMOUNT = 5)] =
          'LEAVE_BBALANCE_PLUS_THIS_AMOUNT'),
        (d[(d.BEFORE_BALANCE_MINUS_THIS_AMOUNT = 12)] =
          'BEFORE_BALANCE_MINUS_THIS_AMOUNT'),
        (d[(d.LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT = 13)] =
          'LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT'));
    })(t || (Ba.ReserveMode = t = {})),
    Ba
  );
}
var Yr = {},
  Ol;
function Mc() {
  if (Ol) return Yr;
  ((Ol = 1),
    Object.defineProperty(Yr, '__esModule', { value: !0 }),
    (Yr.storeShardAccount = Yr.loadShardAccount = void 0));
  const t = dt(),
    d = kc();
  function u(e) {
    let r = e.loadRef(),
      n;
    if (!r.isExotic) {
      let i = r.beginParse();
      i.loadBit() && (n = (0, d.loadAccount)(i));
    }
    return {
      account: n,
      lastTransactionHash: e.loadUintBig(256),
      lastTransactionLt: e.loadUintBig(64),
    };
  }
  Yr.loadShardAccount = u;
  function a(e) {
    return (r) => {
      (e.account
        ? r.storeRef(
            (0, t.beginCell)()
              .storeBit(!0)
              .store((0, d.storeAccount)(e.account)),
          )
        : r.storeRef((0, t.beginCell)().storeBit(!1)),
        r.storeUint(e.lastTransactionHash, 256),
        r.storeUint(e.lastTransactionLt, 64));
    };
  }
  return ((Yr.storeShardAccount = a), Yr);
}
var to = {},
  Ul;
function Oc() {
  return (
    Ul ||
      ((Ul = 1),
      (function (t) {
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.storeShardAccounts =
            t.loadShardAccounts =
            t.ShardAccountRefValue =
              void 0));
        const d = mr(),
          u = Ic(),
          a = Mc();
        t.ShardAccountRefValue = {
          parse: (n) => {
            let i = (0, u.loadDepthBalanceInfo)(n),
              s = (0, a.loadShardAccount)(n);
            return { depthBalanceInfo: i, shardAccount: s };
          },
          serialize(n, i) {
            (i.store((0, u.storeDepthBalanceInfo)(n.depthBalanceInfo)),
              i.store((0, a.storeShardAccount)(n.shardAccount)));
          },
        };
        function e(n) {
          return d.Dictionary.load(
            d.Dictionary.Keys.BigUint(256),
            t.ShardAccountRefValue,
            n,
          );
        }
        t.loadShardAccounts = e;
        function r(n) {
          return (i) => {
            i.storeDict(n);
          };
        }
        t.storeShardAccounts = r;
      })(to)),
    to
  );
}
var Jr = {},
  jl;
function Uc() {
  if (jl) return Jr;
  ((jl = 1),
    Object.defineProperty(Jr, '__esModule', { value: !0 }),
    (Jr.storeShardIdent = Jr.loadShardIdent = void 0));
  function t(u) {
    if (u.loadUint(2) !== 0) throw Error('Invalid data');
    return {
      shardPrefixBits: u.loadUint(6),
      workchainId: u.loadInt(32),
      shardPrefix: u.loadUintBig(64),
    };
  }
  Jr.loadShardIdent = t;
  function d(u) {
    return (a) => {
      (a.storeUint(0, 2),
        a.storeUint(u.shardPrefixBits, 6),
        a.storeInt(u.workchainId, 32),
        a.storeUint(u.shardPrefix, 64));
    };
  }
  return ((Jr.storeShardIdent = d), Jr);
}
var Pa = {},
  zl;
function Df() {
  if (zl) return Pa;
  ((zl = 1),
    Object.defineProperty(Pa, '__esModule', { value: !0 }),
    (Pa.loadShardStateUnsplit = void 0));
  const t = Tc(),
    d = Oc(),
    u = Uc();
  function a(e) {
    if (e.loadUint(32) !== 2418257890) throw Error('Invalid data');
    let r = e.loadInt(32),
      n = (0, u.loadShardIdent)(e),
      i = e.loadUint(32),
      s = e.loadUint(32),
      f = e.loadUint(32),
      o = e.loadUintBig(64),
      y = e.loadUint(32);
    e.loadRef();
    let v = e.loadBit(),
      w = e.loadRef(),
      R;
    (w.isExotic || (R = (0, d.loadShardAccounts)(w.beginParse())), e.loadRef());
    let C = e.loadBit(),
      P = null;
    if (C) {
      let E = e.loadRef();
      E.isExotic || (P = (0, t.loadMasterchainStateExtra)(E.beginParse()));
    }
    return {
      globalId: r,
      shardId: n,
      seqno: i,
      vertSeqNo: s,
      genUtime: f,
      genLt: o,
      minRefMcSeqno: y,
      beforeSplit: v,
      accounts: R,
      extras: P,
    };
  }
  return ((Pa.loadShardStateUnsplit = a), Pa);
}
var Qr = {},
  Dl;
function jc() {
  return (
    Dl ||
      ((Dl = 1),
      Object.defineProperty(Qr, '__esModule', { value: !0 }),
      (Qr.signatureDomainEmptyTag = Qr.signatureDomainL2Tag = void 0),
      (Qr.signatureDomainL2Tag = 1907576545),
      (Qr.signatureDomainEmptyTag = 236803867)),
    Qr
  );
}
var Xr = {},
  Nl;
function zc() {
  if (Nl) return Xr;
  ((Nl = 1),
    Object.defineProperty(Xr, '__esModule', { value: !0 }),
    (Xr.storeSplitMergeInfo = Xr.loadSplitMergeInfo = void 0));
  function t(u) {
    let a = u.loadUint(6),
      e = u.loadUint(6),
      r = u.loadUintBig(256),
      n = u.loadUintBig(256);
    return {
      currentShardPrefixLength: a,
      accountSplitDepth: e,
      thisAddress: r,
      siblingAddress: n,
    };
  }
  Xr.loadSplitMergeInfo = t;
  function d(u) {
    return (a) => {
      (a.storeUint(u.currentShardPrefixLength, 6),
        a.storeUint(u.accountSplitDepth, 6),
        a.storeUint(u.thisAddress, 256),
        a.storeUint(u.siblingAddress, 256));
    };
  }
  return ((Xr.storeSplitMergeInfo = d), Xr);
}
var en = {},
  tn = {},
  rn = {},
  ql;
function Dc() {
  if (ql) return rn;
  ((ql = 1),
    Object.defineProperty(rn, '__esModule', { value: !0 }),
    (rn.storeTransactionActionPhase = rn.loadTransactionActionPhase = void 0));
  const t = vo(),
    d = Ai();
  function u(e) {
    let r = e.loadBit(),
      n = e.loadBit(),
      i = e.loadBit(),
      s = (0, t.loadAccountStatusChange)(e),
      f = e.loadBit() ? e.loadCoins() : void 0,
      o = e.loadBit() ? e.loadCoins() : void 0,
      y = e.loadInt(32),
      v = e.loadBit() ? e.loadInt(32) : void 0,
      w = e.loadUint(16),
      R = e.loadUint(16),
      C = e.loadUint(16),
      P = e.loadUint(16),
      E = e.loadUintBig(256),
      N = (0, d.loadStorageUsed)(e);
    return {
      success: r,
      valid: n,
      noFunds: i,
      statusChange: s,
      totalFwdFees: f,
      totalActionFees: o,
      resultCode: y,
      resultArg: v,
      totalActions: w,
      specActions: R,
      skippedActions: C,
      messagesCreated: P,
      actionListHash: E,
      totalMessageSize: N,
    };
  }
  rn.loadTransactionActionPhase = u;
  function a(e) {
    return (r) => {
      (r.storeBit(e.success),
        r.storeBit(e.valid),
        r.storeBit(e.noFunds),
        r.store((0, t.storeAccountStatusChange)(e.statusChange)),
        r.storeMaybeCoins(e.totalFwdFees),
        r.storeMaybeCoins(e.totalActionFees),
        r.storeInt(e.resultCode, 32),
        r.storeMaybeInt(e.resultArg, 32),
        r.storeUint(e.totalActions, 16),
        r.storeUint(e.specActions, 16),
        r.storeUint(e.skippedActions, 16),
        r.storeUint(e.messagesCreated, 16),
        r.storeUint(e.actionListHash, 256),
        r.store((0, d.storeStorageUsed)(e.totalMessageSize)));
    };
  }
  return ((rn.storeTransactionActionPhase = a), rn);
}
var nn = {},
  Ll;
function Nc() {
  if (Ll) return nn;
  ((Ll = 1),
    Object.defineProperty(nn, '__esModule', { value: !0 }),
    (nn.storeTransactionBouncePhase = nn.loadTransactionBouncePhase = void 0));
  const t = Ai();
  function d(a) {
    if (a.loadBit()) {
      let e = (0, t.loadStorageUsed)(a),
        r = a.loadCoins(),
        n = a.loadCoins();
      return { type: 'ok', messageSize: e, messageFees: r, forwardFees: n };
    }
    if (a.loadBit()) {
      let e = (0, t.loadStorageUsed)(a),
        r = a.loadCoins();
      return { type: 'no-funds', messageSize: e, requiredForwardFees: r };
    }
    return { type: 'negative-funds' };
  }
  nn.loadTransactionBouncePhase = d;
  function u(a) {
    return (e) => {
      if (a.type === 'ok')
        (e.storeBit(!0),
          e.store((0, t.storeStorageUsed)(a.messageSize)),
          e.storeCoins(a.messageFees),
          e.storeCoins(a.forwardFees));
      else if (a.type === 'negative-funds') (e.storeBit(!1), e.storeBit(!1));
      else if (a.type === 'no-funds')
        (e.storeBit(!1),
          e.storeBit(!0),
          e.store((0, t.storeStorageUsed)(a.messageSize)),
          e.storeCoins(a.requiredForwardFees));
      else throw new Error('Invalid TransactionBouncePhase type');
    };
  }
  return ((nn.storeTransactionBouncePhase = u), nn);
}
var an = {},
  Vl;
function qc() {
  if (Vl) return an;
  ((Vl = 1),
    Object.defineProperty(an, '__esModule', { value: !0 }),
    (an.storeTransactionComputePhase = an.loadTransactionComputePhase =
      void 0));
  const t = dt(),
    d = xc();
  function u(e) {
    if (!e.loadBit())
      return { type: 'skipped', reason: (0, d.loadComputeSkipReason)(e) };
    let r = e.loadBit(),
      n = e.loadBit(),
      i = e.loadBit(),
      s = e.loadCoins();
    const f = e.loadRef().beginParse();
    let o = f.loadVarUintBig(3),
      y = f.loadVarUintBig(3),
      v = f.loadBit() ? f.loadVarUintBig(2) : void 0,
      w = f.loadUint(8),
      R = f.loadInt(32),
      C = f.loadBit() ? f.loadInt(32) : void 0,
      P = f.loadUint(32),
      E = f.loadUintBig(256),
      N = f.loadUintBig(256);
    return {
      type: 'vm',
      success: r,
      messageStateUsed: n,
      accountActivated: i,
      gasFees: s,
      gasUsed: o,
      gasLimit: y,
      gasCredit: v,
      mode: w,
      exitCode: R,
      exitArg: C,
      vmSteps: P,
      vmInitStateHash: E,
      vmFinalStateHash: N,
    };
  }
  an.loadTransactionComputePhase = u;
  function a(e) {
    return (r) => {
      if (e.type === 'skipped') {
        (r.storeBit(0), r.store((0, d.storeComputeSkipReason)(e.reason)));
        return;
      }
      (r.storeBit(1),
        r.storeBit(e.success),
        r.storeBit(e.messageStateUsed),
        r.storeBit(e.accountActivated),
        r.storeCoins(e.gasFees),
        r.storeRef(
          (0, t.beginCell)()
            .storeVarUint(e.gasUsed, 3)
            .storeVarUint(e.gasLimit, 3)
            .store((n) =>
              e.gasCredit !== void 0 && e.gasCredit !== null
                ? n.storeBit(1).storeVarUint(e.gasCredit, 2)
                : n.storeBit(0),
            )
            .storeUint(e.mode, 8)
            .storeInt(e.exitCode, 32)
            .store((n) =>
              e.exitArg !== void 0 && e.exitArg !== null
                ? n.storeBit(1).storeInt(e.exitArg, 32)
                : n.storeBit(0),
            )
            .storeUint(e.vmSteps, 32)
            .storeUint(e.vmInitStateHash, 256)
            .storeUint(e.vmFinalStateHash, 256)
            .endCell(),
        ));
    };
  }
  return ((an.storeTransactionComputePhase = a), an);
}
var on = {},
  Fl;
function Lc() {
  if (Fl) return on;
  ((Fl = 1),
    Object.defineProperty(on, '__esModule', { value: !0 }),
    (on.storeTransactionCreditPhase = on.loadTransactionCreditPhase = void 0));
  const t = nr();
  function d(a) {
    const e = a.loadBit() ? a.loadCoins() : void 0,
      r = (0, t.loadCurrencyCollection)(a);
    return { dueFeesColelcted: e, credit: r };
  }
  on.loadTransactionCreditPhase = d;
  function u(a) {
    return (e) => {
      (a.dueFeesColelcted === null || a.dueFeesColelcted === void 0
        ? e.storeBit(!1)
        : (e.storeBit(!0), e.storeCoins(a.dueFeesColelcted)),
        e.store((0, t.storeCurrencyCollection)(a.credit)));
    };
  }
  return ((on.storeTransactionCreditPhase = u), on);
}
var sn = {},
  Zl;
function Vc() {
  if (Zl) return sn;
  ((Zl = 1),
    Object.defineProperty(sn, '__esModule', { value: !0 }),
    (sn.storeTransactionsStoragePhase = sn.loadTransactionStoragePhase =
      void 0));
  const t = vo();
  function d(a) {
    const e = a.loadCoins();
    let r;
    a.loadBit() && (r = a.loadCoins());
    const n = (0, t.loadAccountStatusChange)(a);
    return { storageFeesCollected: e, storageFeesDue: r, statusChange: n };
  }
  sn.loadTransactionStoragePhase = d;
  function u(a) {
    return (e) => {
      (e.storeCoins(a.storageFeesCollected),
        a.storageFeesDue === null || a.storageFeesDue === void 0
          ? e.storeBit(!1)
          : (e.storeBit(!0), e.storeCoins(a.storageFeesDue)),
        e.store((0, t.storeAccountStatusChange)(a.statusChange)));
    };
  }
  return ((sn.storeTransactionsStoragePhase = u), sn);
}
var Hl;
function Fc() {
  if (Hl) return tn;
  ((Hl = 1),
    Object.defineProperty(tn, '__esModule', { value: !0 }),
    (tn.storeTransactionDescription = tn.loadTransactionDescription = void 0));
  const t = dt(),
    d = zc(),
    u = Zc(),
    a = Dc(),
    e = Nc(),
    r = qc(),
    n = Lc(),
    i = Vc();
  function s(o) {
    let y = o.loadUint(4);
    if (y === 0) {
      const v = o.loadBit();
      let w;
      o.loadBit() && (w = (0, i.loadTransactionStoragePhase)(o));
      let R;
      o.loadBit() && (R = (0, n.loadTransactionCreditPhase)(o));
      let C = (0, r.loadTransactionComputePhase)(o),
        P;
      o.loadBit() &&
        (P = (0, a.loadTransactionActionPhase)(o.loadRef().beginParse()));
      let E = o.loadBit(),
        N;
      o.loadBit() && (N = (0, e.loadTransactionBouncePhase)(o));
      const D = o.loadBit();
      return {
        type: 'generic',
        creditFirst: v,
        storagePhase: w,
        creditPhase: R,
        computePhase: C,
        actionPhase: P,
        bouncePhase: N,
        aborted: E,
        destroyed: D,
      };
    }
    if (y === 1)
      return {
        type: 'storage',
        storagePhase: (0, i.loadTransactionStoragePhase)(o),
      };
    if (y === 2 || y === 3) {
      const v = y === 3;
      let w = (0, i.loadTransactionStoragePhase)(o),
        R = (0, r.loadTransactionComputePhase)(o),
        C;
      o.loadBit() &&
        (C = (0, a.loadTransactionActionPhase)(o.loadRef().beginParse()));
      const P = o.loadBit(),
        E = o.loadBit();
      return {
        type: 'tick-tock',
        isTock: v,
        storagePhase: w,
        computePhase: R,
        actionPhase: C,
        aborted: P,
        destroyed: E,
      };
    }
    if (y === 4) {
      let v = (0, d.loadSplitMergeInfo)(o),
        w;
      o.loadBit() && (w = (0, i.loadTransactionStoragePhase)(o));
      let R = (0, r.loadTransactionComputePhase)(o),
        C;
      o.loadBit() &&
        (C = (0, a.loadTransactionActionPhase)(o.loadRef().beginParse()));
      const P = o.loadBit(),
        E = o.loadBit();
      return {
        type: 'split-prepare',
        splitInfo: v,
        storagePhase: w,
        computePhase: R,
        actionPhase: C,
        aborted: P,
        destroyed: E,
      };
    }
    if (y === 5) {
      let v = (0, d.loadSplitMergeInfo)(o),
        w = (0, u.loadTransaction)(o.loadRef().beginParse());
      const R = o.loadBit();
      return {
        type: 'split-install',
        splitInfo: v,
        prepareTransaction: w,
        installed: R,
      };
    }
    throw Error(`Unsupported transaction description type ${y}`);
  }
  tn.loadTransactionDescription = s;
  function f(o) {
    return (y) => {
      if (o.type === 'generic')
        (y.storeUint(0, 4),
          y.storeBit(o.creditFirst),
          o.storagePhase
            ? (y.storeBit(!0),
              y.store((0, i.storeTransactionsStoragePhase)(o.storagePhase)))
            : y.storeBit(!1),
          o.creditPhase
            ? (y.storeBit(!0),
              y.store((0, n.storeTransactionCreditPhase)(o.creditPhase)))
            : y.storeBit(!1),
          y.store((0, r.storeTransactionComputePhase)(o.computePhase)),
          o.actionPhase
            ? (y.storeBit(!0),
              y.storeRef(
                (0, t.beginCell)().store(
                  (0, a.storeTransactionActionPhase)(o.actionPhase),
                ),
              ))
            : y.storeBit(!1),
          y.storeBit(o.aborted),
          o.bouncePhase
            ? (y.storeBit(!0),
              y.store((0, e.storeTransactionBouncePhase)(o.bouncePhase)))
            : y.storeBit(!1),
          y.storeBit(o.destroyed));
      else if (o.type === 'storage')
        (y.storeUint(1, 4),
          y.store((0, i.storeTransactionsStoragePhase)(o.storagePhase)));
      else if (o.type === 'tick-tock')
        (y.storeUint(o.isTock ? 3 : 2, 4),
          y.store((0, i.storeTransactionsStoragePhase)(o.storagePhase)),
          y.store((0, r.storeTransactionComputePhase)(o.computePhase)),
          o.actionPhase
            ? (y.storeBit(!0),
              y.storeRef(
                (0, t.beginCell)().store(
                  (0, a.storeTransactionActionPhase)(o.actionPhase),
                ),
              ))
            : y.storeBit(!1),
          y.storeBit(o.aborted),
          y.storeBit(o.destroyed));
      else if (o.type === 'split-prepare')
        (y.storeUint(4, 4),
          y.store((0, d.storeSplitMergeInfo)(o.splitInfo)),
          o.storagePhase
            ? (y.storeBit(!0),
              y.store((0, i.storeTransactionsStoragePhase)(o.storagePhase)))
            : y.storeBit(!1),
          y.store((0, r.storeTransactionComputePhase)(o.computePhase)),
          o.actionPhase
            ? (y.storeBit(!0),
              y.store((0, a.storeTransactionActionPhase)(o.actionPhase)))
            : y.storeBit(!1),
          y.storeBit(o.aborted),
          y.storeBit(o.destroyed));
      else if (o.type === 'split-install')
        (y.storeUint(5, 4),
          y.store((0, d.storeSplitMergeInfo)(o.splitInfo)),
          y.storeRef(
            (0, t.beginCell)().store(
              (0, u.storeTransaction)(o.prepareTransaction),
            ),
          ),
          y.storeBit(o.installed));
      else throw Error(`Unsupported transaction description type ${o.type}`);
    };
  }
  return ((tn.storeTransactionDescription = f), tn);
}
var Wl;
function Zc() {
  if (Wl) return en;
  ((Wl = 1),
    Object.defineProperty(en, '__esModule', { value: !0 }),
    (en.storeTransaction = en.loadTransaction = void 0));
  const t = dt(),
    d = mr(),
    u = Cc(),
    a = nr(),
    e = Ec(),
    r = Rc(),
    n = Fc();
  function i(f) {
    let o = f.asCell();
    if (f.loadUint(4) !== 7) throw Error('Invalid data');
    let y = f.loadUintBig(256),
      v = f.loadUintBig(64),
      w = f.loadUintBig(256),
      R = f.loadUintBig(64),
      C = f.loadUint(32),
      P = f.loadUint(15),
      E = (0, u.loadAccountStatus)(f),
      N = (0, u.loadAccountStatus)(f),
      G = f.loadRef().beginParse(),
      te = G.loadBit() ? (0, r.loadMessage)(G.loadRef().beginParse()) : void 0,
      W = G.loadDict(d.Dictionary.Keys.Uint(15), r.MessageValue);
    G.endParse();
    let F = (0, a.loadCurrencyCollection)(f),
      K = (0, e.loadHashUpdate)(f.loadRef().beginParse()),
      Y = (0, n.loadTransactionDescription)(f.loadRef().beginParse());
    return {
      address: y,
      lt: v,
      prevTransactionHash: w,
      prevTransactionLt: R,
      now: C,
      outMessagesCount: P,
      oldStatus: E,
      endStatus: N,
      inMessage: te,
      outMessages: W,
      totalFees: F,
      stateUpdate: K,
      description: Y,
      raw: o,
      hash: () => o.hash(),
    };
  }
  en.loadTransaction = i;
  function s(f) {
    return (o) => {
      (o.storeUint(7, 4),
        o.storeUint(f.address, 256),
        o.storeUint(f.lt, 64),
        o.storeUint(f.prevTransactionHash, 256),
        o.storeUint(f.prevTransactionLt, 64),
        o.storeUint(f.now, 32),
        o.storeUint(f.outMessagesCount, 15),
        o.store((0, u.storeAccountStatus)(f.oldStatus)),
        o.store((0, u.storeAccountStatus)(f.endStatus)));
      let y = (0, t.beginCell)();
      (f.inMessage
        ? (y.storeBit(!0),
          y.storeRef(
            (0, t.beginCell)().store((0, r.storeMessage)(f.inMessage)),
          ))
        : y.storeBit(!1),
        y.storeDict(f.outMessages),
        o.storeRef(y),
        o.store((0, a.storeCurrencyCollection)(f.totalFees)),
        o.storeRef(
          (0, t.beginCell)().store((0, e.storeHashUpdate)(f.stateUpdate)),
        ),
        o.storeRef(
          (0, t.beginCell)().store(
            (0, n.storeTransactionDescription)(f.description),
          ),
        ));
    };
  }
  return ((en.storeTransaction = s), en);
}
var Kl;
function Nf() {
  return (
    Kl ||
      ((Kl = 1),
      (function (t) {
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.signatureDomainEmptyTag =
            t.loadShardStateUnsplit =
            t.storeShardIdent =
            t.loadShardIdent =
            t.storeShardAccounts =
            t.loadShardAccounts =
            t.ShardAccountRefValue =
            t.storeShardAccount =
            t.loadShardAccount =
            t.ReserveMode =
            t.SendMode =
            t.storeMessageRelaxed =
            t.loadMessageRelaxed =
            t.storeMessage =
            t.loadMessage =
            t.loadMasterchainStateExtra =
            t.storeHashUpdate =
            t.loadHashUpdate =
            t.storeExtraCurrency =
            t.loadMaybeExtraCurrency =
            t.loadExtraCurrency =
            t.packExtraCurrencyDict =
            t.packExtraCurrencyCell =
            t.storeDepthBalanceInfo =
            t.loadDepthBalanceInfo =
            t.storeCurrencyCollection =
            t.loadCurrencyCollection =
            t.storeComputeSkipReason =
            t.loadComputeSkipReason =
            t.storeCommonMessageInfoRelaxed =
            t.loadCommonMessageInfoRelaxed =
            t.storeCommonMessageInfo =
            t.loadCommonMessageInfo =
            t.storeOutList =
            t.loadOutList =
            t.storeOutAction =
            t.loadOutAction =
            t.storeAccountStorage =
            t.loadAccountStorage =
            t.storeAccountStatusChange =
            t.loadAccountStatusChange =
            t.storeAccountStatus =
            t.loadAccountStatus =
            t.storeAccountState =
            t.loadAccountState =
            t.storeAccount =
            t.loadAccount =
            t.comment =
            t.external =
            t.internal =
              void 0),
          (t.storeTransactionsStoragePhase =
            t.loadTransactionStoragePhase =
            t.storeTransactionDescription =
            t.loadTransactionDescription =
            t.storeTransactionCreditPhase =
            t.loadTransactionCreditPhase =
            t.storeTransactionComputePhase =
            t.loadTransactionComputePhase =
            t.storeTransactionBouncePhase =
            t.loadTransactionBouncePhase =
            t.storeTransactionActionPhase =
            t.loadTransactionActionPhase =
            t.storeTransaction =
            t.loadTransaction =
            t.storeTickTock =
            t.loadTickTock =
            t.storeStorageUsed =
            t.loadStorageUsed =
            t.storeStorageInfo =
            t.loadStorageInfo =
            t.storeStateInit =
            t.loadStateInit =
            t.storeSplitMergeInfo =
            t.loadSplitMergeInfo =
            t.storeLibRef =
            t.loadLibRef =
            t.storeSimpleLibrary =
            t.loadSimpleLibrary =
            t.signatureDomainL2Tag =
              void 0));
        var d = Mf();
        (Object.defineProperty(t, 'internal', {
          enumerable: !0,
          get: function () {
            return d.internal;
          },
        }),
          Object.defineProperty(t, 'external', {
            enumerable: !0,
            get: function () {
              return d.external;
            },
          }),
          Object.defineProperty(t, 'comment', {
            enumerable: !0,
            get: function () {
              return d.comment;
            },
          }));
        var u = kc();
        (Object.defineProperty(t, 'loadAccount', {
          enumerable: !0,
          get: function () {
            return u.loadAccount;
          },
        }),
          Object.defineProperty(t, 'storeAccount', {
            enumerable: !0,
            get: function () {
              return u.storeAccount;
            },
          }));
        var a = wc();
        (Object.defineProperty(t, 'loadAccountState', {
          enumerable: !0,
          get: function () {
            return a.loadAccountState;
          },
        }),
          Object.defineProperty(t, 'storeAccountState', {
            enumerable: !0,
            get: function () {
              return a.storeAccountState;
            },
          }));
        var e = Cc();
        (Object.defineProperty(t, 'loadAccountStatus', {
          enumerable: !0,
          get: function () {
            return e.loadAccountStatus;
          },
        }),
          Object.defineProperty(t, 'storeAccountStatus', {
            enumerable: !0,
            get: function () {
              return e.storeAccountStatus;
            },
          }));
        var r = vo();
        (Object.defineProperty(t, 'loadAccountStatusChange', {
          enumerable: !0,
          get: function () {
            return r.loadAccountStatusChange;
          },
        }),
          Object.defineProperty(t, 'storeAccountStatusChange', {
            enumerable: !0,
            get: function () {
              return r.storeAccountStatusChange;
            },
          }));
        var n = vc();
        (Object.defineProperty(t, 'loadAccountStorage', {
          enumerable: !0,
          get: function () {
            return n.loadAccountStorage;
          },
        }),
          Object.defineProperty(t, 'storeAccountStorage', {
            enumerable: !0,
            get: function () {
              return n.storeAccountStorage;
            },
          }));
        var i = Uf();
        (Object.defineProperty(t, 'loadOutAction', {
          enumerable: !0,
          get: function () {
            return i.loadOutAction;
          },
        }),
          Object.defineProperty(t, 'storeOutAction', {
            enumerable: !0,
            get: function () {
              return i.storeOutAction;
            },
          }),
          Object.defineProperty(t, 'loadOutList', {
            enumerable: !0,
            get: function () {
              return i.loadOutList;
            },
          }),
          Object.defineProperty(t, 'storeOutList', {
            enumerable: !0,
            get: function () {
              return i.storeOutList;
            },
          }));
        var s = Ac();
        (Object.defineProperty(t, 'loadCommonMessageInfo', {
          enumerable: !0,
          get: function () {
            return s.loadCommonMessageInfo;
          },
        }),
          Object.defineProperty(t, 'storeCommonMessageInfo', {
            enumerable: !0,
            get: function () {
              return s.storeCommonMessageInfo;
            },
          }));
        var f = Sc();
        (Object.defineProperty(t, 'loadCommonMessageInfoRelaxed', {
          enumerable: !0,
          get: function () {
            return f.loadCommonMessageInfoRelaxed;
          },
        }),
          Object.defineProperty(t, 'storeCommonMessageInfoRelaxed', {
            enumerable: !0,
            get: function () {
              return f.storeCommonMessageInfoRelaxed;
            },
          }));
        var o = xc();
        (Object.defineProperty(t, 'loadComputeSkipReason', {
          enumerable: !0,
          get: function () {
            return o.loadComputeSkipReason;
          },
        }),
          Object.defineProperty(t, 'storeComputeSkipReason', {
            enumerable: !0,
            get: function () {
              return o.storeComputeSkipReason;
            },
          }));
        var y = nr();
        (Object.defineProperty(t, 'loadCurrencyCollection', {
          enumerable: !0,
          get: function () {
            return y.loadCurrencyCollection;
          },
        }),
          Object.defineProperty(t, 'storeCurrencyCollection', {
            enumerable: !0,
            get: function () {
              return y.storeCurrencyCollection;
            },
          }));
        var v = Ic();
        (Object.defineProperty(t, 'loadDepthBalanceInfo', {
          enumerable: !0,
          get: function () {
            return v.loadDepthBalanceInfo;
          },
        }),
          Object.defineProperty(t, 'storeDepthBalanceInfo', {
            enumerable: !0,
            get: function () {
              return v.storeDepthBalanceInfo;
            },
          }));
        var w = bc();
        (Object.defineProperty(t, 'packExtraCurrencyCell', {
          enumerable: !0,
          get: function () {
            return w.packExtraCurrencyCell;
          },
        }),
          Object.defineProperty(t, 'packExtraCurrencyDict', {
            enumerable: !0,
            get: function () {
              return w.packExtraCurrencyDict;
            },
          }),
          Object.defineProperty(t, 'loadExtraCurrency', {
            enumerable: !0,
            get: function () {
              return w.loadExtraCurrency;
            },
          }),
          Object.defineProperty(t, 'loadMaybeExtraCurrency', {
            enumerable: !0,
            get: function () {
              return w.loadMaybeExtraCurrency;
            },
          }),
          Object.defineProperty(t, 'storeExtraCurrency', {
            enumerable: !0,
            get: function () {
              return w.storeExtraCurrency;
            },
          }));
        var R = Ec();
        (Object.defineProperty(t, 'loadHashUpdate', {
          enumerable: !0,
          get: function () {
            return R.loadHashUpdate;
          },
        }),
          Object.defineProperty(t, 'storeHashUpdate', {
            enumerable: !0,
            get: function () {
              return R.storeHashUpdate;
            },
          }));
        var C = Tc();
        Object.defineProperty(t, 'loadMasterchainStateExtra', {
          enumerable: !0,
          get: function () {
            return C.loadMasterchainStateExtra;
          },
        });
        var P = Rc();
        (Object.defineProperty(t, 'loadMessage', {
          enumerable: !0,
          get: function () {
            return P.loadMessage;
          },
        }),
          Object.defineProperty(t, 'storeMessage', {
            enumerable: !0,
            get: function () {
              return P.storeMessage;
            },
          }));
        var E = Bc();
        (Object.defineProperty(t, 'loadMessageRelaxed', {
          enumerable: !0,
          get: function () {
            return E.loadMessageRelaxed;
          },
        }),
          Object.defineProperty(t, 'storeMessageRelaxed', {
            enumerable: !0,
            get: function () {
              return E.storeMessageRelaxed;
            },
          }));
        var N = jf();
        Object.defineProperty(t, 'SendMode', {
          enumerable: !0,
          get: function () {
            return N.SendMode;
          },
        });
        var D = zf();
        Object.defineProperty(t, 'ReserveMode', {
          enumerable: !0,
          get: function () {
            return D.ReserveMode;
          },
        });
        var G = Mc();
        (Object.defineProperty(t, 'loadShardAccount', {
          enumerable: !0,
          get: function () {
            return G.loadShardAccount;
          },
        }),
          Object.defineProperty(t, 'storeShardAccount', {
            enumerable: !0,
            get: function () {
              return G.storeShardAccount;
            },
          }));
        var te = Oc();
        (Object.defineProperty(t, 'ShardAccountRefValue', {
          enumerable: !0,
          get: function () {
            return te.ShardAccountRefValue;
          },
        }),
          Object.defineProperty(t, 'loadShardAccounts', {
            enumerable: !0,
            get: function () {
              return te.loadShardAccounts;
            },
          }),
          Object.defineProperty(t, 'storeShardAccounts', {
            enumerable: !0,
            get: function () {
              return te.storeShardAccounts;
            },
          }));
        var W = Uc();
        (Object.defineProperty(t, 'loadShardIdent', {
          enumerable: !0,
          get: function () {
            return W.loadShardIdent;
          },
        }),
          Object.defineProperty(t, 'storeShardIdent', {
            enumerable: !0,
            get: function () {
              return W.storeShardIdent;
            },
          }));
        var F = Df();
        Object.defineProperty(t, 'loadShardStateUnsplit', {
          enumerable: !0,
          get: function () {
            return F.loadShardStateUnsplit;
          },
        });
        var K = jc();
        (Object.defineProperty(t, 'signatureDomainEmptyTag', {
          enumerable: !0,
          get: function () {
            return K.signatureDomainEmptyTag;
          },
        }),
          Object.defineProperty(t, 'signatureDomainL2Tag', {
            enumerable: !0,
            get: function () {
              return K.signatureDomainL2Tag;
            },
          }));
        var Y = pc();
        (Object.defineProperty(t, 'loadSimpleLibrary', {
          enumerable: !0,
          get: function () {
            return Y.loadSimpleLibrary;
          },
        }),
          Object.defineProperty(t, 'storeSimpleLibrary', {
            enumerable: !0,
            get: function () {
              return Y.storeSimpleLibrary;
            },
          }));
        var ue = Pc();
        (Object.defineProperty(t, 'loadLibRef', {
          enumerable: !0,
          get: function () {
            return ue.loadLibRef;
          },
        }),
          Object.defineProperty(t, 'storeLibRef', {
            enumerable: !0,
            get: function () {
              return ue.storeLibRef;
            },
          }));
        var we = zc();
        (Object.defineProperty(t, 'loadSplitMergeInfo', {
          enumerable: !0,
          get: function () {
            return we.loadSplitMergeInfo;
          },
        }),
          Object.defineProperty(t, 'storeSplitMergeInfo', {
            enumerable: !0,
            get: function () {
              return we.storeSplitMergeInfo;
            },
          }));
        var Ce = ri();
        (Object.defineProperty(t, 'loadStateInit', {
          enumerable: !0,
          get: function () {
            return Ce.loadStateInit;
          },
        }),
          Object.defineProperty(t, 'storeStateInit', {
            enumerable: !0,
            get: function () {
              return Ce.storeStateInit;
            },
          }));
        var $ = _c();
        (Object.defineProperty(t, 'loadStorageInfo', {
          enumerable: !0,
          get: function () {
            return $.loadStorageInfo;
          },
        }),
          Object.defineProperty(t, 'storeStorageInfo', {
            enumerable: !0,
            get: function () {
              return $.storeStorageInfo;
            },
          }));
        var q = Ai();
        (Object.defineProperty(t, 'loadStorageUsed', {
          enumerable: !0,
          get: function () {
            return q.loadStorageUsed;
          },
        }),
          Object.defineProperty(t, 'storeStorageUsed', {
            enumerable: !0,
            get: function () {
              return q.storeStorageUsed;
            },
          }));
        var ie = mc();
        (Object.defineProperty(t, 'loadTickTock', {
          enumerable: !0,
          get: function () {
            return ie.loadTickTock;
          },
        }),
          Object.defineProperty(t, 'storeTickTock', {
            enumerable: !0,
            get: function () {
              return ie.storeTickTock;
            },
          }));
        var Se = Zc();
        (Object.defineProperty(t, 'loadTransaction', {
          enumerable: !0,
          get: function () {
            return Se.loadTransaction;
          },
        }),
          Object.defineProperty(t, 'storeTransaction', {
            enumerable: !0,
            get: function () {
              return Se.storeTransaction;
            },
          }));
        var Ee = Dc();
        (Object.defineProperty(t, 'loadTransactionActionPhase', {
          enumerable: !0,
          get: function () {
            return Ee.loadTransactionActionPhase;
          },
        }),
          Object.defineProperty(t, 'storeTransactionActionPhase', {
            enumerable: !0,
            get: function () {
              return Ee.storeTransactionActionPhase;
            },
          }));
        var He = Nc();
        (Object.defineProperty(t, 'loadTransactionBouncePhase', {
          enumerable: !0,
          get: function () {
            return He.loadTransactionBouncePhase;
          },
        }),
          Object.defineProperty(t, 'storeTransactionBouncePhase', {
            enumerable: !0,
            get: function () {
              return He.storeTransactionBouncePhase;
            },
          }));
        var L = qc();
        (Object.defineProperty(t, 'loadTransactionComputePhase', {
          enumerable: !0,
          get: function () {
            return L.loadTransactionComputePhase;
          },
        }),
          Object.defineProperty(t, 'storeTransactionComputePhase', {
            enumerable: !0,
            get: function () {
              return L.storeTransactionComputePhase;
            },
          }));
        var Be = Lc();
        (Object.defineProperty(t, 'loadTransactionCreditPhase', {
          enumerable: !0,
          get: function () {
            return Be.loadTransactionCreditPhase;
          },
        }),
          Object.defineProperty(t, 'storeTransactionCreditPhase', {
            enumerable: !0,
            get: function () {
              return Be.storeTransactionCreditPhase;
            },
          }));
        var ge = Fc();
        (Object.defineProperty(t, 'loadTransactionDescription', {
          enumerable: !0,
          get: function () {
            return ge.loadTransactionDescription;
          },
        }),
          Object.defineProperty(t, 'storeTransactionDescription', {
            enumerable: !0,
            get: function () {
              return ge.storeTransactionDescription;
            },
          }));
        var ve = Vc();
        (Object.defineProperty(t, 'loadTransactionStoragePhase', {
          enumerable: !0,
          get: function () {
            return ve.loadTransactionStoragePhase;
          },
        }),
          Object.defineProperty(t, 'storeTransactionsStoragePhase', {
            enumerable: !0,
            get: function () {
              return ve.storeTransactionsStoragePhase;
            },
          }));
      })(eo)),
    eo
  );
}
var Aa = {},
  $l;
function qf() {
  if ($l) return Aa;
  (($l = 1),
    Object.defineProperty(Aa, '__esModule', { value: !0 }),
    (Aa.openContract = void 0));
  const t = hr(),
    d = Cn();
  function u(a, e) {
    let r,
      n = null;
    if (!t.Address.isAddress(a.address)) throw Error('Invalid address');
    if (((r = a.address), a.init)) {
      if (!(a.init.code instanceof d.Cell)) throw Error('Invalid init.code');
      if (!(a.init.data instanceof d.Cell)) throw Error('Invalid init.data');
      n = a.init;
    }
    let i = e({ address: r, init: n });
    return new Proxy(a, {
      get(s, f) {
        const o = s[f];
        return typeof f == 'string' &&
          (f.startsWith('get') || f.startsWith('send') || f.startsWith('is')) &&
          typeof o == 'function'
          ? (...y) => o.apply(s, [i, ...y])
          : o;
      },
    });
  }
  return ((Aa.openContract = u), Aa);
}
var xa = {},
  Gl;
function Lf() {
  if (Gl) return xa;
  ((Gl = 1),
    Object.defineProperty(xa, '__esModule', { value: !0 }),
    (xa.ComputeError = void 0));
  let t = class Hc extends Error {
    constructor(u, a, e) {
      (super(u),
        (this.exitCode = a),
        (this.debugLogs = e && e.debugLogs ? e.debugLogs : null),
        (this.logs = e && e.logs ? e.logs : null),
        Object.setPrototypeOf(this, Hc.prototype));
    }
  };
  return ((xa.ComputeError = t), xa);
}
var Ia = {},
  Yl;
function Vf() {
  if (Yl) return Ia;
  ((Yl = 1),
    Object.defineProperty(Ia, '__esModule', { value: !0 }),
    (Ia.getMethodId = void 0));
  const t = new Int16Array([
    0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290,
    45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044,
    29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314,
    13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153,
    58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165,
    18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757,
    26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144,
    39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770,
    56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684,
    23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395,
    36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439,
    61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451,
    53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742,
    24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752,
    8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830,
    58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413,
    42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681,
    5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305,
    47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093,
    56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254,
    2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424,
    36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342,
    53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923,
    16050, 3793, 7920,
  ]);
  function d(a) {
    a instanceof Buffer || (a = Buffer.from(a));
    let e = 0;
    for (let r = 0; r < a.length; r++) {
      const n = a[r];
      e = (t[((e >> 8) ^ n) & 255] ^ (e << 8)) & 65535;
    }
    return e;
  }
  function u(a) {
    return (d(a) & 65535) | 65536;
  }
  return ((Ia.getMethodId = u), Ia);
}
var ln = {},
  Jl;
function Ff() {
  if (Jl) return ln;
  ((Jl = 1),
    Object.defineProperty(ln, '__esModule', { value: !0 }),
    (ln.safeSignVerify = ln.safeSign = void 0));
  const t = Tn(),
    d = 8,
    u = 64;
  function a(n, i) {
    let s = Buffer.from(i);
    if (s.length > u) throw Error('Seed can	 be longer than 64 bytes');
    if (s.length < d) throw Error('Seed must be at least 8 bytes');
    return (0, t.sha256_sync)(
      Buffer.concat([Buffer.from([255, 255]), s, n.hash()]),
    );
  }
  function e(n, i, s = 'ton-safe-sign-magic') {
    return (0, t.sign)(a(n, s), i);
  }
  ln.safeSign = e;
  function r(n, i, s, f = 'ton-safe-sign-magic') {
    return (0, t.signVerify)(a(n, f), i, s);
  }
  return ((ln.safeSignVerify = r), ln);
}
var Pt = {},
  Ql;
function Zf() {
  if (Ql) return Pt;
  ((Ql = 1),
    Object.defineProperty(Pt, '__esModule', { value: !0 }),
    (Pt.domainSignVerify =
      Pt.domainSign =
      Pt.domainDataToSign =
      Pt.signatureDomainPrefix =
      Pt.signatureDomainHash =
        void 0));
  const t = Tn(),
    d = jc();
  function u(s) {
    switch (s.type) {
      case 'empty':
        const f = Buffer.alloc(4);
        return (
          f.writeInt32LE(d.signatureDomainEmptyTag),
          (0, t.sha256_sync)(f)
        );
      case 'l2': {
        const o = Buffer.alloc(8);
        return (
          o.writeInt32LE(d.signatureDomainL2Tag),
          o.writeInt32LE(s.globalId, 4),
          (0, t.sha256_sync)(o)
        );
      }
      default:
        throw new Error(`Unknown SignatureDomain type ${s.type}`);
    }
  }
  Pt.signatureDomainHash = u;
  const a = u({ type: 'empty' });
  function e(s) {
    const f = Buffer.isBuffer(s) ? s : u(s);
    if (f.length !== 32)
      throw new Error('Invalid signature domain hash length');
    return f.equals(a) ? null : f;
  }
  Pt.signatureDomainPrefix = e;
  function r(s, f) {
    const o = e(f);
    return o ? Buffer.concat([o, s]) : s;
  }
  Pt.domainDataToSign = r;
  function n({ data: s, secretKey: f, domain: o = { type: 'empty' } }) {
    const y = r(s, o);
    return (0, t.sign)(y, f);
  }
  Pt.domainSign = n;
  function i({
    data: s,
    signature: f,
    publicKey: o,
    domain: y = { type: 'empty' },
  }) {
    const v = r(s, y);
    return (0, t.signVerify)(v, f, o);
  }
  return ((Pt.domainSignVerify = i), Pt);
}
var Xl;
function at() {
  return (
    Xl ||
      ((Xl = 1),
      (function (t) {
        var d =
            (kr && kr.__createBinding) ||
            (Object.create
              ? function (Se, Ee, He, L) {
                  L === void 0 && (L = He);
                  var Be = Object.getOwnPropertyDescriptor(Ee, He);
                  ((!Be ||
                    ('get' in Be
                      ? !Ee.__esModule
                      : Be.writable || Be.configurable)) &&
                    (Be = {
                      enumerable: !0,
                      get: function () {
                        return Ee[He];
                      },
                    }),
                    Object.defineProperty(Se, L, Be));
                }
              : function (Se, Ee, He, L) {
                  (L === void 0 && (L = He), (Se[L] = Ee[He]));
                }),
          u =
            (kr && kr.__exportStar) ||
            function (Se, Ee) {
              for (var He in Se)
                He !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(Ee, He) &&
                  d(Ee, Se, He);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.domainDataToSign =
            t.domainSignVerify =
            t.domainSign =
            t.signatureDomainPrefix =
            t.signatureDomainHash =
            t.safeSignVerify =
            t.safeSign =
            t.getMethodId =
            t.base32Encode =
            t.base32Decode =
            t.crc32c =
            t.crc16 =
            t.fromNano =
            t.toNano =
            t.ComputeError =
            t.openContract =
            t.TupleBuilder =
            t.TupleReader =
            t.serializeTupleItem =
            t.parseTupleItem =
            t.serializeTuple =
            t.parseTuple =
            t.generateMerkleUpdate =
            t.generateMerkleProofDirect =
            t.generateMerkleProof =
            t.exoticPruned =
            t.exoticMerkleUpdate =
            t.convertToMerkleProof =
            t.exoticMerkleProof =
            t.Dictionary =
            t.Cell =
            t.CellType =
            t.Slice =
            t.beginCell =
            t.Builder =
            t.BitBuilder =
            t.BitReader =
            t.BitString =
            t.contractAddress =
            t.ADNLAddress =
            t.ExternalAddress =
            t.address =
            t.Address =
              void 0));
        var a = hr();
        (Object.defineProperty(t, 'Address', {
          enumerable: !0,
          get: function () {
            return a.Address;
          },
        }),
          Object.defineProperty(t, 'address', {
            enumerable: !0,
            get: function () {
              return a.address;
            },
          }));
        var e = fo();
        Object.defineProperty(t, 'ExternalAddress', {
          enumerable: !0,
          get: function () {
            return e.ExternalAddress;
          },
        });
        var r = rf();
        Object.defineProperty(t, 'ADNLAddress', {
          enumerable: !0,
          get: function () {
            return r.ADNLAddress;
          },
        });
        var n = If();
        Object.defineProperty(t, 'contractAddress', {
          enumerable: !0,
          get: function () {
            return n.contractAddress;
          },
        });
        var i = gr();
        Object.defineProperty(t, 'BitString', {
          enumerable: !0,
          get: function () {
            return i.BitString;
          },
        });
        var s = pr();
        Object.defineProperty(t, 'BitReader', {
          enumerable: !0,
          get: function () {
            return s.BitReader;
          },
        });
        var f = Bi();
        Object.defineProperty(t, 'BitBuilder', {
          enumerable: !0,
          get: function () {
            return f.BitBuilder;
          },
        });
        var o = dt();
        (Object.defineProperty(t, 'Builder', {
          enumerable: !0,
          get: function () {
            return o.Builder;
          },
        }),
          Object.defineProperty(t, 'beginCell', {
            enumerable: !0,
            get: function () {
              return o.beginCell;
            },
          }));
        var y = go();
        Object.defineProperty(t, 'Slice', {
          enumerable: !0,
          get: function () {
            return y.Slice;
          },
        });
        var v = Xa();
        Object.defineProperty(t, 'CellType', {
          enumerable: !0,
          get: function () {
            return v.CellType;
          },
        });
        var w = Cn();
        Object.defineProperty(t, 'Cell', {
          enumerable: !0,
          get: function () {
            return w.Cell;
          },
        });
        var R = mr();
        Object.defineProperty(t, 'Dictionary', {
          enumerable: !0,
          get: function () {
            return R.Dictionary;
          },
        });
        var C = Pi();
        (Object.defineProperty(t, 'exoticMerkleProof', {
          enumerable: !0,
          get: function () {
            return C.exoticMerkleProof;
          },
        }),
          Object.defineProperty(t, 'convertToMerkleProof', {
            enumerable: !0,
            get: function () {
              return C.convertToMerkleProof;
            },
          }));
        var P = po();
        Object.defineProperty(t, 'exoticMerkleUpdate', {
          enumerable: !0,
          get: function () {
            return P.exoticMerkleUpdate;
          },
        });
        var E = yo();
        Object.defineProperty(t, 'exoticPruned', {
          enumerable: !0,
          get: function () {
            return E.exoticPruned;
          },
        });
        var N = ho();
        (Object.defineProperty(t, 'generateMerkleProof', {
          enumerable: !0,
          get: function () {
            return N.generateMerkleProof;
          },
        }),
          Object.defineProperty(t, 'generateMerkleProofDirect', {
            enumerable: !0,
            get: function () {
              return N.generateMerkleProofDirect;
            },
          }));
        var D = ic();
        Object.defineProperty(t, 'generateMerkleUpdate', {
          enumerable: !0,
          get: function () {
            return D.generateMerkleUpdate;
          },
        });
        var G = Ef();
        (Object.defineProperty(t, 'parseTuple', {
          enumerable: !0,
          get: function () {
            return G.parseTuple;
          },
        }),
          Object.defineProperty(t, 'serializeTuple', {
            enumerable: !0,
            get: function () {
              return G.serializeTuple;
            },
          }),
          Object.defineProperty(t, 'parseTupleItem', {
            enumerable: !0,
            get: function () {
              return G.parseTupleItem;
            },
          }),
          Object.defineProperty(t, 'serializeTupleItem', {
            enumerable: !0,
            get: function () {
              return G.serializeTupleItem;
            },
          }));
        var te = Tf();
        Object.defineProperty(t, 'TupleReader', {
          enumerable: !0,
          get: function () {
            return te.TupleReader;
          },
        });
        var W = Rf();
        (Object.defineProperty(t, 'TupleBuilder', {
          enumerable: !0,
          get: function () {
            return W.TupleBuilder;
          },
        }),
          u(Nf(), t));
        var F = qf();
        Object.defineProperty(t, 'openContract', {
          enumerable: !0,
          get: function () {
            return F.openContract;
          },
        });
        var K = Lf();
        Object.defineProperty(t, 'ComputeError', {
          enumerable: !0,
          get: function () {
            return K.ComputeError;
          },
        });
        var Y = yc();
        (Object.defineProperty(t, 'toNano', {
          enumerable: !0,
          get: function () {
            return Y.toNano;
          },
        }),
          Object.defineProperty(t, 'fromNano', {
            enumerable: !0,
            get: function () {
              return Y.fromNano;
            },
          }));
        var ue = co();
        Object.defineProperty(t, 'crc16', {
          enumerable: !0,
          get: function () {
            return ue.crc16;
          },
        });
        var we = hc();
        Object.defineProperty(t, 'crc32c', {
          enumerable: !0,
          get: function () {
            return we.crc32c;
          },
        });
        var Ce = nc();
        (Object.defineProperty(t, 'base32Decode', {
          enumerable: !0,
          get: function () {
            return Ce.base32Decode;
          },
        }),
          Object.defineProperty(t, 'base32Encode', {
            enumerable: !0,
            get: function () {
              return Ce.base32Encode;
            },
          }));
        var $ = Vf();
        Object.defineProperty(t, 'getMethodId', {
          enumerable: !0,
          get: function () {
            return $.getMethodId;
          },
        });
        var q = Ff();
        (Object.defineProperty(t, 'safeSign', {
          enumerable: !0,
          get: function () {
            return q.safeSign;
          },
        }),
          Object.defineProperty(t, 'safeSignVerify', {
            enumerable: !0,
            get: function () {
              return q.safeSignVerify;
            },
          }));
        var ie = Zf();
        (Object.defineProperty(t, 'signatureDomainHash', {
          enumerable: !0,
          get: function () {
            return ie.signatureDomainHash;
          },
        }),
          Object.defineProperty(t, 'signatureDomainPrefix', {
            enumerable: !0,
            get: function () {
              return ie.signatureDomainPrefix;
            },
          }),
          Object.defineProperty(t, 'domainSign', {
            enumerable: !0,
            get: function () {
              return ie.domainSign;
            },
          }),
          Object.defineProperty(t, 'domainSignVerify', {
            enumerable: !0,
            get: function () {
              return ie.domainSignVerify;
            },
          }),
          Object.defineProperty(t, 'domainDataToSign', {
            enumerable: !0,
            get: function () {
              return ie.domainDataToSign;
            },
          }));
      })(kr)),
    kr
  );
}
var Rh = at(),
  un = {},
  cn = {},
  Ea = {},
  eu;
function Hf() {
  if (eu) return Ea;
  ((eu = 1),
    Object.defineProperty(Ea, '__esModule', { value: !0 }),
    (Ea.InMemoryCache = void 0));
  class t {
    constructor() {
      ((this.cache = new Map()),
        (this.set = async (u, a, e) => {
          e !== null
            ? this.cache.set(u + '$$' + a, e)
            : this.cache.delete(u + '$$' + a);
        }),
        (this.get = async (u, a) => {
          let e = this.cache.get(u + '$$' + a);
          return e !== void 0 ? e : null;
        }));
    }
  }
  return ((Ea.InMemoryCache = t), Ea);
}
var ro, tu;
function Wf() {
  if (tu) return ro;
  tu = 1;
  var t = (function () {
      function w(C, P) {
        if (typeof C != 'function')
          throw new TypeError(
            'DataLoader must be constructed with a function which accepts ' +
              ('Array<key> and returns Promise<Array<value>>, but got: ' +
                C +
                '.'),
          );
        ((this._batchLoadFn = C),
          (this._maxBatchSize = i(P)),
          (this._batchScheduleFn = s(P)),
          (this._cacheKeyFn = f(P)),
          (this._cacheMap = o(P)),
          (this._batch = null),
          (this.name = y(P)));
      }
      var R = w.prototype;
      return (
        (R.load = function (P) {
          if (P == null)
            throw new TypeError(
              'The loader.load() function must be called with a value, ' +
                ('but got: ' + String(P) + '.'),
            );
          var E = a(this),
            N = this._cacheMap,
            D;
          if (N) {
            D = this._cacheKeyFn(P);
            var G = N.get(D);
            if (G) {
              var te = E.cacheHits || (E.cacheHits = []);
              return new Promise(function (F) {
                te.push(function () {
                  F(G);
                });
              });
            }
          }
          E.keys.push(P);
          var W = new Promise(function (F, K) {
            E.callbacks.push({ resolve: F, reject: K });
          });
          return (N && N.set(D, W), W);
        }),
        (R.loadMany = function (P) {
          if (!v(P))
            throw new TypeError(
              'The loader.loadMany() function must be called with Array<key> ' +
                ('but got: ' + P + '.'),
            );
          for (var E = [], N = 0; N < P.length; N++)
            E.push(
              this.load(P[N]).catch(function (D) {
                return D;
              }),
            );
          return Promise.all(E);
        }),
        (R.clear = function (P) {
          var E = this._cacheMap;
          if (E) {
            var N = this._cacheKeyFn(P);
            E.delete(N);
          }
          return this;
        }),
        (R.clearAll = function () {
          var P = this._cacheMap;
          return (P && P.clear(), this);
        }),
        (R.prime = function (P, E) {
          var N = this._cacheMap;
          if (N) {
            var D = this._cacheKeyFn(P);
            if (N.get(D) === void 0) {
              var G;
              (E instanceof Error
                ? ((G = Promise.reject(E)), G.catch(function () {}))
                : (G = Promise.resolve(E)),
                N.set(D, G));
            }
          }
          return this;
        }),
        w
      );
    })(),
    d =
      typeof process == 'object' && typeof process.nextTick == 'function'
        ? function (w) {
            (u || (u = Promise.resolve()),
              u.then(function () {
                process.nextTick(w);
              }));
          }
        : typeof setImmediate == 'function'
          ? function (w) {
              setImmediate(w);
            }
          : function (w) {
              setTimeout(w);
            },
    u;
  function a(w) {
    var R = w._batch;
    if (R !== null && !R.hasDispatched && R.keys.length < w._maxBatchSize)
      return R;
    var C = { hasDispatched: !1, keys: [], callbacks: [] };
    return (
      (w._batch = C),
      w._batchScheduleFn(function () {
        e(w, C);
      }),
      C
    );
  }
  function e(w, R) {
    if (((R.hasDispatched = !0), R.keys.length === 0)) {
      n(R);
      return;
    }
    var C;
    try {
      C = w._batchLoadFn(R.keys);
    } catch (P) {
      return r(
        w,
        R,
        new TypeError(
          'DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function ' +
            ('errored synchronously: ' + String(P) + '.'),
        ),
      );
    }
    if (!C || typeof C.then != 'function')
      return r(
        w,
        R,
        new TypeError(
          'DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did ' +
            ('not return a Promise: ' + String(C) + '.'),
        ),
      );
    C.then(function (P) {
      if (!v(P))
        throw new TypeError(
          'DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did ' +
            ('not return a Promise of an Array: ' + String(P) + '.'),
        );
      if (P.length !== R.keys.length)
        throw new TypeError(
          'DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise of an Array of the same length as the Array of keys.' +
            (`

Keys:
` +
              String(R.keys)) +
            (`

Values:
` +
              String(P)),
        );
      n(R);
      for (var E = 0; E < R.callbacks.length; E++) {
        var N = P[E];
        N instanceof Error
          ? R.callbacks[E].reject(N)
          : R.callbacks[E].resolve(N);
      }
    }).catch(function (P) {
      r(w, R, P);
    });
  }
  function r(w, R, C) {
    n(R);
    for (var P = 0; P < R.keys.length; P++)
      (w.clear(R.keys[P]), R.callbacks[P].reject(C));
  }
  function n(w) {
    if (w.cacheHits)
      for (var R = 0; R < w.cacheHits.length; R++) w.cacheHits[R]();
  }
  function i(w) {
    var R = !w || w.batch !== !1;
    if (!R) return 1;
    var C = w && w.maxBatchSize;
    if (C === void 0) return 1 / 0;
    if (typeof C != 'number' || C < 1)
      throw new TypeError('maxBatchSize must be a positive number: ' + C);
    return C;
  }
  function s(w) {
    var R = w && w.batchScheduleFn;
    if (R === void 0) return d;
    if (typeof R != 'function')
      throw new TypeError('batchScheduleFn must be a function: ' + R);
    return R;
  }
  function f(w) {
    var R = w && w.cacheKeyFn;
    if (R === void 0)
      return function (C) {
        return C;
      };
    if (typeof R != 'function')
      throw new TypeError('cacheKeyFn must be a function: ' + R);
    return R;
  }
  function o(w) {
    var R = !w || w.cache !== !1;
    if (!R) return null;
    var C = w && w.cacheMap;
    if (C === void 0) return new Map();
    if (C !== null) {
      var P = ['get', 'set', 'delete', 'clear'],
        E = P.filter(function (N) {
          return C && typeof C[N] != 'function';
        });
      if (E.length !== 0)
        throw new TypeError('Custom cacheMap missing methods: ' + E.join(', '));
    }
    return C;
  }
  function y(w) {
    return w && w.name ? w.name : null;
  }
  function v(w) {
    return (
      typeof w == 'object' &&
      w !== null &&
      typeof w.length == 'number' &&
      (w.length === 0 ||
        (w.length > 0 && Object.prototype.hasOwnProperty.call(w, w.length - 1)))
    );
  }
  return ((ro = t), ro);
}
/*! Axios v1.19.0 Copyright (c) 2026 Matt Zabriskie and contributors */ var no,
  ru;
function Wc() {
  if (ru) return no;
  ru = 1;
  function t(c, h) {
    return function () {
      return c.apply(h, arguments);
    };
  }
  const { toString: d } = Object.prototype,
    { getPrototypeOf: u } = Object,
    { iterator: a, toStringTag: e } = Symbol,
    r = (
      ({ hasOwnProperty: c }) =>
      (h, p) =>
        c.call(h, p)
    )(Object.prototype),
    n = (c, h) => {
      let p = c;
      const b = [];
      for (; p != null && p !== Object.prototype;) {
        if (b.indexOf(p) !== -1) return !1;
        if ((b.push(p), r(p, h))) return !0;
        p = u(p);
      }
      return !1;
    },
    i = (c, h) => (c != null && n(c, h) ? c[h] : void 0),
    s = ((c) => (h) => {
      const p = d.call(h);
      return c[p] || (c[p] = p.slice(8, -1).toLowerCase());
    })(Object.create(null)),
    f = (c) => ((c = c.toLowerCase()), (h) => s(h) === c),
    o = (c) => (h) => typeof h === c,
    { isArray: y } = Array,
    v = o('undefined');
  function w(c) {
    return (
      c !== null &&
      !v(c) &&
      c.constructor !== null &&
      !v(c.constructor) &&
      E(c.constructor.isBuffer) &&
      c.constructor.isBuffer(c)
    );
  }
  const R = f('ArrayBuffer');
  function C(c) {
    let h;
    return (
      typeof ArrayBuffer < 'u' && ArrayBuffer.isView
        ? (h = ArrayBuffer.isView(c))
        : (h = c && c.buffer && R(c.buffer)),
      h
    );
  }
  const P = o('string'),
    E = o('function'),
    N = o('number'),
    D = (c) => c !== null && typeof c == 'object',
    G = (c) => c === !0 || c === !1,
    te = (c) => {
      if (!D(c)) return !1;
      const h = u(c);
      return (
        (h === null || h === Object.prototype || u(h) === null) &&
        !n(c, e) &&
        !n(c, a)
      );
    },
    W = (c) => {
      if (!D(c) || w(c)) return !1;
      try {
        return (
          Object.keys(c).length === 0 &&
          Object.getPrototypeOf(c) === Object.prototype
        );
      } catch {
        return !1;
      }
    },
    F = f('Date'),
    K = f('File'),
    Y = (c) => !!(c && typeof c.uri < 'u'),
    ue = (c) => c && typeof c.getParts < 'u',
    we = f('Blob'),
    Ce = f('FileList'),
    $ = f('Set'),
    q = (c) => D(c) && E(c.pipe);
  function ie() {
    return typeof globalThis < 'u'
      ? globalThis
      : typeof self < 'u'
        ? self
        : typeof window < 'u'
          ? window
          : typeof Ji < 'u'
            ? Ji
            : {};
  }
  const Se = ie(),
    Ee = typeof Se.FormData < 'u' ? Se.FormData : void 0,
    He = (c) => {
      if (!c) return !1;
      if (Ee && c instanceof Ee) return !0;
      const h = u(c);
      if (!h || h === Object.prototype || !E(c.append)) return !1;
      const p = s(c);
      return (
        p === 'formdata' ||
        (p === 'object' &&
          E(c.toString) &&
          c.toString() === '[object FormData]')
      );
    },
    L = f('URLSearchParams'),
    [Be, ge, ve, xe] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(
      f,
    ),
    Re = (c) =>
      c.trim ? c.trim() : c.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  function _e(c, h, { allOwnKeys: p = !1 } = {}) {
    if (c === null || typeof c > 'u') return;
    let b, B;
    if ((typeof c != 'object' && (c = [c]), y(c)))
      for (b = 0, B = c.length; b < B; b++) h.call(null, c[b], b, c);
    else {
      if (w(c)) return;
      const O = p ? Object.getOwnPropertyNames(c) : Object.keys(c),
        z = O.length;
      let H;
      for (b = 0; b < z; b++) ((H = O[b]), h.call(null, c[H], H, c));
    }
  }
  function Oe(c, h) {
    if (w(c)) return null;
    h = h.toLowerCase();
    const p = Object.keys(c);
    let b = p.length,
      B;
    for (; b-- > 0;) if (((B = p[b]), h === B.toLowerCase())) return B;
    return null;
  }
  const De =
      typeof globalThis < 'u'
        ? globalThis
        : typeof self < 'u'
          ? self
          : typeof window < 'u'
            ? window
            : Ji,
    Ze = (c) => !v(c) && c !== De;
  function Ke(...c) {
    const { caseless: h, skipUndefined: p } = (Ze(this) && this) || {},
      b = {},
      B = (O, z) => {
        if (z === '__proto__' || z === 'constructor' || z === 'prototype')
          return;
        const H = (h && typeof z == 'string' && Oe(b, z)) || z,
          ee = r(b, H) ? b[H] : void 0;
        te(ee) && te(O)
          ? (b[H] = Ke(ee, O))
          : te(O)
            ? (b[H] = Ke({}, O))
            : y(O)
              ? (b[H] = O.slice())
              : (!p || !v(O)) && (b[H] = O);
      };
    for (let O = 0, z = c.length; O < z; O++) {
      const H = c[O];
      if (!H || w(H) || (_e(H, B), typeof H != 'object' || y(H))) continue;
      const ee = Object.getOwnPropertySymbols(H);
      for (let de = 0; de < ee.length; de++) {
        const oe = ee[de];
        st.call(H, oe) && B(H[oe], oe);
      }
    }
    return b;
  }
  const g = (c, h, p, { allOwnKeys: b } = {}) => (
      _e(
        h,
        (B, O) => {
          p && E(B)
            ? Object.defineProperty(c, O, {
                __proto__: null,
                value: t(B, p),
                writable: !0,
                enumerable: !0,
                configurable: !0,
              })
            : Object.defineProperty(c, O, {
                __proto__: null,
                value: B,
                writable: !0,
                enumerable: !0,
                configurable: !0,
              });
        },
        { allOwnKeys: b },
      ),
      c
    ),
    pe = (c) => (c.charCodeAt(0) === 65279 && (c = c.slice(1)), c),
    ne = (c, h, p, b) => {
      ((c.prototype = Object.create(h.prototype, b)),
        Object.defineProperty(c.prototype, 'constructor', {
          __proto__: null,
          value: c,
          writable: !0,
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(c, 'super', {
          __proto__: null,
          value: h.prototype,
        }),
        p && Object.assign(c.prototype, p));
    },
    be = (c, h, p, b) => {
      let B, O, z;
      const H = {};
      if (((h = h || {}), c == null)) return h;
      do {
        for (B = Object.getOwnPropertyNames(c), O = B.length; O-- > 0;)
          ((z = B[O]),
            (!b || b(z, c, h)) && !H[z] && ((h[z] = c[z]), (H[z] = !0)));
        c = p !== !1 && u(c);
      } while (c && (!p || p(c, h)) && c !== Object.prototype);
      return h;
    },
    ke = (c, h, p) => {
      ((c = String(c)),
        (p === void 0 || p > c.length) && (p = c.length),
        (p -= h.length));
      const b = c.indexOf(h, p);
      return b !== -1 && b === p;
    },
    Me = (c) => {
      if (!c) return null;
      if (y(c)) return c;
      let h = c.length;
      if (!N(h)) return null;
      const p = new Array(h);
      for (; h-- > 0;) p[h] = c[h];
      return p;
    },
    qe = (
      (c) => (h) =>
        c && h instanceof c
    )(typeof Uint8Array < 'u' && u(Uint8Array)),
    je = (c, h) => {
      const b = (c && c[a]).call(c);
      let B;
      for (; (B = b.next()) && !B.done;) {
        const O = B.value;
        h.call(c, O[0], O[1]);
      }
    },
    Ve = (c, h) => {
      let p;
      const b = [];
      for (; (p = c.exec(h)) !== null;) b.push(p);
      return b;
    },
    ot = f('HTMLFormElement'),
    lt = (c) =>
      c.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (p, b, B) {
        return b.toUpperCase() + B;
      }),
    { propertyIsEnumerable: st } = Object.prototype,
    ut = f('RegExp'),
    pt = (c, h) => {
      const p = Object.getOwnPropertyDescriptors(c),
        b = {};
      (_e(p, (B, O) => {
        let z;
        (z = h(B, O, c)) !== !1 && (b[O] = z || B);
      }),
        Object.defineProperties(c, b));
    },
    kt = (c) => {
      pt(c, (h, p) => {
        if (E(c) && ['arguments', 'caller', 'callee'].includes(p)) return !1;
        const b = c[p];
        if (E(b)) {
          if (((h.enumerable = !1), 'writable' in h)) {
            h.writable = !1;
            return;
          }
          h.set ||
            (h.set = () => {
              throw Error("Can not rewrite read-only method '" + p + "'");
            });
        }
      });
    },
    U = (c, h) => {
      const p = {},
        b = (B) => {
          B.forEach((O) => {
            p[O] = !0;
          });
        };
      return (y(c) ? b(c) : b(String(c).split(h)), p);
    },
    k = () => {},
    M = (c, h) => (c != null && Number.isFinite((c = +c)) ? c : h);
  function j(c) {
    return !!(c && E(c.append) && c[e] === 'FormData' && c[a]);
  }
  const V = (c) => {
      const h = new WeakSet(),
        p = (b) => {
          if (D(b)) {
            if (h.has(b)) return;
            if (w(b)) return b;
            if (!('toJSON' in b)) {
              h.add(b);
              let B;
              if ($(b)) {
                B = [];
                for (const O of b) {
                  const z = p(O);
                  !v(z) && B.push(z);
                }
              } else
                ((B = y(b) ? [] : {}),
                  _e(b, (O, z) => {
                    const H = p(O);
                    !v(H) && (B[z] = H);
                  }));
              return (h.delete(b), B);
            }
          }
          return b;
        };
      return p(c);
    },
    x = f('AsyncFunction'),
    J = (c) => c && (D(c) || E(c)) && E(c.then) && E(c.catch),
    Q = ((c, h) =>
      c
        ? setImmediate
        : h
          ? ((p, b) => (
              De.addEventListener(
                'message',
                ({ source: B, data: O }) => {
                  B === De && O === p && b.length && b.shift()();
                },
                !1,
              ),
              (B) => {
                (b.push(B), De.postMessage(p, '*'));
              }
            ))(`axios@${Math.random()}`, [])
          : (p) => setTimeout(p))(
      typeof setImmediate == 'function',
      E(De.postMessage),
    ),
    re =
      typeof queueMicrotask < 'u'
        ? queueMicrotask.bind(De)
        : (typeof process < 'u' && process.nextTick) || Q,
    ce = (c) => c != null && E(c[a]);
  var S = {
    isArray: y,
    isArrayBuffer: R,
    isBuffer: w,
    isFormData: He,
    isArrayBufferView: C,
    isString: P,
    isNumber: N,
    isBoolean: G,
    isObject: D,
    isPlainObject: te,
    isEmptyObject: W,
    isReadableStream: Be,
    isRequest: ge,
    isResponse: ve,
    isHeaders: xe,
    isUndefined: v,
    isDate: F,
    isFile: K,
    isReactNativeBlob: Y,
    isReactNative: ue,
    isBlob: we,
    isRegExp: ut,
    isFunction: E,
    isStream: q,
    isURLSearchParams: L,
    isTypedArray: qe,
    isFileList: Ce,
    forEach: _e,
    merge: Ke,
    extend: g,
    trim: Re,
    stripBOM: pe,
    inherits: ne,
    toFlatObject: be,
    kindOf: s,
    kindOfTest: f,
    endsWith: ke,
    toArray: Me,
    forEachEntry: je,
    matchAll: Ve,
    isHTMLForm: ot,
    hasOwnProperty: r,
    hasOwnProp: r,
    hasOwnInPrototypeChain: n,
    getSafeProp: i,
    reduceDescriptors: pt,
    freezeMethods: kt,
    toObjectSet: U,
    toCamelCase: lt,
    noop: k,
    toFiniteNumber: M,
    findKey: Oe,
    global: De,
    isContextDefined: Ze,
    isSpecCompliantForm: j,
    toJSONObject: V,
    isAsyncFn: x,
    isThenable: J,
    setImmediate: Q,
    asap: re,
    isIterable: ce,
    isSafeIterable: (c) => c != null && n(c, a) && ce(c),
  };
  const me = S.toObjectSet([
    'age',
    'authorization',
    'content-length',
    'content-type',
    'etag',
    'expires',
    'from',
    'host',
    'if-modified-since',
    'if-unmodified-since',
    'last-modified',
    'location',
    'max-forwards',
    'proxy-authorization',
    'referer',
    'retry-after',
    'user-agent',
  ]);
  var ze = (c) => {
    const h = {};
    let p, b, B;
    return (
      c &&
        c
          .split(
            `
`,
          )
          .forEach(function (z) {
            ((B = z.indexOf(':')),
              (p = z.substring(0, B).trim().toLowerCase()),
              (b = z.substring(B + 1).trim()));
            const H = S.hasOwnProp(h, p);
            !p ||
              (H && S.hasOwnProp(me, p)) ||
              (p === 'set-cookie'
                ? H
                  ? h[p].push(b)
                  : (h[p] = [b])
                : (h[p] = H ? h[p] + ', ' + b : b));
          }),
      h
    );
  };
  function se(c) {
    let h = 0,
      p = c.length;
    for (; h < p;) {
      const b = c.charCodeAt(h);
      if (b !== 9 && b !== 32) break;
      h += 1;
    }
    for (; p > h;) {
      const b = c.charCodeAt(p - 1);
      if (b !== 9 && b !== 32) break;
      p -= 1;
    }
    return h === 0 && p === c.length ? c : c.slice(h, p);
  }
  const fe = new RegExp('[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+', 'g'),
    $e = new RegExp('[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+', 'g');
  function Ye(c, h) {
    return S.isArray(c) ? c.map((p) => Ye(p, h)) : se(String(c).replace(h, ''));
  }
  const tt = (c) => Ye(c, fe),
    Ct = (c) => Ye(c, $e);
  function ht(c) {
    const h = Object.create(null);
    return (
      S.forEach(c.toJSON(), (p, b) => {
        h[b] = Ct(p);
      }),
      h
    );
  }
  const mt = Symbol('internals');
  function xt(c) {
    return c && String(c).trim().toLowerCase();
  }
  function It(c) {
    return c === !1 || c == null ? c : S.isArray(c) ? c.map(It) : tt(String(c));
  }
  function Dt(c) {
    const h = Object.create(null),
      p = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let b;
    for (; (b = p.exec(c));) h[b[1]] = b[2];
    return h;
  }
  const ar = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  function yr(c) {
    let h = 0,
      p = c.length;
    for (; h < p;) {
      const b = c.charCodeAt(h);
      if (b !== 9 && b !== 32) break;
      h += 1;
    }
    for (; p > h;) {
      const b = c.charCodeAt(p - 1);
      if (b !== 9 && b !== 32) break;
      p -= 1;
    }
    return h === 0 && p === c.length ? c : c.slice(h, p);
  }
  function Ii(c) {
    const h = c.length - 1;
    if (h < 1 || c.charCodeAt(0) !== 34 || c.charCodeAt(h) !== 34) return c;
    let p = '';
    for (let b = 1; b < h; b++) {
      const B = c.charCodeAt(b);
      if (B === 34 || (B === 92 && ((b += 1), b >= h))) return c;
      p += c[b];
    }
    return p;
  }
  function Ei(c) {
    const h = Object.create(null),
      p = String(c);
    let b = 0,
      B = !1,
      O = !1;
    function z(H) {
      const ee = yr(p.slice(b, H)),
        de = ee.indexOf('=');
      if (de < 1) return;
      const oe = yr(ee.slice(0, de));
      if (!ar.test(oe)) return;
      const he = oe.toLowerCase();
      if (he === '__proto__' || he === 'constructor' || he === 'prototype')
        return;
      const Ne = yr(ee.slice(de + 1));
      h[he] = Ii(Ne);
    }
    for (let H = 0; H < p.length; H++) {
      const ee = p.charCodeAt(H);
      B
        ? O
          ? (O = !1)
          : ee === 92
            ? (O = !0)
            : ee === 34 && (B = !1)
        : ee === 34
          ? (B = !0)
          : (ee === 44 || ee === 59) && (z(H), (b = H + 1));
    }
    return (z(p.length), h);
  }
  const Ti = (c) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(c.trim());
  function Rn(c, h, p, b, B) {
    if (S.isFunction(b)) return b.call(this, h, p);
    if ((B && (h = p), !!S.isString(h))) {
      if (S.isString(b)) return h.indexOf(b) !== -1;
      if (S.isRegExp(b)) return b.test(h);
    }
  }
  function Ri(c) {
    return c
      .trim()
      .toLowerCase()
      .replace(/([a-z\d])(\w*)/g, (h, p, b) => p.toUpperCase() + b);
  }
  function Mi(c, h) {
    const p = S.toCamelCase(' ' + h);
    ['get', 'set', 'has'].forEach((b) => {
      Object.defineProperty(c, b + p, {
        __proto__: null,
        value: function (B, O, z) {
          return this[b].call(this, h, B, O, z);
        },
        configurable: !0,
      });
    });
  }
  class gt {
    constructor(h) {
      h && this.set(h);
    }
    set(h, p, b) {
      const B = this;
      function O(H, ee, de) {
        const oe = xt(ee);
        if (!oe) return;
        const he = S.findKey(B, oe);
        (!he ||
          B[he] === void 0 ||
          de === !0 ||
          (de === void 0 && B[he] !== !1)) &&
          (B[he || ee] = It(H));
      }
      const z = (H, ee) => S.forEach(H, (de, oe) => O(de, oe, ee));
      if (S.isPlainObject(h) || h instanceof this.constructor) z(h, p);
      else if (S.isString(h) && (h = h.trim()) && !Ti(h)) z(ze(h), p);
      else if (S.isObject(h) && S.isSafeIterable(h)) {
        let H = Object.create(null),
          ee,
          de;
        for (const oe of h) {
          if (!S.isArray(oe))
            throw new TypeError('Object iterator must return a key-value pair');
          ((de = oe[0]),
            S.hasOwnProp(H, de)
              ? ((ee = H[de]),
                (H[de] = S.isArray(ee) ? [...ee, oe[1]] : [ee, oe[1]]))
              : (H[de] = oe[1]));
        }
        z(H, p);
      } else h != null && O(p, h, b);
      return this;
    }
    get(h, p) {
      if (((h = xt(h)), h)) {
        const b = S.findKey(this, h);
        if (b) {
          const B = this[b];
          if (!p) return B;
          if (p === !0) return Dt(B);
          if (S.isFunction(p)) return p.call(this, B, b);
          if (S.isRegExp(p)) return p.exec(B);
          throw new TypeError('parser must be boolean|regexp|function');
        }
      }
    }
    has(h, p) {
      if (((h = xt(h)), h)) {
        const b = S.findKey(this, h);
        return !!(b && this[b] !== void 0 && (!p || Rn(this, this[b], b, p)));
      }
      return !1;
    }
    delete(h, p) {
      const b = this;
      let B = !1;
      function O(z) {
        if (((z = xt(z)), z)) {
          const H = S.findKey(b, z);
          H && (!p || Rn(b, b[H], H, p)) && (delete b[H], (B = !0));
        }
      }
      return (S.isArray(h) ? h.forEach(O) : O(h), B);
    }
    clear(h) {
      const p = Object.keys(this);
      let b = p.length,
        B = !1;
      for (; b--;) {
        const O = p[b];
        (!h || Rn(this, this[O], O, h, !0)) && (delete this[O], (B = !0));
      }
      return B;
    }
    normalize(h) {
      const p = this,
        b = {};
      return (
        S.forEach(this, (B, O) => {
          const z = S.findKey(b, O);
          if (z) {
            ((p[z] = It(B)), delete p[O]);
            return;
          }
          const H = h ? Ri(O) : String(O).trim();
          (H !== O && delete p[O], (p[H] = It(B)), (b[H] = !0));
        }),
        this
      );
    }
    concat(...h) {
      return this.constructor.concat(this, ...h);
    }
    toJSON(h) {
      const p = Object.create(null);
      return (
        S.forEach(this, (b, B) => {
          b != null &&
            b !== !1 &&
            (p[B] = h && S.isArray(b) ? b.join(', ') : b);
        }),
        p
      );
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON()).map(([h, p]) => h + ': ' + p).join(`
`);
    }
    getSetCookie() {
      const h = this.get('set-cookie');
      return S.isArray(h) ? h : h == null || h === !1 ? [] : [h];
    }
    get [Symbol.toStringTag]() {
      return 'AxiosHeaders';
    }
    static from(h) {
      return h instanceof this ? h : new this(h);
    }
    static parseParameters(h) {
      return Ei(h);
    }
    static concat(h, ...p) {
      const b = new this(h);
      return (p.forEach((B) => b.set(B)), b);
    }
    static accessor(h) {
      const b = (this[mt] = this[mt] = { accessors: {} }).accessors,
        B = this.prototype;
      function O(z) {
        const H = xt(z);
        b[H] || (Mi(B, z), (b[H] = !0));
      }
      return (S.isArray(h) ? h.forEach(O) : O(h), this);
    }
  }
  (gt.accessor([
    'Content-Type',
    'Content-Length',
    'Accept',
    'Accept-Encoding',
    'User-Agent',
    'Authorization',
  ]),
    S.reduceDescriptors(gt.prototype, ({ value: c }, h) => {
      let p = h[0].toUpperCase() + h.slice(1);
      return {
        get: () => c,
        set(b) {
          this[p] = b;
        },
      };
    }),
    S.freezeMethods(gt));
  const Sn = '[REDACTED ****]';
  function Oi(c) {
    if (S.hasOwnProp(c, 'toJSON')) return !0;
    let h = Object.getPrototypeOf(c);
    for (; h && h !== Object.prototype;) {
      if (S.hasOwnProp(h, 'toJSON')) return !0;
      h = Object.getPrototypeOf(h);
    }
    return !1;
  }
  function Ui(c, h) {
    const p = new Set(h.map((O) => String(O).toLowerCase())),
      b = [],
      B = (O) => {
        if (O === null || typeof O != 'object' || S.isBuffer(O)) return O;
        if (b.indexOf(O) !== -1) return;
        (O instanceof gt && (O = O.toJSON()), b.push(O));
        let z;
        if (S.isArray(O))
          ((z = []),
            O.forEach((H, ee) => {
              const de = B(H);
              S.isUndefined(de) || (z[ee] = de);
            }));
        else {
          if (!S.isPlainObject(O) && Oi(O)) return (b.pop(), O);
          z = Object.create(null);
          for (const [H, ee] of Object.entries(O)) {
            const de = p.has(H.toLowerCase()) ? Sn : B(ee);
            S.isUndefined(de) || (z[H] = de);
          }
        }
        return (b.pop(), z);
      };
    return B(c);
  }
  function ni(c) {
    try {
      return String(c);
    } catch {
      return '';
    }
  }
  function ji(c) {
    return (
      c.errors
        .map((p) => {
          try {
            return p && p.message ? ni(p.message) : ni(p);
          } catch {
            return '';
          }
        })
        .filter(Boolean)
        .join('; ') ||
      c.name ||
      'AggregateError'
    );
  }
  class ye extends Error {
    static from(h, p, b, B, O, z) {
      let H = h.message;
      !H && S.isArray(h.errors) && h.errors.length && (H = ji(h));
      const ee = new ye(H, p || h.code, b, B, O);
      return (
        Object.defineProperty(ee, 'cause', {
          __proto__: null,
          value: h,
          writable: !0,
          enumerable: !1,
          configurable: !0,
        }),
        (ee.name = h.name),
        h.status != null && ee.status == null && (ee.status = h.status),
        z && Object.assign(ee, z),
        ee
      );
    }
    constructor(h, p, b, B, O) {
      (super(h),
        Object.defineProperty(this, 'message', {
          __proto__: null,
          value: h,
          enumerable: !0,
          writable: !0,
          configurable: !0,
        }),
        (this.name = 'AxiosError'),
        (this.isAxiosError = !0),
        p && (this.code = p),
        b && (this.config = b),
        B && (this.request = B),
        O && ((this.response = O), (this.status = O.status)));
    }
    toJSON() {
      const h = this.config,
        p = h && S.hasOwnProp(h, 'redact') ? h.redact : void 0,
        b = S.isArray(p) && p.length > 0 ? Ui(h, p) : S.toJSONObject(h);
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: b,
        code: this.code,
        status: this.status,
      };
    }
  }
  ((ye.ERR_BAD_OPTION_VALUE = 'ERR_BAD_OPTION_VALUE'),
    (ye.ERR_BAD_OPTION = 'ERR_BAD_OPTION'),
    (ye.ECONNABORTED = 'ECONNABORTED'),
    (ye.ETIMEDOUT = 'ETIMEDOUT'),
    (ye.ECONNREFUSED = 'ECONNREFUSED'),
    (ye.ERR_NETWORK = 'ERR_NETWORK'),
    (ye.ERR_FR_TOO_MANY_REDIRECTS = 'ERR_FR_TOO_MANY_REDIRECTS'),
    (ye.ERR_DEPRECATED = 'ERR_DEPRECATED'),
    (ye.ERR_BAD_RESPONSE = 'ERR_BAD_RESPONSE'),
    (ye.ERR_BAD_REQUEST = 'ERR_BAD_REQUEST'),
    (ye.ERR_CANCELED = 'ERR_CANCELED'),
    (ye.ERR_NOT_SUPPORT = 'ERR_NOT_SUPPORT'),
    (ye.ERR_INVALID_URL = 'ERR_INVALID_URL'),
    (ye.ERR_FORM_DATA_DEPTH_EXCEEDED = 'ERR_FORM_DATA_DEPTH_EXCEEDED'));
  var zi = null;
  const ai = 100;
  function Mn(c) {
    return S.isPlainObject(c) || S.isArray(c);
  }
  function ii(c) {
    return S.endsWith(c, '[]') ? c.slice(0, -2) : c;
  }
  function On(c, h, p) {
    return c
      ? c
          .concat(h)
          .map(function (B, O) {
            return ((B = ii(B)), !p && O ? '[' + B + ']' : B);
          })
          .join(p ? '.' : '')
      : h;
  }
  function Di(c) {
    return S.isArray(c) && !c.some(Mn);
  }
  const oi = S.toFlatObject(S, {}, null, function (h) {
    return /^is[A-Z]/.test(h);
  });
  function Bn(c, h, p) {
    if (!S.isObject(c)) throw new TypeError('target must be an object');
    ((h = h || new FormData()),
      (p = S.toFlatObject(
        p,
        { metaTokens: !0, dots: !1, indexes: !1 },
        !1,
        function (Ue, Le) {
          return !S.isUndefined(Le[Ue]);
        },
      )));
    const b = p.metaTokens,
      B = p.visitor || Xe,
      O = p.dots,
      z = p.indexes,
      H = p.Blob || (typeof Blob < 'u' && Blob),
      ee = p.maxDepth === void 0 ? ai : p.maxDepth,
      de = H && S.isSpecCompliantForm(h),
      oe = [];
    if (!S.isFunction(B)) throw new TypeError('visitor must be a function');
    function he(le) {
      if (le === null) return '';
      if (S.isDate(le)) return le.toISOString();
      if (S.isBoolean(le)) return le.toString();
      if (!de && S.isBlob(le))
        throw new ye('Blob is not supported. Use a Buffer instead.');
      if (S.isArrayBuffer(le) || S.isTypedArray(le)) {
        if (de && typeof H == 'function') return new H([le]);
        throw new ye(
          'Blob is not supported. Use a Buffer instead.',
          ye.ERR_NOT_SUPPORT,
        );
      }
      return le;
    }
    function Ne(le) {
      if (le > ee)
        throw new ye(
          'Object is too deeply nested (' + le + ' levels). Max depth: ' + ee,
          ye.ERR_FORM_DATA_DEPTH_EXCEEDED,
        );
    }
    function Je(le, Ue) {
      if (ee === 1 / 0) return JSON.stringify(le);
      const Le = [];
      return JSON.stringify(le, function (vt, ct) {
        if (!S.isObject(ct)) return ct;
        for (; Le.length && Le[Le.length - 1] !== this;) Le.pop();
        return (Le.push(ct), Ne(Ue + Le.length - 1), ct);
      });
    }
    function Xe(le, Ue, Le) {
      let et = le;
      if (S.isReactNative(h) && S.isReactNativeBlob(le))
        return (h.append(On(Le, Ue, O), he(le)), !1);
      if (le && !Le && typeof le == 'object') {
        if (S.endsWith(Ue, '{}'))
          ((Ue = b ? Ue : Ue.slice(0, -2)), (le = Je(le, 1)));
        else if (
          (S.isArray(le) && Di(le)) ||
          ((S.isFileList(le) || S.endsWith(Ue, '[]')) && (et = S.toArray(le)))
        )
          return (
            (Ue = ii(Ue)),
            et.forEach(function (ct, ir) {
              !(S.isUndefined(ct) || ct === null) &&
                h.append(
                  z === !0 ? On([Ue], ir, O) : z === null ? Ue : Ue + '[]',
                  he(ct),
                );
            }),
            !1
          );
      }
      return Mn(le) ? !0 : (h.append(On(Le, Ue, O), he(le)), !1);
    }
    const rt = Object.assign(oi, {
      defaultVisitor: Xe,
      convertValue: he,
      isVisitable: Mn,
    });
    function Te(le, Ue, Le = 0) {
      if (!S.isUndefined(le)) {
        if ((Ne(Le), oe.indexOf(le) !== -1))
          throw new Error('Circular reference detected in ' + Ue.join('.'));
        (oe.push(le),
          S.forEach(le, function (vt, ct) {
            (!(S.isUndefined(vt) || vt === null) &&
              B.call(h, vt, S.isString(ct) ? ct.trim() : ct, Ue, rt)) === !0 &&
              Te(vt, Ue ? Ue.concat(ct) : [ct], Le + 1);
          }),
          oe.pop());
      }
    }
    if (!S.isObject(c)) throw new TypeError('data must be an object');
    return (Te(c), h);
  }
  function si(c) {
    const h = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
    };
    return encodeURIComponent(c).replace(/[!'()~]|%20/g, function (b) {
      return h[b];
    });
  }
  function Un(c, h) {
    ((this._pairs = []), c && Bn(c, this, h));
  }
  const li = Un.prototype;
  ((li.append = function (h, p) {
    this._pairs.push([h, p]);
  }),
    (li.toString = function (h) {
      const p = h ? (b) => h.call(this, b, si) : si;
      return this._pairs
        .map(function (B) {
          return p(B[0]) + '=' + p(B[1]);
        }, '')
        .join('&');
    }));
  function Ni(c) {
    return encodeURIComponent(c)
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%20/g, '+');
  }
  function ui(c, h, p) {
    if (!h) return c;
    c = c || '';
    const b = S.isFunction(p) ? { serialize: p } : p,
      B = S.getSafeProp(b, 'encode') || Ni,
      O = S.getSafeProp(b, 'serialize');
    let z;
    if (
      (O
        ? (z = O(h, b))
        : (z = S.isURLSearchParams(h)
            ? h.toString()
            : new Un(h, b).toString(B)),
      z)
    ) {
      const H = c.indexOf('#');
      (H !== -1 && (c = c.slice(0, H)),
        (c += (c.indexOf('?') === -1 ? '?' : '&') + z));
    }
    return c;
  }
  class ci {
    constructor() {
      this.handlers = [];
    }
    use(h, p, b) {
      return (
        this.handlers.push({
          fulfilled: h,
          rejected: p,
          synchronous: b ? b.synchronous : !1,
          runWhen: b ? b.runWhen : null,
        }),
        this.handlers.length - 1
      );
    }
    eject(h) {
      this.handlers[h] && (this.handlers[h] = null);
    }
    clear() {
      this.handlers && (this.handlers = []);
    }
    forEach(h) {
      S.forEach(this.handlers, function (b) {
        b !== null && h(b);
      });
    }
  }
  var A = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1,
      legacyInterceptorReqResOrdering: !0,
      advertiseZstdAcceptEncoding: !1,
      validateStatusUndefinedResolves: !0,
    },
    l = typeof URLSearchParams < 'u' ? URLSearchParams : Un,
    m = typeof FormData < 'u' ? FormData : null,
    _ = typeof Blob < 'u' ? Blob : null,
    I = {
      isBrowser: !0,
      classes: { URLSearchParams: l, FormData: m, Blob: _ },
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data'],
    };
  const T = typeof window < 'u' && typeof document < 'u',
    ae = (typeof navigator == 'object' && navigator) || void 0,
    X =
      T &&
      (!ae || ['ReactNative', 'NativeScript', 'NS'].indexOf(ae.product) < 0),
    Ae =
      typeof WorkerGlobalScope < 'u' &&
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts == 'function',
    Ie = (T && window.location.href) || 'http://localhost';
  var Ge = Object.freeze({
      __proto__: null,
      hasBrowserEnv: T,
      hasStandardBrowserEnv: X,
      hasStandardBrowserWebWorkerEnv: Ae,
      navigator: ae,
      origin: Ie,
    }),
    Qe = { ...Ge, ...I };
  function di(c, h) {
    return Bn(c, new Qe.classes.URLSearchParams(), {
      visitor: function (p, b, B, O) {
        return Qe.isNode && S.isBuffer(p)
          ? (this.append(b, p.toString('base64')), !1)
          : O.defaultVisitor.apply(this, arguments);
      },
      ...h,
    });
  }
  const Pn = ai;
  function Co(c) {
    if (c > Pn)
      throw new ye(
        'FormData field is too deeply nested (' +
          c +
          ' levels). Max depth: ' +
          Pn,
        ye.ERR_FORM_DATA_DEPTH_EXCEEDED,
      );
  }
  function fd(c) {
    const h = [],
      p = /[^.[\]]+|\[([^.[\]]*)]/g;
    let b;
    for (; (b = p.exec(c)) !== null;)
      (Co(h.length), h.push(b[0] === '[]' ? '' : b[1] || b[0]));
    return h;
  }
  function hd(c) {
    const h = {},
      p = Object.keys(c);
    let b;
    const B = p.length;
    let O;
    for (b = 0; b < B; b++) ((O = p[b]), (h[O] = c[O]));
    return h;
  }
  function So(c) {
    function h(p, b, B, O) {
      Co(O);
      let z = p[O++];
      if (z === '__proto__') return !0;
      const H = Number.isFinite(+z),
        ee = O >= p.length;
      return (
        (z = !z && S.isArray(B) ? B.length : z),
        ee
          ? (S.hasOwnProp(B, z)
              ? (B[z] = S.isArray(B[z]) ? B[z].concat(b) : [B[z], b])
              : (B[z] = b),
            !H)
          : ((!S.hasOwnProp(B, z) || !S.isObject(B[z])) && (B[z] = []),
            h(p, b, B[z], O) && S.isArray(B[z]) && (B[z] = hd(B[z])),
            !H)
      );
    }
    if (S.isFormData(c) && S.isFunction(c.entries)) {
      const p = {};
      return (
        S.forEachEntry(c, (b, B) => {
          h(fd(b), B, p, 0);
        }),
        p
      );
    }
    return null;
  }
  const An = (c, h) => (c != null && S.hasOwnProp(c, h) ? c[h] : void 0);
  function gd(c, h, p) {
    if (S.isString(c))
      try {
        return ((h || JSON.parse)(c), S.trim(c));
      } catch (b) {
        if (b.name !== 'SyntaxError') throw b;
      }
    return (p || JSON.stringify)(c);
  }
  const jn = {
    transitional: A,
    adapter: ['xhr', 'http', 'fetch'],
    transformRequest: [
      function (h, p) {
        const b = p.getContentType() || '',
          B = b.indexOf('application/json') > -1,
          O = S.isObject(h);
        if ((O && S.isHTMLForm(h) && (h = new FormData(h)), S.isFormData(h)))
          return B ? JSON.stringify(So(h)) : h;
        if (
          S.isArrayBuffer(h) ||
          S.isBuffer(h) ||
          S.isStream(h) ||
          S.isFile(h) ||
          S.isBlob(h) ||
          S.isReadableStream(h)
        )
          return h;
        if (S.isArrayBufferView(h)) return h.buffer;
        if (S.isURLSearchParams(h))
          return (
            p.setContentType(
              'application/x-www-form-urlencoded;charset=utf-8',
              !1,
            ),
            h.toString()
          );
        let H;
        if (O) {
          const ee = An(this, 'formSerializer');
          if (b.indexOf('application/x-www-form-urlencoded') > -1)
            return di(h, ee).toString();
          if ((H = S.isFileList(h)) || b.indexOf('multipart/form-data') > -1) {
            const de = An(this, 'env'),
              oe = de && de.FormData;
            return Bn(H ? { 'files[]': h } : h, oe && new oe(), ee);
          }
        }
        return O || B ? (p.setContentType('application/json', !1), gd(h)) : h;
      },
    ],
    transformResponse: [
      function (h) {
        const p = An(this, 'transitional') || jn.transitional,
          b = p && p.forcedJSONParsing,
          B = An(this, 'responseType'),
          O = B === 'json';
        if (S.isResponse(h) || S.isReadableStream(h)) return h;
        if (h && S.isString(h) && ((b && !B) || O)) {
          const H = !(p && p.silentJSONParsing) && O;
          try {
            return JSON.parse(h, An(this, 'parseReviver'));
          } catch (ee) {
            if (H)
              throw ee.name === 'SyntaxError'
                ? ye.from(
                    ee,
                    ye.ERR_BAD_RESPONSE,
                    this,
                    null,
                    An(this, 'response'),
                  )
                : ee;
          }
        }
        return h;
      },
    ],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: Qe.classes.FormData, Blob: Qe.classes.Blob },
    validateStatus: function (h) {
      return h >= 200 && h < 300;
    },
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': void 0,
      },
    },
  };
  S.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'query'], (c) => {
    jn.headers[c] = {};
  });
  function qi(c, h) {
    const p = this || jn,
      b = h || p,
      B = gt.from(b.headers);
    let O = b.data;
    return (
      S.forEach(c, function (H) {
        O = H.call(p, O, B.normalize(), h ? h.status : void 0);
      }),
      B.normalize(),
      O
    );
  }
  function Bo(c) {
    return !!(c && c.__CANCEL__);
  }
  class zn extends ye {
    constructor(h, p, b) {
      (super(h ?? 'canceled', ye.ERR_CANCELED, p, b),
        (this.name = 'CanceledError'),
        (this.__CANCEL__ = !0));
    }
  }
  function Po(c, h, p) {
    const b = p.config.validateStatus;
    !p.status || !b || b(p.status)
      ? c(p)
      : h(
          new ye(
            'Request failed with status code ' + p.status,
            p.status >= 400 && p.status < 500
              ? ye.ERR_BAD_REQUEST
              : ye.ERR_BAD_RESPONSE,
            p.config,
            p.request,
            p,
          ),
        );
  }
  function pd(c) {
    const h = /^([-+\w]{1,25}):(?:\/\/)?/.exec(c);
    return (h && h[1]) || '';
  }
  function md(c, h) {
    c = c || 10;
    const p = new Array(c),
      b = new Array(c);
    let B = 0,
      O = 0,
      z;
    return (
      (h = h !== void 0 ? h : 1e3),
      function (ee) {
        const de = Date.now(),
          oe = b[O];
        (z || (z = de), (p[B] = ee), (b[B] = de));
        let he = O,
          Ne = 0;
        for (; he !== B;) ((Ne += p[he++]), (he = he % c));
        if (((B = (B + 1) % c), B === O && (O = (O + 1) % c), de - z < h))
          return;
        const Je = oe && de - oe;
        return Je ? Math.round((Ne * 1e3) / Je) : void 0;
      }
    );
  }
  function yd(c, h) {
    let p = 0,
      b = 1e3 / h,
      B,
      O;
    const z = (de, oe = Date.now()) => {
      ((p = oe), (B = null), O && (clearTimeout(O), (O = null)), c(...de));
    };
    return [
      (...de) => {
        const oe = Date.now(),
          he = oe - p;
        he >= b
          ? z(de, oe)
          : ((B = de),
            O ||
              (O = setTimeout(() => {
                ((O = null), z(B));
              }, b - he)));
      },
      () => B && z(B),
    ];
  }
  const fi = (c, h, p = 3) => {
      let b = 0;
      const B = md(50, 250);
      return yd((O) => {
        if (!O || typeof O.loaded != 'number') return;
        const z = O.loaded,
          H = O.lengthComputable ? O.total : void 0,
          ee = Math.max(0, H != null ? Math.min(z, H) : z),
          de = Math.max(0, ee - b),
          oe = B(de);
        b = Math.max(b, ee);
        const he = {
          loaded: ee,
          total: H,
          progress: H ? ee / H : void 0,
          bytes: de,
          rate: oe || void 0,
          estimated: oe && H ? (H - ee) / oe : void 0,
          event: O,
          lengthComputable: H != null,
          [h ? 'download' : 'upload']: !0,
        };
        c(he);
      }, p);
    },
    Ao = (c, h) => {
      const p = c != null;
      return [(b) => h[0]({ lengthComputable: p, total: c, loaded: b }), h[1]];
    },
    xo =
      (c, h = S.asap) =>
      (...p) =>
        h(() => c(...p));
  var bd = Qe.hasStandardBrowserEnv
      ? ((c, h) => (p) => (
          (p = new URL(p, Qe.origin)),
          c.protocol === p.protocol &&
            c.host === p.host &&
            (h || c.port === p.port)
        ))(
          new URL(Qe.origin),
          Qe.navigator && /(msie|trident)/i.test(Qe.navigator.userAgent),
        )
      : () => !0,
    wd = Qe.hasStandardBrowserEnv
      ? {
          write(c, h, p, b, B, O, z) {
            if (typeof document > 'u') return;
            const H = [`${c}=${encodeURIComponent(h)}`];
            (S.isNumber(p) && H.push(`expires=${new Date(p).toUTCString()}`),
              S.isString(b) && H.push(`path=${b}`),
              S.isString(B) && H.push(`domain=${B}`),
              O === !0 && H.push('secure'),
              S.isString(z) && H.push(`SameSite=${z}`),
              (document.cookie = H.join('; ')));
          },
          read(c) {
            if (typeof document > 'u') return null;
            const h = document.cookie.split(';');
            for (let p = 0; p < h.length; p++) {
              const b = h[p].replace(/^\s+/, ''),
                B = b.indexOf('=');
              if (B !== -1 && b.slice(0, B) === c)
                try {
                  return decodeURIComponent(b.slice(B + 1));
                } catch {
                  return b.slice(B + 1);
                }
            }
            return null;
          },
          remove(c) {
            this.write(c, '', Date.now() - 864e5, '/');
          },
        }
      : {
          write() {},
          read() {
            return null;
          },
          remove() {},
        };
  function vd(c) {
    return typeof c != 'string' ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(c);
  }
  function _d(c, h) {
    if (!h) return c;
    let p = c.length;
    for (; p > 0 && c.charCodeAt(p - 1) === 47;) p--;
    return c.slice(0, p) + '/' + h.replace(/^\/+/, '');
  }
  const kd = /^https?:(?!\/\/)/i,
    Cd = /[\t\n\r]/g;
  function Sd(c) {
    let h = 0;
    for (; h < c.length && c.charCodeAt(h) <= 32;) h++;
    return c.slice(h);
  }
  function Bd(c) {
    return Sd(c).replace(Cd, '');
  }
  function Pd(c) {
    return (
      c && c.replace(/(^|&)([^=&]*=)?[^&]+/g, (h, p, b = '') => `${p}${b}${Sn}`)
    );
  }
  function Ad(c) {
    const h = c.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Sn}@`),
      p = h.indexOf('#'),
      B = (p === -1 ? h : h.slice(0, p)).replace(
        /([?&][^=&#]*=)[^&#]*/g,
        `$1${Sn}`,
      );
    return p === -1 ? B : `${B}#${Pd(h.slice(p + 1))}`;
  }
  function Io(c, h) {
    if (typeof c == 'string') {
      const p = Bd(c);
      if (kd.test(p))
        throw new ye(
          `Invalid URL ${JSON.stringify(Ad(p))}: missing "//" after protocol`,
          ye.ERR_INVALID_URL,
          h,
        );
    }
  }
  function Eo(c, h, p, b) {
    Io(h, b);
    let B = !vd(h);
    return c && (B || p === !1) ? (Io(c, b), _d(c, h)) : h;
  }
  const To = (c) => (c instanceof gt ? { ...c } : c),
    xd = (c) =>
      Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor
        ? Object.keys(c).concat(
            Object.getOwnPropertySymbols(c).filter(
              (h) => Object.getOwnPropertyDescriptor(c, h).enumerable,
            ),
          )
        : Object.keys(c);
  function br(c, h) {
    ((c = c || {}), (h = h || {}));
    const p = Object.create(null);
    Object.defineProperty(p, 'hasOwnProperty', {
      __proto__: null,
      value: Object.prototype.hasOwnProperty,
      enumerable: !1,
      writable: !0,
      configurable: !0,
    });
    function b(oe, he, Ne, Je) {
      return S.isPlainObject(oe) && S.isPlainObject(he)
        ? S.merge.call({ caseless: Je }, oe, he)
        : S.isPlainObject(he)
          ? S.merge({}, he)
          : S.isArray(he)
            ? he.slice()
            : he;
    }
    function B(oe, he, Ne, Je) {
      if (S.isUndefined(he)) {
        if (!S.isUndefined(oe)) return b(void 0, oe, Ne, Je);
      } else return b(oe, he, Ne, Je);
    }
    function O(oe, he) {
      if (!S.isUndefined(he)) return b(void 0, he);
    }
    function z(oe, he) {
      if (S.isUndefined(he)) {
        if (!S.isUndefined(oe)) return b(void 0, oe);
      } else return b(void 0, he);
    }
    function H(oe) {
      const he = S.hasOwnProp(h, 'transitional') ? h.transitional : void 0;
      if (!S.isUndefined(he))
        if (S.isPlainObject(he)) {
          if (S.hasOwnProp(he, oe)) return he[oe];
        } else return;
      const Ne = S.hasOwnProp(c, 'transitional') ? c.transitional : void 0;
      if (S.isPlainObject(Ne) && S.hasOwnProp(Ne, oe)) return Ne[oe];
    }
    function ee(oe, he, Ne) {
      if (S.hasOwnProp(h, Ne)) return b(oe, he);
      if (S.hasOwnProp(c, Ne)) return b(void 0, oe);
    }
    const de = {
      url: O,
      method: O,
      data: O,
      baseURL: z,
      transformRequest: z,
      transformResponse: z,
      paramsSerializer: z,
      timeout: z,
      timeoutMessage: z,
      withCredentials: z,
      withXSRFToken: z,
      adapter: z,
      responseType: z,
      xsrfCookieName: z,
      xsrfHeaderName: z,
      onUploadProgress: z,
      onDownloadProgress: z,
      decompress: z,
      maxContentLength: z,
      maxBodyLength: z,
      beforeRedirect: z,
      transport: z,
      httpAgent: z,
      httpsAgent: z,
      cancelToken: z,
      socketPath: z,
      allowedSocketPaths: z,
      responseEncoding: z,
      validateStatus: ee,
      headers: (oe, he, Ne) => B(To(oe), To(he), Ne, !0),
    };
    return (
      S.forEach(xd({ ...c, ...h }), function (he) {
        if (he === '__proto__' || he === 'constructor' || he === 'prototype')
          return;
        const Ne = S.hasOwnProp(de, he) ? de[he] : B,
          Je = S.hasOwnProp(c, he) ? c[he] : void 0,
          Xe = S.hasOwnProp(h, he) ? h[he] : void 0,
          rt = Ne(Je, Xe, he);
        (S.isUndefined(rt) && Ne !== ee) || (p[he] = rt);
      }),
      S.hasOwnProp(h, 'validateStatus') &&
        S.isUndefined(h.validateStatus) &&
        H('validateStatusUndefinedResolves') === !1 &&
        (S.hasOwnProp(c, 'validateStatus')
          ? (p.validateStatus = b(void 0, c.validateStatus))
          : delete p.validateStatus),
      p
    );
  }
  const Id = ['content-type', 'content-length'];
  function Ed(c, h, p) {
    if (p !== 'content-only') {
      c.set(h);
      return;
    }
    Object.entries(h || {}).forEach(([b, B]) => {
      Id.includes(b.toLowerCase()) && c.set(b, B);
    });
  }
  const Td = (c) =>
    encodeURIComponent(c).replace(/%([0-9A-F]{2})/gi, (h, p) =>
      String.fromCharCode(parseInt(p, 16)),
    );
  function Ro(c) {
    const h = br({}, c),
      p = (Ne) => (S.hasOwnProp(h, Ne) ? h[Ne] : void 0),
      b = p('data');
    let B = p('withXSRFToken');
    const O = p('xsrfHeaderName'),
      z = p('xsrfCookieName');
    let H = p('headers');
    const ee = p('auth'),
      de = p('baseURL'),
      oe = p('allowAbsoluteUrls'),
      he = p('url');
    if (
      ((h.headers = H = gt.from(H)),
      (h.url = ui(Eo(de, he, oe, h), p('params'), p('paramsSerializer'))),
      ee)
    ) {
      const Ne = S.getSafeProp(ee, 'username') || '',
        Je = S.getSafeProp(ee, 'password') || '';
      try {
        H.set('Authorization', 'Basic ' + btoa(Ne + ':' + (Je ? Td(Je) : '')));
      } catch (Xe) {
        throw ye.from(Xe, ye.ERR_BAD_OPTION_VALUE, c);
      }
    }
    if (
      (S.isFormData(b) &&
        (Qe.hasStandardBrowserEnv ||
        Qe.hasStandardBrowserWebWorkerEnv ||
        S.isReactNative(b)
          ? H.setContentType(void 0)
          : S.isFunction(b.getHeaders) &&
            Ed(H, b.getHeaders(), p('formDataHeaderPolicy'))),
      Qe.hasStandardBrowserEnv &&
        (S.isFunction(B) && (B = B(h)), B === !0 || (B == null && bd(h.url))))
    ) {
      const Je = O && z && wd.read(z);
      Je && H.set(O, Je);
    }
    return h;
  }
  var Rd =
    typeof XMLHttpRequest < 'u' &&
    function (c) {
      return new Promise(function (p, b) {
        const B = Ro(c);
        let O = B.data;
        const z = gt.from(B.headers).normalize();
        let {
            responseType: H,
            onUploadProgress: ee,
            onDownloadProgress: de,
          } = B,
          oe,
          he,
          Ne,
          Je,
          Xe;
        function rt() {
          (Je && Je(),
            Xe && Xe(),
            B.cancelToken && B.cancelToken.unsubscribe(oe),
            B.signal && B.signal.removeEventListener('abort', oe));
        }
        let Te = new XMLHttpRequest();
        (Te.open(B.method.toUpperCase(), B.url, !0), (Te.timeout = B.timeout));
        function le() {
          if (!Te) return;
          const Le = gt.from(
              'getAllResponseHeaders' in Te && Te.getAllResponseHeaders(),
            ),
            vt = {
              data:
                !H || H === 'text' || H === 'json'
                  ? Te.responseText
                  : Te.response,
              status: Te.status,
              statusText: Te.statusText,
              headers: Le,
              config: c,
              request: Te,
            };
          (Po(
            function (ir) {
              (p(ir), rt());
            },
            function (ir) {
              (b(ir), rt());
            },
            vt,
          ),
            (Te = null));
        }
        ('onloadend' in Te
          ? (Te.onloadend = le)
          : (Te.onreadystatechange = function () {
              !Te ||
                Te.readyState !== 4 ||
                (Te.status === 0 &&
                  !(Te.responseURL && Te.responseURL.startsWith('file:'))) ||
                setTimeout(le);
            }),
          (Te.onabort = function () {
            Te &&
              (b(new ye('Request aborted', ye.ECONNABORTED, c, Te)),
              rt(),
              (Te = null));
          }),
          (Te.onerror = function (et) {
            const vt = et && et.message ? et.message : 'Network Error',
              ct = new ye(vt, ye.ERR_NETWORK, c, Te);
            ((ct.event = et || null), b(ct), rt(), (Te = null));
          }),
          (Te.ontimeout = function () {
            let et = B.timeout
              ? 'timeout of ' + B.timeout + 'ms exceeded'
              : 'timeout exceeded';
            const vt = B.transitional || A;
            (B.timeoutErrorMessage && (et = B.timeoutErrorMessage),
              b(
                new ye(
                  et,
                  vt.clarifyTimeoutError ? ye.ETIMEDOUT : ye.ECONNABORTED,
                  c,
                  Te,
                ),
              ),
              rt(),
              (Te = null));
          }),
          O === void 0 && z.setContentType(null),
          'setRequestHeader' in Te &&
            S.forEach(ht(z), function (et, vt) {
              Te.setRequestHeader(vt, et);
            }),
          S.isUndefined(B.withCredentials) ||
            (Te.withCredentials = !!B.withCredentials),
          H && H !== 'json' && (Te.responseType = B.responseType),
          de && (([Ne, Xe] = fi(de, !0)), Te.addEventListener('progress', Ne)),
          ee &&
            Te.upload &&
            (([he, Je] = fi(ee)),
            Te.upload.addEventListener('progress', he),
            Te.upload.addEventListener('loadend', Je)),
          (B.cancelToken || B.signal) &&
            ((oe = (Le) => {
              Te &&
                (b(!Le || Le.type ? new zn(null, c, Te) : Le),
                Te.abort(),
                rt(),
                (Te = null));
            }),
            B.cancelToken && B.cancelToken.subscribe(oe),
            B.signal &&
              (B.signal.aborted
                ? oe()
                : B.signal.addEventListener('abort', oe))));
        const Ue = pd(B.url);
        if (Ue && !Qe.protocols.includes(Ue)) {
          (b(new ye('Unsupported protocol ' + Ue + ':', ye.ERR_BAD_REQUEST, c)),
            rt());
          return;
        }
        Te.send(O || null);
      });
    };
  const Md = (c, h) => {
      if (((c = c ? c.filter(Boolean) : []), !h && !c.length)) return;
      const p = new AbortController();
      let b = !1;
      const B = function (ee) {
        if (!b) {
          ((b = !0), z());
          const de = ee instanceof Error ? ee : this.reason;
          p.abort(
            de instanceof ye
              ? de
              : new zn(de instanceof Error ? de.message : de),
          );
        }
      };
      let O =
        h &&
        setTimeout(() => {
          ((O = null), B(new ye(`timeout of ${h}ms exceeded`, ye.ETIMEDOUT)));
        }, h);
      const z = () => {
        c &&
          (O && clearTimeout(O),
          (O = null),
          c.forEach((ee) => {
            ee.unsubscribe
              ? ee.unsubscribe(B)
              : ee.removeEventListener('abort', B);
          }),
          (c = null));
      };
      c.forEach((ee) => {
        if (!b) {
          if (ee.aborted) {
            B.call(ee);
            return;
          }
          ee.addEventListener('abort', B, { once: !0 });
        }
      });
      const { signal: H } = p;
      return ((H.unsubscribe = () => S.asap(z)), H);
    },
    Od = function* (c, h) {
      let p = c.byteLength;
      if (p < h) {
        yield c;
        return;
      }
      let b = 0,
        B;
      for (; b < p;) ((B = b + h), yield c.slice(b, B), (b = B));
    },
    Ud = async function* (c, h) {
      for await (const p of jd(c)) yield* Od(p, h);
    },
    jd = async function* (c) {
      if (c[Symbol.asyncIterator]) {
        yield* c;
        return;
      }
      const h = c.getReader();
      try {
        for (;;) {
          const { done: p, value: b } = await h.read();
          if (p) break;
          yield b;
        }
      } finally {
        await h.cancel();
      }
    },
    Mo = (c, h, p, b) => {
      const B = Ud(c, h);
      let O = 0,
        z,
        H = (ee) => {
          z || ((z = !0), b && b(ee));
        };
      return new ReadableStream(
        {
          async pull(ee) {
            try {
              const { done: de, value: oe } = await B.next();
              if (de) {
                (H(), ee.close());
                return;
              }
              let he = oe.byteLength;
              if (p) {
                let Ne = (O += he);
                p(Ne);
              }
              ee.enqueue(new Uint8Array(oe));
            } catch (de) {
              throw (H(de), de);
            }
          },
          cancel(ee) {
            return (H(ee), B.return());
          },
        },
        { highWaterMark: 2 },
      );
    },
    Oo = (c) =>
      (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102),
    Uo = (c, h, p) =>
      h + 2 < p && Oo(c.charCodeAt(h + 1)) && Oo(c.charCodeAt(h + 2)),
    jo = (c) => (c <= 57 ? c - 48 : (c & 223) - 55),
    zd = (c) =>
      (c >= 65 && c <= 90) ||
      (c >= 97 && c <= 122) ||
      (c >= 48 && c <= 57) ||
      c === 43 ||
      c === 47 ||
      c === 45 ||
      c === 95,
    Dd = (c) => c === 9 || c === 10 || c === 12 || c === 13 || c === 32,
    Nd = (c) => {
      const h = Math.floor(c / 4),
        p = c % 4;
      return h * 3 + (p === 2 ? 1 : p === 3 ? 2 : 0);
    },
    qd = (c) => {
      const h = c.length;
      let p = 0;
      return (
        h > 0 &&
          c.charCodeAt(h - 1) === 61 &&
          (p++, h > 1 && c.charCodeAt(h - 2) === 61 && p++),
        Math.floor(((h - p) * 3) / 4)
      );
    },
    Ld = (c) => {
      const h = c.length;
      let p = 0,
        b = 0,
        B = !1;
      for (let O = 0; O < h; O++) {
        let z = c.charCodeAt(O);
        if (
          (z === 37 &&
            Uo(c, O, h) &&
            ((z = jo(c.charCodeAt(O + 1)) * 16 + jo(c.charCodeAt(O + 2))),
            (O += 2)),
          !Dd(z))
        ) {
          if (z === 61) {
            b++;
            continue;
          }
          if (!zd(z) || b > 0) {
            B = !0;
            continue;
          }
          p++;
        }
      }
      return B || b > 2 || (b > 0 && (p + b) % 4 !== 0) || p % 4 === 1
        ? qd(c)
        : Nd(p);
    },
    Vd = (c, h) => {
      if (!c || typeof c != 'string' || !c.startsWith('data:')) return 0;
      const p = c.indexOf(',');
      if (p < 0) return 0;
      const b = c.slice(5, p),
        B = c.slice(p + 1);
      if (/;base64/i.test(b)) return h(B);
      let z = 0;
      for (let H = 0, ee = B.length; H < ee; H++) {
        const de = B.charCodeAt(H);
        if (de === 37 && Uo(B, H, ee)) ((z += 1), (H += 2));
        else if (de < 128) z += 1;
        else if (de < 2048) z += 2;
        else if (de >= 55296 && de <= 56319 && H + 1 < ee) {
          const oe = B.charCodeAt(H + 1);
          oe >= 56320 && oe <= 57343 ? ((z += 4), H++) : (z += 3);
        } else z += 3;
      }
      return z;
    };
  function Fd(c) {
    const h = typeof c == 'string' ? c.indexOf('#') : -1;
    return Vd(h === -1 ? c : c.slice(0, h), Ld);
  }
  const Li = '1.19.0',
    zo = 64 * 1024,
    { isFunction: hi } = S,
    Zd = (c) =>
      encodeURIComponent(c).replace(/%([0-9A-F]{2})/gi, (h, p) =>
        String.fromCharCode(parseInt(p, 16)),
      ),
    Do = (c) => {
      if (!S.isString(c)) return c;
      try {
        return decodeURIComponent(c);
      } catch {
        return c;
      }
    },
    No = (c, ...h) => {
      try {
        return !!c(...h);
      } catch {
        return !1;
      }
    },
    Hd = (c) => {
      const h = c.indexOf('://');
      let p = c;
      return (
        h !== -1 && (p = p.slice(h + 3)),
        p.includes('@') || p.includes(':')
      );
    },
    Wd = (c) => {
      const h =
          S.global !== void 0 && S.global !== null ? S.global : globalThis,
        { ReadableStream: p, TextEncoder: b } = h;
      c = S.merge.call(
        { skipUndefined: !0 },
        { Request: h.Request, Response: h.Response },
        c,
      );
      const { fetch: B, Request: O, Response: z } = c,
        H = B ? hi(B) : typeof fetch == 'function',
        ee = hi(O),
        de = hi(z);
      if (!H) return !1;
      const oe = H && hi(p),
        he =
          H &&
          (typeof b == 'function'
            ? (
                (le) => (Ue) =>
                  le.encode(Ue)
              )(new b())
            : async (le) => new Uint8Array(await new O(le).arrayBuffer())),
        Ne =
          ee &&
          oe &&
          No(() => {
            let le = !1;
            const Ue = new O(Qe.origin, {
                body: new p(),
                method: 'POST',
                get duplex() {
                  return ((le = !0), 'half');
                },
              }),
              Le = Ue.headers.has('Content-Type');
            return (Ue.body != null && Ue.body.cancel(), le && !Le);
          }),
        Je = de && oe && No(() => S.isReadableStream(new z('').body)),
        Xe = { stream: Je && ((le) => le.body) };
      H &&
        ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach((le) => {
          !Xe[le] &&
            (Xe[le] = (Ue, Le) => {
              let et = Ue && Ue[le];
              if (et) return et.call(Ue);
              throw new ye(
                `Response type '${le}' is not supported`,
                ye.ERR_NOT_SUPPORT,
                Le,
              );
            });
        });
      const rt = async (le) => {
          if (le == null) return 0;
          if (S.isBlob(le)) return le.size;
          if (S.isSpecCompliantForm(le))
            return (
              await new O(Qe.origin, { method: 'POST', body: le }).arrayBuffer()
            ).byteLength;
          if (S.isArrayBufferView(le) || S.isArrayBuffer(le))
            return le.byteLength;
          if ((S.isURLSearchParams(le) && (le = le + ''), S.isString(le)))
            return (await he(le)).byteLength;
        },
        Te = async (le, Ue) => {
          const Le = S.toFiniteNumber(le.getContentLength());
          return Le ?? rt(Ue);
        };
      return async (le) => {
        let {
          url: Ue,
          method: Le,
          data: et,
          signal: vt,
          cancelToken: ct,
          timeout: ir,
          onDownloadProgress: Ki,
          onUploadProgress: $i,
          responseType: or,
          headers: sr,
          withCredentials: mi = 'same-origin',
          fetchOptions: Ho,
          maxContentLength: jt,
          maxBodyLength: yi,
        } = Ro(le);
        const Dn = S.isNumber(jt) && jt > -1,
          Gi = S.isNumber(yi) && yi > -1,
          Xd = (nt) => (S.hasOwnProp(le, nt) ? le[nt] : void 0);
        let Wo = B || fetch;
        or = or ? (or + '').toLowerCase() : 'text';
        let lr = Md([vt, ct && ct.toAbortSignal()], ir),
          yt = null;
        const vr =
          lr &&
          lr.unsubscribe &&
          (() => {
            lr.unsubscribe();
          });
        let xn,
          Nn = null;
        const Ko = () =>
          new ye(
            'Request body larger than maxBodyLength limit',
            ye.ERR_BAD_REQUEST,
            le,
            yt,
          );
        try {
          let nt;
          const At = Xd('auth');
          if (At) {
            const Fe = S.getSafeProp(At, 'username') || '',
              St = S.getSafeProp(At, 'password') || '';
            nt = { username: Fe, password: St };
          }
          if (Hd(Ue)) {
            const Fe = new URL(Ue, Qe.origin);
            if (!nt && (Fe.username || Fe.password)) {
              const St = Do(Fe.username),
                ur = Do(Fe.password);
              nt = { username: St, password: ur };
            }
            (Fe.username || Fe.password) &&
              ((Fe.username = ''), (Fe.password = ''), (Ue = Fe.href));
          }
          if (
            (nt &&
              (sr.delete('authorization'),
              sr.set(
                'Authorization',
                'Basic ' +
                  btoa(Zd((nt.username || '') + ':' + (nt.password || ''))),
              )),
            Dn &&
              typeof Ue == 'string' &&
              Ue.startsWith('data:') &&
              Fd(Ue) > jt)
          )
            throw new ye(
              'maxContentLength size of ' + jt + ' exceeded',
              ye.ERR_BAD_RESPONSE,
              le,
              yt,
            );
          if (Gi && Le !== 'get' && Le !== 'head') {
            const Fe = await rt(et);
            if (typeof Fe == 'number' && isFinite(Fe) && ((xn = Fe), Fe > yi))
              throw Ko();
          }
          const bi = Gi && (S.isReadableStream(et) || S.isStream(et)),
            $o = (Fe, St, ur) =>
              Mo(
                Fe,
                zo,
                (_r) => {
                  if (Gi && _r > yi) throw (Nn = Ko());
                  St && St(_r);
                },
                ur,
              );
          if (Ne && Le !== 'get' && Le !== 'head' && ($i || bi)) {
            if (((xn = xn ?? (await Te(sr, et))), xn !== 0 || bi)) {
              let Fe = new O(Ue, { method: 'POST', body: et, duplex: 'half' }),
                St;
              if (
                (S.isFormData(et) &&
                  (St = Fe.headers.get('content-type')) &&
                  sr.setContentType(St),
                Fe.body)
              ) {
                const [ur, _r] = ($i && Ao(xn, fi(xo($i)))) || [];
                et = $o(Fe.body, ur, _r);
              }
            }
          } else if (bi && !ee && oe && Le !== 'get' && Le !== 'head')
            et = $o(et);
          else if (bi && ee && !Ne && Le !== 'get' && Le !== 'head')
            throw new ye(
              'Stream request bodies are not supported by the current fetch implementation',
              ye.ERR_NOT_SUPPORT,
              le,
              yt,
            );
          S.isString(mi) || (mi = mi ? 'include' : 'omit');
          const ef = ee && 'credentials' in O.prototype;
          if (S.isFormData(et)) {
            const Fe = sr.getContentType();
            Fe &&
              /^multipart\/form-data/i.test(Fe) &&
              !/boundary=/i.test(Fe) &&
              sr.delete('content-type');
          }
          sr.set('User-Agent', 'axios/' + Li, !1);
          const Go = {
            ...Ho,
            signal: lr,
            method: Le.toUpperCase(),
            headers: ht(sr.normalize()),
            body: et,
            duplex: 'half',
            credentials: ef ? mi : void 0,
          };
          yt = ee && new O(Ue, Go);
          let Nt = await (ee ? Wo(yt, Ho) : Wo(Ue, Go));
          const Yo = gt.from(Nt.headers);
          if (Dn) {
            const Fe = S.toFiniteNumber(Yo.getContentLength());
            if (Fe != null && Fe > jt)
              throw new ye(
                'maxContentLength size of ' + jt + ' exceeded',
                ye.ERR_BAD_RESPONSE,
                le,
                yt,
              );
          }
          const Yi = Je && (or === 'stream' || or === 'response');
          if (Je && Nt.body && (Ki || Dn || (Yi && vr))) {
            const Fe = {};
            ['status', 'statusText', 'headers'].forEach((qn) => {
              Fe[qn] = Nt[qn];
            });
            const St = S.toFiniteNumber(Yo.getContentLength()),
              [ur, _r] = (Ki && Ao(St, fi(xo(Ki), !0))) || [];
            let Jo = 0;
            const tf = (qn) => {
              if (Dn && ((Jo = qn), Jo > jt))
                throw new ye(
                  'maxContentLength size of ' + jt + ' exceeded',
                  ye.ERR_BAD_RESPONSE,
                  le,
                  yt,
                );
              ur && ur(qn);
            };
            Nt = new z(
              Mo(Nt.body, zo, tf, () => {
                (_r && _r(), vr && vr());
              }),
              Fe,
            );
          }
          or = or || 'text';
          let qt = await Xe[S.findKey(Xe, or) || 'text'](Nt, le);
          if (Dn && !Je && !Yi) {
            let Fe;
            if (
              (qt != null &&
                (typeof qt.byteLength == 'number'
                  ? (Fe = qt.byteLength)
                  : typeof qt.size == 'number'
                    ? (Fe = qt.size)
                    : typeof qt == 'string' &&
                      (Fe =
                        typeof b == 'function'
                          ? new b().encode(qt).byteLength
                          : qt.length)),
              typeof Fe == 'number' && Fe > jt)
            )
              throw new ye(
                'maxContentLength size of ' + jt + ' exceeded',
                ye.ERR_BAD_RESPONSE,
                le,
                yt,
              );
          }
          return (
            !Yi && vr && vr(),
            await new Promise((Fe, St) => {
              Po(Fe, St, {
                data: qt,
                headers: gt.from(Nt.headers),
                status: Nt.status,
                statusText: Nt.statusText,
                config: le,
                request: yt,
              });
            })
          );
        } catch (nt) {
          if ((vr && vr(), lr && lr.aborted && lr.reason instanceof ye)) {
            const At = lr.reason;
            throw (
              (At.config = le),
              yt && (At.request = yt),
              nt !== At &&
                Object.defineProperty(At, 'cause', {
                  __proto__: null,
                  value: nt,
                  writable: !0,
                  enumerable: !1,
                  configurable: !0,
                }),
              At
            );
          }
          if (Nn) throw (yt && !Nn.request && (Nn.request = yt), Nn);
          if (nt instanceof ye)
            throw (yt && !nt.request && (nt.request = yt), nt);
          if (
            nt &&
            nt.name === 'TypeError' &&
            /Load failed|fetch/i.test(nt.message)
          ) {
            const At = new ye(
              'Network Error',
              ye.ERR_NETWORK,
              le,
              yt,
              nt && nt.response,
            );
            throw (
              Object.defineProperty(At, 'cause', {
                __proto__: null,
                value: nt.cause || nt,
                writable: !0,
                enumerable: !1,
                configurable: !0,
              }),
              At
            );
          }
          throw ye.from(nt, nt && nt.code, le, yt, nt && nt.response);
        }
      };
    },
    Kd = new Map(),
    qo = (c) => {
      let h = (c && c.env) || {};
      const { fetch: p, Request: b, Response: B } = h,
        O = [b, B, p];
      let z = O.length,
        H = z,
        ee,
        de,
        oe = Kd;
      for (; H--;)
        ((ee = O[H]),
          (de = oe.get(ee)),
          de === void 0 && oe.set(ee, (de = H ? new Map() : Wd(h))),
          (oe = de));
      return de;
    };
  qo();
  const Vi = { http: zi, xhr: Rd, fetch: { get: qo } };
  S.forEach(Vi, (c, h) => {
    if (c) {
      try {
        Object.defineProperty(c, 'name', { __proto__: null, value: h });
      } catch {}
      Object.defineProperty(c, 'adapterName', { __proto__: null, value: h });
    }
  });
  const Lo = (c) => `- ${c}`,
    $d = (c) => S.isFunction(c) || c === null || c === !1;
  function Gd(c, h) {
    c = S.isArray(c) ? c : [c];
    const { length: p } = c;
    let b, B;
    const O = {};
    for (let z = 0; z < p; z++) {
      b = c[z];
      let H;
      if (
        ((B = b),
        !$d(b) && ((B = Vi[(H = String(b)).toLowerCase()]), B === void 0))
      )
        throw new ye(`Unknown adapter '${H}'`);
      if (B && (S.isFunction(B) || (B = B.get(h)))) break;
      O[H || '#' + z] = B;
    }
    if (!B) {
      const z = Object.entries(O).map(
        ([ee, de]) =>
          `adapter ${ee} ` +
          (de === !1
            ? 'is not supported by the environment'
            : 'is not available in the build'),
      );
      let H = p
        ? z.length > 1
          ? `since :
` +
            z.map(Lo).join(`
`)
          : ' ' + Lo(z[0])
        : 'as no adapter specified';
      throw new ye(
        'There is no suitable adapter to dispatch the request ' + H,
        ye.ERR_NOT_SUPPORT,
      );
    }
    return B;
  }
  var Vo = { getAdapter: Gd, adapters: Vi };
  function Fi(c) {
    if (
      (c.cancelToken && c.cancelToken.throwIfRequested(),
      c.signal && c.signal.aborted)
    )
      throw new zn(null, c);
  }
  function Zi(c) {
    return (
      Fi(c),
      (c.headers = gt.from(c.headers)),
      (c.data = qi.call(c, c.transformRequest)),
      ['post', 'put', 'patch'].indexOf(c.method) !== -1 &&
        c.headers.setContentType('application/x-www-form-urlencoded', !1),
      Vo.getAdapter(
        c.adapter || jn.adapter,
        c,
      )(c).then(
        function (b) {
          (Fi(c), (c.response = b));
          try {
            b.data = qi.call(c, c.transformResponse, b);
          } finally {
            delete c.response;
          }
          return ((b.headers = gt.from(b.headers)), b);
        },
        function (b) {
          if (!Bo(b) && (Fi(c), b && b.response)) {
            c.response = b.response;
            try {
              b.response.data = qi.call(c, c.transformResponse, b.response);
            } finally {
              delete c.response;
            }
            b.response.headers = gt.from(b.response.headers);
          }
          return Promise.reject(b);
        },
      )
    );
  }
  const gi = {};
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(
    (c, h) => {
      gi[c] = function (b) {
        return typeof b === c || 'a' + (h < 1 ? 'n ' : ' ') + c;
      };
    },
  );
  const Fo = {};
  ((gi.transitional = function (h, p, b) {
    function B(O, z) {
      return (
        '[Axios v' +
        Li +
        "] Transitional option '" +
        O +
        "'" +
        z +
        (b ? '. ' + b : '')
      );
    }
    return (O, z, H) => {
      if (h === !1)
        throw new ye(
          B(z, ' has been removed' + (p ? ' in ' + p : '')),
          ye.ERR_DEPRECATED,
        );
      return (
        p &&
          !Fo[z] &&
          ((Fo[z] = !0),
          console.warn(
            B(
              z,
              ' has been deprecated since v' +
                p +
                ' and will be removed in the near future',
            ),
          )),
        h ? h(O, z, H) : !0
      );
    };
  }),
    (gi.spelling = function (h) {
      return (p, b) => (
        console.warn(`${b} is likely a misspelling of ${h}`),
        !0
      );
    }));
  function Yd(c, h, p) {
    if (typeof c != 'object' || c === null)
      throw new ye('options must be an object', ye.ERR_BAD_OPTION_VALUE);
    const b = Object.keys(c);
    let B = b.length;
    for (; B-- > 0;) {
      const O = b[B],
        z = Object.prototype.hasOwnProperty.call(h, O) ? h[O] : void 0;
      if (z) {
        const H = c[O],
          ee = H === void 0 || z(H, O, c);
        if (ee !== !0)
          throw new ye(
            'option ' + O + ' must be ' + ee,
            ye.ERR_BAD_OPTION_VALUE,
          );
        continue;
      }
      if (p !== !0) throw new ye('Unknown option ' + O, ye.ERR_BAD_OPTION);
    }
  }
  var pi = { assertOptions: Yd, validators: gi };
  const wt = pi.validators;
  class wr {
    constructor(h) {
      ((this.defaults = h || {}),
        (this.interceptors = { request: new ci(), response: new ci() }));
    }
    async request(h, p) {
      try {
        return await this._request(h, p);
      } catch (b) {
        if (b instanceof Error) {
          let B = {};
          Error.captureStackTrace
            ? Error.captureStackTrace(B)
            : (B = new Error());
          const O = (() => {
            if (!B.stack) return '';
            const z = B.stack.indexOf(`
`);
            return z === -1 ? '' : B.stack.slice(z + 1);
          })();
          try {
            if (!b.stack) b.stack = O;
            else if (O) {
              const z = O.indexOf(`
`),
                H =
                  z === -1
                    ? -1
                    : O.indexOf(
                        `
`,
                        z + 1,
                      ),
                ee = H === -1 ? '' : O.slice(H + 1);
              String(b.stack).endsWith(ee) ||
                (b.stack +=
                  `
` + O);
            }
          } catch {}
        }
        throw b;
      }
    }
    _request(h, p) {
      (typeof h == 'string' ? ((p = p || {}), (p.url = h)) : (p = h || {}),
        (p = br(this.defaults, p)));
      const { transitional: b, paramsSerializer: B, headers: O } = p;
      (b !== void 0 &&
        pi.assertOptions(
          b,
          {
            silentJSONParsing: wt.transitional(wt.boolean),
            forcedJSONParsing: wt.transitional(wt.boolean),
            clarifyTimeoutError: wt.transitional(wt.boolean),
            legacyInterceptorReqResOrdering: wt.transitional(wt.boolean),
            advertiseZstdAcceptEncoding: wt.transitional(wt.boolean),
            validateStatusUndefinedResolves: wt.transitional(wt.boolean),
          },
          !1,
        ),
        B != null &&
          (S.isFunction(B)
            ? (p.paramsSerializer = { serialize: B })
            : pi.assertOptions(
                B,
                { encode: wt.function, serialize: wt.function },
                !0,
              )),
        p.allowAbsoluteUrls !== void 0 ||
          (this.defaults.allowAbsoluteUrls !== void 0
            ? (p.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls)
            : (p.allowAbsoluteUrls = !0)),
        pi.assertOptions(
          p,
          {
            baseUrl: wt.spelling('baseURL'),
            withXsrfToken: wt.spelling('withXSRFToken'),
          },
          !0,
        ),
        (p.method = (p.method || this.defaults.method || 'get').toLowerCase()));
      let z = O && S.merge(O.common, O[p.method]);
      (O &&
        S.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'query', 'common'],
          (Xe) => {
            delete O[Xe];
          },
        ),
        (p.headers = gt.concat(z, O)));
      const H = [];
      let ee = !0;
      this.interceptors.request.forEach(function (rt) {
        if (typeof rt.runWhen == 'function' && rt.runWhen(p) === !1) return;
        ee = ee && rt.synchronous;
        const Te = p.transitional || A;
        Te && Te.legacyInterceptorReqResOrdering
          ? H.unshift(rt.fulfilled, rt.rejected)
          : H.push(rt.fulfilled, rt.rejected);
      });
      const de = [];
      this.interceptors.response.forEach(function (rt) {
        de.push(rt.fulfilled, rt.rejected);
      });
      let oe,
        he = 0,
        Ne;
      if (!ee) {
        const Xe = [Zi.bind(this), void 0];
        for (
          Xe.unshift(...H),
            Xe.push(...de),
            Ne = Xe.length,
            oe = Promise.resolve(p);
          he < Ne;
        )
          oe = oe.then(Xe[he++], Xe[he++]);
        return oe;
      }
      Ne = H.length;
      let Je = p;
      for (; he < Ne;) {
        const Xe = H[he++],
          rt = H[he++];
        try {
          Je = Xe ? Xe(Je) : Je;
        } catch (Te) {
          if (!rt) {
            oe = Promise.reject(Te);
            break;
          }
          try {
            const le = rt.call(this, Te);
            S.isThenable(le) &&
              (oe = Promise.resolve(le).then(() => Zi.call(this, Je)));
          } catch (le) {
            oe = Promise.reject(le);
          }
          break;
        }
      }
      if (!oe)
        try {
          oe = Zi.call(this, Je);
        } catch (Xe) {
          oe = Promise.reject(Xe);
        }
      for (he = 0, Ne = de.length; he < Ne;) oe = oe.then(de[he++], de[he++]);
      return oe;
    }
    getUri(h) {
      h = br(this.defaults, h);
      const p = Eo(h.baseURL, h.url, h.allowAbsoluteUrls, h);
      return ui(p, h.params, h.paramsSerializer);
    }
  }
  (S.forEach(['delete', 'get', 'head', 'options'], function (h) {
    wr.prototype[h] = function (p, b) {
      return this.request(
        br(b || {}, {
          method: h,
          url: p,
          data: b && S.hasOwnProp(b, 'data') ? b.data : void 0,
        }),
      );
    };
  }),
    S.forEach(['post', 'put', 'patch', 'query'], function (h) {
      function p(b) {
        return function (O, z, H) {
          return this.request(
            br(H || {}, {
              method: h,
              headers: b ? { 'Content-Type': 'multipart/form-data' } : {},
              url: O,
              data: z,
            }),
          );
        };
      }
      ((wr.prototype[h] = p()),
        h !== 'query' && (wr.prototype[h + 'Form'] = p(!0)));
    }));
  class Hi {
    constructor(h) {
      if (typeof h != 'function')
        throw new TypeError('executor must be a function.');
      let p;
      this.promise = new Promise(function (O) {
        p = O;
      });
      const b = this;
      (this.promise.then((B) => {
        if (!b._listeners) return;
        let O = b._listeners.length;
        for (; O-- > 0;) b._listeners[O](B);
        b._listeners = null;
      }),
        (this.promise.then = (B) => {
          let O;
          const z = new Promise((H) => {
            (b.subscribe(H), (O = H));
          }).then(B);
          return (
            (z.cancel = function () {
              b.unsubscribe(O);
            }),
            z
          );
        }),
        h(function (O, z, H) {
          b.reason || ((b.reason = new zn(O, z, H)), p(b.reason));
        }));
    }
    throwIfRequested() {
      if (this.reason) throw this.reason;
    }
    subscribe(h) {
      if (this.reason) {
        h(this.reason);
        return;
      }
      this._listeners ? this._listeners.push(h) : (this._listeners = [h]);
    }
    unsubscribe(h) {
      if (!this._listeners) return;
      const p = this._listeners.indexOf(h);
      p !== -1 && this._listeners.splice(p, 1);
    }
    toAbortSignal() {
      const h = new AbortController(),
        p = (b) => {
          h.abort(b);
        };
      return (
        this.subscribe(p),
        (h.signal.unsubscribe = () => this.unsubscribe(p)),
        h.signal
      );
    }
    static source() {
      let h;
      return {
        token: new Hi(function (B) {
          h = B;
        }),
        cancel: h,
      };
    }
  }
  function Jd(c) {
    return function (p) {
      return c.apply(null, p);
    };
  }
  function Qd(c) {
    return S.isObject(c) && c.isAxiosError === !0;
  }
  const Wi = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerReturnsAnUnknownError: 520,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526,
  };
  Object.entries(Wi).forEach(([c, h]) => {
    Wi[h] = c;
  });
  function Zo(c) {
    const h = new wr(c),
      p = t(wr.prototype.request, h);
    return (
      S.extend(p, wr.prototype, h, { allOwnKeys: !0 }),
      S.extend(p, h, null, { allOwnKeys: !0 }),
      (p.create = function (B) {
        return Zo(br(c, B));
      }),
      p
    );
  }
  const ft = Zo(jn);
  return (
    (ft.Axios = wr),
    (ft.CanceledError = zn),
    (ft.CancelToken = Hi),
    (ft.isCancel = Bo),
    (ft.VERSION = Li),
    (ft.toFormData = Bn),
    (ft.AxiosError = ye),
    (ft.Cancel = ft.CanceledError),
    (ft.all = function (h) {
      return Promise.all(h);
    }),
    (ft.spread = Jd),
    (ft.isAxiosError = Qd),
    (ft.mergeConfig = br),
    (ft.AxiosHeaders = gt),
    (ft.formToJSON = (c) => So(S.isHTMLForm(c) ? new FormData(c) : c)),
    (ft.getAdapter = Vo.getAdapter),
    (ft.HttpStatusCode = Wi),
    (ft.default = ft),
    (no = ft),
    no
  );
}
var Ot = {},
  dn = {},
  Xt = {},
  wi = {},
  er = {},
  ao = {},
  nu;
function xi() {
  return (
    nu ||
      ((nu = 1),
      (function (t) {
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.getParsedType = t.ZodParsedType = t.objectUtil = t.util = void 0));
        var d;
        (function (e) {
          e.assertEqual = (s) => {};
          function r(s) {}
          e.assertIs = r;
          function n(s) {
            throw new Error();
          }
          ((e.assertNever = n),
            (e.arrayToEnum = (s) => {
              const f = {};
              for (const o of s) f[o] = o;
              return f;
            }),
            (e.getValidEnumValues = (s) => {
              const f = e
                  .objectKeys(s)
                  .filter((y) => typeof s[s[y]] != 'number'),
                o = {};
              for (const y of f) o[y] = s[y];
              return e.objectValues(o);
            }),
            (e.objectValues = (s) =>
              e.objectKeys(s).map(function (f) {
                return s[f];
              })),
            (e.objectKeys =
              typeof Object.keys == 'function'
                ? (s) => Object.keys(s)
                : (s) => {
                    const f = [];
                    for (const o in s)
                      Object.prototype.hasOwnProperty.call(s, o) && f.push(o);
                    return f;
                  }),
            (e.find = (s, f) => {
              for (const o of s) if (f(o)) return o;
            }),
            (e.isInteger =
              typeof Number.isInteger == 'function'
                ? (s) => Number.isInteger(s)
                : (s) =>
                    typeof s == 'number' &&
                    Number.isFinite(s) &&
                    Math.floor(s) === s));
          function i(s, f = ' | ') {
            return s.map((o) => (typeof o == 'string' ? `'${o}'` : o)).join(f);
          }
          ((e.joinValues = i),
            (e.jsonStringifyReplacer = (s, f) =>
              typeof f == 'bigint' ? f.toString() : f));
        })(d || (t.util = d = {}));
        var u;
        ((function (e) {
          e.mergeShapes = (r, n) => ({ ...r, ...n });
        })(u || (t.objectUtil = u = {})),
          (t.ZodParsedType = d.arrayToEnum([
            'string',
            'nan',
            'number',
            'integer',
            'float',
            'boolean',
            'date',
            'bigint',
            'symbol',
            'function',
            'undefined',
            'null',
            'array',
            'object',
            'unknown',
            'promise',
            'void',
            'never',
            'map',
            'set',
          ])));
        const a = (e) => {
          switch (typeof e) {
            case 'undefined':
              return t.ZodParsedType.undefined;
            case 'string':
              return t.ZodParsedType.string;
            case 'number':
              return Number.isNaN(e)
                ? t.ZodParsedType.nan
                : t.ZodParsedType.number;
            case 'boolean':
              return t.ZodParsedType.boolean;
            case 'function':
              return t.ZodParsedType.function;
            case 'bigint':
              return t.ZodParsedType.bigint;
            case 'symbol':
              return t.ZodParsedType.symbol;
            case 'object':
              return Array.isArray(e)
                ? t.ZodParsedType.array
                : e === null
                  ? t.ZodParsedType.null
                  : e.then &&
                      typeof e.then == 'function' &&
                      e.catch &&
                      typeof e.catch == 'function'
                    ? t.ZodParsedType.promise
                    : typeof Map < 'u' && e instanceof Map
                      ? t.ZodParsedType.map
                      : typeof Set < 'u' && e instanceof Set
                        ? t.ZodParsedType.set
                        : typeof Date < 'u' && e instanceof Date
                          ? t.ZodParsedType.date
                          : t.ZodParsedType.object;
            default:
              return t.ZodParsedType.unknown;
          }
        };
        t.getParsedType = a;
      })(ao)),
    ao
  );
}
var au;
function _o() {
  if (au) return er;
  ((au = 1),
    Object.defineProperty(er, '__esModule', { value: !0 }),
    (er.ZodError = er.quotelessJson = er.ZodIssueCode = void 0));
  const t = xi();
  er.ZodIssueCode = t.util.arrayToEnum([
    'invalid_type',
    'invalid_literal',
    'custom',
    'invalid_union',
    'invalid_union_discriminator',
    'invalid_enum_value',
    'unrecognized_keys',
    'invalid_arguments',
    'invalid_return_type',
    'invalid_date',
    'invalid_string',
    'too_small',
    'too_big',
    'invalid_intersection_types',
    'not_multiple_of',
    'not_finite',
  ]);
  const d = (a) => JSON.stringify(a, null, 2).replace(/"([^"]+)":/g, '$1:');
  er.quotelessJson = d;
  let u = class Kc extends Error {
    get errors() {
      return this.issues;
    }
    constructor(e) {
      (super(),
        (this.issues = []),
        (this.addIssue = (n) => {
          this.issues = [...this.issues, n];
        }),
        (this.addIssues = (n = []) => {
          this.issues = [...this.issues, ...n];
        }));
      const r = new.target.prototype;
      (Object.setPrototypeOf
        ? Object.setPrototypeOf(this, r)
        : (this.__proto__ = r),
        (this.name = 'ZodError'),
        (this.issues = e));
    }
    format(e) {
      const r =
          e ||
          function (s) {
            return s.message;
          },
        n = { _errors: [] },
        i = (s) => {
          for (const f of s.issues)
            if (f.code === 'invalid_union') f.unionErrors.map(i);
            else if (f.code === 'invalid_return_type') i(f.returnTypeError);
            else if (f.code === 'invalid_arguments') i(f.argumentsError);
            else if (f.path.length === 0) n._errors.push(r(f));
            else {
              let o = n,
                y = 0;
              for (; y < f.path.length;) {
                const v = f.path[y];
                (y === f.path.length - 1
                  ? ((o[v] = o[v] || { _errors: [] }), o[v]._errors.push(r(f)))
                  : (o[v] = o[v] || { _errors: [] }),
                  (o = o[v]),
                  y++);
              }
            }
        };
      return (i(this), n);
    }
    static assert(e) {
      if (!(e instanceof Kc)) throw new Error(`Not a ZodError: ${e}`);
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, t.util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(e = (r) => r.message) {
      const r = {},
        n = [];
      for (const i of this.issues)
        if (i.path.length > 0) {
          const s = i.path[0];
          ((r[s] = r[s] || []), r[s].push(e(i)));
        } else n.push(e(i));
      return { formErrors: n, fieldErrors: r };
    }
    get formErrors() {
      return this.flatten();
    }
  };
  return ((er.ZodError = u), (u.create = (a) => new u(a)), er);
}
var iu;
function $c() {
  if (iu) return wi;
  ((iu = 1), Object.defineProperty(wi, '__esModule', { value: !0 }));
  const t = _o(),
    d = xi(),
    u = (a, e) => {
      let r;
      switch (a.code) {
        case t.ZodIssueCode.invalid_type:
          a.received === d.ZodParsedType.undefined
            ? (r = 'Required')
            : (r = `Expected ${a.expected}, received ${a.received}`);
          break;
        case t.ZodIssueCode.invalid_literal:
          r = `Invalid literal value, expected ${JSON.stringify(a.expected, d.util.jsonStringifyReplacer)}`;
          break;
        case t.ZodIssueCode.unrecognized_keys:
          r = `Unrecognized key(s) in object: ${d.util.joinValues(a.keys, ', ')}`;
          break;
        case t.ZodIssueCode.invalid_union:
          r = 'Invalid input';
          break;
        case t.ZodIssueCode.invalid_union_discriminator:
          r = `Invalid discriminator value. Expected ${d.util.joinValues(a.options)}`;
          break;
        case t.ZodIssueCode.invalid_enum_value:
          r = `Invalid enum value. Expected ${d.util.joinValues(a.options)}, received '${a.received}'`;
          break;
        case t.ZodIssueCode.invalid_arguments:
          r = 'Invalid function arguments';
          break;
        case t.ZodIssueCode.invalid_return_type:
          r = 'Invalid function return type';
          break;
        case t.ZodIssueCode.invalid_date:
          r = 'Invalid date';
          break;
        case t.ZodIssueCode.invalid_string:
          typeof a.validation == 'object'
            ? 'includes' in a.validation
              ? ((r = `Invalid input: must include "${a.validation.includes}"`),
                typeof a.validation.position == 'number' &&
                  (r = `${r} at one or more positions greater than or equal to ${a.validation.position}`))
              : 'startsWith' in a.validation
                ? (r = `Invalid input: must start with "${a.validation.startsWith}"`)
                : 'endsWith' in a.validation
                  ? (r = `Invalid input: must end with "${a.validation.endsWith}"`)
                  : d.util.assertNever(a.validation)
            : a.validation !== 'regex'
              ? (r = `Invalid ${a.validation}`)
              : (r = 'Invalid');
          break;
        case t.ZodIssueCode.too_small:
          a.type === 'array'
            ? (r = `Array must contain ${a.exact ? 'exactly' : a.inclusive ? 'at least' : 'more than'} ${a.minimum} element(s)`)
            : a.type === 'string'
              ? (r = `String must contain ${a.exact ? 'exactly' : a.inclusive ? 'at least' : 'over'} ${a.minimum} character(s)`)
              : a.type === 'number'
                ? (r = `Number must be ${a.exact ? 'exactly equal to ' : a.inclusive ? 'greater than or equal to ' : 'greater than '}${a.minimum}`)
                : a.type === 'bigint'
                  ? (r = `Number must be ${a.exact ? 'exactly equal to ' : a.inclusive ? 'greater than or equal to ' : 'greater than '}${a.minimum}`)
                  : a.type === 'date'
                    ? (r = `Date must be ${a.exact ? 'exactly equal to ' : a.inclusive ? 'greater than or equal to ' : 'greater than '}${new Date(Number(a.minimum))}`)
                    : (r = 'Invalid input');
          break;
        case t.ZodIssueCode.too_big:
          a.type === 'array'
            ? (r = `Array must contain ${a.exact ? 'exactly' : a.inclusive ? 'at most' : 'less than'} ${a.maximum} element(s)`)
            : a.type === 'string'
              ? (r = `String must contain ${a.exact ? 'exactly' : a.inclusive ? 'at most' : 'under'} ${a.maximum} character(s)`)
              : a.type === 'number'
                ? (r = `Number must be ${a.exact ? 'exactly' : a.inclusive ? 'less than or equal to' : 'less than'} ${a.maximum}`)
                : a.type === 'bigint'
                  ? (r = `BigInt must be ${a.exact ? 'exactly' : a.inclusive ? 'less than or equal to' : 'less than'} ${a.maximum}`)
                  : a.type === 'date'
                    ? (r = `Date must be ${a.exact ? 'exactly' : a.inclusive ? 'smaller than or equal to' : 'smaller than'} ${new Date(Number(a.maximum))}`)
                    : (r = 'Invalid input');
          break;
        case t.ZodIssueCode.custom:
          r = 'Invalid input';
          break;
        case t.ZodIssueCode.invalid_intersection_types:
          r = 'Intersection results could not be merged';
          break;
        case t.ZodIssueCode.not_multiple_of:
          r = `Number must be a multiple of ${a.multipleOf}`;
          break;
        case t.ZodIssueCode.not_finite:
          r = 'Number must be finite';
          break;
        default:
          ((r = e.defaultError), d.util.assertNever(a));
      }
      return { message: r };
    };
  return ((wi.default = u), wi);
}
var ou;
function ko() {
  if (ou) return Xt;
  ou = 1;
  var t =
    (Xt && Xt.__importDefault) ||
    function (r) {
      return r && r.__esModule ? r : { default: r };
    };
  (Object.defineProperty(Xt, '__esModule', { value: !0 }),
    (Xt.defaultErrorMap = void 0),
    (Xt.setErrorMap = a),
    (Xt.getErrorMap = e));
  const d = t($c());
  Xt.defaultErrorMap = d.default;
  let u = d.default;
  function a(r) {
    u = r;
  }
  function e() {
    return u;
  }
  return Xt;
}
var Ta = {},
  su;
function Gc() {
  return (
    su ||
      ((su = 1),
      (function (t) {
        var d =
          (Ta && Ta.__importDefault) ||
          function (w) {
            return w && w.__esModule ? w : { default: w };
          };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.isAsync =
            t.isValid =
            t.isDirty =
            t.isAborted =
            t.OK =
            t.DIRTY =
            t.INVALID =
            t.ParseStatus =
            t.EMPTY_PATH =
            t.makeIssue =
              void 0),
          (t.addIssueToContext = r));
        const u = ko(),
          a = d($c()),
          e = (w) => {
            const { data: R, path: C, errorMaps: P, issueData: E } = w,
              N = [...C, ...(E.path || [])],
              D = { ...E, path: N };
            if (E.message !== void 0)
              return { ...E, path: N, message: E.message };
            let G = '';
            const te = P.filter((W) => !!W)
              .slice()
              .reverse();
            for (const W of te) G = W(D, { data: R, defaultError: G }).message;
            return { ...E, path: N, message: G };
          };
        ((t.makeIssue = e), (t.EMPTY_PATH = []));
        function r(w, R) {
          const C = (0, u.getErrorMap)(),
            P = (0, t.makeIssue)({
              issueData: R,
              data: w.data,
              path: w.path,
              errorMaps: [
                w.common.contextualErrorMap,
                w.schemaErrorMap,
                C,
                C === a.default ? void 0 : a.default,
              ].filter((E) => !!E),
            });
          w.common.issues.push(P);
        }
        class n {
          constructor() {
            this.value = 'valid';
          }
          dirty() {
            this.value === 'valid' && (this.value = 'dirty');
          }
          abort() {
            this.value !== 'aborted' && (this.value = 'aborted');
          }
          static mergeArray(R, C) {
            const P = [];
            for (const E of C) {
              if (E.status === 'aborted') return t.INVALID;
              (E.status === 'dirty' && R.dirty(), P.push(E.value));
            }
            return { status: R.value, value: P };
          }
          static async mergeObjectAsync(R, C) {
            const P = [];
            for (const E of C) {
              const N = await E.key,
                D = await E.value;
              P.push({ key: N, value: D });
            }
            return n.mergeObjectSync(R, P);
          }
          static mergeObjectSync(R, C) {
            const P = {};
            for (const E of C) {
              const { key: N, value: D } = E;
              if (N.status === 'aborted' || D.status === 'aborted')
                return t.INVALID;
              (N.status === 'dirty' && R.dirty(),
                D.status === 'dirty' && R.dirty(),
                N.value !== '__proto__' &&
                  (typeof D.value < 'u' || E.alwaysSet) &&
                  (P[N.value] = D.value));
            }
            return { status: R.value, value: P };
          }
        }
        ((t.ParseStatus = n),
          (t.INVALID = Object.freeze({ status: 'aborted' })));
        const i = (w) => ({ status: 'dirty', value: w });
        t.DIRTY = i;
        const s = (w) => ({ status: 'valid', value: w });
        t.OK = s;
        const f = (w) => w.status === 'aborted';
        t.isAborted = f;
        const o = (w) => w.status === 'dirty';
        t.isDirty = o;
        const y = (w) => w.status === 'valid';
        t.isValid = y;
        const v = (w) => typeof Promise < 'u' && w instanceof Promise;
        t.isAsync = v;
      })(Ta)),
    Ta
  );
}
var io = {},
  lu;
function Kf() {
  return (
    lu || ((lu = 1), Object.defineProperty(io, '__esModule', { value: !0 })),
    io
  );
}
var Z = {},
  Ra = {},
  uu;
function $f() {
  if (uu) return Ra;
  ((uu = 1),
    Object.defineProperty(Ra, '__esModule', { value: !0 }),
    (Ra.errorUtil = void 0));
  var t;
  return (
    (function (d) {
      ((d.errToObj = (u) => (typeof u == 'string' ? { message: u } : u || {})),
        (d.toString = (u) =>
          typeof u == 'string' ? u : u == null ? void 0 : u.message));
    })(t || (Ra.errorUtil = t = {})),
    Ra
  );
}
var cu;
function Gf() {
  if (cu) return Z;
  ((cu = 1),
    Object.defineProperty(Z, '__esModule', { value: !0 }),
    (Z.discriminatedUnion =
      Z.date =
      Z.boolean =
      Z.bigint =
      Z.array =
      Z.any =
      Z.coerce =
      Z.ZodFirstPartyTypeKind =
      Z.late =
      Z.ZodSchema =
      Z.Schema =
      Z.ZodReadonly =
      Z.ZodPipeline =
      Z.ZodBranded =
      Z.BRAND =
      Z.ZodNaN =
      Z.ZodCatch =
      Z.ZodDefault =
      Z.ZodNullable =
      Z.ZodOptional =
      Z.ZodTransformer =
      Z.ZodEffects =
      Z.ZodPromise =
      Z.ZodNativeEnum =
      Z.ZodEnum =
      Z.ZodLiteral =
      Z.ZodLazy =
      Z.ZodFunction =
      Z.ZodSet =
      Z.ZodMap =
      Z.ZodRecord =
      Z.ZodTuple =
      Z.ZodIntersection =
      Z.ZodDiscriminatedUnion =
      Z.ZodUnion =
      Z.ZodObject =
      Z.ZodArray =
      Z.ZodVoid =
      Z.ZodNever =
      Z.ZodUnknown =
      Z.ZodAny =
      Z.ZodNull =
      Z.ZodUndefined =
      Z.ZodSymbol =
      Z.ZodDate =
      Z.ZodBoolean =
      Z.ZodBigInt =
      Z.ZodNumber =
      Z.ZodString =
      Z.ZodType =
        void 0),
    (Z.NEVER =
      Z.void =
      Z.unknown =
      Z.union =
      Z.undefined =
      Z.tuple =
      Z.transformer =
      Z.symbol =
      Z.string =
      Z.strictObject =
      Z.set =
      Z.record =
      Z.promise =
      Z.preprocess =
      Z.pipeline =
      Z.ostring =
      Z.optional =
      Z.onumber =
      Z.oboolean =
      Z.object =
      Z.number =
      Z.nullable =
      Z.null =
      Z.never =
      Z.nativeEnum =
      Z.nan =
      Z.map =
      Z.literal =
      Z.lazy =
      Z.intersection =
      Z.instanceof =
      Z.function =
      Z.enum =
      Z.effect =
        void 0),
    (Z.datetimeRegex = $),
    (Z.custom = se));
  const t = _o(),
    d = ko(),
    u = $f(),
    a = Gc(),
    e = xi();
  class r {
    constructor(l, m, _, I) {
      ((this._cachedPath = []),
        (this.parent = l),
        (this.data = m),
        (this._path = _),
        (this._key = I));
    }
    get path() {
      return (
        this._cachedPath.length ||
          (Array.isArray(this._key)
            ? this._cachedPath.push(...this._path, ...this._key)
            : this._cachedPath.push(...this._path, this._key)),
        this._cachedPath
      );
    }
  }
  const n = (A, l) => {
    if ((0, a.isValid)(l)) return { success: !0, data: l.value };
    if (!A.common.issues.length)
      throw new Error('Validation failed but no issues detected.');
    return {
      success: !1,
      get error() {
        if (this._error) return this._error;
        const m = new t.ZodError(A.common.issues);
        return ((this._error = m), this._error);
      },
    };
  };
  function i(A) {
    if (!A) return {};
    const {
      errorMap: l,
      invalid_type_error: m,
      required_error: _,
      description: I,
    } = A;
    if (l && (m || _))
      throw new Error(
        `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
      );
    return l
      ? { errorMap: l, description: I }
      : {
          errorMap: (ae, X) => {
            const { message: Ae } = A;
            return ae.code === 'invalid_enum_value'
              ? { message: Ae ?? X.defaultError }
              : typeof X.data > 'u'
                ? { message: Ae ?? _ ?? X.defaultError }
                : ae.code !== 'invalid_type'
                  ? { message: X.defaultError }
                  : { message: Ae ?? m ?? X.defaultError };
          },
          description: I,
        };
  }
  class s {
    get description() {
      return this._def.description;
    }
    _getType(l) {
      return (0, e.getParsedType)(l.data);
    }
    _getOrReturnCtx(l, m) {
      return (
        m || {
          common: l.parent.common,
          data: l.data,
          parsedType: (0, e.getParsedType)(l.data),
          schemaErrorMap: this._def.errorMap,
          path: l.path,
          parent: l.parent,
        }
      );
    }
    _processInputParams(l) {
      return {
        status: new a.ParseStatus(),
        ctx: {
          common: l.parent.common,
          data: l.data,
          parsedType: (0, e.getParsedType)(l.data),
          schemaErrorMap: this._def.errorMap,
          path: l.path,
          parent: l.parent,
        },
      };
    }
    _parseSync(l) {
      const m = this._parse(l);
      if ((0, a.isAsync)(m))
        throw new Error('Synchronous parse encountered promise.');
      return m;
    }
    _parseAsync(l) {
      const m = this._parse(l);
      return Promise.resolve(m);
    }
    parse(l, m) {
      const _ = this.safeParse(l, m);
      if (_.success) return _.data;
      throw _.error;
    }
    safeParse(l, m) {
      const _ = {
          common: {
            issues: [],
            async: (m == null ? void 0 : m.async) ?? !1,
            contextualErrorMap: m == null ? void 0 : m.errorMap,
          },
          path: (m == null ? void 0 : m.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data: l,
          parsedType: (0, e.getParsedType)(l),
        },
        I = this._parseSync({ data: l, path: _.path, parent: _ });
      return n(_, I);
    }
    '~validate'(l) {
      var _, I;
      const m = {
        common: { issues: [], async: !!this['~standard'].async },
        path: [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: l,
        parsedType: (0, e.getParsedType)(l),
      };
      if (!this['~standard'].async)
        try {
          const T = this._parseSync({ data: l, path: [], parent: m });
          return (0, a.isValid)(T)
            ? { value: T.value }
            : { issues: m.common.issues };
        } catch (T) {
          ((I =
            (_ = T == null ? void 0 : T.message) == null
              ? void 0
              : _.toLowerCase()) != null &&
            I.includes('encountered') &&
            (this['~standard'].async = !0),
            (m.common = { issues: [], async: !0 }));
        }
      return this._parseAsync({ data: l, path: [], parent: m }).then((T) =>
        (0, a.isValid)(T) ? { value: T.value } : { issues: m.common.issues },
      );
    }
    async parseAsync(l, m) {
      const _ = await this.safeParseAsync(l, m);
      if (_.success) return _.data;
      throw _.error;
    }
    async safeParseAsync(l, m) {
      const _ = {
          common: {
            issues: [],
            contextualErrorMap: m == null ? void 0 : m.errorMap,
            async: !0,
          },
          path: (m == null ? void 0 : m.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data: l,
          parsedType: (0, e.getParsedType)(l),
        },
        I = this._parse({ data: l, path: _.path, parent: _ }),
        T = await ((0, a.isAsync)(I) ? I : Promise.resolve(I));
      return n(_, T);
    }
    refine(l, m) {
      const _ = (I) =>
        typeof m == 'string' || typeof m > 'u'
          ? { message: m }
          : typeof m == 'function'
            ? m(I)
            : m;
      return this._refinement((I, T) => {
        const ae = l(I),
          X = () => T.addIssue({ code: t.ZodIssueCode.custom, ..._(I) });
        return typeof Promise < 'u' && ae instanceof Promise
          ? ae.then((Ae) => (Ae ? !0 : (X(), !1)))
          : ae
            ? !0
            : (X(), !1);
      });
    }
    refinement(l, m) {
      return this._refinement((_, I) =>
        l(_) ? !0 : (I.addIssue(typeof m == 'function' ? m(_, I) : m), !1),
      );
    }
    _refinement(l) {
      return new V({
        schema: this,
        typeName: fe.ZodEffects,
        effect: { type: 'refinement', refinement: l },
      });
    }
    superRefine(l) {
      return this._refinement(l);
    }
    constructor(l) {
      ((this.spa = this.safeParseAsync),
        (this._def = l),
        (this.parse = this.parse.bind(this)),
        (this.safeParse = this.safeParse.bind(this)),
        (this.parseAsync = this.parseAsync.bind(this)),
        (this.safeParseAsync = this.safeParseAsync.bind(this)),
        (this.spa = this.spa.bind(this)),
        (this.refine = this.refine.bind(this)),
        (this.refinement = this.refinement.bind(this)),
        (this.superRefine = this.superRefine.bind(this)),
        (this.optional = this.optional.bind(this)),
        (this.nullable = this.nullable.bind(this)),
        (this.nullish = this.nullish.bind(this)),
        (this.array = this.array.bind(this)),
        (this.promise = this.promise.bind(this)),
        (this.or = this.or.bind(this)),
        (this.and = this.and.bind(this)),
        (this.transform = this.transform.bind(this)),
        (this.brand = this.brand.bind(this)),
        (this.default = this.default.bind(this)),
        (this.catch = this.catch.bind(this)),
        (this.describe = this.describe.bind(this)),
        (this.pipe = this.pipe.bind(this)),
        (this.readonly = this.readonly.bind(this)),
        (this.isNullable = this.isNullable.bind(this)),
        (this.isOptional = this.isOptional.bind(this)),
        (this['~standard'] = {
          version: 1,
          vendor: 'zod',
          validate: (m) => this['~validate'](m),
        }));
    }
    optional() {
      return x.create(this, this._def);
    }
    nullable() {
      return J.create(this, this._def);
    }
    nullish() {
      return this.nullable().optional();
    }
    array() {
      return g.create(this);
    }
    promise() {
      return j.create(this, this._def);
    }
    or(l) {
      return be.create([this, l], this._def);
    }
    and(l) {
      return je.create(this, l, this._def);
    }
    transform(l) {
      return new V({
        ...i(this._def),
        schema: this,
        typeName: fe.ZodEffects,
        effect: { type: 'transform', transform: l },
      });
    }
    default(l) {
      const m = typeof l == 'function' ? l : () => l;
      return new Q({
        ...i(this._def),
        innerType: this,
        defaultValue: m,
        typeName: fe.ZodDefault,
      });
    }
    brand() {
      return new Pe({ typeName: fe.ZodBranded, type: this, ...i(this._def) });
    }
    catch(l) {
      const m = typeof l == 'function' ? l : () => l;
      return new re({
        ...i(this._def),
        innerType: this,
        catchValue: m,
        typeName: fe.ZodCatch,
      });
    }
    describe(l) {
      const m = this.constructor;
      return new m({ ...this._def, description: l });
    }
    pipe(l) {
      return S.create(this, l);
    }
    readonly() {
      return me.create(this);
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  }
  ((Z.ZodType = s), (Z.Schema = s), (Z.ZodSchema = s));
  const f = /^c[^\s-]{8,}$/i,
    o = /^[0-9a-z]+$/,
    y = /^[0-9A-HJKMNP-TV-Z]{26}$/i,
    v =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,
    w = /^[a-z0-9_-]{21}$/i,
    R = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
    C =
      /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
    P =
      /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
    E = '^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$';
  let N;
  const D =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    G =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    te =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
    W =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    F = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    K =
      /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    Y =
      '((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))',
    ue = new RegExp(`^${Y}$`);
  function we(A) {
    let l = '[0-5]\\d';
    A.precision
      ? (l = `${l}\\.\\d{${A.precision}}`)
      : A.precision == null && (l = `${l}(\\.\\d+)?`);
    const m = A.precision ? '+' : '?';
    return `([01]\\d|2[0-3]):[0-5]\\d(:${l})${m}`;
  }
  function Ce(A) {
    return new RegExp(`^${we(A)}$`);
  }
  function $(A) {
    let l = `${Y}T${we(A)}`;
    const m = [];
    return (
      m.push(A.local ? 'Z?' : 'Z'),
      A.offset && m.push('([+-]\\d{2}:?\\d{2})'),
      (l = `${l}(${m.join('|')})`),
      new RegExp(`^${l}$`)
    );
  }
  function q(A, l) {
    return !!(
      ((l === 'v4' || !l) && D.test(A)) ||
      ((l === 'v6' || !l) && te.test(A))
    );
  }
  function ie(A, l) {
    if (!R.test(A)) return !1;
    try {
      const [m] = A.split('.');
      if (!m) return !1;
      const _ = m
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(m.length + ((4 - (m.length % 4)) % 4), '='),
        I = JSON.parse(atob(_));
      return !(
        typeof I != 'object' ||
        I === null ||
        ('typ' in I && (I == null ? void 0 : I.typ) !== 'JWT') ||
        !I.alg ||
        (l && I.alg !== l)
      );
    } catch {
      return !1;
    }
  }
  function Se(A, l) {
    return !!(
      ((l === 'v4' || !l) && G.test(A)) ||
      ((l === 'v6' || !l) && W.test(A))
    );
  }
  class Ee extends s {
    _parse(l) {
      if (
        (this._def.coerce && (l.data = String(l.data)),
        this._getType(l) !== e.ZodParsedType.string)
      ) {
        const T = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(T, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.string,
            received: T.parsedType,
          }),
          a.INVALID
        );
      }
      const _ = new a.ParseStatus();
      let I;
      for (const T of this._def.checks)
        if (T.kind === 'min')
          l.data.length < T.value &&
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              code: t.ZodIssueCode.too_small,
              minimum: T.value,
              type: 'string',
              inclusive: !0,
              exact: !1,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'max')
          l.data.length > T.value &&
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              code: t.ZodIssueCode.too_big,
              maximum: T.value,
              type: 'string',
              inclusive: !0,
              exact: !1,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'length') {
          const ae = l.data.length > T.value,
            X = l.data.length < T.value;
          (ae || X) &&
            ((I = this._getOrReturnCtx(l, I)),
            ae
              ? (0, a.addIssueToContext)(I, {
                  code: t.ZodIssueCode.too_big,
                  maximum: T.value,
                  type: 'string',
                  inclusive: !0,
                  exact: !0,
                  message: T.message,
                })
              : X &&
                (0, a.addIssueToContext)(I, {
                  code: t.ZodIssueCode.too_small,
                  minimum: T.value,
                  type: 'string',
                  inclusive: !0,
                  exact: !0,
                  message: T.message,
                }),
            _.dirty());
        } else if (T.kind === 'email')
          P.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'email',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'emoji')
          (N || (N = new RegExp(E, 'u')),
            N.test(l.data) ||
              ((I = this._getOrReturnCtx(l, I)),
              (0, a.addIssueToContext)(I, {
                validation: 'emoji',
                code: t.ZodIssueCode.invalid_string,
                message: T.message,
              }),
              _.dirty()));
        else if (T.kind === 'uuid')
          v.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'uuid',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'nanoid')
          w.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'nanoid',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'cuid')
          f.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'cuid',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'cuid2')
          o.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'cuid2',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'ulid')
          y.test(l.data) ||
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              validation: 'ulid',
              code: t.ZodIssueCode.invalid_string,
              message: T.message,
            }),
            _.dirty());
        else if (T.kind === 'url')
          try {
            new URL(l.data);
          } catch {
            ((I = this._getOrReturnCtx(l, I)),
              (0, a.addIssueToContext)(I, {
                validation: 'url',
                code: t.ZodIssueCode.invalid_string,
                message: T.message,
              }),
              _.dirty());
          }
        else
          T.kind === 'regex'
            ? ((T.regex.lastIndex = 0),
              T.regex.test(l.data) ||
                ((I = this._getOrReturnCtx(l, I)),
                (0, a.addIssueToContext)(I, {
                  validation: 'regex',
                  code: t.ZodIssueCode.invalid_string,
                  message: T.message,
                }),
                _.dirty()))
            : T.kind === 'trim'
              ? (l.data = l.data.trim())
              : T.kind === 'includes'
                ? l.data.includes(T.value, T.position) ||
                  ((I = this._getOrReturnCtx(l, I)),
                  (0, a.addIssueToContext)(I, {
                    code: t.ZodIssueCode.invalid_string,
                    validation: { includes: T.value, position: T.position },
                    message: T.message,
                  }),
                  _.dirty())
                : T.kind === 'toLowerCase'
                  ? (l.data = l.data.toLowerCase())
                  : T.kind === 'toUpperCase'
                    ? (l.data = l.data.toUpperCase())
                    : T.kind === 'startsWith'
                      ? l.data.startsWith(T.value) ||
                        ((I = this._getOrReturnCtx(l, I)),
                        (0, a.addIssueToContext)(I, {
                          code: t.ZodIssueCode.invalid_string,
                          validation: { startsWith: T.value },
                          message: T.message,
                        }),
                        _.dirty())
                      : T.kind === 'endsWith'
                        ? l.data.endsWith(T.value) ||
                          ((I = this._getOrReturnCtx(l, I)),
                          (0, a.addIssueToContext)(I, {
                            code: t.ZodIssueCode.invalid_string,
                            validation: { endsWith: T.value },
                            message: T.message,
                          }),
                          _.dirty())
                        : T.kind === 'datetime'
                          ? $(T).test(l.data) ||
                            ((I = this._getOrReturnCtx(l, I)),
                            (0, a.addIssueToContext)(I, {
                              code: t.ZodIssueCode.invalid_string,
                              validation: 'datetime',
                              message: T.message,
                            }),
                            _.dirty())
                          : T.kind === 'date'
                            ? ue.test(l.data) ||
                              ((I = this._getOrReturnCtx(l, I)),
                              (0, a.addIssueToContext)(I, {
                                code: t.ZodIssueCode.invalid_string,
                                validation: 'date',
                                message: T.message,
                              }),
                              _.dirty())
                            : T.kind === 'time'
                              ? Ce(T).test(l.data) ||
                                ((I = this._getOrReturnCtx(l, I)),
                                (0, a.addIssueToContext)(I, {
                                  code: t.ZodIssueCode.invalid_string,
                                  validation: 'time',
                                  message: T.message,
                                }),
                                _.dirty())
                              : T.kind === 'duration'
                                ? C.test(l.data) ||
                                  ((I = this._getOrReturnCtx(l, I)),
                                  (0, a.addIssueToContext)(I, {
                                    validation: 'duration',
                                    code: t.ZodIssueCode.invalid_string,
                                    message: T.message,
                                  }),
                                  _.dirty())
                                : T.kind === 'ip'
                                  ? q(l.data, T.version) ||
                                    ((I = this._getOrReturnCtx(l, I)),
                                    (0, a.addIssueToContext)(I, {
                                      validation: 'ip',
                                      code: t.ZodIssueCode.invalid_string,
                                      message: T.message,
                                    }),
                                    _.dirty())
                                  : T.kind === 'jwt'
                                    ? ie(l.data, T.alg) ||
                                      ((I = this._getOrReturnCtx(l, I)),
                                      (0, a.addIssueToContext)(I, {
                                        validation: 'jwt',
                                        code: t.ZodIssueCode.invalid_string,
                                        message: T.message,
                                      }),
                                      _.dirty())
                                    : T.kind === 'cidr'
                                      ? Se(l.data, T.version) ||
                                        ((I = this._getOrReturnCtx(l, I)),
                                        (0, a.addIssueToContext)(I, {
                                          validation: 'cidr',
                                          code: t.ZodIssueCode.invalid_string,
                                          message: T.message,
                                        }),
                                        _.dirty())
                                      : T.kind === 'base64'
                                        ? F.test(l.data) ||
                                          ((I = this._getOrReturnCtx(l, I)),
                                          (0, a.addIssueToContext)(I, {
                                            validation: 'base64',
                                            code: t.ZodIssueCode.invalid_string,
                                            message: T.message,
                                          }),
                                          _.dirty())
                                        : T.kind === 'base64url'
                                          ? K.test(l.data) ||
                                            ((I = this._getOrReturnCtx(l, I)),
                                            (0, a.addIssueToContext)(I, {
                                              validation: 'base64url',
                                              code: t.ZodIssueCode
                                                .invalid_string,
                                              message: T.message,
                                            }),
                                            _.dirty())
                                          : e.util.assertNever(T);
      return { status: _.value, value: l.data };
    }
    _regex(l, m, _) {
      return this.refinement((I) => l.test(I), {
        validation: m,
        code: t.ZodIssueCode.invalid_string,
        ...u.errorUtil.errToObj(_),
      });
    }
    _addCheck(l) {
      return new Ee({ ...this._def, checks: [...this._def.checks, l] });
    }
    email(l) {
      return this._addCheck({ kind: 'email', ...u.errorUtil.errToObj(l) });
    }
    url(l) {
      return this._addCheck({ kind: 'url', ...u.errorUtil.errToObj(l) });
    }
    emoji(l) {
      return this._addCheck({ kind: 'emoji', ...u.errorUtil.errToObj(l) });
    }
    uuid(l) {
      return this._addCheck({ kind: 'uuid', ...u.errorUtil.errToObj(l) });
    }
    nanoid(l) {
      return this._addCheck({ kind: 'nanoid', ...u.errorUtil.errToObj(l) });
    }
    cuid(l) {
      return this._addCheck({ kind: 'cuid', ...u.errorUtil.errToObj(l) });
    }
    cuid2(l) {
      return this._addCheck({ kind: 'cuid2', ...u.errorUtil.errToObj(l) });
    }
    ulid(l) {
      return this._addCheck({ kind: 'ulid', ...u.errorUtil.errToObj(l) });
    }
    base64(l) {
      return this._addCheck({ kind: 'base64', ...u.errorUtil.errToObj(l) });
    }
    base64url(l) {
      return this._addCheck({ kind: 'base64url', ...u.errorUtil.errToObj(l) });
    }
    jwt(l) {
      return this._addCheck({ kind: 'jwt', ...u.errorUtil.errToObj(l) });
    }
    ip(l) {
      return this._addCheck({ kind: 'ip', ...u.errorUtil.errToObj(l) });
    }
    cidr(l) {
      return this._addCheck({ kind: 'cidr', ...u.errorUtil.errToObj(l) });
    }
    datetime(l) {
      return typeof l == 'string'
        ? this._addCheck({
            kind: 'datetime',
            precision: null,
            offset: !1,
            local: !1,
            message: l,
          })
        : this._addCheck({
            kind: 'datetime',
            precision:
              typeof (l == null ? void 0 : l.precision) > 'u'
                ? null
                : l == null
                  ? void 0
                  : l.precision,
            offset: (l == null ? void 0 : l.offset) ?? !1,
            local: (l == null ? void 0 : l.local) ?? !1,
            ...u.errorUtil.errToObj(l == null ? void 0 : l.message),
          });
    }
    date(l) {
      return this._addCheck({ kind: 'date', message: l });
    }
    time(l) {
      return typeof l == 'string'
        ? this._addCheck({ kind: 'time', precision: null, message: l })
        : this._addCheck({
            kind: 'time',
            precision:
              typeof (l == null ? void 0 : l.precision) > 'u'
                ? null
                : l == null
                  ? void 0
                  : l.precision,
            ...u.errorUtil.errToObj(l == null ? void 0 : l.message),
          });
    }
    duration(l) {
      return this._addCheck({ kind: 'duration', ...u.errorUtil.errToObj(l) });
    }
    regex(l, m) {
      return this._addCheck({
        kind: 'regex',
        regex: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    includes(l, m) {
      return this._addCheck({
        kind: 'includes',
        value: l,
        position: m == null ? void 0 : m.position,
        ...u.errorUtil.errToObj(m == null ? void 0 : m.message),
      });
    }
    startsWith(l, m) {
      return this._addCheck({
        kind: 'startsWith',
        value: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    endsWith(l, m) {
      return this._addCheck({
        kind: 'endsWith',
        value: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    min(l, m) {
      return this._addCheck({
        kind: 'min',
        value: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    max(l, m) {
      return this._addCheck({
        kind: 'max',
        value: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    length(l, m) {
      return this._addCheck({
        kind: 'length',
        value: l,
        ...u.errorUtil.errToObj(m),
      });
    }
    nonempty(l) {
      return this.min(1, u.errorUtil.errToObj(l));
    }
    trim() {
      return new Ee({
        ...this._def,
        checks: [...this._def.checks, { kind: 'trim' }],
      });
    }
    toLowerCase() {
      return new Ee({
        ...this._def,
        checks: [...this._def.checks, { kind: 'toLowerCase' }],
      });
    }
    toUpperCase() {
      return new Ee({
        ...this._def,
        checks: [...this._def.checks, { kind: 'toUpperCase' }],
      });
    }
    get isDatetime() {
      return !!this._def.checks.find((l) => l.kind === 'datetime');
    }
    get isDate() {
      return !!this._def.checks.find((l) => l.kind === 'date');
    }
    get isTime() {
      return !!this._def.checks.find((l) => l.kind === 'time');
    }
    get isDuration() {
      return !!this._def.checks.find((l) => l.kind === 'duration');
    }
    get isEmail() {
      return !!this._def.checks.find((l) => l.kind === 'email');
    }
    get isURL() {
      return !!this._def.checks.find((l) => l.kind === 'url');
    }
    get isEmoji() {
      return !!this._def.checks.find((l) => l.kind === 'emoji');
    }
    get isUUID() {
      return !!this._def.checks.find((l) => l.kind === 'uuid');
    }
    get isNANOID() {
      return !!this._def.checks.find((l) => l.kind === 'nanoid');
    }
    get isCUID() {
      return !!this._def.checks.find((l) => l.kind === 'cuid');
    }
    get isCUID2() {
      return !!this._def.checks.find((l) => l.kind === 'cuid2');
    }
    get isULID() {
      return !!this._def.checks.find((l) => l.kind === 'ulid');
    }
    get isIP() {
      return !!this._def.checks.find((l) => l.kind === 'ip');
    }
    get isCIDR() {
      return !!this._def.checks.find((l) => l.kind === 'cidr');
    }
    get isBase64() {
      return !!this._def.checks.find((l) => l.kind === 'base64');
    }
    get isBase64url() {
      return !!this._def.checks.find((l) => l.kind === 'base64url');
    }
    get minLength() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'min' && (l === null || m.value > l) && (l = m.value);
      return l;
    }
    get maxLength() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'max' && (l === null || m.value < l) && (l = m.value);
      return l;
    }
  }
  ((Z.ZodString = Ee),
    (Ee.create = (A) =>
      new Ee({
        checks: [],
        typeName: fe.ZodString,
        coerce: (A == null ? void 0 : A.coerce) ?? !1,
        ...i(A),
      })));
  function He(A, l) {
    const m = (A.toString().split('.')[1] || '').length,
      _ = (l.toString().split('.')[1] || '').length,
      I = m > _ ? m : _,
      T = Number.parseInt(A.toFixed(I).replace('.', '')),
      ae = Number.parseInt(l.toFixed(I).replace('.', ''));
    return (T % ae) / 10 ** I;
  }
  class L extends s {
    constructor() {
      (super(...arguments),
        (this.min = this.gte),
        (this.max = this.lte),
        (this.step = this.multipleOf));
    }
    _parse(l) {
      if (
        (this._def.coerce && (l.data = Number(l.data)),
        this._getType(l) !== e.ZodParsedType.number)
      ) {
        const T = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(T, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.number,
            received: T.parsedType,
          }),
          a.INVALID
        );
      }
      let _;
      const I = new a.ParseStatus();
      for (const T of this._def.checks)
        T.kind === 'int'
          ? e.util.isInteger(l.data) ||
            ((_ = this._getOrReturnCtx(l, _)),
            (0, a.addIssueToContext)(_, {
              code: t.ZodIssueCode.invalid_type,
              expected: 'integer',
              received: 'float',
              message: T.message,
            }),
            I.dirty())
          : T.kind === 'min'
            ? (T.inclusive ? l.data < T.value : l.data <= T.value) &&
              ((_ = this._getOrReturnCtx(l, _)),
              (0, a.addIssueToContext)(_, {
                code: t.ZodIssueCode.too_small,
                minimum: T.value,
                type: 'number',
                inclusive: T.inclusive,
                exact: !1,
                message: T.message,
              }),
              I.dirty())
            : T.kind === 'max'
              ? (T.inclusive ? l.data > T.value : l.data >= T.value) &&
                ((_ = this._getOrReturnCtx(l, _)),
                (0, a.addIssueToContext)(_, {
                  code: t.ZodIssueCode.too_big,
                  maximum: T.value,
                  type: 'number',
                  inclusive: T.inclusive,
                  exact: !1,
                  message: T.message,
                }),
                I.dirty())
              : T.kind === 'multipleOf'
                ? He(l.data, T.value) !== 0 &&
                  ((_ = this._getOrReturnCtx(l, _)),
                  (0, a.addIssueToContext)(_, {
                    code: t.ZodIssueCode.not_multiple_of,
                    multipleOf: T.value,
                    message: T.message,
                  }),
                  I.dirty())
                : T.kind === 'finite'
                  ? Number.isFinite(l.data) ||
                    ((_ = this._getOrReturnCtx(l, _)),
                    (0, a.addIssueToContext)(_, {
                      code: t.ZodIssueCode.not_finite,
                      message: T.message,
                    }),
                    I.dirty())
                  : e.util.assertNever(T);
      return { status: I.value, value: l.data };
    }
    gte(l, m) {
      return this.setLimit('min', l, !0, u.errorUtil.toString(m));
    }
    gt(l, m) {
      return this.setLimit('min', l, !1, u.errorUtil.toString(m));
    }
    lte(l, m) {
      return this.setLimit('max', l, !0, u.errorUtil.toString(m));
    }
    lt(l, m) {
      return this.setLimit('max', l, !1, u.errorUtil.toString(m));
    }
    setLimit(l, m, _, I) {
      return new L({
        ...this._def,
        checks: [
          ...this._def.checks,
          { kind: l, value: m, inclusive: _, message: u.errorUtil.toString(I) },
        ],
      });
    }
    _addCheck(l) {
      return new L({ ...this._def, checks: [...this._def.checks, l] });
    }
    int(l) {
      return this._addCheck({ kind: 'int', message: u.errorUtil.toString(l) });
    }
    positive(l) {
      return this._addCheck({
        kind: 'min',
        value: 0,
        inclusive: !1,
        message: u.errorUtil.toString(l),
      });
    }
    negative(l) {
      return this._addCheck({
        kind: 'max',
        value: 0,
        inclusive: !1,
        message: u.errorUtil.toString(l),
      });
    }
    nonpositive(l) {
      return this._addCheck({
        kind: 'max',
        value: 0,
        inclusive: !0,
        message: u.errorUtil.toString(l),
      });
    }
    nonnegative(l) {
      return this._addCheck({
        kind: 'min',
        value: 0,
        inclusive: !0,
        message: u.errorUtil.toString(l),
      });
    }
    multipleOf(l, m) {
      return this._addCheck({
        kind: 'multipleOf',
        value: l,
        message: u.errorUtil.toString(m),
      });
    }
    finite(l) {
      return this._addCheck({
        kind: 'finite',
        message: u.errorUtil.toString(l),
      });
    }
    safe(l) {
      return this._addCheck({
        kind: 'min',
        inclusive: !0,
        value: Number.MIN_SAFE_INTEGER,
        message: u.errorUtil.toString(l),
      })._addCheck({
        kind: 'max',
        inclusive: !0,
        value: Number.MAX_SAFE_INTEGER,
        message: u.errorUtil.toString(l),
      });
    }
    get minValue() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'min' && (l === null || m.value > l) && (l = m.value);
      return l;
    }
    get maxValue() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'max' && (l === null || m.value < l) && (l = m.value);
      return l;
    }
    get isInt() {
      return !!this._def.checks.find(
        (l) =>
          l.kind === 'int' ||
          (l.kind === 'multipleOf' && e.util.isInteger(l.value)),
      );
    }
    get isFinite() {
      let l = null,
        m = null;
      for (const _ of this._def.checks) {
        if (_.kind === 'finite' || _.kind === 'int' || _.kind === 'multipleOf')
          return !0;
        _.kind === 'min'
          ? (m === null || _.value > m) && (m = _.value)
          : _.kind === 'max' && (l === null || _.value < l) && (l = _.value);
      }
      return Number.isFinite(m) && Number.isFinite(l);
    }
  }
  ((Z.ZodNumber = L),
    (L.create = (A) =>
      new L({
        checks: [],
        typeName: fe.ZodNumber,
        coerce: (A == null ? void 0 : A.coerce) || !1,
        ...i(A),
      })));
  class Be extends s {
    constructor() {
      (super(...arguments), (this.min = this.gte), (this.max = this.lte));
    }
    _parse(l) {
      if (this._def.coerce)
        try {
          l.data = BigInt(l.data);
        } catch {
          return this._getInvalidInput(l);
        }
      if (this._getType(l) !== e.ZodParsedType.bigint)
        return this._getInvalidInput(l);
      let _;
      const I = new a.ParseStatus();
      for (const T of this._def.checks)
        T.kind === 'min'
          ? (T.inclusive ? l.data < T.value : l.data <= T.value) &&
            ((_ = this._getOrReturnCtx(l, _)),
            (0, a.addIssueToContext)(_, {
              code: t.ZodIssueCode.too_small,
              type: 'bigint',
              minimum: T.value,
              inclusive: T.inclusive,
              message: T.message,
            }),
            I.dirty())
          : T.kind === 'max'
            ? (T.inclusive ? l.data > T.value : l.data >= T.value) &&
              ((_ = this._getOrReturnCtx(l, _)),
              (0, a.addIssueToContext)(_, {
                code: t.ZodIssueCode.too_big,
                type: 'bigint',
                maximum: T.value,
                inclusive: T.inclusive,
                message: T.message,
              }),
              I.dirty())
            : T.kind === 'multipleOf'
              ? l.data % T.value !== BigInt(0) &&
                ((_ = this._getOrReturnCtx(l, _)),
                (0, a.addIssueToContext)(_, {
                  code: t.ZodIssueCode.not_multiple_of,
                  multipleOf: T.value,
                  message: T.message,
                }),
                I.dirty())
              : e.util.assertNever(T);
      return { status: I.value, value: l.data };
    }
    _getInvalidInput(l) {
      const m = this._getOrReturnCtx(l);
      return (
        (0, a.addIssueToContext)(m, {
          code: t.ZodIssueCode.invalid_type,
          expected: e.ZodParsedType.bigint,
          received: m.parsedType,
        }),
        a.INVALID
      );
    }
    gte(l, m) {
      return this.setLimit('min', l, !0, u.errorUtil.toString(m));
    }
    gt(l, m) {
      return this.setLimit('min', l, !1, u.errorUtil.toString(m));
    }
    lte(l, m) {
      return this.setLimit('max', l, !0, u.errorUtil.toString(m));
    }
    lt(l, m) {
      return this.setLimit('max', l, !1, u.errorUtil.toString(m));
    }
    setLimit(l, m, _, I) {
      return new Be({
        ...this._def,
        checks: [
          ...this._def.checks,
          { kind: l, value: m, inclusive: _, message: u.errorUtil.toString(I) },
        ],
      });
    }
    _addCheck(l) {
      return new Be({ ...this._def, checks: [...this._def.checks, l] });
    }
    positive(l) {
      return this._addCheck({
        kind: 'min',
        value: BigInt(0),
        inclusive: !1,
        message: u.errorUtil.toString(l),
      });
    }
    negative(l) {
      return this._addCheck({
        kind: 'max',
        value: BigInt(0),
        inclusive: !1,
        message: u.errorUtil.toString(l),
      });
    }
    nonpositive(l) {
      return this._addCheck({
        kind: 'max',
        value: BigInt(0),
        inclusive: !0,
        message: u.errorUtil.toString(l),
      });
    }
    nonnegative(l) {
      return this._addCheck({
        kind: 'min',
        value: BigInt(0),
        inclusive: !0,
        message: u.errorUtil.toString(l),
      });
    }
    multipleOf(l, m) {
      return this._addCheck({
        kind: 'multipleOf',
        value: l,
        message: u.errorUtil.toString(m),
      });
    }
    get minValue() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'min' && (l === null || m.value > l) && (l = m.value);
      return l;
    }
    get maxValue() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'max' && (l === null || m.value < l) && (l = m.value);
      return l;
    }
  }
  ((Z.ZodBigInt = Be),
    (Be.create = (A) =>
      new Be({
        checks: [],
        typeName: fe.ZodBigInt,
        coerce: (A == null ? void 0 : A.coerce) ?? !1,
        ...i(A),
      })));
  class ge extends s {
    _parse(l) {
      if (
        (this._def.coerce && (l.data = !!l.data),
        this._getType(l) !== e.ZodParsedType.boolean)
      ) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.boolean,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodBoolean = ge),
    (ge.create = (A) =>
      new ge({
        typeName: fe.ZodBoolean,
        coerce: (A == null ? void 0 : A.coerce) || !1,
        ...i(A),
      })));
  class ve extends s {
    _parse(l) {
      if (
        (this._def.coerce && (l.data = new Date(l.data)),
        this._getType(l) !== e.ZodParsedType.date)
      ) {
        const T = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(T, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.date,
            received: T.parsedType,
          }),
          a.INVALID
        );
      }
      if (Number.isNaN(l.data.getTime())) {
        const T = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(T, { code: t.ZodIssueCode.invalid_date }),
          a.INVALID
        );
      }
      const _ = new a.ParseStatus();
      let I;
      for (const T of this._def.checks)
        T.kind === 'min'
          ? l.data.getTime() < T.value &&
            ((I = this._getOrReturnCtx(l, I)),
            (0, a.addIssueToContext)(I, {
              code: t.ZodIssueCode.too_small,
              message: T.message,
              inclusive: !0,
              exact: !1,
              minimum: T.value,
              type: 'date',
            }),
            _.dirty())
          : T.kind === 'max'
            ? l.data.getTime() > T.value &&
              ((I = this._getOrReturnCtx(l, I)),
              (0, a.addIssueToContext)(I, {
                code: t.ZodIssueCode.too_big,
                message: T.message,
                inclusive: !0,
                exact: !1,
                maximum: T.value,
                type: 'date',
              }),
              _.dirty())
            : e.util.assertNever(T);
      return { status: _.value, value: new Date(l.data.getTime()) };
    }
    _addCheck(l) {
      return new ve({ ...this._def, checks: [...this._def.checks, l] });
    }
    min(l, m) {
      return this._addCheck({
        kind: 'min',
        value: l.getTime(),
        message: u.errorUtil.toString(m),
      });
    }
    max(l, m) {
      return this._addCheck({
        kind: 'max',
        value: l.getTime(),
        message: u.errorUtil.toString(m),
      });
    }
    get minDate() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'min' && (l === null || m.value > l) && (l = m.value);
      return l != null ? new Date(l) : null;
    }
    get maxDate() {
      let l = null;
      for (const m of this._def.checks)
        m.kind === 'max' && (l === null || m.value < l) && (l = m.value);
      return l != null ? new Date(l) : null;
    }
  }
  ((Z.ZodDate = ve),
    (ve.create = (A) =>
      new ve({
        checks: [],
        coerce: (A == null ? void 0 : A.coerce) || !1,
        typeName: fe.ZodDate,
        ...i(A),
      })));
  class xe extends s {
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.symbol) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.symbol,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodSymbol = xe),
    (xe.create = (A) => new xe({ typeName: fe.ZodSymbol, ...i(A) })));
  class Re extends s {
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.undefined) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.undefined,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodUndefined = Re),
    (Re.create = (A) => new Re({ typeName: fe.ZodUndefined, ...i(A) })));
  class _e extends s {
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.null) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.null,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodNull = _e),
    (_e.create = (A) => new _e({ typeName: fe.ZodNull, ...i(A) })));
  class Oe extends s {
    constructor() {
      (super(...arguments), (this._any = !0));
    }
    _parse(l) {
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodAny = Oe),
    (Oe.create = (A) => new Oe({ typeName: fe.ZodAny, ...i(A) })));
  class De extends s {
    constructor() {
      (super(...arguments), (this._unknown = !0));
    }
    _parse(l) {
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodUnknown = De),
    (De.create = (A) => new De({ typeName: fe.ZodUnknown, ...i(A) })));
  class Ze extends s {
    _parse(l) {
      const m = this._getOrReturnCtx(l);
      return (
        (0, a.addIssueToContext)(m, {
          code: t.ZodIssueCode.invalid_type,
          expected: e.ZodParsedType.never,
          received: m.parsedType,
        }),
        a.INVALID
      );
    }
  }
  ((Z.ZodNever = Ze),
    (Ze.create = (A) => new Ze({ typeName: fe.ZodNever, ...i(A) })));
  class Ke extends s {
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.undefined) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.void,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
  }
  ((Z.ZodVoid = Ke),
    (Ke.create = (A) => new Ke({ typeName: fe.ZodVoid, ...i(A) })));
  class g extends s {
    _parse(l) {
      const { ctx: m, status: _ } = this._processInputParams(l),
        I = this._def;
      if (m.parsedType !== e.ZodParsedType.array)
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.array,
            received: m.parsedType,
          }),
          a.INVALID
        );
      if (I.exactLength !== null) {
        const ae = m.data.length > I.exactLength.value,
          X = m.data.length < I.exactLength.value;
        (ae || X) &&
          ((0, a.addIssueToContext)(m, {
            code: ae ? t.ZodIssueCode.too_big : t.ZodIssueCode.too_small,
            minimum: X ? I.exactLength.value : void 0,
            maximum: ae ? I.exactLength.value : void 0,
            type: 'array',
            inclusive: !0,
            exact: !0,
            message: I.exactLength.message,
          }),
          _.dirty());
      }
      if (
        (I.minLength !== null &&
          m.data.length < I.minLength.value &&
          ((0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.too_small,
            minimum: I.minLength.value,
            type: 'array',
            inclusive: !0,
            exact: !1,
            message: I.minLength.message,
          }),
          _.dirty()),
        I.maxLength !== null &&
          m.data.length > I.maxLength.value &&
          ((0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.too_big,
            maximum: I.maxLength.value,
            type: 'array',
            inclusive: !0,
            exact: !1,
            message: I.maxLength.message,
          }),
          _.dirty()),
        m.common.async)
      )
        return Promise.all(
          [...m.data].map((ae, X) =>
            I.type._parseAsync(new r(m, ae, m.path, X)),
          ),
        ).then((ae) => a.ParseStatus.mergeArray(_, ae));
      const T = [...m.data].map((ae, X) =>
        I.type._parseSync(new r(m, ae, m.path, X)),
      );
      return a.ParseStatus.mergeArray(_, T);
    }
    get element() {
      return this._def.type;
    }
    min(l, m) {
      return new g({
        ...this._def,
        minLength: { value: l, message: u.errorUtil.toString(m) },
      });
    }
    max(l, m) {
      return new g({
        ...this._def,
        maxLength: { value: l, message: u.errorUtil.toString(m) },
      });
    }
    length(l, m) {
      return new g({
        ...this._def,
        exactLength: { value: l, message: u.errorUtil.toString(m) },
      });
    }
    nonempty(l) {
      return this.min(1, l);
    }
  }
  ((Z.ZodArray = g),
    (g.create = (A, l) =>
      new g({
        type: A,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: fe.ZodArray,
        ...i(l),
      })));
  function pe(A) {
    if (A instanceof ne) {
      const l = {};
      for (const m in A.shape) {
        const _ = A.shape[m];
        l[m] = x.create(pe(_));
      }
      return new ne({ ...A._def, shape: () => l });
    } else
      return A instanceof g
        ? new g({ ...A._def, type: pe(A.element) })
        : A instanceof x
          ? x.create(pe(A.unwrap()))
          : A instanceof J
            ? J.create(pe(A.unwrap()))
            : A instanceof Ve
              ? Ve.create(A.items.map((l) => pe(l)))
              : A;
  }
  class ne extends s {
    constructor() {
      (super(...arguments),
        (this._cached = null),
        (this.nonstrict = this.passthrough),
        (this.augment = this.extend));
    }
    _getCached() {
      if (this._cached !== null) return this._cached;
      const l = this._def.shape(),
        m = e.util.objectKeys(l);
      return ((this._cached = { shape: l, keys: m }), this._cached);
    }
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.object) {
        const Ie = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(Ie, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.object,
            received: Ie.parsedType,
          }),
          a.INVALID
        );
      }
      const { status: _, ctx: I } = this._processInputParams(l),
        { shape: T, keys: ae } = this._getCached(),
        X = [];
      if (!(
        this._def.catchall instanceof Ze && this._def.unknownKeys === 'strip'
      ))
        for (const Ie in I.data) ae.includes(Ie) || X.push(Ie);
      const Ae = [];
      for (const Ie of ae) {
        const Ge = T[Ie],
          Qe = I.data[Ie];
        Ae.push({
          key: { status: 'valid', value: Ie },
          value: Ge._parse(new r(I, Qe, I.path, Ie)),
          alwaysSet: Ie in I.data,
        });
      }
      if (this._def.catchall instanceof Ze) {
        const Ie = this._def.unknownKeys;
        if (Ie === 'passthrough')
          for (const Ge of X)
            Ae.push({
              key: { status: 'valid', value: Ge },
              value: { status: 'valid', value: I.data[Ge] },
            });
        else if (Ie === 'strict')
          X.length > 0 &&
            ((0, a.addIssueToContext)(I, {
              code: t.ZodIssueCode.unrecognized_keys,
              keys: X,
            }),
            _.dirty());
        else if (Ie !== 'strip')
          throw new Error(
            'Internal ZodObject error: invalid unknownKeys value.',
          );
      } else {
        const Ie = this._def.catchall;
        for (const Ge of X) {
          const Qe = I.data[Ge];
          Ae.push({
            key: { status: 'valid', value: Ge },
            value: Ie._parse(new r(I, Qe, I.path, Ge)),
            alwaysSet: Ge in I.data,
          });
        }
      }
      return I.common.async
        ? Promise.resolve()
            .then(async () => {
              const Ie = [];
              for (const Ge of Ae) {
                const Qe = await Ge.key,
                  di = await Ge.value;
                Ie.push({ key: Qe, value: di, alwaysSet: Ge.alwaysSet });
              }
              return Ie;
            })
            .then((Ie) => a.ParseStatus.mergeObjectSync(_, Ie))
        : a.ParseStatus.mergeObjectSync(_, Ae);
    }
    get shape() {
      return this._def.shape();
    }
    strict(l) {
      return (
        u.errorUtil.errToObj,
        new ne({
          ...this._def,
          unknownKeys: 'strict',
          ...(l !== void 0
            ? {
                errorMap: (m, _) => {
                  var T, ae;
                  const I =
                    ((ae = (T = this._def).errorMap) == null
                      ? void 0
                      : ae.call(T, m, _).message) ?? _.defaultError;
                  return m.code === 'unrecognized_keys'
                    ? { message: u.errorUtil.errToObj(l).message ?? I }
                    : { message: I };
                },
              }
            : {}),
        })
      );
    }
    strip() {
      return new ne({ ...this._def, unknownKeys: 'strip' });
    }
    passthrough() {
      return new ne({ ...this._def, unknownKeys: 'passthrough' });
    }
    extend(l) {
      return new ne({
        ...this._def,
        shape: () => ({ ...this._def.shape(), ...l }),
      });
    }
    merge(l) {
      return new ne({
        unknownKeys: l._def.unknownKeys,
        catchall: l._def.catchall,
        shape: () => ({ ...this._def.shape(), ...l._def.shape() }),
        typeName: fe.ZodObject,
      });
    }
    setKey(l, m) {
      return this.augment({ [l]: m });
    }
    catchall(l) {
      return new ne({ ...this._def, catchall: l });
    }
    pick(l) {
      const m = {};
      for (const _ of e.util.objectKeys(l))
        l[_] && this.shape[_] && (m[_] = this.shape[_]);
      return new ne({ ...this._def, shape: () => m });
    }
    omit(l) {
      const m = {};
      for (const _ of e.util.objectKeys(this.shape))
        l[_] || (m[_] = this.shape[_]);
      return new ne({ ...this._def, shape: () => m });
    }
    deepPartial() {
      return pe(this);
    }
    partial(l) {
      const m = {};
      for (const _ of e.util.objectKeys(this.shape)) {
        const I = this.shape[_];
        l && !l[_] ? (m[_] = I) : (m[_] = I.optional());
      }
      return new ne({ ...this._def, shape: () => m });
    }
    required(l) {
      const m = {};
      for (const _ of e.util.objectKeys(this.shape))
        if (l && !l[_]) m[_] = this.shape[_];
        else {
          let T = this.shape[_];
          for (; T instanceof x;) T = T._def.innerType;
          m[_] = T;
        }
      return new ne({ ...this._def, shape: () => m });
    }
    keyof() {
      return U(e.util.objectKeys(this.shape));
    }
  }
  ((Z.ZodObject = ne),
    (ne.create = (A, l) =>
      new ne({
        shape: () => A,
        unknownKeys: 'strip',
        catchall: Ze.create(),
        typeName: fe.ZodObject,
        ...i(l),
      })),
    (ne.strictCreate = (A, l) =>
      new ne({
        shape: () => A,
        unknownKeys: 'strict',
        catchall: Ze.create(),
        typeName: fe.ZodObject,
        ...i(l),
      })),
    (ne.lazycreate = (A, l) =>
      new ne({
        shape: A,
        unknownKeys: 'strip',
        catchall: Ze.create(),
        typeName: fe.ZodObject,
        ...i(l),
      })));
  class be extends s {
    _parse(l) {
      const { ctx: m } = this._processInputParams(l),
        _ = this._def.options;
      function I(T) {
        for (const X of T) if (X.result.status === 'valid') return X.result;
        for (const X of T)
          if (X.result.status === 'dirty')
            return (m.common.issues.push(...X.ctx.common.issues), X.result);
        const ae = T.map((X) => new t.ZodError(X.ctx.common.issues));
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_union,
            unionErrors: ae,
          }),
          a.INVALID
        );
      }
      if (m.common.async)
        return Promise.all(
          _.map(async (T) => {
            const ae = {
              ...m,
              common: { ...m.common, issues: [] },
              parent: null,
            };
            return {
              result: await T._parseAsync({
                data: m.data,
                path: m.path,
                parent: ae,
              }),
              ctx: ae,
            };
          }),
        ).then(I);
      {
        let T;
        const ae = [];
        for (const Ae of _) {
          const Ie = {
              ...m,
              common: { ...m.common, issues: [] },
              parent: null,
            },
            Ge = Ae._parseSync({ data: m.data, path: m.path, parent: Ie });
          if (Ge.status === 'valid') return Ge;
          (Ge.status === 'dirty' && !T && (T = { result: Ge, ctx: Ie }),
            Ie.common.issues.length && ae.push(Ie.common.issues));
        }
        if (T) return (m.common.issues.push(...T.ctx.common.issues), T.result);
        const X = ae.map((Ae) => new t.ZodError(Ae));
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_union,
            unionErrors: X,
          }),
          a.INVALID
        );
      }
    }
    get options() {
      return this._def.options;
    }
  }
  ((Z.ZodUnion = be),
    (be.create = (A, l) =>
      new be({ options: A, typeName: fe.ZodUnion, ...i(l) })));
  const ke = (A) =>
    A instanceof pt
      ? ke(A.schema)
      : A instanceof V
        ? ke(A.innerType())
        : A instanceof kt
          ? [A.value]
          : A instanceof k
            ? A.options
            : A instanceof M
              ? e.util.objectValues(A.enum)
              : A instanceof Q
                ? ke(A._def.innerType)
                : A instanceof Re
                  ? [void 0]
                  : A instanceof _e
                    ? [null]
                    : A instanceof x
                      ? [void 0, ...ke(A.unwrap())]
                      : A instanceof J
                        ? [null, ...ke(A.unwrap())]
                        : A instanceof Pe || A instanceof me
                          ? ke(A.unwrap())
                          : A instanceof re
                            ? ke(A._def.innerType)
                            : [];
  class Me extends s {
    _parse(l) {
      const { ctx: m } = this._processInputParams(l);
      if (m.parsedType !== e.ZodParsedType.object)
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.object,
            received: m.parsedType,
          }),
          a.INVALID
        );
      const _ = this.discriminator,
        I = m.data[_],
        T = this.optionsMap.get(I);
      return T
        ? m.common.async
          ? T._parseAsync({ data: m.data, path: m.path, parent: m })
          : T._parseSync({ data: m.data, path: m.path, parent: m })
        : ((0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [_],
          }),
          a.INVALID);
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get options() {
      return this._def.options;
    }
    get optionsMap() {
      return this._def.optionsMap;
    }
    static create(l, m, _) {
      const I = new Map();
      for (const T of m) {
        const ae = ke(T.shape[l]);
        if (!ae.length)
          throw new Error(
            `A discriminator value for key \`${l}\` could not be extracted from all schema options`,
          );
        for (const X of ae) {
          if (I.has(X))
            throw new Error(
              `Discriminator property ${String(l)} has duplicate value ${String(X)}`,
            );
          I.set(X, T);
        }
      }
      return new Me({
        typeName: fe.ZodDiscriminatedUnion,
        discriminator: l,
        options: m,
        optionsMap: I,
        ...i(_),
      });
    }
  }
  Z.ZodDiscriminatedUnion = Me;
  function qe(A, l) {
    const m = (0, e.getParsedType)(A),
      _ = (0, e.getParsedType)(l);
    if (A === l) return { valid: !0, data: A };
    if (m === e.ZodParsedType.object && _ === e.ZodParsedType.object) {
      const I = e.util.objectKeys(l),
        T = e.util.objectKeys(A).filter((X) => I.indexOf(X) !== -1),
        ae = { ...A, ...l };
      for (const X of T) {
        const Ae = qe(A[X], l[X]);
        if (!Ae.valid) return { valid: !1 };
        ae[X] = Ae.data;
      }
      return { valid: !0, data: ae };
    } else if (m === e.ZodParsedType.array && _ === e.ZodParsedType.array) {
      if (A.length !== l.length) return { valid: !1 };
      const I = [];
      for (let T = 0; T < A.length; T++) {
        const ae = A[T],
          X = l[T],
          Ae = qe(ae, X);
        if (!Ae.valid) return { valid: !1 };
        I.push(Ae.data);
      }
      return { valid: !0, data: I };
    } else
      return m === e.ZodParsedType.date &&
        _ === e.ZodParsedType.date &&
        +A == +l
        ? { valid: !0, data: A }
        : { valid: !1 };
  }
  class je extends s {
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l),
        I = (T, ae) => {
          if ((0, a.isAborted)(T) || (0, a.isAborted)(ae)) return a.INVALID;
          const X = qe(T.value, ae.value);
          return X.valid
            ? (((0, a.isDirty)(T) || (0, a.isDirty)(ae)) && m.dirty(),
              { status: m.value, value: X.data })
            : ((0, a.addIssueToContext)(_, {
                code: t.ZodIssueCode.invalid_intersection_types,
              }),
              a.INVALID);
        };
      return _.common.async
        ? Promise.all([
            this._def.left._parseAsync({
              data: _.data,
              path: _.path,
              parent: _,
            }),
            this._def.right._parseAsync({
              data: _.data,
              path: _.path,
              parent: _,
            }),
          ]).then(([T, ae]) => I(T, ae))
        : I(
            this._def.left._parseSync({
              data: _.data,
              path: _.path,
              parent: _,
            }),
            this._def.right._parseSync({
              data: _.data,
              path: _.path,
              parent: _,
            }),
          );
    }
  }
  ((Z.ZodIntersection = je),
    (je.create = (A, l, m) =>
      new je({ left: A, right: l, typeName: fe.ZodIntersection, ...i(m) })));
  class Ve extends s {
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l);
      if (_.parsedType !== e.ZodParsedType.array)
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.array,
            received: _.parsedType,
          }),
          a.INVALID
        );
      if (_.data.length < this._def.items.length)
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: !0,
            exact: !1,
            type: 'array',
          }),
          a.INVALID
        );
      !this._def.rest &&
        _.data.length > this._def.items.length &&
        ((0, a.addIssueToContext)(_, {
          code: t.ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: !0,
          exact: !1,
          type: 'array',
        }),
        m.dirty());
      const T = [..._.data]
        .map((ae, X) => {
          const Ae = this._def.items[X] || this._def.rest;
          return Ae ? Ae._parse(new r(_, ae, _.path, X)) : null;
        })
        .filter((ae) => !!ae);
      return _.common.async
        ? Promise.all(T).then((ae) => a.ParseStatus.mergeArray(m, ae))
        : a.ParseStatus.mergeArray(m, T);
    }
    get items() {
      return this._def.items;
    }
    rest(l) {
      return new Ve({ ...this._def, rest: l });
    }
  }
  ((Z.ZodTuple = Ve),
    (Ve.create = (A, l) => {
      if (!Array.isArray(A))
        throw new Error(
          'You must pass an array of schemas to z.tuple([ ... ])',
        );
      return new Ve({ items: A, typeName: fe.ZodTuple, rest: null, ...i(l) });
    }));
  class ot extends s {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l);
      if (_.parsedType !== e.ZodParsedType.object)
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.object,
            received: _.parsedType,
          }),
          a.INVALID
        );
      const I = [],
        T = this._def.keyType,
        ae = this._def.valueType;
      for (const X in _.data)
        I.push({
          key: T._parse(new r(_, X, _.path, X)),
          value: ae._parse(new r(_, _.data[X], _.path, X)),
          alwaysSet: X in _.data,
        });
      return _.common.async
        ? a.ParseStatus.mergeObjectAsync(m, I)
        : a.ParseStatus.mergeObjectSync(m, I);
    }
    get element() {
      return this._def.valueType;
    }
    static create(l, m, _) {
      return m instanceof s
        ? new ot({ keyType: l, valueType: m, typeName: fe.ZodRecord, ...i(_) })
        : new ot({
            keyType: Ee.create(),
            valueType: l,
            typeName: fe.ZodRecord,
            ...i(m),
          });
    }
  }
  Z.ZodRecord = ot;
  class lt extends s {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l);
      if (_.parsedType !== e.ZodParsedType.map)
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.map,
            received: _.parsedType,
          }),
          a.INVALID
        );
      const I = this._def.keyType,
        T = this._def.valueType,
        ae = [..._.data.entries()].map(([X, Ae], Ie) => ({
          key: I._parse(new r(_, X, _.path, [Ie, 'key'])),
          value: T._parse(new r(_, Ae, _.path, [Ie, 'value'])),
        }));
      if (_.common.async) {
        const X = new Map();
        return Promise.resolve().then(async () => {
          for (const Ae of ae) {
            const Ie = await Ae.key,
              Ge = await Ae.value;
            if (Ie.status === 'aborted' || Ge.status === 'aborted')
              return a.INVALID;
            ((Ie.status === 'dirty' || Ge.status === 'dirty') && m.dirty(),
              X.set(Ie.value, Ge.value));
          }
          return { status: m.value, value: X };
        });
      } else {
        const X = new Map();
        for (const Ae of ae) {
          const Ie = Ae.key,
            Ge = Ae.value;
          if (Ie.status === 'aborted' || Ge.status === 'aborted')
            return a.INVALID;
          ((Ie.status === 'dirty' || Ge.status === 'dirty') && m.dirty(),
            X.set(Ie.value, Ge.value));
        }
        return { status: m.value, value: X };
      }
    }
  }
  ((Z.ZodMap = lt),
    (lt.create = (A, l, m) =>
      new lt({ valueType: l, keyType: A, typeName: fe.ZodMap, ...i(m) })));
  class st extends s {
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l);
      if (_.parsedType !== e.ZodParsedType.set)
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.set,
            received: _.parsedType,
          }),
          a.INVALID
        );
      const I = this._def;
      (I.minSize !== null &&
        _.data.size < I.minSize.value &&
        ((0, a.addIssueToContext)(_, {
          code: t.ZodIssueCode.too_small,
          minimum: I.minSize.value,
          type: 'set',
          inclusive: !0,
          exact: !1,
          message: I.minSize.message,
        }),
        m.dirty()),
        I.maxSize !== null &&
          _.data.size > I.maxSize.value &&
          ((0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.too_big,
            maximum: I.maxSize.value,
            type: 'set',
            inclusive: !0,
            exact: !1,
            message: I.maxSize.message,
          }),
          m.dirty()));
      const T = this._def.valueType;
      function ae(Ae) {
        const Ie = new Set();
        for (const Ge of Ae) {
          if (Ge.status === 'aborted') return a.INVALID;
          (Ge.status === 'dirty' && m.dirty(), Ie.add(Ge.value));
        }
        return { status: m.value, value: Ie };
      }
      const X = [..._.data.values()].map((Ae, Ie) =>
        T._parse(new r(_, Ae, _.path, Ie)),
      );
      return _.common.async ? Promise.all(X).then((Ae) => ae(Ae)) : ae(X);
    }
    min(l, m) {
      return new st({
        ...this._def,
        minSize: { value: l, message: u.errorUtil.toString(m) },
      });
    }
    max(l, m) {
      return new st({
        ...this._def,
        maxSize: { value: l, message: u.errorUtil.toString(m) },
      });
    }
    size(l, m) {
      return this.min(l, m).max(l, m);
    }
    nonempty(l) {
      return this.min(1, l);
    }
  }
  ((Z.ZodSet = st),
    (st.create = (A, l) =>
      new st({
        valueType: A,
        minSize: null,
        maxSize: null,
        typeName: fe.ZodSet,
        ...i(l),
      })));
  class ut extends s {
    constructor() {
      (super(...arguments), (this.validate = this.implement));
    }
    _parse(l) {
      const { ctx: m } = this._processInputParams(l);
      if (m.parsedType !== e.ZodParsedType.function)
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.function,
            received: m.parsedType,
          }),
          a.INVALID
        );
      function _(X, Ae) {
        return (0, a.makeIssue)({
          data: X,
          path: m.path,
          errorMaps: [
            m.common.contextualErrorMap,
            m.schemaErrorMap,
            (0, d.getErrorMap)(),
            d.defaultErrorMap,
          ].filter((Ie) => !!Ie),
          issueData: {
            code: t.ZodIssueCode.invalid_arguments,
            argumentsError: Ae,
          },
        });
      }
      function I(X, Ae) {
        return (0, a.makeIssue)({
          data: X,
          path: m.path,
          errorMaps: [
            m.common.contextualErrorMap,
            m.schemaErrorMap,
            (0, d.getErrorMap)(),
            d.defaultErrorMap,
          ].filter((Ie) => !!Ie),
          issueData: {
            code: t.ZodIssueCode.invalid_return_type,
            returnTypeError: Ae,
          },
        });
      }
      const T = { errorMap: m.common.contextualErrorMap },
        ae = m.data;
      if (this._def.returns instanceof j) {
        const X = this;
        return (0, a.OK)(async function (...Ae) {
          const Ie = new t.ZodError([]),
            Ge = await X._def.args.parseAsync(Ae, T).catch((Pn) => {
              throw (Ie.addIssue(_(Ae, Pn)), Ie);
            }),
            Qe = await Reflect.apply(ae, this, Ge);
          return await X._def.returns._def.type
            .parseAsync(Qe, T)
            .catch((Pn) => {
              throw (Ie.addIssue(I(Qe, Pn)), Ie);
            });
        });
      } else {
        const X = this;
        return (0, a.OK)(function (...Ae) {
          const Ie = X._def.args.safeParse(Ae, T);
          if (!Ie.success) throw new t.ZodError([_(Ae, Ie.error)]);
          const Ge = Reflect.apply(ae, this, Ie.data),
            Qe = X._def.returns.safeParse(Ge, T);
          if (!Qe.success) throw new t.ZodError([I(Ge, Qe.error)]);
          return Qe.data;
        });
      }
    }
    parameters() {
      return this._def.args;
    }
    returnType() {
      return this._def.returns;
    }
    args(...l) {
      return new ut({ ...this._def, args: Ve.create(l).rest(De.create()) });
    }
    returns(l) {
      return new ut({ ...this._def, returns: l });
    }
    implement(l) {
      return this.parse(l);
    }
    strictImplement(l) {
      return this.parse(l);
    }
    static create(l, m, _) {
      return new ut({
        args: l || Ve.create([]).rest(De.create()),
        returns: m || De.create(),
        typeName: fe.ZodFunction,
        ...i(_),
      });
    }
  }
  Z.ZodFunction = ut;
  class pt extends s {
    get schema() {
      return this._def.getter();
    }
    _parse(l) {
      const { ctx: m } = this._processInputParams(l);
      return this._def
        .getter()
        ._parse({ data: m.data, path: m.path, parent: m });
    }
  }
  ((Z.ZodLazy = pt),
    (pt.create = (A, l) =>
      new pt({ getter: A, typeName: fe.ZodLazy, ...i(l) })));
  class kt extends s {
    _parse(l) {
      if (l.data !== this._def.value) {
        const m = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(m, {
            received: m.data,
            code: t.ZodIssueCode.invalid_literal,
            expected: this._def.value,
          }),
          a.INVALID
        );
      }
      return { status: 'valid', value: l.data };
    }
    get value() {
      return this._def.value;
    }
  }
  ((Z.ZodLiteral = kt),
    (kt.create = (A, l) =>
      new kt({ value: A, typeName: fe.ZodLiteral, ...i(l) })));
  function U(A, l) {
    return new k({ values: A, typeName: fe.ZodEnum, ...i(l) });
  }
  class k extends s {
    _parse(l) {
      if (typeof l.data != 'string') {
        const m = this._getOrReturnCtx(l),
          _ = this._def.values;
        return (
          (0, a.addIssueToContext)(m, {
            expected: e.util.joinValues(_),
            received: m.parsedType,
            code: t.ZodIssueCode.invalid_type,
          }),
          a.INVALID
        );
      }
      if (
        (this._cache || (this._cache = new Set(this._def.values)),
        !this._cache.has(l.data))
      ) {
        const m = this._getOrReturnCtx(l),
          _ = this._def.values;
        return (
          (0, a.addIssueToContext)(m, {
            received: m.data,
            code: t.ZodIssueCode.invalid_enum_value,
            options: _,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const l = {};
      for (const m of this._def.values) l[m] = m;
      return l;
    }
    get Values() {
      const l = {};
      for (const m of this._def.values) l[m] = m;
      return l;
    }
    get Enum() {
      const l = {};
      for (const m of this._def.values) l[m] = m;
      return l;
    }
    extract(l, m = this._def) {
      return k.create(l, { ...this._def, ...m });
    }
    exclude(l, m = this._def) {
      return k.create(
        this.options.filter((_) => !l.includes(_)),
        { ...this._def, ...m },
      );
    }
  }
  ((Z.ZodEnum = k), (k.create = U));
  class M extends s {
    _parse(l) {
      const m = e.util.getValidEnumValues(this._def.values),
        _ = this._getOrReturnCtx(l);
      if (
        _.parsedType !== e.ZodParsedType.string &&
        _.parsedType !== e.ZodParsedType.number
      ) {
        const I = e.util.objectValues(m);
        return (
          (0, a.addIssueToContext)(_, {
            expected: e.util.joinValues(I),
            received: _.parsedType,
            code: t.ZodIssueCode.invalid_type,
          }),
          a.INVALID
        );
      }
      if (
        (this._cache ||
          (this._cache = new Set(e.util.getValidEnumValues(this._def.values))),
        !this._cache.has(l.data))
      ) {
        const I = e.util.objectValues(m);
        return (
          (0, a.addIssueToContext)(_, {
            received: _.data,
            code: t.ZodIssueCode.invalid_enum_value,
            options: I,
          }),
          a.INVALID
        );
      }
      return (0, a.OK)(l.data);
    }
    get enum() {
      return this._def.values;
    }
  }
  ((Z.ZodNativeEnum = M),
    (M.create = (A, l) =>
      new M({ values: A, typeName: fe.ZodNativeEnum, ...i(l) })));
  class j extends s {
    unwrap() {
      return this._def.type;
    }
    _parse(l) {
      const { ctx: m } = this._processInputParams(l);
      if (m.parsedType !== e.ZodParsedType.promise && m.common.async === !1)
        return (
          (0, a.addIssueToContext)(m, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.promise,
            received: m.parsedType,
          }),
          a.INVALID
        );
      const _ =
        m.parsedType === e.ZodParsedType.promise
          ? m.data
          : Promise.resolve(m.data);
      return (0, a.OK)(
        _.then((I) =>
          this._def.type.parseAsync(I, {
            path: m.path,
            errorMap: m.common.contextualErrorMap,
          }),
        ),
      );
    }
  }
  ((Z.ZodPromise = j),
    (j.create = (A, l) =>
      new j({ type: A, typeName: fe.ZodPromise, ...i(l) })));
  class V extends s {
    innerType() {
      return this._def.schema;
    }
    sourceType() {
      return this._def.schema._def.typeName === fe.ZodEffects
        ? this._def.schema.sourceType()
        : this._def.schema;
    }
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l),
        I = this._def.effect || null,
        T = {
          addIssue: (ae) => {
            ((0, a.addIssueToContext)(_, ae), ae.fatal ? m.abort() : m.dirty());
          },
          get path() {
            return _.path;
          },
        };
      if (((T.addIssue = T.addIssue.bind(T)), I.type === 'preprocess')) {
        const ae = I.transform(_.data, T);
        if (_.common.async)
          return Promise.resolve(ae).then(async (X) => {
            if (m.value === 'aborted') return a.INVALID;
            const Ae = await this._def.schema._parseAsync({
              data: X,
              path: _.path,
              parent: _,
            });
            return Ae.status === 'aborted'
              ? a.INVALID
              : Ae.status === 'dirty' || m.value === 'dirty'
                ? (0, a.DIRTY)(Ae.value)
                : Ae;
          });
        {
          if (m.value === 'aborted') return a.INVALID;
          const X = this._def.schema._parseSync({
            data: ae,
            path: _.path,
            parent: _,
          });
          return X.status === 'aborted'
            ? a.INVALID
            : X.status === 'dirty' || m.value === 'dirty'
              ? (0, a.DIRTY)(X.value)
              : X;
        }
      }
      if (I.type === 'refinement') {
        const ae = (X) => {
          const Ae = I.refinement(X, T);
          if (_.common.async) return Promise.resolve(Ae);
          if (Ae instanceof Promise)
            throw new Error(
              'Async refinement encountered during synchronous parse operation. Use .parseAsync instead.',
            );
          return X;
        };
        if (_.common.async === !1) {
          const X = this._def.schema._parseSync({
            data: _.data,
            path: _.path,
            parent: _,
          });
          return X.status === 'aborted'
            ? a.INVALID
            : (X.status === 'dirty' && m.dirty(),
              ae(X.value),
              { status: m.value, value: X.value });
        } else
          return this._def.schema
            ._parseAsync({ data: _.data, path: _.path, parent: _ })
            .then((X) =>
              X.status === 'aborted'
                ? a.INVALID
                : (X.status === 'dirty' && m.dirty(),
                  ae(X.value).then(() => ({
                    status: m.value,
                    value: X.value,
                  }))),
            );
      }
      if (I.type === 'transform')
        if (_.common.async === !1) {
          const ae = this._def.schema._parseSync({
            data: _.data,
            path: _.path,
            parent: _,
          });
          if (!(0, a.isValid)(ae)) return a.INVALID;
          const X = I.transform(ae.value, T);
          if (X instanceof Promise)
            throw new Error(
              'Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.',
            );
          return { status: m.value, value: X };
        } else
          return this._def.schema
            ._parseAsync({ data: _.data, path: _.path, parent: _ })
            .then((ae) =>
              (0, a.isValid)(ae)
                ? Promise.resolve(I.transform(ae.value, T)).then((X) => ({
                    status: m.value,
                    value: X,
                  }))
                : a.INVALID,
            );
      e.util.assertNever(I);
    }
  }
  ((Z.ZodEffects = V),
    (Z.ZodTransformer = V),
    (V.create = (A, l, m) =>
      new V({ schema: A, typeName: fe.ZodEffects, effect: l, ...i(m) })),
    (V.createWithPreprocess = (A, l, m) =>
      new V({
        schema: l,
        effect: { type: 'preprocess', transform: A },
        typeName: fe.ZodEffects,
        ...i(m),
      })));
  class x extends s {
    _parse(l) {
      return this._getType(l) === e.ZodParsedType.undefined
        ? (0, a.OK)(void 0)
        : this._def.innerType._parse(l);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ((Z.ZodOptional = x),
    (x.create = (A, l) =>
      new x({ innerType: A, typeName: fe.ZodOptional, ...i(l) })));
  class J extends s {
    _parse(l) {
      return this._getType(l) === e.ZodParsedType.null
        ? (0, a.OK)(null)
        : this._def.innerType._parse(l);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ((Z.ZodNullable = J),
    (J.create = (A, l) =>
      new J({ innerType: A, typeName: fe.ZodNullable, ...i(l) })));
  class Q extends s {
    _parse(l) {
      const { ctx: m } = this._processInputParams(l);
      let _ = m.data;
      return (
        m.parsedType === e.ZodParsedType.undefined &&
          (_ = this._def.defaultValue()),
        this._def.innerType._parse({ data: _, path: m.path, parent: m })
      );
    }
    removeDefault() {
      return this._def.innerType;
    }
  }
  ((Z.ZodDefault = Q),
    (Q.create = (A, l) =>
      new Q({
        innerType: A,
        typeName: fe.ZodDefault,
        defaultValue:
          typeof l.default == 'function' ? l.default : () => l.default,
        ...i(l),
      })));
  class re extends s {
    _parse(l) {
      const { ctx: m } = this._processInputParams(l),
        _ = { ...m, common: { ...m.common, issues: [] } },
        I = this._def.innerType._parse({
          data: _.data,
          path: _.path,
          parent: { ..._ },
        });
      return (0, a.isAsync)(I)
        ? I.then((T) => ({
            status: 'valid',
            value:
              T.status === 'valid'
                ? T.value
                : this._def.catchValue({
                    get error() {
                      return new t.ZodError(_.common.issues);
                    },
                    input: _.data,
                  }),
          }))
        : {
            status: 'valid',
            value:
              I.status === 'valid'
                ? I.value
                : this._def.catchValue({
                    get error() {
                      return new t.ZodError(_.common.issues);
                    },
                    input: _.data,
                  }),
          };
    }
    removeCatch() {
      return this._def.innerType;
    }
  }
  ((Z.ZodCatch = re),
    (re.create = (A, l) =>
      new re({
        innerType: A,
        typeName: fe.ZodCatch,
        catchValue: typeof l.catch == 'function' ? l.catch : () => l.catch,
        ...i(l),
      })));
  class ce extends s {
    _parse(l) {
      if (this._getType(l) !== e.ZodParsedType.nan) {
        const _ = this._getOrReturnCtx(l);
        return (
          (0, a.addIssueToContext)(_, {
            code: t.ZodIssueCode.invalid_type,
            expected: e.ZodParsedType.nan,
            received: _.parsedType,
          }),
          a.INVALID
        );
      }
      return { status: 'valid', value: l.data };
    }
  }
  ((Z.ZodNaN = ce),
    (ce.create = (A) => new ce({ typeName: fe.ZodNaN, ...i(A) })),
    (Z.BRAND = Symbol('zod_brand')));
  class Pe extends s {
    _parse(l) {
      const { ctx: m } = this._processInputParams(l),
        _ = m.data;
      return this._def.type._parse({ data: _, path: m.path, parent: m });
    }
    unwrap() {
      return this._def.type;
    }
  }
  Z.ZodBranded = Pe;
  class S extends s {
    _parse(l) {
      const { status: m, ctx: _ } = this._processInputParams(l);
      if (_.common.async)
        return (async () => {
          const T = await this._def.in._parseAsync({
            data: _.data,
            path: _.path,
            parent: _,
          });
          return T.status === 'aborted'
            ? a.INVALID
            : T.status === 'dirty'
              ? (m.dirty(), (0, a.DIRTY)(T.value))
              : this._def.out._parseAsync({
                  data: T.value,
                  path: _.path,
                  parent: _,
                });
        })();
      {
        const I = this._def.in._parseSync({
          data: _.data,
          path: _.path,
          parent: _,
        });
        return I.status === 'aborted'
          ? a.INVALID
          : I.status === 'dirty'
            ? (m.dirty(), { status: 'dirty', value: I.value })
            : this._def.out._parseSync({
                data: I.value,
                path: _.path,
                parent: _,
              });
      }
    }
    static create(l, m) {
      return new S({ in: l, out: m, typeName: fe.ZodPipeline });
    }
  }
  Z.ZodPipeline = S;
  class me extends s {
    _parse(l) {
      const m = this._def.innerType._parse(l),
        _ = (I) => ((0, a.isValid)(I) && (I.value = Object.freeze(I.value)), I);
      return (0, a.isAsync)(m) ? m.then((I) => _(I)) : _(m);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ((Z.ZodReadonly = me),
    (me.create = (A, l) =>
      new me({ innerType: A, typeName: fe.ZodReadonly, ...i(l) })));
  function ze(A, l) {
    const m =
      typeof A == 'function' ? A(l) : typeof A == 'string' ? { message: A } : A;
    return typeof m == 'string' ? { message: m } : m;
  }
  function se(A, l = {}, m) {
    return A
      ? Oe.create().superRefine((_, I) => {
          const T = A(_);
          if (T instanceof Promise)
            return T.then((ae) => {
              if (!ae) {
                const X = ze(l, _),
                  Ae = X.fatal ?? m ?? !0;
                I.addIssue({ code: 'custom', ...X, fatal: Ae });
              }
            });
          if (!T) {
            const ae = ze(l, _),
              X = ae.fatal ?? m ?? !0;
            I.addIssue({ code: 'custom', ...ae, fatal: X });
          }
        })
      : Oe.create();
  }
  Z.late = { object: ne.lazycreate };
  var fe;
  (function (A) {
    ((A.ZodString = 'ZodString'),
      (A.ZodNumber = 'ZodNumber'),
      (A.ZodNaN = 'ZodNaN'),
      (A.ZodBigInt = 'ZodBigInt'),
      (A.ZodBoolean = 'ZodBoolean'),
      (A.ZodDate = 'ZodDate'),
      (A.ZodSymbol = 'ZodSymbol'),
      (A.ZodUndefined = 'ZodUndefined'),
      (A.ZodNull = 'ZodNull'),
      (A.ZodAny = 'ZodAny'),
      (A.ZodUnknown = 'ZodUnknown'),
      (A.ZodNever = 'ZodNever'),
      (A.ZodVoid = 'ZodVoid'),
      (A.ZodArray = 'ZodArray'),
      (A.ZodObject = 'ZodObject'),
      (A.ZodUnion = 'ZodUnion'),
      (A.ZodDiscriminatedUnion = 'ZodDiscriminatedUnion'),
      (A.ZodIntersection = 'ZodIntersection'),
      (A.ZodTuple = 'ZodTuple'),
      (A.ZodRecord = 'ZodRecord'),
      (A.ZodMap = 'ZodMap'),
      (A.ZodSet = 'ZodSet'),
      (A.ZodFunction = 'ZodFunction'),
      (A.ZodLazy = 'ZodLazy'),
      (A.ZodLiteral = 'ZodLiteral'),
      (A.ZodEnum = 'ZodEnum'),
      (A.ZodEffects = 'ZodEffects'),
      (A.ZodNativeEnum = 'ZodNativeEnum'),
      (A.ZodOptional = 'ZodOptional'),
      (A.ZodNullable = 'ZodNullable'),
      (A.ZodDefault = 'ZodDefault'),
      (A.ZodCatch = 'ZodCatch'),
      (A.ZodPromise = 'ZodPromise'),
      (A.ZodBranded = 'ZodBranded'),
      (A.ZodPipeline = 'ZodPipeline'),
      (A.ZodReadonly = 'ZodReadonly'));
  })(fe || (Z.ZodFirstPartyTypeKind = fe = {}));
  const $e = (A, l = { message: `Input not instance of ${A.name}` }) =>
    se((m) => m instanceof A, l);
  Z.instanceof = $e;
  const Ye = Ee.create;
  Z.string = Ye;
  const tt = L.create;
  Z.number = tt;
  const Ct = ce.create;
  Z.nan = Ct;
  const ht = Be.create;
  Z.bigint = ht;
  const mt = ge.create;
  Z.boolean = mt;
  const xt = ve.create;
  Z.date = xt;
  const It = xe.create;
  Z.symbol = It;
  const Dt = Re.create;
  Z.undefined = Dt;
  const ar = _e.create;
  Z.null = ar;
  const yr = Oe.create;
  Z.any = yr;
  const Ii = De.create;
  Z.unknown = Ii;
  const Ei = Ze.create;
  Z.never = Ei;
  const Ti = Ke.create;
  Z.void = Ti;
  const Rn = g.create;
  Z.array = Rn;
  const Ri = ne.create;
  Z.object = Ri;
  const Mi = ne.strictCreate;
  Z.strictObject = Mi;
  const gt = be.create;
  Z.union = gt;
  const Sn = Me.create;
  Z.discriminatedUnion = Sn;
  const Oi = je.create;
  Z.intersection = Oi;
  const Ui = Ve.create;
  Z.tuple = Ui;
  const ni = ot.create;
  Z.record = ni;
  const ji = lt.create;
  Z.map = ji;
  const ye = st.create;
  Z.set = ye;
  const zi = ut.create;
  Z.function = zi;
  const ai = pt.create;
  Z.lazy = ai;
  const Mn = kt.create;
  Z.literal = Mn;
  const ii = k.create;
  Z.enum = ii;
  const On = M.create;
  Z.nativeEnum = On;
  const Di = j.create;
  Z.promise = Di;
  const oi = V.create;
  ((Z.effect = oi), (Z.transformer = oi));
  const Bn = x.create;
  Z.optional = Bn;
  const si = J.create;
  Z.nullable = si;
  const Un = V.createWithPreprocess;
  Z.preprocess = Un;
  const li = S.create;
  Z.pipeline = li;
  const Ni = () => Ye().optional();
  Z.ostring = Ni;
  const ui = () => tt().optional();
  Z.onumber = ui;
  const ci = () => mt().optional();
  return (
    (Z.oboolean = ci),
    (Z.coerce = {
      string: (A) => Ee.create({ ...A, coerce: !0 }),
      number: (A) => L.create({ ...A, coerce: !0 }),
      boolean: (A) => ge.create({ ...A, coerce: !0 }),
      bigint: (A) => Be.create({ ...A, coerce: !0 }),
      date: (A) => ve.create({ ...A, coerce: !0 }),
    }),
    (Z.NEVER = a.INVALID),
    Z
  );
}
var du;
function fu() {
  return (
    du ||
      ((du = 1),
      (function (t) {
        var d =
            (dn && dn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (dn && dn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          u(ko(), t),
          u(Gc(), t),
          u(Kf(), t),
          u(xi(), t),
          u(Gf(), t),
          u(_o(), t));
      })(dn)),
    dn
  );
}
var hu;
function Yc() {
  return (
    hu ||
      ((hu = 1),
      (function (t) {
        var d =
            (Ot && Ot.__createBinding) ||
            (Object.create
              ? function (n, i, s, f) {
                  f === void 0 && (f = s);
                  var o = Object.getOwnPropertyDescriptor(i, s);
                  ((!o ||
                    ('get' in o
                      ? !i.__esModule
                      : o.writable || o.configurable)) &&
                    (o = {
                      enumerable: !0,
                      get: function () {
                        return i[s];
                      },
                    }),
                    Object.defineProperty(n, f, o));
                }
              : function (n, i, s, f) {
                  (f === void 0 && (f = s), (n[f] = i[s]));
                }),
          u =
            (Ot && Ot.__setModuleDefault) ||
            (Object.create
              ? function (n, i) {
                  Object.defineProperty(n, 'default', {
                    enumerable: !0,
                    value: i,
                  });
                }
              : function (n, i) {
                  n.default = i;
                }),
          a =
            (Ot && Ot.__importStar) ||
            function (n) {
              if (n && n.__esModule) return n;
              var i = {};
              if (n != null)
                for (var s in n)
                  s !== 'default' &&
                    Object.prototype.hasOwnProperty.call(n, s) &&
                    d(i, n, s);
              return (u(i, n), i);
            },
          e =
            (Ot && Ot.__exportStar) ||
            function (n, i) {
              for (var s in n)
                s !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(i, s) &&
                  d(i, n, s);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), (t.z = void 0));
        const r = a(fu());
        ((t.z = r), e(fu(), t), (t.default = r));
      })(Ot)),
    Ot
  );
}
const Yf = '16.3.0',
  Jf = { version: Yf };
var gu;
function Jc() {
  if (gu) return cn;
  gu = 1;
  var t =
    (cn && cn.__importDefault) ||
    function (W) {
      return W && W.__esModule ? W : { default: W };
    };
  (Object.defineProperty(cn, '__esModule', { value: !0 }),
    (cn.HttpApi = void 0));
  const d = Hf(),
    u = t(Wf()),
    a = t(Wc()),
    e = Yc(),
    r = Jf.version,
    n = e.z.object({
      '@type': e.z.literal('ton.blockIdExt'),
      workchain: e.z.number(),
      shard: e.z.string(),
      seqno: e.z.number(),
      root_hash: e.z.string(),
      file_hash: e.z.string(),
    }),
    i = e.z.object({
      balance: e.z.union([e.z.number(), e.z.string()]),
      extra_currencies: e.z.optional(
        e.z.array(
          e.z.object({
            '@type': e.z.literal('extraCurrency'),
            id: e.z.number(),
            amount: e.z.string(),
          }),
        ),
      ),
      state: e.z.union([
        e.z.literal('active'),
        e.z.literal('uninitialized'),
        e.z.literal('frozen'),
      ]),
      data: e.z.string(),
      code: e.z.string(),
      last_transaction_id: e.z.object({
        '@type': e.z.literal('internal.transactionId'),
        lt: e.z.string(),
        hash: e.z.string(),
      }),
      block_id: n,
      sync_utime: e.z.number(),
    }),
    s = e.z.object({ '@type': e.z.literal('ok') }),
    f = e.z.object({
      '@type': e.z.literal('query.fees'),
      source_fees: e.z.object({
        '@type': e.z.literal('fees'),
        in_fwd_fee: e.z.number(),
        storage_fee: e.z.number(),
        gas_fee: e.z.number(),
        fwd_fee: e.z.number(),
      }),
    }),
    o = e.z.object({
      gas_used: e.z.number(),
      exit_code: e.z.number(),
      stack: e.z.array(e.z.unknown()),
    }),
    y = e.z.union([
      e.z.object({ '@type': e.z.literal('msg.dataRaw'), body: e.z.string() }),
      e.z.object({ '@type': e.z.literal('msg.dataText'), text: e.z.string() }),
      e.z.object({
        '@type': e.z.literal('msg.dataDecryptedText'),
        text: e.z.string(),
      }),
      e.z.object({
        '@type': e.z.literal('msg.dataEncryptedText'),
        text: e.z.string(),
      }),
    ]),
    v = e.z.object({
      source: e.z.string(),
      destination: e.z.string(),
      value: e.z.string(),
      fwd_fee: e.z.string(),
      ihr_fee: e.z.string(),
      created_lt: e.z.string(),
      body_hash: e.z.string(),
      msg_data: y,
      message: e.z.string().optional(),
    }),
    w = e.z.object({
      data: e.z.string(),
      utime: e.z.number(),
      transaction_id: e.z.object({ lt: e.z.string(), hash: e.z.string() }),
      fee: e.z.string(),
      storage_fee: e.z.string(),
      other_fee: e.z.string(),
      in_msg: e.z.union([e.z.undefined(), v]),
      out_msgs: e.z.array(v),
    }),
    R = e.z.array(w),
    C = e.z.object({ state_root_hash: e.z.string(), last: n, init: n }),
    P = e.z.object({ shards: e.z.array(n) }),
    E = e.z.object({
      '@type': e.z.literal('blocks.shortTxId'),
      mode: e.z.number(),
      account: e.z.string(),
      lt: e.z.string(),
      hash: e.z.string(),
    }),
    N = e.z.object({
      id: n,
      req_count: e.z.number(),
      incomplete: e.z.boolean(),
      transactions: e.z.array(E),
    });
  class D {
    constructor(F, K, Y, ue) {
      ((this.namespace = F),
        (this.cache = K),
        (this.codec = Y),
        (this.keyEncoder = ue));
    }
    async get(F) {
      let K = await this.cache.get(this.namespace, this.keyEncoder(F));
      if (K) {
        let Y = this.codec.safeParse(JSON.parse(K));
        if (Y.success) return Y.data;
      }
      return null;
    }
    async set(F, K) {
      K !== null
        ? await this.cache.set(
            this.namespace,
            this.keyEncoder(F),
            JSON.stringify(K),
          )
        : await this.cache.set(this.namespace, this.keyEncoder(F), null);
    }
  }
  let G = class {
    constructor(F, K) {
      ((this.endpoint = F),
        (this.cache = new d.InMemoryCache()),
        (this.parameters = {
          timeout: (K == null ? void 0 : K.timeout) || 3e4,
          apiKey: K == null ? void 0 : K.apiKey,
          adapter: K == null ? void 0 : K.adapter,
        }),
        (this.shardCache = new D(
          'ton-shard',
          this.cache,
          e.z.array(n),
          (Y) => Y + '',
        )),
        (this.shardLoader = new u.default(
          async (Y) =>
            await Promise.all(
              Y.map(async (ue) => {
                const we = await this.shardCache.get(ue);
                if (we) return we;
                let Ce = (await this.doCall('shards', { seqno: ue }, P)).shards;
                return (await this.shardCache.set(ue, Ce), Ce);
              }),
            ),
        )),
        (this.shardTransactionsCache = new D(
          'ton-shard-tx',
          this.cache,
          N,
          (Y) => Y.workchain + ':' + Y.shard + ':' + Y.seqno,
        )),
        (this.shardTransactionsLoader = new u.default(
          async (Y) =>
            await Promise.all(
              Y.map(async (ue) => {
                const we = await this.shardTransactionsCache.get(ue);
                if (we) return we;
                let Ce = await this.doCall(
                  'getBlockTransactions',
                  { workchain: ue.workchain, seqno: ue.seqno, shard: ue.shard },
                  N,
                );
                return (await this.shardTransactionsCache.set(ue, Ce), Ce);
              }),
            ),
          { cacheKeyFn: (Y) => Y.workchain + ':' + Y.shard + ':' + Y.seqno },
        )));
    }
    getAddressInformation(F) {
      return this.doCall('getAddressInformation', { address: F.toString() }, i);
    }
    async getTransactions(F, K) {
      const Y = K.inclusive;
      delete K.inclusive;
      let ue;
      K.hash && (ue = Buffer.from(K.hash, 'base64').toString('hex'));
      let we = K.limit;
      K.hash && K.lt && Y !== !0 && we++;
      let Ce = await this.doCall(
        'getTransactions',
        { address: F.toString(), ...K, limit: we, hash: ue },
        R,
      );
      return (
        Ce.length > we && (Ce = Ce.slice(0, we)),
        K.hash && K.lt && Y !== !0 && Ce.shift(),
        Ce
      );
    }
    async getMasterchainInfo() {
      return await this.doCall('getMasterchainInfo', {}, C);
    }
    async getShards(F) {
      return await this.shardLoader.load(F);
    }
    async getBlockTransactions(F, K, Y) {
      return await this.shardTransactionsLoader.load({
        workchain: F,
        seqno: K,
        shard: Y,
      });
    }
    async getTransaction(F, K, Y) {
      let ue = Buffer.from(Y, 'base64').toString('hex'),
        Ce = (
          await this.doCall(
            'getTransactions',
            { address: F.toString(), lt: K, hash: ue, limit: 1 },
            R,
          )
        ).find(($) => $.transaction_id.lt === K && $.transaction_id.hash === Y);
      return Ce || null;
    }
    async callGetMethod(F, K, Y) {
      return await this.doCall(
        'runGetMethod',
        { address: F.toString(), method: K, stack: te(Y) },
        o,
      );
    }
    async sendBoc(F) {
      await this.doCall('sendBoc', { boc: F.toString('base64') }, s);
    }
    async estimateFee(F, K) {
      return await this.doCall(
        'estimateFee',
        {
          address: F.toString(),
          body: K.body.toBoc().toString('base64'),
          init_data: K.initData ? K.initData.toBoc().toString('base64') : '',
          init_code: K.initCode ? K.initCode.toBoc().toString('base64') : '',
          ignore_chksig: K.ignoreSignature,
        },
        f,
      );
    }
    async tryLocateResultTx(F, K, Y) {
      return await this.doCall(
        'tryLocateResultTx',
        { source: F.toString(), destination: K.toString(), created_lt: Y },
        w,
      );
    }
    async tryLocateSourceTx(F, K, Y) {
      return await this.doCall(
        'tryLocateSourceTx',
        { source: F.toString(), destination: K.toString(), created_lt: Y },
        w,
      );
    }
    async doCall(F, K, Y) {
      let ue = {
        'Content-Type': 'application/json',
        'X-Ton-Client-Version': r,
      };
      this.parameters.apiKey && (ue['X-API-Key'] = this.parameters.apiKey);
      let we = await a.default.post(
        this.endpoint,
        JSON.stringify({ id: '1', jsonrpc: '2.0', method: F, params: K }),
        {
          headers: ue,
          timeout: this.parameters.timeout,
          adapter: this.parameters.adapter,
        },
      );
      if (we.status !== 200 || !we.data.ok)
        throw Error('Received error: ' + JSON.stringify(we.data));
      let Ce = Y.safeParse(we.data.result);
      if (Ce.success) return Ce.data;
      throw Error(
        'Malformed response: ' + Ce.error.format()._errors.join(', '),
      );
    }
  };
  cn.HttpApi = G;
  function te(W) {
    let F = [];
    for (let K of W)
      if (K.type === 'int') F.push(['num', K.value.toString()]);
      else if (K.type === 'cell')
        F.push(['tvm.Cell', K.cell.toBoc().toString('base64')]);
      else if (K.type === 'slice')
        F.push(['tvm.Slice', K.cell.toBoc().toString('base64')]);
      else if (K.type === 'builder')
        F.push(['tvm.Builder', K.cell.toBoc().toString('base64')]);
      else throw Error('Unsupported stack item type: ' + K.type);
    return F;
  }
  return cn;
}
var Ma = {},
  pu;
function Qf() {
  if (pu) return Ma;
  ((pu = 1),
    Object.defineProperty(Ma, '__esModule', { value: !0 }),
    (Ma.TonClient = void 0));
  const t = Jc(),
    d = at();
  let u = class {
    constructor(s) {
      ((this.parameters = { endpoint: s.endpoint }),
        (this.api = new t.HttpApi(this.parameters.endpoint, {
          timeout: s.timeout,
          apiKey: s.apiKey,
          adapter: s.httpAdapter,
        })));
    }
    async getBalance(s) {
      return (await this.getContractState(s)).balance;
    }
    async runMethod(s, f, o = []) {
      let y = await this.api.callGetMethod(s, f, o);
      if (y.exit_code !== 0)
        throw Error(
          'Unable to execute get method. Got exit_code: ' + y.exit_code,
        );
      return { gas_used: y.gas_used, stack: r(y.stack) };
    }
    async callGetMethod(s, f, o = []) {
      return this.runMethod(s, f, o);
    }
    async runMethodWithError(s, f, o = []) {
      let y = await this.api.callGetMethod(s, f, o);
      return {
        gas_used: y.gas_used,
        stack: r(y.stack),
        exit_code: y.exit_code,
      };
    }
    async callGetMethodWithError(s, f, o = []) {
      return this.runMethodWithError(s, f, o);
    }
    async getTransactions(s, f) {
      let o = await this.api.getTransactions(s, f),
        y = [];
      for (let v of o)
        y.push(
          (0, d.loadTransaction)(
            d.Cell.fromBoc(Buffer.from(v.data, 'base64'))[0].beginParse(),
          ),
        );
      return y;
    }
    async getTransaction(s, f, o) {
      let y = await this.api.getTransaction(s, f, o);
      return y
        ? (0, d.loadTransaction)(
            d.Cell.fromBoc(Buffer.from(y.data, 'base64'))[0].beginParse(),
          )
        : null;
    }
    async tryLocateResultTx(s, f, o) {
      let y = await this.api.tryLocateResultTx(s, f, o);
      return (0, d.loadTransaction)(d.Cell.fromBase64(y.data).beginParse());
    }
    async tryLocateSourceTx(s, f, o) {
      let y = await this.api.tryLocateSourceTx(s, f, o);
      return (0, d.loadTransaction)(d.Cell.fromBase64(y.data).beginParse());
    }
    async getMasterchainInfo() {
      let s = await this.api.getMasterchainInfo();
      return {
        workchain: s.init.workchain,
        shard: s.last.shard,
        initSeqno: s.init.seqno,
        latestSeqno: s.last.seqno,
      };
    }
    async getWorkchainShards(s) {
      return (await this.api.getShards(s)).map((o) => ({
        workchain: o.workchain,
        shard: o.shard,
        seqno: o.seqno,
      }));
    }
    async getShardTransactions(s, f, o) {
      let y = await this.api.getBlockTransactions(s, f, o);
      if (y.incomplete) throw Error('Unsupported');
      return y.transactions.map((v) => ({
        account: d.Address.parseRaw(v.account),
        lt: v.lt,
        hash: v.hash,
      }));
    }
    async sendMessage(s) {
      const f = (0, d.beginCell)()
        .store((0, d.storeMessage)(s))
        .endCell()
        .toBoc();
      await this.api.sendBoc(f);
    }
    async sendFile(s) {
      await this.api.sendBoc(s);
    }
    async estimateExternalMessageFee(s, f) {
      return await this.api.estimateFee(s, {
        body: f.body,
        initCode: f.initCode,
        initData: f.initData,
        ignoreSignature: f.ignoreSignature,
      });
    }
    async sendExternalMessage(s, f) {
      if ((await this.isContractDeployed(s.address)) || !s.init) {
        const o = (0, d.external)({ to: s.address, body: f });
        await this.sendMessage(o);
      } else {
        const o = (0, d.external)({ to: s.address, init: s.init, body: f });
        await this.sendMessage(o);
      }
    }
    async isContractDeployed(s) {
      return (await this.getContractState(s)).state === 'active';
    }
    async getContractState(s) {
      let f = await this.api.getAddressInformation(s),
        o = BigInt(f.balance),
        y = f.state;
      return {
        balance: o,
        extra_currencies: f.extra_currencies,
        state: y,
        code: f.code !== '' ? Buffer.from(f.code, 'base64') : null,
        data: f.data !== '' ? Buffer.from(f.data, 'base64') : null,
        lastTransaction:
          f.last_transaction_id.lt !== '0'
            ? { lt: f.last_transaction_id.lt, hash: f.last_transaction_id.hash }
            : null,
        blockId: {
          workchain: f.block_id.workchain,
          shard: f.block_id.shard,
          seqno: f.block_id.seqno,
        },
        timestampt: f.sync_utime,
      };
    }
    open(s) {
      return (0, d.openContract)(s, (f) => n(this, f.address, f.init));
    }
    provider(s, f) {
      return n(this, s, f ?? null);
    }
  };
  Ma.TonClient = u;
  function a(i) {
    const s = i['@type'];
    switch (s) {
      case 'tvm.list':
      case 'tvm.tuple':
        return i.elements.map(a);
      case 'tvm.cell':
        return d.Cell.fromBoc(Buffer.from(i.bytes, 'base64'))[0];
      case 'tvm.slice':
        return d.Cell.fromBoc(Buffer.from(i.bytes, 'base64'))[0];
      case 'tvm.stackEntryCell':
        return a(i.cell);
      case 'tvm.stackEntrySlice':
        return a(i.slice);
      case 'tvm.stackEntryTuple':
        return a(i.tuple);
      case 'tvm.stackEntryList':
        return a(i.list);
      case 'tvm.stackEntryNumber':
        return a(i.number);
      case 'tvm.numberDecimal':
        return BigInt(i.number);
      default:
        throw Error('Unsupported item type: ' + s);
    }
  }
  function e(i) {
    if (i[0] === 'num') {
      let s = i[1];
      return s.startsWith('-')
        ? { type: 'int', value: -BigInt(s.slice(1)) }
        : { type: 'int', value: BigInt(s) };
    } else {
      if (i[0] === 'null') return { type: 'null' };
      if (i[0] === 'cell')
        return {
          type: 'cell',
          cell: d.Cell.fromBoc(Buffer.from(i[1].bytes, 'base64'))[0],
        };
      if (i[0] === 'slice')
        return {
          type: 'slice',
          cell: d.Cell.fromBoc(Buffer.from(i[1].bytes, 'base64'))[0],
        };
      if (i[0] === 'builder')
        return {
          type: 'builder',
          cell: d.Cell.fromBoc(Buffer.from(i[1].bytes, 'base64'))[0],
        };
      if (i[0] === 'tuple' || i[0] === 'list')
        return i[1].elements.length === 0
          ? { type: 'null' }
          : { type: 'tuple', items: i[1].elements.map(a) };
      throw Error('Unsupported stack item type: ' + i[0]);
    }
  }
  function r(i) {
    let s = [];
    for (let f of i) s.push(e(f));
    return new d.TupleReader(s);
  }
  function n(i, s, f) {
    return {
      async getState() {
        let o = await i.getContractState(s),
          y = o.balance,
          v = o.lastTransaction
            ? {
                lt: BigInt(o.lastTransaction.lt),
                hash: Buffer.from(o.lastTransaction.hash, 'base64'),
              }
            : null,
          w = null,
          R;
        if (o.state === 'active')
          R = {
            type: 'active',
            code: o.code ? o.code : null,
            data: o.data ? o.data : null,
          };
        else if (o.state === 'uninitialized') R = { type: 'uninit' };
        else if (o.state === 'frozen')
          R = { type: 'frozen', stateHash: Buffer.alloc(0) };
        else throw Error('Unsupported state');
        if (o.extra_currencies && o.extra_currencies.length > 0) {
          w = {};
          for (let C of o.extra_currencies) w[C.id] = BigInt(C.amount);
        }
        return { balance: y, extracurrency: w, last: v, state: R };
      },
      async get(o, y) {
        if (typeof o != 'string')
          throw new Error(
            'Method name must be a string for TonClient provider',
          );
        return { stack: (await i.runMethod(s, o, y)).stack };
      },
      async external(o) {
        let y = null;
        f && !(await i.isContractDeployed(s)) && (y = f);
        const v = (0, d.external)({ to: s, init: y, body: o });
        let w = (0, d.beginCell)()
          .store((0, d.storeMessage)(v))
          .endCell()
          .toBoc();
        await i.sendFile(w);
      },
      async internal(o, y) {
        let v = null;
        f && !(await i.isContractDeployed(s)) && (v = f);
        let w = !0;
        y.bounce !== null && y.bounce !== void 0 && (w = y.bounce);
        let R;
        typeof y.value == 'string'
          ? (R = (0, d.toNano)(y.value))
          : (R = y.value);
        let C = null;
        (typeof y.body == 'string'
          ? (C = (0, d.comment)(y.body))
          : y.body && (C = y.body),
          await o.send({
            to: s,
            value: R,
            bounce: w,
            sendMode: y.sendMode,
            extracurrency: y.extracurrency,
            init: v,
            body: C,
          }));
      },
      open(o) {
        return (0, d.openContract)(o, (y) => n(i, y.address, y.init ?? null));
      },
      getTransactions(o, y, v, w) {
        return i.getTransactions(o, {
          limit: w ?? 100,
          lt: y.toString(),
          hash: v.toString('base64'),
          inclusive: !0,
        });
      },
    };
  }
  return Ma;
}
var Ut = {},
  vi = {},
  mu;
function Xf() {
  if (mu) return vi;
  ((mu = 1),
    Object.defineProperty(vi, '__esModule', { value: !0 }),
    (vi.toUrlSafe = t));
  function t(d) {
    for (; d.indexOf('/') >= 0;) d = d.replace('/', '_');
    for (; d.indexOf('+') >= 0;) d = d.replace('+', '-');
    for (; d.indexOf('=') >= 0;) d = d.replace('=', '');
    return d;
  }
  return vi;
}
var yu;
function eh() {
  if (yu) return Ut;
  yu = 1;
  var t =
      (Ut && Ut.__classPrivateFieldSet) ||
      function (Be, ge, ve, xe, Re) {
        if (xe === 'm') throw new TypeError('Private method is not writable');
        if (xe === 'a' && !Re)
          throw new TypeError('Private accessor was defined without a setter');
        if (typeof ge == 'function' ? Be !== ge || !Re : !ge.has(Be))
          throw new TypeError(
            'Cannot write private member to an object whose class did not declare it',
          );
        return (
          xe === 'a' ? Re.call(Be, ve) : Re ? (Re.value = ve) : ge.set(Be, ve),
          ve
        );
      },
    d =
      (Ut && Ut.__classPrivateFieldGet) ||
      function (Be, ge, ve, xe) {
        if (ve === 'a' && !xe)
          throw new TypeError('Private accessor was defined without a getter');
        if (typeof ge == 'function' ? Be !== ge || !xe : !ge.has(Be))
          throw new TypeError(
            'Cannot read private member from an object whose class did not declare it',
          );
        return ve === 'm'
          ? xe
          : ve === 'a'
            ? xe.call(Be)
            : xe
              ? xe.value
              : ge.get(Be);
      },
    u =
      (Ut && Ut.__importDefault) ||
      function (Be) {
        return Be && Be.__esModule ? Be : { default: Be };
      },
    a,
    e,
    r,
    n;
  (Object.defineProperty(Ut, '__esModule', { value: !0 }),
    (Ut.TonClient4 = void 0));
  const i = u(Wc()),
    s = at(),
    f = Xf(),
    o = Yc();
  let y = class {
    constructor(ge) {
      (a.set(this, void 0),
        e.set(this, void 0),
        r.set(this, void 0),
        n.set(this, void 0),
        t(this, n, i.default.create(), 'f'),
        t(this, a, ge.endpoint, 'f'),
        t(this, e, ge.timeout || 5e3, 'f'),
        t(this, r, ge.httpAdapter, 'f'),
        ge.requestInterceptor &&
          d(this, n, 'f').interceptors.request.use(ge.requestInterceptor));
    }
    async getLastBlock() {
      let ge = await d(this, n, 'f').get(d(this, a, 'f') + '/block/latest', {
          adapter: d(this, r, 'f'),
          timeout: d(this, e, 'f'),
        }),
        ve = w.safeParse(ge.data);
      if (!ve.success)
        throw Error(
          'Mailformed response: ' + ve.error.format()._errors.join(', '),
        );
      return ve.data;
    }
    async getBlock(ge) {
      let ve = await d(this, n, 'f').get(d(this, a, 'f') + '/block/' + ge, {
          adapter: d(this, r, 'f'),
          timeout: d(this, e, 'f'),
        }),
        xe = R.safeParse(ve.data);
      if (!xe.success) throw Error('Mailformed response');
      if (!xe.data.exist) throw Error('Block is out of scope');
      return xe.data.block;
    }
    async getBlockByUtime(ge) {
      let ve = await d(this, n, 'f').get(
          d(this, a, 'f') + '/block/utime/' + ge,
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        xe = R.safeParse(ve.data);
      if (!xe.success) throw Error('Mailformed response');
      if (!xe.data.exist) throw Error('Block is out of scope');
      return xe.data.block;
    }
    async getAccount(ge, ve) {
      let xe = await d(this, n, 'f').get(
          d(this, a, 'f') + '/block/' + ge + '/' + ve.toString({ urlSafe: !0 }),
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        Re = P.safeParse(xe.data);
      if (!Re.success) throw Error('Mailformed response');
      return Re.data;
    }
    async getAccountLite(ge, ve) {
      let xe = await d(this, n, 'f').get(
          d(this, a, 'f') +
            '/block/' +
            ge +
            '/' +
            ve.toString({ urlSafe: !0 }) +
            '/lite',
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        Re = E.safeParse(xe.data);
      if (!Re.success) throw Error('Mailformed response');
      return Re.data;
    }
    async isContractDeployed(ge, ve) {
      return (
        (await this.getAccountLite(ge, ve)).account.state.type === 'active'
      );
    }
    async isAccountChanged(ge, ve, xe) {
      let Re = await d(this, n, 'f').get(
          d(this, a, 'f') +
            '/block/' +
            ge +
            '/' +
            ve.toString({ urlSafe: !0 }) +
            '/changed/' +
            xe.toString(10),
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        _e = N.safeParse(Re.data);
      if (!_e.success) throw Error('Mailformed response');
      return _e.data;
    }
    async getAccountTransactions(ge, ve, xe) {
      let Re = await d(this, n, 'f').get(
          d(this, a, 'f') +
            '/account/' +
            ge.toString({ urlSafe: !0 }) +
            '/tx/' +
            ve.toString(10) +
            '/' +
            (0, f.toUrlSafe)(xe.toString('base64')),
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        _e = F.safeParse(Re.data);
      if (!_e.success) throw Error('Mailformed response');
      let Oe = _e.data,
        De = [],
        Ze = s.Cell.fromBoc(Buffer.from(Oe.boc, 'base64'));
      for (let Ke = 0; Ke < Oe.blocks.length; Ke++)
        De.push({
          block: Oe.blocks[Ke],
          tx: (0, s.loadTransaction)(Ze[Ke].beginParse()),
        });
      return De;
    }
    async getAccountTransactionsParsed(ge, ve, xe, Re = 20) {
      let _e = await d(this, n, 'f').get(
          d(this, a, 'f') +
            '/account/' +
            ge.toString({ urlSafe: !0 }) +
            '/tx/parsed/' +
            ve.toString(10) +
            '/' +
            (0, f.toUrlSafe)(xe.toString('base64')),
          {
            adapter: d(this, r, 'f'),
            timeout: d(this, e, 'f'),
            params: { count: Re },
          },
        ),
        Oe = L.safeParse(_e.data);
      if (!Oe.success) throw Error('Mailformed response');
      return Oe.data;
    }
    async getConfig(ge, ve) {
      let xe = '';
      ve && ve.length > 0 && (xe = '/' + [...ve].sort().join(','));
      let Re = await d(this, n, 'f').get(
          d(this, a, 'f') + '/block/' + ge + '/config' + xe,
          { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
        ),
        _e = G.safeParse(Re.data);
      if (!_e.success) throw Error('Mailformed response');
      return _e.data;
    }
    async runMethod(ge, ve, xe, Re) {
      let _e =
          Re && Re.length > 0
            ? '/' +
              (0, f.toUrlSafe)(
                (0, s.serializeTuple)(Re)
                  .toBoc({ idx: !1, crc32: !1 })
                  .toString('base64'),
              )
            : '',
        Oe =
          d(this, a, 'f') +
          '/block/' +
          ge +
          '/' +
          ve.toString({ urlSafe: !0 }) +
          '/run/' +
          encodeURIComponent(xe) +
          _e,
        De = await d(this, n, 'f').get(Oe, {
          adapter: d(this, r, 'f'),
          timeout: d(this, e, 'f'),
        }),
        Ze = D.safeParse(De.data);
      if (!Ze.success) throw Error('Mailformed response');
      let Ke = Ze.data.resultRaw
        ? (0, s.parseTuple)(
            s.Cell.fromBoc(Buffer.from(Ze.data.resultRaw, 'base64'))[0],
          )
        : [];
      return {
        exitCode: Ze.data.exitCode,
        result: Ke,
        resultRaw: Ze.data.resultRaw,
        block: Ze.data.block,
        shardBlock: Ze.data.shardBlock,
        reader: new s.TupleReader(Ke),
      };
    }
    async sendMessage(ge) {
      let ve = await d(this, n, 'f').post(
        d(this, a, 'f') + '/send',
        { boc: ge.toString('base64') },
        { adapter: d(this, r, 'f'), timeout: d(this, e, 'f') },
      );
      if (!te.safeParse(ve.data).success) throw Error('Mailformed response');
      return { status: ve.data.status };
    }
    open(ge) {
      return (0, s.openContract)(ge, (ve) =>
        v(this, null, ve.address, ve.init),
      );
    }
    openAt(ge, ve) {
      return (0, s.openContract)(ve, (xe) => v(this, ge, xe.address, xe.init));
    }
    provider(ge, ve) {
      return v(this, null, ge, ve ?? null);
    }
    providerAt(ge, ve, xe) {
      return v(this, ge, ve, xe ?? null);
    }
  };
  ((Ut.TonClient4 = y),
    (a = new WeakMap()),
    (e = new WeakMap()),
    (r = new WeakMap()),
    (n = new WeakMap()));
  function v(Be, ge, ve, xe) {
    return {
      async getState() {
        let Re = ge;
        Re === null && (Re = (await Be.getLastBlock()).last.seqno);
        let _e = await Be.getAccount(Re, ve),
          Oe = _e.account.last
            ? {
                lt: BigInt(_e.account.last.lt),
                hash: Buffer.from(_e.account.last.hash, 'base64'),
              }
            : null,
          De;
        if (_e.account.state.type === 'active')
          De = {
            type: 'active',
            code: _e.account.state.code
              ? Buffer.from(_e.account.state.code, 'base64')
              : null,
            data: _e.account.state.data
              ? Buffer.from(_e.account.state.data, 'base64')
              : null,
          };
        else if (_e.account.state.type === 'uninit') De = { type: 'uninit' };
        else if (_e.account.state.type === 'frozen')
          De = {
            type: 'frozen',
            stateHash: Buffer.from(_e.account.state.stateHash, 'base64'),
          };
        else throw Error('Unsupported state');
        let Ze = null;
        if (_e.account.balance.currencies) {
          Ze = {};
          let Ke = _e.account.balance.currencies;
          for (let [g, pe] of Object.entries(Ke)) Ze[Number(g)] = BigInt(pe);
        }
        return {
          balance: BigInt(_e.account.balance.coins),
          extracurrency: Ze,
          last: Oe,
          state: De,
        };
      },
      async get(Re, _e) {
        if (typeof Re != 'string')
          throw new Error(
            'Method name must be a string for TonClient4 provider',
          );
        let Oe = ge;
        Oe === null && (Oe = (await Be.getLastBlock()).last.seqno);
        let De = await Be.runMethod(Oe, ve, Re, _e);
        if (De.exitCode !== 0 && De.exitCode !== 1)
          throw Error('Exit code: ' + De.exitCode);
        return { stack: new s.TupleReader(De.result) };
      },
      async external(Re) {
        let _e = await Be.getLastBlock(),
          Oe = null;
        xe &&
          (await Be.getAccountLite(_e.last.seqno, ve)).account.state.type !==
            'active' &&
          (Oe = xe);
        const De = (0, s.external)({ to: ve, init: Oe, body: Re });
        let Ze = (0, s.beginCell)()
          .store((0, s.storeMessage)(De))
          .endCell()
          .toBoc();
        await Be.sendMessage(Ze);
      },
      async internal(Re, _e) {
        let Oe = await Be.getLastBlock(),
          De = null;
        xe &&
          (await Be.getAccountLite(Oe.last.seqno, ve)).account.state.type !==
            'active' &&
          (De = xe);
        let Ze = !0;
        _e.bounce !== null && _e.bounce !== void 0 && (Ze = _e.bounce);
        let Ke;
        typeof _e.value == 'string'
          ? (Ke = (0, s.toNano)(_e.value))
          : (Ke = _e.value);
        let g = null;
        (typeof _e.body == 'string'
          ? (g = (0, s.comment)(_e.body))
          : _e.body && (g = _e.body),
          await Re.send({
            to: ve,
            value: Ke,
            extracurrency: _e.extracurrency,
            bounce: Ze,
            sendMode: _e.sendMode,
            init: De,
            body: g,
          }));
      },
      open(Re) {
        return (0, s.openContract)(Re, (_e) =>
          v(Be, ge, _e.address, _e.init ?? null),
        );
      },
      async getTransactions(Re, _e, Oe, De) {
        const Ze = typeof De == 'number';
        if (Ze && De <= 0) return [];
        let Ke = [];
        do {
          const g = await Be.getAccountTransactions(Re, _e, Oe),
            pe = g[0].tx,
            [ne, be] = [pe.lt, pe.hash()];
          if (
            (Ke.length > 0 && ne === _e && be.equals(Oe) && g.shift(),
            g.length === 0)
          )
            break;
          const Me = g[g.length - 1].tx,
            [qe, je] = [Me.lt, Me.hash()];
          if (qe === _e && je.equals(Oe)) break;
          (Ke.push(...g.map((Ve) => Ve.tx)), (_e = qe), (Oe = je));
        } while (Ze && Ke.length < De);
        return (Ze && (Ke = Ke.slice(0, De)), Ke);
      },
    };
  }
  const w = o.z.object({
      last: o.z.object({
        seqno: o.z.number(),
        shard: o.z.string(),
        workchain: o.z.number(),
        fileHash: o.z.string(),
        rootHash: o.z.string(),
      }),
      init: o.z.object({ fileHash: o.z.string(), rootHash: o.z.string() }),
      stateRootHash: o.z.string(),
      now: o.z.number(),
    }),
    R = o.z.union([
      o.z.object({ exist: o.z.literal(!1) }),
      o.z.object({
        exist: o.z.literal(!0),
        block: o.z.object({
          shards: o.z.array(
            o.z.object({
              workchain: o.z.number(),
              seqno: o.z.number(),
              shard: o.z.string(),
              rootHash: o.z.string(),
              fileHash: o.z.string(),
              transactions: o.z.array(
                o.z.object({
                  account: o.z.string(),
                  hash: o.z.string(),
                  lt: o.z.string(),
                }),
              ),
            }),
          ),
        }),
      }),
    ]),
    C = o.z.object({
      lastPaid: o.z.number(),
      duePayment: o.z.union([o.z.null(), o.z.string()]),
      used: o.z.object({
        bits: o.z.number(),
        cells: o.z.number(),
        publicCells: o.z.number().optional(),
      }),
    }),
    P = o.z.object({
      account: o.z.object({
        state: o.z.union([
          o.z.object({ type: o.z.literal('uninit') }),
          o.z.object({
            type: o.z.literal('active'),
            code: o.z.union([o.z.string(), o.z.null()]),
            data: o.z.union([o.z.string(), o.z.null()]),
          }),
          o.z.object({ type: o.z.literal('frozen'), stateHash: o.z.string() }),
        ]),
        balance: o.z.object({
          coins: o.z.string(),
          currencies: o.z.record(o.z.string(), o.z.string()),
        }),
        last: o.z.union([
          o.z.null(),
          o.z.object({ lt: o.z.string(), hash: o.z.string() }),
        ]),
        storageStat: o.z.union([o.z.null(), C]),
      }),
      block: o.z.object({
        workchain: o.z.number(),
        seqno: o.z.number(),
        shard: o.z.string(),
        rootHash: o.z.string(),
        fileHash: o.z.string(),
      }),
    }),
    E = o.z.object({
      account: o.z.object({
        state: o.z.union([
          o.z.object({ type: o.z.literal('uninit') }),
          o.z.object({
            type: o.z.literal('active'),
            codeHash: o.z.string(),
            dataHash: o.z.string(),
          }),
          o.z.object({ type: o.z.literal('frozen'), stateHash: o.z.string() }),
        ]),
        balance: o.z.object({
          coins: o.z.string(),
          currencies: o.z.record(o.z.string(), o.z.string()),
        }),
        last: o.z.union([
          o.z.null(),
          o.z.object({ lt: o.z.string(), hash: o.z.string() }),
        ]),
        storageStat: o.z.union([o.z.null(), C]),
      }),
    }),
    N = o.z.object({
      changed: o.z.boolean(),
      block: o.z.object({
        workchain: o.z.number(),
        seqno: o.z.number(),
        shard: o.z.string(),
        rootHash: o.z.string(),
        fileHash: o.z.string(),
      }),
    }),
    D = o.z.object({
      exitCode: o.z.number(),
      resultRaw: o.z.union([o.z.string(), o.z.null()]),
      block: o.z.object({
        workchain: o.z.number(),
        seqno: o.z.number(),
        shard: o.z.string(),
        rootHash: o.z.string(),
        fileHash: o.z.string(),
      }),
      shardBlock: o.z.object({
        workchain: o.z.number(),
        seqno: o.z.number(),
        shard: o.z.string(),
        rootHash: o.z.string(),
        fileHash: o.z.string(),
      }),
    }),
    G = o.z.object({
      config: o.z.object({
        cell: o.z.string(),
        address: o.z.string(),
        globalBalance: o.z.object({ coins: o.z.string() }),
      }),
    }),
    te = o.z.object({ status: o.z.number() }),
    W = o.z.array(
      o.z.object({
        workchain: o.z.number(),
        seqno: o.z.number(),
        shard: o.z.string(),
        rootHash: o.z.string(),
        fileHash: o.z.string(),
      }),
    ),
    F = o.z.object({ blocks: W, boc: o.z.string() }),
    K = o.z.object({ bits: o.z.number(), data: o.z.string() }),
    Y = o.z.union([
      o.z.object({
        type: o.z.literal('internal'),
        value: o.z.string(),
        dest: o.z.string(),
        src: o.z.string(),
        bounced: o.z.boolean(),
        bounce: o.z.boolean(),
        ihrDisabled: o.z.boolean(),
        createdAt: o.z.number(),
        createdLt: o.z.string(),
        fwdFee: o.z.string(),
        ihrFee: o.z.string(),
      }),
      o.z.object({
        type: o.z.literal('external-in'),
        dest: o.z.string(),
        src: o.z.union([K, o.z.null()]),
        importFee: o.z.string(),
      }),
      o.z.object({
        type: o.z.literal('external-out'),
        dest: o.z.union([K, o.z.null()]),
      }),
    ]),
    ue = o.z.object({
      splitDepth: o.z.union([o.z.number(), o.z.null()]),
      code: o.z.union([o.z.string(), o.z.null()]),
      data: o.z.union([o.z.string(), o.z.null()]),
      special: o.z.union([
        o.z.object({ tick: o.z.boolean(), tock: o.z.boolean() }),
        o.z.null(),
      ]),
    }),
    we = o.z.object({
      body: o.z.string(),
      info: Y,
      init: o.z.union([ue, o.z.null()]),
    }),
    Ce = o.z.union([
      o.z.literal('uninitialized'),
      o.z.literal('frozen'),
      o.z.literal('active'),
      o.z.literal('non-existing'),
    ]),
    $ = o.z.union([
      o.z.object({ type: o.z.literal('comment'), comment: o.z.string() }),
      o.z.object({ type: o.z.literal('payload'), cell: o.z.string() }),
    ]),
    q = o.z.union([
      o.z.object({ kind: o.z.literal('ton'), amount: o.z.string() }),
      o.z.object({ kind: o.z.literal('token'), amount: o.z.string() }),
    ]),
    ie = o.z.union([
      o.z.literal('jetton::excesses'),
      o.z.literal('jetton::transfer'),
      o.z.literal('jetton::transfer_notification'),
      o.z.literal('deposit'),
      o.z.literal('deposit::ok'),
      o.z.literal('withdraw'),
      o.z.literal('withdraw::all'),
      o.z.literal('withdraw::delayed'),
      o.z.literal('withdraw::ok'),
      o.z.literal('airdrop'),
    ]),
    Se = o.z.object({
      type: ie,
      options: o.z.optional(o.z.record(o.z.string())),
    }),
    Ee = o.z.object({
      address: o.z.string(),
      comment: o.z.optional(o.z.string()),
      items: o.z.array(q),
      op: o.z.optional(Se),
    }),
    He = o.z.object({
      address: o.z.string(),
      lt: o.z.string(),
      hash: o.z.string(),
      prevTransaction: o.z.object({ lt: o.z.string(), hash: o.z.string() }),
      time: o.z.number(),
      outMessagesCount: o.z.number(),
      oldStatus: Ce,
      newStatus: Ce,
      fees: o.z.string(),
      update: o.z.object({ oldHash: o.z.string(), newHash: o.z.string() }),
      inMessage: o.z.union([we, o.z.null()]),
      outMessages: o.z.array(we),
      parsed: o.z.object({
        seqno: o.z.union([o.z.number(), o.z.null()]),
        body: o.z.union([$, o.z.null()]),
        status: o.z.union([
          o.z.literal('success'),
          o.z.literal('failed'),
          o.z.literal('pending'),
        ]),
        dest: o.z.union([o.z.string(), o.z.null()]),
        kind: o.z.union([o.z.literal('out'), o.z.literal('in')]),
        amount: o.z.string(),
        resolvedAddress: o.z.string(),
        bounced: o.z.boolean(),
        mentioned: o.z.array(o.z.string()),
      }),
      operation: Ee,
    }),
    L = o.z.object({ blocks: W, transactions: o.z.array(He) });
  return Ut;
}
var fn = {},
  Oa = {},
  tr = {},
  Ua = {},
  ja = {},
  bu;
function Qc() {
  if (bu) return ja;
  ((bu = 1),
    Object.defineProperty(ja, '__esModule', { value: !0 }),
    (ja.loadWalletIdV5Beta = u),
    (ja.storeWalletIdV5Beta = a));
  const t = at(),
    d = { v5: 0 };
  function u(e) {
    var y;
    const r = new t.BitReader(
        new t.BitString(
          typeof e == 'bigint'
            ? Buffer.from(e.toString(16), 'hex')
            : e instanceof t.Slice
              ? e.loadBuffer(10)
              : e,
          0,
          80,
        ),
      ),
      n = r.loadInt(32),
      i = r.loadInt(8),
      s = r.loadUint(8),
      f = r.loadUint(32),
      o =
        (y = Object.entries(d).find(([v, w]) => w === s)) == null
          ? void 0
          : y[0];
    if (o === void 0)
      throw new Error(
        `Can't deserialize walletId: unknown wallet version ${s}`,
      );
    return {
      networkGlobalId: n,
      workchain: i,
      walletVersion: o,
      subwalletNumber: f,
    };
  }
  function a(e) {
    return (r) => {
      (r.storeInt(e.networkGlobalId, 32),
        r.storeInt(e.workchain, 8),
        r.storeUint(d[e.walletVersion], 8),
        r.storeUint(e.subwalletNumber, 32));
    };
  }
  return ja;
}
var wu;
function Xc() {
  if (wu) return Ua;
  ((wu = 1),
    Object.defineProperty(Ua, '__esModule', { value: !0 }),
    (Ua.WalletContractV5Beta = void 0));
  const t = at(),
    d = zt(),
    u = Qc();
  class a {
    static create(r) {
      var i, s, f, o;
      const n = {
        networkGlobalId:
          ((i = r.walletId) == null ? void 0 : i.networkGlobalId) ?? -239,
        workchain:
          ((s = r == null ? void 0 : r.walletId) == null
            ? void 0
            : s.workchain) ?? 0,
        subwalletNumber:
          ((f = r == null ? void 0 : r.walletId) == null
            ? void 0
            : f.subwalletNumber) ?? 0,
        walletVersion:
          ((o = r == null ? void 0 : r.walletId) == null
            ? void 0
            : o.walletVersion) ?? 'v5',
      };
      return new a(n, r.publicKey, r.domain);
    }
    constructor(r, n, i) {
      ((this.walletId = r),
        (this.publicKey = n),
        (this.walletId = r),
        (this.domain = i));
      let s = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAIwAIQgLkzzsvTG1qYeoPK1RH0mZ4WyavNjfbLe7mvNGqgm80Eg3NjhE=',
            'base64',
          ),
        )[0],
        f = (0, t.beginCell)()
          .storeInt(0, 33)
          .store((0, u.storeWalletIdV5Beta)(this.walletId))
          .storeBuffer(this.publicKey, 32)
          .storeBit(0)
          .endCell();
      ((this.init = { code: s, data: f }),
        (this.address = (0, t.contractAddress)(this.walletId.workchain, {
          code: s,
          data: f,
        })));
    }
    async getBalance(r) {
      return (await r.getState()).balance;
    }
    async getSeqno(r) {
      return (await r.getState()).state.type === 'active'
        ? (await r.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async getExtensions(r) {
      return (await r.getState()).state.type === 'active'
        ? (await r.get('get_extensions', [])).stack.readCellOpt()
        : null;
    }
    async getExtensionsArray(r) {
      const n = await this.getExtensions(r);
      if (!n) return [];
      const i = t.Dictionary.loadDirect(
        t.Dictionary.Keys.BigUint(256),
        t.Dictionary.Values.BigInt(8),
        n,
      );
      return i.keys().map((s) => {
        const f = i.get(s),
          o = s ^ (f + 1n);
        return t.Address.parseRaw(`${f}:${o.toString(16).padStart(64, '0')}`);
      });
    }
    async getIsSecretKeyAuthEnabled(r) {
      return (
        (
          await r.get('get_is_signature_auth_allowed', [])
        ).stack.readNumber() !== 0
      );
    }
    async send(r, n) {
      await r.external(n);
    }
    async sendTransfer(r, n) {
      const i = await this.createTransfer(n);
      await this.send(r, i);
    }
    async sendAddExtension(r, n) {
      const i = await this.createAddExtension(n);
      await this.send(r, i);
    }
    async sendRemoveExtension(r, n) {
      const i = await this.createRemoveExtension(n);
      await this.send(r, i);
    }
    async sendActionsBatch(r, n) {
      const i = await this.createRequest(n);
      await this.send(r, i);
    }
    createActions(r) {
      return r.messages.map((i) => ({
        type: 'sendMsg',
        mode: r.sendMode,
        outMsg: i,
      }));
    }
    createTransfer(r) {
      return this.createRequest({
        ...r,
        actions: this.createActions({
          messages: r.messages,
          sendMode: r.sendMode,
        }),
      });
    }
    createAddExtension(r) {
      return this.createRequest({
        ...r,
        actions: [{ type: 'addExtension', address: r.extensionAddress }],
      });
    }
    createRemoveExtension(r) {
      return this.createRequest({
        ...r,
        actions: [{ type: 'removeExtension', address: r.extensionAddress }],
      });
    }
    createRequest(r) {
      return r.authType === 'extension'
        ? (0, d.createWalletTransferV5Beta)(r)
        : (0, d.createWalletTransferV5Beta)({
            ...r,
            walletId: (0, u.storeWalletIdV5Beta)(this.walletId),
            domain: this.domain,
          });
    }
    sender(r, n) {
      return {
        send: async (i) => {
          let s = await this.getSeqno(r),
            f = this.createTransfer({
              seqno: s,
              secretKey: n,
              sendMode:
                i.sendMode ??
                t.SendMode.PAY_GAS_SEPARATELY + t.SendMode.IGNORE_ERRORS,
              messages: [
                (0, t.internal)({
                  to: i.to,
                  value: i.value,
                  extracurrency: i.extracurrency,
                  init: i.init,
                  body: i.body,
                  bounce: i.bounce,
                }),
              ],
            });
          await this.send(r, f);
        },
      };
    }
  }
  return (
    (Ua.WalletContractV5Beta = a),
    (a.OpCodes = {
      auth_extension: 1702392942,
      auth_signed_external: 1936287598,
      auth_signed_internal: 1936289396,
    }),
    Ua
  );
}
var hn = {},
  za = {},
  vu;
function ed() {
  if (vu) return za;
  ((vu = 1),
    Object.defineProperty(za, '__esModule', { value: !0 }),
    (za.isOutActionExtended = t),
    (za.isOutActionBasic = d));
  function t(u) {
    return (
      u.type === 'setIsPublicKeyEnabled' ||
      u.type === 'addExtension' ||
      u.type === 'removeExtension'
    );
  }
  function d(u) {
    return !t(u);
  }
  return za;
}
var _u;
function td() {
  if (_u) return hn;
  ((_u = 1),
    Object.defineProperty(hn, '__esModule', { value: !0 }),
    (hn.storeOutActionExtendedV5Beta = s),
    (hn.loadOutActionV5BetaExtended = f),
    (hn.storeOutListExtendedV5Beta = o),
    (hn.loadOutListExtendedV5Beta = y));
  const t = at(),
    d = ed(),
    u = 550222170;
  function a(v) {
    return (w) => {
      w.storeUint(u, 32).storeUint(v.isEnabled ? 1 : 0, 1);
    };
  }
  const e = 474012575;
  function r(v) {
    return (w) => {
      w.storeUint(e, 32).storeAddress(v.address);
    };
  }
  const n = 1588524196;
  function i(v) {
    return (w) => {
      w.storeUint(n, 32).storeAddress(v.address);
    };
  }
  function s(v) {
    switch (v.type) {
      case 'setIsPublicKeyEnabled':
        return a(v);
      case 'addExtension':
        return r(v);
      case 'removeExtension':
        return i(v);
      default:
        throw new Error('Unknown action type' + (v == null ? void 0 : v.type));
    }
  }
  function f(v) {
    const w = v.loadUint(32);
    switch (w) {
      case u:
        return { type: 'setIsPublicKeyEnabled', isEnabled: !!v.loadUint(1) };
      case e:
        return { type: 'addExtension', address: v.loadAddress() };
      case n:
        return { type: 'removeExtension', address: v.loadAddress() };
      default:
        throw new Error(`Unknown extended out action tag 0x${w.toString(16)}`);
    }
  }
  function o(v) {
    const [w, ...R] = v;
    if (!w || !(0, d.isOutActionExtended)(w)) {
      if (v.some(d.isOutActionExtended))
        throw new Error(
          "Can't serialize actions list: all extended actions must be placed before out actions",
        );
      return (C) => {
        C.storeUint(0, 1).storeRef(
          (0, t.beginCell)()
            .store((0, t.storeOutList)(v))
            .endCell(),
        );
      };
    }
    return (C) => {
      C.storeUint(1, 1)
        .store(s(w))
        .storeRef((0, t.beginCell)().store(o(R)).endCell());
    };
  }
  function y(v) {
    const w = [];
    for (; v.loadUint(1);) {
      const C = f(v);
      (w.push(C), (v = v.loadRef().beginParse()));
    }
    const R = (0, t.loadOutList)(v.loadRef().beginParse());
    if (R.some((C) => C.type === 'setCode'))
      throw new Error(
        "Can't deserialize actions list: only sendMsg actions are allowed for wallet v5",
      );
    return w.concat(R);
  }
  return hn;
}
var _i = {},
  ku;
function th() {
  if (ku) return _i;
  ((ku = 1),
    Object.defineProperty(_i, '__esModule', { value: !0 }),
    (_i.signPayload = d));
  const t = at();
  function d(u, a, e) {
    if ('secretKey' in u) {
      const r = (0, t.domainSign)({
        data: a.endCell().hash(),
        secretKey: u.secretKey,
        domain: u.domain,
      });
      return e(r, a);
    } else return u.signer(a.endCell()).then((r) => e(r, a));
  }
  return _i;
}
var Da = {},
  In = {},
  Cu;
function rd() {
  if (Cu) return In;
  ((Cu = 1),
    Object.defineProperty(In, '__esModule', { value: !0 }),
    (In.isWalletIdV5R1ClientContext = d),
    (In.loadWalletIdV5R1 = a),
    (In.storeWalletIdV5R1 = e));
  const t = at();
  function d(r) {
    return typeof r != 'number';
  }
  const u = { v5r1: 0 };
  function a(r, n) {
    var y;
    const i = new t.BitReader(
        new t.BitString(
          typeof r == 'bigint'
            ? Buffer.from(r.toString(16).padStart(8, '0'), 'hex')
            : r instanceof t.Slice
              ? r.loadBuffer(4)
              : r,
          0,
          32,
        ),
      ).loadInt(32),
      s = BigInt(i) ^ BigInt(n),
      f = (0, t.beginCell)().storeInt(s, 32).endCell().beginParse();
    if (f.loadUint(1)) {
      const v = f.loadInt(8),
        w = f.loadUint(8),
        R = f.loadUint(15),
        C =
          (y = Object.entries(u).find(([P, E]) => E === w)) == null
            ? void 0
            : y[0];
      if (C === void 0)
        throw new Error(
          `Can't deserialize walletId: unknown wallet version ${w}`,
        );
      return {
        networkGlobalId: n,
        context: { walletVersion: C, workchain: v, subwalletNumber: R },
      };
    } else {
      const v = f.loadUint(31);
      return { networkGlobalId: n, context: v };
    }
  }
  function e(r) {
    return (n) => {
      let i;
      return (
        d(r.context)
          ? (i = (0, t.beginCell)()
              .storeUint(1, 1)
              .storeInt(r.context.workchain, 8)
              .storeUint(u[r.context.walletVersion], 8)
              .storeUint(r.context.subwalletNumber, 15)
              .endCell()
              .beginParse()
              .loadInt(32))
          : (i = (0, t.beginCell)()
              .storeUint(0, 1)
              .storeUint(r.context, 31)
              .endCell()
              .beginParse()
              .loadInt(32)),
        n.storeInt(BigInt(r.networkGlobalId) ^ BigInt(i), 32)
      );
    };
  }
  return In;
}
var Su;
function nd() {
  if (Su) return Da;
  ((Su = 1),
    Object.defineProperty(Da, '__esModule', { value: !0 }),
    (Da.WalletContractV5R1 = void 0));
  const t = at(),
    d = zt(),
    u = rd();
  class a {
    static create(r) {
      var i, s, f;
      let n = 0;
      return (
        'workchain' in r && r.workchain != null && (n = r.workchain),
        (i = r.walletId) != null &&
          i.context &&
          (0, u.isWalletIdV5R1ClientContext)(r.walletId.context) &&
          r.walletId.context.workchain != null &&
          (n = r.walletId.context.workchain),
        new a(
          n,
          r.publicKey,
          {
            networkGlobalId:
              ((s = r.walletId) == null ? void 0 : s.networkGlobalId) ?? -239,
            context: ((f = r.walletId) == null ? void 0 : f.context) ?? {
              workchain: 0,
              walletVersion: 'v5r1',
              subwalletNumber: 0,
            },
          },
          r.domain,
        )
      );
    }
    constructor(r, n, i, s, f) {
      ((this.publicKey = n),
        (this.walletId = i),
        (this.globalId = f),
        (this.walletId = i),
        (this.domain = s));
      let o = t.Cell.fromBoc(
          Buffer.from(
            'b5ee9c7241021401000281000114ff00f4a413f4bcf2c80b01020120020d020148030402dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120050c020120060902016e07080019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00201480a0b0017b325fb51341c75c875c2c7e00011b262fb513435c280200019be5f0f6a2684080a0eb90fa02c0102f20e011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0b4d6c35e',
            'hex',
          ),
        )[0],
        y = (0, t.beginCell)()
          .storeUint(1, 1)
          .storeUint(0, 32)
          .store((0, u.storeWalletIdV5R1)(this.walletId))
          .storeBuffer(this.publicKey, 32)
          .storeBit(0)
          .endCell();
      ((this.init = { code: o, data: y }),
        (this.address = (0, t.contractAddress)(r, { code: o, data: y })));
    }
    async getBalance(r) {
      return (await r.getState()).balance;
    }
    async getSeqno(r) {
      return (await r.getState()).state.type === 'active'
        ? (await r.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async getExtensions(r) {
      return (await r.getState()).state.type === 'active'
        ? (await r.get('get_extensions', [])).stack.readCellOpt()
        : null;
    }
    async getExtensionsArray(r) {
      const n = await this.getExtensions(r);
      return n
        ? t.Dictionary.loadDirect(
            t.Dictionary.Keys.BigUint(256),
            t.Dictionary.Values.BigInt(1),
            n,
          )
            .keys()
            .map((s) => {
              const f = this.address.workChain;
              return t.Address.parseRaw(
                `${f}:${s.toString(16).padStart(64, '0')}`,
              );
            })
        : [];
    }
    async getIsSecretKeyAuthEnabled(r) {
      return (await r.get('is_signature_allowed', [])).stack.readBoolean();
    }
    async send(r, n) {
      await r.external(n);
    }
    async sendTransfer(r, n) {
      const i = await this.createTransfer(n);
      await this.send(r, i);
    }
    async sendAddExtension(r, n) {
      const i = await this.createAddExtension(n);
      await this.send(r, i);
    }
    async sendRemoveExtension(r, n) {
      const i = await this.createRemoveExtension(n);
      await this.send(r, i);
    }
    createActions(r) {
      return r.messages.map((i) => ({
        type: 'sendMsg',
        mode: r.sendMode,
        outMsg: i,
      }));
    }
    createTransfer(r) {
      return this.createRequest({
        actions: this.createActions({
          messages: r.messages,
          sendMode: r.sendMode,
        }),
        ...r,
      });
    }
    createAddExtension(r) {
      return this.createRequest({
        actions: [{ type: 'addExtension', address: r.extensionAddress }],
        ...r,
      });
    }
    createRemoveExtension(r) {
      return this.createRequest({
        actions: [{ type: 'removeExtension', address: r.extensionAddress }],
        ...r,
      });
    }
    createRequest(r) {
      return r.authType === 'extension'
        ? (0, d.createWalletTransferV5R1)(r)
        : (0, d.createWalletTransferV5R1)({
            ...r,
            walletId: (0, u.storeWalletIdV5R1)(this.walletId),
            domain: this.domain,
          });
    }
    sender(r, n) {
      return {
        send: async (i) => {
          let s = await this.getSeqno(r),
            f = this.createTransfer({
              seqno: s,
              secretKey: n,
              sendMode:
                i.sendMode ??
                t.SendMode.PAY_GAS_SEPARATELY + t.SendMode.IGNORE_ERRORS,
              messages: [
                (0, t.internal)({
                  to: i.to,
                  value: i.value,
                  extracurrency: i.extracurrency,
                  init: i.init,
                  body: i.body,
                  bounce: i.bounce,
                }),
              ],
            });
          await this.send(r, f);
        },
      };
    }
  }
  return (
    (Da.WalletContractV5R1 = a),
    (a.OpCodes = {
      auth_extension: 1702392942,
      auth_signed_external: 1936287598,
      auth_signed_internal: 1936289396,
    }),
    Da
  );
}
var rr = {},
  Bu;
function ad() {
  if (Bu) return rr;
  ((Bu = 1),
    Object.defineProperty(rr, '__esModule', { value: !0 }),
    (rr.storeOutActionExtendedV5R1 = s),
    (rr.loadOutActionExtendedV5R1 = f),
    (rr.storeOutListExtendedV5R1 = o),
    (rr.loadOutListExtendedV5R1 = v),
    (rr.toSafeV5R1SendMode = w),
    (rr.patchV5R1ActionsSendMode = R));
  const t = at(),
    d = ed(),
    u = 4;
  function a(C) {
    return (P) => {
      P.storeUint(u, 8).storeUint(C.isEnabled ? 1 : 0, 1);
    };
  }
  const e = 2;
  function r(C) {
    return (P) => {
      P.storeUint(e, 8).storeAddress(C.address);
    };
  }
  const n = 3;
  function i(C) {
    return (P) => {
      P.storeUint(n, 8).storeAddress(C.address);
    };
  }
  function s(C) {
    switch (C.type) {
      case 'setIsPublicKeyEnabled':
        return a(C);
      case 'addExtension':
        return r(C);
      case 'removeExtension':
        return i(C);
      default:
        throw new Error('Unknown action type' + (C == null ? void 0 : C.type));
    }
  }
  function f(C) {
    const P = C.loadUint(8);
    switch (P) {
      case u:
        return { type: 'setIsPublicKeyEnabled', isEnabled: !!C.loadUint(1) };
      case e:
        return { type: 'addExtension', address: C.loadAddress() };
      case n:
        return { type: 'removeExtension', address: C.loadAddress() };
      default:
        throw new Error(`Unknown extended out action tag 0x${P.toString(16)}`);
    }
  }
  function o(C) {
    const P = C.filter(d.isOutActionExtended),
      E = C.filter(d.isOutActionBasic);
    return (N) => {
      const D = E.length
        ? (0, t.beginCell)().store((0, t.storeOutList)(E))
        : null;
      if ((N.storeMaybeRef(D), P.length === 0)) N.storeUint(0, 1);
      else {
        const [G, ...te] = P;
        (N.storeUint(1, 1).store(s(G)), te.length > 0 && N.storeRef(y(te)));
      }
    };
  }
  function y(C) {
    const [P, ...E] = C;
    let N = (0, t.beginCell)().store(s(P));
    return (E.length > 0 && (N = N.storeRef(y(E))), N.endCell());
  }
  function v(C) {
    const P = [],
      E = C.loadMaybeRef();
    if (E) {
      const N = (0, t.loadOutList)(E.beginParse());
      if (N.some((D) => D.type !== 'sendMsg'))
        throw new Error(
          "Can't deserialize actions list: only sendMsg actions are allowed for wallet v5r1",
        );
      P.push(...N);
    }
    if (C.loadBoolean()) {
      const N = f(C);
      P.push(N);
    }
    for (; C.remainingRefs > 0;) {
      C = C.loadRef().beginParse();
      const N = f(C);
      P.push(N);
    }
    return P;
  }
  function w(C, P) {
    return P === 'internal' || P === 'extension'
      ? C
      : C | t.SendMode.IGNORE_ERRORS;
  }
  function R(C, P) {
    return C.map((E) =>
      E.type === 'sendMsg' ? { ...E, mode: w(E.mode, P) } : E,
    );
  }
  return rr;
}
var Na = {},
  Pu;
function id() {
  if (Pu) return Na;
  ((Pu = 1),
    Object.defineProperty(Na, '__esModule', { value: !0 }),
    (Na.storeExtendedAction = d),
    (Na.loadExtendedAction = u));
  const t = at();
  function d(a) {
    return (e) => {
      switch (a.type) {
        case 'sendMsg':
          e.storeUint(0, 8);
          for (let r of a.messages)
            (e.storeUint(a.sendMode ?? t.SendMode.NONE, 8),
              e.storeRef(
                (0, t.beginCell)().store((0, t.storeMessageRelaxed)(r)),
              ));
          break;
        case 'addAndDeployPlugin':
          (e.storeUint(1, 8),
            e.storeInt(a.workchain, 8),
            e.storeCoins(a.forwardAmount),
            e.storeRef(
              (0, t.beginCell)().store((0, t.storeStateInit)(a.stateInit)),
            ),
            e.storeRef(a.body));
          break;
        case 'addPlugin':
          (e.storeUint(2, 8),
            e.storeInt(a.address.workChain, 8),
            e.storeBuffer(a.address.hash),
            e.storeCoins(a.forwardAmount),
            e.storeUint(a.queryId ?? 0n, 64));
          break;
        case 'removePlugin':
          (e.storeUint(3, 8),
            e.storeInt(a.address.workChain, 8),
            e.storeBuffer(a.address.hash),
            e.storeCoins(a.forwardAmount),
            e.storeUint(a.queryId ?? 0n, 64));
          break;
        default:
          throw new Error('Unsupported plugin action');
      }
    };
  }
  function u(a) {
    const e = a.loadUint(8);
    switch (e) {
      case 0: {
        const r = [];
        let n;
        for (; a.remainingRefs > 0;) {
          if (a.remainingBits < 8)
            throw new Error(
              'Invalid sendMsg action: insufficient bits for send mode',
            );
          const i = a.loadUint(8),
            s = a.loadRef(),
            f = (0, t.loadMessageRelaxed)(s.beginParse());
          if (n === void 0) n = i;
          else if (n !== i)
            throw new Error(
              'Invalid sendMsg action: mixed send modes are not supported',
            );
          r.push(f);
        }
        return { type: 'sendMsg', messages: r, sendMode: n };
      }
      case 1: {
        const r = a.loadInt(8),
          n = a.loadCoins(),
          i = (0, t.loadStateInit)(a.loadRef().beginParse()),
          s = a.loadRef();
        return {
          type: 'addAndDeployPlugin',
          workchain: r,
          stateInit: i,
          body: s,
          forwardAmount: n,
        };
      }
      case 2: {
        const r = a.loadInt(8),
          n = a.loadBuffer(32),
          i = a.loadCoins(),
          s = a.loadUintBig(64);
        return {
          type: 'addPlugin',
          address: new t.Address(r, n),
          forwardAmount: i,
          queryId: s === 0n ? void 0 : s,
        };
      }
      case 3: {
        const r = a.loadInt(8),
          n = a.loadBuffer(32),
          i = a.loadCoins(),
          s = a.loadUintBig(64);
        return {
          type: 'removePlugin',
          address: new t.Address(r, n),
          forwardAmount: i,
          queryId: s === 0n ? void 0 : s,
        };
      }
      default:
        throw new Error(`Unsupported action with opcode ${e}`);
    }
  }
  return Na;
}
var Au;
function zt() {
  if (Au) return tr;
  ((Au = 1),
    Object.defineProperty(tr, '__esModule', { value: !0 }),
    (tr.createWalletTransferV1 = f),
    (tr.createWalletTransferV2 = o),
    (tr.createWalletTransferV3 = y),
    (tr.createWalletTransferV4 = v),
    (tr.createWalletTransferV5Beta = w),
    (tr.createWalletTransferV5R1 = R));
  const t = at(),
    d = Xc(),
    u = td(),
    a = th(),
    e = nd(),
    r = ad(),
    n = id();
  function i(C, P) {
    return (0, t.beginCell)().storeBuffer(C).storeBuilder(P).endCell();
  }
  function s(C, P) {
    return (0, t.beginCell)().storeBuilder(P).storeBuffer(C).endCell();
  }
  function f(C) {
    let P = (0, t.beginCell)().storeUint(C.seqno, 32);
    C.message &&
      (P.storeUint(C.sendMode, 8),
      P.storeRef(
        (0, t.beginCell)().store((0, t.storeMessageRelaxed)(C.message)),
      ));
    let E = (0, t.domainSign)({
      data: P.endCell().hash(),
      secretKey: C.secretKey,
      domain: C.domain,
    });
    return (0, t.beginCell)().storeBuffer(E).storeBuilder(P).endCell();
  }
  function o(C) {
    if (C.messages.length > 4)
      throw Error('Maximum number of messages in a single transfer is 4');
    let P = (0, t.beginCell)().storeUint(C.seqno, 32);
    P.storeUint(C.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
    for (let D of C.messages)
      (P.storeUint(C.sendMode, 8),
        P.storeRef((0, t.beginCell)().store((0, t.storeMessageRelaxed)(D))));
    let E = (0, t.domainSign)({
      data: P.endCell().hash(),
      secretKey: C.secretKey,
      domain: C.domain,
    });
    return (0, t.beginCell)().storeBuffer(E).storeBuilder(P).endCell();
  }
  function y(C) {
    if (C.messages.length > 4)
      throw Error('Maximum number of messages in a single transfer is 4');
    let P = (0, t.beginCell)().storeUint(C.walletId, 32);
    (P.storeUint(C.timeout || Math.floor(Date.now() / 1e3) + 60, 32),
      P.storeUint(C.seqno, 32));
    for (let E of C.messages)
      (P.storeUint(C.sendMode, 8),
        P.storeRef((0, t.beginCell)().store((0, t.storeMessageRelaxed)(E))));
    return (0, a.signPayload)(C, P, i);
  }
  function v(C) {
    let P = (0, t.beginCell)().storeUint(C.walletId, 32);
    return (
      P.storeUint(C.timeout || Math.floor(Date.now() / 1e3) + 60, 32),
      P.storeUint(C.seqno, 32),
      P.store((0, n.storeExtendedAction)(C.action)),
      (0, a.signPayload)(C, P, i)
    );
  }
  function w(C) {
    if (C.actions.length > 255)
      throw Error('Maximum number of OutActions in a single request is 255');
    if (C.authType === 'extension')
      return (0, t.beginCell)()
        .storeUint(d.WalletContractV5Beta.OpCodes.auth_extension, 32)
        .store((0, u.storeOutListExtendedV5Beta)(C.actions))
        .endCell();
    const P = (0, t.beginCell)()
      .storeUint(
        C.authType === 'internal'
          ? d.WalletContractV5Beta.OpCodes.auth_signed_internal
          : d.WalletContractV5Beta.OpCodes.auth_signed_external,
        32,
      )
      .store(C.walletId);
    return (
      P.storeUint(C.timeout || Math.floor(Date.now() / 1e3) + 60, 32),
      P.storeUint(C.seqno, 32).store(
        (0, u.storeOutListExtendedV5Beta)(C.actions),
      ),
      (0, a.signPayload)(C, P, s)
    );
  }
  function R(C) {
    if (C.actions.length > 255)
      throw Error('Maximum number of OutActions in a single request is 255');
    if (((C = { ...C }), C.authType === 'extension'))
      return (0, t.beginCell)()
        .storeUint(e.WalletContractV5R1.OpCodes.auth_extension, 32)
        .storeUint(C.queryId ?? 0, 64)
        .store((0, r.storeOutListExtendedV5R1)(C.actions))
        .endCell();
    C.actions = (0, r.patchV5R1ActionsSendMode)(C.actions, C.authType);
    const P = (0, t.beginCell)()
      .storeUint(
        C.authType === 'internal'
          ? e.WalletContractV5R1.OpCodes.auth_signed_internal
          : e.WalletContractV5R1.OpCodes.auth_signed_external,
        32,
      )
      .store(C.walletId);
    return (
      P.storeUint(C.timeout || Math.floor(Date.now() / 1e3) + 60, 32),
      P.storeUint(C.seqno, 32).store(
        (0, r.storeOutListExtendedV5R1)(C.actions),
      ),
      (0, a.signPayload)(C, P, s)
    );
  }
  return tr;
}
var xu;
function rh() {
  if (xu) return Oa;
  ((xu = 1),
    Object.defineProperty(Oa, '__esModule', { value: !0 }),
    (Oa.WalletContractV1R1 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.domain);
    }
    constructor(e, r, n) {
      ((this.workchain = e), (this.publicKey = r), (this.domain = n));
      let i = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEARAAAhP8AIN2k8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVEH98Ik=',
            'base64',
          ),
        )[0],
        s = (0, t.beginCell)().storeUint(0, 32).storeBuffer(r).endCell();
      ((this.init = { code: i, data: s }),
        (this.address = (0, t.contractAddress)(e, { code: i, data: s })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      let r = await e.getState();
      return r.state.type === 'active'
        ? t.Cell.fromBoc(r.state.data)[0].beginParse().loadUint(32)
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      let r = t.SendMode.PAY_GAS_SEPARATELY;
      return (
        e.sendMode !== null && e.sendMode !== void 0 && (r = e.sendMode),
        (0, d.createWalletTransferV1)({
          seqno: e.seqno,
          sendMode: r,
          secretKey: e.secretKey,
          message: e.message,
          domain: this.domain,
        })
      );
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              message: (0, t.internal)({
                to: n.to,
                value: n.value,
                extracurrency: n.extracurrency,
                init: n.init,
                body: n.body,
                bounce: n.bounce,
              }),
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((Oa.WalletContractV1R1 = u), Oa);
}
var Iu;
function nh() {
  return (
    Iu ||
      ((Iu = 1),
      (function (t) {
        var d =
            (fn && fn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (fn && fn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(rh(), t));
      })(fn)),
    fn
  );
}
var gn = {},
  qa = {},
  Eu;
function ah() {
  if (Eu) return qa;
  ((Eu = 1),
    Object.defineProperty(qa, '__esModule', { value: !0 }),
    (qa.WalletContractV1R2 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.domain);
    }
    constructor(e, r, n) {
      ((this.workchain = e), (this.publicKey = r), (this.domain = n));
      let i = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAUwAAov8AIN0gggFMl7qXMO1E0NcLH+Ck8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVNDieG8=',
            'base64',
          ),
        )[0],
        s = (0, t.beginCell)().storeUint(0, 32).storeBuffer(r).endCell();
      ((this.init = { code: i, data: s }),
        (this.address = (0, t.contractAddress)(e, { code: i, data: s })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      let r = t.SendMode.PAY_GAS_SEPARATELY;
      return (
        e.sendMode !== null && e.sendMode !== void 0 && (r = e.sendMode),
        (0, d.createWalletTransferV1)({
          seqno: e.seqno,
          sendMode: r,
          secretKey: e.secretKey,
          message: e.message,
          domain: this.domain,
        })
      );
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              message: (0, t.internal)({
                to: n.to,
                value: n.value,
                extracurrency: n.extracurrency,
                init: n.init,
                body: n.body,
                bounce: n.bounce,
              }),
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((qa.WalletContractV1R2 = u), qa);
}
var Tu;
function ih() {
  return (
    Tu ||
      ((Tu = 1),
      (function (t) {
        var d =
            (gn && gn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (gn && gn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(ah(), t));
      })(gn)),
    gn
  );
}
var pn = {},
  La = {},
  Ru;
function oh() {
  if (Ru) return La;
  ((Ru = 1),
    Object.defineProperty(La, '__esModule', { value: !0 }),
    (La.WalletContractV1R3 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.domain);
    }
    constructor(e, r, n) {
      ((this.workchain = e), (this.publicKey = r), (this.domain = n));
      let i = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAXwAAuv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVLW4bkI=',
            'base64',
          ),
        )[0],
        s = (0, t.beginCell)().storeUint(0, 32).storeBuffer(r).endCell();
      ((this.init = { code: i, data: s }),
        (this.address = (0, t.contractAddress)(e, { code: i, data: s })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      let r = t.SendMode.PAY_GAS_SEPARATELY;
      return (
        e.sendMode !== null && e.sendMode !== void 0 && (r = e.sendMode),
        (0, d.createWalletTransferV1)({
          seqno: e.seqno,
          sendMode: r,
          secretKey: e.secretKey,
          message: e.message,
          domain: this.domain,
        })
      );
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              message: (0, t.internal)({
                to: n.to,
                value: n.value,
                init: n.init,
                body: n.body,
                bounce: n.bounce,
              }),
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((La.WalletContractV1R3 = u), La);
}
var Mu;
function sh() {
  return (
    Mu ||
      ((Mu = 1),
      (function (t) {
        var d =
            (pn && pn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (pn && pn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(oh(), t));
      })(pn)),
    pn
  );
}
var mn = {},
  Va = {},
  Ou;
function lh() {
  if (Ou) return Va;
  ((Ou = 1),
    Object.defineProperty(Va, '__esModule', { value: !0 }),
    (Va.WalletContractV2R1 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.domain);
    }
    constructor(e, r, n) {
      ((this.workchain = e), (this.publicKey = r), (this.domain = n));
      let i = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAVwAAqv8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VShNwu2',
            'base64',
          ),
        )[0],
        s = (0, t.beginCell)().storeUint(0, 32).storeBuffer(r).endCell();
      ((this.init = { code: i, data: s }),
        (this.address = (0, t.contractAddress)(e, { code: i, data: s })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      let r = t.SendMode.PAY_GAS_SEPARATELY;
      return (
        e.sendMode !== null && e.sendMode !== void 0 && (r = e.sendMode),
        (0, d.createWalletTransferV2)({
          seqno: e.seqno,
          sendMode: r,
          secretKey: e.secretKey,
          messages: e.messages,
          timeout: e.timeout,
          domain: this.domain,
        })
      );
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              messages: [
                (0, t.internal)({
                  to: n.to,
                  value: n.value,
                  extracurrency: n.extracurrency,
                  init: n.init,
                  body: n.body,
                  bounce: n.bounce,
                }),
              ],
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((Va.WalletContractV2R1 = u), Va);
}
var Uu;
function uh() {
  return (
    Uu ||
      ((Uu = 1),
      (function (t) {
        var d =
            (mn && mn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (mn && mn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(lh(), t));
      })(mn)),
    mn
  );
}
var yn = {},
  Fa = {},
  ju;
function ch() {
  if (ju) return Fa;
  ((ju = 1),
    Object.defineProperty(Fa, '__esModule', { value: !0 }),
    (Fa.WalletContractV2R2 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.domain);
    }
    constructor(e, r, n) {
      ((this.workchain = e), (this.publicKey = r), (this.domain = n));
      let i = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAYwAAwv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VQETNeh',
            'base64',
          ),
        )[0],
        s = (0, t.beginCell)().storeUint(0, 32).storeBuffer(r).endCell();
      ((this.init = { code: i, data: s }),
        (this.address = (0, t.contractAddress)(e, { code: i, data: s })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      let r = t.SendMode.PAY_GAS_SEPARATELY;
      return (
        e.sendMode !== null && e.sendMode !== void 0 && (r = e.sendMode),
        (0, d.createWalletTransferV2)({
          seqno: e.seqno,
          sendMode: r,
          secretKey: e.secretKey,
          messages: e.messages,
          timeout: e.timeout,
          domain: this.domain,
        })
      );
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              messages: [
                (0, t.internal)({
                  to: n.to,
                  value: n.value,
                  extracurrency: n.extracurrency,
                  init: n.init,
                  body: n.body,
                  bounce: n.bounce,
                }),
              ],
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((Fa.WalletContractV2R2 = u), Fa);
}
var zu;
function dh() {
  return (
    zu ||
      ((zu = 1),
      (function (t) {
        var d =
            (yn && yn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (yn && yn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(ch(), t));
      })(yn)),
    yn
  );
}
var bn = {},
  Za = {},
  Du;
function fh() {
  if (Du) return Za;
  ((Du = 1),
    Object.defineProperty(Za, '__esModule', { value: !0 }),
    (Za.WalletContractV3R1 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.walletId, e.domain);
    }
    constructor(e, r, n, i) {
      ((this.workchain = e),
        (this.publicKey = r),
        (this.domain = i),
        n != null ? (this.walletId = n) : (this.walletId = 698983191 + e));
      let s = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAYgAAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVD++buA=',
            'base64',
          ),
        )[0],
        f = (0, t.beginCell)()
          .storeUint(0, 32)
          .storeUint(this.walletId, 32)
          .storeBuffer(r)
          .endCell();
      ((this.init = { code: s, data: f }),
        (this.address = (0, t.contractAddress)(e, { code: s, data: f })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      return (0, d.createWalletTransferV3)({
        ...e,
        sendMode: e.sendMode ?? t.SendMode.PAY_GAS_SEPARATELY,
        walletId: this.walletId,
        domain: this.domain,
      });
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              messages: [
                (0, t.internal)({
                  to: n.to,
                  value: n.value,
                  extracurrency: n.extracurrency,
                  init: n.init,
                  body: n.body,
                  bounce: n.bounce,
                }),
              ],
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((Za.WalletContractV3R1 = u), Za);
}
var Nu;
function hh() {
  return (
    Nu ||
      ((Nu = 1),
      (function (t) {
        var d =
            (bn && bn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (bn && bn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(fh(), t));
      })(bn)),
    bn
  );
}
var wn = {},
  Ha = {},
  qu;
function gh() {
  if (qu) return Ha;
  ((qu = 1),
    Object.defineProperty(Ha, '__esModule', { value: !0 }),
    (Ha.WalletContractV3R2 = void 0));
  const t = at(),
    d = zt();
  class u {
    static create(e) {
      return new u(e.workchain, e.publicKey, e.walletId, e.domain);
    }
    constructor(e, r, n, i) {
      ((this.workchain = e),
        (this.publicKey = r),
        (this.domain = i),
        n != null ? (this.walletId = n) : (this.walletId = 698983191 + e));
      let s = t.Cell.fromBoc(
          Buffer.from(
            'te6cckEBAQEAcQAA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVBC9ba0=',
            'base64',
          ),
        )[0],
        f = (0, t.beginCell)()
          .storeUint(0, 32)
          .storeUint(this.walletId, 32)
          .storeBuffer(r)
          .endCell();
      ((this.init = { code: s, data: f }),
        (this.address = (0, t.contractAddress)(e, { code: s, data: f })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      return (0, d.createWalletTransferV3)({
        ...e,
        sendMode: e.sendMode ?? t.SendMode.PAY_GAS_SEPARATELY,
        walletId: this.walletId,
        domain: this.domain,
      });
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              messages: [
                (0, t.internal)({
                  to: n.to,
                  value: n.value,
                  extracurrency: n.extracurrency,
                  init: n.init,
                  body: n.body,
                  bounce: n.bounce,
                }),
              ],
            });
          await this.send(e, s);
        },
      };
    }
  }
  return ((Ha.WalletContractV3R2 = u), Ha);
}
var Lu;
function ph() {
  return (
    Lu ||
      ((Lu = 1),
      (function (t) {
        var d =
            (wn && wn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (wn && wn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }), u(gh(), t));
      })(wn)),
    wn
  );
}
var vn = {},
  Wa = {},
  Vu;
function mh() {
  if (Vu) return Wa;
  ((Vu = 1),
    Object.defineProperty(Wa, '__esModule', { value: !0 }),
    (Wa.WalletContractV4 = void 0));
  const t = at(),
    d = zt();
  let u = class od {
    static create(e) {
      return new od(e.workchain, e.publicKey, e.walletId, e.domain);
    }
    constructor(e, r, n, i) {
      ((this.workchain = e),
        (this.publicKey = r),
        (this.domain = i),
        n != null ? (this.walletId = n) : (this.walletId = 698983191 + e));
      let s = t.Cell.fromBoc(
          Buffer.from(
            'te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBIAIDAgFIBAUE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8QERITAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNBgcCASAICQB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAKCwBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDA0AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA4PABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==',
            'base64',
          ),
        )[0],
        f = (0, t.beginCell)()
          .storeUint(0, 32)
          .storeUint(this.walletId, 32)
          .storeBuffer(this.publicKey)
          .storeBit(0)
          .endCell();
      ((this.init = { code: s, data: f }),
        (this.address = (0, t.contractAddress)(e, { code: s, data: f })));
    }
    async getBalance(e) {
      return (await e.getState()).balance;
    }
    async getSeqno(e) {
      return (await e.getState()).state.type === 'active'
        ? (await e.get('seqno', [])).stack.readNumber()
        : 0;
    }
    async getIsPluginInstalled(e, r) {
      if ((await e.getState()).state.type !== 'active') return !1;
      const i = BigInt(r.workChain),
        s = BigInt('0x' + r.hash.toString('hex'));
      return (
        await e.get('is_plugin_installed', [
          { type: 'int', value: i },
          { type: 'int', value: s },
        ])
      ).stack.readBoolean();
    }
    async getPluginsArray(e) {
      return (await e.getState()).state.type !== 'active'
        ? []
        : (await e.get('get_plugin_list', [])).stack.readLispList().map((i) => {
            if (i.type !== 'tuple') throw Error('Not a tuple');
            const s = new t.TupleReader(i.items),
              f = s.readNumber(),
              y = s.readBigNumber().toString(16).padStart(64, '0');
            return t.Address.parseRaw(`${f}:${y}`);
          });
    }
    async send(e, r) {
      await e.external(r);
    }
    async sendTransfer(e, r) {
      let n = this.createTransfer(r);
      await this.send(e, n);
    }
    createTransfer(e) {
      return this.createRequest({
        seqno: e.seqno,
        timeout: e.timeout,
        action: { type: 'sendMsg', messages: e.messages, sendMode: e.sendMode },
        ...('secretKey' in e
          ? { secretKey: e.secretKey }
          : { signer: e.signer }),
      });
    }
    async sendRequest(e, r) {
      const n = await this.createRequest(r);
      await this.send(e, n);
    }
    createRequest(e) {
      return (0, d.createWalletTransferV4)({
        ...e,
        walletId: this.walletId,
        domain: this.domain,
      });
    }
    sender(e, r) {
      return {
        send: async (n) => {
          let i = await this.getSeqno(e),
            s = this.createTransfer({
              seqno: i,
              secretKey: r,
              sendMode: n.sendMode,
              messages: [
                (0, t.internal)({
                  to: n.to,
                  value: n.value,
                  extracurrency: n.extracurrency,
                  init: n.init,
                  body: n.body,
                  bounce: n.bounce,
                }),
              ],
            });
          await this.send(e, s);
        },
      };
    }
    async sendAddPlugin(e, r) {
      const n = await this.createAddPlugin(r);
      return await this.send(e, n);
    }
    async sendRemovePlugin(e, r) {
      const n = await this.createRemovePlugin(r);
      return await this.send(e, n);
    }
    async sendAddAndDeployPlugin(e, r) {
      const n = await this.createAddAndDeployPlugin(r);
      return await this.send(e, n);
    }
    createAddPlugin(e) {
      return this.createRequest({
        action: {
          type: 'addPlugin',
          address: e.address,
          forwardAmount: e.forwardAmount,
          queryId: e.queryId,
        },
        ...e,
      });
    }
    createRemovePlugin(e) {
      return this.createRequest({
        action: {
          type: 'removePlugin',
          address: e.address,
          forwardAmount: e.forwardAmount,
          queryId: e.queryId,
        },
        ...e,
      });
    }
    createAddAndDeployPlugin(e) {
      return this.createRequest({
        action: {
          type: 'addAndDeployPlugin',
          workchain: e.workchain,
          stateInit: e.stateInit,
          body: e.body,
          forwardAmount: e.forwardAmount,
        },
        ...e,
      });
    }
    async sendPluginRequestFunds(e, r, n) {
      await e.internal(r, {
        value: n.forwardAmount,
        body: this.createPluginRequestFundsMessage(n),
        sendMode: n.sendMode,
      });
    }
    createPluginRequestFundsMessage(e) {
      return (0, t.beginCell)()
        .storeUint(1886156135, 32)
        .storeUint(e.queryId ?? 0, 64)
        .storeCoins(e.toncoinsToWithdraw)
        .storeDict(null)
        .endCell();
    }
    async sendPluginRemovePlugin(e, r, n, i) {
      await e.internal(r, {
        value: n,
        body: this.createPluginRemovePluginMessage(i),
      });
    }
    createPluginRemovePluginMessage(e) {
      return (0, t.beginCell)()
        .storeUint(1685288050, 32)
        .storeUint(e ?? 0, 64)
        .endCell();
    }
  };
  return ((Wa.WalletContractV4 = u), Wa);
}
var Fu;
function yh() {
  return (
    Fu ||
      ((Fu = 1),
      (function (t) {
        var d =
            (vn && vn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (vn && vn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          u(mh(), t),
          u(id(), t));
      })(vn)),
    vn
  );
}
var _n = {},
  Zu;
function bh() {
  return (
    Zu ||
      ((Zu = 1),
      (function (t) {
        var d =
            (_n && _n.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (_n && _n.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          u(Xc(), t),
          u(td(), t),
          u(Qc(), t));
      })(_n)),
    _n
  );
}
var kn = {},
  Hu;
function wh() {
  return (
    Hu ||
      ((Hu = 1),
      (function (t) {
        var d =
            (kn && kn.__createBinding) ||
            (Object.create
              ? function (a, e, r, n) {
                  n === void 0 && (n = r);
                  var i = Object.getOwnPropertyDescriptor(e, r);
                  ((!i ||
                    ('get' in i
                      ? !e.__esModule
                      : i.writable || i.configurable)) &&
                    (i = {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    }),
                    Object.defineProperty(a, n, i));
                }
              : function (a, e, r, n) {
                  (n === void 0 && (n = r), (a[n] = e[r]));
                }),
          u =
            (kn && kn.__exportStar) ||
            function (a, e) {
              for (var r in a)
                r !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(e, r) &&
                  d(e, a, r);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          u(nd(), t),
          u(ad(), t),
          u(rd(), t));
      })(kn)),
    kn
  );
}
var Ka = {},
  Wu;
function vh() {
  if (Wu) return Ka;
  ((Wu = 1),
    Object.defineProperty(Ka, '__esModule', { value: !0 }),
    (Ka.JettonMaster = void 0));
  const t = at();
  let d = class sd {
    static create(a) {
      return new sd(a);
    }
    constructor(a) {
      this.address = a;
    }
    async getWalletAddress(a, e) {
      return (
        await a.get('get_wallet_address', [
          { type: 'slice', cell: (0, t.beginCell)().storeAddress(e).endCell() },
        ])
      ).stack.readAddress();
    }
    async getJettonData(a) {
      let e = await a.get('get_jetton_data', []),
        r = e.stack.readBigNumber(),
        n = e.stack.readBoolean(),
        i = e.stack.readAddress(),
        s = e.stack.readCell(),
        f = e.stack.readCell();
      return {
        totalSupply: r,
        mintable: n,
        adminAddress: i,
        content: s,
        walletCode: f,
      };
    }
  };
  return ((Ka.JettonMaster = d), Ka);
}
var $a = {},
  Ku;
function _h() {
  if (Ku) return $a;
  ((Ku = 1),
    Object.defineProperty($a, '__esModule', { value: !0 }),
    ($a.JettonWallet = void 0));
  let t = class ld {
    static create(u) {
      return new ld(u);
    }
    constructor(u) {
      this.address = u;
    }
    async getBalance(u) {
      return (await u.getState()).state.type !== 'active'
        ? 0n
        : (await u.get('get_wallet_data', [])).stack.readBigNumber();
    }
  };
  return (($a.JettonWallet = t), $a);
}
var Ga = {},
  $u;
function ud() {
  if ($u) return Ga;
  (($u = 1),
    Object.defineProperty(Ga, '__esModule', { value: !0 }),
    (Ga.MultisigOrder = void 0));
  const t = Tn(),
    d = at();
  let u = class uo {
    constructor(e) {
      ((this.signatures = {}), (this.payload = e));
    }
    static fromCell(e) {
      var f;
      let r = e.beginParse(),
        n = (f = r.loadMaybeRef()) == null ? void 0 : f.beginParse();
      const i = r.asCell();
      let s = new uo(i);
      if (n) {
        for (; n.remainingBits > 0;) {
          const o = n.loadBuffer(64),
            y = n.loadUint(8);
          ((s.signatures[y] = o),
            n.remainingRefs > 0 ? (n = n.loadRef().asSlice()) : n.skip(1));
        }
        n.endParse();
      }
      return s;
    }
    static fromPayload(e) {
      return new uo(e);
    }
    addSignature(e, r, n) {
      const i = this.payload.hash();
      if (!(0, t.signVerify)(i, r, n.owners.get(e).slice(0, -1)))
        throw Error('invalid signature');
      this.signatures[e] = r;
    }
    sign(e, r) {
      const n = this.payload.hash();
      return ((this.signatures[e] = (0, t.sign)(n, r)), n);
    }
    unionSignatures(e) {
      this.signatures = Object.assign({}, this.signatures, e.signatures);
    }
    clearSignatures() {
      this.signatures = {};
    }
    toCell(e) {
      let r = (0, d.beginCell)().storeBit(0);
      for (const n in this.signatures) {
        const i = this.signatures[n];
        r = (0, d.beginCell)()
          .storeBit(1)
          .storeRef(
            (0, d.beginCell)()
              .storeBuffer(i)
              .storeUint(parseInt(n), 8)
              .storeBuilder(r)
              .endCell(),
          );
      }
      return (0, d.beginCell)()
        .storeUint(e, 8)
        .storeBuilder(r)
        .storeBuilder(this.payload.asBuilder())
        .endCell();
    }
  };
  return ((Ga.MultisigOrder = u), Ga);
}
var Ya = {},
  Gu;
function kh() {
  if (Gu) return Ya;
  ((Gu = 1),
    Object.defineProperty(Ya, '__esModule', { value: !0 }),
    (Ya.MultisigOrderBuilder = void 0));
  const t = at(),
    d = ud();
  let u = class {
    constructor(e, r) {
      ((this.messages = (0, t.beginCell)()),
        (this.queryId = 0n),
        (this.walletId = e),
        (this.queryOffset = r || 7200));
    }
    addMessage(e, r) {
      if (this.messages.refs >= 4) throw Error('only 4 refs are allowed');
      (this.updateQueryId(),
        this.messages.storeUint(r, 8),
        this.messages.storeRef(
          (0, t.beginCell)()
            .store((0, t.storeMessageRelaxed)(e))
            .endCell(),
        ));
    }
    clearMessages() {
      this.messages = (0, t.beginCell)();
    }
    build() {
      return d.MultisigOrder.fromPayload(
        (0, t.beginCell)()
          .storeUint(this.walletId, 32)
          .storeUint(this.queryId, 64)
          .storeBuilder(this.messages)
          .endCell(),
      );
    }
    updateQueryId() {
      const e = BigInt(Math.floor(Date.now() / 1e3 + this.queryOffset));
      this.queryId = e << 32n;
    }
  };
  return ((Ya.MultisigOrderBuilder = u), Ya);
}
var Ja = {},
  Yu;
function Ch() {
  if (Yu) return Ja;
  ((Yu = 1),
    Object.defineProperty(Ja, '__esModule', { value: !0 }),
    (Ja.MultisigWallet = void 0));
  const t = Tn(),
    d = at(),
    u = d.Cell.fromBase64(
      'te6ccgECKwEABBgAART/APSkE/S88sgLAQIBIAIDAgFIBAUE2vIgxwCOgzDbPOCDCNcYIPkBAdMH2zwiwAAToVNxePQOb6Hyn9s8VBq6+RDyoAb0BCD5AQHTH1EYuvKq0z9wUwHwCgHCCAGDCryx8mhTFYBA9A5voSCYDqQgwgryZw7f+COqH1NAufJhVCOjU04gIyEiAgLMBgcCASAMDQIBIAgJAgFmCgsAA9GEAiPymAvHoHN9CYbZ5S7Z4BPHohwhJQAtAKkItdJEqCTItdKlwLUAdAT8ArobBKAATwhbpEx4CBukTDgAdAg10rDAJrUAvALyFjPFszJ4HHXI8gBzxb0AMmACASAODwIBIBQVARW77ZbVA0cFUg2zyCoCAUgQEQIBIBITAXOxHXQgwjXGCD5AQHTB4IB1MTtQ9hTIHj0Dm+h8p/XC/9eMfkQ8qCuAfQEIW6TW3Ey4PkBWNs8AaQBgJwA9rtqA6ADoAPoCAXoCEfyAgPyA3XlP+AXkegAA54tkwAAXrhlXP8EA1WZ2oexAAgEgFhcCASAYGQFRtyVbZ4YmRmpGEAgegc30McJNhFpAADMaYeYuAFrgJhwLb+4cC3d0bhAjAYm1WZtnhqvgb+2xxsoicAgej430pBHEoFpAADHDhBACGuQkuuBk9kUWE5kAOeLKhACQCB6IYFImHFImHFImXEA2YlzNijAjAgEgGhsAF7UGtc4QQDVZnah7EAIBIBwdAgOZOB4fARGsGm2eL4G2CUAjABWt+UEAzJV2oewYQAENqTbPBVfBYCMAFa3f3CCAarM7UPYgAiDbPALyZfgAUENxQxPbPO1UIyoACtP/0wcwBKDbPC+uUyCw8mISsQKkJbNTHLmwJYEA4aojoCi8sPJpggGGoPgBBZcCERACPj4wjo0REB/bPEDXePRDEL0F4lQWW1Rz51YQU9zbPFRxClR6vCQlKCYAIO1E0NMf0wfTB9M/9AT0BNEAXgGOGjDSAAHyo9MH0wdQA9cBIPkBBfkBFbrypFAD4GwhIddKqgIi10m68qtwVCATAAwByMv/ywcE1ts87VT4D3AlblOJvrGYEG4QLVDHXwePGzBUJANQTds8UFWgRlAQSRA6SwlTuds8UFQWf+L4AAeDJaGOLCaAQPSWb6UglDBTA7neII4WODk5CNIAAZfTBzAW8AcFkTDifwgHBZJsMeKz5jAGKicoKQBgcI4pA9CDCNcY0wf0BDBTFnj0Dm+h8qXXC/9URUT5EPKmrlIgsVIDvRShI27mbCIyAH5SML6OIF8D+ACTItdKmALTB9QC+wAC6DJwyMoAQBSAQPRDAvAHjhdxyMsAFMsHEssHWM8BWM8WQBOAQPRDAeIBII6KEEUQNEMA2zztVJJfBuIqABzIyx/LB8sHyz/0APQAyQ==',
    );
  let a = class cd {
    constructor(r, n, i, s, f) {
      ((this.provider = null),
        (this.owners = d.Dictionary.empty()),
        (this.workchain = n),
        (this.walletId = i),
        (this.k = s));
      for (let o = 0; o < r.length; o += 1)
        this.owners.set(o, Buffer.concat([r[o], Buffer.alloc(1)]));
      ((this.init = {
        code: u,
        data: (0, d.beginCell)()
          .storeUint(this.walletId, 32)
          .storeUint(this.owners.size, 8)
          .storeUint(this.k, 8)
          .storeUint(0, 64)
          .storeDict(
            this.owners,
            d.Dictionary.Keys.Uint(8),
            d.Dictionary.Values.Buffer(33),
          )
          .storeBit(0)
          .endCell(),
      }),
        (this.address =
          (f == null ? void 0 : f.address) ||
          (0, d.contractAddress)(n, this.init)),
        f != null && f.provider
          ? (this.provider = f.provider)
          : f != null &&
            f.client &&
            (this.provider = f.client.provider(this.address, {
              code: this.init.code,
              data: this.init.data,
            })));
    }
    static async fromAddress(r, n) {
      let i;
      if (n.provider) i = n.provider;
      else {
        if (!n.client)
          throw Error('Either provider or client must be specified');
        i = n.client.provider(r, { code: null, data: null });
      }
      const s = (await i.getState()).state;
      if (s.type !== 'active') throw Error('Contract must be active');
      const f = d.Cell.fromBoc(s.data)[0].beginParse(),
        o = f.loadUint(32);
      f.skip(8);
      const y = f.loadUint(8);
      f.skip(64);
      const v = f.loadDict(
        d.Dictionary.Keys.Uint(8),
        d.Dictionary.Values.Buffer(33),
      );
      let w = [];
      for (const [R, C] of v) {
        const P = C.subarray(0, 32);
        w.push(P);
      }
      return new cd(w, r.workChain, o, y, {
        address: r,
        provider: i,
        client: n.client,
      });
    }
    async deployExternal(r) {
      if (!r && !this.provider)
        throw Error(
          'you must specify provider if there is no such property in MultisigWallet instance',
        );
      (r || (r = this.provider), await r.external(d.Cell.EMPTY));
    }
    async deployInternal(r, n = 1000000000n) {
      await r.send({
        sendMode: d.SendMode.PAY_GAS_SEPARATELY + d.SendMode.IGNORE_ERRORS,
        to: this.address,
        value: n,
        init: this.init,
        body: d.Cell.EMPTY,
        bounce: !0,
      });
    }
    async sendOrder(r, n, i) {
      if (!i && !this.provider)
        throw Error(
          'you must specify provider if there is no such property in MultisigWallet instance',
        );
      i || (i = this.provider);
      let s = (0, t.keyPairFromSecretKey)(n).publicKey,
        f = this.getOwnerIdByPubkey(s),
        o = r.toCell(f),
        y = (0, t.sign)(o.hash(), n);
      ((o = (0, d.beginCell)()
        .storeBuffer(y)
        .storeSlice(o.asSlice())
        .endCell()),
        await i.external(o));
    }
    async sendOrderWithoutSecretKey(r, n, i, s) {
      if (!s && !this.provider)
        throw Error(
          'you must specify provider if there is no such property in MultisigWallet instance',
        );
      s || (s = this.provider);
      let f = r.toCell(i);
      ((f = (0, d.beginCell)()
        .storeBuffer(n)
        .storeSlice(f.asSlice())
        .endCell()),
        await s.external(f));
    }
    getOwnerIdByPubkey(r) {
      for (const [n, i] of this.owners)
        if (i.subarray(0, 32).equals(r)) return n;
      throw Error('public key is not an owner');
    }
  };
  return ((Ja.MultisigWallet = a), Ja);
}
var Qa = {},
  Ju;
function Sh() {
  if (Ju) return Qa;
  ((Ju = 1),
    Object.defineProperty(Qa, '__esModule', { value: !0 }),
    (Qa.ElectorContract = void 0));
  const t = at(),
    d = {
      serialize(e, r) {
        throw Error('not implemented');
      },
      parse(e) {
        const r = new t.Address(-1, e.loadBuffer(32)),
          n = e.loadUintBig(64),
          i = e.loadCoins();
        return { address: r, weight: n, stake: i };
      },
    },
    u = {
      serialize(e, r) {
        throw Error('not implemented');
      },
      parse(e) {
        const r = e.loadCoins();
        e.skip(64);
        const n = new t.Address(-1, e.loadBuffer(32)),
          i = e.loadBuffer(32);
        return { stake: r, address: n, adnl: i };
      },
    };
  let a = class dd {
    static create() {
      return new dd();
    }
    constructor() {
      this.address = t.Address.parseRaw(
        '-1:3333333333333333333333333333333333333333333333333333333333333333',
      );
    }
    async getReturnedStake(r, n) {
      if (n.workChain !== -1)
        throw Error('Only masterchain addresses could have stake');
      return (
        await r.get('compute_returned_stake', [
          { type: 'int', value: BigInt('0x' + n.hash.toString('hex')) },
        ])
      ).stack.readBigNumber();
    }
    async getPastElectionsList(r) {
      const n = await r.get('past_elections_list', []),
        i = new t.TupleReader(n.stack.readLispList()),
        s = [];
      for (; i.remaining > 0;) {
        const f = i.readTuple(),
          o = f.readNumber(),
          y = f.readNumber();
        f.pop();
        const v = f.readNumber();
        s.push({ id: o, unfreezeAt: y, stakeHeld: v });
      }
      return s;
    }
    async getPastElections(r) {
      const n = await r.get('past_elections', []),
        i = new t.TupleReader(n.stack.readLispList()),
        s = [];
      for (; i.remaining > 0;) {
        const f = i.readTuple(),
          o = f.readNumber(),
          y = f.readNumber(),
          v = f.readNumber();
        f.pop();
        const w = f.readCell(),
          R = f.readBigNumber(),
          C = f.readBigNumber();
        let P = new Map();
        const E = w
          .beginParse()
          .loadDictDirect(t.Dictionary.Keys.Buffer(32), d);
        for (const [N, D] of E)
          P.set(BigInt('0x' + N.toString('hex')).toString(10), {
            address: D.address,
            weight: D.weight,
            stake: D.stake,
          });
        s.push({
          id: o,
          unfreezeAt: y,
          stakeHeld: v,
          totalStake: R,
          bonuses: C,
          frozen: P,
        });
      }
      return s;
    }
    async getElectionEntities(r) {
      const n = await r.getState();
      if (n.state.type !== 'active') throw Error('Unexpected error');
      const s = t.Cell.fromBoc(n.state.data)[0].beginParse();
      if (!s.loadBit()) return null;
      const f = s.loadRef().beginParse(),
        o = f.loadUint(32),
        y = f.loadUint(32),
        v = f.loadCoins(),
        w = f.loadCoins(),
        R = f.loadDict(t.Dictionary.Keys.Buffer(32), u);
      let C = [];
      if (R)
        for (const [P, E] of R)
          C.push({
            pubkey: P,
            stake: E.stake,
            address: E.address,
            adnl: E.adnl,
          });
      return {
        minStake: v,
        allStakes: w,
        endElectionsTime: y,
        startWorkTime: o,
        entities: C,
      };
    }
    async getActiveElectionId(r) {
      const i = (await r.get('active_election_id', [])).stack.readNumber();
      return i > 0 ? i : null;
    }
    async getComplaints(r, n) {
      const i = new t.TupleBuilder();
      i.writeNumber(n);
      const s = await r.get('list_complaints', i.build());
      if (s.stack.peek().type === 'null') return [];
      const f = new t.TupleReader(s.stack.readLispList()),
        o = [];
      for (; f.remaining > 0;) {
        const y = f.readTuple(),
          v = y.readBigNumber(),
          w = y.readTuple(),
          R = w.readTuple(),
          C = Buffer.from(R.readBigNumber().toString(16), 'hex');
        R.readCell();
        const P = R.readNumber(),
          E = R.readNumber(),
          N = new t.Address(
            -1,
            Buffer.from(R.readBigNumber().toString(16), 'hex'),
          ),
          D = R.readBigNumber(),
          G = R.readBigNumber(),
          te = R.readBigNumber(),
          W = [],
          F = new t.TupleReader(w.readLispList());
        for (; F.remaining > 0;) W.push(F.readNumber());
        const K = w.readBigNumber(),
          Y = w.readBigNumber();
        o.push({
          id: v,
          publicKey: C,
          createdAt: P,
          severity: E,
          paid: D,
          suggestedFine: G,
          suggestedFinePart: te,
          rewardAddress: N,
          votes: W,
          remainingWeight: Y,
          vsetId: K,
        });
      }
      return o;
    }
  };
  return ((Qa.ElectorContract = a), Qa);
}
var We = {},
  Qu;
function Bh() {
  if (Qu) return We;
  ((Qu = 1),
    Object.defineProperty(We, '__esModule', { value: !0 }),
    (We.configParseMasterAddress = d),
    (We.parseValidatorSet = e),
    (We.parseBridge = r),
    (We.configParseMasterAddressRequired = n),
    (We.configParse5 = i),
    (We.configParse6 = s),
    (We.configParse7 = f),
    (We.configParse9 = o),
    (We.configParse10 = y),
    (We.configParse13 = v),
    (We.configParse14 = w),
    (We.configParse15 = R),
    (We.configParse16 = C),
    (We.configParse17 = P),
    (We.configParse18 = N),
    (We.configParse8 = D),
    (We.configParse40 = G),
    (We.configParseWorkchainDescriptor = te),
    (We.configParse12 = K),
    (We.configParseValidatorSet = Y),
    (We.configParseBridge = ue),
    (We.loadJettonBridgeParams = we),
    (We.configParseGasLimitsPrices = $),
    (We.configParseBlockLimits = ie),
    (We.configParseMsgPrices = Se),
    (We.configParse28 = Ee),
    (We.configParse29 = He),
    (We.configParse31 = L),
    (We.configParse44 = Be),
    (We.configParse45 = ve),
    (We.parseProposalSetup = xe),
    (We.parseVotingSetup = Re),
    (We.loadConfigParamById = Oe),
    (We.loadConfigParamsAsSlice = De),
    (We.parseFullConfig = Ze),
    (We.parseFullerConfig = Ke));
  const t = at();
  function d(g) {
    return g ? new t.Address(-1, g.loadBuffer(32)) : null;
  }
  function u(g) {
    if (g.loadUint(32) !== 2390828938) throw Error('Invalid publicKey');
    return g.loadBuffer(32);
  }
  const a = {
    serialize(g, pe) {
      throw Error('not implemented');
    },
    parse(g) {
      const pe = g.loadUint(8);
      if (pe === 83)
        return {
          publicKey: u(g),
          weight: g.loadUintBig(64),
          adnlAddress: null,
        };
      if (pe === 115)
        return {
          publicKey: u(g),
          weight: g.loadUintBig(64),
          adnlAddress: g.loadBuffer(32),
        };
      throw Error('Invalid validator description dict');
    },
  };
  function e(g) {
    const pe = g.loadUint(8);
    if (pe === 17) {
      const ne = g.loadUint(32),
        be = g.loadUint(32),
        ke = g.loadUint(16),
        Me = g.loadUint(16),
        qe = g.loadDictDirect(t.Dictionary.Keys.Uint(16), a);
      return {
        timeSince: ne,
        timeUntil: be,
        total: ke,
        main: Me,
        totalWeight: null,
        list: qe,
      };
    } else if (pe === 18) {
      const ne = g.loadUint(32),
        be = g.loadUint(32),
        ke = g.loadUint(16),
        Me = g.loadUint(16),
        qe = g.loadUintBig(64),
        je = g.loadDict(t.Dictionary.Keys.Uint(16), a);
      return {
        timeSince: ne,
        timeUntil: be,
        total: ke,
        main: Me,
        totalWeight: qe,
        list: je,
      };
    }
    return null;
  }
  function r(g) {
    const pe = new t.Address(-1, g.loadBuffer(32)),
      ne = new t.Address(-1, g.loadBuffer(32)),
      be = g.loadDict(
        t.Dictionary.Keys.Buffer(32),
        t.Dictionary.Values.Buffer(32),
      ),
      ke = new Map();
    for (const [qe, je] of be) ke.set(new t.Address(-1, qe).toString(), je);
    const Me = g.loadBuffer(32);
    return {
      bridgeAddress: pe,
      oracleMultisigAddress: ne,
      oracles: ke,
      externalChainAddress: Me,
    };
  }
  function n(g) {
    if (!g) throw Error('Invalid master address');
    return d(g);
  }
  function i(g) {
    if (!g) throw Error('No config5 slice');
    if (g.loadUint(8) === 1) {
      const ne = g.loadBit() ? new t.Address(-1, g.loadBuffer(32)) : null,
        be = g.loadUint(32),
        ke = g.loadUint(32);
      return {
        blackholeAddr: ne,
        feeBurnNominator: be,
        feeBurnDenominator: ke,
      };
    }
    throw new Error('Invalid config5');
  }
  function s(g) {
    if (!g) return null;
    const pe = g.loadCoins(),
      ne = g.loadCoins();
    return { mintNewPrice: pe, mintAddPrice: ne };
  }
  function f(g) {
    if (!g) throw Error('No config7 slice');
    return { toMint: (0, t.loadExtraCurrency)(g.loadRef()) };
  }
  function o(g) {
    if (!g) throw Error('No config9 slice');
    return new Set(
      g
        .loadDictDirect(t.Dictionary.Keys.Int(32), t.Dictionary.Values.Uint(0))
        .keys(),
    );
  }
  function y(g) {
    if (!g) throw Error('No config10 slice');
    return new Set(
      g
        .loadDictDirect(t.Dictionary.Keys.Int(32), t.Dictionary.Values.Uint(0))
        .keys(),
    );
  }
  function v(g) {
    if (!g) throw Error('No config13 slice');
    if (g.loadUint(8) !== 26) throw new Error('Invalid config13');
    const ne = g.loadCoins(),
      be = g.loadCoins(),
      ke = g.loadCoins();
    return { deposit: ne, bitPrice: be, cellPrice: ke };
  }
  function w(g) {
    if (!g) throw Error('No config14 slice');
    if (g.loadUint(8) !== 107) throw new Error('Invalid config14');
    const ne = g.loadCoins(),
      be = g.loadCoins();
    return { masterchainBlockFee: ne, workchainBlockFee: be };
  }
  function R(g) {
    if (!g) throw Error('No config15 slice');
    const pe = g.loadUint(32),
      ne = g.loadUint(32),
      be = g.loadUint(32),
      ke = g.loadUint(32);
    return {
      validatorsElectedFor: pe,
      electorsStartBefore: ne,
      electorsEndBefore: be,
      stakeHeldFor: ke,
    };
  }
  function C(g) {
    if (!g) throw Error('No config16 slice');
    const pe = g.loadUint(16),
      ne = g.loadUint(16),
      be = g.loadUint(16);
    return { maxValidators: pe, maxMainValidators: ne, minValidators: be };
  }
  function P(g) {
    if (!g) throw Error('No config17 slice');
    const pe = g.loadCoins(),
      ne = g.loadCoins(),
      be = g.loadCoins(),
      ke = g.loadUint(32);
    return {
      minStake: pe,
      maxStake: ne,
      minTotalStake: be,
      maxStakeFactor: ke,
    };
  }
  const E = {
    serialize(g, pe) {
      throw Error('not implemented');
    },
    parse(g) {
      if (g.loadUint(8) !== 204) throw Error('Invalid storage prices dict');
      const ne = g.loadUint(32),
        be = g.loadUintBig(64),
        ke = g.loadUintBig(64),
        Me = g.loadUintBig(64),
        qe = g.loadUintBig(64);
      return {
        utime_since: ne,
        bit_price_ps: be,
        cell_price_ps: ke,
        mc_bit_price_ps: Me,
        mc_cell_price_ps: qe,
      };
    },
  };
  function N(g) {
    if (!g) throw Error('No config18 slice');
    return g.loadDictDirect(t.Dictionary.Keys.Buffer(4), E).values();
  }
  function D(g) {
    if (!g) return { version: 0, capabilities: 0n };
    const pe = g.loadUint(32),
      ne = g.loadUintBig(64);
    return { version: pe, capabilities: ne };
  }
  function G(g) {
    if (!g) return null;
    if (g.loadUint(8) !== 1) throw Error('Invalid config40');
    const ne = g.loadCoins(),
      be = g.loadCoins(),
      ke = g.loadUint(16),
      Me = g.loadUint(16),
      qe = g.loadUint(16),
      je = g.loadUint(16),
      Ve = g.loadUint(16),
      ot = g.loadUint(16),
      lt = g.loadUint(16),
      st = g.loadUint(16),
      ut = g.loadUint(16);
    return {
      defaultFlatFine: ne,
      defaultProportionaFine: be,
      severityFlatMult: ke,
      severityProportionalMult: Me,
      unfunishableInterval: qe,
      longInterval: je,
      longFlatMult: Ve,
      longProportionalMult: ot,
      mediumInterval: lt,
      mediumFlatMult: st,
      mediumProportionalMult: ut,
    };
  }
  function te(g) {
    const pe = g.loadUint(8);
    if (!(pe == 166 || pe == 167)) throw Error('Invalid workchain descriptor');
    const ne = g.loadUint(32),
      be = g.loadUint(8),
      ke = g.loadUint(8),
      Me = g.loadUint(8),
      qe = g.loadBit(),
      je = g.loadBit(),
      Ve = g.loadBit(),
      ot = g.loadUint(13),
      lt = g.loadBuffer(32),
      st = g.loadBuffer(32),
      ut = g.loadUint(32);
    if (!g.loadUint(4)) throw Error('Not basic workchain descriptor');
    const pt = g.loadInt(32),
      kt = g.loadUintBig(64);
    let U;
    if (pe == 167) {
      const k = W(g),
        M = g.loadUint(8);
      if (M > 63)
        throw RangeError(
          `Invalid persistent_state_split_depth: ${M} expected <= 63`,
        );
      U = { split_merge_timings: k, persistent_state_split_depth: M };
    }
    return {
      enabledSince: ne,
      actialMinSplit: be,
      min_split: ke,
      max_split: Me,
      basic: qe,
      active: je,
      accept_msgs: Ve,
      flags: ot,
      zerostateRootHash: lt,
      zerostateFileHash: st,
      version: ut,
      format: { vmVersion: pt, vmMode: kt },
      workchain_v2: U,
    };
  }
  function W(g) {
    if (g.loadUint(4) !== 0)
      throw Error('Invalid WcSplitMergeTimings tag expected 0!');
    return {
      split_merge_delay: g.loadUint(32),
      split_merge_interval: g.loadUint(32),
      min_split_merge_interval: g.loadUint(32),
      max_split_merge_delay: g.loadUint(32),
    };
  }
  const F = {
    serialize(g, pe) {
      throw Error('not implemented');
    },
    parse(g) {
      return te(g);
    },
  };
  function K(g) {
    if (!g) throw Error('No config12 slice');
    const pe = g.loadDict(t.Dictionary.Keys.Uint(32), F);
    if (pe) return pe;
    throw Error('No workchains exist');
  }
  function Y(g) {
    return g ? e(g) : null;
  }
  function ue(g) {
    return g ? r(g) : null;
  }
  function we(g) {
    if (!g) return null;
    const pe = g.loadUint(8);
    if (pe === 0) {
      const ne = new t.Address(-1, g.loadBuffer(32)),
        be = new t.Address(-1, g.loadBuffer(32)),
        Me = [
          ...g.loadDict(
            t.Dictionary.Keys.Buffer(32),
            t.Dictionary.Values.Buffer(32),
          ),
        ].map((Ve) => ({ addr: new t.Address(-1, Ve[0]), pubkey: Ve[1] })),
        qe = g.loadUint(8),
        je = g.loadCoins();
      return {
        bridgeAddress: ne,
        oracleAddress: be,
        oracles: Me,
        flags: qe,
        bridgeBurnFee: je,
      };
    }
    if (pe === 1) {
      const ne = new t.Address(-1, g.loadBuffer(32)),
        be = new t.Address(-1, g.loadBuffer(32)),
        Me = [
          ...g.loadDict(
            t.Dictionary.Keys.Buffer(32),
            t.Dictionary.Values.Buffer(32),
          ),
        ].map((U) => ({ addr: new t.Address(-1, U[0]), pubkey: U[1] })),
        qe = g.loadUint(8),
        je = g.loadRef().beginParse(),
        Ve = je.loadCoins(),
        ot = je.loadCoins(),
        lt = je.loadCoins(),
        st = je.loadCoins(),
        ut = je.loadCoins(),
        pt = je.loadCoins(),
        kt = g.loadBuffer(32);
      return {
        bridgeAddress: ne,
        oracleAddress: be,
        oracles: Me,
        flags: qe,
        jettonBridgePrices: {
          bridgeBurnFee: Ve,
          bridgeMintFee: ot,
          walletMinTonsForStorage: lt,
          walletGasConsumption: st,
          minterMinTonsForStorage: ut,
          discoverGasConsumption: pt,
        },
        externalChainAddress: kt,
      };
    }
    throw new Error('Invalid msg prices param');
  }
  function Ce(g) {
    const pe = g.loadUint(8);
    if (pe === 222) {
      const ne = g.loadUintBig(64),
        be = g.loadUintBig(64),
        ke = g.loadUintBig(64),
        Me = g.loadUintBig(64),
        qe = g.loadUintBig(64),
        je = g.loadUintBig(64),
        Ve = g.loadUintBig(64);
      return {
        gasPrice: ne,
        gasLimit: be,
        specialGasLimit: ke,
        gasCredit: Me,
        blockGasLimit: qe,
        freezeDueLimit: je,
        deleteDueLimit: Ve,
      };
    } else if (pe === 221) {
      const ne = g.loadUintBig(64),
        be = g.loadUintBig(64),
        ke = g.loadUintBig(64),
        Me = g.loadUintBig(64),
        qe = g.loadUintBig(64),
        je = g.loadUintBig(64);
      return {
        gasPrice: ne,
        gasLimit: be,
        gasCredit: ke,
        blockGasLimit: Me,
        freezeDueLimit: qe,
        deleteDueLimit: je,
      };
    } else throw Error('Invalid gas limits internal');
  }
  function $(g) {
    if (!g) throw Error('No gas limits slice');
    if (g.loadUint(8) === 209) {
      const ne = g.loadUintBig(64),
        be = g.loadUintBig(64),
        ke = Ce(g);
      return { flatLimit: ne, flatGasPrice: be, other: ke };
    } else throw Error('Invalid gas limits');
  }
  function q(g) {
    if (g.loadUint(8) !== 195) throw Error('Invalid params limit slice');
    const ne = g.loadUint(32),
      be = g.loadUint(32),
      ke = g.loadUint(32);
    if (ne > be || be > ke) throw Error('Incosistent limitParams');
    return { underload: ne, softLimit: be, hardLimit: ke };
  }
  function ie(g) {
    if (!g) throw Error('No block limits slice');
    const pe = g.loadUint(8);
    if (pe === 93) {
      const ne = q(g),
        be = q(g),
        ke = q(g);
      return { bytes: ne, gas: be, ltDelta: ke };
    }
    if (pe === 94) {
      const ne = q(g),
        be = q(g),
        ke = q(g),
        Me = q(g);
      if (g.loadUint(8) !== 211) throw Error('Invalid importedMsgQueue');
      const je = g.loadUint(32),
        Ve = g.loadUint(32);
      return {
        bytes: ne,
        gas: be,
        ltDelta: ke,
        collatedData: Me,
        importedMsgQueue: { maxBytes: je, maxMsgs: Ve },
      };
    }
    throw Error('Invalid block limits');
  }
  function Se(g) {
    if (!g) throw new Error('No msg prices slice');
    if (g.loadUint(8) !== 234) throw new Error('Invalid msg prices param');
    return {
      lumpPrice: g.loadUintBig(64),
      bitPrice: g.loadUintBig(64),
      cellPrice: g.loadUintBig(64),
      ihrPriceFactor: g.loadUint(32),
      firstFrac: g.loadUint(16),
      nextFrac: g.loadUint(16),
    };
  }
  function Ee(g) {
    if (!g) throw new Error('No config28 slice');
    const pe = g.loadUint(8);
    if (pe === 193) {
      const ne = g.loadUint(32),
        be = g.loadUint(32),
        ke = g.loadUint(32),
        Me = g.loadUint(32);
      return {
        masterCatchainLifetime: ne,
        shardCatchainLifetime: be,
        shardValidatorsLifetime: ke,
        shardValidatorsCount: Me,
      };
    }
    if (pe === 194) {
      const ne = g.loadUint(7),
        be = g.loadBit(),
        ke = g.loadUint(32),
        Me = g.loadUint(32),
        qe = g.loadUint(32),
        je = g.loadUint(32);
      return {
        flags: ne,
        suffleMasterValidators: be,
        masterCatchainLifetime: ke,
        shardCatchainLifetime: Me,
        shardValidatorsLifetime: qe,
        shardValidatorsCount: je,
      };
    }
    throw new Error('Invalid config28');
  }
  function He(g) {
    if (!g) throw new Error('No config29 slice');
    const pe = g.loadUint(8);
    if (pe === 214) {
      const ne = g.loadUint(32),
        be = g.loadUint(32),
        ke = g.loadUint(32),
        Me = g.loadUint(32),
        qe = g.loadUint(32),
        je = g.loadUint(32),
        Ve = g.loadUint(32),
        ot = g.loadUint(32);
      return {
        roundCandidates: ne,
        nextCandidateDelay: be,
        consensusTimeout: ke,
        fastAttempts: Me,
        attemptDuration: qe,
        catchainMaxDeps: je,
        maxBlockBytes: Ve,
        maxColaltedBytes: ot,
      };
    } else if (pe === 215) {
      const ne = g.loadUint(7),
        be = g.loadBit(),
        ke = g.loadUint(8),
        Me = g.loadUint(32),
        qe = g.loadUint(32),
        je = g.loadUint(32),
        Ve = g.loadUint(32),
        ot = g.loadUint(32),
        lt = g.loadUint(32),
        st = g.loadUint(32);
      return {
        flags: ne,
        newCatchainIds: be,
        roundCandidates: ke,
        nextCandidateDelay: Me,
        consensusTimeout: qe,
        fastAttempts: je,
        attemptDuration: Ve,
        catchainMaxDeps: ot,
        maxBlockBytes: lt,
        maxColaltedBytes: st,
      };
    } else if (pe === 216) {
      const ne = g.loadUint(7),
        be = g.loadBit(),
        ke = g.loadUint(8),
        Me = g.loadUint(32),
        qe = g.loadUint(32),
        je = g.loadUint(32),
        Ve = g.loadUint(32),
        ot = g.loadUint(32),
        lt = g.loadUint(32),
        st = g.loadUint(32),
        ut = g.loadUint(16);
      return {
        flags: ne,
        newCatchainIds: be,
        roundCandidates: ke,
        nextCandidateDelay: Me,
        consensusTimeout: qe,
        fastAttempts: je,
        attemptDuration: Ve,
        catchainMaxDeps: ot,
        maxBlockBytes: lt,
        maxColaltedBytes: st,
        protoVersion: ut,
      };
    } else if (pe === 217) {
      const ne = g.loadUint(7),
        be = g.loadBit(),
        ke = g.loadUint(8),
        Me = g.loadUint(32),
        qe = g.loadUint(32),
        je = g.loadUint(32),
        Ve = g.loadUint(32),
        ot = g.loadUint(32),
        lt = g.loadUint(32),
        st = g.loadUint(32),
        ut = g.loadUint(16),
        pt = g.loadUint(32);
      return {
        flags: ne,
        newCatchainIds: be,
        roundCandidates: ke,
        nextCandidateDelay: Me,
        consensusTimeout: qe,
        fastAttempts: je,
        attemptDuration: Ve,
        catchainMaxDeps: ot,
        maxBlockBytes: lt,
        maxColaltedBytes: st,
        protoVersion: ut,
        catchainMaxBlocksCoeff: pt,
      };
    }
    throw new Error('Invalid config29');
  }
  function L(g) {
    if (!g) throw Error('No config31 slice');
    return [
      ...g.loadDict(t.Dictionary.Keys.Buffer(32), t.Dictionary.Values.Uint(0)),
    ].map((ne) => new t.Address(-1, ne[0]));
  }
  function Be(g) {
    if (!g) throw Error('No config44 slice');
    if (g.loadUint(8) !== 0) throw new Error('Invalid config44');
    const ne = g.loadDict(
        t.Dictionary.Keys.Buffer(36),
        t.Dictionary.Values.Uint(0),
      ),
      be = g.loadUint(32);
    return {
      addresses: [...ne].map(
        (Me) => new t.Address(Me[0].readInt32BE(), Me[0].subarray(4)),
      ),
      suspendedUntil: be,
    };
  }
  const ge = {
    serialize: () => {
      throw Error('not implemented');
    },
    parse: (g) => {
      if (g.loadUint(8) !== 176)
        throw new Error('Invalid precompiled contracts dict');
      return g.loadUintBig(64);
    },
  };
  function ve(g) {
    if (!g) throw Error('No config45 slice');
    if (g.loadUint(8) !== 192) throw new Error('Invalid config45');
    return [...g.loadDict(t.Dictionary.Keys.Buffer(32), ge)].map((be) => ({
      hash: be[0],
      gasUsed: be[1],
    }));
  }
  function xe(g) {
    if (g.loadUint(8) !== 54) throw new Error('Invalid proposal setup');
    const ne = g.loadUint(8),
      be = g.loadUint(8),
      ke = g.loadUint(8),
      Me = g.loadUint(8),
      qe = g.loadUint(32),
      je = g.loadUint(32),
      Ve = g.loadUint(32),
      ot = g.loadUint(32);
    return {
      minTotalRounds: ne,
      maxTotalRounds: be,
      minWins: ke,
      maxLoses: Me,
      minStoreSec: qe,
      maxStoreSec: je,
      bitPrice: Ve,
      cellPrice: ot,
    };
  }
  function Re(g) {
    if (!g) throw new Error('No voting setup');
    if (g.loadUint(8) !== 145) throw new Error('Invalid voting setup');
    const ne = xe(g.loadRef().beginParse()),
      be = xe(g.loadRef().beginParse());
    return { normalParams: ne, criticalParams: be };
  }
  function _e(g) {
    return t.Cell.fromBase64(g)
      .beginParse()
      .loadDictDirect(t.Dictionary.Keys.Int(32), t.Dictionary.Values.Cell());
  }
  function Oe(g, pe) {
    return _e(g).get(pe);
  }
  function De(g) {
    const pe = _e(g),
      ne = new Map();
    for (const [be, ke] of pe) ne.set(be, ke.beginParse());
    return ne;
  }
  function Ze(g) {
    return {
      configAddress: n(g.get(0)),
      electorAddress: n(g.get(1)),
      minterAddress: d(g.get(2)),
      feeCollectorAddress: d(g.get(3)),
      dnsRootAddress: d(g.get(4)),
      burningConfig: i(g.get(5)),
      globalVersion: D(g.get(8)),
      workchains: K(g.get(12)),
      voting: Re(g.get(11)),
      validators: { ...R(g.get(15)), ...C(g.get(16)), ...P(g.get(17)) },
      storagePrices: N(g.get(18)),
      gasPrices: { masterchain: $(g.get(20)), workchain: $(g.get(21)) },
      msgPrices: { masterchain: Se(g.get(24)), workchain: Se(g.get(25)) },
      validatorSets: {
        prevValidators: Y(g.get(32)),
        prevTempValidators: Y(g.get(33)),
        currentValidators: Y(g.get(34)),
        currentTempValidators: Y(g.get(35)),
        nextValidators: Y(g.get(36)),
        nextTempValidators: Y(g.get(37)),
      },
      validatorsPunish: G(g.get(40)),
      bridges: {
        ethereum: ue(g.get(71)),
        binance: ue(g.get(72)),
        polygon: ue(g.get(73)),
      },
      catchain: Ee(g.get(28)),
      consensus: He(g.get(29)),
    };
  }
  function Ke(g) {
    return {
      configAddress: n(g.get(0)),
      electorAddress: n(g.get(1)),
      minterAddress: d(g.get(2)),
      feeCollectorAddress: d(g.get(3)),
      dnsRootAddress: d(g.get(4)),
      burningConfig: i(g.get(5)),
      extraCurrenciesMintPrices: s(g.get(6)),
      extraCurrencies: f(g.get(7)),
      globalVersion: D(g.get(8)),
      configMandatoryParams: o(g.get(9)),
      configCriticalParams: y(g.get(10)),
      voting: Re(g.get(11)),
      workchains: K(g.get(12)),
      complaintCost: v(g.get(13)),
      blockCreationRewards: w(g.get(14)),
      validators: { ...R(g.get(15)), ...C(g.get(16)), ...P(g.get(17)) },
      storagePrices: N(g.get(18)),
      gasPrices: { masterchain: $(g.get(20)), workchain: $(g.get(21)) },
      blockLimits: { masterchain: ie(g.get(22)), workchain: ie(g.get(23)) },
      msgPrices: { masterchain: Se(g.get(24)), workchain: Se(g.get(25)) },
      catchain: Ee(g.get(28)),
      consensus: He(g.get(29)),
      fundamentalSmcAddr: L(g.get(31)),
      validatorSets: {
        prevValidators: Y(g.get(32)),
        prevTempValidators: Y(g.get(33)),
        currentValidators: Y(g.get(34)),
        currentTempValidators: Y(g.get(35)),
        nextValidators: Y(g.get(36)),
        nextTempValidators: Y(g.get(37)),
      },
      validatorsPunish: G(g.get(40)),
      suspended: Be(g.get(44)),
      precompiledContracts: ve(g.get(45)),
      bridges: {
        ethereum: ue(g.get(71)),
        binance: ue(g.get(72)),
        polygon: ue(g.get(73)),
      },
      tokenBridges: {
        ethereum: we(g.get(79)),
        binance: we(g.get(81)),
        polygon: we(g.get(82)),
      },
    };
  }
  return We;
}
var cr = {},
  Xu;
function Ph() {
  if (Xu) return cr;
  ((Xu = 1),
    Object.defineProperty(cr, '__esModule', { value: !0 }),
    (cr.computeStorageFees = d),
    (cr.computeFwdFees = u),
    (cr.computeGasPrices = a),
    (cr.computeExternalMessageFees = e),
    (cr.computeMessageForwardFees = r));
  const t = at();
  function d(s) {
    const {
      lastPaid: f,
      now: o,
      storagePrices: y,
      storageStat: v,
      special: w,
      masterchain: R,
    } = s;
    if (o <= f || y.length === 0 || o < y[0].utime_since || w) return BigInt(0);
    let C = Math.max(f, y[0].utime_since),
      P = BigInt(0);
    for (let E = 0; E < y.length && C < o; E++) {
      let N = E < y.length - 1 ? Math.min(o, y[E + 1].utime_since) : o,
        D = BigInt(0);
      if (C < N) {
        let G = N - C;
        ((D +=
          BigInt(v.cells) * (R ? y[E].mc_cell_price_ps : y[E].cell_price_ps)),
          (D +=
            BigInt(v.bits) * (R ? y[E].mc_bit_price_ps : y[E].bit_price_ps)),
          (D = D * BigInt(G)));
      }
      ((C = N), (P += D));
    }
    return i(P);
  }
  function u(s, f, o) {
    return s.lumpPrice + i(s.bitPrice * o + s.cellPrice * f);
  }
  function a(s, f) {
    return s <= f.flatLimit
      ? f.flatPrice
      : f.flatPrice + ((f.price * (s - f.flatLimit)) >> 16n);
  }
  function e(s, f) {
    let o = n(f);
    return (
      (o.bits -= f.bits.length),
      (o.cells -= 1),
      u(s, BigInt(o.cells), BigInt(o.bits))
    );
  }
  function r(s, f) {
    let o = (0, t.loadMessageRelaxed)(f.beginParse()),
      y = { bits: 0, cells: 0 };
    if (o.init) {
      const P = new t.Cell().asBuilder();
      (0, t.storeStateInit)(o.init)(P);
      const E = P.endCell();
      let N = n(E);
      ((N.bits -= E.bits.length),
        (N.cells -= 1),
        (y.bits += N.bits),
        (y.cells += N.cells));
    }
    let v = n(o.body);
    ((v.bits -= o.body.bits.length),
      (v.cells -= 1),
      (y.bits += v.bits),
      (y.cells += v.cells));
    let w = u(s, BigInt(y.cells), BigInt(y.bits)),
      R = (w * BigInt(s.firstFrac)) >> 16n,
      C = w - R;
    return { fees: R, remaining: C };
  }
  function n(s) {
    let f = s.bits.length,
      o = 1;
    for (let y of s.refs) {
      let v = n(y);
      ((o += v.cells), (f += v.bits));
    }
    return { bits: f, cells: o };
  }
  function i(s) {
    let f = s % 65536n,
      o = s >> 16n;
    return (f !== 0n && (o += 1n), o);
  }
  return cr;
}
var ec;
function Ah() {
  return (
    ec ||
      ((ec = 1),
      (function (t) {
        var d =
            (un && un.__createBinding) ||
            (Object.create
              ? function (K, Y, ue, we) {
                  we === void 0 && (we = ue);
                  var Ce = Object.getOwnPropertyDescriptor(Y, ue);
                  ((!Ce ||
                    ('get' in Ce
                      ? !Y.__esModule
                      : Ce.writable || Ce.configurable)) &&
                    (Ce = {
                      enumerable: !0,
                      get: function () {
                        return Y[ue];
                      },
                    }),
                    Object.defineProperty(K, we, Ce));
                }
              : function (K, Y, ue, we) {
                  (we === void 0 && (we = ue), (K[we] = Y[ue]));
                }),
          u =
            (un && un.__exportStar) ||
            function (K, Y) {
              for (var ue in K)
                ue !== 'default' &&
                  !Object.prototype.hasOwnProperty.call(Y, ue) &&
                  d(Y, K, ue);
            };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.computeStorageFees =
            t.computeMessageForwardFees =
            t.computeGasPrices =
            t.computeFwdFees =
            t.computeExternalMessageFees =
            t.loadConfigParamsAsSlice =
            t.loadConfigParamById =
            t.parseFullerConfig =
            t.parseFullConfig =
            t.parseVotingSetup =
            t.parseValidatorSet =
            t.parseProposalSetup =
            t.parseBridge =
            t.configParseWorkchainDescriptor =
            t.configParseValidatorSet =
            t.configParseMsgPrices =
            t.configParseMasterAddressRequired =
            t.configParseMasterAddress =
            t.configParseGasLimitsPrices =
            t.configParseBridge =
            t.configParse40 =
            t.configParse29 =
            t.configParse28 =
            t.configParse18 =
            t.configParse17 =
            t.configParse16 =
            t.configParse15 =
            t.configParse13 =
            t.configParse12 =
            t.configParse8 =
            t.configParse5 =
            t.ElectorContract =
            t.MultisigWallet =
            t.MultisigOrderBuilder =
            t.MultisigOrder =
            t.JettonWallet =
            t.JettonMaster =
            t.WalletContractV5R1 =
            t.WalletContractV5Beta =
            t.WalletContractV4 =
            t.WalletContractV3R2 =
            t.WalletContractV3R1 =
            t.WalletContractV2R2 =
            t.WalletContractV2R1 =
            t.WalletContractV1R3 =
            t.WalletContractV1R2 =
            t.WalletContractV1R1 =
            t.TonClient4 =
            t.TonClient =
            t.HttpApi =
              void 0),
          u(at(), t));
        var a = Jc();
        Object.defineProperty(t, 'HttpApi', {
          enumerable: !0,
          get: function () {
            return a.HttpApi;
          },
        });
        var e = Qf();
        Object.defineProperty(t, 'TonClient', {
          enumerable: !0,
          get: function () {
            return e.TonClient;
          },
        });
        var r = eh();
        Object.defineProperty(t, 'TonClient4', {
          enumerable: !0,
          get: function () {
            return r.TonClient4;
          },
        });
        var n = nh();
        Object.defineProperty(t, 'WalletContractV1R1', {
          enumerable: !0,
          get: function () {
            return n.WalletContractV1R1;
          },
        });
        var i = ih();
        Object.defineProperty(t, 'WalletContractV1R2', {
          enumerable: !0,
          get: function () {
            return i.WalletContractV1R2;
          },
        });
        var s = sh();
        Object.defineProperty(t, 'WalletContractV1R3', {
          enumerable: !0,
          get: function () {
            return s.WalletContractV1R3;
          },
        });
        var f = uh();
        Object.defineProperty(t, 'WalletContractV2R1', {
          enumerable: !0,
          get: function () {
            return f.WalletContractV2R1;
          },
        });
        var o = dh();
        Object.defineProperty(t, 'WalletContractV2R2', {
          enumerable: !0,
          get: function () {
            return o.WalletContractV2R2;
          },
        });
        var y = hh();
        Object.defineProperty(t, 'WalletContractV3R1', {
          enumerable: !0,
          get: function () {
            return y.WalletContractV3R1;
          },
        });
        var v = ph();
        Object.defineProperty(t, 'WalletContractV3R2', {
          enumerable: !0,
          get: function () {
            return v.WalletContractV3R2;
          },
        });
        var w = yh();
        Object.defineProperty(t, 'WalletContractV4', {
          enumerable: !0,
          get: function () {
            return w.WalletContractV4;
          },
        });
        var R = bh();
        Object.defineProperty(t, 'WalletContractV5Beta', {
          enumerable: !0,
          get: function () {
            return R.WalletContractV5Beta;
          },
        });
        var C = wh();
        Object.defineProperty(t, 'WalletContractV5R1', {
          enumerable: !0,
          get: function () {
            return C.WalletContractV5R1;
          },
        });
        var P = vh();
        Object.defineProperty(t, 'JettonMaster', {
          enumerable: !0,
          get: function () {
            return P.JettonMaster;
          },
        });
        var E = _h();
        Object.defineProperty(t, 'JettonWallet', {
          enumerable: !0,
          get: function () {
            return E.JettonWallet;
          },
        });
        var N = ud();
        Object.defineProperty(t, 'MultisigOrder', {
          enumerable: !0,
          get: function () {
            return N.MultisigOrder;
          },
        });
        var D = kh();
        Object.defineProperty(t, 'MultisigOrderBuilder', {
          enumerable: !0,
          get: function () {
            return D.MultisigOrderBuilder;
          },
        });
        var G = Ch();
        Object.defineProperty(t, 'MultisigWallet', {
          enumerable: !0,
          get: function () {
            return G.MultisigWallet;
          },
        });
        var te = Sh();
        Object.defineProperty(t, 'ElectorContract', {
          enumerable: !0,
          get: function () {
            return te.ElectorContract;
          },
        });
        var W = Bh();
        (Object.defineProperty(t, 'configParse5', {
          enumerable: !0,
          get: function () {
            return W.configParse5;
          },
        }),
          Object.defineProperty(t, 'configParse8', {
            enumerable: !0,
            get: function () {
              return W.configParse8;
            },
          }),
          Object.defineProperty(t, 'configParse12', {
            enumerable: !0,
            get: function () {
              return W.configParse12;
            },
          }),
          Object.defineProperty(t, 'configParse13', {
            enumerable: !0,
            get: function () {
              return W.configParse13;
            },
          }),
          Object.defineProperty(t, 'configParse15', {
            enumerable: !0,
            get: function () {
              return W.configParse15;
            },
          }),
          Object.defineProperty(t, 'configParse16', {
            enumerable: !0,
            get: function () {
              return W.configParse16;
            },
          }),
          Object.defineProperty(t, 'configParse17', {
            enumerable: !0,
            get: function () {
              return W.configParse17;
            },
          }),
          Object.defineProperty(t, 'configParse18', {
            enumerable: !0,
            get: function () {
              return W.configParse18;
            },
          }),
          Object.defineProperty(t, 'configParse28', {
            enumerable: !0,
            get: function () {
              return W.configParse28;
            },
          }),
          Object.defineProperty(t, 'configParse29', {
            enumerable: !0,
            get: function () {
              return W.configParse29;
            },
          }),
          Object.defineProperty(t, 'configParse40', {
            enumerable: !0,
            get: function () {
              return W.configParse40;
            },
          }),
          Object.defineProperty(t, 'configParseBridge', {
            enumerable: !0,
            get: function () {
              return W.configParseBridge;
            },
          }),
          Object.defineProperty(t, 'configParseGasLimitsPrices', {
            enumerable: !0,
            get: function () {
              return W.configParseGasLimitsPrices;
            },
          }),
          Object.defineProperty(t, 'configParseMasterAddress', {
            enumerable: !0,
            get: function () {
              return W.configParseMasterAddress;
            },
          }),
          Object.defineProperty(t, 'configParseMasterAddressRequired', {
            enumerable: !0,
            get: function () {
              return W.configParseMasterAddressRequired;
            },
          }),
          Object.defineProperty(t, 'configParseMsgPrices', {
            enumerable: !0,
            get: function () {
              return W.configParseMsgPrices;
            },
          }),
          Object.defineProperty(t, 'configParseValidatorSet', {
            enumerable: !0,
            get: function () {
              return W.configParseValidatorSet;
            },
          }),
          Object.defineProperty(t, 'configParseWorkchainDescriptor', {
            enumerable: !0,
            get: function () {
              return W.configParseWorkchainDescriptor;
            },
          }),
          Object.defineProperty(t, 'parseBridge', {
            enumerable: !0,
            get: function () {
              return W.parseBridge;
            },
          }),
          Object.defineProperty(t, 'parseProposalSetup', {
            enumerable: !0,
            get: function () {
              return W.parseProposalSetup;
            },
          }),
          Object.defineProperty(t, 'parseValidatorSet', {
            enumerable: !0,
            get: function () {
              return W.parseValidatorSet;
            },
          }),
          Object.defineProperty(t, 'parseVotingSetup', {
            enumerable: !0,
            get: function () {
              return W.parseVotingSetup;
            },
          }),
          Object.defineProperty(t, 'parseFullConfig', {
            enumerable: !0,
            get: function () {
              return W.parseFullConfig;
            },
          }),
          Object.defineProperty(t, 'parseFullerConfig', {
            enumerable: !0,
            get: function () {
              return W.parseFullerConfig;
            },
          }),
          Object.defineProperty(t, 'loadConfigParamById', {
            enumerable: !0,
            get: function () {
              return W.loadConfigParamById;
            },
          }),
          Object.defineProperty(t, 'loadConfigParamsAsSlice', {
            enumerable: !0,
            get: function () {
              return W.loadConfigParamsAsSlice;
            },
          }));
        var F = Ph();
        (Object.defineProperty(t, 'computeExternalMessageFees', {
          enumerable: !0,
          get: function () {
            return F.computeExternalMessageFees;
          },
        }),
          Object.defineProperty(t, 'computeFwdFees', {
            enumerable: !0,
            get: function () {
              return F.computeFwdFees;
            },
          }),
          Object.defineProperty(t, 'computeGasPrices', {
            enumerable: !0,
            get: function () {
              return F.computeGasPrices;
            },
          }),
          Object.defineProperty(t, 'computeMessageForwardFees', {
            enumerable: !0,
            get: function () {
              return F.computeMessageForwardFees;
            },
          }),
          Object.defineProperty(t, 'computeStorageFees', {
            enumerable: !0,
            get: function () {
              return F.computeStorageFees;
            },
          }));
      })(un)),
    un
  );
}
var zh = Ah();
export { zh as a, Rh as d };
