/**
 * @file ghost-v8.mts
 * @description Zero-dependency O(1) Ghost CAS V8 Hydrator for awesome-os/libv8_monolith,
 * awesome-os/lo, and awesome-os/just-js. Replaces legacy 250MB static libv8_monolith.a
 * with shared component V8 (libv8.so / v8.dll) hydrated from awesome-os/b8g-ghost @ cas-v1.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const GHOST_INDEX_URL =
  'https://raw.githubusercontent.com/awesome-os/b8g-ghost/main/manifests/index.json';

export function getCasDir(): string {
  if (process.env['B8G_CAS_DIR']?.trim()) return process.env['B8G_CAS_DIR']!;
  if (process.platform === 'win32') {
    return join(process.env['LOCALAPPDATA'] ?? join(homedir(), 'AppData', 'Local'), 'AwesomeOS', 'cas');
  }
  return join(homedir(), '.local', 'share', 'awesome-os', 'cas');
}

export async function hydrateV8FromGhostCas(opts?: {
  readonly platform?: 'linux-x64' | 'win64';
  readonly includeHeaders?: boolean;
  readonly verifyOnly?: boolean;
}) {
  const res = await fetch(GHOST_INDEX_URL);
  if (!res.ok) throw new Error(`Failed to fetch Ghost index: HTTP ${res.status}`);
  const idx = (await res.json()) as {
    schema: string;
    total_entries: number;
    entries: Record<string, { filename: string; sha256: string; bytes: number; download_url: string }>;
  };

  const plat = opts?.platform ?? (process.platform === 'win32' ? 'win64' : 'linux-x64');
  const v8Pack = plat === 'win64' ? 'v8-shared-win64.zip' : 'v8-shared-linux-x64.tar.gz';
  const hdrPack = Object.keys(idx.entries).find((k) => k.startsWith('v8-include-') && k.endsWith('.tar.gz'));

  const targets = [v8Pack, ...(opts?.includeHeaders !== false && hdrPack ? [hdrPack] : [])];
  const results: Array<{ filename: string; sha256: string; bytes: number; casHit: boolean; path?: string }> = [];

  for (const name of targets) {
    const entry = idx.entries[name];
    if (!entry) throw new Error(`Missing "${name}" in canonical Ghost CAS index (${GHOST_INDEX_URL})`);
    if (opts?.verifyOnly) {
      results.push({ filename: name, sha256: entry.sha256, bytes: entry.bytes, casHit: false });
      continue;
    }
    const dir = join(getCasDir(), entry.sha256);
    const targetPath = join(dir, name);
    if (existsSync(targetPath)) {
      const actual = createHash('sha256').update(readFileSync(targetPath)).digest('hex');
      if (actual === entry.sha256) {
        results.push({ filename: name, sha256: entry.sha256, bytes: entry.bytes, casHit: true, path: targetPath });
        continue;
      }
    }
    const dl = await fetch(entry.download_url);
    if (!dl.ok) throw new Error(`HTTP ${dl.status} downloading ${entry.download_url}`);
    const bytes = new Uint8Array(await dl.arrayBuffer());
    const actual = createHash('sha256').update(bytes).digest('hex');
    if (actual !== entry.sha256) {
      throw new Error(`SHA-256 mismatch for ${name}: expected ${entry.sha256}, got ${actual}`);
    }
    mkdirSync(dir, { recursive: true });
    const tmp = `${targetPath}.tmp-${process.pid}`;
    writeFileSync(tmp, bytes);
    try {
      renameSync(tmp, targetPath);
    } catch (e) {
      rmSync(tmp, { force: true });
      throw e;
    }
    results.push({ filename: name, sha256: entry.sha256, bytes: bytes.byteLength, casHit: false, path: targetPath });
  }
  return results;
}

if (process.argv[1]?.endsWith('ghost-v8.mts')) {
  const verifyOnly = process.argv.includes('--verify');
  const platArg = process.argv.find((a) => a.startsWith('--platform='))?.split('=')[1] as
    | 'linux-x64'
    | 'win64'
    | undefined;
  hydrateV8FromGhostCas({ platform: platArg, verifyOnly }).then((rows) => {
    for (const r of rows) {
      console.log(
        `[libv8_monolith:ghost] ${verifyOnly ? 'INDEX-OK' : r.casHit ? 'CAS-HIT ' : 'HYDRATED'} ${r.filename} (${r.bytes} B, sha256=${r.sha256.slice(0, 16)}...)`
      );
    }
  });
}
