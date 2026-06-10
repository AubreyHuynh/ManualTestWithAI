# QA Toolkit Audit & Layered Architecture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all logic errors, broken references, and inconsistencies across Skills, Workflows, and Manual Plans; establish clean layered architecture with universal rules.

**Architecture:** Layer 1 (SKILL.md) = authoritative enforcement for Claude Code. Layer 2 (Workflows) = correct entry points. Layer 3 (Plans) = self-contained copy-paste prompts. Layer 4 (rules/manual_rules.md) = universal constants shared by all layers.

**Spec:** `.claude/specs/2026-06-10-toolkit-audit-and-layered-architecture-design.md`

---

## File Map

| File | Action | Reason |
|---|---|---|
| `.claude/workflows/01_generate_manual_testcases_rbt.md` | Modify | Fix skill path (`.agent/` → `.claude/`), fix frontmatter name (underscores → hyphens) |
| `.claude/workflows/02_generate_requirements_from_website.md` | Modify | Fix frontmatter name, add missing skill path |
| `.claude/workflows/03_generate_testcases_from_requirements.md` | Modify | Fix frontmatter name |
| `.claude/skills/rbt-manual-testing/SKILL.md` | Modify | Fix contradiction, file extensions, Step 3 pause, Priority, columns, enforcement, self-check, artifact |
| `.claude/skills/requirements-analyzer/SKILL.md` | Modify | Add sections 3.5, 3.6, 5; add Definition of Done |
| `.claude/plans/manual/01_context_and_roleplay/prompt.md` | Modify | Add `---END---`, version footer |
| `.claude/plans/manual/02_analysis_and_qna/prompt.md` | Modify | Add `---END---`, version footer |
| `.claude/plans/manual/03_decomposition/prompt.md` | Modify | Add missing ⏸️ pause, `---END---`, version footer |
| `.claude/plans/manual/04_traceability/prompt.md` | Modify | Add `---END---`, version footer |
| `.claude/plans/manual/05_rbt_and_tc_generation/prompt.md` | Modify | Fix vague threshold, add `---END---`, version footer |
| `.claude/plans/manual/06_template_mapping/prompt.md` | Modify | Add `---END---`, version footer |
| `.claude/rules/manual_rules.md` | Rewrite | Fill from empty with universal QA rules |

---

## Task 1: Fix Workflow Frontmatter and Broken Skill Paths

**Files:**
- Modify: `.claude/workflows/01_generate_manual_testcases_rbt.md`
- Modify: `.claude/workflows/02_generate_requirements_from_website.md`
- Modify: `.claude/workflows/03_generate_testcases_from_requirements.md`

- [ ] **Step 1: Fix workflow 01 — frontmatter skill name and skill path in body**

In `.claude/workflows/01_generate_manual_testcases_rbt.md`:

Find:
```
skills:
  - rbt_manual_testing
```
Replace with:
```
skills:
  - rbt-manual-testing
```

Find:
```
> **MANDATORY SKILL:** You MUST load and carefully read the content of the **`rbt_manual_testing`** skill (at `.agent/skills/rbt_manual_testing/SKILL.md`) before starting this task. Use the **FULL RBT Mode** of the skill. Also refer to the **`requirements_analyzer`** skill to understand how to analyze interfaces if needed.
```
Replace with:
```
> **MANDATORY SKILL:** You MUST load and carefully read the content of the **`rbt-manual-testing`** skill (at `.claude/skills/rbt-manual-testing/SKILL.md`) before starting this task. Use the **FULL RBT Mode** of the skill. Also refer to the **`requirements-analyzer`** skill to understand how to analyze interfaces if needed.
```

- [ ] **Step 2: Fix workflow 02 — frontmatter skill name and add skill path**

In `.claude/workflows/02_generate_requirements_from_website.md`:

Find:
```
skills:
  - requirements_analyzer
```
Replace with:
```
skills:
  - requirements-analyzer
```

Find:
```
> **MANDATORY SKILL:** You MUST load and carefully read the **`requirements_analyzer`** skill to understand the standard Requirements document format before starting this task.
```
Replace with:
```
> **MANDATORY SKILL:** You MUST load and carefully read the **`requirements-analyzer`** skill (at `.claude/skills/requirements-analyzer/SKILL.md`) to understand the standard Requirements document format before starting this task.
```

- [ ] **Step 3: Fix workflow 03 — frontmatter skill name**

