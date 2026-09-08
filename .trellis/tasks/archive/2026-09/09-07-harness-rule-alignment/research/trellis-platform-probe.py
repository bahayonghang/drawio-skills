"""Independent TRELLIS_PLATFORM probes. Does not edit the adapter."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
import os
import subprocess
import sys


PLATFORMS = ['claude', 'codex', 'grok', 'kimi', 'omp']


def probe(root: Path, platform: str | None) -> dict:
    env = os.environ.copy()
    env.pop('TRELLIS_PLATFORM', None)
    if platform is not None:
        env['TRELLIS_PLATFORM'] = platform
    code = (
        'from pathlib import Path\n'
        'from common.cli_adapter import detect_platform\n'
        'print(detect_platform(Path.cwd()), end="")\n'
    )
    result = subprocess.run(
        [sys.executable, '-c', code],
        cwd=str(root),
        env=env,
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
        timeout=20,
    )
    return {
        'TRELLIS_PLATFORM': platform,
        'returncode': result.returncode,
        'stdout': result.stdout,
        'stderr_head': (result.stderr or '')[:500],
        'ok': result.returncode == 0 and (platform is None or result.stdout == platform),
    }


def main() -> None:
    root = Path(__file__).resolve().parents[4]
    env = os.environ.copy()
    env['PYTHONPATH'] = str(root / '.trellis' / 'scripts')
    # Re-run through nested env by injecting PYTHONPATH into probe via os.environ for children
    os.environ['PYTHONPATH'] = env['PYTHONPATH']
    rows = [probe(root, platform) for platform in PLATFORMS]
    auto = probe(root, None)
    payload = {
        'created_at': datetime.now(timezone.utc).isoformat(),
        'cwd': str(root),
        'PYTHONPATH': env['PYTHONPATH'],
        'explicit': rows,
        'auto_without_env': auto,
        'note': (
            'Auto-detect without TRELLIS_PLATFORM currently returns claude when '
            '.claude exists. Hosted adapter/workflow were not rewritten.'
        ),
        'all_explicit_ok': all(row['ok'] for row in rows),
    }
    out = Path(__file__).resolve().parent / 'trellis-platform-probe.json'
    out.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print(json.dumps(payload, indent=2))


if __name__ == '__main__':
    main()
