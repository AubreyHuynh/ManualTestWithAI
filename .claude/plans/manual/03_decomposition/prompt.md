# STEP 3: SYSTEM DECOMPOSITION (Decomposition)

> **How to use:**
> 1. Send this prompt AFTER all Q&A questions from Step 2 have been answered
> 2. Customize the decomposition guidance if needed
> 3. Review the output → move to Step 4

---START---

Assume that all requirements have been clarified through the Q&A process in Step 2.

Proceed to **decompose the system (Decomposition)** — break this feature down into smaller Modules / Sub-modules for easier test management.

## Required Output:

### 1. Module Decomposition (Feature Mapping)

Break the feature into specific Modules and Sub-modules.

[Decomposition scope guidance (choose one or combine):
- **By UI cluster:** Header, Sidebar, Data Table, Input Form, Popup, Dialog...
- **By task flow:** Create flow, Edit flow, Delete flow, Search flow...
- **By entity:** User Management, Product Management, Order Management...]

### 2. Functional Description

For each Module/Sub-module, provide:
- Module name (short, descriptive)
- Functional description (1-2 sentences)
- Key UI components (if applicable)

### 3. Dependency Map

Identify dependencies and data interactions between Modules:

[Examples:
- The "Data Table" module depends on data from the "Registration Form" module
- The "Customer Detail" module depends on the "Customer List" module
- The "Export Report" module depends on Filter/Search result data...]

---

Present the results in **Markdown**, using tables or a tree diagram as appropriate.

⏸️ **AFTER COMPLETING**, pause and wait for me to review the module breakdown before proceeding to Step 4.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 3 (Decomposition)