# STEP 5: DETAILED TEST CASE GENERATION (RBT & TC Generation)

> **How to use:**
> 1. Send this prompt AFTER reviewing and confirming scenarios in Step 4
> 2. Customize the `[guidance]` sections to focus on specific modules if needed
> 3. If there are many modules → ask the AI to generate one module at a time
> 4. Review test cases → move to Step 6

---START---

Applying a **Risk-Based Testing (RBT)** strategy, generate a detailed list of Test Cases from the High-Level Scenarios reviewed in Step 4.

## Requirements for Each Test Case:

### 1. Risk Assessment

Assess the **Risk Level** for each Module/Feature:
- **High Risk:** Core business logic, involves money/security, many users depend on it → Generate more test cases, test thoroughly
- **Medium Risk:** Important but not critical feature → Moderate coverage
- **Low Risk:** Minor feature, low impact → Basic coverage, happy path only

### 2. Test Case Structure

Each Test Case must include:

| Field | Requirement |
|-------|-------------|
| **Module / Sub-module** | Module name from the decomposition in Step 3 |
| **Test Case Title** | Short, purpose-clear title |
| **Pre-conditions** | Prerequisites before executing the test |
| **Test Steps** | Numbered execution steps |
| **Expected Results** | Numbered expected results matching each step |
| **Test Data** | Specific data values (see rules below) |
| **Priority** | High / Medium / Low |
| **Risk Level** | High / Medium / Low |

### 3. Test Data Rules

Test Data **MUST BE SPECIFIC** — generic descriptions are not acceptable:

```
❌ WRONG: "Enter a valid email"
✅ CORRECT: "Enter email: test_customer_01@domain.com"

❌ WRONG: "Enter a valid ID"
✅ CORRECT: "Enter ID: KH-2026-0012"

❌ WRONG: "Enter an invalid phone number format"
✅ CORRECT: "Enter phone: abc123xyz (letters instead of digits)"

❌ WRONG: "Enter a name that is too long"
✅ CORRECT: "Enter name: [string of 256 consecutive 'A' characters] (exceeds 255-character limit)"
```

### 4. Coverage Scope

Ensure Test Cases cover a variety of scenarios:
- **Happy Path:** Main flow running smoothly end-to-end
- **Negative Path:** Invalid input, missing data, wrong format
- **Boundary Values:** Edge values (min, max, min-1, max+1)
- **Edge Cases:** Timeout, lost connection, concurrent access

[Additional guidance (customize per project):
- Authorization: What can User Role A do, and what are they not allowed to do?
- Compatibility: Responsive design, multi-browser
- Performance: Handling large datasets (1000+ records)
- ...]

### 5. Field-Level Validation

**MANDATORY:** When a form/UI has input fields, you must:
1. **List all input fields** on the form/UI under test
2. **Generate separate validation TCs for EACH field** based on that field's specific characteristics
3. **Do NOT combine** validation for multiple fields into a single test case

Apply the following validation checklist by field type:

