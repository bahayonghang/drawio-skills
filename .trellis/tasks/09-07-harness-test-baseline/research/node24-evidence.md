# Node 24 parser evidence

Status: **UNVERIFIED**

This machine's active Node is `v26.7.0` at `D:\GreenSoftware\node\node.exe`.
Also present: `D:\GreenSoftware\node-old-v25.9.0`.
No `node24` / `node-24` command, no nvm/fnm/volta/nvs on PATH, and no `fnm\node-versions` directory.

Real JS/Go/Rust/Python AST was executed on Node 26 + npm 12, not Node 24.
Do not treat Node 26 success as Node 24 ABI evidence.

Locked parser versions were not changed. Native Tree-sitter prebuilds loaded on Node 26 without a version bump.
