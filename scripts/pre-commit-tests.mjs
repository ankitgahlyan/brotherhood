#!/usr/bin/env node

/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { execSync } from 'node:child_process';

function run(command, options = {}) {
  console.log(`\x1b[36m➜ ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', ...options });
}

function getChangedFiles() {
  try {
    // Check staged files first (standard during git pre-commit hook)
    const stagedOutput = execSync(
      'git diff --cached --name-only --diff-filter=ACMR',
      { encoding: 'utf-8' },
    ).trim();

    if (stagedOutput) {
      return stagedOutput.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    // Fallback: check working tree vs HEAD if run standalone
    const headOutput = execSync('git diff --name-only HEAD', {
      encoding: 'utf-8',
    }).trim();

    if (headOutput) {
      return headOutput.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    // Fallback: untracked files
    const untrackedOutput = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
    }).trim();

    if (untrackedOutput) {
      return untrackedOutput.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    return [];
  } catch (err) {
    console.warn('Could not determine git diff:', err?.message || err);
    return [];
  }
}

async function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('No changed or staged files detected. Skipping tests.');
    process.exit(0);
  }

  console.log(`\x1b[32m[pre-commit] Detected ${changedFiles.length} changed file(s):\x1b[0m`);
  changedFiles.forEach((file) => console.log(`  • ${file}`));
  console.log('');

  // Tolk smart contract categorisation
  const tolkContractFiles = changedFiles.filter(
    (f) =>
      f.startsWith('contracts/src/') ||
      f === 'Acton.toml' ||
      f === 'libraries.toml',
  );

  const tolkTestFiles = changedFiles.filter((f) =>
    f.startsWith('contracts/tests/') && f.endsWith('.test.tolk'),
  );

  const otherTolkFiles = changedFiles.filter(
    (f) => f.endsWith('.tolk') && !tolkContractFiles.includes(f) && !tolkTestFiles.includes(f),
  );

  const hasTolkChanges =
    tolkContractFiles.length > 0 ||
    tolkTestFiles.length > 0 ||
    otherTolkFiles.length > 0;

  // TypeScript / JavaScript / Frontend file categorisation
  const tsJsFiles = changedFiles.filter((f) =>
    /\.(ts|tsx|js|jsx|mjs|cjs|json)$/i.test(f) && !f.endsWith('.tolk'),
  );

  // 1. Run Tolk checks & tests if affected
  if (hasTolkChanges) {
    console.log('\x1b[34m[Tolk / Acton] Running affected Tolk checks and tests...\x1b[0m');
    run('acton fmt --check');
    run('acton check');

    if (tolkContractFiles.length > 0 || otherTolkFiles.length > 0) {
      console.log('Tolk contract source changed: running all Tolk tests...');
      run('acton test');
    } else if (tolkTestFiles.length > 0) {
      console.log(`Running ${tolkTestFiles.length} changed Tolk test file(s)...`);
      run(`acton test ${tolkTestFiles.join(' ')}`);
    }
    console.log('');
  } else {
    console.log('\x1b[90m[Tolk / Acton] No Tolk contract files changed. Skipping Acton tests.\x1b[0m');
  }

  // 2. Run TypeScript / JavaScript tests if affected
  if (tsJsFiles.length > 0) {
    console.log('\x1b[34m[TypeScript / Bun] Running affected TS/JS tests...\x1b[0m');
    // bun test --changed runs test files affected by changed files according to git
    run('bun test --changed=HEAD --pass-with-no-tests');
    console.log('');
  } else {
    console.log('\x1b[90m[TypeScript / Bun] No TS/JS files changed. Skipping Bun tests.\x1b[0m');
  }

  console.log('\x1b[32m✔ All affected tests and checks passed successfully!\x1b[0m');
}

main().catch((err) => {
  console.error('\x1b[31m✖ Tests or checks failed:\x1b[0m', err?.message || err);
  process.exit(1);
});
