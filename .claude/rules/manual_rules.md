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
