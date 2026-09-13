#!/usr/bin/env bun
/**
 * Automatically updates CONTRACT_CODE_HASHES in
 * apps/wallet/src/lib/brotherhood/account-hydrator.worker.ts
 * using the compiled contract hashes from build/<ContractName>.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const WORKER_FILE = path.join(
  ROOT_DIR,
  'apps',
  'wallet',
  'src',
  'lib',
  'brotherhood',
  'account-hydrator.worker.ts',
);

// Map of CONTRACT_CODE_HASHES keys -> build JSON filename
export const CONTRACT_MAP: Record<string, string> = {
  fiWallet: 'FossFiWallet',
  fiMinter: 'FossFi',
  personalMinter: 'PersonalMinter',
  personalWallet: 'PersonalWallet',
  location: 'Location',
  lottery: 'Lottery',
  poll: 'Poll',
  // aliases
  FossFiWallet: 'FossFiWallet',
  FossFi: 'FossFi',
  PersonalMinter: 'PersonalMinter',
  PersonalWallet: 'PersonalWallet',
  Location: 'Location',
  Lottery: 'Lottery',
  Poll: 'Poll',
};

// Canonical keys in CONTRACT_CODE_HASHES
export const CANONICAL_KEYS: Record<string, string> = {
  fiWallet: 'fiWallet',
  fiMinter: 'fiMinter',
  personalMinter: 'personalMinter',
  personalWallet: 'personalWallet',
  location: 'location',
  lottery: 'lottery',
  poll: 'poll',
  FossFiWallet: 'fiWallet',
  FossFi: 'fiMinter',
  PersonalMinter: 'personalMinter',
  PersonalWallet: 'personalWallet',
  Location: 'location',
  Lottery: 'lottery',
  Poll: 'poll',
};

function getCompiledHashBase64(contractJsonName: string): string | null {
  const jsonPath = path.join(BUILD_DIR, `${contractJsonName}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(
      `Build artifact not found: ${jsonPath}. Run 'acton build' first.`,
    );
    return null;
  }
  try {
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!content.hash) {
      console.error(`No 'hash' found in ${jsonPath}`);
      return null;
    }
    return Buffer.from(content.hash, 'hex').toString('base64');
  } catch (err) {
    console.error(`Error reading ${jsonPath}:`, err);
    return null;
  }
}

function updateCodeHash(
  workerContent: string,
  key: string,
  newHash: string,
): { updated: string; oldHash: string | null } {
  const regex = new RegExp(`(${key}\\s*:\\s*['"])([^'"]+)(['"])`);
  const match = workerContent.match(regex);
  if (!match) {
    return { updated: workerContent, oldHash: null };
  }
  const oldHash = match[2];
  const updated = workerContent.replace(regex, `$1${newHash}$3`);
  return { updated, oldHash };
}

async function promptForTarget(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    console.log('\nAvailable contracts:');
    console.log('  1. fiWallet       (FossFiWallet)');
    console.log('  2. fiMinter       (FossFi minter)');
    console.log('  3. personalMinter (Personal token minter)');
    console.log('  4. personalWallet (Personal token wallet)');
    console.log('  5. location       (Location contract)');
    console.log('  6. lottery        (Lottery contract)');
    console.log('  7. poll           (Poll contract)');
    console.log('  8. all            (Sync all changed)');
    rl.question('\nSelect target contract to update [1-8 or name]: ', (ans) => {
      rl.close();
      const choice = ans.trim();
      switch (choice) {
        case '1':
          resolve('fiWallet');
          break;
        case '2':
          resolve('fiMinter');
          break;
        case '3':
          resolve('personalMinter');
          break;
        case '4':
          resolve('personalWallet');
          break;
        case '5':
          resolve('location');
          break;
        case '6':
          resolve('lottery');
          break;
        case '7':
          resolve('poll');
          break;
        case '8':
        case 'all':
          resolve('all');
          break;
        default:
          resolve(choice || 'all');
          break;
      }
    });
  });
}

export async function main() {
  const args = process.argv.slice(2);
  let targetArg: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      targetArg = args[i + 1];
      i++;
    } else if (args[i].startsWith('--target=')) {
      targetArg = args[i].split('=')[1];
    }
  }

  // Interactive fallback if in TTY and still no target
  if (!targetArg && process.stdin.isTTY) {
    targetArg = await promptForTarget();
  }

  if (!targetArg) {
    // Default to 'all' in non-interactive mode
    targetArg = 'all';
  }

  if (!fs.existsSync(WORKER_FILE)) {
    console.error(`Worker file not found at: ${WORKER_FILE}`);
    process.exit(1);
  }

  let workerContent = fs.readFileSync(WORKER_FILE, 'utf8');

  const targetsToProcess =
    targetArg === 'all'
      ? [
          'fiWallet',
          'fiMinter',
          'personalMinter',
          'personalWallet',
          'location',
          'lottery',
          'poll',
        ]
      : [targetArg];

  let anyUpdated = false;

  for (const rawTarget of targetsToProcess) {
    const canonicalKey = CANONICAL_KEYS[rawTarget];
    if (!canonicalKey) {
      console.warn(`Unknown contract target: "${rawTarget}". Skipping.`);
      continue;
    }

    const buildName = CONTRACT_MAP[canonicalKey];
    const newHash = getCompiledHashBase64(buildName);
    if (!newHash) {
      continue;
    }

    const { updated, oldHash } = updateCodeHash(
      workerContent,
      canonicalKey,
      newHash,
    );
    if (!oldHash) {
      console.warn(`Key "${canonicalKey}" not found in CONTRACT_CODE_HASHES.`);
      continue;
    }

    if (oldHash === newHash) {
      console.log(`✓ ${canonicalKey} is already up to date: ${newHash}`);
    } else {
      console.log(`★ Updated ${canonicalKey} code hash:`);
      console.log(`    old: ${oldHash}`);
      console.log(`    new: ${newHash}`);
      workerContent = updated;
      anyUpdated = true;
    }
  }

  if (anyUpdated) {
    fs.writeFileSync(WORKER_FILE, workerContent, 'utf8');
    console.log(`\nSuccessfully updated ${WORKER_FILE}`);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error('Failed to update contract code hashes:', err);
    process.exit(1);
  });
}
