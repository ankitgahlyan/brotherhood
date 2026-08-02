var I1 = Object.defineProperty;
var wa = (n) => {
  throw TypeError(n);
};
var S1 = (n, i, l) =>
  i in n
    ? I1(n, i, { enumerable: !0, configurable: !0, writable: !0, value: l })
    : (n[i] = l);
var Er = (n, i, l) => S1(n, typeof i != 'symbol' ? i + '' : i, l),
  qi = (n, i, l) => i.has(n) || wa('Cannot ' + l);
var j = (n, i, l) => (
    qi(n, i, 'read from private field'),
    l ? l.call(n) : i.get(n)
  ),
  Ie = (n, i, l) =>
    i.has(n)
      ? wa('Cannot add the same private member more than once')
      : i instanceof WeakSet
        ? i.add(n)
        : i.set(n, l),
  pe = (n, i, l, u) => (
    qi(n, i, 'write to private field'),
    u ? u.call(n, l) : i.set(n, l),
    l
  ),
  Ct = (n, i, l) => (qi(n, i, 'access private method'), l);
var gi = (n, i, l, u) => ({
  set _(g) {
    pe(n, i, g, l);
  },
  get _() {
    return j(n, i, u);
  },
});
import { r as P, R as ts, j as b, d as T1, c as xi } from './react-8fKfBBvl.js';
import { u as yl, b as R1, a as Ca, c as v1 } from './tonconnect-DPuITiDr.js';
import { d as ee, a as N1 } from './ton-sdk-OTheuEh2.js';
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const El = (...n) =>
  n
    .filter((i, l, u) => !!i && i.trim() !== '' && u.indexOf(i) === l)
    .join(' ')
    .trim();
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M1 = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const D1 = (n) =>
  n.replace(/^([A-Z])|[\s-_]+(\w)/g, (i, l, u) =>
    u ? u.toUpperCase() : l.toLowerCase(),
  );
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ya = (n) => {
  const i = D1(n);
  return i.charAt(0).toUpperCase() + i.slice(1);
};
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var Zi = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const O1 = (n) => {
    for (const i in n)
      if (i.startsWith('aria-') || i === 'role' || i === 'title') return !0;
    return !1;
  },
  P1 = P.createContext({}),
  B1 = () => P.useContext(P1),
  _1 = P.forwardRef(
    (
      {
        color: n,
        size: i,
        strokeWidth: l,
        absoluteStrokeWidth: u,
        className: g = '',
        children: h,
        iconNode: w,
        ...y
      },
      I,
    ) => {
      const {
          size: p = 24,
          strokeWidth: R = 2,
          absoluteStrokeWidth: T = !1,
          color: _ = 'currentColor',
          className: D = '',
        } = B1() ?? {},
        z = (u ?? T) ? (Number(l ?? R) * 24) / Number(i ?? p) : (l ?? R);
      return P.createElement(
        'svg',
        {
          ref: I,
          ...Zi,
          width: i ?? p ?? Zi.width,
          height: i ?? p ?? Zi.height,
          stroke: n ?? _,
          strokeWidth: z,
          className: El('lucide', D, g),
          ...(!h && !O1(y) && { 'aria-hidden': 'true' }),
          ...y,
        },
        [
          ...w.map(([M, X]) => P.createElement(M, X)),
          ...(Array.isArray(h) ? h : [h]),
        ],
      );
    },
  );
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pr = (n, i) => {
  const l = P.forwardRef(({ className: u, ...g }, h) =>
    P.createElement(_1, {
      ref: h,
      iconNode: i,
      className: El(`lucide-${M1(ya(n))}`, `lucide-${n}`, u),
      ...g,
    }),
  );
  return ((l.displayName = ya(n)), l);
};
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const L1 = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '12', key: '1pkeuh' }],
    ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16', key: '4dfq90' }],
  ],
  bl = pr('circle-alert', L1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const k1 = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
  ],
  F1 = pr('circle-check', k1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U1 = [
    ['path', { d: 'M10.5 3 8 9l4 13 4-13-2.5-6', key: 'b3dvk1' }],
    [
      'path',
      {
        d: 'M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z',
        key: '7w4byz',
      },
    ],
    ['path', { d: 'M2 9h20', key: '16fsjt' }],
  ],
  j1 = pr('gem', U1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const z1 = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'M12 16v-4', key: '1dtifu' }],
    ['path', { d: 'M12 8h.01', key: 'e9boi3' }],
  ],
  V1 = pr('info', z1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const W1 = [
    [
      'rect',
      {
        width: '18',
        height: '11',
        x: '3',
        y: '11',
        rx: '2',
        ry: '2',
        key: '1w4ew1',
      },
    ],
    ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4', key: 'fwvmzm' }],
  ],
  H1 = pr('lock', W1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Q1 = [
    [
      'path',
      {
        d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
        key: 'kfwtm',
      },
    ],
  ],
  X1 = pr('moon', Q1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const G1 = [
    [
      'rect',
      { width: '5', height: '5', x: '3', y: '3', rx: '1', key: '1tu5fj' },
    ],
    [
      'rect',
      { width: '5', height: '5', x: '16', y: '3', rx: '1', key: '1v8r4q' },
    ],
    [
      'rect',
      { width: '5', height: '5', x: '3', y: '16', rx: '1', key: '1x03jg' },
    ],
    ['path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3', key: '177gqh' }],
    ['path', { d: 'M21 21v.01', key: 'ents32' }],
    ['path', { d: 'M12 7v3a2 2 0 0 1-2 2H7', key: '8crl2c' }],
    ['path', { d: 'M3 12h.01', key: 'nlz23k' }],
    ['path', { d: 'M12 3h.01', key: 'n36tog' }],
    ['path', { d: 'M12 16v.01', key: '133mhm' }],
    ['path', { d: 'M16 12h1', key: '1slzba' }],
    ['path', { d: 'M21 12v.01', key: '1lwtk9' }],
    ['path', { d: 'M12 21v-1', key: '1880an' }],
  ],
  Y1 = pr('qr-code', G1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const K1 = [
    ['path', { d: 'm21 21-4.34-4.34', key: '14j7rj' }],
    ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ],
  J1 = pr('search', K1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const q1 = [
    ['circle', { cx: '12', cy: '12', r: '4', key: '4exip2' }],
    ['path', { d: 'M12 2v2', key: 'tus03m' }],
    ['path', { d: 'M12 20v2', key: '1lh1kg' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41', key: '149t6j' }],
    ['path', { d: 'm17.66 17.66 1.41 1.41', key: 'ptbguv' }],
    ['path', { d: 'M2 12h2', key: '1t8f8n' }],
    ['path', { d: 'M20 12h2', key: '1q8mjw' }],
    ['path', { d: 'm6.34 17.66-1.41 1.41', key: '1m8zz5' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41', key: '1shlcs' }],
  ],
  Z1 = pr('sun', q1);
/**
 * @license lucide-react v1.28.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $1 = [
    [
      'path',
      {
        d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
        key: '18etb6',
      },
    ],
    ['path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4', key: 'xoc0q4' }],
  ],
  eu = pr('wallet', $1);
var tu = Object.defineProperty,
  Mo = (n, i) => tu(n, 'name', { value: i, configurable: !0 });
function ao(n, i) {
  if (typeof n == 'function') return n(i);
  n != null && (n.current = i);
}
Mo(ao, 'setRef');
function Il(...n) {
  return (i) => {
    let l = !1;
    const u = n.map((g) => {
      const h = ao(g, i);
      return (!l && typeof h == 'function' && (l = !0), h);
    });
    if (l)
      return () => {
        for (let g = 0; g < u.length; g++) {
          const h = u[g];
          typeof h == 'function' ? h() : ao(n[g], null);
        }
      };
  };
}
Mo(Il, 'composeRefs');
function Gr(...n) {
  return P.useCallback(Il(...n), n);
}
Mo(Gr, 'useComposedRefs');
var ru = Object.defineProperty,
  nr = (n, i) => ru(n, 'name', { value: i, configurable: !0 });
function In(n) {
  const i = P.forwardRef((l, u) => {
    let { children: g, ...h } = l,
      w = null,
      y = !1;
    const I = [];
    (lo(g) && typeof Ai == 'function' && (g = Ai(g._payload)),
      P.Children.forEach(g, (_) => {
        var D;
        if (vl(_)) {
          y = !0;
          const z = _;
          let M = 'child' in z.props ? z.props.child : z.props.children;
          (lo(M) && typeof Ai == 'function' && (M = Ai(M._payload)),
            (w = iu(z, M)),
            I.push(
              (D = w == null ? void 0 : w.props) == null ? void 0 : D.children,
            ));
        } else I.push(_);
      }),
      w
        ? (w = P.cloneElement(w, void 0, I))
        : !y && P.Children.count(g) === 1 && P.isValidElement(g) && (w = g));
    const p = w ? Rl(w) : void 0,
      R = Gr(u, p);
    if (!w) {
      if (g || g === 0) throw new Error(y ? lu(n) : au(n));
      return g;
    }
    const T = Tl(h, w.props ?? {});
    return (w.type !== P.Fragment && (T.ref = u ? R : p), P.cloneElement(w, T));
  });
  return ((i.displayName = `${n}.Slot`), i);
}
nr(In, 'createSlot');
var nu = In('Slot'),
  Sl = Symbol.for('radix.slottable');
function su(n) {
  const i = nr(
    (l) => ('child' in l ? l.children(l.child) : l.children),
    'Slottable',
  );
  return ((i.displayName = `${n}.Slottable`), (i.__radixId = Sl), i);
}
nr(su, 'createSlottable');
var iu = nr((n, i) => {
  if ('child' in n.props) {
    const l = n.props.child;
    return P.isValidElement(l)
      ? P.cloneElement(l, void 0, n.props.children(l.props.children))
      : null;
  }
  return P.isValidElement(i) ? i : null;
}, 'getSlottableElementFromSlottable');
function Tl(n, i) {
  const l = { ...i };
  for (const u in i) {
    const g = n[u],
      h = i[u];
    /^on[A-Z]/.test(u)
      ? g && h
        ? (l[u] = (...y) => {
            const I = h(...y);
            return (g(...y), I);
          })
        : g && (l[u] = g)
      : u === 'style'
        ? (l[u] = { ...g, ...h })
        : u === 'className' && (l[u] = [g, h].filter(Boolean).join(' '));
  }
  return { ...n, ...l };
}
nr(Tl, 'mergeProps');
function Rl(n) {
  var u, g;
  let i =
      (u = Object.getOwnPropertyDescriptor(n.props, 'ref')) == null
        ? void 0
        : u.get,
    l = i && 'isReactWarning' in i && i.isReactWarning;
  return l
    ? n.ref
    : ((i =
        (g = Object.getOwnPropertyDescriptor(n, 'ref')) == null
          ? void 0
          : g.get),
      (l = i && 'isReactWarning' in i && i.isReactWarning),
      l ? n.props.ref : n.props.ref || n.ref);
}
nr(Rl, 'getElementRef');
function vl(n) {
  return (
    P.isValidElement(n) &&
    typeof n.type == 'function' &&
    '__radixId' in n.type &&
    n.type.__radixId === Sl
  );
}
nr(vl, 'isSlottable');
var ou = Symbol.for('react.lazy');
function lo(n) {
  return (
    n != null &&
    typeof n == 'object' &&
    '$$typeof' in n &&
    n.$$typeof === ou &&
    '_payload' in n &&
    Nl(n._payload)
  );
}
nr(lo, 'isLazyComponent');
function Nl(n) {
  return typeof n == 'object' && n !== null && 'then' in n;
}
nr(Nl, 'isPromiseLike');
var au = nr(
    (n) =>
      `${n} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`,
    'createSlotError',
  ),
  lu = nr(
    (n) =>
      `${n} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`,
    'createSlottableError',
  ),
  Ai = ts[' use '.trim().toString()];
function Ml(n) {
  var i,
    l,
    u = '';
  if (typeof n == 'string' || typeof n == 'number') u += n;
  else if (typeof n == 'object')
    if (Array.isArray(n)) {
      var g = n.length;
      for (i = 0; i < g; i++)
        n[i] && (l = Ml(n[i])) && (u && (u += ' '), (u += l));
    } else for (l in n) n[l] && (u && (u += ' '), (u += l));
  return u;
}
function Dl() {
  for (var n, i, l = 0, u = '', g = arguments.length; l < g; l++)
    (n = arguments[l]) && (i = Ml(n)) && (u && (u += ' '), (u += i));
  return u;
}
const Ea = (n) => (typeof n == 'boolean' ? `${n}` : n === 0 ? '0' : n),
  ba = Dl,
  Do = (n, i) => (l) => {
    var u;
    if ((i == null ? void 0 : i.variants) == null)
      return ba(
        n,
        l == null ? void 0 : l.class,
        l == null ? void 0 : l.className,
      );
    const { variants: g, defaultVariants: h } = i,
      w = Object.keys(g).map((p) => {
        const R = l == null ? void 0 : l[p],
          T = h == null ? void 0 : h[p];
        if (R === null) return null;
        const _ = Ea(R) || Ea(T);
        return g[p][_];
      }),
      y =
        l &&
        Object.entries(l).reduce((p, R) => {
          let [T, _] = R;
          return (_ === void 0 || (p[T] = _), p);
        }, {}),
      I =
        i == null || (u = i.compoundVariants) === null || u === void 0
          ? void 0
          : u.reduce((p, R) => {
              let { class: T, className: _, ...D } = R;
              return Object.entries(D).every((z) => {
                let [M, X] = z;
                return Array.isArray(X)
                  ? X.includes({ ...h, ...y }[M])
                  : { ...h, ...y }[M] === X;
              })
                ? [...p, T, _]
                : p;
            }, []);
    return ba(
      n,
      w,
      I,
      l == null ? void 0 : l.class,
      l == null ? void 0 : l.className,
    );
  },
  cu = (n, i) => {
    const l = new Array(n.length + i.length);
    for (let u = 0; u < n.length; u++) l[u] = n[u];
    for (let u = 0; u < i.length; u++) l[n.length + u] = i[u];
    return l;
  },
  uu = (n, i) => ({ classGroupId: n, validator: i }),
  Ol = (n = new Map(), i = null, l) => ({
    nextPart: n,
    validators: i,
    classGroupId: l,
  }),
  yi = '-',
  Ia = [],
  du = 'arbitrary..',
  fu = (n) => {
    const i = gu(n),
      { conflictingClassGroups: l, conflictingClassGroupModifiers: u } = n;
    return {
      getClassGroupId: (w) => {
        if (w.startsWith('[') && w.endsWith(']')) return hu(w);
        const y = w.split(yi),
          I = y[0] === '' && y.length > 1 ? 1 : 0;
        return Pl(y, I, i);
      },
      getConflictingClassGroupIds: (w, y) => {
        if (y) {
          const I = u[w],
            p = l[w];
          return I ? (p ? cu(p, I) : I) : p || Ia;
        }
        return l[w] || Ia;
      },
    };
  },
  Pl = (n, i, l) => {
    if (n.length - i === 0) return l.classGroupId;
    const g = n[i],
      h = l.nextPart.get(g);
    if (h) {
      const p = Pl(n, i + 1, h);
      if (p) return p;
    }
    const w = l.validators;
    if (w === null) return;
    const y = i === 0 ? n.join(yi) : n.slice(i).join(yi),
      I = w.length;
    for (let p = 0; p < I; p++) {
      const R = w[p];
      if (R.validator(y)) return R.classGroupId;
    }
  },
  hu = (n) =>
    n.slice(1, -1).indexOf(':') === -1
      ? void 0
      : (() => {
          const i = n.slice(1, -1),
            l = i.indexOf(':'),
            u = i.slice(0, l);
          return u ? du + u : void 0;
        })(),
  gu = (n) => {
    const { theme: i, classGroups: l } = n;
    return xu(l, i);
  },
  xu = (n, i) => {
    const l = Ol();
    for (const u in n) {
      const g = n[u];
      Oo(g, l, u, i);
    }
    return l;
  },
  Oo = (n, i, l, u) => {
    const g = n.length;
    for (let h = 0; h < g; h++) {
      const w = n[h];
      Au(w, i, l, u);
    }
  },
  Au = (n, i, l, u) => {
    if (typeof n == 'string') {
      mu(n, i, l);
      return;
    }
    if (typeof n == 'function') {
      pu(n, i, l, u);
      return;
    }
    wu(n, i, l, u);
  },
  mu = (n, i, l) => {
    const u = n === '' ? i : Bl(i, n);
    u.classGroupId = l;
  },
  pu = (n, i, l, u) => {
    if (Cu(n)) {
      Oo(n(u), i, l, u);
      return;
    }
    (i.validators === null && (i.validators = []), i.validators.push(uu(l, n)));
  },
  wu = (n, i, l, u) => {
    const g = Object.entries(n),
      h = g.length;
    for (let w = 0; w < h; w++) {
      const [y, I] = g[w];
      Oo(I, Bl(i, y), l, u);
    }
  },
  Bl = (n, i) => {
    let l = n;
    const u = i.split(yi),
      g = u.length;
    for (let h = 0; h < g; h++) {
      const w = u[h];
      let y = l.nextPart.get(w);
      (y || ((y = Ol()), l.nextPart.set(w, y)), (l = y));
    }
    return l;
  },
  Cu = (n) => 'isThemeGetter' in n && n.isThemeGetter === !0,
  yu = (n) => {
    if (n < 1) return { get: () => {}, set: () => {} };
    let i = 0,
      l = Object.create(null),
      u = Object.create(null);
    const g = (h, w) => {
      ((l[h] = w), i++, i > n && ((i = 0), (u = l), (l = Object.create(null))));
    };
    return {
      get(h) {
        let w = l[h];
        if (w !== void 0) return w;
        if ((w = u[h]) !== void 0) return (g(h, w), w);
      },
      set(h, w) {
        h in l ? (l[h] = w) : g(h, w);
      },
    };
  },
  co = '!',
  Sa = ':',
  Eu = [],
  Ta = (n, i, l, u, g) => ({
    modifiers: n,
    hasImportantModifier: i,
    baseClassName: l,
    maybePostfixModifierPosition: u,
    isExternal: g,
  }),
  bu = (n) => {
    const { prefix: i, experimentalParseClassName: l } = n;
    let u = (g) => {
      const h = [];
      let w = 0,
        y = 0,
        I = 0,
        p;
      const R = g.length;
      for (let M = 0; M < R; M++) {
        const X = g[M];
        if (w === 0 && y === 0) {
          if (X === Sa) {
            (h.push(g.slice(I, M)), (I = M + 1));
            continue;
          }
          if (X === '/') {
            p = M;
            continue;
          }
        }
        X === '[' ? w++ : X === ']' ? w-- : X === '(' ? y++ : X === ')' && y--;
      }
      const T = h.length === 0 ? g : g.slice(I);
      let _ = T,
        D = !1;
      T.endsWith(co)
        ? ((_ = T.slice(0, -1)), (D = !0))
        : T.startsWith(co) && ((_ = T.slice(1)), (D = !0));
      const z = p && p > I ? p - I : void 0;
      return Ta(h, D, _, z);
    };
    if (i) {
      const g = i + Sa,
        h = u;
      u = (w) =>
        w.startsWith(g) ? h(w.slice(g.length)) : Ta(Eu, !1, w, void 0, !0);
    }
    if (l) {
      const g = u;
      u = (h) => l({ className: h, parseClassName: g });
    }
    return u;
  },
  Iu = (n) => {
    const i = new Map();
    return (
      n.orderSensitiveModifiers.forEach((l, u) => {
        i.set(l, 1e6 + u);
      }),
      (l) => {
        const u = [];
        let g = [];
        for (let h = 0; h < l.length; h++) {
          const w = l[h],
            y = w[0] === '[',
            I = i.has(w);
          y || I
            ? (g.length > 0 && (g.sort(), u.push(...g), (g = [])), u.push(w))
            : g.push(w);
        }
        return (g.length > 0 && (g.sort(), u.push(...g)), u);
      }
    );
  },
  Su = (n) => ({
    cache: yu(n.cacheSize),
    parseClassName: bu(n),
    sortModifiers: Iu(n),
    postfixLookupClassGroupIds: Tu(n),
    ...fu(n),
  }),
  Tu = (n) => {
    const i = Object.create(null),
      l = n.postfixLookupClassGroups;
    if (l) for (let u = 0; u < l.length; u++) i[l[u]] = !0;
    return i;
  },
  Ru = /\s+/,
  vu = (n, i) => {
    const {
        parseClassName: l,
        getClassGroupId: u,
        getConflictingClassGroupIds: g,
        sortModifiers: h,
        postfixLookupClassGroupIds: w,
      } = i,
      y = [],
      I = n.trim().split(Ru);
    let p = '';
    for (let R = I.length - 1; R >= 0; R -= 1) {
      const T = I[R],
        {
          isExternal: _,
          modifiers: D,
          hasImportantModifier: z,
          baseClassName: M,
          maybePostfixModifierPosition: X,
        } = l(T);
      if (_) {
        p = T + (p.length > 0 ? ' ' + p : p);
        continue;
      }
      let Y = !!X,
        J;
      if (Y) {
        const Q = M.substring(0, X);
        J = u(Q);
        const V = J && w[J] ? u(M) : void 0;
        V && V !== J && ((J = V), (Y = !1));
      } else J = u(M);
      if (!J) {
        if (!Y) {
          p = T + (p.length > 0 ? ' ' + p : p);
          continue;
        }
        if (((J = u(M)), !J)) {
          p = T + (p.length > 0 ? ' ' + p : p);
          continue;
        }
        Y = !1;
      }
      const H = D.length === 0 ? '' : D.length === 1 ? D[0] : h(D).join(':'),
        W = z ? H + co : H,
        ne = W + J;
      if (y.indexOf(ne) > -1) continue;
      y.push(ne);
      const re = g(J, Y);
      for (let Q = 0; Q < re.length; ++Q) {
        const V = re[Q];
        y.push(W + V);
      }
      p = T + (p.length > 0 ? ' ' + p : p);
    }
    return p;
  },
  Nu = (...n) => {
    let i = 0,
      l,
      u,
      g = '';
    for (; i < n.length;)
      (l = n[i++]) && (u = _l(l)) && (g && (g += ' '), (g += u));
    return g;
  },
  _l = (n) => {
    if (typeof n == 'string') return n;
    let i,
      l = '';
    for (let u = 0; u < n.length; u++)
      n[u] && (i = _l(n[u])) && (l && (l += ' '), (l += i));
    return l;
  },
  Mu = (n, ...i) => {
    let l, u, g, h;
    const w = (I) => {
        const p = i.reduce((R, T) => T(R), n());
        return (
          (l = Su(p)),
          (u = l.cache.get),
          (g = l.cache.set),
          (h = y),
          y(I)
        );
      },
      y = (I) => {
        const p = u(I);
        if (p) return p;
        const R = vu(I, l);
        return (g(I, R), R);
      };
    return ((h = w), (...I) => h(Nu(...I)));
  },
  Du = [],
  ut = (n) => {
    const i = (l) => l[n] || Du;
    return ((i.isThemeGetter = !0), i);
  },
  Ll = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  kl = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  Ou = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/,
  Pu = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Bu =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  _u = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Lu = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  ku =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  Fr = (n) => Ou.test(n),
  be = (n) => !!n && !Number.isNaN(Number(n)),
  hr = (n) => !!n && Number.isInteger(Number(n)),
  $i = (n) => n.endsWith('%') && be(n.slice(0, -1)),
  br = (n) => Pu.test(n),
  Fl = () => !0,
  Fu = (n) => Bu.test(n) && !_u.test(n),
  Po = () => !1,
  Uu = (n) => Lu.test(n),
  ju = (n) => ku.test(n),
  zu = (n) => !le(n) && !ue(n),
  Vu = (n) =>
    n.startsWith('@container') &&
    ((n[10] === '/' && n[11] !== void 0) ||
      (n[11] === 's' && n[16] !== void 0 && n.startsWith('-size/', 10)) ||
      (n[11] === 'n' && n[18] !== void 0 && n.startsWith('-normal/', 10))),
  Wu = (n) => Kr(n, zl, Po),
  le = (n) => Ll.test(n),
  rn = (n) => Kr(n, Vl, Fu),
  Ra = (n) => Kr(n, qu, be),
  Hu = (n) => Kr(n, Hl, Fl),
  Qu = (n) => Kr(n, Wl, Po),
  va = (n) => Kr(n, Ul, Po),
  Xu = (n) => Kr(n, jl, ju),
  mi = (n) => Kr(n, Ql, Uu),
  ue = (n) => kl.test(n),
  ms = (n) => Rn(n, Vl),
  Gu = (n) => Rn(n, Wl),
  Na = (n) => Rn(n, Ul),
  Yu = (n) => Rn(n, zl),
  Ku = (n) => Rn(n, jl),
  pi = (n) => Rn(n, Ql, !0),
  Ju = (n) => Rn(n, Hl, !0),
  Kr = (n, i, l) => {
    const u = Ll.exec(n);
    return u ? (u[1] ? i(u[1]) : l(u[2])) : !1;
  },
  Rn = (n, i, l = !1) => {
    const u = kl.exec(n);
    return u ? (u[1] ? i(u[1]) : l) : !1;
  },
  Ul = (n) => n === 'position' || n === 'percentage',
  jl = (n) => n === 'image' || n === 'url',
  zl = (n) => n === 'length' || n === 'size' || n === 'bg-size',
  Vl = (n) => n === 'length',
  qu = (n) => n === 'number',
  Wl = (n) => n === 'family-name',
  Hl = (n) => n === 'number' || n === 'weight',
  Ql = (n) => n === 'shadow',
  Zu = () => {
    const n = ut('color'),
      i = ut('font'),
      l = ut('text'),
      u = ut('font-weight'),
      g = ut('tracking'),
      h = ut('leading'),
      w = ut('breakpoint'),
      y = ut('container'),
      I = ut('spacing'),
      p = ut('radius'),
      R = ut('shadow'),
      T = ut('inset-shadow'),
      _ = ut('text-shadow'),
      D = ut('drop-shadow'),
      z = ut('blur'),
      M = ut('perspective'),
      X = ut('aspect'),
      Y = ut('ease'),
      J = ut('animate'),
      H = () => [
        'auto',
        'avoid',
        'all',
        'avoid-page',
        'page',
        'left',
        'right',
        'column',
      ],
      W = () => [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'left-top',
        'top-right',
        'right-top',
        'bottom-right',
        'right-bottom',
        'bottom-left',
        'left-bottom',
      ],
      ne = () => [...W(), ue, le],
      re = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'],
      Q = () => ['auto', 'contain', 'none'],
      V = () => [ue, le, I],
      L = () => [Fr, 'full', 'auto', ...V()],
      We = () => [hr, 'none', 'subgrid', ue, le],
      xe = () => ['auto', { span: ['full', hr, ue, le] }, hr, ue, le],
      se = () => [hr, 'auto', ue, le],
      $ = () => ['auto', 'min', 'max', 'fr', ue, le],
      we = () => [
        'start',
        'end',
        'center',
        'between',
        'around',
        'evenly',
        'stretch',
        'baseline',
        'center-safe',
        'end-safe',
      ],
      k = () => [
        'start',
        'end',
        'center',
        'stretch',
        'center-safe',
        'end-safe',
      ],
      Te = () => ['auto', ...V()],
      ie = () => [
        Fr,
        'auto',
        'full',
        'dvw',
        'dvh',
        'lvw',
        'lvh',
        'svw',
        'svh',
        'min',
        'max',
        'fit',
        ...V(),
      ],
      wr = () => [
        Fr,
        'screen',
        'full',
        'dvw',
        'lvw',
        'svw',
        'min',
        'max',
        'fit',
        ...V(),
      ],
      zt = () => [
        Fr,
        'screen',
        'full',
        'lh',
        'dvh',
        'lvh',
        'svh',
        'min',
        'max',
        'fit',
        ...V(),
      ],
      fe = () => [n, ue, le],
      os = () => [...W(), Na, va, { position: [ue, le] }],
      dt = () => ['no-repeat', { repeat: ['', 'x', 'y', 'space', 'round'] }],
      ir = () => ['auto', 'cover', 'contain', Yu, Wu, { size: [ue, le] }],
      st = () => [$i, ms, rn],
      it = () => ['', 'none', 'full', p, ue, le],
      oe = () => ['', be, ms, rn],
      Nr = () => ['solid', 'dashed', 'dotted', 'double'],
      Ze = () => [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
        'luminosity',
      ],
      ze = () => [be, $i, Na, va],
      Mr = () => ['', 'none', z, ue, le],
      ot = () => ['none', be, ue, le],
      Cr = () => ['none', be, ue, le],
      Re = () => [be, ue, le],
      Kt = () => [Fr, 'full', ...V()];
    return {
      cacheSize: 500,
      theme: {
        animate: ['spin', 'ping', 'pulse', 'bounce'],
        aspect: ['video'],
        blur: [br],
        breakpoint: [br],
        color: [Fl],
        container: [br],
        'drop-shadow': [br],
        ease: ['in', 'out', 'in-out'],
        font: [zu],
        'font-weight': [
          'thin',
          'extralight',
          'light',
          'normal',
          'medium',
          'semibold',
          'bold',
          'extrabold',
          'black',
        ],
        'inset-shadow': [br],
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        perspective: [
          'dramatic',
          'near',
          'normal',
          'midrange',
          'distant',
          'none',
        ],
        radius: [br],
        shadow: [br],
        spacing: ['px', be],
        text: [br],
        'text-shadow': [br],
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
      },
      classGroups: {
        aspect: [{ aspect: ['auto', 'square', Fr, le, ue, X] }],
        container: ['container'],
        'container-type': [{ '@container': ['', 'normal', 'size', ue, le] }],
        'container-named': [Vu],
        columns: [{ columns: [be, le, ue, y] }],
        'break-after': [{ 'break-after': H() }],
        'break-before': [{ 'break-before': H() }],
        'break-inside': [
          { 'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'] },
        ],
        'box-decoration': [{ 'box-decoration': ['slice', 'clone'] }],
        box: [{ box: ['border', 'content'] }],
        display: [
          'block',
          'inline-block',
          'inline',
          'flex',
          'inline-flex',
          'table',
          'inline-table',
          'table-caption',
          'table-cell',
          'table-column',
          'table-column-group',
          'table-footer-group',
          'table-header-group',
          'table-row-group',
          'table-row',
          'flow-root',
          'grid',
          'inline-grid',
          'contents',
          'list-item',
          'hidden',
        ],
        sr: ['sr-only', 'not-sr-only'],
        float: [{ float: ['right', 'left', 'none', 'start', 'end'] }],
        clear: [{ clear: ['left', 'right', 'both', 'none', 'start', 'end'] }],
        isolation: ['isolate', 'isolation-auto'],
        'object-fit': [
          { object: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
        ],
        'object-position': [{ object: ne() }],
        overflow: [{ overflow: re() }],
        'overflow-x': [{ 'overflow-x': re() }],
        'overflow-y': [{ 'overflow-y': re() }],
        overscroll: [{ overscroll: Q() }],
        'overscroll-x': [{ 'overscroll-x': Q() }],
        'overscroll-y': [{ 'overscroll-y': Q() }],
        position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
        inset: [{ inset: L() }],
        'inset-x': [{ 'inset-x': L() }],
        'inset-y': [{ 'inset-y': L() }],
        start: [{ 'inset-s': L(), start: L() }],
        end: [{ 'inset-e': L(), end: L() }],
        'inset-bs': [{ 'inset-bs': L() }],
        'inset-be': [{ 'inset-be': L() }],
        top: [{ top: L() }],
        right: [{ right: L() }],
        bottom: [{ bottom: L() }],
        left: [{ left: L() }],
        visibility: ['visible', 'invisible', 'collapse'],
        z: [{ z: [hr, 'auto', ue, le] }],
        basis: [{ basis: [Fr, 'full', 'auto', y, ...V()] }],
        'flex-direction': [
          { flex: ['row', 'row-reverse', 'col', 'col-reverse'] },
        ],
        'flex-wrap': [{ flex: ['nowrap', 'wrap', 'wrap-reverse'] }],
        flex: [{ flex: [be, Fr, 'auto', 'initial', 'none', le] }],
        grow: [{ grow: ['', be, ue, le] }],
        shrink: [{ shrink: ['', be, ue, le] }],
        order: [{ order: [hr, 'first', 'last', 'none', ue, le] }],
        'grid-cols': [{ 'grid-cols': We() }],
        'col-start-end': [{ col: xe() }],
        'col-start': [{ 'col-start': se() }],
        'col-end': [{ 'col-end': se() }],
        'grid-rows': [{ 'grid-rows': We() }],
        'row-start-end': [{ row: xe() }],
        'row-start': [{ 'row-start': se() }],
        'row-end': [{ 'row-end': se() }],
        'grid-flow': [
          { 'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'] },
        ],
        'auto-cols': [{ 'auto-cols': $() }],
        'auto-rows': [{ 'auto-rows': $() }],
        gap: [{ gap: V() }],
        'gap-x': [{ 'gap-x': V() }],
        'gap-y': [{ 'gap-y': V() }],
        'justify-content': [{ justify: [...we(), 'normal'] }],
        'justify-items': [{ 'justify-items': [...k(), 'normal'] }],
        'justify-self': [{ 'justify-self': ['auto', ...k()] }],
        'align-content': [{ content: ['normal', ...we()] }],
        'align-items': [{ items: [...k(), { baseline: ['', 'last'] }] }],
        'align-self': [{ self: ['auto', ...k(), { baseline: ['', 'last'] }] }],
        'place-content': [{ 'place-content': we() }],
        'place-items': [{ 'place-items': [...k(), 'baseline'] }],
        'place-self': [{ 'place-self': ['auto', ...k()] }],
        p: [{ p: V() }],
        px: [{ px: V() }],
        py: [{ py: V() }],
        ps: [{ ps: V() }],
        pe: [{ pe: V() }],
        pbs: [{ pbs: V() }],
        pbe: [{ pbe: V() }],
        pt: [{ pt: V() }],
        pr: [{ pr: V() }],
        pb: [{ pb: V() }],
        pl: [{ pl: V() }],
        m: [{ m: Te() }],
        mx: [{ mx: Te() }],
        my: [{ my: Te() }],
        ms: [{ ms: Te() }],
        me: [{ me: Te() }],
        mbs: [{ mbs: Te() }],
        mbe: [{ mbe: Te() }],
        mt: [{ mt: Te() }],
        mr: [{ mr: Te() }],
        mb: [{ mb: Te() }],
        ml: [{ ml: Te() }],
        'space-x': [{ 'space-x': V() }],
        'space-x-reverse': ['space-x-reverse'],
        'space-y': [{ 'space-y': V() }],
        'space-y-reverse': ['space-y-reverse'],
        size: [{ size: ie() }],
        'inline-size': [{ inline: ['auto', ...wr()] }],
        'min-inline-size': [{ 'min-inline': ['auto', ...wr()] }],
        'max-inline-size': [{ 'max-inline': ['none', ...wr()] }],
        'block-size': [{ block: ['auto', ...zt()] }],
        'min-block-size': [{ 'min-block': ['auto', ...zt()] }],
        'max-block-size': [{ 'max-block': ['none', ...zt()] }],
        w: [{ w: [y, 'screen', ...ie()] }],
        'min-w': [{ 'min-w': [y, 'screen', 'none', ...ie()] }],
        'max-w': [
          { 'max-w': [y, 'screen', 'none', 'prose', { screen: [w] }, ...ie()] },
        ],
        h: [{ h: ['screen', 'lh', ...ie()] }],
        'min-h': [{ 'min-h': ['screen', 'lh', 'none', ...ie()] }],
        'max-h': [{ 'max-h': ['screen', 'lh', ...ie()] }],
        'font-size': [{ text: ['base', l, ms, rn] }],
        'font-smoothing': ['antialiased', 'subpixel-antialiased'],
        'font-style': ['italic', 'not-italic'],
        'font-weight': [{ font: [u, Ju, Hu] }],
        'font-stretch': [
          {
            'font-stretch': [
              'ultra-condensed',
              'extra-condensed',
              'condensed',
              'semi-condensed',
              'normal',
              'semi-expanded',
              'expanded',
              'extra-expanded',
              'ultra-expanded',
              $i,
              le,
            ],
          },
        ],
        'font-family': [{ font: [Gu, Qu, i] }],
        'font-features': [{ 'font-features': [le] }],
        'fvn-normal': ['normal-nums'],
        'fvn-ordinal': ['ordinal'],
        'fvn-slashed-zero': ['slashed-zero'],
        'fvn-figure': ['lining-nums', 'oldstyle-nums'],
        'fvn-spacing': ['proportional-nums', 'tabular-nums'],
        'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
        tracking: [{ tracking: [g, ue, le] }],
        'line-clamp': [{ 'line-clamp': [be, 'none', ue, Ra] }],
        leading: [{ leading: [h, ...V()] }],
        'list-image': [{ 'list-image': ['none', ue, le] }],
        'list-style-position': [{ list: ['inside', 'outside'] }],
        'list-style-type': [{ list: ['disc', 'decimal', 'none', ue, le] }],
        'text-alignment': [
          { text: ['left', 'center', 'right', 'justify', 'start', 'end'] },
        ],
        'placeholder-color': [{ placeholder: fe() }],
        'text-color': [{ text: fe() }],
        'text-decoration': [
          'underline',
          'overline',
          'line-through',
          'no-underline',
        ],
        'text-decoration-style': [{ decoration: [...Nr(), 'wavy'] }],
        'text-decoration-thickness': [
          { decoration: [be, 'from-font', 'auto', ue, rn] },
        ],
        'text-decoration-color': [{ decoration: fe() }],
        'underline-offset': [{ 'underline-offset': [be, 'auto', ue, le] }],
        'text-transform': [
          'uppercase',
          'lowercase',
          'capitalize',
          'normal-case',
        ],
        'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
        'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
        indent: [{ indent: V() }],
        'tab-size': [{ tab: [hr, ue, le] }],
        'vertical-align': [
          {
            align: [
              'baseline',
              'top',
              'middle',
              'bottom',
              'text-top',
              'text-bottom',
              'sub',
              'super',
              ue,
              le,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              'normal',
              'nowrap',
              'pre',
              'pre-line',
              'pre-wrap',
              'break-spaces',
            ],
          },
        ],
        break: [{ break: ['normal', 'words', 'all', 'keep'] }],
        wrap: [{ wrap: ['break-word', 'anywhere', 'normal'] }],
        hyphens: [{ hyphens: ['none', 'manual', 'auto'] }],
        content: [{ content: ['none', ue, le] }],
        'bg-attachment': [{ bg: ['fixed', 'local', 'scroll'] }],
        'bg-clip': [{ 'bg-clip': ['border', 'padding', 'content', 'text'] }],
        'bg-origin': [{ 'bg-origin': ['border', 'padding', 'content'] }],
        'bg-position': [{ bg: os() }],
        'bg-repeat': [{ bg: dt() }],
        'bg-size': [{ bg: ir() }],
        'bg-image': [
          {
            bg: [
              'none',
              {
                linear: [
                  { to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] },
                  hr,
                  ue,
                  le,
                ],
                radial: ['', ue, le],
                conic: [hr, ue, le],
              },
              Ku,
              Xu,
            ],
          },
        ],
        'bg-color': [{ bg: fe() }],
        'gradient-from-pos': [{ from: st() }],
        'gradient-via-pos': [{ via: st() }],
        'gradient-to-pos': [{ to: st() }],
        'gradient-from': [{ from: fe() }],
        'gradient-via': [{ via: fe() }],
        'gradient-to': [{ to: fe() }],
        rounded: [{ rounded: it() }],
        'rounded-s': [{ 'rounded-s': it() }],
        'rounded-e': [{ 'rounded-e': it() }],
        'rounded-t': [{ 'rounded-t': it() }],
        'rounded-r': [{ 'rounded-r': it() }],
        'rounded-b': [{ 'rounded-b': it() }],
        'rounded-l': [{ 'rounded-l': it() }],
        'rounded-ss': [{ 'rounded-ss': it() }],
        'rounded-se': [{ 'rounded-se': it() }],
        'rounded-ee': [{ 'rounded-ee': it() }],
        'rounded-es': [{ 'rounded-es': it() }],
        'rounded-tl': [{ 'rounded-tl': it() }],
        'rounded-tr': [{ 'rounded-tr': it() }],
        'rounded-br': [{ 'rounded-br': it() }],
        'rounded-bl': [{ 'rounded-bl': it() }],
        'border-w': [{ border: oe() }],
        'border-w-x': [{ 'border-x': oe() }],
        'border-w-y': [{ 'border-y': oe() }],
        'border-w-s': [{ 'border-s': oe() }],
        'border-w-e': [{ 'border-e': oe() }],
        'border-w-bs': [{ 'border-bs': oe() }],
        'border-w-be': [{ 'border-be': oe() }],
        'border-w-t': [{ 'border-t': oe() }],
        'border-w-r': [{ 'border-r': oe() }],
        'border-w-b': [{ 'border-b': oe() }],
        'border-w-l': [{ 'border-l': oe() }],
        'divide-x': [{ 'divide-x': oe() }],
        'divide-x-reverse': ['divide-x-reverse'],
        'divide-y': [{ 'divide-y': oe() }],
        'divide-y-reverse': ['divide-y-reverse'],
        'border-style': [{ border: [...Nr(), 'hidden', 'none'] }],
        'divide-style': [{ divide: [...Nr(), 'hidden', 'none'] }],
        'border-color': [{ border: fe() }],
        'border-color-x': [{ 'border-x': fe() }],
        'border-color-y': [{ 'border-y': fe() }],
        'border-color-s': [{ 'border-s': fe() }],
        'border-color-e': [{ 'border-e': fe() }],
        'border-color-bs': [{ 'border-bs': fe() }],
        'border-color-be': [{ 'border-be': fe() }],
        'border-color-t': [{ 'border-t': fe() }],
        'border-color-r': [{ 'border-r': fe() }],
        'border-color-b': [{ 'border-b': fe() }],
        'border-color-l': [{ 'border-l': fe() }],
        'divide-color': [{ divide: fe() }],
        'outline-style': [{ outline: [...Nr(), 'none', 'hidden'] }],
        'outline-offset': [{ 'outline-offset': [be, ue, le] }],
        'outline-w': [{ outline: ['', be, ms, rn] }],
        'outline-color': [{ outline: fe() }],
        shadow: [{ shadow: ['', 'none', R, pi, mi] }],
        'shadow-color': [{ shadow: fe() }],
        'inset-shadow': [{ 'inset-shadow': ['none', T, pi, mi] }],
        'inset-shadow-color': [{ 'inset-shadow': fe() }],
        'ring-w': [{ ring: oe() }],
        'ring-w-inset': ['ring-inset'],
        'ring-color': [{ ring: fe() }],
        'ring-offset-w': [{ 'ring-offset': [be, rn] }],
        'ring-offset-color': [{ 'ring-offset': fe() }],
        'inset-ring-w': [{ 'inset-ring': oe() }],
        'inset-ring-color': [{ 'inset-ring': fe() }],
        'text-shadow': [{ 'text-shadow': ['none', _, pi, mi] }],
        'text-shadow-color': [{ 'text-shadow': fe() }],
        opacity: [{ opacity: [be, ue, le] }],
        'mix-blend': [
          { 'mix-blend': [...Ze(), 'plus-darker', 'plus-lighter'] },
        ],
        'bg-blend': [{ 'bg-blend': Ze() }],
        'mask-clip': [
          {
            'mask-clip': [
              'border',
              'padding',
              'content',
              'fill',
              'stroke',
              'view',
            ],
          },
          'mask-no-clip',
        ],
        'mask-composite': [
          { mask: ['add', 'subtract', 'intersect', 'exclude'] },
        ],
        'mask-image-linear-pos': [{ 'mask-linear': [be] }],
        'mask-image-linear-from-pos': [{ 'mask-linear-from': ze() }],
        'mask-image-linear-to-pos': [{ 'mask-linear-to': ze() }],
        'mask-image-linear-from-color': [{ 'mask-linear-from': fe() }],
        'mask-image-linear-to-color': [{ 'mask-linear-to': fe() }],
        'mask-image-t-from-pos': [{ 'mask-t-from': ze() }],
        'mask-image-t-to-pos': [{ 'mask-t-to': ze() }],
        'mask-image-t-from-color': [{ 'mask-t-from': fe() }],
        'mask-image-t-to-color': [{ 'mask-t-to': fe() }],
        'mask-image-r-from-pos': [{ 'mask-r-from': ze() }],
        'mask-image-r-to-pos': [{ 'mask-r-to': ze() }],
        'mask-image-r-from-color': [{ 'mask-r-from': fe() }],
        'mask-image-r-to-color': [{ 'mask-r-to': fe() }],
        'mask-image-b-from-pos': [{ 'mask-b-from': ze() }],
        'mask-image-b-to-pos': [{ 'mask-b-to': ze() }],
        'mask-image-b-from-color': [{ 'mask-b-from': fe() }],
        'mask-image-b-to-color': [{ 'mask-b-to': fe() }],
        'mask-image-l-from-pos': [{ 'mask-l-from': ze() }],
        'mask-image-l-to-pos': [{ 'mask-l-to': ze() }],
        'mask-image-l-from-color': [{ 'mask-l-from': fe() }],
        'mask-image-l-to-color': [{ 'mask-l-to': fe() }],
        'mask-image-x-from-pos': [{ 'mask-x-from': ze() }],
        'mask-image-x-to-pos': [{ 'mask-x-to': ze() }],
        'mask-image-x-from-color': [{ 'mask-x-from': fe() }],
        'mask-image-x-to-color': [{ 'mask-x-to': fe() }],
        'mask-image-y-from-pos': [{ 'mask-y-from': ze() }],
        'mask-image-y-to-pos': [{ 'mask-y-to': ze() }],
        'mask-image-y-from-color': [{ 'mask-y-from': fe() }],
        'mask-image-y-to-color': [{ 'mask-y-to': fe() }],
        'mask-image-radial': [{ 'mask-radial': [ue, le] }],
        'mask-image-radial-from-pos': [{ 'mask-radial-from': ze() }],
        'mask-image-radial-to-pos': [{ 'mask-radial-to': ze() }],
        'mask-image-radial-from-color': [{ 'mask-radial-from': fe() }],
        'mask-image-radial-to-color': [{ 'mask-radial-to': fe() }],
        'mask-image-radial-shape': [{ 'mask-radial': ['circle', 'ellipse'] }],
        'mask-image-radial-size': [
          {
            'mask-radial': [
              { closest: ['side', 'corner'], farthest: ['side', 'corner'] },
            ],
          },
        ],
        'mask-image-radial-pos': [{ 'mask-radial-at': W() }],
        'mask-image-conic-pos': [{ 'mask-conic': [be] }],
        'mask-image-conic-from-pos': [{ 'mask-conic-from': ze() }],
        'mask-image-conic-to-pos': [{ 'mask-conic-to': ze() }],
        'mask-image-conic-from-color': [{ 'mask-conic-from': fe() }],
        'mask-image-conic-to-color': [{ 'mask-conic-to': fe() }],
        'mask-mode': [{ mask: ['alpha', 'luminance', 'match'] }],
        'mask-origin': [
          {
            'mask-origin': [
              'border',
              'padding',
              'content',
              'fill',
              'stroke',
              'view',
            ],
          },
        ],
        'mask-position': [{ mask: os() }],
        'mask-repeat': [{ mask: dt() }],
        'mask-size': [{ mask: ir() }],
        'mask-type': [{ 'mask-type': ['alpha', 'luminance'] }],
        'mask-image': [{ mask: ['none', ue, le] }],
        filter: [{ filter: ['', 'none', ue, le] }],
        blur: [{ blur: Mr() }],
        brightness: [{ brightness: [be, ue, le] }],
        contrast: [{ contrast: [be, ue, le] }],
        'drop-shadow': [{ 'drop-shadow': ['', 'none', D, pi, mi] }],
        'drop-shadow-color': [{ 'drop-shadow': fe() }],
        grayscale: [{ grayscale: ['', be, ue, le] }],
        'hue-rotate': [{ 'hue-rotate': [be, ue, le] }],
        invert: [{ invert: ['', be, ue, le] }],
        saturate: [{ saturate: [be, ue, le] }],
        sepia: [{ sepia: ['', be, ue, le] }],
        'backdrop-filter': [{ 'backdrop-filter': ['', 'none', ue, le] }],
        'backdrop-blur': [{ 'backdrop-blur': Mr() }],
        'backdrop-brightness': [{ 'backdrop-brightness': [be, ue, le] }],
        'backdrop-contrast': [{ 'backdrop-contrast': [be, ue, le] }],
        'backdrop-grayscale': [{ 'backdrop-grayscale': ['', be, ue, le] }],
        'backdrop-hue-rotate': [{ 'backdrop-hue-rotate': [be, ue, le] }],
        'backdrop-invert': [{ 'backdrop-invert': ['', be, ue, le] }],
        'backdrop-opacity': [{ 'backdrop-opacity': [be, ue, le] }],
        'backdrop-saturate': [{ 'backdrop-saturate': [be, ue, le] }],
        'backdrop-sepia': [{ 'backdrop-sepia': ['', be, ue, le] }],
        'border-collapse': [{ border: ['collapse', 'separate'] }],
        'border-spacing': [{ 'border-spacing': V() }],
        'border-spacing-x': [{ 'border-spacing-x': V() }],
        'border-spacing-y': [{ 'border-spacing-y': V() }],
        'table-layout': [{ table: ['auto', 'fixed'] }],
        caption: [{ caption: ['top', 'bottom'] }],
        transition: [
          {
            transition: [
              '',
              'all',
              'colors',
              'opacity',
              'shadow',
              'transform',
              'none',
              ue,
              le,
            ],
          },
        ],
        'transition-behavior': [{ transition: ['normal', 'discrete'] }],
        duration: [{ duration: [be, 'initial', ue, le] }],
        ease: [{ ease: ['linear', 'initial', Y, ue, le] }],
        delay: [{ delay: [be, ue, le] }],
        animate: [{ animate: ['none', J, ue, le] }],
        backface: [{ backface: ['hidden', 'visible'] }],
        perspective: [{ perspective: [M, ue, le] }],
        'perspective-origin': [{ 'perspective-origin': ne() }],
        rotate: [{ rotate: ot() }],
        'rotate-x': [{ 'rotate-x': ot() }],
        'rotate-y': [{ 'rotate-y': ot() }],
        'rotate-z': [{ 'rotate-z': ot() }],
        scale: [{ scale: Cr() }],
        'scale-x': [{ 'scale-x': Cr() }],
        'scale-y': [{ 'scale-y': Cr() }],
        'scale-z': [{ 'scale-z': Cr() }],
        'scale-3d': ['scale-3d'],
        skew: [{ skew: Re() }],
        'skew-x': [{ 'skew-x': Re() }],
        'skew-y': [{ 'skew-y': Re() }],
        transform: [{ transform: [ue, le, '', 'none', 'gpu', 'cpu'] }],
        'transform-origin': [{ origin: ne() }],
        'transform-style': [{ transform: ['3d', 'flat'] }],
        translate: [{ translate: Kt() }],
        'translate-x': [{ 'translate-x': Kt() }],
        'translate-y': [{ 'translate-y': Kt() }],
        'translate-z': [{ 'translate-z': Kt() }],
        'translate-none': ['translate-none'],
        zoom: [{ zoom: [hr, ue, le] }],
        accent: [{ accent: fe() }],
        appearance: [{ appearance: ['none', 'auto'] }],
        'caret-color': [{ caret: fe() }],
        'color-scheme': [
          {
            scheme: [
              'normal',
              'dark',
              'light',
              'light-dark',
              'only-dark',
              'only-light',
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              'auto',
              'default',
              'pointer',
              'wait',
              'text',
              'move',
              'help',
              'not-allowed',
              'none',
              'context-menu',
              'progress',
              'cell',
              'crosshair',
              'vertical-text',
              'alias',
              'copy',
              'no-drop',
              'grab',
              'grabbing',
              'all-scroll',
              'col-resize',
              'row-resize',
              'n-resize',
              'e-resize',
              's-resize',
              'w-resize',
              'ne-resize',
              'nw-resize',
              'se-resize',
              'sw-resize',
              'ew-resize',
              'ns-resize',
              'nesw-resize',
              'nwse-resize',
              'zoom-in',
              'zoom-out',
              ue,
              le,
            ],
          },
        ],
        'field-sizing': [{ 'field-sizing': ['fixed', 'content'] }],
        'pointer-events': [{ 'pointer-events': ['auto', 'none'] }],
        resize: [{ resize: ['none', '', 'y', 'x'] }],
        'scroll-behavior': [{ scroll: ['auto', 'smooth'] }],
        'scrollbar-thumb-color': [{ 'scrollbar-thumb': fe() }],
        'scrollbar-track-color': [{ 'scrollbar-track': fe() }],
        'scrollbar-gutter': [
          { 'scrollbar-gutter': ['auto', 'stable', 'both'] },
        ],
        'scrollbar-w': [{ scrollbar: ['auto', 'thin', 'none'] }],
        'scroll-m': [{ 'scroll-m': V() }],
        'scroll-mx': [{ 'scroll-mx': V() }],
        'scroll-my': [{ 'scroll-my': V() }],
        'scroll-ms': [{ 'scroll-ms': V() }],
        'scroll-me': [{ 'scroll-me': V() }],
        'scroll-mbs': [{ 'scroll-mbs': V() }],
        'scroll-mbe': [{ 'scroll-mbe': V() }],
        'scroll-mt': [{ 'scroll-mt': V() }],
        'scroll-mr': [{ 'scroll-mr': V() }],
        'scroll-mb': [{ 'scroll-mb': V() }],
        'scroll-ml': [{ 'scroll-ml': V() }],
        'scroll-p': [{ 'scroll-p': V() }],
        'scroll-px': [{ 'scroll-px': V() }],
        'scroll-py': [{ 'scroll-py': V() }],
        'scroll-ps': [{ 'scroll-ps': V() }],
        'scroll-pe': [{ 'scroll-pe': V() }],
        'scroll-pbs': [{ 'scroll-pbs': V() }],
        'scroll-pbe': [{ 'scroll-pbe': V() }],
        'scroll-pt': [{ 'scroll-pt': V() }],
        'scroll-pr': [{ 'scroll-pr': V() }],
        'scroll-pb': [{ 'scroll-pb': V() }],
        'scroll-pl': [{ 'scroll-pl': V() }],
        'snap-align': [{ snap: ['start', 'end', 'center', 'align-none'] }],
        'snap-stop': [{ snap: ['normal', 'always'] }],
        'snap-type': [{ snap: ['none', 'x', 'y', 'both'] }],
        'snap-strictness': [{ snap: ['mandatory', 'proximity'] }],
        touch: [{ touch: ['auto', 'none', 'manipulation'] }],
        'touch-x': [{ 'touch-pan': ['x', 'left', 'right'] }],
        'touch-y': [{ 'touch-pan': ['y', 'up', 'down'] }],
        'touch-pz': ['touch-pinch-zoom'],
        select: [{ select: ['none', 'text', 'all', 'auto'] }],
        'will-change': [
          {
            'will-change': ['auto', 'scroll', 'contents', 'transform', ue, le],
          },
        ],
        fill: [{ fill: ['none', ...fe()] }],
        'stroke-w': [{ stroke: [be, ms, rn, Ra] }],
        stroke: [{ stroke: ['none', ...fe()] }],
        'forced-color-adjust': [{ 'forced-color-adjust': ['auto', 'none'] }],
      },
      conflictingClassGroups: {
        'container-named': ['container-type'],
        overflow: ['overflow-x', 'overflow-y'],
        overscroll: ['overscroll-x', 'overscroll-y'],
        inset: [
          'inset-x',
          'inset-y',
          'inset-bs',
          'inset-be',
          'start',
          'end',
          'top',
          'right',
          'bottom',
          'left',
        ],
        'inset-x': ['right', 'left'],
        'inset-y': ['top', 'bottom'],
        flex: ['basis', 'grow', 'shrink'],
        gap: ['gap-x', 'gap-y'],
        p: ['px', 'py', 'ps', 'pe', 'pbs', 'pbe', 'pt', 'pr', 'pb', 'pl'],
        px: ['pr', 'pl'],
        py: ['pt', 'pb'],
        m: ['mx', 'my', 'ms', 'me', 'mbs', 'mbe', 'mt', 'mr', 'mb', 'ml'],
        mx: ['mr', 'ml'],
        my: ['mt', 'mb'],
        size: ['w', 'h'],
        'font-size': ['leading'],
        'fvn-normal': [
          'fvn-ordinal',
          'fvn-slashed-zero',
          'fvn-figure',
          'fvn-spacing',
          'fvn-fraction',
        ],
        'fvn-ordinal': ['fvn-normal'],
        'fvn-slashed-zero': ['fvn-normal'],
        'fvn-figure': ['fvn-normal'],
        'fvn-spacing': ['fvn-normal'],
        'fvn-fraction': ['fvn-normal'],
        'line-clamp': ['display', 'overflow'],
        rounded: [
          'rounded-s',
          'rounded-e',
          'rounded-t',
          'rounded-r',
          'rounded-b',
          'rounded-l',
          'rounded-ss',
          'rounded-se',
          'rounded-ee',
          'rounded-es',
          'rounded-tl',
          'rounded-tr',
          'rounded-br',
          'rounded-bl',
        ],
        'rounded-s': ['rounded-ss', 'rounded-es'],
        'rounded-e': ['rounded-se', 'rounded-ee'],
        'rounded-t': ['rounded-tl', 'rounded-tr'],
        'rounded-r': ['rounded-tr', 'rounded-br'],
        'rounded-b': ['rounded-br', 'rounded-bl'],
        'rounded-l': ['rounded-tl', 'rounded-bl'],
        'border-spacing': ['border-spacing-x', 'border-spacing-y'],
        'border-w': [
          'border-w-x',
          'border-w-y',
          'border-w-s',
          'border-w-e',
          'border-w-bs',
          'border-w-be',
          'border-w-t',
          'border-w-r',
          'border-w-b',
          'border-w-l',
        ],
        'border-w-x': ['border-w-r', 'border-w-l'],
        'border-w-y': ['border-w-t', 'border-w-b'],
        'border-color': [
          'border-color-x',
          'border-color-y',
          'border-color-s',
          'border-color-e',
          'border-color-bs',
          'border-color-be',
          'border-color-t',
          'border-color-r',
          'border-color-b',
          'border-color-l',
        ],
        'border-color-x': ['border-color-r', 'border-color-l'],
        'border-color-y': ['border-color-t', 'border-color-b'],
        translate: ['translate-x', 'translate-y', 'translate-none'],
        'translate-none': [
          'translate',
          'translate-x',
          'translate-y',
          'translate-z',
        ],
        'scroll-m': [
          'scroll-mx',
          'scroll-my',
          'scroll-ms',
          'scroll-me',
          'scroll-mbs',
          'scroll-mbe',
          'scroll-mt',
          'scroll-mr',
          'scroll-mb',
          'scroll-ml',
        ],
        'scroll-mx': ['scroll-mr', 'scroll-ml'],
        'scroll-my': ['scroll-mt', 'scroll-mb'],
        'scroll-p': [
          'scroll-px',
          'scroll-py',
          'scroll-ps',
          'scroll-pe',
          'scroll-pbs',
          'scroll-pbe',
          'scroll-pt',
          'scroll-pr',
          'scroll-pb',
          'scroll-pl',
        ],
        'scroll-px': ['scroll-pr', 'scroll-pl'],
        'scroll-py': ['scroll-pt', 'scroll-pb'],
        touch: ['touch-x', 'touch-y', 'touch-pz'],
        'touch-x': ['touch'],
        'touch-y': ['touch'],
        'touch-pz': ['touch'],
      },
      conflictingClassGroupModifiers: { 'font-size': ['leading'] },
      postfixLookupClassGroups: ['container-type'],
      orderSensitiveModifiers: [
        '*',
        '**',
        'after',
        'backdrop',
        'before',
        'details-content',
        'file',
        'first-letter',
        'first-line',
        'marker',
        'placeholder',
        'selection',
      ],
    };
  },
  $u = Mu(Zu);
function yt(...n) {
  return $u(Dl(n));
}
const e0 = Do(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
function Bt({ className: n, variant: i, size: l, asChild: u = !1, ...g }) {
  const h = u ? nu : 'button';
  return b.jsx(h, {
    'data-slot': 'button',
    className: yt(e0({ variant: i, size: l, className: n })),
    ...g,
  });
}
var Ni = class {
    constructor() {
      ((this.listeners = new Set()),
        (this.subscribe = this.subscribe.bind(this)));
    }
    subscribe(n) {
      return (
        this.listeners.add(n),
        this.onSubscribe(),
        () => {
          (this.listeners.delete(n), this.onUnsubscribe());
        }
      );
    }
    hasListeners() {
      return this.listeners.size > 0;
    }
    onSubscribe() {}
    onUnsubscribe() {}
  },
  An,
  jr,
  Wn,
  fl,
  t0 =
    ((fl = class extends Ni {
      constructor() {
        super();
        Ie(this, An);
        Ie(this, jr);
        Ie(this, Wn);
        pe(this, Wn, (i) => {
          if (typeof window < 'u' && window.addEventListener) {
            const l = () => i();
            return (
              window.addEventListener('visibilitychange', l, !1),
              () => {
                window.removeEventListener('visibilitychange', l);
              }
            );
          }
        });
      }
      onSubscribe() {
        j(this, jr) || this.setEventListener(j(this, Wn));
      }
      onUnsubscribe() {
        var i;
        this.hasListeners() ||
          ((i = j(this, jr)) == null || i.call(this), pe(this, jr, void 0));
      }
      setEventListener(i) {
        var l;
        (pe(this, Wn, i),
          (l = j(this, jr)) == null || l.call(this),
          pe(
            this,
            jr,
            i((u) => {
              typeof u == 'boolean' ? this.setFocused(u) : this.onFocus();
            }),
          ));
      }
      setFocused(i) {
        j(this, An) !== i && (pe(this, An, i), this.onFocus());
      }
      onFocus() {
        const i = this.isFocused();
        this.listeners.forEach((l) => {
          l(i);
        });
      }
      isFocused() {
        var i;
        return typeof j(this, An) == 'boolean'
          ? j(this, An)
          : ((i = globalThis.document) == null ? void 0 : i.visibilityState) !==
              'hidden';
      }
    }),
    (An = new WeakMap()),
    (jr = new WeakMap()),
    (Wn = new WeakMap()),
    fl),
  Xl = new t0(),
  r0 = {
    setTimeout: (n, i) => setTimeout(n, i),
    clearTimeout: (n) => clearTimeout(n),
    setInterval: (n, i) => setInterval(n, i),
    clearInterval: (n) => clearInterval(n),
  },
  zr,
  No,
  hl,
  n0 =
    ((hl = class {
      constructor() {
        Ie(this, zr, r0);
        Ie(this, No, !1);
      }
      setTimeoutProvider(n) {
        pe(this, zr, n);
      }
      setTimeout(n, i) {
        return j(this, zr).setTimeout(n, i);
      }
      clearTimeout(n) {
        j(this, zr).clearTimeout(n);
      }
      setInterval(n, i) {
        return j(this, zr).setInterval(n, i);
      }
      clearInterval(n) {
        j(this, zr).clearInterval(n);
      }
    }),
    (zr = new WeakMap()),
    (No = new WeakMap()),
    hl),
  uo = new n0();
function s0(n) {
  setTimeout(n, 0);
}
var i0 = typeof window > 'u' || 'Deno' in globalThis;
function $t() {}
function o0(n, i) {
  return typeof n == 'function' ? n(i) : n;
}
function a0(n) {
  return typeof n == 'number' && n >= 0 && n !== 1 / 0;
}
function l0(n, i) {
  return Math.max(n + (i || 0) - Date.now(), 0);
}
function fo(n, i) {
  return typeof n == 'function' ? n(i) : n;
}
function c0(n, i) {
  return typeof n == 'function' ? n(i) : n;
}
function Ma(n, i) {
  const {
    type: l = 'all',
    exact: u,
    fetchStatus: g,
    predicate: h,
    queryKey: w,
    stale: y,
  } = n;
  if (w) {
    if (u) {
      if (i.queryHash !== Bo(w, i.options)) return !1;
    } else if (!Zn(i.queryKey, w)) return !1;
  }
  if (l !== 'all') {
    const I = i.isActive();
    if ((l === 'active' && !I) || (l === 'inactive' && I)) return !1;
  }
  return !(
    (typeof y == 'boolean' && i.isStale() !== y) ||
    (g && g !== i.state.fetchStatus) ||
    (h && !h(i))
  );
}
function Da(n, i) {
  const { exact: l, status: u, predicate: g, mutationKey: h } = n;
  if (h) {
    if (!i.options.mutationKey) return !1;
    if (l) {
      if (Ks(i.options.mutationKey) !== Ks(h)) return !1;
    } else if (!Zn(i.options.mutationKey, h)) return !1;
  }
  return !((u && i.state.status !== u) || (g && !g(i)));
}
function Bo(n, i) {
  return ((i == null ? void 0 : i.queryKeyHashFn) || Ks)(n);
}
function Ks(n) {
  return JSON.stringify(n, (i, l) =>
    ho(l)
      ? Object.keys(l)
          .sort()
          .reduce((u, g) => ((u[g] = l[g]), u), {})
      : l,
  );
}
function Zn(n, i) {
  if (n === i) return !0;
  if (typeof n != typeof i) return !1;
  if (n && i && typeof n == 'object' && typeof i == 'object') {
    if (Array.isArray(n) && Array.isArray(i)) {
      for (let u = 0; u < i.length; u++) if (!Zn(n[u], i[u])) return !1;
      return !0;
    }
    const l = Object.keys(i);
    for (const u of l) if (!Zn(n[u], i[u])) return !1;
    return !0;
  }
  return !1;
}
var u0 = Object.prototype.hasOwnProperty;
function Gl(n, i, l = 0) {
  if (n === i) return n;
  if (l > 500) return i;
  const u = Oa(n) && Oa(i);
  if (!u && !(ho(n) && ho(i))) return i;
  const h = (u ? n : Object.keys(n)).length,
    w = u ? i : Object.keys(i),
    y = w.length,
    I = u ? new Array(y) : {};
  let p = 0;
  for (let R = 0; R < y; R++) {
    const T = u ? R : w[R],
      _ = n[T],
      D = i[T];
    if (_ === D) {
      ((I[T] = _), (u ? R < h : u0.call(n, T)) && p++);
      continue;
    }
    if (
      _ === null ||
      D === null ||
      typeof _ != 'object' ||
      typeof D != 'object'
    ) {
      I[T] = D;
      continue;
    }
    const z = Gl(_, D, l + 1);
    ((I[T] = z), z === _ && p++);
  }
  return h === y && p === h ? n : I;
}
function Oa(n) {
  return Array.isArray(n) && n.length === Object.keys(n).length;
}
function ho(n) {
  if (!Pa(n)) return !1;
  const i = n.constructor;
  if (i === void 0) return !0;
  const l = i.prototype;
  return !(
    !Pa(l) ||
    !l.hasOwnProperty('isPrototypeOf') ||
    Object.getPrototypeOf(n) !== Object.prototype
  );
}
function Pa(n) {
  return Object.prototype.toString.call(n) === '[object Object]';
}
function d0(n) {
  return new Promise((i) => {
    uo.setTimeout(i, n);
  });
}
function f0(n, i, l) {
  return typeof l.structuralSharing == 'function'
    ? l.structuralSharing(n, i)
    : l.structuralSharing !== !1
      ? Gl(n, i)
      : i;
}
function h0(n, i, l = 0) {
  const u = [...n, i];
  return l && u.length > l ? u.slice(1) : u;
}
function g0(n, i, l = 0) {
  const u = [i, ...n];
  return l && u.length > l ? u.slice(0, -1) : u;
}
var _o = Symbol();
function Yl(n, i) {
  return !n.queryFn && i != null && i.initialPromise
    ? () => i.initialPromise
    : !n.queryFn || n.queryFn === _o
      ? () => Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`))
      : n.queryFn;
}
function x0(n, i, l) {
  let u = !1,
    g;
  return (
    Object.defineProperty(n, 'signal', {
      enumerable: !0,
      get: () => (
        g ?? (g = i()),
        u ||
          ((u = !0),
          g.aborted ? l() : g.addEventListener('abort', l, { once: !0 })),
        g
      ),
    }),
    n
  );
}
var Kl = (() => {
  let n = () => i0;
  return {
    isServer() {
      return n();
    },
    setIsServer(i) {
      n = i;
    },
  };
})();
function A0() {
  let n, i;
  const l = new Promise((g, h) => {
    ((n = g), (i = h));
  });
  ((l.status = 'pending'), l.catch(() => {}));
  function u(g) {
    (Object.assign(l, g), delete l.resolve, delete l.reject);
  }
  return (
    (l.resolve = (g) => {
      (u({ status: 'fulfilled', value: g }), n(g));
    }),
    (l.reject = (g) => {
      (u({ status: 'rejected', reason: g }), i(g));
    }),
    l
  );
}
var m0 = s0;
function p0() {
  let n = [],
    i = 0,
    l = (y) => {
      y();
    },
    u = (y) => {
      y();
    },
    g = m0;
  const h = (y) => {
      i
        ? n.push(y)
        : g(() => {
            l(y);
          });
    },
    w = () => {
      const y = n;
      ((n = []),
        y.length &&
          g(() => {
            u(() => {
              y.forEach((I) => {
                l(I);
              });
            });
          }));
    };
  return {
    batch: (y) => {
      let I;
      i++;
      try {
        I = y();
      } finally {
        (i--, i || w());
      }
      return I;
    },
    batchCalls:
      (y) =>
      (...I) => {
        h(() => {
          y(...I);
        });
      },
    schedule: h,
    setNotifyFunction: (y) => {
      l = y;
    },
    setBatchNotifyFunction: (y) => {
      u = y;
    },
    setScheduler: (y) => {
      g = y;
    },
  };
}
var vt = p0(),
  Hn,
  Vr,
  Qn,
  gl,
  w0 =
    ((gl = class extends Ni {
      constructor() {
        super();
        Ie(this, Hn, !0);
        Ie(this, Vr);
        Ie(this, Qn);
        pe(this, Qn, (i) => {
          if (typeof window < 'u' && window.addEventListener) {
            const l = () => i(!0),
              u = () => i(!1);
            return (
              window.addEventListener('online', l, !1),
              window.addEventListener('offline', u, !1),
              () => {
                (window.removeEventListener('online', l),
                  window.removeEventListener('offline', u));
              }
            );
          }
        });
      }
      onSubscribe() {
        j(this, Vr) || this.setEventListener(j(this, Qn));
      }
      onUnsubscribe() {
        var i;
        this.hasListeners() ||
          ((i = j(this, Vr)) == null || i.call(this), pe(this, Vr, void 0));
      }
      setEventListener(i) {
        var l;
        (pe(this, Qn, i),
          (l = j(this, Vr)) == null || l.call(this),
          pe(this, Vr, i(this.setOnline.bind(this))));
      }
      setOnline(i) {
        j(this, Hn) !== i &&
          (pe(this, Hn, i),
          this.listeners.forEach((u) => {
            u(i);
          }));
      }
      isOnline() {
        return j(this, Hn);
      }
    }),
    (Hn = new WeakMap()),
    (Vr = new WeakMap()),
    (Qn = new WeakMap()),
    gl),
  Ei = new w0();
function C0(n) {
  return Math.min(1e3 * 2 ** n, 3e4);
}
function Jl(n) {
  return (n ?? 'online') === 'online' ? Ei.isOnline() : !0;
}
var go = class extends Error {
  constructor(n) {
    (super('CancelledError'),
      (this.revert = n == null ? void 0 : n.revert),
      (this.silent = n == null ? void 0 : n.silent));
  }
};
function ql(n) {
  let i = !1,
    l = 0,
    u;
  const g = A0(),
    h = () => g.status !== 'pending',
    w = (M) => {
      var X;
      if (!h()) {
        const Y = new go(M);
        (_(Y), (X = n.onCancel) == null || X.call(n, Y));
      }
    },
    y = () => {
      i = !0;
    },
    I = () => {
      i = !1;
    },
    p = () =>
      Xl.isFocused() &&
      (n.networkMode === 'always' || Ei.isOnline()) &&
      n.canRun(),
    R = () => Jl(n.networkMode) && n.canRun(),
    T = (M) => {
      h() || (u == null || u(), g.resolve(M));
    },
    _ = (M) => {
      h() || (u == null || u(), g.reject(M));
    },
    D = () =>
      new Promise((M) => {
        var X;
        ((u = (Y) => {
          (h() || p()) && M(Y);
        }),
          (X = n.onPause) == null || X.call(n));
      }).then(() => {
        var M;
        ((u = void 0), h() || (M = n.onContinue) == null || M.call(n));
      }),
    z = () => {
      if (h()) return;
      let M;
      const X = l === 0 ? n.initialPromise : void 0;
      try {
        M = X ?? n.fn();
      } catch (Y) {
        M = Promise.reject(Y);
      }
      Promise.resolve(M)
        .then(T)
        .catch((Y) => {
          var re;
          if (h()) return;
          const J = n.retry ?? (Kl.isServer() ? 0 : 3),
            H = n.retryDelay ?? C0,
            W = typeof H == 'function' ? H(l, Y) : H,
            ne =
              J === !0 ||
              (typeof J == 'number' && l < J) ||
              (typeof J == 'function' && J(l, Y));
          if (i || !ne) {
            _(Y);
            return;
          }
          (l++,
            (re = n.onFail) == null || re.call(n, l, Y),
            d0(W)
              .then(() => (p() ? void 0 : D()))
              .then(() => {
                i ? _(Y) : z();
              }));
        });
    };
  return {
    promise: g,
    status: () => g.status,
    cancel: w,
    continue: () => (u == null || u(), g),
    cancelRetry: y,
    continueRetry: I,
    canStart: R,
    start: () => (R() ? z() : D().then(z), g),
  };
}
var mn,
  xl,
  Zl =
    ((xl = class {
      constructor() {
        Ie(this, mn);
      }
      destroy() {
        this.clearGcTimeout();
      }
      scheduleGc() {
        (this.clearGcTimeout(),
          a0(this.gcTime) &&
            pe(
              this,
              mn,
              uo.setTimeout(() => {
                this.optionalRemove();
              }, this.gcTime),
            ));
      }
      updateGcTime(n) {
        this.gcTime = Math.max(
          this.gcTime || 0,
          n ?? (Kl.isServer() ? 1 / 0 : 300 * 1e3),
        );
      }
      clearGcTimeout() {
        j(this, mn) !== void 0 &&
          (uo.clearTimeout(j(this, mn)), pe(this, mn, void 0));
      }
    }),
    (mn = new WeakMap()),
    xl);
function y0(n) {
  return {
    onFetch: (i, l) => {
      var R, T, _, D, z;
      const u = i.options,
        g =
          (_ =
            (T = (R = i.fetchOptions) == null ? void 0 : R.meta) == null
              ? void 0
              : T.fetchMore) == null
            ? void 0
            : _.direction,
        h = ((D = i.state.data) == null ? void 0 : D.pages) || [],
        w = ((z = i.state.data) == null ? void 0 : z.pageParams) || [];
      let y = { pages: [], pageParams: [] },
        I = 0;
      const p = async () => {
        let M = !1;
        const X = (H) => {
            x0(
              H,
              () => i.signal,
              () => (M = !0),
            );
          },
          Y = Yl(i.options, i.fetchOptions),
          J = async (H, W, ne) => {
            if (M) return Promise.reject(i.signal.reason);
            if (W == null && H.pages.length) return Promise.resolve(H);
            const Q = (() => {
                const xe = {
                  client: i.client,
                  queryKey: i.queryKey,
                  pageParam: W,
                  direction: ne ? 'backward' : 'forward',
                  meta: i.options.meta,
                };
                return (X(xe), xe);
              })(),
              V = await Y(Q),
              { maxPages: L } = i.options,
              We = ne ? g0 : h0;
            return {
              pages: We(H.pages, V, L),
              pageParams: We(H.pageParams, W, L),
            };
          };
        if (g && h.length) {
          const H = g === 'backward',
            W = H ? E0 : Ba,
            ne = { pages: h, pageParams: w },
            re = W(u, ne);
          y = await J(ne, re, H);
        } else {
          const H = n ?? h.length;
          do {
            const W = I === 0 ? (w[0] ?? u.initialPageParam) : Ba(u, y);
            if (I > 0 && W == null) break;
            ((y = await J(y, W)), I++);
          } while (I < H);
        }
        return y;
      };
      i.options.persister
        ? (i.fetchFn = () => {
            var M, X;
            return (X = (M = i.options).persister) == null
              ? void 0
              : X.call(
                  M,
                  p,
                  {
                    client: i.client,
                    queryKey: i.queryKey,
                    meta: i.options.meta,
                    signal: i.signal,
                  },
                  l,
                );
          })
        : (i.fetchFn = p);
    },
  };
}
function Ba(n, { pages: i, pageParams: l }) {
  const u = i.length - 1;
  return i.length > 0 ? n.getNextPageParam(i[u], i, l[u], l) : void 0;
}
function E0(n, { pages: i, pageParams: l }) {
  var u;
  return i.length > 0
    ? (u = n.getPreviousPageParam) == null
      ? void 0
      : u.call(n, i[0], i, l[0], l)
    : void 0;
}
var Xn,
  pn,
  Gn,
  Xt,
  wn,
  gt,
  qs,
  Cn,
  kt,
  $l,
  Ir,
  Al,
  b0 =
    ((Al = class extends Zl {
      constructor(i) {
        super();
        Ie(this, kt);
        Ie(this, Xn);
        Ie(this, pn);
        Ie(this, Gn);
        Ie(this, Xt);
        Ie(this, wn);
        Ie(this, gt);
        Ie(this, qs);
        Ie(this, Cn);
        (pe(this, Cn, !1),
          pe(this, qs, i.defaultOptions),
          this.setOptions(i.options),
          (this.observers = []),
          pe(this, wn, i.client),
          pe(this, Xt, j(this, wn).getQueryCache()),
          (this.queryKey = i.queryKey),
          (this.queryHash = i.queryHash),
          pe(this, pn, La(this.options)),
          (this.state = i.state ?? j(this, pn)),
          this.scheduleGc());
      }
      get meta() {
        return this.options.meta;
      }
      get queryType() {
        return j(this, Xn);
      }
      get promise() {
        var i;
        return (i = j(this, gt)) == null ? void 0 : i.promise;
      }
      setOptions(i) {
        if (
          ((this.options = { ...j(this, qs), ...i }),
          i != null && i._type && pe(this, Xn, i._type),
          this.updateGcTime(this.options.gcTime),
          this.state && this.state.data === void 0)
        ) {
          const l = La(this.options);
          l.data !== void 0 &&
            (this.setState(_a(l.data, l.dataUpdatedAt)), pe(this, pn, l));
        }
      }
      optionalRemove() {
        !this.observers.length &&
          this.state.fetchStatus === 'idle' &&
          j(this, Xt).remove(this);
      }
      setData(i, l) {
        const u = f0(this.state.data, i, this.options);
        return (
          Ct(this, kt, Ir).call(this, {
            data: u,
            type: 'success',
            dataUpdatedAt: l == null ? void 0 : l.updatedAt,
            manual: l == null ? void 0 : l.manual,
          }),
          u
        );
      }
      setState(i) {
        Ct(this, kt, Ir).call(this, { type: 'setState', state: i });
      }
      cancel(i) {
        var u, g;
        const l = (u = j(this, gt)) == null ? void 0 : u.promise;
        return (
          (g = j(this, gt)) == null || g.cancel(i),
          l ? l.then($t).catch($t) : Promise.resolve()
        );
      }
      destroy() {
        (super.destroy(), this.cancel({ silent: !0 }));
      }
      get resetState() {
        return j(this, pn);
      }
      reset() {
        (this.destroy(), this.setState(this.resetState));
      }
      isActive() {
        return this.observers.some((i) => c0(i.options.enabled, this) !== !1);
      }
      isDisabled() {
        return this.getObserversCount() > 0
          ? !this.isActive()
          : this.options.queryFn === _o || !this.isFetched();
      }
      isFetched() {
        return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
      }
      isStatic() {
        return this.getObserversCount() > 0
          ? this.observers.some(
              (i) => fo(i.options.staleTime, this) === 'static',
            )
          : !1;
      }
      isStale() {
        return this.getObserversCount() > 0
          ? this.observers.some((i) => i.getCurrentResult().isStale)
          : this.state.data === void 0 || this.state.isInvalidated;
      }
      isStaleByTime(i = 0) {
        return this.state.data === void 0
          ? !0
          : i === 'static'
            ? !1
            : this.state.isInvalidated
              ? !0
              : !l0(this.state.dataUpdatedAt, i);
      }
      onFocus() {
        var l;
        const i = this.observers.find((u) => u.shouldFetchOnWindowFocus());
        (i == null || i.refetch({ cancelRefetch: !1 }),
          (l = j(this, gt)) == null || l.continue());
      }
      onOnline() {
        var l;
        const i = this.observers.find((u) => u.shouldFetchOnReconnect());
        (i == null || i.refetch({ cancelRefetch: !1 }),
          (l = j(this, gt)) == null || l.continue());
      }
      addObserver(i) {
        this.observers.includes(i) ||
          (this.observers.push(i),
          this.clearGcTimeout(),
          j(this, Xt).notify({
            type: 'observerAdded',
            query: this,
            observer: i,
          }));
      }
      removeObserver(i) {
        this.observers.includes(i) &&
          ((this.observers = this.observers.filter((l) => l !== i)),
          this.observers.length ||
            (j(this, gt) &&
              (j(this, Cn) || Ct(this, kt, $l).call(this)
                ? j(this, gt).cancel({ revert: !0 })
                : j(this, gt).cancelRetry()),
            this.scheduleGc()),
          j(this, Xt).notify({
            type: 'observerRemoved',
            query: this,
            observer: i,
          }));
      }
      getObserversCount() {
        return this.observers.length;
      }
      invalidate() {
        this.state.isInvalidated ||
          Ct(this, kt, Ir).call(this, { type: 'invalidate' });
      }
      async fetch(i, l) {
        var p, R, T, _, D, z, M, X, Y, J, H;
        if (
          this.state.fetchStatus !== 'idle' &&
          ((p = j(this, gt)) == null ? void 0 : p.status()) !== 'rejected'
        ) {
          if (this.state.data !== void 0 && l != null && l.cancelRefetch)
            this.cancel({ silent: !0 });
          else if (j(this, gt))
            return (j(this, gt).continueRetry(), j(this, gt).promise);
        }
        if ((i && this.setOptions(i), !this.options.queryFn)) {
          const W = this.observers.find((ne) => ne.options.queryFn);
          W && this.setOptions(W.options);
        }
        const u = new AbortController(),
          g = (W) => {
            Object.defineProperty(W, 'signal', {
              enumerable: !0,
              get: () => (pe(this, Cn, !0), u.signal),
            });
          },
          h = () => {
            const W = Yl(this.options, l),
              re = (() => {
                const Q = {
                  client: j(this, wn),
                  queryKey: this.queryKey,
                  meta: this.meta,
                };
                return (g(Q), Q);
              })();
            return (
              pe(this, Cn, !1),
              this.options.persister
                ? this.options.persister(W, re, this)
                : W(re)
            );
          },
          y = (() => {
            const W = {
              fetchOptions: l,
              options: this.options,
              queryKey: this.queryKey,
              client: j(this, wn),
              state: this.state,
              fetchFn: h,
            };
            return (g(W), W);
          })(),
          I =
            j(this, Xn) === 'infinite'
              ? y0(this.options.pages)
              : this.options.behavior;
        (I == null || I.onFetch(y, this),
          pe(this, Gn, this.state),
          (this.state.fetchStatus === 'idle' ||
            this.state.fetchMeta !==
              ((R = y.fetchOptions) == null ? void 0 : R.meta)) &&
            Ct(this, kt, Ir).call(this, {
              type: 'fetch',
              meta: (T = y.fetchOptions) == null ? void 0 : T.meta,
            }),
          pe(
            this,
            gt,
            ql({
              initialPromise: l == null ? void 0 : l.initialPromise,
              fn: y.fetchFn,
              onCancel: (W) => {
                (W instanceof go &&
                  W.revert &&
                  this.setState({ ...j(this, Gn), fetchStatus: 'idle' }),
                  u.abort());
              },
              onFail: (W, ne) => {
                Ct(this, kt, Ir).call(this, {
                  type: 'failed',
                  failureCount: W,
                  error: ne,
                });
              },
              onPause: () => {
                Ct(this, kt, Ir).call(this, { type: 'pause' });
              },
              onContinue: () => {
                Ct(this, kt, Ir).call(this, { type: 'continue' });
              },
              retry: y.options.retry,
              retryDelay: y.options.retryDelay,
              networkMode: y.options.networkMode,
              canRun: () => !0,
            }),
          ));
        try {
          const W = await j(this, gt).start();
          if (W === void 0)
            throw new Error(`${this.queryHash} data is undefined`);
          return (
            this.setData(W),
            (D = (_ = j(this, Xt).config).onSuccess) == null ||
              D.call(_, W, this),
            (M = (z = j(this, Xt).config).onSettled) == null ||
              M.call(z, W, this.state.error, this),
            W
          );
        } catch (W) {
          if (W instanceof go) {
            if (W.silent) return j(this, gt).promise;
            if (W.revert) {
              if (this.state.data === void 0) throw W;
              return this.state.data;
            }
          }
          throw (
            Ct(this, kt, Ir).call(this, { type: 'error', error: W }),
            (Y = (X = j(this, Xt).config).onError) == null ||
              Y.call(X, W, this),
            (H = (J = j(this, Xt).config).onSettled) == null ||
              H.call(J, this.state.data, W, this),
            W
          );
        } finally {
          this.scheduleGc();
        }
      }
    }),
    (Xn = new WeakMap()),
    (pn = new WeakMap()),
    (Gn = new WeakMap()),
    (Xt = new WeakMap()),
    (wn = new WeakMap()),
    (gt = new WeakMap()),
    (qs = new WeakMap()),
    (Cn = new WeakMap()),
    (kt = new WeakSet()),
    ($l = function () {
      return (
        this.state.fetchStatus === 'paused' && this.state.status === 'pending'
      );
    }),
    (Ir = function (i) {
      const l = (u) => {
        switch (i.type) {
          case 'failed':
            return {
              ...u,
              fetchFailureCount: i.failureCount,
              fetchFailureReason: i.error,
            };
          case 'pause':
            return { ...u, fetchStatus: 'paused' };
          case 'continue':
            return { ...u, fetchStatus: 'fetching' };
          case 'fetch':
            return {
              ...u,
              ...I0(u.data, this.options),
              fetchMeta: i.meta ?? null,
            };
          case 'success':
            const g = {
              ...u,
              ..._a(i.data, i.dataUpdatedAt),
              dataUpdateCount: u.dataUpdateCount + 1,
              ...(!i.manual && {
                fetchStatus: 'idle',
                fetchFailureCount: 0,
                fetchFailureReason: null,
              }),
            };
            return (pe(this, Gn, i.manual ? g : void 0), g);
          case 'error':
            const h = i.error;
            return {
              ...u,
              error: h,
              errorUpdateCount: u.errorUpdateCount + 1,
              errorUpdatedAt: Date.now(),
              fetchFailureCount: u.fetchFailureCount + 1,
              fetchFailureReason: h,
              fetchStatus: 'idle',
              status: 'error',
              isInvalidated: !0,
            };
          case 'invalidate':
            return { ...u, isInvalidated: !0 };
          case 'setState':
            return { ...u, ...i.state };
        }
      };
      ((this.state = l(this.state)),
        vt.batch(() => {
          (this.observers.forEach((u) => {
            u.onQueryUpdate();
          }),
            j(this, Xt).notify({ query: this, type: 'updated', action: i }));
        }));
    }),
    Al);
function I0(n, i) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: Jl(i.networkMode) ? 'fetching' : 'paused',
    ...(n === void 0 && { error: null, status: 'pending' }),
  };
}
function _a(n, i) {
  return {
    data: n,
    dataUpdatedAt: i ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: 'success',
  };
}
function La(n) {
  const i =
      typeof n.initialData == 'function' ? n.initialData() : n.initialData,
    l = i !== void 0,
    u = l
      ? typeof n.initialDataUpdatedAt == 'function'
        ? n.initialDataUpdatedAt()
        : n.initialDataUpdatedAt
      : 0;
  return {
    data: i,
    dataUpdateCount: 0,
    dataUpdatedAt: l ? (u ?? Date.now()) : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: l ? 'success' : 'pending',
    fetchStatus: 'idle',
  };
}
var Zs,
  gr,
  It,
  yn,
  xr,
  Ur,
  ml,
  S0 =
    ((ml = class extends Zl {
      constructor(i) {
        super();
        Ie(this, xr);
        Ie(this, Zs);
        Ie(this, gr);
        Ie(this, It);
        Ie(this, yn);
        (pe(this, Zs, i.client),
          (this.mutationId = i.mutationId),
          pe(this, It, i.mutationCache),
          pe(this, gr, []),
          (this.state = i.state || T0()),
          this.setOptions(i.options),
          this.scheduleGc());
      }
      setOptions(i) {
        ((this.options = i), this.updateGcTime(this.options.gcTime));
      }
      get meta() {
        return this.options.meta;
      }
      addObserver(i) {
        j(this, gr).includes(i) ||
          (j(this, gr).push(i),
          this.clearGcTimeout(),
          j(this, It).notify({
            type: 'observerAdded',
            mutation: this,
            observer: i,
          }));
      }
      removeObserver(i) {
        (pe(
          this,
          gr,
          j(this, gr).filter((l) => l !== i),
        ),
          this.scheduleGc(),
          j(this, It).notify({
            type: 'observerRemoved',
            mutation: this,
            observer: i,
          }));
      }
      optionalRemove() {
        j(this, gr).length ||
          (this.state.status === 'pending'
            ? this.scheduleGc()
            : j(this, It).remove(this));
      }
      continue() {
        var i;
        return (
          ((i = j(this, yn)) == null ? void 0 : i.continue()) ??
          this.execute(this.state.variables)
        );
      }
      async execute(i) {
        var w, y, I, p, R, T, _, D, z, M, X, Y, J, H, W, ne, re, Q;
        const l = () => {
            Ct(this, xr, Ur).call(this, { type: 'continue' });
          },
          u = {
            client: j(this, Zs),
            meta: this.options.meta,
            mutationKey: this.options.mutationKey,
          };
        pe(
          this,
          yn,
          ql({
            fn: () =>
              this.options.mutationFn
                ? this.options.mutationFn(i, u)
                : Promise.reject(new Error('No mutationFn found')),
            onFail: (V, L) => {
              Ct(this, xr, Ur).call(this, {
                type: 'failed',
                failureCount: V,
                error: L,
              });
            },
            onPause: () => {
              Ct(this, xr, Ur).call(this, { type: 'pause' });
            },
            onContinue: l,
            retry: this.options.retry ?? 0,
            retryDelay: this.options.retryDelay,
            networkMode: this.options.networkMode,
            canRun: () => j(this, It).canRun(this),
          }),
        );
        const g = this.state.status === 'pending',
          h = !j(this, yn).canStart();
        try {
          if (g) l();
          else {
            (Ct(this, xr, Ur).call(this, {
              type: 'pending',
              variables: i,
              isPaused: h,
            }),
              j(this, It).config.onMutate &&
                (await j(this, It).config.onMutate(i, this, u)));
            const L = await ((y = (w = this.options).onMutate) == null
              ? void 0
              : y.call(w, i, u));
            L !== this.state.context &&
              Ct(this, xr, Ur).call(this, {
                type: 'pending',
                context: L,
                variables: i,
                isPaused: h,
              });
          }
          const V = await j(this, yn).start();
          return (
            await ((p = (I = j(this, It).config).onSuccess) == null
              ? void 0
              : p.call(I, V, i, this.state.context, this, u)),
            await ((T = (R = this.options).onSuccess) == null
              ? void 0
              : T.call(R, V, i, this.state.context, u)),
            await ((D = (_ = j(this, It).config).onSettled) == null
              ? void 0
              : D.call(
                  _,
                  V,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  u,
                )),
            await ((M = (z = this.options).onSettled) == null
              ? void 0
              : M.call(z, V, null, i, this.state.context, u)),
            Ct(this, xr, Ur).call(this, { type: 'success', data: V }),
            V
          );
        } catch (V) {
          try {
            await ((Y = (X = j(this, It).config).onError) == null
              ? void 0
              : Y.call(X, V, i, this.state.context, this, u));
          } catch (L) {
            Promise.reject(L);
          }
          try {
            await ((H = (J = this.options).onError) == null
              ? void 0
              : H.call(J, V, i, this.state.context, u));
          } catch (L) {
            Promise.reject(L);
          }
          try {
            await ((ne = (W = j(this, It).config).onSettled) == null
              ? void 0
              : ne.call(
                  W,
                  void 0,
                  V,
                  this.state.variables,
                  this.state.context,
                  this,
                  u,
                ));
          } catch (L) {
            Promise.reject(L);
          }
          try {
            await ((Q = (re = this.options).onSettled) == null
              ? void 0
              : Q.call(re, void 0, V, i, this.state.context, u));
          } catch (L) {
            Promise.reject(L);
          }
          throw (Ct(this, xr, Ur).call(this, { type: 'error', error: V }), V);
        } finally {
          j(this, It).runNext(this);
        }
      }
    }),
    (Zs = new WeakMap()),
    (gr = new WeakMap()),
    (It = new WeakMap()),
    (yn = new WeakMap()),
    (xr = new WeakSet()),
    (Ur = function (i) {
      const l = (u) => {
        switch (i.type) {
          case 'failed':
            return {
              ...u,
              failureCount: i.failureCount,
              failureReason: i.error,
            };
          case 'pause':
            return { ...u, isPaused: !0 };
          case 'continue':
            return { ...u, isPaused: !1 };
          case 'pending':
            return {
              ...u,
              context: i.context,
              data: void 0,
              failureCount: 0,
              failureReason: null,
              error: null,
              isPaused: i.isPaused,
              status: 'pending',
              variables: i.variables,
              submittedAt: Date.now(),
            };
          case 'success':
            return {
              ...u,
              data: i.data,
              failureCount: 0,
              failureReason: null,
              error: null,
              status: 'success',
              isPaused: !1,
            };
          case 'error':
            return {
              ...u,
              data: void 0,
              error: i.error,
              failureCount: u.failureCount + 1,
              failureReason: i.error,
              isPaused: !1,
              status: 'error',
            };
        }
      };
      ((this.state = l(this.state)),
        vt.batch(() => {
          (j(this, gr).forEach((u) => {
            u.onMutationUpdate(i);
          }),
            j(this, It).notify({ mutation: this, type: 'updated', action: i }));
        }));
    }),
    ml);
function T0() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: 'idle',
    variables: void 0,
    submittedAt: 0,
  };
}
var Tr,
  er,
  $s,
  pl,
  R0 =
    ((pl = class extends Ni {
      constructor(i = {}) {
        super();
        Ie(this, Tr);
        Ie(this, er);
        Ie(this, $s);
        ((this.config = i),
          pe(this, Tr, new Set()),
          pe(this, er, new Map()),
          pe(this, $s, 0));
      }
      build(i, l, u) {
        const g = new S0({
          client: i,
          mutationCache: this,
          mutationId: ++gi(this, $s)._,
          options: i.defaultMutationOptions(l),
          state: u,
        });
        return (this.add(g), g);
      }
      add(i) {
        j(this, Tr).add(i);
        const l = wi(i);
        if (typeof l == 'string') {
          const u = j(this, er).get(l);
          u ? u.push(i) : j(this, er).set(l, [i]);
        }
        this.notify({ type: 'added', mutation: i });
      }
      remove(i) {
        if (j(this, Tr).delete(i)) {
          const l = wi(i);
          if (typeof l == 'string') {
            const u = j(this, er).get(l);
            if (u)
              if (u.length > 1) {
                const g = u.indexOf(i);
                g !== -1 && u.splice(g, 1);
              } else u[0] === i && j(this, er).delete(l);
          }
        }
        this.notify({ type: 'removed', mutation: i });
      }
      canRun(i) {
        const l = wi(i);
        if (typeof l == 'string') {
          const u = j(this, er).get(l),
            g =
              u == null ? void 0 : u.find((h) => h.state.status === 'pending');
          return !g || g === i;
        } else return !0;
      }
      runNext(i) {
        var u;
        const l = wi(i);
        if (typeof l == 'string') {
          const g =
            (u = j(this, er).get(l)) == null
              ? void 0
              : u.find((h) => h !== i && h.state.isPaused);
          return (g == null ? void 0 : g.continue()) ?? Promise.resolve();
        } else return Promise.resolve();
      }
      clear() {
        vt.batch(() => {
          (j(this, Tr).forEach((i) => {
            this.notify({ type: 'removed', mutation: i });
          }),
            j(this, Tr).clear(),
            j(this, er).clear());
        });
      }
      getAll() {
        return Array.from(j(this, Tr));
      }
      find(i) {
        const l = { exact: !0, ...i };
        return this.getAll().find((u) => Da(l, u));
      }
      findAll(i = {}) {
        return this.getAll().filter((l) => Da(i, l));
      }
      notify(i) {
        vt.batch(() => {
          this.listeners.forEach((l) => {
            l(i);
          });
        });
      }
      resumePausedMutations() {
        const i = this.getAll().filter((l) => l.state.isPaused);
        return vt.batch(() =>
          Promise.all(i.map((l) => l.continue().catch($t))),
        );
      }
    }),
    (Tr = new WeakMap()),
    (er = new WeakMap()),
    ($s = new WeakMap()),
    pl);
function wi(n) {
  var i;
  return (i = n.options.scope) == null ? void 0 : i.id;
}
var Ar,
  wl,
  v0 =
    ((wl = class extends Ni {
      constructor(i = {}) {
        super();
        Ie(this, Ar);
        ((this.config = i), pe(this, Ar, new Map()));
      }
      build(i, l, u) {
        const g = l.queryKey,
          h = l.queryHash ?? Bo(g, l);
        let w = this.get(h);
        return (
          w ||
            ((w = new b0({
              client: i,
              queryKey: g,
              queryHash: h,
              options: i.defaultQueryOptions(l),
              state: u,
              defaultOptions: i.getQueryDefaults(g),
            })),
            this.add(w)),
          w
        );
      }
      add(i) {
        j(this, Ar).has(i.queryHash) ||
          (j(this, Ar).set(i.queryHash, i),
          this.notify({ type: 'added', query: i }));
      }
      remove(i) {
        const l = j(this, Ar).get(i.queryHash);
        l &&
          (i.destroy(),
          l === i && j(this, Ar).delete(i.queryHash),
          this.notify({ type: 'removed', query: i }));
      }
      clear() {
        vt.batch(() => {
          this.getAll().forEach((i) => {
            this.remove(i);
          });
        });
      }
      get(i) {
        return j(this, Ar).get(i);
      }
      getAll() {
        return [...j(this, Ar).values()];
      }
      find(i) {
        const l = { exact: !0, ...i };
        return this.getAll().find((u) => Ma(l, u));
      }
      findAll(i = {}) {
        const l = this.getAll();
        return Object.keys(i).length > 0 ? l.filter((u) => Ma(i, u)) : l;
      }
      notify(i) {
        vt.batch(() => {
          this.listeners.forEach((l) => {
            l(i);
          });
        });
      }
      onFocus() {
        vt.batch(() => {
          this.getAll().forEach((i) => {
            i.onFocus();
          });
        });
      }
      onOnline() {
        vt.batch(() => {
          this.getAll().forEach((i) => {
            i.onOnline();
          });
        });
      }
    }),
    (Ar = new WeakMap()),
    wl),
  Je,
  Wr,
  Hr,
  Yn,
  Kn,
  Qr,
  Jn,
  qn,
  Cl,
  N0 =
    ((Cl = class {
      constructor(n = {}) {
        Ie(this, Je);
        Ie(this, Wr);
        Ie(this, Hr);
        Ie(this, Yn);
        Ie(this, Kn);
        Ie(this, Qr);
        Ie(this, Jn);
        Ie(this, qn);
        (pe(this, Je, n.queryCache || new v0()),
          pe(this, Wr, n.mutationCache || new R0()),
          pe(this, Hr, n.defaultOptions || {}),
          pe(this, Yn, new Map()),
          pe(this, Kn, new Map()),
          pe(this, Qr, 0));
      }
      mount() {
        (gi(this, Qr)._++,
          j(this, Qr) === 1 &&
            (pe(
              this,
              Jn,
              Xl.subscribe(async (n) => {
                n &&
                  (await this.resumePausedMutations(), j(this, Je).onFocus());
              }),
            ),
            pe(
              this,
              qn,
              Ei.subscribe(async (n) => {
                n &&
                  (await this.resumePausedMutations(), j(this, Je).onOnline());
              }),
            )));
      }
      unmount() {
        var n, i;
        (gi(this, Qr)._--,
          j(this, Qr) === 0 &&
            ((n = j(this, Jn)) == null || n.call(this),
            pe(this, Jn, void 0),
            (i = j(this, qn)) == null || i.call(this),
            pe(this, qn, void 0)));
      }
      isFetching(n) {
        return j(this, Je).findAll({ ...n, fetchStatus: 'fetching' }).length;
      }
      isMutating(n) {
        return j(this, Wr).findAll({ ...n, status: 'pending' }).length;
      }
      getQueryData(n) {
        var l;
        const i = this.defaultQueryOptions({ queryKey: n });
        return (l = j(this, Je).get(i.queryHash)) == null
          ? void 0
          : l.state.data;
      }
      ensureQueryData(n) {
        const i = this.defaultQueryOptions(n),
          l = j(this, Je).build(this, i),
          u = l.state.data;
        return u === void 0
          ? this.fetchQuery(n)
          : (n.revalidateIfStale &&
              l.isStaleByTime(fo(i.staleTime, l)) &&
              this.prefetchQuery(i),
            Promise.resolve(u));
      }
      getQueriesData(n) {
        return j(this, Je)
          .findAll(n)
          .map(({ queryKey: i, state: l }) => {
            const u = l.data;
            return [i, u];
          });
      }
      setQueryData(n, i, l) {
        const u = this.defaultQueryOptions({ queryKey: n }),
          g = j(this, Je).get(u.queryHash),
          h = g == null ? void 0 : g.state.data,
          w = o0(i, h);
        if (w !== void 0)
          return j(this, Je)
            .build(this, u)
            .setData(w, { ...l, manual: !0 });
      }
      setQueriesData(n, i, l) {
        return vt.batch(() =>
          j(this, Je)
            .findAll(n)
            .map(({ queryKey: u }) => [u, this.setQueryData(u, i, l)]),
        );
      }
      getQueryState(n) {
        var l;
        const i = this.defaultQueryOptions({ queryKey: n });
        return (l = j(this, Je).get(i.queryHash)) == null ? void 0 : l.state;
      }
      removeQueries(n) {
        const i = j(this, Je);
        vt.batch(() => {
          i.findAll(n).forEach((l) => {
            i.remove(l);
          });
        });
      }
      resetQueries(n, i) {
        const l = j(this, Je);
        return vt.batch(
          () => (
            l.findAll(n).forEach((u) => {
              u.reset();
            }),
            this.refetchQueries({ type: 'active', ...n }, i)
          ),
        );
      }
      cancelQueries(n, i = {}) {
        const l = { revert: !0, ...i },
          u = vt.batch(() =>
            j(this, Je)
              .findAll(n)
              .map((g) => g.cancel(l)),
          );
        return Promise.all(u).then($t).catch($t);
      }
      invalidateQueries(n, i = {}) {
        return vt.batch(
          () => (
            j(this, Je)
              .findAll(n)
              .forEach((l) => {
                l.invalidate();
              }),
            (n == null ? void 0 : n.refetchType) === 'none'
              ? Promise.resolve()
              : this.refetchQueries(
                  {
                    ...n,
                    type:
                      (n == null ? void 0 : n.refetchType) ??
                      (n == null ? void 0 : n.type) ??
                      'active',
                  },
                  i,
                )
          ),
        );
      }
      refetchQueries(n, i = {}) {
        const l = { ...i, cancelRefetch: i.cancelRefetch ?? !0 },
          u = vt.batch(() =>
            j(this, Je)
              .findAll(n)
              .filter((g) => !g.isDisabled() && !g.isStatic())
              .map((g) => {
                let h = g.fetch(void 0, l);
                return (
                  l.throwOnError || (h = h.catch($t)),
                  g.state.fetchStatus === 'paused' ? Promise.resolve() : h
                );
              }),
          );
        return Promise.all(u).then($t);
      }
      fetchQuery(n) {
        const i = this.defaultQueryOptions(n);
        i.retry === void 0 && (i.retry = !1);
        const l = j(this, Je).build(this, i);
        return l.isStaleByTime(fo(i.staleTime, l))
          ? l.fetch(i)
          : Promise.resolve(l.state.data);
      }
      prefetchQuery(n) {
        return this.fetchQuery(n).then($t).catch($t);
      }
      fetchInfiniteQuery(n) {
        return ((n._type = 'infinite'), this.fetchQuery(n));
      }
      prefetchInfiniteQuery(n) {
        return this.fetchInfiniteQuery(n).then($t).catch($t);
      }
      ensureInfiniteQueryData(n) {
        return ((n._type = 'infinite'), this.ensureQueryData(n));
      }
      resumePausedMutations() {
        return Ei.isOnline()
          ? j(this, Wr).resumePausedMutations()
          : Promise.resolve();
      }
      getQueryCache() {
        return j(this, Je);
      }
      getMutationCache() {
        return j(this, Wr);
      }
      getDefaultOptions() {
        return j(this, Hr);
      }
      setDefaultOptions(n) {
        pe(this, Hr, n);
      }
      setQueryDefaults(n, i) {
        j(this, Yn).set(Ks(n), { queryKey: n, defaultOptions: i });
      }
      getQueryDefaults(n) {
        const i = [...j(this, Yn).values()],
          l = {};
        return (
          i.forEach((u) => {
            Zn(n, u.queryKey) && Object.assign(l, u.defaultOptions);
          }),
          l
        );
      }
      setMutationDefaults(n, i) {
        j(this, Kn).set(Ks(n), { mutationKey: n, defaultOptions: i });
      }
      getMutationDefaults(n) {
        const i = [...j(this, Kn).values()],
          l = {};
        return (
          i.forEach((u) => {
            Zn(n, u.mutationKey) && Object.assign(l, u.defaultOptions);
          }),
          l
        );
      }
      defaultQueryOptions(n) {
        if (n._defaulted) return n;
        const i = {
          ...j(this, Hr).queries,
          ...this.getQueryDefaults(n.queryKey),
          ...n,
          _defaulted: !0,
        };
        return (
          i.queryHash || (i.queryHash = Bo(i.queryKey, i)),
          i.refetchOnReconnect === void 0 &&
            (i.refetchOnReconnect = i.networkMode !== 'always'),
          i.throwOnError === void 0 && (i.throwOnError = !!i.suspense),
          !i.networkMode && i.persister && (i.networkMode = 'offlineFirst'),
          i.queryFn === _o && (i.enabled = !1),
          i
        );
      }
      defaultMutationOptions(n) {
        return n != null && n._defaulted
          ? n
          : {
              ...j(this, Hr).mutations,
              ...((n == null ? void 0 : n.mutationKey) &&
                this.getMutationDefaults(n.mutationKey)),
              ...n,
              _defaulted: !0,
            };
      }
      clear() {
        (j(this, Je).clear(), j(this, Wr).clear());
      }
    }),
    (Je = new WeakMap()),
    (Wr = new WeakMap()),
    (Hr = new WeakMap()),
    (Yn = new WeakMap()),
    (Kn = new WeakMap()),
    (Qr = new WeakMap()),
    (Jn = new WeakMap()),
    (qn = new WeakMap()),
    Cl);
function Xe(n, i) {
  let l = ee.beginCell();
  return (i(n, l), l.endCell());
}
function nt(n, i, l) {
  let u = n.loadUint(32);
  if (u !== i)
    throw new Error(
      `Incorrect prefix for '${l}': expected 0x${i.toString(16).padStart(8, '0')}, got 0x${u.toString(16).padStart(8, '0')}`,
    );
}
function ka(n, i) {
  return i % 4
    ? `0b${n.toString(2).padStart(i, '0')}`
    : `0x${n.toString(16).padStart(i / 4, '0')}`;
}
function ec(n, i, l, u) {
  let g = n.loadUint(l);
  if (g !== i)
    throw new Error(
      `Incorrect prefix for '${u}': expected ${ka(i, l)}, got ${ka(g, l)}`,
    );
}
function $n(n, i, l) {
  return n.remainingBits >= l && n.preloadUint(l) === i;
}
function Lo(n) {
  throw new Error(`Incorrect prefix for '${n}': none of variants matched`);
}
function En(n, i, l) {
  let u = ee.beginCell();
  (l(n.ref, u), i.storeRef(u.endCell()));
}
function bn(n, i) {
  let l = n.loadRef().beginParse();
  return { ref: i(l) };
}
function tc(n, i) {
  i.storeSlice(n);
}
function rc(n) {
  let i = n.clone();
  for (n.loadBits(n.remainingBits); n.remainingRefs;) n.loadRef();
  return i;
}
function es(n, i, l) {
  n === null ? i.storeUint(0, 1) : (i.storeUint(1, 1), l(n, i));
}
function Fa(n, i) {
  return {
    serialize(l, u) {
      i(l, u);
    },
    parse(l) {
      const u = n(l);
      return (l.endParse(), u);
    },
  };
}
let eo = class nc {
  constructor(i) {
    this.tuple = i;
  }
  static fromGetMethod(i, l) {
    let u = [];
    for (; l.stack.remaining;) u.push(l.stack.pop());
    if (u.length !== i)
      throw new Error(`expected ${i} stack width, got ${u.length}`);
    return new nc(u);
  }
  popExpecting(i) {
    const l = this.tuple.shift();
    if ((l == null ? void 0 : l.type) === i) return l;
    throw new Error(`not '${i}' on a stack`);
  }
  popCellLike() {
    const i = this.tuple.shift();
    if (i && (i.type === 'cell' || i.type === 'slice' || i.type === 'builder'))
      return i.cell;
    throw new Error('not cell/slice on a stack');
  }
  readBigInt() {
    return this.popExpecting('int').value;
  }
  readBoolean() {
    return this.popExpecting('int').value !== 0n;
  }
  readCell() {
    return this.popCellLike();
  }
  readSlice() {
    return this.popCellLike().beginParse();
  }
  readSnakeString() {
    return this.readCell().beginParse().loadStringTail();
  }
  readCellRef(i) {
    return { ref: i(this.readCell().beginParse()) };
  }
};
const Sn = {
    PREFIX: 0,
    create(n) {
      return { $: 'PayloadInline', ...n };
    },
    fromSlice(n) {
      return (
        ec(n, 0, 1, 'PayloadInline'),
        { $: 'PayloadInline', value: rc(n) }
      );
    },
    store(n, i) {
      (i.storeUint(0, 1), tc(n.value, i));
    },
    toCell(n) {
      return Xe(n, Sn.store);
    },
  },
  Tn = {
    PREFIX: 1,
    create(n) {
      return { $: 'PayloadInRef', ...n };
    },
    fromSlice(n) {
      return (
        ec(n, 1, 1, 'PayloadInRef'),
        { $: 'PayloadInRef', value: bn(n, rc) }
      );
    },
    store(n, i) {
      (i.storeUint(1, 1), En(n.value, i, tc));
    },
    toCell(n) {
      return Xe(n, Tn.store);
    },
  },
  on = {
    PREFIX: 260734629,
    create(n) {
      return { $: 'AskToTransfer', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 260734629, 'AskToTransfer'),
        {
          $: 'AskToTransfer',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          transferRecipient: n.loadAddress(),
          sendExcessesTo: n.loadMaybeAddress(),
          customPayload: n.loadBoolean() ? n.loadRef() : null,
          forwardTonAmount: n.loadCoins(),
          forwardPayload: $n(n, 0, 1)
            ? Sn.fromSlice(n)
            : $n(n, 1, 1)
              ? Tn.fromSlice(n)
              : Lo('AskToTransfer.forwardPayload'),
        }
      );
    },
    store(n, i) {
      switch (
        (i.storeUint(260734629, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeAddress(n.transferRecipient),
        i.storeAddress(n.sendExcessesTo),
        es(n.customPayload, i, (l, u) => u.storeRef(l)),
        i.storeCoins(n.forwardTonAmount),
        n.forwardPayload.$)
      ) {
        case 'PayloadInline':
          Sn.store(n.forwardPayload, i);
          break;
        case 'PayloadInRef':
          Tn.store(n.forwardPayload, i);
          break;
      }
    },
    toCell(n) {
      return Xe(n, on.store);
    },
  },
  ws = {
    PREFIX: 1935855772,
    create(n) {
      return { $: 'TransferNotificationForRecipient', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 1935855772, 'TransferNotificationForRecipient'),
        {
          $: 'TransferNotificationForRecipient',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          transferInitiator: n.loadAddress(),
          forwardPayload: $n(n, 0, 1)
            ? Sn.fromSlice(n)
            : $n(n, 1, 1)
              ? Tn.fromSlice(n)
              : Lo('TransferNotificationForRecipient.forwardPayload'),
        }
      );
    },
    store(n, i) {
      switch (
        (i.storeUint(1935855772, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeAddress(n.transferInitiator),
        n.forwardPayload.$)
      ) {
        case 'PayloadInline':
          Sn.store(n.forwardPayload, i);
          break;
        case 'PayloadInRef':
          Tn.store(n.forwardPayload, i);
          break;
      }
    },
    toCell(n) {
      return Xe(n, ws.store);
    },
  },
  Cs = {
    PREFIX: 395134233,
    create(n) {
      return { $: 'InternalTransferStep', transferredAsCredit: !1, ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 395134233, 'InternalTransferStep'),
        {
          $: 'InternalTransferStep',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          version: n.loadUintBig(10),
          transferredAsCredit: n.loadBoolean(),
          transferInitiator: n.loadAddress(),
          sendExcessesTo: n.loadMaybeAddress(),
          forwardTonAmount: n.loadCoins(),
          forwardPayload: $n(n, 0, 1)
            ? Sn.fromSlice(n)
            : $n(n, 1, 1)
              ? Tn.fromSlice(n)
              : Lo('InternalTransferStep.forwardPayload'),
        }
      );
    },
    store(n, i) {
      switch (
        (i.storeUint(395134233, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeUint(n.version, 10),
        i.storeBit(n.transferredAsCredit),
        i.storeAddress(n.transferInitiator),
        i.storeAddress(n.sendExcessesTo),
        i.storeCoins(n.forwardTonAmount),
        n.forwardPayload.$)
      ) {
        case 'PayloadInline':
          Sn.store(n.forwardPayload, i);
          break;
        case 'PayloadInRef':
          Tn.store(n.forwardPayload, i);
          break;
      }
    },
    toCell(n) {
      return Xe(n, Cs.store);
    },
  },
  an = {
    PREFIX: 1499400124,
    create(n) {
      return { $: 'AskToBurn', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 1499400124, 'AskToBurn'),
        {
          $: 'AskToBurn',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          sendExcessesTo: n.loadMaybeAddress(),
          customPayload: n.loadBoolean() ? n.loadRef() : null,
        }
      );
    },
    store(n, i) {
      (i.storeUint(1499400124, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeAddress(n.sendExcessesTo),
        es(n.customPayload, i, (l, u) => u.storeRef(l)));
    },
    toCell(n) {
      return Xe(n, an.store);
    },
  },
  ys = {
    PREFIX: 621336170,
    create(n) {
      return {
        $: 'Upgrade',
        walletUpgrade: !0,
        newData: null,
        newCode: null,
        ...n,
      };
    },
    fromSlice(n) {
      return (
        nt(n, 621336170, 'Upgrade'),
        {
          $: 'Upgrade',
          walletUpgrade: n.loadBoolean(),
          walletVersion: n.loadUintBig(10),
          sender: n.loadAddress(),
          newData: n.loadBoolean() ? n.loadRef() : null,
          newCode: n.loadBoolean() ? n.loadRef() : null,
        }
      );
    },
    store(n, i) {
      (i.storeUint(621336170, 32),
        i.storeBit(n.walletUpgrade),
        i.storeUint(n.walletVersion, 10),
        i.storeAddress(n.sender),
        es(n.newData, i, (l, u) => u.storeRef(l)),
        es(n.newCode, i, (l, u) => u.storeRef(l)));
    },
    toCell(n) {
      return Xe(n, ys.store);
    },
  },
  Es = {
    PREFIX: 3547469196,
    create() {
      return { $: 'TopUpTons' };
    },
    fromSlice(n) {
      return (nt(n, 3547469196, 'TopUpTons'), { $: 'TopUpTons' });
    },
    store(n, i) {
      i.storeUint(3547469196, 32);
    },
    toCell(n) {
      return Xe(n, Es.store);
    },
  },
  bs = {
    PREFIX: 1,
    create(n) {
      return { $: 'InternalInvite', queryId: 0n, ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 1, 'InternalInvite'),
        {
          $: 'InternalInvite',
          queryId: n.loadUintBig(64),
          version: n.loadUintBig(10),
          sender: n.loadAddress(),
          invitor: n.loadAddress(),
          currentWalletCode: n.loadRef(),
          currentStorage: n.loadBoolean() ? n.loadRef() : null,
          id: n.loadStringRefTail(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(1, 32),
        i.storeUint(n.queryId, 64),
        i.storeUint(n.version, 10),
        i.storeAddress(n.sender),
        i.storeAddress(n.invitor),
        i.storeRef(n.currentWalletCode),
        es(n.currentStorage, i, (l, u) => u.storeRef(l)),
        i.storeStringRefTail(n.id));
    },
    toCell(n) {
      return Xe(n, bs.store);
    },
  },
  Is = {
    PREFIX: 2,
    create() {
      return { $: 'InternalDeActivate' };
    },
    fromSlice(n) {
      return (nt(n, 2, 'InternalDeActivate'), { $: 'InternalDeActivate' });
    },
    store(n, i) {
      i.storeUint(2, 32);
    },
    toCell(n) {
      return Xe(n, Is.store);
    },
  },
  Ss = {
    PREFIX: 5,
    create(n) {
      return { $: 'AuthorityAction', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 5, 'AuthorityAction'),
        { $: 'AuthorityAction', sender: n.loadAddress() }
      );
    },
    store(n, i) {
      (i.storeUint(5, 32), i.storeAddress(n.sender));
    },
    toCell(n) {
      return Xe(n, Ss.store);
    },
  },
  Ts = {
    PREFIX: 6,
    create(n) {
      return { $: 'SetStatus', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 6, 'SetStatus'),
        { $: 'SetStatus', sender: n.loadAddress(), status: n.loadUintBig(2) }
      );
    },
    store(n, i) {
      (i.storeUint(6, 32), i.storeAddress(n.sender), i.storeUint(n.status, 2));
    },
    toCell(n) {
      return Xe(n, Ts.store);
    },
  },
  Rs = {
    PREFIX: 8,
    create(n) {
      return { $: 'VotingAction', positiveVote: !0, count: 10n, ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 8, 'VotingAction'),
        {
          $: 'VotingAction',
          positiveVote: n.loadBoolean(),
          count: n.loadUintBig(4),
          sender: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(8, 32),
        i.storeBit(n.positiveVote),
        i.storeUint(n.count, 4),
        i.storeAddress(n.sender));
    },
    toCell(n) {
      return Xe(n, Rs.store);
    },
  },
  vs = {
    PREFIX: 9,
    create(n) {
      return { $: 'Payback', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 9, 'Payback'),
        {
          $: 'Payback',
          queryId: n.loadUintBig(64),
          amount: n.loadCoins(),
          sender: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(9, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.amount),
        i.storeAddress(n.sender));
    },
    toCell(n) {
      return Xe(n, vs.store);
    },
  },
  Ns = {
    PREFIX: 16,
    create(n) {
      return { $: 'RequestUpgradeCode', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 16, 'RequestUpgradeCode'),
        {
          $: 'RequestUpgradeCode',
          sender: n.loadAddress(),
          version: n.loadUintBig(10),
        }
      );
    },
    store(n, i) {
      (i.storeUint(16, 32),
        i.storeAddress(n.sender),
        i.storeUint(n.version, 10));
    },
    toCell(n) {
      return Xe(n, Ns.store);
    },
  },
  ln = {
    PREFIX: 20,
    create() {
      return { $: 'Destroy' };
    },
    fromSlice(n) {
      return (nt(n, 20, 'Destroy'), { $: 'Destroy' });
    },
    store(n, i) {
      i.storeUint(20, 32);
    },
    toCell(n) {
      return Xe(n, ln.store);
    },
  },
  rr = {
    PREFIX: 22,
    create(n) {
      return { $: 'OthersActions', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 22, 'OthersActions'),
        {
          $: 'OthersActions',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          transferRecipient: n.loadAddress(),
          sendExcessesTo: n.loadMaybeAddress(),
          customPayload: n.loadBoolean() ? n.loadRef() : null,
          forwardTonAmount: n.loadCoins(),
          forwardPayload: n.loadStringRefTail(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(22, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeAddress(n.transferRecipient),
        i.storeAddress(n.sendExcessesTo),
        es(n.customPayload, i, (l, u) => u.storeRef(l)),
        i.storeCoins(n.forwardTonAmount),
        i.storeStringRefTail(n.forwardPayload));
    },
    toCell(n) {
      return Xe(n, rr.store);
    },
  },
  Ms = {
    PREFIX: 23,
    create(n) {
      return { $: 'ChangeId', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 23, 'ChangeId'),
        { $: 'ChangeId', newId: n.loadStringRefTail() }
      );
    },
    store(n, i) {
      (i.storeUint(23, 32), i.storeStringRefTail(n.newId));
    },
    toCell(n) {
      return Xe(n, Ms.store);
    },
  },
  Ds = {
    PREFIX: 24,
    create() {
      return { $: 'RequestState' };
    },
    fromSlice(n) {
      return (nt(n, 24, 'RequestState'), { $: 'RequestState' });
    },
    store(n, i) {
      i.storeUint(24, 32);
    },
    toCell(n) {
      return Xe(n, Ds.store);
    },
  },
  Os = {
    PREFIX: 81,
    create(n) {
      return { $: 'UnFollow', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 81, 'UnFollow'),
        {
          $: 'UnFollow',
          queryId: n.loadUintBig(64),
          follow: n.loadBoolean(),
          followee: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(81, 32),
        i.storeUint(n.queryId, 64),
        i.storeBit(n.follow),
        i.storeAddress(n.followee));
    },
    toCell(n) {
      return Xe(n, Os.store);
    },
  },
  Ps = {
    PREFIX: 82,
    create(n) {
      return { $: 'UnFollowInternal', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 82, 'UnFollowInternal'),
        {
          $: 'UnFollowInternal',
          queryId: n.loadUintBig(64),
          follow: n.loadBoolean(),
          sender: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(82, 32),
        i.storeUint(n.queryId, 64),
        i.storeBit(n.follow),
        i.storeAddress(n.sender));
    },
    toCell(n) {
      return Xe(n, Ps.store);
    },
  },
  Bs = {
    PREFIX: 286331153,
    create(n) {
      return { $: 'EnterLottery', ...n };
    },
    fromSlice(n) {
      return (
        nt(n, 286331153, 'EnterLottery'),
        { $: 'EnterLottery', sender: n.loadAddress(), amount: n.loadCoins() }
      );
    },
    store(n, i) {
      (i.storeUint(286331153, 32),
        i.storeAddress(n.sender),
        i.storeCoins(n.amount));
    },
    toCell(n) {
      return Xe(n, Bs.store);
    },
  },
  Ua = {
    fromSlice(n) {
      return {
        $: 'NomInAddrs',
        nominee: n.loadMaybeAddress(),
        invitor: n.loadMaybeAddress(),
        invitor0: n.loadMaybeAddress(),
      };
    },
    store(n, i) {
      (i.storeAddress(n.nominee),
        i.storeAddress(n.invitor),
        i.storeAddress(n.invitor0));
    },
  },
  ja = {
    fromSlice(n) {
      return {
        $: 'TrustedAddrs',
        minterAddr: n.loadAddress(),
        personalJettonMinter: n.loadMaybeAddress(),
        personalJettonWallet: n.loadMaybeAddress(),
        authorisedAccs: ee.Dictionary.load(
          ee.Dictionary.Keys.Address(),
          Fa(
            (i) => i.loadAddress(),
            (i, l) => l.storeAddress(i),
          ),
          n,
        ),
      };
    },
    store(n, i) {
      (i.storeAddress(n.minterAddr),
        i.storeAddress(n.personalJettonMinter),
        i.storeAddress(n.personalJettonWallet),
        i.storeDict(
          n.authorisedAccs,
          ee.Dictionary.Keys.Address(),
          Fa(
            (l) => l.loadAddress(),
            (l, u) => u.storeAddress(l),
          ),
        ));
    },
  },
  xo = {
    fromSlice(n) {
      return {
        $: 'Addresses',
        owner: n.loadAddress(),
        treasury: n.loadAddress(),
        baseFiWalletCode: n.loadRef(),
        nomInAddrs: bn(n, Ua.fromSlice),
        trustedJettonAddrs: bn(n, ja.fromSlice),
      };
    },
    store(n, i) {
      (i.storeAddress(n.owner),
        i.storeAddress(n.treasury),
        i.storeRef(n.baseFiWalletCode),
        En(n.nomInAddrs, i, Ua.store),
        En(n.trustedJettonAddrs, i, ja.store));
    },
  },
  Ao = {
    fromSlice(n) {
      return {
        $: 'Maps',
        invited: ee.Dictionary.load(
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.BigVarUint(4),
          n,
        ),
        allowances: ee.Dictionary.load(
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.BigVarUint(4),
          n,
        ),
        votedFor: ee.Dictionary.load(
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.BigUint(4),
          n,
        ),
        reportInfo: bn(n, za.fromSlice),
      };
    },
    store(n, i) {
      (i.storeDict(
        n.invited,
        ee.Dictionary.Keys.Address(),
        ee.Dictionary.Values.BigVarUint(4),
      ),
        i.storeDict(
          n.allowances,
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.BigVarUint(4),
        ),
        i.storeDict(
          n.votedFor,
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.BigUint(4),
        ),
        En(n.reportInfo, i, za.store));
    },
  },
  za = {
    fromSlice(n) {
      return {
        $: 'ReportInfo',
        reports: ee.Dictionary.load(
          ee.Dictionary.Keys.Address(),
          ee.Dictionary.Values.Bool(),
          n,
        ),
        tosBreach: n.loadBoolean(),
        reporterCount: n.loadUintBig(10),
        disputerCount: n.loadUintBig(10),
        reportResolutionTime: n.loadUintBig(32),
      };
    },
    store(n, i) {
      (i.storeDict(
        n.reports,
        ee.Dictionary.Keys.Address(),
        ee.Dictionary.Values.Bool(),
      ),
        i.storeBit(n.tosBreach),
        i.storeUint(n.reporterCount, 10),
        i.storeUint(n.disputerCount, 10),
        i.storeUint(n.reportResolutionTime, 32));
    },
  },
  mo = {
    fromSlice(n) {
      return {
        $: 'TimeStamps',
        accountInit: n.loadUintBig(32),
        lastInvite: n.loadUintBig(32),
        lastClaim: n.loadUintBig(32),
      };
    },
    store(n, i) {
      (i.storeUint(n.accountInit, 32),
        i.storeUint(n.lastInvite, 32),
        i.storeUint(n.lastClaim, 32));
    },
  },
  po = {
    create(n) {
      return {
        $: 'FiWalletStore',
        jettonBalance: 0n,
        goldCoins: 1n,
        id: '',
        txnCount: 0n,
        status: 0n,
        isAuthorityAccount: !1,
        creditNeed: 0n,
        accumulatedFees: 0n,
        debt: 0n,
        debts: !1,
        votes: 10n,
        receivedVotes: 0n,
        connections: 0n,
        active: !1,
        mintable: !0,
        version: 0n,
        storeVersion: 0n,
        ...n,
      };
    },
    fromSlice(n) {
      return {
        $: 'FiWalletStore',
        jettonBalance: n.loadCoins(),
        goldCoins: n.loadUintBig(32),
        id: n.loadStringRefTail(),
        txnCount: n.loadUintBig(8),
        status: n.loadUintBig(2),
        isAuthorityAccount: n.loadBoolean(),
        creditNeed: n.loadCoins(),
        accumulatedFees: n.loadCoins(),
        debt: n.loadCoins(),
        debts: n.loadBoolean(),
        votes: n.loadUintBig(4),
        receivedVotes: n.loadUintBig(20),
        connections: n.loadUintBig(8),
        active: n.loadBoolean(),
        mintable: n.loadBoolean(),
        version: n.loadUintBig(10),
        storeVersion: n.loadUintBig(10),
        timestamps: bn(n, mo.fromSlice),
        addresses: bn(n, xo.fromSlice),
        maps: bn(n, Ao.fromSlice),
      };
    },
    store(n, i) {
      (i.storeCoins(n.jettonBalance),
        i.storeUint(n.goldCoins, 32),
        i.storeStringRefTail(n.id),
        i.storeUint(n.txnCount, 8),
        i.storeUint(n.status, 2),
        i.storeBit(n.isAuthorityAccount),
        i.storeCoins(n.creditNeed),
        i.storeCoins(n.accumulatedFees),
        i.storeCoins(n.debt),
        i.storeBit(n.debts),
        i.storeUint(n.votes, 4),
        i.storeUint(n.receivedVotes, 20),
        i.storeUint(n.connections, 8),
        i.storeBit(n.active),
        i.storeBit(n.mintable),
        i.storeUint(n.version, 10),
        i.storeUint(n.storeVersion, 10),
        En(n.timestamps, i, mo.store),
        En(n.addresses, i, xo.store),
        En(n.maps, i, Ao.store));
    },
    toCell(n) {
      return Xe(n, po.store);
    },
  };
function M0(n, i, l) {
  var h;
  const u = ee
    .beginCell()
    .store(
      ee.storeStateInit({
        code: n,
        data: i,
        splitDepth: (h = l.toShard) == null ? void 0 : h.fixedPrefixLength,
        special: null,
        libraries: null,
      }),
    )
    .endCell();
  let g = u.hash();
  if (l.toShard) {
    const w = l.toShard.fixedPrefixLength;
    g = ee
      .beginCell()
      .storeBits(new ee.BitString(l.toShard.closeTo.hash, 0, w))
      .storeBits(new ee.BitString(u.hash(), w, 256 - w))
      .endCell()
      .beginParse()
      .loadBuffer(32);
  }
  return new ee.Address(l.workchain ?? 0, g);
}
const nn = class nn {
  constructor(i, l) {
    Er(this, 'address');
    Er(this, 'init');
    ((this.address = i), (this.init = l));
  }
  static fromAddress(i) {
    return new nn(i);
  }
  static fromStorage(i, l) {
    const u = {
        code: (l == null ? void 0 : l.overrideContractCode) ?? nn.CodeCell,
        data: po.toCell(po.create(i)),
      },
      g = M0(u.code, u.data, l ?? {});
    return new nn(g, u);
  }
  static createCellOfAskToTransfer(i) {
    return on.toCell(on.create(i));
  }
  static createCellOfAskToBurn(i) {
    return an.toCell(an.create(i));
  }
  static createCellOfAuthorityAction(i) {
    return Ss.toCell(Ss.create(i));
  }
  static createCellOfChangeId(i) {
    return Ms.toCell(Ms.create(i));
  }
  static createCellOfInternalTransferStep(i) {
    return Cs.toCell(Cs.create(i));
  }
  static createCellOfInternalInvite(i) {
    return bs.toCell(bs.create(i));
  }
  static createCellOfInternalDeActivate(i) {
    return Is.toCell(Is.create());
  }
  static createCellOfOthersActions(i) {
    return rr.toCell(rr.create(i));
  }
  static createCellOfPayback(i) {
    return vs.toCell(vs.create(i));
  }
  static createCellOfRequestState(i) {
    return Ds.toCell(Ds.create());
  }
  static createCellOfRequestUpgradeCode(i) {
    return Ns.toCell(Ns.create(i));
  }
  static createCellOfSetStatus(i) {
    return Ts.toCell(Ts.create(i));
  }
  static createCellOfTopUpTons(i) {
    return Es.toCell(Es.create());
  }
  static createCellOfTransferNotificationForRecipient(i) {
    return ws.toCell(ws.create(i));
  }
  static createCellOfUpgrade(i) {
    return ys.toCell(ys.create(i));
  }
  static createCellOfVotingAction(i) {
    return Rs.toCell(Rs.create(i));
  }
  static createCellOfEnterLottery(i) {
    return Bs.toCell(Bs.create(i));
  }
  static createCellOfUnFollow(i) {
    return Os.toCell(Os.create(i));
  }
  static createCellOfUnFollowInternal(i) {
    return Ps.toCell(Ps.create(i));
  }
  static createCellOfDestroy(i) {
    return ln.toCell(ln.create());
  }
  async sendDeploy(i, l, u, g) {
    return i.internal(l, { value: u, body: ee.Cell.EMPTY, ...g });
  }
  async sendAskToTransfer(i, l, u, g, h) {
    return i.internal(l, { value: u, body: on.toCell(on.create(g)), ...h });
  }
  async sendAskToBurn(i, l, u, g, h) {
    return i.internal(l, { value: u, body: an.toCell(an.create(g)), ...h });
  }
  async sendAuthorityAction(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ss.toCell(Ss.create(g)), ...h });
  }
  async sendChangeId(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ms.toCell(Ms.create(g)), ...h });
  }
  async sendInternalTransferStep(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Cs.toCell(Cs.create(g)), ...h });
  }
  async sendInternalInvite(i, l, u, g, h) {
    return i.internal(l, { value: u, body: bs.toCell(bs.create(g)), ...h });
  }
  async sendInternalDeActivate(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Is.toCell(Is.create()), ...h });
  }
  async sendOthersActions(i, l, u, g, h) {
    return i.internal(l, { value: u, body: rr.toCell(rr.create(g)), ...h });
  }
  async sendPayback(i, l, u, g, h) {
    return i.internal(l, { value: u, body: vs.toCell(vs.create(g)), ...h });
  }
  async sendRequestState(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ds.toCell(Ds.create()), ...h });
  }
  async sendRequestUpgradeCode(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ns.toCell(Ns.create(g)), ...h });
  }
  async sendSetStatus(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ts.toCell(Ts.create(g)), ...h });
  }
  async sendTopUpTons(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Es.toCell(Es.create()), ...h });
  }
  async sendTransferNotificationForRecipient(i, l, u, g, h) {
    return i.internal(l, { value: u, body: ws.toCell(ws.create(g)), ...h });
  }
  async sendUpgrade(i, l, u, g, h) {
    return i.internal(l, { value: u, body: ys.toCell(ys.create(g)), ...h });
  }
  async sendVotingAction(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Rs.toCell(Rs.create(g)), ...h });
  }
  async sendEnterLottery(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Bs.toCell(Bs.create(g)), ...h });
  }
  async sendUnFollow(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Os.toCell(Os.create(g)), ...h });
  }
  async sendUnFollowInternal(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ps.toCell(Ps.create(g)), ...h });
  }
  async sendDestroy(i, l, u, g, h) {
    return i.internal(l, { value: u, body: ln.toCell(ln.create()), ...h });
  }
  async getWalletData(i) {
    const l = eo.fromGetMethod(4, await i.get('get_wallet_data', []));
    return {
      $: 'JettonWalletDataReply',
      jettonBalance: l.readBigInt(),
      ownerAddress: l.readSlice().loadAddress(),
      minterAddress: l.readSlice().loadAddress(),
      jettonWalletCode: l.readCell(),
    };
  }
  async getWalletDataAll(i) {
    const l = eo.fromGetMethod(20, await i.get('get_wallet_data_all', []));
    return {
      $: 'FiWalletStore',
      jettonBalance: l.readBigInt(),
      goldCoins: l.readBigInt(),
      id: l.readSnakeString(),
      txnCount: l.readBigInt(),
      status: l.readBigInt(),
      isAuthorityAccount: l.readBoolean(),
      creditNeed: l.readBigInt(),
      accumulatedFees: l.readBigInt(),
      debt: l.readBigInt(),
      debts: l.readBoolean(),
      votes: l.readBigInt(),
      receivedVotes: l.readBigInt(),
      connections: l.readBigInt(),
      active: l.readBoolean(),
      mintable: l.readBoolean(),
      version: l.readBigInt(),
      storeVersion: l.readBigInt(),
      timestamps: l.readCellRef(mo.fromSlice),
      addresses: l.readCellRef(xo.fromSlice),
      maps: l.readCellRef(Ao.fromSlice),
    };
  }
  async getId(i) {
    return eo.fromGetMethod(1, await i.get('get_id', [])).readSnakeString();
  }
};
(Er(
  nn,
  'CodeCell',
  ee.Cell.fromBase64(
    'te6ccgECRgEAFKAAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASAiIwIB1QYHAAesVxhAAvc+JGO0dMfMe1E0HAB+gDWH9TWCvoA+gD6ANYY0wcg1DHUMddMDNcsIIiIiIyZMDo6ghJUC+QA4w4YoMgB+gIWzhTMEs4B+gIB+gIB+gLOEssHzsntVOAg7UTQ+gDTH9TTB9MB0gD6APoA+gDSANMD0xPTB9IA0gDTCdMJgCAkC9TtRND6ADHTHzHUMdMKMfoAMfoAMfoAMdMgMdIA1DHXTO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMkoyPpSFvpSJM8UE8wUzMltbW1tyPQAcIEAhAMbXLCC8aijMmTs7CdM/MfoAMI5N1ywgAAAADI4ZMDoK0PQEMfQEMfQEMdQx0YIfF2b1ugAKpY4mPAvXLCAAAABEkTCOFjoJ1ywgAAAClDGS8j/hgh8XK1rwAAniEJriCQriEJoC/NTU10wi0CLQ+kj6SNTU10zQJtAC0AbTH9Mf1wsfA/pI+lAG9AT0BPQEDfpQ+lD6UDARJNcsIAAAALyOIlcQVxBXEFceVyH4l4IQHc1lALzysPiSKscFk/LCvOEL10zjDg3I+lQc+lQBER4B+lTJER3I+lIa+lQTzskCyMsfGAoLA5rXLCAAAAC0jzdXEVcRVyP4kizHBfLgSQ7TP/oA+kj6UPQB10wi+kQw8tFN+JeCEB3NZQC88rAjghAGBSNAuuMP4w4LESALDBEcDAsNDAwNDgDMyx8Xyx/JA8j6UhL6UswBERcBzBPMyQHI9AABERYB9AABEREB9AABERABzsnIARES+gIBERAByx8ezBzLBxrLARjKAFAG+gJQBPoCWPoCygDLA8sTywfKAMoAywnLCRLMEszMye1UAN4TXwM++CMngggJOoCgIbny4t+CC8JnACigIbycgggJOoBQCaAoucMAkjhw4vLi34IgChr7NUYAghA7msoAVheooBEhViGgyM+R73ZfehLLPwERIfoCUrD6Uh36VMnIz4UIUkD6UnHPC27MyYBQ+wADVDEighAF9eEAuo8WMDI+LYIQBo53gLrjDwsRHgsMERQREuMNCxEeCxESCw8QEQNA1ywgvGoozI8P1ywgfFP1LOMPERsRHhEb4w0NESANEM0mJygD/j0RFfLi2/iSLMcF8tLE7UTQ1DHUMddM0PpIMfpI1NQx10zQ+kj6UDH6UDH0BDHRiHDIy1/JbW1tAsj6VPpU+lTJbW1tBsj6UhL6VPpUFPQAyVYRyPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMVzIlAFhIDOi2CEAcnDgC6jw4tghANtYWAuuMPDBEUDOMNCxEUExQVAv4yD9D0AfQB9AHXTNBWFfLivvQB0wAx1wsJwQHy4sb4IweBOECgJ7kogggJOoCgKLmw+JItxwWx8uLfVhXBC/Lg+hEVpO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lISQB0Ans8WEszMEszJeFEiyM+DywTPhaDMzPkWhPewHYALUA7XJMjPigBAzhzL989QcMjPhqBUIC+BAQv0QcjPhQgS+lKBARrPC5NSoPpSyYBQ+wAD/j1WEvLivu1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWEsj6Uhb6UiTPFBPMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjFcyJzxYSzMwSzMlAFhcD7C2CEDuLh8C6j2otghAYFI0Auo7eLYIQOwIzgLqOUC2CEC5QFEC6mT0ibpIyG5E84o45MAyCEDTtzgC6ji34ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wDe4hEe4w0RHuMN4w0YGRoC/j3tRNDUMdQx10zQ+kgx+kjU1DHXTND6SPpQMfpQMfQEMdGIcMjLX8ltbW0CyPpU+lT6VMltbW0GyPpSEvpU+lQU9ADJVhLI+lIW+lIkzxQTzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxXMi6AAAAoAAAAEAAAgzxZAHAATAAAAoAAAAEAAAgBmeFEiyM+DywTPhaDMzPkWhPewHoALUA/XJMjPigBAzh3L989QyM+FiPpScs8LjsmAUPsAAFwwPBEeghJUC+QAoYISVAvkAMjPhYhSQPpSghARERERzwuOUrD6UgH6AsmAUPsAAv49VhqRf5f4kirHBcMA4vLivO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWEsj6Uhb6UiTPFBPMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjQBsASjA8ghAF9eEAyM+FCFJA+lIB+gKAEM8LilKg+lJWEM8LCclz+wAAmhXMi6AAAAoAAAAEAAAgzxYSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AegAtQD9ckyM+KAEDOHcv3z1AqyM+FiBL6UnXPC476UsmAUPsAAKQSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AegAtQD9ckyM+KAEDOHcv3z1BSDoEBC/Ri8uLc0wPRAREWAaDIz4UIHvpSgQEKzwuTUqD6UsmAUPsAAf76VPpUFPQAyVYUyPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMVzIugAAAKAAAABAAAIM8WEszMEszJeFYRVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1CCGOiZCkYAyAH6AkAVgQELHgP89EERIYIY6JkKRgCgiHDIy1/JbW1tAsj6VPpU+lTJbW1tK8j6UhP6VPpU9ADJVhLI+lJWEAH6Ui/PFBLMzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMUzIugAAAKAAAABAAAIM8WEszMzMl4LPgqbVYXVhJWF8iJzxYaQB8gAAgAAAABAKrLPxLLCfpSF/pSzBX0AAERGAHMycjPiYgBUyRWGsjPg8sEz4WgzMz5FoT3sBESgAtWGtckVxkBERgBzgEREAHL94EVDc8LeRLMHswBERQBzMmAUPsAAO7PCzTJA8j0ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXhRIsjPg8sEz4WgzMz5FoT3sBSAC1AF1yTIz4oAQM4Ty/fPUCPHBZVsIfLivuAw0PpIMfpIMdQx1DHU0dD6SPpQMfpQMfQEMdHHBfLgSgBHv9gXaiaH0AahjqGOumaH0kamoY66ZofSR9KBj9KBj6AhjogMAgFqJCUAD7KOe1E0NdMgAFWzOntRND6ANMf1NMH0wHSAPoA+gD6ANIA0wPTE9MH0gDSANMJ0wnU1NTRgA/5XEFcQVxBXIviSK8cF8uBJDNM/+gD6SPpQ9AH6ACD0BAFukTCR0eIj+kQw8tFN+Jf4k3D4OiNyceME+DkgboEYtyLjBCFugR0TWAPjBFAjqCWgc4EDLHD4PKABcPg2oAFw+Dagc4EEAoIQCWYBgHD4N6C88rBwViLCZOMPU1CgKSorA9DXLCAAAABMj1fXLCAAAAAMjrjXLCAAAAAUjhgwPz8/VyH4klYgxwX4ki3HBbHy4uQREbPjDgERIAEREREfEREBER4BAhERAhA7AuMNDREgDREfAREeAQIREQIQzRA8GxPjDREbER4RGy4vMAP8VxBXEFcQVyIM0z/6ANMJ0gD6SPpQ+gAx+JIj8AEkVhe6kTTjDhEkJKAC4wCCCA9CQMjPkc2LQnImzws/UAX6AlIQ+lITzsnIz4UIUvD6UlAE+gJxzwtqE8zJc/sAViFuswIRIgHjBPiX+CdvEKL4L6BzgQQCghAJZgGAcPg3Q0RFAIYwVyFwghgXhBGyAIIImJaAyIvHvdl94AAAAAAAAAAIzxYi+gJWEgH6UlJQ+lTJyM+FCFLA+lJY+gJxzwtqzMmAEfsAAAwRIqQBESIC/lYmu/KvJaABESUBofgnbxD4l6H4L6BzgQQCghAJZgGAcPg3tgly+wLtRNDUMdQx10zQ+kgx+kjU1DHXTND6SPpQMfpQMfQEMdGIcMjLX8ltbW0CyPpU+lT6VMltbW0GyPpSEvpU+lQU9ADJKcj6Uhb6UiTPFBPMFMzJbW1tbchALAH89ABwzws0yQPI9AAS9AD0AMzJccjLIxXMi6AAAAoAAAAEAAAgzxYSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AVgAtQBtckyM+KAEDOFMv3z1BWFVYQyM+QXjUUZhjLP1AG+gIVywnPgRX6UvpUUAP6AgERHgHOycjPhYgBER4BLQAi+lJxzwtuAREdAczJgQCQ+wAB/NcsIAAAACyOa1cQVxBXEFciDPpIMPiSAfABVhny0sQREbNWHo5N+JKL9hdXRob3JpdHlGcmVlemWMiLwXjUUZAAAAAAAAAACM8WViH6AlYSzwsJz4FSwPpSUsD6VM+EIM7JyM+FiBL6UnHPC27MyYBQ+wDe4w4LESALEL0QvDEC/DE/Pz9XH1cfVx8P8tLTCNM/0wn6SPpI1PQE10z4ku1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMkryPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyEA9AvxXEFcQVxBXIviSI8cF8uK8DNM/+gD6SDAhViK58uLFESEhoe1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWJ8j6Uhb6UiTPFBPMFMzJbW1tbcj0AHBAQQHy1ywgAAAANI4RVxBXEFcQVxxXIQv6SDHXCwGO1dcsIAAAAISORVcQVxBXEFciDPpIMPiSAfAB+JKCEAX14QBt+CrIz5CUI1mrVhTPCwlS4PpSEvQA9ADJyM+FCBP6UgH6AnHPC2rMyXP7AOMOCxEgERriERoRIAsRETID9tcsIShGs1SPcNcsIAAAAESO49csIsr4PeSYXw9fD18I8jHg1ywmm5CsZI49MD8/P1chJJFwl/iSI8cFwwDijig0Oj9XFlcbfxEaghA7msoAoH/4I/go+CgRHwQRHgQDERkDBBERBESw3uMODREgDRETEM0QvOMNERPjDTM0NQLe1ywjmxaE5I7c1ywgiIiIjI4wVxBXEFcQVyIM+kj6ADD4kljwAcjPhYhSQPpSghARERERzwuOUrD6UgH6AsmAUPsAjqDXLCAAAAKMnjA/Pz9XIfiSKscF8uK84w4NESANEM0QvOLjDQsRIAsQvRC8NjcAdFcQVxBXEFciDNIA0wP6SDD4kgHwAQGVAREUAaCVAREUAaHiU5jHBY4QVxlWGIIID0JAvH9w4wQRGd8BQlcQVxBXEFciDNIA0wn6SPQE9AX4kiPwAVYUJLmSXwXjDTwD/NcsIAAAApSO79csIAAAAKSOOzA/Pz9XIfiSKscF8uK8+JLIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAjqDXLCAAAADEMZ8/Pz8RIccA8rELESALEL3jDQ0RIA0QveINESANEM0QvOMNCxEgCzg5OgB0VxBXEFcQVyIM0z/6APpIgggPQkDIz5HNi0JyFcs/UAP6AvpSzsnIz4UIUsD6Ulj6AnHPC2rMyXP7AAH+VyT4l4IQO5rKALry4r/4kshWI/oCViLPCx9WIc8UViDPCwdWH88LAVYezwoAVh36AlYc+gJWG/oCVhrPCgBWGc8LA1YYzwsTVhfPCwdWFs8KAFYVzwoAVhTPCwlWE88LCQEREgHMAREQAcwezMnIz4UIAREQAfpSgBnPC44fzDsAKFcQVxBXEFciDNNAMfpIMPiSAfABAAgQvRC8AArJgEL7AADMVxQiVhT7BFYU0O0e7VMh8QiuU1WBAQv0gm+lMpEBjkCCEAX14QAhyM+QlCNZqinPCgAozwsJUnD6UlJg9ABWGQH0AMnIz4UIEvpSWPoCcc8LaszJc/sAIYEBC/R0b6Uy6FtXFF8EAv70ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXgoVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBfLivH+CEDuaygAplBAnbDLjDviSyM+QAAAAEhfLP1LA+lIU+lIUzMnIz4UIVhMB+lJxzwtuPj8AXDlXEFcf+CP4klYgJ1YVvI4SVxQj+wQD0O0e7VMB8QiuBBERlBAnbDLiER4EUOYADMzJgFD7AAAAAf7PCzTJA8j0ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXhRIsjPg8sEz4WgzMz5FoT3sAERIwGACwERJNckyM+KAEDOAREiAcv3z1BtiwhWFC/Iz5BeNRRmF8s/UAX6AhTLCc+BFPpSE/pUz4QgzsnIz4WIEvpSQgAScc8LbszJcvsAAMYEVha5jjX4koIQBfXhAG34KsjPkJQjWatWGs8LCVYUAfpSEvQA9ADJyM+FCBP6UgH6AnHPC2rMyXP7AI4l+JKCEAX14QDIz4UIEvpSAfoCgBDPC4pWEAH6UlYWzwsJyXP7AOIArIIQBfXhAIsCINcsBTHyiW2CAYagyM+QXjUUZinPCz8o+gLPiADAE/pS+lQB+gIkzxbJVHYhyM+FCFLA+lIB+gKCEGQrfQfPC4oSyz/6Ulj6AszJc/sAADi2CXL7AsjPhQj6UoIQ1TJ2288Ljss/yYEAgvsA',
  ),
),
  Er(nn, 'Errors', {
    'Errors.BalanceError': 47,
    'Errors.NotEnoughGas': 48,
    'Errors.InvalidMessage': 49,
    'Errors.NotOwner': 73,
    'Errors.NotValidWallet': 74,
    'Errors.MaxConnections': 250,
    'Errors.WrongWorkchain': 333,
    'Errors.IncorrectSender': 700,
    'Errors.AccountInactive': 702,
    'Errors.InsufficientGasSent': 703,
    'Errors.IncorrectReceiver': 708,
    'Errors.InsufficientBalance': 709,
    'Errors.AlreadyReported': 710,
    'Errors.AlreadyInvited': 723,
    'Errors.NoVotesAvailable': 731,
    'Errors.NotVotedYet': 732,
    'Errors.WaitMore': 735,
    'Errors.InviteFirst': 740,
  }));
let wo = nn;
const Rh = new N0(),
  to = {};
function sc(n) {
  return n === 'mainnet'
    ? void 0
    : 'af42d30b2a7fe13ff211db7b4762f5af6a9e2e6fcccadd500e858e537c9c2980';
}
function D0(n) {
  const i = sc(n);
  return i ? { 'X-API-Key': i } : void 0;
}
function ic(n) {
  if (!to[n]) {
    const i = 'https://testnet.toncenter.com/api/v2/jsonRPC';
    to[n] = new N1.TonClient({ endpoint: i, apiKey: sc(n) });
  }
  return to[n];
}
async function rs(n) {
  if (localStorage.getItem('fiWalletAddress_' + Xs + n.toString()) != null)
    return ee.Address.parse(
      localStorage.getItem('fiWalletAddress_' + Xs + n.toString()),
    );
  {
    const i = ic('testnet'),
      l = ee.Address.parse(Xs),
      g = (
        await i.runMethod(l, 'get_wallet_address', [
          { type: 'slice', cell: ee.beginCell().storeAddress(n).endCell() },
        ])
      ).stack.readAddress();
    return (
      localStorage.setItem(
        'fiWalletAddress_' + Xs + n.toString(),
        g.toString(),
      ),
      g
    );
  }
}
const O0 = {
  mainnet: 'https://toncenter.com/api/v3',
  testnet: 'https://testnet.toncenter.com/api/v3',
};
async function P0(n, i, l = 4) {
  let u = 1e3;
  for (let g = 0; g <= l; g++) {
    const h = await fetch(n, i);
    if (h.status === 429 && g < l) {
      (await new Promise((w) => setTimeout(w, u)), (u *= 2));
      continue;
    }
    return h;
  }
  throw new Error('Max retries exceeded');
}
async function B0(n, i) {
  var R, T, _, D, z;
  const l = O0[n],
    u = await P0(
      `${l}/jetton/masters?address=${encodeURIComponent(i)}&limit=1&offset=0`,
      { headers: D0(n) },
    );
  if (!u.ok) throw new Error(`Toncenter API error: ${u.status}`);
  const g = await u.json(),
    h = g.jetton_masters;
  if (!h || h.length === 0) throw new Error('Jetton not found');
  const w = h[0],
    y = w.address,
    I =
      (_ =
        (T = (R = g.metadata) == null ? void 0 : R[y]) == null
          ? void 0
          : T.token_info) == null
        ? void 0
        : _[0];
  let p = null;
  try {
    w.admin_address && (p = ee.Address.parse(w.admin_address));
  } catch {}
  return {
    totalSupply: BigInt(w.total_supply),
    mintable: w.mintable,
    adminAddress: p,
    metadata: {
      name: (I == null ? void 0 : I.name) || void 0,
      symbol: (I == null ? void 0 : I.symbol) || void 0,
      decimals:
        ((D = I == null ? void 0 : I.extra) == null ? void 0 : D.decimals) ||
        ((z = w.jetton_content) == null ? void 0 : z.decimals) ||
        void 0,
      description: (I == null ? void 0 : I.description) || void 0,
      image: (I == null ? void 0 : I.image) || void 0,
    },
  };
}
async function _0(n) {
  const i = await rs(n);
  return ic('testnet').open(wo.fromAddress(i)).getWalletDataAll();
}
function et(n, i) {
  let l = ee.beginCell();
  return (i(n, l), l.endCell());
}
function St(n, i, l) {
  let u = n.loadUint(32);
  if (u !== i)
    throw new Error(
      `Incorrect prefix for '${l}': expected 0x${i.toString(16).padStart(8, '0')}, got 0x${u.toString(16).padStart(8, '0')}`,
    );
}
function Va(n, i) {
  return i % 4
    ? `0b${n.toString(2).padStart(i, '0')}`
    : `0x${n.toString(16).padStart(i / 4, '0')}`;
}
function ko(n, i, l, u) {
  let g = n.loadUint(l);
  if (g !== i)
    throw new Error(
      `Incorrect prefix for '${u}': expected ${Va(i, l)}, got ${Va(g, l)}`,
    );
}
function Wa(n, i, l) {
  return n.remainingBits >= l && n.preloadUint(l) === i;
}
function L0(n) {
  throw new Error(`Incorrect prefix for '${n}': none of variants matched`);
}
function Fo(n, i, l) {
  let u = ee.beginCell();
  (l(n.ref, u), i.storeRef(u.endCell()));
}
function Uo(n, i) {
  let l = n.loadRef().beginParse();
  return { ref: i(l) };
}
function oc(n, i) {
  i.storeSlice(n);
}
function ac(n) {
  let i = n.clone();
  for (n.loadBits(n.remainingBits); n.remainingRefs;) n.loadRef();
  return i;
}
function Xr(n, i, l) {
  n === null ? i.storeUint(0, 1) : (i.storeUint(1, 1), l(n, i));
}
function k0(n, i) {
  return {
    serialize(l, u) {
      i(l, u);
    },
    parse(l) {
      const u = n(l);
      return (l.endParse(), u);
    },
  };
}
class Gs {
  constructor(i) {
    this.tuple = i;
  }
  static fromGetMethod(i, l) {
    let u = [];
    for (; l.stack.remaining;) u.push(l.stack.pop());
    if (u.length !== i)
      throw new Error(`expected ${i} stack width, got ${u.length}`);
    return new Gs(u);
  }
  popExpecting(i) {
    const l = this.tuple.shift();
    if ((l == null ? void 0 : l.type) === i) return l;
    throw new Error(`not '${i}' on a stack`);
  }
  popCellLike() {
    const i = this.tuple.shift();
    if (i && (i.type === 'cell' || i.type === 'slice' || i.type === 'builder'))
      return i.cell;
    throw new Error('not cell/slice on a stack');
  }
  readBigInt() {
    return this.popExpecting('int').value;
  }
  readBoolean() {
    return this.popExpecting('int').value !== 0n;
  }
  readCell() {
    return this.popCellLike();
  }
  readSlice() {
    return this.popCellLike().beginParse();
  }
  readNullable(i) {
    return this.tuple[0].type === 'null' ? (this.tuple.shift(), null) : i(this);
  }
  readWideNullable(i, l) {
    const u = this.tuple[i - 1];
    if ((u == null ? void 0 : u.type) !== 'int')
      throw new Error("not 'int' on a stack");
    if (u.value === 0n) return ((this.tuple = this.tuple.slice(i)), null);
    const g = l(this);
    return (this.tuple.shift(), g);
  }
  readCellRef(i) {
    return { ref: i(this.readCell().beginParse()) };
  }
}
const Js = {
    PREFIX: 0,
    create(n) {
      return { $: 'PayloadInline', ...n };
    },
    fromSlice(n) {
      return (
        ko(n, 0, 1, 'PayloadInline'),
        { $: 'PayloadInline', value: ac(n) }
      );
    },
    store(n, i) {
      (i.storeUint(0, 1), oc(n.value, i));
    },
    toCell(n) {
      return et(n, Js.store);
    },
  },
  bi = {
    PREFIX: 1,
    create(n) {
      return { $: 'PayloadInRef', ...n };
    },
    fromSlice(n) {
      return (
        ko(n, 1, 1, 'PayloadInRef'),
        { $: 'PayloadInRef', value: Uo(n, ac) }
      );
    },
    store(n, i) {
      (i.storeUint(1, 1), Fo(n.value, i, oc));
    },
    toCell(n) {
      return et(n, bi.store);
    },
  },
  Ii = {
    PREFIX: 395134233,
    create(n) {
      return { $: 'InternalTransferStep', transferredAsCredit: !1, ...n };
    },
    fromSlice(n) {
      return (
        St(n, 395134233, 'InternalTransferStep'),
        {
          $: 'InternalTransferStep',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          version: n.loadUintBig(10),
          transferredAsCredit: n.loadBoolean(),
          transferInitiator: n.loadAddress(),
          sendExcessesTo: n.loadMaybeAddress(),
          forwardTonAmount: n.loadCoins(),
          forwardPayload: Wa(n, 0, 1)
            ? Js.fromSlice(n)
            : Wa(n, 1, 1)
              ? bi.fromSlice(n)
              : L0('InternalTransferStep.forwardPayload'),
        }
      );
    },
    store(n, i) {
      switch (
        (i.storeUint(395134233, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeUint(n.version, 10),
        i.storeBit(n.transferredAsCredit),
        i.storeAddress(n.transferInitiator),
        i.storeAddress(n.sendExcessesTo),
        i.storeCoins(n.forwardTonAmount),
        n.forwardPayload.$)
      ) {
        case 'PayloadInline':
          Js.store(n.forwardPayload, i);
          break;
        case 'PayloadInRef':
          bi.store(n.forwardPayload, i);
          break;
      }
    },
    toCell(n) {
      return et(n, Ii.store);
    },
  },
  _s = {
    PREFIX: 2078119902,
    create(n) {
      return { $: 'NotifyMinter', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 2078119902, 'NotifyMinter'),
        {
          $: 'NotifyMinter',
          queryId: n.loadUintBig(64),
          jettonAmount: n.loadCoins(),
          burnInitiator: n.loadAddress(),
          sendExcessesTo: n.loadMaybeAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(2078119902, 32),
        i.storeUint(n.queryId, 64),
        i.storeCoins(n.jettonAmount),
        i.storeAddress(n.burnInitiator),
        i.storeAddress(n.sendExcessesTo));
    },
    toCell(n) {
      return et(n, _s.store);
    },
  },
  Ls = {
    PREFIX: 745978227,
    create(n) {
      return { $: 'RequestWalletAddress', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 745978227, 'RequestWalletAddress'),
        {
          $: 'RequestWalletAddress',
          queryId: n.loadUintBig(64),
          owner: n.loadAddress(),
          includeOwnerAddress: n.loadBoolean(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(745978227, 32),
        i.storeUint(n.queryId, 64),
        i.storeAddress(n.owner),
        i.storeBit(n.includeOwnerAddress));
    },
    toCell(n) {
      return et(n, Ls.store);
    },
  },
  cn = {
    PREFIX: 1680571655,
    create(n) {
      return { $: 'MintNewJettons', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 1680571655, 'MintNewJettons'),
        {
          $: 'MintNewJettons',
          queryId: n.loadUintBig(64),
          mintRecipient: n.loadAddress(),
          tonAmount: n.loadCoins(),
          internalTransferMsg: Uo(n, Ii.fromSlice),
        }
      );
    },
    store(n, i) {
      (i.storeUint(1680571655, 32),
        i.storeUint(n.queryId, 64),
        i.storeAddress(n.mintRecipient),
        i.storeCoins(n.tonAmount),
        Fo(n.internalTransferMsg, i, Ii.store));
    },
    toCell(n) {
      return et(n, cn.store);
    },
  },
  un = {
    PREFIX: 1694626644,
    create(n) {
      return { $: 'ChangeMinterAdmin', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 1694626644, 'ChangeMinterAdmin'),
        {
          $: 'ChangeMinterAdmin',
          queryId: n.loadUintBig(64),
          newAdminAddress: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(1694626644, 32),
        i.storeUint(n.queryId, 64),
        i.storeAddress(n.newAdminAddress));
    },
    toCell(n) {
      return et(n, un.store);
    },
  },
  dn = {
    PREFIX: 621336170,
    create(n) {
      return {
        $: 'Upgrade',
        walletUpgrade: !0,
        newData: null,
        newCode: null,
        ...n,
      };
    },
    fromSlice(n) {
      return (
        St(n, 621336170, 'Upgrade'),
        {
          $: 'Upgrade',
          walletUpgrade: n.loadBoolean(),
          walletVersion: n.loadUintBig(10),
          sender: n.loadAddress(),
          newData: n.loadBoolean() ? n.loadRef() : null,
          newCode: n.loadBoolean() ? n.loadRef() : null,
        }
      );
    },
    store(n, i) {
      (i.storeUint(621336170, 32),
        i.storeBit(n.walletUpgrade),
        i.storeUint(n.walletVersion, 10),
        i.storeAddress(n.sender),
        Xr(n.newData, i, (l, u) => u.storeRef(l)),
        Xr(n.newCode, i, (l, u) => u.storeRef(l)));
    },
    toCell(n) {
      return et(n, dn.store);
    },
  },
  fn = {
    PREFIX: 3414567170,
    create(n) {
      return { $: 'ChangeMinterMetadata', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 3414567170, 'ChangeMinterMetadata'),
        {
          $: 'ChangeMinterMetadata',
          queryId: n.loadUintBig(64),
          newMetadata: n.loadRef(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(3414567170, 32),
        i.storeUint(n.queryId, 64),
        i.storeRef(n.newMetadata));
    },
    toCell(n) {
      return et(n, fn.store);
    },
  },
  hn = {
    PREFIX: 3547469196,
    create() {
      return { $: 'TopUpTons' };
    },
    fromSlice(n) {
      return (St(n, 3547469196, 'TopUpTons'), { $: 'TopUpTons' });
    },
    store(n, i) {
      i.storeUint(3547469196, 32);
    },
    toCell(n) {
      return et(n, hn.store);
    },
  },
  ks = {
    PREFIX: 4,
    create(n) {
      return { $: 'InformMinterInviteInternal', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 4, 'InformMinterInviteInternal'),
        {
          $: 'InformMinterInviteInternal',
          queryId: n.loadUintBig(64),
          sender: n.loadAddress(),
          invitor: n.loadAddress(),
          id: n.loadStringRefTail(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(4, 32),
        i.storeUint(n.queryId, 64),
        i.storeAddress(n.sender),
        i.storeAddress(n.invitor),
        i.storeStringRefTail(n.id));
    },
    toCell(n) {
      return et(n, ks.store);
    },
  },
  Fs = {
    PREFIX: 16,
    create(n) {
      return { $: 'RequestUpgradeCode', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 16, 'RequestUpgradeCode'),
        {
          $: 'RequestUpgradeCode',
          sender: n.loadAddress(),
          version: n.loadUintBig(10),
        }
      );
    },
    store(n, i) {
      (i.storeUint(16, 32),
        i.storeAddress(n.sender),
        i.storeUint(n.version, 10));
    },
    toCell(n) {
      return et(n, Fs.store);
    },
  },
  gn = {
    PREFIX: 17,
    create() {
      return { $: 'ApproveUpgrade' };
    },
    fromSlice(n) {
      return (St(n, 17, 'ApproveUpgrade'), { $: 'ApproveUpgrade' });
    },
    store(n, i) {
      i.storeUint(17, 32);
    },
    toCell(n) {
      return et(n, gn.store);
    },
  },
  xn = {
    PREFIX: 18,
    create() {
      return { $: 'RejectUpgrade' };
    },
    fromSlice(n) {
      return (St(n, 18, 'RejectUpgrade'), { $: 'RejectUpgrade' });
    },
    store(n, i) {
      i.storeUint(18, 32);
    },
    toCell(n) {
      return et(n, xn.store);
    },
  },
  Us = {
    PREFIX: 19,
    create(n) {
      return { $: 'HotUpgrade', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 19, 'HotUpgrade'),
        {
          $: 'HotUpgrade',
          additionalData: n.loadBoolean() ? n.loadRef() : null,
          code: n.loadRef(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(19, 32),
        Xr(n.additionalData, i, (l, u) => u.storeRef(l)),
        i.storeRef(n.code));
    },
    toCell(n) {
      return et(n, Us.store);
    },
  },
  js = {
    PREFIX: 20,
    create() {
      return { $: 'Destroy' };
    },
    fromSlice(n) {
      return (St(n, 20, 'Destroy'), { $: 'Destroy' });
    },
    store(n, i) {
      i.storeUint(20, 32);
    },
    toCell(n) {
      return et(n, js.store);
    },
  },
  Co = {
    create(n) {
      return { $: 'CurrentRequest', ...n };
    },
    fromSlice(n) {
      return {
        $: 'CurrentRequest',
        newUpgrade: dn.fromSlice(n),
        timestamp: n.loadUintBig(32),
      };
    },
    store(n, i) {
      (dn.store(n.newUpgrade, i), i.storeUint(n.timestamp, 32));
    },
    toCell(n) {
      return et(n, Co.store);
    },
  },
  zs = {
    PREFIX: 286331153,
    create(n) {
      return { $: 'EnterLottery', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 286331153, 'EnterLottery'),
        { $: 'EnterLottery', sender: n.loadAddress(), amount: n.loadCoins() }
      );
    },
    store(n, i) {
      (i.storeUint(286331153, 32),
        i.storeAddress(n.sender),
        i.storeCoins(n.amount));
    },
    toCell(n) {
      return et(n, zs.store);
    },
  },
  Vs = {
    PREFIX: 572662306,
    create(n) {
      return { $: 'LotteryWin', ...n };
    },
    fromSlice(n) {
      return (
        St(n, 572662306, 'LotteryWin'),
        {
          $: 'LotteryWin',
          entryAmount: n.loadCoins(),
          amt: n.loadCoins(),
          winner: n.loadAddress(),
        }
      );
    },
    store(n, i) {
      (i.storeUint(572662306, 32),
        i.storeCoins(n.entryAmount),
        i.storeCoins(n.amt),
        i.storeAddress(n.winner));
    },
    toCell(n) {
      return et(n, Vs.store);
    },
  },
  yo = {
    fromSlice(n) {
      return {
        $: 'FiCodes',
        totalAccounts: n.loadUintBig(33),
        lotteryCode: n.loadBoolean() ? n.loadRef() : null,
        latestFiWalletCode: n.loadBoolean() ? n.loadRef() : null,
        c: n.loadBoolean() ? n.loadRef() : null,
        d: n.loadBoolean() ? n.loadRef() : null,
      };
    },
    store(n, i) {
      (i.storeUint(n.totalAccounts, 33),
        Xr(n.lotteryCode, i, (l, u) => u.storeRef(l)),
        Xr(n.latestFiWalletCode, i, (l, u) => u.storeRef(l)),
        Xr(n.c, i, (l, u) => u.storeRef(l)),
        Xr(n.d, i, (l, u) => u.storeRef(l)));
    },
  },
  Eo = {
    create(n) {
      return {
        $: 'FiStore',
        totalSupply: 0n,
        walletVersion: 0n,
        nextAdminAddress: null,
        currentRequest: null,
        ...n,
      };
    },
    fromSlice(n) {
      return {
        $: 'FiStore',
        totalSupply: n.loadCoins(),
        walletVersion: n.loadUintBig(10),
        adminAddress: n.loadAddress(),
        nextAdminAddress: n.loadMaybeAddress(),
        currentRequest: n.loadBoolean() ? Co.fromSlice(n) : null,
        metadata: n.loadRef(),
        others: Uo(n, yo.fromSlice),
      };
    },
    store(n, i) {
      (i.storeCoins(n.totalSupply),
        i.storeUint(n.walletVersion, 10),
        i.storeAddress(n.adminAddress),
        i.storeAddress(n.nextAdminAddress),
        Xr(n.currentRequest, i, Co.store),
        i.storeRef(n.metadata),
        Fo(n.others, i, yo.store));
    },
    toCell(n) {
      return et(n, Eo.store);
    },
  },
  F0 = {
    fromSlice(n) {
      return (
        ko(n, 0, 8, 'OnchainMetadataReply'),
        {
          $: 'OnchainMetadataReply',
          contentDict: ee.Dictionary.load(
            ee.Dictionary.Keys.BigUint(256),
            k0(Ha.fromSlice, Ha.store),
            n,
          ),
        }
      );
    },
  },
  Ha = {
    fromSlice(n) {
      return n.loadStringRefTail();
    },
    store(n, i) {
      i.storeStringRefTail(n);
    },
  };
function U0(n, i, l) {
  var h;
  const u = ee
    .beginCell()
    .store(
      ee.storeStateInit({
        code: n,
        data: i,
        splitDepth: (h = l.toShard) == null ? void 0 : h.fixedPrefixLength,
        special: null,
        libraries: null,
      }),
    )
    .endCell();
  let g = u.hash();
  if (l.toShard) {
    const w = l.toShard.fixedPrefixLength;
    g = ee
      .beginCell()
      .storeBits(new ee.BitString(l.toShard.closeTo.hash, 0, w))
      .storeBits(new ee.BitString(u.hash(), w, 256 - w))
      .endCell()
      .beginParse()
      .loadBuffer(32);
  }
  return new ee.Address(l.workchain ?? 0, g);
}
const sn = class sn {
  constructor(i, l) {
    Er(this, 'address');
    Er(this, 'init');
    ((this.address = i), (this.init = l));
  }
  static fromAddress(i) {
    return new sn(i);
  }
  static fromStorage(i, l) {
    const u = {
        code: (l == null ? void 0 : l.overrideContractCode) ?? sn.CodeCell,
        data: Eo.toCell(Eo.create(i)),
      },
      g = U0(u.code, u.data, l ?? {});
    return new sn(g, u);
  }
  static createCellOfMintNewJettons(i) {
    return cn.toCell(cn.create(i));
  }
  static createCellOfNotifyMinter(i) {
    return _s.toCell(_s.create(i));
  }
  static createCellOfRequestWalletAddress(i) {
    return Ls.toCell(Ls.create(i));
  }
  static createCellOfChangeMinterAdmin(i) {
    return un.toCell(un.create(i));
  }
  static createCellOfChangeMinterMetadata(i) {
    return fn.toCell(fn.create(i));
  }
  static createCellOfTopUpTons(i) {
    return hn.toCell(hn.create());
  }
  static createCellOfInformMinterInviteInternal(i) {
    return ks.toCell(ks.create(i));
  }
  static createCellOfRequestUpgradeCode(i) {
    return Fs.toCell(Fs.create(i));
  }
  static createCellOfEnterLottery(i) {
    return zs.toCell(zs.create(i));
  }
  static createCellOfLotteryWin(i) {
    return Vs.toCell(Vs.create(i));
  }
  static createCellOfHotUpgrade(i) {
    return Us.toCell(Us.create(i));
  }
  static createCellOfUpgrade(i) {
    return dn.toCell(dn.create(i));
  }
  static createCellOfRejectUpgrade(i) {
    return xn.toCell(xn.create());
  }
  static createCellOfApproveUpgrade(i) {
    return gn.toCell(gn.create());
  }
  static createCellOfDestroy(i) {
    return js.toCell(js.create());
  }
  async sendDeploy(i, l, u, g) {
    return i.internal(l, { value: u, body: ee.Cell.EMPTY, ...g });
  }
  async sendMintNewJettons(i, l, u, g, h) {
    return i.internal(l, { value: u, body: cn.toCell(cn.create(g)), ...h });
  }
  async sendNotifyMinter(i, l, u, g, h) {
    return i.internal(l, { value: u, body: _s.toCell(_s.create(g)), ...h });
  }
  async sendRequestWalletAddress(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Ls.toCell(Ls.create(g)), ...h });
  }
  async sendChangeMinterAdmin(i, l, u, g, h) {
    return i.internal(l, { value: u, body: un.toCell(un.create(g)), ...h });
  }
  async sendChangeMinterMetadata(i, l, u, g, h) {
    return i.internal(l, { value: u, body: fn.toCell(fn.create(g)), ...h });
  }
  async sendTopUpTons(i, l, u, g, h) {
    return i.internal(l, { value: u, body: hn.toCell(hn.create()), ...h });
  }
  async sendInformMinterInviteInternal(i, l, u, g, h) {
    return i.internal(l, { value: u, body: ks.toCell(ks.create(g)), ...h });
  }
  async sendRequestUpgradeCode(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Fs.toCell(Fs.create(g)), ...h });
  }
  async sendEnterLottery(i, l, u, g, h) {
    return i.internal(l, { value: u, body: zs.toCell(zs.create(g)), ...h });
  }
  async sendLotteryWin(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Vs.toCell(Vs.create(g)), ...h });
  }
  async sendHotUpgrade(i, l, u, g, h) {
    return i.internal(l, { value: u, body: Us.toCell(Us.create(g)), ...h });
  }
  async sendUpgrade(i, l, u, g, h) {
    return i.internal(l, { value: u, body: dn.toCell(dn.create(g)), ...h });
  }
  async sendRejectUpgrade(i, l, u, g, h) {
    return i.internal(l, { value: u, body: xn.toCell(xn.create()), ...h });
  }
  async sendApproveUpgrade(i, l, u, g, h) {
    return i.internal(l, { value: u, body: gn.toCell(gn.create()), ...h });
  }
  async sendDestroy(i, l, u, g, h) {
    return i.internal(l, { value: u, body: js.toCell(js.create()), ...h });
  }
  async getJettonData(i) {
    const l = Gs.fromGetMethod(5, await i.get('get_jetton_data', []));
    return {
      $: 'JettonDataReply',
      totalSupply: l.readBigInt(),
      mintable: l.readBoolean(),
      adminAddress: l.readNullable((u) => u.readSlice().loadAddress()),
      jettonContent: l.readCellRef(F0.fromSlice),
      jettonWalletCode: l.readCell(),
    };
  }
  async getJettonDataAll(i) {
    const l = Gs.fromGetMethod(13, await i.get('get_jetton_data_all', []));
    return {
      $: 'FiStore',
      totalSupply: l.readBigInt(),
      walletVersion: l.readBigInt(),
      adminAddress: l.readSlice().loadAddress(),
      nextAdminAddress: l.readNullable((u) => u.readSlice().loadAddress()),
      currentRequest: l.readWideNullable(7, (u) => ({
        $: 'CurrentRequest',
        newUpgrade: {
          $: 'Upgrade',
          walletUpgrade: u.readBoolean(),
          walletVersion: u.readBigInt(),
          sender: u.readSlice().loadAddress(),
          newData: u.readNullable((g) => g.readCell()),
          newCode: u.readNullable((g) => g.readCell()),
        },
        timestamp: u.readBigInt(),
      })),
      metadata: l.readCell(),
      others: l.readCellRef(yo.fromSlice),
    };
  }
  async getWalletAddress(i, l) {
    return Gs.fromGetMethod(
      1,
      await i.get('get_wallet_address', [
        { type: 'slice', cell: et(l, (g, h) => h.storeAddress(g)) },
      ]),
    )
      .readSlice()
      .loadAddress();
  }
};
(Er(
  sn,
  'CodeCell',
  ee.Cell.fromBase64(
    'te6ccgECaQEAHqIAART/APSkE/S88sgLAQIBYgIDAgLEBAUCASAdHgT319tF2/fxI+SAQdqJofQBphP0kfShpgADHDGuWEJQjWap5X+kAaYT9JHoCegJpj8CAQs22gLa2rDa2tqwBuHEA6mumaGmQegJ6AgiIa5YQAAAAEkeFa5YR73ZfenGHjvGGhuRlkA76AA96AA5nZOQoBf0BDOWEi/0pCv0qQYHCAkCAccTFAP+VxERENM/+gD6SPpQMPiS+CiIiHDIy1/JbW1tAsj6VPpU+lTJbW1tB8j6UhL6VPpUFfQAySfI+lJWFgH6UiTPFBXMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjE8yLoAAACgAAAAQAACDPFhTME8wSzMl4USLIz4PLBCFjFQP41ywhY7XLnI9x1ywjIVvoPJdfD18D8sLE4NcsIygPmqSO1NcsJlwxSBSeNFcQ+JIsxwXy4EkC10yOuNcsIShGs1SOH2xmO/iSJ8cF8uK8BPLS3wnSANMJ+kj0BPQF+COBAIXjDhCfEGkQWBBHEDZFE1BC4kAfC+MNCw/jDQoLDAT8VxERENM/+kj6SDD4kvgoiIhwyMtfyW1tbQLI+lT6VPpUyW1tbQfI+lIS+lT6VBX0AMknyPpSVhUB+lIkzxQVzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxPMi6AAAAoAAAAEAAAgzxYUzBPMEszJeFEiyM+DywSJIWMiHABQCI4YB8+SShGs1RLKAMsJFfpSFPQAE/QAEssflV8GAc+B4hLMzMntVAP21ywgAAAAlI4YMGxVNTr4kibHBfLivALy4t9tbW1tbW1wj9XXLCAAAACMjrYwODg++JIqxwXy4rwB8uLfAaT4I7ny4t8FwP+OECBukTCS+wTiIG6RMJLtVOLjDW1tbW1tbXCPD9csIAAAAITjD0n4RnVAQ+IQjxB54hB4DQ4PACRXEfiSUA3HBfLgSQ/TPzH6SDABdFcRERDTP/pI1woAlSDI+lLJkW3ibSL6RDCRMuMO+JLIz4UI+lKCENFzVADPC44Tyz/6VPQAyYBQ+wAaA/4yBqQh+JL4KIiIcMjLX8ltbW0CyPpU+lT6VMltbW0HyPpSEvpU+lQV9ADJJcj6UlLQ+lIkzxQVzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxPMi6AAAAoAAAAEAAAgzxYUzBPMEszJeFEiyM+DywTPhaDMzPkWhPewIWMWA/5XEREQ+kjXCwn4kvgoiIhwyMtfyW1tbQLI+lT6VPpUyW1tbQfI+lIS+lT6VBX0AMknyPpSVhQB+lIkzxQVzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxPMi6AAAAoAAAAEAAAgzxYUzBPMEszJeFEiyM+DywTPhaDMIWMXA8bXLCabkKxkjoowVxD4kizHBeMAj03XLCCIiIiMjsLXLCEREREUjjdXEREQ+gAw+JL4KG0ByPpSUAP6AhL0AHDPCkNwzwv/ySLIz4TQzMz5FsjPigBAy//PUMcF8uK84w7jDeIQERID/A2CEDuaygCg+JL4kvgoiIhwyMtfyW1tbQLI+lT6VPpUyW1tbQfI+lIS+lT6VBX0AMkmyPpSFvpSI88UFMwUzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMVzIugAAAKAAAABAAAIM8WE8wSzBLMyXjIz4mIAVRyMcjPgyFjGADw1ywgAAAAnI4fPl8MbCIy+JJYxwXy4rz0BNdMIPsE0O0e7VPxCEnbMeDXLCAAAACkMY43VxD4kizHBfLivPiSyM+FCPpSjQaAAAAAAAAAAAAAAAAAAGqZO22AAAAAAAAAAEDPFsmBAKD7AJyEDxERxwABEREB8vTiBPxXEREQ+kj6ADD4kvgoiIhwyMtfyW1tbQLI+lT6VPpUyW1tbQfI+lIS+lT6VBX0AMknyPpSVhQB+lIkzxQVzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxPMi6AAAAoAAAAEAAAgzxYUzBPMEszJeCVUEjLIz4PLBIkhYyIZAPO8kw7UTQ+gDTCfpI+lAx0wABjhjXLCEoRrNU8r/SANMJ+kj0BPQE0x+BAIWbbQFtbVhtbW1YA3DiAdTU0QuCIAoa+zVGAKBtyFj6AhvLCRn6Uhn6VAiOFgfPkkoRrNUVygATywn6UvQA9AASyx+VXwYBz4HizMzJ7VSAAFuuMIAaCJzxbMzPkWhPewFIALUAXXJMjPigBAzhPL989QEscF8uBKIpMREKCTERCi4i9ull8PXwPbMeDIz4UIAREQAfpSghDVMnbbzwuOyz/JgEL7ACIAchKAC1AD1yTIz4oAQM7L989QyM+QlCNZqyPPCwlSgPpSGfQAE/QAycjPhQgY+lJxzwtuF8zJgEL7AACczPkWhPewFIALUAXXJMjPigBAzhPL989QEscF8uBKLbmOK/iSbcjPkJQjWasvzwsJUuD6UvQAVhEB9ADJyM+FCBL6UnHPC27MyYBC+wDeAFbLBM+FoMzM+RaE97AFgAsj1yQyzhPL94EVDM8LeczMz5NNyFYyyYBQ+wANAM7PFszM+RaE97ASgAtQA9ckyM+KAEDOy/fPUMcF8uBK+ChtIgLI+lJY+gL0AHDPCkNwzwv/ySPIz4mIAVMhyM+E0MzM+RbPC//PhBBz+gKBAIzPC2vMzM+QRERERhL6UgH6AsmAUPsAA/ww+CiIiHDIy1/JbW1tAsj6VPpU+lTJbW1tB8j6UhL6VPpUFfQAySbI+lJWFAH6UiTPFBXMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjE8yLoAAACgAAAAQAACDPFhTME8wSzMl4USLIz4PLBM+FoMzM+RaE97ATgAshYxsAIFAE1yTIz4oAQM4Sy/fPUAEAhs8WzMz5FoT3sBSAC1AF1yTIz4oAQM4Ty/fPUBLHBfLgSgOkD4IY6NSlEACgyM+FCBT6UoIQ1TJ2288Ljss/yYBC+wAAd751j2omh9AGmE/SR9KGmAAMcMa5YQlCNZqnlf6QBphP0kegJ6AmmPwIBCzbaAtrasNra2rAG4cQDqamjAICcR8gBPutvPaiaH0AGOmEmP0kGHwUREQ4ZGWv5La2toFkfSp9Kn0qZLa2toPkfSkJfSp9Kgr6AGSTZH0pC30pEeeKCmYKZmS2tra25HoAOGeFmmSB5HoACXoAegBmZLjkZZGK5kXQAAAFAAAAAgAAEGeLCeYJZglmZLwokWRnweWCRMAhYyIjAWOvFvaiaH0AaYSY/SR9KBjpgADHC2uWEJQjWap5X+mFGP0kGPoA+gDpj5jva6Y/xCGYQGMBFP8A9KQT9LzyyAskAAFoADTPFszM+RaE97ASgAtQA9ckyM+KAEDOy/fPUAIBYiUmAgLEJygCASBFRgIB1SkqAAesVxhAAvc+JGO0dMfMe1E0HAB+gDWH9TWCvoA+gD6ANYY0wcg1DHUMddMDNcsIIiIiIyZMDo6ghJUC+QA4w4YoMgB+gIWzhTMEs4B+gIB+gIB+gLOEssHzsntVOAg7UTQ+gDTH9TTB9MB0gD6APoA+gDSANMD0xPTB9IA0gDTCdMJgKywC9TtRND6ADHTHzHUMdMKMfoAMfoAMfoAMdMgMdIA1DHXTO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMkoyPpSFvpSJM8UE8wUzMltbW1tyPQAcIGNEAMbXLCC8aijMmTs7CdM/MfoAMI5N1ywgAAAADI4ZMDoK0PQEMfQEMfQEMdQx0YIfF2b1ugAKpY4mPAvXLCAAAABEkTCOFjoJ1ywgAAAClDGS8j/hgh8XK1rwAAniEJriCQriEJoC/NTU10wi0CLQ+kj6SNTU10zQJtAC0AbTH9Mf1wsfA/pI+lAG9AT0BPQEDfpQ+lD6UDARJNcsIAAAALyOIlcQVxBXEFceVyH4l4IQHc1lALzysPiSKscFk/LCvOEL10zjDg3I+lQc+lQBER4B+lTJER3I+lIa+lQTzskCyMsfGC0uA5rXLCAAAAC0jzdXEVcRVyP4kizHBfLgSQ7TP/oA+kj6UPQB10wi+kQw8tFN+JeCEB3NZQC88rAjghAGBSNAuuMP4w4LESALDBEcDAsNDC8wMQDMyx8Xyx/JA8j6UhL6UswBERcBzBPMyQHI9AABERYB9AABEREB9AABERABzsnIARES+gIBERAByx8ezBzLBxrLARjKAFAG+gJQBPoCWPoCygDLA8sTywfKAMoAywnLCRLMEszMye1UAN4TXwM++CMngggJOoCgIbny4t+CC8JnACigIbycgggJOoBQCaAoucMAkjhw4vLi34IgChr7NUYAghA7msoAVheooBEhViGgyM+R73ZfehLLPwERIfoCUrD6Uh36VMnIz4UIUkD6UnHPC27MyYBQ+wADVDEighAF9eEAuo8WMDI+LYIQBo53gLrjDwsRHgsMERQREuMNCxEeCxESCzIzNANA1ywgvGoozI8P1ywgfFP1LOMPERsRHhEb4w0NESANEM1JSksD/j0RFfLi2/iSLMcF8tLE7UTQ1DHUMddM0PpIMfpI1NQx10zQ+kj6UDH6UDH0BDHRiHDIy1/JbW1tAsj6VPpU+lTJbW1tBsj6UhL6VPpUFPQAyVYRyPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMVzIljOTUDOi2CEAcnDgC6jw4tghANtYWAuuMPDBEUDOMNCxEUNjc4Av4yD9D0AfQB9AHXTNBWFfLivvQB0wAx1wsJwQHy4sb4IweBOECgJ7kogggJOoCgKLmw+JItxwWx8uLfVhXBC/Lg+hEVpO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lISY0AAns8WEszMEszJeFEiyM+DywTPhaDMzPkWhPewHYALUA7XJMjPigBAzhzL989QcMjPhqBUIC+BAQv0QcjPhQgS+lKBARrPC5NSoPpSyYBQ+wAD/j1WEvLivu1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWEsj6Uhb6UiTPFBPMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjFcyJzxYSzMwSzMljOToD7C2CEDuLh8C6j2otghAYFI0Auo7eLYIQOwIzgLqOUC2CEC5QFEC6mT0ibpIyG5E84o45MAyCEDTtzgC6ji34ksjPhQj6Uo0GgAAAAAAAAAAAAAAAAABqmTttgAAAAAAAAABAzxbJgQCg+wDe4hEe4w0RHuMN4w07PD0C/j3tRNDUMdQx10zQ+kgx+kjU1DHXTND6SPpQMfpQMfQEMdGIcMjLX8ltbW0CyPpU+lT6VMltbW0GyPpSEvpU+lQU9ADJVhLI+lIW+lIkzxQTzBTMyW1tbW3I9ABwzws0yQPI9AAS9AD0AMzJccjLIxXMi6AAAAoAAAAEAAAgzxZjPwATAAAAoAAAAEAAAgBmeFEiyM+DywTPhaDMzPkWhPewHoALUA/XJMjPigBAzh3L989QyM+FiPpScs8LjsmAUPsAAFwwPBEeghJUC+QAoYISVAvkAMjPhYhSQPpSghARERERzwuOUrD6UgH6AsmAUPsAAv49VhqRf5f4kirHBcMA4vLivO1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWEsj6Uhb6UiTPFBPMFMzJbW1tbcj0AHDPCzTJA8j0ABL0APQAzMlxyMsjYz4ASjA8ghAF9eEAyM+FCFJA+lIB+gKAEM8LilKg+lJWEM8LCclz+wAAmhXMi6AAAAoAAAAEAAAgzxYSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AegAtQD9ckyM+KAEDOHcv3z1AqyM+FiBL6UnXPC476UsmAUPsAAKQSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AegAtQD9ckyM+KAEDOHcv3z1BSDoEBC/Ri8uLc0wPRAREWAaDIz4UIHvpSgQEKzwuTUqD6UsmAUPsAAf76VPpUFPQAyVYUyPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMVzIugAAAKAAAABAAAIM8WEszMEszJeFYRVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1CCGOiZCkYAyAH6AkAVgQELQQP89EERIYIY6JkKRgCgiHDIy1/JbW1tAsj6VPpU+lTJbW1tK8j6UhP6VPpU9ADJVhLI+lJWEAH6Ui/PFBLMzMltbW1tyPQAcM8LNMkDyPQAEvQA9ADMyXHIyyMUzIugAAAKAAAABAAAIM8WEszMzMl4LPgqbVYXVhJWF8iJzxYaY0JDAAgAAAABAKrLPxLLCfpSF/pSzBX0AAERGAHMycjPiYgBUyRWGsjPg8sEz4WgzMz5FoT3sBESgAtWGtckVxkBERgBzgEREAHL94EVDc8LeRLMHswBERQBzMmAUPsAAO7PCzTJA8j0ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXhRIsjPg8sEz4WgzMz5FoT3sBSAC1AF1yTIz4oAQM4Ty/fPUCPHBZVsIfLivuAw0PpIMfpIMdQx1DHU0dD6SPpQMfpQMfQEMdHHBfLgSgBHv9gXaiaH0AahjqGOumaH0kamoY66ZofSR9KBj9KBj6AhjogMAgFqR0gAD7KOe1E0NdMgAFWzOntRND6ANMf1NMH0wHSAPoA+gD6ANIA0wPTE9MH0gDSANMJ0wnU1NTRgA/5XEFcQVxBXIviSK8cF8uBJDNM/+gD6SPpQ9AH6ACD0BAFukTCR0eIj+kQw8tFN+Jf4k3D4OiNyceME+DkgboEYtyLjBCFugR0TWAPjBFAjqCWgc4EDLHD4PKABcPg2oAFw+Dagc4EEAoIQCWYBgHD4N6C88rBwViLCZOMPU1CgTE1OA9DXLCAAAABMj1fXLCAAAAAMjrjXLCAAAAAUjhgwPz8/VyH4klYgxwX4ki3HBbHy4uQREbPjDgERIAEREREfEREBER4BAhERAhA7AuMNDREgDREfAREeAQIREQIQzRA8GxPjDREbER4RG1FSUwP8VxBXEFcQVyIM0z/6ANMJ0gD6SPpQ+gAx+JIj8AEkVhe6kTTjDhEkJKAC4wCCCA9CQMjPkc2LQnImzws/UAX6AlIQ+lITzsnIz4UIUvD6UlAE+gJxzwtqE8zJc/sAViFuswIRIgHjBPiX+CdvEKL4L6BzgQQCghAJZgGAcPg3ZmdoAIYwVyFwghgXhBGyAIIImJaAyIvHvdl94AAAAAAAAAAIzxYi+gJWEgH6UlJQ+lTJyM+FCFLA+lJY+gJxzwtqzMmAEfsAAAwRIqQBESIC/lYmu/KvJaABESUBofgnbxD4l6H4L6BzgQQCghAJZgGAcPg3tgly+wLtRNDUMdQx10zQ+kgx+kjU1DHXTND6SPpQMfpQMfQEMdGIcMjLX8ltbW0CyPpU+lT6VMltbW0GyPpSEvpU+lQU9ADJKcj6Uhb6UiTPFBPMFMzJbW1tbchjTwH89ABwzws0yQPI9AAS9AD0AMzJccjLIxXMi6AAAAoAAAAEAAAgzxYSzMwSzMl4USLIz4PLBM+FoMzM+RaE97AVgAtQBtckyM+KAEDOFMv3z1BWFVYQyM+QXjUUZhjLP1AG+gIVywnPgRX6UvpUUAP6AgERHgHOycjPhYgBER4BUAAi+lJxzwtuAREdAczJgQCQ+wAB/NcsIAAAACyOa1cQVxBXEFciDPpIMPiSAfABVhny0sQREbNWHo5N+JKL9hdXRob3JpdHlGcmVlemWMiLwXjUUZAAAAAAAAAACM8WViH6AlYSzwsJz4FSwPpSUsD6VM+EIM7JyM+FiBL6UnHPC27MyYBQ+wDe4w4LESALEL0QvFQC/DE/Pz9XH1cfVx8P8tLTCNM/0wn6SPpI1PQE10z4ku1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMkryPpSFvpSJM8UE8wUzMltbW1tyPQAcM8LNMkDyGNgAvxXEFcQVxBXIviSI8cF8uK8DNM/+gD6SDAhViK58uLFESEhoe1E0NQx1DHXTND6SDH6SNTUMddM0PpI+lAx+lAx9AQx0YhwyMtfyW1tbQLI+lT6VPpUyW1tbQbI+lIS+lT6VBT0AMlWJ8j6Uhb6UiTPFBPMFMzJbW1tbcj0AHBjZAHy1ywgAAAANI4RVxBXEFcQVxxXIQv6SDHXCwGO1dcsIAAAAISORVcQVxBXEFciDPpIMPiSAfAB+JKCEAX14QBt+CrIz5CUI1mrVhTPCwlS4PpSEvQA9ADJyM+FCBP6UgH6AnHPC2rMyXP7AOMOCxEgERriERoRIAsREVUD9tcsIShGs1SPcNcsIAAAAESO49csIsr4PeSYXw9fD18I8jHg1ywmm5CsZI49MD8/P1chJJFwl/iSI8cFwwDijig0Oj9XFlcbfxEaghA7msoAoH/4I/go+CgRHwQRHgQDERkDBBERBESw3uMODREgDRETEM0QvOMNERPjDVZXWALe1ywjmxaE5I7c1ywgiIiIjI4wVxBXEFcQVyIM+kj6ADD4kljwAcjPhYhSQPpSghARERERzwuOUrD6UgH6AsmAUPsAjqDXLCAAAAKMnjA/Pz9XIfiSKscF8uK84w4NESANEM0QvOLjDQsRIAsQvRC8WVoAdFcQVxBXEFciDNIA0wP6SDD4kgHwAQGVAREUAaCVAREUAaHiU5jHBY4QVxlWGIIID0JAvH9w4wQRGd8BQlcQVxBXEFciDNIA0wn6SPQE9AX4kiPwAVYUJLmSXwXjDV8D/NcsIAAAApSO79csIAAAAKSOOzA/Pz9XIfiSKscF8uK8+JLIz4UI+lKNBoAAAAAAAAAAAAAAAAAAapk7bYAAAAAAAAAAQM8WyYEAoPsAjqDXLCAAAADEMZ8/Pz8RIccA8rELESALEL3jDQ0RIA0QveINESANEM0QvOMNCxEgC1tcXQB0VxBXEFcQVyIM0z/6APpIgggPQkDIz5HNi0JyFcs/UAP6AvpSzsnIz4UIUsD6Ulj6AnHPC2rMyXP7AAH+VyT4l4IQO5rKALry4r/4kshWI/oCViLPCx9WIc8UViDPCwdWH88LAVYezwoAVh36AlYc+gJWG/oCVhrPCgBWGc8LA1YYzwsTVhfPCwdWFs8KAFYVzwoAVhTPCwlWE88LCQEREgHMAREQAcwezMnIz4UIAREQAfpSgBnPC44fzF4AKFcQVxBXEFciDNNAMfpIMPiSAfABAAgQvRC8AArJgEL7AADMVxQiVhT7BFYU0O0e7VMh8QiuU1WBAQv0gm+lMpEBjkCCEAX14QAhyM+QlCNZqinPCgAozwsJUnD6UlJg9ABWGQH0AMnIz4UIEvpSWPoCcc8LaszJc/sAIYEBC/R0b6Uy6FtXFF8EAv70ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXgoVBIyyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBfLivH+CEDuaygAplBAnbDLjDviSyM+QAAAAEhfLP1LA+lIU+lIUzMnIz4UIVhMB+lJxzwtuYWIAXDlXEFcf+CP4klYgJ1YVvI4SVxQj+wQD0O0e7VMB8QiuBBERlBAnbDLiER4EUOYADMzJgFD7AAAAAf7PCzTJA8j0ABL0APQAzMlxyMsjFcyLoAAACgAAAAQAACDPFhLMzBLMyXhRIsjPg8sEz4WgzMz5FoT3sAERIwGACwERJNckyM+KAEDOAREiAcv3z1BtiwhWFC/Iz5BeNRRmF8s/UAX6AhTLCc+BFPpSE/pUz4QgzsnIz4WIEvpSZQAScc8LbszJcvsAAMYEVha5jjX4koIQBfXhAG34KsjPkJQjWatWGs8LCVYUAfpSEvQA9ADJyM+FCBP6UgH6AnHPC2rMyXP7AI4l+JKCEAX14QDIz4UIEvpSAfoCgBDPC4pWEAH6UlYWzwsJyXP7AOIArIIQBfXhAIsCINcsBTHyiW2CAYagyM+QXjUUZinPCz8o+gLPiADAE/pS+lQB+gIkzxbJVHYhyM+FCFLA+lIB+gKCEGQrfQfPC4oSyz/6Ulj6AszJc/sAADi2CXL7AsjPhQj6UoIQ1TJ2288Ljss/yYEAgvsA',
  ),
),
  Er(sn, 'Errors', {
    'Errors.NotOwner': 73,
    'Errors.NotValidWallet': 74,
    'Errors.IncorrectSender': 700,
    'Errors.IncorrectReceiver': 708,
    'Errors.WaitMore': 735,
  }));
let Qa = sn;
const j0 = 0,
  Xa = 0,
  ro = {};
async function z0(n) {
  if (!ro[n]) {
    const i = new TextEncoder().encode(n),
      l = await crypto.subtle.digest('SHA-256', i);
    ro[n] = Buffer.from(l);
  }
  return ro[n];
}
function V0(n) {
  if (n.length <= 126)
    return ee.beginCell().storeUint(Xa, 8).storeBuffer(n).endCell();
  const u = [];
  u.push(n.subarray(0, 126));
  let g = 126;
  for (; g < n.length;) {
    const w = Math.min(g + 127, n.length);
    (u.push(n.subarray(g, w)), (g = w));
  }
  let h = null;
  for (let w = u.length - 1; w >= 0; w--) {
    const y = ee.beginCell();
    (w === 0 && y.storeUint(Xa, 8),
      y.storeBuffer(u[w]),
      h && y.storeRef(h),
      (h = y.endCell()));
  }
  return h;
}
async function W0(n) {
  const i = ee.Dictionary.empty(
      ee.Dictionary.Keys.Buffer(32),
      ee.Dictionary.Values.Cell(),
    ),
    l = [
      ['name', n.name],
      ['symbol', n.symbol],
      ['decimals', n.decimals],
    ];
  (n.description && l.push(['description', n.description]),
    n.image && l.push(['image', n.image]),
    n.imageData && l.push(['image_data', n.imageData]));
  for (const [u, g] of l) {
    const h = await z0(u),
      w = V0(Buffer.from(g, 'utf-8'));
    i.set(h, w);
  }
  return ee.beginCell().storeUint(j0, 8).storeDict(i).endCell();
}
function jo(n, i) {
  const [l = '', u = ''] = n.split('.'),
    g = u.slice(0, i).padEnd(i, '0');
  return BigInt(l + g);
}
function H0(n) {
  const {
    toAddress: i,
    jettonAmount: l,
    forwardTonAmount: u,
    totalTonAmount: g,
    queryId: h = 0n,
  } = n;
  return cn.toCell(
    cn.create({
      queryId: h,
      mintRecipient: i,
      tonAmount: g,
      internalTransferMsg: {
        ref: Ii.create({
          queryId: h,
          jettonAmount: l,
          version: 0n,
          transferInitiator: i,
          sendExcessesTo: null,
          forwardTonAmount: u,
          forwardPayload: Js.create({ value: ee.beginCell().asSlice() }),
        }),
      },
    }),
  );
}
function Q0(n, i = 0n) {
  return un.toCell(un.create({ queryId: i, newAdminAddress: n }));
}
async function X0(n, i = 0n) {
  const l = await W0(n);
  return fn.toCell(fn.create({ queryId: i, newMetadata: l }));
}
function G0(n, i, l = 0n) {
  return an.toCell(
    an.create({
      queryId: l,
      jettonAmount: n,
      sendExcessesTo: i,
      customPayload: null,
    }),
  );
}
function Y0(n) {
  const {
      toAddress: i,
      amount: l,
      responseAddress: u,
      forwardTonAmount: g = 0n,
      forwardPayload: h = null,
      queryId: w = 0n,
    } = n,
    y = h
      ? bi.create({ value: { ref: h.beginParse() } })
      : Js.create({ value: ee.beginCell().asSlice() });
  return on.toCell(
    on.create({
      queryId: w,
      jettonAmount: l,
      transferRecipient: i,
      sendExcessesTo: u,
      customPayload: null,
      forwardTonAmount: g,
      forwardPayload: y,
    }),
  );
}
function K0(n) {
  const {
    transferRecipient: i,
    sendExcessesTo: l,
    forwardPayload: u = '',
    queryId: g = 0n,
  } = n;
  return rr.toCell(
    rr.create({
      queryId: g,
      jettonAmount: ee.toNano('0.1'),
      transferRecipient: i,
      sendExcessesTo: l,
      customPayload: null,
      forwardTonAmount: 0n,
      forwardPayload: u,
    }),
  );
}
function J0(n) {
  const { transferRecipient: i, sendExcessesTo: l, queryId: u = 0n } = n;
  return rr.toCell(
    rr.create({
      queryId: u,
      jettonAmount: ee.toNano('0.11'),
      transferRecipient: i,
      sendExcessesTo: l,
      customPayload: null,
      forwardTonAmount: 0n,
      forwardPayload: '',
    }),
  );
}
function q0(n) {
  const { transferRecipient: i, sendExcessesTo: l, queryId: u = 0n } = n;
  return rr.toCell(
    rr.create({
      queryId: u,
      jettonAmount: ee.toNano('0.12'),
      transferRecipient: i,
      sendExcessesTo: l,
      customPayload: null,
      forwardTonAmount: 0n,
      forwardPayload: '',
    }),
  );
}
function Z0() {
  return ln.toCell(ln.create());
}
function $0() {
  return hn.toCell(hn.create());
}
function ed() {
  return gn.toCell(gn.create());
}
function td() {
  return xn.toCell(xn.create());
}
function Ut(n) {
  var i, l;
  if (typeof n == 'object' && n !== null) {
    const u = n;
    if (
      (((i = u.response) == null ? void 0 : i.status) ?? u.status ?? null) ===
        429 ||
      ((l = u.message) != null && l.includes('status code 429'))
    )
      return 'Toncenter rate limit reached (HTTP 429). Wait a bit or add TONCENTER_MAINNET_API_KEY / TONCENTER_TESTNET_API_KEY.';
    if (typeof u.message == 'string' && u.message.length > 0) return u.message;
  }
  return n instanceof Error ? n.message : 'Unexpected error.';
}
function tr(n) {
  const i = Ut(n);
  return /cancel|reject|closed|Interrupt/i.test(i);
}
function Ws({ className: n, ...i }) {
  return b.jsx('div', {
    'data-slot': 'card',
    className: yt(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      n,
    ),
    ...i,
  });
}
function Hs({ className: n, ...i }) {
  return b.jsx('div', {
    'data-slot': 'card-content',
    className: yt('px-6', n),
    ...i,
  });
}
function Yt({ className: n, type: i, ...l }) {
  return b.jsx('input', {
    type: i,
    'data-slot': 'input',
    className: yt(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      n,
    ),
    ...l,
  });
}
function rd({ className: n, ...i }) {
  return b.jsx('textarea', {
    'data-slot': 'textarea',
    className: yt(
      'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      n,
    ),
    ...i,
  });
}
var nd = Object.defineProperty,
  sd = (n, i) => nd(n, 'name', { value: i, configurable: !0 }),
  id = [
    'a',
    'button',
    'div',
    'form',
    'h2',
    'h3',
    'img',
    'input',
    'label',
    'li',
    'nav',
    'ol',
    'p',
    'select',
    'span',
    'svg',
    'ul',
  ],
  sr = id.reduce((n, i) => {
    const l = In(`Primitive.${i}`),
      u = P.forwardRef((g, h) => {
        const { asChild: w, ...y } = g,
          I = w ? l : i;
        return (
          typeof window < 'u' && (window[Symbol.for('radix-ui')] = !0),
          b.jsx(I, { ...y, ref: h })
        );
      });
    return ((u.displayName = `Primitive.${i}`), { ...n, [i]: u });
  }, {});
function od(n, i) {
  n && T1.flushSync(() => n.dispatchEvent(i));
}
sd(od, 'dispatchDiscreteCustomEvent');
var ad = Object.defineProperty,
  ld = (n, i) => ad(n, 'name', { value: i, configurable: !0 }),
  cd = P.forwardRef(
    ld(function (i, l) {
      return b.jsx(sr.label, {
        ...i,
        ref: l,
        onMouseDown: (u) => {
          var h;
          u.target.closest('button, input, select, textarea') ||
            ((h = i.onMouseDown) == null || h.call(i, u),
            !u.defaultPrevented && u.detail > 1 && u.preventDefault());
        },
      });
    }, 'Label'),
  ),
  ud = cd;
function jt({ className: n, ...i }) {
  return b.jsx(ud, {
    'data-slot': 'label',
    className: yt(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      n,
    ),
    ...i,
  });
}
var dd = Object.defineProperty,
  ns = (n, i) => dd(n, 'name', { value: i, configurable: !0 }),
  lc = !!(
    typeof window < 'u' &&
    window.document &&
    window.document.createElement
  );
function mr(n, i, { checkForDefaultPrevented: l = !0 } = {}) {
  return ns(function (g) {
    if ((n == null || n(g), l === !1 || !g || !g.defaultPrevented))
      return i == null ? void 0 : i(g);
  }, 'handleEvent');
}
ns(mr, 'composeEventHandlers');
function fd(n) {
  var i;
  if (!lc) throw new Error('Cannot access window outside of the DOM');
  return (
    ((i = n == null ? void 0 : n.ownerDocument) == null
      ? void 0
      : i.defaultView) ?? window
  );
}
ns(fd, 'getOwnerWindow');
function bo(n) {
  if (!lc) throw new Error('Cannot access document outside of the DOM');
  return (n == null ? void 0 : n.ownerDocument) ?? document;
}
ns(bo, 'getOwnerDocument');
function cc(n, i = !1) {
  const { activeElement: l } = bo(n);
  if (!(l != null && l.nodeName)) return null;
  if (uc(l) && l.contentDocument) return cc(l.contentDocument.body, i);
  if (i) {
    const u = l.getAttribute('aria-activedescendant');
    if (u) {
      const g = bo(l).getElementById(u);
      if (g) return g;
    }
  }
  return l;
}
ns(cc, 'getActiveElement');
function uc(n) {
  return n.tagName === 'IFRAME';
}
ns(uc, 'isFrame');
var hd = Object.defineProperty,
  Gt = (n, i) => hd(n, 'name', { value: i, configurable: !0 });
function gd(n, i) {
  const l = P.createContext(i);
  l.displayName = n + 'Context';
  const u = Gt((h) => {
    const { children: w, ...y } = h,
      I = P.useMemo(() => y, Object.values(y));
    return b.jsx(l.Provider, { value: I, children: w });
  }, 'Provider');
  u.displayName = n + 'Provider';
  function g(h, w = {}) {
    const { optional: y = !1 } = w,
      I = P.useContext(l);
    if (I) return I;
    if (i !== void 0) return i;
    if (!y) throw new Error(`\`${h}\` must be used within \`${n}\``);
  }
  return (Gt(g, 'useContext'), [u, g]);
}
Gt(gd, 'createContext');
function ss(n, i = []) {
  let l = [];
  function u(h, w) {
    const y = P.createContext(w);
    y.displayName = h + 'Context';
    const I = l.length;
    l = [...l, w];
    const p = Gt((T) => {
      var Y;
      const { scope: _, children: D, ...z } = T,
        M = ((Y = _ == null ? void 0 : _[n]) == null ? void 0 : Y[I]) || y,
        X = P.useMemo(() => z, Object.values(z));
      return b.jsx(M.Provider, { value: X, children: D });
    }, 'Provider');
    p.displayName = h + 'Provider';
    function R(T, _, D = {}) {
      var Y;
      const { optional: z = !1 } = D,
        M = ((Y = _ == null ? void 0 : _[n]) == null ? void 0 : Y[I]) || y,
        X = P.useContext(M);
      if (X) return X;
      if (w !== void 0) return w;
      if (!z) throw new Error(`\`${T}\` must be used within \`${h}\``);
    }
    return (Gt(R, 'useContext'), [p, R]);
  }
  Gt(u, 'createContext');
  const g = Gt(() => {
    const h = l.map((w) => P.createContext(w));
    return Gt(function (y) {
      const I = (y == null ? void 0 : y[n]) || h;
      return P.useMemo(() => ({ [`__scope${n}`]: { ...y, [n]: I } }), [y, I]);
    }, 'useScope');
  }, 'createScope');
  return ((g.scopeName = n), [u, dc(g, ...i)]);
}
Gt(ss, 'createContextScope');
function dc(...n) {
  const i = n[0];
  if (n.length === 1) return i;
  const l = Gt(() => {
    const u = n.map((g) => ({ useScope: g(), scopeName: g.scopeName }));
    return Gt(function (h) {
      const w = u.reduce((y, { useScope: I, scopeName: p }) => {
        const T = I(h)[`__scope${p}`];
        return { ...y, ...T };
      }, {});
      return P.useMemo(() => ({ [`__scope${i.scopeName}`]: w }), [w]);
    }, 'useComposedScopes');
  }, 'createScope');
  return ((l.scopeName = i.scopeName), l);
}
Gt(dc, 'composeContextScopes');
var xd = Object.defineProperty,
  xt = (n, i) => xd(n, 'name', { value: i, configurable: !0 });
function fc(n) {
  const i = n + 'CollectionProvider',
    [l, u] = ss(i),
    [g, h] = l(i, { collectionRef: { current: null }, itemMap: new Map() }),
    w = xt((M) => {
      const { scope: X, children: Y } = M,
        J = P.useRef(null),
        H = P.useRef(new Map()).current;
      return b.jsx(g, { scope: X, itemMap: H, collectionRef: J, children: Y });
    }, 'CollectionProvider');
  w.displayName = i;
  const y = n + 'CollectionSlot',
    I = In(y),
    p = P.forwardRef((M, X) => {
      const { scope: Y, children: J } = M,
        H = h(y, Y),
        W = Gr(X, H.collectionRef);
      return b.jsx(I, { ref: W, children: J });
    });
  p.displayName = y;
  const R = n + 'CollectionItemSlot',
    T = 'data-radix-collection-item',
    _ = In(R),
    D = P.forwardRef((M, X) => {
      const { scope: Y, children: J, ...H } = M,
        W = P.useRef(null),
        ne = Gr(X, W),
        re = h(R, Y);
      return (
        P.useEffect(
          () => (
            re.itemMap.set(W, { ref: W, ...H }),
            () => void re.itemMap.delete(W)
          ),
        ),
        b.jsx(_, { [T]: '', ref: ne, children: J })
      );
    });
  D.displayName = R;
  function z(M) {
    const X = h(n + 'CollectionConsumer', M);
    return P.useCallback(() => {
      const J = X.collectionRef.current;
      if (!J) return [];
      const H = Array.from(J.querySelectorAll(`[${T}]`));
      return Array.from(X.itemMap.values()).sort(
        (re, Q) => H.indexOf(re.ref.current) - H.indexOf(Q.ref.current),
      );
    }, [X.collectionRef, X.itemMap]);
  }
  return (
    xt(z, 'useCollection'),
    [{ Provider: w, Slot: p, ItemSlot: D }, z, u]
  );
}
xt(fc, 'createCollection');
var Ga = new WeakMap(),
  rt,
  Ft,
  no =
    ((Ft = class extends Map {
      constructor(l) {
        super(l);
        Ie(this, rt);
        (pe(this, rt, [...super.keys()]), Ga.set(this, !0));
      }
      set(l, u) {
        return (
          Ga.get(this) &&
            (this.has(l)
              ? (j(this, rt)[j(this, rt).indexOf(l)] = l)
              : j(this, rt).push(l)),
          super.set(l, u),
          this
        );
      }
      insert(l, u, g) {
        const h = this.has(u),
          w = j(this, rt).length,
          y = zo(l);
        let I = y >= 0 ? y : w + y;
        const p = I < 0 || I >= w ? -1 : I;
        if (p === this.size || (h && p === this.size - 1) || p === -1)
          return (this.set(u, g), this);
        const R = this.size + (h ? 0 : 1);
        y < 0 && I++;
        const T = [...j(this, rt)];
        let _,
          D = !1;
        for (let z = I; z < R; z++)
          if (I === z) {
            let M = T[z];
            (T[z] === u && (M = T[z + 1]),
              h && this.delete(u),
              (_ = this.get(M)),
              this.set(u, g));
          } else {
            !D && T[z - 1] === u && (D = !0);
            const M = T[D ? z : z - 1],
              X = _;
            ((_ = this.get(M)), this.delete(M), this.set(M, X));
          }
        return this;
      }
      with(l, u, g) {
        const h = new Ft(this);
        return (h.insert(l, u, g), h);
      }
      before(l) {
        const u = j(this, rt).indexOf(l) - 1;
        if (!(u < 0)) return this.entryAt(u);
      }
      setBefore(l, u, g) {
        const h = j(this, rt).indexOf(l);
        return h === -1 ? this : this.insert(h, u, g);
      }
      after(l) {
        let u = j(this, rt).indexOf(l);
        if (((u = u === -1 || u === this.size - 1 ? -1 : u + 1), u !== -1))
          return this.entryAt(u);
      }
      setAfter(l, u, g) {
        const h = j(this, rt).indexOf(l);
        return h === -1 ? this : this.insert(h + 1, u, g);
      }
      first() {
        return this.entryAt(0);
      }
      last() {
        return this.entryAt(-1);
      }
      clear() {
        return (pe(this, rt, []), super.clear());
      }
      delete(l) {
        const u = super.delete(l);
        return (u && j(this, rt).splice(j(this, rt).indexOf(l), 1), u);
      }
      deleteAt(l) {
        const u = this.keyAt(l);
        return u !== void 0 ? this.delete(u) : !1;
      }
      at(l) {
        const u = Ci(j(this, rt), l);
        if (u !== void 0) return this.get(u);
      }
      entryAt(l) {
        const u = Ci(j(this, rt), l);
        if (u !== void 0) return [u, this.get(u)];
      }
      indexOf(l) {
        return j(this, rt).indexOf(l);
      }
      keyAt(l) {
        return Ci(j(this, rt), l);
      }
      from(l, u) {
        const g = this.indexOf(l);
        if (g === -1) return;
        let h = g + u;
        return (
          h < 0 && (h = 0),
          h >= this.size && (h = this.size - 1),
          this.at(h)
        );
      }
      keyFrom(l, u) {
        const g = this.indexOf(l);
        if (g === -1) return;
        let h = g + u;
        return (
          h < 0 && (h = 0),
          h >= this.size && (h = this.size - 1),
          this.keyAt(h)
        );
      }
      find(l, u) {
        let g = 0;
        for (const h of this) {
          if (Reflect.apply(l, u, [h, g, this])) return h;
          g++;
        }
      }
      findIndex(l, u) {
        let g = 0;
        for (const h of this) {
          if (Reflect.apply(l, u, [h, g, this])) return g;
          g++;
        }
        return -1;
      }
      filter(l, u) {
        const g = [];
        let h = 0;
        for (const w of this)
          (Reflect.apply(l, u, [w, h, this]) && g.push(w), h++);
        return new Ft(g);
      }
      map(l, u) {
        const g = [];
        let h = 0;
        for (const w of this)
          (g.push([w[0], Reflect.apply(l, u, [w, h, this])]), h++);
        return new Ft(g);
      }
      reduce(...l) {
        const [u, g] = l;
        let h = 0,
          w = g ?? this.at(0);
        for (const y of this)
          (h === 0 && l.length === 1
            ? (w = y)
            : (w = Reflect.apply(u, this, [w, y, h, this])),
            h++);
        return w;
      }
      reduceRight(...l) {
        const [u, g] = l;
        let h = g ?? this.at(-1);
        for (let w = this.size - 1; w >= 0; w--) {
          const y = this.at(w);
          w === this.size - 1 && l.length === 1
            ? (h = y)
            : (h = Reflect.apply(u, this, [h, y, w, this]));
        }
        return h;
      }
      toSorted(l) {
        const u = [...this.entries()].sort(l);
        return new Ft(u);
      }
      toReversed() {
        const l = new Ft();
        for (let u = this.size - 1; u >= 0; u--) {
          const g = this.keyAt(u),
            h = this.get(g);
          l.set(g, h);
        }
        return l;
      }
      toSpliced(...l) {
        const u = [...this.entries()];
        return (u.splice(...l), new Ft(u));
      }
      slice(l, u) {
        const g = new Ft();
        let h = this.size - 1;
        if (l === void 0) return g;
        (l < 0 && (l = l + this.size), u !== void 0 && u > 0 && (h = u - 1));
        for (let w = l; w <= h; w++) {
          const y = this.keyAt(w),
            I = this.get(y);
          g.set(y, I);
        }
        return g;
      }
      every(l, u) {
        let g = 0;
        for (const h of this) {
          if (!Reflect.apply(l, u, [h, g, this])) return !1;
          g++;
        }
        return !0;
      }
      some(l, u) {
        let g = 0;
        for (const h of this) {
          if (Reflect.apply(l, u, [h, g, this])) return !0;
          g++;
        }
        return !1;
      }
    }),
    (rt = new WeakMap()),
    xt(Ft, 'OrderedDict'),
    Ft);
function Ci(n, i) {
  if ('at' in Array.prototype) return Array.prototype.at.call(n, i);
  const l = hc(n, i);
  return l === -1 ? void 0 : n[l];
}
xt(Ci, 'at');
function hc(n, i) {
  const l = n.length,
    u = zo(i),
    g = u >= 0 ? u : l + u;
  return g < 0 || g >= l ? -1 : g;
}
xt(hc, 'toSafeIndex');
function zo(n) {
  return n !== n || n === 0 ? 0 : Math.trunc(n);
}
xt(zo, 'toSafeInteger');
function Ad(n) {
  const i = n + 'CollectionProvider',
    [l, u] = ss(i),
    [g, h] = l(i, {
      collectionElement: null,
      collectionRef: { current: null },
      collectionRefObject: { current: null },
      itemMap: new no(),
      setItemMap: xt(() => {}, 'setItemMap'),
    }),
    w = xt(
      ({ state: H, ...W }) =>
        H ? b.jsx(I, { ...W, state: H }) : b.jsx(y, { ...W }),
      'CollectionProvider',
    );
  w.displayName = i;
  const y = xt((H) => {
    const W = X();
    return b.jsx(I, { ...H, state: W });
  }, 'CollectionInit');
  y.displayName = i + 'Init';
  const I = xt((H) => {
    const { scope: W, children: ne, state: re } = H,
      Q = P.useRef(null),
      [V, L] = P.useState(null),
      We = Gr(Q, L),
      [xe, se] = re;
    return (
      P.useEffect(() => {
        if (!V) return;
        const $ = Ac(() => {});
        return (
          $.observe(V, { childList: !0, subtree: !0 }),
          () => {
            $.disconnect();
          }
        );
      }, [V]),
      b.jsx(g, {
        scope: W,
        itemMap: xe,
        setItemMap: se,
        collectionRef: We,
        collectionRefObject: Q,
        collectionElement: V,
        children: ne,
      })
    );
  }, 'CollectionProviderImpl');
  I.displayName = i + 'Impl';
  const p = n + 'CollectionSlot',
    R = In(p),
    T = P.forwardRef((H, W) => {
      const { scope: ne, children: re } = H,
        Q = h(p, ne),
        V = Gr(W, Q.collectionRef);
      return b.jsx(R, { ref: V, children: re });
    });
  T.displayName = p;
  const _ = n + 'CollectionItemSlot',
    D = 'data-radix-collection-item',
    z = In(_),
    M = P.forwardRef((H, W) => {
      const { scope: ne, children: re, ...Q } = H,
        V = P.useRef(null),
        [L, We] = P.useState(null),
        xe = Gr(W, V, We),
        se = h(_, ne),
        { setItemMap: $ } = se,
        we = P.useRef(Q);
      gc(we.current, Q) || (we.current = Q);
      const k = we.current;
      return (
        P.useEffect(() => {
          const Te = k;
          return (
            $((ie) =>
              L
                ? ie.has(L)
                  ? ie.set(L, { ...Te, element: L }).toSorted(Io)
                  : (ie.set(L, { ...Te, element: L }), ie.toSorted(Io))
                : ie,
            ),
            () => {
              $((ie) => (!L || !ie.has(L) ? ie : (ie.delete(L), new no(ie))));
            }
          );
        }, [L, k, $]),
        b.jsx(z, { [D]: '', ref: xe, children: re })
      );
    });
  M.displayName = _;
  function X() {
    return P.useState(new no());
  }
  xt(X, 'useInitCollection');
  function Y(H) {
    const { itemMap: W } = h(n + 'CollectionConsumer', H);
    return W;
  }
  return (
    xt(Y, 'useCollection'),
    [
      { Provider: w, Slot: T, ItemSlot: M },
      { createCollectionScope: u, useCollection: Y, useInitCollection: X },
    ]
  );
}
xt(Ad, 'createCollection');
function gc(n, i) {
  if (n === i) return !0;
  if (typeof n != 'object' || typeof i != 'object' || n == null || i == null)
    return !1;
  const l = Object.keys(n),
    u = Object.keys(i);
  if (l.length !== u.length) return !1;
  for (const g of l)
    if (!Object.prototype.hasOwnProperty.call(i, g) || n[g] !== i[g]) return !1;
  return !0;
}
xt(gc, 'shallowEqual');
function xc(n, i) {
  return !!(i.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING);
}
xt(xc, 'isElementPreceding');
function Io(n, i) {
  return !n[1].element || !i[1].element
    ? 0
    : xc(n[1].element, i[1].element)
      ? -1
      : 1;
}
xt(Io, 'sortByDocumentPosition');
function Ac(n) {
  return new MutationObserver((l) => {
    for (const u of l)
      if (u.type === 'childList') {
        n();
        return;
      }
  });
}
xt(Ac, 'getChildListObserver');
var Yr =
    globalThis != null && globalThis.document ? P.useLayoutEffect : () => {},
  md = Object.defineProperty,
  pd = (n, i) => md(n, 'name', { value: i, configurable: !0 }),
  wd = ts[' useId '.trim().toString()] || (() => {}),
  Cd = 0;
function Vo(n) {
  const [i, l] = P.useState(wd());
  return (
    Yr(() => {
      n || l((u) => u ?? String(Cd++));
    }, [n]),
    n || (i ? `radix-${i}` : '')
  );
}
pd(Vo, 'useId');
var yd = Object.defineProperty,
  Ed = (n, i) => yd(n, 'name', { value: i, configurable: !0 });
function Wo(n) {
  const i = P.useRef(n);
  return (
    P.useEffect(() => {
      i.current = n;
    }),
    P.useMemo(
      () =>
        (...l) => {
          var u;
          return (u = i.current) == null ? void 0 : u.call(i, ...l);
        },
      [],
    )
  );
}
Ed(Wo, 'useCallbackRef');
var bd = Object.defineProperty,
  Id = (n, i) => bd(n, 'name', { value: i, configurable: !0 }),
  Ya = ts[' useEffectEvent '.trim().toString()],
  Ka = ts[' useInsertionEffect '.trim().toString()];
function mc(n) {
  if (typeof Ya == 'function') return Ya(n);
  const i = P.useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });
  return (
    typeof Ka == 'function'
      ? Ka(() => {
          i.current = n;
        })
      : Yr(() => {
          i.current = n;
        }),
    P.useMemo(
      () =>
        (...l) => {
          var u;
          return (u = i.current) == null ? void 0 : u.call(i, ...l);
        },
      [],
    )
  );
}
Id(mc, 'useEffectEvent');
var Sd = Object.defineProperty,
  ei = (n, i) => Sd(n, 'name', { value: i, configurable: !0 }),
  Td = ts[' useInsertionEffect '.trim().toString()] || Yr;
function Ho({
  prop: n,
  defaultProp: i,
  onChange: l = ei(() => {}, 'onChange'),
  caller: u,
}) {
  const [g, h, w] = pc({ defaultProp: i, onChange: l }),
    y = n !== void 0,
    I = y ? n : g,
    p = P.useCallback(
      (R) => {
        var T;
        if (y) {
          const _ = wc(R) ? R(n) : R;
          _ !== n && ((T = w.current) == null || T.call(w, _));
        } else h(R);
      },
      [y, n, h, w],
    );
  return [I, p];
}
ei(Ho, 'useControllableState');
function pc({ defaultProp: n, onChange: i }) {
  const [l, u] = P.useState(n),
    g = P.useRef(l),
    h = P.useRef(i);
  return (
    Td(() => {
      h.current = i;
    }, [i]),
    P.useEffect(() => {
      var w;
      g.current !== l &&
        ((w = h.current) == null || w.call(h, l), (g.current = l));
    }, [l, g]),
    [l, u, h]
  );
}
ei(pc, 'useUncontrolledState');
function wc(n) {
  return typeof n == 'function';
}
ei(wc, 'isFunction');
var Ja = Symbol('RADIX:SYNC_STATE');
function Rd(n, i, l, u) {
  const { prop: g, defaultProp: h, onChange: w, caller: y } = i,
    I = g !== void 0,
    p = mc(w),
    R = [{ ...l, state: h }];
  u && R.push(u);
  const [T, _] = P.useReducer(
      (X, Y) => {
        if (Y.type === Ja) return { ...X, state: Y.state };
        const J = n(X, Y);
        return (I && !Object.is(J.state, X.state) && p(J.state), J);
      },
      ...R,
    ),
    D = T.state,
    z = P.useRef(D);
  P.useEffect(() => {
    z.current !== D && ((z.current = D), I || p(D));
  }, [D, z, I]);
  const M = P.useMemo(() => (g !== void 0 ? { ...T, state: g } : T), [T, g]);
  return (
    P.useEffect(() => {
      I && !Object.is(g, T.state) && _({ type: Ja, state: g });
    }, [g, T.state, I]),
    [M, _]
  );
}
ei(Rd, 'useControllableStateReducer');
var vd = Object.defineProperty,
  Nd = (n, i) => vd(n, 'name', { value: i, configurable: !0 }),
  Md = P.createContext(void 0);
function Qo(n) {
  const i = P.useContext(Md);
  return n || i || 'ltr';
}
Nd(Qo, 'useDirection');
var Dd = Object.defineProperty,
  Xo = (n, i) => Dd(n, 'name', { value: i, configurable: !0 }),
  so = !1;
function Cc() {
  const [n, i] = P.useState(so);
  return (
    P.useEffect(() => {
      so || ((so = !0), i(!0));
    }, []),
    n
  );
}
Xo(Cc, 'useIsHydrated');
var yc = ts[' useSyncExternalStore '.trim().toString()];
function Ec() {
  return () => {};
}
Xo(Ec, 'subscribe');
function bc() {
  return yc(
    Ec,
    () => !0,
    () => !1,
  );
}
Xo(bc, 'useIsHydratedModern');
var Od = typeof yc == 'function' ? bc : Cc,
  Pd = Object.defineProperty,
  vn = (n, i) => Pd(n, 'name', { value: i, configurable: !0 }),
  io = 'rovingFocusGroup.onEntryFocus',
  Bd = { bubbles: !1, cancelable: !0 },
  Mi = 'RovingFocusGroup',
  [So, Ic, _d] = fc(Mi),
  [Ld, Sc] = ss(Mi, [_d]),
  [kd, Fd] = Ld(Mi),
  Ud = P.forwardRef(
    vn(function (i, l) {
      return b.jsx(So.Provider, {
        scope: i.__scopeRovingFocusGroup,
        children: b.jsx(So.Slot, {
          scope: i.__scopeRovingFocusGroup,
          children: b.jsx(jd, { ...i, ref: l }),
        }),
      });
    }, 'RovingFocusGroup'),
  ),
  jd = P.forwardRef(
    vn(function (i, l) {
      const {
          __scopeRovingFocusGroup: u,
          orientation: g,
          loop: h = !1,
          dir: w,
          currentTabStopId: y,
          defaultCurrentTabStopId: I,
          onCurrentTabStopIdChange: p,
          onEntryFocus: R,
          preventScrollOnEntryFocus: T = !1,
          ..._
        } = i,
        D = P.useRef(null),
        z = Gr(l, D),
        M = Qo(w),
        [X, Y] = Ho({
          prop: y,
          defaultProp: I ?? null,
          onChange: p,
          caller: Mi,
        }),
        [J, H] = P.useState(!1),
        W = Wo(R),
        ne = Ic(u),
        re = P.useRef(!1),
        [Q, V] = P.useState(0);
      return (
        P.useEffect(() => {
          const L = D.current;
          if (L)
            return (
              L.addEventListener(io, W),
              () => L.removeEventListener(io, W)
            );
        }, [W]),
        b.jsx(kd, {
          scope: u,
          orientation: g,
          dir: M,
          loop: h,
          currentTabStopId: X,
          onItemFocus: P.useCallback((L) => Y(L), [Y]),
          onItemShiftTab: P.useCallback(() => H(!0), []),
          onFocusableItemAdd: P.useCallback(() => V((L) => L + 1), []),
          onFocusableItemRemove: P.useCallback(() => V((L) => L - 1), []),
          children: b.jsx(sr.div, {
            tabIndex: J || Q === 0 ? -1 : 0,
            'data-orientation': g,
            ..._,
            ref: z,
            style: { outline: 'none', ...i.style },
            onMouseDown: mr(i.onMouseDown, () => {
              re.current = !0;
            }),
            onFocus: mr(i.onFocus, (L) => {
              const We = !re.current;
              if (L.target === L.currentTarget && We && !J) {
                const xe = new CustomEvent(io, Bd);
                if ((L.currentTarget.dispatchEvent(xe), !xe.defaultPrevented)) {
                  const se = ne().filter((ie) => ie.focusable),
                    $ = se.find((ie) => ie.active),
                    we = se.find((ie) => ie.id === X),
                    Te = [$, we, ...se]
                      .filter(Boolean)
                      .map((ie) => ie.ref.current);
                  Go(Te, T);
                }
              }
              re.current = !1;
            }),
            onBlur: mr(i.onBlur, () => H(!1)),
          }),
        })
      );
    }, 'RovingFocusGroupImpl'),
  ),
  zd = 'RovingFocusGroupItem',
  Vd = P.forwardRef(
    vn(function (i, l) {
      const {
          __scopeRovingFocusGroup: u,
          focusable: g = !0,
          active: h = !1,
          tabStopId: w,
          children: y,
          ...I
        } = i,
        p = Vo(),
        R = w || p,
        T = Fd(zd, u),
        _ = T.currentTabStopId === R,
        D = Ic(u),
        {
          onFocusableItemAdd: z,
          onFocusableItemRemove: M,
          currentTabStopId: X,
        } = T,
        Y = Od();
      return (
        Yr(() => {
          if (!(!Y || !g)) return (z(), () => M());
        }, [Y, g, z, M]),
        P.useEffect(() => {
          if (!(Y || !g)) return (z(), () => M());
        }, [Y, g, z, M]),
        b.jsx(So.ItemSlot, {
          scope: u,
          id: R,
          focusable: g,
          active: h,
          children: b.jsx(sr.span, {
            tabIndex: _ ? 0 : -1,
            'data-orientation': T.orientation,
            ...I,
            ref: l,
            onMouseDown: mr(i.onMouseDown, (J) => {
              g ? T.onItemFocus(R) : J.preventDefault();
            }),
            onFocus: mr(i.onFocus, () => T.onItemFocus(R)),
            onKeyDown: mr(i.onKeyDown, (J) => {
              if (J.key === 'Tab' && J.shiftKey) {
                T.onItemShiftTab();
                return;
              }
              if (J.target !== J.currentTarget) return;
              const H = Rc(J, T.orientation, T.dir);
              if (H !== void 0) {
                if (J.metaKey || J.ctrlKey || J.altKey || J.shiftKey) return;
                J.preventDefault();
                let ne = D()
                  .filter((re) => re.focusable)
                  .map((re) => re.ref.current);
                if (H === 'last') ne.reverse();
                else if (H === 'prev' || H === 'next') {
                  H === 'prev' && ne.reverse();
                  const re = ne.indexOf(J.currentTarget);
                  ne = T.loop ? vc(ne, re + 1) : ne.slice(re + 1);
                }
                setTimeout(() => Go(ne));
              }
            }),
            children:
              typeof y == 'function'
                ? y({ isCurrentTabStop: _, hasTabStop: X != null })
                : y,
          }),
        })
      );
    }, 'RovingFocusGroupItem'),
  ),
  Wd = {
    ArrowLeft: 'prev',
    ArrowUp: 'prev',
    ArrowRight: 'next',
    ArrowDown: 'next',
    PageUp: 'first',
    Home: 'first',
    PageDown: 'last',
    End: 'last',
  };
function Tc(n, i) {
  return i !== 'rtl'
    ? n
    : n === 'ArrowLeft'
      ? 'ArrowRight'
      : n === 'ArrowRight'
        ? 'ArrowLeft'
        : n;
}
vn(Tc, 'getDirectionAwareKey');
function Rc(n, i, l) {
  const u = Tc(n.key, l);
  if (
    !(i === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(u)) &&
    !(i === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(u))
  )
    return Wd[u];
}
vn(Rc, 'getFocusIntent');
function Go(n, i = !1) {
  const l = document.activeElement;
  for (const u of n)
    if (
      u === l ||
      (u.focus({ preventScroll: i }), document.activeElement !== l)
    )
      return;
}
vn(Go, 'focusFirst');
function vc(n, i) {
  return n.map((l, u) => n[(i + u) % n.length]);
}
vn(vc, 'wrapArray');
var Hd = Ud,
  Qd = Vd,
  Xd = Object.defineProperty,
  Rr = (n, i) => Xd(n, 'name', { value: i, configurable: !0 });
function Nc(n, i) {
  return P.useReducer((l, u) => i[l][u] ?? l, n);
}
Rr(Nc, 'useStateMachine');
var Gd = Rr((n) => {
  const { present: i, children: l } = n,
    u = Mc(i),
    g =
      typeof l == 'function' ? l({ present: u.isPresent }) : P.Children.only(l),
    h = Dc(u.ref, Oc(g));
  return typeof l == 'function' || u.isPresent
    ? P.cloneElement(g, { ref: h })
    : null;
}, 'Presence');
function Mc(n) {
  const [i, l] = P.useState(),
    u = P.useRef(null),
    g = P.useRef(n),
    h = P.useRef('none'),
    w = P.useRef(void 0),
    y = n ? 'mounted' : 'unmounted',
    [I, p] = Nc(y, {
      mounted: { UNMOUNT: 'unmounted', ANIMATION_OUT: 'unmountSuspended' },
      unmountSuspended: { MOUNT: 'mounted', ANIMATION_END: 'unmounted' },
      unmounted: { MOUNT: 'mounted' },
    });
  return (
    P.useEffect(() => {
      I === 'mounted'
        ? ((h.current = w.current ?? zn(u.current)), (w.current = void 0))
        : (h.current = 'none');
    }, [I]),
    Yr(() => {
      const R = u.current,
        T = g.current;
      if (T !== n) {
        const D = h.current,
          z = zn(R);
        (n
          ? ((w.current = z), p('MOUNT'))
          : z === 'none' || (R == null ? void 0 : R.display) === 'none'
            ? p('UNMOUNT')
            : p(T && D !== z ? 'ANIMATION_OUT' : 'UNMOUNT'),
          (g.current = n));
      }
    }, [n, p]),
    Yr(() => {
      if (i) {
        let R;
        const T = i.ownerDocument.defaultView ?? window,
          _ = Rr((z) => {
            const X = zn(u.current).includes(CSS.escape(z.animationName));
            if (z.target === i && X && (p('ANIMATION_END'), !g.current)) {
              const Y = i.style.animationFillMode;
              ((i.style.animationFillMode = 'forwards'),
                (R = T.setTimeout(() => {
                  i.style.animationFillMode === 'forwards' &&
                    (i.style.animationFillMode = Y);
                })));
            }
          }, 'handleAnimationEnd'),
          D = Rr((z) => {
            z.target === i && (h.current = zn(u.current));
          }, 'handleAnimationStart');
        return (
          i.addEventListener('animationstart', D),
          i.addEventListener('animationcancel', _),
          i.addEventListener('animationend', _),
          () => {
            (T.clearTimeout(R),
              i.removeEventListener('animationstart', D),
              i.removeEventListener('animationcancel', _),
              i.removeEventListener('animationend', _));
          }
        );
      } else p('ANIMATION_END');
    }, [i, p]),
    {
      isPresent: ['mounted', 'unmountSuspended'].includes(I),
      ref: P.useCallback((R) => {
        if (R) {
          const T = getComputedStyle(R);
          ((u.current = T), (w.current = zn(T)));
        } else u.current = null;
        l(R);
      }, []),
    }
  );
}
Rr(Mc, 'usePresence');
function To(n, i) {
  if (typeof n == 'function') return n(i);
  n != null && (n.current = i);
}
Rr(To, 'setRef');
function Dc(...n) {
  const i = P.useRef(n);
  return (
    (i.current = n),
    P.useCallback((l) => {
      const u = i.current;
      let g = !1;
      const h = u.map((w) => {
        const y = To(w, l);
        return (!g && typeof y == 'function' && (g = !0), y);
      });
      if (g)
        return () => {
          for (let w = 0; w < h.length; w++) {
            const y = h[w];
            typeof y == 'function' ? y() : To(u[w], null);
          }
        };
    }, [])
  );
}
Rr(Dc, 'useStableComposedRefs');
function zn(n) {
  return (n == null ? void 0 : n.animationName) || 'none';
}
Rr(zn, 'getAnimationName');
function Oc(n) {
  var u, g;
  let i =
      (u = Object.getOwnPropertyDescriptor(n.props, 'ref')) == null
        ? void 0
        : u.get,
    l = i && 'isReactWarning' in i && i.isReactWarning;
  return l
    ? n.ref
    : ((i =
        (g = Object.getOwnPropertyDescriptor(n, 'ref')) == null
          ? void 0
          : g.get),
      (l = i && 'isReactWarning' in i && i.isReactWarning),
      l ? n.props.ref : n.props.ref || n.ref);
}
Rr(Oc, 'getElementRef');
var Yd = Object.defineProperty,
  is = (n, i) => Yd(n, 'name', { value: i, configurable: !0 }),
  Yo = 'Tabs',
  [Kd, vh] = ss(Yo, [Sc]),
  Pc = Sc(),
  [Jd, Ko] = Kd(Yo),
  qd = P.forwardRef(
    is(function (i, l) {
      const {
          __scopeTabs: u,
          value: g,
          onValueChange: h,
          defaultValue: w,
          orientation: y = 'horizontal',
          dir: I,
          activationMode: p = 'automatic',
          ...R
        } = i,
        T = Qo(I),
        [_, D] = Ho({ prop: g, onChange: h, defaultProp: w ?? '', caller: Yo });
      return b.jsx(Jd, {
        scope: u,
        baseId: Vo(),
        value: _,
        onValueChange: D,
        orientation: y,
        dir: T,
        activationMode: p,
        children: b.jsx(sr.div, {
          dir: T,
          'data-orientation': y,
          ...R,
          ref: l,
        }),
      });
    }, 'Tabs'),
  ),
  Zd = 'TabsList',
  $d = P.forwardRef(
    is(function (i, l) {
      const { __scopeTabs: u, loop: g = !0, ...h } = i,
        w = Ko(Zd, u),
        y = Pc(u);
      return b.jsx(Hd, {
        asChild: !0,
        ...y,
        orientation: w.orientation,
        dir: w.dir,
        loop: g,
        children: b.jsx(sr.div, {
          role: 'tablist',
          'aria-orientation': w.orientation,
          ...h,
          ref: l,
        }),
      });
    }, 'TabsList'),
  ),
  ef = 'TabsTrigger',
  tf = P.forwardRef(
    is(function (i, l) {
      const { __scopeTabs: u, value: g, disabled: h = !1, ...w } = i,
        y = Ko(ef, u),
        I = Pc(u),
        p = Jo(y.baseId, g),
        R = qo(y.baseId, g),
        T = g === y.value;
      return b.jsx(Qd, {
        asChild: !0,
        ...I,
        focusable: !h,
        active: T,
        children: b.jsx(sr.button, {
          type: 'button',
          role: 'tab',
          'aria-selected': T,
          'aria-controls': R,
          'data-state': T ? 'active' : 'inactive',
          'data-disabled': h ? '' : void 0,
          disabled: h,
          id: p,
          ...w,
          ref: l,
          onMouseDown: mr(i.onMouseDown, (_) => {
            !h && _.button === 0 && _.ctrlKey === !1
              ? y.onValueChange(g)
              : _.preventDefault();
          }),
          onKeyDown: mr(i.onKeyDown, (_) => {
            h ||
              _.target !== _.currentTarget ||
              ([' ', 'Enter'].includes(_.key) && y.onValueChange(g));
          }),
          onFocus: mr(i.onFocus, () => {
            const _ = y.activationMode !== 'manual';
            !T && !h && _ && y.onValueChange(g);
          }),
        }),
      });
    }, 'TabsTrigger'),
  ),
  rf = 'TabsContent',
  nf = P.forwardRef(
    is(function (i, l) {
      const { __scopeTabs: u, value: g, forceMount: h, children: w, ...y } = i,
        I = Ko(rf, u),
        p = Jo(I.baseId, g),
        R = qo(I.baseId, g),
        T = g === I.value,
        _ = P.useRef(T);
      return (
        P.useEffect(() => {
          const D = requestAnimationFrame(() => (_.current = !1));
          return () => cancelAnimationFrame(D);
        }, []),
        b.jsx(Gd, {
          present: h || T,
          children: ({ present: D }) =>
            b.jsx(sr.div, {
              'data-state': T ? 'active' : 'inactive',
              'data-orientation': I.orientation,
              role: 'tabpanel',
              'aria-labelledby': p,
              hidden: !D,
              id: R,
              tabIndex: 0,
              ...y,
              ref: l,
              style: {
                ...i.style,
                animationDuration: _.current ? '0s' : void 0,
              },
              children: D && w,
            }),
        })
      );
    }, 'TabsContent'),
  );
function Jo(n, i) {
  return `${n}-trigger-${i}`;
}
is(Jo, 'makeTriggerId');
function qo(n, i) {
  return `${n}-content-${i}`;
}
is(qo, 'makeContentId');
var sf = qd,
  of = $d,
  af = tf,
  lf = nf;
function cf({ className: n, ...i }) {
  return b.jsx(sf, {
    'data-slot': 'tabs',
    className: yt('flex flex-col gap-2', n),
    ...i,
  });
}
function uf({ className: n, ...i }) {
  return b.jsx(of, {
    'data-slot': 'tabs-list',
    className: yt(
      'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
      n,
    ),
    ...i,
  });
}
function df({ className: n, ...i }) {
  return b.jsx(af, {
    'data-slot': 'tabs-trigger',
    className: yt(
      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
      n,
    ),
    ...i,
  });
}
function jn({ className: n, ...i }) {
  return b.jsx(lf, {
    'data-slot': 'tabs-content',
    className: yt('flex-1 outline-none', n),
    ...i,
  });
}
var ff = Object.defineProperty,
  Bc = (n, i) => ff(n, 'name', { value: i, configurable: !0 }),
  qa = 'horizontal',
  hf = ['horizontal', 'vertical'],
  gf = P.forwardRef(
    Bc(function (i, l) {
      const { decorative: u, orientation: g = qa, ...h } = i,
        w = _c(g) ? g : qa,
        I = u
          ? { role: 'none' }
          : {
              'aria-orientation': w === 'vertical' ? w : void 0,
              role: 'separator',
            };
      return b.jsx(sr.div, { 'data-orientation': w, ...I, ...h, ref: l });
    }, 'Separator'),
  );
function _c(n) {
  return hf.includes(n);
}
Bc(_c, 'isValidOrientation');
var xf = gf;
function Ys({
  className: n,
  orientation: i = 'horizontal',
  decorative: l = !0,
  ...u
}) {
  return b.jsx(xf, {
    'data-slot': 'separator',
    decorative: l,
    orientation: i,
    className: yt(
      'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
      n,
    ),
    ...u,
  });
}
const Af = Do(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/20 bg-warning/10 text-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
function Lc({ className: n, variant: i, ...l }) {
  return b.jsx('span', {
    'data-slot': 'badge',
    className: yt(Af({ variant: i }), n),
    ...l,
  });
}
var mf = Object.defineProperty,
  vr = (n, i) => mf(n, 'name', { value: i, configurable: !0 }),
  kc = 'Avatar',
  [pf, Nh] = ss(kc),
  wf = [0, () => {}],
  [Cf, Fc] = pf(kc),
  yf = P.forwardRef(
    vr(function (i, l) {
      const { __scopeAvatar: u, ...g } = i,
        [h, w] = P.useState('idle'),
        [y, I] = jc();
      return b.jsx(Cf, {
        scope: u,
        imageLoadingStatus: h,
        setImageLoadingStatus: w,
        imageCount: y,
        setImageCount: I,
        children: b.jsx(sr.span, { ...g, ref: l }),
      });
    }, 'Avatar'),
  ),
  Ef = 'AvatarImage',
  bf = P.forwardRef(
    vr(function (i, l) {
      const { __scopeAvatar: u, src: g, onLoadingStatusChange: h, ...w } = i,
        y = Fc(Ef, u);
      y.setImageCount;
      const I = Uc(g, {
          referrerPolicy: w.referrerPolicy,
          crossOrigin: w.crossOrigin,
          loadingStatus: y.imageLoadingStatus,
          setLoadingStatus: y.setImageLoadingStatus,
        }),
        p = Wo((T) => {
          h == null || h(T);
        }),
        R = P.useRef(I);
      return (
        Yr(() => {
          const T = R.current;
          ((R.current = I), I !== T && p(I));
        }, [I, p]),
        I === 'loaded' ? b.jsx(sr.img, { ...w, ref: l, src: g }) : null
      );
    }, 'AvatarImage'),
  ),
  If = 'AvatarFallback',
  Sf = P.forwardRef(
    vr(function (i, l) {
      const { __scopeAvatar: u, delayMs: g, ...h } = i,
        w = Fc(If, u),
        [y, I] = P.useState(g === void 0);
      return (
        P.useEffect(() => {
          if (g !== void 0) {
            const p = window.setTimeout(() => I(!0), g);
            return () => window.clearTimeout(p);
          }
        }, [g]),
        y && w.imageLoadingStatus !== 'loaded'
          ? b.jsx(sr.span, { ...h, ref: l })
          : null
      );
    }, 'AvatarFallback'),
  );
function Uc(
  n,
  { loadingStatus: i, setLoadingStatus: l, referrerPolicy: u, crossOrigin: g },
) {
  return (
    Yr(() => {
      if (!n) {
        l('error');
        return;
      }
      const h = new window.Image(),
        w = vr((I) => {
          const p = I.currentTarget;
          l(Ro(p));
        }, 'handleLoad'),
        y = vr(() => l('error'), 'handleError');
      return (
        h.addEventListener('load', w),
        h.addEventListener('error', y),
        u && (h.referrerPolicy = u),
        (h.crossOrigin = g ?? null),
        (h.src = n),
        l(Ro(h)),
        () => {
          (h.removeEventListener('load', w),
            h.removeEventListener('error', y),
            l('idle'));
        }
      );
    }, [n, g, u, l]),
    i
  );
}
vr(Uc, 'useImageLoadingStatus');
function Ro(n) {
  return n.complete ? (n.naturalWidth > 0 ? 'loaded' : 'error') : 'loading';
}
vr(Ro, 'getImageLoadingStatus');
function jc() {
  return wf;
}
vr(jc, 'useImageCount');
function Tf(n) {}
vr(Tf, 'useUpdateImageCount');
function Rf({ className: n, ...i }) {
  return b.jsx(yf, {
    'data-slot': 'avatar',
    className: yt(
      'relative flex size-8 shrink-0 overflow-hidden rounded-full',
      n,
    ),
    ...i,
  });
}
function vf({ className: n, ...i }) {
  return b.jsx(bf, {
    'data-slot': 'avatar-image',
    className: yt('aspect-square size-full', n),
    ...i,
  });
}
function Nf({ className: n, ...i }) {
  return b.jsx(Sf, {
    'data-slot': 'avatar-fallback',
    className: yt(
      'bg-muted flex size-full items-center justify-center rounded-full',
      n,
    ),
    ...i,
  });
}
const Mf = Do(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        success:
          'text-success bg-card border-success/20 [&>svg]:text-current *:data-[slot=alert-description]:text-success/90',
        warning:
          'text-warning bg-card border-warning/20 [&>svg]:text-current *:data-[slot=alert-description]:text-warning/90',
        info: 'text-blue-500 bg-card border-blue-500/20 [&>svg]:text-current *:data-[slot=alert-description]:text-blue-500/90',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
function Df({ className: n, variant: i, ...l }) {
  return b.jsx('div', {
    'data-slot': 'alert',
    role: 'alert',
    className: yt(Mf({ variant: i }), n),
    ...l,
  });
}
function Of({ className: n, ...i }) {
  return b.jsx('div', {
    'data-slot': 'alert-title',
    className: yt(
      'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
      n,
    ),
    ...i,
  });
}
function Nn({ type: n, message: i, className: l }) {
  const u =
      n === 'error' ? 'destructive' : n === 'success' ? 'success' : 'info',
    g = n === 'error' ? bl : n === 'success' ? F1 : V1;
  return b.jsxs(Df, {
    variant: u,
    className: l,
    children: [b.jsx(g, { className: 'size-4' }), b.jsx(Of, { children: i })],
  });
}
function ps({ label: n, value: i, valueClassName: l }) {
  return b.jsxs('div', {
    className: 'flex justify-between items-center py-2',
    children: [
      b.jsx('span', {
        className:
          'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
        children: n,
      }),
      b.jsx('span', {
        className: `font-mono text-[13px] font-semibold text-right max-w-[65%] truncate ${l || ''}`,
        children: i,
      }),
    ],
  });
}
function Pf({ network: n }) {
  return b.jsxs(Lc, {
    variant: 'outline',
    className: `mt-4 gap-1.5 py-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider ${n === 'mainnet' ? 'border-(--success)/20 text-success bg-(--success)/10' : 'border-(--warning)/20 text-warning bg-(--warning)/10'}`,
    children: [
      b.jsx('span', {
        className: 'size-1.5 rounded-full',
        style: {
          background: n === 'mainnet' ? 'var(--success)' : 'var(--warning)',
        },
      }),
      n === 'mainnet' ? 'Mainnet' : 'Testnet',
    ],
  });
}
var ce;
(function (n) {
  ((n[(n.QR_CODE = 0)] = 'QR_CODE'),
    (n[(n.AZTEC = 1)] = 'AZTEC'),
    (n[(n.CODABAR = 2)] = 'CODABAR'),
    (n[(n.CODE_39 = 3)] = 'CODE_39'),
    (n[(n.CODE_93 = 4)] = 'CODE_93'),
    (n[(n.CODE_128 = 5)] = 'CODE_128'),
    (n[(n.DATA_MATRIX = 6)] = 'DATA_MATRIX'),
    (n[(n.MAXICODE = 7)] = 'MAXICODE'),
    (n[(n.ITF = 8)] = 'ITF'),
    (n[(n.EAN_13 = 9)] = 'EAN_13'),
    (n[(n.EAN_8 = 10)] = 'EAN_8'),
    (n[(n.PDF_417 = 11)] = 'PDF_417'),
    (n[(n.RSS_14 = 12)] = 'RSS_14'),
    (n[(n.RSS_EXPANDED = 13)] = 'RSS_EXPANDED'),
    (n[(n.UPC_A = 14)] = 'UPC_A'),
    (n[(n.UPC_E = 15)] = 'UPC_E'),
    (n[(n.UPC_EAN_EXTENSION = 16)] = 'UPC_EAN_EXTENSION'));
})(ce || (ce = {}));
var Za = new Map([
    [ce.QR_CODE, 'QR_CODE'],
    [ce.AZTEC, 'AZTEC'],
    [ce.CODABAR, 'CODABAR'],
    [ce.CODE_39, 'CODE_39'],
    [ce.CODE_93, 'CODE_93'],
    [ce.CODE_128, 'CODE_128'],
    [ce.DATA_MATRIX, 'DATA_MATRIX'],
    [ce.MAXICODE, 'MAXICODE'],
    [ce.ITF, 'ITF'],
    [ce.EAN_13, 'EAN_13'],
    [ce.EAN_8, 'EAN_8'],
    [ce.PDF_417, 'PDF_417'],
    [ce.RSS_14, 'RSS_14'],
    [ce.RSS_EXPANDED, 'RSS_EXPANDED'],
    [ce.UPC_A, 'UPC_A'],
    [ce.UPC_E, 'UPC_E'],
    [ce.UPC_EAN_EXTENSION, 'UPC_EAN_EXTENSION'],
  ]),
  $a;
(function (n) {
  ((n[(n.UNKNOWN = 0)] = 'UNKNOWN'), (n[(n.URL = 1)] = 'URL'));
})($a || ($a = {}));
function Bf(n) {
  return Object.values(ce).includes(n);
}
var Si;
(function (n) {
  ((n[(n.SCAN_TYPE_CAMERA = 0)] = 'SCAN_TYPE_CAMERA'),
    (n[(n.SCAN_TYPE_FILE = 1)] = 'SCAN_TYPE_FILE'));
})(Si || (Si = {}));
var _f = (function () {
    function n() {}
    return (
      (n.GITHUB_PROJECT_URL = 'https://github.com/mebjas/html5-qrcode'),
      (n.SCAN_DEFAULT_FPS = 2),
      (n.DEFAULT_DISABLE_FLIP = !1),
      (n.DEFAULT_REMEMBER_LAST_CAMERA_USED = !0),
      (n.DEFAULT_SUPPORTED_SCAN_TYPE = [
        Si.SCAN_TYPE_CAMERA,
        Si.SCAN_TYPE_FILE,
      ]),
      n
    );
  })(),
  zc = (function () {
    function n(i, l) {
      ((this.format = i), (this.formatName = l));
    }
    return (
      (n.prototype.toString = function () {
        return this.formatName;
      }),
      (n.create = function (i) {
        if (!Za.has(i))
          throw ''.concat(i, ' not in html5QrcodeSupportedFormatsTextMap');
        return new n(i, Za.get(i));
      }),
      n
    );
  })(),
  el = (function () {
    function n() {}
    return (
      (n.createFromText = function (i) {
        var l = { text: i };
        return { decodedText: i, result: l };
      }),
      (n.createFromQrcodeResult = function (i) {
        return { decodedText: i.text, result: i };
      }),
      n
    );
  })(),
  vo;
(function (n) {
  ((n[(n.UNKWOWN_ERROR = 0)] = 'UNKWOWN_ERROR'),
    (n[(n.IMPLEMENTATION_ERROR = 1)] = 'IMPLEMENTATION_ERROR'),
    (n[(n.NO_CODE_FOUND_ERROR = 2)] = 'NO_CODE_FOUND_ERROR'));
})(vo || (vo = {}));
var Lf = (function () {
    function n() {}
    return (
      (n.createFrom = function (i) {
        return { errorMessage: i, type: vo.UNKWOWN_ERROR };
      }),
      n
    );
  })(),
  kf = (function () {
    function n(i) {
      this.verbose = i;
    }
    return (
      (n.prototype.log = function (i) {
        this.verbose && console.log(i);
      }),
      (n.prototype.warn = function (i) {
        this.verbose && console.warn(i);
      }),
      (n.prototype.logError = function (i, l) {
        (this.verbose || l === !0) && console.error(i);
      }),
      (n.prototype.logErrors = function (i) {
        if (i.length === 0) throw 'Logger#logError called without arguments';
        this.verbose && console.error(i);
      }),
      n
    );
  })();
function Sr(n) {
  return typeof n > 'u' || n === null;
}
var Vn = (function () {
    function n() {}
    return (
      (n.codeParseError = function (i) {
        return 'QR code parse error, error = '.concat(i);
      }),
      (n.errorGettingUserMedia = function (i) {
        return 'Error getting userMedia, error = '.concat(i);
      }),
      (n.onlyDeviceSupportedError = function () {
        return "The device doesn't support navigator.mediaDevices , only supported cameraIdOrConfig in this case is deviceId parameter (string).";
      }),
      (n.cameraStreamingNotSupported = function () {
        return 'Camera streaming not supported by the browser.';
      }),
      (n.unableToQuerySupportedDevices = function () {
        return 'Unable to query supported devices, unknown error.';
      }),
      (n.insecureContextCameraQueryError = function () {
        return 'Camera access is only supported in secure context like https or localhost.';
      }),
      (n.scannerPaused = function () {
        return 'Scanner paused';
      }),
      n
    );
  })(),
  Vc = (function () {
    function n() {}
    return (
      (n.isMediaStreamConstraintsValid = function (i, l) {
        if (typeof i != 'object') {
          var u = typeof i;
          return (
            l.logError(
              'videoConstraints should be of type object, the ' +
                'object passed is of type '.concat(u, '.'),
              !0,
            ),
            !1
          );
        }
        for (
          var g = [
              'autoGainControl',
              'channelCount',
              'echoCancellation',
              'latency',
              'noiseSuppression',
              'sampleRate',
              'sampleSize',
              'volume',
            ],
            h = new Set(g),
            w = Object.keys(i),
            y = 0,
            I = w;
          y < I.length;
          y++
        ) {
          var p = I[y];
          if (h.has(p))
            return (
              l.logError(
                ''.concat(p, ' is not supported videoConstaints.'),
                !0,
              ),
              !1
            );
        }
        return !0;
      }),
      n
    );
  })(),
  Qs = { exports: {} },
  Ff = Qs.exports,
  tl;
function Uf() {
  return (
    tl ||
      ((tl = 1),
      (function (n, i) {
        (function (l, u) {
          u(i);
        })(Ff, function (l) {
          function u(A) {
            return A == null;
          }
          var g =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (A, e) {
                A.__proto__ = e;
              }) ||
            function (A, e) {
              for (var t in e) e.hasOwnProperty(t) && (A[t] = e[t]);
            };
          function h(A, e) {
            g(A, e);
            function t() {
              this.constructor = A;
            }
            A.prototype =
              e === null
                ? Object.create(e)
                : ((t.prototype = e.prototype), new t());
          }
          function w(A, e) {
            var t = Object.setPrototypeOf;
            t ? t(A, e) : (A.__proto__ = e);
          }
          function y(A, e) {
            e === void 0 && (e = A.constructor);
            var t = Error.captureStackTrace;
            t && t(A, e);
          }
          var I = (function (A) {
            h(e, A);
            function e(t) {
              var r = this.constructor,
                s = A.call(this, t) || this;
              return (
                Object.defineProperty(s, 'name', {
                  value: r.name,
                  enumerable: !1,
                }),
                w(s, r.prototype),
                y(s),
                s
              );
            }
            return e;
          })(Error);
          class p extends I {
            constructor(e = void 0) {
              (super(e), (this.message = e));
            }
            getKind() {
              return this.constructor.kind;
            }
          }
          p.kind = 'Exception';
          class R extends p {}
          R.kind = 'ArgumentException';
          class T extends p {}
          T.kind = 'IllegalArgumentException';
          class _ {
            constructor(e) {
              if (((this.binarizer = e), e === null))
                throw new T('Binarizer must be non-null.');
            }
            getWidth() {
              return this.binarizer.getWidth();
            }
            getHeight() {
              return this.binarizer.getHeight();
            }
            getBlackRow(e, t) {
              return this.binarizer.getBlackRow(e, t);
            }
            getBlackMatrix() {
              return (
                (this.matrix === null || this.matrix === void 0) &&
                  (this.matrix = this.binarizer.getBlackMatrix()),
                this.matrix
              );
            }
            isCropSupported() {
              return this.binarizer.getLuminanceSource().isCropSupported();
            }
            crop(e, t, r, s) {
              const o = this.binarizer.getLuminanceSource().crop(e, t, r, s);
              return new _(this.binarizer.createBinarizer(o));
            }
            isRotateSupported() {
              return this.binarizer.getLuminanceSource().isRotateSupported();
            }
            rotateCounterClockwise() {
              const e = this.binarizer
                .getLuminanceSource()
                .rotateCounterClockwise();
              return new _(this.binarizer.createBinarizer(e));
            }
            rotateCounterClockwise45() {
              const e = this.binarizer
                .getLuminanceSource()
                .rotateCounterClockwise45();
              return new _(this.binarizer.createBinarizer(e));
            }
            toString() {
              try {
                return this.getBlackMatrix().toString();
              } catch {
                return '';
              }
            }
          }
          class D extends p {
            static getChecksumInstance() {
              return new D();
            }
          }
          D.kind = 'ChecksumException';
          class z {
            constructor(e) {
              this.source = e;
            }
            getLuminanceSource() {
              return this.source;
            }
            getWidth() {
              return this.source.getWidth();
            }
            getHeight() {
              return this.source.getHeight();
            }
          }
          class M {
            static arraycopy(e, t, r, s, o) {
              for (; o--;) r[s++] = e[t++];
            }
            static currentTimeMillis() {
              return Date.now();
            }
          }
          class X extends p {}
          X.kind = 'IndexOutOfBoundsException';
          class Y extends X {
            constructor(e = void 0, t = void 0) {
              (super(t), (this.index = e), (this.message = t));
            }
          }
          Y.kind = 'ArrayIndexOutOfBoundsException';
          class J {
            static fill(e, t) {
              for (let r = 0, s = e.length; r < s; r++) e[r] = t;
            }
            static fillWithin(e, t, r, s) {
              J.rangeCheck(e.length, t, r);
              for (let o = t; o < r; o++) e[o] = s;
            }
            static rangeCheck(e, t, r) {
              if (t > r)
                throw new T('fromIndex(' + t + ') > toIndex(' + r + ')');
              if (t < 0) throw new Y(t);
              if (r > e) throw new Y(r);
            }
            static asList(...e) {
              return e;
            }
            static create(e, t, r) {
              return Array.from({ length: e }).map((o) =>
                Array.from({ length: t }).fill(r),
              );
            }
            static createInt32Array(e, t, r) {
              return Array.from({ length: e }).map((o) =>
                Int32Array.from({ length: t }).fill(r),
              );
            }
            static equals(e, t) {
              if (!e || !t || !e.length || !t.length || e.length !== t.length)
                return !1;
              for (let r = 0, s = e.length; r < s; r++)
                if (e[r] !== t[r]) return !1;
              return !0;
            }
            static hashCode(e) {
              if (e === null) return 0;
              let t = 1;
              for (const r of e) t = 31 * t + r;
              return t;
            }
            static fillUint8Array(e, t) {
              for (let r = 0; r !== e.length; r++) e[r] = t;
            }
            static copyOf(e, t) {
              return e.slice(0, t);
            }
            static copyOfUint8Array(e, t) {
              if (e.length <= t) {
                const r = new Uint8Array(t);
                return (r.set(e), r);
              }
              return e.slice(0, t);
            }
            static copyOfRange(e, t, r) {
              const s = r - t,
                o = new Int32Array(s);
              return (M.arraycopy(e, t, o, 0, s), o);
            }
            static binarySearch(e, t, r) {
              r === void 0 && (r = J.numberComparator);
              let s = 0,
                o = e.length - 1;
              for (; s <= o;) {
                const a = (o + s) >> 1,
                  c = r(t, e[a]);
                if (c > 0) s = a + 1;
                else if (c < 0) o = a - 1;
                else return a;
              }
              return -s - 1;
            }
            static numberComparator(e, t) {
              return e - t;
            }
          }
          class H {
            static numberOfTrailingZeros(e) {
              let t;
              if (e === 0) return 32;
              let r = 31;
              return (
                (t = e << 16),
                t !== 0 && ((r -= 16), (e = t)),
                (t = e << 8),
                t !== 0 && ((r -= 8), (e = t)),
                (t = e << 4),
                t !== 0 && ((r -= 4), (e = t)),
                (t = e << 2),
                t !== 0 && ((r -= 2), (e = t)),
                r - ((e << 1) >>> 31)
              );
            }
            static numberOfLeadingZeros(e) {
              if (e === 0) return 32;
              let t = 1;
              return (
                e >>> 16 || ((t += 16), (e <<= 16)),
                e >>> 24 || ((t += 8), (e <<= 8)),
                e >>> 28 || ((t += 4), (e <<= 4)),
                e >>> 30 || ((t += 2), (e <<= 2)),
                (t -= e >>> 31),
                t
              );
            }
            static toHexString(e) {
              return e.toString(16);
            }
            static toBinaryString(e) {
              return String(parseInt(String(e), 2));
            }
            static bitCount(e) {
              return (
                (e = e - ((e >>> 1) & 1431655765)),
                (e = (e & 858993459) + ((e >>> 2) & 858993459)),
                (e = (e + (e >>> 4)) & 252645135),
                (e = e + (e >>> 8)),
                (e = e + (e >>> 16)),
                e & 63
              );
            }
            static truncDivision(e, t) {
              return Math.trunc(e / t);
            }
            static parseInt(e, t = void 0) {
              return parseInt(e, t);
            }
          }
          ((H.MIN_VALUE_32_BITS = -2147483648),
            (H.MAX_VALUE = Number.MAX_SAFE_INTEGER));
          class W {
            constructor(e, t) {
              e === void 0
                ? ((this.size = 0), (this.bits = new Int32Array(1)))
                : ((this.size = e),
                  t == null ? (this.bits = W.makeArray(e)) : (this.bits = t));
            }
            getSize() {
              return this.size;
            }
            getSizeInBytes() {
              return Math.floor((this.size + 7) / 8);
            }
            ensureCapacity(e) {
              if (e > this.bits.length * 32) {
                const t = W.makeArray(e);
                (M.arraycopy(this.bits, 0, t, 0, this.bits.length),
                  (this.bits = t));
              }
            }
            get(e) {
              return (this.bits[Math.floor(e / 32)] & (1 << (e & 31))) !== 0;
            }
            set(e) {
              this.bits[Math.floor(e / 32)] |= 1 << (e & 31);
            }
            flip(e) {
              this.bits[Math.floor(e / 32)] ^= 1 << (e & 31);
            }
            getNextSet(e) {
              const t = this.size;
              if (e >= t) return t;
              const r = this.bits;
              let s = Math.floor(e / 32),
                o = r[s];
              o &= ~((1 << (e & 31)) - 1);
              const a = r.length;
              for (; o === 0;) {
                if (++s === a) return t;
                o = r[s];
              }
              const c = s * 32 + H.numberOfTrailingZeros(o);
              return c > t ? t : c;
            }
            getNextUnset(e) {
              const t = this.size;
              if (e >= t) return t;
              const r = this.bits;
              let s = Math.floor(e / 32),
                o = ~r[s];
              o &= ~((1 << (e & 31)) - 1);
              const a = r.length;
              for (; o === 0;) {
                if (++s === a) return t;
                o = ~r[s];
              }
              const c = s * 32 + H.numberOfTrailingZeros(o);
              return c > t ? t : c;
            }
            setBulk(e, t) {
              this.bits[Math.floor(e / 32)] = t;
            }
            setRange(e, t) {
              if (t < e || e < 0 || t > this.size) throw new T();
              if (t === e) return;
              t--;
              const r = Math.floor(e / 32),
                s = Math.floor(t / 32),
                o = this.bits;
              for (let a = r; a <= s; a++) {
                const c = a > r ? 0 : e & 31,
                  f = (2 << (a < s ? 31 : t & 31)) - (1 << c);
                o[a] |= f;
              }
            }
            clear() {
              const e = this.bits.length,
                t = this.bits;
              for (let r = 0; r < e; r++) t[r] = 0;
            }
            isRange(e, t, r) {
              if (t < e || e < 0 || t > this.size) throw new T();
              if (t === e) return !0;
              t--;
              const s = Math.floor(e / 32),
                o = Math.floor(t / 32),
                a = this.bits;
              for (let c = s; c <= o; c++) {
                const d = c > s ? 0 : e & 31,
                  x = ((2 << (c < o ? 31 : t & 31)) - (1 << d)) & 4294967295;
                if ((a[c] & x) !== (r ? x : 0)) return !1;
              }
              return !0;
            }
            appendBit(e) {
              (this.ensureCapacity(this.size + 1),
                e &&
                  (this.bits[Math.floor(this.size / 32)] |=
                    1 << (this.size & 31)),
                this.size++);
            }
            appendBits(e, t) {
              if (t < 0 || t > 32)
                throw new T('Num bits must be between 0 and 32');
              this.ensureCapacity(this.size + t);
              for (let r = t; r > 0; r--)
                this.appendBit(((e >> (r - 1)) & 1) === 1);
            }
            appendBitArray(e) {
              const t = e.size;
              this.ensureCapacity(this.size + t);
              for (let r = 0; r < t; r++) this.appendBit(e.get(r));
            }
            xor(e) {
              if (this.size !== e.size) throw new T("Sizes don't match");
              const t = this.bits;
              for (let r = 0, s = t.length; r < s; r++) t[r] ^= e.bits[r];
            }
            toBytes(e, t, r, s) {
              for (let o = 0; o < s; o++) {
                let a = 0;
                for (let c = 0; c < 8; c++)
                  (this.get(e) && (a |= 1 << (7 - c)), e++);
                t[r + o] = a;
              }
            }
            getBitArray() {
              return this.bits;
            }
            reverse() {
              const e = new Int32Array(this.bits.length),
                t = Math.floor((this.size - 1) / 32),
                r = t + 1,
                s = this.bits;
              for (let o = 0; o < r; o++) {
                let a = s[o];
                ((a = ((a >> 1) & 1431655765) | ((a & 1431655765) << 1)),
                  (a = ((a >> 2) & 858993459) | ((a & 858993459) << 2)),
                  (a = ((a >> 4) & 252645135) | ((a & 252645135) << 4)),
                  (a = ((a >> 8) & 16711935) | ((a & 16711935) << 8)),
                  (a = ((a >> 16) & 65535) | ((a & 65535) << 16)),
                  (e[t - o] = a));
              }
              if (this.size !== r * 32) {
                const o = r * 32 - this.size;
                let a = e[0] >>> o;
                for (let c = 1; c < r; c++) {
                  const d = e[c];
                  ((a |= d << (32 - o)), (e[c - 1] = a), (a = d >>> o));
                }
                e[r - 1] = a;
              }
              this.bits = e;
            }
            static makeArray(e) {
              return new Int32Array(Math.floor((e + 31) / 32));
            }
            equals(e) {
              if (!(e instanceof W)) return !1;
              const t = e;
              return this.size === t.size && J.equals(this.bits, t.bits);
            }
            hashCode() {
              return 31 * this.size + J.hashCode(this.bits);
            }
            toString() {
              let e = '';
              for (let t = 0, r = this.size; t < r; t++)
                ((t & 7) === 0 && (e += ' '), (e += this.get(t) ? 'X' : '.'));
              return e;
            }
            clone() {
              return new W(this.size, this.bits.slice());
            }
          }
          var ne;
          (function (A) {
            ((A[(A.OTHER = 0)] = 'OTHER'),
              (A[(A.PURE_BARCODE = 1)] = 'PURE_BARCODE'),
              (A[(A.POSSIBLE_FORMATS = 2)] = 'POSSIBLE_FORMATS'),
              (A[(A.TRY_HARDER = 3)] = 'TRY_HARDER'),
              (A[(A.CHARACTER_SET = 4)] = 'CHARACTER_SET'),
              (A[(A.ALLOWED_LENGTHS = 5)] = 'ALLOWED_LENGTHS'),
              (A[(A.ASSUME_CODE_39_CHECK_DIGIT = 6)] =
                'ASSUME_CODE_39_CHECK_DIGIT'),
              (A[(A.ASSUME_GS1 = 7)] = 'ASSUME_GS1'),
              (A[(A.RETURN_CODABAR_START_END = 8)] =
                'RETURN_CODABAR_START_END'),
              (A[(A.NEED_RESULT_POINT_CALLBACK = 9)] =
                'NEED_RESULT_POINT_CALLBACK'),
              (A[(A.ALLOWED_EAN_EXTENSIONS = 10)] = 'ALLOWED_EAN_EXTENSIONS'));
          })(ne || (ne = {}));
          var re = ne;
          class Q extends p {
            static getFormatInstance() {
              return new Q();
            }
          }
          Q.kind = 'FormatException';
          var V;
          (function (A) {
            ((A[(A.Cp437 = 0)] = 'Cp437'),
              (A[(A.ISO8859_1 = 1)] = 'ISO8859_1'),
              (A[(A.ISO8859_2 = 2)] = 'ISO8859_2'),
              (A[(A.ISO8859_3 = 3)] = 'ISO8859_3'),
              (A[(A.ISO8859_4 = 4)] = 'ISO8859_4'),
              (A[(A.ISO8859_5 = 5)] = 'ISO8859_5'),
              (A[(A.ISO8859_6 = 6)] = 'ISO8859_6'),
              (A[(A.ISO8859_7 = 7)] = 'ISO8859_7'),
              (A[(A.ISO8859_8 = 8)] = 'ISO8859_8'),
              (A[(A.ISO8859_9 = 9)] = 'ISO8859_9'),
              (A[(A.ISO8859_10 = 10)] = 'ISO8859_10'),
              (A[(A.ISO8859_11 = 11)] = 'ISO8859_11'),
              (A[(A.ISO8859_13 = 12)] = 'ISO8859_13'),
              (A[(A.ISO8859_14 = 13)] = 'ISO8859_14'),
              (A[(A.ISO8859_15 = 14)] = 'ISO8859_15'),
              (A[(A.ISO8859_16 = 15)] = 'ISO8859_16'),
              (A[(A.SJIS = 16)] = 'SJIS'),
              (A[(A.Cp1250 = 17)] = 'Cp1250'),
              (A[(A.Cp1251 = 18)] = 'Cp1251'),
              (A[(A.Cp1252 = 19)] = 'Cp1252'),
              (A[(A.Cp1256 = 20)] = 'Cp1256'),
              (A[(A.UnicodeBigUnmarked = 21)] = 'UnicodeBigUnmarked'),
              (A[(A.UTF8 = 22)] = 'UTF8'),
              (A[(A.ASCII = 23)] = 'ASCII'),
              (A[(A.Big5 = 24)] = 'Big5'),
              (A[(A.GB18030 = 25)] = 'GB18030'),
              (A[(A.EUC_KR = 26)] = 'EUC_KR'));
          })(V || (V = {}));
          class L {
            constructor(e, t, r, ...s) {
              ((this.valueIdentifier = e),
                (this.name = r),
                typeof t == 'number'
                  ? (this.values = Int32Array.from([t]))
                  : (this.values = t),
                (this.otherEncodingNames = s),
                L.VALUE_IDENTIFIER_TO_ECI.set(e, this),
                L.NAME_TO_ECI.set(r, this));
              const o = this.values;
              for (let a = 0, c = o.length; a !== c; a++) {
                const d = o[a];
                L.VALUES_TO_ECI.set(d, this);
              }
              for (const a of s) L.NAME_TO_ECI.set(a, this);
            }
            getValueIdentifier() {
              return this.valueIdentifier;
            }
            getName() {
              return this.name;
            }
            getValue() {
              return this.values[0];
            }
            static getCharacterSetECIByValue(e) {
              if (e < 0 || e >= 900) throw new Q('incorect value');
              const t = L.VALUES_TO_ECI.get(e);
              if (t === void 0) throw new Q('incorect value');
              return t;
            }
            static getCharacterSetECIByName(e) {
              const t = L.NAME_TO_ECI.get(e);
              if (t === void 0) throw new Q('incorect value');
              return t;
            }
            equals(e) {
              if (!(e instanceof L)) return !1;
              const t = e;
              return this.getName() === t.getName();
            }
          }
          ((L.VALUE_IDENTIFIER_TO_ECI = new Map()),
            (L.VALUES_TO_ECI = new Map()),
            (L.NAME_TO_ECI = new Map()),
            (L.Cp437 = new L(V.Cp437, Int32Array.from([0, 2]), 'Cp437')),
            (L.ISO8859_1 = new L(
              V.ISO8859_1,
              Int32Array.from([1, 3]),
              'ISO-8859-1',
              'ISO88591',
              'ISO8859_1',
            )),
            (L.ISO8859_2 = new L(
              V.ISO8859_2,
              4,
              'ISO-8859-2',
              'ISO88592',
              'ISO8859_2',
            )),
            (L.ISO8859_3 = new L(
              V.ISO8859_3,
              5,
              'ISO-8859-3',
              'ISO88593',
              'ISO8859_3',
            )),
            (L.ISO8859_4 = new L(
              V.ISO8859_4,
              6,
              'ISO-8859-4',
              'ISO88594',
              'ISO8859_4',
            )),
            (L.ISO8859_5 = new L(
              V.ISO8859_5,
              7,
              'ISO-8859-5',
              'ISO88595',
              'ISO8859_5',
            )),
            (L.ISO8859_6 = new L(
              V.ISO8859_6,
              8,
              'ISO-8859-6',
              'ISO88596',
              'ISO8859_6',
            )),
            (L.ISO8859_7 = new L(
              V.ISO8859_7,
              9,
              'ISO-8859-7',
              'ISO88597',
              'ISO8859_7',
            )),
            (L.ISO8859_8 = new L(
              V.ISO8859_8,
              10,
              'ISO-8859-8',
              'ISO88598',
              'ISO8859_8',
            )),
            (L.ISO8859_9 = new L(
              V.ISO8859_9,
              11,
              'ISO-8859-9',
              'ISO88599',
              'ISO8859_9',
            )),
            (L.ISO8859_10 = new L(
              V.ISO8859_10,
              12,
              'ISO-8859-10',
              'ISO885910',
              'ISO8859_10',
            )),
            (L.ISO8859_11 = new L(
              V.ISO8859_11,
              13,
              'ISO-8859-11',
              'ISO885911',
              'ISO8859_11',
            )),
            (L.ISO8859_13 = new L(
              V.ISO8859_13,
              15,
              'ISO-8859-13',
              'ISO885913',
              'ISO8859_13',
            )),
            (L.ISO8859_14 = new L(
              V.ISO8859_14,
              16,
              'ISO-8859-14',
              'ISO885914',
              'ISO8859_14',
            )),
            (L.ISO8859_15 = new L(
              V.ISO8859_15,
              17,
              'ISO-8859-15',
              'ISO885915',
              'ISO8859_15',
            )),
            (L.ISO8859_16 = new L(
              V.ISO8859_16,
              18,
              'ISO-8859-16',
              'ISO885916',
              'ISO8859_16',
            )),
            (L.SJIS = new L(V.SJIS, 20, 'SJIS', 'Shift_JIS')),
            (L.Cp1250 = new L(V.Cp1250, 21, 'Cp1250', 'windows-1250')),
            (L.Cp1251 = new L(V.Cp1251, 22, 'Cp1251', 'windows-1251')),
            (L.Cp1252 = new L(V.Cp1252, 23, 'Cp1252', 'windows-1252')),
            (L.Cp1256 = new L(V.Cp1256, 24, 'Cp1256', 'windows-1256')),
            (L.UnicodeBigUnmarked = new L(
              V.UnicodeBigUnmarked,
              25,
              'UnicodeBigUnmarked',
              'UTF-16BE',
              'UnicodeBig',
            )),
            (L.UTF8 = new L(V.UTF8, 26, 'UTF8', 'UTF-8')),
            (L.ASCII = new L(
              V.ASCII,
              Int32Array.from([27, 170]),
              'ASCII',
              'US-ASCII',
            )),
            (L.Big5 = new L(V.Big5, 28, 'Big5')),
            (L.GB18030 = new L(
              V.GB18030,
              29,
              'GB18030',
              'GB2312',
              'EUC_CN',
              'GBK',
            )),
            (L.EUC_KR = new L(V.EUC_KR, 30, 'EUC_KR', 'EUC-KR')));
          class We extends p {}
          We.kind = 'UnsupportedOperationException';
          class xe {
            static decode(e, t) {
              const r = this.encodingName(t);
              return this.customDecoder
                ? this.customDecoder(e, r)
                : typeof TextDecoder > 'u' || this.shouldDecodeOnFallback(r)
                  ? this.decodeFallback(e, r)
                  : new TextDecoder(r).decode(e);
            }
            static shouldDecodeOnFallback(e) {
              return !xe.isBrowser() && e === 'ISO-8859-1';
            }
            static encode(e, t) {
              const r = this.encodingName(t);
              return this.customEncoder
                ? this.customEncoder(e, r)
                : typeof TextEncoder > 'u'
                  ? this.encodeFallback(e)
                  : new TextEncoder().encode(e);
            }
            static isBrowser() {
              return (
                typeof window < 'u' &&
                {}.toString.call(window) === '[object Window]'
              );
            }
            static encodingName(e) {
              return typeof e == 'string' ? e : e.getName();
            }
            static encodingCharacterSet(e) {
              return e instanceof L ? e : L.getCharacterSetECIByName(e);
            }
            static decodeFallback(e, t) {
              const r = this.encodingCharacterSet(t);
              if (xe.isDecodeFallbackSupported(r)) {
                let s = '';
                for (let o = 0, a = e.length; o < a; o++) {
                  let c = e[o].toString(16);
                  (c.length < 2 && (c = '0' + c), (s += '%' + c));
                }
                return decodeURIComponent(s);
              }
              if (r.equals(L.UnicodeBigUnmarked))
                return String.fromCharCode.apply(
                  null,
                  new Uint16Array(e.buffer),
                );
              throw new We(
                `Encoding ${this.encodingName(t)} not supported by fallback.`,
              );
            }
            static isDecodeFallbackSupported(e) {
              return (
                e.equals(L.UTF8) || e.equals(L.ISO8859_1) || e.equals(L.ASCII)
              );
            }
            static encodeFallback(e) {
              const r = btoa(unescape(encodeURIComponent(e))).split(''),
                s = [];
              for (let o = 0; o < r.length; o++) s.push(r[o].charCodeAt(0));
              return new Uint8Array(s);
            }
          }
          class se {
            static castAsNonUtf8Char(e, t = null) {
              const r = t ? t.getName() : this.ISO88591;
              return xe.decode(new Uint8Array([e]), r);
            }
            static guessEncoding(e, t) {
              if (t != null && t.get(re.CHARACTER_SET) !== void 0)
                return t.get(re.CHARACTER_SET).toString();
              const r = e.length;
              let s = !0,
                o = !0,
                a = !0,
                c = 0,
                d = 0,
                f = 0,
                x = 0,
                m = 0,
                C = 0,
                S = 0,
                v = 0,
                N = 0,
                O = 0,
                U = 0;
              const q =
                e.length > 3 && e[0] === 239 && e[1] === 187 && e[2] === 191;
              for (let Z = 0; Z < r && (s || o || a); Z++) {
                const K = e[Z] & 255;
                (a &&
                  (c > 0
                    ? (K & 128) === 0
                      ? (a = !1)
                      : c--
                    : (K & 128) !== 0 &&
                      ((K & 64) === 0
                        ? (a = !1)
                        : (c++,
                          (K & 32) === 0
                            ? d++
                            : (c++,
                              (K & 16) === 0
                                ? f++
                                : (c++, (K & 8) === 0 ? x++ : (a = !1)))))),
                  s &&
                    (K > 127 && K < 160
                      ? (s = !1)
                      : K > 159 && (K < 192 || K === 215 || K === 247) && U++),
                  o &&
                    (m > 0
                      ? K < 64 || K === 127 || K > 252
                        ? (o = !1)
                        : m--
                      : K === 128 || K === 160 || K > 239
                        ? (o = !1)
                        : K > 160 && K < 224
                          ? (C++, (v = 0), S++, S > N && (N = S))
                          : K > 127
                            ? (m++, (S = 0), v++, v > O && (O = v))
                            : ((S = 0), (v = 0))));
              }
              return (
                a && c > 0 && (a = !1),
                o && m > 0 && (o = !1),
                a && (q || d + f + x > 0)
                  ? se.UTF8
                  : o && (se.ASSUME_SHIFT_JIS || N >= 3 || O >= 3)
                    ? se.SHIFT_JIS
                    : s && o
                      ? (N === 2 && C === 2) || U * 10 >= r
                        ? se.SHIFT_JIS
                        : se.ISO88591
                      : s
                        ? se.ISO88591
                        : o
                          ? se.SHIFT_JIS
                          : a
                            ? se.UTF8
                            : se.PLATFORM_DEFAULT_ENCODING
              );
            }
            static format(e, ...t) {
              let r = -1;
              function s(a, c, d, f, x, m) {
                if (a === '%%') return '%';
                if (t[++r] === void 0) return;
                a = f ? parseInt(f.substr(1)) : void 0;
                let C = x ? parseInt(x.substr(1)) : void 0,
                  S;
                switch (m) {
                  case 's':
                    S = t[r];
                    break;
                  case 'c':
                    S = t[r][0];
                    break;
                  case 'f':
                    S = parseFloat(t[r]).toFixed(a);
                    break;
                  case 'p':
                    S = parseFloat(t[r]).toPrecision(a);
                    break;
                  case 'e':
                    S = parseFloat(t[r]).toExponential(a);
                    break;
                  case 'x':
                    S = parseInt(t[r]).toString(C || 16);
                    break;
                  case 'd':
                    S = parseFloat(
                      parseInt(t[r], C || 10).toPrecision(a),
                    ).toFixed(0);
                    break;
                }
                S = typeof S == 'object' ? JSON.stringify(S) : (+S).toString(C);
                let v = parseInt(d),
                  N = d && d[0] + '' == '0' ? '0' : ' ';
                for (; S.length < v;) S = c !== void 0 ? S + N : N + S;
                return S;
              }
              let o = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;
              return e.replace(o, s);
            }
            static getBytes(e, t) {
              return xe.encode(e, t);
            }
            static getCharCode(e, t = 0) {
              return e.charCodeAt(t);
            }
            static getCharAt(e) {
              return String.fromCharCode(e);
            }
          }
          ((se.SHIFT_JIS = L.SJIS.getName()),
            (se.GB2312 = 'GB2312'),
            (se.ISO88591 = L.ISO8859_1.getName()),
            (se.EUC_JP = 'EUC_JP'),
            (se.UTF8 = L.UTF8.getName()),
            (se.PLATFORM_DEFAULT_ENCODING = se.UTF8),
            (se.ASSUME_SHIFT_JIS = !1));
          class $ {
            constructor(e = '') {
              this.value = e;
            }
            enableDecoding(e) {
              return ((this.encoding = e), this);
            }
            append(e) {
              return (
                typeof e == 'string'
                  ? (this.value += e.toString())
                  : this.encoding
                    ? (this.value += se.castAsNonUtf8Char(e, this.encoding))
                    : (this.value += String.fromCharCode(e)),
                this
              );
            }
            appendChars(e, t, r) {
              for (let s = t; t < t + r; s++) this.append(e[s]);
              return this;
            }
            length() {
              return this.value.length;
            }
            charAt(e) {
              return this.value.charAt(e);
            }
            deleteCharAt(e) {
              this.value =
                this.value.substr(0, e) + this.value.substring(e + 1);
            }
            setCharAt(e, t) {
              this.value =
                this.value.substr(0, e) + t + this.value.substr(e + 1);
            }
            substring(e, t) {
              return this.value.substring(e, t);
            }
            setLengthToZero() {
              this.value = '';
            }
            toString() {
              return this.value;
            }
            insert(e, t) {
              this.value =
                this.value.substr(0, e) + t + this.value.substr(e + t.length);
            }
          }
          class we {
            constructor(e, t, r, s) {
              if (
                ((this.width = e),
                (this.height = t),
                (this.rowSize = r),
                (this.bits = s),
                t == null && (t = e),
                (this.height = t),
                e < 1 || t < 1)
              )
                throw new T('Both dimensions must be greater than 0');
              (r == null && (r = Math.floor((e + 31) / 32)),
                (this.rowSize = r),
                s == null &&
                  (this.bits = new Int32Array(this.rowSize * this.height)));
            }
            static parseFromBooleanArray(e) {
              const t = e.length,
                r = e[0].length,
                s = new we(r, t);
              for (let o = 0; o < t; o++) {
                const a = e[o];
                for (let c = 0; c < r; c++) a[c] && s.set(c, o);
              }
              return s;
            }
            static parseFromString(e, t, r) {
              if (e === null)
                throw new T('stringRepresentation cannot be null');
              const s = new Array(e.length);
              let o = 0,
                a = 0,
                c = -1,
                d = 0,
                f = 0;
              for (; f < e.length;)
                if (
                  e.charAt(f) ===
                    `
` ||
                  e.charAt(f) === '\r'
                ) {
                  if (o > a) {
                    if (c === -1) c = o - a;
                    else if (o - a !== c)
                      throw new T('row lengths do not match');
                    ((a = o), d++);
                  }
                  f++;
                } else if (e.substring(f, f + t.length) === t)
                  ((f += t.length), (s[o] = !0), o++);
                else if (e.substring(f, f + r.length) === r)
                  ((f += r.length), (s[o] = !1), o++);
                else
                  throw new T(
                    'illegal character encountered: ' + e.substring(f),
                  );
              if (o > a) {
                if (c === -1) c = o - a;
                else if (o - a !== c) throw new T('row lengths do not match');
                d++;
              }
              const x = new we(c, d);
              for (let m = 0; m < o; m++)
                s[m] && x.set(Math.floor(m % c), Math.floor(m / c));
              return x;
            }
            get(e, t) {
              const r = t * this.rowSize + Math.floor(e / 32);
              return ((this.bits[r] >>> (e & 31)) & 1) !== 0;
            }
            set(e, t) {
              const r = t * this.rowSize + Math.floor(e / 32);
              this.bits[r] |= (1 << (e & 31)) & 4294967295;
            }
            unset(e, t) {
              const r = t * this.rowSize + Math.floor(e / 32);
              this.bits[r] &= ~((1 << (e & 31)) & 4294967295);
            }
            flip(e, t) {
              const r = t * this.rowSize + Math.floor(e / 32);
              this.bits[r] ^= (1 << (e & 31)) & 4294967295;
            }
            xor(e) {
              if (
                this.width !== e.getWidth() ||
                this.height !== e.getHeight() ||
                this.rowSize !== e.getRowSize()
              )
                throw new T('input matrix dimensions do not match');
              const t = new W(Math.floor(this.width / 32) + 1),
                r = this.rowSize,
                s = this.bits;
              for (let o = 0, a = this.height; o < a; o++) {
                const c = o * r,
                  d = e.getRow(o, t).getBitArray();
                for (let f = 0; f < r; f++) s[c + f] ^= d[f];
              }
            }
            clear() {
              const e = this.bits,
                t = e.length;
              for (let r = 0; r < t; r++) e[r] = 0;
            }
            setRegion(e, t, r, s) {
              if (t < 0 || e < 0)
                throw new T('Left and top must be nonnegative');
              if (s < 1 || r < 1)
                throw new T('Height and width must be at least 1');
              const o = e + r,
                a = t + s;
              if (a > this.height || o > this.width)
                throw new T('The region must fit inside the matrix');
              const c = this.rowSize,
                d = this.bits;
              for (let f = t; f < a; f++) {
                const x = f * c;
                for (let m = e; m < o; m++)
                  d[x + Math.floor(m / 32)] |= (1 << (m & 31)) & 4294967295;
              }
            }
            getRow(e, t) {
              t == null || t.getSize() < this.width
                ? (t = new W(this.width))
                : t.clear();
              const r = this.rowSize,
                s = this.bits,
                o = e * r;
              for (let a = 0; a < r; a++) t.setBulk(a * 32, s[o + a]);
              return t;
            }
            setRow(e, t) {
              M.arraycopy(
                t.getBitArray(),
                0,
                this.bits,
                e * this.rowSize,
                this.rowSize,
              );
            }
            rotate180() {
              const e = this.getWidth(),
                t = this.getHeight();
              let r = new W(e),
                s = new W(e);
              for (let o = 0, a = Math.floor((t + 1) / 2); o < a; o++)
                ((r = this.getRow(o, r)),
                  (s = this.getRow(t - 1 - o, s)),
                  r.reverse(),
                  s.reverse(),
                  this.setRow(o, s),
                  this.setRow(t - 1 - o, r));
            }
            getEnclosingRectangle() {
              const e = this.width,
                t = this.height,
                r = this.rowSize,
                s = this.bits;
              let o = e,
                a = t,
                c = -1,
                d = -1;
              for (let f = 0; f < t; f++)
                for (let x = 0; x < r; x++) {
                  const m = s[f * r + x];
                  if (m !== 0) {
                    if ((f < a && (a = f), f > d && (d = f), x * 32 < o)) {
                      let C = 0;
                      for (; ((m << (31 - C)) & 4294967295) === 0;) C++;
                      x * 32 + C < o && (o = x * 32 + C);
                    }
                    if (x * 32 + 31 > c) {
                      let C = 31;
                      for (; !(m >>> C);) C--;
                      x * 32 + C > c && (c = x * 32 + C);
                    }
                  }
                }
              return c < o || d < a
                ? null
                : Int32Array.from([o, a, c - o + 1, d - a + 1]);
            }
            getTopLeftOnBit() {
              const e = this.rowSize,
                t = this.bits;
              let r = 0;
              for (; r < t.length && t[r] === 0;) r++;
              if (r === t.length) return null;
              const s = r / e;
              let o = (r % e) * 32;
              const a = t[r];
              let c = 0;
              for (; ((a << (31 - c)) & 4294967295) === 0;) c++;
              return ((o += c), Int32Array.from([o, s]));
            }
            getBottomRightOnBit() {
              const e = this.rowSize,
                t = this.bits;
              let r = t.length - 1;
              for (; r >= 0 && t[r] === 0;) r--;
              if (r < 0) return null;
              const s = Math.floor(r / e);
              let o = Math.floor(r % e) * 32;
              const a = t[r];
              let c = 31;
              for (; !(a >>> c);) c--;
              return ((o += c), Int32Array.from([o, s]));
            }
            getWidth() {
              return this.width;
            }
            getHeight() {
              return this.height;
            }
            getRowSize() {
              return this.rowSize;
            }
            equals(e) {
              if (!(e instanceof we)) return !1;
              const t = e;
              return (
                this.width === t.width &&
                this.height === t.height &&
                this.rowSize === t.rowSize &&
                J.equals(this.bits, t.bits)
              );
            }
            hashCode() {
              let e = this.width;
              return (
                (e = 31 * e + this.width),
                (e = 31 * e + this.height),
                (e = 31 * e + this.rowSize),
                (e = 31 * e + J.hashCode(this.bits)),
                e
              );
            }
            toString(
              e = 'X ',
              t = '  ',
              r = `
`,
            ) {
              return this.buildToString(e, t, r);
            }
            buildToString(e, t, r) {
              let s = new $();
              for (let o = 0, a = this.height; o < a; o++) {
                for (let c = 0, d = this.width; c < d; c++)
                  s.append(this.get(c, o) ? e : t);
                s.append(r);
              }
              return s.toString();
            }
            clone() {
              return new we(
                this.width,
                this.height,
                this.rowSize,
                this.bits.slice(),
              );
            }
          }
          class k extends p {
            static getNotFoundInstance() {
              return new k();
            }
          }
          k.kind = 'NotFoundException';
          class Te extends z {
            constructor(e) {
              (super(e),
                (this.luminances = Te.EMPTY),
                (this.buckets = new Int32Array(Te.LUMINANCE_BUCKETS)));
            }
            getBlackRow(e, t) {
              const r = this.getLuminanceSource(),
                s = r.getWidth();
              (t == null || t.getSize() < s ? (t = new W(s)) : t.clear(),
                this.initArrays(s));
              const o = r.getRow(e, this.luminances),
                a = this.buckets;
              for (let d = 0; d < s; d++)
                a[(o[d] & 255) >> Te.LUMINANCE_SHIFT]++;
              const c = Te.estimateBlackPoint(a);
              if (s < 3)
                for (let d = 0; d < s; d++) (o[d] & 255) < c && t.set(d);
              else {
                let d = o[0] & 255,
                  f = o[1] & 255;
                for (let x = 1; x < s - 1; x++) {
                  const m = o[x + 1] & 255;
                  ((f * 4 - d - m) / 2 < c && t.set(x), (d = f), (f = m));
                }
              }
              return t;
            }
            getBlackMatrix() {
              const e = this.getLuminanceSource(),
                t = e.getWidth(),
                r = e.getHeight(),
                s = new we(t, r);
              this.initArrays(t);
              const o = this.buckets;
              for (let d = 1; d < 5; d++) {
                const f = Math.floor((r * d) / 5),
                  x = e.getRow(f, this.luminances),
                  m = Math.floor((t * 4) / 5);
                for (let C = Math.floor(t / 5); C < m; C++) {
                  const S = x[C] & 255;
                  o[S >> Te.LUMINANCE_SHIFT]++;
                }
              }
              const a = Te.estimateBlackPoint(o),
                c = e.getMatrix();
              for (let d = 0; d < r; d++) {
                const f = d * t;
                for (let x = 0; x < t; x++) (c[f + x] & 255) < a && s.set(x, d);
              }
              return s;
            }
            createBinarizer(e) {
              return new Te(e);
            }
            initArrays(e) {
              this.luminances.length < e &&
                (this.luminances = new Uint8ClampedArray(e));
              const t = this.buckets;
              for (let r = 0; r < Te.LUMINANCE_BUCKETS; r++) t[r] = 0;
            }
            static estimateBlackPoint(e) {
              const t = e.length;
              let r = 0,
                s = 0,
                o = 0;
              for (let x = 0; x < t; x++)
                (e[x] > o && ((s = x), (o = e[x])), e[x] > r && (r = e[x]));
              let a = 0,
                c = 0;
              for (let x = 0; x < t; x++) {
                const m = x - s,
                  C = e[x] * m * m;
                C > c && ((a = x), (c = C));
              }
              if (s > a) {
                const x = s;
                ((s = a), (a = x));
              }
              if (a - s <= t / 16) throw new k();
              let d = a - 1,
                f = -1;
              for (let x = a - 1; x > s; x--) {
                const m = x - s,
                  C = m * m * (a - x) * (r - e[x]);
                C > f && ((d = x), (f = C));
              }
              return d << Te.LUMINANCE_SHIFT;
            }
          }
          ((Te.LUMINANCE_BITS = 5),
            (Te.LUMINANCE_SHIFT = 8 - Te.LUMINANCE_BITS),
            (Te.LUMINANCE_BUCKETS = 1 << Te.LUMINANCE_BITS),
            (Te.EMPTY = Uint8ClampedArray.from([0])));
          class ie extends Te {
            constructor(e) {
              (super(e), (this.matrix = null));
            }
            getBlackMatrix() {
              if (this.matrix !== null) return this.matrix;
              const e = this.getLuminanceSource(),
                t = e.getWidth(),
                r = e.getHeight();
              if (t >= ie.MINIMUM_DIMENSION && r >= ie.MINIMUM_DIMENSION) {
                const s = e.getMatrix();
                let o = t >> ie.BLOCK_SIZE_POWER;
                (t & ie.BLOCK_SIZE_MASK) !== 0 && o++;
                let a = r >> ie.BLOCK_SIZE_POWER;
                (r & ie.BLOCK_SIZE_MASK) !== 0 && a++;
                const c = ie.calculateBlackPoints(s, o, a, t, r),
                  d = new we(t, r);
                (ie.calculateThresholdForBlock(s, o, a, t, r, c, d),
                  (this.matrix = d));
              } else this.matrix = super.getBlackMatrix();
              return this.matrix;
            }
            createBinarizer(e) {
              return new ie(e);
            }
            static calculateThresholdForBlock(e, t, r, s, o, a, c) {
              const d = o - ie.BLOCK_SIZE,
                f = s - ie.BLOCK_SIZE;
              for (let x = 0; x < r; x++) {
                let m = x << ie.BLOCK_SIZE_POWER;
                m > d && (m = d);
                const C = ie.cap(x, 2, r - 3);
                for (let S = 0; S < t; S++) {
                  let v = S << ie.BLOCK_SIZE_POWER;
                  v > f && (v = f);
                  const N = ie.cap(S, 2, t - 3);
                  let O = 0;
                  for (let q = -2; q <= 2; q++) {
                    const Z = a[C + q];
                    O += Z[N - 2] + Z[N - 1] + Z[N] + Z[N + 1] + Z[N + 2];
                  }
                  const U = O / 25;
                  ie.thresholdBlock(e, v, m, U, s, c);
                }
              }
            }
            static cap(e, t, r) {
              return e < t ? t : e > r ? r : e;
            }
            static thresholdBlock(e, t, r, s, o, a) {
              for (let c = 0, d = r * o + t; c < ie.BLOCK_SIZE; c++, d += o)
                for (let f = 0; f < ie.BLOCK_SIZE; f++)
                  (e[d + f] & 255) <= s && a.set(t + f, r + c);
            }
            static calculateBlackPoints(e, t, r, s, o) {
              const a = o - ie.BLOCK_SIZE,
                c = s - ie.BLOCK_SIZE,
                d = new Array(r);
              for (let f = 0; f < r; f++) {
                d[f] = new Int32Array(t);
                let x = f << ie.BLOCK_SIZE_POWER;
                x > a && (x = a);
                for (let m = 0; m < t; m++) {
                  let C = m << ie.BLOCK_SIZE_POWER;
                  C > c && (C = c);
                  let S = 0,
                    v = 255,
                    N = 0;
                  for (
                    let U = 0, q = x * s + C;
                    U < ie.BLOCK_SIZE;
                    U++, q += s
                  ) {
                    for (let Z = 0; Z < ie.BLOCK_SIZE; Z++) {
                      const K = e[q + Z] & 255;
                      ((S += K), K < v && (v = K), K > N && (N = K));
                    }
                    if (N - v > ie.MIN_DYNAMIC_RANGE)
                      for (U++, q += s; U < ie.BLOCK_SIZE; U++, q += s)
                        for (let Z = 0; Z < ie.BLOCK_SIZE; Z++)
                          S += e[q + Z] & 255;
                  }
                  let O = S >> (ie.BLOCK_SIZE_POWER * 2);
                  if (
                    N - v <= ie.MIN_DYNAMIC_RANGE &&
                    ((O = v / 2), f > 0 && m > 0)
                  ) {
                    const U =
                      (d[f - 1][m] + 2 * d[f][m - 1] + d[f - 1][m - 1]) / 4;
                    v < U && (O = U);
                  }
                  d[f][m] = O;
                }
              }
              return d;
            }
          }
          ((ie.BLOCK_SIZE_POWER = 3),
            (ie.BLOCK_SIZE = 1 << ie.BLOCK_SIZE_POWER),
            (ie.BLOCK_SIZE_MASK = ie.BLOCK_SIZE - 1),
            (ie.MINIMUM_DIMENSION = ie.BLOCK_SIZE * 5),
            (ie.MIN_DYNAMIC_RANGE = 24));
          class wr {
            constructor(e, t) {
              ((this.width = e), (this.height = t));
            }
            getWidth() {
              return this.width;
            }
            getHeight() {
              return this.height;
            }
            isCropSupported() {
              return !1;
            }
            crop(e, t, r, s) {
              throw new We('This luminance source does not support cropping.');
            }
            isRotateSupported() {
              return !1;
            }
            rotateCounterClockwise() {
              throw new We(
                'This luminance source does not support rotation by 90 degrees.',
              );
            }
            rotateCounterClockwise45() {
              throw new We(
                'This luminance source does not support rotation by 45 degrees.',
              );
            }
            toString() {
              const e = new Uint8ClampedArray(this.width);
              let t = new $();
              for (let r = 0; r < this.height; r++) {
                const s = this.getRow(r, e);
                for (let o = 0; o < this.width; o++) {
                  const a = s[o] & 255;
                  let c;
                  (a < 64
                    ? (c = '#')
                    : a < 128
                      ? (c = '+')
                      : a < 192
                        ? (c = '.')
                        : (c = ' '),
                    t.append(c));
                }
                t.append(`
`);
              }
              return t.toString();
            }
          }
          class zt extends wr {
            constructor(e) {
              (super(e.getWidth(), e.getHeight()), (this.delegate = e));
            }
            getRow(e, t) {
              const r = this.delegate.getRow(e, t),
                s = this.getWidth();
              for (let o = 0; o < s; o++) r[o] = 255 - (r[o] & 255);
              return r;
            }
            getMatrix() {
              const e = this.delegate.getMatrix(),
                t = this.getWidth() * this.getHeight(),
                r = new Uint8ClampedArray(t);
              for (let s = 0; s < t; s++) r[s] = 255 - (e[s] & 255);
              return r;
            }
            isCropSupported() {
              return this.delegate.isCropSupported();
            }
            crop(e, t, r, s) {
              return new zt(this.delegate.crop(e, t, r, s));
            }
            isRotateSupported() {
              return this.delegate.isRotateSupported();
            }
            invert() {
              return this.delegate;
            }
            rotateCounterClockwise() {
              return new zt(this.delegate.rotateCounterClockwise());
            }
            rotateCounterClockwise45() {
              return new zt(this.delegate.rotateCounterClockwise45());
            }
          }
          class fe extends wr {
            constructor(e) {
              (super(e.width, e.height),
                (this.canvas = e),
                (this.tempCanvasElement = null),
                (this.buffer = fe.makeBufferFromCanvasImageData(e)));
            }
            static makeBufferFromCanvasImageData(e) {
              const t = e
                .getContext('2d')
                .getImageData(0, 0, e.width, e.height);
              return fe.toGrayscaleBuffer(t.data, e.width, e.height);
            }
            static toGrayscaleBuffer(e, t, r) {
              const s = new Uint8ClampedArray(t * r);
              for (let o = 0, a = 0, c = e.length; o < c; o += 4, a++) {
                let d;
                if (e[o + 3] === 0) d = 255;
                else {
                  const x = e[o],
                    m = e[o + 1],
                    C = e[o + 2];
                  d = (306 * x + 601 * m + 117 * C + 512) >> 10;
                }
                s[a] = d;
              }
              return s;
            }
            getRow(e, t) {
              if (e < 0 || e >= this.getHeight())
                throw new T('Requested row is outside the image: ' + e);
              const r = this.getWidth(),
                s = e * r;
              return (
                t === null
                  ? (t = this.buffer.slice(s, s + r))
                  : (t.length < r && (t = new Uint8ClampedArray(r)),
                    t.set(this.buffer.slice(s, s + r))),
                t
              );
            }
            getMatrix() {
              return this.buffer;
            }
            isCropSupported() {
              return !0;
            }
            crop(e, t, r, s) {
              return (super.crop(e, t, r, s), this);
            }
            isRotateSupported() {
              return !0;
            }
            rotateCounterClockwise() {
              return (this.rotate(-90), this);
            }
            rotateCounterClockwise45() {
              return (this.rotate(-45), this);
            }
            getTempCanvasElement() {
              if (this.tempCanvasElement === null) {
                const e = this.canvas.ownerDocument.createElement('canvas');
                ((e.width = this.canvas.width),
                  (e.height = this.canvas.height),
                  (this.tempCanvasElement = e));
              }
              return this.tempCanvasElement;
            }
            rotate(e) {
              const t = this.getTempCanvasElement(),
                r = t.getContext('2d'),
                s = e * fe.DEGREE_TO_RADIANS,
                o = this.canvas.width,
                a = this.canvas.height,
                c = Math.ceil(
                  Math.abs(Math.cos(s)) * o + Math.abs(Math.sin(s)) * a,
                ),
                d = Math.ceil(
                  Math.abs(Math.sin(s)) * o + Math.abs(Math.cos(s)) * a,
                );
              return (
                (t.width = c),
                (t.height = d),
                r.translate(c / 2, d / 2),
                r.rotate(s),
                r.drawImage(this.canvas, o / -2, a / -2),
                (this.buffer = fe.makeBufferFromCanvasImageData(t)),
                this
              );
            }
            invert() {
              return new zt(this);
            }
          }
          fe.DEGREE_TO_RADIANS = Math.PI / 180;
          class os {
            constructor(e, t, r) {
              ((this.deviceId = e),
                (this.label = t),
                (this.kind = 'videoinput'),
                (this.groupId = r || void 0));
            }
            toJSON() {
              return {
                kind: this.kind,
                groupId: this.groupId,
                deviceId: this.deviceId,
                label: this.label,
              };
            }
          }
          var dt =
            ((globalThis || xi || self || window || void 0) &&
              (globalThis || xi || self || window || void 0).__awaiter) ||
            function (A, e, t, r) {
              function s(o) {
                return o instanceof t
                  ? o
                  : new t(function (a) {
                      a(o);
                    });
              }
              return new (t || (t = Promise))(function (o, a) {
                function c(x) {
                  try {
                    f(r.next(x));
                  } catch (m) {
                    a(m);
                  }
                }
                function d(x) {
                  try {
                    f(r.throw(x));
                  } catch (m) {
                    a(m);
                  }
                }
                function f(x) {
                  x.done ? o(x.value) : s(x.value).then(c, d);
                }
                f((r = r.apply(A, e || [])).next());
              });
            };
          class ir {
            constructor(e, t = 500, r) {
              ((this.reader = e),
                (this.timeBetweenScansMillis = t),
                (this._hints = r),
                (this._stopContinuousDecode = !1),
                (this._stopAsyncDecode = !1),
                (this._timeBetweenDecodingAttempts = 0));
            }
            get hasNavigator() {
              return typeof navigator < 'u';
            }
            get isMediaDevicesSuported() {
              return this.hasNavigator && !!navigator.mediaDevices;
            }
            get canEnumerateDevices() {
              return !!(
                this.isMediaDevicesSuported &&
                navigator.mediaDevices.enumerateDevices
              );
            }
            get timeBetweenDecodingAttempts() {
              return this._timeBetweenDecodingAttempts;
            }
            set timeBetweenDecodingAttempts(e) {
              this._timeBetweenDecodingAttempts = e < 0 ? 0 : e;
            }
            set hints(e) {
              this._hints = e || null;
            }
            get hints() {
              return this._hints;
            }
            listVideoInputDevices() {
              return dt(this, void 0, void 0, function* () {
                if (!this.hasNavigator)
                  throw new Error(
                    "Can't enumerate devices, navigator is not present.",
                  );
                if (!this.canEnumerateDevices)
                  throw new Error(
                    "Can't enumerate devices, method not supported.",
                  );
                const e = yield navigator.mediaDevices.enumerateDevices(),
                  t = [];
                for (const r of e) {
                  const s = r.kind === 'video' ? 'videoinput' : r.kind;
                  if (s !== 'videoinput') continue;
                  const o = r.deviceId || r.id,
                    a = r.label || `Video device ${t.length + 1}`,
                    c = r.groupId,
                    d = { deviceId: o, label: a, kind: s, groupId: c };
                  t.push(d);
                }
                return t;
              });
            }
            getVideoInputDevices() {
              return dt(this, void 0, void 0, function* () {
                return (yield this.listVideoInputDevices()).map(
                  (t) => new os(t.deviceId, t.label),
                );
              });
            }
            findDeviceById(e) {
              return dt(this, void 0, void 0, function* () {
                const t = yield this.listVideoInputDevices();
                return t ? t.find((r) => r.deviceId === e) : null;
              });
            }
            decodeFromInputVideoDevice(e, t) {
              return dt(this, void 0, void 0, function* () {
                return yield this.decodeOnceFromVideoDevice(e, t);
              });
            }
            decodeOnceFromVideoDevice(e, t) {
              return dt(this, void 0, void 0, function* () {
                this.reset();
                let r;
                e
                  ? (r = { deviceId: { exact: e } })
                  : (r = { facingMode: 'environment' });
                const s = { video: r };
                return yield this.decodeOnceFromConstraints(s, t);
              });
            }
            decodeOnceFromConstraints(e, t) {
              return dt(this, void 0, void 0, function* () {
                const r = yield navigator.mediaDevices.getUserMedia(e);
                return yield this.decodeOnceFromStream(r, t);
              });
            }
            decodeOnceFromStream(e, t) {
              return dt(this, void 0, void 0, function* () {
                this.reset();
                const r = yield this.attachStreamToVideo(e, t);
                return yield this.decodeOnce(r);
              });
            }
            decodeFromInputVideoDeviceContinuously(e, t, r) {
              return dt(this, void 0, void 0, function* () {
                return yield this.decodeFromVideoDevice(e, t, r);
              });
            }
            decodeFromVideoDevice(e, t, r) {
              return dt(this, void 0, void 0, function* () {
                let s;
                e
                  ? (s = { deviceId: { exact: e } })
                  : (s = { facingMode: 'environment' });
                const o = { video: s };
                return yield this.decodeFromConstraints(o, t, r);
              });
            }
            decodeFromConstraints(e, t, r) {
              return dt(this, void 0, void 0, function* () {
                const s = yield navigator.mediaDevices.getUserMedia(e);
                return yield this.decodeFromStream(s, t, r);
              });
            }
            decodeFromStream(e, t, r) {
              return dt(this, void 0, void 0, function* () {
                this.reset();
                const s = yield this.attachStreamToVideo(e, t);
                return yield this.decodeContinuously(s, r);
              });
            }
            stopAsyncDecode() {
              this._stopAsyncDecode = !0;
            }
            stopContinuousDecode() {
              this._stopContinuousDecode = !0;
            }
            attachStreamToVideo(e, t) {
              return dt(this, void 0, void 0, function* () {
                const r = this.prepareVideoElement(t);
                return (
                  this.addVideoSource(r, e),
                  (this.videoElement = r),
                  (this.stream = e),
                  yield this.playVideoOnLoadAsync(r),
                  r
                );
              });
            }
            playVideoOnLoadAsync(e) {
              return new Promise((t, r) => this.playVideoOnLoad(e, () => t()));
            }
            playVideoOnLoad(e, t) {
              ((this.videoEndedListener = () => this.stopStreams()),
                (this.videoCanPlayListener = () => this.tryPlayVideo(e)),
                e.addEventListener('ended', this.videoEndedListener),
                e.addEventListener('canplay', this.videoCanPlayListener),
                e.addEventListener('playing', t),
                this.tryPlayVideo(e));
            }
            isVideoPlaying(e) {
              return (
                e.currentTime > 0 && !e.paused && !e.ended && e.readyState > 2
              );
            }
            tryPlayVideo(e) {
              return dt(this, void 0, void 0, function* () {
                if (this.isVideoPlaying(e)) {
                  console.warn('Trying to play video that is already playing.');
                  return;
                }
                try {
                  yield e.play();
                } catch {
                  console.warn('It was not possible to play the video.');
                }
              });
            }
            getMediaElement(e, t) {
              const r = document.getElementById(e);
              if (!r) throw new R(`element with id '${e}' not found`);
              if (r.nodeName.toLowerCase() !== t.toLowerCase())
                throw new R(`element with id '${e}' must be an ${t} element`);
              return r;
            }
            decodeFromImage(e, t) {
              if (!e && !t)
                throw new R(
                  'either imageElement with a src set or an url must be provided',
                );
              return t && !e
                ? this.decodeFromImageUrl(t)
                : this.decodeFromImageElement(e);
            }
            decodeFromVideo(e, t) {
              if (!e && !t)
                throw new R(
                  'Either an element with a src set or an URL must be provided',
                );
              return t && !e
                ? this.decodeFromVideoUrl(t)
                : this.decodeFromVideoElement(e);
            }
            decodeFromVideoContinuously(e, t, r) {
              if (e === void 0 && t === void 0)
                throw new R(
                  'Either an element with a src set or an URL must be provided',
                );
              return t && !e
                ? this.decodeFromVideoUrlContinuously(t, r)
                : this.decodeFromVideoElementContinuously(e, r);
            }
            decodeFromImageElement(e) {
              if (!e) throw new R('An image element must be provided.');
              this.reset();
              const t = this.prepareImageElement(e);
              this.imageElement = t;
              let r;
              return (
                this.isImageLoaded(t)
                  ? (r = this.decodeOnce(t, !1, !0))
                  : (r = this._decodeOnLoadImage(t)),
                r
              );
            }
            decodeFromVideoElement(e) {
              const t = this._decodeFromVideoElementSetup(e);
              return this._decodeOnLoadVideo(t);
            }
            decodeFromVideoElementContinuously(e, t) {
              const r = this._decodeFromVideoElementSetup(e);
              return this._decodeOnLoadVideoContinuously(r, t);
            }
            _decodeFromVideoElementSetup(e) {
              if (!e) throw new R('A video element must be provided.');
              this.reset();
              const t = this.prepareVideoElement(e);
              return ((this.videoElement = t), t);
            }
            decodeFromImageUrl(e) {
              if (!e) throw new R('An URL must be provided.');
              this.reset();
              const t = this.prepareImageElement();
              this.imageElement = t;
              const r = this._decodeOnLoadImage(t);
              return ((t.src = e), r);
            }
            decodeFromVideoUrl(e) {
              if (!e) throw new R('An URL must be provided.');
              this.reset();
              const t = this.prepareVideoElement(),
                r = this.decodeFromVideoElement(t);
              return ((t.src = e), r);
            }
            decodeFromVideoUrlContinuously(e, t) {
              if (!e) throw new R('An URL must be provided.');
              this.reset();
              const r = this.prepareVideoElement(),
                s = this.decodeFromVideoElementContinuously(r, t);
              return ((r.src = e), s);
            }
            _decodeOnLoadImage(e) {
              return new Promise((t, r) => {
                ((this.imageLoadedListener = () =>
                  this.decodeOnce(e, !1, !0).then(t, r)),
                  e.addEventListener('load', this.imageLoadedListener));
              });
            }
            _decodeOnLoadVideo(e) {
              return dt(this, void 0, void 0, function* () {
                return (
                  yield this.playVideoOnLoadAsync(e),
                  yield this.decodeOnce(e)
                );
              });
            }
            _decodeOnLoadVideoContinuously(e, t) {
              return dt(this, void 0, void 0, function* () {
                (yield this.playVideoOnLoadAsync(e),
                  this.decodeContinuously(e, t));
              });
            }
            isImageLoaded(e) {
              return !(!e.complete || e.naturalWidth === 0);
            }
            prepareImageElement(e) {
              let t;
              return (
                typeof e > 'u' &&
                  ((t = document.createElement('img')),
                  (t.width = 200),
                  (t.height = 200)),
                typeof e == 'string' && (t = this.getMediaElement(e, 'img')),
                e instanceof HTMLImageElement && (t = e),
                t
              );
            }
            prepareVideoElement(e) {
              let t;
              return (
                !e &&
                  typeof document < 'u' &&
                  ((t = document.createElement('video')),
                  (t.width = 200),
                  (t.height = 200)),
                typeof e == 'string' && (t = this.getMediaElement(e, 'video')),
                e instanceof HTMLVideoElement && (t = e),
                t.setAttribute('autoplay', 'true'),
                t.setAttribute('muted', 'true'),
                t.setAttribute('playsinline', 'true'),
                t
              );
            }
            decodeOnce(e, t = !0, r = !0) {
              this._stopAsyncDecode = !1;
              const s = (o, a) => {
                if (this._stopAsyncDecode) {
                  (a(
                    new k(
                      'Video stream has ended before any code could be detected.',
                    ),
                  ),
                    (this._stopAsyncDecode = void 0));
                  return;
                }
                try {
                  const c = this.decode(e);
                  o(c);
                } catch (c) {
                  const d = t && c instanceof k,
                    x = (c instanceof D || c instanceof Q) && r;
                  if (d || x)
                    return setTimeout(
                      s,
                      this._timeBetweenDecodingAttempts,
                      o,
                      a,
                    );
                  a(c);
                }
              };
              return new Promise((o, a) => s(o, a));
            }
            decodeContinuously(e, t) {
              this._stopContinuousDecode = !1;
              const r = () => {
                if (this._stopContinuousDecode) {
                  this._stopContinuousDecode = void 0;
                  return;
                }
                try {
                  const s = this.decode(e);
                  (t(s, null), setTimeout(r, this.timeBetweenScansMillis));
                } catch (s) {
                  t(null, s);
                  const o = s instanceof D || s instanceof Q,
                    a = s instanceof k;
                  (o || a) && setTimeout(r, this._timeBetweenDecodingAttempts);
                }
              };
              r();
            }
            decode(e) {
              const t = this.createBinaryBitmap(e);
              return this.decodeBitmap(t);
            }
            _isHTMLVideoElement(e) {
              return e.videoWidth !== 0;
            }
            drawFrameOnCanvas(e, t, r) {
              (t ||
                (t = {
                  sx: 0,
                  sy: 0,
                  sWidth: e.videoWidth,
                  sHeight: e.videoHeight,
                  dx: 0,
                  dy: 0,
                  dWidth: e.videoWidth,
                  dHeight: e.videoHeight,
                }),
                r || (r = this.captureCanvasContext),
                r.drawImage(
                  e,
                  t.sx,
                  t.sy,
                  t.sWidth,
                  t.sHeight,
                  t.dx,
                  t.dy,
                  t.dWidth,
                  t.dHeight,
                ));
            }
            drawImageOnCanvas(e, t, r = this.captureCanvasContext) {
              (t ||
                (t = {
                  sx: 0,
                  sy: 0,
                  sWidth: e.naturalWidth,
                  sHeight: e.naturalHeight,
                  dx: 0,
                  dy: 0,
                  dWidth: e.naturalWidth,
                  dHeight: e.naturalHeight,
                }),
                r || (r = this.captureCanvasContext),
                r.drawImage(
                  e,
                  t.sx,
                  t.sy,
                  t.sWidth,
                  t.sHeight,
                  t.dx,
                  t.dy,
                  t.dWidth,
                  t.dHeight,
                ));
            }
            createBinaryBitmap(e) {
              (this.getCaptureCanvasContext(e),
                this._isHTMLVideoElement(e)
                  ? this.drawFrameOnCanvas(e)
                  : this.drawImageOnCanvas(e));
              const t = this.getCaptureCanvas(e),
                r = new fe(t),
                s = new ie(r);
              return new _(s);
            }
            getCaptureCanvasContext(e) {
              if (!this.captureCanvasContext) {
                const r = this.getCaptureCanvas(e).getContext('2d');
                this.captureCanvasContext = r;
              }
              return this.captureCanvasContext;
            }
            getCaptureCanvas(e) {
              if (!this.captureCanvas) {
                const t = this.createCaptureCanvas(e);
                this.captureCanvas = t;
              }
              return this.captureCanvas;
            }
            decodeBitmap(e) {
              return this.reader.decode(e, this._hints);
            }
            createCaptureCanvas(e) {
              if (typeof document > 'u')
                return (this._destroyCaptureCanvas(), null);
              const t = document.createElement('canvas');
              let r, s;
              return (
                typeof e < 'u' &&
                  (e instanceof HTMLVideoElement
                    ? ((r = e.videoWidth), (s = e.videoHeight))
                    : e instanceof HTMLImageElement &&
                      ((r = e.naturalWidth || e.width),
                      (s = e.naturalHeight || e.height))),
                (t.style.width = r + 'px'),
                (t.style.height = s + 'px'),
                (t.width = r),
                (t.height = s),
                t
              );
            }
            stopStreams() {
              (this.stream &&
                (this.stream.getVideoTracks().forEach((e) => e.stop()),
                (this.stream = void 0)),
                this._stopAsyncDecode === !1 && this.stopAsyncDecode(),
                this._stopContinuousDecode === !1 &&
                  this.stopContinuousDecode());
            }
            reset() {
              (this.stopStreams(),
                this._destroyVideoElement(),
                this._destroyImageElement(),
                this._destroyCaptureCanvas());
            }
            _destroyVideoElement() {
              this.videoElement &&
                (typeof this.videoEndedListener < 'u' &&
                  this.videoElement.removeEventListener(
                    'ended',
                    this.videoEndedListener,
                  ),
                typeof this.videoPlayingEventListener < 'u' &&
                  this.videoElement.removeEventListener(
                    'playing',
                    this.videoPlayingEventListener,
                  ),
                typeof this.videoCanPlayListener < 'u' &&
                  this.videoElement.removeEventListener(
                    'loadedmetadata',
                    this.videoCanPlayListener,
                  ),
                this.cleanVideoSource(this.videoElement),
                (this.videoElement = void 0));
            }
            _destroyImageElement() {
              this.imageElement &&
                (this.imageLoadedListener !== void 0 &&
                  this.imageElement.removeEventListener(
                    'load',
                    this.imageLoadedListener,
                  ),
                (this.imageElement.src = void 0),
                this.imageElement.removeAttribute('src'),
                (this.imageElement = void 0));
            }
            _destroyCaptureCanvas() {
              ((this.captureCanvasContext = void 0),
                (this.captureCanvas = void 0));
            }
            addVideoSource(e, t) {
              try {
                e.srcObject = t;
              } catch {
                e.src = URL.createObjectURL(t);
              }
            }
            cleanVideoSource(e) {
              try {
                e.srcObject = null;
              } catch {
                e.src = '';
              }
              this.videoElement.removeAttribute('src');
            }
          }
          class st {
            constructor(
              e,
              t,
              r = t == null ? 0 : 8 * t.length,
              s,
              o,
              a = M.currentTimeMillis(),
            ) {
              ((this.text = e),
                (this.rawBytes = t),
                (this.numBits = r),
                (this.resultPoints = s),
                (this.format = o),
                (this.timestamp = a),
                (this.text = e),
                (this.rawBytes = t),
                r == null
                  ? (this.numBits = t == null ? 0 : 8 * t.length)
                  : (this.numBits = r),
                (this.resultPoints = s),
                (this.format = o),
                (this.resultMetadata = null),
                a == null
                  ? (this.timestamp = M.currentTimeMillis())
                  : (this.timestamp = a));
            }
            getText() {
              return this.text;
            }
            getRawBytes() {
              return this.rawBytes;
            }
            getNumBits() {
              return this.numBits;
            }
            getResultPoints() {
              return this.resultPoints;
            }
            getBarcodeFormat() {
              return this.format;
            }
            getResultMetadata() {
              return this.resultMetadata;
            }
            putMetadata(e, t) {
              (this.resultMetadata === null &&
                (this.resultMetadata = new Map()),
                this.resultMetadata.set(e, t));
            }
            putAllMetadata(e) {
              e !== null &&
                (this.resultMetadata === null
                  ? (this.resultMetadata = e)
                  : (this.resultMetadata = new Map(e)));
            }
            addResultPoints(e) {
              const t = this.resultPoints;
              if (t === null) this.resultPoints = e;
              else if (e !== null && e.length > 0) {
                const r = new Array(t.length + e.length);
                (M.arraycopy(t, 0, r, 0, t.length),
                  M.arraycopy(e, 0, r, t.length, e.length),
                  (this.resultPoints = r));
              }
            }
            getTimestamp() {
              return this.timestamp;
            }
            toString() {
              return this.text;
            }
          }
          var it;
          (function (A) {
            ((A[(A.AZTEC = 0)] = 'AZTEC'),
              (A[(A.CODABAR = 1)] = 'CODABAR'),
              (A[(A.CODE_39 = 2)] = 'CODE_39'),
              (A[(A.CODE_93 = 3)] = 'CODE_93'),
              (A[(A.CODE_128 = 4)] = 'CODE_128'),
              (A[(A.DATA_MATRIX = 5)] = 'DATA_MATRIX'),
              (A[(A.EAN_8 = 6)] = 'EAN_8'),
              (A[(A.EAN_13 = 7)] = 'EAN_13'),
              (A[(A.ITF = 8)] = 'ITF'),
              (A[(A.MAXICODE = 9)] = 'MAXICODE'),
              (A[(A.PDF_417 = 10)] = 'PDF_417'),
              (A[(A.QR_CODE = 11)] = 'QR_CODE'),
              (A[(A.RSS_14 = 12)] = 'RSS_14'),
              (A[(A.RSS_EXPANDED = 13)] = 'RSS_EXPANDED'),
              (A[(A.UPC_A = 14)] = 'UPC_A'),
              (A[(A.UPC_E = 15)] = 'UPC_E'),
              (A[(A.UPC_EAN_EXTENSION = 16)] = 'UPC_EAN_EXTENSION'));
          })(it || (it = {}));
          var oe = it,
            Nr;
          (function (A) {
            ((A[(A.OTHER = 0)] = 'OTHER'),
              (A[(A.ORIENTATION = 1)] = 'ORIENTATION'),
              (A[(A.BYTE_SEGMENTS = 2)] = 'BYTE_SEGMENTS'),
              (A[(A.ERROR_CORRECTION_LEVEL = 3)] = 'ERROR_CORRECTION_LEVEL'),
              (A[(A.ISSUE_NUMBER = 4)] = 'ISSUE_NUMBER'),
              (A[(A.SUGGESTED_PRICE = 5)] = 'SUGGESTED_PRICE'),
              (A[(A.POSSIBLE_COUNTRY = 6)] = 'POSSIBLE_COUNTRY'),
              (A[(A.UPC_EAN_EXTENSION = 7)] = 'UPC_EAN_EXTENSION'),
              (A[(A.PDF417_EXTRA_METADATA = 8)] = 'PDF417_EXTRA_METADATA'),
              (A[(A.STRUCTURED_APPEND_SEQUENCE = 9)] =
                'STRUCTURED_APPEND_SEQUENCE'),
              (A[(A.STRUCTURED_APPEND_PARITY = 10)] =
                'STRUCTURED_APPEND_PARITY'));
          })(Nr || (Nr = {}));
          var Ze = Nr;
          class ze {
            constructor(e, t, r, s, o = -1, a = -1) {
              ((this.rawBytes = e),
                (this.text = t),
                (this.byteSegments = r),
                (this.ecLevel = s),
                (this.structuredAppendSequenceNumber = o),
                (this.structuredAppendParity = a),
                (this.numBits = e == null ? 0 : 8 * e.length));
            }
            getRawBytes() {
              return this.rawBytes;
            }
            getNumBits() {
              return this.numBits;
            }
            setNumBits(e) {
              this.numBits = e;
            }
            getText() {
              return this.text;
            }
            getByteSegments() {
              return this.byteSegments;
            }
            getECLevel() {
              return this.ecLevel;
            }
            getErrorsCorrected() {
              return this.errorsCorrected;
            }
            setErrorsCorrected(e) {
              this.errorsCorrected = e;
            }
            getErasures() {
              return this.erasures;
            }
            setErasures(e) {
              this.erasures = e;
            }
            getOther() {
              return this.other;
            }
            setOther(e) {
              this.other = e;
            }
            hasStructuredAppend() {
              return (
                this.structuredAppendParity >= 0 &&
                this.structuredAppendSequenceNumber >= 0
              );
            }
            getStructuredAppendParity() {
              return this.structuredAppendParity;
            }
            getStructuredAppendSequenceNumber() {
              return this.structuredAppendSequenceNumber;
            }
          }
          class Mr {
            exp(e) {
              return this.expTable[e];
            }
            log(e) {
              if (e === 0) throw new T();
              return this.logTable[e];
            }
            static addOrSubtract(e, t) {
              return e ^ t;
            }
          }
          class ot {
            constructor(e, t) {
              if (t.length === 0) throw new T();
              this.field = e;
              const r = t.length;
              if (r > 1 && t[0] === 0) {
                let s = 1;
                for (; s < r && t[s] === 0;) s++;
                s === r
                  ? (this.coefficients = Int32Array.from([0]))
                  : ((this.coefficients = new Int32Array(r - s)),
                    M.arraycopy(
                      t,
                      s,
                      this.coefficients,
                      0,
                      this.coefficients.length,
                    ));
              } else this.coefficients = t;
            }
            getCoefficients() {
              return this.coefficients;
            }
            getDegree() {
              return this.coefficients.length - 1;
            }
            isZero() {
              return this.coefficients[0] === 0;
            }
            getCoefficient(e) {
              return this.coefficients[this.coefficients.length - 1 - e];
            }
            evaluateAt(e) {
              if (e === 0) return this.getCoefficient(0);
              const t = this.coefficients;
              let r;
              if (e === 1) {
                r = 0;
                for (let a = 0, c = t.length; a !== c; a++) {
                  const d = t[a];
                  r = Mr.addOrSubtract(r, d);
                }
                return r;
              }
              r = t[0];
              const s = t.length,
                o = this.field;
              for (let a = 1; a < s; a++)
                r = Mr.addOrSubtract(o.multiply(e, r), t[a]);
              return r;
            }
            addOrSubtract(e) {
              if (!this.field.equals(e.field))
                throw new T('GenericGFPolys do not have same GenericGF field');
              if (this.isZero()) return e;
              if (e.isZero()) return this;
              let t = this.coefficients,
                r = e.coefficients;
              if (t.length > r.length) {
                const a = t;
                ((t = r), (r = a));
              }
              let s = new Int32Array(r.length);
              const o = r.length - t.length;
              M.arraycopy(r, 0, s, 0, o);
              for (let a = o; a < r.length; a++)
                s[a] = Mr.addOrSubtract(t[a - o], r[a]);
              return new ot(this.field, s);
            }
            multiply(e) {
              if (!this.field.equals(e.field))
                throw new T('GenericGFPolys do not have same GenericGF field');
              if (this.isZero() || e.isZero()) return this.field.getZero();
              const t = this.coefficients,
                r = t.length,
                s = e.coefficients,
                o = s.length,
                a = new Int32Array(r + o - 1),
                c = this.field;
              for (let d = 0; d < r; d++) {
                const f = t[d];
                for (let x = 0; x < o; x++)
                  a[d + x] = Mr.addOrSubtract(a[d + x], c.multiply(f, s[x]));
              }
              return new ot(c, a);
            }
            multiplyScalar(e) {
              if (e === 0) return this.field.getZero();
              if (e === 1) return this;
              const t = this.coefficients.length,
                r = this.field,
                s = new Int32Array(t),
                o = this.coefficients;
              for (let a = 0; a < t; a++) s[a] = r.multiply(o[a], e);
              return new ot(r, s);
            }
            multiplyByMonomial(e, t) {
              if (e < 0) throw new T();
              if (t === 0) return this.field.getZero();
              const r = this.coefficients,
                s = r.length,
                o = new Int32Array(s + e),
                a = this.field;
              for (let c = 0; c < s; c++) o[c] = a.multiply(r[c], t);
              return new ot(a, o);
            }
            divide(e) {
              if (!this.field.equals(e.field))
                throw new T('GenericGFPolys do not have same GenericGF field');
              if (e.isZero()) throw new T('Divide by 0');
              const t = this.field;
              let r = t.getZero(),
                s = this;
              const o = e.getCoefficient(e.getDegree()),
                a = t.inverse(o);
              for (; s.getDegree() >= e.getDegree() && !s.isZero();) {
                const c = s.getDegree() - e.getDegree(),
                  d = t.multiply(s.getCoefficient(s.getDegree()), a),
                  f = e.multiplyByMonomial(c, d),
                  x = t.buildMonomial(c, d);
                ((r = r.addOrSubtract(x)), (s = s.addOrSubtract(f)));
              }
              return [r, s];
            }
            toString() {
              let e = '';
              for (let t = this.getDegree(); t >= 0; t--) {
                let r = this.getCoefficient(t);
                if (r !== 0) {
                  if (
                    (r < 0
                      ? ((e += ' - '), (r = -r))
                      : e.length > 0 && (e += ' + '),
                    t === 0 || r !== 1)
                  ) {
                    const s = this.field.log(r);
                    s === 0
                      ? (e += '1')
                      : s === 1
                        ? (e += 'a')
                        : ((e += 'a^'), (e += s));
                  }
                  t !== 0 && (t === 1 ? (e += 'x') : ((e += 'x^'), (e += t)));
                }
              }
              return e;
            }
          }
          class Cr extends p {}
          Cr.kind = 'ArithmeticException';
          class Re extends Mr {
            constructor(e, t, r) {
              (super(),
                (this.primitive = e),
                (this.size = t),
                (this.generatorBase = r));
              const s = new Int32Array(t);
              let o = 1;
              for (let c = 0; c < t; c++)
                ((s[c] = o), (o *= 2), o >= t && ((o ^= e), (o &= t - 1)));
              this.expTable = s;
              const a = new Int32Array(t);
              for (let c = 0; c < t - 1; c++) a[s[c]] = c;
              ((this.logTable = a),
                (this.zero = new ot(this, Int32Array.from([0]))),
                (this.one = new ot(this, Int32Array.from([1]))));
            }
            getZero() {
              return this.zero;
            }
            getOne() {
              return this.one;
            }
            buildMonomial(e, t) {
              if (e < 0) throw new T();
              if (t === 0) return this.zero;
              const r = new Int32Array(e + 1);
              return ((r[0] = t), new ot(this, r));
            }
            inverse(e) {
              if (e === 0) throw new Cr();
              return this.expTable[this.size - this.logTable[e] - 1];
            }
            multiply(e, t) {
              return e === 0 || t === 0
                ? 0
                : this.expTable[
                    (this.logTable[e] + this.logTable[t]) % (this.size - 1)
                  ];
            }
            getSize() {
              return this.size;
            }
            getGeneratorBase() {
              return this.generatorBase;
            }
            toString() {
              return (
                'GF(0x' + H.toHexString(this.primitive) + ',' + this.size + ')'
              );
            }
            equals(e) {
              return e === this;
            }
          }
          ((Re.AZTEC_DATA_12 = new Re(4201, 4096, 1)),
            (Re.AZTEC_DATA_10 = new Re(1033, 1024, 1)),
            (Re.AZTEC_DATA_6 = new Re(67, 64, 1)),
            (Re.AZTEC_PARAM = new Re(19, 16, 1)),
            (Re.QR_CODE_FIELD_256 = new Re(285, 256, 0)),
            (Re.DATA_MATRIX_FIELD_256 = new Re(301, 256, 1)),
            (Re.AZTEC_DATA_8 = Re.DATA_MATRIX_FIELD_256),
            (Re.MAXICODE_FIELD_64 = Re.AZTEC_DATA_6));
          class Kt extends p {}
          Kt.kind = 'ReedSolomonException';
          class or extends p {}
          or.kind = 'IllegalStateException';
          class as {
            constructor(e) {
              this.field = e;
            }
            decode(e, t) {
              const r = this.field,
                s = new ot(r, e),
                o = new Int32Array(t);
              let a = !0;
              for (let S = 0; S < t; S++) {
                const v = s.evaluateAt(r.exp(S + r.getGeneratorBase()));
                ((o[o.length - 1 - S] = v), v !== 0 && (a = !1));
              }
              if (a) return;
              const c = new ot(r, o),
                d = this.runEuclideanAlgorithm(r.buildMonomial(t, 1), c, t),
                f = d[0],
                x = d[1],
                m = this.findErrorLocations(f),
                C = this.findErrorMagnitudes(x, m);
              for (let S = 0; S < m.length; S++) {
                const v = e.length - 1 - r.log(m[S]);
                if (v < 0) throw new Kt('Bad error location');
                e[v] = Re.addOrSubtract(e[v], C[S]);
              }
            }
            runEuclideanAlgorithm(e, t, r) {
              if (e.getDegree() < t.getDegree()) {
                const S = e;
                ((e = t), (t = S));
              }
              const s = this.field;
              let o = e,
                a = t,
                c = s.getZero(),
                d = s.getOne();
              for (; a.getDegree() >= ((r / 2) | 0);) {
                let S = o,
                  v = c;
                if (((o = a), (c = d), o.isZero()))
                  throw new Kt('r_{i-1} was zero');
                a = S;
                let N = s.getZero();
                const O = o.getCoefficient(o.getDegree()),
                  U = s.inverse(O);
                for (; a.getDegree() >= o.getDegree() && !a.isZero();) {
                  const q = a.getDegree() - o.getDegree(),
                    Z = s.multiply(a.getCoefficient(a.getDegree()), U);
                  ((N = N.addOrSubtract(s.buildMonomial(q, Z))),
                    (a = a.addOrSubtract(o.multiplyByMonomial(q, Z))));
                }
                if (
                  ((d = N.multiply(c).addOrSubtract(v)),
                  a.getDegree() >= o.getDegree())
                )
                  throw new or(
                    'Division algorithm failed to reduce polynomial?',
                  );
              }
              const f = d.getCoefficient(0);
              if (f === 0) throw new Kt('sigmaTilde(0) was zero');
              const x = s.inverse(f),
                m = d.multiplyScalar(x),
                C = a.multiplyScalar(x);
              return [m, C];
            }
            findErrorLocations(e) {
              const t = e.getDegree();
              if (t === 1) return Int32Array.from([e.getCoefficient(1)]);
              const r = new Int32Array(t);
              let s = 0;
              const o = this.field;
              for (let a = 1; a < o.getSize() && s < t; a++)
                e.evaluateAt(a) === 0 && ((r[s] = o.inverse(a)), s++);
              if (s !== t)
                throw new Kt(
                  'Error locator degree does not match number of roots',
                );
              return r;
            }
            findErrorMagnitudes(e, t) {
              const r = t.length,
                s = new Int32Array(r),
                o = this.field;
              for (let a = 0; a < r; a++) {
                const c = o.inverse(t[a]);
                let d = 1;
                for (let f = 0; f < r; f++)
                  if (a !== f) {
                    const x = o.multiply(t[f], c),
                      m = (x & 1) === 0 ? x | 1 : x & -2;
                    d = o.multiply(d, m);
                  }
                ((s[a] = o.multiply(e.evaluateAt(c), o.inverse(d))),
                  o.getGeneratorBase() !== 0 && (s[a] = o.multiply(s[a], c)));
              }
              return s;
            }
          }
          var At;
          (function (A) {
            ((A[(A.UPPER = 0)] = 'UPPER'),
              (A[(A.LOWER = 1)] = 'LOWER'),
              (A[(A.MIXED = 2)] = 'MIXED'),
              (A[(A.DIGIT = 3)] = 'DIGIT'),
              (A[(A.PUNCT = 4)] = 'PUNCT'),
              (A[(A.BINARY = 5)] = 'BINARY'));
          })(At || (At = {}));
          class Fe {
            decode(e) {
              this.ddata = e;
              let t = e.getBits(),
                r = this.extractBits(t),
                s = this.correctBits(r),
                o = Fe.convertBoolArrayToByteArray(s),
                a = Fe.getEncodedData(s),
                c = new ze(o, a, null, null);
              return (c.setNumBits(s.length), c);
            }
            static highLevelDecode(e) {
              return this.getEncodedData(e);
            }
            static getEncodedData(e) {
              let t = e.length,
                r = At.UPPER,
                s = At.UPPER,
                o = '',
                a = 0;
              for (; a < t;)
                if (s === At.BINARY) {
                  if (t - a < 5) break;
                  let c = Fe.readCode(e, a, 5);
                  if (((a += 5), c === 0)) {
                    if (t - a < 11) break;
                    ((c = Fe.readCode(e, a, 11) + 31), (a += 11));
                  }
                  for (let d = 0; d < c; d++) {
                    if (t - a < 8) {
                      a = t;
                      break;
                    }
                    const f = Fe.readCode(e, a, 8);
                    ((o += se.castAsNonUtf8Char(f)), (a += 8));
                  }
                  s = r;
                } else {
                  let c = s === At.DIGIT ? 4 : 5;
                  if (t - a < c) break;
                  let d = Fe.readCode(e, a, c);
                  a += c;
                  let f = Fe.getCharacter(s, d);
                  f.startsWith('CTRL_')
                    ? ((r = s),
                      (s = Fe.getTable(f.charAt(5))),
                      f.charAt(6) === 'L' && (r = s))
                    : ((o += f), (s = r));
                }
              return o;
            }
            static getTable(e) {
              switch (e) {
                case 'L':
                  return At.LOWER;
                case 'P':
                  return At.PUNCT;
                case 'M':
                  return At.MIXED;
                case 'D':
                  return At.DIGIT;
                case 'B':
                  return At.BINARY;
                case 'U':
                default:
                  return At.UPPER;
              }
            }
            static getCharacter(e, t) {
              switch (e) {
                case At.UPPER:
                  return Fe.UPPER_TABLE[t];
                case At.LOWER:
                  return Fe.LOWER_TABLE[t];
                case At.MIXED:
                  return Fe.MIXED_TABLE[t];
                case At.PUNCT:
                  return Fe.PUNCT_TABLE[t];
                case At.DIGIT:
                  return Fe.DIGIT_TABLE[t];
                default:
                  throw new or('Bad table');
              }
            }
            correctBits(e) {
              let t, r;
              this.ddata.getNbLayers() <= 2
                ? ((r = 6), (t = Re.AZTEC_DATA_6))
                : this.ddata.getNbLayers() <= 8
                  ? ((r = 8), (t = Re.AZTEC_DATA_8))
                  : this.ddata.getNbLayers() <= 22
                    ? ((r = 10), (t = Re.AZTEC_DATA_10))
                    : ((r = 12), (t = Re.AZTEC_DATA_12));
              let s = this.ddata.getNbDatablocks(),
                o = e.length / r;
              if (o < s) throw new Q();
              let a = e.length % r,
                c = new Int32Array(o);
              for (let C = 0; C < o; C++, a += r) c[C] = Fe.readCode(e, a, r);
              try {
                new as(t).decode(c, o - s);
              } catch (C) {
                throw new Q(C);
              }
              let d = (1 << r) - 1,
                f = 0;
              for (let C = 0; C < s; C++) {
                let S = c[C];
                if (S === 0 || S === d) throw new Q();
                (S === 1 || S === d - 1) && f++;
              }
              let x = new Array(s * r - f),
                m = 0;
              for (let C = 0; C < s; C++) {
                let S = c[C];
                if (S === 1 || S === d - 1)
                  (x.fill(S > 1, m, m + r - 1), (m += r - 1));
                else
                  for (let v = r - 1; v >= 0; --v)
                    x[m++] = (S & (1 << v)) !== 0;
              }
              return x;
            }
            extractBits(e) {
              let t = this.ddata.isCompact(),
                r = this.ddata.getNbLayers(),
                s = (t ? 11 : 14) + r * 4,
                o = new Int32Array(s),
                a = new Array(this.totalBitsInLayer(r, t));
              if (t) for (let c = 0; c < o.length; c++) o[c] = c;
              else {
                let c =
                    s + 1 + 2 * H.truncDivision(H.truncDivision(s, 2) - 1, 15),
                  d = s / 2,
                  f = H.truncDivision(c, 2);
                for (let x = 0; x < d; x++) {
                  let m = x + H.truncDivision(x, 15);
                  ((o[d - x - 1] = f - m - 1), (o[d + x] = f + m + 1));
                }
              }
              for (let c = 0, d = 0; c < r; c++) {
                let f = (r - c) * 4 + (t ? 9 : 12),
                  x = c * 2,
                  m = s - 1 - x;
                for (let C = 0; C < f; C++) {
                  let S = C * 2;
                  for (let v = 0; v < 2; v++)
                    ((a[d + S + v] = e.get(o[x + v], o[x + C])),
                      (a[d + 2 * f + S + v] = e.get(o[x + C], o[m - v])),
                      (a[d + 4 * f + S + v] = e.get(o[m - v], o[m - C])),
                      (a[d + 6 * f + S + v] = e.get(o[m - C], o[x + v])));
                }
                d += f * 8;
              }
              return a;
            }
            static readCode(e, t, r) {
              let s = 0;
              for (let o = t; o < t + r; o++) ((s <<= 1), e[o] && (s |= 1));
              return s;
            }
            static readByte(e, t) {
              let r = e.length - t;
              return r >= 8
                ? Fe.readCode(e, t, 8)
                : Fe.readCode(e, t, r) << (8 - r);
            }
            static convertBoolArrayToByteArray(e) {
              let t = new Uint8Array((e.length + 7) / 8);
              for (let r = 0; r < t.length; r++) t[r] = Fe.readByte(e, 8 * r);
              return t;
            }
            totalBitsInLayer(e, t) {
              return ((t ? 88 : 112) + 16 * e) * e;
            }
          }
          ((Fe.UPPER_TABLE = [
            'CTRL_PS',
            ' ',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
            'CTRL_LL',
            'CTRL_ML',
            'CTRL_DL',
            'CTRL_BS',
          ]),
            (Fe.LOWER_TABLE = [
              'CTRL_PS',
              ' ',
              'a',
              'b',
              'c',
              'd',
              'e',
              'f',
              'g',
              'h',
              'i',
              'j',
              'k',
              'l',
              'm',
              'n',
              'o',
              'p',
              'q',
              'r',
              's',
              't',
              'u',
              'v',
              'w',
              'x',
              'y',
              'z',
              'CTRL_US',
              'CTRL_ML',
              'CTRL_DL',
              'CTRL_BS',
            ]),
            (Fe.MIXED_TABLE = [
              'CTRL_PS',
              ' ',
              '\\1',
              '\\2',
              '\\3',
              '\\4',
              '\\5',
              '\\6',
              '\\7',
              '\b',
              '	',
              `
`,
              '\\13',
              '\f',
              '\r',
              '\\33',
              '\\34',
              '\\35',
              '\\36',
              '\\37',
              '@',
              '\\',
              '^',
              '_',
              '`',
              '|',
              '~',
              '\\177',
              'CTRL_LL',
              'CTRL_UL',
              'CTRL_PL',
              'CTRL_BS',
            ]),
            (Fe.PUNCT_TABLE = [
              '',
              '\r',
              `\r
`,
              '. ',
              ', ',
              ': ',
              '!',
              '"',
              '#',
              '$',
              '%',
              '&',
              "'",
              '(',
              ')',
              '*',
              '+',
              ',',
              '-',
              '.',
              '/',
              ':',
              ';',
              '<',
              '=',
              '>',
              '?',
              '[',
              ']',
              '{',
              '}',
              'CTRL_UL',
            ]),
            (Fe.DIGIT_TABLE = [
              'CTRL_PS',
              ' ',
              '0',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              ',',
              '.',
              'CTRL_UL',
              'CTRL_US',
            ]));
          class Ne {
            constructor() {}
            static round(e) {
              return e === NaN
                ? 0
                : e <= Number.MIN_SAFE_INTEGER
                  ? Number.MIN_SAFE_INTEGER
                  : e >= Number.MAX_SAFE_INTEGER
                    ? Number.MAX_SAFE_INTEGER
                    : (e + (e < 0 ? -0.5 : 0.5)) | 0;
            }
            static distance(e, t, r, s) {
              const o = e - r,
                a = t - s;
              return Math.sqrt(o * o + a * a);
            }
            static sum(e) {
              let t = 0;
              for (let r = 0, s = e.length; r !== s; r++) {
                const o = e[r];
                t += o;
              }
              return t;
            }
          }
          class ri {
            static floatToIntBits(e) {
              return e;
            }
          }
          ri.MAX_VALUE = Number.MAX_SAFE_INTEGER;
          class de {
            constructor(e, t) {
              ((this.x = e), (this.y = t));
            }
            getX() {
              return this.x;
            }
            getY() {
              return this.y;
            }
            equals(e) {
              if (e instanceof de) {
                const t = e;
                return this.x === t.x && this.y === t.y;
              }
              return !1;
            }
            hashCode() {
              return 31 * ri.floatToIntBits(this.x) + ri.floatToIntBits(this.y);
            }
            toString() {
              return '(' + this.x + ',' + this.y + ')';
            }
            static orderBestPatterns(e) {
              const t = this.distance(e[0], e[1]),
                r = this.distance(e[1], e[2]),
                s = this.distance(e[0], e[2]);
              let o, a, c;
              if (
                (r >= t && r >= s
                  ? ((a = e[0]), (o = e[1]), (c = e[2]))
                  : s >= r && s >= t
                    ? ((a = e[1]), (o = e[0]), (c = e[2]))
                    : ((a = e[2]), (o = e[0]), (c = e[1])),
                this.crossProductZ(o, a, c) < 0)
              ) {
                const d = o;
                ((o = c), (c = d));
              }
              ((e[0] = o), (e[1] = a), (e[2] = c));
            }
            static distance(e, t) {
              return Ne.distance(e.x, e.y, t.x, t.y);
            }
            static crossProductZ(e, t, r) {
              const s = t.x,
                o = t.y;
              return (r.x - s) * (e.y - o) - (r.y - o) * (e.x - s);
            }
          }
          class ni {
            constructor(e, t) {
              ((this.bits = e), (this.points = t));
            }
            getBits() {
              return this.bits;
            }
            getPoints() {
              return this.points;
            }
          }
          class $o extends ni {
            constructor(e, t, r, s, o) {
              (super(e, t),
                (this.compact = r),
                (this.nbDatablocks = s),
                (this.nbLayers = o));
            }
            getNbLayers() {
              return this.nbLayers;
            }
            getNbDatablocks() {
              return this.nbDatablocks;
            }
            isCompact() {
              return this.compact;
            }
          }
          class yr {
            constructor(e, t, r, s) {
              ((this.image = e),
                (this.height = e.getHeight()),
                (this.width = e.getWidth()),
                t == null && (t = yr.INIT_SIZE),
                r == null && (r = (e.getWidth() / 2) | 0),
                s == null && (s = (e.getHeight() / 2) | 0));
              const o = (t / 2) | 0;
              if (
                ((this.leftInit = r - o),
                (this.rightInit = r + o),
                (this.upInit = s - o),
                (this.downInit = s + o),
                this.upInit < 0 ||
                  this.leftInit < 0 ||
                  this.downInit >= this.height ||
                  this.rightInit >= this.width)
              )
                throw new k();
            }
            detect() {
              let e = this.leftInit,
                t = this.rightInit,
                r = this.upInit,
                s = this.downInit,
                o = !1,
                a = !0,
                c = !1,
                d = !1,
                f = !1,
                x = !1,
                m = !1;
              const C = this.width,
                S = this.height;
              for (; a;) {
                a = !1;
                let v = !0;
                for (; (v || !d) && t < C;)
                  ((v = this.containsBlackPoint(r, s, t, !1)),
                    v ? (t++, (a = !0), (d = !0)) : d || t++);
                if (t >= C) {
                  o = !0;
                  break;
                }
                let N = !0;
                for (; (N || !f) && s < S;)
                  ((N = this.containsBlackPoint(e, t, s, !0)),
                    N ? (s++, (a = !0), (f = !0)) : f || s++);
                if (s >= S) {
                  o = !0;
                  break;
                }
                let O = !0;
                for (; (O || !x) && e >= 0;)
                  ((O = this.containsBlackPoint(r, s, e, !1)),
                    O ? (e--, (a = !0), (x = !0)) : x || e--);
                if (e < 0) {
                  o = !0;
                  break;
                }
                let U = !0;
                for (; (U || !m) && r >= 0;)
                  ((U = this.containsBlackPoint(e, t, r, !0)),
                    U ? (r--, (a = !0), (m = !0)) : m || r--);
                if (r < 0) {
                  o = !0;
                  break;
                }
                a && (c = !0);
              }
              if (!o && c) {
                const v = t - e;
                let N = null;
                for (let Z = 1; N === null && Z < v; Z++)
                  N = this.getBlackPointOnSegment(e, s - Z, e + Z, s);
                if (N == null) throw new k();
                let O = null;
                for (let Z = 1; O === null && Z < v; Z++)
                  O = this.getBlackPointOnSegment(e, r + Z, e + Z, r);
                if (O == null) throw new k();
                let U = null;
                for (let Z = 1; U === null && Z < v; Z++)
                  U = this.getBlackPointOnSegment(t, r + Z, t - Z, r);
                if (U == null) throw new k();
                let q = null;
                for (let Z = 1; q === null && Z < v; Z++)
                  q = this.getBlackPointOnSegment(t, s - Z, t - Z, s);
                if (q == null) throw new k();
                return this.centerEdges(q, N, U, O);
              } else throw new k();
            }
            getBlackPointOnSegment(e, t, r, s) {
              const o = Ne.round(Ne.distance(e, t, r, s)),
                a = (r - e) / o,
                c = (s - t) / o,
                d = this.image;
              for (let f = 0; f < o; f++) {
                const x = Ne.round(e + f * a),
                  m = Ne.round(t + f * c);
                if (d.get(x, m)) return new de(x, m);
              }
              return null;
            }
            centerEdges(e, t, r, s) {
              const o = e.getX(),
                a = e.getY(),
                c = t.getX(),
                d = t.getY(),
                f = r.getX(),
                x = r.getY(),
                m = s.getX(),
                C = s.getY(),
                S = yr.CORR;
              return o < this.width / 2
                ? [
                    new de(m - S, C + S),
                    new de(c + S, d + S),
                    new de(f - S, x - S),
                    new de(o + S, a - S),
                  ]
                : [
                    new de(m + S, C + S),
                    new de(c + S, d - S),
                    new de(f - S, x + S),
                    new de(o - S, a - S),
                  ];
            }
            containsBlackPoint(e, t, r, s) {
              const o = this.image;
              if (s) {
                for (let a = e; a <= t; a++) if (o.get(a, r)) return !0;
              } else for (let a = e; a <= t; a++) if (o.get(r, a)) return !0;
              return !1;
            }
          }
          ((yr.INIT_SIZE = 10), (yr.CORR = 1));
          class Di {
            static checkAndNudgePoints(e, t) {
              const r = e.getWidth(),
                s = e.getHeight();
              let o = !0;
              for (let a = 0; a < t.length && o; a += 2) {
                const c = Math.floor(t[a]),
                  d = Math.floor(t[a + 1]);
                if (c < -1 || c > r || d < -1 || d > s) throw new k();
                ((o = !1),
                  c === -1
                    ? ((t[a] = 0), (o = !0))
                    : c === r && ((t[a] = r - 1), (o = !0)),
                  d === -1
                    ? ((t[a + 1] = 0), (o = !0))
                    : d === s && ((t[a + 1] = s - 1), (o = !0)));
              }
              o = !0;
              for (let a = t.length - 2; a >= 0 && o; a -= 2) {
                const c = Math.floor(t[a]),
                  d = Math.floor(t[a + 1]);
                if (c < -1 || c > r || d < -1 || d > s) throw new k();
                ((o = !1),
                  c === -1
                    ? ((t[a] = 0), (o = !0))
                    : c === r && ((t[a] = r - 1), (o = !0)),
                  d === -1
                    ? ((t[a + 1] = 0), (o = !0))
                    : d === s && ((t[a + 1] = s - 1), (o = !0)));
              }
            }
          }
          class Jt {
            constructor(e, t, r, s, o, a, c, d, f) {
              ((this.a11 = e),
                (this.a21 = t),
                (this.a31 = r),
                (this.a12 = s),
                (this.a22 = o),
                (this.a32 = a),
                (this.a13 = c),
                (this.a23 = d),
                (this.a33 = f));
            }
            static quadrilateralToQuadrilateral(
              e,
              t,
              r,
              s,
              o,
              a,
              c,
              d,
              f,
              x,
              m,
              C,
              S,
              v,
              N,
              O,
            ) {
              const U = Jt.quadrilateralToSquare(e, t, r, s, o, a, c, d);
              return Jt.squareToQuadrilateral(f, x, m, C, S, v, N, O).times(U);
            }
            transformPoints(e) {
              const t = e.length,
                r = this.a11,
                s = this.a12,
                o = this.a13,
                a = this.a21,
                c = this.a22,
                d = this.a23,
                f = this.a31,
                x = this.a32,
                m = this.a33;
              for (let C = 0; C < t; C += 2) {
                const S = e[C],
                  v = e[C + 1],
                  N = o * S + d * v + m;
                ((e[C] = (r * S + a * v + f) / N),
                  (e[C + 1] = (s * S + c * v + x) / N));
              }
            }
            transformPointsWithValues(e, t) {
              const r = this.a11,
                s = this.a12,
                o = this.a13,
                a = this.a21,
                c = this.a22,
                d = this.a23,
                f = this.a31,
                x = this.a32,
                m = this.a33,
                C = e.length;
              for (let S = 0; S < C; S++) {
                const v = e[S],
                  N = t[S],
                  O = o * v + d * N + m;
                ((e[S] = (r * v + a * N + f) / O),
                  (t[S] = (s * v + c * N + x) / O));
              }
            }
            static squareToQuadrilateral(e, t, r, s, o, a, c, d) {
              const f = e - r + o - c,
                x = t - s + a - d;
              if (f === 0 && x === 0)
                return new Jt(r - e, o - r, e, s - t, a - s, t, 0, 0, 1);
              {
                const m = r - o,
                  C = c - o,
                  S = s - a,
                  v = d - a,
                  N = m * v - C * S,
                  O = (f * v - C * x) / N,
                  U = (m * x - f * S) / N;
                return new Jt(
                  r - e + O * r,
                  c - e + U * c,
                  e,
                  s - t + O * s,
                  d - t + U * d,
                  t,
                  O,
                  U,
                  1,
                );
              }
            }
            static quadrilateralToSquare(e, t, r, s, o, a, c, d) {
              return Jt.squareToQuadrilateral(
                e,
                t,
                r,
                s,
                o,
                a,
                c,
                d,
              ).buildAdjoint();
            }
            buildAdjoint() {
              return new Jt(
                this.a22 * this.a33 - this.a23 * this.a32,
                this.a23 * this.a31 - this.a21 * this.a33,
                this.a21 * this.a32 - this.a22 * this.a31,
                this.a13 * this.a32 - this.a12 * this.a33,
                this.a11 * this.a33 - this.a13 * this.a31,
                this.a12 * this.a31 - this.a11 * this.a32,
                this.a12 * this.a23 - this.a13 * this.a22,
                this.a13 * this.a21 - this.a11 * this.a23,
                this.a11 * this.a22 - this.a12 * this.a21,
              );
            }
            times(e) {
              return new Jt(
                this.a11 * e.a11 + this.a21 * e.a12 + this.a31 * e.a13,
                this.a11 * e.a21 + this.a21 * e.a22 + this.a31 * e.a23,
                this.a11 * e.a31 + this.a21 * e.a32 + this.a31 * e.a33,
                this.a12 * e.a11 + this.a22 * e.a12 + this.a32 * e.a13,
                this.a12 * e.a21 + this.a22 * e.a22 + this.a32 * e.a23,
                this.a12 * e.a31 + this.a22 * e.a32 + this.a32 * e.a33,
                this.a13 * e.a11 + this.a23 * e.a12 + this.a33 * e.a13,
                this.a13 * e.a21 + this.a23 * e.a22 + this.a33 * e.a23,
                this.a13 * e.a31 + this.a23 * e.a32 + this.a33 * e.a33,
              );
            }
          }
          class ea extends Di {
            sampleGrid(
              e,
              t,
              r,
              s,
              o,
              a,
              c,
              d,
              f,
              x,
              m,
              C,
              S,
              v,
              N,
              O,
              U,
              q,
              Z,
            ) {
              const K = Jt.quadrilateralToQuadrilateral(
                s,
                o,
                a,
                c,
                d,
                f,
                x,
                m,
                C,
                S,
                v,
                N,
                O,
                U,
                q,
                Z,
              );
              return this.sampleGridWithTransform(e, t, r, K);
            }
            sampleGridWithTransform(e, t, r, s) {
              if (t <= 0 || r <= 0) throw new k();
              const o = new we(t, r),
                a = new Float32Array(2 * t);
              for (let c = 0; c < r; c++) {
                const d = a.length,
                  f = c + 0.5;
                for (let x = 0; x < d; x += 2)
                  ((a[x] = x / 2 + 0.5), (a[x + 1] = f));
                (s.transformPoints(a), Di.checkAndNudgePoints(e, a));
                try {
                  for (let x = 0; x < d; x += 2)
                    e.get(Math.floor(a[x]), Math.floor(a[x + 1])) &&
                      o.set(x / 2, c);
                } catch {
                  throw new k();
                }
              }
              return o;
            }
          }
          class Dr {
            static setGridSampler(e) {
              Dr.gridSampler = e;
            }
            static getInstance() {
              return Dr.gridSampler;
            }
          }
          Dr.gridSampler = new ea();
          class Tt {
            constructor(e, t) {
              ((this.x = e), (this.y = t));
            }
            toResultPoint() {
              return new de(this.getX(), this.getY());
            }
            getX() {
              return this.x;
            }
            getY() {
              return this.y;
            }
          }
          class ta {
            constructor(e) {
              ((this.EXPECTED_CORNER_BITS = new Int32Array([
                3808, 476, 2107, 1799,
              ])),
                (this.image = e));
            }
            detect() {
              return this.detectMirror(!1);
            }
            detectMirror(e) {
              let t = this.getMatrixCenter(),
                r = this.getBullsEyeCorners(t);
              if (e) {
                let a = r[0];
                ((r[0] = r[2]), (r[2] = a));
              }
              this.extractParameters(r);
              let s = this.sampleGrid(
                  this.image,
                  r[this.shift % 4],
                  r[(this.shift + 1) % 4],
                  r[(this.shift + 2) % 4],
                  r[(this.shift + 3) % 4],
                ),
                o = this.getMatrixCornerPoints(r);
              return new $o(
                s,
                o,
                this.compact,
                this.nbDataBlocks,
                this.nbLayers,
              );
            }
            extractParameters(e) {
              if (
                !this.isValidPoint(e[0]) ||
                !this.isValidPoint(e[1]) ||
                !this.isValidPoint(e[2]) ||
                !this.isValidPoint(e[3])
              )
                throw new k();
              let t = 2 * this.nbCenterLayers,
                r = new Int32Array([
                  this.sampleLine(e[0], e[1], t),
                  this.sampleLine(e[1], e[2], t),
                  this.sampleLine(e[2], e[3], t),
                  this.sampleLine(e[3], e[0], t),
                ]);
              this.shift = this.getRotation(r, t);
              let s = 0;
              for (let a = 0; a < 4; a++) {
                let c = r[(this.shift + a) % 4];
                this.compact
                  ? ((s <<= 7), (s += (c >> 1) & 127))
                  : ((s <<= 10), (s += ((c >> 2) & 992) + ((c >> 1) & 31)));
              }
              let o = this.getCorrectedParameterData(s, this.compact);
              this.compact
                ? ((this.nbLayers = (o >> 6) + 1),
                  (this.nbDataBlocks = (o & 63) + 1))
                : ((this.nbLayers = (o >> 11) + 1),
                  (this.nbDataBlocks = (o & 2047) + 1));
            }
            getRotation(e, t) {
              let r = 0;
              (e.forEach((s, o, a) => {
                let c = ((s >> (t - 2)) << 1) + (s & 1);
                r = (r << 3) + c;
              }),
                (r = ((r & 1) << 11) + (r >> 1)));
              for (let s = 0; s < 4; s++)
                if (H.bitCount(r ^ this.EXPECTED_CORNER_BITS[s]) <= 2) return s;
              throw new k();
            }
            getCorrectedParameterData(e, t) {
              let r, s;
              t ? ((r = 7), (s = 2)) : ((r = 10), (s = 4));
              let o = r - s,
                a = new Int32Array(r);
              for (let d = r - 1; d >= 0; --d) ((a[d] = e & 15), (e >>= 4));
              try {
                new as(Re.AZTEC_PARAM).decode(a, o);
              } catch {
                throw new k();
              }
              let c = 0;
              for (let d = 0; d < s; d++) c = (c << 4) + a[d];
              return c;
            }
            getBullsEyeCorners(e) {
              let t = e,
                r = e,
                s = e,
                o = e,
                a = !0;
              for (
                this.nbCenterLayers = 1;
                this.nbCenterLayers < 9;
                this.nbCenterLayers++
              ) {
                let m = this.getFirstDifferent(t, a, 1, -1),
                  C = this.getFirstDifferent(r, a, 1, 1),
                  S = this.getFirstDifferent(s, a, -1, 1),
                  v = this.getFirstDifferent(o, a, -1, -1);
                if (this.nbCenterLayers > 2) {
                  let N =
                    (this.distancePoint(v, m) * this.nbCenterLayers) /
                    (this.distancePoint(o, t) * (this.nbCenterLayers + 2));
                  if (
                    N < 0.75 ||
                    N > 1.25 ||
                    !this.isWhiteOrBlackRectangle(m, C, S, v)
                  )
                    break;
                }
                ((t = m), (r = C), (s = S), (o = v), (a = !a));
              }
              if (this.nbCenterLayers !== 5 && this.nbCenterLayers !== 7)
                throw new k();
              this.compact = this.nbCenterLayers === 5;
              let c = new de(t.getX() + 0.5, t.getY() - 0.5),
                d = new de(r.getX() + 0.5, r.getY() + 0.5),
                f = new de(s.getX() - 0.5, s.getY() + 0.5),
                x = new de(o.getX() - 0.5, o.getY() - 0.5);
              return this.expandSquare(
                [c, d, f, x],
                2 * this.nbCenterLayers - 3,
                2 * this.nbCenterLayers,
              );
            }
            getMatrixCenter() {
              let e, t, r, s;
              try {
                let c = new yr(this.image).detect();
                ((e = c[0]), (t = c[1]), (r = c[2]), (s = c[3]));
              } catch {
                let d = this.image.getWidth() / 2,
                  f = this.image.getHeight() / 2;
                ((e = this.getFirstDifferent(
                  new Tt(d + 7, f - 7),
                  !1,
                  1,
                  -1,
                ).toResultPoint()),
                  (t = this.getFirstDifferent(
                    new Tt(d + 7, f + 7),
                    !1,
                    1,
                    1,
                  ).toResultPoint()),
                  (r = this.getFirstDifferent(
                    new Tt(d - 7, f + 7),
                    !1,
                    -1,
                    1,
                  ).toResultPoint()),
                  (s = this.getFirstDifferent(
                    new Tt(d - 7, f - 7),
                    !1,
                    -1,
                    -1,
                  ).toResultPoint()));
              }
              let o = Ne.round((e.getX() + s.getX() + t.getX() + r.getX()) / 4),
                a = Ne.round((e.getY() + s.getY() + t.getY() + r.getY()) / 4);
              try {
                let c = new yr(this.image, 15, o, a).detect();
                ((e = c[0]), (t = c[1]), (r = c[2]), (s = c[3]));
              } catch {
                ((e = this.getFirstDifferent(
                  new Tt(o + 7, a - 7),
                  !1,
                  1,
                  -1,
                ).toResultPoint()),
                  (t = this.getFirstDifferent(
                    new Tt(o + 7, a + 7),
                    !1,
                    1,
                    1,
                  ).toResultPoint()),
                  (r = this.getFirstDifferent(
                    new Tt(o - 7, a + 7),
                    !1,
                    -1,
                    1,
                  ).toResultPoint()),
                  (s = this.getFirstDifferent(
                    new Tt(o - 7, a - 7),
                    !1,
                    -1,
                    -1,
                  ).toResultPoint()));
              }
              return (
                (o = Ne.round((e.getX() + s.getX() + t.getX() + r.getX()) / 4)),
                (a = Ne.round((e.getY() + s.getY() + t.getY() + r.getY()) / 4)),
                new Tt(o, a)
              );
            }
            getMatrixCornerPoints(e) {
              return this.expandSquare(
                e,
                2 * this.nbCenterLayers,
                this.getDimension(),
              );
            }
            sampleGrid(e, t, r, s, o) {
              let a = Dr.getInstance(),
                c = this.getDimension(),
                d = c / 2 - this.nbCenterLayers,
                f = c / 2 + this.nbCenterLayers;
              return a.sampleGrid(
                e,
                c,
                c,
                d,
                d,
                f,
                d,
                f,
                f,
                d,
                f,
                t.getX(),
                t.getY(),
                r.getX(),
                r.getY(),
                s.getX(),
                s.getY(),
                o.getX(),
                o.getY(),
              );
            }
            sampleLine(e, t, r) {
              let s = 0,
                o = this.distanceResultPoint(e, t),
                a = o / r,
                c = e.getX(),
                d = e.getY(),
                f = (a * (t.getX() - e.getX())) / o,
                x = (a * (t.getY() - e.getY())) / o;
              for (let m = 0; m < r; m++)
                this.image.get(Ne.round(c + m * f), Ne.round(d + m * x)) &&
                  (s |= 1 << (r - m - 1));
              return s;
            }
            isWhiteOrBlackRectangle(e, t, r, s) {
              let o = 3;
              ((e = new Tt(e.getX() - o, e.getY() + o)),
                (t = new Tt(t.getX() - o, t.getY() - o)),
                (r = new Tt(r.getX() + o, r.getY() - o)),
                (s = new Tt(s.getX() + o, s.getY() + o)));
              let a = this.getColor(s, e);
              if (a === 0) return !1;
              let c = this.getColor(e, t);
              return c !== a || ((c = this.getColor(t, r)), c !== a)
                ? !1
                : ((c = this.getColor(r, s)), c === a);
            }
            getColor(e, t) {
              let r = this.distancePoint(e, t),
                s = (t.getX() - e.getX()) / r,
                o = (t.getY() - e.getY()) / r,
                a = 0,
                c = e.getX(),
                d = e.getY(),
                f = this.image.get(e.getX(), e.getY()),
                x = Math.ceil(r);
              for (let C = 0; C < x; C++)
                ((c += s),
                  (d += o),
                  this.image.get(Ne.round(c), Ne.round(d)) !== f && a++);
              let m = a / r;
              return m > 0.1 && m < 0.9 ? 0 : m <= 0.1 === f ? 1 : -1;
            }
            getFirstDifferent(e, t, r, s) {
              let o = e.getX() + r,
                a = e.getY() + s;
              for (; this.isValid(o, a) && this.image.get(o, a) === t;)
                ((o += r), (a += s));
              for (
                o -= r, a -= s;
                this.isValid(o, a) && this.image.get(o, a) === t;
              )
                o += r;
              for (o -= r; this.isValid(o, a) && this.image.get(o, a) === t;)
                a += s;
              return ((a -= s), new Tt(o, a));
            }
            expandSquare(e, t, r) {
              let s = r / (2 * t),
                o = e[0].getX() - e[2].getX(),
                a = e[0].getY() - e[2].getY(),
                c = (e[0].getX() + e[2].getX()) / 2,
                d = (e[0].getY() + e[2].getY()) / 2,
                f = new de(c + s * o, d + s * a),
                x = new de(c - s * o, d - s * a);
              ((o = e[1].getX() - e[3].getX()),
                (a = e[1].getY() - e[3].getY()),
                (c = (e[1].getX() + e[3].getX()) / 2),
                (d = (e[1].getY() + e[3].getY()) / 2));
              let m = new de(c + s * o, d + s * a),
                C = new de(c - s * o, d - s * a);
              return [f, m, x, C];
            }
            isValid(e, t) {
              return (
                e >= 0 &&
                e < this.image.getWidth() &&
                t > 0 &&
                t < this.image.getHeight()
              );
            }
            isValidPoint(e) {
              let t = Ne.round(e.getX()),
                r = Ne.round(e.getY());
              return this.isValid(t, r);
            }
            distancePoint(e, t) {
              return Ne.distance(e.getX(), e.getY(), t.getX(), t.getY());
            }
            distanceResultPoint(e, t) {
              return Ne.distance(e.getX(), e.getY(), t.getX(), t.getY());
            }
            getDimension() {
              return this.compact
                ? 4 * this.nbLayers + 11
                : this.nbLayers <= 4
                  ? 4 * this.nbLayers + 15
                  : 4 * this.nbLayers +
                    2 * (H.truncDivision(this.nbLayers - 4, 8) + 1) +
                    15;
            }
          }
          class si {
            decode(e, t = null) {
              let r = null,
                s = new ta(e.getBlackMatrix()),
                o = null,
                a = null;
              try {
                let x = s.detectMirror(!1);
                ((o = x.getPoints()),
                  this.reportFoundResultPoints(t, o),
                  (a = new Fe().decode(x)));
              } catch (x) {
                r = x;
              }
              if (a == null)
                try {
                  let x = s.detectMirror(!0);
                  ((o = x.getPoints()),
                    this.reportFoundResultPoints(t, o),
                    (a = new Fe().decode(x)));
                } catch (x) {
                  throw r ?? x;
                }
              let c = new st(
                  a.getText(),
                  a.getRawBytes(),
                  a.getNumBits(),
                  o,
                  oe.AZTEC,
                  M.currentTimeMillis(),
                ),
                d = a.getByteSegments();
              d != null && c.putMetadata(Ze.BYTE_SEGMENTS, d);
              let f = a.getECLevel();
              return (
                f != null && c.putMetadata(Ze.ERROR_CORRECTION_LEVEL, f),
                c
              );
            }
            reportFoundResultPoints(e, t) {
              if (e != null) {
                let r = e.get(re.NEED_RESULT_POINT_CALLBACK);
                r != null &&
                  t.forEach((s, o, a) => {
                    r.foundPossibleResultPoint(s);
                  });
              }
            }
            reset() {}
          }
          class Gc extends ir {
            constructor(e = 500) {
              super(new si(), e);
            }
          }
          class tt {
            decode(e, t) {
              try {
                return this.doDecode(e, t);
              } catch {
                if (t && t.get(re.TRY_HARDER) === !0 && e.isRotateSupported()) {
                  const o = e.rotateCounterClockwise(),
                    a = this.doDecode(o, t),
                    c = a.getResultMetadata();
                  let d = 270;
                  (c !== null &&
                    c.get(Ze.ORIENTATION) === !0 &&
                    (d = d + (c.get(Ze.ORIENTATION) % 360)),
                    a.putMetadata(Ze.ORIENTATION, d));
                  const f = a.getResultPoints();
                  if (f !== null) {
                    const x = o.getHeight();
                    for (let m = 0; m < f.length; m++)
                      f[m] = new de(x - f[m].getY() - 1, f[m].getX());
                  }
                  return a;
                } else throw new k();
              }
            }
            reset() {}
            doDecode(e, t) {
              const r = e.getWidth(),
                s = e.getHeight();
              let o = new W(r);
              const a = t && t.get(re.TRY_HARDER) === !0,
                c = Math.max(1, s >> (a ? 8 : 5));
              let d;
              a ? (d = s) : (d = 15);
              const f = Math.trunc(s / 2);
              for (let x = 0; x < d; x++) {
                const m = Math.trunc((x + 1) / 2),
                  C = (x & 1) === 0,
                  S = f + c * (C ? m : -m);
                if (S < 0 || S >= s) break;
                try {
                  o = e.getBlackRow(S, o);
                } catch {
                  continue;
                }
                for (let v = 0; v < 2; v++) {
                  if (
                    v === 1 &&
                    (o.reverse(),
                    t && t.get(re.NEED_RESULT_POINT_CALLBACK) === !0)
                  ) {
                    const N = new Map();
                    (t.forEach((O, U) => N.set(U, O)),
                      N.delete(re.NEED_RESULT_POINT_CALLBACK),
                      (t = N));
                  }
                  try {
                    const N = this.decodeRow(S, o, t);
                    if (v === 1) {
                      N.putMetadata(Ze.ORIENTATION, 180);
                      const O = N.getResultPoints();
                      O !== null &&
                        ((O[0] = new de(r - O[0].getX() - 1, O[0].getY())),
                        (O[1] = new de(r - O[1].getX() - 1, O[1].getY())));
                    }
                    return N;
                  } catch {}
                }
              }
              throw new k();
            }
            static recordPattern(e, t, r) {
              const s = r.length;
              for (let f = 0; f < s; f++) r[f] = 0;
              const o = e.getSize();
              if (t >= o) throw new k();
              let a = !e.get(t),
                c = 0,
                d = t;
              for (; d < o;) {
                if (e.get(d) !== a) r[c]++;
                else {
                  if (++c === s) break;
                  ((r[c] = 1), (a = !a));
                }
                d++;
              }
              if (!(c === s || (c === s - 1 && d === o))) throw new k();
            }
            static recordPatternInReverse(e, t, r) {
              let s = r.length,
                o = e.get(t);
              for (; t > 0 && s >= 0;) e.get(--t) !== o && (s--, (o = !o));
              if (s >= 0) throw new k();
              tt.recordPattern(e, t + 1, r);
            }
            static patternMatchVariance(e, t, r) {
              const s = e.length;
              let o = 0,
                a = 0;
              for (let f = 0; f < s; f++) ((o += e[f]), (a += t[f]));
              if (o < a) return Number.POSITIVE_INFINITY;
              const c = o / a;
              r *= c;
              let d = 0;
              for (let f = 0; f < s; f++) {
                const x = e[f],
                  m = t[f] * c,
                  C = x > m ? x - m : m - x;
                if (C > r) return Number.POSITIVE_INFINITY;
                d += C;
              }
              return d / o;
            }
          }
          class te extends tt {
            static findStartPattern(e) {
              const t = e.getSize(),
                r = e.getNextSet(0);
              let s = 0,
                o = Int32Array.from([0, 0, 0, 0, 0, 0]),
                a = r,
                c = !1;
              const d = 6;
              for (let f = r; f < t; f++)
                if (e.get(f) !== c) o[s]++;
                else {
                  if (s === d - 1) {
                    let x = te.MAX_AVG_VARIANCE,
                      m = -1;
                    for (let C = te.CODE_START_A; C <= te.CODE_START_C; C++) {
                      const S = tt.patternMatchVariance(
                        o,
                        te.CODE_PATTERNS[C],
                        te.MAX_INDIVIDUAL_VARIANCE,
                      );
                      S < x && ((x = S), (m = C));
                    }
                    if (
                      m >= 0 &&
                      e.isRange(Math.max(0, a - (f - a) / 2), a, !1)
                    )
                      return Int32Array.from([a, f, m]);
                    ((a += o[0] + o[1]),
                      (o = o.slice(2, o.length - 1)),
                      (o[s - 1] = 0),
                      (o[s] = 0),
                      s--);
                  } else s++;
                  ((o[s] = 1), (c = !c));
                }
              throw new k();
            }
            static decodeCode(e, t, r) {
              tt.recordPattern(e, r, t);
              let s = te.MAX_AVG_VARIANCE,
                o = -1;
              for (let a = 0; a < te.CODE_PATTERNS.length; a++) {
                const c = te.CODE_PATTERNS[a],
                  d = this.patternMatchVariance(
                    t,
                    c,
                    te.MAX_INDIVIDUAL_VARIANCE,
                  );
                d < s && ((s = d), (o = a));
              }
              if (o >= 0) return o;
              throw new k();
            }
            decodeRow(e, t, r) {
              const s = r && r.get(re.ASSUME_GS1) === !0,
                o = te.findStartPattern(t),
                a = o[2];
              let c = 0;
              const d = new Uint8Array(20);
              d[c++] = a;
              let f;
              switch (a) {
                case te.CODE_START_A:
                  f = te.CODE_CODE_A;
                  break;
                case te.CODE_START_B:
                  f = te.CODE_CODE_B;
                  break;
                case te.CODE_START_C:
                  f = te.CODE_CODE_C;
                  break;
                default:
                  throw new Q();
              }
              let x = !1,
                m = !1,
                C = '',
                S = o[0],
                v = o[1];
              const N = Int32Array.from([0, 0, 0, 0, 0, 0]);
              let O = 0,
                U = 0,
                q = a,
                Z = 0,
                K = !0,
                Se = !1,
                Ce = !1;
              for (; !x;) {
                const Un = m;
                switch (
                  ((m = !1),
                  (O = U),
                  (U = te.decodeCode(t, N, v)),
                  (d[c++] = U),
                  U !== te.CODE_STOP && (K = !0),
                  U !== te.CODE_STOP && (Z++, (q += Z * U)),
                  (S = v),
                  (v += N.reduce((E1, b1) => E1 + b1, 0)),
                  U)
                ) {
                  case te.CODE_START_A:
                  case te.CODE_START_B:
                  case te.CODE_START_C:
                    throw new Q();
                }
                switch (f) {
                  case te.CODE_CODE_A:
                    if (U < 64)
                      (Ce === Se
                        ? (C += String.fromCharCode(32 + U))
                        : (C += String.fromCharCode(32 + U + 128)),
                        (Ce = !1));
                    else if (U < 96)
                      (Ce === Se
                        ? (C += String.fromCharCode(U - 64))
                        : (C += String.fromCharCode(U + 64)),
                        (Ce = !1));
                    else
                      switch ((U !== te.CODE_STOP && (K = !1), U)) {
                        case te.CODE_FNC_1:
                          s && (C.length === 0 ? (C += ']C1') : (C += ''));
                          break;
                        case te.CODE_FNC_2:
                        case te.CODE_FNC_3:
                          break;
                        case te.CODE_FNC_4_A:
                          !Se && Ce
                            ? ((Se = !0), (Ce = !1))
                            : Se && Ce
                              ? ((Se = !1), (Ce = !1))
                              : (Ce = !0);
                          break;
                        case te.CODE_SHIFT:
                          ((m = !0), (f = te.CODE_CODE_B));
                          break;
                        case te.CODE_CODE_B:
                          f = te.CODE_CODE_B;
                          break;
                        case te.CODE_CODE_C:
                          f = te.CODE_CODE_C;
                          break;
                        case te.CODE_STOP:
                          x = !0;
                          break;
                      }
                    break;
                  case te.CODE_CODE_B:
                    if (U < 96)
                      (Ce === Se
                        ? (C += String.fromCharCode(32 + U))
                        : (C += String.fromCharCode(32 + U + 128)),
                        (Ce = !1));
                    else
                      switch ((U !== te.CODE_STOP && (K = !1), U)) {
                        case te.CODE_FNC_1:
                          s && (C.length === 0 ? (C += ']C1') : (C += ''));
                          break;
                        case te.CODE_FNC_2:
                        case te.CODE_FNC_3:
                          break;
                        case te.CODE_FNC_4_B:
                          !Se && Ce
                            ? ((Se = !0), (Ce = !1))
                            : Se && Ce
                              ? ((Se = !1), (Ce = !1))
                              : (Ce = !0);
                          break;
                        case te.CODE_SHIFT:
                          ((m = !0), (f = te.CODE_CODE_A));
                          break;
                        case te.CODE_CODE_A:
                          f = te.CODE_CODE_A;
                          break;
                        case te.CODE_CODE_C:
                          f = te.CODE_CODE_C;
                          break;
                        case te.CODE_STOP:
                          x = !0;
                          break;
                      }
                    break;
                  case te.CODE_CODE_C:
                    if (U < 100) (U < 10 && (C += '0'), (C += U));
                    else
                      switch ((U !== te.CODE_STOP && (K = !1), U)) {
                        case te.CODE_FNC_1:
                          s && (C.length === 0 ? (C += ']C1') : (C += ''));
                          break;
                        case te.CODE_CODE_A:
                          f = te.CODE_CODE_A;
                          break;
                        case te.CODE_CODE_B:
                          f = te.CODE_CODE_B;
                          break;
                        case te.CODE_STOP:
                          x = !0;
                          break;
                      }
                    break;
                }
                Un &&
                  (f = f === te.CODE_CODE_A ? te.CODE_CODE_B : te.CODE_CODE_A);
              }
              const Ot = v - S;
              if (
                ((v = t.getNextUnset(v)),
                !t.isRange(v, Math.min(t.getSize(), v + (v - S) / 2), !1))
              )
                throw new k();
              if (((q -= Z * O), q % 103 !== O)) throw new D();
              const Zt = C.length;
              if (Zt === 0) throw new k();
              Zt > 0 &&
                K &&
                (f === te.CODE_CODE_C
                  ? (C = C.substring(0, Zt - 2))
                  : (C = C.substring(0, Zt - 1)));
              const Pt = (o[1] + o[0]) / 2,
                ke = S + Ot / 2,
                wt = d.length,
                _t = new Uint8Array(wt);
              for (let Un = 0; Un < wt; Un++) _t[Un] = d[Un];
              const Fn = [new de(Pt, e), new de(ke, e)];
              return new st(C, _t, 0, Fn, oe.CODE_128, new Date().getTime());
            }
          }
          ((te.CODE_PATTERNS = [
            Int32Array.from([2, 1, 2, 2, 2, 2]),
            Int32Array.from([2, 2, 2, 1, 2, 2]),
            Int32Array.from([2, 2, 2, 2, 2, 1]),
            Int32Array.from([1, 2, 1, 2, 2, 3]),
            Int32Array.from([1, 2, 1, 3, 2, 2]),
            Int32Array.from([1, 3, 1, 2, 2, 2]),
            Int32Array.from([1, 2, 2, 2, 1, 3]),
            Int32Array.from([1, 2, 2, 3, 1, 2]),
            Int32Array.from([1, 3, 2, 2, 1, 2]),
            Int32Array.from([2, 2, 1, 2, 1, 3]),
            Int32Array.from([2, 2, 1, 3, 1, 2]),
            Int32Array.from([2, 3, 1, 2, 1, 2]),
            Int32Array.from([1, 1, 2, 2, 3, 2]),
            Int32Array.from([1, 2, 2, 1, 3, 2]),
            Int32Array.from([1, 2, 2, 2, 3, 1]),
            Int32Array.from([1, 1, 3, 2, 2, 2]),
            Int32Array.from([1, 2, 3, 1, 2, 2]),
            Int32Array.from([1, 2, 3, 2, 2, 1]),
            Int32Array.from([2, 2, 3, 2, 1, 1]),
            Int32Array.from([2, 2, 1, 1, 3, 2]),
            Int32Array.from([2, 2, 1, 2, 3, 1]),
            Int32Array.from([2, 1, 3, 2, 1, 2]),
            Int32Array.from([2, 2, 3, 1, 1, 2]),
            Int32Array.from([3, 1, 2, 1, 3, 1]),
            Int32Array.from([3, 1, 1, 2, 2, 2]),
            Int32Array.from([3, 2, 1, 1, 2, 2]),
            Int32Array.from([3, 2, 1, 2, 2, 1]),
            Int32Array.from([3, 1, 2, 2, 1, 2]),
            Int32Array.from([3, 2, 2, 1, 1, 2]),
            Int32Array.from([3, 2, 2, 2, 1, 1]),
            Int32Array.from([2, 1, 2, 1, 2, 3]),
            Int32Array.from([2, 1, 2, 3, 2, 1]),
            Int32Array.from([2, 3, 2, 1, 2, 1]),
            Int32Array.from([1, 1, 1, 3, 2, 3]),
            Int32Array.from([1, 3, 1, 1, 2, 3]),
            Int32Array.from([1, 3, 1, 3, 2, 1]),
            Int32Array.from([1, 1, 2, 3, 1, 3]),
            Int32Array.from([1, 3, 2, 1, 1, 3]),
            Int32Array.from([1, 3, 2, 3, 1, 1]),
            Int32Array.from([2, 1, 1, 3, 1, 3]),
            Int32Array.from([2, 3, 1, 1, 1, 3]),
            Int32Array.from([2, 3, 1, 3, 1, 1]),
            Int32Array.from([1, 1, 2, 1, 3, 3]),
            Int32Array.from([1, 1, 2, 3, 3, 1]),
            Int32Array.from([1, 3, 2, 1, 3, 1]),
            Int32Array.from([1, 1, 3, 1, 2, 3]),
            Int32Array.from([1, 1, 3, 3, 2, 1]),
            Int32Array.from([1, 3, 3, 1, 2, 1]),
            Int32Array.from([3, 1, 3, 1, 2, 1]),
            Int32Array.from([2, 1, 1, 3, 3, 1]),
            Int32Array.from([2, 3, 1, 1, 3, 1]),
            Int32Array.from([2, 1, 3, 1, 1, 3]),
            Int32Array.from([2, 1, 3, 3, 1, 1]),
            Int32Array.from([2, 1, 3, 1, 3, 1]),
            Int32Array.from([3, 1, 1, 1, 2, 3]),
            Int32Array.from([3, 1, 1, 3, 2, 1]),
            Int32Array.from([3, 3, 1, 1, 2, 1]),
            Int32Array.from([3, 1, 2, 1, 1, 3]),
            Int32Array.from([3, 1, 2, 3, 1, 1]),
            Int32Array.from([3, 3, 2, 1, 1, 1]),
            Int32Array.from([3, 1, 4, 1, 1, 1]),
            Int32Array.from([2, 2, 1, 4, 1, 1]),
            Int32Array.from([4, 3, 1, 1, 1, 1]),
            Int32Array.from([1, 1, 1, 2, 2, 4]),
            Int32Array.from([1, 1, 1, 4, 2, 2]),
            Int32Array.from([1, 2, 1, 1, 2, 4]),
            Int32Array.from([1, 2, 1, 4, 2, 1]),
            Int32Array.from([1, 4, 1, 1, 2, 2]),
            Int32Array.from([1, 4, 1, 2, 2, 1]),
            Int32Array.from([1, 1, 2, 2, 1, 4]),
            Int32Array.from([1, 1, 2, 4, 1, 2]),
            Int32Array.from([1, 2, 2, 1, 1, 4]),
            Int32Array.from([1, 2, 2, 4, 1, 1]),
            Int32Array.from([1, 4, 2, 1, 1, 2]),
            Int32Array.from([1, 4, 2, 2, 1, 1]),
            Int32Array.from([2, 4, 1, 2, 1, 1]),
            Int32Array.from([2, 2, 1, 1, 1, 4]),
            Int32Array.from([4, 1, 3, 1, 1, 1]),
            Int32Array.from([2, 4, 1, 1, 1, 2]),
            Int32Array.from([1, 3, 4, 1, 1, 1]),
            Int32Array.from([1, 1, 1, 2, 4, 2]),
            Int32Array.from([1, 2, 1, 1, 4, 2]),
            Int32Array.from([1, 2, 1, 2, 4, 1]),
            Int32Array.from([1, 1, 4, 2, 1, 2]),
            Int32Array.from([1, 2, 4, 1, 1, 2]),
            Int32Array.from([1, 2, 4, 2, 1, 1]),
            Int32Array.from([4, 1, 1, 2, 1, 2]),
            Int32Array.from([4, 2, 1, 1, 1, 2]),
            Int32Array.from([4, 2, 1, 2, 1, 1]),
            Int32Array.from([2, 1, 2, 1, 4, 1]),
            Int32Array.from([2, 1, 4, 1, 2, 1]),
            Int32Array.from([4, 1, 2, 1, 2, 1]),
            Int32Array.from([1, 1, 1, 1, 4, 3]),
            Int32Array.from([1, 1, 1, 3, 4, 1]),
            Int32Array.from([1, 3, 1, 1, 4, 1]),
            Int32Array.from([1, 1, 4, 1, 1, 3]),
            Int32Array.from([1, 1, 4, 3, 1, 1]),
            Int32Array.from([4, 1, 1, 1, 1, 3]),
            Int32Array.from([4, 1, 1, 3, 1, 1]),
            Int32Array.from([1, 1, 3, 1, 4, 1]),
            Int32Array.from([1, 1, 4, 1, 3, 1]),
            Int32Array.from([3, 1, 1, 1, 4, 1]),
            Int32Array.from([4, 1, 1, 1, 3, 1]),
            Int32Array.from([2, 1, 1, 4, 1, 2]),
            Int32Array.from([2, 1, 1, 2, 1, 4]),
            Int32Array.from([2, 1, 1, 2, 3, 2]),
            Int32Array.from([2, 3, 3, 1, 1, 1, 2]),
          ]),
            (te.MAX_AVG_VARIANCE = 0.25),
            (te.MAX_INDIVIDUAL_VARIANCE = 0.7),
            (te.CODE_SHIFT = 98),
            (te.CODE_CODE_C = 99),
            (te.CODE_CODE_B = 100),
            (te.CODE_CODE_A = 101),
            (te.CODE_FNC_1 = 102),
            (te.CODE_FNC_2 = 97),
            (te.CODE_FNC_3 = 96),
            (te.CODE_FNC_4_A = 101),
            (te.CODE_FNC_4_B = 100),
            (te.CODE_START_A = 103),
            (te.CODE_START_B = 104),
            (te.CODE_START_C = 105),
            (te.CODE_STOP = 106));
          class at extends tt {
            constructor(e = !1, t = !1) {
              (super(),
                (this.usingCheckDigit = e),
                (this.extendedMode = t),
                (this.decodeRowResult = ''),
                (this.counters = new Int32Array(9)));
            }
            decodeRow(e, t, r) {
              let s = this.counters;
              (s.fill(0), (this.decodeRowResult = ''));
              let o = at.findAsteriskPattern(t, s),
                a = t.getNextSet(o[1]),
                c = t.getSize(),
                d,
                f;
              do {
                at.recordPattern(t, a, s);
                let N = at.toNarrowWidePattern(s);
                if (N < 0) throw new k();
                ((d = at.patternToChar(N)),
                  (this.decodeRowResult += d),
                  (f = a));
                for (let O of s) a += O;
                a = t.getNextSet(a);
              } while (d !== '*');
              this.decodeRowResult = this.decodeRowResult.substring(
                0,
                this.decodeRowResult.length - 1,
              );
              let x = 0;
              for (let N of s) x += N;
              let m = a - f - x;
              if (a !== c && m * 2 < x) throw new k();
              if (this.usingCheckDigit) {
                let N = this.decodeRowResult.length - 1,
                  O = 0;
                for (let U = 0; U < N; U++)
                  O += at.ALPHABET_STRING.indexOf(
                    this.decodeRowResult.charAt(U),
                  );
                if (
                  this.decodeRowResult.charAt(N) !==
                  at.ALPHABET_STRING.charAt(O % 43)
                )
                  throw new D();
                this.decodeRowResult = this.decodeRowResult.substring(0, N);
              }
              if (this.decodeRowResult.length === 0) throw new k();
              let C;
              this.extendedMode
                ? (C = at.decodeExtended(this.decodeRowResult))
                : (C = this.decodeRowResult);
              let S = (o[1] + o[0]) / 2,
                v = f + x / 2;
              return new st(
                C,
                null,
                0,
                [new de(S, e), new de(v, e)],
                oe.CODE_39,
                new Date().getTime(),
              );
            }
            static findAsteriskPattern(e, t) {
              let r = e.getSize(),
                s = e.getNextSet(0),
                o = 0,
                a = s,
                c = !1,
                d = t.length;
              for (let f = s; f < r; f++)
                if (e.get(f) !== c) t[o]++;
                else {
                  if (o === d - 1) {
                    if (
                      this.toNarrowWidePattern(t) === at.ASTERISK_ENCODING &&
                      e.isRange(Math.max(0, a - Math.floor((f - a) / 2)), a, !1)
                    )
                      return [a, f];
                    ((a += t[0] + t[1]),
                      t.copyWithin(0, 2, 2 + o - 1),
                      (t[o - 1] = 0),
                      (t[o] = 0),
                      o--);
                  } else o++;
                  ((t[o] = 1), (c = !c));
                }
              throw new k();
            }
            static toNarrowWidePattern(e) {
              let t = e.length,
                r = 0,
                s;
              do {
                let o = 2147483647;
                for (let d of e) d < o && d > r && (o = d);
                ((r = o), (s = 0));
                let a = 0,
                  c = 0;
                for (let d = 0; d < t; d++) {
                  let f = e[d];
                  f > r && ((c |= 1 << (t - 1 - d)), s++, (a += f));
                }
                if (s === 3) {
                  for (let d = 0; d < t && s > 0; d++) {
                    let f = e[d];
                    if (f > r && (s--, f * 2 >= a)) return -1;
                  }
                  return c;
                }
              } while (s > 3);
              return -1;
            }
            static patternToChar(e) {
              for (let t = 0; t < at.CHARACTER_ENCODINGS.length; t++)
                if (at.CHARACTER_ENCODINGS[t] === e)
                  return at.ALPHABET_STRING.charAt(t);
              if (e === at.ASTERISK_ENCODING) return '*';
              throw new k();
            }
            static decodeExtended(e) {
              let t = e.length,
                r = '';
              for (let s = 0; s < t; s++) {
                let o = e.charAt(s);
                if (o === '+' || o === '$' || o === '%' || o === '/') {
                  let a = e.charAt(s + 1),
                    c = '\0';
                  switch (o) {
                    case '+':
                      if (a >= 'A' && a <= 'Z')
                        c = String.fromCharCode(a.charCodeAt(0) + 32);
                      else throw new Q();
                      break;
                    case '$':
                      if (a >= 'A' && a <= 'Z')
                        c = String.fromCharCode(a.charCodeAt(0) - 64);
                      else throw new Q();
                      break;
                    case '%':
                      if (a >= 'A' && a <= 'E')
                        c = String.fromCharCode(a.charCodeAt(0) - 38);
                      else if (a >= 'F' && a <= 'J')
                        c = String.fromCharCode(a.charCodeAt(0) - 11);
                      else if (a >= 'K' && a <= 'O')
                        c = String.fromCharCode(a.charCodeAt(0) + 16);
                      else if (a >= 'P' && a <= 'T')
                        c = String.fromCharCode(a.charCodeAt(0) + 43);
                      else if (a === 'U') c = '\0';
                      else if (a === 'V') c = '@';
                      else if (a === 'W') c = '`';
                      else if (a === 'X' || a === 'Y' || a === 'Z') c = '';
                      else throw new Q();
                      break;
                    case '/':
                      if (a >= 'A' && a <= 'O')
                        c = String.fromCharCode(a.charCodeAt(0) - 32);
                      else if (a === 'Z') c = ':';
                      else throw new Q();
                      break;
                  }
                  ((r += c), s++);
                } else r += o;
              }
              return r;
            }
          }
          ((at.ALPHABET_STRING = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'),
            (at.CHARACTER_ENCODINGS = [
              52, 289, 97, 352, 49, 304, 112, 37, 292, 100, 265, 73, 328, 25,
              280, 88, 13, 268, 76, 28, 259, 67, 322, 19, 274, 82, 7, 262, 70,
              22, 385, 193, 448, 145, 400, 208, 133, 388, 196, 168, 162, 138,
              42,
            ]),
            (at.ASTERISK_ENCODING = 148));
          class _e extends tt {
            constructor() {
              (super(...arguments), (this.narrowLineWidth = -1));
            }
            decodeRow(e, t, r) {
              let s = this.decodeStart(t),
                o = this.decodeEnd(t),
                a = new $();
              _e.decodeMiddle(t, s[1], o[0], a);
              let c = a.toString(),
                d = null;
              (r != null && (d = r.get(re.ALLOWED_LENGTHS)),
                d == null && (d = _e.DEFAULT_ALLOWED_LENGTHS));
              let f = c.length,
                x = !1,
                m = 0;
              for (let v of d) {
                if (f === v) {
                  x = !0;
                  break;
                }
                v > m && (m = v);
              }
              if ((!x && f > m && (x = !0), !x)) throw new Q();
              const C = [new de(s[1], e), new de(o[0], e)];
              return new st(c, null, 0, C, oe.ITF, new Date().getTime());
            }
            static decodeMiddle(e, t, r, s) {
              let o = new Int32Array(10),
                a = new Int32Array(5),
                c = new Int32Array(5);
              for (o.fill(0), a.fill(0), c.fill(0); t < r;) {
                tt.recordPattern(e, t, o);
                for (let f = 0; f < 5; f++) {
                  let x = 2 * f;
                  ((a[f] = o[x]), (c[f] = o[x + 1]));
                }
                let d = _e.decodeDigit(a);
                (s.append(d.toString()),
                  (d = this.decodeDigit(c)),
                  s.append(d.toString()),
                  o.forEach(function (f) {
                    t += f;
                  }));
              }
            }
            decodeStart(e) {
              let t = _e.skipWhiteSpace(e),
                r = _e.findGuardPattern(e, t, _e.START_PATTERN);
              return (
                (this.narrowLineWidth = (r[1] - r[0]) / 4),
                this.validateQuietZone(e, r[0]),
                r
              );
            }
            validateQuietZone(e, t) {
              let r = this.narrowLineWidth * 10;
              r = r < t ? r : t;
              for (let s = t - 1; r > 0 && s >= 0 && !e.get(s); s--) r--;
              if (r !== 0) throw new k();
            }
            static skipWhiteSpace(e) {
              const t = e.getSize(),
                r = e.getNextSet(0);
              if (r === t) throw new k();
              return r;
            }
            decodeEnd(e) {
              e.reverse();
              try {
                let t = _e.skipWhiteSpace(e),
                  r;
                try {
                  r = _e.findGuardPattern(e, t, _e.END_PATTERN_REVERSED[0]);
                } catch (o) {
                  o instanceof k &&
                    (r = _e.findGuardPattern(e, t, _e.END_PATTERN_REVERSED[1]));
                }
                this.validateQuietZone(e, r[0]);
                let s = r[0];
                return (
                  (r[0] = e.getSize() - r[1]),
                  (r[1] = e.getSize() - s),
                  r
                );
              } finally {
                e.reverse();
              }
            }
            static findGuardPattern(e, t, r) {
              let s = r.length,
                o = new Int32Array(s),
                a = e.getSize(),
                c = !1,
                d = 0,
                f = t;
              o.fill(0);
              for (let x = t; x < a; x++)
                if (e.get(x) !== c) o[d]++;
                else {
                  if (d === s - 1) {
                    if (
                      tt.patternMatchVariance(
                        o,
                        r,
                        _e.MAX_INDIVIDUAL_VARIANCE,
                      ) < _e.MAX_AVG_VARIANCE
                    )
                      return [f, x];
                    ((f += o[0] + o[1]),
                      M.arraycopy(o, 2, o, 0, d - 1),
                      (o[d - 1] = 0),
                      (o[d] = 0),
                      d--);
                  } else d++;
                  ((o[d] = 1), (c = !c));
                }
              throw new k();
            }
            static decodeDigit(e) {
              let t = _e.MAX_AVG_VARIANCE,
                r = -1,
                s = _e.PATTERNS.length;
              for (let o = 0; o < s; o++) {
                let a = _e.PATTERNS[o],
                  c = tt.patternMatchVariance(e, a, _e.MAX_INDIVIDUAL_VARIANCE);
                c < t ? ((t = c), (r = o)) : c === t && (r = -1);
              }
              if (r >= 0) return r % 10;
              throw new k();
            }
          }
          ((_e.PATTERNS = [
            Int32Array.from([1, 1, 2, 2, 1]),
            Int32Array.from([2, 1, 1, 1, 2]),
            Int32Array.from([1, 2, 1, 1, 2]),
            Int32Array.from([2, 2, 1, 1, 1]),
            Int32Array.from([1, 1, 2, 1, 2]),
            Int32Array.from([2, 1, 2, 1, 1]),
            Int32Array.from([1, 2, 2, 1, 1]),
            Int32Array.from([1, 1, 1, 2, 2]),
            Int32Array.from([2, 1, 1, 2, 1]),
            Int32Array.from([1, 2, 1, 2, 1]),
            Int32Array.from([1, 1, 3, 3, 1]),
            Int32Array.from([3, 1, 1, 1, 3]),
            Int32Array.from([1, 3, 1, 1, 3]),
            Int32Array.from([3, 3, 1, 1, 1]),
            Int32Array.from([1, 1, 3, 1, 3]),
            Int32Array.from([3, 1, 3, 1, 1]),
            Int32Array.from([1, 3, 3, 1, 1]),
            Int32Array.from([1, 1, 1, 3, 3]),
            Int32Array.from([3, 1, 1, 3, 1]),
            Int32Array.from([1, 3, 1, 3, 1]),
          ]),
            (_e.MAX_AVG_VARIANCE = 0.38),
            (_e.MAX_INDIVIDUAL_VARIANCE = 0.5),
            (_e.DEFAULT_ALLOWED_LENGTHS = [6, 8, 10, 12, 14]),
            (_e.START_PATTERN = Int32Array.from([1, 1, 1, 1])),
            (_e.END_PATTERN_REVERSED = [
              Int32Array.from([1, 1, 2]),
              Int32Array.from([1, 1, 3]),
            ]));
          class Ge extends tt {
            constructor() {
              (super(...arguments), (this.decodeRowStringBuffer = ''));
            }
            static findStartGuardPattern(e) {
              let t = !1,
                r,
                s = 0,
                o = Int32Array.from([0, 0, 0]);
              for (; !t;) {
                ((o = Int32Array.from([0, 0, 0])),
                  (r = Ge.findGuardPattern(
                    e,
                    s,
                    !1,
                    this.START_END_PATTERN,
                    o,
                  )));
                let a = r[0];
                s = r[1];
                let c = a - (s - a);
                c >= 0 && (t = e.isRange(c, a, !1));
              }
              return r;
            }
            static checkChecksum(e) {
              return Ge.checkStandardUPCEANChecksum(e);
            }
            static checkStandardUPCEANChecksum(e) {
              let t = e.length;
              if (t === 0) return !1;
              let r = parseInt(e.charAt(t - 1), 10);
              return Ge.getStandardUPCEANChecksum(e.substring(0, t - 1)) === r;
            }
            static getStandardUPCEANChecksum(e) {
              let t = e.length,
                r = 0;
              for (let s = t - 1; s >= 0; s -= 2) {
                let o = e.charAt(s).charCodeAt(0) - 48;
                if (o < 0 || o > 9) throw new Q();
                r += o;
              }
              r *= 3;
              for (let s = t - 2; s >= 0; s -= 2) {
                let o = e.charAt(s).charCodeAt(0) - 48;
                if (o < 0 || o > 9) throw new Q();
                r += o;
              }
              return (1e3 - r) % 10;
            }
            static decodeEnd(e, t) {
              return Ge.findGuardPattern(
                e,
                t,
                !1,
                Ge.START_END_PATTERN,
                new Int32Array(Ge.START_END_PATTERN.length).fill(0),
              );
            }
            static findGuardPatternWithoutCounters(e, t, r, s) {
              return this.findGuardPattern(
                e,
                t,
                r,
                s,
                new Int32Array(s.length),
              );
            }
            static findGuardPattern(e, t, r, s, o) {
              let a = e.getSize();
              t = r ? e.getNextUnset(t) : e.getNextSet(t);
              let c = 0,
                d = t,
                f = s.length,
                x = r;
              for (let m = t; m < a; m++)
                if (e.get(m) !== x) o[c]++;
                else {
                  if (c === f - 1) {
                    if (
                      tt.patternMatchVariance(
                        o,
                        s,
                        Ge.MAX_INDIVIDUAL_VARIANCE,
                      ) < Ge.MAX_AVG_VARIANCE
                    )
                      return Int32Array.from([d, m]);
                    d += o[0] + o[1];
                    let C = o.slice(2, o.length - 1);
                    for (let S = 0; S < c - 1; S++) o[S] = C[S];
                    ((o[c - 1] = 0), (o[c] = 0), c--);
                  } else c++;
                  ((o[c] = 1), (x = !x));
                }
              throw new k();
            }
            static decodeDigit(e, t, r, s) {
              this.recordPattern(e, r, t);
              let o = this.MAX_AVG_VARIANCE,
                a = -1,
                c = s.length;
              for (let d = 0; d < c; d++) {
                let f = s[d],
                  x = tt.patternMatchVariance(t, f, Ge.MAX_INDIVIDUAL_VARIANCE);
                x < o && ((o = x), (a = d));
              }
              if (a >= 0) return a;
              throw new k();
            }
          }
          ((Ge.MAX_AVG_VARIANCE = 0.48),
            (Ge.MAX_INDIVIDUAL_VARIANCE = 0.7),
            (Ge.START_END_PATTERN = Int32Array.from([1, 1, 1])),
            (Ge.MIDDLE_PATTERN = Int32Array.from([1, 1, 1, 1, 1])),
            (Ge.END_PATTERN = Int32Array.from([1, 1, 1, 1, 1, 1])),
            (Ge.L_PATTERNS = [
              Int32Array.from([3, 2, 1, 1]),
              Int32Array.from([2, 2, 2, 1]),
              Int32Array.from([2, 1, 2, 2]),
              Int32Array.from([1, 4, 1, 1]),
              Int32Array.from([1, 1, 3, 2]),
              Int32Array.from([1, 2, 3, 1]),
              Int32Array.from([1, 1, 1, 4]),
              Int32Array.from([1, 3, 1, 2]),
              Int32Array.from([1, 2, 1, 3]),
              Int32Array.from([3, 1, 1, 2]),
            ]));
          class ls {
            constructor() {
              ((this.CHECK_DIGIT_ENCODINGS = [
                24, 20, 18, 17, 12, 6, 3, 10, 9, 5,
              ]),
                (this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0])),
                (this.decodeRowStringBuffer = ''));
            }
            decodeRow(e, t, r) {
              let s = this.decodeRowStringBuffer,
                o = this.decodeMiddle(t, r, s),
                a = s.toString(),
                c = ls.parseExtensionString(a),
                d = [new de((r[0] + r[1]) / 2, e), new de(o, e)],
                f = new st(
                  a,
                  null,
                  0,
                  d,
                  oe.UPC_EAN_EXTENSION,
                  new Date().getTime(),
                );
              return (c != null && f.putAllMetadata(c), f);
            }
            decodeMiddle(e, t, r) {
              let s = this.decodeMiddleCounters;
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              let o = e.getSize(),
                a = t[1],
                c = 0;
              for (let f = 0; f < 5 && a < o; f++) {
                let x = Ge.decodeDigit(e, s, a, Ge.L_AND_G_PATTERNS);
                r += String.fromCharCode(48 + (x % 10));
                for (let m of s) a += m;
                (x >= 10 && (c |= 1 << (4 - f)),
                  f !== 4 && ((a = e.getNextSet(a)), (a = e.getNextUnset(a))));
              }
              if (r.length !== 5) throw new k();
              let d = this.determineCheckDigit(c);
              if (ls.extensionChecksum(r.toString()) !== d) throw new k();
              return a;
            }
            static extensionChecksum(e) {
              let t = e.length,
                r = 0;
              for (let s = t - 2; s >= 0; s -= 2)
                r += e.charAt(s).charCodeAt(0) - 48;
              r *= 3;
              for (let s = t - 1; s >= 0; s -= 2)
                r += e.charAt(s).charCodeAt(0) - 48;
              return ((r *= 3), r % 10);
            }
            determineCheckDigit(e) {
              for (let t = 0; t < 10; t++)
                if (e === this.CHECK_DIGIT_ENCODINGS[t]) return t;
              throw new k();
            }
            static parseExtensionString(e) {
              if (e.length !== 5) return null;
              let t = ls.parseExtension5String(e);
              return t == null ? null : new Map([[Ze.SUGGESTED_PRICE, t]]);
            }
            static parseExtension5String(e) {
              let t;
              switch (e.charAt(0)) {
                case '0':
                  t = '£';
                  break;
                case '5':
                  t = '$';
                  break;
                case '9':
                  switch (e) {
                    case '90000':
                      return null;
                    case '99991':
                      return '0.00';
                    case '99990':
                      return 'Used';
                  }
                  t = '';
                  break;
                default:
                  t = '';
                  break;
              }
              let r = parseInt(e.substring(1)),
                s = (r / 100).toString(),
                o = r % 100,
                a = o < 10 ? '0' + o : o.toString();
              return t + s + '.' + a;
            }
          }
          class Oi {
            constructor() {
              ((this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0])),
                (this.decodeRowStringBuffer = ''));
            }
            decodeRow(e, t, r) {
              let s = this.decodeRowStringBuffer,
                o = this.decodeMiddle(t, r, s),
                a = s.toString(),
                c = Oi.parseExtensionString(a),
                d = [new de((r[0] + r[1]) / 2, e), new de(o, e)],
                f = new st(
                  a,
                  null,
                  0,
                  d,
                  oe.UPC_EAN_EXTENSION,
                  new Date().getTime(),
                );
              return (c != null && f.putAllMetadata(c), f);
            }
            decodeMiddle(e, t, r) {
              let s = this.decodeMiddleCounters;
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              let o = e.getSize(),
                a = t[1],
                c = 0;
              for (let d = 0; d < 2 && a < o; d++) {
                let f = Ge.decodeDigit(e, s, a, Ge.L_AND_G_PATTERNS);
                r += String.fromCharCode(48 + (f % 10));
                for (let x of s) a += x;
                (f >= 10 && (c |= 1 << (1 - d)),
                  d !== 1 && ((a = e.getNextSet(a)), (a = e.getNextUnset(a))));
              }
              if (r.length !== 2) throw new k();
              if (parseInt(r.toString()) % 4 !== c) throw new k();
              return a;
            }
            static parseExtensionString(e) {
              return e.length !== 2
                ? null
                : new Map([[Ze.ISSUE_NUMBER, parseInt(e)]]);
            }
          }
          class ra {
            static decodeRow(e, t, r) {
              let s = Ge.findGuardPattern(
                t,
                r,
                !1,
                this.EXTENSION_START_PATTERN,
                new Int32Array(this.EXTENSION_START_PATTERN.length).fill(0),
              );
              try {
                return new ls().decodeRow(e, t, s);
              } catch {
                return new Oi().decodeRow(e, t, s);
              }
            }
          }
          ra.EXTENSION_START_PATTERN = Int32Array.from([1, 1, 2]);
          class De extends Ge {
            constructor() {
              (super(),
                (this.decodeRowStringBuffer = ''),
                (De.L_AND_G_PATTERNS = De.L_PATTERNS.map((e) =>
                  Int32Array.from(e),
                )));
              for (let e = 10; e < 20; e++) {
                let t = De.L_PATTERNS[e - 10],
                  r = new Int32Array(t.length);
                for (let s = 0; s < t.length; s++) r[s] = t[t.length - s - 1];
                De.L_AND_G_PATTERNS[e] = r;
              }
            }
            decodeRow(e, t, r) {
              let s = De.findStartGuardPattern(t),
                o = r == null ? null : r.get(re.NEED_RESULT_POINT_CALLBACK);
              if (o != null) {
                const K = new de((s[0] + s[1]) / 2, e);
                o.foundPossibleResultPoint(K);
              }
              let a = this.decodeMiddle(t, s, this.decodeRowStringBuffer),
                c = a.rowOffset,
                d = a.resultString;
              if (o != null) {
                const K = new de(c, e);
                o.foundPossibleResultPoint(K);
              }
              let f = this.decodeEnd(t, c);
              if (o != null) {
                const K = new de((f[0] + f[1]) / 2, e);
                o.foundPossibleResultPoint(K);
              }
              let x = f[1],
                m = x + (x - f[0]);
              if (m >= t.getSize() || !t.isRange(x, m, !1)) throw new k();
              let C = d.toString();
              if (C.length < 8) throw new Q();
              if (!De.checkChecksum(C)) throw new D();
              let S = (s[1] + s[0]) / 2,
                v = (f[1] + f[0]) / 2,
                N = this.getBarcodeFormat(),
                O = [new de(S, e), new de(v, e)],
                U = new st(C, null, 0, O, N, new Date().getTime()),
                q = 0;
              try {
                let K = ra.decodeRow(e, t, f[1]);
                (U.putMetadata(Ze.UPC_EAN_EXTENSION, K.getText()),
                  U.putAllMetadata(K.getResultMetadata()),
                  U.addResultPoints(K.getResultPoints()),
                  (q = K.getText().length));
              } catch {}
              let Z = r == null ? null : r.get(re.ALLOWED_EAN_EXTENSIONS);
              if (Z != null) {
                let K = !1;
                for (let Se in Z)
                  if (q.toString() === Se) {
                    K = !0;
                    break;
                  }
                if (!K) throw new k();
              }
              return U;
            }
            decodeEnd(e, t) {
              return De.findGuardPattern(
                e,
                t,
                !1,
                De.START_END_PATTERN,
                new Int32Array(De.START_END_PATTERN.length).fill(0),
              );
            }
            static checkChecksum(e) {
              return De.checkStandardUPCEANChecksum(e);
            }
            static checkStandardUPCEANChecksum(e) {
              let t = e.length;
              if (t === 0) return !1;
              let r = parseInt(e.charAt(t - 1), 10);
              return De.getStandardUPCEANChecksum(e.substring(0, t - 1)) === r;
            }
            static getStandardUPCEANChecksum(e) {
              let t = e.length,
                r = 0;
              for (let s = t - 1; s >= 0; s -= 2) {
                let o = e.charAt(s).charCodeAt(0) - 48;
                if (o < 0 || o > 9) throw new Q();
                r += o;
              }
              r *= 3;
              for (let s = t - 2; s >= 0; s -= 2) {
                let o = e.charAt(s).charCodeAt(0) - 48;
                if (o < 0 || o > 9) throw new Q();
                r += o;
              }
              return (1e3 - r) % 10;
            }
          }
          class Jr extends De {
            constructor() {
              (super(),
                (this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0])));
            }
            decodeMiddle(e, t, r) {
              let s = this.decodeMiddleCounters;
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              let o = e.getSize(),
                a = t[1],
                c = 0;
              for (let f = 0; f < 6 && a < o; f++) {
                let x = De.decodeDigit(e, s, a, De.L_AND_G_PATTERNS);
                r += String.fromCharCode(48 + (x % 10));
                for (let m of s) a += m;
                x >= 10 && (c |= 1 << (5 - f));
              }
              ((r = Jr.determineFirstDigit(r, c)),
                (a = De.findGuardPattern(
                  e,
                  a,
                  !0,
                  De.MIDDLE_PATTERN,
                  new Int32Array(De.MIDDLE_PATTERN.length).fill(0),
                )[1]));
              for (let f = 0; f < 6 && a < o; f++) {
                let x = De.decodeDigit(e, s, a, De.L_PATTERNS);
                r += String.fromCharCode(48 + x);
                for (let m of s) a += m;
              }
              return { rowOffset: a, resultString: r };
            }
            getBarcodeFormat() {
              return oe.EAN_13;
            }
            static determineFirstDigit(e, t) {
              for (let r = 0; r < 10; r++)
                if (t === this.FIRST_DIGIT_ENCODINGS[r])
                  return ((e = String.fromCharCode(48 + r) + e), e);
              throw new k();
            }
          }
          Jr.FIRST_DIGIT_ENCODINGS = [0, 11, 13, 14, 19, 25, 28, 21, 22, 26];
          class na extends De {
            constructor() {
              (super(),
                (this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0])));
            }
            decodeMiddle(e, t, r) {
              const s = this.decodeMiddleCounters;
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              let o = e.getSize(),
                a = t[1];
              for (let d = 0; d < 4 && a < o; d++) {
                let f = De.decodeDigit(e, s, a, De.L_PATTERNS);
                r += String.fromCharCode(48 + f);
                for (let x of s) a += x;
              }
              a = De.findGuardPattern(
                e,
                a,
                !0,
                De.MIDDLE_PATTERN,
                new Int32Array(De.MIDDLE_PATTERN.length).fill(0),
              )[1];
              for (let d = 0; d < 4 && a < o; d++) {
                let f = De.decodeDigit(e, s, a, De.L_PATTERNS);
                r += String.fromCharCode(48 + f);
                for (let x of s) a += x;
              }
              return { rowOffset: a, resultString: r };
            }
            getBarcodeFormat() {
              return oe.EAN_8;
            }
          }
          class sa extends De {
            constructor() {
              (super(...arguments), (this.ean13Reader = new Jr()));
            }
            getBarcodeFormat() {
              return oe.UPC_A;
            }
            decode(e, t) {
              return this.maybeReturnResult(this.ean13Reader.decode(e));
            }
            decodeRow(e, t, r) {
              return this.maybeReturnResult(
                this.ean13Reader.decodeRow(e, t, r),
              );
            }
            decodeMiddle(e, t, r) {
              return this.ean13Reader.decodeMiddle(e, t, r);
            }
            maybeReturnResult(e) {
              let t = e.getText();
              if (t.charAt(0) === '0') {
                let r = new st(
                  t.substring(1),
                  null,
                  null,
                  e.getResultPoints(),
                  oe.UPC_A,
                );
                return (
                  e.getResultMetadata() != null &&
                    r.putAllMetadata(e.getResultMetadata()),
                  r
                );
              } else throw new k();
            }
            reset() {
              this.ean13Reader.reset();
            }
          }
          class qt extends De {
            constructor() {
              (super(), (this.decodeMiddleCounters = new Int32Array(4)));
            }
            decodeMiddle(e, t, r) {
              const s = this.decodeMiddleCounters.map((f) => f);
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              const o = e.getSize();
              let a = t[1],
                c = 0;
              for (let f = 0; f < 6 && a < o; f++) {
                const x = qt.decodeDigit(e, s, a, qt.L_AND_G_PATTERNS);
                r += String.fromCharCode(48 + (x % 10));
                for (let m of s) a += m;
                x >= 10 && (c |= 1 << (5 - f));
              }
              let d = qt.determineNumSysAndCheckDigit(r, c);
              return { rowOffset: a, resultString: d };
            }
            decodeEnd(e, t) {
              return qt.findGuardPatternWithoutCounters(
                e,
                t,
                !0,
                qt.MIDDLE_END_PATTERN,
              );
            }
            checkChecksum(e) {
              return De.checkChecksum(qt.convertUPCEtoUPCA(e));
            }
            static determineNumSysAndCheckDigit(e, t) {
              for (let r = 0; r <= 1; r++)
                for (let s = 0; s < 10; s++)
                  if (t === this.NUMSYS_AND_CHECK_DIGIT_PATTERNS[r][s]) {
                    let o = String.fromCharCode(48 + r),
                      a = String.fromCharCode(48 + s);
                    return o + e + a;
                  }
              throw k.getNotFoundInstance();
            }
            getBarcodeFormat() {
              return oe.UPC_E;
            }
            static convertUPCEtoUPCA(e) {
              const t = e
                  .slice(1, 7)
                  .split('')
                  .map((o) => o.charCodeAt(0)),
                r = new $();
              r.append(e.charAt(0));
              let s = t[5];
              switch (s) {
                case 0:
                case 1:
                case 2:
                  (r.appendChars(t, 0, 2),
                    r.append(s),
                    r.append('0000'),
                    r.appendChars(t, 2, 3));
                  break;
                case 3:
                  (r.appendChars(t, 0, 3),
                    r.append('00000'),
                    r.appendChars(t, 3, 2));
                  break;
                case 4:
                  (r.appendChars(t, 0, 4), r.append('00000'), r.append(t[4]));
                  break;
                default:
                  (r.appendChars(t, 0, 5), r.append('0000'), r.append(s));
                  break;
              }
              return (e.length >= 8 && r.append(e.charAt(7)), r.toString());
            }
          }
          ((qt.MIDDLE_END_PATTERN = Int32Array.from([1, 1, 1, 1, 1, 1])),
            (qt.NUMSYS_AND_CHECK_DIGIT_PATTERNS = [
              Int32Array.from([56, 52, 50, 49, 44, 38, 35, 42, 41, 37]),
              Int32Array.from([7, 11, 13, 14, 19, 25, 28, 21, 22, 26]),
            ]));
          class Pi extends tt {
            constructor(e) {
              super();
              let t = e == null ? null : e.get(re.POSSIBLE_FORMATS),
                r = [];
              (u(t)
                ? (r.push(new Jr()),
                  r.push(new sa()),
                  r.push(new na()),
                  r.push(new qt()))
                : (t.indexOf(oe.EAN_13) > -1 && r.push(new Jr()),
                  t.indexOf(oe.UPC_A) > -1 && r.push(new sa()),
                  t.indexOf(oe.EAN_8) > -1 && r.push(new na()),
                  t.indexOf(oe.UPC_E) > -1 && r.push(new qt())),
                (this.readers = r));
            }
            decodeRow(e, t, r) {
              for (let s of this.readers)
                try {
                  const o = s.decodeRow(e, t, r),
                    a =
                      o.getBarcodeFormat() === oe.EAN_13 &&
                      o.getText().charAt(0) === '0',
                    c = r == null ? null : r.get(re.POSSIBLE_FORMATS),
                    d = c == null || c.includes(oe.UPC_A);
                  if (a && d) {
                    const f = o.getRawBytes(),
                      x = new st(
                        o.getText().substring(1),
                        f,
                        f ? f.length : null,
                        o.getResultPoints(),
                        oe.UPC_A,
                      );
                    return (x.putAllMetadata(o.getResultMetadata()), x);
                  }
                  return o;
                } catch {}
              throw new k();
            }
            reset() {
              for (let e of this.readers) e.reset();
            }
          }
          class Et extends tt {
            constructor() {
              (super(),
                (this.decodeFinderCounters = new Int32Array(4)),
                (this.dataCharacterCounters = new Int32Array(8)),
                (this.oddRoundingErrors = new Array(4)),
                (this.evenRoundingErrors = new Array(4)),
                (this.oddCounts = new Array(
                  this.dataCharacterCounters.length / 2,
                )),
                (this.evenCounts = new Array(
                  this.dataCharacterCounters.length / 2,
                )));
            }
            getDecodeFinderCounters() {
              return this.decodeFinderCounters;
            }
            getDataCharacterCounters() {
              return this.dataCharacterCounters;
            }
            getOddRoundingErrors() {
              return this.oddRoundingErrors;
            }
            getEvenRoundingErrors() {
              return this.evenRoundingErrors;
            }
            getOddCounts() {
              return this.oddCounts;
            }
            getEvenCounts() {
              return this.evenCounts;
            }
            parseFinderValue(e, t) {
              for (let r = 0; r < t.length; r++)
                if (
                  tt.patternMatchVariance(e, t[r], Et.MAX_INDIVIDUAL_VARIANCE) <
                  Et.MAX_AVG_VARIANCE
                )
                  return r;
              throw new k();
            }
            static count(e) {
              return Ne.sum(new Int32Array(e));
            }
            static increment(e, t) {
              let r = 0,
                s = t[0];
              for (let o = 1; o < e.length; o++)
                t[o] > s && ((s = t[o]), (r = o));
              e[r]++;
            }
            static decrement(e, t) {
              let r = 0,
                s = t[0];
              for (let o = 1; o < e.length; o++)
                t[o] < s && ((s = t[o]), (r = o));
              e[r]--;
            }
            static isFinderPattern(e) {
              let t = e[0] + e[1],
                r = t + e[2] + e[3],
                s = t / r;
              if (
                s >= Et.MIN_FINDER_PATTERN_RATIO &&
                s <= Et.MAX_FINDER_PATTERN_RATIO
              ) {
                let o = Number.MAX_SAFE_INTEGER,
                  a = Number.MIN_SAFE_INTEGER;
                for (let c of e) (c > a && (a = c), c < o && (o = c));
                return a < 10 * o;
              }
              return !1;
            }
          }
          ((Et.MAX_AVG_VARIANCE = 0.2),
            (Et.MAX_INDIVIDUAL_VARIANCE = 0.45),
            (Et.MIN_FINDER_PATTERN_RATIO = 9.5 / 12),
            (Et.MAX_FINDER_PATTERN_RATIO = 12.5 / 14));
          class Dn {
            constructor(e, t) {
              ((this.value = e), (this.checksumPortion = t));
            }
            getValue() {
              return this.value;
            }
            getChecksumPortion() {
              return this.checksumPortion;
            }
            toString() {
              return this.value + '(' + this.checksumPortion + ')';
            }
            equals(e) {
              if (!(e instanceof Dn)) return !1;
              const t = e;
              return (
                this.value === t.value &&
                this.checksumPortion === t.checksumPortion
              );
            }
            hashCode() {
              return this.value ^ this.checksumPortion;
            }
          }
          class ii {
            constructor(e, t, r, s, o) {
              ((this.value = e),
                (this.startEnd = t),
                (this.value = e),
                (this.startEnd = t),
                (this.resultPoints = new Array()),
                this.resultPoints.push(new de(r, o)),
                this.resultPoints.push(new de(s, o)));
            }
            getValue() {
              return this.value;
            }
            getStartEnd() {
              return this.startEnd;
            }
            getResultPoints() {
              return this.resultPoints;
            }
            equals(e) {
              if (!(e instanceof ii)) return !1;
              const t = e;
              return this.value === t.value;
            }
            hashCode() {
              return this.value;
            }
          }
          class ar {
            constructor() {}
            static getRSSvalue(e, t, r) {
              let s = 0;
              for (let d of e) s += d;
              let o = 0,
                a = 0,
                c = e.length;
              for (let d = 0; d < c - 1; d++) {
                let f;
                for (f = 1, a |= 1 << d; f < e[d]; f++, a &= ~(1 << d)) {
                  let x = ar.combins(s - f - 1, c - d - 2);
                  if (
                    (r &&
                      a === 0 &&
                      s - f - (c - d - 1) >= c - d - 1 &&
                      (x -= ar.combins(s - f - (c - d), c - d - 2)),
                    c - d - 1 > 1)
                  ) {
                    let m = 0;
                    for (let C = s - f - (c - d - 2); C > t; C--)
                      m += ar.combins(s - f - C - 1, c - d - 3);
                    x -= m * (c - 1 - d);
                  } else s - f > t && x--;
                  o += x;
                }
                s -= f;
              }
              return o;
            }
            static combins(e, t) {
              let r, s;
              e - t > t ? ((s = t), (r = e - t)) : ((s = e - t), (r = t));
              let o = 1,
                a = 1;
              for (let c = e; c > r; c--) ((o *= c), a <= s && ((o /= a), a++));
              for (; a <= s;) ((o /= a), a++);
              return o;
            }
          }
          class Yc {
            static buildBitArray(e) {
              let t = e.length * 2 - 1;
              e[e.length - 1].getRightChar() == null && (t -= 1);
              let r = 12 * t,
                s = new W(r),
                o = 0,
                c = e[0].getRightChar().getValue();
              for (let d = 11; d >= 0; --d)
                ((c & (1 << d)) != 0 && s.set(o), o++);
              for (let d = 1; d < e.length; ++d) {
                let f = e[d],
                  x = f.getLeftChar().getValue();
                for (let m = 11; m >= 0; --m)
                  ((x & (1 << m)) != 0 && s.set(o), o++);
                if (f.getRightChar() != null) {
                  let m = f.getRightChar().getValue();
                  for (let C = 11; C >= 0; --C)
                    ((m & (1 << C)) != 0 && s.set(o), o++);
                }
              }
              return s;
            }
          }
          class qr {
            constructor(e, t) {
              t
                ? (this.decodedInformation = null)
                : ((this.finished = e), (this.decodedInformation = t));
            }
            getDecodedInformation() {
              return this.decodedInformation;
            }
            isFinished() {
              return this.finished;
            }
          }
          class Bi {
            constructor(e) {
              this.newPosition = e;
            }
            getNewPosition() {
              return this.newPosition;
            }
          }
          class Nt extends Bi {
            constructor(e, t) {
              (super(e), (this.value = t));
            }
            getValue() {
              return this.value;
            }
            isFNC1() {
              return this.value === Nt.FNC1;
            }
          }
          Nt.FNC1 = '$';
          class Zr extends Bi {
            constructor(e, t, r) {
              (super(e),
                r
                  ? ((this.remaining = !0),
                    (this.remainingValue = this.remainingValue))
                  : ((this.remaining = !1), (this.remainingValue = 0)),
                (this.newString = t));
            }
            getNewString() {
              return this.newString;
            }
            isRemaining() {
              return this.remaining;
            }
            getRemainingValue() {
              return this.remainingValue;
            }
          }
          class Vt extends Bi {
            constructor(e, t, r) {
              if ((super(e), t < 0 || t > 10 || r < 0 || r > 10)) throw new Q();
              ((this.firstDigit = t), (this.secondDigit = r));
            }
            getFirstDigit() {
              return this.firstDigit;
            }
            getSecondDigit() {
              return this.secondDigit;
            }
            getValue() {
              return this.firstDigit * 10 + this.secondDigit;
            }
            isFirstDigitFNC1() {
              return this.firstDigit === Vt.FNC1;
            }
            isSecondDigitFNC1() {
              return this.secondDigit === Vt.FNC1;
            }
            isAnyFNC1() {
              return (
                this.firstDigit === Vt.FNC1 || this.secondDigit === Vt.FNC1
              );
            }
          }
          Vt.FNC1 = 10;
          class ae {
            constructor() {}
            static parseFieldsInGeneralPurpose(e) {
              if (!e) return null;
              if (e.length < 2) throw new k();
              let t = e.substring(0, 2);
              for (let o of ae.TWO_DIGIT_DATA_LENGTH)
                if (o[0] === t)
                  return o[1] === ae.VARIABLE_LENGTH
                    ? ae.processVariableAI(2, o[2], e)
                    : ae.processFixedAI(2, o[1], e);
              if (e.length < 3) throw new k();
              let r = e.substring(0, 3);
              for (let o of ae.THREE_DIGIT_DATA_LENGTH)
                if (o[0] === r)
                  return o[1] === ae.VARIABLE_LENGTH
                    ? ae.processVariableAI(3, o[2], e)
                    : ae.processFixedAI(3, o[1], e);
              for (let o of ae.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH)
                if (o[0] === r)
                  return o[1] === ae.VARIABLE_LENGTH
                    ? ae.processVariableAI(4, o[2], e)
                    : ae.processFixedAI(4, o[1], e);
              if (e.length < 4) throw new k();
              let s = e.substring(0, 4);
              for (let o of ae.FOUR_DIGIT_DATA_LENGTH)
                if (o[0] === s)
                  return o[1] === ae.VARIABLE_LENGTH
                    ? ae.processVariableAI(4, o[2], e)
                    : ae.processFixedAI(4, o[1], e);
              throw new k();
            }
            static processFixedAI(e, t, r) {
              if (r.length < e) throw new k();
              let s = r.substring(0, e);
              if (r.length < e + t) throw new k();
              let o = r.substring(e, e + t),
                a = r.substring(e + t),
                c = '(' + s + ')' + o,
                d = ae.parseFieldsInGeneralPurpose(a);
              return d == null ? c : c + d;
            }
            static processVariableAI(e, t, r) {
              let s = r.substring(0, e),
                o;
              r.length < e + t ? (o = r.length) : (o = e + t);
              let a = r.substring(e, o),
                c = r.substring(o),
                d = '(' + s + ')' + a,
                f = ae.parseFieldsInGeneralPurpose(c);
              return f == null ? d : d + f;
            }
          }
          ((ae.VARIABLE_LENGTH = []),
            (ae.TWO_DIGIT_DATA_LENGTH = [
              ['00', 18],
              ['01', 14],
              ['02', 14],
              ['10', ae.VARIABLE_LENGTH, 20],
              ['11', 6],
              ['12', 6],
              ['13', 6],
              ['15', 6],
              ['17', 6],
              ['20', 2],
              ['21', ae.VARIABLE_LENGTH, 20],
              ['22', ae.VARIABLE_LENGTH, 29],
              ['30', ae.VARIABLE_LENGTH, 8],
              ['37', ae.VARIABLE_LENGTH, 8],
              ['90', ae.VARIABLE_LENGTH, 30],
              ['91', ae.VARIABLE_LENGTH, 30],
              ['92', ae.VARIABLE_LENGTH, 30],
              ['93', ae.VARIABLE_LENGTH, 30],
              ['94', ae.VARIABLE_LENGTH, 30],
              ['95', ae.VARIABLE_LENGTH, 30],
              ['96', ae.VARIABLE_LENGTH, 30],
              ['97', ae.VARIABLE_LENGTH, 3],
              ['98', ae.VARIABLE_LENGTH, 30],
              ['99', ae.VARIABLE_LENGTH, 30],
            ]),
            (ae.THREE_DIGIT_DATA_LENGTH = [
              ['240', ae.VARIABLE_LENGTH, 30],
              ['241', ae.VARIABLE_LENGTH, 30],
              ['242', ae.VARIABLE_LENGTH, 6],
              ['250', ae.VARIABLE_LENGTH, 30],
              ['251', ae.VARIABLE_LENGTH, 30],
              ['253', ae.VARIABLE_LENGTH, 17],
              ['254', ae.VARIABLE_LENGTH, 20],
              ['400', ae.VARIABLE_LENGTH, 30],
              ['401', ae.VARIABLE_LENGTH, 30],
              ['402', 17],
              ['403', ae.VARIABLE_LENGTH, 30],
              ['410', 13],
              ['411', 13],
              ['412', 13],
              ['413', 13],
              ['414', 13],
              ['420', ae.VARIABLE_LENGTH, 20],
              ['421', ae.VARIABLE_LENGTH, 15],
              ['422', 3],
              ['423', ae.VARIABLE_LENGTH, 15],
              ['424', 3],
              ['425', 3],
              ['426', 3],
            ]),
            (ae.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH = [
              ['310', 6],
              ['311', 6],
              ['312', 6],
              ['313', 6],
              ['314', 6],
              ['315', 6],
              ['316', 6],
              ['320', 6],
              ['321', 6],
              ['322', 6],
              ['323', 6],
              ['324', 6],
              ['325', 6],
              ['326', 6],
              ['327', 6],
              ['328', 6],
              ['329', 6],
              ['330', 6],
              ['331', 6],
              ['332', 6],
              ['333', 6],
              ['334', 6],
              ['335', 6],
              ['336', 6],
              ['340', 6],
              ['341', 6],
              ['342', 6],
              ['343', 6],
              ['344', 6],
              ['345', 6],
              ['346', 6],
              ['347', 6],
              ['348', 6],
              ['349', 6],
              ['350', 6],
              ['351', 6],
              ['352', 6],
              ['353', 6],
              ['354', 6],
              ['355', 6],
              ['356', 6],
              ['357', 6],
              ['360', 6],
              ['361', 6],
              ['362', 6],
              ['363', 6],
              ['364', 6],
              ['365', 6],
              ['366', 6],
              ['367', 6],
              ['368', 6],
              ['369', 6],
              ['390', ae.VARIABLE_LENGTH, 15],
              ['391', ae.VARIABLE_LENGTH, 18],
              ['392', ae.VARIABLE_LENGTH, 15],
              ['393', ae.VARIABLE_LENGTH, 18],
              ['703', ae.VARIABLE_LENGTH, 30],
            ]),
            (ae.FOUR_DIGIT_DATA_LENGTH = [
              ['7001', 13],
              ['7002', ae.VARIABLE_LENGTH, 30],
              ['7003', 10],
              ['8001', 14],
              ['8002', ae.VARIABLE_LENGTH, 20],
              ['8003', ae.VARIABLE_LENGTH, 30],
              ['8004', ae.VARIABLE_LENGTH, 30],
              ['8005', 6],
              ['8006', 18],
              ['8007', ae.VARIABLE_LENGTH, 30],
              ['8008', ae.VARIABLE_LENGTH, 12],
              ['8018', 18],
              ['8020', ae.VARIABLE_LENGTH, 25],
              ['8100', 6],
              ['8101', 10],
              ['8102', 2],
              ['8110', ae.VARIABLE_LENGTH, 70],
              ['8200', ae.VARIABLE_LENGTH, 70],
            ]));
          class On {
            constructor(e) {
              ((this.buffer = new $()), (this.information = e));
            }
            decodeAllCodes(e, t) {
              let r = t,
                s = null;
              do {
                let o = this.decodeGeneralPurposeField(r, s),
                  a = ae.parseFieldsInGeneralPurpose(o.getNewString());
                if (
                  (a != null && e.append(a),
                  o.isRemaining()
                    ? (s = '' + o.getRemainingValue())
                    : (s = null),
                  r === o.getNewPosition())
                )
                  break;
                r = o.getNewPosition();
              } while (!0);
              return e.toString();
            }
            isStillNumeric(e) {
              if (e + 7 > this.information.getSize())
                return e + 4 <= this.information.getSize();
              for (let t = e; t < e + 3; ++t)
                if (this.information.get(t)) return !0;
              return this.information.get(e + 3);
            }
            decodeNumeric(e) {
              if (e + 7 > this.information.getSize()) {
                let o = this.extractNumericValueFromBitArray(e, 4);
                return o === 0
                  ? new Vt(this.information.getSize(), Vt.FNC1, Vt.FNC1)
                  : new Vt(this.information.getSize(), o - 1, Vt.FNC1);
              }
              let t = this.extractNumericValueFromBitArray(e, 7),
                r = (t - 8) / 11,
                s = (t - 8) % 11;
              return new Vt(e + 7, r, s);
            }
            extractNumericValueFromBitArray(e, t) {
              return On.extractNumericValueFromBitArray(this.information, e, t);
            }
            static extractNumericValueFromBitArray(e, t, r) {
              let s = 0;
              for (let o = 0; o < r; ++o)
                e.get(t + o) && (s |= 1 << (r - o - 1));
              return s;
            }
            decodeGeneralPurposeField(e, t) {
              (this.buffer.setLengthToZero(),
                t != null && this.buffer.append(t),
                this.current.setPosition(e));
              let r = this.parseBlocks();
              return r != null && r.isRemaining()
                ? new Zr(
                    this.current.getPosition(),
                    this.buffer.toString(),
                    r.getRemainingValue(),
                  )
                : new Zr(this.current.getPosition(), this.buffer.toString());
            }
            parseBlocks() {
              let e, t;
              do {
                let r = this.current.getPosition();
                if (
                  (this.current.isAlpha()
                    ? ((t = this.parseAlphaBlock()), (e = t.isFinished()))
                    : this.current.isIsoIec646()
                      ? ((t = this.parseIsoIec646Block()), (e = t.isFinished()))
                      : ((t = this.parseNumericBlock()), (e = t.isFinished())),
                  !(r !== this.current.getPosition()) && !e)
                )
                  break;
              } while (!e);
              return t.getDecodedInformation();
            }
            parseNumericBlock() {
              for (; this.isStillNumeric(this.current.getPosition());) {
                let e = this.decodeNumeric(this.current.getPosition());
                if (
                  (this.current.setPosition(e.getNewPosition()),
                  e.isFirstDigitFNC1())
                ) {
                  let t;
                  return (
                    e.isSecondDigitFNC1()
                      ? (t = new Zr(
                          this.current.getPosition(),
                          this.buffer.toString(),
                        ))
                      : (t = new Zr(
                          this.current.getPosition(),
                          this.buffer.toString(),
                          e.getSecondDigit(),
                        )),
                    new qr(!0, t)
                  );
                }
                if (
                  (this.buffer.append(e.getFirstDigit()), e.isSecondDigitFNC1())
                ) {
                  let t = new Zr(
                    this.current.getPosition(),
                    this.buffer.toString(),
                  );
                  return new qr(!0, t);
                }
                this.buffer.append(e.getSecondDigit());
              }
              return (
                this.isNumericToAlphaNumericLatch(this.current.getPosition()) &&
                  (this.current.setAlpha(), this.current.incrementPosition(4)),
                new qr(!1)
              );
            }
            parseIsoIec646Block() {
              for (; this.isStillIsoIec646(this.current.getPosition());) {
                let e = this.decodeIsoIec646(this.current.getPosition());
                if (
                  (this.current.setPosition(e.getNewPosition()), e.isFNC1())
                ) {
                  let t = new Zr(
                    this.current.getPosition(),
                    this.buffer.toString(),
                  );
                  return new qr(!0, t);
                }
                this.buffer.append(e.getValue());
              }
              return (
                this.isAlphaOr646ToNumericLatch(this.current.getPosition())
                  ? (this.current.incrementPosition(3),
                    this.current.setNumeric())
                  : this.isAlphaTo646ToAlphaLatch(this.current.getPosition()) &&
                    (this.current.getPosition() + 5 < this.information.getSize()
                      ? this.current.incrementPosition(5)
                      : this.current.setPosition(this.information.getSize()),
                    this.current.setAlpha()),
                new qr(!1)
              );
            }
            parseAlphaBlock() {
              for (; this.isStillAlpha(this.current.getPosition());) {
                let e = this.decodeAlphanumeric(this.current.getPosition());
                if (
                  (this.current.setPosition(e.getNewPosition()), e.isFNC1())
                ) {
                  let t = new Zr(
                    this.current.getPosition(),
                    this.buffer.toString(),
                  );
                  return new qr(!0, t);
                }
                this.buffer.append(e.getValue());
              }
              return (
                this.isAlphaOr646ToNumericLatch(this.current.getPosition())
                  ? (this.current.incrementPosition(3),
                    this.current.setNumeric())
                  : this.isAlphaTo646ToAlphaLatch(this.current.getPosition()) &&
                    (this.current.getPosition() + 5 < this.information.getSize()
                      ? this.current.incrementPosition(5)
                      : this.current.setPosition(this.information.getSize()),
                    this.current.setIsoIec646()),
                new qr(!1)
              );
            }
            isStillIsoIec646(e) {
              if (e + 5 > this.information.getSize()) return !1;
              let t = this.extractNumericValueFromBitArray(e, 5);
              if (t >= 5 && t < 16) return !0;
              if (e + 7 > this.information.getSize()) return !1;
              let r = this.extractNumericValueFromBitArray(e, 7);
              if (r >= 64 && r < 116) return !0;
              if (e + 8 > this.information.getSize()) return !1;
              let s = this.extractNumericValueFromBitArray(e, 8);
              return s >= 232 && s < 253;
            }
            decodeIsoIec646(e) {
              let t = this.extractNumericValueFromBitArray(e, 5);
              if (t === 15) return new Nt(e + 5, Nt.FNC1);
              if (t >= 5 && t < 15) return new Nt(e + 5, '0' + (t - 5));
              let r = this.extractNumericValueFromBitArray(e, 7);
              if (r >= 64 && r < 90) return new Nt(e + 7, '' + (r + 1));
              if (r >= 90 && r < 116) return new Nt(e + 7, '' + (r + 7));
              let s = this.extractNumericValueFromBitArray(e, 8),
                o;
              switch (s) {
                case 232:
                  o = '!';
                  break;
                case 233:
                  o = '"';
                  break;
                case 234:
                  o = '%';
                  break;
                case 235:
                  o = '&';
                  break;
                case 236:
                  o = "'";
                  break;
                case 237:
                  o = '(';
                  break;
                case 238:
                  o = ')';
                  break;
                case 239:
                  o = '*';
                  break;
                case 240:
                  o = '+';
                  break;
                case 241:
                  o = ',';
                  break;
                case 242:
                  o = '-';
                  break;
                case 243:
                  o = '.';
                  break;
                case 244:
                  o = '/';
                  break;
                case 245:
                  o = ':';
                  break;
                case 246:
                  o = ';';
                  break;
                case 247:
                  o = '<';
                  break;
                case 248:
                  o = '=';
                  break;
                case 249:
                  o = '>';
                  break;
                case 250:
                  o = '?';
                  break;
                case 251:
                  o = '_';
                  break;
                case 252:
                  o = ' ';
                  break;
                default:
                  throw new Q();
              }
              return new Nt(e + 8, o);
            }
            isStillAlpha(e) {
              if (e + 5 > this.information.getSize()) return !1;
              let t = this.extractNumericValueFromBitArray(e, 5);
              if (t >= 5 && t < 16) return !0;
              if (e + 6 > this.information.getSize()) return !1;
              let r = this.extractNumericValueFromBitArray(e, 6);
              return r >= 16 && r < 63;
            }
            decodeAlphanumeric(e) {
              let t = this.extractNumericValueFromBitArray(e, 5);
              if (t === 15) return new Nt(e + 5, Nt.FNC1);
              if (t >= 5 && t < 15) return new Nt(e + 5, '0' + (t - 5));
              let r = this.extractNumericValueFromBitArray(e, 6);
              if (r >= 32 && r < 58) return new Nt(e + 6, '' + (r + 33));
              let s;
              switch (r) {
                case 58:
                  s = '*';
                  break;
                case 59:
                  s = ',';
                  break;
                case 60:
                  s = '-';
                  break;
                case 61:
                  s = '.';
                  break;
                case 62:
                  s = '/';
                  break;
                default:
                  throw new or('Decoding invalid alphanumeric value: ' + r);
              }
              return new Nt(e + 6, s);
            }
            isAlphaTo646ToAlphaLatch(e) {
              if (e + 1 > this.information.getSize()) return !1;
              for (let t = 0; t < 5 && t + e < this.information.getSize(); ++t)
                if (t === 2) {
                  if (!this.information.get(e + 2)) return !1;
                } else if (this.information.get(e + t)) return !1;
              return !0;
            }
            isAlphaOr646ToNumericLatch(e) {
              if (e + 3 > this.information.getSize()) return !1;
              for (let t = e; t < e + 3; ++t)
                if (this.information.get(t)) return !1;
              return !0;
            }
            isNumericToAlphaNumericLatch(e) {
              if (e + 1 > this.information.getSize()) return !1;
              for (let t = 0; t < 4 && t + e < this.information.getSize(); ++t)
                if (this.information.get(e + t)) return !1;
              return !0;
            }
          }
          class _i {
            constructor(e) {
              ((this.information = e), (this.generalDecoder = new On(e)));
            }
            getInformation() {
              return this.information;
            }
            getGeneralDecoder() {
              return this.generalDecoder;
            }
          }
          class Mt extends _i {
            constructor(e) {
              super(e);
            }
            encodeCompressedGtin(e, t) {
              e.append('(01)');
              let r = e.length();
              (e.append('9'), this.encodeCompressedGtinWithoutAI(e, t, r));
            }
            encodeCompressedGtinWithoutAI(e, t, r) {
              for (let s = 0; s < 4; ++s) {
                let o =
                  this.getGeneralDecoder().extractNumericValueFromBitArray(
                    t + 10 * s,
                    10,
                  );
                (o / 100 === 0 && e.append('0'),
                  o / 10 === 0 && e.append('0'),
                  e.append(o));
              }
              Mt.appendCheckDigit(e, r);
            }
            static appendCheckDigit(e, t) {
              let r = 0;
              for (let s = 0; s < 13; s++) {
                let o = e.charAt(s + t).charCodeAt(0) - 48;
                r += (s & 1) === 0 ? 3 * o : o;
              }
              ((r = 10 - (r % 10)), r === 10 && (r = 0), e.append(r));
            }
          }
          Mt.GTIN_SIZE = 40;
          class Pn extends Mt {
            constructor(e) {
              super(e);
            }
            parseInformation() {
              let e = new $();
              e.append('(01)');
              let t = e.length(),
                r = this.getGeneralDecoder().extractNumericValueFromBitArray(
                  Pn.HEADER_SIZE,
                  4,
                );
              return (
                e.append(r),
                this.encodeCompressedGtinWithoutAI(e, Pn.HEADER_SIZE + 4, t),
                this.getGeneralDecoder().decodeAllCodes(e, Pn.HEADER_SIZE + 44)
              );
            }
          }
          Pn.HEADER_SIZE = 4;
          class oi extends _i {
            constructor(e) {
              super(e);
            }
            parseInformation() {
              let e = new $();
              return this.getGeneralDecoder().decodeAllCodes(e, oi.HEADER_SIZE);
            }
          }
          oi.HEADER_SIZE = 5;
          class ai extends Mt {
            constructor(e) {
              super(e);
            }
            encodeCompressedWeight(e, t, r) {
              let s = this.getGeneralDecoder().extractNumericValueFromBitArray(
                t,
                r,
              );
              this.addWeightCode(e, s);
              let o = this.checkWeight(s),
                a = 1e5;
              for (let c = 0; c < 5; ++c)
                (o / a === 0 && e.append('0'), (a /= 10));
              e.append(o);
            }
          }
          class lr extends ai {
            constructor(e) {
              super(e);
            }
            parseInformation() {
              if (
                this.getInformation().getSize() !=
                lr.HEADER_SIZE + ai.GTIN_SIZE + lr.WEIGHT_SIZE
              )
                throw new k();
              let e = new $();
              return (
                this.encodeCompressedGtin(e, lr.HEADER_SIZE),
                this.encodeCompressedWeight(
                  e,
                  lr.HEADER_SIZE + ai.GTIN_SIZE,
                  lr.WEIGHT_SIZE,
                ),
                e.toString()
              );
            }
          }
          ((lr.HEADER_SIZE = 5), (lr.WEIGHT_SIZE = 15));
          class Kc extends lr {
            constructor(e) {
              super(e);
            }
            addWeightCode(e, t) {
              e.append('(3103)');
            }
            checkWeight(e) {
              return e;
            }
          }
          class Jc extends lr {
            constructor(e) {
              super(e);
            }
            addWeightCode(e, t) {
              t < 1e4 ? e.append('(3202)') : e.append('(3203)');
            }
            checkWeight(e) {
              return e < 1e4 ? e : e - 1e4;
            }
          }
          class cr extends Mt {
            constructor(e) {
              super(e);
            }
            parseInformation() {
              if (
                this.getInformation().getSize() <
                cr.HEADER_SIZE + Mt.GTIN_SIZE
              )
                throw new k();
              let e = new $();
              this.encodeCompressedGtin(e, cr.HEADER_SIZE);
              let t = this.getGeneralDecoder().extractNumericValueFromBitArray(
                cr.HEADER_SIZE + Mt.GTIN_SIZE,
                cr.LAST_DIGIT_SIZE,
              );
              (e.append('(392'), e.append(t), e.append(')'));
              let r = this.getGeneralDecoder().decodeGeneralPurposeField(
                cr.HEADER_SIZE + Mt.GTIN_SIZE + cr.LAST_DIGIT_SIZE,
                null,
              );
              return (e.append(r.getNewString()), e.toString());
            }
          }
          ((cr.HEADER_SIZE = 8), (cr.LAST_DIGIT_SIZE = 2));
          class Rt extends Mt {
            constructor(e) {
              super(e);
            }
            parseInformation() {
              if (
                this.getInformation().getSize() <
                Rt.HEADER_SIZE + Mt.GTIN_SIZE
              )
                throw new k();
              let e = new $();
              this.encodeCompressedGtin(e, Rt.HEADER_SIZE);
              let t = this.getGeneralDecoder().extractNumericValueFromBitArray(
                Rt.HEADER_SIZE + Mt.GTIN_SIZE,
                Rt.LAST_DIGIT_SIZE,
              );
              (e.append('(393'), e.append(t), e.append(')'));
              let r = this.getGeneralDecoder().extractNumericValueFromBitArray(
                Rt.HEADER_SIZE + Mt.GTIN_SIZE + Rt.LAST_DIGIT_SIZE,
                Rt.FIRST_THREE_DIGITS_SIZE,
              );
              (r / 100 == 0 && e.append('0'),
                r / 10 == 0 && e.append('0'),
                e.append(r));
              let s = this.getGeneralDecoder().decodeGeneralPurposeField(
                Rt.HEADER_SIZE +
                  Mt.GTIN_SIZE +
                  Rt.LAST_DIGIT_SIZE +
                  Rt.FIRST_THREE_DIGITS_SIZE,
                null,
              );
              return (e.append(s.getNewString()), e.toString());
            }
          }
          ((Rt.HEADER_SIZE = 8),
            (Rt.LAST_DIGIT_SIZE = 2),
            (Rt.FIRST_THREE_DIGITS_SIZE = 10));
          class Ve extends ai {
            constructor(e, t, r) {
              (super(e), (this.dateCode = r), (this.firstAIdigits = t));
            }
            parseInformation() {
              if (
                this.getInformation().getSize() !=
                Ve.HEADER_SIZE + Ve.GTIN_SIZE + Ve.WEIGHT_SIZE + Ve.DATE_SIZE
              )
                throw new k();
              let e = new $();
              return (
                this.encodeCompressedGtin(e, Ve.HEADER_SIZE),
                this.encodeCompressedWeight(
                  e,
                  Ve.HEADER_SIZE + Ve.GTIN_SIZE,
                  Ve.WEIGHT_SIZE,
                ),
                this.encodeCompressedDate(
                  e,
                  Ve.HEADER_SIZE + Ve.GTIN_SIZE + Ve.WEIGHT_SIZE,
                ),
                e.toString()
              );
            }
            encodeCompressedDate(e, t) {
              let r = this.getGeneralDecoder().extractNumericValueFromBitArray(
                t,
                Ve.DATE_SIZE,
              );
              if (r == 38400) return;
              (e.append('('), e.append(this.dateCode), e.append(')'));
              let s = r % 32;
              r /= 32;
              let o = (r % 12) + 1;
              r /= 12;
              let a = r;
              (a / 10 == 0 && e.append('0'),
                e.append(a),
                o / 10 == 0 && e.append('0'),
                e.append(o),
                s / 10 == 0 && e.append('0'),
                e.append(s));
            }
            addWeightCode(e, t) {
              (e.append('('),
                e.append(this.firstAIdigits),
                e.append(t / 1e5),
                e.append(')'));
            }
            checkWeight(e) {
              return e % 1e5;
            }
          }
          ((Ve.HEADER_SIZE = 8), (Ve.WEIGHT_SIZE = 20), (Ve.DATE_SIZE = 16));
          function ia(A) {
            try {
              if (A.get(1)) return new Pn(A);
              if (!A.get(2)) return new oi(A);
              switch (On.extractNumericValueFromBitArray(A, 1, 4)) {
                case 4:
                  return new Kc(A);
                case 5:
                  return new Jc(A);
              }
              switch (On.extractNumericValueFromBitArray(A, 1, 5)) {
                case 12:
                  return new cr(A);
                case 13:
                  return new Rt(A);
              }
              switch (On.extractNumericValueFromBitArray(A, 1, 7)) {
                case 56:
                  return new Ve(A, '310', '11');
                case 57:
                  return new Ve(A, '320', '11');
                case 58:
                  return new Ve(A, '310', '13');
                case 59:
                  return new Ve(A, '320', '13');
                case 60:
                  return new Ve(A, '310', '15');
                case 61:
                  return new Ve(A, '320', '15');
                case 62:
                  return new Ve(A, '310', '17');
                case 63:
                  return new Ve(A, '320', '17');
              }
            } catch (e) {
              throw (console.log(e), new or('unknown decoder: ' + A));
            }
          }
          class Or {
            constructor(e, t, r, s) {
              ((this.leftchar = e),
                (this.rightchar = t),
                (this.finderpattern = r),
                (this.maybeLast = s));
            }
            mayBeLast() {
              return this.maybeLast;
            }
            getLeftChar() {
              return this.leftchar;
            }
            getRightChar() {
              return this.rightchar;
            }
            getFinderPattern() {
              return this.finderpattern;
            }
            mustBeLast() {
              return this.rightchar == null;
            }
            toString() {
              return (
                '[ ' +
                this.leftchar +
                ', ' +
                this.rightchar +
                ' : ' +
                (this.finderpattern == null
                  ? 'null'
                  : this.finderpattern.getValue()) +
                ' ]'
              );
            }
            static equals(e, t) {
              return e instanceof Or
                ? Or.equalsOrNull(e.leftchar, t.leftchar) &&
                    Or.equalsOrNull(e.rightchar, t.rightchar) &&
                    Or.equalsOrNull(e.finderpattern, t.finderpattern)
                : !1;
            }
            static equalsOrNull(e, t) {
              return e === null ? t === null : Or.equals(e, t);
            }
            hashCode() {
              return (
                this.leftchar.getValue() ^
                this.rightchar.getValue() ^
                this.finderpattern.getValue()
              );
            }
          }
          class Li {
            constructor(e, t, r) {
              ((this.pairs = e), (this.rowNumber = t), (this.wasReversed = r));
            }
            getPairs() {
              return this.pairs;
            }
            getRowNumber() {
              return this.rowNumber;
            }
            isReversed() {
              return this.wasReversed;
            }
            isEquivalent(e) {
              return this.checkEqualitity(this, e);
            }
            toString() {
              return '{ ' + this.pairs + ' }';
            }
            equals(e, t) {
              return e instanceof Li
                ? this.checkEqualitity(e, t) && e.wasReversed === t.wasReversed
                : !1;
            }
            checkEqualitity(e, t) {
              if (!e || !t) return;
              let r;
              return (
                e.forEach((s, o) => {
                  t.forEach((a) => {
                    s.getLeftChar().getValue() === a.getLeftChar().getValue() &&
                      s.getRightChar().getValue() ===
                        a.getRightChar().getValue() &&
                      s.getFinderPatter().getValue() ===
                        a.getFinderPatter().getValue() &&
                      (r = !0);
                  });
                }),
                r
              );
            }
          }
          class G extends Et {
            constructor(e) {
              (super(...arguments),
                (this.pairs = new Array(G.MAX_PAIRS)),
                (this.rows = new Array()),
                (this.startEnd = [2]),
                (this.verbose = e === !0));
            }
            decodeRow(e, t, r) {
              ((this.pairs.length = 0), (this.startFromEven = !1));
              try {
                return G.constructResult(this.decodeRow2pairs(e, t));
              } catch (s) {
                this.verbose && console.log(s);
              }
              return (
                (this.pairs.length = 0),
                (this.startFromEven = !0),
                G.constructResult(this.decodeRow2pairs(e, t))
              );
            }
            reset() {
              ((this.pairs.length = 0), (this.rows.length = 0));
            }
            decodeRow2pairs(e, t) {
              let r = !1;
              for (; !r;)
                try {
                  this.pairs.push(this.retrieveNextPair(t, this.pairs, e));
                } catch (o) {
                  if (o instanceof k) {
                    if (!this.pairs.length) throw new k();
                    r = !0;
                  }
                }
              if (this.checkChecksum()) return this.pairs;
              let s;
              if (
                (this.rows.length ? (s = !0) : (s = !1),
                this.storeRow(e, !1),
                s)
              ) {
                let o = this.checkRowsBoolean(!1);
                if (o != null || ((o = this.checkRowsBoolean(!0)), o != null))
                  return o;
              }
              throw new k();
            }
            checkRowsBoolean(e) {
              if (this.rows.length > 25) return ((this.rows.length = 0), null);
              ((this.pairs.length = 0), e && (this.rows = this.rows.reverse()));
              let t = null;
              try {
                t = this.checkRows(new Array(), 0);
              } catch (r) {
                this.verbose && console.log(r);
              }
              return (e && (this.rows = this.rows.reverse()), t);
            }
            checkRows(e, t) {
              for (let r = t; r < this.rows.length; r++) {
                let s = this.rows[r];
                this.pairs.length = 0;
                for (let a of e) this.pairs.push(a.getPairs());
                if (
                  (this.pairs.push(s.getPairs()),
                  !G.isValidSequence(this.pairs))
                )
                  continue;
                if (this.checkChecksum()) return this.pairs;
                let o = new Array(e);
                o.push(s);
                try {
                  return this.checkRows(o, r + 1);
                } catch (a) {
                  this.verbose && console.log(a);
                }
              }
              throw new k();
            }
            static isValidSequence(e) {
              for (let t of G.FINDER_PATTERN_SEQUENCES) {
                if (e.length > t.length) continue;
                let r = !0;
                for (let s = 0; s < e.length; s++)
                  if (e[s].getFinderPattern().getValue() != t[s]) {
                    r = !1;
                    break;
                  }
                if (r) return !0;
              }
              return !1;
            }
            storeRow(e, t) {
              let r = 0,
                s = !1,
                o = !1;
              for (; r < this.rows.length;) {
                let a = this.rows[r];
                if (a.getRowNumber() > e) {
                  o = a.isEquivalent(this.pairs);
                  break;
                }
                ((s = a.isEquivalent(this.pairs)), r++);
              }
              o ||
                s ||
                G.isPartialRow(this.pairs, this.rows) ||
                (this.rows.push(r, new Li(this.pairs, e, t)),
                this.removePartialRows(this.pairs, this.rows));
            }
            removePartialRows(e, t) {
              for (let r of t)
                if (r.getPairs().length !== e.length) {
                  for (let s of r.getPairs())
                    for (let o of e) if (Or.equals(s, o)) break;
                }
            }
            static isPartialRow(e, t) {
              for (let r of t) {
                let s = !0;
                for (let o of e) {
                  let a = !1;
                  for (let c of r.getPairs())
                    if (o.equals(c)) {
                      a = !0;
                      break;
                    }
                  if (!a) {
                    s = !1;
                    break;
                  }
                }
                if (s) return !0;
              }
              return !1;
            }
            getRows() {
              return this.rows;
            }
            static constructResult(e) {
              let t = Yc.buildBitArray(e),
                s = ia(t).parseInformation(),
                o = e[0].getFinderPattern().getResultPoints(),
                a = e[e.length - 1].getFinderPattern().getResultPoints(),
                c = [o[0], o[1], a[0], a[1]];
              return new st(s, null, null, c, oe.RSS_EXPANDED, null);
            }
            checkChecksum() {
              let e = this.pairs.get(0),
                t = e.getLeftChar(),
                r = e.getRightChar();
              if (r == null) return !1;
              let s = r.getChecksumPortion(),
                o = 2;
              for (let c = 1; c < this.pairs.size(); ++c) {
                let d = this.pairs.get(c);
                ((s += d.getLeftChar().getChecksumPortion()), o++);
                let f = d.getRightChar();
                f != null && ((s += f.getChecksumPortion()), o++);
              }
              return ((s %= 211), 211 * (o - 4) + s == t.getValue());
            }
            static getNextSecondBar(e, t) {
              let r;
              return (
                e.get(t)
                  ? ((r = e.getNextUnset(t)), (r = e.getNextSet(r)))
                  : ((r = e.getNextSet(t)), (r = e.getNextUnset(r))),
                r
              );
            }
            retrieveNextPair(e, t, r) {
              let s = t.length % 2 == 0;
              this.startFromEven && (s = !s);
              let o,
                a = !0,
                c = -1;
              do
                (this.findNextPair(e, t, c),
                  (o = this.parseFoundFinderPattern(e, r, s)),
                  o == null
                    ? (c = G.getNextSecondBar(e, this.startEnd[0]))
                    : (a = !1));
              while (a);
              let d = this.decodeDataCharacter(e, o, s, !0);
              if (!this.isEmptyPair(t) && t[t.length - 1].mustBeLast())
                throw new k();
              let f;
              try {
                f = this.decodeDataCharacter(e, o, s, !1);
              } catch (x) {
                ((f = null), this.verbose && console.log(x));
              }
              return new Or(d, f, o, !0);
            }
            isEmptyPair(e) {
              return e.length === 0;
            }
            findNextPair(e, t, r) {
              let s = this.getDecodeFinderCounters();
              ((s[0] = 0), (s[1] = 0), (s[2] = 0), (s[3] = 0));
              let o = e.getSize(),
                a;
              r >= 0
                ? (a = r)
                : this.isEmptyPair(t)
                  ? (a = 0)
                  : (a = t[t.length - 1].getFinderPattern().getStartEnd()[1]);
              let c = t.length % 2 != 0;
              this.startFromEven && (c = !c);
              let d = !1;
              for (; a < o && ((d = !e.get(a)), !!d);) a++;
              let f = 0,
                x = a;
              for (let m = a; m < o; m++)
                if (e.get(m) != d) s[f]++;
                else {
                  if (f == 3) {
                    if ((c && G.reverseCounters(s), G.isFinderPattern(s))) {
                      ((this.startEnd[0] = x), (this.startEnd[1] = m));
                      return;
                    }
                    (c && G.reverseCounters(s),
                      (x += s[0] + s[1]),
                      (s[0] = s[2]),
                      (s[1] = s[3]),
                      (s[2] = 0),
                      (s[3] = 0),
                      f--);
                  } else f++;
                  ((s[f] = 1), (d = !d));
                }
              throw new k();
            }
            static reverseCounters(e) {
              let t = e.length;
              for (let r = 0; r < t / 2; ++r) {
                let s = e[r];
                ((e[r] = e[t - r - 1]), (e[t - r - 1] = s));
              }
            }
            parseFoundFinderPattern(e, t, r) {
              let s, o, a;
              if (r) {
                let f = this.startEnd[0] - 1;
                for (; f >= 0 && !e.get(f);) f--;
                (f++,
                  (s = this.startEnd[0] - f),
                  (o = f),
                  (a = this.startEnd[1]));
              } else
                ((o = this.startEnd[0]),
                  (a = e.getNextUnset(this.startEnd[1] + 1)),
                  (s = a - this.startEnd[1]));
              let c = this.getDecodeFinderCounters();
              (M.arraycopy(c, 0, c, 1, c.length - 1), (c[0] = s));
              let d;
              try {
                d = this.parseFinderValue(c, G.FINDER_PATTERNS);
              } catch {
                return null;
              }
              return new ii(d, [o, a], o, a, t);
            }
            decodeDataCharacter(e, t, r, s) {
              let o = this.getDataCharacterCounters();
              for (let ke = 0; ke < o.length; ke++) o[ke] = 0;
              if (s) G.recordPatternInReverse(e, t.getStartEnd()[0], o);
              else {
                G.recordPattern(e, t.getStartEnd()[1], o);
                for (let ke = 0, wt = o.length - 1; ke < wt; ke++, wt--) {
                  let _t = o[ke];
                  ((o[ke] = o[wt]), (o[wt] = _t));
                }
              }
              let a = 17,
                c = Ne.sum(new Int32Array(o)) / a,
                d = (t.getStartEnd()[1] - t.getStartEnd()[0]) / 15;
              if (Math.abs(c - d) / d > 0.3) throw new k();
              let f = this.getOddCounts(),
                x = this.getEvenCounts(),
                m = this.getOddRoundingErrors(),
                C = this.getEvenRoundingErrors();
              for (let ke = 0; ke < o.length; ke++) {
                let wt = (1 * o[ke]) / c,
                  _t = wt + 0.5;
                if (_t < 1) {
                  if (wt < 0.3) throw new k();
                  _t = 1;
                } else if (_t > 8) {
                  if (wt > 8.7) throw new k();
                  _t = 8;
                }
                let Fn = ke / 2;
                (ke & 1) == 0
                  ? ((f[Fn] = _t), (m[Fn] = wt - _t))
                  : ((x[Fn] = _t), (C[Fn] = wt - _t));
              }
              this.adjustOddEvenCounts(a);
              let S = 4 * t.getValue() + (r ? 0 : 2) + (s ? 0 : 1) - 1,
                v = 0,
                N = 0;
              for (let ke = f.length - 1; ke >= 0; ke--) {
                if (G.isNotA1left(t, r, s)) {
                  let wt = G.WEIGHTS[S][2 * ke];
                  N += f[ke] * wt;
                }
                v += f[ke];
              }
              let O = 0;
              for (let ke = x.length - 1; ke >= 0; ke--)
                if (G.isNotA1left(t, r, s)) {
                  let wt = G.WEIGHTS[S][2 * ke + 1];
                  O += x[ke] * wt;
                }
              let U = N + O;
              if ((v & 1) != 0 || v > 13 || v < 4) throw new k();
              let q = (13 - v) / 2,
                Z = G.SYMBOL_WIDEST[q],
                K = 9 - Z,
                Se = ar.getRSSvalue(f, Z, !0),
                Ce = ar.getRSSvalue(x, K, !1),
                Ot = G.EVEN_TOTAL_SUBSET[q],
                Zt = G.GSUM[q],
                Pt = Se * Ot + Ce + Zt;
              return new Dn(Pt, U);
            }
            static isNotA1left(e, t, r) {
              return !(e.getValue() == 0 && t && r);
            }
            adjustOddEvenCounts(e) {
              let t = Ne.sum(new Int32Array(this.getOddCounts())),
                r = Ne.sum(new Int32Array(this.getEvenCounts())),
                s = !1,
                o = !1;
              t > 13 ? (o = !0) : t < 4 && (s = !0);
              let a = !1,
                c = !1;
              r > 13 ? (c = !0) : r < 4 && (a = !0);
              let d = t + r - e,
                f = (t & 1) == 1,
                x = (r & 1) == 0;
              if (d == 1)
                if (f) {
                  if (x) throw new k();
                  o = !0;
                } else {
                  if (!x) throw new k();
                  c = !0;
                }
              else if (d == -1)
                if (f) {
                  if (x) throw new k();
                  s = !0;
                } else {
                  if (!x) throw new k();
                  a = !0;
                }
              else if (d == 0) {
                if (f) {
                  if (!x) throw new k();
                  t < r ? ((s = !0), (c = !0)) : ((o = !0), (a = !0));
                } else if (x) throw new k();
              } else throw new k();
              if (s) {
                if (o) throw new k();
                G.increment(this.getOddCounts(), this.getOddRoundingErrors());
              }
              if (
                (o &&
                  G.decrement(this.getOddCounts(), this.getOddRoundingErrors()),
                a)
              ) {
                if (c) throw new k();
                G.increment(this.getEvenCounts(), this.getOddRoundingErrors());
              }
              c &&
                G.decrement(this.getEvenCounts(), this.getEvenRoundingErrors());
            }
          }
          ((G.SYMBOL_WIDEST = [7, 5, 4, 3, 1]),
            (G.EVEN_TOTAL_SUBSET = [4, 20, 52, 104, 204]),
            (G.GSUM = [0, 348, 1388, 2948, 3988]),
            (G.FINDER_PATTERNS = [
              Int32Array.from([1, 8, 4, 1]),
              Int32Array.from([3, 6, 4, 1]),
              Int32Array.from([3, 4, 6, 1]),
              Int32Array.from([3, 2, 8, 1]),
              Int32Array.from([2, 6, 5, 1]),
              Int32Array.from([2, 2, 9, 1]),
            ]),
            (G.WEIGHTS = [
              [1, 3, 9, 27, 81, 32, 96, 77],
              [20, 60, 180, 118, 143, 7, 21, 63],
              [189, 145, 13, 39, 117, 140, 209, 205],
              [193, 157, 49, 147, 19, 57, 171, 91],
              [62, 186, 136, 197, 169, 85, 44, 132],
              [185, 133, 188, 142, 4, 12, 36, 108],
              [113, 128, 173, 97, 80, 29, 87, 50],
              [150, 28, 84, 41, 123, 158, 52, 156],
              [46, 138, 203, 187, 139, 206, 196, 166],
              [76, 17, 51, 153, 37, 111, 122, 155],
              [43, 129, 176, 106, 107, 110, 119, 146],
              [16, 48, 144, 10, 30, 90, 59, 177],
              [109, 116, 137, 200, 178, 112, 125, 164],
              [70, 210, 208, 202, 184, 130, 179, 115],
              [134, 191, 151, 31, 93, 68, 204, 190],
              [148, 22, 66, 198, 172, 94, 71, 2],
              [6, 18, 54, 162, 64, 192, 154, 40],
              [120, 149, 25, 75, 14, 42, 126, 167],
              [79, 26, 78, 23, 69, 207, 199, 175],
              [103, 98, 83, 38, 114, 131, 182, 124],
              [161, 61, 183, 127, 170, 88, 53, 159],
              [55, 165, 73, 8, 24, 72, 5, 15],
              [45, 135, 194, 160, 58, 174, 100, 89],
            ]),
            (G.FINDER_PAT_A = 0),
            (G.FINDER_PAT_B = 1),
            (G.FINDER_PAT_C = 2),
            (G.FINDER_PAT_D = 3),
            (G.FINDER_PAT_E = 4),
            (G.FINDER_PAT_F = 5),
            (G.FINDER_PATTERN_SEQUENCES = [
              [G.FINDER_PAT_A, G.FINDER_PAT_A],
              [G.FINDER_PAT_A, G.FINDER_PAT_B, G.FINDER_PAT_B],
              [G.FINDER_PAT_A, G.FINDER_PAT_C, G.FINDER_PAT_B, G.FINDER_PAT_D],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_E,
                G.FINDER_PAT_B,
                G.FINDER_PAT_D,
                G.FINDER_PAT_C,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_E,
                G.FINDER_PAT_B,
                G.FINDER_PAT_D,
                G.FINDER_PAT_D,
                G.FINDER_PAT_F,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_E,
                G.FINDER_PAT_B,
                G.FINDER_PAT_D,
                G.FINDER_PAT_E,
                G.FINDER_PAT_F,
                G.FINDER_PAT_F,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_A,
                G.FINDER_PAT_B,
                G.FINDER_PAT_B,
                G.FINDER_PAT_C,
                G.FINDER_PAT_C,
                G.FINDER_PAT_D,
                G.FINDER_PAT_D,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_A,
                G.FINDER_PAT_B,
                G.FINDER_PAT_B,
                G.FINDER_PAT_C,
                G.FINDER_PAT_C,
                G.FINDER_PAT_D,
                G.FINDER_PAT_E,
                G.FINDER_PAT_E,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_A,
                G.FINDER_PAT_B,
                G.FINDER_PAT_B,
                G.FINDER_PAT_C,
                G.FINDER_PAT_C,
                G.FINDER_PAT_D,
                G.FINDER_PAT_E,
                G.FINDER_PAT_F,
                G.FINDER_PAT_F,
              ],
              [
                G.FINDER_PAT_A,
                G.FINDER_PAT_A,
                G.FINDER_PAT_B,
                G.FINDER_PAT_B,
                G.FINDER_PAT_C,
                G.FINDER_PAT_D,
                G.FINDER_PAT_D,
                G.FINDER_PAT_E,
                G.FINDER_PAT_E,
                G.FINDER_PAT_F,
                G.FINDER_PAT_F,
              ],
            ]),
            (G.MAX_PAIRS = 11));
          class qc extends Dn {
            constructor(e, t, r) {
              (super(e, t), (this.count = 0), (this.finderPattern = r));
            }
            getFinderPattern() {
              return this.finderPattern;
            }
            getCount() {
              return this.count;
            }
            incrementCount() {
              this.count++;
            }
          }
          class Ye extends Et {
            constructor() {
              (super(...arguments),
                (this.possibleLeftPairs = []),
                (this.possibleRightPairs = []));
            }
            decodeRow(e, t, r) {
              const s = this.decodePair(t, !1, e, r);
              (Ye.addOrTally(this.possibleLeftPairs, s), t.reverse());
              let o = this.decodePair(t, !0, e, r);
              (Ye.addOrTally(this.possibleRightPairs, o), t.reverse());
              for (let a of this.possibleLeftPairs)
                if (a.getCount() > 1) {
                  for (let c of this.possibleRightPairs)
                    if (c.getCount() > 1 && Ye.checkChecksum(a, c))
                      return Ye.constructResult(a, c);
                }
              throw new k();
            }
            static addOrTally(e, t) {
              if (t == null) return;
              let r = !1;
              for (let s of e)
                if (s.getValue() === t.getValue()) {
                  (s.incrementCount(), (r = !0));
                  break;
                }
              r || e.push(t);
            }
            reset() {
              ((this.possibleLeftPairs.length = 0),
                (this.possibleRightPairs.length = 0));
            }
            static constructResult(e, t) {
              let r = 4537077 * e.getValue() + t.getValue(),
                s = new String(r).toString(),
                o = new $();
              for (let f = 13 - s.length; f > 0; f--) o.append('0');
              o.append(s);
              let a = 0;
              for (let f = 0; f < 13; f++) {
                let x = o.charAt(f).charCodeAt(0) - 48;
                a += (f & 1) === 0 ? 3 * x : x;
              }
              ((a = 10 - (a % 10)),
                a === 10 && (a = 0),
                o.append(a.toString()));
              let c = e.getFinderPattern().getResultPoints(),
                d = t.getFinderPattern().getResultPoints();
              return new st(
                o.toString(),
                null,
                0,
                [c[0], c[1], d[0], d[1]],
                oe.RSS_14,
                new Date().getTime(),
              );
            }
            static checkChecksum(e, t) {
              let r =
                  (e.getChecksumPortion() + 16 * t.getChecksumPortion()) % 79,
                s =
                  9 * e.getFinderPattern().getValue() +
                  t.getFinderPattern().getValue();
              return (s > 72 && s--, s > 8 && s--, r === s);
            }
            decodePair(e, t, r, s) {
              try {
                let o = this.findFinderPattern(e, t),
                  a = this.parseFoundFinderPattern(e, r, t, o),
                  c = s == null ? null : s.get(re.NEED_RESULT_POINT_CALLBACK);
                if (c != null) {
                  let x = (o[0] + o[1]) / 2;
                  (t && (x = e.getSize() - 1 - x),
                    c.foundPossibleResultPoint(new de(x, r)));
                }
                let d = this.decodeDataCharacter(e, a, !0),
                  f = this.decodeDataCharacter(e, a, !1);
                return new qc(
                  1597 * d.getValue() + f.getValue(),
                  d.getChecksumPortion() + 4 * f.getChecksumPortion(),
                  a,
                );
              } catch {
                return null;
              }
            }
            decodeDataCharacter(e, t, r) {
              let s = this.getDataCharacterCounters();
              for (let O = 0; O < s.length; O++) s[O] = 0;
              if (r) tt.recordPatternInReverse(e, t.getStartEnd()[0], s);
              else {
                tt.recordPattern(e, t.getStartEnd()[1] + 1, s);
                for (let O = 0, U = s.length - 1; O < U; O++, U--) {
                  let q = s[O];
                  ((s[O] = s[U]), (s[U] = q));
                }
              }
              let o = r ? 16 : 15,
                a = Ne.sum(new Int32Array(s)) / o,
                c = this.getOddCounts(),
                d = this.getEvenCounts(),
                f = this.getOddRoundingErrors(),
                x = this.getEvenRoundingErrors();
              for (let O = 0; O < s.length; O++) {
                let U = s[O] / a,
                  q = Math.floor(U + 0.5);
                q < 1 ? (q = 1) : q > 8 && (q = 8);
                let Z = Math.floor(O / 2);
                (O & 1) === 0
                  ? ((c[Z] = q), (f[Z] = U - q))
                  : ((d[Z] = q), (x[Z] = U - q));
              }
              this.adjustOddEvenCounts(r, o);
              let m = 0,
                C = 0;
              for (let O = c.length - 1; O >= 0; O--)
                ((C *= 9), (C += c[O]), (m += c[O]));
              let S = 0,
                v = 0;
              for (let O = d.length - 1; O >= 0; O--)
                ((S *= 9), (S += d[O]), (v += d[O]));
              let N = C + 3 * S;
              if (r) {
                if ((m & 1) !== 0 || m > 12 || m < 4) throw new k();
                let O = (12 - m) / 2,
                  U = Ye.OUTSIDE_ODD_WIDEST[O],
                  q = 9 - U,
                  Z = ar.getRSSvalue(c, U, !1),
                  K = ar.getRSSvalue(d, q, !0),
                  Se = Ye.OUTSIDE_EVEN_TOTAL_SUBSET[O],
                  Ce = Ye.OUTSIDE_GSUM[O];
                return new Dn(Z * Se + K + Ce, N);
              } else {
                if ((v & 1) !== 0 || v > 10 || v < 4) throw new k();
                let O = (10 - v) / 2,
                  U = Ye.INSIDE_ODD_WIDEST[O],
                  q = 9 - U,
                  Z = ar.getRSSvalue(c, U, !0),
                  K = ar.getRSSvalue(d, q, !1),
                  Se = Ye.INSIDE_ODD_TOTAL_SUBSET[O],
                  Ce = Ye.INSIDE_GSUM[O];
                return new Dn(K * Se + Z + Ce, N);
              }
            }
            findFinderPattern(e, t) {
              let r = this.getDecodeFinderCounters();
              ((r[0] = 0), (r[1] = 0), (r[2] = 0), (r[3] = 0));
              let s = e.getSize(),
                o = !1,
                a = 0;
              for (; a < s && ((o = !e.get(a)), t !== o);) a++;
              let c = 0,
                d = a;
              for (let f = a; f < s; f++)
                if (e.get(f) !== o) r[c]++;
                else {
                  if (c === 3) {
                    if (Et.isFinderPattern(r)) return [d, f];
                    ((d += r[0] + r[1]),
                      (r[0] = r[2]),
                      (r[1] = r[3]),
                      (r[2] = 0),
                      (r[3] = 0),
                      c--);
                  } else c++;
                  ((r[c] = 1), (o = !o));
                }
              throw new k();
            }
            parseFoundFinderPattern(e, t, r, s) {
              let o = e.get(s[0]),
                a = s[0] - 1;
              for (; a >= 0 && o !== e.get(a);) a--;
              a++;
              const c = s[0] - a,
                d = this.getDecodeFinderCounters(),
                f = new Int32Array(d.length);
              (M.arraycopy(d, 0, f, 1, d.length - 1), (f[0] = c));
              const x = this.parseFinderValue(f, Ye.FINDER_PATTERNS);
              let m = a,
                C = s[1];
              return (
                r && ((m = e.getSize() - 1 - m), (C = e.getSize() - 1 - C)),
                new ii(x, [a, s[1]], m, C, t)
              );
            }
            adjustOddEvenCounts(e, t) {
              let r = Ne.sum(new Int32Array(this.getOddCounts())),
                s = Ne.sum(new Int32Array(this.getEvenCounts())),
                o = !1,
                a = !1,
                c = !1,
                d = !1;
              e
                ? (r > 12 ? (a = !0) : r < 4 && (o = !0),
                  s > 12 ? (d = !0) : s < 4 && (c = !0))
                : (r > 11 ? (a = !0) : r < 5 && (o = !0),
                  s > 10 ? (d = !0) : s < 4 && (c = !0));
              let f = r + s - t,
                x = (r & 1) === (e ? 1 : 0),
                m = (s & 1) === 1;
              if (f === 1)
                if (x) {
                  if (m) throw new k();
                  a = !0;
                } else {
                  if (!m) throw new k();
                  d = !0;
                }
              else if (f === -1)
                if (x) {
                  if (m) throw new k();
                  o = !0;
                } else {
                  if (!m) throw new k();
                  c = !0;
                }
              else if (f === 0) {
                if (x) {
                  if (!m) throw new k();
                  r < s ? ((o = !0), (d = !0)) : ((a = !0), (c = !0));
                } else if (m) throw new k();
              } else throw new k();
              if (o) {
                if (a) throw new k();
                Et.increment(this.getOddCounts(), this.getOddRoundingErrors());
              }
              if (
                (a &&
                  Et.decrement(
                    this.getOddCounts(),
                    this.getOddRoundingErrors(),
                  ),
                c)
              ) {
                if (d) throw new k();
                Et.increment(this.getEvenCounts(), this.getOddRoundingErrors());
              }
              d &&
                Et.decrement(
                  this.getEvenCounts(),
                  this.getEvenRoundingErrors(),
                );
            }
          }
          ((Ye.OUTSIDE_EVEN_TOTAL_SUBSET = [1, 10, 34, 70, 126]),
            (Ye.INSIDE_ODD_TOTAL_SUBSET = [4, 20, 48, 81]),
            (Ye.OUTSIDE_GSUM = [0, 161, 961, 2015, 2715]),
            (Ye.INSIDE_GSUM = [0, 336, 1036, 1516]),
            (Ye.OUTSIDE_ODD_WIDEST = [8, 6, 4, 3, 1]),
            (Ye.INSIDE_ODD_WIDEST = [2, 4, 6, 8]),
            (Ye.FINDER_PATTERNS = [
              Int32Array.from([3, 8, 2, 1]),
              Int32Array.from([3, 5, 5, 1]),
              Int32Array.from([3, 3, 7, 1]),
              Int32Array.from([3, 1, 9, 1]),
              Int32Array.from([2, 7, 4, 1]),
              Int32Array.from([2, 5, 6, 1]),
              Int32Array.from([2, 3, 8, 1]),
              Int32Array.from([1, 5, 7, 1]),
              Int32Array.from([1, 3, 9, 1]),
            ]));
          class Bn extends tt {
            constructor(e, t) {
              (super(), (this.readers = []), (this.verbose = t === !0));
              const r = e ? e.get(re.POSSIBLE_FORMATS) : null,
                s = e && e.get(re.ASSUME_CODE_39_CHECK_DIGIT) !== void 0;
              r
                ? ((r.includes(oe.EAN_13) ||
                    r.includes(oe.UPC_A) ||
                    r.includes(oe.EAN_8) ||
                    r.includes(oe.UPC_E)) &&
                    this.readers.push(new Pi(e)),
                  r.includes(oe.CODE_39) && this.readers.push(new at(s)),
                  r.includes(oe.CODE_128) && this.readers.push(new te()),
                  r.includes(oe.ITF) && this.readers.push(new _e()),
                  r.includes(oe.RSS_14) && this.readers.push(new Ye()),
                  r.includes(oe.RSS_EXPANDED) &&
                    this.readers.push(new G(this.verbose)))
                : (this.readers.push(new Pi(e)),
                  this.readers.push(new at()),
                  this.readers.push(new Pi(e)),
                  this.readers.push(new te()),
                  this.readers.push(new _e()),
                  this.readers.push(new Ye()),
                  this.readers.push(new G(this.verbose)));
            }
            decodeRow(e, t, r) {
              for (let s = 0; s < this.readers.length; s++)
                try {
                  return this.readers[s].decodeRow(e, t, r);
                } catch {}
              throw new k();
            }
            reset() {
              this.readers.forEach((e) => e.reset());
            }
          }
          class Zc extends ir {
            constructor(e = 500, t) {
              super(new Bn(t), e, t);
            }
          }
          class Pe {
            constructor(e, t, r) {
              ((this.ecCodewords = e),
                (this.ecBlocks = [t]),
                r && this.ecBlocks.push(r));
            }
            getECCodewords() {
              return this.ecCodewords;
            }
            getECBlocks() {
              return this.ecBlocks;
            }
          }
          class Oe {
            constructor(e, t) {
              ((this.count = e), (this.dataCodewords = t));
            }
            getCount() {
              return this.count;
            }
            getDataCodewords() {
              return this.dataCodewords;
            }
          }
          class ve {
            constructor(e, t, r, s, o, a) {
              ((this.versionNumber = e),
                (this.symbolSizeRows = t),
                (this.symbolSizeColumns = r),
                (this.dataRegionSizeRows = s),
                (this.dataRegionSizeColumns = o),
                (this.ecBlocks = a));
              let c = 0;
              const d = a.getECCodewords(),
                f = a.getECBlocks();
              for (let x of f) c += x.getCount() * (x.getDataCodewords() + d);
              this.totalCodewords = c;
            }
            getVersionNumber() {
              return this.versionNumber;
            }
            getSymbolSizeRows() {
              return this.symbolSizeRows;
            }
            getSymbolSizeColumns() {
              return this.symbolSizeColumns;
            }
            getDataRegionSizeRows() {
              return this.dataRegionSizeRows;
            }
            getDataRegionSizeColumns() {
              return this.dataRegionSizeColumns;
            }
            getTotalCodewords() {
              return this.totalCodewords;
            }
            getECBlocks() {
              return this.ecBlocks;
            }
            static getVersionForDimensions(e, t) {
              if ((e & 1) !== 0 || (t & 1) !== 0) throw new Q();
              for (let r of ve.VERSIONS)
                if (r.symbolSizeRows === e && r.symbolSizeColumns === t)
                  return r;
              throw new Q();
            }
            toString() {
              return '' + this.versionNumber;
            }
            static buildVersions() {
              return [
                new ve(1, 10, 10, 8, 8, new Pe(5, new Oe(1, 3))),
                new ve(2, 12, 12, 10, 10, new Pe(7, new Oe(1, 5))),
                new ve(3, 14, 14, 12, 12, new Pe(10, new Oe(1, 8))),
                new ve(4, 16, 16, 14, 14, new Pe(12, new Oe(1, 12))),
                new ve(5, 18, 18, 16, 16, new Pe(14, new Oe(1, 18))),
                new ve(6, 20, 20, 18, 18, new Pe(18, new Oe(1, 22))),
                new ve(7, 22, 22, 20, 20, new Pe(20, new Oe(1, 30))),
                new ve(8, 24, 24, 22, 22, new Pe(24, new Oe(1, 36))),
                new ve(9, 26, 26, 24, 24, new Pe(28, new Oe(1, 44))),
                new ve(10, 32, 32, 14, 14, new Pe(36, new Oe(1, 62))),
                new ve(11, 36, 36, 16, 16, new Pe(42, new Oe(1, 86))),
                new ve(12, 40, 40, 18, 18, new Pe(48, new Oe(1, 114))),
                new ve(13, 44, 44, 20, 20, new Pe(56, new Oe(1, 144))),
                new ve(14, 48, 48, 22, 22, new Pe(68, new Oe(1, 174))),
                new ve(15, 52, 52, 24, 24, new Pe(42, new Oe(2, 102))),
                new ve(16, 64, 64, 14, 14, new Pe(56, new Oe(2, 140))),
                new ve(17, 72, 72, 16, 16, new Pe(36, new Oe(4, 92))),
                new ve(18, 80, 80, 18, 18, new Pe(48, new Oe(4, 114))),
                new ve(19, 88, 88, 20, 20, new Pe(56, new Oe(4, 144))),
                new ve(20, 96, 96, 22, 22, new Pe(68, new Oe(4, 174))),
                new ve(21, 104, 104, 24, 24, new Pe(56, new Oe(6, 136))),
                new ve(22, 120, 120, 18, 18, new Pe(68, new Oe(6, 175))),
                new ve(23, 132, 132, 20, 20, new Pe(62, new Oe(8, 163))),
                new ve(
                  24,
                  144,
                  144,
                  22,
                  22,
                  new Pe(62, new Oe(8, 156), new Oe(2, 155)),
                ),
                new ve(25, 8, 18, 6, 16, new Pe(7, new Oe(1, 5))),
                new ve(26, 8, 32, 6, 14, new Pe(11, new Oe(1, 10))),
                new ve(27, 12, 26, 10, 24, new Pe(14, new Oe(1, 16))),
                new ve(28, 12, 36, 10, 16, new Pe(18, new Oe(1, 22))),
                new ve(29, 16, 36, 14, 16, new Pe(24, new Oe(1, 32))),
                new ve(30, 16, 48, 14, 22, new Pe(28, new Oe(1, 49))),
              ];
            }
          }
          ve.VERSIONS = ve.buildVersions();
          class ki {
            constructor(e) {
              const t = e.getHeight();
              if (t < 8 || t > 144 || (t & 1) !== 0) throw new Q();
              ((this.version = ki.readVersion(e)),
                (this.mappingBitMatrix = this.extractDataRegion(e)),
                (this.readMappingMatrix = new we(
                  this.mappingBitMatrix.getWidth(),
                  this.mappingBitMatrix.getHeight(),
                )));
            }
            getVersion() {
              return this.version;
            }
            static readVersion(e) {
              const t = e.getHeight(),
                r = e.getWidth();
              return ve.getVersionForDimensions(t, r);
            }
            readCodewords() {
              const e = new Int8Array(this.version.getTotalCodewords());
              let t = 0,
                r = 4,
                s = 0;
              const o = this.mappingBitMatrix.getHeight(),
                a = this.mappingBitMatrix.getWidth();
              let c = !1,
                d = !1,
                f = !1,
                x = !1;
              do
                if (r === o && s === 0 && !c)
                  ((e[t++] = this.readCorner1(o, a) & 255),
                    (r -= 2),
                    (s += 2),
                    (c = !0));
                else if (r === o - 2 && s === 0 && (a & 3) !== 0 && !d)
                  ((e[t++] = this.readCorner2(o, a) & 255),
                    (r -= 2),
                    (s += 2),
                    (d = !0));
                else if (r === o + 4 && s === 2 && (a & 7) === 0 && !f)
                  ((e[t++] = this.readCorner3(o, a) & 255),
                    (r -= 2),
                    (s += 2),
                    (f = !0));
                else if (r === o - 2 && s === 0 && (a & 7) === 4 && !x)
                  ((e[t++] = this.readCorner4(o, a) & 255),
                    (r -= 2),
                    (s += 2),
                    (x = !0));
                else {
                  do
                    (r < o &&
                      s >= 0 &&
                      !this.readMappingMatrix.get(s, r) &&
                      (e[t++] = this.readUtah(r, s, o, a) & 255),
                      (r -= 2),
                      (s += 2));
                  while (r >= 0 && s < a);
                  ((r += 1), (s += 3));
                  do
                    (r >= 0 &&
                      s < a &&
                      !this.readMappingMatrix.get(s, r) &&
                      (e[t++] = this.readUtah(r, s, o, a) & 255),
                      (r += 2),
                      (s -= 2));
                  while (r < o && s >= 0);
                  ((r += 3), (s += 1));
                }
              while (r < o || s < a);
              if (t !== this.version.getTotalCodewords()) throw new Q();
              return e;
            }
            readModule(e, t, r, s) {
              return (
                e < 0 && ((e += r), (t += 4 - ((r + 4) & 7))),
                t < 0 && ((t += s), (e += 4 - ((s + 4) & 7))),
                this.readMappingMatrix.set(t, e),
                this.mappingBitMatrix.get(t, e)
              );
            }
            readUtah(e, t, r, s) {
              let o = 0;
              return (
                this.readModule(e - 2, t - 2, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e - 2, t - 1, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e - 1, t - 2, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e - 1, t - 1, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e - 1, t, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e, t - 2, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e, t - 1, r, s) && (o |= 1),
                (o <<= 1),
                this.readModule(e, t, r, s) && (o |= 1),
                o
              );
            }
            readCorner1(e, t) {
              let r = 0;
              return (
                this.readModule(e - 1, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 1, 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 1, 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(2, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(3, t - 1, e, t) && (r |= 1),
                r
              );
            }
            readCorner2(e, t) {
              let r = 0;
              return (
                this.readModule(e - 3, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 2, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 1, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 4, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 3, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 1, e, t) && (r |= 1),
                r
              );
            }
            readCorner3(e, t) {
              let r = 0;
              return (
                this.readModule(e - 1, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 1, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 3, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 3, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 1, e, t) && (r |= 1),
                r
              );
            }
            readCorner4(e, t) {
              let r = 0;
              return (
                this.readModule(e - 3, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 2, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(e - 1, 0, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 2, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(0, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(1, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(2, t - 1, e, t) && (r |= 1),
                (r <<= 1),
                this.readModule(3, t - 1, e, t) && (r |= 1),
                r
              );
            }
            extractDataRegion(e) {
              const t = this.version.getSymbolSizeRows(),
                r = this.version.getSymbolSizeColumns();
              if (e.getHeight() !== t)
                throw new T(
                  'Dimension of bitMatrix must match the version size',
                );
              const s = this.version.getDataRegionSizeRows(),
                o = this.version.getDataRegionSizeColumns(),
                a = (t / s) | 0,
                c = (r / o) | 0,
                d = a * s,
                f = c * o,
                x = new we(f, d);
              for (let m = 0; m < a; ++m) {
                const C = m * s;
                for (let S = 0; S < c; ++S) {
                  const v = S * o;
                  for (let N = 0; N < s; ++N) {
                    const O = m * (s + 2) + 1 + N,
                      U = C + N;
                    for (let q = 0; q < o; ++q) {
                      const Z = S * (o + 2) + 1 + q;
                      if (e.get(Z, O)) {
                        const K = v + q;
                        x.set(K, U);
                      }
                    }
                  }
                }
              }
              return x;
            }
          }
          class Fi {
            constructor(e, t) {
              ((this.numDataCodewords = e), (this.codewords = t));
            }
            static getDataBlocks(e, t) {
              const r = t.getECBlocks();
              let s = 0;
              const o = r.getECBlocks();
              for (let N of o) s += N.getCount();
              const a = new Array(s);
              let c = 0;
              for (let N of o)
                for (let O = 0; O < N.getCount(); O++) {
                  const U = N.getDataCodewords(),
                    q = r.getECCodewords() + U;
                  a[c++] = new Fi(U, new Uint8Array(q));
                }
              const f = a[0].codewords.length - r.getECCodewords(),
                x = f - 1;
              let m = 0;
              for (let N = 0; N < x; N++)
                for (let O = 0; O < c; O++) a[O].codewords[N] = e[m++];
              const C = t.getVersionNumber() === 24,
                S = C ? 8 : c;
              for (let N = 0; N < S; N++) a[N].codewords[f - 1] = e[m++];
              const v = a[0].codewords.length;
              for (let N = f; N < v; N++)
                for (let O = 0; O < c; O++) {
                  const U = C ? (O + 8) % c : O,
                    q = C && U > 7 ? N - 1 : N;
                  a[U].codewords[q] = e[m++];
                }
              if (m !== e.length) throw new T();
              return a;
            }
            getNumDataCodewords() {
              return this.numDataCodewords;
            }
            getCodewords() {
              return this.codewords;
            }
          }
          class Ui {
            constructor(e) {
              ((this.bytes = e), (this.byteOffset = 0), (this.bitOffset = 0));
            }
            getBitOffset() {
              return this.bitOffset;
            }
            getByteOffset() {
              return this.byteOffset;
            }
            readBits(e) {
              if (e < 1 || e > 32 || e > this.available()) throw new T('' + e);
              let t = 0,
                r = this.bitOffset,
                s = this.byteOffset;
              const o = this.bytes;
              if (r > 0) {
                const a = 8 - r,
                  c = e < a ? e : a,
                  d = a - c,
                  f = (255 >> (8 - c)) << d;
                ((t = (o[s] & f) >> d),
                  (e -= c),
                  (r += c),
                  r === 8 && ((r = 0), s++));
              }
              if (e > 0) {
                for (; e >= 8;) ((t = (t << 8) | (o[s] & 255)), s++, (e -= 8));
                if (e > 0) {
                  const a = 8 - e,
                    c = (255 >> a) << a;
                  ((t = (t << e) | ((o[s] & c) >> a)), (r += e));
                }
              }
              return ((this.bitOffset = r), (this.byteOffset = s), t);
            }
            available() {
              return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
            }
          }
          var lt;
          (function (A) {
            ((A[(A.PAD_ENCODE = 0)] = 'PAD_ENCODE'),
              (A[(A.ASCII_ENCODE = 1)] = 'ASCII_ENCODE'),
              (A[(A.C40_ENCODE = 2)] = 'C40_ENCODE'),
              (A[(A.TEXT_ENCODE = 3)] = 'TEXT_ENCODE'),
              (A[(A.ANSIX12_ENCODE = 4)] = 'ANSIX12_ENCODE'),
              (A[(A.EDIFACT_ENCODE = 5)] = 'EDIFACT_ENCODE'),
              (A[(A.BASE256_ENCODE = 6)] = 'BASE256_ENCODE'));
          })(lt || (lt = {}));
          class Pr {
            static decode(e) {
              const t = new Ui(e),
                r = new $(),
                s = new $(),
                o = new Array();
              let a = lt.ASCII_ENCODE;
              do
                if (a === lt.ASCII_ENCODE) a = this.decodeAsciiSegment(t, r, s);
                else {
                  switch (a) {
                    case lt.C40_ENCODE:
                      this.decodeC40Segment(t, r);
                      break;
                    case lt.TEXT_ENCODE:
                      this.decodeTextSegment(t, r);
                      break;
                    case lt.ANSIX12_ENCODE:
                      this.decodeAnsiX12Segment(t, r);
                      break;
                    case lt.EDIFACT_ENCODE:
                      this.decodeEdifactSegment(t, r);
                      break;
                    case lt.BASE256_ENCODE:
                      this.decodeBase256Segment(t, r, o);
                      break;
                    default:
                      throw new Q();
                  }
                  a = lt.ASCII_ENCODE;
                }
              while (a !== lt.PAD_ENCODE && t.available() > 0);
              return (
                s.length() > 0 && r.append(s.toString()),
                new ze(e, r.toString(), o.length === 0 ? null : o, null)
              );
            }
            static decodeAsciiSegment(e, t, r) {
              let s = !1;
              do {
                let o = e.readBits(8);
                if (o === 0) throw new Q();
                if (o <= 128)
                  return (
                    s && (o += 128),
                    t.append(String.fromCharCode(o - 1)),
                    lt.ASCII_ENCODE
                  );
                if (o === 129) return lt.PAD_ENCODE;
                if (o <= 229) {
                  const a = o - 130;
                  (a < 10 && t.append('0'), t.append('' + a));
                } else
                  switch (o) {
                    case 230:
                      return lt.C40_ENCODE;
                    case 231:
                      return lt.BASE256_ENCODE;
                    case 232:
                      t.append('');
                      break;
                    case 233:
                    case 234:
                      break;
                    case 235:
                      s = !0;
                      break;
                    case 236:
                      (t.append('[)>05'), r.insert(0, ''));
                      break;
                    case 237:
                      (t.append('[)>06'), r.insert(0, ''));
                      break;
                    case 238:
                      return lt.ANSIX12_ENCODE;
                    case 239:
                      return lt.TEXT_ENCODE;
                    case 240:
                      return lt.EDIFACT_ENCODE;
                    case 241:
                      break;
                    default:
                      if (o !== 254 || e.available() !== 0) throw new Q();
                      break;
                  }
              } while (e.available() > 0);
              return lt.ASCII_ENCODE;
            }
            static decodeC40Segment(e, t) {
              let r = !1;
              const s = [];
              let o = 0;
              do {
                if (e.available() === 8) return;
                const a = e.readBits(8);
                if (a === 254) return;
                this.parseTwoBytes(a, e.readBits(8), s);
                for (let c = 0; c < 3; c++) {
                  const d = s[c];
                  switch (o) {
                    case 0:
                      if (d < 3) o = d + 1;
                      else if (d < this.C40_BASIC_SET_CHARS.length) {
                        const f = this.C40_BASIC_SET_CHARS[d];
                        r
                          ? (t.append(
                              String.fromCharCode(f.charCodeAt(0) + 128),
                            ),
                            (r = !1))
                          : t.append(f);
                      } else throw new Q();
                      break;
                    case 1:
                      (r
                        ? (t.append(String.fromCharCode(d + 128)), (r = !1))
                        : t.append(String.fromCharCode(d)),
                        (o = 0));
                      break;
                    case 2:
                      if (d < this.C40_SHIFT2_SET_CHARS.length) {
                        const f = this.C40_SHIFT2_SET_CHARS[d];
                        r
                          ? (t.append(
                              String.fromCharCode(f.charCodeAt(0) + 128),
                            ),
                            (r = !1))
                          : t.append(f);
                      } else
                        switch (d) {
                          case 27:
                            t.append('');
                            break;
                          case 30:
                            r = !0;
                            break;
                          default:
                            throw new Q();
                        }
                      o = 0;
                      break;
                    case 3:
                      (r
                        ? (t.append(String.fromCharCode(d + 224)), (r = !1))
                        : t.append(String.fromCharCode(d + 96)),
                        (o = 0));
                      break;
                    default:
                      throw new Q();
                  }
                }
              } while (e.available() > 0);
            }
            static decodeTextSegment(e, t) {
              let r = !1,
                s = [],
                o = 0;
              do {
                if (e.available() === 8) return;
                const a = e.readBits(8);
                if (a === 254) return;
                this.parseTwoBytes(a, e.readBits(8), s);
                for (let c = 0; c < 3; c++) {
                  const d = s[c];
                  switch (o) {
                    case 0:
                      if (d < 3) o = d + 1;
                      else if (d < this.TEXT_BASIC_SET_CHARS.length) {
                        const f = this.TEXT_BASIC_SET_CHARS[d];
                        r
                          ? (t.append(
                              String.fromCharCode(f.charCodeAt(0) + 128),
                            ),
                            (r = !1))
                          : t.append(f);
                      } else throw new Q();
                      break;
                    case 1:
                      (r
                        ? (t.append(String.fromCharCode(d + 128)), (r = !1))
                        : t.append(String.fromCharCode(d)),
                        (o = 0));
                      break;
                    case 2:
                      if (d < this.TEXT_SHIFT2_SET_CHARS.length) {
                        const f = this.TEXT_SHIFT2_SET_CHARS[d];
                        r
                          ? (t.append(
                              String.fromCharCode(f.charCodeAt(0) + 128),
                            ),
                            (r = !1))
                          : t.append(f);
                      } else
                        switch (d) {
                          case 27:
                            t.append('');
                            break;
                          case 30:
                            r = !0;
                            break;
                          default:
                            throw new Q();
                        }
                      o = 0;
                      break;
                    case 3:
                      if (d < this.TEXT_SHIFT3_SET_CHARS.length) {
                        const f = this.TEXT_SHIFT3_SET_CHARS[d];
                        (r
                          ? (t.append(
                              String.fromCharCode(f.charCodeAt(0) + 128),
                            ),
                            (r = !1))
                          : t.append(f),
                          (o = 0));
                      } else throw new Q();
                      break;
                    default:
                      throw new Q();
                  }
                }
              } while (e.available() > 0);
            }
            static decodeAnsiX12Segment(e, t) {
              const r = [];
              do {
                if (e.available() === 8) return;
                const s = e.readBits(8);
                if (s === 254) return;
                this.parseTwoBytes(s, e.readBits(8), r);
                for (let o = 0; o < 3; o++) {
                  const a = r[o];
                  switch (a) {
                    case 0:
                      t.append('\r');
                      break;
                    case 1:
                      t.append('*');
                      break;
                    case 2:
                      t.append('>');
                      break;
                    case 3:
                      t.append(' ');
                      break;
                    default:
                      if (a < 14) t.append(String.fromCharCode(a + 44));
                      else if (a < 40) t.append(String.fromCharCode(a + 51));
                      else throw new Q();
                      break;
                  }
                }
              } while (e.available() > 0);
            }
            static parseTwoBytes(e, t, r) {
              let s = (e << 8) + t - 1,
                o = Math.floor(s / 1600);
              ((r[0] = o),
                (s -= o * 1600),
                (o = Math.floor(s / 40)),
                (r[1] = o),
                (r[2] = s - o * 40));
            }
            static decodeEdifactSegment(e, t) {
              do {
                if (e.available() <= 16) return;
                for (let r = 0; r < 4; r++) {
                  let s = e.readBits(6);
                  if (s === 31) {
                    const o = 8 - e.getBitOffset();
                    o !== 8 && e.readBits(o);
                    return;
                  }
                  ((s & 32) === 0 && (s |= 64),
                    t.append(String.fromCharCode(s)));
                }
              } while (e.available() > 0);
            }
            static decodeBase256Segment(e, t, r) {
              let s = 1 + e.getByteOffset();
              const o = this.unrandomize255State(e.readBits(8), s++);
              let a;
              if (
                (o === 0
                  ? (a = (e.available() / 8) | 0)
                  : o < 250
                    ? (a = o)
                    : (a =
                        250 * (o - 249) +
                        this.unrandomize255State(e.readBits(8), s++)),
                a < 0)
              )
                throw new Q();
              const c = new Uint8Array(a);
              for (let d = 0; d < a; d++) {
                if (e.available() < 8) throw new Q();
                c[d] = this.unrandomize255State(e.readBits(8), s++);
              }
              r.push(c);
              try {
                t.append(xe.decode(c, se.ISO88591));
              } catch (d) {
                throw new or(
                  'Platform does not support required encoding: ' + d.message,
                );
              }
            }
            static unrandomize255State(e, t) {
              const r = ((149 * t) % 255) + 1,
                s = e - r;
              return s >= 0 ? s : s + 256;
            }
          }
          ((Pr.C40_BASIC_SET_CHARS = [
            '*',
            '*',
            '*',
            ' ',
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
          ]),
            (Pr.C40_SHIFT2_SET_CHARS = [
              '!',
              '"',
              '#',
              '$',
              '%',
              '&',
              "'",
              '(',
              ')',
              '*',
              '+',
              ',',
              '-',
              '.',
              '/',
              ':',
              ';',
              '<',
              '=',
              '>',
              '?',
              '@',
              '[',
              '\\',
              ']',
              '^',
              '_',
            ]),
            (Pr.TEXT_BASIC_SET_CHARS = [
              '*',
              '*',
              '*',
              ' ',
              '0',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              'a',
              'b',
              'c',
              'd',
              'e',
              'f',
              'g',
              'h',
              'i',
              'j',
              'k',
              'l',
              'm',
              'n',
              'o',
              'p',
              'q',
              'r',
              's',
              't',
              'u',
              'v',
              'w',
              'x',
              'y',
              'z',
            ]),
            (Pr.TEXT_SHIFT2_SET_CHARS = Pr.C40_SHIFT2_SET_CHARS),
            (Pr.TEXT_SHIFT3_SET_CHARS = [
              '`',
              'A',
              'B',
              'C',
              'D',
              'E',
              'F',
              'G',
              'H',
              'I',
              'J',
              'K',
              'L',
              'M',
              'N',
              'O',
              'P',
              'Q',
              'R',
              'S',
              'T',
              'U',
              'V',
              'W',
              'X',
              'Y',
              'Z',
              '{',
              '|',
              '}',
              '~',
              '',
            ]));
          class $c {
            constructor() {
              this.rsDecoder = new as(Re.DATA_MATRIX_FIELD_256);
            }
            decode(e) {
              const t = new ki(e),
                r = t.getVersion(),
                s = t.readCodewords(),
                o = Fi.getDataBlocks(s, r);
              let a = 0;
              for (let f of o) a += f.getNumDataCodewords();
              const c = new Uint8Array(a),
                d = o.length;
              for (let f = 0; f < d; f++) {
                const x = o[f],
                  m = x.getCodewords(),
                  C = x.getNumDataCodewords();
                this.correctErrors(m, C);
                for (let S = 0; S < C; S++) c[S * d + f] = m[S];
              }
              return Pr.decode(c);
            }
            correctErrors(e, t) {
              const r = new Int32Array(e);
              try {
                this.rsDecoder.decode(r, e.length - t);
              } catch {
                throw new D();
              }
              for (let s = 0; s < t; s++) e[s] = r[s];
            }
          }
          class $e {
            constructor(e) {
              ((this.image = e), (this.rectangleDetector = new yr(this.image)));
            }
            detect() {
              const e = this.rectangleDetector.detect();
              let t = this.detectSolid1(e);
              if (
                ((t = this.detectSolid2(t)),
                (t[3] = this.correctTopRight(t)),
                !t[3])
              )
                throw new k();
              t = this.shiftToModuleCenter(t);
              const r = t[0],
                s = t[1],
                o = t[2],
                a = t[3];
              let c = this.transitionsBetween(r, a) + 1,
                d = this.transitionsBetween(o, a) + 1;
              ((c & 1) === 1 && (c += 1),
                (d & 1) === 1 && (d += 1),
                4 * c < 7 * d && 4 * d < 7 * c && (c = d = Math.max(c, d)));
              let f = $e.sampleGrid(this.image, r, s, o, a, c, d);
              return new ni(f, [r, s, o, a]);
            }
            static shiftPoint(e, t, r) {
              let s = (t.getX() - e.getX()) / (r + 1),
                o = (t.getY() - e.getY()) / (r + 1);
              return new de(e.getX() + s, e.getY() + o);
            }
            static moveAway(e, t, r) {
              let s = e.getX(),
                o = e.getY();
              return (
                s < t ? (s -= 1) : (s += 1),
                o < r ? (o -= 1) : (o += 1),
                new de(s, o)
              );
            }
            detectSolid1(e) {
              let t = e[0],
                r = e[1],
                s = e[3],
                o = e[2],
                a = this.transitionsBetween(t, r),
                c = this.transitionsBetween(r, s),
                d = this.transitionsBetween(s, o),
                f = this.transitionsBetween(o, t),
                x = a,
                m = [o, t, r, s];
              return (
                x > c &&
                  ((x = c), (m[0] = t), (m[1] = r), (m[2] = s), (m[3] = o)),
                x > d &&
                  ((x = d), (m[0] = r), (m[1] = s), (m[2] = o), (m[3] = t)),
                x > f && ((m[0] = s), (m[1] = o), (m[2] = t), (m[3] = r)),
                m
              );
            }
            detectSolid2(e) {
              let t = e[0],
                r = e[1],
                s = e[2],
                o = e[3],
                a = this.transitionsBetween(t, o),
                c = $e.shiftPoint(r, s, (a + 1) * 4),
                d = $e.shiftPoint(s, r, (a + 1) * 4),
                f = this.transitionsBetween(c, t),
                x = this.transitionsBetween(d, o);
              return (
                f < x
                  ? ((e[0] = t), (e[1] = r), (e[2] = s), (e[3] = o))
                  : ((e[0] = r), (e[1] = s), (e[2] = o), (e[3] = t)),
                e
              );
            }
            correctTopRight(e) {
              let t = e[0],
                r = e[1],
                s = e[2],
                o = e[3],
                a = this.transitionsBetween(t, o),
                c = this.transitionsBetween(r, o),
                d = $e.shiftPoint(t, r, (c + 1) * 4),
                f = $e.shiftPoint(s, r, (a + 1) * 4);
              ((a = this.transitionsBetween(d, o)),
                (c = this.transitionsBetween(f, o)));
              let x = new de(
                  o.getX() + (s.getX() - r.getX()) / (a + 1),
                  o.getY() + (s.getY() - r.getY()) / (a + 1),
                ),
                m = new de(
                  o.getX() + (t.getX() - r.getX()) / (c + 1),
                  o.getY() + (t.getY() - r.getY()) / (c + 1),
                );
              if (!this.isValid(x)) return this.isValid(m) ? m : null;
              if (!this.isValid(m)) return x;
              let C =
                  this.transitionsBetween(d, x) + this.transitionsBetween(f, x),
                S =
                  this.transitionsBetween(d, m) + this.transitionsBetween(f, m);
              return C > S ? x : m;
            }
            shiftToModuleCenter(e) {
              let t = e[0],
                r = e[1],
                s = e[2],
                o = e[3],
                a = this.transitionsBetween(t, o) + 1,
                c = this.transitionsBetween(s, o) + 1,
                d = $e.shiftPoint(t, r, c * 4),
                f = $e.shiftPoint(s, r, a * 4);
              ((a = this.transitionsBetween(d, o) + 1),
                (c = this.transitionsBetween(f, o) + 1),
                (a & 1) === 1 && (a += 1),
                (c & 1) === 1 && (c += 1));
              let x = (t.getX() + r.getX() + s.getX() + o.getX()) / 4,
                m = (t.getY() + r.getY() + s.getY() + o.getY()) / 4;
              ((t = $e.moveAway(t, x, m)),
                (r = $e.moveAway(r, x, m)),
                (s = $e.moveAway(s, x, m)),
                (o = $e.moveAway(o, x, m)));
              let C, S;
              return (
                (d = $e.shiftPoint(t, r, c * 4)),
                (d = $e.shiftPoint(d, o, a * 4)),
                (C = $e.shiftPoint(r, t, c * 4)),
                (C = $e.shiftPoint(C, s, a * 4)),
                (f = $e.shiftPoint(s, o, c * 4)),
                (f = $e.shiftPoint(f, r, a * 4)),
                (S = $e.shiftPoint(o, s, c * 4)),
                (S = $e.shiftPoint(S, t, a * 4)),
                [d, C, f, S]
              );
            }
            isValid(e) {
              return (
                e.getX() >= 0 &&
                e.getX() < this.image.getWidth() &&
                e.getY() > 0 &&
                e.getY() < this.image.getHeight()
              );
            }
            static sampleGrid(e, t, r, s, o, a, c) {
              return Dr.getInstance().sampleGrid(
                e,
                a,
                c,
                0.5,
                0.5,
                a - 0.5,
                0.5,
                a - 0.5,
                c - 0.5,
                0.5,
                c - 0.5,
                t.getX(),
                t.getY(),
                o.getX(),
                o.getY(),
                s.getX(),
                s.getY(),
                r.getX(),
                r.getY(),
              );
            }
            transitionsBetween(e, t) {
              let r = Math.trunc(e.getX()),
                s = Math.trunc(e.getY()),
                o = Math.trunc(t.getX()),
                a = Math.trunc(t.getY()),
                c = Math.abs(a - s) > Math.abs(o - r);
              if (c) {
                let N = r;
                ((r = s), (s = N), (N = o), (o = a), (a = N));
              }
              let d = Math.abs(o - r),
                f = Math.abs(a - s),
                x = -d / 2,
                m = s < a ? 1 : -1,
                C = r < o ? 1 : -1,
                S = 0,
                v = this.image.get(c ? s : r, c ? r : s);
              for (let N = r, O = s; N !== o; N += C) {
                let U = this.image.get(c ? O : N, c ? N : O);
                if ((U !== v && (S++, (v = U)), (x += f), x > 0)) {
                  if (O === a) break;
                  ((O += m), (x -= d));
                }
              }
              return S;
            }
          }
          class Br {
            constructor() {
              this.decoder = new $c();
            }
            decode(e, t = null) {
              let r, s;
              if (t != null && t.has(re.PURE_BARCODE)) {
                const f = Br.extractPureBits(e.getBlackMatrix());
                ((r = this.decoder.decode(f)), (s = Br.NO_POINTS));
              } else {
                const f = new $e(e.getBlackMatrix()).detect();
                ((r = this.decoder.decode(f.getBits())), (s = f.getPoints()));
              }
              const o = r.getRawBytes(),
                a = new st(
                  r.getText(),
                  o,
                  8 * o.length,
                  s,
                  oe.DATA_MATRIX,
                  M.currentTimeMillis(),
                ),
                c = r.getByteSegments();
              c != null && a.putMetadata(Ze.BYTE_SEGMENTS, c);
              const d = r.getECLevel();
              return (
                d != null && a.putMetadata(Ze.ERROR_CORRECTION_LEVEL, d),
                a
              );
            }
            reset() {}
            static extractPureBits(e) {
              const t = e.getTopLeftOnBit(),
                r = e.getBottomRightOnBit();
              if (t == null || r == null) throw new k();
              const s = this.moduleSize(t, e);
              let o = t[1];
              const a = r[1];
              let c = t[0];
              const f = (r[0] - c + 1) / s,
                x = (a - o + 1) / s;
              if (f <= 0 || x <= 0) throw new k();
              const m = s / 2;
              ((o += m), (c += m));
              const C = new we(f, x);
              for (let S = 0; S < x; S++) {
                const v = o + S * s;
                for (let N = 0; N < f; N++) e.get(c + N * s, v) && C.set(N, S);
              }
              return C;
            }
            static moduleSize(e, t) {
              const r = t.getWidth();
              let s = e[0];
              const o = e[1];
              for (; s < r && t.get(s, o);) s++;
              if (s === r) throw new k();
              const a = s - e[0];
              if (a === 0) throw new k();
              return a;
            }
          }
          Br.NO_POINTS = [];
          class e1 extends ir {
            constructor(e = 500) {
              super(new Br(), e);
            }
          }
          var _n;
          (function (A) {
            ((A[(A.L = 0)] = 'L'),
              (A[(A.M = 1)] = 'M'),
              (A[(A.Q = 2)] = 'Q'),
              (A[(A.H = 3)] = 'H'));
          })(_n || (_n = {}));
          class Ue {
            constructor(e, t, r) {
              ((this.value = e),
                (this.stringValue = t),
                (this.bits = r),
                Ue.FOR_BITS.set(r, this),
                Ue.FOR_VALUE.set(e, this));
            }
            getValue() {
              return this.value;
            }
            getBits() {
              return this.bits;
            }
            static fromString(e) {
              switch (e) {
                case 'L':
                  return Ue.L;
                case 'M':
                  return Ue.M;
                case 'Q':
                  return Ue.Q;
                case 'H':
                  return Ue.H;
                default:
                  throw new R(e + 'not available');
              }
            }
            toString() {
              return this.stringValue;
            }
            equals(e) {
              if (!(e instanceof Ue)) return !1;
              const t = e;
              return this.value === t.value;
            }
            static forBits(e) {
              if (e < 0 || e >= Ue.FOR_BITS.size) throw new T();
              return Ue.FOR_BITS.get(e);
            }
          }
          ((Ue.FOR_BITS = new Map()),
            (Ue.FOR_VALUE = new Map()),
            (Ue.L = new Ue(_n.L, 'L', 1)),
            (Ue.M = new Ue(_n.M, 'M', 0)),
            (Ue.Q = new Ue(_n.Q, 'Q', 3)),
            (Ue.H = new Ue(_n.H, 'H', 2)));
          class bt {
            constructor(e) {
              ((this.errorCorrectionLevel = Ue.forBits((e >> 3) & 3)),
                (this.dataMask = e & 7));
            }
            static numBitsDiffering(e, t) {
              return H.bitCount(e ^ t);
            }
            static decodeFormatInformation(e, t) {
              const r = bt.doDecodeFormatInformation(e, t);
              return r !== null
                ? r
                : bt.doDecodeFormatInformation(
                    e ^ bt.FORMAT_INFO_MASK_QR,
                    t ^ bt.FORMAT_INFO_MASK_QR,
                  );
            }
            static doDecodeFormatInformation(e, t) {
              let r = Number.MAX_SAFE_INTEGER,
                s = 0;
              for (const o of bt.FORMAT_INFO_DECODE_LOOKUP) {
                const a = o[0];
                if (a === e || a === t) return new bt(o[1]);
                let c = bt.numBitsDiffering(e, a);
                (c < r && ((s = o[1]), (r = c)),
                  e !== t &&
                    ((c = bt.numBitsDiffering(t, a)),
                    c < r && ((s = o[1]), (r = c))));
              }
              return r <= 3 ? new bt(s) : null;
            }
            getErrorCorrectionLevel() {
              return this.errorCorrectionLevel;
            }
            getDataMask() {
              return this.dataMask;
            }
            hashCode() {
              return (this.errorCorrectionLevel.getBits() << 3) | this.dataMask;
            }
            equals(e) {
              if (!(e instanceof bt)) return !1;
              const t = e;
              return (
                this.errorCorrectionLevel === t.errorCorrectionLevel &&
                this.dataMask === t.dataMask
              );
            }
          }
          ((bt.FORMAT_INFO_MASK_QR = 21522),
            (bt.FORMAT_INFO_DECODE_LOOKUP = [
              Int32Array.from([21522, 0]),
              Int32Array.from([20773, 1]),
              Int32Array.from([24188, 2]),
              Int32Array.from([23371, 3]),
              Int32Array.from([17913, 4]),
              Int32Array.from([16590, 5]),
              Int32Array.from([20375, 6]),
              Int32Array.from([19104, 7]),
              Int32Array.from([30660, 8]),
              Int32Array.from([29427, 9]),
              Int32Array.from([32170, 10]),
              Int32Array.from([30877, 11]),
              Int32Array.from([26159, 12]),
              Int32Array.from([25368, 13]),
              Int32Array.from([27713, 14]),
              Int32Array.from([26998, 15]),
              Int32Array.from([5769, 16]),
              Int32Array.from([5054, 17]),
              Int32Array.from([7399, 18]),
              Int32Array.from([6608, 19]),
              Int32Array.from([1890, 20]),
              Int32Array.from([597, 21]),
              Int32Array.from([3340, 22]),
              Int32Array.from([2107, 23]),
              Int32Array.from([13663, 24]),
              Int32Array.from([12392, 25]),
              Int32Array.from([16177, 26]),
              Int32Array.from([14854, 27]),
              Int32Array.from([9396, 28]),
              Int32Array.from([8579, 29]),
              Int32Array.from([11994, 30]),
              Int32Array.from([11245, 31]),
            ]));
          class B {
            constructor(e, ...t) {
              ((this.ecCodewordsPerBlock = e), (this.ecBlocks = t));
            }
            getECCodewordsPerBlock() {
              return this.ecCodewordsPerBlock;
            }
            getNumBlocks() {
              let e = 0;
              const t = this.ecBlocks;
              for (const r of t) e += r.getCount();
              return e;
            }
            getTotalECCodewords() {
              return this.ecCodewordsPerBlock * this.getNumBlocks();
            }
            getECBlocks() {
              return this.ecBlocks;
            }
          }
          class E {
            constructor(e, t) {
              ((this.count = e), (this.dataCodewords = t));
            }
            getCount() {
              return this.count;
            }
            getDataCodewords() {
              return this.dataCodewords;
            }
          }
          class he {
            constructor(e, t, ...r) {
              ((this.versionNumber = e),
                (this.alignmentPatternCenters = t),
                (this.ecBlocks = r));
              let s = 0;
              const o = r[0].getECCodewordsPerBlock(),
                a = r[0].getECBlocks();
              for (const c of a) s += c.getCount() * (c.getDataCodewords() + o);
              this.totalCodewords = s;
            }
            getVersionNumber() {
              return this.versionNumber;
            }
            getAlignmentPatternCenters() {
              return this.alignmentPatternCenters;
            }
            getTotalCodewords() {
              return this.totalCodewords;
            }
            getDimensionForVersion() {
              return 17 + 4 * this.versionNumber;
            }
            getECBlocksForLevel(e) {
              return this.ecBlocks[e.getValue()];
            }
            static getProvisionalVersionForDimension(e) {
              if (e % 4 !== 1) throw new Q();
              try {
                return this.getVersionForNumber((e - 17) / 4);
              } catch {
                throw new Q();
              }
            }
            static getVersionForNumber(e) {
              if (e < 1 || e > 40) throw new T();
              return he.VERSIONS[e - 1];
            }
            static decodeVersionInformation(e) {
              let t = Number.MAX_SAFE_INTEGER,
                r = 0;
              for (let s = 0; s < he.VERSION_DECODE_INFO.length; s++) {
                const o = he.VERSION_DECODE_INFO[s];
                if (o === e) return he.getVersionForNumber(s + 7);
                const a = bt.numBitsDiffering(e, o);
                a < t && ((r = s + 7), (t = a));
              }
              return t <= 3 ? he.getVersionForNumber(r) : null;
            }
            buildFunctionPattern() {
              const e = this.getDimensionForVersion(),
                t = new we(e);
              (t.setRegion(0, 0, 9, 9),
                t.setRegion(e - 8, 0, 8, 9),
                t.setRegion(0, e - 8, 9, 8));
              const r = this.alignmentPatternCenters.length;
              for (let s = 0; s < r; s++) {
                const o = this.alignmentPatternCenters[s] - 2;
                for (let a = 0; a < r; a++)
                  (s === 0 && (a === 0 || a === r - 1)) ||
                    (s === r - 1 && a === 0) ||
                    t.setRegion(this.alignmentPatternCenters[a] - 2, o, 5, 5);
              }
              return (
                t.setRegion(6, 9, 1, e - 17),
                t.setRegion(9, 6, e - 17, 1),
                this.versionNumber > 6 &&
                  (t.setRegion(e - 11, 0, 3, 6), t.setRegion(0, e - 11, 6, 3)),
                t
              );
            }
            toString() {
              return '' + this.versionNumber;
            }
          }
          ((he.VERSION_DECODE_INFO = Int32Array.from([
            31892, 34236, 39577, 42195, 48118, 51042, 55367, 58893, 63784,
            68472, 70749, 76311, 79154, 84390, 87683, 92361, 96236, 102084,
            102881, 110507, 110734, 117786, 119615, 126325, 127568, 133589,
            136944, 141498, 145311, 150283, 152622, 158308, 161089, 167017,
          ])),
            (he.VERSIONS = [
              new he(
                1,
                new Int32Array(0),
                new B(7, new E(1, 19)),
                new B(10, new E(1, 16)),
                new B(13, new E(1, 13)),
                new B(17, new E(1, 9)),
              ),
              new he(
                2,
                Int32Array.from([6, 18]),
                new B(10, new E(1, 34)),
                new B(16, new E(1, 28)),
                new B(22, new E(1, 22)),
                new B(28, new E(1, 16)),
              ),
              new he(
                3,
                Int32Array.from([6, 22]),
                new B(15, new E(1, 55)),
                new B(26, new E(1, 44)),
                new B(18, new E(2, 17)),
                new B(22, new E(2, 13)),
              ),
              new he(
                4,
                Int32Array.from([6, 26]),
                new B(20, new E(1, 80)),
                new B(18, new E(2, 32)),
                new B(26, new E(2, 24)),
                new B(16, new E(4, 9)),
              ),
              new he(
                5,
                Int32Array.from([6, 30]),
                new B(26, new E(1, 108)),
                new B(24, new E(2, 43)),
                new B(18, new E(2, 15), new E(2, 16)),
                new B(22, new E(2, 11), new E(2, 12)),
              ),
              new he(
                6,
                Int32Array.from([6, 34]),
                new B(18, new E(2, 68)),
                new B(16, new E(4, 27)),
                new B(24, new E(4, 19)),
                new B(28, new E(4, 15)),
              ),
              new he(
                7,
                Int32Array.from([6, 22, 38]),
                new B(20, new E(2, 78)),
                new B(18, new E(4, 31)),
                new B(18, new E(2, 14), new E(4, 15)),
                new B(26, new E(4, 13), new E(1, 14)),
              ),
              new he(
                8,
                Int32Array.from([6, 24, 42]),
                new B(24, new E(2, 97)),
                new B(22, new E(2, 38), new E(2, 39)),
                new B(22, new E(4, 18), new E(2, 19)),
                new B(26, new E(4, 14), new E(2, 15)),
              ),
              new he(
                9,
                Int32Array.from([6, 26, 46]),
                new B(30, new E(2, 116)),
                new B(22, new E(3, 36), new E(2, 37)),
                new B(20, new E(4, 16), new E(4, 17)),
                new B(24, new E(4, 12), new E(4, 13)),
              ),
              new he(
                10,
                Int32Array.from([6, 28, 50]),
                new B(18, new E(2, 68), new E(2, 69)),
                new B(26, new E(4, 43), new E(1, 44)),
                new B(24, new E(6, 19), new E(2, 20)),
                new B(28, new E(6, 15), new E(2, 16)),
              ),
              new he(
                11,
                Int32Array.from([6, 30, 54]),
                new B(20, new E(4, 81)),
                new B(30, new E(1, 50), new E(4, 51)),
                new B(28, new E(4, 22), new E(4, 23)),
                new B(24, new E(3, 12), new E(8, 13)),
              ),
              new he(
                12,
                Int32Array.from([6, 32, 58]),
                new B(24, new E(2, 92), new E(2, 93)),
                new B(22, new E(6, 36), new E(2, 37)),
                new B(26, new E(4, 20), new E(6, 21)),
                new B(28, new E(7, 14), new E(4, 15)),
              ),
              new he(
                13,
                Int32Array.from([6, 34, 62]),
                new B(26, new E(4, 107)),
                new B(22, new E(8, 37), new E(1, 38)),
                new B(24, new E(8, 20), new E(4, 21)),
                new B(22, new E(12, 11), new E(4, 12)),
              ),
              new he(
                14,
                Int32Array.from([6, 26, 46, 66]),
                new B(30, new E(3, 115), new E(1, 116)),
                new B(24, new E(4, 40), new E(5, 41)),
                new B(20, new E(11, 16), new E(5, 17)),
                new B(24, new E(11, 12), new E(5, 13)),
              ),
              new he(
                15,
                Int32Array.from([6, 26, 48, 70]),
                new B(22, new E(5, 87), new E(1, 88)),
                new B(24, new E(5, 41), new E(5, 42)),
                new B(30, new E(5, 24), new E(7, 25)),
                new B(24, new E(11, 12), new E(7, 13)),
              ),
              new he(
                16,
                Int32Array.from([6, 26, 50, 74]),
                new B(24, new E(5, 98), new E(1, 99)),
                new B(28, new E(7, 45), new E(3, 46)),
                new B(24, new E(15, 19), new E(2, 20)),
                new B(30, new E(3, 15), new E(13, 16)),
              ),
              new he(
                17,
                Int32Array.from([6, 30, 54, 78]),
                new B(28, new E(1, 107), new E(5, 108)),
                new B(28, new E(10, 46), new E(1, 47)),
                new B(28, new E(1, 22), new E(15, 23)),
                new B(28, new E(2, 14), new E(17, 15)),
              ),
              new he(
                18,
                Int32Array.from([6, 30, 56, 82]),
                new B(30, new E(5, 120), new E(1, 121)),
                new B(26, new E(9, 43), new E(4, 44)),
                new B(28, new E(17, 22), new E(1, 23)),
                new B(28, new E(2, 14), new E(19, 15)),
              ),
              new he(
                19,
                Int32Array.from([6, 30, 58, 86]),
                new B(28, new E(3, 113), new E(4, 114)),
                new B(26, new E(3, 44), new E(11, 45)),
                new B(26, new E(17, 21), new E(4, 22)),
                new B(26, new E(9, 13), new E(16, 14)),
              ),
              new he(
                20,
                Int32Array.from([6, 34, 62, 90]),
                new B(28, new E(3, 107), new E(5, 108)),
                new B(26, new E(3, 41), new E(13, 42)),
                new B(30, new E(15, 24), new E(5, 25)),
                new B(28, new E(15, 15), new E(10, 16)),
              ),
              new he(
                21,
                Int32Array.from([6, 28, 50, 72, 94]),
                new B(28, new E(4, 116), new E(4, 117)),
                new B(26, new E(17, 42)),
                new B(28, new E(17, 22), new E(6, 23)),
                new B(30, new E(19, 16), new E(6, 17)),
              ),
              new he(
                22,
                Int32Array.from([6, 26, 50, 74, 98]),
                new B(28, new E(2, 111), new E(7, 112)),
                new B(28, new E(17, 46)),
                new B(30, new E(7, 24), new E(16, 25)),
                new B(24, new E(34, 13)),
              ),
              new he(
                23,
                Int32Array.from([6, 30, 54, 78, 102]),
                new B(30, new E(4, 121), new E(5, 122)),
                new B(28, new E(4, 47), new E(14, 48)),
                new B(30, new E(11, 24), new E(14, 25)),
                new B(30, new E(16, 15), new E(14, 16)),
              ),
              new he(
                24,
                Int32Array.from([6, 28, 54, 80, 106]),
                new B(30, new E(6, 117), new E(4, 118)),
                new B(28, new E(6, 45), new E(14, 46)),
                new B(30, new E(11, 24), new E(16, 25)),
                new B(30, new E(30, 16), new E(2, 17)),
              ),
              new he(
                25,
                Int32Array.from([6, 32, 58, 84, 110]),
                new B(26, new E(8, 106), new E(4, 107)),
                new B(28, new E(8, 47), new E(13, 48)),
                new B(30, new E(7, 24), new E(22, 25)),
                new B(30, new E(22, 15), new E(13, 16)),
              ),
              new he(
                26,
                Int32Array.from([6, 30, 58, 86, 114]),
                new B(28, new E(10, 114), new E(2, 115)),
                new B(28, new E(19, 46), new E(4, 47)),
                new B(28, new E(28, 22), new E(6, 23)),
                new B(30, new E(33, 16), new E(4, 17)),
              ),
              new he(
                27,
                Int32Array.from([6, 34, 62, 90, 118]),
                new B(30, new E(8, 122), new E(4, 123)),
                new B(28, new E(22, 45), new E(3, 46)),
                new B(30, new E(8, 23), new E(26, 24)),
                new B(30, new E(12, 15), new E(28, 16)),
              ),
              new he(
                28,
                Int32Array.from([6, 26, 50, 74, 98, 122]),
                new B(30, new E(3, 117), new E(10, 118)),
                new B(28, new E(3, 45), new E(23, 46)),
                new B(30, new E(4, 24), new E(31, 25)),
                new B(30, new E(11, 15), new E(31, 16)),
              ),
              new he(
                29,
                Int32Array.from([6, 30, 54, 78, 102, 126]),
                new B(30, new E(7, 116), new E(7, 117)),
                new B(28, new E(21, 45), new E(7, 46)),
                new B(30, new E(1, 23), new E(37, 24)),
                new B(30, new E(19, 15), new E(26, 16)),
              ),
              new he(
                30,
                Int32Array.from([6, 26, 52, 78, 104, 130]),
                new B(30, new E(5, 115), new E(10, 116)),
                new B(28, new E(19, 47), new E(10, 48)),
                new B(30, new E(15, 24), new E(25, 25)),
                new B(30, new E(23, 15), new E(25, 16)),
              ),
              new he(
                31,
                Int32Array.from([6, 30, 56, 82, 108, 134]),
                new B(30, new E(13, 115), new E(3, 116)),
                new B(28, new E(2, 46), new E(29, 47)),
                new B(30, new E(42, 24), new E(1, 25)),
                new B(30, new E(23, 15), new E(28, 16)),
              ),
              new he(
                32,
                Int32Array.from([6, 34, 60, 86, 112, 138]),
                new B(30, new E(17, 115)),
                new B(28, new E(10, 46), new E(23, 47)),
                new B(30, new E(10, 24), new E(35, 25)),
                new B(30, new E(19, 15), new E(35, 16)),
              ),
              new he(
                33,
                Int32Array.from([6, 30, 58, 86, 114, 142]),
                new B(30, new E(17, 115), new E(1, 116)),
                new B(28, new E(14, 46), new E(21, 47)),
                new B(30, new E(29, 24), new E(19, 25)),
                new B(30, new E(11, 15), new E(46, 16)),
              ),
              new he(
                34,
                Int32Array.from([6, 34, 62, 90, 118, 146]),
                new B(30, new E(13, 115), new E(6, 116)),
                new B(28, new E(14, 46), new E(23, 47)),
                new B(30, new E(44, 24), new E(7, 25)),
                new B(30, new E(59, 16), new E(1, 17)),
              ),
              new he(
                35,
                Int32Array.from([6, 30, 54, 78, 102, 126, 150]),
                new B(30, new E(12, 121), new E(7, 122)),
                new B(28, new E(12, 47), new E(26, 48)),
                new B(30, new E(39, 24), new E(14, 25)),
                new B(30, new E(22, 15), new E(41, 16)),
              ),
              new he(
                36,
                Int32Array.from([6, 24, 50, 76, 102, 128, 154]),
                new B(30, new E(6, 121), new E(14, 122)),
                new B(28, new E(6, 47), new E(34, 48)),
                new B(30, new E(46, 24), new E(10, 25)),
                new B(30, new E(2, 15), new E(64, 16)),
              ),
              new he(
                37,
                Int32Array.from([6, 28, 54, 80, 106, 132, 158]),
                new B(30, new E(17, 122), new E(4, 123)),
                new B(28, new E(29, 46), new E(14, 47)),
                new B(30, new E(49, 24), new E(10, 25)),
                new B(30, new E(24, 15), new E(46, 16)),
              ),
              new he(
                38,
                Int32Array.from([6, 32, 58, 84, 110, 136, 162]),
                new B(30, new E(4, 122), new E(18, 123)),
                new B(28, new E(13, 46), new E(32, 47)),
                new B(30, new E(48, 24), new E(14, 25)),
                new B(30, new E(42, 15), new E(32, 16)),
              ),
              new he(
                39,
                Int32Array.from([6, 26, 54, 82, 110, 138, 166]),
                new B(30, new E(20, 117), new E(4, 118)),
                new B(28, new E(40, 47), new E(7, 48)),
                new B(30, new E(43, 24), new E(22, 25)),
                new B(30, new E(10, 15), new E(67, 16)),
              ),
              new he(
                40,
                Int32Array.from([6, 30, 58, 86, 114, 142, 170]),
                new B(30, new E(19, 118), new E(6, 119)),
                new B(28, new E(18, 47), new E(31, 48)),
                new B(30, new E(34, 24), new E(34, 25)),
                new B(30, new E(20, 15), new E(61, 16)),
              ),
            ]));
          var ft;
          (function (A) {
            ((A[(A.DATA_MASK_000 = 0)] = 'DATA_MASK_000'),
              (A[(A.DATA_MASK_001 = 1)] = 'DATA_MASK_001'),
              (A[(A.DATA_MASK_010 = 2)] = 'DATA_MASK_010'),
              (A[(A.DATA_MASK_011 = 3)] = 'DATA_MASK_011'),
              (A[(A.DATA_MASK_100 = 4)] = 'DATA_MASK_100'),
              (A[(A.DATA_MASK_101 = 5)] = 'DATA_MASK_101'),
              (A[(A.DATA_MASK_110 = 6)] = 'DATA_MASK_110'),
              (A[(A.DATA_MASK_111 = 7)] = 'DATA_MASK_111'));
          })(ft || (ft = {}));
          class Wt {
            constructor(e, t) {
              ((this.value = e), (this.isMasked = t));
            }
            unmaskBitMatrix(e, t) {
              for (let r = 0; r < t; r++)
                for (let s = 0; s < t; s++) this.isMasked(r, s) && e.flip(s, r);
            }
          }
          Wt.values = new Map([
            [
              ft.DATA_MASK_000,
              new Wt(ft.DATA_MASK_000, (A, e) => ((A + e) & 1) === 0),
            ],
            [
              ft.DATA_MASK_001,
              new Wt(ft.DATA_MASK_001, (A, e) => (A & 1) === 0),
            ],
            [ft.DATA_MASK_010, new Wt(ft.DATA_MASK_010, (A, e) => e % 3 === 0)],
            [
              ft.DATA_MASK_011,
              new Wt(ft.DATA_MASK_011, (A, e) => (A + e) % 3 === 0),
            ],
            [
              ft.DATA_MASK_100,
              new Wt(
                ft.DATA_MASK_100,
                (A, e) => ((Math.floor(A / 2) + Math.floor(e / 3)) & 1) === 0,
              ),
            ],
            [
              ft.DATA_MASK_101,
              new Wt(ft.DATA_MASK_101, (A, e) => (A * e) % 6 === 0),
            ],
            [
              ft.DATA_MASK_110,
              new Wt(ft.DATA_MASK_110, (A, e) => (A * e) % 6 < 3),
            ],
            [
              ft.DATA_MASK_111,
              new Wt(
                ft.DATA_MASK_111,
                (A, e) => ((A + e + ((A * e) % 3)) & 1) === 0,
              ),
            ],
          ]);
          class t1 {
            constructor(e) {
              const t = e.getHeight();
              if (t < 21 || (t & 3) !== 1) throw new Q();
              this.bitMatrix = e;
            }
            readFormatInformation() {
              if (
                this.parsedFormatInfo !== null &&
                this.parsedFormatInfo !== void 0
              )
                return this.parsedFormatInfo;
              let e = 0;
              for (let o = 0; o < 6; o++) e = this.copyBit(o, 8, e);
              ((e = this.copyBit(7, 8, e)),
                (e = this.copyBit(8, 8, e)),
                (e = this.copyBit(8, 7, e)));
              for (let o = 5; o >= 0; o--) e = this.copyBit(8, o, e);
              const t = this.bitMatrix.getHeight();
              let r = 0;
              const s = t - 7;
              for (let o = t - 1; o >= s; o--) r = this.copyBit(8, o, r);
              for (let o = t - 8; o < t; o++) r = this.copyBit(o, 8, r);
              if (
                ((this.parsedFormatInfo = bt.decodeFormatInformation(e, r)),
                this.parsedFormatInfo !== null)
              )
                return this.parsedFormatInfo;
              throw new Q();
            }
            readVersion() {
              if (this.parsedVersion !== null && this.parsedVersion !== void 0)
                return this.parsedVersion;
              const e = this.bitMatrix.getHeight(),
                t = Math.floor((e - 17) / 4);
              if (t <= 6) return he.getVersionForNumber(t);
              let r = 0;
              const s = e - 11;
              for (let a = 5; a >= 0; a--)
                for (let c = e - 9; c >= s; c--) r = this.copyBit(c, a, r);
              let o = he.decodeVersionInformation(r);
              if (o !== null && o.getDimensionForVersion() === e)
                return ((this.parsedVersion = o), o);
              r = 0;
              for (let a = 5; a >= 0; a--)
                for (let c = e - 9; c >= s; c--) r = this.copyBit(a, c, r);
              if (
                ((o = he.decodeVersionInformation(r)),
                o !== null && o.getDimensionForVersion() === e)
              )
                return ((this.parsedVersion = o), o);
              throw new Q();
            }
            copyBit(e, t, r) {
              return (
                this.isMirror
                  ? this.bitMatrix.get(t, e)
                  : this.bitMatrix.get(e, t)
              )
                ? (r << 1) | 1
                : r << 1;
            }
            readCodewords() {
              const e = this.readFormatInformation(),
                t = this.readVersion(),
                r = Wt.values.get(e.getDataMask()),
                s = this.bitMatrix.getHeight();
              r.unmaskBitMatrix(this.bitMatrix, s);
              const o = t.buildFunctionPattern();
              let a = !0;
              const c = new Uint8Array(t.getTotalCodewords());
              let d = 0,
                f = 0,
                x = 0;
              for (let m = s - 1; m > 0; m -= 2) {
                m === 6 && m--;
                for (let C = 0; C < s; C++) {
                  const S = a ? s - 1 - C : C;
                  for (let v = 0; v < 2; v++)
                    o.get(m - v, S) ||
                      (x++,
                      (f <<= 1),
                      this.bitMatrix.get(m - v, S) && (f |= 1),
                      x === 8 && ((c[d++] = f), (x = 0), (f = 0)));
                }
                a = !a;
              }
              if (d !== t.getTotalCodewords()) throw new Q();
              return c;
            }
            remask() {
              if (this.parsedFormatInfo === null) return;
              const e = Wt.values[this.parsedFormatInfo.getDataMask()],
                t = this.bitMatrix.getHeight();
              e.unmaskBitMatrix(this.bitMatrix, t);
            }
            setMirror(e) {
              ((this.parsedVersion = null),
                (this.parsedFormatInfo = null),
                (this.isMirror = e));
            }
            mirror() {
              const e = this.bitMatrix;
              for (let t = 0, r = e.getWidth(); t < r; t++)
                for (let s = t + 1, o = e.getHeight(); s < o; s++)
                  e.get(t, s) !== e.get(s, t) && (e.flip(s, t), e.flip(t, s));
            }
          }
          class ji {
            constructor(e, t) {
              ((this.numDataCodewords = e), (this.codewords = t));
            }
            static getDataBlocks(e, t, r) {
              if (e.length !== t.getTotalCodewords()) throw new T();
              const s = t.getECBlocksForLevel(r);
              let o = 0;
              const a = s.getECBlocks();
              for (const v of a) o += v.getCount();
              const c = new Array(o);
              let d = 0;
              for (const v of a)
                for (let N = 0; N < v.getCount(); N++) {
                  const O = v.getDataCodewords(),
                    U = s.getECCodewordsPerBlock() + O;
                  c[d++] = new ji(O, new Uint8Array(U));
                }
              const f = c[0].codewords.length;
              let x = c.length - 1;
              for (; x >= 0 && c[x].codewords.length !== f;) x--;
              x++;
              const m = f - s.getECCodewordsPerBlock();
              let C = 0;
              for (let v = 0; v < m; v++)
                for (let N = 0; N < d; N++) c[N].codewords[v] = e[C++];
              for (let v = x; v < d; v++) c[v].codewords[m] = e[C++];
              const S = c[0].codewords.length;
              for (let v = m; v < S; v++)
                for (let N = 0; N < d; N++) {
                  const O = N < x ? v : v + 1;
                  c[N].codewords[O] = e[C++];
                }
              return c;
            }
            getNumDataCodewords() {
              return this.numDataCodewords;
            }
            getCodewords() {
              return this.codewords;
            }
          }
          var Ht;
          (function (A) {
            ((A[(A.TERMINATOR = 0)] = 'TERMINATOR'),
              (A[(A.NUMERIC = 1)] = 'NUMERIC'),
              (A[(A.ALPHANUMERIC = 2)] = 'ALPHANUMERIC'),
              (A[(A.STRUCTURED_APPEND = 3)] = 'STRUCTURED_APPEND'),
              (A[(A.BYTE = 4)] = 'BYTE'),
              (A[(A.ECI = 5)] = 'ECI'),
              (A[(A.KANJI = 6)] = 'KANJI'),
              (A[(A.FNC1_FIRST_POSITION = 7)] = 'FNC1_FIRST_POSITION'),
              (A[(A.FNC1_SECOND_POSITION = 8)] = 'FNC1_SECOND_POSITION'),
              (A[(A.HANZI = 9)] = 'HANZI'));
          })(Ht || (Ht = {}));
          class ge {
            constructor(e, t, r, s) {
              ((this.value = e),
                (this.stringValue = t),
                (this.characterCountBitsForVersions = r),
                (this.bits = s),
                ge.FOR_BITS.set(s, this),
                ge.FOR_VALUE.set(e, this));
            }
            static forBits(e) {
              const t = ge.FOR_BITS.get(e);
              if (t === void 0) throw new T();
              return t;
            }
            getCharacterCountBits(e) {
              const t = e.getVersionNumber();
              let r;
              return (
                t <= 9 ? (r = 0) : t <= 26 ? (r = 1) : (r = 2),
                this.characterCountBitsForVersions[r]
              );
            }
            getValue() {
              return this.value;
            }
            getBits() {
              return this.bits;
            }
            equals(e) {
              if (!(e instanceof ge)) return !1;
              const t = e;
              return this.value === t.value;
            }
            toString() {
              return this.stringValue;
            }
          }
          ((ge.FOR_BITS = new Map()),
            (ge.FOR_VALUE = new Map()),
            (ge.TERMINATOR = new ge(
              Ht.TERMINATOR,
              'TERMINATOR',
              Int32Array.from([0, 0, 0]),
              0,
            )),
            (ge.NUMERIC = new ge(
              Ht.NUMERIC,
              'NUMERIC',
              Int32Array.from([10, 12, 14]),
              1,
            )),
            (ge.ALPHANUMERIC = new ge(
              Ht.ALPHANUMERIC,
              'ALPHANUMERIC',
              Int32Array.from([9, 11, 13]),
              2,
            )),
            (ge.STRUCTURED_APPEND = new ge(
              Ht.STRUCTURED_APPEND,
              'STRUCTURED_APPEND',
              Int32Array.from([0, 0, 0]),
              3,
            )),
            (ge.BYTE = new ge(
              Ht.BYTE,
              'BYTE',
              Int32Array.from([8, 16, 16]),
              4,
            )),
            (ge.ECI = new ge(Ht.ECI, 'ECI', Int32Array.from([0, 0, 0]), 7)),
            (ge.KANJI = new ge(
              Ht.KANJI,
              'KANJI',
              Int32Array.from([8, 10, 12]),
              8,
            )),
            (ge.FNC1_FIRST_POSITION = new ge(
              Ht.FNC1_FIRST_POSITION,
              'FNC1_FIRST_POSITION',
              Int32Array.from([0, 0, 0]),
              5,
            )),
            (ge.FNC1_SECOND_POSITION = new ge(
              Ht.FNC1_SECOND_POSITION,
              'FNC1_SECOND_POSITION',
              Int32Array.from([0, 0, 0]),
              9,
            )),
            (ge.HANZI = new ge(
              Ht.HANZI,
              'HANZI',
              Int32Array.from([8, 10, 12]),
              13,
            )));
          class He {
            static decode(e, t, r, s) {
              const o = new Ui(e);
              let a = new $();
              const c = new Array();
              let d = -1,
                f = -1;
              try {
                let x = null,
                  m = !1,
                  C;
                do {
                  if (o.available() < 4) C = ge.TERMINATOR;
                  else {
                    const S = o.readBits(4);
                    C = ge.forBits(S);
                  }
                  switch (C) {
                    case ge.TERMINATOR:
                      break;
                    case ge.FNC1_FIRST_POSITION:
                    case ge.FNC1_SECOND_POSITION:
                      m = !0;
                      break;
                    case ge.STRUCTURED_APPEND:
                      if (o.available() < 16) throw new Q();
                      ((d = o.readBits(8)), (f = o.readBits(8)));
                      break;
                    case ge.ECI:
                      const S = He.parseECIValue(o);
                      if (((x = L.getCharacterSetECIByValue(S)), x === null))
                        throw new Q();
                      break;
                    case ge.HANZI:
                      const v = o.readBits(4),
                        N = o.readBits(C.getCharacterCountBits(t));
                      v === He.GB2312_SUBSET && He.decodeHanziSegment(o, a, N);
                      break;
                    default:
                      const O = o.readBits(C.getCharacterCountBits(t));
                      switch (C) {
                        case ge.NUMERIC:
                          He.decodeNumericSegment(o, a, O);
                          break;
                        case ge.ALPHANUMERIC:
                          He.decodeAlphanumericSegment(o, a, O, m);
                          break;
                        case ge.BYTE:
                          He.decodeByteSegment(o, a, O, x, c, s);
                          break;
                        case ge.KANJI:
                          He.decodeKanjiSegment(o, a, O);
                          break;
                        default:
                          throw new Q();
                      }
                      break;
                  }
                } while (C !== ge.TERMINATOR);
              } catch {
                throw new Q();
              }
              return new ze(
                e,
                a.toString(),
                c.length === 0 ? null : c,
                r === null ? null : r.toString(),
                d,
                f,
              );
            }
            static decodeHanziSegment(e, t, r) {
              if (r * 13 > e.available()) throw new Q();
              const s = new Uint8Array(2 * r);
              let o = 0;
              for (; r > 0;) {
                const a = e.readBits(13);
                let c = (((a / 96) << 8) & 4294967295) | (a % 96);
                (c < 959 ? (c += 41377) : (c += 42657),
                  (s[o] = (c >> 8) & 255),
                  (s[o + 1] = c & 255),
                  (o += 2),
                  r--);
              }
              try {
                t.append(xe.decode(s, se.GB2312));
              } catch (a) {
                throw new Q(a);
              }
            }
            static decodeKanjiSegment(e, t, r) {
              if (r * 13 > e.available()) throw new Q();
              const s = new Uint8Array(2 * r);
              let o = 0;
              for (; r > 0;) {
                const a = e.readBits(13);
                let c = (((a / 192) << 8) & 4294967295) | (a % 192);
                (c < 7936 ? (c += 33088) : (c += 49472),
                  (s[o] = c >> 8),
                  (s[o + 1] = c),
                  (o += 2),
                  r--);
              }
              try {
                t.append(xe.decode(s, se.SHIFT_JIS));
              } catch (a) {
                throw new Q(a);
              }
            }
            static decodeByteSegment(e, t, r, s, o, a) {
              if (8 * r > e.available()) throw new Q();
              const c = new Uint8Array(r);
              for (let f = 0; f < r; f++) c[f] = e.readBits(8);
              let d;
              s === null ? (d = se.guessEncoding(c, a)) : (d = s.getName());
              try {
                t.append(xe.decode(c, d));
              } catch (f) {
                throw new Q(f);
              }
              o.push(c);
            }
            static toAlphaNumericChar(e) {
              if (e >= He.ALPHANUMERIC_CHARS.length) throw new Q();
              return He.ALPHANUMERIC_CHARS[e];
            }
            static decodeAlphanumericSegment(e, t, r, s) {
              const o = t.length();
              for (; r > 1;) {
                if (e.available() < 11) throw new Q();
                const a = e.readBits(11);
                (t.append(He.toAlphaNumericChar(Math.floor(a / 45))),
                  t.append(He.toAlphaNumericChar(a % 45)),
                  (r -= 2));
              }
              if (r === 1) {
                if (e.available() < 6) throw new Q();
                t.append(He.toAlphaNumericChar(e.readBits(6)));
              }
              if (s)
                for (let a = o; a < t.length(); a++)
                  t.charAt(a) === '%' &&
                    (a < t.length() - 1 && t.charAt(a + 1) === '%'
                      ? t.deleteCharAt(a + 1)
                      : t.setCharAt(a, ''));
            }
            static decodeNumericSegment(e, t, r) {
              for (; r >= 3;) {
                if (e.available() < 10) throw new Q();
                const s = e.readBits(10);
                if (s >= 1e3) throw new Q();
                (t.append(He.toAlphaNumericChar(Math.floor(s / 100))),
                  t.append(He.toAlphaNumericChar(Math.floor(s / 10) % 10)),
                  t.append(He.toAlphaNumericChar(s % 10)),
                  (r -= 3));
              }
              if (r === 2) {
                if (e.available() < 7) throw new Q();
                const s = e.readBits(7);
                if (s >= 100) throw new Q();
                (t.append(He.toAlphaNumericChar(Math.floor(s / 10))),
                  t.append(He.toAlphaNumericChar(s % 10)));
              } else if (r === 1) {
                if (e.available() < 4) throw new Q();
                const s = e.readBits(4);
                if (s >= 10) throw new Q();
                t.append(He.toAlphaNumericChar(s));
              }
            }
            static parseECIValue(e) {
              const t = e.readBits(8);
              if ((t & 128) === 0) return t & 127;
              if ((t & 192) === 128) {
                const r = e.readBits(8);
                return (((t & 63) << 8) & 4294967295) | r;
              }
              if ((t & 224) === 192) {
                const r = e.readBits(16);
                return (((t & 31) << 16) & 4294967295) | r;
              }
              throw new Q();
            }
          }
          ((He.ALPHANUMERIC_CHARS =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'),
            (He.GB2312_SUBSET = 1));
          class oa {
            constructor(e) {
              this.mirrored = e;
            }
            isMirrored() {
              return this.mirrored;
            }
            applyMirroredCorrection(e) {
              if (!this.mirrored || e === null || e.length < 3) return;
              const t = e[0];
              ((e[0] = e[2]), (e[2] = t));
            }
          }
          class r1 {
            constructor() {
              this.rsDecoder = new as(Re.QR_CODE_FIELD_256);
            }
            decodeBooleanArray(e, t) {
              return this.decodeBitMatrix(we.parseFromBooleanArray(e), t);
            }
            decodeBitMatrix(e, t) {
              const r = new t1(e);
              let s = null;
              try {
                return this.decodeBitMatrixParser(r, t);
              } catch (o) {
                s = o;
              }
              try {
                (r.remask(),
                  r.setMirror(!0),
                  r.readVersion(),
                  r.readFormatInformation(),
                  r.mirror());
                const o = this.decodeBitMatrixParser(r, t);
                return (o.setOther(new oa(!0)), o);
              } catch (o) {
                throw s !== null ? s : o;
              }
            }
            decodeBitMatrixParser(e, t) {
              const r = e.readVersion(),
                s = e.readFormatInformation().getErrorCorrectionLevel(),
                o = e.readCodewords(),
                a = ji.getDataBlocks(o, r, s);
              let c = 0;
              for (const x of a) c += x.getNumDataCodewords();
              const d = new Uint8Array(c);
              let f = 0;
              for (const x of a) {
                const m = x.getCodewords(),
                  C = x.getNumDataCodewords();
                this.correctErrors(m, C);
                for (let S = 0; S < C; S++) d[f++] = m[S];
              }
              return He.decode(d, r, s, t);
            }
            correctErrors(e, t) {
              const r = new Int32Array(e);
              try {
                this.rsDecoder.decode(r, e.length - t);
              } catch {
                throw new D();
              }
              for (let s = 0; s < t; s++) e[s] = r[s];
            }
          }
          class zi extends de {
            constructor(e, t, r) {
              (super(e, t), (this.estimatedModuleSize = r));
            }
            aboutEquals(e, t, r) {
              if (
                Math.abs(t - this.getY()) <= e &&
                Math.abs(r - this.getX()) <= e
              ) {
                const s = Math.abs(e - this.estimatedModuleSize);
                return s <= 1 || s <= this.estimatedModuleSize;
              }
              return !1;
            }
            combineEstimate(e, t, r) {
              const s = (this.getX() + t) / 2,
                o = (this.getY() + e) / 2,
                a = (this.estimatedModuleSize + r) / 2;
              return new zi(s, o, a);
            }
          }
          class li {
            constructor(e, t, r, s, o, a, c) {
              ((this.image = e),
                (this.startX = t),
                (this.startY = r),
                (this.width = s),
                (this.height = o),
                (this.moduleSize = a),
                (this.resultPointCallback = c),
                (this.possibleCenters = []),
                (this.crossCheckStateCount = new Int32Array(3)));
            }
            find() {
              const e = this.startX,
                t = this.height,
                r = this.width,
                s = e + r,
                o = this.startY + t / 2,
                a = new Int32Array(3),
                c = this.image;
              for (let d = 0; d < t; d++) {
                const f =
                  o +
                  ((d & 1) === 0
                    ? Math.floor((d + 1) / 2)
                    : -Math.floor((d + 1) / 2));
                ((a[0] = 0), (a[1] = 0), (a[2] = 0));
                let x = e;
                for (; x < s && !c.get(x, f);) x++;
                let m = 0;
                for (; x < s;) {
                  if (c.get(x, f))
                    if (m === 1) a[1]++;
                    else if (m === 2) {
                      if (this.foundPatternCross(a)) {
                        const C = this.handlePossibleCenter(a, f, x);
                        if (C !== null) return C;
                      }
                      ((a[0] = a[2]), (a[1] = 1), (a[2] = 0), (m = 1));
                    } else a[++m]++;
                  else (m === 1 && m++, a[m]++);
                  x++;
                }
                if (this.foundPatternCross(a)) {
                  const C = this.handlePossibleCenter(a, f, s);
                  if (C !== null) return C;
                }
              }
              if (this.possibleCenters.length !== 0)
                return this.possibleCenters[0];
              throw new k();
            }
            static centerFromEnd(e, t) {
              return t - e[2] - e[1] / 2;
            }
            foundPatternCross(e) {
              const t = this.moduleSize,
                r = t / 2;
              for (let s = 0; s < 3; s++)
                if (Math.abs(t - e[s]) >= r) return !1;
              return !0;
            }
            crossCheckVertical(e, t, r, s) {
              const o = this.image,
                a = o.getHeight(),
                c = this.crossCheckStateCount;
              ((c[0] = 0), (c[1] = 0), (c[2] = 0));
              let d = e;
              for (; d >= 0 && o.get(t, d) && c[1] <= r;) (c[1]++, d--);
              if (d < 0 || c[1] > r) return NaN;
              for (; d >= 0 && !o.get(t, d) && c[0] <= r;) (c[0]++, d--);
              if (c[0] > r) return NaN;
              for (d = e + 1; d < a && o.get(t, d) && c[1] <= r;) (c[1]++, d++);
              if (d === a || c[1] > r) return NaN;
              for (; d < a && !o.get(t, d) && c[2] <= r;) (c[2]++, d++);
              if (c[2] > r) return NaN;
              const f = c[0] + c[1] + c[2];
              return 5 * Math.abs(f - s) >= 2 * s
                ? NaN
                : this.foundPatternCross(c)
                  ? li.centerFromEnd(c, d)
                  : NaN;
            }
            handlePossibleCenter(e, t, r) {
              const s = e[0] + e[1] + e[2],
                o = li.centerFromEnd(e, r),
                a = this.crossCheckVertical(t, o, 2 * e[1], s);
              if (!isNaN(a)) {
                const c = (e[0] + e[1] + e[2]) / 3;
                for (const f of this.possibleCenters)
                  if (f.aboutEquals(c, a, o)) return f.combineEstimate(a, o, c);
                const d = new zi(o, a, c);
                (this.possibleCenters.push(d),
                  this.resultPointCallback !== null &&
                    this.resultPointCallback !== void 0 &&
                    this.resultPointCallback.foundPossibleResultPoint(d));
              }
              return null;
            }
          }
          class Vi extends de {
            constructor(e, t, r, s) {
              (super(e, t),
                (this.estimatedModuleSize = r),
                (this.count = s),
                s === void 0 && (this.count = 1));
            }
            getEstimatedModuleSize() {
              return this.estimatedModuleSize;
            }
            getCount() {
              return this.count;
            }
            aboutEquals(e, t, r) {
              if (
                Math.abs(t - this.getY()) <= e &&
                Math.abs(r - this.getX()) <= e
              ) {
                const s = Math.abs(e - this.estimatedModuleSize);
                return s <= 1 || s <= this.estimatedModuleSize;
              }
              return !1;
            }
            combineEstimate(e, t, r) {
              const s = this.count + 1,
                o = (this.count * this.getX() + t) / s,
                a = (this.count * this.getY() + e) / s,
                c = (this.count * this.estimatedModuleSize + r) / s;
              return new Vi(o, a, c, s);
            }
          }
          class n1 {
            constructor(e) {
              ((this.bottomLeft = e[0]),
                (this.topLeft = e[1]),
                (this.topRight = e[2]));
            }
            getBottomLeft() {
              return this.bottomLeft;
            }
            getTopLeft() {
              return this.topLeft;
            }
            getTopRight() {
              return this.topRight;
            }
          }
          class ht {
            constructor(e, t) {
              ((this.image = e),
                (this.resultPointCallback = t),
                (this.possibleCenters = []),
                (this.crossCheckStateCount = new Int32Array(5)),
                (this.resultPointCallback = t));
            }
            getImage() {
              return this.image;
            }
            getPossibleCenters() {
              return this.possibleCenters;
            }
            find(e) {
              const t = e != null && e.get(re.TRY_HARDER) !== void 0,
                r = e != null && e.get(re.PURE_BARCODE) !== void 0,
                s = this.image,
                o = s.getHeight(),
                a = s.getWidth();
              let c = Math.floor((3 * o) / (4 * ht.MAX_MODULES));
              (c < ht.MIN_SKIP || t) && (c = ht.MIN_SKIP);
              let d = !1;
              const f = new Int32Array(5);
              for (let m = c - 1; m < o && !d; m += c) {
                ((f[0] = 0), (f[1] = 0), (f[2] = 0), (f[3] = 0), (f[4] = 0));
                let C = 0;
                for (let S = 0; S < a; S++)
                  if (s.get(S, m)) ((C & 1) === 1 && C++, f[C]++);
                  else if ((C & 1) === 0)
                    if (C === 4)
                      if (ht.foundPatternCross(f)) {
                        if (this.handlePossibleCenter(f, m, S, r) === !0)
                          if (((c = 2), this.hasSkipped === !0))
                            d = this.haveMultiplyConfirmedCenters();
                          else {
                            const N = this.findRowSkip();
                            N > f[2] && ((m += N - f[2] - c), (S = a - 1));
                          }
                        else {
                          ((f[0] = f[2]),
                            (f[1] = f[3]),
                            (f[2] = f[4]),
                            (f[3] = 1),
                            (f[4] = 0),
                            (C = 3));
                          continue;
                        }
                        ((C = 0),
                          (f[0] = 0),
                          (f[1] = 0),
                          (f[2] = 0),
                          (f[3] = 0),
                          (f[4] = 0));
                      } else
                        ((f[0] = f[2]),
                          (f[1] = f[3]),
                          (f[2] = f[4]),
                          (f[3] = 1),
                          (f[4] = 0),
                          (C = 3));
                    else f[++C]++;
                  else f[C]++;
                ht.foundPatternCross(f) &&
                  this.handlePossibleCenter(f, m, a, r) === !0 &&
                  ((c = f[0]),
                  this.hasSkipped && (d = this.haveMultiplyConfirmedCenters()));
              }
              const x = this.selectBestPatterns();
              return (de.orderBestPatterns(x), new n1(x));
            }
            static centerFromEnd(e, t) {
              return t - e[4] - e[3] - e[2] / 2;
            }
            static foundPatternCross(e) {
              let t = 0;
              for (let o = 0; o < 5; o++) {
                const a = e[o];
                if (a === 0) return !1;
                t += a;
              }
              if (t < 7) return !1;
              const r = t / 7,
                s = r / 2;
              return (
                Math.abs(r - e[0]) < s &&
                Math.abs(r - e[1]) < s &&
                Math.abs(3 * r - e[2]) < 3 * s &&
                Math.abs(r - e[3]) < s &&
                Math.abs(r - e[4]) < s
              );
            }
            getCrossCheckStateCount() {
              const e = this.crossCheckStateCount;
              return (
                (e[0] = 0),
                (e[1] = 0),
                (e[2] = 0),
                (e[3] = 0),
                (e[4] = 0),
                e
              );
            }
            crossCheckDiagonal(e, t, r, s) {
              const o = this.getCrossCheckStateCount();
              let a = 0;
              const c = this.image;
              for (; e >= a && t >= a && c.get(t - a, e - a);) (o[2]++, a++);
              if (e < a || t < a) return !1;
              for (; e >= a && t >= a && !c.get(t - a, e - a) && o[1] <= r;)
                (o[1]++, a++);
              if (e < a || t < a || o[1] > r) return !1;
              for (; e >= a && t >= a && c.get(t - a, e - a) && o[0] <= r;)
                (o[0]++, a++);
              if (o[0] > r) return !1;
              const d = c.getHeight(),
                f = c.getWidth();
              for (a = 1; e + a < d && t + a < f && c.get(t + a, e + a);)
                (o[2]++, a++);
              if (e + a >= d || t + a >= f) return !1;
              for (
                ;
                e + a < d && t + a < f && !c.get(t + a, e + a) && o[3] < r;
              )
                (o[3]++, a++);
              if (e + a >= d || t + a >= f || o[3] >= r) return !1;
              for (; e + a < d && t + a < f && c.get(t + a, e + a) && o[4] < r;)
                (o[4]++, a++);
              if (o[4] >= r) return !1;
              const x = o[0] + o[1] + o[2] + o[3] + o[4];
              return Math.abs(x - s) < 2 * s && ht.foundPatternCross(o);
            }
            crossCheckVertical(e, t, r, s) {
              const o = this.image,
                a = o.getHeight(),
                c = this.getCrossCheckStateCount();
              let d = e;
              for (; d >= 0 && o.get(t, d);) (c[2]++, d--);
              if (d < 0) return NaN;
              for (; d >= 0 && !o.get(t, d) && c[1] <= r;) (c[1]++, d--);
              if (d < 0 || c[1] > r) return NaN;
              for (; d >= 0 && o.get(t, d) && c[0] <= r;) (c[0]++, d--);
              if (c[0] > r) return NaN;
              for (d = e + 1; d < a && o.get(t, d);) (c[2]++, d++);
              if (d === a) return NaN;
              for (; d < a && !o.get(t, d) && c[3] < r;) (c[3]++, d++);
              if (d === a || c[3] >= r) return NaN;
              for (; d < a && o.get(t, d) && c[4] < r;) (c[4]++, d++);
              if (c[4] >= r) return NaN;
              const f = c[0] + c[1] + c[2] + c[3] + c[4];
              return 5 * Math.abs(f - s) >= 2 * s
                ? NaN
                : ht.foundPatternCross(c)
                  ? ht.centerFromEnd(c, d)
                  : NaN;
            }
            crossCheckHorizontal(e, t, r, s) {
              const o = this.image,
                a = o.getWidth(),
                c = this.getCrossCheckStateCount();
              let d = e;
              for (; d >= 0 && o.get(d, t);) (c[2]++, d--);
              if (d < 0) return NaN;
              for (; d >= 0 && !o.get(d, t) && c[1] <= r;) (c[1]++, d--);
              if (d < 0 || c[1] > r) return NaN;
              for (; d >= 0 && o.get(d, t) && c[0] <= r;) (c[0]++, d--);
              if (c[0] > r) return NaN;
              for (d = e + 1; d < a && o.get(d, t);) (c[2]++, d++);
              if (d === a) return NaN;
              for (; d < a && !o.get(d, t) && c[3] < r;) (c[3]++, d++);
              if (d === a || c[3] >= r) return NaN;
              for (; d < a && o.get(d, t) && c[4] < r;) (c[4]++, d++);
              if (c[4] >= r) return NaN;
              const f = c[0] + c[1] + c[2] + c[3] + c[4];
              return 5 * Math.abs(f - s) >= s
                ? NaN
                : ht.foundPatternCross(c)
                  ? ht.centerFromEnd(c, d)
                  : NaN;
            }
            handlePossibleCenter(e, t, r, s) {
              const o = e[0] + e[1] + e[2] + e[3] + e[4];
              let a = ht.centerFromEnd(e, r),
                c = this.crossCheckVertical(t, Math.floor(a), e[2], o);
              if (
                !isNaN(c) &&
                ((a = this.crossCheckHorizontal(
                  Math.floor(a),
                  Math.floor(c),
                  e[2],
                  o,
                )),
                !isNaN(a) &&
                  (!s ||
                    this.crossCheckDiagonal(
                      Math.floor(c),
                      Math.floor(a),
                      e[2],
                      o,
                    )))
              ) {
                const d = o / 7;
                let f = !1;
                const x = this.possibleCenters;
                for (let m = 0, C = x.length; m < C; m++) {
                  const S = x[m];
                  if (S.aboutEquals(d, c, a)) {
                    ((x[m] = S.combineEstimate(c, a, d)), (f = !0));
                    break;
                  }
                }
                if (!f) {
                  const m = new Vi(a, c, d);
                  (x.push(m),
                    this.resultPointCallback !== null &&
                      this.resultPointCallback !== void 0 &&
                      this.resultPointCallback.foundPossibleResultPoint(m));
                }
                return !0;
              }
              return !1;
            }
            findRowSkip() {
              if (this.possibleCenters.length <= 1) return 0;
              let t = null;
              for (const r of this.possibleCenters)
                if (r.getCount() >= ht.CENTER_QUORUM)
                  if (t == null) t = r;
                  else
                    return (
                      (this.hasSkipped = !0),
                      Math.floor(
                        (Math.abs(t.getX() - r.getX()) -
                          Math.abs(t.getY() - r.getY())) /
                          2,
                      )
                    );
              return 0;
            }
            haveMultiplyConfirmedCenters() {
              let e = 0,
                t = 0;
              const r = this.possibleCenters.length;
              for (const a of this.possibleCenters)
                a.getCount() >= ht.CENTER_QUORUM &&
                  (e++, (t += a.getEstimatedModuleSize()));
              if (e < 3) return !1;
              const s = t / r;
              let o = 0;
              for (const a of this.possibleCenters)
                o += Math.abs(a.getEstimatedModuleSize() - s);
              return o <= 0.05 * t;
            }
            selectBestPatterns() {
              const e = this.possibleCenters.length;
              if (e < 3) throw new k();
              const t = this.possibleCenters;
              let r;
              if (e > 3) {
                let s = 0,
                  o = 0;
                for (const d of this.possibleCenters) {
                  const f = d.getEstimatedModuleSize();
                  ((s += f), (o += f * f));
                }
                r = s / e;
                let a = Math.sqrt(o / e - r * r);
                t.sort((d, f) => {
                  const x = Math.abs(f.getEstimatedModuleSize() - r),
                    m = Math.abs(d.getEstimatedModuleSize() - r);
                  return x < m ? -1 : x > m ? 1 : 0;
                });
                const c = Math.max(0.2 * r, a);
                for (let d = 0; d < t.length && t.length > 3; d++) {
                  const f = t[d];
                  Math.abs(f.getEstimatedModuleSize() - r) > c &&
                    (t.splice(d, 1), d--);
                }
              }
              if (t.length > 3) {
                let s = 0;
                for (const o of t) s += o.getEstimatedModuleSize();
                ((r = s / t.length),
                  t.sort((o, a) => {
                    if (a.getCount() === o.getCount()) {
                      const c = Math.abs(a.getEstimatedModuleSize() - r),
                        d = Math.abs(o.getEstimatedModuleSize() - r);
                      return c < d ? 1 : c > d ? -1 : 0;
                    } else return a.getCount() - o.getCount();
                  }),
                  t.splice(3));
              }
              return [t[0], t[1], t[2]];
            }
          }
          ((ht.CENTER_QUORUM = 2), (ht.MIN_SKIP = 3), (ht.MAX_MODULES = 57));
          class cs {
            constructor(e) {
              this.image = e;
            }
            getImage() {
              return this.image;
            }
            getResultPointCallback() {
              return this.resultPointCallback;
            }
            detect(e) {
              this.resultPointCallback =
                e == null ? null : e.get(re.NEED_RESULT_POINT_CALLBACK);
              const r = new ht(this.image, this.resultPointCallback).find(e);
              return this.processFinderPatternInfo(r);
            }
            processFinderPatternInfo(e) {
              const t = e.getTopLeft(),
                r = e.getTopRight(),
                s = e.getBottomLeft(),
                o = this.calculateModuleSize(t, r, s);
              if (o < 1) throw new k('No pattern found in proccess finder.');
              const a = cs.computeDimension(t, r, s, o),
                c = he.getProvisionalVersionForDimension(a),
                d = c.getDimensionForVersion() - 7;
              let f = null;
              if (c.getAlignmentPatternCenters().length > 0) {
                const S = r.getX() - t.getX() + s.getX(),
                  v = r.getY() - t.getY() + s.getY(),
                  N = 1 - 3 / d,
                  O = Math.floor(t.getX() + N * (S - t.getX())),
                  U = Math.floor(t.getY() + N * (v - t.getY()));
                for (let q = 4; q <= 16; q <<= 1)
                  try {
                    f = this.findAlignmentInRegion(o, O, U, q);
                    break;
                  } catch (Z) {
                    if (!(Z instanceof k)) throw Z;
                  }
              }
              const x = cs.createTransform(t, r, s, f, a),
                m = cs.sampleGrid(this.image, x, a);
              let C;
              return (
                f === null ? (C = [s, t, r]) : (C = [s, t, r, f]),
                new ni(m, C)
              );
            }
            static createTransform(e, t, r, s, o) {
              const a = o - 3.5;
              let c, d, f, x;
              return (
                s !== null
                  ? ((c = s.getX()), (d = s.getY()), (f = a - 3), (x = f))
                  : ((c = t.getX() - e.getX() + r.getX()),
                    (d = t.getY() - e.getY() + r.getY()),
                    (f = a),
                    (x = a)),
                Jt.quadrilateralToQuadrilateral(
                  3.5,
                  3.5,
                  a,
                  3.5,
                  f,
                  x,
                  3.5,
                  a,
                  e.getX(),
                  e.getY(),
                  t.getX(),
                  t.getY(),
                  c,
                  d,
                  r.getX(),
                  r.getY(),
                )
              );
            }
            static sampleGrid(e, t, r) {
              return Dr.getInstance().sampleGridWithTransform(e, r, r, t);
            }
            static computeDimension(e, t, r, s) {
              const o = Ne.round(de.distance(e, t) / s),
                a = Ne.round(de.distance(e, r) / s);
              let c = Math.floor((o + a) / 2) + 7;
              switch (c & 3) {
                case 0:
                  c++;
                  break;
                case 2:
                  c--;
                  break;
                case 3:
                  throw new k('Dimensions could be not found.');
              }
              return c;
            }
            calculateModuleSize(e, t, r) {
              return (
                (this.calculateModuleSizeOneWay(e, t) +
                  this.calculateModuleSizeOneWay(e, r)) /
                2
              );
            }
            calculateModuleSizeOneWay(e, t) {
              const r = this.sizeOfBlackWhiteBlackRunBothWays(
                  Math.floor(e.getX()),
                  Math.floor(e.getY()),
                  Math.floor(t.getX()),
                  Math.floor(t.getY()),
                ),
                s = this.sizeOfBlackWhiteBlackRunBothWays(
                  Math.floor(t.getX()),
                  Math.floor(t.getY()),
                  Math.floor(e.getX()),
                  Math.floor(e.getY()),
                );
              return isNaN(r) ? s / 7 : isNaN(s) ? r / 7 : (r + s) / 14;
            }
            sizeOfBlackWhiteBlackRunBothWays(e, t, r, s) {
              let o = this.sizeOfBlackWhiteBlackRun(e, t, r, s),
                a = 1,
                c = e - (r - e);
              c < 0
                ? ((a = e / (e - c)), (c = 0))
                : c >= this.image.getWidth() &&
                  ((a = (this.image.getWidth() - 1 - e) / (c - e)),
                  (c = this.image.getWidth() - 1));
              let d = Math.floor(t - (s - t) * a);
              return (
                (a = 1),
                d < 0
                  ? ((a = t / (t - d)), (d = 0))
                  : d >= this.image.getHeight() &&
                    ((a = (this.image.getHeight() - 1 - t) / (d - t)),
                    (d = this.image.getHeight() - 1)),
                (c = Math.floor(e + (c - e) * a)),
                (o += this.sizeOfBlackWhiteBlackRun(e, t, c, d)),
                o - 1
              );
            }
            sizeOfBlackWhiteBlackRun(e, t, r, s) {
              const o = Math.abs(s - t) > Math.abs(r - e);
              if (o) {
                let S = e;
                ((e = t), (t = S), (S = r), (r = s), (s = S));
              }
              const a = Math.abs(r - e),
                c = Math.abs(s - t);
              let d = -a / 2;
              const f = e < r ? 1 : -1,
                x = t < s ? 1 : -1;
              let m = 0;
              const C = r + f;
              for (let S = e, v = t; S !== C; S += f) {
                const N = o ? v : S,
                  O = o ? S : v;
                if ((m === 1) === this.image.get(N, O)) {
                  if (m === 2) return Ne.distance(S, v, e, t);
                  m++;
                }
                if (((d += c), d > 0)) {
                  if (v === s) break;
                  ((v += x), (d -= a));
                }
              }
              return m === 2 ? Ne.distance(r + f, s, e, t) : NaN;
            }
            findAlignmentInRegion(e, t, r, s) {
              const o = Math.floor(s * e),
                a = Math.max(0, t - o),
                c = Math.min(this.image.getWidth() - 1, t + o);
              if (c - a < e * 3)
                throw new k('Alignment top exceeds estimated module size.');
              const d = Math.max(0, r - o),
                f = Math.min(this.image.getHeight() - 1, r + o);
              if (f - d < e * 3)
                throw new k('Alignment bottom exceeds estimated module size.');
              return new li(
                this.image,
                a,
                d,
                c - a,
                f - d,
                e,
                this.resultPointCallback,
              ).find();
            }
          }
          class _r {
            constructor() {
              this.decoder = new r1();
            }
            getDecoder() {
              return this.decoder;
            }
            decode(e, t) {
              let r, s;
              if (t != null && t.get(re.PURE_BARCODE) !== void 0) {
                const d = _r.extractPureBits(e.getBlackMatrix());
                ((r = this.decoder.decodeBitMatrix(d, t)), (s = _r.NO_POINTS));
              } else {
                const d = new cs(e.getBlackMatrix()).detect(t);
                ((r = this.decoder.decodeBitMatrix(d.getBits(), t)),
                  (s = d.getPoints()));
              }
              r.getOther() instanceof oa &&
                r.getOther().applyMirroredCorrection(s);
              const o = new st(
                  r.getText(),
                  r.getRawBytes(),
                  void 0,
                  s,
                  oe.QR_CODE,
                  void 0,
                ),
                a = r.getByteSegments();
              a !== null && o.putMetadata(Ze.BYTE_SEGMENTS, a);
              const c = r.getECLevel();
              return (
                c !== null && o.putMetadata(Ze.ERROR_CORRECTION_LEVEL, c),
                r.hasStructuredAppend() &&
                  (o.putMetadata(
                    Ze.STRUCTURED_APPEND_SEQUENCE,
                    r.getStructuredAppendSequenceNumber(),
                  ),
                  o.putMetadata(
                    Ze.STRUCTURED_APPEND_PARITY,
                    r.getStructuredAppendParity(),
                  )),
                o
              );
            }
            reset() {}
            static extractPureBits(e) {
              const t = e.getTopLeftOnBit(),
                r = e.getBottomRightOnBit();
              if (t === null || r === null) throw new k();
              const s = this.moduleSize(t, e);
              let o = t[1],
                a = r[1],
                c = t[0],
                d = r[0];
              if (c >= d || o >= a) throw new k();
              if (a - o !== d - c && ((d = c + (a - o)), d >= e.getWidth()))
                throw new k();
              const f = Math.round((d - c + 1) / s),
                x = Math.round((a - o + 1) / s);
              if (f <= 0 || x <= 0) throw new k();
              if (x !== f) throw new k();
              const m = Math.floor(s / 2);
              ((o += m), (c += m));
              const C = c + Math.floor((f - 1) * s) - d;
              if (C > 0) {
                if (C > m) throw new k();
                c -= C;
              }
              const S = o + Math.floor((x - 1) * s) - a;
              if (S > 0) {
                if (S > m) throw new k();
                o -= S;
              }
              const v = new we(f, x);
              for (let N = 0; N < x; N++) {
                const O = o + Math.floor(N * s);
                for (let U = 0; U < f; U++)
                  e.get(c + Math.floor(U * s), O) && v.set(U, N);
              }
              return v;
            }
            static moduleSize(e, t) {
              const r = t.getHeight(),
                s = t.getWidth();
              let o = e[0],
                a = e[1],
                c = !0,
                d = 0;
              for (; o < s && a < r;) {
                if (c !== t.get(o, a)) {
                  if (++d === 5) break;
                  c = !c;
                }
                (o++, a++);
              }
              if (o === s || a === r) throw new k();
              return (o - e[0]) / 7;
            }
          }
          _r.NO_POINTS = new Array();
          class me {
            PDF417Common() {}
            static getBitCountSum(e) {
              return Ne.sum(e);
            }
            static toIntArray(e) {
              if (e == null || !e.length) return me.EMPTY_INT_ARRAY;
              const t = new Int32Array(e.length);
              let r = 0;
              for (const s of e) t[r++] = s;
              return t;
            }
            static getCodeword(e) {
              const t = J.binarySearch(me.SYMBOL_TABLE, e & 262143);
              return t < 0
                ? -1
                : (me.CODEWORD_TABLE[t] - 1) % me.NUMBER_OF_CODEWORDS;
            }
          }
          ((me.NUMBER_OF_CODEWORDS = 929),
            (me.MAX_CODEWORDS_IN_BARCODE = me.NUMBER_OF_CODEWORDS - 1),
            (me.MIN_ROWS_IN_BARCODE = 3),
            (me.MAX_ROWS_IN_BARCODE = 90),
            (me.MODULES_IN_CODEWORD = 17),
            (me.MODULES_IN_STOP_PATTERN = 18),
            (me.BARS_IN_MODULE = 8),
            (me.EMPTY_INT_ARRAY = new Int32Array([])),
            (me.SYMBOL_TABLE = Int32Array.from([
              66142, 66170, 66206, 66236, 66290, 66292, 66350, 66382, 66396,
              66454, 66470, 66476, 66594, 66600, 66614, 66626, 66628, 66632,
              66640, 66654, 66662, 66668, 66682, 66690, 66718, 66720, 66748,
              66758, 66776, 66798, 66802, 66804, 66820, 66824, 66832, 66846,
              66848, 66876, 66880, 66936, 66950, 66956, 66968, 66992, 67006,
              67022, 67036, 67042, 67044, 67048, 67062, 67118, 67150, 67164,
              67214, 67228, 67256, 67294, 67322, 67350, 67366, 67372, 67398,
              67404, 67416, 67438, 67474, 67476, 67490, 67492, 67496, 67510,
              67618, 67624, 67650, 67656, 67664, 67678, 67686, 67692, 67706,
              67714, 67716, 67728, 67742, 67744, 67772, 67782, 67788, 67800,
              67822, 67826, 67828, 67842, 67848, 67870, 67872, 67900, 67904,
              67960, 67974, 67992, 68016, 68030, 68046, 68060, 68066, 68068,
              68072, 68086, 68104, 68112, 68126, 68128, 68156, 68160, 68216,
              68336, 68358, 68364, 68376, 68400, 68414, 68448, 68476, 68494,
              68508, 68536, 68546, 68548, 68552, 68560, 68574, 68582, 68588,
              68654, 68686, 68700, 68706, 68708, 68712, 68726, 68750, 68764,
              68792, 68802, 68804, 68808, 68816, 68830, 68838, 68844, 68858,
              68878, 68892, 68920, 68976, 68990, 68994, 68996, 69e3, 69008,
              69022, 69024, 69052, 69062, 69068, 69080, 69102, 69106, 69108,
              69142, 69158, 69164, 69190, 69208, 69230, 69254, 69260, 69272,
              69296, 69310, 69326, 69340, 69386, 69394, 69396, 69410, 69416,
              69430, 69442, 69444, 69448, 69456, 69470, 69478, 69484, 69554,
              69556, 69666, 69672, 69698, 69704, 69712, 69726, 69754, 69762,
              69764, 69776, 69790, 69792, 69820, 69830, 69836, 69848, 69870,
              69874, 69876, 69890, 69918, 69920, 69948, 69952, 70008, 70022,
              70040, 70064, 70078, 70094, 70108, 70114, 70116, 70120, 70134,
              70152, 70174, 70176, 70264, 70384, 70412, 70448, 70462, 70496,
              70524, 70542, 70556, 70584, 70594, 70600, 70608, 70622, 70630,
              70636, 70664, 70672, 70686, 70688, 70716, 70720, 70776, 70896,
              71136, 71180, 71192, 71216, 71230, 71264, 71292, 71360, 71416,
              71452, 71480, 71536, 71550, 71554, 71556, 71560, 71568, 71582,
              71584, 71612, 71622, 71628, 71640, 71662, 71726, 71732, 71758,
              71772, 71778, 71780, 71784, 71798, 71822, 71836, 71864, 71874,
              71880, 71888, 71902, 71910, 71916, 71930, 71950, 71964, 71992,
              72048, 72062, 72066, 72068, 72080, 72094, 72096, 72124, 72134,
              72140, 72152, 72174, 72178, 72180, 72206, 72220, 72248, 72304,
              72318, 72416, 72444, 72456, 72464, 72478, 72480, 72508, 72512,
              72568, 72588, 72600, 72624, 72638, 72654, 72668, 72674, 72676,
              72680, 72694, 72726, 72742, 72748, 72774, 72780, 72792, 72814,
              72838, 72856, 72880, 72894, 72910, 72924, 72930, 72932, 72936,
              72950, 72966, 72972, 72984, 73008, 73022, 73056, 73084, 73102,
              73116, 73144, 73156, 73160, 73168, 73182, 73190, 73196, 73210,
              73226, 73234, 73236, 73250, 73252, 73256, 73270, 73282, 73284,
              73296, 73310, 73318, 73324, 73346, 73348, 73352, 73360, 73374,
              73376, 73404, 73414, 73420, 73432, 73454, 73498, 73518, 73522,
              73524, 73550, 73564, 73570, 73572, 73576, 73590, 73800, 73822,
              73858, 73860, 73872, 73886, 73888, 73916, 73944, 73970, 73972,
              73992, 74014, 74016, 74044, 74048, 74104, 74118, 74136, 74160,
              74174, 74210, 74212, 74216, 74230, 74244, 74256, 74270, 74272,
              74360, 74480, 74502, 74508, 74544, 74558, 74592, 74620, 74638,
              74652, 74680, 74690, 74696, 74704, 74726, 74732, 74782, 74784,
              74812, 74992, 75232, 75288, 75326, 75360, 75388, 75456, 75512,
              75576, 75632, 75646, 75650, 75652, 75664, 75678, 75680, 75708,
              75718, 75724, 75736, 75758, 75808, 75836, 75840, 75896, 76016,
              76256, 76736, 76824, 76848, 76862, 76896, 76924, 76992, 77048,
              77296, 77340, 77368, 77424, 77438, 77536, 77564, 77572, 77576,
              77584, 77600, 77628, 77632, 77688, 77702, 77708, 77720, 77744,
              77758, 77774, 77788, 77870, 77902, 77916, 77922, 77928, 77966,
              77980, 78008, 78018, 78024, 78032, 78046, 78060, 78074, 78094,
              78136, 78192, 78206, 78210, 78212, 78224, 78238, 78240, 78268,
              78278, 78284, 78296, 78322, 78324, 78350, 78364, 78448, 78462,
              78560, 78588, 78600, 78622, 78624, 78652, 78656, 78712, 78726,
              78744, 78768, 78782, 78798, 78812, 78818, 78820, 78824, 78838,
              78862, 78876, 78904, 78960, 78974, 79072, 79100, 79296, 79352,
              79368, 79376, 79390, 79392, 79420, 79424, 79480, 79600, 79628,
              79640, 79664, 79678, 79712, 79740, 79772, 79800, 79810, 79812,
              79816, 79824, 79838, 79846, 79852, 79894, 79910, 79916, 79942,
              79948, 79960, 79982, 79988, 80006, 80024, 80048, 80062, 80078,
              80092, 80098, 80100, 80104, 80134, 80140, 80176, 80190, 80224,
              80252, 80270, 80284, 80312, 80328, 80336, 80350, 80358, 80364,
              80378, 80390, 80396, 80408, 80432, 80446, 80480, 80508, 80576,
              80632, 80654, 80668, 80696, 80752, 80766, 80776, 80784, 80798,
              80800, 80828, 80844, 80856, 80878, 80882, 80884, 80914, 80916,
              80930, 80932, 80936, 80950, 80962, 80968, 80976, 80990, 80998,
              81004, 81026, 81028, 81040, 81054, 81056, 81084, 81094, 81100,
              81112, 81134, 81154, 81156, 81160, 81168, 81182, 81184, 81212,
              81216, 81272, 81286, 81292, 81304, 81328, 81342, 81358, 81372,
              81380, 81384, 81398, 81434, 81454, 81458, 81460, 81486, 81500,
              81506, 81508, 81512, 81526, 81550, 81564, 81592, 81602, 81604,
              81608, 81616, 81630, 81638, 81644, 81702, 81708, 81722, 81734,
              81740, 81752, 81774, 81778, 81780, 82050, 82078, 82080, 82108,
              82180, 82184, 82192, 82206, 82208, 82236, 82240, 82296, 82316,
              82328, 82352, 82366, 82402, 82404, 82408, 82440, 82448, 82462,
              82464, 82492, 82496, 82552, 82672, 82694, 82700, 82712, 82736,
              82750, 82784, 82812, 82830, 82882, 82884, 82888, 82896, 82918,
              82924, 82952, 82960, 82974, 82976, 83004, 83008, 83064, 83184,
              83424, 83468, 83480, 83504, 83518, 83552, 83580, 83648, 83704,
              83740, 83768, 83824, 83838, 83842, 83844, 83848, 83856, 83872,
              83900, 83910, 83916, 83928, 83950, 83984, 84e3, 84028, 84032,
              84088, 84208, 84448, 84928, 85040, 85054, 85088, 85116, 85184,
              85240, 85488, 85560, 85616, 85630, 85728, 85756, 85764, 85768,
              85776, 85790, 85792, 85820, 85824, 85880, 85894, 85900, 85912,
              85936, 85966, 85980, 86048, 86080, 86136, 86256, 86496, 86976,
              88160, 88188, 88256, 88312, 88560, 89056, 89200, 89214, 89312,
              89340, 89536, 89592, 89608, 89616, 89632, 89664, 89720, 89840,
              89868, 89880, 89904, 89952, 89980, 89998, 90012, 90040, 90190,
              90204, 90254, 90268, 90296, 90306, 90308, 90312, 90334, 90382,
              90396, 90424, 90480, 90494, 90500, 90504, 90512, 90526, 90528,
              90556, 90566, 90572, 90584, 90610, 90612, 90638, 90652, 90680,
              90736, 90750, 90848, 90876, 90884, 90888, 90896, 90910, 90912,
              90940, 90944, 91e3, 91014, 91020, 91032, 91056, 91070, 91086,
              91100, 91106, 91108, 91112, 91126, 91150, 91164, 91192, 91248,
              91262, 91360, 91388, 91584, 91640, 91664, 91678, 91680, 91708,
              91712, 91768, 91888, 91928, 91952, 91966, 92e3, 92028, 92046,
              92060, 92088, 92098, 92100, 92104, 92112, 92126, 92134, 92140,
              92188, 92216, 92272, 92384, 92412, 92608, 92664, 93168, 93200,
              93214, 93216, 93244, 93248, 93304, 93424, 93664, 93720, 93744,
              93758, 93792, 93820, 93888, 93944, 93980, 94008, 94064, 94078,
              94084, 94088, 94096, 94110, 94112, 94140, 94150, 94156, 94168,
              94246, 94252, 94278, 94284, 94296, 94318, 94342, 94348, 94360,
              94384, 94398, 94414, 94428, 94440, 94470, 94476, 94488, 94512,
              94526, 94560, 94588, 94606, 94620, 94648, 94658, 94660, 94664,
              94672, 94686, 94694, 94700, 94714, 94726, 94732, 94744, 94768,
              94782, 94816, 94844, 94912, 94968, 94990, 95004, 95032, 95088,
              95102, 95112, 95120, 95134, 95136, 95164, 95180, 95192, 95214,
              95218, 95220, 95244, 95256, 95280, 95294, 95328, 95356, 95424,
              95480, 95728, 95758, 95772, 95800, 95856, 95870, 95968, 95996,
              96008, 96016, 96030, 96032, 96060, 96064, 96120, 96152, 96176,
              96190, 96220, 96226, 96228, 96232, 96290, 96292, 96296, 96310,
              96322, 96324, 96328, 96336, 96350, 96358, 96364, 96386, 96388,
              96392, 96400, 96414, 96416, 96444, 96454, 96460, 96472, 96494,
              96498, 96500, 96514, 96516, 96520, 96528, 96542, 96544, 96572,
              96576, 96632, 96646, 96652, 96664, 96688, 96702, 96718, 96732,
              96738, 96740, 96744, 96758, 96772, 96776, 96784, 96798, 96800,
              96828, 96832, 96888, 97008, 97030, 97036, 97048, 97072, 97086,
              97120, 97148, 97166, 97180, 97208, 97220, 97224, 97232, 97246,
              97254, 97260, 97326, 97330, 97332, 97358, 97372, 97378, 97380,
              97384, 97398, 97422, 97436, 97464, 97474, 97476, 97480, 97488,
              97502, 97510, 97516, 97550, 97564, 97592, 97648, 97666, 97668,
              97672, 97680, 97694, 97696, 97724, 97734, 97740, 97752, 97774,
              97830, 97836, 97850, 97862, 97868, 97880, 97902, 97906, 97908,
              97926, 97932, 97944, 97968, 97998, 98012, 98018, 98020, 98024,
              98038, 98618, 98674, 98676, 98838, 98854, 98874, 98892, 98904,
              98926, 98930, 98932, 98968, 99006, 99042, 99044, 99048, 99062,
              99166, 99194, 99246, 99286, 99350, 99366, 99372, 99386, 99398,
              99416, 99438, 99442, 99444, 99462, 99504, 99518, 99534, 99548,
              99554, 99556, 99560, 99574, 99590, 99596, 99608, 99632, 99646,
              99680, 99708, 99726, 99740, 99768, 99778, 99780, 99784, 99792,
              99806, 99814, 99820, 99834, 99858, 99860, 99874, 99880, 99894,
              99906, 99920, 99934, 99962, 99970, 99972, 99976, 99984, 99998,
              1e5, 100028, 100038, 100044, 100056, 100078, 100082, 100084,
              100142, 100174, 100188, 100246, 100262, 100268, 100306, 100308,
              100390, 100396, 100410, 100422, 100428, 100440, 100462, 100466,
              100468, 100486, 100504, 100528, 100542, 100558, 100572, 100578,
              100580, 100584, 100598, 100620, 100656, 100670, 100704, 100732,
              100750, 100792, 100802, 100808, 100816, 100830, 100838, 100844,
              100858, 100888, 100912, 100926, 100960, 100988, 101056, 101112,
              101148, 101176, 101232, 101246, 101250, 101252, 101256, 101264,
              101278, 101280, 101308, 101318, 101324, 101336, 101358, 101362,
              101364, 101410, 101412, 101416, 101430, 101442, 101448, 101456,
              101470, 101478, 101498, 101506, 101508, 101520, 101534, 101536,
              101564, 101580, 101618, 101620, 101636, 101640, 101648, 101662,
              101664, 101692, 101696, 101752, 101766, 101784, 101838, 101858,
              101860, 101864, 101934, 101938, 101940, 101966, 101980, 101986,
              101988, 101992, 102030, 102044, 102072, 102082, 102084, 102088,
              102096, 102138, 102166, 102182, 102188, 102214, 102220, 102232,
              102254, 102282, 102290, 102292, 102306, 102308, 102312, 102326,
              102444, 102458, 102470, 102476, 102488, 102514, 102516, 102534,
              102552, 102576, 102590, 102606, 102620, 102626, 102632, 102646,
              102662, 102668, 102704, 102718, 102752, 102780, 102798, 102812,
              102840, 102850, 102856, 102864, 102878, 102886, 102892, 102906,
              102936, 102974, 103008, 103036, 103104, 103160, 103224, 103280,
              103294, 103298, 103300, 103312, 103326, 103328, 103356, 103366,
              103372, 103384, 103406, 103410, 103412, 103472, 103486, 103520,
              103548, 103616, 103672, 103920, 103992, 104048, 104062, 104160,
              104188, 104194, 104196, 104200, 104208, 104224, 104252, 104256,
              104312, 104326, 104332, 104344, 104368, 104382, 104398, 104412,
              104418, 104420, 104424, 104482, 104484, 104514, 104520, 104528,
              104542, 104550, 104570, 104578, 104580, 104592, 104606, 104608,
              104636, 104652, 104690, 104692, 104706, 104712, 104734, 104736,
              104764, 104768, 104824, 104838, 104856, 104910, 104930, 104932,
              104936, 104968, 104976, 104990, 104992, 105020, 105024, 105080,
              105200, 105240, 105278, 105312, 105372, 105410, 105412, 105416,
              105424, 105446, 105518, 105524, 105550, 105564, 105570, 105572,
              105576, 105614, 105628, 105656, 105666, 105672, 105680, 105702,
              105722, 105742, 105756, 105784, 105840, 105854, 105858, 105860,
              105864, 105872, 105888, 105932, 105970, 105972, 106006, 106022,
              106028, 106054, 106060, 106072, 106100, 106118, 106124, 106136,
              106160, 106174, 106190, 106210, 106212, 106216, 106250, 106258,
              106260, 106274, 106276, 106280, 106306, 106308, 106312, 106320,
              106334, 106348, 106394, 106414, 106418, 106420, 106566, 106572,
              106610, 106612, 106630, 106636, 106648, 106672, 106686, 106722,
              106724, 106728, 106742, 106758, 106764, 106776, 106800, 106814,
              106848, 106876, 106894, 106908, 106936, 106946, 106948, 106952,
              106960, 106974, 106982, 106988, 107032, 107056, 107070, 107104,
              107132, 107200, 107256, 107292, 107320, 107376, 107390, 107394,
              107396, 107400, 107408, 107422, 107424, 107452, 107462, 107468,
              107480, 107502, 107506, 107508, 107544, 107568, 107582, 107616,
              107644, 107712, 107768, 108016, 108060, 108088, 108144, 108158,
              108256, 108284, 108290, 108292, 108296, 108304, 108318, 108320,
              108348, 108352, 108408, 108422, 108428, 108440, 108464, 108478,
              108494, 108508, 108514, 108516, 108520, 108592, 108640, 108668,
              108736, 108792, 109040, 109536, 109680, 109694, 109792, 109820,
              110016, 110072, 110084, 110088, 110096, 110112, 110140, 110144,
              110200, 110320, 110342, 110348, 110360, 110384, 110398, 110432,
              110460, 110478, 110492, 110520, 110532, 110536, 110544, 110558,
              110658, 110686, 110714, 110722, 110724, 110728, 110736, 110750,
              110752, 110780, 110796, 110834, 110836, 110850, 110852, 110856,
              110864, 110878, 110880, 110908, 110912, 110968, 110982, 111e3,
              111054, 111074, 111076, 111080, 111108, 111112, 111120, 111134,
              111136, 111164, 111168, 111224, 111344, 111372, 111422, 111456,
              111516, 111554, 111556, 111560, 111568, 111590, 111632, 111646,
              111648, 111676, 111680, 111736, 111856, 112096, 112152, 112224,
              112252, 112320, 112440, 112514, 112516, 112520, 112528, 112542,
              112544, 112588, 112686, 112718, 112732, 112782, 112796, 112824,
              112834, 112836, 112840, 112848, 112870, 112890, 112910, 112924,
              112952, 113008, 113022, 113026, 113028, 113032, 113040, 113054,
              113056, 113100, 113138, 113140, 113166, 113180, 113208, 113264,
              113278, 113376, 113404, 113416, 113424, 113440, 113468, 113472,
              113560, 113614, 113634, 113636, 113640, 113686, 113702, 113708,
              113734, 113740, 113752, 113778, 113780, 113798, 113804, 113816,
              113840, 113854, 113870, 113890, 113892, 113896, 113926, 113932,
              113944, 113968, 113982, 114016, 114044, 114076, 114114, 114116,
              114120, 114128, 114150, 114170, 114194, 114196, 114210, 114212,
              114216, 114242, 114244, 114248, 114256, 114270, 114278, 114306,
              114308, 114312, 114320, 114334, 114336, 114364, 114380, 114420,
              114458, 114478, 114482, 114484, 114510, 114524, 114530, 114532,
              114536, 114842, 114866, 114868, 114970, 114994, 114996, 115042,
              115044, 115048, 115062, 115130, 115226, 115250, 115252, 115278,
              115292, 115298, 115300, 115304, 115318, 115342, 115394, 115396,
              115400, 115408, 115422, 115430, 115436, 115450, 115478, 115494,
              115514, 115526, 115532, 115570, 115572, 115738, 115758, 115762,
              115764, 115790, 115804, 115810, 115812, 115816, 115830, 115854,
              115868, 115896, 115906, 115912, 115920, 115934, 115942, 115948,
              115962, 115996, 116024, 116080, 116094, 116098, 116100, 116104,
              116112, 116126, 116128, 116156, 116166, 116172, 116184, 116206,
              116210, 116212, 116246, 116262, 116268, 116282, 116294, 116300,
              116312, 116334, 116338, 116340, 116358, 116364, 116376, 116400,
              116414, 116430, 116444, 116450, 116452, 116456, 116498, 116500,
              116514, 116520, 116534, 116546, 116548, 116552, 116560, 116574,
              116582, 116588, 116602, 116654, 116694, 116714, 116762, 116782,
              116786, 116788, 116814, 116828, 116834, 116836, 116840, 116854,
              116878, 116892, 116920, 116930, 116936, 116944, 116958, 116966,
              116972, 116986, 117006, 117048, 117104, 117118, 117122, 117124,
              117136, 117150, 117152, 117180, 117190, 117196, 117208, 117230,
              117234, 117236, 117304, 117360, 117374, 117472, 117500, 117506,
              117508, 117512, 117520, 117536, 117564, 117568, 117624, 117638,
              117644, 117656, 117680, 117694, 117710, 117724, 117730, 117732,
              117736, 117750, 117782, 117798, 117804, 117818, 117830, 117848,
              117874, 117876, 117894, 117936, 117950, 117966, 117986, 117988,
              117992, 118022, 118028, 118040, 118064, 118078, 118112, 118140,
              118172, 118210, 118212, 118216, 118224, 118238, 118246, 118266,
              118306, 118312, 118338, 118352, 118366, 118374, 118394, 118402,
              118404, 118408, 118416, 118430, 118432, 118460, 118476, 118514,
              118516, 118574, 118578, 118580, 118606, 118620, 118626, 118628,
              118632, 118678, 118694, 118700, 118730, 118738, 118740, 118830,
              118834, 118836, 118862, 118876, 118882, 118884, 118888, 118902,
              118926, 118940, 118968, 118978, 118980, 118984, 118992, 119006,
              119014, 119020, 119034, 119068, 119096, 119152, 119166, 119170,
              119172, 119176, 119184, 119198, 119200, 119228, 119238, 119244,
              119256, 119278, 119282, 119284, 119324, 119352, 119408, 119422,
              119520, 119548, 119554, 119556, 119560, 119568, 119582, 119584,
              119612, 119616, 119672, 119686, 119692, 119704, 119728, 119742,
              119758, 119772, 119778, 119780, 119784, 119798, 119920, 119934,
              120032, 120060, 120256, 120312, 120324, 120328, 120336, 120352,
              120384, 120440, 120560, 120582, 120588, 120600, 120624, 120638,
              120672, 120700, 120718, 120732, 120760, 120770, 120772, 120776,
              120784, 120798, 120806, 120812, 120870, 120876, 120890, 120902,
              120908, 120920, 120946, 120948, 120966, 120972, 120984, 121008,
              121022, 121038, 121058, 121060, 121064, 121078, 121100, 121112,
              121136, 121150, 121184, 121212, 121244, 121282, 121284, 121288,
              121296, 121318, 121338, 121356, 121368, 121392, 121406, 121440,
              121468, 121536, 121592, 121656, 121730, 121732, 121736, 121744,
              121758, 121760, 121804, 121842, 121844, 121890, 121922, 121924,
              121928, 121936, 121950, 121958, 121978, 121986, 121988, 121992,
              122e3, 122014, 122016, 122044, 122060, 122098, 122100, 122116,
              122120, 122128, 122142, 122144, 122172, 122176, 122232, 122246,
              122264, 122318, 122338, 122340, 122344, 122414, 122418, 122420,
              122446, 122460, 122466, 122468, 122472, 122510, 122524, 122552,
              122562, 122564, 122568, 122576, 122598, 122618, 122646, 122662,
              122668, 122694, 122700, 122712, 122738, 122740, 122762, 122770,
              122772, 122786, 122788, 122792, 123018, 123026, 123028, 123042,
              123044, 123048, 123062, 123098, 123146, 123154, 123156, 123170,
              123172, 123176, 123190, 123202, 123204, 123208, 123216, 123238,
              123244, 123258, 123290, 123314, 123316, 123402, 123410, 123412,
              123426, 123428, 123432, 123446, 123458, 123464, 123472, 123486,
              123494, 123500, 123514, 123522, 123524, 123528, 123536, 123552,
              123580, 123590, 123596, 123608, 123630, 123634, 123636, 123674,
              123698, 123700, 123740, 123746, 123748, 123752, 123834, 123914,
              123922, 123924, 123938, 123944, 123958, 123970, 123976, 123984,
              123998, 124006, 124012, 124026, 124034, 124036, 124048, 124062,
              124064, 124092, 124102, 124108, 124120, 124142, 124146, 124148,
              124162, 124164, 124168, 124176, 124190, 124192, 124220, 124224,
              124280, 124294, 124300, 124312, 124336, 124350, 124366, 124380,
              124386, 124388, 124392, 124406, 124442, 124462, 124466, 124468,
              124494, 124508, 124514, 124520, 124558, 124572, 124600, 124610,
              124612, 124616, 124624, 124646, 124666, 124694, 124710, 124716,
              124730, 124742, 124748, 124760, 124786, 124788, 124818, 124820,
              124834, 124836, 124840, 124854, 124946, 124948, 124962, 124964,
              124968, 124982, 124994, 124996, 125e3, 125008, 125022, 125030,
              125036, 125050, 125058, 125060, 125064, 125072, 125086, 125088,
              125116, 125126, 125132, 125144, 125166, 125170, 125172, 125186,
              125188, 125192, 125200, 125216, 125244, 125248, 125304, 125318,
              125324, 125336, 125360, 125374, 125390, 125404, 125410, 125412,
              125416, 125430, 125444, 125448, 125456, 125472, 125504, 125560,
              125680, 125702, 125708, 125720, 125744, 125758, 125792, 125820,
              125838, 125852, 125880, 125890, 125892, 125896, 125904, 125918,
              125926, 125932, 125978, 125998, 126002, 126004, 126030, 126044,
              126050, 126052, 126056, 126094, 126108, 126136, 126146, 126148,
              126152, 126160, 126182, 126202, 126222, 126236, 126264, 126320,
              126334, 126338, 126340, 126344, 126352, 126366, 126368, 126412,
              126450, 126452, 126486, 126502, 126508, 126522, 126534, 126540,
              126552, 126574, 126578, 126580, 126598, 126604, 126616, 126640,
              126654, 126670, 126684, 126690, 126692, 126696, 126738, 126754,
              126756, 126760, 126774, 126786, 126788, 126792, 126800, 126814,
              126822, 126828, 126842, 126894, 126898, 126900, 126934, 127126,
              127142, 127148, 127162, 127178, 127186, 127188, 127254, 127270,
              127276, 127290, 127302, 127308, 127320, 127342, 127346, 127348,
              127370, 127378, 127380, 127394, 127396, 127400, 127450, 127510,
              127526, 127532, 127546, 127558, 127576, 127598, 127602, 127604,
              127622, 127628, 127640, 127664, 127678, 127694, 127708, 127714,
              127716, 127720, 127734, 127754, 127762, 127764, 127778, 127784,
              127810, 127812, 127816, 127824, 127838, 127846, 127866, 127898,
              127918, 127922, 127924, 128022, 128038, 128044, 128058, 128070,
              128076, 128088, 128110, 128114, 128116, 128134, 128140, 128152,
              128176, 128190, 128206, 128220, 128226, 128228, 128232, 128246,
              128262, 128268, 128280, 128304, 128318, 128352, 128380, 128398,
              128412, 128440, 128450, 128452, 128456, 128464, 128478, 128486,
              128492, 128506, 128522, 128530, 128532, 128546, 128548, 128552,
              128566, 128578, 128580, 128584, 128592, 128606, 128614, 128634,
              128642, 128644, 128648, 128656, 128670, 128672, 128700, 128716,
              128754, 128756, 128794, 128814, 128818, 128820, 128846, 128860,
              128866, 128868, 128872, 128886, 128918, 128934, 128940, 128954,
              128978, 128980, 129178, 129198, 129202, 129204, 129238, 129258,
              129306, 129326, 129330, 129332, 129358, 129372, 129378, 129380,
              129384, 129398, 129430, 129446, 129452, 129466, 129482, 129490,
              129492, 129562, 129582, 129586, 129588, 129614, 129628, 129634,
              129636, 129640, 129654, 129678, 129692, 129720, 129730, 129732,
              129736, 129744, 129758, 129766, 129772, 129814, 129830, 129836,
              129850, 129862, 129868, 129880, 129902, 129906, 129908, 129930,
              129938, 129940, 129954, 129956, 129960, 129974, 130010,
            ])),
            (me.CODEWORD_TABLE = Int32Array.from([
              2627, 1819, 2622, 2621, 1813, 1812, 2729, 2724, 2723, 2779, 2774,
              2773, 902, 896, 908, 868, 865, 861, 859, 2511, 873, 871, 1780,
              835, 2493, 825, 2491, 842, 837, 844, 1764, 1762, 811, 810, 809,
              2483, 807, 2482, 806, 2480, 815, 814, 813, 812, 2484, 817, 816,
              1745, 1744, 1742, 1746, 2655, 2637, 2635, 2626, 2625, 2623, 2628,
              1820, 2752, 2739, 2737, 2728, 2727, 2725, 2730, 2785, 2783, 2778,
              2777, 2775, 2780, 787, 781, 747, 739, 736, 2413, 754, 752, 1719,
              692, 689, 681, 2371, 678, 2369, 700, 697, 694, 703, 1688, 1686,
              642, 638, 2343, 631, 2341, 627, 2338, 651, 646, 643, 2345, 654,
              652, 1652, 1650, 1647, 1654, 601, 599, 2322, 596, 2321, 594, 2319,
              2317, 611, 610, 608, 606, 2324, 603, 2323, 615, 614, 612, 1617,
              1616, 1614, 1612, 616, 1619, 1618, 2575, 2538, 2536, 905, 901,
              898, 909, 2509, 2507, 2504, 870, 867, 864, 860, 2512, 875, 872,
              1781, 2490, 2489, 2487, 2485, 1748, 836, 834, 832, 830, 2494, 827,
              2492, 843, 841, 839, 845, 1765, 1763, 2701, 2676, 2674, 2653,
              2648, 2656, 2634, 2633, 2631, 2629, 1821, 2638, 2636, 2770, 2763,
              2761, 2750, 2745, 2753, 2736, 2735, 2733, 2731, 1848, 2740, 2738,
              2786, 2784, 591, 588, 576, 569, 566, 2296, 1590, 537, 534, 526,
              2276, 522, 2274, 545, 542, 539, 548, 1572, 1570, 481, 2245, 466,
              2242, 462, 2239, 492, 485, 482, 2249, 496, 494, 1534, 1531, 1528,
              1538, 413, 2196, 406, 2191, 2188, 425, 419, 2202, 415, 2199, 432,
              430, 427, 1472, 1467, 1464, 433, 1476, 1474, 368, 367, 2160, 365,
              2159, 362, 2157, 2155, 2152, 378, 377, 375, 2166, 372, 2165, 369,
              2162, 383, 381, 379, 2168, 1419, 1418, 1416, 1414, 385, 1411, 384,
              1423, 1422, 1420, 1424, 2461, 802, 2441, 2439, 790, 786, 783, 794,
              2409, 2406, 2403, 750, 742, 738, 2414, 756, 753, 1720, 2367, 2365,
              2362, 2359, 1663, 693, 691, 684, 2373, 680, 2370, 702, 699, 696,
              704, 1690, 1687, 2337, 2336, 2334, 2332, 1624, 2329, 1622, 640,
              637, 2344, 634, 2342, 630, 2340, 650, 648, 645, 2346, 655, 653,
              1653, 1651, 1649, 1655, 2612, 2597, 2595, 2571, 2568, 2565, 2576,
              2534, 2529, 2526, 1787, 2540, 2537, 907, 904, 900, 910, 2503,
              2502, 2500, 2498, 1768, 2495, 1767, 2510, 2508, 2506, 869, 866,
              863, 2513, 876, 874, 1782, 2720, 2713, 2711, 2697, 2694, 2691,
              2702, 2672, 2670, 2664, 1828, 2678, 2675, 2647, 2646, 2644, 2642,
              1823, 2639, 1822, 2654, 2652, 2650, 2657, 2771, 1855, 2765, 2762,
              1850, 1849, 2751, 2749, 2747, 2754, 353, 2148, 344, 342, 336,
              2142, 332, 2140, 345, 1375, 1373, 306, 2130, 299, 2128, 295, 2125,
              319, 314, 311, 2132, 1354, 1352, 1349, 1356, 262, 257, 2101, 253,
              2096, 2093, 274, 273, 267, 2107, 263, 2104, 280, 278, 275, 1316,
              1311, 1308, 1320, 1318, 2052, 202, 2050, 2044, 2040, 219, 2063,
              212, 2060, 208, 2055, 224, 221, 2066, 1260, 1258, 1252, 231, 1248,
              229, 1266, 1264, 1261, 1268, 155, 1998, 153, 1996, 1994, 1991,
              1988, 165, 164, 2007, 162, 2006, 159, 2003, 2e3, 172, 171, 169,
              2012, 166, 2010, 1186, 1184, 1182, 1179, 175, 1176, 173, 1192,
              1191, 1189, 1187, 176, 1194, 1193, 2313, 2307, 2305, 592, 589,
              2294, 2292, 2289, 578, 572, 568, 2297, 580, 1591, 2272, 2267,
              2264, 1547, 538, 536, 529, 2278, 525, 2275, 547, 544, 541, 1574,
              1571, 2237, 2235, 2229, 1493, 2225, 1489, 478, 2247, 470, 2244,
              465, 2241, 493, 488, 484, 2250, 498, 495, 1536, 1533, 1530, 1539,
              2187, 2186, 2184, 2182, 1432, 2179, 1430, 2176, 1427, 414, 412,
              2197, 409, 2195, 405, 2193, 2190, 426, 424, 421, 2203, 418, 2201,
              431, 429, 1473, 1471, 1469, 1466, 434, 1477, 1475, 2478, 2472,
              2470, 2459, 2457, 2454, 2462, 803, 2437, 2432, 2429, 1726, 2443,
              2440, 792, 789, 785, 2401, 2399, 2393, 1702, 2389, 1699, 2411,
              2408, 2405, 745, 741, 2415, 758, 755, 1721, 2358, 2357, 2355,
              2353, 1661, 2350, 1660, 2347, 1657, 2368, 2366, 2364, 2361, 1666,
              690, 687, 2374, 683, 2372, 701, 698, 705, 1691, 1689, 2619, 2617,
              2610, 2608, 2605, 2613, 2593, 2588, 2585, 1803, 2599, 2596, 2563,
              2561, 2555, 1797, 2551, 1795, 2573, 2570, 2567, 2577, 2525, 2524,
              2522, 2520, 1786, 2517, 1785, 2514, 1783, 2535, 2533, 2531, 2528,
              1788, 2541, 2539, 906, 903, 911, 2721, 1844, 2715, 2712, 1838,
              1836, 2699, 2696, 2693, 2703, 1827, 1826, 1824, 2673, 2671, 2669,
              2666, 1829, 2679, 2677, 1858, 1857, 2772, 1854, 1853, 1851, 1856,
              2766, 2764, 143, 1987, 139, 1986, 135, 133, 131, 1984, 128, 1983,
              125, 1981, 138, 137, 136, 1985, 1133, 1132, 1130, 112, 110, 1974,
              107, 1973, 104, 1971, 1969, 122, 121, 119, 117, 1977, 114, 1976,
              124, 1115, 1114, 1112, 1110, 1117, 1116, 84, 83, 1953, 81, 1952,
              78, 1950, 1948, 1945, 94, 93, 91, 1959, 88, 1958, 85, 1955, 99,
              97, 95, 1961, 1086, 1085, 1083, 1081, 1078, 100, 1090, 1089, 1087,
              1091, 49, 47, 1917, 44, 1915, 1913, 1910, 1907, 59, 1926, 56,
              1925, 53, 1922, 1919, 66, 64, 1931, 61, 1929, 1042, 1040, 1038,
              71, 1035, 70, 1032, 68, 1048, 1047, 1045, 1043, 1050, 1049, 12,
              10, 1869, 1867, 1864, 1861, 21, 1880, 19, 1877, 1874, 1871, 28,
              1888, 25, 1886, 22, 1883, 982, 980, 977, 974, 32, 30, 991, 989,
              987, 984, 34, 995, 994, 992, 2151, 2150, 2147, 2146, 2144, 356,
              355, 354, 2149, 2139, 2138, 2136, 2134, 1359, 343, 341, 338, 2143,
              335, 2141, 348, 347, 346, 1376, 1374, 2124, 2123, 2121, 2119,
              1326, 2116, 1324, 310, 308, 305, 2131, 302, 2129, 298, 2127, 320,
              318, 316, 313, 2133, 322, 321, 1355, 1353, 1351, 1357, 2092, 2091,
              2089, 2087, 1276, 2084, 1274, 2081, 1271, 259, 2102, 256, 2100,
              252, 2098, 2095, 272, 269, 2108, 266, 2106, 281, 279, 277, 1317,
              1315, 1313, 1310, 282, 1321, 1319, 2039, 2037, 2035, 2032, 1203,
              2029, 1200, 1197, 207, 2053, 205, 2051, 201, 2049, 2046, 2043,
              220, 218, 2064, 215, 2062, 211, 2059, 228, 226, 223, 2069, 1259,
              1257, 1254, 232, 1251, 230, 1267, 1265, 1263, 2316, 2315, 2312,
              2311, 2309, 2314, 2304, 2303, 2301, 2299, 1593, 2308, 2306, 590,
              2288, 2287, 2285, 2283, 1578, 2280, 1577, 2295, 2293, 2291, 579,
              577, 574, 571, 2298, 582, 581, 1592, 2263, 2262, 2260, 2258, 1545,
              2255, 1544, 2252, 1541, 2273, 2271, 2269, 2266, 1550, 535, 532,
              2279, 528, 2277, 546, 543, 549, 1575, 1573, 2224, 2222, 2220,
              1486, 2217, 1485, 2214, 1482, 1479, 2238, 2236, 2234, 2231, 1496,
              2228, 1492, 480, 477, 2248, 473, 2246, 469, 2243, 490, 487, 2251,
              497, 1537, 1535, 1532, 2477, 2476, 2474, 2479, 2469, 2468, 2466,
              2464, 1730, 2473, 2471, 2453, 2452, 2450, 2448, 1729, 2445, 1728,
              2460, 2458, 2456, 2463, 805, 804, 2428, 2427, 2425, 2423, 1725,
              2420, 1724, 2417, 1722, 2438, 2436, 2434, 2431, 1727, 2444, 2442,
              793, 791, 788, 795, 2388, 2386, 2384, 1697, 2381, 1696, 2378,
              1694, 1692, 2402, 2400, 2398, 2395, 1703, 2392, 1701, 2412, 2410,
              2407, 751, 748, 744, 2416, 759, 757, 1807, 2620, 2618, 1806, 1805,
              2611, 2609, 2607, 2614, 1802, 1801, 1799, 2594, 2592, 2590, 2587,
              1804, 2600, 2598, 1794, 1793, 1791, 1789, 2564, 2562, 2560, 2557,
              1798, 2554, 1796, 2574, 2572, 2569, 2578, 1847, 1846, 2722, 1843,
              1842, 1840, 1845, 2716, 2714, 1835, 1834, 1832, 1830, 1839, 1837,
              2700, 2698, 2695, 2704, 1817, 1811, 1810, 897, 862, 1777, 829,
              826, 838, 1760, 1758, 808, 2481, 1741, 1740, 1738, 1743, 2624,
              1818, 2726, 2776, 782, 740, 737, 1715, 686, 679, 695, 1682, 1680,
              639, 628, 2339, 647, 644, 1645, 1643, 1640, 1648, 602, 600, 597,
              595, 2320, 593, 2318, 609, 607, 604, 1611, 1610, 1608, 1606, 613,
              1615, 1613, 2328, 926, 924, 892, 886, 899, 857, 850, 2505, 1778,
              824, 823, 821, 819, 2488, 818, 2486, 833, 831, 828, 840, 1761,
              1759, 2649, 2632, 2630, 2746, 2734, 2732, 2782, 2781, 570, 567,
              1587, 531, 527, 523, 540, 1566, 1564, 476, 467, 463, 2240, 486,
              483, 1524, 1521, 1518, 1529, 411, 403, 2192, 399, 2189, 423, 416,
              1462, 1457, 1454, 428, 1468, 1465, 2210, 366, 363, 2158, 360,
              2156, 357, 2153, 376, 373, 370, 2163, 1410, 1409, 1407, 1405, 382,
              1402, 380, 1417, 1415, 1412, 1421, 2175, 2174, 777, 774, 771, 784,
              732, 725, 722, 2404, 743, 1716, 676, 674, 668, 2363, 665, 2360,
              685, 1684, 1681, 626, 624, 622, 2335, 620, 2333, 617, 2330, 641,
              635, 649, 1646, 1644, 1642, 2566, 928, 925, 2530, 2527, 894, 891,
              888, 2501, 2499, 2496, 858, 856, 854, 851, 1779, 2692, 2668, 2665,
              2645, 2643, 2640, 2651, 2768, 2759, 2757, 2744, 2743, 2741, 2748,
              352, 1382, 340, 337, 333, 1371, 1369, 307, 300, 296, 2126, 315,
              312, 1347, 1342, 1350, 261, 258, 250, 2097, 246, 2094, 271, 268,
              264, 1306, 1301, 1298, 276, 1312, 1309, 2115, 203, 2048, 195,
              2045, 191, 2041, 213, 209, 2056, 1246, 1244, 1238, 225, 1234, 222,
              1256, 1253, 1249, 1262, 2080, 2079, 154, 1997, 150, 1995, 147,
              1992, 1989, 163, 160, 2004, 156, 2001, 1175, 1174, 1172, 1170,
              1167, 170, 1164, 167, 1185, 1183, 1180, 1177, 174, 1190, 1188,
              2025, 2024, 2022, 587, 586, 564, 559, 556, 2290, 573, 1588, 520,
              518, 512, 2268, 508, 2265, 530, 1568, 1565, 461, 457, 2233, 450,
              2230, 446, 2226, 479, 471, 489, 1526, 1523, 1520, 397, 395, 2185,
              392, 2183, 389, 2180, 2177, 410, 2194, 402, 422, 1463, 1461, 1459,
              1456, 1470, 2455, 799, 2433, 2430, 779, 776, 773, 2397, 2394,
              2390, 734, 728, 724, 746, 1717, 2356, 2354, 2351, 2348, 1658, 677,
              675, 673, 670, 667, 688, 1685, 1683, 2606, 2589, 2586, 2559, 2556,
              2552, 927, 2523, 2521, 2518, 2515, 1784, 2532, 895, 893, 890,
              2718, 2709, 2707, 2689, 2687, 2684, 2663, 2662, 2660, 2658, 1825,
              2667, 2769, 1852, 2760, 2758, 142, 141, 1139, 1138, 134, 132, 129,
              126, 1982, 1129, 1128, 1126, 1131, 113, 111, 108, 105, 1972, 101,
              1970, 120, 118, 115, 1109, 1108, 1106, 1104, 123, 1113, 1111, 82,
              79, 1951, 75, 1949, 72, 1946, 92, 89, 86, 1956, 1077, 1076, 1074,
              1072, 98, 1069, 96, 1084, 1082, 1079, 1088, 1968, 1967, 48, 45,
              1916, 42, 1914, 39, 1911, 1908, 60, 57, 54, 1923, 50, 1920, 1031,
              1030, 1028, 1026, 67, 1023, 65, 1020, 62, 1041, 1039, 1036, 1033,
              69, 1046, 1044, 1944, 1943, 1941, 11, 9, 1868, 7, 1865, 1862,
              1859, 20, 1878, 16, 1875, 13, 1872, 970, 968, 966, 963, 29, 960,
              26, 23, 983, 981, 978, 975, 33, 971, 31, 990, 988, 985, 1906,
              1904, 1902, 993, 351, 2145, 1383, 331, 330, 328, 326, 2137, 323,
              2135, 339, 1372, 1370, 294, 293, 291, 289, 2122, 286, 2120, 283,
              2117, 309, 303, 317, 1348, 1346, 1344, 245, 244, 242, 2090, 239,
              2088, 236, 2085, 2082, 260, 2099, 249, 270, 1307, 1305, 1303,
              1300, 1314, 189, 2038, 186, 2036, 183, 2033, 2030, 2026, 206, 198,
              2047, 194, 216, 1247, 1245, 1243, 1240, 227, 1237, 1255, 2310,
              2302, 2300, 2286, 2284, 2281, 565, 563, 561, 558, 575, 1589, 2261,
              2259, 2256, 2253, 1542, 521, 519, 517, 514, 2270, 511, 533, 1569,
              1567, 2223, 2221, 2218, 2215, 1483, 2211, 1480, 459, 456, 453,
              2232, 449, 474, 491, 1527, 1525, 1522, 2475, 2467, 2465, 2451,
              2449, 2446, 801, 800, 2426, 2424, 2421, 2418, 1723, 2435, 780,
              778, 775, 2387, 2385, 2382, 2379, 1695, 2375, 1693, 2396, 735,
              733, 730, 727, 749, 1718, 2616, 2615, 2604, 2603, 2601, 2584,
              2583, 2581, 2579, 1800, 2591, 2550, 2549, 2547, 2545, 1792, 2542,
              1790, 2558, 929, 2719, 1841, 2710, 2708, 1833, 1831, 2690, 2688,
              2686, 1815, 1809, 1808, 1774, 1756, 1754, 1737, 1736, 1734, 1739,
              1816, 1711, 1676, 1674, 633, 629, 1638, 1636, 1633, 1641, 598,
              1605, 1604, 1602, 1600, 605, 1609, 1607, 2327, 887, 853, 1775,
              822, 820, 1757, 1755, 1584, 524, 1560, 1558, 468, 464, 1514, 1511,
              1508, 1519, 408, 404, 400, 1452, 1447, 1444, 417, 1458, 1455,
              2208, 364, 361, 358, 2154, 1401, 1400, 1398, 1396, 374, 1393, 371,
              1408, 1406, 1403, 1413, 2173, 2172, 772, 726, 723, 1712, 672, 669,
              666, 682, 1678, 1675, 625, 623, 621, 618, 2331, 636, 632, 1639,
              1637, 1635, 920, 918, 884, 880, 889, 849, 848, 847, 846, 2497,
              855, 852, 1776, 2641, 2742, 2787, 1380, 334, 1367, 1365, 301, 297,
              1340, 1338, 1335, 1343, 255, 251, 247, 1296, 1291, 1288, 265,
              1302, 1299, 2113, 204, 196, 192, 2042, 1232, 1230, 1224, 214,
              1220, 210, 1242, 1239, 1235, 1250, 2077, 2075, 151, 148, 1993,
              144, 1990, 1163, 1162, 1160, 1158, 1155, 161, 1152, 157, 1173,
              1171, 1168, 1165, 168, 1181, 1178, 2021, 2020, 2018, 2023, 585,
              560, 557, 1585, 516, 509, 1562, 1559, 458, 447, 2227, 472, 1516,
              1513, 1510, 398, 396, 393, 390, 2181, 386, 2178, 407, 1453, 1451,
              1449, 1446, 420, 1460, 2209, 769, 764, 720, 712, 2391, 729, 1713,
              664, 663, 661, 659, 2352, 656, 2349, 671, 1679, 1677, 2553, 922,
              919, 2519, 2516, 885, 883, 881, 2685, 2661, 2659, 2767, 2756,
              2755, 140, 1137, 1136, 130, 127, 1125, 1124, 1122, 1127, 109, 106,
              102, 1103, 1102, 1100, 1098, 116, 1107, 1105, 1980, 80, 76, 73,
              1947, 1068, 1067, 1065, 1063, 90, 1060, 87, 1075, 1073, 1070,
              1080, 1966, 1965, 46, 43, 40, 1912, 36, 1909, 1019, 1018, 1016,
              1014, 58, 1011, 55, 1008, 51, 1029, 1027, 1024, 1021, 63, 1037,
              1034, 1940, 1939, 1937, 1942, 8, 1866, 4, 1863, 1, 1860, 956, 954,
              952, 949, 946, 17, 14, 969, 967, 964, 961, 27, 957, 24, 979, 976,
              972, 1901, 1900, 1898, 1896, 986, 1905, 1903, 350, 349, 1381, 329,
              327, 324, 1368, 1366, 292, 290, 287, 284, 2118, 304, 1341, 1339,
              1337, 1345, 243, 240, 237, 2086, 233, 2083, 254, 1297, 1295, 1293,
              1290, 1304, 2114, 190, 187, 184, 2034, 180, 2031, 177, 2027, 199,
              1233, 1231, 1229, 1226, 217, 1223, 1241, 2078, 2076, 584, 555,
              554, 552, 550, 2282, 562, 1586, 507, 506, 504, 502, 2257, 499,
              2254, 515, 1563, 1561, 445, 443, 441, 2219, 438, 2216, 435, 2212,
              460, 454, 475, 1517, 1515, 1512, 2447, 798, 797, 2422, 2419, 770,
              768, 766, 2383, 2380, 2376, 721, 719, 717, 714, 731, 1714, 2602,
              2582, 2580, 2548, 2546, 2543, 923, 921, 2717, 2706, 2705, 2683,
              2682, 2680, 1771, 1752, 1750, 1733, 1732, 1731, 1735, 1814, 1707,
              1670, 1668, 1631, 1629, 1626, 1634, 1599, 1598, 1596, 1594, 1603,
              1601, 2326, 1772, 1753, 1751, 1581, 1554, 1552, 1504, 1501, 1498,
              1509, 1442, 1437, 1434, 401, 1448, 1445, 2206, 1392, 1391, 1389,
              1387, 1384, 359, 1399, 1397, 1394, 1404, 2171, 2170, 1708, 1672,
              1669, 619, 1632, 1630, 1628, 1773, 1378, 1363, 1361, 1333, 1328,
              1336, 1286, 1281, 1278, 248, 1292, 1289, 2111, 1218, 1216, 1210,
              197, 1206, 193, 1228, 1225, 1221, 1236, 2073, 2071, 1151, 1150,
              1148, 1146, 152, 1143, 149, 1140, 145, 1161, 1159, 1156, 1153,
              158, 1169, 1166, 2017, 2016, 2014, 2019, 1582, 510, 1556, 1553,
              452, 448, 1506, 1500, 394, 391, 387, 1443, 1441, 1439, 1436, 1450,
              2207, 765, 716, 713, 1709, 662, 660, 657, 1673, 1671, 916, 914,
              879, 878, 877, 882, 1135, 1134, 1121, 1120, 1118, 1123, 1097,
              1096, 1094, 1092, 103, 1101, 1099, 1979, 1059, 1058, 1056, 1054,
              77, 1051, 74, 1066, 1064, 1061, 1071, 1964, 1963, 1007, 1006,
              1004, 1002, 999, 41, 996, 37, 1017, 1015, 1012, 1009, 52, 1025,
              1022, 1936, 1935, 1933, 1938, 942, 940, 938, 935, 932, 5, 2, 955,
              953, 950, 947, 18, 943, 15, 965, 962, 958, 1895, 1894, 1892, 1890,
              973, 1899, 1897, 1379, 325, 1364, 1362, 288, 285, 1334, 1332,
              1330, 241, 238, 234, 1287, 1285, 1283, 1280, 1294, 2112, 188, 185,
              181, 178, 2028, 1219, 1217, 1215, 1212, 200, 1209, 1227, 2074,
              2072, 583, 553, 551, 1583, 505, 503, 500, 513, 1557, 1555, 444,
              442, 439, 436, 2213, 455, 451, 1507, 1505, 1502, 796, 763, 762,
              760, 767, 711, 710, 708, 706, 2377, 718, 715, 1710, 2544, 917,
              915, 2681, 1627, 1597, 1595, 2325, 1769, 1749, 1747, 1499, 1438,
              1435, 2204, 1390, 1388, 1385, 1395, 2169, 2167, 1704, 1665, 1662,
              1625, 1623, 1620, 1770, 1329, 1282, 1279, 2109, 1214, 1207, 1222,
              2068, 2065, 1149, 1147, 1144, 1141, 146, 1157, 1154, 2013, 2011,
              2008, 2015, 1579, 1549, 1546, 1495, 1487, 1433, 1431, 1428, 1425,
              388, 1440, 2205, 1705, 658, 1667, 1664, 1119, 1095, 1093, 1978,
              1057, 1055, 1052, 1062, 1962, 1960, 1005, 1003, 1e3, 997, 38,
              1013, 1010, 1932, 1930, 1927, 1934, 941, 939, 936, 933, 6, 930, 3,
              951, 948, 944, 1889, 1887, 1884, 1881, 959, 1893, 1891, 35, 1377,
              1360, 1358, 1327, 1325, 1322, 1331, 1277, 1275, 1272, 1269, 235,
              1284, 2110, 1205, 1204, 1201, 1198, 182, 1195, 179, 1213, 2070,
              2067, 1580, 501, 1551, 1548, 440, 437, 1497, 1494, 1490, 1503,
              761, 709, 707, 1706, 913, 912, 2198, 1386, 2164, 2161, 1621, 1766,
              2103, 1208, 2058, 2054, 1145, 1142, 2005, 2002, 1999, 2009, 1488,
              1429, 1426, 2200, 1698, 1659, 1656, 1975, 1053, 1957, 1954, 1001,
              998, 1924, 1921, 1918, 1928, 937, 934, 931, 1879, 1876, 1873,
              1870, 945, 1885, 1882, 1323, 1273, 1270, 2105, 1202, 1199, 1196,
              1211, 2061, 2057, 1576, 1543, 1540, 1484, 1481, 1478, 1491, 1700,
            ])));
          class s1 {
            constructor(e, t) {
              ((this.bits = e), (this.points = t));
            }
            getBits() {
              return this.bits;
            }
            getPoints() {
              return this.points;
            }
          }
          class ye {
            static detectMultiple(e, t, r) {
              let s = e.getBlackMatrix(),
                o = ye.detect(r, s);
              return (
                o.length ||
                  ((s = s.clone()), s.rotate180(), (o = ye.detect(r, s))),
                new s1(s, o)
              );
            }
            static detect(e, t) {
              const r = new Array();
              let s = 0,
                o = 0,
                a = !1;
              for (; s < t.getHeight();) {
                const c = ye.findVertices(t, s, o);
                if (c[0] == null && c[3] == null) {
                  if (!a) break;
                  ((a = !1), (o = 0));
                  for (const d of r)
                    (d[1] != null && (s = Math.trunc(Math.max(s, d[1].getY()))),
                      d[3] != null &&
                        (s = Math.max(s, Math.trunc(d[3].getY()))));
                  s += ye.ROW_STEP;
                  continue;
                }
                if (((a = !0), r.push(c), !e)) break;
                c[2] != null
                  ? ((o = Math.trunc(c[2].getX())),
                    (s = Math.trunc(c[2].getY())))
                  : ((o = Math.trunc(c[4].getX())),
                    (s = Math.trunc(c[4].getY())));
              }
              return r;
            }
            static findVertices(e, t, r) {
              const s = e.getHeight(),
                o = e.getWidth(),
                a = new Array(8);
              return (
                ye.copyToResult(
                  a,
                  ye.findRowsWithPattern(e, s, o, t, r, ye.START_PATTERN),
                  ye.INDEXES_START_PATTERN,
                ),
                a[4] != null &&
                  ((r = Math.trunc(a[4].getX())),
                  (t = Math.trunc(a[4].getY()))),
                ye.copyToResult(
                  a,
                  ye.findRowsWithPattern(e, s, o, t, r, ye.STOP_PATTERN),
                  ye.INDEXES_STOP_PATTERN,
                ),
                a
              );
            }
            static copyToResult(e, t, r) {
              for (let s = 0; s < r.length; s++) e[r[s]] = t[s];
            }
            static findRowsWithPattern(e, t, r, s, o, a) {
              const c = new Array(4);
              let d = !1;
              const f = new Int32Array(a.length);
              for (; s < t; s += ye.ROW_STEP) {
                let m = ye.findGuardPattern(e, o, s, r, !1, a, f);
                if (m != null) {
                  for (; s > 0;) {
                    const C = ye.findGuardPattern(e, o, --s, r, !1, a, f);
                    if (C != null) m = C;
                    else {
                      s++;
                      break;
                    }
                  }
                  ((c[0] = new de(m[0], s)),
                    (c[1] = new de(m[1], s)),
                    (d = !0));
                  break;
                }
              }
              let x = s + 1;
              if (d) {
                let m = 0,
                  C = Int32Array.from([
                    Math.trunc(c[0].getX()),
                    Math.trunc(c[1].getX()),
                  ]);
                for (; x < t; x++) {
                  const S = ye.findGuardPattern(e, C[0], x, r, !1, a, f);
                  if (
                    S != null &&
                    Math.abs(C[0] - S[0]) < ye.MAX_PATTERN_DRIFT &&
                    Math.abs(C[1] - S[1]) < ye.MAX_PATTERN_DRIFT
                  )
                    ((C = S), (m = 0));
                  else {
                    if (m > ye.SKIPPED_ROW_COUNT_MAX) break;
                    m++;
                  }
                }
                ((x -= m + 1),
                  (c[2] = new de(C[0], x)),
                  (c[3] = new de(C[1], x)));
              }
              return (x - s < ye.BARCODE_MIN_HEIGHT && J.fill(c, null), c);
            }
            static findGuardPattern(e, t, r, s, o, a, c) {
              J.fillWithin(c, 0, c.length, 0);
              let d = t,
                f = 0;
              for (; e.get(d, r) && d > 0 && f++ < ye.MAX_PIXEL_DRIFT;) d--;
              let x = d,
                m = 0,
                C = a.length;
              for (let S = o; x < s; x++)
                if (e.get(x, r) !== S) c[m]++;
                else {
                  if (m === C - 1) {
                    if (
                      ye.patternMatchVariance(
                        c,
                        a,
                        ye.MAX_INDIVIDUAL_VARIANCE,
                      ) < ye.MAX_AVG_VARIANCE
                    )
                      return new Int32Array([d, x]);
                    ((d += c[0] + c[1]),
                      M.arraycopy(c, 2, c, 0, m - 1),
                      (c[m - 1] = 0),
                      (c[m] = 0),
                      m--);
                  } else m++;
                  ((c[m] = 1), (S = !S));
                }
              return m === C - 1 &&
                ye.patternMatchVariance(c, a, ye.MAX_INDIVIDUAL_VARIANCE) <
                  ye.MAX_AVG_VARIANCE
                ? new Int32Array([d, x - 1])
                : null;
            }
            static patternMatchVariance(e, t, r) {
              let s = e.length,
                o = 0,
                a = 0;
              for (let f = 0; f < s; f++) ((o += e[f]), (a += t[f]));
              if (o < a) return 1 / 0;
              let c = o / a;
              r *= c;
              let d = 0;
              for (let f = 0; f < s; f++) {
                let x = e[f],
                  m = t[f] * c,
                  C = x > m ? x - m : m - x;
                if (C > r) return 1 / 0;
                d += C;
              }
              return d / o;
            }
          }
          ((ye.INDEXES_START_PATTERN = Int32Array.from([0, 4, 1, 5])),
            (ye.INDEXES_STOP_PATTERN = Int32Array.from([6, 2, 7, 3])),
            (ye.MAX_AVG_VARIANCE = 0.42),
            (ye.MAX_INDIVIDUAL_VARIANCE = 0.8),
            (ye.START_PATTERN = Int32Array.from([8, 1, 1, 1, 1, 1, 1, 3])),
            (ye.STOP_PATTERN = Int32Array.from([7, 1, 1, 3, 1, 1, 1, 2, 1])),
            (ye.MAX_PIXEL_DRIFT = 3),
            (ye.MAX_PATTERN_DRIFT = 5),
            (ye.SKIPPED_ROW_COUNT_MAX = 25),
            (ye.ROW_STEP = 5),
            (ye.BARCODE_MIN_HEIGHT = 10));
          class mt {
            constructor(e, t) {
              if (t.length === 0) throw new T();
              this.field = e;
              let r = t.length;
              if (r > 1 && t[0] === 0) {
                let s = 1;
                for (; s < r && t[s] === 0;) s++;
                s === r
                  ? (this.coefficients = new Int32Array([0]))
                  : ((this.coefficients = new Int32Array(r - s)),
                    M.arraycopy(
                      t,
                      s,
                      this.coefficients,
                      0,
                      this.coefficients.length,
                    ));
              } else this.coefficients = t;
            }
            getCoefficients() {
              return this.coefficients;
            }
            getDegree() {
              return this.coefficients.length - 1;
            }
            isZero() {
              return this.coefficients[0] === 0;
            }
            getCoefficient(e) {
              return this.coefficients[this.coefficients.length - 1 - e];
            }
            evaluateAt(e) {
              if (e === 0) return this.getCoefficient(0);
              if (e === 1) {
                let s = 0;
                for (let o of this.coefficients) s = this.field.add(s, o);
                return s;
              }
              let t = this.coefficients[0],
                r = this.coefficients.length;
              for (let s = 1; s < r; s++)
                t = this.field.add(
                  this.field.multiply(e, t),
                  this.coefficients[s],
                );
              return t;
            }
            add(e) {
              if (!this.field.equals(e.field))
                throw new T('ModulusPolys do not have same ModulusGF field');
              if (this.isZero()) return e;
              if (e.isZero()) return this;
              let t = this.coefficients,
                r = e.coefficients;
              if (t.length > r.length) {
                let a = t;
                ((t = r), (r = a));
              }
              let s = new Int32Array(r.length),
                o = r.length - t.length;
              M.arraycopy(r, 0, s, 0, o);
              for (let a = o; a < r.length; a++)
                s[a] = this.field.add(t[a - o], r[a]);
              return new mt(this.field, s);
            }
            subtract(e) {
              if (!this.field.equals(e.field))
                throw new T('ModulusPolys do not have same ModulusGF field');
              return e.isZero() ? this : this.add(e.negative());
            }
            multiply(e) {
              return e instanceof mt
                ? this.multiplyOther(e)
                : this.multiplyScalar(e);
            }
            multiplyOther(e) {
              if (!this.field.equals(e.field))
                throw new T('ModulusPolys do not have same ModulusGF field');
              if (this.isZero() || e.isZero())
                return new mt(this.field, new Int32Array([0]));
              let t = this.coefficients,
                r = t.length,
                s = e.coefficients,
                o = s.length,
                a = new Int32Array(r + o - 1);
              for (let c = 0; c < r; c++) {
                let d = t[c];
                for (let f = 0; f < o; f++)
                  a[c + f] = this.field.add(
                    a[c + f],
                    this.field.multiply(d, s[f]),
                  );
              }
              return new mt(this.field, a);
            }
            negative() {
              let e = this.coefficients.length,
                t = new Int32Array(e);
              for (let r = 0; r < e; r++)
                t[r] = this.field.subtract(0, this.coefficients[r]);
              return new mt(this.field, t);
            }
            multiplyScalar(e) {
              if (e === 0) return new mt(this.field, new Int32Array([0]));
              if (e === 1) return this;
              let t = this.coefficients.length,
                r = new Int32Array(t);
              for (let s = 0; s < t; s++)
                r[s] = this.field.multiply(this.coefficients[s], e);
              return new mt(this.field, r);
            }
            multiplyByMonomial(e, t) {
              if (e < 0) throw new T();
              if (t === 0) return new mt(this.field, new Int32Array([0]));
              let r = this.coefficients.length,
                s = new Int32Array(r + e);
              for (let o = 0; o < r; o++)
                s[o] = this.field.multiply(this.coefficients[o], t);
              return new mt(this.field, s);
            }
            toString() {
              let e = new $();
              for (let t = this.getDegree(); t >= 0; t--) {
                let r = this.getCoefficient(t);
                r !== 0 &&
                  (r < 0
                    ? (e.append(' - '), (r = -r))
                    : e.length() > 0 && e.append(' + '),
                  (t === 0 || r !== 1) && e.append(r),
                  t !== 0 &&
                    (t === 1 ? e.append('x') : (e.append('x^'), e.append(t))));
              }
              return e.toString();
            }
          }
          class i1 {
            add(e, t) {
              return (e + t) % this.modulus;
            }
            subtract(e, t) {
              return (this.modulus + e - t) % this.modulus;
            }
            exp(e) {
              return this.expTable[e];
            }
            log(e) {
              if (e === 0) throw new T();
              return this.logTable[e];
            }
            inverse(e) {
              if (e === 0) throw new Cr();
              return this.expTable[this.modulus - this.logTable[e] - 1];
            }
            multiply(e, t) {
              return e === 0 || t === 0
                ? 0
                : this.expTable[
                    (this.logTable[e] + this.logTable[t]) % (this.modulus - 1)
                  ];
            }
            getSize() {
              return this.modulus;
            }
            equals(e) {
              return e === this;
            }
          }
          class Wi extends i1 {
            constructor(e, t) {
              (super(),
                (this.modulus = e),
                (this.expTable = new Int32Array(e)),
                (this.logTable = new Int32Array(e)));
              let r = 1;
              for (let s = 0; s < e; s++)
                ((this.expTable[s] = r), (r = (r * t) % e));
              for (let s = 0; s < e - 1; s++)
                this.logTable[this.expTable[s]] = s;
              ((this.zero = new mt(this, new Int32Array([0]))),
                (this.one = new mt(this, new Int32Array([1]))));
            }
            getZero() {
              return this.zero;
            }
            getOne() {
              return this.one;
            }
            buildMonomial(e, t) {
              if (e < 0) throw new T();
              if (t === 0) return this.zero;
              let r = new Int32Array(e + 1);
              return ((r[0] = t), new mt(this, r));
            }
          }
          Wi.PDF417_GF = new Wi(me.NUMBER_OF_CODEWORDS, 3);
          class aa {
            constructor() {
              this.field = Wi.PDF417_GF;
            }
            decode(e, t, r) {
              let s = new mt(this.field, e),
                o = new Int32Array(t),
                a = !1;
              for (let v = t; v > 0; v--) {
                let N = s.evaluateAt(this.field.exp(v));
                ((o[t - v] = N), N !== 0 && (a = !0));
              }
              if (!a) return 0;
              let c = this.field.getOne();
              if (r != null)
                for (const v of r) {
                  let N = this.field.exp(e.length - 1 - v),
                    O = new mt(
                      this.field,
                      new Int32Array([this.field.subtract(0, N), 1]),
                    );
                  c = c.multiply(O);
                }
              let d = new mt(this.field, o),
                f = this.runEuclideanAlgorithm(
                  this.field.buildMonomial(t, 1),
                  d,
                  t,
                ),
                x = f[0],
                m = f[1],
                C = this.findErrorLocations(x),
                S = this.findErrorMagnitudes(m, x, C);
              for (let v = 0; v < C.length; v++) {
                let N = e.length - 1 - this.field.log(C[v]);
                if (N < 0) throw D.getChecksumInstance();
                e[N] = this.field.subtract(e[N], S[v]);
              }
              return C.length;
            }
            runEuclideanAlgorithm(e, t, r) {
              if (e.getDegree() < t.getDegree()) {
                let C = e;
                ((e = t), (t = C));
              }
              let s = e,
                o = t,
                a = this.field.getZero(),
                c = this.field.getOne();
              for (; o.getDegree() >= Math.round(r / 2);) {
                let C = s,
                  S = a;
                if (((s = o), (a = c), s.isZero()))
                  throw D.getChecksumInstance();
                o = C;
                let v = this.field.getZero(),
                  N = s.getCoefficient(s.getDegree()),
                  O = this.field.inverse(N);
                for (; o.getDegree() >= s.getDegree() && !o.isZero();) {
                  let U = o.getDegree() - s.getDegree(),
                    q = this.field.multiply(o.getCoefficient(o.getDegree()), O);
                  ((v = v.add(this.field.buildMonomial(U, q))),
                    (o = o.subtract(s.multiplyByMonomial(U, q))));
                }
                c = v.multiply(a).subtract(S).negative();
              }
              let d = c.getCoefficient(0);
              if (d === 0) throw D.getChecksumInstance();
              let f = this.field.inverse(d),
                x = c.multiply(f),
                m = o.multiply(f);
              return [x, m];
            }
            findErrorLocations(e) {
              let t = e.getDegree(),
                r = new Int32Array(t),
                s = 0;
              for (let o = 1; o < this.field.getSize() && s < t; o++)
                e.evaluateAt(o) === 0 && ((r[s] = this.field.inverse(o)), s++);
              if (s !== t) throw D.getChecksumInstance();
              return r;
            }
            findErrorMagnitudes(e, t, r) {
              let s = t.getDegree(),
                o = new Int32Array(s);
              for (let f = 1; f <= s; f++)
                o[s - f] = this.field.multiply(f, t.getCoefficient(f));
              let a = new mt(this.field, o),
                c = r.length,
                d = new Int32Array(c);
              for (let f = 0; f < c; f++) {
                let x = this.field.inverse(r[f]),
                  m = this.field.subtract(0, e.evaluateAt(x)),
                  C = this.field.inverse(a.evaluateAt(x));
                d[f] = this.field.multiply(m, C);
              }
              return d;
            }
          }
          class $r {
            constructor(e, t, r, s, o) {
              e instanceof $r
                ? this.constructor_2(e)
                : this.constructor_1(e, t, r, s, o);
            }
            constructor_1(e, t, r, s, o) {
              const a = t == null || r == null,
                c = s == null || o == null;
              if (a && c) throw new k();
              (a
                ? ((t = new de(0, s.getY())), (r = new de(0, o.getY())))
                : c &&
                  ((s = new de(e.getWidth() - 1, t.getY())),
                  (o = new de(e.getWidth() - 1, r.getY()))),
                (this.image = e),
                (this.topLeft = t),
                (this.bottomLeft = r),
                (this.topRight = s),
                (this.bottomRight = o),
                (this.minX = Math.trunc(Math.min(t.getX(), r.getX()))),
                (this.maxX = Math.trunc(Math.max(s.getX(), o.getX()))),
                (this.minY = Math.trunc(Math.min(t.getY(), s.getY()))),
                (this.maxY = Math.trunc(Math.max(r.getY(), o.getY()))));
            }
            constructor_2(e) {
              ((this.image = e.image),
                (this.topLeft = e.getTopLeft()),
                (this.bottomLeft = e.getBottomLeft()),
                (this.topRight = e.getTopRight()),
                (this.bottomRight = e.getBottomRight()),
                (this.minX = e.getMinX()),
                (this.maxX = e.getMaxX()),
                (this.minY = e.getMinY()),
                (this.maxY = e.getMaxY()));
            }
            static merge(e, t) {
              return e == null
                ? t
                : t == null
                  ? e
                  : new $r(
                      e.image,
                      e.topLeft,
                      e.bottomLeft,
                      t.topRight,
                      t.bottomRight,
                    );
            }
            addMissingRows(e, t, r) {
              let s = this.topLeft,
                o = this.bottomLeft,
                a = this.topRight,
                c = this.bottomRight;
              if (e > 0) {
                let d = r ? this.topLeft : this.topRight,
                  f = Math.trunc(d.getY() - e);
                f < 0 && (f = 0);
                let x = new de(d.getX(), f);
                r ? (s = x) : (a = x);
              }
              if (t > 0) {
                let d = r ? this.bottomLeft : this.bottomRight,
                  f = Math.trunc(d.getY() + t);
                f >= this.image.getHeight() && (f = this.image.getHeight() - 1);
                let x = new de(d.getX(), f);
                r ? (o = x) : (c = x);
              }
              return new $r(this.image, s, o, a, c);
            }
            getMinX() {
              return this.minX;
            }
            getMaxX() {
              return this.maxX;
            }
            getMinY() {
              return this.minY;
            }
            getMaxY() {
              return this.maxY;
            }
            getTopLeft() {
              return this.topLeft;
            }
            getTopRight() {
              return this.topRight;
            }
            getBottomLeft() {
              return this.bottomLeft;
            }
            getBottomRight() {
              return this.bottomRight;
            }
          }
          class o1 {
            constructor(e, t, r, s) {
              ((this.columnCount = e),
                (this.errorCorrectionLevel = s),
                (this.rowCountUpperPart = t),
                (this.rowCountLowerPart = r),
                (this.rowCount = t + r));
            }
            getColumnCount() {
              return this.columnCount;
            }
            getErrorCorrectionLevel() {
              return this.errorCorrectionLevel;
            }
            getRowCount() {
              return this.rowCount;
            }
            getRowCountUpperPart() {
              return this.rowCountUpperPart;
            }
            getRowCountLowerPart() {
              return this.rowCountLowerPart;
            }
          }
          class us {
            constructor() {
              this.buffer = '';
            }
            static form(e, t) {
              let r = -1;
              function s(a, c, d, f, x, m) {
                if (a === '%%') return '%';
                if (t[++r] === void 0) return;
                a = f ? parseInt(f.substr(1)) : void 0;
                let C = x ? parseInt(x.substr(1)) : void 0,
                  S;
                switch (m) {
                  case 's':
                    S = t[r];
                    break;
                  case 'c':
                    S = t[r][0];
                    break;
                  case 'f':
                    S = parseFloat(t[r]).toFixed(a);
                    break;
                  case 'p':
                    S = parseFloat(t[r]).toPrecision(a);
                    break;
                  case 'e':
                    S = parseFloat(t[r]).toExponential(a);
                    break;
                  case 'x':
                    S = parseInt(t[r]).toString(C || 16);
                    break;
                  case 'd':
                    S = parseFloat(
                      parseInt(t[r], C || 10).toPrecision(a),
                    ).toFixed(0);
                    break;
                }
                S = typeof S == 'object' ? JSON.stringify(S) : (+S).toString(C);
                let v = parseInt(d),
                  N = d && d[0] + '' == '0' ? '0' : ' ';
                for (; S.length < v;) S = c !== void 0 ? S + N : N + S;
                return S;
              }
              let o = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;
              return e.replace(o, s);
            }
            format(e, ...t) {
              this.buffer += us.form(e, t);
            }
            toString() {
              return this.buffer;
            }
          }
          class ds {
            constructor(e) {
              ((this.boundingBox = new $r(e)),
                (this.codewords = new Array(e.getMaxY() - e.getMinY() + 1)));
            }
            getCodewordNearby(e) {
              let t = this.getCodeword(e);
              if (t != null) return t;
              for (let r = 1; r < ds.MAX_NEARBY_DISTANCE; r++) {
                let s = this.imageRowToCodewordIndex(e) - r;
                if (
                  (s >= 0 && ((t = this.codewords[s]), t != null)) ||
                  ((s = this.imageRowToCodewordIndex(e) + r),
                  s < this.codewords.length &&
                    ((t = this.codewords[s]), t != null))
                )
                  return t;
              }
              return null;
            }
            imageRowToCodewordIndex(e) {
              return e - this.boundingBox.getMinY();
            }
            setCodeword(e, t) {
              this.codewords[this.imageRowToCodewordIndex(e)] = t;
            }
            getCodeword(e) {
              return this.codewords[this.imageRowToCodewordIndex(e)];
            }
            getBoundingBox() {
              return this.boundingBox;
            }
            getCodewords() {
              return this.codewords;
            }
            toString() {
              const e = new us();
              let t = 0;
              for (const r of this.codewords) {
                if (r == null) {
                  e.format('%3d:    |   %n', t++);
                  continue;
                }
                e.format('%3d: %3d|%3d%n', t++, r.getRowNumber(), r.getValue());
              }
              return e.toString();
            }
          }
          ds.MAX_NEARBY_DISTANCE = 5;
          class fs {
            constructor() {
              this.values = new Map();
            }
            setValue(e) {
              e = Math.trunc(e);
              let t = this.values.get(e);
              (t == null && (t = 0), t++, this.values.set(e, t));
            }
            getValue() {
              let e = -1,
                t = new Array();
              for (const [r, s] of this.values.entries()) {
                const o = { getKey: () => r, getValue: () => s };
                o.getValue() > e
                  ? ((e = o.getValue()), (t = []), t.push(o.getKey()))
                  : o.getValue() === e && t.push(o.getKey());
              }
              return me.toIntArray(t);
            }
            getConfidence(e) {
              return this.values.get(e);
            }
          }
          class la extends ds {
            constructor(e, t) {
              (super(e), (this._isLeft = t));
            }
            setRowNumbers() {
              for (let e of this.getCodewords())
                e != null && e.setRowNumberAsRowIndicatorColumn();
            }
            adjustCompleteIndicatorColumnRowNumbers(e) {
              let t = this.getCodewords();
              (this.setRowNumbers(), this.removeIncorrectCodewords(t, e));
              let r = this.getBoundingBox(),
                s = this._isLeft ? r.getTopLeft() : r.getTopRight(),
                o = this._isLeft ? r.getBottomLeft() : r.getBottomRight(),
                a = this.imageRowToCodewordIndex(Math.trunc(s.getY())),
                c = this.imageRowToCodewordIndex(Math.trunc(o.getY())),
                d = -1,
                f = 1,
                x = 0;
              for (let m = a; m < c; m++) {
                if (t[m] == null) continue;
                let C = t[m],
                  S = C.getRowNumber() - d;
                if (S === 0) x++;
                else if (S === 1)
                  ((f = Math.max(f, x)), (x = 1), (d = C.getRowNumber()));
                else if (S < 0 || C.getRowNumber() >= e.getRowCount() || S > m)
                  t[m] = null;
                else {
                  let v;
                  f > 2 ? (v = (f - 2) * S) : (v = S);
                  let N = v >= m;
                  for (let O = 1; O <= v && !N; O++) N = t[m - O] != null;
                  N ? (t[m] = null) : ((d = C.getRowNumber()), (x = 1));
                }
              }
            }
            getRowHeights() {
              let e = this.getBarcodeMetadata();
              if (e == null) return null;
              this.adjustIncompleteIndicatorColumnRowNumbers(e);
              let t = new Int32Array(e.getRowCount());
              for (let r of this.getCodewords())
                if (r != null) {
                  let s = r.getRowNumber();
                  if (s >= t.length) continue;
                  t[s]++;
                }
              return t;
            }
            adjustIncompleteIndicatorColumnRowNumbers(e) {
              let t = this.getBoundingBox(),
                r = this._isLeft ? t.getTopLeft() : t.getTopRight(),
                s = this._isLeft ? t.getBottomLeft() : t.getBottomRight(),
                o = this.imageRowToCodewordIndex(Math.trunc(r.getY())),
                a = this.imageRowToCodewordIndex(Math.trunc(s.getY())),
                c = this.getCodewords(),
                d = -1;
              for (let f = o; f < a; f++) {
                if (c[f] == null) continue;
                let x = c[f];
                x.setRowNumberAsRowIndicatorColumn();
                let m = x.getRowNumber() - d;
                m === 0 ||
                  (m === 1
                    ? (d = x.getRowNumber())
                    : x.getRowNumber() >= e.getRowCount()
                      ? (c[f] = null)
                      : (d = x.getRowNumber()));
              }
            }
            getBarcodeMetadata() {
              let e = this.getCodewords(),
                t = new fs(),
                r = new fs(),
                s = new fs(),
                o = new fs();
              for (let c of e) {
                if (c == null) continue;
                c.setRowNumberAsRowIndicatorColumn();
                let d = c.getValue() % 30,
                  f = c.getRowNumber();
                switch ((this._isLeft || (f += 2), f % 3)) {
                  case 0:
                    r.setValue(d * 3 + 1);
                    break;
                  case 1:
                    (o.setValue(d / 3), s.setValue(d % 3));
                    break;
                  case 2:
                    t.setValue(d + 1);
                    break;
                }
              }
              if (
                t.getValue().length === 0 ||
                r.getValue().length === 0 ||
                s.getValue().length === 0 ||
                o.getValue().length === 0 ||
                t.getValue()[0] < 1 ||
                r.getValue()[0] + s.getValue()[0] < me.MIN_ROWS_IN_BARCODE ||
                r.getValue()[0] + s.getValue()[0] > me.MAX_ROWS_IN_BARCODE
              )
                return null;
              let a = new o1(
                t.getValue()[0],
                r.getValue()[0],
                s.getValue()[0],
                o.getValue()[0],
              );
              return (this.removeIncorrectCodewords(e, a), a);
            }
            removeIncorrectCodewords(e, t) {
              for (let r = 0; r < e.length; r++) {
                let s = e[r];
                if (e[r] == null) continue;
                let o = s.getValue() % 30,
                  a = s.getRowNumber();
                if (a > t.getRowCount()) {
                  e[r] = null;
                  continue;
                }
                switch ((this._isLeft || (a += 2), a % 3)) {
                  case 0:
                    o * 3 + 1 !== t.getRowCountUpperPart() && (e[r] = null);
                    break;
                  case 1:
                    (Math.trunc(o / 3) !== t.getErrorCorrectionLevel() ||
                      o % 3 !== t.getRowCountLowerPart()) &&
                      (e[r] = null);
                    break;
                  case 2:
                    o + 1 !== t.getColumnCount() && (e[r] = null);
                    break;
                }
              }
            }
            isLeft() {
              return this._isLeft;
            }
            toString() {
              return (
                'IsLeft: ' +
                this._isLeft +
                `
` +
                super.toString()
              );
            }
          }
          class hs {
            constructor(e, t) {
              ((this.ADJUST_ROW_NUMBER_SKIP = 2),
                (this.barcodeMetadata = e),
                (this.barcodeColumnCount = e.getColumnCount()),
                (this.boundingBox = t),
                (this.detectionResultColumns = new Array(
                  this.barcodeColumnCount + 2,
                )));
            }
            getDetectionResultColumns() {
              (this.adjustIndicatorColumnRowNumbers(
                this.detectionResultColumns[0],
              ),
                this.adjustIndicatorColumnRowNumbers(
                  this.detectionResultColumns[this.barcodeColumnCount + 1],
                ));
              let e = me.MAX_CODEWORDS_IN_BARCODE,
                t;
              do ((t = e), (e = this.adjustRowNumbersAndGetCount()));
              while (e > 0 && e < t);
              return this.detectionResultColumns;
            }
            adjustIndicatorColumnRowNumbers(e) {
              e != null &&
                e.adjustCompleteIndicatorColumnRowNumbers(this.barcodeMetadata);
            }
            adjustRowNumbersAndGetCount() {
              let e = this.adjustRowNumbersByRow();
              if (e === 0) return 0;
              for (let t = 1; t < this.barcodeColumnCount + 1; t++) {
                let r = this.detectionResultColumns[t].getCodewords();
                for (let s = 0; s < r.length; s++)
                  r[s] != null &&
                    (r[s].hasValidRowNumber() ||
                      this.adjustRowNumbers(t, s, r));
              }
              return e;
            }
            adjustRowNumbersByRow() {
              return (
                this.adjustRowNumbersFromBothRI(),
                this.adjustRowNumbersFromLRI() + this.adjustRowNumbersFromRRI()
              );
            }
            adjustRowNumbersFromBothRI() {
              if (
                this.detectionResultColumns[0] == null ||
                this.detectionResultColumns[this.barcodeColumnCount + 1] == null
              )
                return;
              let e = this.detectionResultColumns[0].getCodewords(),
                t =
                  this.detectionResultColumns[
                    this.barcodeColumnCount + 1
                  ].getCodewords();
              for (let r = 0; r < e.length; r++)
                if (
                  e[r] != null &&
                  t[r] != null &&
                  e[r].getRowNumber() === t[r].getRowNumber()
                )
                  for (let s = 1; s <= this.barcodeColumnCount; s++) {
                    let o = this.detectionResultColumns[s].getCodewords()[r];
                    o != null &&
                      (o.setRowNumber(e[r].getRowNumber()),
                      o.hasValidRowNumber() ||
                        (this.detectionResultColumns[s].getCodewords()[r] =
                          null));
                  }
            }
            adjustRowNumbersFromRRI() {
              if (
                this.detectionResultColumns[this.barcodeColumnCount + 1] == null
              )
                return 0;
              let e = 0,
                t =
                  this.detectionResultColumns[
                    this.barcodeColumnCount + 1
                  ].getCodewords();
              for (let r = 0; r < t.length; r++) {
                if (t[r] == null) continue;
                let s = t[r].getRowNumber(),
                  o = 0;
                for (
                  let a = this.barcodeColumnCount + 1;
                  a > 0 && o < this.ADJUST_ROW_NUMBER_SKIP;
                  a--
                ) {
                  let c = this.detectionResultColumns[a].getCodewords()[r];
                  c != null &&
                    ((o = hs.adjustRowNumberIfValid(s, o, c)),
                    c.hasValidRowNumber() || e++);
                }
              }
              return e;
            }
            adjustRowNumbersFromLRI() {
              if (this.detectionResultColumns[0] == null) return 0;
              let e = 0,
                t = this.detectionResultColumns[0].getCodewords();
              for (let r = 0; r < t.length; r++) {
                if (t[r] == null) continue;
                let s = t[r].getRowNumber(),
                  o = 0;
                for (
                  let a = 1;
                  a < this.barcodeColumnCount + 1 &&
                  o < this.ADJUST_ROW_NUMBER_SKIP;
                  a++
                ) {
                  let c = this.detectionResultColumns[a].getCodewords()[r];
                  c != null &&
                    ((o = hs.adjustRowNumberIfValid(s, o, c)),
                    c.hasValidRowNumber() || e++);
                }
              }
              return e;
            }
            static adjustRowNumberIfValid(e, t, r) {
              return (
                r == null ||
                  r.hasValidRowNumber() ||
                  (r.isValidRowNumber(e) ? (r.setRowNumber(e), (t = 0)) : ++t),
                t
              );
            }
            adjustRowNumbers(e, t, r) {
              if (!this.detectionResultColumns[e - 1]) return;
              let s = r[t],
                o = this.detectionResultColumns[e - 1].getCodewords(),
                a = o;
              this.detectionResultColumns[e + 1] != null &&
                (a = this.detectionResultColumns[e + 1].getCodewords());
              let c = new Array(14);
              ((c[2] = o[t]),
                (c[3] = a[t]),
                t > 0 &&
                  ((c[0] = r[t - 1]), (c[4] = o[t - 1]), (c[5] = a[t - 1])),
                t > 1 &&
                  ((c[8] = r[t - 2]), (c[10] = o[t - 2]), (c[11] = a[t - 2])),
                t < r.length - 1 &&
                  ((c[1] = r[t + 1]), (c[6] = o[t + 1]), (c[7] = a[t + 1])),
                t < r.length - 2 &&
                  ((c[9] = r[t + 2]), (c[12] = o[t + 2]), (c[13] = a[t + 2])));
              for (let d of c) if (hs.adjustRowNumber(s, d)) return;
            }
            static adjustRowNumber(e, t) {
              return t == null
                ? !1
                : t.hasValidRowNumber() && t.getBucket() === e.getBucket()
                  ? (e.setRowNumber(t.getRowNumber()), !0)
                  : !1;
            }
            getBarcodeColumnCount() {
              return this.barcodeColumnCount;
            }
            getBarcodeRowCount() {
              return this.barcodeMetadata.getRowCount();
            }
            getBarcodeECLevel() {
              return this.barcodeMetadata.getErrorCorrectionLevel();
            }
            setBoundingBox(e) {
              this.boundingBox = e;
            }
            getBoundingBox() {
              return this.boundingBox;
            }
            setDetectionResultColumn(e, t) {
              this.detectionResultColumns[e] = t;
            }
            getDetectionResultColumn(e) {
              return this.detectionResultColumns[e];
            }
            toString() {
              let e = this.detectionResultColumns[0];
              e == null &&
                (e = this.detectionResultColumns[this.barcodeColumnCount + 1]);
              let t = new us();
              for (let r = 0; r < e.getCodewords().length; r++) {
                t.format('CW %3d:', r);
                for (let s = 0; s < this.barcodeColumnCount + 2; s++) {
                  if (this.detectionResultColumns[s] == null) {
                    t.format('    |   ');
                    continue;
                  }
                  let o = this.detectionResultColumns[s].getCodewords()[r];
                  if (o == null) {
                    t.format('    |   ');
                    continue;
                  }
                  t.format(' %3d|%3d', o.getRowNumber(), o.getValue());
                }
                t.format('%n');
              }
              return t.toString();
            }
          }
          class gs {
            constructor(e, t, r, s) {
              ((this.rowNumber = gs.BARCODE_ROW_UNKNOWN),
                (this.startX = Math.trunc(e)),
                (this.endX = Math.trunc(t)),
                (this.bucket = Math.trunc(r)),
                (this.value = Math.trunc(s)));
            }
            hasValidRowNumber() {
              return this.isValidRowNumber(this.rowNumber);
            }
            isValidRowNumber(e) {
              return (
                e !== gs.BARCODE_ROW_UNKNOWN && this.bucket === (e % 3) * 3
              );
            }
            setRowNumberAsRowIndicatorColumn() {
              this.rowNumber = Math.trunc(
                Math.trunc(this.value / 30) * 3 + Math.trunc(this.bucket / 3),
              );
            }
            getWidth() {
              return this.endX - this.startX;
            }
            getStartX() {
              return this.startX;
            }
            getEndX() {
              return this.endX;
            }
            getBucket() {
              return this.bucket;
            }
            getValue() {
              return this.value;
            }
            getRowNumber() {
              return this.rowNumber;
            }
            setRowNumber(e) {
              this.rowNumber = e;
            }
            toString() {
              return this.rowNumber + '|' + this.value;
            }
          }
          gs.BARCODE_ROW_UNKNOWN = -1;
          class Dt {
            static initialize() {
              for (let e = 0; e < me.SYMBOL_TABLE.length; e++) {
                let t = me.SYMBOL_TABLE[e],
                  r = t & 1;
                for (let s = 0; s < me.BARS_IN_MODULE; s++) {
                  let o = 0;
                  for (; (t & 1) === r;) ((o += 1), (t >>= 1));
                  ((r = t & 1),
                    Dt.RATIOS_TABLE[e] ||
                      (Dt.RATIOS_TABLE[e] = new Array(me.BARS_IN_MODULE)),
                    (Dt.RATIOS_TABLE[e][me.BARS_IN_MODULE - s - 1] =
                      Math.fround(o / me.MODULES_IN_CODEWORD)));
                }
              }
              this.bSymbolTableReady = !0;
            }
            static getDecodedValue(e) {
              let t = Dt.getDecodedCodewordValue(Dt.sampleBitCounts(e));
              return t !== -1 ? t : Dt.getClosestDecodedValue(e);
            }
            static sampleBitCounts(e) {
              let t = Ne.sum(e),
                r = new Int32Array(me.BARS_IN_MODULE),
                s = 0,
                o = 0;
              for (let a = 0; a < me.MODULES_IN_CODEWORD; a++) {
                let c =
                  t / (2 * me.MODULES_IN_CODEWORD) +
                  (a * t) / me.MODULES_IN_CODEWORD;
                (o + e[s] <= c && ((o += e[s]), s++), r[s]++);
              }
              return r;
            }
            static getDecodedCodewordValue(e) {
              let t = Dt.getBitValue(e);
              return me.getCodeword(t) === -1 ? -1 : t;
            }
            static getBitValue(e) {
              let t = 0;
              for (let r = 0; r < e.length; r++)
                for (let s = 0; s < e[r]; s++)
                  t = (t << 1) | (r % 2 === 0 ? 1 : 0);
              return Math.trunc(t);
            }
            static getClosestDecodedValue(e) {
              let t = Ne.sum(e),
                r = new Array(me.BARS_IN_MODULE);
              if (t > 1)
                for (let a = 0; a < r.length; a++) r[a] = Math.fround(e[a] / t);
              let s = ri.MAX_VALUE,
                o = -1;
              this.bSymbolTableReady || Dt.initialize();
              for (let a = 0; a < Dt.RATIOS_TABLE.length; a++) {
                let c = 0,
                  d = Dt.RATIOS_TABLE[a];
                for (let f = 0; f < me.BARS_IN_MODULE; f++) {
                  let x = Math.fround(d[f] - r[f]);
                  if (((c += Math.fround(x * x)), c >= s)) break;
                }
                c < s && ((s = c), (o = me.SYMBOL_TABLE[a]));
              }
              return o;
            }
          }
          ((Dt.bSymbolTableReady = !1),
            (Dt.RATIOS_TABLE = new Array(me.SYMBOL_TABLE.length).map(
              (A) => new Array(me.BARS_IN_MODULE),
            )));
          class ca {
            constructor() {
              ((this.segmentCount = -1),
                (this.fileSize = -1),
                (this.timestamp = -1),
                (this.checksum = -1));
            }
            getSegmentIndex() {
              return this.segmentIndex;
            }
            setSegmentIndex(e) {
              this.segmentIndex = e;
            }
            getFileId() {
              return this.fileId;
            }
            setFileId(e) {
              this.fileId = e;
            }
            getOptionalData() {
              return this.optionalData;
            }
            setOptionalData(e) {
              this.optionalData = e;
            }
            isLastSegment() {
              return this.lastSegment;
            }
            setLastSegment(e) {
              this.lastSegment = e;
            }
            getSegmentCount() {
              return this.segmentCount;
            }
            setSegmentCount(e) {
              this.segmentCount = e;
            }
            getSender() {
              return this.sender || null;
            }
            setSender(e) {
              this.sender = e;
            }
            getAddressee() {
              return this.addressee || null;
            }
            setAddressee(e) {
              this.addressee = e;
            }
            getFileName() {
              return this.fileName;
            }
            setFileName(e) {
              this.fileName = e;
            }
            getFileSize() {
              return this.fileSize;
            }
            setFileSize(e) {
              this.fileSize = e;
            }
            getChecksum() {
              return this.checksum;
            }
            setChecksum(e) {
              this.checksum = e;
            }
            getTimestamp() {
              return this.timestamp;
            }
            setTimestamp(e) {
              this.timestamp = e;
            }
          }
          class ua {
            static parseLong(e, t = void 0) {
              return parseInt(e, t);
            }
          }
          class da extends p {}
          da.kind = 'NullPointerException';
          class a1 {
            writeBytes(e) {
              this.writeBytesOffset(e, 0, e.length);
            }
            writeBytesOffset(e, t, r) {
              if (e == null) throw new da();
              if (
                t < 0 ||
                t > e.length ||
                r < 0 ||
                t + r > e.length ||
                t + r < 0
              )
                throw new X();
              if (r === 0) return;
              for (let s = 0; s < r; s++) this.write(e[t + s]);
            }
            flush() {}
            close() {}
          }
          class l1 extends p {}
          class c1 extends a1 {
            constructor(e = 32) {
              if ((super(), (this.count = 0), e < 0))
                throw new T('Negative initial size: ' + e);
              this.buf = new Uint8Array(e);
            }
            ensureCapacity(e) {
              e - this.buf.length > 0 && this.grow(e);
            }
            grow(e) {
              let r = this.buf.length << 1;
              if ((r - e < 0 && (r = e), r < 0)) {
                if (e < 0) throw new l1();
                r = H.MAX_VALUE;
              }
              this.buf = J.copyOfUint8Array(this.buf, r);
            }
            write(e) {
              (this.ensureCapacity(this.count + 1),
                (this.buf[this.count] = e),
                (this.count += 1));
            }
            writeBytesOffset(e, t, r) {
              if (t < 0 || t > e.length || r < 0 || t + r - e.length > 0)
                throw new X();
              (this.ensureCapacity(this.count + r),
                M.arraycopy(e, t, this.buf, this.count, r),
                (this.count += r));
            }
            writeTo(e) {
              e.writeBytesOffset(this.buf, 0, this.count);
            }
            reset() {
              this.count = 0;
            }
            toByteArray() {
              return J.copyOfUint8Array(this.buf, this.count);
            }
            size() {
              return this.count;
            }
            toString(e) {
              return e
                ? typeof e == 'string'
                  ? this.toString_string(e)
                  : this.toString_number(e)
                : this.toString_void();
            }
            toString_void() {
              return new String(this.buf).toString();
            }
            toString_string(e) {
              return new String(this.buf).toString();
            }
            toString_number(e) {
              return new String(this.buf).toString();
            }
            close() {}
          }
          var Be;
          (function (A) {
            ((A[(A.ALPHA = 0)] = 'ALPHA'),
              (A[(A.LOWER = 1)] = 'LOWER'),
              (A[(A.MIXED = 2)] = 'MIXED'),
              (A[(A.PUNCT = 3)] = 'PUNCT'),
              (A[(A.ALPHA_SHIFT = 4)] = 'ALPHA_SHIFT'),
              (A[(A.PUNCT_SHIFT = 5)] = 'PUNCT_SHIFT'));
          })(Be || (Be = {}));
          function fa() {
            if (typeof window < 'u') return window.BigInt || null;
            if (typeof xi < 'u') return xi.BigInt || null;
            if (typeof self < 'u') return self.BigInt || null;
            throw new Error("Can't search globals for BigInt!");
          }
          let ci;
          function Lr(A) {
            if ((typeof ci > 'u' && (ci = fa()), ci === null))
              throw new Error('BigInt is not supported!');
            return ci(A);
          }
          function u1() {
            let A = [];
            A[0] = Lr(1);
            let e = Lr(900);
            A[1] = e;
            for (let t = 2; t < 16; t++) A[t] = A[t - 1] * e;
            return A;
          }
          class F {
            static decode(e, t) {
              let r = new $(''),
                s = L.ISO8859_1;
              r.enableDecoding(s);
              let o = 1,
                a = e[o++],
                c = new ca();
              for (; o < e[0];) {
                switch (a) {
                  case F.TEXT_COMPACTION_MODE_LATCH:
                    o = F.textCompaction(e, o, r);
                    break;
                  case F.BYTE_COMPACTION_MODE_LATCH:
                  case F.BYTE_COMPACTION_MODE_LATCH_6:
                    o = F.byteCompaction(a, e, s, o, r);
                    break;
                  case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                    r.append(e[o++]);
                    break;
                  case F.NUMERIC_COMPACTION_MODE_LATCH:
                    o = F.numericCompaction(e, o, r);
                    break;
                  case F.ECI_CHARSET:
                    L.getCharacterSetECIByValue(e[o++]);
                    break;
                  case F.ECI_GENERAL_PURPOSE:
                    o += 2;
                    break;
                  case F.ECI_USER_DEFINED:
                    o++;
                    break;
                  case F.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
                    o = F.decodeMacroBlock(e, o, c);
                    break;
                  case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                  case F.MACRO_PDF417_TERMINATOR:
                    throw new Q();
                  default:
                    (o--, (o = F.textCompaction(e, o, r)));
                    break;
                }
                if (o < e.length) a = e[o++];
                else throw Q.getFormatInstance();
              }
              if (r.length() === 0) throw Q.getFormatInstance();
              let d = new ze(null, r.toString(), null, t);
              return (d.setOther(c), d);
            }
            static decodeMacroBlock(e, t, r) {
              if (t + F.NUMBER_OF_SEQUENCE_CODEWORDS > e[0])
                throw Q.getFormatInstance();
              let s = new Int32Array(F.NUMBER_OF_SEQUENCE_CODEWORDS);
              for (let c = 0; c < F.NUMBER_OF_SEQUENCE_CODEWORDS; c++, t++)
                s[c] = e[t];
              r.setSegmentIndex(
                H.parseInt(
                  F.decodeBase900toBase10(s, F.NUMBER_OF_SEQUENCE_CODEWORDS),
                ),
              );
              let o = new $();
              ((t = F.textCompaction(e, t, o)), r.setFileId(o.toString()));
              let a = -1;
              for (
                e[t] === F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD && (a = t + 1);
                t < e[0];
              )
                switch (e[t]) {
                  case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                    switch ((t++, e[t])) {
                      case F.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME:
                        let c = new $();
                        ((t = F.textCompaction(e, t + 1, c)),
                          r.setFileName(c.toString()));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_SENDER:
                        let d = new $();
                        ((t = F.textCompaction(e, t + 1, d)),
                          r.setSender(d.toString()));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE:
                        let f = new $();
                        ((t = F.textCompaction(e, t + 1, f)),
                          r.setAddressee(f.toString()));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT:
                        let x = new $();
                        ((t = F.numericCompaction(e, t + 1, x)),
                          r.setSegmentCount(H.parseInt(x.toString())));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP:
                        let m = new $();
                        ((t = F.numericCompaction(e, t + 1, m)),
                          r.setTimestamp(ua.parseLong(m.toString())));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM:
                        let C = new $();
                        ((t = F.numericCompaction(e, t + 1, C)),
                          r.setChecksum(H.parseInt(C.toString())));
                        break;
                      case F.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE:
                        let S = new $();
                        ((t = F.numericCompaction(e, t + 1, S)),
                          r.setFileSize(ua.parseLong(S.toString())));
                        break;
                      default:
                        throw Q.getFormatInstance();
                    }
                    break;
                  case F.MACRO_PDF417_TERMINATOR:
                    (t++, r.setLastSegment(!0));
                    break;
                  default:
                    throw Q.getFormatInstance();
                }
              if (a !== -1) {
                let c = t - a;
                (r.isLastSegment() && c--,
                  r.setOptionalData(J.copyOfRange(e, a, a + c)));
              }
              return t;
            }
            static textCompaction(e, t, r) {
              let s = new Int32Array((e[0] - t) * 2),
                o = new Int32Array((e[0] - t) * 2),
                a = 0,
                c = !1;
              for (; t < e[0] && !c;) {
                let d = e[t++];
                if (d < F.TEXT_COMPACTION_MODE_LATCH)
                  ((s[a] = d / 30), (s[a + 1] = d % 30), (a += 2));
                else
                  switch (d) {
                    case F.TEXT_COMPACTION_MODE_LATCH:
                      s[a++] = F.TEXT_COMPACTION_MODE_LATCH;
                      break;
                    case F.BYTE_COMPACTION_MODE_LATCH:
                    case F.BYTE_COMPACTION_MODE_LATCH_6:
                    case F.NUMERIC_COMPACTION_MODE_LATCH:
                    case F.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
                    case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                    case F.MACRO_PDF417_TERMINATOR:
                      (t--, (c = !0));
                      break;
                    case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                      ((s[a] = F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE),
                        (d = e[t++]),
                        (o[a] = d),
                        a++);
                      break;
                  }
              }
              return (F.decodeTextCompaction(s, o, a, r), t);
            }
            static decodeTextCompaction(e, t, r, s) {
              let o = Be.ALPHA,
                a = Be.ALPHA,
                c = 0;
              for (; c < r;) {
                let d = e[c],
                  f = '';
                switch (o) {
                  case Be.ALPHA:
                    if (d < 26) f = String.fromCharCode(65 + d);
                    else
                      switch (d) {
                        case 26:
                          f = ' ';
                          break;
                        case F.LL:
                          o = Be.LOWER;
                          break;
                        case F.ML:
                          o = Be.MIXED;
                          break;
                        case F.PS:
                          ((a = o), (o = Be.PUNCT_SHIFT));
                          break;
                        case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                          s.append(t[c]);
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                  case Be.LOWER:
                    if (d < 26) f = String.fromCharCode(97 + d);
                    else
                      switch (d) {
                        case 26:
                          f = ' ';
                          break;
                        case F.AS:
                          ((a = o), (o = Be.ALPHA_SHIFT));
                          break;
                        case F.ML:
                          o = Be.MIXED;
                          break;
                        case F.PS:
                          ((a = o), (o = Be.PUNCT_SHIFT));
                          break;
                        case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                          s.append(t[c]);
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                  case Be.MIXED:
                    if (d < F.PL) f = F.MIXED_CHARS[d];
                    else
                      switch (d) {
                        case F.PL:
                          o = Be.PUNCT;
                          break;
                        case 26:
                          f = ' ';
                          break;
                        case F.LL:
                          o = Be.LOWER;
                          break;
                        case F.AL:
                          o = Be.ALPHA;
                          break;
                        case F.PS:
                          ((a = o), (o = Be.PUNCT_SHIFT));
                          break;
                        case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                          s.append(t[c]);
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                  case Be.PUNCT:
                    if (d < F.PAL) f = F.PUNCT_CHARS[d];
                    else
                      switch (d) {
                        case F.PAL:
                          o = Be.ALPHA;
                          break;
                        case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                          s.append(t[c]);
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                  case Be.ALPHA_SHIFT:
                    if (((o = a), d < 26)) f = String.fromCharCode(65 + d);
                    else
                      switch (d) {
                        case 26:
                          f = ' ';
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                  case Be.PUNCT_SHIFT:
                    if (((o = a), d < F.PAL)) f = F.PUNCT_CHARS[d];
                    else
                      switch (d) {
                        case F.PAL:
                          o = Be.ALPHA;
                          break;
                        case F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                          s.append(t[c]);
                          break;
                        case F.TEXT_COMPACTION_MODE_LATCH:
                          o = Be.ALPHA;
                          break;
                      }
                    break;
                }
                (f !== '' && s.append(f), c++);
              }
            }
            static byteCompaction(e, t, r, s, o) {
              let a = new c1(),
                c = 0,
                d = 0,
                f = !1;
              switch (e) {
                case F.BYTE_COMPACTION_MODE_LATCH:
                  let x = new Int32Array(6),
                    m = t[s++];
                  for (; s < t[0] && !f;)
                    switch (
                      ((x[c++] = m), (d = 900 * d + m), (m = t[s++]), m)
                    ) {
                      case F.TEXT_COMPACTION_MODE_LATCH:
                      case F.BYTE_COMPACTION_MODE_LATCH:
                      case F.NUMERIC_COMPACTION_MODE_LATCH:
                      case F.BYTE_COMPACTION_MODE_LATCH_6:
                      case F.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
                      case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                      case F.MACRO_PDF417_TERMINATOR:
                        (s--, (f = !0));
                        break;
                      default:
                        if (c % 5 === 0 && c > 0) {
                          for (let C = 0; C < 6; ++C)
                            a.write(Number(Lr(d) >> Lr(8 * (5 - C))));
                          ((d = 0), (c = 0));
                        }
                        break;
                    }
                  s === t[0] &&
                    m < F.TEXT_COMPACTION_MODE_LATCH &&
                    (x[c++] = m);
                  for (let C = 0; C < c; C++) a.write(x[C]);
                  break;
                case F.BYTE_COMPACTION_MODE_LATCH_6:
                  for (; s < t[0] && !f;) {
                    let C = t[s++];
                    if (C < F.TEXT_COMPACTION_MODE_LATCH)
                      (c++, (d = 900 * d + C));
                    else
                      switch (C) {
                        case F.TEXT_COMPACTION_MODE_LATCH:
                        case F.BYTE_COMPACTION_MODE_LATCH:
                        case F.NUMERIC_COMPACTION_MODE_LATCH:
                        case F.BYTE_COMPACTION_MODE_LATCH_6:
                        case F.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
                        case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                        case F.MACRO_PDF417_TERMINATOR:
                          (s--, (f = !0));
                          break;
                      }
                    if (c % 5 === 0 && c > 0) {
                      for (let S = 0; S < 6; ++S)
                        a.write(Number(Lr(d) >> Lr(8 * (5 - S))));
                      ((d = 0), (c = 0));
                    }
                  }
                  break;
              }
              return (o.append(xe.decode(a.toByteArray(), r)), s);
            }
            static numericCompaction(e, t, r) {
              let s = 0,
                o = !1,
                a = new Int32Array(F.MAX_NUMERIC_CODEWORDS);
              for (; t < e[0] && !o;) {
                let c = e[t++];
                if ((t === e[0] && (o = !0), c < F.TEXT_COMPACTION_MODE_LATCH))
                  ((a[s] = c), s++);
                else
                  switch (c) {
                    case F.TEXT_COMPACTION_MODE_LATCH:
                    case F.BYTE_COMPACTION_MODE_LATCH:
                    case F.BYTE_COMPACTION_MODE_LATCH_6:
                    case F.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
                    case F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
                    case F.MACRO_PDF417_TERMINATOR:
                      (t--, (o = !0));
                      break;
                  }
                (s % F.MAX_NUMERIC_CODEWORDS === 0 ||
                  c === F.NUMERIC_COMPACTION_MODE_LATCH ||
                  o) &&
                  s > 0 &&
                  (r.append(F.decodeBase900toBase10(a, s)), (s = 0));
              }
              return t;
            }
            static decodeBase900toBase10(e, t) {
              let r = Lr(0);
              for (let o = 0; o < t; o++) r += F.EXP900[t - o - 1] * Lr(e[o]);
              let s = r.toString();
              if (s.charAt(0) !== '1') throw new Q();
              return s.substring(1);
            }
          }
          ((F.TEXT_COMPACTION_MODE_LATCH = 900),
            (F.BYTE_COMPACTION_MODE_LATCH = 901),
            (F.NUMERIC_COMPACTION_MODE_LATCH = 902),
            (F.BYTE_COMPACTION_MODE_LATCH_6 = 924),
            (F.ECI_USER_DEFINED = 925),
            (F.ECI_GENERAL_PURPOSE = 926),
            (F.ECI_CHARSET = 927),
            (F.BEGIN_MACRO_PDF417_CONTROL_BLOCK = 928),
            (F.BEGIN_MACRO_PDF417_OPTIONAL_FIELD = 923),
            (F.MACRO_PDF417_TERMINATOR = 922),
            (F.MODE_SHIFT_TO_BYTE_COMPACTION_MODE = 913),
            (F.MAX_NUMERIC_CODEWORDS = 15),
            (F.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME = 0),
            (F.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT = 1),
            (F.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP = 2),
            (F.MACRO_PDF417_OPTIONAL_FIELD_SENDER = 3),
            (F.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE = 4),
            (F.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE = 5),
            (F.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM = 6),
            (F.PL = 25),
            (F.LL = 27),
            (F.AS = 27),
            (F.ML = 28),
            (F.AL = 28),
            (F.PS = 29),
            (F.PAL = 29),
            (F.PUNCT_CHARS = `;<>@[\\]_\`~!\r	,:
-.$/"|*()?{}'`),
            (F.MIXED_CHARS = '0123456789&\r	,:#-.$/+%*=^'),
            (F.EXP900 = fa() ? u1() : []),
            (F.NUMBER_OF_SEQUENCE_CODEWORDS = 2));
          class Ee {
            constructor() {}
            static decode(e, t, r, s, o, a, c) {
              let d = new $r(e, t, r, s, o),
                f = null,
                x = null,
                m;
              for (let v = !0; ; v = !1) {
                if (
                  (t != null &&
                    (f = Ee.getRowIndicatorColumn(e, d, t, !0, a, c)),
                  s != null &&
                    (x = Ee.getRowIndicatorColumn(e, d, s, !1, a, c)),
                  (m = Ee.merge(f, x)),
                  m == null)
                )
                  throw k.getNotFoundInstance();
                let N = m.getBoundingBox();
                if (
                  v &&
                  N != null &&
                  (N.getMinY() < d.getMinY() || N.getMaxY() > d.getMaxY())
                )
                  d = N;
                else break;
              }
              m.setBoundingBox(d);
              let C = m.getBarcodeColumnCount() + 1;
              (m.setDetectionResultColumn(0, f),
                m.setDetectionResultColumn(C, x));
              let S = f != null;
              for (let v = 1; v <= C; v++) {
                let N = S ? v : C - v;
                if (m.getDetectionResultColumn(N) !== void 0) continue;
                let O;
                (N === 0 || N === C
                  ? (O = new la(d, N === 0))
                  : (O = new ds(d)),
                  m.setDetectionResultColumn(N, O));
                let U = -1,
                  q = U;
                for (let Z = d.getMinY(); Z <= d.getMaxY(); Z++) {
                  if (
                    ((U = Ee.getStartColumn(m, N, Z, S)),
                    U < 0 || U > d.getMaxX())
                  ) {
                    if (q === -1) continue;
                    U = q;
                  }
                  let K = Ee.detectCodeword(
                    e,
                    d.getMinX(),
                    d.getMaxX(),
                    S,
                    U,
                    Z,
                    a,
                    c,
                  );
                  K != null &&
                    (O.setCodeword(Z, K),
                    (q = U),
                    (a = Math.min(a, K.getWidth())),
                    (c = Math.max(c, K.getWidth())));
                }
              }
              return Ee.createDecoderResult(m);
            }
            static merge(e, t) {
              if (e == null && t == null) return null;
              let r = Ee.getBarcodeMetadata(e, t);
              if (r == null) return null;
              let s = $r.merge(
                Ee.adjustBoundingBox(e),
                Ee.adjustBoundingBox(t),
              );
              return new hs(r, s);
            }
            static adjustBoundingBox(e) {
              if (e == null) return null;
              let t = e.getRowHeights();
              if (t == null) return null;
              let r = Ee.getMax(t),
                s = 0;
              for (let c of t) if (((s += r - c), c > 0)) break;
              let o = e.getCodewords();
              for (let c = 0; s > 0 && o[c] == null; c++) s--;
              let a = 0;
              for (
                let c = t.length - 1;
                c >= 0 && ((a += r - t[c]), !(t[c] > 0));
                c--
              );
              for (let c = o.length - 1; a > 0 && o[c] == null; c--) a--;
              return e.getBoundingBox().addMissingRows(s, a, e.isLeft());
            }
            static getMax(e) {
              let t = -1;
              for (let r of e) t = Math.max(t, r);
              return t;
            }
            static getBarcodeMetadata(e, t) {
              let r;
              if (e == null || (r = e.getBarcodeMetadata()) == null)
                return t == null ? null : t.getBarcodeMetadata();
              let s;
              return t == null || (s = t.getBarcodeMetadata()) == null
                ? r
                : r.getColumnCount() !== s.getColumnCount() &&
                    r.getErrorCorrectionLevel() !==
                      s.getErrorCorrectionLevel() &&
                    r.getRowCount() !== s.getRowCount()
                  ? null
                  : r;
            }
            static getRowIndicatorColumn(e, t, r, s, o, a) {
              let c = new la(t, s);
              for (let d = 0; d < 2; d++) {
                let f = d === 0 ? 1 : -1,
                  x = Math.trunc(Math.trunc(r.getX()));
                for (
                  let m = Math.trunc(Math.trunc(r.getY()));
                  m <= t.getMaxY() && m >= t.getMinY();
                  m += f
                ) {
                  let C = Ee.detectCodeword(e, 0, e.getWidth(), s, x, m, o, a);
                  C != null &&
                    (c.setCodeword(m, C),
                    s ? (x = C.getStartX()) : (x = C.getEndX()));
                }
              }
              return c;
            }
            static adjustCodewordCount(e, t) {
              let r = t[0][1],
                s = r.getValue(),
                o =
                  e.getBarcodeColumnCount() * e.getBarcodeRowCount() -
                  Ee.getNumberOfECCodeWords(e.getBarcodeECLevel());
              if (s.length === 0) {
                if (o < 1 || o > me.MAX_CODEWORDS_IN_BARCODE)
                  throw k.getNotFoundInstance();
                r.setValue(o);
              } else s[0] !== o && r.setValue(o);
            }
            static createDecoderResult(e) {
              let t = Ee.createBarcodeMatrix(e);
              Ee.adjustCodewordCount(e, t);
              let r = new Array(),
                s = new Int32Array(
                  e.getBarcodeRowCount() * e.getBarcodeColumnCount(),
                ),
                o = [],
                a = new Array();
              for (let d = 0; d < e.getBarcodeRowCount(); d++)
                for (let f = 0; f < e.getBarcodeColumnCount(); f++) {
                  let x = t[d][f + 1].getValue(),
                    m = d * e.getBarcodeColumnCount() + f;
                  x.length === 0
                    ? r.push(m)
                    : x.length === 1
                      ? (s[m] = x[0])
                      : (a.push(m), o.push(x));
                }
              let c = new Array(o.length);
              for (let d = 0; d < c.length; d++) c[d] = o[d];
              return Ee.createDecoderResultFromAmbiguousValues(
                e.getBarcodeECLevel(),
                s,
                me.toIntArray(r),
                me.toIntArray(a),
                c,
              );
            }
            static createDecoderResultFromAmbiguousValues(e, t, r, s, o) {
              let a = new Int32Array(s.length),
                c = 100;
              for (; c-- > 0;) {
                for (let d = 0; d < a.length; d++) t[s[d]] = o[d][a[d]];
                try {
                  return Ee.decodeCodewords(t, e, r);
                } catch (d) {
                  if (!(d instanceof D)) throw d;
                }
                if (a.length === 0) throw D.getChecksumInstance();
                for (let d = 0; d < a.length; d++)
                  if (a[d] < o[d].length - 1) {
                    a[d]++;
                    break;
                  } else if (((a[d] = 0), d === a.length - 1))
                    throw D.getChecksumInstance();
              }
              throw D.getChecksumInstance();
            }
            static createBarcodeMatrix(e) {
              let t = Array.from(
                { length: e.getBarcodeRowCount() },
                () => new Array(e.getBarcodeColumnCount() + 2),
              );
              for (let s = 0; s < t.length; s++)
                for (let o = 0; o < t[s].length; o++) t[s][o] = new fs();
              let r = 0;
              for (let s of e.getDetectionResultColumns()) {
                if (s != null) {
                  for (let o of s.getCodewords())
                    if (o != null) {
                      let a = o.getRowNumber();
                      if (a >= 0) {
                        if (a >= t.length) continue;
                        t[a][r].setValue(o.getValue());
                      }
                    }
                }
                r++;
              }
              return t;
            }
            static isValidBarcodeColumn(e, t) {
              return t >= 0 && t <= e.getBarcodeColumnCount() + 1;
            }
            static getStartColumn(e, t, r, s) {
              let o = s ? 1 : -1,
                a = null;
              if (
                (Ee.isValidBarcodeColumn(e, t - o) &&
                  (a = e.getDetectionResultColumn(t - o).getCodeword(r)),
                a != null)
              )
                return s ? a.getEndX() : a.getStartX();
              if (
                ((a = e.getDetectionResultColumn(t).getCodewordNearby(r)),
                a != null)
              )
                return s ? a.getStartX() : a.getEndX();
              if (
                (Ee.isValidBarcodeColumn(e, t - o) &&
                  (a = e.getDetectionResultColumn(t - o).getCodewordNearby(r)),
                a != null)
              )
                return s ? a.getEndX() : a.getStartX();
              let c = 0;
              for (; Ee.isValidBarcodeColumn(e, t - o);) {
                t -= o;
                for (let d of e.getDetectionResultColumn(t).getCodewords())
                  if (d != null)
                    return (
                      (s ? d.getEndX() : d.getStartX()) +
                      o * c * (d.getEndX() - d.getStartX())
                    );
                c++;
              }
              return s
                ? e.getBoundingBox().getMinX()
                : e.getBoundingBox().getMaxX();
            }
            static detectCodeword(e, t, r, s, o, a, c, d) {
              o = Ee.adjustCodewordStartColumn(e, t, r, s, o, a);
              let f = Ee.getModuleBitCount(e, t, r, s, o, a);
              if (f == null) return null;
              let x,
                m = Ne.sum(f);
              if (s) x = o + m;
              else {
                for (let v = 0; v < f.length / 2; v++) {
                  let N = f[v];
                  ((f[v] = f[f.length - 1 - v]), (f[f.length - 1 - v] = N));
                }
                ((x = o), (o = x - m));
              }
              if (!Ee.checkCodewordSkew(m, c, d)) return null;
              let C = Dt.getDecodedValue(f),
                S = me.getCodeword(C);
              return S === -1
                ? null
                : new gs(o, x, Ee.getCodewordBucketNumber(C), S);
            }
            static getModuleBitCount(e, t, r, s, o, a) {
              let c = o,
                d = new Int32Array(8),
                f = 0,
                x = s ? 1 : -1,
                m = s;
              for (; (s ? c < r : c >= t) && f < d.length;)
                e.get(c, a) === m ? (d[f]++, (c += x)) : (f++, (m = !m));
              return f === d.length || (c === (s ? r : t) && f === d.length - 1)
                ? d
                : null;
            }
            static getNumberOfECCodeWords(e) {
              return 2 << e;
            }
            static adjustCodewordStartColumn(e, t, r, s, o, a) {
              let c = o,
                d = s ? -1 : 1;
              for (let f = 0; f < 2; f++) {
                for (; (s ? c >= t : c < r) && s === e.get(c, a);) {
                  if (Math.abs(o - c) > Ee.CODEWORD_SKEW_SIZE) return o;
                  c += d;
                }
                ((d = -d), (s = !s));
              }
              return c;
            }
            static checkCodewordSkew(e, t, r) {
              return (
                t - Ee.CODEWORD_SKEW_SIZE <= e && e <= r + Ee.CODEWORD_SKEW_SIZE
              );
            }
            static decodeCodewords(e, t, r) {
              if (e.length === 0) throw Q.getFormatInstance();
              let s = 1 << (t + 1),
                o = Ee.correctErrors(e, r, s);
              Ee.verifyCodewordCount(e, s);
              let a = F.decode(e, '' + t);
              return (a.setErrorsCorrected(o), a.setErasures(r.length), a);
            }
            static correctErrors(e, t, r) {
              if (
                (t != null && t.length > r / 2 + Ee.MAX_ERRORS) ||
                r < 0 ||
                r > Ee.MAX_EC_CODEWORDS
              )
                throw D.getChecksumInstance();
              return Ee.errorCorrection.decode(e, r, t);
            }
            static verifyCodewordCount(e, t) {
              if (e.length < 4) throw Q.getFormatInstance();
              let r = e[0];
              if (r > e.length) throw Q.getFormatInstance();
              if (r === 0)
                if (t < e.length) e[0] = e.length - t;
                else throw Q.getFormatInstance();
            }
            static getBitCountForCodeword(e) {
              let t = new Int32Array(8),
                r = 0,
                s = t.length - 1;
              for (; !((e & 1) !== r && ((r = e & 1), s--, s < 0));)
                (t[s]++, (e >>= 1));
              return t;
            }
            static getCodewordBucketNumber(e) {
              return e instanceof Int32Array
                ? this.getCodewordBucketNumber_Int32Array(e)
                : this.getCodewordBucketNumber_number(e);
            }
            static getCodewordBucketNumber_number(e) {
              return Ee.getCodewordBucketNumber(Ee.getBitCountForCodeword(e));
            }
            static getCodewordBucketNumber_Int32Array(e) {
              return (e[0] - e[2] + e[4] - e[6] + 9) % 9;
            }
            static toString(e) {
              let t = new us();
              for (let r = 0; r < e.length; r++) {
                t.format('Row %2d: ', r);
                for (let s = 0; s < e[r].length; s++) {
                  let o = e[r][s];
                  o.getValue().length === 0
                    ? t.format('        ', null)
                    : t.format(
                        '%4d(%2d)',
                        o.getValue()[0],
                        o.getConfidence(o.getValue()[0]),
                      );
                }
                t.format('%n');
              }
              return t.toString();
            }
          }
          ((Ee.CODEWORD_SKEW_SIZE = 2),
            (Ee.MAX_ERRORS = 3),
            (Ee.MAX_EC_CODEWORDS = 512),
            (Ee.errorCorrection = new aa()));
          class pt {
            decode(e, t = null) {
              let r = pt.decode(e, t, !1);
              if (r == null || r.length === 0 || r[0] == null)
                throw k.getNotFoundInstance();
              return r[0];
            }
            decodeMultiple(e, t = null) {
              try {
                return pt.decode(e, t, !0);
              } catch (r) {
                throw r instanceof Q || r instanceof D
                  ? k.getNotFoundInstance()
                  : r;
              }
            }
            static decode(e, t, r) {
              const s = new Array(),
                o = ye.detectMultiple(e, t, r);
              for (const a of o.getPoints()) {
                const c = Ee.decode(
                    o.getBits(),
                    a[4],
                    a[5],
                    a[6],
                    a[7],
                    pt.getMinCodewordWidth(a),
                    pt.getMaxCodewordWidth(a),
                  ),
                  d = new st(
                    c.getText(),
                    c.getRawBytes(),
                    void 0,
                    a,
                    oe.PDF_417,
                  );
                d.putMetadata(Ze.ERROR_CORRECTION_LEVEL, c.getECLevel());
                const f = c.getOther();
                (f != null && d.putMetadata(Ze.PDF417_EXTRA_METADATA, f),
                  s.push(d));
              }
              return s.map((a) => a);
            }
            static getMaxWidth(e, t) {
              return e == null || t == null
                ? 0
                : Math.trunc(Math.abs(e.getX() - t.getX()));
            }
            static getMinWidth(e, t) {
              return e == null || t == null
                ? H.MAX_VALUE
                : Math.trunc(Math.abs(e.getX() - t.getX()));
            }
            static getMaxCodewordWidth(e) {
              return Math.floor(
                Math.max(
                  Math.max(
                    pt.getMaxWidth(e[0], e[4]),
                    (pt.getMaxWidth(e[6], e[2]) * me.MODULES_IN_CODEWORD) /
                      me.MODULES_IN_STOP_PATTERN,
                  ),
                  Math.max(
                    pt.getMaxWidth(e[1], e[5]),
                    (pt.getMaxWidth(e[7], e[3]) * me.MODULES_IN_CODEWORD) /
                      me.MODULES_IN_STOP_PATTERN,
                  ),
                ),
              );
            }
            static getMinCodewordWidth(e) {
              return Math.floor(
                Math.min(
                  Math.min(
                    pt.getMinWidth(e[0], e[4]),
                    (pt.getMinWidth(e[6], e[2]) * me.MODULES_IN_CODEWORD) /
                      me.MODULES_IN_STOP_PATTERN,
                  ),
                  Math.min(
                    pt.getMinWidth(e[1], e[5]),
                    (pt.getMinWidth(e[7], e[3]) * me.MODULES_IN_CODEWORD) /
                      me.MODULES_IN_STOP_PATTERN,
                  ),
                ),
              );
            }
            reset() {}
          }
          class ui extends p {}
          ui.kind = 'ReaderException';
          class ha {
            constructor(e, t) {
              ((this.verbose = e === !0), t && this.setHints(t));
            }
            decode(e, t) {
              return (t && this.setHints(t), this.decodeInternal(e));
            }
            decodeWithState(e) {
              return (
                (this.readers === null || this.readers === void 0) &&
                  this.setHints(null),
                this.decodeInternal(e)
              );
            }
            setHints(e) {
              this.hints = e;
              const t = !u(e) && e.get(re.TRY_HARDER) === !0,
                r = u(e) ? null : e.get(re.POSSIBLE_FORMATS),
                s = new Array();
              if (!u(r)) {
                const o = r.some(
                  (a) =>
                    a === oe.UPC_A ||
                    a === oe.UPC_E ||
                    a === oe.EAN_13 ||
                    a === oe.EAN_8 ||
                    a === oe.CODABAR ||
                    a === oe.CODE_39 ||
                    a === oe.CODE_93 ||
                    a === oe.CODE_128 ||
                    a === oe.ITF ||
                    a === oe.RSS_14 ||
                    a === oe.RSS_EXPANDED,
                );
                (o && !t && s.push(new Bn(e, this.verbose)),
                  r.includes(oe.QR_CODE) && s.push(new _r()),
                  r.includes(oe.DATA_MATRIX) && s.push(new Br()),
                  r.includes(oe.AZTEC) && s.push(new si()),
                  r.includes(oe.PDF_417) && s.push(new pt()),
                  o && t && s.push(new Bn(e, this.verbose)));
              }
              (s.length === 0 &&
                (t || s.push(new Bn(e, this.verbose)),
                s.push(new _r()),
                s.push(new Br()),
                s.push(new si()),
                s.push(new pt()),
                t && s.push(new Bn(e, this.verbose))),
                (this.readers = s));
            }
            reset() {
              if (this.readers !== null)
                for (const e of this.readers) e.reset();
            }
            decodeInternal(e) {
              if (this.readers === null)
                throw new ui('No readers where selected, nothing can be read.');
              for (const t of this.readers)
                try {
                  return t.decode(e, this.hints);
                } catch (r) {
                  if (r instanceof ui) continue;
                }
              throw new k(
                'No MultiFormat Readers were able to detect the code.',
              );
            }
          }
          class d1 extends ir {
            constructor(e = null, t = 500) {
              const r = new ha();
              (r.setHints(e), super(r, t));
            }
            decodeBitmap(e) {
              return this.reader.decodeWithState(e);
            }
          }
          class f1 extends ir {
            constructor(e = 500) {
              super(new pt(), e);
            }
          }
          class h1 extends ir {
            constructor(e = 500) {
              super(new _r(), e);
            }
          }
          var Hi;
          (function (A) {
            ((A[(A.ERROR_CORRECTION = 0)] = 'ERROR_CORRECTION'),
              (A[(A.CHARACTER_SET = 1)] = 'CHARACTER_SET'),
              (A[(A.DATA_MATRIX_SHAPE = 2)] = 'DATA_MATRIX_SHAPE'),
              (A[(A.MIN_SIZE = 3)] = 'MIN_SIZE'),
              (A[(A.MAX_SIZE = 4)] = 'MAX_SIZE'),
              (A[(A.MARGIN = 5)] = 'MARGIN'),
              (A[(A.PDF417_COMPACT = 6)] = 'PDF417_COMPACT'),
              (A[(A.PDF417_COMPACTION = 7)] = 'PDF417_COMPACTION'),
              (A[(A.PDF417_DIMENSIONS = 8)] = 'PDF417_DIMENSIONS'),
              (A[(A.AZTEC_LAYERS = 9)] = 'AZTEC_LAYERS'),
              (A[(A.QR_VERSION = 10)] = 'QR_VERSION'));
          })(Hi || (Hi = {}));
          var ct = Hi;
          class Qi {
            constructor(e) {
              ((this.field = e),
                (this.cachedGenerators = []),
                this.cachedGenerators.push(new ot(e, Int32Array.from([1]))));
            }
            buildGenerator(e) {
              const t = this.cachedGenerators;
              if (e >= t.length) {
                let r = t[t.length - 1];
                const s = this.field;
                for (let o = t.length; o <= e; o++) {
                  const a = r.multiply(
                    new ot(
                      s,
                      Int32Array.from([1, s.exp(o - 1 + s.getGeneratorBase())]),
                    ),
                  );
                  (t.push(a), (r = a));
                }
              }
              return t[e];
            }
            encode(e, t) {
              if (t === 0) throw new T('No error correction bytes');
              const r = e.length - t;
              if (r <= 0) throw new T('No data bytes provided');
              const s = this.buildGenerator(t),
                o = new Int32Array(r);
              M.arraycopy(e, 0, o, 0, r);
              let a = new ot(this.field, o);
              a = a.multiplyByMonomial(t, 1);
              const d = a.divide(s)[1].getCoefficients(),
                f = t - d.length;
              for (let x = 0; x < f; x++) e[r + x] = 0;
              M.arraycopy(d, 0, e, r + f, d.length);
            }
          }
          class Ke {
            constructor() {}
            static applyMaskPenaltyRule1(e) {
              return (
                Ke.applyMaskPenaltyRule1Internal(e, !0) +
                Ke.applyMaskPenaltyRule1Internal(e, !1)
              );
            }
            static applyMaskPenaltyRule2(e) {
              let t = 0;
              const r = e.getArray(),
                s = e.getWidth(),
                o = e.getHeight();
              for (let a = 0; a < o - 1; a++) {
                const c = r[a];
                for (let d = 0; d < s - 1; d++) {
                  const f = c[d];
                  f === c[d + 1] &&
                    f === r[a + 1][d] &&
                    f === r[a + 1][d + 1] &&
                    t++;
                }
              }
              return Ke.N2 * t;
            }
            static applyMaskPenaltyRule3(e) {
              let t = 0;
              const r = e.getArray(),
                s = e.getWidth(),
                o = e.getHeight();
              for (let a = 0; a < o; a++)
                for (let c = 0; c < s; c++) {
                  const d = r[a];
                  (c + 6 < s &&
                    d[c] === 1 &&
                    d[c + 1] === 0 &&
                    d[c + 2] === 1 &&
                    d[c + 3] === 1 &&
                    d[c + 4] === 1 &&
                    d[c + 5] === 0 &&
                    d[c + 6] === 1 &&
                    (Ke.isWhiteHorizontal(d, c - 4, c) ||
                      Ke.isWhiteHorizontal(d, c + 7, c + 11)) &&
                    t++,
                    a + 6 < o &&
                      r[a][c] === 1 &&
                      r[a + 1][c] === 0 &&
                      r[a + 2][c] === 1 &&
                      r[a + 3][c] === 1 &&
                      r[a + 4][c] === 1 &&
                      r[a + 5][c] === 0 &&
                      r[a + 6][c] === 1 &&
                      (Ke.isWhiteVertical(r, c, a - 4, a) ||
                        Ke.isWhiteVertical(r, c, a + 7, a + 11)) &&
                      t++);
                }
              return t * Ke.N3;
            }
            static isWhiteHorizontal(e, t, r) {
              ((t = Math.max(t, 0)), (r = Math.min(r, e.length)));
              for (let s = t; s < r; s++) if (e[s] === 1) return !1;
              return !0;
            }
            static isWhiteVertical(e, t, r, s) {
              ((r = Math.max(r, 0)), (s = Math.min(s, e.length)));
              for (let o = r; o < s; o++) if (e[o][t] === 1) return !1;
              return !0;
            }
            static applyMaskPenaltyRule4(e) {
              let t = 0;
              const r = e.getArray(),
                s = e.getWidth(),
                o = e.getHeight();
              for (let d = 0; d < o; d++) {
                const f = r[d];
                for (let x = 0; x < s; x++) f[x] === 1 && t++;
              }
              const a = e.getHeight() * e.getWidth();
              return Math.floor((Math.abs(t * 2 - a) * 10) / a) * Ke.N4;
            }
            static getDataMaskBit(e, t, r) {
              let s, o;
              switch (e) {
                case 0:
                  s = (r + t) & 1;
                  break;
                case 1:
                  s = r & 1;
                  break;
                case 2:
                  s = t % 3;
                  break;
                case 3:
                  s = (r + t) % 3;
                  break;
                case 4:
                  s = (Math.floor(r / 2) + Math.floor(t / 3)) & 1;
                  break;
                case 5:
                  ((o = r * t), (s = (o & 1) + (o % 3)));
                  break;
                case 6:
                  ((o = r * t), (s = ((o & 1) + (o % 3)) & 1));
                  break;
                case 7:
                  ((o = r * t), (s = ((o % 3) + ((r + t) & 1)) & 1));
                  break;
                default:
                  throw new T('Invalid mask pattern: ' + e);
              }
              return s === 0;
            }
            static applyMaskPenaltyRule1Internal(e, t) {
              let r = 0;
              const s = t ? e.getHeight() : e.getWidth(),
                o = t ? e.getWidth() : e.getHeight(),
                a = e.getArray();
              for (let c = 0; c < s; c++) {
                let d = 0,
                  f = -1;
                for (let x = 0; x < o; x++) {
                  const m = t ? a[c][x] : a[x][c];
                  m === f
                    ? d++
                    : (d >= 5 && (r += Ke.N1 + (d - 5)), (d = 1), (f = m));
                }
                d >= 5 && (r += Ke.N1 + (d - 5));
              }
              return r;
            }
          }
          ((Ke.N1 = 3), (Ke.N2 = 3), (Ke.N3 = 40), (Ke.N4 = 10));
          class di {
            constructor(e, t) {
              ((this.width = e), (this.height = t));
              const r = new Array(t);
              for (let s = 0; s !== t; s++) r[s] = new Uint8Array(e);
              this.bytes = r;
            }
            getHeight() {
              return this.height;
            }
            getWidth() {
              return this.width;
            }
            get(e, t) {
              return this.bytes[t][e];
            }
            getArray() {
              return this.bytes;
            }
            setNumber(e, t, r) {
              this.bytes[t][e] = r;
            }
            setBoolean(e, t, r) {
              this.bytes[t][e] = r ? 1 : 0;
            }
            clear(e) {
              for (const t of this.bytes) J.fill(t, e);
            }
            equals(e) {
              if (!(e instanceof di)) return !1;
              const t = e;
              if (this.width !== t.width || this.height !== t.height) return !1;
              for (let r = 0, s = this.height; r < s; ++r) {
                const o = this.bytes[r],
                  a = t.bytes[r];
                for (let c = 0, d = this.width; c < d; ++c)
                  if (o[c] !== a[c]) return !1;
              }
              return !0;
            }
            toString() {
              const e = new $();
              for (let t = 0, r = this.height; t < r; ++t) {
                const s = this.bytes[t];
                for (let o = 0, a = this.width; o < a; ++o)
                  switch (s[o]) {
                    case 0:
                      e.append(' 0');
                      break;
                    case 1:
                      e.append(' 1');
                      break;
                    default:
                      e.append('  ');
                      break;
                  }
                e.append(`
`);
              }
              return e.toString();
            }
          }
          class en {
            constructor() {
              this.maskPattern = -1;
            }
            getMode() {
              return this.mode;
            }
            getECLevel() {
              return this.ecLevel;
            }
            getVersion() {
              return this.version;
            }
            getMaskPattern() {
              return this.maskPattern;
            }
            getMatrix() {
              return this.matrix;
            }
            toString() {
              const e = new $();
              return (
                e.append(`<<
`),
                e.append(' mode: '),
                e.append(this.mode ? this.mode.toString() : 'null'),
                e.append(`
 ecLevel: `),
                e.append(this.ecLevel ? this.ecLevel.toString() : 'null'),
                e.append(`
 version: `),
                e.append(this.version ? this.version.toString() : 'null'),
                e.append(`
 maskPattern: `),
                e.append(this.maskPattern.toString()),
                this.matrix
                  ? (e.append(`
 matrix:
`),
                    e.append(this.matrix.toString()))
                  : e.append(`
 matrix: null
`),
                e.append(`>>
`),
                e.toString()
              );
            }
            setMode(e) {
              this.mode = e;
            }
            setECLevel(e) {
              this.ecLevel = e;
            }
            setVersion(e) {
              this.version = e;
            }
            setMaskPattern(e) {
              this.maskPattern = e;
            }
            setMatrix(e) {
              this.matrix = e;
            }
            static isValidMaskPattern(e) {
              return e >= 0 && e < en.NUM_MASK_PATTERNS;
            }
          }
          en.NUM_MASK_PATTERNS = 8;
          class Le extends p {}
          Le.kind = 'WriterException';
          class Ae {
            constructor() {}
            static clearMatrix(e) {
              e.clear(255);
            }
            static buildMatrix(e, t, r, s, o) {
              (Ae.clearMatrix(o),
                Ae.embedBasicPatterns(r, o),
                Ae.embedTypeInfo(t, s, o),
                Ae.maybeEmbedVersionInfo(r, o),
                Ae.embedDataBits(e, s, o));
            }
            static embedBasicPatterns(e, t) {
              (Ae.embedPositionDetectionPatternsAndSeparators(t),
                Ae.embedDarkDotAtLeftBottomCorner(t),
                Ae.maybeEmbedPositionAdjustmentPatterns(e, t),
                Ae.embedTimingPatterns(t));
            }
            static embedTypeInfo(e, t, r) {
              const s = new W();
              Ae.makeTypeInfoBits(e, t, s);
              for (let o = 0, a = s.getSize(); o < a; ++o) {
                const c = s.get(s.getSize() - 1 - o),
                  d = Ae.TYPE_INFO_COORDINATES[o],
                  f = d[0],
                  x = d[1];
                if ((r.setBoolean(f, x, c), o < 8)) {
                  const m = r.getWidth() - o - 1;
                  r.setBoolean(m, 8, c);
                } else {
                  const C = r.getHeight() - 7 + (o - 8);
                  r.setBoolean(8, C, c);
                }
              }
            }
            static maybeEmbedVersionInfo(e, t) {
              if (e.getVersionNumber() < 7) return;
              const r = new W();
              Ae.makeVersionInfoBits(e, r);
              let s = 17;
              for (let o = 0; o < 6; ++o)
                for (let a = 0; a < 3; ++a) {
                  const c = r.get(s);
                  (s--,
                    t.setBoolean(o, t.getHeight() - 11 + a, c),
                    t.setBoolean(t.getHeight() - 11 + a, o, c));
                }
            }
            static embedDataBits(e, t, r) {
              let s = 0,
                o = -1,
                a = r.getWidth() - 1,
                c = r.getHeight() - 1;
              for (; a > 0;) {
                for (a === 6 && (a -= 1); c >= 0 && c < r.getHeight();) {
                  for (let d = 0; d < 2; ++d) {
                    const f = a - d;
                    if (!Ae.isEmpty(r.get(f, c))) continue;
                    let x;
                    (s < e.getSize() ? ((x = e.get(s)), ++s) : (x = !1),
                      t !== 255 && Ke.getDataMaskBit(t, f, c) && (x = !x),
                      r.setBoolean(f, c, x));
                  }
                  c += o;
                }
                ((o = -o), (c += o), (a -= 2));
              }
              if (s !== e.getSize())
                throw new Le('Not all bits consumed: ' + s + '/' + e.getSize());
            }
            static findMSBSet(e) {
              return 32 - H.numberOfLeadingZeros(e);
            }
            static calculateBCHCode(e, t) {
              if (t === 0) throw new T('0 polynomial');
              const r = Ae.findMSBSet(t);
              for (e <<= r - 1; Ae.findMSBSet(e) >= r;)
                e ^= t << (Ae.findMSBSet(e) - r);
              return e;
            }
            static makeTypeInfoBits(e, t, r) {
              if (!en.isValidMaskPattern(t))
                throw new Le('Invalid mask pattern');
              const s = (e.getBits() << 3) | t;
              r.appendBits(s, 5);
              const o = Ae.calculateBCHCode(s, Ae.TYPE_INFO_POLY);
              r.appendBits(o, 10);
              const a = new W();
              if (
                (a.appendBits(Ae.TYPE_INFO_MASK_PATTERN, 15),
                r.xor(a),
                r.getSize() !== 15)
              )
                throw new Le('should not happen but we got: ' + r.getSize());
            }
            static makeVersionInfoBits(e, t) {
              t.appendBits(e.getVersionNumber(), 6);
              const r = Ae.calculateBCHCode(
                e.getVersionNumber(),
                Ae.VERSION_INFO_POLY,
              );
              if ((t.appendBits(r, 12), t.getSize() !== 18))
                throw new Le('should not happen but we got: ' + t.getSize());
            }
            static isEmpty(e) {
              return e === 255;
            }
            static embedTimingPatterns(e) {
              for (let t = 8; t < e.getWidth() - 8; ++t) {
                const r = (t + 1) % 2;
                (Ae.isEmpty(e.get(t, 6)) && e.setNumber(t, 6, r),
                  Ae.isEmpty(e.get(6, t)) && e.setNumber(6, t, r));
              }
            }
            static embedDarkDotAtLeftBottomCorner(e) {
              if (e.get(8, e.getHeight() - 8) === 0) throw new Le();
              e.setNumber(8, e.getHeight() - 8, 1);
            }
            static embedHorizontalSeparationPattern(e, t, r) {
              for (let s = 0; s < 8; ++s) {
                if (!Ae.isEmpty(r.get(e + s, t))) throw new Le();
                r.setNumber(e + s, t, 0);
              }
            }
            static embedVerticalSeparationPattern(e, t, r) {
              for (let s = 0; s < 7; ++s) {
                if (!Ae.isEmpty(r.get(e, t + s))) throw new Le();
                r.setNumber(e, t + s, 0);
              }
            }
            static embedPositionAdjustmentPattern(e, t, r) {
              for (let s = 0; s < 5; ++s) {
                const o = Ae.POSITION_ADJUSTMENT_PATTERN[s];
                for (let a = 0; a < 5; ++a) r.setNumber(e + a, t + s, o[a]);
              }
            }
            static embedPositionDetectionPattern(e, t, r) {
              for (let s = 0; s < 7; ++s) {
                const o = Ae.POSITION_DETECTION_PATTERN[s];
                for (let a = 0; a < 7; ++a) r.setNumber(e + a, t + s, o[a]);
              }
            }
            static embedPositionDetectionPatternsAndSeparators(e) {
              const t = Ae.POSITION_DETECTION_PATTERN[0].length;
              (Ae.embedPositionDetectionPattern(0, 0, e),
                Ae.embedPositionDetectionPattern(e.getWidth() - t, 0, e),
                Ae.embedPositionDetectionPattern(0, e.getWidth() - t, e));
              const r = 8;
              (Ae.embedHorizontalSeparationPattern(0, r - 1, e),
                Ae.embedHorizontalSeparationPattern(e.getWidth() - r, r - 1, e),
                Ae.embedHorizontalSeparationPattern(0, e.getWidth() - r, e));
              const s = 7;
              (Ae.embedVerticalSeparationPattern(s, 0, e),
                Ae.embedVerticalSeparationPattern(e.getHeight() - s - 1, 0, e),
                Ae.embedVerticalSeparationPattern(s, e.getHeight() - s, e));
            }
            static maybeEmbedPositionAdjustmentPatterns(e, t) {
              if (e.getVersionNumber() < 2) return;
              const r = e.getVersionNumber() - 1,
                s = Ae.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[r];
              for (let o = 0, a = s.length; o !== a; o++) {
                const c = s[o];
                if (c >= 0)
                  for (let d = 0; d !== a; d++) {
                    const f = s[d];
                    f >= 0 &&
                      Ae.isEmpty(t.get(f, c)) &&
                      Ae.embedPositionAdjustmentPattern(f - 2, c - 2, t);
                  }
              }
            }
          }
          ((Ae.POSITION_DETECTION_PATTERN = Array.from([
            Int32Array.from([1, 1, 1, 1, 1, 1, 1]),
            Int32Array.from([1, 0, 0, 0, 0, 0, 1]),
            Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
            Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
            Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
            Int32Array.from([1, 0, 0, 0, 0, 0, 1]),
            Int32Array.from([1, 1, 1, 1, 1, 1, 1]),
          ])),
            (Ae.POSITION_ADJUSTMENT_PATTERN = Array.from([
              Int32Array.from([1, 1, 1, 1, 1]),
              Int32Array.from([1, 0, 0, 0, 1]),
              Int32Array.from([1, 0, 1, 0, 1]),
              Int32Array.from([1, 0, 0, 0, 1]),
              Int32Array.from([1, 1, 1, 1, 1]),
            ])),
            (Ae.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE = Array.from([
              Int32Array.from([-1, -1, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 18, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 22, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 26, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 30, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 34, -1, -1, -1, -1, -1]),
              Int32Array.from([6, 22, 38, -1, -1, -1, -1]),
              Int32Array.from([6, 24, 42, -1, -1, -1, -1]),
              Int32Array.from([6, 26, 46, -1, -1, -1, -1]),
              Int32Array.from([6, 28, 50, -1, -1, -1, -1]),
              Int32Array.from([6, 30, 54, -1, -1, -1, -1]),
              Int32Array.from([6, 32, 58, -1, -1, -1, -1]),
              Int32Array.from([6, 34, 62, -1, -1, -1, -1]),
              Int32Array.from([6, 26, 46, 66, -1, -1, -1]),
              Int32Array.from([6, 26, 48, 70, -1, -1, -1]),
              Int32Array.from([6, 26, 50, 74, -1, -1, -1]),
              Int32Array.from([6, 30, 54, 78, -1, -1, -1]),
              Int32Array.from([6, 30, 56, 82, -1, -1, -1]),
              Int32Array.from([6, 30, 58, 86, -1, -1, -1]),
              Int32Array.from([6, 34, 62, 90, -1, -1, -1]),
              Int32Array.from([6, 28, 50, 72, 94, -1, -1]),
              Int32Array.from([6, 26, 50, 74, 98, -1, -1]),
              Int32Array.from([6, 30, 54, 78, 102, -1, -1]),
              Int32Array.from([6, 28, 54, 80, 106, -1, -1]),
              Int32Array.from([6, 32, 58, 84, 110, -1, -1]),
              Int32Array.from([6, 30, 58, 86, 114, -1, -1]),
              Int32Array.from([6, 34, 62, 90, 118, -1, -1]),
              Int32Array.from([6, 26, 50, 74, 98, 122, -1]),
              Int32Array.from([6, 30, 54, 78, 102, 126, -1]),
              Int32Array.from([6, 26, 52, 78, 104, 130, -1]),
              Int32Array.from([6, 30, 56, 82, 108, 134, -1]),
              Int32Array.from([6, 34, 60, 86, 112, 138, -1]),
              Int32Array.from([6, 30, 58, 86, 114, 142, -1]),
              Int32Array.from([6, 34, 62, 90, 118, 146, -1]),
              Int32Array.from([6, 30, 54, 78, 102, 126, 150]),
              Int32Array.from([6, 24, 50, 76, 102, 128, 154]),
              Int32Array.from([6, 28, 54, 80, 106, 132, 158]),
              Int32Array.from([6, 32, 58, 84, 110, 136, 162]),
              Int32Array.from([6, 26, 54, 82, 110, 138, 166]),
              Int32Array.from([6, 30, 58, 86, 114, 142, 170]),
            ])),
            (Ae.TYPE_INFO_COORDINATES = Array.from([
              Int32Array.from([8, 0]),
              Int32Array.from([8, 1]),
              Int32Array.from([8, 2]),
              Int32Array.from([8, 3]),
              Int32Array.from([8, 4]),
              Int32Array.from([8, 5]),
              Int32Array.from([8, 7]),
              Int32Array.from([8, 8]),
              Int32Array.from([7, 8]),
              Int32Array.from([5, 8]),
              Int32Array.from([4, 8]),
              Int32Array.from([3, 8]),
              Int32Array.from([2, 8]),
              Int32Array.from([1, 8]),
              Int32Array.from([0, 8]),
            ])),
            (Ae.VERSION_INFO_POLY = 7973),
            (Ae.TYPE_INFO_POLY = 1335),
            (Ae.TYPE_INFO_MASK_PATTERN = 21522));
          class g1 {
            constructor(e, t) {
              ((this.dataBytes = e), (this.errorCorrectionBytes = t));
            }
            getDataBytes() {
              return this.dataBytes;
            }
            getErrorCorrectionBytes() {
              return this.errorCorrectionBytes;
            }
          }
          class je {
            constructor() {}
            static calculateMaskPenalty(e) {
              return (
                Ke.applyMaskPenaltyRule1(e) +
                Ke.applyMaskPenaltyRule2(e) +
                Ke.applyMaskPenaltyRule3(e) +
                Ke.applyMaskPenaltyRule4(e)
              );
            }
            static encode(e, t, r = null) {
              let s = je.DEFAULT_BYTE_MODE_ENCODING;
              const o = r !== null && r.get(ct.CHARACTER_SET) !== void 0;
              o && (s = r.get(ct.CHARACTER_SET).toString());
              const a = this.chooseMode(e, s),
                c = new W();
              if (a === ge.BYTE && (o || je.DEFAULT_BYTE_MODE_ENCODING !== s)) {
                const Z = L.getCharacterSetECIByName(s);
                Z !== void 0 && this.appendECI(Z, c);
              }
              this.appendModeInfo(a, c);
              const d = new W();
              this.appendBytes(e, a, d, s);
              let f;
              if (r !== null && r.get(ct.QR_VERSION) !== void 0) {
                const Z = Number.parseInt(r.get(ct.QR_VERSION).toString(), 10);
                f = he.getVersionForNumber(Z);
                const K = this.calculateBitsNeeded(a, c, d, f);
                if (!this.willFit(K, f, t))
                  throw new Le('Data too big for requested version');
              } else f = this.recommendVersion(t, a, c, d);
              const x = new W();
              x.appendBitArray(c);
              const m = a === ge.BYTE ? d.getSizeInBytes() : e.length;
              (this.appendLengthInfo(m, f, a, x), x.appendBitArray(d));
              const C = f.getECBlocksForLevel(t),
                S = f.getTotalCodewords() - C.getTotalECCodewords();
              this.terminateBits(S, x);
              const v = this.interleaveWithECBytes(
                  x,
                  f.getTotalCodewords(),
                  S,
                  C.getNumBlocks(),
                ),
                N = new en();
              (N.setECLevel(t), N.setMode(a), N.setVersion(f));
              const O = f.getDimensionForVersion(),
                U = new di(O, O),
                q = this.chooseMaskPattern(v, t, f, U);
              return (
                N.setMaskPattern(q),
                Ae.buildMatrix(v, t, f, q, U),
                N.setMatrix(U),
                N
              );
            }
            static recommendVersion(e, t, r, s) {
              const o = this.calculateBitsNeeded(
                  t,
                  r,
                  s,
                  he.getVersionForNumber(1),
                ),
                a = this.chooseVersion(o, e),
                c = this.calculateBitsNeeded(t, r, s, a);
              return this.chooseVersion(c, e);
            }
            static calculateBitsNeeded(e, t, r, s) {
              return t.getSize() + e.getCharacterCountBits(s) + r.getSize();
            }
            static getAlphanumericCode(e) {
              return e < je.ALPHANUMERIC_TABLE.length
                ? je.ALPHANUMERIC_TABLE[e]
                : -1;
            }
            static chooseMode(e, t = null) {
              if (L.SJIS.getName() === t && this.isOnlyDoubleByteKanji(e))
                return ge.KANJI;
              let r = !1,
                s = !1;
              for (let o = 0, a = e.length; o < a; ++o) {
                const c = e.charAt(o);
                if (je.isDigit(c)) r = !0;
                else if (this.getAlphanumericCode(c.charCodeAt(0)) !== -1)
                  s = !0;
                else return ge.BYTE;
              }
              return s ? ge.ALPHANUMERIC : r ? ge.NUMERIC : ge.BYTE;
            }
            static isOnlyDoubleByteKanji(e) {
              let t;
              try {
                t = xe.encode(e, L.SJIS);
              } catch {
                return !1;
              }
              const r = t.length;
              if (r % 2 !== 0) return !1;
              for (let s = 0; s < r; s += 2) {
                const o = t[s] & 255;
                if ((o < 129 || o > 159) && (o < 224 || o > 235)) return !1;
              }
              return !0;
            }
            static chooseMaskPattern(e, t, r, s) {
              let o = Number.MAX_SAFE_INTEGER,
                a = -1;
              for (let c = 0; c < en.NUM_MASK_PATTERNS; c++) {
                Ae.buildMatrix(e, t, r, c, s);
                let d = this.calculateMaskPenalty(s);
                d < o && ((o = d), (a = c));
              }
              return a;
            }
            static chooseVersion(e, t) {
              for (let r = 1; r <= 40; r++) {
                const s = he.getVersionForNumber(r);
                if (je.willFit(e, s, t)) return s;
              }
              throw new Le('Data too big');
            }
            static willFit(e, t, r) {
              const s = t.getTotalCodewords(),
                a = t.getECBlocksForLevel(r).getTotalECCodewords(),
                c = s - a,
                d = (e + 7) / 8;
              return c >= d;
            }
            static terminateBits(e, t) {
              const r = e * 8;
              if (t.getSize() > r)
                throw new Le(
                  'data bits cannot fit in the QR Code' +
                    t.getSize() +
                    ' > ' +
                    r,
                );
              for (let a = 0; a < 4 && t.getSize() < r; ++a) t.appendBit(!1);
              const s = t.getSize() & 7;
              if (s > 0) for (let a = s; a < 8; a++) t.appendBit(!1);
              const o = e - t.getSizeInBytes();
              for (let a = 0; a < o; ++a)
                t.appendBits((a & 1) === 0 ? 236 : 17, 8);
              if (t.getSize() !== r)
                throw new Le('Bits size does not equal capacity');
            }
            static getNumDataBytesAndNumECBytesForBlockID(e, t, r, s, o, a) {
              if (s >= r) throw new Le('Block ID too large');
              const c = e % r,
                d = r - c,
                f = Math.floor(e / r),
                x = f + 1,
                m = Math.floor(t / r),
                C = m + 1,
                S = f - m,
                v = x - C;
              if (S !== v) throw new Le('EC bytes mismatch');
              if (r !== d + c) throw new Le('RS blocks mismatch');
              if (e !== (m + S) * d + (C + v) * c)
                throw new Le('Total bytes mismatch');
              s < d ? ((o[0] = m), (a[0] = S)) : ((o[0] = C), (a[0] = v));
            }
            static interleaveWithECBytes(e, t, r, s) {
              if (e.getSizeInBytes() !== r)
                throw new Le('Number of bits and data bytes does not match');
              let o = 0,
                a = 0,
                c = 0;
              const d = new Array();
              for (let x = 0; x < s; ++x) {
                const m = new Int32Array(1),
                  C = new Int32Array(1);
                je.getNumDataBytesAndNumECBytesForBlockID(t, r, s, x, m, C);
                const S = m[0],
                  v = new Uint8Array(S);
                e.toBytes(8 * o, v, 0, S);
                const N = je.generateECBytes(v, C[0]);
                (d.push(new g1(v, N)),
                  (a = Math.max(a, S)),
                  (c = Math.max(c, N.length)),
                  (o += m[0]));
              }
              if (r !== o) throw new Le('Data bytes does not match offset');
              const f = new W();
              for (let x = 0; x < a; ++x)
                for (const m of d) {
                  const C = m.getDataBytes();
                  x < C.length && f.appendBits(C[x], 8);
                }
              for (let x = 0; x < c; ++x)
                for (const m of d) {
                  const C = m.getErrorCorrectionBytes();
                  x < C.length && f.appendBits(C[x], 8);
                }
              if (t !== f.getSizeInBytes())
                throw new Le(
                  'Interleaving error: ' +
                    t +
                    ' and ' +
                    f.getSizeInBytes() +
                    ' differ.',
                );
              return f;
            }
            static generateECBytes(e, t) {
              const r = e.length,
                s = new Int32Array(r + t);
              for (let a = 0; a < r; a++) s[a] = e[a] & 255;
              new Qi(Re.QR_CODE_FIELD_256).encode(s, t);
              const o = new Uint8Array(t);
              for (let a = 0; a < t; a++) o[a] = s[r + a];
              return o;
            }
            static appendModeInfo(e, t) {
              t.appendBits(e.getBits(), 4);
            }
            static appendLengthInfo(e, t, r, s) {
              const o = r.getCharacterCountBits(t);
              if (e >= 1 << o)
                throw new Le(e + ' is bigger than ' + ((1 << o) - 1));
              s.appendBits(e, o);
            }
            static appendBytes(e, t, r, s) {
              switch (t) {
                case ge.NUMERIC:
                  je.appendNumericBytes(e, r);
                  break;
                case ge.ALPHANUMERIC:
                  je.appendAlphanumericBytes(e, r);
                  break;
                case ge.BYTE:
                  je.append8BitBytes(e, r, s);
                  break;
                case ge.KANJI:
                  je.appendKanjiBytes(e, r);
                  break;
                default:
                  throw new Le('Invalid mode: ' + t);
              }
            }
            static getDigit(e) {
              return e.charCodeAt(0) - 48;
            }
            static isDigit(e) {
              const t = je.getDigit(e);
              return t >= 0 && t <= 9;
            }
            static appendNumericBytes(e, t) {
              const r = e.length;
              let s = 0;
              for (; s < r;) {
                const o = je.getDigit(e.charAt(s));
                if (s + 2 < r) {
                  const a = je.getDigit(e.charAt(s + 1)),
                    c = je.getDigit(e.charAt(s + 2));
                  (t.appendBits(o * 100 + a * 10 + c, 10), (s += 3));
                } else if (s + 1 < r) {
                  const a = je.getDigit(e.charAt(s + 1));
                  (t.appendBits(o * 10 + a, 7), (s += 2));
                } else (t.appendBits(o, 4), s++);
              }
            }
            static appendAlphanumericBytes(e, t) {
              const r = e.length;
              let s = 0;
              for (; s < r;) {
                const o = je.getAlphanumericCode(e.charCodeAt(s));
                if (o === -1) throw new Le();
                if (s + 1 < r) {
                  const a = je.getAlphanumericCode(e.charCodeAt(s + 1));
                  if (a === -1) throw new Le();
                  (t.appendBits(o * 45 + a, 11), (s += 2));
                } else (t.appendBits(o, 6), s++);
              }
            }
            static append8BitBytes(e, t, r) {
              let s;
              try {
                s = xe.encode(e, r);
              } catch (o) {
                throw new Le(o);
              }
              for (let o = 0, a = s.length; o !== a; o++) {
                const c = s[o];
                t.appendBits(c, 8);
              }
            }
            static appendKanjiBytes(e, t) {
              let r;
              try {
                r = xe.encode(e, L.SJIS);
              } catch (o) {
                throw new Le(o);
              }
              const s = r.length;
              for (let o = 0; o < s; o += 2) {
                const a = r[o] & 255,
                  c = r[o + 1] & 255,
                  d = ((a << 8) & 4294967295) | c;
                let f = -1;
                if (
                  (d >= 33088 && d <= 40956
                    ? (f = d - 33088)
                    : d >= 57408 && d <= 60351 && (f = d - 49472),
                  f === -1)
                )
                  throw new Le('Invalid byte sequence');
                const x = (f >> 8) * 192 + (f & 255);
                t.appendBits(x, 13);
              }
            }
            static appendECI(e, t) {
              (t.appendBits(ge.ECI.getBits(), 4),
                t.appendBits(e.getValue(), 8));
            }
          }
          ((je.ALPHANUMERIC_TABLE = Int32Array.from([
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 36, -1,
            -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1, -1, 10, 11, 12, 13, 14,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, -1, -1, -1, -1, -1,
          ])),
            (je.DEFAULT_BYTE_MODE_ENCODING = L.UTF8.getName()));
          class tn {
            write(e, t, r, s = null) {
              if (e.length === 0) throw new T('Found empty contents');
              if (t < 0 || r < 0)
                throw new T(
                  'Requested dimensions are too small: ' + t + 'x' + r,
                );
              let o = Ue.L,
                a = tn.QUIET_ZONE_SIZE;
              s !== null &&
                (s.get(ct.ERROR_CORRECTION) !== void 0 &&
                  (o = Ue.fromString(s.get(ct.ERROR_CORRECTION).toString())),
                s.get(ct.MARGIN) !== void 0 &&
                  (a = Number.parseInt(s.get(ct.MARGIN).toString(), 10)));
              const c = je.encode(e, o, s);
              return this.renderResult(c, t, r, a);
            }
            writeToDom(e, t, r, s, o = null) {
              typeof e == 'string' && (e = document.querySelector(e));
              const a = this.write(t, r, s, o);
              e && e.appendChild(a);
            }
            renderResult(e, t, r, s) {
              const o = e.getMatrix();
              if (o === null) throw new or();
              const a = o.getWidth(),
                c = o.getHeight(),
                d = a + s * 2,
                f = c + s * 2,
                x = Math.max(t, d),
                m = Math.max(r, f),
                C = Math.min(Math.floor(x / d), Math.floor(m / f)),
                S = Math.floor((x - a * C) / 2),
                v = Math.floor((m - c * C) / 2),
                N = this.createSVGElement(x, m);
              for (let O = 0, U = v; O < c; O++, U += C)
                for (let q = 0, Z = S; q < a; q++, Z += C)
                  if (o.get(q, O) === 1) {
                    const K = this.createSvgRectElement(Z, U, C, C);
                    N.appendChild(K);
                  }
              return N;
            }
            createSVGElement(e, t) {
              const r = document.createElementNS(tn.SVG_NS, 'svg');
              return (
                r.setAttributeNS(null, 'height', e.toString()),
                r.setAttributeNS(null, 'width', t.toString()),
                r
              );
            }
            createSvgRectElement(e, t, r, s) {
              const o = document.createElementNS(tn.SVG_NS, 'rect');
              return (
                o.setAttributeNS(null, 'x', e.toString()),
                o.setAttributeNS(null, 'y', t.toString()),
                o.setAttributeNS(null, 'height', r.toString()),
                o.setAttributeNS(null, 'width', s.toString()),
                o.setAttributeNS(null, 'fill', '#000000'),
                o
              );
            }
          }
          ((tn.QUIET_ZONE_SIZE = 4),
            (tn.SVG_NS = 'http://www.w3.org/2000/svg'));
          class Ln {
            encode(e, t, r, s, o) {
              if (e.length === 0) throw new T('Found empty contents');
              if (t !== oe.QR_CODE)
                throw new T('Can only encode QR_CODE, but got ' + t);
              if (r < 0 || s < 0)
                throw new T(`Requested dimensions are too small: ${r}x${s}`);
              let a = Ue.L,
                c = Ln.QUIET_ZONE_SIZE;
              o !== null &&
                (o.get(ct.ERROR_CORRECTION) !== void 0 &&
                  (a = Ue.fromString(o.get(ct.ERROR_CORRECTION).toString())),
                o.get(ct.MARGIN) !== void 0 &&
                  (c = Number.parseInt(o.get(ct.MARGIN).toString(), 10)));
              const d = je.encode(e, a, o);
              return Ln.renderResult(d, r, s, c);
            }
            static renderResult(e, t, r, s) {
              const o = e.getMatrix();
              if (o === null) throw new or();
              const a = o.getWidth(),
                c = o.getHeight(),
                d = a + s * 2,
                f = c + s * 2,
                x = Math.max(t, d),
                m = Math.max(r, f),
                C = Math.min(Math.floor(x / d), Math.floor(m / f)),
                S = Math.floor((x - a * C) / 2),
                v = Math.floor((m - c * C) / 2),
                N = new we(x, m);
              for (let O = 0, U = v; O < c; O++, U += C)
                for (let q = 0, Z = S; q < a; q++, Z += C)
                  o.get(q, O) === 1 && N.setRegion(Z, U, C, C);
              return N;
            }
          }
          Ln.QUIET_ZONE_SIZE = 4;
          class x1 {
            encode(e, t, r, s, o) {
              let a;
              switch (t) {
                case oe.QR_CODE:
                  a = new Ln();
                  break;
                default:
                  throw new T('No encoder available for format ' + t);
              }
              return a.encode(e, t, r, s, o);
            }
          }
          class ur extends wr {
            constructor(e, t, r, s, o, a, c, d) {
              if (
                (super(a, c),
                (this.yuvData = e),
                (this.dataWidth = t),
                (this.dataHeight = r),
                (this.left = s),
                (this.top = o),
                s + a > t || o + c > r)
              )
                throw new T('Crop rectangle does not fit within image data.');
              d && this.reverseHorizontal(a, c);
            }
            getRow(e, t) {
              if (e < 0 || e >= this.getHeight())
                throw new T('Requested row is outside the image: ' + e);
              const r = this.getWidth();
              (t == null || t.length < r) && (t = new Uint8ClampedArray(r));
              const s = (e + this.top) * this.dataWidth + this.left;
              return (M.arraycopy(this.yuvData, s, t, 0, r), t);
            }
            getMatrix() {
              const e = this.getWidth(),
                t = this.getHeight();
              if (e === this.dataWidth && t === this.dataHeight)
                return this.yuvData;
              const r = e * t,
                s = new Uint8ClampedArray(r);
              let o = this.top * this.dataWidth + this.left;
              if (e === this.dataWidth)
                return (M.arraycopy(this.yuvData, o, s, 0, r), s);
              for (let a = 0; a < t; a++) {
                const c = a * e;
                (M.arraycopy(this.yuvData, o, s, c, e), (o += this.dataWidth));
              }
              return s;
            }
            isCropSupported() {
              return !0;
            }
            crop(e, t, r, s) {
              return new ur(
                this.yuvData,
                this.dataWidth,
                this.dataHeight,
                this.left + e,
                this.top + t,
                r,
                s,
                !1,
              );
            }
            renderThumbnail() {
              const e = this.getWidth() / ur.THUMBNAIL_SCALE_FACTOR,
                t = this.getHeight() / ur.THUMBNAIL_SCALE_FACTOR,
                r = new Int32Array(e * t),
                s = this.yuvData;
              let o = this.top * this.dataWidth + this.left;
              for (let a = 0; a < t; a++) {
                const c = a * e;
                for (let d = 0; d < e; d++) {
                  const f = s[o + d * ur.THUMBNAIL_SCALE_FACTOR] & 255;
                  r[c + d] = 4278190080 | (f * 65793);
                }
                o += this.dataWidth * ur.THUMBNAIL_SCALE_FACTOR;
              }
              return r;
            }
            getThumbnailWidth() {
              return this.getWidth() / ur.THUMBNAIL_SCALE_FACTOR;
            }
            getThumbnailHeight() {
              return this.getHeight() / ur.THUMBNAIL_SCALE_FACTOR;
            }
            reverseHorizontal(e, t) {
              const r = this.yuvData;
              for (
                let s = 0, o = this.top * this.dataWidth + this.left;
                s < t;
                s++, o += this.dataWidth
              ) {
                const a = o + e / 2;
                for (let c = o, d = o + e - 1; c < a; c++, d--) {
                  const f = r[c];
                  ((r[c] = r[d]), (r[d] = f));
                }
              }
            }
            invert() {
              return new zt(this);
            }
          }
          ur.THUMBNAIL_SCALE_FACTOR = 2;
          class Xi extends wr {
            constructor(e, t, r, s, o, a, c) {
              if (
                (super(t, r),
                (this.dataWidth = s),
                (this.dataHeight = o),
                (this.left = a),
                (this.top = c),
                e.BYTES_PER_ELEMENT === 4)
              ) {
                const d = t * r,
                  f = new Uint8ClampedArray(d);
                for (let x = 0; x < d; x++) {
                  const m = e[x],
                    C = (m >> 16) & 255,
                    S = (m >> 7) & 510,
                    v = m & 255;
                  f[x] = ((C + S + v) / 4) & 255;
                }
                this.luminances = f;
              } else this.luminances = e;
              if (
                (s === void 0 && (this.dataWidth = t),
                o === void 0 && (this.dataHeight = r),
                a === void 0 && (this.left = 0),
                c === void 0 && (this.top = 0),
                this.left + t > this.dataWidth ||
                  this.top + r > this.dataHeight)
              )
                throw new T('Crop rectangle does not fit within image data.');
            }
            getRow(e, t) {
              if (e < 0 || e >= this.getHeight())
                throw new T('Requested row is outside the image: ' + e);
              const r = this.getWidth();
              (t == null || t.length < r) && (t = new Uint8ClampedArray(r));
              const s = (e + this.top) * this.dataWidth + this.left;
              return (M.arraycopy(this.luminances, s, t, 0, r), t);
            }
            getMatrix() {
              const e = this.getWidth(),
                t = this.getHeight();
              if (e === this.dataWidth && t === this.dataHeight)
                return this.luminances;
              const r = e * t,
                s = new Uint8ClampedArray(r);
              let o = this.top * this.dataWidth + this.left;
              if (e === this.dataWidth)
                return (M.arraycopy(this.luminances, o, s, 0, r), s);
              for (let a = 0; a < t; a++) {
                const c = a * e;
                (M.arraycopy(this.luminances, o, s, c, e),
                  (o += this.dataWidth));
              }
              return s;
            }
            isCropSupported() {
              return !0;
            }
            crop(e, t, r, s) {
              return new Xi(
                this.luminances,
                r,
                s,
                this.dataWidth,
                this.dataHeight,
                this.left + e,
                this.top + t,
              );
            }
            invert() {
              return new zt(this);
            }
          }
          class ga extends L {
            static forName(e) {
              return this.getCharacterSetECIByName(e);
            }
          }
          class Gi {}
          Gi.ISO_8859_1 = L.ISO8859_1;
          class xa {
            isCompact() {
              return this.compact;
            }
            setCompact(e) {
              this.compact = e;
            }
            getSize() {
              return this.size;
            }
            setSize(e) {
              this.size = e;
            }
            getLayers() {
              return this.layers;
            }
            setLayers(e) {
              this.layers = e;
            }
            getCodeWords() {
              return this.codeWords;
            }
            setCodeWords(e) {
              this.codeWords = e;
            }
            getMatrix() {
              return this.matrix;
            }
            setMatrix(e) {
              this.matrix = e;
            }
          }
          class Aa {
            static singletonList(e) {
              return [e];
            }
            static min(e, t) {
              return e.sort(t)[0];
            }
          }
          class A1 {
            constructor(e) {
              this.previous = e;
            }
            getPrevious() {
              return this.previous;
            }
          }
          class kn extends A1 {
            constructor(e, t, r) {
              (super(e), (this.value = t), (this.bitCount = r));
            }
            appendTo(e, t) {
              e.appendBits(this.value, this.bitCount);
            }
            add(e, t) {
              return new kn(this, e, t);
            }
            addBinaryShift(e, t) {
              return (
                console.warn(
                  'addBinaryShift on SimpleToken, this simply returns a copy of this token',
                ),
                new kn(this, e, t)
              );
            }
            toString() {
              let e = this.value & ((1 << this.bitCount) - 1);
              return (
                (e |= 1 << this.bitCount),
                '<' +
                  H.toBinaryString(e | (1 << this.bitCount)).substring(1) +
                  '>'
              );
            }
          }
          class Yi extends kn {
            constructor(e, t, r) {
              (super(e, 0, 0),
                (this.binaryShiftStart = t),
                (this.binaryShiftByteCount = r));
            }
            appendTo(e, t) {
              for (let r = 0; r < this.binaryShiftByteCount; r++)
                ((r === 0 || (r === 31 && this.binaryShiftByteCount <= 62)) &&
                  (e.appendBits(31, 5),
                  this.binaryShiftByteCount > 62
                    ? e.appendBits(this.binaryShiftByteCount - 31, 16)
                    : r === 0
                      ? e.appendBits(Math.min(this.binaryShiftByteCount, 31), 5)
                      : e.appendBits(this.binaryShiftByteCount - 31, 5)),
                  e.appendBits(t[this.binaryShiftStart + r], 8));
            }
            addBinaryShift(e, t) {
              return new Yi(this, e, t);
            }
            toString() {
              return (
                '<' +
                this.binaryShiftStart +
                '::' +
                (this.binaryShiftStart + this.binaryShiftByteCount - 1) +
                '>'
              );
            }
          }
          function m1(A, e, t) {
            return new Yi(A, e, t);
          }
          function xs(A, e, t) {
            return new kn(A, e, t);
          }
          const p1 = ['UPPER', 'LOWER', 'DIGIT', 'MIXED', 'PUNCT'],
            kr = 0,
            fi = 1,
            Qt = 2,
            ma = 3,
            dr = 4,
            w1 = new kn(null, 0, 0),
            Ki = [
              Int32Array.from([
                0,
                (5 << 16) + 28,
                (5 << 16) + 30,
                (5 << 16) + 29,
                656318,
              ]),
              Int32Array.from([
                (9 << 16) + 480 + 14,
                0,
                (5 << 16) + 30,
                (5 << 16) + 29,
                656318,
              ]),
              Int32Array.from([
                (4 << 16) + 14,
                (9 << 16) + 448 + 28,
                0,
                (9 << 16) + 448 + 29,
                932798,
              ]),
              Int32Array.from([
                (5 << 16) + 29,
                (5 << 16) + 28,
                656318,
                0,
                (5 << 16) + 30,
              ]),
              Int32Array.from([(5 << 16) + 31, 656380, 656382, 656381, 0]),
            ];
          function C1(A) {
            for (let e of A) J.fill(e, -1);
            return (
              (A[kr][dr] = 0),
              (A[fi][dr] = 0),
              (A[fi][kr] = 28),
              (A[ma][dr] = 0),
              (A[Qt][dr] = 0),
              (A[Qt][kr] = 15),
              A
            );
          }
          const pa = C1(J.createInt32Array(6, 6));
          class fr {
            constructor(e, t, r, s) {
              ((this.token = e),
                (this.mode = t),
                (this.binaryShiftByteCount = r),
                (this.bitCount = s));
            }
            getMode() {
              return this.mode;
            }
            getToken() {
              return this.token;
            }
            getBinaryShiftByteCount() {
              return this.binaryShiftByteCount;
            }
            getBitCount() {
              return this.bitCount;
            }
            latchAndAppend(e, t) {
              let r = this.bitCount,
                s = this.token;
              if (e !== this.mode) {
                let a = Ki[this.mode][e];
                ((s = xs(s, a & 65535, a >> 16)), (r += a >> 16));
              }
              let o = e === Qt ? 4 : 5;
              return ((s = xs(s, t, o)), new fr(s, e, 0, r + o));
            }
            shiftAndAppend(e, t) {
              let r = this.token,
                s = this.mode === Qt ? 4 : 5;
              return (
                (r = xs(r, pa[this.mode][e], s)),
                (r = xs(r, t, 5)),
                new fr(r, this.mode, 0, this.bitCount + s + 5)
              );
            }
            addBinaryShiftChar(e) {
              let t = this.token,
                r = this.mode,
                s = this.bitCount;
              if (this.mode === dr || this.mode === Qt) {
                let c = Ki[r][kr];
                ((t = xs(t, c & 65535, c >> 16)), (s += c >> 16), (r = kr));
              }
              let o =
                  this.binaryShiftByteCount === 0 ||
                  this.binaryShiftByteCount === 31
                    ? 18
                    : this.binaryShiftByteCount === 62
                      ? 9
                      : 8,
                a = new fr(t, r, this.binaryShiftByteCount + 1, s + o);
              return (
                a.binaryShiftByteCount === 2078 &&
                  (a = a.endBinaryShift(e + 1)),
                a
              );
            }
            endBinaryShift(e) {
              if (this.binaryShiftByteCount === 0) return this;
              let t = this.token;
              return (
                (t = m1(
                  t,
                  e - this.binaryShiftByteCount,
                  this.binaryShiftByteCount,
                )),
                new fr(t, this.mode, 0, this.bitCount)
              );
            }
            isBetterThanOrEqualTo(e) {
              let t = this.bitCount + (Ki[this.mode][e.mode] >> 16);
              return (
                this.binaryShiftByteCount < e.binaryShiftByteCount
                  ? (t +=
                      fr.calculateBinaryShiftCost(e) -
                      fr.calculateBinaryShiftCost(this))
                  : this.binaryShiftByteCount > e.binaryShiftByteCount &&
                    e.binaryShiftByteCount > 0 &&
                    (t += 10),
                t <= e.bitCount
              );
            }
            toBitArray(e) {
              let t = [];
              for (
                let s = this.endBinaryShift(e.length).token;
                s !== null;
                s = s.getPrevious()
              )
                t.unshift(s);
              let r = new W();
              for (const s of t) s.appendTo(r, e);
              return r;
            }
            toString() {
              return se.format(
                '%s bits=%d bytes=%d',
                p1[this.mode],
                this.bitCount,
                this.binaryShiftByteCount,
              );
            }
            static calculateBinaryShiftCost(e) {
              return e.binaryShiftByteCount > 62
                ? 21
                : e.binaryShiftByteCount > 31
                  ? 20
                  : e.binaryShiftByteCount > 0
                    ? 10
                    : 0;
            }
          }
          fr.INITIAL_STATE = new fr(w1, kr, 0, 0);
          function y1(A) {
            const e = se.getCharCode(' '),
              t = se.getCharCode('.'),
              r = se.getCharCode(',');
            A[kr][e] = 1;
            const s = se.getCharCode('Z'),
              o = se.getCharCode('A');
            for (let C = o; C <= s; C++) A[kr][C] = C - o + 2;
            A[fi][e] = 1;
            const a = se.getCharCode('z'),
              c = se.getCharCode('a');
            for (let C = c; C <= a; C++) A[fi][C] = C - c + 2;
            A[Qt][e] = 1;
            const d = se.getCharCode('9'),
              f = se.getCharCode('0');
            for (let C = f; C <= d; C++) A[Qt][C] = C - f + 2;
            ((A[Qt][r] = 12), (A[Qt][t] = 13));
            const x = [
              '\0',
              ' ',
              '',
              '',
              '',
              '',
              '',
              '',
              '\x07',
              '\b',
              '	',
              `
`,
              '\v',
              '\f',
              '\r',
              '\x1B',
              '',
              '',
              '',
              '',
              '@',
              '\\',
              '^',
              '_',
              '`',
              '|',
              '~',
              '',
            ];
            for (let C = 0; C < x.length; C++) A[ma][se.getCharCode(x[C])] = C;
            const m = [
              '\0',
              '\r',
              '\0',
              '\0',
              '\0',
              '\0',
              '!',
              "'",
              '#',
              '$',
              '%',
              '&',
              "'",
              '(',
              ')',
              '*',
              '+',
              ',',
              '-',
              '.',
              '/',
              ':',
              ';',
              '<',
              '=',
              '>',
              '?',
              '[',
              ']',
              '{',
              '}',
            ];
            for (let C = 0; C < m.length; C++)
              se.getCharCode(m[C]) > 0 && (A[dr][se.getCharCode(m[C])] = C);
            return A;
          }
          const Ji = y1(J.createInt32Array(5, 256));
          class As {
            constructor(e) {
              this.text = e;
            }
            encode() {
              const e = se.getCharCode(' '),
                t = se.getCharCode(`
`);
              let r = Aa.singletonList(fr.INITIAL_STATE);
              for (let o = 0; o < this.text.length; o++) {
                let a,
                  c = o + 1 < this.text.length ? this.text[o + 1] : 0;
                switch (this.text[o]) {
                  case se.getCharCode('\r'):
                    a = c === t ? 2 : 0;
                    break;
                  case se.getCharCode('.'):
                    a = c === e ? 3 : 0;
                    break;
                  case se.getCharCode(','):
                    a = c === e ? 4 : 0;
                    break;
                  case se.getCharCode(':'):
                    a = c === e ? 5 : 0;
                    break;
                  default:
                    a = 0;
                }
                a > 0
                  ? ((r = As.updateStateListForPair(r, o, a)), o++)
                  : (r = this.updateStateListForChar(r, o));
              }
              return Aa.min(
                r,
                (o, a) => o.getBitCount() - a.getBitCount(),
              ).toBitArray(this.text);
            }
            updateStateListForChar(e, t) {
              const r = [];
              for (let s of e) this.updateStateForChar(s, t, r);
              return As.simplifyStates(r);
            }
            updateStateForChar(e, t, r) {
              let s = this.text[t] & 255,
                o = Ji[e.getMode()][s] > 0,
                a = null;
              for (let c = 0; c <= dr; c++) {
                let d = Ji[c][s];
                if (d > 0) {
                  if (
                    (a == null && (a = e.endBinaryShift(t)),
                    !o || c === e.getMode() || c === Qt)
                  ) {
                    const f = a.latchAndAppend(c, d);
                    r.push(f);
                  }
                  if (!o && pa[e.getMode()][c] >= 0) {
                    const f = a.shiftAndAppend(c, d);
                    r.push(f);
                  }
                }
              }
              if (e.getBinaryShiftByteCount() > 0 || Ji[e.getMode()][s] === 0) {
                let c = e.addBinaryShiftChar(t);
                r.push(c);
              }
            }
            static updateStateListForPair(e, t, r) {
              const s = [];
              for (let o of e) this.updateStateForPair(o, t, r, s);
              return this.simplifyStates(s);
            }
            static updateStateForPair(e, t, r, s) {
              let o = e.endBinaryShift(t);
              if (
                (s.push(o.latchAndAppend(dr, r)),
                e.getMode() !== dr && s.push(o.shiftAndAppend(dr, r)),
                r === 3 || r === 4)
              ) {
                let a = o.latchAndAppend(Qt, 16 - r).latchAndAppend(Qt, 1);
                s.push(a);
              }
              if (e.getBinaryShiftByteCount() > 0) {
                let a = e.addBinaryShiftChar(t).addBinaryShiftChar(t + 1);
                s.push(a);
              }
            }
            static simplifyStates(e) {
              let t = [];
              for (const r of e) {
                let s = !0;
                for (const o of t) {
                  if (o.isBetterThanOrEqualTo(r)) {
                    s = !1;
                    break;
                  }
                  r.isBetterThanOrEqualTo(o) && (t = t.filter((a) => a !== o));
                }
                s && t.push(r);
              }
              return t;
            }
          }
          class Me {
            constructor() {}
            static encodeBytes(e) {
              return Me.encode(
                e,
                Me.DEFAULT_EC_PERCENT,
                Me.DEFAULT_AZTEC_LAYERS,
              );
            }
            static encode(e, t, r) {
              let s = new As(e).encode(),
                o = H.truncDivision(s.getSize() * t, 100) + 11,
                a = s.getSize() + o,
                c,
                d,
                f,
                x,
                m;
              if (r !== Me.DEFAULT_AZTEC_LAYERS) {
                if (
                  ((c = r < 0),
                  (d = Math.abs(r)),
                  d > (c ? Me.MAX_NB_BITS_COMPACT : Me.MAX_NB_BITS))
                )
                  throw new T(se.format('Illegal value %s for layers', r));
                ((f = Me.totalBitsInLayer(d, c)), (x = Me.WORD_SIZE[d]));
                let K = f - (f % x);
                if (((m = Me.stuffBits(s, x)), m.getSize() + o > K))
                  throw new T('Data to large for user specified layer');
                if (c && m.getSize() > x * 64)
                  throw new T('Data to large for user specified layer');
              } else {
                ((x = 0), (m = null));
                for (let K = 0; ; K++) {
                  if (K > Me.MAX_NB_BITS)
                    throw new T('Data too large for an Aztec code');
                  if (
                    ((c = K <= 3),
                    (d = c ? K + 1 : K),
                    (f = Me.totalBitsInLayer(d, c)),
                    a > f)
                  )
                    continue;
                  (m == null || x !== Me.WORD_SIZE[d]) &&
                    ((x = Me.WORD_SIZE[d]), (m = Me.stuffBits(s, x)));
                  let Se = f - (f % x);
                  if (!(c && m.getSize() > x * 64) && m.getSize() + o <= Se)
                    break;
                }
              }
              let C = Me.generateCheckWords(m, f, x),
                S = m.getSize() / x,
                v = Me.generateModeMessage(c, d, S),
                N = (c ? 11 : 14) + d * 4,
                O = new Int32Array(N),
                U;
              if (c) {
                U = N;
                for (let K = 0; K < O.length; K++) O[K] = K;
              } else {
                U = N + 1 + 2 * H.truncDivision(H.truncDivision(N, 2) - 1, 15);
                let K = H.truncDivision(N, 2),
                  Se = H.truncDivision(U, 2);
                for (let Ce = 0; Ce < K; Ce++) {
                  let Ot = Ce + H.truncDivision(Ce, 15);
                  ((O[K - Ce - 1] = Se - Ot - 1), (O[K + Ce] = Se + Ot + 1));
                }
              }
              let q = new we(U);
              for (let K = 0, Se = 0; K < d; K++) {
                let Ce = (d - K) * 4 + (c ? 9 : 12);
                for (let Ot = 0; Ot < Ce; Ot++) {
                  let Zt = Ot * 2;
                  for (let Pt = 0; Pt < 2; Pt++)
                    (C.get(Se + Zt + Pt) && q.set(O[K * 2 + Pt], O[K * 2 + Ot]),
                      C.get(Se + Ce * 2 + Zt + Pt) &&
                        q.set(O[K * 2 + Ot], O[N - 1 - K * 2 - Pt]),
                      C.get(Se + Ce * 4 + Zt + Pt) &&
                        q.set(O[N - 1 - K * 2 - Pt], O[N - 1 - K * 2 - Ot]),
                      C.get(Se + Ce * 6 + Zt + Pt) &&
                        q.set(O[N - 1 - K * 2 - Ot], O[K * 2 + Pt]));
                }
                Se += Ce * 8;
              }
              if ((Me.drawModeMessage(q, c, U, v), c))
                Me.drawBullsEye(q, H.truncDivision(U, 2), 5);
              else {
                Me.drawBullsEye(q, H.truncDivision(U, 2), 7);
                for (
                  let K = 0, Se = 0;
                  K < H.truncDivision(N, 2) - 1;
                  K += 15, Se += 16
                )
                  for (let Ce = H.truncDivision(U, 2) & 1; Ce < U; Ce += 2)
                    (q.set(H.truncDivision(U, 2) - Se, Ce),
                      q.set(H.truncDivision(U, 2) + Se, Ce),
                      q.set(Ce, H.truncDivision(U, 2) - Se),
                      q.set(Ce, H.truncDivision(U, 2) + Se));
              }
              let Z = new xa();
              return (
                Z.setCompact(c),
                Z.setSize(U),
                Z.setLayers(d),
                Z.setCodeWords(S),
                Z.setMatrix(q),
                Z
              );
            }
            static drawBullsEye(e, t, r) {
              for (let s = 0; s < r; s += 2)
                for (let o = t - s; o <= t + s; o++)
                  (e.set(o, t - s),
                    e.set(o, t + s),
                    e.set(t - s, o),
                    e.set(t + s, o));
              (e.set(t - r, t - r),
                e.set(t - r + 1, t - r),
                e.set(t - r, t - r + 1),
                e.set(t + r, t - r),
                e.set(t + r, t - r + 1),
                e.set(t + r, t + r - 1));
            }
            static generateModeMessage(e, t, r) {
              let s = new W();
              return (
                e
                  ? (s.appendBits(t - 1, 2),
                    s.appendBits(r - 1, 6),
                    (s = Me.generateCheckWords(s, 28, 4)))
                  : (s.appendBits(t - 1, 5),
                    s.appendBits(r - 1, 11),
                    (s = Me.generateCheckWords(s, 40, 4))),
                s
              );
            }
            static drawModeMessage(e, t, r, s) {
              let o = H.truncDivision(r, 2);
              if (t)
                for (let a = 0; a < 7; a++) {
                  let c = o - 3 + a;
                  (s.get(a) && e.set(c, o - 5),
                    s.get(a + 7) && e.set(o + 5, c),
                    s.get(20 - a) && e.set(c, o + 5),
                    s.get(27 - a) && e.set(o - 5, c));
                }
              else
                for (let a = 0; a < 10; a++) {
                  let c = o - 5 + a + H.truncDivision(a, 5);
                  (s.get(a) && e.set(c, o - 7),
                    s.get(a + 10) && e.set(o + 7, c),
                    s.get(29 - a) && e.set(c, o + 7),
                    s.get(39 - a) && e.set(o - 7, c));
                }
            }
            static generateCheckWords(e, t, r) {
              let s = e.getSize() / r,
                o = new Qi(Me.getGF(r)),
                a = H.truncDivision(t, r),
                c = Me.bitsToWords(e, r, a);
              o.encode(c, a - s);
              let d = t % r,
                f = new W();
              f.appendBits(0, d);
              for (const x of Array.from(c)) f.appendBits(x, r);
              return f;
            }
            static bitsToWords(e, t, r) {
              let s = new Int32Array(r),
                o,
                a;
              for (o = 0, a = e.getSize() / t; o < a; o++) {
                let c = 0;
                for (let d = 0; d < t; d++)
                  c |= e.get(o * t + d) ? 1 << (t - d - 1) : 0;
                s[o] = c;
              }
              return s;
            }
            static getGF(e) {
              switch (e) {
                case 4:
                  return Re.AZTEC_PARAM;
                case 6:
                  return Re.AZTEC_DATA_6;
                case 8:
                  return Re.AZTEC_DATA_8;
                case 10:
                  return Re.AZTEC_DATA_10;
                case 12:
                  return Re.AZTEC_DATA_12;
                default:
                  throw new T('Unsupported word size ' + e);
              }
            }
            static stuffBits(e, t) {
              let r = new W(),
                s = e.getSize(),
                o = (1 << t) - 2;
              for (let a = 0; a < s; a += t) {
                let c = 0;
                for (let d = 0; d < t; d++)
                  (a + d >= s || e.get(a + d)) && (c |= 1 << (t - 1 - d));
                (c & o) === o
                  ? (r.appendBits(c & o, t), a--)
                  : (c & o) === 0
                    ? (r.appendBits(c | 1, t), a--)
                    : r.appendBits(c, t);
              }
              return r;
            }
            static totalBitsInLayer(e, t) {
              return ((t ? 88 : 112) + 16 * e) * e;
            }
          }
          ((Me.DEFAULT_EC_PERCENT = 33),
            (Me.DEFAULT_AZTEC_LAYERS = 0),
            (Me.MAX_NB_BITS = 32),
            (Me.MAX_NB_BITS_COMPACT = 4),
            (Me.WORD_SIZE = Int32Array.from([
              4, 6, 6, 8, 8, 8, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
              10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
            ])));
          class hi {
            encode(e, t, r, s) {
              return this.encodeWithHints(e, t, r, s, null);
            }
            encodeWithHints(e, t, r, s, o) {
              let a = Gi.ISO_8859_1,
                c = Me.DEFAULT_EC_PERCENT,
                d = Me.DEFAULT_AZTEC_LAYERS;
              return (
                o != null &&
                  (o.has(ct.CHARACTER_SET) &&
                    (a = ga.forName(o.get(ct.CHARACTER_SET).toString())),
                  o.has(ct.ERROR_CORRECTION) &&
                    (c = H.parseInt(o.get(ct.ERROR_CORRECTION).toString())),
                  o.has(ct.AZTEC_LAYERS) &&
                    (d = H.parseInt(o.get(ct.AZTEC_LAYERS).toString()))),
                hi.encodeLayers(e, t, r, s, a, c, d)
              );
            }
            static encodeLayers(e, t, r, s, o, a, c) {
              if (t !== oe.AZTEC)
                throw new T('Can only encode AZTEC, but got ' + t);
              let d = Me.encode(se.getBytes(e, o), a, c);
              return hi.renderResult(d, r, s);
            }
            static renderResult(e, t, r) {
              let s = e.getMatrix();
              if (s == null) throw new or();
              let o = s.getWidth(),
                a = s.getHeight(),
                c = Math.max(t, o),
                d = Math.max(r, a),
                f = Math.min(c / o, d / a),
                x = (c - o * f) / 2,
                m = (d - a * f) / 2,
                C = new we(c, d);
              for (let S = 0, v = m; S < a; S++, v += f)
                for (let N = 0, O = x; N < o; N++, O += f)
                  s.get(N, S) && C.setRegion(O, v, f, f);
              return C;
            }
          }
          ((l.AbstractExpandedDecoder = _i),
            (l.ArgumentException = R),
            (l.ArithmeticException = Cr),
            (l.AztecCode = xa),
            (l.AztecCodeReader = si),
            (l.AztecCodeWriter = hi),
            (l.AztecDecoder = Fe),
            (l.AztecDetector = ta),
            (l.AztecDetectorResult = $o),
            (l.AztecEncoder = Me),
            (l.AztecHighLevelEncoder = As),
            (l.AztecPoint = Tt),
            (l.BarcodeFormat = oe),
            (l.Binarizer = z),
            (l.BinaryBitmap = _),
            (l.BitArray = W),
            (l.BitMatrix = we),
            (l.BitSource = Ui),
            (l.BrowserAztecCodeReader = Gc),
            (l.BrowserBarcodeReader = Zc),
            (l.BrowserCodeReader = ir),
            (l.BrowserDatamatrixCodeReader = e1),
            (l.BrowserMultiFormatReader = d1),
            (l.BrowserPDF417Reader = f1),
            (l.BrowserQRCodeReader = h1),
            (l.BrowserQRCodeSvgWriter = tn),
            (l.CharacterSetECI = L),
            (l.ChecksumException = D),
            (l.Code128Reader = te),
            (l.Code39Reader = at),
            (l.DataMatrixDecodedBitStreamParser = Pr),
            (l.DataMatrixReader = Br),
            (l.DecodeHintType = re),
            (l.DecoderResult = ze),
            (l.DefaultGridSampler = ea),
            (l.DetectorResult = ni),
            (l.EAN13Reader = Jr),
            (l.EncodeHintType = ct),
            (l.Exception = p),
            (l.FormatException = Q),
            (l.GenericGF = Re),
            (l.GenericGFPoly = ot),
            (l.GlobalHistogramBinarizer = Te),
            (l.GridSampler = Di),
            (l.GridSamplerInstance = Dr),
            (l.HTMLCanvasElementLuminanceSource = fe),
            (l.HybridBinarizer = ie),
            (l.ITFReader = _e),
            (l.IllegalArgumentException = T),
            (l.IllegalStateException = or),
            (l.InvertedLuminanceSource = zt),
            (l.LuminanceSource = wr),
            (l.MathUtils = Ne),
            (l.MultiFormatOneDReader = Bn),
            (l.MultiFormatReader = ha),
            (l.MultiFormatWriter = x1),
            (l.NotFoundException = k),
            (l.OneDReader = tt),
            (l.PDF417DecodedBitStreamParser = F),
            (l.PDF417DecoderErrorCorrection = aa),
            (l.PDF417Reader = pt),
            (l.PDF417ResultMetadata = ca),
            (l.PerspectiveTransform = Jt),
            (l.PlanarYUVLuminanceSource = ur),
            (l.QRCodeByteMatrix = di),
            (l.QRCodeDataMask = Wt),
            (l.QRCodeDecodedBitStreamParser = He),
            (l.QRCodeDecoderErrorCorrectionLevel = Ue),
            (l.QRCodeDecoderFormatInformation = bt),
            (l.QRCodeEncoder = je),
            (l.QRCodeEncoderQRCode = en),
            (l.QRCodeMaskUtil = Ke),
            (l.QRCodeMatrixUtil = Ae),
            (l.QRCodeMode = ge),
            (l.QRCodeReader = _r),
            (l.QRCodeVersion = he),
            (l.QRCodeWriter = Ln),
            (l.RGBLuminanceSource = Xi),
            (l.RSS14Reader = Ye),
            (l.RSSExpandedReader = G),
            (l.ReaderException = ui),
            (l.ReedSolomonDecoder = as),
            (l.ReedSolomonEncoder = Qi),
            (l.ReedSolomonException = Kt),
            (l.Result = st),
            (l.ResultMetadataType = Ze),
            (l.ResultPoint = de),
            (l.StringUtils = se),
            (l.UnsupportedOperationException = We),
            (l.VideoInputDevice = os),
            (l.WhiteRectangleDetector = yr),
            (l.WriterException = Le),
            (l.ZXingArrays = J),
            (l.ZXingCharset = ga),
            (l.ZXingInteger = H),
            (l.ZXingStandardCharsets = Gi),
            (l.ZXingStringBuilder = $),
            (l.ZXingStringEncoding = xe),
            (l.ZXingSystem = M),
            (l.createAbstractExpandedDecoder = ia),
            Object.defineProperty(l, '__esModule', { value: !0 }));
        });
      })(Qs, Qs.exports)),
    Qs.exports
  );
}
var Qe = Uf();
const jf = Object.freeze(
  Object.defineProperty({ __proto__: null }, Symbol.toStringTag, {
    value: 'Module',
  }),
);
var rl = (function () {
    function n(i, l, u) {
      if (
        ((this.formatMap = new Map([
          [ce.QR_CODE, Qe.BarcodeFormat.QR_CODE],
          [ce.AZTEC, Qe.BarcodeFormat.AZTEC],
          [ce.CODABAR, Qe.BarcodeFormat.CODABAR],
          [ce.CODE_39, Qe.BarcodeFormat.CODE_39],
          [ce.CODE_93, Qe.BarcodeFormat.CODE_93],
          [ce.CODE_128, Qe.BarcodeFormat.CODE_128],
          [ce.DATA_MATRIX, Qe.BarcodeFormat.DATA_MATRIX],
          [ce.MAXICODE, Qe.BarcodeFormat.MAXICODE],
          [ce.ITF, Qe.BarcodeFormat.ITF],
          [ce.EAN_13, Qe.BarcodeFormat.EAN_13],
          [ce.EAN_8, Qe.BarcodeFormat.EAN_8],
          [ce.PDF_417, Qe.BarcodeFormat.PDF_417],
          [ce.RSS_14, Qe.BarcodeFormat.RSS_14],
          [ce.RSS_EXPANDED, Qe.BarcodeFormat.RSS_EXPANDED],
          [ce.UPC_A, Qe.BarcodeFormat.UPC_A],
          [ce.UPC_E, Qe.BarcodeFormat.UPC_E],
          [ce.UPC_EAN_EXTENSION, Qe.BarcodeFormat.UPC_EAN_EXTENSION],
        ])),
        (this.reverseFormatMap = this.createReverseFormatMap()),
        !jf)
      )
        throw 'Use html5qrcode.min.js without edit, ZXing not found.';
      ((this.verbose = l), (this.logger = u));
      var g = this.createZXingFormats(i),
        h = new Map();
      (h.set(Qe.DecodeHintType.POSSIBLE_FORMATS, g),
        h.set(Qe.DecodeHintType.TRY_HARDER, !1),
        (this.hints = h));
    }
    return (
      (n.prototype.decodeAsync = function (i) {
        var l = this;
        return new Promise(function (u, g) {
          try {
            u(l.decode(i));
          } catch (h) {
            g(h);
          }
        });
      }),
      (n.prototype.decode = function (i) {
        var l = new Qe.MultiFormatReader(this.verbose, this.hints),
          u = new Qe.HTMLCanvasElementLuminanceSource(i),
          g = new Qe.BinaryBitmap(new Qe.HybridBinarizer(u)),
          h = l.decode(g);
        return {
          text: h.text,
          format: zc.create(this.toHtml5QrcodeSupportedFormats(h.format)),
          debugData: this.createDebugData(),
        };
      }),
      (n.prototype.createReverseFormatMap = function () {
        var i = new Map();
        return (
          this.formatMap.forEach(function (l, u, g) {
            i.set(l, u);
          }),
          i
        );
      }),
      (n.prototype.toHtml5QrcodeSupportedFormats = function (i) {
        if (!this.reverseFormatMap.has(i))
          throw "reverseFormatMap doesn't have ".concat(i);
        return this.reverseFormatMap.get(i);
      }),
      (n.prototype.createZXingFormats = function (i) {
        for (var l = [], u = 0, g = i; u < g.length; u++) {
          var h = g[u];
          this.formatMap.has(h)
            ? l.push(this.formatMap.get(h))
            : this.logger.logError(
                ''.concat(h, ' is not supported by') + 'ZXingHtml5QrcodeShim',
              );
        }
        return l;
      }),
      (n.prototype.createDebugData = function () {
        return { decoderName: 'zxing-js' };
      }),
      n
    );
  })(),
  zf = function (n, i, l, u) {
    function g(h) {
      return h instanceof l
        ? h
        : new l(function (w) {
            w(h);
          });
    }
    return new (l || (l = Promise))(function (h, w) {
      function y(R) {
        try {
          p(u.next(R));
        } catch (T) {
          w(T);
        }
      }
      function I(R) {
        try {
          p(u.throw(R));
        } catch (T) {
          w(T);
        }
      }
      function p(R) {
        R.done ? h(R.value) : g(R.value).then(y, I);
      }
      p((u = u.apply(n, i || [])).next());
    });
  },
  Vf = function (n, i) {
    var l = {
        label: 0,
        sent: function () {
          if (h[0] & 1) throw h[1];
          return h[1];
        },
        trys: [],
        ops: [],
      },
      u,
      g,
      h,
      w;
    return (
      (w = { next: y(0), throw: y(1), return: y(2) }),
      typeof Symbol == 'function' &&
        (w[Symbol.iterator] = function () {
          return this;
        }),
      w
    );
    function y(p) {
      return function (R) {
        return I([p, R]);
      };
    }
    function I(p) {
      if (u) throw new TypeError('Generator is already executing.');
      for (; w && ((w = 0), p[0] && (l = 0)), l;)
        try {
          if (
            ((u = 1),
            g &&
              (h =
                p[0] & 2
                  ? g.return
                  : p[0]
                    ? g.throw || ((h = g.return) && h.call(g), 0)
                    : g.next) &&
              !(h = h.call(g, p[1])).done)
          )
            return h;
          switch (((g = 0), h && (p = [p[0] & 2, h.value]), p[0])) {
            case 0:
            case 1:
              h = p;
              break;
            case 4:
              return (l.label++, { value: p[1], done: !1 });
            case 5:
              (l.label++, (g = p[1]), (p = [0]));
              continue;
            case 7:
              ((p = l.ops.pop()), l.trys.pop());
              continue;
            default:
              if (
                ((h = l.trys),
                !(h = h.length > 0 && h[h.length - 1]) &&
                  (p[0] === 6 || p[0] === 2))
              ) {
                l = 0;
                continue;
              }
              if (p[0] === 3 && (!h || (p[1] > h[0] && p[1] < h[3]))) {
                l.label = p[1];
                break;
              }
              if (p[0] === 6 && l.label < h[1]) {
                ((l.label = h[1]), (h = p));
                break;
              }
              if (h && l.label < h[2]) {
                ((l.label = h[2]), l.ops.push(p));
                break;
              }
              (h[2] && l.ops.pop(), l.trys.pop());
              continue;
          }
          p = i.call(n, l);
        } catch (R) {
          ((p = [6, R]), (g = 0));
        } finally {
          u = h = 0;
        }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  },
  nl = (function () {
    function n(i, l, u) {
      if (
        ((this.formatMap = new Map([
          [ce.QR_CODE, 'qr_code'],
          [ce.AZTEC, 'aztec'],
          [ce.CODABAR, 'codabar'],
          [ce.CODE_39, 'code_39'],
          [ce.CODE_93, 'code_93'],
          [ce.CODE_128, 'code_128'],
          [ce.DATA_MATRIX, 'data_matrix'],
          [ce.ITF, 'itf'],
          [ce.EAN_13, 'ean_13'],
          [ce.EAN_8, 'ean_8'],
          [ce.PDF_417, 'pdf417'],
          [ce.UPC_A, 'upc_a'],
          [ce.UPC_E, 'upc_e'],
        ])),
        (this.reverseFormatMap = this.createReverseFormatMap()),
        !n.isSupported())
      )
        throw 'Use html5qrcode.min.js without edit, Use BarcodeDetectorDelegate only if it isSupported();';
      ((this.verbose = l), (this.logger = u));
      var g = this.createBarcodeDetectorFormats(i);
      if (((this.detector = new BarcodeDetector(g)), !this.detector))
        throw 'BarcodeDetector detector not supported';
    }
    return (
      (n.isSupported = function () {
        if (!('BarcodeDetector' in window)) return !1;
        var i = new BarcodeDetector({ formats: ['qr_code'] });
        return typeof i < 'u';
      }),
      (n.prototype.decodeAsync = function (i) {
        return zf(this, void 0, void 0, function () {
          var l, u;
          return Vf(this, function (g) {
            switch (g.label) {
              case 0:
                return [4, this.detector.detect(i)];
              case 1:
                if (((l = g.sent()), !l || l.length === 0))
                  throw 'No barcode or QR code detected.';
                return (
                  (u = this.selectLargestBarcode(l)),
                  [
                    2,
                    {
                      text: u.rawValue,
                      format: zc.create(
                        this.toHtml5QrcodeSupportedFormats(u.format),
                      ),
                      debugData: this.createDebugData(),
                    },
                  ]
                );
            }
          });
        });
      }),
      (n.prototype.selectLargestBarcode = function (i) {
        for (var l = null, u = 0, g = 0, h = i; g < h.length; g++) {
          var w = h[g],
            y = w.boundingBox.width * w.boundingBox.height;
          y > u && ((u = y), (l = w));
        }
        if (!l) throw 'No largest barcode found';
        return l;
      }),
      (n.prototype.createBarcodeDetectorFormats = function (i) {
        for (var l = [], u = 0, g = i; u < g.length; u++) {
          var h = g[u];
          this.formatMap.has(h)
            ? l.push(this.formatMap.get(h))
            : this.logger.warn(
                ''.concat(h, ' is not supported by') +
                  'BarcodeDetectorDelegate',
              );
        }
        return { formats: l };
      }),
      (n.prototype.toHtml5QrcodeSupportedFormats = function (i) {
        if (!this.reverseFormatMap.has(i))
          throw "reverseFormatMap doesn't have ".concat(i);
        return this.reverseFormatMap.get(i);
      }),
      (n.prototype.createReverseFormatMap = function () {
        var i = new Map();
        return (
          this.formatMap.forEach(function (l, u, g) {
            i.set(l, u);
          }),
          i
        );
      }),
      (n.prototype.createDebugData = function () {
        return { decoderName: 'BarcodeDetector' };
      }),
      n
    );
  })(),
  sl = function (n, i, l, u) {
    function g(h) {
      return h instanceof l
        ? h
        : new l(function (w) {
            w(h);
          });
    }
    return new (l || (l = Promise))(function (h, w) {
      function y(R) {
        try {
          p(u.next(R));
        } catch (T) {
          w(T);
        }
      }
      function I(R) {
        try {
          p(u.throw(R));
        } catch (T) {
          w(T);
        }
      }
      function p(R) {
        R.done ? h(R.value) : g(R.value).then(y, I);
      }
      p((u = u.apply(n, i || [])).next());
    });
  },
  il = function (n, i) {
    var l = {
        label: 0,
        sent: function () {
          if (h[0] & 1) throw h[1];
          return h[1];
        },
        trys: [],
        ops: [],
      },
      u,
      g,
      h,
      w;
    return (
      (w = { next: y(0), throw: y(1), return: y(2) }),
      typeof Symbol == 'function' &&
        (w[Symbol.iterator] = function () {
          return this;
        }),
      w
    );
    function y(p) {
      return function (R) {
        return I([p, R]);
      };
    }
    function I(p) {
      if (u) throw new TypeError('Generator is already executing.');
      for (; w && ((w = 0), p[0] && (l = 0)), l;)
        try {
          if (
            ((u = 1),
            g &&
              (h =
                p[0] & 2
                  ? g.return
                  : p[0]
                    ? g.throw || ((h = g.return) && h.call(g), 0)
                    : g.next) &&
              !(h = h.call(g, p[1])).done)
          )
            return h;
          switch (((g = 0), h && (p = [p[0] & 2, h.value]), p[0])) {
            case 0:
            case 1:
              h = p;
              break;
            case 4:
              return (l.label++, { value: p[1], done: !1 });
            case 5:
              (l.label++, (g = p[1]), (p = [0]));
              continue;
            case 7:
              ((p = l.ops.pop()), l.trys.pop());
              continue;
            default:
              if (
                ((h = l.trys),
                !(h = h.length > 0 && h[h.length - 1]) &&
                  (p[0] === 6 || p[0] === 2))
              ) {
                l = 0;
                continue;
              }
              if (p[0] === 3 && (!h || (p[1] > h[0] && p[1] < h[3]))) {
                l.label = p[1];
                break;
              }
              if (p[0] === 6 && l.label < h[1]) {
                ((l.label = h[1]), (h = p));
                break;
              }
              if (h && l.label < h[2]) {
                ((l.label = h[2]), l.ops.push(p));
                break;
              }
              (h[2] && l.ops.pop(), l.trys.pop());
              continue;
          }
          p = i.call(n, l);
        } catch (R) {
          ((p = [6, R]), (g = 0));
        } finally {
          u = h = 0;
        }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  },
  Wf = (function () {
    function n(i, l, u, g) {
      ((this.EXECUTIONS_TO_REPORT_PERFORMANCE = 100),
        (this.executions = 0),
        (this.executionResults = []),
        (this.wasPrimaryDecoderUsedInLastDecode = !1),
        (this.verbose = u),
        l && nl.isSupported()
          ? ((this.primaryDecoder = new nl(i, u, g)),
            (this.secondaryDecoder = new rl(i, u, g)))
          : (this.primaryDecoder = new rl(i, u, g)));
    }
    return (
      (n.prototype.decodeAsync = function (i) {
        return sl(this, void 0, void 0, function () {
          var l;
          return il(this, function (u) {
            switch (u.label) {
              case 0:
                ((l = performance.now()), (u.label = 1));
              case 1:
                return (
                  u.trys.push([1, , 3, 4]),
                  [4, this.getDecoder().decodeAsync(i)]
                );
              case 2:
                return [2, u.sent()];
              case 3:
                return (this.possiblyLogPerformance(l), [7]);
              case 4:
                return [2];
            }
          });
        });
      }),
      (n.prototype.decodeRobustlyAsync = function (i) {
        return sl(this, void 0, void 0, function () {
          var l, u;
          return il(this, function (g) {
            switch (g.label) {
              case 0:
                ((l = performance.now()), (g.label = 1));
              case 1:
                return (
                  g.trys.push([1, 3, 4, 5]),
                  [4, this.primaryDecoder.decodeAsync(i)]
                );
              case 2:
                return [2, g.sent()];
              case 3:
                if (((u = g.sent()), this.secondaryDecoder))
                  return [2, this.secondaryDecoder.decodeAsync(i)];
                throw u;
              case 4:
                return (this.possiblyLogPerformance(l), [7]);
              case 5:
                return [2];
            }
          });
        });
      }),
      (n.prototype.getDecoder = function () {
        return this.secondaryDecoder
          ? this.wasPrimaryDecoderUsedInLastDecode === !1
            ? ((this.wasPrimaryDecoderUsedInLastDecode = !0),
              this.primaryDecoder)
            : ((this.wasPrimaryDecoderUsedInLastDecode = !1),
              this.secondaryDecoder)
          : this.primaryDecoder;
      }),
      (n.prototype.possiblyLogPerformance = function (i) {
        if (this.verbose) {
          var l = performance.now() - i;
          (this.executionResults.push(l),
            this.executions++,
            this.possiblyFlushPerformanceReport());
        }
      }),
      (n.prototype.possiblyFlushPerformanceReport = function () {
        if (!(this.executions < this.EXECUTIONS_TO_REPORT_PERFORMANCE)) {
          for (var i = 0, l = 0, u = this.executionResults; l < u.length; l++) {
            var g = u[l];
            i += g;
          }
          var h = i / this.executionResults.length;
          (console.log(
            ''
              .concat(h, ' ms for ')
              .concat(this.executionResults.length, ' last runs.'),
          ),
            (this.executions = 0),
            (this.executionResults = []));
        }
      }),
      n
    );
  })(),
  Zo = (function () {
    var n = function (i, l) {
      return (
        (n =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (u, g) {
              u.__proto__ = g;
            }) ||
          function (u, g) {
            for (var h in g)
              Object.prototype.hasOwnProperty.call(g, h) && (u[h] = g[h]);
          }),
        n(i, l)
      );
    };
    return function (i, l) {
      if (typeof l != 'function' && l !== null)
        throw new TypeError(
          'Class extends value ' + String(l) + ' is not a constructor or null',
        );
      n(i, l);
      function u() {
        this.constructor = i;
      }
      i.prototype =
        l === null ? Object.create(l) : ((u.prototype = l.prototype), new u());
    };
  })(),
  Ti = function (n, i, l, u) {
    function g(h) {
      return h instanceof l
        ? h
        : new l(function (w) {
            w(h);
          });
    }
    return new (l || (l = Promise))(function (h, w) {
      function y(R) {
        try {
          p(u.next(R));
        } catch (T) {
          w(T);
        }
      }
      function I(R) {
        try {
          p(u.throw(R));
        } catch (T) {
          w(T);
        }
      }
      function p(R) {
        R.done ? h(R.value) : g(R.value).then(y, I);
      }
      p((u = u.apply(n, i || [])).next());
    });
  },
  Ri = function (n, i) {
    var l = {
        label: 0,
        sent: function () {
          if (h[0] & 1) throw h[1];
          return h[1];
        },
        trys: [],
        ops: [],
      },
      u,
      g,
      h,
      w;
    return (
      (w = { next: y(0), throw: y(1), return: y(2) }),
      typeof Symbol == 'function' &&
        (w[Symbol.iterator] = function () {
          return this;
        }),
      w
    );
    function y(p) {
      return function (R) {
        return I([p, R]);
      };
    }
    function I(p) {
      if (u) throw new TypeError('Generator is already executing.');
      for (; w && ((w = 0), p[0] && (l = 0)), l;)
        try {
          if (
            ((u = 1),
            g &&
              (h =
                p[0] & 2
                  ? g.return
                  : p[0]
                    ? g.throw || ((h = g.return) && h.call(g), 0)
                    : g.next) &&
              !(h = h.call(g, p[1])).done)
          )
            return h;
          switch (((g = 0), h && (p = [p[0] & 2, h.value]), p[0])) {
            case 0:
            case 1:
              h = p;
              break;
            case 4:
              return (l.label++, { value: p[1], done: !1 });
            case 5:
              (l.label++, (g = p[1]), (p = [0]));
              continue;
            case 7:
              ((p = l.ops.pop()), l.trys.pop());
              continue;
            default:
              if (
                ((h = l.trys),
                !(h = h.length > 0 && h[h.length - 1]) &&
                  (p[0] === 6 || p[0] === 2))
              ) {
                l = 0;
                continue;
              }
              if (p[0] === 3 && (!h || (p[1] > h[0] && p[1] < h[3]))) {
                l.label = p[1];
                break;
              }
              if (p[0] === 6 && l.label < h[1]) {
                ((l.label = h[1]), (h = p));
                break;
              }
              if (h && l.label < h[2]) {
                ((l.label = h[2]), l.ops.push(p));
                break;
              }
              (h[2] && l.ops.pop(), l.trys.pop());
              continue;
          }
          p = i.call(n, l);
        } catch (R) {
          ((p = [6, R]), (g = 0));
        } finally {
          u = h = 0;
        }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  },
  Wc = (function () {
    function n(i, l) {
      ((this.name = i), (this.track = l));
    }
    return (
      (n.prototype.isSupported = function () {
        return this.track.getCapabilities
          ? this.name in this.track.getCapabilities()
          : !1;
      }),
      (n.prototype.apply = function (i) {
        var l = {};
        l[this.name] = i;
        var u = { advanced: [l] };
        return this.track.applyConstraints(u);
      }),
      (n.prototype.value = function () {
        var i = this.track.getSettings();
        if (this.name in i) {
          var l = i[this.name];
          return l;
        }
        return null;
      }),
      n
    );
  })(),
  Hf = (function (n) {
    Zo(i, n);
    function i(l, u) {
      return n.call(this, l, u) || this;
    }
    return (
      (i.prototype.min = function () {
        return this.getCapabilities().min;
      }),
      (i.prototype.max = function () {
        return this.getCapabilities().max;
      }),
      (i.prototype.step = function () {
        return this.getCapabilities().step;
      }),
      (i.prototype.apply = function (l) {
        var u = {};
        u[this.name] = l;
        var g = { advanced: [u] };
        return this.track.applyConstraints(g);
      }),
      (i.prototype.getCapabilities = function () {
        this.failIfNotSupported();
        var l = this.track.getCapabilities(),
          u = l[this.name];
        return { min: u.min, max: u.max, step: u.step };
      }),
      (i.prototype.failIfNotSupported = function () {
        if (!this.isSupported())
          throw new Error(''.concat(this.name, ' capability not supported'));
      }),
      i
    );
  })(Wc),
  Qf = (function (n) {
    Zo(i, n);
    function i(l) {
      return n.call(this, 'zoom', l) || this;
    }
    return i;
  })(Hf),
  Xf = (function (n) {
    Zo(i, n);
    function i(l) {
      return n.call(this, 'torch', l) || this;
    }
    return i;
  })(Wc),
  Gf = (function () {
    function n(i) {
      this.track = i;
    }
    return (
      (n.prototype.zoomFeature = function () {
        return new Qf(this.track);
      }),
      (n.prototype.torchFeature = function () {
        return new Xf(this.track);
      }),
      n
    );
  })(),
  Yf = (function () {
    function n(i, l, u) {
      ((this.isClosed = !1),
        (this.parentElement = i),
        (this.mediaStream = l),
        (this.callbacks = u),
        (this.surface = this.createVideoElement(
          this.parentElement.clientWidth,
        )),
        i.append(this.surface));
    }
    return (
      (n.prototype.createVideoElement = function (i) {
        var l = document.createElement('video');
        return (
          (l.style.width = ''.concat(i, 'px')),
          (l.style.display = 'block'),
          (l.muted = !0),
          l.setAttribute('muted', 'true'),
          (l.playsInline = !0),
          l
        );
      }),
      (n.prototype.setupSurface = function () {
        var i = this;
        ((this.surface.onabort = function () {
          throw 'RenderedCameraImpl video surface onabort() called';
        }),
          (this.surface.onerror = function () {
            throw 'RenderedCameraImpl video surface onerror() called';
          }));
        var l = function () {
          var u = i.surface.clientWidth,
            g = i.surface.clientHeight;
          (i.callbacks.onRenderSurfaceReady(u, g),
            i.surface.removeEventListener('playing', l));
        };
        (this.surface.addEventListener('playing', l),
          (this.surface.srcObject = this.mediaStream),
          this.surface.play());
      }),
      (n.create = function (i, l, u, g) {
        return Ti(this, void 0, void 0, function () {
          var h, w;
          return Ri(this, function (y) {
            switch (y.label) {
              case 0:
                return (
                  (h = new n(i, l, g)),
                  u.aspectRatio
                    ? ((w = { aspectRatio: u.aspectRatio }),
                      [4, h.getFirstTrackOrFail().applyConstraints(w)])
                    : [3, 2]
                );
              case 1:
                (y.sent(), (y.label = 2));
              case 2:
                return (h.setupSurface(), [2, h]);
            }
          });
        });
      }),
      (n.prototype.failIfClosed = function () {
        if (this.isClosed) throw 'The RenderedCamera has already been closed.';
      }),
      (n.prototype.getFirstTrackOrFail = function () {
        if (
          (this.failIfClosed(), this.mediaStream.getVideoTracks().length === 0)
        )
          throw 'No video tracks found';
        return this.mediaStream.getVideoTracks()[0];
      }),
      (n.prototype.pause = function () {
        (this.failIfClosed(), this.surface.pause());
      }),
      (n.prototype.resume = function (i) {
        this.failIfClosed();
        var l = this,
          u = function () {
            (setTimeout(i, 200), l.surface.removeEventListener('playing', u));
          };
        (this.surface.addEventListener('playing', u), this.surface.play());
      }),
      (n.prototype.isPaused = function () {
        return (this.failIfClosed(), this.surface.paused);
      }),
      (n.prototype.getSurface = function () {
        return (this.failIfClosed(), this.surface);
      }),
      (n.prototype.getRunningTrackCapabilities = function () {
        return this.getFirstTrackOrFail().getCapabilities();
      }),
      (n.prototype.getRunningTrackSettings = function () {
        return this.getFirstTrackOrFail().getSettings();
      }),
      (n.prototype.applyVideoConstraints = function (i) {
        return Ti(this, void 0, void 0, function () {
          return Ri(this, function (l) {
            if ('aspectRatio' in i)
              throw "Changing 'aspectRatio' in run-time is not yet supported.";
            return [2, this.getFirstTrackOrFail().applyConstraints(i)];
          });
        });
      }),
      (n.prototype.close = function () {
        if (this.isClosed) return Promise.resolve();
        var i = this;
        return new Promise(function (l, u) {
          var g = i.mediaStream.getVideoTracks(),
            h = g.length,
            w = 0;
          i.mediaStream.getVideoTracks().forEach(function (y) {
            (i.mediaStream.removeTrack(y),
              y.stop(),
              ++w,
              w >= h &&
                ((i.isClosed = !0),
                i.parentElement.removeChild(i.surface),
                l()));
          });
        });
      }),
      (n.prototype.getCapabilities = function () {
        return new Gf(this.getFirstTrackOrFail());
      }),
      n
    );
  })(),
  Kf = (function () {
    function n(i) {
      this.mediaStream = i;
    }
    return (
      (n.prototype.render = function (i, l, u) {
        return Ti(this, void 0, void 0, function () {
          return Ri(this, function (g) {
            return [2, Yf.create(i, this.mediaStream, l, u)];
          });
        });
      }),
      (n.create = function (i) {
        return Ti(this, void 0, void 0, function () {
          var l, u;
          return Ri(this, function (g) {
            switch (g.label) {
              case 0:
                if (!navigator.mediaDevices)
                  throw 'navigator.mediaDevices not supported';
                return (
                  (l = { audio: !1, video: i }),
                  [4, navigator.mediaDevices.getUserMedia(l)]
                );
              case 1:
                return ((u = g.sent()), [2, new n(u)]);
            }
          });
        });
      }),
      n
    );
  })(),
  ol = function (n, i, l, u) {
    function g(h) {
      return h instanceof l
        ? h
        : new l(function (w) {
            w(h);
          });
    }
    return new (l || (l = Promise))(function (h, w) {
      function y(R) {
        try {
          p(u.next(R));
        } catch (T) {
          w(T);
        }
      }
      function I(R) {
        try {
          p(u.throw(R));
        } catch (T) {
          w(T);
        }
      }
      function p(R) {
        R.done ? h(R.value) : g(R.value).then(y, I);
      }
      p((u = u.apply(n, i || [])).next());
    });
  },
  al = function (n, i) {
    var l = {
        label: 0,
        sent: function () {
          if (h[0] & 1) throw h[1];
          return h[1];
        },
        trys: [],
        ops: [],
      },
      u,
      g,
      h,
      w;
    return (
      (w = { next: y(0), throw: y(1), return: y(2) }),
      typeof Symbol == 'function' &&
        (w[Symbol.iterator] = function () {
          return this;
        }),
      w
    );
    function y(p) {
      return function (R) {
        return I([p, R]);
      };
    }
    function I(p) {
      if (u) throw new TypeError('Generator is already executing.');
      for (; w && ((w = 0), p[0] && (l = 0)), l;)
        try {
          if (
            ((u = 1),
            g &&
              (h =
                p[0] & 2
                  ? g.return
                  : p[0]
                    ? g.throw || ((h = g.return) && h.call(g), 0)
                    : g.next) &&
              !(h = h.call(g, p[1])).done)
          )
            return h;
          switch (((g = 0), h && (p = [p[0] & 2, h.value]), p[0])) {
            case 0:
            case 1:
              h = p;
              break;
            case 4:
              return (l.label++, { value: p[1], done: !1 });
            case 5:
              (l.label++, (g = p[1]), (p = [0]));
              continue;
            case 7:
              ((p = l.ops.pop()), l.trys.pop());
              continue;
            default:
              if (
                ((h = l.trys),
                !(h = h.length > 0 && h[h.length - 1]) &&
                  (p[0] === 6 || p[0] === 2))
              ) {
                l = 0;
                continue;
              }
              if (p[0] === 3 && (!h || (p[1] > h[0] && p[1] < h[3]))) {
                l.label = p[1];
                break;
              }
              if (p[0] === 6 && l.label < h[1]) {
                ((l.label = h[1]), (h = p));
                break;
              }
              if (h && l.label < h[2]) {
                ((l.label = h[2]), l.ops.push(p));
                break;
              }
              (h[2] && l.ops.pop(), l.trys.pop());
              continue;
          }
          p = i.call(n, l);
        } catch (R) {
          ((p = [6, R]), (g = 0));
        } finally {
          u = h = 0;
        }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  },
  Jf = (function () {
    function n() {}
    return (
      (n.failIfNotSupported = function () {
        return ol(this, void 0, void 0, function () {
          return al(this, function (i) {
            if (!navigator.mediaDevices)
              throw 'navigator.mediaDevices not supported';
            return [2, new n()];
          });
        });
      }),
      (n.prototype.create = function (i) {
        return ol(this, void 0, void 0, function () {
          return al(this, function (l) {
            return [2, Kf.create(i)];
          });
        });
      }),
      n
    );
  })(),
  qf = function (n, i, l, u) {
    function g(h) {
      return h instanceof l
        ? h
        : new l(function (w) {
            w(h);
          });
    }
    return new (l || (l = Promise))(function (h, w) {
      function y(R) {
        try {
          p(u.next(R));
        } catch (T) {
          w(T);
        }
      }
      function I(R) {
        try {
          p(u.throw(R));
        } catch (T) {
          w(T);
        }
      }
      function p(R) {
        R.done ? h(R.value) : g(R.value).then(y, I);
      }
      p((u = u.apply(n, i || [])).next());
    });
  },
  Zf = function (n, i) {
    var l = {
        label: 0,
        sent: function () {
          if (h[0] & 1) throw h[1];
          return h[1];
        },
        trys: [],
        ops: [],
      },
      u,
      g,
      h,
      w;
    return (
      (w = { next: y(0), throw: y(1), return: y(2) }),
      typeof Symbol == 'function' &&
        (w[Symbol.iterator] = function () {
          return this;
        }),
      w
    );
    function y(p) {
      return function (R) {
        return I([p, R]);
      };
    }
    function I(p) {
      if (u) throw new TypeError('Generator is already executing.');
      for (; w && ((w = 0), p[0] && (l = 0)), l;)
        try {
          if (
            ((u = 1),
            g &&
              (h =
                p[0] & 2
                  ? g.return
                  : p[0]
                    ? g.throw || ((h = g.return) && h.call(g), 0)
                    : g.next) &&
              !(h = h.call(g, p[1])).done)
          )
            return h;
          switch (((g = 0), h && (p = [p[0] & 2, h.value]), p[0])) {
            case 0:
            case 1:
              h = p;
              break;
            case 4:
              return (l.label++, { value: p[1], done: !1 });
            case 5:
              (l.label++, (g = p[1]), (p = [0]));
              continue;
            case 7:
              ((p = l.ops.pop()), l.trys.pop());
              continue;
            default:
              if (
                ((h = l.trys),
                !(h = h.length > 0 && h[h.length - 1]) &&
                  (p[0] === 6 || p[0] === 2))
              ) {
                l = 0;
                continue;
              }
              if (p[0] === 3 && (!h || (p[1] > h[0] && p[1] < h[3]))) {
                l.label = p[1];
                break;
              }
              if (p[0] === 6 && l.label < h[1]) {
                ((l.label = h[1]), (h = p));
                break;
              }
              if (h && l.label < h[2]) {
                ((l.label = h[2]), l.ops.push(p));
                break;
              }
              (h[2] && l.ops.pop(), l.trys.pop());
              continue;
          }
          p = i.call(n, l);
        } catch (R) {
          ((p = [6, R]), (g = 0));
        } finally {
          u = h = 0;
        }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  },
  $f = (function () {
    function n() {}
    return (
      (n.retrieve = function () {
        if (navigator.mediaDevices) return n.getCamerasFromMediaDevices();
        var i = MediaStreamTrack;
        return MediaStreamTrack && i.getSources
          ? n.getCamerasFromMediaStreamTrack()
          : n.rejectWithError();
      }),
      (n.rejectWithError = function () {
        var i = Vn.unableToQuerySupportedDevices();
        return (
          n.isHttpsOrLocalhost() || (i = Vn.insecureContextCameraQueryError()),
          Promise.reject(i)
        );
      }),
      (n.isHttpsOrLocalhost = function () {
        if (location.protocol === 'https:') return !0;
        var i = location.host.split(':')[0];
        return i === '127.0.0.1' || i === 'localhost';
      }),
      (n.getCamerasFromMediaDevices = function () {
        return qf(this, void 0, void 0, function () {
          var i, l, u, g, h, w, y;
          return Zf(this, function (I) {
            switch (I.label) {
              case 0:
                return (
                  (i = function (p) {
                    for (
                      var R = p.getVideoTracks(), T = 0, _ = R;
                      T < _.length;
                      T++
                    ) {
                      var D = _[T];
                      ((D.enabled = !1), D.stop(), p.removeTrack(D));
                    }
                  }),
                  [
                    4,
                    navigator.mediaDevices.getUserMedia({
                      audio: !1,
                      video: !0,
                    }),
                  ]
                );
              case 1:
                return (
                  (l = I.sent()),
                  [4, navigator.mediaDevices.enumerateDevices()]
                );
              case 2:
                for (u = I.sent(), g = [], h = 0, w = u; h < w.length; h++)
                  ((y = w[h]),
                    y.kind === 'videoinput' &&
                      g.push({ id: y.deviceId, label: y.label }));
                return (i(l), [2, g]);
            }
          });
        });
      }),
      (n.getCamerasFromMediaStreamTrack = function () {
        return new Promise(function (i, l) {
          var u = function (h) {
              for (var w = [], y = 0, I = h; y < I.length; y++) {
                var p = I[y];
                p.kind === 'video' && w.push({ id: p.id, label: p.label });
              }
              i(w);
            },
            g = MediaStreamTrack;
          g.getSources(u);
        });
      }),
      n
    );
  })(),
  qe;
(function (n) {
  ((n[(n.UNKNOWN = 0)] = 'UNKNOWN'),
    (n[(n.NOT_STARTED = 1)] = 'NOT_STARTED'),
    (n[(n.SCANNING = 2)] = 'SCANNING'),
    (n[(n.PAUSED = 3)] = 'PAUSED'));
})(qe || (qe = {}));
var eh = (function () {
    function n() {
      ((this.state = qe.NOT_STARTED),
        (this.onGoingTransactionNewState = qe.UNKNOWN));
    }
    return (
      (n.prototype.directTransition = function (i) {
        (this.failIfTransitionOngoing(),
          this.validateTransition(i),
          (this.state = i));
      }),
      (n.prototype.startTransition = function (i) {
        return (
          this.failIfTransitionOngoing(),
          this.validateTransition(i),
          (this.onGoingTransactionNewState = i),
          this
        );
      }),
      (n.prototype.execute = function () {
        if (this.onGoingTransactionNewState === qe.UNKNOWN)
          throw 'Transaction is already cancelled, cannot execute().';
        var i = this.onGoingTransactionNewState;
        ((this.onGoingTransactionNewState = qe.UNKNOWN),
          this.directTransition(i));
      }),
      (n.prototype.cancel = function () {
        if (this.onGoingTransactionNewState === qe.UNKNOWN)
          throw 'Transaction is already cancelled, cannot cancel().';
        this.onGoingTransactionNewState = qe.UNKNOWN;
      }),
      (n.prototype.getState = function () {
        return this.state;
      }),
      (n.prototype.failIfTransitionOngoing = function () {
        if (this.onGoingTransactionNewState !== qe.UNKNOWN)
          throw 'Cannot transition to a new state, already under transition';
      }),
      (n.prototype.validateTransition = function (i) {
        switch (this.state) {
          case qe.UNKNOWN:
            throw 'Transition from unknown is not allowed';
          case qe.NOT_STARTED:
            this.failIfNewStateIs(i, [qe.PAUSED]);
            break;
          case qe.SCANNING:
            break;
          case qe.PAUSED:
            break;
        }
      }),
      (n.prototype.failIfNewStateIs = function (i, l) {
        for (var u = 0, g = l; u < g.length; u++) {
          var h = g[u];
          if (i === h)
            throw 'Cannot transition from '
              .concat(this.state, ' to ')
              .concat(i);
        }
      }),
      n
    );
  })(),
  th = (function () {
    function n(i) {
      this.stateManager = i;
    }
    return (
      (n.prototype.startTransition = function (i) {
        return this.stateManager.startTransition(i);
      }),
      (n.prototype.directTransition = function (i) {
        this.stateManager.directTransition(i);
      }),
      (n.prototype.getState = function () {
        return this.stateManager.getState();
      }),
      (n.prototype.canScanFile = function () {
        return this.stateManager.getState() === qe.NOT_STARTED;
      }),
      (n.prototype.isScanning = function () {
        return this.stateManager.getState() !== qe.NOT_STARTED;
      }),
      (n.prototype.isStrictlyScanning = function () {
        return this.stateManager.getState() === qe.SCANNING;
      }),
      (n.prototype.isPaused = function () {
        return this.stateManager.getState() === qe.PAUSED;
      }),
      n
    );
  })(),
  rh = (function () {
    function n() {}
    return (
      (n.create = function () {
        return new th(new eh());
      }),
      n
    );
  })(),
  nh = (function () {
    var n = function (i, l) {
      return (
        (n =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (u, g) {
              u.__proto__ = g;
            }) ||
          function (u, g) {
            for (var h in g)
              Object.prototype.hasOwnProperty.call(g, h) && (u[h] = g[h]);
          }),
        n(i, l)
      );
    };
    return function (i, l) {
      if (typeof l != 'function' && l !== null)
        throw new TypeError(
          'Class extends value ' + String(l) + ' is not a constructor or null',
        );
      n(i, l);
      function u() {
        this.constructor = i;
      }
      i.prototype =
        l === null ? Object.create(l) : ((u.prototype = l.prototype), new u());
    };
  })(),
  Lt = (function (n) {
    nh(i, n);
    function i() {
      return (n !== null && n.apply(this, arguments)) || this;
    }
    return (
      (i.DEFAULT_WIDTH = 300),
      (i.DEFAULT_WIDTH_OFFSET = 2),
      (i.FILE_SCAN_MIN_HEIGHT = 300),
      (i.FILE_SCAN_HIDDEN_CANVAS_PADDING = 100),
      (i.MIN_QR_BOX_SIZE = 50),
      (i.SHADED_LEFT = 1),
      (i.SHADED_RIGHT = 2),
      (i.SHADED_TOP = 3),
      (i.SHADED_BOTTOM = 4),
      (i.SHADED_REGION_ELEMENT_ID = 'qr-shaded-region'),
      (i.VERBOSE = !1),
      (i.BORDER_SHADER_DEFAULT_COLOR = '#ffffff'),
      (i.BORDER_SHADER_MATCH_COLOR = 'rgb(90, 193, 56)'),
      i
    );
  })(_f),
  sh = (function () {
    function n(i, l) {
      ((this.logger = l),
        (this.fps = Lt.SCAN_DEFAULT_FPS),
        i
          ? (i.fps && (this.fps = i.fps),
            (this.disableFlip = i.disableFlip === !0),
            (this.qrbox = i.qrbox),
            (this.aspectRatio = i.aspectRatio),
            (this.videoConstraints = i.videoConstraints))
          : (this.disableFlip = Lt.DEFAULT_DISABLE_FLIP));
    }
    return (
      (n.prototype.isMediaStreamConstraintsValid = function () {
        return this.videoConstraints
          ? Vc.isMediaStreamConstraintsValid(this.videoConstraints, this.logger)
          : (this.logger.logError('Empty videoConstraints', !0), !1);
      }),
      (n.prototype.isShadedBoxEnabled = function () {
        return !Sr(this.qrbox);
      }),
      (n.create = function (i, l) {
        return new n(i, l);
      }),
      n
    );
  })(),
  ll = (function () {
    function n(i, l) {
      if (
        ((this.element = null),
        (this.canvasElement = null),
        (this.scannerPausedUiElement = null),
        (this.hasBorderShaders = null),
        (this.borderShaders = null),
        (this.qrMatch = null),
        (this.renderedCamera = null),
        (this.qrRegion = null),
        (this.context = null),
        (this.lastScanImageFile = null),
        (this.isScanning = !1),
        !document.getElementById(i))
      )
        throw 'HTML Element with id='.concat(i, ' not found');
      ((this.elementId = i), (this.verbose = !1));
      var u;
      (typeof l == 'boolean'
        ? (this.verbose = l === !0)
        : l &&
          ((u = l), (this.verbose = u.verbose === !0), u.experimentalFeatures),
        (this.logger = new kf(this.verbose)),
        (this.qrcode = new Wf(
          this.getSupportedFormats(l),
          this.getUseBarCodeDetectorIfSupported(u),
          this.verbose,
          this.logger,
        )),
        this.foreverScanTimeout,
        (this.shouldScan = !0),
        (this.stateManagerProxy = rh.create()));
    }
    return (
      (n.prototype.start = function (i, l, u, g) {
        var h = this;
        if (!i) throw 'cameraIdOrConfig is required';
        if (!u || typeof u != 'function')
          throw 'qrCodeSuccessCallback is required and should be a function.';
        var w;
        g ? (w = g) : (w = this.verbose ? this.logger.log : function () {});
        var y = sh.create(l, this.logger);
        this.clearElement();
        var I = !1;
        y.videoConstraints &&
          (y.isMediaStreamConstraintsValid()
            ? (I = !0)
            : this.logger.logError(
                "'videoConstraints' is not valid 'MediaStreamConstraints, it will be ignored.'",
                !0,
              ));
        var p = I,
          R = document.getElementById(this.elementId);
        (R.clientWidth ? R.clientWidth : Lt.DEFAULT_WIDTH,
          (R.style.position = 'relative'),
          (this.shouldScan = !0),
          (this.element = R));
        var T = this,
          _ = this.stateManagerProxy.startTransition(qe.SCANNING);
        return new Promise(function (D, z) {
          var M = p ? y.videoConstraints : T.createVideoConstraints(i);
          if (!M) {
            (_.cancel(), z('videoConstraints should be defined'));
            return;
          }
          var X = {};
          (!p || y.aspectRatio) && (X.aspectRatio = y.aspectRatio);
          var Y = {
            onRenderSurfaceReady: function (J, H) {
              (T.setupUi(J, H, y), (T.isScanning = !0), T.foreverScan(y, u, w));
            },
          };
          Jf.failIfNotSupported()
            .then(function (J) {
              J.create(M)
                .then(function (H) {
                  return H.render(h.element, X, Y)
                    .then(function (W) {
                      ((T.renderedCamera = W), _.execute(), D(null));
                    })
                    .catch(function (W) {
                      (_.cancel(), z(W));
                    });
                })
                .catch(function (H) {
                  (_.cancel(), z(Vn.errorGettingUserMedia(H)));
                });
            })
            .catch(function (J) {
              (_.cancel(), z(Vn.cameraStreamingNotSupported()));
            });
        });
      }),
      (n.prototype.pause = function (i) {
        if (!this.stateManagerProxy.isStrictlyScanning())
          throw 'Cannot pause, scanner is not scanning.';
        (this.stateManagerProxy.directTransition(qe.PAUSED),
          this.showPausedState(),
          (Sr(i) || i !== !0) && (i = !1),
          i && this.renderedCamera && this.renderedCamera.pause());
      }),
      (n.prototype.resume = function () {
        if (!this.stateManagerProxy.isPaused())
          throw 'Cannot result, scanner is not paused.';
        if (!this.renderedCamera)
          throw "renderedCamera doesn't exist while trying resume()";
        var i = this,
          l = function () {
            (i.stateManagerProxy.directTransition(qe.SCANNING),
              i.hidePausedState());
          };
        if (!this.renderedCamera.isPaused()) {
          l();
          return;
        }
        this.renderedCamera.resume(function () {
          l();
        });
      }),
      (n.prototype.getState = function () {
        return this.stateManagerProxy.getState();
      }),
      (n.prototype.stop = function () {
        var i = this;
        if (!this.stateManagerProxy.isScanning())
          throw 'Cannot stop, scanner is not running or paused.';
        var l = this.stateManagerProxy.startTransition(qe.NOT_STARTED);
        ((this.shouldScan = !1),
          this.foreverScanTimeout && clearTimeout(this.foreverScanTimeout));
        var u = function () {
            if (i.element) {
              var h = document.getElementById(Lt.SHADED_REGION_ELEMENT_ID);
              h && i.element.removeChild(h);
            }
          },
          g = this;
        return this.renderedCamera.close().then(function () {
          return (
            (g.renderedCamera = null),
            g.element &&
              (g.element.removeChild(g.canvasElement),
              (g.canvasElement = null)),
            u(),
            g.qrRegion && (g.qrRegion = null),
            g.context && (g.context = null),
            l.execute(),
            g.hidePausedState(),
            (g.isScanning = !1),
            Promise.resolve()
          );
        });
      }),
      (n.prototype.scanFile = function (i, l) {
        return this.scanFileV2(i, l).then(function (u) {
          return u.decodedText;
        });
      }),
      (n.prototype.scanFileV2 = function (i, l) {
        var u = this;
        if (!i || !(i instanceof File))
          throw "imageFile argument is mandatory and should be instance of File. Use 'event.target.files[0]'.";
        if ((Sr(l) && (l = !0), !this.stateManagerProxy.canScanFile()))
          throw 'Cannot start file scan - ongoing camera scan';
        return new Promise(function (g, h) {
          (u.possiblyCloseLastScanImageFile(),
            u.clearElement(),
            (u.lastScanImageFile = URL.createObjectURL(i)));
          var w = new Image();
          ((w.onload = function () {
            var y = w.width,
              I = w.height,
              p = document.getElementById(u.elementId),
              R = p.clientWidth ? p.clientWidth : Lt.DEFAULT_WIDTH,
              T = Math.max(
                p.clientHeight ? p.clientHeight : I,
                Lt.FILE_SCAN_MIN_HEIGHT,
              ),
              _ = u.computeCanvasDrawConfig(y, I, R, T);
            if (l) {
              var D = u.createCanvasElement(R, T, 'qr-canvas-visible');
              ((D.style.display = 'inline-block'), p.appendChild(D));
              var z = D.getContext('2d');
              if (!z) throw 'Unable to get 2d context from canvas';
              ((z.canvas.width = R),
                (z.canvas.height = T),
                z.drawImage(w, 0, 0, y, I, _.x, _.y, _.width, _.height));
            }
            var M = Lt.FILE_SCAN_HIDDEN_CANVAS_PADDING,
              X = Math.max(w.width, _.width),
              Y = Math.max(w.height, _.height),
              J = X + 2 * M,
              H = Y + 2 * M,
              W = u.createCanvasElement(J, H);
            p.appendChild(W);
            var ne = W.getContext('2d');
            if (!ne) throw 'Unable to get 2d context from canvas';
            ((ne.canvas.width = J),
              (ne.canvas.height = H),
              ne.drawImage(w, 0, 0, y, I, M, M, X, Y));
            try {
              u.qrcode
                .decodeRobustlyAsync(W)
                .then(function (re) {
                  g(el.createFromQrcodeResult(re));
                })
                .catch(h);
            } catch (re) {
              h('QR code parse error, error = '.concat(re));
            }
          }),
            (w.onerror = h),
            (w.onabort = h),
            (w.onstalled = h),
            (w.onsuspend = h),
            (w.src = URL.createObjectURL(i)));
        });
      }),
      (n.prototype.clear = function () {
        this.clearElement();
      }),
      (n.getCameras = function () {
        return $f.retrieve();
      }),
      (n.prototype.getRunningTrackCapabilities = function () {
        return this.getRenderedCameraOrFail().getRunningTrackCapabilities();
      }),
      (n.prototype.getRunningTrackSettings = function () {
        return this.getRenderedCameraOrFail().getRunningTrackSettings();
      }),
      (n.prototype.getRunningTrackCameraCapabilities = function () {
        return this.getRenderedCameraOrFail().getCapabilities();
      }),
      (n.prototype.applyVideoConstraints = function (i) {
        if (i) {
          if (!Vc.isMediaStreamConstraintsValid(i, this.logger))
            throw 'invalid videoConstaints passed, check logs for more details';
        } else throw 'videoConstaints is required argument.';
        return this.getRenderedCameraOrFail().applyVideoConstraints(i);
      }),
      (n.prototype.getRenderedCameraOrFail = function () {
        if (this.renderedCamera == null)
          throw 'Scanning is not in running state, call this API only when QR code scanning using camera is in running state.';
        return this.renderedCamera;
      }),
      (n.prototype.getSupportedFormats = function (i) {
        var l = [
          ce.QR_CODE,
          ce.AZTEC,
          ce.CODABAR,
          ce.CODE_39,
          ce.CODE_93,
          ce.CODE_128,
          ce.DATA_MATRIX,
          ce.MAXICODE,
          ce.ITF,
          ce.EAN_13,
          ce.EAN_8,
          ce.PDF_417,
          ce.RSS_14,
          ce.RSS_EXPANDED,
          ce.UPC_A,
          ce.UPC_E,
          ce.UPC_EAN_EXTENSION,
        ];
        if (!i || typeof i == 'boolean' || !i.formatsToSupport) return l;
        if (!Array.isArray(i.formatsToSupport))
          throw 'configOrVerbosityFlag.formatsToSupport should be undefined or an array.';
        if (i.formatsToSupport.length === 0)
          throw 'Atleast 1 formatsToSupport is needed.';
        for (var u = [], g = 0, h = i.formatsToSupport; g < h.length; g++) {
          var w = h[g];
          Bf(w)
            ? u.push(w)
            : this.logger.warn(
                'Invalid format: '.concat(w, ' passed in config, ignoring.'),
              );
        }
        if (u.length === 0)
          throw 'None of formatsToSupport match supported values.';
        return u;
      }),
      (n.prototype.getUseBarCodeDetectorIfSupported = function (i) {
        if (Sr(i)) return !0;
        if (!Sr(i.useBarCodeDetectorIfSupported))
          return i.useBarCodeDetectorIfSupported !== !1;
        if (Sr(i.experimentalFeatures)) return !0;
        var l = i.experimentalFeatures;
        return Sr(l.useBarCodeDetectorIfSupported)
          ? !0
          : l.useBarCodeDetectorIfSupported !== !1;
      }),
      (n.prototype.validateQrboxSize = function (i, l, u) {
        var g = this,
          h = u.qrbox;
        this.validateQrboxConfig(h);
        var w = this.toQrdimensions(i, l, h),
          y = function (p) {
            if (p < Lt.MIN_QR_BOX_SIZE)
              throw (
                "minimum size of 'config.qrbox' dimension value is" +
                ' '.concat(Lt.MIN_QR_BOX_SIZE, 'px.')
              );
          },
          I = function (p) {
            return (
              p > i &&
                (g.logger.warn(
                  '`qrbox.width` or `qrbox` is larger than the width of the root element. The width will be truncated to the width of root element.',
                ),
                (p = i)),
              p
            );
          };
        (y(w.width), y(w.height), (w.width = I(w.width)));
      }),
      (n.prototype.validateQrboxConfig = function (i) {
        if (
          typeof i != 'number' &&
          typeof i != 'function' &&
          (i.width === void 0 || i.height === void 0)
        )
          throw "Invalid instance of QrDimensions passed for 'config.qrbox'. Both 'width' and 'height' should be set.";
      }),
      (n.prototype.toQrdimensions = function (i, l, u) {
        if (typeof u == 'number') return { width: u, height: u };
        if (typeof u == 'function')
          try {
            return u(i, l);
          } catch (g) {
            throw new Error(
              'qrbox config was passed as a function but it failed with unknown error' +
                g,
            );
          }
        return u;
      }),
      (n.prototype.setupUi = function (i, l, u) {
        u.isShadedBoxEnabled() && this.validateQrboxSize(i, l, u);
        var g = Sr(u.qrbox) ? { width: i, height: l } : u.qrbox;
        this.validateQrboxConfig(g);
        var h = this.toQrdimensions(i, l, g);
        h.height > l &&
          this.logger.warn(
            '[Html5Qrcode] config.qrbox has height that isgreater than the height of the video stream. Shading will be ignored',
          );
        var w = u.isShadedBoxEnabled() && h.height <= l,
          y = { x: 0, y: 0, width: i, height: l },
          I = w ? this.getShadedRegionBounds(i, l, h) : y,
          p = this.createCanvasElement(I.width, I.height),
          R = { willReadFrequently: !0 },
          T = p.getContext('2d', R);
        ((T.canvas.width = I.width),
          (T.canvas.height = I.height),
          this.element.append(p),
          w && this.possiblyInsertShadingElement(this.element, i, l, h),
          this.createScannerPausedUiElement(this.element),
          (this.qrRegion = I),
          (this.context = T),
          (this.canvasElement = p));
      }),
      (n.prototype.createScannerPausedUiElement = function (i) {
        var l = document.createElement('div');
        ((l.innerText = Vn.scannerPaused()),
          (l.style.display = 'none'),
          (l.style.position = 'absolute'),
          (l.style.top = '0px'),
          (l.style.zIndex = '1'),
          (l.style.background = 'rgba(9, 9, 9, 0.46)'),
          (l.style.color = '#FFECEC'),
          (l.style.textAlign = 'center'),
          (l.style.width = '100%'),
          i.appendChild(l),
          (this.scannerPausedUiElement = l));
      }),
      (n.prototype.scanContext = function (i, l) {
        var u = this;
        return this.stateManagerProxy.isPaused()
          ? Promise.resolve(!1)
          : this.qrcode
              .decodeAsync(this.canvasElement)
              .then(function (g) {
                return (
                  i(g.text, el.createFromQrcodeResult(g)),
                  u.possiblyUpdateShaders(!0),
                  !0
                );
              })
              .catch(function (g) {
                u.possiblyUpdateShaders(!1);
                var h = Vn.codeParseError(g);
                return (l(h, Lf.createFrom(h)), !1);
              });
      }),
      (n.prototype.foreverScan = function (i, l, u) {
        var g = this;
        if (this.shouldScan && this.renderedCamera) {
          var h = this.renderedCamera.getSurface(),
            w = h.videoWidth / h.clientWidth,
            y = h.videoHeight / h.clientHeight;
          if (!this.qrRegion)
            throw 'qrRegion undefined when localMediaStream is ready.';
          var I = this.qrRegion.width * w,
            p = this.qrRegion.height * y,
            R = this.qrRegion.x * w,
            T = this.qrRegion.y * y;
          this.context.drawImage(
            h,
            R,
            T,
            I,
            p,
            0,
            0,
            this.qrRegion.width,
            this.qrRegion.height,
          );
          var _ = function () {
            g.foreverScanTimeout = setTimeout(function () {
              g.foreverScan(i, l, u);
            }, g.getTimeoutFps(i.fps));
          };
          this.scanContext(l, u)
            .then(function (D) {
              !D && i.disableFlip !== !0
                ? (g.context.translate(g.context.canvas.width, 0),
                  g.context.scale(-1, 1),
                  g.scanContext(l, u).finally(function () {
                    _();
                  }))
                : _();
            })
            .catch(function (D) {
              (g.logger.logError('Error happend while scanning context', D),
                _());
            });
        }
      }),
      (n.prototype.createVideoConstraints = function (i) {
        if (typeof i == 'string') return { deviceId: { exact: i } };
        if (typeof i == 'object') {
          var l = 'facingMode',
            u = 'deviceId',
            g = { user: !0, environment: !0 },
            h = 'exact',
            w = function (z) {
              if (z in g) return !0;
              throw (
                "config has invalid 'facingMode' value = " + "'".concat(z, "'")
              );
            },
            y = Object.keys(i);
          if (y.length !== 1)
            throw (
              "'cameraIdOrConfig' object should have exactly 1 key," +
              ' if passed as an object, found '.concat(y.length, ' keys')
            );
          var I = Object.keys(i)[0];
          if (I !== l && I !== u)
            throw (
              "Only '".concat(l, "' and '").concat(u, "' ") +
              " are supported for 'cameraIdOrConfig'"
            );
          if (I === l) {
            var p = i.facingMode;
            if (typeof p == 'string') {
              if (w(p)) return { facingMode: p };
            } else if (typeof p == 'object')
              if (h in p) {
                if (w(p[''.concat(h)]))
                  return { facingMode: { exact: p[''.concat(h)] } };
              } else
                throw (
                  "'facingMode' should be string or object with" +
                  ' '.concat(h, ' as key.')
                );
            else {
              var R = typeof p;
              throw "Invalid type of 'facingMode' = ".concat(R);
            }
          } else {
            var T = i.deviceId;
            if (typeof T == 'string') return { deviceId: T };
            if (typeof T == 'object') {
              if (h in T) return { deviceId: { exact: T[''.concat(h)] } };
              throw (
                "'deviceId' should be string or object with" +
                ' '.concat(h, ' as key.')
              );
            } else {
              var _ = typeof T;
              throw "Invalid type of 'deviceId' = ".concat(_);
            }
          }
        }
        var D = typeof i;
        throw "Invalid type of 'cameraIdOrConfig' = ".concat(D);
      }),
      (n.prototype.computeCanvasDrawConfig = function (i, l, u, g) {
        if (i <= u && l <= g) {
          var h = (u - i) / 2,
            w = (g - l) / 2;
          return { x: h, y: w, width: i, height: l };
        } else {
          var y = i,
            I = l;
          return (
            i > u && ((l = (u / i) * l), (i = u)),
            l > g && ((i = (g / l) * i), (l = g)),
            this.logger.log(
              'Image downsampled from ' +
                ''.concat(y, 'X').concat(I) +
                ' to '.concat(i, 'X').concat(l, '.'),
            ),
            this.computeCanvasDrawConfig(i, l, u, g)
          );
        }
      }),
      (n.prototype.clearElement = function () {
        if (this.stateManagerProxy.isScanning())
          throw 'Cannot clear while scan is ongoing, close it first.';
        var i = document.getElementById(this.elementId);
        i && (i.innerHTML = '');
      }),
      (n.prototype.possiblyUpdateShaders = function (i) {
        this.qrMatch !== i &&
          (this.hasBorderShaders &&
            this.borderShaders &&
            this.borderShaders.length &&
            this.borderShaders.forEach(function (l) {
              l.style.backgroundColor = i
                ? Lt.BORDER_SHADER_MATCH_COLOR
                : Lt.BORDER_SHADER_DEFAULT_COLOR;
            }),
          (this.qrMatch = i));
      }),
      (n.prototype.possiblyCloseLastScanImageFile = function () {
        this.lastScanImageFile &&
          (URL.revokeObjectURL(this.lastScanImageFile),
          (this.lastScanImageFile = null));
      }),
      (n.prototype.createCanvasElement = function (i, l, u) {
        var g = i,
          h = l,
          w = document.createElement('canvas');
        return (
          (w.style.width = ''.concat(g, 'px')),
          (w.style.height = ''.concat(h, 'px')),
          (w.style.display = 'none'),
          (w.id = Sr(u) ? 'qr-canvas' : u),
          w
        );
      }),
      (n.prototype.getShadedRegionBounds = function (i, l, u) {
        if (u.width > i || u.height > l)
          throw "'config.qrbox' dimensions should not be greater than the dimensions of the root HTML element.";
        return {
          x: (i - u.width) / 2,
          y: (l - u.height) / 2,
          width: u.width,
          height: u.height,
        };
      }),
      (n.prototype.possiblyInsertShadingElement = function (i, l, u, g) {
        if (!(l - g.width < 1 || u - g.height < 1)) {
          var h = document.createElement('div');
          h.style.position = 'absolute';
          var w = (l - g.width) / 2,
            y = (u - g.height) / 2;
          if (
            ((h.style.borderLeft = ''.concat(
              w,
              'px solid rgba(0, 0, 0, 0.48)',
            )),
            (h.style.borderRight = ''.concat(
              w,
              'px solid rgba(0, 0, 0, 0.48)',
            )),
            (h.style.borderTop = ''.concat(y, 'px solid rgba(0, 0, 0, 0.48)')),
            (h.style.borderBottom = ''.concat(
              y,
              'px solid rgba(0, 0, 0, 0.48)',
            )),
            (h.style.boxSizing = 'border-box'),
            (h.style.top = '0px'),
            (h.style.bottom = '0px'),
            (h.style.left = '0px'),
            (h.style.right = '0px'),
            (h.id = ''.concat(Lt.SHADED_REGION_ELEMENT_ID)),
            l - g.width < 11 || u - g.height < 11)
          )
            this.hasBorderShaders = !1;
          else {
            var I = 5,
              p = 40;
            (this.insertShaderBorders(h, p, I, -I, null, 0, !0),
              this.insertShaderBorders(h, p, I, -I, null, 0, !1),
              this.insertShaderBorders(h, p, I, null, -I, 0, !0),
              this.insertShaderBorders(h, p, I, null, -I, 0, !1),
              this.insertShaderBorders(h, I, p + I, -I, null, -I, !0),
              this.insertShaderBorders(h, I, p + I, null, -I, -I, !0),
              this.insertShaderBorders(h, I, p + I, -I, null, -I, !1),
              this.insertShaderBorders(h, I, p + I, null, -I, -I, !1),
              (this.hasBorderShaders = !0));
          }
          i.append(h);
        }
      }),
      (n.prototype.insertShaderBorders = function (i, l, u, g, h, w, y) {
        var I = document.createElement('div');
        ((I.style.position = 'absolute'),
          (I.style.backgroundColor = Lt.BORDER_SHADER_DEFAULT_COLOR),
          (I.style.width = ''.concat(l, 'px')),
          (I.style.height = ''.concat(u, 'px')),
          g !== null && (I.style.top = ''.concat(g, 'px')),
          h !== null && (I.style.bottom = ''.concat(h, 'px')),
          y
            ? (I.style.left = ''.concat(w, 'px'))
            : (I.style.right = ''.concat(w, 'px')),
          this.borderShaders || (this.borderShaders = []),
          this.borderShaders.push(I),
          i.appendChild(I));
      }),
      (n.prototype.showPausedState = function () {
        if (!this.scannerPausedUiElement)
          throw '[internal error] scanner paused UI element not found';
        this.scannerPausedUiElement.style.display = 'block';
      }),
      (n.prototype.hidePausedState = function () {
        if (!this.scannerPausedUiElement)
          throw '[internal error] scanner paused UI element not found';
        this.scannerPausedUiElement.style.display = 'none';
      }),
      (n.prototype.getTimeoutFps = function (i) {
        return 1e3 / i;
      }),
      n
    );
  })(),
  cl;
(function (n) {
  ((n[(n.STATUS_DEFAULT = 0)] = 'STATUS_DEFAULT'),
    (n[(n.STATUS_SUCCESS = 1)] = 'STATUS_SUCCESS'),
    (n[(n.STATUS_WARNING = 2)] = 'STATUS_WARNING'),
    (n[(n.STATUS_REQUESTING_PERMISSION = 3)] = 'STATUS_REQUESTING_PERMISSION'));
})(cl || (cl = {}));
const ih = ({ isVisible: n, onScan: i, onClose: l }) => {
  const u = P.useRef(!1),
    g = P.useRef(void 0),
    [h, w] = P.useState([]),
    [y, I] = P.useState(1),
    p = P.useCallback(() => {
      u.current = !1;
    }, []);
  P.useEffect(() => {
    n || p();
  }, [n, p]);
  const R = P.useCallback(
    ({ data: M }) => {
      u.current ||
        ((u.current = !0),
        Promise.resolve(i(M)).catch(() => {
          u.current = !1;
        }));
    },
    [i],
  );
  if (
    (P.useEffect(() => {
      n && T();
    }, [n]),
    !n)
  )
    return null;
  async function T() {
    g.current || (g.current = new ll('qr'));
    const M = await ll.getCameras();
    w(M);
    const X = M.length > 1 ? 1 : 0;
    I(X);
    try {
      await g.current.start(M[X].id, void 0, _, () => {});
    } catch (Y) {
      console.error('QR Scanner initialization failed:', Y);
    }
  }
  function _(M) {
    let X = M.trim();
    const Y = X.match(/ton:\/\/transfer\/(.+)/);
    (Y && (X = Y[1]), R({ data: X }), D());
  }
  async function D() {
    try {
      (await g.current.stop(), l());
    } catch (M) {
      console.error('Error stopping QR scanner:', M);
    }
  }
  async function z() {
    const M = (y + 1) % h.length;
    I(M);
    try {
      await g.current.stop();
    } catch (X) {
      console.error('Error stopping QR scanner before flipping camera:', X);
    }
    try {
      await g.current.start(h[M].id, void 0, _, () => {});
    } catch (X) {
      console.error('Error switching camera', X);
    }
  }
  return b.jsx(b.Fragment, {
    children:
      n &&
      b.jsx('div', {
        className:
          'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4',
        onClick: (M) => {
          (M.stopPropagation(), M.target === M.currentTarget && D());
        },
        children: b.jsx('div', {
          className: 'relative w-full max-w-sm',
          onClick: (M) => {
            M.stopPropagation();
          },
          children: b.jsxs('div', {
            className: 'space-y-4',
            children: [
              b.jsxs('div', {
                className: 'flex justify-between',
                children: [
                  b.jsx('button', {
                    type: 'button',
                    onClick: (M) => {
                      (M.stopPropagation(), D());
                    },
                    className: 'text-white',
                    children: 'Close',
                  }),
                  h.length > 1 &&
                    b.jsx('button', {
                      type: 'button',
                      onClick: (M) => {
                        (M.stopPropagation(), z());
                      },
                      className: 'text-white',
                      children: 'Flip Camera',
                    }),
                ],
              }),
              b.jsx('div', { id: 'qr', className: 'w-full h-full rounded-lg' }),
            ],
          }),
        }),
      }),
  });
};
function oh({ toAddr: n, setToAddr: i }) {
  const [l, u] = P.useState(!1);
  return b.jsxs('div', {
    className: 'flex',
    children: [
      b.jsx(Yt, {
        type: 'text',
        placeholder: 'EQA...',
        value: n,
        onChange: (g) => i(g.target.value),
      }),
      b.jsx('button', {
        type: 'button',
        onClick: () => u(!0),
        className: 'p-1',
        children: b.jsx(Y1, {}),
      }),
      b.jsx(ih, {
        isVisible: l,
        onClose: () => u(!1),
        onScan: (g) => {
          g && (i(g.trim()), u(!1));
        },
      }),
    ],
  });
}
const ah = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
  Xs = 'kQCPnceJsnacJr4XNVq52TC5Sw4E1MrqWCMdd82KJJNenoOT',
  lh = '0:0000000000000000000000000000000000000000000000000000000000000000';
function ti(n) {
  try {
    return ee.Address.parse(n.trim());
  } catch {
    return null;
  }
}
function ch({ network: n, initialAddress: i, onAddressChange: l }) {
  var L, We;
  const [u] = yl(),
    g = R1(),
    h = n === 'testnet' ? Xs : ah,
    [w] = P.useState(i || h),
    [y, I] = P.useState(null),
    [p, R] = P.useState(null),
    [T, _] = P.useState(!1),
    [D, z] = P.useState('vote'),
    [M, X] = P.useState(null),
    Y =
      (L = g == null ? void 0 : g.account) != null && L.address
        ? ee.Address.parse(g.account.address)
        : null,
    J = !!g,
    { theme: H } = Xc(),
    W = P.useCallback(async () => {
      if (!w.trim()) {
        X({ type: 'error', message: 'Enter a contract address' });
        return;
      }
      (_(!0), X(null), I(null));
      try {
        const xe = await B0(n, w.trim());
        (I({
          totalSupply: xe.totalSupply,
          mintable: xe.mintable,
          adminAddress: xe.adminAddress,
          metadata: xe.metadata,
        }),
          J && R(await _0(Y)));
      } catch (xe) {
        const se = Ut(xe);
        se.includes('exit_code') ||
        se.includes('-13') ||
        se.includes('unable to execute')
          ? X({
              type: 'error',
              message: `Contract not found on ${n === 'mainnet' ? 'Mainnet' : 'Testnet'}. Make sure the address is correct or try switching to ${n === 'mainnet' ? 'Testnet' : 'Mainnet'}.`,
            })
          : X({ type: 'error', message: se || 'Failed to load jetton data' });
      } finally {
        (_(!1),
          X((xe) => ((xe == null ? void 0 : xe.type) === 'info' ? null : xe)));
      }
    }, [w, n, Y, J]);
  P.useEffect(() => {
    w.trim() && (l(w.trim()), W());
  }, [n]);
  const ne = y && Y && y.adminAddress ? y.adminAddress.equals(Y) : !1;
  P.useEffect(() => {
    !ne && D === 'admin' && z('vote');
  }, [ne, D]);
  const re =
      parseInt(
        ((We = y == null ? void 0 : y.metadata) == null
          ? void 0
          : We.decimals) || '9',
      ) || 9,
    Q = ne
      ? ['admin', 'transfer', 'burn', 'invite', 'vote', 'destroy']
      : ['invite', 'vote', 'transfer', 'burn'];
  function V(xe) {
    const se = 10n ** BigInt(re),
      $ = xe / se,
      we = xe % se;
    if (we === 0n) return $.toString();
    const k = we.toString().padStart(re, '0').replace(/0+$/, '');
    return `${$}.${k}`;
  }
  return b.jsxs('div', {
    className:
      'grid grid-cols-[1fr_320px] gap-5 items-start max-md:grid-cols-1',
    children: [
      b.jsx('div', {
        className: 'space-y-4.5',
        children:
          y &&
          b.jsx(Ws, {
            children: b.jsx(Hs, {
              children: b.jsxs(cf, {
                value: D,
                onValueChange: (xe) => {
                  (z(xe), X(null));
                },
                children: [
                  b.jsx(uf, {
                    className: 'w-full h-10 rounded-full p-0.75',
                    style: {
                      background: H === 'light' ? '#F0F1F3' : '#222224',
                    },
                    children: Q.map((xe) =>
                      b.jsx(
                        df,
                        {
                          value: xe,
                          className:
                            'flex-1 h-8.5 rounded-full text-[13px] font-bold uppercase tracking-wider text-[#9a9a9f] hover:text-foreground data-[state=active]:bg-[#0098EA] data-[state=active]:text-white',
                          children: xe.charAt(0).toUpperCase() + xe.slice(1),
                        },
                        xe,
                      ),
                    ),
                  }),
                  b.jsx(jn, {
                    value: 'transfer',
                    className: 'mt-5',
                    children: b.jsx(gh, {
                      decimals: re,
                      isConnected: J,
                      network: n,
                      tonConnectUI: u,
                      ownerAddress: Y,
                    }),
                  }),
                  b.jsx(jn, {
                    value: 'burn',
                    className: 'mt-5',
                    children: b.jsx(ph, {
                      decimals: re,
                      isConnected: J,
                      network: n,
                      tonConnectUI: u,
                      ownerAddress: Y,
                      onSuccess: W,
                    }),
                  }),
                  b.jsx(jn, {
                    value: 'invite',
                    className: 'mt-5',
                    children: b.jsx(xh, {
                      network: n,
                      tonConnectUI: u,
                      ownerAddress: Y,
                    }),
                  }),
                  b.jsx(jn, {
                    value: 'vote',
                    className: 'mt-5',
                    children: b.jsx(Ah, {
                      network: n,
                      tonConnectUI: u,
                      ownerAddress: Y,
                    }),
                  }),
                  b.jsx(jn, {
                    value: 'destroy',
                    className: 'mt-5',
                    children: b.jsx(mh, {
                      network: n,
                      tonConnectUI: u,
                      ownerAddress: Y,
                    }),
                  }),
                  ne &&
                    b.jsx(jn, {
                      value: 'admin',
                      className: 'mt-5',
                      children: b.jsx(wh, {
                        contractAddr: w,
                        info: y,
                        isAdmin: ne,
                        isConnected: J,
                        network: n,
                        tonConnectUI: u,
                        ownerAddress: Y,
                        onSuccess: W,
                      }),
                    }),
                ],
              }),
            }),
          }),
      }),
      b.jsx(uh, {
        userBalance: (p == null ? void 0 : p.jettonBalance) || 0n,
        info: y,
        decimals: re,
        formatAmount: V,
        isAdmin: ne,
        network: n,
        loading: T,
        error:
          !y && (M == null ? void 0 : M.type) === 'error' ? M.message : null,
        contractAddr: w,
      }),
    ],
  });
}
function uh({
  userBalance: n,
  info: i,
  decimals: l,
  formatAmount: u,
  isAdmin: g,
  network: h,
  loading: w,
  error: y,
  contractAddr: I,
}) {
  const [p, R] = P.useState(!1);
  if (w)
    return b.jsx(Ws, {
      className: 'sticky top-20 max-md:static',
      children: b.jsx(Hs, {
        className: 'flex items-center justify-center min-h-50',
        children: b.jsx('span', { className: 'spinner' }),
      }),
    });
  if (y)
    return b.jsx(Ws, {
      className: 'sticky top-20 max-md:static',
      children: b.jsx(Hs, {
        className: 'flex items-center justify-center min-h-50',
        children: b.jsx(vi, {
          icon: b.jsx(bl, { className: 'size-8' }),
          title: 'Jetton not found',
          description: y,
        }),
      }),
    });
  if (!i)
    return b.jsx(Ws, {
      className: 'sticky top-20 max-md:static',
      children: b.jsx(Hs, {
        className: 'flex items-center justify-center min-h-50',
        children: b.jsx(vi, {
          icon: b.jsx(J1, { className: 'size-8' }),
          title: 'Load a jetton',
          description: 'Enter an address and press Load to see token details',
        }),
      }),
    });
  const T = i.metadata.symbol || '???',
    _ = i.metadata.name || 'Unknown Token',
    D = T.charAt(0).toUpperCase(),
    z = i.metadata.image || '';
  return b.jsx(Ws, {
    className: 'sticky top-20 max-md:static',
    children: b.jsxs(Hs, {
      className: 'space-y-0',
      children: [
        b.jsxs('div', {
          className: 'flex items-center gap-3.5 mb-5',
          children: [
            b.jsxs(Rf, {
              className: 'size-14 border-2 border-border',
              children: [
                z && !p
                  ? b.jsx(vf, { src: z, alt: _, onError: () => R(!0) })
                  : null,
                b.jsx(Nf, {
                  className: 'bg-[#0098EA] text-white text-xl font-extrabold',
                  children: D,
                }),
              ],
            }),
            b.jsxs('div', {
              className: 'min-w-0',
              children: [
                b.jsx('div', {
                  className: 'text-lg font-bold tracking-tight truncate',
                  children: _,
                }),
                b.jsxs('div', {
                  className:
                    'font-mono text-[13px] font-semibold text-[#0098EA]',
                  children: ['$', T],
                }),
              ],
            }),
          ],
        }),
        b.jsx(Ys, { className: 'my-4' }),
        b.jsx(ps, { label: 'Balance', value: `${ee.fromNano(n || 0)} ${T}` }),
        b.jsx(ps, { label: 'Supply', value: `${u(i.totalSupply)} ${T}` }),
        b.jsx(ps, { label: 'Decimals', value: String(l) }),
        b.jsx(ps, { label: 'Standard', value: 'TEP-74 Jetton' }),
        b.jsx(ps, {
          label: 'Mintable',
          value: i.mintable ? 'Yes' : 'No',
          valueClassName: i.mintable
            ? 'text-[var(--success)]'
            : 'text-[var(--warning)]',
        }),
        b.jsxs('div', {
          className: 'flex justify-between items-center py-2',
          children: [
            b.jsx('span', {
              className:
                'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
              children: 'Admin',
            }),
            b.jsx('span', {
              className:
                'font-mono text-[13px] font-semibold text-right max-w-[65%] truncate',
              children: i.adminAddress
                ? b.jsxs('span', {
                    className: 'inline-flex items-center gap-1.5',
                    children: [
                      b.jsx(fh, {
                        address: i.adminAddress.toString({
                          bounceable: !0,
                          testOnly: h === 'testnet',
                        }),
                        network: h,
                      }),
                      g &&
                        b.jsx(Lc, {
                          variant: 'secondary',
                          className:
                            'text-[10px] bg-(--success)/10 text-success border-0',
                          children: 'You',
                        }),
                    ],
                  })
                : 'None (revoked)',
            }),
          ],
        }),
        b.jsxs('div', {
          className: 'flex justify-between items-center py-2',
          children: [
            b.jsx('span', {
              className:
                'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
              children: 'Source',
            }),
            b.jsx('span', {
              className: 'font-mono text-[13px] font-semibold text-right',
              children: b.jsx('a', {
                href: `https://verifier.ton.org/${I.trim()}?testnet=`,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'text-[#0098EA] hover:underline',
                children: 'View on Verifier',
              }),
            }),
          ],
        }),
        i.metadata.description &&
          b.jsxs(b.Fragment, {
            children: [
              b.jsx(Ys, { className: 'my-4' }),
              b.jsx('div', {
                className:
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5',
                children: 'About',
              }),
              b.jsx('p', {
                className:
                  'text-sm text-muted-foreground line-clamp-33 leading-relaxed',
                children: i.metadata.description,
              }),
            ],
          }),
        b.jsx(Pf, { network: h }),
      ],
    }),
  });
}
function dh(n) {
  return n.length <= 12 ? n : n.slice(0, 4) + '...' + n.slice(-4);
}
function fh({ address: n, network: i }) {
  const l =
    i === 'testnet' ? 'https://testnet.tonviewer.com' : 'https://tonviewer.com';
  return b.jsx('a', {
    href: `${l}/${n}`,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: n,
    className: 'text-[#0098EA] hover:underline',
    children: dh(n),
  });
}
function vi({ icon: n, title: i, description: l, action: u }) {
  return b.jsxs('div', {
    className: 'text-center py-8 px-4',
    children: [
      b.jsx('div', {
        className: 'mb-3.5 text-muted-foreground flex justify-center',
        children: n,
      }),
      b.jsx('div', {
        className: 'text-[15px] font-semibold mb-1.5',
        children: i,
      }),
      l &&
        b.jsx('p', {
          className: 'text-sm text-muted-foreground mb-4.5 leading-relaxed',
          children: l,
        }),
      u,
    ],
  });
}
function Mn({ tonConnectUI: n }) {
  return b.jsx(vi, {
    icon: b.jsx(eu, { className: 'size-8' }),
    title: 'Wallet not connected',
    description: 'Connect your wallet to perform this action',
    action: b.jsx(Bt, {
      className: 'rounded-full max-w-55 mx-auto',
      onClick: () => n.openModal(),
      children: 'Connect Wallet',
    }),
  });
}
function Hc() {
  return b.jsx(vi, {
    icon: b.jsx(H1, { className: 'size-8' }),
    title: 'Admin access required',
    description: 'Only the contract admin can perform this action',
  });
}
function hh({
  contractAddr: n,
  decimals: i,
  isAdmin: l,
  isConnected: u,
  network: g,
  tonConnectUI: h,
  ownerAddress: w,
  onSuccess: y,
}) {
  const [I, p] = P.useState(''),
    [R, T] = P.useState(''),
    [_, D] = P.useState(!1),
    [z, M] = P.useState(null);
  if (!u) return b.jsx(Mn, { tonConnectUI: h });
  if (!l) return b.jsx(Hc, {});
  async function X(Y) {
    if ((Y.preventDefault(), !w)) return;
    const J = I.trim() || w.toString(),
      H = ti(J);
    if (!H) {
      M({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const W = parseFloat(R);
    if (isNaN(W) || W <= 0) {
      M({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    (D(!0), M({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const ne = jo(R.trim(), i),
        re = H0({
          toAddress: H,
          jettonAmount: ne,
          forwardTonAmount: ee.toNano('0.02'),
          totalTonAmount: ee.toNano('0.05'),
        });
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.1').toString(),
            payload: re.toBoc().toString('base64'),
          },
        ],
      }),
        M({ type: 'success', message: 'Mint transaction sent!' }),
        T(''),
        setTimeout(y, 5e3));
    } catch (ne) {
      M({
        type: 'error',
        message: tr(ne) ? 'Transaction cancelled' : Ut(ne) || 'Mint failed',
      });
    } finally {
      (D(!1),
        M((ne) => ((ne == null ? void 0 : ne.type) === 'info' ? null : ne)));
    }
  }
  return b.jsxs('form', {
    onSubmit: X,
    className: 'space-y-4.5',
    children: [
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Recipient Address',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: 'Leave empty to mint to yourself',
            value: I,
            onChange: (Y) => p(Y.target.value),
            disabled: _,
          }),
        ],
      }),
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Amount',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: '1000',
            value: R,
            onChange: (Y) => T(Y.target.value),
            disabled: _,
          }),
        ],
      }),
      b.jsx(Bt, {
        className: 'w-full h-12 rounded-full text-[15px] font-bold',
        disabled: _,
        children: _
          ? b.jsxs(b.Fragment, {
              children: [
                b.jsx('span', { className: 'spinner' }),
                ' Minting...',
              ],
            })
          : 'Mint Tokens',
      }),
      z && b.jsx(Nn, { type: z.type, message: z.message }),
    ],
  });
}
function gh({
  decimals: n,
  isConnected: i,
  network: l,
  tonConnectUI: u,
  ownerAddress: g,
}) {
  const [h, w] = P.useState(''),
    [y, I] = P.useState(''),
    [p, R] = P.useState(!1),
    [T, _] = P.useState(null);
  if (!i) return b.jsx(Mn, { tonConnectUI: u });
  async function D(z) {
    if ((z.preventDefault(), !g)) return;
    const M = ti(h);
    if (!M) {
      _({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    const X = parseFloat(y);
    if (isNaN(X) || X <= 0) {
      _({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    (R(!0), _({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const Y = jo(y.trim(), n),
        J = Y0({
          toAddress: M,
          amount: Y,
          responseAddress: g,
          forwardTonAmount: ee.toNano('0.001'),
        }),
        H = await rs(g);
      (await u.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: l === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: H.toString(),
            amount: ee.toNano('0.05').toString(),
            payload: J.toBoc().toString('base64'),
          },
        ],
      }),
        _({ type: 'success', message: 'Transfer transaction sent!' }),
        I(''),
        w(''));
    } catch (Y) {
      _({
        type: 'error',
        message: tr(Y) ? 'Transaction cancelled' : Ut(Y) || 'Transfer failed',
      });
    } finally {
      (R(!1), _((Y) => ((Y == null ? void 0 : Y.type) === 'info' ? null : Y)));
    }
  }
  return b.jsxs('form', {
    onSubmit: D,
    className: 'space-y-4.5',
    children: [
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Recipient Address',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: '0Q...',
            value: h,
            onChange: (z) => w(z.target.value),
            disabled: p,
          }),
        ],
      }),
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Amount',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: '100',
            value: y,
            onChange: (z) => I(z.target.value),
            disabled: p,
          }),
        ],
      }),
      b.jsx(Bt, {
        className: 'w-full h-12 rounded-full text-[15px] font-bold',
        disabled: p,
        children: p
          ? b.jsxs(b.Fragment, {
              children: [
                b.jsx('span', { className: 'spinner' }),
                ' Transferring...',
              ],
            })
          : 'Transfer Tokens',
      }),
      T && b.jsx(Nn, { type: T.type, message: T.message }),
    ],
  });
}
function xh({ network: n, tonConnectUI: i, ownerAddress: l }) {
  const [u, g] = P.useState(''),
    [h, w] = P.useState(''),
    [y, I] = P.useState(!1),
    [p, R] = P.useState(null);
  if (!l) return b.jsx(Mn, { tonConnectUI: i });
  async function T(_) {
    _.preventDefault();
    const D = ti(u);
    if (!D) {
      R({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    if (!l) {
      R({ type: 'error', message: 'Wallet not connected' });
      return;
    }
    (I(!0), R({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const z = K0({
          transferRecipient: D,
          sendExcessesTo: l,
          forwardPayload: h.trim(),
        }),
        M = await rs(l);
      (await i.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: n === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: M.toString(),
            amount: ee.toNano('0.6').toString(),
            payload: z.toBoc().toString('base64'),
          },
        ],
      }),
        R({ type: 'success', message: 'Invite transaction sent!' }),
        g(''),
        w(''));
    } catch (z) {
      R({
        type: 'error',
        message: tr(z) ? 'Transaction cancelled' : Ut(z) || 'Invite failed',
      });
    } finally {
      (I(!1), R((z) => ((z == null ? void 0 : z.type) === 'info' ? null : z)));
    }
  }
  return b.jsxs('form', {
    onSubmit: T,
    className: 'space-y-4.5',
    children: [
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Recipient Address',
          }),
          b.jsx(oh, { toAddr: u, setToAddr: g }),
        ],
      }),
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Invite ID (optional)',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: 'Invite reference',
            value: h,
            onChange: (_) => w(_.target.value),
            disabled: y,
          }),
          b.jsx('p', {
            className: 'text-xs text-muted-foreground',
            children:
              'This will send an invite message through your wallet contract.',
          }),
        ],
      }),
      b.jsx(Bt, {
        className: 'w-full h-12 rounded-full text-[15px] font-bold',
        disabled: y,
        children: y
          ? b.jsxs(b.Fragment, {
              children: [
                b.jsx('span', { className: 'spinner' }),
                ' Sending invite...',
              ],
            })
          : 'Send Invite',
      }),
      p && b.jsx(Nn, { type: p.type, message: p.message }),
    ],
  });
}
function Ah({ network: n, tonConnectUI: i, ownerAddress: l }) {
  const [u, g] = P.useState(''),
    [h, w] = P.useState(!1),
    [y, I] = P.useState(null);
  if (!l) return b.jsx(Mn, { tonConnectUI: i });
  const p = l;
  async function R(T) {
    const _ = ti(u);
    if (!_) {
      I({ type: 'error', message: 'Invalid recipient address' });
      return;
    }
    (w(!0), I({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const D = T
          ? J0({ transferRecipient: _, sendExcessesTo: p })
          : q0({ transferRecipient: _, sendExcessesTo: p }),
        z = await rs(p);
      (await i.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: n === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: z.toString(),
            amount: ee.toNano('0.6').toString(),
            payload: D.toBoc().toString('base64'),
          },
        ],
      }),
        I({
          type: 'success',
          message: T ? 'Vote transaction sent!' : 'Unvote transaction sent!',
        }),
        g(''));
    } catch (D) {
      I({
        type: 'error',
        message: tr(D) ? 'Transaction cancelled' : Ut(D) || 'Vote failed',
      });
    } finally {
      (w(!1), I((D) => ((D == null ? void 0 : D.type) === 'info' ? null : D)));
    }
  }
  return b.jsxs('div', {
    className: 'space-y-4.5',
    children: [
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Delegate Address',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: '0Q...',
            value: u,
            onChange: (T) => g(T.target.value),
            disabled: h,
          }),
        ],
      }),
      b.jsxs('div', {
        className: 'grid grid-cols-2 gap-3.5 max-sm:grid-cols-1',
        children: [
          b.jsx(Bt, {
            className: 'h-12 rounded-full text-[15px] font-bold',
            disabled: h,
            onClick: () => R(!0),
            children: h
              ? b.jsxs(b.Fragment, {
                  children: [
                    b.jsx('span', { className: 'spinner' }),
                    ' Sending vote...',
                  ],
                })
              : 'Vote',
          }),
          b.jsx(Bt, {
            variant: 'destructive',
            className: 'h-12 rounded-full text-[15px] font-bold',
            disabled: h,
            onClick: () => R(!1),
            children: h
              ? b.jsxs(b.Fragment, {
                  children: [
                    b.jsx('span', { className: 'spinner' }),
                    ' Sending unvote...',
                  ],
                })
              : 'Unvote',
          }),
        ],
      }),
      y && b.jsx(Nn, { type: y.type, message: y.message }),
    ],
  });
}
function mh({ network: n, tonConnectUI: i, ownerAddress: l }) {
  const [u, g] = P.useState(!1),
    [h, w] = P.useState(null);
  if (!l) return b.jsx(Mn, { tonConnectUI: i });
  const y = l;
  async function I() {
    (g(!0), w({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const p = Z0(),
        R = await rs(y);
      (await i.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: n === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: R.toString(),
            amount: ee.toNano('0.6').toString(),
            payload: p.toBoc().toString('base64'),
          },
        ],
      }),
        w({ type: 'success', message: 'Destroy transaction sent!' }));
    } catch (p) {
      w({
        type: 'error',
        message: tr(p) ? 'Transaction cancelled' : Ut(p) || 'Txn failed',
      });
    } finally {
      (g(!1), w((p) => ((p == null ? void 0 : p.type) === 'info' ? null : p)));
    }
  }
  return b.jsxs('div', {
    className: 'space-y-4.5',
    children: [
      b.jsx(Bt, {
        className: 'h-12 rounded-full text-[15px] font-bold',
        disabled: u,
        onClick: () => I(),
        children: u
          ? b.jsxs(b.Fragment, {
              children: [
                b.jsx('span', { className: 'spinner' }),
                ' Sending Txn...',
              ],
            })
          : 'Destroy Account',
      }),
      h && b.jsx(Nn, { type: h.type, message: h.message }),
    ],
  });
}
function ph({
  decimals: n,
  isConnected: i,
  network: l,
  tonConnectUI: u,
  ownerAddress: g,
  onSuccess: h,
}) {
  const [w, y] = P.useState(''),
    [I, p] = P.useState(!1),
    [R, T] = P.useState(null);
  if (!i) return b.jsx(Mn, { tonConnectUI: u });
  async function _(D) {
    if ((D.preventDefault(), !g)) return;
    const z = parseFloat(w);
    if (isNaN(z) || z <= 0) {
      T({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    (p(!0), T({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const M = jo(w.trim(), n),
        X = G0(M, g),
        Y = await rs(g);
      (await u.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: l === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: Y.toString(),
            amount: ee.toNano('0.05').toString(),
            payload: X.toBoc().toString('base64'),
          },
        ],
      }),
        T({ type: 'success', message: 'Burn transaction sent!' }),
        y(''),
        setTimeout(h, 5e3));
    } catch (M) {
      T({
        type: 'error',
        message: tr(M) ? 'Transaction cancelled' : Ut(M) || 'Burn failed',
      });
    } finally {
      (p(!1), T((M) => ((M == null ? void 0 : M.type) === 'info' ? null : M)));
    }
  }
  return b.jsxs('form', {
    onSubmit: _,
    className: 'space-y-4.5',
    children: [
      b.jsxs('div', {
        className: 'space-y-1.5',
        children: [
          b.jsx(jt, {
            className:
              'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
            children: 'Amount to Burn',
          }),
          b.jsx(Yt, {
            type: 'text',
            placeholder: '1000',
            value: w,
            onChange: (D) => y(D.target.value),
            disabled: I,
          }),
          b.jsx('p', {
            className: 'text-xs text-muted-foreground',
            children:
              'Burns tokens from your wallet. This action is irreversible.',
          }),
        ],
      }),
      b.jsx(Bt, {
        variant: 'destructive',
        className: 'w-full h-12 rounded-full text-[15px] font-bold',
        disabled: I,
        children: I
          ? b.jsxs(b.Fragment, {
              children: [
                b.jsx('span', { className: 'spinner' }),
                ' Burning...',
              ],
            })
          : 'Burn Tokens',
      }),
      R && b.jsx(Nn, { type: R.type, message: R.message }),
    ],
  });
}
function wh({
  contractAddr: n,
  info: i,
  isAdmin: l,
  isConnected: u,
  network: g,
  tonConnectUI: h,
  ownerAddress: w,
  onSuccess: y,
}) {
  const [I, p] = P.useState(lh),
    [R, T] = P.useState(!1),
    [_, D] = P.useState(null),
    [z, M] = P.useState(i.metadata.name || ''),
    [X, Y] = P.useState(i.metadata.symbol || ''),
    J = i.metadata.decimals || '9',
    [H, W] = P.useState(i.metadata.description || ''),
    [ne, re] = P.useState(i.metadata.image || '');
  if (!u) return b.jsx(Mn, { tonConnectUI: h });
  if (!l) return b.jsx(Hc, {});
  async function Q($) {
    $.preventDefault();
    const we = ti(I);
    if (!we) {
      D({ type: 'error', message: 'Invalid admin address' });
      return;
    }
    (T(!0), D({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const k = Q0(we);
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.05').toString(),
            payload: k.toBoc().toString('base64'),
          },
        ],
      }),
        D({ type: 'success', message: 'Admin change transaction sent!' }),
        setTimeout(y, 5e3));
    } catch (k) {
      D({
        type: 'error',
        message: tr(k) ? 'Transaction cancelled' : Ut(k) || 'Failed',
      });
    } finally {
      (T(!1), D((k) => ((k == null ? void 0 : k.type) === 'info' ? null : k)));
    }
  }
  async function V() {
    (T(!0), D({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const $ = $0();
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.1').toString(),
            payload: $.toBoc().toString('base64'),
          },
        ],
      }),
        D({ type: 'success', message: 'Top-up transaction sent!' }),
        setTimeout(y, 5e3));
    } catch ($) {
      D({
        type: 'error',
        message: tr($) ? 'Transaction cancelled' : Ut($) || 'Top up failed',
      });
    } finally {
      (T(!1), D(($) => (($ == null ? void 0 : $.type) === 'info' ? null : $)));
    }
  }
  async function L() {
    (T(!0), D({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const $ = ed();
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.05').toString(),
            payload: $.toBoc().toString('base64'),
          },
        ],
      }),
        D({ type: 'success', message: 'Approve upgrade transaction sent!' }),
        setTimeout(y, 5e3));
    } catch ($) {
      D({
        type: 'error',
        message: tr($) ? 'Transaction cancelled' : Ut($) || 'Approve failed',
      });
    } finally {
      (T(!1), D(($) => (($ == null ? void 0 : $.type) === 'info' ? null : $)));
    }
  }
  async function We() {
    (T(!0), D({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const $ = td();
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.05').toString(),
            payload: $.toBoc().toString('base64'),
          },
        ],
      }),
        D({ type: 'success', message: 'Reject upgrade transaction sent!' }),
        setTimeout(y, 5e3));
    } catch ($) {
      D({
        type: 'error',
        message: tr($) ? 'Transaction cancelled' : Ut($) || 'Reject failed',
      });
    } finally {
      (T(!1), D(($) => (($ == null ? void 0 : $.type) === 'info' ? null : $)));
    }
  }
  async function xe($) {
    ($.preventDefault(),
      T(!0),
      D({ type: 'info', message: 'Confirm in your wallet...' }));
    try {
      const we = await X0({
        name: z,
        symbol: X,
        decimals: J,
        description: H || void 0,
        image: ne || void 0,
      });
      (await h.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 300,
        network: g === 'mainnet' ? '-239' : '-3',
        messages: [
          {
            address: ee.Address.parse(n).toString(),
            amount: ee.toNano('0.05').toString(),
            payload: we.toBoc().toString('base64'),
          },
        ],
      }),
        D({ type: 'success', message: 'Content update transaction sent!' }),
        setTimeout(y, 5e3));
    } catch (we) {
      D({
        type: 'error',
        message: tr(we) ? 'Transaction cancelled' : Ut(we) || 'Failed',
      });
    } finally {
      (T(!1),
        D((we) => ((we == null ? void 0 : we.type) === 'info' ? null : we)));
    }
  }
  const se = parseInt(i.metadata.decimals || '9') || 9;
  return b.jsxs('div', {
    className: 'space-y-0',
    children: [
      b.jsxs('div', {
        className: 'space-y-4.5',
        children: [
          b.jsx('h3', {
            className: 'text-base font-semibold',
            children: 'Mint Tokens',
          }),
          b.jsx(hh, {
            contractAddr: n,
            decimals: se,
            isAdmin: l,
            isConnected: u,
            network: g,
            tonConnectUI: h,
            ownerAddress: w,
            onSuccess: y,
          }),
        ],
      }),
      b.jsx(Ys, { className: 'my-6' }),
      b.jsxs('form', {
        onSubmit: xe,
        className: 'space-y-4.5',
        children: [
          b.jsx('h3', {
            className: 'text-base font-semibold',
            children: 'Update Metadata',
          }),
          b.jsxs('div', {
            className: 'grid grid-cols-2 gap-3.5 max-sm:grid-cols-1',
            children: [
              b.jsxs('div', {
                className: 'space-y-1.5',
                children: [
                  b.jsx(jt, {
                    className:
                      'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                    children: 'Name',
                  }),
                  b.jsx(Yt, {
                    type: 'text',
                    value: z,
                    onChange: ($) => M($.target.value),
                    disabled: R,
                  }),
                ],
              }),
              b.jsxs('div', {
                className: 'space-y-1.5',
                children: [
                  b.jsx(jt, {
                    className:
                      'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                    children: 'Symbol',
                  }),
                  b.jsx(Yt, {
                    type: 'text',
                    value: X,
                    onChange: ($) => Y($.target.value),
                    disabled: R,
                  }),
                ],
              }),
            ],
          }),
          b.jsxs('div', {
            className: 'space-y-1.5',
            children: [
              b.jsx(jt, {
                className:
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                children: 'Description',
              }),
              b.jsx(rd, {
                value: H,
                onChange: ($) => W($.target.value),
                disabled: R,
              }),
            ],
          }),
          b.jsxs('div', {
            className: 'space-y-1.5',
            children: [
              b.jsx(jt, {
                className:
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                children: 'Image URL',
              }),
              b.jsx(Yt, {
                type: 'text',
                value: ne,
                onChange: ($) => re($.target.value),
                disabled: R,
              }),
            ],
          }),
          b.jsx(Bt, {
            className: 'w-full h-12 rounded-full text-[15px] font-bold',
            disabled: R,
            children: R
              ? b.jsxs(b.Fragment, {
                  children: [
                    b.jsx('span', { className: 'spinner' }),
                    ' Updating...',
                  ],
                })
              : 'Update Metadata',
          }),
        ],
      }),
      b.jsx(Ys, { className: 'my-6' }),
      b.jsxs('form', {
        onSubmit: Q,
        className: 'space-y-4.5',
        children: [
          b.jsx('h3', {
            className: 'text-base font-semibold',
            children: 'Transfer Admin',
          }),
          b.jsxs('div', {
            className: 'space-y-1.5',
            children: [
              b.jsx(jt, {
                className:
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                children: 'New Admin Address',
              }),
              b.jsx(Yt, {
                type: 'text',
                placeholder: '0Q...',
                value: I,
                onChange: ($) => p($.target.value),
                disabled: R,
              }),
              b.jsx('p', {
                className: 'text-xs text-muted-foreground',
                children:
                  'Zero address (0:000...0) revokes admin rights permanently',
              }),
            ],
          }),
          b.jsx(Bt, {
            variant: 'destructive',
            className: 'w-full h-12 rounded-full text-[15px] font-bold',
            disabled: R,
            children: R
              ? b.jsxs(b.Fragment, {
                  children: [
                    b.jsx('span', { className: 'spinner' }),
                    ' Transferring...',
                  ],
                })
              : 'Transfer Admin Rights',
          }),
        ],
      }),
      b.jsx(Ys, { className: 'my-6' }),
      b.jsxs('div', {
        className: 'space-y-4.5',
        children: [
          b.jsx('h3', {
            className: 'text-base font-semibold',
            children: 'Admin Actions',
          }),
          b.jsxs('div', {
            className: 'grid grid-cols-3 gap-3.5 max-sm:grid-cols-1',
            children: [
              b.jsx(Bt, {
                className: 'h-12 rounded-full text-[15px] font-bold',
                disabled: R,
                onClick: V,
                children: R
                  ? b.jsxs(b.Fragment, {
                      children: [
                        b.jsx('span', { className: 'spinner' }),
                        ' Top Up...',
                      ],
                    })
                  : 'Top Up Tons',
              }),
              b.jsx(Bt, {
                className: 'h-12 rounded-full text-[15px] font-bold',
                disabled: R,
                onClick: L,
                children: R
                  ? b.jsxs(b.Fragment, {
                      children: [
                        b.jsx('span', { className: 'spinner' }),
                        ' Approving...',
                      ],
                    })
                  : 'Approve Upgrade',
              }),
              b.jsx(Bt, {
                variant: 'destructive',
                className: 'h-12 rounded-full text-[15px] font-bold',
                disabled: R,
                onClick: We,
                children: R
                  ? b.jsxs(b.Fragment, {
                      children: [
                        b.jsx('span', { className: 'spinner' }),
                        ' Rejecting...',
                      ],
                    })
                  : 'Reject Upgrade',
              }),
            ],
          }),
        ],
      }),
      _ && b.jsx(Nn, { type: _.type, message: _.message, className: 'mt-4' }),
    ],
  });
}
function ul() {
  const n = window.location.pathname,
    i = new URLSearchParams(window.location.search),
    l = i.get('testnet') === 'true',
    u = i.get('address') || null;
  return n === '/manage'
    ? { page: 'manage', isTestnet: l, address: u }
    : { page: 'create', isTestnet: l, address: null };
}
function oo(n, i, l) {
  const u = n === 'manage' ? '/manage' : '/create',
    g = new URLSearchParams();
  (i && g.set('testnet', 'true'), n === 'manage' && l && g.set('address', l));
  const h = g.toString();
  return h ? `${u}?${h}` : u;
}
function dl(n) {
  window.location.pathname + window.location.search !== n &&
    (history.pushState(null, '', n),
    window.dispatchEvent(new Event('routechange')));
}
function Ch(n) {
  window.location.pathname + window.location.search !== n &&
    (history.replaceState(null, '', n),
    window.dispatchEvent(new Event('routechange')));
}
function yh() {
  const [n, i] = P.useState(ul);
  P.useEffect(() => {
    const h = () => i(ul());
    return (
      window.addEventListener('popstate', h),
      window.addEventListener('routechange', h),
      () => {
        (window.removeEventListener('popstate', h),
          window.removeEventListener('routechange', h));
      }
    );
  }, []);
  const l = P.useCallback(
      (h) => {
        dl(oo(h, n.isTestnet));
      },
      [n.isTestnet],
    ),
    u = P.useCallback(
      (h) => {
        dl(oo(n.page, h, n.address));
      },
      [n.page, n.address],
    ),
    g = P.useCallback(
      (h) => {
        Ch(oo('manage', n.isTestnet, h));
      },
      [n.isTestnet],
    );
  return {
    page: n.page,
    network: 'testnet',
    address: n.address,
    go: l,
    setTestnet: u,
    setAddress: g,
  };
}
const Qc = P.createContext({ theme: 'dark', toggle: () => {} }),
  Xc = () => P.useContext(Qc);
function Eh() {
  const { network: n, address: i, setAddress: l } = yh(),
    [u, g] = P.useState(() =>
      localStorage.getItem('jm-theme') === 'light' ? 'light' : 'dark',
    ),
    [h] = yl();
  P.useEffect(() => {
    (document.documentElement.setAttribute('data-theme', u),
      localStorage.setItem('jm-theme', u),
      (h.uiOptions = {
        uiPreferences: { theme: u === 'light' ? Ca.LIGHT : Ca.DARK },
        analytics: { mode: 'off' },
        actionsConfiguration: { twaReturnUrl: 'https://t.me/fossfiBot' },
      }));
  }, [u, h]);
  const w = () => g((y) => (y === 'dark' ? 'light' : 'dark'));
  return b.jsx(Qc.Provider, {
    value: { theme: u, toggle: w },
    children: b.jsxs('div', {
      className: 'min-h-full flex flex-col',
      children: [
        b.jsxs('header', {
          className:
            'flex items-center justify-between px-7 h-15 border-b sticky top-0 z-50 max-sm:px-4 max-sm:h-auto max-sm:flex-wrap max-sm:gap-2.5 max-sm:py-3',
          style: {
            background: u === 'light' ? '#fff' : '#08080A',
            borderBottomColor:
              u === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          },
          children: [
            b.jsx('div', {
              className:
                'flex items-center gap-6 max-sm:gap-2.5 max-sm:w-full max-sm:justify-between',
              children: b.jsxs('div', {
                className:
                  'flex items-center gap-2.5 text-[17px] font-bold max-sm:text-[15px]',
                children: [
                  b.jsx('div', {
                    className:
                      'w-8 h-8 bg-[#0098EA] rounded-[9px] flex items-center justify-center text-white max-sm:w-7 max-sm:h-7 max-sm:rounded-[7px]',
                    children: b.jsx(j1, {
                      className: 'size-4 max-sm:size-3.5',
                    }),
                  }),
                  'BrotherHood',
                ],
              }),
            }),
            b.jsxs('div', {
              className: 'flex items-center gap-2.5',
              children: [
                b.jsx(Bt, {
                  variant: 'ghost',
                  size: 'icon',
                  className: 'rounded-full size-10 max-sm:size-9',
                  style: {
                    background: u === 'light' ? '#F0F1F3' : '#19191B',
                    color: u === 'light' ? 'var(--foreground)' : '#fff',
                  },
                  onClick: w,
                  title: `Switch to ${u === 'dark' ? 'light' : 'dark'} theme`,
                  children:
                    u === 'dark'
                      ? b.jsx(Z1, { className: 'size-4.5' })
                      : b.jsx(X1, { className: 'size-4.5' }),
                }),
                b.jsx(v1, {}),
              ],
            }),
          ],
        }),
        b.jsx('main', {
          className:
            'flex-1 max-w-240 w-full mx-auto px-6 pt-9 pb-15 max-sm:px-4 max-sm:pt-6 max-sm:pb-12',
          children: b.jsx(ch, {
            network: n,
            initialAddress: i,
            onAddressChange: l,
          }),
        }),
      ],
    }),
  });
}
const Mh = Object.freeze(
  Object.defineProperty(
    { __proto__: null, default: Eh, useTheme: Xc },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);
export { Mh as A, Rh as q };
