#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const stagedOnly = process.argv.includes('--staged');

function getChangedFiles() {
  const fileSet = new Set();

  try {
    // 1. Staged files
    const staged = execSync(
      'git diff --cached --name-only --diff-filter=ACMR',
      {
        encoding: 'utf-8',
      },
    ).trim();
    if (staged) {
      staged
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => fileSet.add(f));
    }

    if (stagedOnly) {
      return Array.from(fileSet);
    }

    // 2. Unstaged changes in working tree
    const unstaged = execSync('git diff --name-only --diff-filter=ACMR', {
      encoding: 'utf-8',
    }).trim();
    if (unstaged) {
      unstaged
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => fileSet.add(f));
    }

    // 3. Untracked files
    const untracked = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
    }).trim();
    if (untracked) {
      untracked
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => fileSet.add(f));
    }
  } catch (err) {
    console.warn('Could not determine git diff:', err?.message || err);
  }

  return Array.from(fileSet);
}

function isFormattable(file) {
  if (!existsSync(file)) return false;
  if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|css|html|md|yaml|yml)$/i.test(file))
    return false;
  if (
    file.includes('/dist/') ||
    file.includes('/dist-ssr/') ||
    file.includes('/build/') ||
    file.includes('/node_modules/') ||
    file.includes('/.acton/') ||
    file.endsWith('routeTree.gen.ts') ||
    file.endsWith('.gen.ts') ||
    file.endsWith('.tolk')
  ) {
    return false;
  }
  return true;
}

const changed = getChangedFiles().filter(isFormattable);

if (changed.length === 0) {
  console.log('No changed formattable files detected.');
  process.exit(0);
}

console.log(
  `\x1b[34m[format:changed] Formatting ${changed.length} file(s)...\x1b[0m`,
);
const escaped = changed.map((f) => `"${f}"`).join(' ');
execSync(`bunx prettier --write --ignore-unknown ${escaped}`, {
  stdio: 'inherit',
});
console.log(`\x1b[32m✔ Done formatting ${changed.length} file(s).\x1b[0m`);
