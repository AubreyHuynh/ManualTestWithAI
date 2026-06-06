---
description: Generate high-quality manual test cases following the 6-step AI-RBT (Risk-Based Testing) process from requirements.
skills:
  - rbt_manual_testing
  - requirements_analyzer
---

> **MANDATORY SKILL:** You MUST load and carefully read the content of the **`rbt_manual_testing`** skill (at `.agent/skills/rbt_manual_testing/SKILL.md`) before starting this task. Use the **FULL RBT Mode** of the skill. Also refer to the **`requirements_analyzer`** skill to understand how to analyze interfaces if needed.

# Workflow: Generate Manual Test Cases via AI-RBT Framework (FULL RBT Mode)

This workflow uses the **FULL RBT Mode** of the `rbt_manual_testing` skill — the **AI-RBT (AI-Driven Risk-Based Testing)** process consisting of 6 sequential steps to generate manual test cases from requirements documents.

> [!NOTE]
> **This flow is for Antigravity (slash command).** The agent follows the instructions in the skill and does NOT need to read the prompt.txt file.
> If the QA team wants to use a more detailed prompt (ChatGPT/Claude), copy-paste each step from `plans/manual/01-06/prompt.txt`.

## ⚠️ Execution Principles

- **Mode:** FULL RBT (6 sequential steps)
- **MUST run sequentially** step by step, do NOT combine multiple steps
- **MUST pause** and wait for user response at Step 2 (Q&A) and Step 4 (Review Scenarios)
- If the user has not provided requirements, ask the user to provide them before starting
- All output in **English**

## Steps to Execute

Follow the detailed instructions in the `rbt_manual_testing` skill → **Mode 2: FULL RBT** section.

### Step 1: Context Initialization (Context & Role-play)
1. Ask the user to provide: project name, system description, MVP goals, requirements documents
2. Read the documents carefully, confirm understanding of the context
3. **Wait for user confirmation** → proceed to Step 2

### Step 2: Requirements Analysis (Analysis & Q&A)
1. Identify Happy Path, Alternate Paths, Exception Paths
2. Detect Ambiguities (gaps, contradictions, unclear points)
3. Ask numbered Q&A questions (Q1, Q2...) for user/PO/BA, with context + assumption
4. **STOP — Wait for user to answer questions** → proceed to Step 3

### Step 3: System Decomposition (Decomposition)
1. Break the feature into Modules / Sub-modules
2. Describe the function of each Module + Dependencies between them

### Step 4: Coverage Assurance (Traceability)
1. Map Module → Requirement codes (REQ-01, REQ-02...)
2. Cross-check gaps (Gap Analysis), list High-Level Scenarios
3. **Wait for user review** of scenarios → proceed to Step 5

### Step 5: Generate Detailed Test Cases (RBT & TC Generation)
1. Assess Risk Level (High/Medium/Low) for each Module
2. Generate complete test cases: Title, Pre-condition, Steps, Expected, Test Data, Priority
3. Apply techniques: EP, BVA, Decision Table, State Transition
4. **Specialized Field-Level Validation:**
   - List all input fields on the form/UI being tested
   - Generate validation TCs **separately for EACH field** based on its specific characteristics
   - Reference the **Field-Level Validation Table** in the `rbt_manual_testing` skill
   - **DO NOT** combine validation for multiple fields into 1 TC
5. Full coverage: Happy Path, Negative, Boundary, Edge Cases
6. Test Data must be specific (no generic placeholders)
7. If too many → generate per Module, ask user to continue

### Step 6: Format Standardization (Template Mapping)
1. Package all test cases into a standard Markdown table:
   `| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |`
2. No test cases may be omitted
3. Export as Artifact if lengthy

## Output

- Complete Markdown Test Cases table, ready to copy to Excel/Jira/TestRail
- Traceability Matrix
- List of resolved Ambiguities