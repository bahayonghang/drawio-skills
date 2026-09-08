"""Record five-tool CLI version/help and static paths. No paid inference."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
import os
import shutil
import subprocess


TOOLS = [
    {'id': 'claude', 'binaries': ['claude'], 'label': 'Claude Code'},
    {'id': 'codex', 'binaries': ['codex'], 'label': 'Codex'},
    {'id': 'grok', 'binaries': ['grok'], 'label': 'Grok Build'},
    {'id': 'kimi', 'binaries': ['kimi'], 'label': 'Kimi Code'},
    {'id': 'omp', 'binaries': ['omp', 'pi'], 'label': 'OMP'},
]


def run_cmd(args: list[str]) -> dict:
    attempts = [
        {'args': args, 'shell': False},
        {'args': ['cmd', '/c', *args], 'shell': False},
    ]
    last = None
    for attempt in attempts:
        try:
            result = subprocess.run(
                attempt['args'],
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',
                timeout=20,
                shell=attempt['shell'],
            )
            stdout = (result.stdout or '')[:2000]
            stderr = (result.stderr or '')[:1000]
            last = {
                'args': attempt['args'],
                'returncode': result.returncode,
                'stdout_head': stdout,
                'stderr_head': stderr,
            }
            if result.returncode == 0 and stdout.strip():
                return last
        except FileNotFoundError as exc:
            last = {'args': attempt['args'], 'error': f'FileNotFoundError: {exc}'}
        except subprocess.TimeoutExpired:
            last = {'args': attempt['args'], 'error': 'timeout'}
    return last or {'args': args, 'error': 'no attempt'}


def which(name: str) -> str | None:
    return shutil.which(name)


def dir_exists(path: Path) -> dict:
    return {'path': str(path), 'exists': path.exists(), 'is_dir': path.is_dir()}


def main() -> None:
    root = Path(__file__).resolve().parents[4]
    home = Path.home()
    tools = []
    for spec in TOOLS:
        found = None
        for binary in spec['binaries']:
            path = which(binary)
            if path:
                found = {'binary': binary, 'path': path}
                break
        entry = {
            'id': spec['id'],
            'label': spec['label'],
            'resolved': found,
            'version': None,
            'help': None,
            'paid_or_external_action': 'none observed; only --version/--help',
        }
        if found:
            binary_path = found['path']
            entry['version'] = run_cmd([binary_path, '--version'])
            if entry['version'].get('error') or entry['version'].get('returncode') not in (0, None):
                entry['version'] = run_cmd([found['binary'], '--version'])
            entry['help'] = run_cmd([binary_path, '--help'])
            if entry['help'].get('error') or entry['help'].get('returncode') not in (0, None):
                entry['help'] = run_cmd([found['binary'], '--help'])
        tools.append(entry)

    payload = {
        'created_at': datetime.now(timezone.utc).isoformat(),
        'cwd': str(root),
        'node': run_cmd(['node', '--version']),
        'paid_inference': False,
        'desktop_ui_started': False,
        'fresh_session_probes': 'UNVERIFIED',
        'tools': tools,
        'project_static_paths': {
            'AGENTS.md': dir_exists(root / 'AGENTS.md'),
            'CLAUDE.md': dir_exists(root / 'CLAUDE.md'),
            '.claude': dir_exists(root / '.claude'),
            '.claude/skills': dir_exists(root / '.claude' / 'skills'),
            '.agents/skills': dir_exists(root / '.agents' / 'skills'),
            '.codex': dir_exists(root / '.codex'),
            '.grok': dir_exists(root / '.grok'),
            '.kimi-code': dir_exists(root / '.kimi-code'),
            '.omp': dir_exists(root / '.omp'),
            '.pi': dir_exists(root / '.pi'),
        },
        'user_static_paths_existence_only': {
            '~/.claude/skills': dir_exists(home / '.claude' / 'skills'),
            '~/.agents/skills': dir_exists(home / '.agents' / 'skills'),
            '~/.grok/skills': dir_exists(home / '.grok' / 'skills'),
            '~/.kimi-code/skills': dir_exists(home / '.kimi-code' / 'skills'),
            '~/.omp': dir_exists(home / '.omp'),
        },
        'model_control_locations_from_matrix': {
            'claude': 'agent model / permissionMode in Claude agent files',
            'codex': 'custom agent TOML model and model_reasoning_effort',
            'grok': 'native agent/model control; SKILL allowed-tools/model/effort are not applied as Grok permission or model fields',
            'kimi': 'native agent pool / call interface; Claude agent model fields are not portable',
            'omp': 'Task agent model/role selector and modelRoles',
        },
        'rule_and_skill_sources_from_matrix': {
            'claude': 'CLAUDE.md (@AGENTS.md), .claude/skills, ~/.claude/skills',
            'codex': 'AGENTS.md, .agents/skills, ~/.agents/skills',
            'grok': 'AGENTS family and Claude compatibility; native .grok/skills, ~/.grok/skills, ~/.agents/skills',
            'kimi': 'root AGENTS; .agents/skills and .kimi-code/skills',
            'omp': 'root AGENTS, native .omp / provider compatibility; .agents/skills depending on enabled provider',
        },
    }

    raw = Path(__file__).resolve().parent / 'five-tool-probe.json'
    raw.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print('wrote', raw)
    for tool in tools:
        version_out = ''
        if tool['version'] and tool['version'].get('stdout_head'):
            version_out = tool['version']['stdout_head'].splitlines()[0]
        print(tool['id'], tool['resolved'], '=>', version_out or tool['version'])


if __name__ == '__main__':
    main()
