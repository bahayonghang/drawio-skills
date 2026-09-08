"""One-shot local install refresh. Not part of the product CLI."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
import os
import shutil
import subprocess


def frontmatter_version(path: Path) -> str | None:
    text = path.read_text(encoding='utf-8', errors='replace')
    for line in text.splitlines()[:20]:
        if line.startswith('version:'):
            return line.split(':', 1)[1].strip().strip('"').strip("'")
    return None


def describe(path: Path) -> dict:
    item = {
        'path': str(path),
        'exists': path.exists(),
        'is_symlink': path.is_symlink(),
        'resolve': str(path.resolve()) if path.exists() else None,
    }
    probe = subprocess.run(
        ['cmd', '/c', f'fsutil reparsepoint query "{path}"'],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )
    item['fsutil_ok'] = probe.returncode == 0
    item['fsutil_head'] = '\n'.join(probe.stdout.splitlines()[:8])
    return item


def mklink_junction(link: Path, target: Path) -> None:
    result = subprocess.run(
        ['cmd', '/c', 'mklink', '/J', str(link), str(target)],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )
    print((result.stdout or result.stderr).strip())
    if result.returncode != 0:
        raise SystemExit(f'mklink failed {link} -> {target}: {result.returncode} {result.stderr}')


def main() -> None:
    root = Path(__file__).resolve().parents[4]
    agents_skills = root / '.agents' / 'skills'
    src_drawio = root / 'skills' / 'drawio'
    src_academic = root / 'skills' / 'drawio-academic-skills'
    inst_drawio = agents_skills / 'drawio'
    inst_academic = agents_skills / 'drawio-academic-skills'
    claude_drawio = root / '.claude' / 'skills' / 'drawio'
    claude_academic = root / '.claude' / 'skills' / 'drawio-academic-skills'

    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = Path(os.environ['TEMP']) / f'drawio-skills-agents-backup-{stamp}'
    backup.mkdir(parents=True)
    print('backup', backup)

    preserved_before = sorted(p.name for p in agents_skills.iterdir() if p.exists())
    n1 = len(list(shutil.copytree(inst_drawio, backup / 'drawio').rglob('*')))
    n2 = len(list(shutil.copytree(inst_academic, backup / 'drawio-academic-skills').rglob('*')))
    print('backed up entries', n1, n2)

    backup_meta = {
        'backup_root': str(backup),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'drawio_entries': n1,
        'academic_entries': n2,
        'drawio_skill_version': frontmatter_version(backup / 'drawio' / 'SKILL.md'),
        'academic_skill_version': frontmatter_version(backup / 'drawio-academic-skills' / 'SKILL.md'),
        'preserved_agents_skills_before': preserved_before,
    }

    for path in (inst_drawio, inst_academic):
        if path.is_symlink() or path.is_file():
            path.unlink()
        elif path.exists():
            shutil.rmtree(path)

    mklink_junction(inst_drawio, src_drawio)
    mklink_junction(inst_academic, src_academic)

    help_src = subprocess.run(
        ['node', str(src_drawio / 'scripts' / 'cli.js'), '--help'],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )
    help_inst = subprocess.run(
        ['node', str(inst_drawio / 'scripts' / 'cli.js'), '--help'],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )

    meta = {
        'backup': backup_meta,
        'after': {
            'agents_skills': sorted(p.name for p in agents_skills.iterdir() if p.exists()),
            'drawio': describe(inst_drawio),
            'academic': describe(inst_academic),
            'claude_drawio': describe(claude_drawio),
            'claude_academic': describe(claude_academic),
            'source_drawio_version': frontmatter_version(src_drawio / 'SKILL.md'),
            'source_academic_version': frontmatter_version(src_academic / 'SKILL.md'),
            'install_drawio_version': frontmatter_version(inst_drawio / 'SKILL.md'),
            'install_academic_version': frontmatter_version(inst_academic / 'SKILL.md'),
        },
        'cli_help': {
            'source_status': help_src.returncode,
            'install_status': help_inst.returncode,
            'source_has_compose': 'compose' in help_src.stdout,
            'install_has_compose': 'compose' in help_inst.stdout,
            'source_has_js_imports': 'js-imports' in help_src.stdout,
            'install_has_js_imports': 'js-imports' in help_inst.stdout,
            'stdout_equal': help_src.stdout == help_inst.stdout,
        },
    }

    out = Path(__file__).resolve().parent / 'install-refresh.json'
    out.write_text(json.dumps(meta, indent=2), encoding='utf-8')
    print(json.dumps(meta['after'], indent=2))
    print('cli_help', meta['cli_help'])
    print('wrote', out)

    for name in ('_tmp_pause_diff', '_tmp_git25', '_tmp_inst'):
        junk = root / name
        if junk.exists():
            shutil.rmtree(junk)
            print('removed', junk)


if __name__ == '__main__':
    main()