In `.claude/workflows/03_generate_testcases_from_requirements.md`:

Find:
```
skills:
  - rbt_manual_testing
```
Replace with:
```
skills:
  - rbt-manual-testing
```

Find:
```
> **MANDATORY SKILL:** You MUST load and carefully read the **`rbt_manual_testing`** skill before starting this task. Use the skill's **QUICK mode**.
```
Replace with:
```
> **MANDATORY SKILL:** You MUST load and carefully read the **`rbt-manual-testing`** skill (at `.claude/skills/rbt-manual-testing/SKILL.md`) before starting this task. Use the skill's **QUICK mode**.
```

- [ ] **Step 4: Verify all 3 workflow files**

Read each file and confirm:
- Frontmatter uses `rbt-manual-testing` (hyphens)
- Workflow 01 body path is `.claude/skills/rbt-manual-testing/SKILL.md`
- Workflow 02 body has `requirements-analyzer` skill path
- Workflow 03 body has `rbt-manual-testing` skill path

- [ ] **Step 5: Commit pending CLAUDE.md changes and workflow fixes**

```bash
git add CLAUDE.md
git add .claude/skills/rbt-manual-testing/SKILL.md
git add .claude/workflows/01_generate_manual_testcases_rbt.md
git add .claude/workflows/02_generate_requirements_from_website.md
git add .claude/workflows/03_generate_testcases_from_requirements.md
git commit -m "fix: commit CLAUDE.md, correct skill names and paths in all workflow files"
```

---

## Task 2: Fix Logic Errors in rbt-manual-testing SKILL.md

**Files:**
- Modify: `.claude/skills/rbt-manual-testing/SKILL.md`

**What to fix in this task:**
- Remove contradictory "agent should read prompt templates" line
- Fix `.txt` → `.md` file extension references
- Add missing ⏸️ pause at end of Step 3
- Standardize Priority to 4 levels in FULL RBT (add "Critical")
- Standardize TC table column order in both modes

- [ ] **Step 1: Remove the contradiction in the Prompt Templates section**

Find:
```
The agent should read the corresponding prompt template **before** executing each step (FULL RBT mode).

Mode QUICK does not require reading prompt templates — the agent applies EP/BVA/Decision Table techniques directly.
```
Replace with:
```
Mode QUICK does not require reading prompt templates — the agent applies EP/BVA/Decision Table techniques directly.
```

- [ ] **Step 2: Fix `.txt` → `.md` in the Prompt Templates section**

Find:
```
plans/manual/
├── 01_context_and_roleplay/prompt.txt
├── 02_analysis_and_qna/prompt.txt
├── 03_decomposition/prompt.txt
├── 04_traceability/prompt.txt
├── 05_rbt_and_tc_generation/prompt.txt
└── 06_template_mapping/prompt.txt
```
Replace with:
```
plans/manual/
├── 01_context_and_roleplay/prompt.md
├── 02_analysis_and_qna/prompt.md
├── 03_decomposition/prompt.md
├── 04_traceability/prompt.md
├── 05_rbt_and_tc_generation/prompt.md
└── 06_template_mapping/prompt.md
```

Also find (in the NOTE block of the FULL RBT intro):
```
> - **Copy-Paste flow:** QA team copies the detailed prompt content from `plans/manual/01-06/prompt.txt` into the AI chat, one step at a time.
```
Replace with:
```
> - **Copy-Paste flow:** QA team copies the detailed prompt content from `plans/manual/01-06/prompt.md` into the AI chat, one step at a time.
```

- [ ] **Step 3: Add missing ⏸️ pause at the end of Step 3 (Decomposition)**

Find:
```
**Output:** List of Modules/Sub-modules + Dependencies.

---

### Step 4:
```
Replace with:
```
**Output:** List of Modules/Sub-modules + Dependencies.

> ⏸️ **STOP — Wait for user to review and confirm the module breakdown before proceeding to Step 4.** If the user has not yet responded, re-state the pause prompt and wait. Under no circumstances advance to Step 4 without explicit user confirmation.

---

### Step 4:
```

- [ ] **Step 4: Add "Critical" priority to FULL RBT Step 5**

Find (in Step 5 section):
```
   - **High Risk:** Test thoroughly, many cases (critical business logic, financial, security)
   - **Medium Risk:** Moderate testing
   - **Low Risk:** Basic testing, happy path only
```
Replace with (no change to this block, it's Risk Level not Priority — skip this if that's the only occurrence. Look for the Priority field definition in Step 5):

