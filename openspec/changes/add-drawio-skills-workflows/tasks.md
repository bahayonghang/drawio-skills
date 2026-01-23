# Tasks

## 1. Documentation & Templates
- [ ] Add a new workflow reference page describing the two workflows (ZH)
- [ ] Add an English workflow reference page (EN)
- [ ] Link the new pages from existing docs and/or `skills/drawio/references/`

## 2. Workflow Prompt Assets
- [ ] Provide copy-paste-ready workflow prompt templates for both workflows
- [ ] Provide at least one minimal example input per workflow (正文占位/架构图占位)

## 3. Quality Gates
- [ ] Add a deterministic checklist for verifying A–H format and hard rules
- [ ] Add a small set of regression examples (pass/fail) for future changes

## 4. Validation
- [ ] Run docs build (`docs:build`) to ensure new pages render
- [ ] Run `openspec validate add-drawio-skills-workflows --strict --no-interactive`

