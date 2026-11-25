# `awesome-os/libv8_monolith` — Ghost Dynamic V8 Shim (Zero 250 MB Static Bloat)

> **Replaces:** Legacy `250 MB+` static `libv8_monolith.a` tarballs historically required by `just-js/lo` and `just-js/just`.  
> **Registry:** [`awesome-os/b8g-ghost @ cas-v1`](https://github.com/awesome-os/b8g-ghost/releases/tag/cas-v1) (`manifests/index.json`)

Instead of statically linking a giant `250 MB` copy of V8 into every `lo`, `just`, or `bun-neon` binary (duplicating V8 in OS RAM across every process), **`awesome-os/libv8_monolith`** provides:

1. **`ghost-v8.mts`** — Zero-dependency $O(1)$ Ghost CAS hydrator that fetches & FIPS 180-4 SHA-256 verifies the shared V8 component pack (`v8-shared-linux-x64.tar.gz` / `v8-shared-win64.zip`) + headers (`v8-include-eaf3708a.tar.gz`) directly from **`awesome-os/b8g-ghost @ cas-v1`**.
2. **`src/ghost_v8_stub.c`** — Tiny `< 15 KB` pure C11 Ghost stub that resolves & dynamically loads the shared `libv8.so` / `v8.dll` / `libv8.dylib` from the shared Machine CAS (`%LOCALAPPDATA%\AwesomeOS\cas\<sha256>\` / `~/.local/share/awesome-os/cas/<sha256>/`), so **`just-js`, `lo`, `bun-neon`, `b8g-ide`, and `sectium-browser` all share ONE copy of V8 in OS RAM (`dup_v8 = 0 B`)**.

## Quick Install & Usage

### Install via `pnpm` (or release tarball)

```powershell
pnpm add github:awesome-os/libv8_monolith
```

Or download the latest SHA-256 verified archive from [`Releases`](https://github.com/awesome-os/libv8_monolith/releases/latest).

### Usage & Verification

```powershell
# Hydrate and SHA-256 verify shared V8 + headers into the local Machine CAS
node ghost-v8.mts --verify
```

## Quickstart

```bash
# Hydrate shared V8 + headers into Machine CAS in O(1) (zero 250MB monolith build)
node ghost-v8.mts --verify
```

## Quick Install & Run (Windows / Linux / macOS)

```sh
# Install / hydrate from v11 CAS via holo-pm
holo-pm install repository://github.com/awesome-os/libv8_monolith@main

# Or project & run directly via holo-project (0-byte hardlink)
holo-project "project://cpp/libv8_monolith?from=repository://github.com/awesome-os/libv8_monolith@main"
```
