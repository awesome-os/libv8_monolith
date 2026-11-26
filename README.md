# `awesome-os/libv8_monolith` — Holo `v11` Dynamic V8 Shim (Zero 250 MB Static Bloat)

> **Replaces:** Legacy `250 MB+` static `libv8_monolith.a` tarballs historically required by `just-js/lo` and `just-js/just`.
> **Registry:** [`awesome-os/holo-v11`](https://github.com/awesome-os/holo-v11) (`index/holo-compiler-lockfile.json`)

Instead of statically linking a `250 MB` copy of V8 into every `lo`, `just`, or `bun-neon` binary (duplicating V8 in OS RAM across every process), **`awesome-os/libv8_monolith`** provides a `< 15 KB` C11 dynamic V8 loader backed by the shared **`Holo v11` CAS** (`~/.b8g/cas/v11/files`) so `lo`, `bun-neon`, and `sectium-browser` share ONE copy of V8 in OS RAM (`dup_v8 = 0 B`).

## Quick Install & Run (Windows / Linux / macOS)

```sh
# Install / hydrate from v11 CAS via holo-pm
holo-pm install repository://github.com/awesome-os/libv8_monolith@main

# Or project & run directly via holo-project (0-byte hardlink)
holo-project "project://cpp/libv8_monolith?from=repository://github.com/awesome-os/libv8_monolith@main"
```
