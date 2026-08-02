import { r, j as n } from './react-8fKfBBvl.js';
import { T as i, a as e } from './tonconnect-DPuITiDr.js';
import { q as a } from './App-DL9Q86Ua.js';
import './ton-sdk-OTheuEh2.js';
var s = r.createContext(void 0),
  c = ({ client: t, children: o }) => (
    r.useEffect(
      () => (
        t.mount(),
        () => {
          t.unmount();
        }
      ),
      [t],
    ),
    n.jsx(s.Provider, { value: t, children: o })
  );
const u = 'https://ton-blockchain.github.io/acton/tonconnect-manifest.json',
  m = {
    background: {
      primary: '#19191B',
      secondary: '#19191B',
      segment: '#19191B',
      tint: '#19191B',
      qr: '#FFFFFF',
    },
    connectButton: { background: '#0098EA', foreground: '#FFFFFF' },
  },
  d = {
    background: {
      primary: '#FFFFFF',
      secondary: '#F0F1F3',
      segment: '#FFFFFF',
      tint: '#F0F1F3',
      qr: '#F0F1F3',
    },
    connectButton: { background: '#0098EA', foreground: '#FFFFFF' },
  };
function l() {
  return typeof window > 'u'
    ? e.DARK
    : localStorage.getItem('jm-theme') === 'light'
      ? e.LIGHT
      : e.DARK;
}
function v({ children: t }) {
  const [o] = r.useState(l);
  return (
    r.useEffect(() => {
      const F = localStorage.getItem('jm-theme');
      document.documentElement.setAttribute(
        'data-theme',
        F === 'light' ? 'light' : 'dark',
      );
    }, []),
    n.jsx(c, {
      client: a,
      children: n.jsx(i, {
        manifestUrl: u,
        uiPreferences: { theme: o, colorsSet: { [e.DARK]: m, [e.LIGHT]: d } },
        children: t,
      }),
    })
  );
}
export { v as AppProviders };
