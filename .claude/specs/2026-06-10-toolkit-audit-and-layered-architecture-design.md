# Design: QA Toolkit Audit & Layered Architecture Improvement

**Date:** 2026-06-10
**Status:** Approved

## Goal

Audit and improve the Manual Test with AI toolkit across all layers — Skills, Workflows, and Manual Plans. Fix all logic errors, broken references, and inconsistencies. Establish a clean layered architecture where each file serves a clear, non-overlapping purpose.

## Problem Summary

Five categories of issues found during audit:

1. **Stale branding** — "Claude" / project-aligned names not used consistently across scripts and specs
2. **Broken references** — Wrong paths, wrong file extensions, wrong skill names (underscores vs hyphens)
3. **Logic errors** — Missing pause at Step 3, contradictory instructions, inconsistent Priority levels, mismatched TC column order
4. **Omissions** — Empty rules file, missing sections in requirements-analyzer skill, no artifact export in QUICK mode, vague thresholds
5. **Sync drift** — Manual Plans are significantly more detailed than SKILL.md Step 5; no mechanism to detect drift

## Architecture Principle (Option C: Layered)

```
Layer 1 — SKILL.md (Claude Code)
  Authoritative. Enforcement-first. Guards at every checkpoint.
  AI reads this to know HOW to behave.

Layer 2 — Workflow files (Claude Code)
  Entry points. Point to the correct skill with the correct path.
  No logic duplication — they delegate to SKILL.md.

Layer 3 — Manual Plans (Copy-paste / non-Claude-Code)
  Standalone. Self-contained. Detailed enough to work without SKILL.md.
  Structural mirror of SKILL.md steps — not a copy, but aligned.

Layer 4 — rules/manual_rules.md
  Universal cross-layer QA rules. Single truth for constants
  (TC ID format, Priority scale, split thresholds).
  Both SKILL.md and Plans reference this, reducing future drift.
```

---

## Section 1 — Cleanup (Stale Branding + Broken References)

### Files to change

| File | Change |
|---|---|
| `.claude/skills/rbt-manual-testing/SKILL.md` | Fix prompt path extension: `.txt` → `.md` (2 occurrences) |
| `.claude/skills/rbt-manual-testing/SKILL.md` | Remove contradictory line "agent should read prompt templates before each step" — keep only the NOTE clarifying Claude Code flow does NOT need to read prompt files |
| `.claude/workflows/01_generate_manual_testcases_rbt.md` | Fix skill path: `.agent/skills/rbt_manual_testing/SKILL.md` → `.claude/skills/rbt-manual-testing/SKILL.md` |
| `.claude/workflows/01_...` + `02_...` + `03_...` | Fix frontmatter skill names: `rbt_manual_testing` → `rbt-manual-testing` |
| `.claude/workflows/02_generate_requirements_from_website.md` | Add missing skill path for `requirements-analyzer` |
| `CLAUDE.md` | Commit pending changes (already staged) |

---

## Section 2 — SKILL.md (rbt-manual-testing) Fixes + Enforcement

### Logic fixes

- **Step 3 missing pause:** Add explicit checkpoint — `⏸️ STOP — Wait for user to review and confirm the module breakdown before proceeding to Step 4.`
- **Priority inconsistency:** Standardize to 4 levels across both modes: `Critical / High / Medium / Low`. Add "Critical" to FULL RBT Step 5 definition.
- **TC table column order:** Align both modes to the same canonical order:
  - QUICK: `| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |`
  - FULL RBT Step 6: `| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |`
  - Rule: Test Data and Expected Result always appear together in the same order.

### Enforcement language (Problem A — AI skips steps)

At each checkpoint (Steps 2, 3, 4) add:
> "If the user has not yet responded, re-state the pause prompt and wait. Under no circumstances should you advance to the next step without explicit user confirmation."

Add mode-routing guard in QUICK mode:
> "If ambiguity is detected mid-generation, STOP immediately, notify the user of the specific ambiguity, and ask whether to: (a) make a stated assumption and continue QUICK, or (b) switch to FULL RBT."

### Quality improvements (Problem B — inconsistent output)

- Add a self-check list at the end of Step 5 (FULL RBT), to be completed before outputting to Step 6:
  - [ ] No test data is generic or uses placeholders
  - [ ] Every text/textarea field has XSS and SQL injection TCs
  - [ ] Every form field has its own validation TC (not merged)
  - [ ] Negative and boundary cases exist for every field
