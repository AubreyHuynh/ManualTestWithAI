---
description: Generate manual test cases quickly from requirements (QUICK mode — no 6-step process).
skills:
  - rbt_manual_testing
---

# Workflow: Generate Manual Test Cases Quickly from Requirements

> **MANDATORY SKILL:** You MUST load and carefully read the **`rbt_manual_testing`** skill before starting this task. Use the skill's **QUICK mode**.

This workflow uses the **QUICK mode** of the `rbt_manual_testing` skill to generate test cases rapidly from existing requirements.

## Principles

- **Mode:** QUICK (single pass, no mid-task user prompts)
- Suitable for simple modules with clear requirements
- If requirements are found to be overly complex or ambiguous → **automatically switch to FULL RBT** and notify the user

## Steps

1. **Read and understand** the requirements provided by the user.
2. **Identify the main test paths:** Happy Path, Negative Path, Boundary Cases, Edge Cases.
3. **Apply test design techniques automatically:**
   - Equivalence Partitioning (EP)
   - Boundary Value Analysis (BVA)
   - Decision Table (when multiple rules exist)
   - State Transition (when a workflow/state machine exists)
4. **Field-Level Validation** — for each input field on the form/UI:
   - List every input field individually.
   - Generate validation test cases **per field** based on its type (text, email, phone, date, number, dropdown, file upload, password, etc.).
   - Apply the **Field-Level Validation Table** from the `rbt_manual_testing` skill to select appropriate validations.
   - **Do NOT** combine validations for multiple fields into a single test case.
5. **Generate test cases with all required fields:**
   - TC ID (format: `[PROJECT]_[MODULE]_TC_[NUMBER]`)
   - Module
   - Test Scenario / Test Case Title
   - Pre-conditions
   - Test Steps (numbered)
   - Expected Results (numbered, matching steps)
   - Test Data (**must be specific**, no placeholders)
   - Priority (Critical / High / Medium / Low)
6. **Output a standard Markdown table.**

## Output Table Format

```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

## Important Rules

- Test Data must be specific: `test_login_01@domain.com`, not "a valid email".
- Must cover Positive, Negative, Boundary, and Edge cases.
- Each input field must have its own validation test cases (do not merge multiple fields into one TC).
- TC ID follows the format agreed upon by the user, or defaults to `[PROJECT]_[MODULE]_TC_[NUMBER]`.
- If the total number of TCs is large → split into Part 1, Part 2, and confirm with the user before continuing.

## When to Switch to FULL RBT

The agent **automatically proposes switching mode** if any of the following are detected:

- Ambiguous requirements that require Q&A clarification
- Large scope (more than 3 modules)
- Complex business logic with many overlapping conditions
- User requests a Traceability Matrix or Risk Assessment