Find:
```
   - Priority
```
(The line that just says `   - Priority` in the test case fields list under Step 5)
Replace with:
```
   - Priority (Critical / High / Medium / Low)
```

- [ ] **Step 5: Standardize TC table column order**

In **Mode QUICK** Output Table section, find:
```
| TC ID | Module | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Priority |
```
Replace with:
```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |
```

In **FULL RBT Step 6** output table, find:
```
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
```
Replace with:
```
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |
```

- [ ] **Step 6: Verify changes**

Read the SKILL.md and confirm:
- Prompt Templates section no longer has the contradictory line
- All prompt file references use `.md` extension
- Step 3 ends with the ⏸️ STOP block before Step 4 heading
- Step 5 Priority field shows all 4 levels
- Both TC table headers have `Expected Result | Test Data | Priority` in that order at the end

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/rbt-manual-testing/SKILL.md
git commit -m "fix: resolve SKILL.md contradictions, add Step 3 pause, standardize columns and priority"
```

---

## Task 3: Add Enforcement Language and Quality Guards to SKILL.md

**Files:**
- Modify: `.claude/skills/rbt-manual-testing/SKILL.md`

**What to add in this task:**
- Enforcement guards at Steps 2 and 4 checkpoints (Step 3 already done in Task 2)
- Mode-routing guard for QUICK mode ambiguity detection
- QUICK mode artifact export instruction
- Step 5 self-check list before proceeding to Step 6

- [ ] **Step 1: Strengthen the Step 2 checkpoint**

Find (at the end of Step 2 description):
```
4. **STOP — Wait for user responses** to the questions before continuing

**Output:** List of flows + Ambiguities + Q&A questions.
```
Replace with:
```
4. **STOP — Wait for user responses** to the questions before continuing. If the user has not yet responded, re-state the list of open questions and wait. Do not advance to Step 3 without explicit user answers or stated assumptions.

**Output:** List of flows + Ambiguities + Q&A questions.
```

- [ ] **Step 2: Strengthen the Step 4 checkpoint**

Find (at the end of Step 4 description):
```
4. **Wait for user review** of the scenario list before generating detailed test cases

**Output:** Traceability Matrix + High-Level Test Scenarios.
```
Replace with:
```
4. **Wait for user review** of the scenario list before generating detailed test cases. If the user has not yet responded, re-display the scenario table and wait. Do not advance to Step 5 without explicit user confirmation or additions.

**Output:** Traceability Matrix + High-Level Test Scenarios.
```

- [ ] **Step 3: Add mode-routing guard to QUICK mode**

Find (in Mode QUICK, after the process steps list, before the Output Table section):
```
## Output Table

```
(i.e., find the line immediately before the Output Table header in QUICK mode)

Replace with:
```
> **Mid-generation ambiguity guard:** If at any point during QUICK mode generation you detect ambiguity in the requirements that cannot be resolved by a stated assumption, STOP immediately. Notify the user with: "Ambiguity detected: [describe it]. Options: (a) I assume [X] and continue QUICK mode, or (b) switch to FULL RBT for proper analysis. Which do you prefer?" Do not continue until the user responds.

## Output Table

```

- [ ] **Step 4: Add artifact export to QUICK mode**

Find (at the very end of the Mode QUICK section, just before `# Mode 2`):
```
## Anti-Patterns (Mode QUICK)
```
Replace with:
```
## Output Format

Export the final Markdown table as an **Artifact** file named `test_cases_<module>.md` so the user can save or copy it directly into Excel/Jira/TestRail.

## Anti-Patterns (Mode QUICK)
```

- [ ] **Step 5: Add Step 5 self-check list before Step 6**

Find (at the end of Step 5 description, the last paragraph before `---` separator before Step 6):
```
6. If there are too many scenarios → generate module by module, ask the user before continuing

**Output:** Detailed Test Cases list with Risk Level.

---

### Step 6:
```
Replace with:
```
6. If there are more than 3 modules → generate one module at a time, ask the user before continuing to the next module

**Self-Check before proceeding to Step 6:** Review your output against this checklist. Fix any gaps before continuing:
- [ ] No test data is generic or uses placeholders (every value is specific)
- [ ] Every `Text` and `Textarea` field has at minimum one XSS TC (`<script>alert(1)</script>`) and one SQL injection TC (`' OR 1=1--`)
- [ ] Every input field has its own validation TCs — none are merged across fields
- [ ] Negative and boundary cases exist for every field with defined constraints
- [ ] Priority is set for every TC using: Critical / High / Medium / Low

