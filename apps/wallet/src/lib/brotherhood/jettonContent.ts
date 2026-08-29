import {
  beginCell,
  Cell,
  Dictionary,
  type Builder,
  type Slice,
} from '@ton/core';

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_DATA_PREFIX = 0x00;

const sha256Keys: Record<string, Buffer> = {};

async function sha256(key: string): Promise<Buffer> {
  if (!sha256Keys[key]) {
    const data = new TextEncoder().encode(key);
    const hash = await crypto.subtle.digest('SHA-256', data);
    sha256Keys[key] = Buffer.from(hash);
  }
  return sha256Keys[key]!;
}

function makeSnakeCell(data: Buffer): Cell {
  const firstChunkSize = 126;
  const chunkSize = 127;

  if (data.length <= firstChunkSize) {
    return beginCell()
      .storeUint(SNAKE_DATA_PREFIX, 8)
      .storeBuffer(data)
      .endCell();
  }

  const chunks: Buffer[] = [];
  chunks.push(data.subarray(0, firstChunkSize));
  let offset = firstChunkSize;
  while (offset < data.length) {
    const end = Math.min(offset + chunkSize, data.length);
    chunks.push(data.subarray(offset, end));
    offset = end;
  }

  let cell: Cell | null = null;
  for (let i = chunks.length - 1; i >= 0; i--) {
    const builder = beginCell();
    if (i === 0) {
      builder.storeUint(SNAKE_DATA_PREFIX, 8);
    }
    builder.storeBuffer(chunks[i]!);
    if (cell) {
      builder.storeRef(cell);
    }
    cell = builder.endCell();
  }
  return cell!;
}

// Tolk `storeString` is TVM STREF: the string is stored as a ref to a snake
// cell (127-byte chunks). Replicate that snake (no 0x prefix byte here).
function stringSnakeCell(data: string): Cell {
  const bytes = Buffer.from(data, 'utf-8');
  if (bytes.length <= 127) {
    return beginCell().storeBuffer(bytes).endCell();
  }
  const chunks: Buffer[] = [];
  for (let i = 0; i < bytes.length; i += 127) {
    chunks.push(bytes.subarray(i, Math.min(i + 127, bytes.length)));
  }
  let cell = beginCell()
    .storeBuffer(chunks[chunks.length - 1]!)
    .endCell();
  for (let i = chunks.length - 2; i >= 0; i--) {
    cell = beginCell().storeBuffer(chunks[i]!).storeRef(cell).endCell();
  }
  return cell;
}

export interface JettonMetadata {
  name: string;
  symbol: string;
  decimals?: string;
  description?: string;
  image?: string;
  imageData?: string;
}

export async function buildOnchainMetadata(
  metadata: JettonMetadata,
): Promise<Cell> {
  const dict = Dictionary.empty(
    Dictionary.Keys.Buffer(32),
    Dictionary.Values.Cell(),
  );

  const entries: [string, string][] = [
    ['name', metadata.name],
    ['symbol', metadata.symbol],
    ['decimals', metadata.decimals ?? '9'],
  ];
  if (metadata.description) entries.push(['description', metadata.description]);
  if (metadata.image) entries.push(['image', metadata.image]);
  if (metadata.imageData) entries.push(['image_data', metadata.imageData]);

  for (const [key, value] of entries) {
    const keyHash = await sha256(key);
    const valueCell = makeSnakeCell(Buffer.from(value, 'utf-8'));
    dict.set(keyHash, valueCell);
  }

  return beginCell()
    .storeUint(ONCHAIN_CONTENT_PREFIX, 8)
    .storeDict(dict)
    .endCell();
}

// Builds onchain jetton content byte-identical to the Tolk contracts'
// buildJettonMetadataCell (OnchainMetadataReply): always 5 keys, each value
// stored as ref( 0x00 + ref(snake string) ). Verified byte-for-byte against
// Tolk for short, long (multi-chunk snake), and empty strings.
export async function buildTolkOnchainMetadata(
  metadata: JettonMetadata,
): Promise<Cell> {
  const stringPrefixed0x = {
    serialize(self: string, b: Builder): void {
      b.storeRef(
        beginCell()
          .storeUint(SNAKE_DATA_PREFIX, 8)
          .storeRef(stringSnakeCell(self))
          .endCell(),
      );
    },
    parse(s: Slice): string {
      return s.loadStringRefTail();
    },
  };
  const dict = Dictionary.empty(Dictionary.Keys.BigUint(256), stringPrefixed0x);

  const entries: [string, string][] = [
    ['name', metadata.name],
    ['symbol', metadata.symbol],
    ['description', metadata.description ?? ''],
    ['image', metadata.image ?? ''],
    ['decimals', metadata.decimals ?? '9'],
  ];

  for (const [key, value] of entries) {
    const keyHash = await sha256(key);
    dict.set(BigInt('0x' + keyHash.toString('hex')), value);
  }

  return beginCell()
    .storeUint(ONCHAIN_CONTENT_PREFIX, 8)
    .storeDict(dict)
    .endCell();
}
