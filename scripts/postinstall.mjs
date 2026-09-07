import fs from 'node:fs';
import path from 'node:path';

// Under the TS7 dual-alias setup, typescript-7 brings in TS7 (native compiler without JS API).
// ts-api-utils's peer dependency has no upper bound, so Bun may resolve it to TS7.
// This postinstall hook ensures ts-api-utils always resolves the TS6 compiler API.
try {
  const rootDir = process.cwd();
  const ts6Path = path.resolve(rootDir, 'node_modules/typescript');
  const bunDir = path.resolve(rootDir, 'node_modules/.bun');

  if (fs.existsSync(bunDir) && fs.existsSync(ts6Path)) {
    const entries = fs.readdirSync(bunDir);
    for (const entry of entries) {
      if (entry.startsWith('ts-api-utils@')) {
        const target = path.join(bunDir, entry, 'node_modules/typescript');
        const parent = path.dirname(target);
        if (fs.existsSync(parent)) {
          fs.rmSync(target, { force: true, recursive: true });
          fs.symlinkSync(ts6Path, target, 'junction');
        }
      }
    }
  }
} catch {
  // Ignore postinstall errors in environments where node_modules is read-only
}