**Output:** Detailed Test Cases list with Risk Level.

---

### Step 6:
```

- [ ] **Step 6: Verify**

Read the SKILL.md and confirm:
- Step 2 checkpoint includes "re-state the list of open questions and wait"
- Step 4 checkpoint includes "re-display the scenario table and wait"
- QUICK mode has the mid-generation ambiguity guard block
- QUICK mode has an Output Format section with artifact export before Anti-Patterns
- Step 5 ends with the 5-item self-check list before the Step 6 heading

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/rbt-manual-testing/SKILL.md
git commit -m "feat: add enforcement guards, ambiguity routing, QUICK artifact export, Step 5 self-check to SKILL.md"
```

---

## Task 4: Improve requirements-analyzer SKILL.md

**Files:**
- Modify: `.claude/skills/requirements-analyzer/SKILL.md`

- [ ] **Step 1: Add Section 3.5 — Business/User Flows**

Find:
```
### 3.4. Business Rules & Validations
List in detail the expected Validation Messages when a user enters incorrect data.

## 4. Strict Rules
```
Replace with:
```
### 3.4. Business Rules & Validations
List in detail the expected Validation Messages when a user enters incorrect data.

### 3.5. Business/User Flows
Document the step-by-step flow for each core function. Format:

```
Flow: [Flow Name]
  Actor: [User role]
  1. Actor performs [action]
  2. System responds with [response / state change]
  3. (continue until flow ends or branches)
  Branch: [condition] → [alternate outcome]
```

List at minimum: the primary Happy Path flow and any visible alternate/exception paths.

### 3.6. Non-Functional Requirements *(if observable)*
Structure observations under these categories:
- **Compatibility:** Browsers/devices specified or observable in the UI
- **Performance:** Page load expectations, response time indicators (loading spinners, progress bars)
- **Accessibility:** Keyboard navigation, ARIA labels, color contrast (if observable)

If a category has no observable evidence, write: `[Not observed — clarify with PO if relevant]`

## 4. Strict Rules
```

- [ ] **Step 2: Add Section 5 — Playwright Fallback**

Find:
```
## 4. Strict Rules
- Always write in **English**.
- Do not infer complex business requirements without evidence from the UI. If logic is missing, list them under "Questions/Clarifications for PO-User".
- If Playwright MCP is available, prefer opening a real browser to screenshot/capture the interface when needed.
```
Replace with:
```
## 4. Strict Rules
- Always write in **English**.
- Do not infer complex business requirements without evidence from the UI. If logic is missing, list them under "Questions/Clarifications for PO-User".
- If Playwright MCP is available, prefer opening a real browser to screenshot/capture the interface when needed.

## 5. Playwright Fallback
If Playwright MCP is unavailable, analyze based on the provided URL, screenshots, or pasted HTML/DOM content.

For every section you could not directly verify in a live browser, append the tag:
`[UNVERIFIED — based on static analysis only]`

This makes it clear to the reader which parts of the document may need live verification before test case generation begins.

## 6. Definition of Done
A Requirements document is complete when ALL of the following are true:
- [ ] Sections 3.1 through 3.6 are present (or explicitly marked `[Not applicable]`)
- [ ] Every input field in Section 3.3 has: Field Name, Type, Required/Optional, and at least one Validation Rule
- [ ] No field is listed without its data constraints (length, format, allowed values)
- [ ] All unverifiable content is tagged with `[UNVERIFIED — based on static analysis only]`
- [ ] Section 3.4 lists at least one validation message per required field
```

- [ ] **Step 3: Verify**

