#!/usr/bin/env node

/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const forceStagedOnly = process.argv.includes('--staged');

function run(command, options = {}) {
  console.log(`\x1b[36m➜ ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', ...options });
}

function getUnstagedFilesSet() {
  try {
    const unstaged = execSync('git diff --name-only', {
      encoding: 'utf-8',
    }).trim();
    const untracked = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
    }).trim();
    const set = new Set();
    for (const line of [...unstaged.split('\n'), ...untracked.split('\n')]) {
      const f = line.trim();
      if (f) set.add(f);
    }
    return set;
  } catch {
    return new Set();
  }
}

function getChangedInfo() {
  try {
    // Check staged files first (standard during git pre-commit hook)
    const stagedOutput = execSync(
      'git diff --cached --name-only --diff-filter=ACMR',
      { encoding: 'utf-8' },
    ).trim();

    if (stagedOutput || forceStagedOnly) {
      return {
        isStaged: true,
        files: stagedOutput
          ? stagedOutput
              .split('\n')
              .map((f) => f.trim())
              .filter(Boolean)
          : [],
      };
    }

    // Fallback when run manually with nothing staged: check working tree vs HEAD
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

/**
 * Runs TypeScript typecheck in a workspace directory, but filters any diagnostics
 * so that errors in unstaged/untracked files never fail a staged commit.
 */
function runScopedTypecheck(workspaceDir, stagedSet, isStaged) {
  const cmd =
    workspaceDir === '.'
      ? ['bunx', 'tsc', '--noEmit', '--pretty', 'false']
      : ['bun', 'run', '--cwd', workspaceDir, 'typecheck'];

  console.log(
    `\x1b[36m➜ ${cmd.join(' ')} (scoped to ${isStaged ? 'staged' : 'changed'} files)\x1b[0m`,
  );

  const res =
    workspaceDir === '.'
      ? spawnSync('bunx', ['tsc', '--noEmit', '--pretty', 'false'], {
          encoding: 'utf-8',
        })
      : spawnSync(
          '../../node_modules/typescript-7/bin/tsc',
          ['--noEmit', '--pretty', 'false'],
          {
            cwd: path.resolve(process.cwd(), workspaceDir),
            encoding: 'utf-8',
          },
        );

  if (res.status === 0) {
    return;
  }

  const output = `${res.stdout || ''}\n${res.stderr || ''}`.trim();
  if (!isStaged) {
    console.error(output);
    throw new Error(`Typecheck failed in ${workspaceDir}`);
  }

  // Parse tsc --pretty false lines: `<relPath>(line,col): error TSxxxx: ...`
  const lines = output.split('\n');
  const relevantErrors = [];
  let ignoredUnstagedCount = 0;
  let currentRelevant = false;

  // Track files that actually have unstaged working tree diffs
  const dirtyUnstagedSet = new Set();
  try {
    const diffDirty = execSync('git diff --name-only', {
      encoding: 'utf-8',
    }).trim();
    if (diffDirty) {
      diffDirty
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => dirtyUnstagedSet.add(f));
    }
  } catch {}

  for (const line of lines) {
    const match = line.match(/^([^(]+)\(\d+,\d+\):\s+error\s+TS\d+:/);
    if (match) {
      const rawFile = match[1].trim();
      const repoRelPath = path
        .relative(process.cwd(), path.resolve(workspaceDir, rawFile))
        .replace(/\\/g, '/');
      // If the file is staged, or clean (no unstaged modifications), the error is in the committed repo and must be reported!
      if (stagedSet.has(repoRelPath) || !dirtyUnstagedSet.has(repoRelPath)) {
        currentRelevant = true;
        relevantErrors.push(line);
      } else {
        currentRelevant = false;
        ignoredUnstagedCount += 1;
      }
    } else if (currentRelevant && line.startsWith('  ')) {
      relevantErrors.push(line);
    } else {
      currentRelevant = false;
    }
  }

  if (ignoredUnstagedCount > 0) {
    console.log(
      `\x1b[90m  (Ignored ${ignoredUnstagedCount} TypeScript diagnostic(s) in unstaged files)\x1b[0m`,
    );
  }

  if (relevantErrors.length > 0) {
    console.error('\x1b[31mTypeScript errors in staged files:\x1b[0m');
    console.error(relevantErrors.join('\n'));
    throw new Error(
      `TypeScript check failed in staged files (${workspaceDir})`,
    );
  }
}

/**
 * Resolves test files directly affected by the staged/changed files in apps/wallet/src,
 * excluding test files that only have unstaged changes.
 */
function resolveAffectedWalletTests(changedFiles, unstagedSet, isStaged) {
  const testFiles = new Set();

  for (const f of changedFiles) {
    if (!f.startsWith('apps/wallet/src/')) continue;

    // 1. Direct test file
    if (/\.(test|spec)\.(ts|tsx)$/i.test(f)) {
      if (existsSync(f)) testFiles.add(f);
      continue;
    }

    // 2. Co-located sibling test file (foo.ts -> foo.test.ts / foo.test.tsx)
    const ext = path.extname(f);
    const baseNoExt = f.slice(0, -ext.length);
    for (const candidateExt of [
      '.test.ts',
      '.test.tsx',
      '.spec.ts',
      '.spec.tsx',
    ]) {
      const candidate = `${baseNoExt}${candidateExt}`;
      if (
        existsSync(candidate) &&
        (!isStaged ||
          !unstagedSet.has(candidate) ||
          changedFiles.includes(candidate))
      ) {
        testFiles.add(candidate);
      }
    }

    // 3. Any clean test file in the same directory
    const dir = path.dirname(f);
    if (existsSync(dir)) {
      for (const entry of readdirSync(dir)) {
        if (/\.(test|spec)\.(ts|tsx)$/i.test(entry)) {
          const full = path.posix.join(dir.replace(/\\/g, '/'), entry);
          if (
            !isStaged ||
            !unstagedSet.has(full) ||
            changedFiles.includes(full)
          ) {
            testFiles.add(full);
          }
        }
      }
    }
  }

  return Array.from(testFiles);
}

async function main() {
  const { isStaged, files: changedFiles } = getChangedInfo();
  const unstagedSet = getUnstagedFilesSet();
  const stagedSet = new Set(changedFiles);

  if (changedFiles.length === 0) {
    console.log('No staged files detected. Skipping pre-commit checks.');
    process.exit(0);
  }

  console.log(
    `\x1b[32m[pre-commit] Checking ${changedFiles.length} ${isStaged ? 'staged' : 'changed'} file(s):\x1b[0m`,
  );
  changedFiles.forEach((file) => {
    const partialNote =
      isStaged && unstagedSet.has(file)
        ? ' \x1b[33m(partially staged)\x1b[0m'
        : '';
    console.log(`  • ${file}${partialNote}`);
  });
  console.log('');

  const existingFiles = changedFiles.filter((f) => existsSync(f));

  // Only auto-stage files after formatting/linting if they don't have unstaged working-tree edits
  const fullyStagedFilter = (f) => !unstagedSet.has(f);

  // 1. Formatting with Prettier (only staged files; only re-stage fully-staged files)
  const formattableFiles = existingFiles.filter(isFormattableFile);
  if (formattableFiles.length > 0) {
    const safeToWrite = isStaged
      ? formattableFiles.filter(fullyStagedFilter)
      : formattableFiles;
    if (safeToWrite.length > 0) {
      console.log(
        `\x1b[34m[Prettier] Formatting ${safeToWrite.length} file(s)...\x1b[0m`,
      );
      const escaped = safeToWrite.map((f) => `"${f}"`).join(' ');
      run(`bunx prettier --write --ignore-unknown ${escaped}`);

      if (isStaged) {
        run(`git add ${escaped}`);
        console.log('\x1b[32m✔ Formatted files re-staged.\x1b[0m');
      }
      console.log('');
    }
  }

  // 2. Linting with ESLint (only staged files)
  const lintableFiles = existingFiles.filter(isLintableTsFile);
  if (lintableFiles.length > 0) {
    const fullyStagedLint = isStaged
      ? lintableFiles.filter(fullyStagedFilter)
      : lintableFiles;
    const partiallyStagedLint = isStaged
      ? lintableFiles.filter((f) => !fullyStagedFilter(f))
      : [];

    console.log(
      `\x1b[34m[ESLint] Linting ${lintableFiles.length} staged file(s)...\x1b[0m`,
    );
    if (fullyStagedLint.length > 0) {
      const escaped = fullyStagedLint.map((f) => `"${f}"`).join(' ');
      run(`bunx eslint --fix ${escaped}`);
      if (isStaged) {
        run(`git add ${escaped}`);
        console.log('\x1b[32m✔ Fixed lint files re-staged.\x1b[0m');
      }
    }
    if (partiallyStagedLint.length > 0) {
      const escapedPartial = partiallyStagedLint.map((f) => `"${f}"`).join(' ');
      run(`bunx eslint ${escapedPartial}`);
    }
    console.log('');
  }

  // Tolk smart contract categorisation (strictly from staged/changed list)
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

  // 3. Run Tolk checks & tests strictly on staged Tolk files
  if (hasTolkChanges) {
    console.log(
      '\x1b[34m[Tolk / Acton] Running staged Tolk checks and tests...\x1b[0m',
    );
    const existingTolk = existingFiles.filter(
      (f) => f.endsWith('.tolk') && !f.startsWith('gen/'),
    );
    if (existingTolk.length > 0) {
      const safeToFmtTolk = isStaged
        ? existingTolk.filter(fullyStagedFilter)
        : existingTolk;
      if (safeToFmtTolk.length > 0) {
        const escapedSafeTolk = safeToFmtTolk.map((f) => `"${f}"`).join(' ');
        run(`acton fmt ${escapedSafeTolk}`);
        if (isStaged) {
          run(`git add ${escapedSafeTolk}`);
        }
      }
      const escapedAllStagedTolk = existingTolk.map((f) => `"${f}"`).join(' ');
      // Only check formatting of staged Tolk files, never unstaged ones
      run(`acton fmt --check ${escapedAllStagedTolk}`);

      // Check and fix staged Tolk files individually
      for (const tolkFile of existingTolk) {
        if (!tolkFile.startsWith('contracts/wrappers/')) {
          run(`acton check --fix "${tolkFile}"`);
          if (isStaged) {
            run(`git add "${tolkFile}"`);
          }
        }
      }
    }

    if (tolkContractFiles.length > 0) {
      const onlyDnsChanged = tolkContractFiles.every((f) =>
        f.startsWith('contracts/src/dns/'),
      );
      if (onlyDnsChanged) {
        console.log('DNS contract source staged: running DNS Tolk tests...');
        run('acton test contracts/tests/dns');
      } else {
        console.log('Tolk contract source staged: running Tolk tests...');
        run('acton test');
      }
    } else if (tolkTestFiles.length > 0) {
      console.log(
        `Running ${tolkTestFiles.length} staged Tolk test file(s)...`,
      );
      run(`acton test ${tolkTestFiles.join(' ')}`);
    }
    console.log('');
  } else {
    console.log(
      '\x1b[90m[Tolk / Acton] No Tolk files staged. Skipping Acton checks.\x1b[0m',
    );
  }

  // 4. Run TypeScript typecheck & affected tests strictly for staged workspaces/files
  const tsJsFiles = changedFiles.filter(
    (f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(f) && !f.endsWith('.tolk'),
  );

  if (tsJsFiles.length > 0) {
    console.log(
      '\x1b[34m[TypeScript / Typecheck] Checking types for staged files...\x1b[0m',
    );

    const hasPackagesChanges = tsJsFiles.some((f) => f.startsWith('packages/'));
    if (hasPackagesChanges) {
      run('bun run build:packages');
    }

    const workspacesToCheck = [
      {
        dir: 'packages/walletkit',
        match: (f) => f.startsWith('packages/walletkit/'),
      },
      {
        dir: 'packages/v4ledger-adapter',
        match: (f) => f.startsWith('packages/v4ledger-adapter/'),
      },
      {
        dir: 'packages/wallet-core',
        match: (f) => f.startsWith('packages/wallet-core/'),
      },
      {
        dir: 'apps/wallet',
        match: (f) =>
          f.startsWith('apps/wallet/') || f.startsWith('wrappers-ts/'),
      },
    ];

    for (const ws of workspacesToCheck) {
      if (tsJsFiles.some(ws.match)) {
        runScopedTypecheck(ws.dir, stagedSet, isStaged);
      }
    }
    console.log('');

    const affectedWalletTests = resolveAffectedWalletTests(
      changedFiles,
      unstagedSet,
      isStaged,
    );
    if (affectedWalletTests.length > 0) {
      console.log(
        `\x1b[34m[TypeScript / Bun] Running ${affectedWalletTests.length} affected test file(s) for staged changes...\x1b[0m`,
      );
      const escapedTests = affectedWalletTests.map((f) => `"${f}"`).join(' ');
      run(`bun test ${escapedTests}`);
      console.log('');
    }

    const walletkitFiles = changedFiles.filter(
      (f) =>
        f.startsWith('packages/walletkit/src/') && !f.endsWith('src/index.ts'),
    );

    if (walletkitFiles.length > 0) {
      console.log(
        '\x1b[34m[Vitest / walletkit] Running walletkit tests...\x1b[0m',
      );
      run('bun run --cwd packages/walletkit test');
      console.log('');
    }
  } else {
    console.log(
      '\x1b[90m[TypeScript / Bun] No TS/JS files staged. Skipping Typecheck and Bun tests.\x1b[0m',
    );
  }

  console.log(
    '\x1b[32m✔ All staged checks, lints, and affected tests passed!\x1b[0m',
  );
}

main().catch((err) => {
  console.error(
    '\x1b[31m✖ Pre-commit checks failed:\x1b[0m',
    err?.message || err,
  );
  process.exit(1);
});
