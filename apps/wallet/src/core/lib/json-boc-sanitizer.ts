/**
 * JSON & BoC Sanitizer for Developer Telemetry and Payload Viewer
 *
 * 1. Detects TON BoC strings (base64 te6..., hex b5ee9c72..., and cell keys)
 * 2. Truncates large BoC fields to 2-3 show characters (e.g. "te6...")
 * 3. Repairs truncated JSON payloads to restore full JSON formatting across all API calls
 * 4. Safely stringifies large JSON objects without mid-syntax truncation
 */

/** Matches TON friendly-format addresses (48 chars) and raw hex format (-1:... or 0:...) */
export const TON_ADDRESS_RE =
  /^(?:(?:EQ|UQ|kQ|0Q|Ef|Uf|kf|0f|k0|00)[A-Za-z0-9_\-+/]{46}|-?[0-1]:[0-9a-fA-F]{64})$/;

export function isTonAddressString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return TON_ADDRESS_RE.test(trimmed);
}

/**
 * Checks if a string or key represents a TON BoC (Bag of Cells) payload.
 * Excludes user-friendly and raw TON addresses, transaction hashes, and public keys.
 */
export function isBocString(val: unknown, keyName?: string): boolean {
  if (typeof val !== 'string' || !val) return false;
  const trimmed = val.trim();
  if (trimmed.length < 4) return false;

  // Never treat valid TON addresses as BoCs
  if (isTonAddressString(trimmed)) {
    return false;
  }

  // Common TON BoC prefixes:
  // Base64 cell prefix: te6 (te6cc, te6cg, te6cb, te6ca, etc.)
  if (trimmed.startsWith('te6') && trimmed.length > 8) {
    return true;
  }

  // Hex cell prefix: b5ee9c72 / B5EE9C72
  if (trimmed.toLowerCase().startsWith('b5ee9c72') && trimmed.length > 16) {
    return true;
  }

  // 64-char hex strings are standard SHA-256 hashes, not BoC cells
  if (trimmed.length === 64 && /^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return false;
  }

  // Key-name indicators
  if (keyName) {
    const normKey = keyName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const isHashOrKey =
      normKey.includes('hash') ||
      normKey.includes('pubkey') ||
      normKey.includes('public_key') ||
      normKey.includes('signature');

    if (
      isHashOrKey &&
      !trimmed.startsWith('te6') &&
      !trimmed.toLowerCase().startsWith('b5ee9c72')
    ) {
      return false;
    }

    if (
      normKey.includes('boc') ||
      normKey === 'cell' ||
      normKey.endsWith('_cell') ||
      normKey === 'data' ||
      normKey === 'code' ||
      normKey === 'state_init' ||
      normKey === 'init_code' ||
      normKey === 'init_data' ||
      normKey === 'bytes' ||
      normKey === 'msg_data' ||
      normKey === 'body'
    ) {
      if (trimmed.length > 12) return true;
    }
  }

  // Very long base64 string (> 60 chars) that is not an address
  if (trimmed.length > 60 && /^[A-Za-z0-9+/=_-]+$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Truncates a BoC string to just 2-3 characters (e.g. "te6..." or "b5e...")
 */
export function truncateBocString(val: string): string {
  const trimmed = val.trim();
  return `${trimmed.slice(0, 3)}...`;
}

/**
 * Recursively walks a JSON-serializable structure and replaces all large BoC fields
 * with 2-3 show characters (e.g. "te6...").
 */
export function sanitizeBocFields(data: unknown, keyName?: string): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    if (isBocString(data, keyName)) {
      return truncateBocString(data);
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeBocFields(item, keyName));
  }

  if (typeof data === 'object') {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      res[k] = sanitizeBocFields(v, k);
    }
    return res;
  }

  return data;
}

/**
 * Repairs truncated JSON string by closing open quotes, trailing commas/colons,
 * and unmatched arrays/objects in reverse order.
 */
export function repairTruncatedJson(jsonStr: string): string | null {
  if (!jsonStr) return null;
  let str = jsonStr.trim();
  if (!str.startsWith('{') && !str.startsWith('[')) return null;

  const stack: ('}' | ']')[] = [];
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (ch === '\\') {
        isEscaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    str += '"';
  }

  str = str.trimEnd();

  while (str.endsWith(',') || str.endsWith(':')) {
    if (str.endsWith(':')) {
      str += ' null';
      break;
    }
    str = str.slice(0, -1).trimEnd();
  }

  while (stack.length > 0) {
    str += stack.pop();
  }

  return str;
}

/**
 * Attempts to parse JSON directly. If it fails, attempts robust repair of
 * truncated JSON (including dangling keys) so that incomplete responses
 * can still be formatted and viewed interactively.
 */
export function tryParseOrRepairJson(jsonStr: string): unknown | null {
  if (!jsonStr) return null;
  const trimmed = jsonStr.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null;
    }
  }

  try {
    const repaired = repairTruncatedJson(trimmed);
    if (repaired) {
      return JSON.parse(repaired);
    }
  } catch {
    // If standard repair failed (e.g. cut off inside a key name),
    // strip the trailing partial key back to the last delimiter
    try {
      const lastComma = trimmed.lastIndexOf(',');
      const lastOpenBrace = Math.max(
        trimmed.lastIndexOf('{'),
        trimmed.lastIndexOf('['),
      );
      const cutPoint = Math.max(lastComma, lastOpenBrace);
      if (cutPoint > 0) {
        const sliced = trimmed.slice(
          0,
          cutPoint + (cutPoint === lastComma ? 0 : 1),
        );
        const repaired = repairTruncatedJson(sliced);
        if (repaired) {
          return JSON.parse(repaired);
        }
      }
    } catch {
      // Ignored
    }
  }

  return null;
}

/**
 * Safely stringifies JSON data under a maximum length constraint without
 * breaking JSON validity (prunes excess array items rather than slicing string).
 */
export function safeStringifyJson(data: unknown, maxLength: number): string {
  try {
    const formatted = JSON.stringify(data, null, 2);
    if (formatted.length <= maxLength) {
      return formatted;
    }

    const pruned = pruneLargeCollections(data, 30);
    const prunedFormatted = JSON.stringify(pruned, null, 2);
    if (prunedFormatted.length <= maxLength) {
      return prunedFormatted;
    }

    const strictlyPruned = pruneLargeCollections(data, 10);
    return JSON.stringify(strictlyPruned, null, 2);
  } catch {
    return String(data);
  }
}

function pruneLargeCollections(obj: unknown, maxItems = 30): unknown {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    if (obj.length > maxItems) {
      const sliced = obj
        .slice(0, maxItems)
        .map((i) => pruneLargeCollections(i, maxItems));
      sliced.push(`... [${obj.length - maxItems} more items truncated]` as any);
      return sliced;
    }
    return obj.map((i) => pruneLargeCollections(i, maxItems));
  }

  const res: Record<string, unknown> = {};
  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [k, v] of entries) {
    res[k] = pruneLargeCollections(v, maxItems);
  }
  return res;
}