Read the file and confirm:
- Section 3.5 (Business/User Flows) is present with the flow format template
- Section 3.6 (Non-Functional Requirements) is present with 3 sub-categories
- Section 5 (Playwright Fallback) is present with the `[UNVERIFIED]` tagging instruction
- Section 6 (Definition of Done) is present with 4-item checklist

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/requirements-analyzer/SKILL.md
git commit -m "feat: add flows, non-functional, Playwright fallback, and Definition of Done to requirements-analyzer"
```

---

## Task 5: Fix and Improve All 6 Manual Plan Files

**Files:**
- Modify: `.claude/plans/manual/01_context_and_roleplay/prompt.md`
- Modify: `.claude/plans/manual/02_analysis_and_qna/prompt.md`
- Modify: `.claude/plans/manual/03_decomposition/prompt.md`
- Modify: `.claude/plans/manual/04_traceability/prompt.md`
- Modify: `.claude/plans/manual/05_rbt_and_tc_generation/prompt.md`
- Modify: `.claude/plans/manual/06_template_mapping/prompt.md`

- [ ] **Step 1: Add `---END---` and footer to Step 1 (Context & Role-play)**

In `01_context_and_roleplay/prompt.md`, find the last line:
```
Please read all documents carefully and reply **"I have understood the context and am ready"** along with a brief Summary of the testing scope before we move on to Step 2.
```
Replace with:
```
Please read all documents carefully and reply **"I have understood the context and am ready"** along with a brief Summary of the testing scope before we move on to Step 2.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 1 (Context & Role-Play)
```

- [ ] **Step 2: Add `---END---` and footer to Step 2 (Analysis & Q&A)**

In `02_analysis_and_qna/prompt.md`, find the last line:
```
⏸️ **AFTER COMPLETING**, pause and wait for my answers to the questions before proceeding to Step 3.
```
Replace with:
```
⏸️ **AFTER COMPLETING**, pause and wait for my answers to the questions before proceeding to Step 3.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 2 (Analysis & Q&A)
```

- [ ] **Step 3: Add ⏸️ pause, `---END---`, and footer to Step 3 (Decomposition)**

In `03_decomposition/prompt.md`, find the last line:
```
Present the results in **Markdown**, using tables or a tree diagram as appropriate.
```
Replace with:
```
Present the results in **Markdown**, using tables or a tree diagram as appropriate.

⏸️ **AFTER COMPLETING**, pause and wait for me to review the module breakdown before proceeding to Step 4.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 3 (Decomposition)
```

- [ ] **Step 4: Add `---END---` and footer to Step 4 (Traceability)**

In `04_traceability/prompt.md`, find the last line:
```
> ⚠️ **This is a Human Checkpoint.** The tester must perform their own Risk Assessment for each Module before allowing the AI to generate detailed scenarios.
```
Replace with:
```
> ⚠️ **This is a Human Checkpoint.** The tester must perform their own Risk Assessment for each Module before allowing the AI to generate detailed scenarios.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 4 (Traceability)
```

- [ ] **Step 5: Fix threshold and add `---END---` + footer to Step 5 (TC Generation)**

In `05_rbt_and_tc_generation/prompt.md`, find:
```
> 💡 **Note:** If the number of scenarios from Step 4 is large, generate Test Cases **one Module at a time**.
> Example: "Generate TCs for Module 1 and Module 2 first. I will request the remaining modules next."
```
Replace with:
```
> 💡 **Note:** If there are more than **3 modules**, generate Test Cases **one Module at a time** and ask before continuing to the next module.
> Example: "I will generate TCs for Module 1 now. Please confirm to continue with Module 2."

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 5 (RBT & TC Generation)
```

- [ ] **Step 6: Add `---END---` and footer to Step 6 (Template Mapping)**

In `06_template_mapping/prompt.md`, find the last line:
```
If the total number of Test Cases exceeds 30, split the artifact into multiple parts and ask me "Continue with Part X?" before generating the next part.
```
Replace with:
```
If the total number of Test Cases exceeds 30, split the artifact into multiple parts and ask me "Continue with Part X?" before generating the next part.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 6 (Template Mapping)
```

- [ ] **Step 7: Verify all 6 plan files**

Read each file and confirm:
- Step 1: has `---END---` and footer at the bottom
- Step 2: has `---END---` and footer at the bottom (⏸️ was already there)
- Step 3: has the new ⏸️ pause line, then `---END---`, then footer
- Step 4: has `---END---` and footer at the bottom
- Step 5: "more than **3 modules**" wording is present; has `---END---` and footer
- Step 6: has `---END---` and footer at the bottom

- [ ] **Step 8: Commit**

```bash
git add .claude/plans/manual/01_context_and_roleplay/prompt.md
git add .claude/plans/manual/02_analysis_and_qna/prompt.md
git add .claude/plans/manual/03_decomposition/prompt.md
git add .claude/plans/manual/04_traceability/prompt.md
git add .claude/plans/manual/05_rbt_and_tc_generation/prompt.md
git add .claude/plans/manual/06_template_mapping/prompt.md
git commit -m "fix: add END markers, missing Step 3 pause, fix Step 5 threshold, add version footers to all plan files"
```

---

## Task 6: Fill rules/manual_rules.md

**Files:**
- Rewrite: `.claude/rules/manual_rules.md`

- [ ] **Step 1: Replace the empty file with universal QA rules**

Overwrite `.claude/rules/manual_rules.md` with:

```markdown
# Universal QA Rules

