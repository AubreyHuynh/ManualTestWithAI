# STEP 4: COVERAGE ASSURANCE (Traceability & Gap Analysis)

> **How to use:**
> 1. Send this prompt AFTER reviewing the decomposition output from Step 3
> 2. Review the list of scenarios the AI generates
> 3. Add any missing scenarios
> 4. Confirm completion → move to Step 5

---START---

Using the Module decomposition output from Step 3, build a **Requirements Traceability Matrix** to ensure comprehensive coverage.

## Tasks:

### 1. Traceability Mapping

Map each Module/Sub-module or business logic rule to a **unique requirement ID**:
- Format: `REQ-01`, `REQ-02`, `REQ-03`...
- Each requirement must include a brief description

Present as a table:
| REQ ID | Module | Requirement Description |
|--------|--------|-------------------------|

### 2. Gap Analysis

Cross-check whether any information from the original requirements document is **missing** from the decomposition:
- Functions not yet mapped
- Input conditions not listed
- Business rules that were overlooked

**If gaps are found, report them specifically.**

### 3. High-Level Test Scenarios

List test scenarios at a **High-Level** for each Module.

Each scenario needs only **one concise core description**, focusing on:

[Focus area guidance (customize per project):
- **Security / Authorization:** Who is allowed to do what?
- **UI Validation:** Required fields, data formats, character limits
- **Business Logic:** Calculation rules, state transitions
- **Data Integrity:** Is data consistent across modules?
- **Error Handling:** How does the system handle errors?]

Present as a table:
| REQ ID | Module | Scenario ID | Scenario Description |
|--------|--------|-------------|----------------------|

---

⏸️ **AFTER COMPLETING**, pause so I can review the scenario list.
I will add missing items or confirm to proceed to Step 5 for detailed test case generation.

> ⚠️ **This is a Human Checkpoint.** The tester must perform their own Risk Assessment for each Module before allowing the AI to generate detailed scenarios.