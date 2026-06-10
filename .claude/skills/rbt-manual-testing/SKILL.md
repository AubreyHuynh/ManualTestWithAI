---
name: rbt-manual-testing
description: Skill for generating manual test cases with 2 modes — QUICK (fast generation from requirements) and FULL RBT (6-step AI-RBT process with risk assessment). Master skill for all manual test case tasks.
---

# RBT Manual Testing

## Description

This is the **Master Skill** for all manual test case generation tasks. The skill provides **2 operating modes** to suit every scale of requirements:

| Mode | When to Use | Time |
|------|-------------|------|
| **QUICK** | Simple module, need TCs fast, clear requirements | 1 pass (no waiting for user) |
| **FULL RBT** | Complex module, needs risk analysis, large system | 6 sequential steps (with checkpoints) |

**Core Principles:**
- **Human Strategy:** Humans define the strategy, risk level, and quality standards
- **AI Execution:** AI performs analysis, writes TCs, and reviews for gaps
- **Human Verification:** Humans review results before finalizing

---

## When to Use

Use this skill when:

- Generating manual test cases from requirements / user stories
- Analyzing requirements to detect ambiguities
- Decomposing a system into modules / features
- Building a traceability matrix
- Applying Risk-Based Testing (risk assessment for test cases)
- Standardizing test cases into a Markdown table (Jira/Excel format)
- Quickly generating test cases from simple requirements

**DO NOT** use this skill when:

- Automation code is needed → use `qa_automation_engineer`
- DOM inspection / locator generation is needed → use `ui_debug_agent` / `smart_locator_agent`
- Only test data generation is needed → use `test_data_generator`

---

## Mode Routing — How to Choose a Mode

The agent automatically selects a mode based on **trigger keywords** and **context**:

### → Mode QUICK

Activate when:
- User uses workflow `/generate_testcases_from_requirements`
- User says: "generate test cases quickly", "create TCs from this requirement", "write test cases for form..."
- Requirements are already clear, small scope (1 module / 1 feature)
- User does not request risk analysis or a formal process

### → Mode FULL RBT

Activate when:
- User uses workflow `/generate_manual_testcases_rbt`
- User says: "6-step process", "RBT analysis", "generate full test cases", "generate a comprehensive TC suite"
- Large scope (multiple modules, complex system)
- User requests a Traceability Matrix or Risk Level assessment
- Requirements are unclear and need Ambiguity analysis

### → When Unclear

If the mode cannot be determined, the agent **asks the user**:
```
Which mode would you like to use for generating test cases?
1. QUICK — Fast generation from requirements (no analysis steps)
2. FULL RBT — Full 6-step process (analysis → decomposition → RBT → TC generation)
```

---

# Mode 1: QUICK — Fast Test Case Generation

## Purpose

Generate test cases **quickly, with sufficient quality** from clear requirements/user stories, suitable for simple modules or when results are needed immediately.

## Process (single pass)

**The agent must:**

1. **Read and understand** the provided requirements
2. **Identify the main flows:**
   - Happy Path (main flow)
   - Negative Path (wrong or missing data)
   - Boundary Cases (boundary values)
3. **Automatically apply test case design techniques:**
   - **Equivalence Partitioning (EP):** Divide inputs into equivalent groups
   - **Boundary Value Analysis (BVA):** Test values at boundaries
   - **Decision Table:** List condition combinations (when multiple rules exist)
   - **State Transition:** Test state transitions (when a workflow is involved)
4. **Specialized Field-Level Validation:**
   - List **all input fields** on the form/UI
   - Generate validation test cases **separately for EACH field** based on its specific characteristics
   - Apply the validation checklist by field type (see Field-Level Validation table below)
   - **DO NOT** combine validation for multiple fields into one test case
5. **Generate test cases** with all required fields:
   - TC ID (format: `[PROJECT]_[MODULE]_TC_[NUMBER]`)
   - Module
   - Test Case Title / Test Scenario
   - Pre-conditions
   - Test Steps (numbered)
   - Expected Results (numbered to match steps)
   - Test Data (**must be specific**, no placeholders)
   - Priority (Critical / High / Medium / Low)
6. **Output a standard Markdown table**, ready to copy into Excel/Jira

## Output Table

```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |
```

## Test Data Rules (applies to both modes)

```
❌ Wrong: "Enter a valid customer code"
✅ Correct: "Enter code: KH-2026-0012"

❌ Wrong: "Enter a valid email"
✅ Correct: "Enter email: test_customer_01@domain.com"

❌ Wrong: "Enter a value exceeding the limit"
✅ Correct: "Enter 256 characters into the Name field (max: 255)"
```

## Field-Level Validation Table (applies to both modes)

When a form/UI contains input fields, the agent **MUST** list each field and generate separate validation TCs by type:

| Field Type | Validations to Test |
|---|---|
| **Text (Name, Address...)** | Required/Optional · Min length · Max length · Whitespace-only · Special characters (`<>&"'`) · XSS injection (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Valid format (`user@domain.com`) · Missing `@` · Missing domain · Invalid domain · Multiple `@` · Special chars before `@` · Max length · Case sensitivity · Already existing email (if unique) |
| **Phone** | Numbers only · Valid prefix (e.g. `+84`, `0`) · Min/Max length · Mixed letters · Dashes, dots, spaces · Invalid area code |
| **Date / DateTime** | Correct format (dd/MM/yyyy, ISO...) · Non-existent date (`31/02`, `30/02`) · Leap year (`29/02/2024`) · Past / future dates (per business rules) · Min/max date values · Timezone (if applicable) |
| **Number / Currency** | Min/Max value · Negative numbers · Zero · Decimals · Non-numeric characters · Overflow (extremely large numbers) · Leading zeros · Currency formatting (commas, periods) |
| **Dropdown / Select** | Default value · All valid options · Disabled options · Changing selection · Required validation (nothing selected) |
| **Checkbox / Radio** | Default state · Check/Uncheck · Required validation · Radio group (only one selectable) |
| **File Upload** | Valid/invalid file type · Max file size · Empty file (0 KB) · Filename with special characters · Multiple files (if allowed) · Drag-and-drop vs browse button |
| **Password** | Min/Max length · Special character requirement · Uppercase/lowercase requirement · Number requirement · Copy-paste blocked? · Show/hide password · Confirm password match/mismatch |
| **Textarea** | Max length · Line breaks · HTML tags · Resize (if UI allows) · Character counter (if present) |

> **Principle:** Each field has its own characteristics → its own validation. The agent MUST analyze each field before generating TCs. Do not apply one generic validation set to all fields.

## Anti-Patterns (Mode QUICK)

- ❌ Generic / placeholder test data
- ❌ Happy Path only — missing Negative/Boundary cases
- ❌ Ignoring validation rules in requirements
- ❌ Vague test steps ("enter data" → must specify what to enter and where)
- ❌ Combining validation for multiple fields into one TC → each field needs its own validation TC
- ❌ Using one generic validation set for all fields (each field type has its own checklist)
- ❌ Skipping security validation (XSS, SQL injection) for text fields

---

# Mode 2: FULL RBT — 6-Step AI-RBT Process

## Purpose

A formal, sequential process for complex modules. Includes Ambiguity analysis, system decomposition, Traceability Matrix, Risk Level assessment, and detailed test case generation.

> ⚠️ **IMPORTANT:** This process **MUST run sequentially** step by step. Do NOT batch multiple steps in one pass. Each step must be completed and confirmed by the user before proceeding to the next.

> [!NOTE]
> **Two separate usage flows:**
> - **Claude Code flow (slash command):** Agent follows the general instructions below. The agent does NOT need to read prompt.md files.
> - **Copy-Paste flow:** QA team copies the detailed prompt content from `plans/manual/01-06/prompt.md` into the AI chat, one step at a time.

### Step 1: Context & Role-Play (Context Initialization)

**Purpose:** Establish the Senior QA Engineer role and load project context.

**Agent must:**
1. Ask the user to provide:
   - Project / feature name
   - Description of the current system
   - MVP testing objectives
   - Requirements documents (Requirements, User Stories, Figma link, PDF...)
2. Read the documents carefully and confirm understanding of the context
3. Summarize the testing scope
4. **Wait for user confirmation** before proceeding to Step 2

**Output:** Confirmed understanding of context + testing scope summary.

---

### Step 2: Analysis & Q&A (Requirements Analysis)

**Purpose:** Analyze documents to identify ambiguities, missing information, and contradictions.

**Agent must:**
1. Identify the flows:
   - Happy Path (main flow)
   - Alternate Paths (branching flows)
   - Exception Paths (error/edge flows)
2. Detect Ambiguities:
   - Missing requirements (no specification for textbox length, timeout, behavior on connection loss...)
   - Contradictory requirements
   - Unclear requirements
3. List numbered Q&A questions (Q1, Q2...) for the user/PO/BA to answer; each question includes context and a fallback assumption if unanswered
4. **STOP — Wait for user responses** to the questions before continuing

**Output:** List of flows + Ambiguities + Q&A questions.

> [!IMPORTANT]
> **This is the most critical bottleneck.** If the agent skips this step and guesses at logic, test cases will be seriously wrong. The agent MUST stop and wait for user feedback.

---

### Step 3: Decomposition (System Decomposition)

**Purpose:** Break down a complex feature into small, manageable Modules / Sub-modules.

**Agent must:**
1. Decompose using one of two approaches:
   - **By UI:** Header, Data Table, Form popup, Sidebar...
   - **By flow:** Create flow, Edit flow, Delete flow...
2. Briefly describe the function of each Module
3. Identify Dependencies between Modules

**Output:** List of Modules/Sub-modules + Dependencies.

> ⏸️ **STOP — Wait for user to review and confirm the module breakdown before proceeding to Step 4.** If the user has not yet responded, re-state the pause prompt and wait. Under no circumstances advance to Step 4 without explicit user confirmation.

---

### Step 4: Traceability (Coverage Assurance)

**Purpose:** Establish a traceability matrix to ensure 100% of requirements are covered by test scenarios.

**Agent must:**
1. Map each Module/Rule to a requirement code (REQ-01, REQ-02...)
2. Cross-check for any requirements missing from the decomposition list (Gap Analysis)
3. List High-Level Test Scenarios for each Module, focusing on:
   - Security / authorization
   - UI Validation
   - Business Logic
   - Data Integrity
   - Error Handling
4. **Wait for user review** of the scenario list before generating detailed test cases

**Output:** Traceability Matrix + High-Level Test Scenarios.

> [!WARNING]
> **Human Checkpoint:** The user must review the scenario list to add domain-specific cases that AI may have missed. This is a human-led risk assessment step.

---

### Step 5: RBT & TC Generation (Detailed Test Case Generation)

**Purpose:** Generate detailed test cases following a Risk-Based Testing strategy.

**Agent must:**
1. Assess Risk Level for each Module:
   - **High Risk:** Test thoroughly, many cases (critical business logic, financial, security)
   - **Medium Risk:** Moderate testing
   - **Low Risk:** Basic testing, happy path only
2. Generate test cases with all required fields:
   - Module / Sub-module
   - Test Case Title
   - Pre-conditions
   - Test Steps (numbered)
   - Expected Results (numbered to match steps)
   - Test Data (**must be specific**, no generic placeholders)
   - Priority (Critical / High / Medium / Low)
3. Ensure diverse coverage:
   - Happy Path
   - Negative Path (boundary values, character overflow)
   - Edge Cases (timeout, connection loss...)
4. **Specialized Field-Level Validation:**
   - List **all input fields** on the form/UI being tested
   - Generate validation TCs **separately for EACH field** based on its specific characteristics
   - Reference the **Field-Level Validation Table** in Mode QUICK to select the appropriate validations
   - **DO NOT** combine validation for multiple fields into one TC
5. Apply appropriate **test case design techniques**:
   - **Equivalence Partitioning:** Divide inputs into equivalent groups, test a representative from each group
   - **Boundary Value Analysis (BVA):** Test at boundary values (min, min+1, max-1, max)
   - **Decision Table:** List condition combinations → expected outcomes (for multi-condition logic)
   - **State Transition:** Test valid and invalid state transitions (for workflows)
6. If there are too many scenarios → generate module by module, ask the user before continuing

**Output:** Detailed Test Cases list with Risk Level.

---

### Step 6: Template Mapping (Format Standardization)

**Purpose:** Package test cases into a standard Markdown table, ready to copy into Excel/Jira.

**Agent must:**
1. Standardize all test cases into a Markdown table:

```
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Test Data | Priority |
```

2. Table rules:
   - TC ID in a consistent format (e.g., `CRM_CUST_TC_001`)
   - Test Steps and Expected Results are numbered; use `<br>` for line breaks within cells
   - **ABSOLUTELY DO NOT omit** any test case generated in Step 5
   - If too long → split into Part 1, Part 2... and ask the user to continue
3. Export output as an Artifact (`test_cases_<module>.md`)

**Output:** Complete Markdown Test Cases table.

---

## Anti-Patterns (STRICTLY FORBIDDEN — applies to both modes)

- ❌ Batching multiple steps in one pass in FULL RBT (MUST be sequential)
- ❌ Guessing business logic without asking the user (Step 2 - FULL RBT)
- ❌ Skipping the Ambiguity analysis step (FULL RBT)
- ❌ Generic / placeholder test data
- ❌ Truncating or omitting test cases when mapping to the table
- ❌ Generating all test cases at once for a large system (must split by module)
- ❌ Happy Path only — missing Negative/Boundary cases (QUICK)
- ❌ Vague test steps that don't specify what data to enter
- ❌ Combining validation for multiple fields into one TC → each field must have its own validation TC
- ❌ Using one generic validation set for all fields (Email ≠ Phone ≠ Date ≠ Text)
- ❌ Skipping security validation (XSS, SQL injection) for text/textarea fields
- ❌ Not listing fields before generating validation TCs

---

## Prompt Templates

Sample prompt templates for the FULL RBT process are located at:

```
plans/manual/
├── 01_context_and_roleplay/prompt.md
├── 02_analysis_and_qna/prompt.md
├── 03_decomposition/prompt.md
├── 04_traceability/prompt.md
├── 05_rbt_and_tc_generation/prompt.md
└── 06_template_mapping/prompt.md
```

Mode QUICK does not require reading prompt templates — the agent applies EP/BVA/Decision Table techniques directly.

---

## Output Format

### Mode QUICK

| Output | Description |
|--------|-------------|
| Markdown TC Table | Complete test cases, ready to copy into Excel/Jira |

### Mode FULL RBT

| Step | Output |
|------|--------|
| 1 | Context confirmation |
| 2 | Flows + Ambiguities + Q&A questions |
| 3 | Module Decomposition + Dependencies |
| 4 | Traceability Matrix + High-Level Scenarios |
| 5 | Detailed Test Cases (Risk Level + Test Data) |
| 6 | Standard Markdown table (Jira/Excel ready) |

All output must be in **English**, formatted in **Markdown**, using **Artifacts** for long content.
