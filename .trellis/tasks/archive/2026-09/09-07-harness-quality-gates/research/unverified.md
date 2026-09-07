# Node 24 / GitHub evidence

Status: **UNVERIFIED**

## Node 24 runtime

This machine's active Node is `v26.7.0` (`D:\GreenSoftware\node\node.exe`) with npm `12.0.2`.
No Node 24 binary, nvm/fnm/volta/nvs pin, or hosted-runner log was available in this session.

Workflows are pinned to Node 24 LTS as the *proposed* CI baseline. That pin is not local runtime evidence.
Do not treat local Node 26 quality-gate success as Node 24 ABI or Tree-sitter evidence.

## GitHub Actions

`gh run view` on current HEAD: **UNVERIFIED** (no push of this branch).
Linux and Windows hosted jobs, including real parser execution on Node 24, have not been observed.

Local Windows evidence uses Node 26 plus the isolated Python venv at
`C:\Users\lyh\AppData\Local\Temp\drawio-parser-venv\Scripts\python.exe`.