| Field Type | Validations to Test |
|---|---|
| **Text (Name, Address...)** | Required/Optional · Min length · Max length · Whitespace-only · Special characters (`<>&"'`) · XSS (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Valid format · Missing `@` · Missing domain · Invalid domain · Multiple `@` · Special characters · Max length · Case sensitivity · Duplicate email (if unique) |
| **Phone** | Digits only · Valid prefix (`+1`, `0`) · Min/Max length · Mixed letters · Dashes, dots, spaces · Invalid area code |
| **Date / DateTime** | Correct format · Non-existent date (`02/31`) · Leap year (`02/29/2024`) · Past/future dates · Min/Max date · Timezone |
| **Number / Currency** | Min/Max value · Negative number · Zero · Decimal · Non-numeric characters · Overflow · Leading zeros · Currency format |
| **Dropdown / Select** | Default value · All options · Disabled option · Required (nothing selected) |
| **Checkbox / Radio** | Default state · Check/Uncheck · Required · Radio group (only one selectable) |
| **File Upload** | Valid/invalid file type · Max size · Empty file (0 KB) · Special characters in filename · Multiple files |
| **Password** | Min/Max length · Special characters · Upper/lowercase · Numbers · Copy-paste · Show/hide toggle · Confirm password |
| **Textarea** | Max length · Line breaks · HTML tags · Character counter |

**Example Field-Level Validation for a "Registration" form:**
```
Form has 4 fields: Full Name, Email, Phone, Password

→ Field "Full Name" (Text, max 100 chars, required):
  - TC: Leave blank → Required error shown
  - TC: Enter 1 character → Valid (or min length error)
  - TC: Enter 100 characters → Valid (at max)
  - TC: Enter 101 characters → Max length error shown
  - TC: Enter whitespace only → Error shown
  - TC: Enter <script>alert(1)</script> → Script not executed

→ Field "Email" (Email, required, unique):
  - TC: Enter test@domain.com → Valid
  - TC: Enter testdomain.com (missing @) → Format error shown
  - TC: Enter test@.com (missing domain) → Error shown
  - TC: Enter an already-registered email → Duplicate error shown

→ Field "Phone" (10 digits, must start with 0):
  - TC: Enter 0912345678 → Valid
  - TC: Enter 912345678 (missing leading 0) → Error shown
  - TC: Enter 091234567 (9 digits) → Min length error shown
  - TC: Enter abc1234567 → Digits-only error shown

→ Field "Password" (8-20 chars, requires uppercase + number):
  - TC: Enter Abcdef12 (8 chars, uppercase + number) → Valid
  - TC: Enter abcdefgh (lowercase only) → Error shown
  - TC: Enter 1234567 (7 chars) → Min length error shown
```

> Identify each field's characteristics (type, required, min/max, format, unique...) from the requirements before generating TCs.

### 6. Test Design Techniques

Apply the following classical techniques to generate test cases systematically:

**a) Equivalence Partitioning**
Divide input data into equivalent groups — only one representative value per group needs to be tested.
```
Example: "Age" field (valid range: 18-60):
- Valid partition: 25 (representative of 18-60)
- Invalid lower partition: 10 (representative of <18)
- Invalid upper partition: 70 (representative of >60)
```

**b) Boundary Value Analysis (BVA)**
Test values at the boundaries: min, min+1, max-1, max, min-1, max+1.
```
Example: "Password" field (6-20 characters):
- 5 characters (lower boundary -1) → Error
- 6 characters (lower boundary)    → Valid
- 7 characters (lower boundary +1) → Valid
- 19 characters (upper boundary -1) → Valid
- 20 characters (upper boundary)    → Valid
- 21 characters (upper boundary +1) → Error
```

**c) Decision Table**
Use when logic has multiple combined conditions (AND/OR). List condition combinations and their outcomes.
```
Example: "Login" feature:
| Valid Email | Correct Password | Account Active | Result              |
|:-----------:|:----------------:|:--------------:|---------------------|
| ✅          | ✅               | ✅             | Login successful    |
| ✅          | ❌               | ✅             | Wrong password      |
| ❌          | ✅               | ✅             | Email not found     |
| ✅          | ✅               | ❌             | Account locked      |
```

**d) State Transition**
Use for objects with multiple state transitions (workflow, order status, etc.).
```
Example: Order status:
Created → Processing → Shipping → Completed
                     → Cancelled
Test: Each valid transition + invalid transitions (e.g., Completed → Created)
```

> Choose the appropriate technique for each Module/Field based on its data characteristics and business logic.

---

> 💡 **Note:** If there are more than **3 modules**, generate Test Cases **one Module at a time** and ask before continuing to the next module.
> Example: "I will generate TCs for Module 1 now. Please confirm to continue with Module 2."

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 5 (RBT & TC Generation)
