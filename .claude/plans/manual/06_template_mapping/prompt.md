# ============================================================
# STEP 6: FORMAT STANDARDIZATION (Template Mapping)
# ============================================================
# HOW TO USE:
# 1. Send this prompt AFTER reviewing Test Cases in Step 5
# 2. Customize the TC ID naming rule if needed
# 3. Copy the output table → paste into Excel/Jira/TestRail
# ============================================================

---START---

This is the final step. **Standardize the format** of all Test Cases generated in Step 5 into a standard Markdown table, ready to copy/paste into Excel or import into Jira/Zephyr/Xray/TestRail.

## The table must include the following columns:

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |

## Table Rules:

### TC ID
- Consistent format: `[PROJECT]_[MODULE]_TC_[NUMBER]`
- Example: `CRM_CUST_TC_001`, `CRM_CUST_TC_002`...
- Increment sequentially — no gaps in numbering

[Customization: If you want a different ID format, replace the format above.
Example: `TC_LOGIN_001`, `TC_REG_001`...]

### Test Steps & Expected Result
- **MUST be numbered** when there are multiple steps
- Use `<br>` or `-` list items for line breaks within a Markdown cell
- Example cell content:
  ```
  1. Open the Login page<br>2. Enter email: test@mail.com<br>3. Enter password: Test@123<br>4. Click the "Login" button
  ```

### Absolute Rules:
- ❌ **DO NOT** omit or abbreviate any Test Case generated in Step 5
- ❌ **DO NOT** arbitrarily merge or combine different Test Cases
- ✅ If the table is too long → Split into **Part 1, Part 2, Part 3...** and ask me before continuing

---

## Output

Export the result as an **Artifact** (`.md` file) so I can:
- Copy the table directly into Excel/Google Sheets
- Import into Jira/TestRail/Xray

If the total number of Test Cases exceeds 30, split the artifact into multiple parts and ask me "Continue with Part X?" before generating the next part.