- QUICK mode: Add artifact export instruction matching FULL RBT Step 6.

---

## Section 3 — Manual Plans Fixes + Structure

### Bug fixes

| File | Fix |
|---|---|
| `03_decomposition/prompt.md` | Add `⏸️` pause at the bottom: "Wait for me to review the module breakdown before proceeding." |
| `05_rbt_and_tc_generation/prompt.md` | Replace "if too many scenarios" with: "If there are more than 3 modules, generate one module at a time and ask before continuing." |
| All 6 steps | Add `---END---` closing marker after each prompt body |

### Structural improvements (Problem D — sync drift)

- Each plan file gets a version footer:
  ```
  > Mirrors: rbt-manual-testing SKILL.md — Step [N]
  ```
- Thresholds aligned across steps:
  - Step 5: "3+ modules → split, ask before continuing"
  - Step 6: ">30 TCs → split into parts, ask before continuing"

Plans remain fully self-contained for copy-paste use. No content reduction.

---

## Section 4 — requirements-analyzer SKILL.md

### Missing sections to add

**Section 3.5 — Business/User Flows**
Step-by-step flows for each core function. Format:
```
Flow: [Flow Name]
  1. Actor performs [action]
  2. System responds with [response]
  3. ...
```

**Section 3.6 — Non-Functional Requirements**
Structure:
- Compatibility: browsers/devices observed or specified
- Performance: page load, response time observations
- Accessibility: keyboard navigation, ARIA labels (if observable)

**Section 5 — Playwright Fallback**
> "If Playwright MCP is unavailable: analyze based on provided URL, screenshots, or pasted HTML. Note each section that could not be directly verified with: `[UNVERIFIED — based on static analysis only]`."

### Quality improvement

Add a "Definition of Done" checklist:
- [ ] Sections 3.1–3.6 are all present
- [ ] Every input field has a validation rule entry
- [ ] No field listed without type, required status, and constraints
- [ ] All unverifiable items are flagged with `[UNVERIFIED]`

---

## Section 5 — rules/manual_rules.md (currently empty)

Fill with universal cross-layer constants:

1. **Test Data rule** — All test data must be specific. No placeholders.
2. **Security validation rule** — Every text/textarea field must include at minimum: XSS (`<script>alert(1)</script>`) and SQL injection (`' OR 1=1--`) test cases.
3. **Coverage rule** — Happy Path alone is never sufficient. Negative and Boundary cases are mandatory for every field.
4. **Priority scale** — Four levels, defined:
   - **Critical** — System crashes, data loss, security breach, blocks all users
   - **High** — Core business flow broken, major feature unusable
   - **Medium** — Feature works but degraded; workaround exists
   - **Low** — Minor UI/cosmetic issue, no functional impact
5. **TC ID format** — `[PROJECT]_[MODULE]_TC_[NNN]` (zero-padded 3 digits). Example: `CRM_CUST_TC_001`
6. **Split thresholds** —
   - More than 3 modules in one generation → generate per module, ask before continuing
   - More than 30 TCs in one output → split into Part 1 / Part 2 / ..., ask before continuing

---

## Files Changed Summary

| File | Type of Change |
|---|---|
| `.claude/skills/rbt-manual-testing/SKILL.md` | Fix refs, fix logic, add enforcement, add self-check, standardize columns/priority |
| `.claude/skills/requirements-analyzer/SKILL.md` | Add sections 3.5, 3.6, 5; add Definition of Done |
| `.claude/workflows/01_generate_manual_testcases_rbt.md` | Fix skill path and frontmatter |
| `.claude/workflows/02_generate_requirements_from_website.md` | Fix frontmatter, add skill path |
| `.claude/workflows/03_generate_testcases_from_requirements.md` | Fix frontmatter |
| `.claude/plans/manual/03_decomposition/prompt.md` | Add missing ⏸️ pause |
| `.claude/plans/manual/05_rbt_and_tc_generation/prompt.md` | Fix vague threshold |
| `.claude/plans/manual/01–06/prompt.md` (all) | Add `---END---` markers, add version footer |
| `.claude/rules/manual_rules.md` | Fill with universal QA rules |
| `CLAUDE.md` | Commit pending staged changes |

## Out of Scope

- Automation test code
- Adding new test design techniques not already in the skill
- Changing the 6-step FULL RBT process structure itself
