"""Existence checks for shared rules and thin CLAUDE bridge. No huge verbatim pins."""
from __future__ import annotations

from pathlib import Path
import json


def main() -> None:
    root = Path(__file__).resolve().parents[4]
    claude = (root / 'CLAUDE.md').read_text(encoding='utf-8')
    agents = (root / 'AGENTS.md').read_text(encoding='utf-8')
    required = [
        root / 'AGENTS.md',
        root / 'CLAUDE.md',
        root / '.github' / 'workflows' / 'ci.yml',
        root / 'skills' / 'drawio' / 'SKILL.md',
        root / 'skills' / 'drawio-academic-skills' / 'SKILL.md',
        root / '.trellis' / 'workflow.md',
        root / 'tests' / 'skill-installation.test.js',
    ]
    missing = [str(path.relative_to(root)) for path in required if not path.exists()]
    claude_lines = [line for line in claude.splitlines() if line.strip()]
    payload = {
        'missing_required_files': missing,
        'claude_line_count': len(claude.splitlines()),
        'claude_nonempty_line_count': len(claude_lines),
        'claude_has_agents_import': '@AGENTS.md' in claude,
        'claude_mentions_skill_discovery': '.claude/skills' in claude,
        'claude_does_not_repeat_ci_gate': 'version-check' not in claude and 'just ci' not in claude,
        'agents_names_read_only_ci': 'npm run ci' in agents and 'just ci' in agents,
        'agents_does_not_claim_lint_plus_tests_only': 'run lint + tests (closest local CI check)' not in agents,
        'agents_does_not_claim_node_20_ci': 'GitHub Actions use Node 20' not in agents,
        'agents_marks_node_24_unverified': 'UNVERIFIED' in agents and 'Node 24' in agents,
        'agents_omits_parent_harness_matrix_path': (
            'harness-matrix.md' not in agents and '09-07-evergreen-harness-alignment' not in agents
        ),
        'agents_has_inline_harness_facts': (
            'TRELLIS_PLATFORM' in agents and 'native' in agents.lower() and 'compatibility' in agents.lower()
        ),
        'agents_skills_source_boundary': 'only tracked product source' in agents,
        'ok': not missing
        and '@AGENTS.md' in claude
        and len(claude.splitlines()) <= 20
        and 'version-check' not in claude
        and 'harness-matrix.md' not in agents
        and '09-07-evergreen-harness-alignment' not in agents
        and 'TRELLIS_PLATFORM' in agents
        and 'native' in agents.lower()
        and 'compatibility' in agents.lower(),
    }
    out = Path(__file__).resolve().parent / 'shared-rules-check.json'
    out.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print(json.dumps(payload, indent=2))
    if not payload['ok']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