These rules apply across all modes (QUICK, FULL RBT) and all usage flows (Claude Code, copy-paste).
Both `rbt-manual-testing` SKILL.md and the Manual Plans reference these as the single source of truth.

---

## Rule 1 — Test Data Must Be Specific

All test data must use concrete, specific values. Generic descriptions are forbidden.

| ❌ Wrong | ✅ Correct |
|---|---|
| "Enter a valid email" | `test_customer_01@domain.com` |
| "Enter a valid ID" | `KH-2026-0012` |
| "Enter an invalid phone number" | `abc123xyz` (letters instead of digits) |
| "Enter a name that is too long" | 256 consecutive `A` characters (max is 255) |

---

## Rule 2 — Security Validation Is Mandatory for Text Fields

Every `Text` and `Textarea` input field must include **at minimum** these two test cases:

- **XSS:** Enter `<script>alert(1)</script>` → verify script is not executed, value is escaped or rejected
- **SQL Injection:** Enter `' OR 1=1--` → verify input is sanitized, no DB error exposed

These are not optional. They apply to every text/textarea field regardless of Risk Level.

---

## Rule 3 — Coverage Is Never Happy Path Only

Every module must have test cases in all four categories:

| Category | Description |
|---|---|
| **Happy Path** | Main flow runs end-to-end successfully |
| **Negative Path** | Invalid input, missing required data, wrong format |
| **Boundary Values** | Values at min, min+1, max-1, max, min-1, max+1 |
| **Edge Cases** | Timeout, lost connection, concurrent access, empty state |

A test suite with only Happy Path cases is incomplete.

---

## Rule 4 — Priority Scale

Use exactly four levels, applied consistently across all test cases:

| Level | Definition |
|---|---|
| **Critical** | System crash, data loss, security breach, or blocks all users from core functionality |
| **High** | Core business flow broken, major feature unusable, no workaround |
| **Medium** | Feature works but degraded; workaround exists |
| **Low** | Minor cosmetic or UI issue; no functional impact |

---

## Rule 5 — TC ID Format

Format: `[PROJECT]_[MODULE]_TC_[NNN]`

- `[PROJECT]`: Short project code agreed with the team (e.g., `CRM`, `HRM`, `ERP`)
- `[MODULE]`: Short module code (e.g., `CUST`, `LOGIN`, `INV`)
- `[NNN]`: Zero-padded 3-digit sequence, starting at `001`, no gaps

Examples: `CRM_CUST_TC_001`, `CRM_CUST_TC_002`, `HRM_LOGIN_TC_001`

If the user specifies a different format at the start of a session, use that format instead.

---

## Rule 6 — Split Thresholds

To keep output readable and reviewable:

| Trigger | Action |
|---|---|
| More than **3 modules** in one generation | Generate one module at a time. Ask user before continuing to the next. |
| More than **30 test cases** in one output | Split into Part 1, Part 2, etc. Ask user "Continue with Part 2?" before generating. |

Never silently truncate or omit test cases. If splitting, state explicitly: "This is Part 1 of N."
```

- [ ] **Step 2: Verify**

Read `.claude/rules/manual_rules.md` and confirm all 6 rules are present with correct content.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/manual_rules.md
git commit -m "feat: fill manual_rules.md with universal QA rules (test data, security, coverage, priority, TC ID, split thresholds)"
```

---

## Final Verification

- [ ] Run `git log --oneline -10` and confirm 6 commits are present for this work
- [x] Stale branding removed — all script packages and specs now use Claude / project-aligned names
- [ ] Run `grep -r "rbt_manual_testing\|requirements_analyzer" .claude/workflows/` and confirm zero results (all underscores replaced with hyphens)
- [ ] Run `grep -r "prompt\.txt" .claude/skills/` and confirm zero results
- [ ] Read `.claude/skills/rbt-manual-testing/SKILL.md` Step 3 section and confirm ⏸️ STOP block is present
- [ ] Read `.claude/plans/manual/03_decomposition/prompt.md` and confirm ⏸️ pause and `---END---` are present
