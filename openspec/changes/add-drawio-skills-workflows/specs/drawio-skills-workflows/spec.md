# Capability: drawio-skills-workflows

## ADDED Requirements

### Requirement: Provide two standardized skills workflows for scientific diagrams
The system SHALL provide two documented, copy-paste-ready workflows for producing a strict A–H drawing prompt from user-provided material:
1. 从零开始构建 drawio 的工作流（基于正文）
2. 根据已有架构图进行复刻（基于架构图/导出/文字说明 + 可选正文）

#### Scenario: User selects “从零开始构建” workflow
- **GIVEN** the user provides a正文文本
- **WHEN** the workflow template is applied
- **THEN** the output is a single A–H prompt adhering to the hard rules

#### Scenario: User selects “复刻已有架构图” workflow
- **GIVEN** the user provides an架构图或其导出/说明（可附加正文）
- **WHEN** the workflow template is applied
- **THEN** the output is a single A–H prompt that recreates only what is explicitly present

---

### Requirement: Enforce a single-output A–H contract
The system SHALL enforce that the only externally returned content is a single A–H prompt (A→H in order) and SHALL NOT output any other text outside A–H.

#### Scenario: Output includes extra explanation text
- **GIVEN** an attempted response that includes content outside A–H
- **WHEN** the workflow is applied
- **THEN** the workflow fails validation and regenerates the output as A–H only

---

### Requirement: Use explicit-only extraction with “未提及” for missing information
The system SHALL only use objects, processes, groupings, experiments, methods, metrics, sample sizes, QC/statistics/ethics, analysis steps, and outcomes that are explicitly written in the正文/架构图.
If any required field is not explicitly present, the system SHALL write “未提及” and SHALL NOT infer.

#### Scenario: Text omits sample size and ethics
- **GIVEN** the正文 contains methods and results but no sample size and no ethics statement
- **WHEN** the workflow produces section E/F
- **THEN** missing items are written as “未提及” without adding guessed details

---

### Requirement: Preserve fixed causal ordering while allowing parallel/feedback relations
The system SHALL follow the fixed causal order:
对象或工艺 → 采集检测或干预 → 数据处理 → AI建模验证（正文有才写）→ 部署闭环（正文有才写）→ 产出
The system MAY represent parallel, branching, or feedback relations in arrow definitions (D) but SHALL keep the overall reading order top-to-bottom and left-to-right.

#### Scenario: Architecture includes feedback monitoring loop
- **GIVEN** the source material explicitly describes a feedback loop
- **WHEN** producing D
- **THEN** the relation type uses “反馈” and the line type matches the allowed set

---

### Requirement: Constrain diagram structure and labeling
The system SHALL constrain the diagram abstraction to:
- Modules: ≤4
- Nodes per module: 3–5
- Node labels: Chinese short phrases ≤14 characters, no numbering, letters, brackets, punctuation, or symbols
- Node IDs: N1, N2… used only in D (not shown on the diagram)

#### Scenario: Source material contains too many distinct steps
- **GIVEN** the正文 includes more than 5 steps in a phase
- **WHEN** the workflow produces nodes
- **THEN** it merges steps by summarizing without adding meaning, keeping 3–5 nodes per module

---

### Requirement: Produce internal “文字设计稿 + ASCII 草图” as an intermediate artifact
The workflow process SHALL include an intermediate “文字设计稿 + ASCII 草图” step to stabilize structure and layout before generating the final A–H prompt, while still enforcing that the external output remains A–H only.

#### Scenario: Reviewer needs stable structure across iterations
- **GIVEN** the same正文 is processed multiple times
- **WHEN** the workflow is applied
- **THEN** the module and node structure is stable because it is grounded by the intermediate artifacts

