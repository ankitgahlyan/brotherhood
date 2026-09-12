#!/usr/bin/env node

/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(command, options = {}) {
  console.log(`\x1b[36m➜ ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', ...options });
}

function getChangedInfo() {
  try {
    // Check staged files first (standard during git pre-commit hook)
    const stagedOutput = execSync(
      'git diff --cached --name-only --diff-filter=ACMR',
      { encoding: 'utf-8' },
    ).trim();

    if (stagedOutput) {
      return {
        isStaged: true,
        files: stagedOutput
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };
    }

    // Fallback: check working tree vs HEAD if run standalone
    const headOutput = execSync('git diff --name-only HEAD', {
      encoding: 'utf-8',
    }).trim();

    if (headOutput) {
      return {
        isStaged: false,
        files: headOutput
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };
    }

    // Fallback: untracked files
    const untrackedOutput = execSync(
      'git ls-files --others --exclude-standard',
      {
        encoding: 'utf-8',
      },
    ).trim();

    if (untrackedOutput) {
      return {
        isStaged: false,
        files: untrackedOutput
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };
    }

    return { isStaged: false, files: [] };
  } catch (err) {
    console.warn('Could not determine git diff:', err?.message || err);
    return { isStaged: false, files: [] };
  }
}

function isLintableTsFile(f) {
  if (!/\.(ts|tsx)$/i.test(f)) return false;
  if (
    f.startsWith('scripts/') ||
    f.startsWith('public/') ||
    f.startsWith('contracts/') ||
    f.startsWith('wrappers/') ||
    f.startsWith('wrappers-ts/') ||
    f.startsWith('gen/') ||
    f.includes('/dist/') ||
    f.includes('/dist-ssr/') ||
    f.includes('/build/') ||
    f.includes('/node_modules/') ||
    f.includes('/e2e/') ||
    f.endsWith('routeTree.gen.ts') ||
    f.endsWith('.gen.ts')
  ) {
    return false;
  }
  return true;
}

function isFormattableFile(f) {
  return (
    /\.(ts|tsx|js|jsx|mjs|cjs|json|css|html|md|yaml|yml)$/i.test(f) &&
    !f.endsWith('.tolk') &&
    !f.includes('/dist/') &&
    !f.includes('/dist-ssr/') &&
    !f.includes('/build/') &&
    !f.includes('/node_modules/') &&
    !f.endsWith('routeTree.gen.ts')
  );
}

async function main() {
  const { isStaged, files: changedFiles } = getChangedInfo();

  if (changedFiles.length === 0) {
    console.log(
      'No changed or staged files detected. Skipping pre-commit checks.',
    );
    process.exit(0);
  }

  console.log(
    `\x1b[32m[pre-commit] Detected ${changedFiles.length} changed file(s) (staged: ${isStaged}):\x1b[0m`,
  );
  changedFiles.forEach((file) => console.log(`  • ${file}`));
  console.log('');

  const existingFiles = changedFiles.filter((f) => existsSync(f));

  // 1. Formatting with Prettier (Auto-format and re-stage)
  const formattableFiles = existingFiles.filter(isFormattableFile);
  if (formattableFiles.length > 0) {
    console.log(
      `\x1b[34m[Prettier] Formatting ${formattableFiles.length} file(s)...\x1b[0m`,
    );
    const escaped = formattableFiles.map((f) => `"${f}"`).join(' ');
    run(`bunx prettier --write --ignore-unknown ${escaped}`);

    if (isStaged) {
      run(`git add ${escaped}`);
      console.log('\x1b[32m✔ Formatted files re-staged.\x1b[0m');
    }
    console.log('');
  }

  // 2. Linting with ESLint (Auto-fix, re-stage, error if unfixable errors remain)
  const lintableFiles = existingFiles.filter(isLintableTsFile);
  if (lintableFiles.length > 0) {
    console.log(
      `\x1b[34m[ESLint] Linting and fixing ${lintableFiles.length} file(s)...\x1b[0m`,
    );
    const escaped = lintableFiles.map((f) => `"${f}"`).join(' ');
    run(`bunx eslint --fix ${escaped}`);

    if (isStaged) {
      run(`git add ${escaped}`);
      console.log('\x1b[32m✔ Fixed lint files re-staged.\x1b[0m');
    }
    console.log('');
  }

  // Tolk smart contract categorisation
  const tolkContractFiles = changedFiles.filter(
    (f) =>
      f.startsWith('contracts/src/') ||
      f === 'Acton.toml' ||
      f === 'libraries.toml',
  );

  const tolkTestFiles = changedFiles.filter(
    (f) => f.startsWith('contracts/tests/') && f.endsWith('.test.tolk'),
  );

  const otherTolkFiles = changedFiles.filter(
    (f) =>
      f.endsWith('.tolk') &&
      !tolkContractFiles.includes(f) &&
      !tolkTestFiles.includes(f),
  );

  const hasTolkChanges =
    tolkContractFiles.length > 0 ||
    tolkTestFiles.length > 0 ||
    otherTolkFiles.length > 0;

  // 3. Run Tolk checks & tests if affected
  if (hasTolkChanges) {
    console.log(
      '\x1b[34m[Tolk / Acton] Running affected Tolk checks and tests...\x1b[0m',
    );
    const existingTolk = existingFiles.filter((f) => f.endsWith('.tolk'));
    if (existingTolk.length > 0) {
      const escapedTolk = existingTolk.map((f) => `"${f}"`).join(' ');
      run(`acton fmt ${escapedTolk}`);
      if (isStaged) {
        run(`git add ${escapedTolk}`);
      }
    }
    run('acton fmt --check');
    run('acton check');

    if (tolkContractFiles.length > 0 || otherTolkFiles.length > 0) {
      console.log('Tolk contract source changed: running all Tolk tests...');
      run('acton test');
    } else if (tolkTestFiles.length > 0) {
      console.log(
        `Running ${tolkTestFiles.length} changed Tolk test file(s)...`,
      );
      run(`acton test ${tolkTestFiles.join(' ')}`);
    }
    console.log('');
  } else {
    console.log(
      '\x1b[90m[Tolk / Acton] No Tolk contract files changed. Skipping Acton tests.\x1b[0m',
    );
  }

  // 4. Run TypeScript typecheck & affected tests if affected
  const tsJsFiles = changedFiles.filter(
    (f) => /\.(ts|tsx|js|jsx|mjs|cjs|json)$/i.test(f) && !f.endsWith('.tolk'),
  );

  if (tsJsFiles.length > 0) {
    console.log(
      '\x1b[34m[TypeScript / Typecheck] Checking types across workspaces...\x1b[0m',
    );
    run('bun run typecheck');
    console.log('');

    console.log(
      '\x1b[34m[TypeScript / Bun] Running affected TS/JS tests...\x1b[0m',
    );
    // bun test --changed runs test files affected by changed files according to git
    run(
      'bun test --changed=HEAD --pass-with-no-tests --path-ignore-patterns "**/e2e/**" --path-ignore-patterns "**/apps/wallet-v2/**"',
    );
    console.log('');
  } else {
    console.log(
      '\x1b[90m[TypeScript / Bun] No TS/JS files changed. Skipping Typecheck and Bun tests.\x1b[0m',
    );
  }

  console.log(
    '\x1b[32m✔ All affected tests, lints, and checks passed successfully!\x1b[0m',
  );
}

main().catch((err) => {
  console.error(
    '\x1b[31m✖ Tests or checks failed:\x1b[0m',
    err?.message || err,
  );
  process.exit(1);
});
